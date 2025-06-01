document.addEventListener("DOMContentLoaded", function () {
  console.log(
    "Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):",
    "2025-05-22 16:45:46",
    "Current User's Login:",
    "Druhin13"
  );

  const mapWrapper = document.getElementById("initial-map-lottie-wrapper");
  const mapZoomOut = document.getElementById("map-zoom-out");
  const mapButtons = document.querySelectorAll(".map-button");
  const initialMap = document.getElementById("initial-map");
  const detailMaps = document.querySelectorAll(".all-map-wrapper .map-lottie");
  const mapTitle = document.getElementById("map-title");
  const mapDistance = document.getElementById("map-distance");
  const mapDistanceWrapper = document.getElementById("map-distance-wrapper");

  const isDesktop = window.matchMedia("(min-width: 992px)").matches;
  console.log("Device detection - isDesktop:", isDesktop);

  let distanceBaffle = null;
  if (mapDistance) {
    distanceBaffle = baffle(mapDistance);
  }

  if (!mapWrapper) return;

  let isInitialMapVisible = false;
  let isStuck = false;
  let lastScrollY = window.scrollY;

  // Make the 5th button (index 4) active by default
  mapButtons.forEach((button) => {
    button.classList.remove("inactive");
  });
  if (mapButtons.length > 4) {
    mapButtons.forEach((btn, i) => {
      if (i === 4) {
        btn.classList.remove("inactive");
        btn.style.opacity = "1";
      } else {
        btn.classList.add("inactive");
        btn.style.opacity = "0.25";
      }
    });
  }

  mapButtons.forEach((button) => {
    button.style.visibility = "visible";
    if (!button.classList.contains("inactive")) {
      button.style.opacity = "1";
    }
    gsap.set(button, { clearProps: "y,visibility" });
  });

  if (mapDistanceWrapper) {
    mapDistanceWrapper.style.visibility = "visible";
    mapDistanceWrapper.style.opacity = "1";
    gsap.set(mapDistanceWrapper, { clearProps: "y,visibility" });
  }

  if (mapTitle) {
    const titleTexts = mapTitle.querySelectorAll(".map-title-text");
    titleTexts.forEach((text) => {
      text.style.opacity = "1";
    });
  }

  if (initialMap) {
    initialMap.style.opacity = "0";
    isInitialMapVisible = false;
  }

  detailMaps.forEach((map) => {
    // Default to map5 on page load
    const firstMapId = isDesktop ? "map5" : "map5-mobile";
    if (map.id === firstMapId) {
      map.style.opacity = "1";
      if (typeof map.play === "function") {
        map.play();
      }
    } else {
      map.style.opacity = "0";
    }
    map.classList.remove("hide");
  });

  if (mapButtons.length > 4 && mapDistance) {
    // Use the 5th button's distance initially
    const initialDistance = mapButtons[4].getAttribute("data-distance");
    if (initialDistance) {
      updateDistanceWithBaffle(initialDistance);
    }
  }

  function updateDistanceWithBaffle(newDistance) {
    if (!mapDistance) return;
    const originalChars = Array.from(newDistance);
    const uniqueChars = Array.from(new Set(newDistance.split(""))).join("");
    const scrambleCount = 9.5;
    const scrambleInterval = 133;
    let currentScramble = 0;
    if (!distanceBaffle) {
      distanceBaffle = baffle(mapDistance);
    }
    distanceBaffle.set({ characters: uniqueChars, speed: 0 });
    const scrambleTimer = setInterval(() => {
      currentScramble++;
      if (currentScramble <= scrambleCount) {
        const arr = originalChars.slice();
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        distanceBaffle.text(() => arr.join(""));
      } else {
        clearInterval(scrambleTimer);
        distanceBaffle.text(() => newDistance).reveal(0, 0);
      }
    }, scrambleInterval);
  }

  function setupMapButtons() {
    if (!mapButtons.length) return;
    mapButtons.forEach((button, index) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        mapButtons.forEach((btn) => {
          if (btn !== this) {
            btn.classList.add("inactive");
            btn.style.opacity = "0.25";
          } else {
            btn.classList.remove("inactive");
            btn.style.opacity = "1";
          }
        });
        const locationName = this.querySelector(".map-button-text").innerText;
        const distance = this.getAttribute("data-distance");
        if (mapDistance) {
          updateDistanceWithBaffle(distance);
        }
        console.log(
          `Selected location: ${locationName} - Distance: ${distance}`
        );
        const mapIndex = index + 1;
        const mapId = isDesktop ? `map${mapIndex}` : `map${mapIndex}-mobile`;
        console.log(`Showing map with ID: ${mapId}`);
        detailMaps.forEach((map) => {
          if (map.id === mapId) {
            map.style.opacity = "1";
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

  function checkIfStuck() {
    if (!isDesktop) return;
    const rect = mapWrapper.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(mapWrapper);
    const position = computedStyle.position;
    const isAtTop = rect.top <= 0;
    const wasScrollingDown = window.scrollY > lastScrollY;
    if (position === "sticky" && isAtTop && wasScrollingDown && !isStuck) {
      console.log("Map is now stuck to the top of the viewport!");
      isStuck = true;
    } else if ((position !== "sticky" || !isAtTop) && isStuck) {
      console.log("Map is no longer stuck to the top");
      isStuck = false;
    }
    lastScrollY = window.scrollY;
  }

  if (isDesktop) {
    window.addEventListener("scroll", checkIfStuck, { passive: true });
  }

  setupMapButtons();

  if (mapButtons.length > 4) {
    console.log(
      "Simulating click on fifth map button for consistent initialization"
    );
    setTimeout(() => {
      mapButtons[4].click();
    }, 100);
  }

  if (isDesktop) {
    checkIfStuck();
  }

  if (isDesktop) {
    window.addEventListener("resize", checkIfStuck, { passive: true });
  }

  window.addEventListener(
    "resize",
    function () {
      const wasDesktop = isDesktop;
      const newIsDesktop = window.matchMedia("(min-width: 992px)").matches;
      if (wasDesktop !== newIsDesktop) {
        console.log("Device type changed, refreshing page for proper behavior");
        window.location.reload();
      }
    },
    { passive: true }
  );
});
