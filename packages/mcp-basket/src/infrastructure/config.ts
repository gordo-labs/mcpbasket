import path from "node:path";

const DEFAULT_PORT = 4377;
const DEFAULT_BASKET_DIR = ".mcpbasket";
const DEFAULT_BASKET_FILE = "basket.json";

export type BasketRuntimeConfig = {
  storePath: string;
  viewer: {
    port: number;
    host: string;
    url: string;
  };
  refinement: {
    hermesCommand?: string;
  };
};

export type BasketLinks = {
  viewerUrl: string;
  api: {
    basket: string;
    rawBasket: string;
    addItem: string;
  };
};

function parsePort(value: string | undefined): number {
  if (value == null || value.trim() === "") {
    return DEFAULT_PORT;
  }

  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("MCPBASKET_PORT must be an integer between 1 and 65535.");
  }

  return port;
}

export function resolveBasketRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): BasketRuntimeConfig {
  const port = parsePort(environment.MCPBASKET_PORT || environment.PORT);
  const storePath = path.resolve(
    environment.MCPBASKET_STORE_PATH || path.join(process.cwd(), DEFAULT_BASKET_DIR, DEFAULT_BASKET_FILE),
  );

  return {
    storePath,
    viewer: {
      port,
      host: environment.MCPBASKET_BIND_HOST || "127.0.0.1",
      url: environment.MCPBASKET_VIEWER_URL || `http://127.0.0.1:${port}`,
    },
    refinement: {
      hermesCommand: environment.MCPBASKET_REFINEMENT_HERMES_COMMAND?.trim() || undefined,
    },
  };
}

export function getBasketLinks(config: BasketRuntimeConfig): BasketLinks {
  const viewerUrl = config.viewer.url;
  const basketApiUrl = `${viewerUrl}/api/basket`;

  return {
    viewerUrl,
    api: {
      basket: basketApiUrl,
      rawBasket: `${viewerUrl}/api/basket/raw`,
      addItem: `${viewerUrl}/api/items`,
    },
  };
}
