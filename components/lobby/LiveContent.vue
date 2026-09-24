<script setup lang="ts">
import { siteContent } from '~/data/siteContent'
import { filterLiveStreams, liveRankScore, recordLiveWatch, toggleLiveFavorite, type LiveStream } from '~/utils/live'
import '~/assets/css/live.css'

const content = siteContent.live
const copy = content.copy
const { isLoggedIn, userInfo, openLogin } = useAppState()
const route = useRoute()
const hostPhoto = `${useRuntimeConfig().app.baseURL}live-host-demo.png`
const initialState = () => ({
  tab: 'lobby', category: '全部', query: '', onlyFavorites: false, favorites: [] as number[],
  room: null as number | null, rankType: 'receive', period: 'month', historyTab: 'watch', watched: [] as number[],
  giftRecords: [] as { id: number; hostName: string; time: string }[], nextGiftId: 1,
})
// Shared within this live-page visit only, matching APP LiveCenter's lifetime.
const state = useState('live-page-session', initialState)
onUnmounted(() => { state.value = initialState() })
watch(() => [isLoggedIn.value, userInfo.value.id], () => { state.value = initialState() })
const streams = computed(() => filterLiveStreams(content.streams, state.value.category, state.value.query, state.value.onlyFavorites, state.value.favorites))
const selected = computed(() => content.streams.find(stream => stream.id === state.value.room))
const ranks = computed(() => state.value.rankType === 'send' ? content.ranks.send : content.ranks.receive)
const empty = computed(() => {
  if (state.value.tab === 'upcoming') return [copy.emptyUpcoming, copy.emptyUpcomingText]
  if (state.value.tab === 'me') return state.value.historyTab === 'watch' ? [copy.emptyWatch, copy.emptyWatchText] : [copy.emptyGift, copy.emptyGiftText]
  return [copy.emptySearch, copy.emptySearchText]
})
function changeTab(tab: string) { state.value.tab = tab; state.value.room = null }
function toggleFavorite(id: number) { state.value.favorites = toggleLiveFavorite(state.value.favorites, id) }
function enterRoom(stream: LiveStream) {
  state.value.room = stream.id
  state.value.watched = recordLiveWatch(state.value.watched, stream)
}
function giveGift() {
  if (!selected.value || !isLoggedIn.value) return
  state.value.giftRecords.push({ id: state.value.nextGiftId++, hostName: selected.value.name, time: new Date().toLocaleTimeString('zh-TW', { hour12: false }) })
}
function score(index: number) { return liveRankScore(index, state.value.period as 'month' | 'week' | 'day').toLocaleString() }
</script>

<template>
  <div class="lobby-page live-page px-4 py-5">
    <header class="live-heading">
      <div><p class="live-eyebrow">{{ content.eyebrow }}</p><h1 class="section-title">{{ content.title }}</h1></div>
      <span class="live-demo-label">◉ {{ content.subtitle }}</span>
    </header>

    <section v-if="!isLoggedIn" class="live-empty live-surface">
      <span class="live-empty-icon" aria-hidden="true">◉</span><h2>{{ copy.loginTitle }}</h2><p>{{ copy.loginText }}</p>
      <button class="btn-gold" @click="openLogin(route.fullPath)">{{ copy.loginAction }}</button>
    </section>

    <template v-else>
      <LobbyLiveTabs class="live-main-tabs" :items="content.tabs" :model-value="state.tab" label="直播功能" @update:model-value="changeTab" />

      <LobbyLiveRoom v-if="selected" :key="selected.id" :host="selected" :host-photo="hostPhoto" :following="state.favorites.includes(selected.id)" @follow="toggleFavorite(selected.id)" @back="state.room = null" @gift="giveGift" />

      <template v-else-if="state.tab === 'lobby' || state.tab === 'upcoming'">
        <div class="live-filters live-surface">
          <div class="live-categories" role="group" aria-label="直播分類">
            <button v-for="category in content.categories" :key="category" :aria-pressed="state.category === category" @click="state.category = category">{{ category }}</button>
          </div>
          <button v-if="state.tab === 'lobby'" class="live-favorite-filter" :aria-pressed="state.onlyFavorites" @click="state.onlyFavorites = !state.onlyFavorites">♥ {{ copy.favorite }}</button>
          <label class="live-search"><span aria-hidden="true">⌕</span><input v-model="state.query" type="search" :aria-label="copy.search" :placeholder="copy.searchPlaceholder"></label>
        </div>
        <div v-if="state.tab === 'lobby' && streams.length" class="live-grid">
          <article v-for="stream in streams" :key="stream.id" class="live-card live-surface" :class="{ 'is-offline': stream.status !== 'LIVE' }">
            <button class="live-cover" :aria-label="`進入 ${stream.name} 的直播間`" @click="enterRoom(stream)">
              <img v-if="stream.id === 1" :src="hostPhoto" :alt="copy.photoAlt">
              <span class="live-status" :class="{ 'is-online': stream.status === 'LIVE' }">{{ stream.status }}</span>
              <span v-if="stream.id !== 1" class="live-cover-icon" aria-hidden="true">{{ stream.icon }}</span>
              <span class="live-cover-title"><small>{{ stream.category }}頻道 · {{ stream.id === 1 ? '示範主播' : '畫面示意' }}</small><strong>{{ stream.name }}</strong></span>
            </button>
            <button class="live-heart" :aria-label="`${state.favorites.includes(stream.id) ? copy.unfollow : copy.follow} ${stream.name}`" :aria-pressed="state.favorites.includes(stream.id)" @click="toggleFavorite(stream.id)">{{ state.favorites.includes(stream.id) ? '♥' : '♡' }}</button>
            <div class="live-card-info"><h2>{{ stream.title }}</h2><p>{{ stream.viewers ? `${stream.viewers.toLocaleString()} 人觀看` : copy.offline }}</p></div>
          </article>
        </div>
        <div v-else class="live-empty live-surface"><span class="live-empty-icon" aria-hidden="true">{{ state.tab === 'upcoming' ? '▦' : '◉' }}</span><h2>{{ empty[0] }}</h2><p>{{ empty[1] }}</p></div>
      </template>

      <section v-else-if="state.tab === 'rank'" class="live-rank live-surface" aria-label="直播排行榜">
        <div class="live-rank-controls"><LobbyLiveTabs v-model="state.rankType" :items="content.rankTypes" label="直播榜單" /><LobbyLiveTabs v-model="state.period" :items="content.periods" label="排行期間" /></div>
        <p class="live-note">{{ copy.rankNote }}</p>
        <div class="live-podium">
          <div v-for="index in [1, 0, 2]" :key="index" :class="`live-place-${index + 1}`"><span aria-hidden="true">♛</span><b>NO.{{ index + 1 }}</b><strong>{{ ranks[index] }}</strong><em>{{ score(index) }}</em><small>{{ copy.giftValue }}</small></div>
        </div>
        <div v-for="(name, index) in ranks.slice(3)" :key="name" class="live-record-row"><span class="live-rank-number">{{ index + 4 }}</span><strong>{{ name }}</strong><span>{{ score(index + 3) }} {{ copy.giftValue }}</span></div>
        <div class="live-record-row live-self"><span>{{ copy.unranked }}</span><strong>{{ userInfo.name }}</strong><span>0 {{ copy.giftValue }}</span></div>
      </section>

      <section v-else class="live-my live-surface" aria-label="我的直播紀錄">
        <header class="live-summary"><span class="live-avatar" aria-hidden="true">{{ userInfo.avatar }}</span><strong>{{ userInfo.name }}</strong><span>已關注 <b>{{ state.favorites.length }}</b> 位主播</span><span>觀看 <b>{{ state.watched.length }}</b> 筆</span></header>
        <LobbyLiveTabs v-model="state.historyTab" :items="content.histories" label="直播紀錄分類" />
        <template v-if="state.historyTab === 'watch' && state.watched.length">
          <div v-for="id in state.watched" :key="id" class="live-record-row"><span aria-hidden="true">▶</span><strong>{{ content.streams.find(stream => stream.id === id)?.name }}</strong><span>{{ copy.watchNote }}</span></div>
        </template>
        <template v-else-if="state.historyTab === 'gift' && state.giftRecords.length">
          <div v-for="record in state.giftRecords" :key="record.id" class="live-record-row"><span class="live-gift-icon" aria-hidden="true">♥</span><strong>送給 {{ record.hostName }} · {{ copy.heart }}</strong><span>{{ record.time }} · {{ copy.freeGift }}</span></div>
        </template>
        <div v-else class="live-empty"><span class="live-empty-icon" aria-hidden="true">{{ state.historyTab === 'watch' ? '▶' : '♡' }}</span><h2>{{ empty[0] }}</h2><p>{{ empty[1] }}</p></div>
        <p class="live-note live-session-note">{{ copy.sessionNote }}</p>
      </section>
    </template>
  </div>
</template>
