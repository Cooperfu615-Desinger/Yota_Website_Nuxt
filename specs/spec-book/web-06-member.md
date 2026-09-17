# WEB-SPEC-06｜個人資訊、VIP 與會員功能

巨亨ONLINE Web 規格書｜Phase 2 功能分冊初版｜2026-09-15

| 文件項目 | 內容 |
|---|---|
| 文件性質 | Web 前台功能規格；會員資料與 VIP 正式 API 尚未驗收 |
| Plane 規格單 | `YOTAPLATFO-452` |
| Plane Figma 單 | `YOTAPLATFO-465` |
| Plane Nuxt 單 | `YOTAPLATFO-478` |
| APP 參考 | APP 第 06 章：個人資訊與會員功能 |
| 目前來源 | `20-frontend.md` §9、`pages/lobby/member.vue`、`MemberProfileView.vue`、`MemberProfileModal.vue`、`useMemberProfileState.ts`、`GameRecords.vue` |
| 適用範圍 | 個人資料、帳號綁定、VIP、頭像、遊戲紀錄與會員入口 |
| 目前狀態 | Profile、綁定、VIP 顯示與紀錄畫面存在；資料多為 local state／Mock，正式安全規則仍需補齊 |

## 1. 這個功能是什麼

讓已登入玩家查看與管理自己的身份資料、帳號綁定、VIP 資訊、頭像與遊戲紀錄，並從大廳 Header 或導覽進入會員頁。會員頁只處理自己的資料，不等同於聊天中的其他玩家公開資料卡。

目前 `/lobby/member` 使用 `MemberProfileView.vue`；`MemberTab` 類型包含 `profile`、`bindings`、`history`、`vip`、`rewards`。獎勵卡的詳細規則由 `web-08` 維護，會員頁只負責入口與頁籤交接。

## 2. 這個功能不做什麼

| 不在本章範圍 | 負責位置 |
|---|---|
| 登入、token、忘記密碼與年齡驗證 | `web-03-authentication.md` |
| 玩家間公開資料卡、好友、封鎖與檢舉 | `web-10-social-support.md` |
| 錢包餘額、儲值與交易 | `web-07-finance.md` |
| 獎勵卡、優惠碼與贈禮規則 | `web-08-rewards-promotions-gifts.md` |
| VIP 後台配置、排程與正式等級決策 | VIP／營運後台規格 |

## 3. 名詞說明

| 名詞 | 定義 |
|---|---|
| 個人資料 | 玩家自己的暱稱、Email、生日、簡介等可編輯欄位 |
| 帳號綁定 | 手機、FB、LINE、Apple、Google 等身份 provider 的綁定狀態 |
| VIP | 玩家等級、升級門檻、權益與保級資訊 |
| 遊戲紀錄 | 玩家自己的遊戲時間、遊戲、投注、贏分與餘額等歷史資料 |
| 公開玩家卡 | 聊天與社交功能中查看其他玩家的有限資料，不由本章維護 |
| 會員入口 | `/lobby/member`、Header 玩家卡與未登入導引 |

## 4. 畫面內容

| 頁籤／區塊 | 內容 | 目前元件 |
|---|---|---|
| 個人資料 | 頭像、帳號、暱稱、Email、生日、簡介、身份摘要 | `MemberProfileView.vue` |
| 帳號綁定 | provider 綁定／解綁狀態與操作 | `MemberProfileView.vue`、`useAppState.ts` |
| VIP | 等級、稱號、升級／保級文案與進度 | `MemberProfileView.vue`、`siteContent.ts` |
| 遊戲紀錄 | 歷史記錄列表與欄位 | `GameRecords.vue` |
| 獎勵卡入口 | 會員頁 reward tab 或 `/lobby/gifts` redirect | `RewardCardContent.vue`、`pages/lobby/gifts.vue` |
| 登入導引 | 未登入時顯示登入／註冊按鈕 | `MemberProfileView.vue` |

## 5. 欄位說明

| 欄位 | 目前內容／限制 | 正式注意事項 |
|---|---|---|
| account | 帳號識別；通常不可由玩家任意修改 | 以正式身份 API 為準 |
| name | 暱稱 | 長度、敏感詞與修改頻率需確認 |
| email | 目前可編輯 | 後端規則指出有值後應鎖定，前端需補一致行為 |
| birthday | `YYYY-MM-DD` 候選格式 | 合法日期與修改限制尚未完整定義 |
| bio | 玩家簡介；目前有長度候選 | 正式限制與敏感內容規則待確認 |
| avatar／avatarId | 目前 12 個 emoji，部分依 VIP5 解鎖 | 正式 default avatar、上傳與 ID 模型待確認 |
| VIP | 等級、稱號、升級／保級資訊 | 需結構化門檻與權益，不能只顯示文案 |
| game record | 目前 100 筆隨機 Mock | 正式以 server id、時間與 gameKey 關聯 |

## 6. 狀態說明

| 狀態 | 目前行為 | 正式規格要求 |
|---|---|---|
| 未登入 | 顯示登入／註冊導引 | 不可讀取玩家私有資料 |
| profile loading | 目前沒有正式 API loading | 需處理讀取中、失敗與重新載入 |
| profile editable | 暱稱等欄位可編輯 | Email 有值後鎖定規則需落實 |
| binding connected | 顯示已綁定 | 解綁需安全驗證與最後登入方式保護 |
| binding unavailable | 目前缺少完整錯誤路徑 | 需明確 provider 失敗、取消與重試 |
| VIP progress | 目前主要是文案／Mock 數值 | 儲值 AND 投注雙條件與保級規則需結構化 |
| records empty／error | 目前以假資料為主 | 正式需無資料、失敗、分頁與時間範圍狀態 |

## 7. 查詢、排序與分頁

- 會員頁本身以頁籤切換，沒有一般排序。
- 遊戲紀錄目前由前端產生 100 筆資料，尚未提供正式日期範圍、排序、分頁與 server cursor。
- VIP 進度是玩家當前身份的摘要，不應由前端自行計算正式升級結果。
- 綁定列表以 provider 固定順序顯示；正式是否依後端可用 provider 動態排序待確認。

## 8. 操作與跳轉

| 操作 | 前提 | 目前結果 | 正式待確認 |
|---|---|---|---|
| 開啟會員頁 | 已登入或從受保護入口進入 | 顯示會員頁或登入導引 | token、profile loading 與權限 |
| 編輯資料 | 欄位可編輯 | 更新前端狀態／localStorage | PATCH API、錯誤、版本衝突與鎖定 |
| 綁定 provider | provider 可用 | 目前為 Mock 綁定 | OAuth、驗證與重複綁定 |
| 解綁 provider | 已綁定 | 目前缺少完整安全檢查 | 最後一個登入方式與密碼保護 |
| 切換 VIP | 點擊 VIP 頁籤 | 顯示進度／文案 | 兩條進度、等級規則與保級 |
| 查看紀錄 | 點擊 history | 顯示 Mock 列表 | API、分頁、時間與 gameKey |
| 開啟獎勵卡 | 點擊 rewards／gifts | 進入獎勵卡內容 | 入口名稱與頁籤保存 |

## 9. 頁面狀態

需定義 profile 初次 loading、未登入、資料讀取失敗、資料編輯中、送出中、欄位錯誤、Email 鎖定、provider 綁定中／失敗／取消、VIP 無資料、紀錄無資料／失敗、頭像被鎖定與登出後返回。現有原型主要覆蓋成功顯示與部分鎖定狀態。

## 10. User Story — 玩家

| 編號 | User Story |
|---|---|
| `WEB-US-U-06-001` | 身為玩家，我要查看並更新自己的會員資料，以便維持正確身份資訊。 |
| `WEB-US-U-06-002` | 身為玩家，我要查看綁定狀態與 VIP 進度，以便理解可用的身份與權益。 |
| `WEB-US-U-06-003` | 身為玩家，我要查看自己的遊戲紀錄，以便回顧過往遊戲活動。 |

## 11. User Story — 開發人員

| 編號 | User Story |
|---|---|
| `WEB-US-D-06-001` | 身為開發人員，我要把 profile、wallet 與 VIP 資料分開，以便避免玩家摘要混入未同步資產。 |
| `WEB-US-D-06-002` | 身為開發人員，我要讓綁定與 Email 鎖定由正式服務回應決定，以便前端不自行繞過安全規則。 |
| `WEB-US-D-06-003` | 身為開發人員，我要保留會員頁頁籤與 route query 的交接，以便從 Header 或獎勵卡入口返回正確狀態。 |

## 12. User Story — QA 驗證者

| 編號 | User Story |
|---|---|
| `WEB-US-Q-06-001` | 身為 QA，我要測試未登入、讀取失敗、編輯成功／失敗與返回，以便確認私有資料邊界。 |
| `WEB-US-Q-06-002` | 身為 QA，我要驗證 Email 鎖定、綁定／解綁與最後登入方式限制，以便避免帳號被鎖在不可登入狀態。 |
| `WEB-US-Q-06-003` | 身為 QA，我要分開檢查 VIP Mock 文案、結構化 API 與正式權益，以便避免錯誤宣稱已完成。 |

## 13. 驗收標準

| 編號 | 主題 | 驗收標準 |
|---|---|---|
| `WEB-AC-06-001` | 私有資料 | 未登入不可讀取或保存其他玩家的私有 profile、VIP、紀錄與綁定資料。 |
| `WEB-AC-06-002` | 編輯資料 | 可編輯欄位、Email 鎖定、欄位錯誤、送出中、成功與失敗結果有明確可觀察狀態。 |
| `WEB-AC-06-003` | 綁定安全 | 綁定、解綁、重複綁定與最後可用登入方式限制由正式規則與 API 共同驗證。 |
| `WEB-AC-06-004` | VIP | VIP 等級、儲值／投注雙門檻、權益與保級規則使用結構化資料，非純文案替代。 |
| `WEB-AC-06-005` | 紀錄 | 遊戲紀錄的資料欄位、時間、空態、錯誤、分頁與 gameKey 關聯有完整規格。 |

## 14. 這個功能需要的資料

- 玩家 profile、account、name、email、birthday、bio、avatar、avatarId。
- provider 綁定狀態、可用登入方式、解綁驗證與帳號安全資訊。
- VIP level、升級／保級門檻、累積儲值、累積投注與權益。
- 遊戲紀錄 id、時間、gameKey、投注、贏分、餘額與查詢分頁。
- 會員頁的 tab、入口來源、返回路徑與獎勵卡交接參數。

## 15. 待確認事項

| 編號 | 問題 | 影響 | 負責確認 |
|---|---|---|---|
| `WEB-Q-06-001` | Email 是否一旦有值就鎖定，首次設定與修改流程如何區分？ | 欄位狀態、API 與錯誤文案 | 產品／後端 |
| `WEB-Q-06-002` | VIP 每級儲值、投注與保級數值為何？ | 進度條、權益與 API schema | 產品／營運 |
| `WEB-Q-06-003` | 頭像採預設素材、emoji、上傳或混合模式？ | 資產、avatar ID、VIP 解鎖 | 產品／設計／後端 |
| `WEB-Q-06-004` | 解綁最後一個登入方式需要何種驗證？ | 安全流程與前後端責任 | 資安／後端 |
| `WEB-Q-06-005` | 公開 `/member` 是否維持 redirect 至登入後會員頁？ | SEO、route 與未登入入口 | 產品／設計 |

## 16. 版本沿革

| 版本 | 日期 | 內容 |
|---|---|---|
| v0.1 | 2026-09-15 | 依目前會員頁、profile state、VIP、綁定與遊戲紀錄建立 17 節分冊初版；正式會員服務未驗收。 |

## 17. 交付檢查表

- [ ] 已確認會員頁各頁籤、公開入口與登入後路由。
- [ ] 已確認 profile、VIP、綁定、頭像與 game records 的正式資料契約。
- [ ] 已補會員頁所有資料與安全狀態的桌機／手機設計。
- [ ] 已補 `WEB-FLOW`、`WEB-SC` 與會員相關驗收交叉引用。
- [ ] 已完成 Mock、瀏覽器、API 與正式會員服務的分層驗證紀錄。
