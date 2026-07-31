# APP／官網／營運後台 三方畫面功能對照矩陣

- 建立日期：2026-07-29
- 用途：以**畫面功能**為單位做三方交叉比對，確認同一功能在三邊對得上
- 比對對象：
  - **APP**：`Cooperfu615-Desinger/Casino-Lobby-Prototype` @ `phase-1-mvp` (`3c3e396`, 2026-07-27)，React 18，1280×720 固定畫布
  - **官網**：本專案 `巨亨ONLINE-Nuxt` @ `aa326bd`，Nuxt 3 SSG
  - **營運後台原型**：`cofa-Song/Game_operations` @ `06fdbbe`，Vue 3 wireframe；只用來理解操作、欄位與流程，**不是後端 API 契約或完成證明**
  - **後端工作清單**：[`sources/2026-07-27-backend-api-worklist.md`](sources/2026-07-27-backend-api-worklist.md)；狀態空白代表製作中尚未完成
- 主鍵：採用 **APP 的畫面編號**（P-/F-/M-/L-/C-），因三方中只有它有系統化編號（`docs/art-design-checklist.md`）
- 標記：✅ 三方一致｜⚠️ 有差異需確認｜🔴 明確衝突｜➖ 該側無此功能（合理）｜🟣 第二階段

---

## 0. 摘要：8 個第一階段的三方落差

| # | 項目 | 落差 | 嚴重度 |
|---|---|---|---|
| 1 | **贈禮流程** | 官網是**雙向確認**（申請→接受/拒絕/168h逾期），APP 是**直接轉帳**，無確認流程 | 🔴 |
| 2 | **儲值幣別與通道** | APP 走 **USD + App Store/Google Play IAP**，官網走 **NT$ + ATM/超商/信用卡** | 🔴 |
| 3 | **遊戲分類與數量** | APP 3 類 22 款（slot/card/fish），官網 5 類 30 款（slots/baccarat/fish/dice/cards） | 🔴 |
| 4 | **VIP 結構化程度** | APP 與後台都有結構化門檻（儲值 AND 投注），**官網只有文案字串** | 🔴 |
| 5 | **客服工單** | 官網最完整（工單狀態機 + 同時進行中上限 1 筆），**APP 客服左欄是空殼** | ⚠️ |
| 6 | **交易類型 enum** | APP 10 種、官網 6 種、後台 10 種，**三方各不相同** | ⚠️ |
| 7 | **選座位** | APP 有完整 `GameSeat` 資料模型（3 頁/機台數據），官網是 dead code，後台有 `min_seat_vip_level` | ⚠️ |
| 8 | **頭像數量** | APP 20 款圖片，官網 12 個 emoji + VIP5 解鎖規則，後台是素材清單 API | ⚠️ |

> 📌 **已確認的正式財務規則**：金額一律整數運算，小數無條件捨去；`NT$1＝金幣1＝銀幣100`；銅幣是無價值試玩幣；官網不提供外部提款。兩前台目前寫死的贈禮 5% 只是原型值，正式費率依 VIP 分級並在建立申請時凍結快照。獎勵卡的**有效流水認列**仍由 Gordan × Hulk 對齊 Provider 交易後定義。

---

## 1. 進入與認證

| APP 編號 | 功能 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|---|
| P-01 | 品牌載入畫面 | `BrandLoading.tsx:1-118` | ➖ 網頁無載入頁 | ➖ | ➖ 合理 |
| P-02 | 登入頁 | `LoginScreen.tsx:1-442` | `LoginModal.vue` | `Login.vue` (後台自己的) | ✅ |
| — | 帳號登入 | `:284-330` | `LoginModal.vue:163-184` | `/auth/login` | ✅ |
| — | 遊客登入 | `:199` | `LoginModal.vue:186-192` | ➖ 後端 API 清單**無此端點** | ⚠️ 見 gap §1.5 |
| M-05 | 註冊 | `SignupModal.tsx:1-291`（用戶名≥4、密碼≥6、兩次一致） | `LoginModal.vue:382-393`（**多了推薦碼 + 條款審閱**） | `/auth/register` | ⚠️ APP 無推薦碼欄位 |
| M-09 | 手機登入（OTP 2 步） | `PhoneLoginModal.tsx:1-228`（**含國碼選擇**） | `LoginModal.vue:194-215`（**寫死 `^09\d{8}$`，無國碼**） | `/system/dial-codes` 已提供 | ⚠️ 官網缺國碼 |
| M-10~M-13 | FB／LINE／Apple／Google 登入 | 四個獨立 Modal | `LoginModal.vue:217-232`（同一套流程） | `/auth/oauth/{provider}/*` | ⚠️ 兩邊都是假流程，需依後端 OAuth 重寫 |
| — | 忘記密碼 | `ForgotPasswordModal.tsx:1-530` | `LoginModal.vue:244-374`（4 步驟 + 3 分支） | 🔴 **後端無公開復原端點** | 🔴 見 gap §1.3 |
| M-04 | 服務條款（3 分頁） | `TermsModal.tsx:26-257` | `useLegalState.ts` + Legal Modal | `/operator-setting/article` | ✅ |
| — | 年齡驗證 | `AgeGateModal.tsx` **死碼未引用** | `AgeGateModal.vue` **有使用** | ➖ | ⚠️ APP 未接 |

**認證 provider 全集**：兩邊一致 —— `account｜guest｜phone｜facebook｜line｜apple｜google`（`AuthContext.tsx:27`、`useAppState.ts:6`）。

---

## 2. 主畫面與導航

| APP 編號 | 功能 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|---|
| P-03 | Lobby 主畫面 | `LobbyLayout.tsx:54-258`（功能以 Overlay 疊加，不換頁） | `pages/lobby/index.vue`（**換頁式路由**） | ➖ | ⚠️ 導航典範不同（合理，平台差異） |
| L-01 | 頂部標題列 | `Header.tsx:15-85`（頭像/VIP/金幣/BUY/SALE/銀幣/設定） | `AppHeader.vue` | ➖ | ⚠️ 官網無 BUY/SALE |
| L-02 | 底部導航（**8 顆**） | `BottomNavigation.tsx:6-15`：聊天/每日任務/活動/銀行/保險箱/信箱/獎勵卡/客服 | `AppBottomNav.vue`（手機版） | ➖ | ⚠️ 項目數需對齊 |
| L-03 | 遊戲分類側邊欄 | `CategorySidebar.tsx:56-77`（4 篩選 section） | `LobbySidebar.vue` + `GameFilterBar` | ➖ | ✅ |
| L-04 | 遊戲格子 | `GameGrid.tsx` + `GameCard.tsx`（180×180 / 280×376） | `GameGrid.vue` + `GameCard.vue` | ➖ | ✅ |
| L-05 | 跑馬燈通知 | `NotificationTicker.tsx:1-16`（純 CSS 動畫） | `AppMarquee.vue`（`siteContent.ts:283-290`） | ✅ `Announcement` type=`MARQUEE` + `weight` + `publishInterval` | ⚠️ **兩邊都缺 weight/排程** |
| L-06 | 設定下拉選單 | `SettingsMenu.tsx:15-128`（語言/音效/法律/導覽/黑名單/登出） | `pages/lobby/settings.vue` | ➖ | ✅ |
| L-07 | 懸浮 BUY／SALE | `LobbyButtons.tsx:4-43` | ➖ **官網無** | ➖ | ⚠️ |
| M-02 | 促銷輪播彈窗 | `PromotionModal.tsx:27-167`（6 檔專屬優惠） | ➖ **官網無** | `ImageConfig` type=`POPUP` + `PopupFrequency` | 🟣 官網彈窗機制屬第二階段 |
| C-03 | Jackpot 跑馬燈 | `JackpotTicker.tsx:1-96` | ➖ | ➖ | ⚠️ |
| — | JP 中獎浮動通知 | `JpNotification.tsx:1-131` | ➖（官網跑馬燈有中獎播報文字） | ➖ | ⚠️ 呈現方式不同 |

---

## 3. 遊戲大廳與啟動 🔴

| 項目 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|
| **遊戲分類** | `card｜slot｜fish` 3 類（`types/game.ts:4-20`） | `slots｜baccarat｜fish｜dice｜cards` 5 類 | `GameType` 可設定；`GameProvider.type` = `SLOT｜LIVE｜SPORTS｜LOTTERY｜CARD` | 🔴 **三方都不同** |
| **遊戲數量** | 22 款（17 slot／3 card／2 fish） | `siteContent.games` 24 款 + `lobbyGames` 30 款（**兩份並存**） | 由 `fetchLatestProviderGames` 拉取 | 🔴 需統一 catalog |
| **篩選維度** | 我的最愛／類別／幣別／遊戲商（`gameFilter.ts:17-22`） | 分類／搜尋／供應商／排序 | — | ⚠️ APP 有「幣別」篩選、官網有「排序」 |
| **收藏** | `jh_app_favorite_game_ids`（localStorage） | ➖ **官網無收藏功能** | ➖ | ⚠️ |
| **最近遊玩** | `casino-recent-game-ids` | `useRecentGames.ts`（上限 12） | ➖ | ✅ |
| **遊戲標籤** | `isNew`、`hasJackpot` | badge `熱門｜新上線｜活動` | `marketing_tag: HOT｜RECOMMENDED｜DOUBLE_TURNOVER` | ⚠️ 三方標籤集不同，**缺 `DOUBLE_TURNOVER`（雙倍流水）** |
| **啟動彈窗（選幣別）** | `GameLaunchModal.tsx:15-165`（**有不可用原因**：「需先啟用金/銀幣獎勵卡」） | `GameLaunchModal.vue`（**無不可用原因、不檢查餘額**） | — | ⚠️ 官網缺停用理由 |
| **遊戲錢包 5 種** | `stored-gold｜activity-gold｜stored-silver｜activity-silver｜bronze` | 同左（`utils/gameWallets.ts:3-8`） | `Wallet{type × currency}` 二維 | ✅ 兩前台一致，但**與後台結構不同** |
| **選座位** | ✅ `GameSeat`（3 頁、`freeGame{unopened,previousOne,previousTwo}`、`rtpAverage`/`hitRate`/`totalBet{today,threeDay,sevenDay}`，`types/game.ts:36-47`、`mockData.tsx:123-168`） | 🔴 `SeatSelectionModal.vue` **是 dead code**（無人引用） | ✅ `Game.min_seat_vip_level` | ⚠️ **APP 與後台都有，官網沒接** |
| P-04 | 遊戲室 | `GameRoom.tsx:16-143`（背景圖 + 離開鈕 + 「完成流水」測試鈕） | `GameView.vue`（iframe `example.com` 佔位） | — | ✅ 兩邊都是佔位 |
| **遊戲維護狀態** | ➖ | ➖ | ✅ `status: MAINTENANCE` | ⚠️ 兩前台都無維護標示 |
| **VIP／幣別門檻** | ➖ | ➖ | ✅ `min_vip_level`、`allowed_currencies` | ⚠️ 兩前台都無檢查 |

---

## 4. 財務：銀行 F-04 / 保險箱

### 4.1 原型常數與已確認正式規則
| 項目 | 原型現況 | 正式規則／處理 |
|---|---|---|---|
| 三幣初始餘額 | APP／官網 mock 皆為 10,000,000 | 僅測試資料，不是正式發幣量 |
| 金額精度 | 原型未完整限制 | 整數運算；小數無條件捨去，捨去後 ≤0 拒絕 |
| 台幣／金幣／銀幣 | 兩前台金銀兌換為 1:100 | `NT$1＝金幣1＝銀幣100` |
| 銅幣 | 原型可顯示與遊玩 | 無價值試玩幣，不可兌現 |
| 贈禮手續費 | 兩前台寫死 5% | 依 VIP 分級；建立申請時凍結費率與手續費快照 |
| 外部提款 | APP enum 留有 `withdraw`，官網沒有流程 | 第一階段不提供；保險箱 `/vault/withdraw` 僅是內部 `VAULT_OUT` |

### 4.2 🔴 儲值：幣別與通道完全不同
| | APP | 官網 | 後台 |
|---|---|---|---|
| 幣別 | **USD**（$4.99–$499.99，6 檔） | **NT$**（300–10,000，6 檔） | 多幣別 |
| 通道 | **App Store / Google Play IAP** | ATM／超商／信用卡 | `iOS-IAP｜Android-IAP｜Web-CreditCard｜Web-ATM｜MyCard｜LinePay｜AliPay` |
| 加碼 | +10%~+100%，$99.99 = BEST VALUE | bonus 已內含在 points | — |
| 來源 | `mockData.tsx:202-209` | `DepositContent.vue:26-31` | `types/depositOrder.ts:3` |

**後台已涵蓋兩種通道**，所以這是**刻意的平台差異**還是設定不一致？需確認。若刻意，儲值方案表要能依平台回不同內容。

### 4.3 分頁結構差異
| | APP | 官網 |
|---|---|---|
| 銀行 F-04 | 儲值／優惠／紀錄（3 頁，`BankInterface.tsx:46-50`） | 儲值／優惠（`BankContent.vue`） |
| 保險箱（獨立 view） | 保險箱／贈禮／兌換（3 頁，`VaultInterface.tsx:132-136`） | 保險箱／贈禮／兌換（`VaultContent.vue`，3 頁） | ✅ |
| 交易紀錄 | 在銀行分頁內 | 獨立頁 `/lobby/transactions` | ⚠️ 位置不同 |

> 兩邊都把保險箱從銀行拆出來了，結構一致 ✅

### 4.4 🔴 贈禮流程：APP 與官網不同機制
| | APP | 官網 |
|---|---|---|
| 機制 | **直接轉帳**（`transferFromVault`，`AuthContext.tsx:237-287`） | **雙向確認**：申請 → 接受/拒絕/取消/168h 逾期（`useGiftState.ts`） |
| 次數限制 | 「5/10 次」**只顯示，無驗證邏輯**（`VaultInterface.tsx:225`） | 每日 10 次，**有強制**（`useGiftState.ts:12,189`） |
| 單次上限 | 1,000,000 **只顯示，未強制**（`:226`） | 1,000,000，**有強制** | 
| 申請列表 | ➖ | `GiftRequestList.vue` |
| 費率快照 | ➖ | `GiftRequest.feeRate` 凍結 |

🔴 **這是第一階段最大的畫面落差** —— 玩家在 APP 送禮是即時到帳，在官網要對方確認。必須統一。

### 4.5 ⚠️ 交易類型 enum：三方全不同
| 來源 | 值 |
|---|---|
| **APP**（10 種，`types/transaction.ts:23`） | `deposit｜withdraw｜rebate｜free_reward｜reward_card_conversion｜gift_transfer｜gift_package｜vault_deposit｜currency_conversion｜vault_gift` |
| **官網**（6 種） | `deposit｜vault｜gift｜exchange｜reward｜spend` |
| **後台**（10 種，`AssetLogChangeType`） | `BET｜WIN｜CLAIM｜UNLOCK｜WIPE｜EXCHANGE｜P2P_OUT｜P2P_IN｜DEPOSIT｜WITHDRAW` |

只有後台區分 `P2P_OUT`/`P2P_IN`（收/送）與 `BET`/`WIN`。APP 有 `rebate`（返水）、`gift_package`，官網有 `spend`。**需要一張三方對照表 + 統一 enum。**

`WITHDRAW`／`withdraw` 不能直接解讀為對外提款：正式玩家前台不提供外部提款，保險箱取回主錢包統一映射為 `VAULT_OUT`。APP 已知瑕疵：`withdrawFromVault` 也記成 `vault_deposit`，靠 `method` 文字判方向（`AuthContext.tsx:269`、`BankInterface.tsx:186`）；`vault_gift`、外部 `withdraw` 型別無產生端。

### 4.6 交易狀態
| APP／官網 | 後台 |
|---|---|
| `success｜processing｜failed` | `PENDING｜SUCCESS｜FAILED｜EXPIRED｜MANUAL｜REFUNDED｜VERIFY_ERROR` |

⚠️ 後台可以人工補單／退款／驗證失敗，**兩個前台都顯示不出來**。

---

## 5. 每日任務／活動／排行榜 F-02

| 項目 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|
| 每日簽到 | `DailyCheckInPanel.tsx`（日曆、進度條、補簽 100、里程碑） | `pages/lobby/daily.vue`（同結構） | `DailySignIn.vue`（獎勵編輯） | ✅ |
| 里程碑 | 5/7/25/30 = 金幣；10 天 = 10,000,000 銅幣；15 天 = 銀卡；20 天 = 金卡（`:22-30`） | 同（`siteContent.ts:727-733`、`daily.vue:10-11`） | 可設定 | ✅ **完全一致** |
| 補簽成本 | 100 | 100 | 可設定 | ✅ |
| 活動列表 | `EventListPanel`（10 筆，`type: sale｜tournament｜vip`） | `events.vue`（8 筆，`status: active｜upcoming｜ended`） | `PromoCampaign`（完整五段式設定） | ⚠️ **分類維度不同** |
| 活動報名 | 有報名互動 | 只設一個提示字串（`EventsContent.vue:21-28`） | `frontendApply` + `applyBlockMessage` | ⚠️ **官網無報名狀態** |
| 排行榜三榜 | 倍數／贏分／富豪（`EventsInterface.tsx:63-67`） | `multi｜win｜wealth`（`siteContent.ts:220-226`） | ➖ | ✅ **一致** |
| 排行榜更新時間 | not_stated | `useLeaderboardTimer.ts:11`（本地假計時） | ➖ | ⚠️ 需 server `updatedAt` |

---

## 6. 獎勵卡 F-05

| 項目 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|
| 名稱 | UI 標題「獎勵卡 REWARD CARD WALLET」（截圖與文件卻稱「禮物 Gifts」） | `/lobby/gifts` → `RewardCardContent.vue` | `BonusCard` | ⚠️ **命名混亂，三方應統一** |
| 卡片定義 | 15 天銀 10,000／20 天金 5,000，流水 100,000，上限 10,000，到期 2026/12/31 | **完全相同** | `BonusCard{multiplier, target_current, cap, end_time}` | ✅ |
| 轉換演算 | `converted = min(餘額, 上限)`，其餘 `recovered` | 相同（`utils/rewardCardConversion.ts`） | 同概念 | ✅ |
| 同幣別單卡 active | ✅ | ✅ | — | ✅ |
| 流水累積 | 🔴 靠遊戲室「完成流水」測試鈕（`GameRoom.tsx:48-54`） | 🔴 靠 `GameView.vue:28-29` 測試鈕 | 原型有 `valid_turnover`／`remain_target` 欄位 | 🔴 **實際認列規則尚待 Gordan × Hulk 定義** |
| 轉換通知彈窗 | `RewardConversionModal.tsx` | `RewardConversionModal.vue` | — | ✅ |

---

## 7. 信箱 F-03

| 項目 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|
| 分類 | 營運公告／系統通知（`InboxInterface.tsx:139-176`） | 同分組（`MailboxContent.vue:11-13`） | `type: SYSTEM｜PROMOTION｜COMPENSATION｜PERSONAL` | ⚠️ 三方分類不同 |
| 型別值 | `system｜promo｜personal` | `system｜event｜deposit` | 見上 | ⚠️ |
| 附件獎勵 | **固定 50,000 金幣**（`:88,93`） | `MailReward{wallet, amount, label}`（結構化） | `attachmentBonusAmount` | ⚠️ APP 寫死 |
| 批次操作 | 全部標已讀／全部領取／刪除已讀 | ➖ **官網無批次** | `DELETE /mailbox` 批次 | ⚠️ |
| 撤回 | ➖ | ➖ | ✅ `recallMessage` | ⚠️ 兩前台都無處理 |
| 未讀徽章 | ✅ 有紅點 | ➖ **官網無消費者** | ✅ 清單含未讀數 | ⚠️ |

---

## 8. 聊天／社交 F-01

| 項目 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|
| 三頻道 | 公共／私訊／客服（`ChatSubTab`） | 世界／私訊／客服（`chat.vue`） | 世界頻道／私聊／客服（三分頁監控） | ✅ |
| 公共頻道發言 | ✅ | ✅ | ✅ 後台可官方發言 | ✅ |
| 私訊 | ✅ + 附件選單（遊戲點數→贈禮） | ✅ | ✅ 監控 | ⚠️ 官網無附件 |
| Emoji 選擇器 | ✅ 3 分頁 | ➖ | — | ⚠️ |
| M-07 自動傳送 | ✅ VIP 專屬（`AutoSendSettingsModal`） | ➖ **官網無** | — | ⚠️ |
| 好友 | ✅ `SocialContext.tsx:36-114`（懶載入 650ms） | ✅ `useSocialState.ts` | ➖ | ⚠️ **後端 API 清單無好友端點** |
| 黑名單（社交封鎖） | ✅ `BlacklistModal` | ✅ `settings.vue` | 營運後台另有 IP／裝置風控封鎖，屬不同功能 | ✅ 已確認此處專指玩家社交封鎖，由 Wu 負責 |
| M-08 玩家資料卡 | ✅ 私訊/送禮/檢舉/加好友/黑名單 | ✅ `PlayerCard.vue` | ➖ | ✅ |
| 檢舉 | ✅ 導向客服草稿（`【標題】內容`） | ✅ `ReportPlayerModal.vue`（5 個中文理由硬編） | ✅ 觸發紀錄審核 | ⚠️ 需 reason code |
| **客服工單** | 🔴 **左欄空殼**，只有 1 則機器人開場（`:382-394`） | ✅ **完整**：`SupportTicketList`、同時進行中上限 1 筆（`MAX_ONGOING_SUPPORT_TICKETS`）、狀態機、7 種分類 | ✅ 工單管理（4 種狀態、指派、轉接、結案） | 🔴 **APP 落後兩級** |
| 敏感詞過濾 | ➖ | ➖ | ✅ `KeywordRecord{action: REPLACE｜BLOCK｜MONITOR}` | 🟣 第二階段 |
| 禁言 | ➖ | ➖ | ✅ `is_muted: NONE｜15M｜1H｜1D｜PERMANENT` | 🟣 第二階段 |

---

## 9. 個人資料 M-01

| 項目 | APP | 官網 | 後台 | 判定 |
|---|---|---|---|---|
| 分頁 | 個人資訊／遊戲紀錄（`activeView: overview｜edit｜history`） | 會員中心多分頁 | — | ✅ |
| 可編輯欄位 | 暱稱／簡介／生日／Email／密碼 | name／email／birthday／bio | `PUT /account/profile`（**email 有值即鎖定**） | 🔴 兩前台都可自由改 email |
| 帳號綁定 | 手機／FB／LINE／Apple（`boundAccounts` 本地 state，登出即失） | 5 個 provider toggle，無驗證 | 有「最後一個綁定且無密碼則拒絕」規則 | ⚠️ 兩前台都無錯誤處理 |
| 頭像 | **20 款圖片**（`AvatarSelectModal`） | **12 個 emoji** + VIP5 解鎖 | `/system/default-avatars` + 檔案上傳 | 🔴 **三方全不同** |
| VIP 進度 | ✅ `VIP_LEVEL_RULES`（儲值 AND 投注）+ `VIP_TARGET_DETAILS`（返水/手續費減免/保級） | 🔴 **只有文案字串** | ✅ 結構化（`promo_deposit`/`promo_turnover`/`retain_*`） | 🔴 **官網最弱** |
| 成就 | `ACHIEVEMENTS`（`mockData.tsx:348-355`）**但 UserModal 未引用**，截圖過時 | ➖ **官網無成就** | ➖ | ⚠️ 需確認是否保留 |
| 遊戲紀錄 | `GameRecordsPanel.tsx:51-247` | `GameRecords.vue`（100 筆隨機生成） | `GameLogs.vue`（真實查詢） | ✅ |

---

## 10. 🟣 第二階段（後台已有、兩前台皆無）

| 功能 | 後台位置 | APP 現況 |
|---|---|---|
| **公會／俱樂部** | `GuildManagement.vue`、`types/guild.ts` | ✅ **APP 已有整組但 phase-1 註解隱藏**（`LobbyLayout.tsx:248-252`：ClubInterface/ClubChat/ClubEvents/ClubRewards/ClubAdminEvents） |
| 徽章 | `src/api/badge.ts` | ➖ |
| 商城／商品 | `src/api/commodity.ts` | ➖ |
| 彈窗／開屏 | `ImageConfig` type=`POPUP｜SPLASH` + `PopupFrequency` | APP 有 M-02 促銷輪播（近似） |
| APP 版本檢查 | `types/version.ts` | ➖ |
| 玩家標籤分眾 | `MemberTag` | ➖ |
| 自動觸發活動 | `TriggerCampaign.vue` | ➖ |
| 玩家管制（禁言/凍結/踢線/三種 disabled） | `PlayerDetail.vue:511-548` | ➖ 兩前台皆無 |
| 全站維護頁 | `OperationConfig.maintenance_*` | ➖ 兩前台皆無 |

> 📌 **公會值得注意**：APP 已經寫好整組程式碼只是註解掉，後台也有完整管理介面 —— 第二階段啟用時 APP 幾乎是現成的，但**官網完全沒有**。

---

## 11. APP 側需要處理的自身問題

| # | 問題 | 位置 |
|---|---|---|
| 1 | **死碼**：`TransferModal`、`HistoryModal`（已註冊無呼叫端）、`LobbyGuideModal`、`AgeGateModal`、`FloatingWidget` | 各 modal 檔 |
| 2 | modal type `sale`／`tournament` 型別存在但**未註冊元件**，開啟會 return null | `ModalContainer.tsx` |
| 3 | `withdrawFromVault` 記成 `vault_deposit`，靠文字判方向 | `AuthContext.tsx:269` |
| 4 | `vault_gift`、`withdraw` 交易型別**無產生端** | `types/transaction.ts:23` |
| 5 | 贈禮次數／上限**只顯示不驗證** | `VaultInterface.tsx:225-226` |
| 6 | M-13（Google 登入）**未收錄於 art-design-checklist**（只到 M-12） | `docs/art-design-checklist.md` |
| 7 | M-01 成就分頁**截圖存在但程式已無此頁**，截圖過時 | `UserModal.tsx:18` |
| 8 | 保險箱/贈禮截圖編為 `F-04_bank-*`，但程式已拆為獨立 `vault` view | 截圖檔名 vs `VaultInterface.tsx` |
| 9 | F-05 命名不一致：文件稱「禮物 Gifts」、UI 稱「獎勵卡」 | `GiftsInterface.tsx:80` |
| 10 | README 說 5 大 Context，實際 8 個（多 Social／Activity／RewardCard） | `README.md:51-62` |
| 11 | `ModalContainer.tsx:40-51` 留有開發草稿註解 | 同左 |

---

## 12. 建議行動

### 第一階段必須先對齊（依急迫度）
1. **贈禮流程**：雙向確認 vs 直接轉帳 —— 二選一，兩邊改成一致
2. **儲值幣別與通道**：確認是刻意的平台差異，若是則方案表要能依平台回不同內容
3. **VIP 結構化門檻**：官網補上（APP 與營運後台原型已有可參考結構；最終以 API 契約為準）
4. **贈禮手續費改吃 VIP 分級**：三方一起改，建立申請時保存快照
5. **遊戲分類與 catalog**：三方統一，官網先合併兩份清單
6. **交易類型 enum**：做三方對照表後統一
7. **客服工單**：APP 補上（官網已完整，可直接對齊）
8. **選座位**：APP 有資料模型、後台有 VIP 門檻 —— 決定官網要不要接

### 文件維護
- `art-design-checklist.md` 需補 M-13、修正 M-01 成就頁、重編保險箱/贈禮的畫面編號、統一 F-05 命名
- 建議把這份矩陣的「畫面編號」推廣到官網與後台，三方共用同一套編號

---

## 13. 驗證方式與限制

- APP 側資料來自 `phase-1-mvp` 分支 `3c3e396`；官網側來自本專案 `aa326bd`；後台側來自 `06fdbbe`
- 原型中的固定值已逐項核對，但正式規則以決策文件為準；固定 5% 與初始餘額不得直接搬進正式環境
- **限制**：三份都是原型，資料模型不等於最終實作；營運後台尤其只提供操作、欄位與流程參考
- 遊戲供應商 Seamless Wallet／Webhook 與 A-10 全 12 支由 Hulk 負責；有效流水由 Hulk 與 Gordan 共同定義
- 兩個 clone 位於 scratchpad，session 結束即消失，需要時可重新 clone
