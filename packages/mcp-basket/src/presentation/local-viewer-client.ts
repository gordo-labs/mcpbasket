export const LOCAL_VIEWER_CLIENT = String.raw`
  (function () {
    var state = {
      basket: null,
      selectedId: document.body.getAttribute("data-initial-product-id"),
      selectedSearchId: document.body.getAttribute("data-initial-search-id"),
      view: document.body.getAttribute("data-initial-view") === "product-detail"
        ? "product-detail"
        : document.body.getAttribute("data-initial-view") === "main-basket"
        ? "main-basket"
        : document.body.getAttribute("data-initial-view") === "searches" ? "searches" : "research",
      filter: "all",
      search: "",
      sort: "recommended",
      toastTimer: null,
      sourceOpener: null,
      productOpener: null
    };

    var STATUS_LABELS = {
      candidate: "Candidate",
      shortlisted: "Shortlisted",
      needs_review: "Needs review",
      approved: "Approved",
      ready_for_checkout: "Ready for checkout",
      ordered: "Ordered",
      rejected: "Rejected"
    };

    function element(id) {
      return document.getElementById(id);
    }

    function escapeHtml(value) {
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function asRecord(value) {
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }

    function asArray(value) {
      return Array.isArray(value) ? value : [];
    }

    function decodeHtmlEntities(value) {
      return String(value == null ? "" : value)
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
    }

    function displayText(value, fallback) {
      return typeof value === "string" && value.trim() ? decodeHtmlEntities(value.trim()) : fallback;
    }

    function statusLabel(status) {
      return STATUS_LABELS[status] || String(status || "candidate").replace(/_/g, " ");
    }

    function statusClass(status) {
      return "status-" + String(status || "candidate").replace(/_/g, "-");
    }

    function availabilityInfo(item) {
      var availability = asRecord(asRecord(item.product).availability);
      var value = availability.status || availability.stock;
      if (typeof value !== "string" || !value) return { label: "Availability unknown", className: "availability-unknown" };
      var label = value.replace(/_/g, " ");
      return { label: label, className: "availability-" + value.replace(/_/g, "-") };
    }

    function priceRecord(item) {
      var product = asRecord(item.product);
      var price = asRecord(product.price);
      var raw = price.current;
      if (raw == null) raw = price.totalEstimate;
      if (raw == null) raw = price.amount;
      var amount = typeof raw === "number" ? raw : Number(asRecord(raw).amount);
      var currency = price.currency || asRecord(raw).currency || asRecord(state.basket && state.basket.context).currency;
      var listRaw = price.list;
      var listAmount = typeof listRaw === "number" ? listRaw : Number(asRecord(listRaw).amount);
      return {
        amount: Number.isFinite(amount) ? amount : null,
        currency: typeof currency === "string" && currency ? currency : null,
        listAmount: Number.isFinite(listAmount) ? listAmount : null
      };
    }

    function formatMoney(amount, currency) {
      if (amount == null || !Number.isFinite(amount)) return "Price unavailable";
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currency || "USD",
          maximumFractionDigits: amount % 1 === 0 ? 0 : 2
        }).format(amount);
      } catch (_) {
        return String(amount) + (currency ? " " + currency : "");
      }
    }

    function merchantName(item) {
      var merchant = asRecord(asRecord(item.product).merchant);
      return displayText(merchant.name || merchant.domain, "Unverified merchant");
    }

    function httpUrl(value) {
      if (typeof value !== "string") return "";
      try {
        var url = new URL(decodeHtmlEntities(value));
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
      } catch (_) {
        return "";
      }
    }

    function capturedSourceUrl(item) {
      var product = asRecord(item.product);
      var urls = asRecord(product.urls);
      var identifiers = asRecord(product.identifiers);
      var candidate = urls.product || urls.canonical || identifiers.sourceUrl || identifiers.canonicalUrl;
      return httpUrl(candidate);
    }

    function linkValidationInfo(item) {
      var product = asRecord(item.product);
      var evidence = asRecord(product.evidence);
      var validation = asRecord(evidence.linkValidation);
      var source = capturedSourceUrl(item);
      var status = typeof validation.status === "string" ? validation.status : "unverified";
      if (!source) return { url: "", label: "No source", className: "source-missing" };
      if (status === "verified") return { url: source, label: "Source verified", className: "source-verified" };
      if (status === "blocked") return { url: "", label: "Source blocked", className: "source-blocked" };
      return { url: "", label: "Source unverified", className: "source-unverified" };
    }

    function sourceUrl(item) {
      return linkValidationInfo(item).url;
    }

    function imageUrl(item) {
      var product = asRecord(item.product);
      var images = asArray(product.images);
      var firstImage = asRecord(images[0]);
      var urls = asRecord(product.urls);
      var candidate = firstImage.url || urls.image;
      return httpUrl(candidate);
    }

    function initials(item) {
      var product = asRecord(item.product);
      var source = displayText(product.brand, displayText(product.title, "MB"));
      return source.split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join("").toUpperCase();
    }

    function checkoutInfo(item) {
      var product = asRecord(item.product);
      var checkout = asRecord(item.checkout);
      var identifiers = asRecord(product.identifiers);
      var locator = checkout.locator || identifiers.productLocator;
      var readiness = checkout.readiness || (locator ? "needs_validation" : "missing_locator");
      return { locator: locator, readiness: readiness, supported: checkout.supported === true };
    }

    function formatTime(value) {
      if (!value) return "Unknown time";
      var date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Unknown time";
      try {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
      } catch (_) {
        return date.toLocaleString();
      }
    }

    function totalByCurrency(items) {
      var totals = {};
      items.forEach(function (item) {
        var price = priceRecord(item);
        if (price.amount == null) return;
        var currency = price.currency || "USD";
        totals[currency] = (totals[currency] || 0) + price.amount * Number(item.quantity || 1);
      });
      return totals;
    }

    function totalText(items) {
      var totals = totalByCurrency(items);
      var entries = Object.keys(totals);
      if (!entries.length) return "-";
      return entries.map(function (currency) { return formatMoney(totals[currency], currency); }).join(" + ");
    }

    function countByStatus(items, statuses) {
      return items.filter(function (item) { return statuses.indexOf(item.status) !== -1; }).length;
    }

    function contextChips(context) {
      var chips = [];
      if (context.destinationCountry) chips.push({ text: "Deliver to " + context.destinationCountry, priority: true });
      if (context.currency) chips.push({ text: context.currency, priority: false });
      asArray(context.targetStores).slice(0, 3).forEach(function (store) { chips.push({ text: store, priority: false }); });
      asArray(context.constraints).slice(0, 4).forEach(function (constraint) { chips.push({ text: constraint, priority: false }); });
      return chips;
    }

    function decisionBasket() {
      return asRecord(state.basket && state.basket.decisionBasket);
    }

    function savedSearches() {
      return asArray(decisionBasket().searches);
    }

    function selectedSearch() {
      var searches = savedSearches();
      if (!searches.length) return null;
      var selected = searches.find(function (search) { return search.id === state.selectedSearchId; });
      if (selected) return selected;
      var active = searches.find(function (search) { return search.id === state.basket.activeSearchId; });
      selected = active || searches[searches.length - 1];
      state.selectedSearchId = selected.id;
      return selected;
    }

    function selectedResearchItems() {
      var search = selectedSearch();
      if (search && search.id === state.basket.activeSearchId) return asArray(state.basket.items);
      return search ? asArray(search.items) : asArray(state.basket && state.basket.items);
    }

    function selectedResearchContext() {
      var search = selectedSearch();
      if (search && search.id === state.basket.activeSearchId) return asRecord(state.basket.context);
      return search ? asRecord(search.context) : asRecord(state.basket && state.basket.context);
    }

    function selectedSearchIsActive() {
      return state.selectedSearchId != null && state.selectedSearchId === state.basket.activeSearchId;
    }

    function finalDecisionFor(item, searchId) {
      return asArray(decisionBasket().items).find(function (decision) {
        return decision.sourceItemId === item.id && decision.sourceSearchId === searchId;
      });
    }

    function searchTitle(search, fallback) {
      var context = asRecord(search && search.context);
      return displayText(context.title, displayText(context.intent, fallback || "Saved research"));
    }

    function formatCompactTime(value) {
      if (!value) return "Unknown date";
      var date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Unknown date";
      try {
        return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
      } catch (_) {
        return date.toLocaleDateString();
      }
    }

    function renderSearchNavigator() {
      var searches = savedSearches();
      var select = element("saved-search");
      if (!searches.length) {
        select.innerHTML = '<option value="">Current research</option>';
        select.disabled = true;
        element("previous-search").disabled = true;
        element("next-search").disabled = true;
        return;
      }
      var currentIndex = searches.findIndex(function (search) { return search.id === state.selectedSearchId; });
      select.disabled = false;
      select.innerHTML = searches.map(function (search, index) {
        var label = searchTitle(search, "Saved research " + String(index + 1)) + " · " + formatCompactTime(search.createdAt);
        return '<option value="' + escapeHtml(search.id) + '"' + (search.id === state.selectedSearchId ? " selected" : "") + '>' + escapeHtml(label) + '</option>';
      }).join("");
      element("previous-search").disabled = currentIndex <= 0;
      element("next-search").disabled = currentIndex < 0 || currentIndex >= searches.length - 1;
    }

    function setWorkspaceView(view) {
      state.view = view === "main-basket" || view === "searches" || view === "product-detail" ? view : "research";
      element("research-view").hidden = state.view !== "research";
      element("searches-view").hidden = state.view !== "searches";
      element("product-detail-view").hidden = state.view !== "product-detail";
      element("main-basket-view").hidden = state.view !== "main-basket";
      element("mobile-checkout").hidden = state.view !== "main-basket";
      var basketLink = element("main-basket-link");
      var searchesLink = element("searches-link");
      basketLink.classList.toggle("is-active", state.view === "main-basket");
      searchesLink.classList.toggle("is-active", state.view === "searches");
      if (state.view === "main-basket") basketLink.setAttribute("aria-current", "page");
      else basketLink.removeAttribute("aria-current");
      if (state.view === "searches") searchesLink.setAttribute("aria-current", "page");
      else searchesLink.removeAttribute("aria-current");
      document.body.classList.toggle("is-main-basket", state.view === "main-basket");
      document.body.classList.toggle("is-searches", state.view === "searches");
      document.body.classList.toggle("is-product-detail", state.view === "product-detail");
      document.title = state.view === "main-basket"
        ? "Main basket | MCPBasket"
        : state.view === "searches" ? "Saved searches | MCPBasket"
          : state.view === "product-detail" ? "Product detail | MCPBasket" : "MCPBasket";
    }

    function updateTabs(items) {
      var counts = {
        all: items.length,
        research: countByStatus(items, ["candidate", "needs_review"]),
        shortlisted: countByStatus(items, ["shortlisted"]),
        approved: countByStatus(items, ["approved", "ready_for_checkout", "ordered"])
      };
      Object.keys(counts).forEach(function (key) {
        element("filter-count-" + key).textContent = String(counts[key]);
      });
    }

    function matchesFilter(item) {
      if (state.filter === "research") return item.status === "candidate" || item.status === "needs_review";
      if (state.filter === "shortlisted") return item.status === "shortlisted";
      if (state.filter === "approved") return item.status === "approved" || item.status === "ready_for_checkout" || item.status === "ordered";
      return true;
    }

    function matchesSearch(item) {
      if (!state.search) return true;
      var product = asRecord(item.product);
      var tags = asArray(item.tags).join(" ");
      var haystack = [product.title, product.brand, product.category, merchantName(item), tags].join(" ").toLocaleLowerCase();
      return haystack.indexOf(state.search) !== -1;
    }

    function sortedItems(items) {
      return items.slice().sort(function (left, right) {
        if (state.sort === "price-low" || state.sort === "price-high") {
          var leftPrice = priceRecord(left).amount;
          var rightPrice = priceRecord(right).amount;
          if (leftPrice == null && rightPrice != null) return 1;
          if (rightPrice == null && leftPrice != null) return -1;
          if (leftPrice != null && rightPrice != null && leftPrice !== rightPrice) {
            return state.sort === "price-low" ? leftPrice - rightPrice : rightPrice - leftPrice;
          }
        }
        if (state.sort === "updated") return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
        var priority = { shortlisted: 0, candidate: 1, needs_review: 2, approved: 3, ready_for_checkout: 4, ordered: 5, rejected: 6 };
        return (priority[left.status] == null ? 9 : priority[left.status]) - (priority[right.status] == null ? 9 : priority[right.status]);
      });
    }

    function renderCandidate(item, searchId) {
      var product = asRecord(item.product);
      var price = priceRecord(item);
      var availability = availabilityInfo(item);
      var linkValidation = linkValidationInfo(item);
      var image = imageUrl(item);
      var source = sourceUrl(item);
      var listPrice = price.listAmount != null && price.amount != null && price.listAmount > price.amount
        ? '<div class="candidate-list-price">' + escapeHtml(formatMoney(price.listAmount, price.currency)) + '</div>'
        : "";
      var imageMarkup = image
        ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(displayText(product.title, "Product")) + '">'
        : escapeHtml(initials(item));
      var visualMarkup = source
        ? '<a class="candidate-visual source-image-link" data-source-modal="true" data-source-title="' + escapeHtml(displayText(product.title, "Product page")) + '" href="' + escapeHtml(source) + '" target="_blank" rel="noreferrer" aria-label="Open product page for ' + escapeHtml(displayText(product.title, "product")) + '">' + imageMarkup + '</a>'
        : '<div class="candidate-visual">' + imageMarkup + '</div>';
      var sourceMarkup = source
        ? '<a class="source-link" data-source-modal="true" data-source-title="' + escapeHtml(displayText(product.title, "Product page")) + '" href="' + escapeHtml(source) + '" target="_blank" rel="noreferrer">View source &#8599;</a>'
        : '<span class="source-link source-state ' + linkValidation.className + '">' + escapeHtml(linkValidation.label) + '</span>';
      var existingDecision = finalDecisionFor(item, searchId);
      var mainBasketAction = existingDecision
        ? '<span class="in-main-basket">In main basket</span>'
        : '<button class="add-to-basket-button" type="button" data-action="add-to-main-basket" data-id="' + escapeHtml(item.id) + '" data-search-id="' + escapeHtml(searchId || "") + '">Add to basket</button>';
      var selected = item.id === state.selectedId ? " is-selected" : "";
      return [
        '<article class="candidate' + selected + '" data-id="' + escapeHtml(item.id) + '">',
          visualMarkup,
          '<button class="candidate-select" type="button" data-action="select" data-id="' + escapeHtml(item.id) + '" aria-label="Review ' + escapeHtml(displayText(product.title, "product")) + '">',
            '<span class="candidate-main">',
              '<h3>' + escapeHtml(displayText(product.title, "Untitled product")) + '</h3>',
              '<span class="candidate-meta">' + escapeHtml(merchantName(item)) + (product.brand ? ' &middot; ' + escapeHtml(product.brand) : "") + '</span>',
              '<span class="candidate-pills">',
                '<span class="pill ' + statusClass(item.status) + '">' + escapeHtml(statusLabel(item.status)) + '</span>',
                '<span class="pill ' + availability.className + '">' + escapeHtml(availability.label) + '</span>',
                '<span class="pill ' + linkValidation.className + '">' + escapeHtml(linkValidation.label) + '</span>',
              '</span>',
            '</span>',
          '</button>',
          '<div class="candidate-side">',
            '<div><div class="candidate-price">' + escapeHtml(formatMoney(price.amount, price.currency)) + '</div>' + listPrice + '</div>',
            mainBasketAction,
            sourceMarkup,
          '</div>',
        '</article>'
      ].join("");
    }

    function searchNameFor(decision) {
      var search = savedSearches().find(function (candidate) { return candidate.id === decision.sourceSearchId; });
      var context = asRecord(search && search.context);
      return displayText(context.title, displayText(context.intent, "Saved research"));
    }

    function renderMainBasketItem(decision) {
      var item = asRecord(decision.item);
      var product = asRecord(item.product);
      var price = priceRecord(item);
      var image = imageUrl(item);
      var source = sourceUrl(item);
      var linkValidation = linkValidationInfo(item);
      var imageMarkup = image
        ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(displayText(product.title, "Product")) + '">'
        : escapeHtml(initials(item));
      var visualMarkup = source
        ? '<a class="candidate-visual source-image-link" data-source-modal="true" data-source-title="' + escapeHtml(displayText(product.title, "Product page")) + '" href="' + escapeHtml(source) + '" target="_blank" rel="noreferrer" aria-label="Open product page for ' + escapeHtml(displayText(product.title, "product")) + '">' + imageMarkup + '</a>'
        : '<div class="candidate-visual">' + imageMarkup + '</div>';
      var selectedOptions = asArray(product.selectedOptions).map(function (option) {
        var record = asRecord(option);
        return displayText(record.label || record.name, "Option") + ": " + displayText(record.value, "Selected");
      }).join(" · ");
      return [
        '<article class="main-basket-item">',
          visualMarkup,
          '<div class="main-basket-item-copy">',
            '<h3>' + escapeHtml(displayText(product.title, "Untitled product")) + '</h3>',
            '<p>' + escapeHtml(merchantName(item)) + (selectedOptions ? ' &middot; ' + escapeHtml(selectedOptions) : "") + '</p>',
            '<span class="main-basket-item-meta">' + escapeHtml(linkValidation.label) + ' &middot; From ' + escapeHtml(searchNameFor(decision)) + ' &middot; Added ' + escapeHtml(formatTime(decision.selectedAt)) + '</span>',
          '</div>',
          '<div class="main-basket-item-side">',
            '<div class="main-basket-item-price">' + escapeHtml(formatMoney(price.amount, price.currency)) + '</div>',
            '<div class="main-basket-item-actions">',
              source ? '<a class="source-link" data-source-modal="true" data-source-title="' + escapeHtml(displayText(product.title, "Product page")) + '" href="' + escapeHtml(source) + '" target="_blank" rel="noreferrer">Open &#8599;</a>' : "",
              '<button class="remove-button" type="button" data-action="remove-decision" data-id="' + escapeHtml(decision.id) + '">Remove</button>',
            '</div>',
          '</div>',
        '</article>'
      ].join("");
    }

    function renderSearchHistory(decisions, searches) {
      var target = element("search-history");
      if (!searches.length) {
        target.innerHTML = '<p class="inspector-empty">Searches will appear here when the agent sets a new research context.</p>';
        return;
      }
      target.innerHTML = searches.slice().reverse().map(function (search) {
        var selectedCount = decisions.filter(function (decision) { return decision.sourceSearchId === search.id; }).length;
        var itemCount = asArray(search.items).length;
        return [
          '<button class="history-entry" type="button" data-action="open-search" data-search-id="' + escapeHtml(search.id) + '">',
            '<strong>' + escapeHtml(searchTitle(search)) + '</strong>',
            '<p>' + escapeHtml(displayText(asRecord(search.context).intent, itemCount + " product candidates")) + '</p>',
            '<span>Created ' + escapeHtml(formatCompactTime(search.createdAt)) + ' &middot; ' + itemCount + ' candidates &middot; ' + selectedCount + ' in main basket</span>',
          '</button>'
        ].join("");
      }).join("");
    }

    function renderSearchesWorkspace() {
      var searches = savedSearches();
      var decisions = asArray(decisionBasket().items);
      var productCount = searches.reduce(function (count, search) { return count + asArray(search.items).length; }, 0);
      element("searches-count").textContent = String(searches.length);
      element("searches-summary-count").textContent = String(searches.length);
      element("searches-summary-products").textContent = String(productCount);
      element("searches-summary-basket").textContent = String(decisions.length);
      element("searches-description").textContent = searches.length
        ? searches.length + " saved research sessions with the products returned by the agent."
        : "Every research response is preserved with its candidate list.";
      element("searches-sidebar-basket-count").textContent = decisions.length === 1 ? "1 product" : decisions.length + " products";
      element("searches-sidebar-copy").textContent = decisions.length
        ? "" + decisions.length + " selected products are ready to review together."
        : "Select products from any saved research and they will stay together here.";
      element("search-page-items").innerHTML = searches.length
        ? searches.slice().reverse().map(function (search) {
          var itemCount = asArray(search.items).length;
          var selectedCount = decisions.filter(function (decision) { return decision.sourceSearchId === search.id; }).length;
          return [
            '<button class="search-page-entry" type="button" data-action="open-search" data-search-id="' + escapeHtml(search.id) + '">',
              '<span class="search-page-entry-date">' + escapeHtml(formatCompactTime(search.createdAt)) + '</span>',
              '<span class="search-page-entry-copy">',
                '<strong>' + escapeHtml(searchTitle(search)) + '</strong>',
                '<span>' + escapeHtml(displayText(asRecord(search.context).intent, "Product research")) + '</span>',
              '</span>',
              '<span class="search-page-entry-meta">',
                '<span>' + itemCount + (itemCount === 1 ? " product" : " products") + '</span>',
                '<span>' + selectedCount + " in main basket</span>",
              '</span>',
              '<span class="search-page-entry-arrow" aria-hidden="true">&#8594;</span>',
            '</button>'
          ].join("");
        }).join("")
        : '<div class="empty-state"><h3>No saved searches yet</h3><p>When the agent starts a product research response, its returned candidates will appear here with their creation time.</p></div>';
    }

    function renderMainBasketWorkspace() {
      var decisions = asArray(decisionBasket().items);
      var searches = savedSearches();
      var items = decisions.map(function (decision) { return asRecord(decision.item); });
      var merchantNames = new Set(items.map(merchantName).filter(function (name) { return name !== "Unverified merchant"; }));
      var productCountLabel = decisions.length === 1 ? "1 product" : decisions.length + " products";
      var total = totalText(items);
      var checkoutButtons = document.querySelectorAll("[data-action='checkout']");

      element("main-basket-count").textContent = String(decisions.length);
      element("main-basket-product-count").textContent = String(decisions.length);
      element("main-basket-search-count").textContent = String(searches.length);
      element("main-basket-merchant-count").textContent = String(merchantNames.size);
      element("main-basket-total").textContent = total;
      element("main-basket-description").textContent = decisions.length
        ? "Products selected across " + searches.length + " saved research sessions."
        : "Products selected across every saved research session.";
      element("main-basket-items").innerHTML = decisions.length
        ? decisions.map(renderMainBasketItem).join("")
        : '<div class="empty-state"><h3>Your main basket is empty</h3><p>Use the Add to basket button on a researched product to keep it here across future searches.</p></div>';
      element("checkout-panel-detail").textContent = decisions.length
        ? productCountLabel + " selected from " + searches.length + " research sessions."
        : "Select products from research to start a checkout.";
      element("checkout-panel-total").textContent = total;
      element("mobile-checkout-count").textContent = productCountLabel;
      element("mobile-checkout-total").textContent = total;
      checkoutButtons.forEach(function (button) { button.disabled = decisions.length === 0; });
      renderSearchHistory(decisions, searches);
    }

    function detailRow(label, value) {
      if (value == null || value === "") return "";
      return '<div><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>';
    }

    function attributesMarkup(item) {
      var attributes = asArray(asRecord(item.product).attributes).slice(0, 8);
      if (!attributes.length) return '<p>No structured product attributes have been captured yet.</p>';
      return '<ul class="attribute-list">' + attributes.map(function (attribute) {
        var record = asRecord(attribute);
        return '<li><strong>' + escapeHtml(displayText(record.name, "Attribute")) + '</strong><span>' + escapeHtml(displayText(record.value, "Not captured")) + '</span></li>';
      }).join("") + '</ul>';
    }

    function tagsMarkup(item) {
      var tags = asArray(item.tags).slice(0, 8);
      if (!tags.length) return "";
      return '<div class="tag-list">' + tags.map(function (tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>';
    }

    function selectOptions(current) {
      return Object.keys(STATUS_LABELS).map(function (status) {
        return '<option value="' + status + '"' + (status === current ? " selected" : "") + '>' + escapeHtml(STATUS_LABELS[status]) + '</option>';
      }).join("");
    }

    function productDetailMarkup(item, searchId, isActiveSearch, headingId, showBasketAction) {
      if (!item) {
        return '<p class="eyebrow">Candidate review</p><h2 id="' + escapeHtml(headingId) + '">Select a product</h2><p class="inspector-empty">Choose an option to inspect its price, evidence, and checkout readiness.</p>';
      }
      var product = asRecord(item.product);
      var price = priceRecord(item);
      var rating = asRecord(product.rating);
      var evidence = asRecord(product.evidence);
      var checkout = checkoutInfo(item);
      var source = sourceUrl(item);
      var linkValidation = linkValidationInfo(item);
      var options = asArray(product.selectedOptions).map(function (option) {
        var record = asRecord(option);
        return displayText(record.label || record.name, "Option") + ": " + displayText(record.value, "Not selected");
      }).join(", ");
      var listPrice = price.listAmount != null && price.amount != null && price.listAmount > price.amount
        ? '<p class="review-list-price">' + escapeHtml(formatMoney(price.listAmount, price.currency)) + '</p>'
        : "";
      var ratingValue = rating.value != null ? String(rating.value) + (rating.scale ? "/" + rating.scale : "") : "Not captured";
      var checkoutReady = checkout.locator && (item.status === "approved" || item.status === "ready_for_checkout");
      var checkoutMessage = checkoutReady
        ? "A checkout locator is available. Export still requires a separate, user-approved checkout integration."
        : checkout.locator
          ? "A locator exists but the candidate is not approved for checkout."
          : "No checkout locator is captured. This remains research only.";
      var existingDecision = finalDecisionFor(item, searchId);
      var basketStatus = existingDecision
        ? '<span class="in-main-basket">In main basket</span>'
        : showBasketAction
          ? '<button class="detail-add-to-basket" type="button" data-action="add-to-main-basket" data-id="' + escapeHtml(item.id) + '" data-search-id="' + escapeHtml(searchId || "") + '">Add to basket</button>'
          : '<span class="basket-hint">Use Add to basket in the product list.</span>';
      var stageControl = isActiveSearch
        ? '<label class="stage-control"><span>Research stage</span><select data-action="status" data-id="' + escapeHtml(item.id) + '" aria-label="Research stage for ' + escapeHtml(displayText(product.title, "product")) + '">' + selectOptions(item.status) + '</select></label>'
        : '<div class="stage-control"><span>Saved research stage</span><strong class="pill ' + statusClass(item.status) + '">' + escapeHtml(statusLabel(item.status)) + '</strong></div>';
      return [
        '<div class="review-top">',
          '<div>',
            '<p class="eyebrow">Candidate review</p>',
            '<h2 class="review-title" id="' + escapeHtml(headingId) + '">' + escapeHtml(displayText(product.title, "Untitled product")) + '</h2>',
            '<p class="review-subtitle">' + escapeHtml(merchantName(item)) + (product.brand ? ' &middot; ' + escapeHtml(product.brand) : "") + '</p>',
          '</div>',
          '<div><div class="review-price">' + escapeHtml(formatMoney(price.amount, price.currency)) + '</div>' + listPrice + '</div>',
        '</div>',
        '<div class="review-actions">',
          stageControl,
          '<div class="review-action-buttons">', basketStatus,
          isActiveSearch ? '<button class="remove-button" type="button" data-action="remove" data-id="' + escapeHtml(item.id) + '">Remove</button>' : "",
          '</div>',
        '</div>',
        '<section class="review-section"><h3>Decision data</h3><dl class="detail-grid">',
          detailRow("Availability", availabilityInfo(item).label),
          detailRow("Rating", ratingValue),
          detailRow("Quantity", String(item.quantity || 1)),
          detailRow("Selected option", options || "Not captured"),
          detailRow("Source", linkValidation.label),
        '</dl>', tagsMarkup(item), '</section>',
        '<section class="review-section"><h3>Key attributes</h3>', attributesMarkup(item), '</section>',
        '<section class="review-section"><h3>Research notes</h3><p>' + escapeHtml(displayText(item.notes || evidence.reason, "No rationale or notes captured yet.")) + '</p>',
          '<div class="evidence-meta">Evidence confidence: ' + escapeHtml(displayText(evidence.confidence, "unknown")) + '<br>Last updated: ' + escapeHtml(formatTime(item.updatedAt)) + '</div>',
          source ? '<p><a class="source-link" data-source-modal="true" data-source-title="' + escapeHtml(displayText(product.title, "Product page")) + '" href="' + escapeHtml(source) + '" target="_blank" rel="noreferrer">Open product source &#8599;</a></p>' : "",
        '</section>',
        '<section class="review-section"><h3>Checkout readiness</h3><div class="checkout-note' + (checkoutReady ? " is-ready" : "") + '">' + escapeHtml(checkoutMessage) + '</div></section>'
      ].join("");
    }

    function renderInspector(item, searchId, isActiveSearch) {
      element("inspector-content").innerHTML = productDetailMarkup(item, searchId, isActiveSearch, "review-heading", false);
    }

    function renderProductDetailWorkspace(item, search) {
      var searchName = searchTitle(search, "Saved research");
      element("product-detail-path").textContent = searchName;
      if (!item) {
        element("product-detail-content").innerHTML = '<div class="empty-state"><h2 id="product-page-title">Product not available</h2><p>This candidate is not present in the selected research session. Return to the saved search and choose another product.</p></div>';
        return;
      }
      element("product-detail-content").innerHTML = productDetailMarkup(
        item,
        search && search.id,
        selectedSearchIsActive(),
        "product-page-title",
        true,
      );
    }

    function render(basket) {
      state.basket = basket;
      var search = selectedSearch();
      var context = selectedResearchContext();
      var items = selectedResearchItems();
      var selectedExists = items.some(function (item) { return item.id === state.selectedId; });
      if (!selectedExists) state.selectedId = items.length ? items[0].id : null;

      element("basket-title").textContent = displayText(context.title, "Agent Basket");
      element("intent").textContent = displayText(context.intent, "A local workspace for reviewing product research before any purchase is approved.");
      element("context-chips").innerHTML = contextChips(context).map(function (chip) {
        return '<span class="context-chip' + (chip.priority ? " is-priority" : "") + '">' + escapeHtml(chip.text) + '</span>';
      }).join("");

      var shortlisted = countByStatus(items, ["shortlisted"]);
      var approved = countByStatus(items, ["approved", "ready_for_checkout", "ordered"]);
      element("stat-items").textContent = String(items.length);
      element("stat-items-detail").textContent = items.length === 1 ? "1 candidate captured" : items.length + " candidates captured";
      element("stat-shortlisted").textContent = String(shortlisted);
      element("stat-shortlisted-detail").textContent = shortlisted ? "Ready for comparison" : "Awaiting review";
      element("stat-approved").textContent = String(approved);
      element("stat-approved-detail").textContent = approved ? "Selected in this research" : "Nothing selected";
      element("stat-total").textContent = totalText(items);
      element("stat-total-detail").textContent = Object.keys(totalByCurrency(items)).length ? "Across priced options" : "Prices not captured";
      updateTabs(items);
      renderSearchNavigator();
      renderSearchesWorkspace();
      renderMainBasketWorkspace();
      renderProductDetailWorkspace(
        items.find(function (item) { return item.id === state.selectedId; }) || null,
        search,
      );
      setWorkspaceView(state.view);

      var filtered = sortedItems(items.filter(matchesFilter).filter(matchesSearch));
      element("result-count").textContent = filtered.length === items.length
        ? (items.length === 1 ? "1 product in this basket" : items.length + " products in this basket")
        : (filtered.length === 1 ? "1 matching product" : filtered.length + " matching products");
      element("items").innerHTML = filtered.length
        ? filtered.map(function (item) { return renderCandidate(item, search && search.id); }).join("")
        : '<div class="empty-state"><h3>No matching products</h3><p>Try a different search or filter. New candidates added by the agent will appear here automatically.</p></div>';
      renderInspector(
        items.find(function (item) { return item.id === state.selectedId; }) || null,
        search && search.id,
        selectedSearchIsActive(),
      );
    }

    function setSyncStatus(message, className) {
      var target = element("sync-status");
      target.textContent = message;
      target.className = "sync-status" + (className ? " " + className : "");
    }

    function showToast(message, isError) {
      var toast = element("toast");
      toast.textContent = message;
      toast.className = "toast is-visible" + (isError ? " is-error" : "");
      if (state.toastTimer) window.clearTimeout(state.toastTimer);
      state.toastTimer = window.setTimeout(function () { toast.className = "toast"; }, 3200);
    }

    async function loadBasket() {
      setSyncStatus("Syncing", "");
      try {
        var response = await fetch("/api/basket/raw", { cache: "no-store" });
        if (!response.ok) throw new Error("The local basket could not be loaded.");
        render(await response.json());
        setSyncStatus("Local and up to date", "is-fresh");
      } catch (error) {
        setSyncStatus("Sync failed", "is-error");
        showToast(error instanceof Error ? error.message : "The local basket could not be loaded.", true);
      }
    }

    async function updateStatus(id, status) {
      try {
        var response = await fetch("/api/items/" + encodeURIComponent(id) + "/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: status })
        });
        if (!response.ok) throw new Error("The research stage could not be updated.");
        showToast("Research stage updated.", false);
        await loadBasket();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "The research stage could not be updated.", true);
      }
    }

    async function removeItem(id) {
      if (!window.confirm("Remove this product from the local basket?")) return;
      try {
        var response = await fetch("/api/items/" + encodeURIComponent(id), { method: "DELETE" });
        if (!response.ok) throw new Error("The product could not be removed.");
        state.selectedId = null;
        showToast("Product removed from the basket.", false);
        await loadBasket();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "The product could not be removed.", true);
      }
    }

    async function addToMainBasket(id, searchId) {
      try {
        var response = await fetch("/api/decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: id, searchId: searchId || undefined, confirm: true })
        });
        if (!response.ok) throw new Error("The product could not be added to the main basket.");
        closeProductModal();
        showToast("Added to main basket.", false);
        await loadBasket();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "The product could not be added to the main basket.", true);
      }
    }

    async function removeFinalDecision(id) {
      if (!window.confirm("Remove this product from the main basket?")) return;
      try {
        var response = await fetch("/api/decisions/" + encodeURIComponent(id), { method: "DELETE" });
        if (!response.ok) throw new Error("The product could not be removed from the main basket.");
        showToast("Removed from main basket.", false);
        await loadBasket();
      } catch (error) {
        showToast(error instanceof Error ? error.message : "The product could not be removed from the main basket.", true);
      }
    }

    function setCheckoutModal(open) {
      var modal = element("checkout-modal");
      modal.hidden = !open;
      syncModalLock();
      if (open) {
        var decisions = asArray(decisionBasket().items);
        var items = decisions.map(function (decision) { return asRecord(decision.item); });
        var total = totalText(items);
        element("checkout-modal-summary").textContent = (decisions.length === 1 ? "1 product" : decisions.length + " products") + " selected · " + total;
        window.setTimeout(function () { modal.querySelector("[data-action='close-checkout']").focus(); }, 0);
      }
    }

    function syncModalLock() {
      document.body.classList.toggle(
        "has-modal",
        !element("checkout-modal").hidden || !element("source-modal").hidden || !element("product-modal").hidden,
      );
    }

    function productModalEnabled() {
      return window.matchMedia && window.matchMedia("(max-width: 620px)").matches;
    }

    function openProductModal(item, searchId, isActiveSearch, opener) {
      if (!item) return;
      var modal = element("product-modal");
      state.productOpener = opener || null;
      element("product-modal-content").innerHTML = productDetailMarkup(item, searchId, isActiveSearch, "product-modal-title", true);
      modal.hidden = false;
      syncModalLock();
      window.setTimeout(function () { modal.querySelector("[data-action='close-product']").focus(); }, 0);
    }

    function closeProductModal() {
      var modal = element("product-modal");
      if (modal.hidden) return;
      modal.hidden = true;
      element("product-modal-content").innerHTML = "";
      syncModalLock();
      if (state.productOpener && typeof state.productOpener.focus === "function") state.productOpener.focus();
      state.productOpener = null;
    }

    function openSourceModal(url, title, opener) {
      if (!url) return;
      var modal = element("source-modal");
      state.sourceOpener = opener || null;
      element("source-modal-title").textContent = title || "Product page";
      element("source-modal-frame").setAttribute("src", url);
      element("source-modal-external").setAttribute("href", url);
      modal.hidden = false;
      syncModalLock();
      window.setTimeout(function () { modal.querySelector("[data-action='close-source']").focus(); }, 0);
    }

    function closeSourceModal() {
      var modal = element("source-modal");
      if (modal.hidden) return;
      modal.hidden = true;
      element("source-modal-frame").setAttribute("src", "about:blank");
      element("source-modal-external").setAttribute("href", "#");
      syncModalLock();
      if (state.sourceOpener && typeof state.sourceOpener.focus === "function") state.sourceOpener.focus();
      state.sourceOpener = null;
    }

    function openCheckoutPlaceholder() {
      if (!asArray(decisionBasket().items).length) {
        showToast("Add a product to the main basket before checkout.", true);
        return;
      }
      setCheckoutModal(true);
    }

    function selectSavedSearch(searchId) {
      state.selectedSearchId = searchId;
      state.selectedId = null;
      state.search = "";
      element("search").value = "";
      render(state.basket || { context: {}, items: [] });
    }

    function openSavedSearch(searchId) {
      if (!searchId) return;
      window.location.assign("/?search=" + encodeURIComponent(searchId));
    }

    function openProductDetailPage(searchId, productId) {
      if (!productId) return;
      var query = new URLSearchParams();
      if (searchId) query.set("search", searchId);
      query.set("product", productId);
      window.location.assign("/?" + query.toString());
    }

    function returnToPreviousView(fallbackPath) {
      try {
        var referrer = document.referrer ? new URL(document.referrer) : null;
        if (referrer && referrer.origin === window.location.origin) {
          window.history.back();
          return;
        }
      } catch (_) {
        // Fall through to the saved-search archive when referrer parsing is unavailable.
      }
      window.location.assign(fallbackPath || "/searches");
    }

    document.addEventListener("click", function (event) {
      var sourceLink = event.target.closest("a[data-source-modal='true']");
      if (!sourceLink) return;
      event.preventDefault();
      openSourceModal(sourceLink.href, sourceLink.getAttribute("data-source-title"), sourceLink);
    });

    document.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      if (button.id === "refresh") {
        loadBasket();
        return;
      }
      if (button.id === "previous-search" || button.id === "next-search") {
        var searches = savedSearches();
        var currentIndex = searches.findIndex(function (search) { return search.id === state.selectedSearchId; });
        var nextIndex = button.id === "previous-search" ? currentIndex - 1 : currentIndex + 1;
        if (searches[nextIndex]) selectSavedSearch(searches[nextIndex].id);
        return;
      }
      if (button.classList.contains("filter-tab")) {
        state.filter = button.getAttribute("data-filter") || "all";
        document.querySelectorAll(".filter-tab").forEach(function (tab) {
          var active = tab === button;
          tab.classList.toggle("is-active", active);
          tab.setAttribute("aria-selected", String(active));
        });
        render(state.basket || { context: {}, items: [] });
        return;
      }
      var action = button.getAttribute("data-action");
      if (action === "select") {
        state.selectedId = button.getAttribute("data-id");
        var selectedItem = selectedResearchItems().find(function (item) { return item.id === state.selectedId; });
        if (productModalEnabled() && selectedItem) {
          var search = selectedSearch();
          openProductModal(selectedItem, search && search.id, selectedSearchIsActive(), button);
        } else {
          var activeResearch = selectedSearch();
          openProductDetailPage(activeResearch && activeResearch.id, state.selectedId);
        }
      } else if (action === "remove") {
        removeItem(button.getAttribute("data-id"));
      } else if (action === "add-to-main-basket") {
        addToMainBasket(button.getAttribute("data-id"), button.getAttribute("data-search-id"));
      } else if (action === "remove-decision") {
        removeFinalDecision(button.getAttribute("data-id"));
      } else if (action === "open-search") {
        openSavedSearch(button.getAttribute("data-search-id"));
      } else if (action === "checkout") {
        openCheckoutPlaceholder();
      } else if (action === "close-checkout") {
        setCheckoutModal(false);
      } else if (action === "close-source") {
        closeSourceModal();
      } else if (action === "close-product") {
        closeProductModal();
      } else if (action === "go-back") {
        returnToPreviousView();
      } else if (action === "go-back-product") {
        var activeSearch = selectedSearch();
        returnToPreviousView(activeSearch && activeSearch.id ? "/?search=" + encodeURIComponent(activeSearch.id) : "/searches");
      }
    });

    element("checkout-modal").addEventListener("click", function (event) {
      if (event.target === event.currentTarget) setCheckoutModal(false);
    });

    element("source-modal").addEventListener("click", function (event) {
      if (event.target === event.currentTarget) closeSourceModal();
    });

    element("product-modal").addEventListener("click", function (event) {
      if (event.target === event.currentTarget) closeProductModal();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      if (!element("source-modal").hidden) closeSourceModal();
      else if (!element("product-modal").hidden) closeProductModal();
      else if (!element("checkout-modal").hidden) setCheckoutModal(false);
    });

    element("search").addEventListener("input", function (event) {
      state.search = String(event.target.value || "").trim().toLocaleLowerCase();
      render(state.basket || { context: {}, items: [] });
    });

    element("sort").addEventListener("change", function (event) {
      state.sort = event.target.value;
      render(state.basket || { context: {}, items: [] });
    });

    element("saved-search").addEventListener("change", function (event) {
      selectSavedSearch(event.target.value);
    });

    document.addEventListener("change", function (event) {
      var select = event.target.closest("select[data-action='status']");
      if (select) updateStatus(select.getAttribute("data-id"), select.value);
    });

    loadBasket();
    window.setInterval(loadBasket, 5000);
  })();
`;
