<script setup lang="ts">
import { siteContent, type GameItem, type LobbyGameCategory } from '~/data/siteContent'

const emit = defineEmits<{ play: [key: string, mode: 'real' | 'demo'] }>()

type LobbyCategoryKey = LobbyGameCategory['key']

const PAGE_SIZE = 20
const gameImagePool = siteContent.lobbyGames
  .map((game) => game.imageSrc)
  .filter((src): src is string => Boolean(src))
const allGames: GameItem[] = siteContent.lobbyGames.map((game, index) => ({
  ...game,
  imageSrc: game.imageSrc ?? (gameImagePool.length ? gameImagePool[index % gameImagePool.length] : undefined),
})) as GameItem[]
const categories = siteContent.lobbyGameCategories as LobbyGameCategory[]
const { recentGameKeys, initRecentGames, recordRecentGame } = useRecentGames()

const activeCategory = ref<LobbyCategoryKey>('lobby')
const searchQuery = ref('')
const sortMode = ref('hot')
const selectedProviders = ref<string[]>([])
const page = ref(1)

onMounted(initRecentGames)

const providers = computed(() =>
  Array.from(new Set(allGames.map((game) => game.provider))).sort((a, b) => a.localeCompare(b))
)

const recentGames = computed(() =>
  recentGameKeys.value
    .map((key) => allGames.find((game) => game.key === key))
    .filter((game): game is GameItem => Boolean(game))
)

const filteredListGames = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const providersFilter = selectedProviders.value

  const filtered = allGames.filter((game) => {
    if (!matchesCategory(game, activeCategory.value)) return false
    if (providersFilter.length && !providersFilter.includes(game.provider)) return false
    if (!q) return true

    return [game.name, game.desc, game.provider]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(q))
  })

  return sortGames(filtered, sortMode.value)
})

const homeSections = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const source = q
    ? allGames.filter((game) =>
        [game.name, game.desc, game.provider]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q))
      )
    : allGames
  const recentSource = q
    ? recentGames.value.filter((game) =>
        [game.name, game.desc, game.provider]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q))
      )
    : recentGames.value

  const sections = [
    { key: 'continue', title: '繼續遊戲', games: recentSource },
    { key: 'hot', title: '熱門遊戲', games: source.filter((game) => matchesCategory(game, 'hot')) },
    { key: 'slots', title: '老虎機', games: source.filter((game) => matchesCategory(game, 'slots')) },
    { key: 'live', title: '真人', games: source.filter((game) => matchesCategory(game, 'live')) },
    { key: 'fish', title: '捕魚機', games: source.filter((game) => matchesCategory(game, 'fish')) },
    { key: 'cards', title: '棋牌', games: source.filter((game) => matchesCategory(game, 'cards')) },
    { key: 'latest', title: '最新', games: source.filter((game) => matchesCategory(game, 'latest')) },
  ]

  return sections
    .filter((section) => section.key !== 'continue' || section.games.length > 0)
    .map((section) => ({ ...section, games: section.games.slice(0, 12) }))
})

watch([activeCategory, searchQuery, sortMode, selectedProviders], () => {
  page.value = 1
}, { deep: true })

function setCategory(category: string) {
  if (category === 'lobby') {
    activeCategory.value = 'lobby'
    selectedProviders.value = []
    sortMode.value = 'hot'
    return
  }
  activeCategory.value = category as LobbyCategoryKey
}

function viewCategory(category: string) {
  activeCategory.value = category === 'continue' ? 'all' : category as LobbyCategoryKey
}

function handlePlay(key: string, mode: 'real' | 'demo') {
  recordRecentGame(key)
  emit('play', key, mode)
}

function matchesCategory(game: GameItem, category: string) {
  if (category === 'lobby' || category === 'all') return true
  if (category === 'hot') return game.badge === '熱門'
  if (category === 'latest') return game.badge === '新上線' || game.key.includes('newgame')
  if (category === 'live') return game.category === 'baccarat'
  return game.category === category
}

function sortGames(games: GameItem[], mode: string) {
  const list = [...games]
  if (mode === 'az') return list.sort((a, b) => a.name.localeCompare(b.name))
  if (mode === 'za') return list.sort((a, b) => b.name.localeCompare(a.name))
  if (mode === 'latest') {
    return list.sort((a, b) => Number(matchesCategory(b, 'latest')) - Number(matchesCategory(a, 'latest')))
  }
  return list.sort((a, b) => Number(b.badge === '熱門') - Number(a.badge === '熱門'))
}
</script>

<template>
  <div class="game-grid-wrap">
    <LobbyGameHome
      v-if="activeCategory === 'lobby'"
      :category="activeCategory"
      :search="searchQuery"
      :categories="categories"
      :sections="homeSections"
      @update:category="setCategory"
      @update:search="searchQuery = $event"
      @view-category="viewCategory"
      @play="handlePlay"
    />

    <LobbyGameCategoryView
      v-else
      :category="activeCategory"
      :search="searchQuery"
      :categories="categories"
      :games="filteredListGames"
      :providers="providers"
      :sort-mode="sortMode"
      :selected-providers="selectedProviders"
      :page="page"
      :page-size="PAGE_SIZE"
      @update:category="setCategory"
      @update:search="searchQuery = $event"
      @update:sort-mode="sortMode = $event"
      @update:selected-providers="selectedProviders = $event"
      @update:page="page = $event"
      @play="handlePlay"
    />
  </div>
</template>
