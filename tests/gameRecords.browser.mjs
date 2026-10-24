import assert from 'node:assert/strict'
import { chromium } from 'playwright'
const browser = await chromium.launch({headless:true})
try {
  for(const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:1000}})
    await context.addInitScript(() => localStorage.setItem('jh_isLoggedIn', 'true'))
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort())
    const page=await context.newPage(); const errors=[]
    page.on('pageerror',e=>errors.push(e.message))
    await page.goto('http://127.0.0.1:3000/Yota_Website_Nuxt/lobby/member?tab=history', {waitUntil:'domcontentloaded',timeout:60000})
    await page.getByRole('tab',{name:'遊戲紀錄',exact:true}).click()
    async function check(root) {
      const select=(name,value)=>root.getByLabel(name,{exact:true}).selectOption(value)
      const query=()=>root.getByRole('button',{name:'查詢',exact:true}).click()
      await select('時間範圍','7'); await query()
      const summary=root.locator('.rec-summary'); const before=await summary.innerText()
      assert.match(before,/共 336 筆/)
      await root.getByRole('button',{name:'下一頁',exact:true}).click()
      assert.equal(await summary.innerText(),before)
      await select('幣別','silver')
      assert.match(await summary.innerText(),/金幣/)
      await select('類別','fish'); await select('供應商','ASG'); await query()
      assert.match(await summary.innerText(),/共 7 筆/)
      assert.match(await summary.innerText(),/銀幣/)
      assert.equal(await root.locator('tbody tr').count(),7)
      const amounts=await root.locator('tbody tr').evaluateAll(rows=>rows.map(row=>[2,3].map(index=>Number(row.children[index].textContent.replaceAll(',','').trim()))))
      const bet=amounts.reduce((sum,row)=>sum+row[0],0); const win=amounts.reduce((sum,row)=>sum+row[1],0)
      assert.ok((await summary.innerText()).includes(`投注額：${bet.toLocaleString()}`))
      assert.ok((await summary.innerText()).includes(`贏分：${win>0?'+':''}${win.toLocaleString()}`))
      assert.match(await root.locator('tbody').innerText(),/ASG 漁機（示範）/)
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))
      await root.getByLabel('開始日期',{exact:true}).fill('2026-01-01')
      assert.equal(await root.getByLabel('時間範圍',{exact:true}).inputValue(),'custom')
      assert.equal(await root.getByRole('button',{name:'查詢',exact:true}).isDisabled(),true)
      await select('時間範圍','today'); await query()
    }
    await check(page.locator('.member-content'))
    await page.screenshot({path:`/tmp/yota-records-${width}.png`,fullPage:true})
    if(width===1440) {
      await page.getByRole('button',{name:'開啟玩家資料',exact:true}).click()
      const modal=page.getByRole('dialog',{name:'玩家資料',exact:true})
      await modal.getByRole('tab',{name:'遊戲紀錄',exact:true}).click()
      await check(modal)
    }
    assert.deepEqual(errors,[])
    await context.close(); console.log(`PASS ${width}px: filters, totals across pages, currency snapshot, dates, responsive layout`)
  }
} finally {await browser.close()}
