import assert from "node:assert/strict";
import test from "node:test";
import { getBasketLinks, resolveBasketRuntimeConfig } from "../build/infrastructure/config.js";

test("viewer URL can differ from the interface used by the local server", () => {
  const config = resolveBasketRuntimeConfig({
    MCPBASKET_PORT: "4377",
    MCPBASKET_BIND_HOST: "100.113.42.7",
    MCPBASKET_VIEWER_URL: "http://sergios-mac-studio.tailc3a82a.ts.net:4377",
    MCPBASKET_REFINEMENT_HERMES_COMMAND: "/usr/local/bin/hermes",
  });

  assert.equal(config.viewer.host, "100.113.42.7");
  assert.equal(config.viewer.url, "http://sergios-mac-studio.tailc3a82a.ts.net:4377");
  assert.equal(config.refinement.hermesCommand, "/usr/local/bin/hermes");
  assert.equal(
    getBasketLinks(config).api.basket,
    "http://sergios-mac-studio.tailc3a82a.ts.net:4377/api/basket",
  );
});

test("configured basket stores must use an absolute path", () => {
  assert.throws(
    () => resolveBasketRuntimeConfig({ MCPBASKET_STORE_PATH: "$HOME/.local/share/mcpbasket/basket.json" }),
    /MCPBASKET_STORE_PATH must be an absolute path/,
  );
});
