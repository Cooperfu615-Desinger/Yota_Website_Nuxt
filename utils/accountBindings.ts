export type SocialBindingProvider = 'google' | 'apple' | 'facebook'

export interface AccountBindingState {
  phone: boolean
  email: boolean
  google: boolean
  apple: boolean
  facebook: boolean
  // Keep legacy WEB data without adding a LINE binding action.
  line: boolean
}

export type AccountBindingRequest =
  | { provider: 'phone' | 'email'; value: string }
  | { provider: SocialBindingProvider }

interface BindingIdentity {
  id: string
  account: string
  authProvider: string
  phone: string
  email: string
  emailLocked: boolean
  accountBindings: AccountBindingState
}

export const isValidBindingEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
export const isSixDigitCode = (code: string) => /^\d{6}$/.test(code)
export const matchesBindingCode = (code: string, expectedCode: string) => isSixDigitCode(code) && code === expectedCode

// A demo code remains a six-character string, including leading zeroes.
export const createMockEmailCode = (random: () => number = Math.random) =>
  Math.floor(random() * 1_000_000).toString().padStart(6, '0')

export const normalizeAccountBindings = (
  stored: Partial<AccountBindingState> | undefined,
  authProvider: string,
  email: string,
): AccountBindingState => ({
  phone: typeof stored?.phone === 'boolean' ? stored.phone : authProvider === 'phone',
  email: stored?.email === true && isValidBindingEmail(email),
  google: typeof stored?.google === 'boolean' ? stored.google : authProvider === 'google',
  apple: typeof stored?.apple === 'boolean' ? stored.apple : authProvider === 'apple',
  facebook: typeof stored?.facebook === 'boolean' ? stored.facebook : authProvider === 'facebook',
  line: typeof stored?.line === 'boolean' ? stored.line : false,
})

/** Only merge the selected binding into the identity that began the flow. */
export const applyAccountBinding = <T extends BindingIdentity>(
  user: T,
  expectedIdentity: string,
  request: AccountBindingRequest,
): T => {
  if (!['phone', 'email', 'google', 'apple', 'facebook'].includes(request.provider)) return user
  const identity = `${user.id}:${user.account}:${user.authProvider}`
  if (identity !== expectedIdentity || user.accountBindings[request.provider]) return user

  if (request.provider === 'phone') {
    if (!/^09\d{8}$/.test(request.value)) return user
    return { ...user, phone: request.value, accountBindings: { ...user.accountBindings, phone: true } }
  }

  if (request.provider === 'email') {
    const email = request.value.trim()
    if (!isValidBindingEmail(email) || (user.email && user.email.trim() !== email)) return user
    return { ...user, email, emailLocked: true, accountBindings: { ...user.accountBindings, email: true } }
  }

  return { ...user, accountBindings: { ...user.accountBindings, [request.provider]: true } }
}
