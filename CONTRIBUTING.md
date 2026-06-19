# Contributing

## Development

```bash
npm install
npm run verify
```

Keep changes within their layer:

- Place schemas, pure calculations, and candidate rules in `domain`.
- Put workflows that load and mutate a basket in `application`.
- Keep filesystem, environment, and network details in `infrastructure` or `transports`.
- Do not add checkout execution to this repository. Exported line items are a boundary for separately approved integrations.

## Tests

Package tests run against compiled ESM output in `packages/mcp-basket/test`. Add coverage for behavior at the domain, application, or HTTP contract boundary. Avoid testing implementation details of a transport.

## Pull Requests

Run `npm run verify` before opening a pull request. Preserve MCP tool names and documented HTTP paths unless the change includes a migration note in `docs/`.
