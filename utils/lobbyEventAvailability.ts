import type { LobbyEvent } from '~/data/siteContent'

export type LobbyEventAvailability = 'upcoming' | 'active' | 'ended' | 'unknown'

function parseTaipeiTime(value: string) {
  if (!/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/.test(value)) return Number.NaN
  return Date.parse(`${value.replace(/\//g, '-').replace(' ', 'T')}:00+08:00`)
}

export function getLobbyEventAvailability(event: LobbyEvent, now: number): LobbyEventAvailability {
  const start = parseTaipeiTime(event.startTime)
  const end = event.endTime === '長期' ? Number.POSITIVE_INFINITY : parseTaipeiTime(event.endTime) + 60_000
  if (!Number.isFinite(start) || Number.isNaN(end) || end <= start) return 'unknown'
  if (now < start) return 'upcoming'
  return now >= end ? 'ended' : 'active'
}
