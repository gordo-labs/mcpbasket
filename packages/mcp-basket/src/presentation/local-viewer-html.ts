import { LOCAL_VIEWER_CLIENT } from "./local-viewer-client.js";
import { LOCAL_VIEWER_STYLES } from "./local-viewer-styles.js";

export function renderBasketViewerHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f4f6f8">
  <title>MCPBasket</title>
  <style>${LOCAL_VIEWER_STYLES}</style>
</head>
<body>
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

      <section class="workspace-grid" aria-label="Basket review workspace">
        <section class="candidate-region" aria-labelledby="products-heading">
          <header class="region-header">
            <div>
              <p class="eyebrow">Research queue</p>
              <h2 id="products-heading">Products</h2>
              <p class="region-description" id="result-count">Loading candidates</p>
            </div>
            <label class="search-control" for="search">
              <span class="sr-only">Search products</span>
              <span class="search-icon" aria-hidden="true">&#9906;</span>
              <input id="search" type="search" autocomplete="off" placeholder="Search products">
            </label>
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
    </main>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script>${LOCAL_VIEWER_CLIENT}</script>
</body>
</html>`;
}
