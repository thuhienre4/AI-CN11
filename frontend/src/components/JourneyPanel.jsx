import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

import { learningAPI } from '../services/api'
import { levelTitle } from '../utils/journey'
import { buildLocalJourney } from '../utils/learningProgress'

/** The student's journey from the server; from this device when the server cannot be reached or is behind. */
export function useJourney(userId) {
  const [state, setState] = useState({ journey: null, source: 'loading' })
  useEffect(() => {
    if (!userId) return undefined
    let active = true
    const load = async () => {
      const local = buildLocalJourney(userId)
      try {
        const { data } = await learningAPI.getJourney(userId)
        if (!data || !Number.isFinite(data.xp)) throw new Error('no journey')
        // Work done offline and not yet sent shows at once instead of waiting for the next sync
        if (active) setState(local.xp > data.xp ? { journey: local, source: 'device' } : { journey: data, source: 'server' })
      } catch {
        if (active) setState({ journey: local, source: 'device' })
      }
    }
    load()
    // From the server's live channel, and from this device after an activity is recorded
    const events = ['enginelab:learning-update', 'enginelab:progress-recorded']
    events.forEach((name) => window.addEventListener(name, load))
    return () => {
      active = false
      events.forEach((name) => window.removeEventListener(name, load))
    }
  }, [userId])
  return state
}

const levelPercent = (journey) =>
  Math.min(100, Math.round((100 * (journey.xp - journey.level_floor)) / Math.max(1, journey.next_level_xp - journey.level_floor)))

function LevelBar({ journey }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-bold text-slate-900">Cấp {journey.level} · {journey.xp} điểm kinh nghiệm <span className="font-semibold text-blue-800">· {levelTitle(journey.level)}</span></span>
        <span className="text-slate-500">còn {journey.next_level_xp - journey.xp} điểm tới cấp {journey.level + 1}</span>
      </div>
      <div
        className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={levelPercent(journey)}
        aria-label={`Tiến tới cấp ${journey.level + 1}`}
      >
        <div className="h-full rounded-full bg-blue-700 transition-[width] duration-500" style={{ width: `${levelPercent(journey)}%` }} />
      </div>
    </div>
  )
}

function ChallengeLink({ journey }) {
  const score = journey.challenge_today
  return (
    <Link
      to="/challenge"
      className={`mt-3 flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm font-semibold ${score === null ? 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800' : 'border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100'}`}
    >
      <span>{score === null ? 'Thử thách hôm nay: 5 câu chọn riêng cho em' : `Thử thách hôm nay: đúng ${Math.round(score)}%`}</span>
      <span aria-hidden="true">{score === null ? 'Làm ngay →' : 'Xem lại →'}</span>
    </Link>
  )
}

function DailyTasks({ tasks }) {
  return (
    <ul className="space-y-1.5">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-2.5 text-sm">
          <span
            aria-hidden="true"
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px] font-black ${task.done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}
          >
            ✓
          </span>
          <span className={task.done ? 'text-slate-500 line-through' : 'font-semibold text-slate-800'}>{task.title}</span>
          <span className="sr-only">{task.done ? '(đã xong)' : '(chưa làm)'}</span>
        </li>
      ))}
    </ul>
  )
}

/** Small card for the home page: level and today's three tasks. */
export function JourneyToday({ userId }) {
  const { journey } = useJourney(userId)
  if (!journey) return <div className="h-28 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
  const done = journey.daily_tasks.filter((task) => task.done).length
  return (
    <div>
      <LevelBar journey={journey} />
      <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">Nhiệm vụ hôm nay · {done}/{journey.daily_tasks.length}</p>
      <DailyTasks tasks={journey.daily_tasks} />
      <ChallengeLink journey={journey} />
      {journey.streak.current > 1 && <p className="mt-3 text-sm text-slate-600">Đã học {journey.streak.current} ngày liên tiếp.</p>}
    </div>
  )
}

function Leaderboard() {
  const [board, setBoard] = useState({ status: 'loading' })
  useEffect(() => {
    let active = true
    learningAPI
      .getLeaderboard()
      .then(({ data }) => active && setBoard(data && Array.isArray(data.rows) ? { status: 'ready', ...data } : { status: 'offline' }))
      .catch(() => active && setBoard({ status: 'offline' }))
    return () => {
      active = false
    }
  }, [])

  if (board.status === 'loading') return <div className="h-24 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
  if (board.status === 'offline') {
    return <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Bảng xếp hạng của lớp cần kết nối máy chủ. Điểm của em vẫn được tính trên máy này.</p>
  }
  if (board.needs_class) {
    return <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Bảng xếp hạng hiện khi giáo viên xác nhận em thuộc lớp.</p>
  }
  if (!board.rows.length) return <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Lớp chưa có ai có điểm.</p>
  const outside = board.me && !board.rows.some((row) => row.is_me)
  const Row = ({ row }) => (
    <li className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm ${row.is_me ? 'bg-blue-50 font-bold text-blue-950' : 'text-slate-800'}`}>
      <span className="w-6 shrink-0 text-right tabular-nums text-slate-500">{row.rank}</span>
      <span className="min-w-0 flex-1 truncate">{row.name}{row.is_me ? ' (em)' : ''}</span>
      <span className="shrink-0 text-xs text-slate-500">Cấp {row.level}</span>
      <span className="w-16 shrink-0 text-right tabular-nums">{row.xp}</span>
    </li>
  )
  return (
    <>
      <ol className="space-y-0.5">
        {board.rows.map((row) => <Row key={`${row.rank}-${row.name}`} row={row} />)}
        {outside && <><li className="px-3 text-slate-400" aria-hidden="true">…</li><Row row={board.me} /></>}
      </ol>
      <p className="mt-2 text-xs text-slate-500">Lớp {board.class_name} · {board.student_count} học sinh. Xếp theo điểm kinh nghiệm.</p>
    </>
  )
}

const BREAKDOWN = [
  ['lessons', 'Hoàn thành bài'],
  ['quizzes', 'Điểm kiểm tra nhanh'],
  ['models', 'Mở mô hình 3D'],
  ['active_days', 'Ngày có học'],
  ['daily_tasks', 'Đủ nhiệm vụ trong ngày'],
  ['challenges', 'Thử thách hằng ngày'],
]

/** Full panel for the progress page. */
export default function JourneyPanel({ userId, showLeaderboard = true }) {
  const { journey, source } = useJourney(userId)
  if (!journey) return <div className="panel h-64 animate-pulse bg-slate-100 p-6" aria-hidden="true" />
  const earned = journey.badges.filter((badge) => badge.earned).length

  return (
    <div className="panel p-6">
      <p className="muted-label mb-1">Hành trình học tập</p>
      <h2 className="text-2xl font-bold text-slate-950">Cấp độ, nhiệm vụ và huy hiệu</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Điểm đến từ việc học xong và hiểu bài: mỗi bài chỉ tính một lần và được tính là hoàn thành khi đã làm kiểm tra nhanh; làm lại bài kiểm tra để nâng điểm thì được thêm, bấm lặp lại thì không.
      </p>
      {source === 'device' && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Đang tính từ dữ liệu trên máy này; sẽ khớp với máy chủ sau khi đồng bộ.</p>
      )}

      <div className="mt-5"><LevelBar journey={journey} /></div>
      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
        {BREAKDOWN.map(([key, label]) => (
          <div key={key} className="flex gap-1.5"><dt>{label}:</dt><dd className="font-bold tabular-nums text-slate-900">{journey.breakdown[key]}</dd></div>
        ))}
      </dl>

      {/* one column: the panel sits in half the page, too narrow for names beside the tasks */}
      <div className="mt-6 grid gap-6">
        <section aria-labelledby="journey-today">
          <h3 id="journey-today" className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Nhiệm vụ hôm nay</h3>
          <DailyTasks tasks={journey.daily_tasks} />
          <ChallengeLink journey={journey} />
          <p className="mt-3 text-sm text-slate-600">
            {journey.streak.current > 0 ? `Chuỗi hiện tại: ${journey.streak.current} ngày` : 'Chưa có chuỗi ngày học'}
            {journey.streak.best > 0 ? ` · dài nhất: ${journey.streak.best} ngày` : ''}
          </p>
          <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-800 hover:underline">Chọn bài để học <span aria-hidden="true">→</span></Link>
        </section>
        {showLeaderboard && (
          <section aria-labelledby="journey-board">
            <h3 id="journey-board" className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Xếp hạng trong lớp</h3>
            <Leaderboard />
          </section>
        )}
      </div>

      <section aria-labelledby="journey-badges" className="mt-6">
        <h3 id="journey-badges" className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">Huy hiệu · {earned}/{journey.badges.length}</h3>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {journey.badges.map((badge) => (
            <li key={badge.id} className={`rounded-lg border p-3 ${badge.earned ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-bold ${badge.earned ? 'text-emerald-950' : 'text-slate-700'}`}>{badge.title}</p>
              <p className="mt-0.5 text-xs leading-5 text-slate-600">{badge.description}</p>
              <p className={`mt-1.5 text-xs font-semibold ${badge.earned ? 'text-emerald-800' : 'text-slate-500'}`}>
                {badge.earned ? 'Đã đạt' : `${badge.current}/${badge.target}`}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** Announces points, a new level and new badges as they are earned; mounted once for a signed-in student. */
export function JourneyRewards({ userId }) {
  const { journey } = useJourney(userId)
  const seen = useRef(null)
  useEffect(() => {
    if (!journey) return
    const earned = new Set(journey.badges.filter((badge) => badge.earned).map((badge) => badge.id))
    const before = seen.current
    // The first value only sets the baseline; afterwards only rises past the best seen are announced, so a
    // switch between the device's count and the server's never shows as a reward
    if (!before) {
      seen.current = { xp: journey.xp, level: journey.level, badges: earned }
      return
    }
    if (journey.xp > before.xp) toast.success(`+${journey.xp - before.xp} điểm kinh nghiệm`, { id: 'journey-xp' })
    if (journey.level > before.level) toast.success(`Lên cấp ${journey.level}: ${levelTitle(journey.level)}`, { id: 'journey-level', duration: 5000 })
    journey.badges
      .filter((badge) => badge.earned && !before.badges.has(badge.id))
      .forEach((badge) => toast.success(`Huy hiệu mới: ${badge.title}`, { id: `journey-badge-${badge.id}`, duration: 5000 }))
    seen.current = {
      xp: Math.max(before.xp, journey.xp),
      level: Math.max(before.level, journey.level),
      badges: new Set([...before.badges, ...earned]),
    }
  }, [journey])
  return null
}
