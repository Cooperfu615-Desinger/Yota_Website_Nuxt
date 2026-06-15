<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin, depositToVault, withdrawFromVault } = useAppState()

const mode = ref<'deposit' | 'withdraw'>('deposit')
const amount = ref(0)

const maxAmount = computed(() => mode.value === 'deposit' ? userInfo.value.balance : userInfo.value.vaultBalance)

watch([mode, maxAmount], () => {
  if (amount.value > maxAmount.value) amount.value = maxAmount.value
})

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
</script>

<template>
  <div class="lobby-page px-4 py-5">
    <!-- 未登入 -->
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="text-5xl mb-4" aria-hidden="true">🔐</div>
        <h1 class="text-xl font-black mb-2">保險箱</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可使用保險箱存放金幣</p>
        <button class="btn-gold w-full justify-center" @click="openLogin">立即登入 / 註冊</button>
      </div>
    </template>

    <!-- 已登入 -->
    <template v-else>
      <h1 class="section-title mb-4">保險箱</h1>
      <div class="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start flex flex-col gap-4">
        <!-- 左欄：餘額 -->
        <div class="card-purple p-5">
          <div class="rounded-xl p-4 mb-1" style="background:rgba(0,0,0,0.25);">
            <div class="text-sm mb-1" style="color:var(--color-text-muted);">錢包金幣 (可用)</div>
            <div class="text-3xl font-black" style="color:var(--color-gold);">{{ userInfo.balance.toLocaleString() }}</div>
          </div>
          <div class="text-center text-2xl my-1" style="color:var(--color-text-muted);">↓</div>
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

          <h2 class="text-lg font-black text-center mb-1">{{ mode === 'deposit' ? '存入保險箱' : '取出至錢包' }}</h2>
          <p class="text-sm text-center mb-4" style="color:var(--color-text-muted);">
            {{ mode === 'deposit' ? '請輸入欲從錢包轉入保險箱的金額' : '請輸入欲從保險箱轉回錢包的金額' }}
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
    </template>
  </div>
</template>
