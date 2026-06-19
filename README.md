# MCPBasket

Installable agent-commerce basket with an MCP server, an agent skill, and a hosted browser viewer.

This repo contains:

- `packages/mcp-basket` - MCP server with neutral pre-checkout basket tools and a local API/viewer.
- `skills/mcpbasket` - skill that teaches an agent the pre-purchase workflow.
- `apps/demo-web` - Next.js + Tailwind hosted viewer for Vercel.

## Architecture

The MCP runs locally with the agent and writes a local basket JSON. It serves:

```text
http://localhost:4377/api/basket
http://localhost:4377/api/basket/raw
http://localhost:4377
```

The hosted web app reads that basket API URL:

```text
https://mcpbasket.gordo.design?source=http://localhost:4377/api/basket
```

The agent and MCP own state locally. The hosted page is a stateless viewer, so it can be deployed independently on Vercel.

## Install

```bash
git clone <repo-url>
cd mcpbasket
npm install
npm run build
```

Start the local API/viewer:

```bash
npm run viewer
```

Run the MCP server:

```bash
npm run mcp
```

## MCP Config

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

## Skill

The installable skill is:

```text
skills/mcpbasket
```

For local development:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s /absolute/path/to/mcpbasket/skills/mcpbasket "${CODEX_HOME:-$HOME/.codex}/skills/mcpbasket"
```

## Vercel

The hosted viewer is deployed at:

```text
https://mcpbasket.gordo.design
```

Its Vercel project root is `apps/demo-web`.

## Clean Test Flow

1. `npm install`
2. `npm run build`
3. `npm run viewer`
4. Open `https://mcpbasket.gordo.design?source=http://localhost:4377/api/basket`
5. Install the skill in a clean agent profile.
6. Ask the agent to research products and save candidates through the MCP tools.
