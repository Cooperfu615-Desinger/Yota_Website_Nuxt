<script setup lang="ts">
type Provider = 'google' | 'apple' | 'facebook' | 'line'
const props = withDefaults(defineProps<{ provider: Provider; mode?: 'binding' | 'login' }>(), { mode: 'login' })
const emit = defineEmits<{ complete: []; close: [] }>()
const phase = ref<'connecting' | 'confirm' | 'processing' | 'success'>('connecting')
const dialog = ref<HTMLElement | null>(null)
const confirmButton = ref<HTMLButtonElement | null>(null)
const isBinding = computed(() => props.mode === 'binding')
const providers = {
  google: { label: 'Google', mark: 'G' }, apple: { label: 'APPLE', mark: 'A' },
  facebook: { label: 'FB', mark: 'f' }, line: { label: 'LINE', mark: 'L' },
}
const provider = computed(() => providers[props.provider])
const titleId = computed(() => `${props.provider}-${props.mode}-authorization-title`)
const timers = new Set<ReturnType<typeof setTimeout>>()
let previousFocus: HTMLElement | null = null
let disposed = false

function schedule(callback: () => void, delay: number) {
  const timer = setTimeout(() => {
    timers.delete(timer)
    if (!disposed) callback()
  }, delay)
  timers.add(timer)
}
function clearTimers() {
  for (const timer of timers) clearTimeout(timer)
  timers.clear()
}
async function focusDialog() {
  await nextTick()
  if (!disposed) (phase.value === 'confirm' ? confirmButton.value : dialog.value)?.focus()
}
function startConnection() {
  clearTimers()
  phase.value = 'connecting'
  void focusDialog()
  schedule(() => { phase.value = 'confirm'; void focusDialog() }, 1500)
}
function cancelAuthorization() {
  if (phase.value !== 'confirm') return
  clearTimers()
  emit('close')
}
function confirmAuthorization() {
  if (phase.value !== 'confirm') return
  phase.value = 'processing'
  void focusDialog()
  schedule(() => {
    phase.value = 'success'
    schedule(() => { emit('complete'); emit('close') }, 650)
  }, 900)
}
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    // Stop Escape here so an underlying player-profile dialog stays open.
    event.preventDefault()
    event.stopImmediatePropagation()
    cancelAuthorization()
    return
  }
  if (event.key !== 'Tab') return
  const focusable = dialog.value ? Array.from(dialog.value.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')) : []
  if (focusable.length === 0) {
    event.preventDefault()
    dialog.value?.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const outside = !dialog.value?.contains(document.activeElement)
  if ((event.shiftKey && (document.activeElement === first || outside)) || (!event.shiftKey && (document.activeElement === last || outside))) {
    event.preventDefault()
    ;(event.shiftKey ? last : first).focus()
  }
}
onMounted(() => {
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  document.addEventListener('keydown', handleKeydown, true)
  startConnection()
})
watch(() => [props.provider, props.mode], startConnection)
onBeforeUnmount(() => {
  disposed = true
  clearTimers()
  document.removeEventListener('keydown', handleKeydown, true)
  if (previousFocus?.isConnected) previousFocus.focus()
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <div class="modal-overlay social-authorization-overlay">
        <section ref="dialog" class="social-authorization-dialog" :class="`authorization-${props.provider}`" role="dialog" aria-modal="true" :aria-labelledby="titleId" :aria-busy="phase === 'connecting' || phase === 'processing'" tabindex="-1">
          <header class="authorization-header">
            <span>ACCOUNT AUTHORIZATION</span>
            <h2 :id="titleId">{{ isBinding ? `綁定 ${provider.label} 帳號` : `使用 ${provider.label} 登入` }}</h2>
          </header>
          <div class="authorization-content" aria-live="polite">
            <div class="authorization-provider-mark" aria-hidden="true">
              <svg v-if="props.provider === 'apple'" viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 3.2c-.9.1-2 .7-2.6 1.4-.6.7-1.1 1.6-1 2.5 1 .1 2-.5 2.6-1.2.6-.7 1-1.7 1-2.7ZM19.1 17.4c-.4.9-.7 1.3-1.3 2.1-.8 1.1-1.9 2.4-3.2 2.4-1.2 0-1.5-.7-3.1-.7s-2 .7-3.2.8c-1.2 0-2.3-1.2-3.1-2.3-2.2-3.1-2.4-6.6-1-8.5 1-1.4 2.5-2.2 3.9-2.2 1.4 0 2.3.7 3.4.7 1 0 1.6-.7 3.3-.8 1.2-.1 2.6.5 3.5 1.6-3.1 1.7-2.6 6.1.8 6.9Z" /></svg>
              <template v-else>{{ provider.mark }}</template>
            </div>
            <template v-if="phase === 'connecting'">
              <span class="authorization-spinner" aria-hidden="true" />
              <strong>正在連接 {{ provider.label }} 帳號…</strong>
            </template>
            <template v-else-if="phase === 'confirm'">
              <h3>{{ isBinding ? `允許巨亨ONLINE 將此 ${provider.label} 帳號綁定到目前帳號？` : '允許巨亨ONLINE 使用此帳號登入？' }}</h3>
              <p>{{ isBinding ? '只連結目前的玩家帳號；此為示範授權，不會取得真實社群資料。' : '將建立示範帳號，不會取得真實社群資料。' }}</p>
              <div class="authorization-actions">
                <button ref="confirmButton" type="button" class="btn-gold" @click="confirmAuthorization">{{ isBinding ? '允許並綁定' : '允許並繼續' }}</button>
                <button type="button" class="authorization-cancel" @click="cancelAuthorization">取消</button>
              </div>
            </template>
            <template v-else-if="phase === 'processing'">
              <span class="authorization-spinner" aria-hidden="true" />
              <strong>{{ isBinding ? '正在綁定…' : '正在登入…' }}</strong>
            </template>
            <template v-else>
              <span class="authorization-success" aria-hidden="true">✓</span>
              <strong>{{ isBinding ? '授權成功' : '登入成功' }}</strong>
              <p>{{ isBinding ? '即將完成綁定並返回個人資訊' : '即將完成登入' }}</p>
            </template>
          </div>
          <footer>示範授權流程</footer>
        </section>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.social-authorization-overlay { z-index:3200; padding:18px; }
.social-authorization-dialog { --provider-accent:#ea4335; width:min(430px,100%); max-height:calc(100dvh - 36px); overflow-y:auto; border:1px solid rgba(255,255,255,.26); border-radius:24px; color:var(--color-text); background:linear-gradient(160deg,#302143,#190b2f); box-shadow:0 18px 70px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.1); outline:none; }
.authorization-apple { --provider-accent:#555; }.authorization-facebook { --provider-accent:#1877f2; }.authorization-line { --provider-accent:#06c755; }
.authorization-header { padding:22px 24px 18px; border-bottom:1px solid var(--color-border); text-align:center; }
.authorization-header>span { color:var(--color-text-muted); font-size:10px; font-weight:800; letter-spacing:.18em; }
.authorization-header h2 { margin:7px 0 0; font-size:22px; font-weight:900; }
.authorization-content { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; min-height:300px; padding:28px 26px; text-align:center; }
.authorization-provider-mark { display:grid; place-items:center; flex-shrink:0; width:64px; height:64px; border:1px solid rgba(255,255,255,.24); border-radius:18px; color:#fff; background:var(--provider-accent); box-shadow:0 6px 24px rgba(0,0,0,.18); font-size:34px; font-weight:900; }
.authorization-provider-mark svg { width:39px; height:39px; }
.authorization-content h3 { margin:0; font-size:18px; font-weight:800; line-height:1.7; }
.authorization-content strong { font-size:18px; font-weight:800; }
.authorization-content p { margin:0; color:var(--color-text-muted); font-size:13px; line-height:1.8; }
.authorization-actions { display:grid; gap:10px; width:100%; margin-top:4px; }
.authorization-actions button { min-height:44px; justify-content:center; font-size:14px; font-weight:800; }
.authorization-cancel { padding:11px; border:1px solid var(--color-border); border-radius:10px; color:var(--color-text); background:rgba(255,255,255,.05); }
.authorization-cancel:hover { background:rgba(168,85,247,.12); }
.authorization-spinner { width:30px; height:30px; border:3px solid rgba(255,255,255,.15); border-top-color:var(--color-gold); border-radius:50%; animation:authorization-spin .8s linear infinite; }
.authorization-success { display:grid; place-items:center; width:42px; height:42px; border:1px solid rgba(74,222,128,.4); border-radius:50%; color:#b0f3c7; background:rgba(74,222,128,.12); font-size:26px; }
.social-authorization-dialog footer { padding:13px 20px; border-top:1px solid var(--color-border); color:var(--color-text-muted); font-size:11px; text-align:center; }
@keyframes authorization-spin { to { transform:rotate(360deg); } }
@media(prefers-reduced-motion:reduce) { .authorization-spinner { animation-duration:2s; } }
@media(max-width:480px) { .authorization-content { padding:24px 20px; }.authorization-header { padding:20px; }.authorization-header h2 { font-size:20px; } }
</style>
