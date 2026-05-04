<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'

const props = defineProps<{ category?: string }>()
const emit = defineEmits<{ play: [key: string, mode: 'real' | 'demo'] }>()

const activeCategory = ref(props.category ?? 'all')
const searchQuery = ref('')

const allGames: GameItem[] = [...siteContent.games] as GameItem[]

const filteredGames = computed((): GameItem[] => {
  let list = allGames
  if (activeCategory.value === 'hot') {
    list = list.filter(g => g.badge === '熱門')
  } else if (activeCategory.value !== 'all') {
    list = list.filter(g => g.category === activeCategory.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(g => g.name.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q))
  }
  return list
})
</script>

<template>
  <div class="game-grid-wrap">
    <!-- 分類 Tab -->
    <div class="game-categories">
      <button
        v-for="cat in siteContent.gameCategories"
        :key="cat.key"
        class="game-cat-btn"
        :class="{ 'game-cat-active': activeCategory === cat.key }"
        @click="activeCategory = cat.key"
      >
        <span aria-hidden="true">{{ cat.icon }}</span>
        {{ cat.label }}
      </button>
    </div>

    <!-- 搜尋框 -->
    <div class="game-search-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="game-search-icon" aria-hidden="true">
        <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
      </svg>
      <input
        v-model="searchQuery"
        type="search"
        placeholder="搜尋遊戲..."
        class="game-search-input"
      />
    </div>

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
