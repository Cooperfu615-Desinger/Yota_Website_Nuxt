<script setup lang="ts">
import type { ChatMessage } from '~/data/siteContent'

const props = withDefaults(defineProps<{
  messages: ChatMessage[]
  placeholder?: string
  noticeTitle?: string
  noticeText?: string
  selectableUsers?: boolean
  readonly?: boolean
  readonlyTitle?: string
  readonlyText?: string
}>(), {
  placeholder: '輸入訊息…',
  noticeTitle: '',
  noticeText: '',
  selectableUsers: false,
  readonly: false,
  readonlyTitle: '此提問已結案',
  readonlyText: '如有其他問題，請返回提問紀錄後新增提問。',
})
const emit = defineEmits<{
  send: [text: string]
  selectUser: [user: string]
}>()

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
      <div v-if="props.noticeTitle" class="thread-notice">
        <p class="thread-notice-title">{{ props.noticeTitle }}</p>
        <p v-if="props.noticeText" class="thread-notice-text">{{ props.noticeText }}</p>
      </div>
      <div
        v-for="msg in props.messages"
        :key="msg.id"
        class="flex gap-2"
        :class="msg.self ? 'flex-row-reverse' : 'flex-row'"
      >
        <button
          v-if="props.selectableUsers && !msg.self"
          class="avatar-btn w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
          type="button"
          :aria-label="`查看 ${msg.user} 的玩家資訊`"
          @click="emit('selectUser', msg.user)"
        >
          {{ msg.avatar }}
        </button>
        <div
          v-else
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
          style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.3);"
        >
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
            class="message-bubble px-3 py-2 rounded-2xl text-sm leading-relaxed"
            :style="msg.self
              ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff; border-radius: 18px 18px 4px 18px;'
              : 'background:rgba(168,85,247,0.12); color:var(--color-text); border:1px solid rgba(168,85,247,0.2); border-radius: 18px 18px 18px 4px;'"
          >
            {{ msg.text }}
          </div>
        </div>
      </div>
    </div>

    <!-- 已結案提示 -->
    <div
      v-if="props.readonly"
      class="thread-readonly flex-shrink-0"
      role="status"
    >
      <span class="thread-readonly-icon" aria-hidden="true">✓</span>
      <span>
        <strong>{{ props.readonlyTitle }}</strong>
        <small>{{ props.readonlyText }}</small>
      </span>
    </div>

    <!-- 輸入框 -->
    <div
      v-else
      class="flex-shrink-0 px-3 py-2 border-t flex gap-2 items-center"
      style="background:var(--color-bg-card); border-color:rgba(168,85,247,0.15);"
    >
      <input
        v-model="inputText"
        type="text"
        :placeholder="props.placeholder"
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

<style scoped>
.avatar-btn {
  background: rgba(168,85,247,0.2);
  border: 1px solid rgba(168,85,247,0.3);
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
}
.avatar-btn:hover {
  transform: translateY(-1px) scale(1.04);
  border-color: rgba(245,200,66,0.68);
  box-shadow: 0 0 0 3px rgba(245,200,66,0.12);
}
.message-bubble {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.thread-notice {
  padding: 12px 14px;
  background: rgba(245,200,66,0.08);
  border: 1px solid rgba(245,200,66,0.26);
  border-radius: 16px;
}
.thread-notice-title {
  margin: 0;
  color: var(--color-gold);
  font-size: 13px;
  font-weight: 950;
}
.thread-notice-text {
  margin: 4px 0 0;
  color: rgba(243,232,255,0.72);
  font-size: 12px;
  line-height: 1.6;
}
.thread-readonly {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px 16px;
  color: rgba(243,232,255,0.74);
  background:
    linear-gradient(90deg, rgba(148,163,184,0.06), rgba(168,85,247,0.08)),
    var(--color-bg-card);
  border-top: 1px solid rgba(168,85,247,0.16);
}
.thread-readonly-icon {
  display: grid;
  width: 25px;
  height: 25px;
  place-items: center;
  flex: 0 0 auto;
  color: #cbd5e1;
  background: rgba(148,163,184,0.12);
  border: 1px solid rgba(203,213,225,0.22);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 950;
}
.thread-readonly strong,
.thread-readonly small {
  display: block;
}
.thread-readonly strong {
  color: var(--color-text);
  font-size: 12px;
  font-weight: 900;
}
.thread-readonly small {
  margin-top: 1px;
  color: var(--color-text-muted);
  font-size: 10px;
}
</style>
