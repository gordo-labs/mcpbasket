#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { createBasketRuntime } from "./runtime/index.js";
import { startBasketViewer } from "./transports/http/index.js";

export { startBasketViewer } from "./transports/http/index.js";

// Load .env only when MCPBASKET_STORE_PATH is not already set (agent provides it via MCP config).
if (!process.env.MCPBASKET_STORE_PATH) {
  // Walk up from the script location to find repo root and its .env.
  const scriptDir = dirname(resolve(process.argv[1] || ""));
  const repoRoot = resolve(scriptDir, "..", "..", "..");
  dotenv.config({ path: resolve(repoRoot, ".env") });
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const runtime = createBasketRuntime();
  startBasketViewer({ runtime })
    .then(() => {
      console.error(`MCPBasket viewer: ${runtime.links.viewerUrl}`);
      console.error(`Basket store: ${runtime.service.path()}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
