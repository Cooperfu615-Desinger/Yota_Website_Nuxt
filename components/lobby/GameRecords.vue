<script setup lang="ts">
import {
  RECORD_CATEGORIES, RECORD_CURRENCIES, RECORD_PROVIDERS, createDemoRecords,
  filterRecords, recordTotals, periodDates, taipeiDate, shiftDate, validRecordRange,
  type GameRecord, type RecordQuery, type RecordPeriod,
} from '~/utils/gameRecords'

const PAGE_SIZE = 10
const id = useId()
const period = ref<RecordPeriod>('today')
const draft = ref<RecordQuery>({ startDate: '', endDate: '', currency: 'gold', category: 'all', provider: 'all' })
const applied = ref<RecordQuery | null>(null)
const allRecords = ref<GameRecord[]>([])
const results = ref<GameRecord[]>([])
const minDate = ref('')
const maxDate = ref('')
const currentPage = ref(1)
const hasQueried = computed(() => applied.value !== null)
const currencyLabel = computed(() => `${RECORD_CURRENCIES.find(c => c.key === applied.value?.currency)?.label ?? '金'}幣`)
const totals = computed(() => recordTotals(results.value))
const pending = computed(() => applied.value && JSON.stringify(draft.value) !== JSON.stringify(applied.value))
function refreshDates() {
  maxDate.value = taipeiDate()
  minDate.value = shiftDate(maxDate.value, -30)
  if (period.value !== 'custom') Object.assign(draft.value, periodDates(period.value))
}
onMounted(() => {
  refreshDates()
  allRecords.value = createDemoRecords()
})
const rangeValid = computed(() => validRecordRange(draft.value.startDate, draft.value.endDate, minDate.value, maxDate.value))
function query() {
  refreshDates()
  if (!rangeValid.value) return
  allRecords.value = createDemoRecords()
  applied.value = { ...draft.value }
  results.value = filterRecords(allRecords.value, applied.value)
  currentPage.value = 1
}
const totalPages = computed(() => Math.ceil(results.value.length / PAGE_SIZE))
const pagedResults = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return results.value.slice(start, start + PAGE_SIZE).map((r, i) => ({ ...r, seq: start + i + 1 }))
})
function goPage(page: number) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}
</script>

<template>
  <div class="card-purple mb-4">
    <form class="rec-filters" @submit.prevent="query">
      <div>
        <label class="input-label" :for="`${id}-period`">時間範圍</label>
        <select :id="`${id}-period`" v-model="period" class="input-field" @change="refreshDates">
          <option value="today">今日</option><option value="yesterday">昨日</option>
          <option value="3">前3天</option><option value="5">前5天</option><option value="7">前7天</option><option value="custom">自訂</option>
        </select>
      </div>
      <div>
        <label class="input-label" :for="`${id}-start`">開始日期</label>
        <input :id="`${id}-start`" v-model="draft.startDate" type="date" class="input-field" :min="minDate" :max="maxDate" @input="period = 'custom'" />
      </div>
      <div>
        <label class="input-label" :for="`${id}-end`">結束日期</label>
        <input :id="`${id}-end`" v-model="draft.endDate" type="date" class="input-field" :min="minDate" :max="maxDate" @input="period = 'custom'" />
      </div>
      <div>
        <label class="input-label" :for="`${id}-currency`">幣別</label>
        <select :id="`${id}-currency`" v-model="draft.currency" class="input-field"><option v-for="c in RECORD_CURRENCIES" :key="c.key" :value="c.key">{{ c.label }}</option></select>
      </div>
      <div>
        <label class="input-label" :for="`${id}-category`">類別</label>
        <select :id="`${id}-category`" v-model="draft.category" class="input-field"><option value="all">全部</option><option v-for="c in RECORD_CATEGORIES" :key="c.key" :value="c.key">{{ c.label }}</option></select>
      </div>
      <div>
        <label class="input-label" :for="`${id}-provider`">供應商</label>
        <select :id="`${id}-provider`" v-model="draft.provider" class="input-field"><option value="all">全部</option><option v-for="p in RECORD_PROVIDERS" :key="p" :value="p">{{ p }}</option></select>
      </div>
      <button class="btn-gold rec-query" type="submit" :disabled="!rangeValid">查詢</button>
    </form>
    <p class="rec-hint">日期以台灣時間計算；前3／5／7天不含今日。以下為示範紀錄。</p>
    <p v-if="!rangeValid && maxDate" class="rec-hint rec-error" role="alert">請選擇最近30天內的有效日期，開始日期不可晚於結束日期。</p>
    <p v-if="pending" class="rec-hint" role="status">條件已變更，請按「查詢」更新結果。</p>

    <!-- 結果 -->
    <div class="border-t" style="border-color:rgba(168,85,247,0.1);">
      <div v-if="!hasQueried" class="px-4 py-10 text-center text-sm" style="color:var(--color-text-muted);">
        請選擇篩選條件後查詢
      </div>
      <div v-if="hasQueried" class="rec-summary" aria-live="polite">
        <strong>總計</strong><span>共 {{ results.length.toLocaleString() }} 筆</span>
        <span>投注額：<strong>{{ totals.bet.toLocaleString() }}</strong> {{ currencyLabel }}</span>
        <span>贏分：<strong :style="{ color: totals.win > 0 ? '#4ade80' : totals.win < 0 ? '#f87171' : 'inherit' }">{{ totals.win > 0 ? '+' : '' }}{{ totals.win.toLocaleString() }}</strong> {{ currencyLabel }}</span>
        <small v-if="applied">{{ applied.startDate }} ～ {{ applied.endDate }} · 全部符合條件的紀錄</small>
      </div>
      <div v-if="hasQueried && results.length === 0" class="px-4 py-10 text-center text-sm" style="color:var(--color-text-muted);">
        查無紀錄
      </div>
      <template v-if="hasQueried && results.length">
        <div class="overflow-x-auto px-4 pt-3">
          <table class="w-full text-xs" style="border-collapse:collapse;">
            <thead>
              <tr style="color:var(--color-text-muted);">
                <th class="text-center py-2 pr-3 whitespace-nowrap">編號</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">遊戲名稱</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">投注額（{{ currencyLabel }}）</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">贏分（{{ currencyLabel }}）</th>
                <th class="text-right py-2 whitespace-nowrap">錢包餘額（{{ currencyLabel }}）</th>
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
.rec-filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 16px; align-items: end; }
.rec-filters > div { min-width: 0; }
.rec-filters .input-field { width: 100%; min-width: 0; color-scheme: dark; }
.rec-filters option { background: #1a0a2e; color: #f3e8ff; }
.rec-query { min-height: 42px; justify-content: center; border-radius: 10px; grid-column: 3; }
.rec-query:disabled { opacity: .5; cursor: not-allowed; }
.rec-hint { margin: 0; padding: 0 16px 12px; font-size: 12px; color: var(--color-text-muted); }
.rec-error { color: #f87171; }
.rec-summary { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 20px; margin: 16px; padding: 14px; border: 1px solid var(--color-border); border-radius: 10px; background: rgba(168,85,247,.1); font-size: 13px; }
.rec-summary > strong { color: var(--color-gold); }
.rec-summary small { width: 100%; color: var(--color-text-muted); }
@media (max-width: 600px) { .rec-filters { grid-template-columns: minmax(0, 1fr); } .rec-query { grid-column: auto; } }

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
  filter: none;
  cursor: pointer;
}
</style>
