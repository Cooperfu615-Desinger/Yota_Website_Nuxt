import { DEFAULT_WALLET_BALANCE } from './wallets.ts'

export type GameWalletKey =
  | 'gold'
  | 'silver'
  | 'bronze'

export interface GameWalletOption {
  key: GameWalletKey
  label: string
  amount: number
}

export interface GameWalletBalances {
  gold: number
  silver: number
  bronze: number
}

export const DEFAULT_GAME_WALLET: GameWalletKey = 'gold'

export const GAME_WALLET_OPTIONS: GameWalletOption[] = [
  { key: 'gold', label: '金幣', amount: DEFAULT_WALLET_BALANCE },
  { key: 'silver', label: '銀幣', amount: DEFAULT_WALLET_BALANCE },
  { key: 'bronze', label: '銅幣', amount: DEFAULT_WALLET_BALANCE },
]

export function resolveGameWalletOptions(balances: GameWalletBalances): GameWalletOption[] {
  const amountByKey: Record<GameWalletKey, number> = {
    gold: balances.gold,
    silver: balances.silver,
    bronze: balances.bronze,
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
