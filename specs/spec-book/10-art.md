# 巨亨ONLINE 規格書 — 美術冊

- 建立日期：2026-07-30
- 受眾：美術
- 範圍（依 Cooper 2026-07-30 確認）：**不做精修標注、不列命名規則、不做按鈕/色票規格**。美術端主要用 Figma 出圖給前端，本冊只做兩件事：（1）指向現有截圖讓美術對照畫面現況，（2）整理素材待補清單，方便跟美術目前進度對表。

---

## 1. 畫面截圖

不重複列圖，直接看主幹的畫面索引總表：

→ [`_index-table.md`](_index-table.md)（84 張截圖，桌機 1440×900／手機 390×844，依章節分組，每張標有官網路由與三方判定）

---

## 2. 素材待補清單

比對 `handoff/asset-delivery-checklist.md`（2026-05-05 建立的模板，欄位多數未填）與目前 `public/`（51 個檔案）＋ `data/siteContent.ts` 的實際引用狀況，整理出目前**確定還缺、或還在用暫代方案**的項目。

### 2.1 遊戲卡封面圖 —— 15 / 24 款仍是色塊 fallback

`GameCard.vue` 邏輯：有 `imageSrc` 就顯示圖片，沒有就用 `color` 漸層色塊 + 首字當佔位（見 [`20-frontend.md` §3.1](20-frontend.md#31-遊戲資料結構已拍板只統一結構範圍待定)）。目前 8 款老虎機已有圖（`hotgame_001~008.avif`），其餘 4 分類全部缺：

| 分類 | 已有圖 | 缺圖（色塊代替） |
|---|---|---|
| 老虎機 slots | 8/8 ✅ | 無 |
| 百家樂 baccarat | 0/4 | `lucky-cat-baccarat` 有圖(`hotgame_009.avif`)，其餘 3 款缺：`classic-baccarat`／`speed-baccarat`／`dragon-tiger` |
| 捕魚機 fish | 0/4 | `ocean-fish`／`deep-sea`／`dragon-fish`／`neon-fish` |
| 骰子 dice | 0/4 | `fish-shrimp-crab`／`sic-bo`／`roulette`／`andar-bahar` |
| 棋牌 cards | 0/4 | `three-card`／`texas-holdem`／`pai-gow`／`teen-patti` |

> ⏸ 提醒：遊戲分類與數量本身**範圍未定案**（見 [decisions §3](../decisions/2026-07-30-first-phase-alignment-decisions.md#3-遊戲分類與數量--本階段只統一資料結構不決定範圍)），這 15 款是否最終都會上架還不確定。建議跟營運/採購階段的範圍決策一起排，避免先出圖、範圍又改了。

### 2.2 大廳側邊欄／底部導覽 icon —— 目前全部是 emoji 暫代

`LobbySidebar.vue`（⌂🎮📅🎉🏆🏦👤🔐📬🎁💬⇄📋⚙️📖🎧）與 `AppBottomNav.vue` 目前都用 emoji，`asset-delivery-checklist.md` §8 列出的 9 個 SVG icon 全部「未提供」。這塊不急（emoji 暫代不影響功能），但視覺一致性上是待補項。

### 2.3 頭像 —— 官網目前 12 個 emoji，非圖片素材

`member.vue` 頭像選擇是 12 個 emoji（前 10 個開放、後 2 個 VIP5 解鎖），**沒有任何圖片素材**。矩陣已標記三方頭像機制全不同（官網 emoji／APP 20 款圖片／後台上傳＋預設清單），這項目要不要出圖本身是待拍板項（未涵蓋在本輪 4 個決策內），出圖前建議先確認方向。

### 2.4 Banner／懸浮卡裝飾 —— 目前有基礎版，checklist 進階項未填

現況：`banner_001~005.avif` 已存在且被使用中（`FloatingPanels.vue`／`pages/index.vue`）；`event_01~07.avif`、`eventgame_001~006.avif` 同樣已在使用。checklist 模板中列的以下項目目前**沒有對應檔案**，狀態欄也是空的，需跟美術確認是否本來就不需要，還是漏交付：

- 懸浮卡頂部裝飾圖（`floating-deposit-header`／`floating-play-header`／`floating-member-header`）
- Header Logo 深底版、favicon
- 排行榜 Rank 1-3 badge
- Footer 社群品牌 icon（LINE/FB/IG/Telegram/X）
- 按鈕狀態圖規範（Normal/Hover/Active/Disabled）

### 2.5 目前已確認沒有缺件的部分

比對 `siteContent.ts` 內所有圖片路徑引用與 `public/` 實際檔案，**沒有發現任何引用了但檔案不存在的情況**（無死連結）。以下 7 個檔案存在於 `public/` 但未被 `siteContent.ts` 引用，皆已在 `FloatingPanels.vue`／`pages/index.vue`／`pages/h5.vue` 內直接使用，非孤兒檔案：`lobby.jpeg`、`btn_001.png`、`btn_002.png`、`title_text_event.png`、`title_text_games.png`、`title_text_news.png`、`title_text_ranking.png`。

---

## 3. 對表建議

跟美術核對進度時，建議照 §2 的 4 個分類逐項確認「已交付／製作中／未開始／不需要」，不用照 `asset-delivery-checklist.md` 整份模板逐欄填（那份模板欄位比實際需求細很多，目前用不上的欄位可以先跳過）。
