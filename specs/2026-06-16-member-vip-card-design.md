# 個人資訊 — VIP 等級卡更新 設計文件

- **日期**：2026-06-16
- **範圍**：`pages/lobby/member.vue` 的 VIP 等級區塊改版
- **狀態**：設計已確認，待實作
- **備註**：個人資訊頁另有「遊戲紀錄」改版，將另開 spec 討論。本文件僅涵蓋 VIP 等級。

---

## 1. 目標

將個人資訊頁的 VIP 等級呈現改為單一「VIP 進度卡」（照附圖金色漸層卡），顯示目前等級與「累積儲值」「累積投注」兩條升級進度條；移除原本的 VIP1~VIP6 橫向清單與頂部玩家卡中重複的小進度條。

---

## 2. 新 VIP 進度卡（取代原「VIP 等級一覽」）

金色漸層卡、深色文字，內容：
- **左上**：`CURRENT LEVEL` 小標（大寫、字距加寬）+ 大字 `VIP {目前等級}`
- **右上**：膠囊標籤「目標 VIP {目前等級 + 1}」
- **兩條進度列**，每列：
  - 左：圖示 + 標籤（累積儲值 / 累積投注）
  - 右：`{現值} / {目標值}`（皆 `toLocaleString()`）
  - 下方：進度條（半透明深色軌道 + 白色填充）
- **底部說明**：「需同時達成累積儲值與累積投注條件，即可升級至 VIP {目前等級 + 1}。」

樣式以 inline style / Tailwind 達成金色漸層（如 `linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))`），文字採深色（如 `#3a2400` / `rgba(0,0,0,0.7)`），與既有金色徽章色系一致。

---

## 3. 資料模型

`data/siteContent.ts` 的 `member` 區塊新增假資料：

```ts
vipUpgrade: {
  deposit: { current: 128000, target: 150000 },
  wager:   { current: 3560000, target: 4200000 },
},
```

- 目前等級 = `userInfo.vip`
- 目標等級 = `userInfo.vip + 1`
- 進度百分比（各條）= `Math.min(100, Math.round(current / target * 100))`

---

## 4. 移除項目

1. 原「VIP 等級一覽」VIP1~6 橫向清單區塊（template 約現行 96–112 行），以及其使用的 `const vipLevels = siteContent.member.vipLevels`。
2. 頂部玩家資訊卡中的「升級進度」小進度條（template 約現行 56–64 行），以及 `vipProgress` computed 與其依賴的 `vipTargets`（在 member.vue 內不再使用）。
   - 保留頂部卡的頭像、暱稱、VIP 徽章、餘額。

> `siteContent.member.vipLevels` / `vipTargets` 本身保留於資料檔（其他地方若有用到不受影響）；僅移除 member.vue 內的引用與 UI。

---

## 5. 邊界情況

- **已達最高等級**：若 `userInfo.vip` 已無下一級（以 `vipUpgrade` 為假資料的情境，預設不會發生；但為保險）→ 顯示「已達最高等級」，不顯示「目標」標籤與進度條。判定方式：設一常數 `MAX_VIP`（取 `siteContent.member.vipLevels.length`，目前為 6 → 但圖含 VIP7，故 `MAX_VIP` 設為 7），`userInfo.vip >= MAX_VIP` 時視為最高。
- 進度值超過目標：百分比夾在 100%。
- 未登入：維持現有「立即登入 / 註冊」導引（VIP 卡僅在已登入區塊內）。

---

## 6. 避開已知地雷
- 純樣式與條件渲染，不使用 `<Teleport>`。
- 等級走既有 `userInfo`（`useState`）；數字走 `siteContent`。
- spec 放 `specs/`，不放 `docs/`。

---

## 7. 驗證方式（本機 dev + 瀏覽器）
1. 登入後進 `/lobby/member`：顯示金色 VIP 進度卡，等級 = 目前 VIP、目標 = +1。
2. 兩條進度條（累積儲值 128,000/150,000、累積投注 3,560,000/4,200,000）寬度正確、數字格式化。
3. 原 VIP1~6 清單已移除；頂部玩家卡不再有小進度條（頭像/暱稱/徽章/餘額仍在）。
4. 無 console 錯誤、無 hydration mismatch、SSG 建置通過。

> 本機驗證註記：dev 的 `localhost`/`127.0.0.1`/`[::1]` 其一會回 426，先 curl 試出回 200 的 host。
