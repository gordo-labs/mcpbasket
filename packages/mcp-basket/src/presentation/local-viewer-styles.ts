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

  .workspace-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 24px;
  }
  .workspace-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    padding: 0 11px;
    border: 1px solid transparent;
    border-radius: 5px;
    background: transparent;
    color: var(--muted);
    font-size: 13px;
    font-weight: 750;
  }
  .workspace-tab span {
    display: inline-grid;
    place-items: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 999px;
    background: #eaedf1;
    color: #475467;
    font-size: 11px;
  }
  .workspace-tab:hover { background: #edf1f3; color: var(--ink); }
  .workspace-tab.is-active { border-color: #b9dcd8; background: var(--teal-soft); color: var(--teal-dark); }
  .workspace-tab.is-active span { background: #caebe7; color: var(--teal-dark); }

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

  .decision-workspace { padding-top: 30px; }
  .decision-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--line);
  }
  .decision-header h2 { margin: 6px 0 0; font-size: 22px; line-height: 1.2; }
  .decision-total { color: var(--teal-dark); font-size: 14px; font-weight: 760; white-space: nowrap; }
  .decision-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 34px;
    padding-top: 22px;
  }
  .decision-list { display: grid; gap: 10px; }
  .decision-card {
    display: grid;
    grid-template-columns: 62px minmax(0, 1fr) minmax(118px, auto);
    gap: 13px;
    align-items: center;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--paper);
  }
  .decision-card .candidate-visual { width: 62px; height: 70px; margin: 0; }
  .decision-card h3 { margin: 0; font-size: 15px; line-height: 1.3; }
  .decision-card p { margin: 4px 0 0; color: var(--muted); font-size: 12px; line-height: 1.35; }
  .decision-card-side { display: grid; justify-items: end; gap: 9px; text-align: right; }
  .decision-card-price { color: var(--ink); font-size: 16px; font-weight: 780; }
  .decision-card-actions { display: flex; align-items: center; gap: 9px; }
  .decision-card-actions .remove-button { min-height: 30px; }
  .search-history { min-width: 0; padding-left: 30px; border-left: 1px solid var(--line); }
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
    grid-template-columns: 74px minmax(0, 1fr) 126px;
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
  .source-link { color: var(--teal-dark); font-size: 12px; font-weight: 700; text-decoration: none; }
  .source-link:hover { color: var(--teal); text-decoration: underline; }

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
  .decision-button {
    min-height: 34px;
    padding: 0 10px;
    border: 1px solid var(--teal);
    border-radius: 5px;
    background: var(--teal);
    color: #ffffff;
    font-size: 12px;
    font-weight: 750;
  }
  .decision-button:hover { background: var(--teal-dark); border-color: var(--teal-dark); }
  .decision-saved { color: var(--green); font-size: 12px; font-weight: 750; }
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
    .decision-layout { grid-template-columns: minmax(0, 1fr) 270px; gap: 24px; }
    .inspector { padding-left: 24px; }
    .summary-band { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .metric:nth-child(2) { border-right: 0; }
    .metric:nth-child(-n + 2) { border-bottom: 1px solid var(--line); }
  }

  @media (max-width: 820px) {
    .workspace-grid { grid-template-columns: 1fr; }
    .decision-layout { grid-template-columns: 1fr; }
    .inspector { padding: 28px 0 0; border-top: 1px solid var(--line); border-left: 0; }
    .search-history { padding: 28px 0 0; border-top: 1px solid var(--line); border-left: 0; }
    .inspector > div { position: static; }
  }

  @media (max-width: 620px) {
    .app-header, .workspace { padding-left: 18px; padding-right: 18px; }
    .app-header { min-height: 60px; }
    .brand-kicker { display: none; }
    .sync-status { font-size: 11px; }
    .workspace { padding-bottom: 32px; }
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
    .candidate { grid-template-columns: 58px minmax(0, 1fr) 96px; }
    .candidate-select { padding: 11px; }
    .candidate-visual { width: 58px; height: 68px; margin: 11px 0 11px 11px; }
    .candidate-side { padding: 12px 10px 11px 0; }
    .candidate-price { font-size: 14px; }
    .review-top { align-items: flex-start; flex-direction: column; }
    .review-price, .review-list-price { text-align: left; }
    .review-actions { align-items: stretch; flex-direction: column; }
    .review-action-buttons { align-items: stretch; flex-direction: column; }
    .decision-button, .review-action-buttons .remove-button { width: 100%; }
    .decision-header { align-items: flex-start; flex-direction: column; }
    .decision-layout { padding-top: 18px; }
    .decision-card { grid-template-columns: 52px minmax(0, 1fr); }
    .decision-card .candidate-visual { width: 52px; height: 60px; }
    .decision-card-side { grid-column: 2; justify-items: start; text-align: left; }
    .decision-card-actions { justify-content: flex-start; }
    .stage-control select { width: 100%; }
    .remove-button { align-self: flex-start; }
  }
`;
