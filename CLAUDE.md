# 巨亨ONLINE — 專案 CLAUDE.md

## 專案概覽

線上娛樂城官方網站，Nuxt 3 SSG 靜態生成，部署至 GitHub Pages。

- **線上網址**：https://cooperfu615-desinger.github.io/Yota_Website_Nuxt/
- **GitHub Repo**：https://github.com/Cooperfu615-Desinger/Yota_Website_Nuxt
- **Figma 設計系統**：https://www.figma.com/design/wdwXucuJaRxQTAW5jxwP9j/巨亨ONLINE-設計系統

---

## 技術棧

| 項目 | 版本 / 說明 |
|------|-------------|
| Nuxt | 3.21.x（SSG 模式） |
| Vue | 3.4.x |
| CSS 框架 | Tailwind CSS + 自訂 `assets/css/main.css` |
| 字型 | Noto Sans TC（Google Fonts） |
| 部署 | GitHub Pages，`main` 分支，`docs/` 目錄 |
| baseURL | `/Yota_Website_Nuxt/` |

---

## 開發環境

### npm 路徑（此機器）
```bash
# 系統 PATH 未包含 npm，每次執行需指定完整路徑
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run dev
```

### 常用指令
```bash
# 本機開發
npm run dev

# 靜態產生（部署前必跑）
npm run generate
# → 自動輸出至 docs/，並建立 docs/.nojekyll

# 部署
git add docs/ && git commit -m "deploy: ..." && git push
# → GitHub Pages CDN 約需 5–10 分鐘更新
```

---

## 已知地雷 ⚠️

### 1. `<Teleport>` 必須包在 `<ClientOnly>` 裡
**原因**：SSG 模式下 `<Teleport to="body">` 在 hydration 時造成 mismatch，Vue 靜默失敗，導致全站所有 `@click` 事件無法綁定。

**已修復位置**：`layouts/default.vue`
```html
<ClientOnly>
  <LoginModal />
  <LobbyModal />
</ClientOnly>
```

**規則**：任何新增的 Modal 若使用 `<Teleport>`，一律包入 `<ClientOnly>`。

---

### 2. 禁止啟用 `experimental.appManifest`
**原因**：Nuxt 3.9+ 預設開啟此功能。每次 `nuxt generate` 產生新 build ID，客戶端偵測版本不符後強制 `reload`。GitHub Pages CDN 快取尚未更新時，舊 HTML 引用舊 chunk 名稱 → 404 → hydration 失敗 → 全站互動消失。

**此外**：dev 模式下 `#app-manifest` 虛擬模組因 `output.publicDir = 'docs'` 而無法解析，同樣導致 client bundle 損壞。

**nuxt.config.ts 固定設定**：
```ts
experimental: {
  appManifest: false,  // 永遠保持 false，勿移除
},
```

---

### 3. `docs/.nojekyll` 必須存在
**原因**：GitHub Pages 預設透過 Jekyll 處理，Jekyll 會抑制 `_nuxt/` 目錄（以 `_` 開頭），導致所有 JS 無法被存取。

**已自動化**：`package.json` 的 `generate` 指令已加入 `&& touch docs/.nojekyll`，每次 build 自動建立。

---

### 4. `docs/` 不監看（dev server）
**nuxt.config.ts 固定設定**：
```ts
nitro: {
  watchOptions: {
    ignored: ['**/docs/**'],  // 避免 dev 反覆 reload
  },
},
```

---

### 5. `useState` 跨元件共用狀態
SSG 模式下請使用 `useState`（Nuxt composable），不要用 `ref`，避免 hydration 狀態不一致。

---

## 專案結構

```
巨亨ONLINE-Nuxt/
├── assets/css/main.css      # 全域樣式、設計 token（CSS 變數）
├── components/
│   ├── AppHeader.vue        # 頂部導覽（含登入按鈕）
│   ├── AppBottomNav.vue     # 手機底部導覽列
│   ├── AppMarquee.vue       # 跑馬燈公告
│   ├── BannerSlider.vue     # 首頁輪播 Banner
│   ├── LoginModal.vue       # 登入/註冊彈窗（需 ClientOnly）
│   └── LobbyModal.vue       # 遊戲大廳彈窗（需 ClientOnly）
├── composables/
│   └── useAppState.ts       # 全域狀態（userInfo、showLoginModal 等）
├── data/
│   └── siteContent.ts       # 所有文案資料集中管理（單一資料來源）
├── layouts/
│   └── default.vue          # 主 layout，含 ClientOnly Modal 包裝
├── pages/                   # 各頁面路由
│   ├── index.vue            # 首頁
│   ├── events.vue           # 活動頁
│   ├── leaderboard.vue      # 排行榜
│   ├── tutorial.vue         # 新手教學 / APP 下載
│   ├── deposit.vue          # 儲值
│   ├── support.vue          # 客服
│   └── member.vue           # 會員中心
├── figma-scripts/           # Figma Plugin API 腳本（設計交付用）
│   ├── 00_run_all.js        # 執行說明
│   ├── 01_events_page.js    # 活動頁 Layout Frame
│   ├── 02_leaderboard_page.js # 排行榜 Layout Frame
│   ├── 03_homepage.js       # 首頁 Layout Frame
│   └── 04_tutorial_page.js  # 新手教學 Layout Frame
└── docs/                    # GitHub Pages 靜態輸出（勿手動修改）
    └── .nojekyll            # 必須存在，阻止 Jekyll 抑制 _nuxt/
```

---

## 設計系統

### CSS 設計 Token（`main.css`）
```css
--color-bg:           #0F0020   /* 主背景 */
--color-bg-card:      #1A0A2E   /* 卡片背景 */
--color-border:       rgba(168,85,247,0.2)  /* 紫色邊框 */
--color-gold:         #F5C842   /* 金色強調 */
--color-gold-dark:    #D97706
--color-purple-glow:  #A855F7
--color-purple-light: #C084FC
--color-text:         #F3E8FF
--color-text-muted:   rgba(196,181,213,0.6)
```

### Figma 設計系統檔案
- **File Key**：`wdwXucuJaRxQTAW5jxwP9j`
- **頁面**：
  - `🎨 設計規範`：色彩系統 + 字體系統
  - `🧩 元件庫`：按鈕、卡片、Tab、徽章、輸入框
  - `📱 頁面參考`：各頁面 Layout Frame（由 figma-scripts/ 產生）

### Figma MCP 工具
```
mcp__f9553461-75b6-424d-b7eb-2c118c433eb8__use_figma
```
需要 Figma Desktop App 開啟目標檔案才能執行。Starter 方案每日有呼叫上限。

---

## 資料管理

所有文案、資料集中在 `data/siteContent.ts`，各元件 import 使用：
```ts
import { siteContent } from '~/data/siteContent'
```

包含：跑馬燈、Banner 輪播、快速入口、排行榜、最新消息、活動列表、FAQ、會員資料等。

---

## 部署 SOP

```bash
# 1. 修改程式碼後
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate

# 2. 確認 .nojekyll 存在
ls docs/.nojekyll

# 3. Commit & Push
git add docs/ [修改的src檔案]
git commit -m "fix/feat: 說明"
git push origin main

# 4. 等待 CDN 更新（約 5–10 分鐘）
# 5. 測試：https://cooperfu615-desinger.github.io/Yota_Website_Nuxt/
```

---

## Bug 修復歷史（重要決策紀錄）

| 日期 | 問題 | 根因 | 修復方式 | Commit |
|------|------|------|----------|--------|
| 2026-04-06 | 全站按鈕無反應（首次） | `<Teleport>` SSG hydration mismatch | Modal 包入 `<ClientOnly>` | `9c09819` |
| 2026-04-07 | 按鈕無反應循環復發 | `appManifest` build ID 版本衝突 + `.nojekyll` 缺失 | 停用 appManifest、自動建立 .nojekyll | `3fdf3d2` |
