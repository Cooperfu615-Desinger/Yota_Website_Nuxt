<script setup lang="ts">
useSeoMeta({
  title: '排行榜 — 巨亨ONLINE | 頂尖玩家即時排名',
  description: '查看巨亨ONLINE即時排行榜！總贏分、倍率、活動三大榜單，看看誰是本週冠軍。',
  ogTitle: '排行榜 — 巨亨ONLINE',
})

const { lastUpdate } = useLeaderboardTimer()
const activeTab = ref<'win' | 'multi' | 'event'>('win')

const winTop3 = [
  { rank: 1, name: '玩家***旺', amount: 'NT$2,580,000', game: '老虎機', time: '最近活躍',  color: 'var(--color-gold)', badge: 'r1' },
  { rank: 2, name: '玩家***福', amount: 'NT$1,820,000', game: '百家樂', time: '3小時前',  color: '#C0C0C0',              badge: 'r2' },
  { rank: 3, name: '玩家***星', amount: 'NT$960,000',   game: '老虎機', time: '1天前',    color: '#CD7F32',              badge: 'r3' },
]
const winRest = Array.from({ length: 7 }, (_, i) => ({
  rank: i + 4,
  name: `玩家***${['財','福','祿','壽','喜','吉','順'][i]}`,
  amount: `NT$${(800000 - i * 80000).toLocaleString()}`,
  game: ['老虎機','百家樂','捕魚','老虎機','百家樂','老虎機','捕魚'][i],
}))

const multiTop3 = [
  { rank: 1, name: '玩家***龍', amount: '×2,560 倍', game: '水果老虎機', time: '5分鐘前',  color: 'var(--color-gold)', badge: 'r1' },
  { rank: 2, name: '玩家***鳳', amount: '×1,888 倍', game: '老虎機',     time: '2小時前',  color: '#C0C0C0',              badge: 'r2' },
  { rank: 3, name: '玩家***虎', amount: '×1,280 倍', game: '捕魚機',     time: '4小時前',  color: '#CD7F32',              badge: 'r3' },
]
const multiRest = Array.from({ length: 7 }, (_, i) => ({
  rank: i + 4,
  name: `玩家***${['風','雲','雷','電','水','火','土'][i]}`,
  amount: `×${(1100 - i * 100).toLocaleString()} 倍`,
  game: ['老虎機','捕魚機','老虎機','百家樂','老虎機','捕魚','老虎機'][i],
}))

const eventTop3 = [
  { rank: 1, name: '玩家***王', amount: '6,280 分', game: '百萬大獎賽', time: '最近活躍',  color: 'var(--color-gold)', badge: 'r1' },
  { rank: 2, name: '玩家***侯', amount: '5,990 分', game: '百萬大獎賽', time: '1小時前',   color: '#C0C0C0',              badge: 'r2' },
  { rank: 3, name: '玩家***將', amount: '5,560 分', game: '百萬大獎賽', time: '3小時前',   color: '#CD7F32',              badge: 'r3' },
]
const eventRest = Array.from({ length: 7 }, (_, i) => ({
  rank: i + 4,
  name: `玩家***${['相','士','兵','車','馬','砲','卒'][i]}`,
  amount: `${(5200 - i * 300).toLocaleString()} 分`,
  game: '百萬大獎賽',
}))

type TabData = { top3: typeof winTop3; rest: typeof winRest }
const tabData = computed<TabData>(() => {
  if (activeTab.value === 'multi') return { top3: multiTop3, rest: multiRest }
  if (activeTab.value === 'event')  return { top3: eventTop3, rest: eventRest }
  return { top3: winTop3, rest: winRest }
})
</script>

<template>
  <div>
    <div class="px-4 pt-4 pb-2">
      <h1 class="section-title mb-1">排行榜</h1>
      <div class="flex items-center gap-1.5">
        <div class="w-1.5 h-1.5 rounded-full glow-pulse" style="background:#4ade80;" aria-hidden="true" />
        <span class="text-xs" style="color:var(--color-text-muted);">{{ lastUpdate }} 更新</span>
      </div>
    </div>

    <!-- Tab -->
    <div class="px-4 mb-4">
      <div class="tab-bar" role="tablist">
        <button class="tab-btn" :class="{ active: activeTab === 'win' }"   role="tab" :aria-selected="activeTab === 'win'"   @click="activeTab = 'win'">總贏分</button>
        <button class="tab-btn" :class="{ active: activeTab === 'multi' }" role="tab" :aria-selected="activeTab === 'multi'" @click="activeTab = 'multi'">倍率榜</button>
        <button class="tab-btn" :class="{ active: activeTab === 'event' }" role="tab" :aria-selected="activeTab === 'event'" @click="activeTab = 'event'">活動榜</button>
      </div>
    </div>

    <Transition name="tab-fade" mode="out-in">
      <div :key="activeTab">
        <!-- 頒獎台 Top 3 -->
        <div class="px-4 mb-4">
          <div class="flex items-end justify-center gap-3" style="height:160px;">
            <!-- 第2名 -->
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background:linear-gradient(135deg,#A855F7,#6B21A8); border:2px solid #C0C0C0; font-size:22px;">👤</div>
              <div class="text-xs text-center" style="color:var(--color-text-muted);">{{ tabData.top3[1].name }}</div>
              <div class="w-full rounded-t-lg flex flex-col items-center justify-end pt-2 pb-3" style="height:80px; background:linear-gradient(180deg,#C0C0C0,#808080);">
                <span class="text-lg font-black text-white">2</span>
              </div>
            </div>
            <!-- 第1名 -->
            <div class="flex flex-col items-center gap-2 flex-1">
              <span class="text-xl" aria-hidden="true">👑</span>
              <div class="w-16 h-16 rounded-full flex items-center justify-center" style="background:linear-gradient(135deg,#A855F7,#6B21A8); border:2px solid var(--color-gold); box-shadow:0 0 16px rgba(245,200,66,0.5); font-size:26px;">👤</div>
              <div class="text-xs text-center font-bold" style="color:var(--color-gold);">{{ tabData.top3[0].name }}</div>
              <div class="w-full rounded-t-lg flex flex-col items-center justify-end pt-2 pb-3" style="height:110px; background:linear-gradient(180deg,var(--color-gold),var(--color-gold-dark));">
                <span class="text-xl font-black" style="color:#1a0a00;">1</span>
              </div>
            </div>
            <!-- 第3名 -->
            <div class="flex flex-col items-center gap-2 flex-1">
              <div class="w-14 h-14 rounded-full flex items-center justify-center" style="background:linear-gradient(135deg,#A855F7,#6B21A8); border:2px solid #CD7F32; font-size:22px;">👤</div>
              <div class="text-xs text-center" style="color:var(--color-text-muted);">{{ tabData.top3[2].name }}</div>
              <div class="w-full rounded-t-lg flex flex-col items-center justify-end pt-2 pb-3" style="height:60px; background:linear-gradient(180deg,#CD7F32,#8B4513);">
                <span class="text-lg font-black text-white">3</span>
              </div>
            </div>
          </div>

          <!-- Top3 分數 -->
          <div class="flex gap-3 mt-3">
            <div v-for="item in tabData.top3" :key="item.rank" class="flex-1 card-purple p-2 text-center">
              <div class="text-xs font-bold" :style="{ color: item.color }">{{ item.amount }}</div>
              <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.game }}</div>
            </div>
          </div>
        </div>

        <!-- 4–10 名 -->
        <div class="card-purple mx-4 mb-6">
          <div v-for="item in tabData.rest" :key="item.rank" class="rank-item">
            <div class="rank-badge rn" :aria-label="`第${item.rank}名`">{{ item.rank }}</div>
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm" style="background:rgba(168,85,247,0.2);" aria-hidden="true">👤</div>
            <div class="flex-1">
              <div class="flex justify-between">
                <span class="text-sm font-bold">{{ item.name }}</span>
                <span class="text-sm font-bold" style="color:var(--color-purple-light);">{{ item.amount }}</span>
              </div>
              <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.game }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
</style>
