<script setup lang="ts">
import type { PrivateConversation } from '~/data/siteContent'

const props = defineProps<{ conversations: PrivateConversation[] }>()
const emit = defineEmits<{ open: [conv: PrivateConversation] }>()

function lastText(c: PrivateConversation) {
  return c.messages.length ? c.messages[c.messages.length - 1].text : ''
}
function lastTime(c: PrivateConversation) {
  return c.messages.length ? c.messages[c.messages.length - 1].time : ''
}
function statusColor(s: string) {
  return s === '在線' ? '#34d399' : s === '遊戲中' ? '#F5C842' : '#9CA3AF'
}
</script>

<template>
  <div class="flex-1 overflow-y-auto" style="background:var(--color-bg);">
    <div v-if="props.conversations.length === 0" class="flex flex-col items-center justify-center h-full px-8 text-center">
      <span class="text-4xl mb-3">💬</span>
      <p class="text-sm" style="color:var(--color-text-muted);">還沒有私訊，從世界頻道點玩家開始聊天</p>
    </div>
    <ul v-else>
      <li
        v-for="c in props.conversations"
        :key="c.id"
        class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
        style="border-bottom:1px solid rgba(168,85,247,0.1);"
        @click="emit('open', c)"
      >
        <span class="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 relative"
              style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.3);">
          {{ c.peer.avatar }}
          <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full"
                :style="`background:${statusColor(c.peer.status)}; border:2px solid var(--color-bg);`" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-bold truncate" style="color:var(--color-text);">{{ c.peer.name }}</span>
          <span class="block text-xs truncate" style="color:var(--color-text-muted); opacity:0.75;">{{ lastText(c) }}</span>
        </span>
        <span class="flex flex-col items-end gap-1 flex-shrink-0">
          <span class="text-xs" style="color:var(--color-text-muted); opacity:0.6;">{{ lastTime(c) }}</span>
          <span v-if="c.unread > 0" class="text-xs font-bold rounded-full px-2 py-0.5"
                style="background:var(--color-purple-light); color:#fff; min-width:20px; text-align:center;">
            {{ c.unread }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
