# MCPBasket MCP

Model Context Protocol server for a neutral pre-checkout basket.

The basket lets an agent collect product candidates while researching online stores, show those candidates in a local or hosted viewer, and only later export approved items into generic checkout line items.

## What It Includes

- MCP tools to set basket context, add products, review candidates, update status, remove items, and export checkout line items.
- Local JSON persistence under `.mcpbasket/basket.json` by default.
- Local HTTP API and built-in viewer on `http://localhost:4377`.
- Optional hosted viewer URL support via `MCPBASKET_HOSTED_VIEWER_URL`.
- Generic `lineItems` export for a separate checkout integration.

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
        "MCPBASKET_PORT": "4377",
        "MCPBASKET_HOSTED_VIEWER_URL": "https://mcpbasket.gordo.design"
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
MCPBASKET_PUBLIC_HOST=http://localhost:4377
MCPBASKET_HOSTED_VIEWER_URL=https://mcpbasket.gordo.design
```

`basket-export-checkout-line-items` does not place an order. Use its output with a separately installed checkout integration after the user approves the exact purchase.
