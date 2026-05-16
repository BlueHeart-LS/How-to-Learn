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
- 文章列表與文章閱讀頁
- 文章後台管理
- 會員註冊、登入與個人資料
- 學習風格測驗
- 數學、語文、英文與專注力遊戲
- 學習寵物養成與遊戲成就紀錄
- 教學資源與學習平台整理

未來預計持續擴充：

- 更多主題文章
- 更多互動學習工具
- 更完整的社群與學習歷程功能
- AI 輔助學習與內容推薦

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
├─ package.json
├─ server.js
├─ start-server.bat
├─ css/
│  └─ styles.css
├─ data/              # 本機 runtime 資料，已由 .gitignore 忽略
├─ fonts/
│  ├─ Iansui-Regular.ttf
│  └─ jf-openhuninn-2.1.ttf
├─ js/
│  ├─ admin.js
│  ├─ articles.js
│  ├─ auth.js
│  ├─ games/
│  │  ├─ english-vocab-game.js
│  │  ├─ games-filter.js
│  │  ├─ learning-style-quiz.js
│  │  ├─ multiplication-game.js
│  │  └─ study-pet-game.js
│  ├─ home.js
│  ├─ main.js
│  ├─ methods.js
│  ├─ random-explore.js
│  ├─ resource-hub.js
│  └─ resource-preview.js
├─ pages/
│  ├─ about.html
│  ├─ admin.html
│  ├─ admin-articles.html
│  ├─ article.html
│  ├─ explore.html
│  ├─ games.html
│  ├─ login.html
│  ├─ learning-platforms.html
│  ├─ learning-style.html
│  ├─ methods.html
│  ├─ multiplication-game.html
│  ├─ operation-game.html
│  ├─ practice-assets.html
│  ├─ profile.html
│  ├─ random-explore.html
│  ├─ register.html
│  ├─ resources.html
│  └─ start.html
├─ server/
│  └─ server.js
├─ supabase/
│  ├─ schema.sql
│  └─ admin-setup.sql
└─ images/
   ├─ LOGO.png
   ├─ articles/
   ├─ Character/
   └─ resource/

```

---

## 使用技術

目前使用：

- HTML
- CSS
- JavaScript
- Node.js 本機後端
- Supabase Auth / Database / Storage

目前沒有使用前端框架，主要以原生 HTML、CSS、JavaScript 維護。

---

## 本地開啟方式

若只要瀏覽靜態頁面，可以直接打開：

```text
index.html
```

即可在瀏覽器查看網站。部分功能會使用瀏覽器 localStorage 暫存。

若要使用完整功能，例如會員登入、文章 API、文章後台、封面上傳與瀏覽數紀錄，請改用 Node 啟動本機伺服器：

```text
npm start
```

如果 Windows 找不到 `npm`，也可以直接執行：

```text
start-server.bat
```

啟動後開啟：

```text
http://localhost:3000/pages/admin.html
```

文章會透過 `/api/articles` 儲存到 `data/articles.json`。沒有啟動後端時，管理頁仍會暫時使用瀏覽器 localStorage。

---

## 環境變數

Node 後端可使用下列環境變數：

```text
PORT=3000
DATA_DIR=資料儲存資料夾
ARTICLE_IMAGES_DIR=文章封面上傳資料夾
ADMIN_EMAILS=管理員 email，多個帳號用逗號分隔
```

預設管理員 email：

```text
lan.learning.tw@gmail.com
```

若正式部署時要更換管理員，請同步確認：

- `ADMIN_EMAILS`
- `js/auth.js`
- `js/admin.js`
- `supabase/admin-setup.sql`

---

## 安全注意事項

- `data/*.json` 會保存會員、session、文章與瀏覽數資料，不應提交正式站台資料。
- `.gitignore` 已忽略 `data/*.json` 與 `images/articles/*`，避免把 runtime 資料放進 Git。
- Node 後端已阻擋 `/data`、`/storage`、`.git`、`.sql` 等敏感檔案的靜態讀取。
- 文章新增、刪除、封面上傳都需要管理員權限。
- 文章內文支援基本 HTML；前台渲染前會移除不安全標籤、事件屬性與危險連結。
- 更新後端程式後，需要重新啟動本機 server，變更才會生效。

---

## 使用 Supabase 取代 Node 後端

若要改成「純前端 + Supabase」，可以不用 Node 後端。

設定方式：

1. 到 Supabase 建立新 project。
2. 進入 SQL Editor，貼上並執行 `supabase/schema.sql`。
3. 如果要指定管理員帳號，確認 `supabase/admin-setup.sql` 裡的 email 後執行。
4. 到 Project Settings → API，複製 Project URL 與 anon/public key。
5. 打開 `js/supabase-config.js`，填入：

```js
window.HowToLearnSupabaseConfig = {
  url: "你的 Supabase Project URL",
  anonKey: "你的 Supabase anon public key",
};
```

完成後：

- 會員註冊 / 登入會使用 Supabase Auth。
- 個人資料會存在 `profiles` table。
- 文章會存在 `articles` table。
- 瀏覽數會存在 `article_views` table。
- 文章封面會上傳到 Supabase Storage 的 `article-covers` bucket。

注意：Supabase RLS 會限制只有 `profiles.role = 'admin'` 的帳號能管理文章與上傳封面。如果後台儲存失敗，請先確認管理員帳號已正確寫入 `profiles`。

如果 `js/supabase-config.js` 還是預設值，網站會回到原本的本機 Node API fallback。

---

## 更新紀錄

```text
260517
- 完成資安修補：後端管理 API 權限檢查、敏感檔案防讀取、登入失敗限制、Supabase RLS 收緊、社群頁 XSS 修復
- 修正文章預覽：可預覽未儲存草稿，預覽不增加瀏覽數
- 調整文章後台：內文可輸入基本 HTML，前台顯示時會先做安全清理
- 整理專案結構：後端移至 server/，Supabase SQL 移至 supabase/
- 分批整理 JS：遊戲與互動練習腳本移至 js/games/

260516
- 完成文章後台：文章列表、編輯頁、新增文章、刪除文章、封面上傳、預設文章匯入
- 修正文章後台：管理員權限檢查、列表載入、文章代號自動產生、上傳日期選擇
- 新增文章瀏覽數紀錄與觀看數修復
- 新增會員登入/註冊/個人資料流程，補強管理員入口與權限顯示
- 新增頭貼功能，更新頭貼與學習寵物圖樣
- 新增學習寵物類型選擇，補齊寵物屬性並限制滿屬性操作
- 更新遊戲首頁資訊並同步寵物狀態顯示
- 完成 Supabase 設定

260515
- 新增後端文章管理系統
- 新增登入系統與管理員權限入口
- 更新 UI 介面，新增數學遊戲與休閒遊戲區
- 優化 JS、移除測試廣告並整理初版檔案

260514
- 更新 UI 介面
- 新增數學遊戲與休閒遊戲區

260513
- 新增遊戲與資源內容
- 優化網站介面與互動體驗

260511
- 新增主題包
- 新增探索、遊戲與主題包內容

260510
- 新增探索、遊戲、資源實際功能
- 整理資料夾與頁面結構
- 移除舊版頁面與設計稿圖片
- 更新 README 品牌介紹與更新紀錄

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
