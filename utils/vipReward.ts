import type { WalletKey } from '~/utils/wallets'

export interface VipReward {
  wallet: Exclude<WalletKey, 'gold'>
  amount: number
}

/**
 * Converts the existing, centrally managed VIP reward label into the wallet
 * operation used by the Web prototype. Keeping the label in siteContent means
 * copy changes remain visible in the overview while this parser provides the
 * numeric value required by the mock wallet.
 */
export function resolveVipReward(level: number, label: string): VipReward | null {
  if (level <= 0 || label === '無') return null

  const wallet = label.includes('銅幣')
    ? 'bronze'
    : label.includes('銀幣')
      ? 'silver'
      : null
  const amountText = label.match(/[\d,]+/)?.[0]
  const amount = amountText ? Number(amountText.replace(/,/g, '')) : 0

  if (!wallet || !Number.isFinite(amount) || amount <= 0) return null
  return { wallet, amount }
}
