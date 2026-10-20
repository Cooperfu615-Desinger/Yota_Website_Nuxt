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
  initialDraft?: string
  sendDisabled?: boolean
  moderationEnabled?: boolean
  muted?: boolean
  mutedText?: string
  mutedUsers?: string[]
  moderatableUsers?: string[]
}>(), {
  placeholder: '輸入訊息…',
  noticeTitle: '',
  noticeText: '',
  selectableUsers: false,
  readonly: false,
  readonlyTitle: '此提問已結案',
  readonlyText: '如有其他問題，請返回提問紀錄後新增提問。',
  initialDraft: '',
  sendDisabled: false,
  moderationEnabled: false,
  muted: false,
  mutedText: '此玩家目前禁言中，暫時無法發言。',
  mutedUsers: () => [],
  moderatableUsers: () => [],
})
const emit = defineEmits<{
  send: [text: string]
  selectUser: [user: string]
  muteUser: [user: string]
  acceptGuildInvite: [messageId: number]
  declineGuildInvite: [messageId: number]
  cancelGuildInvite: [messageId: number]
}>()

const inputText = ref(props.initialDraft)
const showEmojiPicker = ref(false)
const emojiOptions = ['😀', '😂', '😍', '😎', '🥳', '😮', '😭', '😡', '👍', '👏', '🙏', '🔥', '🎉', '❤️', '💰', '🧧']

function insertEmoji(emoji: string) {
  inputText.value += emoji
  showEmojiPicker.value = false
}

function send() {
  if (props.sendDisabled || props.muted) return
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
            <span v-if="props.mutedUsers.includes(msg.user)" class="message-muted-label">禁言中</span>
            <span class="text-xs" style="color:var(--color-text-muted); opacity:0.6;">{{ msg.time }}</span>
          </div>
          <div v-if="msg.guildInvite" class="guild-invite-card">
            <span class="guild-invite-eyebrow">⚔️ 集團邀請</span>
            <strong>{{ msg.guildInvite.guildName }}</strong>
            <p>{{ msg.guildInvite.broadcast
              ? (msg.self ? '公開招募邀請已發送至世界頻道，符合條件的玩家皆可接受。' : '集團正在招募，接受邀請即可加入。')
              : (msg.self ? '邀請已送出，等待對方回覆。' : '邀請你加入集團，接受後即可成為會員。') }}</p>
            <div v-if="msg.guildInvite.status === 'pending'" class="guild-invite-actions">
              <button v-if="msg.self" type="button" @click="emit('cancelGuildInvite', msg.id)">撤回邀請</button>
              <template v-else>
                <button class="guild-invite-accept" type="button" @click="emit('acceptGuildInvite', msg.id)">接受邀請</button>
                <button type="button" @click="emit('declineGuildInvite', msg.id)">婉拒</button>
              </template>
            </div>
            <span v-else class="guild-invite-status">
              {{ msg.guildInvite.status === 'accepted' ? '已接受' : msg.guildInvite.status === 'declined' ? '已婉拒' : '已撤回' }}
            </span>
          </div>
          <button
            v-else-if="props.moderationEnabled && !msg.self && props.moderatableUsers.includes(msg.user)"
            type="button"
            class="message-bubble px-3 py-2 rounded-2xl text-sm leading-relaxed"
            :aria-label="`點擊禁言 ${msg.user} 15 分鐘`"
            @click="emit('muteUser', msg.user)"
          >
            {{ msg.text }}
          </button>
          <div
            v-else
            class="message-bubble px-3 py-2 rounded-2xl text-sm leading-relaxed"
            :class="msg.self ? 'is-self' : ''"
          >{{ msg.text }}</div>
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

    <div v-else-if="props.muted" class="thread-muted flex-shrink-0" role="status">
      <span aria-hidden="true">🔇</span>
      <span><strong>禁言中</strong><small>{{ props.mutedText }}</small></span>
    </div>

    <!-- 輸入框 -->
    <div
      v-else
      class="chat-input-bar flex-shrink-0 px-3 py-2 border-t flex gap-2 items-center"
      style="background:var(--color-bg-card); border-color:rgba(168,85,247,0.15);"
    >
      <div class="chat-input-compose">
        <input
          v-model="inputText"
          type="text"
          :placeholder="props.placeholder"
          class="flex-1 min-w-0 px-4 py-2.5 text-sm outline-none"
          @keydown.enter="send"
        >
        <button
          type="button"
          class="chat-input-action"
          :aria-expanded="showEmojiPicker"
          aria-label="選擇 Emoji"
          @click="showEmojiPicker = !showEmojiPicker"
        >😊</button>
        <div v-if="showEmojiPicker" class="emoji-picker" role="dialog" aria-label="選擇 Emoji">
          <button
            v-for="emoji in emojiOptions"
            :key="emoji"
            type="button"
            :aria-label="`插入 ${emoji}`"
            @click="insertEmoji(emoji)"
          >{{ emoji }}</button>
        </div>
      </div>
      <slot name="input-actions" />
      <button
        class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style="background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff;"
        aria-label="傳送"
        :disabled="props.sendDisabled"
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
button:disabled{opacity:.4;cursor:not-allowed}
.chat-input-bar { position: relative; }
.chat-input-compose { position: relative; display: flex; align-items: center; min-width: 0; flex: 1; overflow: visible; border: 1px solid rgba(168,85,247,0.25); border-radius: 999px; background: rgba(168,85,247,0.1); }
.chat-input-compose input { border: 0; color: var(--color-text); background: transparent; }
.chat-input-compose input::placeholder { color: var(--color-text-muted); }
.chat-input-action { display: grid; width: 42px; height: 38px; place-items: center; flex-shrink: 0; border: 0; border-left: 1px solid rgba(168,85,247,0.2); border-radius: 0 999px 999px 0; color: var(--color-text-muted); background: transparent; font-size: 18px; cursor: pointer; transition: background .18s, color .18s; }
.chat-input-action:hover, .chat-input-action[aria-expanded='true'] { color: var(--color-text); background: rgba(168,85,247,0.2); }
.emoji-picker { position: absolute; right: 0; bottom: calc(100% + 8px); z-index: 10; display: grid; grid-template-columns: repeat(8, 34px); gap: 4px; padding: 8px; border: 1px solid rgba(168,85,247,0.34); border-radius: 13px; background: rgba(18,12,41,0.98); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
.emoji-picker button { display: grid; width: 34px; height: 34px; place-items: center; border: 0; border-radius: 8px; background: transparent; font-size: 19px; cursor: pointer; transition: background .16s, transform .16s; }
.emoji-picker button:hover { background: rgba(168,85,247,0.22); transform: scale(1.12); }
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
  display: block;
  border: 1px solid rgba(168,85,247,0.2);
  color: var(--color-text);
  background: rgba(168,85,247,0.12);
  border-radius: 18px 18px 18px 4px;
  text-align: left;
  font: inherit;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.message-bubble.is-self { border: 0; color: #fff; background: linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); border-radius: 18px 18px 4px 18px; }
button.message-bubble { cursor: pointer; transition: border-color .18s, background .18s; }
button.message-bubble:hover { border-color: rgba(245,200,66,.55); background: rgba(168,85,247,.2); }
.message-muted-label { padding: 2px 6px; border: 1px solid rgba(248,113,113,.28); border-radius: 999px; color: #fca5a5; background: rgba(239,68,68,.1); font-size: 9px; font-weight: 850; }
.guild-invite-card { display: grid; gap: 8px; width: min(300px, 100%); padding: 14px; border: 1px solid rgba(245,200,66,.35); border-radius: 16px; color: var(--color-text); background: linear-gradient(145deg,rgba(83,47,111,.72),rgba(29,20,57,.96)); box-shadow: 0 8px 22px rgba(0,0,0,.18); }
.guild-invite-eyebrow { color: var(--color-gold-light); font-size: 11px; font-weight: 900; }
.guild-invite-card > strong { font-size: 16px; }
.guild-invite-card > p { margin: 0; color: var(--color-text-muted); font-size: 12px; line-height: 1.5; }
.guild-invite-actions { display: flex; gap: 8px; margin-top: 2px; }
.guild-invite-actions button { min-height: 32px; padding: 6px 10px; border: 1px solid rgba(203,213,225,.2); border-radius: 9px; color: var(--color-text); background: rgba(255,255,255,.06); font: inherit; font-size: 11px; font-weight: 800; cursor: pointer; }
.guild-invite-actions .guild-invite-accept { border-color: rgba(245,200,66,.56); color: #2b1a00; background: linear-gradient(135deg,#f7d660,#e9a817); }
.guild-invite-status { justify-self: start; padding: 4px 8px; border-radius: 999px; color: var(--color-gold-light); background: rgba(245,200,66,.1); font-size: 10px; font-weight: 850; }
.thread-muted { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 16px; border-top: 1px solid rgba(148,163,184,.24); color: #cbd5e1; background: linear-gradient(90deg,rgba(148,163,184,.12),rgba(71,85,105,.2)); }
.thread-muted > span:last-child { display: grid; gap: 2px; }
.thread-muted strong { font-size: 13px; }
.thread-muted small { color: rgba(203,213,225,.72); font-size: 11px; }
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
