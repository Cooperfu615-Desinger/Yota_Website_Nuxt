<script setup lang="ts">
import { siteContent } from '~/data/siteContent'

type PayMethod = 'card' | 'atm' | 'store' | 'point' | 'activity'
type PointBrand = 'mycard' | 'gash' | 'funpay' | 'iwin'
type PaymentStage = 'closed' | 'confirm' | 'processing' | 'success'

const props = withDefaults(defineProps<{ embedded?: boolean; showActivityTab?: boolean }>(), {
  embedded: false,
  showActivityTab: true,
})
const route = useRoute()
const { isLoggedIn, openLogin, completeDeposit, userInfo } = useAppState()
const { resolvePublicAsset } = usePublicAssetPath()
const depositEvents = siteContent.events.filter(event => event.deposit)

const payMethod = ref<PayMethod>('card')
const pointBrand = ref<PointBrand>('mycard')
const selectedPlan = ref<number | null>(null)
const paymentStage = ref<PaymentStage>('closed')
const cardForm = reactive({ number: '', expiry: '', cvv: '' })
const pointForm = reactive({ serial: '', password: '' })
let paymentTimer: ReturnType<typeof setTimeout> | null = null

const plans = [
  { id: 1, price: 300, points: 300, bonus: null, tag: null },
  { id: 2, price: 500, points: 550, bonus: '+50', tag: null },
  { id: 3, price: 1000, points: 1150, bonus: '+150', tag: '熱門' },
  { id: 4, price: 2000, points: 2400, bonus: '+400', tag: '最超值' },
  { id: 5, price: 5000, points: 6200, bonus: '+1,200', tag: 'VIP 優惠' },
  { id: 6, price: 10000, points: 13000, bonus: '+3,000', tag: '頂級方案' },
]
const basePayMethods = [
  { key: 'card' as PayMethod, label: '信用卡', icon: '💳', note: '即時到帳' },
  { key: 'atm' as PayMethod, label: 'ATM', icon: '🏧', note: '產生轉帳帳號' },
  { key: 'store' as PayMethod, label: '超商', icon: '🏪', note: '產生繳費代碼' },
  { key: 'point' as PayMethod, label: '點數卡', icon: '🎴', note: '序號立即兌換' },
]
const payMethods = computed(() => props.showActivityTab
  ? [...basePayMethods, { key: 'activity' as PayMethod, label: '活動', icon: '🎉', note: '儲值優惠' }]
  : basePayMethods
)
const pointBrands = [
  { key: 'mycard' as PointBrand, label: 'MyCard' }, { key: 'gash' as PointBrand, label: 'GASH' },
  { key: 'funpay' as PointBrand, label: 'FunPay' }, { key: 'iwin' as PointBrand, label: 'iWin' },
]
const activePlan = computed(() => plans.find(plan => plan.id === selectedPlan.value) ?? null)
const activeMethod = computed(() => payMethods.value.find(method => method.key === payMethod.value))

function requestPayment() {
  if (!activePlan.value) return
  if (!isLoggedIn.value) { openLogin(route.fullPath); return }
  paymentStage.value = 'confirm'
}
function processPayment() {
  if (!activePlan.value) return
  paymentStage.value = 'processing'
  if (paymentTimer) clearTimeout(paymentTimer)
  paymentTimer = setTimeout(() => {
    const plan = activePlan.value
    if (!plan) return
    completeDeposit(plan.points, `${activeMethod.value?.label ?? 'Mock'}・NT$${plan.price.toLocaleString()}`)
    paymentStage.value = 'success'
  }, 1200)
}
function closePayment() {
  if (paymentStage.value !== 'processing') paymentStage.value = 'closed'
}
onUnmounted(() => { if (paymentTimer) clearTimeout(paymentTimer) })
</script>

<template>
  <div :class="embedded ? 'deposit-embedded' : 'pb-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:items-start'">
    <div>
      <div v-if="!embedded" class="px-4 pt-4 pb-2 lg:px-0">
        <p class="deposit-kicker">SECURE PAYMENT</p><h1 class="section-title">儲值專區</h1>
      </div>
      <div class="px-4 mb-5 lg:px-0">
        <div class="deposit-method-grid" role="tablist" aria-label="付款方式">
          <button v-for="method in payMethods" :key="method.key" class="deposit-method" :class="{ active: payMethod === method.key }" role="tab" :aria-selected="payMethod === method.key" @click="payMethod = method.key">
            <span>{{ method.icon }}</span><strong>{{ method.label }}</strong><small>{{ method.note }}</small>
          </button>
        </div>
      </div>

      <template v-if="payMethod !== 'activity'">
        <section class="px-4 mb-5 lg:px-0">
          <div class="deposit-section-heading"><div><span>01</span><h2>選擇儲值方案</h2></div><small v-if="isLoggedIn">目前金幣 {{ userInfo.balance.toLocaleString() }}</small></div>
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <button v-for="plan in plans" :key="plan.id" class="deposit-card text-left" :class="{ selected: selectedPlan === plan.id }" :aria-pressed="selectedPlan === plan.id" @click="selectedPlan = plan.id">
              <div v-if="plan.tag" class="bonus-tag">{{ plan.tag }}</div><div class="text-xl font-black mb-1" style="color:var(--color-gold);">NT${{ plan.price.toLocaleString() }}</div><div class="text-sm font-bold">{{ plan.points.toLocaleString() }} 金幣</div><div class="text-xs mt-1" :style="plan.bonus ? 'color:#4ade80' : 'color:var(--color-text-muted)'">{{ plan.bonus ? `含加贈 ${plan.bonus}` : '等值入帳' }}</div>
            </button>
          </div>
        </section>

        <section class="px-4 mb-5 lg:px-0">
          <div class="deposit-section-heading"><div><span>02</span><h2>付款資料</h2></div><small>Mock 操作，不會送出真實資料</small></div>
          <div v-if="payMethod === 'card'" class="card-purple p-4 grid gap-3">
            <div><label class="input-label" for="card-number">卡號</label><input id="card-number" v-model="cardForm.number" class="input-field" inputmode="numeric" maxlength="19" placeholder="4111 1111 1111 1111" /></div>
            <div class="grid grid-cols-2 gap-3"><div><label class="input-label" for="card-expiry">有效期限</label><input id="card-expiry" v-model="cardForm.expiry" class="input-field" maxlength="5" placeholder="MM/YY" /></div><div><label class="input-label" for="card-cvv">安全碼</label><input id="card-cvv" v-model="cardForm.cvv" type="password" class="input-field" maxlength="4" placeholder="CVV" /></div></div>
          </div>
          <div v-else-if="payMethod === 'point'" class="card-purple p-4 grid gap-3">
            <div class="grid grid-cols-4 gap-2"><button v-for="brand in pointBrands" :key="brand.key" type="button" class="point-brand" :class="{ active: pointBrand === brand.key }" @click="pointBrand = brand.key">{{ brand.label }}</button></div>
            <input v-model="pointForm.serial" class="input-field" :placeholder="`${pointBrands.find(brand => brand.key === pointBrand)?.label} 序號`" /><input v-model="pointForm.password" type="password" class="input-field" placeholder="點數卡密碼" />
          </div>
          <div v-else class="card-purple p-4"><h3 class="font-black mb-3">{{ payMethod === 'atm' ? 'ATM 轉帳流程' : '超商代碼流程' }}</h3><div class="deposit-steps"><div><span>1</span><p>確認方案後產生專屬{{ payMethod === 'atm' ? '轉帳帳號' : '繳費代碼' }}</p></div><div><span>2</span><p>於有效時間內完成 Mock 付款</p></div><div><span>3</span><p>系統確認後更新金幣及交易紀錄</p></div></div></div>
        </section>

        <div class="px-4 lg:px-0"><button class="btn-gold w-full justify-center text-lg py-4" :disabled="!activePlan" :style="!activePlan ? 'opacity:.5;cursor:not-allowed' : ''" @click="requestPayment">{{ activePlan ? `確認儲值 NT$${activePlan.price.toLocaleString()}` : '請先選擇方案' }}</button><p class="text-center text-xs mt-3" style="color:var(--color-text-muted);">🔒 本頁為功能原型，不會產生真實交易</p></div>
      </template>

      <section v-else class="px-4 mb-5 lg:px-0">
        <div class="deposit-section-heading"><div><span>EVENT</span><h2>儲值相關活動</h2></div></div>
        <div class="grid gap-4 lg:grid-cols-2"><NuxtLink v-for="event in depositEvents" :key="event.id" to="/lobby/events" class="card-purple overflow-hidden block"><img v-if="event.imageSrc" :src="resolvePublicAsset(event.imageSrc)" :alt="event.title" class="event-img-crop" /><div v-else class="px-4 py-6" :style="{ background: event.gradient }"><strong>{{ event.title }}</strong><p class="text-xs mt-1">{{ event.subtitle }}</p></div><div class="px-4 py-3 flex justify-between text-xs"><span>{{ event.prize }}</span><span>查看詳情 →</span></div></NuxtLink></div>
      </section>
    </div>

    <aside v-if="!embedded" class="hidden lg:block pt-4 space-y-4"><div class="card-purple p-5"><p class="deposit-kicker">PAYMENT GUIDE</p><h2 class="font-black mb-4">三步完成 Mock 儲值</h2><div class="deposit-guide"><div><span>01</span><p>選擇四種官網專屬渠道</p></div><div><span>02</span><p>確認方案與入帳金幣</p></div><div><span>03</span><p>查看餘額及交易紀錄</p></div></div></div><NuxtLink to="/support" class="deposit-support"><strong>需要協助？</strong><span>前往 24 小時客服中心 →</span></NuxtLink></aside>

    <ClientOnly><Teleport to="body"><Transition name="payment-fade"><div v-if="paymentStage !== 'closed'" class="payment-overlay" role="dialog" aria-modal="true" aria-label="確認儲值" @click.self="closePayment"><div class="payment-panel">
      <template v-if="paymentStage === 'confirm' && activePlan"><p class="deposit-kicker">PAYMENT REVIEW</p><h2>確認儲值內容</h2><div class="payment-amount"><small>本次付款</small><strong>NT${{ activePlan.price.toLocaleString() }}</strong><span>入帳 {{ activePlan.points.toLocaleString() }} 金幣</span></div><dl><div><dt>付款方式</dt><dd>{{ activeMethod?.label }}</dd></div><div><dt>處理狀態</dt><dd>確認後進入處理中</dd></div></dl><div class="payment-actions"><button class="btn-outline-purple" @click="closePayment">返回修改</button><button class="btn-gold" @click="processPayment">確認付款</button></div></template>
      <template v-else-if="paymentStage === 'processing'"><div class="payment-spinner" /><h2>交易處理中</h2><p>正在確認 Mock 付款結果，請勿關閉視窗。</p></template>
      <template v-else><div class="payment-success">✓</div><p class="deposit-kicker">PAYMENT COMPLETE</p><h2>儲值成功</h2><p>{{ activePlan?.points.toLocaleString() }} 金幣已加入餘額，交易紀錄同步完成。</p><button class="btn-gold w-full justify-center" @click="closePayment">完成</button></template>
    </div></div></Transition></Teleport></ClientOnly>
  </div>
</template>

<style scoped>
.deposit-embedded{padding:4px 0 24px}.deposit-kicker{margin:0 0 4px;color:var(--color-gold);font-size:10px;font-weight:900;letter-spacing:.18em}.deposit-method-grid{display:grid;grid-template-columns:repeat(5,minmax(92px,1fr));gap:8px}.deposit-method{display:grid;grid-template-columns:30px 1fr;grid-template-rows:auto auto;column-gap:8px;padding:12px;border:1px solid var(--color-border);border-radius:14px;color:var(--color-text);background:rgba(168,85,247,.06);text-align:left}.deposit-method>span{grid-row:1/3;align-self:center;font-size:22px}.deposit-method strong{font-size:12px}.deposit-method small{color:var(--color-text-muted);font-size:9px}.deposit-method.active{border-color:rgba(245,200,66,.55);background:rgba(245,200,66,.1)}.deposit-section-heading{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:12px}.deposit-section-heading>div{display:flex;align-items:center;gap:9px}.deposit-section-heading span{color:var(--color-purple-light);font-size:10px;font-weight:900;letter-spacing:.12em}.deposit-section-heading h2{margin:0;font-size:14px;font-weight:900}.deposit-section-heading small{color:var(--color-text-muted);font-size:10px}.point-brand{padding:9px 4px;border:1px solid var(--color-border);border-radius:10px;color:var(--color-text-muted);background:rgba(168,85,247,.07);font-size:10px;font-weight:800}.point-brand.active{border-color:var(--color-purple-light);color:#fff;background:rgba(168,85,247,.24)}.deposit-steps,.deposit-guide{display:grid;gap:10px}.deposit-steps>div,.deposit-guide>div{display:flex;align-items:center;gap:10px;color:var(--color-text-muted);font-size:12px}.deposit-steps span,.deposit-guide span{display:grid;width:27px;height:27px;flex:0 0 auto;place-items:center;border-radius:50%;color:var(--color-gold);background:rgba(245,200,66,.12);font-size:9px;font-weight:900}.deposit-steps p,.deposit-guide p{margin:0}.deposit-support{display:flex;flex-direction:column;gap:4px;padding:18px;border:1px solid rgba(6,199,85,.3);border-radius:16px;color:#fff;background:linear-gradient(135deg,rgba(6,199,85,.28),rgba(6,199,85,.08))}.deposit-support span{color:rgba(255,255,255,.68);font-size:11px}
.payment-fade-enter-active,.payment-fade-leave-active{transition:opacity .2s}.payment-fade-enter-from,.payment-fade-leave-to{opacity:0}.payment-overlay{position:fixed;inset:0;z-index:1080;display:grid;place-items:center;padding:18px;background:rgba(5,0,15,.82);backdrop-filter:blur(10px)}.payment-panel{width:min(430px,100%);padding:28px;border:1px solid rgba(245,200,66,.32);border-radius:24px;background:linear-gradient(155deg,#21103a,#10051f);box-shadow:0 28px 80px rgba(0,0,0,.55);text-align:center}.payment-panel h2{margin:2px 0 18px;font-size:23px;font-weight:900}.payment-panel>p{color:var(--color-text-muted);font-size:12px}.payment-amount{display:flex;flex-direction:column;gap:4px;padding:20px;margin-bottom:14px;border:1px solid rgba(245,200,66,.22);border-radius:17px;background:rgba(245,200,66,.07)}.payment-amount small{color:var(--color-text-muted)}.payment-amount strong{color:var(--color-gold);font-size:32px}.payment-amount span{color:#86efac;font-size:12px}.payment-panel dl{margin:0 0 18px}.payment-panel dl>div{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:12px}.payment-panel dt{color:var(--color-text-muted)}.payment-panel dd{margin:0;font-weight:700}.payment-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:9px}.payment-actions>*{justify-content:center}.payment-spinner{width:48px;height:48px;margin:34px auto 18px;border:3px solid rgba(168,85,247,.2);border-top-color:var(--color-gold);border-radius:50%;animation:spin .8s linear infinite}.payment-success{display:grid;width:62px;height:62px;place-items:center;margin:4px auto 14px;border-radius:50%;color:#052e16;background:#4ade80;font-size:30px;font-weight:900}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:760px){.deposit-method-grid{grid-template-columns:repeat(2,1fr)}.deposit-method:last-child{grid-column:1/-1}.deposit-section-heading{align-items:flex-start;flex-direction:column}.payment-panel{padding:24px 20px}}
</style>
