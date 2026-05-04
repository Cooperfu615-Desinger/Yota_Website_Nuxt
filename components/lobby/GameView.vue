<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'

const props = defineProps<{ gameKey: string; mode: 'real' | 'demo' }>()
const emit = defineEmits<{ close: [] }>()

const allGames: GameItem[] = [...siteContent.games] as GameItem[]
const game = computed(() => allGames.find(g => g.key === props.gameKey))

// 實際整合時請換成真實遊戲 URL
const gameUrl = computed(() =>
  props.mode === 'demo'
    ? `https://example.com/demo/${props.gameKey}`
    : `https://example.com/real/${props.gameKey}`
)
</script>

<template>
  <div class="game-view">
    <!-- 頂部工具列 -->
    <div class="game-view-bar">
      <div class="game-view-info">
        <span v-if="game" class="game-view-name">{{ game.name }}</span>
        <span class="game-view-mode" :class="mode === 'demo' ? 'mode-demo' : 'mode-real'">
          {{ mode === 'demo' ? '試玩模式' : '真錢模式' }}
        </span>
      </div>
      <button class="game-view-close" @click="emit('close')" aria-label="關閉遊戲">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
          <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
        關閉遊戲
      </button>
    </div>

    <!-- 遊戲 iframe -->
    <div class="game-view-frame">
      <ClientOnly>
        <iframe
          :src="gameUrl"
          :title="game?.name ?? '遊戲'"
          class="game-iframe"
          allowfullscreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
        <template #fallback>
          <div class="game-frame-loading">遊戲載入中…</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
