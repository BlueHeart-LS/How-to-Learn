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
const adminEmails = ["lan.learning.tw@gmail.com"];

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
  let user = await window.HowToLearnAuth.getCurrentUser();
  if (user?.role === "admin") return user;

  const supabase = getSupabaseClient();
  if (!supabase) return user;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;
  if (adminEmails.includes(authData.user.email)) {
    return {
      id: authData.user.id,
      email: authData.user.email,
      name: authData.user.email,
      bio: "",
      role: "admin",
      createdAt: authData.user.created_at,
      updatedAt: authData.user.updated_at,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,name,bio,role,created_at,updated_at")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!profile) return user;
  return {
    id: authData.user.id,
    email: authData.user.email,
    name: profile.name,
    bio: profile.bio,
    role: profile.role,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

async function requireAdminAccess() {
  const user = await getAdminUser();
  if (user?.role === "admin") return true;

  document.querySelector("main")?.replaceChildren();
  const main = document.querySelector("main");
  const section = document.createElement("section");
  section.className = "admin-hero";
  section.innerHTML = `
    <p class="section-kicker">Admin Only</p>
    <h1>需要管理員權限</h1>
    <p>請使用管理員帳號登入後再進入文章後台。</p>
    <a class="primary-button" href="login.html">前往登入</a>
  `;
  main?.append(section);
  return false;
}

function canUseArticleApi() {
  return window.location.protocol === "http:" || window.location.protocol === "https:";
}

function getSupabaseClient() {
  return window.HowToLearnSupabase?.isConfigured ? window.HowToLearnSupabase.client : null;
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

function canDeleteArticle(slug) {
  return Boolean(loadSavedArticles()[slug] || apiArticles[slug]);
}

async function loadApiArticles() {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("articles").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      apiArticles = Object.fromEntries((data || []).map((row) => [row.slug, mapSupabaseArticle(row)]));
      apiAvailable = true;
      statusText.textContent = "已連接 Supabase 文章資料庫";
      return apiArticles;
    } catch {
      apiAvailable = false;
      statusText.textContent = "Supabase 尚未連線，暫時使用 localStorage 模式";
      return {};
    }
  }

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
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("請先登入會員再儲存文章");
    const { data, error } = await supabase
      .from("articles")
      .upsert(toSupabaseArticle(slug, article, user.id))
      .select("*")
      .single();
    if (error) throw error;
    apiArticles[slug] = mapSupabaseArticle(data);
    return slug;
  }

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
    if (getSupabaseClient()) {
      statusText.textContent = `Supabase 儲存失敗：${error.message}`;
      return;
    }
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
  if (!(await requireAdminAccess())) return;
  renderList();
  await loadApiArticles();
  renderList();

  const firstEntry = Object.entries(getArticles())[0];
  if (firstEntry) {
    fillForm(firstEntry[0], firstEntry[1]);
  }
}

initAdmin();
