import type { GameItem } from '~/data/siteContent'

export interface UseGameFilterOptions {
  initialCategory?: string
  initialSearch?: string
}

export const useGameFilter = (
  games: MaybeRefOrGetter<GameItem[]>,
  options: UseGameFilterOptions = {}
) => {
  const activeCategory = ref(options.initialCategory ?? 'all')
  const searchQuery = ref(options.initialSearch ?? '')

  const filteredGames = computed((): GameItem[] => {
    const q = searchQuery.value.trim().toLowerCase()

    return toValue(games).filter((game) => {
      const matchesCategory =
        activeCategory.value === 'all' ||
        (activeCategory.value === 'hot' && game.badge === '熱門') ||
        game.category === activeCategory.value

      if (!matchesCategory) return false
      if (!q) return true

      return [game.name, game.desc, game.provider]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    })
  })

  return {
    activeCategory,
    searchQuery,
    filteredGames,
  }
}
