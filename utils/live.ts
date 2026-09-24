export interface LiveStream {
  id: number
  name: string
  title: string
  category: string
  status: string
  viewers: number
  icon: string
}

export function filterLiveStreams(streams: readonly LiveStream[], category: string, query: string, onlyFavorites: boolean, favorites: readonly number[]) {
  return streams.filter(stream => (category === '全部' || stream.category === category)
    && (!onlyFavorites || favorites.includes(stream.id))
    && `${stream.name}${stream.title}`.toLowerCase().includes(query.toLowerCase()))
}

export function toggleLiveFavorite(favorites: readonly number[], id: number) {
  return favorites.includes(id) ? favorites.filter(value => value !== id) : [...favorites, id]
}

export function recordLiveWatch(watched: readonly number[], stream: LiveStream) {
  return stream.status === 'LIVE' ? [stream.id, ...watched.filter(id => id !== stream.id)] : [...watched]
}

export function liveRankScore(index: number, period: 'month' | 'week' | 'day') {
  const base = index < 3 ? 8000 - index * 1730 : 2100 - (index - 3) * 550
  return Math.round(base / (period === 'month' ? 1 : period === 'week' ? 4 : 16))
}

export function normalizeLiveMessage(text: string) {
  return text.slice(0, 200).trim()
}
