// page-loader.js
document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):",
    "2025-06-01 06:45:14",
    "Current User's Login:",
    "Druhin13",
    "Starting page loader animation"
  );

  // Variable to track if we've already handled the webjet parameter
  let webjetHandled = false;
  let lastCheckedUrl = window.location.href;

  // Function to check for webjet parameter and click the element
  function checkAndClickWebjet() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("s") === "webjet" && !webjetHandled) {
      console.log("🔍 ?s=webjet parameter detected in URL");
      webjetHandled = true;

      setTimeout(() => {
        const webjetElement = document.getElementById("webjet");
        if (webjetElement) {
          console.log("🎯 Clicking on #webjet element");
          webjetElement.click();

          // Remove the parameter from URL after 500ms
          setTimeout(() => {
            // Create new URL without the s parameter
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("s");

            // Replace current URL without causing navigation
            history.replaceState({}, document.title, newUrl.toString());
            console.log("🧹 Removed ?s=webjet parameter from URL");

            // Reset the flag after removing the parameter, allowing future detection
            setTimeout(() => {
              webjetHandled = false;
            }, 100);
          }, 500);
        } else {
          console.warn("⚠️ #webjet element not found in the DOM");
          // Reset flag after a delay if element wasn't found
          setTimeout(() => {
            webjetHandled = false;
          }, 2000);
        }
      }, 100);
    }
  }

  // Setup continuous URL monitoring
  function setupUrlMonitoring() {
    // Check URL periodically
    const urlCheckInterval = setInterval(() => {
      if (window.location.href !== lastCheckedUrl) {
        lastCheckedUrl = window.location.href;
        checkAndClickWebjet();
      }
    }, 500); // Check every 500ms

    // Listen for URL updated event (from our deals.js code)
    window.addEventListener("urlUpdated", (event) => {
      console.log("URL updated event detected:", event.detail?.url);
      checkAndClickWebjet();
    });

    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener("popstate", () => {
      lastCheckedUrl = window.location.href;
      checkAndClickWebjet();
    });

    // Listen for hashchange events
    window.addEventListener("hashchange", () => {
      lastCheckedUrl = window.location.href;
      checkAndClickWebjet();
    });

    console.log("📡 URL monitoring activated");
  }

  // Function to enable scrolling and handle post-animation tasks
  function enableScrolling() {
    // Re-enable scroll using Lenis if available
    if (window.lenis && typeof window.lenis.start === "function") {
      window.lenis.start();
      console.log("✅ Lenis scroll enabled");

      // Initial check for webjet parameter after scrolling is enabled
      checkAndClickWebjet();

      // Force a Lenis resize to help with sticky elements
      setTimeout(() => {
        if (window.lenis.resize) {
          window.lenis.resize();
          console.log("📐 Lenis resize triggered");
        }
      }, 50);
    } else if (typeof window.enableScroll === "function") {
      window.enableScroll();
      console.log("✅ Scroll enabled via global function");

      // Initial check for webjet parameter after scrolling is enabled
      checkAndClickWebjet();
    }

    // Always remove these classes as a fallback
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
  }

  // Check if desktop
  const isDesktop = window.matchMedia("(min-width: 992px)").matches;

  // Add device class to body for CSS targeting
  document.body.classList.add(isDesktop ? "is-desktop" : "is-mobile");

  // List of elements that have different animations between desktop and mobile
  const animatedElements = [
    "nav-logo",
    "hero-direction",
    "hero-title-wrapper",
    "region-card-content1",
    "region-card-content2",
    "region-card-content",
    "hero-popup",
  ];

  if (!isDesktop) {
    // MOBILE & TABLET HANDLING
    console.log("Mobile or tablet device detected. Using simplified loader.");

    // Kill any potential GSAP animations on elements that should use CSS animations
    animatedElements.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        // Kill any existing GSAP animations on this element
        gsap.killTweensOf(element);

        // Clear any inline styles GSAP might have set
        element.style.opacity = "";
        element.style.visibility = "";
        element.style.transform = "";
        element.style.autoAlpha = "";
        element.style.y = "";
        element.style.scale = "";

        // Add a class to identify elements that should use CSS animations
        element.classList.add("css-animated");
      }
    });

    // Disable scrolling
    if (window.lenis && typeof window.lenis.stop === "function") {
      window.lenis.stop();
      console.log("🛑 Lenis scroll disabled for mobile/tablet");
    } else if (typeof window.disableScroll === "function") {
      window.disableScroll();
      console.log("🛑 Scroll disabled via global function for mobile/tablet");
    } else {
      // Fallback
      document.documentElement.classList.add("no-scroll");
      document.body.classList.add("no-scroll");
    }

    // Show all elements immediately (no GSAP animations)
    const elementsToShow = animatedElements.map((id) =>
      document.getElementById(id)
    );

    // Show elements without using GSAP
    elementsToShow.forEach((element) => {
      if (element) {
        // Use direct DOM manipulation instead of GSAP
        element.style.visibility = "visible";
        element.style.opacity = "1";
      }
    });

    // Hide page loader if it exists
    const pageLoader = document.querySelector(".page-loader");
    if (pageLoader) {
      pageLoader.style.display = "none";
    }

    // Wait for 2.5 seconds then enable scrolling
    setTimeout(() => {
      console.log("Mobile/tablet wait time complete (2.5s), enabling scroll");
      enableScrolling();
      // Set up URL monitoring after enabling scroll
      setupUrlMonitoring();
    }, 2500);

    return; // Important: Exit here to prevent any desktop GSAP code from running
  }

  // DESKTOP ANIMATION CODE STARTS HERE
  console.log("Desktop detected, running animation sequence");

  // Properly disable scroll using Lenis if available
  if (window.lenis && typeof window.lenis.stop === "function") {
    window.lenis.stop();
    console.log("🛑 Lenis scroll disabled for animation");
  } else if (typeof window.disableScroll === "function") {
    window.disableScroll();
    console.log("🛑 Scroll disabled via global function");
  } else {
    // Fallback only if needed
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
  }

  // Handle ScrollTrigger if it exists
  let scrollTriggerWasEnabled = false;
  if (typeof ScrollTrigger !== "undefined") {
    scrollTriggerWasEnabled = !ScrollTrigger.isDisabled();
    if (scrollTriggerWasEnabled) {
      ScrollTrigger.disable();
      console.log("🛑 ScrollTrigger temporarily disabled");
    }
  }

  const pageLoader = document.querySelector(".page-loader");
  const imageWrapper = document.querySelector(".page-loader-image-wrapper");
  const loaderImages = document.querySelectorAll(".page-loader-image");
  const heroTitleWrapper = document.getElementById("hero-title-wrapper");
  const navLogo = document.getElementById("nav-logo");
  const heroDirection = document.getElementById("hero-direction");
  const regionCardContent1 = document.getElementById("region-card-content1");
  const regionCardContent2 = document.getElementById("region-card-content2");
  const heroPopup = document.getElementById("hero-popup");

  const elementsToHide = [
    navLogo,
    heroDirection,
    heroTitleWrapper,
    regionCardContent1,
    regionCardContent2,
    document.getElementById("region-card-content"),
    heroPopup,
  ];

  elementsToHide.forEach((element) => {
    if (element) {
      gsap.set(element, { autoAlpha: 0 });
    }
  });

  // Set initial state for hero popup - position it below viewport
  if (heroPopup) {
    gsap.set(heroPopup, { y: 50, autoAlpha: 0 });
  }

  if (!pageLoader || !imageWrapper || loaderImages.length === 0) {
    console.error("Page loader elements not found");
    elementsToHide.forEach((element) => {
      if (element) {
        gsap.set(element, { autoAlpha: 1 });
      }
    });

    // Re-enable scroll
    enableScrolling();

    // Set up URL monitoring after enabling scroll
    setupUrlMonitoring();

    // Re-enable ScrollTrigger if it was enabled before
    if (typeof ScrollTrigger !== "undefined" && scrollTriggerWasEnabled) {
      setTimeout(() => {
        ScrollTrigger.enable();
        ScrollTrigger.refresh(true);
        console.log("✅ ScrollTrigger re-enabled and refreshed");
      }, 100);
    }

    return;
  }

  // Set initial state for loader images - no rotation, no scale
  loaderImages.forEach((img) => {
    gsap.set(img, {
      autoAlpha: 0,
    });
  });

  gsap.set(imageWrapper, {
    display: "block",
    opacity: 0,
  });

  const masterTimeline = gsap.timeline();

  function createHeroTitleAnimation() {
    if (!heroTitleWrapper) return gsap.timeline();
    const textElements = heroTitleWrapper.querySelectorAll(".text-anim h1");
    const splitTexts = [];
    gsap.set(heroTitleWrapper, { autoAlpha: 1 });
    textElements.forEach((text) => {
      text.style.opacity = "1";
      if (window.SplitText) {
        const split = new SplitText(text, {
          type: "chars",
          position: "relative",
        });
        splitTexts.push(split);
        gsap.set(split.chars, {
          y: 60,
          opacity: 0,
        });
      } else {
        console.warn(
          "SplitText not available, falling back to simple animation"
        );
        gsap.set(text, { y: 60, opacity: 0 });
        splitTexts.push({ chars: [text] });
      }
    });
    const titleTimeline = gsap.timeline();
    splitTexts.forEach((split, index) => {
      titleTimeline.to(
        split.chars,
        {
          duration: 0.7,
          y: 0,
          opacity: 1,
          ease: "power3.out",
          stagger: 0.025,
        },
        index * 0.15
      );
    });
    return titleTimeline;
  }

  function createContentAnimations() {
    const contentTimeline = gsap.timeline();

    // First part - core animations that should complete before enabling scrolling
    if (regionCardContent2) {
      contentTimeline.to(regionCardContent2, {
        scale: 1,
        autoAlpha: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    }

    if (regionCardContent1) {
      contentTimeline.to(
        regionCardContent1,
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.35"
      );
    }

    if (navLogo) {
      contentTimeline.to(
        navLogo,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.3"
      );
    }

    if (heroDirection) {
      contentTimeline.to(
        heroDirection,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.4"
      );
    }

    // Enable scrolling after core animations complete
    contentTimeline.call(() => {
      console.log("Core animations complete, enabling scroll");

      // Click nav logo animation
      const navLogoAnim = document.getElementById("nav-logo-anim");
      if (navLogoAnim) {
        console.log("Triggering nav logo animation");
        navLogoAnim.click();
      }

      enableScrolling();

      // Set up URL monitoring after enabling scroll
      setupUrlMonitoring();

      // Re-enable ScrollTrigger if it was enabled before
      if (typeof ScrollTrigger !== "undefined" && scrollTriggerWasEnabled) {
        setTimeout(() => {
          ScrollTrigger.enable();
          ScrollTrigger.refresh(true);
          console.log("✅ ScrollTrigger re-enabled and refreshed");
        }, 100);
      }
    });

    // Second part - hero popup animation (scrolling already enabled)
    if (heroPopup) {
      contentTimeline.to({}, { duration: 1.5 }); // Wait 1.5 seconds
      contentTimeline.to(heroPopup, {
        y: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    // Final callback when everything is complete
    contentTimeline.call(() => {
      console.log("All animations complete, including hero popup");
    });

    return contentTimeline;
  }

  function createLoaderAnimation() {
    const loaderTimeline = gsap.timeline();
    loaderTimeline.to(imageWrapper, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut",
    });
    loaderTimeline.to({}, { duration: 0.4 });

    // Fade-in for each image
    for (let i = 0; i < loaderImages.length; i++) {
      loaderTimeline.to(
        loaderImages[i],
        {
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        },
        i > 0 ? "-=0.1" : ""
      );

      // Add a tiny pause between images
      if (i < loaderImages.length - 1) {
        loaderTimeline.to({}, { duration: 0.05 });
      }
    }

    // Give a moment to see all images stacked
    loaderTimeline.to({}, { duration: 0.3 });

    // Transition effect for the wrapper
    loaderTimeline.to(imageWrapper, {
      boxShadow: "0 0 30px rgba(255,255,255,0.8) inset",
      duration: 0.1,
      ease: "power4.in",
    });
    loaderTimeline.set(imageWrapper, {
      maxWidth: "none",
      maxHeight: "none",
      boxShadow: "none",
    });
    loaderTimeline.to(imageWrapper, {
      width: "100vw",
      height: "100vh",
      duration: 0.8,
      ease: "power3.inOut",
    });
    return loaderTimeline;
  }

  masterTimeline
    .add(createLoaderAnimation())
    .call(() => {
      console.log("Page loader animation complete");
      pageLoader.style.display = "none";
      elementsToHide.forEach((element) => {
        if (
          element &&
          element.id !== "hero-title-wrapper" &&
          element.id !== "region-card-content1" &&
          element.id !== "region-card-content2" &&
          element.id !== "nav-logo" &&
          element.id !== "hero-direction" &&
          element.id !== "hero-popup"
        ) {
          gsap.set(element, { autoAlpha: 1 });
        }
      });
    })
    .add(createHeroTitleAnimation())
    .add(createContentAnimations(), "-=0.2");

  console.log("Starting animation sequence");
});
