// Run after npm run generate. Routes serve the actual SSG files inside an isolated
// browser test context, without opening a local server or changing user storage.
import assert from 'node:assert/strict'
import { readFile, stat, mkdtemp } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { chromium } from 'playwright'

const root = resolve('docs')
const base = '/Yota_Website_Nuxt/'
const origin = 'http://wallet-preview.test'
const screenshots = await mkdtemp(resolve(tmpdir(), 'yota-wallet-'))
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
    const tab = name => page.getByRole('tab', { name, exact: true }).click()
    async function noOverflow() {
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${viewport.width}: document fits`)
      for (const selector of ['.bank-hub-panel', '.wallet-overview', '.exchange-preview']) {
        const elements = await page.locator(selector).all()
        for (const element of elements) assert.ok(await element.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${viewport.width}: ${selector} fits`)
      }
    }
    await page.goto(`${origin}${base}lobby/vault/?tab=overview`)
    await click('立即登入 / 註冊')
    await page.locator('#login-account').fill('walletTester')
    await page.locator('#login-password').fill('prototype123')
    await click('登入')
    await page.locator('[role="dialog"][aria-labelledby="auth-modal-title"]').waitFor({ state: 'hidden' })
    await page.locator('.wallet-overview').waitFor()
    assert.equal(await page.locator('.wallet-balance-card').count(), 3)
    assert.equal(await page.locator('.wallet-answer strong').innerText(), '80 金幣')
    assert.ok((await page.locator('.wallet-calculation').innerText()).includes('8,000 銀'))
    assert.equal(await page.locator('.wallet-condition h4').innerText(), '每日簽到獎勵')
    assert.equal(await page.locator('.wallet-progress').getAttribute('aria-valuenow'), '12000')
    assert.equal(await page.locator('.wallet-progress').getAttribute('aria-valuemax'), '20000')
    assert.ok((await page.locator('.wallet-remaining').innerText()).includes('8,000'))
    await page.locator('.wallet-details summary').click()
    assert.ok((await page.locator('.wallet-details').innerText()).includes('WR-002'))
    await page.getByRole('button', { name: /^排隊中/ }).click()
    assert.equal(await page.locator('.wallet-condition h4').innerText(), '儲值加贈優惠')
    assert.ok((await page.locator('.wallet-condition').innerText()).includes('等待前筆完成'))
    await page.getByRole('button', { name: /^已完成/ }).click()
    assert.equal(await page.locator('.wallet-condition h4').innerText(), '新手登入獎勵')
    assert.ok((await page.locator('.wallet-earned').innerText()).includes('已增加 20,000 銀'))
    await page.getByRole('button', { name: /^累計中/ }).click()
    await click('查看交換規則')
    const dialog = page.getByRole('dialog', { name: '交換規則與計算', exact: true })
    await dialog.waitFor()
    assert.ok((await dialog.innerText()).includes('所得存入保險箱'))
    assert.ok((await dialog.innerText()).includes('目前只提供試算，不扣款'))
    assert.ok(await page.getByRole('button', { name: '關閉說明' }).evaluate(el => el === document.activeElement))
    await page.keyboard.press('Shift+Tab')
    assert.ok(await page.getByRole('button', { name: '我知道了' }).evaluate(el => el === document.activeElement))
    await page.keyboard.press('Tab')
    assert.ok(await page.getByRole('button', { name: '關閉說明' }).evaluate(el => el === document.activeElement))
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    assert.ok(await page.getByRole('button', { name: '查看交換規則' }).evaluate(el => el === document.activeElement))
    await click('查看流水規則')
    assert.ok((await page.getByRole('dialog').innerText()).includes('未接入正式結算或額度發放'))
    await click('我知道了')
    for (const label of ['金幣', '銀幣', '銅幣']) {
      await click(`查看${label}說明`)
      assert.ok(await page.getByRole('dialog', { name: `${label}說明`, exact: true }).isVisible())
      await click('關閉說明')
    }
    await noOverflow()
    await page.screenshot({ path: `${screenshots}/${viewport.width}-overview.png`, fullPage: true })
    const balances = await page.locator('.wallet-balance-card strong').allTextContents()
    await click('前往交換')
    await page.waitForURL(/tab=exchange/)
    await page.locator('.exchange-preview').waitFor()
    await click('MAX')
    assert.equal(await page.locator('#silver-exchange-amount').inputValue(), '8000')
    assert.ok((await page.locator('.exchange-result').innerText()).includes('80 金'))
    assert.ok(await page.getByRole('button', { name: '確認交換（展示中）', exact: true }).isDisabled())
    for (const [label, expected] of [['25%', '2000'], ['50%', '4000'], ['75%', '6000']]) {
      await click(label)
      assert.equal(await page.locator('#silver-exchange-amount').inputValue(), expected)
    }
    await page.locator('#silver-exchange-amount').fill('8001')
    assert.equal(await page.locator('#silver-exchange-amount').getAttribute('aria-invalid'), 'true')
    assert.ok((await page.locator('#exchange-input-hint').innerText()).includes('1 至 8,000'))
    await page.locator('#silver-exchange-amount').fill('99')
    assert.equal(await page.locator('#silver-exchange-amount').getAttribute('aria-invalid'), 'false')
    assert.ok((await page.locator('.exchange-result').innerText()).includes('0.99 金'))
    await click('MAX')
    await noOverflow()
    await page.screenshot({ path: `${screenshots}/${viewport.width}-exchange.png`, fullPage: true })
    await click('金幣兌銀幣')
    assert.ok((await page.locator('.exchange-unavailable').innerText()).includes('暫不開放操作'))
    await click('查看銀幣兌金幣')
    assert.equal(await page.locator('#silver-exchange-amount').inputValue(), '')
    await tab('錢包總覽')
    await page.locator('.wallet-overview').waitFor()
    assert.deepEqual(await page.locator('.wallet-balance-card strong').allTextContents(), balances, 'preview does not debit balances')
    await tab('保險箱')
    await page.locator('.vault-preview-grid').waitFor()
    await tab('贈禮')
    await page.locator('.gift-tab-content').waitFor()
    await tab('紀錄')
    await page.locator('.record-card').first().waitFor()
    await context.close()
    console.log(`PASS wallet UI ${viewport.width}×${viewport.height}`)
  }
  assert.deepEqual(errors, [], 'no page errors, hydration warnings or missing chunks')
  console.log(`Screenshots: ${screenshots}`)
} finally {
  await browser.close()
}
