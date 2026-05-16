const gameRoot = document.querySelector("[data-chinese-game]");
const level = gameRoot?.dataset.chineseLevel || "elementary";
const bank = chineseQuestionBank[level];
const modeButtons = document.querySelectorAll("[data-chinese-mode]");
const startButton = document.querySelector("[data-chinese-start]");
const restartButton = document.querySelector("[data-chinese-restart]");
const replayButton = document.querySelector("[data-chinese-replay]");
const introPanel = document.querySelector("[data-chinese-intro]");
const playPanel = document.querySelector("[data-chinese-play]");
const resultPanel = document.querySelector("[data-chinese-result]");
const progress = document.querySelector("[data-chinese-progress]");
const scoreDisplay = document.querySelector("[data-chinese-score]");
const modeDisplay = document.querySelector("[data-chinese-mode-label]");
const questionType = document.querySelector("[data-chinese-type]");
const questionCount = document.querySelector("[data-chinese-count]");
const questionDisplay = document.querySelector("[data-chinese-question]");
const optionsContainer = document.querySelector("[data-chinese-options]");
const feedback = document.querySelector("[data-chinese-feedback]");
const explanation = document.querySelector("[data-chinese-explanation]");
const summary = document.querySelector("[data-chinese-summary]");

let selectedMode = "sound";
let questions = [];
let currentIndex = 0;
let score = 0;
let locking = false;
let advanceTimer = null;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function modeLabel(mode) {
  return mode === "shape" ? "字形" : "字音";
}

function renderStatus() {
  const total = questions.length || bank[selectedMode].length;
  const current = questions.length ? Math.min(currentIndex + 1, total) : 0;
  progress.textContent = `${current} / ${total}`;
  scoreDisplay.textContent = score;
  modeDisplay.textContent = modeLabel(selectedMode);
}

function renderQuestion() {
  const question = questions[currentIndex];
  if (!question) {
    finishGame();
    return;
  }

  locking = false;
  questionType.textContent = modeLabel(selectedMode);
  questionCount.textContent = `第 ${currentIndex + 1} 題，共 ${questions.length} 題`;
  questionDisplay.textContent = question.prompt;
  feedback.textContent = "";
  feedback.className = "word-feedback";
  explanation.textContent = "";
  optionsContainer.replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "word-option";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => chooseOption(index));
    optionsContainer.appendChild(button);
  });

  renderStatus();
}

function chooseOption(index) {
  if (locking) return;
  locking = true;

  const question = questions[currentIndex];
  const correct = index === question.answer;
  const buttons = optionsContainer.querySelectorAll("button");

  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.answer) button.classList.add("correct");
    if (buttonIndex === index && !correct) button.classList.add("wrong");
  });

  if (correct) {
    score += 1;
    feedback.textContent = "O";
    feedback.className = "word-feedback correct";
  } else {
    feedback.textContent = "X";
    feedback.className = "word-feedback wrong";
  }

  explanation.textContent = question.explanation;
  renderStatus();
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(() => {
    currentIndex += 1;
    renderQuestion();
  }, 920);
}

function startGame() {
  questions = shuffle(bank[selectedMode]);
  currentIndex = 0;
  score = 0;
  introPanel.hidden = true;
  resultPanel.hidden = true;
  playPanel.hidden = false;
  renderQuestion();
}

function finishGame() {
  clearTimeout(advanceTimer);
  playPanel.hidden = true;
  resultPanel.hidden = false;
  progress.textContent = `${questions.length} / ${questions.length}`;
  const accuracy = questions.length ? Math.round((score / questions.length) * 100) : 0;
  summary.textContent = `${bank.label} ${modeLabel(selectedMode)}練習完成，共 ${questions.length} 題，答對 ${score} 題，正確率 ${accuracy}%。`;
}

function resetGame() {
  clearTimeout(advanceTimer);
  questions = [];
  currentIndex = 0;
  score = 0;
  locking = false;
  playPanel.hidden = true;
  resultPanel.hidden = true;
  introPanel.hidden = false;
  renderStatus();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedMode = button.dataset.chineseMode;
    modeButtons.forEach((item) => item.classList.toggle("active", item === button));
    modeButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    renderStatus();
  });
});

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", resetGame);
replayButton?.addEventListener("click", startGame);
renderStatus();
