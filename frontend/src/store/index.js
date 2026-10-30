import { create } from 'zustand'
import { authAPI, coursesAPI, lessonsAPI, setUnauthorizedHandler } from '../services/api'

const TOKEN_KEY = 'token'
const LOCAL_TOKEN_PREFIX = 'local-token-'
const LOCAL_USERS_KEY = 'local_auth_users'
const LOCAL_CURRENT_USER_KEY = 'local_auth_current_user'
const LOCAL_PROFILE_META_KEY = 'local_profile_meta'
const MAX_TIMEOUT_MS = 2 ** 31 - 1

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

const getLocalUsers = () => readJSON(LOCAL_USERS_KEY, [])

const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

const getProfileMeta = () => readJSON(LOCAL_PROFILE_META_KEY, {})

const saveProfileMeta = (username, meta) => {
  const profiles = getProfileMeta()
  profiles[username] = {
    ...(profiles[username] || {}),
    ...meta,
  }
  localStorage.setItem(LOCAL_PROFILE_META_KEY, JSON.stringify(profiles))
}

const getProfileForUser = (username) => getProfileMeta()[username] || {}

const normalizeRole = (role) => role || 'student'
const normalizeIdentifier = (value = '') => value.trim().toLowerCase()

// ============= Session token helpers =============
const decodeTokenExpiry = (token) => {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' ? exp * 1000 : Infinity
  } catch {
    return null
  }
}

const isLocalToken = (token) => Boolean(token?.startsWith(LOCAL_TOKEN_PREFIX))

const isTokenUsable = (token) => {
  if (!token) return false
  if (isLocalToken(token)) return true
  const expiresAt = decodeTokenExpiry(token)
  return expiresAt !== null && expiresAt > Date.now()
}

const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(LOCAL_CURRENT_USER_KEY)
}

const persistSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user))
}

const readInitialSession = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  const user = readJSON(LOCAL_CURRENT_USER_KEY, null)
  if (!isTokenUsable(token) || !user) {
    clearStoredSession()
    return { token: null, user: null, isAuthenticated: false }
  }
  return { token, user, isAuthenticated: true }
}

const isBackendUnavailable = (error) =>
  !error.response || [404, 405].includes(error.response.status) || error.response.status >= 500

// The API's 422 handler returns field errors in `errors` (FastAPI's default puts them in `detail`);
// other errors carry a string `detail`.
const getErrorMessage = (error, fallback) => {
  const data = error.response?.data || {}
  const validationErrors = Array.isArray(data.errors) ? data.errors : Array.isArray(data.detail) ? data.detail : null
  if (validationErrors?.length) {
    return validationErrors.map((item) => item.msg?.replace(/^Value error, /, '')).filter(Boolean).join(' ') || fallback
  }
  return typeof data.detail === 'string' ? data.detail : fallback
}

// ============= Offline (browser-only) accounts =============
// Used when the API is unreachable, e.g. the static GitHub Pages build.
// Passwords are stored as salted SHA-256 digests, never in plain text.
const fallbackDigest = (text) => {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < text.length; i += 1) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return `fb-${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`
}

const hashLocalPassword = async (password, salt) => {
  const input = `${salt}:${password}`
  if (!globalThis.crypto?.subtle) return fallbackDigest(input)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const createSalt = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`

const toSafeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  full_name: user.full_name,
  role: normalizeRole(user.role),
  student_class: user.student_class || '',
  is_active: true,
})

const saveLocalRegistration = async ({ username, email, password, full_name, role, student_class }) => {
  const users = getLocalUsers()
  if (users.some((user) => normalizeIdentifier(user.username) === normalizeIdentifier(username))) {
    return { success: false, error: 'Tên đăng nhập đã được sử dụng.', field: 'username' }
  }
  if (users.some((user) => normalizeIdentifier(user.email) === normalizeIdentifier(email))) {
    return { success: false, error: 'Email đã được đăng ký.', field: 'email' }
  }

  const salt = createSalt()
  users.push({
    id: Date.now(),
    username,
    email,
    password_salt: salt,
    password_hash: await hashLocalPassword(password, salt),
    full_name,
    role: normalizeRole(role),
    student_class: student_class || '',
    is_active: true,
  })
  saveLocalUsers(users)
  saveProfileMeta(username, { role: normalizeRole(role), student_class: student_class || '', full_name })
  return { success: true }
}

const verifyLocalPassword = async (user, password) => {
  if (user.password_hash) {
    return (await hashLocalPassword(password, user.password_salt)) === user.password_hash
  }
  // Legacy accounts stored the raw password; accept once, then upgrade to a hash.
  return typeof user.password === 'string' && user.password === password
}

const loginLocalUser = async (usernameOrEmail, password) => {
  const users = getLocalUsers()
  const identifier = normalizeIdentifier(usernameOrEmail)
  const index = users.findIndex(
    (item) => normalizeIdentifier(item.username) === identifier || normalizeIdentifier(item.email) === identifier
  )
  const user = users[index]

  if (!user || !(await verifyLocalPassword(user, password))) {
    return { success: false }
  }

  if (!user.password_hash) {
    const salt = createSalt()
    const upgraded = { ...user, password_salt: salt, password_hash: await hashLocalPassword(password, salt) }
    delete upgraded.password
    users[index] = upgraded
    saveLocalUsers(users)
  }

  return {
    success: true,
    access_token: `${LOCAL_TOKEN_PREFIX}${user.username}-${Date.now()}`,
    user: toSafeUser(user),
  }
}

// ============= Auth Store =============
let expiryTimer = null

const scheduleExpiry = (token, onExpire) => {
  clearTimeout(expiryTimer)
  if (!token || isLocalToken(token)) return
  const expiresAt = decodeTokenExpiry(token)
  if (expiresAt === null || expiresAt === Infinity) return
  expiryTimer = setTimeout(onExpire, Math.min(Math.max(expiresAt - Date.now(), 0), MAX_TIMEOUT_MS))
}

const INVALID_CREDENTIALS =
  'Sai tên đăng nhập/email hoặc mật khẩu. Nếu chưa có tài khoản, hãy tạo tài khoản mới.'
const OFFLINE_INVALID_CREDENTIALS =
  'Không kết nối được máy chủ. Ở chế độ ngoại tuyến chỉ đăng nhập được bằng tài khoản đã tạo trên trình duyệt này.'

export const useAuthStore = create((set, get) => ({
  ...readInitialSession(),
  isLoading: false,
  error: null,
  sessionExpired: false,

  startSession: (token, user) => {
    persistSession(token, user)
    scheduleExpiry(token, get().expireSession)
    set({ user, token, isAuthenticated: true, isLoading: false, error: null, sessionExpired: false })
  },

  login: async (identifier, password) => {
    const usernameOrEmail = identifier.trim()
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login({ username: usernameOrEmail, password })
      const { access_token, user } = response.data
      const profileMeta = getProfileForUser(user.username)
      const safeUser = {
        ...user,
        role: normalizeRole(user.role),
        student_class: user.student_class || profileMeta.student_class || '',
        avatar: profileMeta.avatar || user.avatar,
      }
      get().startSession(access_token, safeUser)
      return { success: true, user: safeUser }
    } catch (error) {
      if (isBackendUnavailable(error)) {
        const result = await loginLocalUser(usernameOrEmail, password)
        if (result.success) {
          const user = { ...result.user, avatar: getProfileForUser(result.user.username).avatar }
          get().startSession(result.access_token, user)
          return { success: true, user, offline: true }
        }
        set({ error: OFFLINE_INVALID_CREDENTIALS, isLoading: false })
        return { success: false, error: OFFLINE_INVALID_CREDENTIALS, offline: true }
      }

      const message = [401, 422].includes(error.response?.status)
        ? INVALID_CREDENTIALS
        : getErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.')
      set({ error: message, isLoading: false })
      return { success: false, error: message }
    }
  },

  register: async ({ username, email, password, full_name, role = 'student', student_class = '' }) => {
    const payload = {
      username: username.trim(),
      email: normalizeIdentifier(email),
      password,
      full_name: full_name.trim(),
      role,
      student_class: role === 'student' ? student_class.trim() : '',
    }
    set({ isLoading: true, error: null })
    try {
      await authAPI.register(payload)
    } catch (error) {
      if (!isBackendUnavailable(error)) {
        const message = getErrorMessage(error, 'Tạo tài khoản thất bại. Vui lòng thử lại.')
        const field = /email/i.test(message) ? 'email' : /tên đăng nhập|username/i.test(message) ? 'username' : undefined
        set({ error: message, isLoading: false })
        return { success: false, error: message, field }
      }
      const result = await saveLocalRegistration(payload)
      if (!result.success) {
        set({ error: result.error, isLoading: false })
        return result
      }
    }

    saveProfileMeta(payload.username, { role, student_class: payload.student_class, full_name: payload.full_name })
    // Sign the new user in right away instead of sending them back to the login form.
    const loginResult = await get().login(payload.username, password)
    return loginResult.success ? loginResult : { success: true, needsLogin: true }
  },

  // Re-validate a stored backend token and refresh the cached profile.
  verifySession: async () => {
    const { token } = get()
    if (!token || isLocalToken(token)) return
    if (!isTokenUsable(token)) {
      get().expireSession()
      return
    }
    scheduleExpiry(token, get().expireSession)
    try {
      const { data } = await authAPI.getMe()
      const current = get().user || {}
      const user = { ...current, ...data, role: normalizeRole(data.role), avatar: current.avatar }
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(user))
      set({ user })
    } catch {
      // 401 is handled by the API interceptor; network errors keep the cached session.
    }
  },

  expireSession: () => {
    clearTimeout(expiryTimer)
    clearStoredSession()
    set({ user: null, token: null, isAuthenticated: false, sessionExpired: true })
  },

  logout: () => {
    clearTimeout(expiryTimer)
    clearStoredSession()
    set({ user: null, token: null, isAuthenticated: false, sessionExpired: false, error: null })
  },

  updateAvatar: (avatar) => {
    const user = get().user
    if (!user) return
    const updatedUser = { ...user, avatar }
    saveProfileMeta(user.username, { avatar })
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(updatedUser))
    set({ user: updatedUser })
  },

  clearError: () => set({ error: null, sessionExpired: false }),
}))

setUnauthorizedHandler(() => {
  if (useAuthStore.getState().isAuthenticated) useAuthStore.getState().expireSession()
})

// Courses Store
export const useCoursesStore = create((set) => ({
  courses: [],
  isLoading: false,
  error: null,

  fetchCourses: async (skip = 0, limit = 10) => {
    set({ isLoading: true, error: null })
    try {
      const response = await coursesAPI.list(skip, limit)
      set({ courses: response.data, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
}))

// Lessons Store
export const useLessonsStore = create((set) => ({
  lessons: [],
  currentLesson: null,
  isLoading: false,
  error: null,

  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),

  fetchLessons: async (courseId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await lessonsAPI.list(courseId)
      set({ lessons: response.data, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },
}))

// Quiz Store
export const useQuizStore = create((set) => ({
  currentQuestion: null,
  answers: [],
  score: 0,
  isLoading: false,
  error: null,

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  addAnswer: (answer) => set((state) => ({
    answers: [...state.answers, answer],
  })),

  resetQuiz: () => set({
    currentQuestion: null,
    answers: [],
    score: 0,
    error: null,
  }),
}))

// Chat Store
export const useChatStore = create((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  setMessages: (messages) => set({ messages }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}))
