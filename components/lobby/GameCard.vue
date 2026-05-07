<script setup lang="ts">
import { type GameItem } from '~/data/siteContent'

const props = defineProps<{ game: GameItem }>()
const emit = defineEmits<{ play: [key: string, mode: 'real' | 'demo'] }>()

const { isLoggedIn, openLogin } = useAppState()
const { app: { baseURL } } = useRuntimeConfig()
const base = baseURL.replace(/\/$/, '')

function handlePlay(mode: 'real' | 'demo') {
  if (mode === 'real' && !isLoggedIn.value) {
    openLogin()
    return
  }
  emit('play', props.game.key, mode)
}
</script>

<template>
  <div class="game-card">
    <!-- 遊戲封面圖區域 -->
    <div
      class="game-card-cover"
      :class="{ 'game-card-cover--fallback': !game.imageSrc }"
      :style="game.imageSrc ? undefined : { background: `linear-gradient(135deg, ${game.color}22 0%, ${game.color}55 100%)` }"
    >
      <!-- 有圖：顯示 AVIF -->
      <img
        v-if="game.imageSrc"
        :src="base + game.imageSrc"
        :alt="game.name"
        class="game-card-img"
      />
      <!-- 無圖 fallback：色塊 + 首字 -->
      <div v-else class="game-card-cover-inner" :style="{ color: game.color }">
        {{ game.name.charAt(0) }}
      </div>
      <div v-if="game.badge" class="game-card-badge">{{ game.badge }}</div>
    </div>

    <!-- 遊戲資訊 -->
    <div class="game-card-body">
      <div class="game-card-name">{{ game.name }}</div>
      <div class="game-card-meta">
        <span class="game-card-rtp">RTP {{ game.rtp }}</span>
        <span class="game-card-provider">{{ game.provider }}</span>
      </div>
    </div>

    <!-- Hover 操作層 -->
    <div class="game-card-overlay">
      <button class="game-card-btn game-card-btn-play" @click="handlePlay('real')">真錢玩</button>
      <button class="game-card-btn game-card-btn-demo" @click="handlePlay('demo')">試玩</button>
    </div>
  </div>
</template>
