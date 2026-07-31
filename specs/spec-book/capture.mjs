#!/usr/bin/env node
/**
 * 巨亨ONLINE 規格書 — 截圖腳本
 *
 * 用法：
 *   1. 另開終端啟動 dev server（不可與 npm run generate 並跑）：
 *        PATH="/opt/homebrew/opt/node/bin:$PATH" npm run dev
 *   2. 執行截圖：
 *        PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/capture.mjs
 *
 * 選項：
 *   --only=F-04,M-01      只拍指定編號（逗號分隔，支援前綴比對）
 *   --viewport=desktop    只拍某個斷點
 *   --base=http://...     指定 base（預設自動偵測 IPv4/IPv6 哪個回 200）
 *   --headed              顯示瀏覽器（debug 用）
 *
 * 產出：
 *   specs/spec-book/shots/<編號>-<desktop|mobile>.png
 *   specs/spec-book/shots/manifest.json      截圖結果與失敗原因
 *   specs/spec-book/_index-table.md          畫面索引總表（由 00-overview.md 引用）
 */

import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { screens, viewports, groups } from './screens.config.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const SHOTS = resolve(HERE, 'shots')
const BASE_PATH = '/Yota_Website_Nuxt'
const PORT = 3000

// dev server 的 localStorage 種子：跳過登入流程，直接進登入後畫面
const LOGGED_IN_SEED = {
  jh_isLoggedIn: 'true',
}

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? true]
  }),
)

/**
 * 地雷（memory: dev-build-gotchas #1）：Nuxt dev proxy 讓 localhost / 127.0.0.1 / [::1]
 * 其中一個回 426 Upgrade Required，且每次重啟不固定。先試出回 200 的 host。
 */
async function detectBase() {
  if (args.base) return String(args.base)
  const hosts = ['http://localhost', 'http://127.0.0.1', 'http://[::1]']
  for (const host of hosts) {
    const url = `${host}:${PORT}${BASE_PATH}/`
    try {
      const res = await fetch(url, { redirect: 'manual' })
      if (res.status >= 200 && res.status < 400) {
        console.log(`✔ dev server: ${host}:${PORT} (HTTP ${res.status})`)
        return `${host}:${PORT}`
      }
      console.log(`  ${host}:${PORT} → HTTP ${res.status}，換下一個`)
    } catch {
      console.log(`  ${host}:${PORT} → 連不上，換下一個`)
    }
  }
  throw new Error(
    '找不到可用的 dev server。請先在另一個終端執行：\n' +
      '  PATH="/opt/homebrew/opt/node/bin:$PATH" npm run dev',
  )
}

async function runStep(page, step) {
  switch (step.action) {
    case 'click':
      await page.getByRole('button', { name: step.text, exact: false }).first().click({ timeout: 5000 })
      break
    case 'clickFirst':
      await page.locator(step.selector).first().click({ timeout: 5000, force: step.force ?? false })
      break
    case 'hover':
      await page.locator(step.selector).first().hover({ timeout: 5000 })
      break
    case 'key':
      await page.keyboard.press(step.key)
      break
    case 'scrollTo':
      await page.locator(step.selector).first().scrollIntoViewIfNeeded({ timeout: 5000 })
      break
    case 'wait':
      await page.waitForTimeout(step.ms ?? 300)
      break
    default:
      throw new Error(`未知的 step.action：${step.action}`)
  }
}

async function captureOnce(browser, base, screen, viewportKey) {
  const vp = viewports[viewportKey]
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.deviceScaleFactor ?? 1,
    isMobile: vp.isMobile ?? false,
    hasTouch: vp.isMobile ?? false,
    locale: 'zh-TW',
    colorScheme: 'dark',
  })

  // 登入狀態：在任何頁面載入前種下 localStorage
  if (screen.auth === 'in') {
    await context.addInitScript((seed) => {
      for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v)
    }, LOGGED_IN_SEED)
  }

  const page = await context.newPage()
  const errors = []
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()) })

  const file = `${screen.id}-${viewportKey}.png`
  try {
    const url = `${base}${BASE_PATH}${screen.route}`
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    // 給 hydration 一點時間，避免 steps 的第一次點擊落在還沒綁定事件的畫面上
    await page.waitForTimeout(300)

    for (const step of screen.steps ?? []) await runStep(page, step)

    // waitFor 檢查放在 steps 之後：多數 waitFor 目標（彈窗、分頁內容）是 steps 觸發出來的，
    // 先前版本在 steps 之前檢查會永遠逾時
    if (screen.waitFor) {
      await page.waitForSelector(screen.waitFor, { timeout: 10000 })
    }
    // 等動畫與字型穩定
    await page.waitForTimeout(500)
    await page.evaluate(() => document.fonts?.ready)

    const target = screen.clip ? page.locator(screen.clip).first() : page
    await target.screenshot({
      path: resolve(SHOTS, file),
      ...(screen.clip ? {} : { fullPage: true }),
    })
    return { ok: true, file, consoleErrors: errors }
  } catch (err) {
    return { ok: false, file, error: String(err.message ?? err).split('\n')[0], consoleErrors: errors }
  } finally {
    await context.close()
  }
}

/** 多步驟的互動流程（連續點擊開彈窗/切分頁）偶爾會撞上 Vue 轉場動畫，重試一次即可穩定 */
async function capture(browser, base, screen, viewportKey) {
  const first = await captureOnce(browser, base, screen, viewportKey)
  if (first.ok) return first
  await new Promise((r) => setTimeout(r, 500))
  return captureOnce(browser, base, screen, viewportKey)
}

function statusIcon(note = '') {
  if (note.includes('🔴')) return '🔴'
  if (note.includes('⚠️')) return '⚠️'
  if (note.includes('✅')) return '✅'
  if (note.includes('🟣')) return '🟣'
  return '—'
}

function buildIndexTable(results) {
  const lines = [
    '<!-- 此檔由 specs/spec-book/capture.mjs 自動產生，請勿手改；內容來源為 screens.config.mjs -->',
    '',
    `> 產生時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`,
    '',
  ]
  for (const group of groups) {
    const rows = screens.filter((s) => s.group === group)
    if (!rows.length) continue
    lines.push(`### ${group}`, '')
    lines.push('| 編號 | 畫面 | 官網路由 | 截圖 | 三方狀態 | 備註 |')
    lines.push('|---|---|---|---|---|---|')
    for (const s of rows) {
      const shots = ['desktop', 'mobile']
        .map((v) => {
          const r = results[`${s.id}-${v}`]
          if (!r) return null
          return r.ok ? `[${v === 'desktop' ? '桌機' : '手機'}](shots/${r.file})` : `~~${v}~~`
        })
        .filter(Boolean)
        .join(' ／ ')
      lines.push(
        `| <a id="${s.id}"></a>\`${s.id}\` | ${s.name} | ${s.route ? `\`${s.route}\`` : '➖ 無' } | ${shots || '待補'} | ${statusIcon(s.note)} | ${s.note ?? ''} |`,
      )
    }
    lines.push('')
  }
  return lines.join('\n')
}

async function main() {
  const base = await detectBase()
  await mkdir(SHOTS, { recursive: true })

  const onlyFilter = args.only ? String(args.only).split(',') : null
  const vpFilter = args.viewport ? [String(args.viewport)] : null

  const browser = await chromium.launch({ headless: !args.headed })
  // 局部重跑（--only / --viewport）時，先載入既有 manifest 再合併，避免覆蓋掉其他畫面的結果
  const results = await readFile(resolve(SHOTS, 'manifest.json'), 'utf-8')
    .then((raw) => JSON.parse(raw).results ?? {})
    .catch(() => ({}))
  let ok = 0
  let fail = 0
  let skipped = 0

  for (const screen of screens) {
    if (onlyFilter && !onlyFilter.some((f) => screen.id.startsWith(f))) continue
    if (screen.skip || !screen.route) {
      skipped++
      console.log(`⏭  ${screen.id.padEnd(7)} ${screen.name} — 跳過（${screen.skip ? 'config skip' : '官網無此畫面'}）`)
      continue
    }
    const vps = vpFilter ?? screen.viewports ?? ['desktop', 'mobile']
    for (const v of vps) {
      const r = await capture(browser, base, screen, v)
      results[`${screen.id}-${v}`] = r
      if (r.ok) {
        ok++
        const warn = r.consoleErrors.length ? ` ⚠️ console ${r.consoleErrors.length} 則` : ''
        console.log(`✔  ${screen.id.padEnd(7)} ${v.padEnd(7)} ${screen.name}${warn}`)
      } else {
        fail++
        console.log(`✘  ${screen.id.padEnd(7)} ${v.padEnd(7)} ${screen.name} — ${r.error}`)
      }
    }
  }

  await browser.close()
  await writeFile(
    resolve(SHOTS, 'manifest.json'),
    JSON.stringify({ base, capturedAt: new Date().toISOString(), results }, null, 2),
  )
  await writeFile(resolve(HERE, '_index-table.md'), buildIndexTable(results))

  console.log(`\n完成：成功 ${ok}／失敗 ${fail}／跳過 ${skipped}`)
  console.log('索引總表：specs/spec-book/_index-table.md')
  if (fail) process.exitCode = 1
}

main().catch((err) => {
  console.error(`\n✘ ${err.message}`)
  process.exit(1)
})
