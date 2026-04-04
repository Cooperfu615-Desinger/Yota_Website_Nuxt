<script setup lang="ts">
useSeoMeta({
  title: '巨亨 ONLINE — 官方網站 | 全台頂級線上娛樂城',
  description: '巨亨ONLINE官方網站，提供老虎機、百家樂等多種博弈遊戲，立即試玩！快速儲值、安全有保障，支援iOS/Android APP下載。',
  ogTitle: '巨亨 ONLINE — 全台頂級線上娛樂城',
  ogDescription: '立即試玩老虎機、百家樂！快速儲值，多種支付方式，24小時線上客服。',
  ogType: 'website',
})

const { openLobby } = useAppState()
const { lastUpdate } = useLeaderboardTimer()

const leaderboardTab = ref<'win' | 'multi'>('win')

const winRanks = [
  { rank: 1, name: '玩家***旺', amount: 'NT$2,580,000', game: '老虎機', time: '最近活躍', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***福', amount: 'NT$1,820,000', game: '百家樂', time: '3小時前',  color: '#C0C0C0' },
  { rank: 3, name: '玩家***星', amount: 'NT$960,000',   game: '老虎機', time: '1天前',    color: '#CD7F32' },
]
const multiRanks = [
  { rank: 1, name: '玩家***龍', amount: '×2,560 倍', game: '水果老虎機', time: '5分鐘前', color: 'var(--color-gold)' },
  { rank: 2, name: '玩家***鳳', amount: '×1,888 倍', game: '老虎機',     time: '2小時前', color: '#C0C0C0' },
  { rank: 3, name: '玩家***虎', amount: '×1,280 倍', game: '捕魚機',     time: '4小時前', color: '#CD7F32' },
]
const currentRanks = computed(() => leaderboardTab.value === 'win' ? winRanks : multiRanks)

const news = [
  { type: 'activity', label: '活動', title: '百萬排行榜決賽倒數中！最後衝刺機會不容錯過', time: '1小時前' },
  { type: 'system',   label: '公告', title: '系統維護公告：2024/01/15 凌晨 05:00–05:30',  time: '3小時前' },
  { type: 'activity', label: '活動', title: '新手首儲禮包升級！最高獲得 5,000 點額外贈點', time: '昨天' },
]
</script>

<template>
  <div>
    <!-- 跑馬燈（全寬） -->
    <AppMarquee />

    <!-- 桌面版：Banner + 側欄 雙欄佈局 / 手機版：單欄 -->
    <div class="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 lg:pt-4 lg:px-0">

      <!-- 左欄：Banner + 立即玩 + 快速入口 -->
      <div>
        <!-- Banner 輪播 -->
        <BannerSlider />

        <!-- 立即玩 + 快速入口 -->
        <div class="px-4 py-4 lg:px-0 lg:py-4" style="background:var(--color-bg-card); border-bottom:1px solid var(--color-border);">
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
            <NuxtLink to="/deposit"     class="flex flex-col items-center gap-1.5 py-2 lg:py-3 rounded-xl no-underline" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border);">
              <svg class="w-6 h-6" style="color:var(--color-gold);" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              <span class="text-xs" style="color:var(--color-text-muted);">儲值</span>
            </NuxtLink>
            <NuxtLink to="/events"      class="flex flex-col items-center gap-1.5 py-2 lg:py-3 rounded-xl no-underline" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border);">
              <svg class="w-6 h-6" style="color:#f87171;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
              <span class="text-xs" style="color:var(--color-text-muted);">活動</span>
            </NuxtLink>
            <NuxtLink to="/leaderboard" class="flex flex-col items-center gap-1.5 py-2 lg:py-3 rounded-xl no-underline" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border);">
              <svg class="w-6 h-6" style="color:#4ade80;" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 8v8m-4-5v5m-4-2v2M4 20h16"/></svg>
              <span class="text-xs" style="color:var(--color-text-muted);">排行榜</span>
            </NuxtLink>
            <NuxtLink to="/tutorial"    class="flex flex-col items-center gap-1.5 py-2 lg:py-3 rounded-xl no-underline" style="background:rgba(168,85,247,0.1); border:1px solid var(--color-border);">
              <svg class="w-6 h-6" style="color:var(--color-purple-glow);" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
              <span class="text-xs" style="color:var(--color-text-muted);">教學</span>
            </NuxtLink>
          </div>
        </div>

        <!-- 手機版：排行榜快報（桌面版在側欄） -->
        <section class="px-4 py-5 lg:hidden" aria-labelledby="leaderboard-heading-mobile">
          <div class="flex items-center justify-between mb-3">
            <h2 id="leaderboard-heading-mobile" class="section-title">排行榜快報</h2>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full glow-pulse" style="background:#4ade80;" aria-hidden="true" />
              <span class="text-xs" style="color:var(--color-text-muted);">{{ lastUpdate }} 更新</span>
              <NuxtLink to="/leaderboard" class="text-xs no-underline ml-2" style="color:var(--color-purple-light);">查看全榜 →</NuxtLink>
            </div>
          </div>
          <div class="card-purple p-3">
            <div class="tab-bar mb-3" role="tablist">
              <button class="tab-btn" :class="{ active: leaderboardTab === 'win' }"   role="tab" :aria-selected="leaderboardTab === 'win'"   @click="leaderboardTab = 'win'">總贏分榜</button>
              <button class="tab-btn" :class="{ active: leaderboardTab === 'multi' }" role="tab" :aria-selected="leaderboardTab === 'multi'" @click="leaderboardTab = 'multi'">倍率榜</button>
            </div>
            <Transition name="tab-fade" mode="out-in">
              <div :key="leaderboardTab">
                <div v-for="item in currentRanks" :key="item.rank" class="rank-item">
                  <div class="rank-badge" :class="`r${item.rank}`">{{ item.rank }}</div>
                  <div class="flex-1">
                    <div class="flex justify-between">
                      <span class="text-sm font-bold">{{ item.name }}</span>
                      <span class="text-sm font-bold" :style="{ color: item.color }">{{ item.amount }}</span>
                    </div>
                    <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.game }} · {{ item.time }}</div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </section>

        <!-- 最新消息 -->
        <section class="px-4 pb-6 lg:px-0 lg:pb-6" aria-labelledby="news-heading">
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
      </div>

      <!-- 右欄（桌面版側欄） -->
      <aside class="hidden lg:block space-y-5 pt-4">
        <!-- 排行榜快報 -->
        <section aria-labelledby="leaderboard-heading-desktop">
          <div class="flex items-center justify-between mb-3">
            <h2 id="leaderboard-heading-desktop" class="section-title">排行榜快報</h2>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full glow-pulse" style="background:#4ade80;" aria-hidden="true" />
              <span class="text-xs" style="color:var(--color-text-muted);">{{ lastUpdate }} 更新</span>
            </div>
          </div>
          <div class="card-purple p-3">
            <div class="tab-bar mb-3" role="tablist">
              <button class="tab-btn" :class="{ active: leaderboardTab === 'win' }"   role="tab" :aria-selected="leaderboardTab === 'win'"   @click="leaderboardTab = 'win'">總贏分榜</button>
              <button class="tab-btn" :class="{ active: leaderboardTab === 'multi' }" role="tab" :aria-selected="leaderboardTab === 'multi'" @click="leaderboardTab = 'multi'">倍率榜</button>
            </div>
            <Transition name="tab-fade" mode="out-in">
              <div :key="leaderboardTab">
                <div v-for="item in currentRanks" :key="item.rank" class="rank-item">
                  <div class="rank-badge" :class="`r${item.rank}`">{{ item.rank }}</div>
                  <div class="flex-1">
                    <div class="flex justify-between">
                      <span class="text-sm font-bold">{{ item.name }}</span>
                      <span class="text-sm font-bold" :style="{ color: item.color }">{{ item.amount }}</span>
                    </div>
                    <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.game }} · {{ item.time }}</div>
                  </div>
                </div>
              </div>
            </Transition>
            <NuxtLink to="/leaderboard" class="block text-center text-xs mt-3 no-underline" style="color:var(--color-purple-light);">查看完整排行榜 →</NuxtLink>
          </div>
        </section>

        <!-- 熱門活動預告 -->
        <section>
          <h2 class="section-title mb-3">熱門活動</h2>
          <div class="flex flex-col gap-2">
            <NuxtLink to="/events" class="card-purple p-4 no-underline block" style="background:linear-gradient(135deg,#1a003a,#7C3AED);">
              <div class="text-xs font-bold mb-1" style="color:var(--color-gold);">進行中</div>
              <div class="font-black text-white">百萬大獎賽</div>
              <div class="text-xs mt-1" style="color:rgba(255,255,255,0.6);">獎金池 NT$1,280,000</div>
            </NuxtLink>
            <NuxtLink to="/events" class="card-purple p-4 no-underline block" style="background:linear-gradient(135deg,#1a0a00,#D97706);">
              <div class="text-xs font-bold mb-1" style="color:var(--color-gold);">長期活動</div>
              <div class="font-black text-white">新手首儲 +100%</div>
              <div class="text-xs mt-1" style="color:rgba(255,255,255,0.6);">首次儲值即享雙倍點數</div>
            </NuxtLink>
          </div>
        </section>

        <!-- 快速客服 -->
        <section>
          <div class="p-4 rounded-xl" style="background:linear-gradient(135deg,#06C755,#00A041);">
            <div class="font-black text-white mb-1">LINE 客服</div>
            <div class="text-xs mb-3" style="color:rgba(255,255,255,0.8);">24小時即時服務</div>
            <NuxtLink to="/support" class="block text-center py-2 rounded-lg text-sm font-bold" style="background:rgba(255,255,255,0.2); color:white; border:1px solid rgba(255,255,255,0.3);">
              立即聯繫
            </NuxtLink>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>
