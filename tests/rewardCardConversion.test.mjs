import assert from 'node:assert/strict'
import { test } from 'node:test'

import { calculateRewardCardConversion } from '../utils/rewardCardConversion.ts'

test('converts the remaining balance when it is below the limit', () => {
  assert.deepEqual(calculateRewardCardConversion(5_000, 10_000), {
    originalBalance: 5_000,
    convertedAmount: 5_000,
    recoveredAmount: 0,
  })
})

test('caps conversion and recovers the excess balance', () => {
  assert.deepEqual(calculateRewardCardConversion(50_000, 10_000), {
    originalBalance: 50_000,
    convertedAmount: 10_000,
    recoveredAmount: 40_000,
  })
})

test('normalizes invalid and fractional values', () => {
  assert.deepEqual(calculateRewardCardConversion(-1, 2_000), {
    originalBalance: 0,
    convertedAmount: 0,
    recoveredAmount: 0,
  })
  assert.deepEqual(calculateRewardCardConversion(2_500.9, 1_000.8), {
    originalBalance: 2_500,
    convertedAmount: 1_000,
    recoveredAmount: 1_500,
  })
})
