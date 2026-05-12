const topics = [
  {
    title: "AI 科技",
    summary: "認識人工智慧如何讓電腦學習、判斷、生成內容，也思考它如何改變未來工作與生活。",
    resources: [
      { label: "五分鐘快速入門 AI 人工智慧", url: "https://www.youtube.com/watch?v=c1PcYmmlqgg" },
      { label: "人工智慧分級與歷史", url: "https://www.youtube.com/watch?v=7p9X3uiV8CA" },
    ],
  },
  {
    title: "3D 列印",
    summary: "從數位模型到實體物件，了解設計、切片、列印材料與製造流程如何串起來。",
    resources: [
      { label: "3D 列印體驗課程：運作原理篇", url: "https://youtu.be/vZI-dv2r77Q" },
      { label: "流言追追追：3D 列印無所不印", url: "https://youtu.be/uUcLF0DeImo" },
    ],
  },
  {
    title: "金融交易",
    summary: "先從利息、風險、股票與債券的基本概念開始，理解市場不是賭運氣，而是資訊與風險管理。",
    resources: [
      { label: "新手 10 分鐘學會股票入門", url: "https://www.nstock.tw/author/article?id=223" },
      { label: "股票入門影片與新手資源", url: "https://linkby.tw/dailyinvest/" },
    ],
  },
  {
    title: "氣候科學",
    summary: "用觀測資料認識地球變暖、海平面、冰層與極端氣候，看看科學家如何理解全球變化。",
    resources: [
      { label: "全球氣候變遷", url: "https://www.youtube.com/watch?v=b3rLORG7BUc" },
      { label: "氣候變化如何加劇貧富懸殊", url: "https://www.youtube.com/watch?v=T9GNezKjvs0" },
    ],
  },
  {
    title: "再生能源",
    summary: "從太陽能、風力、水力到地熱，探索能源如何轉型，也理解能源選擇和社會生活的關係。",
    resources: [
      { label: "認識再生能源", url: "https://www.youtube.com/watch?v=dIMwxr0Tfxg" },
      { label: "再生能源資訊網影片頁", url: "https://www.re.org.tw/media/more.aspx?cid=205&id=420" },
    ],
  },
  {
    title: "太空探索",
    summary: "從火箭、衛星到行星任務，理解人類如何離開地球觀察宇宙，也如何反過來認識地球。",
    resources: [
      { label: "NASA 洞察號登陸火星", url: "https://www.youtube.com/watch?v=L03eM7GQ-uo" },
      { label: "太空探索簡史", url: "https://www.bilibili.com/video/BV1AW4113755/" },
    ],
  },
  {
    title: "哲學思辨",
    summary: "從哲學家的問題開始，練習追問什麼是真實、自由、知識與好的生活。",
    resources: [
      { label: "哲人身影：康德", url: "https://philomedium.com/video/83362" },
      { label: "哲學短視頻與生活哲學", url: "https://nicksir.net/Youtube/" },
    ],
  },
  {
    title: "藝術史",
    summary: "從圖像、建築與作品風格看見不同時代的人如何理解美、權力、信仰與生活。",
    resources: [
      { label: "藝術史速覽系列", url: "https://www.bilibili.com/video/BV1jT4y157Um/" },
      { label: "Smarthistory 藝術史影片", url: "https://www.youtube.com/user/smarthistoryvideos" },
    ],
  },
  {
    title: "社會學",
    summary: "學習用社會學的想像力觀察日常生活，理解制度、階級、文化與人際關係如何影響我們。",
    resources: [
      { label: "社會學入門：社會學的想像力", url: "https://www.bilibili.com/video/BV1Cy4y1378b/" },
      { label: "紐約大學社會學入門第一課", url: "https://www.bilibili.com/video/BV1z1CzYoEfz/" },
    ],
  },
  {
    title: "心理學",
    summary: "從記憶、情緒、人格與行為開始，理解人如何思考、感受與做決定。",
    resources: [
      { label: "心理學短視頻", url: "https://nicksir.net/Youtube/" },
      { label: "心理學入門：弗洛伊德", url: "https://daydaynews.cc/video/3757496.html" },
    ],
  },
  {
    title: "語言學",
    summary: "把語言當成可以研究的系統，從聲音、詞彙、句子與意義理解人類溝通。",
    resources: [
      { label: "語言學作為一門科學", url: "https://tw.voicetube.com/videos/40316/14921609" },
      { label: "語言學入門課程", url: "https://www.bilibili.com/video/BV16G1cYXEci/" },
    ],
  },
  {
    title: "歷史與文明",
    summary: "從文明、制度與思想的變化，看見人類社會如何累積經驗，也如何不斷重新選擇。",
    resources: [
      { label: "兩千年中國史與儒家", url: "https://youtube.com/watch?v=ylWORyToTo4" },
      { label: "中文文化與歷史學習影片", url: "https://www.lingoinn.com/learning-videos/" },
    ],
  },
  {
    title: "人體解剖生理",
    summary: "從身體系統、器官與細胞開始，理解人體如何維持呼吸、循環、消化與感覺。",
    resources: [
      { label: "解剖與生理簡介", url: "https://www.bilibili.com/video/BV17x411A7cK/" },
      { label: "解剖和生理基礎合集", url: "https://www.bilibili.com/video/BV14S4y1677R/" },
    ],
  },
  {
    title: "公共衛生",
    summary: "不只看個人健康，也看社區、政策、環境與疾病預防如何影響每個人的生活。",
    resources: [
      { label: "什麼是公共衛生", url: "https://www.bilibili.com/video/av984257503/" },
      { label: "健康九九衛教資源", url: "https://health99.hpa.gov.tw/" },
    ],
  },
  {
    title: "急救與 CPR",
    summary: "認識緊急狀況下如何求救、判斷意識與呼吸，以及 CPR 和 AED 的基本概念。",
    resources: [
      { label: "心肺復甦術 CPR 怎麼做", url: "https://www.youtube.com/watch?v=rHuz1KlYloo" },
      { label: "SAFE STEPS First Aid：CPR", url: "https://www.youtube.com/watch?v=KmvTxR58ZB0" },
    ],
  },
  {
    title: "營養與健康飲食",
    summary: "從我的餐盤、均衡飲食與食物選擇開始，理解吃什麼如何影響能量、成長與健康。",
    resources: [
      { label: "我的餐盤均衡飲食：兒童篇", url: "https://health99.hpa.gov.tw/material/6040" },
      { label: "健康飲食：台灣中文動畫", url: "https://www.youtube.com/watch?v=vhPtTAXwcIs" },
    ],
  },
  {
    title: "機械工程",
    summary: "從力、熱、流體、材料與製造開始，理解機器、交通工具與生產設備如何被設計出來。",
    resources: [
      { label: "機械工程學系介紹", url: "https://www.video.nchu.edu.tw/media/91" },
      { label: "機械工程入門：材料與塑膠", url: "https://www.bilibili.com/video/BV1g341187o1/" },
    ],
  },
  {
    title: "土木工程",
    summary: "認識橋梁、道路、建築、水利與城市基礎設施，了解工程如何支撐日常生活。",
    resources: [
      { label: "Civil Engineering 入門影片集", url: "https://www.bilibili.com/video/BV1NJ411i7c2/" },
      { label: "捷運工程中文解說", url: "https://www.ftvnews.com.tw/video/detail/IPsgZJ5TOUs" },
    ],
  },
  {
    title: "電機工程",
    summary: "從電路、通訊、控制、電子與光電開始，理解電力和訊號如何驅動現代科技。",
    resources: [
      { label: "電機工程學系介紹", url: "https://www.video.nchu.edu.tw/media/93" },
      { label: "電機工程發展史", url: "https://www.youtube.com/watch?v=10JgJ8in0D4" },
    ],
  },
  {
    title: "材料工程",
    summary: "探索金屬、陶瓷、塑膠與複合材料，理解材料性質如何決定產品的強度、重量與用途。",
    resources: [
      { label: "材料與塑膠：工學入門", url: "https://www.bilibili.com/video/BV1g341187o1/" },
      { label: "金屬與陶瓷工程入門", url: "https://tizarne.com/youtube/video/NOK1nMiiTWU" },
    ],
  },
  {
    title: "化學工程",
    summary: "把化學反應、能源、流體與製程設計串起來，理解從原料到產品的大規模製造。",
    resources: [
      { label: "Stanford 化學工程入門", url: "https://www.dnatube.com/video/18844/Lec-1-Introduction-to-Chemical-Engineering" },
      { label: "化學工程教學資源集", url: "https://chenected.aiche.org/2013/02/massive-collection-free-chemical-engineering-tutorials" },
    ],
  },
  {
    title: "生醫工程",
    summary: "把工程方法用在醫療與人體系統，認識醫材、影像、感測、藥物傳遞與健康科技。",
    resources: [
      { label: "Yale 生醫工程入門課", url: "https://online.yale.edu/courses/frontiers-biomedical-engineering" },
      { label: "生醫工程未來機會", url: "https://www.ganjingworld.com/video/1hg792q83s44QvDXXqFVA120r1kr1c" },
    ],
  },
  {
    title: "畫畫創作",
    summary: "從線條、形狀、顏色開始觀察世界，畫畫不是比誰畫得像，而是練習把想法變成看得見的作品。",
    resources: [
      { label: "色鉛筆暖身入門：畫水滴", url: "https://www.calligraphy01.com/drop/" },
      { label: "花草繪入門：火鶴花練習", url: "https://www.calligraphy01.com/anthurium/" },
    ],
  },
  {
    title: "音樂入門",
    summary: "先從節奏、音階與基礎樂理開始，慢慢理解旋律為什麼會動人，也能更自在地接觸樂器。",
    resources: [
      { label: "中文基礎樂理入門影片", url: "https://www.youtube.com/watch?v=PNsFI7W-kCo" },
      { label: "初學者樂理觀念整理", url: "https://musikershop.com/goods.php?id=105603" },
    ],
  },
  {
    title: "跳舞律動",
    summary: "跳舞可以從最簡單的節拍與基本步開始，重點不是一開始就很厲害，而是讓身體逐漸抓到節奏。",
    resources: [
      { label: "Shuffle Dance 超入門教學", url: "https://www.bilibili.com/video/av94085757" },
      { label: "Popping 基礎震點入門", url: "https://www.bilibili.com/video/BV1K64y1r71G/" },
    ],
  },
];

const button = document.querySelector("[data-gacha-button]");
const result = document.querySelector("[data-gacha-result]");
const title = document.querySelector("[data-topic-title]");
const summary = document.querySelector("[data-topic-summary]");
const resources = document.querySelector("[data-topic-resources]");
const label = document.querySelector("[data-gacha-label]");

button?.addEventListener("click", () => {
  const topic = topics[Math.floor(Math.random() * topics.length)];

  label.textContent = topic.title.slice(0, 2);
  title.textContent = topic.title;
  summary.textContent = topic.summary;
  resources.innerHTML = topic.resources
    .map((resource) => `<a class="resource-link-card" href="${resource.url}" target="_blank" rel="noopener">${resource.label}<span aria-hidden="true">→</span></a>`)
    .join("");
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
});
