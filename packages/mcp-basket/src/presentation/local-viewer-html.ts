import { LOCAL_VIEWER_CLIENT } from "./local-viewer-client.js";
import { LOCAL_VIEWER_STYLES } from "./local-viewer-styles.js";

export function renderBasketViewerHtml(options: { initialView?: "research" | "main-basket" } = {}): string {
  const initialView = options.initialView === "main-basket" ? "main-basket" : "research";
  const researchViewHidden = initialView === "main-basket" ? " hidden" : "";
  const mainBasketViewHidden = initialView === "research" ? " hidden" : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f4f6f8">
  <title>MCPBasket</title>
  <style>${LOCAL_VIEWER_STYLES}</style>
</head>
<body data-initial-view="${initialView}"${initialView === "main-basket" ? ' class="is-main-basket"' : ""}>
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

      <section class="main-basket-workspace" id="main-basket-view"${mainBasketViewHidden} aria-labelledby="main-basket-heading">
        <header class="main-basket-header">
          <div>
            <p class="eyebrow">Persistent across research</p>
            <h2 id="main-basket-heading">Main basket</h2>
            <p class="region-description" id="main-basket-description">Products selected across every saved research session.</p>
          </div>
          <a class="back-to-research" href="/">Back to research</a>
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
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script>${LOCAL_VIEWER_CLIENT}</script>
</body>
</html>`;
}
