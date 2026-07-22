import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  DEFAULT_GAME_WALLET,
  GAME_WALLET_OPTIONS,
  getGameWalletDisplayLabel,
  getGameWalletLabel,
} from '../utils/gameWallets.ts'

test('provides the five supported real-money game wallets', () => {
  assert.deepEqual(GAME_WALLET_OPTIONS.map(wallet => wallet.label), [
    '儲值金幣',
    '活動金幣',
    '儲值銀幣',
    '活動銀幣',
    '活動銅幣',
  ])
})

test('defaults real-money games to stored gold and resolves its label', () => {
  assert.equal(DEFAULT_GAME_WALLET, 'stored-gold')
  assert.equal(getGameWalletLabel(DEFAULT_GAME_WALLET), '儲值金幣')
})

test('shows the mock balance after every wallet option', () => {
  assert.deepEqual(GAME_WALLET_OPTIONS.map(getGameWalletDisplayLabel), [
    '儲值金幣 — 10,000,000',
    '活動金幣 — 250,000',
    '儲值銀幣 — 10,000,000',
    '活動銀幣 — 250,000',
    '活動銅幣 — 250,000',
  ])
})
