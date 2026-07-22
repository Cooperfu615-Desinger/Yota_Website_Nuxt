export type GameWalletKey =
  | 'stored-gold'
  | 'activity-gold'
  | 'stored-silver'
  | 'activity-silver'
  | 'activity-bronze'

export interface GameWalletOption {
  key: GameWalletKey
  label: string
}

export const DEFAULT_GAME_WALLET: GameWalletKey = 'stored-gold'

export const GAME_WALLET_OPTIONS: GameWalletOption[] = [
  { key: 'stored-gold', label: '儲值金幣' },
  { key: 'activity-gold', label: '活動金幣' },
  { key: 'stored-silver', label: '儲值銀幣' },
  { key: 'activity-silver', label: '活動銀幣' },
  { key: 'activity-bronze', label: '活動銅幣' },
]

export function getGameWalletLabel(key?: GameWalletKey | null) {
  return GAME_WALLET_OPTIONS.find(option => option.key === key)?.label ?? ''
}
