#!/usr/bin/env node
/**
 * 巨亨ONLINE Web 規格書 — 可重複執行的文件驗證
 *
 * 用法：
 *   PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/validate-docs.mjs
 *
 * 這支檢查只讀取規格書與產出的 HTML，不會改寫任何檔案，也不會連線到 Plane。
 */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

const WEB_SPEC_FILES = [
  'WEB_SPEC_RULES.md',
  'web-02-public-site.md',
  'web-03-authentication.md',
  'web-04-lobby-navigation.md',
  'web-05-game-session.md',
  'web-06-member.md',
  'web-07-finance.md',
  'web-08-rewards-promotions-gifts.md',
  'web-09-tasks-events-rankings-tutorial.md',
  'web-10-social-support.md',
  'web-11-inbox-settings.md',
  'web-12-cross-page-integration.md',
  'web-13-acceptance-delivery.md',
]

const FUNCTIONAL_FILES = WEB_SPEC_FILES.filter((name) => /^web-(0[2-9]|1[01])-.+\.md$/.test(name))

const EXPECTED_SECTIONS = [
  '1. 這個功能是什麼',
  '2. 這個功能不做什麼',
  '3. 名詞說明',
  '4. 畫面內容',
  '5. 欄位說明',
  '6. 狀態說明',
  '7. 查詢、排序與分頁',
  '8. 操作與跳轉',
  '9. 頁面狀態',
  '10. User Story — 玩家',
  '11. User Story — 開發人員',
  '12. User Story — QA 驗證者',
  '13. 驗收標準',
  '14. 這個功能需要的資料',
  '15. 待確認事項',
  '16. 版本沿革',
  '17. 交付檢查表',
]

const WORK_ORDER_MAPPING = {
  'web-02-public-site.md': ['448', '461', '474'],
  'web-03-authentication.md': ['449', '462', '475'],
  'web-04-lobby-navigation.md': ['450', '463', '476'],
  'web-05-game-session.md': ['451', '464', '477'],
  'web-06-member.md': ['452', '465', '478'],
  'web-07-finance.md': ['453', '466', '479'],
  'web-08-rewards-promotions-gifts.md': ['454', '467', '480'],
  'web-09-tasks-events-rankings-tutorial.md': ['455', '468', '481'],
  'web-10-social-support.md': ['456', '469', '482'],
  'web-11-inbox-settings.md': ['457', '470', '483'],
  'web-12-cross-page-integration.md': ['458', '471', '484'],
  'web-13-acceptance-delivery.md': ['459', '472', '485'],
}

const PARENT_IDS = ['444', '445', '446']
const CHILD_IDS = Array.from({ length: 39 }, (_, index) => String(447 + index))
const HTML_TABS = ['overview', 'webspec', 'frontend', 'backend', 'art']
const WORK_ORDER_FILE = '../plane/WEB_WORK_ORDER_BATCH_v1.md'

const passed = []
const failed = []

function pass(label, detail = '') {
  passed.push(detail ? `${label} — ${detail}` : label)
}

function fail(label, detail) {
  failed.push(`${label} — ${detail}`)
}

function check(condition, label, detailWhenPassed, detailWhenFailed) {
  if (condition) pass(label, detailWhenPassed)
  else fail(label, detailWhenFailed)
}

async function readRequired(relativePath) {
  const absolutePath = resolve(HERE, relativePath)
  if (!existsSync(absolutePath)) {
    fail(`檔案存在：${relativePath}`, '找不到檔案')
    return null
  }

  try {
    return await readFile(absolutePath, 'utf8')
  } catch (error) {
    fail(`檔案可讀：${relativePath}`, error.message)
    return null
  }
}

function extractNumberedH2(markdown) {
  return [...markdown.matchAll(/^##\s+([0-9]+)\.\s+(.+?)\s*$/gm)].map(
    (match) => `${match[1]}. ${match[2].trim()}`,
  )
}

function checkRelativeMarkdownLinks(relativePath, markdown) {
  const linkPattern = /\[[^\]]+\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g
  const broken = []

  for (const match of markdown.matchAll(linkPattern)) {
    const rawTarget = match[1]
    if (/^(?:https?:|mailto:|data:)/i.test(rawTarget) || rawTarget.startsWith('#')) continue

    const [pathTarget] = rawTarget.split('#')
    if (!pathTarget) continue

    const decodedTarget = decodeURIComponent(pathTarget)
    const absoluteTarget = resolve(HERE, relativePath, '..', decodedTarget)
    if (!existsSync(absoluteTarget)) broken.push(rawTarget)
  }

  check(
    broken.length === 0,
    `相對連結：${relativePath}`,
    '所有本地目標存在',
    `找不到 ${broken.join(', ')}`,
  )
}

function extractAttributeValues(html, attribute) {
  const pattern = new RegExp(`${attribute}="([^"]+)"`, 'g')
  return [...html.matchAll(pattern)].map((match) => match[1])
}

function checkUniqueHtmlIds(html) {
  const ids = extractAttributeValues(html, 'id')
  const counts = new Map()
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1).map(([id]) => id)

  check(
    duplicates.length === 0,
    'HTML anchor 唯一性',
    `${ids.length} 個 id 均唯一`,
    `重複 id：${duplicates.join(', ')}`,
  )
}

function checkHtmlTocTargets(html) {
  const tocMatch = html.match(/<nav class="toc" data-toc="webspec"[\s\S]*?<\/nav>/)
  if (!tocMatch) {
    fail('HTML Web 規格 TOC', '找不到 data-toc="webspec"')
    return
  }

  const headingIds = new Set(
    [...html.matchAll(/<h[23] id="([^"]+)"/g)].map((match) => match[1]),
  )
  const targets = [...tocMatch[0].matchAll(/href="#([^"]+)"/g)].map((match) => match[1])
  const missing = [...new Set(targets.filter((target) => !headingIds.has(target)))]

  check(
    missing.length === 0,
    'HTML Web 規格 TOC 對應',
    `${targets.length} 個連結均有對應 anchor`,
    `找不到 anchor：${missing.join(', ')}`,
  )
}

async function main() {
  const requiredFiles = [
    '00-overview.md',
    '_index-table.md',
    'build-html.mjs',
    'index.html',
    WORK_ORDER_FILE,
    ...WEB_SPEC_FILES,
  ]
  for (const relativePath of requiredFiles) {
    check(existsSync(resolve(HERE, relativePath)), `檔案存在：${relativePath}`, '存在', '找不到檔案')
  }

  const markdownByFile = new Map()
  for (const relativePath of ['00-overview.md', ...WEB_SPEC_FILES]) {
    const markdown = await readRequired(relativePath)
    if (markdown !== null) markdownByFile.set(relativePath, markdown)
  }

  for (const relativePath of FUNCTIONAL_FILES) {
    const markdown = markdownByFile.get(relativePath)
    if (markdown === undefined) continue

    const sections = extractNumberedH2(markdown)
    check(
      JSON.stringify(sections) === JSON.stringify(EXPECTED_SECTIONS),
      `APP 結構：${relativePath}`,
      '17 個標準章節順序正確',
      `實際章節為 ${sections.join(' / ') || '（無）'}`,
    )

    const expectedIds = WORK_ORDER_MAPPING[relativePath]
    const metadata = markdown.slice(0, 1200)
    const missingIds = expectedIds
      .map((number) => `YOTAPLATFO-${number}`)
      .filter((identifier) => !metadata.includes(identifier))
    check(
      missingIds.length === 0,
      `工作單映射：${relativePath}`,
      expectedIds.map((number) => `YOTAPLATFO-${number}`).join('／'),
      `檔頭缺少 ${missingIds.join('、')}`,
    )

    checkRelativeMarkdownLinks(relativePath, markdown)
  }

  checkRelativeMarkdownLinks('00-overview.md', markdownByFile.get('00-overview.md') ?? '')

  const workOrderMarkdown = await readRequired(WORK_ORDER_FILE) ?? ''
  const missingParents = PARENT_IDS.map((number) => `YOTAPLATFO-${number}`).filter(
    (identifier) => !workOrderMarkdown.includes(identifier),
  )
  const missingChildren = CHILD_IDS.map((number) => `YOTAPLATFO-${number}`).filter(
    (identifier) => !workOrderMarkdown.includes(identifier),
  )
  check(
    missingParents.length === 0,
    '完整交付基線：父單',
    '3 個父單均有記錄',
    `缺少 ${missingParents.join('、')}`,
  )
  check(
    missingChildren.length === 0,
    '完整交付基線：子單',
    '39 個子單均逐筆有記錄',
    `缺少 ${missingChildren.join('、')}`,
  )
  const expectedSourceKeys = [
    ...Array.from({ length: 13 }, (_, index) => `WEB-SPEC-${String(index + 1).padStart(2, '0')}`),
    ...Array.from({ length: 13 }, (_, index) => `WEB-DESIGN-${String(index + 1).padStart(2, '0')}`),
    ...Array.from({ length: 13 }, (_, index) => `WEB-FE-${String(index + 1).padStart(2, '0')}`),
  ]
  const missingSourceKeys = expectedSourceKeys.filter((sourceKey) => !workOrderMarkdown.includes(sourceKey))
  check(
    missingSourceKeys.length === 0,
    '完整交付基線：source_key',
    '39 個 source_key 均有記錄',
    `缺少 ${missingSourceKeys.join('、')}`,
  )

  const buildSource = await readRequired('build-html.mjs')
  if (buildSource !== null) {
    const missingBuildInputs = WEB_SPEC_FILES.filter((name) => !buildSource.includes(`'${name}'`))
    check(
      missingBuildInputs.length === 0,
      'HTML 產生器輸入',
      `${WEB_SPEC_FILES.length} 份 Web 規格來源均已掛入`,
      `產生器未列入 ${missingBuildInputs.join('、')}`,
    )
  }

  const html = await readRequired('index.html')
  if (html !== null) {
    const tabButtons = extractAttributeValues(html, 'data-tab')
    const tabPanels = extractAttributeValues(html, 'data-panel')
    const tabTocs = extractAttributeValues(html, 'data-toc')
    check(
      JSON.stringify(tabButtons) === JSON.stringify(HTML_TABS),
      'HTML 分頁按鈕',
      HTML_TABS.join('／'),
      `實際為 ${tabButtons.join('／')}`,
    )
    check(
      JSON.stringify(tabPanels) === JSON.stringify(HTML_TABS),
      'HTML 分頁內容',
      HTML_TABS.join('／'),
      `實際為 ${tabPanels.join('／')}`,
    )
    check(
      JSON.stringify(tabTocs) === JSON.stringify(HTML_TABS),
      'HTML 分頁 TOC',
      HTML_TABS.join('／'),
      `實際為 ${tabTocs.join('／')}`,
    )

    const webSpecPanel = html.match(/<section class="tab-panel[^>]*data-panel="webspec"[\s\S]*?<\/section>/)?.[0] ?? ''
    check(webSpecPanel.length > 0, 'HTML Web 規格面板', '存在', '找不到 data-panel="webspec"')
    check(
      WEB_SPEC_FILES.every((name) => html.includes(name.replace(/\.md$/, ''))),
      'HTML Web 規格來源標記',
      `${WEB_SPEC_FILES.length} 份來源均可追溯`,
      '部分來源標記未出現在 HTML',
    )
    check(
      FUNCTIONAL_FILES.every((name) => webSpecPanel.includes(`WEB-SPEC-${name.slice(4, 6)}`)),
      'HTML Web 功能章節',
      `${FUNCTIONAL_FILES.length} 個 Web 功能章節均已輸出`,
      '部分 Web 功能章節未輸出至 Web 規格面板',
    )
    checkUniqueHtmlIds(html)
    checkHtmlTocTargets(html)
  }

  console.log(`文件驗證：${passed.length} 項通過，${failed.length} 項失敗`)
  for (const item of passed) console.log(`PASS ${item}`)
  for (const item of failed) console.error(`FAIL ${item}`)

  if (failed.length > 0) process.exitCode = 1
}

main().catch((error) => {
  console.error(`文件驗證未完成：${error.stack ?? error.message}`)
  process.exitCode = 1
})
