# Hermes Installation

## 1. Build MCPBasket

Clone MCPBasket on the same machine as Hermes, then build it:

```bash
git clone https://github.com/gordo-labs/mcpbasket.git
cd mcpbasket
npm install
npm run verify
```

## 2. Configure one shared store

Choose a persistent absolute path. The viewer process and the Hermes MCP entry must use this exact same value.

```bash
export MCPBASKET_STORE_PATH="$HOME/.local/share/mcpbasket/basket.json"
```

## 3. Register the MCP server

Add this to Hermes's `config.yaml`, replacing both absolute paths:

```yaml
mcp_servers:
  mcpbasket:
    command: node
    args:
      - /absolute/path/to/mcpbasket/packages/mcp-basket/build/index.js
    env:
      MCPBASKET_STORE_PATH: /absolute/path/to/mcpbasket/basket.json
      MCPBASKET_PORT: "4377"
      MCPBASKET_BIND_HOST: 127.0.0.1
      MCPBASKET_VIEWER_URL: http://127.0.0.1:4377
    timeout: 120
    connect_timeout: 60
```

Restart Hermes, then verify the connection:

```bash
hermes mcp test mcpbasket
```

## 4. Install the skill

Link or copy the complete skill directory into Hermes's local skills directory, then confirm it is enabled:

```bash
mkdir -p "$HOME/.hermes/skills"
ln -s /absolute/path/to/mcpbasket/skills/mcpbasket "$HOME/.hermes/skills/mcpbasket"
hermes skills list
```

Restart Hermes after the link is created. The skill is mandatory for the intended workflow: it creates historical searches, validates direct source links, captures images when available, and only moves user-selected products to the Main basket.

## 5. Start the viewer

Run this from the repository root in a supervised process or service manager:

```bash
MCPBASKET_STORE_PATH="$MCPBASKET_STORE_PATH" \
MCPBASKET_PORT=4377 \
MCPBASKET_BIND_HOST=127.0.0.1 \
MCPBASKET_VIEWER_URL=http://127.0.0.1:4377 \
npm run viewer
```

To make the refinement input in the viewer launch Hermes automatically, add this environment variable to the **viewer service** (not the Hermes MCP entry):

```bash
MCPBASKET_REFINEMENT_HERMES_COMMAND="$(command -v hermes)" \
MCPBASKET_STORE_PATH="$MCPBASKET_STORE_PATH" \
MCPBASKET_PORT=4377 \
MCPBASKET_BIND_HOST=127.0.0.1 \
MCPBASKET_VIEWER_URL=http://127.0.0.1:4377 \
npm run viewer
```

The request is saved first with the original search snapshot. Hermes receives a refinement id, calls `basket-get-refinement-request`, records a linked new search, and calls `basket-complete-refinement-request`. Leave the command unset when refinements should remain queued for a later agent run.

Open `http://127.0.0.1:4377/health` to verify the viewer. The screens are:

- `/`: current research and candidates.
- `/searches`: durable research archive.
- `/basket`: persistent Main basket.

The viewer is loopback-only by default. It is not a public sharing surface. Public mobile viewing, authenticated agent ingestion, and payment authorization require the planned remote service in [`REMOTE-SERVICE.md`](REMOTE-SERVICE.md).
