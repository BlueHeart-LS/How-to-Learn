const memoryIntro = document.querySelector("[data-memory-intro]");
const memoryPlay = document.querySelector("[data-memory-play]");
const memoryResult = document.querySelector("[data-memory-result]");
const memoryBoard = document.querySelector("[data-memory-board]");
const pairDisplay = document.querySelector("[data-memory-pairs]");
const moveDisplay = document.querySelector("[data-memory-moves]");
const timeDisplay = document.querySelector("[data-memory-time]");
const feedback = document.querySelector("[data-memory-feedback]");
const summary = document.querySelector("[data-memory-summary]");
const sizeButtons = document.querySelectorAll("[data-memory-size]");
const startButton = document.querySelector("[data-memory-start]");
const restartButton = document.querySelector("[data-memory-restart]");
const resetButton = document.querySelector("[data-memory-reset]");

let selectedSize = 4;
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let startedAt = 0;
let timerId = null;
let locked = false;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function formatTime(totalMs) {
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remain = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remain}`;
}

function getSeniorPool() {
  return Object.values(seniorVocabulary)
    .flat()
    .map(([word, meaning], index) => ({
      id: `${word}-${index}`,
      word,
      meaning,
    }))
    .filter((item) => item.word && item.meaning);
}

function buildCards() {
  const pairCount = (selectedSize * selectedSize) / 2;
  const picked = shuffle(getSeniorPool()).slice(0, pairCount);

  cards = shuffle(
    picked.flatMap((item) => [
      {
        pairId: item.id,
        type: "word",
        text: item.word,
        label: "EN",
        matched: false,
        flipped: false,
      },
      {
        pairId: item.id,
        type: "meaning",
        text: item.meaning,
        label: "中",
        matched: false,
        flipped: false,
      },
    ]),
  );
}

function renderTimer() {
  timeDisplay.textContent = formatTime(startedAt ? Date.now() - startedAt : 0);
}

function renderStatus() {
  pairDisplay.textContent = `${matchedPairs}/${cards.length / 2 || (selectedSize * selectedSize) / 2}`;
  moveDisplay.textContent = moves;
  renderTimer();
}

function renderBoard() {
  memoryBoard.style.setProperty("--memory-size", selectedSize);
  memoryBoard.classList.toggle("large-board", selectedSize === 8);
  memoryBoard.innerHTML = "";

  cards.forEach((card, index) => {
    const button = document.createElement("button");
    button.className = "memory-card";
    button.type = "button";
    button.dataset.cardIndex = index;
    button.setAttribute("aria-label", card.flipped || card.matched ? card.text : "未翻開的卡牌");
    if (card.flipped) button.classList.add("flipped");
    if (card.matched) button.classList.add("matched");
    button.innerHTML = `
      <span class="memory-card-back">?</span>
      <span class="memory-card-front">
        <small>${card.label}</small>
        <strong>${card.text}</strong>
      </span>
    `;
    memoryBoard.append(button);
  });
}

function finishGame() {
  clearInterval(timerId);
  memoryPlay.hidden = true;
  memoryResult.hidden = false;
  const elapsed = Date.now() - startedAt;
  const reward = cards.length / 2 + Math.max(0, Math.round((cards.length / 2) * 2 - moves / 4));
  window.HowToLearnRewards?.award(reward);
  summary.textContent = `你完成 ${cards.length / 2} 組英文中文配對，總共翻牌 ${moves} 次，使用時間 ${formatTime(elapsed)}。獲得 ${reward} 枚學習金幣。`;
}

function checkMatch() {
  const [firstIndex, secondIndex] = flippedCards;
  const first = cards[firstIndex];
  const second = cards[secondIndex];
  const isMatch = first.pairId === second.pairId && first.type !== second.type;

  moves += 1;
  locked = true;

  if (isMatch) {
    first.matched = true;
    second.matched = true;
    matchedPairs += 1;
    feedback.textContent = `${first.type === "word" ? first.text : second.text} 配對成功`;
    flippedCards = [];
    locked = false;
    renderStatus();
    renderBoard();

    if (matchedPairs === cards.length / 2) {
      setTimeout(finishGame, 500);
    }
    return;
  }

  feedback.textContent = "再想想，這兩張不是同一組";
  renderStatus();
  renderBoard();

  setTimeout(() => {
    first.flipped = false;
    second.flipped = false;
    flippedCards = [];
    locked = false;
    feedback.textContent = "";
    renderBoard();
  }, 850);
}

function flipCard(index) {
  if (locked) return;
  const card = cards[index];
  if (!card || card.flipped || card.matched) return;

  card.flipped = true;
  flippedCards.push(index);
  renderBoard();

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

function startGame() {
  buildCards();
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  locked = false;
  feedback.textContent = "";
  memoryIntro.hidden = true;
  memoryResult.hidden = true;
  memoryPlay.hidden = false;
  startedAt = Date.now();
  clearInterval(timerId);
  timerId = setInterval(renderTimer, 1000);
  renderStatus();
  renderBoard();
}

function resetGame() {
  clearInterval(timerId);
  memoryPlay.hidden = true;
  memoryResult.hidden = true;
  memoryIntro.hidden = false;
  cards = [];
  flippedCards = [];
  matchedPairs = 0;
  moves = 0;
  startedAt = 0;
  feedback.textContent = "";
  renderStatus();
}

sizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSize = Number(button.dataset.memorySize);
    sizeButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderStatus();
  });
});

memoryBoard?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-card-index]");
  if (!button) return;
  flipCard(Number(button.dataset.cardIndex));
});

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", startGame);
resetButton?.addEventListener("click", resetGame);
renderStatus();
