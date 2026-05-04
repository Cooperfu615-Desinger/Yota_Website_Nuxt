<script setup lang="ts">
definePageMeta({ layout: 'lobby' })

type Channel = 'world' | 'private' | 'support'
const activeChannel = ref<Channel>('world')

const channels: { key: Channel; label: string; icon: string }[] = [
  { key: 'world',   label: '世界頻道', icon: '🌐' },
  { key: 'private', label: '私人頻道', icon: '🔒' },
  { key: 'support', label: '客服頻道', icon: '🎧' },
]

// 模擬訊息
const mockMessages: Record<Channel, { id: number; user: string; avatar: string; text: string; time: string; self?: boolean }[]> = {
  world: [
    { id: 1, user: 'Lucky888', avatar: '🦁', text: '大家好！今天手氣超好 🎰', time: '14:02' },
    { id: 2, user: 'DragonKing', avatar: '🐉', text: '百家樂剛剛連贏8把！', time: '14:03' },
    { id: 3, user: '我', avatar: '👤', text: '厲害！', time: '14:04', self: true },
    { id: 4, user: 'StarPlayer', avatar: '⭐', text: '有人要一起衝排行榜嗎？', time: '14:05' },
    { id: 5, user: 'JokerAce', avatar: '🃏', text: '明天活動開始記得上線！', time: '14:08' },
  ],
  private: [
    { id: 1, user: 'DragonKing', avatar: '🐉', text: '嘿，要來私訊我的策略嗎哈哈', time: '13:50' },
    { id: 2, user: '我', avatar: '👤', text: '當然！你怎麼連贏的？', time: '13:51', self: true },
    { id: 3, user: 'DragonKing', avatar: '🐉', text: '等我整理一下筆記再說', time: '13:52' },
  ],
  support: [
    { id: 1, user: '客服小幫手', avatar: '🎧', text: '您好！我是巨亨ONLINE客服，請問有什麼可以協助您的？', time: '14:00' },
    { id: 2, user: '我', avatar: '👤', text: '想詢問儲值優惠活動', time: '14:01', self: true },
    { id: 3, user: '客服小幫手', avatar: '🎧', text: '目前新會員首儲享100%加碼，老會員每週儲值也有15%回饋！詳情請至活動頁查看 🎁', time: '14:01' },
  ],
}

const messages = computed(() => mockMessages[activeChannel.value])
const inputText = ref('')

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return
  // 模擬：實際送出由後台 WebSocket 處理
  mockMessages[activeChannel.value].push({
    id: Date.now(),
    user: '我',
    avatar: '👤',
    text,
    time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
    self: true,
  })
  inputText.value = ''
}
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

    <!-- 訊息列表 -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3" style="background:var(--color-bg);">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex gap-2"
        :class="msg.self ? 'flex-row-reverse' : 'flex-row'"
      >
        <!-- 頭像 -->
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
             style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.3);">
          {{ msg.avatar }}
        </div>
        <!-- 內容 -->
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
        @keydown.enter="sendMessage"
      >
      <button
        class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style="background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff;"
        aria-label="傳送"
        @click="sendMessage"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
      </button>
    </div>
  </div>
</template>
