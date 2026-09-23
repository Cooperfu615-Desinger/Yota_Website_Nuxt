<script setup lang="ts">
const { userInfo } = useAppState()

const wallets = computed(() => [
  { key: 'gold', label: '金幣', note: '主要遊戲錢包', amount: userInfo.value.balance, tone: 'gold', icon: '金' },
  { key: 'silver', label: '銀幣', note: '可用於交換', amount: userInfo.value.silverBalance, tone: 'silver', icon: '銀' },
  { key: 'bronze', label: '銅幣', note: '第三種遊戲錢包', amount: userInfo.value.bronzeBalance, tone: 'bronze', icon: '銅' },
  { key: 'vault', label: '保險箱', note: '已保管金幣', amount: userInfo.value.vaultBalance, tone: 'vault', icon: '庫' },
])

const rewardConditions = [
  { title: '新手登入獎勵', amount: '20,000 金幣', status: '已完成', progress: 100, tone: 'complete' },
  { title: '每日登入獎勵', amount: '10,000 金幣', status: '進行中', progress: 62, tone: 'active' },
  { title: '儲值優惠獎勵', amount: '5,000 金幣', status: '待啟用', progress: 0, tone: 'queued' },
]
</script>

<template>
  <section class="wallet-overview">
    <header class="wallet-overview-heading">
      <div>
        <p class="wallet-kicker">WALLET OVERVIEW</p>
        <h2>錢包總覽</h2>
        <p>快速查看目前各錢包與保險箱的可用餘額。</p>
      </div>
      <span class="wallet-session-badge"><i aria-hidden="true" />即時 Mock 餘額</span>
    </header>

    <div class="wallet-balance-grid">
      <article v-for="wallet in wallets" :key="wallet.key" class="wallet-balance-card" :class="`tone-${wallet.tone}`">
        <div class="wallet-balance-topline">
          <span class="wallet-balance-icon" aria-hidden="true">{{ wallet.icon }}</span>
          <span>{{ wallet.label }}</span>
        </div>
        <strong>{{ wallet.amount.toLocaleString() }}</strong>
        <small>{{ wallet.note }}</small>
      </article>
    </div>

    <div class="wallet-overview-grid">
      <section class="card-purple wallet-exchange-card">
        <div class="wallet-section-heading">
          <div>
            <p class="wallet-kicker">EXCHANGE STATUS</p>
            <h3>銀幣交換資訊</h3>
          </div>
          <span class="wallet-rate-badge">1 金幣 = 100 銀幣</span>
        </div>
        <div class="wallet-metric-grid">
          <div>
            <span>目前可交換銀幣</span>
            <strong>{{ userInfo.silverBalance.toLocaleString() }}</strong>
          </div>
          <div>
            <span>交換手續費</span>
            <strong class="positive">0</strong>
          </div>
        </div>
        <p class="wallet-helper">交換頁會依目前 WEB 既有規則試算，切換分頁不會改變餘額。</p>
        <NuxtLink class="wallet-action-link" :to="{ path: '/lobby/vault', query: { tab: 'exchange' } }">前往交換 <span aria-hidden="true">→</span></NuxtLink>
      </section>

      <section class="card-purple wallet-vault-card">
        <div class="wallet-section-heading">
          <div>
            <p class="wallet-kicker">VAULT ACCESS</p>
            <h3>保險箱使用狀態</h3>
          </div>
          <span class="wallet-vault-symbol" aria-hidden="true">▣</span>
        </div>
        <div class="wallet-vault-stat">
          <span>目前保管金幣</span>
          <strong>{{ userInfo.vaultBalance.toLocaleString() }}</strong>
        </div>
        <p class="wallet-helper">可將金幣存入保險箱，並從贈禮分頁發起贈禮申請。</p>
        <div class="wallet-action-row">
          <NuxtLink class="wallet-action-link" :to="{ path: '/lobby/vault', query: { tab: 'vault' } }">管理保險箱 <span aria-hidden="true">→</span></NuxtLink>
          <NuxtLink class="wallet-action-link secondary" :to="{ path: '/lobby/vault', query: { tab: 'gifts' } }">前往贈禮 <span aria-hidden="true">→</span></NuxtLink>
        </div>
      </section>
    </div>

    <section class="card-purple wallet-conditions-card">
      <header class="wallet-section-heading">
        <div>
          <p class="wallet-kicker">REWARD CONDITIONS</p>
          <h3>權益與進度</h3>
        </div>
        <span class="wallet-muted-label">展示資料</span>
      </header>
      <div class="wallet-condition-list">
        <article v-for="condition in rewardConditions" :key="condition.title" class="wallet-condition-row">
          <div class="wallet-condition-marker" :class="`tone-${condition.tone}`" aria-hidden="true">{{ condition.tone === 'complete' ? '✓' : condition.tone === 'active' ? '◌' : '·' }}</div>
          <div class="wallet-condition-main">
            <div class="wallet-condition-title"><strong>{{ condition.title }}</strong><span>{{ condition.amount }}</span></div>
            <div class="wallet-condition-progress"><i :style="{ width: `${condition.progress}%` }" /></div>
          </div>
          <span class="wallet-condition-status" :class="`tone-${condition.tone}`">{{ condition.status }}</span>
        </article>
      </div>
    </section>
  </section>
</template>

<style scoped>
.wallet-overview { display: flex; flex-direction: column; gap: 18px; }
.wallet-overview-heading,
.wallet-section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
.wallet-overview-heading h2,
.wallet-section-heading h3 { margin: 0; color: var(--color-text); font-weight: 900; }
.wallet-overview-heading h2 { font-size: 23px; }
.wallet-overview-heading > div > p:last-child { margin: 6px 0 0; color: var(--color-text-muted); font-size: 11px; }
.wallet-kicker { margin: 0 0 4px; color: var(--color-gold); font-size: 9px; font-weight: 900; letter-spacing: .18em; }
.wallet-session-badge,
.wallet-muted-label { color: var(--color-text-muted); font-size: 10px; }
.wallet-session-badge { display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; border: 1px solid rgba(168,85,247,.24); border-radius: 999px; background: rgba(26,10,46,.48); white-space: nowrap; }
.wallet-session-badge i { width: 7px; height: 7px; border-radius: 50%; background: #86efac; box-shadow: 0 0 9px rgba(134,239,172,.75); }
.wallet-balance-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 11px; }
.wallet-balance-card { position: relative; overflow: hidden; min-height: 142px; padding: 17px; border: 1px solid rgba(168,85,247,.24); border-radius: 17px; background: linear-gradient(145deg, rgba(26,10,46,.9), rgba(19,6,37,.72)); box-shadow: inset 0 1px rgba(255,255,255,.06); }
.wallet-balance-card::after { position: absolute; width: 105px; height: 105px; right: -40px; bottom: -55px; border-radius: 50%; background: currentColor; content: ''; opacity: .08; }
.wallet-balance-card.tone-gold { color: var(--color-gold); border-color: rgba(245,200,66,.35); }
.wallet-balance-card.tone-silver { color: #c7d2fe; border-color: rgba(199,210,254,.3); }
.wallet-balance-card.tone-bronze { color: #fbbf80; border-color: rgba(251,191,128,.3); }
.wallet-balance-card.tone-vault { color: #c084fc; border-color: rgba(192,132,252,.38); }
.wallet-balance-topline { display: flex; align-items: center; gap: 8px; color: var(--color-text-muted); font-size: 11px; font-weight: 800; }
.wallet-balance-icon { display: grid; width: 25px; height: 25px; place-items: center; border: 1px solid currentColor; border-radius: 8px; color: inherit; font-size: 10px; font-weight: 900; }
.wallet-balance-card strong { display: block; margin-top: 18px; color: currentColor; font-size: 23px; line-height: 1; }
.wallet-balance-card small { display: block; margin-top: 8px; color: var(--color-text-muted); font-size: 10px; }
.wallet-overview-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.wallet-exchange-card,
.wallet-vault-card,
.wallet-conditions-card { padding: 20px; }
.wallet-section-heading h3 { font-size: 17px; }
.wallet-rate-badge { padding: 6px 9px; border: 1px solid rgba(245,200,66,.28); border-radius: 999px; color: var(--color-gold); background: rgba(245,200,66,.08); font-size: 9px; font-weight: 800; white-space: nowrap; }
.wallet-metric-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-top: 18px; }
.wallet-metric-grid > div,
.wallet-vault-stat { padding: 13px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: rgba(0,0,0,.16); }
.wallet-metric-grid span,
.wallet-vault-stat span { display: block; color: var(--color-text-muted); font-size: 10px; }
.wallet-metric-grid strong { display: block; margin-top: 7px; color: var(--color-text); font-size: 17px; }
.wallet-metric-grid strong.positive { color: #86efac; }
.wallet-vault-symbol { display: grid; width: 30px; height: 30px; place-items: center; border: 1px solid rgba(192,132,252,.35); border-radius: 10px; color: #c084fc; background: rgba(168,85,247,.12); }
.wallet-vault-stat { margin-top: 18px; }
.wallet-vault-stat strong { display: block; margin-top: 8px; color: var(--color-gold); font-size: 24px; }
.wallet-helper { margin: 13px 0 0; color: var(--color-text-muted); font-size: 10px; line-height: 1.7; }
.wallet-action-row { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 16px; }
.wallet-action-link { display: inline-flex; align-items: center; gap: 6px; color: var(--color-gold); font-size: 11px; font-weight: 900; text-decoration: none; }
.wallet-action-link:hover { color: #fde68a; }
.wallet-action-link.secondary { color: var(--color-purple-light); }
.wallet-conditions-card { background: linear-gradient(145deg, rgba(26,10,46,.88), rgba(15,0,32,.7)); }
.wallet-condition-list { display: grid; gap: 9px; margin-top: 16px; }
.wallet-condition-row { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; align-items: center; gap: 11px; padding: 11px 12px; border: 1px solid rgba(255,255,255,.1); border-radius: 12px; background: rgba(0,0,0,.14); }
.wallet-condition-marker { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 9px; color: var(--color-text-muted); background: rgba(168,85,247,.16); font-size: 13px; font-weight: 900; }
.wallet-condition-marker.tone-complete { color: #86efac; background: rgba(74,222,128,.13); }
.wallet-condition-marker.tone-active { color: var(--color-gold); background: rgba(245,200,66,.12); }
.wallet-condition-main { min-width: 0; }
.wallet-condition-title { display: flex; justify-content: space-between; gap: 12px; }
.wallet-condition-title strong { overflow: hidden; color: var(--color-text); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.wallet-condition-title span { color: var(--color-text-muted); font-size: 10px; white-space: nowrap; }
.wallet-condition-progress { height: 5px; margin-top: 8px; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.1); }
.wallet-condition-progress i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--color-purple-glow), var(--color-gold)); }
.wallet-condition-status { font-size: 10px; font-weight: 900; white-space: nowrap; }
.wallet-condition-status.tone-complete { color: #86efac; }
.wallet-condition-status.tone-active { color: var(--color-gold); }
.wallet-condition-status.tone-queued { color: var(--color-text-muted); }
@media (max-width: 900px) { .wallet-balance-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .wallet-overview-grid { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .wallet-overview-heading { align-items: flex-start; flex-direction: column; } .wallet-balance-grid { gap: 8px; } .wallet-balance-card { min-height: 124px; padding: 13px; } .wallet-balance-card strong { margin-top: 13px; font-size: 19px; } .wallet-overview-grid { gap: 12px; } .wallet-exchange-card, .wallet-vault-card, .wallet-conditions-card { padding: 16px; } .wallet-section-heading { align-items: flex-start; flex-direction: column; } .wallet-condition-row { grid-template-columns: 28px minmax(0, 1fr); } .wallet-condition-status { grid-column: 2; } }
</style>
