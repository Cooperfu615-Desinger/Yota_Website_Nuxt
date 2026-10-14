<script setup lang="ts">
import { createMockEmailCode, isSixDigitCode, isValidBindingEmail, matchesBindingCode, type AccountBindingRequest } from '~/utils/accountBindings'

const props = withDefaults(defineProps<{ idPrefix?: string }>(), { idPrefix: 'account-' })
const { isLoggedIn, userInfo, completeAccountBinding } = useAppState()
const route = useRoute()
type ContactKind = 'phone' | 'email'
type SocialProvider = 'google' | 'apple' | 'facebook'
interface ContactForm {
  destination: string
  stage: 'destination' | 'code'
  sentTo: string
  code: string
  expectedCode: string
  error: string
  countdown: number
  verifying: boolean
}

const identity = computed(() => `${userInfo.value.id}:${userInfo.value.account}:${userInfo.value.authProvider}`)
const contacts: { kind: ContactKind; label: string; ariaLabel: string }[] = [
  { kind: 'phone', label: '手機號碼', ariaLabel: '手機綁定' },
  { kind: 'email', label: 'Email', ariaLabel: 'Email 綁定' },
]
const socials: { provider: SocialProvider; label: string; mark: string }[] = [
  { provider: 'google', label: 'Google', mark: 'G' },
  { provider: 'apple', label: 'APPLE', mark: 'A' },
  { provider: 'facebook', label: 'FB', mark: 'f' },
]
function freshContact(kind: ContactKind): ContactForm {
  return { destination: userInfo.value[kind] || '', stage: 'destination', sentTo: '', code: '', expectedCode: '', error: '', countdown: 0, verifying: false }
}
const forms = reactive<Record<ContactKind, ContactForm>>({ phone: freshContact('phone'), email: freshContact('email') })
const countdownTimers: Partial<Record<ContactKind, ReturnType<typeof setInterval>>> = {}
const verificationTimers: Partial<Record<ContactKind, ReturnType<typeof setTimeout>>> = {}
const authorization = ref<{ provider: SocialProvider; identity: string } | null>(null)
const notice = ref('')
const noticeElement = ref<HTMLElement | null>(null)
let disposed = false

const inputId = (kind: ContactKind, suffix = '') => `${props.idPrefix}binding-${kind}${suffix}`
const isBound = (kind: ContactKind) => userInfo.value.accountBindings[kind]
const isLegacyEmail = (kind: ContactKind) => kind === 'email' && !!userInfo.value.email && !isBound(kind)

function clearTimers(kind: ContactKind) {
  if (countdownTimers[kind]) clearInterval(countdownTimers[kind])
  if (verificationTimers[kind]) clearTimeout(verificationTimers[kind])
  delete countdownTimers[kind]
  delete verificationTimers[kind]
}

function resetFlows() {
  for (const { kind } of contacts) {
    clearTimers(kind)
    Object.assign(forms[kind], freshContact(kind))
  }
  authorization.value = null
  notice.value = ''
}
watch([identity, isLoggedIn], resetFlows, { flush: 'sync' })
watch(() => route.fullPath, resetFlows, { flush: 'sync' })
onBeforeUnmount(() => {
  disposed = true
  for (const { kind } of contacts) clearTimers(kind)
})

function startCountdown(kind: ContactKind) {
  if (countdownTimers[kind]) clearInterval(countdownTimers[kind])
  forms[kind].countdown = 60
  countdownTimers[kind] = setInterval(() => {
    forms[kind].countdown = Math.max(0, forms[kind].countdown - 1)
    if (!forms[kind].countdown) {
      clearInterval(countdownTimers[kind])
      delete countdownTimers[kind]
    }
  }, 1000)
}

function sendCode(kind: ContactKind, resend = false) {
  const form = forms[kind]
  if (!isLoggedIn.value || isBound(kind) || form.verifying || form.countdown > 0) return
  const target = isLegacyEmail(kind) ? userInfo.value.email.trim() : (resend ? form.sentTo : form.destination.trim())
  if (kind === 'email' ? !isValidBindingEmail(target) : !/^09\d{8}$/.test(target)) {
    form.error = kind === 'email' ? '請輸入有效的 Email 格式' : '請輸入 09 開頭的 10 碼手機號碼'
    return
  }
  form.destination = target
  form.sentTo = target
  form.expectedCode = kind === 'email' ? createMockEmailCode() : '123456'
  form.code = ''
  form.error = ''
  form.stage = 'code'
  startCountdown(kind)
  notice.value = `${kind === 'email' ? 'Email' : '手機'}示範驗證碼已${resend ? '重新' : ''}產生`
}

function updateInput(kind: ContactKind, field: 'destination' | 'code', event: Event) {
  const value = (event.target as HTMLInputElement).value
  forms[kind][field] = field === 'code' ? value.replace(/\D/g, '').slice(0, 6) : kind === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
  forms[kind].error = ''
}

function backToDestination(kind: ContactKind) {
  const form = forms[kind]
  if (form.verifying || isLegacyEmail(kind)) return
  form.stage = 'destination'
  form.code = ''
  form.error = ''
  // Returning to the input does not reset the resend limit.
}

function verifyCode(kind: ContactKind) {
  const form = forms[kind]
  if (!isLoggedIn.value || isBound(kind) || form.verifying || form.stage !== 'code') return
  if (!matchesBindingCode(form.code, form.expectedCode)) {
    form.error = '驗證碼錯誤，請確認後重新輸入'
    return
  }
  form.error = ''
  form.verifying = true
  const expectedIdentity = identity.value
  const request: AccountBindingRequest = { provider: kind, value: form.sentTo }
  verificationTimers[kind] = setTimeout(() => {
    delete verificationTimers[kind]
    if (disposed || !isLoggedIn.value || identity.value !== expectedIdentity) return
    const completed = completeAccountBinding(request, expectedIdentity)
    form.verifying = false
    if (!completed) {
      form.error = '綁定未完成，請重新確認目前帳號與資料'
      return
    }
    clearTimers(kind)
    form.countdown = 0
    form.code = ''
    form.expectedCode = ''
    notice.value = `${kind === 'email' ? 'Email' : '手機號碼'}綁定成功`
  }, 650)
}

function startAuthorization(provider: SocialProvider) {
  if (!isLoggedIn.value || authorization.value || userInfo.value.accountBindings[provider]) return
  authorization.value = { provider, identity: identity.value }
}

function completeAuthorization() {
  const current = authorization.value
  if (!current || disposed || identity.value !== current.identity || !isLoggedIn.value) return
  if (completeAccountBinding({ provider: current.provider }, current.identity)) {
    notice.value = `${socials.find(item => item.provider === current.provider)?.label} 帳號綁定成功`
  }
}

async function closeAuthorization() {
  const provider = authorization.value?.provider
  authorization.value = null
  await nextTick()
  if (disposed) return
  const trigger = provider ? document.getElementById(`${props.idPrefix}binding-${provider}`) : null
  ;(trigger ?? noticeElement.value)?.focus()
}
</script>

<template>
  <div v-if="isLoggedIn" class="account-binding-panel">
    <p v-if="notice" ref="noticeElement" class="binding-notice" role="status" tabindex="-1">{{ notice }}</p>

    <div class="contact-binding-grid">
      <section v-for="contact in contacts" :key="contact.kind" class="account-binding-card" :data-binding-provider="contact.kind" :aria-label="contact.ariaLabel">
        <header class="binding-card-header">
          <span class="binding-provider-mark" aria-hidden="true">
            <svg v-if="contact.kind === 'phone'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="6.5" y="2" width="11" height="20" rx="2.5" /><path d="M10 5h4M11 19h2" /></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="m3 6 9 7 9-7" /></svg>
          </span>
          <h4>{{ contact.label }}</h4>
          <span class="binding-status" :class="{ bound: isBound(contact.kind), pending: isLegacyEmail(contact.kind) }">{{ isBound(contact.kind) ? '已綁定' : isLegacyEmail(contact.kind) ? '待驗證' : '未綁定' }}</span>
        </header>
        <div v-if="isBound(contact.kind)" class="binding-bound-summary"><span aria-hidden="true">✓</span><span>{{ userInfo[contact.kind] }}</span></div>
        <template v-else>
          <p class="binding-card-description">{{ isLegacyEmail(contact.kind) ? '保留原信箱，請完成驗證後綁定。' : contact.kind === 'email' ? '以信箱接收 6 碼驗證碼。' : '以台灣手機接收 6 碼驗證碼。' }}</p>
          <form v-if="forms[contact.kind].stage === 'destination'" class="binding-contact-form" novalidate @submit.prevent="sendCode(contact.kind)">
            <label :for="inputId(contact.kind)">{{ contact.label }}</label>
            <div class="binding-input-action">
              <input
                :id="inputId(contact.kind)" :value="forms[contact.kind].destination" class="input-field"
                :type="contact.kind === 'email' ? 'email' : 'tel'" :inputmode="contact.kind === 'email' ? 'email' : 'numeric'"
                :autocomplete="contact.kind === 'email' ? 'email' : 'tel'" :maxlength="contact.kind === 'phone' ? 10 : undefined"
                :placeholder="contact.kind === 'email' ? 'name@example.com' : '0912345678'" :readonly="isLegacyEmail(contact.kind)"
                :disabled="forms[contact.kind].verifying" :aria-invalid="!!forms[contact.kind].error"
                :aria-describedby="forms[contact.kind].error ? inputId(contact.kind, '-error') : undefined"
                @input="updateInput(contact.kind, 'destination', $event)"
              />
              <button type="submit" class="btn-gold" :disabled="forms[contact.kind].countdown > 0 || forms[contact.kind].verifying" :aria-label="contact.kind === 'email' ? '發送 Email 驗證碼' : '發送手機驗證碼'">{{ forms[contact.kind].countdown > 0 ? `${forms[contact.kind].countdown} 秒後發送` : '發送驗證碼' }}</button>
            </div>
          </form>
          <form v-else class="binding-contact-form" novalidate @submit.prevent="verifyCode(contact.kind)">
            <p class="binding-sent-to">已發送至 {{ forms[contact.kind].sentTo }}</p>
            <label :for="inputId(contact.kind, '-code')">驗證碼</label>
            <div class="binding-input-action">
              <input
                :id="inputId(contact.kind, '-code')" :value="forms[contact.kind].code" class="input-field binding-code-input"
                type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 碼數字"
                :disabled="forms[contact.kind].verifying" :aria-invalid="!!forms[contact.kind].error"
                :aria-describedby="forms[contact.kind].error ? inputId(contact.kind, '-error') : inputId(contact.kind, '-demo')"
                @input="updateInput(contact.kind, 'code', $event)"
              />
              <button type="submit" class="btn-gold" :disabled="forms[contact.kind].verifying || !isSixDigitCode(forms[contact.kind].code)" :aria-label="contact.kind === 'email' ? '確認 Email 綁定' : '確認手機綁定'">{{ forms[contact.kind].verifying ? '驗證中…' : '確認綁定' }}</button>
            </div>
            <div class="binding-code-actions">
              <button v-if="!isLegacyEmail(contact.kind)" type="button" :disabled="forms[contact.kind].verifying" @click="backToDestination(contact.kind)">修改{{ contact.label }}</button>
              <button type="button" :disabled="forms[contact.kind].countdown > 0 || forms[contact.kind].verifying" @click="sendCode(contact.kind, true)">{{ forms[contact.kind].countdown > 0 ? `${forms[contact.kind].countdown} 秒後可重發` : '重新發送驗證碼' }}</button>
            </div>
            <p :id="inputId(contact.kind, '-demo')" class="binding-demo-code">示範驗證碼：<strong>{{ forms[contact.kind].expectedCode }}</strong>（不傳送）</p>
          </form>
          <p v-if="isLegacyEmail(contact.kind)" class="binding-legacy-hint">舊資料信箱不提供更換；更正請洽客服。</p>
          <p v-if="forms[contact.kind].error" :id="inputId(contact.kind, '-error')" class="binding-error" role="alert">{{ forms[contact.kind].error }}</p>
        </template>
      </section>
    </div>

    <div class="social-binding-grid">
      <section v-for="social in socials" :key="social.provider" class="account-binding-card" :data-binding-provider="social.provider" :aria-label="`${social.label} 綁定`">
        <header class="binding-card-header">
          <span class="binding-provider-mark" :class="`binding-provider-${social.provider}`" aria-hidden="true">
            <svg v-if="social.provider === 'apple'" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 3.2c-.9.1-2 .7-2.6 1.4-.6.7-1.1 1.6-1 2.5 1 .1 2-.5 2.6-1.2.6-.7 1-1.7 1-2.7ZM19.1 17.4c-.4.9-.7 1.3-1.3 2.1-.8 1.1-1.9 2.4-3.2 2.4-1.2 0-1.5-.7-3.1-.7s-2 .7-3.2.8c-1.2 0-2.3-1.2-3.1-2.3-2.2-3.1-2.4-6.6-1-8.5 1-1.4 2.5-2.2 3.9-2.2 1.4 0 2.3.7 3.4.7 1 0 1.6-.7 3.3-.8 1.2-.1 2.6.5 3.5 1.6-3.1 1.7-2.6 6.1.8 6.9Z" /></svg>
            <template v-else>{{ social.mark }}</template>
          </span>
          <h4>{{ social.label }}</h4>
          <span class="binding-status" :class="{ bound: userInfo.accountBindings[social.provider] }">{{ userInfo.accountBindings[social.provider] ? '已綁定' : '未綁定' }}</span>
        </header>
        <div v-if="userInfo.accountBindings[social.provider]" class="binding-bound-summary"><span aria-hidden="true">✓</span><span>{{ social.label }} 帳號已連結</span></div>
        <template v-else>
          <p class="binding-card-description">授權後綁定目前帳號。</p>
          <button :id="`${props.idPrefix}binding-${social.provider}`" type="button" class="btn-gold binding-social-button" :disabled="!!authorization" :aria-label="`開始綁定 ${social.label}`" @click="startAuthorization(social.provider)">開始綁定</button>
        </template>
      </section>
    </div>
    <p class="binding-prototype-note">原型只模擬驗證與授權，不寄送簡訊／郵件，也不連線官方帳號；完成的綁定隨登入資料保存。</p>
    <SocialAuthorizationDialog v-if="authorization" :key="`${authorization.identity}:${authorization.provider}`" :provider="authorization.provider" mode="binding" @complete="completeAuthorization" @close="closeAuthorization" />
  </div>
</template>

<style scoped>
.account-binding-panel { min-width:0; color:var(--color-text); }
.contact-binding-grid,.social-binding-grid { display:grid; gap:12px; align-items:stretch; }
.contact-binding-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
.social-binding-grid { grid-template-columns:repeat(3,minmax(0,1fr)); margin-top:12px; }
.account-binding-card { min-width:0; padding:16px; border:1px solid var(--color-border); border-radius:16px; background:rgba(15,0,32,.38); }
.binding-card-header { display:flex; align-items:center; gap:8px; min-width:0; }
.binding-card-header h4 { flex:1; min-width:0; margin:0; font-size:15px; font-weight:800; }
.binding-provider-mark { display:grid; place-items:center; width:34px; height:34px; flex-shrink:0; border:1px solid var(--color-border); border-radius:10px; color:var(--color-purple-light); background:rgba(168,85,247,.12); font-size:20px; font-weight:900; }
.binding-provider-mark svg { width:21px; height:21px; }
.binding-provider-google { color:#fff; background:#b9332b; border-color:rgba(234,67,53,.4); }
.binding-provider-apple { color:#fff; background:#34303e; border-color:rgba(255,255,255,.25); }
.binding-provider-facebook { color:#fff; background:#1877f2; border-color:rgba(70,156,255,.5); }
.binding-status { flex-shrink:0; padding:4px 7px; border:1px solid rgba(255,255,255,.12); border-radius:99px; color:var(--color-text-muted); background:rgba(255,255,255,.04); font-size:11px; font-weight:700; }
.binding-status.bound { color:#b0f3c7; border-color:rgba(74,222,128,.25); background:rgba(74,222,128,.1); }
.binding-status.pending { color:#f5d67d; border-color:rgba(245,200,66,.25); background:rgba(245,200,66,.08); }
.binding-card-description { margin:13px 0 10px; color:var(--color-text-muted); font-size:12px; line-height:1.7; }
.binding-contact-form label { display:block; margin-bottom:6px; color:var(--color-text); font-size:12px; font-weight:700; }
.binding-input-action { display:flex; align-items:stretch; gap:8px; }
.binding-input-action .input-field { min-width:0; flex:1; padding:10px; font-size:13px; }
.binding-input-action .btn-gold { flex-shrink:0; justify-content:center; padding:10px 12px; font-size:12px; }
.binding-input-action input[readonly] { color:var(--color-text-muted); background:rgba(255,255,255,.03); }
.binding-code-input { letter-spacing:.14em; }
.binding-sent-to { margin:0 0 10px; color:var(--color-text-muted); overflow-wrap:anywhere; font-size:12px; line-height:1.6; }
.binding-code-actions { display:flex; align-items:center; flex-wrap:wrap; justify-content:space-between; gap:8px; margin-top:10px; }
.binding-code-actions button { color:var(--color-purple-light); padding:4px 0; font-size:12px; }
.binding-code-actions button:last-child { margin-left:auto; }
.account-binding-panel button:disabled { cursor:not-allowed; opacity:.5; transform:none; }
.binding-demo-code,.binding-legacy-hint { margin:9px 0 0; color:var(--color-text-muted); font-size:11px; line-height:1.7; }
.binding-demo-code strong { color:var(--color-gold); font-variant-numeric:tabular-nums; letter-spacing:.12em; }
.binding-bound-summary { display:flex; gap:8px; min-width:0; padding:12px; margin-top:14px; border:1px solid rgba(74,222,128,.2); border-radius:11px; color:#b0f3c7; background:rgba(74,222,128,.07); font-size:13px; line-height:1.6; }
.binding-bound-summary>span:last-child { min-width:0; overflow-wrap:anywhere; }
.binding-social-button { justify-content:center; width:100%; padding:10px; font-size:13px; }
.binding-notice { padding:10px 12px; margin:0 0 12px; border:1px solid rgba(245,200,66,.24); border-radius:10px; color:var(--color-gold); background:rgba(245,200,66,.08); font-size:13px; line-height:1.6; }
.binding-error { margin:9px 0 0; color:#fca5a5; font-size:12px; line-height:1.6; }
.binding-prototype-note { margin:14px 0 0; padding:12px; border:1px solid var(--color-border); border-radius:12px; color:var(--color-text-muted); background:rgba(168,85,247,.05); font-size:11px; line-height:1.8; }
@media(max-width:1050px) { .binding-input-action { flex-direction:column; }.binding-input-action .btn-gold { width:100%; }.account-binding-card { padding:14px; }.binding-card-header { flex-wrap:wrap; }.binding-status { margin-left:auto; } }
@media(max-width:640px) { .contact-binding-grid,.social-binding-grid { grid-template-columns:minmax(0,1fr); }.binding-input-action .input-field { font-size:16px; }.binding-card-header { flex-wrap:nowrap; } }
</style>
