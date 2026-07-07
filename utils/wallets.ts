export type WalletKey = 'gold' | 'silver' | 'bronze'

export interface WalletDisplayItem {
  key: WalletKey
  label: string
  shortLabel: string
  balance: number
  color: string
}

export interface WalletSource {
  balance?: number
  silverBalance?: number
  bronzeBalance?: number
}

export const DEFAULT_WALLET_BALANCE = 10000000

export function resolveWalletBalances(user: WalletSource): WalletDisplayItem[] {
  return [
    {
      key: 'gold',
      label: '金錢包',
      shortLabel: '金',
      balance: Number.isFinite(user.balance) ? Number(user.balance) : DEFAULT_WALLET_BALANCE,
      color: '#F5C842',
    },
    {
      key: 'silver',
      label: '銀錢包',
      shortLabel: '銀',
      balance: Number.isFinite(user.silverBalance) ? Number(user.silverBalance) : DEFAULT_WALLET_BALANCE,
      color: '#C0C7D1',
    },
    {
      key: 'bronze',
      label: '銅錢包',
      shortLabel: '銅',
      balance: Number.isFinite(user.bronzeBalance) ? Number(user.bronzeBalance) : DEFAULT_WALLET_BALANCE,
      color: '#D08A4A',
    },
  ]
}
