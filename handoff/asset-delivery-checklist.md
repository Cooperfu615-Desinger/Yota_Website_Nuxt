# 巨亨 ONLINE 素材交付清單模板

更新日期：2026-04-09

這份模板提供給美術、前端、PM 協作使用，目標是讓每一次素材交付都有一致格式，避免發生以下問題：

- 不知道哪些素材已交付
- 檔名不一致
- Banner 桌機 / 手機版漏圖
- 懸浮介面裝飾圖缺件
- 按鈕狀態與色票沒有一起交付
- 前端拿到圖後還要反覆追問規格

建議使用方式：

1. 每次活動檔期或改版，複製一份這個模板
2. 由美術先填「預計交付」
3. 前端收到素材後補「實際落地位置 / 備註」
4. 交接完成後存回 `handoff/` 或專案管理工具

---

## 1. 專案資訊

- 專案名稱：
- 檔期 / 版本名稱：
- 需求提出日期：
- 預計交付日期：
- 美術負責人：
- 前端負責人：
- PM / 窗口：

---

## 2. 素材交付總覽

| 類別 | 是否需要 | 狀態 | 備註 |
| --- | --- | --- | --- |
| Logo / 品牌識別 | ☐ | 未開始 / 製作中 / 已交付 |  |
| Header 素材 | ☐ | 未開始 / 製作中 / 已交付 |  |
| Banner 桌機版 | ☐ | 未開始 / 製作中 / 已交付 |  |
| Banner 手機版 | ☐ | 未開始 / 製作中 / 已交付 |  |
| 懸浮卡頂部裝飾圖 | ☐ | 未開始 / 製作中 / 已交付 |  |
| 活動主視覺圖 | ☐ | 未開始 / 製作中 / 已交付 |  |
| 活動縮圖 | ☐ | 未開始 / 製作中 / 已交付 |  |
| 快速入口 icon | ☐ | 未開始 / 製作中 / 已交付 |  |
| 排行榜 badge / 裝飾 | ☐ | 未開始 / 製作中 / 已交付 |  |
| CTA 按鈕狀態圖 / 規範 | ☐ | 未開始 / 製作中 / 已交付 |  |
| Footer APP 下載素材 | ☐ | 未開始 / 製作中 / 已交付 |  |
| 頁面背景 / 裝飾元素 | ☐ | 未開始 / 製作中 / 已交付 |  |

---

## 3. 檔名與路徑規範

### 3.1 建議路徑

```text
public/images/
public/images/banner/
public/images/logo/
public/images/events/
public/images/icons/
public/images/floating/
public/images/decorations/
```

### 3.2 命名規則

- 使用英文小寫
- 單字之間以 `-` 連接
- 避免中文
- 避免空白
- 避免版本命名過於隨意，例如 `final-final-2`

### 3.3 命名範例

```text
public/images/logo/logo-main.svg
public/images/banner/home-hero-01.webp
public/images/banner/home-hero-01-mobile.webp
public/images/floating/floating-play-header.webp
public/images/floating/floating-deposit-header.webp
public/images/events/event-summer-campaign.webp
public/images/icons/nav-deposit.svg
```

---

## 4. 素材詳細清單

> 請在每一列填入實際檔名、尺寸、格式與交付狀態。若不需要可填 `N/A`。

| 區塊 | 用途 | 建議檔名 | 建議尺寸 / 比例 | 格式 | 必要性 | 狀態 | 實際存放路徑 | 備註 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Header Logo 主版 | 導覽列品牌識別 | `logo-main.svg` | SVG 向量 | svg | 必要 |  |  |  |
| Header Logo 深底版 | 深色背景使用 | `logo-main-dark.svg` | SVG 向量 | svg | 建議 |  |  |  |
| favicon | 瀏覽器 icon | `favicon.png` / `favicon.ico` | 32x32 / 48x48 | png / ico | 建議 |  |  |  |
| Banner 01 桌機版 | 首頁主視覺 | `home-hero-01.webp` | 1600x700 / 16:7 | webp | 必要 |  |  |  |
| Banner 01 手機版 | 首頁主視覺 mobile | `home-hero-01-mobile.webp` | mobile crop | webp | 建議 |  |  |  |
| Banner 02 桌機版 | 第二張 Banner | `home-hero-02.webp` | 1600x700 / 16:7 | webp | 視需求 |  |  |  |
| Banner 02 手機版 | 第二張 Banner mobile | `home-hero-02-mobile.webp` | mobile crop | webp | 視需求 |  |  |  |
| 懸浮卡儲值頭圖 | 左側立即儲裝飾 | `floating-deposit-header.webp` | 依卡頭比例 | webp / png | 建議 |  |  |  |
| 懸浮卡立即玩頭圖 | 右側立即玩裝飾 | `floating-play-header.webp` | 依卡頭比例 | webp / png | 建議 |  |  |  |
| 懸浮卡玩家資訊頭圖 | 玩家資訊裝飾 | `floating-member-header.webp` | 依卡頭比例 | webp / png | 視需求 |  |  |  |
| 活動主視覺圖 A | 活動卡 / 活動頁 | `event-campaign-a.webp` | 16:9 | webp | 視需求 |  |  |  |
| 活動縮圖 A | 活動列表縮圖 | `event-campaign-a-thumb.webp` | 16:9 | webp | 建議 |  |  |  |
| 儲值 icon | 快速入口 / 導覽 icon | `nav-deposit.svg` | 正方形 | svg | 建議 |  |  |  |
| 活動 icon | 快速入口 / 導覽 icon | `nav-events.svg` | 正方形 | svg | 建議 |  |  |  |
| 排行榜 icon | 快速入口 / 導覽 icon | `nav-leaderboard.svg` | 正方形 | svg | 建議 |  |  |  |
| 教學 icon | 快速入口 / 導覽 icon | `nav-tutorial.svg` | 正方形 | svg | 建議 |  |  |  |
| Rank 1 badge | 排行榜第一名裝飾 | `rank-badge-1.svg` | 依 UI 設計 | svg | 建議 |  |  |  |
| Rank 2 badge | 排行榜第二名裝飾 | `rank-badge-2.svg` | 依 UI 設計 | svg | 建議 |  |  |  |
| Rank 3 badge | 排行榜第三名裝飾 | `rank-badge-3.svg` | 依 UI 設計 | svg | 建議 |  |  |  |
| Footer APP 下載圖示 | Footer 下載入口 | `footer-app-download.svg` | 依 UI 設計 | svg / png | 視需求 |  |  |  |

---

## 5. Banner 專用交付欄位

### 5.1 目前前端規格

目前 Banner 已改成純圖片輪播，因此請確認：

- 是否提供桌機圖：☐ 是 / ☐ 否
- 是否提供手機圖：☐ 是 / ☐ 否
- 是否提供 alt 文案：☐ 是 / ☐ 否
- 是否需要點擊跳轉連結：☐ 是 / ☐ 否

### 5.2 Banner 素材表

| Banner 編號 | 用途 | 桌機圖檔 | 手機圖檔 | alt 文案 | 連結 | 備註 |
| --- | --- | --- | --- | --- | --- | --- |
| Banner 01 |  |  |  |  |  |  |
| Banner 02 |  |  |  |  |  |  |
| Banner 03 |  |  |  |  |  |  |

---

## 6. 懸浮介面專用交付欄位

### 6.1 目前前端規格

- 左側：`立即儲`
- 右側：`立即玩 / 玩家資訊`
- 前端保留 icon 與標題文字
- 美術主要提供頂部裝飾背景圖

### 6.2 懸浮介面素材表

| 區塊 | 桌機版 | 手機版是否沿用 | 檔名 | 備註 |
| --- | --- | --- | --- | --- |
| 立即儲頭部裝飾 | ☐ | ☐ |  |  |
| 立即玩頭部裝飾 | ☐ | ☐ |  |  |
| 玩家資訊頭部裝飾 | ☐ | ☐ |  |  |

---

## 7. 按鈕與互動狀態交付

若按鈕不是沿用目前系統樣式，請一併提供：

| 項目 | 是否提供 | 內容 | 備註 |
| --- | --- | --- | --- |
| 儲值 CTA Normal | ☐ | 顏色 / 漸層 / 描邊 / 陰影 |  |
| 儲值 CTA Hover | ☐ | 顏色 / 發光 / 位移 |  |
| 立即玩 CTA Normal | ☐ | 紫色主按鈕規格 |  |
| 立即玩 CTA Hover | ☐ | 顏色 / 發光 / 位移 |  |
| CTA Active | ☐ | 壓下效果 / 陰影變化 |  |
| CTA Disabled | ☐ | 不可點擊狀態 |  |
| Tab Active | ☐ | 選中狀態 |  |
| Tab Inactive | ☐ | 未選中狀態 |  |
| Card Hover | ☐ | 卡片 hover 樣式 |  |

---

## 8. 色票交付欄位

若本次檔期或改版有新色票，請填寫：

| 色票名稱 | HEX / RGBA | 用途 | 對應區塊 | 備註 |
| --- | --- | --- | --- | --- |
| 主背景色 |  |  |  |  |
| 次背景色 |  |  |  |  |
| 主紫色 |  |  |  |  |
| 紫色發光 |  |  |  |  |
| 主金色 |  |  |  |  |
| 次金色 |  |  |  |  |
| 主文字色 |  |  |  |  |
| 次文字色 |  |  |  |  |
| 邊框色 |  |  |  |  |

---

## 9. 交付驗收檢查

### 美術交付前自檢

- ☐ 檔名符合規則
- ☐ Banner 有提供桌機版與手機版
- ☐ 有註明尺寸 / 比例
- ☐ 有註明格式
- ☐ 有提供 alt 文案
- ☐ 有提供懸浮卡頭部裝飾圖
- ☐ 有提供按鈕狀態規格
- ☐ 有提供對應色票

### 前端接收後確認

- ☐ 檔案可正常開啟
- ☐ 路徑已整理到 `public/images/...`
- ☐ Banner 桌機與手機裁切合理
- ☐ 圖檔大小可接受
- ☐ 與現有版型相容
- ☐ baseURL 路徑可正常部署

---

## 10. 補充欄位

### 本次不需要交付的項目

- 

### 需特別注意的版位

- 

### 前端落地備註

- 

### 美術備註

- 
