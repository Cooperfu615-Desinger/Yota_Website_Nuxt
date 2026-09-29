export type NewsCategory = 'events' | 'game' | 'maintenance' | 'system'
export type InboxCategory = 'system' | 'promo' | 'adjustment' | 'personal'
export interface CenterMessage {
  id: number
  type: Exclude<NewsCategory, 'events'> | InboxCategory
  title: string
  date: string
  content: string
  read: boolean
  attachment?: { type: string; label: string; amount: string; claimed?: boolean }
}

/** Match APP: only explicit positive safe-integer gold attachments can be credited. */
export function getClaimableGold(message: Pick<CenterMessage, 'attachment'>): number {
  const attachment = message.attachment
  if (attachment?.type !== 'coins' || !/^(?:[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+) 金幣$/.test(attachment.amount)) return 0
  const amount = Number(attachment.amount.replace(/[^\d]/g, ''))
  return Number.isSafeInteger(amount) && amount > 0 ? amount : 0
}

export function canDeleteInboxMessage(message: CenterMessage): boolean {
  return !message.attachment || message.attachment.claimed === true
}

export function claimInboxRewards(
  messages: CenterMessage[], ids: number[], credit: (amount: number, titles: string[]) => boolean,
) {
  const requested = new Set(ids)
  const eligible = messages.filter(message => requested.has(message.id) && !message.attachment?.claimed && getClaimableGold(message) > 0)
  const total = eligible.reduce((sum, message) => sum + getClaimableGold(message), 0)
  if (!eligible.length || !Number.isSafeInteger(total) || total <= 0) return { ok: false, total: 0, count: 0 }
  // Credit first: failed wallet writes must leave every attachment available for retry.
  if (!credit(total, eligible.map(message => message.title))) return { ok: false, total: 0, count: 0 }
  for (const message of eligible) message.attachment!.claimed = true
  return { ok: true, total, count: eligible.length }
}
