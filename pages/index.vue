<script setup lang="ts">
import { siteContent, type LeaderboardTabKey } from '~/data/siteContent'

useSeoMeta({
  title: '巨亨 ONLINE — 官方網站 | 全台頂級線上娛樂城',
  description: '巨亨ONLINE官方網站，提供老虎機、百家樂等多種博弈遊戲，立即試玩！快速儲值、安全有保障，支援iOS/Android APP下載。',
  ogTitle: '巨亨 ONLINE — 全台頂級線上娛樂城',
  ogDescription: '立即試玩老虎機、百家樂！快速儲值，多種支付方式，24小時線上客服。',
  ogType: 'website',
})

const { openLobby } = useAppState()
const { lastUpdate } = useLeaderboardTimer()

const leaderboardTabs = siteContent.leaderboard.tabs.filter(tab => tab.key !== 'event')
const leaderboardTab = ref<LeaderboardTabKey>(leaderboardTabs[0].key)
const currentLeaderboard = computed(() =>
  leaderboardTabs.find(t => t.key === leaderboardTab.value) ?? leaderboardTabs[0],
)

function setLeaderboardTab(tabKey: LeaderboardTabKey) {
  leaderboardTab.value = tabKey
}

const quickLinks = siteContent.homepage.quickLinks
const news = siteContent.homepage.news
const featuredEvents = siteContent.homepage.featuredEvents
const featuredGames = siteContent.games.slice(0, 3)
</script>

<template>
  <div>
    <!-- 跑馬燈（全寬） -->
    <AppMarquee />

    <!-- Banner 輪播（全寬） -->
    <BannerSlider />

    <!-- CTA + 快速入口（全寬，卡片背景） -->
    <div style="background:var(--color-bg-card); border-bottom:1px solid var(--color-border);">
      <div class="content-narrow px-4 py-4">
        <button
          class="btn-gold w-full justify-center text-lg py-4 mb-3"
          style="border-radius:14px;"
          @click="openLobby('https://example.com/h5')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
          立即進入遊戲大廳
        </button>

        <!-- 快速入口 -->
        <div class="grid grid-cols-4 gap-2 lg:gap-3">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.key"
            :to="link.to"
            class="flex flex-col items-center gap-1.5 py-2 lg:py-3 rounded-xl no-underline"
            style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border);"
          >
            <svg v-if="link.key === 'deposit'" class="w-6 h-6" style="color:var(--color-gold);" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            <svg v-else-if="link.key === 'events'" class="w-6 h-6" style="color:#f87171;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
            <svg v-else-if="link.key === 'leaderboard'" class="w-6 h-6" style="color:#4ade80;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 8v8m-4-5v5m-4-2v2M4 20h16"/></svg>
            <svg v-else class="w-6 h-6" style="color:var(--color-purple-glow);" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span class="text-xs" :style="{ color: link.color }">{{ link.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 內容區（單欄，置中縮窄） -->
    <div class="content-narrow">

      <!-- 最新消息 -->
      <section class="px-4 pt-5 pb-4" aria-labelledby="news-heading">
        <h2 id="news-heading" class="section-title mb-3">最新消息</h2>
        <div class="card-purple">
          <article v-for="(item, i) in news" :key="i" class="news-item px-4">
            <span class="news-badge" :class="item.type">{{ item.label }}</span>
            <div>
              <p class="news-title">{{ item.title }}</p>
              <time class="text-xs" style="color:rgba(196,181,213,0.5);">{{ item.time }}</time>
            </div>
          </article>
        </div>
      </section>

      <!-- 熱門活動 -->
      <section class="px-4 pb-4" aria-labelledby="events-heading">
        <div class="flex items-center justify-between mb-3">
          <h2 id="events-heading" class="section-title">熱門活動</h2>
          <NuxtLink to="/events" class="text-xs no-underline" style="color:var(--color-purple-light);">查看全部 →</NuxtLink>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="event in featuredEvents"
            :key="event.title"
            :to="event.to"
            class="card-purple p-4 no-underline block"
            :style="{ background: event.background }"
          >
            <div class="text-xs font-bold mb-1" style="color:var(--color-gold);">{{ event.status }}</div>
            <div class="font-black text-white">{{ event.title }}</div>
            <div class="text-xs mt-1" style="color:rgba(255,255,255,0.6);">{{ event.subtitle }}</div>
          </NuxtLink>
        </div>
      </section>

      <!-- 熱門遊戲 -->
      <section class="px-4 pb-4" aria-labelledby="games-heading">
        <div class="flex items-center justify-between mb-3">
          <h2 id="games-heading" class="section-title">熱門遊戲</h2>
          <NuxtLink to="/tutorial" class="text-xs no-underline" style="color:var(--color-purple-light);">探索更多 →</NuxtLink>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="game in featuredGames"
            :key="game.name"
            to="/tutorial"
            class="card-purple overflow-hidden no-underline block"
            :aria-label="`${game.name}，RTP ${game.rtp}`"
          >
            <!-- 遊戲封面（美術出圖替換） -->
            <div
              class="aspect-video flex items-center justify-center relative"
              :style="{ background: `linear-gradient(135deg, var(--color-purple-dark), ${game.color}33)` }"
            >
              <span class="text-4xl" aria-hidden="true">🎮</span>
              <span
                v-if="game.badge"
                class="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded"
                :class="game.badge === '新上線' ? 'tag-hot' : 'tag-new'"
              >{{ game.badge }}</span>
            </div>
            <div class="p-3">
              <h3 class="font-bold text-sm mb-0.5">{{ game.name }}</h3>
              <p class="text-xs" style="color:var(--color-text-muted);">{{ game.desc }}</p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs" style="color:var(--color-purple-light);">RTP {{ game.rtp }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-bold" style="background:rgba(245,200,66,0.15); color:var(--color-gold); border:1px solid rgba(245,200,66,0.3);">試玩</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- 排行榜快報 -->
      <section class="px-4 pb-6" aria-labelledby="leaderboard-heading">
        <div class="flex items-center justify-between mb-3">
          <h2 id="leaderboard-heading" class="section-title">排行榜快報</h2>
          <div class="flex items-center gap-1.5">
            <div class="w-1.5 h-1.5 rounded-full glow-pulse" style="background:#4ade80;" aria-hidden="true" />
            <span class="text-xs" style="color:var(--color-text-muted);">{{ lastUpdate }} 更新</span>
            <NuxtLink to="/leaderboard" class="text-xs no-underline ml-2" style="color:var(--color-purple-light);">查看全榜 →</NuxtLink>
          </div>
        </div>
        <div class="card-purple p-3">
          <div class="tab-bar mb-3" role="tablist">
            <button
              v-for="tab in leaderboardTabs"
              :key="tab.key"
              type="button"
              class="tab-btn"
              :class="{ active: leaderboardTab === tab.key }"
              role="tab"
              :aria-selected="leaderboardTab === tab.key"
              @pointerdown="setLeaderboardTab(tab.key)"
              @click="setLeaderboardTab(tab.key)"
            >
              {{ tab.label }}
            </button>
          </div>
          <Transition name="tab-fade" mode="out-in">
            <div :key="leaderboardTab">
              <div v-for="item in currentLeaderboard.items" :key="item.rank" class="rank-item">
                <div class="rank-badge" :class="item.rank <= 3 ? `r${item.rank}` : 'rn'">{{ item.rank }}</div>
                <div class="flex-1">
                  <div class="flex justify-between">
                    <span class="text-sm font-bold">{{ item.name }}</span>
                    <span class="text-sm font-bold" :style="{ color: item.color ?? 'var(--color-purple-light)' }">{{ item.amount }}</span>
                  </div>
                  <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.game }} · {{ item.time }}</div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </section>

    </div><!-- end content-narrow -->
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>
