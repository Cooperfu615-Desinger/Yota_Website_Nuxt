import test from 'node:test'
import assert from 'node:assert/strict'
import { applyAccountBinding, createMockEmailCode, isSixDigitCode, isValidBindingEmail, matchesBindingCode, normalizeAccountBindings } from '../utils/accountBindings.ts'

const identity = (overrides = {}) => ({
  id: 'P10000', account: 'binding888', authProvider: 'guest', name: '綁定測試',
  phone: '', email: '', emailLocked: false, birthday: '1990-01-01', bio: '原簡介',
  vip: 0, invitationCode: '', balance: 100, silverBalance: 200, bronzeBalance: 300,
  accountBindings: normalizeAccountBindings(undefined, 'guest', ''), ...overrides,
})
const identityKey = user => `${user.id}:${user.account}:${user.authProvider}`

test('legacy bindings survive and a stored Email alone remains unverified', () => {
  assert.deepEqual(normalizeAccountBindings({ phone: true, google: true, line: true }, 'account', 'old@example.test'),
    { phone: true, email: false, google: true, apple: false, facebook: false, line: true })
  assert.equal(normalizeAccountBindings({ email: true }, 'account', '').email, false)
  assert.equal(normalizeAccountBindings({ email: true }, 'account', 'bad').email, false)
  assert.equal(normalizeAccountBindings({ email: true }, 'account', ' valid@example.test ').email, true)
})

test('only missing flags are initialized from the phone or social login source', () => {
  for (const provider of ['phone', 'google', 'apple', 'facebook']) {
    const normalized = normalizeAccountBindings(undefined, provider, '')
    assert.equal(normalized[provider], true)
    assert.equal(Object.values(normalized).filter(Boolean).length, 1)
    assert.equal(normalizeAccountBindings({ [provider]: false }, provider, '')[provider], false)
  }
  assert.equal(normalizeAccountBindings(undefined, 'line', '').line, false)
})

test('Email and six digit codes preserve leading zeroes and reject invalid input', () => {
  assert.equal(isValidBindingEmail(' member@example.test '), true)
  for (const value of ['', 'wrong', 'a b@example.test', 'a@b']) assert.equal(isValidBindingEmail(value), false)
  assert.equal(createMockEmailCode(() => 0), '000000')
  assert.equal(createMockEmailCode(() => 0.000123), '000123')
  assert.equal(createMockEmailCode(() => 0.9999999), '999999')
  assert.equal(matchesBindingCode('000123', '000123'), true)
  for (const value of ['123', '12345', '1234567', 'abc123', '１２３４５６']) assert.equal(isSixDigitCode(value), false)
  assert.equal(matchesBindingCode('000123', '123000'), false)
  assert.equal(matchesBindingCode('', ''), false)
})

test('consecutive bindings merge without replacing identity, profile or assets', () => {
  const original = identity({ accountBindings: normalizeAccountBindings({ line: true }, 'guest', '') })
  let next = original
  for (const request of [
    { provider: 'google' }, { provider: 'email', value: ' member@example.test ' },
    { provider: 'phone', value: '0912345678' }, { provider: 'apple' }, { provider: 'facebook' },
  ]) next = applyAccountBinding(next, identityKey(original), request)
  assert.deepEqual(next.accountBindings, { phone: true, email: true, google: true, apple: true, facebook: true, line: true })
  assert.equal(next.phone, '0912345678')
  assert.equal(next.email, 'member@example.test')
  assert.equal(next.emailLocked, true)
  for (const key of ['id', 'account', 'authProvider', 'name', 'birthday', 'bio', 'vip', 'invitationCode', 'balance', 'silverBalance', 'bronzeBalance']) {
    assert.equal(next[key], original[key])
  }
  assert.equal(original.accountBindings.email, false)
})

test('repeated, stale identities, invalid contacts and unsupported binding requests are ignored', () => {
  const user = identity()
  for (const provider of ['line', 'unknown', '__proto__']) {
    assert.equal(applyAccountBinding(user, identityKey(user), { provider }), user)
  }
  for (const changed of [{ id: 'other' }, { account: 'other' }, { authProvider: 'account' }]) {
    assert.equal(applyAccountBinding(user, identityKey({ ...user, ...changed }), { provider: 'google' }), user)
  }
  assert.equal(applyAccountBinding(user, identityKey(user), { provider: 'email', value: 'bad' }), user)
  assert.equal(applyAccountBinding(user, identityKey(user), { provider: 'phone', value: '0812345678' }), user)
  assert.equal(applyAccountBinding(user, identityKey(user), { provider: 'phone', value: ' 0912345678 ' }), user)
  const emailBound = applyAccountBinding(user, identityKey(user), { provider: 'email', value: 'first@example.test' })
  assert.equal(applyAccountBinding(emailBound, identityKey(user), { provider: 'email', value: 'second@example.test' }), emailBound)
  const socialBound = applyAccountBinding(user, identityKey(user), { provider: 'google' })
  assert.equal(applyAccountBinding(socialBound, identityKey(user), { provider: 'google' }), socialBound)
})

test('legacy locked Email can be verified at its original address and cannot be replaced', () => {
  const legacy = identity({ email: ' old@example.test ', emailLocked: true })
  assert.equal(applyAccountBinding(legacy, identityKey(legacy), { provider: 'email', value: 'new@example.test' }), legacy)
  const verified = applyAccountBinding(legacy, identityKey(legacy), { provider: 'email', value: 'old@example.test' })
  assert.equal(verified.email, 'old@example.test')
  assert.equal(verified.emailLocked, true)
  assert.equal(verified.accountBindings.email, true)
  assert.equal(legacy.accountBindings.email, false)
})
