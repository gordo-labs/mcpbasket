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
