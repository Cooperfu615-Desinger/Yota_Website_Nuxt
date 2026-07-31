/**
 * 巨亨ONLINE 規格書 — 畫面清單（截圖與索引總表的單一設定來源）
 *
 * 主鍵編號規則：
 *   P- / F- / M- / L- / C-  沿用 APP `docs/art-design-checklist.md` 的既有編號
 *   W-                      官網獨有畫面，本專案另編（見 specs/2026-07-29-three-way-screen-matrix.md §12）
 *
 * 每筆欄位：
 *   id        畫面編號（同時是截圖檔名前綴，全書錨點）
 *   name      畫面名稱
 *   group     章節分組（對應矩陣的章節）
 *   route     官網路由（含 query）；null = 官網無此畫面（只列在索引，不截圖）
 *   auth      'in' 需登入 | 'out' 需登出 | 'any'
 *   viewports 要拍的斷點，預設 ['desktop', 'mobile']
 *   steps     進入畫面後要執行的操作（彈窗、分頁）；見 capture.mjs 支援的動作
 *   waitFor   截圖前必須出現的選擇器（防止拍到骨架）
 *   art       美術交付狀態備註
 *   note      給三方看的備註（差異、待決策）
 *   skip      設 true 時跳過截圖（例：dead code、尚未實作）
 */

/** 共用步驟：關閉可能蓋住畫面的浮層 */
const dismissOverlay = [{ action: 'key', key: 'Escape' }]

export const screens = [
  // ── 1. 進入與認證 ────────────────────────────────────────────
  {
    id: 'W-01', name: '官網首頁', group: '進入與認證',
    route: '/', auth: 'out', waitFor: '#bottom-nav, header',
    note: 'APP 無對應（APP 是 P-01 品牌載入頁）',
  },
  {
    id: 'P-02', name: '登入 — 帳號密碼', group: '進入與認證',
    route: '/lobby/transactions', auth: 'out',
    steps: [{ action: 'click', text: '立即登入' }, { action: 'wait', ms: 500 }],
    waitFor: '#login-account',
    note: '官網為 Modal，APP 為獨立頁 LoginScreen.tsx。桌機 header 無登入鈕，入口在受保護頁的導引卡與手機底部導覽',
  },
  {
    id: 'M-09', name: '登入 — 手機驗證碼', group: '進入與認證',
    route: '/lobby/transactions', auth: 'out',
    steps: [
      { action: 'click', text: '立即登入' }, { action: 'wait', ms: 500 },
      { action: 'click', text: '手機驗證碼' }, { action: 'wait', ms: 300 },
    ],
    waitFor: '#login-phone',
    note: '⚠️ 官網寫死 ^09\\d{8}$ 無國碼；APP 有國碼選擇。後端 /system/dial-codes 已提供',
  },
  {
    id: 'M-05', name: '註冊', group: '進入與認證',
    route: '/lobby/transactions', auth: 'out',
    steps: [
      { action: 'click', text: '立即登入' }, { action: 'wait', ms: 500 },
      { action: 'click', text: '立即註冊' }, { action: 'wait', ms: 300 },
    ],
    waitFor: '#reg-account',
    note: '⚠️ 官網多了推薦碼（代理 6 碼／玩家 8 碼）與條款審閱，APP 無',
  },
  {
    id: 'W-02', name: '忘記密碼（4 步驟）', group: '進入與認證',
    route: '/lobby/transactions', auth: 'out',
    steps: [
      { action: 'click', text: '立即登入' }, { action: 'wait', ms: 500 },
      { action: 'click', text: '忘記密碼' }, { action: 'wait', ms: 300 },
    ],
    waitFor: '#recovery-account',
    note: '🔴 後端無公開復原端點，見 api-gap-analysis §1.3',
  },
  {
    id: 'M-04', name: '服務條款／隱私政策', group: '進入與認證',
    route: '/lobby/transactions', auth: 'out',
    steps: [
      { action: 'click', text: '立即登入' }, { action: 'wait', ms: 500 },
      { action: 'click', text: '會員條款' }, { action: 'wait', ms: 600 },
    ],
    waitFor: '.legal-overlay, [role="dialog"]',
    note: '三方一致；後台 /operator-setting/article 提供內容',
  },
  {
    id: 'W-03', name: '年齡驗證', group: '進入與認證',
    route: '/lobby/chat', auth: 'in', viewports: ['mobile'],
    steps: [{ action: 'clickFirst', selector: '[aria-label="進入遊戲"]' }, { action: 'wait', ms: 500 }],
    waitFor: '.age-gate-overlay',
    note: '⚠️ 官網由手機底部導覽「進入遊戲」鈕觸發（AppBottomNav.vue / FloatingPanels.vue），非點擊遊戲卡；APP 側 AgeGateModal 為死碼未引用',
  },

  // ── 2. 主畫面與導航 ──────────────────────────────────────────
  {
    id: 'P-03', name: '遊戲大廳主畫面', group: '主畫面與導航',
    route: '/lobby', auth: 'in', waitFor: '.lobby-page, main',
    note: '⚠️ 官網為換頁式路由，APP 為 Overlay 疊加（平台差異，合理）',
  },
  {
    id: 'L-01', name: '頂部標題列', group: '主畫面與導航',
    route: '/lobby', auth: 'in', viewports: ['desktop'], clip: 'header',
    note: '⚠️ 官網無 BUY／SALE 按鈕（APP L-07 有）',
  },
  {
    id: 'L-02', name: '底部導航（手機）', group: '主畫面與導航',
    route: '/lobby', auth: 'in', viewports: ['mobile'], clip: '#bottom-nav',
    note: '⚠️ APP 為 8 顆，官網為 5 顆，項目數需對齊',
  },
  {
    id: 'L-03', name: '側邊導覽（桌機）', group: '主畫面與導航',
    route: '/lobby', auth: 'in', viewports: ['desktop'], clip: '.lobby-sidebar, aside',
  },
  {
    id: 'L-06', name: '設置', group: '主畫面與導航',
    route: '/lobby/settings', auth: 'in', waitFor: '.settings-page',
    note: '語言／音效／法律／黑名單／登出，與 APP SettingsMenu 一致',
  },

  // ── 3. 遊戲大廳與啟動 ────────────────────────────────────────
  {
    id: 'L-04', name: '遊戲格子與分類', group: '遊戲大廳與啟動',
    route: '/lobby', auth: 'in', waitFor: '.game-grid, .lobby-page',
    note: '🔴 官網 5 類 30 款 vs APP 3 類 22 款；官網另有 siteContent.games 24 款並存需合併',
  },
  {
    id: 'W-04', name: '遊戲啟動彈窗（選幣別）', group: '遊戲大廳與啟動',
    route: '/lobby', auth: 'in',
    steps: [
      { action: 'hover', selector: '.game-card' },
      { action: 'clickFirst', selector: '.game-card-btn-play', force: true }, { action: 'wait', ms: 500 },
    ],
    waitFor: '.launch-overlay',
    note: '⚠️ 官網不顯示不可用原因、不檢查餘額；APP GameLaunchModal 有',
  },
  {
    id: 'P-04', name: '遊戲室', group: '遊戲大廳與啟動',
    route: null, auth: 'in', skip: true,
    note: '官網 GameView.vue 為 iframe example.com 佔位，兩邊皆佔位。含「完成流水」測試鈕（假機制）',
  },
  {
    id: 'W-05', name: '選座位', group: '遊戲大廳與啟動',
    route: null, auth: 'in', skip: true,
    note: '🔴 官網 SeatSelectionModal.vue 是 dead code（無人引用）。APP 有完整 GameSeat 模型、後台有 min_seat_vip_level — 待決策官網是否接',
  },

  // ── 4. 財務 ─────────────────────────────────────────────────
  {
    id: 'F-04', name: '銀行 — 儲值', group: '財務',
    route: '/lobby/bank', auth: 'in', waitFor: '.bank-page',
    note: '🔴 官網 NT$ + ATM／超商／信用卡；APP USD + IAP。後台兩種通道都有 — 待決策是否為刻意平台差異',
  },
  {
    id: 'F-04b', name: '銀行 — 優惠', group: '財務',
    route: '/lobby/bank?tab=offers', auth: 'in', waitFor: '.offers-grid',
  },
  {
    id: 'F-04c', name: '保險箱 — 存取', group: '財務',
    route: '/lobby/vault', auth: 'in', waitFor: '.lobby-page',
    note: '兩前台都已把保險箱從銀行拆出，結構一致 ✅',
  },
  {
    id: 'F-04d', name: '保險箱 — 贈禮申請', group: '財務',
    route: '/lobby/vault?tab=transfer', auth: 'in', waitFor: '.lobby-page',
    note: '🔴 第一階段最大落差：官網雙向確認（申請→接受／拒絕／取消／168h 逾期），APP 直接轉帳',
  },
  {
    id: 'F-04e', name: '保險箱 — 贈禮申請列表', group: '財務',
    route: '/lobby/vault?tab=transfer', auth: 'in',
    steps: [{ action: 'wait', ms: 600 }, { action: 'scrollTo', selector: '[aria-label="贈禮申請篩選"]' }],
    waitFor: '[aria-label="贈禮申請篩選"]',
    note: 'APP 無此畫面。費率快照凍結於 GiftRequest.feeRate',
  },
  {
    id: 'W-06', name: '兌換（金↔銀）', group: '財務',
    route: '/lobby/exchange', auth: 'in', waitFor: '.lobby-page',
    note: '常數三方一致：1:100、銀換金需 100 倍數、手續費 0 ✅',
  },
  {
    id: 'W-07', name: '交易紀錄', group: '財務',
    route: '/lobby/transactions', auth: 'in', waitFor: '.transactions-page',
    note: '⚠️ 交易類型 enum 三方全不同（官網 6 種／APP 10 種／後台 10 種），需統一。位置也不同（APP 在銀行分頁內）',
  },

  // ── 5. 每日任務／活動／排行榜 ─────────────────────────────────
  {
    id: 'F-02', name: '每日簽到', group: '任務與活動',
    route: '/lobby/daily', auth: 'in', waitFor: '.lobby-page',
    note: '✅ 三方完全一致：里程碑 5/7/25/30 金幣、10 天 10,000,000 銅幣、15 天銀卡、20 天金卡、補簽 100',
  },
  {
    id: 'F-02b', name: '活動列表', group: '任務與活動',
    route: '/lobby/events', auth: 'in', waitFor: '.section-title',
    note: '⚠️ 分類維度不同（官網 active／upcoming／ended vs APP sale／tournament／vip）；官網無報名狀態',
  },
  {
    id: 'F-02c', name: '排行榜（三榜）', group: '任務與活動',
    route: '/lobby/leaderboard', auth: 'in', waitFor: '.section-title',
    note: '✅ 三榜一致（倍數／贏分／富豪）；⚠️ 更新時間官網為本地假計時，需 server updatedAt',
  },

  // ── 6. 獎勵卡 ────────────────────────────────────────────────
  {
    id: 'F-05', name: '獎勵卡', group: '獎勵卡',
    route: '/lobby/gifts', auth: 'in', waitFor: '.lobby-page',
    note: '⚠️ 命名混亂需統一（文件「禮物 Gifts」／UI「獎勵卡」／後台 BonusCard）。🔴 流水累積兩前台都是測試鈕假機制',
  },

  // ── 7. 信箱 ──────────────────────────────────────────────────
  {
    id: 'F-03', name: '信箱 — 營運公告', group: '信箱',
    route: '/lobby/inbox', auth: 'in', waitFor: '.lobby-page',
    note: '⚠️ 官網無批次操作、無未讀徽章消費者；三方分類 enum 不同',
  },
  {
    id: 'F-03b', name: '信箱 — 系統通知', group: '信箱',
    route: '/lobby/inbox', auth: 'in',
    steps: [{ action: 'click', text: '系統通知' }, { action: 'wait', ms: 300 }],
    waitFor: '.lobby-page',
  },

  // ── 8. 聊天／社交 ────────────────────────────────────────────
  {
    id: 'F-01', name: '聊天 — 世界頻道', group: '聊天與社交',
    route: '/lobby/chat?channel=world', auth: 'in', waitFor: '.lobby-page',
    note: '✅ 三頻道一致；⚠️ 官網無 Emoji 選擇器、無 M-07 自動傳送',
  },
  {
    id: 'F-01b', name: '聊天 — 私人頻道', group: '聊天與社交',
    route: '/lobby/chat?channel=private', auth: 'in', waitFor: '.lobby-page',
    note: '⚠️ 官網私訊無附件選單（APP 有遊戲點數→贈禮）',
  },
  {
    id: 'F-01c', name: '聊天 — 客服頻道／工單', group: '聊天與社交',
    route: '/lobby/chat?channel=support', auth: 'in', waitFor: '.lobby-page',
    note: '🔴 官網最完整（工單狀態機、上限、7 種分類），APP 左欄是空殼落後兩級',
  },
  {
    id: 'M-08', name: '玩家資料卡', group: '聊天與社交',
    route: '/lobby/chat?channel=world', auth: 'in',
    steps: [
      { action: 'wait', ms: 600 },
      { action: 'clickFirst', selector: '.player-list-trigger' }, { action: 'wait', ms: 600 },
      { action: 'clickFirst', selector: '.roster-list .player-profile' }, { action: 'wait', ms: 700 },
    ],
    waitFor: '.modal-overlay [role="dialog"], [role="dialog"]',
    note: '✅ 三方一致：私訊／送禮／檢舉／加好友／黑名單',
  },
  {
    id: 'W-08', name: '檢舉玩家', group: '聊天與社交',
    route: null, auth: 'in', skip: true,
    note: '⚠️ 官網 5 個中文理由硬編，需改 reason code。截圖需由玩家卡開啟後補拍',
  },
  {
    id: 'W-09', name: '客服中心（獨立頁）', group: '聊天與社交',
    route: '/lobby/support', auth: 'in', waitFor: '.section-title',
  },

  // ── 9. 個人資料 ──────────────────────────────────────────────
  {
    id: 'M-01', name: '個人資料', group: '個人資料',
    route: '/lobby/member', auth: 'in', waitFor: '.member-sections',
    note: '🔴 兩前台都可自由改 email，後台規則為「email 有值即鎖定」',
  },
  {
    id: 'M-01b', name: '帳號綁定', group: '個人資料',
    route: '/lobby/member', auth: 'in',
    steps: [{ action: 'click', text: '帳號綁定' }, { action: 'wait', ms: 300 }],
    waitFor: '.member-sections',
    note: '⚠️ 兩前台都無「最後一個綁定且無密碼則拒絕」的錯誤處理',
  },
  {
    id: 'M-01c', name: 'VIP 等級', group: '個人資料',
    route: '/lobby/member', auth: 'in',
    steps: [{ action: 'click', text: 'VIP 等級' }, { action: 'wait', ms: 300 }],
    waitFor: '.member-sections',
    note: '🔴 官網只有文案字串，APP 與後台都有結構化門檻（儲值 AND 投注）— 官網最弱，需補',
  },
  {
    id: 'M-01d', name: '遊戲紀錄', group: '個人資料',
    route: '/lobby/member', auth: 'in',
    steps: [{ action: 'click', text: '遊戲紀錄' }, { action: 'wait', ms: 300 }],
    waitFor: '.member-sections',
  },
  {
    id: 'W-10', name: '頭像選擇', group: '個人資料',
    route: '/lobby/member', auth: 'in',
    steps: [{ action: 'clickFirst', selector: '[aria-label="更換頭像"]' }, { action: 'wait', ms: 400 }],
    waitFor: '.avatar-picker',
    note: '🔴 三方全不同：官網 12 emoji + VIP5 解鎖 / APP 20 款圖片 / 後台 /system/default-avatars + 上傳',
  },

  // ── 10. 官網公開頁（APP 無對應）───────────────────────────────
  {
    id: 'W-11', name: '活動頁（公開）', group: '官網公開頁',
    route: '/events', auth: 'out', waitFor: 'main, .page',
  },
  {
    id: 'W-12', name: '排行榜（公開）', group: '官網公開頁',
    route: '/leaderboard', auth: 'out', waitFor: 'main, .page',
  },
  {
    id: 'W-13', name: '新手教學／APP 下載', group: '官網公開頁',
    route: '/tutorial', auth: 'out', waitFor: 'main, .page',
  },
  {
    id: 'W-14', name: '儲值（公開頁）', group: '官網公開頁',
    route: '/deposit', auth: 'out', waitFor: 'main, .page',
  },
  {
    id: 'W-15', name: '客服（公開頁）', group: '官網公開頁',
    route: '/support', auth: 'out', waitFor: 'main, .page',
  },
  {
    id: 'W-16', name: '會員中心（公開頁）', group: '官網公開頁',
    route: '/member', auth: 'out', waitFor: 'main, .page',
  },
  {
    id: 'W-17', name: '未登入導引（以交易紀錄為例）', group: '官網公開頁',
    route: '/lobby/transactions', auth: 'out', waitFor: '.card-purple',
    note: '所有需登入的大廳頁共用同一種未登入卡片樣式，美術只需出一套',
  },
]

export const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
}

export const groups = [
  '進入與認證',
  '主畫面與導航',
  '遊戲大廳與啟動',
  '財務',
  '任務與活動',
  '獎勵卡',
  '信箱',
  '聊天與社交',
  '個人資料',
  '官網公開頁',
]
