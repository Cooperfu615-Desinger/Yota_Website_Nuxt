# 遊戲紀錄查詢 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將個人資訊頁的「最近遊戲紀錄」改為可依日期區間（限最近 30 天）查詢的「遊戲紀錄」，結果以精簡表格每頁 10 行顯示，附可左右滑動的分頁列。

**Architecture:** 新增 `components/lobby/GameRecords.vue` 元件封裝查詢/表格/分頁；假資料與日期界限全在 `onMounted`（client-only）產生以避開 SSG hydration mismatch。member.vue 以 `<LobbyGameRecords />` 取代原清單。

**Tech Stack:** Nuxt 3 SSG、Vue 3 `<script setup>`、Tailwind + CSS 變數。

> **驗證**：dev server 編譯無誤 + 瀏覽器實測（先 curl 試出回 200 的 host：`localhost`/`127.0.0.1`/`[::1]` 其一會回 426）。

---

## File Structure

| 檔案 | 動作 | 職責 |
|------|------|------|
| `components/lobby/GameRecords.vue` | 新增 | 遊戲紀錄查詢 UI：日期區間、查詢、精簡表格、分頁 |
| `pages/lobby/member.vue` | 修改 | 以 `<LobbyGameRecords />` 取代原「最近遊戲紀錄」清單，移除 `historyItems` 引用 |

---

## Task 1: 建立 GameRecords 元件

**Files:**
- Create: `components/lobby/GameRecords.vue`

- [ ] **Step 1: 建立元件檔**

```vue
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
                <th class="text-right py-2 pr-3 whitespace-nowrap">編號</th>
                <th class="text-left py-2 pr-3 whitespace-nowrap">遊戲名稱</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">投注額</th>
                <th class="text-right py-2 pr-3 whitespace-nowrap">贏分</th>
                <th class="text-right py-2 whitespace-nowrap">錢包餘額</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in pagedResults" :key="r.id" class="border-t" style="border-color:rgba(168,85,247,0.08);">
                <td class="text-right py-2 pr-3" style="color:var(--color-text-muted);">{{ r.seq }}</td>
                <td class="text-left py-2 pr-3 whitespace-nowrap" style="color:var(--color-text);">{{ r.game }}</td>
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
</style>
```

- [ ] **Step 2: 驗證編譯**

Run: dev server log 無紅字。
Expected: 無 TS / build 錯誤（`siteContent.games` 的 `name` 欄位存在）。

- [ ] **Step 3: Commit**

```bash
git add components/lobby/GameRecords.vue
git commit -m "feat(member): 新增遊戲紀錄查詢元件 GameRecords"
```

---

## Task 2: 接入 member.vue

**Files:**
- Modify: `pages/lobby/member.vue`

- [ ] **Step 1: 以元件取代原遊戲紀錄清單**

把 member.vue template 內「遊戲紀錄」整塊：

```html
      <!-- 遊戲紀錄 -->
      <div class="card-purple mb-4">
        <div class="px-4 pt-4 pb-2 font-bold" style="color:var(--color-gold);">最近遊戲紀錄</div>
        <div v-for="item in historyItems" :key="item.date" class="px-4 py-3 border-t" style="border-color:rgba(168,85,247,0.1);">
          <div class="flex justify-between items-start">
            <div>
              <div class="text-sm font-bold">{{ item.game }}</div>
              <div class="text-xs mt-0.5" style="color:var(--color-text-muted);">{{ item.date }}</div>
            </div>
            <span class="text-sm font-black" :style="item.positive ? 'color:#4ade80;' : 'color:#f87171;'">
              {{ item.result }}
            </span>
          </div>
        </div>
      </div>
```

替換為：

```html
      <!-- 遊戲紀錄 -->
      <LobbyGameRecords />
```

- [ ] **Step 2: 移除未使用的 historyItems 引用**

在 member.vue `<script setup>` 刪除這行：

```ts
const historyItems = siteContent.member.historyItems
```

> `siteContent` 仍被 `vipUpgrade` 使用，import 保留。

- [ ] **Step 3: 驗證編譯**

Run: dev server log 無紅字。
Expected: 無錯誤、無「historyItems 未定義」殘留。

- [ ] **Step 4: 瀏覽器驗證**

登入後開 `/lobby/member`（用 localStorage 模擬登入；本機以回 200 的 host）：
1. 「遊戲紀錄」卡：預設顯示「請選擇日期區間後查詢」，日期已預填最近 30 天。
2. 點「查詢」→ 出現精簡表格（≤10 行：編號/遊戲名稱/投注額/贏分/錢包餘額），贏分正綠負紅。
3. 出現分頁列（約 10 頁），點頁碼/箭頭切頁，編號跨頁連續（第 2 頁從 11）。
4. 將開始日期改成晚於結束 → 查詢鈕禁用 + 紅字提示。
5. 選一段較舊（>結束）或極窄無資料的區間查詢 → 顯示「查無紀錄」。
6. 日期選擇器被限制在最近 30 天（min/max）。
7. 無 console 錯誤。

- [ ] **Step 5: Commit**

```bash
git add pages/lobby/member.vue
git commit -m "feat(member): 個人資訊改用遊戲紀錄查詢元件"
```

---

## Task 3: 完整建置 + 部署

**Files:** 無

- [ ] **Step 1: 乾淨 SSG 建置（先停 dev server）**

```bash
# 停掉 preview/dev server 後
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate
```
Expected: `Prerendered N routes` + `Generated public docs`，無 error。

- [ ] **Step 2: 重啟 dev + 最終確認**

- 遊戲紀錄查詢、表格、分頁、空狀態、日期限制皆正常。
- 乾淨載入無 console 錯誤、無 hydration mismatch。
- member 其他區塊（VIP 卡、玩家資訊、登出）未回歸。

- [ ] **Step 3: Push 部署**

```bash
git push origin main
```
Expected: GitHub Actions 自動部署；線上 `/lobby/member` 驗證。

---

## Self-Review 註記

- **Spec 覆蓋**：元件化→T1；client-only 假資料/30 天分布→T1（onMounted）；日期區間+30天界限→T1；查詢/空狀態→T1；精簡表格 5 欄→T1；連續編號→T1（`pagedResults` 的 `seq`）；可左右滑動分頁→T1（`.rec-pager overflow-x-auto` + `goPage` scrollIntoView）；取代清單/移除 historyItems→T2。
- **型別/命名一致**：`GameRecord{id,time,game,bet,win,balance}`、`PAGE_SIZE`、`results`/`pagedResults.seq`、`totalPages`、`goPage`、`rangeValid`、`hasQueried` 全程一致。
- **避地雷**：無 Teleport；`new Date()`/隨機只在 onMounted；spec/plan 放 `specs/`。
- **執行相依**：T2 依賴 T1 的 `<LobbyGameRecords>`。依序執行。
