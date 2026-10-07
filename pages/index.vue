<script setup lang="ts">
import { siteContent, type LeaderboardTabKey } from '~/data/siteContent'

useSeoMeta({
  title: '巨亨 ONLINE — 官方網站 | 全台頂級線上娛樂城',
  description: '巨亨ONLINE官方網站，提供老虎機、百家樂等多種博弈遊戲，立即試玩！快速儲值、安全有保障，支援iOS/Android APP下載。',
  ogTitle: '巨亨 ONLINE — 全台頂級線上娛樂城',
  ogDescription: '立即試玩老虎機、百家樂！快速儲值，多種支付方式，24小時線上客服。',
  ogType: 'website',
})

const { lastUpdate } = useLeaderboardTimer()
const { app: { baseURL } } = useRuntimeConfig()
const base = baseURL.replace(/\/$/, '')

const leaderboardTabs = siteContent.leaderboard.tabs.filter(tab => tab.key !== 'event')
const leaderboardTab = ref<LeaderboardTabKey>(leaderboardTabs[0].key)
const currentLeaderboard = computed(() =>
  leaderboardTabs.find(t => t.key === leaderboardTab.value) ?? leaderboardTabs[0],
)

function setLeaderboardTab(tabKey: LeaderboardTabKey) {
  leaderboardTab.value = tabKey
}

const quickLinks = siteContent.homepage.quickLinks
const news = [...siteContent.messageCenters.announcements].sort((a, b) => b.date.localeCompare(a.date))
const newsLabel = (type: string) => siteContent.messageCenters.newsCategories.find(item => item.key === type)?.label ?? '公告'
const featuredEvents = siteContent.homepage.featuredEventIds.flatMap(id => {
  const event = siteContent.lobbyEvents.find(item => item.id === id)
  return event ? [event] : []
})
const featuredGames = siteContent.games.slice(0, 9)
</script>

<template>
  <div>
    <!-- Banner 輪播（全寬） -->
    <BannerSlider />

    <!-- 四顆快速入口按鈕 -->
    <div class="quick-links-bar">
      <div class="content-narrow px-4 py-3">
        <nav class="quick-links-row" aria-label="快速入口">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.key"
            :to="link.to"
            class="quick-btn no-underline"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- 跑馬燈 -->
    <AppMarquee />

    <!-- 內容區（單欄，置中縮窄） -->
    <div class="content-narrow">

      <!-- 最新消息 -->
      <section class="px-4 pt-5 pb-4" aria-labelledby="news-heading">
        <div class="section-title-wrap mb-3">
          <span class="section-title-line" aria-hidden="true" />
          <h2 id="news-heading" class="sr-only">最新消息</h2>
          <img :src="`${base}/title_text_news.png`" alt="最新消息" class="section-title-img" />
          <span class="section-title-line" aria-hidden="true" />
        </div>
        <div class="card-purple p-3 flex flex-col gap-2">
          <NuxtLink v-for="item in news" :key="item.id" :to="{ path: '/events', query: { category: item.type, message: item.id } }" class="news-item no-underline">
            <span class="news-badge" :class="item.type === 'system' ? 'system' : 'announce'">{{ newsLabel(item.type) }}</span>
            <p class="news-title">{{ item.title }}</p>
            <time class="news-time">{{ item.date }}</time>
          </NuxtLink>
        </div>
        <div class="flex justify-center mt-3">
          <NuxtLink to="/events" class="section-more-btn">查看更多</NuxtLink>
        </div>
      </section>

      <!-- 熱門活動 -->
      <section class="pb-4" aria-labelledby="events-heading">
        <div class="section-title-wrap mb-3 px-4">
          <span class="section-title-line" aria-hidden="true" />
          <h2 id="events-heading" class="sr-only">熱門活動</h2>
          <img :src="`${base}/title_text_event.png`" alt="熱門活動" class="section-title-img" />
          <span class="section-title-line" aria-hidden="true" />
        </div>
        <div class="events-scroll px-4">
          <NuxtLink
            v-for="event in featuredEvents"
            :key="event.id"
            :to="{ path: '/events', query: { category: 'events', event: event.id } }"
            class="events-scroll-card card-purple no-underline block overflow-hidden flex-shrink-0"
            :aria-label="event.title"
          >
            <div class="featured-news-card" :style="{ '--event-accent': event.accent }">
              <span class="featured-news-icon" aria-hidden="true">{{ event.icon }}</span>
              <strong>{{ event.title }}</strong>
              <p>{{ event.summary }}</p>
              <span class="featured-news-more">查看活動 →</span>
            </div>
          </NuxtLink>
        </div>
        <!-- 查看更多按鈕 -->
        <div class="flex justify-center mt-3 px-4">
          <NuxtLink to="/events" class="section-more-btn">查看更多</NuxtLink>
        </div>
      </section>

      <!-- 熱門遊戲 -->
      <section class="pb-4" aria-labelledby="games-heading">
        <div class="section-title-wrap mb-3 px-4">
          <span class="section-title-line" aria-hidden="true" />
          <h2 id="games-heading" class="sr-only">熱門遊戲</h2>
          <img :src="`${base}/title_text_games.png`" alt="熱門遊戲" class="section-title-img" />
          <span class="section-title-line" aria-hidden="true" />
        </div>
        <div class="games-scroll px-4">
          <NuxtLink
            v-for="game in featuredGames"
            :key="game.name"
            to="/tutorial"
            class="games-scroll-card card-purple overflow-hidden no-underline block flex-shrink-0"
            :aria-label="`${game.name}，RTP ${game.rtp}`"
          >
            <!-- 遊戲封面 -->
            <div class="relative">
              <img
                v-if="game.imageSrc"
                :src="baseURL.replace(/\/$/, '') + game.imageSrc"
                :alt="game.name"
                class="w-full h-auto block"
              />
              <div
                v-else
                class="w-full flex items-center justify-center"
                style="aspect-ratio:4/3;"
                :style="{ background: `linear-gradient(135deg, var(--color-purple-dark), ${game.color}33)` }"
              >
                <span class="text-4xl" aria-hidden="true">🎮</span>
              </div>
              <span
                v-if="game.badge"
                class="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded"
                :class="game.badge === '新上線' ? 'tag-hot' : 'tag-new'"
              >{{ game.badge }}</span>
            </div>
            <div class="p-2.5">
              <h3 class="font-bold text-sm mb-0.5 truncate">{{ game.name }}</h3>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs" style="color:#fff;">RTP {{ game.rtp }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-bold" style="background:rgba(245,200,66,0.15); color:var(--color-gold); border:1px solid rgba(245,200,66,0.3);">試玩</span>
              </div>
            </div>
          </NuxtLink>
        </div>
        <!-- 探索更多按鈕 -->
        <div class="flex justify-center mt-3 px-4">
          <NuxtLink to="/tutorial" class="section-more-btn">探索更多</NuxtLink>
        </div>
      </section>

      <!-- 排行榜快報 -->
      <section class="px-4 pb-6" aria-labelledby="leaderboard-heading">
        <div class="section-title-wrap mb-2">
          <span class="section-title-line" aria-hidden="true" />
          <h2 id="leaderboard-heading" class="sr-only">排行榜快報</h2>
          <img :src="`${base}/title_text_ranking.png`" alt="排行榜快報" class="section-title-img" />
          <span class="section-title-line" aria-hidden="true" />
        </div>
        <div class="flex items-center justify-end mb-3 gap-1.5">
          <div class="w-1.5 h-1.5 rounded-full glow-pulse" style="background:#4ade80;" aria-hidden="true" />
          <span class="text-xs" style="color:var(--color-text-muted);">{{ lastUpdate }} 更新</span>
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
        <div class="flex justify-center mt-3">
          <NuxtLink to="/leaderboard" class="section-more-btn">查看全榜</NuxtLink>
        </div>
      </section>

    </div><!-- end content-narrow -->
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
.featured-news-card { display: flex; flex-direction: column; align-items: flex-start; min-height: 220px; height: 100%; padding: 22px; background: linear-gradient(135deg, color-mix(in srgb, var(--event-accent) 16%, #1a0a2e), #1a0a2e); }
.featured-news-icon { margin-bottom: 15px; color: var(--event-accent); font-size: 32px; }
.featured-news-card strong { font-size: 18px; font-weight: 900; color: var(--color-text); }
.featured-news-card p { margin: 10px 0 16px; font-size: 13px; line-height: 1.7; color: var(--color-text-muted); }
.featured-news-more { margin-top: auto; color: var(--color-gold); font-size: 12px; font-weight: 800; }
@media (max-width: 600px) { .featured-news-card { padding: 16px; min-height: 230px; } }
</style>
