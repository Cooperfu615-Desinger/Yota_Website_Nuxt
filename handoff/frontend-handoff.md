# 巨亨 ONLINE 前端交接文件

更新日期：2026-04-06

這份文件提供給前端接手、維護與二次開發使用，目標是讓新同事可以快速理解這份 Nuxt 專案的結構、內容資料來源、互動邏輯、部署方式與後續擴充方向。

## 1. 專案定位

- 專案類型：Nuxt 3 官網型靜態網站
- 主要用途：品牌展示、活動曝光、排行榜、會員展示、新手教學、客服導流
- 部署方式：靜態輸出到 `docs/`，供 GitHub Pages 直接部署
- 專案特性：目前偏展示站與 mock 互動，尚未完整串接正式 API

## 2. 技術堆疊

- Framework：Nuxt 3
- UI：Vue 3 + Tailwind CSS + 自訂 `assets/css/main.css`
- State：Nuxt `useState` + composables
- Routing：Nuxt file-based routing
- Font：Google Fonts `Noto Sans TC`
- Build Output：Nitro static preset，輸出到 `docs/`

## 3. 常用指令

```bash
npm install
npm run dev
npm run build
npm run preview
```

補充：

- 本機開發網址通常為 `http://127.0.0.1:3000/Yota_Website_Nuxt/`
- 每次 `npm run build` 都會重新產生 `docs/`
- `docs/` 是 build 成品，不是前端原始碼

## 4. 重要目錄

```text
app.vue                    app 入口
assets/css/main.css        全站主題樣式、色票、按鈕、卡片、輪播、modal
components/                共用 UI 元件
composables/               狀態與互動邏輯
data/siteContent.ts        集中內容資料來源
layouts/default.vue        全站 layout
pages/                     各頁面路由
public/                    靜態素材
docs/                      build 後的靜態部署輸出
handoff/                   交接文件
```

## 5. 路由與頁面功能

- `/`：首頁，包含跑馬燈、Banner、快速入口、排行榜快報、熱門活動、最新消息
- `/events`：活動列表與活動詳情 modal
- `/leaderboard`：完整排行榜頁，含 Top 3 與 4-10 名
- `/deposit`：儲值與付款方式介紹
- `/tutorial`：新手教學、下載、試玩 modal
- `/support`：客服與 FAQ
- `/member`：會員資料、VIP、遊戲紀錄

## 6. 內容資料來源

目前首頁、活動、排行榜、FAQ、會員資料都集中在：

- `data/siteContent.ts`

這個檔案負責：

- 跑馬燈文案 `marqueeAnnouncements`
- Banner 輪播 `bannerSlides`
- 首頁快速入口 `homepage.quickLinks`
- 首頁熱門活動 `homepage.featuredEvents`
- 首頁最新消息 `homepage.latestNews`
- 排行榜資料 `leaderboard.tabs`
- 活動資料 `events`
- FAQ 資料 `faq`
- 會員預設資料與紀錄 `member`

建議原則：

- 改文案或靜態展示資料，優先改 `siteContent.ts`
- 頁面與元件主要只處理顯示與互動，不要把大段文案重新散落回 template

## 7. 全站狀態與互動邏輯

### 7.1 `composables/useAppState.ts`

負責：

- 登入 modal 開關
- 遊戲大廳 modal 開關
- 會員登入狀態
- 預設會員資料

### 7.2 `composables/useBannerSlider.ts`

負責：

- Banner 自動輪播
- 上一張 / 下一張
- 指示點切換
- 手機 touch 滑動

補充：

- 目前有手機 touch 滑動
- 桌機主要靠左右箭頭切換
- 若要補桌機拖曳切換，需要額外加 mouse / pointer 事件

### 7.3 `composables/useLeaderboardTimer.ts`

負責：

- 排行榜快報的更新時間文案

## 8. 主要共用元件

- `components/AppHeader.vue`
  - 頂部導覽、Logo、登入按鈕
- `components/AppBottomNav.vue`
  - 手機版底部導覽
- `components/AppMarquee.vue`
  - 跑馬燈
- `components/BannerSlider.vue`
  - 首頁主 Banner
- `components/LoginModal.vue`
  - 登入 / 註冊彈窗
- `components/LobbyModal.vue`
  - 遊戲大廳 iframe / placeholder

## 9. 樣式與主題管理

全站主題主要集中在：

- `assets/css/main.css`

這裡管理的內容包含：

- `:root` 色票變數
- 全站背景色
- 卡片、邊框、按鈕樣式
- Banner 區、排行榜、modal 的視覺
- 響應式細節

建議原則：

- 改整站主題色，優先改 `:root`
- 改單一視覺區塊，先找對應 class 與區塊 CSS
- 如果是頁面內獨立卡片色塊，可搭配 `siteContent.ts` 的 gradient 資料一起調整

## 10. 部署與路徑注意事項

設定位置：

- `nuxt.config.ts`

關鍵設定：

- `app.baseURL = '/Yota_Website_Nuxt/'`
- `nitro.output.publicDir = 'docs'`

代表：

- 這份專案不是部署在 root path，而是子路徑
- 所有靜態資源路徑都要考慮 baseURL
- 真正部署時應以 `docs/` 內容為準

## 11. 目前較偏 mock 的部分

- 登入流程仍是前端模擬
- 遊戲大廳 URL 仍是 placeholder
- 試玩 iframe 仍是示意用途
- 排行榜與活動資料目前是靜態資料

## 12. 後續接手建議

### 12.1 短期

- 把 `deposit`、`tutorial` 也整理進單一資料來源
- 抽更多共用卡片元件，減少頁面 template 重複
- 補 `lint`、`typecheck`

### 12.2 中期

- 串接正式 API
- 將 `siteContent.ts` 拆成多個 domain 檔案
- 建立素材與圖檔結構規範

### 12.3 長期

- 導入 CMS 或後台內容管理
- 將 mock 互動改成真實登入 / 活動 / 排行榜資料流

## 13. 快速交接摘要

- 改內容：先看 `data/siteContent.ts`
- 改全站視覺：先看 `assets/css/main.css`
- 改互動：先看 `composables/` 與對應 `components/`
- 改頁面結構：看 `pages/`
- build 後：檢查 `docs/` 是否正常產出
