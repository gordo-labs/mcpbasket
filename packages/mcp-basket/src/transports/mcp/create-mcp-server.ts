import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  BASKET_MODEL_FIELD_GUIDE,
  BasketContextInputSchema,
  CandidateStatusSchema,
  CartItemInputSchema,
  summarizeBasket,
  summarizeDecisionBasket,
} from "../../domain/index.js";
import type { BasketRuntime } from "../../runtime/index.js";

type McpTextResponse = {
  content: Array<{
    type: "text";
    text: string;
  }>;
};

type ToolInput = Record<string, unknown>;
type ToolRegistrar = (
  name: string,
  description: string,
  inputSchema: z.ZodRawShape,
  handler: (input: ToolInput) => Promise<McpTextResponse>,
) => void;

function textResponse(value: unknown): McpTextResponse {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

export function createMcpBasketServer(runtime: BasketRuntime): McpServer {
  const server = new McpServer({
    name: "mcpbasket",
    version: "0.1.0",
  });
  // The SDK has deeply generic tool overloads. Keep that complexity at the transport boundary.
  const registerTool = server.tool.bind(server) as ToolRegistrar;

  registerTool(
    "basket-set-context",
    "Set shopping or research context for the neutral pre-checkout basket",
    BasketContextInputSchema.shape,
    async (input) => {
      const basket = await runtime.service.setContext(BasketContextInputSchema.parse(input));
      return textResponse({
        basket: summarizeBasket(basket),
        storePath: runtime.service.path(),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-upsert-product",
    "Add or update a product candidate in the neutral pre-checkout basket. Capture its direct product URL and primary image when available.",
    {
      item: CartItemInputSchema.describe(
        "Universal product candidate with product, price, merchant, direct source URL, product image, evidence, and checkout fields.",
      ),
    },
    async (input) => {
      const { item } = z.object({ item: CartItemInputSchema }).parse(input);
      const result = await runtime.service.upsertItem(item);
      return textResponse({
        created: result.created,
        item: result.item,
        basket: summarizeBasket(result.basket),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-list-products",
    "List product candidates currently stored in the pre-checkout basket",
    {
      includeRaw: z.boolean().optional().describe("Return full raw basket data instead of compact UI summary."),
    },
    async (input) => {
      const { includeRaw } = z.object({ includeRaw: z.boolean().optional() }).parse(input);
      const basket = await runtime.service.load();
      return textResponse({
        basket: includeRaw ? basket : summarizeBasket(basket),
        storePath: runtime.service.path(),
        modelFields: includeRaw ? BASKET_MODEL_FIELD_GUIDE : undefined,
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-update-status",
    "Update a product candidate status without changing the product snapshot",
    {
      id: z.string().describe("Basket item id."),
      status: CandidateStatusSchema.describe("New candidate status."),
    },
    async (input) => {
      const { id, status } = z.object({ id: z.string(), status: CandidateStatusSchema }).parse(input);
      const item = await runtime.service.updateStatus(id, status);
      if (item == null) {
        return textResponse({ error: "Item not found", id });
      }

      return textResponse({
        item,
        basket: summarizeBasket(await runtime.service.load()),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-add-to-decision-basket",
    "Save an explicitly user-approved product as a durable final decision. It remains across future searches and does not create an order.",
    {
      itemId: z.string().describe("Research basket item id to save as a final decision."),
      searchId: z.string().optional().describe("Saved research id. Defaults to the active search."),
      confirm: z.boolean().describe("Must be true after the user explicitly selects this product for the permanent decision basket."),
    },
    async (input) => {
      const { itemId, searchId, confirm } = z.object({ itemId: z.string(), searchId: z.string().optional(), confirm: z.boolean() }).parse(input);
      if (confirm !== true) {
        return textResponse({ error: "confirm must be true to save a final decision" });
      }
      const result = await runtime.service.addToDecisionBasket(itemId, searchId);
      if (result == null) {
        return textResponse({ error: "Item not found", itemId });
      }
      return textResponse({
        created: result.created,
        decision: result.item,
        decisions: summarizeDecisionBasket(result.basket.decisionBasket),
        basket: summarizeBasket(result.basket),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-list-decision-basket",
    "List the durable final purchase decisions and the search history that produced them",
    { includeRaw: z.boolean().optional().describe("Return stored decision and search records instead of the compact summary.") },
    async (input) => {
      const { includeRaw } = z.object({ includeRaw: z.boolean().optional() }).parse(input);
      const basket = await runtime.service.load();
      return textResponse({
        decisions: includeRaw ? basket.decisionBasket : summarizeDecisionBasket(basket.decisionBasket),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-list-refinement-requests",
    "List queued, dispatched, or in-progress refinements created from saved research. Use this to recover a refinement after an interrupted agent run.",
    {
      includeCompleted: z.boolean().optional().describe("Include completed and failed refinement records."),
    },
    async (input) => {
      const { includeCompleted } = z.object({ includeCompleted: z.boolean().optional() }).parse(input);
      const basket = await runtime.service.load();
      const requests = (basket.decisionBasket?.refinementRequests || [])
        .filter((request) => includeCompleted === true || !["completed", "failed"].includes(request.status))
        .map((request) => ({
          id: request.id,
          searchId: request.searchId,
          prompt: request.prompt,
          status: request.status,
          refinedSearchId: request.refinedSearchId,
          summary: request.summary,
          error: request.error,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
        }));
      return textResponse({ requests, ...runtime.links });
    },
  );

  registerTool(
    "basket-get-refinement-request",
    "Load a saved search-refinement request, including its immutable source-search snapshot and the user's added refinement prompt. Calling this marks the request in progress.",
    { id: z.string().describe("Refinement request id supplied by the local viewer or basket-list-refinement-requests.") },
    async (input) => {
      const { id } = z.object({ id: z.string() }).parse(input);
      const result = await runtime.service.getSearchRefinementRequest(id);
      if (result == null) {
        return textResponse({ error: "Refinement request not found or already completed", id });
      }
      return textResponse({
        request: result.request,
        sourceSearch: result.request.searchSnapshot,
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-complete-refinement-request",
    "Mark a saved search refinement complete only after the new, linked research session and its validated candidates are recorded.",
    {
      id: z.string().describe("Refinement request id."),
      summary: z.string().max(2_000).describe("Short account of the refined research that was recorded."),
      refinedSearchId: z.string().optional().describe("New saved search id created with basket-set-context."),
    },
    async (input) => {
      const { id, summary, refinedSearchId } = z.object({
        id: z.string(),
        summary: z.string().max(2_000),
        refinedSearchId: z.string().optional(),
      }).parse(input);
      const result = await runtime.service.completeSearchRefinementRequest(id, summary, refinedSearchId);
      if (result == null) {
        return textResponse({ error: "Refinement request not found", id });
      }
      return textResponse({ refinement: result.request, basket: summarizeBasket(result.basket), ...runtime.links });
    },
  );

  registerTool(
    "basket-remove-from-decision-basket",
    "Remove a product from the durable final decision basket without deleting its research candidate",
    { id: z.string().describe("Permanent decision id.") },
    async (input) => {
      const { id } = z.object({ id: z.string() }).parse(input);
      const result = await runtime.service.removeFromDecisionBasket(id);
      return textResponse({
        removed: result.removed,
        decisions: summarizeDecisionBasket(result.basket.decisionBasket),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-remove-product",
    "Remove a product candidate from the pre-checkout basket",
    { id: z.string().describe("Basket item id.") },
    async (input) => {
      const { id } = z.object({ id: z.string() }).parse(input);
      const removed = await runtime.service.removeItem(id);
      return textResponse({
        removed,
        basket: summarizeBasket(await runtime.service.load()),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-clear",
    "Clear all product candidates from the pre-checkout basket",
    { confirm: z.boolean().describe("Must be true to clear the basket.") },
    async (input) => {
      const { confirm } = z.object({ confirm: z.boolean() }).parse(input);
      if (confirm !== true) {
        return textResponse({ error: "confirm must be true" });
      }

      return textResponse({
        basket: summarizeBasket(await runtime.service.clear()),
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-get-viewer",
    "Return the local basket viewer URL, API endpoints, and startup command",
    {},
    async () => {
      return textResponse({
        storePath: runtime.service.path(),
        command: "npm run viewer",
        ...runtime.links,
      });
    },
  );

  registerTool(
    "basket-export-checkout-line-items",
    "Export approved basket candidates as generic checkout line items when locators are available. This tool does not create an order.",
    {
      itemIds: z.array(z.string()).optional().describe("Optional item ids. Defaults to approved or ready_for_checkout items."),
    },
    async (input) => {
      const { itemIds } = z.object({ itemIds: z.array(z.string()).optional() }).parse(input);
      return textResponse(await runtime.service.exportCheckoutLineItems(itemIds));
    },
  );

  return server;
}
