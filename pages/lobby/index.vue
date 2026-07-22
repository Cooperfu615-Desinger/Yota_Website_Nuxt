<script setup lang="ts">
import type { GameWalletKey } from '~/utils/gameWallets'

definePageMeta({ layout: 'lobby' })

const route = useRoute()
const router = useRouter()
const { isLoggedIn, openLogin, closeLogin } = useAppState()

const currentGameKey = ref<string | null>(null)
const currentGameMode = ref<'real' | 'demo'>('real')
const currentGameWallet = ref<GameWalletKey | null>(null)
const launchGameKey = ref<string | null>(null)

function clearLaunch() {
  launchGameKey.value = null
}

function requestLaunch(key: string, mode: 'real' | 'demo') {
  if (mode === 'demo') {
    currentGameKey.value = key
    currentGameMode.value = 'demo'
    currentGameWallet.value = null
    clearLaunch()
    return
  }
  if (mode === 'real' && !isLoggedIn.value) {
    openLogin(`/lobby?game=${encodeURIComponent(key)}&mode=real`)
    return
  }
  launchGameKey.value = key
}

function startRealGame(wallet: GameWalletKey) {
  if (!launchGameKey.value) return
  currentGameKey.value = launchGameKey.value
  currentGameMode.value = 'real'
  currentGameWallet.value = wallet
  clearLaunch()
}

function closeGame() {
  currentGameKey.value = null
  currentGameWallet.value = null
  clearLaunch()
}

function switchMode(mode: 'real' | 'demo') {
  if (mode === 'demo') {
    currentGameMode.value = 'demo'
    currentGameWallet.value = null
    clearLaunch()
    return
  }
  if (currentGameMode.value === 'real') return
  if (!isLoggedIn.value) {
    openLogin(currentGameKey.value ? `/lobby?game=${encodeURIComponent(currentGameKey.value)}&mode=real` : '/lobby')
    return
  }
  if (currentGameKey.value) launchGameKey.value = currentGameKey.value
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
    <LobbyGameView v-if="currentGameKey" :game-key="currentGameKey" :mode="currentGameMode" :wallet="currentGameWallet" @close="closeGame" @switch-mode="switchMode" />
    <template v-else><h1 class="sr-only">遊戲大廳</h1><LobbyGameGrid @play="requestLaunch" /></template>

    <ClientOnly>
      <LobbyGameLaunchModal v-if="launchGameKey" :game-key="launchGameKey" @close="clearLaunch" @enter="startRealGame" />
    </ClientOnly>
  </div>
</template>
