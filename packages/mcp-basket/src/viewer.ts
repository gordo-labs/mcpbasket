#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { createBasketRuntime } from "./runtime/index.js";
import { startBasketViewer } from "./transports/http/index.js";

export { startBasketViewer } from "./transports/http/index.js";

// Load .env from repo root (walk up from script location).
// build/viewer.js → packages/mcp-basket → repo root
const scriptDir = dirname(resolve(process.argv[1] || ""));
const repoRoot = resolve(scriptDir, "..", "..", "..");
dotenv.config({ path: resolve(repoRoot, ".env"), override: true });

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
