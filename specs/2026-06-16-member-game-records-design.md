# 個人資訊 — 遊戲紀錄查詢 設計文件

- **日期**：2026-06-16
- **範圍**：`pages/lobby/member.vue` 的「最近遊戲紀錄」改為可查詢的「遊戲紀錄」
- **狀態**：設計已確認，待實作

---

## 1. 目標

將原本固定的「最近遊戲紀錄」清單，改為可依日期區間查詢的「遊戲紀錄」：預設空白、提供開始/結束日期（限最近 30 天）、查詢後以精簡表格分頁顯示（每頁 10 行），分頁列可左右滑動切換。

---

## 2. 元件與放置

- 新增 `components/lobby/GameRecords.vue`（Nuxt 自動命名 `<LobbyGameRecords>`）。
- `pages/lobby/member.vue` 的「遊戲紀錄」區塊（現為 `historyItems` 清單）整塊替換為 `<LobbyGameRecords />`。
- member.vue 內 `historyItems` 若不再使用則一併移除其引用（資料檔 `siteContent.member.historyItems` 保留）。

---

## 3. 假資料（客戶端產生，避開 SSG hydration）

- 在 `onMounted` 內，以客戶端「今天」為基準產生約 **100 筆**紀錄，隨機分布於最近 **30 天**。
- 每筆型別：
  ```ts
  interface GameRecord {
    id: number          // 1..N
    time: number        // 時間戳（ms）
    game: string        // 遊戲名稱，取自 siteContent.games 的 name
    bet: number         // 投注額
    win: number         // 贏分（正=贏、負=輸、可為 0）
    balance: number     // 該局後錢包餘額
  }
  ```
- 產生規則（mock，合理即可）：`bet` 取常見面額（如 50/100/200/500/1000 隨機）；`win` 在 `-bet ~ +bet*數倍` 範圍隨機；`balance` 為由起始餘額累加各局 `win` 的累進值。
- 排序：依 `time` 由新到舊。
- **重要**：所有 `new Date()` / 隨機產生都在 `onMounted`（client-only）。SSR 階段結果為空 → 與 client 初始一致，不觸發 hydration mismatch。

---

## 4. 查詢區

- 兩個原生 `<input type="date">`：開始日期、結束日期。
- 日期界限（`onMounted` 設定，避免 build 日期與 client 不符）：
  - `max` = 今天（`YYYY-MM-DD`）
  - `min` = 今天 − 30 天
- 預設值：可預填 `min`（開始）與 `max`（結束），或留空由使用者選；採「預填最近 30 天區間」較順手。
- 「查詢」按鈕：
  - 驗證 `start <= end`；不符時禁用按鈕並顯示提示「開始日期不可晚於結束日期」。
  - 點擊後篩選 `startOfDay(start) <= record.time <= endOfDay(end)` 的紀錄，存入 `results`，並將分頁重置回第 1 頁、標記 `hasQueried = true`。

---

## 5. 結果表格（精簡表格）

- 查詢前（`hasQueried === false`）：顯示引導空狀態「請選擇日期區間後查詢」。
- 查詢後無資料：顯示「查無紀錄」。
- 有資料：表格欄位 **編號 / 遊戲名稱 / 投注額 / 贏分 / 錢包餘額**。
  - 一頁 10 行（`PAGE_SIZE = 10`）。
  - **編號**：篩選結果的連續序號（依排序後的整體位置，第 2 頁從 11 起）。
  - 投注額 / 餘額：`toLocaleString()`。
  - 贏分：正數綠色（前綴 `+`）、負數紅色、0 中性色。
  - 數字欄右對齊、遊戲名稱左對齊；欄位過寬時容器可橫向捲動（`overflow-x-auto`）。

---

## 6. 分頁列（可左右滑動）

- 位於表格下方。`totalPages = Math.ceil(results.length / PAGE_SIZE)`。
- 一條 `overflow-x-auto` 的水平頁碼列：前箭頭「‹」+ 所有頁碼按鈕 + 後箭頭「›」。
- 當前頁高亮（紫色漸層）；點頁碼跳該頁；箭頭往前/後一頁（到邊界禁用）。
- 切頁後將當前頁碼 `scrollIntoView`（水平置中），確保頁數很多時可見。
- 僅 `totalPages > 1` 時顯示分頁列。
- 新查詢時 `currentPage = 1`。

---

## 7. 邊界情況

- 未登入：遊戲紀錄屬已登入區塊內，沿用 member 現有「立即登入 / 註冊」導引，不另處理。
- 區間內無紀錄：顯示「查無紀錄」、不顯示分頁列。
- `start > end`：查詢鈕禁用 + 提示。
- 單頁（`totalPages === 1`）：不顯示分頁列。
- 日期超出 30 天界限：由 input `min`/`max` 限制；額外在查詢時夾限以防手動輸入。

---

## 8. 避開已知地雷
- 純元件 + 條件渲染，不使用 `<Teleport>`。
- 假資料與日期界限全在 `onMounted`（client-only）產生 → 不踩 SSG hydration 地雷。
- spec 放 `specs/`，不放 `docs/`。

---

## 9. 驗證方式（本機 dev + 瀏覽器）
1. 登入後進 `/lobby/member`，遊戲紀錄預設空白、顯示引導文字。
2. 選最近 30 天內一段區間 → 查詢 → 出現精簡表格（≤10 行）與分頁列。
3. 切頁（點頁碼 / 箭頭）正常；頁數多時分頁列可左右滑動、當前頁自動可見；編號跨頁連續。
4. 選一段無紀錄的區間 → 顯示「查無紀錄」。
5. start>end → 查詢鈕禁用 + 提示。
6. 日期選擇被限制在最近 30 天。
7. 無 console 錯誤、無 hydration mismatch、SSG 建置通過。

> 本機驗證註記：dev 的 `localhost`/`127.0.0.1`/`[::1]` 其一會回 426，先 curl 試出回 200 的 host。
