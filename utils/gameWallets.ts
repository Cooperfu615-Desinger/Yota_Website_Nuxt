import { DEFAULT_WALLET_BALANCE } from './wallets.ts'

export type GameWalletKey =
  | 'stored-gold'
  | 'activity-gold'
  | 'stored-silver'
  | 'activity-silver'
  | 'activity-bronze'

export interface GameWalletOption {
  key: GameWalletKey
  label: string
  amount: number
}

export interface GameWalletBalances {
  storedGold: number
  activityGold: number
  storedSilver: number
  activitySilver: number
  activityBronze: number
}

export const DEFAULT_GAME_WALLET: GameWalletKey = 'stored-gold'
export const DEFAULT_ACTIVITY_WALLET_BALANCE = 250_000

export const GAME_WALLET_OPTIONS: GameWalletOption[] = [
  { key: 'stored-gold', label: '儲值金幣', amount: DEFAULT_WALLET_BALANCE },
  { key: 'activity-gold', label: '活動金幣', amount: DEFAULT_ACTIVITY_WALLET_BALANCE },
  { key: 'stored-silver', label: '儲值銀幣', amount: DEFAULT_WALLET_BALANCE },
  { key: 'activity-silver', label: '活動銀幣', amount: DEFAULT_ACTIVITY_WALLET_BALANCE },
  { key: 'activity-bronze', label: '活動銅幣', amount: DEFAULT_ACTIVITY_WALLET_BALANCE },
]

export function resolveGameWalletOptions(balances: GameWalletBalances): GameWalletOption[] {
  const amountByKey: Record<GameWalletKey, number> = {
    'stored-gold': balances.storedGold,
    'activity-gold': balances.activityGold,
    'stored-silver': balances.storedSilver,
    'activity-silver': balances.activitySilver,
    'activity-bronze': balances.activityBronze,
  }

  return GAME_WALLET_OPTIONS.map(option => ({
    ...option,
    amount: Math.max(0, Math.floor(amountByKey[option.key])),
  }))
}

export function getGameWalletLabel(key?: GameWalletKey | null) {
  return GAME_WALLET_OPTIONS.find(option => option.key === key)?.label ?? ''
}

export function getGameWalletDisplayLabel(option: GameWalletOption) {
  return `${option.label} — ${option.amount.toLocaleString('en-US')}`
}
