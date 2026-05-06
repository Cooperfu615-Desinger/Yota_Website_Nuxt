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
      <section class="pb-4" aria-labelledby="events-heading">
        <div class="flex items-center justify-between mb-3 px-4">
          <h2 id="events-heading" class="section-title">熱門活動</h2>
          <NuxtLink to="/events" class="text-xs no-underline" style="color:var(--color-purple-light);">查看全部 →</NuxtLink>
        </div>
        <div class="events-scroll px-4">
          <NuxtLink
            v-for="event in featuredEvents"
            :key="event.title"
            :to="event.to"
            class="events-scroll-card card-purple no-underline block overflow-hidden flex-shrink-0"
            :aria-label="event.title"
          >
            <!-- 活動主視覺圖（有圖優先顯示圖） -->
            <img
              v-if="event.imageSrc"
              :src="baseURL.replace(/\/$/, '') + event.imageSrc"
              :alt="event.title"
              class="w-full h-auto block"
            />
            <!-- 無圖 fallback：漸層色塊 -->
            <div
              v-else
              class="w-full aspect-video flex items-center justify-center"
              :style="{ background: event.background }"
            >
              <span class="font-black text-white text-lg">{{ event.title }}</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- 熱門遊戲 -->
      <section class="pb-4" aria-labelledby="games-heading">
        <div class="flex items-center justify-between mb-3 px-4">
          <h2 id="games-heading" class="section-title">熱門遊戲</h2>
          <NuxtLink to="/tutorial" class="text-xs no-underline" style="color:var(--color-purple-light);">探索更多 →</NuxtLink>
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
