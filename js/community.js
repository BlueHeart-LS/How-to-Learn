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
  feed.innerHTML = posts.map((post) => `
    <article class="community-post" data-post-id="${post.id}">
      <div class="post-header">
        <div>
          <h2>${post.title}</h2>
          <p>${post.author} · ${post.date}</p>
        </div>
      </div>
      <p class="post-content">${post.content}</p>
      <div class="comment-list">
        ${(post.comments || []).map((comment) => `
          <div class="comment-item">
            <strong>${comment.author}</strong>
            <p>${comment.content}</p>
          </div>
        `).join("")}
      </div>
      <form class="comment-form" data-comment-form>
        <input name="author" placeholder="你的名字" required />
        <input name="content" placeholder="留下回覆" required />
        <button type="submit">留言</button>
      </form>
    </article>
  `).join("");
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
