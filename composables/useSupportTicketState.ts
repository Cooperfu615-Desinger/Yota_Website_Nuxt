import {
  siteContent,
  supportQuestionCategories,
  type ChatMessage,
  type ChatPlayerProfile,
  type SupportPlayerReportContext,
  type SupportQuestionCategoryKey,
  type SupportTicket,
} from '~/data/siteContent'

export const MAX_ONGOING_SUPPORT_TICKETS = 1

export interface SupportTicketState {
  tickets: SupportTicket[]
  ticketSequence: number
  messageSequence: number
}

export type SupportTicketFailure =
  | 'max-ongoing'
  | 'invalid-category'
  | 'empty-message'
  | 'not-found'
  | 'closed'
  | 'invalid-report-target'

export type SupportTicketActionResult =
  | { ok: true; ticket: SupportTicket }
  | { ok: false; reason: SupportTicketFailure }

type ReportedPlayer = Pick<ChatPlayerProfile, 'playerId' | 'account' | 'name' | 'avatar'>

function cloneTicket(ticket: SupportTicket): SupportTicket {
  return {
    ...ticket,
    messages: ticket.messages.map(message => ({ ...message })),
    reportContext: ticket.reportContext ? { ...ticket.reportContext } : undefined,
  }
}

function parseTicketSequence(ticketId: string) {
  const match = ticketId.match(/(\d+)$/)
  return match ? Number(match[1]) : 0
}

function createInitialSupportTicketState(): SupportTicketState {
  // `satisfies SupportTicket[]` validates the seed while `siteContent as const`
  // keeps it deeply readonly, so clone it before storing mutable runtime state.
  const sourceTickets = siteContent.chat.supportTickets as unknown as readonly SupportTicket[]
  const tickets = sourceTickets.map(cloneTicket)
  const ticketSequence = Math.max(0, ...tickets.map(ticket => parseTicketSequence(ticket.id)))
  const messageSequence = Math.max(
    0,
    ...tickets.flatMap(ticket => ticket.messages.map(message => message.id)),
  )

  return {
    tickets,
    ticketSequence,
    messageSequence,
  }
}

function isSupportCategoryKey(value: string): value is SupportQuestionCategoryKey {
  return supportQuestionCategories.some(category => category.key === value)
}

function formatMessageTime(now: number) {
  return new Date(now).toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export const useSupportTicketState = () => {
  const supportState = useState<SupportTicketState>(
    'supportTicketState',
    createInitialSupportTicketState,
  )

  const tickets = computed(() => supportState.value.tickets)
  const sortedTickets = computed(() =>
    [...supportState.value.tickets].sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    ),
  )
  const ongoingTickets = computed(() =>
    sortedTickets.value.filter(ticket => ticket.status === 'ongoing'),
  )
  const ongoingCount = computed(() => ongoingTickets.value.length)
  const unreadTotal = computed(() =>
    supportState.value.tickets.reduce((total, ticket) => total + ticket.unread, 0),
  )
  const canCreateTicket = computed(
    () => ongoingCount.value < MAX_ONGOING_SUPPORT_TICKETS,
  )

  function getTicketById(ticketId: string) {
    return supportState.value.tickets.find(ticket => ticket.id === ticketId) ?? null
  }

  function replaceTicket(updatedTicket: SupportTicket) {
    supportState.value.tickets = supportState.value.tickets.map(ticket =>
      ticket.id === updatedTicket.id ? updatedTicket : ticket,
    )
  }

  function nextTicketId() {
    supportState.value.ticketSequence += 1
    return `CS-${String(supportState.value.ticketSequence).padStart(6, '0')}`
  }

  function nextMessageId() {
    supportState.value.messageSequence += 1
    return supportState.value.messageSequence
  }

  function makeMessage(
    text: string,
    now: number,
    sender: 'player' | 'support',
  ): ChatMessage {
    return {
      id: nextMessageId(),
      user: sender === 'player' ? '我' : '客服小幫手',
      avatar: sender === 'player' ? '👤' : '🎧',
      text,
      time: formatMessageTime(now),
      ...(sender === 'player' ? { self: true } : {}),
    }
  }

  function buildTicket(
    categoryKey: SupportQuestionCategoryKey,
    firstMessage: string,
    now: number,
    options?: {
      subject?: string
      reportContext?: SupportPlayerReportContext
    },
  ): SupportTicket {
    const category = supportQuestionCategories.find(item => item.key === categoryKey)!
    const timestamp = new Date(now).toISOString()
    return {
      id: nextTicketId(),
      categoryKey,
      categoryLabel: category.label,
      subject: options?.subject || category.label,
      status: 'ongoing',
      createdAt: timestamp,
      updatedAt: timestamp,
      unread: 0,
      messages: [makeMessage(firstMessage, now, 'player')],
      ...(options?.reportContext ? { reportContext: options.reportContext } : {}),
    }
  }

  function addTicket(ticket: SupportTicket): SupportTicketActionResult {
    supportState.value.tickets = [ticket, ...supportState.value.tickets]
    return { ok: true, ticket }
  }

  function createTicket(
    categoryKey: SupportQuestionCategoryKey | string,
    firstMessage: string,
    now = Date.now(),
  ): SupportTicketActionResult {
    const text = firstMessage.trim()
    if (!isSupportCategoryKey(categoryKey)) {
      return { ok: false, reason: 'invalid-category' }
    }
    if (!text) return { ok: false, reason: 'empty-message' }
    if (!canCreateTicket.value) {
      return { ok: false, reason: 'max-ongoing' }
    }

    return addTicket(buildTicket(categoryKey, text, now))
  }

  function sendMessage(
    ticketId: string,
    text: string,
    now = Date.now(),
  ): SupportTicketActionResult {
    const normalizedText = text.trim()
    if (!normalizedText) return { ok: false, reason: 'empty-message' }

    const ticket = getTicketById(ticketId)
    if (!ticket) return { ok: false, reason: 'not-found' }
    if (ticket.status === 'closed') return { ok: false, reason: 'closed' }

    const updatedTicket: SupportTicket = {
      ...ticket,
      updatedAt: new Date(now).toISOString(),
      messages: [...ticket.messages, makeMessage(normalizedText, now, 'player')],
    }
    replaceTicket(updatedTicket)
    return { ok: true, ticket: updatedTicket }
  }

  // Reserved for API/WebSocket integration. Incoming replies increase the
  // unread counter until the user opens the ticket and calls markTicketRead.
  function receiveSupportMessage(
    ticketId: string,
    text: string,
    now = Date.now(),
  ): SupportTicketActionResult {
    const normalizedText = text.trim()
    if (!normalizedText) return { ok: false, reason: 'empty-message' }

    const ticket = getTicketById(ticketId)
    if (!ticket) return { ok: false, reason: 'not-found' }
    if (ticket.status === 'closed') return { ok: false, reason: 'closed' }

    const updatedTicket: SupportTicket = {
      ...ticket,
      updatedAt: new Date(now).toISOString(),
      unread: ticket.unread + 1,
      messages: [...ticket.messages, makeMessage(normalizedText, now, 'support')],
    }
    replaceTicket(updatedTicket)
    return { ok: true, ticket: updatedTicket }
  }

  function markTicketRead(ticketId: string): SupportTicketActionResult {
    const ticket = getTicketById(ticketId)
    if (!ticket) return { ok: false, reason: 'not-found' }
    if (ticket.unread === 0) return { ok: true, ticket }

    const updatedTicket = { ...ticket, unread: 0 }
    replaceTicket(updatedTicket)
    return { ok: true, ticket: updatedTicket }
  }

  function createPlayerReportTicket(
    player: ReportedPlayer,
    reason: string,
    detail = '',
    now = Date.now(),
  ): SupportTicketActionResult {
    const normalizedReason = reason.trim()
    const normalizedDetail = detail.trim()
    if (!player.playerId || !player.account || !player.name) {
      return { ok: false, reason: 'invalid-report-target' }
    }
    if (!normalizedReason) return { ok: false, reason: 'empty-message' }
    if (!canCreateTicket.value) {
      return { ok: false, reason: 'max-ongoing' }
    }

    const reportContext: SupportPlayerReportContext = {
      playerId: player.playerId,
      account: player.account,
      name: player.name,
      avatar: player.avatar,
      reason: normalizedReason,
      detail: normalizedDetail,
    }
    const firstMessage = [
      `檢舉對象：${player.name}（@${player.account}）`,
      `檢舉原因：${normalizedReason}`,
      ...(normalizedDetail ? [`補充說明：${normalizedDetail}`] : []),
    ].join('\n')
    const ticket = buildTicket('report', firstMessage, now, {
      subject: `檢舉玩家：${player.name}`,
      reportContext,
    })
    return addTicket(ticket)
  }

  function resetSupportTicketState() {
    supportState.value = createInitialSupportTicketState()
  }

  return {
    supportCategories: supportQuestionCategories,
    maxOngoing: MAX_ONGOING_SUPPORT_TICKETS,
    tickets,
    sortedTickets,
    ongoingTickets,
    ongoingCount,
    unreadTotal,
    canCreateTicket,
    getTicketById,
    createTicket,
    sendMessage,
    receiveSupportMessage,
    markTicketRead,
    createPlayerReportTicket,
    resetSupportTicketState,
  }
}
