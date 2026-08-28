import { Component, Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store'

// Pages
const lazyPage = (loader) =>
  lazy(() =>
    loader().catch((error) => {
      const message = String(error?.message || error || '')
      const isChunkError =
        message.includes('Failed to fetch dynamically imported module') ||
        message.includes('Loading chunk') ||
        message.includes('Importing a module script failed')

      if (isChunkError && sessionStorage.getItem('chunk-reload-attempted') !== 'true') {
        sessionStorage.setItem('chunk-reload-attempted', 'true')
        window.location.reload()
      }

      throw error
    })
  )

const Login = lazyPage(() => import('./pages/Login'))
const Register = lazyPage(() => import('./pages/Register'))
const Dashboard = lazyPage(() => import('./pages/Dashboard'))
const CourseDetail = lazyPage(() => import('./pages/CourseDetail'))
const LessonDetail = lazyPage(() => import('./pages/LessonDetail'))
const ChatBot = lazyPage(() => import('./pages/ChatBot'))
const Quiz = lazyPage(() => import('./pages/Quiz'))
const PersonalProgress = lazyPage(() => import('./pages/PersonalProgress'))
const ChapterTests = lazyPage(() => import('./pages/ChapterTests'))
const Classroom = lazyPage(() => import('./pages/Classroom'))
const SystemDesignLab = lazyPage(() => import('./pages/SystemDesignLab'))
const PracticeBank = lazyPage(() => import('./pages/PracticeBank'))
const ProjectionPractice = lazyPage(() => import('./pages/ProjectionPractice'))
const CircuitExperimentLab = lazyPage(() => import('./pages/CircuitExperimentLab'))
const AvatarStudio = lazyPage(() => import('./pages/AvatarStudio'))
const MechanicalWorkshop = lazyPage(() => import('./pages/MechanicalWorkshop'))
const GameDemo = lazyPage(() => import('./pages/GameDemo'))
const ThreeDSimulation = lazyPage(() => import('./pages/ThreeDSimulation'))
const NotFound = lazyPage(() => import('./pages/NotFound'))

// Components
import Navigation from './components/Navigation'
import SEO from './components/SEO'
import { Skeleton } from './components/ui'
import { syncPendingLearningEvents } from './utils/learningProgress'

// Protected Route Component
const getDefaultRoute = (user) => (user?.role === 'teacher' ? '/classroom' : '/')

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const PublicOnlyRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  return isAuthenticated ? <Navigate to={getDefaultRoute(user)} replace /> : children
}

const PageFallback = () => (
  <div className="page-container" role="status" aria-label="Đang tải nội dung">
    <div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><Skeleton className="h-64 w-full rounded-3xl" /><Skeleton className="h-64 w-full rounded-3xl" /></div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 w-full rounded-2xl" />)}</div>
    <span className="sr-only">Đang tải không gian học tập...</span>
  </div>
)
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Không tải được trang.',
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App render error', error, errorInfo)
  }

  retry = () => {
    sessionStorage.removeItem('chunk-reload-attempted')
    window.location.reload()
  }

  goHome = () => {
    sessionStorage.removeItem('chunk-reload-attempted')
    window.location.href = '/'
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="page-container">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 text-center shadow-lg">
          <p className="text-sm font-black uppercase tracking-wide text-red-600">Trang đang gặp lỗi dữ liệu</p>
          <h1 className="mt-3 text-2xl font-black text-slate-950">Thử tải lại trang</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Có thể trình duyệt đang giữ phiên bản triển khai cũ. Bấm tải lại để lấy phiên bản mới nhất.
          </p>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">{this.state.message}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={this.retry} className="primary-button">
              Tải lại
            </button>
            <button type="button" onClick={this.goHome} className="secondary-button">
              Về trang chính
            </button>
          </div>
        </div>
      </div>
    )
  }
}

function App() {
  const userId = useAuthStore((state) => state.user?.id)

  useEffect(() => {
    if (!userId) return undefined
    const syncEvents = () => void syncPendingLearningEvents(userId)
    syncEvents()
    window.addEventListener('online', syncEvents)
    return () => window.removeEventListener('online', syncEvents)
  }, [userId])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!userId || !token || token.startsWith('local-token-')) return undefined

    let socket
    let retryTimer
    let heartbeat
    let disposed = false
    let retryDelay = 1000

    const connect = () => {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin
      const socketUrl = new URL('/api/ws/learning', apiBase)
      socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:'
      socketUrl.searchParams.set('token', token)
      socket = new WebSocket(socketUrl)
      socket.onopen = () => {
        retryDelay = 1000
        heartbeat = window.setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) socket.send('ping')
        }, 25000)
      }
      socket.onmessage = (event) => {
        try {
          const detail = JSON.parse(event.data)
          if (detail.type === 'learning_update') {
            window.dispatchEvent(new CustomEvent('enginelab:learning-update', { detail }))
          }
        } catch {
          // Ignore malformed realtime payloads and keep the channel alive.
        }
      }
      socket.onclose = () => {
        window.clearInterval(heartbeat)
        if (!disposed) {
          retryTimer = window.setTimeout(connect, retryDelay)
          retryDelay = Math.min(retryDelay * 2, 30000)
        }
      }
    }

    connect()
    return () => {
      disposed = true
      window.clearTimeout(retryTimer)
      window.clearInterval(heartbeat)
      socket?.close()
    }
  }, [userId])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SEO />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
            color: '#0f172a',
            fontWeight: 600,
          },
        }}
      />
      <div className="min-h-screen bg-transparent">
        <Navigation />
        <AppErrorBoundary>
          <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <PersonalProgress />
              </ProtectedRoute>
            }
          />
          <Route path="/avatar" element={<ProtectedRoute><AvatarStudio /></ProtectedRoute>} />
          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <Navigate to="/classroom" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classroom"
            element={
              <ProtectedRoute>
                <Classroom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Navigate to="/practice-bank" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contests"
            element={
              <ProtectedRoute>
                <Navigate to="/practice-bank" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice-bank"
            element={
              <ProtectedRoute>
                <PracticeBank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game-demo"
            element={
              <ProtectedRoute>
                <GameDemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projection-practice"
            element={
              <ProtectedRoute>
                <ProjectionPractice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mechanical-workshop"
            element={
              <ProtectedRoute>
                <MechanicalWorkshop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/design-lab"
            element={
              <ProtectedRoute>
                <SystemDesignLab />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/chapter-tests"
            element={
              <ProtectedRoute>
                <ChapterTests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId"
            element={
              <ProtectedRoute>
                <LessonDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId/chat"
            element={
              <ProtectedRoute>
                <ChatBot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId/3d"
            element={
              <ProtectedRoute>
                <ThreeDSimulation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId/simulation"
            element={
              <ProtectedRoute>
                <ThreeDSimulation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId/game"
            element={
              <ProtectedRoute>
                <Navigate to="/practice-bank" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId/design"
            element={
              <ProtectedRoute>
                <SystemDesignLab />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/:lessonId/circuit-lab"
            element={
              <ProtectedRoute>
                <CircuitExperimentLab />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AppErrorBoundary>
      </div>
    </BrowserRouter>
  )
}

export default App
