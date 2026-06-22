---
name: mcpbasket
description: Use when an agent researches, recommends, compares, shortlists, prices, or prepares products or services for a possible purchase; when it needs a neutral pre-checkout basket, product candidates, MCP basket tools, a local basket preview, or generic checkout line-item export before a user-approved purchase. Also use when installing or operating the local mcpbasket MCP and viewer.
---

# MCPBasket

## Core Rule

Use the basket as the default pre-purchase workspace. Do not call any real checkout tool unless the user explicitly approves the exact product, merchant, price or estimate, quantity, delivery destination, and payment path.

## Prompt Routing

Treat a request as basket work when it asks to find, recommend, compare, shortlist, price, or source a potentially purchasable product or service. The user does not need to say "basket". Set context and save viable results while researching.

Do not stop for optional missing details: use known context, record unknown or estimated data accurately, and ask only when the missing information materially changes the candidates. For reusable prompt templates, examples, and capture rules, read `references/prompting.md`.

## Package

Prefer the local package when available:

```bash
cd mcpbasket
npm run build
npm run viewer
```

Installed entrypoints:

```bash
mcpbasket
mcpbasket-viewer
```

Useful environment variables:

```bash
MCPBASKET_PORT=4377
MCPBASKET_STORE_PATH=.mcpbasket/basket.json
```

## Workflow

1. Set basket context with `basket-set-context` before research:
   - `title`: short basket name
   - `intent`: user request and decision criteria
   - `currency`, `locale`, `destinationCountry`, `constraints`, `targetStores` when known

2. During research, save each plausible product with `basket-upsert-product`.
   - Add candidates early; refine fields as evidence improves.
   - Use `candidate` for raw finds, `shortlisted` for viable options, `needs_review` for uncertain data, `approved` only after user selection.

3. Capture enough fields for review:
   - Product title, merchant, source URL, image, current price, availability, quantity.
   - Variant options: size, color, storage, subscription, delivery choice.
   - Evidence: query, reason it matches, sources, observed timestamp, confidence.
   - Checkout: `locator`, `supported`, `readiness`; set `missing_locator` when unknown.

4. Use `basket-list-products` after meaningful updates and report the local `viewerUrl` when the user is on the same machine as the agent.
   - The current MCP does not create a public basket URL.
   - Do not expose the local HTTP API or invent a remote sharing URL.
   - A future remote service will publish authenticated basket views after it has been explicitly configured.

5. Use `basket-export-checkout-line-items` only for approved or `ready_for_checkout` items with valid locators. It prepares data; it does not place an order.

## MCP Tools

- `basket-set-context`: set intent and constraints.
- `basket-upsert-product`: add or update a universal product candidate.
- `basket-list-products`: list compact or raw basket data.
- `basket-update-status`: move candidate state.
- `basket-remove-product`: remove a candidate.
- `basket-clear`: clear basket with confirmation.
- `basket-get-viewer`: get the local viewer URL, API endpoints, and startup command.
- `basket-export-checkout-line-items`: prepare generic checkout line items.

## Data Quality

Treat product data as an observed snapshot, not truth. Always include source URLs and timestamps when available. If a price, tax, shipping, discount, stock, or variant is inferred, mark confidence as `estimated` or `unknown` and keep status as `needs_review`.

For the full neutral product field map, read `references/product-model.md`.
