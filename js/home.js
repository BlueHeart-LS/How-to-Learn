const latestArticles = document.querySelector("[data-latest-articles]");

const tagClassByCategory = {
  "學習方法": "blue-tag",
  "時間管理": "green-tag",
  "專注力提升": "purple-tag"
};

function parseArticleDate(date) {
  if (!date) return 0;
  const normalized = String(date).replaceAll(".", "-").replaceAll("/", "-");
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function renderLatestArticles() {
  if (!latestArticles || !window.HowToLearnArticles) return;

  const articles = window.HowToLearnArticles
    .getArticleList()
    .sort((a, b) => parseArticleDate(b.date) - parseArticleDate(a.date))
    .slice(0, 3);

  latestArticles.replaceChildren();

  articles.forEach((article) => {
    const link = document.createElement("a");
    link.className = "latest-article";
    link.href = `pages/article.html?slug=${encodeURIComponent(article.slug)}`;

    const thumb = document.createElement("div");
    if (window.HowToLearnArticleCovers) {
      window.HowToLearnArticleCovers.applyArticleCover(thumb, article, "thumb");
    } else {
      thumb.className = `thumb ${article.coverClass || "people"}`;
    }

    const content = document.createElement("div");

    const tag = document.createElement("span");
    tag.className = `tag ${tagClassByCategory[article.category] || "blue-tag"}`;
    tag.textContent = article.category || "學習方法";

    const title = document.createElement("h3");
    title.textContent = article.title;

    const meta = document.createElement("p");
    meta.textContent = `${article.date || "未設定日期"}　◉ ${article.views || "0"}`;

    content.append(tag, title, meta);
    link.append(thumb, content);
    latestArticles.appendChild(link);
  });
}

renderLatestArticles();
window.addEventListener("howtolearn:articles-ready", renderLatestArticles);
