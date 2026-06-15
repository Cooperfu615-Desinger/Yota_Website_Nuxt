# 聊天介面玩家列表 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在聊天頁加入世界頻道在線名單（右側滑出抽屜 + 玩家小卡 + 私訊跳轉）與私人頻道對話清單（主從導覽）。

**Architecture:** 將訊息列表抽成可重用 `ChatThread`，新增 `OnlineRoster`/`PlayerCard`/`PrivateConvList` 三個展示元件，由 `pages/lobby/chat.vue` 主控頻道切換、抽屜開關、主從導覽與跨頻道私訊流程。資料 seed 自 `data/siteContent.ts`，執行期送出的訊息存在頁面區域 `ref`（重整重置）。抽屜與小卡用頁面內 `absolute` 疊層，**不使用 `<Teleport>`**，繞過 SSG hydration 地雷。

**Tech Stack:** Nuxt 3 SSG、Vue 3 `<script setup>`、Tailwind + CSS 變數（`assets/css/main.css` token）。

> **驗證方式（全專案無自動測試）**：每個 Task 以「dev server 編譯無誤 + 瀏覽器實測」驗收。
> - dev server：`PATH="/opt/homebrew/opt/node/bin:$PATH" npm run dev`（已在背景則沿用）。本機須以 `http://127.0.0.1:3000/Yota_Website_Nuxt/lobby/chat` 存取（IPv6 `[::1]` 會回 426）。
> - 編譯檢查：看 dev server log 無紅字錯誤；或 `PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate` 跑完無 error。
> - 互動驗證：用瀏覽器 preview 工具截圖/點擊。

---

## File Structure

| 檔案 | 動作 | 職責 |
|------|------|------|
| `data/siteContent.ts` | 修改 | 新增 `ChatMessage` / `OnlinePlayer` / `PrivateConversation` 型別與 `chat` 資料區塊 |
| `components/lobby/ChatThread.vue` | 新增 | 訊息列表 + 輸入框（props `messages`，emit `send`）；三頻道共用 |
| `components/lobby/OnlineRoster.vue` | 新增 | 在線名單抽屜內容（props `players`，emit `select`/`close`） |
| `components/lobby/PlayerCard.vue` | 新增 | 玩家小卡（props `player`，emit `message`/`close`） |
| `components/lobby/PrivateConvList.vue` | 新增 | 私人對話清單主檢視（props `conversations`，emit `open`） |
| `pages/lobby/chat.vue` | 改寫 | 主控：Tab、抽屜、主從導覽、跨頻道私訊流程，資料 seed 自 siteContent |

---

## Task 1: 在 siteContent.ts 新增聊天資料模型

**Files:**
- Modify: `data/siteContent.ts`（型別加在檔案最上方型別區；資料加在 `export const siteContent = {` 物件內、`dailyCheckin` 之後、`} as const` 之前）

- [ ] **Step 1: 新增型別定義**

在 `data/siteContent.ts` 最上方型別宣告區（例如 `export type LeaderboardTabKey` 附近）加入：

```ts
export type PlayerStatus = '在線' | '遊戲中' | '閒置'

export interface ChatMessage {
  id: number
  user: string
  avatar: string
  text: string
  time: string
  self?: boolean
}

export interface OnlinePlayer {
  id: number
  name: string
  avatar: string
  vip: number          // 0 = 無 VIP，不顯示徽章
  status: PlayerStatus
}

export interface PrivateConversation {
  id: number
  peer: { name: string; avatar: string; vip: number; status: PlayerStatus }
  unread: number
  messages: ChatMessage[]
}
```

- [ ] **Step 2: 新增 `chat` 資料區塊**

在 `siteContent` 物件內、`dailyCheckin: { ... } satisfies DailyCheckinConfig,` 之後、結尾 `} as const` 之前，插入：

```ts
  chat: {
    onlinePlayers: [
      { id: 1, name: 'Lucky888',   avatar: '🦁', vip: 5, status: '在線' },
      { id: 2, name: 'DragonKing', avatar: '🐉', vip: 3, status: '遊戲中' },
      { id: 3, name: 'StarPlayer', avatar: '⭐', vip: 0, status: '在線' },
      { id: 4, name: 'JokerAce',   avatar: '🃏', vip: 2, status: '閒置' },
      { id: 5, name: '金幣王',     avatar: '👑', vip: 4, status: '在線' },
      { id: 6, name: '幸運貓',     avatar: '🐱', vip: 1, status: '遊戲中' },
      { id: 7, name: '賭神再臨',   avatar: '🎲', vip: 0, status: '在線' },
      { id: 8, name: '富貴吉祥',   avatar: '🧧', vip: 3, status: '在線' },
    ] satisfies OnlinePlayer[],
    worldMessages: [
      { id: 1, user: 'Lucky888',   avatar: '🦁', text: '大家好！今天手氣超好 🎰', time: '14:02' },
      { id: 2, user: 'DragonKing', avatar: '🐉', text: '百家樂剛剛連贏8把！', time: '14:03' },
      { id: 3, user: '我',         avatar: '👤', text: '厲害！', time: '14:04', self: true },
      { id: 4, user: 'StarPlayer', avatar: '⭐', text: '有人要一起衝排行榜嗎？', time: '14:05' },
      { id: 5, user: 'JokerAce',   avatar: '🃏', text: '明天活動開始記得上線！', time: '14:08' },
    ] satisfies ChatMessage[],
    privateConversations: [
      {
        id: 1,
        peer: { name: 'DragonKing', avatar: '🐉', vip: 3, status: '遊戲中' },
        unread: 2,
        messages: [
          { id: 1, user: 'DragonKing', avatar: '🐉', text: '嘿，要來私訊我的策略嗎哈哈', time: '13:50' },
          { id: 2, user: '我',         avatar: '👤', text: '當然！你怎麼連贏的？', time: '13:51', self: true },
          { id: 3, user: 'DragonKing', avatar: '🐉', text: '等我整理一下筆記再說', time: '13:52' },
        ],
      },
      {
        id: 2,
        peer: { name: 'Lucky888', avatar: '🦁', vip: 5, status: '在線' },
        unread: 0,
        messages: [
          { id: 1, user: 'Lucky888', avatar: '🦁', text: '下次一起組隊衝榜！', time: '昨天' },
        ],
      },
    ] satisfies PrivateConversation[],
    supportMessages: [
      { id: 1, user: '客服小幫手', avatar: '🎧', text: '您好！我是巨亨ONLINE客服，請問有什麼可以協助您的？', time: '14:00' },
      { id: 2, user: '我',         avatar: '👤', text: '想詢問儲值優惠活動', time: '14:01', self: true },
      { id: 3, user: '客服小幫手', avatar: '🎧', text: '目前新會員首儲享100%加碼，老會員每週儲值也有15%回饋！詳情請至活動頁查看 🎁', time: '14:01' },
    ] satisfies ChatMessage[],
  },
```

- [ ] **Step 3: 驗證編譯無誤**

Run: dev server 已運行則看 log；否則 `PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate`
Expected: 無 TypeScript / build 錯誤（特別注意 `satisfies` 型別吻合）。

- [ ] **Step 4: 瀏覽器確認首頁仍正常**

開 `http://127.0.0.1:3000/Yota_Website_Nuxt/` 截圖，確認頁面照常載入（資料新增不應影響既有頁面）。

- [ ] **Step 5: Commit**

```bash
git add data/siteContent.ts
git commit -m "feat(chat): 新增聊天資料模型（在線玩家/世界/私人對話/客服）"
```

---

## Task 2: 抽出 ChatThread 元件並接入三頻道

**Files:**
- Create: `components/lobby/ChatThread.vue`
- Modify: `pages/lobby/chat.vue`（改用 ChatThread；資料改 seed 自 siteContent）

- [ ] **Step 1: 建立 `components/lobby/ChatThread.vue`**

```vue
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
```

- [ ] **Step 2: 改寫 `pages/lobby/chat.vue` 的 `<script setup>`（過渡版：三頻道仍各自單一對話）**

```vue
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
```

- [ ] **Step 3: 改寫 `pages/lobby/chat.vue` 的 `<template>`（過渡版）**

```vue
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

    <ChatThread v-if="activeChannel === 'world'"   :messages="worldMessages"   @send="sendWorld" />
    <ChatThread v-else-if="activeChannel === 'support'" :messages="supportMessages" @send="sendSupport" />
    <ChatThread v-else :messages="privateMessages" @send="sendPrivate" />
  </div>
</template>

<style scoped></style>
```

- [ ] **Step 4: 驗證編譯與三頻道聊天**

Run: dev server log 無錯誤。
瀏覽器開 `http://127.0.0.1:3000/Yota_Website_Nuxt/lobby/chat`：
- 三個頻道 Tab 可切換，各自顯示對應訊息。
- 任一頻道輸入文字按傳送，訊息出現在列表（自己的泡泡靠右）。
Expected: 行為與改版前一致，無 console 錯誤。

- [ ] **Step 5: Commit**

```bash
git add components/lobby/ChatThread.vue pages/lobby/chat.vue
git commit -m "refactor(chat): 抽出 ChatThread 元件、資料 seed 自 siteContent"
```

---

## Task 3: 世界頻道在線名單抽屜 + 玩家小卡

**Files:**
- Create: `components/lobby/OnlineRoster.vue`
- Create: `components/lobby/PlayerCard.vue`
- Modify: `pages/lobby/chat.vue`

- [ ] **Step 1: 建立 `components/lobby/OnlineRoster.vue`**

```vue
<script setup lang="ts">
import type { OnlinePlayer } from '~/data/siteContent'

const props = defineProps<{ players: OnlinePlayer[] }>()
const emit = defineEmits<{ select: [player: OnlinePlayer]; close: [] }>()

function statusColor(s: string) {
  return s === '在線' ? '#34d399' : s === '遊戲中' ? '#F5C842' : '#9CA3AF'
}
</script>

<template>
  <aside class="roster-panel" @click.stop>
    <header class="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style="border-bottom:1px solid rgba(168,85,247,0.2);">
      <span class="text-sm font-bold" style="color:var(--color-purple-light);">在線玩家 {{ props.players.length }}</span>
      <button aria-label="關閉" style="color:var(--color-text-muted);" @click="emit('close')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </header>
    <ul class="flex-1 overflow-y-auto py-1">
      <li
        v-for="p in props.players"
        :key="p.id"
        class="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer transition-colors"
        style="border-bottom:1px solid rgba(168,85,247,0.08);"
        @click="emit('select', p)"
      >
        <span class="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 relative"
              style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.3);">
          {{ p.avatar }}
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
                :style="`background:${statusColor(p.status)}; border:1.5px solid var(--color-bg-card);`" />
        </span>
        <span class="flex-1 min-w-0">
          <span class="block text-sm font-bold truncate" style="color:var(--color-text);">{{ p.name }}</span>
          <span class="block text-xs" style="color:var(--color-text-muted); opacity:0.7;">{{ p.status }}</span>
        </span>
        <span v-if="p.vip > 0" class="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style="background:linear-gradient(135deg,var(--color-gold),var(--color-gold-dark)); color:#3a2400;">
          V{{ p.vip }}
        </span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.roster-panel {
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 78%;
  max-width: 320px;
  background: var(--color-bg-card);
  border-left: 1px solid rgba(168,85,247,0.3);
  box-shadow: -8px 0 24px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  z-index: 20;
  animation: roster-slide 0.22s ease;
}
@keyframes roster-slide {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}
</style>
```

- [ ] **Step 2: 建立 `components/lobby/PlayerCard.vue`**

```vue
<script setup lang="ts">
import type { OnlinePlayer } from '~/data/siteContent'

const props = defineProps<{ player: OnlinePlayer }>()
const emit = defineEmits<{ message: [player: OnlinePlayer]; close: [] }>()
</script>

<template>
  <div class="card-overlay" @click.self="emit('close')">
    <div class="player-card">
      <button class="card-close" aria-label="關閉" @click="emit('close')">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
      <div class="w-16 h-16 rounded-full flex items-center justify-center text-4xl mx-auto"
           style="background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.35);">
        {{ props.player.avatar }}
      </div>
      <div class="flex items-center justify-center gap-2 mt-3">
        <span class="text-lg font-bold" style="color:var(--color-text);">{{ props.player.name }}</span>
        <span v-if="props.player.vip > 0" class="text-xs font-bold px-1.5 py-0.5 rounded"
              style="background:linear-gradient(135deg,var(--color-gold),var(--color-gold-dark)); color:#3a2400;">
          VIP {{ props.player.vip }}
        </span>
      </div>
      <p class="text-center text-sm mt-1" style="color:var(--color-text-muted);">{{ props.player.status }}</p>
      <button class="btn-gold w-full justify-center mt-4" @click="emit('message', props.player)">
        私訊
      </button>
    </div>
  </div>
</template>

<style scoped>
.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 24px;
}
.player-card {
  position: relative;
  width: 100%;
  max-width: 280px;
  background: var(--color-bg-card);
  border: 1px solid rgba(168,85,247,0.3);
  border-radius: 18px;
  padding: 28px 20px 20px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
  animation: card-pop 0.18s ease;
}
.card-close {
  position: absolute;
  top: 10px; right: 10px;
  color: var(--color-text-muted);
}
@keyframes card-pop {
  from { transform: scale(0.92); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
```

- [ ] **Step 3: 在 `pages/lobby/chat.vue` `<script setup>` 加入抽屜與小卡狀態**

在 `sendSupport` 函式之後加入：

```ts
import type { OnlinePlayer } from '~/data/siteContent'

const onlinePlayers = siteContent.chat.onlinePlayers
const showRoster = ref(false)
const selectedPlayer = ref<OnlinePlayer | null>(null)

function openRoster()  { showRoster.value = true }
function closeRoster() { showRoster.value = false }
function selectPlayer(p: OnlinePlayer) { selectedPlayer.value = p }
function closeCard()   { selectedPlayer.value = null }
// 過渡：私訊行為在 Task 5 串接，先關閉卡片
function messagePlayer(_p: OnlinePlayer) { closeCard(); closeRoster() }
```

> 注意：`import type { ChatMessage }` 已在 Task 2 加入，這裡把 `OnlinePlayer` 併入同一行 import 或新增一行皆可。

- [ ] **Step 4: 在 `pages/lobby/chat.vue` `<template>` 加入「在線 N」鈕、抽屜與小卡**

在 Tab 列 `</div>`（頻道 Tab 區塊結尾）之前，加入「在線 N」按鈕（只在世界頻道顯示）：

```vue
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
```

在最外層 `</div>`（頁面容器結尾）之前，加入疊層（容器需可定位——下一步處理）：

```vue
    <!-- 在線名單抽屜（世界頻道） -->
    <div v-if="showRoster" class="roster-overlay" @click.self="closeRoster">
      <OnlineRoster :players="onlinePlayers" @select="selectPlayer" @close="closeRoster" />
    </div>

    <!-- 玩家小卡 -->
    <PlayerCard v-if="selectedPlayer" :player="selectedPlayer" @message="messagePlayer" @close="closeCard" />
```

- [ ] **Step 5: 讓頁面容器可作為疊層定位基準，並加 roster-overlay 樣式**

把最外層容器的 inline style 改為（加 `position:relative; overflow:hidden;`）：

```vue
  <div class="lobby-page flex flex-col" style="height: calc(100dvh - 56px - 40px); padding: 0; position: relative; overflow: hidden;">
```

在 `<style scoped>` 內加入遮罩樣式：

```css
.roster-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 20;
}
```

- [ ] **Step 6: 驗證世界頻道抽屜與小卡**

瀏覽器開 `lobby/chat`（世界頻道）：
- Tab 列右側出現綠點「在線 8」鈕。
- 點它 → 右側滑出名單抽屜，列出 8 位玩家（狀態點顏色、VIP 徽章正確；vip=0 無徽章）。
- 點遮罩或 ✕ → 抽屜關閉。
- 點某玩家 → 彈出小卡（頭像/暱稱/VIP/狀態 + 私訊鈕）。
- 點小卡 ✕ 或遮罩 → 關閉。
- 切到私人/客服頻道時「在線 N」鈕消失。
Expected: 以上皆正常，無 console 錯誤。

- [ ] **Step 7: Commit**

```bash
git add components/lobby/OnlineRoster.vue components/lobby/PlayerCard.vue pages/lobby/chat.vue
git commit -m "feat(chat): 世界頻道在線名單抽屜與玩家小卡"
```

---

## Task 4: 私人頻道主從導覽（對話清單 → 對話 → 返回）

**Files:**
- Create: `components/lobby/PrivateConvList.vue`
- Modify: `pages/lobby/chat.vue`

- [ ] **Step 1: 建立 `components/lobby/PrivateConvList.vue`**

```vue
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
```

- [ ] **Step 2: 改寫 `pages/lobby/chat.vue` `<script setup>` 的私人頻道狀態**

移除 Task 2 過渡用的 `privateMessages` 與 `sendPrivate`，改為對話陣列 + 主從狀態。把：

```ts
const privateMessages = ref<ChatMessage[]>([...siteContent.chat.privateConversations[0].messages])
```

替換為：

```ts
import type { PrivateConversation } from '~/data/siteContent'

// 私人對話（深拷貝 seed，避免動到 as const 來源）
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
```

把過渡版 `sendPrivate` 替換為：

```ts
function sendPrivate(text: string) {
  if (activeConv.value) activeConv.value.messages.push(makeMsg(text))
}
```

- [ ] **Step 3: 改寫 `pages/lobby/chat.vue` `<template>` 私人頻道區塊**

把過渡版的私人頻道 `<ChatThread v-else :messages="privateMessages" @send="sendPrivate" />` 替換為主從導覽：

```vue
    <!-- 私人頻道：主從導覽 -->
    <template v-else>
      <PrivateConvList v-if="activeConvId === null" :conversations="conversations" @open="openConversation" />
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
        <ChatThread :messages="activeConv.messages" @send="sendPrivate" />
      </template>
    </template>
```

- [ ] **Step 4: 驗證私人頻道主從導覽**

瀏覽器開 `lobby/chat` → 切到私人頻道：
- 顯示對話清單（DragonKing 有未讀 2、Lucky888 無未讀），每筆顯示頭像/狀態點/暱稱/最後一句/時間。
- 點 DragonKing → 進入對話檢視（頂部返回鍵 + 暱稱 + 訊息）。
- 在對話內輸入並送出 → 訊息出現。
- 點返回鍵 → 回清單，DragonKing 的未讀數消失（已清零）。
Expected: 導覽流暢，無 console 錯誤。

- [ ] **Step 5: Commit**

```bash
git add components/lobby/PrivateConvList.vue pages/lobby/chat.vue
git commit -m "feat(chat): 私人頻道主從導覽（對話清單→對話→返回）"
```

---

## Task 5: 串接跨頻道私訊流程（小卡「私訊」→ 私人對話）

**Files:**
- Modify: `pages/lobby/chat.vue`

- [ ] **Step 1: 改寫 `messagePlayer` 串接私人頻道**

把 Task 3 的過渡版：

```ts
function messagePlayer(_p: OnlinePlayer) { closeCard(); closeRoster() }
```

替換為：

```ts
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
```

> 注意：此函式用到 `conversations` 與 `activeConvId`，皆於 Task 4 定義；本 Task 必須在 Task 4 之後執行。

- [ ] **Step 2: 驗證端到端私訊流程**

瀏覽器開 `lobby/chat`（世界頻道）：
- 點「在線 8」→ 抽屜 → 點一位**清單中沒有的**玩家（例：StarPlayer）→ 小卡 → 點「私訊」。
- 預期：自動切到私人頻道，且直接進入與 StarPlayer 的（新建空）對話檢視。
- 輸入訊息送出 → 出現在對話中。
- 返回清單 → StarPlayer 對話出現在最上方。
- 再測一位**清單中已有**的玩家（例：DragonKing）走私訊 → 應進入既有對話（不重複新建），看得到原本的歷史訊息。
Expected: 兩種情況皆正確，無 console 錯誤。

- [ ] **Step 3: Commit**

```bash
git add pages/lobby/chat.vue
git commit -m "feat(chat): 串接玩家小卡私訊→私人對話跨頻道流程"
```

---

## Task 6: 完整迴歸 + 部署

**Files:** 無（驗證與部署）

- [ ] **Step 1: 完整建置驗證**

Run: `PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate`
Expected: 建置成功、無 error，`docs/` 產生。

- [ ] **Step 2: 完整迴歸（瀏覽器）**

逐一確認：
- 世界頻道：聊天、在線抽屜、玩家小卡、私訊跳轉。
- 私人頻道：清單、進入對話、送訊息、返回、未讀清零。
- 客服頻道：聊天正常、無在線鈕。
- 全站 @click 正常（驗證未踩 hydration 地雷）；切換其他大廳頁面（如 daily/member）功能無回歸。

- [ ] **Step 3: Push 部署**

```bash
git push origin main
```

Expected: GitHub Actions 自動 generate + 部署（2~5 分鐘）。線上 `/lobby/chat` 驗證一次。

---

## Self-Review 註記

- **Spec 覆蓋**：在線名冊→Task 3；玩家小卡+私訊→Task 3/5；私人主從導覽→Task 4；客服維持→Task 2 保留；資料模型→Task 1；避開 Teleport→各疊層用 absolute（Task 3 容器 `position:relative`）。
- **型別一致**：`ChatMessage`/`OnlinePlayer`/`PrivateConversation`/`PlayerStatus` 於 Task 1 定義，後續元件 `import type` 沿用同名。
- **方法命名一致**：`openRoster`/`closeRoster`/`selectPlayer`/`closeCard`/`messagePlayer`/`openConversation`/`backToList`/`sendWorld`/`sendPrivate`/`sendSupport` 全程一致。
- **執行順序相依**：Task 5 依賴 Task 4 的 `conversations`/`activeConvId`，務必依序執行。
