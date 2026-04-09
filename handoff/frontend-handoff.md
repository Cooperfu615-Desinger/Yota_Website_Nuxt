# 巨亨 ONLINE 前端交接文件

更新日期：2026-04-09

這份文件提供給前端接手、維護與二次開發使用，目標是讓新同事可以快速理解目前這份 Nuxt 專案的結構、內容資料來源、互動邏輯、手機 / 桌機差異與部署方式。

## 1. 專案定位

- 專案類型：Nuxt 3 官網型靜態網站
- 主要用途：品牌展示、活動曝光、排行榜、會員展示、新手教學、客服導流
- 目前狀態：以前台展示與 mock 互動為主，尚未完整串接正式 API / 後台
- 內容管理方向：目前以 `data/siteContent.ts` 集中管理靜態內容，Banner 已先整理成接近未來後台欄位的格式

## 2. 技術堆疊

- Framework：Nuxt 3
- UI：Vue 3 + Tailwind CSS + 自訂 `assets/css/main.css`
- State：Nuxt `useState` + composables
- Routing：Nuxt file-based routing
- Font：Google Fonts `Noto Sans TC`
- Build：Nitro static preset
- 部署：GitHub Actions 自動 build 靜態成品

## 3. 常用指令

```bash
npm install
npm run dev
npm run build
npm run preview
```

補充：

- 本機開發網址通常為 `http://127.0.0.1:3000/Yota_Website_Nuxt/`
- `npm run build` 仍會在本機產生 `docs/`
- 目前正式部署已改成 GitHub Actions 自動產出，不再依賴手動提交 `docs/`

## 4. 重要目錄

```text
app.vue                    app 入口
assets/css/main.css        全站主題樣式、色票、按鈕、卡片、輪播、modal、懸浮介面
components/                共用 UI 元件
composables/               狀態與互動邏輯
data/siteContent.ts        集中內容資料來源
layouts/default.vue        全站 layout
pages/                     各頁面路由
public/                    靜態素材目錄
docs/                      本機 build 輸出成品
handoff/                   交接文件
```

## 5. 路由與頁面功能

- `/`：首頁，包含跑馬燈、Banner、快速入口、最新消息、熱門活動、熱門遊戲、排行榜快報
- `/events`：活動列表與活動詳情 modal
- `/leaderboard`：完整排行榜頁，含 Top 3 與 4-10 名
- `/deposit`：儲值與付款方式介紹
- `/tutorial`：新手教學、下載、試玩 modal
- `/support`：客服與 FAQ
- `/member`：會員資料、VIP、遊戲紀錄

## 6. 內容資料來源

目前首頁、活動、排行榜、FAQ、會員資料都集中在：

- `data/siteContent.ts`

這個檔案目前負責：

- 跑馬燈文案 `marqueeAnnouncements`
- Banner 輪播 `bannerSlides`
- 首頁快速入口 `homepage.quickLinks`
- 首頁熱門活動 `homepage.featuredEvents`
- 首頁最新消息 `homepage.news`
- 共用遊戲資料 `games`
- 排行榜資料 `leaderboard.tabs`
- 活動資料 `events`
- FAQ 資料 `faq`
- 會員預設資料與紀錄 `member`

### 6.1 Banner 資料格式

Banner 現在已整理成偏後台導向的資料格式：

- `ariaLabel`
- `imageAlt`
- `background`
- `imageSrc?`
- `mobileImageSrc?`
- `targetUrl?`

說明：

- 目前前台已移除 Banner 內文案與 CTA
- 現在是純圖片輪播
- 若未提供 `imageSrc`，會先以 `background` 漸層作為 fallback

這樣後續若要串接後台上傳，只要餵入 `desktop image / mobile image / alt / link` 即可

### 6.2 共用遊戲資料

`siteContent.games` 目前同時提供給：

- 首頁「熱門遊戲」區
- 教學頁「遊戲介紹」分頁

接手時若要修改遊戲名稱、RTP、色條或之後補封面圖，請優先從同一份 `games` 資料來源調整，不要分別在首頁與教學頁各改一份。

## 7. 全站狀態與互動邏輯

### 7.1 `composables/useAppState.ts`

負責：

- 登入 modal 開關
- 遊戲大廳 modal 開關
- 會員登入狀態
- 預設會員資料

目前另外已包含 localStorage 持久化：

- `login()` / `logout()` 會寫入或清除
  - `jh_isLoggedIn`
  - `jh_userInfo`
- `initFromStorage()` 會在客戶端還原登入狀態
- `layouts/default.vue` 會在 `onMounted()` 呼叫 `initFromStorage()`

這表示：

- 重新整理後登入狀態仍會保留
- 目前真正 mock 的部分是「驗證流程」，不是「登入狀態持久化」

### 7.2 `composables/useBannerSlider.ts`

負責：

- Banner 自動輪播
- 上一張 / 下一張
- 指示點切換
- 手機 touch 滑動

補充：

- Banner 目前沒有內文按鈕，只保留輪播本體
- 桌機主要靠左右箭頭切換
- 手機可用 touch 左右滑動

### 7.3 `composables/useLeaderboardTimer.ts`

負責：

- 排行榜快報的更新時間文案

## 8. 主要共用元件

- `components/AppHeader.vue`
  - 頂部導覽、Logo、手機登入後會員資訊列
- `components/AppBottomNav.vue`
  - 手機版底部導覽
- `components/AppFooter.vue`
  - Footer、手機版 APP 下載區、桌機 / 手機不同結構
- `components/AppMarquee.vue`
  - 跑馬燈
- `components/BannerSlider.vue`
  - 首頁 Banner，現為純圖片輪播
- `components/FloatingPanels.vue`
  - 左右懸浮介面、手機精簡懸浮按鈕
- `components/LoginModal.vue`
  - 登入 / 註冊彈窗
- `components/LobbyModal.vue`
  - 遊戲大廳 iframe / placeholder

## 9. 目前版本的互動規格

### 9.1 Banner

- 規格：`16:7`
- 目前為純圖片輪播
- 不再顯示 Banner 內文案與按鈕
- 未來預期由後台提供圖片與連結欄位

### 9.2 懸浮介面

位置：

- 左側固定為 `立即儲`
- 右側固定為 `立即玩 / 玩家資訊`

桌機規則：

- 未登入：右側懸浮卡顯示 `立即玩 + 登入/註冊`
- 已登入：右側懸浮卡顯示 `玩家資訊 + 立即玩`

手機規則：

- 左側永遠顯示 `立即儲`
- 右側永遠顯示 `立即玩`
- 未登入時：
  - Header 不顯示會員資訊
  - 右側 `立即玩` 點下去會開登入彈窗
- 已登入時：
  - Header 右上顯示會員資訊列
  - 右側 `立即玩` 點下去直接開遊戲大廳

實作補充：

- 手機按鈕使用：
  - `fp-mobile-btn-left`
  - `fp-mobile-btn-right`
- 透過 `lg:hidden` 控制只在手機顯示
- 左側 `立即儲` 的點擊規則與桌機一致：
  - 已登入前往 `/deposit`
  - 未登入先開 `LoginModal`
- 右側 `立即玩`：
  - 未登入開 `LoginModal`
  - 已登入開 `LobbyModal`

### 9.3 手機 Header

目前手機登入後，Header 右上會顯示：

- 玩家名稱
- VIP 等級
- 餘額
- 頭像

並且可連到 `/member`

### 9.4 Footer

`AppFooter.vue` 目前分成兩套結構：

- 桌機版：
  - 4 欄 grid
  - 品牌介紹
  - 快速連結
  - 聯絡方式
  - 社群媒體
- 手機版：
  - 精簡版
  - Logo
  - 社群按鈕
  - APP 下載
  - 法律聲明

補充：

- 社群按鈕目前有 5 個：
  - LINE
  - Facebook
  - Instagram
  - Telegram
  - X
- 目前多為 placeholder 連結
- 手機版 `padding-bottom` 已考量 bottom nav 高度

### 9.5 首頁內容與版寬

首頁目前主要內容順序為：

- 最新消息
- 熱門活動
- 熱門遊戲
- 排行榜快報

首頁使用 `.content-narrow` 來實現：

- Banner 全寬
- 內容區縮窄

`content-narrow` 目前為：

- `max-width: 860px`

之後若要新增首頁同風格區塊，或建立「主視覺全寬、內容單欄縮窄」的新頁面，可直接沿用這個 class。

## 10. 樣式與主題管理

全站主題主要集中在：

- `assets/css/main.css`

這裡管理的內容包含：

- `:root` 色票變數
- 全站背景色
- Header / Footer / Bottom Nav
- Banner 區
- 排行榜、活動卡、modal
- 懸浮介面與手機浮動按鈕
- 響應式細節

建議原則：

- 改整站主題色，優先改 `:root`
- 改 Banner / 懸浮卡 / CTA 視覺，優先找 `main.css`
- 改內容資料，優先改 `siteContent.ts`

## 11. 部署與路徑注意事項

設定位置：

- `nuxt.config.ts`

關鍵設定：

- `app.baseURL = '/Yota_Website_Nuxt/'`
- `nitro.output.publicDir = 'docs'`

代表：

- 這份專案部署在子路徑，不是 root path
- 所有靜態資源都必須考慮 baseURL
- 本機 build 會產生 `docs/`
- 正式部署由 GitHub Actions 自動 build 與發布，不再手動提交 `docs/`

## 12. 目前較偏 mock 的部分

- 登入流程仍是前端模擬
- 登入狀態持久化已是真實的 localStorage 實作
- 遊戲大廳 URL 仍是 placeholder
- 試玩 iframe 仍是示意用途
- 排行榜與活動資料目前是靜態資料
- Banner 雖然已改成圖片輪播結構，但目前尚未真正串接後台圖片來源

## 13. SEO 現況與補強清單

### 13.1 目前已完成

- 已採用 `ssr: true` + static build，搜尋引擎可讀取預渲染 HTML
- 各主要頁面已使用 `useSeoMeta`
- 首頁、活動、排行榜、儲值、教學、客服、會員頁都有基本 `title` / `description`
- 全站已設定 `lang="zh-TW"`、`charset`、`viewport`

### 13.2 目前狀態

- 目前 `robots` 仍為 `noindex, nofollow`
- 代表網站尚未進入正式收錄階段
- 現階段 SEO 屬於「基礎結構已鋪好，但尚未正式開放索引」

### 13.3 上線前建議補強項目

1. 調整 `robots`
   - 將 `noindex, nofollow` 改為正式可收錄設定
2. 補 `robots.txt`
   - 明確告知搜尋引擎可抓取路徑與 sitemap 位置
3. 補 `sitemap.xml`
   - 包含首頁、活動、排行榜、儲值、教學、客服等可收錄頁
4. 補 canonical
   - 為每個主要頁面設定正式 canonical URL
5. 補 Open Graph 完整欄位
   - `og:image`
   - `og:url`
   - `twitter:card`
   - `twitter:image`
6. 規劃結構化資料
   - 可考慮 `Organization`、`WebSite`、`BreadcrumbList`
7. 確認 favicon / OG 圖實體檔
   - 補到 `public/` 並確認部署後可正常讀取

### 13.4 前端接手建議順序

1. 等品牌文案、Banner 圖、OG 圖定稿
2. 先補 `robots.txt`、`sitemap.xml`、canonical
3. 再補各頁 `og:image` 與 social sharing 圖
4. 最後再把 `robots` 開放成可收錄

### 13.5 補充說明

- 目前不建議在前期階段先把 SEO 全部做死
- 因為 Banner、品牌素材、最終文案、分享圖仍可能變動
- 現在最適合的做法是保留基礎 meta，並把正式 SEO 補強工作交接給上線前的前端階段完成

## 14. 接手建議

### 14.1 短期

- 把 `deposit`、`tutorial` 也更完整整理進單一資料來源
- 為 Banner 建立更明確的 `desktop/mobile/link/sort/isActive` 型別
- 補 `lint`、`typecheck`

### 14.2 中期

- 串接正式 API
- 將 `siteContent.ts` 拆成多個 domain 檔案
- 建立素材與圖檔結構規範
- 把 Banner 圖片與活動圖改成正式後台管理流程

### 14.3 長期

- 導入 CMS 或完整內容後台
- 將 mock 互動改成真實登入 / 活動 / 排行榜資料流

## 15. 快速交接摘要

- 改內容：先看 `data/siteContent.ts`
- 改 Banner：先看 `components/BannerSlider.vue` + `data/siteContent.ts`
- 改懸浮介面：先看 `components/FloatingPanels.vue`
- 改手機登入後資訊列：先看 `components/AppHeader.vue`
- 改全站主題：先看 `assets/css/main.css`
- 改部署設定：看 `nuxt.config.ts`
