import type { GameItem } from '~/data/siteContent'
import {
  DEFAULT_LOBBY_FILTER,
  filterLobbyGames,
  getLobbyFilterCounts,
  type LobbyFilterState,
} from '~/utils/lobbyFilters'

export const useLobbyGameFilter = (
  games: MaybeRefOrGetter<GameItem[]>,
  options: { includeFavorites?: boolean } = {},
) => {
  const filter = ref<LobbyFilterState>({ ...DEFAULT_LOBBY_FILTER })
  const searchQuery = ref('')
  const { favoriteGameKeys, initFavoriteGames } = useFavoriteGames()
  const includeFavorites = options.includeFavorites ?? true

  const filterCounts = computed(() => getLobbyFilterCounts(toValue(games), favoriteGameKeys.value))
  const filteredGames = computed(() => filterLobbyGames(
    toValue(games),
    includeFavorites ? filter.value : (filter.value.option === 'favorites' ? DEFAULT_LOBBY_FILTER : filter.value),
    searchQuery.value,
    favoriteGameKeys.value,
  ))

  return {
    filter,
    searchQuery,
    filteredGames,
    filterCounts,
    favoriteGameKeys,
    initFavoriteGames,
  }
}
