import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  DEFAULT_GAME_WALLET,
  GAME_WALLET_OPTIONS,
  getGameWalletDisplayLabel,
  getGameWalletLabel,
  resolveGameWalletOptions,
} from '../utils/gameWallets.ts'

test('provides the three supported real-money game wallets', () => {
  assert.deepEqual(GAME_WALLET_OPTIONS.map(wallet => wallet.key), [
    'gold',
    'silver',
    'bronze',
  ])
  assert.deepEqual(GAME_WALLET_OPTIONS.map(wallet => wallet.label), [
    '金幣',
    '銀幣',
    '銅幣',
  ])
})

test('defaults real-money games to gold and resolves its label', () => {
  assert.equal(DEFAULT_GAME_WALLET, 'gold')
  assert.equal(getGameWalletLabel(DEFAULT_GAME_WALLET), '金幣')
})

test('shows the mock balance after every wallet option', () => {
  assert.deepEqual(GAME_WALLET_OPTIONS.map(getGameWalletDisplayLabel), [
    '金幣 — 10,000,000',
    '銀幣 — 10,000,000',
    '銅幣 — 10,000,000',
  ])
})

test('resolves live wallet balances', () => {
  assert.deepEqual(resolveGameWalletOptions({
    gold: 10_005_000,
    silver: 10_010_000,
    bronze: 20_000_000,
  }).map(getGameWalletDisplayLabel), [
    '金幣 — 10,005,000',
    '銀幣 — 10,010,000',
    '銅幣 — 20,000,000',
  ])
})
