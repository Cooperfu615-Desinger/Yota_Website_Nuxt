import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire, registerHooks } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

// Nuxt's auto-imports are supplied as a small in-memory harness, not a browser backdoor.
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('~/')) specifier = pathToFileURL(resolve(specifier.slice(2))).href
  try { return next(specifier, context) } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('file:')) return next(`${specifier}.ts`, context)
    throw error
  }
} })
const { ref, computed } = createRequire(import.meta.url)('vue')
const states = new Map()
let credited = 0
let records = []
let acceptCredit = true
let reenter
globalThis.computed = computed
globalThis.useState = (key, seed) => {
  if (!states.has(key)) states.set(key, ref(seed()))
  return states.get(key)
}
globalThis.useFinancialState = () => ({ balance: computed(() => 10000000 + credited), addWalletReward(wallet, amount, title, detail) {
  if (!acceptCredit) return null
  if (reenter) reenter()
  credited += amount
  records.push({ wallet, amount, title, detail })
  return records.at(-1)
} })
const { useMessageCentersState } = await import('../composables/useMessageCentersState.ts')
function fresh(loggedIn = true) {
  states.clear(); credited = 0; records = []; acceptCredit = true; reenter = undefined
  const center = useMessageCentersState()
  states.get('isLoggedIn').value = loggedIn
  return center
}
test('signed-out users cannot read, claim or delete mail', () => {
  const center = fresh(false)
  center.markRead('inbox', 1); center.markEventRead(1)
  assert.equal(center.messages.value[0].read, false)
  assert.equal(center.readEventIds.value.length, 0)
  assert.equal(center.claimRewards([1]).ok, false)
  assert.equal(center.deleteMessage(2), false)
  assert.equal(credited, 0)
})
test('single + batch is idempotent, reentrant credit is blocked, record uses gold reward', () => {
  const center = fresh()
  reenter = () => assert.equal(center.claimRewards([1]).ok, false)
  assert.equal(center.claimRewards([1]).ok, true)
  assert.equal(center.claimCategory('system').ok, false)
  assert.equal(credited, 50000)
  assert.equal(records.length, 1)
  assert.equal(records[0].wallet, 'gold')
  assert.equal(records[0].title, '信箱附件領取')
  assert.equal(center.messages.value[0].read, false)
  assert.equal(center.claiming.value, false)
})
test('failed wallet write does not consume the attachment and retry succeeds', () => {
  const center = fresh()
  acceptCredit = false
  assert.equal(center.claimRewards([1]).ok, false)
  assert.equal(center.messages.value[0].attachment.claimed, undefined)
  acceptCredit = true
  assert.equal(center.claimRewards([1]).ok, true)
})
test('delete guards attachments; navigation shares state; reset rebuilds independent seeds', () => {
  const center = fresh()
  assert.equal(center.deleteMessage(1), false)
  center.claimRewards([1]); assert.equal(center.deleteMessage(1), true)
  center.markRead('news', 1); center.markRead('inbox', 2); center.markEventRead(11)
  center.supportActivityDraft.value = '活動草稿'
  const reopened = useMessageCentersState()
  assert.equal(reopened.messages.value.length, 4)
  assert.ok(reopened.readEventIds.value.includes(11))
  assert.equal(reopened.inboxUnread.value, 2)
  reopened.resetMessageCenters()
  assert.equal(center.messages.value.length, 5)
  assert.equal(center.messages.value[0].attachment.claimed, undefined)
  assert.equal(center.inboxUnread.value, 4)
  assert.equal(center.newsUnread.value, 15)
  assert.deepEqual(center.readEventIds.value, [])
  assert.equal(center.supportActivityDraft.value, '')
})
