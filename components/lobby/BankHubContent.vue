<script setup lang="ts">
type BankTab = 'overview' | 'vault' | 'exchange' | 'gifts' | 'records'

const route = useRoute()
const router = useRouter()
const { isLoggedIn, openLogin } = useAppState()

const tabs: { key: BankTab; label: string }[] = [
  { key: 'overview', label: '錢包總覽' },
  { key: 'vault', label: '保險箱' },
  { key: 'exchange', label: '交換' },
  { key: 'gifts', label: '贈禮' },
  { key: 'records', label: '紀錄' },
]

const activeTab = ref<BankTab>('overview')

function normalizeTab(value: unknown): BankTab {
  if (value === 'transfer') return 'gifts'
  if (value === 'wallet') return 'overview'
  return tabs.some(tab => tab.key === value) ? value as BankTab : 'overview'
}

function applyQuery() {
  const tab = normalizeTab(route.query.tab)
  activeTab.value = tab
  if (route.query.tab !== tab) {
    router.replace({ path: '/lobby/vault', query: buildTabQuery(tab) })
  }
}

function selectTab(tab: BankTab) {
  router.replace({ path: '/lobby/vault', query: buildTabQuery(tab) })
}

function buildTabQuery(tab: BankTab) {
  const query: Record<string, string> = { tab }
  if (tab === 'gifts' && typeof route.query.receiverId === 'string') {
    query.receiverId = route.query.receiverId
  }
  return query
}

function openBankLogin() {
  openLogin(route.fullPath)
}

onMounted(applyQuery)
watch(() => route.query, applyQuery)
</script>

<template>
  <div class="lobby-page bank-hub-page px-4 py-5">
    <template v-if="!isLoggedIn">
      <div class="card-purple bank-guest-card">
        <div class="bank-guest-icon" aria-hidden="true">▣</div>
        <p class="bank-kicker">BANK CENTER</p>
        <h1>銀行</h1>
        <p class="bank-guest-copy">登入後即可使用錢包總覽、保險箱、交換與贈禮功能。</p>
        <button class="btn-gold w-full justify-center" @click="openBankLogin">立即登入 / 註冊</button>
      </div>
    </template>

    <template v-else>
      <header class="bank-hub-header">
        <div>
          <p class="bank-kicker">BANK CENTER</p>
          <h1 class="section-title">銀行</h1>
          <p class="bank-hub-subtitle">集中管理錢包、保險箱、交換、贈禮與交易紀錄</p>
        </div>
        <span class="bank-hub-status"><i aria-hidden="true" />本次工作階段 Mock</span>
      </header>

      <nav class="bank-hub-tabs" role="tablist" aria-label="銀行功能分頁">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="bank-hub-tab"
          :class="{ active: activeTab === tab.key }"
          role="tab"
          :aria-selected="activeTab === tab.key"
          :aria-controls="`bank-panel-${tab.key}`"
          @click="selectTab(tab.key)"
        >
          <strong>{{ tab.label }}</strong>
        </button>
      </nav>

      <main :id="`bank-panel-${activeTab}`" class="bank-hub-panel" role="tabpanel" :aria-label="tabs.find(tab => tab.key === activeTab)?.label">
        <Transition name="bank-panel-fade" mode="out-in">
          <LobbyWalletOverviewPanel v-if="activeTab === 'overview'" key="overview" />
          <LobbyVaultContent v-else-if="activeTab === 'vault'" key="vault" embedded initial-tab="vault" />
          <LobbyVaultContent v-else-if="activeTab === 'exchange'" key="exchange" embedded initial-tab="exchange" />
          <LobbyVaultContent v-else-if="activeTab === 'gifts'" key="gifts" embedded initial-tab="transfer" />
          <LobbyTransactionRecords v-else key="records" />
        </Transition>
      </main>
    </template>
  </div>
</template>

<style scoped>
.bank-hub-page {
  width: min(100%, 1240px);
  margin: 0 auto;
}

.bank-kicker {
  margin: 0 0 5px;
  color: var(--color-gold);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .2em;
}

.bank-guest-card {
  width: min(100%, 430px);
  margin: 38px auto 0;
  padding: 34px 30px;
  text-align: center;
}

.bank-guest-icon {
  display: grid;
  width: 66px;
  height: 66px;
  margin: 0 auto 16px;
  place-items: center;
  border: 1px solid rgba(245, 200, 66, .38);
  border-radius: 21px;
  color: var(--color-gold);
  background: linear-gradient(145deg, rgba(245, 200, 66, .18), rgba(168, 85, 247, .16));
  box-shadow: 0 12px 34px rgba(168, 85, 247, .18);
  font-size: 30px;
}

.bank-guest-card h1 {
  margin: 0 0 9px;
  font-size: 24px;
  font-weight: 900;
}

.bank-guest-copy {
  margin: 0 0 22px;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.7;
}

.bank-hub-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.bank-hub-header h1 { margin: 0; }

.bank-hub-subtitle {
  margin: 7px 0 0;
  color: var(--color-text-muted);
  font-size: 11px;
}

.bank-hub-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border: 1px solid rgba(168, 85, 247, .25);
  border-radius: 999px;
  color: var(--color-text-muted);
  background: rgba(26, 10, 46, .48);
  font-size: 10px;
  white-space: nowrap;
}

.bank-hub-status i {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #86efac;
  box-shadow: 0 0 10px rgba(134, 239, 172, .72);
}

.bank-hub-tabs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 7px;
  padding: 7px;
  margin-bottom: 22px;
  border: 1px solid rgba(168, 85, 247, .24);
  border-radius: 18px;
  background: rgba(15, 0, 32, .72);
  box-shadow: 0 13px 32px rgba(5, 0, 18, .22), inset 0 1px rgba(255, 255, 255, .04);
}

.bank-hub-tab {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 11px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--color-text-muted);
  background: transparent;
  text-align: center;
  transition: border-color .18s ease, color .18s ease, background .18s ease, transform .18s ease;
}

.bank-hub-tab:hover {
  border-color: rgba(192, 132, 252, .28);
  color: var(--color-text);
  background: rgba(168, 85, 247, .1);
  transform: translateY(-1px);
}

.bank-hub-tab.active {
  border-color: rgba(245, 200, 66, .6);
  color: #180c2d;
  background: linear-gradient(135deg, #f5c842, #f59e0b);
  box-shadow: 0 7px 20px rgba(245, 200, 66, .18);
}

.bank-hub-tab strong {
  font-size: 15px;
  font-weight: 900;
  white-space: nowrap;
}

.bank-hub-panel { min-width: 0; }

.bank-panel-fade-enter-active,
.bank-panel-fade-leave-active { transition: opacity .16s ease, transform .16s ease; }
.bank-panel-fade-enter-from { opacity: 0; transform: translateY(5px); }
.bank-panel-fade-leave-to { opacity: 0; transform: translateY(-3px); }

@media (max-width: 980px) {
  .bank-hub-tabs { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 620px) {
  .bank-hub-page { padding-top: 14px; }
  .bank-hub-header { align-items: flex-start; flex-direction: column; gap: 10px; }
  .bank-hub-status { align-self: flex-start; }
  .bank-hub-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; padding: 6px; }
  .bank-hub-tab { padding: 10px 9px; }
  .bank-hub-tab:last-child { grid-column: 1 / -1; }
}
</style>
