export type RewardCardCurrency = 'activity-gold' | 'activity-silver'
export type RewardCardStatus = 'inactive' | 'active' | 'paused'

export interface RewardCardDefinition {
  id: string
  milestoneDay: number
  title: string
  currency: RewardCardCurrency
  amount: number
  rebateRate: number
}

export interface RewardCard extends RewardCardDefinition {
  status: RewardCardStatus
}

const rewardCardDefinitions: RewardCardDefinition[] = [
  {
    id: 'daily-15-activity-silver',
    milestoneDay: 15,
    title: '活動銀幣',
    currency: 'activity-silver',
    amount: 10_000,
    rebateRate: 1,
  },
  {
    id: 'daily-20-activity-gold',
    milestoneDay: 20,
    title: '活動金幣',
    currency: 'activity-gold',
    amount: 5_000,
    rebateRate: 2,
  },
]

export const useRewardCardState = () => {
  // 獎勵卡 Mock 僅保留於本次瀏覽階段；重新整理後回到空白狀態。
  const rewardCards = useState<RewardCard[]>('rewardCards', () => [])

  const activityGoldBalance = computed(() => rewardCards.value
    .filter(card => card.currency === 'activity-gold' && card.status !== 'inactive')
    .reduce((total, card) => total + card.amount, 0))
  const activitySilverBalance = computed(() => rewardCards.value
    .filter(card => card.currency === 'activity-silver' && card.status !== 'inactive')
    .reduce((total, card) => total + card.amount, 0))
  const availableActivityGoldBalance = computed(() => rewardCards.value
    .filter(card => card.currency === 'activity-gold' && card.status === 'active')
    .reduce((total, card) => total + card.amount, 0))
  const availableActivitySilverBalance = computed(() => rewardCards.value
    .filter(card => card.currency === 'activity-silver' && card.status === 'active')
    .reduce((total, card) => total + card.amount, 0))

  function getDefinitionByMilestone(days: number) {
    return rewardCardDefinitions.find(card => card.milestoneDay === days) ?? null
  }

  function hasClaimedMilestone(days: number) {
    return rewardCards.value.some(card => card.milestoneDay === days)
  }

  function claimRewardCard(days: number) {
    const definition = getDefinitionByMilestone(days)
    if (!definition || hasClaimedMilestone(days)) return null
    const card: RewardCard = { ...definition, status: 'inactive' }
    rewardCards.value = [...rewardCards.value, card]
    return card
  }

  function activateRewardCard(id: string) {
    const card = rewardCards.value.find(item => item.id === id)
    if (!card || card.status === 'active') return false
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
    if (!card || card.status === 'active') return false
    rewardCards.value = rewardCards.value.filter(item => item.id !== id)
    return true
  }

  return {
    rewardCards,
    activityGoldBalance,
    activitySilverBalance,
    availableActivityGoldBalance,
    availableActivitySilverBalance,
    getDefinitionByMilestone,
    hasClaimedMilestone,
    claimRewardCard,
    activateRewardCard,
    pauseRewardCard,
    deleteRewardCard,
  }
}
