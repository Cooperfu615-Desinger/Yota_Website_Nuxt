# 巨亨 ONLINE 美術交接文件

更新日期：2026-04-06

這份文件提供給美術、視覺設計與素材協作使用，目標是讓接手的人可以快速知道這個網站目前哪些區塊是 CSS 做出來的、哪些地方適合替換圖檔、配色與按鈕應該從哪裡調整，以及提供素材時前端最需要的規格。

## 1. 專案視覺方向

- 網站類型：遊戲官網 / 活動導流頁
- 目前主視覺風格：深紫底、金色 CTA、紫色霓虹感、偏娛樂城 / 線上遊戲官網氛圍
- 視覺呈現方式：大量使用 CSS 漸層、色塊、光暈、描邊與文字版型，不是大量圖片直出

## 2. 先理解一件重要的事

目前網站很多「看起來像圖」的地方，其實不是圖片，而是 CSS 效果，像是：

- Banner 背景漸層
- 按鈕金色立體感
- 卡片紫色邊框與光暈
- 大面積底色與圓形光斑
- 部分 icon 為 inline SVG

所以如果要改版，第一步要先判斷：

- 是要「換圖檔」
- 還是只要「調色 / 改 gradient / 改按鈕樣式」

## 3. 美術最常需要處理的區塊

### 3.1 Header / Logo

位置：

- `components/AppHeader.vue`

目前內容：

- 左上 Logo 方塊是色塊風格
- `巨亨ONLINE` 為文字呈現

若要改正式品牌視覺，建議提供：

- 主 Logo：SVG
- 深底版 Logo
- 淺底版 Logo
- 小尺寸 favicon / icon 版本

### 3.2 首頁 Banner

位置：

- `components/BannerSlider.vue`
- `data/siteContent.ts > bannerSlides`

目前內容：

- Banner 主要由 CSS gradient 與文字組成
- 每張 Banner 的背景、標題、說明、按鈕文字都可以調整

若要改成圖像式主視覺，建議提供：

- 桌機版 Banner 主圖
- 手機版 Banner 主圖
- 主標題與副標是否需要保留文字層
- CTA 按鈕的 hover / active 樣式方向

建議不要把所有文字都直接做死在圖裡，最好保留：

- 主視覺圖
- 文案文字層
- CTA 按鈕層

這樣前端比較容易做響應式與後續改文案。

### 3.3 首頁快速入口

位置：

- `pages/index.vue`

目前內容：

- 儲值 / 活動 / 排行榜 / 教學 這四塊主要以 icon + 文字 + 紫色卡片呈現

若要調整，建議提供：

- icon 視覺方向
- 卡片底圖或卡片背景規範
- hover / active 樣式

### 3.4 排行榜快報

位置：

- `pages/index.vue`
- `pages/leaderboard.vue`

目前內容：

- 主要是卡片、數字、字色、排名徽章與 tab 視覺

建議提供：

- rank 1 / 2 / 3 的視覺規範
- tab 的 active / inactive 樣式
- 排行榜卡片底色與邊框規範

### 3.5 熱門活動 / 活動頁

位置：

- `pages/index.vue`
- `pages/events.vue`
- `data/siteContent.ts > events`

目前內容：

- 活動卡以色塊與漸層為主
- 尚未大量使用正式活動主圖

若未來活動頁要更像正式官網，建議提供：

- 活動主視覺圖
- 活動縮圖
- 活動 badge / 標籤風格
- 活動倒數 / CTA 樣式

### 3.6 FAQ / 儲值 / 教學 / 會員頁

位置：

- `pages/support.vue`
- `pages/deposit.vue`
- `pages/tutorial.vue`
- `pages/member.vue`

目前內容：

- 這些頁面圖像依賴度較低
- 主要還是卡片、標題、底色與資訊分區

適合美術提供：

- 頁面背景方向
- 區塊標題樣式
- 卡片規範
- 插圖或裝飾圖

## 4. 全站主要色票

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

## 5. 建議的改色方式

### 5.1 整站換主題

請優先調整：

- `assets/css/main.css` 的 `:root` 色票變數

適合情境：

- 品牌換色
- 主視覺從紫金改成其他色系
- 全站統一轉換風格

### 5.2 單一活動 / 單一區塊微調

請優先調整：

- `data/siteContent.ts` 中對應卡片或 Banner 的 gradient 與內容

適合情境：

- 活動檔期換色
- Banner 針對特定活動做視覺差異
- 熱門活動卡片換背景色

## 6. 圖檔提供建議

### 6.1 放置位置

建議未來素材集中在：

```text
public/images/
public/images/banner/
public/images/logo/
public/images/events/
public/images/icons/
```

### 6.2 檔名規則

建議：

- 使用英文小寫
- 單字以 `-` 連接
- 避免中文
- 避免空白

範例：

```text
public/images/banner/home-hero-01.webp
public/images/banner/home-hero-01-mobile.webp
public/images/logo/logo-main.svg
public/images/events/event-million-race.webp
```

### 6.3 建議格式

- Logo：`svg`
- Banner / 活動主圖：`webp`
- 需要透明背景的素材：`png` 或 `svg`
- icon：`svg` 優先

### 6.4 建議比例

- Banner 主視覺：16:7 或接近比例
- 活動卡：16:9
- Logo：SVG 向量優先
- 小圖示：正方形為主

## 7. 美術與前端分工建議

### 美術提供

- 色票
- 主視覺圖
- 活動圖
- Logo / icon
- 卡片背景圖
- 按鈕樣式方向
- hover / active 規範

### 前端負責

- 圖檔掛載
- 響應式裁切與位置調整
- 路徑處理與 baseURL
- hover / active / mobile 行為實作
- 與現有元件整合

## 8. 目前網站較偏示意的部分

- Banner 多數仍是 CSS 視覺，不是正式大圖版型
- 活動卡目前偏資料驅動色塊，尚未全面圖像化
- FAQ / 會員 / 教學頁仍偏資訊卡片風格

## 9. 建議未來補齊的美術資產

- 正式 Logo 套件
- Banner 桌機 / 手機雙版本
- 活動縮圖與主視覺圖
- 快速入口 icon 規格
- 排行榜 rank badge 套件
- CTA 按鈕狀態規範
- 全站背景裝飾元素

## 10. 快速交接摘要

- 想換整站風格：先從 `assets/css/main.css` 色票下手
- 想換 Banner / 活動視覺：同步看 `components/BannerSlider.vue` 與 `data/siteContent.ts`
- 想換正式圖檔：建議放 `public/images/`
- 想讓畫面更像正式官網：優先補 Banner、活動圖、Logo、icon 與按鈕狀態規範
