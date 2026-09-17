<script setup lang="ts">
import { siteContent, type GameItem } from '~/data/siteContent'
import {
  DEFAULT_LOBBY_FILTER,
  filterLobbyGames,
  getLobbyFilterCounts,
  getLobbyCategory,
  isLatestGame,
  isPopularGame,
  type LobbyFilterState,
} from '~/utils/lobbyFilters'

const emit = defineEmits<{ play: [key: string, mode: 'real' | 'demo'] }>()

const PAGE_SIZE = 20
const gameImagePool = siteContent.lobbyGames
  .map((game) => game.imageSrc)
  .filter((src): src is string => Boolean(src))
const allGames: GameItem[] = siteContent.lobbyGames.map((game, index) => ({
  ...game,
  imageSrc: game.imageSrc ?? (gameImagePool.length ? gameImagePool[index % gameImagePool.length] : undefined),
})) as GameItem[]

const filter = ref<LobbyFilterState>({ ...DEFAULT_LOBBY_FILTER })
const searchQuery = ref('')
const sortMode = ref('hot')
const page = ref(1)
const { recentGameKeys, initRecentGames, recordRecentGame } = useRecentGames()
const { favoriteGameKeys, initFavoriteGames, toggleFavoriteGame } = useFavoriteGames()

onMounted(() => {
  initRecentGames()
  initFavoriteGames()
})

const filterCounts = computed(() => getLobbyFilterCounts(allGames, favoriteGameKeys.value))
const filteredGames = computed(() => filterLobbyGames(allGames, filter.value, searchQuery.value, favoriteGameKeys.value))
const filteredListGames = computed(() => sortGames(filteredGames.value, sortMode.value))
const showHome = computed(() => filter.value.group === 'all' && filter.value.option === null)

const recentGames = computed(() =>
  recentGameKeys.value
    .map((key) => allGames.find((game) => game.key === key))
    .filter((game): game is GameItem => Boolean(game))
)

const homeSections = computed(() => {
  const source = filteredGames.value
  const query = searchQuery.value.trim().toLowerCase()
  const recentSource = query
    ? recentGames.value.filter((game) => matchesSearch(game, query))
    : recentGames.value

  const sections = [
    { key: 'continue', title: '繼續遊戲', games: recentSource },
    { key: 'hot', title: '熱門遊戲', games: source.filter(isPopularGame) },
    { key: 'slots', title: '老虎機', games: source.filter((game) => getLobbyCategory(game) === 'slots') },
    { key: 'live', title: '真人', games: source.filter((game) => getLobbyCategory(game) === 'live') },
    { key: 'fish', title: '魚機', games: source.filter((game) => getLobbyCategory(game) === 'fish') },
    { key: 'board', title: '棋牌', games: source.filter((game) => getLobbyCategory(game) === 'board') },
    { key: 'latest', title: '最新', games: source.filter(isLatestGame) },
  ]

  return sections
    .filter((section) => section.key !== 'continue' || section.games.length > 0)
    .map((section) => ({ ...section, games: section.games.slice(0, 12) }))
})

watch([filter, searchQuery, sortMode], () => {
  page.value = 1
}, { deep: true })

function matchesSearch(game: GameItem, query: string) {
  return [game.name, game.desc, game.provider]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query))
}

function setFilter(nextFilter: LobbyFilterState) {
  filter.value = { ...nextFilter }
}

function viewCategory(section: string) {
  if (section === 'continue') {
    setFilter({ group: 'all', option: null })
    return
  }
  if (section === 'hot') {
    setFilter({ group: 'all', option: 'popular' })
    return
  }
  if (section === 'latest') {
    setFilter({ group: 'all', option: 'latest' })
    return
  }
  const category = section === 'cards' ? 'board' : section
  setFilter({ group: 'category', option: category })
}

function handlePlay(key: string, mode: 'real' | 'demo') {
  recordRecentGame(key)
  emit('play', key, mode)
}

function sortGames(games: GameItem[], mode: string) {
  const list = [...games]
  if (mode === 'az') return list.sort((a, b) => a.name.localeCompare(b.name))
  if (mode === 'za') return list.sort((a, b) => b.name.localeCompare(a.name))
  if (mode === 'latest') return list.sort((a, b) => Number(isLatestGame(b)) - Number(isLatestGame(a)))
  return list.sort((a, b) => Number(isPopularGame(b)) - Number(isPopularGame(a)))
}
</script>

<template>
  <div class="game-grid-wrap">
    <LobbyGameHome
      v-if="showHome"
      :filter="filter"
      :search="searchQuery"
      :counts="filterCounts"
      :sections="homeSections"
      :favorite-keys="favoriteGameKeys"
      @update:filter="setFilter"
      @update:search="searchQuery = $event"
      @view-category="viewCategory"
      @toggle-favorite="toggleFavoriteGame"
      @play="handlePlay"
    />

    <LobbyGameCategoryView
      v-else
      :filter="filter"
      :search="searchQuery"
      :counts="filterCounts"
      :games="filteredListGames"
      :page="page"
      :page-size="PAGE_SIZE"
      :sort-mode="sortMode"
      :favorite-keys="favoriteGameKeys"
      @update:filter="setFilter"
      @update:search="searchQuery = $event"
      @update:sort-mode="sortMode = $event"
      @update:page="page = $event"
      @toggle-favorite="toggleFavoriteGame"
      @play="handlePlay"
    />
  </div>
</template>
