const http = require("node:http");
const { readFile, writeFile, mkdir } = require("node:fs/promises");
const { createReadStream } = require("node:fs");
const path = require("node:path");

const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const articleImagesDir = path.join(rootDir, "images", "articles");
const articlesFile = path.join(dataDir, "articles.json");
const articleViewsFile = path.join(dataDir, "article-views.json");
const port = Number(process.env.PORT || 3000);
const maxBodySize = 8 * 1024 * 1024;

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

function normalizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

async function writeArticles(articles) {
  await ensureJsonFile(articlesFile);
  await writeFile(articlesFile, `${JSON.stringify(articles, null, 2)}\n`, "utf8");
}

async function writeArticleViews(views) {
  await ensureJsonFile(articleViewsFile);
  await writeFile(articleViewsFile, `${JSON.stringify(views, null, 2)}\n`, "utf8");
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

    const views = await readArticleViews();
    views[slug] = Math.max(0, Number(views[slug]) || 0) + 1;
    await writeArticleViews(views);
    sendJson(response, 200, { slug, views: views[slug] });
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
  const filePath = path.normalize(path.join(rootDir, requestPath));

  if (!filePath.startsWith(rootDir)) {
    sendError(response, 403, "Forbidden");
    return;
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
