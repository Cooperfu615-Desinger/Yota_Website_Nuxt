import { siteContent } from '~/data/siteContent'
import { GOLD_TO_SILVER_RATE } from '~/utils/walletExchange'

const LS_GUILD_STATE = 'jh_guildState'

export const GUILD_LEADERBOARD_KEYS = ['influence', 'gamePower', 'deposit', 'contribution'] as const
export type GuildLeaderboardKey = typeof GUILD_LEADERBOARD_KEYS[number]
export type GuildTreasuryEntryType = 'turnover' | 'contribution' | 'construction' | 'leaderboard-reserve' | 'leaderboard-payout'

export interface GuildTreasuryEntry {
  id: string
  createdAt: string
  type: GuildTreasuryEntryType
  title: string
  detail: string
  amountGold: number
  affectsBalance: boolean
  operatorName?: string
}

export const GUILD_TREASURY_GOLD_PER_CONSTRUCTION_EXP = 1
export const GUILD_TREASURY_TURNOVER_GOLD_PER_1000 = 10
const GUILD_TREASURY_LEDGER_LIMIT = 100

export const DEFAULT_GUILD_LEADERBOARD_REWARDS: Record<GuildLeaderboardKey, number[]> = {
  influence: [10000, 8000, 6000, 4000, 3000, 2500, 2000, 1500, 1000, 500],
  gamePower: [10000, 8000, 6000, 4000, 3000, 2500, 2000, 1500, 1000, 500],
  deposit: [10000, 8000, 6000, 4000, 3000, 2500, 2000, 1500, 1000, 500],
  contribution: [10000, 8000, 6000, 4000, 3000, 2500, 2000, 1500, 1000, 500],
}

export interface GuildProgressState {
  level: number
  constructionExp: number
  treasuryBalance: number
  treasuryLedger: GuildTreasuryEntry[]
  leaderboardRewards: Record<GuildLeaderboardKey, number[]>
  leaderboardRewardsEnabled: Record<GuildLeaderboardKey, boolean>
  leaderboardReservedGold: Record<GuildLeaderboardKey, number>
  leaderboardAutoPaused: boolean
}

interface StoredGuildState {
  joinedGuildId: number | null
  pendingGuildIds: number[]
  joinedAt: number | null
  guildProgressById?: Record<number, Partial<GuildProgressState>>
}

export const useGuildState = () => {
  const joinedGuildId = useState<number | null>('joinedGuildId', () => null)
  const pendingGuildIds = useState<number[]>('pendingGuildIds', () => [])
  const joinedAt = useState<number | null>('joinedGuildAt', () => null)
  const guildProgressById = useState<Record<number, GuildProgressState>>('guildProgressById', () => ({}))
  const initialized = useState('guildStateInitialized', () => false)

  function createDefaultProgress(treasuryBalance: number): GuildProgressState {
    return {
      level: 1,
      constructionExp: 0,
      treasuryBalance,
      treasuryLedger: [],
      leaderboardRewards: Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => [key, [...DEFAULT_GUILD_LEADERBOARD_REWARDS[key]]])) as Record<GuildLeaderboardKey, number[]>,
      leaderboardRewardsEnabled: Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => [key, false])) as Record<GuildLeaderboardKey, boolean>,
      leaderboardReservedGold: Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => [key, 0])) as Record<GuildLeaderboardKey, number>,
      leaderboardAutoPaused: false,
    }
  }

  function getGuildProgress(guildId: number): GuildProgressState | null {
    const guild = siteContent.guilds.find(item => item.rank === guildId)
    if (!guild) return null

    const defaults = createDefaultProgress(guild.treasury)
    const saved = guildProgressById.value[guildId] as Partial<GuildProgressState> | undefined
    const level = Number(saved?.level)
    const constructionExp = Number(saved?.constructionExp)
    const treasuryBalance = Number(saved?.treasuryBalance)
    const treasuryLedger = Array.isArray(saved?.treasuryLedger)
      ? saved.treasuryLedger.filter((entry): entry is GuildTreasuryEntry => isValidTreasuryEntry(entry)).slice(0, GUILD_TREASURY_LEDGER_LIMIT)
      : []
    const leaderboardRewards = Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => {
      const candidate = saved?.leaderboardRewards?.[key]
      const valid = Array.isArray(candidate)
        && candidate.length === 10
        && candidate.every(amount => Number.isSafeInteger(amount) && amount >= 0)
      return [key, valid ? [...candidate] : [...DEFAULT_GUILD_LEADERBOARD_REWARDS[key]]]
    })) as Record<GuildLeaderboardKey, number[]>
    const leaderboardRewardsEnabled = Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => [
      key,
      saved?.leaderboardRewardsEnabled?.[key] === true,
    ])) as Record<GuildLeaderboardKey, boolean>
    const leaderboardReservedGold = Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => {
      const amount = Number(saved?.leaderboardReservedGold?.[key])
      return [key, Number.isSafeInteger(amount) && amount > 0 ? amount : 0]
    })) as Record<GuildLeaderboardKey, number>
    return {
      level: Number.isSafeInteger(level) && level >= 1 ? level : defaults.level,
      constructionExp: Number.isSafeInteger(constructionExp) && constructionExp >= 0 ? constructionExp : defaults.constructionExp,
      treasuryBalance: Number.isSafeInteger(treasuryBalance) && treasuryBalance >= 0 ? treasuryBalance : defaults.treasuryBalance,
      treasuryLedger,
      leaderboardRewards,
      leaderboardRewardsEnabled,
      leaderboardReservedGold,
      leaderboardAutoPaused: saved?.leaderboardAutoPaused === true,
    }
  }

  const joinedGuild = computed(() =>
    siteContent.guilds.find(guild => guild.rank === joinedGuildId.value) ?? null,
  )

  const joinedGuildProgress = computed(() => {
    const guild = joinedGuild.value
    if (!guild) return null
    return getGuildProgress(guild.rank)
  })

  function persist() {
    if (!import.meta.client) return
    const state: StoredGuildState = {
      joinedGuildId: joinedGuildId.value,
      pendingGuildIds: pendingGuildIds.value,
      joinedAt: joinedAt.value,
      guildProgressById: guildProgressById.value,
    }
    localStorage.setItem(LS_GUILD_STATE, JSON.stringify(state))
  }

  function isValidTreasuryEntry(entry: unknown): entry is GuildTreasuryEntry {
    if (!entry || typeof entry !== 'object') return false
    const candidate = entry as Partial<GuildTreasuryEntry>
    return typeof candidate.id === 'string'
      && typeof candidate.createdAt === 'string'
      && ['turnover', 'contribution', 'construction', 'leaderboard-reserve', 'leaderboard-payout'].includes(String(candidate.type))
      && typeof candidate.title === 'string'
      && typeof candidate.detail === 'string'
      && Number.isSafeInteger(candidate.amountGold)
      && typeof candidate.affectsBalance === 'boolean'
  }

  function makeTreasuryEntry(input: Omit<GuildTreasuryEntry, 'id' | 'createdAt'>): GuildTreasuryEntry {
    return {
      ...input,
      operatorName: input.operatorName?.trim() || '未記錄',
      id: `GT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    }
  }

  function initGuildState() {
    if (!import.meta.client || initialized.value) return
    initialized.value = true
    try {
      const saved = localStorage.getItem(LS_GUILD_STATE)
      const parsed = saved ? JSON.parse(saved) as Partial<StoredGuildState> : {}
      const validIds = new Set(siteContent.guilds.map(guild => guild.rank))
      joinedGuildId.value = validIds.has(Number(parsed.joinedGuildId)) ? Number(parsed.joinedGuildId) : null
      const savedJoinedAt = Number(parsed.joinedAt)
      joinedAt.value = joinedGuildId.value === null
        ? null
        : Number.isFinite(savedJoinedAt) && savedJoinedAt > 0 ? savedJoinedAt : Date.now()
      pendingGuildIds.value = Array.isArray(parsed.pendingGuildIds)
        ? parsed.pendingGuildIds.filter((id): id is number => Number.isInteger(id) && validIds.has(id))
        : []
      const savedProgress = parsed.guildProgressById ?? {}
      guildProgressById.value = Object.fromEntries(siteContent.guilds.map((guild) => {
        const progress = savedProgress[guild.rank]
        const level = Number(progress?.level)
        const constructionExp = Number(progress?.constructionExp)
        const treasuryBalance = Number(progress?.treasuryBalance)
        const treasuryLedger = Array.isArray(progress?.treasuryLedger)
          ? progress.treasuryLedger.filter((entry): entry is GuildTreasuryEntry => isValidTreasuryEntry(entry)).slice(0, GUILD_TREASURY_LEDGER_LIMIT)
          : []
        const storedRewards = progress?.leaderboardRewards as Partial<Record<GuildLeaderboardKey, number[]>> | undefined
        const storedEnabled = progress?.leaderboardRewardsEnabled as Partial<Record<GuildLeaderboardKey, boolean>> | undefined
        const storedReserved = progress?.leaderboardReservedGold as Partial<Record<GuildLeaderboardKey, number>> | undefined
        const leaderboardAutoPaused = progress?.leaderboardAutoPaused === true
        const leaderboardRewards = Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => {
          const candidate = storedRewards?.[key]
          const valid = Array.isArray(candidate)
            && candidate.length === 10
            && candidate.every(amount => Number.isSafeInteger(amount) && amount >= 0)
          return [key, valid ? [...candidate] : [...DEFAULT_GUILD_LEADERBOARD_REWARDS[key]]]
        })) as Record<GuildLeaderboardKey, number[]>
        const leaderboardRewardsEnabled = Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => [key, storedEnabled?.[key] === true])) as Record<GuildLeaderboardKey, boolean>
        const leaderboardReservedGold = Object.fromEntries(GUILD_LEADERBOARD_KEYS.map(key => {
          const amount = Number(storedReserved?.[key])
          return [key, Number.isSafeInteger(amount) && amount > 0 ? amount : 0]
        })) as Record<GuildLeaderboardKey, number>
        return [guild.rank, {
          level: Number.isFinite(level) ? Math.max(1, Math.floor(level)) : 1,
          constructionExp: Number.isFinite(constructionExp) ? Math.max(0, Math.floor(constructionExp)) : 0,
          treasuryBalance: Number.isFinite(treasuryBalance) ? Math.max(0, Math.floor(treasuryBalance)) : guild.treasury,
          treasuryLedger,
          leaderboardRewards,
          leaderboardRewardsEnabled,
          leaderboardReservedGold,
          leaderboardAutoPaused,
        } satisfies GuildProgressState]
      }))
      persist()
    } catch {
      joinedGuildId.value = null
      pendingGuildIds.value = []
      joinedAt.value = null
      guildProgressById.value = Object.fromEntries(siteContent.guilds.map(guild => [guild.rank, createDefaultProgress(guild.treasury)]))
    }
  }

  function contributeToGuildTreasury(guildId: number, amount: number, operatorName = '會員') {
    const guild = siteContent.guilds.find(item => item.rank === guildId)
    const normalizedAmount = Math.floor(Number(amount))
    if (!guild || !Number.isSafeInteger(normalizedAmount) || normalizedAmount <= 0) return false

    const current = getGuildProgress(guildId) ?? createDefaultProgress(guild.treasury)
    guildProgressById.value = {
      ...guildProgressById.value,
      [guildId]: {
        ...current,
        treasuryBalance: current.treasuryBalance + normalizedAmount,
        treasuryLedger: [makeTreasuryEntry({
          type: 'contribution',
          title: '集團貢獻',
          detail: `成員捐獻 ${normalizedAmount.toLocaleString()} 金幣至集團金庫`,
          operatorName,
          amountGold: normalizedAmount,
          affectsBalance: true,
        }), ...current.treasuryLedger].slice(0, GUILD_TREASURY_LEDGER_LIMIT),
      },
    }
    persist()
    return true
  }

  function recordGuildTurnoverToTreasury(guildId: number, turnoverGoldEquivalent: number, operatorName = '會員') {
    const guild = siteContent.guilds.find(item => item.rank === guildId)
    const turnover = Math.floor(Number(turnoverGoldEquivalent))
    if (!guild || !Number.isSafeInteger(turnover) || turnover <= 0) return 0

    const generatedGold = Math.floor(turnover * GUILD_TREASURY_TURNOVER_GOLD_PER_1000 / 1000)
    if (generatedGold <= 0) return 0
    const current = getGuildProgress(guildId) ?? createDefaultProgress(guild.treasury)
    guildProgressById.value = {
      ...guildProgressById.value,
      [guildId]: {
        ...current,
        treasuryBalance: current.treasuryBalance + generatedGold,
        treasuryLedger: [makeTreasuryEntry({
          type: 'turnover',
          title: '遊戲打碼收入',
          detail: `有效打碼 ${turnover.toLocaleString()} 金幣等值，依每 1,000 打碼兌 10 金幣計算`,
          operatorName,
          amountGold: generatedGold,
          affectsBalance: true,
        }), ...current.treasuryLedger].slice(0, GUILD_TREASURY_LEDGER_LIMIT),
      },
    }
    persist()
    return generatedGold
  }

  function updateGuildLeaderboardRewards(
    guildId: number,
    key: GuildLeaderboardKey,
    enabled: boolean,
    rewards: number[],
    operatorName = '會員',
  ) {
    const guild = siteContent.guilds.find(item => item.rank === guildId)
    const normalizedRewards = rewards.map(Number)
    const rewardTotalSilver = normalizedRewards.reduce((total, amount) => total + amount, 0)
    if (
      !guild
      || !GUILD_LEADERBOARD_KEYS.includes(key)
      || typeof enabled !== 'boolean'
      || normalizedRewards.length !== 10
      || normalizedRewards.some(amount => !Number.isSafeInteger(amount) || amount < 0 || amount % GOLD_TO_SILVER_RATE !== 0)
      || !Number.isSafeInteger(rewardTotalSilver)
    ) {
      return { ok: false as const, reason: 'invalid' as const }
    }

    const current = getGuildProgress(guildId) ?? createDefaultProgress(guild.treasury)
    const currentReservedGold = current.leaderboardReservedGold[key] ?? 0
    const nextReservedGold = Math.ceil(rewardTotalSilver / GOLD_TO_SILVER_RATE)
    const goldDelta = nextReservedGold - currentReservedGold
    if (goldDelta > current.treasuryBalance) {
      guildProgressById.value = {
        ...guildProgressById.value,
        [guildId]: { ...current, leaderboardAutoPaused: true },
      }
      persist()
      return {
        ok: false as const,
        reason: 'insufficient' as const,
        neededGold: goldDelta,
        availableGold: current.treasuryBalance,
      }
    }

    const nextProgress: GuildProgressState = {
      ...current,
      treasuryBalance: current.treasuryBalance - goldDelta,
      treasuryLedger: goldDelta === 0 ? current.treasuryLedger : [makeTreasuryEntry({
        type: 'leaderboard-reserve',
        title: goldDelta > 0 ? '排行榜獎勵預扣' : '排行榜預扣額退回',
        detail: `${key}：設定獎勵合計 ${rewardTotalSilver.toLocaleString()} 銀幣（${nextReservedGold.toLocaleString()} 金幣等值）`,
        operatorName,
        amountGold: -goldDelta,
        affectsBalance: true,
      }), ...current.treasuryLedger].slice(0, GUILD_TREASURY_LEDGER_LIMIT),
      leaderboardRewards: { ...current.leaderboardRewards, [key]: normalizedRewards },
      leaderboardRewardsEnabled: { ...current.leaderboardRewardsEnabled, [key]: enabled },
      leaderboardReservedGold: { ...current.leaderboardReservedGold, [key]: nextReservedGold },
      leaderboardAutoPaused: false,
    }
    guildProgressById.value = { ...guildProgressById.value, [guildId]: nextProgress }
    persist()

    return {
      ok: true as const,
      chargedGold: Math.max(0, goldDelta),
      refundedGold: Math.max(0, -goldDelta),
      reservedGold: nextReservedGold,
      totalReservedGold: Object.values(nextProgress.leaderboardReservedGold).reduce((total, amount) => total + amount, 0),
    }
  }

  function addGuildConstructionExperience(guildId: number, amount: number, maximum: number, costPerExperience = GUILD_TREASURY_GOLD_PER_CONSTRUCTION_EXP, operatorName = '會員') {
    const guild = siteContent.guilds.find(item => item.rank === guildId)
    const normalizedAmount = Math.floor(Number(amount))
    const normalizedMaximum = Math.floor(Number(maximum))
    const normalizedCost = Math.floor(Number(costPerExperience))
    if (!guild || !Number.isSafeInteger(normalizedAmount) || normalizedAmount <= 0 || normalizedMaximum <= 0 || !Number.isSafeInteger(normalizedCost) || normalizedCost < 0) return false

    const current = getGuildProgress(guildId) ?? createDefaultProgress(guild.treasury)
    if (current.constructionExp >= normalizedMaximum) return false
    const gainedExperience = Math.min(normalizedAmount, normalizedMaximum - current.constructionExp)
    const costGold = gainedExperience * normalizedCost
    if (costGold > current.treasuryBalance) return false
    guildProgressById.value = {
      ...guildProgressById.value,
      [guildId]: {
        ...current,
        treasuryBalance: current.treasuryBalance - costGold,
        constructionExp: current.constructionExp + gainedExperience,
        treasuryLedger: costGold === 0 ? current.treasuryLedger : [makeTreasuryEntry({
          type: 'construction',
          title: '集團建設支出',
          detail: `增加 ${gainedExperience.toLocaleString()} 建設經驗，扣除 ${costGold.toLocaleString()} 金幣`,
          operatorName,
          amountGold: -costGold,
          affectsBalance: true,
        }), ...current.treasuryLedger].slice(0, GUILD_TREASURY_LEDGER_LIMIT),
      },
    }
    persist()
    return true
  }

  function recordGuildLeaderboardPayout(guildId: number, key: GuildLeaderboardKey, amountSilver: number, operatorName = '系統排程') {
    const guild = siteContent.guilds.find(item => item.rank === guildId)
    const normalizedSilver = Math.floor(Number(amountSilver))
    if (!guild || !GUILD_LEADERBOARD_KEYS.includes(key) || !Number.isSafeInteger(normalizedSilver) || normalizedSilver <= 0 || normalizedSilver % GOLD_TO_SILVER_RATE !== 0) return false

    const current = getGuildProgress(guildId) ?? createDefaultProgress(guild.treasury)
    const amountGold = normalizedSilver / GOLD_TO_SILVER_RATE
    guildProgressById.value = {
      ...guildProgressById.value,
      [guildId]: {
        ...current,
        treasuryLedger: [makeTreasuryEntry({
          type: 'leaderboard-payout',
          title: '集團排行銀幣派發',
          detail: `${key} 派發 ${normalizedSilver.toLocaleString()} 銀幣，折合 ${amountGold.toLocaleString()} 金幣；由已預扣額度支付`,
          operatorName,
          amountGold: -amountGold,
          affectsBalance: false,
        }), ...current.treasuryLedger].slice(0, GUILD_TREASURY_LEDGER_LIMIT),
      },
    }
    persist()
    return true
  }

  function promoteGuild(guildId: number, influence: number, influenceRequirement: number, constructionRequirement: number) {
    const guild = siteContent.guilds.find(item => item.rank === guildId)
    const current = getGuildProgress(guildId)
    if (!guild || !current || influence < influenceRequirement || current.constructionExp < constructionRequirement) return false

    guildProgressById.value = {
      ...guildProgressById.value,
      [guildId]: { ...current, level: current.level + 1, constructionExp: 0 },
    }
    persist()
    return true
  }

  function isPending(guildId: number) {
    return pendingGuildIds.value.includes(guildId)
  }

  function isJoined(guildId: number) {
    return joinedGuildId.value === guildId
  }

  function applyForGuild(guildId: number) {
    if (isJoined(guildId) || isPending(guildId)) return false
    pendingGuildIds.value = [...pendingGuildIds.value, guildId]
    persist()
    return true
  }

  function joinGuild(guildId: number) {
    joinedGuildId.value = guildId
    joinedAt.value = Date.now()
    pendingGuildIds.value = pendingGuildIds.value.filter(id => id !== guildId)
    persist()
  }

  function leaveGuild() {
    joinedGuildId.value = null
    joinedAt.value = null
    persist()
  }

  return {
    joinedGuild,
    joinedGuildProgress,
    joinedGuildId,
    joinedAt,
    initGuildState,
    isPending,
    isJoined,
    applyForGuild,
    joinGuild,
    leaveGuild,
    contributeToGuildTreasury,
    recordGuildTurnoverToTreasury,
    recordGuildLeaderboardPayout,
    addGuildConstructionExperience,
    promoteGuild,
    updateGuildLeaderboardRewards,
  }
}
