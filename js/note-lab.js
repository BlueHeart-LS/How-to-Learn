const notes = [
  { text: "費曼學習法：用簡單的話教別人，檢查自己是否真的理解。", category: "concept" },
  { text: "例子：把光合作用講給小學生聽，不能只背專有名詞。", category: "example" },
  { text: "疑問：我是不是能用圖像方式整理這個概念？", category: "question" },
  { text: "下一步：今晚用 10 分鐘重寫今天的課堂摘要。", category: "action" },
  { text: "時間區塊法：先替重要任務保留固定時段。", category: "concept" },
  { text: "例子：週三 19:00 到 19:30 固定複習英文單字。", category: "example" },
  { text: "疑問：哪一種筆記格式最適合整理歷史事件？", category: "question" },
  { text: "下一步：把錯題分成觀念錯、粗心錯、沒讀熟三類。", category: "action" },
];

const noteCards = document.querySelector("[data-note-cards]");
const categories = document.querySelectorAll("[data-category]");
const progress = document.querySelector("[data-note-progress]");
const accuracy = document.querySelector("[data-note-accuracy]");
const feedback = document.querySelector("[data-note-feedback]");
const result = document.querySelector("[data-note-result]");
const summary = document.querySelector("[data-note-summary]");
const restart = document.querySelector("[data-note-restart]");

let remainingNotes = [];
let selectedNoteId = null;
let answered = 0;
let correct = 0;

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function renderStats() {
  progress.textContent = `${answered} / ${notes.length}`;
  accuracy.textContent = answered ? `${Math.round((correct / answered) * 100)}%` : "0%";
}

function renderNotes() {
  noteCards.replaceChildren();

  remainingNotes.forEach((note) => {
    const button = document.createElement("button");
    button.className = note.id === selectedNoteId ? "lab-note-card selected" : "lab-note-card";
    button.type = "button";
    button.textContent = note.text;
    button.addEventListener("click", () => {
      selectedNoteId = note.id;
      feedback.textContent = "選好了，現在點右邊的分類區。";
      renderNotes();
    });
    noteCards.appendChild(button);
  });
}

function finishIfDone() {
  if (answered !== notes.length) return;

  const rate = Math.round((correct / answered) * 100);
  result.hidden = false;
  summary.textContent = `你整理了 ${answered} 張筆記，答對 ${correct} 張，正確率 ${rate}%。整理筆記時，可以先分成概念、例子、疑問與下一步，資訊就比較不會散掉。`;
}

function chooseCategory(category) {
  if (!selectedNoteId) {
    feedback.textContent = "先選一張零散筆記，再放進分類。";
    return;
  }

  const note = remainingNotes.find((item) => item.id === selectedNoteId);
  const isCorrect = note.category === category;

  answered += 1;
  if (isCorrect) {
    correct += 1;
    feedback.textContent = "整理正確，這張筆記找到位置了。";
    feedback.className = "note-lab-feedback correct";
  } else {
    feedback.textContent = "這張放得不太準，但先繼續整理下一張。";
    feedback.className = "note-lab-feedback wrong";
  }

  remainingNotes = remainingNotes.filter((item) => item.id !== selectedNoteId);
  selectedNoteId = null;
  renderStats();
  renderNotes();
  finishIfDone();
}

function startLab() {
  remainingNotes = shuffle(notes).map((note, index) => ({ ...note, id: index + 1 }));
  selectedNoteId = null;
  answered = 0;
  correct = 0;
  result.hidden = true;
  feedback.textContent = "先選一張零散筆記。";
  feedback.className = "note-lab-feedback";
  renderStats();
  renderNotes();
}

categories.forEach((category) => {
  category.addEventListener("click", () => chooseCategory(category.dataset.category));
});

restart?.addEventListener("click", startLab);

if (noteCards) {
  startLab();
}
