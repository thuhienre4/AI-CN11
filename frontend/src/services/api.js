import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''
const APP_BASE_URL = import.meta.env.BASE_URL ?? '/'
const appPath = (path) => `${APP_BASE_URL.replace(/\/$/, '')}${path}`

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token')
    const isLocalSession = token?.startsWith('local-token-')
    const isAuthPage = ['/login', '/register'].includes(window.location.pathname)

    if (error.response?.status === 401 && !isLocalSession && !isAuthPage) {
      localStorage.removeItem('token')
      window.location.href = appPath('/login')
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getMe: () => api.get('/api/auth/me'),
}

// Courses
export const coursesAPI = {
  list: (skip = 0, limit = 10) => api.get('/api/courses', { params: { skip, limit } }),
  get: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post('/api/courses', data),
  update: (id, data) => api.put(`/api/courses/${id}`, data),
  delete: (id) => api.delete(`/api/courses/${id}`),
}

// Lessons
export const lessonsAPI = {
  list: (courseId) => api.get(`/api/courses/${courseId}/lessons`),
  get: (id) => api.get(`/api/lessons/${id}`),
  create: (data) => api.post('/api/lessons', data),
  update: (id, data) => api.put(`/api/lessons/${id}`, data),
  delete: (id) => api.delete(`/api/lessons/${id}`),
}

// Questions
export const questionsAPI = {
  list: (lessonId) => api.get(`/api/lessons/${lessonId}/questions`),
  get: (id) => api.get(`/api/questions/${id}`),
  create: (data) => api.post('/api/questions', data),
  update: (id, data) => api.put(`/api/questions/${id}`, data),
  delete: (id) => api.delete(`/api/questions/${id}`),
}

// Quiz
export const quizAPI = {
  startAttempt: (userId, lessonId) => api.post(`/api/quiz/attempts?user_id=${userId}`, { lesson_id: Number(lessonId) }),
  submit: (userId, data) => api.post(`/api/quiz/submit?user_id=${userId}`, data),
  finalizeAttempt: (attemptId, data = {}) => api.post(`/api/quiz/attempts/${attemptId}/finalize`, data),
  getAttempts: (userId, params = {}) =>
    api.get(`/api/quiz/attempts/user/${userId}`, { params }),
  getResults: (userId, skip = 0, limit = 50) =>
    api.get(`/api/quiz/results/user/${userId}`, { params: { skip, limit } }),
  getStats: (questionId) => api.get(`/api/quiz/results/question/${questionId}`),
}

// Chat
export const chatAPI = {
  message: (userId, data) => api.post(`/api/chat/message?user_id=${userId}`, data),
  status: () => api.get('/api/chat/status'),
  history: (userId, lessonId = null, skip = 0, limit = 50) =>
    api.get(`/api/chat/history/${userId}`, {
      params: { lesson_id: lessonId, skip, limit }
    }),
}

// Personalized learning
export const learningAPI = {
  trackEvent: (userId, data) => api.post(`/api/learning/users/${userId}/events`, data),
  trackEventsBatch: (userId, events) => api.post(`/api/learning/users/${userId}/events/batch`, events),
  getEvents: (userId, lessonId = null, limit = 50) =>
    api.get(`/api/learning/users/${userId}/events`, {
      params: { lesson_id: lessonId, limit },
    }),
  getDashboard: (userId, courseId = null) =>
    api.get(`/api/learning/users/${userId}/dashboard`, {
      params: { course_id: courseId },
    }),
  getTeacherAnalytics: () => api.get('/api/learning/teacher/analytics'),
  getLessonProgress: (userId, lessonId) =>
    api.get(`/api/learning/users/${userId}/lessons/${lessonId}/progress`),
  updateLessonProgress: (userId, lessonId, data) =>
    api.put(`/api/learning/users/${userId}/lessons/${lessonId}/progress`, data),
}

// Shared reference materials
export const materialsAPI = {
  list: (params = {}) => api.get('/api/materials', { params }),
  upload: (formData) =>
    api.post('/api/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (materialId) =>
    api.get(`/api/materials/${materialId}/download`, {
      responseType: 'blob',
    }),
  delete: (materialId) => api.delete(`/api/materials/${materialId}`),
}

export const classroomAPI = {
  listPosts: (params = {}) => api.get('/api/classroom/posts', { params }),
  createPost: (data) => api.post('/api/classroom/posts', data),
  listAssignments: (params = {}) => api.get('/api/classroom/assignments', { params }),
  createAssignment: (data) => api.post('/api/classroom/assignments', data),
  listSubmissions: (assignmentId) =>
    api.get(`/api/classroom/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId, data) =>
    api.patch(`/api/classroom/submissions/${submissionId}/grade`, data),
  submitAssignment: (assignmentId, formData) =>
    api.post(`/api/classroom/assignments/${assignmentId}/submissions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  downloadSubmission: (submissionId) =>
    api.get(`/api/classroom/submissions/${submissionId}/download`, {
      responseType: 'blob',
    }),
}

export const nova3dAPI = {
  getConfig: () => api.get('/api/nova3d/config'),
  generateFourStrokeEngine: (data = {}) => api.post('/api/nova3d/four-stroke-engine', data),
  getWorkflowStatus: (workflowId) => api.get(`/api/nova3d/workflows/${workflowId}/status`),
  getWorkflowResult: (workflowId) => api.get(`/api/nova3d/workflows/${workflowId}/result`),
}

export default api
