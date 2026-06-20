export const LOCAL_VIEWER_STYLES = String.raw`
  :root {
    color-scheme: light;
    --canvas: #f4f6f8;
    --paper: #ffffff;
    --ink: #15181f;
    --muted: #667085;
    --faint: #98a2b3;
    --line: #dfe3e8;
    --line-strong: #c8ced7;
    --teal: #087a73;
    --teal-dark: #075d58;
    --teal-soft: #e4f5f3;
    --blue: #2969c7;
    --blue-soft: #e9f0ff;
    --amber: #a85a00;
    --amber-soft: #fff2df;
    --red: #b42318;
    --red-soft: #fff0ee;
    --green: #147a45;
    --green-soft: #e9f8ee;
    --shadow: 0 12px 28px rgba(28, 39, 55, 0.06);
  }

  * { box-sizing: border-box; }
  [hidden] { display: none !important; }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background: var(--canvas);
    color: var(--ink);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: 0;
  }

  button, input, select { font: inherit; }
  button, select { cursor: pointer; }
  button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible {
    outline: 3px solid rgba(41, 105, 199, 0.28);
    outline-offset: 2px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .app-shell { min-height: 100vh; }

  .app-header {
    min-height: 68px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 0 32px;
    background: var(--paper);
    border-bottom: 1px solid var(--line);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: inherit;
    text-decoration: none;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 7px;
    background: var(--teal);
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
  }

  .brand-copy { display: grid; gap: 1px; }
  .brand-copy strong { font-size: 15px; line-height: 1.2; }
  .brand-kicker, .eyebrow {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .header-actions { display: inline-flex; align-items: center; gap: 12px; }
  .sync-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
  }
  .sync-status::before {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--faint);
    content: "";
  }
  .sync-status.is-fresh::before { background: var(--green); }
  .sync-status.is-error::before { background: var(--red); }

  .icon-button {
    display: inline-grid;
    place-items: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
    color: var(--ink);
    font-size: 18px;
    line-height: 1;
  }
  .icon-button:hover { border-color: var(--line-strong); background: #f8fafb; }

  .basket-nav, .searches-nav {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
  }
  .basket-nav:hover, .searches-nav:hover { border-color: #94c9c4; background: var(--teal-soft); color: var(--teal-dark); }
  .basket-nav.is-active, .searches-nav.is-active { border-color: var(--teal); background: var(--teal); color: #ffffff; }
  .basket-nav-icon, .searches-nav-icon { font-size: 17px; line-height: 1; }
  .basket-nav-count, .searches-nav-count {
    position: absolute;
    top: -7px;
    right: -7px;
    display: grid;
    place-items: center;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border: 2px solid var(--paper);
    border-radius: 999px;
    background: var(--teal-dark);
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    line-height: 1;
  }
  .basket-nav.is-active .basket-nav-count, .searches-nav.is-active .searches-nav-count { border-color: var(--teal); background: #ffffff; color: var(--teal-dark); }

  .workspace { max-width: 1440px; margin: 0 auto; padding: 0 32px 48px; }

  .basket-overview {
    padding: 36px 0 0;
    border-bottom: 1px solid var(--line);
  }

  .overview-copy { max-width: 860px; }
  h1, h2, h3, p { overflow-wrap: anywhere; }
  h1 {
    margin: 7px 0 0;
    max-width: 980px;
    color: var(--ink);
    font-size: 32px;
    font-weight: 760;
    line-height: 1.12;
  }
  .intent {
    margin: 12px 0 0;
    max-width: 800px;
    color: var(--muted);
    font-size: 15px;
    line-height: 1.55;
  }

  .context-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 17px;
  }
  .context-chip {
    display: inline-flex;
    align-items: center;
    min-height: 26px;
    padding: 0 9px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: var(--paper);
    color: #475467;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.2;
  }
  .context-chip.is-priority { border-color: #b9dcd8; background: var(--teal-soft); color: var(--teal-dark); }

  .summary-band {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 32px 0 0;
    padding: 0;
    background: var(--paper);
    border: 1px solid var(--line);
    border-bottom: 0;
  }
  .metric {
    min-width: 0;
    padding: 18px 20px 16px;
    border-right: 1px solid var(--line);
  }
  .metric:last-child { border-right: 0; }
  .metric dt {
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
  }
  .metric dd {
    margin: 9px 0 4px;
    color: var(--ink);
    font-size: 24px;
    font-weight: 760;
    line-height: 1;
    white-space: nowrap;
  }
  .metric span { color: var(--muted); font-size: 12px; line-height: 1.25; }
  .metric-total dd { color: var(--teal-dark); }

  .workspace-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 390px);
    gap: 34px;
    padding-top: 30px;
  }

  .is-main-basket .basket-overview, .is-searches .basket-overview { display: none; }
  .searches-workspace { padding-top: 38px; }
  .searches-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--line);
  }
  .searches-header h2 { margin: 6px 0 0; font-size: 26px; line-height: 1.2; }
  .searches-summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-width: 760px;
    margin: 22px 0 0;
    padding: 0;
    border: 1px solid var(--line);
    background: var(--paper);
  }
  .searches-summary div { min-width: 0; padding: 15px 17px; border-right: 1px solid var(--line); }
  .searches-summary div:last-child { border-right: 0; }
  .searches-summary dt { color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .searches-summary dd { margin: 8px 0 0; color: var(--ink); font-size: 20px; font-weight: 780; line-height: 1.1; }
  .searches-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 34px;
    padding-top: 24px;
  }
  .searches-list { display: grid; align-content: start; gap: 10px; }
  .search-page-entry {
    display: grid;
    grid-template-columns: 104px minmax(0, 1fr) minmax(128px, auto) 18px;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
    color: inherit;
    text-align: left;
  }
  .search-page-entry:hover { border-color: #aebbc5; box-shadow: var(--shadow); }
  .search-page-entry-date { color: var(--teal-dark); font-size: 12px; font-weight: 760; line-height: 1.35; }
  .search-page-entry-copy { display: grid; min-width: 0; gap: 5px; }
  .search-page-entry-copy strong { color: var(--ink); font-size: 15px; line-height: 1.3; }
  .search-page-entry-copy span { color: var(--muted); font-size: 12px; line-height: 1.4; }
  .search-page-entry-meta { display: grid; justify-items: end; gap: 4px; color: var(--muted); font-size: 11px; font-weight: 700; line-height: 1.25; text-align: right; }
  .search-page-entry-arrow { color: var(--teal-dark); font-size: 18px; }
  .searches-sidebar { align-self: start; padding: 18px; border: 1px solid var(--line); border-radius: 7px; background: var(--paper); }
  .searches-sidebar h3 { margin: 6px 0 0; color: var(--ink); font-size: 18px; line-height: 1.2; }
  .searches-sidebar p { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.45; }
  .open-main-basket { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 40px; margin-top: 18px; padding: 0 10px; border: 1px solid #b9dcd8; border-radius: 5px; background: var(--teal-soft); color: var(--teal-dark); font-size: 12px; font-weight: 780; text-decoration: none; }
  .open-main-basket:hover { border-color: var(--teal); background: #d7f0ed; }
  .open-main-basket span { display: inline-grid; place-items: center; min-width: 23px; height: 23px; padding: 0 6px; border-radius: 999px; background: #ffffff; font-size: 11px; }
  .main-basket-workspace { padding-top: 38px; }
  .main-basket-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--line);
  }
  .main-basket-header h2 { margin: 6px 0 0; font-size: 26px; line-height: 1.2; }
  .back-to-research {
    min-height: 32px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--teal-dark);
    font-size: 13px;
    font-weight: 750;
    text-decoration: none;
    white-space: nowrap;
  }
  .back-to-research:hover { color: var(--teal); text-decoration: underline; }
  .main-basket-summary {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    margin: 22px 0 0;
    padding: 0;
    border: 1px solid var(--line);
    background: var(--paper);
  }
  .main-basket-summary div { min-width: 0; padding: 15px 17px; border-right: 1px solid var(--line); }
  .main-basket-summary div:last-child { border-right: 0; }
  .main-basket-summary dt { color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .main-basket-summary dd { margin: 8px 0 0; color: var(--ink); font-size: 20px; font-weight: 780; line-height: 1.1; white-space: nowrap; }
  .main-basket-summary div:last-child dd { color: var(--teal-dark); }
  .main-basket-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 316px;
    gap: 34px;
    padding-top: 22px;
  }
  .main-basket-list { display: grid; align-content: start; gap: 10px; }
  .main-basket-item {
    display: grid;
    grid-template-columns: 70px minmax(0, 1fr) minmax(118px, auto);
    gap: 13px;
    align-items: center;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
  }
  .main-basket-item:hover { border-color: #bbc4ce; box-shadow: var(--shadow); }
  .main-basket-item .candidate-visual { width: 70px; height: 78px; margin: 0; }
  .main-basket-item h3 { margin: 0; font-size: 15px; line-height: 1.3; }
  .main-basket-item p { margin: 4px 0 0; color: var(--muted); font-size: 12px; line-height: 1.35; }
  .main-basket-item-meta { display: block; margin-top: 8px; color: var(--faint); font-size: 11px; line-height: 1.35; }
  .main-basket-item-side { display: grid; justify-items: end; gap: 9px; text-align: right; }
  .main-basket-item-price { color: var(--ink); font-size: 16px; font-weight: 780; }
  .main-basket-item-actions { display: flex; align-items: center; gap: 9px; }
  .main-basket-item-actions .remove-button { min-height: 30px; }
  .main-basket-sidebar { min-width: 0; }
  .checkout-panel {
    position: sticky;
    top: 24px;
    padding: 18px;
    border: 1px solid #b9dcd8;
    border-radius: 7px;
    background: #f4fbfa;
  }
  .checkout-panel h3 { margin: 6px 0 0; color: var(--ink); font-size: 18px; line-height: 1.2; }
  .checkout-panel p { margin: 9px 0 0; color: #475467; font-size: 13px; line-height: 1.45; }
  .checkout-panel-total { margin: 19px 0 15px; color: var(--teal-dark); font-size: 25px; font-weight: 790; line-height: 1.1; }
  .checkout-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 42px;
    padding: 0 13px;
    border: 1px solid var(--teal);
    border-radius: 6px;
    background: var(--teal);
    color: #ffffff;
    font-size: 13px;
    font-weight: 780;
  }
  .checkout-button:hover:not(:disabled) { border-color: var(--teal-dark); background: var(--teal-dark); }
  .checkout-button:disabled { cursor: not-allowed; opacity: 0.48; }
  .checkout-placeholder { padding-top: 13px; border-top: 1px solid #cfe8e5; color: var(--muted) !important; font-size: 11px !important; }
  .search-history { min-width: 0; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--line); }
  .search-history h3 { margin: 6px 0 0; font-size: 18px; line-height: 1.2; }
  .history-list { display: grid; gap: 0; margin-top: 16px; }
  .history-entry {
    display: block;
    width: 100%;
    padding: 13px 0;
    border: 0;
    border-bottom: 1px solid var(--line);
    background: transparent;
    color: inherit;
    text-align: left;
  }
  .history-entry:first-child { padding-top: 0; }
  .history-entry:hover strong { color: var(--teal-dark); }
  .history-entry strong { display: block; color: var(--ink); font-size: 13px; line-height: 1.35; }
  .history-entry p { margin: 5px 0 0; color: var(--muted); font-size: 12px; line-height: 1.42; }
  .history-entry span { display: block; margin-top: 7px; color: var(--faint); font-size: 11px; }

  .candidate-region { min-width: 0; }
  .region-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
  }
  .region-header h2, .inspector h2 {
    margin: 6px 0 0;
    color: var(--ink);
    font-size: 20px;
    font-weight: 750;
    line-height: 1.2;
  }
  .region-description { margin: 7px 0 0; color: var(--muted); font-size: 13px; line-height: 1.4; }

  .research-controls { display: flex; align-items: center; gap: 10px; }
  .history-nav { display: inline-flex; align-items: center; gap: 4px; }
  .history-nav .icon-button { width: 30px; height: 30px; font-size: 14px; }
  .history-nav .icon-button:disabled { cursor: default; opacity: 0.42; }
  .search-selector select {
    width: 152px;
    min-height: 30px;
    padding: 0 24px 0 8px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: var(--paper);
    color: #344054;
    font-size: 12px;
    font-weight: 700;
  }

  .search-control {
    display: flex;
    align-items: center;
    width: min(260px, 36vw);
    min-height: 36px;
    gap: 8px;
    padding: 0 10px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
  }
  .search-control:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(41, 105, 199, 0.12); }
  .search-icon { color: var(--muted); font-size: 17px; line-height: 1; }
  .search-control input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--ink);
    font-size: 13px;
  }
  .search-control input::placeholder { color: var(--faint); }

  .list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 26px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--line);
  }
  .filter-tabs { display: flex; align-items: center; gap: 3px; min-width: 0; overflow-x: auto; }
  .filter-tab {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 33px;
    padding: 0 9px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }
  .filter-tab span {
    display: inline-grid;
    place-items: center;
    min-width: 19px;
    height: 19px;
    padding: 0 5px;
    border-radius: 999px;
    background: #eaedf1;
    color: #475467;
    font-size: 11px;
  }
  .filter-tab:hover { color: var(--ink); }
  .filter-tab.is-active { border-bottom-color: var(--teal); color: var(--teal-dark); }
  .filter-tab.is-active span { background: var(--teal-soft); color: var(--teal-dark); }

  .sort-control { display: inline-flex; align-items: center; gap: 7px; color: var(--muted); font-size: 12px; font-weight: 700; white-space: nowrap; }
  .sort-control select {
    min-height: 30px;
    padding: 0 24px 0 8px;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: var(--paper);
    color: var(--ink);
    font-size: 12px;
  }

  .candidate-list { display: grid; gap: 10px; padding-top: 14px; }
  .candidate {
    display: grid;
    grid-template-columns: 74px minmax(0, 1fr) 150px;
    min-width: 0;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
    box-shadow: 0 1px 0 rgba(16, 24, 40, 0.02);
    overflow: hidden;
  }
  .candidate:hover { border-color: #bbc4ce; box-shadow: var(--shadow); }
  .candidate.is-selected { border-color: var(--teal); box-shadow: 0 0 0 1px var(--teal), var(--shadow); }
  .candidate-select {
    display: block;
    min-width: 0;
    padding: 13px;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
  }
  .candidate-select:hover { background: #fafcfb; }
  .candidate-visual {
    display: grid;
    place-items: center;
    width: 74px;
    height: 86px;
    margin: 13px 0 13px 13px;
    overflow: hidden;
    border: 1px solid #d7dde4;
    border-radius: 5px;
    background: #eef1f4;
    color: #516173;
    font-size: 14px;
    font-weight: 800;
  }
  .source-image-link { color: inherit; text-decoration: none; }
  .source-image-link:hover { border-color: var(--teal); box-shadow: 0 0 0 2px var(--teal-soft); }
  .candidate-visual img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .candidate-main { min-width: 0; align-self: center; }
  .candidate-main h3 {
    margin: 0;
    color: var(--ink);
    font-size: 15px;
    font-weight: 750;
    line-height: 1.3;
  }
  .candidate-meta { margin: 4px 0 0; color: var(--muted); font-size: 12px; line-height: 1.35; }
  .candidate-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
  .pill {
    display: inline-flex;
    align-items: center;
    min-height: 22px;
    padding: 0 7px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: #fafbfc;
    color: #475467;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.1;
  }
  .pill.status-candidate { background: #f4f5f7; color: #475467; }
  .pill.status-shortlisted, .pill.status-needs-review { border-color: #bed3f6; background: var(--blue-soft); color: var(--blue); }
  .pill.status-approved, .pill.status-ready-for-checkout, .pill.status-ordered { border-color: #b9dfc5; background: var(--green-soft); color: var(--green); }
  .pill.status-rejected { border-color: #f5c6c2; background: var(--red-soft); color: var(--red); }
  .pill.availability-in-stock { border-color: #b9dfc5; background: var(--green-soft); color: var(--green); }
  .pill.availability-out-of-stock { border-color: #f5c6c2; background: var(--red-soft); color: var(--red); }
  .pill.availability-unknown { background: #f4f5f7; color: var(--muted); }
  .pill.source-verified { border-color: #b9dfc5; background: var(--green-soft); color: var(--green); }
  .pill.source-unverified { border-color: #f3d2a2; background: var(--amber-soft); color: var(--amber); }
  .pill.source-blocked, .pill.source-missing { border-color: #f5c6c2; background: var(--red-soft); color: var(--red); }

  .candidate-side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    gap: 8px;
    padding: 14px 13px 13px 0;
    text-align: right;
  }
  .candidate-price { color: var(--ink); font-size: 16px; font-weight: 780; line-height: 1.2; }
  .candidate-list-price { margin-top: 3px; color: var(--muted); font-size: 11px; text-decoration: line-through; }
  .add-to-basket-button {
    width: 100%;
    min-height: 32px;
    padding: 0 8px;
    border: 1px solid var(--teal);
    border-radius: 5px;
    background: var(--teal);
    color: #ffffff;
    font-size: 12px;
    font-weight: 760;
    white-space: nowrap;
  }
  .add-to-basket-button:hover { border-color: var(--teal-dark); background: var(--teal-dark); }
  .in-main-basket {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    color: var(--green);
    font-size: 12px;
    font-weight: 760;
    line-height: 1.2;
  }
  .candidate-side .in-main-basket { justify-content: flex-end; }
  .basket-hint { color: var(--muted); font-size: 12px; font-weight: 650; line-height: 1.35; }
  .source-link { color: var(--teal-dark); font-size: 12px; font-weight: 700; text-decoration: none; }
  .source-link:hover { color: var(--teal); text-decoration: underline; }
  .source-link.source-state { color: var(--muted); cursor: default; text-decoration: none; }
  .source-link.source-state.source-blocked, .source-link.source-state.source-missing { color: var(--red); }
  .source-link.source-state.source-unverified { color: var(--amber); }

  .empty-state {
    padding: 42px 26px;
    border: 1px dashed var(--line-strong);
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.58);
    color: var(--muted);
    text-align: center;
  }
  .empty-state h3 { margin: 0; color: var(--ink); font-size: 15px; }
  .empty-state p { max-width: 380px; margin: 8px auto 0; font-size: 13px; line-height: 1.5; }

  .inspector {
    min-width: 0;
    padding-left: 30px;
    border-left: 1px solid var(--line);
  }
  .inspector > div { position: sticky; top: 24px; }
  .inspector-empty { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.5; }
  .review-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .review-title { margin: 6px 0 0; font-size: 20px; font-weight: 760; line-height: 1.22; }
  .review-subtitle { margin: 6px 0 0; color: var(--muted); font-size: 13px; line-height: 1.4; }
  .review-price { flex: 0 0 auto; color: var(--teal-dark); font-size: 23px; font-weight: 780; line-height: 1.1; text-align: right; }
  .review-list-price { margin-top: 4px; color: var(--muted); font-size: 12px; text-align: right; text-decoration: line-through; }

  .review-actions {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 12px;
    margin: 20px 0;
    padding: 14px 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .review-action-buttons { display: flex; align-items: center; gap: 8px; }
  .stage-control { display: grid; gap: 6px; min-width: 0; }
  .stage-control span { color: var(--muted); font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .stage-control select {
    min-width: 168px;
    min-height: 34px;
    padding: 0 28px 0 9px;
    border: 1px solid var(--line-strong);
    border-radius: 5px;
    background: var(--paper);
    color: var(--ink);
    font-size: 13px;
    font-weight: 700;
  }
  .remove-button {
    min-height: 34px;
    padding: 0 9px;
    border: 1px solid #f0c3bf;
    border-radius: 5px;
    background: var(--paper);
    color: var(--red);
    font-size: 12px;
    font-weight: 700;
  }
  .remove-button:hover { background: var(--red-soft); }

  .review-section { padding: 18px 0; border-bottom: 1px solid var(--line); }
  .review-section:last-child { border-bottom: 0; }
  .review-section h3 { margin: 0; color: #344054; font-size: 12px; font-weight: 760; text-transform: uppercase; }
  .review-section p { margin: 9px 0 0; color: #475467; font-size: 13px; line-height: 1.5; }
  .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 12px 0 0; }
  .detail-grid div { min-width: 0; padding: 9px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); }
  .detail-grid dt { color: var(--muted); font-size: 11px; font-weight: 700; line-height: 1.25; }
  .detail-grid dd { margin: 4px 0 0; color: var(--ink); font-size: 12px; font-weight: 700; line-height: 1.35; }
  .tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 11px; }
  .tag { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; background: #edf1f5; color: #475467; font-size: 11px; font-weight: 700; }
  .attribute-list { display: grid; gap: 0; margin: 11px 0 0; padding: 0; list-style: none; }
  .attribute-list li { display: grid; grid-template-columns: minmax(92px, 0.8fr) minmax(0, 1.2fr); gap: 12px; padding: 9px 0; border-bottom: 1px solid #eaecf0; color: #475467; font-size: 12px; line-height: 1.35; }
  .attribute-list li:last-child { border-bottom: 0; }
  .attribute-list strong { color: #344054; font-weight: 700; }
  .checkout-note { display: flex; gap: 9px; align-items: flex-start; padding: 10px; border-radius: 5px; background: var(--amber-soft); color: #7a4500; font-size: 12px; line-height: 1.45; }
  .checkout-note.is-ready { background: var(--green-soft); color: #18633b; }
  .checkout-note::before { flex: 0 0 auto; content: ""; width: 7px; height: 7px; margin-top: 5px; border-radius: 50%; background: currentColor; }
  .evidence-meta { margin-top: 9px; color: var(--muted); font-size: 12px; line-height: 1.45; }

  .mobile-checkout-bar {
    display: none;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 4;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--line);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 -10px 26px rgba(28, 39, 55, 0.1);
  }
  .mobile-checkout-bar > div { display: grid; min-width: 0; gap: 3px; }
  .mobile-checkout-bar span { color: var(--muted); font-size: 11px; font-weight: 700; }
  .mobile-checkout-bar strong { color: var(--teal-dark); font-size: 16px; line-height: 1.1; }
  .mobile-checkout-bar .checkout-button { width: auto; min-width: 126px; }

  .checkout-modal {
    position: fixed;
    inset: 0;
    z-index: 8;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(21, 24, 31, 0.38);
  }
  .checkout-modal[hidden] { display: none; }
  .checkout-modal-card {
    position: relative;
    width: min(440px, 100%);
    padding: 28px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
    box-shadow: 0 22px 60px rgba(16, 24, 40, 0.24);
  }
  .checkout-modal-card h2 { margin: 7px 32px 0 0; color: var(--ink); font-size: 22px; line-height: 1.2; }
  .checkout-modal-card p:not(.eyebrow) { margin: 11px 0 0; color: #475467; font-size: 14px; line-height: 1.5; }
  .checkout-modal-summary { margin: 18px 0; padding: 12px; border: 1px solid #b9dcd8; border-radius: 5px; background: var(--teal-soft); color: var(--teal-dark); font-size: 13px; font-weight: 760; }
  .modal-close {
    position: absolute;
    top: 14px;
    right: 14px;
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 5px;
    background: var(--paper);
    color: var(--muted);
    font-size: 22px;
    line-height: 1;
  }
  .modal-close:hover { background: #f8fafb; color: var(--ink); }
  .secondary-button {
    min-height: 36px;
    padding: 0 11px;
    border: 1px solid var(--line-strong);
    border-radius: 5px;
    background: var(--paper);
    color: var(--ink);
    font-size: 13px;
    font-weight: 750;
  }
  .secondary-button:hover { background: #f8fafb; }
  .has-modal { overflow: hidden; }

  .source-modal {
    position: fixed;
    inset: 0;
    z-index: 9;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(21, 24, 31, 0.52);
  }
  .source-modal[hidden] { display: none; }
  .source-modal-card {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    width: min(760px, 100%);
    height: min(820px, calc(100dvh - 40px));
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
    box-shadow: 0 22px 60px rgba(16, 24, 40, 0.3);
  }
  .source-modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--line);
  }
  .source-modal-header h2 { margin: 5px 0 0; color: var(--ink); font-size: 16px; line-height: 1.3; }
  .source-modal-header .modal-close { position: static; flex: 0 0 auto; }
  .source-frame-shell { min-height: 0; background: #f8fafb; }
  .source-frame-shell iframe { display: block; width: 100%; height: 100%; border: 0; background: #ffffff; }
  .source-modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 18px calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--line);
    background: var(--paper);
  }
  .source-modal-footer span { color: var(--muted); font-size: 11px; line-height: 1.35; }

  .product-modal {
    position: fixed;
    inset: 0;
    z-index: 8;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(21, 24, 31, 0.42);
  }
  .product-modal[hidden] { display: none; }
  .product-modal-card {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    width: min(620px, 100%);
    max-height: min(820px, calc(100dvh - 40px));
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
    box-shadow: 0 22px 60px rgba(16, 24, 40, 0.28);
  }
  .product-modal-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 18px; border-bottom: 1px solid var(--line); }
  .product-modal-header .modal-close { position: static; flex: 0 0 auto; }
  .product-modal-content { min-height: 0; overflow-y: auto; padding: 0 18px 20px; }
  .mobile-add-to-basket { display: none; }

  .toast {
    position: fixed;
    right: 22px;
    bottom: 22px;
    z-index: 5;
    max-width: min(380px, calc(100vw - 44px));
    padding: 11px 13px;
    border: 1px solid #b9dcd8;
    border-radius: 6px;
    background: #ffffff;
    box-shadow: var(--shadow);
    color: var(--teal-dark);
    font-size: 13px;
    font-weight: 650;
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
    transition: opacity 160ms ease, transform 160ms ease;
  }
  .toast.is-visible { opacity: 1; transform: translateY(0); }
  .toast.is-error { border-color: #f0c3bf; color: var(--red); }

  @media (max-width: 1060px) {
    .workspace-grid { grid-template-columns: minmax(0, 1fr) 330px; gap: 24px; }
    .searches-layout { grid-template-columns: minmax(0, 1fr) 260px; gap: 24px; }
    .main-basket-layout { grid-template-columns: minmax(0, 1fr) 270px; gap: 24px; }
    .inspector { padding-left: 24px; }
    .summary-band { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .metric:nth-child(2) { border-right: 0; }
    .metric:nth-child(-n + 2) { border-bottom: 1px solid var(--line); }
  }

  @media (max-width: 820px) {
    .workspace-grid { grid-template-columns: 1fr; }
    .searches-layout { grid-template-columns: 1fr; }
    .searches-sidebar { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
    .searches-sidebar p, .searches-sidebar h3 { margin: 0; }
    .searches-sidebar > .eyebrow { display: none; }
    .searches-sidebar .open-main-basket { flex: 0 0 auto; margin-top: 0; }
    .main-basket-layout { grid-template-columns: 1fr; }
    .main-basket-sidebar { display: grid; grid-template-columns: minmax(0, 1fr) minmax(230px, 0.8fr); gap: 24px; }
    .checkout-panel { position: static; }
    .main-basket-sidebar .search-history { margin-top: 0; }
    .inspector { padding: 28px 0 0; border-top: 1px solid var(--line); border-left: 0; }
    .inspector > div { position: static; }
  }

  @media (max-width: 620px) {
    .app-header, .workspace { padding-left: 18px; padding-right: 18px; }
    .app-header { min-height: 60px; }
    .brand-kicker { display: none; }
    .sync-status { font-size: 11px; }
    .workspace { padding-bottom: 32px; }
    .is-main-basket .workspace { padding-bottom: 104px; }
    .header-actions { gap: 8px; }
    .basket-overview { padding-top: 26px; }
    h1 { font-size: 27px; }
    .summary-band { margin-top: 24px; }
    .metric { padding: 15px 14px; }
    .metric dd { font-size: 20px; }
    .metric span { font-size: 11px; }
    .region-header { align-items: stretch; flex-direction: column; }
    .research-controls { align-items: stretch; flex-direction: column-reverse; }
    .history-nav { width: 100%; }
    .search-selector { flex: 1; }
    .search-selector select { width: 100%; }
    .search-control { width: 100%; }
    .list-toolbar { align-items: flex-start; flex-direction: column; gap: 10px; }
    .filter-tabs { width: 100%; flex-wrap: wrap; overflow: visible; padding-bottom: 1px; }
    .sort-control { width: 100%; justify-content: space-between; }
    .sort-control select { min-width: 178px; }
    .candidate { grid-template-columns: 58px minmax(0, 1fr); }
    .candidate-select { padding: 11px; }
    .candidate-visual { width: 58px; height: 68px; margin: 11px 0 11px 11px; }
    .candidate-side { grid-column: 2; grid-row: 2; flex-flow: row wrap; align-items: center; justify-content: flex-start; padding: 0 11px 12px; text-align: left; }
    .candidate-price { font-size: 14px; }
    .candidate-side > div:first-child { margin-right: auto; }
    .candidate-side .add-to-basket-button { width: auto; min-width: 122px; }
    .candidate-side .in-main-basket { justify-content: flex-start; min-width: 122px; }
    .review-top { align-items: flex-start; flex-direction: column; }
    .review-price, .review-list-price { text-align: left; }
    .review-actions { align-items: stretch; flex-direction: column; }
    .review-action-buttons { align-items: stretch; flex-direction: column; }
    .review-action-buttons .remove-button { width: 100%; }
    .inspector { display: none; }
    .searches-workspace { padding-top: 27px; }
    .searches-header { align-items: flex-start; flex-direction: column; gap: 12px; }
    .searches-summary { grid-template-columns: 1fr; max-width: none; }
    .searches-summary div { border-right: 0; border-bottom: 1px solid var(--line); }
    .searches-summary div:last-child { border-bottom: 0; }
    .search-page-entry { grid-template-columns: minmax(0, 1fr) 18px; gap: 10px; }
    .search-page-entry-date { grid-column: 1; }
    .search-page-entry-copy { grid-column: 1; }
    .search-page-entry-meta { grid-column: 1; justify-items: start; grid-template-columns: repeat(2, auto); justify-content: start; text-align: left; }
    .search-page-entry-arrow { grid-column: 2; grid-row: 1 / span 3; }
    .searches-sidebar { align-items: flex-start; flex-direction: column; gap: 10px; }
    .searches-sidebar h3 { margin-top: 4px; }
    .searches-sidebar .open-main-basket { width: 100%; }
    .main-basket-workspace { padding-top: 27px; }
    .main-basket-header { align-items: flex-start; flex-direction: column; gap: 12px; }
    .main-basket-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .main-basket-summary div:nth-child(2) { border-right: 0; }
    .main-basket-summary div:nth-child(-n + 2) { border-bottom: 1px solid var(--line); }
    .main-basket-layout { padding-top: 18px; }
    .main-basket-sidebar { grid-template-columns: 1fr; gap: 0; }
    .main-basket-sidebar .search-history { margin-top: 20px; }
    .main-basket-item { grid-template-columns: 58px minmax(0, 1fr); }
    .main-basket-item .candidate-visual { width: 58px; height: 68px; }
    .main-basket-item-side { grid-column: 2; justify-items: start; text-align: left; }
    .main-basket-item-actions { justify-content: flex-start; }
    .main-basket-item-price { margin-top: 2px; }
    .mobile-checkout-bar { display: flex; }
    .checkout-panel .checkout-button { display: none; }
    .checkout-modal-card { padding: 24px 20px; }
    .source-modal { padding: 0; }
    .source-modal-card { width: 100%; height: 100dvh; border: 0; border-radius: 0; }
    .source-modal-header { padding: 13px 18px; }
    .source-modal-footer { padding-right: 18px; padding-left: 18px; }
    .product-modal { padding: 0; }
    .product-modal-card { width: 100%; max-height: none; height: 100dvh; border: 0; border-radius: 0; }
    .product-modal-content { padding: 0 18px 22px; }
    .product-modal-content .review-actions { margin-top: 16px; }
    .mobile-add-to-basket { display: inline-flex; align-items: center; justify-content: center; width: 100%; min-height: 40px; padding: 0 10px; border: 1px solid var(--teal); border-radius: 5px; background: var(--teal); color: #ffffff; font-size: 13px; font-weight: 780; }
    .candidate-side .add-to-basket-button, .candidate-side .in-main-basket { display: none; }
    .stage-control select { width: 100%; }
    .remove-button { align-self: flex-start; }
  }
`;
