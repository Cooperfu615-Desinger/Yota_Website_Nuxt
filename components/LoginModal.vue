<script setup lang="ts">
const { showLoginModal, loginTab, closeLogin, login } = useAppState()

const form = reactive({ account: '', password: '', phone: '', code: '' })
const loading = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

function sendCode() {
  if (!form.phone || countdown.value > 0) return
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

async function handleSubmit() {
  loading.value = true
  // TODO: 串接登入 API
  await new Promise(r => setTimeout(r, 1200))
  login()
  loading.value = false
}

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showLoginModal" class="modal-overlay" role="dialog" aria-modal="true" aria-label="登入" @click.self="closeLogin">
        <div class="modal-box">
          <div class="modal-handle" />
          <button class="modal-close" aria-label="關閉" @click="closeLogin">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <h2 class="modal-title">登入 / 註冊</h2>

          <!-- Tab 切換 -->
          <div class="tab-bar mb-5">
            <button class="tab-btn" :class="{ active: loginTab === 'account' }" @click="loginTab = 'account'">帳號密碼</button>
            <button class="tab-btn" :class="{ active: loginTab === 'phone' }"   @click="loginTab = 'phone'">手機號碼</button>
          </div>

          <!-- 帳號密碼表單 -->
          <form v-if="loginTab === 'account'" class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div>
              <label class="input-label" for="login-account">帳號</label>
              <input id="login-account" v-model="form.account" type="text" class="input-field" placeholder="請輸入帳號" autocomplete="username" required />
            </div>
            <div>
              <label class="input-label" for="login-password">密碼</label>
              <input id="login-password" v-model="form.password" type="password" class="input-field" placeholder="請輸入密碼" autocomplete="current-password" required />
            </div>
            <button type="submit" class="btn-gold w-full justify-center" :disabled="loading">
              <span v-if="loading">登入中...</span>
              <span v-else>登入</span>
            </button>
          </form>

          <!-- 手機號碼表單 -->
          <form v-else class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <div>
              <label class="input-label" for="login-phone">手機號碼</label>
              <input id="login-phone" v-model="form.phone" type="tel" class="input-field" placeholder="09xxxxxxxx" autocomplete="tel" required />
            </div>
            <div>
              <label class="input-label" for="login-code">驗證碼</label>
              <div class="flex gap-2">
                <input id="login-code" v-model="form.code" type="text" class="input-field" placeholder="請輸入驗證碼" inputmode="numeric" required style="flex:1;" />
                <button type="button" class="btn-outline-purple text-sm flex-shrink-0 px-3" style="border-radius:10px;" :disabled="countdown > 0" @click="sendCode">
                  {{ countdown > 0 ? `${countdown}s` : '發送驗證碼' }}
                </button>
              </div>
            </div>
            <button type="submit" class="btn-gold w-full justify-center" :disabled="loading">
              <span v-if="loading">驗證中...</span>
              <span v-else>驗證登入</span>
            </button>
          </form>

          <!-- 分隔線 -->
          <div class="flex items-center gap-3 my-5">
            <div class="divider-purple flex-1" style="margin:0;" />
            <span class="text-xs" style="color:var(--color-text-muted);">或使用社群帳號</span>
            <div class="divider-purple flex-1" style="margin:0;" />
          </div>

          <!-- 社群登入 -->
          <div class="flex justify-center gap-4">
            <!-- LINE -->
            <button class="social-login-btn" title="LINE 登入" aria-label="LINE 登入">
              <svg viewBox="0 0 24 24" class="w-6 h-6" fill="#06C755" aria-hidden="true">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
            </button>
            <!-- Facebook -->
            <button class="social-login-btn" title="Facebook 登入" aria-label="Facebook 登入">
              <svg viewBox="0 0 24 24" class="w-6 h-6" fill="#1877F2" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <!-- Google -->
            <button class="social-login-btn" title="Google 登入" aria-label="Google 登入">
              <svg viewBox="0 0 24 24" class="w-6 h-6" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <!-- Apple -->
            <button class="social-login-btn" title="Apple 登入" aria-label="Apple 登入">
              <svg viewBox="0 0 24 24" class="w-6 h-6" fill="#fff" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          <p class="text-center mt-4" style="font-size:11px; color:var(--color-text-muted);">
            登入即代表您同意我們的
            <a href="#" style="color:var(--color-purple-light);">服務條款</a>
            與
            <a href="#" style="color:var(--color-purple-light);">隱私政策</a>
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
</style>
