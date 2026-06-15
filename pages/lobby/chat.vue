<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import type { ChatMessage, OnlinePlayer, PrivateConversation } from '~/data/siteContent'

definePageMeta({ layout: 'lobby' })

type Channel = 'world' | 'private' | 'support'
const activeChannel = ref<Channel>('world')

const channels: { key: Channel; label: string; icon: string }[] = [
  { key: 'world',   label: '世界頻道', icon: '🌐' },
  { key: 'private', label: '私人頻道', icon: '🔒' },
  { key: 'support', label: '客服頻道', icon: '🎧' },
]

// 執行期訊息存區域 ref（seed 自 siteContent，重整重置）
const worldMessages = ref<ChatMessage[]>([...siteContent.chat.worldMessages])
const supportMessages = ref<ChatMessage[]>([...siteContent.chat.supportMessages])

// 私人對話（深拷貝 seed，避免動到 as const 來源）+ 主從導覽狀態
const conversations = ref<PrivateConversation[]>(
  siteContent.chat.privateConversations.map(c => ({ ...c, peer: { ...c.peer }, messages: [...c.messages] }))
)
const activeConvId = ref<number | null>(null)   // null = 顯示清單
const activeConv = computed(() => conversations.value.find(c => c.id === activeConvId.value) || null)

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
function sendSupport(text: string) { supportMessages.value.push(makeMsg(text)) }
function sendPrivate(text: string) {
  if (activeConv.value) activeConv.value.messages.push(makeMsg(text))
}

// 世界頻道在線名單抽屜 + 玩家小卡
const onlinePlayers = siteContent.chat.onlinePlayers
const showRoster = ref(false)
const selectedPlayer = ref<OnlinePlayer | null>(null)

function openRoster()  { showRoster.value = true }
function closeRoster() { showRoster.value = false }
function selectPlayer(p: OnlinePlayer) { selectedPlayer.value = p }
function closeCard()   { selectedPlayer.value = null }
function messagePlayer(p: OnlinePlayer) {
  // 找既有對話，沒有就新建
  let conv = conversations.value.find(c => c.peer.name === p.name)
  if (!conv) {
    conv = {
      id: Date.now(),
      peer: { name: p.name, avatar: p.avatar, vip: p.vip, status: p.status },
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

    <LobbyChatThread v-if="activeChannel === 'world'"   :messages="worldMessages"   @send="sendWorld" />
    <LobbyChatThread v-else-if="activeChannel === 'support'" :messages="supportMessages" @send="sendSupport" />

    <!-- 私人頻道：主從導覽 -->
    <template v-else>
      <LobbyPrivateConvList v-if="activeConvId === null" :conversations="conversations" @open="openConversation" />
      <template v-else-if="activeConv">
        <div class="flex items-center gap-2 px-3 py-2.5 flex-shrink-0"
             style="background:var(--color-bg-card); border-bottom:1px solid rgba(168,85,247,0.15);">
          <button aria-label="返回" class="text-xl px-1" style="color:var(--color-purple-light);" @click="backToList">‹</button>
          <span class="w-7 h-7 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.3);">
            {{ activeConv.peer.avatar }}
          </span>
          <span class="text-sm font-bold" style="color:var(--color-text);">{{ activeConv.peer.name }}</span>
        </div>
        <LobbyChatThread :messages="activeConv.messages" @send="sendPrivate" />
      </template>
    </template>

    <!-- 在線名單抽屜（世界頻道） -->
    <div v-if="showRoster" class="roster-overlay" @click.self="closeRoster">
      <LobbyOnlineRoster :players="onlinePlayers" @select="selectPlayer" @close="closeRoster" />
    </div>

    <!-- 玩家小卡 -->
    <LobbyPlayerCard v-if="selectedPlayer" :player="selectedPlayer" @message="messagePlayer" @close="closeCard" />
  </div>
</template>

<style scoped>
.roster-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 20;
}
</style>
