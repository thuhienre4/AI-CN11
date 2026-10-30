import { beforeEach, describe, expect, it, vi } from 'vitest'

const memoryStorage = () => {
  let data = {}
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value) },
    removeItem: (key) => { delete data[key] },
    clear: () => { data = {} },
  }
}
globalThis.localStorage = memoryStorage()

vi.mock('../services/api', () => ({
  authAPI: { login: vi.fn(), register: vi.fn(), getMe: vi.fn() },
  coursesAPI: {},
  lessonsAPI: {},
  setUnauthorizedHandler: vi.fn(),
}))

const { authAPI } = await import('../services/api')
const { useAuthStore } = await import('./index')

const offline = () => Promise.reject(new Error('Network Error'))
const jwtWithExp = (secondsFromNow) =>
  `h.${btoa(JSON.stringify({ sub: 'an', exp: Math.floor(Date.now() / 1000) + secondsFromNow }))}.s`

const student = { username: 'minhan', email: 'an@x.vn', password: 'matkhau123', full_name: 'Minh An', role: 'student', student_class: '11A1' }

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  useAuthStore.getState().logout()
})

describe('offline auth', () => {
  it('rejects unknown credentials instead of creating a demo account', async () => {
    authAPI.login.mockImplementation(offline)
    const result = await useAuthStore.getState().login('ai-cung-duoc', 'bat-ky')
    expect(result.success).toBe(false)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('registers, stores only a password hash, and signs in automatically', async () => {
    authAPI.register.mockImplementation(offline)
    authAPI.login.mockImplementation(offline)
    const result = await useAuthStore.getState().register(student)
    expect(result.success).toBe(true)
    expect(useAuthStore.getState().user.username).toBe('minhan')
    const stored = localStorage.getItem('local_auth_users')
    expect(stored).not.toContain('matkhau123')
    expect(JSON.parse(stored)[0].password_hash).toBeTruthy()
  })

  it('accepts email in any case, rejects a wrong password', async () => {
    authAPI.register.mockImplementation(offline)
    authAPI.login.mockImplementation(offline)
    await useAuthStore.getState().register(student)
    useAuthStore.getState().logout()
    expect((await useAuthStore.getState().login('AN@X.VN', 'sai-mat-khau')).success).toBe(false)
    expect((await useAuthStore.getState().login(' AN@X.VN ', 'matkhau123')).success).toBe(true)
  })

  it('upgrades legacy plain-text accounts to a hash on login', async () => {
    authAPI.login.mockImplementation(offline)
    localStorage.setItem('local_auth_users', JSON.stringify([{ id: 1, ...student }]))
    expect((await useAuthStore.getState().login('minhan', 'matkhau123')).success).toBe(true)
    expect(localStorage.getItem('local_auth_users')).not.toContain('matkhau123')
  })

  it('reports duplicate usernames on the right field', async () => {
    authAPI.register.mockImplementation(offline)
    authAPI.login.mockImplementation(offline)
    await useAuthStore.getState().register(student)
    useAuthStore.getState().logout()
    const result = await useAuthStore.getState().register({ ...student, email: 'khac@x.vn', username: 'MinhAn' })
    expect(result).toMatchObject({ success: false, field: 'username' })
  })
})

describe('server auth', () => {
  it('shows a friendly message on 401 and keeps the user signed out', async () => {
    authAPI.login.mockRejectedValue({ response: { status: 401, data: { detail: 'x' } } })
    const result = await useAuthStore.getState().login('minhan', 'sai')
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/Sai tên đăng nhập/)
  })

  it('maps a 409 conflict to the email field', async () => {
    authAPI.register.mockRejectedValue({ response: { status: 409, data: { detail: 'Email đã được đăng ký.' } } })
    expect(await useAuthStore.getState().register(student)).toMatchObject({ success: false, field: 'email' })
  })

  it('flattens 422 validation errors into readable text', async () => {
    authAPI.register.mockRejectedValue({
      response: { status: 422, data: { detail: 'Request validation failed.', errors: [{ msg: 'Value error, Học sinh cần nhập lớp.' }] } },
    })
    expect((await useAuthStore.getState().register(student)).error).toBe('Học sinh cần nhập lớp.')
  })

  it('expires the session when the stored token is past its exp', async () => {
    authAPI.login.mockResolvedValue({ data: { access_token: jwtWithExp(-60), user: { username: 'an', role: 'student' } } })
    await useAuthStore.getState().login('an', 'matkhau123')
    await useAuthStore.getState().verifySession()
    expect(useAuthStore.getState()).toMatchObject({ isAuthenticated: false, sessionExpired: true })
    expect(localStorage.getItem('token')).toBeNull()
  })
})
