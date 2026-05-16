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
const dailyGoalProgress = document.querySelector("[data-daily-goal-progress]");
const dailyCoinProgress = document.querySelector("[data-daily-coin-progress]");
const dailyGoalMessage = document.querySelector("[data-daily-goal-message]");
const gameProgressPercent = document.querySelector("[data-game-progress-percent]");
const gameProgressCopy = document.querySelector("[data-game-progress-copy]");
const gameBadges = document.querySelector("[data-game-badges]");
const gameBadgeCopy = document.querySelector("[data-game-badge-copy]");
const gameStreakDays = document.querySelector("[data-game-streak-days]");
const gameStreakCopy = document.querySelector("[data-game-streak-copy]");

let selectedGameAge = "all";
let selectedGameLevel = "all";

const lobbyPetTypes = {
  bubu: "../images/Character/pet-bubu.gif",
  bobo: "../images/Character/pet-bobo.gif",
  "chu-chu": "../images/Character/pet-chu-chu.gif",
  light: "../images/Character/pet-light.gif",
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

function getTodayKey() {
  const now = new Date();
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getRewards() {
  const rewards = readJson("howToLearnGameRewards", { coins: 0, totalEarned: 0, completedSessions: 0 });
  if (rewards.todayKey !== getTodayKey()) {
    return { ...rewards, todaySessions: 0, todayEarned: 0 };
  }
  return rewards;
}

function renderLobbyPet() {
  const rewards = getRewards();
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

function renderProgressSummary() {
  const rewards = getRewards();
  const completedSessions = rewards.completedSessions || 0;
  const totalEarned = rewards.totalEarned || 0;
  const todaySessions = rewards.todaySessions || 0;
  const todayEarned = rewards.todayEarned || 0;
  const streakDays = rewards.streakDays || 0;
  const progressPercent = Math.min(100, Math.round((completedSessions / 10) * 100));
  const badgeList = [
    { unlocked: completedSessions >= 1, label: "練習啟程" },
    { unlocked: completedSessions >= 5, label: "穩定練習" },
    { unlocked: totalEarned >= 100, label: "金幣收藏家" },
  ];
  const unlockedBadges = badgeList.filter((badge) => badge.unlocked);

  if (dailyGoalProgress) dailyGoalProgress.textContent = `今日完成 ${Math.min(todaySessions, 2)} / 2 次練習`;
  if (dailyCoinProgress) dailyCoinProgress.textContent = `今日獲得 ${todayEarned.toLocaleString("zh-Hant")} 枚學習金幣`;
  if (dailyGoalMessage) {
    dailyGoalMessage.textContent = todaySessions >= 2
      ? "今日小目標完成，可以把金幣帶回去照顧寵物。"
      : `再完成 ${2 - Math.min(todaySessions, 2)} 次練習，就能完成今日小目標。`;
  }

  if (gameProgressPercent) gameProgressPercent.textContent = `${progressPercent}%`;
  if (gameProgressCopy) gameProgressCopy.textContent = `已完成 ${completedSessions.toLocaleString("zh-Hant")} 次練習，累積 ${totalEarned.toLocaleString("zh-Hant")} 枚金幣`;
  if (gameBadges) {
    gameBadges.replaceChildren();
    badgeList.forEach((badge) => {
      const span = document.createElement("span");
      span.textContent = badge.unlocked ? "★" : "☆";
      span.title = badge.label;
      gameBadges.append(span);
    });
  }
  if (gameBadgeCopy) {
    gameBadgeCopy.textContent = unlockedBadges.length
      ? unlockedBadges.map((badge) => badge.label).join("、")
      : "完成練習後會開始累積成就。";
  }
  if (gameStreakDays) gameStreakDays.textContent = `${streakDays.toLocaleString("zh-Hant")} 天`;
  if (gameStreakCopy) {
    gameStreakCopy.textContent = streakDays > 0
      ? `最佳連續紀錄 ${Math.max(rewards.bestStreakDays || 0, streakDays).toLocaleString("zh-Hant")} 天。`
      : "完成一場遊戲後開始累積連續天數。";
  }
}

function renderLobbyInfo() {
  renderLobbyPet();
  renderProgressSummary();
}

renderLobbyInfo();
window.addEventListener("storage", renderLobbyInfo);
window.addEventListener("howtolearn:rewards-updated", renderLobbyInfo);
