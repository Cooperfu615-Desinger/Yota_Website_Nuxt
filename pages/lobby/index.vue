<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

const route = useRoute()
const { isLoggedIn, openLogin } = useAppState()
const { resolvePublicAsset } = usePublicAssetPath()

// 目前遊玩的遊戲狀態
const currentGameKey = ref<string | null>(null)
const currentGameMode = ref<'real' | 'demo'>('real')

// 從 URL query 帶入遊戲（教學頁跳轉用）
onMounted(() => {
  const gameParam = route.query.game as string | undefined
  const modeParam = route.query.mode as 'real' | 'demo' | undefined
  if (gameParam) {
    if (modeParam === 'demo') {
      currentGameKey.value = gameParam
      currentGameMode.value = 'demo'
    } else {
      if (isLoggedIn.value) {
        currentGameKey.value = gameParam
        currentGameMode.value = 'real'
      } else {
        openLogin()
      }
    }
  }
})

function handlePlay(key: string, mode: 'real' | 'demo') {
  currentGameKey.value = key
  currentGameMode.value = mode
}

function closeGame() {
  currentGameKey.value = null
}

function switchMode(mode: 'real' | 'demo') {
  if (mode === 'real' && !isLoggedIn.value) {
    openLogin()
    return
  }
  currentGameMode.value = mode
}
</script>

<template>
  <div class="lobby-page">
    <!-- 遊戲視圖 -->
    <LobbyGameView
      v-if="currentGameKey"
      :game-key="currentGameKey"
      :mode="currentGameMode"
      @close="closeGame"
      @switch-mode="switchMode"
    />

    <!-- 遊戲大廳 -->
    <template v-else>
      <div class="lobby-page-title">
        <div class="section-title-wrap" style="justify-content:flex-start;">
          <h1 class="sr-only">遊戲大廳</h1>
          <img :src="resolvePublicAsset('/title_text_games.png')" alt="遊戲大廳" class="section-title-img" />
          <span class="section-title-line" aria-hidden="true" />
        </div>
      </div>
      <LobbyGameGrid @play="handlePlay" />
    </template>
  </div>
</template>
