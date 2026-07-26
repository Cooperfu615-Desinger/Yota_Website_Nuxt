export interface WalletSpendResult {
  spentAmount: number
  remainingBalance: number
}

export function calculateWalletSpend(balance: number, amount: number): WalletSpendResult | null {
  const normalizedBalance = Number.isFinite(balance) ? Math.max(0, Math.floor(balance)) : 0
  const normalizedAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0
  if (!normalizedAmount || normalizedAmount > normalizedBalance) return null

  return {
    spentAmount: normalizedAmount,
    remainingBalance: normalizedBalance - normalizedAmount,
  }
}
