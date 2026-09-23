<script setup lang="ts">
import type { GameItem } from '~/data/siteContent'
import type { LobbyFilterCounts, LobbyFilterState } from '~/utils/lobbyFilters'

defineProps<{
  filter: LobbyFilterState
  search: string
  counts: LobbyFilterCounts
  sections: Array<{ key: string; title: string; games: GameItem[] }>
  favoriteKeys: string[]
}>()

const emit = defineEmits<{
  'update:filter': [value: LobbyFilterState]
  'update:search': [value: string]
  viewCategory: [value: string]
  toggleFavorite: [value: string]
  play: [key: string, mode: 'real' | 'demo']
}>()

</script>

<template>
  <div class="lobby-game-home">
    <SharedGameFilterBar
      :filter="filter"
      :search="search"
      :counts="counts"
      search-first
      @update:filter="emit('update:filter', $event)"
      @update:search="emit('update:search', $event)"
    />

    <LobbyGameSection
      v-for="section in sections"
      :key="section.key"
      :title="section.title"
      :games="section.games"
      :favorite-keys="favoriteKeys"
      @view-all="emit('viewCategory', section.key)"
      @toggle-favorite="emit('toggleFavorite', $event)"
      @play="(key, mode) => emit('play', key, mode)"
    />
  </div>
</template>
