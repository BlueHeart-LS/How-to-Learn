const careerProfiles = {
  maker: {
    title: "創作設計型",
    fields: "設計、影像、寫作、產品企劃、內容創作",
    advice: "你可能適合從作品開始累積。先做一個小作品、整理成作品集，再慢慢觀察自己喜歡哪一種創作流程。",
    start: "可以從「隨機探索」抽設計、藝術、科技主題，也可以到「筆記整理實驗室」練習把靈感整理成作品雛形。",
  },
  analyst: {
    title: "分析研究型",
    fields: "資料分析、科學研究、金融、工程、策略規劃",
    advice: "你可能喜歡拆解問題、找規律、用證據做判斷。可以從小型研究題目開始，練習提出假設、蒐集資料、整理結論。",
    start: "可以從「學習方法」建立資料整理方式，也可以到「隨機探索」抽 AI、金融、工科或醫學主題。",
  },
  helper: {
    title: "陪伴助人型",
    fields: "教育、心理、醫護、社工、兒少服務、公共議題",
    advice: "你可能重視人的感受與成長，也願意在關係中支持別人。可以多觀察自己喜歡哪一種陪伴方式：教學、照護、溝通或制度改善。",
    start: "可以先做「學習風格探索」理解自己，也可以用「時間節奏規劃」練習如何陪自己建立穩定節奏。",
  },
  organizer: {
    title: "組織管理型",
    fields: "專案管理、活動企劃、行政管理、營運、創業",
    advice: "你可能擅長把混亂變成流程，讓事情一步一步完成。可以從規劃一個小活動或任務表開始，練習協調資源和追蹤進度。",
    start: "可以從「時間節奏規劃」開始，把任務、練習與休息排出節奏，再到「學習方法」補強計畫能力。",
  },
  explorer: {
    title: "跨域探索型",
    fields: "新興科技、跨領域企劃、創新教育、媒體、研究助理",
    advice: "你可能對很多領域都有好奇心，適合先廣泛嘗試，再慢慢找出反覆吸引你的主題。",
    start: "很適合從「隨機探索」開始，每次抽一個新領域，再把有興趣的主題整理成下一次學習任務。",
  },
};

const careerSteps = [
  {
    title: "哪一種事情最容易讓你想繼續研究？",
    description: "先不用想職業名稱，只選一個你比較有感覺的方向。",
    options: [
      { text: "做出作品、畫面、文字或新的點子", scores: { maker: 3, explorer: 1 } },
      { text: "找出規律、比較資料、解開問題", scores: { analyst: 3, organizer: 1 } },
      { text: "理解別人的困難，想辦法支持他", scores: { helper: 3, organizer: 1 } },
      { text: "認識完全陌生的新主題", scores: { explorer: 3, maker: 1 } },
    ],
  },
  {
    title: "你比較常被別人稱讚哪一種能力？",
    description: "選一個比較接近你的日常狀態。",
    options: [
      { text: "很會想像，也能把想法變成具體呈現", scores: { maker: 3 } },
      { text: "很會整理重點，判斷事情的先後順序", scores: { organizer: 3, analyst: 1 } },
      { text: "很會觀察人，能注意到別人的情緒", scores: { helper: 3 } },
      { text: "學新東西很快，願意嘗試不同領域", scores: { explorer: 3, analyst: 1 } },
    ],
  },
  {
    title: "你想像中的工作日，比較希望長什麼樣子？",
    description: "這題看的是生活節奏，不是薪水或頭銜。",
    options: [
      { text: "有安靜時間深度思考，慢慢把問題拆開", scores: { analyst: 3 } },
      { text: "和人合作討論，把活動或計畫推進完成", scores: { organizer: 3, helper: 1 } },
      { text: "接觸不同人，聽故事、陪伴或解決需求", scores: { helper: 3 } },
      { text: "每天都有新題目，可以邊學邊做", scores: { explorer: 3, maker: 1 } },
    ],
  },
  {
    title: "如果要解決一個問題，你最想先做什麼？",
    description: "最後一塊拼圖，會影響你的推薦方向。",
    options: [
      { text: "先做一個原型或草稿，讓想法跑起來", scores: { maker: 3, explorer: 1 } },
      { text: "先蒐集資料，找出真正的原因", scores: { analyst: 3 } },
      { text: "先問問當事人怎麼想、需要什麼", scores: { helper: 3 } },
      { text: "先排流程、分工、設定下一步", scores: { organizer: 3 } },
    ],
  },
];

const progress = document.querySelector("[data-career-progress]");
const clues = document.querySelector("[data-career-clues]");
const stepLabel = document.querySelector("[data-career-step]");
const title = document.querySelector("[data-career-title]");
const description = document.querySelector("[data-career-description]");
const optionList = document.querySelector("[data-career-options]");
const trail = document.querySelector("[data-career-trail]");
const stage = document.querySelector("[data-career-stage]");
const result = document.querySelector("[data-career-result]");
const resultGrid = document.querySelector("[data-career-result-grid]");
const summary = document.querySelector("[data-career-summary]");
const restart = document.querySelector("[data-career-restart]");

let currentStep = 0;
let scores = {};
let selectedClues = [];

function resetScores() {
  scores = Object.fromEntries(Object.keys(careerProfiles).map((key) => [key, 0]));
}

function renderTrail() {
  trail.replaceChildren();
  if (selectedClues.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "選擇後，這裡會留下你的線索。";
    trail.appendChild(empty);
    return;
  }

  selectedClues.forEach((item) => {
    const chip = document.createElement("span");
    chip.textContent = item;
    trail.appendChild(chip);
  });
}

function renderStep() {
  const step = careerSteps[currentStep];
  progress.textContent = `${currentStep + 1} / ${careerSteps.length}`;
  clues.textContent = selectedClues.length;
  stepLabel.textContent = `Step ${currentStep + 1}`;
  title.textContent = step.title;
  description.textContent = step.description;
  optionList.replaceChildren();

  step.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "career-option";
    button.type = "button";
    button.textContent = option.text;
    button.addEventListener("click", () => chooseOption(option));
    optionList.appendChild(button);
  });

  renderTrail();
}

function chooseOption(option) {
  Object.entries(option.scores).forEach(([profile, value]) => {
    scores[profile] += value;
  });
  selectedClues.push(option.text);
  currentStep += 1;

  if (currentStep >= careerSteps.length) {
    showResult();
    return;
  }

  renderStep();
}

function getTopProfiles() {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key, score]) => ({ key, score, ...careerProfiles[key] }));
}

function showResult() {
  const topProfiles = getTopProfiles();
  stage.hidden = true;
  result.hidden = false;
  progress.textContent = `${careerSteps.length} / ${careerSteps.length}`;
  clues.textContent = selectedClues.length;
  renderTrail();
  resultGrid.replaceChildren();

  topProfiles.forEach((profile) => {
    const card = document.createElement("article");
    card.className = "career-result-card";
    const heading = document.createElement("h3");
    heading.textContent = profile.title;

    const fields = document.createElement("p");
    const fieldsLabel = document.createElement("strong");
    fieldsLabel.textContent = "可能領域：";
    fields.append(fieldsLabel, profile.fields);

    const advice = document.createElement("p");
    advice.textContent = profile.advice;

    const start = document.createElement("p");
    start.textContent = profile.start;

    card.append(heading, fields, advice, start);
    resultGrid.appendChild(card);
  });

  summary.textContent = "職涯探索的重點不是立刻決定未來，而是把模糊的喜歡變成可以嘗試的小行動。你可以先挑一個方向，找一支入門影片、一篇文章，或做一個很小的作品開始。";
}

function startCareerExplore() {
  currentStep = 0;
  selectedClues = [];
  resetScores();
  stage.hidden = false;
  result.hidden = true;
  renderStep();
}

restart?.addEventListener("click", startCareerExplore);

if (optionList) {
  startCareerExplore();
}
