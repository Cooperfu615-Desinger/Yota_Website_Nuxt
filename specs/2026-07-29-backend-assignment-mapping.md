# 後端工作分派 × API 總表 對照

- 建立日期：2026-07-29
- 來源：後端團隊 2026-07 工作規劃（Eric／Eu／Gordan／Hulk）
- 對照基準：`specs/2026-07-29-api-master-list.md`
- 目的：確認每位後端八月的工作範圍、找出未分配與重疊、擷取分派中透露的新資訊

---

## 0. 摘要

| 判定 | 數量 | 說明 |
|---|---|---|
| ✅ 已明確分派 | 11 個模組 | 見 §2 |
| ⚠️ 疑似重疊 | 1 組 | Eric「遊戲大廳」× Hulk「A-10 遊戲」 |
| 🔴 **完全無人認領** | **8 個模組／約 24 支端點 + 9 個 WS 事件** | 見 §3 |
| 🆕 **分派透露的新資訊** | 3 項 | 見 §1 —— 文件裡沒有，但會改變 API 設計 |
| 🔻 從原時程消失 | 1 項 | 排行榜（原定 8/10~8/14） |

> 📌 **重要訊號**：Hulk 的項目直接寫「**A-10. 遊戲 game（12支API）**」——這是本專案 API 總表的章節編號與端點數。代表後端已在使用這份文件。**建議後續溝通一律用 A-x 編號對齊**，可省掉大量來回確認。

---

## 1. 🆕 分派中透露、但文件沒有的資訊

### 1.1 「單一錢包串接」（Gordan）— ✅ 已確認為平台架構（2026-07-29）

Cooper 確認：**平台採單一錢包（Single Wallet）架構**。玩家只有一份餘額，遊戲不另開子錢包、無轉入／轉出，遊戲商的 bet/win 即時打我方錢包 API。

**對總表的三項修正**（已更新 §A-5、§A-10、§C）：

| 項目 | 修正 |
|---|---|
| **錢包維度** | 從 `type × currency` 改為 **`幣別 × 來源`**：`gold/silver/bronze` × `stored/activity` + `vault.gold`（共 6 個 bucket）。後台的 `GAME` 維度刪除；`CASH→stored`、`BONUS→activity`、`SAFE→vault` |
| **遊戲啟動選幣別** | **仍然需要**，但語意改為「本 session 從哪個 bucket 扣款」，不是轉帳。`/wallet/game-options`（含停用理由）照舊需要 |
| **C 區 webhook** | 從「選配」升為**第一階段必要** —— 單一錢包代表每筆 bet/win 都要即時打錢包 API |

**連帶影響**：
- `BET`／`WIN` 成為高頻真實交易，交易紀錄需承受下注量級
- 遊戲進行中餘額會變動 → 前台需即時餘額更新（D 區 `wallet.balance`），或離開遊戲時強制刷新
- **流水在每筆 BET 上累積** → 後台 `AssetLog.valid_turnover` 就是獎勵卡流水的正解，**§6 的「獎勵卡流水規則」不再是空白，有現成模型可抄**

> 📌 好消息：APP 現有的 `GameWalletKey`（`stored-gold｜activity-gold｜stored-silver｜activity-silver｜bronze`）**剛好就是正確的分類**，可直接沿用。要改的是官網的扁平四欄位。

### 1.2 「優惠派發幣別修正」（Gordan）— ✅ 已釐清（2026-07-29）

Cooper 說明：後端一開始寫錯幣別；**系統主要派發「活動金幣／活動銀幣」給玩家作為補償**。

**這會打到兩個前台**：

| | 現況 | 問題 |
|---|---|---|
| 官網 | `MailReward.wallet: 'gold'｜'silver'｜'bronze'` | 🔴 **沒有活動幣選項**，領獎會進錯 bucket |
| APP | 寫死固定 50,000 金幣（`InboxInterface.tsx:88,93`） | 🔴 幣別與金額都是假的 |
| 後台 | `MessageRecord.type` 有 `COMPENSATION` + `attachmentBonusAmount` | ✅ 已有補償概念 |

**✅ 已拍板：一律以獎勵卡為載體（2026-07-30）**

原「雙軌並存」（獎勵卡 + 信件直發活動幣）方案已放棄。**所有活動金幣／活動銀幣的派發都發獎勵卡**，不存在無卡的活動幣。

| 派發情境 | 載體 | 玩家看到的位置 |
|---|---|---|
| 每日簽到里程碑（15／20 天） | `RewardCard` | 獎勵卡介面 F-05 |
| 營運補償／推廣 | `RewardCard` | 獎勵卡介面 F-05 |
| 信件附件 | **只發儲值三幣** | 信箱 F-03 |

**解掉的問題**：活動幣永遠有載體帶 `turnover_target`／`conversion_limit`／`expires_at`，沒有規則空白；前台「活動幣餘額 = active + paused 卡加總」的投影邏輯完全不用改；每筆活動幣都可追溯到一張卡。

**營運彈性沒損失**：想做快速小額補償，發一張流水目標低、轉換上限高的卡即可。彈性從「兩種途徑」轉移到「卡片參數可調」。

**衍生的規格要求（2026-07-30 一併確認）**：
1. **每張卡自帶完整參數** —— `GET /reward-cards` 需回 `currency`／`amount`／`turnover_target`／`conversion_limit`／`expires_at`／`status`／`source`。（兩前台目前寫死兩張卡是**原型為確認流程的呈現方式，非問題項**）
2. **卡片數量暫定無上限**，「同幣別同時只能一張 active」維持。⏸ 排序／篩選（時間／流水／金額）待 Cooper 評估 → 建議 `GET /reward-cards` 預留 `sort`／`order` 參數
3. **過期規則已定**：後台可設每張卡有效期限，到期自動失效、卡內餘額**無法使用亦無法取出（沒收）**
   - `status` 需新增 `EXPIRED`（現行 enum 只有 `inactive｜active｜paused｜converted`）
   - 過期判定由**後端**執行，前台不自行判斷
   - 🎯 沒收記帳**對應後台既有的 `AssetLogChangeType.WIPE`** —— 這個交易類型先前在兩前台都找不到用途，現在對上了
   - ⚠️ 若過期卡當下是 `active`，玩家活動幣餘額會突然減少 → F-05 與遊戲啟動彈窗需能反映並說明原因

**另需補一支端點**：`GET /reward-cards/unread`（新卡到達提示）—— 單軌設計下**更關鍵**，所有補償都走這條，沒有信箱未讀紅點可以兜底。

### 1.3 「p2p」＝ 贈禮（Gordan）— 解除先前的疑慮
我在 `api-gap-analysis.md §1.2` 曾指出「贈禮完全缺席、時程表也沒有」。**現在確認 Gordan 的「p2p + 兌換」就是贈禮 + 兌換**（p2p = player-to-player transfer）。

這也對上了後台 `VIPLevel.p2p_fee_rate` 與 `OperationConfig.p2p_transaction_fee` —— 三者是同一件事。**先前的缺口判定可以撤銷。**

---

## 2. 分派對照表

### 👤 Eric — 每日簽到 / 優惠碼 / 遊戲大廳 / 代理後台列表

| 分派項目 | 對應章節 | 端點 | 狀態 |
|---|---|---|---|
| 每日簽到 | **A-9** checkin | 5 支：`/checkin/config`、`/checkin/status`、`POST /checkin`、`/checkin/makeup`、`/checkin/milestones/{day}/claim` | 🆕 全新 |
| 優惠碼 | **A-12**（部分） | 2 支：`POST /promo/codes/redeem`、`GET /promo/codes/history` | 🆕 全新。⚠️ **兩前台都還沒有 UI** |
| 遊戲大廳 | **A-10**（部分） | 3 支：`GET /games`、`/games/categories`、`/games/providers` | ⚠️ **與 Hulk 重疊，見 §4** |
| 代理後台列表 | **B 區** agent | 11 支：CRUD／啟停／佣金調整／提領審核／轉線排程 | 🆕 後台，尚未開始 |

**Eric 需要的前置決策**：
- 每日簽到：「今天」必須由 server 判定（含時區/跨日邊界）；里程碑看**連續天數還是累計天數**（§6-待決）
- 優惠碼：前端還沒有畫面，需先定 UI 規格；注意**與註冊的「推薦碼」是兩回事**
- 遊戲大廳：遊戲分類三方不同（APP 3 類／官網 5 類／後台 5 種 provider type）、官網有兩份遊戲清單需合併

---

### 👤 Eu — 前後台全域設定 / 人工充值 / 黑名單 / 串接問題

| 分派項目 | 對應章節 | 端點 | 狀態 |
|---|---|---|---|
| 前後台全域設定 | **A-2** `/system/config` + **B 區** operationConfig | 前台 1 支 + 後台 3 支 | 🆕 全新 |
| 人工充值 | **B 區** adjustment | 2 支：`createAdjustment`、`getReasons` | 🆕 後台 |
| 黑名單 | ⏸ **語意未定** | 社交封鎖 3 支（A-16）**或** IP/裝置封鎖 5 支（B 區） | 🔴 見 §5 |
| 串接問題 | 橫向 | — | 泛項，無對應端點 |

**Eu 的工作有兩個關鍵影響**：

1. **全域設定是前台維護頁的前提。** `/system/config` 要回：維護開關、維護文案(i18n)、踢線秒數、註冊開關、驗證碼開關、強制綁手機、註冊禮金、P2P 預設費率（後台 `types/operationConfig.ts:2-35` 已有完整欄位）。**目前兩個前台都沒有維護頁**——後台一開維護，前台不知道要擋。
2. **人工充值會直接改玩家餘額**，前台需要能即時反應（對應 WS 事件 `wallet.balance`，目前無人負責）。

---

### 👤 Gordan — 儲值 / mailbox + 優惠派發幣別修正 / 單一錢包串接 / 獎勵卡 + 交易紀錄 / p2p + 兌換

| 分派項目 | 對應章節 | 端點 | 狀態 |
|---|---|---|---|
| 儲值 | **A-6** deposit | 6 支：products／channels／orders(建立)／orders/{id}／orders(列表)／IAP 驗證 | 🆕 全新 |
| mailbox | **A-14** mailbox | 4 支**已開發** + 1 支新增（`claim-all`） | 🔧 需修 `type` enum 三方分裂 |
| 優惠派發幣別修正 | **A-12** × **A-5** | — | 🆕 修 bug（文件無此項） |
| **單一錢包串接** | **A-5** wallet | 8 支：balances／game-options／transactions／exchange／vault×3／rebate | 🆕 **架構待確認，見 §1.1** |
| 獎勵卡 | **A-8** reward-card | 6 支 | 🆕 全新 |
| 交易紀錄 | **A-5**（部分） | `GET /wallet/transactions` | 🆕 |
| p2p（＝贈禮） | **A-7** gift | 7 支 **或** 1 支 ⏸ | 🔴 機制待決，見 §5 |
| 兌換 | **A-5**（部分） | `POST /wallet/exchange` | 🆕 |

**Gordan 的工作量最重，而且是全部人的地基。** 錢包（A-5）是儲值、贈禮、獎勵卡、遊戲啟動的共同依賴。

**Gordan 需要的前置決策（三項都在 §6）**：
- **金額型別** string vs number → 影響所有金流端點
- **贈禮機制** 雙向確認（7 支）vs 直接轉帳（1 支）→ 相差 6 支端點
- **獎勵卡流水認列規則** → 目前兩前台都是假的，後台 `AssetLog.valid_turnover` 是現成模型
- 另：**贈禮費率應改吃 VIP 分級**（`gift_fee_rate`），兩前台目前寫死 5%
- 另：官網現行「拒絕贈禮不退款」是資金憑空消失的 bug，需一併修

---

### 👤 Hulk — A-10 遊戲 game（12 支 API）

| 對應章節 | 端點 | 狀態 |
|---|---|---|
| **A-10** game 全組 | `/games`、`/games/categories`、`/games/providers`、`/games/{key}`、`/games/{key}/launch`、`/games/{key}/seats`、`seats/{id}/reserve`、`/me/favorites` GET、`/me/favorites/{key}` POST+DELETE、`/me/recent-games` GET+POST、`/me/game-records` | 🆕 全新 12 支 |

**Hulk 需要的前置決策**：
- **遊戲 catalog 統一**（官網兩份 24+30、APP 22 款、三方分類不同）
- **選座位是否納入**（APP 有完整 `GameSeat` 模型、後台有 `min_seat_vip_level`、官網是 dead code）→ 影響 2 支端點
- **遊戲啟動要不要選幣別** → 取決於 §1.1 單一錢包架構
- **最低進場金額**（目前餘額 0 也能進）
- 「遊玩遊戲」三者的區分（我的最近遊玩／他人的最近遊玩／投注明細，見 A-10 說明）

---

## 3. 🔴 完全無人認領（約 24 支端點 + 9 個 WS 事件）

| # | 模組 | 章節 | 端點數 | 影響 |
|---|---|---|---|---|
| 1 | **認證缺口** | A-1 | 7 支：訪客登入、手機登入 send/verify、忘記密碼 ×4 | 🔴 兩前台都有完整 UI，後端沒有端點。**忘記密碼是玩家自助救援的唯一途徑** |
| 2 | **會員資料調整** | A-3 | 4 支：`/account/info` 補欄位、`profile`、`avatar`、`/account/stats` | 🔴 `/account/info` 要補四錢包餘額 + VIP 累積 + 玩家管制旗標，**幾乎每頁都依賴它** |
| 3 | **VIP** | A-11 | 2 支：`/vip/levels` 補結構化門檻、`/vip/progress` | 🔴 官網 VIP 進度條目前算不出來 |
| 4 | **聊天世界頻道** | A-15 | 3 支：world messages GET/POST、`/chat/online` | 🔴 後端 `message` 模組只做了私訊 |
| 5 | **社交好友與玩家** | A-16 | 5 支：friends ×3、`/players/{id}`、`/players/search` | 🔴 玩家資料卡、贈禮選人都依賴它 |
| 6 | **檢舉** | A-17 | 1 支：`POST /reports` | ⚠️ 目前塞成 report 類工單 |
| 7 | **排行榜** | A-13 | 2 支 | 🔻 **原時程 8/10~8/14 有，新分派消失了** |
| 8 | **WebSocket 整塊** | D 區 | 9 個事件 | 🔴 `message` 與 `customerservice` 已開發完成，但**沒有推送，語意是缺角的** |
| — | operator-setting 映射表 | A-18 | 0 支新端點 | ⚠️ 但需定義 11 種前台內容對應 3 種容器 |
| — | `/system/version` | A-2 | 1 支 | 🟣 可延後 |

### 特別點出兩個
**忘記密碼（#1）**：後端只有 `PUT /account/password`（**需登入**的改密碼）。玩家忘記密碼時無法登入，也就用不到那支。目前唯一出路是後台人工處理。

**WebSocket（#8）**：這不是「還沒做」，而是「**已開發的模組缺了必要的一半**」。私訊 `unread` 在前端只有歸零路徑沒有增加路徑；工單 `ongoing → closed` 前端完全沒有轉移路徑；客服 `receiveSupportMessage` 的註解自己就寫著「保留給 WebSocket」。

---

## 4. ⚠️ Eric × Hulk 疑似重疊

| | Eric | Hulk |
|---|---|---|
| 分派字面 | 「遊戲大廳」 | 「A-10. 遊戲 game（12支API）」 |
| 推測範圍 | 大廳展示層：`/games`、`/games/categories`、`/games/providers` | A-10 **全部 12 支**（含上述 3 支） |

**A-10 的 12 支剛好等於 Hulk 認領的數量**，所以 Eric 的「遊戲大廳」若也在其中，就是重工。

**建議切法**（供確認）：
- **Eric**：catalog 與展示層 —— `/games`、`/games/categories`、`/games/providers`（3 支）
- **Hulk**：啟動與玩家維度 —— `/games/{key}`、`launch`、`seats` ×2、`favorites` ×3、`recent-games` ×2、`game-records`（9 支）

---

## 5. ⏸ 阻塞中且已有負責人的決策（優先問這幾個）

| 決策 | 卡住誰 | 影響 |
|---|---|---|
| **黑名單語意**：社交封鎖 vs IP/裝置封鎖 vs 兩者 | **Eu** | 差別是 A-16 的 3 支 vs B 區的 5 支，做錯就整組白做 |
| ~~單一錢包架構~~ | ~~Gordan + Hulk~~ | ✅ **已定案**（2026-07-29）：採單一錢包，見 §1.1 |
| **補償活動幣是否綁流水** | **Gordan** | 🆕 A-5 bucket 細分、A-8 獎勵卡、A-14 信箱領獎三處結構 |
| **金額型別** string vs number | **Gordan** | 所有金流端點；若採 string，兩前台所有金額計算要重寫 |
| **贈禮機制** 雙向確認 vs 直接轉帳 | **Gordan** | 7 支 vs 1 支 |
| ~~獎勵卡流水認列規則~~ | **Gordan** | 🟢 **降級**：單一錢包確認後，流水在每筆 BET 累積，可直接對齊後台 `AssetLog.valid_turnover`。剩下只需定「什麼下注算有效流水、比例多少」 |
| **遊戲 catalog 統一** | **Eric** + **Hulk** | 三方分類/數量都不同 |
| **選座位是否納入** | **Hulk** | 2 支端點 |
| 里程碑看連續還是累計天數 | **Eric** | 每日簽到邏輯 |
| 🆕 **C 區 webhook 誰負責** | 未分配 | 單一錢包架構下這是必要項，目前無人認領 |

---

## 6. 建議的確認清單（可直接拿去問後端）

1. ~~「單一錢包串接」的具體定義~~ ✅ 已確認（§1.1）
2. ~~「優惠派發幣別修正」修的是什麼~~ ✅ 已釐清（§1.2）
3. 🆕 **直接發（無卡）的活動幣，玩了之後贏的錢去哪？** 要不要達流水門檻才能轉成儲值幣？若要，流水目標/轉換上限/到期由誰帶？（Gordan，總表 §6-14）
   - 附帶：**建議後端把直接派發的活動幣自動包成一張隱藏卡**，前台就不用改資料結構（總表 §6-15）
4. **Eric 的「遊戲大廳」與 Hulk 的「A-10 遊戲」如何切分？**（建議切法見 §4）
5. **「黑名單」指社交封鎖還是 IP 封鎖？**（Eu）
6. **排行榜為什麼從時程消失了？** 是延後還是漏了？
7. 🆕 **C 區 webhook（遊戲商 bet/win 回調）誰負責？** 單一錢包架構下這是第一階段必要項，目前無人認領
8. **以下 8 個模組誰負責？** 認證缺口（含忘記密碼）、會員資料調整、VIP、聊天世界頻道、社交好友、檢舉、排行榜、WebSocket
9. **金額型別、贈禮機制** 兩項決策何時能定？Gordan 的工作卡在這裡
10. **是否已有我沒看到的內部文件？** 「單一錢包串接」與「優惠派發幣別修正」都不在 `API_list.md` 裡，推測後端另有工作記錄；若有，可再併進來對一次

---

## 7. 逐支端點確認清單（可直接發給各後端逐條核對）

> 用法：每人只看自己那段，逐條確認「這支是我做的嗎／路徑對嗎／有沒有漏」。
> 有異議直接在該行標註，不用改整份文件。詳細欄位定義見 `api-master-list.md` 對應章節。

### 👤 Eric（前台 10 支 + 後台 11 支）

**A-9 每日任務（5 支）**
- [ ] `GET  /checkin/config` — 31 天獎勵表、里程碑、補簽費用
- [ ] `GET  /checkin/status` — 本月已簽日、已領里程碑、**server 端「今天」**
- [ ] `POST /checkin` — 簽到
- [ ] `POST /checkin/makeup` — 補簽（先扣 100 金幣）
- [ ] `POST /checkin/milestones/{day}/claim` — 領取里程碑

**A-12 優惠碼（2 支）**
- [ ] `POST /promo/codes/redeem` — 兌換優惠碼
- [ ] `GET  /promo/codes/history` — 兌換紀錄
- ⚠️ **兩前台都還沒有優惠碼 UI**，需先定畫面規格

**A-10 遊戲大廳（3 支）**⚠️ 與 Hulk 重疊待切
- [ ] `GET /games` — 遊戲 catalog
- [ ] `GET /games/categories` — 分類定義
- [ ] `GET /games/providers` — 供應商清單

**B 區 代理後台（11 支）**
- [ ] 代理 CRUD、啟停、佣金調整、提領審核、轉線排程

**卡住 Eric 的決策**：里程碑看連續天數還是累計天數（總表 §6-8）｜遊戲 catalog 範圍未定（§6-6，結構已拍板、範圍留待營運）

---

### 👤 Eu（前台 1 支 + 後台 5 支 + ⏸ 黑名單）

**A-2 全域設定（1 支）**
- [ ] `GET /system/config` — 維護開關／維護文案(i18n)／踢線秒數／註冊開關／驗證碼開關／強制綁手機／註冊禮金／P2P 預設費率
- ⚠️ 這支是**前台維護頁的前提**，兩前台目前都沒有維護頁

**B 區（5 支）**
- [ ] 營運參數 operationConfig：取得／更新／維護判定（3 支）
- [ ] 人工充值 adjustment：建立調整、原因代碼（2 支）
- ⚠️ 人工充值會直接改玩家餘額 → 前台需即時反應（D 區 `wallet.balance`，目前無人）

**⏸ 黑名單（3 支 或 5 支，語意未定）**
- [ ] (a) 社交封鎖：`GET/POST /social/blocks`、`DELETE /social/blocks/{player_id}` — 玩家互相封鎖
- [ ] (b) IP／裝置封鎖：後台 frontendBlacklist CRUD 5 支 — 封鎖後無法訪問前台
- 🔴 **做錯就整組白做，開會第一個確認**

---

### 👤 Gordan（32 支，工作量最重且是所有人的地基）

**A-5 錢包（8 支）**
- [ ] `GET  /wallet/balances` — 6 個 bucket（幣別 × 來源 + 保險箱）
- [ ] `GET  /wallet/game-options` — 遊戲可用幣別（含停用理由）
- [ ] `GET  /wallet/transactions` — 交易紀錄
- [ ] `POST /wallet/exchange` — 金↔銀兌換（1:100，銀換金需 100 倍數，手續費 0）
- [ ] `POST /vault/deposit` — 存入保險箱
- [ ] `POST /vault/withdraw` — 取出保險箱
- [ ] `GET  /vault/info` — 保險箱餘額與限額
- [ ] `GET  /wallet/rebate` — 返水紀錄

**A-6 儲值（6 支）**
- [ ] `GET  /deposit/products` — 依 `platform` 回不同幣別/通道（✅ 平台差異已拍板）
- [ ] `GET  /deposit/channels` — 可用通道（依平台/VIP/限額過濾）
- [ ] `POST /deposit/orders` — 建立訂單
- [ ] `GET  /deposit/orders/{id}` — 訂單狀態（非同步入帳）
- [ ] `GET  /deposit/orders` — 我的訂單列表
- [ ] `POST /deposit/orders/{id}/verify` — IAP 收據驗證

**A-7 贈禮（6 支，✅ 已拍板雙向確認）**
- [ ] `GET  /gift/quota` — 今日次數／上限／**當前 VIP 費率**
- [ ] `GET  /gift/requests` — 申請列表（分收送兩側）
- [ ] `POST /gift/requests` — 送出申請（保險箱預扣）
- [ ] `POST /gift/requests/{id}/accept` — 接受
- [ ] `POST /gift/requests/{id}/reject` — 拒絕（**須退款給 sender**）
- [ ] `POST /gift/requests/{id}/cancel` — 取消
- ⚠️ **逾期退款須後端排程 job**（168 小時），前端輪詢不算
- ➖ `POST /gift/transfer`（直接轉帳）**已拍板不採用**

**A-8 獎勵卡（7 支）**
- [ ] `GET    /reward-cards` — 清單（含流水進度）
- [ ] `GET    /reward-cards/unread` — 新卡到達提示（營運直接派卡不經信箱）
- [ ] `POST   /reward-cards/{id}/activate` — 啟用（同幣別其他轉 paused）
- [ ] `POST   /reward-cards/{id}/pause` — 停用
- [ ] `DELETE /reward-cards/{id}` — 刪除（active 不可刪）
- [ ] `GET    /reward-cards/{id}/turnover` — 流水進度明細
- [ ] `GET    /notices/conversions` — 轉換完成通知

**A-14 信箱（4 支已開發需調整 + 1 支新增）**
- [ ] 🔧 `GET /mailbox`、`GET /mailbox/{id}`、`POST /mailbox/{id}/claim`、`DELETE /mailbox` — **`type` enum 三方需統一**
- [ ] 🔧 `MailReward.wallet` 需支援**活動金幣／活動銀幣**（目前只有 gold/silver/bronze）
- [ ] `POST /mailbox/claim-all` — 全部領取

**卡住 Gordan 的決策（開工前必須有答案）**
1. 🔴 **金額型別 string vs number**（§6-2）—— **目前唯一的紅字阻塞**
2. ⚠️ 贈禮費率改吃 VIP 分級（`gift_fee_rate`），兩前台目前寫死 5%
3. ⚠️ 官網現行「拒絕贈禮不退款」是資金消失的 bug，需一併修
4. ⏸ 獎勵卡排序／篩選功能是否要做（§6-17，Cooper 評估中，不阻塞開工）
5. ~~無卡活動幣的流水規則／載體~~ ✅ **已解消**（2026-07-30：全走獎勵卡）
6. ~~獎勵卡數量與過期管理~~ ✅ **已解消**（2026-07-30：無上限＋過期沒收規則已定）

---

### 👤 Hulk（9 支）

**A-10 遊戲（扣除與 Eric 重疊的 3 支）**
- [ ] `GET    /games/{key}` — 遊戲詳情（介紹/規則/RTP/波動性/賠付線/最高倍率）
- [ ] `POST   /games/{key}/launch` — **啟動遊戲**，帶 `wallet`(+`seat_id?`)，回一次性 URL / launch token
- [ ] `GET    /games/{key}/seats` — 機台/座位清單 ⏸ 選座位是否納入未定
- [ ] `POST   /games/{key}/seats/{id}/reserve` — 預約座位 ⏸ 同上
- [ ] `GET    /me/favorites` — 我的最愛
- [ ] `POST/DELETE /me/favorites/{key}` — 加入／移除最愛
- [ ] `GET    /me/recent-games` — **我的**最近遊玩（大廳「繼續遊戲」）
- [ ] `POST   /me/recent-games` — 記錄一筆
- [ ] `GET    /me/game-records` — 遊戲**投注明細**

**卡住 Hulk 的決策**：選座位是否納入（§6-9，2 支端點）｜遊戲 catalog 範圍（§6-6）｜最低進場金額

**⚠️ 提醒**：單一錢包架構下，`launch` 的 `wallet` 參數語意是「本 session 從哪個 bucket 扣款」，**不是轉帳**。

---

### 🔴 無人認領（約 24 支 + 9 個 WS 事件 + C 區 webhook）

| 模組 | 支數 | 急迫度 |
|---|---|---|
| C 區 **webhook**（遊戲商 bet/win 回調） | 4 | 🔴 單一錢包的地基，沒有它遊戲不能扣款 |
| A-1 **忘記密碼** ×4 + 訪客登入 + 手機登入 ×2 | 7 | 🔴 玩家忘記密碼目前只能走後台人工 |
| A-3 `/account/info` 補欄位等 | 4 | 🔴 幾乎每頁都依賴 |
| D 區 **WebSocket** | 9 事件 | 🔴 私訊/客服已開發完成但缺一半語意 |
| A-11 VIP（`/vip/levels` 補門檻、`/vip/progress`） | 2 | 🔴 官網 VIP 進度條算不出來 |
| A-16 好友 ×3 + 玩家搜尋/公開檔 ×2 | 5 | ⚠️ 玩家卡、贈禮選人都要 |
| A-15 世界頻道 ×3 | 3 | ⚠️ 後端 message 只做了私訊 |
| A-13 排行榜 ×2 | 2 | 🔻 原時程有，新分派消失 |
| A-17 檢舉 ×1 | 1 | ⚠️ |
| A-18 營運內容映射表 | 0 支 | ⚠️ 需定義 11 種前台內容 → 3 種容器 |

---

## 8. 限制說明

- 本文件的分派解讀基於四行文字的字面推斷，**「串接問題」、「單一錢包串接」、「優惠派發幣別修正」三項語意需向後端確認**
- 端點歸屬以 API 總表為準；總表本身是「依現有畫面反推的需求」，非後端契約
- 未分配清單只涵蓋**第一階段**範圍，第二階段（公會/徽章/商城/彈窗/玩家管制）不計入
