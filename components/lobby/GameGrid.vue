<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'

const props = defineProps<{ category?: string }>()
const emit = defineEmits<{ play: [key: string, mode: 'real' | 'demo'] }>()

const allGames: GameItem[] = [...siteContent.lobbyGames] as GameItem[]
const { activeCategory, searchQuery, filteredGames } = useGameFilter(allGames, {
  initialCategory: props.category ?? 'all',
})
</script>

<template>
  <div class="game-grid-wrap">
    <SharedGameFilterBar
      v-model:category="activeCategory"
      v-model:search="searchQuery"
    />

    <!-- 遊戲數量 -->
    <div class="game-count">共 {{ filteredGames.length }} 款遊戲</div>

    <!-- 遊戲格子 -->
    <div v-if="filteredGames.length" class="game-grid">
      <LobbyGameCard
        v-for="game in filteredGames"
        :key="game.key"
        :game="game"
        @play="(key, mode) => emit('play', key, mode)"
      />
    </div>
    <div v-else class="game-grid-empty">
      <p>找不到相符的遊戲</p>
    </div>
  </div>
</template>
