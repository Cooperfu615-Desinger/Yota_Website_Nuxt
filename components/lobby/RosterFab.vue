<script setup lang="ts">
defineProps<{ count: number }>()
const emit = defineEmits<{ open: [] }>()

const fab = ref<HTMLElement | null>(null)
const left = ref(0)
const top = ref(0)
const placed = ref(false)

let dragging = false
let moved = false
let startX = 0, startY = 0, originX = 0, originY = 0

function parentEl() {
  return fab.value?.offsetParent as HTMLElement | null
}

function place() {
  const p = parentEl()
  const el = fab.value
  if (!p || !el) return
  // 預設：右側、輸入框上方
  left.value = p.clientWidth - el.offsetWidth - 12
  top.value = p.clientHeight - el.offsetHeight - 64
  placed.value = true
}

onMounted(() => { nextTick(place) })

function onDown(e: PointerEvent) {
  dragging = true
  moved = false
  startX = e.clientX
  startY = e.clientY
  originX = left.value
  originY = top.value
  fab.value?.setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (!dragging) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true
  const p = parentEl()
  const el = fab.value
  if (!p || !el) return
  left.value = Math.min(Math.max(0, originX + dx), p.clientWidth - el.offsetWidth)
  top.value = Math.min(Math.max(0, originY + dy), p.clientHeight - el.offsetHeight)
}

function onUp(e: PointerEvent) {
  dragging = false
  fab.value?.releasePointerCapture(e.pointerId)
}

function onClick() {
  // 拖曳後抑制這次 click，避免拖完誤開
  if (moved) { moved = false; return }
  emit('open')
}
</script>

<template>
  <button
    ref="fab"
    class="roster-fab"
    :style="{ left: left + 'px', top: top + 'px', visibility: placed ? 'visible' : 'hidden' }"
    aria-label="在線玩家名單（可拖曳）"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @click="onClick"
  >
    <span class="fab-dot" />
    <span class="fab-icon">👥</span>
    <span class="fab-num">{{ count }}</span>
  </button>
</template>

<style scoped>
.roster-fab {
  position: absolute;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 9px 4px 7px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-purple-light);
  background: rgba(26, 10, 46, 0.92);
  border: 1px solid rgba(168, 85, 247, 0.5);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
  cursor: grab;
  touch-action: none;
  user-select: none;
  backdrop-filter: blur(2px);
}
.roster-fab:active { cursor: grabbing; }
.fab-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34d399;
  flex-shrink: 0;
}
.fab-icon { font-size: 12px; }
.fab-num { font-variant-numeric: tabular-nums; }
</style>
