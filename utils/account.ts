export const ACCOUNT_MIN_HALF_WIDTH_LENGTH = 4
export const ACCOUNT_MAX_HALF_WIDTH_LENGTH = 20

const ACCOUNT_CHARACTERS = /^[A-Za-z0-9\p{Script=Han}]+$/u

export function getAccountHalfWidthLength(value: string) {
  return Array.from(value).reduce((length, character) => (
    length + (character.codePointAt(0)! <= 0x7f ? 1 : 2)
  ), 0)
}

export function getAccountValidationError(value: string) {
  if (!value) return '請輸入帳號'
  if (value !== value.trim() || !ACCOUNT_CHARACTERS.test(value)) {
    return '帳號僅能使用中英文與數字，不可包含空格或特殊符號'
  }

  const halfWidthLength = getAccountHalfWidthLength(value)
  if (halfWidthLength < ACCOUNT_MIN_HALF_WIDTH_LENGTH) {
    return `帳號至少需要 ${ACCOUNT_MIN_HALF_WIDTH_LENGTH} 個半形字元`
  }
  if (halfWidthLength > ACCOUNT_MAX_HALF_WIDTH_LENGTH) {
    return `帳號最多 ${ACCOUNT_MAX_HALF_WIDTH_LENGTH} 個半形字元`
  }
  return ''
}

export function isAccountValid(value: string) {
  return getAccountValidationError(value) === ''
}
