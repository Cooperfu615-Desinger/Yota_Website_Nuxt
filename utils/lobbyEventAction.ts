import type { LobbyEvent } from '../data/siteContent'
import { getLobbyEventAvailability } from './lobbyEventAvailability.ts'

export function getLobbyEventAction(event: LobbyEvent, now: number) {
  const action = event.action
  if (!action?.label.trim() || !['support', 'games', 'store', 'vip'].includes(action.target)) return null
  if (action.target !== 'support' && getLobbyEventAvailability(event, now) !== 'active') return null
  return { ...action, label: action.label.trim() }
}
