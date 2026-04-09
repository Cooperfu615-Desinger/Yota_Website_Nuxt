export type LeaderboardTabKey = 'win' | 'multi' | 'event'
export type EventStatus = 'active' | 'upcoming' | 'ended'
export type FaqCategory = 'account' | 'deposit' | 'game' | 'install'
export type MemberTab = 'profile' | 'history' | 'vip' | 'redeem'

export interface HomepageQuickLink {
  key: 'deposit' | 'events' | 'leaderboard' | 'tutorial'
  to: string
  label: string
  color: string
}

export interface BannerSlide {
  ariaLabel: string
  imageAlt: string
  background: string
  imageSrc?: string
  mobileImageSrc?: string
  targetUrl?: string
}

export interface NewsItem {
  type: 'activity' | 'system'
  label: string
  title: string
  time: string
}

export interface LeaderboardItem {
  rank: number
  name: string
  amount: string
  game: string
  time?: string
  color?: string
}

export interface EventItem {
  id: number
  title: string
  subtitle: string
  status: EventStatus
  endDate: string
  prize: string
  gradient: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface VipLevel {
  level: number
  name: string
  color: string
  limit: string
  benefits: string[]
}

export interface HistoryItem {
  date: string
  game: string
  result: string
  positive: boolean
}

export interface FeaturedEventCard {
  to: string
  status: string
  title: string
  subtitle: string
  background: string
}

export interface GameItem {
  name: string
  desc: string
  badge: string | null
  rtp: string
  color: string
}

export interface LeaderboardTab {
  key: LeaderboardTabKey
  label: string
  items: LeaderboardItem[]
  top3: LeaderboardItem[]
  rest: LeaderboardItem[]
}

const winLeaderboardTop3 = [
  { rank: 1, name: '玩家***旺', amount: 'NT$2,580,000', game: '老虎機', time: '最近活躍', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***福', amount: 'NT$1,820,000', game: '百家樂', time: '3小時前', color: '#C0C0C0' },
  { rank: 3, name: '玩家***星', amount: 'NT$960,000', game: '老虎機', time: '1天前', color: '#CD7F32' },
] satisfies LeaderboardItem[]

const multiLeaderboardTop3 = [
  { rank: 1, name: '玩家***龍', amount: '×2,560 倍', game: '水果老虎機', time: '5分鐘前', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***鳳', amount: '×1,888 倍', game: '老虎機', time: '2小時前', color: '#C0C0C0' },
  { rank: 3, name: '玩家***虎', amount: '×1,280 倍', game: '捕魚機', time: '4小時前', color: '#CD7F32' },
] satisfies LeaderboardItem[]

const eventLeaderboardTop3 = [
  { rank: 1, name: '玩家***王', amount: '6,280 分', game: '百萬大獎賽', time: '最近活躍', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***侯', amount: '5,990 分', game: '百萬大獎賽', time: '1小時前', color: '#C0C0C0' },
  { rank: 3, name: '玩家***將', amount: '5,560 分', game: '百萬大獎賽', time: '3小時前', color: '#CD7F32' },
] satisfies LeaderboardItem[]

const winLeaderboardRest = [
  { rank: 4, name: '玩家***財', amount: 'NT$800,000', game: '老虎機' },
  { rank: 5, name: '玩家***福', amount: 'NT$720,000', game: '百家樂' },
  { rank: 6, name: '玩家***祿', amount: 'NT$640,000', game: '捕魚' },
  { rank: 7, name: '玩家***壽', amount: 'NT$560,000', game: '老虎機' },
  { rank: 8, name: '玩家***喜', amount: 'NT$480,000', game: '百家樂' },
  { rank: 9, name: '玩家***吉', amount: 'NT$400,000', game: '老虎機' },
  { rank: 10, name: '玩家***順', amount: 'NT$320,000', game: '捕魚' },
] satisfies LeaderboardItem[]

const winLeaderboardPreview = [...winLeaderboardTop3, ...winLeaderboardRest.slice(0, 2)] satisfies LeaderboardItem[]

const multiLeaderboardRest = [
  { rank: 4, name: '玩家***風', amount: '×1,100 倍', game: '老虎機' },
  { rank: 5, name: '玩家***雲', amount: '×1,000 倍', game: '捕魚機' },
  { rank: 6, name: '玩家***雷', amount: '×900 倍', game: '老虎機' },
  { rank: 7, name: '玩家***電', amount: '×800 倍', game: '百家樂' },
  { rank: 8, name: '玩家***水', amount: '×700 倍', game: '老虎機' },
  { rank: 9, name: '玩家***火', amount: '×600 倍', game: '捕魚' },
  { rank: 10, name: '玩家***土', amount: '×500 倍', game: '老虎機' },
] satisfies LeaderboardItem[]

const multiLeaderboardPreview = [...multiLeaderboardTop3, ...multiLeaderboardRest.slice(0, 2)] satisfies LeaderboardItem[]

const eventLeaderboardRest = [
  { rank: 4, name: '玩家***相', amount: '5,200 分', game: '百萬大獎賽' },
  { rank: 5, name: '玩家***士', amount: '4,900 分', game: '百萬大獎賽' },
  { rank: 6, name: '玩家***兵', amount: '4,600 分', game: '百萬大獎賽' },
  { rank: 7, name: '玩家***車', amount: '4,300 分', game: '百萬大獎賽' },
  { rank: 8, name: '玩家***馬', amount: '4,000 分', game: '百萬大獎賽' },
  { rank: 9, name: '玩家***砲', amount: '3,700 分', game: '百萬大獎賽' },
  { rank: 10, name: '玩家***卒', amount: '3,400 分', game: '百萬大獎賽' },
] satisfies LeaderboardItem[]

const eventLeaderboardPreview = [...eventLeaderboardTop3, ...eventLeaderboardRest.slice(0, 2)] satisfies LeaderboardItem[]

export const siteContent = {
  marqueeAnnouncements: [
    { type: 'system', text: '【系統公告】官網改版上線，體驗全新遊戲大廳！' },
    { type: 'win', text: '🎉 恭喜 <b>玩家王**</b> 贏得 <b style="color:var(--color-gold);">NT$88,888</b>' },
    { type: 'system', text: '【防詐騙】官方不會要求玩家提供帳號密碼，請提高警覺' },
    { type: 'win', text: '🎉 恭喜 <b>玩家陳**</b> 單局倍率高達 <b style="color:var(--color-gold);">2,560 倍！</b>' },
    { type: 'system', text: '【維護公告】每日 05:00–05:30 例行維護，請妥善安排遊戲時間' },
    { type: 'win', text: '🎉 恭喜 <b>玩家Lin**</b> 贏得 <b style="color:var(--color-gold);">NT$128,000</b>' },
  ],
  bannerSlides: [
    {
      ariaLabel: '第1張，首頁主視覺 Banner',
      imageAlt: '巨亨 ONLINE 首頁主視覺 Banner',
      background: 'linear-gradient(135deg, #1a003a 0%, #3B0764 40%, #6B21A8 100%)',
    },
    {
      ariaLabel: '第2張，活動 Banner',
      imageAlt: '巨亨 ONLINE 活動宣傳 Banner',
      background: 'linear-gradient(135deg, #1a0a00 0%, #7C2D12 50%, #1a003a 100%)',
    },
    {
      ariaLabel: '第3張，排行榜 Banner',
      imageAlt: '巨亨 ONLINE 排行榜宣傳 Banner',
      background: 'linear-gradient(135deg, #0a1a00 0%, #166534 50%, #1a003a 100%)',
    },
    {
      ariaLabel: '第4張，APP Banner',
      imageAlt: '巨亨 ONLINE APP 下載 Banner',
      background: 'linear-gradient(135deg, #1a003a 0%, #0F0020 50%, #1C0A3A 100%)',
    },
  ] satisfies BannerSlide[],
  homepage: {
    quickLinks: [
      { key: 'deposit', to: '/deposit', label: '儲值', color: 'var(--color-gold)' },
      { key: 'events', to: '/events', label: '活動', color: '#f87171' },
      { key: 'leaderboard', to: '/leaderboard', label: '排行榜', color: '#4ade80' },
      { key: 'tutorial', to: '/tutorial', label: '教學', color: 'var(--color-purple-glow)' },
    ] satisfies HomepageQuickLink[],
    news: [
      { type: 'activity', label: '活動', title: '百萬排行榜決賽倒數中！最後衝刺機會不容錯過', time: '1小時前' },
      { type: 'system', label: '公告', title: '系統維護公告：2024/01/15 凌晨 05:00–05:30', time: '3小時前' },
      { type: 'activity', label: '活動', title: '新手首儲禮包升級！最高獲得 5,000 點額外贈點', time: '昨天' },
    ] satisfies NewsItem[],
    featuredEvents: [
      { to: '/events', status: '進行中', title: '百萬大獎賽', subtitle: '獎金池 NT$1,280,000', background: 'linear-gradient(135deg,#1a003a,#7C3AED)' },
      { to: '/events', status: '長期活動', title: '新手首儲 +100%', subtitle: '首次儲值即享雙倍點數', background: 'linear-gradient(135deg,#1a0a00,#D97706)' },
      { to: '/tutorial', status: 'APP 限定', title: '新手下載禮', subtitle: '下載 APP 即送 $50 體驗金', background: 'linear-gradient(135deg,#042f4b,#0369a1)' },
    ] satisfies FeaturedEventCard[],
  },
  games: [
    { name: '水果老虎機', desc: '經典水果符號，多線賠率', badge: '熱門', rtp: '96.5%', color: '#F5C842' },
    { name: '招財貓百家樂', desc: '亞洲最受歡迎桌遊', badge: '新上線', rtp: '98.9%', color: '#60A5FA' },
    { name: '海洋捕魚機', desc: '射擊系遊戲，越大越賺', badge: null, rtp: '95.8%', color: '#4ade80' },
    { name: '麻將胡了', desc: '麻將主題老虎機', badge: null, rtp: '96.2%', color: '#F87171' },
    { name: '神龍傳奇', desc: '亞洲神話主題大獎機', badge: '熱門', rtp: '95.5%', color: '#A855F7' },
    { name: '魚蝦蟹', desc: '傳統骰子遊戲，簡單好玩', badge: null, rtp: '97.1%', color: '#FBBF24' },
  ] satisfies GameItem[],
  leaderboard: {
    tabs: [
      {
        key: 'win',
        label: '總贏分',
        items: winLeaderboardPreview,
        top3: winLeaderboardTop3,
        rest: winLeaderboardRest,
      },
      {
        key: 'multi',
        label: '倍率榜',
        items: multiLeaderboardPreview,
        top3: multiLeaderboardTop3,
        rest: multiLeaderboardRest,
      },
      {
        key: 'event',
        label: '活動榜',
        items: eventLeaderboardPreview,
        top3: eventLeaderboardTop3,
        rest: eventLeaderboardRest,
      },
    ] satisfies LeaderboardTab[],
  },
  events: [
    { id: 1, title: '百萬大獎賽', subtitle: '累積積分衝頂，贏取百萬獎金', status: 'active', endDate: '2026/12/31', prize: 'NT$1,280,000', gradient: 'linear-gradient(135deg,#1a003a,#7C3AED)' },
    { id: 2, title: '新手首儲禮', subtitle: '首次儲值享最高 100% 加碼', status: 'active', endDate: '長期', prize: '+100%', gradient: 'linear-gradient(135deg,#1a0a00,#D97706)' },
    { id: 3, title: '每日簽到獎', subtitle: '連續簽到 7 天，累積豐厚獎勵', status: 'active', endDate: '長期', prize: '每日點數', gradient: 'linear-gradient(135deg,#0a1a00,#166534)' },
    { id: 4, title: '春節限定活動', subtitle: '農曆新年特別回饋，限時限量', status: 'upcoming', endDate: '2026/02/10', prize: 'NT$500,000', gradient: 'linear-gradient(135deg,#2d0a0a,#991b1b)' },
    { id: 5, title: '情人節特別賽', subtitle: '雙人對戰，贏取情侶大禮包', status: 'upcoming', endDate: '2026/02/14', prize: '神秘禮物', gradient: 'linear-gradient(135deg,#1a003a,#be185d)' },
    { id: 6, title: '跨年倒數賽', subtitle: '2025 年倒數特別活動（已結束）', status: 'ended', endDate: '2025/01/01', prize: 'NT$800,000', gradient: 'linear-gradient(135deg,#1a1a1a,#374151)' },
  ] satisfies EventItem[],
  faq: {
    categories: [
      { key: 'account' as FaqCategory, label: '帳號相關' },
      { key: 'deposit' as FaqCategory, label: '儲值問題' },
      { key: 'game' as FaqCategory, label: '遊戲問題' },
      { key: 'install' as FaqCategory, label: '安裝問題' },
    ],
    items: {
      account: [
        { q: '忘記帳號密碼怎麼辦？', a: '您可以透過手機號碼驗證重設密碼。請點選登入頁面的「忘記密碼」，輸入您的手機號碼，收到驗證碼後即可設定新密碼。' },
        { q: '如何更換手機號碼？', a: '請聯繫客服提出申請，需提供帳號驗證資訊進行身份確認。為保護您的帳號安全，此操作需要人工審核。' },
        { q: '帳號被停用了怎麼辦？', a: '帳號停用可能因違反使用條款或異常活動所致。請聯繫客服說明情況，我們的客服人員將協助您處理。' },
        { q: '如何修改個人資料？', a: '登入後前往「會員專區」，點選「個人資料」即可修改暱稱、頭像等資訊。基本資料（真實姓名、身分證）修改需聯繫客服。' },
      ] satisfies FaqItem[],
      deposit: [
        { q: '儲值後點數沒有到帳？', a: '儲值完成後通常在 5 分鐘內到帳。若超過 30 分鐘仍未到帳，請保留儲值證明並聯繫客服。不同支付方式的到帳時間可能有所不同。' },
        { q: '支援哪些付款方式？', a: '目前支援：信用卡（Visa/MasterCard）、ATM 轉帳、超商代碼繳費（7-11/全家/萊爾富/OK超商）、MyCard、GASH、FunPay、iWin 點數卡。' },
        { q: '儲值有上下限嗎？', a: '最低儲值金額為 NT$300，每日最高儲值上限依 VIP 等級不同：一般玩家 NT$50,000 / VIP3 NT$200,000 / VIP6 無上限。' },
        { q: '如何申請提款？', a: '提款需完成身份認證，登入後前往「會員專區」→「申請提款」，填寫銀行帳戶資訊。審核時間約 1-3 個工作天。' },
      ] satisfies FaqItem[],
      game: [
        { q: '遊戲載入失敗怎麼辦？', a: '請先確認網路連線是否穩定。若使用 iOS 設備，請確保已完成信任設定。建議清除瀏覽器快取後重試，或改用 APP 進行遊戲。' },
        { q: '遊戲過程中斷線怎麼辦？', a: '我們的系統會自動記錄您斷線前的遊戲狀態。重新連線後，您的資產不會有任何損失，遊戲紀錄也會完整保存。' },
        { q: '試玩模式與正式模式有何不同？', a: '試玩模式使用虛擬點數，不消耗真實餘額，適合熟悉遊戲規則。正式模式使用真實餘額，贏得的獎金可提款。' },
        { q: '遊戲公平性如何保障？', a: '我們所有遊戲均採用國際認證的 RNG（隨機數生成器），確保每局結果完全隨機公正。相關認證報告可在官網查詢。' },
      ] satisfies FaqItem[],
      install: [
        { q: 'iOS 設備無法安裝 APP？', a: '由於 App Store 審核限制，iOS 版本需透過企業憑證安裝。請至「新手教學」頁面，按照 iOS 安裝步驟操作，並完成「信任企業開發者」設定。' },
        { q: 'Android 安裝顯示「禁止安裝未知來源」？', a: '請至手機「設定」→「安全性」→ 開啟「允許安裝未知來源應用程式」。安裝完成後可選擇關閉此設定。' },
        { q: 'APP 更新後無法開啟？', a: '請先嘗試重新啟動手機，若問題仍存在，請解除安裝後重新從官網下載最新版本。您的帳號資料不會遺失。' },
        { q: 'APP 與網頁版有什麼差異？', a: 'APP 版本支援推播通知、離線下載、更流暢的遊戲體驗，以及獨家 APP 用戶優惠。整體功能與網頁版一致，建議優先使用 APP。' },
      ] satisfies FaqItem[],
    },
  },
  member: {
    defaultUser: {
      name: '玩家888',
      vip: 3,
      balance: 12580,
    },
    vipTargets: [0, 10000, 50000, 200000, 500000, 2000000],
    vipLevels: [
      { level: 1, name: 'VIP 1', color: '#CD7F32', limit: 'NT$50,000/日', benefits: ['每日簽到獎 ×1.2', '優先客服'] },
      { level: 2, name: 'VIP 2', color: '#C0C0C0', limit: 'NT$100,000/日', benefits: ['每日簽到獎 ×1.5', '專屬活動'] },
      { level: 3, name: 'VIP 3', color: '#F5C842', limit: 'NT$200,000/日', benefits: ['每日簽到獎 ×2.0', '生日禮金'] },
      { level: 4, name: 'VIP 4', color: '#60A5FA', limit: 'NT$500,000/日', benefits: ['每日簽到獎 ×3.0', '專屬包廂'] },
      { level: 5, name: 'VIP 5', color: '#A855F7', limit: '無上限', benefits: ['每日簽到獎 ×5.0', '專屬秘書'] },
      { level: 6, name: 'VIP 6', color: '#EC4899', limit: '無上限', benefits: ['無限簽到獎', '頂級禮遇'] },
    ] satisfies VipLevel[],
    historyItems: [
      { date: '2024/01/15 14:32', game: '老虎機 — 水果大豐收', result: '+NT$2,580', positive: true },
      { date: '2024/01/15 13:20', game: '百家樂', result: '-NT$500', positive: false },
      { date: '2024/01/14 22:15', game: '老虎機 — 招財貓', result: '+NT$1,200', positive: true },
      { date: '2024/01/14 20:08', game: '捕魚機', result: '+NT$380', positive: true },
      { date: '2024/01/14 18:55', game: '百家樂', result: '-NT$1,000', positive: false },
    ] satisfies HistoryItem[],
    tabs: [
      { key: 'profile' as MemberTab, label: '個人資料', icon: '👤' },
      { key: 'history' as MemberTab, label: '遊戲紀錄', icon: '📊' },
      { key: 'vip' as MemberTab, label: 'VIP 等級', icon: '👑' },
      { key: 'redeem' as MemberTab, label: '兌換碼', icon: '🎁' },
    ],
  },
} as const
