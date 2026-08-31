export const MEMBER_NICKNAME_MAX_LENGTH = 20

export function validateMemberNickname(value: string) {
  const name = value.trim()
  if (!name) return '請輸入暱稱'
  if (Array.from(name).length > MEMBER_NICKNAME_MAX_LENGTH) return `暱稱最多 ${MEMBER_NICKNAME_MAX_LENGTH} 個字元`
  return ''
}

function localDateValue(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function validateMemberBirthday(value: string, today = new Date()) {
  if (!value) return ''
  const date = localDateValue(value)
  if (!date) return '請輸入有效的生日'
  const min = new Date(1900, 0, 1)
  const adultCutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  if (date < min || date > adultCutoff) return '生日需介於 1900-01-01 與年滿 18 歲之間'
  return ''
}

export function validateMemberEmail(value: string) {
  if (!value.trim()) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : '請輸入有效的電子郵件'
}
