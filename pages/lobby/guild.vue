<script setup lang="ts">
import { siteContent, type ChatPlayerProfile, type GuildMember, type GuildReviewMode } from '~/data/siteContent'
import {
  DEFAULT_GUILD_LEADERBOARD_REWARDS,
  GUILD_LEADERBOARD_KEYS,
  GUILD_TREASURY_GOLD_PER_CONSTRUCTION_EXP,
  type GuildLeaderboardKey,
  type GuildTreasuryEntry,
} from '~/composables/useGuildState'
import { GOLD_TO_SILVER_RATE } from '~/utils/walletExchange'

definePageMeta({ layout: 'lobby' })
useHead({ title: '我的集團 — 巨亨ONLINE' })

type GuildPanel = 'list' | 'info' | 'announcement' | 'task'
type GuildEditor = 'badge' | 'name' | 'review' | 'announcement'
type MemberSortKey = 'influence' | 'gamePower' | 'deposit'
type GuildTaskPeriod = 'day' | 'week' | 'month'
type GuildRole = '職員' | '主任' | '總經理' | '總裁'

interface GuildApplication {
  id: number
  name: string
  avatar: string
  vip: number
  message: string
  submittedAt: string
}

const router = useRouter()
const {
  joinedGuild,
  joinedGuildProgress,
  joinedAt,
  initGuildState,
  leaveGuild,
  contributeToGuildTreasury,
  addGuildConstructionExperience,
  promoteGuild,
  updateGuildLeaderboardRewards,
} = useGuildState()
const { userInfo } = useAppState()
const { transactions, balance: walletGoldBalance, spendWalletBalance } = useFinancialState()
const { blockPlayer } = useSocialState()
const { createPlayerReportTicket } = useSupportTicketState()
const guildMembers = siteContent.guildMembers
// 集團影響力是集團累積值，使用全體成員基準影響力加總；退出成員不會回扣此數值。
const guildInfluenceTotal = guildMembers.reduce((total, member) => total + member.influence, 0)
const guildAnnouncements = siteContent.guildAnnouncements
const guildAnnouncement = guildAnnouncements[0]
const guildAnnouncementText = `${guildAnnouncement.title}\n\n${guildAnnouncement.content}\n\n發布時間：${guildAnnouncement.time}`
const guildAnnouncementDraft = ref(guildAnnouncementText)
const announcementNotice = ref('')
const guildNameDraft = ref('')
const displayGuildName = ref('')
const guildBadgeDraft = ref('⚔️')
const displayGuildBadge = ref('⚔️')
const guildBadgeBackgroundDraft = ref('#6d28d9')
const displayGuildBadgeBackground = ref('#6d28d9')
const guildReviewModeDraft = ref<GuildReviewMode>('auto')
const displayGuildReviewMode = ref<GuildReviewMode>('auto')
const activeGuildEditor = ref<GuildEditor | null>(null)
const guildNameNotice = ref('')
const guildBadgeNotice = ref('')
const guildReviewNotice = ref('')
const guildBadgeOptions = [
  { id: 'swords', label: '雙劍', icon: '⚔️' },
  { id: 'crown', label: '王冠', icon: '👑' },
  { id: 'shield', label: '守護盾', icon: '🛡️' },
  { id: 'dragon', label: '龍徽', icon: '🐉' },
  { id: 'flame', label: '烈焰', icon: '🔥' },
  { id: 'star', label: '星徽', icon: '⭐' },
] as const
const guildPanelTabs: { key: GuildPanel; label: string }[] = [
  { key: 'list', label: '集團清單' },
  { key: 'info', label: '集團資訊' },
  { key: 'announcement', label: '集團公告' },
  { key: 'task', label: '集團任務' },
]
const guildLeaderboardTabs: { key: GuildLeaderboardKey; label: string; metricLabel: string }[] = [
  { key: 'influence', label: '功勳榜', metricLabel: '累計功勳' },
  { key: 'gamePower', label: '戰力榜', metricLabel: '戰力' },
  { key: 'deposit', label: '財力榜', metricLabel: '入會後累計儲值' },
  { key: 'contribution', label: '貢獻榜', metricLabel: '累計捐獻金幣' },
]
const activeGuildPanel = ref<GuildPanel>('info')
const activeGuildRole = useState<GuildRole>('guildActiveRole', () => '職員')
const guildRoleOptions: GuildRole[] = ['職員', '主任', '總經理', '總裁']
const isGuildPresident = computed(() => activeGuildRole.value === '總裁')
const guildExitActionLabel = computed(() => isGuildPresident.value ? '解散集團' : '退出集團')
const guildExitConfirmTitle = computed(() => isGuildPresident.value ? '確定要解散集團嗎？' : '確定要退出集團嗎？')
const guildExitConfirmDescription = computed(() => isGuildPresident.value
  ? `解散後將結束「${joinedGuild.value?.name ?? ''}」的集團資料，成員也會一併離開。`
  : `退出後將離開「${joinedGuild.value?.name ?? ''}」，之後需要重新申請才能加入集團。`)
const guildExitConfirmLabel = computed(() => isGuildPresident.value ? '確認解散' : '確認退出')
const searchQuery = ref('')
const reviewFilter = ref<'all' | GuildReviewMode>('all')
const currentPage = ref(1)
const pageSize = 20
const currentMemberPage = ref(1)
const memberPageSize = 20
const memberSort = ref<MemberSortKey>('influence')
const activeGuildTaskPeriod = ref<GuildTaskPeriod>('day')
const showLeaveConfirm = ref(false)
const showGuildContributionModal = ref(false)
const showGuildTreasuryLedger = ref(false)
const guildContributionAmount = ref<number | string>(1000)
const guildContributionError = ref('')
const guildGrowthNotice = ref('')
const showGuildApplicationsModal = ref(false)
const showGuildLeaderboardModal = ref(false)
const showGuildLeaderboardSettings = ref(false)
const activeGuildLeaderboard = ref<GuildLeaderboardKey>('influence')
const guildLeaderboardNotice = ref('')
const guildLeaderboardNoticeType = ref<'success' | 'error'>('success')
const guildLeaderboardRewardDraft = ref<Record<GuildLeaderboardKey, number[]>>({
  influence: [...DEFAULT_GUILD_LEADERBOARD_REWARDS.influence],
  gamePower: [...DEFAULT_GUILD_LEADERBOARD_REWARDS.gamePower],
  deposit: [...DEFAULT_GUILD_LEADERBOARD_REWARDS.deposit],
  contribution: [...DEFAULT_GUILD_LEADERBOARD_REWARDS.contribution],
})
const guildLeaderboardEnabledDraft = ref<Record<GuildLeaderboardKey, boolean>>({
  influence: false,
  gamePower: false,
  deposit: false,
  contribution: false,
})
const guildApplicationNotice = ref('')
const guildApplications = ref<GuildApplication[]>([
  { id: 1, name: '雲端漫遊者', avatar: '🌌', vip: 5, message: '平時會參與每日任務與團隊活動，希望和大家一起累積影響力。', submittedAt: '今天 10:18' },
  { id: 2, name: 'LuckyGirl', avatar: '🦊', vip: 4, message: '想加入集團找夥伴一起遊戲。', submittedAt: '今天 09:42' },
  { id: 3, name: 'AcePlayer', avatar: '🎴', vip: 3, message: '願意遵守集團規範並參與活動。', submittedAt: '昨天 22:16' },
])
const approvedGuildMembers = ref<GuildMember[]>([])
const selectedMember = ref<ChatPlayerProfile | null>(null)
const reportTarget = ref<ChatPlayerProfile | null>(null)
const removedGuildMemberNames = ref<string[]>([])
const guildMemberRoleOverrides = ref<Record<string, GuildRole>>({})
const memberToKick = ref<(typeof guildMembers)[number] | null>(null)
const showKickConfirm = ref(false)
const memberRoleTarget = ref<(typeof guildMembers)[number] | null>(null)
const memberRoleDraft = ref<GuildRole>('職員')
const showMemberRoleModal = ref(false)
const memberToTransferPresident = ref<(typeof guildMembers)[number] | null>(null)
const showPresidentTransferConfirm = ref(false)

const reviewLabels: Record<GuildReviewMode, string> = {
  auto: '自動審核',
  manual: '人工審核',
}

const memberSortLabels: Record<MemberSortKey, string> = {
  influence: '影響力',
  gamePower: '遊戲戰力',
  deposit: '儲值',
}

const memberSortAriaLabels: Record<MemberSortKey, string> = {
  influence: '影響力排序',
  gamePower: '遊戲戰力排序',
  deposit: '儲值排序',
}

const canReviewGuildApplications = computed(() => activeGuildRole.value === '總裁' || activeGuildRole.value === '總經理' || activeGuildRole.value === '主任')
const canEditGuildBadge = computed(() => activeGuildRole.value === '總經理' || activeGuildRole.value === '總裁')
const canEditGuildName = computed(() => activeGuildRole.value === '總經理' || activeGuildRole.value === '總裁')
const canEditGuildReviewMode = computed(() => activeGuildRole.value === '總經理' || activeGuildRole.value === '總裁')
const canEditGuildAnnouncement = computed(() => activeGuildRole.value === '總經理' || activeGuildRole.value === '總裁')
const canManageGuildMembers = computed(() => activeGuildRole.value !== '職員')
const canManageGuildGrowth = computed(() => activeGuildRole.value === '總經理' || activeGuildRole.value === '總裁')
const canConfigureGuildLeaderboard = computed(() => activeGuildRole.value === '總經理' || activeGuildRole.value === '總裁')
const guildLevel = computed(() => joinedGuildProgress.value?.level ?? 1)
const guildConstructionExp = computed(() => joinedGuildProgress.value?.constructionExp ?? 0)
const guildTreasuryBalance = computed(() => joinedGuildProgress.value?.treasuryBalance ?? joinedGuild.value?.treasury ?? 0)
const guildTreasuryLedger = computed(() => joinedGuildProgress.value?.treasuryLedger ?? [])
const guildTreasuryLedgerIsSample = computed(() => guildTreasuryLedger.value.length === 0)
const guildTreasuryDemoEntries = computed<GuildTreasuryEntry[]>(() => [
  { id: 'demo-turnover', createdAt: '本週一 00:12', type: 'turnover', title: '遊戲打碼收入', detail: '有效打碼 12,000 金幣等值 × 1,000：10', operatorName: 'Lucky888', amountGold: 120, affectsBalance: false },
  { id: 'demo-contribution', createdAt: '本週日 21:36', type: 'contribution', title: '集團貢獻', detail: '成員捐獻金幣至集團金庫', operatorName: userInfo.value.name || '會員', amountGold: 500, affectsBalance: false },
  { id: 'demo-construction', createdAt: '本週日 20:15', type: 'construction', title: '集團建設支出', detail: '增加 100 建設經驗，扣除 100 金幣', operatorName: userInfo.value.name || '會員', amountGold: -100, affectsBalance: false },
  { id: 'demo-payout', createdAt: '上週一 00:08', type: 'leaderboard-payout', title: '集團排行銀幣派發', detail: '派發 10,000 銀幣 ÷ 100，折合 100 金幣', operatorName: '系統排程', amountGold: -100, affectsBalance: false },
])
const visibleGuildTreasuryLedger = computed(() => guildTreasuryLedgerIsSample.value ? guildTreasuryDemoEntries.value : guildTreasuryLedger.value)
const guildTreasuryLedgerHelpText = computed(() => [
  `帳變統一以金幣顯示；${GOLD_TO_SILVER_RATE} 銀幣 = 1 金幣。排行榜派發從已預扣額度支出，不會重複扣減可用餘額。`,
  guildTreasuryLedgerIsSample.value ? '以下為原型換算示意，不會改變目前金庫餘額。遊戲打碼與週榜自動派發尚未接上實際事件／後端排程。' : '',
  '帳變記錄包含成員捐獻、建設扣款、排行榜額度預扣／退回。打碼收入與週榜派彩需接上遊戲及伺服器結算事件後，才會記入真實帳變。',
].filter(Boolean).join('\n\n'))
const guildLeaderboardRewards = computed(() => joinedGuildProgress.value?.leaderboardRewards ?? DEFAULT_GUILD_LEADERBOARD_REWARDS)
const guildLeaderboardEnabled = computed(() => joinedGuildProgress.value?.leaderboardRewardsEnabled ?? Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => [key, false])) as Record<GuildLeaderboardKey, boolean>)
const guildLeaderboardAutoPaused = computed(() => joinedGuildProgress.value?.leaderboardAutoPaused === true)
const guildLeaderboardReservedGold = computed(() => joinedGuildProgress.value?.leaderboardReservedGold ?? Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => [key, 0])) as Record<GuildLeaderboardKey, number>)
const guildLeaderboardTotalReservedGold = computed(() => Object.values(guildLeaderboardReservedGold.value).reduce((total, amount) => total + amount, 0))
const activeLeaderboardReservedGold = computed(() => guildLeaderboardReservedGold.value[activeGuildLeaderboard.value] ?? 0)
const draftLeaderboardRewardTotalSilver = computed(() => guildLeaderboardRewardDraft.value[activeGuildLeaderboard.value].reduce((total, amount) => total + (Number.isFinite(amount) ? Math.max(0, amount) : 0), 0))
const draftLeaderboardReserveGold = computed(() => Math.ceil(draftLeaderboardRewardTotalSilver.value / GOLD_TO_SILVER_RATE))
const projectedLeaderboardReservedGold = computed(() => Math.max(0,
  guildLeaderboardTotalReservedGold.value - activeLeaderboardReservedGold.value + draftLeaderboardReserveGold.value,
))
const guildLevelRequirements = computed(() => ({
  influence: 2_500_000 + Math.max(0, guildLevel.value - 1) * 500_000,
  construction: 1_000,
}))
const guildInfluenceProgress = computed(() => Math.min(100, Math.max(0, guildInfluenceTotal / guildLevelRequirements.value.influence * 100)))
const guildConstructionProgress = computed(() => Math.min(100, Math.max(0, guildConstructionExp.value / guildLevelRequirements.value.construction * 100)))
const guildBuildExperience = computed(() => Math.min(100, Math.max(0, guildLevelRequirements.value.construction - guildConstructionExp.value)))
const guildBuildCostGold = computed(() => guildBuildExperience.value * GUILD_TREASURY_GOLD_PER_CONSTRUCTION_EXP)
const canBuildGuild = computed(() => canManageGuildGrowth.value
  && guildBuildExperience.value > 0
  && guildTreasuryBalance.value >= guildBuildCostGold.value)
const guildBuildUnavailableLabel = computed(() => guildBuildExperience.value <= 0
  ? '建設經驗已滿'
  : guildTreasuryBalance.value < guildBuildCostGold.value ? '金庫金幣不足' : '集團建設 +100')
const canPromoteGuild = computed(() => canManageGuildGrowth.value
  && guildInfluenceProgress.value >= 100
  && guildConstructionProgress.value >= 100)
const guildPermissionSummary = computed(() => {
  if (activeGuildRole.value === '總裁') return '可管理集團設定、邀請、審核、禁言與金庫'
  if (activeGuildRole.value === '總經理') return '可管理集團設定、邀請、審核、禁言與金庫'
  if (activeGuildRole.value === '主任') return '可邀請玩家、審核申請、禁言與管理會員'
  return '僅可查看與使用個人功能'
})
const guildRoleRanks: Record<string, number> = {
  職員: 1,
  主任: 2,
  總經理: 3,
  總裁: 4,
}
const guildMemberRoleOptions: GuildRole[] = ['職員', '主任', '總經理']
const guildTaskPeriodLabels: Record<GuildTaskPeriod, string> = {
  day: '日任務',
  week: '週任務',
  month: '月任務',
}

const guildTaskPeriodNotes: Record<GuildTaskPeriod, string> = {
  day: '每日重置本人任務進度並輪換九宮格順序，任務內容不變。',
  week: '每週重置本人任務進度，持續循環九個任務。',
  month: '每月重置本人任務進度，完成任務可累積集團影響力。',
}

const guildTaskSilverReward: Record<GuildTaskPeriod, number> = {
  day: 100,
  week: 500,
  month: 2_000,
}

const guildTaskTemplates = [
  { id: 1, title: '遊戲遊玩次數', description: '本人完成適用範圍內的遊戲遊玩次數', targets: { day: 3, week: 20, month: 100 }, unit: '次', scopeLabel: '指定遊戲：PG Soft・麻將胡了', reward: 50, completed: true, completedStyle: 'circle', completedStyleLabel: '圓章' },
  { id: 2, title: '遊戲打碼量（流水）', description: '本人累積適用範圍內的有效投注打碼量，以金幣價值計算（銀幣 ÷ 100）', targets: { day: 1000, week: 10000, month: 50000 }, unit: '金幣價值', scopeLabel: '指定遊戲：PG Soft・麻將胡了', reward: 60, completed: false },
  { id: 3, title: '遊戲中獎倍數', description: '本人在適用範圍內的遊戲達到指定中獎倍數', targets: { day: 2, week: 3, month: 5 }, unit: '倍', scopeLabel: '指定遊戲：PG Soft・麻將胡了', reward: 80, completed: false },
  { id: 4, title: '遊戲遊玩次數', description: '本人完成適用範圍內的遊戲遊玩次數', targets: { day: 5, week: 30, month: 150 }, unit: '次', scopeLabel: '指定遊戲類型：電子遊戲', reward: 70, completed: false },
  { id: 5, title: '遊戲打碼量（流水）', description: '本人累積適用範圍內的有效投注打碼量，以金幣價值計算（銀幣 ÷ 100）', targets: { day: 5000, week: 50000, month: 200000 }, unit: '金幣價值', scopeLabel: '指定遊戲類型：電子遊戲', reward: 100, completed: true, completedStyle: 'circle', completedStyleLabel: '圓章' },
  { id: 6, title: '遊戲中獎倍數', description: '本人在適用範圍內的遊戲達到指定中獎倍數', targets: { day: 3, week: 5, month: 8 }, unit: '倍', scopeLabel: '指定遊戲類型：電子遊戲', reward: 120, completed: false },
  { id: 7, title: '登入天數', description: '本人於任務週期內累積登入天數，同一天登入多次只計 1 天', targets: { day: 1, week: 5, month: 20 }, unit: '天', scopeLabel: '', reward: 90, completed: false },
  { id: 8, title: '儲值金額', description: '本人於任務週期內累積成功儲值金額', targets: { day: 1000, week: 5000, month: 20000 }, unit: '金額', scopeLabel: '', reward: 85, completed: false },
  { id: 9, title: '儲值次數', description: '本人於任務週期內累積成功儲值次數', targets: { day: 1, week: 3, month: 10 }, unit: '次', scopeLabel: '', reward: 150, completed: true, completedStyle: 'circle', completedStyleLabel: '圓章' },
] as const

function normalize(value: string) {
  return value.trim().toLocaleLowerCase()
}

const filteredGuilds = computed(() => {
  const keyword = normalize(searchQuery.value)

  return siteContent.guilds.filter((guild) => {
    const matchesKeyword = !keyword || normalize(guild.name).includes(keyword)
    const matchesReview = reviewFilter.value === 'all' || guild.reviewMode === reviewFilter.value
    return matchesKeyword && matchesReview
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGuilds.value.length / pageSize)))

const visibleGuilds = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredGuilds.value.slice(start, start + pageSize)
})

function parseTransactionTime(value: string) {
  return Date.parse(value.replace(/\//g, '-').replace(', ', 'T').replace(' ', 'T'))
}

function formatTreasuryEntryTime(value: string) {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return value
  return new Intl.DateTimeFormat('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Taipei',
  }).format(new Date(timestamp))
}

const currentGuildDeposit = computed(() => {
  if (!joinedAt.value) return 0

  return transactions.value
    .filter(transaction => transaction.type === 'deposit' && transaction.status === 'success')
    .filter(transaction => parseTransactionTime(transaction.createdAt) >= joinedAt.value!)
    .reduce((total, transaction) => total + Math.max(0, transaction.amount), 0)
})

const currentGuildContribution = computed(() => {
  if (!joinedAt.value) return 0

  return transactions.value
    .filter(transaction => transaction.type === 'spend' && transaction.status === 'success' && transaction.wallet === 'gold')
    .filter(transaction => ['集團貢獻', '貢獻集團'].includes(transaction.title))
    .filter(transaction => parseTransactionTime(transaction.createdAt) >= joinedAt.value!)
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0)
})

function openGuildContributionModal() {
  guildContributionAmount.value = 1000
  guildContributionError.value = ''
  showGuildContributionModal.value = true
}

function closeGuildContributionModal() {
  showGuildContributionModal.value = false
  guildContributionError.value = ''
}

function submitGuildContribution() {
  const guild = joinedGuild.value
  const amount = Math.floor(Number(guildContributionAmount.value))
  if (!guild || !Number.isSafeInteger(amount) || amount <= 0) {
    guildContributionError.value = '請輸入大於 0 的整數金額。'
    return
  }
  if (amount > walletGoldBalance.value) {
    guildContributionError.value = '錢包金幣不足，請調整貢獻金額。'
    return
  }

  const transaction = spendWalletBalance('gold', amount, '集團貢獻', `貢獻金幣至「${guild.name}」集團金庫`)
  if (!transaction) {
    guildContributionError.value = '錢包金幣不足，集團貢獻未完成。'
    return
  }
  if (!contributeToGuildTreasury(guild.rank, amount, userInfo.value.name)) {
    guildContributionError.value = '集團金庫更新失敗，請稍後再試。'
    return
  }

  guildGrowthNotice.value = `已貢獻 ${amount.toLocaleString()} 金幣至集團金庫。`
  closeGuildContributionModal()
}

function buildGuild() {
  const guild = joinedGuild.value
  if (!guild || !canManageGuildGrowth.value || guildBuildExperience.value <= 0) return
  const gainedExperience = guildBuildExperience.value
  const costGold = guildBuildCostGold.value
  if (addGuildConstructionExperience(guild.rank, 100, guildLevelRequirements.value.construction, GUILD_TREASURY_GOLD_PER_CONSTRUCTION_EXP, userInfo.value.name)) {
    guildGrowthNotice.value = `集團建設經驗增加 ${gainedExperience}，金庫扣除 ${costGold.toLocaleString()} 金幣。`
  } else {
    guildGrowthNotice.value = '集團金庫金幣不足，尚未增加建設經驗。'
  }
}

function promoteCurrentGuild() {
  const guild = joinedGuild.value
  if (!guild || !canPromoteGuild.value) return
  if (promoteGuild(guild.rank, guildInfluenceTotal, guildLevelRequirements.value.influence, guildLevelRequirements.value.construction)) {
    guildGrowthNotice.value = `集團已升級至 Lv. ${guildLevel.value}。`
  }
}

const currentGuildGamePower = computed(() => {
  if (!joinedAt.value) return 0

  // 加入後的有效遊戲流水按金幣等值計算；個人對集團捐獻不算遊戲流水。
  const eligibleSpends = transactions.value
    .filter(transaction => transaction.type === 'spend'
      && transaction.status === 'success'
      && (transaction.wallet === 'gold' || transaction.wallet === 'silver')
      && !['貢獻集團', '集團貢獻'].includes(transaction.title))
    .filter(transaction => parseTransactionTime(transaction.createdAt) >= joinedAt.value!)
  const goldTurnover = eligibleSpends
    .filter(transaction => transaction.wallet === 'gold')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0)
  const silverTurnover = eligibleSpends
    .filter(transaction => transaction.wallet === 'silver')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0)
  return goldTurnover + Math.floor(silverTurnover / GOLD_TO_SILVER_RATE)
})

const currentGuildInfluence = computed(() => currentGuildGamePower.value + currentGuildDeposit.value)

const displayGuildMembers = computed(() => {
  const currentPlayerName = userInfo.value.name
  const hasCurrentPlayerRecord = [...guildMembers, ...approvedGuildMembers.value]
    .some(member => member.name === currentPlayerName)
  const members = [...guildMembers, ...approvedGuildMembers.value]
    .filter(member => !removedGuildMemberNames.value.includes(member.name))
    .map((member) => {
      // 「玩家888」是樣板中的登入玩家佔位資料，讓即時捐獻能反映到本人榜單。
      const isCurrentPlayer = member.name === currentPlayerName || (!hasCurrentPlayerRecord && member.name === '玩家888')
      const currentPlayer = isCurrentPlayer
        ? {
            ...member,
            name: currentPlayerName,
            avatar: userInfo.value.avatar,
            vip: userInfo.value.vip,
            isOnline: true,
            lastOnlineAt: '目前在線',
            influence: currentGuildInfluence.value,
            gamePower: currentGuildGamePower.value,
            deposit: currentGuildDeposit.value,
            contribution: currentGuildContribution.value,
          }
        : member
      const assignedRole = guildMemberRoleOverrides.value[currentPlayer.name]
      return assignedRole ? { ...currentPlayer, title: assignedRole } : currentPlayer
    })
  const sortKey = memberSort.value

  return members.sort((a, b) => b[sortKey] - a[sortKey])
})

const memberTotalPages = computed(() => Math.max(1, Math.ceil(displayGuildMembers.value.length / memberPageSize)))
const visibleGuildMembers = computed(() => {
  const start = (currentMemberPage.value - 1) * memberPageSize
  return displayGuildMembers.value.slice(start, start + memberPageSize)
})

const guildLeaderboardEntries = computed(() => {
  const metric = activeGuildLeaderboard.value
  return [...displayGuildMembers.value]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 10)
    .map((member, index) => ({
      ...member,
      rank: index + 1,
      value: member[metric],
      rewardSilver: guildLeaderboardRewards.value[metric][index] ?? 0,
      insuranceGold: (guildLeaderboardRewards.value[metric][index] ?? 0) / GOLD_TO_SILVER_RATE,
    }))
})

const guildLeaderboardPodium = computed(() => {
  const entries = guildLeaderboardEntries.value
  return [entries.find(entry => entry.rank === 2), entries.find(entry => entry.rank === 1), entries.find(entry => entry.rank === 3)]
    .filter((entry): entry is (typeof entries)[number] => Boolean(entry))
})

const guildLeaderboardRunnersUp = computed(() => guildLeaderboardEntries.value.filter(entry => entry.rank >= 4))

function openGuildLeaderboard() {
  activeGuildLeaderboard.value = 'influence'
  showGuildLeaderboardSettings.value = false
  guildLeaderboardNotice.value = ''
  guildLeaderboardNoticeType.value = 'success'
  showGuildLeaderboardModal.value = true
}

function openGuildLeaderboardSettings() {
  if (!canConfigureGuildLeaderboard.value) return
  guildLeaderboardNotice.value = ''
  guildLeaderboardNoticeType.value = 'success'
  guildLeaderboardRewardDraft.value = {
    influence: [...guildLeaderboardRewards.value.influence],
    gamePower: [...guildLeaderboardRewards.value.gamePower],
    deposit: [...guildLeaderboardRewards.value.deposit],
    contribution: [...guildLeaderboardRewards.value.contribution],
  }
  guildLeaderboardEnabledDraft.value = {
    influence: guildLeaderboardEnabled.value.influence,
    gamePower: guildLeaderboardEnabled.value.gamePower,
    deposit: guildLeaderboardEnabled.value.deposit,
    contribution: guildLeaderboardEnabled.value.contribution,
  }
  showGuildLeaderboardSettings.value = true
}

function saveGuildLeaderboardRewards() {
  const guild = joinedGuild.value
  if (!canConfigureGuildLeaderboard.value || !guild) return
  const key = activeGuildLeaderboard.value
  const rewards = guildLeaderboardRewardDraft.value[key]
  if (rewards.length !== 10 || rewards.some(amount => !Number.isSafeInteger(amount) || amount < 0 || amount % GOLD_TO_SILVER_RATE !== 0)) {
    guildLeaderboardNoticeType.value = 'error'
    guildLeaderboardNotice.value = `請為第 1 至 10 名輸入 0 以上且為 ${GOLD_TO_SILVER_RATE} 的倍數之銀幣，才能換算成整數保險金。`
    return
  }

  const result = updateGuildLeaderboardRewards(guild.rank, key, guildLeaderboardEnabledDraft.value[key], rewards, userInfo.value.name)
  if (!result.ok) {
    guildLeaderboardNoticeType.value = 'error'
    guildLeaderboardNotice.value = result.reason === 'insufficient'
      ? `金庫額度不足，四榜排名與獎勵已自動暫停。可用 ${result.availableGold.toLocaleString()}，尚缺 ${Math.max(0, result.neededGold - result.availableGold).toLocaleString()} 金幣；請補足金庫或降低額度後重新儲存即可恢復。`
      : '獎勵設定資料無效，請檢查金額後重試。'
    return
  }

  guildLeaderboardNoticeType.value = 'success'
  const adjustmentNotice = result.chargedGold > 0
    ? `已預扣 ${result.chargedGold.toLocaleString()} 金幣額度`
    : result.refundedGold > 0
      ? `已退回 ${result.refundedGold.toLocaleString()} 金幣`
      : '預扣集團金庫額度無需調整'
  const statusNotice = guildLeaderboardEnabledDraft.value[key] ? '獎勵已開啟' : '獎勵已關閉'
  guildLeaderboardNotice.value = `${statusNotice}；${adjustmentNotice}。四榜合計預扣金庫額度 ${result.totalReservedGold.toLocaleString()} 金幣。`
  showGuildLeaderboardSettings.value = false
}

watch([searchQuery, reviewFilter], () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) currentPage.value = pages
})

watch(memberSort, () => {
  currentMemberPage.value = 1
})

watch(memberTotalPages, (pages) => {
  if (currentMemberPage.value > pages) currentMemberPage.value = pages
})

function selectPage(page: number) {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value)
}

function selectMemberPage(page: number) {
  currentMemberPage.value = Math.min(Math.max(page, 1), memberTotalPages.value)
}

function setMemberSort(sortKey: MemberSortKey) {
  memberSort.value = sortKey
}

function memberProfile(member: (typeof guildMembers)[number], index: number): ChatPlayerProfile {
  return {
    playerId: `GUILD-MEMBER-${index + 1}`,
    account: `guild_member_${index + 1}`,
    name: member.name,
    avatar: member.avatar,
    vip: member.vip,
    level: 20 + index,
    status: member.isOnline ? '在線' : '離線',
    bio: `${member.title}，目前和集團夥伴一起累積影響力。`,
    recentGames: [
      { id: 1, name: '百萬大獎賽', color: '#92400e' },
      { id: 2, name: '招財貓百家樂', color: '#1d4ed8' },
      { id: 3, name: '神龍傳奇', color: '#581c87' },
    ],
  }
}

function openMember(member: (typeof guildMembers)[number], index: number) {
  selectedMember.value = memberProfile(member, index)
}

function requestKickMember(member: (typeof guildMembers)[number]) {
  if (!canKickMember(member)) return

  memberToKick.value = member
  showKickConfirm.value = true
}

function canKickMember(member: (typeof guildMembers)[number]) {
  if (!canManageGuildMembers.value || member.name === userInfo.value.name) return false

  return guildRoleRanks[activeGuildRole.value] > (guildRoleRanks[member.title] ?? 0)
}

function canAssignGuildMemberRole(member: (typeof guildMembers)[number]) {
  return isGuildPresident.value
    && member.name !== userInfo.value.name
    && member.title !== '總裁'
}

function openGuildMemberRoleEditor(member: (typeof guildMembers)[number]) {
  if (!canAssignGuildMemberRole(member)) return
  memberRoleTarget.value = member
  memberRoleDraft.value = guildMemberRoleOptions.find(role => role === member.title) ?? '職員'
  showMemberRoleModal.value = true
}

function saveGuildMemberRole() {
  const member = memberRoleTarget.value
  if (!member || !canAssignGuildMemberRole(member) || !guildMemberRoleOptions.includes(memberRoleDraft.value)) return
  guildMemberRoleOverrides.value = {
    ...guildMemberRoleOverrides.value,
    [member.name]: memberRoleDraft.value,
  }
  showMemberRoleModal.value = false
  memberRoleTarget.value = null
}

function canTransferGuildPresident(member: (typeof guildMembers)[number]) {
  return isGuildPresident.value
    && member.name !== userInfo.value.name
    && member.title !== '總裁'
}

function requestGuildPresidentTransfer(member: (typeof guildMembers)[number]) {
  if (!canTransferGuildPresident(member)) return
  memberToTransferPresident.value = member
  showPresidentTransferConfirm.value = true
}

function cancelGuildPresidentTransfer() {
  memberToTransferPresident.value = null
  showPresidentTransferConfirm.value = false
}

function confirmGuildPresidentTransfer() {
  const nominee = memberToTransferPresident.value
  const currentPresident = displayGuildMembers.value.find(member => member.title === '總裁')
  if (!nominee || !currentPresident || !canTransferGuildPresident(nominee)) return

  guildMemberRoleOverrides.value = {
    ...guildMemberRoleOverrides.value,
    [currentPresident.name]: '職員',
    [nominee.name]: '總裁',
  }
  activeGuildRole.value = '職員'
  cancelGuildPresidentTransfer()
}

function cancelKickMember() {
  memberToKick.value = null
  showKickConfirm.value = false
}

function confirmKickMember() {
  const member = memberToKick.value
  if (!member || !canKickMember(member)) return

  if (!removedGuildMemberNames.value.includes(member.name)) {
    removedGuildMemberNames.value.push(member.name)
  }
  selectedMember.value = null
  cancelKickMember()
}

function closeMemberCard() {
  selectedMember.value = null
}

function resolveGuildApplication(application: GuildApplication, decision: 'approve' | 'reject') {
  if (!canReviewGuildApplications.value) return
  if (!guildApplications.value.some(item => item.id === application.id)) return

  if (decision === 'approve') {
    if (displayGuildMembers.value.length >= (joinedGuild.value?.maxMembers ?? 0)) {
      guildApplicationNotice.value = '集團人數已滿，無法批准新的申請。'
      return
    }

    approvedGuildMembers.value.push({
      title: '職員',
      avatar: application.avatar,
      name: application.name,
      influence: 0,
      isOnline: true,
      lastOnlineAt: '目前在線',
      vip: application.vip,
      gamePower: 0,
      deposit: 0,
      contribution: 0,
    })
    guildApplicationNotice.value = `已批准 ${application.name} 加入集團。`
  } else {
    guildApplicationNotice.value = `已拒絕 ${application.name} 的入會申請。`
  }

  guildApplications.value = guildApplications.value.filter(item => item.id !== application.id)
}

function messageMember(player: ChatPlayerProfile) {
  closeMemberCard()
  router.push({ path: '/lobby/chat', query: { channel: 'private' } })
}

function giftMember(player: ChatPlayerProfile) {
  closeMemberCard()
  router.push({ path: '/lobby/vault', query: { tab: 'transfer', receiverId: player.playerId } })
}

function blockMember(player: ChatPlayerProfile) {
  blockPlayer(player)
  closeMemberCard()
}

function reportMember(player: ChatPlayerProfile) {
  closeMemberCard()
  reportTarget.value = player
}

function submitMemberReport(reason: string, detail: string) {
  const player = reportTarget.value
  if (!player) return
  const result = createPlayerReportTicket(player, reason, detail)
  if (!result.ok) return
  reportTarget.value = null
  router.push({ path: '/lobby/chat', query: { channel: 'support' } })
}

function saveGuildAnnouncement() {
  if (!canEditGuildAnnouncement.value) return
  announcementNotice.value = '公告內容已更新（前端展示用，不會寫入後端）。'
  activeGuildEditor.value = null
}

function openGuildEditor(editor: GuildEditor) {
  if (editor === 'badge' && !canEditGuildBadge.value) return
  if (editor === 'name' && !canEditGuildName.value) return
  if (editor === 'review' && !canEditGuildReviewMode.value) return
  if (editor === 'announcement' && !canEditGuildAnnouncement.value) return

  if (editor === 'name') guildNameDraft.value = displayGuildName.value
  if (editor === 'badge') {
    guildBadgeDraft.value = displayGuildBadge.value || '⚔️'
    guildBadgeBackgroundDraft.value = displayGuildBadgeBackground.value
  }
  if (editor === 'review') guildReviewModeDraft.value = displayGuildReviewMode.value
  activeGuildEditor.value = editor
}

function closeGuildEditor() {
  activeGuildEditor.value = null
}

function saveGuildName() {
  if (!canEditGuildName.value) return

  const nextName = guildNameDraft.value.trim()
  if (!nextName) {
    guildNameNotice.value = '集團名稱不可為空。'
    return
  }

  displayGuildName.value = nextName
  guildNameNotice.value = '集團名稱已更新（前端展示用，不會寫入後端）。'
  closeGuildEditor()
}

function selectGuildBadgeOption(icon: string) {
  guildBadgeDraft.value = icon
  guildBadgeNotice.value = ''
}

function saveGuildBadge() {
  if (!canEditGuildBadge.value) return

  const nextBadge = guildBadgeDraft.value.trim()
  if (!nextBadge) {
    guildBadgeNotice.value = '請選擇一個官方內建徽章。'
    return
  }

  displayGuildBadge.value = nextBadge.slice(0, 2)
  displayGuildBadgeBackground.value = guildBadgeBackgroundDraft.value
  guildBadgeNotice.value = '集團圖標已更新（前端展示用，不會寫入後端）。'
  closeGuildEditor()
}

function saveGuildReviewMode() {
  if (!canEditGuildReviewMode.value) return

  displayGuildReviewMode.value = guildReviewModeDraft.value
  guildReviewNotice.value = '審核機制已更新（前端展示用，不會寫入後端）。'
  closeGuildEditor()
}

onMounted(() => {
  initGuildState()
  if (!joinedGuild.value) router.replace('/lobby/guilds')
})

watch(joinedGuild, (guild) => {
  if (!guild) return

  guildNameDraft.value = guild.name
  displayGuildName.value = guild.name
  guildBadgeDraft.value = displayGuildBadge.value || '⚔️'
  guildBadgeBackgroundDraft.value = displayGuildBadgeBackground.value
  guildReviewModeDraft.value = guild.reviewMode
  displayGuildReviewMode.value = guild.reviewMode
}, { immediate: true })
</script>

<template>
  <div class="my-guild-page lobby-page px-4 py-5">
    <aside v-if="joinedGuild" class="guild-permission-switcher card-purple" aria-labelledby="guild-permission-title">
      <div class="guild-permission-heading">
        <h2 id="guild-permission-title">權限切換</h2>
        <p>前端展示用，不修改真實權限。</p>
      </div>

      <div class="guild-role-switch" role="radiogroup" aria-label="選擇展示角色">
        <button
          v-for="role in guildRoleOptions"
          :key="role"
          type="button"
          role="radio"
          :aria-checked="activeGuildRole === role"
          :class="{ active: activeGuildRole === role }"
          @click="activeGuildRole = role"
        >
          <strong>{{ role }}</strong>
        </button>
      </div>

      <span class="guild-permission-current">目前角色：{{ activeGuildRole }}</span>
      <p class="guild-permission-summary">{{ guildPermissionSummary }}</p>
    </aside>

    <section v-if="joinedGuild" class="my-guild-card card-purple" aria-label="目前集團概覽">
      <div class="my-guild-profile">
        <div class="my-guild-profile-identity">
          <div class="guild-badge-wrap">
            <div class="guild-badge" :style="{ background: displayGuildBadgeBackground }" aria-label="集團徽章">
              <span>{{ displayGuildBadge }}</span>
            </div>
            <button v-if="canEditGuildBadge" type="button" class="guild-icon-action guild-badge-edit" title="編輯集團徽章" aria-label="編輯集團徽章" @click="openGuildEditor('badge')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
            </button>
          </div>
          <div class="guild-profile-copy">
            <div class="guild-profile-title-row">
              <h2>{{ displayGuildName }}</h2>
              <button v-if="canEditGuildName" type="button" class="guild-icon-action guild-edit-toggle" title="編輯集團名稱" aria-label="編輯集團名稱" @click="openGuildEditor('name')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
              </button>
            </div>
            <p>集團排名第 {{ joinedGuild.rank }} 名</p>
            <p v-if="guildNameNotice" class="guild-edit-notice">{{ guildNameNotice }}</p>
          </div>
        </div>

        <div
          role="button"
          tabindex="0"
          class="guild-treasury-card card-purple"
          aria-haspopup="dialog"
          :aria-label="`開啟集團金庫帳變紀錄，目前餘額 ${guildTreasuryBalance.toLocaleString()} 金幣`"
          @click="showGuildTreasuryLedger = true"
          @keydown.enter.prevent="showGuildTreasuryLedger = true"
          @keydown.space.prevent="showGuildTreasuryLedger = true"
        >
          <div class="guild-treasury-heading">
            <div class="treasury-icon" aria-hidden="true">🏦</div>
            <div>
              <h2 id="guild-treasury-title">集團金庫</h2>
              <p>集團共同資產</p>
            </div>
          </div>
          <div class="treasury-balance">
            <span>金庫餘額</span>
            <strong>{{ guildTreasuryBalance.toLocaleString() }}</strong>
          </div>
        </div>
      </div>

      <section class="guild-growth-panel" aria-label="集團等級與升級條件">
        <div class="guild-growth-heading">
          <div class="guild-growth-heading-copy">
            <div class="guild-level-badge" aria-hidden="true">{{ guildLevel }}</div>
            <div>
              <h3>集團等級</h3>
              <p>集團全體共用等級；影響力與建設經驗皆達 100% 才可升級。</p>
            </div>
          </div>
          <div class="guild-growth-controls">
            <button type="button" class="guild-contribute-button" @click="openGuildContributionModal">集團貢獻</button>
            <template v-if="canManageGuildGrowth">
              <button type="button" class="guild-build-button" :disabled="!canBuildGuild" @click="buildGuild">
                {{ guildBuildUnavailableLabel }}
              </button>
              <button type="button" class="guild-promote-button" :disabled="!canPromoteGuild" @click="promoteCurrentGuild">升級集團</button>
            </template>
          </div>
        </div>

        <div class="guild-growth-progress-grid">
          <div class="guild-growth-progress-item">
            <div class="guild-growth-progress-label">
              <span>集團影響力</span>
              <strong>{{ Math.floor(guildInfluenceProgress) }}%</strong>
            </div>
            <div class="guild-growth-progress-track" role="progressbar" aria-label="集團影響力升級進度" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.floor(guildInfluenceProgress)">
              <span :style="{ width: `${guildInfluenceProgress}%` }"></span>
            </div>
            <small>{{ guildInfluenceTotal.toLocaleString() }} / {{ guildLevelRequirements.influence.toLocaleString() }}</small>
          </div>
          <div class="guild-growth-progress-item">
            <div class="guild-growth-progress-label">
              <span>集團建設</span>
              <strong>{{ Math.floor(guildConstructionProgress) }}%</strong>
            </div>
            <div class="guild-growth-progress-track construction" role="progressbar" aria-label="集團建設升級進度" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.floor(guildConstructionProgress)">
              <span :style="{ width: `${guildConstructionProgress}%` }"></span>
            </div>
            <small>{{ guildConstructionExp.toLocaleString() }} / {{ guildLevelRequirements.construction.toLocaleString() }} 建設經驗</small>
          </div>
        </div>

        <div class="guild-growth-actions">
          <p>所有職位可使用錢包金幣進行集團貢獻；建設與升級限總經理、總裁。原型建設費率：1 經驗扣 1 金幣。</p>
        </div>
        <p v-if="guildGrowthNotice" class="guild-edit-notice guild-growth-notice" role="status">{{ guildGrowthNotice }}</p>
      </section>

      <div class="guild-detail-stats">
        <div class="guild-detail-stat">
          <span>人數</span>
          <strong>{{ displayGuildMembers.length }} / {{ joinedGuild.maxMembers }}</strong>
        </div>
  <div class="guild-detail-stat guild-review-stat">
          <div class="guild-stat-title-row guild-review-title-row">
            <span>審核機制</span>
            <div class="guild-review-actions">
              <button v-if="canEditGuildReviewMode" type="button" class="guild-icon-action guild-stat-edit" title="編輯審核機制" aria-label="編輯審核機制" @click="openGuildEditor('review')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
              </button>
              <button
                v-if="canReviewGuildApplications"
                type="button"
                class="guild-icon-action guild-review-list-trigger"
                title="審核清單"
                :aria-label="`審核清單，${guildApplications.length} 筆待審核申請`"
                @click="showGuildApplicationsModal = true"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m8 13 2 2 4-4M8 18h8"/></svg>
                <span aria-hidden="true">{{ guildApplications.length }}</span>
              </button>
            </div>
          </div>
          <strong>{{ reviewLabels[displayGuildReviewMode] }}</strong>
          <p v-if="guildReviewNotice" class="guild-edit-notice">{{ guildReviewNotice }}</p>
        </div>
      </div>

      <details class="guild-economy-guide">
        <summary class="guild-economy-guide-heading">
          <div>
            <h3 id="guild-economy-guide-title">影響力與金庫來源</h3>
            <p>計算方式與金幣換算比例</p>
          </div>
          <span aria-hidden="true" class="guild-economy-guide-toggle">⌄</span>
        </summary>
        <div class="guild-economy-guide-grid">
          <article>
            <h4>影響力如何取得</h4>
            <ul>
              <li>加入集團後的有效遊戲流水：<strong>1 金幣 = 1 影響力</strong>；銀幣按 <strong>{{ GOLD_TO_SILVER_RATE }} 銀幣 = 1 金幣等值</strong>折算。</li>
              <li>加入後成功儲值：<strong>1 金幣 = 1 影響力</strong>。</li>
              <li>完成集團任務：依任務卡所列數值增加；捐獻金庫不增加影響力。</li>
            </ul>
            <p>退出後個人流水重新起算；已累積至集團的影響力不扣回。</p>
          </article>
          <article>
            <h4>金庫金幣從哪裡來</h4>
            <ul>
              <li>遊戲有效打碼：每 <strong>1,000 金幣等值打碼增加 10 金庫金幣</strong>（依後台目前配置）。</li>
              <li>成員使用個人錢包捐獻：<strong>1 金幣捐獻 = 1 金庫金幣</strong>。</li>
              <li>排行榜獎勵額度預扣：獎勵總銀幣 ÷ {{ GOLD_TO_SILVER_RATE }}，由金庫預扣等值金幣；即使關閉榜單獎勵，仍依設定額度預扣，調低或歸零獎勵才會退回差額。</li>
              <li>建設新增經驗及排行榜銀幣派發列為支出；銀幣按 <strong>{{ GOLD_TO_SILVER_RATE }} 銀 = 1 金</strong>折成金庫金幣顯示。</li>
              <li>目前餘額另含原型預設的集團初始金庫。</li>
            </ul>
          </article>
        </div>
      </details>
    </section>

    <nav v-if="joinedGuild" class="guild-panel-tabs guild-top-tabs card-purple" aria-label="集團功能分頁" role="tablist">
      <button
        v-for="tab in guildPanelTabs"
        :key="tab.key"
        type="button"
        role="tab"
        :aria-selected="activeGuildPanel === tab.key"
        :class="{ active: activeGuildPanel === tab.key }"
        @click="activeGuildPanel = tab.key"
      >
        {{ tab.label }}
      </button>
      <div class="guild-top-actions">
        <button type="button" class="guild-leaderboard-trigger" @click="openGuildLeaderboard">
          <span aria-hidden="true">🏆</span> 集團風雲榜
        </button>
        <button
          type="button"
          class="guild-chat-tab-button"
          aria-label="前往集團頻道聊天室"
          @click="router.push({ path: '/lobby/chat', query: { channel: 'guild' } })"
        >
          聊天室
        </button>
        <button type="button" class="leave-guild-button" @click="showLeaveConfirm = true">{{ guildExitActionLabel }}</button>
      </div>
    </nav>

    <div
      v-if="showGuildLeaderboardModal"
      class="guild-edit-backdrop guild-leaderboard-backdrop"
      role="presentation"
      @click.self="showGuildLeaderboardModal = false"
      @keydown.esc="showGuildLeaderboardModal = false"
    >
      <section class="guild-edit-modal card-purple guild-leaderboard-modal" role="dialog" aria-modal="true" aria-labelledby="guild-leaderboard-title">
        <header class="guild-edit-modal-heading">
          <div>
            <p class="guild-eyebrow">GROUP LEADERBOARD</p>
            <h2 id="guild-leaderboard-title">集團風雲榜</h2>
              <p class="guild-leaderboard-subtitle">榮耀排名與銀幣獎勵</p>
              <p class="guild-leaderboard-schedule">每週一 00:00:00 重算｜00:05:00–00:15:00 派發・台北時間</p>
          </div>
          <div class="guild-leaderboard-heading-actions">
            <button
              v-if="canConfigureGuildLeaderboard && !showGuildLeaderboardSettings"
              type="button"
              class="guild-leaderboard-settings-trigger"
              @click="openGuildLeaderboardSettings"
            >排行榜獎勵設定</button>
            <button type="button" class="guild-edit-modal-close" aria-label="關閉集團排行榜" @click="showGuildLeaderboardModal = false">×</button>
          </div>
        </header>

        <div class="guild-leaderboard-tabs" role="tablist" aria-label="選擇集團排行榜">
          <button
            v-for="tab in guildLeaderboardTabs"
            :key="tab.key"
            type="button"
            role="tab"
            :aria-selected="activeGuildLeaderboard === tab.key"
            :class="{ active: activeGuildLeaderboard === tab.key }"
            @click="activeGuildLeaderboard = tab.key; guildLeaderboardNotice = ''"
          >{{ tab.label }}</button>
        </div>

        <p v-if="guildLeaderboardNotice" class="guild-leaderboard-notice" :class="{ 'is-error': guildLeaderboardNoticeType === 'error' }" role="status">{{ guildLeaderboardNotice }}</p>

        <div v-if="showGuildLeaderboardSettings && canConfigureGuildLeaderboard" class="guild-leaderboard-settings">
          <div class="guild-leaderboard-settings-heading">
            <div>
              <h3>{{ guildLeaderboardTabs.find(tab => tab.key === activeGuildLeaderboard)?.label }}獎勵</h3>
              <p>每個榜可獨立開關；僅總裁與總經理可編輯。</p>
            </div>
            <span>銀幣</span>
          </div>
          <p v-if="guildLeaderboardAutoPaused" class="guild-leaderboard-pause-banner" role="status">金庫額度不足，四榜排名與獎勵目前已暫停；補足金庫或降低獎勵額度後，重新儲存即可恢復。</p>
          <label class="guild-leaderboard-reward-toggle">
            <input v-model="guildLeaderboardEnabledDraft[activeGuildLeaderboard]" type="checkbox" />
            <span class="guild-leaderboard-toggle-indicator" aria-hidden="true"></span>
            <span>{{ guildLeaderboardEnabledDraft[activeGuildLeaderboard] ? '本榜獎勵已開啟' : '本榜獎勵未開啟' }}</span>
          </label>
          <div class="guild-leaderboard-funding-summary" aria-live="polite">
            <div><span>本榜十名獎勵合計</span><strong>{{ draftLeaderboardRewardTotalSilver.toLocaleString() }} 銀幣</strong></div>
            <div><span>目前金庫餘額</span><strong>{{ guildTreasuryBalance.toLocaleString() }} 金幣</strong></div>
            <div><span>四榜預扣集團金庫額度（目前 → 儲存後）</span><strong>{{ guildLeaderboardTotalReservedGold.toLocaleString() }} → {{ projectedLeaderboardReservedGold.toLocaleString() }} 金幣</strong></div>
          </div>
          <p class="guild-leaderboard-funding-hint">獎勵免流水，依 1 金幣 = {{ GOLD_TO_SILVER_RATE }} 銀幣折合保險箱金幣；每名獎勵需為 {{ GOLD_TO_SILVER_RATE }} 銀幣倍數。金庫依設定額度預扣，不受本榜獎勵開關影響；調低或歸零獎勵設定才會退回差額。</p>
          <div class="guild-leaderboard-reward-list">
            <label v-for="(amount, index) in guildLeaderboardRewardDraft[activeGuildLeaderboard]" :key="index" class="guild-leaderboard-reward-row">
              <span class="guild-leaderboard-reward-rank">第 {{ index + 1 }} 名</span>
              <input v-model.number="guildLeaderboardRewardDraft[activeGuildLeaderboard][index]" type="number" min="0" :step="GOLD_TO_SILVER_RATE" inputmode="numeric" :aria-label="`第 ${index + 1} 名銀幣獎勵`" />
              <span>銀幣</span>
              <span class="guild-leaderboard-insurance-equivalent">保險金 {{ (Number(amount) / GOLD_TO_SILVER_RATE || 0).toLocaleString() }} 金幣</span>
            </label>
          </div>
          <div class="guild-edit-modal-actions">
            <button type="button" class="leave-cancel-button" @click="showGuildLeaderboardSettings = false; guildLeaderboardNotice = ''">取消</button>
            <button type="button" class="guild-edit-save" @click="saveGuildLeaderboardRewards">儲存並調整金庫</button>
          </div>
        </div>

        <div v-else-if="guildLeaderboardAutoPaused" class="guild-leaderboard-paused" role="status">
          <span aria-hidden="true">⏸</span>
          <strong>金庫額度不足，四榜已暫停</strong>
          <p>排行榜名次與獎勵發放暫停顯示。總裁或總經理補足金庫或降低獎勵額度後，重新儲存即可恢復。</p>
        </div>

        <div v-else class="guild-leaderboard-content">
          <div class="guild-leaderboard-podium" aria-label="排行榜前三名">
            <article v-for="entry in guildLeaderboardPodium" :key="entry.rank" class="guild-podium-card" :class="`rank-${entry.rank}`">
              <span class="guild-podium-crown" aria-hidden="true">{{ entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : '🥉' }}</span>
              <span class="guild-podium-avatar" aria-hidden="true">{{ entry.avatar }}</span>
              <span class="guild-podium-rank">第 {{ entry.rank }} 名</span>
              <strong class="guild-podium-name">{{ entry.name }}</strong>
              <strong class="guild-podium-score">
                {{ entry.value.toLocaleString() }}<small v-if="activeGuildLeaderboard === 'contribution'"> 金幣</small>
              </strong>
              <span v-if="guildLeaderboardEnabled[activeGuildLeaderboard]" class="guild-podium-reward">保險金 +{{ entry.insuranceGold.toLocaleString() }} 金幣</span>
              <span v-else class="guild-podium-reward is-disabled">本榜未開獎</span>
            </article>
          </div>

          <div class="guild-leaderboard-runners-up-scroll">
            <div class="guild-leaderboard-list-heading">
              <h3>第 4–10 名</h3>
              <span>{{ guildLeaderboardTabs.find(tab => tab.key === activeGuildLeaderboard)?.metricLabel }}</span>
            </div>
            <ol class="guild-leaderboard-list" start="4">
              <li v-for="entry in guildLeaderboardRunnersUp" :key="entry.rank" class="guild-leaderboard-row">
                <span class="guild-leaderboard-rank">{{ entry.rank }}</span>
                <span class="guild-leaderboard-avatar" aria-hidden="true">{{ entry.avatar }}</span>
                <strong class="guild-leaderboard-name">{{ entry.name }}</strong>
                <strong class="guild-leaderboard-value">
                  {{ entry.value.toLocaleString() }}<small v-if="activeGuildLeaderboard === 'contribution'"> 金幣</small>
                </strong>
                <span v-if="guildLeaderboardEnabled[activeGuildLeaderboard]" class="guild-leaderboard-silver">保險金 +{{ entry.insuranceGold.toLocaleString() }} 金幣</span>
                <span v-else class="guild-leaderboard-silver is-disabled">未開放</span>
              </li>
            </ol>
          </div>
          <p class="guild-leaderboard-footnote">
            <template v-if="activeGuildLeaderboard === 'contribution'">貢獻榜依加入集團後捐入集團金庫的金幣總額排名。</template>
            <template v-else>排名數據依所選項目排序。</template>
            獎勵免流水，銀幣派發按 {{ GOLD_TO_SILVER_RATE }} 銀幣 = 1 金幣記入金庫帳變；目前僅展示週期，實際自動結算需後端排程。
          </p>
        </div>
      </section>
    </div>

    <div
      v-if="showGuildTreasuryLedger"
      class="guild-edit-backdrop guild-treasury-ledger-backdrop"
      role="presentation"
      @click.self="showGuildTreasuryLedger = false"
      @keydown.esc="showGuildTreasuryLedger = false"
    >
      <section class="guild-edit-modal card-purple guild-treasury-ledger-modal" role="dialog" aria-modal="true" aria-labelledby="guild-treasury-ledger-title">
        <header class="guild-edit-modal-heading">
          <div>
            <p class="guild-eyebrow">GROUP TREASURY</p>
            <div class="guild-treasury-ledger-title-row">
              <h2 id="guild-treasury-ledger-title">金庫帳變紀錄</h2>
              <span
                class="guild-treasury-ledger-help"
                tabindex="0"
                role="note"
                :aria-label="guildTreasuryLedgerHelpText"
                :data-tooltip="guildTreasuryLedgerHelpText"
              >ⓘ</span>
            </div>
            <p class="guild-treasury-ledger-balance">目前可用餘額 <strong>{{ guildTreasuryBalance.toLocaleString() }} 金幣</strong></p>
          </div>
          <button type="button" class="guild-edit-modal-close" aria-label="關閉金庫帳變紀錄" @click="showGuildTreasuryLedger = false">×</button>
        </header>

        <div class="guild-treasury-ledger-columns" aria-hidden="true"><span>時間／來源</span><span>操作人</span><span>帳變說明</span><span>金額（金幣）</span></div>
        <ol class="guild-treasury-ledger-list" aria-label="金庫帳變明細">
          <li v-for="entry in visibleGuildTreasuryLedger" :key="entry.id" class="guild-treasury-ledger-row">
            <div class="guild-treasury-ledger-source">
              <strong>{{ entry.title }}</strong>
              <small>{{ formatTreasuryEntryTime(entry.createdAt) }}</small>
            </div>
            <div class="guild-treasury-ledger-operator"><span>操作人</span><strong>{{ entry.operatorName || '歷史紀錄未保存' }}</strong></div>
            <p>{{ entry.detail }}</p>
            <strong class="guild-treasury-ledger-amount" :class="entry.amountGold >= 0 ? 'is-income' : 'is-expense'">
              {{ entry.amountGold > 0 ? '+' : '' }}{{ entry.amountGold.toLocaleString() }}
            </strong>
          </li>
        </ol>
      </section>
    </div>

    <div
      v-if="showLeaveConfirm && joinedGuild"
      class="leave-confirm-backdrop"
      role="presentation"
      @click.self="showLeaveConfirm = false"
      @keydown.esc="showLeaveConfirm = false"
    >
      <section class="leave-confirm-modal card-purple" role="dialog" aria-modal="true" aria-labelledby="leave-guild-title">
        <h2 id="leave-guild-title">{{ guildExitConfirmTitle }}</h2>
        <p>{{ guildExitConfirmDescription }}</p>
        <div class="leave-confirm-actions">
          <button type="button" class="leave-cancel-button" @click="showLeaveConfirm = false">取消</button>
          <button
            type="button"
            class="leave-confirm-button"
            @click="leaveGuild(); showLeaveConfirm = false; router.replace('/lobby/guilds')"
          >
            {{ guildExitConfirmLabel }}
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="showKickConfirm && memberToKick"
      class="leave-confirm-backdrop"
      role="presentation"
      @click.self="cancelKickMember"
      @keydown.esc="cancelKickMember"
    >
      <section class="leave-confirm-modal card-purple" role="dialog" aria-modal="true" aria-labelledby="kick-member-title">
        <p class="guild-eyebrow">MEMBER MANAGEMENT</p>
        <h2 id="kick-member-title">確定要踢除成員嗎？</h2>
        <p>確定要將「{{ memberToKick.name }}」移出目前集團嗎？此操作為前端展示用。</p>
        <div class="leave-confirm-actions">
          <button type="button" class="leave-cancel-button" @click="cancelKickMember">取消</button>
          <button type="button" class="leave-confirm-button" @click="confirmKickMember">確認踢除</button>
        </div>
      </section>
    </div>

    <div
      v-if="showMemberRoleModal && memberRoleTarget"
      class="leave-confirm-backdrop"
      role="presentation"
      @click.self="showMemberRoleModal = false; memberRoleTarget = null"
      @keydown.esc="showMemberRoleModal = false; memberRoleTarget = null"
    >
      <section class="leave-confirm-modal card-purple" role="dialog" aria-modal="true" aria-labelledby="guild-member-role-title">
        <p class="guild-eyebrow">MEMBER MANAGEMENT</p>
        <h2 id="guild-member-role-title">職務任免</h2>
        <p>調整「{{ memberRoleTarget.name }}」的職務。選擇「職員」可免除管理職；總裁職務請使用轉讓功能。</p>
        <label class="guild-member-role-label" for="guild-member-role-select">新職務</label>
        <select id="guild-member-role-select" v-model="memberRoleDraft" class="guild-member-role-select">
          <option v-for="role in guildMemberRoleOptions" :key="role" :value="role">{{ role }}</option>
        </select>
        <div class="leave-confirm-actions">
          <button type="button" class="leave-cancel-button" @click="showMemberRoleModal = false; memberRoleTarget = null">取消</button>
          <button type="button" class="guild-member-action-confirm" @click="saveGuildMemberRole">確認任免</button>
        </div>
      </section>
    </div>

    <div
      v-if="showPresidentTransferConfirm && memberToTransferPresident"
      class="leave-confirm-backdrop"
      role="presentation"
      @click.self="cancelGuildPresidentTransfer"
      @keydown.esc="cancelGuildPresidentTransfer"
    >
      <section class="leave-confirm-modal card-purple" role="dialog" aria-modal="true" aria-labelledby="guild-president-transfer-title">
        <p class="guild-eyebrow">LEADERSHIP TRANSFER</p>
        <h2 id="guild-president-transfer-title">確認轉讓總裁職務？</h2>
        <p>轉讓給「{{ memberToTransferPresident.name }}」後，原總裁會降為職員並失去總裁權限；目前的權限預覽也會切回職員。</p>
        <div class="leave-confirm-actions">
          <button type="button" class="leave-cancel-button" @click="cancelGuildPresidentTransfer">取消</button>
          <button type="button" class="guild-member-action-confirm" @click="confirmGuildPresidentTransfer">確認轉讓</button>
        </div>
      </section>
    </div>

    <section v-if="joinedGuild" class="guild-workspace-card card-purple" aria-label="集團功能區">
      <div v-if="activeGuildPanel === 'list'" class="guild-panel-content">
        <div class="guild-directory-summary">
          <span>共 {{ filteredGuilds.length }} 個集團</span>
        </div>

        <div class="guild-directory-toolbar" aria-label="集團清單篩選">
          <label class="guild-directory-search">
            <span aria-hidden="true">⌕</span>
            <span class="sr-only">搜尋集團名稱</span>
            <input v-model="searchQuery" type="search" placeholder="搜尋集團名稱" />
          </label>
          <label class="guild-directory-filter">
            <span>審核機制</span>
            <select v-model="reviewFilter" aria-label="依審核機制篩選">
              <option value="all">全部</option>
              <option value="auto">自動審核</option>
              <option value="manual">人工審核</option>
            </select>
          </label>
        </div>

        <div v-if="visibleGuilds.length" class="guild-table-wrap">
          <table class="guild-directory-table">
            <thead>
              <tr>
                <th scope="col">名次</th>
                <th scope="col">集團名稱</th>
                <th scope="col">人數</th>
                <th scope="col">集團影響力</th>
                <th scope="col">審核機制</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="guild in visibleGuilds" :key="guild.name">
                <td><span class="guild-rank" :class="{ 'is-top': guild.rank <= 3 }">{{ guild.rank }}</span></td>
                <td><strong class="guild-name-link">{{ guild.name }}</strong></td>
                <td>{{ guild.members }} / {{ guild.maxMembers }}</td>
                <td><strong class="guild-score">{{ guild.score.toLocaleString() }}</strong></td>
                <td><span class="guild-review" :class="`is-${guild.reviewMode}`">{{ reviewLabels[guild.reviewMode] }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="guild-empty">
          <span class="guild-empty-icon" aria-hidden="true">⌕</span>
          <h2>找不到符合條件的集團</h2>
          <p>請調整集團名稱或審核機制，再試一次。</p>
        </div>

        <nav v-if="filteredGuilds.length" class="guild-pagination" aria-label="集團清單分頁">
          <button type="button" :disabled="currentPage === 1" aria-label="上一頁" @click="selectPage(currentPage - 1)">‹</button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="{ active: currentPage === page }"
            :aria-current="currentPage === page ? 'page' : undefined"
            @click="selectPage(page)"
          >
            {{ page }}
          </button>
          <button type="button" :disabled="currentPage === totalPages" aria-label="下一頁" @click="selectPage(currentPage + 1)">›</button>
        </nav>
      </div>

      <div v-else-if="activeGuildPanel === 'info'" class="guild-panel-content">
        <div class="guild-members-card card-purple">
          <div class="guild-members-heading">
            <div>
              <h3 class="guild-members-title">
                成員列表
                <span
                  class="member-period-hint"
                  tabindex="0"
                  role="img"
                  aria-label="影響力、遊戲戰力與儲值皆以加入集團後流水計算，退出後重新起算"
                  data-tooltip="影響力、遊戲戰力與儲值皆以加入集團後流水計算，退出後重新起算"
                >i</span>
              </h3>
            </div>
            <div class="member-sort-tabs" role="group" aria-label="成員排序">
              <button
                type="button"
                :class="{ active: memberSort === 'influence' }"
                :aria-pressed="memberSort === 'influence'"
                :aria-label="memberSortAriaLabels.influence"
                @click="setMemberSort('influence')"
              >{{ memberSortLabels.influence }}</button>
              <button
                type="button"
                :class="{ active: memberSort === 'gamePower' }"
                :aria-pressed="memberSort === 'gamePower'"
                :aria-label="memberSortAriaLabels.gamePower"
                @click="setMemberSort('gamePower')"
              >{{ memberSortLabels.gamePower }}</button>
              <button
                type="button"
                :class="{ active: memberSort === 'deposit' }"
                :aria-pressed="memberSort === 'deposit'"
                :aria-label="memberSortAriaLabels.deposit"
                @click="setMemberSort('deposit')"
              >{{ memberSortLabels.deposit }}</button>
            </div>
          </div>
          <div class="guild-members-table-wrap">
            <table class="guild-members-table">
              <thead>
                <tr>
                  <th scope="col">職稱</th>
                  <th scope="col">頭像</th>
                  <th scope="col">VIP等級</th>
                  <th scope="col">暱稱</th>
                  <th scope="col">狀態</th>
                  <th scope="col">最後在線時間</th>
                  <th scope="col">
                    <button
                      type="button"
                      class="member-sort-button active"
                      :aria-pressed="true"
                      :aria-label="memberSortAriaLabels[memberSort]"
                      @click="setMemberSort(memberSort)"
                    >
                      <span>{{ memberSortLabels[memberSort] }}</span>
                      <span class="member-sort-indicator" aria-hidden="true">↓</span>
                    </button>
                  </th>
                  <th v-if="canManageGuildMembers" scope="col">管理</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(member, index) in visibleGuildMembers"
                  :key="member.name"
                  class="guild-member-row-clickable"
                  tabindex="0"
                  @click="openMember(member, ((currentMemberPage - 1) * memberPageSize) + index)"
                  @keydown.enter="openMember(member, ((currentMemberPage - 1) * memberPageSize) + index)"
                  @keydown.space.prevent="openMember(member, ((currentMemberPage - 1) * memberPageSize) + index)"
                >
                  <td><span class="member-title">{{ member.title }}</span></td>
                  <td><span class="member-avatar" aria-hidden="true">{{ member.avatar }}</span></td>
                  <td><span class="member-vip">VIP {{ member.vip }}</span></td>
                  <td><strong class="member-name">{{ member.name }}</strong></td>
                  <td>
                    <span class="member-status" :class="{ 'is-online': member.isOnline }">
                      <i aria-hidden="true"></i>{{ member.isOnline ? '在線' : '離線' }}
                    </span>
                  </td>
                  <td><span class="member-last-online">{{ member.lastOnlineAt }}</span></td>
                  <td><strong class="member-metric-value" :class="{ 'is-influence': memberSort === 'influence' }">{{ member[memberSort].toLocaleString() }}</strong></td>
                  <td v-if="canManageGuildMembers">
                    <div class="guild-member-action-group">
                      <button
                        v-if="canAssignGuildMemberRole(member)"
                        type="button"
                        class="member-role-button"
                        :aria-label="`任免 ${member.name} 的職務`"
                        @click.stop="openGuildMemberRoleEditor(member)"
                      >任免</button>
                      <button
                        v-if="canTransferGuildPresident(member)"
                        type="button"
                        class="member-transfer-button"
                        :aria-label="`將總裁職務轉讓給 ${member.name}`"
                        @click.stop="requestGuildPresidentTransfer(member)"
                      >轉讓</button>
                      <button
                        type="button"
                        class="member-kick-button"
                        :disabled="!canKickMember(member)"
                        @click.stop="requestKickMember(member)"
                      >{{ canKickMember(member) ? '踢除' : '不可操作' }}</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <nav class="guild-pagination member-pagination" aria-label="成員列表分頁">
            <span class="guild-pagination-summary">第 {{ currentMemberPage }} / {{ memberTotalPages }} 頁・共 {{ displayGuildMembers.length }} 位</span>
            <div class="guild-pagination-controls">
              <button type="button" :disabled="currentMemberPage === 1" aria-label="上一頁" @click="selectMemberPage(currentMemberPage - 1)">‹</button>
              <button
                v-for="page in memberTotalPages"
                :key="page"
                type="button"
                :class="{ active: currentMemberPage === page }"
                :aria-current="currentMemberPage === page ? 'page' : undefined"
                @click="selectMemberPage(page)"
              >
                {{ page }}
              </button>
              <button type="button" :disabled="currentMemberPage === memberTotalPages" aria-label="下一頁" @click="selectMemberPage(currentMemberPage + 1)">›</button>
            </div>
          </nav>
        </div>
      </div>

      <div v-else-if="activeGuildPanel === 'announcement'" class="guild-panel-content guild-announcements-panel">
        <div class="guild-panel-heading">
          <div>
            <h2>集團公告</h2>
            <p>查看會長與管理員發布的公告。</p>
          </div>
        </div>
        <textarea
          class="guild-announcement-textarea"
          aria-label="集團公告內容"
          v-model="guildAnnouncementDraft"
          readonly
        ></textarea>
        <div class="guild-edit-footer">
          <span>{{ canEditGuildAnnouncement ? '目前角色可編輯公告內容。' : '目前角色僅可查看公告內容。' }}</span>
          <button v-if="canEditGuildAnnouncement" type="button" @click="openGuildEditor('announcement')">編輯公告</button>
        </div>
        <p v-if="announcementNotice" class="guild-edit-notice" role="status">{{ announcementNotice }}</p>
      </div>

      <div v-else-if="activeGuildPanel === 'task'" class="guild-panel-content guild-tasks-panel">
        <div class="guild-panel-heading">
          <div>
            <h2>集團任務</h2>
            <p>各自完成日／週／月任務，只計本人進度，不合併其他會員進度。</p>
          </div>
          <span>九宮格任務</span>
        </div>
        <div class="guild-task-period-tabs" role="tablist" aria-label="集團任務週期">
          <button
            v-for="period in (['day', 'week', 'month'] as GuildTaskPeriod[])"
            :key="period"
            type="button"
            role="tab"
            :aria-selected="activeGuildTaskPeriod === period"
            :class="{ active: activeGuildTaskPeriod === period }"
            @click="activeGuildTaskPeriod = period"
          >{{ guildTaskPeriodLabels[period] }}</button>
        </div>
        <p class="guild-task-period-note">{{ guildTaskPeriodNotes[activeGuildTaskPeriod] }}</p>
        <p class="guild-task-reward-note">銀幣額度為原型示意：日任務 100、週任務 500、月任務 2,000 銀幣。</p>
        <div class="guild-task-grid">
          <article
            v-for="task in guildTaskTemplates"
            :key="task.id"
            class="guild-task-card"
            :class="{ 'is-completed': task.completed }"
          >
            <div class="guild-task-card-heading">
              <span class="guild-task-index">{{ String(task.id).padStart(2, '0') }}</span>
              <div class="guild-task-status-group">
                <span class="guild-task-period-badge">{{ guildTaskPeriodLabels[activeGuildTaskPeriod] }}</span>
                <span
                  v-if="task.completed"
                  class="guild-task-stamp"
                  :class="`is-${task.completedStyle}`"
                  :title="`完成印章：${task.completedStyleLabel}`"
                >
                  <strong>完成</strong>
                </span>
              </div>
            </div>
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <div class="guild-task-target"><strong>{{ task.targets[activeGuildTaskPeriod].toLocaleString() }}</strong><span>{{ task.unit }}目標</span></div>
            <div class="guild-task-progress" :class="{ completed: task.completed }">
              <span class="guild-task-progress-icon" aria-hidden="true">{{ task.completed ? '✓' : '○' }}</span>
              <span>{{ task.completed ? '任務已達成' : '進行中' }}</span>
            </div>
            <div class="guild-task-meta">
              <span v-if="task.scopeLabel">{{ task.scopeLabel }}</span>
              <div class="guild-task-rewards" aria-label="任務獎勵">
                <strong class="guild-task-reward is-influence">+{{ task.reward }} 影響力</strong>
                <strong class="guild-task-reward is-silver">+{{ guildTaskSilverReward[activeGuildTaskPeriod].toLocaleString() }} 銀幣</strong>
              </div>
            </div>
          </article>
        </div>
      </div>

    </section>

    <div
      v-if="showGuildApplicationsModal"
      class="guild-applications-backdrop"
      role="presentation"
      @click.self="showGuildApplicationsModal = false"
      @keydown.esc="showGuildApplicationsModal = false"
    >
      <section class="guild-applications-modal card-purple" role="dialog" aria-modal="true" aria-labelledby="guild-applications-title">
        <header class="guild-applications-heading">
          <div>
            <p class="guild-eyebrow">GROUP APPLICATIONS</p>
            <h2 id="guild-applications-title">入會審核清單</h2>
          </div>
          <button type="button" class="guild-edit-modal-close" aria-label="關閉審核清單" @click="showGuildApplicationsModal = false">×</button>
        </header>
        <p class="guild-applications-intro">目前有 {{ guildApplications.length }} 位玩家申請加入集團。</p>
        <p v-if="guildApplicationNotice" class="guild-edit-notice" role="status">{{ guildApplicationNotice }}</p>
        <div v-if="guildApplications.length" class="guild-applications-list">
          <article v-for="application in guildApplications" :key="application.id" class="guild-application-item">
            <div class="guild-application-identity">
              <span class="guild-application-avatar" aria-hidden="true">{{ application.avatar }}</span>
              <div>
                <strong>{{ application.name }}</strong>
                <span>VIP {{ application.vip }}・{{ application.submittedAt }}</span>
              </div>
            </div>
            <p>{{ application.message }}</p>
            <div class="guild-application-actions">
              <button type="button" class="guild-application-reject" @click="resolveGuildApplication(application, 'reject')">拒絕</button>
              <button type="button" class="guild-application-approve" @click="resolveGuildApplication(application, 'approve')">批准加入</button>
            </div>
          </article>
        </div>
        <div v-else class="guild-applications-empty">目前沒有待審核的入會申請。</div>
      </section>
    </div>

    <div
      v-if="activeGuildEditor"
      class="guild-edit-backdrop"
      role="presentation"
      @click.self="closeGuildEditor"
      @keydown.esc="closeGuildEditor"
    >
      <form class="guild-edit-modal card-purple" role="dialog" aria-modal="true" aria-labelledby="guild-edit-modal-title" @submit.prevent>
        <div class="guild-edit-modal-heading">
          <div>
            <p class="guild-eyebrow">GROUP EDITOR</p>
            <h2 id="guild-edit-modal-title">
              {{ activeGuildEditor === 'badge' ? '編輯集團圖標' : activeGuildEditor === 'name' ? '編輯集團名稱' : activeGuildEditor === 'review' ? '編輯審核機制' : '編輯集團公告' }}
            </h2>
          </div>
          <button type="button" class="guild-edit-modal-close" aria-label="關閉編輯視窗" @click="closeGuildEditor">×</button>
        </div>

        <div v-if="activeGuildEditor === 'badge'" class="guild-badge-editor">
          <div class="guild-badge-options">
            <button
              v-for="badge in guildBadgeOptions"
              :key="badge.id"
              type="button"
              class="guild-badge-option"
              :class="{ active: guildBadgeDraft === badge.icon }"
              :aria-label="badge.label"
              @click="selectGuildBadgeOption(badge.icon)"
            >{{ badge.icon }}</button>
          </div>
          <label class="guild-badge-color-field">
            <span>背景色</span>
            <input v-model="guildBadgeBackgroundDraft" type="color" aria-label="徽章背景色" />
          </label>
          <div class="guild-badge-editor-preview" :style="{ background: guildBadgeBackgroundDraft }">
            <span>{{ guildBadgeDraft }}</span>
          </div>
          <p v-if="guildBadgeNotice" class="guild-edit-notice" role="status">{{ guildBadgeNotice }}</p>
        </div>

        <div v-else-if="activeGuildEditor === 'name'" class="guild-modal-field">
          <label for="guild-name-editor">集團名稱</label>
          <input id="guild-name-editor" v-model="guildNameDraft" type="text" maxlength="24" autocomplete="off" />
          <p v-if="guildNameNotice" class="guild-edit-notice" role="status">{{ guildNameNotice }}</p>
        </div>

        <div v-else-if="activeGuildEditor === 'review'" class="guild-modal-field">
          <label for="guild-review-editor">審核機制</label>
          <select id="guild-review-editor" v-model="guildReviewModeDraft">
            <option value="auto">自動審核</option>
            <option value="manual">人工審核</option>
          </select>
          <p v-if="guildReviewNotice" class="guild-edit-notice" role="status">{{ guildReviewNotice }}</p>
        </div>

        <div v-else class="guild-modal-field guild-announcement-modal-field">
          <label for="guild-announcement-editor">集團公告內容</label>
          <textarea id="guild-announcement-editor" v-model="guildAnnouncementDraft" rows="8"></textarea>
          <p v-if="announcementNotice" class="guild-edit-notice" role="status">{{ announcementNotice }}</p>
        </div>

        <div class="guild-edit-modal-actions">
          <button type="button" class="leave-cancel-button" @click="closeGuildEditor">取消</button>
          <button v-if="activeGuildEditor === 'badge'" type="button" class="guild-edit-save" @click="saveGuildBadge">儲存圖標</button>
          <button v-else-if="activeGuildEditor === 'name'" type="button" class="guild-edit-save" @click="saveGuildName">儲存名稱</button>
          <button v-else-if="activeGuildEditor === 'review'" type="button" class="guild-edit-save" @click="saveGuildReviewMode">儲存審核機制</button>
          <button v-else type="button" class="guild-edit-save" @click="saveGuildAnnouncement">儲存公告</button>
        </div>
      </form>
    </div>

    <div
      v-if="showGuildContributionModal"
      class="guild-edit-backdrop"
      role="presentation"
      @click.self="closeGuildContributionModal"
      @keydown.esc="closeGuildContributionModal"
    >
      <form class="guild-edit-modal card-purple guild-contribution-modal" role="dialog" aria-modal="true" aria-labelledby="guild-contribution-title" @submit.prevent="submitGuildContribution">
        <div class="guild-edit-modal-heading">
          <div>
            <p class="guild-eyebrow">GROUP CONTRIBUTION</p>
            <h2 id="guild-contribution-title">集團貢獻</h2>
          </div>
          <button type="button" class="guild-edit-modal-close" aria-label="關閉集團貢獻視窗" @click="closeGuildContributionModal">×</button>
        </div>
        <div class="guild-modal-field">
          <label for="guild-contribution-amount">貢獻金幣</label>
          <input id="guild-contribution-amount" v-model.number="guildContributionAmount" type="number" min="1" step="1" inputmode="numeric" />
          <small>錢包可用 {{ walletGoldBalance.toLocaleString() }} 金幣；貢獻成功後會加入集團金庫。</small>
        </div>
        <p v-if="guildContributionError" class="guild-contribution-error" role="alert">{{ guildContributionError }}</p>
        <div class="guild-edit-modal-actions">
          <button type="button" class="leave-cancel-button" @click="closeGuildContributionModal">取消</button>
          <button type="submit" class="guild-edit-save">確認貢獻</button>
        </div>
      </form>
    </div>

    <section v-if="!joinedGuild" class="my-guild-card card-purple guild-empty" aria-live="polite">
      <span class="guild-empty-icon" aria-hidden="true">◈</span>
      <h1>尚未加入集團</h1>
      <p>先到集團列表選擇一個集團加入。</p>
      <button type="button" class="btn-gold" @click="router.push('/lobby/guilds')">查看集團列表</button>
    </section>

    <ClientOnly>
      <LobbyPlayerCard
        v-if="selectedMember"
        :player="selectedMember"
        :show-transfer="false"
        @message="messageMember"
        @gift="giftMember"
        @block="blockMember"
        @report="reportMember"
        @close="closeMemberCard"
      />
      <LobbyReportPlayerModal
        v-if="reportTarget"
        :player="reportTarget"
        @close="reportTarget = null"
        @submit="submitMemberReport"
      />
    </ClientOnly>
  </div>
</template>

<style scoped>
.my-guild-page { max-width: 1080px; margin: 0 auto; }
.my-guild-card, .guild-members-card { margin-bottom: 18px; }
.my-guild-card { padding: 28px; }
.guild-permission-switcher { display: grid; gap: 9px; width: min(100%, 190px); margin-bottom: 18px; padding: 12px 10px; }
.guild-permission-heading h2 { margin: 0; font-size: 14px; text-align: center; }
.guild-permission-heading > p:last-child { margin: 5px 0 0; color: var(--color-text-muted); font-size: 9px; line-height: 1.45; text-align: center; }
.guild-role-switch { display: grid; gap: 6px; }
.guild-role-switch button { display: grid; padding: 8px 4px; border: 1px solid rgba(168, 85, 247, .22); border-radius: 9px; color: var(--color-text-muted); background: rgba(18, 12, 41, .46); text-align: center; cursor: pointer; transition: border-color .18s, background .18s, color .18s, transform .18s; }
.guild-role-switch button:hover { border-color: rgba(245, 200, 66, .45); transform: translateY(-1px); }
.guild-role-switch button.active { border-color: rgba(245, 200, 66, .72); color: var(--color-text); background: linear-gradient(135deg, rgba(245, 200, 66, .16), rgba(124, 58, 237, .18)); box-shadow: inset 0 0 0 1px rgba(245, 200, 66, .12); }
.guild-role-switch button strong { font-size: 13px; }
.guild-permission-current { display: block; padding: 7px 4px; border: 1px solid rgba(245, 200, 66, .2); border-radius: 9px; color: var(--color-gold-light); background: rgba(245, 200, 66, .07); font-size: 9px; font-weight: 800; text-align: center; }
.guild-permission-summary { margin: 0; color: var(--color-text-muted); font-size: 9px; line-height: 1.45; text-align: center; }
@media (min-width: 1440px) {
  .guild-permission-switcher { position: fixed; top: calc(var(--lobby-header-h) + 92px); left: calc(var(--lobby-sidebar-w) + 12px); z-index: 12; width: max(72px, calc((100vw - var(--lobby-sidebar-w) - 1080px) / 2 - 18px)); max-height: calc(100vh - var(--lobby-header-h) - 110px); overflow-y: auto; margin: 0; backdrop-filter: blur(10px); }
}
.guild-eyebrow { margin: 0 0 5px; color: var(--color-gold); font-size: 11px; font-weight: 900; letter-spacing: .18em; }
.leave-guild-button { padding: 9px 15px; border: 1px solid rgba(248, 113, 113, .55); border-radius: 999px; color: #fecaca; background: rgba(239, 68, 68, .12); font-size: 13px; font-weight: 800; cursor: pointer; }
.leave-guild-button:hover { border-color: #fca5a5; color: #fff; background: rgba(239, 68, 68, .22); }
.guild-top-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; padding: 0 0 10px 16px; }
.guild-chat-tab-button { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; min-height: 38px; padding: 8px 16px; border: 1px solid rgba(168, 85, 247, .55); border-radius: 999px; color: #e9d5ff; background: rgba(124, 58, 237, .2); font: inherit; font-size: 13px; font-weight: 800; white-space: nowrap; cursor: pointer; transition: border-color .18s ease, background .18s ease, color .18s ease; }
.guild-chat-tab-button:hover { border-color: rgba(192, 132, 252, .9); color: #fff; background: rgba(124, 58, 237, .38); }
.guild-top-actions .leave-guild-button { white-space: nowrap; }
.guild-leaderboard-trigger, .guild-leaderboard-settings-trigger { display: inline-flex; flex-shrink: 0; align-items: center; justify-content: center; gap: 7px; min-height: 38px; padding: 8px 14px; border: 1px solid rgba(245, 200, 66, .5); border-radius: 999px; color: var(--color-gold-light); background: rgba(245, 200, 66, .1); font: inherit; font-size: 12px; font-weight: 850; white-space: nowrap; cursor: pointer; transition: background .18s, border-color .18s, transform .18s; }
.guild-leaderboard-trigger:hover, .guild-leaderboard-settings-trigger:hover { border-color: rgba(255, 229, 140, .85); background: rgba(245, 200, 66, .18); transform: translateY(-1px); }
.guild-leaderboard-settings-trigger { min-height: 34px; padding: 7px 11px; font-size: 11px; }
.guild-edit-modal.guild-leaderboard-modal { display: flex; width: min(100%, 860px); height: min(92dvh, 1120px); max-height: calc(100dvh - 36px); flex-direction: column; overflow: hidden; }
.guild-edit-backdrop.guild-leaderboard-backdrop { z-index: 110; }
.guild-leaderboard-modal .guild-edit-modal-heading { flex-shrink: 0; align-items: center; margin-bottom: 16px; }
.guild-leaderboard-modal .guild-edit-modal-heading h2 { font-size: 24px; }
.guild-leaderboard-subtitle { margin: 5px 0 0; color: var(--color-text-muted); font-size: 12px; }
.guild-leaderboard-schedule { margin: 6px 0 0; color: var(--color-gold-light); font-size: 11px; font-weight: 750; }
.guild-leaderboard-heading-actions { display: flex; align-items: center; gap: 10px; }
.guild-leaderboard-tabs { display: flex; flex-shrink: 0; gap: 6px; padding: 5px; border: 1px solid rgba(168, 85, 247, .24); border-radius: 12px; background: rgba(18, 12, 41, .56); }
.guild-leaderboard-tabs button { flex: 1; min-height: 38px; padding: 8px 12px; border: 0; border-radius: 8px; color: var(--color-text-muted); background: transparent; font: inherit; font-size: 12px; font-weight: 850; cursor: pointer; }
.guild-leaderboard-tabs button.active { color: #24133f; background: linear-gradient(135deg, #ffe58c, #e6a91a); box-shadow: 0 4px 14px rgba(245, 200, 66, .18); }
.guild-leaderboard-content { display: flex; min-height: 0; flex: 1 1 0; flex-direction: column; overflow: hidden; padding-right: 2px; }
.guild-leaderboard-settings { min-height: 0; flex: 1 1 0; overflow-y: auto; padding-right: 2px; }
.guild-leaderboard-paused { display: flex; min-height: 220px; flex: 1 1 auto; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 24px; border: 1px solid rgba(245, 200, 66, .25); border-radius: 16px; background: linear-gradient(145deg, rgba(245, 200, 66, .08), rgba(18, 12, 41, .35)); text-align: center; }
.guild-leaderboard-paused > span { color: var(--color-gold-light); font-size: 32px; }
.guild-leaderboard-paused strong { color: var(--color-gold-light); font-size: 17px; }
.guild-leaderboard-paused p { max-width: 460px; margin: 0; color: var(--color-text-muted); font-size: 12px; line-height: 1.7; }
.guild-leaderboard-pause-banner { margin: 0 0 12px; padding: 10px 12px; border: 1px solid rgba(248, 113, 113, .3); border-radius: 10px; color: #fecaca; background: rgba(239, 68, 68, .09); font-size: 11px; line-height: 1.5; }
.guild-leaderboard-podium { display: grid; flex: 0 0 auto; grid-template-columns: 1fr 1.08fr 1fr; align-items: end; gap: 12px; margin: 22px 0 24px; }
.guild-podium-card { position: relative; display: flex; min-width: 0; min-height: 226px; flex-direction: column; align-items: center; justify-content: flex-end; padding: 18px 12px 16px; border: 1px solid rgba(192, 132, 252, .26); border-radius: 18px; background: linear-gradient(155deg, rgba(139, 92, 246, .17), rgba(18, 12, 41, .46)); text-align: center; }
.guild-podium-card.rank-1 { min-height: 260px; border-color: rgba(245, 200, 66, .58); background: linear-gradient(155deg, rgba(245, 200, 66, .17), rgba(124, 58, 237, .16)); box-shadow: 0 12px 30px rgba(245, 200, 66, .1), inset 0 0 0 1px rgba(245, 200, 66, .1); }
.guild-podium-crown { position: absolute; top: 12px; font-size: 24px; }
.guild-podium-avatar { display: grid; width: 54px; height: 54px; margin-bottom: 8px; place-items: center; border: 2px solid rgba(192, 132, 252, .55); border-radius: 50%; background: rgba(124, 58, 237, .24); font-size: 27px; }
.rank-1 .guild-podium-avatar { width: 66px; height: 66px; border-color: rgba(245, 200, 66, .78); background: rgba(245, 200, 66, .12); font-size: 32px; }
.guild-podium-rank { margin: 0 0 4px; color: var(--color-text-muted); font-size: 11px; font-weight: 800; }
.rank-1 .guild-podium-rank { color: var(--color-gold-light); }
.guild-podium-name { max-width: 100%; overflow: hidden; color: var(--color-text); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.guild-podium-score { margin-top: 8px; color: var(--color-gold-light); font-size: 20px; font-weight: 950; font-variant-numeric: tabular-nums; }
.rank-1 .guild-podium-score { font-size: 24px; }
.guild-podium-reward { margin-top: 7px; padding: 5px 9px; border: 1px solid rgba(203, 213, 225, .2); border-radius: 999px; color: #e2e8f0; background: rgba(148, 163, 184, .1); font-size: 10px; font-weight: 850; }
.guild-podium-reward.is-disabled, .guild-leaderboard-silver.is-disabled { border-color: rgba(148, 163, 184, .12); color: var(--color-text-muted); background: rgba(148, 163, 184, .06); }
.rank-1 .guild-podium-reward { border-color: rgba(245, 200, 66, .35); color: var(--color-gold-light); background: rgba(245, 200, 66, .1); }
.guild-leaderboard-list-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin: 0 0 8px; }
.guild-leaderboard-runners-up-scroll { min-height: 80px; flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain; padding-right: 4px; scrollbar-color: rgba(168, 85, 247, .7) rgba(18, 12, 41, .35); scrollbar-width: thin; }
.guild-leaderboard-list-heading h3 { margin: 0; font-size: 15px; }
.guild-leaderboard-list-heading > span { color: var(--color-text-muted); font-size: 11px; }
.guild-leaderboard-list { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.guild-leaderboard-row { display: grid; grid-template-columns: 34px 38px minmax(110px, 1fr) minmax(95px, auto) minmax(95px, auto); align-items: center; gap: 10px; min-height: 54px; padding: 7px 12px; border: 1px solid rgba(255, 255, 255, .07); border-radius: 11px; background: rgba(18, 12, 41, .28); }
.guild-leaderboard-rank { color: var(--color-purple-light); font-size: 15px; font-weight: 950; text-align: center; }
.guild-leaderboard-avatar { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid rgba(168, 85, 247, .28); border-radius: 50%; background: rgba(124, 58, 237, .16); font-size: 18px; }
.guild-leaderboard-name { overflow: hidden; color: var(--color-text); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.guild-leaderboard-value { color: var(--color-gold-light); font-size: 12px; font-variant-numeric: tabular-nums; text-align: right; }
.guild-leaderboard-silver { color: #cbd5e1; font-size: 11px; font-weight: 800; text-align: right; white-space: nowrap; }
.guild-leaderboard-silver.is-disabled { color: var(--color-text-muted); }
.guild-leaderboard-footnote { flex: 0 0 auto; margin: 12px 0 0; color: var(--color-text-muted); font-size: 10px; line-height: 1.5; }
.guild-leaderboard-notice { flex-shrink: 0; margin: 10px 0 0; padding: 8px 11px; border: 1px solid rgba(74, 222, 128, .24); border-radius: 9px; color: #86efac; background: rgba(34, 197, 94, .08); font-size: 11px; }
.guild-leaderboard-notice.is-error { border-color: rgba(248, 113, 113, .36); color: #fca5a5; background: rgba(239, 68, 68, .1); }
.guild-leaderboard-settings { margin-top: 18px; }
.guild-leaderboard-settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
.guild-leaderboard-settings-heading h3 { margin: 0; font-size: 15px; }
.guild-leaderboard-settings-heading p { margin: 4px 0 0; color: var(--color-text-muted); font-size: 11px; }
.guild-leaderboard-settings-heading > span { color: var(--color-gold-light); font-size: 11px; font-weight: 900; }
.guild-leaderboard-reward-toggle { display: inline-flex; align-items: center; gap: 9px; min-height: 40px; margin: 2px 0 12px; padding: 7px 12px; border: 1px solid rgba(168, 85, 247, .28); border-radius: 11px; color: var(--color-text); background: rgba(18, 12, 41, .34); font-size: 12px; font-weight: 800; cursor: pointer; }
.guild-leaderboard-reward-toggle input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.guild-leaderboard-toggle-indicator { position: relative; width: 34px; height: 19px; flex: 0 0 auto; border-radius: 999px; background: rgba(148, 163, 184, .3); transition: background .18s; }
.guild-leaderboard-toggle-indicator::after { position: absolute; top: 3px; left: 3px; width: 13px; height: 13px; border-radius: 50%; background: #e2e8f0; content: ''; transition: transform .18s; }
.guild-leaderboard-reward-toggle input:checked + .guild-leaderboard-toggle-indicator { background: linear-gradient(90deg, #8b5cf6, #c084fc); }
.guild-leaderboard-reward-toggle input:checked + .guild-leaderboard-toggle-indicator::after { transform: translateX(15px); background: #fff; }
.guild-leaderboard-reward-toggle input:focus-visible + .guild-leaderboard-toggle-indicator { outline: 2px solid var(--color-gold-light); outline-offset: 3px; }
.guild-leaderboard-funding-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-bottom: 8px; }
.guild-leaderboard-funding-summary > div { display: flex; min-width: 0; min-height: 58px; flex-direction: column; justify-content: center; gap: 5px; padding: 8px 10px; border: 1px solid rgba(245, 200, 66, .15); border-radius: 10px; background: rgba(245, 200, 66, .045); }
.guild-leaderboard-funding-summary span { color: var(--color-text-muted); font-size: 10px; }
.guild-leaderboard-funding-summary strong { overflow: hidden; color: var(--color-gold-light); font-size: 12px; font-variant-numeric: tabular-nums; text-overflow: ellipsis; white-space: nowrap; }
.guild-leaderboard-funding-hint { margin: 0 0 12px; color: var(--color-text-muted); font-size: 10px; line-height: 1.5; }
.guild-leaderboard-reward-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px 10px; }
.guild-leaderboard-reward-row { display: grid; grid-template-columns: 58px minmax(0, 1fr) 30px minmax(96px, auto); align-items: center; gap: 7px; min-height: 48px; padding: 6px 9px; border: 1px solid rgba(255, 255, 255, .09); border-radius: 10px; background: rgba(18, 12, 41, .28); }
.guild-leaderboard-reward-rank { color: var(--color-text-muted); font-size: 11px; font-weight: 800; }
.guild-leaderboard-reward-row input { width: 100%; min-width: 0; min-height: 34px; padding: 6px 9px; border: 1px solid rgba(168, 85, 247, .3); border-radius: 8px; outline: none; color: var(--color-text); background: rgba(18, 12, 41, .72); font: inherit; font-size: 12px; }
.guild-leaderboard-reward-row input:focus { border-color: rgba(245, 200, 66, .72); box-shadow: 0 0 0 3px rgba(245, 200, 66, .1); }
.guild-leaderboard-reward-row > span:nth-of-type(2) { color: var(--color-gold-light); font-size: 10px; }
.guild-leaderboard-reward-row > .guild-leaderboard-insurance-equivalent { color: #c084fc; font-size: 10px; font-weight: 800; white-space: nowrap; }
.my-guild-profile { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center; gap: 18px; padding: 28px 0 20px; }
.my-guild-profile-identity { display: flex; grid-column: span 2; align-items: center; gap: 18px; min-width: 0; }
.guild-profile-copy { min-width: 0; }
.guild-profile-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.guild-badge-wrap { position: relative; display: grid; justify-items: center; gap: 6px; flex-shrink: 0; }
.guild-badge { display: grid; place-items: center; flex-shrink: 0; width: 82px; height: 82px; border: 2px solid var(--color-gold); border-radius: 24px; background: linear-gradient(145deg, #8b5cf6, #3b0764); box-shadow: 0 10px 24px rgba(124, 58, 237, .35), inset 0 0 0 5px rgba(245, 200, 66, .12); font-size: 38px; }
.guild-icon-action { position: relative; display: grid; width: 42px; height: 42px; flex: 0 0 auto; place-items: center; padding: 0; border: 1px solid rgba(245, 200, 66, .42); border-radius: 12px; color: var(--color-gold-light); background: rgba(245, 200, 66, .1); cursor: pointer; transition: border-color .18s, color .18s, background .18s, transform .18s, box-shadow .18s; }
.guild-icon-action svg { width: 20px; height: 20px; }
.guild-icon-action:hover { border-color: rgba(255, 229, 140, .82); color: #fff1ae; background: rgba(245, 200, 66, .2); box-shadow: 0 4px 14px rgba(245, 200, 66, .16); transform: translateY(-1px); }
.guild-icon-action:focus-visible { outline: 2px solid var(--color-gold-light); outline-offset: 3px; }
.guild-badge-edit { position: absolute; right: -9px; bottom: -8px; width: 38px; height: 38px; border-radius: 50%; box-shadow: 0 5px 14px rgba(10, 7, 28, .38); }
.guild-badge-editor { display: grid; width: 100%; gap: 8px; margin-top: 0; padding: 0; border: 0; background: transparent; }
.guild-badge-options { display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px; }
.guild-badge-option { display: grid; min-width: 0; min-height: 32px; place-items: center; padding: 2px; border: 1px solid rgba(168, 85, 247, .3); border-radius: 8px; background: rgba(255, 255, 255, .06); font-size: 20px; cursor: pointer; }
.guild-badge-option.active { border-color: var(--color-gold); background: rgba(245, 200, 66, .16); box-shadow: inset 0 0 0 1px rgba(245, 200, 66, .24); }
.guild-badge-color-field { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 5px; color: var(--color-text-muted); font-size: 10px; font-weight: 800; text-align: left; }
.guild-badge-color-field input { width: 34px; height: 26px; padding: 0; border: 1px solid rgba(245, 200, 66, .5); border-radius: 6px; background: transparent; cursor: pointer; }
.guild-badge-editor-preview { display: grid; width: 48px; height: 48px; place-items: center; justify-self: center; border: 1px solid var(--color-gold); border-radius: 14px; font-size: 24px; }
.my-guild-profile h2 { margin: 0; font-size: 25px; }
.my-guild-profile p { margin: 7px 0 0; color: var(--color-text-muted); font-size: 14px; }
.guild-edit-toggle { width: 40px; height: 40px; }
.guild-stat-title-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.guild-review-stat { position: relative; padding-right: 122px; }
.guild-stat-title-row.guild-review-title-row { display: block; }
.guild-review-actions { position: absolute; top: 50%; right: 16px; display: inline-flex; align-items: center; gap: 10px; transform: translateY(-50%); }
.guild-stat-edit { width: 40px; height: 40px; }
.guild-review-list-trigger { border-color: rgba(168, 85, 247, .48); color: #e9d5ff; background: rgba(139, 92, 246, .16); }
.guild-review-list-trigger:hover { border-color: rgba(192, 132, 252, .78); color: #fff; background: rgba(139, 92, 246, .28); }
.guild-detail-stat .guild-review-list-trigger span { position: absolute; top: -6px; right: -6px; display: grid; min-width: 20px; height: 20px; place-items: center; padding: 0 4px; border: 2px solid rgba(18, 12, 41, .92); border-radius: 999px; color: #24133f; background: var(--color-gold-light); font-size: 10px; font-weight: 900; }
.guild-edit-save { min-height: 36px; padding: 8px 12px; border: 0; border-radius: 9px; color: #24133f; background: linear-gradient(135deg, #f8d76a, #e6a91a); font-size: 11px; font-weight: 900; cursor: pointer; }
.guild-edit-save:hover { filter: brightness(1.08); }
.guild-detail-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
.guild-detail-stat { padding: 16px; border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; background: rgba(0, 0, 0, .14); }
.guild-detail-stat span { display: block; color: var(--color-text-muted); font-size: 12px; }
.guild-detail-stat strong { display: block; margin-top: 7px; color: var(--color-gold-light); font-size: 21px; }
.guild-growth-panel { display: grid; gap: 16px; margin-top: 14px; padding: 18px; border: 1px solid rgba(245, 200, 66, .22); border-radius: 16px; background: linear-gradient(125deg, rgba(245, 200, 66, .07), rgba(124, 58, 237, .12)); }
.guild-growth-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.guild-growth-heading-copy { display: flex; min-width: 0; align-items: center; gap: 12px; }
.guild-level-badge { display: grid; width: 48px; height: 48px; flex-shrink: 0; place-items: center; border: 2px solid rgba(245, 200, 66, .7); border-radius: 15px; color: #24133f; background: linear-gradient(145deg, #ffe58c, #e6a91a); box-shadow: 0 6px 18px rgba(245, 200, 66, .2); font-size: 21px; font-weight: 950; }
.guild-growth-heading h3 { margin: 0; color: var(--color-text); font-size: 16px; }
.guild-growth-heading p, .guild-growth-actions > p { margin: 4px 0 0; color: var(--color-text-muted); font-size: 11px; line-height: 1.5; }
.guild-growth-progress-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.guild-growth-progress-item { display: grid; gap: 7px; min-width: 0; padding: 12px 14px; border: 1px solid rgba(255, 255, 255, .1); border-radius: 12px; background: rgba(0, 0, 0, .13); }
.guild-growth-progress-label { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: var(--color-text-muted); font-size: 12px; font-weight: 800; }
.guild-growth-progress-label strong { color: var(--color-gold-light); font-size: 13px; }
.guild-growth-progress-track { height: 8px; overflow: hidden; border-radius: 999px; background: rgba(10, 7, 28, .72); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .35); }
.guild-growth-progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #f3b82d, #ffe58c); box-shadow: 0 0 12px rgba(245, 200, 66, .4); transition: width .3s ease; }
.guild-growth-progress-track.construction span { background: linear-gradient(90deg, #9b4df2, #d6a7ff); box-shadow: 0 0 12px rgba(168, 85, 247, .4); }
.guild-growth-progress-item small { overflow: hidden; color: var(--color-text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.guild-growth-actions { display: flex; align-items: center; justify-content: flex-start; gap: 14px; }
.guild-growth-controls { display: flex; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.guild-contribute-button, .guild-build-button, .guild-promote-button { min-height: 36px; padding: 8px 13px; border-radius: 999px; font-size: 11px; font-weight: 850; white-space: nowrap; cursor: pointer; transition: filter .18s, transform .18s, opacity .18s; }
.guild-contribute-button { border: 1px solid rgba(245, 200, 66, .58); color: #24133f; background: linear-gradient(135deg, #ffe58c, #e6a91a); }
.guild-build-button { border: 1px solid rgba(192, 132, 252, .42); color: #ead7ff; background: rgba(124, 58, 237, .2); }
.guild-promote-button { border: 1px solid rgba(74, 222, 128, .4); color: #bbf7d0; background: rgba(34, 197, 94, .14); }
.guild-contribute-button:hover, .guild-build-button:not(:disabled):hover, .guild-promote-button:not(:disabled):hover { filter: brightness(1.1); transform: translateY(-1px); }
.guild-build-button:disabled, .guild-promote-button:disabled { cursor: not-allowed; opacity: .44; }
.guild-growth-notice { margin: 0; }
.guild-contribution-modal { max-width: 430px; }
.guild-modal-field small { color: var(--color-text-muted); font-size: 11px; line-height: 1.5; }
.guild-contribution-error { margin: 12px 0 0; color: #fca5a5; font-size: 12px; font-weight: 800; }
.guild-announcements-card { overflow: hidden; padding: 0; }
.guild-announcements-heading, .guild-panel-heading { display: flex; align-items: end; justify-content: space-between; gap: 14px; }
.guild-announcements-heading { padding: 18px 28px; border-bottom: 1px solid rgba(255, 255, 255, .1); }
.guild-announcements-heading h2, .guild-panel-heading h2 { margin: 0; font-size: 21px; }
.guild-announcements-heading p, .guild-panel-heading p { margin: 6px 0 0; color: var(--color-text-muted); font-size: 13px; }
.guild-announcements-heading > span, .guild-panel-heading > span { color: var(--color-text-muted); font-size: 12px; white-space: nowrap; }
.guild-announcement-scroll { max-height: 164px; overflow-y: auto; padding: 4px 28px 8px; }
.guild-announcement-item { display: flex; align-items: start; justify-content: space-between; gap: 18px; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, .08); }
.guild-announcement-item:last-child { border-bottom: 0; }
.guild-announcement-item h3 { margin: 0; color: var(--color-text); font-size: 14px; }
.guild-announcement-item p { margin: 4px 0 0; color: var(--color-text-muted); font-size: 12px; line-height: 1.6; }
.guild-announcement-item time { flex-shrink: 0; color: var(--color-gold-light); font-size: 11px; }
.guild-announcements-panel .guild-announcement-scroll { max-height: 220px; padding-right: 0; padding-left: 0; }
.guild-announcement-textarea { display: block; width: 100%; min-height: 168px; margin-top: 18px; padding: 18px 22px; border: 1px solid rgba(255, 255, 255, .12); border-radius: 14px; color: var(--color-text); background: rgba(0, 0, 0, .14); font: inherit; font-size: 14px; line-height: 1.8; resize: none; outline: none; }
.guild-announcement-textarea:not([readonly]) { border-color: rgba(245, 200, 66, .48); background: rgba(245, 200, 66, .06); }
.guild-edit-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; color: var(--color-text-muted); font-size: 11px; }
.guild-edit-footer button { padding: 8px 12px; border: 1px solid rgba(245, 200, 66, .48); border-radius: 9px; color: #24133f; background: linear-gradient(135deg, #f8d76a, #e6a91a); font-size: 11px; font-weight: 900; cursor: pointer; }
.guild-edit-footer button:hover { filter: brightness(1.08); }
.guild-edit-notice { margin: 9px 0 0; color: #86efac; font-size: 11px; }
.guild-applications-backdrop { position: fixed; z-index: 65; inset: 0; display: grid; place-items: center; padding: 18px; background: rgba(5,3,18,.78); backdrop-filter: blur(7px); }
.guild-applications-modal { display: flex; width: min(100%, 620px); max-height: calc(100dvh - 36px); flex-direction: column; overflow: hidden; padding: 22px; box-shadow: 0 24px 80px rgba(0,0,0,.48); }
.guild-applications-heading { display: flex; align-items: start; justify-content: space-between; gap: 14px; }
.guild-applications-heading h2 { margin: 0; font-size: 21px; }
.guild-applications-intro { margin: 10px 0 0; color: var(--color-text-muted); font-size: 12px; }
.guild-applications-list { display: grid; gap: 9px; overflow-y: auto; margin-top: 14px; padding-right: 3px; }
.guild-application-item { padding: 13px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: rgba(0,0,0,.14); }
.guild-application-identity { display: flex; align-items: center; gap: 9px; }
.guild-application-avatar { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid rgba(245,200,66,.3); border-radius: 50%; background: rgba(139,92,246,.2); font-size: 20px; }
.guild-application-identity > div { display: grid; gap: 3px; min-width: 0; }
.guild-application-identity strong { color: var(--color-text); font-size: 13px; }
.guild-application-identity span { color: var(--color-text-muted); font-size: 10px; }
.guild-application-item > p { margin: 9px 0 0; color: var(--color-text-muted); font-size: 11px; line-height: 1.6; }
.guild-application-actions { display: flex; justify-content: flex-end; gap: 7px; margin-top: 10px; }
.guild-application-actions button { min-height: 30px; padding: 0 11px; border-radius: 8px; font-size: 10px; font-weight: 850; cursor: pointer; }
.guild-application-reject { border: 1px solid rgba(248,113,113,.42); color: #fecaca; background: rgba(239,68,68,.12); }
.guild-application-approve { border: 1px solid rgba(245,200,66,.45); color: #24133f; background: linear-gradient(135deg,#f8d76a,#e6a91a); }
.guild-applications-empty { display: grid; min-height: 130px; place-items: center; margin-top: 14px; border: 1px dashed rgba(168,85,247,.25); border-radius: 12px; color: var(--color-text-muted); font-size: 12px; }
.guild-task-period-tabs { display: flex; gap: 5px; margin-top: 18px; padding: 5px; border: 1px solid rgba(168, 85, 247, .24); border-radius: 12px; background: rgba(18, 12, 41, .42); }
.guild-task-period-tabs button { flex: 1; padding: 9px 14px; border: 0; border-radius: 8px; color: var(--color-text-muted); background: transparent; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; transition: color .18s, background .18s; }
.guild-task-period-tabs button:hover, .guild-task-period-tabs button.active { color: #24133f; background: linear-gradient(135deg, #f8d76a, #e6a91a); }
.guild-task-period-tabs button:focus-visible { outline: 2px solid rgba(245, 200, 66, .7); outline-offset: 2px; }
.guild-task-period-note { margin: 12px 0 0; color: var(--color-text-muted); font-size: 12px; }
.guild-task-reward-note { margin: 5px 0 0; color: rgba(253, 230, 138, .76); font-size: 11px; }
.guild-task-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
.guild-task-card { position: relative; min-height: 196px; padding: 15px; border: 1px solid rgba(255, 255, 255, .1); border-radius: 14px; background: linear-gradient(145deg, rgba(139, 92, 246, .12), rgba(0, 0, 0, .14)); }
.guild-task-card.is-completed { border-color: rgba(245, 200, 66, .28); background: linear-gradient(145deg, rgba(245, 200, 66, .08), rgba(139, 92, 246, .1)); box-shadow: inset 0 0 0 1px rgba(245, 200, 66, .06), 0 8px 22px rgba(245, 200, 66, .06); }
.guild-task-card-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.guild-task-status-group { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }
.guild-task-index { color: var(--color-gold-light); font-size: 16px; font-weight: 900; }
.guild-task-period-badge { padding: 4px 7px; border: 1px solid rgba(168, 85, 247, .3); border-radius: 999px; color: #ddd6fe; background: rgba(139, 92, 246, .16); font-size: 10px; font-weight: 800; }
.guild-task-stamp { position: absolute; top: 50%; left: 50%; z-index: 2; display: grid; width: 148px; height: 148px; place-items: center; align-content: center; gap: 6px; color: rgba(248, 113, 113, .9); border: 6px double rgba(248, 113, 113, .78); background: radial-gradient(circle at 32% 26%, rgba(248, 113, 113, .2), transparent 28%), repeating-linear-gradient(105deg, rgba(239, 68, 68, .12) 0 2px, rgba(127, 29, 29, .08) 2px 5px); font-weight: 950; line-height: 1; text-align: center; opacity: .72; pointer-events: none; filter: saturate(1.2) contrast(1.08); box-shadow: inset 0 0 0 4px rgba(248, 113, 113, .16), inset 0 0 18px rgba(127, 29, 29, .28), 0 0 22px rgba(239, 68, 68, .12); transform: translate(-50%, -50%) rotate(-10deg); }
.guild-task-stamp::before { position: absolute; inset: 9px; content: ''; border: 2px dashed currentColor; border-radius: inherit; opacity: .72; }
.guild-task-stamp::after { position: absolute; inset: 0; content: ''; border-radius: inherit; background: radial-gradient(circle at 70% 76%, transparent 0 12%, rgba(248, 113, 113, .12) 13% 17%, transparent 18% 100%); opacity: .75; }
.guild-task-stamp small, .guild-task-stamp strong { position: relative; z-index: 1; }
.guild-task-stamp small { font-size: 14px; letter-spacing: .16em; }
.guild-task-stamp strong { font-size: 36px; letter-spacing: .12em; }
.guild-task-stamp.is-circle { width: 168px; height: 168px; border: 5px double rgba(245, 200, 66, .84); border-radius: 50%; color: rgba(254, 243, 199, .96); background: radial-gradient(circle at 38% 28%, rgba(253, 230, 138, .28), transparent 28%), repeating-linear-gradient(104deg, rgba(245, 200, 66, .2) 0 3px, rgba(76, 29, 149, .14) 3px 7px); box-shadow: 0 0 0 3px rgba(245, 200, 66, .14), inset 0 0 0 4px rgba(245, 200, 66, .2), inset 0 0 22px rgba(76, 29, 149, .28), 0 0 22px rgba(245, 200, 66, .14); clip-path: none; transform: translate(-50%, -50%) rotate(12deg); }
.guild-task-stamp.is-circle::before { inset: 14px; border: 2px dashed rgba(76, 29, 149, .48); border-radius: 50%; background: none; opacity: .72; }
.guild-task-stamp.is-circle::after { border-radius: 50%; background: radial-gradient(circle at 72% 78%, transparent 0 12%, rgba(76, 29, 149, .18) 13% 18%, transparent 19% 100%), radial-gradient(circle at 22% 58%, rgba(254, 243, 199, .16), transparent 16%); opacity: .82; }
.guild-task-stamp.is-circle small { display: none; }
.guild-task-stamp.is-circle strong { font-size: 40px; }
.guild-task-stamp.is-square { border-color: rgba(245, 200, 66, .84); border-radius: 14px; color: rgba(254, 243, 199, .94); background: radial-gradient(circle at 35% 22%, rgba(253, 230, 138, .2), transparent 28%), repeating-linear-gradient(12deg, rgba(245, 200, 66, .14) 0 2px, rgba(76, 29, 149, .1) 2px 6px); box-shadow: 0 0 0 4px rgba(245, 200, 66, .1), inset 0 0 0 4px rgba(245, 200, 66, .16), inset 0 0 24px rgba(76, 29, 149, .28), 0 0 22px rgba(245, 200, 66, .12); transform: translate(-50%, -50%) rotate(12deg); }
.guild-task-stamp.is-ribbon { width: 154px; height: 154px; border-width: 4px; border-radius: 50%; color: rgba(254, 243, 199, .94); border-color: rgba(168, 85, 247, .82); background: radial-gradient(circle at 34% 26%, rgba(253, 230, 138, .18), transparent 28%), repeating-linear-gradient(104deg, rgba(168, 85, 247, .14) 0 2px, rgba(76, 29, 149, .1) 2px 6px); box-shadow: 0 0 0 3px rgba(168, 85, 247, .12), inset 0 0 0 3px rgba(168, 85, 247, .16), inset 0 0 22px rgba(76, 29, 149, .28), 0 0 22px rgba(245, 200, 66, .12); transform: translate(-50%, -50%) rotate(12deg); }
.guild-task-stamp.is-ribbon::before { inset: 12px; border: 2px dashed currentColor; border-radius: 50%; }
.guild-task-stamp.is-ribbon::after { top: 43px; right: -16px; bottom: 43px; left: -16px; border-radius: 0; background-image: linear-gradient(90deg, rgba(254, 243, 199, .94) 0 28%, transparent 28% 34%, rgba(254, 243, 199, .94) 34% 66%, transparent 66% 72%, rgba(254, 243, 199, .94) 72% 100%), linear-gradient(90deg, rgba(254, 243, 199, .94) 0 28%, transparent 28% 34%, rgba(254, 243, 199, .94) 34% 66%, transparent 66% 72%, rgba(254, 243, 199, .94) 72% 100%); background-position: 0 0, 0 100%; background-repeat: no-repeat; background-size: 100% 6px; opacity: .74; }
.guild-task-stamp.is-ribbon small { font-size: 12px; }
.guild-task-stamp.is-ribbon strong { font-size: 28px; }
.guild-task-card h3 { margin: 13px 0 5px; color: var(--color-text); font-size: 15px; }
.guild-task-card > p { min-height: 36px; margin: 0; color: var(--color-text-muted); font-size: 12px; line-height: 1.5; }
.guild-task-target { display: flex; align-items: baseline; gap: 5px; margin-top: 12px; }
.guild-task-target strong { color: var(--color-gold-light); font-size: 22px; }
.guild-task-target span { color: var(--color-text-muted); font-size: 11px; }
.guild-task-progress { display: flex; align-items: center; gap: 6px; margin-top: 9px; color: var(--color-text-muted); font-size: 11px; font-weight: 800; }
.guild-task-progress.completed { color: #86efac; }
.guild-task-progress-icon { display: grid; width: 18px; height: 18px; place-items: center; border: 1px solid rgba(148, 163, 184, .35); border-radius: 50%; color: rgba(226, 232, 240, .65); font-size: 11px; }
.guild-task-progress.completed .guild-task-progress-icon { border-color: rgba(74, 222, 128, .55); color: #14532d; background: #86efac; }
.guild-task-meta { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; color: var(--color-text-muted); font-size: 11px; }
.guild-task-meta strong { color: #86efac; font-size: 11px; }
.guild-task-rewards { display: flex; flex-wrap: wrap; gap: 6px; }
.guild-task-reward { display: inline-flex; align-items: center; padding: 4px 8px; border: 1px solid transparent; border-radius: 999px; font-size: 11px; font-weight: 900; }
.guild-task-meta .guild-task-reward.is-influence { color: #86efac; background: rgba(34, 197, 94, .12); }
.guild-task-meta .guild-task-reward.is-silver { border-color: rgba(245, 200, 66, .34); color: #fde68a; background: rgba(245, 200, 66, .12); }
.guild-workspace-card { overflow: hidden; padding: 0; }
.guild-panel-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 10px 28px 0; border-bottom: 1px solid rgba(255, 255, 255, .1); }
.guild-top-tabs {
  position: sticky;
  top: var(--lobby-header-h);
  z-index: 30;
  margin-bottom: 18px;
  background: rgba(48, 43, 82, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 24px rgba(12, 7, 31, 0.18);
}
:global(.lobby-main:has(.guild-top-tabs)) { overflow-y: visible; }
.guild-panel-tabs > button { flex-shrink: 0; padding: 12px 16px; border: 0; border-bottom: 3px solid transparent; color: var(--color-text-muted); background: transparent; font: inherit; font-size: 14px; font-weight: 800; cursor: pointer; }
.guild-panel-tabs > button:hover, .guild-panel-tabs > button.active { border-bottom-color: var(--color-gold); color: var(--color-text); }
.guild-pagination { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 18px; padding: 12px 14px; border: 1px solid rgba(168, 85, 247, .2); border-radius: 14px; background: linear-gradient(135deg, rgba(16, 10, 38, .78), rgba(65, 35, 106, .28)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05); }
.guild-pagination.member-pagination { justify-content: space-between; }
.guild-pagination-summary { color: var(--color-text-muted); font-size: 12px; font-weight: 700; white-space: nowrap; }
.guild-pagination-controls { display: flex; align-items: center; gap: 6px; }
.guild-pagination button { display: grid; place-items: center; min-width: 34px; height: 34px; padding: 0 9px; border: 1px solid rgba(168, 85, 247, .28); border-radius: 10px; color: var(--color-text-muted); background: rgba(18, 12, 41, .78); font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; transition: border-color .18s, color .18s, background .18s, transform .18s; }
.guild-pagination button:hover:not(:disabled) { border-color: var(--color-purple-light); color: #fff; background: rgba(124, 58, 237, .28); transform: translateY(-1px); }
.guild-pagination button.active { border-color: var(--color-gold); color: #21113c; background: linear-gradient(135deg, #f9d65c, #f59e0b); box-shadow: 0 4px 14px rgba(245, 200, 66, .22); }
.guild-pagination button:disabled { cursor: not-allowed; opacity: .35; }
.guild-panel-content { padding: 24px 28px 28px; }
.guild-panel-heading { margin-bottom: 18px; }
.guild-directory-summary { display: flex; justify-content: flex-end; margin-bottom: 12px; color: var(--color-text-muted); font-size: 12px; }
.guild-directory-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.guild-directory-search { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 180px; min-height: 42px; padding: 0 13px; border: 1px solid var(--color-border); border-radius: 10px; background: rgba(18, 12, 41, .8); }
.guild-directory-search > span { color: var(--color-purple-light); font-size: 22px; line-height: 1; }
.guild-directory-search input { width: 100%; min-width: 0; padding: 8px 0; border: 0; outline: 0; color: var(--color-text); background: transparent; font: inherit; }
.guild-directory-search input::placeholder { color: var(--color-text-muted); }
.guild-directory-filter { display: flex; align-items: center; gap: 8px; color: var(--color-text-muted); font-size: 12px; white-space: nowrap; }
.guild-directory-filter select { min-height: 42px; padding: 0 30px 0 11px; border: 1px solid var(--color-border); border-radius: 10px; color: var(--color-text); background: #120c29; font: inherit; }
.guild-directory-table { width: 100%; min-width: 720px; border-collapse: collapse; text-align: left; }
.guild-directory-table th, .guild-directory-table td { padding: 13px 16px; border-bottom: 1px solid rgba(255, 255, 255, .08); white-space: nowrap; }
.guild-directory-table th { color: var(--color-text-muted); background: rgba(0, 0, 0, .14); font-size: 12px; font-weight: 700; }
.guild-directory-table td { color: var(--color-text-muted); font-size: 13px; }
.guild-directory-table tbody tr:hover { background: rgba(168, 85, 247, .09); }
.guild-info-panel-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
.guild-chat-panel { position: relative; display: flex; min-height: clamp(640px, 80dvh, 960px); flex-direction: column; }
.guild-chat-channel-tabs { display: flex; min-height: 72px; flex-shrink: 0; align-items: center; gap: 4px; overflow-x: auto; margin: 0 -28px; padding: 0 28px; border-bottom: 1px solid rgba(168, 85, 247, .15); background: var(--color-bg-card); }
.guild-chat-channel-tabs button { display: inline-flex; min-height: 54px; align-items: center; gap: 7px; flex-shrink: 0; padding: 15px 16px 13px; border: 0; border-bottom: 2px solid transparent; border-radius: 9px 9px 0 0; color: var(--color-text-muted); background: transparent; font: inherit; font-size: 13px; font-weight: 800; cursor: pointer; transition: color .18s, background .18s, border-color .18s; }
.guild-chat-channel-tabs button:hover, .guild-chat-channel-tabs button.active { border-bottom-color: var(--color-purple-light); color: var(--color-purple-light); background: var(--color-bg); }
.guild-channel-unread { display: inline-grid; min-width: 18px; height: 18px; place-items: center; padding: 0 5px; border: 1px solid rgba(255, 255, 255, .34); border-radius: 999px; color: #1a0a00; background: var(--color-gold); box-shadow: 0 0 12px rgba(245, 200, 66, .24); font-size: 9px; font-weight: 950; line-height: 1; }
.guild-chat-moderation-hint { margin: 0; padding: 6px 14px; border-bottom: 1px solid rgba(168,85,247,.12); color: var(--color-text-muted); background: rgba(18,12,41,.22); font-size: 10px; text-align: right; }
.guild-invite-notice { margin: 8px 14px 0; padding: 8px 10px; border: 1px solid rgba(245,200,66,.2); border-radius: 9px; color: var(--color-gold-light); background: rgba(245,200,66,.06); font-size: 11px; }
.guild-support-notice { margin: 8px 14px 0; padding: 8px 10px; border: 1px solid rgba(74, 222, 128, .22); border-radius: 9px; color: #86efac; background: rgba(34, 197, 94, .07); font-size: 11px; }
.support-thread-header { display: flex; min-height: 62px; flex-shrink: 0; align-items: center; gap: 10px; padding: 9px 14px; border-bottom: 1px solid rgba(168, 85, 247, .16); background: linear-gradient(90deg, rgba(168, 85, 247, .08), transparent 45%), var(--color-bg-card); }
.support-back-button { display: grid; width: 34px; height: 34px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(168, 85, 247, .22); border-radius: 10px; color: var(--color-purple-light); background: rgba(168, 85, 247, .08); font: inherit; font-size: 24px; line-height: 1; cursor: pointer; transition: color .16s, border-color .16s, background .16s; }
.support-back-button:hover { border-color: rgba(245, 200, 66, .32); color: var(--color-gold); background: rgba(245, 200, 66, .06); }
.support-thread-icon { display: grid; width: 36px; height: 36px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(245, 200, 66, .23); border-radius: 11px; background: rgba(245, 200, 66, .09); font-size: 17px; }
.support-thread-heading { display: block; min-width: 0; flex: 1; }
.support-thread-heading small, .support-thread-heading strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.support-thread-heading small { margin-bottom: 2px; color: var(--color-text-muted); font-size: 9px; font-weight: 750; letter-spacing: .02em; }
.support-thread-heading strong { color: var(--color-text); font-size: 13px; font-weight: 900; }
.support-ticket-status { display: inline-flex; min-height: 24px; flex: 0 0 auto; align-items: center; padding: 4px 9px; border: 1px solid rgba(74, 222, 128, .26); border-radius: 999px; color: #86efac; background: rgba(34, 197, 94, .1); font-size: 10px; font-weight: 900; }
.support-ticket-status.closed { border-color: rgba(203, 213, 225, .2); color: #cbd5e1; background: rgba(148, 163, 184, .1); }
.support-ticket-status.draft { border-color: rgba(245, 200, 66, .24); color: var(--color-gold); background: rgba(245, 200, 66, .08); }
.support-new-again { min-height: 31px; flex: 0 0 auto; padding: 6px 11px; border: 0; border-radius: 999px; color: #1a0a00; background: linear-gradient(135deg, #f7d55f, #d98912); font-size: 10px; font-weight: 900; cursor: pointer; }
.guild-player-list-trigger, .guild-group-list-trigger { min-height: 36px; margin-left: auto; padding: 7px 14px !important; border: 1px solid rgba(168, 85, 247, .4) !important; border-radius: 999px !important; color: var(--color-purple-light) !important; background: rgba(168, 85, 247, .14) !important; }
.guild-player-list-trigger:hover { border-bottom-color: rgba(168, 85, 247, .4) !important; background: rgba(168, 85, 247, .24) !important; }
.guild-group-list-trigger:hover { border-bottom-color: rgba(245, 200, 66, .5) !important; color: var(--color-gold-light) !important; background: rgba(245, 200, 66, .12) !important; }
.guild-chat-panel > :deep(.flex.flex-col.flex-1) { min-height: 0; }
.guild-roster-overlay { position: absolute; z-index: 20; inset: 0; display: flex; justify-content: flex-end; background: rgba(0, 0, 0, .45); }
.guild-private-messenger { display: flex; min-height: 0; flex: 1; flex-direction: column; overflow: hidden; background: var(--color-bg); }
.guild-private-friends-panel { display: flex; min-width: 0; min-height: 0; flex-direction: column; gap: 12px; overflow: hidden; padding: 14px; border-right: 1px solid rgba(168, 85, 247, .18); background: rgba(18, 12, 41, .34); }
.guild-private-friends-drawer { display: flex; width: min(420px, 94%); min-width: 0; height: 100%; flex-direction: column; gap: 12px; overflow: hidden; padding: 16px; border-left: 1px solid rgba(168, 85, 247, .3); background: var(--color-bg-card); box-shadow: -12px 0 36px rgba(0, 0, 0, .45); }
.guild-private-friends-drawer :deep(.roster-header) { display: none; }
.guild-private-drawer-heading { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 12px; }
.guild-private-drawer-heading p { margin: 0 0 3px; color: var(--color-gold); font-size: 9px; font-weight: 900; letter-spacing: .16em; }
.guild-private-drawer-heading h2 { margin: 0; color: var(--color-text); font-size: 18px; font-weight: 900; }
.guild-private-drawer-heading button { display: grid; width: 34px; height: 34px; flex-shrink: 0; place-items: center; border: 1px solid rgba(255, 255, 255, .1); border-radius: 50%; color: var(--color-text-muted); background: rgba(255, 255, 255, .05); font-size: 23px; cursor: pointer; }
.guild-private-drawer-heading button:hover { color: var(--color-text); background: rgba(168, 85, 247, .2); }
.guild-private-friends-drawer > .roster-panel-embedded { min-height: 0; }
.guild-private-heading, .guild-private-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.guild-private-heading h3 { margin: 0; color: var(--color-text); font-size: 18px; }
.guild-private-heading p { margin: 5px 0 0; color: var(--color-text-muted); font-size: 12px; }
.guild-private-heading > span, .guild-private-section-heading > span { color: var(--color-text-muted); font-size: 11px; white-space: nowrap; }
.guild-private-search-block { display: grid; gap: 7px; }
.guild-private-search-block label { color: var(--color-text-muted); font-size: 12px; font-weight: 800; }
.guild-private-search { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 13px; border: 1px solid rgba(168, 85, 247, .28); border-radius: 12px; background: rgba(18, 12, 41, .72); }
.guild-private-search > span { color: var(--color-purple-light); font-size: 22px; line-height: 1; }
.guild-private-search input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--color-text); background: transparent; font: inherit; font-size: 13px; }
.guild-private-search input::placeholder { color: var(--color-text-muted); }
.guild-private-notice { margin: 0; color: #86efac; font-size: 11px; }
.guild-private-search-results, .guild-private-friends-section { display: grid; gap: 9px; }
.guild-private-friends-section { display: flex; min-height: 0; flex: 1; flex-direction: column; overflow: hidden; padding-right: 3px; }
.guild-private-conversation { display: flex; min-width: 0; min-height: 0; flex: 1; flex-direction: column; }
.guild-private-conversation-header { display: flex; min-height: 48px; flex-shrink: 0; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid rgba(168, 85, 247, .15); background: var(--color-bg-card); }
.guild-private-back-button { flex-shrink: 0; padding: 0 4px; border: 0; color: var(--color-purple-light); background: transparent; font: inherit; font-size: 24px; line-height: 1; cursor: pointer; }
.guild-private-peer-avatar { display: grid; width: 28px; height: 28px; flex-shrink: 0; place-items: center; padding: 0; border: 1px solid rgba(168, 85, 247, .4); border-radius: 50%; color: var(--color-text); background: rgba(168, 85, 247, .2); font-size: 16px; cursor: pointer; }
.guild-private-peer-avatar:hover { border-color: rgba(245, 200, 66, .68); }
.guild-private-peer-details { display: grid; min-width: 0; gap: 3px; }
.guild-private-peer-details strong { overflow: hidden; color: var(--color-text); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.guild-private-peer-details small { color: var(--color-text-muted); font-size: 11px; }
.guild-private-peer-details small.status-在線 { color: #34d399; }
.guild-private-peer-details small.status-遊戲中 { color: var(--color-gold-light); }
.guild-private-conversation-header .blocked-badge { margin-left: auto; padding: 3px 8px; border: 1px solid rgba(244, 63, 94, .32); border-radius: 999px; color: #fecdd3; background: rgba(190, 18, 60, .18); font-size: 11px; font-weight: 900; }
.guild-private-conversation-empty { display: flex; min-width: 0; min-height: 0; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 24px; color: var(--color-text); text-align: center; }
.guild-private-conversation-empty > span { font-size: 36px; }
.guild-private-conversation-empty strong { font-size: 15px; }
.guild-private-conversation-empty p { margin: 0; color: var(--color-text-muted); font-size: 12px; }
.guild-private-conversation-empty button { margin-top: 8px; padding: 9px 15px; border: 1px solid rgba(168, 85, 247, .4); border-radius: 999px; color: var(--color-purple-light); background: rgba(168, 85, 247, .14); font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
.guild-private-conversation-empty button:hover { background: rgba(168, 85, 247, .24); }
.guild-private-gift-trigger { display: grid; width: 38px; height: 38px; flex-shrink: 0; place-items: center; border: 1px solid rgba(245, 200, 66, .35); border-radius: 50%; color: var(--color-text); background: rgba(239, 68, 68, .14); font-size: 18px; cursor: pointer; }
.guild-private-gift-trigger:disabled { opacity: .4; cursor: not-allowed; }
.guild-private-gift-trigger:hover { background: rgba(239, 68, 68, .24); }
.guild-private-friend-list { display: grid; gap: 8px; }
.guild-private-friend-row { display: flex; align-items: center; gap: 11px; width: 100%; padding: 11px 13px; border: 1px solid rgba(168, 85, 247, .18); border-radius: 13px; color: var(--color-text); background: rgba(168, 85, 247, .07); text-align: left; cursor: pointer; transition: border-color .18s, background .18s, transform .18s; }
.guild-private-friend-row:hover { border-color: rgba(245, 200, 66, .42); background: rgba(245, 200, 66, .08); transform: translateY(-1px); }
.guild-private-friend-row-add { border-color: rgba(74, 222, 128, .24); background: rgba(74, 222, 128, .06); }
.guild-private-avatar { display: grid; width: 40px; height: 40px; flex-shrink: 0; place-items: center; border: 1px solid rgba(168, 85, 247, .34); border-radius: 50%; background: rgba(168, 85, 247, .2); font-size: 21px; }
.guild-private-player-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; }
.guild-private-player-copy strong { overflow: hidden; color: var(--color-text); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.guild-private-player-copy small { color: var(--color-text-muted); font-size: 11px; }
.guild-private-add-label, .guild-private-open-label { flex-shrink: 0; color: var(--color-gold-light); font-size: 11px; font-weight: 800; }
.guild-private-add-label { color: #86efac; }
.guild-private-empty { margin: 0; padding: 24px 12px; border: 1px dashed rgba(168, 85, 247, .22); border-radius: 12px; color: var(--color-text-muted); font-size: 12px; text-align: center; }
.guild-treasury-card { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex: 1; min-width: 0; padding: 14px 18px; border-color: rgba(245, 200, 66, .28); color: var(--color-text); background: linear-gradient(120deg, rgba(245, 200, 66, .1), rgba(124, 58, 237, .16)); font: inherit; text-align: left; cursor: pointer; transition: border-color .18s, background .18s, transform .18s; }
.guild-treasury-card:hover, .guild-treasury-card:focus-visible { border-color: rgba(255, 229, 140, .72); background: linear-gradient(120deg, rgba(245, 200, 66, .16), rgba(124, 58, 237, .22)); transform: translateY(-1px); }
.guild-treasury-card:focus-visible { outline: 2px solid rgba(245, 200, 66, .72); outline-offset: 3px; }
.guild-treasury-heading { display: flex; align-items: center; gap: 12px; min-width: 0; }
.treasury-icon { display: grid; place-items: center; flex-shrink: 0; width: 46px; height: 46px; border: 1px solid var(--color-border-gold); border-radius: 14px; background: rgba(245, 200, 66, .12); font-size: 23px; }
.guild-treasury-heading h2 { margin: 0; font-size: 17px; }
.guild-treasury-heading p:last-child { margin: 4px 0 0; color: var(--color-text-muted); font-size: 11px; }
.treasury-balance { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.treasury-balance span { color: var(--color-text-muted); font-size: 12px; }
.treasury-balance strong { color: var(--color-gold-light); font-size: 24px; }
.guild-economy-guide { display: grid; gap: 12px; margin-top: 14px; padding: 16px 18px; border: 1px solid rgba(168, 85, 247, .22); border-radius: 15px; background: linear-gradient(120deg, rgba(18, 12, 41, .3), rgba(124, 58, 237, .08)); }
.guild-economy-guide-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; list-style: none; }
.guild-economy-guide-heading::-webkit-details-marker { display: none; }
.guild-economy-guide-toggle { display: grid; width: 24px; height: 24px; place-items: center; border: 1px solid rgba(245, 200, 66, .35); border-radius: 50%; color: var(--color-gold-light); font-size: 16px; transition: transform .18s ease; }
.guild-economy-guide[open] .guild-economy-guide-toggle { transform: rotate(180deg); }
.guild-economy-guide-heading h3 { margin: 0; color: var(--color-text); font-size: 15px; }
.guild-economy-guide-heading p { margin: 4px 0 0; color: var(--color-text-muted); font-size: 11px; }
.guild-economy-guide-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.guild-economy-guide-grid article { min-width: 0; padding: 12px 14px; border: 1px solid rgba(255, 255, 255, .08); border-radius: 12px; background: rgba(18, 12, 41, .24); }
.guild-economy-guide-grid h4 { margin: 0; color: var(--color-gold-light); font-size: 12px; }
.guild-economy-guide-grid ul { display: grid; gap: 7px; margin: 9px 0 0; padding-left: 18px; color: var(--color-text-muted); font-size: 11px; line-height: 1.6; }
.guild-economy-guide-grid strong { color: var(--color-text); }
.guild-economy-guide-grid article > p { margin: 9px 0 0; color: var(--color-purple-light); font-size: 10px; line-height: 1.5; }
.guild-treasury-ledger-backdrop { z-index: 115; }
.guild-edit-modal.guild-treasury-ledger-modal { display: flex; width: min(100%, 760px); max-height: min(86dvh, 820px); flex-direction: column; overflow: hidden; }
.guild-treasury-ledger-modal .guild-edit-modal-heading { flex-shrink: 0; align-items: center; margin-bottom: 14px; }
.guild-treasury-ledger-modal .guild-edit-modal-heading h2 { font-size: 23px; }
.guild-treasury-ledger-title-row { display: flex; align-items: center; gap: 8px; }
.guild-treasury-ledger-help { position: relative; display: inline-grid; width: 20px; height: 20px; flex: 0 0 auto; place-items: center; border: 1px solid rgba(245, 200, 66, .55); border-radius: 50%; color: var(--color-gold-light); font-size: 13px; font-weight: 800; line-height: 1; cursor: help; }
.guild-treasury-ledger-help::before, .guild-treasury-ledger-help::after { position: absolute; z-index: 10; top: calc(100% + 8px); left: 0; opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .16s ease, transform .16s ease, visibility .16s ease; }
.guild-treasury-ledger-help::before { width: 9px; height: 9px; border-top: 1px solid rgba(168, 85, 247, .4); border-left: 1px solid rgba(168, 85, 247, .4); background: rgba(18, 12, 41, .98); content: ''; transform: translateY(-4px) rotate(45deg); }
.guild-treasury-ledger-help::after { width: max-content; max-width: min(430px, calc(100vw - 52px)); padding: 11px 13px; border: 1px solid rgba(168, 85, 247, .4); border-radius: 10px; color: var(--color-text); background: rgba(18, 12, 41, .98); box-shadow: 0 12px 28px rgba(0, 0, 0, .42); content: attr(data-tooltip); font-size: 12px; font-weight: 600; line-height: 1.6; text-align: left; white-space: pre-line; overflow-wrap: anywhere; transform: translateY(-4px); }
.guild-treasury-ledger-help:hover::before, .guild-treasury-ledger-help:hover::after, .guild-treasury-ledger-help:focus-visible::before, .guild-treasury-ledger-help:focus-visible::after { opacity: 1; visibility: visible; }
.guild-treasury-ledger-help:hover::before, .guild-treasury-ledger-help:focus-visible::before { transform: translateY(0) rotate(45deg); }
.guild-treasury-ledger-help:hover::after, .guild-treasury-ledger-help:focus-visible::after { transform: translateY(0); }
.guild-treasury-ledger-balance { margin: 7px 0 0; color: var(--color-text-muted); font-size: 12px; }
.guild-treasury-ledger-balance strong { margin-left: 5px; color: var(--color-gold-light); font-size: 16px; }
.guild-treasury-ledger-columns, .guild-treasury-ledger-row { display: grid; grid-template-columns: minmax(115px, .8fr) minmax(95px, .7fr) minmax(0, 1.8fr) minmax(100px, .7fr); align-items: center; gap: 12px; }
.guild-treasury-ledger-columns { flex-shrink: 0; padding: 10px 13px; border-radius: 9px 9px 0 0; color: var(--color-text-muted); background: rgba(0, 0, 0, .17); font-size: 10px; font-weight: 800; }
.guild-treasury-ledger-columns span:last-child { text-align: right; }
.guild-treasury-ledger-list { display: grid; min-height: 0; gap: 7px; overflow-y: auto; margin: 0 0 12px; padding: 0 3px 0 0; list-style: none; }
.guild-treasury-ledger-row { padding: 12px 13px; border: 1px solid rgba(255, 255, 255, .08); border-radius: 10px; background: rgba(18, 12, 41, .3); }
.guild-treasury-ledger-source { display: grid; gap: 4px; min-width: 0; }
.guild-treasury-ledger-source strong { color: var(--color-text); font-size: 11px; }
.guild-treasury-ledger-source small { color: var(--color-text-muted); font-size: 10px; }
.guild-treasury-ledger-operator { min-width: 0; }
.guild-treasury-ledger-operator > span { display: none; }
.guild-treasury-ledger-operator > strong { display: block; overflow: hidden; color: var(--color-text); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.guild-treasury-ledger-row > p { margin: 0; color: var(--color-text-muted); font-size: 11px; line-height: 1.5; }
.guild-treasury-ledger-amount { text-align: right; font-size: 14px; white-space: nowrap; }
.guild-treasury-ledger-amount.is-income { color: #86efac; }
.guild-treasury-ledger-amount.is-expense { color: #fca5a5; }
.leave-confirm-backdrop { position: fixed; z-index: 50; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(5, 3, 18, .78); backdrop-filter: blur(6px); }
.leave-confirm-modal { width: min(100%, 430px); padding: 28px; box-shadow: 0 24px 80px rgba(0, 0, 0, .45); }
.leave-confirm-modal h2 { margin: 0; font-size: 22px; }
.leave-confirm-modal > p:not(.guild-eyebrow) { margin: 10px 0 0; color: var(--color-text-muted); font-size: 14px; line-height: 1.7; }
.leave-confirm-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.leave-cancel-button, .leave-confirm-button { min-width: 86px; padding: 9px 14px; border-radius: 9px; font-size: 13px; font-weight: 800; cursor: pointer; }
.leave-cancel-button { border: 1px solid var(--color-border); color: var(--color-text-muted); background: rgba(255, 255, 255, .06); }
.leave-confirm-button { border: 1px solid rgba(248, 113, 113, .55); color: #fee2e2; background: rgba(239, 68, 68, .2); }
.leave-confirm-button:hover { background: rgba(239, 68, 68, .32); }
.guild-edit-backdrop { position: fixed; z-index: 55; inset: 0; display: grid; place-items: center; padding: 20px; background: rgba(5, 3, 18, .78); backdrop-filter: blur(7px); }
.guild-edit-modal { width: min(100%, 540px); max-height: calc(100dvh - 40px); overflow-y: auto; padding: 24px; box-shadow: 0 24px 80px rgba(0, 0, 0, .48); }
.guild-edit-modal-heading { display: flex; align-items: start; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.guild-edit-modal-heading h2 { margin: 0; font-size: 22px; }
.guild-edit-modal-close { width: 30px; height: 30px; border: 1px solid rgba(255, 255, 255, .14); border-radius: 50%; color: var(--color-text-muted); background: rgba(255, 255, 255, .06); font-size: 21px; line-height: 1; cursor: pointer; }
.guild-edit-modal-close:hover { color: var(--color-text); background: rgba(255, 255, 255, .12); }
.guild-modal-field { display: grid; gap: 8px; }
.guild-modal-field > label { color: var(--color-text-muted); font-size: 12px; font-weight: 800; }
.guild-modal-field input, .guild-modal-field select, .guild-modal-field textarea { width: 100%; padding: 11px 12px; border: 1px solid rgba(168, 85, 247, .3); border-radius: 10px; outline: none; color: var(--color-text); background: rgba(18, 12, 41, .72); font: inherit; font-size: 13px; }
.guild-modal-field input:focus, .guild-modal-field select:focus, .guild-modal-field textarea:focus { border-color: rgba(245, 200, 66, .72); box-shadow: 0 0 0 3px rgba(245, 200, 66, .1); }
.guild-announcement-modal-field textarea { min-height: 220px; resize: vertical; line-height: 1.7; }
.guild-edit-modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 22px; }
.guild-members-card { overflow: hidden; padding: 0; }
.guild-members-heading { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 22px 28px; border-bottom: 1px solid rgba(255, 255, 255, .1); }
.guild-members-heading h2 { margin: 0; font-size: 21px; }
.guild-members-heading h3 { margin: 0; font-size: 18px; }
.guild-members-title { display: inline-flex; align-items: center; gap: 8px; }
.member-period-hint { position: relative; display: inline-grid; place-items: center; width: 18px; height: 18px; border: 1px solid rgba(245, 200, 66, .5); border-radius: 50%; color: var(--color-gold-light); background: rgba(245, 200, 66, .1); font-size: 12px; font-weight: 900; cursor: help; outline: none; }
.member-period-hint::after { position: absolute; z-index: 5; top: calc(100% + 10px); left: 0; width: max-content; max-width: min(300px, 70vw); padding: 9px 11px; border: 1px solid rgba(168, 85, 247, .32); border-radius: 9px; color: var(--color-text); background: rgba(18, 12, 41, .96); box-shadow: 0 10px 24px rgba(0, 0, 0, .28); content: attr(data-tooltip); font-size: 12px; font-weight: 600; line-height: 1.5; opacity: 0; pointer-events: none; transform: translateY(-4px); transition: opacity .18s, transform .18s; }
.member-period-hint::before { position: absolute; z-index: 6; top: calc(100% + 4px); left: 10px; width: 8px; height: 8px; border-right: 1px solid rgba(168, 85, 247, .32); border-bottom: 1px solid rgba(168, 85, 247, .32); background: rgba(18, 12, 41, .96); content: ''; opacity: 0; transform: translateY(-4px) rotate(225deg); transition: opacity .18s, transform .18s; }
.member-period-hint:hover::before, .member-period-hint:hover::after, .member-period-hint:focus-visible::before, .member-period-hint:focus-visible::after { opacity: 1; }
.member-period-hint:hover::before, .member-period-hint:focus-visible::before { transform: translateY(0) rotate(225deg); }
.member-period-hint:hover::after, .member-period-hint:focus-visible::after { transform: translateY(0); }
.member-sort-tabs { display: inline-flex; align-items: center; gap: 4px; padding: 4px; border: 1px solid rgba(168, 85, 247, .24); border-radius: 11px; background: rgba(18, 12, 41, .42); }
.member-sort-tabs button { padding: 7px 10px; border: 0; border-radius: 8px; color: var(--color-text-muted); background: transparent; font-size: 12px; font-weight: 800; cursor: pointer; transition: color .18s, background .18s, box-shadow .18s; }
.member-sort-tabs button:hover, .member-sort-tabs button:focus-visible { color: var(--color-text); }
.member-sort-tabs button:focus-visible { outline: 2px solid rgba(245, 200, 66, .65); outline-offset: 1px; }
.member-sort-tabs button.active { color: #24133f; background: linear-gradient(135deg, #f8d76a, #e6a91a); box-shadow: 0 4px 12px rgba(245, 200, 66, .18); }
.guild-members-table-wrap { overflow-x: auto; }
.guild-members-table { width: 100%; min-width: 900px; border-collapse: collapse; text-align: left; }
.guild-members-table th, .guild-members-table td { padding: 14px 20px; border-bottom: 1px solid rgba(255, 255, 255, .08); white-space: nowrap; }
.guild-members-table th { color: var(--color-text-muted); background: rgba(0, 0, 0, .14); font-size: 12px; font-weight: 700; }
.member-sort-button { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; color: inherit; background: transparent; font: inherit; cursor: pointer; }
.member-sort-button:hover, .member-sort-button:focus-visible, .member-sort-button.active { color: var(--color-gold-light); }
.member-sort-button:focus-visible { border-radius: 4px; outline: 2px solid rgba(245, 200, 66, .65); outline-offset: 4px; }
.member-sort-indicator { color: currentColor; font-size: 14px; line-height: 1; }
.guild-members-table td { color: var(--color-text-muted); font-size: 14px; }
.guild-members-table tbody tr { transition: background .18s; }
.guild-members-table tbody tr:hover { background: rgba(168, 85, 247, .09); }
.guild-member-row-clickable { cursor: pointer; }
.guild-member-row-clickable:focus-visible { outline: 2px solid var(--color-gold); outline-offset: -2px; }
.member-title { display: inline-flex; padding: 5px 9px; border: 1px solid rgba(168, 85, 247, .28); border-radius: 999px; color: #ddd6fe; background: rgba(139, 92, 246, .16); font-size: 12px; font-weight: 800; }
.member-avatar { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid rgba(245, 200, 66, .35); border-radius: 50%; background: linear-gradient(145deg, #6b21a8, #3b0764); font-size: 20px; }
.member-name { color: var(--color-text); }
.member-status { display: inline-flex; align-items: center; gap: 7px; color: #a7aebd; font-size: 12px; font-weight: 800; }
.member-status i { width: 9px; height: 9px; border-radius: 50%; background: #64748b; box-shadow: 0 0 0 3px rgba(100, 116, 139, .14); }
.member-status.is-online { color: #86efac; }
.member-status.is-online i { background: #4ade80; box-shadow: 0 0 0 3px rgba(74, 222, 128, .16), 0 0 10px rgba(74, 222, 128, .55); }
.member-last-online { color: var(--color-text-muted); font-size: 12px; }
.member-vip { display: inline-flex; padding: 5px 8px; border: 1px solid rgba(245, 200, 66, .28); border-radius: 8px; color: var(--color-gold-light); background: rgba(245, 200, 66, .1); font-size: 12px; font-weight: 800; }
.member-metric-value { color: #c4b5fd; }
.member-metric-value.is-influence { color: var(--color-gold-light); }
.member-kick-button { padding: 6px 10px; border: 1px solid rgba(248, 113, 113, .48); border-radius: 8px; color: #fecaca; background: rgba(239, 68, 68, .12); font-size: 11px; font-weight: 800; cursor: pointer; }
.member-kick-button:hover { border-color: #fca5a5; color: #fff; background: rgba(239, 68, 68, .24); }
.member-kick-button:disabled { border-color: rgba(148, 163, 184, .24); color: var(--color-text-muted); background: rgba(148, 163, 184, .08); cursor: not-allowed; }
.guild-member-action-group { display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.member-role-button, .member-transfer-button, .guild-member-action-confirm { min-height: 30px; padding: 6px 9px; border: 1px solid rgba(168, 85, 247, .5); border-radius: 8px; color: #e9d5ff; background: rgba(139, 92, 246, .14); font-size: 11px; font-weight: 800; cursor: pointer; }
.member-role-button:hover { border-color: rgba(192, 132, 252, .8); background: rgba(139, 92, 246, .24); }
.member-transfer-button { border-color: rgba(245, 200, 66, .5); color: var(--color-gold-light); background: rgba(245, 200, 66, .1); }
.member-transfer-button:hover { border-color: rgba(245, 200, 66, .8); background: rgba(245, 200, 66, .2); }
.guild-member-role-label { display: block; margin-top: 18px; color: var(--color-text-muted); font-size: 13px; font-weight: 750; }
.guild-member-role-select { width: 100%; min-height: 42px; margin-top: 7px; padding: 0 12px; border: 1px solid rgba(168, 85, 247, .4); border-radius: 10px; color: var(--color-text); background: #1a0a2e; font: inherit; }
.guild-member-action-confirm { border-color: rgba(245, 200, 66, .6); color: #2b1a00; background: linear-gradient(135deg, #f7d660, #e9a817); }
.guild-member-action-confirm:hover { filter: brightness(1.08); }
.guild-empty { display: flex; flex-direction: column; align-items: center; gap: 9px; padding: 70px 24px; text-align: center; }
.guild-empty-icon { color: var(--color-gold); font-size: 38px; }
.guild-empty h1 { margin: 0; font-size: 22px; }
.guild-empty p { margin: 0 0 9px; color: var(--color-text-muted); }
@media (max-width: 1023px) {
  .my-guild-profile { grid-template-columns: 1fr; }
  .my-guild-profile-identity { grid-column: auto; }
  .guild-treasury-card { width: 100%; }
}
@media (max-width: 640px) {
  .my-guild-card { padding: 20px 16px; }
  .my-guild-profile { display: flex; align-items: stretch; flex-direction: column; }
  .my-guild-profile-identity { align-items: start; }
  .guild-badge { width: 64px; height: 64px; border-radius: 18px; font-size: 30px; }
  .my-guild-profile h2 { font-size: 21px; }
  .guild-detail-stats, .guild-growth-progress-grid { grid-template-columns: 1fr; }
  .guild-growth-heading { align-items: flex-start; flex-direction: column; }
  .guild-growth-controls { justify-content: flex-start; }
  .guild-growth-actions { align-items: stretch; flex-direction: column; }
  .guild-announcements-heading, .guild-panel-heading { align-items: start; flex-direction: column; }
  .guild-announcements-heading { padding: 18px 16px; }
  .guild-announcement-scroll { padding: 4px 16px 8px; }
  .guild-announcement-item { flex-direction: column; gap: 4px; }
  .guild-announcement-item time { order: -1; }
  .guild-panel-tabs { padding-left: 16px; padding-right: 16px; }
  .guild-top-actions { padding-left: 8px; }
  .guild-pagination.member-pagination { align-items: stretch; flex-direction: column; }
  .guild-pagination-summary { text-align: center; }
  .guild-pagination-controls { justify-content: center; }
  .guild-panel-content { padding: 20px 16px 24px; }
  .guild-directory-toolbar { align-items: stretch; flex-direction: column; }
  .guild-directory-filter { justify-content: space-between; }
  .guild-directory-filter select { flex: 1; }
  .guild-info-panel-stats { grid-template-columns: 1fr; }
  .guild-chat-channel-tabs { margin-right: -16px; margin-left: -16px; padding-right: 16px; padding-left: 16px; }
  .guild-private-messenger { margin-top: 10px; }
  .guild-private-friends-drawer { width: min(420px, 100%); padding: 14px; }
  .guild-treasury-card { width: 100%; }
  .guild-economy-guide-grid { grid-template-columns: 1fr; }
  .guild-edit-modal { padding: 20px 16px; }
  .guild-task-grid { grid-template-columns: 1fr; }
  .guild-task-period-tabs button { padding-right: 8px; padding-left: 8px; }
  .guild-members-heading { align-items: stretch; flex-direction: column; padding: 20px 16px; }
  .member-sort-tabs { align-self: stretch; justify-content: space-between; }
  .member-sort-tabs button { flex: 1; }
  .guild-members-table th, .guild-members-table td { padding: 13px 16px; }
  .guild-edit-modal.guild-leaderboard-modal { padding: 18px 14px; }
  .guild-leaderboard-modal .guild-edit-modal-heading h2 { font-size: 20px; }
  .guild-leaderboard-heading-actions { gap: 6px; }
  .guild-leaderboard-settings-trigger { padding-right: 9px; padding-left: 9px; font-size: 10px; }
  .guild-leaderboard-schedule { max-width: 235px; font-size: 9px; line-height: 1.5; }
  .guild-leaderboard-tabs button { padding-right: 5px; padding-left: 5px; font-size: 10px; }
  .guild-leaderboard-funding-summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .guild-leaderboard-podium { gap: 6px; margin: 16px 0 20px; }
  .guild-podium-card { min-height: 202px; padding: 16px 6px 12px; border-radius: 13px; }
  .guild-podium-card.rank-1 { min-height: 228px; }
  .guild-podium-crown { top: 9px; font-size: 19px; }
  .guild-podium-avatar { width: 42px; height: 42px; font-size: 22px; }
  .rank-1 .guild-podium-avatar { width: 52px; height: 52px; font-size: 26px; }
  .guild-podium-name { font-size: 11px; }
  .guild-podium-score, .rank-1 .guild-podium-score { font-size: 15px; }
  .guild-podium-reward { padding: 4px 6px; font-size: 8px; }
  .guild-leaderboard-row { grid-template-columns: 25px 30px minmax(0, 1fr) auto; gap: 6px; min-height: 58px; padding: 6px 7px; }
  .guild-leaderboard-avatar { width: 28px; height: 28px; font-size: 15px; }
  .guild-leaderboard-name { font-size: 10px; }
  .guild-leaderboard-value { font-size: 10px; }
  .guild-leaderboard-silver { grid-column: 3 / 5; justify-self: end; margin-top: -9px; font-size: 9px; }
  .guild-leaderboard-reward-list { grid-template-columns: 1fr; }
  .guild-edit-modal.guild-treasury-ledger-modal { max-height: calc(100dvh - 28px); padding: 18px 14px; }
  .guild-treasury-ledger-modal .guild-edit-modal-heading h2 { font-size: 20px; }
  .guild-treasury-ledger-columns { display: none; }
  .guild-treasury-ledger-row { grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'source amount' 'operator operator' 'detail detail'; gap: 9px; padding: 11px; }
  .guild-treasury-ledger-source { grid-area: source; }
  .guild-treasury-ledger-operator { grid-area: operator; display: flex; gap: 7px; align-items: baseline; }
  .guild-treasury-ledger-operator > span { display: inline; color: var(--color-text-muted); font-size: 10px; }
  .guild-treasury-ledger-row > p { grid-area: detail; }
  .guild-treasury-ledger-amount { grid-area: amount; }
}
</style>
