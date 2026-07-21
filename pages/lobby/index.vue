<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

const route = useRoute()
const router = useRouter()
const { isLoggedIn, openLogin, closeLogin } = useAppState()

const currentGameKey = ref<string | null>(null)
const currentGameMode = ref<'real' | 'demo'>('real')
const currentMachineId = ref<string | null>(null)
const launchGameKey = ref<string | null>(null)
const launchMode = ref<'real' | 'demo'>('real')
const showSeatSelection = ref(false)

function clearLaunch() {
  launchGameKey.value = null
  showSeatSelection.value = false
}

function requestLaunch(key: string, mode: 'real' | 'demo') {
  if (mode === 'real' && !isLoggedIn.value) {
    openLogin(`/lobby?game=${encodeURIComponent(key)}&mode=real`)
    return
  }
  launchGameKey.value = key
  launchMode.value = mode
  showSeatSelection.value = false
}

function startGame(machineId?: string) {
  if (!launchGameKey.value) return
  currentGameKey.value = launchGameKey.value
  currentGameMode.value = launchMode.value
  currentMachineId.value = machineId || null
  clearLaunch()
}

function openSeats() {
  showSeatSelection.value = true
}

function backToLaunch() {
  showSeatSelection.value = false
}

function closeGame() {
  currentGameKey.value = null
  currentMachineId.value = null
}

function switchMode(mode: 'real' | 'demo') {
  if (mode === 'real' && !isLoggedIn.value) {
    openLogin(currentGameKey.value ? `/lobby?game=${encodeURIComponent(currentGameKey.value)}&mode=real` : '/lobby')
    return
  }
  currentGameMode.value = mode
}

function applyRouteLaunch() {
  const key = typeof route.query.game === 'string' ? route.query.game : ''
  if (!key) return
  const mode = route.query.mode === 'demo' ? 'demo' : 'real'
  if (mode === 'real' && !isLoggedIn.value) {
    openLogin(route.fullPath)
    return
  }
  closeLogin()
  requestLaunch(key, mode)
  const nextQuery = { ...route.query }
  delete nextQuery.game
  delete nextQuery.mode
  router.replace({ query: nextQuery })
}

onMounted(applyRouteLaunch)
watch([() => route.query.game, isLoggedIn], applyRouteLaunch)
</script>

<template>
  <div class="lobby-page">
    <LobbyGameView v-if="currentGameKey" :game-key="currentGameKey" :mode="currentGameMode" :machine-id="currentMachineId || undefined" @close="closeGame" @switch-mode="switchMode" />
    <template v-else><h1 class="sr-only">遊戲大廳</h1><LobbyGameGrid @play="requestLaunch" /></template>

    <ClientOnly>
      <LobbyGameLaunchModal v-if="launchGameKey && !showSeatSelection" :game-key="launchGameKey" :mode="launchMode" @close="clearLaunch" @quick="startGame()" @seats="openSeats" />
      <LobbySeatSelectionModal v-if="launchGameKey && showSeatSelection" :game-key="launchGameKey" :mode="launchMode" @close="clearLaunch" @back="backToLaunch" @enter="startGame" />
    </ClientOnly>
  </div>
</template>
