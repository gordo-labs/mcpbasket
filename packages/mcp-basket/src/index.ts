#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createBasketRuntime } from "./runtime/index.js";
import { createMcpBasketServer } from "./transports/mcp/index.js";

// Load .env only when MCPBASKET_STORE_PATH is not already set (agent provides it via MCP config).
if (!process.env.MCPBASKET_STORE_PATH) {
  // Walk up from the script location to find repo root and its .env.
  const scriptDir = dirname(resolve(process.argv[1] || ""));
  const repoRoot = resolve(scriptDir, "..", "..", "..");
  dotenv.config({ path: resolve(repoRoot, ".env") });
}

async function main() {
  const server = createMcpBasketServer(createBasketRuntime());
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
