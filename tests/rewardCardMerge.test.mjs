import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  canActivateRewardCard,
  canMergeRewardCard,
  createMergedRewardCard,
  getRewardCardExpiryTime,
  REWARD_CARD_MERGE_WINDOW_MS,
} from '../utils/rewardCardMerge.ts'

const card = (id, overrides = {}) => ({
  id,
  milestoneDay: 0,
  title: id,
  currency: 'activity-silver',
  status: 'inactive',
  amount: 1_000,
  currentBalance: 600,
  totalTurnover: 200,
  turnoverTarget: 10_000,
  conversionLimit: 800,
  expiresAt: '2026/12/31',
  convertedAmount: 0,
  recoveredAmount: 0,
  convertedAt: '',
  ...overrides,
})

const now = new Date(2026, 8, 8)
const merge = (cards, time = now) => createMergedRewardCard(
  cards,
  cards.map(item => item.id),
  'new-card',
  time,
)

test('合併限制為剩餘時間超過 72 小時，啟用資格不受影響', () => {
  const source = card('a')
  const expiry = getRewardCardExpiryTime(source)
  const cutoff = expiry - REWARD_CARD_MERGE_WINDOW_MS

  assert.equal(canMergeRewardCard(source, new Date(cutoff - 1)), true)
  for (const time of [cutoff, cutoff + 1, expiry - 1]) {
    assert.equal(canMergeRewardCard(source, new Date(time)), false)
    assert.equal(canActivateRewardCard(source, new Date(time)), true)
  }
  assert.equal(canActivateRewardCard(source, new Date(expiry)), false)
})

test('合併直接加總五項數值，並採最早到期日', () => {
  const first = card('a')
  const second = card('b', {
    amount: 3_000,
    currentBalance: 3_500,
    totalTurnover: 4_000,
    turnoverTarget: 60_000,
    conversionLimit: 2_500,
    expiresAt: '2026/11/30',
  })
  const result = merge([first, second])

  assert.deepEqual([
    result.amount,
    result.currentBalance,
    result.totalTurnover,
    result.turnoverTarget,
    result.conversionLimit,
  ], [4_000, 4_100, 4_200, 70_000, 3_300])
  assert.equal(result.expiresAt, '2026/11/30')
  assert.equal(result.status, 'inactive')
  assert.equal(first.status, 'inactive')
})

test('合併張數沒有上限，且拒絕無效選取', () => {
  assert.equal(merge(Array.from({ length: 100 }, (_, index) => card(String(index)))).sourceCount, 100)
  assert.equal(merge([card('a')]), null)
  assert.equal(createMergedRewardCard([card('a')], ['a', 'a'], 'new-card', now), null)
  assert.equal(createMergedRewardCard([card('a')], ['a', 'missing'], 'new-card', now), null)
  assert.equal(createMergedRewardCard([card('a'), card('b')], ['a', 'b'], 'a', now), null)
})

test('使用中、已轉換、已合併、過期與無效日期不可合併', () => {
  for (const status of ['active', 'converted', 'merged']) {
    assert.equal(merge([card('a', { status }), card('b')]), null)
  }
  assert.ok(merge([card('a', { status: 'paused' }), card('b')]))
  for (const expiresAt of ['2020/01/01', 'invalid', '2026/02/30']) {
    assert.equal(merge([card('a', { expiresAt }), card('b')]), null)
  }
})

test('確認合併時會重新檢查 72 小時限制', () => {
  const cards = [card('a'), card('b')]
  const cutoff = getRewardCardExpiryTime(cards[0]) - REWARD_CARD_MERGE_WINDOW_MS

  assert.ok(merge(cards, new Date(cutoff - 1)))
  assert.equal(merge(cards, new Date(cutoff)), null)
})
