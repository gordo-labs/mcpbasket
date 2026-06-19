import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  BASKET_MODEL_FIELD_GUIDE,
  BasketContextInputSchema,
  CandidateStatusSchema,
  CartItemInputSchema,
  summarizeBasket,
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
    "Return local and hosted basket viewer URLs, API endpoints, and startup command",
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
