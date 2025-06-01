document.addEventListener("DOMContentLoaded", function () {
  fetch("https://na13-south-island-weather-api.vercel.app/api/weather")
    .then((res) => res.json())
    .then((data) => {
      if (typeof data.temperature !== "number") return;
      const temperatureText = `${Math.round(data.temperature)}°C`;
      const weatherElements = document.querySelectorAll("[data-dt-weather]");
      weatherElements.forEach((el) => {
        el.innerText = temperatureText;
      });
    })
    .catch(() => {});
});
