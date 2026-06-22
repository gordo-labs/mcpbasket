import assert from "node:assert/strict";
import test from "node:test";
import { BasketService } from "../build/application/index.js";
import { FileBasketRepository } from "../build/infrastructure/index.js";
import { withTemporaryStore } from "./helpers.mjs";

test("BasketService persists candidates and exports only approved, located items", async () => {
  await withTemporaryStore(async (storePath) => {
    let tick = 0;
    const clock = () => `2026-06-19T00:00:0${tick++}.000Z`;
    const service = new BasketService(new FileBasketRepository(storePath), {
      clock,
      idGenerator: () => "keyboard-1",
    });

    await service.setContext({
      title: "Desk refresh",
      intent: "Find a quiet keyboard",
      currency: "EUR",
    });

    const created = await service.upsertItem({
      quantity: 2,
      product: {
        title: "Quiet keyboard",
        merchant: { name: "Example Store" },
        price: { current: { amount: 99.5, currency: "EUR" } },
        identifiers: { productLocator: "store:quiet-keyboard" },
      },
    });

    assert.equal(created.created, true);
    assert.equal(created.item.id, "keyboard-1");
    assert.equal((await service.updateStatus("keyboard-1", "approved"))?.status, "approved");

    const exported = await service.exportCheckoutLineItems();
    assert.deepEqual(exported.lineItems, [{ locator: "store:quiet-keyboard", quantity: 2 }]);
    assert.deepEqual(exported.missing, []);

    const restartedService = new BasketService(new FileBasketRepository(storePath));
    const restored = await restartedService.load();
    assert.equal(restored.context.title, "Desk refresh");
    assert.equal(restored.items.length, 1);
    assert.equal(restored.items[0].status, "approved");
  });
});

test("BasketService retains final decisions and search history across new research contexts", async () => {
  await withTemporaryStore(async (storePath) => {
    let tick = 0;
    const ids = ["search-one", "product-one", "search-two", "product-two", "decision-one", "decision-two"];
    const service = new BasketService(new FileBasketRepository(storePath), {
      clock: () => `2026-06-19T01:00:0${tick++}.000Z`,
      idGenerator: () => ids.shift() || "fallback-id",
    });

    await service.setContext({ title: "Desk setup", intent: "Find a quiet keyboard", currency: "EUR" });
    const keyboard = await service.upsertItem({ product: { title: "Quiet keyboard" } });

    await service.clear();
    await service.setContext({ title: "Travel setup", intent: "Find a carry-on bag", currency: "EUR" });
    const carryOn = await service.upsertItem({ product: { title: "Carry-on bag" } });
    const historicalDecision = await service.addToDecisionBasket(keyboard.item.id, "search-one");
    const activeDecision = await service.addToDecisionBasket(carryOn.item.id);
    assert.equal(historicalDecision?.created, true);
    assert.equal(activeDecision?.created, true);
    assert.equal(historicalDecision?.item.item.status, "approved");

    const restartedService = new BasketService(new FileBasketRepository(storePath));
    const restored = await restartedService.load();

    assert.equal(restored.decisionBasket.items.length, 2);
    assert.equal(restored.decisionBasket.items[0].sourceItemId, keyboard.item.id);
    assert.equal(restored.decisionBasket.items[0].sourceSearchId, "search-one");
    assert.equal(restored.decisionBasket.items[1].sourceItemId, carryOn.item.id);
    assert.equal(restored.decisionBasket.items[1].sourceSearchId, "search-two");
    assert.equal(restored.decisionBasket.searches.length, 2);
    assert.equal(restored.decisionBasket.searches[0].context.title, "Desk setup");
    assert.equal(restored.decisionBasket.searches[0].items[0].status, "approved");
    assert.equal(restored.decisionBasket.searches[1].context.title, "Travel setup");
    assert.equal(restored.decisionBasket.searches[1].items[0].status, "approved");
  });
});

test("BasketService records a distinct historical list when research explicitly starts again", async () => {
  await withTemporaryStore(async (storePath) => {
    let tick = 0;
    const ids = ["search-one", "product-one", "search-two", "product-two"];
    const service = new BasketService(new FileBasketRepository(storePath), {
      clock: () => `2026-06-19T02:00:0${tick++}.000Z`,
      idGenerator: () => ids.shift() || "fallback-id",
    });

    await service.setContext({
      title: "Studio speakers",
      intent: "Find compact monitors for a desk",
      currency: "EUR",
      startNewSearch: true,
    });
    await service.upsertItem({ product: { title: "First speaker" } });

    await service.setContext({
      title: "Studio speakers",
      intent: "Find compact monitors for a desk",
      currency: "EUR",
      startNewSearch: true,
    });
    await service.upsertItem({ product: { title: "Second speaker" } });

    const restored = await service.load();
    assert.equal(restored.decisionBasket.searches.length, 2);
    assert.deepEqual(
      restored.decisionBasket.searches.map((search) => search.items.map((item) => item.product.title)),
      [["First speaker"], ["Second speaker"]],
    );
  });
});

test("BasketService keeps an immutable source snapshot for a linked refinement search", async () => {
  await withTemporaryStore(async (storePath) => {
    let tick = 0;
    const ids = ["search-one", "product-one", "refinement-one", "search-two", "product-two"];
    const service = new BasketService(new FileBasketRepository(storePath), {
      clock: () => `2026-06-19T03:00:0${tick++}.000Z`,
      idGenerator: () => ids.shift() || "fallback-id",
    });

    await service.setContext({
      title: "Studio speakers",
      intent: "Find compact desktop speakers",
      currency: "EUR",
      startNewSearch: true,
    });
    await service.upsertItem({ product: { title: "Original speaker" } });

    const requested = await service.requestSearchRefinement(
      "search-one",
      "Prioritize wired inputs and a lower price.",
    );
    assert.equal(requested?.request.id, "refinement-one");
    assert.equal(requested?.request.searchSnapshot.items[0].product.title, "Original speaker");

    await service.setContext({
      title: "Studio speakers with wired input",
      intent: "Find compact desktop speakers with wired inputs at a lower price",
      currency: "EUR",
      startNewSearch: true,
      refinementOfSearchId: "search-one",
      refinementRequestId: "refinement-one",
    });
    await service.upsertItem({ product: { title: "Refined speaker" } });

    const inProgress = await service.getSearchRefinementRequest("refinement-one");
    assert.equal(inProgress?.request.status, "in_progress");
    assert.equal(inProgress?.request.refinedSearchId, "search-two");
    assert.equal(inProgress?.request.searchSnapshot.items[0].product.title, "Original speaker");

    await service.completeSearchRefinementRequest("refinement-one", "Recorded one lower-cost wired option.", "search-two");
    const restored = await new BasketService(new FileBasketRepository(storePath)).load();
    const completed = restored.decisionBasket.refinementRequests[0];

    assert.equal(completed.status, "completed");
    assert.equal(completed.refinedSearchId, "search-two");
    assert.equal(completed.searchSnapshot.items[0].product.title, "Original speaker");
    assert.equal(restored.decisionBasket.searches[1].refinementOfSearchId, "search-one");
    assert.equal(restored.decisionBasket.searches[1].items[0].product.title, "Refined speaker");
  });
});
