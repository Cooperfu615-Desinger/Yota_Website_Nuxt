# 前後端 API 差異比對（Gap Analysis）

- 建立日期：2026-07-29
- 比對對象 A：`specs/2026-07-29-api-inventory.md`（從前端 commit `aa326bd` 反推的需求）
- 比對對象 B：`~/Downloads/API_list.md`（後端現況，50 支已開發端點 + 2026.07.27 待補時程）
- 目的：找出**遺漏、衝突、與文件本身的問題**
- 原則：後端文件未提及者一律標 `not_stated`，不臆測其實作

---

## 0. 結論摘要

後端已開發 **50 支端點 / 9 個模組**。與前端需求比對後：

| 判定 | 數量 | 說明 |
|---|---|---|
| ✅ 已覆蓋且對齊 | 2 個領域 | 信箱、客服工單 |
| 🟡 已開發但有衝突 | 4 個領域 | 會員資料、頭像、三方綁定、VIP |
| 🔵 已排入時程 | 8 個項目 | 儲值/每日任務/優惠碼/獎勵卡/排行榜/遊戲/交易紀錄/黑名單/保險箱/兌換 |
| 🔴 **完全缺席**（無端點、且不在時程） | **9 個領域** | 見 §1 |
| ⚠️ 文件本身的問題 | 6 項 | 見 §5 |

**最高風險三件事**：
1. **沒有任何 WebSocket / 即時推送規劃** — 聊天與客服工單的核心語意成立不了（§1.1）
2. **贈禮（雙向確認）完全缺席** — 最近 5 個 commit 的主線功能，後端無端點也不在時程（§1.2）
3. **公開的「忘記密碼」流程完全缺席** — 前端有完整四步驟 UI，後端只有需登入的改密碼（§1.3）

---

## 1. 🔴 完全缺席：無端點、且不在 2026.07.27 時程內

### 1.1 即時推送（WebSocket）— 最高優先

後端 `message` 與 `customerservice` 模組**全部是 REST**，沒有任何推送通道。但前端這三處的資料語意**只有推送才能成立**：

| 需求 | 為什麼 REST 不夠 | 前端證據 |
|---|---|---|
| 私訊新訊息 | `PrivateConversation.unread` **只有歸零路徑、沒有增加路徑** — 增量只可能來自推送 | `chat.vue:75,229`（僅歸零） |
| 對方主動開啟新對話 | 前端只在自己主動時 `unshift` 新 conv | `chat.vue:215-224` |
| 客服回覆 | `receiveSupportMessage` 註解明寫 "Reserved for API/WebSocket integration"，且**目前沒有任何呼叫端** | `useSupportTicketState.ts:202-224` |
| 工單 `ongoing → closed` | 前端**沒有任何程式路徑**做此轉移，只能由客服端推送 | 全檔無此路徑，僅 seed 資料有（`siteContent.ts:973`） |
| 在線名單 status 變動 | `在線/遊戲中/閒置` 是即時態，目前是一次性快照 | `chat.vue:153` |

**後端文件對此完全沒有著墨**：協定、鑑權、重連策略、事件命名皆 `not_stated`。
建議至少定義 5 個事件：`private.message`、`conversation.created`、`support.message`、`support.ticket.closed`、`roster.update`。

> 退而求其次若走輪詢，也必須明確定義輪詢端點與頻率 — 目前兩份文件都沒有。

---

### 1.2 贈禮（雙向確認流程）— 6 支端點全缺

前端已完整實作（`useGiftState.ts`、`utils/giftRequest.ts`、`GiftRequestList.vue`，含測試 `tests/giftRequest.test.mjs`），是最近 5 個 commit 的主線（`ae3093d`~`03e5821`）。後端**既無端點，時程表也沒有這一項** — 時程只有「11. 保險箱 12. 兌換」（8/31~9/4）。

需確認：**保險箱項目是否已包含贈禮？** 若否，這是明確遺漏。

| 缺的端點 | 前端來源 |
|---|---|
| `GET /gifts/requests` | `useGiftState.ts:100-107` |
| `GET /gifts/quota`（今日剩餘次數/上限/費率） | `useGiftState.ts:12,189` |
| `POST /gifts/requests`（保險箱預扣） | `useGiftState.ts:168-207` |
| `POST /gifts/requests/{id}/accept` | `useGiftState.ts:235-241` |
| `POST /gifts/requests/{id}/reject` | `useGiftState.ts:242-244` |
| `POST /gifts/requests/{id}/cancel` | `useGiftState.ts:225-244` |

**另需後端排程 job**：贈禮 168 小時逾期退款目前靠前端每 60 秒輪詢（`VaultContent.vue:157-160`）— 關掉瀏覽器就不會逾期退款。

**關聯線索**：後端 VIP 端點回傳 `p2p_fee_rate`（P2P 手續費率），前端贈禮手續費率寫死 0.05（`utils/vaultTransfer.ts:1`）。**這兩個很可能是同一件事** — 需確認費率是否應改由 `/vip/levels` 取得，若是，前端的凍結費率快照（`GiftRequest.feeRate`）語意也要跟後端對齊。

---

### 1.3 忘記密碼 / 密碼復原（公開流程）— 4 支端點全缺

後端只有 `PUT /account/password`（**需登入**的修改密碼）。前端有完整的**未登入**復原流程，四步驟 + 兩個分支：

| 缺的端點 | 前端來源 |
|---|---|
| `POST /auth/recovery/identify`（回 branch: `phone｜social｜unbound` + 遮罩手機） | `LoginModal.vue:268-304` |
| `POST /auth/recovery/send-code` | `LoginModal.vue:313-319` |
| `POST /auth/recovery/verify` | `LoginModal.vue:328-337` |
| `POST /auth/recovery/reset` | `LoginModal.vue:339-368` |

前端已定義三種分支結果：綁社群 → 引導社群登入；未綁手機 → 導向客服（`LoginModal.vue:376-380`）；已綁手機 → 走簡訊驗證。**後端需支援此分支判定。**

---

### 1.4 手機驗證碼登入 — 2 支端點缺

後端 `auth` 只有帳密登入與三方登入。前端有完整手機登入（`LoginModal.vue:194-215`）：`POST /auth/phone/send-code`、`POST /auth/phone/verify`。

後端有 `GET /system/dial-codes`（手機區碼清單），註記用途是「會員手機區碼下拉用」— 顯示手機只用於**會員資料**而非登入。**需確認手機登入是否為預期功能**，若是則兩支端點缺；若否則前端要移除該入口。

---

### 1.5 訪客登入 — 1 支端點缺

前端有訪客登入（`LoginModal.vue:186-192`），`authProvider` 型別也包含 `'guest'`（`useAppState.ts:6`）。後端無對應端點。需確認是否保留此功能。

---

### 1.6 好友系統 — 3 支端點缺

時程表有「10. 黑名單」（8/24~8/28），但**沒有好友**。前端 `useSocialState.ts` 是好友 + 黑名單**同一個 composable**，`PlayerCard.vue:31-39` 有加好友按鈕，贈禮選人也依賴好友清單（`PlayerSearchModal.vue:7-43`）。

缺：`GET /me/friends`、`POST /me/friends`、`DELETE /me/friends/{playerId}`。

**待決策**：前端目前是**單方面立即加入**，沒有 pending/accept 狀態（`useSocialState.ts:33-45`）。若後端要做雙向同意，前端需改。

---

### 1.7 世界頻道（公開聊天）— 2 支端點 + 推送缺

後端 `message` 模組是 **conversation-based**（`POST /message/conversation` = 建立或取得玩家對話），只涵蓋**私訊**。前端的世界頻道是**完全不同的資料流**：

| | 世界頻道 | 私人對話（後端已有） |
|---|---|---|
| 資料結構 | 單一全域訊息串 | per-conversation |
| 收件人 | 無 | peer |
| unread | 無 | 有 |
| 黑名單 | 不過濾（訊息仍顯示，只是點不開名片） | 禁止送訊 |

缺：`GET /chat/world/messages`（含分頁 cursor）、`POST /chat/world/messages`、以及廣播推送。

---

### 1.8 玩家目錄：在線名單 / 搜尋 / 公開檔案 — 3 支端點缺

| 缺的端點 | 前端來源 | 目前作法 |
|---|---|---|
| `GET /chat/online` 在線名單 | `chat.vue:153`、`OnlineRoster.vue:4` | 全量陣列，無分頁 |
| `GET /players/search?q=` | `OnlineRoster.vue:21-29`、`PlayerSearchModal.vue:45-53` | **前端全量 filter**，量大即崩 |
| `GET /players/{playerId}` 公開檔 | `PlayerCard.vue:4` | mock |

`ChatPlayerProfile` 需要的欄位（`siteContent.ts:35-46`）：`playerId`、`account`、`name`、`avatar`、`vip`、`level`、`status`、`bio`、`recentGames`、`isFriend?`。
**注意 `recentGames`** — 玩家卡要顯示對方最近遊玩的 3 款遊戲，這是跨模組資料（隱私政策 `not_stated`）。

**「誰在線」的定義、心跳、離線移除**：兩份文件皆 `not_stated`。

---

### 1.9 檢舉玩家 — 需確認是否由客服工單承接

前端把檢舉做成一筆 `report` 類客服工單 + `reportContext`（`useSupportTicketState.ts:236-270`）。後端 `POST /customerservice/order` 是否接受 `reportContext`（`playerId`/`account`/`name`/`avatar`/`reason`/`detail`）、`question-categories` 是否包含 `report` 分類 — 皆 `not_stated`。

**另一個必須修的**：前端檢舉理由是**硬編碼中文字串陣列** `['不當言論','騷擾行為','疑似詐騙','冒用身份','其他']`（`ReportPlayerModal.vue:9`）。後端有 `GET /system/types`（enum 對照），**檢舉理由應改為 reason code 從此端點取得**。

---

### 1.10 其他缺口（較次要）

| 項目 | 前端來源 | 說明 |
|---|---|---|
| 活動報名 | `EventsContent.vue:21-28` | 前端只設一個提示字串，**「玩家是否已報名」在前端完全缺席**；後端也無端點 |
| 遊戲啟動 launch token | `GameView.vue:33-37` | 時程有「遊戲相關」，需確認是否含一次性啟動 URL |
| 錢包餘額 | `useAppState.ts:38-44` | 後端 `/account/info` 是否含四錢包餘額 `not_stated` |
| 推薦碼 | `LoginModal.vue:49-51` | `POST /auth/register` 未提及此參數 |
| 條款版本 | `LoginModal.vue:91-93` | 註冊需審閱條款，後端無 `termsVersion` 參數 |

---

## 2. 🟡 已開發但與前端衝突（需要一方改）

### 2.1 email 可否重複修改 — 直接衝突

- **後端**：`PUT /account/profile` —「email/phone 一旦有值即**鎖定**」
- **前端**：`member.vue:45-48` 讓使用者**自由編輯 email**，且無格式驗證；phone 是 `disabled` 唯讀（`member.vue:84`）

前端會送出一個後端必然拒絕的請求，且沒有對應的錯誤 UI。**前端需改為：email 有值後轉唯讀，並提供「首次設定」入口。**

---

### 2.2 頭像機制 — 資料模型不相容

| | 前端 | 後端 |
|---|---|---|
| 來源 | **硬編碼 12 個 emoji**（`member.vue:17`） | `GET /system/default-avatars` 素材清單 |
| 識別 | `avatarId` = 陣列 index + 1（1–12） | 素材 ID |
| 上傳 | **無上傳 UI** | `PUT /account/avatar` 支援檔案上傳（file > asset 優先序） |
| 註冊 | 前端不處理 | **後端隨機賦予** |
| 解鎖規則 | `avatarId >= 10 需 VIP5`（`member.vue:50-51`） | `not_stated` |

**兩件事要決**：(a) 前端改用 API 素材清單（emoji 改成圖片資產）；(b) **VIP5 解鎖規則後端是否實作** — 若只在前端擋，改 localStorage 即可繞過。

---

### 2.3 三方綁定 / 解綁 — 安全規則缺失

- **後端**：`DELETE /account/oauth/{provider}` —「無本地密碼且為最後一個綁定時**拒絕**」
- **前端**：`member.vue:56-63` — 750ms 假延遲後**直接 toggle**，無任何驗證、無錯誤處理

前端需補：解綁前置檢查、後端拒絕時的錯誤 UI。另外前端解綁手機也不需驗證碼 — 後端是否要求 `not_stated`。

---

### 2.4 三方登入流程 — 前端等同要重寫

- **後端**：完整 OAuth（取授權 URL → callback → 未註冊回 **404 引導註冊** → `/auth/oauth/register` 補資料），且有 **App 系統瀏覽器 + poll_id 輪詢**模式
- **前端**：`LoginModal.vue:217-232` 是 700ms 假 connecting → 900ms confirm，**沒有 redirect、沒有 token 交換、沒有「未註冊」分支**

前端社群登入需依後端流程重寫，並新增「三方登入但未註冊 → 補資料建號」的 UI 分支。

---

### 2.5 VIP 資料結構 — 部分對齊，門檻仍缺

- **好消息**：後端 `/vip/levels` 已公開 `rebate_rate` / `p2p_fee_rate`，對得上前端的 `rebate` / `feeDiscount`（`siteContent.ts:158-168`）。**但前端存的是字串**（`'0.6%'`），API 若回數值，前端需改格式化。
- **仍缺**：前端 `upgradeRequirement` / `maintainRequirement` 目前只有**人類可讀文案**，沒有結構化門檻數字（§我方 §2）。後端 `/vip/levels` 是否含門檻數值 `not_stated`。
- `/account/info` 註明「含 VIP **累積投注**」，但前端 `vipUpgrade` 需要**累積儲值 + 累積投注兩項**（`siteContent.ts:583-586`）。**累積儲值 `not_stated`。**

---

### 2.6 信箱 — 小幅不一致（易修）

| 項目 | 前端 | 後端 |
|---|---|---|
| 已讀 | 獨立動作（`useMailboxState.ts:22`） | **讀信詳情即已讀**（`GET /mailbox/{id}`） |
| 刪除 | 單筆（`:23`） | **批次**（`DELETE /mailbox` body 帶 `mail_user_ids`） |
| 未讀徽章 | **無消費者** | 清單含未讀徽章 |
| id | `number` | `mail_user_id` |

前端改動不大，但**未讀徽章目前沒有任何 UI 在用** — 後端已提供，前端應補上。

---

### 2.7 客服工單 — 對齊良好，但兩處規則要確認

後端 6 支端點與前端需求**高度吻合**（建單、發訊、標記已讀、清單含未讀數、詳情、問題分類）。需確認：

1. **`status` 列舉是否為 `ongoing` / `closed`**（前端只認這兩個，`siteContent.ts:75`）；`closed` 是終態、前端輸入框唯讀（`chat.vue:430`）
2. **「同時最多 5 筆 ongoing」規則**（`MAX_ONGOING_SUPPORT_TICKETS = 5`，`useSupportTicketState.ts:11`）後端是否實作 — 目前只在前端擋，且錯誤碼 `max-ongoing` 需後端對齊

---

### 2.8 私訊模組 — 對齊良好，但前端缺兩個功能

後端 `message` 有 `DELETE /message/conversation/{id}`（刪除對話）與 `DELETE /message/{id}`（刪除訊息），**前端兩者皆無 UI**。需決定是否補。

反向：後端「訊息模板 template」5 支端點**限商戶身分**（`AccountIdentityType=Merchant`）— 前端**完全沒有這個概念**，玩家端不需要。確認這是後台功能誤列入前台清單，或前台真有商戶介面需求。

---

## 3. 🔵 已排入時程的項目 — 交付前需補的規格

後端時程（2026.07.27）涵蓋 12 項。以下是**排程時就該一併敲定、否則做完還要返工**的規格缺口（詳見 `specs/2026-07-29-api-inventory.md` §14）：

| 時程項目 | 週次 | 必須先拍板的商業規則 |
|---|---|---|
| 1. 儲值 | 7/27~7/31 | **優惠疊加規則** — 首儲+100%、週回饋15%、VIP加碼30% 目前前端完全沒生效（`siteContent.ts:516,521,522`）；**非同步入帳流程**（`processing`/`failed` 狀態前端無產生路徑） |
| 3. 每日任務 | 7/27~7/31 | **「今天」必須由 server 判定**（前端目前用 client `new Date()`，`daily.vue:14-16`）；里程碑看**連續天數還是累計天數**（前端用累計，`:28`） |
| 4. 優惠碼 | 8/3~8/7 | ⚠️ **前端完全沒有優惠碼功能** — 需先做 UI 規格。注意與註冊的「推薦碼」是兩回事 |
| 6. 獎勵卡 | 8/3, 8/17 | 🔴 **流水認列規則完全未定義** — 前端 `totalTurnover` 只在轉換瞬間被設成目標值，靠遊戲頁一顆測試按鈕觸發（`useRewardCardState.ts:173`、`GameView.vue:28-29`）。什麼下注算流水、比例、回報頻率全部待定 |
| 7. 排行榜 | 8/10~8/14 | `amount` 應回**結構化數值 + 單位**，前端目前是含單位字串（`'2,580,000 金幣'`、`'×2,560 倍'`，`siteContent.ts:229-231`）；需回 `updatedAt`（前端 `useLeaderboardTimer.ts:11` 只是本地每秒+1 的假計時） |
| 8. 遊戲相關 | 8/10~8/28 | **兩份遊戲清單並存**需先合併（`siteContent.games` 24 款 vs `lobbyGames` 30 款，key 空間不同）；**最低進場金額**規則（目前餘額 0 也能進，`GameLaunchModal.vue:29-31`）；**選座位是否納入正式流程**（`SeatSelectionModal.vue` 目前是 dead code） |
| 9. 交易紀錄 | 8/17~8/21 | `createdAt` 回 ISO8601（前端目前存已格式化本地字串）；`id` 由 server 發號（前端目前自產 `TX-000101`） |
| 11. 保險箱 | 8/31~9/4 | **是否包含贈禮**（見 §1.2）；**預扣需寫交易紀錄**（目前 `reserveGiftFromVault` 只扣餘額不寫 transaction，對帳會斷） |
| 12. 兌換 | 8/31~9/4 | 已有測試契約可直接對照：`tests/walletExchange.test.mjs`（金銀 1:100、銀換金須 100 倍數、手續費 0） |

> ✅ **現有 7 支測試可直接當後端契約**：`tests/{account,gameWallets,giftRequest,rewardCardConversion,vaultTransfer,walletExchange,walletSpend}.test.mjs`（`node --test tests/`）。建議後端實作時以此為準，避免規則漂移。

---

## 4. 橫向議題：兩份文件都沒解決的

| # | 議題 | 現況 |
|---|---|---|
| 1 | **id 命名體系** | 前端 `userInfo.id`(`P88888`) vs 玩家 `playerId`(`P10001`) 已在混用（`VaultContent.vue:770`）；後端 `mail_user_id` 又是第三套。**需統一命名規範** |
| 2 | **時間格式** | 前端四種並存（格式化字串／相對字串／epoch ms／ISO8601）。後端格式 `not_stated`。應統一 ISO8601 + 明確時區（贈禮每日額度用 Asia/Taipei，`utils/giftRequest.ts:8`） |
| 3 | **冪等性** | 所有金流端點都需要 idempotency key。兩份文件皆未提 |
| 4 | **錯誤碼規範** | 前端已定義多組錯誤碼（贈禮 7 個、工單 6 個），後端格式 `not_stated`。`GET /system/types` 可能是解方，需確認涵蓋範圍 |
| 5 | **分頁規範** | 前端全部是一次性陣列（訊息、在線名單、遊戲、交易）。後端各清單端點的分頁參數 `not_stated` |
| 6 | **前端無任何網路失敗處理** | 全專案沒有 loading / error / retry 狀態機。接 API 時需全面補上 401/超時/5xx |
| 7 | **XSS** | 跑馬燈 text 內嵌 raw HTML（`siteContent.ts:285`）。若 `/operator-setting/announcement` 回 HTML 將形成 XSS 面，建議回結構化欄位 |

---

## 5. ⚠️ 後端文件本身的問題

### 5.1 已被後端自己標注的 3 個 swagger 缺陷（已知，列此備查）
1. `DELETE /mailbox`（批次刪除）未進 swagger — annotation 漏標，路由已註冊可接
2. `GET /message`（列表）被誤標成 `@Router ... [post]`，與 `POST /message` 撞路徑 — swagger 只顯示一支且方法錯誤
3. `customerservice` 全部端點在 swagger 被誤判為公開（缺 `@Param Authorization`），且 `GET /question-categories` 未進 swagger

### 5.2 時程表與現況矛盾
- 時程「7/27~7/31 **2. 客服中心**」，但 §九 客服 6 支端點**已標 🆕 完成**
- 時程「8/3~8/7 **5. mail box**」，但 §五 信箱 4 支端點**已標 🆕 完成**

→ 需確認：時程指的是**前端串接**還是**後端開發**？若是前端串接，整張表的語意要改標題註明。

### 5.3 時程表編號錯亂
- 編號 1–12 但 **6. 獎勵卡**出現兩次（8/3~8/7、8/17~8/21）、**8. 遊戲相關**出現三次（8/10、8/17、8/24）
- 8/17 那列寫「6. 獎勵卡 8. 遊戲相關 9. 交易紀錄」，跳過 7
- 若是刻意表示跨週延續，建議改用甘特式標記（如 `6. 獎勵卡 (2/2)`）避免誤讀

### 5.4 缺少的文件欄位
後端清單只有「方法／路徑／功能／存取／狀態」，**沒有 request/response schema**。前端無法據此開工，尤其：
- `/account/info` 到底回哪些欄位（是否含四錢包餘額？累積儲值？）
- `/vip/levels` 是否含結構化升級門檻
- `/operator-setting/image` 的 `type` 有哪些值（前端要對應 banner / popup / 活動圖）
- 各清單端點的分頁參數與回傳信封格式

### 5.5 `operator-setting` 與前端內容的映射未定義
後端有 announcement / image / article 三種通用容器，前端有 **11 種靜態內容**（跑馬燈、Banner、快捷、最新消息、精選活動、遊戲介紹、規則、捷徑教學、FAQ、VIP 權益、法遵文件）。**誰對應誰完全 `not_stated`**，需要一份映射表，否則前端無法決定要打哪支。

特別是：`GET /operator-setting/image` 的 type 是否涵蓋 Banner？前端 `BannerSlide` 有 `targetUrl` 與 `mobileImageSrc` 欄位（`siteContent.ts:121-122`）但目前無人使用 — Banner 可否點擊導流需一併確認。

### 5.6 前台清單混入後台功能？
§8-2「訊息模板 template」5 支限**商戶身分**（`AccountIdentityType=Merchant`）。前端玩家介面完全沒有此概念。確認是否誤列入前台清單。

---

## 6. 建議的處理順序

| 順序 | 事項 | 理由 |
|---|---|---|
| 1 | **敲定 WebSocket 方案**（協定/事件/鑑權/重連） | 聊天與客服已開發但語意不完整，越晚定改動越大 |
| 2 | **確認贈禮歸屬**（是否在保險箱項目內） | 前端已完成的主線功能無後端對應，是最大的單點缺口 |
| 3 | **補 request/response schema** | 沒有 schema 前端無法開工，時程 7/27 已啟動 |
| 4 | **拍板獎勵卡流水規則** | 8/3 就要開發，但規則完全空白 |
| 5 | **決定忘記密碼 / 手機登入 / 訪客登入是否保留** | 影響前端是否要刪除既有 UI |
| 6 | **統一 id 與時間格式規範** | 橫向影響所有模組，越早定越省事 |
| 7 | 修正 §2 的 7 項前後端衝突 | 多為前端調整，可平行進行 |

---

## 7. 驗證方式

- 本文件的**前端側宣稱**（欄位、常數、行號）可由 `node --test tests/` 與原始碼交叉驗證
- 本文件的**後端側宣稱**僅來自 `API_list.md` 文字，**未經實際打 API 驗證**。所有標記 `not_stated` 者需由後端補充 schema 後才能確認
- 建議下一步：取得後端 swagger JSON，做一次**自動化的欄位級比對**（目前只做到端點級）
