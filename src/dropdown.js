/**
 * Dropdown.js
 * Implements Choices.js single select with proper customizable labels
 */

// Initialize all dropdowns when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if Choices.js is available
  if (typeof Choices === "undefined") {
    console.error(
      "Choices.js is required for custom dropdowns. Please include the Choices.js library."
    );
    return;
  }

  initDropdowns();
});

// Global function to initialize dropdowns
window.initDropdowns = function (container = document) {
  const dropdownElements = container.querySelectorAll(
    "select[data-dt-dropdown]"
  );
  const instances = [];

  dropdownElements.forEach((element) => {
    // Skip if already initialized
    if (element.hasAttribute("data-choices-initialized")) {
      return;
    }
    element.setAttribute("data-choices-initialized", "true");

    // Get custom labels from data attributes
    const hoverLabel =
      element.getAttribute("data-dt-dropdown-hover-label") || "Press to select";
    const placeholderLabel =
      element.getAttribute("data-dt-dropdown-placeholder-label") || "Where to?";
    const searchLabel =
      element.getAttribute("data-dt-dropdown-search-label") || "Search routes";

    // Hide original arrow if present
    const form = element.closest("form");
    if (form) {
      const arrow = form.querySelector(".custom-dropdown-arrow");
      if (arrow) {
        arrow.style.display = "none";
      }
    }

    // Set the placeholder option text if it exists
    const placeholderOption = element.querySelector('option[value=""]');
    if (placeholderOption) {
      placeholderOption.textContent = placeholderLabel;
    }

    // Initialize Choices with configuration
    const choicesInstance = new Choices(element, {
      // Enable search
      searchEnabled: true,
      // Use the search label for the search input placeholder
      searchPlaceholderValue: searchLabel,
      // Show the dropdown downwards
      position: "bottom",
      // Keep options in original order
      shouldSort: false,
      // Use custom hover text from data attribute
      itemSelectText: hoverLabel,
      // Ensure correct placeholder behavior
      placeholder: true,
      placeholderValue: placeholderLabel,
      // Using default class names for styling
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
        itemOption: "choices__item--choice",
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
      },
    });

    instances.push(choicesInstance);
  });

  return instances;
};
