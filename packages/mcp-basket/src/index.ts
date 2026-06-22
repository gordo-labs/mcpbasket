#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createBasketRuntime } from "./runtime/index.js";
import { createMcpBasketServer } from "./transports/mcp/index.js";

// Load .env from repo root (walk up from script location).
// build/index.js → packages/mcp-basket → repo root
const scriptDir = dirname(resolve(process.argv[1] || ""));
const repoRoot = resolve(scriptDir, "..", "..", "..");
dotenv.config({ path: resolve(repoRoot, ".env"), override: true });

async function main() {
  const server = createMcpBasketServer(createBasketRuntime());
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
