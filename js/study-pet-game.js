const petStorageKey = "howToLearnStudyPet";
const petName = document.querySelector("[data-pet-name]");
const petWallet = document.querySelector("[data-pet-wallet]");
const petMessage = document.querySelector("[data-pet-message]");
const petCreature = document.querySelector("[data-pet-creature]");
const petCharacter = document.querySelector("[data-pet-character]");
const petLevel = document.querySelector("[data-pet-level]");
const petGrowth = document.querySelector("[data-pet-growth]");
const renameButton = document.querySelector("[data-pet-rename]");
const actionButtons = document.querySelectorAll("[data-pet-action]");
const typeButtons = document.querySelectorAll("[data-pet-type]");

const statElements = {
  hunger: {
    value: document.querySelector("[data-pet-hunger]"),
    bar: document.querySelector("[data-pet-hunger-bar]"),
  },
  happy: {
    value: document.querySelector("[data-pet-happy]"),
    bar: document.querySelector("[data-pet-happy-bar]"),
  },
  energy: {
    value: document.querySelector("[data-pet-energy]"),
    bar: document.querySelector("[data-pet-energy-bar]"),
  },
};

const actions = {
  feed: { cost: 10, hunger: 18, happy: 2, energy: 0, message: "吃飽了，學習小夥伴精神都來了。" },
  treat: { cost: 18, hunger: 5, happy: 22, energy: 0, message: "點心時間！牠看起來超開心。" },
  play: { cost: 25, hunger: -4, happy: 30, energy: -8, message: "玩了一輪，心情大好，但也有點累。" },
  rest: { cost: 0, hunger: -3, happy: 3, energy: 20, message: "睡了一下，精神恢復了。" },
};

const petTypes = {
  bubu: { name: "Bubu", image: "../images/Character/bubu.gif" },
  bobo: { name: "Bobo", image: "../images/Character/bobo.gif" },
  "chu-chu": { name: "Chu-chu", image: "../images/Character/chu-chu.gif" },
  light: { name: "Light", image: "../images/Character/light.gif" },
};

function normalizePetType(type) {
  return petTypes[type] ? type : "bubu";
}

let pet = loadPet();

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function loadPet() {
  try {
    const saved = JSON.parse(localStorage.getItem(petStorageKey) || "{}");
    const now = Date.now();
    const elapsedHours = Math.min(24, Math.max(0, (now - (saved.updatedAt || now)) / 3600000));
    return {
      name: saved.name || "小學伴",
      type: normalizePetType(saved.type),
      hunger: clamp((saved.hunger ?? 80) - elapsedHours * 3),
      happy: clamp((saved.happy ?? 80) - elapsedHours * 2),
      energy: clamp((saved.energy ?? 80) - elapsedHours * 1.5),
      careCount: saved.careCount || 0,
      updatedAt: now,
    };
  } catch (error) {
    return { name: "小學伴", type: "bubu", hunger: 80, happy: 80, energy: 80, careCount: 0, updatedAt: Date.now() };
  }
}

function savePet() {
  pet.updatedAt = Date.now();
  localStorage.setItem(petStorageKey, JSON.stringify(pet));
}

function getMood() {
  const average = (pet.hunger + pet.happy + pet.energy) / 3;
  if (average >= 80) return { className: "great", text: "狀態很好，牠想陪你一起挑戰下一關。" };
  if (average >= 50) return { className: "okay", text: "狀態還不錯，再照顧一下會更有精神。" };
  return { className: "low", text: "牠有點低落，去完成遊戲賺金幣照顧牠吧。" };
}

function getLevel() {
  return Math.max(1, Math.floor(pet.careCount / 5) + 1);
}

function render() {
  const wallet = window.HowToLearnRewards?.getCoins() || 0;
  const mood = getMood();

  petName.textContent = pet.name;
  const selectedType = normalizePetType(pet.type);
  const selectedPet = petTypes[selectedType];
  if (petCharacter) {
    petCharacter.src = selectedPet.image;
    petCharacter.alt = `${selectedPet.name} 學習寵物`;
  }
  petWallet.textContent = wallet.toLocaleString("zh-Hant");
  petLevel.textContent = `Lv.${getLevel()}`;
  petGrowth.textContent = `累積照顧 ${pet.careCount} 次。完成練習遊戲賺金幣，再用金幣陪牠長大。`;
  petCreature.className = `pet-creature ${mood.className}`;
  if (!petMessage.textContent) petMessage.textContent = mood.text;

  Object.entries(statElements).forEach(([key, elements]) => {
    elements.value.textContent = pet[key];
    elements.bar.style.width = `${pet[key]}%`;
  });

  actionButtons.forEach((button) => {
    const action = actions[button.dataset.petAction];
    button.disabled = action.cost > wallet;
  });

  typeButtons.forEach((button) => {
    const isActive = button.dataset.petType === selectedType;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applyAction(type) {
  const action = actions[type];
  if (!action) return;

  if (action.cost > 0) {
    const result = window.HowToLearnRewards?.spend(action.cost);
    if (!result?.ok) {
      petMessage.textContent = "學習金幣不夠，先去完成一個練習關卡吧。";
      render();
      return;
    }
  }

  pet.hunger = clamp(pet.hunger + action.hunger);
  pet.happy = clamp(pet.happy + action.happy);
  pet.energy = clamp(pet.energy + action.energy);
  pet.careCount += 1;
  petMessage.textContent = action.message;
  savePet();
  render();
}

actionButtons.forEach((button) => {
  button.addEventListener("click", () => applyAction(button.dataset.petAction));
});

typeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const type = normalizePetType(button.dataset.petType);
    pet.type = type;
    petMessage.textContent = `已選擇 ${petTypes[type].name}。`;
    savePet();
    render();
  });
});

renameButton?.addEventListener("click", () => {
  const nextName = window.prompt("幫你的學習寵物取一個名字", pet.name);
  if (!nextName?.trim()) return;
  pet.name = nextName.trim().slice(0, 12);
  petMessage.textContent = `牠現在叫做 ${pet.name}。`;
  savePet();
  render();
});

window.addEventListener("howtolearn:rewards-updated", render);
savePet();
render();
