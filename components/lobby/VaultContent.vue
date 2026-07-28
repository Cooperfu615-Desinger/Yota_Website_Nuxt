<script setup lang="ts">
import { siteContent, type ChatPlayerProfile } from '~/data/siteContent'
import {
  MAX_GIFT_REQUEST_AMOUNT,
  type GiftParty,
  type GiftRequest,
} from '~/utils/giftRequest'
import { calculateVaultTransfer, canSubmitVaultTransfer } from '~/utils/vaultTransfer'
import {
  calculateWalletExchange,
  canSubmitWalletExchange,
  GOLD_TO_SILVER_RATE,
  type WalletExchangeDirection,
} from '~/utils/walletExchange'

type VaultTab = 'vault' | 'transfer' | 'exchange'
type NoticeType = 'success' | 'error'
const MAX_GIFT_AMOUNT = MAX_GIFT_REQUEST_AMOUNT

const props = withDefaults(defineProps<{ embedded?: boolean; initialTab?: VaultTab; view?: 'vault' | 'exchange' }>(), {
  embedded: false,
  initialTab: 'vault',
  view: 'vault',
})

const route = useRoute()
const router = useRouter()
const {
  isLoggedIn,
  userInfo,
  openLogin,
  depositToVault,
  withdrawFromVault,
  exchangeWalletCurrency,
} = useAppState()
const {
  friends,
  isBlockedPlayer,
} = useSocialState()
const {
  requests,
  dailyRemaining,
  dailyLimit,
  initGiftState,
  expireGiftRequests,
  createGiftRequest,
  acceptGiftRequest,
  rejectGiftRequest,
  cancelGiftRequest,
} = useGiftState()

const activeTab = ref<VaultTab>(props.view === 'exchange' ? 'exchange' : props.initialTab)
const mode = ref<'deposit' | 'withdraw'>('deposit')
const amount = ref(0)
const selectedReceiver = ref<ChatPlayerProfile | null>(null)
const showPlayerSearch = ref(false)
const transferAmount = ref(0)
const transferNotice = ref<{ type: NoticeType; text: string } | null>(null)
const pendingGiftAction = ref<{
  action: 'accept' | 'reject' | 'cancel'
  request: GiftRequest
} | null>(null)
const giftDialogRef = ref<HTMLElement | null>(null)
const giftDialogBackRef = ref<HTMLButtonElement | null>(null)
let giftDialogReturnFocus: HTMLElement | null = null
const giftActionTitle = computed(() => {
  if (pendingGiftAction.value?.action === 'accept') return '接受這份贈禮？'
  if (pendingGiftAction.value?.action === 'reject') return '拒絕這份贈禮？'
  return '取消贈禮申請？'
})
const giftActionDescription = computed(() => {
  if (!pendingGiftAction.value) return ''
  const { action, request } = pendingGiftAction.value
  if (action === 'accept') {
    return `接受後，${request.actualReceived.toLocaleString()} 金幣會直接存入你的金幣錢包。`
  }
  if (action === 'reject') {
    return `拒絕後，${request.amount.toLocaleString()} 金幣會退回 ${request.sender.name} 的保險箱。`
  }
  return `取消後，${request.amount.toLocaleString()} 金幣會全額退回你的保險箱。`
})
const giftActionConfirmLabel = computed(() => {
  if (pendingGiftAction.value?.action === 'accept') return '確認接受'
  if (pendingGiftAction.value?.action === 'reject') return '確認拒絕'
  return '確認取消'
})
const giftNow = ref(0)
const exchangeDirection = ref<WalletExchangeDirection>('gold-to-silver')
const exchangeAmount = ref(0)
const exchangeNotice = ref<{ type: NoticeType; text: string } | null>(null)
let transferNoticeTimer: ReturnType<typeof setTimeout> | null = null
let exchangeNoticeTimer: ReturnType<typeof setTimeout> | null = null
let giftClockTimer: ReturnType<typeof setInterval> | null = null

const maxAmount = computed(() => mode.value === 'deposit' ? userInfo.value.balance : userInfo.value.vaultBalance)
const maxTransferAmount = computed(() => Math.min(userInfo.value.vaultBalance, MAX_GIFT_AMOUNT))
const transferSummary = computed(() => calculateVaultTransfer(transferAmount.value))
const canConfirmTransfer = computed(() =>
  canSubmitVaultTransfer(selectedReceiver.value?.playerId ?? '', transferAmount.value, userInfo.value.vaultBalance) &&
  transferAmount.value <= MAX_GIFT_AMOUNT &&
  dailyRemaining.value > 0
)
const currentGiftParty = computed<GiftParty>(() => ({
  playerId: userInfo.value.id,
  account: userInfo.value.account,
  name: userInfo.value.name,
  avatar: userInfo.value.avatar,
}))
const searchablePlayers = computed(() =>
  siteContent.chat.onlinePlayers.filter(player => !isBlockedPlayer(player.playerId)),
)
const friendIds = computed(() => friends.value.map(friend => friend.playerId))
const exchangeSourceBalance = computed(() =>
  exchangeDirection.value === 'gold-to-silver' ? userInfo.value.balance : userInfo.value.silverBalance
)
const exchangeSummary = computed(() => calculateWalletExchange(exchangeDirection.value, exchangeAmount.value))
const canConfirmExchange = computed(() =>
  canSubmitWalletExchange(exchangeDirection.value, exchangeAmount.value, exchangeSourceBalance.value)
)
const exchangeStep = computed(() => exchangeDirection.value === 'gold-to-silver' ? 1 : GOLD_TO_SILVER_RATE)

watch([mode, maxAmount], () => {
  if (amount.value > maxAmount.value) amount.value = maxAmount.value
})

watch(maxTransferAmount, (maximum) => {
  if (transferAmount.value > maximum) transferAmount.value = maximum
})

watch([exchangeDirection, exchangeSourceBalance], () => {
  if (exchangeAmount.value > exchangeSourceBalance.value) exchangeAmount.value = exchangeSourceBalance.value
})

watch(pendingGiftAction, async (action) => {
  if (!import.meta.client) return

  if (action) {
    await nextTick()
    giftDialogBackRef.value?.focus()
    return
  }

  await nextTick()
  if (giftDialogReturnFocus?.isConnected) {
    giftDialogReturnFocus.focus()
  } else {
    document.querySelector<HTMLElement>('[aria-label="贈禮申請篩選"] button')?.focus()
  }
  giftDialogReturnFocus = null
})

onMounted(() => {
  giftNow.value = Date.now()
  initGiftState(currentGiftParty.value, giftNow.value)
  expireGiftRequests(userInfo.value.id, giftNow.value)
  applyRouteQuery()
  giftClockTimer = setInterval(() => {
    giftNow.value = Date.now()
    expireGiftRequests(userInfo.value.id, giftNow.value)
  }, 60_000)
})

watch(() => route.query, () => {
  applyRouteQuery()
})

onUnmounted(() => {
  if (transferNoticeTimer) clearTimeout(transferNoticeTimer)
  if (exchangeNoticeTimer) clearTimeout(exchangeNoticeTimer)
  if (giftClockTimer) clearInterval(giftClockTimer)
  if (import.meta.client && giftDialogReturnFocus?.isConnected) giftDialogReturnFocus.focus()
})

function applyRouteQuery() {
  if (props.view === 'exchange') {
    activeTab.value = 'exchange'
    return
  }
  if (props.embedded) {
    activeTab.value = props.initialTab
    if (typeof route.query.receiverId === 'string') selectReceiverById(route.query.receiverId)
    return
  }
  if (route.query.tab === 'transfer') activeTab.value = 'transfer'
  else activeTab.value = 'vault'
  if (route.query.tab === 'exchange') {
    router.replace('/lobby/exchange')
    return
  }
  if (typeof route.query.receiverId === 'string') {
    selectReceiverById(route.query.receiverId)
  }
}

function selectReceiverById(playerId: string) {
  const player = siteContent.chat.onlinePlayers.find(item => item.playerId === playerId)
  if (player && player.playerId !== userInfo.value.id && !isBlockedPlayer(player.playerId)) {
    selectedReceiver.value = player
  }
}

function selectReceiver(player: ChatPlayerProfile) {
  selectedReceiver.value = player
  showPlayerSearch.value = false
  transferNotice.value = null
}

function selectVaultTab(tab: 'vault' | 'transfer') {
  activeTab.value = tab
  router.replace(tab === 'transfer' ? { path: '/lobby/vault', query: { tab } } : '/lobby/vault')
}

function onAmountInput(e: Event) {
  let v = parseInt((e.target as HTMLInputElement).value.replace(/[^0-9]/g, ''), 10)
  if (isNaN(v) || v < 0) v = 0
  if (v > maxAmount.value) v = maxAmount.value
  amount.value = v
}
function setMax() { amount.value = maxAmount.value }

const canConfirm = computed(() => amount.value > 0 && amount.value <= maxAmount.value)

function confirm() {
  if (!canConfirm.value) return
  if (mode.value === 'deposit') depositToVault(amount.value)
  else withdrawFromVault(amount.value)
  amount.value = 0
}

function onTransferAmountInput(e: Event) {
  let v = parseInt((e.target as HTMLInputElement).value.replace(/[^0-9]/g, ''), 10)
  if (isNaN(v) || v < 0) v = 0
  if (v > maxTransferAmount.value) v = maxTransferAmount.value
  transferAmount.value = v
}

function setTransferPercent(percent: number) {
  transferAmount.value = Math.floor(maxTransferAmount.value * percent)
}

function setExchangeDirection(direction: WalletExchangeDirection) {
  exchangeDirection.value = direction
  exchangeAmount.value = 0
  exchangeNotice.value = null
}

function onExchangeAmountInput(e: Event) {
  let v = parseInt((e.target as HTMLInputElement).value.replace(/[^0-9]/g, ''), 10)
  if (isNaN(v) || v < 0) v = 0
  if (v > exchangeSourceBalance.value) v = exchangeSourceBalance.value
  exchangeAmount.value = v
}

function setExchangePercent(percent: number) {
  let value = Math.floor(exchangeSourceBalance.value * percent)
  if (exchangeDirection.value === 'silver-to-gold') {
    value = Math.floor(value / GOLD_TO_SILVER_RATE) * GOLD_TO_SILVER_RATE
  }
  exchangeAmount.value = value
}

function showTransferNotice(type: NoticeType, text: string) {
  transferNotice.value = { type, text }
  if (transferNoticeTimer) clearTimeout(transferNoticeTimer)
  transferNoticeTimer = setTimeout(() => {
    transferNotice.value = null
  }, 3200)
}

function showExchangeNotice(type: NoticeType, text: string) {
  exchangeNotice.value = { type, text }
  if (exchangeNoticeTimer) clearTimeout(exchangeNoticeTimer)
  exchangeNoticeTimer = setTimeout(() => {
    exchangeNotice.value = null
  }, 3200)
}

function confirmTransfer() {
  if (!selectedReceiver.value) {
    showTransferNotice('error', '請先搜尋並選擇收禮玩家。')
    return
  }
  if (transferAmount.value <= 0) {
    showTransferNotice('error', '請輸入贈禮金額。')
    return
  }

  giftNow.value = Date.now()
  const result = createGiftRequest(
    currentGiftParty.value,
    {
      playerId: selectedReceiver.value.playerId,
      account: selectedReceiver.value.account,
      name: selectedReceiver.value.name,
      avatar: selectedReceiver.value.avatar,
    },
    transferAmount.value,
    giftNow.value,
  )
  if (!result.ok) {
    if (result.reason === 'daily-limit') {
      showTransferNotice('error', '今日贈禮申請次數已用完。')
    } else if (result.reason === 'amount-limit') {
      showTransferNotice('error', `單次贈禮上限為 ${MAX_GIFT_AMOUNT.toLocaleString()} 金幣。`)
    } else if (result.reason === 'invalid-amount') {
      showTransferNotice('error', '請輸入有效的贈禮金額。')
    } else if (result.reason === 'invalid-recipient') {
      showTransferNotice('error', '無法贈禮給這位玩家，請重新選擇。')
    } else {
      showTransferNotice('error', '保險箱餘額不足，請先存入金幣。')
    }
    return
  }

  showTransferNotice(
    'success',
    `贈禮申請已送出，等待 ${result.request.receiver.name} 接受；申請將於 168 小時後到期。`,
  )
  selectedReceiver.value = null
  transferAmount.value = 0
}

function openGiftAction(action: 'accept' | 'reject' | 'cancel', request: GiftRequest) {
  if (import.meta.client) {
    giftDialogReturnFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  }
  pendingGiftAction.value = { action, request }
}

function closeGiftActionDialog() {
  pendingGiftAction.value = null
}

function handleGiftDialogKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    closeGiftActionDialog()
    return
  }

  if (event.key !== 'Tab' || !giftDialogRef.value) return

  const focusableElements = Array.from(
    giftDialogRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter(element => !element.hasAttribute('hidden'))

  if (!focusableElements.length) {
    event.preventDefault()
    giftDialogRef.value.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  const focusIsInsideDialog = document.activeElement instanceof Node
    && giftDialogRef.value.contains(document.activeElement)

  if (event.shiftKey && (document.activeElement === firstElement || !focusIsInsideDialog)) {
    event.preventDefault()
    lastElement?.focus()
  } else if (!event.shiftKey && (document.activeElement === lastElement || !focusIsInsideDialog)) {
    event.preventDefault()
    firstElement?.focus()
  }
}

function confirmGiftAction() {
  if (!pendingGiftAction.value) return
  const { action, request } = pendingGiftAction.value
  giftNow.value = Date.now()
  const result = action === 'accept'
    ? acceptGiftRequest(request.id, userInfo.value.id, giftNow.value)
    : action === 'reject'
      ? rejectGiftRequest(request.id, userInfo.value.id, giftNow.value)
      : cancelGiftRequest(request.id, userInfo.value.id, giftNow.value)

  if (!result.ok) {
    showTransferNotice('error', '此申請狀態已更新，請重新確認列表。')
  } else if (action === 'accept') {
    showTransferNotice('success', `已接受 ${request.sender.name} 的贈禮，${request.actualReceived.toLocaleString()} 金幣已存入金幣錢包。`)
  } else if (action === 'reject') {
    showTransferNotice('success', `已拒絕 ${request.sender.name} 的贈禮申請。`)
  } else {
    showTransferNotice('success', `已取消贈禮申請，${request.amount.toLocaleString()} 金幣已退回保險箱。`)
  }
  closeGiftActionDialog()
}

function confirmExchange() {
  if (exchangeAmount.value <= 0) {
    showExchangeNotice('error', '請輸入兌換金額。')
    return
  }
  if (exchangeDirection.value === 'silver-to-gold' && exchangeAmount.value % GOLD_TO_SILVER_RATE !== 0) {
    showExchangeNotice('error', '銀幣換金幣需以 100 銀幣為單位。')
    return
  }

  const result = exchangeWalletCurrency(exchangeDirection.value, exchangeAmount.value)
  if (!result) {
    showExchangeNotice('error', '目前餘額不足，請重新輸入兌換金額。')
    return
  }

  const fromLabel = result.direction === 'gold-to-silver' ? '金幣' : '銀幣'
  const toLabel = result.direction === 'gold-to-silver' ? '銀幣' : '金幣'
  showExchangeNotice(
    'success',
    `已兌換 ${result.fromAmount.toLocaleString()} ${fromLabel}，獲得 ${result.toAmount.toLocaleString()} ${toLabel}。`
  )
  exchangeAmount.value = 0
}
</script>

<template>
  <div :class="props.embedded ? 'py-1' : 'lobby-page px-4 py-5'">
    <!-- 未登入 -->
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="text-5xl mb-4" aria-hidden="true">{{ props.view === 'exchange' ? '⇄' : '🔐' }}</div>
        <h1 class="text-xl font-black mb-2">{{ props.view === 'exchange' ? '兌換' : '保險箱 / 贈禮' }}</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">{{ props.view === 'exchange' ? '登入後即可進行金幣與銀幣兌換' : '登入後即可使用保險箱存放金幣，並將金幣贈禮給其他會員' }}</p>
        <button class="btn-gold w-full justify-center" @click="openLogin(props.view === 'exchange' ? '/lobby/exchange' : '/lobby/vault')">立即登入 / 註冊</button>
      </div>
    </template>

    <!-- 已登入 -->
    <template v-else>
      <h1 v-if="!props.embedded" class="section-title mb-4">{{ props.view === 'exchange' ? '兌換' : '保險箱 / 贈禮' }}</h1>

      <div v-if="!props.embedded && props.view === 'vault'" class="tab-bar mb-4 max-w-lg" role="group" aria-label="保險箱與贈禮">
        <button class="tab-btn" :class="{ active: activeTab === 'vault' }" :aria-pressed="activeTab === 'vault'" @click="selectVaultTab('vault')">保險箱</button>
        <button class="tab-btn" :class="{ active: activeTab === 'transfer' }" :aria-pressed="activeTab === 'transfer'" @click="selectVaultTab('transfer')">贈禮</button>
      </div>

      <Transition name="tab-fade" mode="out-in">
        <div v-if="activeTab === 'vault'" key="vault" class="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start flex flex-col gap-4">
          <!-- 左欄：餘額 -->
          <div class="card-purple p-5">
            <div class="rounded-xl p-4 mb-1" style="background:rgba(0,0,0,0.25);">
              <div class="text-sm mb-1" style="color:var(--color-text-muted);">金幣 (可用)</div>
              <div class="text-3xl font-black" style="color:var(--color-gold);">{{ userInfo.balance.toLocaleString() }}</div>
            </div>
            <div class="text-center text-2xl my-2" style="color:var(--color-text-muted);">↓</div>
            <div class="rounded-xl p-4" style="background:rgba(0,0,0,0.25);">
              <div class="text-sm mb-1" style="color:var(--color-text-muted);">保險箱金幣 (凍結)</div>
              <div class="text-3xl font-black" style="color:var(--color-text);">{{ userInfo.vaultBalance.toLocaleString() }}</div>
            </div>
            <ul class="mt-4 text-xs space-y-1" style="color:var(--color-text-muted);">
              <li>・存入保險箱的金幣可用於贈禮。</li>
              <li>・存入可避免誤觸遊玩時消耗。</li>
            </ul>
          </div>

          <!-- 右欄：操作 -->
          <div class="card-purple p-5">
            <!-- 模式切換 -->
            <div class="tab-bar mb-4" role="group" aria-label="保險箱操作">
              <button class="tab-btn" :class="{ active: mode === 'deposit' }" :aria-pressed="mode === 'deposit'" @click="mode = 'deposit'">存入</button>
              <button class="tab-btn" :class="{ active: mode === 'withdraw' }" :aria-pressed="mode === 'withdraw'" @click="mode = 'withdraw'">取出</button>
            </div>

            <h2 class="text-lg font-black text-center mb-1">{{ mode === 'deposit' ? '存入保險箱' : '取出至金幣' }}</h2>
            <p class="text-sm text-center mb-4" style="color:var(--color-text-muted);">
              {{ mode === 'deposit' ? '請輸入欲從金幣餘額轉入保險箱的金額' : '請輸入欲從保險箱轉回金幣餘額的金額' }}
            </p>

            <div class="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style="background:rgba(0,0,0,0.3); border:1px solid var(--color-border);">
              <input
                :value="amount"
                type="text"
                inputmode="numeric"
                class="flex-1 bg-transparent outline-none text-2xl font-black text-center"
                style="color:var(--color-text);"
                aria-label="金額"
                @input="onAmountInput"
              />
              <button class="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0" style="background:rgba(168,85,247,0.2); color:var(--color-text-muted); border:1px solid var(--color-border);" @click="setMax">MAX</button>
            </div>

            <button
              class="btn-gold w-full justify-center text-lg py-3"
              style="border-radius:14px;"
              :disabled="!canConfirm"
              :style="!canConfirm ? 'opacity:0.5;cursor:not-allowed;' : ''"
              @click="confirm"
            >
              🛡️ {{ mode === 'deposit' ? '確認存入' : '確認取出' }}
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'transfer'" key="transfer" class="gift-tab-content">
          <div class="gift-compose-grid">
            <!-- 左欄：規則與餘額 -->
            <aside class="card-purple gift-rules-panel">
              <header class="gift-rules-header">
                <h2>贈禮規則</h2>
                <b>VIP {{ userInfo.vip }}</b>
              </header>

              <dl class="gift-rule-list">
                <div>
                  <dt>每日剩餘次數</dt>
                  <dd>{{ dailyRemaining }} / {{ dailyLimit }} 次</dd>
                </div>
                <div>
                  <dt>單次最高贈禮</dt>
                  <dd>{{ MAX_GIFT_AMOUNT.toLocaleString() }} 金幣</dd>
                </div>
                <div>
                  <dt>贈禮手續費</dt>
                  <dd>5%</dd>
                </div>
                <div>
                  <dt>申請有效期限</dt>
                  <dd>168 小時</dd>
                </div>
              </dl>

              <div class="gift-vault-balance">
                <span>可用保險箱餘額</span>
                <strong>{{ userInfo.vaultBalance.toLocaleString() }} <small>金幣</small></strong>
              </div>
            </aside>

            <!-- 右欄：贈禮表單 -->
            <section class="card-purple p-5">
              <div class="gift-form-heading">
                <h2>贈禮</h2>
                <p>申請送出後會保留贈禮原額；對方接受才完成，取消、拒絕或逾期皆全額退回。</p>
              </div>

              <div
                v-if="transferNotice"
                class="gift-form-notice"
                :class="transferNotice.type"
                role="status"
              >
                {{ transferNotice.text }}
              </div>

              <div class="grid gap-4">
                <div>
                  <span id="transfer-receiver-label" class="input-label">收禮玩家</span>
                  <div class="receiver-picker" role="group" aria-labelledby="transfer-receiver-label">
                    <div
                      v-if="selectedReceiver"
                      class="receiver-selected"
                    >
                      <span>{{ selectedReceiver.avatar }}</span>
                      <div>
                        <strong>{{ selectedReceiver.name }}</strong>
                        <small>帳號：{{ selectedReceiver.account }}</small>
                      </div>
                      <button type="button" aria-label="清除已選玩家" @click="selectedReceiver = null">×</button>
                    </div>
                    <div v-else class="receiver-placeholder">
                      尚未選擇
                    </div>
                    <button type="button" class="btn-outline-purple receiver-search-button" @click="showPlayerSearch = true">
                      搜尋
                    </button>
                  </div>
                </div>

              <div>
                <label class="input-label" for="transfer-amount">贈禮金額</label>
                <div class="gift-amount-control">
                  <div class="gift-amount-input">
                  <input
                    id="transfer-amount"
                    :value="transferAmount"
                    type="text"
                    inputmode="numeric"
                    class="input-field"
                    placeholder="0"
                    @input="onTransferAmountInput"
                  />
                    <span>金幣</span>
                  </div>
                  <div class="gift-amount-shortcuts" role="group" aria-label="快速選擇贈禮金額比例">
                    <button type="button" @click="setTransferPercent(0.25)">25%</button>
                    <button type="button" @click="setTransferPercent(0.5)">50%</button>
                    <button type="button" @click="setTransferPercent(0.75)">75%</button>
                    <button type="button" @click="setTransferPercent(1)">MAX</button>
                  </div>
                </div>
              </div>

              <dl class="gift-transfer-summary">
                <div>
                  <dt>預計扣款</dt>
                  <dd>{{ transferSummary.amount.toLocaleString() }}</dd>
                </div>
                <div>
                  <dt>手續費 5%</dt>
                  <dd class="fee">-{{ transferSummary.fee.toLocaleString() }}</dd>
                </div>
                <div>
                  <dt>對方實收</dt>
                  <dd class="received">{{ transferSummary.actualReceived.toLocaleString() }}</dd>
                </div>
              </dl>

                <button
                  class="btn-gold w-full justify-center text-lg py-3"
                  :disabled="!canConfirmTransfer"
                  :style="!canConfirmTransfer ? 'opacity:0.5;cursor:not-allowed;' : ''"
                  @click="confirmTransfer"
                >
                  送出
                </button>
              </div>
            </section>
          </div>

          <LobbyGiftRequestList
            :requests="requests"
            :current-player-id="userInfo.id"
            :now="giftNow"
            @accept="openGiftAction('accept', $event)"
            @reject="openGiftAction('reject', $event)"
            @cancel="openGiftAction('cancel', $event)"
          />
        </div>

        <div v-else key="exchange" class="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 flex flex-col gap-4">
          <!-- 左欄：匯率與餘額 -->
          <aside class="card-purple p-5 flex flex-col gap-4">
            <div class="rounded-xl p-4" style="background:rgba(0,0,0,0.25);">
              <div class="text-xs mb-1" style="color:var(--color-text-muted);">金幣</div>
              <div class="text-2xl font-black" style="color:var(--color-gold);">{{ userInfo.balance.toLocaleString() }}</div>
            </div>
            <div class="rounded-xl p-4" style="background:rgba(0,0,0,0.25);">
              <div class="text-xs mb-1" style="color:var(--color-text-muted);">銀幣</div>
              <div class="text-2xl font-black" style="color:#C0C7D1;">{{ userInfo.silverBalance.toLocaleString() }}</div>
            </div>
            <div class="rounded-xl p-4" style="background:rgba(168,85,247,0.12); border:1px solid var(--color-border);">
              <div class="text-xs mb-1" style="color:var(--color-text-muted);">兌換比值</div>
              <div class="text-lg font-black" style="color:var(--color-gold);">1 金幣 = 100 銀幣</div>
              <div class="text-xs mt-1" style="color:var(--color-text-muted);">金銀幣互換不收手續費。</div>
            </div>
          </aside>

          <!-- 右欄：兌換表單 -->
          <section class="card-purple p-5">
            <h2 class="text-lg font-black mb-1">金銀幣兌換</h2>
            <p class="text-sm mb-4" style="color:var(--color-text-muted);">選擇兌換方向後輸入金額，系統會依 1:100 比值立即試算。</p>

            <div class="tab-bar mb-4" role="tablist" aria-label="金銀幣兌換方向">
              <button
                class="tab-btn"
                :class="{ active: exchangeDirection === 'gold-to-silver' }"
                role="tab"
                :aria-selected="exchangeDirection === 'gold-to-silver'"
                @click="setExchangeDirection('gold-to-silver')"
              >
                金幣兌換
              </button>
              <button
                class="tab-btn"
                :class="{ active: exchangeDirection === 'silver-to-gold' }"
                role="tab"
                :aria-selected="exchangeDirection === 'silver-to-gold'"
                @click="setExchangeDirection('silver-to-gold')"
              >
                銀幣兌換
              </button>
            </div>

            <div
              v-if="exchangeNotice"
              class="mb-4 rounded-xl px-4 py-3 text-sm font-bold"
              :style="exchangeNotice.type === 'success'
                ? 'background:rgba(74,222,128,0.14); color:#86efac; border:1px solid rgba(74,222,128,0.3);'
                : 'background:rgba(248,113,113,0.14); color:#fca5a5; border:1px solid rgba(248,113,113,0.3);'"
            >
              {{ exchangeNotice.text }}
            </div>

            <div class="grid gap-4">
              <div>
                <label class="input-label" for="exchange-amount">
                  {{ exchangeDirection === 'gold-to-silver' ? '兌換金幣' : '兌換銀幣' }}
                </label>
                <div class="rounded-xl p-4" style="background:rgba(0,0,0,0.3); border:1px solid var(--color-border);">
                  <input
                    id="exchange-amount"
                    :value="exchangeAmount"
                    type="text"
                    inputmode="numeric"
                    class="w-full bg-transparent outline-none text-3xl font-black text-center mb-3"
                    :style="`color:${exchangeDirection === 'gold-to-silver' ? 'var(--color-gold)' : '#C0C7D1'};`"
                    placeholder="0"
                    @input="onExchangeAmountInput"
                  />
                  <input
                    :value="exchangeAmount"
                    type="range"
                    min="0"
                    :max="exchangeSourceBalance"
                    :step="exchangeStep"
                    class="w-full accent-[#F5C842]"
                    aria-label="兌換金額拉桿"
                    @input="onExchangeAmountInput"
                  />
                  <div class="grid grid-cols-5 gap-2 mt-3">
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setExchangePercent(0)">0%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setExchangePercent(0.25)">25%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setExchangePercent(0.5)">50%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setExchangePercent(0.75)">75%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(168,85,247,0.18); color:var(--color-gold); border:1px solid rgba(245,200,66,0.25);" @click="setExchangePercent(1)">MAX</button>
                  </div>
                </div>
                <p
                  v-if="exchangeDirection === 'silver-to-gold' && exchangeAmount > 0 && exchangeAmount % GOLD_TO_SILVER_RATE !== 0"
                  class="text-xs mt-2"
                  style="color:#fca5a5;"
                >
                  銀幣換金幣需以 100 銀幣為單位。
                </p>
              </div>

              <div class="grid sm:grid-cols-3 gap-3">
                <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.22);">
                  <div class="text-xs mb-1" style="color:var(--color-text-muted);">扣除</div>
                  <div class="font-black">
                    {{ exchangeSummary.fromAmount.toLocaleString() }}
                    {{ exchangeDirection === 'gold-to-silver' ? '金幣' : '銀幣' }}
                  </div>
                </div>
                <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.22);">
                  <div class="text-xs mb-1" style="color:var(--color-text-muted);">手續費</div>
                  <div class="font-black" style="color:#86efac;">0</div>
                </div>
                <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.22);">
                  <div class="text-xs mb-1" style="color:var(--color-text-muted);">獲得</div>
                  <div class="font-black" style="color:var(--color-gold);">
                    {{ exchangeSummary.toAmount.toLocaleString() }}
                    {{ exchangeDirection === 'gold-to-silver' ? '銀幣' : '金幣' }}
                  </div>
                </div>
              </div>

              <button
                class="btn-gold w-full justify-center text-lg py-3"
                style="border-radius:14px;"
                :disabled="!canConfirmExchange"
                :style="!canConfirmExchange ? 'opacity:0.5;cursor:not-allowed;' : ''"
                @click="confirmExchange"
              >
                確認兌換
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </template>

    <ClientOnly>
      <LobbyPlayerSearchModal
        :open="showPlayerSearch"
        :players="searchablePlayers"
        :friend-ids="friendIds"
        :current-player-id="userInfo.id"
        @select="selectReceiver"
        @close="showPlayerSearch = false"
      />

      <Teleport to="body">
        <Transition name="gift-dialog">
          <div
            v-if="pendingGiftAction"
            class="modal-overlay gift-dialog-overlay"
            role="presentation"
            @click.self="closeGiftActionDialog"
          >
            <div class="modal-box gift-dialog-box">
              <section
                ref="giftDialogRef"
                class="modal-inner gift-dialog-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="gift-action-title"
                aria-describedby="gift-action-description"
                tabindex="-1"
                @keydown="handleGiftDialogKeydown"
              >
                <button type="button" class="modal-close" aria-label="關閉贈禮確認視窗" @click="closeGiftActionDialog">×</button>
                <p class="gift-dialog-eyebrow">GIFT REQUEST</p>
                <h2 id="gift-action-title" class="modal-title">{{ giftActionTitle }}</h2>
                <div class="gift-dialog-player">
                  <span aria-hidden="true">
                    {{ pendingGiftAction.action === 'cancel' ? pendingGiftAction.request.receiver.avatar : pendingGiftAction.request.sender.avatar }}
                  </span>
                  <div>
                    <strong>
                      {{ pendingGiftAction.action === 'cancel' ? pendingGiftAction.request.receiver.name : pendingGiftAction.request.sender.name }}
                    </strong>
                    <small>{{ pendingGiftAction.request.amount.toLocaleString() }} 金幣</small>
                  </div>
                </div>
                <p id="gift-action-description" class="gift-dialog-description">{{ giftActionDescription }}</p>
                <div class="gift-dialog-actions">
                  <button ref="giftDialogBackRef" type="button" class="btn-outline-purple gift-dialog-back" @click="closeGiftActionDialog">返回</button>
                  <button
                    type="button"
                    class="btn-gold gift-dialog-confirm"
                    :class="{ danger: pendingGiftAction.action === 'reject' || pendingGiftAction.action === 'cancel' }"
                    @click="confirmGiftAction"
                  >
                    {{ giftActionConfirmLabel }}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active { transition: opacity 0.18s; }
.tab-fade-enter-from,
.tab-fade-leave-to { opacity: 0; }

.gift-tab-content {
  display: flex;
  width: 100%;
  max-width: 1180px;
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
}

.gift-compose-grid {
  display: grid;
  grid-template-columns: minmax(250px, 290px) minmax(0, 1fr);
  align-items: start;
  gap: 20px;
}

.gift-compose-grid > * { min-width: 0; }

.gift-rules-panel {
  padding: 20px;
}

.gift-rules-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.16);
}

.gift-rules-header h2,
.gift-form-heading h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 19px;
  font-weight: 900;
}

.gift-rules-header b {
  padding: 5px 10px;
  border: 1px solid rgba(245, 200, 66, 0.35);
  border-radius: 999px;
  color: var(--color-gold);
  background: rgba(245, 200, 66, 0.08);
  font-size: 10px;
}

.gift-rule-list {
  margin: 4px 0 0;
}

.gift-rule-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.09);
}

.gift-rule-list dt {
  color: var(--color-text-muted);
  font-size: 11px;
}

.gift-rule-list dd {
  margin: 0;
  color: var(--color-text);
  font-size: 11px;
  font-weight: 800;
  text-align: right;
}

.gift-vault-balance {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 17px;
}

.gift-vault-balance > span {
  color: var(--color-text-muted);
  font-size: 10px;
}

.gift-vault-balance strong {
  color: var(--color-gold);
  font-size: 22px;
  line-height: 1.2;
}

.gift-vault-balance small {
  color: var(--color-text-muted);
  font-size: 9px;
}

.gift-form-heading {
  margin-bottom: 18px;
}

.gift-form-heading p {
  margin: 5px 0 0;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.7;
}

.gift-form-notice {
  margin-bottom: 16px;
  padding: 11px 13px;
  border: 1px solid;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.gift-form-notice.success {
  border-color: rgba(74, 222, 128, 0.32);
  color: #86efac;
  background: rgba(74, 222, 128, 0.1);
}

.gift-form-notice.error {
  border-color: rgba(248, 113, 113, 0.32);
  color: #fca5a5;
  background: rgba(248, 113, 113, 0.1);
}

.receiver-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: 10px;
}

.receiver-placeholder,
.receiver-selected {
  min-height: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.07);
}

.receiver-placeholder {
  display: flex;
  align-items: center;
  padding: 0 14px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.receiver-selected {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 9px;
  padding: 7px 9px;
}

.receiver-selected > span {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.14);
  font-size: 18px;
}

.receiver-selected > div { display: flex; min-width: 0; flex-direction: column; }
.receiver-selected strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.receiver-selected small { overflow: hidden; color: var(--color-text-muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.receiver-selected > button { width: 24px; height: 24px; color: var(--color-text-muted); border-radius: 50%; font-size: 16px; }
.receiver-selected > button:hover { color: #fff; background: rgba(255, 255, 255, 0.08); }

.receiver-search-button {
  min-width: 92px;
  justify-content: center;
  padding: 0 20px;
  font-size: 12px;
}

.gift-amount-control {
  padding: 13px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.16);
}

.gift-amount-input {
  position: relative;
}

.gift-amount-input .input-field {
  padding-right: 58px;
  color: var(--color-gold);
  font-size: 20px;
  font-weight: 900;
  text-align: right;
}

.gift-amount-input > span {
  position: absolute;
  top: 50%;
  right: 14px;
  color: var(--color-text-muted);
  font-size: 10px;
  transform: translateY(-50%);
}

.gift-amount-shortcuts {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 9px;
}

.gift-amount-shortcuts button {
  min-width: 54px;
  min-height: 34px;
  padding: 7px 11px;
  border: 1px solid rgba(192, 132, 252, 0.22);
  border-radius: 7px;
  color: var(--color-text-muted);
  background: rgba(168, 85, 247, 0.07);
  font-size: 11px;
  font-weight: 700;
}

.gift-amount-shortcuts button:hover {
  border-color: rgba(192, 132, 252, 0.48);
  color: var(--color-text);
  background: rgba(168, 85, 247, 0.14);
}

.gift-transfer-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.14);
}

.gift-transfer-summary > div {
  padding: 12px 13px;
}

.gift-transfer-summary > div + div {
  border-left: 1px solid rgba(255, 255, 255, 0.11);
}

.gift-transfer-summary dt {
  margin-bottom: 3px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.gift-transfer-summary dd {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 900;
}

.gift-transfer-summary dd.fee { color: #fca5a5; }
.gift-transfer-summary dd.received { color: var(--color-gold); }

.gift-dialog-enter-active,
.gift-dialog-leave-active { transition: opacity .2s ease; }
.gift-dialog-enter-active .gift-dialog-box,
.gift-dialog-leave-active .gift-dialog-box { transition: transform .2s ease, opacity .2s ease; }
.gift-dialog-enter-from,
.gift-dialog-leave-to { opacity: 0; }
.gift-dialog-enter-from .gift-dialog-box,
.gift-dialog-leave-to .gift-dialog-box { opacity: 0; transform: scale(.94); }

.gift-dialog-overlay {
  z-index: 1090;
}

.gift-dialog-box {
  width: min(430px, 100%);
}

.gift-dialog-panel {
  padding: 28px 24px;
  outline: none;
  text-align: center;
}

.gift-dialog-eyebrow {
  margin: 0 0 4px;
  color: var(--color-gold);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.gift-dialog-panel .modal-title {
  margin-bottom: 18px;
}

.gift-dialog-player {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  text-align: left;
}

.gift-dialog-player > span {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 19px;
}

.gift-dialog-player > div { display: flex; flex-direction: column; }
.gift-dialog-player strong { color: #fff; font-size: 13px; }
.gift-dialog-player small { color: rgba(255, 255, 255, 0.7); font-size: 10px; }

.gift-dialog-description {
  margin: 14px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
  line-height: 1.7;
}

.gift-dialog-actions {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 10px;
  margin-top: 20px;
}

.gift-dialog-actions button {
  min-height: 43px;
  justify-content: center;
  padding: 10px 16px;
  font-size: 12px;
}

.gift-dialog-back {
  border-color: rgba(255, 255, 255, 0.62);
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.gift-dialog-panel .gift-dialog-confirm.danger {
  border-color: rgba(255, 255, 255, 0.8);
  color: #fff;
  background: linear-gradient(180deg, #fb7185, #be123c);
  box-shadow: 0 4px 16px rgba(136, 19, 55, 0.28);
}

@media(max-width:900px) {
  .gift-compose-grid { grid-template-columns: 1fr; }
}

@media(max-width:520px) {
  .receiver-picker { grid-template-columns: 1fr; }
  .receiver-search-button { min-height: 42px; }
  .gift-transfer-summary { grid-template-columns: 1fr; }
  .gift-transfer-summary > div + div {
    border-top: 1px solid rgba(255, 255, 255, 0.11);
    border-left: 0;
  }
  .gift-dialog-panel { padding: 26px 20px 22px; }
  .gift-dialog-actions { grid-template-columns: 1fr; }
}
</style>
