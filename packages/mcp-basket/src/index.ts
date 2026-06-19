#!/usr/bin/env node

import dotenv from "dotenv";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createBasketRuntime } from "./runtime/index.js";
import { createMcpBasketServer } from "./transports/mcp/index.js";

dotenv.config();

async function main() {
  const server = createMcpBasketServer(createBasketRuntime());
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
