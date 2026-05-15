# 如何學｜How to Learn

「不是教你答案，而是陪你找到理解世界的方法。」

## 關於如何學

「如何學（How to Learn）」是一個以學習、思考與自我理解為核心的教育品牌。

我們相信：

> 真正重要的不是學了多少，而是如何學。

學習不只是成績、考試與標準答案，也包含：

- 如何理解自己
- 如何找到適合自己的方法
- 如何建立思考能力
- 如何在 AI 時代探索自己的不可替代性

這個網站希望成為：

> 一個陪伴學生與所有熱愛學習的人，一起探索「如何學習」的地方。

---

## 網站內容

目前網站包含：

- 品牌介紹
- 哲學式家教理念
- 我的故事
- 學習方法與思考
- 聯絡資訊

未來預計加入：

- 學習地圖
- 心理測驗／互動內容
- 教學資源
- 遊戲化學習設計
- 社群功能

---

## 專案目的

此網站作為：

1. 「如何學」品牌官方網站  
2. 教學理念與內容展示平台  
3. 教育科技與互動學習的實驗場

---

## 專案結構

```text
How-to-Learn/
├─ index.html
├─ css/
│  └─ styles.css
├─ fonts/
│  ├─ Iansui-Regular.ttf
│  └─ jf-openhuninn-2.1.ttf
├─ js/
│  ├─ admin.js
│  ├─ articles.js
│  ├─ learning-style-quiz.js
│  ├─ main.js
│  ├─ methods.js
│  ├─ multiplication-game.js
│  ├─ operation-game.js
│  ├─ random-explore.js
│  └─ resource-preview.js
├─ pages/
│  ├─ about.html
│  ├─ admin.html
│  ├─ article.html
│  ├─ explore.html
│  ├─ games.html
│  ├─ learning-platforms.html
│  ├─ learning-style.html
│  ├─ methods.html
│  ├─ multiplication-game.html
│  ├─ operation-game.html
│  ├─ practice-assets.html
│  ├─ random-explore.html
│  ├─ resources.html
│  └─ start.html
└─ images/
   ├─ LOGO.png
   ├─ about.png
   ├─ explore.png
   ├─ map.png
   ├─ icon_*.png
   └─ resource/
      ├─ board_9x9.png
      ├─ board_alphabet.png
      ├─ board_pingyin.png
      └─ card_Aa.png ～ card_Zz.png

```

---

## 使用技術

目前使用：

- HTML
- CSS
- JavaScript

未來可能加入：

- 小遊戲
- 心理測驗
- 動畫互動
- 後端功能
- AI 教學工具

---

## 本地開啟方式

直接打開：

```text
index.html
```

即可在瀏覽器查看網站。

若要使用文章後端管理系統，請改用 Node 啟動本機伺服器：

```text
npm start
```

啟動後開啟：

```text
http://localhost:3000/pages/admin.html
```

文章會透過 `/api/articles` 儲存到 `data/articles.json`。沒有啟動後端時，管理頁仍會暫時使用瀏覽器 localStorage。

---

## 部署到 Render

專案已包含 `render.yaml`，可用 Render Blueprint 建立 Node Web Service。

部署前請先把專案推到 GitHub，然後在 Render：

1. 點選 New → Blueprint。
2. 選擇這個 GitHub repo。
3. Render 會讀取 `render.yaml`。
4. 建立服務後等待部署完成。

目前設定：

- Build Command：`npm install`
- Start Command：`npm start`
- Node Version：20
- Persistent Disk：`/opt/render/project/src/storage`
- 文章資料：`/opt/render/project/src/storage/data`
- 上傳封面：`/opt/render/project/src/storage/images/articles`

注意：會員資料、文章資料、封面圖片都需要 persistent disk 才能在 Render 重啟或 redeploy 後保留。Render 官方文件說 Web Service 預設檔案系統是 ephemeral；Persistent Disk 需使用付費 Web Service。

---

## 更新紀錄

```text
260510新增探索/遊戲/資源實際功能
260508網站建立
```

---

## 品牌理念

我們不急著回答問題。

因為有時候：

> 問對問題，比得到答案更重要。

學習，不只是知識。

而是理解自己、理解世界，以及理解人。

---

## Author

Lan  
Philosophy Tutor / Educator / Learner

正在探索：

> Education × Philosophy × Technology × AI
