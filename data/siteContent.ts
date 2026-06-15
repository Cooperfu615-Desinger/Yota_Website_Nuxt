export type LeaderboardTabKey = 'win' | 'multi' | 'event'

export interface CheckinMilestone {
  days: number
  reward: string
}

export interface DailyCheckinConfig {
  milestones: CheckinMilestone[]
  dailyRewards: number[]   // NT$ 點數，index 0 = 第1天
  makeupCostPerDay: number // 補簽每天花費（遊戲幣）
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

export interface OnlinePlayer {
  id: number
  name: string
  avatar: string
  vip: number          // 0 = 無 VIP，不顯示徽章
  status: PlayerStatus
}

export interface PrivateConversation {
  id: number
  peer: { name: string; avatar: string; vip: number; status: PlayerStatus }
  unread: number
  messages: ChatMessage[]
}

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

export interface GameCategory {
  key: string
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
    { id: 1, title: '百萬大獎賽', subtitle: '累積積分衝頂，贏取百萬獎金', status: 'active', endDate: '2026/12/31', prize: 'NT$1,280,000', gradient: 'linear-gradient(135deg,#1a003a,#7C3AED)', imageSrc: '/event_01.avif' },
    { id: 2, title: '新手首儲禮', subtitle: '首次儲值享最高 100% 加碼', status: 'active', endDate: '長期', prize: '+100%', gradient: 'linear-gradient(135deg,#1a0a00,#D97706)', imageSrc: '/event_02.avif', deposit: true },
    { id: 3, title: '每日簽到獎', subtitle: '連續簽到 7 天，累積豐厚獎勵', status: 'active', endDate: '長期', prize: '每日點數', gradient: 'linear-gradient(135deg,#0a1a00,#166534)', imageSrc: '/event_03.avif' },
    { id: 4, title: '春節限定活動', subtitle: '農曆新年特別回饋，限時限量', status: 'upcoming', endDate: '2026/02/10', prize: 'NT$500,000', gradient: 'linear-gradient(135deg,#2d0a0a,#991b1b)', imageSrc: '/event_05.avif' },
    { id: 5, title: '情人節特別賽', subtitle: '雙人對戰，贏取情侶大禮包', status: 'upcoming', endDate: '2026/02/14', prize: '神秘禮物', gradient: 'linear-gradient(135deg,#1a003a,#be185d)', imageSrc: '/event_06.avif' },
    { id: 6, title: '跨年倒數賽', subtitle: '2025 年倒數特別活動（已結束）', status: 'ended', endDate: '2025/01/01', prize: 'NT$800,000', gradient: 'linear-gradient(135deg,#1a1a1a,#374151)', imageSrc: '/event_07.avif' },
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
      vaultBalance: 0,
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
  dailyCheckin: {
    milestones: [
      { days: 5,  reward: 'NT$100'   },
      { days: 7,  reward: 'NT$200'   },
      { days: 10, reward: 'NT$500'   },
      { days: 15, reward: 'NT$1,000' },
      { days: 20, reward: 'NT$2,000' },
      { days: 25, reward: 'NT$3,500' },
      { days: 30, reward: 'NT$8,888' },
    ] satisfies CheckinMilestone[],
    // 每天簽到可獲得的點數（NT$），共31天
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
      { id: 1, name: 'Lucky888',   avatar: '🦁', vip: 5, status: '在線' },
      { id: 2, name: 'DragonKing', avatar: '🐉', vip: 3, status: '遊戲中' },
      { id: 3, name: 'StarPlayer', avatar: '⭐', vip: 0, status: '在線' },
      { id: 4, name: 'JokerAce',   avatar: '🃏', vip: 2, status: '閒置' },
      { id: 5, name: '金幣王',     avatar: '👑', vip: 4, status: '在線' },
      { id: 6, name: '幸運貓',     avatar: '🐱', vip: 1, status: '遊戲中' },
      { id: 7, name: '賭神再臨',   avatar: '🎲', vip: 0, status: '在線' },
      { id: 8, name: '富貴吉祥',   avatar: '🧧', vip: 3, status: '在線' },
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
        peer: { name: 'DragonKing', avatar: '🐉', vip: 3, status: '遊戲中' },
        unread: 2,
        messages: [
          { id: 1, user: 'DragonKing', avatar: '🐉', text: '嘿，要來私訊我的策略嗎哈哈', time: '13:50' },
          { id: 2, user: '我',         avatar: '👤', text: '當然！你怎麼連贏的？', time: '13:51', self: true },
          { id: 3, user: 'DragonKing', avatar: '🐉', text: '等我整理一下筆記再說', time: '13:52' },
        ],
      },
      {
        id: 2,
        peer: { name: 'Lucky888', avatar: '🦁', vip: 5, status: '在線' },
        unread: 0,
        messages: [
          { id: 1, user: 'Lucky888', avatar: '🦁', text: '下次一起組隊衝榜！', time: '昨天' },
        ],
      },
    ] satisfies PrivateConversation[],
    supportMessages: [
      { id: 1, user: '客服小幫手', avatar: '🎧', text: '您好！我是巨亨ONLINE客服，請問有什麼可以協助您的？', time: '14:00' },
      { id: 2, user: '我',         avatar: '👤', text: '想詢問儲值優惠活動', time: '14:01', self: true },
      { id: 3, user: '客服小幫手', avatar: '🎧', text: '目前新會員首儲享100%加碼，老會員每週儲值也有15%回饋！詳情請至活動頁查看 🎁', time: '14:01' },
    ] satisfies ChatMessage[],
  },
} as const
