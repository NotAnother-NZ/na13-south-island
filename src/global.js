(function () {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  window.scrollTo(0, 0);

  function initializeLenis() {
    if (typeof Lenis === "undefined") {
      setTimeout(initializeLenis, 50);
      return;
    }

    window.addEventListener("load", function () {
      window.scrollTo(0, 0);

      const lenis = new Lenis({
        duration: 1.15,
        lerp: 0.9,
        orientation: "vertical",
        gestureOrientation: "vertical",
        normalizeWheel: true,
        ease: "easeInOutQuad",
        wheelMultiplier: 0.85,
        smoothTouch: true,
        syncTouch: true,
        syncTouchLerp: 0,
        touchInertiaMultiplier: 10,
        touchMultiplier: 0,
      });

      window.lenis = lenis;

      console.log("✅ Lenis initialized on:", lenis.wrapper);

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      window.disableScroll = function () {
        lenis.stop();
        document.body.classList.add("no-scroll");
      };

      window.enableScroll = function () {
        lenis.start();
        document.body.classList.remove("no-scroll");
      };

      function triggerLenisResize() {
        lenis.resize();
      }

      const resizeObserver = new ResizeObserver(triggerLenisResize);
      resizeObserver.observe(document.body);

      const mutationObserver = new MutationObserver(function (mutations) {
        triggerLenisResize();
        setupScrollLinks(); // Check for new scroll links on DOM changes
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });

      window.addEventListener("resize", triggerLenisResize);

      function isDesktop() {
        return window.matchMedia("(min-width: 992px)").matches;
      }

      // Process links with empty data-dt-scroll-to
      function setupScrollLinks() {
        // Find links with empty data-dt-scroll-to
        const emptyScrollLinks = document.querySelectorAll(
          "[data-dt-scroll-to='']"
        );

        emptyScrollLinks.forEach((el) => {
          const href = el.getAttribute("href");
          if (!href || !href.startsWith("#")) return;

          // Set the data-dt-scroll-to to the href value instead of pixel count
          el.setAttribute("data-dt-scroll-to", href);

          // Store original href and remove it to prevent default navigation
          el.setAttribute("data-dt-href", href);
          el.removeAttribute("href");

          el.style.cursor = "pointer";
          console.log(`📝 Setup scroll link for target: ${href}`);
        });

        // Find links with data-dt-anchor but without data-dt-scroll-to (legacy format)
        const anchorOnlyElements = document.querySelectorAll(
          "[data-dt-anchor]:not([data-dt-scroll-to])"
        );
        anchorOnlyElements.forEach((el) => {
          const href = el.getAttribute("href");
          if (!href || !href.startsWith("#")) return;

          // Set the data-dt-scroll-to to the href value
          el.setAttribute("data-dt-scroll-to", href);

          // Store original href and remove it to prevent default navigation
          el.setAttribute("data-dt-href", href);
          el.removeAttribute("href");

          el.style.cursor = "pointer";
          console.log(`📝 Setup legacy anchor link for target: ${href}`);
        });

        // Find any links that have data-dt-scroll-to but still have href (needs cleanup)
        const unclearedLinks = document.querySelectorAll(
          "[data-dt-scroll-to][href]"
        );
        unclearedLinks.forEach((el) => {
          const href = el.getAttribute("href");
          if (!href) return;

          // Store original href and remove it to prevent default navigation
          el.setAttribute("data-dt-href", href);
          el.removeAttribute("href");

          el.style.cursor = "pointer";
          console.log(`📝 Cleared href from existing scroll link: ${href}`);
        });
      }

      setupScrollLinks();

      document.addEventListener("click", function (e) {
        let target = e.target;
        let scrollElement = null;

        // Find the closest element with data-dt-scroll-to
        while (target && target !== document) {
          if (target.hasAttribute("data-dt-scroll-to")) {
            scrollElement = target;
            break;
          }
          target = target.parentElement;
        }

        if (!scrollElement) return;

        e.preventDefault();

        // Get the target selector from data-dt-scroll-to
        const scrollTarget = scrollElement.getAttribute("data-dt-scroll-to");

        // Skip if no target or not a selector
        if (!scrollTarget || !scrollTarget.startsWith("#")) return;

        // Find the target element by ID
        const targetElement = document.querySelector(scrollTarget);
        if (!targetElement) {
          console.warn(`Scroll target not found: ${scrollTarget}`);
          return;
        }

        // Calculate offset if specified
        let offset = 0;

        // First check data-dt-anchor (new style)
        const anchorSelector = scrollElement.getAttribute("data-dt-anchor");
        if (anchorSelector) {
          const offsetElement = document.querySelector(anchorSelector);
          if (offsetElement) {
            const style = window.getComputedStyle(offsetElement);
            if (style.position === "fixed") {
              offset = offsetElement.getBoundingClientRect().height;
            } else {
              offset = offsetElement.offsetHeight;
            }
            console.log(
              `Using offset from data-dt-anchor ${anchorSelector}: ${offset}px`
            );
          }
        }
        // Fall back to data-dt-offset (compatibility)
        else {
          const offsetSelector = scrollElement.getAttribute("data-dt-offset");
          if (offsetSelector) {
            const offsetElement = document.querySelector(offsetSelector);
            if (offsetElement) {
              const style = window.getComputedStyle(offsetElement);
              if (style.position === "fixed") {
                offset = offsetElement.getBoundingClientRect().height;
              } else {
                offset = offsetElement.offsetHeight;
              }
              console.log(
                `Using offset from data-dt-offset ${offsetSelector}: ${offset}px`
              );
            }
          }
        }

        // Calculate the current scroll position right now
        const scrollY =
          targetElement.getBoundingClientRect().top + window.scrollY - offset;

        // Use different duration based on device type
        const scrollDuration = isDesktop() ? 1.5 : 0.75; // Faster on mobile

        // Scroll to the target
        lenis.scrollTo(scrollY, {
          duration: scrollDuration,
        });

        console.log(
          `📜 Lenis scrolling to ${scrollTarget} (${Math.floor(
            scrollY
          )}px, offset: ${offset}px, duration: ${scrollDuration}s)`
        );
      });
    });
  }

  initializeLenis();
})();

/* lazy images */
(function () {
  if (window.innerWidth < 1024) {
    console.log("Not forcing large images: screen < 1024px");
    return;
  }
  const images = document.querySelectorAll("img[srcset]");
  images.forEach((img) => {
    img.setAttribute("sizes", "3840px");
    console.log(`Forced largest srcset image for:`, img);
  });
})();
