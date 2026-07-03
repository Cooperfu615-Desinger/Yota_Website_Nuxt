<script setup lang="ts">
import type { GameItem, LobbyGameCategory } from '~/data/siteContent'

const props = defineProps<{
  category: string
  search: string
  categories: LobbyGameCategory[]
  games: GameItem[]
  providers: string[]
  sortMode: string
  selectedProviders: string[]
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  'update:category': [value: string]
  'update:search': [value: string]
  'update:sortMode': [value: string]
  'update:selectedProviders': [value: string[]]
  'update:page': [value: number]
  play: [key: string, mode: 'real' | 'demo']
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.games.length / props.pageSize)))
const pagedGames = computed(() => {
  const start = (props.page - 1) * props.pageSize
  return props.games.slice(start, start + props.pageSize)
})

function goPage(nextPage: number) {
  emit('update:page', Math.min(Math.max(1, nextPage), pageCount.value))
}
</script>

<template>
  <div class="lobby-category-view">
    <SharedGameFilterBar
      :category="category"
      :search="search"
      :categories="categories"
      search-first
      @update:category="emit('update:category', $event)"
      @update:search="emit('update:search', $event)"
    />

    <div class="lobby-list-tools">
      <label class="lobby-filter-select">
        <span>排序方式：</span>
        <select :value="sortMode" @change="emit('update:sortMode', ($event.target as HTMLSelectElement).value)">
          <option value="hot">熱門</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="latest">最新</option>
        </select>
      </label>

      <LobbyProviderFilter
        :providers="providers"
        :selected-providers="selectedProviders"
        @update:selected-providers="emit('update:selectedProviders', $event)"
      />
    </div>

    <div class="game-count">共 {{ games.length }} 款遊戲</div>

    <div v-if="pagedGames.length" class="game-grid">
      <LobbyGameCard
        v-for="game in pagedGames"
        :key="game.key"
        :game="game"
        @play="(key, mode) => emit('play', key, mode)"
      />
    </div>
    <div v-else class="game-grid-empty">
      <p>找不到相符的遊戲</p>
    </div>

    <div class="lobby-pagination" aria-label="遊戲列表分頁">
      <button type="button" :disabled="page <= 1" @click="goPage(page - 1)">‹</button>
      <button
        v-for="n in pageCount"
        :key="n"
        type="button"
        :class="{ active: page === n }"
        @click="goPage(n)"
      >
        {{ n }}
      </button>
      <button type="button" :disabled="page >= pageCount" @click="goPage(page + 1)">›</button>
    </div>
  </div>
</template>
