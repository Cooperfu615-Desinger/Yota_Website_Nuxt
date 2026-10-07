// Run after npm run generate. Routes serve the actual SSG files inside an isolated
// browser test context, without opening a local server or changing user storage.
import assert from 'node:assert/strict'
import { readFile, stat, mkdtemp } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium } from 'playwright'

const root = resolve('docs')
const base = '/Yota_Website_Nuxt/'
const origin = 'http://news-preview.test'
const screenshots = await mkdtemp(resolve(tmpdir(), 'yota-public-news-'))
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.avif': 'image/avif', '.ico': 'image/x-icon' }
const browser = await chromium.launch({ headless: true })
const errors = []
try {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport })
    await context.route('**/*', async route => {
      const url = new URL(route.request().url())
      if (url.origin !== origin) { await route.abort(); return }
      try {
        const pathname = decodeURIComponent(url.pathname)
        let file = resolve(root, pathname.startsWith(base) ? pathname.slice(base.length) : pathname.slice(1))
        if (file !== root && !file.startsWith(root + sep)) throw new Error('Outside static root')
        if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html')
        await route.fulfill({ status: 200, contentType: mime[extname(file)] || 'application/octet-stream', body: await readFile(file) })
      } catch { await route.fulfill({ status: 404, body: 'Not found' }) }
    })
    const page = await context.newPage()
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (/hydration/i.test(message.text())) errors.push(message.text()) })
    page.on('response', response => { if (response.status() >= 400 && /_nuxt/.test(response.url())) errors.push(`${response.status()} ${response.url()}`) })
    const click = name => page.getByRole('button', { name, exact: true }).click()
    const category = label => page.locator('.message-category-rail').getByRole('button', { name: new RegExp(`^${label}，`) }).click()
    async function login() {
      await page.locator('#login-account').fill('newsTester')
      await page.locator('#login-password').fill('prototype123')
      await click('登入')
      await page.locator('[role="dialog"][aria-labelledby="auth-modal-title"]').waitFor({ state: 'hidden' })
    }
    async function noOverflow() {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${viewport.width}: document fits`)
    }
    await page.goto(`${origin}${base}events/`)
    await page.locator('.event-list-item').first().waitFor()
    assert.equal(await page.locator('.event-list-item').count(), 12)
    assert.equal(await page.locator('.message-category').count(), 4)
    assert.equal(await page.locator('.message-total').innerText(), '共 15 則消息')
    assert.equal(await page.locator('.event-unread, .message-category-count, .message-reward, .message-detail-footer').count(), 0)
    await noOverflow()
    await page.screenshot({ path: `${screenshots}/${viewport.width}-public-events.png`, fullPage: true })
    for (const label of ['遊戲公告', '維護公告', '系統公告']) {
      await category(label)
      await page.locator('.message-entry-main').click()
      assert.ok(await page.locator('.message-detail').isVisible())
      assert.equal(await page.locator('.message-entry-meta').innerText(), '2026-09-29')
      await noOverflow()
      if (viewport.width < 900) {
        await click('← 返回列表')
        assert.ok(await page.locator('.message-list').isVisible())
      }
    }
    await page.goto(`${origin}${base}events/?category=game&message=1`)
    await page.locator('.message-detail-heading h2').waitFor()
    assert.ok(await page.locator('.message-detail').isVisible(), 'announcement deep link opens mobile detail too')
    assert.equal(await page.locator('.message-category.active strong').innerText(), '遊戲公告')
    await page.screenshot({ path: `${screenshots}/${viewport.width}-public-news.png`, fullPage: true })
    await page.goto(`${origin}${base}events/?category=events&event=7`)
    await page.getByRole('heading', { name: '百家樂連勝王', exact: true }).waitFor()
    assert.equal(await page.locator('.events-action').count(), 0, 'expired activity cannot participate')
    await page.goto(`${origin}${base}`)
    await page.locator('.news-item').first().waitFor()
    assert.equal(await page.locator('.news-item').count(), 3)
    assert.equal(await page.locator('.featured-news-card').count(), 3)
    assert.ok(await page.getByRole('link', { name: '最新消息', exact: true }).count() >= 1)
    assert.equal(await page.getByRole('link', { name: '活動', exact: true }).count(), 0)
    await noOverflow()
    await page.screenshot({ path: `${screenshots}/${viewport.width}-homepage.png`, fullPage: true })
    await page.locator('.news-item').first().click()
    await page.locator('.message-detail-heading h2').waitFor()
    assert.ok(await page.locator('.message-detail').isVisible())
    if (viewport.width < 900) {
      await page.goto(`${origin}${base}`)
      await page.locator('#bottom-nav').getByRole('button', { name: /最新消息/ }).click()
      await page.locator('.event-list-item').first().waitFor()
      assert.equal(await page.locator('#login-account').count(), 0, 'public bottom entry does not require login')
    }
    await page.goto(`${origin}${base}lobby/mailbox/`)
    await page.locator('.message-guest').waitFor()
    assert.equal(await page.locator('.message-entry').count(), 0, 'private inbox remains protected')
    await page.goto(`${origin}${base}events/?category=events&event=12`)
    await page.getByRole('heading', { name: '活動諮詢服務', exact: true }).waitFor()
    await page.locator('.events-action').click()
    await login()
    await page.waitForURL(/chat\?channel=support&activity=12/)
    const draft = page.getByPlaceholder('請輸入問題內容…')
    await draft.waitFor()
    assert.ok((await draft.inputValue()).includes('活動諮詢服務'), 'login preserves activity support draft')
    assert.ok((await page.locator('.support-thread-header').innerText()).includes('尚未送出'))
    await noOverflow()
    // Navigate inside Nuxt so the shared read state stays in the same session.
    await page.goto(`${origin}${base}events/?category=game&message=1`)
    await page.locator('.message-entry-meta').getByText('已讀', { exact: true }).waitFor({ state: 'attached' })
    const unreadBeforeNavigation = await page.locator('.message-total').innerText()
    await page.evaluate(async () => {
      const router = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$router
      await router.push('/lobby/inbox?category=game&message=1')
    })
    await page.locator('.message-entry-meta').getByText('已讀', { exact: true }).waitFor({ state: 'attached' })
    assert.equal(await page.locator('.message-total').innerText(), unreadBeforeNavigation, 'read state is shared across public and lobby news')
    await noOverflow()
    await context.close()
    console.log(`PASS public news UI ${viewport.width}×${viewport.height}`)
  }
  assert.deepEqual(errors, [], 'no page errors, hydration warnings or missing chunks')
  console.log(`Screenshots: ${screenshots}`)
} finally { await browser.close() }
