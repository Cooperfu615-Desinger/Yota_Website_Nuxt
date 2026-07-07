<script setup lang="ts">
import { resolveWalletBalances, type WalletSource } from '~/utils/wallets'

const props = withDefaults(defineProps<{
  user: WalletSource
  variant?: 'cards' | 'compact'
}>(), {
  variant: 'cards',
})

const wallets = computed(() => resolveWalletBalances(props.user))
</script>

<template>
  <div class="wallet-balances" :class="variant" aria-label="錢包餘額">
    <div
      v-for="wallet in wallets"
      :key="wallet.key"
      class="wallet-balance-item"
      :class="`wallet-${wallet.key}`"
    >
      <div class="wallet-label">
        <span class="wallet-dot" :style="{ background: wallet.color }" aria-hidden="true" />
        <span>{{ variant === 'compact' ? wallet.shortLabel : wallet.label }}</span>
      </div>
      <div class="wallet-amount" :style="{ color: wallet.color }">
        {{ wallet.balance.toLocaleString() }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.wallet-balances {
  width: 100%;
  min-width: 0;
}

.wallet-balances.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
  gap: 8px;
}

.wallet-balances.compact {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wallet-balance-item {
  min-width: 0;
}

.cards .wallet-balance-item {
  padding: 10px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.compact .wallet-balance-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  line-height: 1.05;
}

.wallet-label {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.cards .wallet-label {
  margin-bottom: 5px;
}

.compact .wallet-label {
  gap: 3px;
  font-size: 9px;
}

.wallet-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
  box-shadow: 0 0 8px currentColor;
}

.wallet-amount {
  min-width: 0;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact .wallet-amount {
  max-width: 86px;
  font-size: 9px;
  font-weight: 800;
}
</style>
