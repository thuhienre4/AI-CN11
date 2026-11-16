// Learning journey for the offline mode: the same rules as backend/journey.py, which is the reference.
// Both are checked against backend/data/journey_cases.json, so a change on one side fails the other's test.

export const XP = { lessonCompleted: 40, quizMax: 40, modelOpened: 10, activeDay: 5, dailyTasks: 15 }

const DAILY_TASKS = [
  ['study', 'Học một bài', ['lesson_viewed', 'lesson_completed']],
  ['quiz', 'Làm một bài kiểm tra nhanh', ['quiz_submitted']],
  ['model', 'Mở một mô hình 3D', ['simulation_opened']],
]

const BADGES = [
  ['first_lesson', 'Bước đầu tiên', 'Hoàn thành bài học đầu tiên', 'completed', 1],
  ['five_lessons', 'Chăm chỉ', 'Hoàn thành 5 bài học', 'completed', 5],
  ['twenty_lessons', 'Bền bỉ', 'Hoàn thành 20 bài học', 'completed', 20],
  ['solid_three', 'Nắm chắc', 'Đạt từ 80 điểm kiểm tra nhanh ở 3 bài', 'solid', 3],
  ['perfect', 'Chính xác', 'Đạt 100 điểm kiểm tra nhanh ở một bài', 'perfect', 1],
  ['retry', 'Kiên trì', 'Làm lại bài kiểm tra và đạt từ 80 điểm', 'retry', 1],
  ['explorer', 'Khám phá', 'Mở mô hình 3D ở 5 bài', 'models', 5],
  ['streak_three', 'Đều đặn', 'Học 3 ngày liên tiếp', 'best_streak', 3],
  ['streak_seven', 'Thói quen tốt', 'Học 7 ngày liên tiếp', 'best_streak', 7],
]

const DAY_MS = 24 * 60 * 60 * 1000

/** The Vietnam calendar day of a moment, as YYYY-MM-DD. */
export const localDay = (moment) => new Date(new Date(moment).getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const levelFloor = (level) => 50 * level * (level - 1)

export const levelFor = (xp) => {
  let level = 1
  while (levelFloor(level + 1) <= xp) level += 1
  return level
}

const streaks = (days, today) => {
  if (!days.length) return [0, 0]
  const ordered = [...days].sort().map((day) => Date.parse(`${day}T00:00:00Z`))
  let best = 1
  let run = 1
  for (let index = 1; index < ordered.length; index += 1) {
    run = ordered[index] - ordered[index - 1] === DAY_MS ? run + 1 : 1
    best = Math.max(best, run)
  }
  if (Date.parse(`${today}T00:00:00Z`) - ordered[ordered.length - 1] > DAY_MS) return [0, best]
  let current = 1
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    if (ordered[index] - ordered[index - 1] !== DAY_MS) break
    current += 1
  }
  return [current, best]
}

/** lessons: rows with status, best_quiz_score, quiz_attempt_count, simulation_count. events: [type, local day]. */
export const buildJourney = (lessons, events, today) => {
  const completed = lessons.filter((item) => item.status === 'completed').length
  const tested = lessons.filter((item) => (item.quiz_attempt_count || 0) > 0)
  const quizXp = tested.reduce(
    (sum, item) => sum + Math.floor((Math.min(100, Math.max(0, item.best_quiz_score || 0)) * XP.quizMax) / 100 + 0.5),
    0
  )
  const models = lessons.filter((item) => (item.simulation_count || 0) > 0).length

  const typesByDay = new Map()
  for (const [type, day] of events) {
    if (!typesByDay.has(day)) typesByDay.set(day, new Set())
    typesByDay.get(day).add(type)
  }
  const done = (types, wanted) => wanted.some((type) => types.has(type))
  const fullDays = [...typesByDay.values()].filter((types) => DAILY_TASKS.every(([, , wanted]) => done(types, wanted))).length
  const [current, best] = streaks([...typesByDay.keys()], today)

  const breakdown = {
    lessons: completed * XP.lessonCompleted,
    quizzes: quizXp,
    models: models * XP.modelOpened,
    active_days: typesByDay.size * XP.activeDay,
    daily_tasks: fullDays * XP.dailyTasks,
  }
  const xp = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  const level = levelFor(xp)
  const counters = {
    completed,
    solid: tested.filter((item) => (item.best_quiz_score || 0) >= 80).length,
    perfect: tested.filter((item) => (item.best_quiz_score || 0) >= 100).length,
    retry: tested.filter((item) => (item.quiz_attempt_count || 0) >= 2 && (item.best_quiz_score || 0) >= 80).length,
    models,
    best_streak: best,
  }
  const todayTypes = typesByDay.get(today) || new Set()
  return {
    xp,
    level,
    level_floor: levelFloor(level),
    next_level_xp: levelFloor(level + 1),
    breakdown,
    streak: { current, best },
    active_days: typesByDay.size,
    daily_tasks: DAILY_TASKS.map(([id, title, wanted]) => ({ id, title, done: done(todayTypes, wanted) })),
    badges: BADGES.map(([id, title, description, counter, target]) => ({
      id,
      title,
      description,
      earned: counters[counter] >= target,
      current: Math.min(counters[counter], target),
      target,
    })),
  }
}
