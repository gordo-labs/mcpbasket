import path from "node:path";

const DEFAULT_PORT = 4377;
const DEFAULT_BASKET_DIR = ".mcpbasket";
const DEFAULT_BASKET_FILE = "basket.json";

export type BasketRuntimeConfig = {
  storePath: string;
  viewer: {
    port: number;
    host: string;
    publicUrl: string;
    hostedViewerUrl?: string;
  };
};

export type BasketLinks = {
  viewerUrl: string;
  hostedViewerUrl?: string;
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

function normalizeBaseUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("MCPBasket viewer URLs must use http or https.");
  }
  return url.toString().replace(/\/$/, "");
}

export function resolveBasketRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): BasketRuntimeConfig {
  const port = parsePort(environment.MCPBASKET_PORT || environment.PORT);
  const publicUrl = normalizeBaseUrl(environment.MCPBASKET_PUBLIC_HOST || `http://localhost:${port}`);
  const storePath = path.resolve(
    environment.MCPBASKET_STORE_PATH || path.join(process.cwd(), DEFAULT_BASKET_DIR, DEFAULT_BASKET_FILE),
  );

  return {
    storePath,
    viewer: {
      port,
      host: environment.MCPBASKET_BIND_HOST || "127.0.0.1",
      publicUrl,
      hostedViewerUrl: environment.MCPBASKET_HOSTED_VIEWER_URL
        ? normalizeBaseUrl(environment.MCPBASKET_HOSTED_VIEWER_URL)
        : undefined,
    },
  };
}

export function getBasketLinks(config: BasketRuntimeConfig): BasketLinks {
  const viewerUrl = config.viewer.publicUrl;
  const basketApiUrl = `${viewerUrl}/api/basket`;
  const hostedViewerUrl = config.viewer.hostedViewerUrl
    ? withBasketSource(config.viewer.hostedViewerUrl, basketApiUrl)
    : undefined;

  return {
    viewerUrl,
    hostedViewerUrl,
    api: {
      basket: basketApiUrl,
      rawBasket: `${viewerUrl}/api/basket/raw`,
      addItem: `${viewerUrl}/api/items`,
    },
  };
}

function withBasketSource(viewerUrl: string, sourceUrl: string): string {
  const url = new URL(viewerUrl);
  if (!url.searchParams.has("source")) {
    url.searchParams.set("source", sourceUrl);
  }
  return url.toString();
}
