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
    <!-- 圖示區（留白內層） -->
    <div class="game-card-inner">
      <!-- 有圖：完整顯示 AVIF -->
      <img
        v-if="game.imageSrc"
        :src="base + game.imageSrc"
        :alt="game.name"
        class="game-card-img"
      />
      <!-- 無圖 fallback：色塊 + 首字 -->
      <div
        v-else
        class="game-card-cover--fallback"
        :style="{ background: `linear-gradient(135deg, ${game.color}22 0%, ${game.color}55 100%)` }"
      >
        <span class="game-card-cover-inner" :style="{ color: game.color }">{{ game.name.charAt(0) }}</span>
      </div>
      <!-- 徽章 -->
      <div v-if="game.badge" class="game-card-badge">{{ game.badge }}</div>
    </div>

    <!-- 資訊區：名稱+簡述｜RTP -->
    <div class="game-card-body">
      <div class="game-card-info">
        <div class="game-card-name">{{ game.name }}</div>
        <div class="game-card-desc">{{ game.desc }}</div>
      </div>
      <div class="game-card-divider-v" aria-hidden="true" />
      <div class="game-card-rtp-wrap">
        <span class="game-card-rtp-label">RTP</span>
        <span class="game-card-rtp-value">{{ game.rtp }}</span>
      </div>
    </div>

    <!-- Hover 操作層 -->
    <div class="game-card-overlay">
      <button class="game-card-btn game-card-btn-play" @click="handlePlay('real')">真錢玩</button>
      <button class="game-card-btn game-card-btn-demo" @click="handlePlay('demo')">試玩</button>
    </div>
  </div>
</template>
