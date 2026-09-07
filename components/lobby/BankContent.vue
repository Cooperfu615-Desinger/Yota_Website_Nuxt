<script setup lang="ts">
type BankTab = 'deposit' | 'offers'
const route = useRoute()
const router = useRouter()
const { isLoggedIn, openLogin } = useAppState()
const tabs: { key: BankTab; label: string; icon: string }[] = [
  { key: 'deposit', label: '儲值', icon: '＋' }, { key: 'offers', label: '優惠', icon: '％' },
]
const activeTab = ref<BankTab>('deposit')
function applyQuery() {
  const tab = route.query.tab
  if (tab === 'vault' || tab === 'transfer') {
    const query = tab === 'transfer' && typeof route.query.receiverId === 'string'
      ? { tab, receiverId: route.query.receiverId }
      : { tab }
    router.replace({ path: '/lobby/vault', query })
    return
  }
  if (tab === 'exchange') {
    router.replace('/lobby/exchange')
    return
  }
  if (tab === 'records') {
    router.replace('/lobby/transactions')
    return
  }
  activeTab.value = tab === 'offers' ? 'offers' : 'deposit'
}
function selectTab(tab: BankTab) { activeTab.value = tab; router.replace({ query: { ...route.query, tab } }) }
onMounted(applyQuery)
watch(() => route.query.tab, applyQuery)
</script>

<template>
  <div class="lobby-page bank-page px-4 py-5">
    <template v-if="!isLoggedIn"><div class="card-purple p-8 text-center max-w-sm mx-auto mt-8"><div class="text-5xl mb-4">🏦</div><h1 class="text-xl font-black mb-2">儲值</h1><p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可使用官網儲值渠道並查看專屬優惠</p><button class="btn-gold w-full justify-center" @click="openLogin(route.fullPath)">立即登入 / 註冊</button></div></template>
    <template v-else>
      <h1 class="section-title mb-4">儲值</h1>
      <div class="bank-tabs" role="tablist" aria-label="銀行功能"><button v-for="tab in tabs" :key="tab.key" class="bank-tab" :class="{ active: activeTab === tab.key }" role="tab" :aria-selected="activeTab === tab.key" @click="selectTab(tab.key)"><span>{{ tab.icon }}</span>{{ tab.label }}</button></div>
      <SharedDepositContent v-if="activeTab === 'deposit'" embedded :show-activity-tab="false" />
      <PromoCodePanel v-else />
    </template>
  </div>
</template>

<style scoped>
.bank-page{max-width:1180px;margin:0 auto}.bank-tabs{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;padding:7px;margin-bottom:20px;border:1px solid var(--color-border);border-radius:17px;background:rgba(15,0,32,.64)}.bank-tab{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 7px;border-radius:11px;color:var(--color-text-muted);font-size:11px;font-weight:800}.bank-tab span{display:grid;width:24px;height:24px;place-items:center;border-radius:8px;background:rgba(168,85,247,.12);font-size:9px}.bank-tab.active{color:#170827;background:linear-gradient(135deg,#f5c842,#fbbf24);box-shadow:0 5px 18px rgba(245,200,66,.18)}.bank-tab.active span{background:rgba(15,0,32,.12)}
</style>
