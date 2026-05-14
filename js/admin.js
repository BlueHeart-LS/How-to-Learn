const seedArticles = {
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
      "費曼學習法的核心，是把你正在學的內容說成簡單、清楚、別人聽得懂的話。",
      "你可以先選定一個概念，試著用自己的語言寫下說明。"
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
    body: ["時間區塊法不是把每分鐘塞滿，而是先替重要任務保留專注時段。"]
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
    body: ["番茄工作法用短時間專注搭配休息，降低開始任務的阻力。"]
  }
};

const form = document.querySelector("[data-article-form]");
const list = document.querySelector("[data-admin-list]");
const statusText = document.querySelector("[data-save-status]");
const previewLink = document.querySelector("[data-preview-link]");
const newButton = document.querySelector("[data-new-article]");

function loadSavedArticles() {
  try {
    return JSON.parse(localStorage.getItem("howToLearnArticles") || "{}");
  } catch (error) {
    return {};
  }
}

function getArticles() {
  return { ...seedArticles, ...loadSavedArticles() };
}

function saveArticle(slug, article) {
  const saved = loadSavedArticles();
  saved[slug] = article;
  localStorage.setItem("howToLearnArticles", JSON.stringify(saved));
}

function fillForm(slug, article) {
  form.slug.value = slug;
  form.title.value = article.title || "";
  form.category.value = article.category || "";
  form.author.value = article.author || "";
  form.date.value = article.date || "";
  form.views.value = article.views || "";
  form.coverClass.value = article.coverClass || "people";
  form.tags.value = (article.tags || []).join(", ");
  form.excerpt.value = article.excerpt || "";
  form.body.value = (article.body || []).join("\n\n");
  previewLink.href = `article.html?slug=${encodeURIComponent(slug)}`;
  statusText.textContent = "已載入文章，可編輯後儲存";
}

function renderList() {
  list.replaceChildren();
  Object.entries(getArticles()).forEach(([slug, article]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.editSlug = slug;
    button.textContent = article.title;
    list.append(button);
  });
}

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-slug]");
  if (!button) return;
  const slug = button.dataset.editSlug;
  fillForm(slug, getArticles()[slug]);
});

newButton.addEventListener("click", () => {
  fillForm("new-article", {
    title: "",
    category: "學習方法",
    author: "如何學編輯部",
    date: "",
    views: "",
    tags: [],
    coverClass: "people",
    excerpt: "",
    body: []
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const slug = form.slug.value.trim();
  const article = {
    title: form.title.value.trim(),
    category: form.category.value.trim(),
    author: form.author.value.trim(),
    date: form.date.value.trim(),
    views: form.views.value.trim(),
    coverClass: form.coverClass.value,
    tags: form.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean),
    excerpt: form.excerpt.value.trim(),
    body: form.body.value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean)
  };
  saveArticle(slug, article);
  renderList();
  previewLink.href = `article.html?slug=${encodeURIComponent(slug)}`;
  statusText.textContent = "已儲存到這台瀏覽器的 localStorage";
});

renderList();
fillForm("feynman", getArticles().feynman);
