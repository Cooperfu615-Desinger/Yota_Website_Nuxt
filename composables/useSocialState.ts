import { siteContent, type ChatPlayerProfile } from '~/data/siteContent'

export interface SocialPlayer {
  playerId: string
  name: string
  avatar: string
  addedAt: number
}

export interface BlockedPlayer extends SocialPlayer {
  blockedAt: number
}

function initialFriends(): SocialPlayer[] {
  return siteContent.chat.onlinePlayers
    .filter(player => player.isFriend)
    .map(player => ({
      playerId: player.playerId,
      name: player.name,
      avatar: player.avatar,
      addedAt: 0,
    }))
}

export const useSocialState = () => {
  // 好友與黑名單是本次瀏覽工作階段的 Mock；重新整理後回到初始資料。
  const friends = useState<SocialPlayer[]>('socialFriends', initialFriends)
  const blockedPlayers = useState<BlockedPlayer[]>('blockedPlayers', () => [])

  // 保留舊函式名稱，讓既有 layout 不必在同一批次同步重寫。
  function initSocialFromStorage() {}

  function addFriend(player: ChatPlayerProfile) {
    if (friends.value.some(friend => friend.playerId === player.playerId)) return false
    friends.value = [
      ...friends.value,
      {
        playerId: player.playerId,
        name: player.name,
        avatar: player.avatar,
        addedAt: Date.now(),
      },
    ]
    return true
  }

  function removeFriend(playerId: string) {
    const before = friends.value.length
    friends.value = friends.value.filter(friend => friend.playerId !== playerId)
    return friends.value.length !== before
  }

  function isFriendPlayer(playerId?: string) {
    if (!playerId) return false
    return friends.value.some(friend => friend.playerId === playerId)
  }

  function blockPlayer(player: ChatPlayerProfile) {
    if (blockedPlayers.value.some(blocked => blocked.playerId === player.playerId)) return false
    blockedPlayers.value = [
      ...blockedPlayers.value,
      {
        playerId: player.playerId,
        name: player.name,
        avatar: player.avatar,
        addedAt: Date.now(),
        blockedAt: Date.now(),
      },
    ]
    removeFriend(player.playerId)
    return true
  }

  function unblockPlayer(playerId: string) {
    const before = blockedPlayers.value.length
    blockedPlayers.value = blockedPlayers.value.filter(player => player.playerId !== playerId)
    return blockedPlayers.value.length !== before
  }

  function isBlockedPlayer(playerId?: string) {
    if (!playerId) return false
    return blockedPlayers.value.some(player => player.playerId === playerId)
  }

  function resetSocialState() {
    friends.value = initialFriends()
    blockedPlayers.value = []
  }

  return {
    friends,
    blockedPlayers,
    initSocialFromStorage,
    addFriend,
    removeFriend,
    isFriendPlayer,
    blockPlayer,
    unblockPlayer,
    isBlockedPlayer,
    resetSocialState,
  }
}
