import { siteContent } from '~/data/siteContent'
import { canDeleteInboxMessage, claimInboxRewards, getClaimableGold, type CenterMessage, type InboxCategory } from '~/utils/messageCenters'

const cloneMessages = (messages: readonly CenterMessage[]): CenterMessage[] => messages.map(message => ({
  ...message, ...(message.attachment ? { attachment: { ...message.attachment } } : {}),
}))

export const useMessageCentersState = () => {
  const announcements = useState<CenterMessage[]>('news-announcements', () => cloneMessages(siteContent.messageCenters.announcements))
  const messages = useState<CenterMessage[]>('personal-inbox-messages', () => cloneMessages(siteContent.messageCenters.messages))
  const readEventIds = useState<number[]>('lobby-read-events', () => [])
  const supportActivityDraft = useState<string>('support-activity-draft', () => '')
  const isLoggedIn = useState('isLoggedIn', () => false)
  const claiming = useState('personal-inbox-claiming', () => false)
  const { addWalletReward, balance } = useFinancialState()

  const newsUnread = computed(() => announcements.value.filter(message => !message.read).length
    + siteContent.lobbyEvents.filter(event => !readEventIds.value.includes(event.id)).length)
  const inboxUnread = computed(() => messages.value.filter(message => !message.read).length)
  function markRead(kind: 'news' | 'inbox', id: number) {
    if (!isLoggedIn.value) return
    const item = (kind === 'news' ? announcements.value : messages.value).find(message => message.id === id)
    if (item) item.read = true
  }
  function markEventRead(id: number) {
    if (isLoggedIn.value && !readEventIds.value.includes(id)) readEventIds.value = [...readEventIds.value, id]
  }
  function deleteMessage(id: number) {
    const item = messages.value.find(message => message.id === id)
    if (!isLoggedIn.value || claiming.value || !item || !canDeleteInboxMessage(item)) return false
    messages.value = messages.value.filter(message => message.id !== id)
    return true
  }
  function claimRewards(ids: number[]) {
    if (!isLoggedIn.value || claiming.value) return { ok: false, total: 0, count: 0 }
    claiming.value = true
    try {
      return claimInboxRewards(messages.value, ids, (amount, titles) => {
        if (!Number.isSafeInteger(balance.value + amount)) return false
        return !!addWalletReward('gold', amount, '信箱附件領取', titles.join('、'))
      })
    } catch {
      return { ok: false, total: 0, count: 0 }
    } finally {
      claiming.value = false
    }
  }
  function claimCategory(category: InboxCategory) {
    return claimRewards(messages.value.filter(message => message.type === category).map(message => message.id))
  }
  function claimableCount(category: InboxCategory) {
    return messages.value.filter(message => message.type === category && !message.attachment?.claimed && getClaimableGold(message) > 0).length
  }
  function resetMessageCenters() {
    announcements.value = cloneMessages(siteContent.messageCenters.announcements)
    messages.value = cloneMessages(siteContent.messageCenters.messages)
    readEventIds.value = []
    supportActivityDraft.value = ''
    claiming.value = false
  }
  return { announcements, messages, readEventIds, supportActivityDraft, claiming, newsUnread, inboxUnread,
    markRead, markEventRead, deleteMessage, claimRewards, claimCategory, claimableCount, resetMessageCenters }
}
