const http = require("node:http");
const { readFile, writeFile, mkdir } = require("node:fs/promises");
const { createReadStream } = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const rootDir = path.resolve(__dirname, "..");
const dataDir = process.env.DATA_DIR || path.join(rootDir, "data");
const articleImagesDir = process.env.ARTICLE_IMAGES_DIR || path.join(rootDir, "images", "articles");
const articlesFile = path.join(dataDir, "articles.json");
const articleViewsFile = path.join(dataDir, "article-views.json");
const articleViewEventsFile = path.join(dataDir, "article-view-events.json");
const usersFile = path.join(dataDir, "users.json");
const sessionsFile = path.join(dataDir, "sessions.json");
const port = Number(process.env.PORT || 3000);
const maxBodySize = 8 * 1024 * 1024;
const adminEmails = (process.env.ADMIN_EMAILS || "lan.learning.tw@gmail.com")
  .split(",")
  .map((email) => normalizeEmail(email))
  .filter(Boolean);
const loginAttempts = new Map();
const loginRateLimitWindow = 15 * 60 * 1000;
const maxLoginAttempts = 8;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

function getClientIp(request) {
  return String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "")
    .split(",")[0]
    .trim();
}

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeVisitorId(value) {
  return String(value || "")
    .trim()
    .slice(0, 120)
    .replace(/[^\w.-]/g, "");
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createId() {
  return crypto.randomUUID();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash || "").split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(":")[1];
  if (candidate.length !== hash.length) return false;
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

function getAuthToken(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice(7).trim();
}

function isAdminUser(user) {
  return Boolean(user && (user.role === "admin" || adminEmails.includes(normalizeEmail(user.email))));
}

async function requireAdminUser(request, response) {
  const { user } = await getAuthenticatedUser(request);
  if (!user) {
    sendError(response, 401, "Not authenticated");
    return null;
  }
  if (!isAdminUser(user)) {
    sendError(response, 403, "Admin access required");
    return null;
  }
  return user;
}

function getLoginAttemptKey(request, email) {
  return `${getClientIp(request)}:${normalizeEmail(email)}`;
}

function isLoginRateLimited(request, email) {
  const key = getLoginAttemptKey(request, email);
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || now - attempt.firstAt > loginRateLimitWindow) {
    loginAttempts.set(key, { count: 0, firstAt: now });
    return false;
  }
  return attempt.count >= maxLoginAttempts;
}

function recordFailedLogin(request, email) {
  const key = getLoginAttemptKey(request, email);
  const now = Date.now();
  const attempt = loginAttempts.get(key);
  if (!attempt || now - attempt.firstAt > loginRateLimitWindow) {
    loginAttempts.set(key, { count: 1, firstAt: now });
    return;
  }
  attempt.count += 1;
}

function clearFailedLogins(request, email) {
  loginAttempts.delete(getLoginAttemptKey(request, email));
}

function isForbiddenStaticPath(requestPath, filePath) {
  const normalizedRequestPath = requestPath.replace(/\\/g, "/").toLowerCase();
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/").toLowerCase();
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return true;
  if (relativePath.startsWith(".git/") || relativePath === ".git") return true;
  if (relativePath.startsWith("data/") || relativePath === "data") return true;
  if (relativePath.startsWith("storage/") || relativePath === "storage") return true;
  if (normalizedRequestPath.includes("/../")) return true;
  if ([".sql", ".yaml", ".yml", ".env"].includes(path.extname(filePath).toLowerCase())) return true;
  return false;
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio || "",
    avatar: user.avatar || "den",
    role: user.role || "member",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function normalizeArticle(input) {
  const article = input && typeof input === "object" ? input : {};
  return {
    title: String(article.title || "").trim(),
    category: String(article.category || "學習方法").trim(),
    author: String(article.author || "如何學編輯部").trim(),
    date: String(article.date || "").trim(),
    views: String(article.views || "0").trim(),
    coverClass: String(article.coverClass || "people").trim(),
    coverImage: String(article.coverImage || "").trim(),
    tags: Array.isArray(article.tags)
      ? article.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    excerpt: String(article.excerpt || "").trim(),
    body: Array.isArray(article.body)
      ? article.body.map((paragraph) => String(paragraph).trim()).filter(Boolean)
      : [],
    updatedAt: new Date().toISOString(),
  };
}

function getImageExtension(mimeType, filename) {
  const allowedByMime = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
  };
  if (allowedByMime[mimeType]) return allowedByMime[mimeType];

  const extension = path.extname(String(filename || "")).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(extension) ? extension : "";
}

async function ensureJsonFile(filePath) {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(filePath, "{}\n", "utf8");
  }
}

async function readJsonFile(filePath) {
  await ensureJsonFile(filePath);
  const text = await readFile(filePath, "utf8");
  try {
    const data = JSON.parse(text || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

async function readArticles() {
  return readJsonFile(articlesFile);
}

async function readArticleViews() {
  return readJsonFile(articleViewsFile);
}

async function readArticleViewEvents() {
  return readJsonFile(articleViewEventsFile);
}

async function readUsers() {
  return readJsonFile(usersFile);
}

async function readSessions() {
  return readJsonFile(sessionsFile);
}

async function writeArticles(articles) {
  await ensureJsonFile(articlesFile);
  await writeFile(articlesFile, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
}

async function writeArticleViews(views) {
  await ensureJsonFile(articleViewsFile);
  await writeFile(articleViewsFile, `${JSON.stringify(views, null, 2)}\n`, "utf8");
}

async function writeArticleViewEvents(events) {
  await ensureJsonFile(articleViewEventsFile);
  await writeFile(articleViewEventsFile, `${JSON.stringify(events, null, 2)}\n`, "utf8");
}

async function writeUsers(users) {
  await ensureJsonFile(usersFile);
  await writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

async function writeSessions(sessions) {
  await ensureJsonFile(sessionsFile);
  await writeFile(sessionsFile, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBodySize) {
        reject(new Error("REQUEST_TOO_LARGE"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function parseJsonBody(request) {
  const body = await readRequestBody(request);
  if (!body.trim()) return {};
  return JSON.parse(body);
}

async function handleArticleImageApi(request, response) {
  if (request.method !== "POST") {
    sendError(response, 405, "Method not allowed");
    return;
  }

  if (!(await requireAdminUser(request, response))) return;

  let payload;
  try {
    payload = await parseJsonBody(request);
  } catch (error) {
    sendError(response, error.message === "REQUEST_TOO_LARGE" ? 413 : 400, "Invalid JSON body");
    return;
  }

  const slug = normalizeSlug(payload.slug || "article");
  const extension = getImageExtension(payload.mimeType, payload.filename);
  const base64Data = String(payload.data || "").replace(/^data:[^;]+;base64,/, "");

  if (!extension) {
    sendError(response, 400, "Only PNG, JPG, WEBP, and GIF images are allowed");
    return;
  }

  if (!base64Data) {
    sendError(response, 400, "Image data is required");
    return;
  }

  const buffer = Buffer.from(base64Data, "base64");
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) {
    sendError(response, 400, "Image must be smaller than 5MB");
    return;
  }

  await mkdir(articleImagesDir, { recursive: true });
  const filename = `${slug}-${Date.now()}${extension}`;
  const filePath = path.join(articleImagesDir, filename);
  await writeFile(filePath, buffer);

  sendJson(response, 200, {
    path: `images/articles/${filename}`,
    filename,
  });
}

async function getAuthenticatedUser(request) {
  const token = getAuthToken(request);
  if (!token) return { token: "", user: null };

  const sessions = await readSessions();
  const session = sessions[token];
  if (!session) return { token, user: null };

  if (session.expiresAt && Date.parse(session.expiresAt) < Date.now()) {
    delete sessions[token];
    await writeSessions(sessions);
    return { token, user: null };
  }

  const users = await readUsers();
  return { token, user: users[session.userId] || null };
}

async function handleAuthApi(request, response, url) {
  if (request.method === "POST" && url.pathname === "/api/auth/register") {
    let payload;
    try {
      payload = await parseJsonBody(request);
    } catch {
      sendError(response, 400, "Invalid JSON body");
      return;
    }

    const name = String(payload.name || "").trim();
    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");

    if (!name || !email || !password) {
      sendError(response, 400, "Name, email, and password are required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sendError(response, 400, "Email format is invalid");
      return;
    }

    if (password.length < 6) {
      sendError(response, 400, "Password must be at least 6 characters");
      return;
    }

    const users = await readUsers();
    const existingUser = Object.values(users).find((user) => user.email === email);
    if (existingUser) {
      sendError(response, 409, "Email already registered");
      return;
    }

    const now = new Date().toISOString();
    const user = {
      id: createId(),
      name,
      email,
      passwordHash: hashPassword(password),
      bio: "",
      avatar: "den",
      role: "member",
      createdAt: now,
      updatedAt: now,
    };
    users[user.id] = user;
    await writeUsers(users);

    const token = crypto.randomBytes(32).toString("hex");
    const sessions = await readSessions();
    sessions[token] = {
      userId: user.id,
      createdAt: now,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
    await writeSessions(sessions);

    sendJson(response, 201, { token, user: publicUser(user) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    let payload;
    try {
      payload = await parseJsonBody(request);
    } catch {
      sendError(response, 400, "Invalid JSON body");
      return;
    }

    const email = normalizeEmail(payload.email);
    const password = String(payload.password || "");
    const users = await readUsers();
    const user = Object.values(users).find((item) => item.email === email);

    if (isLoginRateLimited(request, email)) {
      sendError(response, 429, "Too many login attempts. Please try again later.");
      return;
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      recordFailedLogin(request, email);
      sendError(response, 401, "Email or password is incorrect");
      return;
    }

    clearFailedLogins(request, email);
    const now = new Date().toISOString();
    const token = crypto.randomBytes(32).toString("hex");
    const sessions = await readSessions();
    sessions[token] = {
      userId: user.id,
      createdAt: now,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    };
    await writeSessions(sessions);

    sendJson(response, 200, { token, user: publicUser(user) });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/me") {
    const { user } = await getAuthenticatedUser(request);
    if (!user) {
      sendError(response, 401, "Not authenticated");
      return;
    }
    sendJson(response, 200, { user: publicUser(user) });
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/auth/profile") {
    const { user } = await getAuthenticatedUser(request);
    if (!user) {
      sendError(response, 401, "Not authenticated");
      return;
    }

    let payload;
    try {
      payload = await parseJsonBody(request);
    } catch {
      sendError(response, 400, "Invalid JSON body");
      return;
    }

    const users = await readUsers();
    users[user.id] = {
      ...user,
      name: String(payload.name || user.name).trim(),
      bio: String(payload.bio || "").trim(),
      avatar: String(payload.avatar || user.avatar || "den").trim(),
      updatedAt: new Date().toISOString(),
    };
    await writeUsers(users);
    sendJson(response, 200, { user: publicUser(users[user.id]) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = getAuthToken(request);
    if (token) {
      const sessions = await readSessions();
      delete sessions[token];
      await writeSessions(sessions);
    }
    sendJson(response, 200, { ok: true });
    return;
  }

  sendError(response, 405, "Method not allowed");
}

async function handleArticlesApi(request, response, url) {
  const slugFromPath = decodeURIComponent(url.pathname.replace(/^\/api\/articles\/?/, ""));

  if (request.method === "GET" && url.pathname === "/api/articles") {
    const articles = await readArticles();
    const views = await readArticleViews();
    const articlesWithViews = Object.fromEntries(
      Object.entries(articles).map(([slug, article]) => [
        slug,
        { ...article, views: String(views[slug] ?? article.views ?? 0) },
      ]),
    );
    sendJson(response, 200, articlesWithViews);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/article-views") {
    sendJson(response, 200, await readArticleViews());
    return;
  }

  if (request.method === "POST" && slugFromPath.endsWith("/view")) {
    const slug = normalizeSlug(slugFromPath.replace(/\/view$/, ""));
    if (!slug) {
      sendError(response, 400, "Article slug is required");
      return;
    }

    let payload = {};
    try {
      payload = await parseJsonBody(request);
    } catch (error) {
      sendError(response, error.message === "REQUEST_TOO_LARGE" ? 413 : 400, "Invalid JSON body");
      return;
    }

    const visitorId = normalizeVisitorId(payload.visitorId);
    if (!visitorId) {
      sendError(response, 400, "Visitor id is required");
      return;
    }

    const viewedOn = getTodayKey();
    const eventKey = `${slug}:${visitorId}:${viewedOn}`;
    const events = await readArticleViewEvents();
    const views = await readArticleViews();
    let counted = false;
    if (!events[eventKey]) {
      events[eventKey] = {
        slug,
        visitorId,
        viewedOn,
        createdAt: new Date().toISOString(),
      };
      views[slug] = Math.max(0, Number(views[slug]) || 0) + 1;
      counted = true;
      await writeArticleViewEvents(events);
      await writeArticleViews(views);
    }
    sendJson(response, 200, { slug, views: Math.max(0, Number(views[slug]) || 0), counted });
    return;
  }

  if (request.method === "GET" && slugFromPath) {
    const articles = await readArticles();
    const article = articles[slugFromPath];
    if (!article) {
      sendError(response, 404, "Article not found");
      return;
    }
    const views = await readArticleViews();
    sendJson(response, 200, { slug: slugFromPath, ...article, views: String(views[slugFromPath] ?? article.views ?? 0) });
    return;
  }

  if ((request.method === "POST" && url.pathname === "/api/articles") || (request.method === "PUT" && slugFromPath)) {
    if (!(await requireAdminUser(request, response))) return;

    let payload;
    try {
      payload = await parseJsonBody(request);
    } catch (error) {
      sendError(response, error.message === "REQUEST_TOO_LARGE" ? 413 : 400, "Invalid JSON body");
      return;
    }

    const slug = normalizeSlug(slugFromPath || payload.slug);
    if (!slug) {
      sendError(response, 400, "Article slug is required");
      return;
    }

    const article = normalizeArticle(payload.article || payload);
    if (!article.title) {
      sendError(response, 400, "Article title is required");
      return;
    }

    const articles = await readArticles();
    const views = await readArticleViews();
    article.views = String(views[slug] ?? articles[slug]?.views ?? 0);
    articles[slug] = article;
    await writeArticles(articles);
    sendJson(response, 200, { slug, article });
    return;
  }

  if (request.method === "DELETE" && slugFromPath) {
    if (!(await requireAdminUser(request, response))) return;

    const articles = await readArticles();
    if (!articles[slugFromPath]) {
      sendError(response, 404, "Article not found");
      return;
    }
    delete articles[slugFromPath];
    await writeArticles(articles);
    sendJson(response, 200, { ok: true });
    return;
  }

  sendError(response, 405, "Method not allowed");
}

function serveStaticFile(request, response, url) {
  const requestPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  let filePath = path.normalize(path.join(rootDir, requestPath));

  if (isForbiddenStaticPath(requestPath, filePath)) {
    sendError(response, 403, "Forbidden");
    return;
  }

  if (requestPath.startsWith("/images/articles/")) {
    const imageName = path.basename(requestPath);
    filePath = path.join(articleImagesDir, imageName);
  }

  const extension = path.extname(filePath).toLowerCase();
  const stream = createReadStream(filePath);
  stream.on("open", () => {
    response.writeHead(200, { "content-type": mimeTypes[extension] || "application/octet-stream" });
    stream.pipe(response);
  });
  stream.on("error", () => {
    if (!response.headersSent) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    }
    response.end("Not found");
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/auth/")) {
      await handleAuthApi(request, response, url);
      return;
    }

    if (url.pathname === "/api/article-images") {
      await handleArticleImageApi(request, response);
      return;
    }

    if (url.pathname === "/api/articles" || url.pathname === "/api/article-views" || url.pathname.startsWith("/api/articles/")) {
      await handleArticlesApi(request, response, url);
      return;
    }

    serveStaticFile(request, response, url);
  } catch (error) {
    console.error(error);
    sendError(response, 500, "Server error");
  }
});

server.listen(port, () => {
  console.log(`How to Learn server running at http://localhost:${port}`);
});
