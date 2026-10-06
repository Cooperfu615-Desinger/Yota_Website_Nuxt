// Preview rules match APP WalletPanel / SilverExchangePreview. No balance mutation.
export function getExchangeableSilver(balance: number, reserved: number, quota: number): number {
  return Math.min(Math.max(0, balance - reserved), Math.max(0, quota))
}

export function isValidSilverPreviewAmount(input: string, maximum: number): boolean {
  const amount = Number(input)
  return input !== '' && Number.isSafeInteger(amount) && amount > 0 && amount <= maximum
}
