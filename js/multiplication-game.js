const gameTime = document.querySelector("[data-game-time]");
const gameScore = document.querySelector("[data-game-score]");
const gameStreak = document.querySelector("[data-game-streak]");
const introPanel = document.querySelector("[data-game-intro]");
const playArea = document.querySelector("[data-game-play]");
const resultPanel = document.querySelector("[data-game-result]");
const equationDisplay = document.querySelector("[data-equation-display]");
const numberCards = document.querySelector("[data-number-cards]");
const feedback = document.querySelector("[data-game-feedback]");
const resultHeading = document.querySelector("[data-result-heading]");
const resultSummary = document.querySelector("[data-result-summary]");
const startButton = document.querySelector("[data-game-start]");
const restartButton = document.querySelector("[data-game-restart]");
const clearButton = document.querySelector("[data-game-clear]");

const gameLength = 30;
let timerId;
let nextQuestionTimer;
let secondsLeft = gameLength;
let score = 0;
let wrong = 0;
let streak = 0;
let bestStreak = 0;
let currentAnswer = "";
let currentQuestion = null;
let isChecking = false;

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuestion() {
  const left = randomNumber(1, 9);
  const right = randomNumber(1, 9);
  const product = left * right;
  const hiddenPart = ["left", "right", "product"][randomNumber(0, 2)];

  return {
    left,
    right,
    product,
    hiddenPart,
    answer: String(hiddenPart === "left" ? left : hiddenPart === "right" ? right : product),
  };
}

function renderEquation() {
  const { left, right, product, hiddenPart } = currentQuestion;
  const answerSlots = currentQuestion.answer
    .split("")
    .map((_, index) => `<span class="equation-slot">${currentAnswer[index] || ""}</span>`)
    .join("");
  const blank = `<span class="equation-blank" aria-label="請填入 ${currentQuestion.answer.length} 位數答案">${answerSlots}</span>`;
  const leftText = hiddenPart === "left" ? blank : left;
  const rightText = hiddenPart === "right" ? blank : right;
  const productText = hiddenPart === "product" ? blank : product;

  equationDisplay.innerHTML = `${leftText} × ${rightText} = ${productText}`;
}

function renderAnswer() {
  renderEquation();
}

function renderStats() {
  gameTime.textContent = secondsLeft;
  gameScore.textContent = score;
  gameStreak.textContent = streak;
}

function newRound() {
  currentQuestion = createQuestion();
  currentAnswer = "";
  isChecking = false;
  feedback.textContent = "";
  feedback.className = "game-feedback";
  renderEquation();
  renderAnswer();
}

function checkAnswer() {
  if (!currentAnswer || isChecking) return;

  isChecking = true;
  if (currentAnswer === currentQuestion.answer) {
    score += 1;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    feedback.textContent = "O";
    feedback.className = "game-feedback correct";
  } else {
    wrong += 1;
    streak = 0;
    feedback.textContent = "X";
    feedback.className = "game-feedback wrong";
  }

  renderStats();
  clearTimeout(nextQuestionTimer);
  nextQuestionTimer = setTimeout(() => {
    if (!playArea.hidden && secondsLeft > 0) {
      newRound();
    }
  }, 520);
}

function addDigit(digit) {
  if (playArea.hidden || isChecking || currentAnswer.length >= currentQuestion.answer.length) return;

  currentAnswer += String(digit);
  renderAnswer();

  if (currentAnswer.length === currentQuestion.answer.length) {
    checkAnswer();
  }
}

function endGame() {
  clearInterval(timerId);
  clearTimeout(nextQuestionTimer);
  playArea.hidden = true;
  resultPanel.hidden = false;
  resultHeading.textContent = "時間到";
  const total = score + wrong;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  resultSummary.textContent = `你在 30 秒內完成 ${total} 題，答對 ${score} 題、答錯 ${wrong} 題，正確率 ${accuracy}%。最高連續答對紀錄是 ${bestStreak}。`;
}

function tick() {
  secondsLeft -= 1;
  renderStats();

  if (secondsLeft <= 0) {
    secondsLeft = 0;
    renderStats();
    endGame();
  }
}

function startGame() {
  clearInterval(timerId);
  clearTimeout(nextQuestionTimer);
  secondsLeft = gameLength;
  score = 0;
  wrong = 0;
  streak = 0;
  bestStreak = 0;
  isChecking = false;
  introPanel.hidden = true;
  resultPanel.hidden = true;
  playArea.hidden = false;
  renderStats();
  newRound();
  timerId = setInterval(tick, 1000);
}

function buildNumberCards() {
  if (!numberCards) return;

  numberCards.innerHTML = "";
  for (let number = 0; number <= 9; number += 1) {
    const button = document.createElement("button");
    button.className = "number-card";
    button.type = "button";
    button.textContent = number;
    button.addEventListener("click", () => {
      addDigit(number);
    });
    numberCards.append(button);
  }
}

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", startGame);
clearButton?.addEventListener("click", () => {
  if (isChecking) return;
  currentAnswer = "";
  feedback.textContent = "";
  renderAnswer();
});

document.addEventListener("keydown", (event) => {
  if (playArea?.hidden || isChecking) return;

  if (/^[0-9]$/.test(event.key)) {
    addDigit(event.key);
  }

  if (event.key === "Backspace") {
    currentAnswer = currentAnswer.slice(0, -1);
    renderAnswer();
  }
});

buildNumberCards();
renderStats();
