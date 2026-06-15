<script setup lang="ts">
import type { ChatMessage } from '~/data/siteContent'

defineProps<{ messages: ChatMessage[] }>()
const emit = defineEmits<{ send: [text: string] }>()

const inputText = ref('')
function send() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0">
    <!-- 訊息列表 -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3" style="background:var(--color-bg);">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex gap-2"
        :class="msg.self ? 'flex-row-reverse' : 'flex-row'"
      >
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
             style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.3);">
          {{ msg.avatar }}
        </div>
        <div :class="msg.self ? 'items-end' : 'items-start'" class="flex flex-col gap-0.5 max-w-[70%]">
          <div class="flex items-center gap-2" :class="msg.self ? 'flex-row-reverse' : ''">
            <span class="text-xs font-bold" :style="msg.self ? 'color:var(--color-purple-light)' : 'color:var(--color-text-muted)'">
              {{ msg.user }}
            </span>
            <span class="text-xs" style="color:var(--color-text-muted); opacity:0.6;">{{ msg.time }}</span>
          </div>
          <div
            class="px-3 py-2 rounded-2xl text-sm leading-relaxed"
            :style="msg.self
              ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff; border-radius: 18px 18px 4px 18px;'
              : 'background:rgba(168,85,247,0.12); color:var(--color-text); border:1px solid rgba(168,85,247,0.2); border-radius: 18px 18px 18px 4px;'"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- 輸入框 -->
    <div class="flex-shrink-0 px-3 py-2 border-t flex gap-2 items-center"
         style="background:var(--color-bg-card); border-color:rgba(168,85,247,0.15);">
      <input
        v-model="inputText"
        type="text"
        placeholder="輸入訊息…"
        class="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
        style="background:rgba(168,85,247,0.1); border:1px solid rgba(168,85,247,0.25); color:var(--color-text);"
        @keydown.enter="send"
      >
      <button
        class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style="background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff;"
        aria-label="傳送"
        @click="send"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      </button>
    </div>
  </div>
</template>
