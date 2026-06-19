#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { createBasketRuntime } from "./runtime/index.js";
import { startBasketViewer } from "./transports/http/index.js";

export { startBasketViewer } from "./transports/http/index.js";

dotenv.config();

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
