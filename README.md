# MCPBasket

MCPBasket is a local-first pre-purchase workspace for agents. It gives an agent a neutral basket in which to collect, compare, review, and prepare product candidates before a human-approved checkout handled by another integration.

It never creates an order.

## Packages

| Path | Responsibility |
| --- | --- |
| `packages/mcp-basket` | Domain model, application service, MCP adapter, local HTTP API, JSON store, and local viewer. |
| `skills/mcpbasket` | Agent workflow for researching and recording product candidates. |
| `apps/demo-web` | Stateless Next.js viewer that reads any compatible basket API. |

## System Design

The basket state remains on the machine running the agent. The local MCP process and local viewer/API use the same application service and persistent store. The hosted web app only renders data from a supplied `source` URL.

```text
Agent + skill -> MCP adapter -> BasketService -> JSON repository
                                      ^                |
                                      |                v
Hosted viewer <- local HTTP adapter <- shared basket state
```

The core is deliberately independent from transport and merchant-specific checkout. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for boundaries and extension points.

## Quick Start

```bash
git clone https://github.com/gordo-labs/mcpbasket.git
cd mcpbasket
npm install
npm run verify
```

Start the local viewer/API:

```bash
npm run viewer
```

Run the MCP server:

```bash
npm run mcp
```

The default local API is `http://localhost:4377/api/basket`. The hosted viewer can read it with:

```text
https://mcpbasket.gordo.design?source=http://localhost:4377/api/basket
```

## Integrations

- [MCP server package](packages/mcp-basket/README.md)
- [Hermes installation](docs/HERMES.md)
- [HTTP API contract](docs/HTTP-API.md)
- [Agent skill](skills/mcpbasket/SKILL.md)
- [Contributing](CONTRIBUTING.md)

## Quality Gates

```bash
npm run build
npm run lint
npm run test
npm run verify
```
