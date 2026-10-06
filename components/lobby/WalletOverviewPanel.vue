<script setup lang="ts">
import { siteContent } from '~/data/siteContent'

const { userInfo } = useAppState()
const { demo, spendable, available, limitReason } = useWalletOverview()
const content = siteContent.walletOverview
const activeFilter = ref<typeof content.filters[number]['key']>('active')
const info = ref<'gold' | 'silver' | 'bronze' | 'exchange' | 'turnover' | null>(null)
const number = (value: number) => value.toLocaleString()
const wallets = computed(() => content.wallets.map(wallet => ({
  ...wallet,
  amount: wallet.key === 'gold' ? userInfo.value.balance : wallet.key === 'silver' ? userInfo.value.silverBalance : userInfo.value.bronzeBalance,
})))
const conditions = computed(() => demo.conditions.filter(item => item.status === activeFilter.value))
const filterLabel = computed(() => content.filters.find(item => item.key === activeFilter.value)?.label)
const walletNote = computed(() => content.wallets.find(wallet => wallet.key === info.value)?.note)
const infoTitle = computed(() => info.value === 'exchange' ? '交換規則與計算'
  : info.value === 'turnover' ? '優惠流水規則'
  : `${content.wallets.find(wallet => wallet.key === info.value)?.label ?? ''}說明`)
const target = (item: typeof demo.conditions[number]) => item.amount * item.turnoverMultiplier
const percentage = (item: typeof demo.conditions[number]) => Math.round(item.progress / target(item) * 100)
</script>

<template>
  <section class="wallet-overview" aria-label="錢包總覽">
    <div class="wallet-balance-grid" aria-label="各幣別餘額">
      <article v-for="wallet in wallets" :key="wallet.key" class="card-purple wallet-balance-card" :class="`tone-${wallet.key}`">
        <span class="wallet-balance-icon" aria-hidden="true">{{ wallet.label.charAt(0) }}</span>
        <div>
          <div class="wallet-balance-label">
            <span>{{ wallet.label }}餘額</span>
            <button type="button" class="wallet-info-button" :aria-label="`查看${wallet.label}說明`" aria-haspopup="dialog" @click="info = wallet.key">ⓘ</button>
          </div>
          <strong>{{ number(wallet.amount) }}</strong>
        </div>
      </article>
    </div>

    <div class="wallet-overview-body">
      <section class="card-purple wallet-conversion" aria-labelledby="wallet-convert-title">
        <header class="wallet-section-heading">
          <h3 id="wallet-convert-title">現在可以換多少？<button type="button" class="wallet-info-button" aria-label="查看交換規則" aria-haspopup="dialog" @click="info = 'exchange'">ⓘ</button></h3>
          <span class="wallet-demo">額度示範</span>
        </header>
        <div class="wallet-answer">
          <small>銀幣可換成</small>
          <strong>{{ number(available / 100) }} <span>金幣</span></strong>
          <p>需扣除 {{ number(available) }} 銀幣與同額兌換額度</p>
        </div>
        <dl class="wallet-calculation"><div><dt>剩餘兌換額度</dt><dd>{{ number(demo.quota) }} 銀</dd></div></dl>
        <p v-if="available <= 0" class="wallet-limit-reason" role="status">{{ limitReason }}</p>
        <button
          type="button"
          class="btn-gold wallet-exchange-button"
          :disabled="available <= 0"
          @click="navigateTo({ path: '/lobby/vault', query: { tab: 'exchange' } })"
        >前往交換 <span aria-hidden="true">→</span></button>
        <p class="wallet-preview-note">交換僅供試算</p>
      </section>

      <section class="card-purple wallet-turnover" aria-labelledby="wallet-progress-title">
        <header class="wallet-section-heading">
          <h3 id="wallet-progress-title">優惠流水進度<button type="button" class="wallet-info-button" aria-label="查看流水規則" aria-haspopup="dialog" @click="info = 'turnover'">ⓘ</button></h3>
          <span class="wallet-demo">示範資料</span>
        </header>
        <div class="wallet-filters" role="group" aria-label="優惠流水狀態">
          <button v-for="filter in content.filters" :key="filter.key" type="button" :aria-pressed="activeFilter === filter.key" @click="activeFilter = filter.key">
            {{ filter.label }}<span>{{ demo.conditions.filter(item => item.status === filter.key).length }}</span>
          </button>
        </div>
        <div class="wallet-conditions">
          <p v-if="conditions.length === 0" class="wallet-empty" role="status">目前沒有{{ filterLabel }}的優惠流水。</p>
          <article v-for="item in conditions" :key="item.id" class="wallet-condition">
            <header>
              <h4>{{ item.source }}</h4>
              <span :class="`status-${item.status}`">{{ item.status === 'completed' ? '已達標' : item.status === 'queued' ? '等待前筆完成' : '目前累計這一筆' }}</span>
            </header>
            <div class="wallet-remaining">
              <span>{{ item.status === 'completed' ? '已完成有效投注' : item.status === 'queued' ? '開始後需完成有效投注' : '還需有效投注' }}</span>
              <strong>{{ number(item.status === 'completed' ? target(item) : target(item) - item.progress) }} <small>銀幣</small></strong>
            </div>
            <div class="wallet-progress-label"><span>已完成 {{ number(item.progress) }} / {{ number(target(item)) }}</span><b>{{ percentage(item) }}%</b></div>
            <div class="wallet-progress" role="progressbar" :aria-label="`${item.source}流水進度`" :aria-valuenow="item.progress" :aria-valuemin="0" :aria-valuemax="target(item)"><span :style="{ width: `${percentage(item)}%` }" /></div>
            <p class="wallet-earned">{{ item.status === 'completed' ? '已增加' : '達標後增加' }} <b>{{ number(item.amount * item.quotaMultiplier) }} 銀</b> 兌換額度</p>
            <details class="wallet-details">
              <summary>優惠明細</summary>
              <dl>
                <div><dt>領取銀幣</dt><dd>{{ number(item.amount) }} 銀（已加入餘額）</dd></div>
                <div><dt>流水倍率</dt><dd>{{ item.turnoverMultiplier }} 倍</dd></div>
                <div><dt>額度倍率</dt><dd>{{ item.quotaMultiplier }} 倍</dd></div>
                <div><dt>領取時間</dt><dd>{{ item.receivedAt }}</dd></div>
                <div><dt>優惠編號</dt><dd>{{ item.id }}</dd></div>
              </dl>
            </details>
          </article>
        </div>
      </section>
    </div>

    <ClientOnly>
      <LobbyWalletRuleDialog v-if="info" :title="infoTitle" @close="info = null">
        <template v-if="info === 'exchange'">
          <p>可交換銀幣取「可扣用銀幣」與「剩餘兌換額度」的較小值；額度是資格，不是額外銀幣。</p>
          <dl>
            <div><dt>可扣用銀幣</dt><dd>{{ number(spendable) }} 銀</dd></div>
            <div><dt>剩餘額度</dt><dd>{{ number(demo.quota) }} 銀</dd></div>
            <div><dt>現在可交換</dt><dd>{{ number(available) }} 銀 → {{ number(available / 100) }} 金</dd></div>
          </dl>
          <p>{{ limitReason }}</p>
          <p>1 金 = 100 銀。交換會同時扣除銀幣與額度，所得存入保險箱，不直接增加金幣錢包。</p>
          <p>未結算投入 {{ number(demo.unsettledSilver) }} 銀不能重複使用。額度已取得 {{ number(demo.quotaGranted) }} − 已使用 {{ number(demo.quotaUsed) }} = 剩餘 {{ number(demo.quota) }} 銀。</p>
          <p>精度、最小單位、單次／每日限制待確認；目前只提供試算，不扣款。</p>
        </template>
        <template v-else-if="info === 'turnover'">
          <p>流水是有效投注累計，不是需要輸掉的金額。僅計入領獎後、已結算且有效的銀幣投注。</p>
          <p>依領獎順序逐筆完成；同一筆投注只計入一次，不能自行跳過或合併。</p>
          <p>達標只增加兌換額度，不會再發銀幣，也不會自動交換。銀幣用完仍保留進度，條件與額度無到期回收。</p>
          <p>額度為帳戶共用，可兌換現有銀幣；交換不影響流水，派彩不增加額度。</p>
          <p>目前為示範資料，未接入正式結算或額度發放。</p>
        </template>
        <p v-else>{{ walletNote }}。</p>
      </LobbyWalletRuleDialog>
    </ClientOnly>
  </section>
</template>

<style scoped>
.wallet-overview { display: flex; flex-direction: column; gap: 18px; }
.wallet-balance-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.wallet-balance-card { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 20px; }
.wallet-balance-icon { display: grid; place-items: center; width: 42px; height: 42px; flex-shrink: 0; border: 1px solid rgba(245,200,66,.26); border-radius: 50%; background: rgba(245,200,66,.08); font-weight: 900; color: var(--color-gold); }
.wallet-balance-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--color-text-muted); }
.wallet-balance-card strong { display: block; margin-top: 5px; font-size: clamp(18px, 2.2vw, 26px); font-weight: 900; overflow-wrap: anywhere; }
.tone-gold strong { color: var(--color-gold); }
.tone-silver strong { color: #D6DEE9; }
.tone-bronze strong { color: #D9A379; }
.wallet-overview-body { display: grid; grid-template-columns: minmax(260px, .8fr) minmax(0, 1.4fr); gap: 18px; align-items: start; }
.wallet-conversion, .wallet-turnover { min-width: 0; padding: 22px; }
.wallet-section-heading { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.wallet-section-heading h3 { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 16px; font-weight: 900; }
.wallet-info-button { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; padding: 0; border: 1px solid rgba(168,85,247,.26); border-radius: 50%; background: rgba(168,85,247,.1); color: var(--color-purple-light); cursor: pointer; flex-shrink: 0; }
.wallet-info-button:hover { color: var(--color-gold); border-color: var(--color-gold); }
.wallet-demo, .wallet-preview-note { color: var(--color-text-muted); font-size: 11px; }
.wallet-demo { border: 1px solid var(--color-border); padding: 3px 7px; border-radius: 6px; }
.wallet-answer { padding: 26px 0 20px; }
.wallet-answer small { color: var(--color-text-muted); font-size: 12px; }
.wallet-answer strong { display: block; margin: 6px 0 10px; font-size: 48px; font-weight: 900; line-height: 1.2; color: var(--color-gold); }
.wallet-answer strong span { font-size: 16px; }
.wallet-answer p { font-size: 12px; line-height: 1.7; color: var(--color-text-muted); }
.wallet-calculation { margin: 0 0 22px; padding: 15px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
.wallet-calculation > div, .wallet-details dl > div { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 5px 12px; }
.wallet-calculation dt { font-size: 12px; color: var(--color-text-muted); }
.wallet-calculation dd { margin: 0; font-size: 14px; font-weight: 800; }
.wallet-exchange-button { width: 100%; justify-content: center; gap: 10px; }
.wallet-exchange-button:disabled { opacity: .45; cursor: not-allowed; }
.wallet-preview-note { margin: 10px 0 0; text-align: center; }
.wallet-limit-reason { font-size: 12px; line-height: 1.7; margin-bottom: 14px; }
.wallet-filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0; }
.wallet-filters button { display: flex; align-items: center; gap: 8px; border: 1px solid var(--color-border); border-radius: 9px; padding: 9px 12px; background: rgba(0,0,0,.2); color: var(--color-text-muted); font-size: 12px; font-weight: 700; cursor: pointer; }
.wallet-filters button[aria-pressed="true"] { color: var(--color-gold); background: rgba(245,200,66,.08); border-color: rgba(245,200,66,.4); }
.wallet-filters button span { min-width: 19px; border-radius: 50%; background: rgba(255,255,255,.08); font-size: 10px; text-align: center; }
.wallet-condition { padding: 18px; border: 1px solid var(--color-border); border-radius: 13px; background: rgba(0,0,0,.18); }
.wallet-condition header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
.wallet-condition h4 { margin: 0; font-size: 14px; font-weight: 800; }
.wallet-condition header > span { color: var(--color-text-muted); font-size: 11px; }
.wallet-condition header > .status-completed { color: #86EFAC; }
.wallet-remaining { margin: 22px 0 16px; }
.wallet-remaining > span { font-size: 12px; color: var(--color-text-muted); }
.wallet-remaining strong { display: block; margin-top: 5px; color: var(--color-gold); font-size: 30px; font-weight: 900; }
.wallet-remaining small { font-size: 12px; font-weight: 500; }
.wallet-progress-label { display: flex; justify-content: space-between; gap: 8px; font-size: 11px; color: var(--color-text-muted); }
.wallet-progress-label b { color: var(--color-gold); }
.wallet-progress { height: 7px; margin-top: 8px; border-radius: 8px; background: rgba(255,255,255,.08); overflow: hidden; }
.wallet-progress > span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--color-gold-dark), var(--color-gold)); }
.wallet-earned { margin: 15px 0; font-size: 12px; color: var(--color-text-muted); }
.wallet-earned b { color: var(--color-text); }
.wallet-details { padding-top: 14px; border-top: 1px solid var(--color-border); font-size: 12px; }
.wallet-details summary { color: var(--color-purple-light); cursor: pointer; }
.wallet-details dl { margin: 12px 0 0; }
.wallet-details dl > div { padding: 5px 0; }
.wallet-details dt { color: var(--color-text-muted); }
.wallet-details dd { margin: 0; text-align: right; }
.wallet-empty { color: var(--color-text-muted); padding: 25px 0; text-align: center; font-size: 13px; }
@media (max-width: 900px) { .wallet-overview-body { grid-template-columns: 1fr; } }
@media (max-width: 600px) {
  .wallet-balance-grid { gap: 8px; }
  .wallet-balance-card { padding: 12px 8px; flex-direction: column; align-items: flex-start; gap: 8px; }
  .wallet-balance-icon { width: 30px; height: 30px; font-size: 12px; }
  .wallet-balance-label { font-size: 11px; gap: 2px; }
  .wallet-balance-card strong { font-size: 16px; }
  .wallet-info-button { width: 24px; height: 24px; }
  .wallet-conversion, .wallet-turnover { padding: 18px 14px; }
  .wallet-filters button { padding: 8px 10px; }
  .wallet-condition { padding: 14px; }
}
</style>
