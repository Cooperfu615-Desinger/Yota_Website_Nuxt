# 巨亨 ONLINE 前端交接文件

更新日期：2026-05-05

這份文件提供給前端接手、維護與二次開發使用，目標是讓新同事可以快速理解目前這份 Nuxt 專案的結構、內容資料來源、互動邏輯、手機 / 桌機差異與部署方式。

## 1. 專案定位

- 專案類型：Nuxt 3 SSG 靜態網站
- 主要用途：品牌展示、活動曝光、排行榜、會員展示、新手教學、客服導流
- 目前狀態：以前台展示與 mock 互動為主，尚未完整串接正式 API / 後台
- 內容管理方向：目前以 `data/siteContent.ts` 集中管理靜態內容

> **本版本重大更新**：加入了獨立的「遊戲大廳平台」(`/lobby`)，採用全新的 Lobby Layout 與側邊欄架構，與官網（`/`）完全分離。

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
- 正式部署已改成 GitHub Actions 自動產出，不再依賴手動提交 `docs/`

## 4. 重要目錄

```text
app.vue                      app 入口
assets/css/main.css          全站主題樣式、色票、按鈕、卡片、輪播、modal、懸浮介面、大廳平台
components/                  共用 UI 元件
  AppHeader.vue              官網頂部導覽（含手機漢堡抽屜）
  AppFooter.vue              官網 Footer
  AppMarquee.vue             跑馬燈公告
  BannerSlider.vue           首頁輪播 Banner
  FloatingPanels.vue         左右懸浮介面（官網）
  LoginModal.vue             登入 / 註冊彈窗
  LobbyModal.vue             舊版遊戲大廳 modal（保留備用）
  LobbyHeader.vue            大廳平台頂部 Header
  LobbySidebar.vue           大廳平台左側側邊欄（三分區導覽）
  lobby/GameCard.vue         遊戲卡片元件（大廳遊戲格）
  lobby/GameGrid.vue         遊戲格列表（含分類 Tab）
  lobby/GameView.vue         遊戲頁面（Stake 風格：16:9 iframe + 說明）
  shared/DepositContent.vue  儲值共用內容（官網 & 大廳共用）
  shared/EventsContent.vue   活動共用內容
  shared/LeaderboardContent.vue 排行榜共用內容
  shared/SupportContent.vue  客服共用內容
  shared/TutorialContent.vue 新手教學共用內容
composables/                 狀態與互動邏輯
data/siteContent.ts          集中內容資料來源
layouts/
  default.vue                官網 layout
  lobby.vue                  大廳平台 layout（含 LobbyHeader、LobbySidebar、Web館按鈕）
pages/                       各頁面路由
  index.vue                  官網首頁
  events.vue                 活動頁
  leaderboard.vue            排行榜
  deposit.vue                儲值
  tutorial.vue               新手教學
  support.vue                客服
  member.vue                 會員中心
  h5.vue                     Web 版大廳預覽（layout: false，顯示預覽圖）
  lobby/
    index.vue                遊戲大廳主頁（遊戲格 + 遊戲視圖）
    member.vue               大廳玩家資訊
    bank.vue                 大廳銀行（儲值）
    inbox.vue                大廳站內信
    chat.vue                 大廳聊天室（三頻道）
    settings.vue             大廳設置
public/                      靜態素材目錄
  lobby.jpeg                 Web館預覽圖
docs/                        本機 build 輸出成品
handoff/                     交接文件
```

## 5. 路由與頁面功能

### 5.1 官網（使用 default layout）

- `/`：首頁，包含跑馬燈、Banner、快速入口、最新消息、熱門活動、熱門遊戲、排行榜快報
- `/events`：活動列表與活動詳情 modal
- `/leaderboard`：完整排行榜頁，含 Top 3 與 4-10 名
- `/deposit`：儲值與付款方式介紹
- `/tutorial`：新手教學、下載、試玩 modal
- `/support`：客服與 FAQ
- `/member`：會員資料、VIP、遊戲紀錄

### 5.2 遊戲大廳平台（使用 lobby layout）

各頁面均以 `definePageMeta({ layout: 'lobby' })` 指定佈局：

- `/lobby`：遊戲大廳主頁，含分類 Tab、24 款遊戲格、遊戲視圖（點擊後在頁內展開）
- `/lobby/member`：玩家資訊、VIP 進度條、遊戲紀錄、快捷操作、登出
- `/lobby/bank`：銀行儲值（複用 `SharedDepositContent`）
- `/lobby/inbox`：站內信，分類篩選（全部 / 系統 / 活動 / 帳務）+ 詳情 Modal
- `/lobby/chat`：聊天室，世界 / 私人 / 客服三頻道 Tab
- `/lobby/settings`：音效、通知、語言、版本資訊設定頁

### 5.3 特殊頁面

- `/h5`：`layout: false`，顯示 `public/lobby.jpeg` 預覽圖，作為「Web館」按鈕開啟的目標頁

## 6. 內容資料來源

主要內容集中在 `data/siteContent.ts`，包含：

- 跑馬燈文案 `marqueeAnnouncements`
- Banner 輪播 `bannerSlides`
- 首頁快速入口 `homepage.quickLinks`
- 首頁熱門活動 `homepage.featuredEvents`
- 首頁最新消息 `homepage.news`
- **共用遊戲資料 `games`（24 款，含 key / category / provider / rtp / color / badge）**
- **遊戲分類 `gameCategories`（7 個分類）**
- 排行榜資料 `leaderboard.tabs`
- 活動資料 `events`
- FAQ 資料 `faq`
- 會員預設資料與紀錄 `member`

### 6.1 GameItem 型別

```ts
interface GameItem {
  key: string       // URL 參數識別鍵
  name: string
  desc: string      // 短描述（遊戲格用）
  badge: string | null
  rtp: string
  color: string     // 卡片主色（暫時替代封面圖）
  category: string  // slots / baccarat / fish / dice / cards
  provider: string
}
```

### 6.2 Banner 資料格式

- `ariaLabel`、`imageAlt`、`background`、`imageSrc?`、`mobileImageSrc?`、`targetUrl?`
- 若未提供 `imageSrc`，以 `background` 漸層作為 fallback

## 7. 全站狀態與互動邏輯

### 7.1 `composables/useAppState.ts`

- 登入 modal 開關 `showLoginModal`
- 遊戲大廳 modal 開關 `showLobbyModal`
- 會員登入狀態 `isLoggedIn`
- 預設會員資料 `userInfo`（含 name / vip / balance）
- `login()` / `logout()` 寫入 / 清除 localStorage
- `initFromStorage()` 客戶端還原登入狀態
- `layouts/default.vue` 與 `layouts/lobby.vue` 都在 `onMounted()` 呼叫 `initFromStorage()`

### 7.2 大廳側邊欄狀態（跨元件共享）

使用 Nuxt `useState` 共享：

```ts
const sidebarMobileOpen      = useState('lobby-sidebar-mobile-open',      () => false)
const sidebarDesktopCollapsed = useState('lobby-sidebar-desktop-collapsed', () => false)
```

- `LobbyHeader` 的漢堡按鈕切換：手機切 `sidebarMobileOpen`，桌機切 `sidebarDesktopCollapsed`
- `LobbySidebar` 綁定這兩個 class 來控制動畫

### 7.3 `composables/useBannerSlider.ts`

- Banner 自動輪播、上下張、指示點、手機 touch 滑動

### 7.4 `composables/useLeaderboardTimer.ts`

- 排行榜快報更新時間文案

## 8. 主要共用元件

### 8.1 官網元件

| 元件 | 說明 |
|------|------|
| `AppHeader.vue` | 官網頂部 Header。桌機：中央 nav 連結列。手機：左側漢堡鍵 + 右側登入後用戶資訊（已移除 `AppBottomNav`，改由此處漢堡抽屜取代） |
| `AppFooter.vue` | 官網 Footer（桌機 4 欄 / 手機精簡版） |
| `AppMarquee.vue` | 跑馬燈 |
| `BannerSlider.vue` | 首頁純圖片輪播 Banner |
| `FloatingPanels.vue` | 左右懸浮介面（立即儲 / 立即玩 / 玩家資訊） |
| `LoginModal.vue` | 登入 / 註冊彈窗（需 `ClientOnly` 包裝） |

### 8.2 大廳平台元件

| 元件 | 說明 |
|------|------|
| `LobbyHeader.vue` | 大廳頂部 Header。左：漢堡 + Logo；右：登入後顯示 VIP 徽章 + 姓名 / 餘額 + 頭像，未登入顯示「登入 / 註冊」 |
| `LobbySidebar.vue` | 大廳左側側邊欄。三分區：遊戲大廳 / 活動+排行榜 / 個人區。手機收合為 overlay，桌機可收合為 icon-only（60px）|
| `lobby/GameCard.vue` | 遊戲卡片，顯示名稱、色條、badge、試玩 / 真錢按鈕 |
| `lobby/GameGrid.vue` | 遊戲格容器，含分類 Tab 過濾，`@play` 事件向上傳遞 |
| `lobby/GameView.vue` | 遊戲頁面（Stake 風格）：16:9 iframe + 控制列（試玩/真錢模式切換）+ 遊戲資訊（供應商、名稱、RTP、描述、規格表） |

### 8.3 共用內容元件（官網 & 大廳共享）

- `shared/DepositContent.vue`
- `shared/EventsContent.vue`
- `shared/LeaderboardContent.vue`
- `shared/SupportContent.vue`
- `shared/TutorialContent.vue`

官網頁面以 `<SharedXxxContent />` 為主體加 SEO meta，大廳子頁面直接使用 `definePageMeta({ layout: 'lobby' })` 後包裝相同元件。

## 9. 遊戲大廳平台架構

### 9.1 Layout（`layouts/lobby.vue`）

```
┌──────────────────────────────────┐
│          LobbyHeader             │ ← fixed，56px
├──────────────────────────────────┤
│ LobbySidebar │    <slot />       │ ← 大廳主內容
├──────────────────────────────────┤
│ lobby-footer（版權聲明）          │
└──────────────────────────────────┘
        [Web館按鈕]  ← fixed，Header 正下方右側
```

### 9.2 側邊欄三分區

```
遊戲大廳（/lobby）
─────────────────
活動（/lobby/events）
排行榜（/lobby/leaderboard）
─────────────────
個人資訊（/lobby/member）
銀行（/lobby/bank）
信箱（/lobby/inbox）
聊天（/lobby/chat）
設置（/lobby/settings）
─────────────────
官網首頁（/）
```

### 9.3 遊戲視圖（GameView）

- 遊戲卡點擊後，`/lobby/index.vue` 以 `v-if` 替換顯示 `<LobbyGameView>`
- Iframe 使用 `aspect-ratio: 16/9`，非全螢幕
- 控制列：全螢幕 icon / 品牌名 / 試玩模式 Tab / 真錢模式 Tab
- 下方資訊：供應商、遊戲名、RTP 標籤、遊戲描述、規格表
- 試玩：無需登入；真錢：未登入時觸發 LoginModal

### 9.4 Web館按鈕

- 位置：`layouts/lobby.vue`，`position: fixed; top: Header高度 + 8px; right: 12px`
- 點擊後以 `router.resolve('/h5').href` 另開新分頁
- 目前 `/h5` 顯示 `public/lobby.jpeg` 預覽圖

## 10. 官網手機導覽（重要更新）

### 10.1 `AppBottomNav` 已移除

`AppBottomNav.vue` 元件仍存在於 `components/` 但已從 `layouts/default.vue` 中移除，手機不再有底部導覽列。

### 10.2 AppHeader 手機漢堡抽屜

手機版 Header 左側新增漢堡鍵（`lg:hidden`），點擊後從左側滑出抽屜：

| 順序 | 項目 | 路由 |
|------|------|------|
| 1 | 💰 儲值 | `/deposit` |
| 2 | 🎉 活動 | `/events` |
| 3 | 🏆 排行榜 | `/leaderboard` |
| 4 | 📖 新手教學 | `/tutorial` |
| 5 | 🎧 客服中心 | `/support` |
| 6 | 🏠 回首頁 | `/` |

抽屜使用 `<ClientOnly><Teleport to="body">` 包裝，z-index 為 `300/301`（高於 FloatingPanels 的 220）。

### 10.3 手機 Header 右側

- **未登入**：顯示「登入 / 註冊」按鈕
- **已登入**：顯示玩家名稱 + VIP 等級 + 餘額 + 頭像，點擊連到 `/member`

## 11. 互動規格

### 11.1 Banner

- 規格：`16:7`，純圖片輪播，無文案與按鈕

### 11.2 懸浮介面（FloatingPanels）

| 狀態 | 左側 | 右側 |
|------|------|------|
| 桌機未登入 | 立即儲 | 立即玩 + 登入/註冊 |
| 桌機已登入 | 立即儲 | 玩家資訊 + 立即玩 |
| 手機（固定） | 立即儲按鈕 | 立即玩按鈕 |

- 左側「立即儲」：已登入 → `/deposit`；未登入 → LoginModal
- 右側「立即玩」：已登入 → `/lobby`；未登入 → LoginModal

### 11.3 大廳 Header 用戶卡（登入後）

```
[ VIP 3 ]  玩家888    [ 👤 ]
           $12,580
```

點擊整個 `.lobby-user-card` 跳轉 `/lobby/member`

## 12. 樣式與主題管理

全站主題集中在 `assets/css/main.css`，管理：

- `:root` 色票變數
- 全站背景、Header、Footer
- Banner、卡片、modal
- 懸浮介面
- **大廳側邊欄（`.lobby-sidebar`、`.lobby-nav-*`）**
- **大廳 Header（`.lobby-header`、`.lobby-user-card`）**
- **遊戲視圖（`.gv-*` 前綴）**
- **漢堡抽屜動畫（`drawer-overlay`、`drawer-slide`）**
- Web館按鈕（`.lobby-web-btn`，含脈衝動畫）

CSS 命名規則：
- 官網元件：原始 Tailwind + 少量自訂 class
- 大廳 Header：`.lobby-header-*`、`.lobby-user-*`
- 大廳側邊欄：`.lobby-sidebar`、`.lobby-nav-*`
- 遊戲視圖：`.gv-*`

## 13. 部署與路徑注意事項

- `app.baseURL = '/Yota_Website_Nuxt/'`
- `nitro.output.publicDir = 'docs'`
- 正式部署由 GitHub Actions 自動 build 與發布
- `docs/` 已加入 `.gitignore`，不手動提交

## 14. SSG 已知地雷（必讀）

| 地雷 | 說明 | 處理方式 |
|------|------|------|
| `<Teleport>` SSG mismatch | SSG 模式下 `<Teleport to="body">` 造成全站 `@click` 失效 | 一律包入 `<ClientOnly>` |
| `appManifest` build ID | Nuxt 3.9+ 預設開啟，導致版本衝突 → hydration 失敗 | `nuxt.config.ts` 永遠設 `appManifest: false` |
| `.nojekyll` | GitHub Pages 預設透過 Jekyll，會抑制 `_nuxt/` 目錄 | `generate` 指令自動 `touch docs/.nojekyll` |
| `useState` vs `ref` | SSG hydration 狀態不一致 | 跨元件共享狀態一律用 `useState` |

## 15. 目前較偏 mock 的部分

- 登入流程：前端模擬，localStorage 持久化已真實實作
- 遊戲 iframe URL：placeholder（`example.com/...`）
- 站內信、聊天室：mock 資料，尚未串接 WebSocket
- 排行榜、活動：靜態資料
- Jackpot 彩金（`/h5`）：前端隨機跳動模擬

## 16. 快速交接摘要

| 想做什麼 | 先看哪裡 |
|----------|----------|
| 改官網內容 | `data/siteContent.ts` |
| 改 Banner | `components/BannerSlider.vue` + `siteContent.ts` |
| 改懸浮介面 | `components/FloatingPanels.vue` |
| 改官網手機漢堡抽屜項目 | `components/AppHeader.vue > drawerLinks` |
| 改大廳遊戲列表 | `data/siteContent.ts > games` |
| 改大廳側邊欄 | `components/LobbySidebar.vue` |
| 改遊戲視圖樣式 | `assets/css/main.css > .gv-*` |
| 改 Web館目標頁 | `public/lobby.jpeg` 換圖 or `pages/h5.vue` |
| 改全站主題 | `assets/css/main.css > :root` |
| 改部署設定 | `nuxt.config.ts` |
