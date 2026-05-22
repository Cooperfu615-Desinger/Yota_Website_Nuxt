<script setup lang="ts">
definePageMeta({ layout: 'lobby' })
import { siteContent } from '~/data/siteContent'

const { isLoggedIn, openLogin, userInfo } = useAppState()

// ── 日期計算 ──────────────────────────────────────────
const now         = new Date()
const today       = now.getDate()
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
const monthLabel  = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`

// ── Demo 狀態（真實環境由後端提供）────────────────────
// 已簽到的日期（本月），day 18 故意缺少以展示補簽功能
const checkedDays    = useState<number[]>('daily-checked', () =>
  [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,19,20,21,22])
// 已領取的里程碑（天數）
const claimedMilestones = useState<number[]>('daily-claimed', () => [5, 7, 10, 15, 20])

// ── 計算屬性 ───────────────────────────────────────────
const todayChecked   = computed(() => checkedDays.value.includes(today))
const totalCheckins  = computed(() => checkedDays.value.length)
const progressPct    = computed(() => Math.min(100, (totalCheckins.value / 30) * 100))

const missedDays = computed(() =>
  Array.from({ length: today - 1 }, (_, i) => i + 1)
    .filter(d => !checkedDays.value.includes(d))
)

const { milestones, dailyRewards, makeupCostPerDay } = siteContent.dailyCheckin

function milestoneLeft(days: number) {
  return `calc(${(days / 30) * 100}% - 20px)`
}

function isMilestoneReached(days: number)  { return totalCheckins.value >= days }
function isMilestoneClaimed(days: number)  { return claimedMilestones.value.includes(days) }

// ── 行為 ───────────────────────────────────────────────
function handleCheckin() {
  if (!isLoggedIn.value) { openLogin(); return }
  if (!todayChecked.value) {
    checkedDays.value = [...checkedDays.value, today].sort((a, b) => a - b)
  }
}

function claimMilestone(days: number) {
  if (!isMilestoneReached(days) || isMilestoneClaimed(days)) return
  claimedMilestones.value = [...claimedMilestones.value, days]
  // TODO: 串接後端領獎 API
}

// 補簽確認
const makeupTarget = ref<number | null>(null)
const makeupConfirmed = ref(false)

function openMakeup(day: number) {
  makeupTarget.value = day
  makeupConfirmed.value = false
}

function confirmMakeup() {
  if (!makeupTarget.value) return
  // TODO: 扣除遊戲幣 makeupCostPerDay，呼叫後端 API
  checkedDays.value = [...checkedDays.value, makeupTarget.value].sort((a, b) => a - b)
  makeupConfirmed.value = true
  setTimeout(() => { makeupTarget.value = null }, 1200)
}

// 格子狀態
type DayState = 'checked' | 'today-done' | 'today-pending' | 'missed' | 'future'
function getDayState(day: number): DayState {
  if (checkedDays.value.includes(day)) return day === today ? 'today-done' : 'checked'
  if (day === today) return 'today-pending'
  if (day < today)  return 'missed'
  return 'future'
}
</script>

<template>
  <div class="lobby-page px-4 py-5">

    <!-- 未登入 -->
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="text-5xl mb-4" aria-hidden="true">📅</div>
        <h1 class="text-xl font-black mb-2">每日任務</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可簽到領取每日獎勵</p>
        <button class="btn-gold w-full justify-center" @click="openLogin">立即登入 / 註冊</button>
      </div>
    </template>

    <!-- 已登入 -->
    <template v-else>

      <!-- ── 標題列 ── -->
      <div class="flex items-center justify-between mb-5">
        <div>
          <h1 class="text-xl font-black" style="color:var(--color-gold);">每日任務</h1>
          <p class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ monthLabel }} · 已簽 {{ totalCheckins }} 天</p>
        </div>
        <!-- 今日簽到按鈕 -->
        <button
          class="daily-checkin-btn"
          :class="{ 'daily-checkin-done': todayChecked }"
          :disabled="todayChecked"
          @click="handleCheckin"
        >
          <span v-if="todayChecked">✅ 已簽到</span>
          <span v-else>📅 立即簽到</span>
        </button>
      </div>

      <!-- ── 累積簽到獎勵 ── -->
      <div class="card-purple p-4 mb-4">
        <div class="flex items-center gap-2 mb-4">
          <span style="color:var(--color-gold); font-size:18px;" aria-hidden="true">🎁</span>
          <span class="font-black" style="color:var(--color-gold);">累積簽到獎勵</span>
          <span class="text-xs ml-auto" style="color:var(--color-text-muted);">
            Progress: <strong style="color:var(--color-gold);">{{ totalCheckins }}</strong> / 30 Days
          </span>
        </div>

        <!-- 進度條 + 里程碑 -->
        <div class="milestone-wrap">
          <!-- 底部軌道 -->
          <div class="milestone-track" />
          <!-- 已完成進度 -->
          <div class="milestone-progress" :style="{ width: `${progressPct}%` }" />
          <!-- 里程碑節點 -->
          <button
            v-for="m in milestones"
            :key="m.days"
            class="milestone-node"
            :class="{
              'node-reached':  isMilestoneReached(m.days),
              'node-claimed':  isMilestoneClaimed(m.days),
              'node-claimable': isMilestoneReached(m.days) && !isMilestoneClaimed(m.days),
            }"
            :style="{ left: milestoneLeft(m.days) }"
            :aria-label="`${m.days}天里程碑：${m.reward}${isMilestoneClaimed(m.days) ? '（已領取）' : isMilestoneReached(m.days) ? '（可領取）' : ''}`"
            :disabled="!isMilestoneReached(m.days) || isMilestoneClaimed(m.days)"
            @click="claimMilestone(m.days)"
          >
            <span v-if="isMilestoneClaimed(m.days)">✓</span>
            <span v-else>🎁</span>
          </button>
          <!-- 里程碑標籤 -->
          <div class="milestone-labels">
            <div
              v-for="m in milestones"
              :key="m.days"
              class="milestone-label"
              :style="{ left: milestoneLeft(m.days) }"
              :class="{ 'label-reached': isMilestoneReached(m.days) }"
            >
              <div>{{ m.days }}天</div>
              <div class="milestone-reward">{{ m.reward }}</div>
            </div>
          </div>
        </div>

        <!-- 可領取提示 -->
        <div
          v-if="milestones.some(m => isMilestoneReached(m.days) && !isMilestoneClaimed(m.days))"
          class="mt-3 text-xs text-center"
          style="color:#4ade80;"
        >
          🎉 有里程碑獎勵可以領取！點擊節點即可領取
        </div>
      </div>

      <!-- ── 本月簽到 ── -->
      <div class="card-purple p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <span class="font-black" style="color:var(--color-text);">本月簽到</span>
          <div class="flex items-center gap-3 text-xs" style="color:var(--color-text-muted);">
            <span><span class="legend-dot legend-today" aria-hidden="true" /> 今日</span>
            <span><span class="legend-dot legend-checked" aria-hidden="true" /> 已簽</span>
            <span><span class="legend-dot legend-missed" aria-hidden="true" /> 可補簽</span>
          </div>
        </div>

        <div class="checkin-grid">
          <button
            v-for="day in daysInMonth"
            :key="day"
            class="checkin-cell"
            :class="`cell-${getDayState(day)}`"
            :aria-label="`${day}日${getDayState(day) === 'missed' ? '（可補簽，花費 NT$' + makeupCostPerDay + '）' : ''}`"
            :disabled="getDayState(day) === 'future' || getDayState(day) === 'checked' || getDayState(day) === 'today-done'"
            @click="getDayState(day) === 'missed' ? openMakeup(day) : getDayState(day) === 'today-pending' ? handleCheckin() : undefined"
          >
            <span class="cell-day">{{ day }}</span>
            <span class="cell-icon" aria-hidden="true">
              <template v-if="getDayState(day) === 'checked'">✅</template>
              <template v-else-if="getDayState(day) === 'today-done'">✅</template>
              <template v-else-if="getDayState(day) === 'today-pending'">📅</template>
              <template v-else-if="getDayState(day) === 'missed'">補</template>
              <template v-else>
                <span style="font-size:9px; color:var(--color-text-muted);">NT${{ dailyRewards[day - 1] }}</span>
              </template>
            </span>
          </button>
        </div>
      </div>

      <!-- ── 補簽到說明 ── -->
      <div class="card-purple p-4 mb-4">
        <div class="flex items-center gap-2 mb-2">
          <span style="font-size:16px;" aria-hidden="true">🔄</span>
          <span class="font-black" style="color:var(--color-text);">補簽到</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full ml-1"
            style="background:rgba(168,85,247,0.15); color:var(--color-purple-light); border:1px solid rgba(168,85,247,0.3);"
          >
            每天 NT${{ makeupCostPerDay }} 遊戲幣
          </span>
        </div>
        <p class="text-xs mb-3" style="color:var(--color-text-muted);">
          點擊日曆中灰色的「補」格子，即可花費 NT${{ makeupCostPerDay }} 遊戲幣補回該天的簽到紀錄與獎勵。
        </p>
        <div v-if="missedDays.length > 0" class="flex flex-wrap gap-2">
          <button
            v-for="d in missedDays"
            :key="d"
            class="makeup-day-chip"
            @click="openMakeup(d)"
          >
            {{ d }} 日
          </button>
        </div>
        <p v-else class="text-xs" style="color:#4ade80;">✅ 本月目前沒有漏簽的天數</p>
      </div>

    </template>

    <!-- ── 補簽確認 Modal ── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="makeupTarget !== null"
          class="modal-overlay"
          role="dialog"
          :aria-label="`補簽 ${makeupTarget} 日確認`"
          @click.self="makeupTarget = null"
        >
          <div class="modal-box" style="max-width:340px;">
            <div class="modal-inner text-center">
              <div class="text-4xl mb-3" aria-hidden="true">🔄</div>
              <h2 class="font-black text-lg mb-1">補簽確認</h2>
              <p class="text-sm mb-4" style="color:rgba(255,255,255,0.7);">
                補簽 <strong style="color:var(--color-gold);">{{ makeupTarget }} 日</strong>
                需花費
                <strong style="color:var(--color-gold);">NT${{ makeupCostPerDay }} 遊戲幣</strong>
              </p>
              <div v-if="makeupConfirmed" class="text-green-400 font-bold mb-3">✅ 補簽成功！</div>
              <div v-else class="flex gap-3">
                <button
                  class="flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style="background:rgba(255,255,255,0.1); color:rgba(255,255,255,0.7); border:1px solid rgba(255,255,255,0.2);"
                  @click="makeupTarget = null"
                >
                  取消
                </button>
                <button class="btn-gold flex-1 justify-center" @click="confirmMakeup">
                  確認補簽
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
/* ── 今日簽到按鈕 ── */
.daily-checkin-btn {
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-gold), #D97706);
  color: #1a0a00;
  box-shadow: 0 2px 12px rgba(245,200,66,0.35);
  transition: all 0.2s;
}
.daily-checkin-btn:hover:not(:disabled) { filter: brightness(1.1); }
.daily-checkin-done {
  background: rgba(74,222,128,0.15);
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.3) !important;
  box-shadow: none;
  cursor: default;
}

/* ── 里程碑進度條 ── */
.milestone-wrap {
  position: relative;
  height: 40px;
  margin: 0 20px;
  margin-bottom: 42px;
}
.milestone-track {
  position: absolute;
  top: 50%;
  left: 0; right: 0;
  height: 4px;
  background: rgba(168,85,247,0.2);
  border-radius: 2px;
  transform: translateY(-50%);
}
.milestone-progress {
  position: absolute;
  top: 50%;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--color-gold), #F97316);
  border-radius: 2px;
  transform: translateY(-50%);
  transition: width 0.6s ease;
}
.milestone-node {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  border: 2px solid rgba(168,85,247,0.25);
  background: rgba(28,10,58,0.9);
  color: var(--color-text-muted);
  cursor: default;
  transition: all 0.2s;
  z-index: 1;
}
.node-reached  { border-color: var(--color-gold); background: rgba(245,200,66,0.1); }
.node-claimed  { background: var(--color-gold); color: #1a0a00; border-color: var(--color-gold); }
.node-claimable {
  cursor: pointer;
  animation: pulse-gold 1.5s infinite;
  box-shadow: 0 0 12px rgba(245,200,66,0.5);
}
.node-claimable:hover { filter: brightness(1.2); transform: translateY(-50%) scale(1.1); }
@keyframes pulse-gold {
  0%, 100% { box-shadow: 0 0 8px rgba(245,200,66,0.4); }
  50%       { box-shadow: 0 0 18px rgba(245,200,66,0.7); }
}

.milestone-labels {
  position: absolute;
  top: 100%;
  left: 0; right: 0;
  margin-top: 4px;
}
.milestone-label {
  position: absolute;
  transform: translateX(-50%);
  text-align: center;
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
}
.label-reached { color: var(--color-gold); }
.milestone-reward {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 1px;
}

/* ── 圖例 ── */
.legend-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 3px;
  vertical-align: middle;
}
.legend-today   { background: var(--color-gold); }
.legend-checked { background: #4ade80; }
.legend-missed  { background: rgba(168,85,247,0.4); border: 1px solid rgba(168,85,247,0.6); }

/* ── 本月簽到格子 ── */
.checkin-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
.checkin-cell {
  aspect-ratio: 1;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid rgba(168,85,247,0.15);
  background: rgba(28,10,58,0.6);
  cursor: default;
  padding: 2px;
  transition: all 0.2s;
}
.cell-day  { font-size: 10px; font-weight: 700; color: var(--color-text-muted); line-height: 1; }
.cell-icon { font-size: 13px; line-height: 1; }

.cell-checked, .cell-today-done {
  background: rgba(74,222,128,0.08);
  border-color: rgba(74,222,128,0.25);
}
.cell-checked .cell-day, .cell-today-done .cell-day { color: #4ade80; }

.cell-today-pending {
  background: rgba(245,200,66,0.12);
  border-color: var(--color-gold);
  cursor: pointer;
  box-shadow: 0 0 10px rgba(245,200,66,0.3);
  animation: pulse-gold 1.5s infinite;
}
.cell-today-pending .cell-day { color: var(--color-gold); }

.cell-missed {
  background: rgba(168,85,247,0.08);
  border-color: rgba(168,85,247,0.3);
  cursor: pointer;
}
.cell-missed:hover {
  background: rgba(168,85,247,0.18);
  border-color: rgba(168,85,247,0.6);
}
.cell-missed .cell-day  { color: var(--color-purple-light); }
.cell-missed .cell-icon {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-purple-light);
  background: rgba(168,85,247,0.2);
  border-radius: 4px;
  padding: 1px 3px;
}

.cell-future { opacity: 0.35; }

/* ── 補簽日期 chip ── */
.makeup-day-chip {
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  background: rgba(168,85,247,0.12);
  border: 1px solid rgba(168,85,247,0.35);
  color: var(--color-purple-light);
  cursor: pointer;
  transition: all 0.2s;
}
.makeup-day-chip:hover {
  background: rgba(168,85,247,0.25);
  border-color: var(--color-purple-light);
  color: #fff;
}

/* ── Modal 動畫 ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
