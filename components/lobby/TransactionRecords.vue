<script setup lang="ts">
import type { FinancialTransactionStatus, FinancialTransactionType } from '~/composables/useFinancialState'

withDefaults(defineProps<{ hideHeader?: boolean }>(), { hideHeader: false })

type TypeFilter = 'all' | FinancialTransactionType
type StatusFilter = 'all' | FinancialTransactionStatus
const { transactions } = useFinancialState()
const typeFilter = ref<TypeFilter>('all')
const statusFilter = ref<StatusFilter>('all')
const typeOptions: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: '全部類型' }, { key: 'deposit', label: '儲值' }, { key: 'vault', label: '保險箱' },
  { key: 'gift', label: '贈禮' }, { key: 'exchange', label: '兌換' }, { key: 'reward', label: '獎勵' },
  { key: 'spend', label: '消費' },
]
const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部狀態' }, { key: 'success', label: '成功' }, { key: 'processing', label: '處理中' }, { key: 'failed', label: '失敗' },
]
const visibleTransactions = computed(() => transactions.value.filter(item =>
  (typeFilter.value === 'all' || item.type === typeFilter.value) &&
  (statusFilter.value === 'all' || item.status === statusFilter.value)
))
const statusLabel = { success: '成功', processing: '處理中', failed: '失敗' }
const walletLabel = { gold: '金幣', silver: '銀幣', bronze: '銅幣' }
</script>

<template>
  <section class="records-wrap">
    <header v-if="!hideHeader" class="records-header"><div><p>TRANSACTION LOG</p><h2>交易紀錄</h2></div><span>重新整理後回到 Mock 初始資料</span></header>
    <div class="records-filters"><select v-model="typeFilter" class="input-field" aria-label="交易類型"><option v-for="option in typeOptions" :key="option.key" :value="option.key">{{ option.label }}</option></select><select v-model="statusFilter" class="input-field" aria-label="交易狀態"><option v-for="option in statusOptions" :key="option.key" :value="option.key">{{ option.label }}</option></select></div>
    <div v-if="visibleTransactions.length" class="records-list">
      <article v-for="item in visibleTransactions" :key="item.id" class="record-card">
        <div class="record-icon" :class="`type-${item.type}`">{{ item.type === 'deposit' ? '儲' : item.type === 'vault' ? '庫' : item.type === 'gift' ? '禮' : item.type === 'exchange' ? '換' : item.type === 'spend' ? '支' : '獎' }}</div>
        <div class="record-main"><strong>{{ item.title }}</strong><span>{{ item.detail || item.id }}</span><small>{{ item.createdAt }}・{{ item.id }}</small></div>
        <div class="record-value"><strong :class="{ positive: item.amount > 0, negative: item.amount < 0 }">{{ item.amount > 0 ? '+' : '' }}{{ item.amount.toLocaleString() }}</strong><small>{{ walletLabel[item.wallet] }}</small></div>
        <span class="record-status" :class="`status-${item.status}`">{{ statusLabel[item.status] }}</span>
      </article>
    </div>
    <div v-else class="records-empty">目前沒有符合條件的交易紀錄</div>
  </section>
</template>

<style scoped>
.records-wrap{padding:4px 0 26px}.records-header{display:flex;align-items:end;justify-content:space-between;gap:14px;margin-bottom:16px}.records-header p{margin:0 0 3px;color:var(--color-gold);font-size:10px;font-weight:900;letter-spacing:.17em}.records-header h2{margin:0;font-size:23px}.records-header>span{color:var(--color-text-muted);font-size:10px}.records-filters{display:grid;grid-template-columns:180px 180px;gap:9px;margin-bottom:14px}.records-filters select{font-size:12px}.records-list{display:grid;gap:9px}.record-card{display:grid;grid-template-columns:42px minmax(0,1fr) auto auto;align-items:center;gap:12px;padding:14px;border:1px solid var(--color-border);border-radius:15px;background:rgba(26,10,46,.72)}.record-icon{display:grid;width:40px;height:40px;place-items:center;border-radius:12px;color:#fff;background:rgba(168,85,247,.25);font-size:12px;font-weight:900}.type-deposit{background:rgba(74,222,128,.2);color:#86efac}.type-gift{background:rgba(244,114,182,.2);color:#f9a8d4}.type-exchange{background:rgba(96,165,250,.2);color:#93c5fd}.type-spend{background:rgba(248,113,113,.18);color:#fca5a5}.record-main{display:flex;min-width:0;flex-direction:column;gap:2px}.record-main strong{font-size:13px}.record-main span,.record-main small{overflow:hidden;color:var(--color-text-muted);font-size:10px;text-overflow:ellipsis;white-space:nowrap}.record-value{text-align:right}.record-value strong{display:block;font-size:14px}.record-value small{color:var(--color-text-muted);font-size:9px}.record-value .positive{color:#86efac}.record-value .negative{color:#fca5a5}.record-status{padding:5px 8px;border-radius:999px;font-size:9px;font-weight:900}.status-success{color:#86efac;background:rgba(74,222,128,.12)}.status-processing{color:#fde68a;background:rgba(245,200,66,.12)}.status-failed{color:#fca5a5;background:rgba(248,113,113,.12)}.records-empty{padding:50px 20px;border:1px dashed var(--color-border);border-radius:16px;color:var(--color-text-muted);text-align:center;font-size:12px}@media(max-width:640px){.records-header{align-items:flex-start;flex-direction:column}.records-filters{grid-template-columns:1fr 1fr}.record-card{grid-template-columns:38px minmax(0,1fr) auto}.record-status{grid-column:2/4;justify-self:start}.record-main small{display:none}}
</style>
