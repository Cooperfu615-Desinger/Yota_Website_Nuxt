import type { ChatPlayerProfile } from '~/data/siteContent'

const LS_BLOCKED_PLAYERS_KEY = 'jh_blockedPlayers'

export interface BlockedPlayer {
  playerId: string
  name: string
  avatar: string
  blockedAt: number
}

export const useSocialState = () => {
  const blockedPlayers = useState<BlockedPlayer[]>('blockedPlayers', () => [])

  function initSocialFromStorage() {
    if (!import.meta.client) return
    try {
      const saved = localStorage.getItem(LS_BLOCKED_PLAYERS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<BlockedPlayer>[]
        blockedPlayers.value = parsed
          .map(player => ({
            playerId: String(player.playerId || ''),
            name: player.name || '未知玩家',
            avatar: player.avatar || '',
            blockedAt: typeof player.blockedAt === 'number' ? player.blockedAt : Date.now(),
          }))
          .filter(player => player.playerId)
      }
    } catch {}
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(LS_BLOCKED_PLAYERS_KEY, JSON.stringify(blockedPlayers.value))
  }

  function blockPlayer(player: ChatPlayerProfile) {
    if (blockedPlayers.value.some(blocked => blocked.playerId === player.playerId)) return
    blockedPlayers.value = [
      ...blockedPlayers.value,
      {
        playerId: player.playerId,
        name: player.name,
        avatar: player.avatar,
        blockedAt: Date.now(),
      },
    ]
    persist()
  }

  function unblockPlayer(playerId: string) {
    blockedPlayers.value = blockedPlayers.value.filter(player => player.playerId !== playerId)
    persist()
  }

  function isBlockedPlayer(playerId?: string) {
    if (!playerId) return false
    return blockedPlayers.value.some(player => player.playerId === playerId)
  }

  return {
    blockedPlayers,
    initSocialFromStorage,
    blockPlayer,
    unblockPlayer,
    isBlockedPlayer,
  }
}
