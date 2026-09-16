# Plane WEB 開單批次備份 v1

本檔是「巨亨ONLINE Web 官網與遊戲大廳」的 Plane 父單／子單批次 preview 來源與 execute 回寫紀錄。它參考 APP 開單批次的結構、模組、欄位與執行閘門，但將工作流、來源文件、技術內容與去重範圍改為目前的 Nuxt Web 專案。

本批已在使用者確認 preview 後呼叫 Plane 建立、掛載模組與建立 relations；本檔的 actual identifier、URL 與驗證結果以 Plane 實際回應為準。附件 APP_WORK_ORDER_BATCH_v1.md 僅作為分類與流程參考，本次未修改。

## 0. 批次狀態與來源

| 欄位 | 值 |
|---|---|
| 批次版本 | v1.0 |
| 文件狀態 | v1.0 execute 完成：3 父單＋39 子單已建立，模組與 relations 已回讀驗證；2026-09-15 Plane 描述回填與二次 readback 完成 |
| 執行模式 | preview → 使用者確認 → execute → full readback |
| 目標 Workspace | aerixc（沿用 APP 批次目標；本次 Plane 回應提供 workspace UUID） |
| 目標 Workspace ID | 302db5a4-d4ff-4e15-91bf-3176464185ff |
| 目標 Project | YOTA_Platform |
| 目標 Project Identifier | YOTAPLATFO |
| 目標 Project ID | f0eda32b-7bfa-4026-a312-edfd432c6452 |
| 批次流程 Project | 開單中心（PMOPS）；本批未使用，不承接本批 WEB 子單 |
| 來源 Repository | 巨亨ONLINE-Nuxt |
| 來源分支 | main |
| 來源狀態 | working tree 有既有修改與未追蹤檔案；本批只新增本來源文件，不覆寫既有修改 |
| 主要來源 | `specs/spec-book/00-overview.md`、`specs/spec-book/20-frontend.md`、`handoff/frontend-handoff.md` |
| 輔助來源 | `specs/spec-book/10-art.md`、`specs/spec-book/30-backend.md`、`specs/2026-07-29-api-master-list.md`、`specs/2026-07-29-api-inventory.md`、`specs/2026-07-29-api-gap-analysis.md`、`handbook/` |
| 統一規格版本 | Web 文件目前沒有單一版本號；以各文件實際日期與目前 repository 狀態記錄，待 preview 時確認版本基線 |
| Plane 專案時區 | UTC（本檔不預填日期；若加入日期，需先確認是否改以 Asia/Taipei 解讀） |
| 預期父單數 | 3 |
| 預期子單數 | 39（每個工作流 13 張） |
| 預期總工作單數 | 42 |
| 已建立 WEB 父單 | YOTAPLATFO-444～446（3 張） |
| 已建立 WEB 子單 | YOTAPLATFO-447～485（39 張） |
| API key | 不寫入本檔 |

### 0.1 目前來源文件的定位

- `specs/spec-book/00-overview.md`：三方範圍、畫面編號、三方差異與截圖索引的主幹。
- `specs/spec-book/20-frontend.md`：Web 前端路由、元件、composable、狀態機、原型限制與串接優先序。
- `handoff/frontend-handoff.md`：目前 Nuxt 專案的實際入口、官網／大廳分層、共用元件、部署與 Mock 邊界。
- API master、inventory、gap analysis：提供 Web 前端與既有後端工作單的依賴背景；不直接把後端工作重複開成 Web 前端工作單。
- `handbook/`：提供面向使用者的流程、規則、錯誤與客服語意；若與目前程式或正式 API 契約不同，需在 preview 標成待確認。

## 1. 已確認的批次結構與欄位方向

### 1.1 三張父單

本批保留 APP 批次的三條交付工作流，但第三條改為目前實際的 Nuxt Web 前端，不使用 Cocos Creator 名稱。

1. 規格：負責 Web 官網與遊戲大廳的規格整理、確認、引用與後續回寫。
2. Figma：負責公開頁、大廳、流程、狀態、響應式設計與 handoff。
3. Nuxt：負責 Nuxt 路由、頁面、元件、狀態、SSG、Mock／API 串接界線與驗證。

三組子單共用同一組 `WEB-01`～`WEB-13` 功能索引，但每組描述與驗收內容不同。Plane 的 `parent` 一次只對應一個父單；跨工作流使用 relations，不把一張子單同時掛到三個父單。

本批不另開第四張 QA 父單。QA 若尚未確認獨立負責人與工作流，先在各子單的驗收區段及 `WEB-13` 使用 `QA` 標籤；日後若確認需要獨立 QA 交付，再另行提出批次變更。

### 1.2 子單命名與 source_key

APP 批次已在同一個 Project 內使用 `SPEC-03`、`DESIGN-03`、`FE-03` 等名稱；WEB 批次不得沿用相同 title，避免跨平台混淆。因此本批在 title 中固定使用 `WEB` 平台前綴，並以工作流代碼區分三組子單：

規格：

    【WEB】【SPEC-01】【規格書】核心架構、SSG 與共用導覽

Figma：

    【WEB】【DESIGN-01】【Figma】核心架構、SSG 與共用導覽

Nuxt：

    【WEB】【FE-01】【Nuxt】核心架構、SSG 與共用導覽

規則：

- 第一組括弧是平台：`WEB`。
- 第二組括弧是工作流與功能索引：`SPEC-01`、`DESIGN-01`、`FE-01`。
- 第三組括弧是交付類型：`規格書`、`Figma`、`Nuxt`。
- `source_key` 是本批自行定義的追蹤鍵，不是 Plane 自動產生的單號。
- `actual_plane_identifier` 只能填入 Plane 建立後的實際識別碼，不預填、不推算。
- 目前 Project 沒有自訂 Work Item property，因此 `source_key` 同時寫在 title 與描述開頭，不假設存在可直接儲存 source_key 的自訂欄位。

### 1.3 共用欄位與指派決策

| 工作流 | Plane 指派者 | Plane 顯示名稱 | 標籤 |
|---|---|---|---|
| 規格 | Arthur（已確認） | `arthur_` | `WEB`、`PM`、`V1` |
| Figma | Nini（已確認） | `nini_` | `WEB`、`設計`、`V1` |
| WEB（Nuxt） | David（已確認） | `david_` | `WEB`、`前端`、`V1` |

以上三條工作流的正式指派者已由使用者確認；`QA` 的候選人與是否獨立開單尚未指定。

本批沿用更新後 APP 批次的欄位設定：

- 初始狀態：`需求登錄`（本批已套用）
- 優先級：`High`（本批已套用）
- 版本標籤：`V1`（本批已套用）
- 開始日期與結束日期：不填
- Figma 檔案、page、frame、component、node ID：待實際設計檔確認後補入
- API、gateway、資料庫、正式帳務欄位：不自行猜測

### 1.4 Work Item 類型與模組建立限制

目前 Plane 回傳 `work_item_types=false`、`is_issue_type_enabled=false`；現有 Project 工作單大多沒有 `type_id`。本批先使用一般 Work Item、`parent`、標題前綴、標籤與描述。

`create_work_item` 的建立參數沒有 `module` 欄位，因此模組不是一次 create 就能完成的欄位。正式執行時應依下列順序處理：

1. 建立工作單並取得實際 Work Item UUID。
2. 使用 `manage_module_work_items` 將工作單加入預覽指定的主要模組。
3. 回讀工作單與模組，確認加入結果。

## 2. 模組對應預覽

### 2.1 父單模組

三張 WEB 父單使用目前 Project 已存在的 `Web官網` 模組作為共同總入口。該模組名稱已在 Plane 修正為 `Web官網`；本批不建立新模組，也不更名其他模組。

| 模組 | Module ID | 目前狀態 | WEB 批次判讀 |
|---|---|---|---|
| Web官網 | `66f405b2-e288-48e6-bc32-445faf40710f` | backlog | 三張父單的共同總入口；目前沒有工作單 |

### 2.2 子單主要模組

每張子單只指定一個主要模組。跨領域內容寫入描述與 relations，不在同一張 Work Item 指定多個主要模組。以下依目前 APP 批次的功能分類，並以 Web 實際功能範圍選定主要模組；同一功能的 SPEC、DESIGN、FE 三張子單使用相同主要模組。

| source_key | WEB 功能 | 主要模組 | Module ID | 判斷與備註 |
|---|---|---|---|---|
| WEB-01 | 核心架構、SSG 與共用導覽 | 首頁與總覽 | `50decac6-e7c6-4de0-8330-d40cf354696e` | Web 全域入口、layout、SSG 與跨頁基礎；對應整體入口類功能 |
| WEB-02 | 官網首頁、內容與公開頁 | 營運內容管理 | `9c776044-1984-4de7-8f42-e265b055b421` | CMS／Banner／公告／文章內容為主要功能；首頁呈現僅作次要關聯 |
| WEB-03 | 登入、註冊與年齡驗證 | 會員管理 | `561b04b0-6268-4e1e-ad59-75723ca6315c` | 參考 APP 功能 03；玩家帳號與身份，不使用權限與管理員 |
| WEB-04 | 遊戲大廳與導覽 | 首頁與總覽 | `50decac6-e7c6-4de0-8330-d40cf354696e` | 參考 APP 功能 04；玩家入口、遊戲列表、篩選與導覽 |
| WEB-05 | 遊戲進入、模式與返回 | 遊戲管理 | `084adb04-bf90-4edf-a620-0b984a1830b5` | 參考 APP 功能 05；遊戲列表、供應商、遊戲狀態與啟動流程 |
| WEB-06 | 個人資訊、VIP 與會員功能 | 會員管理 | `561b04b0-6268-4e1e-ad59-75723ca6315c` | 參考 APP 功能 06；profile、綁定、VIP、紀錄與頭像 |
| WEB-07 | 錢包、銀行與交易 | 財務管理 | `0de88f97-4f7d-4eb1-83b3-11b61954a648` | 參考 APP 功能 08～09；儲值、錢包、保險箱、兌換與交易紀錄 |
| WEB-08 | 獎勵卡、優惠碼與贈禮 | 會員管理 | `561b04b0-6268-4e1e-ad59-75723ca6315c` | 以獎勵卡／會員福利為主要責任，參考 APP 功能 07；優惠碼與贈禮涉及財務管理時寫入描述與 relations |
| WEB-09 | 每日任務、活動、排行榜與教學 | 優惠與任務 | `f85c2739-efaf-48a3-b6ad-e1e3508a56c3` | 參考 APP 功能 10；任務、活動、簽到與排行榜，教學作同一玩家導流範圍 |
| WEB-10 | 聊天、玩家互動與客服 | 客服與風控 | `f038f193-4c03-4112-9242-f620b6b5c16f` | 參考 APP 功能 11；公頻、私訊、好友、封鎖、檢舉與客服 |
| WEB-11 | 信箱、通知與設定 | 訊息管理 | `94210d1a-01bf-42ab-a276-06b76817ab04` | 參考 APP 功能 12；站內信、多渠道通知與設定，個人設定作次要關聯 |
| WEB-12 | API 串接、資料狀態與跨頁整合 | 首頁與總覽 | `50decac6-e7c6-4de0-8330-d40cf354696e` | 參考 APP 功能 13 的跨介面交接；只追蹤 Web 串接界線與跨頁資料整合 |
| WEB-13 | 驗收、部署與 handoff | 首頁與總覽 | `50decac6-e7c6-4de0-8330-d40cf354696e` | 參考 APP 功能 14～15 的整體交付與情境驗收；不另建驗收模組 |

## 3. 13 個 WEB 功能來源與追蹤對照

以下 13 個功能索引是 Web 專用映射，不直接複製 APP 的 03～15 章名稱；需要與 APP 對照的功能，在描述與 relation 中引用 APP 已建立的對應單，而不共用同一個 source_key。

| 編號 | WEB 功能 | 主要來源 | 主要路由／程式範圍 | 子單主要模組 |
|---|---|---|---|---|
| 01 | 核心架構、SSG 與共用導覽 | `specs/spec-book/20-frontend.md` §0、§2；`handoff/frontend-handoff.md` §2～§4、§13～§14 | `nuxt.config.ts`、`app.vue`、`layouts/default.vue`、`layouts/lobby.vue`、`assets/css/main.css`、共用 composables | 首頁與總覽 |
| 02 | 官網首頁、內容與公開頁 | `specs/spec-book/20-frontend.md` §10；`specs/spec-book/00-overview.md` §5；`handoff/frontend-handoff.md` §5.1 | `/`、`/events`、`/leaderboard`、`/deposit`、`/tutorial`、`/support`、`/member`、`data/siteContent.ts`、`components/shared/*` | 營運內容管理 |
| 03 | 登入、註冊與年齡驗證 | `specs/spec-book/20-frontend.md` §1；`handoff/frontend-handoff.md` §7 | `LoginModal.vue`、`AgeGateModal.vue`、`useAppState.ts`、`useAgeGateState.ts`、法律彈窗 | 會員管理 |
| 04 | 遊戲大廳與導覽 | `specs/spec-book/20-frontend.md` §2～§3；`handoff/frontend-handoff.md` §5.2、§9～§10 | `/lobby`、`LobbyHeader.vue`、`LobbySidebar.vue`、`GameGrid.vue`、`GameCard.vue`、`GameFilterBar.vue` | 首頁與總覽 |
| 05 | 遊戲進入、模式與返回 | `specs/spec-book/20-frontend.md` §3；`handoff/frontend-handoff.md` §9.3～§9.4 | `pages/lobby/index.vue`、`GameView.vue`、遊戲 iframe／試玩與正式模式、最近遊玩 | 遊戲管理 |
| 06 | 個人資訊、VIP 與會員功能 | `specs/spec-book/20-frontend.md` §9；`handoff/frontend-handoff.md` §7～§8 | `/lobby/member`、`MemberProfileView.vue`、`MemberProfileModal.vue`、profile／VIP／紀錄／頭像狀態 | 會員管理 |
| 07 | 錢包、銀行與交易 | `specs/spec-book/20-frontend.md` §4；`specs/2026-07-29-api-inventory.md` §5 | `/lobby/bank`、`/lobby/deposit`、`/lobby/vault`、`/lobby/exchange`、`/lobby/transactions`、`useFinancialState.ts`、`utils/wallets.ts` | 財務管理 |
| 08 | 獎勵卡、優惠碼與贈禮 | `specs/spec-book/20-frontend.md` §4.4、§6；`handbook/08-gifts.md`、`handbook/10-reward-cards-and-redemption.md` | `/lobby/member?tab=rewards`、`/lobby/gifts`、`RewardCardContent.vue`、`PromoCodePanel.vue`、`useRewardCardState.ts`、`usePromoCodeState.ts` | 會員管理 |
| 09 | 每日任務、活動、排行榜與教學 | `specs/spec-book/20-frontend.md` §5；`handoff/frontend-handoff.md` §5、§8 | `/lobby/daily`、`/lobby/events`、`/lobby/leaderboard`、`/lobby/tutorial`、`Shared*Content.vue`、`useLeaderboardTimer.ts` | 優惠與任務 |
| 10 | 聊天、玩家互動與客服 | `specs/spec-book/20-frontend.md` §8；`specs/2026-07-29-api-inventory.md` §9～§11 | `/lobby/chat`、`/lobby/support`、`PlayerSearchModal.vue`、`useSocialState.ts`、`useSupportTicketState.ts` | 客服與風控 |
| 11 | 信箱、通知與設定 | `specs/spec-book/20-frontend.md` §7、§2.1；`handoff/frontend-handoff.md` §5.2、§7 | `/lobby/inbox`、`/lobby/settings`、`useMailboxState.ts`、`usePreferencesState.ts`、`useAudioState.ts`、`useLogoutState.ts` | 訊息管理 |
| 12 | API 串接、資料狀態與跨頁整合 | `specs/spec-book/00-overview.md` §1～§2；`specs/2026-07-29-api-master-list.md`、`api-inventory.md`、`api-gap-analysis.md` | API／Mock 邊界、狀態持久化、跨頁傳值、載入／空態／錯誤／權限與重複操作 | 首頁與總覽 |
| 13 | 驗收、部署與 handoff | `specs/spec-book/00-overview.md` §5～§7；`handoff/frontend-handoff.md` §13～§15；`specs/spec-book/_index-table.md` | 84 張截圖索引、文件／測試／瀏覽器／SSG／部署／正式服務證據、交付回寫 | 首頁與總覽 |

補充：

- Web 的官網公開頁與登入後大廳共用多個 `components/shared/*` 元件；不將同一份共用邏輯拆成兩張重複子單。
- `WEB-12` 只負責前端串接界線與依賴整理，不取代既有後端 API 工作單。
- `WEB-13` 包含跨頁玩家情境與整體交付對照；不另增加第 14 張子單。
- 現有 Nuxt 原型的 Mock 成功、靜態生成成功與正式 API／部署服務驗收必須分開記錄。

## 4. 三張父單預覽

### 4.1 Web 規格父單

| 欄位 | 批次值 |
|---|---|
| source_key | WEB-SPEC |
| title | `【WEB】【規格】巨亨ONLINE Web 官網與遊戲大廳規格書` |
| parent | 無 |
| assignee | Arthur（已確認；Plane：`arthur_`） |
| labels | `WEB`、`PM`、`V1`（已套用） |
| state | `需求登錄` |
| priority | High（已套用） |
| module | `Web官網`（已確認；Plane Module：`66f405b2-e288-48e6-bc32-445faf40710f`） |
| expected_children | 13 |
| actual_plane_identifier | YOTAPLATFO-444 |
| actual_plane_url | [開啟工作單](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-444) |

父單內容候選：

- 以 Web spec-book、frontend handoff、handbook 與 API 盤點作為來源索引。
- 將官網公開頁、登入後遊戲大廳、跨頁流程、API／Mock 界線與整體驗收整理成 13 個 Web source_key。
- 明確區分目前 Nuxt 原型已存在的畫面／Mock、尚待補強的正式串接，以及不能由前端自行決定的後端／帳務契約。
- 每張 SPEC 子單引用實際文件段落、路由、元件、現況限制與驗收證據類型。
- 文件覆蓋、原型操作、瀏覽器操作、SSG 產出、部署與正式服務驗收分開記錄。
- 後續修改需同步 spec-book、handoff、handbook、API 對照與版本／決策紀錄。

### 4.2 Web Figma 父單

| 欄位 | 批次值 |
|---|---|
| source_key | WEB-DESIGN |
| title | `【WEB】【設計】巨亨ONLINE Web 官網與遊戲大廳 Figma` |
| parent | 無 |
| assignee | Nini（已確認；Plane：`nini_`） |
| labels | `WEB`、`設計`、`V1`（已套用） |
| state | `需求登錄` |
| priority | High（已套用） |
| module | `Web官網`（已確認；Plane Module：`66f405b2-e288-48e6-bc32-445faf40710f`） |
| expected_children | 13 |
| actual_plane_identifier | YOTAPLATFO-445 |
| actual_plane_url | [開啟工作單](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-445) |

父單內容候選：

- 以 WEB-SPEC 與各 WEB-SPEC 子單為上游依據，將官網公開頁、大廳、響應式斷點、流程與共用元件轉成設計交付。
- 每張 DESIGN 子單需說明入口、返回、預設、空資料、載入、錯誤、停用、資格不足、處理中、完成與取消狀態。
- 同時覆蓋桌機／手機與 default layout／lobby layout 的平台差異。
- Figma page、frame、component、asset、handoff 與 node ID 待實際設計檔確認後補入。
- 不自行定義 API、資料庫、正式帳務欄位或未確認的視覺數值。

### 4.3 Nuxt 前端父單

| 欄位 | 批次值 |
|---|---|
| source_key | WEB-FE |
| title | `【WEB】【前端】巨亨ONLINE Nuxt 官網與遊戲大廳` |
| parent | 無 |
| assignee | David（已確認；Plane：`david_`） |
| labels | `WEB`、`前端`、`V1`（已套用） |
| state | `需求登錄` |
| priority | High（已套用） |
| module | `Web官網`（已確認；Plane Module：`66f405b2-e288-48e6-bc32-445faf40710f`） |
| expected_children | 13 |
| actual_plane_identifier | YOTAPLATFO-446 |
| actual_plane_url | [開啟工作單](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-446) |

父單內容候選：

- 以 WEB-SPEC 作為功能與驗收依據，以 WEB-DESIGN 作為視覺、狀態與交互交付依據。
- 負責 Nuxt 頁面／路由、layout、共用元件、composable 狀態、SSG 與跨功能整合。
- 保留目前 `appManifest: false`、GitHub Pages baseURL、`docs/.nojekyll` 生成與 `<Teleport>`／`<ClientOnly>` 等已知 runtime 約束。
- 明確區分目前前端 Mock／local state 與後續正式 API、WebSocket、CMS、帳務與支付服務。
- 每張 FE 子單需說明資料來源、保存範圍、載入／空資料／失敗／權限／取消／返回／重複操作與測試證據。
- `npm run generate`、typecheck、focused tests、瀏覽器互動與正式部署不互相代替。

## 5. 規格工作流 13 張子單

父單：WEB-SPEC

預設指派者：Arthur（已確認；Plane：`arthur_`）

預設標籤：`WEB`、`PM`、`V1`（已套用）

預設狀態：`需求登錄`

預設優先級：High（已套用）

| source_key | title | 主要來源 | 主要模組 | actual_plane_identifier | actual_plane_url |
|---|---|---|---|---|
| WEB-SPEC-01 | `【WEB】【SPEC-01】【規格書】核心架構、SSG 與共用導覽` | `20-frontend.md` §0、§2；frontend handoff §2～§4、§13～§14 | 首頁與總覽 | YOTAPLATFO-447 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-447) |
| WEB-SPEC-02 | `【WEB】【SPEC-02】【規格書】官網首頁、內容與公開頁` | `20-frontend.md` §10；`00-overview.md` §5 | 營運內容管理 | YOTAPLATFO-448 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-448) |
| WEB-SPEC-03 | `【WEB】【SPEC-03】【規格書】登入、註冊與年齡驗證` | `20-frontend.md` §1；frontend handoff §7 | 會員管理 | YOTAPLATFO-449 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-449) |
| WEB-SPEC-04 | `【WEB】【SPEC-04】【規格書】遊戲大廳與導覽` | `20-frontend.md` §2～§3；frontend handoff §5.2、§9 | 首頁與總覽 | YOTAPLATFO-450 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-450) |
| WEB-SPEC-05 | `【WEB】【SPEC-05】【規格書】遊戲進入、模式與返回` | `20-frontend.md` §3；frontend handoff §9.3～§9.4 | 遊戲管理 | YOTAPLATFO-451 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-451) |
| WEB-SPEC-06 | `【WEB】【SPEC-06】【規格書】個人資訊、VIP 與會員功能` | `20-frontend.md` §9；member route／components | 會員管理 | YOTAPLATFO-452 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-452) |
| WEB-SPEC-07 | `【WEB】【SPEC-07】【規格書】錢包、銀行與交易` | `20-frontend.md` §4；API inventory §5 | 財務管理 | YOTAPLATFO-453 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-453) |
| WEB-SPEC-08 | `【WEB】【SPEC-08】【規格書】獎勵卡、優惠碼與贈禮` | `20-frontend.md` §4.4、§6；handbook gifts／reward cards | 會員管理 | YOTAPLATFO-454 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-454) |
| WEB-SPEC-09 | `【WEB】【SPEC-09】【規格書】每日任務、活動、排行榜與教學` | `20-frontend.md` §5；frontend handoff §5、§8 | 優惠與任務 | YOTAPLATFO-455 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-455) |
| WEB-SPEC-10 | `【WEB】【SPEC-10】【規格書】聊天、玩家互動與客服` | `20-frontend.md` §8；API inventory §9～§11 | 客服與風控 | YOTAPLATFO-456 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-456) |
| WEB-SPEC-11 | `【WEB】【SPEC-11】【規格書】信箱、通知與設定` | `20-frontend.md` §7、§2.1；frontend handoff §5.2、§7 | 訊息管理 | YOTAPLATFO-457 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-457) |
| WEB-SPEC-12 | `【WEB】【SPEC-12】【規格書】API 串接、資料狀態與跨頁整合` | `00-overview.md` §1～§2；API master／inventory／gap | 首頁與總覽 | YOTAPLATFO-458 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-458) |
| WEB-SPEC-13 | `【WEB】【SPEC-13】【規格書】驗收、部署與 handoff` | `00-overview.md` §5～§7；`_index-table.md`；frontend handoff §13～§15 | 首頁與總覽 | YOTAPLATFO-459 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-459) |

每張 SPEC 子單描述至少包含：`source_key`、問題與目標、來源段落、目前實作／Mock 狀態、目標規則、影響路由與資料、與 APP／後端的差異、待確認事項、FLOW／畫面／驗收索引、文件回寫與驗證證據。

## 6. Figma 工作流 13 張子單

父單：WEB-DESIGN

預設指派者：Nini（已確認；Plane：`nini_`）

預設標籤：`WEB`、`設計`、`V1`（已套用）

預設狀態：`需求登錄`

預設優先級：High（已套用）

| source_key | title | 上游規格 | 主要模組 | actual_plane_identifier | actual_plane_url |
|---|---|---|---|---|
| WEB-DESIGN-01 | `【WEB】【DESIGN-01】【Figma】核心架構、SSG 與共用導覽` | WEB-SPEC-01 | 首頁與總覽 | YOTAPLATFO-460 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-460) |
| WEB-DESIGN-02 | `【WEB】【DESIGN-02】【Figma】官網首頁、內容與公開頁` | WEB-SPEC-02 | 營運內容管理 | YOTAPLATFO-461 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-461) |
| WEB-DESIGN-03 | `【WEB】【DESIGN-03】【Figma】登入、註冊與年齡驗證` | WEB-SPEC-03 | 會員管理 | YOTAPLATFO-462 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-462) |
| WEB-DESIGN-04 | `【WEB】【DESIGN-04】【Figma】遊戲大廳與導覽` | WEB-SPEC-04 | 首頁與總覽 | YOTAPLATFO-463 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-463) |
| WEB-DESIGN-05 | `【WEB】【DESIGN-05】【Figma】遊戲進入、模式與返回` | WEB-SPEC-05 | 遊戲管理 | YOTAPLATFO-464 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-464) |
| WEB-DESIGN-06 | `【WEB】【DESIGN-06】【Figma】個人資訊、VIP 與會員功能` | WEB-SPEC-06 | 會員管理 | YOTAPLATFO-465 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-465) |
| WEB-DESIGN-07 | `【WEB】【DESIGN-07】【Figma】錢包、銀行與交易` | WEB-SPEC-07 | 財務管理 | YOTAPLATFO-466 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-466) |
| WEB-DESIGN-08 | `【WEB】【DESIGN-08】【Figma】獎勵卡、優惠碼與贈禮` | WEB-SPEC-08 | 會員管理 | YOTAPLATFO-467 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-467) |
| WEB-DESIGN-09 | `【WEB】【DESIGN-09】【Figma】每日任務、活動、排行榜與教學` | WEB-SPEC-09 | 優惠與任務 | YOTAPLATFO-468 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-468) |
| WEB-DESIGN-10 | `【WEB】【DESIGN-10】【Figma】聊天、玩家互動與客服` | WEB-SPEC-10 | 客服與風控 | YOTAPLATFO-469 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-469) |
| WEB-DESIGN-11 | `【WEB】【DESIGN-11】【Figma】信箱、通知與設定` | WEB-SPEC-11 | 訊息管理 | YOTAPLATFO-470 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-470) |
| WEB-DESIGN-12 | `【WEB】【DESIGN-12】【Figma】API 串接、資料狀態與跨頁整合` | WEB-SPEC-12 | 首頁與總覽 | YOTAPLATFO-471 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-471) |
| WEB-DESIGN-13 | `【WEB】【DESIGN-13】【Figma】驗收、部署與 handoff` | WEB-SPEC-13 | 首頁與總覽 | YOTAPLATFO-472 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-472) |

每張 DESIGN 子單描述至少包含：上游 WEB-SPEC、設計範圍、桌機／手機斷點、入口與返回、狀態稿、空態／錯誤／停用／資格不足、跨頁資料交接、Figma 交付位置、資產與 handoff、不納入的 API／帳務決策，以及依 SPEC／FLOW／SC／AC 或畫面索引的驗收方式。

## 7. Nuxt 工作流 13 張子單

父單：WEB-FE

預設指派者：David（已確認；Plane：`david_`）

預設標籤：`WEB`、`前端`、`V1`（已套用）

預設狀態：`需求登錄`

預設優先級：High（已套用）

| source_key | title | 上游規格／設計 | 主要模組 | actual_plane_identifier | actual_plane_url |
|---|---|---|---|---|
| WEB-FE-01 | `【WEB】【FE-01】【Nuxt】核心架構、SSG 與共用導覽` | WEB-SPEC-01／WEB-DESIGN-01 | 首頁與總覽 | YOTAPLATFO-473 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-473) |
| WEB-FE-02 | `【WEB】【FE-02】【Nuxt】官網首頁、內容與公開頁` | WEB-SPEC-02／WEB-DESIGN-02 | 營運內容管理 | YOTAPLATFO-474 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-474) |
| WEB-FE-03 | `【WEB】【FE-03】【Nuxt】登入、註冊與年齡驗證` | WEB-SPEC-03／WEB-DESIGN-03 | 會員管理 | YOTAPLATFO-475 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-475) |
| WEB-FE-04 | `【WEB】【FE-04】【Nuxt】遊戲大廳與導覽` | WEB-SPEC-04／WEB-DESIGN-04 | 首頁與總覽 | YOTAPLATFO-476 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-476) |
| WEB-FE-05 | `【WEB】【FE-05】【Nuxt】遊戲進入、模式與返回` | WEB-SPEC-05／WEB-DESIGN-05 | 遊戲管理 | YOTAPLATFO-477 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-477) |
| WEB-FE-06 | `【WEB】【FE-06】【Nuxt】個人資訊、VIP 與會員功能` | WEB-SPEC-06／WEB-DESIGN-06 | 會員管理 | YOTAPLATFO-478 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-478) |
| WEB-FE-07 | `【WEB】【FE-07】【Nuxt】錢包、銀行與交易` | WEB-SPEC-07／WEB-DESIGN-07 | 財務管理 | YOTAPLATFO-479 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-479) |
| WEB-FE-08 | `【WEB】【FE-08】【Nuxt】獎勵卡、優惠碼與贈禮` | WEB-SPEC-08／WEB-DESIGN-08 | 會員管理 | YOTAPLATFO-480 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-480) |
| WEB-FE-09 | `【WEB】【FE-09】【Nuxt】每日任務、活動、排行榜與教學` | WEB-SPEC-09／WEB-DESIGN-09 | 優惠與任務 | YOTAPLATFO-481 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-481) |
| WEB-FE-10 | `【WEB】【FE-10】【Nuxt】聊天、玩家互動與客服` | WEB-SPEC-10／WEB-DESIGN-10 | 客服與風控 | YOTAPLATFO-482 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-482) |
| WEB-FE-11 | `【WEB】【FE-11】【Nuxt】信箱、通知與設定` | WEB-SPEC-11／WEB-DESIGN-11 | 訊息管理 | YOTAPLATFO-483 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-483) |
| WEB-FE-12 | `【WEB】【FE-12】【Nuxt】API 串接、資料狀態與跨頁整合` | WEB-SPEC-12／WEB-DESIGN-12 | 首頁與總覽 | YOTAPLATFO-484 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-484) |
| WEB-FE-13 | `【WEB】【FE-13】【Nuxt】驗收、部署與 handoff` | WEB-SPEC-13／WEB-DESIGN-13 | 首頁與總覽 | YOTAPLATFO-485 | [開啟](https://plane.elitepro.ltd/aerixc/browse/YOTAPLATFO-485) |

每張 FE 子單描述至少包含：上游規格與設計、實際 Nuxt route／component／composable、現況與目標、Mock／正式 API 邊界、資料讀寫與保存範圍、載入／空態／錯誤／權限／取消／返回／重複操作、SSG／hydration 注意事項、測試與瀏覽器證據，以及「目前 Web 原型完成不等於正式服務完成」的界線。

## 8. 跨工作流關係與既有工作單

### 8.1 已建立關係與未自動建立的關係

本批 execute 已依實際 Work Item UUID 建立並回讀以下 `relates to` 關係：

- `WEB-DESIGN-01`～`WEB-DESIGN-13` relates to 對應的 `WEB-SPEC-*`，共 13 條。
- `WEB-FE-01`～`WEB-FE-13` relates to 對應的 `WEB-SPEC-*` 與 `WEB-DESIGN-*`，共 26 條。
- `WEB-FE-02` relates to `YOTAPLATFO-384`、`YOTAPLATFO-385`、`YOTAPLATFO-387`；`WEB-FE-09` relates to `YOTAPLATFO-399`，共 4 個既有前台 API 關聯。
- 依 APP 批次已明確標為「先做關聯」的範圍，`WEB-SPEC-06`／`WEB-DESIGN-06` relates to `YOTAPLATFO-378`，`WEB-SPEC-05`／`WEB-DESIGN-05` relates to `YOTAPLATFO-377`，`WEB-SPEC-11`／`WEB-DESIGN-11`／`WEB-SPEC-12`／`WEB-DESIGN-12` relates to `YOTAPLATFO-375`，共 8 個跨平台關聯。
- 本批未建立 `blocked by`／`blocking`；關係只表達交付範圍與參照，不替代尚未確認的流程責任。
- 同一功能若同時與 APP 或後端工作單有交集，使用 `relates to` 或經確認的 `blocks`，不把跨平台工作單改掛到 WEB 父單底下。

### 8.2 APP 批次的即時狀態

附件最新版本與 2026-09-15 的 Plane 即時查詢均顯示 APP 批次已建立，狀態如下：

| APP 工作流 | 即時 Plane 工作單 |
|---|---|
| APP 規格父單 | `YOTAPLATFO-402` |
| APP Figma 父單 | `YOTAPLATFO-403` |
| APP Creator 父單 | `YOTAPLATFO-404` |
| APP 39 張子單 | `YOTAPLATFO-405`～`YOTAPLATFO-443`，共 39 張 |

這些 APP 工作單不是本批 WEB 子單；它們只在功能規則、流程或平台差異確實相同時作為關聯候選。不可因 source number 相同就視為重複或 blocked by。

### 8.3 目前已存在的 Web／前台相關工作單

本次以結構化 PQL 重新查詢，並在 execute 後回讀：

- execute 前 `WEB` 標籤與標題含 `WEB`、`官網` 或 `網站` 的既有工作單均為 0；本批建立後新增 42 張 WEB 工作單。
- `Web官網` 模組由 execute 前的 0 張變為 3 張，且只掛三張 WEB 父單；39 張子單未掛父單模組。
- 39 張子單已依功能掛入 8 個主要模組，模組數量與本檔對照表一致。
- 已有前台 API／營運後台工作單，應作為 WEB 依賴或關聯，不重複開前端 API，例如：
  - `YOTAPLATFO-384`：前台公告列表 API
  - `YOTAPLATFO-385`：前台圖片與彈窗顯示 API
  - `YOTAPLATFO-387`：前台文章瀏覽 API
  - `YOTAPLATFO-399`：前台簽到查詢與領取 API

去重不能只依賴一次 free-text search；preview 會以 `label`、`title`、描述、路由／元件與實際交付物做多層比對。

### 8.4 去重與判讀規則

- `source_key` 使用 `WEB-` namespace，避免與 APP 已建立的 `SPEC-*`、`DESIGN-*`、`FE-*` 混淆。
- 完全相同交付物：保留既有工作單，標記 `related` 或 `skip`，不建立重複單。
- 只有相近名稱：讀取描述、路由、元件、API 範圍與驗收內容後，標記 `manual-confirmation`，不自動合併。
- 已有後端 API 單：WEB 前端單保留 UI／串接／錯誤與驗收範圍，透過 relation 指向後端單。
- 目前 repository 已有的 Mock 功能：不代表正式交付已完成；若本批要追蹤完整交付，應在工作單內寫清楚現況證據與剩餘目標。
- 草案建立前不預填 Plane 單號、URL、父單 UUID、Figma node ID 或未確認的關係類型；execute 後只回寫 Plane 實際回傳值。

## 9. Plane 即時參考資料（2026-09-15）

本節是 execute 前重新讀取的查詢快照；execute 後的實際建立結果與 full readback 見第 13 節。

### 9.1 狀態

| 狀態 | State ID | 群組 | 本批用途 |
|---|---|---|---|
| 需求登錄 | `0f4d3379-f6b5-4734-bf24-284cd00adf15` | backlog | 所有父單與子單初始候選 |
| 初步分析 | `1963ff10-4200-477b-b57d-8c92bdf3bff9` | backlog | PM 分析需求類型與優先度 |
| 規格製作 | `33569a11-fa67-42f1-8e8a-84514312b13f` | backlog | 規格與原型製作 |
| 技術審查 | `b56d7dc5-f227-4cac-a6d3-29a2242f0a78` | unstarted | 技術方向審查 |
| 工作指派 | `523807f7-fc04-4afd-af16-d008ba6a3e03` | unstarted | 負責人與週期確認 |
| 製作/自測完成 | `6a8b8292-1cd3-43fa-b7c6-8e485f56f1ba` | started | 負責人自測完成 |
| 驗證完成 | `21de70f5-12b9-4f31-87a8-821ebb07929d` | started | 組長驗證完成 |
| 測試階段 | `3df65180-a394-45eb-8a54-5653fae15d2d` | started | QA／測試站／回歸 |
| 待發布 | `d2dd5712-0fee-4434-b507-a87e9bacc4ac` | completed | 等待發布 |
| 已上Prod | `db12af32-d781-4f58-98a6-cf960bd2d140` | completed | 正式環境交付完成 |

### 9.2 標籤

| 標籤 | Label ID | 本批用途 |
|---|---|---|
| WEB | `8159630e-167d-4446-96bb-4d967156fbb4` | 平台標籤 |
| V1 | `7af5158f-f223-4cd5-ac9a-b377473b6bad` | 版本標籤；本批已套用並回讀確認 |
| PM | `594942a1-6a94-440a-ac63-b8bce4a9c28d` | 規格工作流 |
| 設計 | `9f941b50-bab3-43bb-ad22-d3aa7758c0c2` | Figma 工作流 |
| 前端 | `6e200c43-cd0f-4dc6-a143-dac5dc4c2bf9` | Nuxt 工作流 |
| QA | `ef8d6e90-828a-4d77-88ed-34c308ece83e` | 驗收／測試候選 |
| 待確認 | `4a6211d4-c154-462d-a68d-e3cd0456c607` | 未決欄位或人工判讀候選 |

### 9.3 工作流成員與候選 reviewer

| 顯示名稱 | Plane account | User ID | 本批用途 |
|---|---|---|---|
| arthur_ | Arthur | `c9b50f3a-ce65-4502-8cd5-fc72864eb700` | 規格負責（已確認） |
| nini_ | Nini | `c82c975f-fdb2-446c-978a-8f1962195ef1` | 設計負責（已確認） |
| david_ | David | `1016daef-4cba-40fa-bb57-012f47ce8244` | Nuxt 前端負責（已確認） |
| oren_ | Oren | `cc5f998c-71a3-47e8-98a5-3745b446e34b` | QA 候選；尚未形成獨立父單 |

### 9.4 Execute 前確認的專案事實

- `WEB`、`V1`、`PM`、`設計`、`前端`、`QA`、`待確認` 標籤仍存在且 ID 未變。
- `Web官網` 與所有子單主要模組仍存在且未封存。
- APP 402～443 與其他前台／後端工作單的最新狀態與描述。
- Project 時區仍為 UTC；若要加入日期，再確認業務使用時區。
- 目前沒有可用的自訂 Work Item property；`source_key` 仍使用 title＋description 保存。

## 10. 子單描述模板

### 10.1 WEB-SPEC 子單

每張規格子單至少包含：

- `source_key` 與本批功能名稱。
- 問題與交付目標。
- 規格來源文件、章節、路由、元件與畫面索引。
- 目前 Nuxt 原型、Mock、local state、已知限制與尚未執行的驗收。
- 目標行為、流程、狀態、資料、資格與錯誤規則。
- 官網公開頁／登入後大廳差異，以及與 APP／後端的交集或差異。
- 影響的 Figma、Nuxt、API／後端工作單與待確認事項。
- 文件檢查、原型操作、瀏覽器操作、SSG、部署與正式服務驗收的分開證據。
- 後續修改要回寫的 Markdown、HTML、決策、FLOW／畫面／驗收索引。

### 10.2 WEB-DESIGN 子單

每張設計子單至少包含：

- 上游 WEB-SPEC source_key 與實際規格位置。
- 桌機／手機、default layout／lobby layout 的設計範圍。
- 入口、返回、預設、載入、空資料、錯誤、停用、資格不足、處理中、完成與取消狀態。
- 頁面、流程、欄位、元件、響應式規則、資產與內容狀態。
- 跨頁需要帶入的會員、遊戲、資產、紀錄或目標資料。
- Figma page／frame／component／node ID 與 handoff；未確認時留空。
- 不自行定義 API、資料庫、正式帳務或未拍板視覺數值。
- 依 WEB-SPEC、畫面索引與交付狀態做驗收。

### 10.3 WEB-FE 子單

每張 Nuxt 子單至少包含：

- 上游 WEB-SPEC 與 WEB-DESIGN source_key。
- 實際 route、page、component、composable、utility、資料來源與保存範圍。
- 目前 Mock／local state 與目標正式 API／WebSocket／CMS 的邊界。
- 載入、空資料、失敗、權限／資格不足、取消、返回、重複操作與 hydration 行為。
- SSG、`appManifest: false`、`baseURL`、`.nojekyll`、`ClientOnly`／`Teleport` 等適用的 runtime 注意事項。
- 驗證方式：focused tests、typecheck、`npm run generate`、瀏覽器／響應式操作、部署或正式服務證據。
- 明確聲明目前原型／Mock 的通過不等於正式 API、帳務、WebSocket、CMS 或 Prod 通過。

## 11. 執行閘門（本批已完成）

1. [完成] 使用者確認本檔的三父單、39 子單、Web 專用 source_key、父單與子單模組分配、指派者、V1、High 與 `需求登錄` 設定。
2. [完成] 以本檔作為 preview 輸入，重新讀取 YOTA_Platform 的 Project、成員、狀態、標籤、模組、Work Item 類型／property 與既有工作單。
3. [完成] 展開 3 張父單與 39 張子單的完整描述、來源引用、路由／元件、現況／目標、重複判讀、模組與待確認項目。
4. [完成] 使用者確認 preview 後建立 3 張父單，並保留 Plane 實際回傳的 Work Item UUID、identifier 與 URL。
5. [完成] 使用父單實際 UUID 建立對應的 13 張子單；未以預估單號或 source_key 代替 parent UUID。
6. [完成] 依模組對應表呼叫 `manage_module_work_items`，父單與子單均已加入確認後的主要模組。
7. [完成] 建立並確認實際 Work Item ID 後，建立 WEB 內部、既有前台 API 與已確認範圍的 APP 設計工作單 relations。
8. [完成] 重新讀取目標 Project 與本批 42 張工作單，驗證父子關係、標題、描述、指派者、標籤、狀態、優先級、模組與 relations。
9. [完成] 將實際 Plane identifier、URL、成功／related／人工確認結果回寫本檔；本批建立與關聯操作未發生錯誤，未對未知狀態盲目重試。

在使用者確認 preview 前，本批沒有建立、更新、刪除、移動或重新指派任何 Plane 工作單；既有 APP 402～443 保持原有工作單，本批只對已確認的 APP 設計單建立 relates to 關聯。

## 12. 本輪確認與待討論事項

### 已確認

- 目標是完整 Web 交付基線，而非只開未完成缺口。
- 批次規模採 3 張父單、39 張子單、總計 42 張工作單。
- 執行流程與 APP 相同：先整理來源 MD，再 preview，再由使用者確認，最後才 execute。
- Web 可以參考 APP 更新版的主要模組、High、`需求登錄`、父子關係與去重流程。
- 三張父單使用 Plane 的 `Web官網` 模組；模組名稱拼字已修正。
- 39 張子單依功能使用主要模組，不繼承父單的 `Web官網`；同一功能的 SPEC、DESIGN、FE 共用相同主要模組，跨領域內容寫入描述與 relations。
- 本批已實際套用 `V1`、High、`需求登錄`，並完成 3 張父單、39 張子單、模組掛載與 51 個 `relates to` 關聯。

### 待確認

- QA 是否只作標籤或日後另開工作流。
- WEB 工作單是否要把目前 working tree 的未提交變更視為交付基線；預設只記錄 `main` 來源與現況，不把未提交檔案宣稱為已交付版本。
- Figma 檔案、page、frame、node ID 與正式 API／CMS／WebSocket／帳務契約，待實際資料確認後補入。

本檔已由草案轉為 execute 後的交付基線紀錄；後續若新增子單、調整模組、改派負責人或補入正式設計／服務契約，需另開變更並同步回寫本檔。

## 13. 執行結果與驗證（2026-09-15）

### 13.1 建立結果

- 父單：`YOTAPLATFO-444`（規格）、`YOTAPLATFO-445`（Figma）、`YOTAPLATFO-446`（Nuxt）。
- SPEC 子單：`YOTAPLATFO-447`～`YOTAPLATFO-459`，13 張，指派 Arthur。
- DESIGN 子單：`YOTAPLATFO-460`～`YOTAPLATFO-472`，13 張，指派 Nini。
- FE 子單：`YOTAPLATFO-473`～`YOTAPLATFO-485`，13 張，指派 David。
- 42 張工作單均為非草稿、`需求登錄`、High，並使用對應的 `WEB`／工作流／`V1` 標籤；所有描述均已寫入 `source_key`、來源、範圍與交付邊界。

### 13.2 模組回讀

| 模組 | execute 後工作單總數 | 本批新增／確認掛載 |
|---|---:|---:|
| Web官網 | 3 | 3 張父單 |
| 首頁與總覽 | 34 | 12 張子單 |
| 營運內容管理 | 29 | 3 張子單 |
| 會員管理 | 77 | 9 張子單 |
| 遊戲管理 | 28 | 3 張子單 |
| 財務管理 | 46 | 3 張子單 |
| 優惠與任務 | 63 | 3 張子單 |
| 客服與風控 | 35 | 3 張子單 |
| 訊息管理 | 35 | 3 張子單 |

父單只掛入 `Web官網`，39 張子單只掛入功能主要模組；未將子單錯掛到父單的 `Web官網` 模組。

### 13.3 Relations 回讀

- WEB 內部交付鏈：39 個對應關聯（13 個 DESIGN→SPEC、13 個 FE→SPEC、13 個 FE→DESIGN）。
- 既有前台 API：4 個關聯目標（FE-02→`YOTAPLATFO-384`／`385`／`387`，FE-09→`YOTAPLATFO-399`）。
- 已確認的 APP 設計參照：8 個關聯目標（WEB-05／06／11／12 對應 `YOTAPLATFO-375`／`377`／`378`）。
- 合計 51 個 `relates to` 關聯目標；本批新單回讀未出現 `blocked by` 或 `blocking`。
- APP 其他候選工作單維持人工範圍確認，未因同號或相近名稱自動關聯。

### 13.4 Full readback 證據

- Plane Project 工作單總數：473；預期新增 42 張，實際找到連續序號 `YOTAPLATFO-444`～`YOTAPLATFO-485`，無重複或遺漏。
- 3 張父單與 39 張子單的標題、父單 UUID、指派者、標籤、狀態、優先級、描述與 `is_draft=false` 均驗證通過。
- 9 個模組的總數與本批新增掛載數均符合預期。
- 本批未修改 APP `YOTAPLATFO-402`～`YOTAPLATFO-443` 的工作單內容；只對已確認範圍的 APP 設計單建立 `relates to`。
- 截至建立結果紀錄撰寫時，本批次紀錄尚未 commit／push；後續 Git 交付狀態以本檔最新章節為準。

### 13.5 Plane 描述回填與二次 Full readback（2026-09-15）

- 回填範圍：已建立的 3 張父單與 39 張子單，共 42 張；原有 `description_html` 保留，僅在尾端追加 Web 規格書回填區塊。
- 回填內容：正確的 `specs/spec-book/` 規格來源、`source_key`、WEB-01～WEB-13 功能索引、SPEC／DESIGN／FE 三方 identifier、父單 identifier、工作流交接、驗證證據與交付邊界。
- 命名同步：13 張 FE 子單已修正為已確認格式 `【WEB】【FE-xx】【Nuxt】功能名稱`；原描述中的 13 處舊 Web 批次來源 `docs/plane/WEB_WORK_ORDER_BATCH_v1.md` 已改為 `specs/plane/WEB_WORK_ORDER_BATCH_v1.md`。
- 回填標記：`WEB_SPEC_BACKFILL_2026_09_15`；以標記避免後續重跑時重複追加。
- FE-12（`YOTAPLATFO-484`）第一次更新回傳錯誤；唯讀回讀確認未寫入後進行單張重試，重試成功，未產生重複回填。

二次 Full readback 結果：

- Plane 回傳 42 張，序號連續 `YOTAPLATFO-444`～`YOTAPLATFO-485`；遺漏 0、重複 0。
- 標題正確 42/42、父子關係正確 42/42、回填標記恰好一次 42/42、`source_key` 正確 42/42。
- canonical `specs/spec-book/` 與 `specs/plane/WEB_WORK_ORDER_BATCH_v1.md` 路徑存在 42/42；舊 Web `docs/plane` 路徑 0 處；驗證失敗 0。
- 本次 Plane 描述／標題回填記錄已納入 commit `4832261` 並推送至 `origin/main`；後續 Pages 實作與 Page mapping 另於第 14 節記錄。

## 14. Plane Pages 完整規格書實作與連結（2026-09-16）

### 14.1 Page 結構與內容來源

- 已依 APP Pages 的實際粒度建立 Web 完整文件：1 張規範頁、1 張總綱索引頁、13 張功能規格頁，共 15 張 Web Pages。
- Page 內文不是工作單摘要；每張 Page 均由本 repository 的完整 Markdown 轉為 HTML 後寫入 Plane，保留原有章節、表格、流程、User Story、驗收與交付內容。
- WEB-01 使用 `specs/spec-book/20-frontend.md` 作為核心架構／Nuxt／SSG／共用導覽完整內容；總綱頁使用 `00-overview.md` 與 `_index-table.md`；規範頁使用 `WEB_SPEC_RULES.md`。
- WEB-02～WEB-13 分別使用 `specs/spec-book/web-02-*.md`～`web-13-*.md`；本地 `.md` 仍是 canonical source，Plane Page 是閱讀與工作單連結層。
- 所有新 Web Pages 使用公開 access、未封存、未鎖定；頁面維持 APP 同樣的頂層 Page 形式，未臆造未確認的巢狀頁面關係。

### 14.2 Web Page 對照表

| Page key | Plane Page 名稱 | Page UUID | repository source | 對應工作單 |
|---|---|---|---|---|
| WEB-RULES | `【WEB】【規範】規格書撰寫規範` | `98713d26-853f-4b13-8132-7da0cfc5ff1a` | `WEB_SPEC_RULES.md` | `YOTAPLATFO-444` |
| WEB-OVERVIEW-00 | `【規格】【WEB】00.官網_總綱與索引` | `7353802e-0466-4cf4-afa8-635453a6fc9a` | `00-overview.md`、`_index-table.md` | `YOTAPLATFO-444`／`445`／`446` |
| WEB-SPEC-01 | `【WEB】【規格】01.核心架構、SSG 與共用導覽` | `ac23f910-cfbd-4bbc-bb01-2abb5d636ea0` | `20-frontend.md` | `YOTAPLATFO-447`／`460`／`473` |
| WEB-SPEC-02 | `【WEB】【規格】02.官網首頁、內容與公開頁` | `e77a8edc-4cfb-4eb9-bd1e-da9957b07982` | `web-02-public-site.md` | `YOTAPLATFO-448`／`461`／`474` |
| WEB-SPEC-03 | `【WEB】【規格】03.登入、註冊與年齡驗證` | `a918bf34-388d-43fa-8a5c-e0eec839c93f` | `web-03-authentication.md` | `YOTAPLATFO-449`／`462`／`475` |
| WEB-SPEC-04 | `【WEB】【規格】04.遊戲大廳與導覽` | `3b022e1f-9ea1-401f-824f-66334f1d1337` | `web-04-lobby-navigation.md` | `YOTAPLATFO-450`／`463`／`476` |
| WEB-SPEC-05 | `【WEB】【規格】05.遊戲進入、模式與返回` | `dfb143e2-7b16-4a9f-870b-0bfb768fe8f1` | `web-05-game-session.md` | `YOTAPLATFO-451`／`464`／`477` |
| WEB-SPEC-06 | `【WEB】【規格】06.個人資訊、VIP 與會員功能` | `e9ed426d-77d0-4551-96df-8240e120304e` | `web-06-member.md` | `YOTAPLATFO-452`／`465`／`478` |
| WEB-SPEC-07 | `【WEB】【規格】07.錢包、銀行與交易` | `5c3f3d74-ad41-470a-8257-4e0f8ac8db2d` | `web-07-finance.md` | `YOTAPLATFO-453`／`466`／`479` |
| WEB-SPEC-08 | `【WEB】【規格】08.獎勵卡、優惠碼與贈禮` | `8dde94a1-7ff3-4957-bc6c-9cb0f148e48e` | `web-08-rewards-promotions-gifts.md` | `YOTAPLATFO-454`／`467`／`480` |
| WEB-SPEC-09 | `【WEB】【規格】09.每日任務、活動、排行榜與教學` | `fd94d80b-e856-47ad-b214-3e76196ab9de` | `web-09-tasks-events-rankings-tutorial.md` | `YOTAPLATFO-455`／`468`／`481` |
| WEB-SPEC-10 | `【WEB】【規格】10.聊天、玩家互動與客服` | `9206954b-edd1-46b0-9e57-4d107f7e50de` | `web-10-social-support.md` | `YOTAPLATFO-456`／`469`／`482` |
| WEB-SPEC-11 | `【WEB】【規格】11.信箱、通知與設定` | `00e026ba-565f-418e-9050-241319f1f4a7` | `web-11-inbox-settings.md` | `YOTAPLATFO-457`／`470`／`483` |
| WEB-SPEC-12 | `【WEB】【規格】12.API 串接、資料狀態與跨頁整合` | `5d481239-36cc-4f25-b556-b23bfbd709b6` | `web-12-cross-page-integration.md` | `YOTAPLATFO-458`／`471`／`484` |
| WEB-SPEC-13 | `【WEB】【規格】13.驗收、部署與 handoff` | `458336b9-43d4-4356-b09d-3971ce9b0ffe` | `web-13-acceptance-delivery.md` | `YOTAPLATFO-459`／`472`／`485` |

### 14.3 Page ↔ Work Item 連結

- 規範 Page `98713d26-853f-4b13-8132-7da0cfc5ff1a` → `YOTAPLATFO-444`。
- 總綱 Page `7353802e-0466-4cf4-afa8-635453a6fc9a` → `YOTAPLATFO-444`、`445`、`446`。
- WEB-01～WEB-13 的各功能 Page，分別連到同功能的 SPEC、DESIGN、FE 三張子單；共 13 × 3 = 39 個連結。
- Page attachment 合計 43 個：父單／規範 4 個，加上功能子單 39 個。
- 既有 51 個 `relates to` 工作關聯未修改；Page attachment 是文件連結層，與工作流關聯並存。

### 14.4 Page 與連結 Full readback 證據

- Plane Project Pages 總數由 24 張增加為 39 張；Web Pages 15/15 張均可由精確名稱回讀。
- 15/15 張 Page 使用正確名稱、`WEB_PAGE_SYNC_20260916` marker、repository source path 與非空完整 HTML 內容；沒有建立重複 Web Page。
- Page 內容 readback：15/15 成功；內容長度約 9,220～31,173 字元，依頁面完整內容不同而異。
- 父單與規範 attachment readback：16/16 工作單的預期 Page 集合完全吻合。
- DESIGN／FE attachment readback：26/26 工作單的預期 Page 集合完全吻合。
- 合計 42/42 張 Web 工作單均可回讀正確 Page；遺漏 0、錯誤 0、mapping mismatch 0。
- 本次使用 `list_pages({ project_id })` 的無 `params` 形式；帶入 plain object `params` 會觸發 Plane MCP 的 `model_dump` 錯誤，後續查詢需先檢查 `isError`，不可將錯誤回應 fallback 成空清單。
- 本階段未修改 APP Pages 內容、APP 工作單內容或既有 `relates to` 關聯。

### 14.5 Git 同步狀態

- Plane Pages 與 Page attachment 已完成，但屬外部 Plane 狀態；本次新增的 Page UUID／mapping 紀錄已回寫本檔。
- 本節回寫尚未自動 stage、commit 或 push；既有 working tree 修改與未追蹤檔案仍保留，後續需另行確認 Git 交付範圍。

### 14.6 原有 `relates to` 最終 readback（2026-09-16）

- 以 `list_work_item_relations` 唯讀回讀本批 42 張 Web 工作單，42/42 成功，沒有 relation API 錯誤。
- Plane 回傳的 `relates_to` 項目共 90 筆；將雙向回傳正規化為唯一工作單邊後為 51 個關聯，與原批次紀錄一致。
- Web 內部三方關聯為 39 個：每個 WEB-01～WEB-13 均完整具備 SPEC↔DESIGN、SPEC↔FE、DESIGN↔FE；預期 39、實際 39，遺漏 0、非預期 0。
- 既有外部參照為 12 個，保留原有前台 API 與已確認 APP 設計參照；未新增或移除外部工作單關聯。
- `blocking`、`blocked_by`、`duplicate`、`start_after`、`start_before`、`finish_after`、`finish_before` 均為 0。
- 本次只做 relation readback，未呼叫建立或移除 relation 的操作；Pages 建立與 Page attachment 沒有改動原有 51 個 `relates to`。
