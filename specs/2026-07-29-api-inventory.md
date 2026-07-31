# 巨亨ONLINE — 後端 API 需求盤點（從前端反推）

- 建立日期：2026-07-29
- 盤點基準：commit `aa326bd`（feat: add support ticket workflow）
- 方法：唯讀掃描 `composables/`、`utils/`、`components/`、`pages/`、`data/`、`tests/`，反推每個狀態讀取點（Query）與變更點（Mutation）
- **重要前提**：目前全專案**沒有任何 `fetch` / `$fetch` / `useFetch` 呼叫**，所有資料皆為前端 mock、存活於 `useState` 記憶體，重整即重置（唯二例外：`jh_isLoggedIn`、`jh_userInfo`、`jh_recentGames` 三個 localStorage key）。
- 本文件**只描述前端已存在的行為與需求**。凡前端未定義、需由業務決策拍板者，一律標注 `not_stated`，不做臆測。

---

## 0. 總覽

| # | 領域 | 端點數（估） | 即時性 | 關鍵風險 |
|---|---|---|---|---|
| 1 | 認證與帳號 | 12 | REST | 目前**完全無 token 概念**，需從零設計 |
| 2 | 會員 / VIP | 6 | REST | VIP 門檻目前只有文案字串，無結構化數值 |
| 3 | 站台內容（CMS） | 8 | REST + 快取 | 純靜態，可走 CDN／build-time |
| 4 | 遊戲大廳與啟動 | 7 | REST | 遊戲啟動 URL 目前寫死 `example.com`，需 launch token |
| 5 | 錢包與交易 | 10 | REST | 需交易冪等性與併發控制 |
| 6 | 贈禮（雙向確認） | 6 | REST + push | 逾期退款需後端排程，非前端輪詢 |
| 7 | 獎勵卡與流水 | 6 | REST + push | **流水累積機制前端完全不存在**，需後端定義 |
| 8 | 每日任務 | 5 | REST | 「今天」目前由 client 決定，須改由 server 判定 |
| 9 | 社交（好友／黑名單） | 6 | REST | 無好友請求／同意流程，目前單方面加入 |
| 10 | 聊天（世界／私訊） | 8 | **WebSocket** | 訊息載體缺 playerId、缺 timestamp、缺分頁 |
| 11 | 客服工單與檢舉 | 7 | **WebSocket** | `ongoing → closed` 前端無路徑，須由客服端推送 |
| 12 | 信箱 | 5 | REST + push | 領取附件跨域寫錢包，需交易保證 |

---

## 1. 認證與帳號

### 1.1 現況
`components/LoginModal.vue` 全檔無網路請求，一律 `delay(ms)` 假等待。登入成功後 `useAppState.login()`（`composables/useAppState.ts:77-92`）只改記憶體並寫兩個 localStorage key，**沒有 token、沒有過期時間**；復原時只檢查 `jh_isLoggedIn === 'true'`（`useAppState.ts:124-134`）——任何人改 localStorage 即可偽登入。

### 1.2 需要的端點

| 方法 | 路徑（建議） | 輸入 | 回傳 | 前端來源 |
|---|---|---|---|---|
| POST | `/auth/login` | account, password | token, refreshToken, expiresIn, profile | `LoginModal.vue:163-184` |
| POST | `/auth/register` | account, nickname, password, referralCode?, termsVersion | 同上 | `LoginModal.vue:382-393` |
| POST | `/auth/guest` | — | 同上（authProvider=`guest`） | `LoginModal.vue:186-192` |
| POST | `/auth/phone/send-code` | phone | cooldownSeconds | `LoginModal.vue:194-202` |
| POST | `/auth/phone/verify` | phone, code | token 組 | `LoginModal.vue:204-215` |
| POST | `/auth/social/{provider}` | OAuth code / id_token | token 組 | `LoginModal.vue:217-232` |
| POST | `/auth/recovery/identify` | account | branch: `phone｜social｜unbound`, maskedPhone | `LoginModal.vue:268-304` |
| POST | `/auth/recovery/send-code` | recoveryToken | cooldownSeconds | `LoginModal.vue:313-319` |
| POST | `/auth/recovery/verify` | recoveryToken, code | resetToken | `LoginModal.vue:328-337` |
| POST | `/auth/recovery/reset` | resetToken, newPassword | ok | `LoginModal.vue:339-368` |
| POST | `/auth/refresh` | refreshToken | 新 token 組 | not_stated（前端無此概念） |
| POST | `/auth/logout` | — | ok | `useAppState.ts:94-106` |

### 1.3 前端已實作的驗證規則（server 須重驗）
| 規則 | 值 | 來源 |
|---|---|---|
| 帳號字元集 | `/^[A-Za-z0-9\p{Script=Han}]+$/u` | `utils/account.ts:4` |
| 帳號長度 | 半形 4–20（中文計 2） | `utils/account.ts:6-9,19-24` |
| 密碼長度 | ≥6 | `LoginModal.vue:74` |
| 暱稱長度 | ≥2 | `LoginModal.vue:53-60` |
| 手機格式 | `^09\d{8}$` | `LoginModal.vue:196` |
| 驗證碼 | 硬編 `123456`（mock） | `LoginModal.vue:206,331` |
| 推薦碼 | 空 或 `^[A-Z0-9]{6}$` 或 `^[A-Z0-9]{8}$` | `LoginModal.vue:49-51` |
| 條款審閱 | 必須開過 legal modal 且 `lastReviewedDocument==='terms'` | `LoginModal.vue:91-93`、`useLegalState.ts:13-16` |
| 驗證碼倒數 | 60 秒 | `LoginModal.vue:124-131` |

### 1.4 前端完全未處理、後端接上後必須新增的錯誤
網路失敗 / timeout / 5xx、帳號已存在、帳號或密碼錯誤、帳號被鎖定或停權、驗證碼發送頻率限制、token 過期與續期。

### 1.5 not_stated
- token 存續期、refresh 策略、多裝置登入政策
- 社群登入的 OAuth redirect flow（目前無 redirect、無 token 交換）
- 推薦碼是否需校驗存在性（前端只驗格式）
- 忘記密碼的分支目前是用帳號字面值判定（`line888` / `unbound888`，`LoginModal.vue:289-299`），真實判定依據

---

## 2. 會員 / VIP

| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/me` | profile 全欄位 | `useAppState.ts:10-29`、`data/siteContent.ts:559-582` |
| PATCH | `/me` | name, email, birthday, bio | `useAppState.ts:108-111`、`member.vue:45-48` |
| PUT | `/me/avatar` | avatarId (1–12) | `member.vue:49-55` |
| GET | `/me/vip` | 目前等級、累積儲值/投注、下一級門檻 | `member.vue:29-34`、`siteContent.ts:583-586` |
| POST | `/me/bindings/{provider}` | 綁定 | `member.vue:56-63`、`useAppState.ts:113-116` |
| DELETE | `/me/bindings/{provider}` | 解綁 | 同上 |

**UserProfile 欄位**（`useAppState.ts:8`，來源 `siteContent.ts:559-582`）：
`id`(string,✅)、`account`(✅)、`name`(✅)、`vip`(number 0–10,✅)、`avatar`(emoji,✅)、`avatarId`(number 1–12,✅)、`bio`(≤120字,✅)、`birthday`(`YYYY-MM-DD`,✅)、`email`(✅)、`phone`(遮罩,✅)、`authProvider`(union,✅)、`accountBindings`(`{phone,facebook,line,apple,google:boolean}`,✅)。
**錢包餘額不在 profile 內**，由 `useFinancialState` 合併（`useAppState.ts:38-44`）。

**業務規則**：頭像 index ≥10 需 `vip >= 5`（`member.vue:50-51`）。

**not_stated / 待決策**
- VIP 升級與保級條件目前只有**人類可讀文案字串**（`upgradeRequirement` / `maintainRequirement`，`siteContent.ts:588-710`），沒有結構化門檻數字；`vipUpgrade.target` 是全域單一組、不隨玩家等級變動（`siteContent.ts:584-585`）。**需 Cooper 拍板每級的實際數值門檻。**
- 綁定/解綁目前**無任何驗證步驟**（解綁手機不需驗證碼），真實安全流程 not_stated。
- email 格式、生日合理性前端皆未驗（`member.vue:45-48`）。
- `siteContent.member.vipTargets`（`:587`）與 `historyItems`（`:711-717`）為殘留無引用資料。

---

## 3. 站台內容（CMS，無使用者維度）

以下皆為靜態內容，可走 CMS + CDN，不需業務 API：

| 內容 | 來源 |
|---|---|
| 跑馬燈系統公告 | `siteContent.ts:283-290` |
| Banner 輪播 | `siteContent.ts:291-322` |
| 首頁快捷 / 最新消息 / 精選活動卡 | `siteContent.ts:324-341` |
| 遊戲分類定義 | `siteContent.ts:343-361` |
| 遊戲清單與 metadata | `siteContent.ts:362-392, 453-488` |
| 遊戲介紹與規則文案 | `GameView.vue:49-74, 81-135`（**硬編在元件內**，建議移入 CMS） |
| 捷徑安裝教學 | `siteContent.ts:393-452` |
| FAQ | `siteContent.ts:524-557` |
| VIP 等級權益表 | `siteContent.ts:588-710` |
| 每日簽到獎勵表 / 里程碑 / 補簽費用 | `siteContent.ts:725-746` |
| 法遵文件 | `useLegalState.ts:1` |

### 混合型（內容靜態、數值動態）
| 項目 | 需要 API 的部分 | 來源 |
|---|---|---|
| 排行榜 | 名次/名稱/金額/`updatedAt` | `siteContent.ts:489-513`；`useLeaderboardTimer.ts:11` 目前只是本地每秒 +1 的假計時 |
| 活動 | `status`、`endDate`、`prize`、**玩家是否已報名（前端完全缺席）** | `siteContent.ts:514-523`、`EventsContent.vue:21-28` |
| 跑馬燈中獎播報 | 即時中獎資料 | `siteContent.ts:285` |

> ⚠️ **安全**：跑馬燈 `text` 內嵌 raw HTML（`siteContent.ts:285`）。若改由 API 回傳 HTML 將形成 XSS 面，建議改回結構化欄位由前端組裝。
> ⚠️ `LeaderboardItem.amount` 目前是**含單位的字串**（`'2,580,000 金幣'`、`'×2,560 倍'`，`siteContent.ts:229-231`）。API 應回結構化 `{value:number, unit:string}`。

---

## 4. 遊戲大廳與啟動

| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/games` | 遊戲 catalog（含 category/provider/rtp/badge/圖） | `GameBrowser.vue:9-15` |
| GET | `/games/search` | server 端搜尋與排序（目前純前端 filter） | `GameBrowser.vue:46-48,109-125` |
| GET | `/me/recent-games` | 最近遊玩（目前存 localStorage，跨裝置需 API） | `useRecentGames.ts:22-28` |
| POST | `/me/recent-games` | 記錄一筆 | 同上 |
| **POST** | **`/games/{key}/launch`** | **輸入 `wallet: GameWalletKey`（+`machineId?`），回傳一次性遊戲 URL / launch token** | `GameLaunchModal.vue:29-31`、`pages/lobby/index.vue:34-40`、`GameView.vue:33-37` |
| GET | `/games/{key}/machines` | 機台清單與即時狀態 | `gameMachines.ts:18-39`（目前為 seed 演算法生成） |
| POST | `/games/{key}/machines/{id}/reserve` | 預約機台 | `SeatSelectionModal.vue:25`（目前只推本地陣列） |

**啟動流程唯一需要玩家決定的參數 = 幣別**（`GameWalletKey`：`stored-gold｜activity-gold｜stored-silver｜activity-silver｜bronze`，`utils/gameWallets.ts:3-8`），預設 `stored-gold`（`:24`）。

**篩選規則**（目前純前端，量大時應改 server 端）：
- `hot` = `badge === '熱門'`；`latest` = `badge === '新上線' || key.includes('newgame')`；`live` → `category === 'baccarat'`（`GameBrowser.vue:109-115`）
- 搜尋比對 `name`/`desc`/`provider`（`:46-48`）；排序 `hot|az|za|latest`（`:117-125`）；分頁 PAGE_SIZE=20（`:8`）

**遊戲紀錄查詢**：`GET /me/game-records?from=&to=&page=` — 欄位 `id`、`time`(epoch ms)、`game`、`bet`、`win`(可負)、`balance`（`GameRecords.vue:4-11`）。目前 100 筆在 `onMounted` 隨機生成（`:36-66`）。

**not_stated / 需決策**
- **兩份遊戲清單並存**：`siteContent.games`(24) 與 `siteContent.lobbyGames`(30)，key 空間不同、內容重疊，消費端一律 concat 後找 key（`GameLaunchModal.vue:13`、`GameView.vue:14`）。**後端應統一為單一 catalog。**
- **`SeatSelectionModal.vue` 是 dead code**：全專案唯一引用是它自己；`GameView` 的 `machineId` prop（`:10`）永遠不會被傳入（`pages/lobby/index.vue:85`）。選座位是否納入正式流程需拍板。
- `GameLaunchModal` **不檢查餘額**：餘額 0 的錢包照樣可選可進入（`GameLaunchModal.vue:29-31`、`gameWallets.ts:44-47`）。最低進場金額 not_stated。
- `GameRecords.game` 存的是遊戲**中文名稱字串**（`:58`）而非 gameKey，無法回連遊戲實體。
- 真實遊戲啟動是否需 launch token / 一次性 session URL / redirect：not_stated（目前 `https://example.com/{demo|real}/{gameKey}`）。
- 機台在送出瞬間被別人佔用的併發處理：not_stated。

---

## 5. 錢包與交易

### 5.1 錢包模型
四個主錢包（`useFinancialState.ts:25-31`）：`balance`(金幣)、`silverBalance`(銀幣)、`bronzeBalance`(銅幣)、`vaultBalance`(保險箱金幣)。預設各 10,000,000，保險箱 0（`utils/wallets.ts:17`、`siteContent.ts:578-581`）。
遊戲另有五分類錢包 `GameWalletKey`（`utils/gameWallets.ts:3-8`），其中 activity-gold/silver 來自獎勵卡（見 §7）。

### 5.2 端點

| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/me/wallets` | 四錢包餘額 | `useAppState.ts:38-44` |
| GET | `/me/transactions?type=&status=&page=` | 交易紀錄 | `TransactionRecords.vue:8,19-22` |
| GET | `/deposit/plans` | 儲值方案 | `DepositContent.vue:25-32` |
| POST | `/deposit/orders` | 建立儲值訂單 | `DepositContent.vue:50-65` |
| GET | `/deposit/orders/{id}` | 查詢訂單狀態（`processing` 需要） | not_stated（前端 1200ms 直接成功） |
| POST | `/vault/deposit` | 存入保險箱 | `useFinancialState.ts:217-230` |
| POST | `/vault/withdraw` | 取出保險箱 | `useFinancialState.ts:232-245` |
| POST | `/wallets/exchange` | 金↔銀兌換 | `useFinancialState.ts:321-344` |

### 5.3 FinancialTransaction 欄位（`useFinancialState.ts:13-23`）
| 欄位 | 型別 | 必填 | 備註 |
|---|---|---|---|
| id | string | ✅ | 前端產 `TX-{6位補零}`，序號起始 100（`:131,139-142`）→ **應由 server 發號** |
| type | `deposit｜vault｜gift｜exchange｜reward｜spend` | ✅ | `:10` |
| title | string | ✅ | |
| amount | number | ✅ | 帶正負號，負值＝扣款 |
| wallet | `gold｜silver｜bronze` | ✅ | |
| status | `success｜processing｜failed` | ✅ | `:11`。**前端只會寫入 `success`** |
| createdAt | string | ✅ | 已格式化本地字串 → **API 應回 ISO8601** |
| detail | string | ❌ | 人類可讀說明 |
| referenceId | string | ❌ | 僅贈禮交易，值＝ `GiftRequest.id`（`:285,302`） |

### 5.4 業務規則與常數
| 規則 | 值 | 來源 |
|---|---|---|
| 保險箱轉帳／贈禮手續費率 | 0.05（5%） | `utils/vaultTransfer.ts:1` |
| 手續費計算 | `fee = floor(amount * rate)`；`actualReceived = max(0, amount - fee)` | `utils/vaultTransfer.ts:20-25` |
| 金→銀匯率 | 1 : 100 | `utils/walletExchange.ts:3,17-19` |
| 銀→金匯率 | 100 : 1（floor），**金額須為 100 的倍數** | `utils/walletExchange.ts:19,36` |
| 兌換手續費 | 固定 0 | `utils/walletExchange.ts:9,25` |
| 消費規則 | 金額 >0 且 ≤ 餘額，否則回 null | `utils/walletSpend.ts:9` |
| 所有金額一律 `Math.floor` 且下限 0 | — | `vaultTransfer.ts:13-16`、`walletExchange.ts:16`、`walletSpend.ts:7-8` 等 |
| 儲值方案（NT$→金幣） | 300→300、500→550、1000→1150、2000→2400、5000→6200、10000→13000 | `DepositContent.vue:26-31` |

> ✅ 這些規則已有 node 測試覆蓋：`tests/vaultTransfer.test.mjs`、`walletExchange.test.mjs`、`walletSpend.test.mjs`、`gameWallets.test.mjs`、`account.test.mjs`（`node --test tests/` 執行）。後端實作應以這些測試為契約基準。

### 5.5 錯誤碼需求
`insufficient-balance`（餘額不足）、`invalid-amount`（金額 ≤0 或非整數）、`exchange-unit-mismatch`（銀→金非 100 倍數）、`deposit-order-failed`。
前端文案對照見 `VaultContent.vue:394-407`、`daily.vue:149-152`。

### 5.6 疑點 / not_stated
1. **保險箱存／取失敗時 UI 無任何提示** — `confirm()` 忽略回傳值（`VaultContent.vue:223-228`），需補 UI。
2. **`processing` / `failed` 交易狀態無產生路徑** — ATM／超商儲值 mock 一律 1200ms 後 success（`DepositContent.vue:59-64`）。真實非同步入帳、失敗回滾流程 not_stated。
3. **`transferFromVault`（`useFinancialState.ts:306-319`）為死碼** — 代表另一套「即時轉帳」語意，與現行的申請/接受流程並存。後端該支援哪一種需拍板。
4. **儲值優惠未套用** — 「首儲 +100%」「每週回饋 15%」「VIP 加碼 30%」（`siteContent.ts:516,521,522`）在計算上完全未生效，bonus 已內含在方案 `points` 內。**優惠疊加規則需 Cooper 拍板。**
5. 付款資料 `cardForm`/`pointForm`（`DepositContent.vue:21-22`）收集後完全未使用、未驗證。
6. 時間表示不一致：交易 `createdAt` 是本地格式化字串、贈禮每日額度用 Asia/Taipei、`GiftRequest.createdAt` 是 epoch ms。**需統一為 ISO8601 + 明確時區。**
7. 冪等性：目前只在贈禮入帳靠 `requestId + title` 去重（`useFinancialState.ts:154-160`）。所有金流端點都需要 idempotency key。

---

## 6. 贈禮（雙向確認流程）

### 6.1 端點
| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/gifts/requests` | 與我相關的申請（pending / expired） | `useGiftState.ts:100-107` |
| GET | `/gifts/quota` | 今日剩餘次數、單筆上限、費率 | `useGiftState.ts:12,189` |
| POST | `/gifts/requests` | 送出申請（保險箱預扣） | `useGiftState.ts:168-207` |
| POST | `/gifts/requests/{id}/accept` | 收禮者接受 | `useGiftState.ts:235-241` |
| POST | `/gifts/requests/{id}/reject` | 收禮者拒絕 | `useGiftState.ts:242-244` |
| POST | `/gifts/requests/{id}/cancel` | 送禮者取消 | `useGiftState.ts:225-244` |
| GET | `/players/search?account=` | 收禮者查詢 | 目前只能從線上名單挑（`VaultContent.vue:109-111,196`） |

### 6.2 GiftRequest 欄位（`utils/giftRequest.ts:26-38`）
`id`(`GIFT-{6位}`,✅)、`sender`/`receiver`(GiftParty 完整快照,✅)、`amount`(已 floor,✅)、`feeRate`(**凍結快照**,✅)、`fee`(凍結,✅)、`actualReceived`(凍結,✅)、`status`(`pending｜accepted｜rejected｜cancelled｜expired`,✅)、`createdAt`(epoch ms,✅)、`expiresAt`(✅)、`resolvedAt`(❌)。
`GiftParty`（`:10-15`）：`playerId`、`account`、`name`、`avatar` 全必填。

### 6.3 業務規則
| 規則 | 值 | 來源 |
|---|---|---|
| 單筆上限 | 1,000,000 | `utils/giftRequest.ts:7`、`useGiftState.ts:186` |
| 申請有效期 | 168 小時（7 天） | `utils/giftRequest.ts:6` |
| 每日申請次數上限 | 10 | `useGiftState.ts:12,189` |
| 每日重置時區 | Asia/Taipei，key = `YYYY-MM-DD` | `utils/giftRequest.ts:8,49-61` |
| 費率快照 | 預設 0.05，可覆寫並夾在 [0,1] | `utils/giftRequest.ts:63-69,76-79` |
| 資金來源 | **保險箱**，送出即預扣 | `useFinancialState.ts:247-252` |

### 6.4 錯誤碼（前端已定義，API 應對齊）
`daily-limit`、`amount-limit`、`invalid-amount`、`invalid-recipient`、`insufficient-balance`、`not-allowed`、`not-found`。
文案對照 `VaultContent.vue:301-311,381-382`。

### 6.5 ⚠️ 已知缺陷與 not_stated
1. **🔴 拒絕贈禮不會退款** — `useGiftState.ts:242-244` 的 `else if (isSender)` 分支在 `rejected` 情境下永遠為 false（拒絕者必為 receiver），金額既未入帳也未退回保險箱。**但 UI 明確承諾會退回**（`VaultContent.vue:78`）。這是資金憑空消失的 bug，後端必須明確定義退款責任方，前端需同步修復。
2. **保險箱預扣沒有交易紀錄** — `reserveGiftFromVault`（`useFinancialState.ts:247-252`）只扣餘額不寫 transaction，取消退款（`:243`）亦然，使用者對帳會出現斷點。
3. **逾期由前端每 60 秒輪詢判定**（`VaultContent.vue:157-160`、`useGiftState.ts:151-166`）——關掉瀏覽器就不會逾期退款。**必須改為後端排程 job。**
4. 收禮者查詢目前受限於聊天線上名單，真實的依帳號搜尋、是否存在、是否可收禮 not_stated。
5. `PlayerSearchModal` 用 `userInfo.id` 當 `currentPlayerId`（`VaultContent.vue:770`），但玩家實體的 key 是 `playerId` — **兩套 id 命名體系需後端統一。**

---

## 7. 獎勵卡與流水

### 7.1 端點
| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/me/reward-cards` | 獎勵卡清單 | `useRewardCardState.ts:41-64` |
| POST | `/me/reward-cards/{id}/activate` | 啟用 | `:126-136` |
| POST | `/me/reward-cards/{id}/pause` | 停用 | `:138-143` |
| DELETE | `/me/reward-cards/{id}` | 刪除 | `:145-151` |
| GET | `/me/reward-cards/{id}/turnover` | 流水進度 | **not_stated** |
| GET | `/me/notices/conversions` | 轉換完成通知 | `:181-193` |

### 7.2 欄位與規則
`RewardCard`（`useRewardCardState.ts:6-24`）：`id`、`milestoneDay`、`title`、`currency`(`activity-gold｜activity-silver`)、`amount`、`totalTurnover`、`turnoverTarget`、`conversionLimit`、`expiresAt`、`status`(`inactive｜active｜paused｜converted`)、`currentBalance`、`convertedAmount`、`recoveredAmount`、`convertedAt`。

| 規則 | 值 | 來源 |
|---|---|---|
| 轉換計算 | `converted = min(balance, conversionLimit)`；`recovered = balance - converted`（超額由系統回收） | `utils/rewardCardConversion.ts:13-19` |
| 同幣別同時只能一張 active | 啟用時其他同幣別改 `paused` | `useRewardCardState.ts:129-134` |
| 活動錢包總額 | active + paused；可用額只算 active | `:86-97` |
| 15 天卡 | 活動銀幣 10,000／流水目標 100,000／轉換上限 10,000 | `:43-52` |
| 20 天卡 | 活動金幣 5,000／流水目標 100,000／轉換上限 10,000 | `:53-63` |

> ✅ 已有測試：`tests/rewardCardConversion.test.mjs`

### 7.3 🔴 重大缺口
1. **流水累積機制完全不存在** — `totalTurnover` 只在轉換瞬間被直接設為 `turnoverTarget`（`useRewardCardState.ts:173`），觸發點是遊戲頁的手動測試按鈕 `mockTurnoverComplete`（`GameView.vue:28-29`）。**真實流水如何隨下注累加、由誰判定達標、以什麼頻率回報前端 — 全部 not_stated，需 Cooper 拍板流水認列規則。**
2. **`expiresAt` 純顯示** — `'2026/12/31'` 字串（`:51,62`），無任何過期判定或清算邏輯。
3. 轉換失敗（非 active／可轉換額為 0）回 null 但 **UI 無提示**（`:155,158,171`）。
4. 遊戲實際扣款走哪個錢包 not_stated：`GAME_WALLET_OPTIONS` 是寫死常數（活動 250,000，`gameWallets.ts:25`），`resolveGameWalletOptions` 雖存在但未見被使用。

---

## 8. 每日任務

| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/me/checkin` | 本月已簽日、已領里程碑、server 端「今天」 | `daily.vue:21-24` |
| POST | `/me/checkin` | 簽到 | `daily.vue:64-75` |
| POST | `/me/checkin/makeup` | 補簽（先扣 100 金幣） | `daily.vue:139-163` |
| POST | `/me/checkin/milestones/{day}/claim` | 領取里程碑 | `daily.vue:77-121` |
| GET | `/checkin/config` | 獎勵表（可歸 CMS） | `siteContent.ts:725-746` |

**常數**：31 天每日獎勵表（`siteContent.ts:736-744`）、補簽 100 金幣/天（`:745`）、里程碑 5天100／7天200／25天3,500／30天8,888（`:727-733`）、第 10 天銅幣 10,000,000（`daily.vue:10-11`）、15/20 天發獎勵卡。

**not_stated**
- **「今天」目前由 client `new Date()` 決定**（`daily.vue:14-16`），且 `checkedDays` 是寫死的 useState 初值（`:21-22`）。**必須改由 server 判定，含時區與跨日邊界。**
- `totalCheckins` 用的是**總簽到數而非連續數**（`:28`），里程碑到底看哪個 not_stated。
- server 端對重複簽到／重複領取的拒絕：not_stated。
- `checkedDays`/`claimedMilestones` 與 `rewardCards` 有重複真相來源問題。

---

## 9. 社交（好友／黑名單）

| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/me/friends` | 好友清單 | `useSocialState.ts:28` |
| POST | `/me/friends` | 加好友 | `:33-45` |
| DELETE | `/me/friends/{playerId}` | 移除好友 | `:47-51` |
| GET | `/me/blocks` | 黑名單 | `settings.vue:8` |
| POST | `/me/blocks` | 封鎖（**同時自動移除好友**） | `:58-72` |
| DELETE | `/me/blocks/{playerId}` | 解除封鎖（**不自動復原好友**） | `:74-78` |
| GET | `/players/{playerId}` | 玩家公開檔 | `PlayerCard.vue:4` |

`SocialPlayer`（`:3-12`）：`playerId`、`name`、`avatar`、`addedAt`(epoch ms)；`BlockedPlayer` 另加 `blockedAt`。
`ChatPlayerProfile`（`siteContent.ts:35-46`）：`playerId`、`account`、`name`、`avatar`、`vip`、`level`、`status`(`在線｜遊戲中｜閒置`)、`bio`、`recentGames`、`isFriend?`。

**not_stated**
- **好友請求／同意流程不存在** — `addFriend` 是單方面立即加入（`:33-45`），沒有 pending/accept 狀態。**需拍板是否要雙向同意。**
- 封鎖是單向且僅本機；對方是否還能發訊給我 not_stated。
- 加好友重複時前端靜默（`OnlineRoster.vue:32`），無提示。
- 全部狀態只存記憶體，`initSocialFromStorage` 是空函式（`:31`）。

---

## 10. 聊天（世界頻道 / 私人對話）— 需 WebSocket

### 10.1 兩種資料流的本質差異
| | 世界頻道 | 私人對話 |
|---|---|---|
| 資料結構 | 單一全域訊息陣列 | per-conversation 實體 |
| 收件人 | 無 | peer |
| unread | 無 | 有 |
| 黑名單過濾 | **不過濾**（黑名單玩家訊息仍顯示，只是點不開名片） | 禁止送訊 |
| 訊息帶 playerId | ❌ **只有顯示名 `user`**，前端靠 name 反查 profile | peer 有 playerId |
| 來源 | `chat.vue:47` ← `siteContent.ts:881-887` | `chat.vue:50-56` ← `siteContent.ts:888-936` |

### 10.2 端點
| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/chat/world/messages?cursor=` | 世界訊息歷史（分頁 not_stated） |
| GET | `/chat/online?cursor=` | 在線名單（目前全量陣列，`chat.vue:153`） |
| GET | `/chat/conversations` | 私人對話清單 |
| GET | `/chat/conversations/{id}/messages?cursor=` | 對話訊息 |
| POST | `/chat/conversations` | 建立新對話 |
| POST | `/chat/world/messages` | 發世界訊息 |
| POST | `/chat/conversations/{id}/messages` | 發私訊（peer 非黑名單） |
| POST | `/chat/conversations/{id}/read` | 標記已讀 |
| GET | `/players/search?q=` | 玩家搜尋（目前前端全量 filter，`OnlineRoster.vue:21-29`） |

### 10.3 WebSocket 事件（必要）
| 事件 | 理由 | 來源 |
|---|---|---|
| `world.message` | 前端只有本機 push，別人的訊息永遠不會出現 | `chat.vue:47,127` |
| `private.message` | `unread` **只有歸零路徑、沒有增加路徑**，代表增量必來自推送 | `chat.vue:75,229` |
| `conversation.created` | 前端只在自己主動時 unshift 新 conv | `chat.vue:215-224` |
| `roster.update` | status（在線/遊戲中/閒置）是即時態，roster 目前是一次性快照 | `chat.vue:153` |

### 10.4 ChatMessage 欄位（`siteContent.ts:20-27`）
`id`(number,✅)、`user`(顯示名,✅)、`avatar`(emoji,✅)、`text`(✅)、`time`(**已格式化字串**,✅)、`self`(❌)。

### 10.5 🔴 資料模型缺陷（後端設計時必須修正）
1. **訊息載體缺 `playerId`** — 世界訊息只有 `user` 顯示名，前端靠 name 反查 profile（`chat.vue:160-165`）。同名玩家即崩潰。
2. **缺 timestamp** — `time` 全是已格式化本地字串（`'14:02'`、`'昨天 21:16'`），無 ISO8601。
3. **id 空間衝突** — 世界訊息 id 用 `Date.now()`（`chat.vue:118`）、新對話 id 也用 `Date.now()`（`:218`）、客服工單用遞增序號（`useSupportTicketState.ts:114-117`）。
4. 訊息分頁 / 歷史載入 / 捲動載入：not_stated（全部一次性陣列）。
5. 樂觀更新與失敗回滾：not_stated（送出無任何失敗分支）。
6. 訊息長度上限、敏感詞過濾、發言頻率限制：not_stated。
7. 「誰在線」的定義、心跳、離線移除：not_stated。
8. 協定、鑑權、重連策略皆 not_stated（`specs/2026-06-15-chat-player-list-design.md:42` 只留一句「未來接 WebSocket 再替換資料來源」）。

---

## 11. 客服工單與檢舉

### 11.1 狀態機
```
[草稿(前端 only)] --送出第一則訊息--> ongoing --客服結案--> closed
[檢舉流程] --------------------------> ongoing
                                        ↕ 玩家送訊 / 客服回覆(unread+1)
```
- `status` 列舉只有 `ongoing`、`closed`（`siteContent.ts:75`）。「草稿」是 UI 偽狀態（`chat.vue:387`），不存在於資料模型。
- **`ongoing → closed` 前端沒有任何程式路徑**，僅出現在 seed 資料（`siteContent.ts:973`）。**必須由後端／客服端觸發並推送。**
- `closed` 為終態：輸入框唯讀（`chat.vue:430`、`ChatThread.vue:10`），送訊與客服回覆皆被 `reason:'closed'` 擋下（`useSupportTicketState.ts:191,214`）。玩家能否主動結案 not_stated。
- **同時最多 5 筆 ongoing**（`MAX_ONGOING_SUPPORT_TICKETS = 5`，`useSupportTicketState.ts:11`），closed 不計入。

### 11.2 端點
| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/support/categories` | 7 種分類（可歸 CMS） | `siteContent.ts:99-107` |
| GET | `/support/tickets?status=` | 工單清單（依 `updatedAt` desc） | `useSupportTicketState.ts:83-91` |
| GET | `/support/tickets/{id}` | 單一工單全文 | `chat.vue:398-433` |
| POST | `/support/tickets` | 建立工單（分類 + 首則訊息） | `:164-179` |
| POST | `/support/tickets/{id}/messages` | 玩家送訊 | `:181-200` |
| POST | `/support/tickets/{id}/read` | 標記已讀 | `:226-234` |
| POST | `/reports` | 檢舉玩家（目前建為 report 類工單） | `:236-270` |

**WebSocket 事件**：`support.message`（客服回覆，unread+1）、`support.ticket.closed`。`receiveSupportMessage`（`:202-224`）註解已明寫 "Reserved for API/WebSocket integration"，且**目前沒有任何呼叫端**。

### 11.3 SupportTicket 欄位（`siteContent.ts:86-97`）
`id`(`CS-000001`,✅)、`categoryKey`(✅)、`categoryLabel`(冗餘,✅)、`subject`(✅)、`status`(✅)、`createdAt`(ISO8601,✅)、`updatedAt`(ISO8601,✅)、`unread`(number,✅)、`messages`(✅)、`reportContext`(❌，僅 report 類)。
分類 key（`:59-66`）：`account｜deposit｜withdrawal｜game｜event｜vault｜report`。

### 11.4 錯誤碼（`useSupportTicketState.ts:19-30`）
`max-ongoing`、`invalid-category`、`empty-message`、`not-found`、`closed`、`invalid-report-target`。
文案對照 `chat.vue:98-110,177-186,243-246`。

### 11.5 not_stated
- **檢舉沒有獨立實體**，只被塞成一筆 support ticket + `reportContext`（`:252-269`）。是否需要獨立的 report 資源與後台審核流程需拍板。
- **檢舉理由是前端硬編碼中文字串陣列** `['不當言論','騷擾行為','疑似詐騙','冒用身份','其他']`（`ReportPlayerModal.vue:9`）——**後端應提供 reason code 而非中文字串。**
- 客服自動回覆／機器人：前端無任何模擬，not_stated。
- `ticketSequence` / `messageSequence` 是前端自行維護的 id 產生器（`:13-17`），接後端後應由 server 發號。

---

## 12. 信箱

| 方法 | 路徑 | 說明 | 來源 |
|---|---|---|---|
| GET | `/me/inbox` | 信件清單 | `useMailboxState.ts:9-16` |
| POST | `/me/inbox/{id}/read` | 標記已讀 | `:22` |
| DELETE | `/me/inbox/{id}` | 刪除 | `:23` |
| POST | `/me/inbox/{id}/claim` | 領取附件（**跨域寫錢包**） | `:25-31` |
| — | WS `inbox.new` | 新信推送 | not_stated |

`InboxMessage`（`:3-7`）：`id`(number,✅)、`title`、`preview`、`body`、`time`(**相對字串「2 小時前」，非 timestamp**,✅)、`read`(✅)、`type`(`system｜event｜deposit`,✅)、`reward`(❌)。
`MailReward`：`wallet`(WalletKey)、`amount`、`label`、`claimed` 全必填。

**not_stated**：無未讀角標消費者、無分頁、`time` 缺絕對時間戳、`type='deposit'` 的信在 UI 被歸入「系統通知」分組（`MailboxContent.vue:11-13`）。**領獎直接寫錢包，後端需交易保證與冪等。**

---

## 13. 橫向議題（跨領域，優先處理）

| # | 議題 | 說明 | 建議 |
|---|---|---|---|
| 1 | **鑑權** | 目前無 token，localStorage 一個布林即視為登入（`useAppState.ts:3,89,127`） | 從零導入 JWT + refresh，前端需新增攔截器與 401 處理 |
| 2 | **id 命名體系分裂** | `userInfo.id`（`P88888`）vs 玩家實體 `playerId`（`P10001`）；訊息/對話 id 用 `Date.now()`；交易/工單前端自行發號 | 統一由 server 發號，前端不再產生任何業務 id |
| 3 | **時間表示混亂** | 已格式化字串 / 相對字串 / epoch ms / ISO8601 四種並存 | API 一律回 ISO8601 + 時區，格式化交給前端 |
| 4 | **金額表示** | 排行榜 amount 是含單位字串 | API 回 `{value:number, unit:string}` |
| 5 | **冪等性** | 僅贈禮入帳有靠 `requestId+title` 去重 | 所有金流端點導入 idempotency key |
| 6 | **前端無任何網路失敗處理** | 全專案無 loading/error/retry 狀態機（除假 delay） | 接 API 時需全面補上 |
| 7 | **XSS** | 跑馬燈 text 內嵌 raw HTML（`siteContent.ts:285`） | 改結構化欄位 |
| 8 | **排程 job** | 贈禮逾期退款目前靠前端 60 秒輪詢（`VaultContent.vue:157-160`） | 移至後端排程 |
| 9 | **狀態持久化** | 除 profile 外全部重整即失 | 由 API 成為單一真相來源 |

---

## 14. 需要 Cooper 拍板的商業決策（不可由我代決）

1. **獎勵卡流水認列規則** — 什麼下注算流水、比例、回報頻率（§7.3）
2. **VIP 各級升級／保級的實際數值門檻**（§2）
3. **儲值優惠疊加規則** — 首儲 +100%、每週回饋 15%、VIP 加碼 30% 如何計算與疊加（§5.6.4）
4. **贈禮被拒絕時的退款責任方**（§6.5.1，目前是資金消失的 bug）
5. **好友是否需要雙向同意**（§9）
6. **選座位（機台）是否納入正式流程**（§4，目前是 dead code）
7. **遊戲最低進場金額**（§4）
8. **客服工單能否由玩家主動結案**（§11.1）
9. **兩份遊戲清單是否合併為單一 catalog**（§4）

---

## 15. 驗證方式

本文件的**結構性宣稱**（欄位、常數、行號）可用以下方式反向驗證：

```bash
node --test tests/
```

現有 7 支測試（`account`、`gameWallets`、`giftRequest`、`rewardCardConversion`、`vaultTransfer`、`walletExchange`、`walletSpend`）即為 §5.4、§6.3、§7.2 業務規則的可執行契約，**後端實作應以這些測試為契約基準**，避免前後端規則漂移。

§5.6.7 的冪等性、§6.5.1 的退款缺陷、§7.3 的流水機制屬於**尚無測試覆蓋**的部分，實作時須補測試。
