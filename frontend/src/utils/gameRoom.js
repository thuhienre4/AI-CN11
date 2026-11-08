import { allThptQuestions, arrangeOptions } from '../data/thptQuestionBank'

// Same limits as the server (backend/routes/game_rooms.py), so a design that passes here is accepted there
export const ROOM_LIMITS = { questions: 50, minOptions: 2, maxOptions: 4, minSeconds: 5, maxSeconds: 120, title: 120, text: 500, option: 200 }
export const DEFAULT_SECONDS = 20
export const PROJECTOR_POINTS = 100
export const OPTION_STYLES = [
  { letter: 'A', className: 'bg-rose-600 hover:bg-rose-700' },
  { letter: 'B', className: 'bg-blue-700 hover:bg-blue-800' },
  { letter: 'C', className: 'bg-amber-500 hover:bg-amber-600' },
  { letter: 'D', className: 'bg-emerald-600 hover:bg-emerald-700' },
]

export const emptyQuestion = (seconds = DEFAULT_SECONDS) => ({ text: '', options: ['', '', '', ''], correct: 0, seconds, explanation: '' })

export const emptyDesign = () => ({ id: `game-${Date.now().toString(36)}`, title: '', questions: [] })

// Lesson-bank questions become room questions, with the right answer at the position the bank shows it
export const bankLessons = (grade) =>
  [...new Set(allThptQuestions().filter((item) => item.grade === Number(grade)).map((item) => item.lesson))].sort((a, b) => a - b)

export const bankQuestionsFor = (grade, lesson) =>
  allThptQuestions()
    .filter((item) => item.grade === Number(grade) && item.lesson === Number(lesson))
    .map((item) => {
      const options = arrangeOptions(item)
      return { key: item.key, level: item.level, text: item.text, options, correct: options.indexOf(item.correct), explanation: item.explanation }
    })

export const toRoomQuestion = ({ text, options, correct, explanation = '' }, seconds = DEFAULT_SECONDS) => ({ text, options: [...options], correct, seconds, explanation })

// Returns the problems in Vietnamese; an empty list means the design can be played
export const designProblems = (design) => {
  const problems = []
  const title = (design?.title || '').trim()
  if (!title) problems.push('Đặt tên cho trò chơi.')
  if (title.length > ROOM_LIMITS.title) problems.push(`Tên trò chơi dài tối đa ${ROOM_LIMITS.title} kí tự.`)
  const questions = design?.questions || []
  if (!questions.length) problems.push('Thêm ít nhất một câu hỏi.')
  if (questions.length > ROOM_LIMITS.questions) problems.push(`Mỗi trò chơi có tối đa ${ROOM_LIMITS.questions} câu.`)
  questions.forEach((question, index) => {
    const label = `Câu ${index + 1}`
    const options = question.options.map((option) => option.trim())
    if (!question.text.trim()) problems.push(`${label}: chưa có nội dung câu hỏi.`)
    if (question.text.length > ROOM_LIMITS.text) problems.push(`${label}: câu hỏi dài quá ${ROOM_LIMITS.text} kí tự.`)
    const filled = options.filter(Boolean)
    if (filled.length < ROOM_LIMITS.minOptions) problems.push(`${label}: cần ít nhất 2 phương án.`)
    if (new Set(filled).size !== filled.length) problems.push(`${label}: có phương án trùng nhau.`)
    if (filled.some((option) => option.length > ROOM_LIMITS.option)) problems.push(`${label}: phương án dài quá ${ROOM_LIMITS.option} kí tự.`)
    if (!options[question.correct]) problems.push(`${label}: đáp án đúng đang là ô trống.`)
    const seconds = Number(question.seconds)
    if (!(seconds >= ROOM_LIMITS.minSeconds && seconds <= ROOM_LIMITS.maxSeconds)) {
      problems.push(`${label}: thời gian từ ${ROOM_LIMITS.minSeconds} đến ${ROOM_LIMITS.maxSeconds} giây.`)
    }
  })
  return problems
}

// Empty option boxes are dropped and the right answer keeps pointing at the same text
export const playableDesign = (design) => ({
  title: design.title.trim(),
  questions: design.questions.map((question) => {
    const kept = question.options.map((text, index) => ({ text: text.trim(), index })).filter((option) => option.text)
    return {
      text: question.text.trim(),
      options: kept.map((option) => option.text),
      correct: kept.findIndex((option) => option.index === question.correct),
      seconds: Number(question.seconds),
      explanation: (question.explanation || '').trim(),
    }
  }),
})

// Designs are kept on the teacher's device, one list per account
const storageKey = (userId) => `enginelab:game-designs:${userId || 'guest'}`

export const loadDesigns = (userId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export const saveDesign = (userId, design) => {
  const others = loadDesigns(userId).filter((item) => item.id !== design.id)
  const designs = [{ ...design, updatedAt: new Date().toISOString() }, ...others]
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(designs))
  } catch {
    // Storage full or blocked: the design still works for this session
  }
  return designs
}

export const deleteDesign = (userId, designId) => {
  const designs = loadDesigns(userId).filter((item) => item.id !== designId)
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(designs))
  } catch {
    // ignore
  }
  return designs
}

export const roomSocketUrl = (code, apiBase = import.meta.env.VITE_API_URL || window.location.origin) => {
  const url = new URL(`/api/ws/game-rooms/${code}`, apiBase)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.toString()
}

export const cleanRoomCode = (value) => String(value || '').replace(/\D/g, '').slice(0, 6)

// Projector mode: every team that picked the right option gets the same points
export const scoreTeams = (teams, picks, correct) =>
  teams.map((team, index) => (picks[index] === correct ? { ...team, score: team.score + PROJECTOR_POINTS } : team))

export const rankTeams = (teams) => [...teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'vi'))
