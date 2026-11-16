import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { sampleLessons, sampleQuestions } from '../data/courseCatalog'
import { learningAPI } from '../services/api'
import { useAuthStore } from '../store'
import { CHALLENGE_EVENT, XP, localDay } from '../utils/journey'
import { buildLocalLearningDashboard, recordLocalLearningEvent } from '../utils/learningProgress'

const SIZE = 5
const LETTERS = ['A', 'B', 'C', 'D', 'E']
const explanations = new Map(sampleQuestions.map((question) => [question.text, question.explanation]))
const titles = new Map(sampleLessons.map((lesson) => [lesson.id, lesson.title]))

const seeded = (seedText) => {
  let state = [...seedText].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 7)
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}
const shuffle = (items, random) => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}

const LOCAL_KEY = (userId, day) => `engine_lab_challenge_${userId}_${day}`

/** The offline challenge: the same priorities as the server, from what is stored on this device. */
const localChallenge = (user, day) => {
  const progress = new Map(buildLocalLearningDashboard(user.id).lesson_progress.map((row) => [row.lesson_id, row]))
  const grade = (user.student_class || '').match(/^\s*(10|11|12)/)?.[1]
  const groups = { weak: [], started: [], grade: [] }
  for (const question of sampleQuestions) {
    const row = progress.get(question.lesson_id)
    if (row?.quiz_attempt_count > 0 && row.best_quiz_score < 80) groups.weak.push(question)
    else if (row?.progress_percent > 0) groups.started.push(question)
    else if (!grade || String(question.lesson_id).startsWith(grade)) groups.grade.push(question)
  }
  const reasons = { weak: 'Bài em cần ôn thêm', started: 'Bài em đang học', grade: 'Bài trong chương trình khối của em' }
  const random = seeded(`${user.id}:${day}`)
  const chosen = []
  for (const reason of Object.keys(groups)) {
    for (const question of shuffle(groups[reason], random).slice(0, SIZE - chosen.length)) chosen.push({ question, reason: reasons[reason] })
  }
  return chosen.map(({ question, reason }) => ({
    id: question.id,
    text: question.text,
    lesson_id: question.lesson_id,
    lesson_title: titles.get(question.lesson_id) || '',
    reason,
    options: shuffle(question.options, seeded(`${user.id}:${day}:${question.id}`)).map((option) => ({ id: option.id, text: option.text })),
    correct: question.options.find((option) => option.is_correct)?.id,
  }))
}

const readLocalResult = (userId, day) => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY(userId, day)) || 'null')
  } catch {
    return null
  }
}

export default function DailyChallenge() {
  const user = useAuthStore((state) => state.user)
  const [state, setState] = useState({ status: 'loading' })
  const [answers, setAnswers] = useState({})
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user?.id) return undefined
    let active = true
    learningAPI
      .getChallenge()
      .then(({ data }) => {
        if (!data || !Array.isArray(data.questions)) throw new Error('no challenge')
        if (active) setState({ status: 'ready', mode: 'server', ...data })
      })
      .catch(() => {
        if (!active) return
        const day = localDay(Date.now())
        const questions = localChallenge(user, day)
        const result = readLocalResult(user.id, day)
        setState({ status: 'ready', mode: 'device', day, questions, done: Boolean(result), result })
      })
    return () => {
      active = false
    }
  }, [user])

  const byId = useMemo(() => new Map((state.questions || []).map((question) => [question.id, question])), [state.questions])
  const allAnswered = state.questions?.length > 0 && state.questions.every((question) => answers[question.id])

  const submit = async () => {
    if (!allAnswered) return
    setSending(true)
    try {
      if (state.mode === 'server') {
        const { data } = await learningAPI.submitChallenge(answers)
        setState((current) => ({ ...current, done: true, result: data.result }))
        window.dispatchEvent(new CustomEvent('enginelab:progress-recorded', { detail: { user_id: user.id } }))
      } else {
        const graded = state.questions.map((question) => ({
          question_id: question.id,
          chosen: answers[question.id],
          correct_option: question.correct,
          is_correct: answers[question.id] === question.correct,
        }))
        const correct = graded.filter((item) => item.is_correct).length
        const result = { score: Math.round((1000 * correct) / graded.length) / 10, correct, total: graded.length, answers: graded }
        localStorage.setItem(LOCAL_KEY(user.id, state.day), JSON.stringify(result))
        recordLocalLearningEvent(user.id, {
          event_type: CHALLENGE_EVENT,
          score: result.score,
          client_event_id: `challenge-${state.day}`,
          local_only: true,
          auto_sync: false,
        })
        setState((current) => ({ ...current, done: true, result }))
      }
    } catch (error) {
      const detail = error?.response?.data?.detail
      toast.error(typeof detail === 'string' ? detail : 'Chưa nộp được bài. Hãy thử lại.')
    } finally {
      setSending(false)
    }
  }

  if (state.status === 'loading') {
    return <div className="page-container"><div className="h-64 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" /></div>
  }

  const { questions, done, result } = state
  const graded = new Map((result?.answers || []).map((item) => [item.question_id, item]))
  const earned = result ? Math.floor((result.score * XP.challengeMax) / 100 + 0.5) : 0

  return (
    <div className="page-container max-w-4xl">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Thử thách kiến thức · {state.day.split('-').reverse().join('/')}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Thử thách hôm nay</h1>
        <p className="mt-1 max-w-3xl text-base leading-7 text-slate-600">
          {SIZE} câu chọn riêng cho em, ưu tiên những câu em từng sai và bài em cần ôn. Mỗi ngày làm một lần, đúng cả {SIZE} câu được {XP.challengeMax} điểm kinh nghiệm.
        </p>
        {state.mode === 'device' && (
          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Chưa kết nối máy chủ: thử thách được chấm trên máy này và chỉ tính điểm trên máy này.</p>
        )}
      </header>

      {done && result && (
        <section className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5" aria-live="polite">
          <p className="text-lg font-bold text-emerald-950">Đúng {result.correct}/{result.total} câu · +{earned} điểm kinh nghiệm</p>
          <p className="mt-1 text-sm text-emerald-900">
            {result.correct === result.total ? 'Xuất sắc! Hẹn em ngày mai với thử thách mới.' : 'Xem lại các câu sai bên dưới, rồi mở bài để ôn. Hẹn em ngày mai!'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/progress" className="rounded-md bg-emerald-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-900">Xem hành trình</Link>
            <Link to="/" className="rounded-md border border-emerald-700 px-3 py-1.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100">Về Tổng quan</Link>
          </div>
        </section>
      )}

      {!questions.length ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">Chưa có câu hỏi cho thử thách hôm nay.</p>
      ) : (
        <ol className="space-y-4">
          {questions.map((question, index) => {
            const outcome = graded.get(question.id)
            const explanation = explanations.get(question.text)
            return (
              <li key={question.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-500">Câu {index + 1}</span>
                  <span className="rounded bg-blue-50 px-2 py-0.5 font-semibold text-blue-900">{question.reason}</span>
                  {question.lesson_title && <span className="text-slate-500">{question.lesson_title}</span>}
                </div>
                <p className="mt-2 font-semibold leading-7 text-slate-950">{question.text}</p>
                <div className="mt-3 grid gap-2" role="radiogroup" aria-label={`Câu ${index + 1}`}>
                  {question.options.map((option, optionIndex) => {
                    const selected = (outcome ? outcome.chosen : answers[question.id]) === option.id
                    const isRight = outcome && outcome.correct_option === option.id
                    const isWrongPick = outcome && selected && !isRight
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={done}
                        onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                        className={`flex items-start gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                          isRight ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                            : isWrongPick ? 'border-rose-400 bg-rose-50 text-rose-950'
                              : selected ? 'border-blue-600 bg-blue-50 text-blue-950'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <span className="font-bold">{LETTERS[optionIndex]}.</span>
                        <span className="flex-1">{option.text}</span>
                        {isRight && <span className="text-xs font-bold">Đáp án đúng</span>}
                        {isWrongPick && <span className="text-xs font-bold">Em chọn</span>}
                      </button>
                    )
                  })}
                </div>
                {outcome && (explanation || !outcome.is_correct) && (
                  <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                    {explanation && <><span className="font-semibold">Giải thích: </span>{explanation} </>}
                    {!outcome.is_correct && byId.get(question.id)?.lesson_id && (
                      <Link to={`/lessons/${question.lesson_id}`} className="font-semibold text-blue-800 hover:underline">Ôn lại bài →</Link>
                    )}
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      )}

      {!done && questions.length > 0 && (
        <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 py-3 backdrop-blur">
          <span className="text-sm text-slate-600">Đã chọn {Object.keys(answers).length}/{questions.length} câu</span>
          <button type="button" onClick={submit} disabled={!allAnswered || sending} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            {sending ? 'Đang chấm…' : 'Nộp bài'}
          </button>
        </div>
      )}
    </div>
  )
}
