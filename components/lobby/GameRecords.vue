<script setup lang="ts">
import { siteContent } from '~/data/siteContent'

interface GameRecord {
  id: number
  time: number
  game: string
  bet: number
  win: number
  balance: number
}

const PAGE_SIZE = 10
const gameNames = siteContent.games.map(g => g.name)
const betOptions = [50, 100, 200, 500, 1000]

const allRecords = ref<GameRecord[]>([])
const startDate = ref('')
const endDate = ref('')
const minDate = ref('')
const maxDate = ref('')
const results = ref<GameRecord[]>([])
const hasQueried = ref(false)
const currentPage = ref(1)

function fmtDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

onMounted(() => {
  const today = new Date()
  const min = new Date(today)
  min.setDate(min.getDate() - 30)
  maxDate.value = fmtDate(today)
  minDate.value = fmtDate(min)
  // 預填最近 30 天區間
  startDate.value = minDate.value
  endDate.value = maxDate.value

  // 產生約 100 筆，隨機分布最近 30 天
  const recs: GameRecord[] = []
  let balance = 12580
  for (let i = 0; i < 100; i++) {
    const t = today.getTime() - Math.random() * 30 * 86400000
    const bet = betOptions[rand(0, betOptions.length - 1)]
    const win = rand(-bet, bet * 3)
    balance += win
    if (balance < 0) balance = rand(100, 2000)
    recs.push({
      id: i + 1,
      time: t,
      game: gameNames[rand(0, gameNames.length - 1)],
      bet,
      win,
      balance,
    })
  }
  recs.sort((a, b) => b.time - a.time)
  allRecords.value = recs
})

const rangeValid = computed(() =>
  !!startDate.value && !!endDate.value && startDate.value <= endDate.value
)

function query() {
  if (!rangeValid.value) return
  const start = new Date(startDate.value + 'T00:00:00').getTime()
  const end = new Date(endDate.value + 'T23:59:59').getTime()
  results.value = allRecords.value.filter(r => r.time >= start && r.time <= end)
  currentPage.value = 1
  hasQueried.value = true
}

const totalPages = computed(() => Math.ceil(results.value.length / PAGE_SIZE))
const pagedResults = computed(() => {
  const startIdx = (currentPage.value - 1) * PAGE_SIZE
  return results.value.slice(startIdx, startIdx + PAGE_SIZE).map((r, i) => ({ ...r, seq: startIdx + i + 1 }))
})

function goPage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  nextTick(() => {
    document.querySelector('.rec-pager .pg.on')?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
}
</script>

<template>
  <div class="card-purple mb-4">
    <div class="px-4 pt-4 pb-2 font-bold" style="color:var(--color-gold);">遊戲紀錄</div>

    <!-- 查詢區 -->
    <div class="px-4 pb-2 flex flex-wrap items-end gap-2">
      <div class="flex-1 min-w-[120px]">
        <label class="input-label" for="rec-start">開始日期</label>
        <input id="rec-start" v-model="startDate" type="date" class="input-field" :min="minDate" :max="maxDate" />
      </div>
      <div class="flex-1 min-w-[120px]">
        <label class="input-label" for="rec-end">結束日期</label>
        <input id="rec-end" v-model="endDate" type="date" class="input-field" :min="minDate" :max="maxDate" />
      </div>
      <button
        class="btn-gold justify-center px-5 flex-shrink-0"
        style="height:42px; border-radius:10px;"
        :disabled="!rangeValid"
        :style="!rangeValid ? 'opacity:0.5;cursor:not-allowed;' : ''"
        @click="query"
      >查詢</button>
    </div>
    <p v-if="!!startDate && !!endDate && startDate > endDate" class="px-4 pb-2 text-xs" style="color:#f87171;">
      開始日期不可晚於結束日期
    </p>

    <!-- 結果 -->
    <div class="border-t" style="border-color:rgba(168,85,247,0.1);">
      <div v-if="!hasQueried" class="px-4 py-10 text-center text-sm" style="color:var(--color-text-muted);">
        請選擇日期區間後查詢
      </div>
      <div v-else-if="results.length === 0" class="px-4 py-10 text-center text-sm" style="color:var(--color-text-muted);">
        查無紀錄
      </div>
      <template v-else>
        <div class="overflow-x-auto px-4 pt-3">
          <table class="w-full text-xs" style="border-collapse:collapse;">
            <thead>
              <tr style="color:var(--color-text-muted);">
                <th class="text-center py-2 pr-3 whitespace-nowrap">編號</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">遊戲名稱</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">投注額</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">贏分</th>
                <th class="text-right py-2 whitespace-nowrap">錢包餘額</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in pagedResults" :key="r.id" class="border-t" style="border-color:rgba(168,85,247,0.08);">
                <td class="text-center py-2 pr-3" style="color:var(--color-text-muted);">{{ r.seq }}</td>
                <td class="text-right py-2 pr-3 whitespace-nowrap" style="color:var(--color-text);">{{ r.game }}</td>
                <td class="text-right py-2 pr-3" style="color:var(--color-text);">{{ r.bet.toLocaleString() }}</td>
                <td class="text-right py-2 pr-3 font-bold" :style="r.win > 0 ? 'color:#4ade80;' : r.win < 0 ? 'color:#f87171;' : 'color:var(--color-text-muted);'">
                  {{ r.win > 0 ? '+' : '' }}{{ r.win.toLocaleString() }}
                </td>
                <td class="text-right py-2" style="color:var(--color-text);">{{ r.balance.toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分頁列（可左右滑動） -->
        <div v-if="totalPages > 1" class="rec-pager flex items-center gap-2 overflow-x-auto px-4 py-3">
          <button class="pg-arrow flex-shrink-0" :disabled="currentPage === 1" @click="goPage(currentPage - 1)" aria-label="上一頁">‹</button>
          <button
            v-for="p in totalPages"
            :key="p"
            class="pg flex-shrink-0 rounded-lg text-xs font-bold"
            :class="{ on: p === currentPage }"
            style="width:32px; height:32px;"
            :style="p === currentPage
              ? 'background:linear-gradient(135deg,var(--color-purple-mid),var(--color-purple)); color:#fff;'
              : 'background:rgba(168,85,247,0.12); color:var(--color-text-muted); border:1px solid var(--color-border);'"
            @click="goPage(p)"
          >{{ p }}</button>
          <button class="pg-arrow flex-shrink-0" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)" aria-label="下一頁">›</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.pg-arrow {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  color: var(--color-purple-light);
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid var(--color-border);
}
.pg-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.rec-pager { scrollbar-width: thin; }

/* 日期輸入框的日曆 icon 改白色 */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) brightness(1.8);
  cursor: pointer;
}
</style>
