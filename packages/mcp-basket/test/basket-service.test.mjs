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
