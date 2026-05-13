const gameRoot = document.querySelector("[data-fraction-game]");
const introPanel = document.querySelector("[data-game-intro]");
const questionPanel = document.querySelector("[data-question-panel]");
const resultPanel = document.querySelector("[data-game-result]");
const currentCount = document.querySelector("[data-current-count]");
const scoreDisplay = document.querySelector("[data-game-score]");
const accuracyDisplay = document.querySelector("[data-game-accuracy]");
const questionType = document.querySelector("[data-question-type]");
const questionProgress = document.querySelector("[data-question-progress]");
const questionText = document.querySelector("[data-question-text]");
const questionVisual = document.querySelector("[data-question-visual]");
const answerOptions = document.querySelector("[data-answer-options]");
const feedback = document.querySelector("[data-game-feedback]");
const explanation = document.querySelector("[data-game-explanation]");
const resultSummary = document.querySelector("[data-result-summary]");
const startButton = document.querySelector("[data-game-start]");
const restartButton = document.querySelector("[data-game-restart]");
const modeResetButton = document.querySelector("[data-mode-reset]");
const countButtons = document.querySelectorAll("[data-question-count]");
const includeRatio = document.querySelector("[data-include-ratio]");
const includePercent = document.querySelector("[data-include-percent]");

const baseValues = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 1, denominator: 5 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 5 },
  { numerator: 4, denominator: 5 },
  { numerator: 1, denominator: 8 },
  { numerator: 3, denominator: 8 },
  { numerator: 5, denominator: 8 },
  { numerator: 7, denominator: 8 },
  { numerator: 1, denominator: 10 },
  { numerator: 3, denominator: 10 },
  { numerator: 7, denominator: 10 },
  { numerator: 9, denominator: 10 },
  { numerator: 1, denominator: 20 },
  { numerator: 3, denominator: 20 },
  { numerator: 7, denominator: 20 },
  { numerator: 9, denominator: 20 },
  { numerator: 1, denominator: 25 },
  { numerator: 6, denominator: 25 },
  { numerator: 12, denominator: 25 },
  { numerator: 17, denominator: 25 },
  { numerator: 23, denominator: 25 },
];

let selectedCount = 10;
let questions = [];
let questionIndex = 0;
let score = 0;
let answered = false;

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function simplify(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

function decimalOf(item) {
  const value = item.numerator / item.denominator;
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

function percentOf(item) {
  return `${Number(((item.numerator / item.denominator) * 100).toFixed(1)).toString()}%`;
}

function fractionOf(item) {
  const simple = simplify(item.numerator, item.denominator);
  return `${simple.numerator}/${simple.denominator}`;
}

function ratioOf(item) {
  const simple = simplify(item.numerator, item.denominator);
  return `${simple.numerator}:${simple.denominator}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueOptions(correct, formatter) {
  const optionSet = new Set([correct]);
  const candidates = shuffle(baseValues);

  candidates.forEach((item) => {
    if (optionSet.size < 4) {
      optionSet.add(formatter(item));
    }
  });

  return shuffle([...optionSet]).slice(0, 4);
}

function buildVisual(item) {
  const total = Math.min(item.denominator, 25);
  const active = item.numerator;
  const cells = Array.from({ length: total }, (_, index) => {
    const className = index < active ? "filled" : "";
    return `<span class="${className}"></span>`;
  }).join("");

  return `<div class="fraction-mini-grid" style="--fraction-columns: ${Math.min(total, 10)}">${cells}</div>`;
}

function makeQuestion(type) {
  const item = randomItem(baseValues);
  const fraction = fractionOf(item);
  const decimal = decimalOf(item);
  const percent = percentOf(item);
  const ratio = ratioOf(item);

  const templates = {
    fractionToDecimal: {
      label: "分數 → 小數",
      prompt: `${fraction} 等於哪一個小數？`,
      answer: decimal,
      formatter: decimalOf,
      explanation: `${fraction} = ${decimal}`,
    },
    decimalToFraction: {
      label: "小數 → 分數",
      prompt: `${decimal} 等於哪一個分數？`,
      answer: fraction,
      formatter: fractionOf,
      explanation: `${decimal} = ${fraction}`,
    },
    fractionToPercent: {
      label: "分數 → 百分率",
      prompt: `${fraction} 等於幾個百分比？`,
      answer: percent,
      formatter: percentOf,
      explanation: `${fraction} = ${decimal} = ${percent}`,
    },
    percentToDecimal: {
      label: "百分率 → 小數",
      prompt: `${percent} 等於哪一個小數？`,
      answer: decimal,
      formatter: decimalOf,
      explanation: `${percent} = ${decimal}`,
    },
    ratioToFraction: {
      label: "比率 → 分數",
      prompt: `${ratio} 可以寫成哪一個分數？`,
      answer: fraction,
      formatter: fractionOf,
      explanation: `${ratio} = ${fraction}`,
    },
    decimalToRatio: {
      label: "小數 → 比率",
      prompt: `${decimal} 可以寫成哪一個比率？`,
      answer: ratio,
      formatter: ratioOf,
      explanation: `${decimal} = ${ratio}`,
    },
  };

  const question = templates[type];
  return {
    ...question,
    visual: buildVisual(item),
    options: uniqueOptions(question.answer, question.formatter),
  };
}

function getQuestionTypes() {
  const types = ["fractionToDecimal", "decimalToFraction"];

  if (includePercent?.checked) {
    types.push("fractionToPercent", "percentToDecimal");
  }

  if (includeRatio?.checked) {
    types.push("ratioToFraction", "decimalToRatio");
  }

  return types;
}

function buildQuestions() {
  const types = getQuestionTypes();
  questions = Array.from({ length: selectedCount }, () => makeQuestion(randomItem(types)));
}

function renderStats(done = questionIndex) {
  const totalAnswered = Math.max(0, Math.min(done, selectedCount));
  const accuracy = totalAnswered ? Math.round((score / totalAnswered) * 100) : 0;

  currentCount.textContent = `${totalAnswered}/${selectedCount}`;
  scoreDisplay.textContent = score;
  accuracyDisplay.textContent = `${accuracy}%`;
}

function renderQuestion() {
  const current = questions[questionIndex];
  answered = false;
  questionType.textContent = current.label;
  questionProgress.textContent = `第 ${questionIndex + 1} 題 / 共 ${selectedCount} 題`;
  questionText.textContent = current.prompt;
  questionVisual.innerHTML = current.visual;
  feedback.textContent = "";
  feedback.className = "word-feedback";
  explanation.textContent = "";
  answerOptions.innerHTML = "";

  current.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "word-option fraction-option";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(button, option));
    answerOptions.append(button);
  });
}

function finishGame() {
  questionPanel.hidden = true;
  resultPanel.hidden = false;
  const wrong = selectedCount - score;
  const accuracy = Math.round((score / selectedCount) * 100);
  const reward = score * 5 + (accuracy >= 80 ? 15 : 0);
  window.HowToLearnRewards?.award(reward);
  resultSummary.textContent = `這次完成 ${selectedCount} 題，答對 ${score} 題、答錯 ${wrong} 題，正確率 ${accuracy}%。獲得 ${reward} 枚學習金幣，可以拿去照顧寵物。`;
}

function nextQuestion() {
  questionIndex += 1;
  renderStats();

  if (questionIndex >= selectedCount) {
    finishGame();
    return;
  }

  renderQuestion();
}

function checkAnswer(button, option) {
  if (answered) return;
  answered = true;

  const current = questions[questionIndex];
  const isCorrect = option === current.answer;
  const optionButtons = answerOptions.querySelectorAll("button");

  optionButtons.forEach((item) => {
    item.disabled = true;
    if (item.textContent === current.answer) item.classList.add("correct");
  });

  if (isCorrect) {
    score += 1;
    button.classList.add("correct");
    feedback.textContent = "O";
    feedback.classList.add("correct");
  } else {
    button.classList.add("wrong");
    feedback.textContent = "X";
    feedback.classList.add("wrong");
  }

  explanation.textContent = current.explanation;
  renderStats(questionIndex + 1);
  setTimeout(nextQuestion, 850);
}

function startGame() {
  buildQuestions();
  questionIndex = 0;
  score = 0;
  introPanel.hidden = true;
  resultPanel.hidden = true;
  questionPanel.hidden = false;
  renderStats();
  renderQuestion();
}

function resetToIntro() {
  questionPanel.hidden = true;
  resultPanel.hidden = true;
  introPanel.hidden = false;
  questionIndex = 0;
  score = 0;
  renderStats();
}

countButtons.forEach((button) => {
  button.addEventListener("click", () => {
    countButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    selectedCount = Number(button.dataset.questionCount);
    renderStats();
  });
});

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", startGame);
modeResetButton?.addEventListener("click", resetToIntro);

if (gameRoot) {
  renderStats();
}
