# 保險箱 + 銀行活動 Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增保險箱（側欄項目 + 存入/取出頁面）並在銀行儲值頁新增「活動」Tab 顯示儲值相關活動。

**Architecture:** 保險箱餘額存入 `useAppState` 既有 `userInfo`（新增 `vaultBalance`），存提邏輯集中於 composable；`VaultContent` 元件處理 UI 與模式切換。銀行活動 Tab 在 `DepositContent` 內條件渲染，沿用 `siteContent.events`（以 `deposit` 旗標篩選）與活動卡片樣式。皆頁面內條件渲染，不用 `<Teleport>`。

**Tech Stack:** Nuxt 3 SSG、Vue 3 `<script setup>`、Tailwind + CSS 變數、`useState` 共用狀態。

> **驗證方式（全專案無自動測試）**：dev server 編譯無誤 + 瀏覽器實測。
> - dev：`PATH="/opt/homebrew/opt/node/bin:$PATH" npm run dev`（已在背景則沿用）。
> - 本機存取：先 `curl -s -o /dev/null -w "%{http_code}" <host>:3000/Yota_Website_Nuxt/lobby/vault` 試出回 200 的 host（`localhost`/`127.0.0.1`/`[::1]` 其一會回 426）。
> - 互動：用瀏覽器 preview 工具。

---

## File Structure

| 檔案 | 動作 | 職責 |
|------|------|------|
| `data/siteContent.ts` | 修改 | `defaultUser` 加 `vaultBalance`；`EventItem` 加 `deposit?`；標記/新增儲值活動 |
| `composables/useAppState.ts` | 修改 | `vaultBalance` 向後相容 + `depositToVault`/`withdrawFromVault` + 持久化 |
| `components/lobby/VaultContent.vue` | 新增 | 保險箱 UI（錢包/保險箱餘額 + 存入/取出切換 + 金額輸入 + 確認） |
| `pages/lobby/vault.vue` | 新增 | 保險箱頁（lobby layout，渲染 VaultContent） |
| `components/LobbySidebar.vue` | 修改 | 第三區新增「保險箱」導覽項 |
| `components/shared/DepositContent.vue` | 修改 | 付款方式新增「活動」Tab + 活動卡片區塊 |

---

## Task 1: 資料模型（vaultBalance + 活動 deposit 旗標）

**Files:**
- Modify: `data/siteContent.ts`

- [ ] **Step 1: `defaultUser` 新增 `vaultBalance`**

找到 `member: { defaultUser: { ... } }`，改為：

```ts
    defaultUser: {
      name: '玩家888',
      vip: 3,
      balance: 12580,
      vaultBalance: 0,
    },
```

- [ ] **Step 2: `EventItem` 介面新增 `deposit?` 旗標**

找到 `export interface EventItem {`，在 `imageSrc?: string` 後加一行：

```ts
  imageSrc?: string
  deposit?: boolean   // true = 儲值相關活動（顯示於銀行活動 Tab）
```

- [ ] **Step 3: 標記既有「新手首儲禮」並新增 2 筆儲值活動**

在 `events: [` 陣列中：
1. 將 id 2「新手首儲禮」那筆結尾加上 `, deposit: true`：

```ts
    { id: 2, title: '新手首儲禮', subtitle: '首次儲值享最高 100% 加碼', status: 'active', endDate: '長期', prize: '+100%', gradient: 'linear-gradient(135deg,#1a0a00,#D97706)', imageSrc: '/event_02.avif', deposit: true },
```

2. 在 id 6 那筆（跨年倒數賽）之後、`] satisfies EventItem[],` 之前，新增兩筆：

```ts
    { id: 7, title: '每週儲值回饋', subtitle: '每週累積儲值，回饋最高 15% 點數', status: 'active', endDate: '長期', prize: '+15%', gradient: 'linear-gradient(135deg,#0a1a2d,#1d4ed8)', deposit: true },
    { id: 8, title: 'VIP 儲值加碼', subtitle: 'VIP 等級越高，儲值加碼越多', status: 'active', endDate: '長期', prize: '最高 +30%', gradient: 'linear-gradient(135deg,#2d0a2d,#9333ea)', deposit: true },
```

- [ ] **Step 4: 驗證編譯**

Run: dev server log 無紅字；或 `PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate` 無 error。
Expected: 無 TS / build 錯誤。

- [ ] **Step 5: 瀏覽器確認活動頁多了兩張卡**

開 `lobby/events`（進行中），應看到「每週儲值回饋」「VIP 儲值加碼」兩張新卡（無圖，顯示漸層 fallback）。

- [ ] **Step 6: Commit**

```bash
git add data/siteContent.ts
git commit -m "feat(bank): 資料模型加 vaultBalance 與活動 deposit 旗標"
```

---

## Task 2: useAppState 保險箱存提邏輯

**Files:**
- Modify: `composables/useAppState.ts`

- [ ] **Step 1: `initFromStorage` 加 vaultBalance 向後相容**

找到 `initFromStorage` 內 `if (saved) userInfo.value = JSON.parse(saved)`，改為：

```ts
        if (saved) {
          userInfo.value = JSON.parse(saved)
          if (userInfo.value.vaultBalance == null) userInfo.value.vaultBalance = 0
        }
```

- [ ] **Step 2: 新增持久化與存提函式**

在 `function logout() { ... }` 之後、`function initFromStorage()` 之前，新增：

```ts
  function persistUser() {
    localStorage.setItem(LS_USER_KEY, JSON.stringify(userInfo.value))
  }
  function depositToVault(amount: number) {
    if (amount <= 0 || amount > userInfo.value.balance) return
    userInfo.value.balance -= amount
    userInfo.value.vaultBalance += amount
    persistUser()
  }
  function withdrawFromVault(amount: number) {
    if (amount <= 0 || amount > userInfo.value.vaultBalance) return
    userInfo.value.vaultBalance -= amount
    userInfo.value.balance += amount
    persistUser()
  }
```

- [ ] **Step 3: 從 composable 匯出新函式**

找到 `return { ... }`，在 `initFromStorage,` 之後加入：

```ts
    depositToVault,
    withdrawFromVault,
```

- [ ] **Step 4: 驗證編譯**

Run: dev server log 無紅字。
Expected: 無 TS 錯誤（`userInfo.value.vaultBalance` 型別來自 defaultUser，存在）。

- [ ] **Step 5: Commit**

```bash
git add composables/useAppState.ts
git commit -m "feat(vault): useAppState 新增保險箱存入/取出與持久化"
```

---

## Task 3: 保險箱頁面 + 側欄項目

**Files:**
- Create: `components/lobby/VaultContent.vue`
- Create: `pages/lobby/vault.vue`
- Modify: `components/LobbySidebar.vue`

- [ ] **Step 1: 建立 `components/lobby/VaultContent.vue`**

```vue
<script setup lang="ts">
const { isLoggedIn, userInfo, openLogin, depositToVault, withdrawFromVault } = useAppState()

const mode = ref<'deposit' | 'withdraw'>('deposit')
const amount = ref(0)

const maxAmount = computed(() => mode.value === 'deposit' ? userInfo.value.balance : userInfo.value.vaultBalance)

watch([mode, maxAmount], () => {
  if (amount.value > maxAmount.value) amount.value = maxAmount.value
})

function onAmountInput(e: Event) {
  let v = parseInt((e.target as HTMLInputElement).value.replace(/[^0-9]/g, ''), 10)
  if (isNaN(v) || v < 0) v = 0
  if (v > maxAmount.value) v = maxAmount.value
  amount.value = v
}
function setMax() { amount.value = maxAmount.value }

const canConfirm = computed(() => amount.value > 0 && amount.value <= maxAmount.value)

function confirm() {
  if (!canConfirm.value) return
  if (mode.value === 'deposit') depositToVault(amount.value)
  else withdrawFromVault(amount.value)
  amount.value = 0
}
</script>

<template>
  <div class="lobby-page px-4 py-5">
    <!-- 未登入 -->
    <template v-if="!isLoggedIn">
      <div class="card-purple p-8 text-center max-w-sm mx-auto mt-8">
        <div class="text-5xl mb-4" aria-hidden="true">🔐</div>
        <h1 class="text-xl font-black mb-2">保險箱</h1>
        <p class="text-sm mb-5" style="color:var(--color-text-muted);">登入後即可使用保險箱存放金幣</p>
        <button class="btn-gold w-full justify-center" @click="openLogin">立即登入 / 註冊</button>
      </div>
    </template>

    <!-- 已登入 -->
    <template v-else>
      <h1 class="section-title mb-4">保險箱</h1>
      <div class="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start flex flex-col gap-4">
        <!-- 左欄：餘額 -->
        <div class="card-purple p-5">
          <div class="rounded-xl p-4 mb-1" style="background:rgba(0,0,0,0.25);">
            <div class="text-sm mb-1" style="color:var(--color-text-muted);">錢包金幣 (可用)</div>
            <div class="text-3xl font-black" style="color:var(--color-gold);">{{ userInfo.balance.toLocaleString() }}</div>
          </div>
          <div class="text-center text-2xl my-1" style="color:var(--color-text-muted);">↓</div>
          <div class="rounded-xl p-4" style="background:rgba(0,0,0,0.25);">
            <div class="text-sm mb-1" style="color:var(--color-text-muted);">保險箱金幣 (凍結)</div>
            <div class="text-3xl font-black" style="color:var(--color-text);">{{ userInfo.vaultBalance.toLocaleString() }}</div>
          </div>
          <ul class="mt-4 text-xs space-y-1" style="color:var(--color-text-muted);">
            <li>・存入保險箱的金幣可用於贈禮。</li>
            <li>・存入可避免誤觸遊玩時消耗。</li>
          </ul>
        </div>

        <!-- 右欄：操作 -->
        <div class="card-purple p-5">
          <!-- 模式切換 -->
          <div class="tab-bar mb-4" role="tablist" aria-label="保險箱操作">
            <button class="tab-btn" :class="{ active: mode === 'deposit' }" role="tab" :aria-selected="mode === 'deposit'" @click="mode = 'deposit'">存入</button>
            <button class="tab-btn" :class="{ active: mode === 'withdraw' }" role="tab" :aria-selected="mode === 'withdraw'" @click="mode = 'withdraw'">取出</button>
          </div>

          <h2 class="text-lg font-black text-center mb-1">{{ mode === 'deposit' ? '存入保險箱' : '取出至錢包' }}</h2>
          <p class="text-sm text-center mb-4" style="color:var(--color-text-muted);">
            {{ mode === 'deposit' ? '請輸入欲從錢包轉入保險箱的金額' : '請輸入欲從保險箱轉回錢包的金額' }}
          </p>

          <div class="flex items-center gap-2 rounded-xl px-4 py-3 mb-4" style="background:rgba(0,0,0,0.3); border:1px solid var(--color-border);">
            <input
              :value="amount"
              type="text"
              inputmode="numeric"
              class="flex-1 bg-transparent outline-none text-2xl font-black text-center"
              style="color:var(--color-text);"
              aria-label="金額"
              @input="onAmountInput"
            />
            <button class="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0" style="background:rgba(168,85,247,0.2); color:var(--color-text-muted); border:1px solid var(--color-border);" @click="setMax">MAX</button>
          </div>

          <button
            class="btn-gold w-full justify-center text-lg py-3"
            style="border-radius:14px;"
            :disabled="!canConfirm"
            :style="!canConfirm ? 'opacity:0.5;cursor:not-allowed;' : ''"
            @click="confirm"
          >
            🛡️ {{ mode === 'deposit' ? '確認存入' : '確認取出' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
```

- [ ] **Step 2: 建立 `pages/lobby/vault.vue`**

```vue
<script setup lang="ts">
definePageMeta({ layout: 'lobby' })
</script>

<template>
  <LobbyVaultContent />
</template>
```

- [ ] **Step 3: 側欄新增「保險箱」項目**

`components/LobbySidebar.vue` 的 `section3`，在「銀行」之後插入一行：

```ts
const section3 = [
  { to: '/lobby/member',   label: '個人資訊', icon: '👤' },
  { to: '/lobby/bank',     label: '銀行',     icon: '🏦' },
  { to: '/lobby/vault',    label: '保險箱',   icon: '🔐' },
  { to: '/lobby/inbox',    label: '信箱',     icon: '📬' },
  { to: '/lobby/chat',     label: '聊天',     icon: '💬' },
  { to: '/lobby/settings', label: '設置',     icon: '⚙️' },
]
```

- [ ] **Step 4: 驗證編譯**

Run: dev server log 無紅字。
Expected: 無錯誤；`<LobbyVaultContent>` 自動匯入解析成功（lobby 子元件帶 `Lobby` 前綴）。

- [ ] **Step 5: 瀏覽器驗證保險箱**

1. 側欄出現「🔐 保險箱」，點擊進 `/lobby/vault`。
2. 未登入 → 顯示登入引導。
3. 登入後：錢包顯示餘額、保險箱 0。
4. 模式「存入」輸入 100 → 確認 → 錢包 -100、保險箱 +100。
5. 切「取出」→ MAX 帶入保險箱餘額 → 確認 → 反向。
6. 輸入超過上限 → 自動夾到上限。
7. 重整頁面 → 餘額保留（localStorage）。
Expected: 以上皆正常，無 console 錯誤。

- [ ] **Step 6: Commit**

```bash
git add components/lobby/VaultContent.vue pages/lobby/vault.vue components/LobbySidebar.vue
git commit -m "feat(vault): 保險箱頁面（存入/取出）與側欄項目"
```

---

## Task 4: 銀行新增「活動」Tab

**Files:**
- Modify: `components/shared/DepositContent.vue`

- [ ] **Step 1: 型別與付款方式加入 activity，並 import 資料**

`<script setup>` 最上方改為：

```ts
import { siteContent } from '~/data/siteContent'

type PayMethod = 'card' | 'atm' | 'store' | 'point' | 'activity'
type PointBrand = 'mycard' | 'gash' | 'funpay' | 'iwin'

const { app: { baseURL } } = useRuntimeConfig()
const base = baseURL.replace(/\/$/, '')
const depositEvents = siteContent.events.filter(e => e.deposit)
```

並把 `payMethods` 陣列末端加入活動：

```ts
const payMethods = [
  { key: 'card'  as PayMethod, label: '信用卡', icon: '💳' },
  { key: 'atm'   as PayMethod, label: 'ATM',    icon: '🏧' },
  { key: 'store' as PayMethod, label: '超商',   icon: '🏪' },
  { key: 'point' as PayMethod, label: '點數卡', icon: '🎴' },
  { key: 'activity' as PayMethod, label: '活動', icon: '🎉' },
]
```

- [ ] **Step 2: 非活動 Tab 才顯示儲值方案與確認**

把「方案選擇」整段 `<section ...>選擇儲值方案...</section>` 的開頭 `<section` 加上條件：將
```html
      <section class="px-4 mb-5 lg:px-0" aria-labelledby="plan-heading">
```
改為
```html
      <section v-if="payMethod !== 'activity'" class="px-4 mb-5 lg:px-0" aria-labelledby="plan-heading">
```

並把「確認按鈕」外層 `<div class="px-4 lg:px-0">...</div>`（含 btn-gold 確認儲值與 SSL 說明）整塊外層加上 `v-if="payMethod !== 'activity'"`：將
```html
      <!-- 確認按鈕 -->
      <div class="px-4 lg:px-0">
```
改為
```html
      <!-- 確認按鈕 -->
      <div v-if="payMethod !== 'activity'" class="px-4 lg:px-0">
```

- [ ] **Step 3: 新增活動卡片區塊**

在「確認按鈕」那個 `<div>` 區塊之後、左欄外層 `</div>`（`<!-- 右欄（桌面版） -->` 之前）插入：

```html
      <!-- 活動 Tab -->
      <Transition name="tab-fade">
        <section v-if="payMethod === 'activity'" class="px-4 mb-5 lg:px-0">
          <h2 class="text-sm font-bold mb-3" style="color:var(--color-text-muted);">儲值相關活動</h2>
          <div v-if="depositEvents.length === 0" class="card-purple p-6 text-center text-sm" style="color:var(--color-text-muted);">
            目前沒有儲值活動
          </div>
          <div v-else class="grid gap-4 lg:grid-cols-2">
            <NuxtLink
              v-for="event in depositEvents"
              :key="event.id"
              to="/lobby/events"
              class="card-purple overflow-hidden cursor-pointer block"
              :aria-label="`活動：${event.title}`"
            >
              <img v-if="event.imageSrc" :src="base + event.imageSrc" :alt="event.title" class="event-img-crop" />
              <div v-else class="flex items-center justify-between px-4 py-5" :style="{ background: event.gradient }">
                <div>
                  <div class="text-lg font-black text-white">{{ event.title }}</div>
                  <div class="text-xs mt-1" style="color:rgba(255,255,255,0.7);">{{ event.subtitle }}</div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold" style="color:var(--color-gold);">{{ event.prize }}</div>
                </div>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <span class="text-xs" style="color:#fff;">截止：{{ event.endDate }}</span>
                <span class="text-xs font-semibold" style="color:#fff;">查看詳情 →</span>
              </div>
            </NuxtLink>
          </div>
        </section>
      </Transition>
```

- [ ] **Step 4: 驗證編譯**

Run: dev server log 無紅字。
Expected: 無錯誤（`event-img-crop` 為既有全域樣式）。

- [ ] **Step 5: 瀏覽器驗證活動 Tab**

開 `lobby/bank`：
1. 付款方式 Tab 末端出現「🎉 活動」。
2. 切到活動：隱藏「選擇儲值方案」「確認儲值」區塊，顯示 3 張儲值活動卡（新手首儲禮 / 每週儲值回饋 / VIP 儲值加碼）。
3. 點卡片導向 `lobby/events`。
4. 切回「信用卡」等 Tab：方案、表單、確認鈕恢復正常顯示。
Expected: 以上皆正常，無 console 錯誤。

- [ ] **Step 6: Commit**

```bash
git add components/shared/DepositContent.vue
git commit -m "feat(bank): 儲值頁新增活動 Tab 顯示儲值相關活動"
```

---

## Task 5: 完整迴歸 + 部署

**Files:** 無

- [ ] **Step 1: 完整 SSG 建置（先停 dev server 再跑，避免並跑衝突）**

```bash
# 停掉 preview/dev server 後執行
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate
```
Expected: `Prerendered N routes` + `Generated public docs`，無 error。

- [ ] **Step 2: 重啟 dev + 瀏覽器完整迴歸**

- 保險箱：存入/取出連動、MAX、超額夾限、重整保留、未登入導引。
- 銀行：活動 Tab 顯示活動卡、其餘 Tab 正常。
- 側欄「保險箱」高亮（active）正常；其他大廳頁（member/daily/chat）無回歸。
- 無 console 錯誤、無 hydration mismatch（乾淨 dev 載入後檢查）。

- [ ] **Step 3: Push 部署**

```bash
git push origin main
```
Expected: GitHub Actions 自動部署，線上 `/lobby/vault` 與 `/lobby/bank` 驗證。

---

## Self-Review 註記

- **Spec 覆蓋**：保險箱側欄→T3；保險箱頁存入/取出→T3（UI）+T2（邏輯）；vaultBalance 資料/相容→T1+T2；未登入導引→T3；銀行活動 Tab→T4；沿用 events+deposit 旗標→T1+T4；其餘付款維持→T4 條件渲染保留。
- **型別/命名一致**：`vaultBalance`、`depositToVault`/`withdrawFromVault`、`PayMethod` 含 `'activity'`、`depositEvents`、`mode('deposit'|'withdraw')` 全程一致。
- **避地雷**：無 Teleport；狀態用 `useState`(userInfo)；spec/plan 放 `specs/`。
- **執行相依**：T3 依賴 T2 的 `depositToVault`/`withdrawFromVault` 與 T1 的 `vaultBalance`；T4 依賴 T1 的 `deposit` 旗標。依序執行。
