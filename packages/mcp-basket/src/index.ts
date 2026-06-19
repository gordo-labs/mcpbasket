#!/usr/bin/env node

import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  BasketStore,
  getBasketApiUrl,
  getHostedBasketViewerUrl,
  getBasketViewerUrl,
  resolveBasketStorePath,
  resolveBasketViewerPort,
  summarizeBasket,
} from "./basket/store.js";
import {
  BASKET_MODEL_FIELD_GUIDE,
  BasketContextInputSchema,
  CandidateStatusSchema,
  CartItemInputSchema,
} from "./basket/schema.js";

dotenv.config();

const basketStore = new BasketStore();
const basketContextToolShape = BasketContextInputSchema.shape as Record<string, z.ZodTypeAny>;
const cartItemInputToolSchema = (CartItemInputSchema as z.ZodTypeAny).describe(
  "Universal cart product candidate with product, price, merchant, evidence, and checkout fields."
);
const candidateStatusToolSchema = CandidateStatusSchema as z.ZodTypeAny;

const server = new McpServer({
  name: "mcpbasket",
  version: "0.1.0",
});
const registerTool = server.tool.bind(server) as (...args: any[]) => void;

function textResponse(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function basketLinks(port = resolveBasketViewerPort()) {
  return {
    viewerUrl: getBasketViewerUrl(port),
    hostedViewerUrl: getHostedBasketViewerUrl(port),
    api: {
      basket: getBasketApiUrl(port),
      rawBasket: `${getBasketViewerUrl(port)}/api/basket/raw`,
      addItem: `${getBasketViewerUrl(port)}/api/items`,
    },
  };
}

registerTool(
  "basket-set-context",
  "Set shopping or research context for the neutral pre-checkout basket",
  basketContextToolShape,
  async (input: any) => {
    const basket = await basketStore.setContext(input);
    return textResponse({
      basket: summarizeBasket(basket),
      storePath: basketStore.path(),
      ...basketLinks(),
    });
  }
);

registerTool(
  "basket-upsert-product",
  "Add or update a product candidate in the neutral pre-checkout basket",
  {
    item: cartItemInputToolSchema,
  },
  async ({ item }: any) => {
    const result = await basketStore.upsertItem(item);
    return textResponse({
      created: result.created,
      item: result.item,
      basket: summarizeBasket(result.basket),
      ...basketLinks(),
    });
  }
);

registerTool(
  "basket-list-products",
  "List product candidates currently stored in the pre-checkout basket",
  {
    includeRaw: z.boolean().optional().describe("Return full raw basket data instead of compact UI summary."),
  },
  async ({ includeRaw }: any) => {
    const basket = await basketStore.load();
    return textResponse({
      basket: includeRaw ? basket : summarizeBasket(basket),
      storePath: basketStore.path(),
      modelFields: includeRaw ? BASKET_MODEL_FIELD_GUIDE : undefined,
      ...basketLinks(),
    });
  }
);

registerTool(
  "basket-update-status",
  "Update a product candidate status without changing the product snapshot",
  {
    id: z.string().describe("Basket item id."),
    status: candidateStatusToolSchema.describe("New candidate status."),
  },
  async ({ id, status }: any) => {
    const item = await basketStore.updateStatus(id, status);
    if (item == null) {
      return textResponse({ error: "Item not found", id });
    }
    return textResponse({
      item,
      basket: summarizeBasket(await basketStore.load()),
      ...basketLinks(),
    });
  }
);

registerTool(
  "basket-remove-product",
  "Remove a product candidate from the pre-checkout basket",
  {
    id: z.string().describe("Basket item id."),
  },
  async ({ id }: any) => {
    const removed = await basketStore.removeItem(id);
    return textResponse({
      removed,
      basket: summarizeBasket(await basketStore.load()),
      ...basketLinks(),
    });
  }
);

registerTool(
  "basket-clear",
  "Clear all product candidates from the pre-checkout basket",
  {
    confirm: z.boolean().describe("Must be true to clear the basket."),
  },
  async ({ confirm }: any) => {
    if (confirm !== true) {
      return textResponse({ error: "confirm must be true" });
    }
    return textResponse({
      basket: summarizeBasket(await basketStore.clear()),
      ...basketLinks(),
    });
  }
);

registerTool(
  "basket-get-viewer",
  "Return local and hosted basket viewer URLs, API endpoints, and startup command",
  {},
  async () => {
    const port = resolveBasketViewerPort();
    return textResponse({
      storePath: resolveBasketStorePath(),
      command: "npm run viewer",
      ...basketLinks(port),
    });
  }
);

registerTool(
  "basket-export-checkout-line-items",
  "Export approved basket candidates as generic checkout line items when locators are available. This tool does not create an order.",
  {
    itemIds: z.array(z.string()).optional().describe("Optional item ids. Defaults to approved or ready_for_checkout items."),
  },
  async ({ itemIds }: any) => {
    return textResponse(await basketStore.exportCheckoutLineItems(itemIds));
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
