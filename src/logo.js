document.addEventListener("DOMContentLoaded", function () {
  const logo = document.getElementById("nav-logo");
  const anim = document.getElementById("nav-logo-anim");

  let timeoutId = null;

  function triggerAnim() {
    if (anim) anim.click();
  }

  function scheduleNext() {
    const delay = Math.floor(Math.random() * 5000) + 10000;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      triggerAnim();
      scheduleNext();
    }, delay);
  }

  if (logo) {
    logo.addEventListener("mouseenter", () => {
      triggerAnim();
      scheduleNext();
    });
  }

  scheduleNext();
});
