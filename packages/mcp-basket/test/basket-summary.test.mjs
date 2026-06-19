import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyBasket, normalizeCartItem, summarizeBasket } from "../build/domain/index.js";

test("summarizeBasket aggregates quantities, currencies, and checkout readiness", () => {
  const basket = createEmptyBasket(() => "2026-06-19T00:00:00.000Z");
  basket.context.currency = "EUR";
  basket.items = [
    normalizeCartItem(
      {
        id: "ready-item",
        status: "approved",
        quantity: 2,
        product: {
          title: "Quiet keyboard",
          price: { current: { amount: 99.5, currency: "EUR" } },
          identifiers: { productLocator: "store:quiet-keyboard" },
        },
      },
      { clock: () => "2026-06-19T00:00:00.000Z" },
    ),
    normalizeCartItem(
      {
        id: "review-item",
        status: "needs_review",
        product: {
          title: "Keyboard wrist rest",
          price: { totalEstimate: { amount: 20 } },
        },
      },
      { clock: () => "2026-06-19T00:00:00.000Z" },
    ),
  ];

  const summary = summarizeBasket(basket);

  assert.equal(summary.itemCount, 2);
  assert.deepEqual(summary.statuses, { approved: 1, needs_review: 1 });
  assert.equal(summary.checkoutReady, 1);
  assert.equal(summary.missingCheckoutLocator, 1);
  assert.deepEqual(summary.totalsByCurrency, { EUR: 219 });
  assert.equal(summary.items[0].locator, "store:quiet-keyboard");
});
