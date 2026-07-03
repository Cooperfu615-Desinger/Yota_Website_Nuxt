<script setup lang="ts">
import { siteContent, type GameCategory, type LobbyGameCategory } from '~/data/siteContent'

const props = withDefaults(defineProps<{
  category: string
  search: string
  categories?: Array<GameCategory | LobbyGameCategory>
  placeholder?: string
  searchFirst?: boolean
}>(), {
  placeholder: '搜尋遊戲...',
  searchFirst: false,
})

const emit = defineEmits<{
  'update:category': [value: string]
  'update:search': [value: string]
}>()

const filterCategories = computed(() => props.categories ?? siteContent.gameCategories)
</script>

<template>
  <div class="game-filter-bar" :class="{ 'game-filter-bar-search-first': searchFirst }">
    <div class="game-categories" role="tablist" aria-label="遊戲分類">
      <button
        v-for="cat in filterCategories"
        :key="cat.key"
        class="game-cat-btn"
        :class="{ 'game-cat-active': category === cat.key }"
        type="button"
        role="tab"
        :aria-selected="category === cat.key"
        @click="emit('update:category', cat.key)"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="game-search-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="game-search-icon" aria-hidden="true">
        <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
      </svg>
      <input
        :value="search"
        type="search"
        :placeholder="placeholder"
        class="game-search-input"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
