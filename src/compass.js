document.addEventListener("DOMContentLoaded", function () {
  const heroSection = document.getElementById("hero-section");
  const directionDisplay = document.getElementById("hero-direction");

  let targetAngle = null;
  let currentAngle = null;
  let displayAngle = null;
  let lastLabel = "";

  function getDirectionLabel(angle) {
    const compassDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const directionIndex = Math.round(angle / 45) % 8;
    const direction = compassDirections[directionIndex];
    return `${Math.round(angle)}˚${direction}`;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function shortestAngle(from, to) {
    let difference = to - from;
    if (difference > 180) difference -= 360;
    if (difference < -180) difference += 360;
    return from + difference;
  }

  function animate() {
    if (targetAngle === null) return requestAnimationFrame(animate);
    if (currentAngle === null) currentAngle = targetAngle;
    if (displayAngle === null) displayAngle = targetAngle;
    currentAngle = shortestAngle(currentAngle, targetAngle);
    displayAngle = lerp(displayAngle, currentAngle, 0.08);
    const normalized = (displayAngle + 360) % 360;
    const label = getDirectionLabel(normalized);
    if (label !== lastLabel) {
      directionDisplay.textContent = label;
      lastLabel = label;
    }
    requestAnimationFrame(animate);
  }

  animate();

  heroSection.addEventListener("mousemove", function (e) {
    const rect = heroSection.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = centerY - e.clientY;
    const angleRad = Math.atan2(dx, dy);
    targetAngle = (angleRad * (180 / Math.PI) + 360) % 360;
  });
});
