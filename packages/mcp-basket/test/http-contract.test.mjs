import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createBasketRuntime } from "../build/runtime/index.js";
import { createBasketViewerServer } from "../build/transports/http/index.js";
import { withTemporaryStore } from "./helpers.mjs";

test("viewer HTTP API validates input, persists a candidate, and supports PNA preflight", async () => {
  await withTemporaryStore(async (storePath) => {
    const runtime = createBasketRuntime({
      environment: {
        MCPBASKET_PORT: "4377",
        MCPBASKET_STORE_PATH: storePath,
        MCPBASKET_HOSTED_VIEWER_URL: "https://viewer.example.test",
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
          },
        }),
      });

      assert.equal(createResponse.status, 201);
      assert.equal(createResponse.headers.get("access-control-allow-origin"), "*");

      const basketResponse = await fetch(`${baseUrl}/api/basket`);
      const basket = await basketResponse.json();
      assert.equal(basket.itemCount, 1);
      assert.deepEqual(basket.totalsByCurrency, { EUR: 24 });

      const preflight = await fetch(`${baseUrl}/api/basket`, {
        method: "OPTIONS",
        headers: {
          Origin: "https://viewer.example.test",
          "Access-Control-Request-Method": "GET",
          "Access-Control-Request-Private-Network": "true",
        },
      });
      assert.equal(preflight.status, 204);
      assert.equal(preflight.headers.get("access-control-allow-private-network"), "true");
    } finally {
      server.close();
      await once(server, "close");
    }
  });
});
