const LS_FAVORITE_GAMES = 'jh_favoriteGames'

export const useFavoriteGames = () => {
  const favoriteGameKeys = useState<string[]>('favoriteGameKeys', () => [])
  const initialized = useState('favoriteGamesInitialized', () => false)

  function initFavoriteGames() {
    if (!import.meta.client || initialized.value) return
    initialized.value = true
    try {
      const saved = localStorage.getItem(LS_FAVORITE_GAMES)
      const parsed = saved ? JSON.parse(saved) : []
      favoriteGameKeys.value = Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === 'string')
        : []
    } catch {
      favoriteGameKeys.value = []
    }
  }

  function toggleFavoriteGame(key: string) {
    const next = favoriteGameKeys.value.includes(key)
      ? favoriteGameKeys.value.filter((item) => item !== key)
      : [...favoriteGameKeys.value, key]
    favoriteGameKeys.value = next
    if (import.meta.client) localStorage.setItem(LS_FAVORITE_GAMES, JSON.stringify(next))
  }

  return { favoriteGameKeys, initFavoriteGames, toggleFavoriteGame }
}
