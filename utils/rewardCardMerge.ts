import type { RewardCard } from '~/composables/useRewardCardState'

export const REWARD_CARD_MERGE_WINDOW_HOURS = 72
export const REWARD_CARD_MERGE_WINDOW_MS = REWARD_CARD_MERGE_WINDOW_HOURS * 60 * 60 * 1000

/**
 * 獎勵卡有效至 expiresAt 當天 23:59:59；隔日 00:00 起視為過期。
 * 日期格式沿用目前 Web/APP 原型使用的 YYYY/MM/DD。
 */
export function getRewardCardExpiryTime(card: Pick<RewardCard, 'expiresAt'>) {
  const [year, month, day] = card.expiresAt.split('/').map(Number)
  const date = new Date(year, month - 1, day)
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return Number.NaN

  return new Date(year, month - 1, day + 1).getTime()
}

export function isRewardCardExpired(card: Pick<RewardCard, 'expiresAt'>, now = new Date()) {
  return !(getRewardCardExpiryTime(card) > now.getTime())
}

export function canActivateRewardCard(card: RewardCard, now = new Date()) {
  return (card.status === 'inactive' || card.status === 'paused') && !isRewardCardExpired(card, now)
}

export function canMergeRewardCard(card: RewardCard, now = new Date()) {
  const expiryTime = getRewardCardExpiryTime(card)
  return canActivateRewardCard(card, now) && expiryTime - now.getTime() > REWARD_CARD_MERGE_WINDOW_MS
}

export function createMergedRewardCard(
  cards: RewardCard[],
  ids: string[],
  newId: string,
  now = new Date(),
): RewardCard | null {
  if (ids.length < 2 || new Set(ids).size !== ids.length || cards.some(card => card.id === newId)) return null

  const selected = ids.map(id => cards.find(card => card.id === id))
  if (selected.some(card => !card || !canMergeRewardCard(card, now))) return null

  const sources = selected as RewardCard[]
  const sum = (key: 'amount' | 'currentBalance' | 'totalTurnover' | 'turnoverTarget' | 'conversionLimit') =>
    sources.reduce((total, card) => total + card[key], 0)

  return {
    id: newId,
    milestoneDay: 0,
    title: '活動銀幣合併卡',
    currency: 'activity-silver',
    status: 'inactive',
    amount: sum('amount'),
    currentBalance: sum('currentBalance'),
    totalTurnover: sum('totalTurnover'),
    turnoverTarget: sum('turnoverTarget'),
    conversionLimit: sum('conversionLimit'),
    expiresAt: sources.reduce((earliest, card) => (
      getRewardCardExpiryTime(card) < getRewardCardExpiryTime(earliest) ? card : earliest
    )).expiresAt,
    convertedAmount: 0,
    recoveredAmount: 0,
    convertedAt: '',
    sourceCardIds: ids,
    sourceCount: sources.reduce((total, card) => total + (card.sourceCount ?? 1), 0),
  }
}
