const moneyDisplay = document.querySelector("[data-money]");
const incomeRateDisplay = document.querySelector("[data-income-rate]");
const clickPowerDisplay = document.querySelector("[data-click-power]");
const earnButton = document.querySelector("[data-earn-button]");
const upgradeList = document.querySelector("[data-upgrade-list]");
const saveStatus = document.querySelector("[data-save-status]");
const resetButton = document.querySelector("[data-reset-game]");

const storageKey = "howToLearnIdleMoneyGame";
const maxOfflineSeconds = 60 * 60 * 6;
const upgrades = [
  {
    id: "piggy",
    name: "小撲滿",
    description: "每秒穩定增加一點零用錢。",
    baseCost: 15,
    income: 1,
  },
  {
    id: "stand",
    name: "檸檬水小攤",
    description: "放著也會有客人來買飲料。",
    baseCost: 80,
    income: 5,
  },
  {
    id: "bookstore",
    name: "二手書角落",
    description: "把整理好的書賣給需要的人。",
    baseCost: 320,
    income: 18,
  },
  {
    id: "workshop",
    name: "創意工作坊",
    description: "用小作品累積更多收入。",
    baseCost: 1200,
    income: 70,
  },
];

let state = {
  money: 0,
  lifetime: 0,
  clickPower: 1,
  upgrades: {},
  lastSavedAt: Date.now(),
};

function formatNumber(value) {
  return Math.floor(value).toLocaleString("zh-Hant");
}

function getUpgradeCount(id) {
  return state.upgrades[id] || 0;
}

function getUpgradeCost(upgrade) {
  return Math.floor(upgrade.baseCost * Math.pow(1.18, getUpgradeCount(upgrade.id)));
}

function getIncomePerSecond() {
  return upgrades.reduce((total, upgrade) => total + getUpgradeCount(upgrade.id) * upgrade.income, 0);
}

function getClickPower() {
  return 1 + Math.floor(state.lifetime / 500);
}

function saveGame() {
  state.lastSavedAt = Date.now();
  localStorage.setItem(storageKey, JSON.stringify(state));
  if (saveStatus) {
    saveStatus.textContent = "進度已儲存";
  }
}

function loadGame() {
  const saved = localStorage.getItem(storageKey);

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    state = {
      ...state,
      ...parsed,
      upgrades: parsed.upgrades || {},
    };

    const elapsedSeconds = Math.min(
      Math.max(0, Math.floor((Date.now() - (state.lastSavedAt || Date.now())) / 1000)),
      maxOfflineSeconds,
    );
    const offlineIncome = elapsedSeconds * getIncomePerSecond();

    if (offlineIncome > 0) {
      state.money += offlineIncome;
      state.lifetime += offlineIncome;
      if (saveStatus) {
        saveStatus.textContent = `離線期間獲得 ${formatNumber(offlineIncome)} 枚金幣`;
      }
    }
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

function renderUpgrades() {
  if (!upgradeList) return;

  upgradeList.innerHTML = "";
  upgrades.forEach((upgrade) => {
    const cost = getUpgradeCost(upgrade);
    const count = getUpgradeCount(upgrade.id);
    const canBuy = state.money >= cost;
    const card = document.createElement("article");
    card.className = "idle-upgrade-card";
    card.innerHTML = `
      <div>
        <span>Lv.${count}</span>
        <h3>${upgrade.name}</h3>
        <p>${upgrade.description}</p>
        <small>每秒 +${upgrade.income}</small>
      </div>
      <button type="button" ${canBuy ? "" : "disabled"} data-buy-upgrade="${upgrade.id}">
        ${formatNumber(cost)}
      </button>
    `;
    upgradeList.append(card);
  });
}

function render() {
  state.clickPower = getClickPower();
  moneyDisplay.textContent = formatNumber(state.money);
  incomeRateDisplay.textContent = `每秒 +${formatNumber(getIncomePerSecond())}`;
  clickPowerDisplay.textContent = `每次 +${formatNumber(state.clickPower)}`;
  renderUpgrades();
}

function earnMoney(amount) {
  state.money += amount;
  state.lifetime += amount;
  render();
}

function buyUpgrade(id) {
  const upgrade = upgrades.find((item) => item.id === id);
  if (!upgrade) return;

  const cost = getUpgradeCost(upgrade);
  if (state.money < cost) return;

  state.money -= cost;
  state.upgrades[id] = getUpgradeCount(id) + 1;
  render();
  saveGame();
}

function resetGame() {
  const confirmed = window.confirm("確定要清除小小金庫的進度嗎？");
  if (!confirmed) return;

  state = {
    money: 0,
    lifetime: 0,
    clickPower: 1,
    upgrades: {},
    lastSavedAt: Date.now(),
  };
  localStorage.removeItem(storageKey);
  if (saveStatus) {
    saveStatus.textContent = "進度已重置";
  }
  render();
}

earnButton?.addEventListener("click", () => {
  earnMoney(state.clickPower);
});

upgradeList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-buy-upgrade]");
  if (!button) return;
  buyUpgrade(button.dataset.buyUpgrade);
});

resetButton?.addEventListener("click", resetGame);

loadGame();
render();

setInterval(() => {
  const income = getIncomePerSecond();
  if (income > 0) {
    earnMoney(income);
  }
}, 1000);

setInterval(saveGame, 5000);
window.addEventListener("beforeunload", saveGame);
