document.addEventListener("DOMContentLoaded", function () {
  const makeItDifferentButton = document.getElementById(
    "make-it-different-button"
  );
  const cardContainer = document.querySelector(".local-tips-card-list");
  let tipCards = Array.from(
    cardContainer.querySelectorAll(".local-tips-card-list-item")
  );
  if (!makeItDifferentButton || tipCards.length === 0 || !cardContainer) return;
  cardContainer.style.position = "relative";
  cardContainer.style.height = `${tipCards[0].offsetHeight}px`;
  tipCards.forEach((card, index) => {
    card.style.position = "absolute";
    card.style.width = "100%";
    card.style.zIndex = tipCards.length - index;
    card.style.transition = "transform 0.75s cubic-bezier(0.19, 1, 0.22, 1)";
    card.style.transform = index === 0 ? "translateY(0)" : "translateY(100%)";
  });
  tipCards[0].classList.add("is-active");
  window.addEventListener("resize", () => {
    cardContainer.style.height = `${tipCards[0].offsetHeight}px`;
  });
  let isAnimating = false;
  function shakeButton() {
    if (!window.gsap) return;
    gsap.killTweensOf(makeItDifferentButton);
    gsap
      .timeline()
      .to(makeItDifferentButton, {
        x: -30,
        rotation: -9,
        duration: 0.05,
        ease: "power1.inOut",
      })
      .to(makeItDifferentButton, {
        x: 30,
        rotation: 15,
        duration: 0.1,
        ease: "power1.inOut",
      })
      .to(makeItDifferentButton, {
        x: -24,
        rotation: -12,
        duration: 0.1,
        ease: "power1.inOut",
      })
      .to(makeItDifferentButton, {
        x: 24,
        rotation: 9,
        duration: 0.1,
        ease: "power1.inOut",
      })
      .to(makeItDifferentButton, {
        x: -18,
        rotation: -6,
        duration: 0.1,
        ease: "power1.inOut",
      })
      .to(makeItDifferentButton, {
        x: 18,
        rotation: 3,
        duration: 0.1,
        ease: "power1.inOut",
      })
      .to(makeItDifferentButton, {
        x: 0,
        rotation: 0,
        duration: 0.05,
        ease: "power1.inOut",
      });
  }
  function goToNextSlide() {
    if (isAnimating) return;
    isAnimating = true;
    shakeButton();
    const current = tipCards.find((card) =>
      card.classList.contains("is-active")
    );
    const currentIndex = tipCards.indexOf(current);
    const nextIndex = (currentIndex + 1) % tipCards.length;
    const next = tipCards[nextIndex];
    tipCards.forEach((card) => card.classList.remove("is-active"));
    next.classList.add("is-active");
    current.style.transform = "translateY(-100%)";
    next.style.transform = "translateY(0)";
    function onTransitionEnd() {
      current.removeEventListener("transitionend", onTransitionEnd);
      cardContainer.appendChild(current);
      tipCards = Array.from(
        cardContainer.querySelectorAll(".local-tips-card-list-item")
      );
      tipCards.forEach((card, i) => {
        card.style.transition =
          "transform 0.75s cubic-bezier(0.19, 1, 0.22, 1)";
        card.style.zIndex = tipCards.length - i;
        card.style.transform = card.classList.contains("is-active")
          ? "translateY(0)"
          : "translateY(100%)";
      });
      isAnimating = false;
    }
    current.addEventListener("transitionend", onTransitionEnd);
  }
  makeItDifferentButton.addEventListener("click", (e) => {
    e.preventDefault();
    goToNextSlide();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
      goToNextSlide();
    }
  });
});
