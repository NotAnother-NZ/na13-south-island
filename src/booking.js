(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    console.log(
      "Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted):",
      "2025-05-16 04:36:50", // Updated timestamp
      "Current User's Login:",
      "Druhin13"
    );

    var style = document.createElement("style");
    style.innerHTML = `
      .w-input[disabled]:not(.w-input-disabled), .w-select[disabled]:not(.w-input-disabled), .w-input[readonly], .w-select[readonly], fieldset[disabled]:not(.w-input-disabled) .w-input, fieldset[disabled]:not(.w-input-disabled) .w-select { background-color: var(--utility-swatches--black-20) !important; }
      .w-input[disabled], .w-select[disabled], .w-input[readonly], .w-select[readonly], fieldset[disabled] .w-input, fieldset[disabled] .w-select { cursor: pointer !important; }
      input.flatpickr-input, .flatpickr-input, .custom-dropdown-form-wrapper input, .custom-dropdown-form-wrapper select { cursor: pointer !important; color: var(--swatches--different-green) !important; }
      *[tabindex]:focus-visible, input[type='file']:focus-visible { outline: 0.125rem solid transparent !important; outline-offset: 0 !important; }
      input.flatpickr-input::placeholder, .custom-dropdown-form-wrapper input::placeholder { color: var(--swatches--different-green) !important; }

      /* --- Remove outline from select-dates when focused --- */
      #select-dates:focus,
      #select-dates:active,
      #select-dates.active,
      #select-dates.flatpickr-input:focus,
      #select-dates.w-select:focus,
      #select-dates.custom-dropdown:focus {
        outline: none !important;
        box-shadow: none !important;
        border-color: var(--swatches--different-green) !important;
      }

      /* --- Choices.js Custom Styling --- */
      .choices[data-type*="select-one"] {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .choices__inner {
        display: flex;
        width: 100%;
        height: 100%;
        padding: 1.2rem 1.25rem !important; /* Ensure consistent padding, override default bottom padding */
        justify-content: flex-start; 
        align-items: center;
        border-style: solid;
        border-width: 0.09375rem;
        border-color: var(--swatches--different-green);
        background-color: var(--utility-swatches--black-20);
        box-shadow: inset 0 0 0.21875rem 0 var(--utility-swatches--black-25);
        backdrop-filter: blur(0.5rem);
        color: var(--swatches--different-green);
        font-size: 1.125rem;
        line-height: 100%;
        font-weight: 500;
        text-transform: uppercase;
        min-height: auto; 
        overflow: hidden;
      }

      .choices__list--single .choices__item {
        color: var(--swatches--different-green);
        font-size: 1.125rem;
        line-height: 100%;
        font-weight: 500;
        text-transform: uppercase;
        padding: 0; 
      }
      
      .choices__placeholder {
        color: var(--swatches--different-green);
        opacity: 0.7; 
      }

      /* Remove outline on focus */
      .choices.is-focused .choices__inner,
      .choices__input:focus ~ .choices__inner,
      .choices[data-type*="select-one"] .choices__inner:focus,
      .choices:focus,
      .choices__inner:focus {
        outline: none !important;
        border-color: var(--swatches--different-green); 
      }
      
      /* Remove default dropdown arrow */
      .choices[data-type*="select-one"]::after {
        display: none !important;
      }
      /* Also try to hide the specific arrow class if the above is not enough */
       .choices__inner::after {
        display: none !important;
      }

      /* Style for the first option (placeholder) to make it disabled-looking */
      .choices__list--dropdown .choices__item--choice[data-id="1"] {
        color: #999999 !important;
        cursor: default !important;
        pointer-events: none !important;
        background-color: #f9f9f9 !important;
      }

      /* --- Styling for the dropdown list (options) to be default-like --- */
      .choices__list--dropdown {
        background-color: #ffffff; /* White background for dropdown */
        border: 1px solid #dddddd; /* Standard light grey border */
        box-shadow: 0 1px 3px rgba(0,0,0,0.1); /* Subtle shadow */
        color: #333333; /* Default dark text color for items */
        margin-top: 2px; /* Small gap from the input */
        z-index: 10; /* Ensure it's above other elements */
      }
      
      .choices__list--dropdown .choices__item--selectable {
        color: #333333; /* Default dark text color for items */
        background-color: #ffffff; /* White background for items */
        padding-top: 10px; /* Default-like padding */
        padding-bottom: 10px; /* Default-like padding */
        padding-left: 1.25rem; /* Align with input text */
        padding-right: 1.25rem;
        font-size: 1rem; /* Standard font size for options */
        font-weight: 400; /* Standard font weight */
        text-transform: none; /* No text transform for options */
        line-height: 1.5; /* Standard line height */
      }
      
      .choices__list--dropdown .choices__item--selectable.is-highlighted {
        background-color: #f2f2f2; /* Light grey highlight for hovered/selected option */
        color: #333333; /* Text color remains dark on highlight */
      }

      /* If there's a "no results" or "no choices" message, style it for the white background */
      .choices__list--dropdown .choices__item--no-results,
      .choices__list--dropdown .choices__item--no-choices {
        color: #777777; /* Grey text for no results message */
        background-color: #ffffff;
        padding: 10px 1.25rem;
      }
    `;
    document.head.appendChild(style);

    var allTabIndexStyles = document.querySelectorAll("style");
    allTabIndexStyles.forEach(function (s) {
      if (s.innerText.includes("*[tabindex]:focus-visible")) {
        s.innerText = s.innerText.replace(
          /\*\[tabindex\]:focus-visible, input\[type="file"\]:focus-visible \{[^}]*\}/g,
          ""
        );
      }
    });

    // Function to update the location wrapper height based on the date selector
    function updateLocationWrapperHeight() {
      var dateElement = document.getElementById("select-dates");
      var locationWrapper = document.getElementById("location-wrapper");

      if (dateElement && locationWrapper) {
        var renderedHeight = dateElement.getBoundingClientRect().height;
        locationWrapper.style.height = renderedHeight + "px";
        console.log(
          "Updated location wrapper height to match date selector:",
          renderedHeight + "px"
        );
      }
    }

    // Call the function on load and set up resize listener
    updateLocationWrapperHeight();
    window.addEventListener("resize", updateLocationWrapperHeight);

    // Also check if jQuery is available and set up the handlers that way too (for compatibility)
    if (window.jQuery) {
      jQuery(document).ready(function ($) {
        updateLocationWrapperHeight();
        $(window).on("resize", updateLocationWrapperHeight);
      });
    }

    var locationSelect = document.querySelector(
      'select[data-dt-dropdown-type="single"][id="location"]'
    );
    var choicesInstance = null;

    if (locationSelect) {
      // Make first option disabled before initializing Choices
      if (locationSelect.options.length > 0) {
        locationSelect.options[0].disabled = true;
      }

      choicesInstance = new Choices(locationSelect, {
        searchEnabled: false,
        itemSelectText: "",
        allowHTML: false,
        classNames: {
          containerOuter: "choices",
          containerInner: "choices__inner",
          input: "choices__input",
          inputCloned: "choices__input--cloned",
          list: "choices__list",
          listItems: "choices__list--multiple",
          listSingle: "choices__list--single",
          listDropdown: "choices__list--dropdown",
          item: "choices__item",
          itemSelectable: "choices__item--selectable",
          itemDisabled: "choices__item--disabled",
          itemChoice: "choices__item--choice",
          placeholder: "choices__placeholder",
          group: "choices__group",
          groupHeading: "choices__heading",
          button: "choices__button",
          activeState: "is-active",
          focusState: "is-focused",
          openState: "is-open",
          disabledState: "is-disabled",
          highlightedState: "is-highlighted",
          selectedState: "is-selected",
          flippedState: "is-flipped",
          loadingState: "is-loading",
          noResults: "has-no-results",
          noChoices: "has-no-choices",
        },
      });

      // Additional handling to prevent selection of the first item
      if (choicesInstance && choicesInstance.containerOuter) {
        choicesInstance.containerOuter.element.addEventListener(
          "choice",
          function (event) {
            // If the choice being selected is the first one (id="1"), prevent it
            if (event.detail.choice && event.detail.choice.id === 1) {
              event.preventDefault();
              event.stopPropagation();
              choicesInstance.hideDropdown(); // Close the dropdown
              return false;
            }
          },
          true
        ); // Use capturing to get the event before Choices.js processes it
      }

      // After Choices.js initializes, trigger updateLocationWrapperHeight again
      // as the rendered height might have changed
      setTimeout(updateLocationWrapperHeight, 100);

      var cityToCodeMap = {
        sydney: "syd-to-chc",
        melbourne: "mel-to-chc",
        brisbane: "bne-to-chc",
        "gold coast": "ool-to-chc",
        coolangatta: "ool-to-chc",
        cairns: "cns-to-chc",
      };
      var cityAliases = {
        syd: "sydney",
        mel: "melbourne",
        bne: "brisbane",
        bris: "brisbane",
        melb: "melbourne",
        ool: "gold coast",
        cns: "cairns",
      };
      var citiesCoordinates = {
        sydney: { lat: -33.8688, lon: 151.2093 },
        melbourne: { lat: -37.8136, lon: 144.9631 },
        brisbane: { lat: -27.4698, lon: 153.0251 },
        "gold coast": { lat: -28.1667, lon: 153.5333 },
        cairns: { lat: -16.9186, lon: 145.7781 },
      };

      // Define default location value (Sydney)
      var defaultLocationValue = "syd-to-chc";

      function calculateDistance(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = ((lat2 - lat1) * Math.PI) / 180;
        var dLon = ((lon2 - lon1) * Math.PI) / 180;
        var a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }

      fetch("https://pro.ip-api.com/json/?fields=61439&key=3rxukZrZ9IgP9hB")
        .then(function (response) {
          if (response.ok) return response.json();
          throw new Error("Network response was not ok.");
        })
        .then(function (data) {
          console.log("IP geolocation data received:", data);
          var matchedCityValue = null;

          if (data && data.status === "success") {
            // Try to match based on city name
            if (data.city) {
              var userCity = data.city.toLowerCase();
              console.log("User city detected:", userCity);
              matchedCityValue =
                cityToCodeMap[userCity] || cityToCodeMap[cityAliases[userCity]];

              // Try partial matches if no exact match
              if (!matchedCityValue) {
                for (var cityKey in cityToCodeMap) {
                  if (
                    userCity.includes(cityKey) ||
                    cityKey.includes(userCity)
                  ) {
                    matchedCityValue = cityToCodeMap[cityKey];
                    console.log("Found partial city match:", cityKey);
                    break;
                  }
                }
              }
            }

            // If in Australia but no city match, find closest city by coordinates
            if (
              !matchedCityValue &&
              data.countryCode === "AU" &&
              data.lat &&
              data.lon
            ) {
              console.log(
                "No direct match. Calculating closest Australian city."
              );
              var closestCityName = null;
              var shortestDistance = Infinity;
              for (var cityName in citiesCoordinates) {
                var distance = calculateDistance(
                  data.lat,
                  data.lon,
                  citiesCoordinates[cityName].lat,
                  citiesCoordinates[cityName].lon
                );
                console.log(
                  `Distance to ${cityName}: ${Math.round(distance)} km`
                );
                if (distance < shortestDistance) {
                  shortestDistance = distance;
                  closestCityName = cityName;
                }
              }
              if (closestCityName) {
                matchedCityValue = cityToCodeMap[closestCityName];
                console.log(
                  `Selected ${closestCityName} as closest city (${Math.round(
                    shortestDistance
                  )} km away)`
                );
              }
            }
          }

          // If no match found, use default (Sydney)
          if (!matchedCityValue) {
            console.log(
              "No city match found. Using default:",
              defaultLocationValue
            );
            matchedCityValue = defaultLocationValue;
          }

          // Set the selected location in Choices.js dropdown
          if (matchedCityValue && choicesInstance) {
            try {
              console.log("Setting location value to:", matchedCityValue);
              choicesInstance.setChoiceByValue(matchedCityValue);
              console.log("Location value set successfully");

              // Verify the selection worked
              setTimeout(function () {
                var currentValue = locationSelect.value;
                console.log("Current dropdown value:", currentValue);

                // Force the selection if it didn't take
                if (!currentValue || currentValue !== matchedCityValue) {
                  console.log(
                    "Selection didn't apply correctly, trying alternative approach"
                  );
                  locationSelect.value = matchedCityValue;
                  choicesInstance.setChoiceByValue(matchedCityValue);
                }

                // Update location wrapper height and button state
                updateLocationWrapperHeight();
                updateButton();
              }, 200);
            } catch (e) {
              console.error("Error setting location choice:", e);
              // Fallback: try to set the native select value
              try {
                locationSelect.value = matchedCityValue;
              } catch (e2) {
                console.error("Fallback selection also failed:", e2);
              }
            }
          }
        })
        .catch(function (error) {
          console.warn("IP geolocation error (non-critical):", error.message);
          // Set default selection on error
          if (choicesInstance) {
            console.log(
              "Setting default location on error:",
              defaultLocationValue
            );
            choicesInstance.setChoiceByValue(defaultLocationValue);
            setTimeout(updateLocationWrapperHeight, 100);
            setTimeout(updateButton, 100);
          }
        });

      locationSelect.addEventListener("change", function () {
        updateButton();

        // Update location wrapper height after selection changes
        setTimeout(updateLocationWrapperHeight, 100);
      });
    }

    var dateSelect = document.querySelector(
      'select[data-dt-dropdown-type="calendar-range"]'
    );
    if (dateSelect) {
      var input = document.createElement("input");
      input.type = "text";
      input.id = dateSelect.id;
      input.name = dateSelect.name;
      input.className = dateSelect.className;
      input.placeholder = dateSelect.options[0]
        ? dateSelect.options[0].textContent
        : "";
      dateSelect.style.display = "none";
      dateSelect.parentNode.insertBefore(input, dateSelect);

      var hiddenInput = document.createElement("input");
      hiddenInput.type = "hidden";
      hiddenInput.id = dateSelect.id + "-hidden";
      dateSelect.parentNode.insertBefore(hiddenInput, dateSelect);

      flatpickr(input, {
        mode: "range",
        dateFormat: "Y-m-d",
        altInput: false,
        minDate: "today",
        onChange: function (selectedDates, dateStr, instance) {
          var originalFormat = selectedDates
            .map((d) => {
              var day = d.getDate().toString().padStart(2, "0");
              var month = (d.getMonth() + 1).toString().padStart(2, "0");
              var year = d.getFullYear().toString().slice(-2);
              return `${day}/${month}/${year}`;
            })
            .join(" - ");
          hiddenInput.value = originalFormat;

          var months = [
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
            "OCT",
            "NOV",
            "DEC",
          ];
          if (selectedDates.length === 2) {
            var startMonth = months[selectedDates[0].getMonth()];
            var startDay = selectedDates[0].getDate();
            var endMonth = months[selectedDates[1].getMonth()];
            var endDay = selectedDates[1].getDate();
            if (selectedDates[0].getMonth() === selectedDates[1].getMonth()) {
              instance.input.value = `${startMonth} ${startDay} - ${endDay}`;
            } else {
              instance.input.value = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
            }
          } else if (selectedDates.length === 1) {
            var month = months[selectedDates[0].getMonth()];
            var day = selectedDates[0].getDate();
            instance.input.value = `${month} ${day}`;
          }
          input.dispatchEvent(new Event("change"));

          // Update location wrapper height when date selection changes
          setTimeout(updateLocationWrapperHeight, 100);
        },
        onReady: function (dateObj, dateStr, instance) {
          instance.input.addEventListener("input", function (e) {
            if (instance.isOpen) return;
            e.preventDefault();
            e.stopPropagation();
            return false;
          });

          // Update location wrapper height when flatpickr is ready
          setTimeout(updateLocationWrapperHeight, 100);
        },
      });
    }

    var dateInput = document.getElementById("select-dates");
    var bookButton = document.querySelector(".cta2");
    var generateWebjet = document.getElementById("generate-webjet");

    function updateButton() {
      var location = locationSelect ? locationSelect.value : "";
      var dates = dateInput ? dateInput.value : "";
      if (location && dates) {
        if (bookButton) bookButton.style.cursor = "pointer";
        if (generateWebjet) generateWebjet.style.cursor = "pointer";
      } else {
        if (bookButton) bookButton.style.cursor = "not-allowed";
        if (generateWebjet) generateWebjet.style.cursor = "not-allowed";
      }
    }

    if (dateInput) dateInput.addEventListener("change", updateButton);
    updateButton();

    if (generateWebjet) {
      generateWebjet.addEventListener("click", function (e) {
        e.preventDefault();
        if (!locationSelect || !dateInput) return;
        var location = locationSelect.value.trim();
        var dates = dateInput.value.trim();
        var hiddenDateInput = document.getElementById(dateInput.id + "-hidden");
        var formattedDates = hiddenDateInput
          ? hiddenDateInput.value.trim()
          : dates;

        if (!location || !formattedDates) return;
        var parts = location.split("-to-");
        if (parts.length !== 2) return;
        var from = parts[0].toLowerCase();
        var to = "chc";
        var cityMap = {
          syd: "sydney",
          bne: "brisbane",
          mel: "melbourne",
          ool: "gold coast",
          cns: "cairns",
          chc: "christchurch",
        };
        var dateParts = formattedDates.split(" - ");
        if (dateParts.length < 1) return;

        function formatDateForURL(dateStr) {
          var parts = dateStr.split("/");
          return `20${parts[2]}${parts[1]}${parts[0]}`;
        }
        var departDate = formatDateForURL(dateParts[0]);
        var returnDate = dateParts[1] ? formatDateForURL(dateParts[1]) : "";
        var isReturn = !!returnDate;
        var baseURL = "https://services.webjet.com.au/web/flights/redirect";
        var query = "?adults=1";
        query += "&triptype=" + (isReturn ? "return" : "oneway");
        query += "&countryfrom=australia&countryto=new+zealand";
        var steps = `${from}-${to}-${departDate}-economy-${cityMap[from]}-${cityMap[to]}`;
        if (isReturn) {
          steps += `_${to}-${from}-${returnDate}-economy-${cityMap[to]}-${cityMap[from]}`;
        }
        query += "&steps=" + steps;
        var finalUrl = baseURL + query;
        window.open(finalUrl, "_blank");
      });
    }
  });
})();
