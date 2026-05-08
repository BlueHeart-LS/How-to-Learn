const blogList = document.querySelector("[data-blog-list]");
const blogSidebar = document.querySelector("[data-blog-sidebar]");

const tagClassByCategory = {
  "學習方法": "blue-tag",
  "時間管理": "green-tag",
  "專注力提升": "purple-tag"
};

function renderSidebar(articles) {
  if (!blogSidebar) return;
  const categories = [...new Set(articles.map((article) => article.category || "學習方法"))];
  blogSidebar.replaceChildren();
  categories.forEach((category) => {
    const firstArticle = articles.find((article) => article.category === category);
    const link = document.createElement("a");
    link.href = `#${firstArticle.slug}`;
    link.textContent = category;
    blogSidebar.appendChild(link);
  });
}

function renderBlogList() {
  if (!blogList || !window.HowToLearnArticles) return;

  const articles = window.HowToLearnArticles.getArticleList();
  renderSidebar(articles);
  blogList.replaceChildren();

  articles.forEach((article) => {
    const post = document.createElement("article");
    post.className = "blog-post";
    post.id = article.slug;

    const thumb = document.createElement("div");
    thumb.className = `blog-post-thumb ${article.coverClass || "people"}`;

    const content = document.createElement("div");
    content.className = "blog-post-content";

    const tag = document.createElement("span");
    tag.className = `tag ${tagClassByCategory[article.category] || "blue-tag"}`;
    tag.textContent = article.category || "學習方法";

    const title = document.createElement("h2");
    title.textContent = article.title;

    const meta = document.createElement("p");
    meta.className = "post-meta";
    meta.textContent = `${article.date || "未設定日期"}　◉ ${article.views || "0"}`;

    const excerpt = document.createElement("p");
    excerpt.textContent = article.excerpt || article.body?.[0] || "這篇文章尚未設定摘要。";

    const link = document.createElement("a");
    link.className = "read-more";
    link.href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    link.textContent = "閱讀文章 →";

    content.append(tag, title, meta, excerpt, link);
    post.append(thumb, content);
    blogList.appendChild(post);
  });
}

renderBlogList();
