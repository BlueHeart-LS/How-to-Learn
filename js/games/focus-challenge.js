const focusTime = document.querySelector("[data-focus-time]");
const focusTarget = document.querySelector("[data-focus-target]");
const focusHit = document.querySelector("[data-focus-hit]");
const focusMiss = document.querySelector("[data-focus-miss]");
const startPanel = document.querySelector("[data-focus-start-panel]");
const playPanel = document.querySelector("[data-focus-play]");
const resultPanel = document.querySelector("[data-focus-result]");
const focusGrid = document.querySelector("[data-focus-grid]");
const focusFeedback = document.querySelector("[data-focus-feedback]");
const focusSummary = document.querySelector("[data-focus-summary]");
const startButton = document.querySelector("[data-focus-start]");
const restartButton = document.querySelector("[data-focus-restart]");

const symbols = ["★", "◆", "●", "▲", "■", "✦", "◇", "○", "△", "□"];
const gameLength = 30;
let timerId;
let secondsLeft = gameLength;
let target = "★";
let hit = 0;
let miss = 0;
let round = 0;

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function renderStats() {
  focusTime.textContent = secondsLeft;
  focusTarget.textContent = target;
  focusHit.textContent = hit;
  focusMiss.textContent = miss;
}

function buildGrid() {
  focusGrid.replaceChildren();
  target = randomItem(symbols.slice(0, 5));
  const targetCount = 6;
  const cells = Array.from({ length: 36 }, (_, index) => ({
    id: index,
    symbol: randomItem(symbols.filter((symbol) => symbol !== target)),
    target: false,
  }));

  const positions = new Set();
  while (positions.size < targetCount) {
    positions.add(Math.floor(Math.random() * cells.length));
  }

  positions.forEach((position) => {
    cells[position].symbol = target;
    cells[position].target = true;
  });

  cells.forEach((cell) => {
    const button = document.createElement("button");
    button.className = "focus-cell";
    button.type = "button";
    button.textContent = cell.symbol;
    button.addEventListener("click", () => {
      if (button.disabled) return;
      button.disabled = true;

      if (cell.target) {
        hit += 1;
        button.classList.add("correct");
        focusFeedback.textContent = "命中，保持穩定。";
      } else {
        miss += 1;
        button.classList.add("wrong");
        focusFeedback.textContent = "這是干擾符號，放慢一點看。";
      }

      renderStats();
    });
    focusGrid.appendChild(button);
  });

  round += 1;
  renderStats();
}

function endGame() {
  clearInterval(timerId);
  playPanel.hidden = true;
  resultPanel.hidden = false;
  const total = hit + miss;
  const accuracy = total ? Math.round((hit / total) * 100) : 0;
  const advice = accuracy >= 85
    ? "你的辨識很穩，可以挑戰更相似的干擾題。"
    : accuracy >= 60
      ? "你已經能抓住目標，下一步是降低誤點。"
      : "建議先放慢速度，先確認再點，專注不是越快越好。";

  focusSummary.textContent = `你完成 ${round} 輪，命中 ${hit} 次、誤點 ${miss} 次，正確率 ${accuracy}%。${advice}`;
}

function tick() {
  secondsLeft -= 1;
  renderStats();

  if (secondsLeft > 0 && secondsLeft % 6 === 0) {
    buildGrid();
  }

  if (secondsLeft <= 0) {
    secondsLeft = 0;
    renderStats();
    endGame();
  }
}

function startGame() {
  clearInterval(timerId);
  secondsLeft = gameLength;
  hit = 0;
  miss = 0;
  round = 0;
  focusFeedback.textContent = "只點目標符號。";
  startPanel.hidden = true;
  resultPanel.hidden = true;
  playPanel.hidden = false;
  buildGrid();
  timerId = setInterval(tick, 1000);
}

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", startGame);

renderStats();
