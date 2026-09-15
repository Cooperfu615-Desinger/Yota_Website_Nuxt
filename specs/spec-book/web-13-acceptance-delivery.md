# WEB SPEC 13｜整體驗收、交付與玩家情境

> 文件狀態：Phase 3 初版，建立 Web 版完整交付基線；各層驗收尚未全部執行，未將文件完成誤判為產品完成。
> 工作單映射：`YOTAPLATFO-459`（SPEC）／`YOTAPLATFO-472`（Figma）／`YOTAPLATFO-485`（WEB／Nuxt）
> 交付基線：3 張父單＋39 張子單；本文件只補整體驗收與 handoff，不新增第 40 張工作單。

## 0. 文件狀態、目標與驗收語意

本分冊把 Web 規格書、Figma、Nuxt 原型、文件 HTML、瀏覽器操作、Nuxt SSG、Git、Plane 與正式服務拆成不同驗收層級。每個「通過」都必須說明它證明的是哪一層，不得用 Markdown 通過推論瀏覽器可操作，也不得用本機 Mock 通過推論正式帳務完成。

目前已完成：Web 規格總綱、10 份功能分冊、跨頁整合初版、Web HTML 閱讀分頁與既有 Plane 3＋39 工作單映射。待後續完成：工作單描述回填、Plane 頁面同步與實際各環境驗收。

## 1. 交付範圍與不在範圍

### 本次 Web 交付範圍

- 官網公開頁與登入後遊戲大廳的資訊架構、路由、layout、共用導覽與響應式行為。
- 登入／註冊／Age Gate／法律文件、會員、遊戲、財務、獎勵、任務、社交、客服、信箱與設定的功能規格。
- `WEB-FLOW` 跨頁流程、`WEB-SC` 玩家情境、`WEB-AC` 驗收條件與資料／API 邊界。
- Nuxt SSG、GitHub Pages baseURL、`.nojekyll`、`ClientOnly`／`Teleport` 與工作樹交付證據。

### 不在本文件直接承諾

正式支付、銀行／帳務 ledger、遊戲供應商 session、WebSocket、CMS 後台、客服後台、反作弊、風控、APP 專屬功能與後端 API 實作。這些只能以依賴、缺口或獨立契約引用。

## 2. 交付角色與責任

| 工作流 | 負責人 | 交付責任 | 需要提供的證據 |
|---|---|---|---|
| 規格／SPEC | Arthur | 需求、流程、資料、驗收、待確認與版本沿革 | Markdown、來源、決策、AC／SC 對照 |
| Figma／DESIGN | Nini | 桌機／手機畫面、狀態、流程、元件與 handoff | Figma page／frame／node、狀態截圖、設計檢查 |
| Web／Nuxt | David | route、page、component、composable、SSG、Mock／API 邊界 | commit、focused check、瀏覽器、generate、部署結果 |
| QA | 待指定 | 獨立驗收、回歸、缺陷分級與環境紀錄 | 測試案例、重現步驟、結果與阻塞清單 |

QA 目前沒有獨立 Plane 父單；在確認負責人與工作流前，先由各子單的驗收區段與本文件承接 QA 需求。

## 3. 玩家 User Story 基線

| ID | 玩家故事 | 主要分冊／流程 |
|---|---|---|
| `WEB-US-U-13-01` | 作為訪客，我想先瀏覽官網活動、排行榜與教學，再決定是否登入。 | `WEB-SPEC-02`、`WEB-SPEC-09` |
| `WEB-US-U-13-02` | 作為玩家，我想登入後回到原本想使用的功能，而不是失去導流脈絡。 | `WEB-SPEC-03`、`WEB-FLOW-01` |
| `WEB-US-U-13-03` | 作為玩家，我想從大廳選擇遊戲與模式，知道遊戲啟動或失敗的原因。 | `WEB-SPEC-04`、`WEB-SPEC-05`、`WEB-FLOW-02` |
| `WEB-US-U-13-04` | 作為玩家，我想安全查看錢包、儲值、兌換、贈禮與交易結果。 | `WEB-SPEC-07`、`WEB-SPEC-08`、`WEB-FLOW-03` |
| `WEB-US-U-13-05` | 作為玩家，我想完成任務、領取獎勵並在信箱或錢包找到結果。 | `WEB-SPEC-08`、`WEB-SPEC-09`、`WEB-SPEC-11`、`WEB-FLOW-04` |
| `WEB-US-U-13-06` | 作為玩家，我想與其他玩家互動，並能封鎖、檢舉或尋求客服協助。 | `WEB-SPEC-10`、`WEB-FLOW-05` |
| `WEB-US-U-13-07` | 作為玩家，我想在手機與桌機使用相同核心流程，並安全登出。 | `WEB-SPEC-04`、`WEB-SPEC-11`、`WEB-FLOW-06` |

## 4. 玩家情境與情境分支

| SC ID | 情境 | 成功分支 | 失敗／邊界分支 |
|---|---|---|---|
| `WEB-SC-13-01` | 公開頁進入受保護功能 | 登入後返回原目的地 | 關閉登入、登入失敗、session 過期 |
| `WEB-SC-13-02` | 大廳啟動遊戲 | Demo／Real 進入合法遊戲視圖 | 未登入、Age Gate、無效遊戲、啟動失敗 |
| `WEB-SC-13-03` | 財務與贈禮 | 預覽、確認、結果、交易紀錄 | 餘額不足、超額、重複、取消、逾期 |
| `WEB-SC-13-04` | 任務／獎勵／信箱 | 領取一次並可讀回 | 過期、已領、API 失敗、部分資料未載入 |
| `WEB-SC-13-05` | 聊天／檢舉／客服 | 案件或對話可追蹤 | 封鎖、案件上限、空訊息、案件結案 |
| `WEB-SC-13-06` | 深連結與響應式 | query／layout／狀態一致 | 非法 query、重新整理、手機 overlay |
| `WEB-SC-13-07` | 登出與再次登入 | 前端 session 清除並回官網 | 未確認登出、清理不完整、錯誤帳戶殘留 |

## 5. 整體驗收條件

| ID | 整體條件 | 證據層級 |
|---|---|---|
| `WEB-AC-13-01` | 13 個 Web 功能單元均有對應規格、設計與 Nuxt 工作單，且三組尾碼映射一致。 | 文件／Plane readback |
| `WEB-AC-13-02` | 公開頁與大廳的 route、layout、登入邊界、返回與 query 行為有可追溯流程。 | 文件／原型／瀏覽器 |
| `WEB-AC-13-03` | 玩家核心流程具備成功、空資料、載入、失敗、停用、權限不足與取消狀態。 | Figma／瀏覽器 |
| `WEB-AC-13-04` | 錢包、獎勵、贈禮、信箱附件與交易紀錄的 Mock 互動不產生無聲假成功；正式服務缺口明確標記。 | 原型／API gap |
| `WEB-AC-13-05` | 桌機與手機版的主要流程可操作，且沒有已知的 SSG hydration 破壞互動。 | 瀏覽器／SSG |
| `WEB-AC-13-06` | Nuxt 靜態輸出可產生、`docs/.nojekyll` 存在、baseURL 正確，部署證據與本機 generate 分開記錄。 | SSG／部署 |
| `WEB-AC-13-07` | 工作單、規格、Figma、Nuxt、截圖、API 缺口與版本 commit 可以互相追溯。 | Handoff／Git／Plane |

## 6. 文件與規格驗收

文件層需要檢查：

- `00-overview.md`、`WEB_SPEC_RULES.md`、`web-02`～`web-13` 的相對連結、標題、錨點、表格與工作單映射。
- `web-02`～`web-11` 各保留 17 個編號節點，並涵蓋玩家、開發、QA、資料、驗收、待確認與交付責任。
- `WEB-FLOW`、`WEB-SC`、`WEB-AC` 不與 APP 的同名 ID 混用；Plane 實際單號與規格 ID 分開。
- 所有 `目前 Web 原型`、`已確認規則`、`待確認` 與 `驗證證據` 不得混寫。
- 來源引用若指向舊 handoff、舊截圖或舊 API 快照，需標示日期與可能過期的範圍。

目前只證明文件結構與內容初版完成；HTML 產生與連結視覺檢查仍是後續交付步驟。

## 7. Figma 整體驗收

Figma 交付需確認：

1. 官網公開頁與 lobby layout 的桌機／手機 frame 均可定位。
2. 13 個功能單元至少有入口、主要成功流程與關鍵錯誤／空狀態；跨頁 flow 有起點、目的地與返回。
3. 會員、財務、獎勵、贈禮、客服、信箱等資產／敏感功能明確標示登入、資格與不可操作狀態。
4. 所有元件與 token 能交給 Nuxt 實作，並記錄 page、frame、component、node ID；目前尚未填正式 Figma node。
5. Figma 顯示的幣別、獎勵卡、贈禮費率與活動值須先通過規則確認，不以舊 APP 數值自行定案。

## 8. Nuxt focused check 與程式驗收

目前 `package.json` 沒有獨立 `test` 或 `typecheck` script，因此不能把不存在的命令回報為通過。可依實際變更範圍執行並記錄：

```bash
# 文件／工作樹格式
git diff --check

# Nuxt 編譯與 SSG（依 AGENTS.md 使用完整 npm PATH）
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run build
PATH="/opt/homebrew/opt/node/bin:$PATH" npm run generate

# 文件 HTML 產生（後續階段執行）
PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/build-html.mjs
```

若測試或 generate 失敗，需記錄完整命令、退出碼、環境、錯誤與是否為既有問題；不能用「有執行」取代「已通過」。`docs/` 是 generated output，不應手動 commit。

## 9. 瀏覽器與響應式驗收

| 視角 | 最少覆蓋 |
|---|---|
| 桌機 | 公開首頁、登入／註冊、lobby、遊戲啟動、銀行／贈禮、會員、聊天／客服、信箱／設定 |
| 手機 | 公開首頁、底部導覽、Age Gate、登入、遊戲啟動、會員 tab、財務表單、聊天頻道、信箱詳情 overlay |
| 深連結 | `/lobby?game=&mode=`、`member?tab=`、`vault?tab=transfer&receiverId=`、`chat?channel=` |
| 回歸 | Modal 開關、Teleport、hydration、localStorage 初始化、登出後狀態清理 |

瀏覽器證據需包含 viewport、路由、操作步驟、預期／實際結果、console error、截圖與是否使用 Mock。既有 `capture.mjs` 的 84 張畫面是畫面索引證據，不自動等同完整跨頁流程驗收。

## 10. SSG、部署與正式服務分層

| 層級 | 通過代表 | 不代表 |
|---|---|---|
| Markdown | 文件結構與內容可讀 | UI 或服務可操作 |
| HTML | 文件可被產生與閱讀 | Nuxt route、API 或 Figma 完成 |
| Nuxt build／generate | 靜態 bundle／HTML 可產生 | GitHub Pages CDN 已更新、帳務完成 |
| 本機瀏覽器 | 指定環境的 Mock 互動可操作 | 正式資料、支付、WebSocket 或跨裝置 |
| GitHub Pages | 指定 commit 的部署可讀 | 未覆蓋瀏覽器、API、支付與帳務情境 |
| 正式服務 | 指定 API／環境的實際結果 | 未測試環境、回歸範圍與其他平台 |

GitHub Actions 由 push to `main` 觸發 generate 與 Pages 部署；部署 URL 為 `https://cooperfu615-desinger.github.io/Yota_Website_Nuxt/`。本機 generate 成功與 Actions／Pages 完成必須分開回報。

## 11. 3 父單＋39 子單完整映射

### 父單

| 工作流 | Plane 父單 | 負責人 | 子單範圍 |
|---|---|---|---|
| 規格 | `YOTAPLATFO-444` | Arthur | `YOTAPLATFO-447`～`YOTAPLATFO-459` |
| Figma | `YOTAPLATFO-445` | Nini | `YOTAPLATFO-460`～`YOTAPLATFO-472` |
| Nuxt | `YOTAPLATFO-446` | David | `YOTAPLATFO-473`～`YOTAPLATFO-485` |

### 子單三方映射

| WEB 功能 | SPEC | DESIGN | FE／Nuxt | 規格來源 |
|---|---|---|---|---|
| 01 核心架構、SSG 與共用導覽 | `447` | `460` | `473` | `00-overview.md`、`20-frontend.md` |
| 02 官網首頁、內容與公開頁 | `448` | `461` | `474` | `web-02-public-site.md` |
| 03 登入、註冊與年齡驗證 | `449` | `462` | `475` | `web-03-authentication.md` |
| 04 遊戲大廳與導覽 | `450` | `463` | `476` | `web-04-lobby-navigation.md` |
| 05 遊戲進入、模式與返回 | `451` | `464` | `477` | `web-05-game-session.md` |
| 06 個人資訊、VIP 與會員功能 | `452` | `465` | `478` | `web-06-member.md` |
| 07 錢包、銀行與交易 | `453` | `466` | `479` | `web-07-finance.md` |
| 08 獎勵卡、優惠碼與贈禮 | `454` | `467` | `480` | `web-08-rewards-promotions-gifts.md` |
| 09 每日任務、活動、排行榜與教學 | `455` | `468` | `481` | `web-09-tasks-events-rankings-tutorial.md` |
| 10 社交互動、聊天與客服 | `456` | `469` | `482` | `web-10-social-support.md` |
| 11 信箱、通知與設定 | `457` | `470` | `483` | `web-11-inbox-settings.md` |
| 12 跨頁整合與流程 | `458` | `471` | `484` | `web-12-cross-page-integration.md` |
| 13 驗收、部署與玩家情境 | `459` | `472` | `485` | `web-13-acceptance-delivery.md` |

完整 Plane identifier 為 `YOTAPLATFO-` 加上表內數字；三組子單使用同一功能尾碼，不新增或重複建立工作單。

## 12. Handoff 交付包

規格交付包至少包含：`specs/spec-book/` Markdown、HTML 產物、畫面索引與截圖 manifest、API inventory／gap、決策／待確認清單、Plane 工作單回讀結果與版本 commit。

Figma 交付包需包含實際檔案連結、page／frame／component／node ID、桌機／手機狀態與設計 token。Nuxt 交付包需包含 source commit、變更檔案、focused check、build／generate、瀏覽器／部署結果與已知限制。

每次 handoff 都要列出：實際讀過的來源、已完成範圍、未完成範圍、目前工作樹／分支、驗證命令與退出碼、外部服務狀態，以及明確停止點。

## 13. 阻塞項與退出條件

以下任一項未解決時，只能標為「文件／原型交付」，不可標為「正式完成」：

- 獎勵卡第 10／15／20 天正式幣別與型態未封存。
- Real 遊戲 launch、餘額、結算與斷線契約未定義。
- 儲值、錢包、贈禮、獎勵與信箱附件未有正式原子性／冪等／稽核來源。
- WebSocket、客服後台、檢舉、好友與黑名單正式服務未完成。
- Plane 描述回填、Figma node 與部署驗證尚未提供證據。

## 14. 版本沿革與目前 Git 基線

| 版本／commit | 內容 | 狀態 |
|---|---|---|
| `c4b8bf9` | Web 規格書 Phase 1 基線與撰寫規則 | 已推送至 `origin/main` |
| `12f35c1` | 10 份 Web 功能分冊與總綱索引 | 已推送至 `origin/main` |
| Phase 3 初版 | `web-12`、`web-13` 跨頁與整體驗收文件 | 已完成並納入 Web HTML 閱讀版 |
| Phase 4 初版 | `build-html.mjs`、`index.html` | Web 規格分頁已產生；待後續工作單回填／提交 |

本文件不把工作區其他既有 dirty／untracked 檔案視為 Web 規格交付內容；commit 時必須以明確檔案清單暫存，避免混入無關變更。

## 15. 開放問題與待後續階段

待後續階段處理：建立完整 Markdown／HTML／anchor／link 檢查；補回 `WEB_WORK_ORDER_BATCH_v1.md` 的文件段落與證據；依確認結果回填 Plane 3 父單＋39 子單描述；必要時再補瀏覽器、SSG 與 Pages 證據。

產品待確認仍集中在 auth／遊戲／財務／獎勵卡／贈禮／社交／通知等功能分冊已列出的 `WEB-Q`，不得因本文件列出驗收流程就視為已拍板。

## 16. 整體交付檢查表

- [ ] `web-02`～`web-13` 的連結、標題、ID、工作單映射與來源通過文件檢查。
- [ ] 13 個功能單元的 SPEC／DESIGN／FE 三方工作單完整回讀，沒有重複或漏單。
- [ ] `WEB-FLOW`、`WEB-SC`、`WEB-AC` 與功能分冊互相引用，並標記目前原型／待確認邊界。
- [ ] Figma 已補實際 page、frame、component、node 與桌機／手機狀態。
- [ ] Nuxt focused checks、build、generate、瀏覽器與響應式證據已記錄退出碼與環境。
- [ ] HTML／索引／截圖／API／Plane 回寫完成後，才進入正式交付審核。
