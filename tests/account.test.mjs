import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getAccountHalfWidthLength,
  getAccountValidationError,
  isAccountValid,
} from '../utils/account.ts'

test('accepts Chinese, English letters, and numbers', () => {
  assert.equal(isAccountValid('Lucky888'), true)
  assert.equal(isAccountValid('金幣王888'), true)
})

test('rejects spaces and special characters', () => {
  assert.match(getAccountValidationError('Lucky 888'), /空格或特殊符號/)
  assert.match(getAccountValidationError('Lucky_888'), /空格或特殊符號/)
  assert.match(getAccountValidationError(' Lucky888'), /空格或特殊符號/)
})

test('counts Chinese characters as two half-width characters', () => {
  assert.equal(getAccountHalfWidthLength('玩家A1'), 6)
  assert.equal(isAccountValid('玩家'), true)
  assert.match(getAccountValidationError('金幣玩家測試帳號一二三四'), /最多 20/)
})
