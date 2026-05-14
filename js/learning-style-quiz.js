const questions = [
  {
    text: "遇到一個全新的主題時，你最自然的第一步是什麼？",
    options: [
      { text: "先看圖表、影片或範例，抓整體感覺。", type: "visual" },
      { text: "先列出章節、目標和讀書順序。", type: "structured" },
      { text: "先動手做一題或試著操作看看。", type: "action" },
      { text: "先想它和我已經知道的事情有什麼關係。", type: "reflective" },
    ],
  },
  {
    text: "你覺得一堂課最有幫助的部分通常是？",
    options: [
      { text: "清楚的示意圖與重點整理。", type: "visual" },
      { text: "一步一步的講解流程。", type: "structured" },
      { text: "能馬上練習的活動或任務。", type: "action" },
      { text: "讓我停下來思考的提問。", type: "reflective" },
    ],
  },
  {
    text: "準備考試或作品時，你比較容易卡在哪裡？",
    options: [
      { text: "資料太散，沒有清楚畫面。", type: "visual" },
      { text: "不知道先做哪一步。", type: "structured" },
      { text: "看太久但練習太少。", type: "action" },
      { text: "讀完了卻不知道自己懂了多少。", type: "reflective" },
    ],
  },
  {
    text: "如果只能選一種筆記方式，你會選？",
    options: [
      { text: "心智圖、表格或顏色標記。", type: "visual" },
      { text: "條列大綱與待辦清單。", type: "structured" },
      { text: "錯題紀錄與練習步驟。", type: "action" },
      { text: "學習日誌與自己的理解摘要。", type: "reflective" },
    ],
  },
  {
    text: "你最希望網站先幫你解決哪件事？",
    options: [
      { text: "看見自己的學習樣貌。", type: "visual" },
      { text: "安排清楚的學習路線。", type: "structured" },
      { text: "找到可以立刻使用的工具。", type: "action" },
      { text: "知道哪種方法真正適合我。", type: "reflective" },
    ],
  },
  {
    text: "完成一段學習後，你通常會怎麼確認成果？",
    options: [
      { text: "把內容整理成圖像或總覽。", type: "visual" },
      { text: "對照原本的計畫檢查進度。", type: "structured" },
      { text: "直接做題、做作品或講給別人聽。", type: "action" },
      { text: "回想哪裡順利、哪裡需要調整。", type: "reflective" },
    ],
  },
];

const results = {
  visual: {
    title: "你偏向圖像整理型",
    copy: "你適合先建立全貌，再慢慢補上細節。當資訊能被看見、分類和比較，你會更容易進入狀況。",
    recommendation: "自我探索",
    reason: "先從自我探索的其他主題開始，幫自己建立清楚的學習地圖。",
    href: "explore.html",
  },
  structured: {
    title: "你偏向路線規劃型",
    copy: "你適合把目標拆成明確步驟。只要知道順序、時間和檢查點，學習就會穩很多。",
    recommendation: "如何開始",
    reason: "先回到如何開始，照著網站分頁找到最適合你的第一步。",
    href: "start.html",
  },
  action: {
    title: "你偏向實作練習型",
    copy: "你適合邊做邊學。比起長時間閱讀，你更需要工具、任務和可立即嘗試的小練習。",
    recommendation: "資源專區",
    reason: "先到資源專區找工具與範本，把方法直接放進你的學習流程。",
    href: "resources.html",
  },
  reflective: {
    title: "你偏向理解反思型",
    copy: "你適合理解原理後再開始行動。當你知道方法背後的原因，就更容易持續使用它。",
    recommendation: "學習方法",
    reason: "先閱讀學習方法文章，從具體策略中挑一個最想嘗試的方向。",
    href: "methods.html",
  },
};

const quiz = document.querySelector("[data-quiz]");
const resultPanel = document.querySelector("[data-quiz-result]");
const count = document.querySelector("[data-quiz-count]");
const progress = document.querySelector("[data-quiz-progress]");
const kicker = document.querySelector("[data-quiz-kicker]");
const questionText = document.querySelector("[data-quiz-question]");
const optionsWrap = document.querySelector("[data-quiz-options]");
const prevButton = document.querySelector("[data-quiz-prev]");
const nextButton = document.querySelector("[data-quiz-next]");
const restartButton = document.querySelector("[data-quiz-restart]");
const resultTitle = document.querySelector("[data-result-title]");
const resultCopy = document.querySelector("[data-result-copy]");
const resultRecommendation = document.querySelector("[data-result-recommendation]");
const resultReason = document.querySelector("[data-result-reason]");
const resultLink = document.querySelector("[data-result-link]");

let currentQuestion = 0;
const answers = Array(questions.length).fill(null);

function renderQuestion() {
  const question = questions[currentQuestion];
  const selected = answers[currentQuestion];

  count.textContent = `第 ${currentQuestion + 1} 題 / 共 ${questions.length} 題`;
  kicker.textContent = `Question ${String(currentQuestion + 1).padStart(2, "0")}`;
  questionText.textContent = question.text;
  progress.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  optionsWrap.replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.type = "button";
    button.textContent = option.text;
    button.setAttribute("aria-pressed", String(selected === index));
    button.addEventListener("click", () => {
      answers[currentQuestion] = index;
      renderQuestion();
    });
    optionsWrap.append(button);
  });

  prevButton.disabled = currentQuestion === 0;
  nextButton.disabled = selected === null;
  nextButton.replaceChildren();
  nextButton.append(currentQuestion === questions.length - 1 ? "查看結果 " : "下一題 ");

  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "→";
  nextButton.append(arrow);
}

function getResultType() {
  const score = { visual: 0, structured: 0, action: 0, reflective: 0 };

  answers.forEach((answer, index) => {
    const type = questions[index].options[answer].type;
    score[type] += 1;
  });

  return Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
}

function showResult() {
  const result = results[getResultType()];

  quiz.hidden = true;
  resultPanel.hidden = false;
  resultTitle.textContent = result.title;
  resultCopy.textContent = result.copy;
  resultRecommendation.textContent = result.recommendation;
  resultReason.textContent = result.reason;
  resultLink.href = result.href;
}

prevButton?.addEventListener("click", () => {
  currentQuestion -= 1;
  renderQuestion();
});

nextButton?.addEventListener("click", () => {
  if (currentQuestion === questions.length - 1) {
    showResult();
    return;
  }

  currentQuestion += 1;
  renderQuestion();
});

restartButton?.addEventListener("click", () => {
  answers.fill(null);
  currentQuestion = 0;
  resultPanel.hidden = true;
  quiz.hidden = false;
  renderQuestion();
});

if (quiz) {
  renderQuestion();
}
