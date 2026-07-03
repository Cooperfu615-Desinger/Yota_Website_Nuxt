<script setup lang="ts">
import type { GameItem } from '~/data/siteContent'

defineProps<{
  title: string
  games: GameItem[]
}>()

const emit = defineEmits<{
  viewAll: []
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
        class="lobby-game-row-card"
        @play="(key, mode) => emit('play', key, mode)"
      />
    </div>
  </section>
</template>
