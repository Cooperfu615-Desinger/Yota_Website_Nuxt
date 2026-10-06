<script setup lang="ts">
import { isValidSilverPreviewAmount } from '~/utils/walletOverview'

const { userInfo } = useAppState()
const { demo, available } = useWalletOverview()
const direction = ref<'silver' | 'gold'>('silver')
const input = ref('')
const valid = computed(() => isValidSilverPreviewAmount(input.value, available.value))
const amount = computed(() => Number(input.value))
const number = (value: number) => value.toLocaleString()

function selectDirection(value: 'silver' | 'gold') {
  direction.value = value
  input.value = ''
}
function onAmountInput(event: Event) {
  const field = event.target as HTMLInputElement
  input.value = field.value.replace(/[^0-9]/g, '')
  field.value = input.value
}
function selectPercent(percent: number) {
  input.value = String(Math.floor(available.value * percent))
}
</script>

<template>
  <section class="exchange-preview" aria-label="幣別交換">
    <aside class="card-purple exchange-balances">
      <div class="exchange-balance gold"><span aria-hidden="true">金</span><div><small>金幣餘額</small><strong>{{ number(userInfo.balance) }}</strong></div></div>
      <div class="exchange-balance"><span aria-hidden="true">銀</span><div><small>銀幣餘額</small><strong>{{ number(userInfo.silverBalance) }}</strong></div></div>
      <div class="exchange-rate"><span aria-hidden="true">⇄</span><strong>1 金幣 = 100 銀幣</strong><p>銀幣兌換所得金幣將存入保險箱。</p></div>
      <dl class="exchange-quota">
        <div><dt>剩餘兌換額度（示範）</dt><dd>{{ number(demo.quota) }} 銀</dd></div>
        <div><dt>目前最多可兌換</dt><dd>{{ number(available) }} 銀</dd></div>
      </dl>
    </aside>
    <div class="card-purple exchange-form">
      <div class="exchange-directions" role="group" aria-label="交換方向">
        <button type="button" :aria-pressed="direction === 'gold'" @click="selectDirection('gold')">金幣兌銀幣</button>
        <button type="button" :aria-pressed="direction === 'silver'" @click="selectDirection('silver')">銀幣兌金幣</button>
      </div>
      <template v-if="direction === 'silver'">
        <div class="exchange-amount">
          <label for="silver-exchange-amount">欲兌換的銀幣</label>
          <input id="silver-exchange-amount" :value="input" type="text" inputmode="numeric" placeholder="0" :aria-invalid="input !== '' && !valid" aria-describedby="exchange-input-hint" @input="onAmountInput" />
          <div class="exchange-quick">
            <button v-for="percent in [0.25, 0.5, 0.75, 1]" :key="percent" type="button" :disabled="available <= 0" @click="selectPercent(percent)">{{ percent === 1 ? 'MAX' : `${percent * 100}%` }}</button>
          </div>
          <p id="exchange-input-hint" :class="{ invalid: input !== '' && !valid }">{{ input !== '' && !valid ? `請輸入 1 至 ${number(available)} 銀幣。` : '快捷比例依目前可兌換上限計算' }}</p>
        </div>
        <div class="exchange-result">
          <div><small>扣除銀幣與額度</small><strong>{{ valid ? number(amount) : '—' }} <span>銀</span></strong></div>
          <span aria-hidden="true">⇄</span>
          <div><small>保險箱增加</small><strong>{{ valid ? (amount / 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—' }} <span>金</span></strong></div>
        </div>
        <button type="button" class="btn-gold exchange-submit" disabled>確認交換（展示中）</button>
        <p class="exchange-disclaimer">ⓘ 目前僅供試算，不扣款；精度與交易限制確認後開放送出。</p>
      </template>
      <div v-else class="exchange-unavailable">
        <span aria-hidden="true">⇄</span><h3>金幣兌銀幣</h3>
        <p>新版交換規則確認中，暫不開放操作。</p>
        <button type="button" class="btn-outline-purple" @click="selectDirection('silver')">查看銀幣兌金幣</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.exchange-preview { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 20px; }
.exchange-balances, .exchange-form { padding: 22px; min-width: 0; }
.exchange-balance { display: flex; align-items: center; gap: 12px; padding: 17px 0; }
.exchange-balance > span { display: grid; place-items: center; width: 36px; height: 36px; border: 1px solid var(--color-border); border-radius: 50%; font-weight: 800; color: #D6DEE9; }
.exchange-balance small, .exchange-result small { display: block; font-size: 12px; color: var(--color-text-muted); }
.exchange-balance strong { display: block; margin-top: 5px; font-size: 24px; font-weight: 900; }
.exchange-balance.gold strong, .exchange-balance.gold > span { color: var(--color-gold); }
.exchange-rate { margin: 15px 0 20px; padding: 18px 14px; border: 1px solid rgba(245,200,66,.25); border-radius: 12px; background: rgba(245,200,66,.06); }
.exchange-rate > span { display: block; color: var(--color-gold); font-size: 24px; margin-bottom: 6px; }
.exchange-rate strong { color: var(--color-gold); font-size: 16px; }
.exchange-rate p { margin: 8px 0 0; font-size: 12px; line-height: 1.7; color: var(--color-text-muted); }
.exchange-quota { margin: 0; }
.exchange-quota > div { padding: 10px 0; border-top: 1px solid var(--color-border); }
.exchange-quota dt { font-size: 12px; color: var(--color-text-muted); }
.exchange-quota dd { margin: 5px 0 0; font-size: 16px; font-weight: 800; }
.exchange-directions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; padding: 5px; border: 1px solid var(--color-border); border-radius: 12px; background: rgba(0,0,0,.18); }
.exchange-directions button { padding: 12px 6px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--color-text-muted); font-size: 13px; font-weight: 800; cursor: pointer; }
.exchange-directions button[aria-pressed="true"] { color: var(--color-gold); background: rgba(245,200,66,.08); border-color: rgba(245,200,66,.3); }
.exchange-amount { margin: 20px 0; padding: 20px; border: 1px solid var(--color-border); border-radius: 13px; background: rgba(0,0,0,.2); }
.exchange-amount label { display: block; color: var(--color-text-muted); font-size: 12px; }
.exchange-amount input { width: 100%; padding: 15px 0; background: transparent; border: none; color: var(--color-text); font-size: 36px; font-weight: 900; }
.exchange-amount input[aria-invalid="true"] { color: #FCA5A5; }
.exchange-quick { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.exchange-quick button { padding: 9px 5px; border: 1px solid var(--color-border); border-radius: 8px; background: rgba(168,85,247,.1); color: var(--color-purple-light); font-size: 12px; font-weight: 800; cursor: pointer; }
.exchange-quick button:last-child { color: var(--color-gold); border-color: rgba(245,200,66,.3); }
.exchange-quick button:disabled { opacity: .45; cursor: not-allowed; }
.exchange-amount p { margin: 12px 0 0; color: var(--color-text-muted); font-size: 12px; }
.exchange-amount p.invalid { color: #FCA5A5; }
.exchange-result { display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 12px; margin-bottom: 22px; }
.exchange-result > div { padding: 16px; border: 1px solid var(--color-border); border-radius: 12px; background: rgba(0,0,0,.15); min-width: 0; }
.exchange-result strong { display: block; margin-top: 8px; font-size: 25px; font-weight: 900; overflow-wrap: anywhere; }
.exchange-result strong span { font-size: 12px; }
.exchange-result > div:last-child strong { color: var(--color-gold); }
.exchange-result > span { color: var(--color-purple-light); }
.exchange-submit { width: 100%; justify-content: center; opacity: .45; cursor: not-allowed; }
.exchange-disclaimer { margin: 12px 0 0; color: var(--color-text-muted); font-size: 12px; line-height: 1.7; }
.exchange-unavailable { padding: 50px 12px; text-align: center; }
.exchange-unavailable > span { color: var(--color-gold); font-size: 40px; }
.exchange-unavailable h3 { font-size: 20px; font-weight: 900; margin: 10px 0; }
.exchange-unavailable p { color: var(--color-text-muted); font-size: 13px; margin-bottom: 20px; }
@media (max-width: 900px) { .exchange-preview { grid-template-columns: 1fr; } }
@media (max-width: 600px) {
  .exchange-balances, .exchange-form { padding: 18px 14px; }
  .exchange-amount { padding: 16px 12px; }
  .exchange-result { gap: 8px; }
  .exchange-result > div { padding: 12px 8px; }
  .exchange-result strong { font-size: 22px; }
}
</style>
