import assert from 'node:assert/strict'
import test from 'node:test'

import { calculateWalletSpend } from '../utils/walletSpend.ts'

test('spends an amount and returns the remaining wallet balance', () => {
  assert.deepEqual(calculateWalletSpend(1_000, 100), {
    spentAmount: 100,
    remainingBalance: 900,
  })
})

test('allows spending the exact wallet balance', () => {
  assert.deepEqual(calculateWalletSpend(100, 100), {
    spentAmount: 100,
    remainingBalance: 0,
  })
})

test('rejects invalid or insufficient wallet spends', () => {
  assert.equal(calculateWalletSpend(99, 100), null)
  assert.equal(calculateWalletSpend(100, 0), null)
  assert.equal(calculateWalletSpend(100, Number.NaN), null)
})

test('normalizes fractional balances and amounts', () => {
  assert.deepEqual(calculateWalletSpend(100.9, 10.8), {
    spentAmount: 10,
    remainingBalance: 90,
  })
})
