import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createRequire, registerHooks } from 'node:module'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const appStateUrl = pathToFileURL(resolve('composables/useAppState.ts')).href
// Exercise the real composable with Nuxt auto-imports and browser storage in memory.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('~/')) specifier = pathToFileURL(resolve(specifier.slice(2))).href
    try { return next(specifier, context) } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('file:')) return next(`${specifier}.ts`, context)
      throw error
    }
  },
  load(url, context, next) {
    if (url === appStateUrl) {
      return { format: 'module-typescript', source: readFileSync(new URL(url), 'utf8').replaceAll('import.meta.client', 'true'), shortCircuit: true }
    }
    return next(url, context)
  },
})
const { ref, computed } = createRequire(import.meta.url)('vue')
const states = new Map()
const storage = new Map()
let financial
globalThis.computed = computed
globalThis.useState = (key, seed) => {
  if (!states.has(key)) states.set(key, ref(seed()))
  return states.get(key)
}
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
}
globalThis.useFinancialState = () => financial
globalThis.useMessageCentersState = () => ({ resetMessageCenters() {} })
globalThis.useGiftState = () => ({ resetGiftState() {} })
globalThis.useSocialState = () => ({ resetSocialState() {} })
globalThis.useSupportTicketState = () => ({ resetSupportTicketState() {} })
const { useAppState } = await import('../composables/useAppState.ts')

const storedIdentity = (overrides = {}) => ({
  id: 'P10000', account: 'binding888', authProvider: 'account', name: '綁定測試', vip: 6,
  avatar: '👤', avatarId: 1, birthday: '1990-01-01', birthdayLocked: true, bio: '原簡介',
  email: '', emailLocked: false, phone: '', invitationCode: 'ABCD2345',
  accountBindings: { phone: false, google: false, apple: false, facebook: false, line: false },
  ...overrides,
})
const identityKey = user => `${user.id}:${user.account}:${user.authProvider}`
const saved = () => JSON.parse(storage.get('jh_userInfo') ?? 'null')
function fresh(stored, loggedIn = Boolean(stored)) {
  states.clear()
  storage.clear()
  financial = {
    balance: ref(19000), silverBalance: ref(37000), bronzeBalance: ref(51000), vaultBalance: ref(2000), transactions: ref([]),
    resetFinancialState() {},
  }
  if (stored) storage.set('jh_userInfo', JSON.stringify(stored))
  if (loggedIn) storage.set('jh_isLoggedIn', 'true')
  const app = useAppState()
  app.initFromStorage()
  return app
}

test('signed-out completion does not write contact or binding data', () => {
  const app = fresh()
  const previous = app.profile.value
  assert.equal(app.completeAccountBinding({ provider: 'google' }, identityKey(previous)), false)
  assert.equal(app.completeAccountBinding({ provider: 'email', value: 'member@example.test' }, identityKey(previous)), false)
  assert.equal(app.profile.value, previous)
  assert.equal(storage.has('jh_userInfo'), false)
})

test('real composable migrates legacy bindings, verifies only the old Email and restores the result', () => {
  const app = fresh(storedIdentity({ email: 'old@example.test', emailLocked: true, phone: '0912345678', accountBindings: { phone: true, google: true, line: true } }))
  assert.deepEqual({ ...app.profile.value.accountBindings }, { phone: true, email: false, google: true, apple: false, facebook: false, line: true })
  assert.equal(saved().accountBindings.email, false)
  const expected = identityKey(app.profile.value)
  assert.equal(app.completeAccountBinding({ provider: 'email', value: 'new@example.test' }, expected), false)
  assert.equal(app.completeAccountBinding({ provider: 'email', value: 'old@example.test' }, expected), true)
  const persisted = saved()
  assert.equal(persisted.email, 'old@example.test')
  assert.equal(persisted.accountBindings.email, true)
  assert.equal(persisted.emailLocked, true)
  const restored = fresh(persisted)
  assert.deepEqual({ ...restored.profile.value.accountBindings }, persisted.accountBindings)
  assert.equal(restored.profile.value.phone, '0912345678')
})

test('consecutive binding and profile updates share state without changing guest identity or assets', () => {
  const app = fresh(storedIdentity({ authProvider: 'guest', vip: 0, invitationCode: '' }))
  const original = { ...app.userInfo.value }
  const expected = identityKey(original)
  assert.equal(app.completeAccountBinding({ provider: 'google' }, expected), true)
  app.updateProfile({ name: '更新暱稱', bio: '更新簡介' })
  assert.equal(app.completeAccountBinding({ provider: 'apple' }, expected), true)
  assert.equal(app.completeAccountBinding({ provider: 'email', value: ' member@example.test ' }, expected), true)
  assert.equal(app.completeAccountBinding({ provider: 'phone', value: '0912345678' }, expected), true)
  assert.equal(app.completeAccountBinding({ provider: 'facebook' }, expected), true)
  assert.deepEqual({ ...app.profile.value.accountBindings }, { phone: true, email: true, google: true, apple: true, facebook: true, line: false })
  assert.equal(app.profile.value.name, '更新暱稱')
  assert.equal(app.profile.value.bio, '更新簡介')
  assert.equal(app.profile.value.email, 'member@example.test')
  for (const key of ['id', 'account', 'authProvider', 'vip', 'invitationCode', 'balance', 'silverBalance', 'bronzeBalance', 'vaultBalance']) {
    assert.equal(app.userInfo.value[key], original[key])
  }
  assert.equal(useAppState().profile.value, app.profile.value)
  assert.deepEqual(saved().accountBindings, { ...app.profile.value.accountBindings })
})

test('generic profile updates cannot bypass verified contact or identity rules even with extra JavaScript fields', () => {
  const app = fresh(storedIdentity())
  const original = { ...app.profile.value, accountBindings: { ...app.profile.value.accountBindings } }
  app.updateProfile({
    name: '可儲存的暱稱', bio: '可儲存的簡介',
    email: 'bypass@example.test', emailLocked: true, phone: '0912345678',
    accountBindings: { phone: true, email: true, google: true, apple: true, facebook: true, line: true },
    id: 'another', account: 'another', authProvider: 'google', vip: 15, invitationCode: 'ZZZZ2345',
  })
  assert.equal(app.profile.value.name, '可儲存的暱稱')
  assert.equal(app.profile.value.bio, '可儲存的簡介')
  for (const key of ['email', 'emailLocked', 'phone', 'id', 'account', 'authProvider', 'vip', 'invitationCode']) {
    assert.equal(app.profile.value[key], original[key])
  }
  assert.deepEqual({ ...app.profile.value.accountBindings }, original.accountBindings)
  assert.equal(saved().email, original.email)
})

test('unsupported or repeated completion and callbacks from replaced login identities are rejected', () => {
  const app = fresh(storedIdentity())
  const expected = identityKey(app.profile.value)
  const previous = app.profile.value
  for (const provider of ['line', 'unknown', '__proto__']) {
    assert.equal(app.completeAccountBinding({ provider }, expected), false)
    assert.equal(app.profile.value, previous)
  }
  assert.equal(app.completeAccountBinding({ provider: 'google' }, expected), true)
  assert.equal(app.completeAccountBinding({ provider: 'google' }, expected), false)
  app.login('另一玩家', 'account', true, 'other888')
  assert.notEqual(identityKey(app.profile.value), expected)
  assert.equal(app.completeAccountBinding({ provider: 'apple' }, expected), false)
  assert.equal(app.profile.value.accountBindings.apple, false)
})

test('social login initializes its own binding without Email verification; guest starts with none', () => {
  for (const provider of ['google', 'apple', 'facebook']) {
    const app = fresh()
    app.login('社群玩家', provider, true, `${provider}-player`)
    assert.equal(app.profile.value.accountBindings[provider], true)
    assert.equal(app.profile.value.accountBindings.email, false)
    assert.equal(app.profile.value.email, '')
    assert.equal(Object.values(app.profile.value.accountBindings).filter(Boolean).length, 1)
  }
  const guest = fresh()
  guest.login('訪客', 'guest')
  assert.equal(Object.values(guest.profile.value.accountBindings).filter(Boolean).length, 0)
  assert.equal(guest.profile.value.vip, 0)
  assert.equal(guest.profile.value.invitationCode, '')
})

test('logout clears completed Mock identity data instead of restoring a permanent linked account', () => {
  const app = fresh(storedIdentity())
  app.completeAccountBinding({ provider: 'email', value: 'member@example.test' }, identityKey(app.profile.value))
  app.logout()
  assert.equal(app.isLoggedIn.value, false)
  assert.equal(storage.has('jh_userInfo'), false)
  assert.equal(storage.has('jh_isLoggedIn'), false)
  app.login('重新登入', 'account', true, 'binding888')
  assert.equal(app.profile.value.accountBindings.email, false)
  assert.equal(app.profile.value.email, 'player888@example.com')
  assert.notEqual(app.profile.value.email, 'member@example.test')
})
