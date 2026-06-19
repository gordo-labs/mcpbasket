# MCPBasket MCP

Model Context Protocol server for a neutral pre-checkout basket.

The basket lets an agent collect product candidates while researching online stores, preserve each search as a local snapshot, collect final decisions across searches, show them in a local viewer, and only later export approved items into generic checkout line items.

## Architecture

The package is intentionally local-first. The domain and application layers have no knowledge of MCP, HTTP, Node processes, or a merchant integration. MCP and HTTP are adapters over the same `BasketService`; a file repository persists state with an atomic replace and a cross-process lock.

See [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md) and [`docs/HTTP-API.md`](../../docs/HTTP-API.md) for the contract.

## What It Includes

- MCP tools to set basket context, add products, review candidates, save explicit final decisions, remove items, and export checkout line items.
- Local JSON persistence under `.mcpbasket/basket.json` by default.
- Local HTTP API and built-in viewer for the machine running the agent.
- Generic `lineItems` export for a separate checkout integration.
- Loopback-only listener by default; remote access is deliberately outside this package.

## Install

From the repository root:

```bash
npm install
npm run build:mcp
```

Run the local basket viewer/API:

```bash
npm run viewer
```

Run the MCP server directly:

```bash
npm run mcp
```

## MCP Config

Use the built entrypoint:

```json
{
  "mcpServers": {
    "mcpbasket": {
      "command": "node",
      "args": ["/absolute/path/to/mcpbasket/packages/mcp-basket/build/index.js"],
      "env": {
        "MCPBASKET_PORT": "4377"
      }
    }
  }
}
```

## Local API

```text
GET    /health
GET    /api/model
GET    /api/basket
GET    /api/basket/raw
POST   /api/context
POST   /api/items
POST   /api/items/:id/status
DELETE /api/items/:id
GET    /api/decisions
POST   /api/decisions
DELETE /api/decisions/:id
POST   /api/clear
```

Minimal product candidate:

```json
{
  "product": {
    "title": "Example product",
    "merchant": {
      "name": "Example Store",
      "domain": "example.com",
      "platform": "shopify"
    },
    "identifiers": {
      "sourceUrl": "https://example.com/products/example",
      "productLocator": "shopify:https://example.com/products/example:123456"
    },
    "price": {
      "current": {
        "amount": 29.99,
        "currency": "USD",
        "confidence": "exact"
      }
    },
    "evidence": {
      "reason": "Matches the user request",
      "confidence": "medium"
    }
  },
  "quantity": 1,
  "status": "candidate"
}
```

## Environment

```bash
MCPBASKET_PORT=4377
MCPBASKET_STORE_PATH=.mcpbasket/basket.json
MCPBASKET_BIND_HOST=127.0.0.1
```

`basket-export-checkout-line-items` does not place an order. Use its output with a separately installed checkout integration after the user approves the exact purchase.

This package does not provide remote storage, public basket URLs, mobile access, authentication, or payments. Those responsibilities belong to the planned remote service described in [`../../docs/REMOTE-SERVICE.md`](../../docs/REMOTE-SERVICE.md).
