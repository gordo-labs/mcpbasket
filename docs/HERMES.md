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
    "MCPBASKET_BIND_HOST": "127.0.0.1"
  }
}
```

4. Install or point Hermes to `skills/mcpbasket`.
5. Start the local viewer/API with `npm run viewer` or configure Hermes to start it as a sidecar.

The current viewer is loopback-only and intended for the same machine as Hermes. It is not a public sharing surface. Public mobile viewing, authenticated agent ingestion, and payment authorization require the planned remote service in [`REMOTE-SERVICE.md`](REMOTE-SERVICE.md).
