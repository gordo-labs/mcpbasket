# Product Model Reference

Use this map when filling `basket-upsert-product.item`.

## Item

- `id`: existing basket item id when updating.
- `status`: `candidate`, `shortlisted`, `needs_review`, `approved`, `ready_for_checkout`, `ordered`, `rejected`.
- `quantity`: integer.
- `product`: product snapshot.
- `checkout`: checkout readiness metadata.
- `decision`: rank, score, rationale, tradeoffs.
- `notes`, `tags`, `comparisonGroupId`, `extra`.

## Product Snapshot

- `title`, `subtitle`, `description`, `brand`, `category`, `condition`.
- `merchant.name`, `merchant.domain`, `merchant.url`, `merchant.country`, `merchant.platform`, `merchant.sellerName`, `merchant.sellerId`.
- `identifiers.sourceUrl`, `canonicalUrl`, `productLocator`, `sku`, `asin`, `gtin`, `upc`, `ean`, `isbn`, `mpn`, `productId`, `variantId`, `shopifyProductId`, `shopifyVariantId`.
- `urls.product`, `urls.canonical`, `urls.checkout`, `urls.image`, `urls.affiliate`.
- `images[]`: `url`, `type`, `alt`, `width`, `height`.
- `selectedOptions[]`: `name`, `value`, `label`, `sku`.
- `attributes[]`: `name`, `value`, `unit`, `source`.
- `price.current`, `list`, `unit`, `subtotal`, `shipping`, `taxEstimate`, `totalEstimate`, `discount`, `saleLabel`, `couponCodes`, `priceValidUntil`.
- `availability.status`, `quantityAvailable`, `limitPerCustomer`, `restockDate`, `message`.
- `fulfillment.type`, `shipsFrom`, `deliveryWindow`, `shippingSpeed`, `carrier`, `destinationCountry`, `requiresPhysicalAddress`.
- `policy.returns`, `warranty`, `ageRestriction`, `regionRestrictions`, `subscriptionTerms`, `complianceNotes`.
- `rating.value`, `scale`, `count`, `reviewSummary`.
- `evidence.foundBy`, `query`, `reason`, `confidence`, `sources[]`.

## Checkout

- `provider`: merchant or checkout integration name.
- `locator`: provider-specific locator.
- `supported`: boolean.
- `readiness`: `missing_locator`, `needs_validation`, `ready`, `blocked`, `unknown`.
- `orderId`, `lastCheckedAt`, `notes`.

## Minimal Example

```json
{
  "quantity": 1,
  "status": "candidate",
  "product": {
    "title": "Example product",
    "merchant": {
      "name": "Example Store",
      "domain": "example.com",
      "platform": "shopify"
    },
    "identifiers": {
      "sourceUrl": "https://example.com/products/example",
      "productLocator": "shopify:https://example.com/products/example:123456"
    },
    "urls": {
      "product": "https://example.com/products/example",
      "image": "https://example.com/example.jpg"
    },
    "price": {
      "current": {
        "amount": 29.99,
        "currency": "USD",
        "confidence": "exact",
        "observedAt": "2026-06-19T12:00:00.000Z"
      }
    },
    "availability": {
      "status": "in_stock"
    },
    "evidence": {
      "query": "user search terms",
      "reason": "Matches the user request",
      "confidence": "medium",
      "sources": [
        {
          "url": "https://example.com/products/example",
          "title": "Example product",
          "observedAt": "2026-06-19T12:00:00.000Z"
        }
      ]
    }
  }
}
```
