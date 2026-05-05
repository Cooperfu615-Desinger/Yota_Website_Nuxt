# 巨亨 ONLINE 美術交接文件

更新日期：2026-05-05

這份文件提供給美術、視覺設計與素材協作使用，目標是讓接手的人可以快速知道目前網站哪些區塊是 CSS 做出來的、哪些區塊已適合直接換圖、素材該怎麼提供，以及目前的主要配色和規格。

> **本版本重大更新**：新增「遊戲大廳平台」（`/lobby`），並全面更新官網手機導覽結構。以下文件已含蓋兩個平台的美術需求。

## 1. 專案視覺方向

- 網站類型：遊戲官網 + 遊戲大廳平台
- 目前主視覺風格：深紫底、金色儲值 CTA、紫色遊戲 CTA、霓虹感娛樂城風格
- 視覺組成：CSS 漸層、光暈、描邊、文字版型與少量可替換圖像混合

## 2. 先理解一件重要的事

目前網站很多「看起來像圖」的地方，其實不是圖片，而是 CSS 效果，像是：

- 背景光斑
- 卡片紫色邊框與光暈
- 按鈕漸層與陰影
- 大面積底色與圓形裝飾
- 部分 icon 為 inline SVG

所以如果要改版，第一步要先判斷：

- 是要直接換圖檔
- 還是只要改顏色 / gradient / 邊框 / 陰影

## 3. 目前可直接換圖的區塊

### 3.1 官網首頁 Banner

位置：`components/BannerSlider.vue` / `data/siteContent.ts > bannerSlides`

目前狀態：
- 純圖片輪播，已移除文案與按鈕
- 若沒有圖，退回漸層背景 fallback

這代表：後續 Banner 主要就是換圖檔，適合由後台上傳桌機圖 / 手機圖。

### 3.2 Web館預覽圖

位置：`public/lobby.jpeg`

目前狀態：
- 點擊大廳右上角「Web館」按鈕，另開新分頁顯示此圖
- 未來正式 Web 版上線後，前端將 `/h5` 頁面改為真實 iframe 即可
- 目前只需直接替換 `public/lobby.jpeg` 即可更新畫面

### 3.3 遊戲卡封面圖

位置：`data/siteContent.ts > games[].color`

目前狀態：
- 24 款遊戲目前以 `color` 色條作為暫時視覺識別
- 遊戲卡有 `key` 欄位（如 `fruit-slots`、`dragon-legend`）
- 後續換圖時，請依 `key` 對應提供封面圖

遊戲列表：

| key | 名稱 | 分類 | 供應商 |
|-----|------|------|--------|
| `fruit-slots` | 水果老虎機 | 老虎機 | JH Gaming |
| `dragon-legend` | 神龍傳奇 | 老虎機 | JH Gaming |
| `lucky-cat-slots` | 招財貓老虎機 | 老虎機 | PG Soft |
| `mahjong-wins` | 麻將胡了 | 老虎機 | PG Soft |
| `treasure-hunt` | 尋寶大冒險 | 老虎機 | JH Gaming |
| `golden-phoenix` | 金鳳凰 | 老虎機 | JH Gaming |
| `zeus-thunder` | 宙斯雷神 | 老虎機 | PG Soft |
| `candy-blast` | 糖果爆爆樂 | 老虎機 | PG Soft |
| `lucky-cat-baccarat` | 招財貓百家樂 | 百家樂 | Evolution |
| `classic-baccarat` | 經典百家樂 | 百家樂 | Evolution |
| `speed-baccarat` | 極速百家樂 | 百家樂 | Evolution |
| `dragon-tiger` | 龍虎鬥 | 百家樂 | JH Gaming |
| `ocean-fish` | 海洋捕魚機 | 捕魚機 | JH Gaming |
| `deep-sea` | 深海獵人 | 捕魚機 | JH Gaming |
| `dragon-fish` | 龍宮捕魚 | 捕魚機 | PG Soft |
| `neon-fish` | 霓虹捕魚 | 捕魚機 | PG Soft |
| `fish-shrimp-crab` | 魚蝦蟹 | 骰子 | JH Gaming |
| `sic-bo` | 骰寶 | 骰子 | JH Gaming |
| `roulette` | 歐式輪盤 | 骰子 | Evolution |
| `andar-bahar` | Andar Bahar | 骰子 | Evolution |
| `three-card` | 三公撲克 | 棋牌 | JH Gaming |
| `texas-holdem` | 德州撲克 | 棋牌 | JH Gaming |
| `pai-gow` | 牌九 | 棋牌 | JH Gaming |
| `teen-patti` | Teen Patti | 棋牌 | Evolution |

### 3.4 懸浮介面頂部裝飾區（官網）

位置：`components/FloatingPanels.vue`

目前有三種頂部狀態：
- `立即儲`
- `立即玩`
- `玩家資訊`

建議提供：
- `floating-deposit-header.webp`
- `floating-play-header.webp`
- `floating-member-header.webp`

## 4. 美術最常需要處理的區塊

### 4.1 官網 Header / Logo

位置：`components/AppHeader.vue`

目前內容：
- 左上 Logo 為前端色塊 + 文字組合
- 手機：左側漢堡鍵（開啟抽屜）+ Logo；右側用戶資訊

如果之後要改正式品牌視覺，建議提供：
- 主 Logo：SVG
- 深底版 Logo
- favicon / 小 icon 版

### 4.2 官網手機漢堡抽屜

位置：`components/AppHeader.vue`

目前內容：
- 從左側滑入，深紫底色
- 頂部顯示品牌 Logo + 名稱
- 6 個導覽項目（目前以 emoji icon + 文字呈現）

美術可提供：
- 抽屜背景裝飾（可選）
- 各導覽項目正式 icon（取代目前 emoji）

### 4.3 遊戲大廳 Header（LobbyHeader）

位置：`components/LobbyHeader.vue`

目前內容：
- 左：漢堡鍵 + Logo（「巨亨 ONLINE」漸層文字）
- 右（已登入）：金色 VIP 徽章 + 玩家名稱 / 餘額 + 紫色頭像圓圈

如果之後要改大廳 Logo，建議同時提供官網與大廳兩個版本（可以相同）。

### 4.4 遊戲大廳側邊欄（LobbySidebar）

位置：`components/LobbySidebar.vue`

目前內容：
- 深紫背景，三分區導覽
- 桌機可收合至 60px（只顯示 emoji icon）
- 手機收合為 overlay

適合美術提供：
- 側邊欄背景裝飾 / 紋理（可選）
- 各功能 icon（取代目前 emoji）

### 4.5 遊戲視圖（GameView，Stake 風格）

位置：`components/lobby/GameView.vue`

目前結構（由上到下）：

1. 返回大廳按鈕
2. 遊戲 iframe（16:9 固定比例）
3. 控制列：品牌名稱 + 試玩 / 真錢模式切換 Tab
4. 遊戲資訊區：供應商 Logo（色塊）+ 遊戲名 + badge + RTP 標籤 + 遊戲描述 + 規格表

適合美術提供：
- 供應商 Logo 圖示（目前為文字首字色塊）
- 控制列品牌 Logo 替代文字版
- 遊戲 RTP badge 設計規範

### 4.6 Web館按鈕

位置：`layouts/lobby.vue`

目前規格：
- `position: fixed; top: header + 8px; right: 12px`
- 紫色漸層 + 脈衝光暈動畫
- 圓角膠囊形，18px 字體，22px globe SVG icon
- 點擊另開 `/h5`（目前顯示 `lobby.jpeg`）

美術可提供：
- 替代按鈕視覺方案（如更明顯的金色 CTA）

### 4.7 首頁 Banner

位置：`components/BannerSlider.vue`

規格：
- 比例：`16:7`
- 桌機建議：`1600 x 700`
- 手機版建議另出 mobile crop
- 純圖片輪播，不需 Banner 內文分層

### 4.8 首頁快速入口

位置：`pages/index.vue`

目前內容：儲值 / 活動 / 排行榜 / 教學，主要以 icon + 文字 + 紫色卡片呈現

適合提供：icon 規格 / 卡片 hover 規範

### 4.9 Footer

位置：`components/AppFooter.vue`

- 桌機：4 欄 grid（品牌介紹 / 快速連結 / 聯絡方式 / 社群媒體）
- 手機：精簡版（Logo / 社群按鈕 / APP 下載 / 法律聲明）
- 社群圖示目前為 inline SVG，建議提供各平台官方視覺版本

## 5. 全站主要色票

色票集中在 `assets/css/main.css > :root`：

```css
--color-bg:           #0F0020;   /* 主背景 */
--color-bg-card:      #1C0A3A;   /* 卡片背景 */
--color-bg-card2:     #250D48;   /* 次卡片背景 */
--color-purple-dark:  #3B0764;
--color-purple:       #6B21A8;
--color-purple-mid:   #7C3AED;
--color-purple-light: #A855F7;
--color-purple-glow:  #C084FC;
--color-gold:         #F5C842;   /* 主金色 */
--color-gold-light:   #FDE68A;
--color-gold-dark:    #D97706;
--color-text:         #F3E8FF;   /* 主文字 */
--color-text-muted:   #C4B5D5;   /* 次文字 */
--color-border:       rgba(168,85,247,0.3);
--color-border-gold:  rgba(245,200,66,0.4);
```

## 6. 目前版本的關鍵視覺規格

### 6.1 Banner（官網）

- 比例：`16:7`
- 建議桌機輸出：`1600 x 700`
- 手機版建議另出裁切圖
- 不需要 Banner 內文與 CTA

### 6.2 遊戲卡片（大廳）

目前以 `3:4` 比例卡片顯示（lobby/GameCard），暫時用色條替代封面圖。封面圖建議提供 `3:4` 比例。

### 6.3 遊戲視圖 iframe

- 固定 `16:9` 比例
- 不提供全螢幕佔滿版面的設計，為頁內展開

### 6.4 大廳側邊欄尺寸

- 展開：`200px` 寬
- 收合：`60px` 寬（icon-only）
- 桌機固定在左側（sticky），手機為 overlay

### 6.5 Web館按鈕

- 位置：大廳 Header 正下方右側 fixed
- 尺寸：`padding: 14px 28px`，圓角 `28px`，字體 `18px`
- 效果：紫色漸層 + 脈衝光暈

### 6.6 懸浮介面（官網）

- 桌機：左右兩張懸浮卡
- 手機：左右上方兩顆精簡按鈕（`fp-mobile-btn`）
- 手機登入後：用戶資訊顯示在 Header，不是浮動按鈕

### 6.7 漢堡抽屜（官網手機）

- 寬度：`260px`
- 從左側滑入（`transform: translateX(-100%)` → `translateX(0)`）
- 深紫漸層背景
- z-index：`300/301`（高於所有懸浮元件）

## 7. 圖檔提供建議

### 7.1 建議路徑

```text
public/images/
public/images/banner/
public/images/logo/
public/images/events/
public/images/icons/
public/images/floating/
public/images/games/
public/images/decorations/
```

### 7.2 檔名規則

- 使用英文小寫
- 單字之間以 `-` 連接
- 避免中文與空白

### 7.3 建議格式

- Logo：`svg`
- Banner / 活動主圖：`webp`
- 遊戲卡封面：`webp`（3:4 比例）
- 需透明背景素材：`png` 或 `svg`
- icon：`svg` 優先

## 8. 美術與前端分工建議

### 美術提供

- 色票
- 主視覺圖（Banner、活動主圖）
- Logo / icon
- 遊戲卡封面（3:4，依 `key` 對應）
- 懸浮卡頂部裝飾圖
- rank badge
- 抽屜 icon 規格（取代目前 emoji）
- 按鈕 hover / active 規範

### 前端負責

- 掛圖、裁切、響應式處理
- 路徑與 baseURL 處理
- 手機 / 桌機版型適配
- 互動狀態與按鈕邏輯整合

## 9. 建議未來優先補的素材

優先順序：

1. Banner 桌機 / 手機雙版本（官網首頁用）
2. 24 款遊戲卡封面圖（大廳 / 官網共用）
3. 正式 Logo SVG 套件
4. 懸浮卡頭部裝飾圖（3 張）
5. 活動主視覺圖與縮圖
6. Footer 社群品牌 icon（LINE / Facebook / Instagram / Telegram / X）
7. 導覽 icon（取代漢堡抽屜與大廳側邊欄目前的 emoji）
8. 排行榜 rank badge 規格
9. Web館按鈕視覺方案（若需要更明顯的強調效果）

## 10. 快速交接摘要

| 想換什麼 | 先看哪裡 |
|----------|----------|
| Banner 圖 | `components/BannerSlider.vue` + `data/siteContent.ts` |
| Web館預覽圖 | `public/lobby.jpeg` |
| 懸浮介面視覺 | `components/FloatingPanels.vue` + `assets/css/main.css` |
| 遊戲卡封面 | `data/siteContent.ts > games[].color` → 改為 `imageSrc` |
| 全站主題色 | `assets/css/main.css > :root` |
| 大廳側邊欄 icon | `components/LobbySidebar.vue` |
| 圖檔路徑 | `public/images/...` 結構 |
