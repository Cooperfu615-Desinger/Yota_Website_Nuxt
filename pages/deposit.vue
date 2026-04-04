<script setup lang="ts">
useSeoMeta({
  title: '儲值專區 — 巨亨ONLINE | 多元安全付款方式',
  description: '巨亨ONLINE提供信用卡、ATM、超商繳費、MyCard/GASH點數卡等多種儲值方式，快速安全即時到帳。',
  ogTitle: '儲值專區 — 巨亨ONLINE',
})

type PayMethod = 'card' | 'atm' | 'store' | 'point'
type PointBrand = 'mycard' | 'gash' | 'funpay' | 'iwin'

const payMethod = ref<PayMethod>('card')
const pointBrand = ref<PointBrand>('mycard')
const selectedPlan = ref<number | null>(null)

const plans = [
  { id: 1, price: 300,  points: 300,   bonus: null,    tag: null },
  { id: 2, price: 500,  points: 550,   bonus: '+50',   tag: null },
  { id: 3, price: 1000, points: 1150,  bonus: '+150',  tag: '熱門' },
  { id: 4, price: 2000, points: 2400,  bonus: '+400',  tag: '最超值' },
  { id: 5, price: 5000, points: 6200,  bonus: '+1200', tag: 'VIP優惠' },
  { id: 6, price: 10000,points: 13000, bonus: '+3000', tag: '頂級方案' },
]

const payMethods = [
  { key: 'card'  as PayMethod, label: '信用卡', icon: '💳' },
  { key: 'atm'   as PayMethod, label: 'ATM',    icon: '🏧' },
  { key: 'store' as PayMethod, label: '超商',   icon: '🏪' },
  { key: 'point' as PayMethod, label: '點數卡', icon: '🎴' },
]

const pointBrands = [
  { key: 'mycard' as PointBrand, label: 'MyCard' },
  { key: 'gash'   as PointBrand, label: 'GASH' },
  { key: 'funpay' as PointBrand, label: 'FunPay' },
  { key: 'iwin'   as PointBrand, label: 'iWin' },
]
</script>

<template>
  <div class="pb-6">
    <div class="px-4 pt-4 pb-2">
      <h1 class="section-title">儲值專區</h1>
    </div>

    <!-- 付款方式 Tab -->
    <div class="px-4 mb-4">
      <div class="tab-bar" role="tablist" aria-label="付款方式">
        <button
          v-for="method in payMethods"
          :key="method.key"
          class="tab-btn"
          :class="{ active: payMethod === method.key }"
          role="tab"
          :aria-selected="payMethod === method.key"
          @click="payMethod = method.key"
        >
          {{ method.icon }} {{ method.label }}
        </button>
      </div>
    </div>

    <!-- 方案選擇 -->
    <section class="px-4 mb-5" aria-labelledby="plan-heading">
      <h2 id="plan-heading" class="text-sm font-bold mb-3" style="color:var(--color-text-muted);">選擇儲值方案</h2>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="plan in plans"
          :key="plan.id"
          class="deposit-card text-left"
          :class="{ selected: selectedPlan === plan.id }"
          :aria-pressed="selectedPlan === plan.id"
          @click="selectedPlan = plan.id"
        >
          <div v-if="plan.tag" class="bonus-tag">{{ plan.tag }}</div>
          <div class="text-xl font-black mb-1" style="color:var(--color-gold);">NT${{ plan.price.toLocaleString() }}</div>
          <div class="text-sm font-bold" style="color:var(--color-text);">{{ plan.points.toLocaleString() }} 點</div>
          <div v-if="plan.bonus" class="text-xs mt-1" style="color:#4ade80;">額外贈送 {{ plan.bonus }} 點</div>
          <div v-else class="text-xs mt-1" style="color:var(--color-text-muted);">基本方案</div>
        </button>
      </div>
    </section>

    <!-- 點數卡品牌選擇（只在點數卡模式下顯示） -->
    <Transition name="tab-fade">
      <section v-if="payMethod === 'point'" class="px-4 mb-5">
        <h2 class="text-sm font-bold mb-3" style="color:var(--color-text-muted);">選擇點數卡品牌</h2>
        <div class="flex gap-2">
          <button
            v-for="brand in pointBrands"
            :key="brand.key"
            class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
            :class="pointBrand === brand.key ? 'text-white' : ''"
            :style="pointBrand === brand.key
              ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); box-shadow:0 2px 12px rgba(124,58,237,0.4);'
              : 'background:rgba(168,85,247,0.1); border:1px solid var(--color-border); color:var(--color-text-muted);'"
            @click="pointBrand = brand.key"
          >
            {{ brand.label }}
          </button>
        </div>
        <div class="card-purple mt-3 p-4">
          <div class="text-sm font-bold mb-2">輸入序號</div>
          <input type="text" class="input-field" :placeholder="`請輸入 ${pointBrands.find(b=>b.key===pointBrand)?.label} 序號`" />
          <input type="text" class="input-field mt-2" placeholder="請輸入密碼" />
        </div>
      </section>
    </Transition>

    <!-- 信用卡資訊（只在信用卡模式下顯示） -->
    <Transition name="tab-fade">
      <section v-if="payMethod === 'card'" class="px-4 mb-5">
        <h2 class="text-sm font-bold mb-3" style="color:var(--color-text-muted);">信用卡資訊</h2>
        <div class="card-purple p-4 flex flex-col gap-3">
          <div>
            <label class="input-label" for="card-number">卡號</label>
            <input id="card-number" type="text" class="input-field" placeholder="1234 5678 9012 3456" inputmode="numeric" maxlength="19" autocomplete="cc-number" />
          </div>
          <div class="flex gap-3">
            <div class="flex-1">
              <label class="input-label" for="card-exp">有效期限</label>
              <input id="card-exp" type="text" class="input-field" placeholder="MM/YY" inputmode="numeric" maxlength="5" autocomplete="cc-exp" />
            </div>
            <div class="flex-1">
              <label class="input-label" for="card-cvv">安全碼</label>
              <input id="card-cvv" type="password" class="input-field" placeholder="CVV" maxlength="4" autocomplete="cc-csc" />
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- ATM 說明 -->
    <Transition name="tab-fade">
      <section v-if="payMethod === 'atm'" class="px-4 mb-5">
        <div class="card-purple p-4">
          <h2 class="text-sm font-bold mb-3" style="color:var(--color-text-muted);">ATM 轉帳說明</h2>
          <div class="flex flex-col gap-3 text-sm">
            <div class="step-item">
              <div class="step-num">1</div>
              <div style="color:var(--color-text-muted);">選擇儲值方案後，系統將產生專屬轉帳帳號</div>
            </div>
            <div class="step-item">
              <div class="step-num">2</div>
              <div style="color:var(--color-text-muted);">請在 24 小時內完成轉帳</div>
            </div>
            <div class="step-item">
              <div class="step-num">3</div>
              <div style="color:var(--color-text-muted);">轉帳完成後約 5–15 分鐘自動到帳</div>
            </div>
          </div>
        </div>
      </section>
    </Transition>

    <!-- 超商說明 -->
    <Transition name="tab-fade">
      <section v-if="payMethod === 'store'" class="px-4 mb-5">
        <div class="card-purple p-4">
          <h2 class="text-sm font-bold mb-3" style="color:var(--color-text-muted);">超商繳費說明</h2>
          <div class="flex gap-3 mb-4">
            <div v-for="store in ['7-11','全家','萊爾富','OK']" :key="store" class="flex-1 text-center py-2 rounded-lg text-xs font-bold" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border); color:var(--color-text-muted);">{{ store }}</div>
          </div>
          <p class="text-xs" style="color:var(--color-text-muted);">選擇方案後系統將產生繳費代碼，請攜至超商繳費機操作。繳費後 30 分鐘內到帳。</p>
        </div>
      </section>
    </Transition>

    <!-- 確認儲值按鈕 -->
    <div class="px-4">
      <button
        class="btn-gold w-full justify-center text-lg py-4"
        style="border-radius:14px;"
        :disabled="!selectedPlan"
        :style="!selectedPlan ? 'opacity:0.5;cursor:not-allowed;' : ''"
        :aria-label="selectedPlan ? `確認儲值 NT$${plans.find(p=>p.id===selectedPlan)?.price}` : '請先選擇方案'"
      >
        {{ selectedPlan ? `確認儲值 NT$${plans.find(p => p.id === selectedPlan)?.price.toLocaleString()}` : '請先選擇方案' }}
      </button>
      <p class="text-center text-xs mt-3" style="color:var(--color-text-muted);">
        🔒 所有交易均採用 SSL 加密保護
      </p>
    </div>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>
