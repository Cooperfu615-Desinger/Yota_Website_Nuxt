# WEB SPEC 11｜信箱、通知與設定

> 文件狀態：Phase 2 初版，已依目前 Nuxt 原型整理；通知服務、偏好同步與帳戶安全仍待正式化。
> 工作單映射：`YOTAPLATFO-457`（SPEC）／`YOTAPLATFO-470`（Figma）／`YOTAPLATFO-483`（WEB／Nuxt）
> APP 參考：APP 12「信箱、通知與設定」；Web 以 `/lobby/inbox` 與 `/lobby/settings` 的目前實作為基準。

## 0. 文件狀態與範圍

本分冊涵蓋登入後信箱、系統／營運／帳務訊息、信件附件領取、信件刪除、音樂與音效、語言選擇、黑名單管理、法律文件入口與登出確認。推播、跨裝置同步、批次讀取與服務端通知尚未完成，需與客服、獎勵、財務及帳戶規格協同定義。

## 1. 產品目標與使用情境

- 玩家能集中查看平台公告、活動訊息、帳務結果與可領取附件。
- 玩家能安全領取一次性附件，並在錢包／交易紀錄讀回結果。
- 玩家能調整音樂、音效、主題與語言流程，管理黑名單並查看條款。
- 玩家登出前能看懂會離開目前帳戶並返回官網首頁；未登入不可直接取得私人信件。

## 2. 入口、路由與權限

| 功能 | 路由 | 未登入行為 | 目前來源 |
|---|---|---|---|
| 信箱 | `/lobby/inbox` | 顯示登入／註冊入口並保留目的地 | `pages/lobby/inbox.vue` |
| 設定 | `/lobby/settings` | 由 lobby layout 的登入邏輯保護 | `pages/lobby/settings.vue` |
| 條款／隱私／服務規範 | Modal | 開啟法律文件 Modal | `useLegalState.ts`、`LegalModal.vue` |
| 登出 | Modal | 只對目前登入帳號可用 | `useLogoutState.ts`、`LogoutConfirmModal.vue` |

信箱與設定均使用 `layout: 'lobby'`；AppBottomNav、Header 與側邊導覽的入口狀態需在 `web-04-lobby-navigation.md` 統一維護。

## 3. 信箱列表與分類

目前信箱提供「營運公告」與「系統通知」兩個篩選；`system` 與 `deposit` 會歸在系統通知，`event` 歸在營運公告。每筆信件顯示已讀點、類型、時間、標題、預覽與附件標籤。

目前 `InboxMessage` 類型為 `system | event | deposit`，種子資料包含活動公告、排行榜活動、儲值到帳確認與維護公告。正式版需補分頁／游標、排序、服務端未讀數、通知保留期限與多語內容。

## 4. 閱讀、已讀與刪除流程

1. 玩家切換分類並從列表選取信件。
2. 開啟時呼叫 `markRead`，右側／手機詳情顯示完整內容。
3. 若有附件，顯示附件幣別、數量、領取說明與一次性按鈕。
4. 玩家可刪除目前信件；刪除後關閉詳情並顯示結果提示。
5. 返回列表時保留目前分類，不應因讀取信件重置整個列表視圖。

目前沒有批次全讀、批次刪除、封存、搜尋、釘選、撤回或跨裝置已讀同步；這些需由產品決策後再加到工作單／API。

## 5. 信件附件與獎勵領取

附件目前支援 `gold`／`silver`／`bronze` 錢包獎勵；領取成功後呼叫 `addWalletReward`，並將 `claimed` 設為 `true`，按鈕改為已領取。重複點擊或已領附件不得再次入帳。

正式版的領取結果必須由服務端原子性消費，回傳獎勵交易 ID、實際入帳錢包、失敗原因與可重試狀態。附件可能過期、被撤回、受會員資格限制或需要從獎勵卡／活動服務取得，這些目前尚未在 Web Mock 建模。

## 6. 信箱狀態與錯誤

需覆蓋登入要求、載入中、空信箱、分類無資料、信件已讀／未讀、附件可領／已領、領取中、領取失敗、信件不存在、已刪除與服務中斷。手機版詳情以 overlay 呈現，關閉後回到列表。

目前 `runMock` 會等待約 700ms 模擬領取，這是原型互動，不是服務端延遲或 SLA。正式訊息必須避免把 `setTimeout` 結果當成付款／獎勵完成證據。

## 7. 設定資訊架構

設定頁目前分四區：

1. 音樂與音效：背景音樂開關、操作音效試聽與開關。
2. 語言：繁體中文、English、日本語三個選項；目前只對齊選擇流程，文案仍為繁體中文。
3. 黑名單管理：顯示封鎖玩家、玩家識別與解除封鎖。
4. 條款與帳號：會員條款、隱私政策、平台服務規範與登出。

主題目前由偏好狀態保存並套用 `document.documentElement.dataset.theme`；若正式提供深／淺色主題，需另補完整 token 與可讀性驗證。

## 8. 偏好狀態與保存

`usePreferencesState.ts` 提供 `musicEnabled`、`soundEnabled`、`theme`、`language`、`pushEnabled`。目前 localStorage key 為 `jh_preferences`，保存音樂、音效、主題、語言；`pushEnabled` 目前只在 state 中存在，未納入持久化。

初始化只在 client 端讀取 localStorage，並在設定變更後更新 DOM／localStorage。正式版需決定偏好是否與會員帳戶同步、未登入是否保存、跨裝置優先序與伺服器失敗回退。

## 9. 黑名單管理流程

玩家從聊天玩家卡加入黑名單後，設定頁可看到清單、頭像、名稱、玩家識別與「解除封鎖」操作。解除後顯示提示；目前關係只保存在本次瀏覽 session，且與 `useSocialState.ts` 共用。

正式版需定義封鎖對世界頻道、私人訊息、玩家資料、贈禮、轉帳與檢舉的影響，並在服務端同步黑名單，避免設定頁與聊天頁狀態分裂。

## 10. 法律文件、帳戶與登出

條款、隱私與服務規範從設定頁開啟共用 Legal Modal；內容需與登入／AgeGate 的同意流程一致。登出按鈕開啟確認 Modal，確認後清除登入狀態與受保護頁面資料，返回官網首頁。

正式版需補登入 token／refresh token 撤銷、其他裝置 session、登出失敗、未保存流程、法律版本與同意紀錄。不能只把前端 `isLoggedIn` 設為 false 就視為安全登出。

## 11. 通知、未讀與跨功能關聯

信箱附件可能來自活動、儲值、任務、獎勵卡或客服結果；每封信需能追溯來源事件與交易。Header／AppBottomNav 若顯示未讀 badge，需以信箱服務端未讀總數為準，不能只以當前分類列表計算。

目前沒有推播實作、未讀總數 composable、批次讀取、通知設定的服務端同步或 Web Push 權限流程；`pushEnabled` 僅為預留欄位，規格暫不宣稱已提供推播。

## 12. API、資料保存與目前缺口

目前信箱與設定都是 local／Mock 狀態：`useMailboxState.ts` 以 `useState` 種子信件，`usePreferencesState.ts` 只以瀏覽器 localStorage 保存部分偏好。API inventory 顯示尚未接實際 `$fetch`。

正式化需補信件列表／詳情／已讀／刪除／附件領取、未讀彙總、通知偏好、黑名單 CRUD、法律版本與登出 session API；並定義資料保留、裝置同步、撤銷、重試、稽核與個資刪除邊界。

## 13. Figma 交付內容

Figma 需交付信箱桌面雙欄與手機列表／詳情 overlay、分類切換、未讀／已讀、附件可領／已領／失敗、空狀態與刪除提示；設定需交付四個區塊、開關、試聽、語言選擇、黑名單空／有資料、Legal Modal、登出確認與錯誤狀態。

所有設定操作需提供鍵盤／螢幕閱讀器語意、清楚的 switch 狀態與 aria 文案；附件領取與登出等不可逆或資產相關操作需有確認／結果回饋。

## 14. Nuxt 實作邊界

主要來源為 `pages/lobby/inbox.vue`、`components/lobby/MailboxContent.vue`、`pages/lobby/settings.vue`、`composables/useMailboxState.ts`、`composables/usePreferencesState.ts`。涉及 Legal、Logout、Audio、Social 的共用狀態需沿用既有 composable，不在頁面另建平行真相。

localStorage、document theme、音訊與 Modal 都必須在 client 安全初始化；含 Teleport 的 Modal 遵守 `ClientOnly`。SSG 產出的公開 HTML 不得嵌入會員私人信件或未驗證餘額。

## 15. 驗收條件與驗證證據

| ID | 驗收條件 |
|---|---|
| `WEB-AC-11-01` | 未登入進入信箱會要求登入並保留目的地；登入後可看到分類與信件列表。 |
| `WEB-AC-11-02` | 開信會標記已讀；附件只能領取一次，成功後錢包／交易結果可讀回。 |
| `WEB-AC-11-03` | 信箱支援營運／系統篩選、詳情、手機 overlay、刪除與空狀態。 |
| `WEB-AC-11-04` | 音樂／音效／主題／語言操作有正確 switch／選擇狀態與保存提示。 |
| `WEB-AC-11-05` | 黑名單可由聊天加入並在設定解除，法律文件與登出確認可開啟。 |
| `WEB-Q-11-01` | 推播、未讀彙總、批次操作、跨裝置同步與正式登出 session 契約需補齊。 |

## 16. 開放問題與參照來源

待確認：信件保留與刪除是否為軟刪除；附件有效期與撤回；帳務信件是否可直接領取；推播是否採 Web Push 或僅導向 APP；偏好與黑名單是否需要帳戶同步；語言切換何時正式翻譯；法律文件版本與同意紀錄如何稽核。

參照：`pages/lobby/inbox.vue`、`components/lobby/MailboxContent.vue`、`pages/lobby/settings.vue`、`composables/useMailboxState.ts`、`composables/usePreferencesState.ts`、`composables/useSocialState.ts`、`composables/useLegalState.ts`、`composables/useLogoutState.ts`、`specs/2026-07-29-api-inventory.md`、`specs/2026-07-29-api-gap-analysis.md`。
