<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import { normalizeLiveMessage, type LiveStream } from '~/utils/live'

const props = defineProps<{ host: LiveStream; following: boolean; hostPhoto: string }>()
const emit = defineEmits<{ back: []; follow: []; gift: [] }>()
const content = siteContent.live
const copy = content.copy
const tab = ref('chat')
const paused = ref(false)
const muted = ref(true)
const giftOpen = ref(false)
const draft = ref('')
const log = ref<HTMLElement | null>(null)
let nextId = content.messages.length
const messages = ref(content.messages.map((message, id) => ({ ...message, id, name: message.host ? props.host.name : message.name })))
const validMessage = computed(() => normalizeLiveMessage(draft.value))
watch([() => messages.value.length, tab], async () => {
  await nextTick()
  if (log.value) log.value.scrollTop = log.value.scrollHeight
}, { immediate: true })
function send() {
  if (!validMessage.value) return
  messages.value.push({ id: nextId++, name: '我', text: validMessage.value, host: false })
  draft.value = ''
}
function gift() {
  emit('gift')
  messages.value.push({ id: nextId++, name: '我', text: copy.giftSent, host: false })
  giftOpen.value = false
}
</script>

<template>
  <section class="live-room" aria-label="直播間展示">
    <header class="live-room-heading live-surface">
      <button class="live-icon-button" :aria-label="copy.back" @click="emit('back')">←</button>
      <img :src="hostPhoto" alt="示範主播頭像">
      <div class="live-room-title"><h2>{{ host.title }}</h2><p>{{ host.name }} · {{ host.category }}頻道</p></div>
      <span class="live-viewers">{{ host.viewers.toLocaleString() }} 人觀看</span>
      <button class="live-follow" :aria-pressed="following" @click="emit('follow')">{{ following ? '♥' : '♡' }} {{ following ? copy.following : copy.follow }}</button>
    </header>
    <div class="live-room-layout">
      <div class="live-player">
        <img :src="hostPhoto" :alt="copy.photoAlt">
        <div v-if="paused || host.status !== 'LIVE'" class="live-player-overlay"><span aria-hidden="true">▷</span><p>{{ host.status !== 'LIVE' ? copy.offlineRoom : copy.paused }}</p></div>
        <div class="live-player-badges"><span class="live-status" :class="{ 'is-online': host.status === 'LIVE' }">{{ host.status === 'LIVE' ? copy.liveDemo : host.status }}</span><small>{{ copy.staticImage }}</small></div>
        <div class="live-player-controls">
          <button class="live-icon-button" :aria-label="paused ? copy.playAction : copy.pauseAction" :aria-pressed="paused" @click="paused = !paused">{{ paused ? '▶' : 'Ⅱ' }}</button>
          <button class="live-icon-button" :aria-label="muted ? copy.unmuteAction : copy.muteAction" :aria-pressed="muted" @click="muted = !muted">{{ muted ? '♬ ×' : '♬' }}</button>
          <span>{{ copy.playerNote }}</span>
        </div>
      </div>
      <div class="live-room-side live-surface">
        <LobbyLiveTabs v-model="tab" :items="content.roomTabs" label="直播間功能" />
        <template v-if="tab === 'chat'">
          <div ref="log" class="live-messages" role="log" :aria-label="copy.chatLabel" aria-live="polite" aria-relevant="additions">
            <p v-for="message in messages" :key="message.id"><b :class="{ 'is-host': message.host }">{{ message.host ? '主播 ' : '' }}{{ message.name }}：</b>{{ message.text }}</p>
          </div>
          <div v-if="giftOpen" class="live-gift-tray"><span class="live-gift-icon" aria-hidden="true">♥</span><div><strong>{{ copy.heart }}</strong><small>{{ copy.freeGift }}</small></div><button class="live-small-gold" @click="gift">{{ copy.send }}</button></div>
          <form class="live-compose" @submit.prevent="send">
            <button type="button" class="live-icon-button" :aria-label="copy.giftAction" :aria-expanded="giftOpen" @click="giftOpen = !giftOpen">♡</button>
            <input v-model="draft" :aria-label="copy.messageLabel" :placeholder="copy.messagePlaceholder" maxlength="200" autocomplete="off">
            <button type="submit" class="live-icon-button" :aria-label="copy.sendAction" :disabled="!validMessage">➤</button>
          </form>
          <p class="live-note live-chat-note">{{ copy.chatNote }}</p>
        </template>
        <div v-else-if="tab === 'live'" class="live-room-details">
          <span class="live-empty-icon" aria-hidden="true">◉</span><h3>{{ host.name }} 的直播間</h3><p>{{ host.title }}</p><p>{{ copy.roomWelcome }}</p><small>{{ copy.roomNote }}</small>
          <button class="live-follow" :aria-pressed="following" @click="emit('follow')">{{ following ? copy.unfollow : `${copy.follow}主播` }}</button>
        </div>
        <div v-else class="live-room-details">
          <span class="live-empty-icon" aria-hidden="true">♛</span><h3>{{ copy.supportersTitle }}</h3>
          <div v-for="(supporter, index) in content.roomSupporters" :key="supporter.name" class="live-record-row"><b>{{ index + 1 }}</b><strong>{{ supporter.name }}</strong><span>{{ supporter.score.toLocaleString() }}</span></div>
          <small>{{ copy.supportersNote }}</small>
        </div>
      </div>
    </div>
  </section>
</template>
