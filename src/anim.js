document.addEventListener("DOMContentLoaded", function () {
  const isDesktop = window.matchMedia("(min-width: 992px)").matches;
  const scrambleCount = 5;
  const intervalMs = 133;

  document.querySelectorAll("[data-anim-type]").forEach((el) => {
    const types = el.getAttribute("data-anim-type").split(/\s+/);

    if (types.includes("baffle")) {
      const textEl =
        el.querySelector(".hero-button-text") || el.firstElementChild || el;
      const finalText = textEl.textContent.trim();
      const uniqueChars = Array.from(new Set(finalText.split(""))).join("");
      const originalChars = Array.from(finalText);
      let timerId;

      const b = baffle(textEl).set({ characters: uniqueChars, speed: 0 });

      function revealFinal() {
        clearInterval(timerId);
        b.text(() => finalText).reveal(0);
      }

      function runScramble() {
        clearInterval(timerId);
        let iteration = 0;
        timerId = setInterval(() => {
          iteration++;
          if (iteration <= scrambleCount) {
            const arr = originalChars.slice();
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            b.text(() => arr.join(""));
          } else {
            revealFinal();
          }
        }, intervalMs);
      }

      if (isDesktop) {
        el.addEventListener("mouseenter", runScramble);
        el.addEventListener("mouseleave", revealFinal);
      } else {
        el.addEventListener("click", runScramble);
      }
    }

    if (types.includes("shake")) {
      if (!window.gsap) return;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      tl.to(el, { x: -30, rotation: -9, duration: 0.05, ease: "power1.inOut" })
        .to(el, { x: 30, rotation: 15, duration: 0.1, ease: "power1.inOut" })
        .to(el, { x: -24, rotation: -12, duration: 0.1, ease: "power1.inOut" })
        .to(el, { x: 24, rotation: 9, duration: 0.1, ease: "power1.inOut" })
        .to(el, { x: -18, rotation: -6, duration: 0.1, ease: "power1.inOut" })
        .to(el, { x: 18, rotation: 3, duration: 0.1, ease: "power1.inOut" })
        .to(el, { x: 0, rotation: 0, duration: 0.05, ease: "power1.inOut" });
    }
  });
});
