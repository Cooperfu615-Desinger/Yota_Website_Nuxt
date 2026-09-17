import type {
  GameItem,
  LobbyCurrencyKey,
  LobbyFilterCategoryKey,
} from '~/data/siteContent'

export type LobbyFilterGroup = 'all' | 'category' | 'currency' | 'provider'
export type LobbyQuickFilter = 'latest' | 'popular' | 'favorites'

export interface LobbyFilterState {
  group: LobbyFilterGroup
  option: LobbyQuickFilter | LobbyFilterCategoryKey | LobbyCurrencyKey | string | null
}

export interface LobbyFilterCounts {
  all: number
  latest: number
  popular: number
  favorites: number
  category: Record<LobbyFilterCategoryKey, number>
  currency: Record<LobbyCurrencyKey, number>
  provider: Record<string, number>
}

export interface LobbyFilterOption {
  key: string
  label: string
  icon: string
}

export const DEFAULT_LOBBY_FILTER: LobbyFilterState = { group: 'all', option: null }

export const LOBBY_CATEGORY_OPTIONS: LobbyFilterOption[] = [
  { key: 'slots', label: '老虎機', icon: '🎰' },
  { key: 'board', label: '棋牌', icon: '♠' },
  { key: 'live', label: '真人', icon: '◉' },
  { key: 'fish', label: '魚機', icon: '🐟' },
  { key: 'mini', label: '迷你', icon: '✦' },
  { key: 'lottery', label: '彩票', icon: '◎' },
]

export const LOBBY_CURRENCY_OPTIONS: LobbyFilterOption[] = [
  { key: 'gold', label: '金', icon: '金' },
  { key: 'silver', label: '銀', icon: '銀' },
  { key: 'bronze', label: '銅', icon: '銅' },
]

export const LOBBY_PROVIDER_OPTIONS: LobbyFilterOption[] = [
  { key: 'all', label: '全部', icon: '▦' },
  { key: 'EVO', label: 'EVO', icon: 'E' },
  { key: 'RSG', label: 'RSG', icon: 'R' },
  { key: 'ATG', label: 'ATG', icon: 'A' },
  { key: 'BNG', label: 'BNG', icon: 'B' },
  { key: 'QT', label: 'QT', icon: 'Q' },
  { key: 'GR', label: 'GR', icon: 'G' },
  { key: 'T9', label: 'T9', icon: '9' },
  { key: 'JH', label: 'JH', icon: 'J' },
  { key: 'PG', label: 'PG', icon: 'P' },
]

const categoryMap: Record<string, LobbyFilterCategoryKey> = {
  slots: 'slots',
  baccarat: 'live',
  live: 'live',
  cards: 'board',
  card: 'board',
  dice: 'board',
  fish: 'fish',
  mini: 'mini',
  lottery: 'lottery',
}

const providerMap: Record<string, string> = {
  Evolution: 'EVO',
  'JH Gaming': 'JH',
  'PG Soft': 'PG',
}

const currencyFallback: Record<string, LobbyCurrencyKey[]> = {
  slots: ['gold', 'silver', 'bronze'],
  baccarat: ['gold', 'silver'],
  live: ['gold', 'silver'],
  cards: ['silver', 'bronze'],
  card: ['silver', 'bronze'],
  dice: ['gold', 'bronze'],
  fish: ['silver', 'bronze'],
}

export function getLobbyCategory(game: GameItem): LobbyFilterCategoryKey {
  return game.filterCategory ?? categoryMap[game.category] ?? 'slots'
}

export function getLobbyProvider(game: GameItem): string {
  return game.providerKey ?? providerMap[game.provider] ?? game.provider.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function getLobbyCurrencies(game: GameItem): LobbyCurrencyKey[] {
  return game.supportedCurrencies ?? currencyFallback[game.category] ?? ['gold', 'silver', 'bronze']
}

export function isLatestGame(game: GameItem) {
  return game.badge === '新上線' || game.key.includes('newgame')
}

export function isPopularGame(game: GameItem) {
  return game.badge === '熱門' || game.key.includes('hotgame')
}

function matchesSelectedFilter(game: GameItem, filter: LobbyFilterState, favorites: Set<string>) {
  if (filter.group === 'all') {
    if (!filter.option) return true
    if (filter.option === 'latest') return isLatestGame(game)
    if (filter.option === 'popular') return isPopularGame(game)
    if (filter.option === 'favorites') return favorites.has(game.key)
    return true
  }
  if (filter.group === 'category') return !filter.option || getLobbyCategory(game) === filter.option
  if (filter.group === 'currency') return !filter.option || getLobbyCurrencies(game).includes(filter.option as LobbyCurrencyKey)
  return !filter.option || filter.option === 'all' || getLobbyProvider(game) === filter.option
}

export function filterLobbyGames(
  games: GameItem[],
  filter: LobbyFilterState,
  search: string,
  favoriteKeys: string[] = [],
) {
  const query = search.trim().toLowerCase()
  const favorites = new Set(favoriteKeys)
  return games.filter((game) => {
    if (!matchesSelectedFilter(game, filter, favorites)) return false
    if (!query) return true
    return [game.name, game.desc, game.provider]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query))
  })
}

export function getLobbyFilterCounts(games: GameItem[], favoriteKeys: string[] = []): LobbyFilterCounts {
  const category = Object.fromEntries(LOBBY_CATEGORY_OPTIONS.map(({ key }) => [key, 0])) as Record<LobbyFilterCategoryKey, number>
  const currency = Object.fromEntries(LOBBY_CURRENCY_OPTIONS.map(({ key }) => [key, 0])) as Record<LobbyCurrencyKey, number>
  const provider: Record<string, number> = { all: games.length }

  for (const game of games) {
    category[getLobbyCategory(game)] += 1
    for (const key of getLobbyCurrencies(game)) currency[key] += 1
    const providerKey = getLobbyProvider(game)
    provider[providerKey] = (provider[providerKey] ?? 0) + 1
  }

  return {
    all: games.length,
    latest: games.filter(isLatestGame).length,
    popular: games.filter(isPopularGame).length,
    favorites: favoriteKeys.length,
    category,
    currency,
    provider,
  }
}
