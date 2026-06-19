# Hermes Install Notes

1. Clone this repo on the same machine as Hermes.
2. Run `npm install && npm run build`.
3. Register the MCP server:

```json
{
  "command": "node",
  "args": ["/absolute/path/to/mcpbasket/packages/mcp-basket/build/index.js"],
  "env": {
    "MCPBASKET_PORT": "4377",
    "MCPBASKET_BIND_HOST": "127.0.0.1",
    "MCPBASKET_HOSTED_VIEWER_URL": "https://mcpbasket.gordo.design"
  }
}
```

4. Install or point Hermes to `skills/mcpbasket`.
5. Start the local viewer/API with `npm run viewer` or configure Hermes to start it as a sidecar.

The hosted viewer reads the local MCP API through `source`:

```text
https://mcpbasket.gordo.design?source=http://localhost:4377/api/basket
```

If the browser cannot access localhost from the hosted page, expose the API through a trusted tunnel and set:

```text
MCPBASKET_PUBLIC_HOST=https://your-tunnel.example.com
```

Keep `MCPBASKET_BIND_HOST=127.0.0.1`; the tunnel should connect locally. Do not expose the basket API directly to an untrusted network because it accepts mutations.
