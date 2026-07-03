const LS_RECENT_GAMES = 'jh_recentGames'
const MAX_RECENT_GAMES = 12

export const useRecentGames = () => {
  const recentGameKeys = useState<string[]>('recentGameKeys', () => [])

  function initRecentGames() {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem(LS_RECENT_GAMES)
      if (saved) recentGameKeys.value = JSON.parse(saved)
    } catch {
      recentGameKeys.value = []
    }
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(LS_RECENT_GAMES, JSON.stringify(recentGameKeys.value))
  }

  function recordRecentGame(key: string) {
    recentGameKeys.value = [
      key,
      ...recentGameKeys.value.filter((item) => item !== key),
    ].slice(0, MAX_RECENT_GAMES)
    persist()
  }

  return {
    recentGameKeys,
    initRecentGames,
    recordRecentGame,
  }
}
