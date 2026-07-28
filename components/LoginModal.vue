<script setup lang="ts">
import type { Ref } from 'vue'
import { getAccountValidationError, isAccountValid } from '~/utils/account'

type Provider = 'facebook' | 'line' | 'apple' | 'google'
type ModalView = 'login' | 'register' | 'social' | 'forgot'
type AuthStage = 'idle' | 'connecting' | 'confirm' | 'logging-in' | 'success'
type RecoveryStep = 'account' | 'phone' | 'code' | 'password' | 'social' | 'unbound' | 'success'
type SocialSource = 'login' | 'recovery'

const {
  showLoginModal,
  loginTab,
  closeLogin,
  login,
  consumeProtectedDestination,
} = useAppState()
const { openLegal, lastReviewedDocument } = useLegalState()
const router = useRouter()

const modalView = ref<ModalView>('login')
const authStage = ref<AuthStage>('idle')
const activeProvider = ref<Provider | null>(null)
const socialSource = ref<SocialSource>('login')
const phoneStep = ref<'phone' | 'code'>('phone')
const recoveryStep = ref<RecoveryStep>('account')
const recoveryProvider = ref<Provider | null>(null)
const recoveryMaskedPhone = ref('0912***888')
const termsReviewed = ref(false)
const errorMessage = ref('')
const loading = ref(false)

const form = reactive({ account: '', password: '', phone: '', code: '' })
const regForm = reactive({ account: '', nickname: '', password: '', confirmPassword: '', referralCode: '' })
const recoveryForm = reactive({ account: '', code: '', password: '', confirmPassword: '' })
const resetCredential = ref<{ account: string; password: string } | null>(null)
const recoveryAccountInput = ref<HTMLInputElement | null>(null)
const recoveryCodeInput = ref<HTMLInputElement | null>(null)
const recoveryPasswordInput = ref<HTMLInputElement | null>(null)
const recoveryPrimaryAction = ref<HTMLButtonElement | null>(null)

const providerInfo: Record<Provider, { label: string; short: string; className: string }> = {
  line: { label: 'LINE', short: 'L', className: 'social-line' },
  facebook: { label: 'Facebook', short: 'f', className: 'social-facebook' },
  apple: { label: 'Apple', short: '●', className: 'social-apple' },
  google: { label: 'Google', short: 'G', className: 'social-google' },
}

const referralValid = computed(() =>
  regForm.referralCode === '' || /^[A-Z0-9]{6}$/.test(regForm.referralCode) || /^[A-Z0-9]{8}$/.test(regForm.referralCode)
)

const canRegister = computed(() =>
  isAccountValid(regForm.account) &&
  regForm.nickname.length >= 2 &&
  regForm.password.length >= 6 &&
  regForm.password === regForm.confirmPassword &&
  referralValid.value &&
  termsReviewed.value
)

const recoveryProgress = computed(() => {
  if (recoveryStep.value === 'success') return 4
  if (recoveryStep.value === 'phone' || recoveryStep.value === 'code') return 2
  if (recoveryStep.value === 'password') return 3
  return 1
})

const registrationAccountError = computed(() =>
  regForm.account ? getAccountValidationError(regForm.account) : ''
)

const recoveryPasswordError = computed(() => {
  if (recoveryForm.password && recoveryForm.password.length < 6) return '新密碼至少需要 6 個字元'
  if (
    recoveryForm.confirmPassword &&
    recoveryForm.password !== recoveryForm.confirmPassword
  ) return '兩次輸入的新密碼不一致'
  return ''
})

const canResetPassword = computed(() =>
  recoveryForm.password.length >= 6 &&
  recoveryForm.password === recoveryForm.confirmPassword
)

const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null
let recoveryOperationId = 0

watch(lastReviewedDocument, document => {
  if (document === 'terms') termsReviewed.value = true
})

watch(showLoginModal, visible => {
  if (visible) return
  recoveryOperationId += 1
  stopCountdown()
  modalView.value = 'login'
  authStage.value = 'idle'
  activeProvider.value = null
  socialSource.value = 'login'
  phoneStep.value = 'phone'
  resetRecoveryState()
  loading.value = false
  errorMessage.value = ''
})

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function focusRecoveryTarget<T extends HTMLElement>(target: Ref<T | null>) {
  await nextTick()
  target.value?.focus()
}

function stopCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = null
  countdown.value = 0
}

function startCountdown() {
  stopCountdown()
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) stopCountdown()
  }, 1000)
}

function resetRecoveryState(account = '') {
  recoveryStep.value = 'account'
  recoveryProvider.value = null
  recoveryMaskedPhone.value = '0912***888'
  Object.assign(recoveryForm, {
    account,
    code: '',
    password: '',
    confirmPassword: '',
  })
}

function onReferralInput(event: Event) {
  regForm.referralCode = (event.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function finishLogin(
  name: string | undefined,
  provider: Parameters<typeof login>[1],
  account?: string,
) {
  login(name, provider, false, account)
  authStage.value = 'success'
  window.setTimeout(() => {
    closeLogin()
    const destination = consumeProtectedDestination()
    if (destination) router.push(destination)
  }, 650)
}

async function handleAccountLogin() {
  errorMessage.value = ''
  const accountError = getAccountValidationError(form.account)
  if (accountError) {
    errorMessage.value = accountError
    return
  }
  const reset = resetCredential.value
  if (
    reset &&
    form.account.trim().toLowerCase() === reset.account.toLowerCase() &&
    form.password !== reset.password
  ) {
    errorMessage.value = '密碼不正確，請輸入剛完成重設的新密碼'
    return
  }
  loading.value = true
  authStage.value = 'logging-in'
  await delay(900)
  finishLogin(form.account.trim() || undefined, 'account', form.account.trim())
  loading.value = false
}

async function handleGuestLogin() {
  loading.value = true
  authStage.value = 'logging-in'
  await delay(650)
  finishLogin(`訪客${Math.floor(1000 + Math.random() * 9000)}`, 'guest')
  loading.value = false
}

function sendCode() {
  errorMessage.value = ''
  if (!/^09\d{8}$/.test(form.phone)) {
    errorMessage.value = '請輸入正確的 10 碼手機號碼'
    return
  }
  phoneStep.value = 'code'
  startCountdown()
}

async function verifyPhone() {
  errorMessage.value = ''
  if (form.code !== '123456') {
    errorMessage.value = 'Mock 驗證碼為 123456'
    return
  }
  loading.value = true
  authStage.value = 'logging-in'
  await delay(850)
  finishLogin(`手機玩家${form.phone.slice(-4)}`, 'phone')
  loading.value = false
}

async function startSocialLogin(provider: Provider, source: SocialSource = 'login') {
  activeProvider.value = provider
  socialSource.value = source
  modalView.value = 'social'
  authStage.value = 'connecting'
  await delay(700)
  authStage.value = 'confirm'
}

async function confirmSocialLogin() {
  if (!activeProvider.value) return
  authStage.value = 'logging-in'
  await delay(900)
  const provider = activeProvider.value
  finishLogin(`${providerInfo[provider].label}玩家`, provider)
}

async function cancelSocialLogin() {
  const shouldReturnToRecovery = socialSource.value === 'recovery'
  modalView.value = shouldReturnToRecovery ? 'forgot' : 'login'
  if (shouldReturnToRecovery) recoveryStep.value = 'social'
  authStage.value = 'idle'
  activeProvider.value = null
  socialSource.value = 'login'
  if (shouldReturnToRecovery) await focusRecoveryTarget(recoveryPrimaryAction)
}

async function openForgotPassword() {
  recoveryOperationId += 1
  stopCountdown()
  resetRecoveryState(form.account.trim())
  modalView.value = 'forgot'
  authStage.value = 'idle'
  loading.value = false
  errorMessage.value = ''
  await focusRecoveryTarget(recoveryAccountInput)
}

function returnToLogin() {
  if (loading.value) return
  recoveryOperationId += 1
  stopCountdown()
  form.account = recoveryForm.account.trim()
  form.password = ''
  loginTab.value = 'account'
  modalView.value = 'login'
  authStage.value = 'idle'
  errorMessage.value = ''
  resetRecoveryState(form.account)
}

async function identifyRecoveryAccount() {
  errorMessage.value = ''
  const account = recoveryForm.account
  const accountError = getAccountValidationError(account)
  if (accountError) {
    errorMessage.value = accountError
    return
  }

  const operationId = ++recoveryOperationId
  loading.value = true
  await delay(500)
  if (
    operationId !== recoveryOperationId ||
    !showLoginModal.value ||
    modalView.value !== 'forgot'
  ) return
  loading.value = false
  recoveryForm.account = account

  const normalizedAccount = account.toLowerCase()
  if (normalizedAccount === 'line888') {
    recoveryProvider.value = 'line'
    recoveryStep.value = 'social'
    await focusRecoveryTarget(recoveryPrimaryAction)
    return
  }
  if (normalizedAccount === 'unbound888') {
    recoveryStep.value = 'unbound'
    await focusRecoveryTarget(recoveryPrimaryAction)
    return
  }

  recoveryMaskedPhone.value = '0912***888'
  recoveryStep.value = 'phone'
  await focusRecoveryTarget(recoveryPrimaryAction)
}

async function showRecoveryAccountStep() {
  stopCountdown()
  recoveryStep.value = 'account'
  errorMessage.value = ''
  await focusRecoveryTarget(recoveryAccountInput)
}

async function sendRecoveryCode() {
  errorMessage.value = ''
  recoveryForm.code = ''
  recoveryStep.value = 'code'
  startCountdown()
  await focusRecoveryTarget(recoveryCodeInput)
}

async function showRecoveryPhoneStep() {
  stopCountdown()
  recoveryStep.value = 'phone'
  errorMessage.value = ''
  await focusRecoveryTarget(recoveryPrimaryAction)
}

async function verifyRecoveryCode() {
  errorMessage.value = ''
  if (recoveryForm.code !== '123456') {
    errorMessage.value = '驗證碼不正確，原型測試驗證碼為 123456'
    return
  }
  stopCountdown()
  recoveryStep.value = 'password'
  await focusRecoveryTarget(recoveryPasswordInput)
}

async function submitPasswordReset() {
  errorMessage.value = ''
  if (recoveryForm.password.length < 6) {
    errorMessage.value = '新密碼至少需要 6 個字元'
    return
  }
  if (recoveryForm.password !== recoveryForm.confirmPassword) {
    errorMessage.value = '兩次輸入的新密碼不一致'
    return
  }

  const operationId = ++recoveryOperationId
  const resetAccount = recoveryForm.account
  const resetPassword = recoveryForm.password
  loading.value = true
  await delay(850)
  if (
    operationId !== recoveryOperationId ||
    !showLoginModal.value ||
    modalView.value !== 'forgot' ||
    recoveryStep.value !== 'password'
  ) return
  resetCredential.value = {
    account: resetAccount,
    password: resetPassword,
  }
  loading.value = false
  recoveryStep.value = 'success'
  await focusRecoveryTarget(recoveryPrimaryAction)
}

function continueWithRecoveryProvider() {
  if (!recoveryProvider.value) return
  form.account = recoveryForm.account
  startSocialLogin(recoveryProvider.value, 'recovery')
}

function goToSupport() {
  consumeProtectedDestination()
  closeLogin()
  router.push('/support')
}

async function handleRegister() {
  errorMessage.value = ''
  if (!canRegister.value) {
    errorMessage.value = termsReviewed.value ? '請確認所有必填資料' : '請先完成會員條款審閱'
    return
  }
  loading.value = true
  authStage.value = 'logging-in'
  await delay(1000)
  finishLogin(regForm.nickname.trim(), 'account', regForm.account.trim())
  loading.value = false
}

onUnmounted(() => {
  stopCountdown()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showLoginModal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" @click.self="closeLogin">
        <div class="modal-box auth-modal-box">
          <div class="modal-inner auth-modal-inner">
            <button class="modal-close" aria-label="關閉" @click="closeLogin">×</button>

            <div v-if="authStage === 'logging-in' || authStage === 'success'" class="auth-state-card" aria-live="polite">
              <div v-if="authStage === 'logging-in'" class="auth-spinner" />
              <div v-else class="auth-success">✓</div>
              <strong id="auth-modal-title">{{ authStage === 'success' ? '登入成功' : '正在建立安全連線' }}</strong>
              <span>{{ authStage === 'success' ? '即將返回原本的操作' : '這是前端 Mock，不會傳送真實帳密' }}</span>
            </div>

            <template v-else-if="modalView === 'social' && activeProvider">
              <p class="auth-eyebrow">SOCIAL SIGN IN</p>
              <h2 id="auth-modal-title" class="modal-title">{{ providerInfo[activeProvider].label }} 登入</h2>
              <div class="social-confirm-card" :class="providerInfo[activeProvider].className">
                <div class="social-confirm-logo">{{ providerInfo[activeProvider].short }}</div>
                <template v-if="authStage === 'connecting'">
                  <div class="auth-spinner" />
                  <strong>正在連線至 {{ providerInfo[activeProvider].label }}</strong>
                  <span>請稍候片刻</span>
                </template>
                <template v-else>
                  <strong>允許巨亨 ONLINE 使用此帳號登入？</strong>
                  <span>將建立示範帳號，不會取得真實社群資料。</span>
                </template>
              </div>
              <div v-if="authStage === 'confirm'" class="auth-actions">
                <button type="button" class="btn-outline-purple" @click="cancelSocialLogin">取消</button>
                <button type="button" class="btn-gold" @click="confirmSocialLogin">允許並繼續</button>
              </div>
            </template>

            <template v-else-if="modalView === 'login'">
              <p class="auth-eyebrow">WELCOME BACK</p>
              <h2 id="auth-modal-title" class="modal-title">會員登入</h2>

              <div class="login-tab-bar mb-5">
                <button class="login-tab-btn" :class="{ active: loginTab === 'account' }" @click="loginTab = 'account'; errorMessage = ''">帳號密碼</button>
                <button class="login-tab-btn" :class="{ active: loginTab === 'phone' }" @click="loginTab = 'phone'; errorMessage = ''">手機驗證碼</button>
              </div>

              <form v-if="loginTab === 'account'" class="auth-form" @submit.prevent="handleAccountLogin">
                <label class="input-label" for="login-account">帳號</label>
                <input id="login-account" v-model="form.account" class="input-field" autocomplete="username" maxlength="20" placeholder="請輸入帳號" required />
                <label class="input-label" for="login-password">密碼</label>
                <input id="login-password" v-model="form.password" type="password" class="input-field" autocomplete="current-password" placeholder="請輸入密碼" required />
                <button type="submit" class="btn-gold auth-submit" :disabled="loading">登入</button>
              </form>

              <form v-else class="auth-form" @submit.prevent="phoneStep === 'phone' ? sendCode() : verifyPhone()">
                <label class="input-label" for="login-phone">手機號碼</label>
                <input id="login-phone" v-model="form.phone" type="tel" class="input-field" autocomplete="tel" placeholder="09xxxxxxxx" :disabled="phoneStep === 'code'" required />
                <template v-if="phoneStep === 'code'">
                  <div class="auth-code-heading">
                    <label class="input-label" for="login-code">驗證碼</label>
                    <button type="button" :disabled="countdown > 0" @click="sendCode">{{ countdown > 0 ? `${countdown}s 後重發` : '重新發送' }}</button>
                  </div>
                  <input id="login-code" v-model="form.code" inputmode="numeric" maxlength="6" class="input-field auth-code-input" placeholder="000000" required />
                  <p class="auth-helper">原型測試驗證碼：123456</p>
                </template>
                <button type="submit" class="btn-gold auth-submit">{{ phoneStep === 'phone' ? '發送驗證碼' : '驗證並登入' }}</button>
              </form>

              <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>
              <div class="auth-switch auth-switch-row auth-login-switch">
                <span>還沒有帳號？<button type="button" @click="modalView = 'register'; errorMessage = ''">立即註冊</button></span>
                <span v-if="loginTab === 'account'" class="auth-switch-divider" aria-hidden="true" />
                <button v-if="loginTab === 'account'" type="button" @click="openForgotPassword">忘記密碼</button>
              </div>

              <div class="auth-divider"><span>或使用其他方式</span></div>
              <button type="button" class="guest-login" @click="handleGuestLogin">以訪客身份快速進入</button>

              <div class="social-grid" aria-label="社群登入">
                <button v-for="provider in (Object.keys(providerInfo) as Provider[])" :key="provider" type="button" class="social-pill" :class="providerInfo[provider].className" @click="startSocialLogin(provider)">
                  <span>{{ providerInfo[provider].short }}</span>{{ providerInfo[provider].label }}
                </button>
              </div>

              <p class="auth-legal-line">登入即代表同意
                <button type="button" @click="openLegal('terms')">會員條款</button>、
                <button type="button" @click="openLegal('privacy')">隱私政策</button>
              </p>
            </template>

            <template v-else-if="modalView === 'forgot'">
              <p class="auth-eyebrow">ACCOUNT RECOVERY</p>
              <h2 id="auth-modal-title" class="modal-title">忘記密碼</h2>

              <div v-if="recoveryStep !== 'social' && recoveryStep !== 'unbound'" class="recovery-progress" aria-label="密碼重設進度">
                <div v-for="(label, index) in ['確認帳號', '手機驗證', '設定密碼']" :key="label" :class="{ active: recoveryProgress === index + 1, done: recoveryProgress > index + 1 }">
                  <span>{{ recoveryProgress > index + 1 ? '✓' : index + 1 }}</span>
                  <small>{{ label }}</small>
                </div>
              </div>

              <form v-if="recoveryStep === 'account'" class="auth-form" @submit.prevent="identifyRecoveryAccount">
                <label class="input-label" for="recovery-account">帳號</label>
                <input
                  id="recovery-account"
                  ref="recoveryAccountInput"
                  v-model="recoveryForm.account"
                  class="input-field"
                  autocomplete="username"
                  maxlength="20"
                  placeholder="請輸入需要重設密碼的帳號"
                  required
                />
                <p class="auth-helper">中英文與數字，最多 20 個半形字元；資料正確後將使用綁定手機驗證。</p>
                <div class="recovery-demo-note">
                  <strong>原型分支測試</strong>
                  <span><b>line888</b>：社群帳號　<b>unbound888</b>：未綁手機</span>
                </div>
                <button type="submit" class="btn-gold auth-submit" :disabled="loading">{{ loading ? '正在查詢…' : '下一步' }}</button>
              </form>

              <div v-else-if="recoveryStep === 'phone'" class="recovery-state-card">
                <div class="recovery-phone-mark" aria-hidden="true">09</div>
                <strong>使用綁定手機驗證</strong>
                <p>驗證碼將傳送至 <b>{{ recoveryMaskedPhone }}</b></p>
                <p class="recovery-security-copy">為保護帳號安全，我們不會顯示完整手機號碼。</p>
                <div class="auth-actions">
                  <button type="button" class="btn-outline-purple" @click="showRecoveryAccountStep">返回修改</button>
                  <button ref="recoveryPrimaryAction" type="button" class="btn-gold" @click="sendRecoveryCode">發送驗證碼</button>
                </div>
              </div>

              <form v-else-if="recoveryStep === 'code'" class="auth-form" @submit.prevent="verifyRecoveryCode">
                <div class="auth-code-heading">
                  <label class="input-label" for="recovery-code">手機驗證碼</label>
                  <button type="button" :disabled="countdown > 0" @click="sendRecoveryCode">{{ countdown > 0 ? `${countdown}s 後重發` : '重新發送' }}</button>
                </div>
                <input
                  id="recovery-code"
                  ref="recoveryCodeInput"
                  v-model="recoveryForm.code"
                  class="input-field auth-code-input"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  maxlength="6"
                  placeholder="000000"
                  required
                />
                <p class="auth-helper">原型測試驗證碼：123456</p>
                <div class="auth-actions">
                  <button type="button" class="btn-outline-purple" @click="showRecoveryPhoneStep">上一步</button>
                  <button type="submit" class="btn-gold">驗證並繼續</button>
                </div>
              </form>

              <form v-else-if="recoveryStep === 'password'" class="auth-form" @submit.prevent="submitPasswordReset">
                <label class="input-label" for="recovery-password">新密碼</label>
                <input
                  id="recovery-password"
                  ref="recoveryPasswordInput"
                  v-model="recoveryForm.password"
                  type="password"
                  class="input-field"
                  autocomplete="new-password"
                  minlength="6"
                  placeholder="至少 6 個字元"
                  required
                />
                <label class="input-label" for="recovery-confirm-password">確認新密碼</label>
                <input
                  id="recovery-confirm-password"
                  v-model="recoveryForm.confirmPassword"
                  type="password"
                  class="input-field"
                  autocomplete="new-password"
                  placeholder="再次輸入新密碼"
                  required
                />
                <p class="auth-helper">新密碼規則與註冊密碼相同。</p>
                <p v-if="recoveryPasswordError" class="auth-error" role="alert">{{ recoveryPasswordError }}</p>
                <button type="submit" class="btn-gold auth-submit" :disabled="!canResetPassword || loading">{{ loading ? '正在重設…' : '確認重設密碼' }}</button>
              </form>

              <div v-else-if="recoveryStep === 'social'" class="recovery-state-card recovery-branch-card" aria-live="polite">
                <div class="recovery-branch-mark">L</div>
                <strong>此帳號使用社群方式登入</strong>
                <p>社群登入帳號沒有平台密碼，請使用原本的 {{ recoveryProvider ? providerInfo[recoveryProvider].label : '社群帳號' }} 繼續。</p>
                <button ref="recoveryPrimaryAction" type="button" class="btn-gold recovery-wide-action" @click="continueWithRecoveryProvider">使用 {{ recoveryProvider ? providerInfo[recoveryProvider].label : '社群帳號' }} 登入</button>
              </div>

              <div v-else-if="recoveryStep === 'unbound'" class="recovery-state-card recovery-branch-card" aria-live="polite">
                <div class="recovery-branch-mark recovery-help-mark">?</div>
                <strong>此帳號尚未綁定手機</strong>
                <p>目前無法自助重設密碼，客服將協助確認帳號持有者身分。</p>
                <button ref="recoveryPrimaryAction" type="button" class="btn-gold recovery-wide-action" @click="goToSupport">前往客服中心</button>
              </div>

              <div v-else class="recovery-state-card recovery-success-card" aria-live="polite">
                <div class="auth-success">✓</div>
                <strong>密碼重設成功</strong>
                <p>請返回登入頁，使用新密碼登入 <b>{{ recoveryForm.account }}</b>。</p>
                <button ref="recoveryPrimaryAction" type="button" class="btn-gold recovery-wide-action" @click="returnToLogin">返回登入</button>
              </div>

              <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>
              <p v-if="recoveryStep !== 'success'" class="auth-switch"><button type="button" :disabled="loading" @click="returnToLogin">返回會員登入</button></p>
            </template>

            <template v-else>
              <p class="auth-eyebrow">CREATE ACCOUNT</p>
              <h2 id="auth-modal-title" class="modal-title">建立帳號</h2>
              <form class="auth-form auth-register-form" @submit.prevent="handleRegister">
                <label class="input-label" for="reg-account">帳號</label>
                <input id="reg-account" v-model="regForm.account" class="input-field" maxlength="20" placeholder="中英文與數字，最多 20 個半形字元" required />
                <label class="input-label" for="reg-nickname">暱稱</label>
                <input id="reg-nickname" v-model="regForm.nickname" class="input-field" minlength="2" maxlength="12" placeholder="顯示給其他玩家" required />
                <div class="auth-two-column">
                  <div>
                    <label class="input-label" for="reg-password">密碼</label>
                    <input id="reg-password" v-model="regForm.password" type="password" class="input-field" minlength="6" placeholder="至少 6 字元" required />
                  </div>
                  <div>
                    <label class="input-label" for="reg-confirm">確認密碼</label>
                    <input id="reg-confirm" v-model="regForm.confirmPassword" type="password" class="input-field" placeholder="再次輸入" required />
                  </div>
                </div>
                <label class="input-label" for="reg-referral">推廣碼（選填）</label>
                <input id="reg-referral" :value="regForm.referralCode" class="input-field" maxlength="8" placeholder="代理 6 碼／玩家 8 碼" @input="onReferralInput" />

                <button type="button" class="terms-review-card" :class="{ reviewed: termsReviewed }" @click="openLegal('terms')">
                  <span>{{ termsReviewed ? '✓' : '01' }}</span>
                  <div><strong>{{ termsReviewed ? '會員條款已完成審閱' : '請先審閱會員條款' }}</strong><small>{{ termsReviewed ? '可繼續完成註冊' : '點擊開啟完整條款內容' }}</small></div>
                  <b>›</b>
                </button>

                <p v-if="registrationAccountError" class="auth-error">{{ registrationAccountError }}</p>
                <p v-else-if="regForm.confirmPassword && regForm.password !== regForm.confirmPassword" class="auth-error">兩次密碼不一致</p>
                <p v-else-if="!referralValid" class="auth-error">推廣碼須為大寫英數 6 碼或 8 碼</p>
                <p v-else-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

                <button type="submit" class="btn-gold auth-submit" :disabled="!canRegister || loading">完成註冊</button>
              </form>
              <p class="auth-switch">已有帳號？<button type="button" @click="modalView = 'login'; errorMessage = ''">返回登入</button></p>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .25s}.modal-fade-enter-from,.modal-fade-leave-to{opacity:0}
.auth-modal-box{width:min(560px,calc(100vw - 28px))}.auth-modal-inner{max-height:min(780px,92dvh);overflow:auto;padding:32px}.auth-eyebrow{margin:0 0 4px;text-align:center;color:var(--color-gold);font-size:10px;font-weight:900;letter-spacing:.22em}
.auth-form{display:flex;flex-direction:column;gap:9px}.auth-form .input-label{margin-top:4px}.auth-submit{width:100%;justify-content:center;margin-top:7px}.auth-two-column{display:grid;grid-template-columns:1fr 1fr;gap:10px}.auth-error{margin:5px 0 0;color:#fca5a5;font-size:12px;text-align:center}.auth-helper{margin:-4px 0 2px;color:rgba(255,255,255,.45);font-size:11px}.auth-code-heading{display:flex;align-items:center;justify-content:space-between;margin-top:4px}.auth-code-heading button{border:0;color:var(--color-purple-light);background:none;font-size:11px}.auth-code-input{font-size:21px;letter-spacing:.35em;text-align:center}
.auth-divider{display:flex;align-items:center;gap:12px;margin:18px 0 12px;color:rgba(255,255,255,.45);font-size:11px}.auth-divider::before,.auth-divider::after{content:"";height:1px;flex:1;background:rgba(168,85,247,.22)}.guest-login{width:100%;padding:11px;border:1px solid rgba(245,200,66,.35);border-radius:12px;color:var(--color-gold);background:rgba(245,200,66,.08);font-size:13px;font-weight:800}
.social-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.social-pill{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#fff;background:rgba(255,255,255,.06);font-size:12px;font-weight:800}.social-pill span{display:grid;width:24px;height:24px;place-items:center;border-radius:7px;background:rgba(255,255,255,.14);font-weight:900}.social-pill:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.3)}.social-line{--social:#06c755}.social-facebook{--social:#1877f2}.social-apple{--social:#777}.social-google{--social:#ea4335}.social-pill[class*="social-"] span{background:var(--social)}
.auth-legal-line,.auth-switch{margin:14px 0 0;text-align:center;color:rgba(255,255,255,.48);font-size:11px}.auth-legal-line button,.auth-switch button{border:0;color:var(--color-purple-light);background:none;text-decoration:underline}.auth-switch button:disabled{opacity:.45;cursor:not-allowed}.auth-switch{font-size:13px}.auth-switch-row{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}.auth-login-switch{margin-top:12px}.auth-switch-divider{width:1px;height:14px;background:rgba(255,255,255,.16)}
.recovery-progress{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:18px 0 22px}.recovery-progress>div{display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 8px;border:1px solid rgba(255,255,255,.08);border-radius:12px;color:rgba(255,255,255,.38);background:rgba(255,255,255,.025)}.recovery-progress span{display:grid;width:22px;height:22px;place-items:center;border-radius:50%;color:rgba(255,255,255,.48);background:rgba(255,255,255,.08);font-size:10px;font-weight:900}.recovery-progress small{font-size:10px;font-weight:800}.recovery-progress>div.active{border-color:rgba(245,200,66,.35);color:var(--color-gold);background:rgba(245,200,66,.07)}.recovery-progress>div.active span{color:#1a0a2e;background:var(--color-gold);box-shadow:0 0 18px rgba(245,200,66,.22)}.recovery-progress>div.done{color:#86efac;border-color:rgba(74,222,128,.22);background:rgba(74,222,128,.05)}.recovery-progress>div.done span{color:#052e16;background:#4ade80}
.recovery-demo-note{display:flex;flex-direction:column;gap:3px;padding:10px 12px;border:1px dashed rgba(192,132,252,.25);border-radius:12px;color:rgba(255,255,255,.48);background:rgba(168,85,247,.05);font-size:10px;line-height:1.5}.recovery-demo-note strong{color:var(--color-purple-light);font-size:10px;letter-spacing:.08em}.recovery-demo-note b{color:rgba(255,255,255,.72)}
.recovery-state-card{display:flex;min-height:270px;flex-direction:column;align-items:center;justify-content:center;gap:11px;padding:24px;border:1px solid rgba(168,85,247,.2);border-radius:20px;background:linear-gradient(145deg,rgba(168,85,247,.09),rgba(255,255,255,.025));text-align:center}.recovery-state-card>strong{color:#fff;font-size:18px}.recovery-state-card>p{max-width:360px;margin:0;color:rgba(255,255,255,.58);font-size:12px;line-height:1.7}.recovery-state-card>p b{color:var(--color-gold)}.recovery-phone-mark,.recovery-branch-mark{display:grid;width:58px;height:58px;place-items:center;border:1px solid rgba(245,200,66,.3);border-radius:18px;color:var(--color-gold);background:rgba(245,200,66,.09);font-size:20px;font-weight:900;box-shadow:0 0 28px rgba(245,200,66,.09)}.recovery-security-copy{font-size:10px!important;color:rgba(255,255,255,.38)!important}.recovery-state-card .auth-actions{width:100%;max-width:370px}.recovery-branch-card{min-height:300px}.recovery-branch-mark{color:#fff;border-color:rgba(6,199,85,.35);background:#06c755}.recovery-help-mark{color:var(--color-gold);border-color:rgba(245,200,66,.3);background:rgba(245,200,66,.09)}.recovery-wide-action{width:100%;max-width:320px;justify-content:center;margin-top:5px}.recovery-success-card{border-color:rgba(74,222,128,.26);background:linear-gradient(145deg,rgba(74,222,128,.08),rgba(255,255,255,.025))}
.social-confirm-card{display:flex;min-height:250px;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:28px;margin-top:18px;border:1px solid color-mix(in srgb,var(--social) 45%,transparent);border-radius:22px;background:linear-gradient(145deg,color-mix(in srgb,var(--social) 16%,transparent),rgba(255,255,255,.025));text-align:center}.social-confirm-logo{display:grid;width:64px;height:64px;place-items:center;border-radius:18px;color:#fff;background:var(--social);font-size:28px;font-weight:900}.social-confirm-card strong{color:#fff;font-size:16px}.social-confirm-card span{max-width:300px;color:rgba(255,255,255,.56);font-size:12px;line-height:1.6}.auth-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:10px;margin-top:16px}.auth-actions>*{justify-content:center}
.auth-state-card{display:flex;min-height:360px;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}.auth-state-card strong{color:#fff;font-size:21px}.auth-state-card span{color:rgba(255,255,255,.55);font-size:12px}.auth-spinner{width:42px;height:42px;border:3px solid rgba(168,85,247,.18);border-top-color:var(--color-gold);border-radius:50%;animation:auth-spin .8s linear infinite}.auth-success{display:grid;width:64px;height:64px;place-items:center;border-radius:50%;color:#052e16;background:#4ade80;font-size:30px;font-weight:900;box-shadow:0 0 40px rgba(74,222,128,.28)}
.terms-review-card{display:grid;grid-template-columns:38px 1fr 20px;align-items:center;gap:10px;padding:12px;margin-top:6px;border:1px solid rgba(245,200,66,.22);border-radius:14px;color:var(--color-text);background:rgba(245,200,66,.055);text-align:left}.terms-review-card>span{display:grid;width:34px;height:34px;place-items:center;border-radius:50%;color:var(--color-gold);background:rgba(245,200,66,.13);font-size:11px;font-weight:900}.terms-review-card div{display:flex;flex-direction:column;gap:2px}.terms-review-card strong{font-size:12px}.terms-review-card small{color:var(--color-text-muted);font-size:10px}.terms-review-card>b{color:var(--color-gold);font-size:24px}.terms-review-card.reviewed{border-color:rgba(74,222,128,.34);background:rgba(74,222,128,.07)}.terms-review-card.reviewed>span{color:#052e16;background:#4ade80}
@keyframes auth-spin{to{transform:rotate(360deg)}}
@media(max-width:560px){.auth-modal-inner{max-height:94dvh;padding:27px 20px}.auth-two-column{grid-template-columns:1fr}.social-grid{grid-template-columns:1fr 1fr}.recovery-progress{gap:5px}.recovery-progress>div{flex-direction:column;gap:4px;padding:7px 4px}.recovery-state-card{min-height:250px;padding:20px}.auth-switch-row{gap:10px}}
</style>
