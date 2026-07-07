<script setup lang="ts">
import { calculateVaultTransfer, canSubmitVaultTransfer } from '~/utils/vaultTransfer'
import {
  calculateWalletExchange,
  canSubmitWalletExchange,
  GOLD_TO_SILVER_RATE,
  type WalletExchangeDirection,
} from '~/utils/walletExchange'

type VaultTab = 'vault' | 'transfer' | 'exchange'
type NoticeType = 'success' | 'error'

const route = useRoute()
const {
  isLoggedIn,
  userInfo,
  openLogin,
  depositToVault,
  withdrawFromVault,
  transferFromVault,
  exchangeWalletCurrency,
} = useAppState()

const activeTab = ref<VaultTab>('vault')
const mode = ref<'deposit' | 'withdraw'>('deposit')
const amount = ref(0)
const transferReceiverId = ref('')
const transferAmount = ref(0)
const transferNotice = ref<{ type: NoticeType; text: string } | null>(null)
const exchangeDirection = ref<WalletExchangeDirection>('gold-to-silver')
const exchangeAmount = ref(0)
const exchangeNotice = ref<{ type: NoticeType; text: string } | null>(null)
let transferNoticeTimer: ReturnType<typeof setTimeout> | null = null
let exchangeNoticeTimer: ReturnType<typeof setTimeout> | null = null

const maxAmount = computed(() => mode.value === 'deposit' ? userInfo.value.balance : userInfo.value.vaultBalance)
const transferSummary = computed(() => calculateVaultTransfer(transferAmount.value))
const canConfirmTransfer = computed(() =>
  canSubmitVaultTransfer(transferReceiverId.value, transferAmount.value, userInfo.value.vaultBalance)
)
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

watch(() => userInfo.value.vaultBalance, (vaultBalance) => {
  if (transferAmount.value > vaultBalance) transferAmount.value = vaultBalance
})

watch([exchangeDirection, exchangeSourceBalance], () => {
  if (exchangeAmount.value > exchangeSourceBalance.value) exchangeAmount.value = exchangeSourceBalance.value
})

onMounted(() => {
  applyRouteQuery()
})

watch(() => route.query, () => {
  applyRouteQuery()
})

onUnmounted(() => {
  if (transferNoticeTimer) clearTimeout(transferNoticeTimer)
  if (exchangeNoticeTimer) clearTimeout(exchangeNoticeTimer)
})

function applyRouteQuery() {
  if (route.query.tab === 'transfer') activeTab.value = 'transfer'
  if (route.query.tab === 'exchange') activeTab.value = 'exchange'
  if (typeof route.query.receiverId === 'string') {
    transferReceiverId.value = route.query.receiverId
  }
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
  if (v > userInfo.value.vaultBalance) v = userInfo.value.vaultBalance
  transferAmount.value = v
}

function setTransferPercent(percent: number) {
  transferAmount.value = Math.floor(userInfo.value.vaultBalance * percent)
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
  const receiverId = transferReceiverId.value.trim()
  if (!receiverId) {
    showTransferNotice('error', '請先輸入接收者 ID。')
    return
  }
  if (transferAmount.value <= 0) {
    showTransferNotice('error', '請輸入贈禮金額。')
    return
  }

  const result = transferFromVault(receiverId, transferAmount.value)
  if (!result) {
    showTransferNotice('error', '保險箱餘額不足，請先存入金幣。')
    return
  }

  showTransferNotice(
    'success',
    `已贈禮 ${result.amount.toLocaleString()} 點給 ${result.receiverId}，對方實收 ${result.actualReceived.toLocaleString()} 點。`
  )
  transferReceiverId.value = ''
  transferAmount.value = 0
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
  <div class="lobby-page px-4 py-5">
    <!-- 未登入 -->
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="text-5xl mb-4" aria-hidden="true">🔐</div>
        <h1 class="text-xl font-black mb-2">保險箱 / 贈禮</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可使用保險箱存放金幣，並將點數贈禮給其他會員</p>
        <button class="btn-gold w-full justify-center" @click="openLogin">立即登入 / 註冊</button>
      </div>
    </template>

    <!-- 已登入 -->
    <template v-else>
      <h1 class="section-title mb-4">保險箱 / 贈禮</h1>

      <div class="tab-bar mb-4 max-w-lg" role="tablist" aria-label="保險箱、贈禮與兌換">
        <button class="tab-btn" :class="{ active: activeTab === 'vault' }" role="tab" :aria-selected="activeTab === 'vault'" @click="activeTab = 'vault'">保險箱</button>
        <button class="tab-btn" :class="{ active: activeTab === 'transfer' }" role="tab" :aria-selected="activeTab === 'transfer'" @click="activeTab = 'transfer'">贈禮</button>
        <button class="tab-btn" :class="{ active: activeTab === 'exchange' }" role="tab" :aria-selected="activeTab === 'exchange'" @click="activeTab = 'exchange'">兌換</button>
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
            <div class="tab-bar mb-4" role="tablist" aria-label="保險箱操作">
              <button class="tab-btn" :class="{ active: mode === 'deposit' }" role="tab" :aria-selected="mode === 'deposit'" @click="mode = 'deposit'">存入</button>
              <button class="tab-btn" :class="{ active: mode === 'withdraw' }" role="tab" :aria-selected="mode === 'withdraw'" @click="mode = 'withdraw'">取出</button>
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

        <div v-else-if="activeTab === 'transfer'" key="transfer" class="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 flex flex-col gap-4">
          <!-- 左欄：規則與餘額 -->
          <aside class="card-purple p-5 flex flex-col gap-4">
            <div class="flex items-center gap-3 pb-4" style="border-bottom:1px solid rgba(255,255,255,0.12);">
              <div class="w-11 h-11 rounded-full flex items-center justify-center text-lg font-black" style="background:linear-gradient(135deg,var(--color-purple-mid),var(--color-gold)); color:#fff;">
                VIP
              </div>
              <div>
                <div class="font-black" style="color:var(--color-gold);">VIP {{ userInfo.vip }}</div>
                <div class="text-xs" style="color:var(--color-text-muted);">保險箱贈禮權限</div>
              </div>
            </div>

            <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.25);">
              <div class="text-xs mb-1" style="color:var(--color-text-muted);">每日贈禮次數</div>
              <div class="font-black">剩餘 5 <span class="text-xs font-normal" style="color:var(--color-text-muted);">/ 10 次</span></div>
            </div>
            <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.25);">
              <div class="text-xs mb-1" style="color:var(--color-text-muted);">單次最高贈禮</div>
              <div class="font-black" style="color:var(--color-gold);">1,000,000 點</div>
            </div>
            <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.25);">
              <div class="text-xs mb-1" style="color:var(--color-text-muted);">目前手續費率</div>
              <div class="font-black" style="color:#f87171;">5% <span class="text-xs font-normal" style="color:var(--color-text-muted);">VIP 6 可降至 3%</span></div>
            </div>

            <div class="mt-auto pt-4" style="border-top:1px solid rgba(255,255,255,0.12);">
              <div class="text-xs mb-1" style="color:var(--color-text-muted);">保險箱餘額</div>
              <div class="text-2xl font-black" style="color:var(--color-gold);">{{ userInfo.vaultBalance.toLocaleString() }}</div>
            </div>
          </aside>

          <!-- 右欄：贈禮表單 -->
          <section class="card-purple p-5">
            <h2 class="text-lg font-black mb-1">會員贈禮</h2>
            <p class="text-sm mb-4" style="color:var(--color-text-muted);">贈禮金額會從保險箱扣除，系統會自動計算手續費與對方實收點數。</p>

            <div
              v-if="transferNotice"
              class="mb-4 rounded-xl px-4 py-3 text-sm font-bold"
              :style="transferNotice.type === 'success'
                ? 'background:rgba(74,222,128,0.14); color:#86efac; border:1px solid rgba(74,222,128,0.3);'
                : 'background:rgba(248,113,113,0.14); color:#fca5a5; border:1px solid rgba(248,113,113,0.3);'"
            >
              {{ transferNotice.text }}
            </div>

            <div class="grid gap-4">
              <div>
                <label class="input-label" for="transfer-receiver">接收者 ID</label>
                <input
                  id="transfer-receiver"
                  v-model="transferReceiverId"
                  type="text"
                  class="input-field"
                  placeholder="請輸入玩家 ID，例如 P10002"
                  autocomplete="off"
                />
              </div>

              <div>
                <label class="input-label" for="transfer-amount">贈禮金額</label>
                <div class="rounded-xl p-4" style="background:rgba(0,0,0,0.3); border:1px solid var(--color-border);">
                  <input
                    id="transfer-amount"
                    :value="transferAmount"
                    type="text"
                    inputmode="numeric"
                    class="w-full bg-transparent outline-none text-3xl font-black text-center mb-3"
                    style="color:var(--color-gold);"
                    placeholder="0"
                    @input="onTransferAmountInput"
                  />
                  <input
                    :value="transferAmount"
                    type="range"
                    min="0"
                    :max="userInfo.vaultBalance"
                    step="1000"
                    class="w-full accent-[#F5C842]"
                    aria-label="贈禮金額拉桿"
                    @input="onTransferAmountInput"
                  />
                  <div class="grid grid-cols-5 gap-2 mt-3">
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setTransferPercent(0)">0%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setTransferPercent(0.25)">25%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setTransferPercent(0.5)">50%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(255,255,255,0.07); color:var(--color-text-muted);" @click="setTransferPercent(0.75)">75%</button>
                    <button type="button" class="text-xs font-bold rounded-lg py-2" style="background:rgba(168,85,247,0.18); color:var(--color-gold); border:1px solid rgba(245,200,66,0.25);" @click="setTransferPercent(1)">MAX</button>
                  </div>
                </div>
              </div>

              <div class="grid sm:grid-cols-3 gap-3">
                <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.22);">
                  <div class="text-xs mb-1" style="color:var(--color-text-muted);">預計扣款</div>
                  <div class="font-black">{{ transferSummary.amount.toLocaleString() }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.22);">
                  <div class="text-xs mb-1" style="color:var(--color-text-muted);">手續費 5%</div>
                  <div class="font-black" style="color:#f87171;">-{{ transferSummary.fee.toLocaleString() }}</div>
                </div>
                <div class="rounded-xl p-3" style="background:rgba(0,0,0,0.22);">
                  <div class="text-xs mb-1" style="color:var(--color-text-muted);">對方實收</div>
                  <div class="font-black" style="color:var(--color-gold);">{{ transferSummary.actualReceived.toLocaleString() }}</div>
                </div>
              </div>

              <button
                class="btn-gold w-full justify-center text-lg py-3"
                style="border-radius:14px;"
                :disabled="!canConfirmTransfer"
                :style="!canConfirmTransfer ? 'opacity:0.5;cursor:not-allowed;' : ''"
                @click="confirmTransfer"
              >
                確認贈禮
              </button>
            </div>
          </section>
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
  </div>
</template>

<style scoped>
.tab-fade-enter-active,
.tab-fade-leave-active { transition: opacity 0.18s; }
.tab-fade-enter-from,
.tab-fade-leave-to { opacity: 0; }
</style>
