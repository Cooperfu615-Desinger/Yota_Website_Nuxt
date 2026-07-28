import { siteContent, type ChatPlayerProfile } from '~/data/siteContent'
import {
  createGiftRequest as buildGiftRequest,
  getGiftDailyDateKey,
  MAX_GIFT_REQUEST_AMOUNT,
  resolveGiftRequest,
  type GiftParty,
  type GiftRequest,
  type GiftRequestResolution,
} from '~/utils/giftRequest'

const DAILY_GIFT_LIMIT = 10

interface GiftRequestState {
  requests: GiftRequest[]
  dailyUsed: number
  dailyDate: string
  sequence: number
  ownerPlayerId: string
  initialized: boolean
}

export type GiftRequestFailure =
  | 'daily-limit'
  | 'insufficient-balance'
  | 'invalid-amount'
  | 'amount-limit'
  | 'invalid-recipient'
  | 'not-found'
  | 'not-allowed'

export type GiftRequestResult =
  | { ok: true; request: GiftRequest }
  | { ok: false; reason: GiftRequestFailure }

function createInitialGiftState(): GiftRequestState {
  return {
    requests: [],
    dailyUsed: 0,
    dailyDate: '',
    sequence: 0,
    ownerPlayerId: '',
    initialized: false,
  }
}

function toGiftParty(player: ChatPlayerProfile): GiftParty {
  return {
    playerId: player.playerId,
    account: player.account,
    name: player.name,
    avatar: player.avatar,
  }
}

interface MockGiftRequestSeed {
  id: string
  playerId: string
  direction: 'incoming' | 'outgoing'
  amount: number
  hoursAgo: number
  status?: 'expired'
}

const MOCK_GIFT_REQUESTS = [
  { id: 'GIFT-MOCK-001', playerId: 'P10001', direction: 'incoming', amount: 120_000, hoursAgo: 26 },
  { id: 'GIFT-MOCK-002', playerId: 'P10002', direction: 'outgoing', amount: 85_000, hoursAgo: 10 },
  { id: 'GIFT-MOCK-003', playerId: 'P10003', direction: 'incoming', amount: 45_000, hoursAgo: 92 },
  { id: 'GIFT-MOCK-004', playerId: 'P10008', direction: 'outgoing', amount: 300_000, hoursAgo: 139 },
  { id: 'GIFT-MOCK-005', playerId: 'P10005', direction: 'incoming', amount: 68_000, hoursAgo: 164 },
  { id: 'GIFT-MOCK-006', playerId: 'P10006', direction: 'incoming', amount: 25_000, hoursAgo: 190, status: 'expired' },
  { id: 'GIFT-MOCK-007', playerId: 'P10007', direction: 'outgoing', amount: 220_000, hoursAgo: 236, status: 'expired' },
] satisfies readonly MockGiftRequestSeed[]

function createMockGiftRequests(currentUser: GiftParty, now: number) {
  return MOCK_GIFT_REQUESTS.flatMap((mock) => {
    const player = siteContent.chat.onlinePlayers.find(item => item.playerId === mock.playerId)
    if (!player) return []

    const otherParty = toGiftParty(player)
    const request = buildGiftRequest({
      id: mock.id,
      sender: mock.direction === 'incoming' ? otherParty : currentUser,
      receiver: mock.direction === 'incoming' ? currentUser : otherParty,
      amount: mock.amount,
      createdAt: now - mock.hoursAgo * 60 * 60 * 1000,
    })
    return [
      mock.status === 'expired'
        ? resolveGiftRequest(request, 'expired', request.expiresAt)
        : request,
    ]
  })
}

export const useGiftState = () => {
  const giftState = useState<GiftRequestState>('giftRequestState', createInitialGiftState)
  const financial = useFinancialState()

  const requests = computed(() => giftState.value.requests)
  const pendingRequests = computed(() =>
    giftState.value.requests.filter(request => request.status === 'pending'),
  )
  const dailyUsed = computed(() => giftState.value.dailyUsed)
  const dailyRemaining = computed(() =>
    Math.max(0, DAILY_GIFT_LIMIT - giftState.value.dailyUsed),
  )

  function refreshDailyCounter(now = Date.now()) {
    const today = getGiftDailyDateKey(now)
    if (giftState.value.dailyDate === today) return
    giftState.value.dailyDate = today
    giftState.value.dailyUsed = 0
  }

  function nextRequestId() {
    giftState.value.sequence += 1
    return `GIFT-${String(giftState.value.sequence).padStart(6, '0')}`
  }

  function initGiftState(currentUser: GiftParty, now = Date.now()) {
    if (giftState.value.initialized) {
      if (giftState.value.ownerPlayerId !== currentUser.playerId) {
        giftState.value = createInitialGiftState()
        initGiftState(currentUser, now)
        return
      }
      refreshDailyCounter(now)
      expireGiftRequests(currentUser.playerId, now)
      return
    }

    const seededRequests: GiftRequest[] = createMockGiftRequests(currentUser, now)

    giftState.value = {
      requests: seededRequests,
      dailyUsed: 5,
      dailyDate: getGiftDailyDateKey(now),
      sequence: 1,
      ownerPlayerId: currentUser.playerId,
      initialized: true,
    }
  }

  function replaceRequest(request: GiftRequest) {
    giftState.value.requests = giftState.value.requests.map(item =>
      item.id === request.id ? request : item,
    )
  }

  function expireGiftRequests(currentPlayerId: string, now = Date.now()) {
    let changed = false
    giftState.value.requests = giftState.value.requests.map((request) => {
      if (request.status !== 'pending' || now < request.expiresAt) return request
      const expired = resolveGiftRequest(request, 'expired', now)
      if (request.sender.playerId === currentPlayerId) {
        financial.refundGiftToVault(request.amount, {
          title: '贈禮逾期退回保險箱',
          detail: `原贈禮給 ${request.receiver.name}（@${request.receiver.account}）・${request.id}`,
        })
      }
      changed = true
      return expired
    })
    return changed
  }

  function createGiftRequest(
    sender: GiftParty,
    receiver: GiftParty,
    amount: number,
    now = Date.now(),
  ): GiftRequestResult {
    refreshDailyCounter(now)
    expireGiftRequests(sender.playerId, now)

    if (giftState.value.ownerPlayerId !== sender.playerId) {
      return { ok: false, reason: 'not-allowed' }
    }
    if (!receiver.playerId || receiver.playerId === sender.playerId) {
      return { ok: false, reason: 'invalid-recipient' }
    }
    if (!Number.isFinite(amount) || Math.floor(amount) <= 0) {
      return { ok: false, reason: 'invalid-amount' }
    }
    if (Math.floor(amount) > MAX_GIFT_REQUEST_AMOUNT) {
      return { ok: false, reason: 'amount-limit' }
    }
    if (giftState.value.dailyUsed >= DAILY_GIFT_LIMIT) {
      return { ok: false, reason: 'daily-limit' }
    }
    if (!financial.reserveGiftFromVault(amount)) {
      return { ok: false, reason: 'insufficient-balance' }
    }

    const request = buildGiftRequest({
      id: nextRequestId(),
      sender,
      receiver,
      amount,
      createdAt: now,
    })

    giftState.value.requests = [request, ...giftState.value.requests]
    giftState.value.dailyUsed += 1
    return { ok: true, request }
  }

  function resolveRequest(
    requestId: string,
    actorPlayerId: string,
    resolution: GiftRequestResolution,
    now = Date.now(),
  ): GiftRequestResult {
    if (giftState.value.ownerPlayerId !== actorPlayerId) {
      return { ok: false, reason: 'not-allowed' }
    }
    expireGiftRequests(actorPlayerId, now)
    const request = giftState.value.requests.find(item => item.id === requestId)
    if (!request) return { ok: false, reason: 'not-found' }
    if (request.status !== 'pending') return { ok: false, reason: 'not-allowed' }

    const isSender = request.sender.playerId === actorPlayerId
    const isReceiver = request.receiver.playerId === actorPlayerId
    const allowed = resolution === 'cancelled'
      ? isSender
      : resolution === 'accepted' || resolution === 'rejected'
        ? isReceiver
        : false
    if (!allowed) return { ok: false, reason: 'not-allowed' }

    const resolved = resolveGiftRequest(request, resolution, now)
    replaceRequest(resolved)

    if (resolution === 'accepted') {
      financial.receiveGiftToWallet(request.sender, {
        requestId: request.id,
        amount: request.amount,
        fee: request.fee,
        actualReceived: request.actualReceived,
      })
    } else if (isSender) {
      financial.refundGiftToVault(request.amount)
    }

    return { ok: true, request: resolved }
  }

  function acceptGiftRequest(requestId: string, actorPlayerId: string, now = Date.now()) {
    return resolveRequest(requestId, actorPlayerId, 'accepted', now)
  }

  function rejectGiftRequest(requestId: string, actorPlayerId: string, now = Date.now()) {
    return resolveRequest(requestId, actorPlayerId, 'rejected', now)
  }

  function cancelGiftRequest(requestId: string, actorPlayerId: string, now = Date.now()) {
    return resolveRequest(requestId, actorPlayerId, 'cancelled', now)
  }

  function resetGiftState() {
    giftState.value = createInitialGiftState()
  }

  return {
    requests,
    pendingRequests,
    dailyUsed,
    dailyRemaining,
    dailyLimit: DAILY_GIFT_LIMIT,
    initGiftState,
    expireGiftRequests,
    createGiftRequest,
    acceptGiftRequest,
    rejectGiftRequest,
    cancelGiftRequest,
    resetGiftState,
  }
}
