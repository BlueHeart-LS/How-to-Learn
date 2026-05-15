const form = document.querySelector("[data-article-form]");
const list = document.querySelector("[data-admin-list]");
const statusText = document.querySelector("[data-save-status]");
const previewLink = document.querySelector("[data-preview-link]");
const newButton = document.querySelector("[data-new-article]");
const deleteButton = document.querySelector("[data-delete-article]");
const coverImageStatus = document.querySelector("[data-cover-image-status]");

let apiArticles = {};
let apiAvailable = false;
let activeSlug = "";
let activeCoverImage = "";

function canUseArticleApi() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

function loadSavedArticles() {
  try {
    return JSON.parse(localStorage.getItem("howToLearnArticles") || "{}");
  } catch {
    return {};
  }
}

function writeSavedArticles(articles) {
  localStorage.setItem("howToLearnArticles", JSON.stringify(articles));
}

function getDefaultArticles() {
  return window.HowToLearnArticles?.defaultArticles || {};
}

function getArticles() {
  return { ...getDefaultArticles(), ...loadSavedArticles(), ...apiArticles };
}

function canDeleteArticle(slug) {
  return Boolean(loadSavedArticles()[slug] || apiArticles[slug]);
}

async function loadApiArticles() {
  if (!canUseArticleApi()) return {};

  try {
    const response = await fetch("/api/articles", { cache: "no-store" });
    if (!response.ok) throw new Error("Article API unavailable");
    apiArticles = await response.json();
    apiAvailable = true;
    statusText.textContent = "已連接後端文章系統";
    return apiArticles;
  } catch {
    apiAvailable = false;
    statusText.textContent = "未連接後端，暫時使用 localStorage 模式";
    return {};
  }
}

async function saveArticleToApi(slug, article) {
  const response = await fetch("/api/articles", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, article }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "儲存失敗");
  }

  apiAvailable = true;
  apiArticles[payload.slug] = payload.article;
  return payload.slug;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function uploadCoverImage(slug, file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) {
    throw new Error("封面必須是圖片檔");
  }

  const data = await readFileAsDataUrl(file);
  const response = await fetch("/api/article-images", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      slug,
      filename: file.name,
      mimeType: file.type,
      data,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "封面圖片上傳失敗");
  }
  return payload.path;
}

async function deleteArticleFromApi(slug) {
  const response = await fetch(`/api/articles/${encodeURIComponent(slug)}`, { method: "DELETE" });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "刪除失敗");
  }
  delete apiArticles[slug];
}

function saveArticleToLocalStorage(slug, article) {
  const saved = loadSavedArticles();
  saved[slug] = article;
  writeSavedArticles(saved);
}

function deleteArticleFromLocalStorage(slug) {
  const saved = loadSavedArticles();
  delete saved[slug];
  writeSavedArticles(saved);
}

function fillForm(slug, article) {
  activeSlug = slug;
  activeCoverImage = article.coverImage || "";
  form.slug.value = slug;
  form.title.value = article.title || "";
  form.category.value = article.category || "";
  form.author.value = article.author || "";
  form.date.value = article.date || "";
  form.coverImageFile.value = "";
  form.tags.value = (article.tags || []).join(", ");
  form.excerpt.value = article.excerpt || "";
  form.body.value = (article.body || []).join("\n\n");
  previewLink.href = `article.html?slug=${encodeURIComponent(slug)}`;
  deleteButton.disabled = !slug || !canDeleteArticle(slug);
  coverImageStatus.textContent = activeCoverImage ? `目前封面：${activeCoverImage}` : "尚未選擇封面圖片";
}

function getFormArticle(coverImage = activeCoverImage) {
  return {
    title: form.title.value.trim(),
    category: form.category.value.trim(),
    author: form.author.value.trim(),
    date: form.date.value.trim(),
    coverImage,
    coverClass: "people",
    tags: form.tags.value.split(",").map((tag) => tag.trim()).filter(Boolean),
    excerpt: form.excerpt.value.trim(),
    body: form.body.value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
  };
}

function renderList() {
  list.replaceChildren();

  Object.entries(getArticles()).forEach(([slug, article]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.editSlug = slug;
    button.textContent = article.title || slug;
    list.append(button);
  });
}

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-slug]");
  if (!button) return;

  const slug = button.dataset.editSlug;
  fillForm(slug, getArticles()[slug]);
  statusText.textContent = "已載入文章，可編輯後儲存";
});

newButton.addEventListener("click", () => {
  fillForm("new-article", {
    title: "",
    category: "學習方法",
    author: "如何學編輯部",
    date: "",
    coverImage: "",
    tags: [],
    coverClass: "people",
    excerpt: "",
    body: [],
  });
  statusText.textContent = "正在建立新文章";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const slug = form.slug.value.trim();

  if (!slug || !form.title.value.trim()) {
    statusText.textContent = "文章代號與標題必填";
    return;
  }

  try {
    statusText.textContent = "正在儲存文章";
    let coverImage = activeCoverImage;
    if (form.coverImageFile.files[0]) {
      statusText.textContent = "正在上傳封面圖片";
      coverImage = await uploadCoverImage(slug, form.coverImageFile.files[0]);
    }

    const article = getFormArticle(coverImage);
    const savedSlug = await saveArticleToApi(slug, article);
    renderList();
    fillForm(savedSlug, apiArticles[savedSlug]);
    statusText.textContent = "已儲存到後端文章資料庫";
  } catch (error) {
    const article = getFormArticle(activeCoverImage);
    saveArticleToLocalStorage(slug, article);
    renderList();
    fillForm(slug, article);
    statusText.textContent = apiAvailable ? `後端儲存失敗：${error.message}` : "後端未啟動，已暫存到這台瀏覽器";
  }
});

deleteButton.addEventListener("click", async () => {
  const slug = activeSlug || form.slug.value.trim();
  if (!slug || !canDeleteArticle(slug)) return;
  if (!window.confirm(`確定要刪除「${getArticles()[slug].title || slug}」嗎？`)) return;

  try {
    if (apiArticles[slug]) {
      await deleteArticleFromApi(slug);
    }
    deleteArticleFromLocalStorage(slug);
    renderList();
    const fallbackEntry = Object.entries(getArticles())[0];
    if (fallbackEntry) {
      fillForm(fallbackEntry[0], fallbackEntry[1]);
    }
    statusText.textContent = "文章已刪除";
  } catch (error) {
    statusText.textContent = `刪除失敗：${error.message}`;
  }
});

async function initAdmin() {
  renderList();
  await loadApiArticles();
  renderList();

  const firstEntry = Object.entries(getArticles())[0];
  if (firstEntry) {
    fillForm(firstEntry[0], firstEntry[1]);
  }
}

initAdmin();
