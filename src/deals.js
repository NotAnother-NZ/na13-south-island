document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):",
    "2025-06-01 06:42:00",
    "Current User's Login:",
    "Druhin13",
    "Starting content migration"
  );

  var emptyDealsElement = document.getElementById("empty-deals");
  var masonryGrid = document.querySelector(".masonry-grid-test");
  function showEmptyState(message) {
    if (!emptyDealsElement) return;
    var m = emptyDealsElement.querySelector(".body2-1");
    if (m) m.textContent = message || "There are no deals available";
    emptyDealsElement.style.display = "grid";
    masonryGrid && (masonryGrid.style.display = "none");
  }
  function hideEmptyState() {
    if (!emptyDealsElement) return;
    emptyDealsElement.style.display = "none";
    masonryGrid && (masonryGrid.style.display = "");
  }
  hideEmptyState();

  var ogDealCards = Array.from(
    document.querySelectorAll(
      "#deals-wrapper-og .deals-item.masonry-item .deal-card"
    )
  );
  var proxyDealCards = Array.from(
    document.querySelectorAll(
      ".deals-list.deals-wrapper-proxy .deals-item .deal-card"
    )
  );
  var tipsCards = Array.from(
    document.querySelectorAll("#tips-list .tips-item .tips-card")
  );
  var tipsCardFlips = Array.from(
    document.querySelectorAll("#tips-list .tips-item .tips-card-flip")
  );
  var tipsFlipMap = {};
  tipsCardFlips.forEach(function (flip) {
    var i = flip.getAttribute("data-dt-tip-index");
    if (i) tipsFlipMap[i] = flip;
  });

  console.log(`Found ${ogDealCards.length} deal cards in original wrapper`);
  console.log(`Found ${proxyDealCards.length} deal cards in proxy wrapper`);
  console.log(
    `Found ${tipsCards.length} tips cards and ${tipsCardFlips.length} flip sides`
  );

  var allDealCards = ogDealCards.concat(proxyDealCards);
  console.log(`Total of ${allDealCards.length} deal cards after merging`);
  if (allDealCards.length === 0)
    return showEmptyState("There are no deals available at this time");

  function normalizeTipsCardHeights() {
    var fronts = Array.from(document.querySelectorAll(".tips-card"));
    var backs = Array.from(document.querySelectorAll(".tips-card-flip"));
    var swipers = Array.from(document.querySelectorAll(".tips-swiper"));
    var all = fronts.concat(backs);
    all.forEach(function (c) {
      c.style.height = "";
    });
    swipers.forEach(function (s) {
      s.style.height = "";
      s.querySelectorAll(".swiper-slide").forEach(function (sl) {
        sl.style.height = "";
      });
    });
    setTimeout(function () {
      var maxH = all.reduce(function (m, c) {
        return Math.max(m, c.offsetHeight);
      }, 0);
      if (maxH > 0) {
        all.forEach(function (c) {
          c.style.height = maxH + "px";
        });
        swipers.forEach(function (s) {
          s.style.height = maxH + "px";
          s.querySelectorAll(".swiper-slide").forEach(function (sl) {
            sl.style.height = maxH + "px";
          });
          if (s.swiper) s.swiper.update();
        });
        if (window.MasonIt) MasonIt.refresh(".masonry-grid-test");
      }
    }, 50);
  }
  window.addEventListener("resize", function () {
    clearTimeout(window._dtResize);
    window._dtResize = setTimeout(function () {
      normalizeTipsCardHeights();
      updateItemsPerBatch();
    }, 250);
  });

  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Get current device type
  function getDeviceType() {
    var width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 992) return "tablet";
    return "desktop";
  }

  if (tipsCards.length > 0) {
    var total = allDealCards.length + 1;
    var seg = total / (tipsCards.length + 1);
    var pos = [];
    for (var i = 1; i <= tipsCards.length; i++) pos.push(Math.round(i * seg));
    var maxShift = Math.floor(seg * 0.4);
    pos = pos
      .map(function (p) {
        var s = Math.floor(Math.random() * (maxShift * 2 + 1)) - maxShift;
        return Math.max(1, Math.min(total - 1, p + s));
      })
      .sort(function (a, b) {
        return a - b;
      });
    for (var j = 1; j < pos.length; j++)
      if (pos[j] - pos[j - 1] < 3) pos[j] = pos[j - 1] + 3;
    if (pos[pos.length - 1] >= total)
      for (var k = pos.length - 1; k >= 0; k--)
        if (pos[k] >= total) pos[k] = total - 1 - (pos.length - 1 - k);

    console.log(`Using positions for tips: ${pos.join(", ")}`);
    shuffle(tipsCards);

    var finalOrder = [],
      tipI = 0;
    for (var d = 0; d < allDealCards.length; d++) {
      finalOrder.push({ type: "deal", node: allDealCards[d] });
      if (pos.includes(d + 1) && tipI < tipsCards.length) {
        finalOrder.push({ type: "tip", node: tipsCards[tipI] });
        tipI++;
      }
    }
    while (tipI < tipsCards.length) {
      finalOrder.push({ type: "tip", node: tipsCards[tipI] });
      tipI++;
    }
    console.log(`Final order created with ${finalOrder.length} total items`);

    shuffle(finalOrder);
    console.log("Shuffled final order for random display");

    // Handle fixed position cards
    var currentDevice = getDeviceType();
    console.log(`Current device type: ${currentDevice}`);

    // Map device type to position index in the data-dt-fixed-position attribute
    var devicePositionIndex = {
      desktop: 0,
      tablet: 1,
      mobile: 2,
    };

    // Extract cards with fixed positions
    var fixedPositionCards = [];
    var positionIndex = devicePositionIndex[currentDevice];

    // First pass: collect all fixed position cards
    finalOrder = finalOrder.filter(function (item, index) {
      if (item.type === "deal") {
        var fixedPosAttr = item.node.getAttribute("data-dt-fixed-position");
        if (fixedPosAttr) {
          var positions = fixedPosAttr.split(",").map(function (p) {
            return parseInt(p.trim(), 10);
          });
          if (
            positions.length > positionIndex &&
            !isNaN(positions[positionIndex]) &&
            positions[positionIndex] > 0
          ) {
            // Store the card and its target position
            fixedPositionCards.push({
              item: item,
              targetPosition: positions[positionIndex] - 1, // Convert to 0-based index
            });
            return false; // Remove from original array
          }
        }
      }
      return true; // Keep in original array
    });

    // Sort fixed position cards by target position (ascending)
    fixedPositionCards.sort(function (a, b) {
      return a.targetPosition - b.targetPosition;
    });

    console.log(
      `Found ${fixedPositionCards.length} cards with fixed positions for ${currentDevice}`
    );

    // Second pass: insert fixed position cards at their target positions
    fixedPositionCards.forEach(function (card) {
      // Ensure target position is within bounds
      var targetPos = Math.min(card.targetPosition, finalOrder.length);

      // Insert the card at the specified position
      finalOrder.splice(targetPos, 0, card.item);

      console.log(
        `Placed fixed position card at position ${targetPos + 1} (${
          card.item.node.querySelector(".deal-header h3")?.textContent ||
          "unnamed"
        })`
      );
    });

    var swipersData = [];
    finalOrder.forEach(function (item) {
      if (item.type === "deal") {
        masonryGrid.appendChild(item.node);
      } else {
        (function (front) {
          var idx = front.getAttribute("data-dt-tip-index");
          var backOrig = tipsFlipMap[idx];
          if (!backOrig) return masonryGrid.appendChild(front);
          var frontClone = front.cloneNode(true);
          var backClone = backOrig.cloneNode(true);
          frontClone.style.pointerEvents = "none";
          backClone.style.pointerEvents = "none";
          var container = document.createElement("div");
          container.className = "swiper-container tips-swiper";
          var wrapper = document.createElement("div");
          wrapper.className = "swiper-wrapper";
          [frontClone, backClone].forEach(function (c) {
            var slide = document.createElement("div");
            slide.className = "swiper-slide";
            slide.appendChild(c);
            wrapper.appendChild(slide);
          });
          container.appendChild(wrapper);
          masonryGrid.appendChild(container);
          setTimeout(function () {
            var s = new Swiper(container, {
              effect: "flip",
              flipEffect: { slideShadows: false },
              allowTouchMove: false,
            });
            container.swiper = s;
            swipersData.push({ s: s, c: container, done: false });
            container.addEventListener("click", function (e) {
              e.preventDefault();
              if (s.activeIndex === 0) s.slideNext();
              else s.slidePrev();
            });
          }, 100);
        })(item.node);
      }
    });

    setTimeout(function () {
      if ("IntersectionObserver" in window && swipersData.length) {
        var obs = new IntersectionObserver(
          function (ents) {
            ents.forEach(function (en) {
              var data = swipersData.find(function (d) {
                return d.c === en.target;
              });
              if (data && !data.done && en.isIntersecting) {
                data.done = true;
                setTimeout(function () {
                  if (data.s.activeIndex === 0) data.s.slideNext();
                }, 500);
              }
            });
          },
          { root: null, threshold: 0.5 }
        );
        swipersData.forEach(function (d) {
          obs.observe(d.c);
        });
      }
      normalizeTipsCardHeights();
    }, 1000);
  } else {
    allDealCards.forEach(function (c) {
      masonryGrid.appendChild(c);
    });
  }

  function removeParents(el, lvl) {
    var cur = el;
    for (var i = 0; i < lvl; i++) if (cur.parentNode) cur = cur.parentNode;
    if (cur.parentNode) cur.parentNode.removeChild(cur);
  }
  removeParents(document.getElementById("deals-wrapper-og"), 3);
  removeParents(document.querySelector(".deals-list.deals-wrapper-proxy"), 3);
  removeParents(document.getElementById("tips-list"), 3);

  var savedDeals = [],
    loadOld = function () {
      try {
        var old = JSON.parse(localStorage.getItem("savedDeals") || "[]");

        // Check for old string format (from very old versions)
        if (old.length > 0 && typeof old[0] === "string") {
          console.log("Migrating from very old format (strings) to new format");
          var nv = [];
          old.forEach(function (t) {
            var crd = Array.from(document.querySelectorAll(".deal-card")).find(
              function (c) {
                return (
                  c.querySelector(".deal-header h3")?.textContent.trim() === t
                );
              }
            );
            if (crd) {
              nv.push({
                dealName: crd.getAttribute("data-dt-deal-name") || "",
                index: parseInt(crd.getAttribute("data-dt-index") || "0"),
              });
            }
          });
          localStorage.setItem("savedDeals", JSON.stringify(nv));
          return nv;
        }

        // Check for old object format with title property (from previous version)
        if (old.length > 0 && old[0].title) {
          console.log("Migrating from old format (with title) to new format");
          var updatedDeals = old.map(function (deal) {
            return {
              dealName: deal.dealName || "",
              index: deal.index || 0,
            };
          });
          localStorage.setItem("savedDeals", JSON.stringify(updatedDeals));
          return updatedDeals;
        }

        return old;
      } catch (e) {
        console.error("Error loading saved deals:", e);
        return [];
      }
    };
  savedDeals = loadOld();
  console.log(`Found ${savedDeals.length} saved deals in localStorage`);

  // Updated function to check if a deal is saved by dealName instead of title
  function isDealSaved(dealName) {
    return savedDeals.some(function (d) {
      return d.dealName === dealName;
    });
  }

  var savedBtn = document.getElementById("saved-deals");
  if (savedBtn) savedBtn.style.display = savedDeals.length ? "" : "none";

  function refreshMasonry() {
    if (window.MasonIt)
      MasonIt.refresh(".masonry-grid-test"),
        setTimeout(normalizeTipsCardHeights, 250);
    else console.warn("MasonIt not defined");
  }

  var itemsPerBatch = { desktop: 20, tablet: 8, mobile: 5 };
  var per = itemsPerBatch[getDeviceType()];

  function updateItemsPerBatch() {
    var device = getDeviceType();
    per = itemsPerBatch[device];
    console.log(`Device type: ${device}, loading ${per} items per batch`);
  }
  updateItemsPerBatch();

  var loadMoreBtn = document.getElementById("deals-load-more"),
    shown = 0;
  var allCards = Array.from(masonryGrid.children),
    matches = [],
    cat = "All",
    onlySaved = false;
  function hideAll() {
    allCards.forEach(function (c) {
      c.style.display = "none";
    });
  }
  function applyFilters() {
    shown = 0;
    hideAll();
    hideEmptyState();
    matches = [];
    allCards.forEach(function (c) {
      var show = false,
        isTip =
          c.classList.contains("tips-card") ||
          c.classList.contains("swiper-container") ||
          c.getAttribute("data-dt-item-type") === "tip";
      if (onlySaved && isTip) return;
      if (c.classList.contains("deal-card")) {
        var dealName = c.getAttribute("data-dt-deal-name") || "",
          filt = c.getAttribute("data-dt-deal-filter");
        var okSaved = onlySaved ? dealName && isDealSaved(dealName) : true;
        var okCat = cat === "All" ? true : filt === cat;
        show = okSaved && okCat;
      } else if (!onlySaved && cat === "All") show = isTip;
      if (show) matches.push(c);
    });
    if (onlySaved && matches.length)
      matches.sort(function (a, b) {
        return (
          parseInt(a.getAttribute("data-dt-index") || "0") -
          parseInt(b.getAttribute("data-dt-index") || "0")
        );
      });
    if (!matches.length) {
      var msg;
      if (onlySaved)
        msg =
          cat === "All"
            ? "You don't have any saved deals"
            : `You don't have any saved ${cat} deals`;
      else
        msg =
          cat === "All"
            ? "There are no deals available at this time"
            : `No ${cat} deals available at this time`;
      showEmptyState(msg);
      loadMoreBtn && (loadMoreBtn.style.display = "none");
      updateMobileFilterText();
      return;
    }
    if (!onlySaved) showNext();
    else {
      matches.forEach(function (c) {
        c.style.display = "";
      });
      shown = matches.length;
      loadMoreBtn && (loadMoreBtn.style.display = "none");
      requestAnimationFrame(refreshMasonry);
    }
    updateMobileFilterText();
  }
  function showNext() {
    updateItemsPerBatch();
    var nxt = Math.min(shown + per, matches.length);
    for (var i = shown; i < nxt; i++) matches[i].style.display = "";
    shown = nxt;
    if (loadMoreBtn) {
      loadMoreBtn.style.display = shown >= matches.length ? "none" : "";
      console.log(
        `Load more button ${
          shown >= matches.length ? "hidden" : "shown"
        }: ${shown}/${matches.length} items displayed`
      );
    }
    requestAnimationFrame(refreshMasonry);
  }

  // Mobile filter dropdown functionality
  var mobileFilterBtn = document.getElementById("deals-filter-mobile");
  var mobileFilterValueText = document.getElementById(
    "deals-filter-value-mobile"
  );
  var mobileFilterDropdown = null;
  var filterOptions = [];
  var isDropdownOpen = false;
  function collectFilterOptions() {
    filterOptions = [];
    var desktopFilters = Array.from(
      document.querySelectorAll(
        ".deals-filter-button[data-dt-deal-filter]:not(#saved-deals):not(#deals-filter-mobile)"
      )
    );
    desktopFilters.forEach(function (filter) {
      var value = filter.getAttribute("data-dt-deal-filter");
      var text =
        filter.querySelector(".filter-text")?.textContent.trim() || value;
      filterOptions.push({ value: value, text: text });
    });
    console.log("Collected filter options:", filterOptions);
  }
  function updateMobileFilterText() {
    if (mobileFilterValueText) {
      var displayText = cat || "All";
      mobileFilterValueText.textContent = `(${displayText})`;
      console.log("Updated mobile filter text to:", displayText);
    }
  }
  function showMobileFilterDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    if (isDropdownOpen) {
      hideMobileFilterDropdown();
      return;
    }
    collectFilterOptions();
    if (!mobileFilterDropdown) {
      mobileFilterDropdown = document.createElement("div");
      mobileFilterDropdown.className = "mobile-filter-dropdown";
      Object.assign(mobileFilterDropdown.style, {
        position: "absolute",
        zIndex: "1000",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px",
        padding: "12px 0",
        maxHeight: "80vh",
        overflowY: "auto",
        width: "100%",
        maxWidth: "300px",
      });
      document.body.appendChild(mobileFilterDropdown);
    }
    mobileFilterDropdown.innerHTML = "";
    filterOptions.forEach(function (option) {
      var optionEl = document.createElement("div");
      optionEl.className = "mobile-filter-option";
      optionEl.textContent = option.text;
      Object.assign(optionEl.style, {
        padding: "12px 16px",
        cursor: "pointer",
      });
      var isSelected = option.value === cat;
      if (isSelected) {
        optionEl.style.backgroundColor = "rgba(0,0,0,0.05)";
        optionEl.style.fontWeight = "bold";
      }
      optionEl.addEventListener("click", function () {
        selectMobileFilter(option.value);
        hideMobileFilterDropdown();
      });
      optionEl.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "rgba(0,0,0,0.05)";
      });
      optionEl.addEventListener("mouseleave", function () {
        if (!isSelected) this.style.backgroundColor = "";
      });
      mobileFilterDropdown.appendChild(optionEl);
    });
    var btnRect = mobileFilterBtn.getBoundingClientRect();
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    mobileFilterDropdown.style.left = btnRect.left + "px";
    mobileFilterDropdown.style.top = btnRect.bottom + scrollTop + "px";
    mobileFilterDropdown.style.display = "block";
    isDropdownOpen = true;
    document.addEventListener("click", handleClickOutside);
  }
  function hideMobileFilterDropdown() {
    if (mobileFilterDropdown) mobileFilterDropdown.style.display = "none";
    isDropdownOpen = false;
    document.removeEventListener("click", handleClickOutside);
  }
  function handleClickOutside(event) {
    if (
      isDropdownOpen &&
      mobileFilterDropdown &&
      !mobileFilterDropdown.contains(event.target) &&
      !mobileFilterBtn.contains(event.target)
    ) {
      hideMobileFilterDropdown();
    }
  }
  function selectMobileFilter(value) {
    if (value) {
      cat = value;
      document
        .querySelectorAll(
          ".deals-filter-button[data-dt-deal-filter]:not(#saved-deals):not(#deals-filter-mobile)"
        )
        .forEach(function (btn) {
          btn.classList.toggle(
            "active",
            btn.getAttribute("data-dt-deal-filter") === value
          );
        });
      applyFilters();
      console.log(
        `Mobile filter selected category: ${value}, Saved status unchanged: ${onlySaved}`
      );
    }
  }
  if (mobileFilterBtn) {
    mobileFilterBtn.addEventListener("click", showMobileFilterDropdown);
    updateMobileFilterText();
    console.log("Mobile filter button initialized");
  }

  function initFilters() {
    Array.from(document.querySelectorAll(".deals-filter-button")).forEach(
      function (btn) {
        if (btn.id === "saved-deals" || btn.id === "deals-filter-mobile")
          return;
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          document
            .querySelectorAll(".deals-filter-button")
            .forEach(function (b) {
              if (b.id !== "saved-deals" && b.id !== "deals-filter-mobile")
                b.classList.remove("active");
            });
          this.classList.add("active");
          cat = this.getAttribute("data-dt-deal-filter");
          applyFilters();
        });
      }
    );
    if (savedBtn) {
      var icons = savedBtn.querySelectorAll(".deals-filter-button-icon"),
        def = icons[0],
        act = icons[1];
      savedBtn.addEventListener("click", function (e) {
        e.preventDefault();
        onlySaved = !onlySaved;
        this.classList.toggle("active", onlySaved);
        if (onlySaved) {
          def.style.display = "none";
          act.style.display = "";
          act.classList.remove("hide");
        } else {
          def.style.display = "";
          act.style.display = "none";
          act.classList.add("hide");
        }
        applyFilters();
      });
    }
    console.log("Filter functionality initialized");
  }
  initFilters();

  setTimeout(function () {
    initializePromocodeCopy();
  }, 500);

  // Function to check URL relationship with current page
  function checkUrlRelationship(url) {
    try {
      // Handle relative URLs
      if (
        url.startsWith("/") ||
        url.startsWith("./") ||
        url.startsWith("../") ||
        url.startsWith("#")
      ) {
        return { sameDomain: true, samePathWithParams: false };
      }

      // Create URL objects for comparison
      var targetUrl = new URL(url, window.location.href);
      var currentUrl = new URL(window.location.href);

      // Check if same domain
      var sameDomain = targetUrl.hostname === currentUrl.hostname;

      // Check if it's the same page with just different params
      // (same origin, pathname, and hash, just different search params)
      var samePathWithParams =
        sameDomain &&
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.hash === currentUrl.hash &&
        targetUrl.search !== currentUrl.search;

      return { sameDomain, samePathWithParams };
    } catch (e) {
      console.warn("Error checking URL relationship:", e);
      return { sameDomain: true, samePathWithParams: false };
    }
  }

  function initializePromocodeCopy() {
    Array.from(document.querySelectorAll(".promocode-copy")).forEach(function (
      btn
    ) {
      var w = btn.closest(".deal-promo-wrapper");
      if (!w) return;
      var code = w.querySelectorAll(".body3-1")[1];
      if (!code) return;
      if (window.tippy)
        tippy(btn, {
          content: "Click to copy code",
          trigger: "mouseenter focus",
          placement: "top",
          hideOnClick: false,
          onShow: function (i) {
            i.setContent("Click to copy code");
          },
        });
      btn.addEventListener("click", function () {
        var c = code.textContent.trim();
        if (navigator.clipboard)
          navigator.clipboard.writeText(c).then(function () {
            if (window.tippy && btn._tippy) {
              btn._tippy.setContent("Copied to clipboard");
              btn._tippy.show();
              setTimeout(function () {
                btn._tippy.hide();
              }, 1500);
            }
          });
      });
    });

    Array.from(document.querySelectorAll(".deal-button")).forEach(function (b) {
      b.addEventListener("click", function (e) {
        // Copy promo code if available
        var p = this.getAttribute("data-dt-promo-code") || "";
        if (p.trim() && navigator.clipboard) {
          navigator.clipboard.writeText(p.trim());
        }

        // Get the URL from the href attribute
        var url = this.getAttribute("href");
        if (!url) return; // No URL to navigate to

        // Check URL relationship with current page
        var urlRelationship = checkUrlRelationship(url);

        if (!urlRelationship.sameDomain) {
          // External link - open in new tab/window
          e.preventDefault();
          console.log(`Opening external URL in new window: ${url}`);
          window.open(url, "_blank");
        } else if (urlRelationship.samePathWithParams) {
          // Same page but with different query parameters - update URL without reloading
          e.preventDefault();

          try {
            var targetUrl = new URL(url, window.location.href);

            // Use history.replaceState to update the URL without navigating
            history.replaceState({}, document.title, targetUrl);

            console.log(
              `Updated URL with new parameters: ${targetUrl.toString()}`
            );

            // Optionally trigger an event that the URL has been updated
            var urlUpdatedEvent = new CustomEvent("urlUpdated", {
              detail: { url: targetUrl.toString() },
            });
            window.dispatchEvent(urlUpdatedEvent);
          } catch (err) {
            console.error("Error updating URL:", err);
            // Fallback to normal navigation
            window.location.href = url;
          }
        } else {
          // Same domain but different page - let default behavior happen
          console.log(`Opening internal URL in same window: ${url}`);
        }
      });
    });

    console.log("Promocode copy and link handling functionality initialized");
  }

  hideAll();
  cat = "All";
  onlySaved = false;
  var allBtn = document.querySelector(
    '.deals-filter-button[data-dt-deal-filter="All"]:not(#saved-deals)'
  );
  allBtn && allBtn.classList.add("active");
  applyFilters();
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", function () {
      if (!onlySaved) showNext();
    });
  }

  function initSaveButtons() {
    Array.from(document.querySelectorAll(".deal-card")).forEach(function (
      card
    ) {
      var h = card.querySelector(".deal-header h3");
      if (!h) return;
      var dealName = card.getAttribute("data-dt-deal-name") || "";
      var idx = card.getAttribute("data-dt-index") || "0";

      // Store dealName as the identifier instead of title
      card.dataset.dealId = dealName;

      var save = card.querySelector(".save-button"),
        unsave = card.querySelector(".unsave-button");
      if (!save || !unsave) return;

      var saveWrapper = save.closest(".saved-wrapper") || save.parentElement;

      // Check if deal is saved by dealName, not title
      save.style.display = isDealSaved(dealName) ? "none" : "block";
      unsave.style.display = isDealSaved(dealName) ? "block" : "none";

      save.addEventListener("click", function () {
        save.style.display = "none";
        unsave.style.display = "block";

        if (!isDealSaved(dealName)) {
          // Save only dealName and index, not title
          savedDeals.push({
            dealName: dealName,
            index: parseInt(idx),
          });

          localStorage.setItem("savedDeals", JSON.stringify(savedDeals));
          savedBtn &&
            savedBtn.style.display === "none" &&
            (savedBtn.style.display = "");
        }

        if (window.gsap && saveWrapper)
          gsap.fromTo(
            saveWrapper,
            { scale: 1 },
            {
              scale: 1.2,
              duration: 0.2,
              yoyo: true,
              repeat: 1,
              ease: "power1.inOut",
            }
          );
      });

      unsave.addEventListener("click", function () {
        save.style.display = "block";
        unsave.style.display = "none";

        // Find the deal by dealName instead of title
        var i = savedDeals.findIndex(function (d) {
          return d.dealName === dealName;
        });

        if (i !== -1) {
          savedDeals.splice(i, 1);
          localStorage.setItem("savedDeals", JSON.stringify(savedDeals));
          if (savedDeals.length === 0 && savedBtn) {
            savedBtn.style.display = "none";
            if (onlySaved) {
              onlySaved = false;
              savedBtn.classList.remove("active");
              var ic = savedBtn.querySelectorAll(".deals-filter-button-icon");
              ic[0].style.display = "";
              ic[1].style.display = "none";
              ic[1].classList.add("hide");
              applyFilters();
            }
          }
        }

        if (onlySaved) setTimeout(applyFilters, 50);
      });
    });
    console.log("Save/unsave functionality initialized");
  }
  initSaveButtons();

  var styleEl = document.createElement("style");
  styleEl.textContent = `
    .tips-swiper { overflow:hidden; position:relative; width:100%; cursor:pointer; }
    .swiper-slide { width:100%; display:flex; justify-content:center; align-items:center; }
    .tips-card *, .tips-card-flip * { pointer-events:none; }
    .mobile-filter-dropdown { animation: fadeIn 0.2s ease-out; }
    .mobile-filter-option:hover { background-color: rgba(0,0,0,0.05); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(styleEl);

  requestAnimationFrame(function () {
    if (window.MasonIt) {
      MasonIt.init(".masonry-grid-test");
      refreshMasonry();
      setTimeout(normalizeTipsCardHeights, 200);
      setTimeout(normalizeTipsCardHeights, 500);
      setTimeout(normalizeTipsCardHeights, 1000);
      console.log("Initial masonry layout initialized via rAF");
    } else console.warn("MasonIt is not defined for initial setup.");
  });
});
