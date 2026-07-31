# 巨亨ONLINE 規格書 — 主幹

- 建立日期：2026-07-30
- 受眾：美術、前端、後端 —— 用來搭配各自的原型做規格確認與比對
- 本書地位：**主幹＋畫面索引總表**。三方比對的詳細內容仍以 `specs/2026-07-29-*.md` 四份文件為準，本書負責把「畫面長什麼樣」跟「文字比對結果」接起來，讓三種受眾能從同一個編號找到同一件事。

---

## 1. 系統範圍與三方關係

巨亨ONLINE 由三個獨立 repo 組成，本規格書比對的對象：

| 代號 | 專案 | 技術 | 備註 |
|---|---|---|---|
| **W** 官網（本專案） | `巨亨ONLINE-Nuxt` | Nuxt 3 SSG | 本書截圖來源 |
| **A** APP 原型 | `Casino-Lobby-Prototype` @ `phase-1-mvp` 分支 | React 18，1280×720 固定畫布 | 「活文件規格」，不是 main 分支 |
| **B** 營運後台 | `Game_operations` | Vue 3 + Naive UI wireframe | `BACKEND_TECH_SPEC.md` 為 B2B 聚合平台描述，與 `src/` 的 B2C 實作幾乎不重疊，別當後端契約 |
| **E** 後端已開發清單 | `API_list.md` | — | 2026-07-27 版本 |

詳細比對方法與限制見 [`specs/2026-07-29-three-way-screen-matrix.md` §13](../2026-07-29-three-way-screen-matrix.md#13-驗證方式與限制)。

---

## 2. 名詞與主鍵

### 2.1 畫面編號主鍵

沿用 APP 的系統化編號，因為三方中只有 APP 有（`docs/art-design-checklist.md`）：

| 前綴 | 意義 |
|---|---|
| `P-` | 頁面 Page |
| `F-` | 功能介面 Feature |
| `M-` | 彈窗 Modal |
| `L-` | 佈局 Layout |
| `C-` | 通用元件 Component |
| `W-` | **官網獨有畫面**，本專案另編（APP／後台沒有對應編號時使用） |

**用法**：討論任何畫面時，一律先講編號（例：「`F-04d` 的贈禮流程」），再講細節。開會、Slack、issue 都可以直接貼 `spec.html#F-04d` 這種錨點連結到該節。

### 2.2 判定標記（沿用三方矩陣）

| 標記 | 意義 |
|---|---|
| ✅ | 三方一致，不用動 |
| ⚠️ | 有差異，需確認 |
| 🔴 | 明確衝突，**第一階段必須拍板** |
| 🟣 | 第二階段（後台已有、前台都還沒做） |
| — | 尚無評級／該側無此功能屬合理設計 |

### 2.3 核心名詞（避免各方各講各的）

| 名詞 | 定義 | 來源 |
|---|---|---|
| 三幣 | 金幣 `balance`、銀幣 `silverBalance`、銅幣 `bronzeBalance` | `composables/useFinancialState.ts` |
| 保險箱 | `vaultBalance`，第一階段已併入銀行，`pages/lobby/vault.vue` 只 redirect | 見 memory `chat-feature-architecture` |
| 贈禮 | 玩家間轉帳，官網走雙向確認（申請→接受/拒絕/取消/168h 逾期），5% 手續費 | `utils/vaultTransfer.ts`、`utils/giftRequest.ts` |
| 兌換 | 金↔銀，1:100，銀換金需 100 倍數，手續費 0 | `utils/walletExchange.ts` |
| 獎勵卡 | 15 天銀 10,000／20 天金 5,000，流水目標 100,000，轉換上限 10,000，到期 2026/12/31 | `utils/rewardCardConversion.ts`、`composables/useRewardCardState.ts` |

> 這幾個常數三方一致，**不用再確認**，直接抄。其餘 enum（交易類型、頭像、遊戲分類）三方不同，見 §4 落差清單。

---

## 3. 三分冊導覽

| 分冊 | 檔案 | 受眾 | 內容 |
|---|---|---|---|
| 前端 | [`20-frontend.md`](20-frontend.md) ✅ | 前端 | 路由、元件樹、composable 狀態、互動狀態機、對應測試、串接優先序建議 |
| 後端 | [`30-backend.md`](30-backend.md) ✅ | 後端 | 畫面→API 模組對照、拍板後的範圍變化、交付優先序（本體仍是 [`api-master-list.md`](../2026-07-29-api-master-list.md)） |
| 美術 | [`10-art.md`](10-art.md) ✅ | 美術 | 指向現有截圖 ＋ 素材待補清單（依 Cooper 指示，不做精修標注／命名規則／按鈕色票規格，美術出圖走 Figma） |

> 三分冊皆已交付。下一步視需求可考慮：三冊合併成單頁 HTML 交付版、或依進度持續更新各冊內容。

---

## 4. 第一階段 8 個三方落差（摘要）

完整比對見 [`three-way-screen-matrix.md` §0](../2026-07-29-three-way-screen-matrix.md#0-摘要8-個第一階段的三方落差)。以下附加對應的畫面編號，方便直接對照截圖：

| # | 項目 | 落差 | 嚴重度 | 對應畫面 |
|---|---|---|---|---|
| 1 | 贈禮流程 | 官網雙向確認 vs APP 直接轉帳 | 🔴 | [`F-04d`](_index-table.md#F-04d)、[`F-04e`](_index-table.md#F-04e) |
| 2 | 儲值幣別與通道 | APP USD+IAP vs 官網 NT$+ATM/超商/信用卡 | 🔴 | [`F-04`](_index-table.md#F-04) |
| 3 | 遊戲分類與數量 | APP 3類22款 vs 官網 5類30款 | 🔴 | [`L-04`](_index-table.md#L-04) |
| 4 | VIP 結構化程度 | 官網只有文案字串 | 🔴 | [`M-01c`](_index-table.md#M-01c) |
| 5 | 客服工單 | APP 左欄空殼，官網最完整 | ⚠️ | [`F-01c`](_index-table.md#F-01c)、[`W-09`](_index-table.md#W-09) |
| 6 | 交易類型 enum | 三方各不相同（6／10／10 種） | ⚠️ | [`W-07`](_index-table.md#W-07) |
| 7 | 選座位 | 官網是 dead code | ⚠️ | [`W-05`](_index-table.md#W-05)（無截圖，見備註） |
| 8 | 頭像數量 | 官網 12 emoji，APP 20 圖片，三方全不同 | ⚠️ | [`W-10`](_index-table.md#W-10) |

> ✅ **這 4 項已於 2026-07-30 拍板**，決策內容與理由見 [`specs/decisions/2026-07-30-first-phase-alignment-decisions.md`](../decisions/2026-07-30-first-phase-alignment-decisions.md)：
> 1. 贈禮流程 → 統一為雙向確認（官網現況，APP 需補流程）
> 2. 儲值幣別通道 → 維持平台差異，不強制統一
> 3. 遊戲分類數量 → 本階段只統一資料結構，範圍留待營運/採購階段決定
> 4. VIP 結構化門檻 → 官網補齊結構化（比照 APP `VIP_LEVEL_RULES`）
>
> `20-frontend.md` 以此決策為準撰寫，不再重複列現況分岔。

---

## 5. 畫面索引總表

按 APP 的畫面編號排序，每列包含畫面名稱、官網路由、桌機／手機截圖、三方判定與備註。點編號可跳到對應章節錨點。

**產生方式**：本表由 `specs/spec-book/capture.mjs` 自動產生（來源 `screens.config.mjs`），**請勿手動編輯** `_index-table.md`；要修改內容請改 `screens.config.mjs` 後重跑腳本。

→ 完整索引總表：[`_index-table.md`](_index-table.md)（84 張截圖，10 個章節，逐畫面附桌機／手機截圖、三方判定與備註）

---

## 6. 截圖腳本使用說明

```bash
# 1. 另開終端啟動 dev server（不可與 npm run generate 並跑，見 CLAUDE.md 地雷 #4）
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run dev

# 2. 執行截圖（約 3-4 分鐘，84 張）
PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/capture.mjs

# 只重跑某幾個畫面（例如改版後只有財務相關變了）
PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/capture.mjs --only=F-04,F-04b,F-04c

# 只拍某個斷點
PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/capture.mjs --viewport=mobile
```

- 產出：`shots/<編號>-<desktop|mobile>.png` ＋ `shots/manifest.json`（結果與失敗原因）＋ `_index-table.md`（自動重寫）
- **局部重跑會自動合併**既有 manifest，不會蓋掉其他畫面的結果
- 新增畫面：在 `screens.config.mjs` 的 `screens` 陣列加一筆，重跑腳本即可
- 腳本內建重試一次，處理彈窗轉場動畫造成的偶發逾時；若仍失敗，訊息會列在 console 輸出與 manifest.json

### 已知跳過的畫面（`skip: true`）

| 編號 | 原因 |
|---|---|
| `P-04` 遊戲室 | 官網為 iframe `example.com` 佔位，無實質內容可拍 |
| `W-05` 選座位 | `SeatSelectionModal.vue` 是 dead code，無人引用，畫面拍出來也無法從 UI 觸發 |
| `W-08` 檢舉玩家 | 需先開玩家卡（`M-08`）才能觸發，待下一輪把彈窗鏈路補進 config |

---

## 7. 已知限制

- 截圖來源為本機 dev server 的 mock 資料（`data/siteContent.ts`），非真實後端回應；財務數字、交易紀錄等為固定假資料
- 三方原始碼行號引用以 `three-way-screen-matrix.md` 建立當下的 commit 為準（W: `aa326bd`／A: `3c3e396`／B: `06fdbbe`），本書之後若有新 commit，行號可能過期
- APP／後台兩份 clone 位於 scratchpad，session 結束即消失，如需重新核對原始碼需重新 clone
