import { calculateRewardCardConversion } from '~/utils/rewardCardConversion'
import { canActivateRewardCard, canMergeRewardCard, createMergedRewardCard, isRewardCardExpired } from '~/utils/rewardCardMerge'

export type RewardCardCurrency = 'activity-silver'
export type RewardCardStatus = 'inactive' | 'active' | 'paused' | 'converted' | 'merged'

export interface RewardCardDefinition {
  id: string
  milestoneDay: number
  title: string
  currency: RewardCardCurrency
  amount: number
  totalTurnover: number
  turnoverTarget: number
  conversionLimit: number
  expiresAt: string
}

export interface RewardCard extends RewardCardDefinition {
  sourceLabel?: string
  sourceCardIds?: string[]
  mergedIntoId?: string
  sourceCount?: number
  status: RewardCardStatus
  currentBalance: number
  convertedAmount: number
  recoveredAmount: number
  convertedAt: string
}

export interface RewardCardConversionNotice {
  id: string
  cardId: string
  cardTitle: string
  sourceCurrency: RewardCardCurrency
  sourceLabel: string
  destinationLabel: string
  originalBalance: number
  convertedAmount: number
  recoveredAmount: number
  walletBalance: number
  createdAt: string
  read: boolean
}

const rewardCardDefinitions: RewardCardDefinition[] = [
  {
    id: 'daily-10-activity-silver',
    milestoneDay: 10,
    title: '活動銀幣',
    currency: 'activity-silver',
    amount: 10_000,
    totalTurnover: 0,
    turnoverTarget: 100_000,
    conversionLimit: 10_000,
    expiresAt: '2026/12/31',
  },
  {
    id: 'daily-15-activity-silver',
    milestoneDay: 15,
    title: '活動銀幣',
    currency: 'activity-silver',
    amount: 10_000,
    totalTurnover: 0,
    turnoverTarget: 100_000,
    conversionLimit: 10_000,
    expiresAt: '2026/12/31',
  },
  {
    id: 'daily-20-activity-silver',
    milestoneDay: 20,
    title: '活動銀幣',
    currency: 'activity-silver',
    amount: 5_000,
    totalTurnover: 0,
    turnoverTarget: 100_000,
    conversionLimit: 10_000,
    expiresAt: '2026/12/31',
  },
]

function formatConversionTimestamp() {
  return new Intl.DateTimeFormat('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export const useRewardCardState = () => {
  // 獎勵卡 Mock 僅保留於本次瀏覽階段；重新整理後回到空白狀態。
  const rewardCards = useState<RewardCard[]>('rewardCards', () => [])
  const claimedMilestoneDays = useState<number[]>('rewardCardClaimedMilestones', () => [])
  const pendingConversionNotice = useState<RewardCardConversionNotice | null>(
    'rewardCardConversionNotice',
    () => null,
  )
  const financial = useFinancialState()

  const activitySilverBalance = computed(() => rewardCards.value
    .filter(card => card.status === 'inactive' || card.status === 'active' || card.status === 'paused')
    .filter(card => !isRewardCardExpired(card))
    .reduce((total, card) => total + card.currentBalance, 0))
  const availableActivitySilverBalance = computed(() => rewardCards.value
    .filter(card => card.status === 'active' && !isRewardCardExpired(card))
    .reduce((total, card) => total + card.currentBalance, 0))

  function getDefinitionByMilestone(days: number) {
    return rewardCardDefinitions.find(card => card.milestoneDay === days) ?? null
  }

  function hasClaimedMilestone(days: number) {
    return claimedMilestoneDays.value.includes(days) || rewardCards.value.some(card => card.milestoneDay === days)
  }

  function getActiveCardByCurrency(currency: RewardCardCurrency) {
    return rewardCards.value.find(card => card.currency === currency && card.status === 'active' && !isRewardCardExpired(card)) ?? null
  }

  function claimRewardCard(days: number) {
    const definition = getDefinitionByMilestone(days)
    if (!definition || hasClaimedMilestone(days)) return null
    const card: RewardCard = {
      ...definition,
      status: 'inactive',
      currentBalance: definition.amount,
      convertedAmount: 0,
      recoveredAmount: 0,
      convertedAt: '',
      sourceLabel: `每日任務・第 ${definition.milestoneDay} 天`,
    }
    rewardCards.value = [...rewardCards.value, card]
    claimedMilestoneDays.value = [...new Set([...claimedMilestoneDays.value, days])].sort((a, b) => a - b)
    return card
  }

  function grantPromoRewardCard(definition: RewardCardDefinition, sourceLabel: string) {
    if (rewardCards.value.some(card => card.id === definition.id) || isRewardCardExpired(definition)) return false
    rewardCards.value = [...rewardCards.value, {
      ...definition,
      status: 'inactive',
      currentBalance: definition.amount,
      convertedAmount: 0,
      recoveredAmount: 0,
      convertedAt: '',
      sourceLabel,
    }]
    return true
  }

  function activateRewardCard(id: string) {
    const card = rewardCards.value.find(item => item.id === id)
    if (!card || (card.status !== 'inactive' && card.status !== 'paused') || isRewardCardExpired(card)) return false
    rewardCards.value.forEach(item => {
      if (item.id !== card.id && item.currency === card.currency && item.status === 'active') {
        item.status = 'paused'
      }
    })
    card.status = 'active'
    return true
  }

  function pauseRewardCard(id: string) {
    const card = rewardCards.value.find(item => item.id === id)
    if (!card || card.status !== 'active') return false
    card.status = 'paused'
    return true
  }

  function deleteRewardCard(id: string) {
    const card = rewardCards.value.find(item => item.id === id)
    if (!card || (card.status !== 'inactive' && card.status !== 'paused')) return false
    rewardCards.value = rewardCards.value.filter(item => item.id !== id)
    if (pendingConversionNotice.value?.cardId === id) pendingConversionNotice.value = null
    return true
  }

  function completeRewardCardConversion(id: string) {
    const card = rewardCards.value.find(item => item.id === id)
    if (!card || card.status !== 'active' || isRewardCardExpired(card)) return null

    const conversion = calculateRewardCardConversion(card.currentBalance, card.conversionLimit)
    if (conversion.convertedAmount <= 0) return null

    const sourceLabel = '活動銀幣'
    const destinationLabel = '儲值銀幣'
    const destinationWallet = 'silver'
    const createdAt = formatConversionTimestamp()
    const transaction = financial.addWalletReward(
      destinationWallet,
      conversion.convertedAmount,
      '獎勵卡流水完成轉換',
      `${sourceLabel} ${conversion.originalBalance.toLocaleString()} → ${destinationLabel} ${conversion.convertedAmount.toLocaleString()}・系統回收 ${conversion.recoveredAmount.toLocaleString()}`,
    )
    if (!transaction) return null

    card.totalTurnover = card.turnoverTarget
    card.currentBalance = 0
    card.status = 'converted'
    card.convertedAmount = conversion.convertedAmount
    card.recoveredAmount = conversion.recoveredAmount
    card.convertedAt = createdAt

    const walletBalance = financial.silverBalance.value
    const notice: RewardCardConversionNotice = {
      id: `conversion-${card.id}-${Date.now()}`,
      cardId: card.id,
      cardTitle: card.title,
      sourceCurrency: card.currency,
      sourceLabel,
      destinationLabel,
      ...conversion,
      walletBalance,
      createdAt,
      read: false,
    }
    pendingConversionNotice.value = notice
    return notice
  }

  function markConversionNoticeRead() {
    if (!pendingConversionNotice.value) return
    pendingConversionNotice.value.read = true
  }

  function mergeRewardCards(ids: string[], now = new Date()) {
    const newId = `merged-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const merged = createMergedRewardCard(rewardCards.value, ids, newId, now)
    if (!merged) return null

    rewardCards.value = [
      merged,
      ...rewardCards.value.map(card => ids.includes(card.id)
        ? { ...card, status: 'merged' as const, mergedIntoId: merged.id }
        : card),
    ]
    return merged
  }

  return {
    rewardCards,
    pendingConversionNotice,
    activitySilverBalance,
    availableActivitySilverBalance,
    getDefinitionByMilestone,
    hasClaimedMilestone,
    getActiveCardByCurrency,
    claimRewardCard,
    grantPromoRewardCard,
    activateRewardCard,
    pauseRewardCard,
    deleteRewardCard,
    canActivateRewardCard,
    canMergeRewardCard,
    mergeRewardCards,
    completeRewardCardConversion,
    markConversionNoticeRead,
  }
}
