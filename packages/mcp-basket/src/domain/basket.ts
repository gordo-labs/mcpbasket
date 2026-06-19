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
    createdAt: now,
    updatedAt: now,
  };
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
  const { resetMissingFields, ...nextContext } = parsed;
  return resetMissingFields ? nextContext : { ...current, ...nextContext };
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
    product: parsed.product,
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
