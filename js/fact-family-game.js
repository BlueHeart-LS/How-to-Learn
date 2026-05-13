const gameTime = document.querySelector("[data-game-time]");
const gameScore = document.querySelector("[data-game-score]");
const gameStreak = document.querySelector("[data-game-streak]");
const introPanel = document.querySelector("[data-game-intro]");
const playArea = document.querySelector("[data-game-play]");
const resultPanel = document.querySelector("[data-game-result]");
const referenceEquation = document.querySelector("[data-reference-equation]");
const equationDisplay = document.querySelector("[data-equation-display]");
const numberCards = document.querySelector("[data-number-cards]");
const feedback = document.querySelector("[data-game-feedback]");
const resultHeading = document.querySelector("[data-result-heading]");
const resultSummary = document.querySelector("[data-result-summary]");
const startButton = document.querySelector("[data-game-start]");
const restartButton = document.querySelector("[data-game-restart]");

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

function randomFactor() {
  return Math.random() < 0.12 ? 1 : randomNumber(2, 9);
}

function createQuestion() {
  const factorA = randomFactor();
  const factorB = randomFactor();
  const product = factorA * factorB;
  const askForA = Math.random() < 0.5;
  const divisor = askForA ? factorB : factorA;
  const answer = askForA ? factorA : factorB;
  return { factorA, factorB, product, divisor, answer: String(answer) };
}

function renderEquation() {
  const { factorA, factorB, product, divisor } = currentQuestion;
  referenceEquation.textContent = `${factorA} × ${factorB} = ${product}`;
  equationDisplay.innerHTML = `${product} ÷ ${divisor} = <span class="equation-slot">${currentAnswer}</span>`;
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
}

function checkAnswer(answer) {
  if (isChecking) return;
  currentAnswer = String(answer);
  isChecking = true;
  renderEquation();

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
    if (!playArea.hidden && secondsLeft > 0) newRound();
  }, 520);
}

function endGame() {
  clearInterval(timerId);
  clearTimeout(nextQuestionTimer);
  playArea.hidden = true;
  resultPanel.hidden = false;
  resultHeading.textContent = "時間到";
  const total = score + wrong;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const reward = score * 3 + (accuracy >= 80 ? 10 : 0);
  window.HowToLearnRewards?.award(reward);
  resultSummary.textContent = `你在 30 秒內完成 ${total} 題，答對 ${score} 題、答錯 ${wrong} 題，正確率 ${accuracy}%。最高連續答對紀錄是 ${bestStreak}。獲得 ${reward} 枚學習金幣。`;
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
  currentAnswer = "";
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
  numberCards.replaceChildren();
  [7, 8, 9, 4, 5, 6, 1, 2, 3].forEach((number) => {
    const button = document.createElement("button");
    button.className = "number-card";
    button.type = "button";
    button.textContent = number;
    button.addEventListener("click", () => {
      if (playArea.hidden || isChecking) return;
      checkAnswer(number);
    });
    numberCards.append(button);
  });
}

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", startGame);

document.addEventListener("keydown", (event) => {
  if (playArea?.hidden || isChecking) return;
  if (/^[1-9]$/.test(event.key)) checkAnswer(event.key);
});

buildNumberCards();
renderStats();
