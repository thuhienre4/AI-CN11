// Accounts kept in this browser for when the app runs without its server. A shared school computer is the
// usual case, so a password is never stored, only a salted PBKDF2 hash, and nobody can take over a name
// that already exists here.

export const LOCAL_USERS_KEY = 'local_auth_users'
const ITERATIONS = 150000

const toHex = (buffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
const fromHex = (hex) => new Uint8Array(hex.match(/../g).map((pair) => parseInt(pair, 16)))

export const canHashLocally = () => Boolean(globalThis.crypto?.subtle)

export const hashPassword = async (password, saltHex = toHex(globalThis.crypto.getRandomValues(new Uint8Array(16)))) => {
  const key = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await globalThis.crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: ITERATIONS },
    key,
    256,
  )
  return { password_hash: toHex(bits), password_salt: saltHex, password_iterations: ITERATIONS }
}

// Constant-time comparison of two hex strings of equal length
const sameHex = (a, b) => {
  if (a.length !== b.length) return false
  let difference = 0
  for (let index = 0; index < a.length; index += 1) difference |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return difference === 0
}

export const readLocalUsers = (storage = globalThis.localStorage) => {
  try {
    const users = JSON.parse(storage.getItem(LOCAL_USERS_KEY) || '[]')
    return Array.isArray(users) ? users : []
  } catch {
    return []
  }
}

export const writeLocalUsers = (users, storage = globalThis.localStorage) => {
  storage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

export const findLocalUser = (users, nameOrEmail) =>
  users.find((user) => user.username === nameOrEmail || user.email === nameOrEmail)

/**
 * Checks a password against a stored record. Records saved before hashing (with a plain "password") are
 * upgraded on the first correct login. Returns {ok, record} where record is what should be stored now.
 */
export const checkLocalPassword = async (record, password) => {
  if (!record) return { ok: false, record }
  if (record.password_hash && record.password_salt) {
    const { password_hash: hash } = await hashPassword(password, record.password_salt)
    return { ok: sameHex(hash, record.password_hash), record }
  }
  if (typeof record.password === 'string') {
    if (record.password !== password) return { ok: false, record }
    const upgraded = { ...record, ...(await hashPassword(password)) }
    delete upgraded.password
    return { ok: true, record: upgraded }
  }
  return { ok: false, record }
}
