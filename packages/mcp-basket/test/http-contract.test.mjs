import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createBasketRuntime } from "../build/runtime/index.js";
import { createBasketViewerServer } from "../build/transports/http/index.js";
import { withTemporaryStore } from "./helpers.mjs";

test("viewer HTTP API validates input and persists a candidate", async () => {
  await withTemporaryStore(async (storePath) => {
    const runtime = createBasketRuntime({
      environment: {
        MCPBASKET_PORT: "4377",
        MCPBASKET_STORE_PATH: storePath,
      },
    });
    const server = await createBasketViewerServer(runtime);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    try {
      const researchPageResponse = await fetch(baseUrl);
      assert.equal(researchPageResponse.status, 200);
      const researchPage = await researchPageResponse.text();
      assert.match(researchPage, /data-initial-view="research"/);
      assert.match(researchPage, /id="source-modal-frame"/);
      assert.match(researchPage, /data-source-modal="true"/);

      const mainBasketPageResponse = await fetch(`${baseUrl}/basket`);
      assert.equal(mainBasketPageResponse.status, 200);
      const mainBasketPage = await mainBasketPageResponse.text();
      assert.match(mainBasketPage, /data-initial-view="main-basket"/);
      assert.match(mainBasketPage, /id="research-view"[^>]*hidden/);
      assert.match(mainBasketPage, /id="searches-view"[^>]*hidden/);
      assert.match(mainBasketPage, /id="main-basket-view" aria-labelledby/);

      const sourcePageResponse = await fetch(`${baseUrl}/source?url=https%3A%2F%2Fexample.com%2Fproduct&title=Example%20product`);
      assert.equal(sourcePageResponse.status, 200);
      const sourcePage = await sourcePageResponse.text();
      assert.match(sourcePage, /data-initial-view="source-page"/);
      assert.ok(sourcePage.includes('data-initial-source-url="https://example.com/product"'));
      assert.match(sourcePage, /data-initial-source-title="Example product"/);
      assert.match(sourcePage, /id="source-page-view" aria-labelledby/);

      const searchesPageResponse = await fetch(`${baseUrl}/searches`);
      assert.equal(searchesPageResponse.status, 200);
      const searchesPage = await searchesPageResponse.text();
      assert.match(searchesPage, /data-initial-view="searches"/);
      assert.match(searchesPage, /id="search-page-items"/);
      assert.match(searchesPage, /id="product-modal"/);

      const contextResponse = await fetch(`${baseUrl}/api/context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Travel mug research",
          intent: "Find a durable travel mug",
          startNewSearch: true,
        }),
      });
      assert.equal(contextResponse.status, 200);

      const createResponse = await fetch(`${baseUrl}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            title: "Travel mug",
            price: { current: { amount: 24, currency: "EUR" } },
            urls: {
              product: "https://example.com/products/travel-mug",
              image: "https://example.com/images/travel-mug.jpg",
            },
          },
        }),
      });

      assert.equal(createResponse.status, 201);

      const basketResponse = await fetch(`${baseUrl}/api/basket`);
      const basket = await basketResponse.json();
      assert.equal(basket.itemCount, 1);
      assert.deepEqual(basket.totalsByCurrency, { EUR: 24 });
      assert.equal(basket.items[0].url, "https://example.com/products/travel-mug");
      assert.equal(basket.items[0].image, "https://example.com/images/travel-mug.jpg");

      const rawBasketResponse = await fetch(`${baseUrl}/api/basket/raw`);
      const rawBasket = await rawBasketResponse.json();
      assert.equal(rawBasket.items[0].product.identifiers.sourceUrl, "https://example.com/products/travel-mug");
      assert.equal(rawBasket.items[0].product.images[0].url, "https://example.com/images/travel-mug.jpg");

      const refinementResponse = await fetch(`${baseUrl}/api/searches/${rawBasket.activeSearchId}/refinements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Only consider leakproof options under 30 EUR." }),
      });
      assert.equal(refinementResponse.status, 202);
      const refinement = await refinementResponse.json();
      assert.equal(refinement.dispatched, false);
      assert.equal(refinement.refinement.status, "queued");
      assert.equal(refinement.refinement.searchSnapshot.id, rawBasket.activeSearchId);
      assert.equal(refinement.refinement.searchSnapshot.items[0].product.title, "Travel mug");

      const missingConfirmation = await fetch(`${baseUrl}/api/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: rawBasket.items[0].id }),
      });
      assert.equal(missingConfirmation.status, 400);

      const decisionResponse = await fetch(`${baseUrl}/api/decisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: rawBasket.items[0].id, confirm: true }),
      });
      assert.equal(decisionResponse.status, 201);
      const decisions = await decisionResponse.json();
      assert.equal(decisions.decisions.itemCount, 1);
      assert.equal(decisions.decision.item.product.title, "Travel mug");

      const listDecisionsResponse = await fetch(`${baseUrl}/api/decisions`);
      assert.equal(listDecisionsResponse.status, 200);
      assert.equal((await listDecisionsResponse.json()).itemCount, 1);

      const removeDecisionResponse = await fetch(`${baseUrl}/api/decisions/${decisions.decision.id}`, {
        method: "DELETE",
      });
      assert.equal(removeDecisionResponse.status, 200);
      assert.equal((await removeDecisionResponse.json()).removed, true);

      const invalidJson = await fetch(`${baseUrl}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: "not-json",
      });
      assert.equal(invalidJson.status, 400);
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
