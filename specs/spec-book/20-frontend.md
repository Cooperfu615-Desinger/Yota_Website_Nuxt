# 巨亨ONLINE 規格書 — 前端冊

- 建立日期：2026-07-30
- 受眾：前端工程師（官網／APP 兩側）
- 讀法：每節對應主幹 [`00-overview.md`](00-overview.md) 與 [`_index-table.md`](_index-table.md) 的畫面編號，可回頭看截圖再對照本冊的元件樹與狀態機
- 4 個 🔴 落差項目已依 [`specs/decisions/2026-07-30-first-phase-alignment-decisions.md`](../decisions/2026-07-30-first-phase-alignment-decisions.md) 拍板，本冊直接以決策後的目標規格撰寫，不重複列現況分岔
- 全域規則：`<Teleport>` 必包 `<ClientOnly>`／跨元件狀態一律用 `useState`（見專案 `CLAUDE.md`）

---

## 0. 全域基礎設施

### 0.1 狀態層（`composables/`）

| Composable | 職責 | 持久化 |
|---|---|---|
| `useAppState` | 登入狀態、profile、登入/大廳彈窗開關；`userInfo` 是 profile ＋ 財務欄位的合成視圖 | profile／登入旗標存 `localStorage`（`jh_isLoggedIn`／`jh_userInfo`）；財務欄位**不持久化**，重整回到初始值 |
| `useFinancialState` | 財務核心：`balance`／`silverBalance`／`bronzeBalance`／`vaultBalance`／`transactions` | 僅本次工作階段 |
| `useSocialState` | 好友、黑名單 | 僅本次工作階段 |
| `useGiftState` | 贈禮申請狀態機（見 §4.4） | 僅本次工作階段 |
| `useRewardCardState` | 獎勵卡（見 §6） | 僅本次工作階段 |
| `useSupportTicketState` | 客服工單狀態機（見 §8.3） | 僅本次工作階段 |
| `useMailboxState` | 信箱訊息與附件領取 | 僅本次工作階段 |
| `useAgeGateState` | 年齡驗證彈窗（動作佇列模式，見 §1.3） | 僅本次工作階段（`ageGateConfirmedThisPage` 換頁重置） |
| `usePreferencesState` | 語言／音效偏好 | `localStorage` |
| `useRecentGames` | 最近遊玩（上限 12） | `localStorage`（`jh_recentGames`） |
| `useGameFilter` | 遊戲分類／搜尋篩選（純函式包裝） | 無 |
| `useLeaderboardTimer` | 排行榜倒數計時 | 本地假計時，⚠️ 需 server `updatedAt`（矩陣 §5） |
| `useMobileMenuState`／`useLogoutState`／`useLegalState`／`useAudioState` | 手機選單／登出確認／法律彈窗／音效開關 | 依各自需求 |

**重要限制**：除 profile／登入旗標／偏好設定／最近遊玩外，**其餘狀態一律不持久化**，重新整理即回到 mock 初始值。這是原型階段的刻意設計，後端串接時每一個 `useState` 都要換成真正的 API 讀寫，前端串接時**逐一盤點哪些 composable 目前是純前端記憶體狀態**，這份清單就是盤點的起點。

### 0.2 純函式層（`utils/`）— 已抽出且有測試，串接時直接複用

| 檔案 | 匯出 | 對應測試 |
|---|---|---|
| `vaultTransfer.ts` | `VAULT_TRANSFER_FEE_RATE = 0.05`、`calculateVaultTransfer(amount)`、`canSubmitVaultTransfer(receiverId, amount, vaultBalance)` | `tests/vaultTransfer.test.mjs` |
| `walletExchange.ts` | `GOLD_TO_SILVER_RATE = 100`、`calculateWalletExchange(direction, amount)`、`canSubmitWalletExchange(...)`（銀→金強制 100 倍數） | `tests/walletExchange.test.mjs` |
| `giftRequest.ts` | `GIFT_REQUEST_EXPIRY_MS`（168h）、`MAX_GIFT_REQUEST_AMOUNT`（100 萬）、`createGiftRequest`／`resolveGiftRequest`／`expireGiftRequest`／`formatGiftRequestRemainingTime` | `tests/giftRequest.test.mjs` |
| `rewardCardConversion.ts` | `calculateRewardCardConversion(currentBalance, conversionLimit)` → `min(餘額,上限)`，其餘 `recoveredAmount` | `tests/rewardCardConversion.test.mjs` |
| `walletSpend.ts` | `calculateWalletSpend(balance, amount)`，餘額不足回傳 `null` | `tests/walletSpend.test.mjs` |
| `gameWallets.ts` | 5 種遊戲錢包 key（`stored-gold｜activity-gold｜stored-silver｜activity-silver｜bronze`）與顯示格式化 | `tests/gameWallets.test.mjs` |
| `wallets.ts` | 三幣顯示格式化，`DEFAULT_WALLET_BALANCE = 10_000_000` | 併入上列測試 |
| `account.ts` | 帳號規則：4–20 半形字元（中文以 2 計）、僅中英文數字 | `tests/account.test.mjs` |

**串接原則**：這些函式已經是「業務邏輯與 UI 分離」的正確形狀 —— 後端串接時，UI 元件呼叫這些函式的地方全部換成呼叫對應 API，函式本身的常數與計算邏輯直接搬到後端驗證（金額計算不能只信前端）。改動前後端邏輯前，先跑 `node --test tests/` 確認現有 7 支測試綠燈，改完再跑一次確認沒破壞既有規則。

### 0.3 路由與版面

- 大廳全部走 `layouts/lobby.vue`，`pages/lobby/*.vue` 為換頁式路由（⚠️ 對應矩陣 `P-03`：APP 是 Overlay 疊加不換頁，屬平台差異，合理不對齊）
- 桌機：`LobbySidebar.vue` 常駐側欄；手機：`AppBottomNav.vue` 固定底部導覽 + 抽屜選單（`useMobileMenuState`）
- 多數頁面共用「未登入導引卡」樣式（`W-17`）：置中卡片 + 一顆「立即登入 / 註冊」按鈕呼叫 `openLogin(route.fullPath)`，登入後 `protectedDestination` 導回原頁

---

## 1. 進入與認證

### 1.1 登入彈窗（`LoginModal.vue`）

單一元件涵蓋 5 種畫面狀態，靠 `modalView` 切換：`login｜register｜recovery｜social｜success`。**必包在 `layouts/default.vue` 的 `<ClientOnly>`**（`<Teleport to="body">`，見 CLAUDE.md 地雷 #1）。

| 對應編號 | modalView | 說明 |
|---|---|---|
| `P-02` | `login` | 帳號密碼／手機驗證碼兩分頁（`loginTab`），手機分頁為兩步驟（`phoneStep: phone｜code`），⚠️ 手機格式寫死 `^09\d{8}$` 無國碼選擇，需依後端 `/system/dial-codes` 補上 |
| `M-05` | `register` | 帳號/暱稱/密碼/確認密碼 + 推薦碼（`referralCode`，代理 6 碼／玩家 8 碼）+ 條款審閱（`termsReviewed`，需點開 `M-04` 才能勾選） |
| `W-02` | `recovery` | 4 步驟：帳號確認 → 發送驗證碼 → 驗證碼+新密碼 → 成功；忘記密碼流程本身另分兩條路徑（帳號有綁社群 vs 純帳密），成功頁再依情境導向重新登入或客服。🔴 後端目前**無公開復原端點**（見 `api-gap-analysis.md` §1.3），這條路整段是前端假流程，串接時要跟後端一起設計 |
| `M-04` | 由 `useLegalState` 另開，非 `modalView` | 服務條款／隱私政策 3 分頁，內容應改接後台 `/operator-setting/article` |

**入口**：桌機 header 目前**無登入鈕**（`components/AppHeader.vue` 只在已登入時顯示會員資訊），未登入時的入口是（a）各受保護頁的導引卡「立即登入 / 註冊」按鈕，（b）手機底部導覽點任一需登入項目。串接或改版時若要在桌機加常駐登入鈕，屬 UI 決策，非本冊範圍。

### 1.2 訪客/社群登入

- 訪客登入：`handleGuestLogin`，⚠️ 後端 API 清單**無此端點**（矩陣 §1）
- FB／LINE／Apple／Google：共用 `startSocialLogin(provider)` → `social` 分頁假流程（`confirmSocialLogin`／`cancelSocialLogin`），⚠️ 需依後端實際 OAuth provider 重寫，四個 provider 目前是同一套假邏輯

### 1.3 年齡驗證（`AgeGateModal.vue` ＋ `useAgeGateState.ts`）

`W-03`。動作佇列模式：`openAgeGate(action)` 把要執行的動作暫存在 composable 的模組層變數 `pendingAction`（非 `useState`，注意這不是跨請求安全的全域單例，SSR 下每個請求共用同一個 module 實例，**純前端 mock 階段沒問題，但這個模式不能直接照搬到有 SSR 的正式環境**，串接時建議改用 `useState` 存 pending action 的識別碼而非閉包函式）。

**目前唯一觸發點**：手機底部導覽「進入遊戲」按鈕（`AppBottomNav.vue:25`）與 `FloatingPanels.vue:11`。**不是**點遊戲卡片觸發 —— 這點容易與 APP 的行為搞混，APP 側 `AgeGateModal.tsx` 是死碼未引用。串接時若要仿照大部分博弈網站「進遊戲前每次或每日一次年齡確認」，需要決定觸發點要不要擴大到遊戲卡片本身，這是待確認項，目前只在全域「進入大廳」動作上驗證一次（`ageGateConfirmedThisPage` 在同頁面內生效，換頁重置）。

---

## 2. 主畫面與導航

### 2.1 導覽結構

| 編號 | 元件 | 說明 |
|---|---|---|
| `L-01` | `AppHeader.vue` | 桌機頂部；已登入顯示大頭貼/VIP徽章/`WalletBalances`；⚠️ 無 BUY/SALE 按鈕（矩陣：APP `L-07` 有懸浮按鈕，官網未做） |
| `L-02` | `AppBottomNav.vue` | 手機底部固定導覽，5 顆：選單/儲值/進入遊戲(中央大按鈕)/信箱/聊天。⚠️ APP 為 8 顆，項目數需與 APP 對齊（矩陣 §2） |
| `L-03` | `LobbySidebar.vue` | 桌機常駐側欄，5 個分組（首頁/大廳/任務活動/財務/其他），`isActive()` 對 `/lobby/bank` 特殊處理（含 `/lobby/deposit` 別名） |
| `L-06` | `pages/lobby/settings.vue` | 語言／音效／法律／黑名單解除／登出，串 `usePreferencesState`／`useAudioState`／`useSocialState`／`useLegalState`／`useLogoutState` |

### 2.2 側欄導覽清單（`LobbySidebar.vue:18-38`，串接時作為選單結構參照）

```
首頁              /
遊戲大廳          /lobby
── 任務與活動
每日任務          /lobby/daily
活動              /lobby/events
排行榜            /lobby/leaderboard
儲值              /lobby/bank
── 個人與財務
個人資訊          /lobby/member
保險箱/贈禮       /lobby/vault
信箱              /lobby/inbox
獎勵卡            /lobby/gifts
聊天              /lobby/chat
兌換              /lobby/exchange
交易紀錄          /lobby/transactions
設置              /lobby/settings
── 其他
新手教學          /lobby/tutorial
客服中心          /lobby/support
```

---

## 3. 遊戲大廳與啟動

### 3.1 遊戲資料結構（🔴 已拍板：只統一結構，範圍待定）

依 [決策 §3](../decisions/2026-07-30-first-phase-alignment-decisions.md#3-遊戲分類與數量--本階段只統一資料結構不決定範圍)：

- **本階段要做**：官網先合併 `data/siteContent.ts` 內並存的兩份遊戲清單（`games`，24 款主大廳用；`lobbyGames`，30 款活動限定遊戲用）為單一資料來源，並確認 `GameItem` 介面欄位與分類 enum 的**表示方式**（字串聯集 type）與 APP／後台的資料模型對齊
- **本階段不做**：不決定最終要幾類、幾款、哪些遊戲上架（營運/採購階段的決定）
- 目前 `GameItem` 欄位（`data/siteContent.ts:184`）：`key｜name｜desc｜badge｜rtp｜color｜category｜provider｜imageSrc?｜volatility｜paylines｜maxMultiplier`
- 目前分類值（僅供參考，非定案）：`slots｜baccarat｜fish｜dice｜cards`
- 篩選邏輯已抽成 `useGameFilter.ts`（純函式包裝，依 `category` 與關鍵字比對 `name/desc/provider`），串接時篩選介面不用重寫，只需把 `games` 來源換成 API 回傳

### 3.2 遊戲卡與啟動流程

```
GameCard.vue（hover 顯示「真錢玩／試玩」，CSS opacity 控制，遮罩層預設 pointer-events:none）
  └ handlePlay('demo')  → 直接進 demo，不檢查登入
  └ handlePlay('real')  → 未登入：openLogin(重導參數) ；已登入：emit('play', key, 'real')
       └ pages/lobby/index.vue requestLaunch() → launchGameKey 設值 → 顯示 GameLaunchModal（W-04）
            └ startRealGame(wallet) → 設定 currentGameKey/currentGameMode/currentGameWallet → 顯示 GameView（P-04，iframe example.com 佔位）
```

⚠️ `GameLaunchModal.vue` 目前**不顯示不可用原因、不檢查餘額**（矩陣：APP 有「需先啟用金/銀幣獎勵卡」等不可用提示）。可選遊戲錢包 5 種（`utils/gameWallets.ts`）：`stored-gold｜activity-gold｜stored-silver｜activity-silver｜bronze`，與 APP 一致，但與後台的 `Wallet{type × currency}` 二維結構不同，串接時需要一次轉換層。

### 3.3 選座位（`W-05`，dead code）

`components/lobby/SeatSelectionModal.vue` 存在但**無任何元件引用**，是 55 行的孤兒元件。串接前需先決定要不要接（APP 有完整 `GameSeat` 資料模型，後台有 `min_seat_vip_level`），若決定要接，這個元件是現成的起點，若不接，建議直接刪除避免誤導後續維護者。

---

## 4. 財務

### 4.1 錢包顯示

三幣（金/銀/銅）＋保險箱，統一透過 `WalletBalances.vue` 顯示，資料源頭都是 `useFinancialState`。初始餘額三幣皆為 `DEFAULT_WALLET_BALANCE = 10,000,000`（三方一致 ✅）。

### 4.2 銀行（`F-04`／`F-04b`）

`BankContent.vue`＋`components/shared/DepositContent.vue`。分頁：儲值／優惠（`activeTab`），透過 `route.query.tab` 支援 deep-link，且對舊 query 值（`vault｜transfer｜exchange｜records`）做自動 redirect 到新獨立頁（見 `applyQuery()`），**這是刻意設計的相容層**，串接或改路由結構時要留意別破壞這些既有連結。

依 [決策 §2](../decisions/2026-07-30-first-phase-alignment-decisions.md#2-儲值幣別與通道--刻意的平台差異不強制統一)：**NT$ ＋ ATM／超商／信用卡是官網的目標規格，不需要跟 APP 的 USD/IAP 對齊**，串接後端時對應後台通道類型中的 `Web-CreditCard｜Web-ATM｜MyCard｜LinePay｜AliPay`，不需支援 `iOS-IAP｜Android-IAP`。

### 4.3 保險箱（`F-04c`）

`VaultContent.vue`（1215 行，全書最大元件）。三分頁：`vault`（存取）／`transfer`（贈禮）／`exchange`（兌換），支援 `embedded` prop 與 route query（`tab`／`receiverId`）供其他頁面內嵌呼叫（例如聊天玩家卡導向贈禮並帶入收禮人）。`pages/lobby/vault.vue` 本身只是 redirect 到 `/lobby/bank?tab=vault`（見 memory `chat-feature-architecture`）——**這個 redirect 事實上已過時**，因為保險箱在畫面索引總表中已是獨立路由 `/lobby/vault`，不再掛在銀行底下；串接前建議先確認這條 redirect 邏輯是否還需要保留，或已被後續 commit 取代（`pages/lobby/vault.vue` 與 `route.query` 的實際行為以現有原始碼為準，此處提醒去重新核對，不代入舊 memory 的結論）。

### 4.4 贈禮流程（`F-04d`／`F-04e`）🔴 已拍板

依 [決策 §1](../decisions/2026-07-30-first-phase-alignment-decisions.md#1-贈禮流程--統一為雙向確認官網現況)：**官網現況即目標規格，APP 端需要對齊**。狀態機定義在 `useGiftState.ts` ＋純函式 `utils/giftRequest.ts`：

```
狀態：pending → accepted | rejected | cancelled | expired（單向終結，不可逆）

createGiftRequest()
  ├─ 檢查：dailyUsed < DAILY_GIFT_LIMIT(10)         → 否則 reason: 'max-daily'（見 GiftRequestFailure）
  ├─ 檢查：0 < amount ≤ MAX_GIFT_REQUEST_AMOUNT(1,000,000)
  ├─ 費率快照：feeRate 建立當下寫死（預設 VAULT_TRANSFER_FEE_RATE=5%），之後費率調整不影響已建立的申請
  └─ expiresAt = createdAt + 168h（GIFT_REQUEST_EXPIRY_MS）

acceptGiftRequest(id, actorId) → resolveRequest(status:'accepted')
rejectGiftRequest(id, actorId) → resolveRequest(status:'rejected')
cancelGiftRequest(id, actorId) → resolveRequest(status:'cancelled')  // 僅發起方可取消
expireGiftRequests(currentPlayerId, now) → 主動掃描 pending 且逾時的申請，批次轉 expired
```

⚠️ 費率快照機制（`normalizeFeeRate`＋建立時寫死 `feeRate`）代表**未來若要把手續費改成 VIP 分級**（`VIPLevel.gift_fee_rate`，矩陣 §4.1 提到後台已是分級但兩前台寫死 5%），前端這層的資料結構已經預留了空間（每筆申請自帶 `feeRate`），後端只需要在建立申請當下依發起人 VIP 等級決定費率，不需要改前端型別。

APP 端串接規格（本階段新增）：需要新增「贈禮申請列表」畫面（對應 `F-04e`）、申請狀態機、168h 倒數顯示（`formatGiftRequestRemainingTime` 可直接複用邏輯）、每日 10 次與單次 100 萬的**強制**檢查（不只是顯示文字）。

### 4.5 兌換（`W-06`）

`ExchangeContent.vue`（僅 3 行，實際邏輯在 `VaultContent.vue` 的 `exchange` 分頁與 `utils/walletExchange.ts`）。金→銀 1:100，銀→金需 100 倍數（`canSubmitWalletExchange` 強制），手續費 0。三方常數一致 ✅，串接時直接沿用。

### 4.6 交易紀錄（`W-07`）

`TransactionRecords.vue`。型別：`FinancialTransactionType = 'deposit'|'vault'|'gift'|'exchange'|'reward'|'spend'`（6 種），`FinancialTransactionStatus = 'success'|'processing'|'failed'`（3 種）。⚠️ **enum 三方不同**（官網 6／APP 10／後台 10 種，矩陣 §4.5），本冊不代入統一方案（未拍板），串接時需要一張三方對照表（後端串接階段的前置工作，建議下一輪拍板事項）。後台額外有 `PENDING｜EXPIRED｜MANUAL｜REFUNDED｜VERIFY_ERROR` 等狀態，兩前台目前都顯示不出來，是明確的功能落差而非命名問題。

---

## 5. 任務與活動

### 5.1 每日簽到（`F-02`）

`pages/lobby/daily.vue`，✅ 三方完全一致：里程碑 5/7/25/30 天 = 金幣、10 天 = 10,000,000 銅幣、15 天 = 銀卡（觸發獎勵卡 `daily-15-activity-silver`）、20 天 = 金卡（`daily-20-activity-gold`），補簽成本 100。已簽到日期與已領取里程碑目前是寫死的 mock 陣列（`daily.vue:17-21`），串接時整段換成後端查詢。

### 5.2 活動列表（`F-02b`）／排行榜（`F-02c`）

- 活動：`EventsContent.vue`（shared component），⚠️ 分類維度與 APP 不同（官網 `active｜upcoming｜ended` 狀態導向 vs APP `sale｜tournament｜vip` 類型導向），官網目前**無報名互動**，只顯示一句提示字串
- 排行榜：三榜一致 ✅（`multi｜win｜wealth`），⚠️ `useLeaderboardTimer.ts` 是本地假倒數，非 server 時間，串接時務必換成後端提供的 `updatedAt`，否則多裝置看到的倒數會不一致

---

## 6. 獎勵卡（`F-05`）

`RewardCardContent.vue`（993 行）＋`useRewardCardState.ts`＋`utils/rewardCardConversion.ts`。

**卡片定義**（`rewardCardDefinitions`，寫死在 composable 內，非 mock 資料而是規則常數，串接時應搬到後端設定）：

| 卡 | 觸發 | 幣別 | 面額 | 流水目標 | 轉換上限 | 到期 |
|---|---|---|---|---|---|---|
| `daily-15-activity-silver` | 簽到 15 天 | 活動銀幣 | 10,000 | 100,000 | 10,000 | 2026/12/31 |
| `daily-20-activity-gold` | 簽到 20 天 | 活動金幣 | 5,000 | 100,000 | 10,000 | 2026/12/31 |

卡片狀態機：`inactive → active → (paused) → converted`。轉換演算 `calculateRewardCardConversion`：`converted = min(現有餘額, conversionLimit)`，其餘記為 `recoveredAmount`（回收）。三方一致 ✅。

🔴 **流水累積目前是假機制**：`GameView.vue` 內有「完成流水」測試按鈕直接把某張卡的 `totalTurnover` 打滿，APP 同樣靠測試鈕。後台已有真實機制（`AssetLog` 每筆下注/中獎紀錄帶 `valid_turnover`／`remain_target`）。**這是串接時工作量最大的一塊**：需要把「玩家在遊戲內的每一注怎麼累積進獎勵卡流水」這條資料流從無到有建起來，前端目前完全沒有這條邏輯,只有寫死的測試按鈕。

⚠️ 命名：文件稱「禮物 Gifts」、UI 稱「獎勵卡」、後台稱 `BonusCard`，路由是 `/lobby/gifts` 但元件是 `RewardCardContent.vue`。建議串接前先統一命名（不影響邏輯，純粹避免溝通成本），本冊不代做決定。

---

## 7. 信箱（`F-03`）

`MailboxContent.vue`＋`useMailboxState.ts`。分類：`system｜event｜deposit`（⚠️ 與 APP `system｜promo｜personal`、後台 `SYSTEM｜PROMOTION｜COMPENSATION｜PERSONAL` 三方都不同）。

附件領取：`MailReward{ wallet, amount, label, claimed }`，結構化資料（優於 APP 寫死 50,000 金幣的作法）。`claimMailReward()` 呼叫 `addWalletReward` 寫入對應錢包並鎖定 `claimed=true` 防止重複領取，這個防重機制在串接時需要在後端也做一次（前端檢查不能作為唯一防線）。

⚠️ 官網**無批次操作**（全部已讀/全部領取/刪除已讀，APP 有）、**無未讀徽章消費者**（`InboxMessage.read` 欄位存在但沒有地方統計未讀數顯示紅點）、**無撤回**處理（後台 `recallMessage` 兩前台都無對應 UI）。

---

## 8. 聊天與社交

### 8.1 三頻道（`F-01`／`F-01b`／`F-01c`）

`pages/lobby/chat.vue`，`channels = world｜private｜support`（三方一致 ✅），透過 `route.query.channel` 切換，`selectChannel()`/`applyChannelQuery()` 維護 query 同步（可分享連結直達特定頻道）。

- **世界頻道**（`F-01`）：`OnlineRoster.vue` 玩家清單（搜尋依 name/account 切換 `searchMode`），點玩家開 `M-08` 玩家卡
- **私人頻道**（`F-01b`）：`PrivateConvList.vue` + `ChatThread.vue`，⚠️ 官網私訊**無附件選單**（APP 可在私訊內直接夾遊戲點數轉贈禮）
- **客服頻道**（`F-01c`）：見 §8.3

### 8.2 玩家卡（`M-08`，`PlayerCard.vue`，616 行）

三方一致 ✅ 的核心互動樞紐：私訊／送禮／加好友／黑名單（`useSocialState`）／檢舉（`ReportPlayerModal.vue`，⚠️ 5 個中文理由目前硬編字串，串接時應改 reason code 讓後端可統計）。送禮／轉點會導向 `/lobby/vault?tab=transfer&receiverId=...`（帶入收禮人）。

型別 `ChatPlayerProfile`（`data/siteContent.ts:36`）：`playerId｜account｜name｜avatar｜vip｜level｜status｜bio｜recentGames`，`OnlinePlayer` 繼承自它並多加 `isFriend` 等在線相關欄位。

### 8.3 客服工單（`F-01c`／`W-09`）🟢 官網已是三方最完整

`useSupportTicketState.ts`（293 行）＋`SupportTicketList.vue`（632 行）＋`SupportQuestionStart.vue`（500 行）。

```
MAX_ONGOING_SUPPORT_TICKETS = 1   // 同時只能有一張進行中的工單（矩陣提到的「5 筆上限」需核對：程式碼常數目前是 1，非 5，串接前務必以此常數為準重新確認）

建立工單：createTicket(category, subject, message)
  ├─ 檢查 category 是合法的 SupportQuestionCategoryKey（7 種分類，siteContent.ts 定義）
  ├─ 檢查 ongoingTickets.length < MAX_ONGOING_SUPPORT_TICKETS，否則 reason:'max-ongoing'
  └─ 檢查訊息非空，否則 reason:'empty-message'

狀態：ongoing → closed（單向）
玩家可持續 sendMessage() 直到工單關閉；markTicketRead() 標記已讀
特殊建立路徑：createPlayerReportTicket()（由 M-08 檢舉玩家導向，帶入 SupportPlayerReportContext）
```

✅ 已於 2026-07-30 核對：初版設計即為同時進行中上限 **1 筆**，`three-way-screen-matrix.md` 原寫「5 筆」為文件筆誤，已同步修正。串接時以 `MAX_ONGOING_SUPPORT_TICKETS = 1` 為準。

🔴 **APP 側客服左欄目前是空殼**（矩陣 §8），對齊方向明確：直接照抄官網這一整套狀態機到 APP，不需要重新設計。

---

## 9. 個人資料（`M-01` 系列）

`pages/lobby/member.vue`，四分頁（`activeSection`）：`profile｜bindings｜vip｜history`。

### 9.1 基本資料（`M-01`）／帳號綁定（`M-01b`）

可編輯欄位：暱稱／Email／生日／簡介（`profileForm`）。🔴 **官網目前可自由改 Email**，後台規則是「Email 有值即鎖定」，串接時前端要加對應的鎖定 UI（欄位 disabled + 提示文案），這是明確要修的落差，不是待確認項。

帳號綁定 5 種 provider（手機／FB／LINE／Apple／Google），⚠️ 兩前台都**無「最後一個綁定且無密碼則拒絕解除」的錯誤處理**，串接時這條規則要在前後端都補上（純前端擋不住，後端也要驗證）。

### 9.2 VIP 等級（`M-01c`）🔴 已拍板，本次改動最大的一節

依 [決策 §4](../decisions/2026-07-30-first-phase-alignment-decisions.md#4-vip-結構化門檻--官網補上結構化門檻比照-app後台)：**官網目前是純文案字串（`siteContent.member.vipUpgrade`），需重做為結構化資料**，目標規格比照 APP `VIP_LEVEL_RULES`：

- 雙條件門檻：儲值累積 **AND** 投注累積（兩者都達標才升級，非任一）
- 進度呈現：需要兩條進度條（儲值/投注各自對門檻的比例）
- 權益結構化：返水比例、手續費減免、保級規則（`retain_*`，即降級保護機制）

現有 `vipLevels`（`siteContent.ts`）目前只有等級與稱號，**沒有門檻數值與權益欄位**，這部分串接時需要新增資料結構（型別定義＋mock 假資料），UI 元件（`member.vue` 的 vip 分頁）也要整個重做以呈現門檻進度條，不是文案替換而已。這是本冊列出的落差修正項目中，前端改動量最大的一項。

### 9.3 遊戲紀錄（`M-01d`）

`GameRecords.vue`（198 行），目前 100 筆隨機生成假資料，後台已有真實查詢（`GameLogs.vue`），串接時直接換資料源即可，UI 結構可保留。

### 9.4 頭像（`W-10`）

`member.vue` 內建 12 個 emoji（非圖片），VIP5 解鎖後 10 款額外圖示（`index >= 10 && vip < 5` 為鎖定條件，寫在 `member.vue:51`）。🔴 三方全不同（官網 12 emoji／APP 20 款圖片／後台 `/system/default-avatars` + 檔案上傳），本輪決策未涵蓋此項（矩陣列為 ⚠️ 非 🔴 需拍板項），維持現況記錄，留待下一輪決策。

---

## 10. 官網公開頁（無 APP 對應，`W-11`~`W-16`）

`events.vue`／`leaderboard.vue`／`tutorial.vue`／`deposit.vue`／`support.vue`／`member.vue`（根層級，非 `pages/lobby/`）都是登入前也能看的行銷頁，各自透過 `Shared*Content.vue` 元件與大廳內的登入後版本共用邏輯（`SharedEventsContent`／`SharedLeaderboardContent`／`SharedSupportContent`／`SharedDepositContent`）。串接時這層共用元件是資料源頭，改一次兩邊（公開頁＋大廳頁）都會更新，不需要分別串接。

---

## 附錄：串接優先序建議（依本冊落差嚴重度排序，非最終定案，供後端排期參考）

1. **VIP 結構化門檻**（`M-01c`）——資料結構要新增，且獎勵卡/贈禮費率之後若走 VIP 分級都依賴這份資料
2. **贈禮 APP 端補流程** —— 官網邏輯已就緒可直接參照，APP 改動量大但路徑清楚
3. **獎勵卡真實流水累積** —— 目前完全靠假按鈕，是三方中唯一「前端邏輯掛零」的功能區塊
4. **交易類型 enum 統一** —— 需要三方對照表，屬於串接前的橋接工作，不是單一前端能決定
5. **客服工單常數核對**（矩陣 5 筆 vs 程式碼 1 筆）—— 5 分鐘可以查清楚但會卡住工單相關的後續規格討論，建議優先排查
