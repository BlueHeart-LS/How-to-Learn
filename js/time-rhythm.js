const rhythmTasks = [
  { text: "讀懂今天最難的一個觀念", type: "deep", best: ["morning"], weight: 2 },
  { text: "完成數學練習 10 題", type: "practice", best: ["afternoon"], weight: 1 },
  { text: "訂正昨天錯題並寫下原因", type: "practice", best: ["afternoon", "evening"], weight: 1 },
  { text: "複習英文單字 15 分鐘", type: "review", best: ["evening"], weight: 1 },
  { text: "整理今天的三個重點", type: "review", best: ["evening"], weight: 1 },
  { text: "安排一段放空或伸展", type: "rest", best: ["rest"], weight: 0 },
  { text: "預習明天會用到的章節", type: "deep", best: ["morning", "evening"], weight: 1 },
  { text: "把明天要做的事排成清單", type: "plan", best: ["evening"], weight: 0 },
];

const energyLabels = {
  high: "精神很好",
  steady: "普通穩定",
  low: "有點疲累",
};

const rhythmTaskList = document.querySelector("[data-rhythm-tasks]");
const slotButtons = document.querySelectorAll("[data-slot]");
const progressText = document.querySelector("[data-rhythm-progress]");
const balanceText = document.querySelector("[data-rhythm-balance]");
const energyText = document.querySelector("[data-rhythm-energy]");
const energyButtons = document.querySelectorAll("[data-energy]");
const feedback = document.querySelector("[data-rhythm-feedback]");
const result = document.querySelector("[data-rhythm-result]");
const summary = document.querySelector("[data-rhythm-summary]");
const restart = document.querySelector("[data-rhythm-restart]");

let remainingTasks = [];
let selectedTaskId = null;
let plan = {};
let currentEnergy = "steady";
let score = 0;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function emptyPlan() {
  return {
    morning: [],
    afternoon: [],
    evening: [],
    rest: [],
  };
}

function getMaxScore() {
  return rhythmTasks.length * 2 + 3;
}

function calculateScore() {
  return Object.entries(plan).reduce((total, [slot, tasks]) => {
    return total + tasks.reduce((slotTotal, task) => slotTotal + scoreTask(slot, task), 0);
  }, 0);
}

function renderStatus() {
  const arranged = rhythmTasks.length - remainingTasks.length;
  score = calculateScore();
  progressText.textContent = `${arranged} / ${rhythmTasks.length}`;
  balanceText.textContent = `${Math.round((score / getMaxScore()) * 100)}%`;
  energyText.textContent = energyLabels[currentEnergy];
}

function renderTasks() {
  rhythmTaskList.replaceChildren();

  remainingTasks.forEach((task) => {
    const button = document.createElement("button");
    button.className = task.id === selectedTaskId ? "rhythm-task selected" : "rhythm-task";
    button.type = "button";
    button.textContent = task.text;
    button.addEventListener("click", () => {
      selectedTaskId = task.id;
      feedback.textContent = "選好了，現在放進適合的時間區塊。";
      renderTasks();
    });
    rhythmTaskList.appendChild(button);
  });
}

function renderSlots() {
  Object.entries(plan).forEach(([slot, tasks]) => {
    const list = document.querySelector(`[data-slot-list="${slot}"]`);
    list.replaceChildren();
    tasks.forEach((task) => {
      const item = document.createElement("li");
      item.textContent = task.text;
      list.appendChild(item);
    });
  });
}

function energyBonus(slot, task) {
  if (currentEnergy === "high" && slot === "morning" && task.type === "deep") return 1;
  if (currentEnergy === "low" && slot === "rest" && task.type === "rest") return 1;
  if (currentEnergy === "low" && slot === "evening" && task.type === "review") return 1;
  if (currentEnergy === "steady" && slot === "afternoon" && task.type === "practice") return 1;
  return 0;
}

function scoreTask(slot, task) {
  let points = task.best.includes(slot) ? 2 : 0;
  points += energyBonus(slot, task);
  if (slot === "rest" && task.type !== "rest") points -= 1;
  if (slot === "morning" && task.type === "rest") points -= 1;
  return Math.max(0, points);
}

function getFeedback(slot, task, points) {
  if (points >= 3) return "很適合，這張任務和你今天的狀態很搭。";
  if (points === 2) return "安排得不錯，這個時段能支撐這類任務。";
  if (slot === "rest") return "休息很重要，但高腦力任務可能需要另一個時段。";
  return "也可以這樣排，但記得觀察自己做起來是否順手。";
}

function getRhythmAdvice(rate) {
  const hasRest = plan.rest.length > 0;
  const deepInMorning = plan.morning.some((task) => task.type === "deep");
  const reviewAtNight = plan.evening.some((task) => task.type === "review" || task.type === "plan");

  if (rate >= 82 && hasRest && deepInMorning && reviewAtNight) {
    return "你的安排很完整：早上處理高腦力任務，晚上收斂整理，也有替自己保留補能時間。";
  }
  if (!hasRest) {
    return "你把任務排得很滿，下一次可以刻意放入休息，讓學習節奏更能持續。";
  }
  if (!deepInMorning) {
    return "高腦力任務可以嘗試放在早上或精神較好的時段，理解速度通常會比較穩。";
  }
  if (!reviewAtNight) {
    return "晚上很適合做輕量複習、整理重點或規劃明天，能幫大腦把今天的學習收好。";
  }
  return "你已經有初步節奏感，可以接著嘗試每週固定一兩個時段，慢慢形成習慣。";
}

function finishIfDone() {
  if (remainingTasks.length !== 0) return;

  const rate = Math.round((score / getMaxScore()) * 100);
  result.hidden = false;
  summary.textContent = `你的節奏平衡度是 ${rate}%。${getRhythmAdvice(rate)} 時間規劃不是把每分鐘塞滿，而是讓重要任務、練習和休息各自有位置。`;
}

function placeTask(slot) {
  if (!selectedTaskId) {
    feedback.textContent = "先選一張任務卡，再放進時間區塊。";
    return;
  }

  const task = remainingTasks.find((item) => item.id === selectedTaskId);
  const points = scoreTask(slot, task);
  score += points;
  plan[slot].push(task);
  remainingTasks = remainingTasks.filter((item) => item.id !== selectedTaskId);
  selectedTaskId = null;

  feedback.textContent = getFeedback(slot, task, points);
  feedback.className = points >= 2 ? "rhythm-feedback good" : "rhythm-feedback soft";

  renderStatus();
  renderTasks();
  renderSlots();
  finishIfDone();
}

function setEnergy(energy) {
  currentEnergy = energy;
  energyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.energy === energy);
  });
  feedback.textContent = `已切換成「${energyLabels[energy]}」，請依照今天的狀態安排任務。`;
  renderStatus();
}

function startRhythm() {
  remainingTasks = shuffle(rhythmTasks).map((task, index) => ({ ...task, id: index + 1 }));
  selectedTaskId = null;
  plan = emptyPlan();
  score = 0;
  result.hidden = true;
  feedback.textContent = "先選今天的能量狀態，再開始安排任務。";
  feedback.className = "rhythm-feedback";
  renderStatus();
  renderTasks();
  renderSlots();
}

slotButtons.forEach((button) => {
  button.addEventListener("click", () => placeTask(button.dataset.slot));
});

energyButtons.forEach((button) => {
  button.addEventListener("click", () => setEnergy(button.dataset.energy));
});

restart?.addEventListener("click", startRhythm);

if (rhythmTaskList) {
  startRhythm();
}
