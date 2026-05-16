const postForm = document.querySelector("[data-post-form]");
const feed = document.querySelector("[data-community-feed]");

const defaultPosts = [
  {
    id: "post-1",
    author: "小雨",
    title: "今天完成第一輪番茄鐘",
    content: "原本以為 25 分鐘很短，實際做完才發現只要任務夠明確，真的能進入狀態。",
    date: "2026/05/08",
    comments: [
      { author: "阿哲", content: "我也想試試看，感覺很適合拿來讀英文。" }
    ]
  },
  {
    id: "post-2",
    author: "Mina",
    title: "大家都怎麼整理閱讀筆記？",
    content: "我常常讀完文章但不知道怎麼留下重點，想找比較不花時間的方法。",
    date: "2026/05/07",
    comments: [
      { author: "如何學編輯部", content: "可以先試試每篇只留下三個重點和一個問題。" }
    ]
  }
];

function loadPosts() {
  return JSON.parse(localStorage.getItem("howToLearnCommunityPosts") || "null") || defaultPosts;
}

function savePosts(posts) {
  localStorage.setItem("howToLearnCommunityPosts", JSON.stringify(posts));
}

function today() {
  return new Date().toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function renderPosts() {
  const posts = loadPosts();
  feed.replaceChildren();

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "community-post";
    article.dataset.postId = post.id;

    const header = document.createElement("div");
    header.className = "post-header";
    const headerContent = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = post.title;
    const meta = document.createElement("p");
    meta.textContent = `${post.author} · ${post.date}`;
    headerContent.append(title, meta);
    header.append(headerContent);

    const content = document.createElement("p");
    content.className = "post-content";
    content.textContent = post.content;

    const commentList = document.createElement("div");
    commentList.className = "comment-list";
    (post.comments || []).forEach((comment) => {
      const commentItem = document.createElement("div");
      commentItem.className = "comment-item";
      const author = document.createElement("strong");
      author.textContent = comment.author;
      const commentContent = document.createElement("p");
      commentContent.textContent = comment.content;
      commentItem.append(author, commentContent);
      commentList.append(commentItem);
    });

    const form = document.createElement("form");
    form.className = "comment-form";
    form.dataset.commentForm = "";
    const authorInput = document.createElement("input");
    authorInput.name = "author";
    authorInput.placeholder = "你的名字";
    authorInput.required = true;
    const contentInput = document.createElement("input");
    contentInput.name = "content";
    contentInput.placeholder = "留下回覆";
    contentInput.required = true;
    const submitButton = document.createElement("button");
    submitButton.type = "submit";
    submitButton.textContent = "留言";
    form.append(authorInput, contentInput, submitButton);

    article.append(header, content, commentList, form);
    feed.append(article);
  });
}

postForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(postForm);
  const posts = loadPosts();
  posts.unshift({
    id: `post-${Date.now()}`,
    author: formData.get("author").trim(),
    title: formData.get("title").trim(),
    content: formData.get("content").trim(),
    date: today(),
    comments: []
  });
  savePosts(posts);
  postForm.reset();
  renderPosts();
});

feed.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-comment-form]");
  if (!form) return;
  event.preventDefault();
  const postCard = form.closest("[data-post-id]");
  const posts = loadPosts();
  const post = posts.find((item) => item.id === postCard.dataset.postId);
  if (!post) return;
  const formData = new FormData(form);
  post.comments = post.comments || [];
  post.comments.push({
    author: formData.get("author").trim(),
    content: formData.get("content").trim()
  });
  savePosts(posts);
  renderPosts();
});

renderPosts();
