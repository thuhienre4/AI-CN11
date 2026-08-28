import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { sampleCourses, getSampleLessonsByCourse } from '../data/courseCatalog'
import { useAuthStore } from '../store'
import { buildLocalLearningDashboard, buildTeacherLearningAnalytics } from '../utils/learningProgress'
import { learningAPI } from '../services/api'
import WeeklyLeaderboard from '../components/WeeklyLeaderboard'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, Bot, Clock3, Flame, Medal, Sparkles, Target, Trophy } from 'lucide-react'
import { Badge, ProgressBar, StatCard } from '../components/ui'

const toolStyles = [
  'from-sky-400 to-cyan-300',
  'from-orange-400 to-amber-300',
  'from-violet-400 to-fuchsia-300',
  'from-emerald-400 to-teal-300',
  'from-rose-400 to-pink-300',
]

const mechanicalIcons = ['⚙', '🔩', '🛠', '🚗', '🔧', '⛓']

const learningTools = [
  {
    title: 'Lớp học Công nghệ THPT',
    description: 'Thông báo, nhiệm vụ thực hành, bài nộp và phản hồi của giáo viên.',
    to: '/classroom',
    label: 'Vào lớp học',
    icon: '🏫',
    guide: [
      'Đọc thông báo mới của giáo viên ở bảng tin lớp.',
      'Chọn nhiệm vụ đang mở để xem yêu cầu và hạn nộp.',
      'Nộp bài hoặc theo dõi trạng thái nộp bài theo lớp nếu là giáo viên.',
    ],
  },
  {
    title: 'Tài liệu theo chương',
    description: 'Slide, PDF, phiếu học tập và tài liệu tham khảo gắn với từng chương học.',
    to: '/courses/1',
    label: 'Chọn chương',
    icon: '📚',
    guide: [
      'Vào một chương bất kỳ trong lộ trình học.',
      'Mở khối Tài liệu theo chương ở cạnh phải trang.',
      'Giáo viên có thể tải tài liệu lên, học sinh tải xuống để học và làm nhiệm vụ.',
    ],
  },
  {
    title: 'Kho đề luyện tập Công nghệ THPT',
    description: 'Tổng hợp đề theo chương, có thời lượng, câu hỏi và phần giải thích sau khi nộp.',
    to: '/practice-bank',
    label: 'Mở kho đề',
    icon: '📝',
    guide: [
      'Chọn đề theo chương hoặc chủ đề muốn ôn.',
      'Làm đủ câu hỏi rồi nộp để xem kết quả.',
      'Đọc giải thích và quay lại chương tương ứng để ôn phần còn yếu.',
    ],
  },
  {
    title: 'Trò chơi demo Công nghệ THPT',
    description: 'Quiz nhanh cho kiến thức Công nghệ THPT với giải thích và điểm số ngay lập tức.',
    to: '/game-demo',
    label: 'Thử ngay',
    icon: '🎮',
    guide: [
      'Chọn đáp án đúng, học qua từng câu hỏi.',
      'Xem giải thích sau mỗi câu sai hoặc đúng.',
      'Hoàn thành lượt để xem tổng điểm và thử lại.',
    ],
  },
  {
    title: 'Theo dõi tiến độ cá nhân',
    description: 'Theo dõi tiến độ, XP, huy hiệu, quiz và gợi ý học tập cá nhân hóa.',
    to: '/progress',
    label: 'Xem tiến độ',
    icon: '📈',
    guide: [
      'Xem phần trăm hoàn thành, điểm quiz và thời gian học.',
      'Kiểm tra bài cần ôn lại hoặc bài được AI gợi ý tiếp theo.',
      'Theo dõi XP, huy hiệu và hoạt động gần đây của tài khoản.',
    ],
  },
]

const toolColorClasses = [
  'border-sky-200 bg-sky-50',
  'border-amber-200 bg-amber-50',
  'border-violet-200 bg-violet-50',
  'border-emerald-200 bg-emerald-50',
  'border-rose-200 bg-rose-50',
  'border-blue-200 bg-blue-50',
  'border-cyan-200 bg-cyan-50',
]

const audienceCards = [
  { title: 'Học sinh', icon: '🎒', color: 'bg-white text-indigo-600' },
  { title: 'Giáo viên', icon: '🧑‍🏫', color: 'bg-white text-orange-600' },
  { title: 'Phòng thực hành', icon: '🛠', color: 'bg-white text-emerald-600' },
  { title: 'Nova 3D', icon: '⚙', color: 'bg-white text-violet-600' },
]

const subjectFocus = [
  'Cơ khí chế tạo',
  'Vật liệu cơ khí',
  'Gia công và an toàn',
  'Động cơ đốt trong',
  'Khái quát ô tô',
]

const studyWorkflow = [
  'Đọc mục tiêu và kiến thức trọng tâm của bài học.',
  'Quan sát Nova 3D hoặc sơ đồ để hiểu cấu tạo và nguyên lí.',
  'Làm hoạt động tương tác, mô phỏng và quiz theo chương.',
  'Nộp nhiệm vụ, xem phản hồi và cập nhật hồ sơ năng lực.',
]

const readLocalUsers = () => {
  try {
    const value = JSON.parse(localStorage.getItem('local_auth_users') || '[]')
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : []
  } catch {
    return []
  }
}

const readLocalEvents = () => {
  try {
    const value = JSON.parse(localStorage.getItem('engine_lab_learning_events') || '[]')
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : []
  } catch {
    return []
  }
}

function TeacherOverview({ totalLessons }) {
  const users = readLocalUsers()
  const events = readLocalEvents()
  const students = users.filter((item) => item.role === 'student')
  const completedEvents = events.filter((item) => item.event_type === 'lesson_completed')
  const quizEvents = events.filter((item) => item.event_type === 'quiz_submitted')
  const simulationEvents = events.filter((item) => item.event_type === 'simulation_opened')
  const assistantEvents = events.filter((item) => item.event_type === 'assistant_question')
  const averageQuiz = quizEvents.length
    ? Math.round(quizEvents.reduce((sum, item) => sum + Number(item.score || 0), 0) / quizEvents.length)
    : 0
  const classStats = students.reduce((rows, student) => {
    const className = student.student_class || 'Chưa có lớp'
    rows[className] = rows[className] || { className, total: 0 }
    rows[className].total += 1
    return rows
  }, {})

  const cards = [
    { label: 'Học sinh', value: students.length, tone: 'text-indigo-700', icon: '👥' },
    { label: 'Hoàn thành bài', value: completedEvents.length, tone: 'text-emerald-700', icon: '✅' },
    { label: 'Lượt quiz', value: quizEvents.length, tone: 'text-amber-700', icon: '📝' },
    { label: 'Điểm quiz TB', value: `${averageQuiz}%`, tone: 'text-rose-700', icon: '📊' },
  ]

  return (
    <section className="mb-8 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-6 shadow-lg">
      <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-700">Dashboard giáo viên</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Tổng quan quản lý lớp học</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Theo dõi nhanh học sinh, quiz, mô phỏng, hỏi AI và mức hoàn thành để hỗ trợ lớp học thật.
          </p>
        </div>
        <Link to="/classroom" className="primary-button">Quản lý lớp học</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="motion-card rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{card.icon}</span>
              <span className={`text-3xl font-black ${card.tone}`}>{card.value}</span>
            </div>
            <p className="mt-3 text-sm font-black uppercase text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Hoạt động học tập</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-sky-50 p-3 font-bold text-sky-900">Mô phỏng: {simulationEvents.length}</div>
            <div className="rounded-xl bg-violet-50 p-3 font-bold text-violet-900">Câu hỏi AI: {assistantEvents.length}</div>
            <div className="rounded-xl bg-emerald-50 p-3 font-bold text-emerald-900">Bài hoàn thành: {completedEvents.length}/{Math.max(1, students.length * totalLessons)}</div>
            <div className="rounded-xl bg-amber-50 p-3 font-bold text-amber-900">Quiz đã làm: {quizEvents.length}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Sĩ số theo lớp</h3>
          <div className="mt-4 space-y-2">
            {Object.values(classStats).length ? (
              Object.values(classStats).map((row) => (
                <div key={row.className} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                  <span>Lớp {row.className}</span>
                  <span>{row.total} học sinh</span>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Chưa có tài khoản học sinh local để thống kê.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const formatStudyTime = (seconds = 0) => {
  const minutes = Math.round(Number(seconds || 0) / 60)
  if (minutes < 60) return `${minutes} phút`
  return `${Math.floor(minutes / 60)} giờ ${minutes % 60} phút`
}

function StudentPersonalDashboard({ user }) {
  const dashboard = buildLocalLearningDashboard(user?.id)
  const inProgressLesson = dashboard.lesson_progress.find((item) => item.status === 'in_progress' || item.status === 'needs_review')
  const firstNotStartedLesson = dashboard.lesson_progress.find((item) => item.status === 'not_started')
  const nextProgress = inProgressLesson || firstNotStartedLesson || dashboard.lesson_progress[0]
  const nextLesson = nextProgress?.lesson
  const recommendation = dashboard.recommendations[0]
  const completionPercent = dashboard.total_lessons
    ? Math.round((dashboard.completed_lessons / dashboard.total_lessons) * 100)
    : 0

  const cards = [
    { label: 'Hoàn thành', value: `${dashboard.completed_lessons}/${dashboard.total_lessons}`, color: 'text-emerald-700' },
    { label: 'Tiến độ TB', value: `${dashboard.average_progress}%`, color: 'text-indigo-700' },
    { label: 'Điểm quiz TB', value: `${dashboard.average_quiz_score}%`, color: 'text-amber-700' },
    { label: 'Hỏi AI', value: dashboard.assistant_questions, color: 'text-violet-700' },
  ]

  return (
    <section className="mb-8 rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-white to-lime-50 p-6 shadow-lg">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-cyan-700">Dashboard học sinh</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            {user?.student_class ? `Lộ trình cá nhân - Lớp ${user.student_class}` : 'Lộ trình cá nhân của em'}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Theo dõi bài đang học, điểm quiz, thời gian học và gợi ý ôn tập dựa trên hoạt động gần đây.
          </p>
        </div>
        <Link to={nextLesson ? `/lessons/${nextLesson.id}` : '/practice-bank'} className="primary-button">
          Học tiếp
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-black uppercase text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h3 className="font-black text-slate-950">Bài nên học tiếp</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {nextLesson?.title || 'Chưa có bài học tiếp theo'}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                Đã học {completionPercent}% chương trình
              </p>
            </div>
            <Link to={nextLesson ? `/lessons/${nextLesson.id}` : '/practice-bank'} className="secondary-button shrink-0">
              Mở bài
            </Link>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Gợi ý ôn tập</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {recommendation?.reason || 'Hãy bắt đầu một bài học, làm quiz hoặc hỏi AI để hệ thống tạo gợi ý riêng cho em.'}
          </p>
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
            Thời gian học: {formatStudyTime(dashboard.total_time_spent_seconds)}
          </p>
        </div>
      </div>
    </section>
  )
}

function TeacherPersonalDashboard({ totalLessons }) {
  const users = readLocalUsers()
  const events = readLocalEvents()
  const students = users.filter((item) => item.role === 'student')
  const quizEvents = events.filter((item) => item.event_type === 'quiz_submitted')
  const weakQuizUserIds = new Set(quizEvents.filter((item) => Number(item.score || 0) < 60).map((item) => String(item.user_id)))
  const activeUserIds = new Set(events.map((item) => String(item.user_id)))
  const inactiveStudents = students.filter((student) => !activeUserIds.has(String(student.id)))
  const classStats = students.reduce((rows, student) => {
    const className = student.student_class || 'Chưa có lớp'
    rows[className] = rows[className] || { className, total: 0, active: 0 }
    rows[className].total += 1
    if (activeUserIds.has(String(student.id))) rows[className].active += 1
    return rows
  }, {})

  return (
    <section className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-lg">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Dashboard giáo viên cá nhân hóa</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Ưu tiên lớp cần theo dõi trước</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tổng hợp sĩ số, hoạt động gần đây và nhóm học sinh cần nhắc nhở để giáo viên quản lý lớp nhanh hơn.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/classroom" className="primary-button">Giao nhiệm vụ</Link>
          <Link to="/practice-bank" className="secondary-button">Mở kho đề</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase text-slate-500">Học sinh</p>
          <p className="mt-2 text-3xl font-black text-indigo-700">{students.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase text-slate-500">Đã hoạt động</p>
          <p className="mt-2 text-3xl font-black text-emerald-700">{activeUserIds.size}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase text-slate-500">Cần ôn quiz</p>
          <p className="mt-2 text-3xl font-black text-rose-700">{weakQuizUserIds.size}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-black uppercase text-slate-500">Tổng bài học</p>
          <p className="mt-2 text-3xl font-black text-amber-700">{totalLessons}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Lớp đang quản lý</h3>
          <div className="mt-4 space-y-2">
            {Object.values(classStats).length ? (
              Object.values(classStats).map((row) => (
                <div key={row.className} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                  <span>Lớp {row.className}</span>
                  <span>{row.active}/{row.total} đã học</span>
                </div>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Chưa có tài khoản học sinh local để thống kê.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Cần nhắc nhở</h3>
          <div className="mt-4 space-y-2">
            {inactiveStudents.slice(0, 4).map((student) => (
              <div key={student.id} className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                {student.full_name || student.username} - chưa có hoạt động gần đây
              </div>
            ))}
            {!inactiveStudents.length && (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
                Tất cả học sinh đã có dấu vết hoạt động trong hệ thống.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function StudentSmartLearningPanel({ user }) {
  const dashboard = buildLocalLearningDashboard(user?.id)
  const riskTone =
    dashboard.risk_level === 'high'
      ? 'border-rose-200 bg-rose-50 text-rose-900'
      : dashboard.risk_level === 'medium'
        ? 'border-amber-200 bg-amber-50 text-amber-900'
        : 'border-emerald-200 bg-emerald-50 text-emerald-900'

  const metricCards = [
    { label: 'Mastery score', value: `${dashboard.mastery_score}%`, tone: 'text-sky-700' },
    { label: 'Engagement', value: `${dashboard.engagement_score}%`, tone: 'text-emerald-700' },
    { label: 'Risk score', value: `${dashboard.risk_score}%`, tone: dashboard.risk_level === 'high' ? 'text-rose-700' : 'text-amber-700' },
    { label: 'Mô phỏng', value: dashboard.analytics_summary.simulation_views, tone: 'text-violet-700' },
    { label: 'Quiz', value: dashboard.analytics_summary.quiz_attempts, tone: 'text-orange-700' },
    { label: 'Cần ôn', value: dashboard.analytics_summary.weak_lessons, tone: 'text-rose-700' },
  ]

  return (
    <section className="mb-8 rounded-2xl border border-sky-200 bg-gradient-to-r from-white via-sky-50 to-emerald-50 p-6 shadow-lg">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky-700">Phân tích học tập thông minh</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Cá nhân hóa học tập cho học sinh</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            He thong cham muc do thanh thao, muc do tham gia, nguy co hoc yeu va tu dong goi y lo trinh tiep theo.
          </p>
        </div>
        <div className={`rounded-xl border px-4 py-3 text-sm font-black ${riskTone}`}>
          Cảnh báo: {dashboard.risk_level === 'high' ? 'Cần hỗ trợ gấp' : dashboard.risk_level === 'medium' ? 'Cần theo dõi' : 'Ổn định'}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-black ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Lộ trình AI đề xuất</h3>
          <div className="mt-4 space-y-2">
            {dashboard.learning_path.length ? (
              dashboard.learning_path.map((item) => (
                <Link key={`${item.type}-${item.lesson_id}`} to={item.to} className="block rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-950 transition hover:bg-sky-100">
                  <span className="font-black">{item.label}: {item.title}</span>
                  <span className="mt-1 block text-sky-800">{item.reason}</span>
                </Link>
              ))
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Hãy học một bài, mở mô phỏng hoặc làm quiz để hệ thống tạo lộ trình riêng.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Cảnh báo học sinh cần hỗ trợ</h3>
          <div className="mt-4 space-y-2">
            {dashboard.weak_alerts.length ? (
              dashboard.weak_alerts.map((item) => (
                <Link key={item.lesson_id} to={`/lessons/${item.lesson_id}/chat`} className="block rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-950">
                  <span className="font-black">{item.lesson?.title || `Bài ${item.lesson_id}`}</span>
                  <span className="mt-1 block">{item.analytics.risk_reasons[0]}</span>
                </Link>
              ))
            ) : (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">Chưa có bài nào ở mức nguy cơ cao.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Kế hoạch can thiệp</h3>
          <div className="mt-4 space-y-2">
            {dashboard.intervention_plan.map((item, index) => (
              <div key={item} className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-950">
                {index + 1}. {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TeacherSmartLearningPanel() {
  const [analytics, setAnalytics] = useState(() => buildTeacherLearningAnalytics())

  useEffect(() => {
    let active = true
    const loadAnalytics = () => {
      learningAPI.getTeacherAnalytics()
        .then((response) => {
          if (!active) return
          const data = response.data
          const studentCount = data.classes.reduce((sum, row) => sum + row.student_count, 0)
          const averageMastery = studentCount
            ? Math.round(data.classes.reduce((sum, row) => sum + row.average_mastery * row.student_count, 0) / studentCount)
            : 0
          setAnalytics({
            summary: { ...data.summary, average_mastery: averageMastery },
            at_risk_students: data.at_risk_students.map((row) => ({
              student: { id: row.student_id, full_name: row.name, student_class: row.class_name },
              dashboard: { risk_score: row.risk_score, mastery_score: row.mastery_score },
            })),
            class_rows: data.classes,
            weak_units: data.weak_units.map((row) => ({ ...row, lessons: row.lesson_titles || [] })),
          })
        })
        .catch(() => {
          if (active) setAnalytics(buildTeacherLearningAnalytics())
        })
    }
    loadAnalytics()
    window.addEventListener('enginelab:learning-update', loadAnalytics)
    return () => {
      active = false
      window.removeEventListener('enginelab:learning-update', loadAnalytics)
    }
  }, [])
  const cards = [
    { label: 'Học sinh', value: analytics.summary.total_students, tone: 'text-indigo-700' },
    { label: 'Đã hoạt động', value: analytics.summary.active_students, tone: 'text-emerald-700' },
    { label: 'Nguy cơ cao', value: analytics.summary.high_risk_students, tone: 'text-rose-700' },
    { label: 'Cần theo dõi', value: analytics.summary.medium_risk_students, tone: 'text-amber-700' },
    { label: 'Mức độ làm chủ của lớp', value: `${analytics.summary.average_mastery}%`, tone: 'text-sky-700' },
  ]

  return (
    <section className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-white via-amber-50 to-sky-50 p-6 shadow-lg">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Phân tích học tập dành cho giáo viên</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Bảng điều khiển giáo viên thông minh</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tổng hợp học sinh có nguy cơ, điểm yếu theo đơn vị kiến thức và gợi ý can thiệp phù hợp với lớp THPT.
          </p>
        </div>
        <Link to="/classroom" className="primary-button">Giao nhiệm vụ hỗ trợ</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase text-slate-500">{card.label}</p>
            <p className={`mt-2 text-3xl font-black ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Học sinh cần ưu tiên</h3>
          <div className="mt-4 space-y-2">
            {analytics.at_risk_students.slice(0, 5).map(({ student, dashboard }) => (
              <div key={student.id} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-950">
                <p className="font-black">{student.full_name || student.username} - {student.student_class || 'Chưa có lớp'}</p>
                <p className="mt-1">Risk {dashboard.risk_score}% - Mastery {dashboard.mastery_score}%</p>
              </div>
            ))}
            {!analytics.at_risk_students.length && (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">Chưa phát hiện học sinh có nguy cơ.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Thống kê theo lớp</h3>
          <div className="mt-4 space-y-2">
            {analytics.class_rows.map((row) => (
              <div key={row.class_name} className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-950">
                <p className="font-black">Lớp {row.class_name}</p>
                <p className="mt-1">{row.active_students}/{row.student_count} đã học - Mức độ làm chủ {row.average_mastery}% - Nguy cơ cao {row.high_risk_count}</p>
              </div>
            ))}
            {!analytics.class_rows.length && (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Chưa có tài khoản học sinh để thống kê theo lớp.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-black text-slate-950">Đơn vị kiến thức còn yếu</h3>
          <div className="mt-4 space-y-2">
            {analytics.weak_units.map((unit) => (
              <div key={unit.unit} className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p className="font-black">{unit.unit}</p>
                <p className="mt-1">{unit.count} canh bao - {unit.lessons.slice(0, 2).join(', ')}</p>
              </div>
            ))}
            {!analytics.weak_units.length && (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">Chưa có đơn vị kiến thức nào bị cảnh báo nhiều.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function PremiumDashboardHero({ user, isTeacher, primaryAction, secondaryAction }) {
  const dashboard = !isTeacher ? buildLocalLearningDashboard(user?.id) : null
  const completed = dashboard?.completed_lessons || 0
  const total = dashboard?.total_lessons || 24
  const progress = dashboard?.average_progress || 0
  const studyMinutes = Math.max(18, Math.round((dashboard?.total_time_spent_seconds || 1080) / 60))
  const xp = completed * 120 + (dashboard?.assistant_questions || 0) * 15 + 420
  const learnerName = user?.full_name || user?.username || (isTeacher ? 'Thầy cô' : 'Minh Anh')
  const stats = isTeacher
    ? [
        { label: 'Lớp đang quản lý', value: '3', detail: '96 học sinh', trend: '+8%', icon: BookOpenCheck, tone: 'blue' },
        { label: 'Bài đã giao', value: '12', detail: '4 bài tuần này', trend: '+12%', icon: Target, tone: 'green' },
        { label: 'Tương tác AI', value: '248', detail: 'Trong 7 ngày', trend: '+24%', icon: Bot, tone: 'violet' },
        { label: 'Tỉ lệ hoàn thành', value: '84%', detail: 'Toàn bộ lớp', trend: '+6%', icon: Trophy, tone: 'orange' },
      ]
    : [
        { label: 'Bài hoàn thành', value: `${completed}/${total}`, detail: 'Tiến độ khóa học', trend: '+12%', icon: BookOpenCheck, tone: 'blue' },
        { label: 'Độ chính xác Quiz', value: `${dashboard?.average_quiz_score || 86}%`, detail: 'Cao hơn tuần trước', trend: '+5%', icon: Target, tone: 'green' },
        { label: 'Thời gian học', value: `${studyMinutes}p`, detail: 'Tuần này', trend: '+18%', icon: Clock3, tone: 'violet' },
        { label: 'Tổng XP', value: xp.toLocaleString('vi-VN'), detail: 'Hạng Bạc', trend: '+120', icon: Trophy, tone: 'orange' },
      ]

  return (
    <section className="nova-dashboard-hero">
      <div className="nova-hero-grid" aria-hidden="true" /><div className="nova-hero-orb" aria-hidden="true" />
      <div className="nova-hero-content">
        <motion.div className="nova-hero-copy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
          <Badge tone="blue" icon={Sparkles}>{isTeacher ? 'Teacher intelligence workspace' : 'Lộ trình được AI cá nhân hóa'}</Badge>
          <h1>Chào mừng trở lại,<br /><span>{learnerName}</span> 👋</h1>
          <p>{isTeacher ? 'Nắm bắt nhanh hoạt động lớp học và hỗ trợ đúng học sinh vào đúng thời điểm.' : 'Mỗi bước tiến hôm nay đưa bạn gần hơn tới việc làm chủ Công nghệ 11.'}</p>
          <div className="nova-hero-actions"><Link to={primaryAction.to} className="nova-hero-primary">{primaryAction.label}<ArrowRight /></Link><Link to={secondaryAction.to} className="nova-hero-secondary">{secondaryAction.label}</Link></div>
          <div className="nova-hero-microstats"><span><Flame />7 ngày<strong>Streak</strong></span><span><Medal />12<strong>Thành tích</strong></span><span><Clock3 />~25 phút<strong>Học hôm nay</strong></span></div>
        </motion.div>
        <motion.aside className="nova-current-lesson" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .4, delay: .1 }}>
          <div className="nova-lesson-visual"><span><Bot /></span><i className="nova-gear gear-one">✦</i><i className="nova-gear gear-two">⚙</i><Badge tone="green">Đang học</Badge></div>
          <div className="nova-lesson-body"><small>BÀI HỌC TIẾP THEO</small><h2>{isTeacher ? 'Tổng quan hoạt động lớp 11A1' : 'Nguyên lí động cơ đốt trong'}</h2><p>{isTeacher ? '8 hoạt động mới cần xem xét' : 'Chương 4 · Công nghệ cơ khí'}</p><ProgressBar value={isTeacher ? 84 : Math.max(progress, 68)} showValue label="Tiến độ" /><Link to={primaryAction.to}>Tiếp tục học <ArrowRight /></Link></div>
        </motion.aside>
      </div>
      <div className="nova-stat-grid">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
    </section>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeToolIndex, setActiveToolIndex] = useState(0)

  useEffect(() => {
    setIsLoading(true)
    setCourses(sampleCourses)
    setIsLoading(false)
  }, [])

  const courseSummaries = useMemo(
    () =>
      courses.map((course, index) => {
        const lessons = getSampleLessonsByCourse(course.id)
        return {
          ...course,
          index: index + 1,
          lessons,
          lessonCount: lessons.length,
          accent: toolStyles[index % toolStyles.length],
        }
      }),
    [courses]
  )

  const courseGroups = useMemo(() => {
    const groupMeta = [
      {
        grade: 10,
        label: 'CN10',
        title: 'Công nghệ 10',
        description: 'Thiết kế và công nghệ: đại cương công nghệ, vẽ kỹ thuật, thiết kế kỹ thuật.',
      },
      {
        grade: 11,
        label: 'CN11',
        title: 'Công nghệ 11',
        description: 'Công nghệ cơ khí: dự án cơ khí, CAD/CAM-CNC, vật liệu và chế tạo.',
      },
      {
        grade: 12,
        label: 'CN12',
        title: 'Công nghệ 12',
        description: 'Công nghệ điện - điện tử: hệ thống điện, an toàn điện, điện tử và vi điều khiển.',
      },
    ]

    return groupMeta.map((group) => ({
      ...group,
      courses: courseSummaries.filter((course) => Number(course.grade_level) === group.grade),
    }))
  }, [courseSummaries])

  const totalLessons = courseSummaries.reduce((total, course) => total + course.lessonCount, 0)
  const learnerName = user?.full_name || user?.username || 'học sinh'
  const activeTool = learningTools[activeToolIndex]
  const isTeacher = user?.role === 'teacher'
  const primaryAction = isTeacher
    ? { to: '/classroom', label: 'Quản lý lớp học' }
    : { to: '/courses/1', label: 'Vào học ngay' }
  const secondaryAction = isTeacher
    ? { to: '/practice-bank', label: 'Mở kho đề' }
    : { to: '/progress', label: 'Xem tiến độ' }
  const taskBoard = isTeacher
    ? [
        { to: '/classroom', step: '1. Giao nhiệm vụ', title: 'Tạo bài nộp theo lớp', body: 'Chọn lớp nhận nhiệm vụ, hạn nộp và yêu cầu bài làm.', tone: 'blue' },
        { to: '/classroom', step: '2. Học liệu', title: 'Tải tài liệu tham khảo', body: 'Thêm PDF, PPT, DOC cho học sinh dùng khi làm bài.', tone: 'emerald' },
        { to: '/classroom', step: '3. Theo dõi lớp', title: 'Kiểm tra ai chưa nộp', body: 'Lọc theo lớp để quan sát trạng thái nộp bài.', tone: 'amber' },
        { to: '/practice-bank', step: '4. Kiểm tra', title: 'Mở đề theo chương', body: 'Dùng kho đề để ôn tập và đánh giá nhanh.', tone: 'violet' },
      ]
    : [
        { to: '/classroom', step: '1. Việc cần nộp', title: 'Xem nhiệm vụ của lớp', body: 'Mở lớp học để đọc yêu cầu, tải học liệu và nộp bài.', tone: 'emerald' },
        { to: '/courses/1', step: '2. Học tiếp', title: 'Chọn chương và bài học', body: 'Bắt đầu từ lộ trình CN10, CN11 hoặc CN12.', tone: 'blue' },
        { to: '/practice-bank', step: '3. Kiểm tra', title: 'Làm đề theo chương', body: 'Ôn tập bằng câu hỏi và xem giải thích sau khi nộp.', tone: 'amber' },
        { to: '/progress', step: '4. Tiến độ', title: 'Xem điểm và gợi ý', body: 'Biết bài nào cần ôn lại và bài nào nên học tiếp.', tone: 'rose' },
      ]
  const taskToneClass = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    rose: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  }
  const quickGuide = isTeacher
    ? ['Mở lớp học để đăng thông báo hoặc giao bài.', 'Chọn lớp nhận nhiệm vụ để phân quyền rõ ràng.', 'Lọc theo lớp để xem học sinh đã nộp/chưa nộp.']
    : ['Mở lớp học để xem việc cần nộp trước.', 'Học bài và xem mô phỏng theo chương.', 'Làm quiz, nộp nhiệm vụ và xem tiến độ.']

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="panel px-6 py-4 text-slate-600">Đang tải phòng học Công nghệ...</div>
      </div>
    )
  }

  return (
    <div className="talent-dashboard bg-transparent">
      <PremiumDashboardHero user={user} isTeacher={isTeacher} primaryAction={primaryAction} secondaryAction={secondaryAction} />
      <section className="talent-hero relative overflow-hidden bg-gradient-to-br from-blue-600 via-sky-600 to-teal-500 pb-10 pt-8 text-white">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="talent-welcome mx-auto flex max-w-5xl flex-col gap-4 rounded-2xl border border-white/20 bg-white/12 p-4 shadow-lg backdrop-blur lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="motion-pulse-soft flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl">
                👤
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-black">{learnerName}</p>
                <p className="truncate text-sm font-bold text-sky-50">{user?.email || user?.username || 'EngineLab learner'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={primaryAction.to} className="rounded-xl bg-white px-5 py-3 text-sm font-black text-sky-700 shadow-lg transition hover:-translate-y-0.5">
                {primaryAction.label}
              </Link>
              <Link to={secondaryAction.to} className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-300">
                {secondaryAction.label}
              </Link>
            </div>
          </div>

          <div className="talent-shortcuts mx-auto mt-4 grid max-w-5xl overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl md:grid-cols-3">
            <Link to="/classroom" className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-black transition hover:bg-sky-50">
              🏫 Lớp học chung
            </Link>
            <Link to="/progress" className="flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-4 text-sm font-black transition hover:bg-emerald-50 md:border-l md:border-t-0">
              🪪 Trang cá nhân
            </Link>
            <Link to="/mechanical-workshop" className="flex items-center justify-center gap-2 border-t border-slate-100 px-5 py-4 text-sm font-black transition hover:bg-orange-50 md:border-l md:border-t-0">
              ⚙ Xưởng cơ khí offline
            </Link>
          </div>
        </div>
      </section>

      <main className="talent-dashboard-main page-container">
        {isTeacher ? (
          <>
            <TeacherPersonalDashboard totalLessons={totalLessons} />
            <TeacherSmartLearningPanel />
            <TeacherOverview totalLessons={totalLessons} />
          </>
        ) : (
          <>
            <StudentPersonalDashboard user={user} />
            <WeeklyLeaderboard currentUser={user} />
            <StudentSmartLearningPanel user={user} />
          </>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
            <div>
              <p className="muted-label text-blue-700">Bảng học tập hôm nay</p>
              <h1 className="mt-1 text-3xl font-black text-slate-950">{isTeacher ? 'Hôm nay giáo viên cần làm gì?' : 'Em cần làm gì tiếp theo?'}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {isTeacher ? 'Các tác vụ quản lý lớp được đưa lên đầu để giao bài, tải học liệu và theo dõi nhanh hơn.' : 'Các tác vụ quan trọng được đưa lên đầu trang để học sinh vào học, nộp bài, xem tài liệu và kiểm tra nhanh hơn.'}
              </p>
            </div>
            <Link to={secondaryAction.to} className="secondary-button shrink-0">{secondaryAction.label}</Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {taskBoard.map((task) => (
              <Link key={task.step} to={task.to} className={`rounded-xl border p-4 transition ${taskToneClass[task.tone]}`}>
                <p className="text-sm font-black uppercase">{task.step}</p>
                <p className="mt-2 text-lg font-black text-slate-950">{task.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{task.body}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="mb-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Hướng dẫn nhanh</p>
            <div className="mt-3 grid gap-3 text-base leading-7 text-indigo-950 sm:grid-cols-3">
              {quickGuide.map((step, index) => (
                <p key={step}><span className="font-black">Buoc {index + 1}:</span> {step}</p>
              ))}
            </div>
          </div>
          <Link
            to="/lessons/402/chat"
            className="rounded-2xl border border-violet-200 bg-violet-600 p-5 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <p className="text-xs font-black uppercase tracking-wide text-violet-100">AI học tập nổi bật</p>
            <h2 className="mt-2 text-2xl font-black">Hỏi AI đúng trọng tâm bài học</h2>
            <p className="mt-2 text-base leading-7 text-violet-50">
              Hỏi về động cơ, lỗi sai, nguyên lí làm việc, bộ phận và cách ghi nhớ kiến thức.
            </p>
          </Link>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {learningTools.map((tool, index) => (
            <button
              key={tool.title}
              type="button"
              onClick={() => setActiveToolIndex(index)}
              className={`group overflow-hidden rounded-xl border text-left shadow-sm transition hover:shadow-md ${
                activeToolIndex === index ? 'ring-4 ring-indigo-100' : ''
              } ${toolColorClasses[index]}`}
            >
              <div className={`h-2 bg-gradient-to-r ${toolStyles[index]}`} />
              <div className="p-5">
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-black text-white ${toolStyles[index]}`}>
                  {tool.icon}
                </div>

                <p className="text-lg font-black text-slate-950">{tool.title}</p>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-700">{tool.description}</p>
                <div className="mt-4 text-sm font-black text-blue-700 group-hover:text-blue-800">Xem hướng dẫn</div>
              </div>
            </button>
          ))}
        </section>

        <section className="motion-pop mb-8 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-amber-50 p-5 shadow-lg">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Hướng dẫn sử dụng từng mục</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{activeTool.icon} {activeTool.title}</h2>
              <div className="mt-3 flex gap-2">
                {mechanicalIcons.slice(0, 3).map((icon) => (
                  <span key={icon} className="motion-swing inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    {icon}
                  </span>
                ))}
              </div>
              <ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-3">
                {activeTool.guide.map((step, index) => (
                  <li key={step} className="rounded-xl bg-white p-3 shadow-sm">
                    <span className="font-black text-indigo-700">Bước {index + 1}:</span> {step}
                  </li>
                ))}
              </ol>
            </div>
            <Link to={activeTool.to} className="primary-button shrink-0">
              {activeTool.label}
            </Link>
          </div>
        </section>

        <section className="mb-8 rounded-3xl bg-gradient-to-r from-amber-50 via-sky-50 to-violet-50 p-5">
          <div className="grid gap-3 sm:grid-cols-5">
            {subjectFocus.map((item, index) => (
              <div key={item} className="rounded-2xl bg-white px-4 py-4 text-center text-sm font-black text-slate-800 shadow-sm">
                <span className={`mx-auto mb-3 block h-3 w-12 rounded-full bg-gradient-to-r ${toolStyles[index]}`} />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="muted-label text-indigo-600">Lộ trình Công nghệ THPT</p>
              <h2 className="section-title mt-1">Các chương học theo mạch kiến thức</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Mỗi chương là một học phần riêng, có bài học, mô phỏng, hoạt động luyện tập, kiểm tra chương và nhiệm vụ
              tương ứng.
            </p>
          </div>

          <div className="space-y-8">
            {courseGroups.map((group, groupIndex) => {
              if (!group.courses.length) return null
              const groupLessonCount = group.courses.reduce((total, course) => total + course.lessonCount, 0)

              return (
                <section key={group.grade} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                  <div className="mb-4 flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-end">
                    <div>
                      <span className={`inline-flex rounded-lg bg-gradient-to-r ${toolStyles[groupIndex % toolStyles.length]} px-3 py-1 text-sm font-black text-white shadow-sm`}>{group.label}</span>
                      <h3 className="mt-2 text-2xl font-black text-slate-950">{group.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{group.description}</p>
                    </div>
                    <div className="flex gap-2 text-xs font-black text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{group.courses.length} chuong</span>
                      <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{groupLessonCount} bai hoc</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {group.courses.map((course) => {
                      const firstLesson = course.lessons[0]

                      return (
                        <article key={course.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md">
                          <div className={`h-2 bg-gradient-to-r ${course.accent}`} />
                          <div className="flex gap-4 p-5">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white ${course.accent}`}>
                              <span className="motion-spin-slow">{mechanicalIcons[(course.index - 1) % mechanicalIcons.length]}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                                  {course.lessonCount} bai hoc
                                </span>
                                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                                  Có kiểm tra chương
                                </span>
                              </div>
                              <h4 className="mt-3 text-lg font-black text-slate-950">{course.title}</h4>
                              <p className="mt-2 text-sm leading-6 text-slate-600">{course.description}</p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="text-sm text-slate-600">
                                Bat dau: <span className="font-black text-slate-900">{firstLesson?.title}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Link to={`/courses/${course.id}`} className="secondary-button">Vào chương</Link>
                                <Link to={`/courses/${course.id}/chapter-tests`} className="primary-button">Kiểm tra</Link>
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-teal-500 p-6 text-white shadow-lg">
          <div className="mb-5 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-wide text-yellow-200">Quy trình học</p>
            <h2 className="mt-2 text-2xl font-black">Từ hiểu cấu tạo đến giải thích nguyên lí</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {studyWorkflow.map((item, index) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white ${toolStyles[index]}`}>
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
