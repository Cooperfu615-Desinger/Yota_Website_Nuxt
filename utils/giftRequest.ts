import {
  calculateVaultTransfer,
  VAULT_TRANSFER_FEE_RATE,
} from './vaultTransfer.ts'

export const GIFT_REQUEST_EXPIRY_MS = 168 * 60 * 60 * 1000
export const MAX_GIFT_REQUEST_AMOUNT = 1_000_000
export const GIFT_OPERATION_TIME_ZONE = 'Asia/Taipei'

export interface GiftParty {
  playerId: string
  account: string
  name: string
  avatar: string
}

export type GiftRequestStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'expired'

export type GiftRequestResolution = Exclude<GiftRequestStatus, 'pending'>

export interface GiftRequest {
  id: string
  sender: GiftParty
  receiver: GiftParty
  amount: number
  feeRate: number
  fee: number
  actualReceived: number
  status: GiftRequestStatus
  createdAt: number
  expiresAt: number
  resolvedAt?: number
}

export interface CreateGiftRequestInput {
  id: string
  sender: GiftParty
  receiver: GiftParty
  amount: number
  createdAt: number
  feeRate?: number
}

export function getGiftDailyDateKey(
  now: number,
  timeZone = GIFT_OPERATION_TIME_ZONE,
) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(now))
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function normalizeFeeRate(feeRate: number | undefined) {
  if (feeRate === undefined || !Number.isFinite(feeRate)) {
    return VAULT_TRANSFER_FEE_RATE
  }

  return Math.min(1, Math.max(0, feeRate))
}

export function createGiftRequest(input: CreateGiftRequestInput): GiftRequest {
  const transfer = calculateVaultTransfer(input.amount)
  if (transfer.amount <= 0 || transfer.amount > MAX_GIFT_REQUEST_AMOUNT) {
    throw new RangeError(`Gift amount must be between 1 and ${MAX_GIFT_REQUEST_AMOUNT}`)
  }
  const feeRate = normalizeFeeRate(input.feeRate)
  const fee = feeRate === VAULT_TRANSFER_FEE_RATE
    ? transfer.fee
    : Math.floor(transfer.amount * feeRate)

  return {
    id: input.id,
    sender: input.sender,
    receiver: input.receiver,
    amount: transfer.amount,
    feeRate,
    fee,
    actualReceived: Math.max(0, transfer.amount - fee),
    status: 'pending',
    createdAt: input.createdAt,
    expiresAt: input.createdAt + GIFT_REQUEST_EXPIRY_MS,
  }
}

export function isGiftRequestExpired(request: GiftRequest, now: number) {
  return now >= request.expiresAt
}

export function resolveGiftRequest(
  request: GiftRequest,
  status: GiftRequestResolution,
  resolvedAt: number,
): GiftRequest {
  if (request.status !== 'pending') return request

  return {
    ...request,
    status,
    resolvedAt,
  }
}

export function expireGiftRequest(request: GiftRequest, now: number) {
  if (!isGiftRequestExpired(request, now)) return request
  return resolveGiftRequest(request, 'expired', now)
}

export function formatGiftRequestRemainingTime(request: GiftRequest, now: number) {
  const remainingMs = request.expiresAt - now
  if (remainingMs <= 0) return '已逾期'

  const totalMinutes = Math.ceil(remainingMs / (60 * 1000))
  const days = Math.floor(totalMinutes / (24 * 60))
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return `剩餘 ${days} 天 ${hours} 小時`
  if (hours > 0) return `剩餘 ${hours} 小時 ${minutes} 分鐘`
  if (minutes > 0) return `剩餘 ${minutes} 分鐘`
  return '剩餘不到 1 分鐘'
}
