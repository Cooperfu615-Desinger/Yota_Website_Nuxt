import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getExchangeableSilver, isValidSilverPreviewAmount } from '../utils/walletOverview.ts'

test('quota limits exchange independently from the game wallet balance', () => {
  assert.equal(getExchangeableSilver(10_000_000, 0, 8000), 8000)
  assert.equal(getExchangeableSilver(3000, 0, 8000), 3000)
})

test('unsettled silver cannot be reused for exchange', () => {
  assert.equal(getExchangeableSilver(9000, 2500, 8000), 6500)
  assert.equal(getExchangeableSilver(1000, 2500, 8000), 0)
})

test('no balance or quota produces no exchangeable silver', () => {
  assert.equal(getExchangeableSilver(0, 0, 8000), 0)
  assert.equal(getExchangeableSilver(9000, 0, 0), 0)
  assert.equal(getExchangeableSilver(-100, 0, 8000), 0)
  assert.equal(getExchangeableSilver(9000, 0, -100), 0)
})

test('preview accepts positive integer silver within the current cap, including fractional gold results', () => {
  assert.equal(isValidSilverPreviewAmount('1', 8000), true)
  assert.equal(isValidSilverPreviewAmount('99', 8000), true)
  assert.equal(isValidSilverPreviewAmount('8000', 8000), true)
  assert.equal(isValidSilverPreviewAmount('8001', 8000), false)
  assert.equal(isValidSilverPreviewAmount('1', 0), false)
})

test('preview rejects empty, nonpositive, fractional and unsafe input', () => {
  for (const input of ['', '0', '-1', '1.5', 'abc', '9007199254740992']) {
    assert.equal(isValidSilverPreviewAmount(input, 10_000_000), false, input)
  }
})
