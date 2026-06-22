import { randomUUID } from "node:crypto";
import {
  BasketContextInputSchema,
  CartItemInputSchema,
  type Basket,
  type BasketContextInput,
  type CandidateStatus,
  type CartItem,
  type CartItemInput,
  type CheckoutState,
  type DecisionBasket,
  type DecisionBasketItem,
  type DecisionSearch,
} from "./model.js";

export type Clock = () => string;
export type IdGenerator = () => string;

export const systemClock: Clock = () => new Date().toISOString();
export const uuidGenerator: IdGenerator = randomUUID;

export function createEmptyBasket(clock: Clock = systemClock): Basket {
  const now = clock();
  return {
    version: 1,
    id: "default",
    context: {},
    items: [],
    decisionBasket: createEmptyDecisionBasket(() => now),
    createdAt: now,
    updatedAt: now,
  };
}

export function createEmptyDecisionBasket(clock: Clock = systemClock): DecisionBasket {
  const now = clock();
  return {
    id: "final-decisions",
    items: [],
    searches: [],
    refinementRequests: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function decisionBasketFor(basket: Pick<Basket, "decisionBasket">, clock: Clock = systemClock): DecisionBasket {
  return basket.decisionBasket || createEmptyDecisionBasket(clock);
}

export function checkoutLocatorFor(item: Pick<CartItem, "product" | "checkout">): string | undefined {
  return item.checkout?.locator || item.product.identifiers?.productLocator;
}

export function isCheckoutReady(item: CartItem): boolean {
  const isApproved = item.status === "approved" || item.status === "ready_for_checkout";
  return isApproved && checkoutLocatorFor(item) != null;
}

export function mergeBasketContext(
  current: Basket["context"],
  input: BasketContextInput,
): Basket["context"] {
  const parsed = BasketContextInputSchema.parse(input);
  const {
    resetMissingFields,
    startNewSearch: _startNewSearch,
    refinementOfSearchId: _refinementOfSearchId,
    refinementRequestId: _refinementRequestId,
    ...nextContext
  } = parsed;
  return resetMissingFields ? nextContext : { ...current, ...nextContext };
}

function searchFingerprint(context: Basket["context"]): string | undefined {
  const title = context.title?.trim();
  const intent = context.intent?.trim();
  return title || intent ? `${title || ""}\u0000${intent || ""}` : undefined;
}

export function beginResearchSession(
  basket: Pick<Basket, "context" | "items" | "activeSearchId" | "decisionBasket">,
  context: Basket["context"],
  options: {
    clock?: Clock;
    idGenerator?: IdGenerator;
    forceNewSession?: boolean;
    refinementOfSearchId?: string;
    refinementRequestId?: string;
  } = {},
): { decisionBasket: DecisionBasket; activeSearchId?: string; items: CartItem[] } {
  const fingerprint = searchFingerprint(context);
  if (fingerprint == null) {
    return {
      decisionBasket: decisionBasketFor(basket, options.clock),
      activeSearchId: basket.activeSearchId,
      items: basket.items,
    };
  }

  const clock = options.clock || systemClock;
  const idGenerator = options.idGenerator || uuidGenerator;
  const now = clock();
  const decisionBasket = decisionBasketFor(basket, () => now);
  const activeIndex = decisionBasket.searches.findIndex((search) => search.id === basket.activeSearchId);
  const active = activeIndex >= 0 ? decisionBasket.searches[activeIndex] : undefined;
  const snapshotItems = basket.items.length === 0 && active != null && active.items.length > 0 ? active.items : basket.items;

  if (!options.forceNewSession && active != null && searchFingerprint(active.context) === fingerprint) {
    const searches = [...decisionBasket.searches];
    searches[activeIndex] = { ...active, context, items: snapshotItems, updatedAt: now };
    return {
      decisionBasket: { ...decisionBasket, searches, updatedAt: now },
      activeSearchId: active.id,
      items: snapshotItems,
    };
  }

  const searches = [...decisionBasket.searches];
  if (!options.forceNewSession && active == null && searchFingerprint(basket.context) === fingerprint) {
    const matchingIndex = searches.findIndex((search) => searchFingerprint(search.context) === fingerprint);
    if (matchingIndex >= 0) {
      searches[matchingIndex] = { ...searches[matchingIndex], context, items: basket.items, updatedAt: now };
      return {
        decisionBasket: { ...decisionBasket, searches, updatedAt: now },
        activeSearchId: searches[matchingIndex].id,
        items: basket.items,
      };
    }
    const restoredSearch: DecisionSearch = {
      id: idGenerator(),
      context,
      items: basket.items,
      createdAt: now,
      updatedAt: now,
    };
    return {
      decisionBasket: { ...decisionBasket, searches: [...searches, restoredSearch], updatedAt: now },
      activeSearchId: restoredSearch.id,
      items: basket.items,
    };
  }

  if (active != null) {
    searches[activeIndex] = { ...active, context: basket.context, items: snapshotItems, updatedAt: now };
  } else if (searchFingerprint(basket.context) != null) {
    const historicalSearch: DecisionSearch = {
      id: idGenerator(),
      context: basket.context,
      items: basket.items,
      createdAt: now,
      updatedAt: now,
    };
    searches.push(historicalSearch);
  }

  const nextSearch: DecisionSearch = {
    id: idGenerator(),
    context,
    items: [],
    refinementOfSearchId: options.refinementOfSearchId,
    refinementRequestId: options.refinementRequestId,
    createdAt: now,
    updatedAt: now,
  };
  return {
    decisionBasket: { ...decisionBasket, searches: [...searches, nextSearch], updatedAt: now },
    activeSearchId: nextSearch.id,
    items: [],
  };
}

export function replaceResearchSessionItem(
  decisionBasket: DecisionBasket,
  searchId: string | undefined,
  item: CartItem,
  clock: Clock = systemClock,
): DecisionBasket {
  if (searchId == null) {
    return decisionBasket;
  }
  const index = decisionBasket.searches.findIndex((search) => search.id === searchId);
  if (index < 0) {
    return decisionBasket;
  }
  const search = decisionBasket.searches[index];
  const itemIndex = search.items.findIndex((candidate) => candidate.id === item.id);
  const items = [...search.items];
  if (itemIndex < 0) {
    items.push(item);
  } else {
    items[itemIndex] = item;
  }
  const searches = [...decisionBasket.searches];
  searches[index] = { ...search, items, updatedAt: clock() };
  return { ...decisionBasket, searches, updatedAt: clock() };
}

export function replaceResearchSessionItems(
  decisionBasket: DecisionBasket,
  searchId: string | undefined,
  items: CartItem[],
  clock: Clock = systemClock,
): DecisionBasket {
  if (searchId == null) {
    return decisionBasket;
  }
  const index = decisionBasket.searches.findIndex((search) => search.id === searchId);
  if (index < 0) {
    return decisionBasket;
  }
  const searches = [...decisionBasket.searches];
  searches[index] = { ...searches[index], items, updatedAt: clock() };
  return { ...decisionBasket, searches, updatedAt: clock() };
}

export function addDecisionBasketItem(
  decisionBasket: DecisionBasket,
  item: CartItem,
  options: { searchId?: string; clock?: Clock; idGenerator?: IdGenerator } = {},
): { decisionBasket: DecisionBasket; item: DecisionBasketItem; created: boolean } {
  const clock = options.clock || systemClock;
  const idGenerator = options.idGenerator || uuidGenerator;
  const now = clock();
  const index = decisionBasket.items.findIndex((decision) => decision.sourceItemId === item.id && decision.sourceSearchId === options.searchId);
  const existing = index >= 0 ? decisionBasket.items[index] : undefined;
  const decisionItem: DecisionBasketItem = {
    id: existing?.id || idGenerator(),
    sourceItemId: item.id,
    sourceSearchId: options.searchId || existing?.sourceSearchId,
    item,
    searchId: options.searchId || existing?.searchId,
    selectedAt: existing?.selectedAt || now,
    updatedAt: now,
  };
  const items = [...decisionBasket.items];
  if (index >= 0) {
    items[index] = decisionItem;
  } else {
    items.push(decisionItem);
  }

  return {
    decisionBasket: { ...decisionBasket, items, updatedAt: now },
    item: decisionItem,
    created: index < 0,
  };
}

export function removeDecisionBasketItem(
  decisionBasket: DecisionBasket,
  id: string,
  clock: Clock = systemClock,
): { decisionBasket: DecisionBasket; removed: boolean } {
  const items = decisionBasket.items.filter((item) => item.id !== id);
  if (items.length === decisionBasket.items.length) {
    return { decisionBasket, removed: false };
  }
  return {
    decisionBasket: { ...decisionBasket, items, updatedAt: clock() },
    removed: true,
  };
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeProductMedia(product: CartItemInput["product"]): CartItemInput["product"] {
  const urls = { ...product.urls };
  const identifiers = { ...product.identifiers };
  const images = [...(product.images || [])];
  const sourceUrl = urls.product || urls.canonical || identifiers.sourceUrl || identifiers.canonicalUrl;

  if (isHttpUrl(sourceUrl)) {
    urls.product ||= sourceUrl;
    identifiers.sourceUrl ||= sourceUrl;
  }

  const imageUrl = urls.image || images[0]?.url;
  if (isHttpUrl(imageUrl)) {
    urls.image ||= imageUrl;
    if (!images.some((image) => image.url === imageUrl)) {
      images.unshift({ url: imageUrl, type: "image" });
    }
  }

  return {
    ...product,
    ...(Object.keys(urls).length > 0 ? { urls } : {}),
    ...(Object.keys(identifiers).length > 0 ? { identifiers } : {}),
    ...(images.length > 0 ? { images } : {}),
  };
}

function normalizeCheckout(input: CartItemInput, existing?: CartItem): CheckoutState {
  const locator = input.checkout?.locator || input.product.identifiers?.productLocator || existing?.checkout?.locator;

  return {
    ...existing?.checkout,
    ...input.checkout,
    provider: input.checkout?.provider || existing?.checkout?.provider || (locator ? "external" : "unknown"),
    locator,
    supported: input.checkout?.supported ?? existing?.checkout?.supported ?? locator != null,
    readiness:
      input.checkout?.readiness ||
      existing?.checkout?.readiness ||
      (locator ? "needs_validation" : "missing_locator"),
  };
}

export function normalizeCartItem(
  input: CartItemInput,
  options: { existing?: CartItem; clock?: Clock; idGenerator?: IdGenerator } = {},
): CartItem {
  const parsed = CartItemInputSchema.parse(input);
  const clock = options.clock || systemClock;
  const existing = options.existing;
  const createdAt = existing?.createdAt || parsed.createdAt || clock();

  return {
    ...existing,
    ...parsed,
    id: parsed.id || existing?.id || (options.idGenerator || uuidGenerator)(),
    status: parsed.status || existing?.status || "candidate",
    quantity: parsed.quantity || existing?.quantity || 1,
    product: normalizeProductMedia(parsed.product),
    checkout: normalizeCheckout(parsed, existing),
    createdAt,
    updatedAt: clock(),
  };
}

export function withUpdatedStatus(item: CartItem, status: CandidateStatus, clock: Clock = systemClock): CartItem {
  return {
    ...item,
    status,
    updatedAt: clock(),
  };
}
