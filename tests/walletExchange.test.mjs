import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  calculateWalletExchange,
  canSubmitWalletExchange,
} from '../utils/walletExchange.ts'

test('exchanges gold to silver at a 1 to 100 ratio with no fee', () => {
  assert.deepEqual(calculateWalletExchange('gold-to-silver', 250), {
    direction: 'gold-to-silver',
    fromAmount: 250,
    toAmount: 25_000,
    fee: 0,
  })
})

test('exchanges silver to gold at a 100 to 1 ratio with no fee', () => {
  assert.deepEqual(calculateWalletExchange('silver-to-gold', 25_000), {
    direction: 'silver-to-gold',
    fromAmount: 25_000,
    toAmount: 250,
    fee: 0,
  })
})

test('prevents exchange when amount is invalid or exceeds the source balance', () => {
  assert.equal(canSubmitWalletExchange('gold-to-silver', 0, 10_000), false)
  assert.equal(canSubmitWalletExchange('gold-to-silver', 10_001, 10_000), false)
  assert.equal(canSubmitWalletExchange('gold-to-silver', 10_000, 10_000), true)
})

test('requires silver to gold exchange amount to be a multiple of 100', () => {
  assert.equal(canSubmitWalletExchange('silver-to-gold', 99, 10_000), false)
  assert.equal(canSubmitWalletExchange('silver-to-gold', 10_050, 20_000), false)
  assert.equal(canSubmitWalletExchange('silver-to-gold', 10_000, 20_000), true)
})
