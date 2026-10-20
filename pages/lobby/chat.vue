<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import type {
  ChatMessage,
  ChatPlayerProfile,
  GuildMember,
  OnlinePlayer,
  PrivateConversation,
  SupportQuestionCategoryKey,
  SupportTicket,
} from '~/data/siteContent'

definePageMeta({ layout: 'lobby' })

type Channel = 'world' | 'guild' | 'private' | 'support'
const activeChannel = ref<Channel>('world')
type GuildRole = '職員' | '主任' | '總經理' | '總裁'
type RosterType = 'world' | 'guild' | 'private'
const { blockPlayer, isBlockedPlayer, isFriendPlayer } = useSocialState()
const { joinedGuild, initGuildState, joinGuild } = useGuildState()
const activeGuildRole = useState<GuildRole>('guildActiveRole', () => '職員')
const route = useRoute()
const router = useRouter()
const { supportActivityDraft } = useMessageCentersState()
const activityDraftText = ref('')
const {
  supportCategories,
  maxOngoing,
  sortedTickets,
  ongoingCount,
  unreadTotal: supportUnreadTotal,
  canCreateTicket,
  getTicketById,
  createTicket,
  sendMessage: sendSupportMessage,
  markTicketRead,
  createPlayerReportTicket,
} = useSupportTicketState()

const channels: { key: Channel; label: string; icon: string }[] = [
  { key: 'world',   label: '世界頻道', icon: '🌐' },
  { key: 'guild',   label: '集團頻道', icon: '⚔️' },
  { key: 'private', label: '私人頻道', icon: '🔒' },
  { key: 'support', label: '客服頻道', icon: '🎧' },
]

function clonePlayer<T extends ChatPlayerProfile>(player: T): T {
  return {
    ...player,
    recentGames: player.recentGames.map(game => ({ ...game })),
  } as T
}

// 世界頻道仍使用頁面區域 Mock；客服案件由 useState 跨元件共用。
const worldMessages = ref<ChatMessage[]>([...siteContent.chat.worldMessages])
const guildMessages = ref<ChatMessage[]>([
  ...siteContent.guildChatMessages,
  { id: 4, user: '王牌獵手', avatar: '🃏', text: '今天晚點有人一起玩嗎？', time: '14:27' },
])
const guildInviteIds = ref<string[]>([])
const guildInviteNotice = ref('')
const mutedGuildMemberExpirations = ref<Record<string, number>>({})
const pendingMutePlayer = ref<string | null>(null)
const mutedComposerPlayerName = ref<string | null>(null)
const chatClockNow = ref(Date.now())
let chatClock: ReturnType<typeof setInterval> | undefined
const guildRoleRanks: Record<GuildRole, number> = { 職員: 1, 主任: 2, 總經理: 3, 總裁: 4 }
const canInviteGuild = computed(() => Boolean(joinedGuild.value) && ['主任', '總經理', '總裁'].includes(activeGuildRole.value))
const canMuteGuild = computed(() => Boolean(joinedGuild.value) && ['主任', '總經理', '總裁'].includes(activeGuildRole.value))
const guildRosterPlayers = computed<OnlinePlayer[]>(() => siteContent.guildMembers.map((member: GuildMember, index) => ({
  id: index + 1,
  playerId: `GUILD-MEMBER-${index + 1}`,
  account: `guild_member_${index + 1}`,
  name: member.name,
  avatar: member.avatar,
  vip: member.vip,
  level: 20 + index,
  status: member.isOnline ? '在線' : '閒置',
  bio: `${member.title}，目前和集團夥伴一起累積影響力。`,
  recentGames: [
    { id: 1, name: '百萬大獎賽', color: '#92400e' },
    { id: 2, name: '招財貓百家樂', color: '#1d4ed8' },
    { id: 3, name: '神龍傳奇', color: '#581c87' },
  ],
})))
const activeGuildMutedNames = computed(() => Object.entries(mutedGuildMemberExpirations.value)
  .filter(([, expiresAt]) => expiresAt > chatClockNow.value)
  .map(([name]) => name))
const activeComposerMuteExpiresAt = computed(() => mutedComposerPlayerName.value
  ? mutedGuildMemberExpirations.value[mutedComposerPlayerName.value] ?? 0
  : 0)
const isCurrentGuildMemberMuted = computed(() => activeComposerMuteExpiresAt.value > chatClockNow.value)
const currentMuteRemaining = computed(() => isCurrentGuildMemberMuted.value
  ? Math.ceil((activeComposerMuteExpiresAt.value - chatClockNow.value) / 60_000)
  : 0)
const guildModeratableUsers = computed(() => {
  if (!canMuteGuild.value) return []
  const names = new Set(guildMessages.value.filter(message => !message.self).map(message => message.user))
  return [...names].filter((name) => {
    const member = siteContent.guildMembers.find(candidate => candidate.name === name)
    return member
      && guildRoleRanks[activeGuildRole.value] > (guildRoleRanks[member.title as GuildRole] ?? 0)
      && (mutedGuildMemberExpirations.value[name] ?? 0) <= chatClockNow.value
  })
})

// 私人對話（深拷貝 seed，避免動到 as const 來源）+ 主從導覽狀態
const conversations = ref<PrivateConversation[]>(
  siteContent.chat.privateConversations.map(c => ({
    ...c,
    peer: clonePlayer(c.peer),
    messages: [...c.messages],
  }))
)
const activeConvId = ref<number | null>(null)   // null = 顯示清單
const activeConv = computed(() => conversations.value.find(c => c.id === activeConvId.value) || null)
const activePeerBlocked = computed(() => activeConv.value ? isBlockedPlayer(activeConv.value.peer.playerId) : false)

// 客服頻道主從導覽：清單 → 類別選擇 → 草稿對話／既有案件。
const activeSupportTicketId = ref<string | null>(null)
const activeSupportTicket = computed<SupportTicket | null>(() =>
  activeSupportTicketId.value ? getTicketById(activeSupportTicketId.value) : null
)
const choosingSupportCategory = ref(false)
const supportDraftCategoryKey = ref<SupportQuestionCategoryKey | null>(null)
const supportDraftCategory = computed(() =>
  supportCategories.find(category => category.key === supportDraftCategoryKey.value) ?? null
)
const supportFilter = ref<'all' | 'ongoing' | 'closed'>('all')

function openConversation(conv: PrivateConversation) {
  activeConvId.value = conv.id
  conv.unread = 0
}
function backToList() { activeConvId.value = null }

function openSupportList() {
  activityDraftText.value = ''
  activeSupportTicketId.value = null
  supportDraftCategoryKey.value = null
  choosingSupportCategory.value = false
}

function openSupportTicket(ticketId: string) {
  const result = markTicketRead(ticketId)
  if (!result.ok) {
    showNotice('目前找不到這筆提問紀錄。')
    openSupportList()
    return
  }
  activeSupportTicketId.value = ticketId
  supportDraftCategoryKey.value = null
  choosingSupportCategory.value = false
}

function startSupportQuestion() {
  if (!canCreateTicket.value) {
    showNotice(`同時最多只能有 ${maxOngoing} 筆進行中的提問。`)
  }
  activeSupportTicketId.value = null
  supportDraftCategoryKey.value = null
  choosingSupportCategory.value = true
}

function selectSupportCategory(categoryKey: SupportQuestionCategoryKey) {
  activityDraftText.value = ''
  if (!canCreateTicket.value) {
    showNotice(`同時最多只能有 ${maxOngoing} 筆進行中的提問。`)
    return
  }
  activeSupportTicketId.value = null
  supportDraftCategoryKey.value = categoryKey
  choosingSupportCategory.value = false
}

function makeMsg(text: string): ChatMessage {
  return {
    id: Date.now(),
    user: '我',
    avatar: '👤',
    text,
    time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
    self: true,
  }
}

function sendWorld(text: string)   { worldMessages.value.push(makeMsg(text)) }
function sendGuild(text: string)   { guildMessages.value.push(makeMsg(text)) }
function sendSupport(text: string) {
  if (supportDraftCategoryKey.value) {
    const result = createTicket(supportDraftCategoryKey.value, text)
    if (!result.ok) {
      showSupportFailure(result.reason)
      return
    }
    activeSupportTicketId.value = result.ticket.id
    supportDraftCategoryKey.value = null
    showNotice('提問已建立，客服將盡快回覆。')
    return
  }
  if (!activeSupportTicket.value) return
  const result = sendSupportMessage(activeSupportTicket.value.id, text)
  if (!result.ok) showSupportFailure(result.reason)
}
function sendPrivate(text: string) {
  if (activePeerBlocked.value) {
    showNotice('此玩家已在黑名單中，無法傳送私人訊息。')
    return
  }
  if (activeConv.value) activeConv.value.messages.push(makeMsg(text))
}

// 世界頻道玩家清單抽屜 + 玩家小卡
const playerList = siteContent.chat.onlinePlayers.map(player => clonePlayer(player))
const showRoster = ref(false)
const rosterType = ref<RosterType>('world')
const privateFriendSearch = ref('')
const selectedPlayer = ref<ChatPlayerProfile | null>(null)
const reportTarget = ref<ChatPlayerProfile | null>(null)
const pageNotice = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | null = null

const playerDirectory = computed(() => {
  const players = new Map<string, ChatPlayerProfile>()
  for (const player of playerList) players.set(player.name, player)
  for (const player of guildRosterPlayers.value) players.set(player.name, player)
  for (const conv of conversations.value) players.set(conv.peer.name, conv.peer)
  return players
})

const rosterPlayers = computed<OnlinePlayer[]>(() => {
  if (rosterType.value === 'guild') return guildRosterPlayers.value
  if (rosterType.value === 'world') return playerList
  const keyword = privateFriendSearch.value.trim().toLocaleLowerCase('zh-TW')
  if (!keyword) return playerList.filter(player => isFriendPlayer(player.playerId))
  return playerList.filter(player => !isBlockedPlayer(player.playerId)
    && player.name.toLocaleLowerCase('zh-TW').includes(keyword))
})

function openRoster(type: RosterType = 'world') {
  rosterType.value = type
  showRoster.value = true
}
function sendPublicGuildInvite() {
  if (!joinedGuild.value) {
    showNotice('加入集團後才能邀請玩家。')
    return
  }
  if (!canInviteGuild.value) {
    showNotice('需要主任、總經理或總裁權限才能邀請玩家加入集團。')
    return
  }
  const guild = joinedGuild.value
  const message = makeMsg(`誠摯邀請玩家加入「${guild.name}」！接受下方邀請卡即可加入集團。`)
  message.guildInvite = { guildId: guild.rank, guildName: guild.name, status: 'pending', broadcast: true }
  worldMessages.value.push(message)
  showNotice(`「${guild.name}」的公開邀請卡已發送至世界頻道。`)
}
function closeRoster() { showRoster.value = false }
function showNotice(text: string) {
  pageNotice.value = text
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    pageNotice.value = ''
  }, 2600)
}

function showSupportFailure(reason: string) {
  if (reason === 'max-ongoing') {
    showNotice(`同時最多只能有 ${maxOngoing} 筆進行中的提問。`)
    return
  }
  if (reason === 'closed') {
    showNotice('此提問已結案，請新增提問。')
    return
  }
  showNotice('暫時無法送出，請稍後再試。')
}
function selectPlayer(p: ChatPlayerProfile) {
  if (isBlockedPlayer(p.playerId)) {
    selectedPlayer.value = null
    showNotice('此玩家已在黑名單中，無法查看個人資料。')
    return
  }
  selectedPlayer.value = p
}
function selectMessageUser(user: string) {
  const player = playerDirectory.value.get(user)
  if (!player) {
    showNotice('目前找不到此玩家的公開資料。')
    return
  }
  selectPlayer(player)
}
function closeCard()   { selectedPlayer.value = null }
function handleRosterFriendAdded(player: ChatPlayerProfile) {
  showNotice(`${player.name} 已加入好友名單。`)
}
function invitePlayerToGuild(player: ChatPlayerProfile) {
  if (!canInviteGuild.value || !joinedGuild.value || isBlockedPlayer(player.playerId) || guildInviteIds.value.includes(player.playerId)) return
  guildInviteIds.value.push(player.playerId)
  const guild = joinedGuild.value
  messagePlayer(player)
  const conversation = activeConv.value
  if (!conversation) return
  conversation.messages.push({
    id: Date.now(),
    user: '我',
    avatar: '👤',
    text: `邀請你加入「${guild.name}」`,
    time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
    self: true,
    guildInvite: { guildId: guild.rank, guildName: guild.name, status: 'pending' },
  })
  guildInviteNotice.value = `已將「${guild.name}」邀請卡送至 ${player.name} 的私訊。`
  showNotice(guildInviteNotice.value)
}
function findGuildInviteMessage(messageId: number) {
  const publicMessage = worldMessages.value.find(item => item.id === messageId && item.guildInvite)
  if (publicMessage) return { conversation: null, message: publicMessage }
  for (const conversation of conversations.value) {
    const message = conversation.messages.find(item => item.id === messageId && item.guildInvite)
    if (message?.guildInvite) return { conversation, message }
  }
  return null
}
function acceptGuildInvite(messageId: number) {
  const invite = findGuildInviteMessage(messageId)
  if (!invite?.message.guildInvite || invite.message.self || invite.message.guildInvite.status !== 'pending') return
  if (joinedGuild.value && joinedGuild.value.rank !== invite.message.guildInvite.guildId) {
    showNotice('請先退出目前的集團，再接受其他集團邀請。')
    return
  }
  if (!joinedGuild.value) {
    joinGuild(invite.message.guildInvite.guildId)
    activeGuildRole.value = '職員'
  }
  invite.message.guildInvite.status = 'accepted'
  showNotice(`已加入「${invite.message.guildInvite.guildName}」。`)
}
function declineGuildInvite(messageId: number) {
  const invite = findGuildInviteMessage(messageId)
  if (!invite?.message.guildInvite || invite.message.self || invite.message.guildInvite.status !== 'pending') return
  invite.message.guildInvite.status = 'declined'
  showNotice('已婉拒集團邀請。')
}
function cancelGuildInvite(messageId: number) {
  const invite = findGuildInviteMessage(messageId)
  if (!invite?.message.guildInvite || !invite.message.self || invite.message.guildInvite.status !== 'pending') return
  invite.message.guildInvite.status = 'cancelled'
  const conversation = invite.conversation
  if (conversation) {
    guildInviteIds.value = guildInviteIds.value.filter(id => id !== conversation.peer.playerId)
  }
  showNotice('已撤回集團邀請。')
}
function selectRosterPlayer(player: ChatPlayerProfile) {
  if (rosterType.value === 'private' && isFriendPlayer(player.playerId)) {
    messagePlayer(player)
    return
  }
  selectPlayer(player)
}
function requestGuildMute(user: string) {
  if (!canMuteGuild.value || !guildModeratableUsers.value.includes(user)) return
  pendingMutePlayer.value = user
}
function confirmGuildMute() {
  const name = pendingMutePlayer.value
  if (!name || !canMuteGuild.value || !guildModeratableUsers.value.includes(name)) return
  mutedGuildMemberExpirations.value = { ...mutedGuildMemberExpirations.value, [name]: Date.now() + 15 * 60_000 }
  mutedComposerPlayerName.value = name
  pendingMutePlayer.value = null
  showNotice(`${name} 已被禁言 15 分鐘。`)
}
function messagePlayer(p: ChatPlayerProfile) {
  if (isBlockedPlayer(p.playerId)) {
    closeCard()
    showNotice('此玩家已在黑名單中，無法私訊。')
    return
  }
  // 找既有對話，沒有就新建
  let conv = conversations.value.find(c => c.peer.playerId === p.playerId || c.peer.name === p.name)
  if (!conv) {
    conv = {
      id: Date.now(),
      peer: clonePlayer(p),
      unread: 0,
      messages: [],
    }
    conversations.value.unshift(conv)
  }
  closeCard()
  closeRoster()
  activeChannel.value = 'private'
  activeConvId.value = conv.id
  conv.unread = 0
}
function reportPlayer(p: ChatPlayerProfile) {
  closeCard()
  closeRoster()
  reportTarget.value = p
}
function submitPlayerReport(reason: string, detail: string) {
  const player = reportTarget.value
  if (!player) return
  const result = createPlayerReportTicket(player, reason, detail)
  if (!result.ok) {
    // 關閉高層級 Modal，確保案件上限等頁面通知不會被遮住。
    reportTarget.value = null
    if (result.reason === 'max-ongoing') {
      showNotice(`已有 ${maxOngoing} 筆進行中提問，本次檢舉尚未送出。`)
      return
    }
    showSupportFailure(result.reason)
    return
  }
  reportTarget.value = null
  activeChannel.value = 'support'
  openSupportTicket(result.ticket.id)
  syncChannelQuery('support')
  showNotice('檢舉已建立客服提問，客服將進行確認。')
}
function addPlayerToBlacklist(p: ChatPlayerProfile) {
  blockPlayer(p)
  closeCard()
  closeRoster()
  showNotice(`${p.name} 已加入黑名單。`)
}
function giftPlayer(p: ChatPlayerProfile) {
  closeCard()
  closeRoster()
  router.push({ path: '/lobby/vault', query: { tab: 'transfer', receiverId: p.playerId } })
}
function transferPlayer(p: ChatPlayerProfile) {
  closeCard()
  closeRoster()
  router.push({
    path: '/lobby/vault',
    query: {
      tab: 'transfer',
      receiverId: p.playerId,
    },
  })
}

function syncChannelQuery(channel: Channel) {
  const nextQuery = { ...route.query }
  if (channel === 'world') delete nextQuery.channel
  else nextQuery.channel = channel
  router.replace({ query: nextQuery })
}

function selectChannel(channel: Channel) {
  activeChannel.value = channel
  syncChannelQuery(channel)
}

function applyChannelQuery() {
  const channel = route.query.channel
  if (channel === 'support' || channel === 'private' || channel === 'guild' || channel === 'world') {
    activeChannel.value = channel
    return
  }
  activeChannel.value = 'world'
}

onMounted(() => {
  initGuildState()
  chatClock = setInterval(() => { chatClockNow.value = Date.now() }, 1000)
  applyChannelQuery()
  const linkedActivity = siteContent.lobbyEvents.find(event => String(event.id) === route.query.activity && event.action?.target === 'support')
  const activityTitle = linkedActivity?.title || supportActivityDraft.value
  if (activeChannel.value === 'support' && activityTitle) {
    supportActivityDraft.value = ''
    supportDraftCategoryKey.value = 'event'
    activityDraftText.value = `我想詢問活動「${activityTitle}」：`
  }
})
watch(() => route.query.channel, applyChannelQuery)
onUnmounted(() => {
  if (noticeTimer) clearTimeout(noticeTimer)
  if (chatClock) clearInterval(chatClock)
})
</script>

<template>
  <div class="lobby-page flex flex-col" style="height: calc(100dvh - 56px - 40px); padding: 0; position: relative; overflow: hidden;">
    <h1 class="section-title chat-page-title">聊天</h1>
    <!-- 頻道 Tab -->
    <div class="flex border-b px-3 pt-3 gap-1 flex-shrink-0" style="border-color:rgba(168,85,247,0.15); background:var(--color-bg-card);">
      <button
        v-for="ch in channels"
        :key="ch.key"
        class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-t-lg transition-all"
        :style="activeChannel === ch.key
          ? 'background:var(--color-bg); color:var(--color-purple-light); border-bottom: 2px solid var(--color-purple-light);'
          : 'color:var(--color-text-muted);'"
        :aria-label="ch.key === 'support' && supportUnreadTotal > 0
          ? `客服頻道，${supportUnreadTotal} 則未讀訊息`
          : ch.label"
        @click="selectChannel(ch.key)"
      >
        <span>{{ ch.icon }}</span>
        <span>{{ ch.label }}</span>
        <span
          v-if="ch.key === 'support' && supportUnreadTotal > 0"
          class="channel-unread"
          aria-hidden="true"
        >
          {{ supportUnreadTotal > 99 ? '99+' : supportUnreadTotal }}
        </span>
      </button>

      <button
        v-if="activeChannel === 'world' || activeChannel === 'guild' || activeChannel === 'private'"
        class="player-list-trigger ml-auto self-center flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
        style="background:rgba(168,85,247,0.2); color:var(--color-purple-light); border:1px solid rgba(168,85,247,0.4);"
        @click="openRoster(activeChannel === 'guild' ? 'guild' : activeChannel === 'private' ? 'private' : 'world')"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19a6 6 0 0 0-12 0m6-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm12 8a5 5 0 0 0-7-4.58M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        {{ activeChannel === 'guild' ? '集團成員' : activeChannel === 'private' ? '好友清單' : '玩家清單' }}
      </button>
    </div>

    <Transition name="notice">
      <div v-if="pageNotice" class="chat-page-notice">
        {{ pageNotice }}
      </div>
    </Transition>

    <LobbyChatThread
      v-if="activeChannel === 'world'"
      :messages="worldMessages"
      selectable-users
      @send="sendWorld"
      @select-user="selectMessageUser"
      @accept-guild-invite="acceptGuildInvite"
      @decline-guild-invite="declineGuildInvite"
      @cancel-guild-invite="cancelGuildInvite"
    >
      <template #input-actions>
        <button
          v-if="joinedGuild"
          type="button"
          class="private-guild-invite-trigger"
          aria-label="在世界頻道發送集團公開邀請"
          :title="canInviteGuild ? '發送至世界頻道，讓玩家接受集團邀請' : '需要主任、總經理或總裁權限才能邀請加入集團'"
          :disabled="!canInviteGuild"
          @click="sendPublicGuildInvite"
        >⚔️</button>
      </template>
    </LobbyChatThread>
    <template v-else-if="activeChannel === 'guild'">
      <LobbyChatThread
        :messages="guildMessages"
        placeholder="在集團頻道輸入訊息…"
        selectable-users
        :moderation-enabled="canMuteGuild"
        :moderatable-users="guildModeratableUsers"
        :muted-users="activeGuildMutedNames"
        :muted="isCurrentGuildMemberMuted"
        :muted-text="`${mutedComposerPlayerName} 禁言中，剩餘 ${currentMuteRemaining} 分鐘，暫時無法發言。`"
        @send="sendGuild"
        @select-user="selectMessageUser"
        @mute-user="requestGuildMute"
      />
      <p v-if="canMuteGuild && !isCurrentGuildMemberMuted" class="guild-moderation-hint">點擊集團成員的訊息可發起禁言，確認後禁言 15 分鐘</p>
    </template>
    <!-- 客服頻道：提問紀錄 → 新增提問 → 對話 -->
    <template v-else-if="activeChannel === 'support'">
      <LobbySupportQuestionStart
        v-if="choosingSupportCategory"
        :categories="supportCategories"
        :ongoing-count="ongoingCount"
        :max-ongoing="maxOngoing"
        @select="selectSupportCategory"
        @cancel="openSupportList"
      />

      <template v-else-if="supportDraftCategory">
        <div class="support-thread-header">
          <button
            type="button"
            class="support-back-button"
            aria-label="返回提問紀錄"
            @click="openSupportList"
          >
            ‹
          </button>
          <span class="support-thread-icon" aria-hidden="true">{{ supportDraftCategory.icon }}</span>
          <span class="support-thread-heading">
            <small>新增提問 · 尚未送出</small>
            <strong>{{ supportDraftCategory.label }}</strong>
          </span>
          <span class="support-ticket-status draft">草稿</span>
        </div>
        <LobbyChatThread
          :key="`draft-${supportDraftCategoryKey}-${activityDraftText}`"
          :messages="[]"
          :initial-draft="activityDraftText"
          :send-disabled="!canCreateTicket"
          placeholder="請輸入問題內容…"
          :notice-title="`請描述「${supportDraftCategory.label}」`"
          :notice-text="canCreateTicket ? '送出第一則訊息後才會正式建立提問；目前離開不會留下紀錄。' : `目前已有進行中的提問，同時最多 ${maxOngoing} 筆。可以先編輯草稿，請完成既有提問後再送出。`"
          @send="sendSupport"
        />
      </template>

      <template v-else-if="activeSupportTicket">
        <div class="support-thread-header">
          <button
            type="button"
            class="support-back-button"
            aria-label="返回提問紀錄"
            @click="openSupportList"
          >
            ‹
          </button>
          <span class="support-thread-icon" aria-hidden="true">🎧</span>
          <span class="support-thread-heading">
            <small>案件 {{ activeSupportTicket.id }} · {{ activeSupportTicket.categoryLabel }}</small>
            <strong>{{ activeSupportTicket.subject }}</strong>
          </span>
          <span
            class="support-ticket-status"
            :class="activeSupportTicket.status"
          >
            {{ activeSupportTicket.status === 'ongoing' ? '進行中' : '已結案' }}
          </span>
          <button
            v-if="activeSupportTicket.status === 'closed'"
            type="button"
            class="support-new-again"
            @click="startSupportQuestion"
          >
            新增提問
          </button>
        </div>
        <LobbyChatThread
          :messages="activeSupportTicket.messages"
          :readonly="activeSupportTicket.status === 'closed'"
          placeholder="輸入訊息…"
          @send="sendSupport"
        />
      </template>

      <LobbySupportTicketList
        v-else
        v-model:active-filter="supportFilter"
        :tickets="sortedTickets"
        @open="openSupportTicket"
        @new="startSupportQuestion"
      />
    </template>

    <!-- 私人頻道：主從導覽 -->
    <template v-else>
      <LobbyPrivateConvList v-if="activeConvId === null" :conversations="conversations" @open="openConversation" />
      <template v-else-if="activeConv">
        <div class="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
             style="background:var(--color-bg-card); border-bottom:1px solid rgba(168,85,247,0.15);">
          <button aria-label="返回" class="text-xl px-1" style="color:var(--color-purple-light);" @click="backToList">‹</button>
          <button
            class="w-7 h-7 rounded-full flex items-center justify-center text-base flex-shrink-0 private-peer-avatar"
            type="button"
            :aria-label="`查看 ${activeConv.peer.name} 的玩家資訊`"
            @click="selectPlayer(activeConv.peer)"
          >
            {{ activeConv.peer.avatar }}
          </button>
          <span class="text-sm font-bold" style="color:var(--color-text);">{{ activeConv.peer.name }}</span>
          <span v-if="activePeerBlocked" class="blocked-badge">黑名單</span>
        </div>
        <LobbyChatThread
          :messages="activeConv.messages"
          selectable-users
          :notice-title="activePeerBlocked ? '此玩家已加入黑名單' : ''"
          :notice-text="activePeerBlocked ? '目前無法傳送私人訊息，也無法查看此玩家個人資料。' : ''"
          @send="sendPrivate"
          @select-user="selectMessageUser"
          @accept-guild-invite="acceptGuildInvite"
          @decline-guild-invite="declineGuildInvite"
          @cancel-guild-invite="cancelGuildInvite"
        >
          <template #input-actions>
            <button
              v-if="joinedGuild"
              type="button"
              class="private-guild-invite-trigger"
              :aria-label="canInviteGuild ? `邀請 ${activeConv.peer.name} 加入集團` : '需要主任、總經理或總裁權限才能邀請加入集團'"
              :title="canInviteGuild ? '邀請加入集團' : '需要主任、總經理或總裁權限'"
              :disabled="!canInviteGuild || activePeerBlocked || guildInviteIds.includes(activeConv.peer.playerId)"
              @click="invitePlayerToGuild(activeConv.peer)"
            >⚔️</button>
            <button
              type="button"
              class="private-gift-trigger"
              aria-label="贈禮給這位玩家"
              :disabled="activePeerBlocked"
              @click="giftPlayer(activeConv.peer)"
            >🎁</button>
          </template>
        </LobbyChatThread>
      </template>
    </template>

    <!-- 玩家清單抽屜（世界頻道） -->
    <div v-if="showRoster" class="roster-overlay" @click.self="closeRoster">
      <aside v-if="rosterType === 'private'" class="private-friends-drawer" aria-label="好友清單" @click.stop>
        <header class="private-friends-heading">
          <div><small>FRIENDS</small><h2>{{ privateFriendSearch.trim() ? '搜尋或添加好友' : '好友清單' }}</h2></div>
          <button type="button" aria-label="關閉好友清單" @click="closeRoster">×</button>
        </header>
        <label class="private-friend-search">
          <span aria-hidden="true">⌕</span>
          <input v-model="privateFriendSearch" type="search" placeholder="搜尋或添加好友" autocomplete="off">
        </label>
        <LobbyOnlineRoster
          :players="rosterPlayers"
          :title="privateFriendSearch.trim() ? '搜尋結果' : '好友清單'"
          :eyebrow="privateFriendSearch.trim() ? 'ADD FRIEND' : 'FRIENDS'"
          :show-search="false"
          :show-close="false"
          :embedded="true"
          selection-purpose="conversation"
          :can-invite="canInviteGuild"
          :show-guild-invite="Boolean(joinedGuild)"
          :invited-player-ids="guildInviteIds"
          :empty-title="privateFriendSearch.trim() ? '找不到符合的玩家' : '目前還沒有好友'"
          :empty-text="privateFriendSearch.trim() ? '請調整搜尋暱稱' : '搜尋暱稱即可添加好友'"
          @select="selectRosterPlayer"
          @friend-added="handleRosterFriendAdded"
          @invite="invitePlayerToGuild"
        />
      </aside>
      <LobbyOnlineRoster
        v-else
        :players="rosterPlayers"
        :title="rosterType === 'guild' ? '集團成員' : '玩家清單'"
        :eyebrow="rosterType === 'guild' ? 'GROUP MEMBERS' : 'PLAYER DIRECTORY'"
        :show-search-mode="false"
        :can-invite="rosterType === 'world' && canInviteGuild"
        :show-guild-invite="rosterType === 'world' && Boolean(joinedGuild)"
        :invited-player-ids="guildInviteIds"
        @select="selectRosterPlayer"
        @friend-added="handleRosterFriendAdded"
        @invite="invitePlayerToGuild"
        @close="closeRoster"
      />
    </div>

    <div v-if="pendingMutePlayer" class="mute-confirm-backdrop" role="presentation" @click.self="pendingMutePlayer = null" @keydown.esc="pendingMutePlayer = null">
      <section class="mute-confirm card-purple" role="dialog" aria-modal="true" aria-labelledby="mute-confirm-title">
        <h2 id="mute-confirm-title">確認禁言玩家？</h2>
        <p>確定要禁言「{{ pendingMutePlayer }}」15 分鐘嗎？禁言只套用於集團頻道。</p>
        <div><button type="button" @click="pendingMutePlayer = null">取消</button><button type="button" @click="confirmGuildMute">確認禁言 15 分鐘</button></div>
      </section>
    </div>

    <ClientOnly>
      <!-- 玩家個人資訊使用 Teleport，必須放在 ClientOnly 內避免 SSG hydration mismatch -->
      <LobbyPlayerCard
        v-if="selectedPlayer"
        :player="selectedPlayer"
        @message="messagePlayer"
        @report="reportPlayer"
        @block="addPlayerToBlacklist"
        @gift="giftPlayer"
        @transfer="transferPlayer"
        @close="closeCard"
      />
      <LobbyReportPlayerModal v-if="reportTarget" :player="reportTarget" @close="reportTarget = null" @submit="submitPlayerReport" />
    </ClientOnly>
  </div>
</template>

<style scoped>
.roster-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 90;
}
.private-friends-drawer {
  position: absolute;
  inset: 0 0 0 auto;
  display: flex;
  width: min(420px, 94%);
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  padding: 16px;
  border-left: 1px solid rgba(168,85,247,.3);
  background: var(--color-bg-card);
  box-shadow: -12px 0 36px rgba(0,0,0,.45);
}
.private-friends-heading { display: flex; flex-shrink: 0; align-items: center; justify-content: space-between; gap: 12px; }
.private-friends-heading small { color: var(--color-gold); font-size: 9px; font-weight: 900; letter-spacing: .16em; }
.private-friends-heading h2 { margin: 3px 0 0; color: var(--color-text); font-size: 18px; font-weight: 900; }
.private-friends-heading button { display: grid; width: 34px; height: 34px; flex-shrink: 0; place-items: center; border: 1px solid rgba(255,255,255,.1); border-radius: 50%; color: var(--color-text-muted); background: rgba(255,255,255,.05); font-size: 23px; cursor: pointer; }
.private-friend-search { display: flex; min-height: 42px; flex-shrink: 0; align-items: center; gap: 9px; padding: 0 12px; border: 1px solid rgba(168,85,247,.28); border-radius: 11px; background: rgba(18,12,41,.72); }
.private-friend-search > span { color: var(--color-purple-light); font-size: 22px; }
.private-friend-search input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--color-text); background: transparent; font: inherit; font-size: 13px; }
.private-friend-search input::placeholder { color: var(--color-text-muted); }
.private-friends-drawer :deep(.roster-panel-embedded) { min-height: 0; }
.private-friends-drawer :deep(.roster-header) { display: none; }
.private-friends-drawer :deep(.roster-list) { padding: 0; }
.guild-moderation-hint { flex-shrink: 0; margin: 0; padding: 6px 14px; border-top: 1px solid rgba(168,85,247,.12); color: var(--color-text-muted); background: rgba(18,12,41,.22); font-size: 10px; text-align: right; }
.mute-confirm-backdrop { position: absolute; inset: 0; z-index: 120; display: grid; place-items: center; padding: 18px; background: rgba(5,3,18,.72); backdrop-filter: blur(5px); }
.mute-confirm { width: min(100%, 420px); padding: 24px; border: 1px solid rgba(248,113,113,.35); border-radius: 18px; }
.mute-confirm h2 { margin: 0 0 10px; color: var(--color-text); font-size: 20px; }
.mute-confirm p { margin: 0; color: var(--color-text-muted); font-size: 14px; line-height: 1.6; }
.mute-confirm > div { display: flex; justify-content: flex-end; gap: 9px; margin-top: 22px; }
.mute-confirm > div button { min-height: 38px; padding: 8px 13px; border: 1px solid rgba(168,85,247,.3); border-radius: 10px; color: var(--color-text); background: rgba(168,85,247,.12); font: inherit; font-size: 12px; font-weight: 800; cursor: pointer; }
.mute-confirm > div button:last-child { border-color: rgba(248,113,113,.45); color: #fecaca; background: rgba(239,68,68,.14); }
.player-list-trigger {
  position: relative;
  z-index: 81;
}
.channel-unread {
  display: inline-grid;
  min-width: 18px;
  height: 18px;
  place-items: center;
  padding: 0 5px;
  color: #1a0a00;
  background: var(--color-gold);
  border: 1px solid rgba(255,255,255,0.34);
  border-radius: 999px;
  box-shadow: 0 0 12px rgba(245,200,66,0.24);
  font-size: 9px;
  font-weight: 950;
  line-height: 1;
}
.chat-page-title {
  margin: 20px 16px 16px;
  flex-shrink: 0;
}
.chat-page-notice {
  position: absolute;
  left: 50%;
  top: 120px;
  z-index: 26;
  width: min(420px, calc(100% - 32px));
  transform: translateX(-50%);
  padding: 10px 14px;
  color: #fff;
  background: rgba(15,0,32,0.92);
  border: 1px solid rgba(245,200,66,0.32);
  border-radius: 999px;
  box-shadow: 0 12px 36px rgba(0,0,0,0.36);
  text-align: center;
  font-size: 13px;
  font-weight: 800;
}
.notice-enter-active,
.notice-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
.private-peer-avatar {
  background: rgba(168,85,247,0.2);
  border: 1px solid rgba(168,85,247,0.3);
  transition: transform 0.16s ease, border-color 0.16s ease;
}
.private-peer-avatar:hover {
  transform: scale(1.06);
  border-color: rgba(245,200,66,0.7);
}
.blocked-badge {
  margin-left: auto;
  padding: 3px 8px;
  color: #fecdd3;
  background: rgba(190,18,60,0.18);
  border: 1px solid rgba(244,63,94,0.32);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 900;
}
.support-thread-header {
  display: flex;
  min-height: 62px;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  background:
    linear-gradient(90deg, rgba(168,85,247,0.08), transparent 45%),
    var(--color-bg-card);
  border-bottom: 1px solid rgba(168,85,247,0.16);
}
.support-back-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  flex: 0 0 auto;
  color: var(--color-purple-light);
  background: rgba(168,85,247,0.08);
  border: 1px solid rgba(168,85,247,0.22);
  border-radius: 10px;
  font-size: 24px;
  line-height: 1;
  transition: color 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}
.support-back-button:hover {
  color: var(--color-gold);
  background: rgba(245,200,66,0.06);
  border-color: rgba(245,200,66,0.32);
}
.support-thread-icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  flex: 0 0 auto;
  background: rgba(245,200,66,0.09);
  border: 1px solid rgba(245,200,66,0.23);
  border-radius: 11px;
  font-size: 17px;
}
.support-thread-heading {
  display: block;
  min-width: 0;
  flex: 1;
}
.support-thread-heading small,
.support-thread-heading strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.support-thread-heading small {
  margin-bottom: 2px;
  color: var(--color-text-muted);
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.02em;
}
.support-thread-heading strong {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 900;
}
.support-ticket-status {
  display: inline-flex;
  min-height: 24px;
  flex: 0 0 auto;
  align-items: center;
  padding: 4px 9px;
  color: #86efac;
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(74,222,128,0.26);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
}
.support-ticket-status.closed {
  color: #cbd5e1;
  background: rgba(148,163,184,0.1);
  border-color: rgba(203,213,225,0.2);
}
.support-ticket-status.draft {
  color: var(--color-gold);
  background: rgba(245,200,66,0.08);
  border-color: rgba(245,200,66,0.24);
}
.private-gift-trigger {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid rgba(245,200,66,0.35);
  border-radius: 50%;
  color: var(--color-text);
  background: rgba(245,200,66,0.12);
  font-size: 18px;
  cursor: pointer;
  transition: background .18s, transform .18s;
}
.private-gift-trigger:hover:not(:disabled) {
  background: rgba(245,200,66,0.24);
  transform: translateY(-1px);
}
.private-gift-trigger:disabled {
  cursor: not-allowed;
  opacity: .42;
}
.private-guild-invite-trigger {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid rgba(168,85,247,.38);
  border-radius: 50%;
  color: var(--color-purple-light);
  background: rgba(168,85,247,.14);
  font-size: 17px;
  cursor: pointer;
  transition: background .18s, transform .18s;
}
.private-guild-invite-trigger:hover:not(:disabled) {
  background: rgba(168,85,247,.26);
  transform: translateY(-1px);
}
.private-guild-invite-trigger:disabled {
  cursor: not-allowed;
  opacity: .42;
}
.support-new-again {
  min-height: 31px;
  flex: 0 0 auto;
  padding: 6px 11px;
  color: #1a0a00;
  background: linear-gradient(135deg,#f7d55f,#d98912);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
}
@media (max-width: 560px) {
  .support-thread-header {
    gap: 7px;
    padding-inline: 10px;
  }
  .support-thread-icon {
    display: none;
  }
  .support-thread-heading small {
    max-width: 180px;
  }
  .support-new-again {
    padding-inline: 9px;
  }
}
</style>
