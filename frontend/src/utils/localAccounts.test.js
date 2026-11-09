import { describe, expect, it } from 'vitest'

import { checkLocalPassword, findLocalUser, hashPassword, readLocalUsers, writeLocalUsers } from './localAccounts'

const memoryStorage = () => {
  const store = {}
  return { getItem: (key) => store[key] ?? null, setItem: (key, value) => { store[key] = String(value) }, dump: () => store }
}

describe('offline accounts on a shared computer', () => {
  it('never stores the password itself, and a salt makes equal passwords look different', async () => {
    const first = await hashPassword('MatKhau2026')
    const second = await hashPassword('MatKhau2026')
    expect(first.password_hash).toHaveLength(64)
    expect(first.password_hash).not.toBe(second.password_hash)
    expect(JSON.stringify(first)).not.toContain('MatKhau2026')
  })

  it('accepts the right password and refuses a wrong one', async () => {
    const record = { username: 'an', ...(await hashPassword('MatKhau2026')) }
    expect((await checkLocalPassword(record, 'MatKhau2026')).ok).toBe(true)
    expect((await checkLocalPassword(record, 'matkhau2026')).ok).toBe(false)
    expect((await checkLocalPassword(undefined, 'MatKhau2026')).ok).toBe(false)
  })

  it('turns an old plain-text record into a hashed one at the first correct login', async () => {
    const legacy = { username: 'an', password: 'cu-123456' }
    expect((await checkLocalPassword(legacy, 'sai')).ok).toBe(false)
    const { ok, record } = await checkLocalPassword(legacy, 'cu-123456')
    expect(ok).toBe(true)
    expect(record.password).toBeUndefined()
    expect((await checkLocalPassword(record, 'cu-123456')).ok).toBe(true)
  })

  it('finds a user by name or email and survives broken storage', () => {
    const storage = memoryStorage()
    writeLocalUsers([{ username: 'an', email: 'an@example.com' }], storage)
    const users = readLocalUsers(storage)
    expect(findLocalUser(users, 'an@example.com').username).toBe('an')
    storage.setItem('local_auth_users', '{oops')
    expect(readLocalUsers(storage)).toEqual([])
  })
})
