#!/usr/bin/env node
/**
 * 巨亨ONLINE 規格書 — 單頁 HTML 交付版產生腳本
 *
 * 用法：
 *   PATH="/opt/homebrew/opt/node/bin:$PATH" node specs/spec-book/build-html.mjs
 *
 * 產出：specs/spec-book/index.html
 * 交付方式：把整個 specs/spec-book/ 資料夾（含 index.html、shots/、以及被連結到的
 *   ../decisions/、../2026-07-29-*.md）一起壓縮寄出，圖片與跨文件連結走相對路徑，
 *   不內嵌 base64（84 張截圖 44MB，內嵌會讓單檔案肥大到不利傳輸）。
 *
 * 內容來源（改這些檔案，不要手改 index.html）：
 *   00-overview.md ＋ _index-table.md（總覽 tab）
 *   20-frontend.md（前端 tab）
 *   30-backend.md（後端 tab）
 *   10-art.md（美術 tab）
 */

import { marked } from 'marked'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))

marked.setOptions({ gfm: true, breaks: false })

async function read(name) {
  return readFile(resolve(HERE, name), 'utf-8')
}

/** 從 markdown 抽出 H2 標題當作該 tab 的側欄小節導覽 */
function extractH2(md) {
  const items = []
  for (const line of md.split('\n')) {
    const m = line.match(/^##\s+(.+)$/)
    if (m) {
      const text = m[1].trim()
      const slug = slugify(text)
      items.push({ text, slug })
    }
  }
  return items
}

function slugify(text) {
  return text
    .replace(/`/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** marked 預設不會給標題加 id，這裡手動幫 h2/h3 補上（與 extractH2 用同一套 slugify） */
function addHeadingIds(html) {
  return html.replace(/<h([23])>(.*?)<\/h\1>/g, (whole, level, inner) => {
    const plain = inner.replace(/<[^>]+>/g, '')
    const id = slugify(plain)
    return `<h${level} id="${id}">${inner}</h${level}>`
  })
}

async function renderTab(name, mdFiles) {
  let combined = ''
  for (const f of mdFiles) combined += (await read(f)) + '\n\n'
  const toc = extractH2(combined)
  const html = addHeadingIds(marked.parse(combined))
  return { name, html, toc }
}

async function main() {
  const overviewMd = (await read('00-overview.md')) + '\n\n' + (await read('_index-table.md'))
  const tabs = [
    { key: 'overview', label: '總覽', icon: '◎', ...(await renderTabFromString('overview', overviewMd)) },
    { key: 'frontend', label: '前端', icon: '⌨', ...(await renderTab('frontend', ['20-frontend.md'])) },
    { key: 'backend', label: '後端', icon: '☁', ...(await renderTab('backend', ['30-backend.md'])) },
    { key: 'art', label: '美術', icon: '◆', ...(await renderTab('art', ['10-art.md'])) },
  ]

  const html = buildDocument(tabs)
  await writeFile(resolve(HERE, 'index.html'), html)
  console.log('已產生 specs/spec-book/index.html')
}

async function renderTabFromString(name, md) {
  const toc = extractH2(md)
  const html = addHeadingIds(marked.parse(md))
  return { name, html, toc }
}

function buildDocument(tabs) {
  const tabButtons = tabs
    .map((t, i) => `<button class="tab-btn${i === 0 ? ' active' : ''}" data-tab="${t.key}">${t.icon} ${t.label}</button>`)
    .join('\n')

  const tabPanels = tabs
    .map((t, i) => `<section class="tab-panel${i === 0 ? ' active' : ''}" data-panel="${t.key}">${t.html}</section>`)
    .join('\n')

  const tocLists = tabs
    .map(
      (t) => `
    <nav class="toc" data-toc="${t.key}" style="display:${t.key === tabs[0].key ? 'block' : 'none'}">
      ${t.toc.map((item) => `<a href="#${item.slug}" class="toc-link">${item.text}</a>`).join('\n      ')}
    </nav>`,
    )
    .join('\n')

  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>巨亨ONLINE 規格書</title>
<style>
:root{
  --color-bg:#0F0020;
  --color-bg-card:#1A0A2E;
  --color-border:rgba(168,85,247,0.25);
  --color-gold:#F5C842;
  --color-gold-dark:#D97706;
  --color-purple-glow:#A855F7;
  --color-purple-light:#C084FC;
  --color-text:#F3E8FF;
  --color-text-muted:rgba(196,181,213,0.65);
  --sidebar-w:260px;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:var(--color-bg);
  color:var(--color-text);
  font-family:-apple-system,BlinkMacSystemFont,"Noto Sans TC","Segoe UI",sans-serif;
  line-height:1.7;
  font-size:15px;
}
a{color:var(--color-purple-light)}
a:hover{color:var(--color-gold)}
code{
  background:rgba(168,85,247,0.12);
  padding:0.15em 0.4em;
  border-radius:5px;
  font-size:0.88em;
  color:var(--color-gold);
}
pre{
  background:rgba(15,0,32,0.6);
  border:1px solid var(--color-border);
  border-radius:10px;
  padding:14px 16px;
  overflow-x:auto;
}
pre code{background:none;padding:0;color:var(--color-text)}
blockquote{
  margin:16px 0;
  padding:10px 16px;
  border-left:3px solid var(--color-purple-glow);
  background:rgba(168,85,247,0.08);
  border-radius:0 8px 8px 0;
  color:var(--color-text-muted);
}
hr{border:none;border-top:1px solid var(--color-border);margin:28px 0}
h1{
  font-size:1.7em;color:#fff;font-weight:900;
  border-bottom:2px solid var(--color-gold);padding-bottom:10px;margin-top:0;
}
h2{
  font-size:1.3em;color:var(--color-gold);font-weight:800;
  margin-top:2.2em;scroll-margin-top:20px;
}
h3{font-size:1.08em;color:var(--color-purple-light);font-weight:700;scroll-margin-top:20px}
table{
  border-collapse:collapse;width:100%;margin:14px 0;font-size:0.92em;
}
.table-wrap{overflow-x:auto;margin:14px 0;border:1px solid var(--color-border);border-radius:10px}
.table-wrap table{margin:0}
th,td{
  border:1px solid var(--color-border);
  padding:8px 10px;
  text-align:left;
  vertical-align:top;
}
th{background:rgba(168,85,247,0.14);color:var(--color-gold);white-space:nowrap}
tr:nth-child(even) td{background:rgba(255,255,255,0.02)}

/* ── layout ── */
.app{display:flex;min-height:100vh}
.sidebar{
  width:var(--sidebar-w);flex-shrink:0;
  background:var(--color-bg-card);
  border-right:1px solid var(--color-border);
  padding:20px 14px;position:sticky;top:0;height:100vh;overflow-y:auto;
}
.brand{font-weight:900;color:#fff;font-size:1.05em;margin-bottom:2px}
.brand small{display:block;color:var(--color-text-muted);font-weight:400;font-size:0.75em;margin-top:2px}
.tabs{display:flex;flex-direction:column;gap:4px;margin:18px 0}
.tab-btn{
  all:unset;cursor:pointer;padding:9px 12px;border-radius:9px;font-weight:700;font-size:0.92em;
  color:var(--color-text-muted);
}
.tab-btn:hover{background:rgba(168,85,247,0.1);color:var(--color-text)}
.tab-btn.active{background:linear-gradient(135deg,var(--color-gold),var(--color-gold-dark));color:#170827}
.toc{display:flex;flex-direction:column;gap:2px;margin-top:6px;padding-left:4px;border-left:1px solid var(--color-border)}
.toc-link{
  padding:5px 10px;font-size:0.82em;color:var(--color-text-muted);
  white-space:normal;word-break:break-word;border-radius:0 6px 6px 0;
}
.toc-link:hover{background:rgba(168,85,247,0.1);color:var(--color-purple-light)}
.main{flex:1;min-width:0;padding:36px 44px;max-width:980px}
.tab-panel{display:none}
.tab-panel.active{display:block}
.footer-note{color:var(--color-text-muted);font-size:0.82em;margin-top:60px;padding-top:16px;border-top:1px solid var(--color-border)}

@media (max-width:860px){
  .app{flex-direction:column}
  .sidebar{width:100%;height:auto;position:relative;border-right:none;border-bottom:1px solid var(--color-border)}
  .main{padding:24px 18px}
}

@media (prefers-color-scheme:light){
  :root:not([data-theme="dark"]){
    --color-bg:#FBF7FF;--color-bg-card:#FFFFFF;--color-border:rgba(168,85,247,0.2);
    --color-text:#2B1140;--color-text-muted:#6B5B7A;
  }
  :root:not([data-theme="dark"]) h1{color:#2B1140}
  :root:not([data-theme="dark"]) th{color:#7C3AED}
  :root:not([data-theme="dark"]) code{color:#B45309}
}
:root[data-theme="light"]{
  --color-bg:#FBF7FF;--color-bg-card:#FFFFFF;--color-border:rgba(168,85,247,0.2);
  --color-text:#2B1140;--color-text-muted:#6B5B7A;
}
:root[data-theme="light"] h1{color:#2B1140}
:root[data-theme="light"] th{color:#7C3AED}
:root[data-theme="light"] code{color:#B45309}
</style>
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="brand">巨亨ONLINE 規格書<small>2026-07-30 · 美術／前端／後端</small></div>
    <div class="tabs">
${tabButtons}
    </div>
${tocLists}
  </aside>
  <main class="main">
${tabPanels}
    <div class="footer-note">本書由 <code>specs/spec-book/*.md</code> 自動產生（<code>build-html.mjs</code>），請勿手改本檔案；要更新內容請改對應 .md 後重跑腳本。截圖見同資料夾 <code>shots/</code>，跨文件連結（決策紀錄、三方矩陣、API 總表）需與 <code>specs/</code> 整個資料夾一起分享才能開啟。</div>
  </main>
</div>
<script>
(function () {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.tab-panel');
  var tocs = document.querySelectorAll('.toc');
  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-tab');
      tabBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
      panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === key); });
      tocs.forEach(function (t) { t.style.display = t.getAttribute('data-toc') === key ? 'block' : 'none'; });
      window.scrollTo({ top: 0 });
    });
  });
  // 表格若過寬，包一層可橫向捲動的容器
  document.querySelectorAll('.tab-panel table').forEach(function (table) {
    if (table.closest('.table-wrap')) return;
    var wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
})();
</script>
</body>
</html>
`
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
