# 聊天介面玩家列表 — 設計文件

- **日期**：2026-06-15
- **範圍**：`pages/lobby/chat.vue` 聊天頁，新增世界頻道在線名單與私人頻道對話清單
- **狀態**：設計已確認，待實作

---

## 1. 目標

在現有聊天頁（世界 / 私人 / 客服三頻道）加入「玩家列表」：

- **世界頻道**：顯示「在線玩家」名單（在線名冊）
- **私人頻道**：顯示「對話 / 聯絡人」清單（主從導覽）
- **客服頻道**：維持現狀，不變

兩種列表語意不同：世界=在線名冊，私人=對話名單。

---

## 2. 資料模型（mock）

依專案慣例（文案/資料集中於 `data/siteContent.ts`），新增 `chat` 區塊：

```ts
chat: {
  // 世界頻道在線名冊
  onlinePlayers: [
    { id, name, avatar, vip, status }   // status: '在線' | '遊戲中' | '閒置'
  ],
  // 世界頻道訊息（沿用現有 mock）
  worldMessages: [ { id, user, avatar, text, time, self? } ],
  // 私人對話（主從導覽用）
  privateConversations: [
    { id, peer: { name, avatar, vip, status }, unread, messages: [ {...} ] }
  ],
  // 客服頻道訊息（沿用現有 mock）
  supportMessages: [ { id, user, avatar, text, time, self? } ],
}
```

- 執行期送出的訊息為 in-memory（push 進對應陣列），重整後重置——與目前行為一致。未來接 WebSocket 再替換資料來源。
- `onlinePlayers` 不含目前使用者本人（名冊只列其他玩家）。

---

## 3. 元件拆分

聊天頁加入抽屜、小卡、主從導覽後會明顯變大，拆成可重用小元件：

| 檔案 | 職責 |
|------|------|
| `pages/lobby/chat.vue` | 主控：頻道 Tab、抽屜開關、私人主從導覽狀態、跨頻道流程 |
| `components/lobby/ChatThread.vue` | 訊息列表 + 輸入框；props: `messages`，emit: `send`。世界 / 客服 / 私人對話共用 |
| `components/lobby/OnlineRoster.vue` | 世界在線名單抽屜內容；props: `players`，emit: `select`(player) |
| `components/lobby/PlayerCard.vue` | 玩家小卡（頭像/暱稱/VIP/狀態 +「私訊」鈕）；props: `player`，emit: `message` / `close` |
| `components/lobby/PrivateConvList.vue` | 私人對話清單（主檢視）；props: `conversations`，emit: `open`(conv) |

每個元件單一職責、透過 props / emit 溝通，可獨立理解與測試。

---

## 4. 互動流程

### 世界頻道
1. 頻道 Tab 列右側顯示「在線 N」鈕（N = `onlinePlayers.length`）。
2. 點「在線 N」→ 右側滑出名單抽屜，背景半透明遮罩；點遮罩或 ✕ 關閉。聊天區不變動。
3. 抽屜標題「在線玩家 N」，下方可捲動名單；每列：狀態點 + 頭像 + 暱稱 + VIP 徽章。
4. 點一列 → 彈出 `PlayerCard`（頁面內置中疊層）：頭像、暱稱、VIP、狀態、「私訊」鈕。
5. 點「私訊」→ 關閉卡片 + 抽屜，切換 `activeChannel = 'private'`，開啟（或新建）與該玩家的對話並進入對話檢視。

### 私人頻道（主從導覽）
- **清單檢視（預設）**：`PrivateConvList`，每筆＝頭像(含狀態點) + 暱稱 + 最後一句 + 時間 + 未讀數徽章。
- 點一筆 → **對話檢視**：頂部返回鍵「‹」 + 對方暱稱，主體為 `ChatThread`。
- 返回鍵 → 回清單，並清除該對話 `unread`。
- 空清單 → 引導文案「還沒有私訊，從世界頻道點玩家開始聊天」。
- 由世界頻道「私訊」進入且無既有對話時 → 在 `privateConversations` 新建一筆並直接進入對話檢視。

### 客服頻道
維持現狀：單一 `ChatThread`，無名單、無抽屜。

---

## 5. 避開已知地雷

- **不用 `<Teleport>`**：抽屜與小卡都以聊天頁內 `absolute` 定位疊層呈現（聊天頁本身已滿版），直接繞過 SSG hydration 地雷（地雷 #1）。
- **狀態範圍**：跨頻道流程（私訊跳轉、抽屜開關、主從導覽）皆在 chat 頁內，用元件區域 `ref` 即可，非跨元件共用，無需 `useState`。

---

## 6. 邊界情況

- 在線名冊不含本人。
- 私人對話清單為空 → 顯示引導空狀態。
- 對未讀：mock 預設帶數筆 `unread`，進入對話即清零。
- 重整後 in-memory 訊息重置（符合現有行為，明確記錄）。

---

## 7. 驗證方式

沿用本機 dev + 瀏覽器 preview 手動實測（專案無自動化測試框架）：

1. 進入 `/lobby/chat`，世界頻道點「在線 N」→ 抽屜開合正常。
2. 點名單玩家 → 彈小卡 → 點「私訊」→ 落在私人頻道該玩家對話。
3. 私人頻道清單 → 點對話進入 → 返回鍵回清單、未讀清零。
4. 客服頻道不受影響。
5. 確認無 console 錯誤、@click 事件正常（驗證未踩 hydration 地雷）。

> 本機驗證註記：Nuxt CLI dev 在 IPv6 `[::1]:3000` 會回 HTTP 426，須以 `127.0.0.1:3000` 存取。
