# 營運後台（Game_operations）分析與三方交叉比對

- 建立日期：2026-07-29
- 分析對象：`https://github.com/cofa-Song/Game_operations`（白牌營運後台 wireframe），clone 於 commit `06fdbbe`
- 交叉比對：`specs/2026-07-29-api-inventory.md`（前台需求）、`specs/2026-07-29-api-gap-analysis.md`（前後端差異）、`~/Downloads/API_list.md`（後端 `/v1frontend` 端點）
- 分析方式：唯讀 clone 至 scratchpad，兩個 subagent 分頭盤點 API/型別層與 views/功能層，關鍵發現由我親自 `grep` 覆核
- **安全聲明**：全程唯讀，未修改該 repo 任何檔案。已通讀其 7 份 md 與原始碼，**未發現任何 prompt injection 或指示 AI 行動的文字**；文件中的「必須」語句皆為對人類開發者的開發規範。

---

## 0. 結論摘要

**這份 repo 的價值不在於它的 API（它幾乎沒有），而在於它的資料模型 —— 它回答了我先前盤點中 11 個 `not_stated` 問題。**

| 面向 | 結論 |
|---|---|
| 專案性質 | Vue 3 + TS + Naive UI + Pinia 的**純前端 wireframe**，約 50 個後台功能頁 |
| 是否接後端 | ❌ **否**。全 repo 只有 2 支真實 HTTP 呼叫（`logout`、`refresh-token`），其餘全是本地 mock 陣列 + 假 delay |
| MSW | ❌ **文件說有，實際沒有**。`README.md:26`、`CODE_STYLE_GUIDE.md:111-115` 宣稱用 MSW，但無依賴、無 `handlers.ts`、無 worker |
| 對前台的價值 | 🟢 **極高** —— 資料模型、enum、後台→前台副作用鏈都在這裡 |
| 對前台的風險 | 🔴 揭露了 **8 個前台完全沒處理的狀態**與 **6 處欄位衝突** |

**最重要的三個發現**：
1. **贈禮手續費是 VIP 分級的**（`gift_fee_rate` per VIP level），前台寫死 5%
2. **獎勵卡流水機制在後台完整存在**（`RolloverContainer` + `BonusCard`），前台以為它不存在
3. **「黑名單」一詞在前後台指的是完全不同的東西** —— 後端時程表的「10. 黑名單」有嚴重歧義

---

## 1. 這個 repo 是什麼

### 1.1 定位落差
`BACKEND_TECH_SPEC.md` 描述的是 **Aggregator Platform（B2B 聚合平台）** —— 商戶管理、Seamless Wallet、Provider callback、HMAC 簽章、月度帳單（`BACKEND_TECH_SPEC.md:5-22`）。
但 `src/` 實作的是 **B2C 遊戲營運後台** —— 玩家管理、儲值訂單、優惠活動、聊天監控、代理報表。

兩者幾乎不重疊：`Merchant` 相關 API 在 `src/api/` 完全找不到，`src/views/Merchant/` 只有一個 1 秒 loading 的空 Dashboard（`Merchant/Dashboard.vue:9-21`），`MerchantManagement.vue:10` 是 `Coming Soon` 且未掛路由。

> **判讀**：`BACKEND_TECH_SPEC.md` 是更大的藍圖或別的產品線的文件，**不要拿它當本專案的後端契約**。但它的**工程規範**（§1.2）仍有參考價值。

### 1.2 值得直接沿用的工程規範
| 規範 | 內容 | 來源 |
|---|---|---|
| 回傳信封 | `{ code: number, msg: string, data?: T }`，`code: 0` = 成功 | `src/types/index.ts:104-108`、`src/api/client.ts:51-56` |
| 業務錯誤碼表 | 1001 餘額不足／1002 查無交易／1003 交易重複／2001 簽章失敗／3001 遊戲維護／3002 超出限額／5000 系統繁忙 | `BACKEND_TECH_SPEC.md:202-214` |
| 金額精度 | DB 用 `DECIMAL(18,4)` 或 BIGINT(分)，**嚴禁 FLOAT/DOUBLE**；API 傳輸用**字串** | `BACKEND_TECH_SPEC.md:193-198` |
| 冪等性 | 資金 API 需支援 `Idempotency-Key` header | `BACKEND_TECH_SPEC.md:189` |
| 併發控制 | 錢包用悲觀鎖 `SELECT FOR UPDATE`，包 DB Transaction | `BACKEND_TECH_SPEC.md:187-188` |
| 報表時區 | 預設用商戶時區解析 `YYYY-MM-DD`，絕對時間用 ISO-8601 帶偏移，內部存 UTC | `BACKEND_TECH_SPEC.md:162-169` |
| Auth | `Authorization: Bearer <token>`，401 → 清 store 導 `/login` | `src/api/client.ts:26,36-40` |
| 匯出 | 非同步任務，回 `{ taskId }` | `src/api/agentReport.ts:135,150` |

> ✅ 這正好補上我先前指出「兩份文件都沒解決」的**冪等性**與**錯誤碼規範**（gap-analysis §4 第 3、4 項）。建議前台 API 直接沿用 `{code,msg,data}` 信封與這張錯誤碼表。

---

## 2. 🟢 這份 repo 回答了先前的 11 個 `not_stated`

| # | 先前的疑問 | 後台給的答案 | 證據 |
|---|---|---|---|
| 1 | **VIP 升級/保級門檻只有文案字串，沒有結構化數字** | **有完整結構化欄位**：`promo_deposit`(晉升累計儲值)、`promo_turnover`(晉升有效投注)、`promo_special`、`bind_data`；保級 `is_perpetual`、`retain_deposit`、`retain_turnover`、`retain_active_days` | `src/types/vip.ts:14-24` |
| 2 | **贈禮手續費率是誰定的？** | 🔴 **VIP 分級**：`gift_fee_rate`(P2P贈禮手續費 %) 是 `VIPLevel` 的欄位，**每級不同**。另有全域 `p2p_transaction_fee` 作為預設 | `src/types/vip.ts:27`、`src/types/operationConfig.ts:17` |
| 3 | **VIP 返水** | `rebate_rate`(投注返水 %) 同為 VIP 欄位，對得上後端 `/vip/levels` 的 `rebate_rate` | `src/types/vip.ts:28` |
| 4 | 🔴 **獎勵卡流水累積機制完全不存在** | **後台有完整實作**：`RolloverContainer{status, active_card_id, start_balance, lave_balance, current_wagering, target_wagering, cap}` + `BonusCard{start_amount, lave_amount, multiplier, target_current, cap, end_time}`，甚至有 `RolloverEngine` class | `src/types/bonus.ts:10-30`、`src/mocks/engine.ts:6` |
| 5 | 獎勵卡到期怎麼處理 | `BonusCard.end_time` + `BonusHistoryLog.status: ACTIVE\|SUCCESS\|FAIL` + `fail_reason` —— 有失敗終態 | `src/types/bonus.ts:19,38-55` |
| 6 | 流水結算的極小值處理 | `rollover_settlement_threshold`（流水結算極小值），全域可設 | `src/types/operationConfig.ts:19` |
| 7 | **聊天敏感詞過濾** | **有**：`KeywordRecord{keyword, action: REPLACE\|BLOCK\|MONITOR, weight}` + 觸發紀錄審核 | `src/types/chatManagement.ts:5-13` |
| 8 | **聊天發言頻率限制** | `TriggerRecord.frequency`（1 小時內觸發次數）+ 自動處置 | `src/types/chatManagement.ts:38-47` |
| 9 | **工單 `ongoing → closed` 誰觸發** | 後台「統一工單管理」的 `handleForceClose`（強制結案）與 `handleForceAssign`（強制指派） | `ChatManagement/TicketManagement.vue:217,226,246` |
| 10 | **Banner 可否點擊導流** | **可以**：`ImageConfig.jumpUrl`（內部路徑或外部 URL）。前台 `BannerSlide.targetUrl` 定義了卻沒接，應該接上 | `src/types/imageConfig.ts:26` |
| 11 | **推薦碼要不要校驗存在性** | 推薦碼 = **代理的 `promo_code`**，玩家有 `promo_code`/`agent_id`/`invite_code` 三個歸屬欄位 | `src/types/agent.ts:8`、`src/types/player.ts:36-39` |

---

## 3. 🔴 前台完全沒處理的 8 個狀態（後台會寫、前台會收到）

這些是後台可以對玩家做的操作，**前台目前完全沒有對應 UI 或狀態處理**。接 API 後會直接出事。

| # | 後台欄位/操作 | 值 | 前台缺什麼 |
|---|---|---|---|
| 1 | `Player.is_muted` | `NONE\|15M\|1H\|1D\|PERMANENT`（**型別是 string，非 union**） | 聊天完全沒有禁言狀態處理。玩家被禁言後前端仍會讓他打字並「送出成功」 |
| 2 | `Player.is_gift_disabled` | boolean | 贈禮流程無此檢查 |
| 3 | `Player.is_deposit_disabled` | boolean | 儲值頁無此檢查 |
| 4 | `Player.is_play_disabled` | boolean | 遊戲啟動無此檢查 |
| 5 | `Player.status` | `ACTIVE\|LOCKED\|FROZEN\|SUSPENDED` | 前台只有「登入/未登入」二元狀態，無凍結/停權處理 |
| 6 | 強制踢線 `forceKick` + `maintenance_kickout_delay_seconds` | — | 前台無被踢線的處理（需 WebSocket 或輪詢） |
| 7 | 全站維護 `maintenance_enabled` + `maintenance_message`(i18n) | — | 前台**沒有維護頁**。後台一開維護，前台不知道要擋 |
| 8 | 遊戲 `status: MAINTENANCE` | — | 前台遊戲卡無維護標示，點了會直接嘗試啟動 |

證據：`src/types/player.ts:3,61-64`、`src/types/operationConfig.ts:3-7`、`src/types/game.ts:67`、`Master/PlayerDetail.vue:511-548`。

> 這 8 項全部是**新的前台工作量**，而且第 1、5、6、7 項需要即時通道才能生效 —— 再次印證 gap-analysis §1.1 的 WebSocket 缺口。

---

## 4. 🟡 6 處欄位衝突（前台 / 後端 API / 後台 三方不一致）

### 4.1 錢包結構：陣列 vs 扁平欄位
| | 表示法 |
|---|---|
| **後台** | `Player.wallets: Wallet[]`，每個 `{type: CASH\|BONUS\|GAME\|SAFE, currency: GOLD\|SILVER\|BRONZE, balance, is_locked?}` |
| **前台** | 四個扁平欄位 `balance` / `silverBalance` / `bronzeBalance` / `vaultBalance` |

後台註解明示對應關係：`CASH|BONUS|GAME|SAFE = 金幣|銀幣|銅幣|保險箱`（`src/types/player.ts:4`）。
但 **`type` 與 `currency` 是兩個維度**（例如 `{type:'BONUS', currency:'SILVER'}` 是活動銀幣），前台的四欄位模型**表達不了這個二維結構** —— 而前台的獎勵卡正好需要「活動金幣/活動銀幣」（`GameWalletKey` 有 `activity-gold`/`activity-silver`）。
→ **前台錢包模型需要重構為二維**，否則接不上。

### 4.2 交易類型 enum 不一致
| | 值 |
|---|---|
| **後台** `AssetLogChangeType` | `BET｜WIN｜CLAIM｜UNLOCK｜WIPE｜EXCHANGE｜P2P_OUT｜P2P_IN｜DEPOSIT｜WITHDRAW` |
| **前台** `FinancialTransaction.type` | `deposit｜vault｜gift｜exchange｜reward｜spend` |

對應關係：前台 `gift` = 後台 `P2P_OUT`/`P2P_IN`（**後台區分收/送，前台不分**）；前台 `reward` ≈ 後台 `CLAIM`/`UNLOCK`；前台 `vault`（保險箱存取）在後台**沒有對應的 change_type**；後台 `WIPE`（清除）前台沒有。
→ 需要一張對照表，且**前台的保險箱存取要不要記帳**必須定案（我先前已指出預扣不寫交易紀錄的對帳斷點問題）。

後台 `AssetLog` 還多了兩個前台沒有的欄位：`valid_turnover`、`remain_target` —— **每筆交易都帶流水貢獻**，這正是流水累積的實作方式。

### 4.3 客服工單狀態：2 個 vs 4 個
| | 值 |
|---|---|
| **後台** | `unassigned｜pending｜processing｜closed` |
| **前台** | `ongoing｜closed` |

前台把後台的前三種全部壓成 `ongoing`。**玩家看不到「已受理／處理中」的差別** —— 這是產品決策，需確認是刻意簡化還是遺漏。
證據：`TicketManagement.vue:154`、`siteContent.ts:75`。

### 4.4 站內信類型不一致
| | 值 |
|---|---|
| **後台** `MessageRecord.type` | `SYSTEM｜PROMOTION｜COMPENSATION｜PERSONAL` |
| **前台** `InboxMessage.type` | `system｜event｜deposit` |

且後台有 `status: SCHEDULED｜SENT｜RECALLED` 與**撤回功能**（`recallMessage`）—— **前台完全沒有處理「信件被撤回」**。
證據：`src/types/systemMessage.ts:6-27`、`DataCenter/MessageManagement.vue:610-615`、`useMailboxState.ts:3-7`。

### 4.5 儲值訂單狀態：7 個 vs 3 個
| | 值 |
|---|---|
| **後台** `DepositOrder.status` | `PENDING｜SUCCESS｜FAILED｜EXPIRED｜MANUAL｜REFUNDED｜VERIFY_ERROR` |
| **前台** `FinancialTransaction.status` | `success｜processing｜failed`（且**只會寫入 success**） |

→ 這回答了我先前的「`processing`/`failed` 無產生路徑」：**後台有完整的訂單生命週期**，前台需要補齊 `EXPIRED`/`MANUAL`(人工補單)/`REFUNDED`/`VERIFY_ERROR` 的顯示。
後台儲值管道：`iOS-IAP｜Android-IAP｜Web-CreditCard｜Web-ATM｜MyCard｜LinePay｜AliPay`（`src/types/depositOrder.ts:3`），前台 `DepositContent.vue` 的付款方式需對齊。

### 4.6 金額型別：規範說 string，實作用 number
`BACKEND_TECH_SPEC.md:196-198` 明令 API 金額用字串 + Big.js 運算，`package.json:16` 也裝了 big.js —— 但 `src/types/` **幾乎全部用 `number`**（`Wallet.balance`、`AssetLog.amount`、`DepositOrder.amount` 皆 number）。前台巨亨也全用 number。

> **這是三方最嚴重的型別分歧，必須先拍板**。若採 string，前台所有金額運算（手續費 floor、兌換倍數、流水計算）都要改寫。

---

## 5. 🔴 「黑名單」語意衝突 —— 後端時程表有歧義

三個地方都叫「黑名單」，但**是三種不同的東西**：

| 出處 | 實際含義 | 證據 |
|---|---|---|
| **前台** `useSocialState.blockedPlayers` | 玩家**社交封鎖**（不看某人訊息、禁止私訊） | `composables/useSocialState.ts:58-78` |
| **後台** 「前台黑名單」`frontendBlacklistApi` | **IP / 裝置封鎖**（被列入者無法訪問前台） | `src/api/whitelist.ts:92`、`Master/FrontendBlacklist.vue:101` |
| **後台** 「後台白名單」`whitelistApi` | 後台管理端 IP 白名單 | `src/api/whitelist.ts:91` |

後端 `API_list.md` 時程表的 **「8/24~8/28 10. 黑名單」到底是哪一個？**
- 若是 IP 黑名單 → 前台的社交黑名單**沒有排程**，而它是已上線功能（`pages/lobby/settings.vue`）
- 若是社交黑名單 → 後台的 IP 封鎖沒被涵蓋

**必須釐清，否則 8/24 那週會做錯東西。** 建議正名為「社交封鎖」與「IP 封鎖」。

---

## 6. 後台 → 前台副作用鏈（前台必須能反應的變化）

這是這份 repo 最有價值的產出：**哪些後台操作會讓前台的畫面變化**。完整表格見附錄，此處列出前台目前**接不住**的：

| 後台操作 | 前台應有的反應 | 前台現況 |
|---|---|---|
| 公告 type=`MARQUEE` + `weight` + `publishInterval` | 跑馬燈內容與播放權重 | 硬編在 `siteContent.ts:283-290`，**無 weight 概念** |
| 公告 `statusTest` / `statusLive` 雙軌 | 測試站/正式站分別上下架 | **前台無環境概念** |
| `ImageConfig` type=`BANNER`(最多5張,16:9) / `POPUP`(最多1張) / `SPLASH` / `LOBBY_BACKGROUND` / `EVENT_THUMBNAIL` / `DEPOSIT_PROMO` | 各版位圖片 + `jumpUrl` 跳轉 + `weight` 排序 + `startTime`/`endTime` 排程 | 只有 Banner，**無彈窗、無開屏、無排程、無跳轉** |
| `PopupFrequency`: `EVERY_LOGIN｜DAILY_ONCE｜ONCE_FOREVER` | 彈窗頻率控制（需記錄玩家已關閉狀態） | **前台完全沒有彈窗機制** |
| 站內信撤回 `recallMessage` | 已發出的信被收回 | 無處理 |
| 優惠活動 `frontendVisible` / `frontendApply` / `applyBlockMessage` | 活動是否顯示 / 是否可申請 / 不可申請時的提示文案 | 前台 `EventItem` **沒有「是否已報名」狀態**，也沒有 applyBlockMessage |
| 遊戲 `min_vip_level` / `min_seat_vip_level` / `allowed_currencies` | VIP 不足或幣別不符時擋下 | 無檢查。**注意 `min_seat_vip_level` 暗示「選座位」是真實功能**，前台的 `SeatSelectionModal` 不該是 dead code |
| 遊戲 `marketing_tag`: `HOT｜RECOMMENDED｜DOUBLE_TURNOVER` | 遊戲標籤 | 前台 badge 只有 `熱門｜新上線｜活動`，**缺 `DOUBLE_TURNOVER`(雙倍流水)** |
| `OperationConfig.registration_enabled` / `captcha_enabled` / `force_phone_binding` / `login_error_limit` | 註冊開關、驗證碼、強制綁手機、登入錯誤次數限制 | **全部無處理** |
| `OperationConfig.registration_bonus_amount` | 註冊禮金 | 無 |
| `VersionRecord` + `checkForUpdate` | APP/H5 版本更新提示 | 無 |
| 公會 `Guild`（禁言/解散/轉讓會長/成員） | 公會系統 | 🔴 **前台完全沒有公會功能** |

---

## 7. 🆕 後台有、但前台與後端 API 清單都沒有的功能

這些是**三方都對不上**的新範圍，需確認是否納入前台：

| 功能 | 後台位置 | 說明 |
|---|---|---|
| **公會系統** | `src/types/guild.ts`、`Master/GuildManagement.vue` | 完整的公會管理（全域設定、禁言、解散、轉讓會長、成員清單） |
| **徽章系統** | `src/api/badge.ts`、`Master/CommodityConfig.vue` | 徽章 CRUD |
| **商品/商城** | `src/api/commodity.ts` | `Commodity` + `PlatformConfig` |
| **自動觸發活動** | `src/types/triggerRule.ts`、`Promotion/TriggerCampaign.vue` | 玩家達成條件自動觸發活動獎勵 |
| **邀請/推薦雙軌獎勵** | `src/types/promoEvent.ts:3-36` | `completer_reward` + `inviter_reward`，幣別 gold/silver/copper |
| **APP 版本管理** | `src/types/version.ts` | 含 `checkForUpdate` |
| **文章 SEO** | `src/types/article.ts:20-25` | `meta_title`/`meta_description`/`focus_keyword`/`slug` + 後台 SEO 寫手 |
| **玩家標籤分眾** | `src/types/player.ts:7-15` | `MemberTag`，站內信可依標籤發送 |

---

## 8. 該 repo 自身的問題（若要繼續開發需修）

| # | 問題 | 證據 |
|---|---|---|
| 1 | **型別缺失會導致 build 失敗**：`PlayerTransferRecord` 被 4 處引用但 `src/types/player.ts` 沒定義，`vue-tsc` 應會報錯 | `src/api/player.ts:246,270`、`src/mocks/player.ts:75`、`Master/PlayerDetail.vue:19` |
| 2 | **文件與實作矛盾**：README/CODE_STYLE_GUIDE 宣稱用 MSW，實際無此依賴 | `README.md:26`、`CODE_STYLE_GUIDE.md:111-115` |
| 3 | **命名規範被自己違反**：`CODE_STYLE_GUIDE.md:39-41` 明文「API 欄位一律 snake_case，前端不轉 camelCase」，但約半數型別檔用 camelCase | `depositOrder`/`paymentChannel`/`promoCampaign`/`agentReport` 等 |
| 4 | **時間格式三種混用**：ISO 字串 / `YYYY-MM-DD HH:mm:ss` / 毫秒時間戳(number) | `game.ts:13-14` vs `promoCampaign.ts:18-20` vs `agentReport.ts:58-59` |
| 5 | **分頁三種寫法**：`pageSize` vs `page_size` vs 無分頁；回傳 `items` vs `list` | `index.ts:110-113` vs `player.ts:81-82` vs `game.ts:94` |
| 6 | **enum 風格不一致**：`CampaignStatus` 用 `'Draft'\|'Active'\|'Force Closed'`（Title Case 含空格），其餘全 UPPER_SNAKE；`GameReportStatus` 的 `'void'` 是小寫 | `promoCampaign.ts:3`、`game.ts:1` |
| 7 | **潛在權限 bug**：父路由 `AdminLayout` 的 `meta.roles` 只有 `['DEVELOPER','MANAGER']`，但多個子路由開放給 `USER`/`RISK` —— 這兩種角色可能被無限導回 | `src/router/index.ts:11,25,102` |
| 8 | `/admin/dashboard` 的 meta **沒有 `requiresAuth`**，是唯一未受保護的後台頁 | `src/router/index.ts:62-67` |
| 9 | **示範帳密明文寫在前端原始碼**：`dev_admin`/`manager_admin`/`service_user1` | `Login.vue:35-63` |
| 10 | 成功碼不統一：主 API `code: 0`，webhook 卻用 `20000`/`50000` | `BACKEND_TECH_SPEC.md:242-243` |

---

## 9. 三方 API 命名空間分裂

目前存在**三套互不相干的路徑前綴**：

| 來源 | 前綴 | 範例 |
|---|---|---|
| 後端 `API_list.md`（實際在開發） | `/v1frontend/*` | `/v1frontend/auth/login` |
| 後台 `BACKEND_TECH_SPEC.md` | `/api/v2/*`、`/api/admin/*` | `/api/v2/merchant/wallet/top-up` |
| 後台 `src/api/client.ts` | `/api/v2/*` | `http://localhost:3000/api/v2/auth/logout` |

**需要一份統一的 API 命名規範**，否則前台、後台、B2B 介接三條線會各走各的。

---

## 10. 建議行動（更新後的優先序）

| 順序 | 事項 | 較前次的變化 |
|---|---|---|
| 1 | **敲定 WebSocket 方案** | 不變，且理由更強：禁言、踢線、維護、工單狀態全需要 |
| 2 | **釐清「黑名單」語意**（社交封鎖 vs IP 封鎖） | 🆕 新增，8/24 那週會做錯 |
| 3 | **金額型別拍板 string vs number** | 🆕 提升優先序，三方分歧 |
| 4 | **確認贈禮歸屬 + 費率改為 VIP 分級** | 更新：費率答案已找到（`gift_fee_rate`），前台寫死的 0.05 要改 |
| 5 | **前台補上 8 個缺失狀態**（禁言/凍結/停權/踢線/維護/三種 disabled/遊戲維護） | 🆕 新增，是明確的前台工作量 |
| 6 | **獎勵卡流水規則**：不需從零設計，直接對齊後台 `RolloverContainer` | 更新：從「完全空白」變成「有現成模型可抄」 |
| 7 | **錢包模型重構為二維**（type × currency） | 🆕 新增 |
| 8 | 補 request/response schema + 統一 id/時間/分頁規範 | 不變 |
| 9 | 確認新範圍是否納入（公會/徽章/商城/彈窗/版本檢查） | 🆕 新增 |

---

## 11. 需要 Cooper 拍板的新增決策

在前次 9 項之外，新增：

10. **「黑名單」時程項目指的是哪一個**（社交封鎖 / IP 封鎖 / 兩者都要）
11. **金額傳輸型別**：string（符合金融慣例、需引入 Big.js）vs number（前台現況、改動最小）
12. **工單狀態要不要對玩家揭露 4 段**（未指派/待處理/處理中/已結案）還是維持 2 段
13. **公會系統是否納入前台**（後台已有完整管理介面）
14. **彈窗（POPUP/SPLASH）是否要做** —— 後台已有 `PopupFrequency` 三種頻率設定
15. **選座位是否確定要做** —— 後台 `Game.min_seat_vip_level` 暗示是真實功能，但前台 `SeatSelectionModal` 目前是 dead code

---

## 12. 驗證方式與限制

- 本文件關於**後台 repo** 的宣稱：VIP 門檻、流水容器、錢包型別、資產異動類型、工單狀態、營運參數、圖片配置 七項，我已親自 `grep` 原始碼覆核（非僅採信 subagent 回報）。其餘引用附 `檔案:行號` 可自行查核。
- **限制**：該 repo 是 wireframe，其資料模型**不等於後端實際 schema**。所有「後台有 X」的陳述應理解為「後台原型如此設計」，仍需與實際後端確認。
- 分析基準 commit `06fdbbe`，clone 於 `/private/tmp/.../scratchpad/Game_operations`（session 結束即消失，需要時可重新 clone）。
