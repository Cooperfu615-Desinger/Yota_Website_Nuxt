const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function isInvitationCode(value: unknown): value is string {
  return typeof value === 'string' && /^[A-HJ-NP-Z2-9]{8}$/.test(value)
}

/** 產生玩家專屬邀請碼；正式環境的全域唯一性由後端負責。 */
export function createInvitationCode() {
  let code = ''
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    while (code.length < 8) {
      const bytes = crypto.getRandomValues(new Uint8Array(16))
      for (const byte of bytes) {
        const limit = Math.floor(256 / ALPHABET.length) * ALPHABET.length
        if (byte >= limit) continue
        code += ALPHABET[byte % ALPHABET.length]
        if (code.length === 8) break
      }
    }
    return code
  }

  // Nuxt SSG 伺服器預渲染僅作穩定 fallback，登入後會在瀏覽器端產生真正的新碼。
  return 'YOTA7K2M'
}

export function resolveInvitationCode(isGuest: boolean, stored?: unknown) {
  if (isGuest) return ''
  return isInvitationCode(stored) ? stored : createInvitationCode()
}
