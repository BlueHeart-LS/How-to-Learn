const gameRoot = document.querySelector("[data-vocab-game]");
const mode = gameRoot?.dataset.vocabMode || "elementary";
const questionCountButtons = document.querySelectorAll("[data-vocab-count]");
const levelButtons = document.querySelectorAll("[data-vocab-level]");
const startButton = document.querySelector("[data-vocab-start]");
const restartButton = document.querySelector("[data-vocab-restart]");
const replayButton = document.querySelector("[data-vocab-replay]");
const introPanel = document.querySelector("[data-vocab-intro]");
const playPanel = document.querySelector("[data-vocab-play]");
const resultPanel = document.querySelector("[data-vocab-result]");
const progress = document.querySelector("[data-vocab-progress]");
const scoreDisplay = document.querySelector("[data-vocab-score]");
const timerDisplay = document.querySelector("[data-vocab-time]");
const selectionSummary = document.querySelector("[data-vocab-selection]");
const questionDisplay = document.querySelector("[data-vocab-question]");
const optionsContainer = document.querySelector("[data-vocab-options]");
const feedback = document.querySelector("[data-vocab-feedback]");
const answerReveal = document.querySelector("[data-vocab-answer]");
const resultSummary = document.querySelector("[data-vocab-summary]");

let selectedCount = 5;
let selectedLevels = new Set(mode === "senior" ? ["1", "2"] : []);
let activeQuestions = [];
let currentIndex = 0;
let score = 0;
let startedAt = 0;
let timerId = null;
let advanceTimer = null;
let answering = false;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function getPool() {
  if (mode === "elementary") return elementaryVocabulary.map(([word, meaning]) => ({ word, meaning }));
  if (mode === "junior") return juniorVocabulary.map(([word, meaning]) => ({ word, meaning }));
  return [...selectedLevels]
    .flatMap((level) => seniorVocabulary[level].map(([word, meaning]) => ({ word, meaning, level })));
}

function formatTime(totalMs) {
  const seconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remain = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remain}`;
}

function renderTimer() {
  const elapsed = startedAt ? Date.now() - startedAt : 0;
  timerDisplay.textContent = formatTime(elapsed);
}

function renderSelectionSummary() {
  const levelText = mode === "senior"
    ? `Level ${[...selectedLevels].sort().join(" / ") || "未選"}`
    : mode === "junior"
      ? "國中常用 2000 字詞"
      : "國小基礎單字";
  selectionSummary.textContent = `${selectedCount} 題 · ${levelText}`;
}

function createOptions(correctMeaning, pool) {
  const distractors = shuffle(
    pool
      .map((item) => item.meaning)
      .filter((meaning) => meaning !== correctMeaning),
  ).slice(0, 3);
  return shuffle([correctMeaning, ...distractors]);
}

function buildQuestions() {
  const pool = getPool();
  const picked = shuffle(pool).slice(0, Math.min(selectedCount, pool.length));
  return picked.map((item) => {
    const options = createOptions(item.meaning, pool);
    return {
      ...item,
      options,
      answer: options.indexOf(item.meaning),
    };
  });
}

function renderStatus() {
  progress.textContent = `${Math.min(currentIndex + 1, activeQuestions.length || selectedCount)} / ${activeQuestions.length || selectedCount}`;
  scoreDisplay.textContent = score;
}

function renderQuestion() {
  const question = activeQuestions[currentIndex];
  if (!question) {
    finishGame();
    return;
  }

  answering = false;
  questionDisplay.textContent = question.word;
  feedback.textContent = "";
  feedback.className = "word-feedback";
  answerReveal.textContent = "";
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
  if (answering) return;
  answering = true;

  const question = activeQuestions[currentIndex];
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

  answerReveal.textContent = `${question.word} = ${question.meaning}`;
  renderStatus();
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(() => {
    currentIndex += 1;
    renderQuestion();
  }, 880);
}

function startGame() {
  if (mode === "senior" && selectedLevels.size === 0) {
    selectionSummary.textContent = "請至少選擇一個高中單字級別";
    return;
  }

  activeQuestions = buildQuestions();
  currentIndex = 0;
  score = 0;
  introPanel.hidden = true;
  resultPanel.hidden = true;
  playPanel.hidden = false;
  startedAt = Date.now();
  clearInterval(timerId);
  timerId = setInterval(renderTimer, 1000);
  renderTimer();
  renderQuestion();
}

function finishGame() {
  clearInterval(timerId);
  clearTimeout(advanceTimer);
  playPanel.hidden = true;
  resultPanel.hidden = false;
  progress.textContent = `${activeQuestions.length} / ${activeQuestions.length}`;
  const elapsed = Date.now() - startedAt;
  const accuracy = activeQuestions.length ? Math.round((score / activeQuestions.length) * 100) : 0;
  const averageSeconds = activeQuestions.length ? Math.round((elapsed / 1000 / activeQuestions.length) * 10) / 10 : 0;
  const reward = score * 5 + (accuracy >= 80 ? 15 : 0);
  window.HowToLearnRewards?.award(reward);
  resultSummary.textContent = `本回共 ${activeQuestions.length} 題，答對 ${score} 題，正確率 ${accuracy}%。總作答時間 ${formatTime(elapsed)}，平均每題 ${averageSeconds} 秒。獲得 ${reward} 枚學習金幣。`;
}

function resetGame() {
  clearInterval(timerId);
  clearTimeout(advanceTimer);
  activeQuestions = [];
  currentIndex = 0;
  score = 0;
  answering = false;
  startedAt = 0;
  playPanel.hidden = true;
  resultPanel.hidden = true;
  introPanel.hidden = false;
  timerDisplay.textContent = "0:00";
  renderStatus();
  renderSelectionSummary();
}

questionCountButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedCount = Number(button.dataset.vocabCount);
    questionCountButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderSelectionSummary();
    renderStatus();
  });
});

levelButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const level = button.dataset.vocabLevel;
    if (selectedLevels.has(level)) selectedLevels.delete(level);
    else selectedLevels.add(level);
    button.classList.toggle("active", selectedLevels.has(level));
    button.setAttribute("aria-pressed", String(selectedLevels.has(level)));
    renderSelectionSummary();
  });
});

startButton?.addEventListener("click", startGame);
restartButton?.addEventListener("click", resetGame);
replayButton?.addEventListener("click", startGame);

renderSelectionSummary();
renderStatus();
