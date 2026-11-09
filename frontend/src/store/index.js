import { create } from 'zustand'
import { registrationErrorMessage } from '../utils/apiErrors'
import { authAPI, coursesAPI, lessonsAPI } from '../services/api'
import { canHashLocally, checkLocalPassword, findLocalUser, hashPassword, readLocalUsers, writeLocalUsers } from '../utils/localAccounts'
import { passwordProblem } from '../utils/passwordRules'

const LOCAL_CURRENT_USER_KEY = 'local_auth_current_user'
const LOCAL_PROFILE_META_KEY = 'local_profile_meta'


const getProfileMeta = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PROFILE_META_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveProfileMeta = (username, meta) => {
  const profiles = getProfileMeta()
  profiles[username] = {
    ...(profiles[username] || {}),
    ...meta,
  }
  localStorage.setItem(LOCAL_PROFILE_META_KEY, JSON.stringify(profiles))
}

const getProfileForUser = (username) => getProfileMeta()[username] || {}

const getLocalCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_CURRENT_USER_KEY) || 'null')
  } catch {
    return null
  }
}

const createLocalToken = (username) => `local-token-${username}-${Date.now()}`

const normalizeRole = (role) => role || 'student'

const NO_SAFE_STORAGE = 'Trình duyệt này không lưu được tài khoản ngoại tuyến an toàn. Hãy kết nối máy chủ để đăng nhập.'
const WRONG_LOCAL_LOGIN = 'Sai tài khoản/email hoặc mật khẩu.'

const saveLocalRegistration = async ({ username, email, password, full_name, role, student_class }) => {
  if (!canHashLocally()) return { success: false, error: NO_SAFE_STORAGE }
  const problem = passwordProblem(password, username)
  if (problem) return { success: false, error: problem }
  const users = readLocalUsers()
  if (findLocalUser(users, username) || findLocalUser(users, email)) {
    return { success: false, error: 'Tên đăng nhập hoặc email đã có trên máy này.' }
  }

  users.push({
    id: Date.now(),
    username,
    email,
    ...(await hashPassword(password)),
    full_name,
    role: normalizeRole(role),
    student_class: student_class || '',
    is_active: true,
  })
  writeLocalUsers(users)
  saveProfileMeta(username, {
    role: normalizeRole(role),
    student_class: student_class || '',
    full_name,
  })

  return { success: true }
}

const startLocalSession = (user) => {
  const access_token = createLocalToken(user.username)
  localStorage.setItem('token', access_token)
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: normalizeRole(user.role),
    student_class: user.student_class || '',
    is_active: true,
  }
  localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(safeUser))
  return { success: true, access_token, user: safeUser }
}

const roleMismatch = (expectedRole) => ({
  success: false,
  error: expectedRole === 'teacher' ? 'Tài khoản này không phải tài khoản giáo viên' : 'Tài khoản này không phải tài khoản học sinh',
})

// Returns {success, ...} for a known name, or null when this device has never seen the name
const loginLocalUser = async (usernameOrEmail, password, expectedRole = 'student') => {
  const users = readLocalUsers()
  const record = findLocalUser(users, usernameOrEmail)
  if (!record) return null
  if (!canHashLocally()) return { success: false, error: NO_SAFE_STORAGE }
  const { ok, record: current } = await checkLocalPassword(record, password)
  if (!ok) return { success: false, error: WRONG_LOCAL_LOGIN }
  if (current !== record) writeLocalUsers(users.map((user) => (user === record ? current : user)))
  if (expectedRole && normalizeRole(current.role) !== expectedRole) return roleMismatch(expectedRole)
  return startLocalSession(current)
}

// Without a server a new name becomes a demo account on this device. A name that already exists here is
// never taken over: it needs its own password (handled by loginLocalUser).
const loginOfflineDemoUser = async (usernameOrEmail, password, role = 'student') => {
  if (!canHashLocally()) return { success: false, error: NO_SAFE_STORAGE }
  const username = usernameOrEmail.trim()
  const users = readLocalUsers()
  const user = {
    id: Date.now(),
    username,
    email: username.includes('@') ? username : `${username}@demo.local`,
    ...(await hashPassword(password)),
    full_name: role === 'teacher' ? 'Giáo viên mẫu' : `Học sinh ${username}`,
    role: normalizeRole(role),
    student_class: role === 'student' ? 'mẫu' : '',
    is_active: true,
  }
  writeLocalUsers([...users, user])
  saveProfileMeta(user.username, { role: user.role, student_class: user.student_class, full_name: user.full_name })
  return startLocalSession(user)
}
// Auth Store
export const useAuthStore = create((set, get) => ({
  user: getLocalCurrentUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username, password, role = 'student') => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.login({ username, password })
      const { access_token, user } = response.data
      const userRole = normalizeRole(user.role)

      if (role && userRole !== role) {
        set({ isLoading: false })
        return {
          success: false,
          error:
            role === 'teacher'
              ? 'Tài khoản này không phải tài khoản giáo viên'
              : 'Tài khoản này không phải tài khoản học sinh',
        }
      }

      const profileMeta = getProfileForUser(user.username)
      const safeUser = {
        ...user,
        role: userRole,
        student_class: profileMeta.student_class || user.student_class || '',
        avatar: profileMeta.avatar || user.avatar,
      }
      localStorage.setItem('token', access_token)
      localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(safeUser))
      set({
        user: safeUser,
        token: access_token,
        isAuthenticated: true,
        isLoading: false,
      })
      return { success: true }
    } catch (error) {
      const backendUnavailable =
        !error.response ||
        error.response.status === 404 ||
        error.response.status >= 500

      if (backendUnavailable) {
        const result = (await loginLocalUser(username, password, role)) ?? (await loginOfflineDemoUser(username, password, role))
        if (!result.success) {
          set({ error: result.error, isLoading: false })
          return result
        }
        set({
          user: result.user,
          token: result.access_token,
          isAuthenticated: true,
          isLoading: false,
        })
        return { success: true }
      }

      if (error.response?.status === 401 || error.response?.status === 422) {
        const message =
          'Sai tài khoản/email hoặc mật khẩu. Nếu chưa có tài khoản trên hệ thống này, hãy bấm Tạo tài khoản mới trước.'
        set({ error: message, isLoading: false })
        return { success: false, error: message }
      }

      const message = typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Đăng nhập thất bại'
      set({
        error: message,
        isLoading: false,
      })
      return { success: false, error: message }
    }
  },

  register: async (username, email, password, full_name, role = 'student', student_class = '', class_code = '') => {
    set({ isLoading: true, error: null })
    try {
      const response = await authAPI.register({
        username,
        email,
        password,
        full_name,
        role,
        student_class,
        class_code: class_code || null,
      })
      saveProfileMeta(username, { role, student_class: response.data?.student_class ?? student_class, full_name })
      set({ isLoading: false })
      return { success: true }
    } catch (error) {
      const backendUnavailable =
        !error.response ||
        error.response.status === 404 ||
        error.response.status >= 500

      if (backendUnavailable) {
        const result = await saveLocalRegistration({
          username,
          email,
          password,
          full_name,
          role,
          student_class,
        })
        set({ isLoading: false })
        return result
      }

      const message = registrationErrorMessage(error.response?.data)
      set({
        error: message,
        isLoading: false,
      })
      return { success: false, error: message }
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem(LOCAL_CURRENT_USER_KEY)
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  updateAvatar: (avatar) => {
    const user = get().user
    if (!user) return
    const updatedUser = { ...user, avatar }
    saveProfileMeta(user.username, { avatar })
    localStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(updatedUser))
    set({ user: updatedUser })
  },

  clearError: () => set({ error: null }),
}))
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
