<script setup lang="ts">
import type { LobbyFilterState, LobbyFilterCounts, LobbyFilterOption } from '~/utils/lobbyFilters'
import {
  LOBBY_CATEGORY_OPTIONS,
  LOBBY_CURRENCY_OPTIONS,
  LOBBY_PROVIDER_OPTIONS,
} from '~/utils/lobbyFilters'

const props = withDefaults(defineProps<{
  filter: LobbyFilterState
  counts: LobbyFilterCounts
  search: string
  searchFirst?: boolean
  showFavorites?: boolean
}>(), {
  searchFirst: false,
  showFavorites: true,
})

const emit = defineEmits<{
  'update:filter': [value: LobbyFilterState]
  'update:search': [value: string]
}>()

const primaryOptions: LobbyFilterOption[] = [
  { key: 'all', label: '全部', icon: '▦' },
  { key: 'category', label: '類別', icon: '🎰' },
  { key: 'currency', label: '幣別', icon: '金' },
  { key: 'provider', label: '供應商', icon: '▤' },
]

const allSecondaryOptions: LobbyFilterOption[] = [
  { key: 'latest', label: '最新', icon: '★' },
  { key: 'popular', label: '熱門', icon: '🔥' },
  { key: 'favorites', label: '最愛', icon: '♥' },
]

const secondaryOptions = computed(() => {
  if (props.filter.group === 'all') {
    return props.showFavorites
      ? allSecondaryOptions
      : allSecondaryOptions.filter(option => option.key !== 'favorites')
  }
  if (props.filter.group === 'category') return LOBBY_CATEGORY_OPTIONS
  if (props.filter.group === 'currency') return LOBBY_CURRENCY_OPTIONS
  return LOBBY_PROVIDER_OPTIONS
})

function countFor(option: LobbyFilterOption) {
  if (props.filter.group === 'all') return props.counts[option.key as 'latest' | 'popular' | 'favorites']
  if (props.filter.group === 'category') return props.counts.category[option.key as keyof typeof props.counts.category] ?? 0
  if (props.filter.group === 'currency') return props.counts.currency[option.key as keyof typeof props.counts.currency] ?? 0
  return props.counts.provider[option.key] ?? 0
}

function selectGroup(group: LobbyFilterState['group']) {
  emit('update:filter', { group, option: null })
}

function selectOption(option: LobbyFilterOption) {
  emit('update:filter', { group: props.filter.group, option: option.key })
}

function isOptionActive(option: LobbyFilterOption) {
  return props.filter.option === option.key
}
</script>

<template>
  <div class="game-filter-bar" :class="{ 'game-filter-bar-search-first': searchFirst }">
    <div class="game-filter-primary" role="tablist" aria-label="遊戲篩選類型">
      <button
        v-for="item in primaryOptions"
        :key="item.key"
        type="button"
        class="game-filter-primary-btn"
        :class="{ active: filter.group === item.key }"
        role="tab"
        :aria-selected="filter.group === item.key"
        @click="selectGroup(item.key as LobbyFilterState['group'])"
      >
        <span class="game-filter-primary-icon" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
        <strong v-if="item.key === 'all'">{{ counts.all }}</strong>
      </button>
    </div>

    <div class="game-filter-secondary" role="tablist" :aria-label="`${filter.group}篩選選項`">
      <button
        v-for="item in secondaryOptions"
        :key="item.key"
        type="button"
        class="game-filter-secondary-btn"
        :class="{ active: isOptionActive(item), disabled: countFor(item) === 0 && item.key !== 'all' }"
        :disabled="countFor(item) === 0 && item.key !== 'all'"
        role="tab"
        :aria-selected="isOptionActive(item)"
        @click="selectOption(item)"
      >
        <span class="game-filter-secondary-icon" aria-hidden="true">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
        <strong>{{ countFor(item) }}</strong>
      </button>
    </div>

    <div class="game-search-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="game-search-icon" aria-hidden="true">
        <path fill-rule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" clip-rule="evenodd" />
      </svg>
      <input
        :value="search"
        type="search"
        placeholder="搜尋遊戲..."
        class="game-search-input"
        @input="emit('update:search', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
