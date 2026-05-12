const resourceBasePath = "../images/resource/";

const ageLabels = {
  preschool: "學前",
  lower: "國小低年級",
  middle: "國小中年級",
  upper: "國小高年級",
  junior: "國中",
  senior: "高中",
  general: "通用",
};

const subjectLabels = {
  chinese: "國",
  english: "英",
  math: "數",
  social: "社",
  science: "自",
  life: "生活",
};

const practiceAssets = [
  {
    title: "1-10數字表",
    file: "board_one_to_ten.png",
    description: "適合數字認讀、數量概念與基礎加減練習前的暖身。",
    ages: ["preschool", "lower", "general"],
    subject: "math",
  },
  {
    title: "九九乘法表",
    file: "board_9x9.png",
    description: "適合搭配數學練習與九九乘法遊戲使用。",
    ages: ["lower", "middle", "general"],
    subject: "math",
  },
  {
    title: "認識分數",
    file: "board_cut_pizza.png",
    description: "用披薩分割情境理解整體、部分與分數概念。",
    ages: ["middle", "upper", "general"],
    subject: "math",
  },
  {
    title: "世界地圖",
    file: "board_the_world_map.png",
    description: "適合搭配地理、國際議題與跨領域主題探索使用。",
    ages: ["middle", "upper", "junior", "senior", "general"],
    subject: "social",
  },
  {
    title: "台灣地圖",
    file: "board_taiwan_map.png",
    description: "適合搭配台灣地理、縣市認識與在地生活主題探索使用。",
    ages: ["middle", "upper", "junior", "senior", "general"],
    subject: "social",
  },
  {
    title: "元素週期表",
    file: "board_aton.png",
    description: "適合搭配自然科、化學入門與元素概念學習使用。",
    ages: ["junior", "senior", "general"],
    subject: "science",
  },
  {
    title: "注音符號表",
    file: "board_pingyin.png",
    description: "整理注音符號，適合字音字形與國語文基礎練習。",
    ages: ["preschool", "lower"],
    subject: "chinese",
  },
  {
    title: "英文字母表",
    file: "board_alphabet.png",
    description: "整理 A 到 Z 的大小寫字母，適合入門識字與複習。",
    ages: ["preschool", "lower", "general"],
    subject: "english",
  },
  {
    title: "英文練習字卡",
    file: "card_Aa.png",
    description: "搭配英文字母表獨立練習各個英文字卡。",
    ages: ["preschool", "lower", "general"],
    subject: "english",
    downloads: [
      "Aa", "Bb", "Cc", "Dd", "Ee", "Ff", "Gg", "Hh", "Ii", "Jj", "Kk", "Ll", "Mm",
      "Nn", "Oo", "Pp", "Qq", "Ss", "Tt", "Uu", "Vv", "Ww", "Xx", "Yy", "Zz",
    ].map((label) => ({ label, file: `card_${label}.png` })),
  },
  {
    title: "認識時鐘",
    file: "board_clock.png",
    description: "適合練習整點、半點與時間概念，搭配生活情境認識時鐘。",
    ages: ["lower", "middle", "general"],
    subject: "math",
  },
  {
    title: "紅綠燈介紹",
    file: "board_red_n_green.png",
    description: "適合認識交通號誌、行人安全與日常生活規則。",
    ages: ["preschool", "lower", "general"],
    subject: "life",
  },
  {
    title: "消防栓介紹",
    file: "board_forfire.png",
    description: "適合認識公共安全設施、消防安全與生活環境觀察。",
    ages: ["preschool", "lower", "general"],
    subject: "life",
  },
  {
    title: "緊急出口介紹",
    file: "board_exit.png",
    description: "適合認識逃生標誌、緊急出口與公共場所安全路線。",
    ages: ["preschool", "lower", "general"],
    subject: "life",
  },
];

const previewOverlay = document.querySelector("[data-image-preview]");
const previewImage = document.querySelector("[data-preview-output]");
const previewCaption = document.querySelector("[data-preview-caption]");
const assetFilterButtons = document.querySelectorAll("[data-asset-filter]");
const subjectFilterButtons = document.querySelectorAll("[data-subject-filter]");
const assetGrid = document.querySelector("[data-asset-grid]");
const assetEmpty = document.querySelector("[data-asset-empty]");

let selectedAge = "all";
let selectedSubject = "all";

function getAssetPath(file) {
  return `${resourceBasePath}${file}`;
}

function createTagList(className, labels, ariaLabel) {
  const wrapper = document.createElement("div");
  wrapper.className = className;
  wrapper.setAttribute("aria-label", ariaLabel);

  labels.forEach((item) => {
    const span = document.createElement("span");
    if (item.className) span.className = item.className;
    span.textContent = item.label;
    wrapper.appendChild(span);
  });

  return wrapper;
}

function createDownloadLink(file, label = "下載圖檔 →") {
  const link = document.createElement("a");
  link.className = "read-more";
  link.href = getAssetPath(file);
  link.download = "";
  link.textContent = label;
  return link;
}

function createDownloadList(downloads) {
  const wrapper = document.createElement("div");
  wrapper.className = "asset-download-list";
  wrapper.setAttribute("aria-label", "英文練習字卡下載");

  downloads.forEach((download) => {
    const link = document.createElement("a");
    link.href = getAssetPath(download.file);
    link.download = "";
    link.textContent = download.label;
    wrapper.appendChild(link);
  });

  return wrapper;
}

function createAssetCard(asset) {
  const article = document.createElement("article");
  article.className = "asset-card";
  article.dataset.assetAges = asset.ages.join(" ");
  article.dataset.assetSubject = asset.subject;

  const previewButton = document.createElement("button");
  previewButton.className = "asset-preview-button";
  previewButton.type = "button";
  previewButton.dataset.previewImage = getAssetPath(asset.file);
  previewButton.dataset.previewTitle = asset.title;

  const image = document.createElement("img");
  image.src = getAssetPath(asset.file);
  image.alt = `${asset.title}預覽`;
  previewButton.appendChild(image);

  const content = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = asset.title;

  const description = document.createElement("p");
  description.textContent = asset.description;

  const ageTags = createTagList(
    "asset-age-tags",
    asset.ages.map((age) => ({ label: ageLabels[age] })),
    "適用年齡",
  );
  const subjectTags = createTagList(
    "asset-subject-tags",
    [{ label: subjectLabels[asset.subject], className: `subject-${asset.subject}` }],
    "學科分類",
  );

  content.append(heading, description, ageTags, subjectTags);
  if (asset.downloads) {
    content.appendChild(createDownloadList(asset.downloads));
  } else {
    content.appendChild(createDownloadLink(asset.file));
  }

  article.append(previewButton, content);
  return article;
}

function renderAssets() {
  if (!assetGrid) return;
  assetGrid.replaceChildren(...practiceAssets.map(createAssetCard));
}

function closePreview() {
  if (!previewOverlay) return;
  previewOverlay.hidden = true;
  document.body.classList.remove("preview-open");
}

function openPreview(button) {
  if (!previewOverlay || !previewImage || !previewCaption) return;

  const image = button.dataset.previewImage;
  const title = button.dataset.previewTitle || "素材預覽";

  previewImage.src = image;
  previewImage.alt = `${title}放大預覽`;
  previewCaption.textContent = title;
  previewOverlay.hidden = false;
  document.body.classList.add("preview-open");
}

function filterAssets() {
  let visibleCount = 0;
  const assetCards = document.querySelectorAll("[data-asset-ages]");

  assetCards.forEach((card) => {
    const ages = card.dataset.assetAges.split(" ");
    const subject = card.dataset.assetSubject;
    const matchesAge = selectedAge === "all" || ages.includes(selectedAge);
    const matchesSubject = selectedSubject === "all" || subject === selectedSubject;
    const isVisible = matchesAge && matchesSubject;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (assetEmpty) {
    assetEmpty.hidden = visibleCount !== 0;
  }
}

renderAssets();
filterAssets();

assetGrid?.addEventListener("click", (event) => {
  const previewButton = event.target.closest("[data-preview-image]");
  if (previewButton) openPreview(previewButton);
});

previewOverlay?.addEventListener("click", (event) => {
  if (event.target === previewOverlay) closePreview();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePreview();
});

assetFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedAge = button.dataset.assetFilter;
    assetFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    filterAssets();
  });
});

subjectFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSubject = button.dataset.subjectFilter;
    subjectFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    filterAssets();
  });
});
