import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterLiveStreams, toggleLiveFavorite, recordLiveWatch, liveRankScore, normalizeLiveMessage } from '../utils/live.ts'
import { siteContent } from '../data/siteContent.ts'

const streams = siteContent.live.streams
test('live fixtures match APP: six hosts, three online, supported categories', () => {
  assert.equal(streams.length, 6)
  assert.equal(streams.filter(stream => stream.status === 'LIVE').length, 3)
  assert.deepEqual(siteContent.live.categories, ['全部', '體育', '電競', '遊戲', '娛樂'])
})
test('combines category, name/title search and favorites', () => {
  assert.equal(filterLiveStreams(streams, '全部', '', false, []).length, 6)
  assert.deepEqual(filterLiveStreams(streams, '體育', 'fifa', true, [2]).map(stream => stream.id), [2])
  assert.deepEqual(filterLiveStreams(streams, '娛樂', '音樂', false, []).map(stream => stream.id), [4])
  assert.equal(filterLiveStreams(streams, '全部', '', true, []).length, 0)
  assert.equal(filterLiveStreams(streams, '電競', '薇薇', false, []).length, 0)
})
test('favorite toggling does not mutate source and avoids duplicates', () => {
  const source = [1]
  assert.deepEqual(toggleLiveFavorite(source, 2), [1, 2])
  assert.deepEqual(toggleLiveFavorite(source, 1), [])
  assert.deepEqual(source, [1])
})
test('watch records are online only, unique and most recent first', () => {
  assert.deepEqual(recordLiveWatch([2, 1], streams[0]), [1, 2])
  assert.deepEqual(recordLiveWatch([1], streams[3]), [1])
})
test('rank periods preserve APP sample scores', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(index => liveRankScore(index, 'month')), [8000, 6270, 4540, 2100, 1550])
  assert.equal(liveRankScore(1, 'week'), 1568)
  assert.equal(liveRankScore(0, 'day'), 500)
})
test('chat rejects whitespace, trims messages, limits to 200 characters', () => {
  assert.equal(normalizeLiveMessage('  \n  '), '')
  assert.equal(normalizeLiveMessage('  你好  '), '你好')
  assert.equal(normalizeLiveMessage('哈'.repeat(201)).length, 200)
})
