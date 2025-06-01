document.addEventListener("DOMContentLoaded", function () {
  // Get the elements
  const mapWrapper = document.getElementById("initial-map-lottie-wrapper");
  const mapZoomOut = document.getElementById("map-zoom-out");
  const mapButtons = document.querySelectorAll(".map-button");
  const initialMap = document.getElementById("initial-map");
  const detailMaps = document.querySelectorAll(".all-map-wrapper .map-lottie");
  const mapTitle = document.getElementById("map-title");
  const mapDistance = document.getElementById("map-distance");
  const mapDistanceWrapper = document.getElementById("map-distance-wrapper");

  // Device detection - check if user is on desktop
  const isDesktop = window.matchMedia("(min-width: 992px)").matches;
  console.log("Device detection - isDesktop:", isDesktop);

  // Create baffle instance for distance text (for all devices)
  let distanceBaffle = null;
  if (mapDistance) {
    distanceBaffle = baffle(mapDistance, {
      characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      speed: 75,
    });
  }

  if (!mapWrapper) return; // Exit if wrapper doesn't exist

  // Variables to track state
  let isStuck = false;
  let hasTriggeredZoomOut = false;
  let lastScrollY = window.scrollY;
  let isInitialMapVisible = true;
  let titleAnimationTriggered = false;
  let titleReverseTriggered = false;
  let buttonsAnimationTriggered = false;
  let distanceAnimationTriggered = false;
  let titleAnimationTimeline = null;
  let splitTexts = [];

  // Remove inactive class from all map buttons initially
  mapButtons.forEach((button) => {
    button.classList.remove("inactive");
  });

  // Handle initial visibility differently based on device
  if (isDesktop) {
    // On desktop: Hide map buttons and distance wrapper but keep CSS intact
    mapButtons.forEach((button) => {
      // Using visibility and not opacity to avoid interfering with CSS transitions
      gsap.set(button, {
        visibility: "hidden",
        y: 20,
      });
    });

    if (mapDistanceWrapper) {
      gsap.set(mapDistanceWrapper, {
        visibility: "hidden",
        y: 20,
      });
    }

    // Set initial opacity for map title text to 0 on desktop
    if (mapTitle) {
      const titleTexts = mapTitle.querySelectorAll(".map-title-text");
      titleTexts.forEach((text) => {
        text.style.opacity = "0";
      });
    }
  } else {
    // On mobile/tablet: Make map buttons and distance wrapper visible immediately
    mapButtons.forEach((button) => {
      button.style.visibility = "visible";
      button.style.opacity = "1";
    });

    if (mapDistanceWrapper) {
      mapDistanceWrapper.style.visibility = "visible";
      mapDistanceWrapper.style.opacity = "1";
    }

    // Make map title visible immediately on mobile/tablet
    if (mapTitle) {
      const titleTexts = mapTitle.querySelectorAll(".map-title-text");
      titleTexts.forEach((text) => {
        text.style.opacity = "1";
      });
    }
  }

  // FIXED: Set initial opacity for maps based on device type
  if (initialMap) {
    if (isDesktop) {
      // On desktop, show the initial map
      initialMap.style.opacity = "1";
    } else {
      // On mobile/tablet, hide the initial map
      initialMap.style.opacity = "0";
    }
  }

  // Set all detail maps to opacity 0 initially
  detailMaps.forEach((map) => {
    map.style.opacity = "0";
    map.classList.remove("hide");
  });

  // FIXED: Show the first mobile map as initial for mobile/tablet
  if (!isDesktop) {
    const mobileMap1 = document.getElementById("map1-mobile");
    if (mobileMap1) {
      mobileMap1.style.opacity = "1";
      // Play the lottie animation if necessary
      if (typeof mobileMap1.play === "function") {
        mobileMap1.play();
      }
    }
  }

  // Set up the text animation using GSAP SplitText - desktop only
  function setupTitleAnimation() {
    if (!isDesktop || !mapTitle || titleAnimationTriggered) return;

    // Create SplitText instances for each title line
    const titleTexts = mapTitle.querySelectorAll(".map-title-text");
    splitTexts = [];

    titleTexts.forEach((text) => {
      // Make parent visible for proper splitting but keep characters hidden
      text.style.opacity = "1";

      // Split text into characters
      const split = new SplitText(text, {
        type: "chars",
        position: "relative",
      });
      splitTexts.push(split);

      // Initial state - hide all characters
      gsap.set(split.chars, {
        y: 60,
        opacity: 0,
      });
    });

    // Create the animation timeline
    titleAnimationTimeline = gsap.timeline();

    // Add animations for each line of text
    splitTexts.forEach((split, index) => {
      titleAnimationTimeline.to(
        split.chars,
        {
          duration: 0.8,
          y: 0,
          opacity: 1,
          ease: "power4.out",
          stagger: 0.03,
        },
        index * 0.2
      ); // Slight delay between lines
    });

    // Mark as triggered so it doesn't run again
    titleAnimationTriggered = true;
  }

  // Function to reverse the title animation - desktop only
  function reverseTitleAnimation() {
    if (
      !isDesktop ||
      !mapTitle ||
      !titleAnimationTriggered ||
      titleReverseTriggered
    )
      return;

    console.log("Reversing title animation");
    titleReverseTriggered = true;

    const reverseTimeline = gsap.timeline({
      onComplete: function () {
        // After title reverses, trigger the buttons animation after 1 second
        setTimeout(animateMapButtons, 1000);
      },
    });

    // Reverse animation for each split text
    splitTexts.forEach((split, index) => {
      reverseTimeline.to(
        split.chars,
        {
          duration: 0.25,
          y: -60,
          opacity: 0,
          ease: "power4.in",
          stagger: 0.02,
        },
        index * 0.1
      );
    });
  }

  // Function to animate map buttons - desktop only
  function animateMapButtons() {
    if (!isDesktop || buttonsAnimationTriggered) return;
    buttonsAnimationTriggered = true;

    console.log("Animating map buttons");

    // Show all buttons first (make them visible but keep opacity 0)
    mapButtons.forEach((button) => {
      button.style.visibility = "visible";
      // We don't set opacity here to preserve CSS transitions
    });

    const buttonsTimeline = gsap.timeline({
      onComplete: function () {
        // After all buttons are visible, trigger distance wrapper animation after 1 seconds
        setTimeout(animateDistanceWrapper, 1000);

        // Clear any inline styles that might interfere with CSS transitions
        mapButtons.forEach((button) => {
          gsap.set(button, { clearProps: "transform,opacity" });
        });
      },
    });

    // Animate each button in sequence
    buttonsTimeline.to(mapButtons, {
      duration: 0.5,
      opacity: 1,
      y: 0,
      stagger: 0.1,
      ease: "power3.out",
    });
  }

  // Function to animate distance wrapper - desktop only
  function animateDistanceWrapper() {
    if (!isDesktop || !mapDistanceWrapper || distanceAnimationTriggered) return;
    distanceAnimationTriggered = true;

    console.log("Animating distance wrapper");

    // Make visible first
    mapDistanceWrapper.style.visibility = "visible";

    gsap.to(mapDistanceWrapper, {
      duration: 0.35,
      opacity: 1,
      y: 0,
      ease: "power3.out",
      onComplete: function () {
        gsap.set(mapDistanceWrapper, { clearProps: "all" });
      },
    });
  }

  // Function to update distance text with baffle effect - for all devices
  function updateDistanceWithBaffle(newDistance) {
    if (!mapDistance || !distanceBaffle) return;

    // Start the baffle effect
    distanceBaffle.text((currentText) => newDistance).start();

    // After 0.5 seconds, reveal the actual text
    setTimeout(() => {
      distanceBaffle.reveal(350, 0);
    }, 350);
  }

  // Create Intersection Observer for the title animation - desktop only
  if (isDesktop && mapTitle) {
    const titleObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !titleAnimationTriggered) {
          console.log("Map title is in view - triggering animation");
          setupTitleAnimation();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    titleObserver.observe(mapTitle);
  }

  // Function to handle map button clicks - for all devices
  function setupMapButtons() {
    if (!mapButtons.length) return;

    mapButtons.forEach((button, index) => {
      button.addEventListener("click", function (e) {
        e.preventDefault(); // Prevent default link behavior

        // Make all other buttons inactive
        mapButtons.forEach((btn) => {
          if (btn !== this) {
            btn.classList.add("inactive");
          } else {
            btn.classList.remove("inactive");
          }
        });

        // Get the location name and distance from the button
        const locationName = this.querySelector(".map-button-text").innerText;
        const distance = this.getAttribute("data-distance");

        // Update the distance display using baffle effect
        if (mapDistance) {
          updateDistanceWithBaffle(distance);
        }

        console.log(
          `Selected location: ${locationName} - Distance: ${distance}`
        );

        // Hide initial map if it's visible - instant change
        if (initialMap && isInitialMapVisible) {
          initialMap.style.opacity = "0";
          isInitialMapVisible = false;
        }

        // Get the corresponding map ID - maps start from index 1
        const mapIndex = index + 1;

        // UPDATED: Use different map IDs based on device type
        const mapId = isDesktop ? `map${mapIndex}` : `map${mapIndex}-mobile`;

        console.log(
          `Using map ID: ${mapId} for ${
            isDesktop ? "desktop" : "mobile/tablet"
          }`
        );

        // Show the corresponding map and hide others using opacity - instant change
        detailMaps.forEach((map) => {
          if (map.id === mapId) {
            map.style.opacity = "1";
            // Play the lottie animation if necessary
            if (typeof map.play === "function") {
              map.play();
            }
          } else {
            map.style.opacity = "0";
          }
        });
      });
    });
  }

  // Function to check if element is stuck at top and trigger zoom out - desktop only
  function checkIfStuck() {
    if (!isDesktop) return; // Skip on mobile/tablet

    // Get the element's position relative to the viewport
    const rect = mapWrapper.getBoundingClientRect();

    // Get computed style to check if position is sticky
    const computedStyle = window.getComputedStyle(mapWrapper);
    const position = computedStyle.position;

    // Calculate when element is stuck at top
    const isAtTop = rect.top <= 0;
    const wasScrollingDown = window.scrollY > lastScrollY;

    // Check for the stuck condition and trigger zoom out and title reverse
    if (position === "sticky" && isAtTop && wasScrollingDown && !isStuck) {
      console.log("Map is now stuck to the top of the viewport!");
      isStuck = true;

      // Trigger the zoom out click, but only once
      if (mapZoomOut && !hasTriggeredZoomOut) {
        console.log("Triggering map zoom out!");
        mapZoomOut.click();
        hasTriggeredZoomOut = true;
      }

      // Reverse the title animation after 0.5 seconds
      if (titleAnimationTriggered && !titleReverseTriggered) {
        setTimeout(() => {
          reverseTitleAnimation();
        }, 750); // 0.75 seconds delay
      }
    } else if ((position !== "sticky" || !isAtTop) && isStuck) {
      console.log("Map is no longer stuck to the top");
      isStuck = false;
    }

    // Update last scroll position
    lastScrollY = window.scrollY;
  }

  // Alternative method: Intersection Observer - desktop only
  if (isDesktop && mapWrapper) {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        // When element's top edge aligns with viewport top edge
        if (
          entry.boundingClientRect.top <= 0 &&
          entry.isIntersecting &&
          !hasTriggeredZoomOut
        ) {
          console.log(
            "Map element has reached the top of the viewport (observer)"
          );

          // Trigger the zoom out click, but only once
          if (mapZoomOut && !hasTriggeredZoomOut) {
            console.log("Triggering map zoom out (from observer)!");
            mapZoomOut.click();
            hasTriggeredZoomOut = true;

            // Also trigger title animation reverse after 0.5 seconds
            if (titleAnimationTriggered && !titleReverseTriggered) {
              setTimeout(() => {
                reverseTitleAnimation();
              }, 500); // 0.5 seconds delay
            }
          }
        }
      },
      {
        threshold: [0],
        rootMargin: "0px 0px 0px 0px",
      }
    );

    observer.observe(mapWrapper);
  }

  // Add scroll event listener - desktop only
  if (isDesktop) {
    window.addEventListener("scroll", checkIfStuck, { passive: true });
  }

  // Set up map buttons for all devices
  setupMapButtons();

  // Initial check - desktop only
  if (isDesktop) {
    checkIfStuck();
  }

  // Add resize event listener to recheck on window resize - desktop only
  if (isDesktop) {
    window.addEventListener("resize", checkIfStuck, { passive: true });
  }

  // Add window resize event listener to handle device width changes
  window.addEventListener(
    "resize",
    function () {
      const wasDesktop = isDesktop;
      const newIsDesktop = window.matchMedia("(min-width: 992px)").matches;

      // Only do something if device type changed
      if (wasDesktop !== newIsDesktop) {
        console.log("Device type changed, refreshing page for proper behavior");
        // Refresh the page to reinitialize everything correctly
        window.location.reload();
      }
    },
    { passive: true }
  );
});
