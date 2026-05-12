const ageFilterButtons = document.querySelectorAll("[data-game-age-filter]");
const levelFilterButtons = document.querySelectorAll("[data-game-level-filter]");
const gameCards = document.querySelectorAll("[data-game-ages]");
const gameCategories = document.querySelectorAll("[data-game-category]");

let selectedGameAge = "all";
let selectedGameLevel = "all";

function filterGames() {
  gameCards.forEach((card) => {
    const ages = card.dataset.gameAges.split(" ");
    const level = card.dataset.gameLevel;
    const matchesAge = selectedGameAge === "all" || ages.includes(selectedGameAge);
    const matchesLevel = selectedGameLevel === "all" || level === selectedGameLevel;
    card.hidden = !(matchesAge && matchesLevel);
  });

  gameCategories.forEach((category) => {
    const visibleCard = category.querySelector("[data-game-ages]:not([hidden])");
    category.hidden = !visibleCard;
  });
}

function setActiveButton(buttons, activeButton) {
  buttons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

ageFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedGameAge = button.dataset.gameAgeFilter;
    setActiveButton(ageFilterButtons, button);
    filterGames();
  });
});

levelFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedGameLevel = button.dataset.gameLevelFilter;
    setActiveButton(levelFilterButtons, button);
    filterGames();
  });
});

filterGames();
