export const VAULT_TRANSFER_FEE_RATE = 0.05

export interface VaultTransferSummary {
  amount: number
  fee: number
  actualReceived: number
}

export interface VaultTransferResult extends VaultTransferSummary {
  receiverId: string
}

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount)) return 0
  return Math.max(0, Math.floor(amount))
}

export function calculateVaultTransfer(amount: number): VaultTransferSummary {
  const normalizedAmount = normalizeAmount(amount)
  const fee = Math.floor(normalizedAmount * VAULT_TRANSFER_FEE_RATE)

  return {
    amount: normalizedAmount,
    fee,
    actualReceived: Math.max(0, normalizedAmount - fee),
  }
}

export function canSubmitVaultTransfer(receiverId: string, amount: number, vaultBalance: number) {
  const normalizedReceiverId = receiverId.trim()
  const normalizedAmount = normalizeAmount(amount)
  const normalizedVaultBalance = normalizeAmount(vaultBalance)

  return Boolean(normalizedReceiverId) &&
    normalizedAmount > 0 &&
    normalizedAmount <= normalizedVaultBalance
}
