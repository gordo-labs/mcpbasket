import { z } from "zod";

export const CANDIDATE_STATUSES = [
  "candidate",
  "shortlisted",
  "needs_review",
  "approved",
  "ready_for_checkout",
  "ordered",
  "rejected",
] as const;

export const CandidateStatusSchema = z.enum(CANDIDATE_STATUSES);

export const FlexibleRecordSchema = z.record(z.unknown());
export const UrlRecordSchema = z.record(z.string().url());

export const ProductSnapshotSchema = z
  .object({
    title: z.string().min(1).describe("Human-readable product title."),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    condition: z.enum(["new", "used", "refurbished", "open_box", "unknown"]).optional(),
    merchant: FlexibleRecordSchema.optional().describe("Store, platform, seller, country, and domain metadata."),
    identifiers: z
      .record(z.string().optional())
      .optional()
      .describe("URLs, SKU, ASIN, GTIN, UPC, variant IDs, and productLocator."),
    urls: UrlRecordSchema.optional().describe("Product, canonical, checkout, image, and affiliate URLs."),
    images: z
      .array(
        z
          .object({
            url: z.string().url(),
            type: z.enum(["image", "video", "thumbnail"]).optional(),
            alt: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
    selectedOptions: z
      .array(FlexibleRecordSchema)
      .optional()
      .describe("Selected variant options such as size, color, storage, delivery plan."),
    attributes: z.array(FlexibleRecordSchema).optional().describe("Structured product specs and attributes."),
    price: FlexibleRecordSchema.optional().describe("current, list, unit, subtotal, shipping, taxEstimate, totalEstimate, discount, coupons."),
    availability: FlexibleRecordSchema.optional().describe("Stock status, limits, restock date, and store message."),
    fulfillment: FlexibleRecordSchema.optional().describe("Shipping, pickup, digital delivery, destination, speed, carrier."),
    policy: FlexibleRecordSchema.optional().describe("Returns, warranty, restrictions, subscription terms, compliance notes."),
    rating: FlexibleRecordSchema.optional().describe("Rating value, scale, count, review summary."),
    evidence: FlexibleRecordSchema.optional().describe("Query, reason, confidence, sources, observed timestamps."),
  })
  .passthrough();

export const CheckoutSchema = z
  .object({
    provider: z.string().optional().describe("Checkout provider or merchant integration name."),
    locator: z.string().optional().describe("Provider-specific checkout locator."),
    supported: z.boolean().optional(),
    readiness: z.enum(["missing_locator", "needs_validation", "ready", "blocked", "unknown"]).optional(),
    orderId: z.string().optional(),
    lastCheckedAt: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();

export const CandidateDecisionSchema = z
  .object({
    rank: z.number().int().positive().optional(),
    score: z.number().min(0).max(1).optional(),
    rationale: z.string().optional(),
    tradeoffs: z.array(z.string()).optional(),
  })
  .passthrough();

export const CartItemSchema = z
  .object({
    id: z.string(),
    status: CandidateStatusSchema.default("candidate"),
    quantity: z.number().int().positive().default(1),
    product: ProductSnapshotSchema,
    checkout: CheckoutSchema.optional(),
    decision: CandidateDecisionSchema.optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    comparisonGroupId: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    extra: FlexibleRecordSchema.optional(),
  })
  .passthrough();

export const CartItemInputSchema = z
  .object({
    id: z.string().optional(),
    status: CandidateStatusSchema.optional(),
    quantity: z.number().int().positive().optional(),
    product: ProductSnapshotSchema,
    checkout: CheckoutSchema.optional(),
    decision: CandidateDecisionSchema.optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    comparisonGroupId: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    extra: FlexibleRecordSchema.optional(),
  })
  .passthrough();

export const BasketContextSchema = z
  .object({
    title: z.string().optional(),
    intent: z.string().optional().describe("User shopping/research intent."),
    buyer: z.string().optional(),
    locale: z.string().optional(),
    currency: z.string().min(3).max(3).optional(),
    destinationCountry: z.string().optional(),
    constraints: z.array(z.string()).optional(),
    targetStores: z.array(z.string()).optional(),
  })
  .passthrough();

export const BasketSchema = z
  .object({
    version: z.literal(1).default(1),
    id: z.string(),
    context: BasketContextSchema.default({}),
    items: z.array(CartItemSchema).default([]),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

export const BasketContextInputSchema = BasketContextSchema.extend({
  resetMissingFields: z.boolean().optional(),
}).passthrough();

export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;
export type ProductSnapshot = z.infer<typeof ProductSnapshotSchema>;
export type CheckoutState = z.infer<typeof CheckoutSchema>;
export type CartItem = z.infer<typeof CartItemSchema>;
export type CartItemInput = z.infer<typeof CartItemInputSchema>;
export type BasketContext = z.infer<typeof BasketContextSchema>;
export type BasketContextInput = z.infer<typeof BasketContextInputSchema>;
export type Basket = z.infer<typeof BasketSchema>;

export type Money = Record<string, unknown> & {
  amount?: number;
  currency?: string;
  display?: string;
};

export const BASKET_MODEL_FIELD_GUIDE = [
  "product.title, brand, category, condition, description",
  "product.merchant.name, domain, url, platform, sellerName",
  "product.identifiers.sourceUrl, canonicalUrl, sku, asin, gtin, variantId, productLocator",
  "product.price.current, list, discount, shipping, taxEstimate, totalEstimate",
  "product.availability.status, quantityAvailable, limitPerCustomer",
  "product.selectedOptions for size/color/storage/etc.",
  "product.fulfillment for shipping, pickup, digital delivery, and destination constraints",
  "product.policy for returns, warranty, restrictions, subscription terms",
  "product.evidence for query, sources, confidence, and why it matches the user intent",
  "checkout.provider, locator, supported, readiness before any real purchase",
] as const;
