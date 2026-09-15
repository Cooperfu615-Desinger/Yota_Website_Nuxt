# WEB 規格書拆分與撰寫規則

- 文件版本：v0.2
- 建立日期：2026-09-15
- 文件狀態：Phase 4 文件基線；10 個功能分冊、跨頁整合、整體驗收、Web HTML 閱讀版與可重跑文件驗證已建立
- 適用專案：`巨亨ONLINE-Nuxt`
- 對應 Plane：`YOTAPLATFO-444`（規格父單）、`YOTAPLATFO-447`～`YOTAPLATFO-459`（規格子單）

本文件參考 APP 的規格拆分方法，但不把 APP 的畫面、路由、平台行為或工作單內容直接視為 Web 需求。Web 規格的正式內容必須以 Web 已確認的產品規則、目前 Nuxt 原始碼、API 依賴與實際驗證證據為準。

## 1. 文件定位與來源優先順序

### 1.1 文件定位

Web 規格書是「官網公開頁＋登入後遊戲大廳」的獨立前台規格來源，需同時描述：

- 公開官網與登入後大廳的產品邊界。
- Nuxt route、layout、page、component 與 composable 的功能責任。
- 玩家看得到的畫面、欄位、狀態、操作、返回及跨頁資料交接。
- 目前 Mock／local state 與正式 API、CMS、WebSocket、支付及帳務的差異。
- 文件、原型、瀏覽器、SSG、部署與正式服務的分開驗收證據。

本書不取代後端 API 契約、營運後台規格、遊戲數學、正式支付規格或 Figma 視覺細節；這些內容只以依賴、參照或待確認事項方式連結。

### 1.2 來源優先順序

| 順序 | 來源 | 可確認的內容 | 使用限制 |
|---|---|---|---|
| 1 | 已確認產品決策與正式產品規則 | Web 目標行為、資格、限制、玩家語意 | 未確認內容不可寫成正式承諾 |
| 2 | 目前 Nuxt 原始碼 | 實際 route、page、layout、component、composable、Mock 行為 | 原型行為不等於正式規則 |
| 3 | API master／inventory／gap analysis | API 依賴、資料欄位候選、缺口與風險 | 不在 Web 規格中臆造後端契約 |
| 4 | Web handbook 與客服文件 | 對外規則、錯誤語意、客服處理原則 | 與產品規格衝突時需列待確認 |
| 5 | APP 規格書與 Plane APP 頁面 | 共同概念、跨平台差異、文件結構與檢查方法 | 不直接移植 APP 路由、畫面或平台限制 |
| 6 | 舊 handoff、歷史截圖與舊快照 | 變更溯源、歷史行為 | 必須標註日期，不能覆蓋目前程式證據 |

### 1.3 三種內容標記

每一章正文都要明確分開以下狀態：

| 標記 | 意義 |
|---|---|
| `已確認規則` | 已由產品、決策或正式文件確認的目標行為 |
| `目前 Web 原型` | 目前 Nuxt 可由原始碼驗證的行為或資料 |
| `待確認` | 需要產品、設計、後端、支付或營運補充的內容 |
| `依賴／邊界` | 本章需要引用但不由 Web 自行決定的內容 |
| `驗證證據` | 文件、測試、瀏覽器、SSG、部署或正式服務的實際結果 |

## 2. Web 規格書層級

### 2.1 總綱

`00-overview.md` 是 Web 規格書的總綱與索引，負責 00～02 類型的共用內容：

- Web 產品定位、讀者與適用範圍。
- 公開官網與登入後遊戲大廳的兩面結構。
- default layout、lobby layout、響應式斷點與共用導覽。
- 身份、錢包、獎勵、活動、通知及返回語意等共用名詞。
- SSG、GitHub Pages、baseURL、`.nojekyll`、`ClientOnly`、`Teleport` 與 hydration 約束。
- 文件章節索引、畫面索引、工作單索引與驗證狀態。

### 2.2 功能分冊

`WEB-SPEC-02`～`WEB-SPEC-11` 為 Web 功能分冊。每章保留 17 個編號節點，沿用 APP 17 節的內容責任；章名可依 Web 功能調整，但不可省略玩家、開發、QA、資料、驗收、待確認與交付等責任。若某項不適用，保留節次並說明理由，不刪除或補寫未確認內容。

功能分冊固定涵蓋以下 APP 17 節責任（Web 章名可依功能改寫）：

1. 這個功能是什麼
2. 這個功能不做什麼
3. 名詞說明
4. 畫面內容
5. 欄位說明
6. 狀態說明
7. 查詢、排序與分頁
8. 操作與跳轉
9. 頁面狀態
10. User Story — 玩家
11. User Story — 開發人員
12. User Story — QA 驗證者
13. 驗收標準
14. 這個功能需要的資料
15. 待確認事項
16. 版本沿革
17. 交付檢查表

Web 功能分冊不直接照搬 APP 的資料值、固定畫布、APP Overlay 行為、底部導覽數量、IAP 通道或 APP 專屬流程。

### 2.3 跨頁流程與整體交付

`WEB-SPEC-12`～`WEB-SPEC-13` 不強套單一功能的 17 節：

- `WEB-SPEC-12`：跨頁流程、route query、protected destination、資料保存、API／Mock 邊界、狀態交接與跨功能流程。
- `WEB-SPEC-13`：整體驗收、部署、handoff、玩家 User Story 與情境流程。若內容量需要，可拆成多個 Markdown 檔，但仍掛在同一張 `WEB-SPEC-13` 工作單下，不新增子單。

## 3. 預定文件與工作單對照

下表是 Web 規格書的文件骨架。`WEB-SPEC-01` 使用總綱；10 個功能分冊、跨頁整合與整體交付已完成目前階段初版，再由 HTML 產生器統一收錄。

| 文件單元 | 預定來源檔 | 主要內容 | Plane SPEC |
|---|---|---|---|
| Web 總綱與共用規則 | `00-overview.md`、本規則文件 | 產品範圍、共用架構、索引、驗證邊界 | `YOTAPLATFO-447` |
| 官網首頁、內容與公開頁 | `web-02-public-site.md` | 首頁、公開頁、CMS／SEO、共用內容元件 | `YOTAPLATFO-448` |
| 登入、註冊與年齡驗證 | `web-03-authentication.md` | LoginModal、Age Gate、法律文件、登入狀態 | `YOTAPLATFO-449` |
| 遊戲大廳與導覽 | `web-04-lobby-navigation.md` | lobby layout、Header、Sidebar、手機導覽、遊戲索引 | `YOTAPLATFO-450` |
| 遊戲進入、模式與返回 | `web-05-game-session.md` | Demo／Real、幣別選擇、遊戲視圖、返回與最近遊玩 | `YOTAPLATFO-451` |
| 個人資訊、VIP 與會員功能 | `web-06-member.md` | Profile、綁定、VIP、頭像、遊戲紀錄 | `YOTAPLATFO-452` |
| 錢包、銀行與交易 | `web-07-finance.md` | 儲值、錢包、保險箱、兌換、交易紀錄 | `YOTAPLATFO-453` |
| 獎勵卡、優惠碼與贈禮 | `web-08-rewards-promotions-gifts.md` | 獎勵卡、流水、優惠碼、贈禮狀態機 | `YOTAPLATFO-454` |
| 每日任務、活動、排行榜與教學 | `web-09-tasks-events-rankings-tutorial.md` | 簽到、補簽、活動、排行榜、教學 | `YOTAPLATFO-455` |
| 聊天、玩家互動與客服 | `web-10-social-support.md` | 世界頻道、私訊、好友、封鎖、檢舉、客服工單 | `YOTAPLATFO-456` |
| 信箱、通知與設定 | `web-11-inbox-settings.md` | 站內信、附件、未讀、語言、音效、登出 | `YOTAPLATFO-457` |
| 跨頁整合與流程 | `web-12-cross-page-integration.md` | FLOW、資料交接、API／Mock、保存與錯誤狀態 | `YOTAPLATFO-458` |
| 驗收、部署與玩家情境 | `web-13-acceptance-delivery.md` | AC、US／SC、文件、瀏覽器、SSG、部署與 handoff | `YOTAPLATFO-459` |

同一功能的設計與前端工作單使用相同尾碼：

- `YOTAPLATFO-447` ↔ `YOTAPLATFO-460` ↔ `YOTAPLATFO-473`
- `YOTAPLATFO-448` ↔ `YOTAPLATFO-461` ↔ `YOTAPLATFO-474`
- 依此類推至 `YOTAPLATFO-459` ↔ `YOTAPLATFO-472` ↔ `YOTAPLATFO-485`

## 4. 編號與追蹤原則

Plane 工作單識別碼與規格書內的流程識別碼分開管理：

| 類型 | Web 格式 | 用途 |
|---|---|---|
| 工作單來源鍵 | `WEB-SPEC-01`、`WEB-DESIGN-01`、`WEB-FE-01` | 對應既有 Plane 工作單 |
| 跨頁流程 | `WEB-FLOW-01` | 對應跨頁流程與交接 |
| 玩家故事 | `WEB-US-U-03-001` | 玩家視角故事；`U` 可改為 `D` 或 `Q` |
| 情境 | `WEB-SC-03-001` | 故事的主情境與分支 |
| 驗收 | `WEB-AC-03-001` | Web 專屬驗收條件 |
| 待確認 | `WEB-Q-03-001` | 產品、設計、後端或營運問題 |

不可直接重用 APP 的 `FLOW-*`、`US-*`、`SC-*`、`AC-*`，也不可把 Plane 的實際單號當成規格章節編號。

## 5. 章節維護規則

1. 功能規則只在對應 Web 功能分冊維護；總綱只保留摘要、共用規則與索引。
2. 跨頁行為同步更新 `WEB-SPEC-12` 的流程與資料交接；涉及玩家旅程時同步 `WEB-SPEC-13`。
3. 每章保留版本沿革；總綱只做跨章變更摘要。
4. 每個功能章開頭需列出三張對應工作單、APP 參考章節、路由、元件與目前驗證狀態。
5. 共用元件若同時服務公開頁與大廳，只建立一份規格責任；兩種入口的差異寫在同一章的入口與狀態表。
6. 目前原型有通過，不得寫成正式 API、帳務、WebSocket、CMS 或 Prod 已驗收。
7. 既有 `20-frontend.md` 在內容分冊完成前保留作為遷移來源；完成後可標註為技術附錄或歷史來源，不直接刪除。

## 6. 驗證邊界

| 驗證層級 | 可證明的事情 | 不可推論的事情 |
|---|---|---|
| Markdown／HTML 檢查 | 文件結構、連結、錨點、表格與引用完整 | 原型功能可操作 |
| focused tests／typecheck | 純函式、型別與指定程式路徑通過 | 正式 API 或跨服務流程通過 |
| Nuxt SSG generate | 靜態成品可產生 | GitHub Pages CDN、正式服務或帳務通過 |
| 瀏覽器桌機／手機操作 | 本機原型在指定環境的可操作性 | 正式資料、支付、WebSocket 或 Prod 狀態 |
| 部署／正式服務驗收 | 指定環境的實際交付結果 | 未測試的其他環境或未覆蓋情境 |

可重跑的文件檢查：

```bash
PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/validate-docs.mjs
```

此檢查涵蓋 10 份功能分冊的 APP 17 節結構、三方 Plane 映射、相對連結、3 父單＋39 子單逐筆 source_key、HTML 五分頁、Web 規格來源與 anchor／TOC 對應。2026-09-15 結果為 61 項通過、0 項失敗；不把文件通過推論為產品或正式服務通過。

## 7. 階段交付狀態

- [x] 確認沿用現有 `specs/spec-book/`，不建立平行 Web 規格書目錄。
- [x] 確認 Web 規格維持官網公開頁與登入後遊戲大廳同一本，但明確分成兩個產品表面。
- [x] 確認沿用目前 13 個 Web 工作單功能單元，不新增 APP 第 14、15 張對應子單。
- [x] 建立 Web 規格來源優先順序、狀態標記、章節骨架與工作單對照規則。
- [x] 將 `20-frontend.md` 的功能範圍拆成 10 份 Web 功能分冊初版。
- [x] 建立跨頁流程、玩家情境與整體驗收正文初版。
- [x] 更新 HTML 產生器與完整索引初版。
- [x] 建立並通過可重跑的 Markdown／Plane 映射／HTML／anchor／link 文件檢查。
- [ ] 回填 `WEB_WORK_ORDER_BATCH_v1.md` 的實際章節位置與證據。
- [ ] 將確認後的規格摘要同步至 Plane 頁面。
