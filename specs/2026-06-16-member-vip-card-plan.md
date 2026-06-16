# 個人資訊 VIP 等級卡更新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將個人資訊頁 VIP 區塊改為金色「VIP 進度卡」（目前等級 + 累積儲值/投注兩條進度條），移除 VIP1~6 清單與頂部重複的小進度條。

**Architecture:** 等級讀 `userInfo.vip`（動態），進度數字讀 `siteContent.member.vipUpgrade`（假資料）。純樣式與條件渲染於 `pages/lobby/member.vue`，不用 `<Teleport>`。

**Tech Stack:** Nuxt 3 SSG、Vue 3 `<script setup>`、Tailwind + CSS 變數。

> **驗證**：dev server 編譯無誤 + 瀏覽器實測（先 curl 試出回 200 的 host：`localhost`/`127.0.0.1`/`[::1]` 其一會回 426）。

---

## File Structure

| 檔案 | 動作 | 職責 |
|------|------|------|
| `data/siteContent.ts` | 修改 | `member` 新增 `vipUpgrade` 假資料 |
| `pages/lobby/member.vue` | 修改 | 移除小進度條與 VIP1~6 清單，新增金色 VIP 進度卡 |

---

## Task 1: 新增 vipUpgrade 假資料

**Files:**
- Modify: `data/siteContent.ts`

- [ ] **Step 1: 在 `member` 區塊新增 `vipUpgrade`**

找到 `member: {` 內的 `defaultUser: { ... },`，在其後新增：

```ts
    vipUpgrade: {
      deposit: { current: 128000, target: 150000 },
      wager:   { current: 3560000, target: 4200000 },
    },
```

- [ ] **Step 2: 驗證編譯**

Run: dev server log 無紅字；或 `PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate` 無 error。
Expected: 無 TS / build 錯誤。

- [ ] **Step 3: Commit**

```bash
git add data/siteContent.ts
git commit -m "feat(member): 新增 VIP 升級進度假資料 vipUpgrade"
```

---

## Task 2: member.vue VIP 卡改版

**Files:**
- Modify: `pages/lobby/member.vue`

- [ ] **Step 1: 改寫 `<script setup>`**

把現行 `<script setup>` 內容（第 1–23 行）整段替換為：

```ts
<script setup lang="ts">
definePageMeta({ layout: 'lobby' })
import { siteContent } from '~/data/siteContent'

const { isLoggedIn, userInfo, openLogin, logout } = useAppState()
const router = useRouter()

const historyItems = siteContent.member.historyItems
const vipUpgrade = siteContent.member.vipUpgrade

const MAX_VIP = 7
const isMaxVip = computed(() => userInfo.value.vip >= MAX_VIP)
const depositPct = computed(() => Math.min(100, Math.round(vipUpgrade.deposit.current / vipUpgrade.deposit.target * 100)))
const wagerPct   = computed(() => Math.min(100, Math.round(vipUpgrade.wager.current / vipUpgrade.wager.target * 100)))

function handleLogout() {
  logout()
  router.push('/lobby')
}
</script>
```

> 說明：移除了 `vipLevels`、`vipProgress`、`vipTargets` 的引用。

- [ ] **Step 2: 移除頂部玩家卡的小進度條**

刪除玩家資訊卡內的「VIP 進度條」區塊（現行第 56–64 行）：

```html
          <!-- VIP 進度條 -->
          <div class="mt-2">
            <div class="flex justify-between text-xs mb-1" style="color:var(--color-text-muted);">
              <span>升級進度</span><span>{{ vipProgress }}%</span>
            </div>
            <div class="h-1.5 rounded-full overflow-hidden" style="background:rgba(168,85,247,0.15);">
              <div class="h-full rounded-full" :style="`width:${vipProgress}%; background:linear-gradient(90deg,var(--color-purple-mid),var(--color-gold))`" />
            </div>
          </div>
```

刪除後，玩家資訊卡保留頭像、暱稱、VIP 徽章、餘額（即原第 45–55 行的內容 + 其外層 `</div>`）。

- [ ] **Step 3: 用新 VIP 進度卡取代「VIP 等級一覽」區塊**

將現行「VIP 等級一覽」整塊（現行第 96–112 行，從 `<!-- VIP 等級一覽 -->` 到對應 `</div>`）替換為：

```html
      <!-- VIP 進度卡 -->
      <div class="rounded-2xl p-5 mb-4 relative overflow-hidden" style="background:linear-gradient(135deg,var(--color-gold),var(--color-gold-dark));">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs font-bold tracking-widest" style="color:rgba(0,0,0,0.55);">CURRENT LEVEL</div>
            <div class="text-4xl font-black italic" style="color:#3a2400;">VIP {{ userInfo.vip }}</div>
          </div>
          <div v-if="!isMaxVip" class="text-sm font-bold px-3 py-1.5 rounded-lg" style="background:rgba(0,0,0,0.12); color:#3a2400;">
            目標 VIP {{ userInfo.vip + 1 }}
          </div>
        </div>

        <template v-if="!isMaxVip">
          <!-- 累積儲值 -->
          <div class="mt-5">
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-2 font-bold" style="color:#3a2400;"><span aria-hidden="true">👛</span>累積儲值</span>
              <span class="font-bold" style="color:#3a2400;">{{ vipUpgrade.deposit.current.toLocaleString() }} / {{ vipUpgrade.deposit.target.toLocaleString() }}</span>
            </div>
            <div class="h-2.5 rounded-full overflow-hidden" style="background:rgba(0,0,0,0.18);">
              <div class="h-full rounded-full" :style="`width:${depositPct}%; background:#fff;`" />
            </div>
          </div>

          <!-- 累積投注 -->
          <div class="mt-4">
            <div class="flex items-center justify-between mb-1.5">
              <span class="flex items-center gap-2 font-bold" style="color:#3a2400;"><span aria-hidden="true">📈</span>累積投注</span>
              <span class="font-bold" style="color:#3a2400;">{{ vipUpgrade.wager.current.toLocaleString() }} / {{ vipUpgrade.wager.target.toLocaleString() }}</span>
            </div>
            <div class="h-2.5 rounded-full overflow-hidden" style="background:rgba(0,0,0,0.18);">
              <div class="h-full rounded-full" :style="`width:${wagerPct}%; background:#fff;`" />
            </div>
          </div>

          <p class="text-xs mt-4" style="color:rgba(0,0,0,0.6);">需同時達成累積儲值與累積投注條件，即可升級至 VIP {{ userInfo.vip + 1 }}。</p>
        </template>
        <template v-else>
          <p class="text-sm font-bold mt-5" style="color:#3a2400;">已達最高等級</p>
        </template>
      </div>
```

- [ ] **Step 4: 驗證編譯**

Run: dev server log 無紅字。
Expected: 無錯誤；無未使用變數殘留（`vipLevels`/`vipProgress`/`vipTargets` 已全部移除）。

- [ ] **Step 5: 瀏覽器驗證**

登入後開 `/lobby/member`：
1. 金色 VIP 進度卡：左上 `CURRENT LEVEL` + `VIP {目前}`，右上「目標 VIP {目前+1}」。
2. 兩條進度條：累積儲值 128,000 / 150,000（約 85%）、累積投注 3,560,000 / 4,200,000（約 85%），白色填充寬度正確。
3. 底部說明文字正確（含目標等級）。
4. 原 VIP1~6 橫向清單已消失；頂部玩家卡不再有「升級進度」小條（頭像/暱稱/徽章/餘額仍在）。
5. 無 console 錯誤。

- [ ] **Step 6: Commit**

```bash
git add pages/lobby/member.vue
git commit -m "feat(member): VIP 等級改為金色進度卡（累積儲值/投注），移除等級清單與重複進度條"
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

- [ ] **Step 2: 重啟 dev + 瀏覽器最終確認**

- VIP 卡顯示正確、原清單移除、頂部小條移除。
- 未登入進 member 顯示登入引導（不受影響）。
- 無 console 錯誤、無 hydration mismatch。

- [ ] **Step 3: Push 部署**

```bash
git push origin main
```
Expected: GitHub Actions 自動部署；線上 `/lobby/member` 驗證。

---

## Self-Review 註記

- **Spec 覆蓋**：金色 VIP 卡→T2 Step3；vipUpgrade 資料→T1；等級動態/目標+1→T2；移除 VIP1~6 清單→T2 Step3；移除頂部小條→T2 Step2；最高等級邊界→T2（`isMaxVip`/`MAX_VIP=7`）。
- **型別/命名一致**：`vipUpgrade.deposit/wager.{current,target}`、`depositPct`/`wagerPct`、`isMaxVip`/`MAX_VIP` 全程一致。
- **避地雷**：無 Teleport；等級走 `userInfo`(useState)、數字走 siteContent；spec/plan 放 `specs/`。
