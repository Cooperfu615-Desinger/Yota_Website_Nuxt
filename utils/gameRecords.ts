export type RecordCurrency = 'gold' | 'silver' | 'bronze'
export type RecordPeriod = 'today' | 'yesterday' | '3' | '5' | '7' | 'custom'
export const RECORD_PROVIDERS = ['ASG', 'RSG', 'ATG', 'BNG', 'QT', 'GR', 'T9', 'PG']
export const RECORD_CATEGORIES = [
  { key: 'slots', label: '老虎機' }, { key: 'board', label: '棋牌' },
  { key: 'live', label: '真人' }, { key: 'fish', label: '漁機' },
  { key: 'mini', label: '迷你' }, { key: 'lottery', label: '彩票' },
]
export const RECORD_CURRENCIES = [
  { key: 'gold', label: '金' }, { key: 'silver', label: '銀' }, { key: 'bronze', label: '銅' },
] as const
export interface GameRecord {
  id: number; time: number; gameKey: string; game: string
  currency: RecordCurrency; category: string; provider: string
  bet: number; win: number; balance: number
}
export interface RecordQuery {
  startDate: string; endDate: string; currency: RecordCurrency; category: string; provider: string
}
const DAY = 86400000
export function taipeiDate(now = Date.now()) {
  return new Date(now + 8 * 3600000).toISOString().slice(0, 10)
}
export function shiftDate(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10)
}
export function periodDates(period: Exclude<RecordPeriod, 'custom'>, now = Date.now()) {
  const today = taipeiDate(now)
  const days = period === 'today' ? 0 : period === 'yesterday' ? 1 : Number(period)
  return { startDate: shiftDate(today, -days), endDate: shiftDate(today, days ? -1 : 0) }
}
export function validRecordRange(start: string, end: string, min: string, max: string) {
  const valid = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date)
    && Number.isFinite(Date.parse(`${date}T00:00:00Z`))
    && new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date
  return valid(start) && valid(end) && start >= min && end <= max && start <= end
}
export function filterRecords(records: GameRecord[], query: RecordQuery) {
  const start = Date.parse(`${query.startDate}T00:00:00+08:00`)
  const end = Date.parse(`${query.endDate}T00:00:00+08:00`) + DAY
  return records.filter(r => r.time >= start && r.time < end && r.currency === query.currency
    && (query.category === 'all' || r.category === query.category)
    && (query.provider === 'all' || r.provider === query.provider))
    .sort((a, b) => b.time - a.time || b.id - a.id)
}
export function recordTotals(records: GameRecord[]) {
  return records.reduce((sum, record) => ({ bet: sum.bet + record.bet, win: sum.win + record.win }), { bet: 0, win: 0 })
}
// Independent, reproducible demo records; never relabel actual lobby games/providers.
export function createDemoRecords(now = Date.now()): GameRecord[] {
  const records: GameRecord[] = []
  const balances = { gold: 20000, silver: 20000, bronze: 20000 }
  const midnight = Date.parse(`${taipeiDate(now)}T00:00:00+08:00`)
  for (let day = 30; day >= 0; day--) {
    for (let c = 0; c < RECORD_CATEGORIES.length; c++) {
      for (let p = 0; p < RECORD_PROVIDERS.length; p++) {
        for (const { key: currency } of RECORD_CURRENCIES) {
          const id = records.length + 1
          const time = midnight - day * DAY + (c * 8 + p) * 60000
          if (time > now) continue
          const bet = [50, 100, 200, 500][id % 4]
          const win = [-bet, 0, bet, bet * 2][id % 4]
          balances[currency] += win
          records.push({ id, time, gameKey: `demo-${p}-${c}`, game: `${RECORD_PROVIDERS[p]} ${RECORD_CATEGORIES[c].label}（示範）`,
            category: RECORD_CATEGORIES[c].key, provider: RECORD_PROVIDERS[p], currency, bet, win, balance: balances[currency] })
        }
      }
    }
  }
  return records
}
