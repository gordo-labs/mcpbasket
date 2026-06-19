export type Money = {
  amount?: number;
  currency?: string;
  display?: string;
};

export type BasketItem = {
  id: string;
  status?: string;
  quantity?: number;
  title?: string;
  brand?: string;
  merchant?: {
    name?: string;
    domain?: string;
  };
  url?: string;
  image?: string;
  price?: Money;
  locator?: string;
  checkout?: {
    readiness?: string;
  };
  reason?: string;
};

export type BasketSummary = {
  context?: {
    title?: string;
    intent?: string;
  };
  itemCount?: number;
  checkoutReady?: number;
  missingCheckoutLocator?: number;
  totalsByCurrency?: Record<string, number>;
  statuses?: Record<string, number>;
  items?: BasketItem[];
};
