<script setup lang="ts">
useSeoMeta({
  title: '熱門活動 — 巨亨ONLINE | 最新優惠與賽事',
  description: '巨亨ONLINE最新活動！百萬大獎賽、新手好禮、儲值加倍等限時優惠，立即參與贏取豐厚獎金。',
  ogTitle: '熱門活動 — 巨亨ONLINE',
})

type EventStatus = 'active' | 'upcoming' | 'ended'
const activeTab = ref<EventStatus>('active')

interface GameEvent {
  id: number
  title: string
  subtitle: string
  status: EventStatus
  endDate: string
  prize: string
  gradient: string
}

const events: GameEvent[] = [
  { id: 1, title: '百萬大獎賽', subtitle: '累積積分衝頂，贏取百萬獎金', status: 'active', endDate: '2024/01/31', prize: 'NT$1,280,000', gradient: 'linear-gradient(135deg,#1a003a,#7C3AED)' },
  { id: 2, title: '新手首儲禮', subtitle: '首次儲值享最高 100% 加碼', status: 'active', endDate: '長期', prize: '+100%', gradient: 'linear-gradient(135deg,#1a0a00,#D97706)' },
  { id: 3, title: '每日簽到獎', subtitle: '連續簽到 7 天，累積豐厚獎勵', status: 'active', endDate: '長期', prize: '每日點數', gradient: 'linear-gradient(135deg,#0a1a00,#166534)' },
  { id: 4, title: '春節限定活動', subtitle: '農曆新年特別回饋，限時限量', status: 'upcoming', endDate: '2024/02/10', prize: 'NT$500,000', gradient: 'linear-gradient(135deg,#2d0a0a,#991b1b)' },
  { id: 5, title: '情人節特別賽', subtitle: '雙人對戰，贏取情侶大禮包', status: 'upcoming', endDate: '2024/02/14', prize: '神秘禮物', gradient: 'linear-gradient(135deg,#1a003a,#be185d)' },
  { id: 6, title: '跨年倒數賽', subtitle: '2024 年倒數特別活動（已結束）', status: 'ended', endDate: '2024/01/01', prize: 'NT$800,000', gradient: 'linear-gradient(135deg,#1a1a1a,#374151)' },
]

const counts = computed(() => ({
  active:   events.filter(e => e.status === 'active').length,
  upcoming: events.filter(e => e.status === 'upcoming').length,
  ended:    events.filter(e => e.status === 'ended').length,
}))
const filteredEvents = computed(() => events.filter(e => e.status === activeTab.value))

const selectedEvent = ref<GameEvent | null>(null)

const tabs = [
  { key: 'active'   as EventStatus, label: '進行中' },
  { key: 'upcoming' as EventStatus, label: '即將開始' },
  { key: 'ended'    as EventStatus, label: '已結束' },
]
</script>

<template>
  <div class="pb-4">
    <div class="px-4 pt-4 pb-2">
      <h1 class="section-title">熱門活動</h1>
    </div>

    <!-- 狀態 Tab -->
    <div class="px-4 mb-4">
      <div class="tab-bar" role="tablist" aria-label="活動狀態">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn relative"
          :class="{ active: activeTab === tab.key }"
          role="tab"
          :aria-selected="activeTab === tab.key"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
            style="background:#dc2626; color:#fff; font-size:10px;"
            aria-hidden="true"
          >{{ counts[tab.key] }}</span>
        </button>
      </div>
    </div>

    <!-- 活動列表 -->
    <Transition name="tab-fade" mode="out-in">
      <div :key="activeTab" class="px-4 flex flex-col gap-4">
        <article
          v-for="event in filteredEvents"
          :key="event.id"
          class="card-purple overflow-hidden cursor-pointer"
          :aria-label="`活動：${event.title}`"
          @click="selectedEvent = event"
        >
          <!-- 封面 -->
          <div class="flex items-center justify-between px-4 py-5" :style="{ background: event.gradient }">
            <div>
              <div class="text-lg font-black text-white">{{ event.title }}</div>
              <div class="text-xs mt-1" style="color:rgba(255,255,255,0.7);">{{ event.subtitle }}</div>
            </div>
            <div class="text-right">
              <div class="text-sm font-bold" style="color:var(--color-gold);">{{ event.prize }}</div>
              <span
                class="text-xs px-2 py-0.5 rounded-full font-bold mt-1 inline-block"
                :style="event.status === 'active'
                  ? 'background:rgba(74,222,128,0.2); color:#4ade80; border:1px solid rgba(74,222,128,0.4);'
                  : event.status === 'upcoming'
                    ? 'background:rgba(251,191,36,0.2); color:#fbbf24; border:1px solid rgba(251,191,36,0.4);'
                    : 'background:rgba(156,163,175,0.2); color:#9ca3af; border:1px solid rgba(156,163,175,0.3);'"
              >
                {{ event.status === 'active' ? '進行中' : event.status === 'upcoming' ? '即將開始' : '已結束' }}
              </span>
            </div>
          </div>
          <div class="px-4 py-3 flex items-center justify-between">
            <span class="text-xs" style="color:var(--color-text-muted);">截止：{{ event.endDate }}</span>
            <span class="text-xs" style="color:var(--color-purple-light);">查看詳情 →</span>
          </div>
        </article>

        <!-- 已結束獲獎名單 -->
        <div v-if="activeTab === 'ended'" class="card-purple p-4 mt-2">
          <h2 class="text-sm font-bold mb-3" style="color:var(--color-gold);">🏆 獲獎名單</h2>
          <table class="w-full text-xs">
            <thead>
              <tr style="color:var(--color-text-muted);">
                <th class="text-left pb-2">名次</th>
                <th class="text-left pb-2">玩家</th>
                <th class="text-right pb-2">獎金</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in [['🥇','玩家***旺','NT$400,000'],['🥈','玩家***福','NT$200,000'],['🥉','玩家***星','NT$100,000']]" :key="i" class="border-t" style="border-color:rgba(168,85,247,0.1);">
                <td class="py-2">{{ row[0] }}</td>
                <td class="py-2" style="color:var(--color-text);">{{ row[1] }}</td>
                <td class="py-2 text-right font-bold" style="color:var(--color-gold);">{{ row[2] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Transition>

    <!-- 活動詳情 Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedEvent" class="modal-overlay" role="dialog" :aria-label="selectedEvent.title" @click.self="selectedEvent = null">
          <div class="modal-box">
            <div class="modal-handle" />
            <button class="modal-close" aria-label="關閉" @click="selectedEvent = null">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            <div class="px-4 py-5 rounded-xl mb-4" :style="{ background: selectedEvent.gradient }">
              <h2 class="text-xl font-black text-white mb-1">{{ selectedEvent.title }}</h2>
              <p class="text-sm" style="color:rgba(255,255,255,0.7);">{{ selectedEvent.subtitle }}</p>
            </div>
            <div class="flex flex-col gap-3 text-sm">
              <div class="flex justify-between"><span style="color:var(--color-text-muted);">活動獎金</span><span class="font-bold" style="color:var(--color-gold);">{{ selectedEvent.prize }}</span></div>
              <div class="flex justify-between"><span style="color:var(--color-text-muted);">截止日期</span><span>{{ selectedEvent.endDate }}</span></div>
              <div class="divider-purple" />
              <p style="color:var(--color-text-muted); line-height:1.8;">
                活動詳細規則說明由後台系統填入。參與方式、計分標準、獎金發放時程等資訊將在活動正式開始後公告。
              </p>
            </div>
            <button class="btn-gold w-full justify-center mt-5">立即參與</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.tab-fade-enter-active, .tab-fade-leave-active { transition: opacity 0.2s; }
.tab-fade-enter-from, .tab-fade-leave-to { opacity: 0; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
