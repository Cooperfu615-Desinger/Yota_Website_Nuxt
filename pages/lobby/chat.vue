<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import type { ChatMessage, ChatPlayerProfile, OnlinePlayer, PrivateConversation } from '~/data/siteContent'

definePageMeta({ layout: 'lobby' })

type Channel = 'world' | 'private' | 'support'
const activeChannel = ref<Channel>('world')
const { blockPlayer, isBlockedPlayer } = useSocialState()

const channels: { key: Channel; label: string; icon: string }[] = [
  { key: 'world',   label: '世界頻道', icon: '🌐' },
  { key: 'private', label: '私人頻道', icon: '🔒' },
  { key: 'support', label: '客服頻道', icon: '🎧' },
]

function clonePlayer<T extends ChatPlayerProfile>(player: T): T {
  return {
    ...player,
    recentGames: player.recentGames.map(game => ({ ...game })),
  } as T
}

// 執行期訊息存區域 ref（seed 自 siteContent，重整重置）
const worldMessages = ref<ChatMessage[]>([...siteContent.chat.worldMessages])
const supportMessages = ref<ChatMessage[]>([...siteContent.chat.supportMessages])

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

function openConversation(conv: PrivateConversation) {
  activeConvId.value = conv.id
  conv.unread = 0
}
function backToList() { activeConvId.value = null }

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
function sendSupport(text: string) {
  if (supportDraft.value) {
    supportMessages.value.push(makeMsg(`【${supportDraft.value.title}】${text}`))
    supportDraft.value = null
    return
  }
  supportMessages.value.push(makeMsg(text))
}
function sendPrivate(text: string) {
  if (activePeerBlocked.value) {
    showNotice('此玩家已在黑名單中，無法傳送私人訊息。')
    return
  }
  if (activeConv.value) activeConv.value.messages.push(makeMsg(text))
}

// 世界頻道在線名單抽屜 + 玩家小卡
const onlinePlayers = siteContent.chat.onlinePlayers.map(player => clonePlayer(player))
const showRoster = ref(false)
const selectedPlayer = ref<ChatPlayerProfile | null>(null)
const supportDraft = ref<{ title: string; player: ChatPlayerProfile } | null>(null)
const pageNotice = ref('')
let noticeTimer: ReturnType<typeof setTimeout> | null = null

const playerDirectory = computed(() => {
  const players = new Map<string, ChatPlayerProfile>()
  for (const player of onlinePlayers) players.set(player.name, player)
  for (const conv of conversations.value) players.set(conv.peer.name, conv.peer)
  return players
})

function openRoster()  { showRoster.value = true }
function closeRoster() { showRoster.value = false }
function showNotice(text: string) {
  pageNotice.value = text
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => {
    pageNotice.value = ''
  }, 2600)
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
  supportDraft.value = {
    title: `檢舉：${p.name} #${p.playerId}`,
    player: p,
  }
  closeCard()
  closeRoster()
  activeChannel.value = 'support'
  showNotice('已切換到客服頻道，請輸入檢舉內容後送出。')
}
function addPlayerToBlacklist(p: ChatPlayerProfile) {
  blockPlayer(p)
  closeCard()
  closeRoster()
  showNotice(`${p.name} 已加入黑名單。`)
}
function giftPlayer(p: ChatPlayerProfile) {
  showNotice(`已選擇贈禮給 ${p.name}，後續可串接禮物流程。`)
}
function transferPlayer(p: ChatPlayerProfile) {
  showNotice(`已選擇轉點給 ${p.name}，後續可串接轉點流程。`)
}
</script>

<template>
  <div class="lobby-page flex flex-col" style="height: calc(100dvh - 56px - 40px); padding: 0; position: relative; overflow: hidden;">
    <!-- 頻道 Tab -->
    <div class="flex border-b px-3 pt-3 gap-1 flex-shrink-0" style="border-color:rgba(168,85,247,0.15); background:var(--color-bg-card);">
      <button
        v-for="ch in channels"
        :key="ch.key"
        class="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-t-lg transition-all"
        :style="activeChannel === ch.key
          ? 'background:var(--color-bg); color:var(--color-purple-light); border-bottom: 2px solid var(--color-purple-light);'
          : 'color:var(--color-text-muted);'"
        @click="activeChannel = ch.key"
      >
        <span>{{ ch.icon }}</span>
        <span>{{ ch.label }}</span>
      </button>

      <button
        v-if="activeChannel === 'world'"
        class="ml-auto self-center flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold"
        style="background:rgba(168,85,247,0.2); color:var(--color-purple-light); border:1px solid rgba(168,85,247,0.4);"
        @click="openRoster"
      >
        <span class="w-1.5 h-1.5 rounded-full" style="background:#34d399;" />
        在線 {{ onlinePlayers.length }}
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
    />
    <LobbyChatThread
      v-else-if="activeChannel === 'support'"
      :messages="supportMessages"
      :placeholder="supportDraft ? '請輸入檢舉內容…' : '輸入訊息…'"
      :notice-title="supportDraft?.title"
      :notice-text="supportDraft ? '客服會收到此檢舉標題，請補上具體原因、時間或對話內容後送出。' : ''"
      @send="sendSupport"
    />

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
        />
      </template>
    </template>

    <!-- 在線名單抽屜（世界頻道） -->
    <div v-if="showRoster" class="roster-overlay" @click.self="closeRoster">
      <LobbyOnlineRoster :players="onlinePlayers" @select="selectPlayer" @close="closeRoster" />
    </div>

    <!-- 玩家小卡 -->
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
  </div>
</template>

<style scoped>
.roster-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 20;
}
.chat-page-notice {
  position: absolute;
  left: 50%;
  top: 66px;
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
</style>
