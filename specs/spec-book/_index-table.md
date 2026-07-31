<!-- 此檔由 specs/spec-book/capture.mjs 自動產生，請勿手改；內容來源為 screens.config.mjs -->

> 產生時間：2026/7/30 下午5:22:49

### 進入與認證

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="W-01"></a>`W-01` | 官網首頁 | `/` | [桌機](shots/W-01-desktop.png) ／ [手機](shots/W-01-mobile.png) | — | APP 無對應（APP 是 P-01 品牌載入頁） |
| <a id="P-02"></a>`P-02` | 登入 — 帳號密碼 | `/lobby/transactions` | [桌機](shots/P-02-desktop.png) ／ [手機](shots/P-02-mobile.png) | — | 官網為 Modal，APP 為獨立頁 LoginScreen.tsx。桌機 header 無登入鈕，入口在受保護頁的導引卡與手機底部導覽 |
| <a id="M-09"></a>`M-09` | 登入 — 手機驗證碼 | `/lobby/transactions` | [桌機](shots/M-09-desktop.png) ／ [手機](shots/M-09-mobile.png) | ⚠️ | ⚠️ 官網寫死 ^09\d{8}$ 無國碼；APP 有國碼選擇。後端 /system/dial-codes 已提供 |
| <a id="M-05"></a>`M-05` | 註冊 | `/lobby/transactions` | [桌機](shots/M-05-desktop.png) ／ [手機](shots/M-05-mobile.png) | ⚠️ | ⚠️ 官網多了推薦碼（代理 6 碼／玩家 8 碼）與條款審閱，APP 無 |
| <a id="W-02"></a>`W-02` | 忘記密碼（4 步驟） | `/lobby/transactions` | [桌機](shots/W-02-desktop.png) ／ [手機](shots/W-02-mobile.png) | 🔴 | 🔴 後端無公開復原端點，見 api-gap-analysis §1.3 |
| <a id="M-04"></a>`M-04` | 服務條款／隱私政策 | `/lobby/transactions` | [桌機](shots/M-04-desktop.png) ／ [手機](shots/M-04-mobile.png) | — | 三方一致；後台 /operator-setting/article 提供內容 |
| <a id="W-03"></a>`W-03` | 年齡驗證 | `/lobby/chat` | [手機](shots/W-03-mobile.png) | ⚠️ | ⚠️ 官網由手機底部導覽「進入遊戲」鈕觸發（AppBottomNav.vue / FloatingPanels.vue），非點擊遊戲卡；APP 側 AgeGateModal 為死碼未引用 |

### 主畫面與導航

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="P-03"></a>`P-03` | 遊戲大廳主畫面 | `/lobby` | [桌機](shots/P-03-desktop.png) ／ [手機](shots/P-03-mobile.png) | ⚠️ | ⚠️ 官網為換頁式路由，APP 為 Overlay 疊加（平台差異，合理） |
| <a id="L-01"></a>`L-01` | 頂部標題列 | `/lobby` | [桌機](shots/L-01-desktop.png) | ⚠️ | ⚠️ 官網無 BUY／SALE 按鈕（APP L-07 有） |
| <a id="L-02"></a>`L-02` | 底部導航（手機） | `/lobby` | [手機](shots/L-02-mobile.png) | ⚠️ | ⚠️ APP 為 8 顆，官網為 5 顆，項目數需對齊 |
| <a id="L-03"></a>`L-03` | 側邊導覽（桌機） | `/lobby` | [桌機](shots/L-03-desktop.png) | — |  |
| <a id="L-06"></a>`L-06` | 設置 | `/lobby/settings` | [桌機](shots/L-06-desktop.png) ／ [手機](shots/L-06-mobile.png) | — | 語言／音效／法律／黑名單／登出，與 APP SettingsMenu 一致 |

### 遊戲大廳與啟動

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="L-04"></a>`L-04` | 遊戲格子與分類 | `/lobby` | [桌機](shots/L-04-desktop.png) ／ [手機](shots/L-04-mobile.png) | 🔴 | 🔴 官網 5 類 30 款 vs APP 3 類 22 款；官網另有 siteContent.games 24 款並存需合併 |
| <a id="W-04"></a>`W-04` | 遊戲啟動彈窗（選幣別） | `/lobby` | [桌機](shots/W-04-desktop.png) ／ [手機](shots/W-04-mobile.png) | ⚠️ | ⚠️ 官網不顯示不可用原因、不檢查餘額；APP GameLaunchModal 有 |
| <a id="P-04"></a>`P-04` | 遊戲室 | ➖ 無 | 待補 | — | 官網 GameView.vue 為 iframe example.com 佔位，兩邊皆佔位。含「完成流水」測試鈕（假機制） |
| <a id="W-05"></a>`W-05` | 選座位 | ➖ 無 | 待補 | 🔴 | 🔴 官網 SeatSelectionModal.vue 是 dead code（無人引用）。APP 有完整 GameSeat 模型、後台有 min_seat_vip_level — 待決策官網是否接 |

### 財務

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="F-04"></a>`F-04` | 銀行 — 儲值 | `/lobby/bank` | [桌機](shots/F-04-desktop.png) ／ [手機](shots/F-04-mobile.png) | ✅ | 已確認為刻意平台差異：官網 NT$ + ATM／超商／信用卡，APP USD + IAP；官網不提供外部提款 |
| <a id="F-04b"></a>`F-04b` | 銀行 — 優惠 | `/lobby/bank?tab=offers` | [桌機](shots/F-04b-desktop.png) ／ [手機](shots/F-04b-mobile.png) | — |  |
| <a id="F-04c"></a>`F-04c` | 保險箱 — 存取 | `/lobby/vault` | [桌機](shots/F-04c-desktop.png) ／ [手機](shots/F-04c-mobile.png) | ✅ | 兩前台都已把保險箱從銀行拆出，結構一致 ✅ |
| <a id="F-04d"></a>`F-04d` | 保險箱 — 贈禮申請 | `/lobby/vault?tab=transfer` | [桌機](shots/F-04d-desktop.png) ／ [手機](shots/F-04d-mobile.png) | ✅ | 已拍板採官網雙向確認（申請→接受／拒絕／取消／168h 逾期）；APP 需對齊 |
| <a id="F-04e"></a>`F-04e` | 保險箱 — 贈禮申請列表 | `/lobby/vault?tab=transfer` | [桌機](shots/F-04e-desktop.png) ／ [手機](shots/F-04e-mobile.png) | ⚠️ | APP 無此畫面；正式費率依 VIP 分級，建立申請時凍結費率與手續費快照 |
| <a id="W-06"></a>`W-06` | 兌換（金↔銀） | `/lobby/exchange` | [桌機](shots/W-06-desktop.png) ／ [手機](shots/W-06-mobile.png) | ✅ | `NT$1＝金1＝銀100`；金額整數、小數捨去；銀換金需 100 倍數、手續費 0 |
| <a id="W-07"></a>`W-07` | 交易紀錄 | `/lobby/transactions` | [桌機](shots/W-07-desktop.png) ／ [手機](shots/W-07-mobile.png) | ⚠️ | ⚠️ 交易類型 enum 三方全不同（官網 6 種／APP 10 種／後台 10 種），需統一。位置也不同（APP 在銀行分頁內） |

### 任務與活動

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="F-02"></a>`F-02` | 每日簽到 | `/lobby/daily` | [桌機](shots/F-02-desktop.png) ／ [手機](shots/F-02-mobile.png) | ✅ | 原型里程碑一致；10 天銅幣為無價值試玩幣，15 天銀卡、20 天金卡、補簽 100 |
| <a id="F-02b"></a>`F-02b` | 活動列表 | `/lobby/events` | [桌機](shots/F-02b-desktop.png) ／ [手機](shots/F-02b-mobile.png) | ⚠️ | ⚠️ 分類維度不同（官網 active／upcoming／ended vs APP sale／tournament／vip）；官網無報名狀態 |
| <a id="F-02c"></a>`F-02c` | 排行榜（三榜） | `/lobby/leaderboard` | [桌機](shots/F-02c-desktop.png) ／ [手機](shots/F-02c-mobile.png) | ⚠️ | ✅ 三榜一致（倍數／贏分／富豪）；⚠️ 更新時間官網為本地假計時，需 server updatedAt |

### 獎勵卡

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="F-05"></a>`F-05` | 獎勵卡 | `/lobby/gifts` | [桌機](shots/F-05-desktop.png) ／ [手機](shots/F-05-mobile.png) | 🔴 | ⚠️ 命名混亂需統一（文件「禮物 Gifts」／UI「獎勵卡」／後台 BonusCard）。🔴 流水累積兩前台都是測試鈕假機制 |

### 信箱

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="F-03"></a>`F-03` | 信箱 — 營運公告 | `/lobby/inbox` | [桌機](shots/F-03-desktop.png) ／ [手機](shots/F-03-mobile.png) | ⚠️ | ⚠️ 官網無批次操作、無未讀徽章消費者；三方分類 enum 不同 |
| <a id="F-03b"></a>`F-03b` | 信箱 — 系統通知 | `/lobby/inbox` | [桌機](shots/F-03b-desktop.png) ／ [手機](shots/F-03b-mobile.png) | — |  |

### 聊天與社交

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="F-01"></a>`F-01` | 聊天 — 世界頻道 | `/lobby/chat?channel=world` | [桌機](shots/F-01-desktop.png) ／ [手機](shots/F-01-mobile.png) | ⚠️ | ✅ 三頻道一致；⚠️ 官網無 Emoji 選擇器、無 M-07 自動傳送 |
| <a id="F-01b"></a>`F-01b` | 聊天 — 私人頻道 | `/lobby/chat?channel=private` | [桌機](shots/F-01b-desktop.png) ／ [手機](shots/F-01b-mobile.png) | ⚠️ | ⚠️ 官網私訊無附件選單（APP 有遊戲點數→贈禮） |
| <a id="F-01c"></a>`F-01c` | 聊天 — 客服頻道／工單 | `/lobby/chat?channel=support` | [桌機](shots/F-01c-desktop.png) ／ [手機](shots/F-01c-mobile.png) | 🔴 | 🔴 官網最完整（工單狀態機、上限、7 種分類），APP 左欄是空殼落後兩級 |
| <a id="M-08"></a>`M-08` | 玩家資料卡 | `/lobby/chat?channel=world` | [桌機](shots/M-08-desktop.png) ／ [手機](shots/M-08-mobile.png) | ✅ | 黑名單已確認指玩家社交封鎖（由 Wu 負責），不是營運後台的 IP／裝置風控封鎖 |
| <a id="W-08"></a>`W-08` | 檢舉玩家 | ➖ 無 | 待補 | ⚠️ | ⚠️ 官網 5 個中文理由硬編，需改 reason code。截圖需由玩家卡開啟後補拍 |
| <a id="W-09"></a>`W-09` | 客服中心（獨立頁） | `/lobby/support` | [桌機](shots/W-09-desktop.png) ／ [手機](shots/W-09-mobile.png) | — |  |

### 個人資料

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="M-01"></a>`M-01` | 個人資料 | `/lobby/member` | [桌機](shots/M-01-desktop.png) ／ [手機](shots/M-01-mobile.png) | 🔴 | 🔴 兩前台都可自由改 email，後台規則為「email 有值即鎖定」 |
| <a id="M-01b"></a>`M-01b` | 帳號綁定 | `/lobby/member` | [桌機](shots/M-01b-desktop.png) ／ [手機](shots/M-01b-mobile.png) | ⚠️ | ⚠️ 兩前台都無「最後一個綁定且無密碼則拒絕」的錯誤處理 |
| <a id="M-01c"></a>`M-01c` | VIP 等級 | `/lobby/member` | [桌機](shots/M-01c-desktop.png) ／ [手機](shots/M-01c-mobile.png) | 🔴 | 🔴 官網只有文案字串，APP 與後台都有結構化門檻（儲值 AND 投注）— 官網最弱，需補 |
| <a id="M-01d"></a>`M-01d` | 遊戲紀錄 | `/lobby/member` | [桌機](shots/M-01d-desktop.png) ／ [手機](shots/M-01d-mobile.png) | — |  |
| <a id="W-10"></a>`W-10` | 頭像選擇 | `/lobby/member` | [桌機](shots/W-10-desktop.png) ／ [手機](shots/W-10-mobile.png) | 🔴 | 🔴 三方全不同：官網 12 emoji + VIP5 解鎖 / APP 20 款圖片 / 後台 /system/default-avatars + 上傳 |

### 官網公開頁

| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |
|---|---|---|---|---|---|
| <a id="W-11"></a>`W-11` | 活動頁（公開） | `/events` | [桌機](shots/W-11-desktop.png) ／ [手機](shots/W-11-mobile.png) | — |  |
| <a id="W-12"></a>`W-12` | 排行榜（公開） | `/leaderboard` | [桌機](shots/W-12-desktop.png) ／ [手機](shots/W-12-mobile.png) | — |  |
| <a id="W-13"></a>`W-13` | 新手教學／APP 下載 | `/tutorial` | [桌機](shots/W-13-desktop.png) ／ [手機](shots/W-13-mobile.png) | — |  |
| <a id="W-14"></a>`W-14` | 儲值（公開頁） | `/deposit` | [桌機](shots/W-14-desktop.png) ／ [手機](shots/W-14-mobile.png) | — |  |
| <a id="W-15"></a>`W-15` | 客服（公開頁） | `/support` | [桌機](shots/W-15-desktop.png) ／ [手機](shots/W-15-mobile.png) | — |  |
| <a id="W-16"></a>`W-16` | 會員中心（公開頁） | `/member` | [桌機](shots/W-16-desktop.png) ／ [手機](shots/W-16-mobile.png) | — |  |
| <a id="W-17"></a>`W-17` | 未登入導引（以交易紀錄為例） | `/lobby/transactions` | [桌機](shots/W-17-desktop.png) ／ [手機](shots/W-17-mobile.png) | — | 所有需登入的大廳頁共用同一種未登入卡片樣式，美術只需出一套 |
