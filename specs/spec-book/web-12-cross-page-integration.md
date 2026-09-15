# WEB SPEC 12｜跨頁流程、資料交接與整合邊界

> 文件狀態：Phase 3 初版，已把 `WEB-SPEC-02`～`WEB-SPEC-11` 串成 Web 跨頁流程；正式 API、即時服務與帳務一致性仍待確認。
> 工作單映射：`YOTAPLATFO-458`（SPEC）／`YOTAPLATFO-471`（Figma）／`YOTAPLATFO-484`（WEB／Nuxt）
> 文件定位：本分冊描述跨頁流程與狀態交接，不重複取代各功能分冊的畫面細節，也不取代後端 API 契約。

## 0. 文件狀態與整合範圍

本分冊是 Web 官網公開頁、登入後遊戲大廳、財務、獎勵、社交、信箱與設定之間的整合規格。內容分成三種證據：`目前 Web 原型`、`已確認規則`、`待確認`。目前可由 Nuxt 原始碼確認的 route／query／composable 行為，不等於正式跨服務交易已完成。

本章的主要交付結果是 `WEB-FLOW`、`WEB-SC`、跨頁資料交接表、狀態與錯誤邊界，以及可供 `WEB-SPEC-13` 與 Plane 子單回填的驗收索引。

## 1. 跨頁整合原則

1. 導流要保留玩家的原始目的地與必要 query；登入、年齡驗證或權限檢查完成後才能回到目的頁。
2. URL query 只描述目前視圖或導流意圖，不是權限或資產的可信來源。
3. 錢包、獎勵、贈禮、信箱附件與交易紀錄的正式結果必須來自同一個可追溯的服務端事件。
4. 頁面 local state、`useState`、localStorage、Mock 與正式資料庫的保存範圍要分開標示。
5. 跨頁錯誤不可只顯示「成功」或直接跳頁；需要保留可理解的失敗原因、可重試入口與返回路徑。

## 2. 公開頁、登入與大廳邊界

| 表面 | layout／路由 | 可公開內容 | 受保護內容 |
|---|---|---|---|
| 官網公開頁 | `default` layout；`/`、`/events`、`/leaderboard`、`/deposit`、`/tutorial`、`/support`、`/member` | 品牌、活動、排行榜、教學、FAQ、儲值說明 | 儲值操作、個人資料與會員資料 |
| 遊戲大廳 | `lobby` layout；`/lobby/*` | 未登入時可看到登入導引卡 | 遊戲啟動、財務、會員、任務、聊天、信箱與設定 |
| Web 館導流 | `/h5` 新分頁 | 年齡驗證前不直接開啟 | 由 `AgeGateModal` 驗證後呼叫 `window.open` |

`/member` 目前導向 `/lobby/member`；`/lobby/deposit` 目前導向 `/lobby/bank`。這些相容路由要保留目的地語意，正式路由是否永久保留列為 `WEB-Q-12-01`。

## 3. 跨頁流程總表

| Flow ID | 流程名稱 | 起點 | 主要交接 | 終點／結果 |
|---|---|---|---|---|
| `WEB-FLOW-01` | 公開頁 → 登入 → 大廳 | 公開頁 CTA／手機導覽 | protected destination、登入狀態 | 回到原目的頁或 `/lobby` |
| `WEB-FLOW-02` | 大廳 → 遊戲 → 返回 | `/lobby` 遊戲卡 | game、mode、wallet、Age Gate | 遊戲視圖或返回大廳 |
| `WEB-FLOW-03` | 銀行 → 保險箱／兌換／交易 | `/lobby/bank` | tab、receiver、錢包與交易結果 | `/lobby/vault`、`/exchange` 或 `/transactions` |
| `WEB-FLOW-04` | 任務／活動／優惠 → 獎勵 | `/lobby/daily`、`/events`、會員獎勵 | claim、reward card、wallet、mail | 錢包／獎勵卡／信箱可讀回 |
| `WEB-FLOW-05` | 玩家互動 → 贈禮／檢舉／客服 | `/lobby/chat` 玩家卡 | player、receiver、ticket | 保險箱轉帳、客服案件或回到聊天 |
| `WEB-FLOW-06` | 信箱／設定 → 帳戶狀態 | `/lobby/inbox`、`/settings` | read、claim、preference、logout | 更新狀態或回到官網 |
| `WEB-FLOW-07` | 深連結／重新整理／權限邊界 | 任一帶 query 路由 | URL、session、初始化順序 | 保留、阻擋或清理 query |

## 4. WEB-FLOW-01：公開頁、認證與受保護目的地

### 目前 Web 原型

`useAppState.openLogin(destination)` 會將目的地存入 `protectedDestination` 並開啟 `LoginModal`。登入完成後，`LoginModal` 呼叫 `consumeProtectedDestination()`，若存在目的地便 `router.push(destination)`；沒有目的地時維持目前頁面或依入口導向。

受保護入口包括儲值、會員、遊戲 Real 模式、每日簽到、聊天、信箱與部分大廳功能。公開活動／排行榜／教學可先瀏覽，但 CTA 進入玩家操作時要補上登入檢查。

### WEB-SC-12-01

未登入玩家從 `/deposit` 點擊儲值，應被導向登入；登入成功後回到原儲值路徑，而非無條件回首頁。若目的地 query 含 `tab`、`game` 或 `mode`，需完整保留並驗證允許值。

### 待確認

社群登入、手機登入、訪客模式與普通帳號登入是否共用相同目的地恢復規則；登入失敗、關閉 Modal、Age Gate 未同意或 session 逾期時是否清除目的地。

## 5. WEB-FLOW-02：大廳、遊戲啟動與返回

### 目前 Web 原型

`/lobby` 以 query `game` 與 `mode` 表示選取的遊戲與 Demo／Real 模式。點選 Real 未登入時會開啟登入並保留 `/lobby?game=...&mode=real`；遊戲啟動前還需要依入口觸發 Age Gate。`GameView` 目前是 iframe／`example.com` 佔位，並非正式遊戲服務。

返回流程需清除遊戲 query、保留玩家在大廳的分類／位置語意，且不得把 iframe 的載入成功推論為遊戲 session 或扣款成功。`SeatSelectionModal` 目前是 dead code，不納入可驗收流程。

### WEB-SC-12-02

玩家從遊戲卡進入 Demo，可直接看到遊戲佔位；進入 Real 需登入與年齡／資格檢查；若啟動失敗，仍留在大廳並顯示可理解原因，不應扣除錢包。

### 待確認

正式 launch token、遊戲供應商 iframe／SDK、餘額檢查、斷線恢復、結算事件、遊戲返回策略與遊戲房／座位是否重新納入 Web 範圍。

## 6. WEB-FLOW-03：銀行、保險箱、兌換與交易紀錄

### 目前 Web 原型

`/lobby/bank` 以 query `tab` 管理銀行分頁；轉帳導流會保留 `tab=transfer` 與 `receiverId` 至 `/lobby/vault`。銀行中的兌換與交易紀錄入口分別導向 `/lobby/exchange` 與 `/lobby/transactions`。`/lobby/vault` 目前實際渲染 `LobbyVaultContent`，不是只做 redirect；總綱的舊敘述已在本 Phase 3 基線同步修正。

`useFinancialState` 目前管理主錢包、銀幣、銅幣、保險箱與交易 Mock。存入／取出、兌換、贈禮保留、退款與獎勵入帳都會更新本次瀏覽的 state；這些結果尚未接正式帳務服務。

### WEB-SC-12-03

玩家從聊天玩家卡按贈禮／轉帳進入 `/lobby/vault?tab=transfer&receiverId=...`，頁面需選取指定收件人；若 query 無效、玩家不存在、餘額不足或登入狀態失效，需阻擋送出並保留可返回聊天的路徑。

### 已確認規則／待正式化

`NT$1 = 金幣 1 = 銀幣 100`、銅幣無價值、金額採整數與小數捨去、無外部提款等產品規則已列在既有決策；正式服務仍需補交易原子性、冪等、對帳、支付狀態與退款契約。

## 7. WEB-FLOW-04：任務、活動、優惠碼、獎勵卡與信箱

每日簽到、活動 CTA、優惠碼與信箱附件可能產生不同類型的獎勵。跨頁的共同要求是：領取前顯示完整獎勵與限制，成功後讓玩家在正確的錢包／獎勵卡／交易紀錄／信箱位置讀回，且不因重整或重複點擊重複發放。

目前 `useRewardCardState`、`usePromoCodeState`、`useMailboxState` 與 `useFinancialState` 都在前端保存 Mock 結果。獎勵卡第 10／15／20 天的幣別與型態在來源間仍有差異，需以正式規則封存前的 `WEB-Q-12-02` 狀態處理。

### WEB-SC-12-04

玩家完成簽到或輸入優惠碼後，若獎勵為活動銀幣、獎勵卡或錢包獎勵，頁面要清楚顯示下一個查看位置；信箱附件領取後，錢包與交易紀錄需使用同一個結果，不可出現畫面顯示已領但資產未變更的狀況。

## 8. WEB-FLOW-05：聊天、玩家卡、贈禮、檢舉與客服

`/lobby/chat` 的玩家小卡可以導向：

- 贈禮／轉帳：`/lobby/vault?tab=transfer&receiverId=<playerId>`。
- 檢舉：建立客服 `report` 類別案件，再切換到 `?channel=support` 的案件對話。
- 私人訊息：在頁面內建立或開啟既有私人對話。
- 封鎖：更新 `useSocialState`，並同步關閉小卡／清單；設定頁可解除封鎖。

### WEB-SC-12-05

玩家檢舉後，客服案件建立失敗或已達同時 1 筆進行中案件上限時，不得留下半成品案件；成功時需回到該客服案件並顯示檢舉對象與原因。玩家被封鎖後不能再透過私訊或玩家卡繞過限制。

### 待確認

世界頻道／私人頻道的正式即時服務、好友關係、訊息已讀、檢舉證據、客服附件、案件 SLA 與封鎖的後端同步規則。

## 9. WEB-FLOW-06：信箱、設定、法律與登出

信箱附件會連結財務結果；設定中的黑名單會連結社交狀態；Legal Modal 同時服務登入與設定；Logout Modal 會清除登入、財務、贈禮、社交與客服狀態並回到 `/`。這些共用狀態清理是跨頁交付的一部分。

### WEB-SC-12-06

玩家在信箱讀取附件或設定調整偏好後登出，再重新登入時，正式服務應依帳戶資料恢復正確結果；目前原型只保留部分 auth／profile 與偏好 localStorage，其餘狀態會重置，不能當成正式持久化證據。

## 10. Route query、深連結與重新整理

| Query／路徑 | 用途 | 目前行為 | 風險／正式要求 |
|---|---|---|---|
| `protectedDestination` | 登入後回到原目的地 | `useState` 暫存 | 需防開放 redirect、過期與重複消費 |
| `/lobby?game=&mode=` | 遊戲選取與模式 | 大廳頁讀取並切換狀態 | 需驗證遊戲與模式白名單 |
| `/lobby/member?tab=` | 會員分頁 | `profile`／`bindings`／`vip`／`rewards`／`history` | 需保留合法 tab，非法值回預設 |
| `/lobby/bank?tab=` | 銀行分頁 | 轉帳／兌換／交易會導向專頁 | query 不能繞過權限或狀態檢查 |
| `/lobby/vault?tab=transfer&receiverId=` | 玩家贈禮導流 | 讀取收件人並進入轉帳 tab | 收件人、登入與黑名單需服務端驗證 |
| `/lobby/chat?channel=` | 聊天頻道 | `world`／`private`／`support` | query 只切換視圖，不代表權限 |

重新整理時，auth 初始化、偏好初始化與頁面 query 解析的順序要固定；若必要資料尚未載入，不應短暫呈現錯誤帳戶、錯誤錢包或錯誤收件人。

## 11. 跨頁狀態所有權與保存範圍

| 狀態 | 目前所有者 | 目前保存 | 正式來源候選 |
|---|---|---|---|
| 登入／profile／目的地 | `useAppState` | login flag／profile 部分 localStorage；目的地 session | Auth／Account service |
| 錢包／交易 | `useFinancialState` | `useState`，本次瀏覽 | Wallet／Ledger service |
| 獎勵卡／優惠碼 | 對應 composable | `useState`，本次瀏覽 | Reward／Promotion service |
| 贈禮案件 | `useGiftState` | `useState`，本次瀏覽 | Gift／P2P service |
| 好友／黑名單 | `useSocialState` | `useState`，本次瀏覽 | Social／Safety service |
| 客服案件 | `useSupportTicketState` | `useState`，跨元件但非跨裝置 | Support service |
| 信箱 | `useMailboxState` | `useState`，本次瀏覽 | Notification／Mailbox service |
| 偏好 | `usePreferencesState` | localStorage 部分欄位 | Account preference service＋local fallback |
| 頁面草稿／私人對話／世界訊息 | page-local `ref` | 不保存 | WebSocket／draft service（待定） |

## 12. 跨頁錯誤、回滾與一致性

- 認證失敗：保留可安全恢復的目的地，清除無效 token，不能把受保護頁面當成已登入。
- query 無效：以安全預設或清除 query，不能透過 URL 直接變更會員、遊戲、收件人或資產。
- 領取／兌換失敗：不更新成功 UI；可重試時保留輸入，並使用冪等鍵避免重複發獎。
- 贈禮建立／接受／拒絕／取消／逾期：保留案件狀態與保留資產的對應交易；退款不可只更新畫面。
- 信箱附件：已讀與已領要分開；已讀不代表附件已入帳。
- 登出：清除本次登入可見的受保護資料，但不應刪除正式帳戶服務上已完成的交易或案件。

## 13. API、事件與整合依賴

目前 API inventory 顯示前端沒有實際 `$fetch` 交易呼叫；gap analysis 已列出認證復原、遊戲啟動、支付／錢包、好友、WebSocket、檢舉、客服、信箱與活動等缺口。正式整合需要至少定義：

| 領域 | 需要的跨頁事件／結果 |
|---|---|
| Auth | `session.created`、`session.expired`、`profile.updated` |
| Game | `game.launch.created`、`game.session.closed`、`game.settlement.completed` |
| Finance | `deposit.completed`、`wallet.changed`、`transaction.created` |
| Reward | `reward.claimed`、`reward-card.converted`、`promo.redeemed` |
| Gift | `gift-request.created`、`gift-request.resolved`、`gift-request.expired` |
| Social／Support | `friend.changed`、`player.blocked`、`support-ticket.updated` |
| Mail | `mail.received`、`mail.read`、`mail-attachment.claimed` |

事件至少要含會員識別、事件 ID、來源功能、發生時間、冪等鍵與可追溯 reference ID；不以頁面跳轉成功當作服務端交易成功。

## 14. Nuxt、SSG 與 runtime 邊界

公開頁與 lobby layout 均參與 SSG。`ClientOnly`／`Teleport`、localStorage、document theme、音訊、計時器與 Modal 必須在 client 安全初始化；否則可能造成 hydration mismatch 或互動事件失效。`nuxt.config.ts` 的 `experimental.appManifest=false`、baseURL `/Yota_Website_Nuxt/`、`docs/.nojekyll` 與 `nitro.watchOptions` 是部署基線，不得在跨頁重構時移除。

SSG 只能證明靜態輸出可產生，不能證明登入、支付、WebSocket、帳務或正式遊戲 session。跨頁驗證需分開記錄文件、純前端原型、瀏覽器、SSG、部署與正式服務結果。

## 15. 跨頁驗收條件

| ID | 驗收條件 |
|---|---|
| `WEB-AC-12-01` | 公開頁進入受保護功能時能保留目的地；登入／Age Gate 取消或失敗不會誤放行。 |
| `WEB-AC-12-02` | 大廳遊戲 query、會員 tab、銀行／聊天 query 均只接受合法值，重新整理後視圖一致。 |
| `WEB-AC-12-03` | 聊天玩家卡導向贈禮、檢舉與私訊時，收件人／案件／頻道上下文不遺失。 |
| `WEB-AC-12-04` | 獎勵、信箱附件與財務結果能以同一 reference 追溯；失敗不產生假成功。 |
| `WEB-AC-12-05` | 登出會清理受保護前端狀態並返回官網；重新登入不讀取上一個帳戶的 session Mock。 |
| `WEB-AC-12-06` | 桌機／手機、SSG hydration 與路由深連結的驗證證據能與流程 ID 對應。 |

## 16. 開放問題、變更與參照來源

待確認：`/lobby/vault` 的正式路由定位；每日獎勵卡幣別；登入目的地的安全白名單；遊戲 launch／結算；錢包與贈禮的正式交易邊界；客服與 WebSocket；信箱未讀／推播；偏好與黑名單的帳戶同步。

需同步修正的既有文件：`_index-table.md` 的 W-08 檢舉截圖狀態、每日任務舊版獎勵文字，以及任何把 Mock 成功寫成正式服務完成的 handoff 敘述。

參照：`specs/spec-book/WEB_SPEC_RULES.md`、`specs/spec-book/web-02-public-site.md`～`web-11-inbox-settings.md`、`layouts/default.vue`、`layouts/lobby.vue`、`composables/useAppState.ts`、`composables/useFinancialState.ts`、`composables/useGiftState.ts`、`pages/lobby/index.vue`、`pages/lobby/chat.vue`、`components/lobby/VaultContent.vue`、`specs/2026-07-29-api-inventory.md`、`specs/2026-07-29-api-gap-analysis.md`。
