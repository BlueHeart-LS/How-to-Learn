const defaultArticles = {
  feynman: {
    title: "費曼學習法：用教會別人的方式，真正學會一件事",
    category: "學習方法",
    author: "如何學編輯部",
    date: "2024.05.12",
    views: "1.2K",
    tags: ["費曼學習法", "理解", "輸出練習"],
    coverClass: "people",
    excerpt: "費曼學習法的核心，是把你正在學的內容說成簡單、清楚、別人聽得懂的話。",
    body: [
      "費曼學習法的核心，是把你正在學的內容說成簡單、清楚、別人聽得懂的話。當你發現自己說不清楚，就代表那裡還需要回頭補強。",
      "你可以先選定一個概念，試著用自己的語言寫下說明。接著想像你要教給完全沒有背景的人，刪掉艱深名詞，改用例子、比喻或步驟來描述。",
      "最後回頭檢查卡住的地方，重新閱讀、整理，再說一次。這個循環能幫助你把表面的記憶變成真正理解。"
    ]
  },
  "time-blocking": {
    title: "時間區塊法：讓你一天更有方向與成果",
    category: "時間管理",
    author: "如何學編輯部",
    date: "2024.05.05",
    views: "980",
    tags: ["時間管理", "週計畫", "任務安排"],
    coverClass: "calendar",
    excerpt: "時間區塊法不是把每分鐘塞滿，而是先替重要任務保留專注時段。",
    body: [
      "時間區塊法不是把每分鐘塞滿，而是先替重要任務保留專注時段。當任務有固定的位置，你會更容易開始，也更容易知道今天該完成什麼。",
      "安排時可以先列出本週最重要的三件事，再把閱讀、整理、練習與休息放入不同區塊。每個區塊只放一種主要任務，降低切換成本。",
      "如果當天臨時被打亂，不需要全部重排。只要保留核心區塊，其他任務移到緩衝時間，計畫就能保持彈性。"
    ]
  },
  pomodoro: {
    title: "番茄工作法完整指南：專注25分鐘，改變你的學習效果",
    category: "專注力提升",
    author: "如何學編輯部",
    date: "2024.04.28",
    views: "1.6K",
    tags: ["專注力", "番茄工作法", "學習習慣"],
    coverClass: "tomato",
    excerpt: "番茄工作法用短時間專注搭配休息，降低開始任務的阻力。",
    body: [
      "番茄工作法用短時間專注搭配休息，降低開始任務的阻力。你只需要先承諾 25 分鐘，讓大腦知道這不是一場沒有盡頭的硬仗。",
      "開始前先寫下這一輪要完成的明確目標，例如讀完兩頁、整理一段筆記、完成五題練習。時間到後立刻休息，讓注意力有恢復的空間。",
      "持續幾輪後，你可以回顧哪一類任務最容易分心，逐步調整環境、時間長度與任務大小。"
    ]
  }
};

function getSavedArticles() {
  try {
    return JSON.parse(localStorage.getItem("howToLearnArticles") || "{}");
  } catch {
    return {};
  }
}

function getArticleLibrary() {
  return { ...defaultArticles, ...getSavedArticles() };
}

function getArticleList() {
  return Object.entries(getArticleLibrary()).map(([slug, article]) => ({ slug, ...article }));
}

function renderArticlePage() {
  const title = document.querySelector("[data-article-title]");
  if (!title) return;

  const articles = getArticleLibrary();
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug") || "feynman";
  const article = articles[slug] || articles.feynman;

  document.title = `${article.title}｜如何學 How to Learn`;
  title.textContent = article.title;
  document.querySelector("[data-article-category]").textContent = article.category || "學習方法";
  document.querySelector("[data-article-author]").textContent = article.author || "如何學編輯部";
  document.querySelector("[data-article-date]").textContent = article.date || "";

  const cover = document.querySelector("[data-article-cover]");
  cover.className = `article-cover ${article.coverClass || "people"}`;

  const body = document.querySelector("[data-article-body]");
  body.replaceChildren();
  (article.body || []).forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    body.appendChild(p);
  });

  const tags = document.querySelector("[data-article-tags]");
  tags.replaceChildren();
  (article.tags || []).forEach((tag) => {
    const span = document.createElement("span");
    span.textContent = tag;
    tags.appendChild(span);
  });
}

window.HowToLearnArticles = {
  defaultArticles,
  getArticleLibrary,
  getArticleList
};

renderArticlePage();
