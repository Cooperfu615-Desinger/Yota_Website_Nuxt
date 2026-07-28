import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  GIFT_REQUEST_EXPIRY_MS,
  getGiftDailyDateKey,
  MAX_GIFT_REQUEST_AMOUNT,
  createGiftRequest,
  expireGiftRequest,
  isGiftRequestExpired,
  resolveGiftRequest,
} from '../utils/giftRequest.ts'

const sender = {
  playerId: 'player-001',
  account: 'sender888',
  name: '送禮玩家',
  avatar: '/avatars/sender.webp',
}

const receiver = {
  playerId: 'player-002',
  account: 'receiver168',
  name: '收禮玩家',
  avatar: '/avatars/receiver.webp',
}

function createPendingRequest(createdAt = Date.UTC(2026, 6, 28, 4, 0, 0)) {
  return createGiftRequest({
    id: 'gift-001',
    sender,
    receiver,
    amount: 12_345,
    createdAt,
  })
}

test('creates a pending seven-day request with a frozen fee and net amount snapshot', () => {
  const createdAt = Date.UTC(2026, 6, 28, 4, 0, 0)

  assert.deepEqual(createPendingRequest(createdAt), {
    id: 'gift-001',
    sender,
    receiver,
    amount: 12_345,
    feeRate: 0.05,
    fee: 617,
    actualReceived: 11_728,
    status: 'pending',
    createdAt,
    expiresAt: createdAt + GIFT_REQUEST_EXPIRY_MS,
  })
  assert.equal(GIFT_REQUEST_EXPIRY_MS, 168 * 60 * 60 * 1000)
})

test('uses the request fee rate as a frozen snapshot when supplied', () => {
  const request = createGiftRequest({
    id: 'gift-vip',
    sender,
    receiver,
    amount: 10_000,
    feeRate: 0.03,
    createdAt: 1_000,
  })

  assert.equal(request.feeRate, 0.03)
  assert.equal(request.fee, 300)
  assert.equal(request.actualReceived, 9_700)
})

test('expires exactly at the 168-hour boundary', () => {
  const request = createPendingRequest()

  assert.equal(isGiftRequestExpired(request, request.expiresAt - 1), false)
  assert.equal(isGiftRequestExpired(request, request.expiresAt), true)
  assert.strictEqual(expireGiftRequest(request, request.expiresAt - 1), request)
  assert.deepEqual(expireGiftRequest(request, request.expiresAt), {
    ...request,
    status: 'expired',
    resolvedAt: request.expiresAt,
  })
})

test('resolves every terminal status from pending', () => {
  const request = createPendingRequest()
  const resolvedAt = request.createdAt + 1_000

  for (const status of ['accepted', 'rejected', 'cancelled', 'expired']) {
    assert.deepEqual(resolveGiftRequest(request, status, resolvedAt), {
      ...request,
      status,
      resolvedAt,
    })
  }
})

test('keeps the first terminal resolution idempotently', () => {
  const request = createPendingRequest()
  const accepted = resolveGiftRequest(request, 'accepted', request.createdAt + 1_000)
  const secondResolution = resolveGiftRequest(
    accepted,
    'rejected',
    request.createdAt + 2_000,
  )

  assert.strictEqual(secondResolution, accepted)
  assert.equal(secondResolution.status, 'accepted')
  assert.equal(secondResolution.resolvedAt, request.createdAt + 1_000)
})

test('uses the Asia/Taipei calendar date for the daily quota boundary', () => {
  assert.equal(
    getGiftDailyDateKey(Date.UTC(2026, 6, 28, 15, 59, 59)),
    '2026-07-28',
  )
  assert.equal(
    getGiftDailyDateKey(Date.UTC(2026, 6, 28, 16, 0, 0)),
    '2026-07-29',
  )
})

test('rejects gift amounts outside the domain limit', () => {
  assert.throws(
    () => createGiftRequest({
      id: 'gift-too-large',
      sender,
      receiver,
      amount: MAX_GIFT_REQUEST_AMOUNT + 1,
      createdAt: 1_000,
    }),
    RangeError,
  )
  assert.throws(
    () => createGiftRequest({
      id: 'gift-zero',
      sender,
      receiver,
      amount: 0,
      createdAt: 1_000,
    }),
    RangeError,
  )
})
