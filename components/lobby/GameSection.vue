<script setup lang="ts">
import type { GameItem } from '~/data/siteContent'

defineProps<{
  title: string
  games: GameItem[]
  favoriteKeys?: string[]
}>()

const emit = defineEmits<{
  viewAll: []
  toggleFavorite: [key: string]
  play: [key: string, mode: 'real' | 'demo']
}>()
</script>

<template>
  <section v-if="games.length" class="lobby-game-section">
    <div class="lobby-game-section-head">
      <h2>{{ title }}</h2>
      <button type="button" @click="emit('viewAll')">全部</button>
    </div>

    <div class="lobby-game-row" tabindex="0" :aria-label="`${title}遊戲列表`">
      <LobbyGameCard
        v-for="game in games"
        :key="game.key"
        :game="game"
        :is-favorite="favoriteKeys?.includes(game.key)"
        show-favorite
        class="lobby-game-row-card"
        @toggle-favorite="emit('toggleFavorite', $event)"
        @play="(key, mode) => emit('play', key, mode)"
      />
    </div>
  </section>
</template>
