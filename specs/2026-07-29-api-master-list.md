# 巨亨ONLINE — 完整 API 總表（Master List）

- 建立日期：2026-07-29
- 目的：以目前**所有已知資訊**（官網原型、APP 原型、營運後台操作原型、後端 API 工作清單）彙整需求與開發狀態
- 資訊來源：
  | 代號 | 來源 | 版本 |
  |---|---|---|
  | **W** | 官網 `巨亨ONLINE-Nuxt` | `aa326bd` |
  | **A** | APP `Casino-Lobby-Prototype` @ `phase-1-mvp` | `3c3e396` |
  | **B** | 營運後台操作原型 `Game_operations` | `06fdbbe`；僅參考操作面與流程，不作 API 契約 |
  | **E** | [後端 API 工作清單快照](sources/2026-07-27-backend-api-worklist.md) | 2026-07-27；狀態空白＝製作中尚未完成 |

## 狀態標記

| 標記 | 意義 |
|---|---|
| ✅ | E 標記 `🆕`／`✏️`，且目前沒有已知契約衝突 |
| 🚧 | E 狀態空白，後端製作中、尚未完成 |
| 🔧 | 已有實作或調整紀錄，但前後端欄位／規則仍需對齊 |
| 🆕 | **需新增**，後端尚無 |
| ⏸ | **待決策**，規格未定不能開工（見 §6） |
| 🟣 | 第二階段 |

---

## 0. 狀態快照（2026-07-31 校正）

| 項目 | 數量 | 說明 |
|---|---:|---|
| E 列出的路由 | 50 | 9 個模組 |
| 🚧 狀態空白、製作中 | 24 | 尚未完成，不可標示為可直接串接 |
| E 標記 `🆕`／`✏️` | 26 | 仍須以測試環境與 schema 驗收 |
| Merchant-only 訊息模板 | 5 | 不屬於玩家官網／APP |
| 玩家前台路由範圍 | 45 | 50 扣除 Merchant-only 5 支 |

> 原「41 可直接使用＋9 需調整」及「總計 285 支」無法由逐項清單重現，已撤回。A 是玩家端點需求、B 是營運操作能力、C 是 4 支介接 API 加 2 項協定規則、D 是 WebSocket 事件，四者不是同一計量單位，不再相加。

## 0.1 負責人分派（2026-07 後端工作規劃）

詳細對照見 `specs/2026-07-29-backend-assignment-mapping.md`。

| 負責人 | 章節 | 範圍 |
|---|---|---|
| 👤 **Eric** | A-9、A-12（優惠碼）、B區 agent；「遊戲大廳」邊界待釐清 | 每日簽到／優惠碼／遊戲大廳／代理後台列表；A-10 不重複計入 |
| 👤 **Wu** | A-2、A-16（社交封鎖3支）、B區 adjustment + operationConfig | 前後台全域設定／人工充值／玩家社交封鎖／串接問題 |
| 👤 **Gordan** | A-5、A-6、A-7、A-8、A-14 | 儲值／mailbox+優惠派發幣別修正／單一錢包串接／獎勵卡+交易紀錄／p2p+兌換 |
| 👤 **Hulk** | A-10、C | 遊戲 game 全 12 支＋遊戲供應商 Seamless Wallet／Webhook 整包介接 |
| 🔴 **分派未明** | A-1（缺口）、A-3、A-11、A-13、A-15（世界頻道）、A-16（好友）、A-17（檢舉）、A-18（映射表）、D區 | 以 endpoint ledger 逐支確認；不再用未校準總數估工 |

---

## 1. 通用規範（三方共用，先定這個再開工）

### 1.1 回傳信封（候選，待正式後端確認）
營運後台原型有以下慣例（`B: src/types/index.ts:104-108`），可作共用契約提案，但在 OpenAPI schema 確認前不視為正式完成：

```json
{ "code": 0, "msg": "success", "data": { } }
```
`code: 0` = 成功，非 0 = 業務錯誤。HTTP 狀態碼另外表達傳輸層結果。

### 1.2 錯誤碼表（提案）
以下以 `B: BACKEND_TECH_SPEC.md:202-214` 為參考，再補前台既有錯誤情境；來源不是正式後端契約，需逐碼確認名稱、HTTP status 與重試語意：

| Code | 意義 | 來源 |
|---|---|---|
| 0 | 成功 | B |
| 1001 | 餘額不足 | B / W `insufficient-balance` |
| 1002 | 查無此交易 | B |
| 1003 | 交易重複（冪等擋下） | B |
| 2001 | 簽章驗證失敗 | B |
| 2002 | 商戶已停用 | B |
| 2003 | IP 不在白名單 | B |
| 3001 | 遊戲維護中 | B |
| 3002 | 超出單注限額 | B |
| 4001 | 日期範圍無效 | B |
| 5000 | 系統繁忙（併發鎖定超時） | B |
| **6001** | 金額捨去小數後 ≤0 | 🆕 W `invalid-amount` |
| **6002** | 兌換單位不符（銀→金需 100 倍數） | 🆕 W |
| **6003** | 超出單筆上限 | 🆕 W `amount-limit` |
| **6004** | 超出每日次數上限 | 🆕 W `daily-limit` |
| **6005** | 收禮對象無效 | 🆕 W `invalid-recipient` |
| **6006** | 申請不存在或狀態已變更 | 🆕 W `not-found` |
| **6007** | 無權限操作此資源 | 🆕 W `not-allowed` |
| **7001** | 同時進行中工單已達上限（1 筆） | 🆕 W `max-ongoing` |
| **7002** | 工單已結案 | 🆕 W `closed` |
| **7003** | 訊息內容為空 | 🆕 W `empty-message` |
| **8001** | 帳號已被禁言 | 🆕 B `is_muted` |
| **8002** | 帳號已凍結／停權 | 🆕 B `PlayerStatus` |
| **8003** | 此功能已被停用（贈禮/儲值/遊戲） | 🆕 B `is_*_disabled` |
| **9001** | 全站維護中 | 🆕 B `maintenance_enabled` |

### 1.3 其他規範
| 項目 | 規範 | 依據 |
|---|---|---|
| 鑑權 | `Authorization: Bearer <token>`，401 清 session 導登入 | B `src/api/client.ts:26,36-40` |
| 冪等 | 所有金流端點必須支援 `Idempotency-Key` header | B `BACKEND_TECH_SPEC.md:189` |
| 併發 | 錢包操作包 DB Transaction + 悲觀鎖 | B `:187-188` |
| 金額 | ✅ 整數運算；輸入含小數時無條件捨去。台幣：金幣：銀幣＝`1：1：100`；銅幣為無價值試玩幣 | [decisions §5](decisions/2026-07-30-first-phase-alignment-decisions.md#5-金額匯率與點數價值--整數運算小數無條件捨去) |
| 時間 | 一律 **ISO-8601 含時區**，格式化交給前端。日界以 **Asia/Taipei** 為準 | W `utils/giftRequest.ts:8` |
| id | 一律由 server 發號，前端不自產。展示型 id 另立欄位（`display_id`） | B `:31` |
| 分頁請求 | `page` + `page_size`（snake_case，統一） | 三方目前分裂，取後端多數 |
| 分頁回傳 | `{ items, total, page, page_size }` | B `src/types/index.ts:115-121` |
| 匯出 | 非同步任務，回 `{ task_id }` | B `src/api/agentReport.ts:135` |

---

# A. 前台 API（`/v1frontend`）

> **官網與 APP 共用同一組 API。** 平台差異（如儲值通道）以參數區分，不另開端點。
> 「畫面」欄位使用 APP 的畫面編號（見 `specs/2026-07-29-three-way-screen-matrix.md`）。

## A-1. 認證 auth（15）— 🔴 **分派未明**（缺口 7 支，含忘記密碼）

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🚧 | POST | `/auth/login` | 帳密登入 | P-02 | E 狀態空白 |
| 🚧 | POST | `/auth/register` | 密碼註冊；schema 需含 `referral_code` 與 `terms_version` | M-05 | E 狀態空白＋W |
| 🚧 | GET | `/auth/oauth/{provider}/url` | 三方登入授權頁 URL | M-10~13 | E 狀態空白 |
| 🚧 | POST | `/auth/oauth/{provider}/callback` | 三方登入 callback（未註冊回 404 引導註冊） | M-10~13 | E 狀態空白 |
| 🚧 | POST | `/auth/oauth/register` | 三方登入建號 | M-10~13 | E 狀態空白 |
| 🚧 | POST | `/auth/oauth/result` | App 模式輪詢結果 | M-10~13 | E 狀態空白 |
| 🚧 | POST | `/auth/logout` | 登出 | — | E 狀態空白 |
| 🚧 | POST | `/auth/refresh-token` | token 更新 | — | E 狀態空白 |
| 🆕 | POST | `/auth/guest` | 訪客登入 | P-02 | W `:186-192`／A `:199` |
| 🆕 | POST | `/auth/phone/send-code` | 發送登入驗證碼（**須支援國碼**） | M-09 | A `PhoneLoginModal.tsx` |
| 🆕 | POST | `/auth/phone/verify` | 驗證碼登入 | M-09 | W `:204-215` |
| 🆕 | POST | `/auth/recovery/identify` | 密碼復原：識別帳號，回分支 `phone｜social｜unbound` + 遮罩手機 | — | W `:268-304` |
| 🆕 | POST | `/auth/recovery/send-code` | 密碼復原：發送驗證碼 | — | W `:313-319` |
| 🆕 | POST | `/auth/recovery/verify` | 密碼復原：驗證碼 → resetToken | — | W `:328-337` |
| 🆕 | POST | `/auth/recovery/reset` | 密碼復原：設定新密碼 | — | W `:339-368` |

**驗證規則（server 須重驗）**：帳號 `/^[A-Za-z0-9\p{Script=Han}]+$/u`、半形 4–20（中文計 2）；密碼 ≥6；暱稱 ≥2；推薦碼 空 或 `^[A-Z0-9]{6}$` 或 `^[A-Z0-9]{8}$`；驗證碼倒數 60 秒。（W `utils/account.ts:4-24`、`LoginModal.vue:49-51`；A `utils/account.ts:12-25` 一致）

---

## A-2. 系統 system（6）— 👤 **Wu**（`/system/config` 全域設定）

| 狀態 | 方法 | 路徑 | 用途 | 依據 |
|:-:|---|---|---|---|
| 🚧 | GET | `/system/types` | enum 對照表 | E 狀態空白 |
| 🚧 | GET | `/system/default-avatars` | 頭像素材清單 | E 狀態空白 |
| ✅ | GET | `/system/valid` | 驗證器規則 | E |
| ✅ | GET | `/system/dial-codes` | 手機國碼清單 | E |
| 🆕 | GET | `/system/config` | 前台營運參數：維護開關、維護文案(i18n)、踢線秒數、註冊開關、驗證碼開關、強制綁手機、註冊禮金、P2P 預設費率 | B `types/operationConfig.ts:2-35` |
| 🆕 | GET | `/system/version` | 版本檢查（平台/最低版本/強制更新） | B `types/version.ts` |

> ⚠️ `/system/config` 是**前台維護頁**的前提。兩個前台目前都沒有維護頁，後台卻已經可以開維護。

---

## A-3. 會員 account（7）— 🔴 **分派未明**（`/account/info` 幾乎每頁都依賴）

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🚧 | GET | `/account/info` | 當前會員資訊；schema 需確認錢包、VIP 累積值與玩家狀態欄位 | L-01 | E 狀態空白 |
| 🚧 | GET | `/account/profile` | 編輯頁基本資料 | M-01 | E 狀態空白 |
| 🚧 | PUT | `/account/profile` | email/phone 一旦有值即鎖定 → **兩前台需改為唯讀 + 首次設定入口** | M-01 | E 狀態空白 vs W |
| 🔧 | PUT | `/account/avatar` | 檔案 / 素材 ID 二選一 → **前台需改用素材清單**（官網 12 emoji、APP 20 圖片皆需換） | M-01 | E vs W/A |
| 🚧 | PUT | `/account/password` | 修改密碼 | M-01 | E 狀態空白 |
| 🆕 | GET | `/account/stats` | 個人統計：遊戲時長、總獲利、成就統計 | M-01 | A `types/user.ts:52-56` |
| 🟣 | GET | `/account/achievements` | 成就清單與領取狀態 | M-01 | A `mockData.tsx:348-355`（**官網無此功能**） |

---

## A-4. 三方綁定 account/oauth（5）

| 狀態 | 方法 | 路徑 | 用途 | 依據 |
|:-:|---|---|---|---|
| 🚧 | GET | `/account/oauth` | 綁定清單 | E 狀態空白 |
| 🚧 | GET | `/account/oauth/{provider}/url` | 綁定授權 URL | E 狀態空白 |
| 🚧 | POST | `/account/oauth/{provider}/callback` | 綁定 callback | E 狀態空白 |
| 🚧 | POST | `/account/oauth/bind/confirm` | App 流程綁定確認 | E 狀態空白 |
| 🚧 | DELETE | `/account/oauth/{provider}` | 解綁（無本地密碼且最後一個綁定則拒絕）→ **兩前台需補錯誤處理** | E 狀態空白 |

---

## A-5. 錢包與交易 wallet（8）— 👤 **Gordan**（「單一錢包串接」+ 交易紀錄 + 兌換）

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/wallet/balances` | 錢包餘額（6 個 bucket：**幣別 × 來源** + 保險箱） | L-01 | A `types/gameWallet.ts:3-8` |
| 🆕 | GET | `/wallet/game-options` | 遊戲可用幣別選項（含停用理由） | P-03 | A `utils/gameWallets.ts:11-75` |
| 🆕 | GET | `/wallet/transactions` | 交易紀錄（`type`/`status`/日期 篩選 + 分頁） | F-04 | W `TransactionRecords.vue` |
| 🆕 | POST | `/wallet/exchange` | 金↔銀兌換 | F-04 | W/A `utils/walletExchange.ts` |
| 🆕 | POST | `/vault/deposit` | 存入保險箱 | F-04 | W `useFinancialState.ts:217-230` |
| 🆕 | POST | `/vault/withdraw` | 從保險箱取回主錢包（內部 `VAULT_OUT`，**不是外部提款**） | F-04 | W `:232-245` |
| 🆕 | GET | `/vault/info` | 保險箱餘額與限額 | F-04 | W `VaultContent.vue` |
| 🆕 | GET | `/wallet/rebate` | 返水紀錄 | — | A `transaction.ts:23` (`rebate`)、B `VIPLevel.rebate_rate` |

### 錢包模型 ✅ 已定案：**單一錢包架構**（2026-07-29 Cooper 確認）

平台採**單一錢包（Single Wallet）**：玩家只有一份餘額，遊戲不另開子錢包、**沒有轉入／轉出**。遊戲商的每筆 bet/win 即時打我方錢包 API（見 C 區）。

**真正的兩個維度是「幣別 × 來源」**：

```ts
// 錢包 bucket 全集（6 個）
gold.stored      // 儲值金幣
gold.activity    // 活動金幣 — 有流水要求
silver.stored    // 儲值銀幣
silver.activity  // 活動銀幣 — 有流水要求
bronze           // 銅幣（無活動變體、無價值試玩幣）
vault.gold       // 保險箱金幣（不可遊玩，僅金幣）
```

**這剛好等於 APP 現有的 `GameWalletKey`**（`A: types/gameWallet.ts:3-8`）—— `stored-gold｜activity-gold｜stored-silver｜activity-silver｜bronze` + 保險箱。**建議直接採用 APP 這套分類作為統一模型。**

**已定匯率與價值**：`NT$ 1＝金幣 1＝銀幣 100`；銅幣只用於試玩，沒有現金或可兌換價值。所有金額含小數時無條件捨去。

### 三方對應與需改的地方

| 來源 | 現況 | 需要的調整 |
|---|---|---|
| **APP** | `GameWalletKey` 5 種 + `vault_gold` | ✅ 已正確，沿用 |
| **官網** | 扁平四欄位 `balance`/`silverBalance`/`bronzeBalance`/`vaultBalance` | 🔴 **表達不了活動幣，須重構** |
| **後台** | `type: CASH｜BONUS｜GAME｜SAFE` **＋** 獨立 `currency` 欄位（重複編碼，本就不自洽） | 🔧 對應為 `CASH→stored`、`BONUS→activity`、`SAFE→vault`、**`GAME` 刪除** |

> ⚠️ 後台原型的 `WalletType` 註解寫「金幣｜銀幣｜銅幣｜保險箱」，但同一 interface 又有 `currency: GOLD|SILVER|BRONZE` —— 兩個欄位重複表達幣別。單一錢包架構下應改為 `currency` 表幣別、`source` 表來源。

### ✅ 活動幣一律以獎勵卡為載體（2026-07-30 Cooper 拍板）

**所有活動金幣／活動銀幣的派發，一律發「獎勵卡」，不存在無卡的活動幣。**

| 派發情境 | 載體 | 玩家看到的位置 |
|---|---|---|
| 每日簽到里程碑（15／20 天） | `RewardCard` | 獎勵卡介面 **F-05** |
| 營運補償／推廣 | `RewardCard` | 獎勵卡介面 **F-05** |

**這樣做的好處**（拍板理由）：
- 活動幣永遠有載體帶 `turnover_target`／`conversion_limit`／`expires_at`，**沒有規則空白**
- 前台「活動幣餘額 = active + paused 卡加總」的既有投影邏輯**完全不用改**（W `useRewardCardState`、A `GameLaunchModal.tsx:18`）
- 每一筆活動幣都可追溯到一張卡，對帳不會斷

> 💡 **營運彈性沒有損失**：想做「快速小額補償」時，發一張**流水目標低、轉換上限高**的卡即可，效果等同直接發幣。彈性從「兩種途徑」轉移到「卡片參數可調」。

### API 契約要求：每張卡自帶完整參數

補償發卡意味著卡片參數由營運每次自訂，`GET /reward-cards` 回傳的每張卡都要自帶：
`currency`／`amount`／`turnover_target`／`conversion_limit`／`expires_at`／`status`／`source`（簽到里程碑 or 營運派發）。

> ℹ️ 兩前台目前把卡片寫死成兩張（W `useRewardCardState.ts:41-64`）—— 依 Cooper 說明，**這是原型為了確認操作流程的呈現方式，實際不會這樣做**，非問題項。此處僅記錄 API 契約需求。

### ✅ 卡片數量：暫定無上限（2026-07-30）

現行規則「同幣別同時只能一張 active」（W `useRewardCardState.ts:129-134`）維持不變，但**卡片總數不設上限**。

⏸ **排序／篩選功能待定**（Cooper 評估中）：可能依**時間／流水／金額**排序篩選。
→ `GET /reward-cards` 建議預留 `sort`（`created_at｜turnover_progress｜amount`）與 `order`（`asc｜desc`）參數。

### ✅ 卡片過期規則（2026-07-30 拍板）

**後台可設定每張獎勵卡的有效期限。到期後卡片自動失效，卡內餘額無法使用、也無法取出（沒收）。**

**這對應到三件事**：

| 項目 | 需求 |
|---|---|
| **卡片狀態** | `status` 需新增 `EXPIRED`。現行 enum 只有 `inactive｜active｜paused｜converted`（W `useRewardCardState.ts:18-24`），**沒有過期態** |
| **過期判定** | 由**後端**執行（排程或讀取時判定），前台不自行判斷。目前兩前台的 `expires_at` 純顯示、無任何邏輯 |
| **沒收記帳** | 🎯 **對應後台既有的 `AssetLogChangeType.WIPE`**（清除）—— 這個交易類型先前在兩前台都找不到對應用途，現在對上了：**獎勵卡過期沒收就是 WIPE** |

**⚠️ 前台需處理的連帶情況**：若過期的卡當下是 `active`，玩家的**活動幣餘額會突然減少**。F-05 與遊戲啟動彈窗都需要能反映這個變動（並給出原因說明，否則玩家會以為餘額被偷）。

### ⚠️ 顯示位置（§6-16，降級但仍存在）

活動幣不在任何 Header 上（官網 `AppHeader` 三幣皆為儲值幣；APP `L-01` 金幣＋銀幣）。
但改為全走獎勵卡後，玩家的動線是「領卡 → 進 F-05 → F-05 有顯示活動幣總額」，**不會再有「領了看不到」的斷點**。Header 要不要補顯示，降為體驗優化項。

### 交易類型（⚠️ 三方 enum 需統一）
| 統一建議 | 官網現況 | APP 現況 | 後台現況 |
|---|---|---|---|
| `DEPOSIT` | deposit | deposit | DEPOSIT |
| `WITHDRAW` | ➖ 不提供外部提款 | APP 型別有值但無正式功能 | 後台通用模型保留，不映射玩家前台 |
| `BET` / `WIN` | — | — | BET / WIN |
| `VAULT_IN` / `VAULT_OUT` | vault（不分方向） | vault_deposit（**方向靠文字判**） | — |
| `P2P_OUT` / `P2P_IN` | gift（不分方向） | gift_transfer | P2P_OUT / P2P_IN |
| `EXCHANGE` | exchange | currency_conversion | EXCHANGE |
| `REWARD_CLAIM` | reward | free_reward | CLAIM |
| `BONUS_CONVERT` | — | reward_card_conversion | UNLOCK |
| `BONUS_WIPE` | — | — | WIPE ← 🎯 **獎勵卡過期沒收**（2026-07-30 確認用途） |
| `REBATE` | — | rebate | — |
| `SPEND` | spend | — | — |

### 交易狀態（按領域拆分）

`PENDING｜SUCCESS｜FAILED｜EXPIRED｜MANUAL｜REFUNDED｜VERIFY_ERROR` 是**儲值訂單**狀態（B `types/depositOrder.ts:1`），不直接套用所有資產流水。Ledger、贈禮、獎勵卡各自維持獨立狀態 enum。

---

## A-6. 儲值 deposit（6）— 👤 **Gordan**

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/deposit/products` | 儲值商品（**依 `platform` 回不同幣別/通道**，✅ 已拍板為刻意平台差異，見決策 §2） | F-04 | [decisions §2](decisions/2026-07-30-first-phase-alignment-decisions.md#2-儲值幣別與通道--刻意的平台差異不強制統一) |
| 🆕 | GET | `/deposit/channels` | 可用金流通道（依平台/VIP/限額過濾） | F-04 | B `types/paymentChannel.ts:5-34` |
| 🆕 | POST | `/deposit/orders` | 建立訂單 | M-03 | W `DepositContent.vue:50-65` |
| 🆕 | GET | `/deposit/orders/{id}` | 查詢訂單狀態（非同步入帳用） | M-03 | B `depositOrder` |
| 🆕 | GET | `/deposit/orders` | 我的儲值訂單列表 | F-04 | B |
| 🆕 | POST | `/deposit/orders/{id}/verify` | IAP 收據驗證（App Store / Google Play） | M-03 | A `PaymentModal.tsx:110-111` |

**通道全集**（B `types/depositOrder.ts:3`）：`iOS-IAP｜Android-IAP｜Web-CreditCard｜Web-ATM｜MyCard｜LinePay｜AliPay`
**限額欄位**（B `paymentChannel.ts`）：`min_limit`/`max_limit`/`daily_limit`/`min_vip_level`/`platforms` —— 兩前台目前都沒有限額 UI。

---

## A-7. 贈禮 gift（6 支有效端點 + 1 支不採用對照）— 👤 **Gordan**（分派中的「p2p」即此項）

> ✅ **已拍板（2026-07-30）**：統一為官網的雙向確認機制，見 [`specs/decisions/2026-07-30-first-phase-alignment-decisions.md` §1](decisions/2026-07-30-first-phase-alignment-decisions.md#1-贈禮流程--統一為雙向確認官網現況)。有效範圍為下表前 6 支；`POST /gift/transfer`（直接轉帳）**不採用**，僅保留作為 APP 原型現況對照，不需開發。

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/gift/quota` | 今日剩餘次數、單筆上限、**當前 VIP 費率** | F-04 | W `useGiftState.ts:12`＋B `VIPLevel.gift_fee_rate` |
| 🆕 | GET | `/gift/requests` | 贈禮申請列表（pending/expired，分收送兩側） | F-04 | W `GiftRequestList.vue` |
| 🆕 | POST | `/gift/requests` | 送出申請（保險箱預扣） | F-04 | W `:168-207` |
| 🆕 | POST | `/gift/requests/{id}/accept` | 收禮者接受 | F-04 | W `:235-241` |
| 🆕 | POST | `/gift/requests/{id}/reject` | 收禮者拒絕（**須退款給 sender**） | F-04 | 🔴 W 現有 bug，見 §6-4 |
| 🆕 | POST | `/gift/requests/{id}/cancel` | 送禮者取消 | F-04 | W `:225-244` |
| ➖ | POST | `/gift/transfer` | 直接轉帳（**已拍板不採用，僅留存對照** APP 現況） | F-04 | A `AuthContext.tsx:237-287` |

**業務規則**：單筆上限 1,000,000；每日 10 次；有效期 168 小時；費率快照凍結於申請當下。
**⚠️ 逾期退款必須是後端排程 job** —— 官網目前靠前端每 60 秒輪詢（`VaultContent.vue:157-160`），關瀏覽器就不會退。

---

## A-8. 獎勵卡 reward-card（7）— 👤 **Gordan**

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/reward-cards` | 獎勵卡清單。**兩種來源**：簽到里程碑（15/20 天）＋ 營運補償派發。🔴 **每張卡須自帶完整參數**（`currency`／`amount`／`turnover_target`／`conversion_limit`／`expires_at`／`source`），前台不能再寫死 | F-05 | W/A |
| 🆕 | GET | `/reward-cards/unread` | 新卡到達提示（**所有補償都走這條，沒有信箱紅點兜底**） | F-05 | 🆕 兩前台皆無 |
| 🆕 | POST | `/reward-cards/{id}/activate` | 啟用（同幣別其他轉 paused） | F-05 | W `:126-136` |
| 🆕 | POST | `/reward-cards/{id}/pause` | 停用 | F-05 | W `:138-143` |
| 🆕 | DELETE | `/reward-cards/{id}` | 刪除（active 不可刪） | F-05 | W `:145-151` |
| 🆕 | GET | `/reward-cards/{id}/turnover` | 流水進度明細 | F-05 | ⏸ 見 §6-5 |
| 🆕 | GET | `/notices/conversions` | 轉換完成通知（未讀） | F-05 | W `:181-193` |

**卡片定義**（三方一致 ✅）：15 天 = 活動銀幣 10,000／20 天 = 活動金幣 5,000；流水目標 100,000；轉換上限 10,000；到期 2026/12/31。
**轉換演算**：`converted = min(餘額, 上限)`，超額部分 `recovered` 由系統回收。
**⚠️ 流水累積機制兩前台都是假的** —— 營運後台原型雖有 `valid_turnover`／`remain_target` 欄位，但正式有效流水仍須由 Gordan × Hulk 依 Provider 交易規則共同定義。

---

## A-9. 每日任務 checkin（5）— 👤 **Eric**

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/checkin/config` | 31 天獎勵表、里程碑、補簽費用 | F-02 | W `siteContent.ts:725-746` |
| 🆕 | GET | `/checkin/status` | 本月已簽日、已領里程碑、**server 端「今天」** | F-02 | W `daily.vue:21-24` |
| 🆕 | POST | `/checkin` | 簽到 | F-02 | W `:64-75` |
| 🆕 | POST | `/checkin/makeup` | 補簽（先扣 100 金幣） | F-02 | W `:139-163` |
| 🆕 | POST | `/checkin/milestones/{day}/claim` | 領取里程碑 | F-02 | W `:77-121` |

**⚠️ 「今天」必須由 server 判定**（含時區與跨日邊界）—— 兩前台目前都用 client `new Date()`。
**⏸ 待決**：里程碑看**連續天數**還是**累計天數**（兩前台目前都用累計）。

---

## A-10. 遊戲 game（12）— 👤 **Hulk**（全 12 支）

> Eric 的「遊戲大廳」仍需釐清為前端展示協作、catalog 整理或其他非 A-10 工作；在確認前，不把下列前 3 支重複分派給 Eric。

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/games` | 遊戲 catalog（分類/供應商/標籤/圖/排序/`min_vip_level`/`allowed_currencies`/`status`） | L-04 | ⏸ 見 §6-6 |
| 🆕 | GET | `/games/categories` | 分類定義 | L-03 | ⏸ 三方分類不同 |
| 🆕 | GET | `/games/providers` | 供應商清單 | L-03 | W `GameBrowser.vue:27-29` |
| 🆕 | GET | `/games/{key}` | 遊戲詳情（介紹/規則/RTP/波動性/賠付線/最高倍率） | P-03 | W `GameView.vue:49-135` |
| 🆕 | POST | `/games/{key}/launch` | **啟動遊戲**：帶 `wallet`(+`seat_id?`)，回一次性 URL / launch token。**單一錢包下 `wallet` 是「本 session 從哪個 bucket 扣款」，不是轉帳** | P-04 | W／A |
| 🆕 | GET | `/games/{key}/seats` | 機台/座位清單（狀態、RTP、命中率、免費遊戲、總投注） | — | A `types/game.ts:36-47` |
| 🆕 | POST | `/games/{key}/seats/{id}/reserve` | 預約座位 | — | A |
| 🆕 | GET | `/me/favorites` | 我的最愛遊戲 | L-04 | A `jh_app_favorite_game_ids` |
| 🆕 | POST/DELETE | `/me/favorites/{key}` | 加入／移除最愛 | L-04 | A |
| 🆕 | GET | `/me/recent-games` | **我的**最近遊玩（大廳「繼續遊戲」，上限 12） | L-04 | W `useRecentGames.ts`／A `hooks/useRecentGames.ts` |
| 🆕 | POST | `/me/recent-games` | 記錄一筆 | L-04 | W |
| 🆕 | GET | `/me/game-records` | 遊戲**投注明細**（日期區間 + 分頁） | M-01 | W `GameRecords.vue:4-11` |

### ⚠️「遊玩遊戲」是三個不同的東西，不要混用

| # | 名稱 | 內容 | 顯示位置 | 端點 |
|---|---|---|---|---|
| 1 | **我的最近遊玩** | 遊戲清單（我自己的） | 大廳「繼續遊戲」 L-04 | `GET /me/recent-games` |
| 2 | **他人的最近遊玩** | 遊戲清單（別人的，3 筆） | 玩家資料卡 M-08 | `GET /players/{id}` 的 `recent_games` 欄位（見 A-16） |
| 3 | **遊戲投注明細** | 時間/遊戲/投注/輸贏/餘額 | 個人資料「遊戲紀錄」 M-01 | `GET /me/game-records` |

**主鍵型別不一致（需統一）**：官網存 game **key（string）**（`useRecentGames.ts:1`），APP 存 game **id（number）**（`hooks/useRecentGames.ts:19`）。

**資料來源**：後台 `Player` 型別**沒有 `recentGames` 欄位**（B `types/player.ts:28-68`），所以 #1、#2 應由 `GameLog` 衍生（取最近 N 筆去重遊戲），而非獨立儲存。目前兩前台都存在 localStorage，**跨裝置不同步**。

**遊戲標籤**（需統一）：官網 `熱門｜新上線｜活動`；APP `isNew｜hasJackpot`；後台 `HOT｜RECOMMENDED｜DOUBLE_TURNOVER`。
**⚠️ 兩前台皆缺**：遊戲維護狀態顯示、VIP 門檻檢查、幣別支援檢查、餘額不足阻擋。

---

## A-11. VIP（2）— 🔴 **分派未明**（官網 VIP 進度條算不出來）

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🔧 | GET | `/vip/levels` | E 已有 `rebate_rate`／`p2p_fee_rate`；仍需確認結構化升級／保級門檻與費率單位 | M-01 | E `✏️`＋B `types/vip.ts:14-31` |
| 🆕 | GET | `/vip/progress` | 我的 VIP 進度（當前等級門檻 + 累積儲值/投注 + 保級狀態） | M-01 | A `VIP_LEVEL_RULES` |

> ✅ **已拍板（2026-07-30）**：官網補齊結構化門檻，比照 APP `VIP_LEVEL_RULES`，見 [decisions §4](decisions/2026-07-30-first-phase-alignment-decisions.md#4-vip-結構化門檻--官網補上結構化門檻比照-app後台)。**門檻數值本身**（各級要儲值/投注多少）仍待業務拍板，即 §6 決策 #11，結構已定但數字未定。
>
> ✅ **已拍板（2026-07-31）**：贈禮費率依 VIP 分級，兩前台寫死的 5% 要移除；建立贈禮申請時凍結費率與手續費快照。API 必須明確定義費率單位。

---

## A-12. 活動與優惠 promo（8）— 👤 **Eric**（優惠碼 2 支）+ **Gordan**（「優惠派發幣別修正」）｜活動本體分派未明

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/promo/campaigns` | 活動列表（含 `frontend_visible`/`frontend_apply`/`apply_block_message`/列表圖/Banner圖） | F-02 | B `types/promoCampaign.ts:129-157` |
| 🆕 | GET | `/promo/campaigns/{id}` | 活動詳情 | F-02 | B |
| 🆕 | POST | `/promo/campaigns/{id}/apply` | 活動報名 | F-02 | W `EventsContent.vue:21-28`（**目前只設提示字串**） |
| 🆕 | GET | `/promo/campaigns/{id}/status` | 我的參與狀態 | F-02 | 🔴 兩前台皆缺 |
| 🆕 | GET | `/promo/offers` | 專屬優惠 / 促銷輪播 | M-02 | A `mockData.tsx:218-225` |
| 🆕 | POST | `/promo/codes/redeem` | 兌換優惠碼 | — | ⏸ **兩前台皆無 UI**，後端時程 8/3 |
| 🆕 | GET | `/promo/codes/history` | 優惠碼兌換紀錄 | — | B `types/promoCode.ts` |
| 🟣 | GET | `/promo/events` | 邀請/推薦雙軌獎勵活動 | — | B `types/promoEvent.ts` |

---

## A-13. 排行榜 leaderboard（2）— 🔻 **分派未明**（原時程 8/10~8/14 有，新分派未列）

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/leaderboard/{type}` | 榜單（`multi｜win｜wealth`＝倍數/贏分/富豪），回 top3 + rest + **`updated_at`** | F-02 | W／A 三榜一致 ✅ |
| 🆕 | GET | `/leaderboard/{type}/me` | 我的名次 | F-02 | 🆕 兩前台皆無 |

**⚠️ `amount` 須回結構化 `{value, unit}`** —— 官網目前是含單位字串（`'2,580,000 金幣'`、`'×2,560 倍'`）。
**⚠️ `updated_at` 須由 server 提供** —— 官網 `useLeaderboardTimer.ts:11` 只是本地每秒 +1 的假計時。

---

## A-14. 信箱 mailbox（6）— 👤 **Gordan**（含「優惠派發幣別修正」）

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| ✅ | GET | `/mailbox` | 信件清單（含未讀徽章） | F-03 | E |
| ✅ | GET | `/mailbox/{id}` | 信件詳情（讀信即已讀） | F-03 | E |
| ✅ | POST | `/mailbox/{id}/claim` | 領取附件（入帳錢包） | F-03 | E |
| ✅ | DELETE | `/mailbox` | 批次刪除（body 帶 `mail_user_ids`）⚠️ 未進 swagger | F-03 | E |
| 🔧 | — | — | **`type` 需統一**：後台 `SYSTEM｜PROMOTION｜COMPENSATION｜PERSONAL` vs 官網 `system｜event｜deposit` vs APP `system｜promo｜personal` | F-03 | 三方分裂 |
| 🆕 | POST | `/mailbox/claim-all` | 全部領取 | F-03 | A `InboxInterface.tsx`（**官網無批次**） |

**⚠️ 撤回**：後台有 `recallMessage`，**兩前台都沒處理信件被撤回的情況**。

### ✅ 附件獎勵幣別：活動幣改走獎勵卡

2026-07-30 已確認：所有活動金幣／活動銀幣都以獎勵卡為載體，不經信箱；信件附件只發儲值金／銀／銅幣。對照現況：

| | 現況 | 問題 |
|---|---|---|
| 官網 | `MailReward.wallet: WalletKey = 'gold'｜'silver'｜'bronze'` | ✅ 符合「信件只發儲值三幣」，不用擴充活動幣 |
| APP | 寫死固定 50,000 **金幣**（`InboxInterface.tsx:88,93`） | 🔴 仍須改讀附件實際幣別與金額 |
| 營運後台原型 | `MessageRecord.type` 有 `COMPENSATION`、`attachmentBonusAmount` | 僅供操作與欄位參考；正式派發規則以獎勵卡契約為準 |

| 附件類型 | 領取後 | 前台需要 |
|---|---|---|
| 儲值金／銀／銅幣 | 進儲值餘額 | ✅ 現有 `MailReward.wallet: 'gold'｜'silver'｜'bronze'` 結構即可，**不用擴充** |
| ~~活動金幣／活動銀幣~~ | — | ➖ 不經信箱，改發獎勵卡 |

> 獎勵卡**直接進獎勵卡介面 F-05，不經信箱** → F-05 需要「新卡到達」提示機制（`GET /reward-cards/unread`，A-8）。這在單軌設計下**更關鍵** —— 所有補償都走這條，沒有信箱未讀紅點可以兜底。

---

## A-15. 聊天 chat（10）— 🔴 **世界頻道 3 支分派未明**（私訊 7 支在 E 標示 🆕，仍待驗收）

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/chat/world/messages` | 世界頻道歷史（cursor 分頁） | F-01 | W `chat.vue:47` |
| 🆕 | POST | `/chat/world/messages` | 發世界訊息 | F-01 | W `:127` |
| 🆕 | GET | `/chat/online` | 在線玩家名單（分頁 + status） | F-01 | W `:153` |
| ✅ | GET | `/message/conversation/list` | 私人對話列表 | F-01 | E |
| ✅ | POST | `/message/conversation` | 建立或取得對話 | F-01 | E |
| ✅ | DELETE | `/message/conversation/{id}` | 刪除對話（**兩前台皆無 UI**） | F-01 | E |
| ✅ | PUT | `/message/conversation/{id}/read` | 標記已讀 | F-01 | E |
| ✅ | GET | `/message` | 訊息列表 ⚠️ swagger 標錯成 POST | F-01 | E |
| ✅ | POST | `/message` | 發送訊息 | F-01 | E |
| ✅ | DELETE | `/message/{id}` | 刪除訊息（**兩前台皆無 UI**） | F-01 | E |

### 🔴 訊息載體必須修正（W `ChatMessage`，`siteContent.ts:20-27`）
| 現況 | 問題 | 應改為 |
|---|---|---|
| 只有 `user`（顯示名） | 前端靠 name 反查 profile，**同名玩家即崩** | 必須帶 `player_id` |
| `time` 是已格式化字串 | 無法排序、無法跨時區 | ISO-8601 |
| `id` 用 `Date.now()` | 與工單 id 空間衝突 | server 發號 |

**⏸ 未定**：訊息長度上限、敏感詞過濾（後台已有 `KeywordRecord`）、發言頻率限制（後台已有 `TriggerRecord.frequency`）。

> 📌 後端 `message` 模組的**訊息模板 template（5 支，限商戶身分）**是後台功能，兩個前台都沒有此概念，應從前台清單移除。

---

## A-16. 社交 social（8）— 👤 **Wu**（社交封鎖3支已分派）｜好友3支＋玩家2支 🔴 分派未明

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| 🆕 | GET | `/social/friends` | 好友清單 | F-01 | W／A |
| 🆕 | POST | `/social/friends` | 加好友 ⏸ **是否需雙向同意待決** | F-01/M-08 | §6-7 |
| 🆕 | DELETE | `/social/friends/{player_id}` | 移除好友 | F-01 | W `:47-51` |
| 🆕 | GET | `/social/blocks` | 社交封鎖清單 | L-06 | W `settings.vue:8` |
| 🆕 | POST | `/social/blocks` | 封鎖（**同時自動移除好友**） | M-08 | W `:58-72` |
| 🆕 | DELETE | `/social/blocks/{player_id}` | 解除封鎖（不自動復原好友） | L-06 | W `:74-78` |
| 🆕 | GET | `/players/{player_id}` | 玩家公開檔 ⏸ **含 `recent_games` 有隱私疑慮，見下** | M-08 | W `PlayerCard.vue:4` |
| 🆕 | GET | `/players/search` | 玩家搜尋（name/account）**須 server 端搜尋** | M-08 | W `OnlineRoster.vue:21-29`（目前前端全量 filter） |

> ✅ **已確認（2026-07-31）**：後端工作規劃中的「黑名單」就是玩家社交封鎖，由 Wu 負責上述 `blocks` 3 支。後台原型的 IP／裝置封鎖是另一項營運能力，不在本次分派。

### 玩家公開檔欄位（`ChatPlayerProfile` / `PlayerProfile`）

| 欄位 | 官網 | APP | 備註 |
|---|---|---|---|
| `player_id` / `account` / `name` / `avatar` / `bio` / `level` | ✅ | ✅ | 一致 |
| `vip` | `vip: number` | `vipLevel?: number` | ⚠️ 命名不同 |
| `status` | `在線｜遊戲中｜閒置` | ➖ | ⚠️ APP 無 |
| `is_friend` | `isFriend?` | `isFriend`（必填） | ⚠️ 選填性不同 |
| **`recent_games`** | `{id, name, **color**}` | `{id, name, **image**}` | 🔴 **同名不同義**：官網存色塊 fallback、APP 存遊戲圖 |

⏸ **隱私決策（§6-13）**：`recent_games` 是把玩家的遊戲行為公開給其他玩家。三份原型皆無隱私開關，後台亦無對應管理設定。需決定：(a) 照做 (b) 讓玩家可自行關閉 (c) 不公開，改顯示其他資訊。

---

## A-17. 客服工單 customerservice（7）— 6 支在 E 標示 🆕、仍待驗收｜檢舉 1 支 🔴 分派未明

| 狀態 | 方法 | 路徑 | 用途 | 畫面 | 依據 |
|:-:|---|---|---|---|---|
| ✅ | GET | `/customerservice/question-categories` | 問題分類 ⚠️ 未進 swagger | F-01 | E |
| ✅ | POST | `/customerservice/order` | 建立工單 | F-01 | E |
| ✅ | POST | `/customerservice/order/message` | 發送訊息 | F-01 | E |
| ✅ | POST | `/customerservice/order/read` | 標記已讀 | F-01 | E |
| ✅ | GET | `/customerservice/orders` | 工單列表（含未讀數） | F-01 | E |
| ✅ | GET | `/customerservice/order/{id}` | 工單詳情 | F-01 | E |
| 🆕 | POST | `/reports` | 檢舉玩家 ⏸ 是否獨立於工單待決 | M-08 | W `:236-270` |

**分類 key**（W `siteContent.ts:59-66`）：`account｜deposit｜billing｜game｜event｜vault｜report`。本產品不提供外部提款；`billing` 用於儲值訂單、交易紀錄與退款爭議。
**⏸ 待確認**：
- `status` 列舉 —— 官網 `ongoing｜closed`（2 段）vs 後台 `unassigned｜pending｜processing｜closed`（4 段）
- 「同時最多 1 筆 ongoing」是否由後端強制（目前官網前端已有檢查，但不能作為唯一防線）
- **檢舉理由需改為 reason code** —— 官網目前是硬編碼中文字串陣列

> 📌 **APP 側缺口**：APP 的客服左欄是空殼，官網已完整。APP 需依此組 API 補齊。

---

## A-18. 營運內容 operator-setting（5 + 映射表）— 5 支在 E 狀態空白、製作中｜🔴 **映射表分派未明**

| 狀態 | 方法 | 路徑 | 用途 | 畫面 |
|:-:|---|---|---|---|
| 🚧 | GET | `/operator-setting/announcement` | 公告列表 | L-05 |
| 🚧 | GET | `/operator-setting/image` | 依 type 取圖片 | L-04/M-02 |
| 🚧 | GET | `/operator-setting/image/popup` | 彈窗列表（依會員過濾已關閉） | 🟣 |
| 🚧 | GET | `/operator-setting/article` | 文章列表 | — |
| 🚧 | GET | `/operator-setting/article/{id}` | 文章詳情 | M-04 |

### 🔴 缺一份映射表（目前完全 not_stated）
後端只有 3 種通用容器，前台有 11 種靜態內容。建議映射：

| 前台內容 | 建議來源 | 需要的欄位 |
|---|---|---|
| 跑馬燈 | `announcement` type=`MARQUEE` | `weight`、`publish_interval` |
| 系統通知 / 營運公告 | `announcement` 另兩種 type | — |
| 首頁 Banner | `image` type=`BANNER` | `jump_url`、`weight`、`start_time`/`end_time` |
| 彈窗 / 開屏 🟣 | `image` type=`POPUP`/`SPLASH` | `frequency`(`EVERY_LOGIN｜DAILY_ONCE｜ONCE_FOREVER`) |
| 大廳背景 / 活動縮圖 / 儲值促銷圖 | `image` 另三種 type | — |
| FAQ / 教學 / 法遵文件 / VIP 權益 | `article` | 需分類欄位 |
| 遊戲介紹與規則 | ⚠️ 官網目前**硬編在元件內**（`GameView.vue:49-135`），建議移入 CMS | — |

**⚠️ XSS**：跑馬燈 text 目前內嵌 raw HTML（`siteContent.ts:285`），API 應回結構化欄位。

---

## A-19. 🟣 第二階段（前台）

| 模組 | 端點數 | 說明 |
|---|:-:|---|
| 公會 guild | 8 | 列表/詳情/加入/退出/成員/聊天/活動/獎勵。**APP 已寫好整組但註解隱藏**，官網完全沒有 |
| 徽章 badge | 2 | 清單 / 佩戴 |
| 商城 commodity | 3 | 商品列表 / 購買 / 我的道具 |
| 成就 achievement | 2 | 清單 / 領取 |
| 彈窗 popup | 2 | 取得 / 標記已關閉 |
| 玩家管制回應 | 4 | 禁言狀態 / 帳號狀態 / 功能停用旗標 / 維護狀態（需搭配 WS） |

---

# B. 營運後台操作能力盤點（不計入 API 總數）

> `Game_operations` 是提供前端與需求方理解操作面、功能與流程的 Vue 原型，不是正式 API 契約。下表只盤點營運能力；原型方法數不等於待開發 API 支數，也不與 A／C／D 相加。

| 模組 | 原型方法數（僅規模參考） | 主要操作 | 對前台的影響 |
|---|:-:|---|---|
| 認證 auth | 4 | login / logout / refresh / 個人改密 | — |
| 帳號權限 admin | 9 | 帳號 CRUD、權限群組 CRUD、成員增刪、操作日誌 | — |
| 玩家 player | 11 | 列表/詳情/建立/更新/改狀態(含強制踢線)/標籤/轉線/放棄紅利/強制通過/稽核日誌 | 🔴 玩家狀態、禁言、三種停用旗標 |
| 標籤 tag | 4 | CRUD | 站內信分眾 |
| 代理 agent | 11 | CRUD/啟停/佣金調整/提領審核/轉線排程 | 推薦碼歸屬 |
| 代理報表 agentReport | 4 | 報表/下鑽/匯出 | — |
| 資產 log / bonus | 2 | 資產異動流水、紅利歷史 | 交易紀錄來源 |
| 人工存提 adjustment | 2 | 加扣款、原因代碼 | 🔴 玩家餘額變動 |
| 財務 finance | 1 | 統計 | — |
| 儲值訂單 depositOrder | 6 | 列表/統計/趨勢/同步/人工補單/日誌 | 🔴 訂單狀態與到帳 |
| 金流通道 paymentChannel | 5 | CRUD / 重設限額 | 🔴 前台可選充值方式 |
| 商品 commodity / badge | 8 | CRUD | 🟣 商城 |
| 遊戲 game | 5 | 紀錄/列表/更新/拉取供應商遊戲/批次上架 | 🔴 遊戲上下架、維護狀態 |
| 遊戲商 provider | 2 | 列表 / 更新 | 🔴 |
| 遊戲設定 config | 6 | 遊戲類型 / 行銷標籤 CRUD | 🔴 分類與標籤 |
| VIP | 2 | 等級清單 / 更新 | 🔴 VIP 門檻與權益 |
| 優惠活動 promoCampaign | 11 | 列表/複製/前台顯示開關/可申請開關/強制關閉/圖片/草稿/送出 | 🔴 活動顯示與報名 |
| 優惠碼 promoCode | 5 | CRUD / 啟停 | 🔴 |
| 觸發規則 triggerRule | 7 | CRUD/啟停/查詢合格活動/歷史 | 🟣 |
| 聊天管理 chatManagement | 7 | 敏感詞 CRUD / 觸發紀錄處置 | 🟣 敏感詞過濾 |
| 站內信 systemMessage | 5 | CRUD / 撤回 / 成效統計 | 🔴 前台信箱 |
| 訊息設定 messageSettings | 3 | 事件模板 / 測試發送 | 前台事件通知文案 |
| 公告 announcement | 5 | CRUD / 啟停（測試站/正式站雙軌） | 🔴 跑馬燈與公告 |
| 圖片配置 imageConfig | 6 | CRUD / 啟停 / 上傳 | 🔴 Banner / 彈窗 |
| 文章 article | 5 | CRUD / 啟停（含 SEO 欄位） | 前台文章與 SEO |
| 營運報表 operationReport | 5 | GGR/儲值/活躍/活動紅利/匯出 | — |
| 遊戲統計 gameStats | 2 | 報表 / 匯出 | — |
| 報表管理 reportManagement | 2 | 列表 / 刪除 | — |
| 儀表板 dashboard / realtime | 2 | 待辦統計 / 即時統計 | — |
| 風控 risk | 2 | 預警列表 / 處置 | — |
| 公會 guild | 7 | 列表/全域設定/解散/禁言/轉讓/成員 | 🟣 |
| 系統監控 systemStatus | 6 | 健康/完整性/概覽/流量/錯誤日誌 | — |
| 白名單 whitelist | 5 | 後台 IP 白名單 CRUD | — |
| **前台黑名單** frontendBlacklist | 5 | **IP/裝置封鎖** CRUD | 🔴 前台可否訪問 |
| 第三方金鑰 thirdparty | 5 | CRUD / 連線測試 | — |
| 版本 version | 6 | CRUD / 檢查更新 | 🟣 APP 更新提示 |
| 營運參數 operationConfig | 3 | 取得 / 更新 / 維護判定 | 🔴 全站維護、註冊開關、P2P 費率 |

---

# C. 遊戲供應商系統介接 — 👤 **Hulk**

平台採單一錢包（§A-5），代表**遊戲商的每筆 bet/win 都要即時打我方錢包 API**。因此本區從「選配」升為第一階段必要項（B `BACKEND_TECH_SPEC.md:216-346`）：

> ✅ **責任已確認（2026-07-31）**：遊戲供應商與平台端介接整包由 Hulk 製作。本區是 4 支 HTTP API 加上簽章／超時等協定規則，不再以「6 支 API」計數，也不列為無人認領。

**連帶影響三件事**：
1. `BET`／`WIN` 成為**高頻真實交易**，交易紀錄與資產流水必須承受下注量級
2. **遊戲進行中餘額會變動** → 前台需即時餘額更新（D 區 `wallet.balance`），或至少離開遊戲時強制刷新
3. **BET 是流水候選來源，但不能直接等同有效流水** → 營運後台原型的 `AssetLog.valid_turnover`／`remain_target` 只提供欄位參考；Gordan × Hulk 仍須定義 Cancel／Refund／Rollback、有效遊戲與冪等規則

| 方法 | 路徑 | 用途 | 提供方 |
|---|---|---|---|
| POST | `/api/v2/webhook/transaction` | 接收 Provider 投注/派彩/退款 | 我方 |
| POST | `/merchant/api/wallet/change` | Seamless 扣款/入款 | 商戶 |
| POST | `/merchant/api/wallet/balance` | 餘額查詢 | 商戶 |
| POST | `/merchant/api/transaction/status` | 交易狀態反查（超時補償） | 商戶 |
| — | 簽章 | 原型參考：HMAC-SHA256、參數 A-Z 排序、`X-Signature`；**最終以實際 Provider 規格為準** | — |
| — | 超時策略 | 原型參考：5 秒與分段重試；**最終由 Hulk 依 Provider 規格定案** | — |

---

# D. 即時通道（WebSocket）：第一階段 9 事件 + 第二階段 3 事件 — 🔴 **分派未明**

> 🔴 [後端工作清單快照](sources/2026-07-27-backend-api-worklist.md)只列 REST 路由，未提供 WebSocket／SSE 契約。`message` 與 `customerservice` 的 🆕 標記不能當作即時推送完成證明；第一階段仍須補事件、鑑權、重連、補訊與整合測試。

| 事件 | 方向 | 用途 | 為何 REST 不夠 |
|---|---|---|---|
| `world.message` | ← | 世界頻道新訊息 | 前端只有本機 push，別人的訊息永遠不會出現 |
| `private.message` | ← | 私訊新訊息 | `unread` **只有歸零路徑、沒有增加路徑** |
| `conversation.created` | ← | 對方主動開啟對話 | 前端只在自己主動時新增 conv |
| `support.message` | ← | 客服回覆 | `receiveSupportMessage` 註解已標「保留給 WebSocket」且無呼叫端 |
| `support.ticket.updated` | ← | 工單狀態變更（含結案） | 前端**沒有任何路徑**能把 ongoing 轉 closed |
| `roster.update` | ← | 在線名單與 status 變動 | `在線/遊戲中/閒置` 是即時態 |
| `mailbox.new` | ← | 新信到達 | 未讀徽章需即時 |
| `wallet.balance` | ← | 餘額變動（人工存提、活動派獎） | 後台可直接改餘額 |
| `announcement.push` | ← | 即時公告 | — |
| 🟣 `player.muted` | ← | 被禁言 | 後台可即時禁言 |
| 🟣 `player.kicked` | ← | 強制踢線 | 後台 `force_kick` |
| 🟣 `system.maintenance` | ← | 進入維護 | `maintenance_kickout_delay_seconds` 倒數 |

**⏸ 未定**：協定（WS/SSE）、鑑權方式、重連與補訊策略、事件命名規範。

---

# 6. ⏸ 阻塞中的決策（不決定就無法定案 API）

| # | 決策點 | 影響範圍 | 選項 |
|---|---|---|---|
| **1** | ✅ **已拍板 2026-07-31**：黑名單 | A-16 | 玩家社交封鎖，由 Wu 負責 `GET/POST/DELETE /social/blocks` 3 支；不是 IP／裝置封鎖 |
| **2** | ✅ **已拍板 2026-07-31**：金額與匯率 | 所有金流端點 | 整數運算，小數無條件捨去；台幣：金幣：銀幣＝1：1：100；銅幣是無價值試玩幣 |
| **3** | ✅ **已拍板 2026-07-30**：儲值幣別與通道 | A-6 整組 | 刻意平台差異，不強制統一。見 [decisions §2](decisions/2026-07-30-first-phase-alignment-decisions.md#2-儲值幣別與通道--刻意的平台差異不強制統一) |
| **4** | ✅ **已拍板 2026-07-30**：贈禮流程機制 | A-7（6 支有效端點） | 統一為雙向確認（官網現況），直接轉帳不採用。見 [decisions §1](decisions/2026-07-30-first-phase-alignment-decisions.md#1-贈禮流程--統一為雙向確認官網現況)。**官網現行「拒絕不退款」仍是 bug，需獨立修**，不因這次拍板而解決 |
| **5** | **獎勵卡流水認列規則** | A-8／C | 由 Gordan 與 Hulk 依錢包及 Provider 交易共同定義；待交付有效投注、取消／退款／回滾與冪等規則 |
| **6** | **遊戲 catalog 範圍**（🟡 部分已拍板：結構已定，範圍未定） | A-10 整組 | ✅ 只統一資料結構／enum 型別表示方式（見 [decisions §3](decisions/2026-07-30-first-phase-alignment-decisions.md#3-遊戲分類與數量--本階段只統一資料結構不決定範圍)）。⏸ 待決：官網兩份清單(24+30)要合併成幾類幾款、APP 22 款是否擴充 —— 留待營運/採購階段 |
| **7** | **好友是否雙向同意** | A-16 | 兩前台目前都是單方面立即加入 |
| **8** | **工單狀態揭露幾段** | A-17 | 官網 2 段 vs 後台 4 段 |
| **9** | **選座位是否納入** | A-10 兩支端點 | APP 有完整資料模型、後台有 `min_seat_vip_level`、官網是 dead code |
| **10** | **檢舉是否獨立於工單** | A-17 | 官網目前塞成 report 類工單 |
| **11** | **VIP 各級門檻數值** | A-11 | 後台有欄位但無數值，需業務拍板 |
| **12** | **儲值優惠疊加規則** | A-6 | 首儲+100%、週回饋15%、VIP加碼30% 目前完全沒生效 |
| **13** | **他人遊玩紀錄是否公開** | A-16 `/players/{id}` | 玩家資料卡顯示「他玩過哪幾款」。三方原型皆無隱私開關，後台也無管理設定。選項：(a) 照做 (b) 玩家可自行關閉 (c) 不公開 |
| ~~14~~ | ~~無卡活動幣的流水與轉換規則~~ | — | ✅ **已解消**：改為全走獎勵卡，不存在無卡活動幣 |
| ~~15~~ | ~~無卡活動幣的載體實作~~ | — | ✅ **已解消**：同上 |
| **16** | 活動幣顯示位置（🟢 已降級） | L-01 | 動線改為「領卡 → F-05」後不再有斷點；Header 要不要補顯示活動幣，降為體驗優化項 |
| **17** | 獎勵卡**排序／篩選**功能（🟡 部分已定） | A-8、F-05 | ✅ 已定：卡片數量**暫定無上限**；過期規則已拍板（見 §A-8）。⏸ 待定：是否加排序篩選（依**時間／流水／金額**），Cooper 評估中 |
| **18** | ✅ **已拍板 2026-07-31**：贈禮費率 | A-7／A-11 | 依 VIP 分級；建立申請時凍結費率與手續費快照；API 需明定費率單位 |
| **19** | ✅ **已拍板 2026-07-31**：無外部提款 | A-5／客服／文案 | 官網可儲值但點數不可提款或兌現；`/vault/withdraw` 僅為 `VAULT_OUT` |

### ✅ 已定案（原待決事項）

| 原編號 | 決策 | 結論 | 日期 |
|---|---|---|---|
| — | **錢包架構** | **單一錢包（Single Wallet）**。錢包模型＝幣別 × 來源，`GAME` 維度刪除；遊戲不轉帳，bet/win 即時打錢包 API。詳見 §A-5、§C | 2026-07-29 |
| 14、15 | **活動幣派發途徑** | **一律以獎勵卡為載體**（原「雙軌並存」方案已放棄）。活動幣永遠有載體帶流水/上限/到期，前台投影邏輯不用改。營運彈性改由「卡片參數可調」提供 —— 想快速小額補償就發一張流水目標低、轉換上限高的卡 | 2026-07-30 |
| 17（部分） | **獎勵卡數量上限** | **暫定無上限**。「同幣別同時只能一張 active」規則維持 | 2026-07-30 |
| 17（部分） | **獎勵卡過期處理** | 後台可設每張卡有效期限；**到期自動失效，卡內餘額無法使用亦無法取出（沒收）**。需新增 `EXPIRED` 狀態；過期判定由後端執行；沒收記帳對應後台 `AssetLogChangeType.WIPE` | 2026-07-30 |

---

# 7. 建議推進順序

| 階段 | 事項 |
|---|---|
| **第 0 步** | ✅ 黑名單、金額規則、贈禮機制與 VIP 費率已定；剩餘需由模組負責人確認的核心項目是有效流水與遊戲 catalog 範圍 |
| **第 1 步** | 補齊 §1 通用規範文件（信封、錯誤碼、分頁、時間、id），前後端共同確認 |
| **第 2 步** | 為 E 的 50 支路由補 request/response schema，並先完成／驗收狀態空白的 24 支 |
| **第 3 步** | 依 `BE_CHANGE`／`FE_CHANGE`／`CONTRACT_ALIGN`／`DOC_FIX` 分類修正，不再使用不可重現的「9 支 🔧」統計 |
| **第 4 步** | 依後端既有時程開發 🆕，但**先做 A-5 錢包**（其他金流模組都依賴它的二維結構） |
| **第 5 步** | WebSocket 方案設計與導入 |
| **第 6 步** | 依 B 區營運操作能力另行設計正式後台 API；不以原型方法數直接排期 |

---

# 8. 限制說明

- 三個原型的資料模型**不等於最終 schema**，本表是「依現有畫面反推的需求」，不是後端契約
- E 共列 50 支，但其中 24 支狀態空白、製作中；其餘路由也尚未取得 schema 或實際呼叫驗證
- 現有 7 支測試（`tests/*.test.mjs`）可作為前端原型的參考向量；正式契約仍須補後端驗證、權限、冪等、費率與錯誤回應案例
- 端點數為估算，實際會依 §6 決策結果增減
