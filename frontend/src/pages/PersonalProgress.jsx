import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { learningAPI } from '../services/api'
import { useAuthStore } from '../store'
import { buildLocalLearningDashboard } from '../utils/learningProgress'

const formatDuration = (seconds = 0) => {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`
}

const statusLabel = {
  not_started: 'Chưa học',
  in_progress: 'Đang học',
  completed: 'Hoàn thành',
  needs_review: 'Cần ôn lại',
}

const statusClass = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  needs_review: 'bg-amber-50 text-amber-700',
}

const getLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('local_auth_users') || '[]')
  } catch {
    return []
  }
}

const calculateGamification = (dashboard) => {
  const completed = dashboard?.completed_lessons || 0
  const inProgress = dashboard?.in_progress_lessons || 0
  const averageQuiz = dashboard?.average_quiz_score || 0
  const assistantQuestions = dashboard?.assistant_questions || 0
  const activeLessons = dashboard?.lesson_progress?.filter((item) => item.progress_percent > 0).length || 0
  const xp = completed * 160 + inProgress * 60 + Math.round(averageQuiz * 2) + assistantQuestions * 10
  const level = Math.max(1, Math.floor(xp / 350) + 1)
  const nextLevelXp = level * 350
  const levelProgress = Math.min(100, Math.round((xp / nextLevelXp) * 100))

  const badges = [
    {
      name: 'Người khởi động',
      unlocked: activeLessons > 0,
      description: 'Bắt đầu học ít nhất một bài.',
    },
    {
      name: 'Thợ máy chăm chỉ',
      unlocked: completed >= 2,
      description: 'Hoàn thành từ 2 bài học trở lên.',
    },
    {
      name: 'Tay đua quiz',
      unlocked: averageQuiz >= 80,
      description: 'Điểm kiểm tra trung bình đạt từ 80%.',
    },
    {
      name: 'Kĩ sư hỏi sâu',
      unlocked: assistantQuestions >= 3,
      description: 'Đặt từ 3 câu hỏi cho AI gia sư.',
    },
  ]

  return { xp, level, nextLevelXp, levelProgress, badges }
}

const buildClassLeaderboard = (currentUser, dashboard, gamification) => {
  const localUsers = getLocalUsers()
  const currentName = currentUser?.full_name || currentUser?.username || 'Học sinh hiện tại'
  const rows = [
    {
      id: currentUser?.id || 'current',
      name: currentName,
      className: currentUser?.student_class || '',
      xp: gamification.xp,
      isCurrent: true,
    },
    ...localUsers
      .filter((item) => item.username !== currentUser?.username)
      .slice(0, 4)
      .map((item, index) => ({
        id: item.id || item.username,
        name: item.full_name || item.username,
        className: item.student_class || '',
        xp: Math.max(80, (dashboard?.average_progress || 20) * 3 - index * 35),
        isCurrent: false,
      })),
  ]

  return rows.sort((a, b) => b.xp - a.xp).slice(0, 5)
}

const buildAIInsights = (dashboard) => {
  const progressRows = dashboard?.lesson_progress || []
  const weakLessons = progressRows
    .filter((item) => item.status === 'needs_review' || (item.progress_percent > 0 && item.best_quiz_score > 0 && item.best_quiz_score < 70))
    .slice(0, 3)
  const suitableLessons = progressRows
    .filter((item) => item.progress_percent === 0 || item.status === 'not_started')
    .slice(0, 3)
  const quizLessons = progressRows
    .filter((item) => item.progress_percent >= 45 && item.quiz_attempt_count === 0)
    .slice(0, 3)

  return {
    suitableLessons,
    quizLessons,
    weakLessons,
  }
}

export default function PersonalProgress() {
  const user = useAuthStore((state) => state.user)
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [source, setSource] = useState('backend')

  useEffect(() => {
    loadDashboard()
  }, [user?.id])

  useEffect(() => {
    const refreshFromRealtime = (event) => {
      if (!user?.id || String(event.detail?.user_id) !== String(user.id)) return
      loadDashboard({ quiet: true })
    }
    window.addEventListener('enginelab:learning-update', refreshFromRealtime)
    return () => window.removeEventListener('enginelab:learning-update', refreshFromRealtime)
  }, [user?.id])

  const loadDashboard = async ({ quiet = false } = {}) => {
    if (!user?.id) return

    if (!quiet) setIsLoading(true)
    const localDashboard = buildLocalLearningDashboard(user.id)
    try {
      const response = await learningAPI.getDashboard(user.id)
      const backendDashboard = response.data
      const getActivityScore = (data) => {
        const rows = data?.lesson_progress || []
        return (
          (data?.recent_events?.length || 0) * 3 +
          (data?.completed_lessons || 0) * 20 +
          rows.reduce((sum, item) => sum + (item.progress_percent || 0), 0)
        )
      }

      if (getActivityScore(localDashboard) > getActivityScore(backendDashboard)) {
        setDashboard(localDashboard)
        setSource('local')
      } else {
        setDashboard(backendDashboard)
        setSource('backend')
      }
    } catch {
      setDashboard(localDashboard)
      setSource('local')
    } finally {
      setIsLoading(false)
    }
  }

  const activeLessons = useMemo(() => {
    if (!dashboard?.lesson_progress) return []
    return [...dashboard.lesson_progress]
      .filter((item) => item.progress_percent > 0 || item.status !== 'not_started')
      .sort((a, b) => {
        const aTime = new Date(a.last_accessed_at || 0).getTime()
        const bTime = new Date(b.last_accessed_at || 0).getTime()
        return bTime - aTime
      })
  }, [dashboard])

  const gamification = useMemo(() => calculateGamification(dashboard), [dashboard])
  const leaderboard = useMemo(
    () => buildClassLeaderboard(user, dashboard, gamification),
    [user, dashboard, gamification]
  )
  const aiInsights = useMemo(() => buildAIInsights(dashboard), [dashboard])
  const evidenceStats = useMemo(() => {
    const rows = dashboard?.lesson_progress || []
    const quizAttempts = rows.reduce((total, item) => total + (item.quiz_attempt_count || 0), 0)
    const simulationViews = rows.reduce((total, item) => total + (item.simulation_count || 0), 0)
    const assistantQuestions =
      dashboard?.assistant_questions || rows.reduce((total, item) => total + (item.assistant_question_count || 0), 0)
    const activeCount = rows.filter((item) => item.progress_percent > 0 || item.status !== 'not_started').length
    const completionRate = dashboard?.total_lessons
      ? Math.round(((dashboard?.completed_lessons || 0) / dashboard.total_lessons) * 100)
      : 0

    return { quizAttempts, simulationViews, assistantQuestions, activeCount, completionRate }
  }, [dashboard])
  const smartAnalytics = useMemo(() => {
    const localDashboard = user?.id ? buildLocalLearningDashboard(user.id) : null
    return {
      mastery_score: dashboard?.mastery_score ?? localDashboard?.mastery_score ?? 0,
      engagement_score: dashboard?.engagement_score ?? localDashboard?.engagement_score ?? 0,
      risk_score: dashboard?.risk_score ?? localDashboard?.risk_score ?? 0,
      risk_level: dashboard?.risk_level ?? localDashboard?.risk_level ?? 'low',
      learning_path: dashboard?.learning_path ?? localDashboard?.learning_path ?? [],
      weak_alerts: (dashboard?.weak_alerts ?? localDashboard?.weak_alerts ?? []).map((item) => ({
        ...item,
        lesson: item.lesson || { title: item.title },
        analytics: item.analytics || { risk_reasons: [item.reason] },
      })),
      intervention_plan: dashboard?.intervention_plan ?? localDashboard?.intervention_plan ?? [],
    }
  }, [dashboard, user?.id])

  if (isLoading) {
    return <div className="page-container text-center text-slate-600">Đang tải tiến độ cá nhân...</div>
  }

  return (
    <div className="nova-content-page nova-profile-page page-container">
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="muted-label mb-2">Hồ sơ học tập cá nhân</p>
            <h1 className="text-3xl font-bold text-slate-950">Tiến độ của {user?.full_name || user?.username}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Theo dõi mức độ hoàn thành bài học, kết quả kiểm tra, thời gian học và các bài cần ôn lại.
            </p>
          </div>
          <button type="button" onClick={loadDashboard} className="primary-button">
            Cập nhật dữ liệu
          </button>
        </div>
        {source === 'local' && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Backend chưa phản hồi, hệ thống đang hiển thị dữ liệu học tập lưu trên trình duyệt của học sinh.
          </div>
        )}
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Tiến độ trung bình</p>
          <div className="mt-2 text-3xl font-bold text-blue-700">{dashboard?.average_progress || 0}%</div>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Bài đã hoàn thành</p>
          <div className="mt-2 text-3xl font-bold text-emerald-700">
            {dashboard?.completed_lessons || 0}/{dashboard?.total_lessons || 0}
          </div>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Đang học</p>
          <div className="mt-2 text-3xl font-bold text-slate-950">{dashboard?.in_progress_lessons || 0}</div>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Điểm kiểm tra TB</p>
          <div className="mt-2 text-3xl font-bold text-amber-700">{dashboard?.average_quiz_score || 0}%</div>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Thời gian học</p>
          <div className="mt-2 text-3xl font-bold text-purple-700">
            {formatDuration(dashboard?.total_time_spent_seconds || 0)}
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-5 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-indigo-700">Dữ liệu minh chứng</p>
            <h2 className="text-2xl font-bold text-indigo-950">Kết quả sau khi học sinh học và làm bài</h2>
          </div>
          <p className="text-sm leading-6 text-indigo-900">
            Các chỉ số này giúp giáo viên nhìn nhanh mức độ hoàn thành, quiz, mô phỏng và lượt hỏi AI.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Hoàn thành</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{evidenceStats.completionRate}%</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Quiz đã làm</p>
            <p className="mt-2 text-3xl font-bold text-amber-700">{evidenceStats.quizAttempts}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Mô phỏng đã mở</p>
            <p className="mt-2 text-3xl font-bold text-sky-700">{evidenceStats.simulationViews}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Câu hỏi AI</p>
            <p className="mt-2 text-3xl font-bold text-violet-700">{evidenceStats.assistantQuestions}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Bài có hoạt động</p>
            <p className="mt-2 text-3xl font-bold text-rose-700">{evidenceStats.activeCount}</p>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-lg border border-sky-200 bg-gradient-to-r from-white via-sky-50 to-emerald-50 p-5 shadow-sm">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase text-sky-700">Hồ sơ học tập thông minh</p>
            <h2 className="text-2xl font-bold text-slate-950">Phân tích cá nhân hóa và cảnh báo sớm</h2>
          </div>
          <div
            className={`rounded-lg border px-4 py-3 text-sm font-black ${
              smartAnalytics.risk_level === 'high'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : smartAnalytics.risk_level === 'medium'
                  ? 'border-amber-200 bg-amber-50 text-amber-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}
          >
            Risk: {smartAnalytics.risk_level === 'high' ? 'Cao' : smartAnalytics.risk_level === 'medium' ? 'Vua' : 'On dinh'}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Mức độ làm chủ</p>
            <p className="mt-2 text-3xl font-bold text-sky-700">{smartAnalytics.mastery_score}%</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Mức độ tham gia</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{smartAnalytics.engagement_score}%</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Mức độ rủi ro</p>
            <p className="mt-2 text-3xl font-bold text-rose-700">{smartAnalytics.risk_score}%</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <h3 className="font-bold text-slate-950">Lộ trình AI tiếp theo</h3>
            <div className="mt-3 space-y-2">
              {smartAnalytics.learning_path.length ? (
                smartAnalytics.learning_path.map((item) => (
                  <Link key={`${item.type}-${item.lesson_id}`} to={item.to} className="block rounded-lg bg-sky-50 p-3 text-sm text-sky-950">
                    <span className="font-bold">{item.label}: {item.title}</span>
                    <span className="mt-1 block">{item.reason}</span>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Chưa có dữ liệu để tạo lộ trình riêng.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <h3 className="font-bold text-slate-950">Bài cần hỗ trợ thêm</h3>
            <div className="mt-3 space-y-2">
              {smartAnalytics.weak_alerts.length ? (
                smartAnalytics.weak_alerts.map((item) => (
                  <Link key={item.lesson_id} to={`/lessons/${item.lesson_id}/chat`} className="block rounded-lg bg-rose-50 p-3 text-sm text-rose-950">
                    <span className="font-bold">{item.lesson?.title || `Bài ${item.lesson_id}`}</span>
                    <span className="mt-1 block">{item.analytics?.risk_reasons?.[0]}</span>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">Chưa phát hiện bài có nguy cơ cao.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <h3 className="font-bold text-slate-950">Kế hoạch hỗ trợ</h3>
            <div className="mt-3 space-y-2">
              {smartAnalytics.intervention_plan.map((item, index) => (
                <div key={item} className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-950">
                  {index + 1}. {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="muted-label mb-1">Thành tích học tập</p>
              <h2 className="text-2xl font-bold text-slate-950">XP, cấp độ và huy hiệu</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Học sinh tích lũy XP khi hoàn thành bài, làm quiz, chơi game và hỏi AI gia sư.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 px-5 py-4 text-center">
              <p className="text-xs font-semibold uppercase text-blue-700">Level</p>
              <p className="text-4xl font-bold text-blue-700">{gamification.level}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">{gamification.xp} XP</span>
              <span className="text-slate-500">Mốc tiếp theo: {gamification.nextLevelXp} XP</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-blue-600" style={{ width: `${gamification.levelProgress}%` }}></div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {gamification.badges.map((badge) => (
              <div
                key={badge.name}
                className={`rounded-lg border p-4 ${
                  badge.unlocked
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <p className="font-bold">{badge.unlocked ? 'Đã mở khóa' : 'Chưa mở'} · {badge.name}</p>
                <p className="mt-2 text-sm leading-6">{badge.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="font-bold text-slate-950">Leaderboard lớp</h3>
            <div className="mt-3 space-y-2">
              {leaderboard.map((row, index) => (
                <div
                  key={row.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                    row.isCurrent ? 'bg-blue-50 text-blue-950' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-semibold">
                    {index + 1}. {row.name}{row.className ? ` - Lớp ${row.className}` : ''}
                  </span>
                  <span className="font-bold">{Math.round(row.xp)} XP</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <p className="muted-label mb-1">Gợi ý từ AI</p>
          <h2 className="text-2xl font-bold text-slate-950">Gợi ý học tập cá nhân hóa</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Hệ thống phân tích tiến độ để gợi ý bài học phù hợp, quiz cá nhân hóa và phần kiến thức
            học sinh còn yếu.
          </p>

          <div className="mt-5 grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-950">Bài học phù hợp tiếp theo</h3>
              {aiInsights.suitableLessons.length ? (
                <div className="mt-3 space-y-2">
                  {aiInsights.suitableLessons.map((item) => (
                    <Link key={item.lesson_id} to={`/lessons/${item.lesson_id}`} className="block text-sm font-semibold text-blue-700 hover:text-blue-800">
                      {item.lesson?.title || `Bài ${item.lesson_id}`}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Bạn đã mở hầu hết các bài. Hãy chuyển sang ôn tập và kiểm tra.</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-950">Quiz cá nhân hóa nên làm</h3>
              {aiInsights.quizLessons.length ? (
                <div className="mt-3 space-y-2">
                  {aiInsights.quizLessons.map((item) => (
                    <Link key={item.lesson_id} to={`/lessons/${item.lesson_id}/quiz`} className="block text-sm font-semibold text-blue-700 hover:text-blue-800">
                      Làm quiz: {item.lesson?.title || `Bài ${item.lesson_id}`}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">Chưa có quiz ưu tiên. Hãy học thêm bài mới hoặc chơi game khởi động.</p>
              )}
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-bold text-amber-950">Phần cần hỗ trợ thêm</h3>
              {aiInsights.weakLessons.length ? (
                <div className="mt-3 space-y-2">
                  {aiInsights.weakLessons.map((item) => (
                    <Link key={item.lesson_id} to={`/lessons/${item.lesson_id}/chat`} className="block text-sm font-semibold text-amber-900 hover:text-amber-950">
                      Hỏi AI gia sư về: {item.lesson?.title || `Bài ${item.lesson_id}`}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-amber-900">
                  Chưa phát hiện phần yếu rõ ràng. Hệ thống sẽ chính xác hơn sau khi có thêm điểm quiz và hoạt động học.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="muted-label mb-1">Theo từng bài học</p>
              <h2 className="text-xl font-bold text-slate-950">Bảng tiến độ</h2>
            </div>
            <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {activeLessons.length} bài có hoạt động
            </span>
          </div>

          {activeLessons.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-900">Chưa có dữ liệu học tập</p>
              <p className="mt-2 text-sm text-slate-600">
                Hãy mở một bài học, xem mô phỏng, chơi game hoặc làm kiểm tra nhanh để hệ thống bắt đầu đo tiến độ.
              </p>
              <Link to="/" className="primary-button mt-4 inline-flex">
                Về lộ trình học
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLessons.map((item) => (
                <Link
                  key={item.lesson_id}
                  to={`/lessons/${item.lesson_id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-950">
                        {item.lesson?.title || `Bài ${item.lesson_id}`}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Xem bài {item.view_count || 0} lần · Mô phỏng {item.simulation_count || 0} lần · Trợ lý {item.assistant_question_count || 0} câu
                      </p>
                    </div>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${statusClass[item.status] || statusClass.not_started}`}>
                      {statusLabel[item.status] || item.status}
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-blue-600" style={{ width: `${item.progress_percent || 0}%` }}></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>{Math.round(item.progress_percent || 0)}% hoàn thành</span>
                    <span>Điểm tốt nhất: {Math.round(item.best_quiz_score || 0)}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="panel p-5">
            <h2 className="font-bold text-slate-950">Gợi ý cá nhân hóa</h2>
            {dashboard?.recommendations?.length ? (
              <div className="mt-4 space-y-3">
                {dashboard.recommendations.map((item) => (
                  <Link
                    key={`${item.lesson_id}-${item.reason}`}
                    to={`/lessons/${item.lesson_id}`}
                    className="block rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 transition hover:border-amber-300"
                  >
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-2 leading-6">{item.reason}</p>
                    <p className="mt-2 font-semibold">{item.suggested_action}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Chưa có bài cần ôn đặc biệt. Tiếp tục học, chơi game và làm kiểm tra để hệ thống đưa ra gợi ý chính xác hơn.
              </p>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="font-bold text-slate-950">Hoạt động gần đây</h2>
            {dashboard?.recent_events?.length ? (
              <div className="mt-4 space-y-3">
                {dashboard.recent_events.map((event) => (
                  <div key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-800">{event.event_type}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Bài {event.lesson_id || '-'} · {formatDuration(event.duration_seconds || 0)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Chưa có hoạt động nào được ghi nhận.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
