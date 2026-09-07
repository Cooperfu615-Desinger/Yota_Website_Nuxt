<script setup lang="ts">
import { PROMO_CODES, PROMO_CURRENCY_LABELS, type PromoCode } from '~/data/promoCodes'

const route = useRoute()
const { isLoggedIn, userInfo, openLogin } = useAppState()
const { claimedCodes, preview, redeem } = usePromoCodeState()
const codeInput = ref('')
const error = ref('')
const pendingPromo = ref<PromoCode | null>(null)
const receivedPromo = ref<PromoCode | null>(null)

const isGuest = computed(() => !isLoggedIn.value || userInfo.value.authProvider === 'guest')

function formatDate(value: string) {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei', dateStyle: 'short', timeStyle: 'short', hour12: false,
  }).format(new Date(value))
}

function submitCode() {
  if (isGuest.value) {
    openLogin(route.fullPath)
    return
  }
  receivedPromo.value = null
  const result = preview(codeInput.value)
  error.value = result.error ?? ''
  if (!result.error) pendingPromo.value = result.promo
}

function confirmRedeem() {
  if (!pendingPromo.value) return
  const result = redeem(pendingPromo.value.code)
  if (result.error) {
    error.value = result.error
    return
  }
  receivedPromo.value = pendingPromo.value
  pendingPromo.value = null
  codeInput.value = ''
  error.value = ''
}

function closeConfirm() {
  pendingPromo.value = null
  error.value = ''
}

function productExpiry(promo: PromoCode) {
  if (promo.cardExpiresAt) return `${promo.cardExpiresAt} 23:59（台北時間）`
  if (promo.currency === 'activity-gold') return '第一版僅入帳與顯示，使用及到期規則待後端確認'
  return '入帳後無使用期限（原型）'
}
</script>

<template>
  <section class="promo-code-panel" aria-labelledby="promo-code-title">
    <div class="promo-code-mark" aria-hidden="true">券</div>
    <div class="promo-code-copy">
      <p class="promo-kicker">PROMO CODE</p>
      <h2 id="promo-code-title">優惠碼兌換</h2>
      <p>輸入營運提供的 8 碼優惠碼，查看內容後即可立即領取。</p>
    </div>

    <form class="promo-code-form" @submit.prevent="submitCode">
      <label class="input-label" for="promo-code-input">優惠碼</label>
      <div class="promo-code-input-row">
        <input
          id="promo-code-input"
          v-model="codeInput"
          class="input-field"
          maxlength="8"
          autocomplete="off"
          spellcheck="false"
          placeholder="請輸入 8 碼英數字"
          @input="codeInput = codeInput.toUpperCase(); error = ''; receivedPromo = null"
        />
        <button class="btn-gold" type="submit" :disabled="!codeInput.trim()">兌換</button>
      </div>
      <p v-if="error" class="promo-error" role="alert">{{ error }}</p>
      <p v-else class="promo-hint">每位會員同一優惠碼限領一次；優惠碼與個人邀請碼不同。</p>
    </form>

    <p v-if="isGuest" class="promo-guest-hint">訪客可瀏覽優惠碼介面，請先註冊或登入一般會員後再兌換。</p>

    <section v-if="receivedPromo" class="promo-success" role="status" aria-live="polite">
      <strong>✓ 領取成功</strong>
      <span>{{ PROMO_CURRENCY_LABELS[receivedPromo.currency] }} +{{ receivedPromo.amount.toLocaleString() }}</span>
      <small v-if="receivedPromo.currency === 'activity-silver'">已新增至個人資訊的獎勵卡分頁，啟用後即可使用。</small>
      <small v-else-if="receivedPromo.currency === 'activity-gold'">已加入活動金餘額，目前僅入帳與顯示。</small>
      <small v-else>已立即加入對應錢包，可至交易紀錄查看。</small>
    </section>

    <details class="promo-test-codes">
      <summary>原型測試優惠碼（非正式發放）</summary>
      <div>
        <p v-for="promo in PROMO_CODES" :key="promo.code">
          <code>{{ promo.code }}</code>
          <span>{{ promo.title }}・{{ PROMO_CURRENCY_LABELS[promo.currency] }}</span>
          <em v-if="claimedCodes.includes(promo.code)">已領取</em>
        </p>
      </div>
      <small>測試碼只存在目前瀏覽階段；重新整理後會重置。正式環境將由後台生成與管理。</small>
    </details>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="promo-modal-fade">
          <div v-if="pendingPromo" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="promo-confirm-title" @click.self="closeConfirm">
            <div class="modal-box promo-confirm-modal">
              <div class="modal-inner">
                <button class="modal-close" type="button" aria-label="關閉優惠碼確認" @click="closeConfirm">×</button>
                <p class="promo-kicker">REDEEM OFFER</p>
                <h2 id="promo-confirm-title" class="modal-title">確認優惠碼兌換</h2>
                <div class="promo-confirm-highlight">
                  <span>{{ pendingPromo.title }}</span>
                  <strong>{{ pendingPromo.amount.toLocaleString() }}</strong>
                  <small>{{ PROMO_CURRENCY_LABELS[pendingPromo.currency] }}</small>
                </div>
                <dl class="promo-confirm-details">
                  <div><dt>優惠碼</dt><dd>{{ pendingPromo.code }}</dd></div>
                  <div><dt>可兌換期限（台北時間）</dt><dd>{{ formatDate(pendingPromo.startsAt) }} ～ {{ formatDate(pendingPromo.endsAt) }}</dd></div>
                  <div><dt>商品使用期限</dt><dd>{{ productExpiry(pendingPromo) }}</dd></div>
                  <div v-if="pendingPromo.currency === 'activity-silver'"><dt>獎勵卡規則</dt><dd>流水目標 {{ pendingPromo.turnoverTarget?.toLocaleString() }}・轉換上限 {{ pendingPromo.conversionLimit?.toLocaleString() }}</dd></div>
                </dl>
                <p class="promo-confirm-note">確認後立即領取，取消不會使用優惠碼。</p>
                <p v-if="error" class="promo-error" role="alert">{{ error }}</p>
                <div class="promo-confirm-actions">
                  <button type="button" class="btn-outline-purple" @click="closeConfirm">取消</button>
                  <button type="button" class="btn-gold" @click="confirmRedeem">確認領取</button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </section>
</template>

<style scoped>
.promo-code-panel{display:grid;grid-template-columns:58px minmax(0,1fr);gap:4px 14px;padding:20px;border:1px solid var(--color-border);border-radius:18px;background:linear-gradient(145deg,rgba(245,200,66,.07),rgba(168,85,247,.07)),rgba(26,10,46,.66)}
.promo-code-mark{display:grid;width:52px;height:52px;place-items:center;grid-row:span 2;border:1px solid rgba(245,200,66,.42);border-radius:16px;color:#28120a;background:linear-gradient(145deg,#fde68a,#f5c842);font-size:18px;font-weight:950}
.promo-kicker{margin:0;color:var(--color-gold);font-size:8px;font-weight:900;letter-spacing:.18em}.promo-code-copy h2{margin:3px 0;font-size:20px}.promo-code-copy p:last-child{margin:4px 0 0;color:var(--color-text-muted);font-size:10px;line-height:1.6}
.promo-code-form{grid-column:1/-1;margin-top:12px}.promo-code-input-row{display:flex;gap:8px}.promo-code-input-row .input-field{flex:1;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.13em;text-transform:uppercase}.promo-code-input-row .btn-gold{min-width:94px;justify-content:center}.promo-hint,.promo-guest-hint{margin:7px 0 0;color:var(--color-text-muted);font-size:9px}.promo-error{margin:7px 0 0;color:#fca5a5;font-size:10px;font-weight:800}.promo-guest-hint{grid-column:1/-1;padding-top:8px;border-top:1px solid rgba(255,255,255,.08)}
.promo-success{display:grid;grid-column:1/-1;gap:3px;padding:11px 13px;margin-top:12px;border:1px solid rgba(74,222,128,.28);border-radius:10px;color:#86efac;background:rgba(74,222,128,.08);font-size:11px}.promo-success span{color:#fff;font-weight:900}.promo-success small{color:rgba(255,255,255,.68);font-size:9px}
.promo-test-codes{grid-column:1/-1;padding:10px 12px;margin-top:12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;color:var(--color-text-muted);background:rgba(0,0,0,.12);font-size:9px}.promo-test-codes summary{cursor:pointer;color:var(--color-purple-light);font-weight:800}.promo-test-codes p{display:flex;align-items:center;gap:8px;margin:7px 0}.promo-test-codes code{color:var(--color-text);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em}.promo-test-codes span{flex:1}.promo-test-codes em{color:#86efac;font-style:normal}.promo-test-codes>small{display:block;margin-top:9px;line-height:1.5}
.promo-confirm-modal{max-width:520px}.promo-confirm-modal .modal-inner{position:relative}.promo-confirm-modal .promo-kicker{margin-bottom:4px}.promo-confirm-highlight{display:grid;grid-template-columns:1fr auto auto;align-items:end;gap:8px;padding:14px;margin:14px 0;border:1px solid rgba(245,200,66,.25);border-radius:12px;background:rgba(245,200,66,.07)}.promo-confirm-highlight span{color:var(--color-text-muted);font-size:10px}.promo-confirm-highlight strong{color:var(--color-gold);font-size:24px}.promo-confirm-highlight small{color:var(--color-text-muted);font-size:9px}.promo-confirm-details{display:grid;gap:9px;margin:0}.promo-confirm-details div{display:grid;grid-template-columns:145px 1fr;gap:10px;font-size:10px}.promo-confirm-details dt{color:var(--color-text-muted)}.promo-confirm-details dd{margin:0;color:var(--color-text);text-align:right}.promo-confirm-note{margin:15px 0 0;color:var(--color-text-muted);font-size:9px}.promo-confirm-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:17px}.promo-confirm-actions button{min-width:96px;justify-content:center}.promo-modal-fade-enter-active,.promo-modal-fade-leave-active{transition:opacity .2s}.promo-modal-fade-enter-from,.promo-modal-fade-leave-to{opacity:0}
@media(max-width:520px){.promo-code-panel{grid-template-columns:1fr}.promo-code-mark{grid-row:auto}.promo-code-input-row{flex-direction:column}.promo-code-input-row .btn-gold{width:100%}.promo-confirm-details div{grid-template-columns:1fr;gap:3px}.promo-confirm-details dd{text-align:left}.promo-confirm-highlight{grid-template-columns:1fr auto}.promo-confirm-highlight small{grid-column:2;grid-row:1}}
</style>
