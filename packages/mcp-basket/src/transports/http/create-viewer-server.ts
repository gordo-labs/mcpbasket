import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { z } from "zod";
import {
  BASKET_MODEL_FIELD_GUIDE,
  BasketContextInputSchema,
  CandidateStatusSchema,
  CartItemInputSchema,
  summarizeBasket,
  summarizeDecisionBasket,
} from "../../domain/index.js";
import { createBasketRuntime, type BasketRuntime } from "../../runtime/index.js";
import { renderBasketViewerHtml } from "../../presentation/local-viewer-html.js";

const MAX_REQUEST_BODY_BYTES = 1_000_000;

class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

function setBaseHeaders(response: ServerResponse): void {
  response.setHeader("Cache-Control", "no-store");
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  setBaseHeaders(response);
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

function sendHtml(
  response: ServerResponse,
  initialView: "research" | "searches" | "main-basket" | "product-detail" = "research",
  initialSearchId?: string,
  initialProductId?: string,
): void {
  setBaseHeaders(response);
  response.statusCode = 200;
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.end(renderBasketViewerHtml({ initialView, initialSearchId, initialProductId }));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_REQUEST_BODY_BYTES) {
      throw new HttpError(413, "Request body exceeds the 1 MB limit.");
    }
    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  try {
    return raw.length === 0 ? {} : JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Request body must be valid JSON.");
  }
}

function itemIdFromPath(pathname: string, suffix = ""): string | null {
  const prefix = "/api/items/";
  if (!pathname.startsWith(prefix) || !pathname.endsWith(suffix)) {
    return null;
  }

  const candidate = pathname.slice(prefix.length, suffix.length > 0 ? -suffix.length : undefined);
  return candidate.length > 0 ? decodeURIComponent(candidate) : null;
}

function errorStatus(error: unknown): number {
  if (error instanceof HttpError) {
    return error.statusCode;
  }
  if (typeof error === "object" && error != null && "issues" in error) {
    return 422;
  }
  return 500;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected server error.";
}

export async function createBasketViewerServer(
  runtime: BasketRuntime = createBasketRuntime(),
): Promise<Server> {
  await runtime.service.load();

  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const pathname = url.pathname;

      if (request.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
        const searchId = url.searchParams.get("search") || undefined;
        const productId = url.searchParams.get("product") || undefined;
        sendHtml(response, productId ? "product-detail" : "research", searchId, productId);
        return;
      }

      if (request.method === "GET" && pathname === "/searches") {
        sendHtml(response, "searches");
        return;
      }

      if (request.method === "GET" && pathname === "/basket") {
        sendHtml(response, "main-basket");
        return;
      }

      if (request.method === "GET" && pathname === "/health") {
        sendJson(response, 200, {
          ok: true,
          viewerUrl: runtime.links.viewerUrl,
          storePath: runtime.service.path(),
        });
        return;
      }

      if (request.method === "GET" && pathname === "/api/model") {
        sendJson(response, 200, { fields: BASKET_MODEL_FIELD_GUIDE });
        return;
      }

      if (request.method === "GET" && pathname === "/api/basket") {
        sendJson(response, 200, summarizeBasket(await runtime.service.load()));
        return;
      }

      if (request.method === "GET" && pathname === "/api/basket/raw") {
        sendJson(response, 200, await runtime.service.load());
        return;
      }

      if (request.method === "GET" && pathname === "/api/decisions") {
        sendJson(response, 200, summarizeDecisionBasket((await runtime.service.load()).decisionBasket));
        return;
      }

      if (request.method === "POST" && pathname === "/api/context") {
        const input = BasketContextInputSchema.parse(await readJson(request));
        sendJson(response, 200, summarizeBasket(await runtime.service.setContext(input)));
        return;
      }

      if (request.method === "POST" && pathname === "/api/items") {
        const body = await readJson(request);
        const input = CartItemInputSchema.parse(
          typeof body === "object" && body != null && "item" in body
            ? (body as { item: unknown }).item
            : body,
        );
        const result = await runtime.service.upsertItem(input);
        sendJson(response, result.created ? 201 : 200, {
          item: result.item,
          basket: summarizeBasket(result.basket),
        });
        return;
      }

      if (request.method === "POST" && pathname === "/api/decisions") {
        const body = await readJson(request);
        if ((body as { confirm?: boolean }).confirm !== true) {
          throw new HttpError(400, "confirm must be true to save a final decision");
        }
        const { itemId, searchId } = z.object({ itemId: z.string(), searchId: z.string().optional() }).parse(body);
        const result = await runtime.service.addToDecisionBasket(itemId, searchId);
        if (result == null) {
          sendJson(response, 404, { error: "Item not found" });
          return;
        }
        sendJson(response, result.created ? 201 : 200, {
          decision: result.item,
          decisions: summarizeDecisionBasket(result.basket.decisionBasket),
          basket: summarizeBasket(result.basket),
        });
        return;
      }

      const statusItemId = itemIdFromPath(pathname, "/status");
      if (request.method === "POST" && statusItemId != null) {
        const body = await readJson(request);
        const status = CandidateStatusSchema.parse((body as { status?: unknown }).status);
        const item = await runtime.service.updateStatus(statusItemId, status);
        if (item == null) {
          sendJson(response, 404, { error: "Item not found" });
          return;
        }

        sendJson(response, 200, { item, basket: summarizeBasket(await runtime.service.load()) });
        return;
      }

      const deleteItemId = itemIdFromPath(pathname);
      if (request.method === "DELETE" && deleteItemId != null) {
        const removed = await runtime.service.removeItem(deleteItemId);
        sendJson(response, removed ? 200 : 404, {
          removed,
          basket: summarizeBasket(await runtime.service.load()),
        });
        return;
      }

      const decisionId = pathname.startsWith("/api/decisions/") ? decodeURIComponent(pathname.slice("/api/decisions/".length)) : null;
      if (request.method === "DELETE" && decisionId != null && decisionId.length > 0) {
        const result = await runtime.service.removeFromDecisionBasket(decisionId);
        sendJson(response, result.removed ? 200 : 404, {
          removed: result.removed,
          decisions: summarizeDecisionBasket(result.basket.decisionBasket),
        });
        return;
      }

      if (request.method === "POST" && pathname === "/api/clear") {
        const body = await readJson(request);
        if ((body as { confirm?: boolean }).confirm !== true) {
          throw new HttpError(400, "confirm must be true");
        }
        sendJson(response, 200, summarizeBasket(await runtime.service.clear()));
        return;
      }

      sendJson(response, 404, { error: "Not found" });
    } catch (error) {
      sendJson(response, errorStatus(error), { error: errorMessage(error) });
    }
  });
}

export async function startBasketViewer(options: {
  port?: number;
  runtime?: BasketRuntime;
} = {}): Promise<Server> {
  const runtime = options.runtime || createBasketRuntime();
  const server = await createBasketViewerServer(runtime);
  const port = options.port ?? runtime.config.viewer.port;

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, runtime.config.viewer.host, () => {
      server.off("error", reject);
      resolve(server);
    });
  });
}
