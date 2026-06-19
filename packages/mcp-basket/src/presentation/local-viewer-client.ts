export const LOCAL_VIEWER_CLIENT = String.raw`
  (function () {
    var state = {
      basket: null,
      selectedId: null,
      filter: "all",
      search: "",
      sort: "recommended",
      toastTimer: null
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

    function sourceUrl(item) {
      var product = asRecord(item.product);
      var urls = asRecord(product.urls);
      var identifiers = asRecord(product.identifiers);
      var candidate = urls.product || urls.canonical || identifiers.sourceUrl || identifiers.canonicalUrl;
      if (typeof candidate !== "string") return "";
      try {
        var url = new URL(decodeHtmlEntities(candidate));
        return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
      } catch (_) {
        return "";
      }
    }

    function imageUrl(item) {
      var product = asRecord(item.product);
      var images = asArray(product.images);
      var firstImage = asRecord(images[0]);
      var urls = asRecord(product.urls);
      var candidate = firstImage.url || urls.image;
      return sourceUrl({ product: { urls: { product: candidate } } });
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

    function renderCandidate(item) {
      var product = asRecord(item.product);
      var price = priceRecord(item);
      var availability = availabilityInfo(item);
      var image = imageUrl(item);
      var source = sourceUrl(item);
      var listPrice = price.listAmount != null && price.amount != null && price.listAmount > price.amount
        ? '<div class="candidate-list-price">' + escapeHtml(formatMoney(price.listAmount, price.currency)) + '</div>'
        : "";
      var imageMarkup = image
        ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(displayText(product.title, "Product")) + '">'
        : escapeHtml(initials(item));
      var sourceMarkup = source
        ? '<a class="source-link" href="' + escapeHtml(source) + '" target="_blank" rel="noreferrer">View source &#8599;</a>'
        : '<span class="source-link">No source</span>';
      var selected = item.id === state.selectedId ? " is-selected" : "";
      return [
        '<article class="candidate' + selected + '" data-id="' + escapeHtml(item.id) + '">',
          '<button class="candidate-select" type="button" data-action="select" data-id="' + escapeHtml(item.id) + '" aria-label="Review ' + escapeHtml(displayText(product.title, "product")) + '">',
            '<span class="candidate-visual">' + imageMarkup + '</span>',
            '<span class="candidate-main">',
              '<h3>' + escapeHtml(displayText(product.title, "Untitled product")) + '</h3>',
              '<span class="candidate-meta">' + escapeHtml(merchantName(item)) + (product.brand ? ' &middot; ' + escapeHtml(product.brand) : "") + '</span>',
              '<span class="candidate-pills">',
                '<span class="pill ' + statusClass(item.status) + '">' + escapeHtml(statusLabel(item.status)) + '</span>',
                '<span class="pill ' + availability.className + '">' + escapeHtml(availability.label) + '</span>',
              '</span>',
            '</span>',
          '</button>',
          '<div class="candidate-side">',
            '<div><div class="candidate-price">' + escapeHtml(formatMoney(price.amount, price.currency)) + '</div>' + listPrice + '</div>',
            sourceMarkup,
          '</div>',
        '</article>'
      ].join("");
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

    function renderInspector(item) {
      var target = element("inspector-content");
      if (!item) {
        target.innerHTML = '<p class="eyebrow">Candidate review</p><h2 id="review-heading">Select a product</h2><p class="inspector-empty">Choose an option to inspect its price, evidence, and checkout readiness.</p>';
        return;
      }
      var product = asRecord(item.product);
      var price = priceRecord(item);
      var rating = asRecord(product.rating);
      var evidence = asRecord(product.evidence);
      var checkout = checkoutInfo(item);
      var source = sourceUrl(item);
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
      target.innerHTML = [
        '<div class="review-top">',
          '<div>',
            '<p class="eyebrow">Candidate review</p>',
            '<h2 class="review-title" id="review-heading">' + escapeHtml(displayText(product.title, "Untitled product")) + '</h2>',
            '<p class="review-subtitle">' + escapeHtml(merchantName(item)) + (product.brand ? ' &middot; ' + escapeHtml(product.brand) : "") + '</p>',
          '</div>',
          '<div><div class="review-price">' + escapeHtml(formatMoney(price.amount, price.currency)) + '</div>' + listPrice + '</div>',
        '</div>',
        '<div class="review-actions">',
          '<label class="stage-control"><span>Research stage</span><select data-action="status" data-id="' + escapeHtml(item.id) + '" aria-label="Research stage for ' + escapeHtml(displayText(product.title, "product")) + '">' + selectOptions(item.status) + '</select></label>',
          '<button class="remove-button" type="button" data-action="remove" data-id="' + escapeHtml(item.id) + '">Remove</button>',
        '</div>',
        '<section class="review-section"><h3>Decision data</h3><dl class="detail-grid">',
          detailRow("Availability", availabilityInfo(item).label),
          detailRow("Rating", ratingValue),
          detailRow("Quantity", String(item.quantity || 1)),
          detailRow("Selected option", options || "Not captured"),
        '</dl>', tagsMarkup(item), '</section>',
        '<section class="review-section"><h3>Key attributes</h3>', attributesMarkup(item), '</section>',
        '<section class="review-section"><h3>Research notes</h3><p>' + escapeHtml(displayText(item.notes || evidence.reason, "No rationale or notes captured yet.")) + '</p>',
          '<div class="evidence-meta">Evidence confidence: ' + escapeHtml(displayText(evidence.confidence, "unknown")) + '<br>Last updated: ' + escapeHtml(formatTime(item.updatedAt)) + '</div>',
          source ? '<p><a class="source-link" href="' + escapeHtml(source) + '" target="_blank" rel="noreferrer">Open product source &#8599;</a></p>' : "",
        '</section>',
        '<section class="review-section"><h3>Checkout readiness</h3><div class="checkout-note' + (checkoutReady ? " is-ready" : "") + '">' + escapeHtml(checkoutMessage) + '</div></section>'
      ].join("");
    }

    function render(basket) {
      state.basket = basket;
      var context = asRecord(basket.context);
      var items = asArray(basket.items);
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
      element("stat-approved-detail").textContent = approved ? "User decision recorded" : "Nothing approved";
      element("stat-total").textContent = totalText(items);
      element("stat-total-detail").textContent = Object.keys(totalByCurrency(items)).length ? "Across priced options" : "Prices not captured";
      updateTabs(items);

      var filtered = sortedItems(items.filter(matchesFilter).filter(matchesSearch));
      element("result-count").textContent = filtered.length === items.length
        ? (items.length === 1 ? "1 product in this basket" : items.length + " products in this basket")
        : (filtered.length === 1 ? "1 matching product" : filtered.length + " matching products");
      element("items").innerHTML = filtered.length
        ? filtered.map(renderCandidate).join("")
        : '<div class="empty-state"><h3>No matching products</h3><p>Try a different search or filter. New candidates added by the agent will appear here automatically.</p></div>';
      renderInspector(items.find(function (item) { return item.id === state.selectedId; }) || null);
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

    document.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      if (button.id === "refresh") {
        loadBasket();
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
        render(state.basket || { context: {}, items: [] });
      } else if (action === "remove") {
        removeItem(button.getAttribute("data-id"));
      }
    });

    element("search").addEventListener("input", function (event) {
      state.search = String(event.target.value || "").trim().toLocaleLowerCase();
      render(state.basket || { context: {}, items: [] });
    });

    element("sort").addEventListener("change", function (event) {
      state.sort = event.target.value;
      render(state.basket || { context: {}, items: [] });
    });

    document.addEventListener("change", function (event) {
      var select = event.target.closest("select[data-action='status']");
      if (select) updateStatus(select.getAttribute("data-id"), select.value);
    });

    loadBasket();
    window.setInterval(loadBasket, 5000);
  })();
`;
