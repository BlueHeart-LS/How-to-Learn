const ageFilterButtons = document.querySelectorAll("[data-game-age-filter]");
const levelFilterButtons = document.querySelectorAll("[data-game-level-filter]");
const gameCards = document.querySelectorAll("[data-game-ages]");
const gameCategories = document.querySelectorAll("[data-game-category]");
const gameGrids = document.querySelectorAll(".game-grid");
const gameRefreshButton = document.querySelector("[data-game-refresh]");
const lobbyPetName = document.querySelector("[data-lobby-pet-name]");
const lobbyRewardCoins = document.querySelector("[data-lobby-reward-coins]");
const lobbyPetCreature = document.querySelector("[data-lobby-pet-creature]");
const lobbyPetCharacter = document.querySelector("[data-lobby-pet-character]");
const lobbyPetStats = {
  hunger: document.querySelector("[data-lobby-pet-hunger]"),
  happy: document.querySelector("[data-lobby-pet-happy]"),
  energy: document.querySelector("[data-lobby-pet-energy]"),
};

let selectedGameAge = "all";
let selectedGameLevel = "all";

const lobbyPetTypes = {
  bubu: "../images/Character/bubu.gif",
  bobo: "../images/Character/bobo.gif",
  "chu-chu": "../images/Character/chu-chu.gif",
  light: "../images/Character/light.gif",
};

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

function shuffleElements(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
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

gameRefreshButton?.addEventListener("click", () => {
  gameGrids.forEach((grid) => {
    shuffleElements(grid.children).forEach((card) => grid.append(card));
  });
  filterGames();
});

function clampStat(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    return fallback;
  }
}

function renderLobbyPet() {
  const rewards = readJson("howToLearnGameRewards", { coins: 0 });
  const savedPet = readJson("howToLearnStudyPet", {
    name: "小學伴",
    hunger: 80,
    happy: 80,
    energy: 80,
    updatedAt: Date.now(),
  });
  const elapsedHours = Math.min(24, Math.max(0, (Date.now() - (savedPet.updatedAt || Date.now())) / 3600000));
  const pet = {
    name: savedPet.name || "小學伴",
    type: lobbyPetTypes[savedPet.type] ? savedPet.type : "bubu",
    hunger: clampStat((savedPet.hunger ?? 80) - elapsedHours * 3),
    happy: clampStat((savedPet.happy ?? 80) - elapsedHours * 2),
    energy: clampStat((savedPet.energy ?? 80) - elapsedHours * 1.5),
  };
  const average = (pet.hunger + pet.happy + pet.energy) / 3;

  if (lobbyPetName) lobbyPetName.textContent = pet.name;
  if (lobbyRewardCoins) lobbyRewardCoins.textContent = (rewards.coins || 0).toLocaleString("zh-Hant");
  if (lobbyPetStats.hunger) lobbyPetStats.hunger.textContent = pet.hunger;
  if (lobbyPetStats.happy) lobbyPetStats.happy.textContent = pet.happy;
  if (lobbyPetStats.energy) lobbyPetStats.energy.textContent = pet.energy;
  if (lobbyPetCharacter) lobbyPetCharacter.src = lobbyPetTypes[pet.type];
  lobbyPetCreature?.classList.toggle("low", average < 50);
}

renderLobbyPet();
window.addEventListener("storage", renderLobbyPet);
