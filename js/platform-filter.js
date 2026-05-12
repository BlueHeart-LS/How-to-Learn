const platformFilterButtons = document.querySelectorAll("[data-platform-filter]");
const platformCards = document.querySelectorAll("[data-platform-categories]");
const platformSections = document.querySelectorAll("[data-platform-section]");

let selectedPlatformFilter = "all";

function updatePlatformFilter(buttons, activeButton) {
  buttons.forEach((button) => {
    const active = button === activeButton;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function filterPlatforms() {
  platformCards.forEach((card) => {
    const categories = card.dataset.platformCategories.split(" ");
    const visible = selectedPlatformFilter === "all" || categories.includes(selectedPlatformFilter);
    card.hidden = !visible;
  });

  platformSections.forEach((section) => {
    const visibleCard = section.querySelector("[data-platform-categories]:not([hidden])");
    section.hidden = !visibleCard;
  });
}

platformFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedPlatformFilter = button.dataset.platformFilter;
    updatePlatformFilter(platformFilterButtons, button);
    filterPlatforms();
  });
});

filterPlatforms();
