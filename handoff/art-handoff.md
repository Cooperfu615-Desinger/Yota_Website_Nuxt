# 巨亨 ONLINE 美術交接文件

更新日期：2026-04-09

這份文件提供給美術、視覺設計與素材協作使用，目標是讓接手的人可以快速知道目前網站哪些區塊是 CSS 做出來的、哪些區塊已經適合直接換圖、Banner 和懸浮介面的素材該怎麼提供，以及目前的主要配色和規格。

## 1. 專案視覺方向

- 網站類型：遊戲官網 / 活動導流頁
- 目前主視覺風格：深紫底、金色儲值 CTA、紫色遊戲 CTA、霓虹感娛樂城風格
- 視覺組成：CSS 漸層、光暈、描邊、文字版型與少量可替換圖像混合

## 2. 目前哪些區塊已適合直接換圖

### 2.1 Banner

位置：

- `components/BannerSlider.vue`
- `data/siteContent.ts > bannerSlides`

目前狀態：

- 已改成純圖片輪播
- 已移除 Banner 內文案與按鈕
- 若沒有圖，才會退回到漸層背景 fallback

這代表：

- 之後 Banner 主要就是換圖檔
- 很適合由後台上傳桌機圖 / 手機圖
- 美術不用再配合前端做 Banner 內文分層

### 2.2 懸浮介面頂部裝飾區

位置：

- `components/FloatingPanels.vue`
- `assets/css/main.css`

目前狀態：

- 懸浮卡上方標題區已做成可替換背景圖容器
- 前端保留 icon 與標題文字
- 背景裝飾圖可由美術提供

目前有三種頂部狀態：

- `立即儲`
- `立即玩`
- `玩家資訊`

建議提供：

- `floating-deposit-header.webp`
- `floating-play-header.webp`
- `floating-member-header.webp`

## 3. 先理解一件重要的事

目前網站很多「看起來像圖」的地方，其實不是圖片，而是 CSS 效果，像是：

- 背景光斑
- 卡片紫色邊框與光暈
- 按鈕漸層與陰影
- 大面積底色與圓形裝飾
- 部分 icon 為 inline SVG

所以如果要改版，第一步要先判斷：

- 是要直接換圖檔
- 還是只要改顏色 / gradient / 邊框 / 陰影

## 4. 美術最常需要處理的區塊

### 4.1 Header / Logo

位置：

- `components/AppHeader.vue`

目前內容：

- 左上 Logo 為前端色塊 + 文字組合
- 手機登入後，右上會顯示會員資訊列

如果之後要改正式品牌視覺，建議提供：

- 主 Logo：SVG
- 深底版 Logo
- favicon / 小 icon 版

### 4.2 首頁 Banner

目前 Banner 規格：

- 比例：`16:7`
- 目前輪播結構已純圖片化

建議尺寸：

- 桌機主圖：`1600 x 700`
- 也可接受同比例尺寸，例如 `1440 x 630`
- 手機版建議另外提供 mobile crop

建議欄位：

- 桌機圖
- 手機圖
- alt 文案
- 連結（若有）

### 4.3 懸浮介面

位置：

- `components/FloatingPanels.vue`

目前視覺分工：

- 左側：`立即儲`
- 右側：`立即玩 / 玩家資訊`

互動方向：

- `立即儲` 維持金色系
- `立即玩` 已統一改成紫色系

適合美術提供：

- 懸浮卡上方背景裝飾圖
- 懸浮卡按鈕風格方向
- 玩家資訊卡的背景紋理 / 裝飾

### 4.4 首頁快速入口

位置：

- `pages/index.vue`

目前內容：

- 儲值 / 活動 / 排行榜 / 教學
- 主要以 icon + 文字 + 紫色卡片呈現

適合提供：

- icon 規格
- 卡片背景或 hover 規範

### 4.5 排行榜 / 活動 / FAQ / 教學 / 會員頁

位置：

- `pages/index.vue`
- `pages/leaderboard.vue`
- `pages/events.vue`
- `pages/support.vue`
- `pages/tutorial.vue`
- `pages/member.vue`

目前內容：

- 以卡片、色塊、分區資訊為主
- 圖像依賴度低於 Banner

適合提供：

- 區塊標題樣式
- rank badge
- 活動主視覺圖與縮圖
- 頁面背景裝飾圖

### 4.6 Footer

位置：

- `components/AppFooter.vue`

目前結構：

- 桌機：4 欄 grid
  - 品牌介紹
  - 快速連結
  - 聯絡方式
  - 社群媒體
- 手機：精簡版
  - Logo
  - 社群按鈕
  - APP 下載
  - 法律聲明

補充：

- 社群圖示目前為 inline SVG
- 未來若要換成正式品牌 icon，建議改用各平台官方視覺版本
- Footer 背景沿用 `--color-bg-card` 深色系，icon 需注意暗底辨識度

### 4.7 首頁熱門遊戲卡

位置：

- `pages/index.vue`
- `pages/tutorial.vue`

目前內容：

- 首頁顯示 3 張熱門遊戲卡
- 教學頁使用同一份 `games` 資料顯示完整 6 張
- 目前用色條（`color` 欄位）做視覺識別

如果未來要改成封面圖形式，需注意：

- 首頁與教學頁共用同一份資料來源
- 素材交付要同步考慮兩個頁面
- 桌機首頁目前是 3 張卡的 grid 呈現

### 4.8 手機懸浮按鈕

位置：

- `components/FloatingPanels.vue`

目前內容：

- 手機版不是桌機卡片縮放，而是獨立的精簡按鈕元件
- 左側為 `立即儲`
- 右側為 `立即玩`

這兩顆按鈕與桌機懸浮面板是不同視覺層級，若之後要由美術提供手機版視覺方向，請分開思考，不要直接沿用桌機卡片完整稿

## 5. 全站主要色票

色票集中在：

- `assets/css/main.css`

目前核心色票如下：

```css
--color-bg:           #0F0020;
--color-bg-card:      #1C0A3A;
--color-bg-card2:     #250D48;
--color-purple-dark:  #3B0764;
--color-purple:       #6B21A8;
--color-purple-mid:   #7C3AED;
--color-purple-light: #A855F7;
--color-purple-glow:  #C084FC;
--color-gold:         #F5C842;
--color-gold-light:   #FDE68A;
--color-gold-dark:    #D97706;
--color-text:         #F3E8FF;
--color-text-muted:   #C4B5D5;
--color-border:       rgba(168,85,247,0.3);
--color-border-gold:  rgba(245,200,66,0.4);
```

## 6. 目前版本的關鍵視覺規格

### 6.1 Banner

- 比例：`16:7`
- 建議桌機輸出：`1600 x 700`
- 建議手機版另出一張裁切圖
- 目前不需要 Banner 內文與 CTA 設計，因為前台已移除

### 6.2 懸浮介面

- 桌機為左右兩張懸浮卡
- 手機為左右上方兩顆精簡按鈕
- 手機登入後，會員資訊顯示在 Header，不是在浮動按鈕內

### 6.3 APP 下載

- 桌機：下載入口同時存在於左側懸浮面板與 Footer
- 手機：下載入口只在 Footer，懸浮按鈕為精簡版
- 因此美術若要補下載相關素材，仍需考慮桌機左側懸浮面板的下載區視覺
- 若需要改視覺，主要看 Footer 區塊而不是懸浮卡

## 7. 圖檔提供建議

### 7.1 建議路徑

```text
public/images/
public/images/banner/
public/images/logo/
public/images/events/
public/images/icons/
public/images/floating/
public/images/decorations/
```

### 7.2 檔名規則

- 使用英文小寫
- 單字之間以 `-` 連接
- 避免中文
- 避免空白

範例：

```text
public/images/banner/home-hero-01.webp
public/images/banner/home-hero-01-mobile.webp
public/images/floating/floating-play-header.webp
public/images/floating/floating-deposit-header.webp
public/images/logo/logo-main.svg
public/images/events/event-million-race.webp
```

### 7.3 建議格式

- Logo：`svg`
- Banner / 活動主圖：`webp`
- 需要透明背景的素材：`png` 或 `svg`
- icon：`svg` 優先

## 8. 美術與前端分工建議

### 美術提供

- 色票
- 主視覺圖
- 活動圖
- Logo / icon
- 懸浮卡頂部裝飾圖
- rank badge
- 按鈕 hover / active 規範

### 前端負責

- 掛圖、裁切、響應式處理
- 路徑與 baseURL 處理
- 手機 / 桌機版型適配
- 互動狀態與按鈕邏輯整合

## 9. 建議未來優先補的素材

- Banner 桌機 / 手機雙版本
- 正式 Logo 套件
- 懸浮卡頭部裝飾圖
- 活動主視覺圖與縮圖
- 排行榜 rank badge 規格
- CTA 按鈕狀態規範

## 10. 快速交接摘要

- 想換 Banner：先看 `components/BannerSlider.vue` + `data/siteContent.ts`
- 想換懸浮介面視覺：先看 `components/FloatingPanels.vue` + `assets/css/main.css`
- 想換全站主題色：先看 `assets/css/main.css`
- 想整理圖檔路徑：用 `public/images/...` 結構
