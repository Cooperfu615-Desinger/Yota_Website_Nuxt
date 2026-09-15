# WEB-SPEC-04｜遊戲大廳與導覽

巨亨ONLINE Web 規格書｜Phase 2 功能分冊初版｜2026-09-15

| 文件項目 | 內容 |
|---|---|
| 文件性質 | Web 前台功能規格；本章為分冊初版，瀏覽器與正式服務驗收未執行 |
| Plane 規格單 | `YOTAPLATFO-450` |
| Plane Figma 單 | `YOTAPLATFO-463` |
| Plane Nuxt 單 | `YOTAPLATFO-476` |
| APP 參考 | APP 第 04 章：遊戲大廳；Web 採 route／layout 平台差異 |
| 目前來源 | `20-frontend.md` §2～§3、`layouts/lobby.vue`、`components/LobbyHeader.vue`、`components/LobbySidebar.vue`、`components/AppBottomNav.vue`、`components/lobby/*` |
| 適用範圍 | `/lobby` 主入口、桌機側欄、手機導覽、Header、遊戲分類與大廳頁面入口 |
| 目前狀態 | lobby layout 與多數 route 已存在；遊戲 catalog、登入權限與正式資料仍是 Mock／前端狀態 |

## 1. 這個功能是什麼

讓玩家在登入後的 Web 遊戲大廳查看遊戲分類與入口，並從桌機側欄、手機底部導覽與 Header 前往任務、活動、財務、會員、信箱、聊天、客服與設定。Web 大廳是換頁式 route／layout，不直接照搬 APP 的 Overlay 架構。

## 2. 這個功能不做什麼

| 不在本章範圍 | 負責位置 |
|---|---|
| 遊戲幣別選擇、正式啟動 URL 與遊戲室 | `web-05-game-session.md` |
| 會員資料、VIP 與遊戲紀錄 | `web-06-member.md` |
| 儲值、錢包、保險箱與交易 | `web-07-finance.md` |
| Figma 元件與精細響應式數值 | `YOTAPLATFO-463` |
| 後端 catalog、玩家權限與即時遊戲狀態契約 | 後端 API／遊戲服務 |

## 3. 名詞說明

| 名詞 | 定義 |
|---|---|
| lobby layout | `layouts/lobby.vue`，包含 LobbyHeader、Sidebar、頁腳、Web館按鈕與 ClientOnly Modal |
| 大廳主頁 | `/lobby`，顯示遊戲首頁／分類與遊戲卡 |
| 公開官網 | default layout 下的 `/`、`/events` 等公開路由 |
| 桌機側欄 | `LobbySidebar.vue`，可常駐或收合 |
| 手機導覽 | `AppBottomNav.vue`，依路由顯示大廳／官網入口 |
| Web館 | 大廳內開啟 `/h5` 的浮動按鈕；目前為預覽圖頁面 |

## 4. 畫面內容

| 區塊 | 內容 | 目前實作 |
|---|---|---|
| LobbyHeader | Logo、漢堡、登入／註冊或玩家摘要、VIP、餘額、頭像 | `LobbyHeader.vue` |
| LobbySidebar | 遊戲大廳、任務活動、儲值、個人與財務、信箱、聊天、設定、教學、客服 | `LobbySidebar.vue` |
| 手機底部導覽 | 選單、儲值、進入遊戲、信箱、聊天等入口 | `AppBottomNav.vue` |
| 大廳主內容 | Hero／遊戲首頁、分類、遊戲列、搜尋／篩選 | `GameHome.vue`、`GameGrid.vue`、`GameCategoryView.vue` |
| 未登入導引 | 置中登入／註冊卡片與目的地保存 | 多數 lobby page |
| Web館按鈕 | 可拖曳浮動按鈕，開啟 `/h5` | `layouts/lobby.vue` |

## 5. 欄位說明

| 欄位／項目 | 顯示與限制 |
|---|---|
| 路由 | `/lobby` 與 `/lobby/*`；舊 alias 是否保留由跨頁章確認 |
| 導覽 label | 首頁、遊戲大廳、每日任務、活動、排行榜、儲值、個人資訊、保險箱／贈禮、信箱、聊天、兌換、交易紀錄、設置、教學、客服 |
| 玩家摘要 | 名稱、VIP、餘額、頭像；未登入顯示登入／註冊 |
| 遊戲分類 | 目前 `slots`、`baccarat`、`fish`、`dice`、`cards`，仍屬 catalog 候選值 |
| active route | 依 `route.path` 判定；銀行含 `/lobby/deposit` alias 邏輯 |
| query | 遊戲、模式、tab、channel、receiverId 等交由功能章維護 |

## 6. 狀態說明

| 狀態 | 目前行為 | 正式注意事項 |
|---|---|---|
| 未登入 | 受保護頁顯示導引卡或開啟登入 | 需明確每頁是否可公開閱讀 |
| 已登入 | 顯示玩家摘要與受保護內容 | 正式身份由 token／server profile 提供 |
| 側欄展開 | 桌機完整側欄；手機 overlay | 狀態使用 `useState` 跨元件共享 |
| 側欄收合 | 桌機 icon-only 或手機關閉 | 需保留鍵盤與可及性操作 |
| route active | 依目前 path 顯示 active | query tab 的 active 規則需一致 |
| Web館開啟中 | `AgeGate` 通過後另開 `/h5` | 正式遊戲頁與預覽頁的關係待確認 |

## 7. 查詢、排序與分頁

- 導覽本身沒有查詢、排序與分頁。
- 遊戲分類與搜尋由 `useGameFilter`、`GameFilterBar`、`GameCategoryView` 等功能處理，詳細規則在 `web-05`。
- 側欄不應因玩家資料尚未載入而產生錯誤 route；若功能權限由後端控制，需定義隱藏、停用或導引行為。

## 8. 操作與跳轉

| 操作 | 目前結果 | 正式要求／待確認 |
|---|---|---|
| 點擊 Logo | 回 `/lobby` | 是否保留 query、正在進行的遊戲與未送出表單 |
| 點擊側欄項目 | 導向對應 `/lobby/*` | 需定義未登入、權限不足與未保存資料提示 |
| 點擊手機選單 | 開／關 sidebar 或導向功能 | 不得因 Teleport hydration 造成全站失效 |
| 點擊玩家摘要 | 導向 `/lobby/member` | 正式是否需要 profile loading 與權限檢查 |
| 點擊遊戲大廳 | 回 `/lobby` | 遊戲卡操作由 `web-05` 維護 |
| 點擊 Web館 | Age Gate 後另開 `/h5` | 正式 Web 遊戲入口、target 與 session 待確認 |
| 登出 | 由 sidebar／設定觸發 | 清理 token、私有 state、返回公開頁的規則待確認 |

## 9. 頁面狀態

需涵蓋 layout 初始、玩家資料 loading、未登入、登入失敗、玩家資料失敗、側欄展開／收合、沒有可用遊戲、遊戲 catalog 失敗、路由不存在、權限不足、頁面返回與小螢幕溢位。現有原型主要覆蓋成功畫面與部分未登入導引。

## 10. User Story — 玩家

| 編號 | User Story |
|---|---|
| `WEB-US-U-04-001` | 身為玩家，我要從大廳看到清楚的遊戲與功能導覽，以便快速找到想使用的功能。 |
| `WEB-US-U-04-002` | 身為手機玩家，我要使用底部導覽或側邊抽屜切換功能，以便在小螢幕上完成導航。 |
| `WEB-US-U-04-003` | 身為未登入玩家，我要看到登入／註冊導引，而不是無法理解的空白頁。 |

## 11. User Story — 開發人員

| 編號 | User Story |
|---|---|
| `WEB-US-D-04-001` | 身為開發人員，我要讓 default layout 與 lobby layout 的責任清楚，以便不把公開頁與大廳狀態混在一起。 |
| `WEB-US-D-04-002` | 身為開發人員，我要用 `useState` 管理跨元件導覽狀態，以便 Header、Sidebar 與手機導覽保持一致。 |
| `WEB-US-D-04-003` | 身為開發人員，我要讓 route active、query alias 與 protected destination 有單一規則，以便深連結與返回不失效。 |

## 12. User Story — QA 驗證者

| 編號 | User Story |
|---|---|
| `WEB-US-Q-04-001` | 身為 QA，我要在桌機與手機逐一檢查所有導覽入口，以便找出死連結與錯誤 active 狀態。 |
| `WEB-US-Q-04-002` | 身為 QA，我要驗證 Sidebar、Header、BottomNav 與 Modal 同時存在時的互動，以便避免 overlay 互相遮蔽。 |
| `WEB-US-Q-04-003` | 身為 QA，我要區分未登入導引、route 可到達與正式權限驗證，以便不誤判原型狀態。 |

## 13. 驗收標準

| 編號 | 主題 | 驗收標準 |
|---|---|---|
| `WEB-AC-04-001` | Layout | 所有 `/lobby/*` 頁面使用 lobby layout；公開路由不意外帶入大廳私有狀態。 |
| `WEB-AC-04-002` | 導覽 | 桌機側欄、手機導覽與 Header 的入口、active、返回與未登入行為一致。 |
| `WEB-AC-04-003` | 響應式 | 桌機、手機與側欄收合狀態不造成內容溢位或無法操作。 |
| `WEB-AC-04-004` | SSG／Modal | layout 中的 ClientOnly、Teleport 與 useState 使用符合專案 SSG 約束。 |
| `WEB-AC-04-005` | 路由 | 大廳 route、query alias、Web館與登入導流的實際結果與規格相符。 |

## 14. 這個功能需要的資料

- 導覽節點、label、icon、route、active 規則與登入要求。
- 玩家摘要與登入狀態；正式資料不可由 localStorage 假旗標取代。
- 遊戲 catalog 摘要與功能可用性；詳細資料由 `web-05` 維護。
- layout／sidebar 的視窗尺寸、展開狀態與可及性設定。
- 登入後返回位置、登出後公開入口與 Web館目標資訊。

## 15. 待確認事項

| 編號 | 問題 | 影響 | 負責確認 |
|---|---|---|---|
| `WEB-Q-04-001` | Web 官網與遊戲大廳是否維持兩種 layout 與兩套入口？ | IA、Figma、route 與狀態 | 產品／設計 |
| `WEB-Q-04-002` | 手機 BottomNav 最終項目與桌機 Sidebar 是否完全同構？ | 導覽與響應式設計 | 產品／設計 |
| `WEB-Q-04-003` | Web館 `/h5` 是預覽頁、正式遊戲入口或淘汰項目？ | Web館按鈕、Age Gate、遊戲 session | 產品／前端 |
| `WEB-Q-04-004` | route alias 與舊連結的保留期限為何？ | SEO、deep link、redirect | 產品／前端 |

## 16. 版本沿革

| 版本 | 日期 | 內容 |
|---|---|---|
| v0.1 | 2026-09-15 | 依目前 Nuxt layout、route、Header、Sidebar、BottomNav 與 Web館行為建立 17 節分冊初版。 |

## 17. 交付檢查表

- [ ] 已確認公開官網與登入後大廳的 layout、導覽與權限邊界。
- [ ] 已確認桌機／手機導覽項目、active 與 query alias。
- [ ] 已補導覽 loading、空態、錯誤、權限與返回設計。
- [ ] 已補 `WEB-FLOW`、`WEB-SC` 與 route／畫面索引交叉引用。
- [ ] 已完成瀏覽器響應式、SSG hydration 與正式身份服務的分層驗證紀錄。
