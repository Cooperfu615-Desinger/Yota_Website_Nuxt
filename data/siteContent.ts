export type LeaderboardTabKey = 'multi' | 'win' | 'wealth'

export interface CheckinMilestone {
  days: number
  reward: string
  directGoldAmount?: number
}

export interface DailyCheckinConfig {
  milestones: CheckinMilestone[]
  dailyRewards: number[]   // 金幣，index 0 = 第1天
  makeupCostPerDay: number // 補簽每天花費（金幣）
}
export type EventStatus = 'active' | 'upcoming' | 'ended'
export type FaqCategory = 'account' | 'deposit' | 'game' | 'install'
export type MemberTab = 'profile' | 'history' | 'vip' | 'redeem'

export type PlayerStatus = '在線' | '遊戲中' | '閒置'

export interface ChatMessage {
  id: number
  user: string
  avatar: string
  text: string
  time: string
  self?: boolean
}

export interface RecentGame {
  id: number
  name: string
  color: string
}

export interface ChatPlayerProfile {
  playerId: string
  account: string       // 中英文與數字，最多 20 個半形字元（中文字以 2 個計）；不含空格與特殊符號
  name: string
  avatar: string
  vip: number          // 0 = 無 VIP，不顯示徽章
  level: number
  status: PlayerStatus
  bio: string
  recentGames: RecentGame[]
  isFriend?: boolean
}

export interface OnlinePlayer extends ChatPlayerProfile {
  id: number
}

export interface PrivateConversation {
  id: number
  peer: ChatPlayerProfile
  unread: number
  messages: ChatMessage[]
}

export type SupportQuestionCategoryKey =
  | 'account'
  | 'deposit'
  | 'withdrawal'
  | 'game'
  | 'event'
  | 'vault'
  | 'report'

export interface SupportQuestionCategory {
  key: SupportQuestionCategoryKey
  label: string
  description: string
  icon: string
}

export type SupportTicketStatus = 'ongoing' | 'closed'

export interface SupportPlayerReportContext {
  playerId: string
  account: string
  name: string
  avatar: string
  reason: string
  detail: string
}

export interface SupportTicket {
  id: string
  categoryKey: SupportQuestionCategoryKey
  categoryLabel: string
  subject: string
  status: SupportTicketStatus
  createdAt: string
  updatedAt: string
  unread: number
  messages: ChatMessage[]
  reportContext?: SupportPlayerReportContext
}

export const supportQuestionCategories = [
  { key: 'account', label: '帳號問題', icon: '👤', description: '登入、註冊、帳號安全與個人資料' },
  { key: 'deposit', label: '儲值／付款', icon: '💳', description: '儲值方式、付款狀態與金幣入帳' },
  { key: 'withdrawal', label: '提款／審核', icon: '🧾', description: '提款申請、審核進度與退回原因' },
  { key: 'game', label: '遊戲／結算', icon: '🎮', description: '遊戲異常、下注紀錄與派彩結算' },
  { key: 'event', label: '活動／獎勵', icon: '🎁', description: '活動資格、任務進度與獎勵發放' },
  { key: 'vault', label: '保險箱／贈禮', icon: '🔐', description: '保險箱存取、贈禮申請與收受' },
  { key: 'report', label: '檢舉玩家', icon: '🛡️', description: '檢舉玩家行為或不當聊天內容' },
] as const satisfies readonly SupportQuestionCategory[]

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
  type: 'system' | 'announce' | 'promo' | 'notice'
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
  imageSrc?: string
  deposit?: boolean   // true = 儲值相關活動（顯示於銀行活動 Tab）
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
  rebate: string
  feeDiscount: string
  upgradeRequirement: string
  maintainRequirement: string
}

export interface HistoryItem {
  date: string
  game: string
  result: string
  positive: boolean
}

export interface FeaturedEventCard {
  to: string
  title: string
  imageSrc?: string   // 活動主視覺圖（優先顯示）
  background: string  // 無圖時的 fallback 漸層
}

export interface GameItem {
  key: string
  name: string
  desc: string
  badge: string | null
  rtp: string
  color: string
  category: string
  provider: string
  imageSrc?: string
  volatility?: string      // '低' | '中' | '高' | '極高'
  paylines?: string        // '20 線' | 'Megaways' | 'N/A'
  maxMultiplier?: string   // '5,000x' 等
}

export interface ShortcutGuide {
  key: 'ios' | 'android' | 'chrome' | 'safari'
  label: string
  platform: string
  browser: string
  note: string
  steps: string[]
}

export interface GameCategory {
  key: string
  label: string
  icon: string
}

export interface LobbyGameCategory {
  key: 'lobby' | 'all' | 'hot' | 'slots' | 'live' | 'fish' | 'cards' | 'latest'
  label: string
  icon: string
}

export interface LeaderboardTab {
  key: LeaderboardTabKey
  label: string
  items: LeaderboardItem[]
  top3: LeaderboardItem[]
  rest: LeaderboardItem[]
}

const winLeaderboardTop3 = [
  { rank: 1, name: '玩家***旺', amount: '2,580,000 金幣', game: '老虎機', time: '最近活躍', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***福', amount: '1,820,000 金幣', game: '百家樂', time: '3小時前', color: '#C0C0C0' },
  { rank: 3, name: '玩家***星', amount: '960,000 金幣', game: '老虎機', time: '1天前', color: '#CD7F32' },
] satisfies LeaderboardItem[]

const multiLeaderboardTop3 = [
  { rank: 1, name: '玩家***龍', amount: '×2,560 倍', game: '水果老虎機', time: '5分鐘前', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***鳳', amount: '×1,888 倍', game: '老虎機', time: '2小時前', color: '#C0C0C0' },
  { rank: 3, name: '玩家***虎', amount: '×1,280 倍', game: '捕魚機', time: '4小時前', color: '#CD7F32' },
] satisfies LeaderboardItem[]

const eventLeaderboardTop3 = [
  { rank: 1, name: '玩家***王', amount: '128,800,000 金幣', game: '總資產', time: '最近活躍', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***侯', amount: '96,600,000 金幣', game: '總資產', time: '1小時前', color: '#C0C0C0' },
  { rank: 3, name: '玩家***將', amount: '78,300,000 金幣', game: '總資產', time: '3小時前', color: '#CD7F32' },
] satisfies LeaderboardItem[]

const winLeaderboardRest = [
  { rank: 4, name: '玩家***財', amount: '800,000 金幣', game: '老虎機' },
  { rank: 5, name: '玩家***福', amount: '720,000 金幣', game: '百家樂' },
  { rank: 6, name: '玩家***祿', amount: '640,000 金幣', game: '捕魚' },
  { rank: 7, name: '玩家***壽', amount: '560,000 金幣', game: '老虎機' },
  { rank: 8, name: '玩家***喜', amount: '480,000 金幣', game: '百家樂' },
  { rank: 9, name: '玩家***吉', amount: '400,000 金幣', game: '老虎機' },
  { rank: 10, name: '玩家***順', amount: '320,000 金幣', game: '捕魚' },
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
  { rank: 4, name: '玩家***相', amount: '65,200,000 金幣', game: '總資產' },
  { rank: 5, name: '玩家***士', amount: '54,900,000 金幣', game: '總資產' },
  { rank: 6, name: '玩家***兵', amount: '46,600,000 金幣', game: '總資產' },
  { rank: 7, name: '玩家***車', amount: '39,300,000 金幣', game: '總資產' },
  { rank: 8, name: '玩家***馬', amount: '34,000,000 金幣', game: '總資產' },
  { rank: 9, name: '玩家***砲', amount: '29,700,000 金幣', game: '總資產' },
  { rank: 10, name: '玩家***卒', amount: '24,400,000 金幣', game: '總資產' },
] satisfies LeaderboardItem[]

const eventLeaderboardPreview = [...eventLeaderboardTop3, ...eventLeaderboardRest.slice(0, 2)] satisfies LeaderboardItem[]

export const siteContent = {
  marqueeAnnouncements: [
    { type: 'system', text: '【系統公告】官網改版上線，體驗全新遊戲大廳！' },
    { type: 'win', text: '🎉 恭喜 <b>玩家王**</b> 贏得 <b style="color:var(--color-gold);">88,888 金幣</b>' },
    { type: 'system', text: '【防詐騙】官方不會要求玩家提供帳號密碼，請提高警覺' },
    { type: 'win', text: '🎉 恭喜 <b>玩家陳**</b> 單局倍率高達 <b style="color:var(--color-gold);">2,560 倍！</b>' },
    { type: 'system', text: '【維護公告】每日 05:00–05:30 例行維護，請妥善安排遊戲時間' },
    { type: 'win', text: '🎉 恭喜 <b>玩家Lin**</b> 贏得 <b style="color:var(--color-gold);">128,000 金幣</b>' },
  ],
  bannerSlides: [
    {
      ariaLabel: '第1張，首頁主視覺 Banner',
      imageAlt: '巨亨 ONLINE 首頁主視覺 Banner',
      imageSrc: '/banner_001.avif',
      background: 'linear-gradient(135deg, #1a003a 0%, #3B0764 40%, #6B21A8 100%)',
    },
    {
      ariaLabel: '第2張，活動 Banner',
      imageAlt: '巨亨 ONLINE 活動宣傳 Banner',
      imageSrc: '/banner_002.avif',
      background: 'linear-gradient(135deg, #1a0a00 0%, #7C2D12 50%, #1a003a 100%)',
    },
    {
      ariaLabel: '第3張，排行榜 Banner',
      imageAlt: '巨亨 ONLINE 排行榜宣傳 Banner',
      imageSrc: '/banner_003.avif',
      background: 'linear-gradient(135deg, #0a1a00 0%, #166534 50%, #1a003a 100%)',
    },
    {
      ariaLabel: '第4張，APP Banner',
      imageAlt: '巨亨 ONLINE APP 下載 Banner',
      imageSrc: '/banner_004.avif',
      background: 'linear-gradient(135deg, #1a003a 0%, #0F0020 50%, #1C0A3A 100%)',
    },
    {
      ariaLabel: '第5張，Banner',
      imageAlt: '巨亨 ONLINE Banner',
      imageSrc: '/banner_005.avif',
      background: 'linear-gradient(135deg, #1a003a 0%, #3B0764 40%, #6B21A8 100%)',
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
      { type: 'system',   label: '系統', title: '排行榜最終倒數中！名次隨時洗牌，把握最後衝刺機會，全力搶分奪獎！', time: '1小時前' },
      { type: 'announce', label: '公告', title: '系統維護公告：2026/10/10 凌晨 05:00–06:30', time: '3小時前' },
      { type: 'promo',    label: '優惠', title: '排行榜決賽已進入關鍵時刻，名次隨時可能翻盤！活動期間完成指定條件可獲得高額獎勵', time: '19小時前' },
      { type: 'notice',   label: '通知', title: '最終排名爭奪戰全面開打！活動進入關鍵時刻，每一分積分都可能影響名次變動', time: '昨天' },
      { type: 'announce', label: '公告', title: '為提供更穩定且優質的服務體驗，系統將於指定時段進行維護作業，維護期間部分功能將暫停服務', time: '2026/02/10' },
    ] satisfies NewsItem[],
    featuredEvents: [
      { to: '/events',  title: '百萬大獎賽',   imageSrc: '/event_001.png', background: 'linear-gradient(135deg,#1a003a,#7C3AED)' },
      { to: '/events',  title: '春節限定活動', imageSrc: '/event_002.png', background: 'linear-gradient(135deg,#2d0a0a,#991b1b)' },
      { to: '/events',  title: '新手首儲禮',   imageSrc: '/event_003.png', background: 'linear-gradient(135deg,#1a0a00,#D97706)' },
    ] satisfies FeaturedEventCard[],
  },
  gameCategories: [
    { key: 'all',      label: '全部',   icon: '🎮' },
    { key: 'hot',      label: '熱門',   icon: '🔥' },
    { key: 'slots',    label: '老虎機', icon: '🎰' },
    { key: 'baccarat', label: '百家樂', icon: '🃏' },
    { key: 'fish',     label: '捕魚機', icon: '🐟' },
    { key: 'dice',     label: '骰子',   icon: '🎲' },
    { key: 'cards',    label: '棋牌',   icon: '♠️' },
  ] satisfies GameCategory[],
  lobbyGameCategories: [
    { key: 'lobby',  label: '大廳',   icon: '⌂' },
    { key: 'all',    label: '全部',   icon: '▦' },
    { key: 'hot',    label: '熱門',   icon: '●' },
    { key: 'slots',  label: '老虎機', icon: '◆' },
    { key: 'live',   label: '真人',   icon: '♛' },
    { key: 'fish',   label: '捕魚機', icon: '◌' },
    { key: 'cards',  label: '棋牌',   icon: '♠' },
    { key: 'latest', label: '最新',   icon: '★' },
  ] satisfies LobbyGameCategory[],
  games: [
    // ── 老虎機 ──
    { key: 'fruit-slots',     name: '水果老虎機',   desc: '經典水果符號，多線賠率',        badge: '熱門',  rtp: '96.5%', color: '#F5C842', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_001.avif', volatility: '中',  paylines: '20 線',     maxMultiplier: '5,000x'  },
    { key: 'dragon-legend',   name: '神龍傳奇',     desc: '亞洲神話主題大獎機',            badge: '熱門',  rtp: '95.5%', color: '#A855F7', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_002.avif', volatility: '高',  paylines: '25 線',     maxMultiplier: '8,888x'  },
    { key: 'lucky-cat-slots', name: '招財貓老虎機', desc: '招財主題，Free Spin 加倍',      badge: '新上線', rtp: '97.2%', color: '#60A5FA', category: 'slots',    provider: 'PG Soft',   imageSrc: '/hotgame_003.avif', volatility: '中',  paylines: '243 線',    maxMultiplier: '6,000x'  },
    { key: 'mahjong-wins',    name: '麻將胡了',     desc: '麻將主題老虎機',                badge: null,   rtp: '96.2%', color: '#F87171', category: 'slots',    provider: 'PG Soft',   imageSrc: '/hotgame_004.avif', volatility: '中',  paylines: '4,096 線',  maxMultiplier: '4,000x'  },
    { key: 'treasure-hunt',   name: '尋寶大冒險',   desc: '冒險主題，寶藏彩蛋多多',        badge: null,   rtp: '96.8%', color: '#4ade80', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_005.avif', volatility: '高',  paylines: '20 線',     maxMultiplier: '10,000x' },
    { key: 'golden-phoenix',  name: '金鳳凰',       desc: '東方神話，倍率驚人',            badge: '熱門',  rtp: '96.0%', color: '#FCD34D', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_006.avif', volatility: '極高', paylines: '50 線',    maxMultiplier: '20,000x' },
    { key: 'zeus-thunder',    name: '宙斯雷神',     desc: '西方神話主題，免費旋轉多',      badge: null,   rtp: '95.9%', color: '#93C5FD', category: 'slots',    provider: 'PG Soft',   imageSrc: '/hotgame_007.avif', volatility: '高',  paylines: '25 線',     maxMultiplier: '5,000x'  },
    { key: 'candy-blast',     name: '糖果爆爆樂',   desc: '甜蜜主題，Megaways 玩法',       badge: '新上線', rtp: '97.5%', color: '#FB7185', category: 'slots',    provider: 'PG Soft',   imageSrc: '/hotgame_008.avif', volatility: '高',  paylines: 'Megaways',  maxMultiplier: '15,000x' },
    // ── 百家樂 ──
    { key: 'lucky-cat-baccarat', name: '招財貓百家樂', desc: '亞洲最受歡迎桌遊',          badge: '新上線', rtp: '98.9%', color: '#60A5FA', category: 'baccarat', provider: 'Evolution', imageSrc: '/hotgame_009.avif', volatility: '低', paylines: 'N/A', maxMultiplier: '8x'   },
    { key: 'classic-baccarat',   name: '經典百家樂',   desc: '正宗六副牌，極速開牌',      badge: '熱門',  rtp: '98.9%', color: '#818CF8', category: 'baccarat', provider: 'Evolution', volatility: '低', paylines: 'N/A', maxMultiplier: '8x'   },
    { key: 'speed-baccarat',     name: '極速百家樂',   desc: '快速開牌，30 秒一局',       badge: null,   rtp: '98.9%', color: '#C4B5FD', category: 'baccarat', provider: 'Evolution', volatility: '低', paylines: 'N/A', maxMultiplier: '8x'   },
    { key: 'dragon-tiger',       name: '龍虎鬥',       desc: '簡單刺激，一張定輸贏',      badge: '熱門',  rtp: '96.3%', color: '#FCA5A5', category: 'baccarat', provider: 'JH Gaming', volatility: '低', paylines: 'N/A', maxMultiplier: '1x'   },
    // ── 捕魚機 ──
    { key: 'ocean-fish',     name: '海洋捕魚機', desc: '射擊系遊戲，越大越賺',            badge: null,   rtp: '95.8%', color: '#4ade80', category: 'fish',     provider: 'JH Gaming', volatility: '中',  paylines: 'N/A', maxMultiplier: '1,000x'  },
    { key: 'deep-sea',       name: '深海獵人',   desc: '深海 Boss，擊殺倍率高',           badge: '熱門',  rtp: '96.1%', color: '#22D3EE', category: 'fish',     provider: 'JH Gaming', volatility: '高',  paylines: 'N/A', maxMultiplier: '2,000x'  },
    { key: 'dragon-fish',    name: '龍宮捕魚',   desc: '神龍主題，有料必中',              badge: null,   rtp: '95.5%', color: '#38BDF8', category: 'fish',     provider: 'PG Soft',   volatility: '高',  paylines: 'N/A', maxMultiplier: '3,000x'  },
    { key: 'neon-fish',      name: '霓虹捕魚',   desc: '炫彩霓虹，特殊武器連鎖',         badge: '新上線', rtp: '96.4%', color: '#86EFAC', category: 'fish',     provider: 'PG Soft',   volatility: '中',  paylines: 'N/A', maxMultiplier: '1,500x'  },
    // ── 骰子 ──
    { key: 'fish-shrimp-crab', name: '魚蝦蟹',    desc: '傳統骰子遊戲，簡單好玩',        badge: null,   rtp: '97.1%', color: '#FBBF24', category: 'dice',     provider: 'JH Gaming', volatility: '低', paylines: 'N/A', maxMultiplier: '3x'    },
    { key: 'sic-bo',           name: '骰寶',      desc: '多種玩法，贏法多多',            badge: '熱門',  rtp: '97.0%', color: '#FDE68A', category: 'dice',     provider: 'JH Gaming', volatility: '中', paylines: 'N/A', maxMultiplier: '180x'  },
    { key: 'roulette',         name: '歐式輪盤',  desc: '歐洲經典，策略玩法',            badge: null,   rtp: '97.3%', color: '#6EE7B7', category: 'dice',     provider: 'Evolution', volatility: '中', paylines: 'N/A', maxMultiplier: '35x'   },
    { key: 'andar-bahar',      name: 'Andar Bahar', desc: '印度經典紙牌遊戲',           badge: '新上線', rtp: '97.1%', color: '#FCA5A5', category: 'dice',     provider: 'Evolution', volatility: '低', paylines: 'N/A', maxMultiplier: '90x'   },
    // ── 棋牌 ──
    { key: 'three-card',   name: '三公撲克',   desc: '三張牌決勝負，快速刺激',            badge: '熱門',  rtp: '96.7%', color: '#F472B6', category: 'cards',    provider: 'JH Gaming', volatility: '中', paylines: 'N/A', maxMultiplier: '40x'   },
    { key: 'texas-holdem', name: '德州撲克',   desc: '最經典的撲克遊戲',                 badge: null,   rtp: '97.5%', color: '#34D399', category: 'cards',    provider: 'JH Gaming', volatility: '高', paylines: 'N/A', maxMultiplier: '100x'  },
    { key: 'pai-gow',      name: '牌九',       desc: '傳統骨牌遊戲，策略深',             badge: null,   rtp: '97.2%', color: '#FCD34D', category: 'cards',    provider: 'JH Gaming', volatility: '低', paylines: 'N/A', maxMultiplier: '2x'    },
    { key: 'teen-patti',   name: 'Teen Patti', desc: '南亞最夯紙牌遊戲',                badge: '新上線', rtp: '96.9%', color: '#A78BFA', category: 'cards',    provider: 'Evolution', volatility: '中', paylines: 'N/A', maxMultiplier: '40x'   },
  ] satisfies GameItem[],
  shortcutGuides: [
    {
      key: 'ios',
      label: 'iOS',
      platform: 'iPhone / iPad',
      browser: 'Safari',
      note: 'iOS 16.4 之後部分第三方瀏覽器也可支援加入主畫面，但 Safari 是最穩定的教學路徑。',
      steps: [
        '使用 Safari 開啟巨亨ONLINE 官網。',
        '點擊 Safari 下方或上方的「分享」按鈕。',
        '在分享選單中找到「加入主畫面」。',
        '確認名稱為「巨亨ONLINE」。',
        '點擊「新增」，桌面就會出現捷徑圖示。',
      ],
    },
    {
      key: 'android',
      label: 'Android',
      platform: 'Android 手機 / 平板',
      browser: 'Chrome',
      note: '不同 Android 品牌與 Chrome 版本可能顯示「加到主畫面」或「安裝應用程式」。',
      steps: [
        '使用 Chrome 開啟巨亨ONLINE 官網。',
        '點擊右上角「更多」選單。',
        '點擊「加到主畫面」或「安裝應用程式」。',
        '確認名稱為「巨亨ONLINE」。',
        '點擊「新增」或「安裝」，主畫面就會出現捷徑。',
      ],
    },
    {
      key: 'chrome',
      label: 'Chrome',
      platform: 'Windows / Mac 電腦',
      browser: 'Chrome',
      note: '完成後可從桌面、Dock、開始選單或 Chrome 應用程式列表快速開啟。',
      steps: [
        '使用 Chrome 開啟巨亨ONLINE 官網。',
        '點擊右上角「更多」選單。',
        '選擇「投放、儲存與分享」。',
        '點擊「將頁面安裝為應用程式」或「建立捷徑」。',
        '確認名稱後點擊「安裝」或「建立」。',
        '完成後即可從系統捷徑快速進入網站。',
      ],
    },
    {
      key: 'safari',
      label: 'Safari',
      platform: 'Mac',
      browser: 'Safari',
      note: '此方式適用支援 Safari Web App 的 macOS 版本，舊版 Safari 可改用書籤或釘選分頁。',
      steps: [
        '使用 Safari 開啟巨亨ONLINE 官網。',
        '點擊工具列的「分享」按鈕。',
        '選擇「加入 Dock」。',
        '確認名稱為「巨亨ONLINE」。',
        '點擊「加入」，Dock 會出現網站捷徑。',
        '之後可像開啟 App 一樣從 Dock 快速進入網站。',
      ],
    },
  ] satisfies ShortcutGuide[],
  lobbyGames: [
    // ── 活動遊戲 eventgame × 6（badge: 活動）──
    { key: 'lobby-eventgame-001', name: '活動限定老虎機',   desc: '限時活動獨家遊戲',      badge: '活動',  rtp: '96.5%', color: '#F5C842', category: 'slots',    provider: 'JH Gaming', imageSrc: '/eventgame_001.avif' },
    { key: 'lobby-eventgame-002', name: '活動黃金轉盤',     desc: '活動期間倍率加成',      badge: '活動',  rtp: '96.8%', color: '#A855F7', category: 'slots',    provider: 'JH Gaming', imageSrc: '/eventgame_002.avif' },
    { key: 'lobby-eventgame-003', name: '節慶嘉年華',       desc: '節慶主題，好禮不斷',    badge: '活動',  rtp: '96.2%', color: '#F87171', category: 'slots',    provider: 'PG Soft',   imageSrc: '/eventgame_003.avif' },
    { key: 'lobby-eventgame-004', name: '活動霸主爭霸',     desc: '活動專屬大獎機',        badge: '活動',  rtp: '95.9%', color: '#4ade80', category: 'slots',    provider: 'PG Soft',   imageSrc: '/eventgame_004.avif' },
    { key: 'lobby-eventgame-005', name: '活動百家樂大賽',   desc: '活動限定百家樂賽事',    badge: '活動',  rtp: '98.9%', color: '#60A5FA', category: 'baccarat', provider: 'Evolution', imageSrc: '/eventgame_005.avif' },
    { key: 'lobby-eventgame-006', name: '活動財神降臨',     desc: '財神主題，活動加碼',    badge: '活動',  rtp: '96.4%', color: '#FCD34D', category: 'slots',    provider: 'JH Gaming', imageSrc: '/eventgame_006.avif' },
    // ── 新遊戲 newgame × 5（badge: 新上線）──
    { key: 'lobby-newgame-001',   name: '新星老虎機',       desc: '全新上線，首玩必試',    badge: '新上線', rtp: '97.2%', color: '#60A5FA', category: 'slots',    provider: 'PG Soft',   imageSrc: '/newgame_001.avif' },
    { key: 'lobby-newgame-002',   name: '新春大富翁',       desc: '新年主題，喜氣洋洋',    badge: '新上線', rtp: '96.8%', color: '#FB7185', category: 'slots',    provider: 'PG Soft',   imageSrc: '/newgame_002.avif' },
    { key: 'lobby-newgame-003',   name: '新世界冒險',       desc: '探索新大陸，贏取寶藏',  badge: '新上線', rtp: '97.0%', color: '#4ade80', category: 'slots',    provider: 'JH Gaming', imageSrc: '/newgame_003.avif' },
    { key: 'lobby-newgame-004',   name: '新星招財貓',       desc: '全新招財主題，好運不斷',badge: '新上線', rtp: '97.5%', color: '#FCD34D', category: 'slots',    provider: 'PG Soft',   imageSrc: '/newgame_004.avif' },
    { key: 'lobby-newgame-005',   name: '新式骰寶',         desc: '全新玩法，骰子新體驗',  badge: '新上線', rtp: '97.1%', color: '#FBBF24', category: 'dice',     provider: 'JH Gaming', imageSrc: '/newgame_005.avif' },
    // ── 熱門遊戲 hotgame × 9（badge: 熱門）──
    { key: 'lobby-hotgame-001',   name: '水果老虎機',       desc: '經典水果符號，多線賠率',badge: '熱門',  rtp: '96.5%', color: '#F5C842', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_001.avif' },
    { key: 'lobby-hotgame-002',   name: '神龍傳奇',         desc: '亞洲神話主題大獎機',    badge: '熱門',  rtp: '95.5%', color: '#A855F7', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_002.avif' },
    { key: 'lobby-hotgame-003',   name: '招財貓老虎機',     desc: 'Free Spin 加倍',        badge: '熱門',  rtp: '97.2%', color: '#60A5FA', category: 'slots',    provider: 'PG Soft',   imageSrc: '/hotgame_003.avif' },
    { key: 'lobby-hotgame-004',   name: '麻將胡了',         desc: '麻將主題老虎機',        badge: '熱門',  rtp: '96.2%', color: '#F87171', category: 'slots',    provider: 'PG Soft',   imageSrc: '/hotgame_004.avif' },
    { key: 'lobby-hotgame-005',   name: '尋寶大冒險',       desc: '冒險主題，寶藏彩蛋多',  badge: '熱門',  rtp: '96.8%', color: '#4ade80', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_005.avif' },
    { key: 'lobby-hotgame-006',   name: '金鳳凰',           desc: '東方神話，倍率驚人',    badge: '熱門',  rtp: '96.0%', color: '#FCD34D', category: 'slots',    provider: 'JH Gaming', imageSrc: '/hotgame_006.avif' },
    { key: 'lobby-hotgame-007',   name: '真人百家樂',       desc: '真人荷官，臨場感十足',  badge: '熱門',  rtp: '98.9%', color: '#818CF8', category: 'baccarat', provider: 'Evolution', imageSrc: '/hotgame_007.avif' },
    { key: 'lobby-hotgame-008',   name: '極速百家樂',       desc: '快速開牌，30秒一局',    badge: '熱門',  rtp: '98.9%', color: '#C4B5FD', category: 'baccarat', provider: 'Evolution', imageSrc: '/hotgame_008.avif' },
    { key: 'lobby-hotgame-009',   name: '龍虎鬥百家樂',     desc: '龍虎對決，一張定輸贏',  badge: '熱門',  rtp: '98.9%', color: '#60A5FA', category: 'baccarat', provider: 'Evolution', imageSrc: '/hotgame_009.avif' },
    // ── 一般遊戲 game × 10（badge: null）──
    { key: 'lobby-game-001',      name: '幸運轉輪',         desc: '簡單好玩，隨機大獎',    badge: null,   rtp: '96.3%', color: '#F472B6', category: 'slots',    provider: 'JH Gaming', imageSrc: '/game_001.avif' },
    { key: 'lobby-game-002',      name: '海底世界',         desc: '海洋主題，多重加碼',    badge: null,   rtp: '96.1%', color: '#22D3EE', category: 'slots',    provider: 'JH Gaming', imageSrc: '/game_002.avif' },
    { key: 'lobby-game-003',      name: '古埃及寶藏',       desc: '法老主題，神秘獎勵',    badge: null,   rtp: '96.7%', color: '#FCD34D', category: 'slots',    provider: 'PG Soft',   imageSrc: '/game_003.avif' },
    { key: 'lobby-game-004',      name: '叢林探險',         desc: '熱帶叢林，野生符號',    badge: null,   rtp: '96.4%', color: '#86EFAC', category: 'slots',    provider: 'PG Soft',   imageSrc: '/game_004.avif' },
    { key: 'lobby-game-005',      name: '星際爭霸',         desc: '太空主題，外星大獎',    badge: null,   rtp: '96.9%', color: '#93C5FD', category: 'slots',    provider: 'JH Gaming', imageSrc: '/game_005.avif' },
    { key: 'lobby-game-006',      name: '武士傳說',         desc: '日本武士主題，多倍率',  badge: null,   rtp: '96.6%', color: '#FCA5A5', category: 'slots',    provider: 'JH Gaming', imageSrc: '/game_006.avif' },
    { key: 'lobby-game-007',      name: '西部牛仔',         desc: '美西主題，槍林彈雨',    badge: null,   rtp: '96.2%', color: '#D97706', category: 'slots',    provider: 'PG Soft',   imageSrc: '/game_007.avif' },
    { key: 'lobby-game-008',      name: '骰子大師',         desc: '多種骰子玩法，策略致勝',badge: null,   rtp: '97.1%', color: '#FBBF24', category: 'dice',     provider: 'JH Gaming', imageSrc: '/game_008.avif' },
    { key: 'lobby-game-009',      name: '賽車大獎賽',       desc: '速度與激情，快速致富',  badge: null,   rtp: '96.8%', color: '#34D399', category: 'slots',    provider: 'JH Gaming', imageSrc: '/game_009.avif' },
    { key: 'lobby-game-010',      name: '歐式輪盤',         desc: '歐洲經典，策略玩法',    badge: null,   rtp: '97.3%', color: '#6EE7B7', category: 'dice',     provider: 'Evolution', imageSrc: '/game_010.avif' },
  ] satisfies GameItem[],
  leaderboard: {
    tabs: [
      {
        key: 'multi',
        label: '倍數榜',
        items: multiLeaderboardPreview,
        top3: multiLeaderboardTop3,
        rest: multiLeaderboardRest,
      },
      {
        key: 'win',
        label: '贏分榜',
        items: winLeaderboardPreview,
        top3: winLeaderboardTop3,
        rest: winLeaderboardRest,
      },
      {
        key: 'wealth',
        label: '富豪榜',
        items: eventLeaderboardPreview,
        top3: eventLeaderboardTop3,
        rest: eventLeaderboardRest,
      },
    ] satisfies LeaderboardTab[],
  },
  events: [
    { id: 1, title: '百萬大獎賽', subtitle: '累積積分衝頂，贏取百萬獎金', status: 'active', endDate: '2026/12/31', prize: '1,280,000 金幣', gradient: 'linear-gradient(135deg,#1a003a,#7C3AED)', imageSrc: '/event_01.avif' },
    { id: 2, title: '新手首儲禮', subtitle: '首次儲值享最高 100% 加碼', status: 'active', endDate: '長期', prize: '+100%', gradient: 'linear-gradient(135deg,#1a0a00,#D97706)', imageSrc: '/event_02.avif', deposit: true },
    { id: 3, title: '每日簽到獎', subtitle: '連續簽到 7 天，累積豐厚獎勵', status: 'active', endDate: '長期', prize: '每日點數', gradient: 'linear-gradient(135deg,#0a1a00,#166534)', imageSrc: '/event_03.avif' },
    { id: 4, title: '春節限定活動', subtitle: '農曆新年特別回饋，限時限量', status: 'upcoming', endDate: '2026/02/10', prize: '500,000 金幣', gradient: 'linear-gradient(135deg,#2d0a0a,#991b1b)', imageSrc: '/event_05.avif' },
    { id: 5, title: '情人節特別賽', subtitle: '雙人對戰，贏取情侶大禮包', status: 'upcoming', endDate: '2026/02/14', prize: '神秘禮物', gradient: 'linear-gradient(135deg,#1a003a,#be185d)', imageSrc: '/event_06.avif' },
    { id: 6, title: '跨年倒數賽', subtitle: '2025 年倒數特別活動（已結束）', status: 'ended', endDate: '2025/01/01', prize: '800,000 金幣', gradient: 'linear-gradient(135deg,#1a1a1a,#374151)', imageSrc: '/event_07.avif' },
    { id: 7, title: '每週儲值回饋', subtitle: '每週累積儲值，回饋最高 15% 點數', status: 'active', endDate: '長期', prize: '+15%', gradient: 'linear-gradient(135deg,#0a1a2d,#1d4ed8)', deposit: true },
    { id: 8, title: 'VIP 儲值加碼', subtitle: 'VIP 等級越高，儲值加碼越多', status: 'active', endDate: '長期', prize: '最高 +30%', gradient: 'linear-gradient(135deg,#2d0a2d,#9333ea)', deposit: true },
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
        { q: '忘記密碼怎麼辦？', a: '請點選登入彈窗的「忘記密碼」，先輸入帳號，再透過已綁定的手機號碼接收驗證碼並設定新密碼。未綁定手機的帳號可聯繫客服協助處理。' },
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
      id: 'P88888',
      account: 'Player88888',
      name: '玩家888',
      vip: 3,
      avatar: '👤',
      avatarId: 1,
      bio: '享受遊戲，也享受每一次漂亮的操作。',
      birthday: '1995-08-08',
      email: 'player888@example.com',
      phone: '0912***888',
      authProvider: 'account' as 'account' | 'guest' | 'phone' | 'facebook' | 'line' | 'apple' | 'google',
      accountBindings: {
        phone: true,
        facebook: false,
        line: false,
        apple: false,
        google: false,
      },
      balance: 10000000,
      silverBalance: 10000000,
      bronzeBalance: 10000000,
      vaultBalance: 0,
    },
    vipUpgrade: {
      deposit: { current: 32000, target: 45000 },
      wager:   { current: 1080000, target: 1400000 },
    },
    vipTargets: [0, 5000, 12000, 25000, 45000, 70000, 105000, 150000, 210000, 280000, 360000],
    vipLevels: [
      {
        level: 0,
        name: 'VIP 0',
        color: '#94A3B8',
        limit: '一般會員',
        benefits: ['返水 0%', '手續費減免 0%'],
        rebate: '0%',
        feeDiscount: '手續費減免 0%',
        upgradeRequirement: '完成註冊即可開通',
        maintainRequirement: '無保級條件',
      },
      {
        level: 1,
        name: 'VIP 1',
        color: '#CD7F32',
        limit: '入門會員',
        benefits: ['返水 0.2%', '手續費減免 1%'],
        rebate: '0.2%',
        feeDiscount: '手續費減免 1%',
        upgradeRequirement: '累積儲值 5,000 金幣，且累積投注 120,000 金幣',
        maintainRequirement: '每月有效投注 80,000 金幣，或月儲值 2,000 金幣',
      },
      {
        level: 2,
        name: 'VIP 2',
        color: '#C0C0C0',
        limit: '進階會員',
        benefits: ['返水 0.4%', '手續費減免 2%'],
        rebate: '0.4%',
        feeDiscount: '手續費減免 2%',
        upgradeRequirement: '累積儲值 12,000 金幣，且累積投注 350,000 金幣',
        maintainRequirement: '每月有效投注 160,000 金幣，或月儲值 5,000 金幣',
      },
      {
        level: 3,
        name: 'VIP 3',
        color: '#F5C842',
        limit: '黃金會員',
        benefits: ['返水 0.6%', '手續費減免 3%'],
        rebate: '0.6%',
        feeDiscount: '手續費減免 3%',
        upgradeRequirement: '累積儲值 25,000 金幣，且累積投注 800,000 金幣',
        maintainRequirement: '每月有效投注 320,000 金幣，或月儲值 12,000 金幣',
      },
      {
        level: 4,
        name: 'VIP 4',
        color: '#60A5FA',
        limit: '白金會員',
        benefits: ['返水 0.8%', '手續費減免 4%'],
        rebate: '0.8%',
        feeDiscount: '手續費減免 4%',
        upgradeRequirement: '累積儲值 45,000 金幣，且累積投注 1,400,000 金幣',
        maintainRequirement: '每月有效投注 560,000 金幣，或月儲值 22,000 金幣',
      },
      {
        level: 5,
        name: 'VIP 5',
        color: '#A855F7',
        limit: '鑽石會員',
        benefits: ['返水 1.0%', '手續費減免 5%'],
        rebate: '1.0%',
        feeDiscount: '手續費減免 5%',
        upgradeRequirement: '累積儲值 70,000 金幣，且累積投注 2,100,000 金幣',
        maintainRequirement: '每月有效投注 900,000 金幣，或月儲值 35,000 金幣',
      },
      {
        level: 6,
        name: 'VIP 6',
        color: '#EC4899',
        limit: '尊榮會員',
        benefits: ['返水 1.2%', '手續費減免 6%'],
        rebate: '1.2%',
        feeDiscount: '手續費減免 6%',
        upgradeRequirement: '累積儲值 105,000 金幣，且累積投注 3,000,000 金幣',
        maintainRequirement: '每月有效投注 1,300,000 金幣，或月儲值 50,000 金幣',
      },
      {
        level: 7,
        name: 'VIP 7',
        color: '#F472B6',
        limit: '菁英會員',
        benefits: ['返水 1.4%', '手續費減免 7%'],
        rebate: '1.4%',
        feeDiscount: '手續費減免 7%',
        upgradeRequirement: '累積儲值 150,000 金幣，且累積投注 4,200,000 金幣',
        maintainRequirement: '每月有效投注 1,800,000 金幣，或月儲值 75,000 金幣',
      },
      {
        level: 8,
        name: 'VIP 8',
        color: '#C084FC',
        limit: '星耀會員',
        benefits: ['返水 1.6%', '手續費減免 8%'],
        rebate: '1.6%',
        feeDiscount: '手續費減免 8%',
        upgradeRequirement: '累積儲值 210,000 金幣，且累積投注 5,600,000 金幣',
        maintainRequirement: '每月有效投注 2,400,000 金幣，或月儲值 105,000 金幣',
      },
      {
        level: 9,
        name: 'VIP 9',
        color: '#818CF8',
        limit: '傳奇會員',
        benefits: ['返水 1.8%', '手續費減免 9%'],
        rebate: '1.8%',
        feeDiscount: '手續費減免 9%',
        upgradeRequirement: '累積儲值 280,000 金幣，且累積投注 7,300,000 金幣',
        maintainRequirement: '每月有效投注 3,100,000 金幣，或月儲值 140,000 金幣',
      },
      {
        level: 10,
        name: 'VIP 10',
        color: '#F5C842',
        limit: '至尊會員',
        benefits: ['返水 2.0%', '手續費減免 10%'],
        rebate: '2.0%',
        feeDiscount: '手續費減免 10%',
        upgradeRequirement: '累積儲值 360,000 金幣，且累積投注 9,200,000 金幣',
        maintainRequirement: '每月有效投注 4,000,000 金幣，或月儲值 180,000 金幣',
      },
    ] satisfies VipLevel[],
    historyItems: [
      { date: '2024/01/15 14:32', game: '老虎機 — 水果大豐收', result: '+2,580 金幣', positive: true },
      { date: '2024/01/15 13:20', game: '百家樂', result: '-500 金幣', positive: false },
      { date: '2024/01/14 22:15', game: '老虎機 — 招財貓', result: '+1,200 金幣', positive: true },
      { date: '2024/01/14 20:08', game: '捕魚機', result: '+380 金幣', positive: true },
      { date: '2024/01/14 18:55', game: '百家樂', result: '-1,000 金幣', positive: false },
    ] satisfies HistoryItem[],
    tabs: [
      { key: 'profile' as MemberTab, label: '個人資料', icon: '👤' },
      { key: 'history' as MemberTab, label: '遊戲紀錄', icon: '📊' },
      { key: 'vip' as MemberTab, label: 'VIP 等級', icon: '👑' },
      { key: 'redeem' as MemberTab, label: '兌換碼', icon: '🎁' },
    ],
  },
  dailyCheckin: {
    milestones: [
      { days: 5,  reward: '100 金幣', directGoldAmount: 100 },
      { days: 7,  reward: '200 金幣', directGoldAmount: 200 },
      { days: 10, reward: '銅幣 10,000,000' },
      { days: 15, reward: '活動銀幣 10,000' },
      { days: 20, reward: '活動金幣 5,000' },
      { days: 25, reward: '3,500 金幣', directGoldAmount: 3_500 },
      { days: 30, reward: '8,888 金幣', directGoldAmount: 8_888 },
    ] satisfies CheckinMilestone[],
    // 每天簽到可獲得的金幣，共31天
    dailyRewards: [
      10, 15, 20, 15, 25,   //  1-5
      30, 20, 25, 30, 35,   //  6-10
      25, 40, 30, 35, 50,   // 11-15
      45, 40, 50, 55, 60,   // 16-20
      50, 55, 60, 65, 80,   // 21-25
      70, 75, 80, 90, 100,  // 26-30
      120,                   // 31
    ],
    makeupCostPerDay: 100,
  } satisfies DailyCheckinConfig,

  chat: {
    onlinePlayers: [
      {
        id: 1,
        playerId: 'P10001',
        account: 'Lucky88801',
        name: 'Lucky888',
        avatar: '🦁',
        vip: 5,
        level: 26,
        status: '在線',
        bio: '喜歡挑戰高倍數老虎機，看到活動榜就忍不住想衝一波。',
        recentGames: [
          { id: 1, name: 'Ace Blackjack', color: '#7f1d1d' },
          { id: 2, name: 'Gates of Olympus', color: '#581c87' },
          { id: 3, name: 'Shark Hunter', color: '#155e75' },
        ],
        isFriend: true,
      },
      {
        id: 2,
        playerId: 'P10002',
        account: 'DragonKing88',
        name: 'DragonKing',
        avatar: '🐉',
        vip: 3,
        level: 18,
        status: '遊戲中',
        bio: '百家樂連勝愛好者，最近正在研究短局節奏與下注控管。',
        recentGames: [
          { id: 1, name: '招財貓百家樂', color: '#1d4ed8' },
          { id: 2, name: 'Classic Baccarat', color: '#0f766e' },
          { id: 3, name: 'Speed Baccarat', color: '#7c2d12' },
        ],
      },
      {
        id: 3,
        playerId: 'P10003',
        account: 'StarPlayer09',
        name: 'StarPlayer',
        avatar: '⭐',
        vip: 0,
        level: 9,
        status: '在線',
        bio: '新手玩家，正在探索不同遊戲玩法，也歡迎一起交流。',
        recentGames: [
          { id: 1, name: '水果老虎機', color: '#b45309' },
          { id: 2, name: '麻將胡了', color: '#be123c' },
          { id: 3, name: '魚蝦蟹', color: '#4d7c0f' },
        ],
      },
      {
        id: 4,
        playerId: 'P10004',
        account: 'JokerAce14',
        name: 'JokerAce',
        avatar: '🃏',
        vip: 2,
        level: 14,
        status: '閒置',
        bio: '偏愛撲克與桌遊，也常在世界頻道分享活動情報。',
        recentGames: [
          { id: 1, name: '德州撲克', color: '#374151' },
          { id: 2, name: 'Ace Blackjack', color: '#7f1d1d' },
          { id: 3, name: 'Teen Patti', color: '#6b21a8' },
        ],
      },
      {
        id: 5,
        playerId: 'P10005',
        account: '金幣王888',
        name: '金幣王',
        avatar: '👑',
        vip: 4,
        level: 31,
        status: '在線',
        bio: '熱衷排行榜與儲值活動，最愛研究獎金池累積節奏。',
        recentGames: [
          { id: 1, name: '神龍傳奇', color: '#581c87' },
          { id: 2, name: '百萬大獎賽', color: '#92400e' },
          { id: 3, name: '海洋捕魚機', color: '#155e75' },
        ],
      },
      {
        id: 6,
        playerId: 'P10006',
        account: '幸運貓12',
        name: '幸運貓',
        avatar: '🐱',
        vip: 1,
        level: 12,
        status: '遊戲中',
        bio: '喜歡輕鬆聊天與捕魚遊戲，常常分享小額連勝心得。',
        recentGames: [
          { id: 1, name: '海洋捕魚機', color: '#155e75' },
          { id: 2, name: '魚蝦蟹', color: '#4d7c0f' },
          { id: 3, name: '水果老虎機', color: '#b45309' },
        ],
      },
      {
        id: 7,
        playerId: 'P10007',
        account: '賭神再臨7',
        name: '賭神再臨',
        avatar: '🎲',
        vip: 0,
        level: 7,
        status: '在線',
        bio: '剛加入不久，正在熟悉活動規則與遊戲大廳。',
        recentGames: [
          { id: 1, name: 'Classic Baccarat', color: '#0f766e' },
          { id: 2, name: '麻將胡了', color: '#be123c' },
          { id: 3, name: '魚蝦蟹', color: '#4d7c0f' },
        ],
      },
      {
        id: 8,
        playerId: 'P10008',
        account: '富貴吉祥88',
        name: '富貴吉祥',
        avatar: '🧧',
        vip: 3,
        level: 22,
        status: '在線',
        bio: '活動型玩家，喜歡揪團挑戰排行榜與每日任務。',
        recentGames: [
          { id: 1, name: '百萬大獎賽', color: '#92400e' },
          { id: 2, name: 'Gates of Olympus', color: '#581c87' },
          { id: 3, name: 'Speed Baccarat', color: '#7c2d12' },
        ],
        isFriend: true,
      },
    ] satisfies OnlinePlayer[],
    worldMessages: [
      { id: 1, user: 'Lucky888',   avatar: '🦁', text: '大家好！今天手氣超好 🎰', time: '14:02' },
      { id: 2, user: 'DragonKing', avatar: '🐉', text: '百家樂剛剛連贏8把！', time: '14:03' },
      { id: 3, user: '我',         avatar: '👤', text: '厲害！', time: '14:04', self: true },
      { id: 4, user: 'StarPlayer', avatar: '⭐', text: '有人要一起衝排行榜嗎？', time: '14:05' },
      { id: 5, user: 'JokerAce',   avatar: '🃏', text: '明天活動開始記得上線！', time: '14:08' },
    ] satisfies ChatMessage[],
    privateConversations: [
      {
        id: 1,
        peer: {
          playerId: 'P10002',
          account: 'DragonKing88',
          name: 'DragonKing',
          avatar: '🐉',
          vip: 3,
          level: 18,
          status: '遊戲中',
          bio: '百家樂連勝愛好者，最近正在研究短局節奏與下注控管。',
          recentGames: [
            { id: 1, name: '招財貓百家樂', color: '#1d4ed8' },
            { id: 2, name: 'Classic Baccarat', color: '#0f766e' },
            { id: 3, name: 'Speed Baccarat', color: '#7c2d12' },
          ],
        },
        unread: 2,
        messages: [
          { id: 1, user: 'DragonKing', avatar: '🐉', text: '嘿，要來私訊我的策略嗎哈哈', time: '13:50' },
          { id: 2, user: '我',         avatar: '👤', text: '當然！你怎麼連贏的？', time: '13:51', self: true },
          { id: 3, user: 'DragonKing', avatar: '🐉', text: '等我整理一下筆記再說', time: '13:52' },
        ],
      },
      {
        id: 2,
        peer: {
          playerId: 'P10001',
          account: 'Lucky88801',
          name: 'Lucky888',
          avatar: '🦁',
          vip: 5,
          level: 26,
          status: '在線',
          bio: '喜歡挑戰高倍數老虎機，看到活動榜就忍不住想衝一波。',
          recentGames: [
            { id: 1, name: 'Ace Blackjack', color: '#7f1d1d' },
            { id: 2, name: 'Gates of Olympus', color: '#581c87' },
            { id: 3, name: 'Shark Hunter', color: '#155e75' },
          ],
          isFriend: true,
        },
        unread: 0,
        messages: [
          { id: 1, user: 'Lucky888', avatar: '🦁', text: '下次一起組隊衝榜！', time: '昨天' },
        ],
      },
    ] satisfies PrivateConversation[],
    supportCategories: supportQuestionCategories,
    supportTickets: [
      {
        id: 'CS-000001',
        categoryKey: 'deposit',
        categoryLabel: '儲值／付款',
        subject: '儲值金幣尚未入帳',
        status: 'ongoing',
        createdAt: '2026-07-28T08:42:00+08:00',
        updatedAt: '2026-07-28T10:24:00+08:00',
        unread: 2,
        messages: [
          { id: 11, user: '我', avatar: '👤', text: '今天早上已完成付款，但金幣還沒有入帳，想請客服協助確認。', time: '08:42', self: true },
          { id: 12, user: '客服小幫手', avatar: '🎧', text: '您好，已收到您的問題，我們正在核對付款紀錄。', time: '09:10' },
          { id: 13, user: '客服小幫手', avatar: '🎧', text: '請您確認付款頁顯示的訂單末五碼，回覆後我們會接續查詢。', time: '10:24' },
        ],
      },
    ] satisfies SupportTicket[],
  },
} as const
