import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getClaimableGold, canDeleteInboxMessage, claimInboxRewards } from '../utils/messageCenters.ts'
import { getLobbyEventAction } from '../utils/lobbyEventAction.ts'
import { siteContent } from '../data/siteContent.ts'

const message = (id, amount, type = 'system') => ({ id, type, title: `信件 ${id}`, date: '2026-09-29', content: '示範', read: false, attachment: { type: 'coins', label: '獎勵', amount } })
test('APP category order and five mailbox records; public announcements have no attachments', () => {
  assert.deepEqual(siteContent.messageCenters.newsCategories.map(item => item.label), ['活動', '遊戲公告', '維護公告', '系統公告'])
  assert.deepEqual(siteContent.messageCenters.inboxCategories.map(item => item.label), ['系統通知', '活動推廣', '補單通知', '個人訊息'])
  assert.equal(siteContent.messageCenters.messages.length, 5)
  assert.ok(siteContent.messageCenters.announcements.every(item => !item.attachment))
})
test('only explicitly formatted positive safe integer gold coins can be claimed', () => {
  for (const amount of ['50,000 金幣', '1000 金幣', '1 金幣']) assert.ok(getClaimableGold(message(1, amount)) > 0)
  for (const amount of ['0 金幣', '-5 金幣', '1.5 金幣', '50,00 金幣', '01 金幣', '50,000 銀幣', '100 銅幣', '金幣 10', '9007199254740992 金幣', 'NaN 金幣']) assert.equal(getClaimableGold(message(1, amount)), 0)
  const item = message(1, '50,000 金幣'); item.attachment.type = 'item'
  assert.equal(getClaimableGold(item), 0)
})
test('claim is idempotent; duplicate IDs and deleted/unknown messages do not award twice', () => {
  const items = [message(1, '50,000 金幣')]
  let balance = 0
  const credit = amount => { balance += amount; return true }
  assert.deepEqual(claimInboxRewards(items, [1, 1, 999], credit), { ok: true, total: 50000, count: 1 })
  assert.equal(claimInboxRewards(items, [1], credit).ok, false)
  assert.equal(claimInboxRewards([], [1], credit).ok, false)
  assert.equal(balance, 50000)
  assert.equal(items[0].read, false, 'claiming does not mark mail read')
})
test('batch is limited by requested category and supports attachments regardless of category', () => {
  const items = [message(1, '10 金幣'), message(2, '20 金幣', 'promo'), message(3, '30 金幣', 'personal'), message(4, '40 金幣', 'adjustment')]
  const ids = items.filter(item => item.type === 'system').map(item => item.id)
  assert.equal(claimInboxRewards(items, ids, () => true).total, 10)
  assert.ok(items.slice(1).every(item => !item.attachment.claimed && !item.read))
  assert.equal(claimInboxRewards(items, [2, 3, 4], () => true).total, 90)
})
test('failed credit and overflowing batches leave all attachments unclaimed', () => {
  const items = [message(1, '50 金幣'), message(2, '100 金幣')]
  assert.equal(claimInboxRewards(items, [1, 2], () => false).ok, false)
  assert.ok(items.every(item => !item.attachment.claimed))
  let called = false
  const huge = [message(1, '9007199254740991 金幣'), message(2, '1 金幣')]
  assert.equal(claimInboxRewards(huge, [1, 2], () => { called = true; return true }).ok, false)
  assert.equal(called, false)
})
test('unclaimed attachments cannot be deleted, including unsupported attachments', () => {
  const item = message(1, '10 銀幣')
  assert.equal(canDeleteInboxMessage(item), false)
  item.attachment.claimed = true
  assert.equal(canDeleteInboxMessage(item), true)
  delete item.attachment
  assert.equal(canDeleteInboxMessage(item), true)
})
test('event CTA is explicit, valid, date-bound except support; no synthetic sign-up', () => {
  const now = Date.parse('2026-09-29T12:00:00+08:00')
  const base = { ...siteContent.lobbyEvents[0], action: { label: ' 前往參加 ', target: 'games' } }
  assert.deepEqual(getLobbyEventAction(base, now), { label: '前往參加', target: 'games' })
  assert.equal(getLobbyEventAction({ ...base, action: undefined }, now), null)
  assert.equal(getLobbyEventAction({ ...base, action: { label: '', target: 'games' } }, now), null)
  assert.equal(getLobbyEventAction({ ...base, action: { label: '錯誤', target: 'unknown' } }, now), null)
  const ended = { ...base, endTime: '2026/09/28 12:00' }
  assert.equal(getLobbyEventAction(ended, now), null)
  assert.equal(getLobbyEventAction({ ...ended, action: { label: '前往客服', target: 'support' } }, now).target, 'support')
  assert.equal(siteContent.lobbyEvents.length, 12)
})
