# MCPBasket Demo Web

Next.js + Tailwind hosted viewer for basket data exposed by the local MCP viewer/API.

Default data source:

```text
http://localhost:4377/api/basket
```

Hosted usage:

```text
https://mcpbasket.gordo.design?source=http://localhost:4377/api/basket
```

## Development

From the repository root:

```bash
npm run dev:web
```

Build:

```bash
npm run build:web
```

## Vercel

Set the Vercel project root directory to:

```text
apps/demo-web
```

Recommended production domain:

```text
mcpbasket.gordo.design
```
