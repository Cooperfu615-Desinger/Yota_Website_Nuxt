# 保險箱 + 銀行活動 Tab — 設計文件

- **日期**：2026-06-15
- **範圍**：新增保險箱（側欄 + 頁面），銀行儲值頁新增「活動」Tab
- **狀態**：設計已確認，待實作

---

## 1. 目標

1. **保險箱**：左側導覽列新增「保險箱」項目，點擊進入專屬頁面，可在錢包與保險箱之間「存入 / 取出」金幣（照 APP 版附圖）。
2. **銀行活動 Tab**：儲值頁付款方式 Tab 末端新增「活動」，顯示儲值相關活動卡片（沿用現有活動頁資料）。
3. 銀行其餘維持現狀（單純顯示各種儲值方式）。

---

## 2. 保險箱

### 2.1 側欄導覽
`components/LobbySidebar.vue` 第三區（帳務群組）`section3` 於「銀行」之後新增：
```ts
{ to: '/lobby/vault', label: '保險箱', icon: '🔐' },
```

### 2.2 資料模型
- 錢包金幣（可用）＝ 現有 `userInfo.balance`
- 保險箱金幣（凍結）＝ `userInfo` 新增 `vaultBalance` 欄位
- `data/siteContent.ts` 的 `member.defaultUser` 加 `vaultBalance: 0`
- `composables/useAppState.ts`：`initFromStorage` 還原時，若舊 localStorage 無 `vaultBalance` 則補 `0`（向後相容）
- 存入/取出後更新 `userInfo` 並寫回 `localStorage`（沿用既有 `LS_USER_KEY`）

### 2.3 頁面與元件
- `pages/lobby/vault.vue`：`definePageMeta({ layout: 'lobby' })`，渲染 `<LobbyVaultContent />`
- `components/lobby/VaultContent.vue`（照附圖佈局）：
  - **左欄**：錢包金幣(可用)（大字、金色）→ 向下箭頭 → 保險箱金幣(凍結)；下方兩行說明：「存入保險箱的金幣可用於贈禮」「存入可避免誤觸遊玩時消耗」
  - **右欄**：頂部「存入 / 取出」分段切換 → 標題與說明依模式變動 → 金額輸入框（數字、含「MAX」鈕）→ 確認按鈕（金色）
  - **存入**：錢包 → 保險箱，金額須 `> 0` 且 `<= userInfo.balance`
  - **取出**：保險箱 → 錢包，金額須 `> 0` 且 `<= userInfo.vaultBalance`
  - MAX 鈕：依當前模式帶入可操作上限
  - 金額不合法時禁用確認鈕
  - 成功後：更新兩邊餘額、清空輸入、寫回 localStorage（可加簡短成功提示）
  - **未登入**：顯示「立即登入 / 註冊」按鈕呼叫 `openLogin()`（比照 `pages/lobby/member.vue`）

### 2.4 模式切換實作
單一元件內以 `mode = ref<'deposit' | 'withdraw'>('deposit')` 控制；金額 `amount`、可操作上限 `maxAmount` 為 computed（依 mode 取 balance 或 vaultBalance）。

---

## 3. 銀行「活動」Tab

### 3.1 付款方式 Tab
`components/shared/DepositContent.vue`：
- `PayMethod` 型別新增 `'activity'`
- `payMethods` 陣列末端新增 `{ key: 'activity', label: '活動', icon: '🎉' }`

### 3.2 資料來源（沿用活動頁資料）
- `data/siteContent.ts` 的 `EventItem` 介面新增 `deposit?: boolean`
- 既有「新手首儲禮」(id 2) 標記 `deposit: true`
- 於 `events` 陣列補 1~2 筆儲值促銷（同一份資料，活動頁與銀行皆顯示），例如：
  - 「每週儲值回饋」：每週累積儲值回饋 15%
  - 「VIP 儲值加碼」：VIP 等級越高加碼越多
  - 皆設 `deposit: true`

### 3.3 活動 Tab 呈現
- 當 `payMethod === 'activity'`：隱藏「選擇儲值方案」「各付款表單」「確認儲值按鈕」等儲值流程區塊
- 改顯示活動卡片清單：`siteContent.events.filter(e => e.deposit)`，沿用活動頁卡片樣式（標題、副標、獎勵標籤、漸層/圖片）
- 卡片為展示性質（點擊可選擇導向活動頁或不動作；MVP 不套用加碼邏輯）

### 3.4 其餘付款方式
信用卡 / ATM / 超商 / 點數卡 + 方案選擇 + 確認按鈕維持現狀，僅在非「活動」Tab 時顯示。

---

## 4. 避開已知地雷
- 保險箱模式切換、銀行活動 Tab 皆為**頁面內條件渲染**，不使用 `<Teleport>`（避開 SSG hydration 地雷 #1）。
- 跨頁餘額狀態使用既有 `useAppState` 的 `userInfo`（`useState`），符合地雷 #5。
- spec/plan 放 `specs/`，不放 `docs/`（gitignore + dev 會清空）。

---

## 5. 邊界情況
- 錢包/保險箱餘額為 0 時，對應模式的確認鈕禁用、MAX 帶入 0。
- 輸入超過上限：自動夾到上限或顯示錯誤並禁用確認（採「夾到上限」較順手）。
- 未登入進保險箱：顯示登入引導，不顯示操作區。
- 舊 localStorage 無 `vaultBalance`：還原時補 0。
- 活動 Tab 無 `deposit` 活動時：顯示空狀態文案（理論上至少有「新手首儲禮」，不致為空）。

---

## 6. 驗證方式（本機 dev + 瀏覽器，無自動化測試）
1. 側欄出現「保險箱」，點擊進入 `/lobby/vault`。
2. 登入狀態：存入 100 → 錢包減、保險箱增；取出 50 → 反向；MAX 帶入上限；超額被夾。重整後餘額保留（localStorage）。
3. 未登入：保險箱頁顯示登入引導。
4. 銀行：付款 Tab 出現「活動」；切過去顯示儲值活動卡、隱藏儲值流程；切回其他 Tab 一切正常。
5. 無 console 錯誤、@click 正常（未踩 hydration 地雷）。

> 本機驗證註記：Nuxt CLI dev 的 `localhost`/`127.0.0.1`/`[::1]` 其中之一會回 HTTP 426，先 curl 試出回 200 的 host 再用瀏覽器存取。
