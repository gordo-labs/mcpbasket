import {
  CandidateStatusSchema,
  CartItemInputSchema,
  createEmptyBasket,
  mergeBasketContext,
  normalizeCartItem,
  systemClock,
  uuidGenerator,
  withUpdatedStatus,
  type Basket,
  type BasketContextInput,
  type CandidateStatus,
  type CartItem,
  type CartItemInput,
  type Clock,
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
      return this.repository.write({
        ...basket,
        context: mergeBasketContext(basket.context, input),
        updatedAt: this.now(),
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

      const saved = await this.repository.write({ ...basket, items, updatedAt: this.now() });
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
      await this.repository.write({ ...basket, items, updatedAt: this.now() });
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

      await this.repository.write({ ...basket, items, updatedAt: this.now() });
      return true;
    });
  }

  async clear(): Promise<Basket> {
    return this.repository.runExclusive(async () => {
      const basket = await this.loadOrCreate();
      return this.repository.write({ ...basket, items: [], updatedAt: this.now() });
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
    return existing || this.repository.write(createEmptyBasket(this.dependencies.clock));
  }

  private now(): string {
    return (this.dependencies.clock || systemClock)();
  }
}
