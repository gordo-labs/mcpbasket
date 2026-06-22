#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createBasketRuntime } from "./runtime/index.js";
import { createMcpBasketServer } from "./transports/mcp/index.js";

// Load .env from repo root regardless of CWD.
// build/index.js → build/ → packages/mcp-basket/ → packages/ → repo root
const mcpDir = dirname(pathToFileURL(import.meta.url).pathname);
const projectRoot = resolve(mcpDir, "..", "..", "..");
dotenv.config({ path: resolve(projectRoot, ".env"), override: true });

async function main() {
  const server = createMcpBasketServer(createBasketRuntime());
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
