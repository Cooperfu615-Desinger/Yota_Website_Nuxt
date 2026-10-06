<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialogRef = ref<HTMLElement | null>(null)
const closeRef = ref<HTMLButtonElement | null>(null)
let returnFocus: HTMLElement | null = null
let previousOverflow = ''

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
    return
  }
  if (event.key !== 'Tab') return
  const elements = Array.from(dialogRef.value?.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), [tabindex="0"]',
  ) ?? [])
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

onMounted(async () => {
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  await nextTick()
  closeRef.value?.focus()
})

onUnmounted(() => {
  document.body.style.overflow = previousOverflow
  if (returnFocus?.isConnected) returnFocus.focus()
})
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay wallet-rule-overlay" @click.self="emit('close')" @keydown="onKeydown">
      <section ref="dialogRef" class="modal-box wallet-rule-box" role="dialog" aria-modal="true" aria-labelledby="wallet-rule-title">
        <div class="modal-inner wallet-rule-inner">
          <button ref="closeRef" type="button" class="modal-close" aria-label="關閉說明" @click="emit('close')">×</button>
          <h2 id="wallet-rule-title" class="modal-title">{{ title }}</h2>
          <div class="wallet-rule-content"><slot /></div>
          <button type="button" class="btn-gold wallet-rule-confirm" @click="emit('close')">我知道了</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.wallet-rule-overlay { z-index: 1200; }
.wallet-rule-box { max-width: 560px; }
.wallet-rule-inner { padding-top: 48px; }
.wallet-rule-content { font-size: 14px; line-height: 1.8; }
.wallet-rule-content :deep(p) { margin: 0 0 14px; }
.wallet-rule-content :deep(dl) { margin: 0 0 16px; padding: 12px; border-radius: 12px; background: rgba(0,0,0,.14); }
.wallet-rule-content :deep(dl > div) { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px 14px; padding: 5px 0; }
.wallet-rule-content :deep(dd) { margin: 0; font-weight: 800; }
.wallet-rule-confirm { width: 100%; justify-content: center; margin-top: 8px; }
</style>
