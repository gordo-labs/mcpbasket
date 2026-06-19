import {
  addDecisionBasketItem,
  beginResearchSession,
  BasketContextInputSchema,
  CandidateStatusSchema,
  CartItemInputSchema,
  decisionBasketFor,
  createEmptyBasket,
  mergeBasketContext,
  normalizeCartItem,
  replaceResearchSessionItem,
  replaceResearchSessionItems,
  removeDecisionBasketItem,
  systemClock,
  uuidGenerator,
  withUpdatedStatus,
  type Basket,
  type BasketContextInput,
  type CandidateStatus,
  type CartItem,
  type CartItemInput,
  type Clock,
  type DecisionBasketItem,
  type IdGenerator,
} from "../domain/index.js";
import { checkoutLocatorFor } from "../domain/basket.js";
import { compactBasketItem } from "../domain/summary.js";
import type { BasketRepository } from "./contracts.js";

export type UpsertBasketItemResult = {
  basket: Basket;
  item: CartItem;
  created: boolean;
};

export type CheckoutLineItemExport = {
  lineItems: Array<{ locator: string; quantity: number }>;
  missing: Array<{ id: string; title: string; reason: string }>;
  selected: ReturnType<typeof compactBasketItem>[];
};

export type AddDecisionBasketItemResult = {
  basket: Basket;
  item: DecisionBasketItem;
  created: boolean;
};

export class BasketService {
  constructor(
    private readonly repository: BasketRepository,
    private readonly dependencies: { clock?: Clock; idGenerator?: IdGenerator } = {},
  ) {}

  path(): string {
    return this.repository.path();
  }

  async load(): Promise<Basket> {
    return this.repository.runExclusive(() => this.loadOrCreate());
  }

  async setContext(input: BasketContextInput): Promise<Basket> {
    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      const now = this.now();
      const parsedInput = BasketContextInputSchema.parse(input);
      const context = mergeBasketContext(basket.context, parsedInput);
      const session = beginResearchSession(basket, context, {
        clock: () => now,
        idGenerator: this.dependencies.idGenerator,
        forceNewSession: parsedInput.startNewSearch === true,
      });
      return this.repository.write({
        ...basket,
        context,
        items: session.items,
        activeSearchId: session.activeSearchId,
        decisionBasket: session.decisionBasket,
        updatedAt: now,
      });
    });
  }

  async upsertItem(input: CartItemInput): Promise<UpsertBasketItemResult> {
    const parsed = CartItemInputSchema.parse(input);

    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      const index = parsed.id ? basket.items.findIndex((item) => item.id === parsed.id) : -1;
      const existing = index >= 0 ? basket.items[index] : undefined;
      const item = normalizeCartItem(parsed, {
        existing,
        clock: this.dependencies.clock,
        idGenerator: this.dependencies.idGenerator,
      });
      const items = [...basket.items];

      if (index >= 0) {
        items[index] = item;
      } else {
        items.push(item);
      }

      const now = this.now();
      const decisionBasket = replaceResearchSessionItems(
        decisionBasketFor(basket, () => now),
        basket.activeSearchId,
        items,
        () => now,
      );
      const saved = await this.repository.write({ ...basket, items, decisionBasket, updatedAt: now });
      return { basket: saved, item, created: index < 0 };
    });
  }

  async updateStatus(id: string, status: CandidateStatus): Promise<CartItem | null> {
    const parsedStatus = CandidateStatusSchema.parse(status);

    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      const index = basket.items.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }

      const item = withUpdatedStatus(basket.items[index], parsedStatus, this.dependencies.clock);
      const items = [...basket.items];
      items[index] = item;
      const now = this.now();
      const decisionBasket = replaceResearchSessionItems(
        decisionBasketFor(basket, () => now),
        basket.activeSearchId,
        items,
        () => now,
      );
      await this.repository.write({ ...basket, items, decisionBasket, updatedAt: now });
      return item;
    });
  }

  async removeItem(id: string): Promise<boolean> {
    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      const items = basket.items.filter((item) => item.id !== id);
      if (items.length === basket.items.length) {
        return false;
      }

      const now = this.now();
      const decisionBasket = replaceResearchSessionItems(
        decisionBasketFor(basket, () => now),
        basket.activeSearchId,
        items,
        () => now,
      );
      await this.repository.write({ ...basket, items, decisionBasket, updatedAt: now });
      return true;
    });
  }

  async clear(): Promise<Basket> {
    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      return this.repository.write({ ...basket, items: [], updatedAt: this.now() });
    });
  }

  async addToDecisionBasket(id: string, searchId?: string): Promise<AddDecisionBasketItemResult | null> {
    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      const now = this.now();
      const decisionBasket = decisionBasketFor(basket, () => now);
      const sourceSearchId = searchId || basket.activeSearchId;
      const search = sourceSearchId == null ? undefined : decisionBasket.searches.find((entry) => entry.id === sourceSearchId);
      const sourceItem = sourceSearchId === basket.activeSearchId
        ? basket.items.find((item) => item.id === id)
        : search?.items.find((item) => item.id === id) || basket.items.find((item) => item.id === id);
      if (sourceItem == null) {
        return null;
      }

      const selectedItem = withUpdatedStatus(sourceItem, "approved", () => now);
      const items = sourceSearchId === basket.activeSearchId
        ? basket.items.map((item) => item.id === id ? selectedItem : item)
        : basket.items;
      const withSelectedResearchItem = replaceResearchSessionItem(decisionBasket, sourceSearchId, selectedItem, () => now);
      const result = addDecisionBasketItem(withSelectedResearchItem, selectedItem, {
        searchId: sourceSearchId,
        clock: () => now,
        idGenerator: this.dependencies.idGenerator,
      });
      const saved = await this.repository.write({
        ...basket,
        items,
        decisionBasket: result.decisionBasket,
        updatedAt: now,
      });
      return { basket: saved, item: result.item, created: result.created };
    });
  }

  async removeFromDecisionBasket(id: string): Promise<{ basket: Basket; removed: boolean }> {
    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      const now = this.now();
      const currentDecisions = decisionBasketFor(basket, () => now);
      const existing = currentDecisions.items.find((item) => item.id === id);
      const result = removeDecisionBasketItem(currentDecisions, id, () => now);
      if (!result.removed) {
        return { basket, removed: false };
      }
      const sourceSearch = existing?.sourceSearchId == null
        ? undefined
        : result.decisionBasket.searches.find((search) => search.id === existing.sourceSearchId);
      const sourceItem = sourceSearch?.items.find((item) => item.id === existing?.sourceItemId);
      const restoredItem = sourceItem?.status === "approved" ? withUpdatedStatus(sourceItem, "shortlisted", () => now) : sourceItem;
      const decisionBasket = restoredItem == null
        ? result.decisionBasket
        : replaceResearchSessionItem(result.decisionBasket, existing?.sourceSearchId, restoredItem, () => now);
      const items = existing?.sourceSearchId === basket.activeSearchId && restoredItem != null
        ? basket.items.map((item) => item.id === restoredItem.id ? restoredItem : item)
        : basket.items;
      const saved = await this.repository.write({ ...basket, items, decisionBasket, updatedAt: now });
      return { basket: saved, removed: true };
    });
  }

  async exportCheckoutLineItems(itemIds?: string[]): Promise<CheckoutLineItemExport> {
    const basket = await this.load();
    const selected = basket.items.filter((item) => {
      const selectedById = itemIds == null || itemIds.length === 0 || itemIds.includes(item.id);
      const selectedByStatus = item.status === "approved" || item.status === "ready_for_checkout";
      return selectedById && selectedByStatus;
    });

    return {
      lineItems: selected.flatMap((item) => {
        const locator = checkoutLocatorFor(item);
        return locator ? [{ locator, quantity: item.quantity }] : [];
      }),
      missing: selected.flatMap((item) => {
        return checkoutLocatorFor(item)
          ? []
          : [{ id: item.id, title: item.product.title, reason: "Missing checkout locator" }];
      }),
      selected: selected.map(compactBasketItem),
    };
  }

  private async loadOrCreate(): Promise<Basket> {
    const existing = await this.repository.read();
    if (existing == null) {
      return this.repository.write(createEmptyBasket(this.dependencies.clock));
    }
    if (existing.activeSearchId != null || (!existing.context.title && !existing.context.intent)) {
      return existing;
    }

    const now = this.now();
    const session = beginResearchSession(existing, existing.context, {
      clock: () => now,
      idGenerator: this.dependencies.idGenerator,
    });
    return this.repository.write({
      ...existing,
      items: session.items,
      activeSearchId: session.activeSearchId,
      decisionBasket: session.decisionBasket,
      updatedAt: now,
    });
  }

  private now(): string {
    return (this.dependencies.clock || systemClock)();
  }
}
