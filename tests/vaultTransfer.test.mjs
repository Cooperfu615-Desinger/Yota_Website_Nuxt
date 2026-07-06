import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  calculateVaultTransfer,
  canSubmitVaultTransfer,
} from '../utils/vaultTransfer.ts'

test('calculates a 5 percent vault transfer fee and actual received amount', () => {
  assert.deepEqual(calculateVaultTransfer(12_345), {
    amount: 12_345,
    fee: 617,
    actualReceived: 11_728,
  })
})

test('prevents submitting when receiver or amount is invalid', () => {
  assert.equal(canSubmitVaultTransfer('', 10_000, 20_000), false)
  assert.equal(canSubmitVaultTransfer('P10002', 0, 20_000), false)
  assert.equal(canSubmitVaultTransfer('P10002', 20_001, 20_000), false)
  assert.equal(canSubmitVaultTransfer('P10002', 20_000, 20_000), true)
})
