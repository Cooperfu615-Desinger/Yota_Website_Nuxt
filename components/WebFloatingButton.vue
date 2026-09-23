<script setup lang="ts">
const { app: { baseURL } } = useRuntimeConfig()
const router = useRouter()

const assetBase = baseURL.replace(/\/$/, '')

// WEB館浮動鈕：可自由拖曳（滑鼠 / 觸控）
const webBtn = ref<HTMLElement | null>(null)
const left = ref(0)
const top = ref(0)
const placed = ref(false)

let dragging = false
let moved = false
let startX = 0
let startY = 0
let originX = 0
let originY = 0

function placeWebBtn() {
  const el = webBtn.value
  if (!el) return
  // 預設：右上角，避免蓋住主要內容
  left.value = window.innerWidth - el.offsetWidth - 12
  top.value = 132
  placed.value = true
}

onMounted(() => { nextTick(placeWebBtn) })

function onDown(e: PointerEvent) {
  dragging = true
  moved = false
  startX = e.clientX
  startY = e.clientY
  originX = left.value
  originY = top.value
  webBtn.value?.setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (!dragging) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true
  const el = webBtn.value
  if (!el) return
  left.value = Math.min(Math.max(0, originX + dx), window.innerWidth - el.offsetWidth)
  top.value = Math.min(Math.max(0, originY + dy), window.innerHeight - el.offsetHeight)
}

function onUp(e: PointerEvent) {
  dragging = false
  webBtn.value?.releasePointerCapture(e.pointerId)
}

function onClick() {
  // 拖曳後抑制這次 click，避免拖完誤觸切換頁面
  if (moved) { moved = false; return }
  router.push('/lobby')
}
</script>

<template>
  <button
    ref="webBtn"
    class="lobby-web-btn"
    :style="{ left: `${left}px`, top: `${top}px`, visibility: placed ? 'visible' : 'hidden' }"
    aria-label="WEB館"
    title="WEB館"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @click="onClick"
  >
    <img :src="`${assetBase}/btn_web.png`" alt="WEB館" draggable="false">
  </button>
</template>
