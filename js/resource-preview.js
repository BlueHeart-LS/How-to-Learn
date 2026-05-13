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
  chinese: "國文",
  english: "英文",
  math: "數學",
  social: "社會",
  science: "自然",
  life: "生活",
};

const practiceAssets = [
  {
    title: "1-10 數字表",
    file: "board_one_to_ten.png",
    description: "整理 1 到 10 的數字與數量概念，適合數字認讀與基礎數感練習。",
    ages: ["preschool", "lower", "general"],
    subject: "math",
  },
  {
    title: "九九乘法表",
    file: "board_9x9.png",
    description: "適合搭配數學練習與九九乘法遊戲使用，幫助熟悉乘法關係。",
    ages: ["lower", "middle", "general"],
    subject: "math",
  },
  {
    title: "認識分數",
    file: "board_cut_pizza.png",
    description: "用披薩切分圖像理解分數，適合建立等分與分數概念。",
    ages: ["middle", "upper", "general"],
    subject: "math",
  },
  {
    title: "世界地圖",
    file: "board_the_world_map.png",
    description: "認識世界地理位置與大洲分布，適合社會科與跨域探索。",
    ages: ["middle", "upper", "junior", "senior", "general"],
    subject: "social",
  },
  {
    title: "台灣地圖",
    file: "board_taiwan_map.png",
    description: "認識台灣地理位置、縣市與生活環境，適合社會科學習使用。",
    ages: ["middle", "upper", "junior", "senior", "general"],
    subject: "social",
  },
  {
    title: "元素週期表",
    file: "board_aton.png",
    description: "整理元素週期表，適合自然科、化學入門與元素概念學習使用。",
    ages: ["junior", "senior", "general"],
    subject: "science",
  },
  {
    title: "注音符號表",
    file: "board_pingyin.png",
    description: "整理注音符號，適合注音認讀、拼音練習與國語文入門。",
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
    description: "預覽 Aa 字卡，並提供 A 到 Z 共 26 張英文字母練習字卡下載。",
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
    description: "練習認識時鐘、整點與時間概念，適合生活數學與時間閱讀。",
    ages: ["lower", "middle", "general"],
    subject: "math",
  },
  {
    title: "紅綠燈介紹",
    file: "board_red_n_green.png",
    description: "認識交通號誌與安全過馬路概念，適合生活課程與安全教育。",
    ages: ["preschool", "lower", "general"],
    subject: "life",
  },
  {
    title: "消防栓介紹",
    file: "board_forfire.png",
    description: "認識消防栓、消防安全與公共設施，適合生活課程與安全教育。",
    ages: ["preschool", "lower", "general"],
    subject: "life",
  },
  {
    title: "緊急出口介紹",
    file: "board_exit.png",
    description: "認識緊急出口標誌與逃生方向，適合生活課程與防災教育。",
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

function createDownloadLink(file, label = "領取素材") {
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
  wrapper.setAttribute("aria-label", "英文字母練習字卡下載");

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
  image.loading = "lazy";
  image.decoding = "async";
  previewButton.appendChild(image);

  const content = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = asset.title;

  const description = document.createElement("p");
  description.textContent = asset.description;

  const ageTags = createTagList(
    "asset-age-tags",
    asset.ages.map((age) => ({ label: ageLabels[age] })),
    "推薦年齡",
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
