# WEB-SPEC-05｜遊戲進入、模式與返回

巨亨ONLINE Web 規格書｜Phase 2 功能分冊初版｜2026-09-15

| 文件項目 | 內容 |
|---|---|
| 文件性質 | Web 前台功能規格；目前遊戲服務為佔位／Mock，正式遊戲驗收未執行 |
| Plane 規格單 | `YOTAPLATFO-451` |
| Plane Figma 單 | `YOTAPLATFO-464` |
| Plane Nuxt 單 | `YOTAPLATFO-477` |
| APP 參考 | APP 第 05 章：遊戲進入與離開 |
| 目前來源 | `20-frontend.md` §3、`pages/lobby/index.vue`、`components/lobby/GameCard.vue`、`GameLaunchModal.vue`、`GameView.vue`、`utils/gameWallets.ts` |
| 適用範圍 | 遊戲卡操作、試玩／正式模式、幣別選擇、遊戲視圖、返回與最近遊玩 |
| 目前狀態 | Demo／Real 的前端流程已存在；遊戲 iframe、launch token、正式餘額與機台服務尚未完成 |

## 1. 這個功能是什麼

讓玩家從 Web 大廳選擇遊戲，先決定試玩或正式模式；正式模式再選擇遊戲使用的錢包，之後進入遊戲視圖，並能返回大廳。登入、年齡驗證、錢包資格與正式遊戲服務是相鄰依賴，不在前端自行假定完成。

目前 `/lobby` 由 `pages/lobby/index.vue` 管理 `currentGameKey`、`currentGameMode`、`currentGameWallet` 與 launch modal 狀態。`GameView.vue` 的 iframe URL 目前是 `example.com` 佔位。

## 2. 這個功能不做什麼

| 不在本章範圍 | 負責位置 |
|---|---|
| 遊戲 catalog 與大廳導覽的完整責任 | `web-04-lobby-navigation.md` |
| 登入、註冊與年齡法遵政策 | `web-03-authentication.md` |
| 錢包餘額、交易入帳與支付 | `web-07-finance.md` |
| 有效流水、獎勵卡資格與活動獎勵 | `web-08-rewards-promotions-gifts.md`、`web-09-*` |
| 遊戲供應商、機台、launch token 與正式結算契約 | 遊戲／後端服務 |
| 遊戲畫面本身的視覺設計 | `YOTAPLATFO-464` 與供應商交付 |

## 3. 名詞說明

| 名詞 | 定義 |
|---|---|
| Demo | 不使用玩家正式資產的試玩模式；目前可由未登入玩家進入 |
| Real | 需要玩家身份與正式遊戲資格的模式 |
| GameWalletKey | `stored-gold`、`activity-gold`、`stored-silver`、`activity-silver`、`bronze` |
| GameLaunchModal | 正式模式進入前選擇遊戲錢包的 Modal |
| GameView | 顯示遊戲 iframe、控制列與遊戲資訊的頁面區塊 |
| machine／seat | 遊戲機台或座位資訊；目前 `SeatSelectionModal.vue` 沒有被實際引用 |
| launch token | 正式服務用的一次性啟動資訊；目前尚未實作 |

## 4. 畫面內容

| 畫面／區塊 | 內容 | 主要元件 |
|---|---|---|
| 遊戲卡 | 名稱、描述、分類、供應商、badge、試玩／正式入口 | `GameCard.vue` |
| 啟動 Modal | 遊戲摘要、錢包選擇、關閉與進入 | `GameLaunchModal.vue` |
| 遊戲視圖 | iframe 佔位、模式切換、關閉、遊戲資訊與規格表 | `GameView.vue` |
| 返回大廳 | 關閉遊戲視圖、清除啟動狀態 | `pages/lobby/index.vue` |
| 機台／座位 | 目前只有孤立元件與未接入資料 | `SeatSelectionModal.vue` |

## 5. 欄位說明

| 欄位 | 目前內容／限制 | 正式注意事項 |
|---|---|---|
| `gameKey` | 遊戲唯一 key；目前由 catalog 取得 | 不應只保存中文遊戲名稱 |
| `mode` | `demo` 或 `real` | 正式服務需有明確身份與資格檢查 |
| `wallet` | 五種 `GameWalletKey`；預設 `stored-gold` | 後端 Wallet 模型需有轉換層 |
| `provider` | 遊戲供應商名稱 | 正式 catalog／launch service 提供 |
| `rtp`／規格 | 目前顯示於遊戲資訊 | 不等同正式遊戲數學或營運承諾 |
| `iframe URL` | 目前為 `example.com` 佔位 | 正式需一次性 URL、token、origin 與失敗處理 |
| `machineId` | `GameView` 有 prop，但目前沒有實際傳入 | 是否選機台／座位需產品確認 |

## 6. 狀態說明

| 狀態 | 目前行為 | 正式規格要求 |
|---|---|---|
| `catalog ready` | 顯示遊戲卡 | 正式 catalog 需含可用性與維護狀態 |
| `demo selected` | 直接顯示 GameView | 是否需 Age Gate 依產品／法遵確認 |
| `real unauthenticated` | 開啟登入並保存遊戲參數 | 登入成功後不可重複啟動或遺失參數 |
| `launch pending` | 顯示錢包選擇 Modal | 需載入餘額、資格與遊戲可用性 |
| `launching` | 目前沒有正式 loading service | 需處理 timeout、重試與取消 |
| `in game` | 顯示 iframe 佔位 | 需定義啟動成功、載入失敗與回傳事件 |
| `closed` | 清除 current game 與 launch 狀態 | 需保存必要的最近遊玩與結算交接 |

## 7. 查詢、排序與分頁

- 遊戲分類、搜尋、排序與目前頁面大小由大廳相關元件處理，本章只引用其結果。
- `GameBrowser`／`GameCategoryView` 目前支援分類、關鍵字與排序候選；正式 catalog 量大時可能改由 server 查詢。
- 遊戲進入本身沒有分頁，但正式遊戲清單、機台清單與最近遊玩可能需要 cursor／page。
- 遊戲可用性、維護、VIP 限制與餘額不足不可由前端篩選結果推論，需正式服務回應。

## 8. 操作與跳轉

| 操作 | 前提 | 目前結果 | 正式待確認 |
|---|---|---|---|
| 點擊試玩 | 遊戲卡存在 | 直接進入 Demo GameView | 是否需年齡確認或服務 token |
| 點擊正式遊玩 | 未登入／已登入 | 未登入開 Login；已登入開 launch modal | 年齡、VIP、餘額與遊戲資格 |
| 選擇錢包 | launch modal 開啟 | 設定 current game wallet | 是否顯示餘額、不可用原因與排序 |
| 開始正式遊戲 | 已選 wallet | 顯示 iframe 佔位 | launch token、冪等與啟動失敗 |
| 切換 Demo／Real | GameView 開啟 | Demo 可切換；Real 需重新走登入／launch | 是否允許遊戲中切換模式 |
| 關閉遊戲 | GameView 開啟 | 清除遊戲與 launch 狀態 | 結算、未完成局、離開確認與最近遊玩 |
| 選機台／座位 | 目前未由 UI 觸發 | 無實際流程 | 是否納入 Web 正式範圍 |

## 9. 頁面狀態

需定義遊戲 catalog loading、無遊戲、遊戲不存在、遊戲維護、未登入、年齡未確認、錢包餘額不足、錢包不可用、launch timeout、iframe 失敗、玩家取消、遊戲中返回、結算中與重複點擊。現有原型主要覆蓋 Demo／Real 入口與 iframe 佔位，未覆蓋正式服務錯誤。

## 10. User Story — 玩家

| 編號 | User Story |
|---|---|
| `WEB-US-U-05-001` | 身為玩家，我要先試玩遊戲，以便在不使用正式資產的情況下了解遊戲。 |
| `WEB-US-U-05-002` | 身為已登入玩家，我要選擇遊戲使用的錢包後進入正式遊戲，以便使用正確資產。 |
| `WEB-US-U-05-003` | 身為遊戲中的玩家，我要能安全返回大廳，以便繼續選擇其他功能。 |

## 11. User Story — 開發人員

| 編號 | User Story |
|---|---|
| `WEB-US-D-05-001` | 身為開發人員，我要把遊戲 key、模式、錢包與 launch 狀態分開，以便後續串接正式服務。 |
| `WEB-US-D-05-002` | 身為開發人員，我要透過後端回應判斷遊戲可用性與餘額資格，以便前端不自行假定可進入。 |
| `WEB-US-D-05-003` | 身為開發人員，我要讓遊戲返回、query 清理與最近遊玩保存有明確邊界，以便不重複啟動遊戲。 |

## 12. User Story — QA 驗證者

| 編號 | User Story |
|---|---|
| `WEB-US-Q-05-001` | 身為 QA，我要分別測試 Demo、未登入 Real、已登入 Real、取消與返回，以便確認狀態轉換。 |
| `WEB-US-Q-05-002` | 身為 QA，我要檢查五種錢包的顯示、不可用與錯誤狀態，以便避免玩家誤用資產。 |
| `WEB-US-Q-05-003` | 身為 QA，我要分開記錄 iframe 佔位成功與正式遊戲服務成功，以便驗收結果可追溯。 |

## 13. 驗收標準

| 編號 | 主題 | 驗收標準 |
|---|---|---|
| `WEB-AC-05-001` | 模式分流 | Demo 不誤用正式資產；Real 未登入時導向登入並保留必要目的地。 |
| `WEB-AC-05-002` | 錢包選擇 | 正式遊戲的錢包選擇、預設、不可用、餘額與資格訊息有明確規格。 |
| `WEB-AC-05-003` | 啟動 | launch loading、成功、取消、timeout、失敗與重複送出有可觀察結果。 |
| `WEB-AC-05-004` | 返回 | 關閉遊戲後回到正確大廳狀態，query、launch 狀態與最近遊玩不錯亂。 |
| `WEB-AC-05-005` | 機台／座位 | `SeatSelectionModal.vue` 是否正式納入已有產品決策；未確認前不可列為完成。 |

## 14. 這個功能需要的資料

- Game catalog、遊戲 key、provider、分類、badge、可用性與維護狀態。
- Demo／Real 模式、玩家身份、年齡確認、VIP 與遊戲進場資格。
- 五種遊戲錢包、餘額、獎勵卡限制與正式遊戲啟動參數。
- launch token／一次性 URL、session、origin、錯誤碼與遊戲回傳事件。
- 最近遊玩記錄、遊戲局／結算關聯與必要的離開狀態。

## 15. 待確認事項

| 編號 | 問題 | 影響 | 負責確認 |
|---|---|---|---|
| `WEB-Q-05-001` | 正式遊戲是否需要一次性 launch token 或 session URL？ | API、iframe 安全與啟動流程 | 後端／遊戲服務 |
| `WEB-Q-05-002` | 進入遊戲前是否檢查餘額、VIP、活動卡與年齡？ | launch modal、錯誤狀態與法遵 | 產品／後端 |
| `WEB-Q-05-003` | `SeatSelectionModal.vue` 是否納入正式 Web 流程？ | route、資料模型、Figma 與 API | 產品／設計 |
| `WEB-Q-05-004` | 遊戲中離開、未完成局與結算事件如何保存？ | financial record、recent games 與返回 | 遊戲／後端 |

## 16. 版本沿革

| 版本 | 日期 | 內容 |
|---|---|---|
| v0.1 | 2026-09-15 | 依目前 GameCard、GameLaunchModal、GameView 與 game wallet 行為建立 17 節分冊初版；正式遊戲服務未驗收。 |

## 17. 交付檢查表

- [ ] 已確認 Demo／Real、Age Gate、登入與正式遊戲資格的範圍。
- [ ] 已確認 launch token、iframe、機台／座位與返回／結算契約。
- [ ] 已補遊戲啟動與返回的桌機／手機狀態設計。
- [ ] 已補 `WEB-FLOW`、`WEB-SC` 與遊戲畫面索引交叉引用。
- [ ] 已完成原型、瀏覽器、SSG 與正式遊戲服務的分層驗證紀錄。
