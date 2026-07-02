<script setup lang="ts">
const { initFromStorage } = useAppState()
const { initSocialFromStorage } = useSocialState()
const { openAgeGate } = useAgeGateState()
onMounted(() => {
  initFromStorage()
  initSocialFromStorage()
})

// Web館：另開 /h5 頁面（App 風格遊戲大廳）
const router = useRouter()
function openWebVersion() {
  const resolved = router.resolve('/h5')
  window.open(resolved.href, '_blank', 'noopener,noreferrer')
}

// Web館 浮動鈕：可自由拖曳（滑鼠 / 觸控）
const webBtn = ref<HTMLElement | null>(null)
const left = ref(0)
const top = ref(0)
const placed = ref(false)

let dragging = false
let moved = false
let startX = 0, startY = 0, originX = 0, originY = 0

function placeWebBtn() {
  const el = webBtn.value
  if (!el) return
  // 預設：右上角、但落在頻道列下方，避免蓋住頁面內容（如聊天的「在線」鈕）
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
  // 拖曳後抑制這次 click，避免拖完誤觸開啟
  if (moved) { moved = false; return }
  openAgeGate(openWebVersion)
}
</script>

<template>
  <div class="lobby-root">
    <LobbyHeader />
    <div class="lobby-body">
      <LobbySidebar />
      <main class="lobby-main">
        <slot />
      </main>
    </div>

    <!-- 精簡頁腳 -->
    <footer class="lobby-footer">
      <p>© 2024 巨亨ONLINE 版權所有｜本平台僅供娛樂，請理性遊戲</p>
    </footer>

    <AppBottomNav />

    <!-- Web館浮動按鈕（可拖曳） -->
    <button
      ref="webBtn"
      class="lobby-web-btn"
      :style="{ left: left + 'px', top: top + 'px', visibility: placed ? 'visible' : 'hidden' }"
      aria-label="開啟 Web 版遊戲（可拖曳）"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @click="onClick"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
        <path d="M21.721 12.752a9.711 9.711 0 0 0-.945-5.003 12.754 12.754 0 0 1-4.339 2.708 18.991 18.991 0 0 1-.214 4.772 17.165 17.165 0 0 0 5.498-2.477ZM14.634 15.55a17.324 17.324 0 0 0 .332-4.647c-.952.227-1.945.347-2.966.347-1.021 0-2.014-.12-2.966-.347a17.515 17.515 0 0 0 .332 4.647 17.385 17.385 0 0 0 5.268 0ZM9.772 17.119a18.963 18.963 0 0 0 4.456 0A17.182 17.182 0 0 1 12 21.724a17.18 17.18 0 0 1-2.228-4.605ZM7.777 15.23a18.87 18.87 0 0 1-.214-4.774 12.753 12.753 0 0 1-4.34-2.708 9.711 9.711 0 0 0-.944 5.004 17.165 17.165 0 0 0 5.498 2.477ZM21.356 14.752a9.765 9.765 0 0 1-7.478 6.817 18.64 18.64 0 0 0 1.988-4.718 18.627 18.627 0 0 0 5.49-2.098ZM2.644 14.752c1.704.574 3.527.8 5.29 2.099a18.64 18.64 0 0 0 1.988 4.718 9.765 9.765 0 0 1-7.478-6.817ZM13.878 2.43a9.755 9.755 0 0 1 6.788 7.923 14.074 14.074 0 0 1-4.615-2.544 18.8 18.8 0 0 0-2.173-5.38ZM12 2.276a17.152 17.152 0 0 1 2.805 5.337A15.748 15.748 0 0 1 12 7.692a15.748 15.748 0 0 1-2.805-.38A17.151 17.151 0 0 1 12 2.276ZM10.122 2.43a18.8 18.8 0 0 0-2.173 5.38 14.075 14.075 0 0 1-4.615 2.544 9.755 9.755 0 0 1 6.788-7.924Z" />
      </svg>
      Web館
    </button>

    <ClientOnly>
      <AgeGateModal />
      <LoginModal />
      <LobbyModal />
    </ClientOnly>
  </div>
</template>
