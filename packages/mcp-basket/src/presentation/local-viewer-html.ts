import { LOCAL_VIEWER_CLIENT } from "./local-viewer-client.js";
import { LOCAL_VIEWER_STYLES } from "./local-viewer-styles.js";

type BasketViewerView = "research" | "searches" | "main-basket" | "source-page";

function escapeHtmlAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderBasketViewerHtml(options: { initialView?: BasketViewerView; initialSearchId?: string; initialSourceUrl?: string; initialSourceTitle?: string } = {}): string {
  const initialView = options.initialView === "main-basket" || options.initialView === "searches" || options.initialView === "source-page"
    ? options.initialView
    : "research";
  const researchViewHidden = initialView === "research" ? "" : " hidden";
  const searchesViewHidden = initialView === "searches" ? "" : " hidden";
  const mainBasketViewHidden = initialView === "main-basket" ? "" : " hidden";
  const sourcePageViewHidden = initialView === "source-page" ? "" : " hidden";
  const initialSearchId = options.initialSearchId ? ` data-initial-search-id="${escapeHtmlAttribute(options.initialSearchId)}"` : "";
  const initialSourceUrl = options.initialSourceUrl ? ` data-initial-source-url="${escapeHtmlAttribute(options.initialSourceUrl)}"` : "";
  const initialSourceTitle = options.initialSourceTitle ? ` data-initial-source-title="${escapeHtmlAttribute(options.initialSourceTitle)}"` : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f4f6f8">
  <title>MCPBasket</title>
  <style>${LOCAL_VIEWER_STYLES}</style>
</head>
<body data-initial-view="${initialView}"${initialSearchId}${initialSourceUrl}${initialSourceTitle}${initialView === "main-basket" ? ' class="is-main-basket"' : ""}>
  <div class="app-shell">
    <header class="app-header">
      <a class="brand" href="/" aria-label="MCPBasket home">
        <span class="brand-mark" aria-hidden="true">MB</span>
        <span class="brand-copy">
          <span class="brand-kicker">Local workspace</span>
          <strong>MCPBasket</strong>
        </span>
      </a>
      <div class="header-actions">
        <span class="sync-status" id="sync-status" role="status">Syncing</span>
        <button class="icon-button" id="refresh" type="button" title="Refresh basket" aria-label="Refresh basket">
          <span aria-hidden="true">&#8635;</span>
        </button>
        <a class="searches-nav" id="searches-link" href="/searches" title="Open saved searches" aria-label="Open saved searches">
          <span class="searches-nav-icon" aria-hidden="true">&#128269;</span>
          <span class="searches-nav-count" id="searches-count">0</span>
        </a>
        <a class="basket-nav" id="main-basket-link" href="/basket" title="Open main basket" aria-label="Open main basket">
          <span class="basket-nav-icon" aria-hidden="true">&#128722;</span>
          <span class="basket-nav-count" id="main-basket-count">0</span>
        </a>
      </div>
    </header>

    <main class="workspace">
      <section class="basket-overview" aria-labelledby="basket-title">
        <div class="overview-copy">
          <p class="eyebrow">Research basket</p>
          <h1 id="basket-title">Agent Basket</h1>
          <p class="intent" id="intent">Preparing the local research workspace.</p>
          <div class="context-chips" id="context-chips" aria-label="Basket context"></div>
          <form class="refinement-form" id="refinement-form">
            <div class="refinement-form-copy">
              <label for="refinement-prompt">Refine this research</label>
              <span id="refinement-status" role="status"></span>
            </div>
            <div class="refinement-form-controls">
              <input id="refinement-prompt" type="text" autocomplete="off" maxlength="10000" placeholder="Add criteria or change the direction">
              <button class="refinement-submit" id="refinement-submit" type="submit">Refine</button>
            </div>
          </form>
        </div>

        <dl class="summary-band" aria-label="Basket summary">
          <div class="metric">
            <dt>Options</dt>
            <dd id="stat-items">0</dd>
            <span id="stat-items-detail">No candidates yet</span>
          </div>
          <div class="metric">
            <dt>Shortlisted</dt>
            <dd id="stat-shortlisted">0</dd>
            <span id="stat-shortlisted-detail">Awaiting review</span>
          </div>
          <div class="metric">
            <dt>Approved</dt>
            <dd id="stat-approved">0</dd>
            <span id="stat-approved-detail">Nothing approved</span>
          </div>
          <div class="metric metric-total">
            <dt>Observed total</dt>
            <dd id="stat-total">-</dd>
            <span id="stat-total-detail">Across priced options</span>
          </div>
        </dl>
      </section>

      <section class="workspace-grid" id="research-view" aria-label="Basket review workspace"${researchViewHidden}>
        <section class="candidate-region" aria-labelledby="products-heading">
          <header class="region-header">
            <div>
              <p class="eyebrow">Research queue</p>
              <h2 id="products-heading">Products</h2>
              <p class="region-description" id="result-count">Loading candidates</p>
            </div>
            <div class="research-controls">
              <div class="history-nav" aria-label="Saved search navigation">
                <button class="icon-button" id="previous-search" type="button" title="Previous saved search" aria-label="Previous saved search">&#8592;</button>
                <label class="search-selector" for="saved-search">
                  <span class="sr-only">Saved search</span>
                  <select id="saved-search"></select>
                </label>
                <button class="icon-button" id="next-search" type="button" title="Next saved search" aria-label="Next saved search">&#8594;</button>
              </div>
              <label class="search-control" for="search">
                <span class="sr-only">Search products</span>
                <span class="search-icon" aria-hidden="true">&#9906;</span>
                <input id="search" type="search" autocomplete="off" placeholder="Search products">
              </label>
            </div>
          </header>

          <div class="list-toolbar">
            <div class="filter-tabs" role="tablist" aria-label="Filter basket products">
              <button class="filter-tab is-active" type="button" role="tab" aria-selected="true" data-filter="all">All <span id="filter-count-all">0</span></button>
              <button class="filter-tab" type="button" role="tab" aria-selected="false" data-filter="research">In research <span id="filter-count-research">0</span></button>
              <button class="filter-tab" type="button" role="tab" aria-selected="false" data-filter="shortlisted">Shortlisted <span id="filter-count-shortlisted">0</span></button>
              <button class="filter-tab" type="button" role="tab" aria-selected="false" data-filter="approved">Approved <span id="filter-count-approved">0</span></button>
            </div>
            <label class="sort-control" for="sort">
              <span>Sort</span>
              <select id="sort">
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="updated">Recently updated</option>
              </select>
            </label>
          </div>

          <div class="candidate-list" id="items" aria-live="polite"></div>
        </section>

        <aside class="inspector" aria-labelledby="review-heading">
          <div id="inspector-content">
            <p class="eyebrow">Candidate review</p>
            <h2 id="review-heading">Select a product</h2>
            <p class="inspector-empty">Choose an option to inspect its price, evidence, and checkout readiness.</p>
          </div>
        </aside>
      </section>

      <section class="searches-workspace" id="searches-view"${searchesViewHidden} aria-labelledby="searches-heading">
        <header class="searches-header">
          <div>
            <p class="eyebrow">Agent research archive</p>
            <h2 id="searches-heading">Saved searches</h2>
            <p class="region-description" id="searches-description">Every research response is preserved with its candidate list.</p>
          </div>
          <a class="back-to-research" href="/">Current research</a>
        </header>
        <dl class="searches-summary" aria-label="Saved searches summary">
          <div><dt>Searches</dt><dd id="searches-summary-count">0</dd></div>
          <div><dt>Captured products</dt><dd id="searches-summary-products">0</dd></div>
          <div><dt>Main basket</dt><dd id="searches-summary-basket">0</dd></div>
        </dl>
        <div class="searches-layout">
          <section class="searches-list" id="search-page-items" aria-live="polite"></section>
          <aside class="searches-sidebar">
            <p class="eyebrow">Selection</p>
            <h3>Main basket</h3>
            <p id="searches-sidebar-copy">Selected products from any saved research stay together here.</p>
            <a class="open-main-basket" href="/basket">Open main basket <span id="searches-sidebar-basket-count">0</span></a>
          </aside>
        </div>
      </section>

      <section class="source-page-workspace" id="source-page-view"${sourcePageViewHidden} aria-labelledby="source-page-title">
        <header class="source-page-header">
          <button class="back-to-research" type="button" data-action="go-back-source">Back</button>
          <span class="source-page-title" id="source-page-title">Product source</span>
        </header>
        <div class="source-page-frame-shell">
          <iframe id="source-page-frame" title="Product source" src="about:blank" sandbox="allow-forms allow-popups allow-scripts" referrerpolicy="no-referrer"></iframe>
        </div>
        <footer class="source-page-footer">
          <span>Original verified product source</span>
          <a class="source-link" id="source-page-external" href="#" target="_blank" rel="noreferrer">Open in browser &#8599;</a>
        </footer>
      </section>

      <section class="main-basket-workspace" id="main-basket-view"${mainBasketViewHidden} aria-labelledby="main-basket-heading">
        <header class="main-basket-header">
          <div>
            <p class="eyebrow">Persistent across research</p>
            <h2 id="main-basket-heading">Main basket</h2>
            <p class="region-description" id="main-basket-description">Products selected across every saved research session.</p>
          </div>
          <button class="back-to-research" type="button" data-action="go-back">Back</button>
        </header>
        <dl class="main-basket-summary" aria-label="Main basket summary">
          <div>
            <dt>Selected products</dt>
            <dd id="main-basket-product-count">0</dd>
          </div>
          <div>
            <dt>Research sessions</dt>
            <dd id="main-basket-search-count">0</dd>
          </div>
          <div>
            <dt>Merchants</dt>
            <dd id="main-basket-merchant-count">0</dd>
          </div>
          <div>
            <dt>Product total</dt>
            <dd id="main-basket-total">-</dd>
          </div>
        </dl>
        <div class="main-basket-layout">
          <section class="main-basket-list" id="main-basket-items" aria-live="polite"></section>
          <aside class="main-basket-sidebar">
            <section class="checkout-panel" aria-labelledby="checkout-heading">
              <p class="eyebrow">Checkout</p>
              <h3 id="checkout-heading">Ready when you are</h3>
              <p id="checkout-panel-detail">Select products from research to start a checkout.</p>
              <div class="checkout-panel-total" id="checkout-panel-total">-</div>
              <button class="checkout-button" id="desktop-checkout" type="button" data-action="checkout">Checkout with Crossmint</button>
              <p class="checkout-placeholder">Crossmint is not connected in this local MVP. No order or payment will be created.</p>
            </section>
            <section class="search-history" aria-labelledby="history-heading">
              <p class="eyebrow">Saved research</p>
              <h3 id="history-heading">Search history</h3>
              <div class="history-list" id="search-history"></div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  </div>
  <div class="mobile-checkout-bar" id="mobile-checkout" hidden>
    <div>
      <span id="mobile-checkout-count">0 products</span>
      <strong id="mobile-checkout-total">-</strong>
    </div>
    <button class="checkout-button" type="button" data-action="checkout">Checkout</button>
  </div>
  <div class="checkout-modal" id="checkout-modal" hidden role="dialog" aria-modal="true" aria-labelledby="checkout-modal-title">
    <div class="checkout-modal-card">
      <button class="modal-close" type="button" data-action="close-checkout" aria-label="Close checkout placeholder">&#215;</button>
      <p class="eyebrow">Crossmint checkout</p>
      <h2 id="checkout-modal-title">Checkout is not connected yet</h2>
      <p id="checkout-modal-copy">Your selected products remain in the local main basket. This placeholder will open Crossmint once the checkout integration and validation flow are configured.</p>
      <div class="checkout-modal-summary" id="checkout-modal-summary"></div>
      <button class="secondary-button" type="button" data-action="close-checkout">Back to main basket</button>
    </div>
  </div>
  <div class="source-modal" id="source-modal" hidden role="dialog" aria-modal="true" aria-labelledby="source-modal-title">
    <div class="source-modal-card">
      <header class="source-modal-header">
        <div>
          <p class="eyebrow">Product source</p>
          <h2 id="source-modal-title">Product page</h2>
        </div>
        <button class="modal-close" type="button" data-action="close-source" aria-label="Close product source">&#215;</button>
      </header>
      <div class="source-frame-shell">
        <iframe id="source-modal-frame" title="Product source" src="about:blank" sandbox="allow-forms allow-popups allow-scripts" referrerpolicy="no-referrer"></iframe>
      </div>
      <footer class="source-modal-footer">
        <span>Some stores block embedded product pages.</span>
        <a class="source-link" id="source-modal-external" href="#" target="_blank" rel="noreferrer">Open in browser &#8599;</a>
      </footer>
    </div>
  </div>
  <div class="product-modal" id="product-modal" hidden role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
    <div class="product-modal-card">
      <header class="product-modal-header">
        <p class="eyebrow">Product detail</p>
        <button class="modal-close" type="button" data-action="close-product" aria-label="Close product detail">&#215;</button>
      </header>
      <div class="product-modal-content" id="product-modal-content"></div>
    </div>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script>${LOCAL_VIEWER_CLIENT}</script>
</body>
</html>`;
}
