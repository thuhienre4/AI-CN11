import { sampleLessons } from '../data/courseCatalog'
import { learningAPI } from '../services/api'

const STORAGE_KEY = 'engine_lab_learning_events'
const DEDUPE_WINDOW_MS = 60 * 1000
let activeSync = null

const createClientEventId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}

const readEvents = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : []
  } catch {
    return []
  }
}

const writeEvents = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

export const recordLocalLearningEvent = (userId, event) => {
  if (!userId) return

  const events = readEvents()
  const now = Date.now()
  const lastSimilarEvent = [...events].reverse().find(
    (item) =>
      String(item.user_id) === String(userId) &&
      Number(item.lesson_id) === Number(event.lesson_id) &&
      item.event_type === event.event_type
  )

  if (
    lastSimilarEvent &&
    now - new Date(lastSimilarEvent.created_at).getTime() < DEDUPE_WINDOW_MS &&
    event.event_type !== 'assistant_question' &&
    event.event_type !== 'quiz_submitted' &&
    event.event_type !== 'game_played'
  ) {
    void syncPendingLearningEvents(userId)
    return
  }

  const storedEvent = {
    id: `${now}-${events.length}`,
    client_event_id: createClientEventId(),
    user_id: userId,
    lesson_id: event.lesson_id ? Number(event.lesson_id) : null,
    event_type: event.event_type,
    duration_seconds: event.duration_seconds || 0,
    score: event.score ?? null,
    payload: event.payload || null,
    created_at: new Date(now).toISOString(),
    synced_at: null,
  }
  events.push(storedEvent)
  writeEvents(events.slice(-500))
  if (event.auto_sync !== false) void syncPendingLearningEvents(userId)
  return storedEvent
}

export const syncPendingLearningEvents = async (userId) => {
  const token = localStorage.getItem('token')
  if (!userId || !token || token.startsWith('local-token-')) return { synced: 0 }
  if (activeSync) return activeSync

  activeSync = (async () => {
    let events = readEvents()
    let assignedIds = false
    events = events.map((event) => {
      if (String(event.user_id) !== String(userId) || event.client_event_id) return event
      assignedIds = true
      return { ...event, client_event_id: createClientEventId() }
    })
    if (assignedIds) writeEvents(events)

    const pending = events.filter(
      (event) => String(event.user_id) === String(userId) && !event.synced_at,
    )
    let synced = 0

    for (let index = 0; index < pending.length; index += 50) {
      const batch = pending.slice(index, index + 50)
      const payload = batch.map((event) => ({
        lesson_id: event.lesson_id,
        client_event_id: event.client_event_id,
        event_type: event.event_type,
        duration_seconds: Math.max(0, Number(event.duration_seconds || 0)),
        score: event.score == null ? null : Number(event.score),
        payload: event.payload,
        occurred_at: event.created_at,
      }))
      await learningAPI.trackEventsBatch(userId, payload)
      const completedIds = new Set(batch.map((event) => event.client_event_id))
      const syncedAt = new Date().toISOString()
      events = events.map((event) =>
        completedIds.has(event.client_event_id) ? { ...event, synced_at: syncedAt } : event,
      )
      writeEvents(events)
      synced += batch.length
    }
    return { synced }
  })()

  try {
    return await activeSync
  } catch {
    return { synced: 0 }
  } finally {
    activeSync = null
  }
}

const createEmptyProgress = (userId, lesson) => ({
  id: `${userId}-${lesson.id}`,
  user_id: userId,
  lesson_id: lesson.id,
  status: 'not_started',
  progress_percent: 0,
  view_count: 0,
  simulation_count: 0,
  assistant_question_count: 0,
  quiz_attempt_count: 0,
  game_count: 0,
  best_quiz_score: 0,
  average_quiz_score: 0,
  time_spent_seconds: 0,
  last_activity_type: null,
  last_accessed_at: new Date().toISOString(),
  completed_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  lesson,
})

const updateProgressFromEvent = (progress, event) => {
  progress.last_activity_type = event.event_type
  progress.last_accessed_at = event.created_at
  progress.updated_at = event.created_at
  progress.time_spent_seconds += event.duration_seconds || 0

  if (event.event_type === 'lesson_viewed') {
    progress.view_count += 1
    progress.progress_percent = Math.max(progress.progress_percent, 20)
  }

  if (event.event_type === 'simulation_opened') {
    progress.simulation_count += 1
    progress.progress_percent = Math.max(progress.progress_percent, 45)
  }

  if (event.event_type === 'simulation_completed') {
    progress.simulation_count = Math.max(progress.simulation_count, 1)
    progress.progress_percent = Math.max(progress.progress_percent, 70)
  }

  if (event.event_type === 'assistant_question') {
    progress.assistant_question_count += 1
    progress.progress_percent = Math.max(progress.progress_percent, 60)
  }

  if (event.event_type === 'game_played') {
    progress.game_count += 1
    progress.progress_percent = Math.max(progress.progress_percent, 75)
  }

  if (event.event_type === 'lesson_completed') {
    progress.progress_percent = 100
  }

  if (event.event_type === 'quiz_submitted') {
    progress.quiz_attempt_count += 1
    const score = Number(event.score || 0)
    progress.best_quiz_score = Math.max(progress.best_quiz_score, score)
    const previousTotal = progress.average_quiz_score * (progress.quiz_attempt_count - 1)
    progress.average_quiz_score = Math.round((previousTotal + score) / progress.quiz_attempt_count)
    progress.progress_percent = Math.max(progress.progress_percent, score >= 70 ? 100 : 85)
  }

  if (progress.progress_percent >= 100) {
    progress.status = 'completed'
    progress.completed_at = progress.completed_at || event.created_at
  } else if (progress.quiz_attempt_count > 0 && progress.best_quiz_score < 60) {
    progress.status = 'needs_review'
  } else if (progress.progress_percent > 0) {
    progress.status = 'in_progress'
  }
}

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value || 0))))

const getDaysSince = (dateValue) => {
  if (!dateValue) return 999
  const time = new Date(dateValue).getTime()
  if (Number.isNaN(time)) return 999
  return Math.max(0, Math.round((Date.now() - time) / (24 * 60 * 60 * 1000)))
}

const getRiskLevel = (riskScore) => {
  if (riskScore >= 70) return 'high'
  if (riskScore >= 40) return 'medium'
  return 'low'
}

const getKnowledgeUnit = (lesson) => {
  if (!lesson) return 'Kiến thức Công nghệ'
  if (Number(lesson.grade_level) === 10 || lesson.course_id <= 3 || (lesson.course_id >= 1000 && lesson.course_id < 1100)) return 'Công nghệ 10 - Thiết kế và công nghệ'
  if (Number(lesson.grade_level) === 11 || lesson.course_id <= 6 || (lesson.course_id >= 1100 && lesson.course_id < 1200)) return 'Công nghệ 11 - Cơ khí và chế tạo'
  return 'Công nghệ 12 - Điện, điện tử và điều khiển'
}

const buildLessonAnalytics = (progress) => {
  const hasQuiz = progress.quiz_attempt_count > 0
  const quizScore = hasQuiz ? progress.best_quiz_score : 50
  const activityScore =
    Math.min(progress.view_count, 2) * 10 +
    Math.min(progress.simulation_count, 2) * 15 +
    Math.min(progress.assistant_question_count, 3) * 8 +
    Math.min(progress.game_count, 2) * 10
  const masteryScore = clampScore(progress.progress_percent * 0.45 + quizScore * 0.4 + Math.min(activityScore, 100) * 0.15)
  const engagementScore = clampScore(activityScore + Math.min(progress.time_spent_seconds / 60, 30))
  const daysSinceActivity = getDaysSince(progress.last_accessed_at)
  const riskReasons = []
  let riskScore = 0

  if (progress.status === 'needs_review' || (hasQuiz && progress.best_quiz_score < 60)) {
    riskScore += 45
    riskReasons.push('Điểm quiz dưới ngưỡng đạt, cần ôn lại ngay.')
  }
  if (progress.progress_percent > 0 && progress.progress_percent < 70) {
    riskScore += 25
    riskReasons.push('Bài học đã bắt đầu nhưng chưa hoàn thành đủ hoạt động.')
  }
  if (progress.progress_percent > 0 && progress.simulation_count === 0) {
    riskScore += 15
    riskReasons.push('Chưa mở mô phỏng, thiếu quan sát trực quan.')
  }
  if (progress.progress_percent > 0 && daysSinceActivity >= 7) {
    riskScore += 15
    riskReasons.push('Đã lâu chưa quay lại bài học này.')
  }

  const suggestedAction =
    riskScore >= 70
      ? 'Ôn lại ghi nhớ, mở mô phỏng, hỏi AI phần chưa hiểu và làm lại quiz.'
      : riskScore >= 40
        ? 'Hoàn thành mô phỏng hoặc quiz để củng cố kiến thức.'
        : 'Có thể học tiếp bài mới hoặc luyện thêm để tăng độ thành thạo.'

  return {
    mastery_score: masteryScore,
    engagement_score: engagementScore,
    risk_score: clampScore(riskScore),
    risk_level: getRiskLevel(riskScore),
    risk_reasons: riskReasons,
    knowledge_unit: getKnowledgeUnit(progress.lesson),
    suggested_action: suggestedAction,
    days_since_activity: daysSinceActivity,
  }
}

const enrichProgressRows = (progressRows) =>
  progressRows.map((progress) => ({
    ...progress,
    analytics: buildLessonAnalytics(progress),
  }))

const buildRecommendations = (progressRows) =>
  [...progressRows]
    .filter(
      (progress) =>
        progress.status === 'needs_review' ||
        progress.analytics?.risk_level !== 'low' ||
        (progress.progress_percent > 0 && progress.progress_percent < 80)
    )
    .sort((a, b) => (b.analytics?.risk_score || 0) - (a.analytics?.risk_score || 0))
    .slice(0, 6)
    .map((progress) => ({
      lesson_id: progress.lesson_id,
      title: progress.lesson?.title || `Bài ${progress.lesson_id}`,
      reason:
        progress.analytics?.risk_reasons?.[0] ||
        (progress.status === 'needs_review'
          ? 'Điểm kiểm tra nhanh còn thấp, cần ôn lại.'
          : 'Bài học đã bắt đầu nhưng chưa hoàn thành đủ hoạt động.'),
      priority: progress.analytics?.risk_level === 'high' ? 'high' : 'medium',
      suggested_action: progress.analytics?.suggested_action || 'Mở mô phỏng, hỏi trợ lý hoặc hoàn thành kiểm tra nhanh.',
      mastery_score: progress.analytics?.mastery_score || 0,
      risk_score: progress.analytics?.risk_score || 0,
      knowledge_unit: progress.analytics?.knowledge_unit || getKnowledgeUnit(progress.lesson),
    }))

const buildPersonalizedPath = (lessonProgress) => {
  const reviewItems = lessonProgress
    .filter((item) => item.analytics.risk_level !== 'low')
    .sort((a, b) => b.analytics.risk_score - a.analytics.risk_score)
    .slice(0, 2)
  const practiceItems = lessonProgress
    .filter((item) => item.progress_percent >= 45 && item.quiz_attempt_count === 0)
    .slice(0, 2)
  const nextItems = lessonProgress
    .filter((item) => item.status === 'not_started')
    .slice(0, 2)

  return [
    ...reviewItems.map((item) => ({
      type: 'review',
      lesson_id: item.lesson_id,
      title: item.lesson?.title || `Bài ${item.lesson_id}`,
      label: 'Ôn lại',
      reason: item.analytics.risk_reasons[0] || 'Bài này có dấu hiệu chưa vững.',
      to: `/lessons/${item.lesson_id}/chat`,
    })),
    ...practiceItems.map((item) => ({
      type: 'quiz',
      lesson_id: item.lesson_id,
      title: item.lesson?.title || `Bài ${item.lesson_id}`,
      label: 'Làm quiz',
      reason: 'Đã có hoạt động học, nên làm quiz để kiểm tra mức hiểu.',
      to: `/lessons/${item.lesson_id}/quiz`,
    })),
    ...nextItems.map((item) => ({
      type: 'next',
      lesson_id: item.lesson_id,
      title: item.lesson?.title || `Bài ${item.lesson_id}`,
      label: 'Học tiếp',
      reason: 'Bài phù hợp để tiếp tục lộ trình.',
      to: `/lessons/${item.lesson_id}`,
    })),
  ].slice(0, 5)
}

const buildInterventionPlan = (dashboard) => {
  if (dashboard.risk_level === 'high') {
    return [
      'Giao phiếu ôn tập ngắn theo đơn vị kiến thức yếu.',
      'Yêu cầu học sinh mở mô phỏng và trả lời câu hỏi quan sát.',
      'Cho làm lại quiz sau khi AI Tutor giải thích lỗi sai.',
    ]
  }
  if (dashboard.risk_level === 'medium') {
    return [
      'Nhắc học sinh hoàn thành hoạt động còn thiếu.',
      'Gợi ý một bài luyện tập hoặc mini game đúng chủ đề.',
      'Theo dõi lại điểm quiz trong buổi học tiếp theo.',
    ]
  }
  return [
    'Khuyến khích học sinh học tiếp bài mới.',
    'Giao nhiệm vụ vận dụng hoặc thảo luận nhóm.',
    'Dùng dữ liệu tiến bộ làm minh chứng đánh giá thường xuyên.',
  ]
}

export const buildLocalLearningDashboard = (userId) => {
  const userEvents = readEvents().filter((event) => String(event.user_id) === String(userId))
  const progressMap = new Map()

  sampleLessons.forEach((lesson) => {
    progressMap.set(lesson.id, createEmptyProgress(userId, lesson))
  })

  userEvents.forEach((event) => {
    if (!event.lesson_id || !progressMap.has(Number(event.lesson_id))) return
    updateProgressFromEvent(progressMap.get(Number(event.lesson_id)), event)
  })

  const lessonProgress = enrichProgressRows([...progressMap.values()])
  const activeProgress = lessonProgress.filter((item) => item.progress_percent > 0)
  const completedLessons = lessonProgress.filter((item) => item.status === 'completed').length
  const inProgressLessons = lessonProgress.filter((item) => item.status === 'in_progress' || item.status === 'needs_review').length
  const quizRows = lessonProgress.filter((item) => item.quiz_attempt_count > 0)
  const masteryScore = lessonProgress.length
    ? Math.round(lessonProgress.reduce((sum, item) => sum + item.analytics.mastery_score, 0) / lessonProgress.length)
    : 0
  const engagementScore = lessonProgress.length
    ? Math.round(lessonProgress.reduce((sum, item) => sum + item.analytics.engagement_score, 0) / lessonProgress.length)
    : 0
  const riskScore = lessonProgress.length
    ? Math.round(lessonProgress.reduce((sum, item) => sum + item.analytics.risk_score, 0) / lessonProgress.length)
    : 0
  const weakAlerts = lessonProgress
    .filter((item) => item.analytics.risk_level === 'high')
    .sort((a, b) => b.analytics.risk_score - a.analytics.risk_score)
    .slice(0, 5)

  const dashboard = {
    user_id: userId,
    total_lessons: lessonProgress.length,
    completed_lessons: completedLessons,
    in_progress_lessons: inProgressLessons,
    average_progress: lessonProgress.length
      ? Math.round(lessonProgress.reduce((sum, item) => sum + item.progress_percent, 0) / lessonProgress.length)
      : 0,
    average_quiz_score: quizRows.length
      ? Math.round(quizRows.reduce((sum, item) => sum + item.best_quiz_score, 0) / quizRows.length)
      : 0,
    total_time_spent_seconds: activeProgress.reduce((sum, item) => sum + item.time_spent_seconds, 0),
    assistant_questions: activeProgress.reduce((sum, item) => sum + item.assistant_question_count, 0),
    recent_events: userEvents.slice(-10).reverse(),
    lesson_progress: lessonProgress,
    recommendations: buildRecommendations(lessonProgress),
    learning_path: buildPersonalizedPath(lessonProgress),
    weak_alerts: weakAlerts,
    mastery_score: masteryScore,
    engagement_score: engagementScore,
    risk_score: riskScore,
    risk_level: getRiskLevel(riskScore),
    analytics_summary: {
      active_lessons: activeProgress.length,
      weak_lessons: weakAlerts.length,
      simulation_views: lessonProgress.reduce((sum, item) => sum + item.simulation_count, 0),
      quiz_attempts: lessonProgress.reduce((sum, item) => sum + item.quiz_attempt_count, 0),
      completion_rate: lessonProgress.length ? Math.round((completedLessons / lessonProgress.length) * 100) : 0,
    },
    source: 'local',
  }

  return {
    ...dashboard,
    intervention_plan: buildInterventionPlan(dashboard),
  }
}

export const buildTeacherLearningAnalytics = () => {
  let users = []
  try {
    const value = JSON.parse(localStorage.getItem('local_auth_users') || '[]')
    users = Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : []
  } catch {
    users = []
  }

  const students = users.filter((item) => item.role === 'student')
  const studentDashboards = students.map((student) => ({
    student,
    dashboard: buildLocalLearningDashboard(student.id),
  }))
  const atRiskStudents = studentDashboards
    .filter((item) => item.dashboard.risk_level !== 'low' || item.dashboard.average_quiz_score < 60)
    .sort((a, b) => b.dashboard.risk_score - a.dashboard.risk_score)

  const classRows = studentDashboards.reduce((rows, item) => {
    const className = item.student.student_class || 'Chưa có lớp'
    rows[className] = rows[className] || {
      class_name: className,
      student_count: 0,
      active_students: 0,
      average_progress: 0,
      average_mastery: 0,
      high_risk_count: 0,
    }
    rows[className].student_count += 1
    rows[className].active_students += item.dashboard.analytics_summary.active_lessons > 0 ? 1 : 0
    rows[className].average_progress += item.dashboard.average_progress
    rows[className].average_mastery += item.dashboard.mastery_score
    rows[className].high_risk_count += item.dashboard.risk_level === 'high' ? 1 : 0
    return rows
  }, {})

  Object.values(classRows).forEach((row) => {
    row.average_progress = row.student_count ? Math.round(row.average_progress / row.student_count) : 0
    row.average_mastery = row.student_count ? Math.round(row.average_mastery / row.student_count) : 0
  })

  const weakUnits = {}
  studentDashboards.forEach(({ dashboard }) => {
    dashboard.weak_alerts.forEach((item) => {
      const unit = item.analytics.knowledge_unit
      weakUnits[unit] = weakUnits[unit] || { unit, count: 0, lessons: [] }
      weakUnits[unit].count += 1
      weakUnits[unit].lessons.push(item.lesson?.title || `Bài ${item.lesson_id}`)
    })
  })

  return {
    students,
    student_dashboards: studentDashboards,
    at_risk_students: atRiskStudents,
    class_rows: Object.values(classRows),
    weak_units: Object.values(weakUnits).sort((a, b) => b.count - a.count).slice(0, 5),
    summary: {
      total_students: students.length,
      active_students: studentDashboards.filter((item) => item.dashboard.analytics_summary.active_lessons > 0).length,
      high_risk_students: atRiskStudents.filter((item) => item.dashboard.risk_level === 'high').length,
      medium_risk_students: atRiskStudents.filter((item) => item.dashboard.risk_level === 'medium').length,
      average_mastery: studentDashboards.length
        ? Math.round(studentDashboards.reduce((sum, item) => sum + item.dashboard.mastery_score, 0) / studentDashboards.length)
        : 0,
    },
  }
}
