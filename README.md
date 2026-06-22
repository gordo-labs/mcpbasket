# MCPBasket

MCPBasket is a local-first pre-purchase workspace for agents. It records each research response as a durable product list, lets a user selectively add products to one persistent Main basket across searches, and prepares candidates before a human-approved checkout handled by another integration.

It never creates an order.

## What An Agent Gets

- One saved search per research response, including its creation time and complete candidate snapshot.
- A search-specific refinement input that preserves the original snapshot and creates a linked new research response.
- A verified product source and optional product image when the agent can observe them.
- A persistent Main basket that can collect selected products from any saved search.
- A local viewer with Research (`/`), saved Searches (`/searches`), Main basket (`/basket`), and verified-source viewing.
- A checkout placeholder only. Crossmint or any other checkout provider must be connected separately.

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

## Install For An Agent

### 1. Install the package

```bash
git clone https://github.com/gordo-labs/mcpbasket.git
cd mcpbasket
npm install
npm run verify
```

Use Node.js 20 or newer. Keep the repository in a stable location: the MCP configuration below uses an absolute build path.

### 2. Choose one persistent local store

The viewer and the MCP server must use **the same absolute** `MCPBASKET_STORE_PATH`. This is what makes research history and the Main basket survive process restarts and remain visible in the viewer.

```bash
export MCPBASKET_STORE_PATH="$HOME/.local/share/mcpbasket/basket.json"
export MCPBASKET_PORT=4377
export MCPBASKET_BIND_HOST=127.0.0.1
export MCPBASKET_VIEWER_URL="http://127.0.0.1:4377"
```

### 3. Start the local viewer

```bash
MCPBASKET_STORE_PATH="$MCPBASKET_STORE_PATH" \
MCPBASKET_PORT="$MCPBASKET_PORT" \
MCPBASKET_BIND_HOST="$MCPBASKET_BIND_HOST" \
MCPBASKET_VIEWER_URL="$MCPBASKET_VIEWER_URL" \
npm run viewer
```

Open `http://127.0.0.1:4377/health` and expect `{ "ok": true }`.

### Optional: route viewer refinements back to Hermes

The viewer always persists the entered refinement prompt and the full source-search snapshot before dispatching anything. To make the local viewer launch a Hermes one-shot run automatically, configure the **viewer process** with the absolute Hermes command:

```bash
export MCPBASKET_REFINEMENT_HERMES_COMMAND="$(command -v hermes)"
```

With that opt-in setting, a refinement starts `hermes --oneshot` in the background. The spawned agent receives only a refinement id, then loads the stored user prompt and immutable source snapshot through MCP before it creates a linked new search. Leave the variable unset to keep requests queued for an agent to recover with `basket-list-refinement-requests`.

### 4. Register the MCP server with the agent

Use the built entrypoint and repeat the same environment values, especially `MCPBASKET_STORE_PATH`:

```json
{
  "mcpServers": {
    "mcpbasket": {
      "command": "node",
      "args": ["/absolute/path/to/mcpbasket/packages/mcp-basket/build/index.js"],
      "env": {
        "MCPBASKET_STORE_PATH": "/absolute/path/to/basket.json",
        "MCPBASKET_PORT": "4377",
        "MCPBASKET_BIND_HOST": "127.0.0.1",
        "MCPBASKET_VIEWER_URL": "http://127.0.0.1:4377"
      }
    }
  }
}
```

The JSON is a standard MCP example. Replace both absolute paths. For Hermes, use the ready-to-copy YAML in [docs/HERMES.md](docs/HERMES.md).

### 5. Install the agent skill

Install or symlink the complete [`skills/mcpbasket`](skills/mcpbasket) directory into the host agent's skill directory, then restart the agent. For a local skill directory, the command is typically:

```bash
mkdir -p /path/to/agent/skills
ln -s "$(pwd)/skills/mcpbasket" /path/to/agent/skills/mcpbasket
```

The agent must load this `SKILL.md`; the MCP tools alone do not tell it when to create a search, verify a source, or add a product to the Main basket. After installing, use the agent's skill-list command to confirm `mcpbasket` is enabled.

The skill requires the agent to:

1. Call `basket-set-context` with `startNewSearch: true` for each new research response.
2. Verify the direct product page before storing it in `product.urls.product`.
3. Save the image only when it loads and belongs to that product.
4. Keep failed links as evidence and mark the candidate `needs_review` rather than exposing a broken source.
5. Add to the Main basket only after an explicit user choice.
6. When processing a refinement, load its persisted request first and create a linked new search instead of modifying the original search.

### 6. Smoke test

Use the MCP host's connection test, then ask the agent to research a product. Confirm that:

- A search appears in `/searches` with its timestamp and candidate count.
- A verified product source opens in the viewer.
- Adding a product appears in `/basket` and survives a viewer restart.
- Entering refinement criteria on a saved search creates a queued or dispatched refinement with the original snapshot retained.

The viewer is loopback-only by default. It is an MVP inspection surface, not a public sharing service. A private-network setup can bind to a private interface and set a matching `MCPBASKET_VIEWER_URL`; authentication, public sharing, and payments remain out of scope.

## Integrations

- [MCP server package](packages/mcp-basket/README.md)
- [Hermes installation](docs/HERMES.md)
- [HTTP API contract](docs/HTTP-API.md)
- [Planned remote service](docs/REMOTE-SERVICE.md)
- [Agent skill](skills/mcpbasket/SKILL.md)
- [Prompt construction for agents](skills/mcpbasket/references/prompting.md)
- [Contributing](CONTRIBUTING.md)

## Quality Gates

```bash
npm run build
npm run test
npm run verify
```
