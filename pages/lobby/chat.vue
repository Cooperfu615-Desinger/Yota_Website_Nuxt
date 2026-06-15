<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import type { ChatMessage } from '~/data/siteContent'

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
// 過渡：私人頻道暫時只接第一個對話的訊息（Task 4 改為主從導覽）
const privateMessages = ref<ChatMessage[]>([...siteContent.chat.privateConversations[0].messages])

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
function sendPrivate(text: string) { privateMessages.value.push(makeMsg(text)) }
function sendSupport(text: string) { supportMessages.value.push(makeMsg(text)) }
</script>

<template>
  <div class="lobby-page flex flex-col" style="height: calc(100dvh - 56px - 40px); padding: 0;">
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
    </div>

    <LobbyChatThread v-if="activeChannel === 'world'"   :messages="worldMessages"   @send="sendWorld" />
    <LobbyChatThread v-else-if="activeChannel === 'support'" :messages="supportMessages" @send="sendSupport" />
    <LobbyChatThread v-else :messages="privateMessages" @send="sendPrivate" />
  </div>
</template>

<style scoped></style>
