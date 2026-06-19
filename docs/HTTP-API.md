# HTTP API

The local viewer/API is intended for the local agent runtime and a browser on the same machine. It returns JSON with `Cache-Control: no-store` and is not a public or mobile API.

## Endpoints

| Method | Path | Response | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | runtime metadata | Liveness check. |
| `GET` | `/api/model` | field guide | Neutral product model reference. |
| `GET` | `/api/basket` | compact basket summary | Viewer-oriented state. |
| `GET` | `/api/basket/raw` | full basket | Complete persisted document. |
| `GET` | `/api/decisions` | compact final-decision summary | Saved decisions and search-history count. |
| `POST` | `/api/context` | compact basket summary | Merge or reset research context. |
| `POST` | `/api/items` | item and basket summary | Create or update a candidate. |
| `POST` | `/api/items/:id/status` | item and basket summary | Update status only. |
| `DELETE` | `/api/items/:id` | removal result and summary | Remove a candidate. |
| `POST` | `/api/decisions` | decision and summaries | Save a user-confirmed candidate as a permanent final decision. |
| `DELETE` | `/api/decisions/:id` | removal result and summary | Remove a permanent decision without deleting research. |
| `POST` | `/api/clear` | compact basket summary | Clear items with confirmation. |

## Error Semantics

| Status | Meaning |
| --- | --- |
| `400` | Invalid JSON, missing confirmation, or malformed request. |
| `404` | Unknown path or candidate. |
| `413` | Request body exceeds 1 MB. |
| `422` | JSON is valid but does not satisfy the product schema. |
| `500` | Unexpected storage or server error. |

## Examples

Set context:

```json
POST /api/context
{
  "title": "Quiet keyboard research",
  "intent": "Compare compact mechanical keyboards under 150 EUR",
  "currency": "EUR",
  "constraints": ["quiet", "wireless"]
}
```

Add a candidate:

```json
POST /api/items
{
  "product": {
    "title": "Example keyboard",
    "merchant": { "name": "Example Store", "domain": "example.com" },
    "price": { "current": { "amount": 129, "currency": "EUR" } },
    "identifiers": { "sourceUrl": "https://example.com/products/keyboard" },
    "evidence": { "reason": "Matches the size and noise constraints", "confidence": "medium" }
  },
  "status": "candidate"
}
```

Clear items:

```json
POST /api/clear
{ "confirm": true }
```

Save a final decision with `POST /api/decisions` and `{ "itemId": "candidate-id", "searchId": "saved-search-id", "confirm": true }`.

`confirm` is mandatory. The selected product is copied into `decisionBasket.items`; it survives new search contexts and clearing the active research queue. Each distinct context set through `/api/context` records a candidate snapshot in `decisionBasket.searches`.
