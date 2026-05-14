const questionSets = {
  elementary: {
    label: "國小",
    questions: [
      {
        type: "字音",
        prompt: "「立即」的「即」讀音是哪一個？",
        options: ["ㄐㄧˊ", "ㄐㄧˋ", "ㄑㄧˊ", "ㄑㄧˋ"],
        answer: 0,
        explanation: "「即」在「立即」中讀作 ㄐㄧˊ。",
      },
      {
        type: "字形",
        prompt: "下列哪一個詞語字形正確？",
        options: ["一望無際", "一望無記", "一望無濟", "一忘無際"],
        answer: 0,
        explanation: "正確寫法是「一望無際」。",
      },
      {
        type: "字音",
        prompt: "「溫暖」的「暖」讀音是哪一個？",
        options: ["ㄋㄨㄢˇ", "ㄌㄨㄢˇ", "ㄋㄢˇ", "ㄌㄢˇ"],
        answer: 0,
        explanation: "「暖」讀作 ㄋㄨㄢˇ。",
      },
      {
        type: "字形",
        prompt: "句子中的空格應填入哪一個詞？「他把書桌整理得很 ___。」",
        options: ["整潔", "整絜", "整節", "整結"],
        answer: 0,
        explanation: "表示乾淨有條理時，應寫作「整潔」。",
      },
      {
        type: "字音",
        prompt: "「蜻蜓」的「蜻」讀音是哪一個？",
        options: ["ㄑㄧㄥ", "ㄐㄧㄥ", "ㄑㄧㄣ", "ㄐㄧㄣ"],
        answer: 0,
        explanation: "「蜻」讀作 ㄑㄧㄥ。",
      },
      {
        type: "字形",
        prompt: "下列哪一個詞語字形正確？",
        options: ["專心致志", "專心致誌", "專心至志", "專心志致"],
        answer: 0,
        explanation: "正確寫法是「專心致志」。",
      },
    ],
  },
  junior: {
    label: "國中",
    questions: [
      {
        type: "字音",
        prompt: "「罄竹難書」的「罄」讀音是哪一個？",
        options: ["ㄑㄧㄥˋ", "ㄑㄧㄣˋ", "ㄐㄧㄥˋ", "ㄐㄧㄣˋ"],
        answer: 0,
        explanation: "「罄」讀作 ㄑㄧㄥˋ。",
      },
      {
        type: "字形",
        prompt: "下列哪一個成語字形正確？",
        options: ["按部就班", "按步就班", "安部就班", "安步就班"],
        answer: 0,
        explanation: "正確寫法是「按部就班」。",
      },
      {
        type: "字音",
        prompt: "「裨益」的「裨」讀音是哪一個？",
        options: ["ㄅㄧˋ", "ㄆㄧˊ", "ㄅㄟˋ", "ㄆㄟˊ"],
        answer: 0,
        explanation: "「裨益」的「裨」讀作 ㄅㄧˋ。",
      },
      {
        type: "字形",
        prompt: "下列哪一個詞語字形正確？",
        options: ["鍥而不捨", "契而不捨", "鍥而不舍", "契而不舍"],
        answer: 0,
        explanation: "正確寫法是「鍥而不捨」。",
      },
      {
        type: "字音",
        prompt: "「迥然不同」的「迥」讀音是哪一個？",
        options: ["ㄐㄩㄥˇ", "ㄐㄩㄥˋ", "ㄐㄧㄥˇ", "ㄐㄧㄥˋ"],
        answer: 0,
        explanation: "「迥」讀作 ㄐㄩㄥˇ。",
      },
      {
        type: "字形",
        prompt: "句子中的空格應填入哪一個詞？「這段文字脈絡清楚，論述十分 ___。」",
        options: ["嚴謹", "嚴僅", "言謹", "言僅"],
        answer: 0,
        explanation: "表示周密而不草率，應寫作「嚴謹」。",
      },
    ],
  },
  senior: {
    label: "高中",
    questions: [
      {
        type: "字音",
        prompt: "「剽竊」的「剽」讀音是哪一個？",
        options: ["ㄆㄧㄠˋ", "ㄆㄧㄠ", "ㄅㄧㄠˋ", "ㄅㄧㄠ"],
        answer: 0,
        explanation: "「剽竊」的「剽」讀作 ㄆㄧㄠˋ。",
      },
      {
        type: "字形",
        prompt: "下列哪一個成語字形正確？",
        options: ["振聾發聵", "振聾發愧", "震聾發聵", "震聾發愧"],
        answer: 0,
        explanation: "正確寫法是「振聾發聵」。",
      },
      {
        type: "字音",
        prompt: "「齟齬」的「齟」讀音是哪一個？",
        options: ["ㄐㄩˇ", "ㄗㄨˇ", "ㄐㄩˋ", "ㄗㄨˋ"],
        answer: 0,
        explanation: "「齟」讀作 ㄐㄩˇ。",
      },
      {
        type: "字形",
        prompt: "下列哪一個詞語字形正確？",
        options: ["相形見絀", "相形見拙", "相形見黜", "相形見茁"],
        answer: 0,
        explanation: "正確寫法是「相形見絀」。",
      },
      {
        type: "字音",
        prompt: "「斡旋」的「斡」讀音是哪一個？",
        options: ["ㄨㄛˋ", "ㄨㄢˋ", "ㄏㄢˋ", "ㄏㄨㄢˋ"],
        answer: 0,
        explanation: "「斡旋」的「斡」讀作 ㄨㄛˋ。",
      },
      {
        type: "字形",
        prompt: "句子中的空格應填入哪一個詞？「他的說明條理分明，論證十分 ___。」",
        options: ["縝密", "慎密", "縝蜜", "慎蜜"],
        answer: 0,
        explanation: "表示周詳細密，應寫作「縝密」。",
      },
    ],
  },
};

const progress = document.querySelector("[data-word-progress]");
const scoreDisplay = document.querySelector("[data-word-score]");
const levelDisplay = document.querySelector("[data-word-level]");
const intro = document.querySelector("[data-word-intro]");
const playPanel = document.querySelector("[data-word-play]");
const resultPanel = document.querySelector("[data-word-result]");
const typeDisplay = document.querySelector("[data-word-type]");
const countDisplay = document.querySelector("[data-word-count]");
const questionDisplay = document.querySelector("[data-word-question]");
const optionsContainer = document.querySelector("[data-word-options]");
const feedback = document.querySelector("[data-word-feedback]");
const explanation = document.querySelector("[data-word-explanation]");
const summary = document.querySelector("[data-word-summary]");
const restartButton = document.querySelector("[data-word-restart]");
const startButtons = document.querySelectorAll("[data-word-start]");

let currentLevel = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let wrongByType = { 字音: 0, 字形: 0 };
let moving = false;
let advanceTimer = null;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function renderStatus() {
  const total = currentQuestions.length || 6;
  const visibleIndex = currentQuestions.length ? Math.min(currentIndex + 1, total) : 0;
  progress.textContent = `${visibleIndex} / ${total}`;
  scoreDisplay.textContent = score;
  levelDisplay.textContent = currentLevel ? questionSets[currentLevel].label : "尚未選擇";
}

function renderQuestion() {
  const question = currentQuestions[currentIndex];
  if (!question) {
    finishGame();
    return;
  }

  moving = false;
  typeDisplay.textContent = question.type;
  countDisplay.textContent = `第 ${currentIndex + 1} 題，共 ${currentQuestions.length} 題`;
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
  if (moving) return;
  moving = true;

  const question = currentQuestions[currentIndex];
  const isCorrect = index === question.answer;
  const optionButtons = optionsContainer.querySelectorAll("button");

  optionButtons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.answer) button.classList.add("correct");
    if (buttonIndex === index && !isCorrect) button.classList.add("wrong");
  });

  if (isCorrect) {
    score += 1;
    feedback.textContent = "O";
    feedback.className = "word-feedback correct";
  } else {
    wrongByType[question.type] += 1;
    feedback.textContent = "X";
    feedback.className = "word-feedback wrong";
  }

  explanation.textContent = question.explanation;
  renderStatus();
  clearTimeout(advanceTimer);
  advanceTimer = setTimeout(() => {
    currentIndex += 1;
    renderQuestion();
  }, 980);
}

function finishGame() {
  clearTimeout(advanceTimer);
  playPanel.hidden = true;
  resultPanel.hidden = false;
  progress.textContent = `${currentQuestions.length} / ${currentQuestions.length}`;

  const total = currentQuestions.length;
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const wrongSound = wrongByType.字音;
  const wrongShape = wrongByType.字形;
  const weakType = wrongSound === wrongShape
    ? "字音與字形都可以再穩一點"
    : wrongSound > wrongShape
      ? "字音辨識"
      : "字形判斷";

  summary.textContent = `這次共完成 ${total} 題，答對 ${score} 題，正確率 ${accuracy}%。目前較需要留意的是 ${weakType}。`;
}

function startGame(level) {
  currentLevel = level;
  currentQuestions = shuffle(questionSets[level].questions);
  currentIndex = 0;
  score = 0;
  wrongByType = { 字音: 0, 字形: 0 };
  intro.hidden = true;
  resultPanel.hidden = true;
  playPanel.hidden = false;
  renderQuestion();
}

function resetGame() {
  clearTimeout(advanceTimer);
  currentLevel = null;
  currentQuestions = [];
  currentIndex = 0;
  score = 0;
  wrongByType = { 字音: 0, 字形: 0 };
  moving = false;
  playPanel.hidden = true;
  resultPanel.hidden = true;
  intro.hidden = false;
  renderStatus();
}

startButtons.forEach((button) => {
  button.addEventListener("click", () => startGame(button.dataset.wordStart));
});

restartButton?.addEventListener("click", resetGame);
renderStatus();
