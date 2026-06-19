# MCPBasket

MCPBasket is a local-first pre-purchase workspace for agents. It records each research response as a durable product list, lets a user selectively add products to one persistent Main basket across searches, and prepares candidates before a human-approved checkout handled by another integration.

It never creates an order.

## Packages

| Path | Responsibility |
| --- | --- |
| `packages/mcp-basket` | Domain model, application service, MCP adapter, local HTTP API, JSON store, and local viewer. |
| `skills/mcpbasket` | Agent workflow for researching and recording product candidates. |

## System Design

The basket state remains on the machine running the agent. The local MCP process and local viewer/API use the same application service and persistent store.

```text
Agent + skill -> MCP adapter -> BasketService -> JSON repository
                                      ^                |
                                      |                v
                              Local viewer/API <- shared basket state
```

The core is deliberately independent from transport and merchant-specific checkout. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for boundaries and extension points. A public service for mobile viewing and trusted purchase authorization is designed but not implemented; its proposed shape is in [`docs/REMOTE-SERVICE.md`](docs/REMOTE-SERVICE.md).

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

The local viewer command prints the loopback URL for the machine running the agent. It is the MVP inspection surface; it is not a public sharing mechanism.

The research workspace is available at `/`. The persistent Main basket is available at `/basket`: it keeps selected products across every saved search and presents a Crossmint checkout placeholder. It does not create an order or transmit payment details.

## Integrations

- [MCP server package](packages/mcp-basket/README.md)
- [Hermes installation](docs/HERMES.md)
- [HTTP API contract](docs/HTTP-API.md)
- [Planned remote service](docs/REMOTE-SERVICE.md)
- [Agent skill](skills/mcpbasket/SKILL.md)
- [Contributing](CONTRIBUTING.md)

## Quality Gates

```bash
npm run build
npm run lint
npm run test
npm run verify
```
