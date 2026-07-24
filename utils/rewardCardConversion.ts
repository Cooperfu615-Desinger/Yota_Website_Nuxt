export interface RewardCardConversionResult {
  originalBalance: number
  convertedAmount: number
  recoveredAmount: number
}

export function calculateRewardCardConversion(
  currentBalance: number,
  conversionLimit: number,
): RewardCardConversionResult {
  const originalBalance = Math.max(0, Math.floor(currentBalance))
  const normalizedLimit = Math.max(0, Math.floor(conversionLimit))
  const convertedAmount = Math.min(originalBalance, normalizedLimit)

  return {
    originalBalance,
    convertedAmount,
    recoveredAmount: originalBalance - convertedAmount,
  }
}
