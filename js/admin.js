const form = document.querySelector("[data-article-form]");
const list = document.querySelector("[data-admin-list]");
const listPage = document.querySelector("[data-admin-list-page]");
const statusText = document.querySelector("[data-save-status]");
const previewLink = document.querySelector("[data-preview-link]");
const newButton = document.querySelector("[data-new-article]");
const deleteButton = document.querySelector("[data-delete-article]");
const coverImageStatus = document.querySelector("[data-cover-image-status]");

let apiArticles = {};
let apiAvailable = false;
let activeSlug = "";
let activeCoverImage = "";
let isCreatingArticle = false;
const articleAdminEmails = ["lan.learning.tw@gmail.com"];

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function withTimeout(promise, milliseconds, fallbackValue) {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = setTimeout(() => resolve(fallbackValue), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function getSupabaseClient() {
  return window.HowToLearnSupabase?.isConfigured ? window.HowToLearnSupabase.client : null;
}

function canUseArticleApi() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

function waitForAuthReady() {
  return new Promise((resolve) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      resolve();
      return;
    }

    const timeout = setTimeout(resolve, 1200);
    const { data } = supabase.auth.onAuthStateChange(() => {
      clearTimeout(timeout);
      data.subscription.unsubscribe();
      resolve();
    });
  });
}

async function getAdminUser() {
  if (!window.HowToLearnAuth) return { role: "admin" };

  await waitForAuthReady();
  const user = await withTimeout(window.HowToLearnAuth.getCurrentUser(), 3000, null);
  if (user?.role === "admin") return user;
  if (articleAdminEmails.includes(String(user?.email || "").trim().toLowerCase())) {
    return { ...user, role: "admin" };
  }

  const supabase = getSupabaseClient();
  if (!supabase) return user;

  let authUser = null;
  try {
    const { data: authData } = await withTimeout(supabase.auth.getUser(), 3000, { data: { user: null } });
    authUser = authData.user;
  } catch {
    return user;
  }
  if (!authUser) return null;

  if (articleAdminEmails.includes(String(authUser.email || "").trim().toLowerCase())) {
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || authUser.email,
      bio: "",
      role: "admin",
      createdAt: authUser.created_at,
      updatedAt: authUser.updated_at,
    };
  }

  return user;
}

async function requireAdminAccess() {
  let user = null;
  try {
    user = await getAdminUser();
  } catch {
    user = null;
  }
  if (user?.role === "admin") return true;

  const main = document.querySelector("main");
  main?.replaceChildren();
  const section = document.createElement("section");
  section.className = "admin-hero";
  section.innerHTML = `
    <p class="section-kicker">Admin Only</p>
    <h1>需要管理員權限</h1>
    <p>請先使用管理員帳號登入，才能管理文章。</p>
    <a class="primary-button" href="login.html">前往登入</a>
  `;
  main?.append(section);
  return false;
}

function mapSupabaseArticle(row) {
  return {
    title: row.title,
    category: row.category,
    author: row.author,
    date: row.published_date || "",
    views: String(row.views || 0),
    coverClass: row.cover_class || "people",
    coverImage: row.cover_image || "",
    tags: row.tags || [],
    excerpt: row.excerpt || "",
    body: row.body || [],
  };
}

function toSupabaseArticle(slug, article, userId = null) {
  return {
    slug,
    title: article.title,
    category: article.category || "學習方法",
    author: article.author || "如何學編輯部",
    published_date: article.date || "",
    cover_class: article.coverClass || "people",
    cover_image: article.coverImage || "",
    tags: article.tags || [],
    excerpt: article.excerpt || "",
    body: article.body || [],
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
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

function getArticleEntries() {
  return Object.entries(getArticles()).sort(([, a], [, b]) => parseArticleDate(b.date) - parseArticleDate(a.date));
}

function parseArticleDate(date) {
  if (!date) return 0;
  const timestamp = Date.parse(String(date).replaceAll(".", "-").replaceAll("/", "-"));
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function canDeleteArticle(slug) {
  return Boolean(loadSavedArticles()[slug] || apiArticles[slug]);
}

function prepareManagedArticle(article) {
  return {
    ...article,
    category: article.category || "學習方法",
    author: article.author || "如何學編輯部",
    date: formatDateForInput(article.date) || article.date || "",
    tags: Array.isArray(article.tags) ? article.tags : [],
    body: Array.isArray(article.body) ? article.body : [],
  };
}

async function loadApiArticles() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from("articles").select("*").order("updated_at", { ascending: false }),
        5000,
        { data: null, error: new Error("Supabase 連線逾時") },
      );
      if (error) throw error;
      apiArticles = Object.fromEntries((data || []).map((row) => [row.slug, mapSupabaseArticle(row)]));
      apiAvailable = true;
      setStatus("已連線 Supabase 文章資料庫");
      return apiArticles;
    } catch (error) {
      apiAvailable = false;
      setStatus(`Supabase 文章讀取失敗：${error.message}`);
      return {};
    }
  }

  if (!canUseArticleApi()) return {};

  try {
    const response = await fetch("/api/articles", { cache: "no-store" });
    if (!response.ok) throw new Error("Article API unavailable");
    apiArticles = await response.json();
    apiAvailable = true;
    setStatus("已連線本機文章 API");
    return apiArticles;
  } catch {
    apiAvailable = false;
    setStatus("無法連線文章 API，暫時只能存到這台瀏覽器");
    return {};
  }
}

async function importDefaultArticlesToApi() {
  const defaultEntries = Object.entries(getDefaultArticles()).filter(([slug]) => !apiArticles[slug]);
  if (!defaultEntries.length) return 0;
  if (!apiAvailable && !getSupabaseClient()) return 0;

  let importedCount = 0;
  setStatus("正在把預設文章同步到文章資料庫...");

  for (const [slug, article] of defaultEntries) {
    try {
      const savedSlug = await saveArticleToApi(slug, prepareManagedArticle(article));
      if (savedSlug) importedCount += 1;
    } catch (error) {
      console.warn(`Default article import skipped: ${slug}`, error);
    }
  }

  if (importedCount > 0) {
    setStatus(`已同步 ${importedCount} 篇預設文章到文章資料庫`);
  }
  return importedCount;
}

async function saveArticleToApi(slug, article) {
  const supabase = getSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("請先登入管理員帳號再儲存文章");

    const { data, error } = await supabase
      .from("articles")
      .upsert(toSupabaseArticle(slug, article, user.id))
      .select("*")
      .single();
    if (error) throw error;
    apiArticles[slug] = mapSupabaseArticle(data);
    apiAvailable = true;
    return slug;
  }

  const response = await fetch("/api/articles", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, article }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "文章儲存失敗");
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
    throw new Error("請上傳圖片檔");
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "png";
    const filePath = `${slug}-${Date.now()}.${extension}`;
    const { error } = await supabase.storage.from("article-covers").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("article-covers").getPublicUrl(filePath);
    return data.publicUrl;
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
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("articles").delete().eq("slug", slug);
    if (error) throw error;
    delete apiArticles[slug];
    return;
  }

  const response = await fetch(`/api/articles/${encodeURIComponent(slug)}`, { method: "DELETE" });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "刪除文章失敗");
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

function formatDateForInput(value) {
  if (!value) return "";
  const normalized = String(value).trim().replace(/[./]/g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getTodayInputDate() {
  const now = new Date();
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function generateSlug(value) {
  const base = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || `article-${Date.now()}`;
}

function getAvailableSlug(value) {
  const base = generateSlug(value);
  const articles = getArticles();
  if (!articles[base] || base === activeSlug) return base;

  let index = 2;
  let slug = `${base}-${index}`;
  while (articles[slug]) {
    index += 1;
    slug = `${base}-${index}`;
  }
  return slug;
}

function updateGeneratedSlug() {
  if (!form || !isCreatingArticle) return;
  form.slug.value = getAvailableSlug(form.title.value);
  updatePreviewLink();
}

function fillForm(slug, article, options = {}) {
  if (!form) return;
  activeSlug = slug;
  activeCoverImage = article.coverImage || "";
  isCreatingArticle = Boolean(options.isNew);
  form.slug.value = slug;
  form.title.value = article.title || "";
  form.category.value = article.category || "";
  form.author.value = article.author || "";
  form.date.value = formatDateForInput(article.date) || (isCreatingArticle ? getTodayInputDate() : "");
  form.coverImageFile.value = "";
  form.tags.value = (article.tags || []).join(", ");
  form.excerpt.value = article.excerpt || "";
  form.body.value = (article.body || []).join("\n\n");
  if (isCreatingArticle) updateGeneratedSlug();
  updatePreviewLink();
  deleteButton.disabled = !slug || !canDeleteArticle(slug);
  coverImageStatus.textContent = activeCoverImage ? `目前封面：${activeCoverImage}` : "尚未選擇封面圖片";
}

function getFormArticle(coverImage = activeCoverImage) {
  return {
    title: form.title.value.trim(),
    category: form.category.value.trim(),
    author: form.author.value.trim() || "如何學編輯部",
    date: form.date.value.trim(),
    coverImage,
    coverClass: "people",
    tags: form.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    excerpt: form.excerpt.value.trim(),
    body: form.body.value
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  };
}

function getPreviewSlug() {
  if (!form) return "";
  const slug = form.slug.value.trim() || getAvailableSlug(form.title.value);
  form.slug.value = slug;
  return slug;
}

function getPreviewUrl(slug = getPreviewSlug()) {
  const params = new URLSearchParams({
    slug: slug || "preview",
    preview: "1",
    previewKey: slug || "preview",
  });
  return `article.html?${params.toString()}`;
}

function updatePreviewLink() {
  if (!previewLink || !form) return;
  const slug = form.slug.value.trim() || (form.title.value.trim() ? getAvailableSlug(form.title.value) : "preview");
  previewLink.href = getPreviewUrl(slug);
}

async function getPreviewCoverImage() {
  const file = form.coverImageFile.files[0];
  if (!file) return activeCoverImage;
  if (!file.type.startsWith("image/")) return activeCoverImage;
  return readFileAsDataUrl(file);
}

async function savePreviewDraft(slug) {
  const coverImage = await getPreviewCoverImage();
  const article = getFormArticle(coverImage);
  if (!article.title) {
    article.title = "未命名文章";
  }
  localStorage.setItem(
    `howToLearnArticlePreview:${slug}`,
    JSON.stringify({
      slug,
      article,
      updatedAt: new Date().toISOString(),
    }),
  );
}

function createArticleListItem(slug, article) {
  const item = document.createElement("article");
  item.className = "admin-article-item";

  const content = document.createElement("div");
  const meta = document.createElement("p");
  meta.className = "admin-article-meta";
  meta.textContent = `${article.category || "學習方法"}｜${article.date || "未設定日期"}｜${article.views || "0"} 次觀看`;

  const title = document.createElement("h2");
  title.textContent = article.title || slug;

  const excerpt = document.createElement("p");
  excerpt.textContent = article.excerpt || article.body?.[0] || "尚未設定摘要。";

  const actions = document.createElement("div");
  actions.className = "admin-article-actions";

  const editLink = document.createElement("a");
  editLink.className = "primary-button small";
  editLink.href = `admin.html?slug=${encodeURIComponent(slug)}`;
  editLink.textContent = "編輯";

  const preview = document.createElement("a");
  preview.className = "secondary-button small";
  preview.href = `article.html?slug=${encodeURIComponent(slug)}&preview=1`;
  preview.target = "_blank";
  preview.rel = "noreferrer";
  preview.textContent = "預覽";

  content.append(meta, title, excerpt);
  actions.append(editLink, preview);
  item.append(content, actions);
  return item;
}

function renderEditorShortcutList() {
  if (!list) return;
  list.replaceChildren();

  getArticleEntries().forEach(([slug, article]) => {
    const link = document.createElement("a");
    link.href = `admin.html?slug=${encodeURIComponent(slug)}`;
    link.textContent = article.title || slug;
    if (slug === activeSlug) link.setAttribute("aria-current", "page");
    list.append(link);
  });
}

function renderListPage() {
  if (!listPage) return;
  listPage.replaceChildren();

  getArticleEntries().forEach(([slug, article]) => {
    listPage.append(createArticleListItem(slug, article));
  });
}

function fillNewArticle() {
  fillForm(
    "",
    {
      title: "",
      category: "學習方法",
      author: "如何學編輯部",
      date: "",
      coverImage: "",
      tags: [],
      coverClass: "people",
      excerpt: "",
      body: [],
    },
    { isNew: true },
  );
  setStatus("正在新增文章");
}

function bindEditorEvents() {
  if (!form) return;

  newButton?.addEventListener("click", () => {
    window.location.href = "admin.html?new=1";
  });

  form.title.addEventListener("input", updateGeneratedSlug);
  form.addEventListener("input", updatePreviewLink);
  form.category.addEventListener("change", updatePreviewLink);

  previewLink?.addEventListener("click", async (event) => {
    event.preventDefault();
    const slug = getPreviewSlug();
    if (!slug && !form.title.value.trim()) {
      setStatus("請先輸入文章標題再預覽");
      return;
    }

    try {
      await savePreviewDraft(slug || "preview");
      window.open(getPreviewUrl(slug || "preview"), "_blank", "noopener");
    } catch (error) {
      setStatus(`預覽建立失敗：${error.message}`);
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const slug = form.slug.value.trim() || getAvailableSlug(form.title.value);
    form.slug.value = slug;

    if (!slug || !form.title.value.trim()) {
      setStatus("請先輸入文章標題");
      return;
    }

    try {
      setStatus("正在儲存文章...");
      let coverImage = activeCoverImage;
      if (form.coverImageFile.files[0]) {
        setStatus("正在上傳封面圖片...");
        coverImage = await uploadCoverImage(slug, form.coverImageFile.files[0]);
      }

      const article = getFormArticle(coverImage);
      const savedSlug = await saveArticleToApi(slug, article);
      deleteArticleFromLocalStorage(savedSlug);
      renderEditorShortcutList();
      fillForm(savedSlug, apiArticles[savedSlug]);
      window.history.replaceState(null, "", `admin.html?slug=${encodeURIComponent(savedSlug)}`);
      setStatus("文章已儲存，前台重新整理後會看到更新");
      window.HowToLearnArticles?.loadServerArticles?.();
    } catch (error) {
      if (getSupabaseClient()) {
        setStatus(`Supabase 儲存失敗：${error.message}。請確認目前帳號是 admin，且已執行 supabase-admin-setup.sql。`);
        return;
      }

      const article = getFormArticle(activeCoverImage);
      saveArticleToLocalStorage(slug, article);
      renderEditorShortcutList();
      fillForm(slug, article);
      setStatus(apiAvailable ? `本機 API 儲存失敗：${error.message}` : "文章暫存到這台瀏覽器；啟動 server 後才能讓其他頁面/裝置看到");
    }
  });

  deleteButton?.addEventListener("click", async () => {
    const slug = activeSlug || form.slug.value.trim();
    if (!slug || !canDeleteArticle(slug)) return;
    if (!window.confirm(`確定要刪除「${getArticles()[slug].title || slug}」嗎？`)) return;

    try {
      if (apiArticles[slug]) {
        await deleteArticleFromApi(slug);
      }
      deleteArticleFromLocalStorage(slug);
      window.location.href = "admin-articles.html";
    } catch (error) {
      setStatus(`刪除失敗：${error.message}`);
    }
  });
}

function loadRequestedArticle() {
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  if (params.has("new")) {
    fillNewArticle();
    return;
  }

  const requestedSlug = params.get("slug");
  const articles = getArticles();
  if (requestedSlug && articles[requestedSlug]) {
    fillForm(requestedSlug, articles[requestedSlug]);
    setStatus("已載入文章，可以開始編輯");
    return;
  }

  const firstEntry = getArticleEntries()[0];
  if (firstEntry) {
    window.history.replaceState(null, "", `admin.html?slug=${encodeURIComponent(firstEntry[0])}`);
    fillForm(firstEntry[0], firstEntry[1]);
    return;
  }

  fillNewArticle();
}

async function initAdmin() {
  if (!(await requireAdminAccess())) return;

  renderListPage();
  renderEditorShortcutList();
  loadRequestedArticle();

  await loadApiArticles();
  try {
    await importDefaultArticlesToApi();
  } catch (error) {
    setStatus(`同步預設文章失敗：${error.message}`);
  }

  renderListPage();
  renderEditorShortcutList();
  loadRequestedArticle();
}

bindEditorEvents();
initAdmin();
