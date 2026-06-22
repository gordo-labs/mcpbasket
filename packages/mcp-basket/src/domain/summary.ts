import type { Basket, CartItem, DecisionBasket, Money } from "./model.js";
import { checkoutLocatorFor, isCheckoutReady } from "./basket.js";

export type BasketSummaryItem = {
  id: string;
  status: CartItem["status"];
  quantity: number;
  title: string;
  brand?: string;
  merchant?: Record<string, unknown>;
  url?: string;
  image?: string;
  price?: Money;
  availability?: string;
  locator?: string;
  checkout?: CartItem["checkout"];
  reason?: string;
  confidence?: string;
  updatedAt: string;
};

export type BasketSummary = {
  id: string;
  context: Basket["context"];
  itemCount: number;
  statuses: Partial<Record<CartItem["status"], number>>;
  checkoutReady: number;
  missingCheckoutLocator: number;
  finalDecisionCount: number;
  searchHistoryCount: number;
  totalsByCurrency: Record<string, number>;
  updatedAt: string;
  items: BasketSummaryItem[];
};

function moneyFrom(value: unknown, currency?: unknown): Money | undefined {
  if (value != null && typeof value === "object") {
    return value as Money;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return {
      amount: value,
      currency: typeof currency === "string" ? currency : undefined,
    };
  }
  return undefined;
}

function stringField(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function compactBasketItem(item: CartItem): BasketSummaryItem {
  const currency = item.product.price?.currency;
  const price = moneyFrom(item.product.price?.current, currency) || moneyFrom(item.product.price?.totalEstimate, currency);
  return {
    id: item.id,
    status: item.status,
    quantity: item.quantity,
    title: item.product.title,
    brand: item.product.brand,
    merchant: item.product.merchant,
    url: item.product.urls?.product || item.product.identifiers?.sourceUrl,
    image: item.product.images?.[0]?.url || item.product.urls?.image,
    price,
    availability: stringField(item.product.availability?.status),
    locator: checkoutLocatorFor(item),
    checkout: item.checkout,
    reason: stringField(item.product.evidence?.reason),
    confidence: stringField(item.product.evidence?.confidence),
    updatedAt: item.updatedAt,
  };
}

export function summarizeBasket(basket: Basket): BasketSummary {
  const statuses = basket.items.reduce<Partial<Record<CartItem["status"], number>>>((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {});

  const totalsByCurrency = basket.items.reduce<Record<string, number>>((totals, item) => {
    const priceCurrency = item.product.price?.currency;
    const money = moneyFrom(item.product.price?.totalEstimate, priceCurrency) || moneyFrom(item.product.price?.current, priceCurrency);
    if (money?.amount == null) {
      return totals;
    }

    const currency = stringField(money.currency) || basket.context.currency || "USD";
    totals[currency] = (totals[currency] || 0) + money.amount * item.quantity;
    return totals;
  }, {});

  return {
    id: basket.id,
    context: basket.context,
    itemCount: basket.items.length,
    statuses,
    checkoutReady: basket.items.filter(isCheckoutReady).length,
    missingCheckoutLocator: basket.items.filter((item) => checkoutLocatorFor(item) == null).length,
    finalDecisionCount: basket.decisionBasket?.items.length || 0,
    searchHistoryCount: basket.decisionBasket?.searches.length || 0,
    totalsByCurrency,
    updatedAt: basket.updatedAt,
    items: basket.items.map(compactBasketItem),
  };
}

export function summarizeDecisionBasket(decisionBasket: DecisionBasket | undefined): {
  itemCount: number;
  searchCount: number;
  items: Array<ReturnType<typeof compactBasketItem> & { id: string; sourceItemId: string; sourceSearchId?: string; selectedAt: string; searchId?: string }>;
} {
  const items = decisionBasket?.items || [];
  return {
    itemCount: items.length,
    searchCount: decisionBasket?.searches.length || 0,
    items: items.map((decision) => ({
      ...compactBasketItem(decision.item),
      id: decision.id,
      sourceItemId: decision.sourceItemId,
      sourceSearchId: decision.sourceSearchId,
      selectedAt: decision.selectedAt,
      searchId: decision.searchId,
    })),
  };
}
