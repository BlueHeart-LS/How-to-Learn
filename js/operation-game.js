const gameTime = document.querySelector("[data-game-time]");
const gameScore = document.querySelector("[data-game-score]");
const gameStreak = document.querySelector("[data-game-streak]");
const introPanel = document.querySelector("[data-game-intro]");
const playArea = document.querySelector("[data-game-play]");
const resultPanel = document.querySelector("[data-game-result]");
const equationDisplay = document.querySelector("[data-equation-display]");
const numberCards = document.querySelector("[data-number-cards]");
const operationCards = document.querySelector("[data-operation-cards]");
const feedback = document.querySelector("[data-game-feedback]");
const resultHeading = document.querySelector("[data-result-heading]");
const resultSummary = document.querySelector("[data-result-summary]");
const startButton = document.querySelector("[data-game-start]");
const restartButton = document.querySelector("[data-game-restart]");
const modeResetButton = document.querySelector("[data-mode-reset]");
const modeInputs = document.querySelectorAll('input[name="operation-mode"]');

const gameLength = 30;
const operations = ["+", "-", "×", "÷"];
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
let currentMode = "number";

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createQuestion() {
  const operation = operations[randomNumber(0, operations.length - 1)];
  let left;
  let right;
  let result;

  if (operation === "+") {
    left = randomNumber(1, 8);
    right = randomNumber(1, 9 - left);
    result = left + right;
  }

  if (operation === "-") {
    left = randomNumber(2, 9);
    right = randomNumber(1, left - 1);
    result = left - right;
  }

  if (operation === "×") {
    left = randomNumber(1, 9);
    right = randomNumber(1, Math.floor(9 / left));
    result = left * right;
  }

  if (operation === "÷") {
    right = randomNumber(1, 9);
    result = randomNumber(1, Math.floor(9 / right));
    left = right * result;
  }

  const hiddenPart = currentMode === "number" ? ["left", "right", "result"][randomNumber(0, 2)] : "operation";
  const answer = hiddenPart === "operation"
    ? operation
    : String(hiddenPart === "left" ? left : hiddenPart === "right" ? right : result);

  return { left, right, result, operation, hiddenPart, answer };
}

function renderEquation() {
  const { left, right, result, operation, hiddenPart } = currentQuestion;
  const numberSlot = `<span class="equation-slot">${currentAnswer}</span>`;
  const operationSlot = `<span class="equation-slot operation-slot" aria-label="請填入運算符號">${currentAnswer}</span>`;
  const leftText = hiddenPart === "left" ? numberSlot : left;
  const operationText = hiddenPart === "operation" ? operationSlot : operation;
  const rightText = hiddenPart === "right" ? numberSlot : right;
  const resultText = hiddenPart === "result" ? numberSlot : result;

  equationDisplay.innerHTML = `${leftText} ${operationText} ${rightText} = ${resultText}`;
}

function renderStats() {
  gameTime.textContent = secondsLeft;
  gameScore.textContent = score;
  gameStreak.textContent = streak;
}

function isCorrectOperation(operation) {
  const { left, right, result } = currentQuestion;

  if (operation === "+") return left + right === result;
  if (operation === "-") return left - right === result;
  if (operation === "×") return left * right === result;
  if (operation === "÷") return right !== 0 && left / right === result;

  return false;
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

  const isCorrect = currentMode === "operator"
    ? isCorrectOperation(currentAnswer)
    : currentAnswer === currentQuestion.answer;

  if (isCorrect) {
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
  currentMode = document.querySelector('input[name="operation-mode"]:checked')?.value || "number";
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
  numberCards.hidden = currentMode !== "number";
  operationCards.hidden = currentMode !== "operator";
  renderStats();
  newRound();
  timerId = setInterval(tick, 1000);
}

function buildNumberCards() {
  if (!numberCards) return;

  numberCards.innerHTML = "";
  [7, 8, 9, 4, 5, 6, 1, 2, 3].forEach((number) => {
    const button = document.createElement("button");
    button.className = "number-card";
    button.type = "button";
    button.textContent = number;
    button.addEventListener("click", () => {
      if (playArea.hidden || isChecking || currentMode !== "number") return;
      checkAnswer(number);
    });
    numberCards.append(button);
  });
}

function buildOperationCards() {
  if (!operationCards) return;

  operationCards.innerHTML = "";
  operations.forEach((operation) => {
    const button = document.createElement("button");
    button.className = "number-card operation-card";
    button.type = "button";
    button.textContent = operation;
    button.addEventListener("click", () => {
      if (playArea.hidden || isChecking || currentMode !== "operator") return;
      checkAnswer(operation);
    });
    operationCards.append(button);
  });
}

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", startGame);
modeResetButton?.addEventListener("click", () => {
  clearInterval(timerId);
  clearTimeout(nextQuestionTimer);
  resultPanel.hidden = true;
  playArea.hidden = true;
  introPanel.hidden = false;
  secondsLeft = gameLength;
  score = 0;
  wrong = 0;
  streak = 0;
  bestStreak = 0;
  currentAnswer = "";
  isChecking = false;
  renderStats();
});

document.addEventListener("keydown", (event) => {
  if (playArea?.hidden || isChecking) return;

  if (currentMode === "number" && /^[1-9]$/.test(event.key)) {
    checkAnswer(event.key);
  }

  const keyMap = {
    "+": "+",
    "-": "-",
    "*": "×",
    x: "×",
    X: "×",
    "/": "÷",
  };
  const operation = keyMap[event.key];

  if (currentMode === "operator" && operation) {
    checkAnswer(operation);
  }
});

buildNumberCards();
buildOperationCards();
renderStats();
