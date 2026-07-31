# 後端 API 工作清單快照

- 原始檔：`/Users/cooperfu/Downloads/AI_list.md`
- 快照日期：2026-07-31
- 原始內容日期：2026-07-27
- 狀態語意：依 Cooper 於 2026-07-31 確認，狀態空白代表後端製作中、尚未完成
- 用途：保存六份 API／三方盤點文件的可追溯依據；下方不改寫原始清單內容

---

## 一、認證 auth（8）

路徑前綴 `/v1frontend/auth`

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| POST | `/auth/login` | 前台會員登入（帳密 → 簽發 token） | 公開 | |
| POST | `/auth/register` | 前台會員密碼註冊 | 公開 | |
| GET | `/auth/oauth/{provider}/url` | 取得三方登入授權頁 URL（四家 provider 共用） | 公開 | |
| POST | `/auth/oauth/{provider}/callback` | 三方登入 callback：已註冊回 token；未註冊回 404 引導註冊 | 公開 | |
| POST | `/auth/oauth/register` | 三方登入建號（查找未命中後補資料） | 公開 | |
| POST | `/auth/oauth/result` | 三方登入 App 模式輪詢結果（系統瀏覽器流程取 token / 失敗原因） | 公開 | |
| POST | `/auth/logout` | 前台會員登出 | 需登入 | |
| POST | `/auth/refresh-token` | 前台 token 更新（refresh） | 需登入 | |

---

## 二、系統 system（4）

路徑前綴 `/v1frontend/system`，全部公開唯讀。

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/system/types` | 取得類型清單（開發用 enum 對照） | 公開 | |
| GET | `/system/default-avatars` | 取得可選頭像素材清單（會員編輯頭像用；註冊頭像由後端隨機賦予） | 公開 | |
| GET | `/system/valid` | 取得所有驗證器規則（開發用） | 公開 | 🆕 |
| GET | `/system/dial-codes` | 取得支援的手機區碼清單（會員手機區碼下拉用） | 公開 | 🆕 |

---

## 三、會員資料 account（5）

路徑前綴 `/v1frontend/account`，**全部需登入**（`Authorization`）。寫入端點額外擋凍結帳號。

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/account/info` | 取得當前會員資訊（含 VIP 累積投注） | 需登入 | |
| GET | `/account/profile` | 取得會員編輯頁基本資料 | 需登入 | |
| PUT | `/account/profile` | 更新會員基本資料（email/phone 一旦有值即鎖定） | 需登入(擋凍結) | |
| PUT | `/account/avatar` | 更新會員頭像（**二選一：檔案 / 素材 ID**，優先序 file>asset） | 需登入(擋凍結) | ✏️ |
| PUT | `/account/password` | 修改 / 設定會員密碼 | 需登入(擋凍結) | |

> ✏️ `avatar` 由舊「三選一（檔案 / S3 path / 素材 ID）」改為**二選一（檔案 / 素材 ID）**，移除 S3 path 選項。

---

## 四、三方綁定 account/oauth（5）

路徑前綴 `/v1frontend/account/oauth`，**需登入**。list 允許凍結帳號讀取，其餘寫入擋凍結。

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/account/oauth` | 取得當前會員三方綁定清單 | 需登入 | |
| GET | `/account/oauth/{provider}/url` | 取得三方綁定授權頁 URL（App 回 poll_id 走系統瀏覽器） | 需登入(擋凍結) | |
| POST | `/account/oauth/{provider}/callback` | 三方綁定 callback（綁定到當前帳號，web 流程） | 需登入(擋凍結) | |
| POST | `/account/oauth/bind/confirm` | 三方綁定確認（App 系統瀏覽器流程，dance 驗證後帶 JWT 寫入） | 需登入(擋凍結) | |
| DELETE | `/account/oauth/{provider}` | 解綁三方身分（無本地密碼且為最後一個綁定時拒絕） | 需登入(擋凍結) | |

---

## 五、信箱 mailbox（4）🆕

路徑前綴 `/v1frontend/mailbox`，**全部需登入**。讀取（清單/詳情）凍結帳號仍可；領取/刪除擋凍結。

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/mailbox` | 會員信箱清單（含未讀徽章） | 需登入 | 🆕 |
| GET | `/mailbox/{id}` | 會員信件詳情（讀信即已讀；`id` = mail_user_id） | 需登入 | 🆕 |
| POST | `/mailbox/{id}/claim` | 領取信件附件（入帳錢包） | 需登入(擋凍結) | 🆕 |
| DELETE | `/mailbox` | 批次刪除本人信件（body 帶 `mail_user_ids`） | 需登入(擋凍結) | 🆕 |

> ⚠️ `DELETE /mailbox`（批次刪除）**未進 swagger**（annotation 漏標），但路由已註冊、可接。

---

## 六、營運內容 operator-setting（5）

路徑前綴 `/v1frontend/operator-setting`。預設公開；僅彈窗需登入。

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/operator-setting/announcement` | 取得前台公告列表 | 公開 | |
| GET | `/operator-setting/image` | 依類型取得前台圖片列表（非彈窗，type 走 query） | 公開 | |
| GET | `/operator-setting/image/popup` | 取得前台彈窗列表（以會員 ID 過濾已關閉的彈窗） | 需登入 | |
| GET | `/operator-setting/article` | 取得前台文章列表 | 公開 | |
| GET | `/operator-setting/article/{id}` | 取得前台文章詳情（JSON） | 公開 | |

---

## 七、VIP（1）

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/vip/levels` | 取得 VIP 等級說明清單（前台公開子集，**含返水 / P2P 手續費率**） | 公開 | ✏️ |

> ✏️ 舊快照為「不含返水比例」；2026-06-30 起 `rebate_rate` / `p2p_fee_rate` 已對前台公開（上游照實回傳）。

---

## 八、訊息 message（12）🆕

路徑前綴 `/v1frontend/message`，**全部需登入**。訊息模板（template）額外限**商戶身分**（`AccountIdentityType=Merchant`）。

### 8-1 對話 / 訊息（7）

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/message/conversation/list` | 取得對話列表 | 需登入 | 🆕 |
| POST | `/message/conversation` | 建立或取得玩家對話 | 需登入(擋凍結) | 🆕 |
| DELETE | `/message/conversation/{id}` | 刪除對話 | 需登入(擋凍結) | 🆕 |
| PUT | `/message/conversation/{id}/read` | 標記對話已讀 | 需登入(擋凍結) | 🆕 |
| POST | `/message` | 發送訊息（暫無圖片） | 需登入(擋凍結) | 🆕 |
| GET | `/message` | 取得訊息列表 | 需登入 | 🆕 |
| DELETE | `/message/{id}` | 刪除訊息 | 需登入(擋凍結) | 🆕 |

> ⚠️ `GET /message`（取得訊息列表）在程式內 Swaggo 被誤標成 `@Router /v1frontend/message [post]`，與 `POST /message`（發送訊息）撞路徑，導致 swagger **只顯示一支且方法錯誤**。實際路由為 **`GET /message`（列表）+ `POST /message`（發送）兩支**，皆可接。

### 8-2 訊息模板 template（5，限商戶身分）

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| GET | `/message/template` | 取得訊息模板列表 | 需登入(限商戶) | 🆕 |
| POST | `/message/template` | 建立訊息模板 | 需登入(擋凍結, 限商戶) | 🆕 |
| GET | `/message/template/{id}` | 取得訊息模板詳情 | 需登入(限商戶) | 🆕 |
| PUT | `/message/template/{id}` | 更新訊息模板（編輯後退回 Pending） | 需登入(擋凍結, 限商戶) | 🆕 |
| DELETE | `/message/template/{id}` | 刪除訊息模板（軟刪） | 需登入(擋凍結, 限商戶) | 🆕 |

---

## 九、客服 customerService（6）🆕

路徑前綴 `/v1frontend/customerservice`，**全部需登入**（經 `AccountRouteGroup`，含 `Authorization`）。建單/發訊/已讀擋凍結。

| 方法 | 路徑 | 功能 | 存取 | 狀態 |
|---|---|---|---|---|
| POST | `/customerservice/order` | 建立工單 | 需登入(擋凍結) | 🆕 |
| POST | `/customerservice/order/message` | 發送訊息 | 需登入(擋凍結) | 🆕 |
| POST | `/customerservice/order/read` | 標記已讀 | 需登入(擋凍結) | 🆕 |
| GET | `/customerservice/orders` | 查詢工單列表（含未讀數） | 需登入 | 🆕 |
| GET | `/customerservice/order/{id}` | 查單張工單詳情 | 需登入 | 🆕 |
| GET | `/customerservice/question-categories` | 取得客服問題分類清單（建單分類選項） | 需登入 | 🆕 |

> ⚠️ `customerservice` 全部端點在 swagger **被誤判為公開**（handler 缺 `@Param Authorization` 標註），且 `GET /question-categories` **未進 swagger**。實際路由經 `AccountRouteGroup`（`Authorization` + `IsAccount`），**皆需登入**、6 支皆可接。

---

## 2026-07-27 前台官網待補 API 清單與時程規劃

- 7/27~7/31：1. 儲值　2. 客服中心　3. 每日任務
- 8/3~8/7：4. 優惠碼　5. mail box　6. 獎勵卡
- 8/10~8/14：7. 排行榜　8. 遊戲相關
- 8/17~8/21：6. 獎勵卡　8. 遊戲相關　9. 交易紀錄
- 8/24~8/28：8. 遊戲相關　10. 黑名單
- 8/31~9/4：11. 保險箱　12. 兌換
