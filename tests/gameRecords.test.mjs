import { test } from 'node:test'
import assert from 'node:assert/strict'
import { taipeiDate, periodDates, validRecordRange, filterRecords, recordTotals, createDemoRecords } from '../utils/gameRecords.ts'
const now = Date.parse('2026-10-24T03:00:00Z')
test('Taipei dates and previous complete days across month/year boundaries', () => {
  assert.equal(taipeiDate(Date.parse('2026-10-23T16:00:00Z')), '2026-10-24')
  for (const days of [3, 5, 7]) assert.deepEqual(periodDates(String(days), now), {startDate: `2026-10-${24-days}`, endDate:'2026-10-23'})
  assert.deepEqual(periodDates('today', now), {startDate:'2026-10-24',endDate:'2026-10-24'})
  assert.deepEqual(periodDates('yesterday', Date.parse('2027-01-01T01:00:00+08:00')), {startDate:'2026-12-31',endDate:'2026-12-31'})
})
test('invalid and out-of-range custom dates rejected', () => {
  for (const [start,end] of [['','2026-10-24'],['2026-10-25','2026-10-24'],['2026-09-23','2026-10-24'],['2026-10-24','2026-10-25'],['2026-02-30','2026-03-01']]) assert.equal(validRecordRange(start,end,'2026-09-24','2026-10-24'),false)
  assert.equal(validRecordRange('2026-09-24','2026-10-24','2026-09-24','2026-10-24'),true)
})
test('query includes final millisecond but excludes next midnight, combines all filters', () => {
  const query = {startDate:'2026-10-24',endDate:'2026-10-24',currency:'silver',category:'fish',provider:'ASG'}
  const base={game:'demo',gameKey:'demo',currency:'silver',category:'fish',provider:'ASG',bet:100,win:-20,balance:1000}
  const records=[{...base,id:1,time:Date.parse('2026-10-24T00:00:00+08:00')},{...base,id:2,time:Date.parse('2026-10-24T23:59:59.999+08:00')},{...base,id:3,time:Date.parse('2026-10-25T00:00:00+08:00')}]
  for (const override of [{currency:'gold'},{category:'slots'},{provider:'PG'}]) records.push({...records[0],...override,id:records.length+1})
  const result=filterRecords(records,query)
  assert.deepEqual(result.map(r=>r.id),[2,1]); assert.deepEqual(recordTotals(result),{bet:200,win:-40})
  assert.deepEqual(recordTotals([]),{bet:0,win:0})
})
test('demo data reproducible, totals cover every result beyond first page, wallets separate',()=>{
  const data=createDemoRecords(now); assert.deepEqual(data,createDemoRecords(now)); assert.ok(data.every(r=>r.time<=now && r.balance>=0))
  const results=filterRecords(data,{...periodDates('today',now),currency:'gold',category:'all',provider:'all'})
  assert.equal(results.length,48)
  assert.ok(recordTotals(results).bet>recordTotals(results.slice(0,10)).bet)
  assert.equal(filterRecords(data,{...periodDates('today',now),currency:'bronze',category:'lottery',provider:'T9'}).length,1)
})
