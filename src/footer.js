document.addEventListener("DOMContentLoaded", function () {
  // Device detection - only run on desktop (width >= 992px)
  const isDesktop = window.matchMedia("(min-width: 992px)").matches;

  // --- IMAGE TRAIL EFFECT (DESKTOP ONLY) ---
  if (isDesktop) {
    const footer = document.querySelector(".footer-section");
    if (!footer) return;
    footer.style.position = "relative";

    // Get footer-credit-wrapper elements and footer-text
    const creditWrappers = footer.querySelectorAll(".footer-credit-wrapper");
    const footerText = footer.querySelector("#footer-text");

    // Track if user is hovering over credit links
    let isHoveringCreditLinks = false;

    // Ensure elements stay above trail by setting z-index
    creditWrappers.forEach((wrapper) => {
      if (getComputedStyle(wrapper).position === "static") {
        wrapper.style.position = "relative";
      }
      wrapper.style.zIndex = "10";
    });

    // Set z-index for footer-text if it exists
    if (footerText) {
      if (getComputedStyle(footerText).position === "static") {
        footerText.style.position = "relative";
      }
      footerText.style.zIndex = "10";
    }

    // Create container for image trail
    const trail = document.createElement("div");
    trail.className = "footer-trail-container";
    Object.assign(trail.style, {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: "5",
    });
    footer.appendChild(trail);

    // Get images for the trail
    const imgs = Array.from(document.querySelectorAll(".footer-image"));
    if (!imgs.length) return;

    // Utility functions
    const utils = {
      // Linear interpolation for smooth movement
      lerp: (start, end, t) => (1 - t) * start + t * end,
      // Calculate distance between two points
      distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
    };

    // Mouse position tracking
    let mousePos = { x: 0, y: 0 }; // Current mouse position
    let prevMousePos = { x: 0, y: 0 }; // Previous mouse position for threshold check
    let smoothMousePos = { x: 0, y: 0 }; // Interpolated mouse position for smooth movement

    // Trail settings
    const threshold = 50; // Distance threshold to trigger new image
    let zIndexVal = 1; // Z-index counter for layering
    let lastImageIndex = -1; // Track the last shown image index to prevent repeats
    let imagesArray = []; // Array to hold all image objects
    let sourceImages = []; // Array to hold references to source images

    // Image class (similar to the reference code)
    class TrailImage {
      constructor(el, sourceIndex) {
        this.DOM = { el: el };
        this.sourceIndex = sourceIndex; // Track which original image this came from
        this.defaultStyle = { x: 0, y: 0, opacity: 0 };

        // Ensure image has the correct styles
        Object.assign(this.DOM.el.style, {
          position: "absolute",
          opacity: "0",
          pointerEvents: "none",
          borderRadius: "0px",
          objectFit: "cover",
          width: "180px", // Match reference size
        });

        this.getRect();
        gsap.set(this.DOM.el, this.defaultStyle);
      }

      // Get image dimensions for positioning calculations
      getRect() {
        this.rect = this.DOM.el.getBoundingClientRect();
      }

      // Check if image is currently active (being animated)
      isActive() {
        return gsap.isTweening(this.DOM.el) || this.DOM.el.style.opacity != 0;
      }

      // Reset the image
      reset() {
        this.getRect(); // Update dimensions
        gsap.set(this.DOM.el, this.defaultStyle);
      }
    }

    // Create and prepare trail images
    function setupImages() {
      // Clear existing images if any
      imagesArray = [];
      sourceImages = [...imgs]; // Store references to original images

      // Create multiple clones for each image for smoother animation
      const numCopiesPerImage = 2; // Number of clones per original image

      sourceImages.forEach((img, i) => {
        for (let j = 0; j < numCopiesPerImage; j++) {
          const clone = img.cloneNode(true);
          trail.appendChild(clone);
          imagesArray.push(new TrailImage(clone, i)); // Store source index
        }
      });
    }

    // Get a random image index that's different from the last one shown
    function getNextImageIndex() {
      if (sourceImages.length <= 1) return 0; // Only one image, no choice

      let availableIndices = [];

      // Get all currently available image indices (not being animated)
      for (let i = 0; i < imagesArray.length; i++) {
        if (!imagesArray[i].isActive()) {
          // Only consider images from a different source than the last shown
          if (imagesArray[i].sourceIndex !== lastImageIndex) {
            availableIndices.push(i);
          }
        }
      }

      // If no available images, just get all unused ones
      if (availableIndices.length === 0) {
        availableIndices = Array.from(
          { length: imagesArray.length },
          (_, i) => i
        ).filter((i) => !imagesArray[i].isActive());
      }

      // Still nothing available? Use any random index
      if (availableIndices.length === 0) {
        availableIndices = Array.from(
          { length: imagesArray.length },
          (_, i) => i
        );
      }

      // Pick a random available image
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      return availableIndices[randomIndex];
    }

    // Show the next image in the sequence
    function showNextImage() {
      // Don't show images if hovering over credit links
      if (isHoveringCreditLinks) return;

      const imgIndex = getNextImageIndex();
      const img = imagesArray[imgIndex];

      // Remember which source image we just used
      lastImageIndex = img.sourceIndex;

      // Kill any existing animations on this element
      gsap.killTweensOf(img.DOM.el);

      // Update dimensions to ensure accurate positioning
      img.getRect();

      // Create a GSAP timeline for this image
      const tl = gsap.timeline({
        onComplete: () => {
          // After animation completes, prepare for reuse
          gsap.set(img.DOM.el, img.defaultStyle);
        },
      });

      // The exact animation sequence from the reference
      tl.set(
        img.DOM.el,
        {
          startAt: { opacity: 0 },
          opacity: 1,
          zIndex: zIndexVal,
          x: smoothMousePos.x - img.rect.width / 2,
          y: smoothMousePos.y - img.rect.height / 2,
        },
        0
      )

        .to(
          img.DOM.el,
          {
            duration: 1.6,
            ease: "expo.out",
            x: mousePos.x - img.rect.width / 2,
            y: mousePos.y - img.rect.height / 2,
          },
          0
        )

        .to(
          img.DOM.el,
          {
            duration: 1,
            ease: "power1.out",
            opacity: 0,
          },
          0.4
        )

        .to(
          img.DOM.el,
          {
            duration: 1,
            ease: "quint.inOut",
            y: `+=${window.innerHeight / 2 + img.rect.height / 2}`,
          },
          0.4
        );

      // Increase z-index
      zIndexVal++;

      // Update previous mouse position
      prevMousePos = { ...mousePos };
    }

    // Main render loop
    function render() {
      // Check if footer is in viewport
      const footerRect = footer.getBoundingClientRect();
      const isFooterVisible =
        footerRect.bottom > 0 && footerRect.top < window.innerHeight;

      if (isFooterVisible && !isHoveringCreditLinks) {
        // Smooth mouse movement with exactly the same lerp value as reference (0.1)
        smoothMousePos.x = utils.lerp(
          smoothMousePos.x || mousePos.x,
          mousePos.x,
          0.1
        );
        smoothMousePos.y = utils.lerp(
          smoothMousePos.y || mousePos.y,
          mousePos.y,
          0.1
        );

        // Calculate distance moved
        const distance = utils.distance(
          prevMousePos.x,
          prevMousePos.y,
          mousePos.x,
          mousePos.y
        );

        // Only show new image if we've moved beyond threshold
        if (distance > threshold) {
          showNextImage();
        }
      }

      // Check if we should reset z-index
      let allInactive = true;
      for (let img of imagesArray) {
        if (img.isActive()) {
          allInactive = false;
          break;
        }
      }

      // Reset z-index if all images are inactive
      if (allInactive && zIndexVal !== 1) {
        zIndexVal = 1;
      }

      // Continue animation loop
      requestAnimationFrame(render);
    }

    // Track mouse position helper function (from reference code)
    function getMousePos(e) {
      let posx = 0;
      let posy = 0;

      if (!e) e = window.event;

      if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy =
          e.pageY - window.pageYOffset - footer.getBoundingClientRect().top;
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft;
        posy = e.clientY + document.body.scrollTop;
      }

      return { x: posx, y: posy };
    }

    // Mouse move event handler
    function handleMouseMove(e) {
      mousePos = getMousePos(e);
    }

    // Initialize the effect
    function init() {
      setupImages();
      footer.addEventListener("mousemove", handleMouseMove);
      requestAnimationFrame(render);

      // Set up event listeners for credit links
      const creditLinkElements = document.querySelectorAll(
        "[data-dt-footer-credit-links]"
      );

      creditLinkElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          isHoveringCreditLinks = true;
        });

        el.addEventListener("mouseleave", () => {
          isHoveringCreditLinks = false;
          // Update previous mouse position to prevent immediate image spawn
          prevMousePos = { ...mousePos };
        });
      });
    }

    // Start the effect
    init();

    // Handle window resize
    window.addEventListener("resize", function () {
      const nowDesktop = window.matchMedia("(min-width: 992px)").matches;

      if (!nowDesktop && trail.parentNode) {
        footer.removeEventListener("mousemove", handleMouseMove);
        footer.removeChild(trail);
      } else if (nowDesktop && !footer.contains(trail)) {
        footer.appendChild(trail);
        footer.addEventListener("mousemove", handleMouseMove);
        init(); // Reinitialize when adding back
      }

      // Update image dimensions on resize
      imagesArray.forEach((img) => img.getRect());
    });
  }
  // --- MOBILE/TABLET IMAGE STACKING ANIMATION ---
  else {
    // Only run on mobile/tablet
    const footerTrailingImages = document.querySelector(
      ".footer-trailing-images"
    );
    if (footerTrailingImages) {
      const images = footerTrailingImages.querySelectorAll(".footer-image");
      if (!images.length) return;

      // Hide all images initially
      gsap.set(images, {
        autoAlpha: 0,
        zIndex: 0,
      });

      // Number of images to show at a time
      const maxVisibleImages = 8;

      // Initialize tracking variables
      let currentIndex = 0;
      let visibleStack = [];
      let stackZIndex = 1; // Keep track of z-index for proper stacking

      // Generate random offset within a range (5x larger than before)
      const randomOffset = (min, max) => min + Math.random() * (max - min);

      // Function to show next image
      function showNextImage() {
        // Get the next image in sequence
        const nextImage = images[currentIndex];

        // Increment index and loop if needed
        currentIndex = (currentIndex + 1) % images.length;

        // Increase z-index for proper stacking
        stackZIndex += 1;

        // Add to our visible stack (always at the end/top)
        visibleStack.push(nextImage);

        // Generate random offsets
        const offsetX = randomOffset(-40, 40);
        const offsetY = randomOffset(-40, 40);

        // Just set the image to final position immediately without animation
        // This creates a more "lo-fi" appearance with no easing or movement
        gsap.set(nextImage, {
          autoAlpha: 1,
          zIndex: stackZIndex,
          x: offsetX,
          y: offsetY,
        });

        // If we have more than maxVisibleImages, remove the oldest one (from the start/bottom)
        if (visibleStack.length > maxVisibleImages) {
          const oldestImage = visibleStack.shift(); // Remove from the beginning (bottom of stack)

          // Just set opacity to 0 immediately without animation
          gsap.set(oldestImage, {
            autoAlpha: 0,
            zIndex: 0,
          });
        }
      }

      // Show initial stack with slight delay between each image
      for (let i = 0; i < maxVisibleImages; i++) {
        setTimeout(() => {
          showNextImage();
        }, i * 100); // Keep the same timing for initial setup
      }

      // Set up infinite animation with variable timing
      function animateStack() {
        // Keep the same random delay range as before
        const delay = 600 + Math.random() * 600;

        setTimeout(() => {
          showNextImage();
          animateStack(); // Recursive call for infinite animation
        }, delay);
      }

      // Start the infinite animation after initial stack is shown
      setTimeout(animateStack, maxVisibleImages * 100 + 300);
    }
  }

  // --- LINK HOVER EFFECT (ALL DEVICES) ---
  // Find all elements with data-dt-footer-credit-links attribute
  const creditLinkGroups = document.querySelectorAll(
    "[data-dt-footer-credit-links]"
  );

  creditLinkGroups.forEach((group) => {
    // Find all links within this group
    const links = group.querySelectorAll("a");

    // Skip if there are no links
    if (!links.length) return;

    // Add event listeners to each link
    links.forEach((link) => {
      // On mouse enter, reduce opacity of other links in the same group
      link.addEventListener("mouseenter", () => {
        links.forEach((otherLink) => {
          if (otherLink !== link) {
            gsap.to(otherLink, {
              opacity: 0.15,
              duration: 0.3,
              ease: "power2.out",
            });
          }
        });
      });

      // On mouse leave, restore opacity of all links in the group
      link.addEventListener("mouseleave", () => {
        links.forEach((otherLink) => {
          gsap.to(otherLink, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    });

    // Add event listener to the whole group to handle edge cases
    group.addEventListener("mouseleave", () => {
      // Ensure all links are restored when leaving the entire group
      links.forEach((link) => {
        gsap.to(link, {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      });
    });
  });

  // --- NEW ZEALAND LIVE TIME ---
  // Find all elements with data-dt-time attribute
  const timeElements = document.querySelectorAll("[data-dt-time]");

  if (timeElements.length > 0) {
    // Function to update the time in all elements
    function updateNZTime() {
      const nzTime = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Pacific/Auckland" })
      );

      const hours = nzTime.getHours().toString().padStart(2, "0");
      const minutes = nzTime.getMinutes().toString().padStart(2, "0");
      const formattedTime = `${hours}:${minutes}`;

      const liveElements = document.querySelectorAll("[data-dt-time]");
      liveElements.forEach((element) => {
        element.textContent = formattedTime;
      });
    }

    // Update immediately and then every second
    updateNZTime();
    setInterval(updateNZTime, 1000);
  }
});
