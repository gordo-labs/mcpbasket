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

Copy `.env.example` to `.env` and set the path:

```bash
cp .env.example .env
# Edit MCPBASKET_STORE_PATH to an absolute path, e.g.:
# MCPBASKET_STORE_PATH=$HOME/.local/share/mcpbasket/basket.json
```

The `.env` is a convenience for running the viewer directly. Hermes injects `MCPBASKET_STORE_PATH` via its MCP server config below.

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

From the repository root:

```bash
npm run viewer
```

The viewer reads `MCPBASKET_STORE_PATH` from the environment. If not set, it falls back to `.env` in the repo root, then to `$CWD/.mcpbasket/basket.json`. Because Hermes already injects the variable via its MCP config, the viewer will automatically use the same store as the agent without extra setup.

To make the refinement input in the viewer launch Hermes automatically, set this in `.env`:

```bash
MCPBASKET_REFINEMENT_HERMES_COMMAND=/usr/local/bin/hermes
```

The request is saved first with the original search snapshot. Hermes receives a refinement id, calls `basket-get-refinement-request`, records a linked new search, and calls `basket-complete-refinement-request`. Leave the command unset when refinements should remain queued for a later agent run.

Open `http://127.0.0.1:4377/health` to verify the viewer. The screens are:

- `/`: current research and candidates.
- `/searches`: durable research archive.
- `/basket`: persistent Main basket.

The viewer is loopback-only by default. It is not a public sharing surface. Public mobile viewing, authenticated agent ingestion, and payment authorization require the planned remote service in [`REMOTE-SERVICE.md`](REMOTE-SERVICE.md).
