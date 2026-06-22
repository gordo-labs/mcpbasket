#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import { createBasketRuntime } from "./runtime/index.js";
import { startBasketViewer } from "./transports/http/index.js";

export { startBasketViewer } from "./transports/http/index.js";

// Load .env from repo root regardless of CWD.
// build/viewer.js → build/ → packages/mcp-basket/ → packages/ → repo root
const viewerDir = dirname(pathToFileURL(import.meta.url).pathname);
const projectRoot = resolve(viewerDir, "..", "..", "..");
dotenv.config({ path: resolve(projectRoot, ".env"), override: true });

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
