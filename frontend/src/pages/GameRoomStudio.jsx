import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { Countdown, Leaderboard, OptionTiles, ROOM_STATUS_TEXT, useRoomSocket } from '../components/GameRoomParts'
import { gameRoomsAPI, isBackendUnavailable } from '../services/api'
import { useAuthStore } from '../store'
import {
  DEFAULT_SECONDS,
  ROOM_LIMITS,
  bankLessons,
  bankQuestionsFor,
  designProblems,
  emptyDesign,
  emptyQuestion,
  playableDesign,
  rankTeams,
  scoreTeams,
  toRoomQuestion,
} from '../utils/gameRoom'
import { SOURCE_TEXT, copyOf, fetchDesigns, removeDesign, storeDesign } from '../utils/designStore'
import { canActAsTeacher } from '../utils/roles'

const LEVEL_NAMES = { B: 'Biết', H: 'Hiểu', V: 'Vận dụng' }
const TEAM_NAMES = ['Đội Đỏ', 'Đội Xanh', 'Đội Vàng', 'Đội Lục']

// ---------------------------------------------------------------- designing
function BankPicker({ initialGrade, initialLesson, seconds, onAdd }) {
  const [grade, setGrade] = useState(initialGrade || 11)
  const lessons = useMemo(() => bankLessons(grade), [grade])
  const [lesson, setLesson] = useState(initialLesson || lessons[0])
  const [chosen, setChosen] = useState(() => new Set())
  const items = useMemo(() => bankQuestionsFor(grade, lesson), [grade, lesson])

  useEffect(() => {
    if (!lessons.includes(Number(lesson))) setLesson(lessons[0])
  }, [lessons, lesson])
  useEffect(() => setChosen(new Set()), [grade, lesson])

  const toggle = (key) => setChosen((current) => {
    const next = new Set(current)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    return next
  })

  const add = () => {
    onAdd(items.filter((item) => chosen.has(item.key)).map((item) => toRoomQuestion(item, seconds)))
    setChosen(new Set())
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-bold text-slate-950">Lấy câu từ ngân hàng bài học</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="text-sm font-semibold text-slate-600">
          Khối{' '}
          <select className="ml-1 min-w-[4.5rem] rounded-md border border-slate-300 bg-white px-2 py-1" value={grade} onChange={(event) => setGrade(Number(event.target.value))}>
            {[10, 11, 12].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-600">
          Bài{' '}
          <select className="ml-1 min-w-[6.5rem] rounded-md border border-slate-300 bg-white px-2 py-1" value={lesson} onChange={(event) => setLesson(Number(event.target.value))}>
            {lessons.map((value) => <option key={value} value={value}>Bài {value}</option>)}
          </select>
        </label>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer gap-3 rounded-md border border-slate-200 bg-white p-3 text-sm hover:border-blue-300">
              <input type="checkbox" checked={chosen.has(item.key)} onChange={() => toggle(item.key)} className="mt-1" />
              <span>
                <span className="font-semibold text-slate-900">{item.text}</span>
                <span className="mt-1 block text-xs text-slate-500">
                  {LEVEL_NAMES[item.level]} · Đáp án: {item.options[item.correct]}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button type="button" className="secondary-button mt-3" disabled={!chosen.size} onClick={add}>
        Thêm {chosen.size || ''} câu đã chọn
      </button>
    </section>
  )
}

function QuestionEditor({ question, index, total, onChange, onMove, onRemove }) {
  const update = (fields) => onChange({ ...question, ...fields })
  const setOption = (optionIndex, value) => update({ options: question.options.map((option, i) => (i === optionIndex ? value : option)) })
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-slate-950 px-2 py-0.5 text-xs font-black text-white">Câu {index + 1}</span>
        <label className="ml-auto text-xs font-semibold text-slate-600">
          Thời gian{' '}
          <input
            type="number"
            min={ROOM_LIMITS.minSeconds}
            max={ROOM_LIMITS.maxSeconds}
            value={question.seconds}
            onChange={(event) => update({ seconds: Number(event.target.value) })}
            className="w-16 rounded-md border border-slate-300 px-2 py-1"
          />{' '}giây
        </label>
        <button type="button" className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Đưa câu lên">↑</button>
        <button type="button" className="rounded px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Đưa câu xuống">↓</button>
        <button type="button" className="rounded px-2 py-1 text-sm font-semibold text-rose-700 hover:bg-rose-50" onClick={onRemove}>Xóa</button>
      </div>
      <textarea
        value={question.text}
        onChange={(event) => update({ text: event.target.value })}
        maxLength={ROOM_LIMITS.text}
        rows={2}
        placeholder="Nội dung câu hỏi"
        aria-label={`Nội dung câu ${index + 1}`}
        className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => (
          <label key={optionIndex} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 ${question.correct === optionIndex ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
            <input
              type="radio"
              name={`correct-${index}`}
              checked={question.correct === optionIndex}
              onChange={() => update({ correct: optionIndex })}
              aria-label={`Phương án ${'ABCD'[optionIndex]} là đáp án đúng`}
            />
            <span className="text-sm font-black text-slate-500">{'ABCD'[optionIndex]}</span>
            <input
              value={option}
              onChange={(event) => setOption(optionIndex, event.target.value)}
              maxLength={ROOM_LIMITS.option}
              placeholder={optionIndex < 2 ? 'Phương án' : 'Phương án (có thể bỏ trống)'}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        ))}
      </div>
      <input
        value={question.explanation || ''}
        onChange={(event) => update({ explanation: event.target.value })}
        placeholder="Giải thích hiện sau khi công bố đáp án (không bắt buộc)"
        className="mt-2 w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm"
      />
    </li>
  )
}

function DesignEditor({ design, onChange, onSave, onPlayLive, onPlayProjector, opening, saving, searchParams }) {
  const [seconds, setSeconds] = useState(DEFAULT_SECONDS)
  const problems = designProblems(design)
  const setQuestions = (questions) => onChange({ ...design, questions })
  const move = (index, step) => {
    const questions = [...design.questions]
    ;[questions[index], questions[index + step]] = [questions[index + step], questions[index]]
    setQuestions(questions)
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-bold text-slate-700">Tên trò chơi</span>
          <input
            value={design.title}
            onChange={(event) => onChange({ ...design, title: event.target.value })}
            maxLength={ROOM_LIMITS.title}
            placeholder="Ví dụ: Ai nhanh hơn – Động cơ 4 kì"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-lg font-bold"
          />
        </label>
        <ol className="space-y-3">
          {design.questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              index={index}
              total={design.questions.length}
              onChange={(next) => setQuestions(design.questions.map((item, i) => (i === index ? next : item)))}
              onMove={(step) => move(index, step)}
              onRemove={() => setQuestions(design.questions.filter((_, i) => i !== index))}
            />
          ))}
        </ol>
        <button
          type="button"
          className="secondary-button"
          disabled={design.questions.length >= ROOM_LIMITS.questions}
          onClick={() => setQuestions([...design.questions, emptyQuestion(seconds)])}
        >
          + Câu tự soạn
        </button>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">{design.questions.length} câu · khoảng {Math.ceil(design.questions.reduce((sum, item) => sum + Number(item.seconds || 0) + 8, 0) / 60)} phút</p>
          {problems.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-rose-700">
              {problems.slice(0, 5).map((problem) => <li key={problem}>{problem}</li>)}
              {problems.length > 5 && <li>… và {problems.length - 5} lỗi khác</li>}
            </ul>
          )}
          <div className="mt-3 grid gap-2">
            <button type="button" className="primary-button" disabled={problems.length > 0 || opening} onClick={onPlayLive}>
              {opening ? 'Đang mở phòng…' : 'Mở phòng trực tuyến'}
            </button>
            <button type="button" className="secondary-button" disabled={problems.length > 0} onClick={onPlayProjector}>
              Trình chiếu trên lớp (chia đội)
            </button>
            <button type="button" className="secondary-button" onClick={onSave} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thiết kế'}</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Phòng trực tuyến: học sinh vào bằng mã phòng trên máy của mình, điểm tính theo đúng và nhanh. Trình chiếu: không cần máy chủ, cả lớp chia đội, giáo viên ghi đáp án của từng đội.
          </p>
        </section>
        <label className="block rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">
          Thời gian mặc định cho câu mới{' '}
          <input type="number" min={ROOM_LIMITS.minSeconds} max={ROOM_LIMITS.maxSeconds} value={seconds} onChange={(event) => setSeconds(Number(event.target.value))} className="w-16 rounded-md border border-slate-300 px-2 py-1" /> giây
        </label>
        <BankPicker
          initialGrade={Number(searchParams.get('grade')) || undefined}
          initialLesson={Number(searchParams.get('lesson')) || undefined}
          seconds={seconds}
          onAdd={(questions) => setQuestions([...design.questions, ...questions].slice(0, ROOM_LIMITS.questions))}
        />
      </aside>
    </div>
  )
}

// ------------------------------------------------------------- live hosting
function LiveHost({ code, design, onClose }) {
  const [phase, setPhase] = useState('lobby')
  const [lobby, setLobby] = useState({ players: [] })
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState({ answered: 0, players: 0 })
  const [reveal, setReveal] = useState(null)
  const [final, setFinal] = useState(null)
  const [error, setError] = useState('')

  const { status, send } = useRoomSocket(code, {
    onMessage: (message) => {
      if (message.type === 'lobby') setLobby(message)
      if (message.type === 'question') {
        setQuestion(message)
        setReveal(null)
        setAnswers({ answered: 0, players: lobby.players.length })
        setPhase('question')
      }
      if (message.type === 'answers') setAnswers(message)
      if (message.type === 'reveal') {
        setReveal(message)
        setPhase('reveal')
      }
      if (message.type === 'finished') {
        setFinal(message)
        setPhase('finished')
      }
      if (message.type === 'error') setError(message.message)
    },
  })

  const showAnswer = () => phase === 'question' && send({ type: 'reveal' })

  useEffect(() => {
    if (phase === 'question' && answers.players > 0 && answers.answered >= answers.players) send({ type: 'reveal' })
  }, [answers, phase, send])

  const joinUrl = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, '')}/game-rooms/join?code=${code}`
  const explanation = reveal && design.questions[reveal.index]?.explanation

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-slate-950 p-5 text-white">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-cyan-300">Mã phòng</p>
          <p className="font-mono text-5xl font-black tracking-[0.2em]">{code}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold">{design.title}</p>
          <p className="text-sm text-slate-300">Học sinh mở mục “Vào phòng quiz” và nhập mã, hoặc vào: <span className="break-all font-mono">{joinUrl}</span></p>
        </div>
        <button type="button" className="rounded-md border border-white/30 px-3 py-2 text-sm font-semibold hover:bg-white/10" onClick={onClose}>Đóng phòng</button>
      </div>

      {status !== 'open' && ROOM_STATUS_TEXT[status] && <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{ROOM_STATUS_TEXT[status]}</p>}
      {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

      {phase === 'lobby' && (
        <section className="panel p-6">
          <h2 className="text-xl font-bold text-slate-950">Đang chờ học sinh vào phòng ({lobby.players.length})</h2>
          <div className="mt-4 flex min-h-[64px] flex-wrap gap-2">
            {lobby.players.map((name) => <span key={name} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-900">{name}</span>)}
            {!lobby.players.length && <p className="text-sm text-slate-500">Chưa có ai.</p>}
          </div>
          <button type="button" className="primary-button mt-5" disabled={status !== 'open'} onClick={() => send({ type: 'next' })}>
            Bắt đầu ({design.questions.length} câu)
          </button>
        </section>
      )}

      {phase === 'question' && question && (
        <section className="panel space-y-5 p-6">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
            <span>Câu {question.index + 1}/{question.total}</span>
            <span>Đã trả lời: {answers.answered}/{answers.players}</span>
          </div>
          <h2 className="text-2xl font-black leading-snug text-slate-950 sm:text-3xl">{question.text}</h2>
          <Countdown seconds={question.seconds} runKey={question.index} onEnd={showAnswer} />
          <OptionTiles options={question.options} />
          <button type="button" className="secondary-button" onClick={showAnswer}>Công bố đáp án ngay</button>
        </section>
      )}

      {phase === 'reveal' && reveal && question && (
        <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="panel space-y-4 p-6">
            <p className="text-sm font-semibold text-slate-500">Câu {reveal.index + 1}/{question.total}</p>
            <h2 className="text-2xl font-black text-slate-950">{question.text}</h2>
            <OptionTiles options={question.options} correct={reveal.correct} counts={reveal.counts} />
            {explanation && <p className="rounded-md bg-blue-50 p-3 text-sm leading-6 text-blue-950">{explanation}</p>}
            <button type="button" className="primary-button" onClick={() => send({ type: reveal.last ? 'end' : 'next' })}>
              {reveal.last ? 'Xem kết quả chung cuộc' : 'Câu tiếp theo'}
            </button>
          </div>
          <div>
            <h3 className="mb-2 font-bold text-slate-950">Bảng xếp hạng</h3>
            <Leaderboard rows={reveal.leaderboard} limit={5} />
          </div>
        </section>
      )}

      {phase === 'finished' && final && (
        <section className="panel p-6">
          <h2 className="text-2xl font-black text-slate-950">Kết quả chung cuộc</h2>
          <p className="mt-1 text-sm text-slate-600">{final.players} học sinh tham gia.</p>
          <div className="mt-4"><Leaderboard rows={final.leaderboard} /></div>
          <button type="button" className="secondary-button mt-4" onClick={onClose}>Về trang thiết kế</button>
        </section>
      )}
    </div>
  )
}

// ---------------------------------------------------------- projector mode
function ProjectorGame({ design, onClose }) {
  const questions = design.questions
  const [teams, setTeams] = useState(() => TEAM_NAMES.slice(0, 2).map((name) => ({ name, score: 0 })))
  const [index, setIndex] = useState(-1)
  const [picks, setPicks] = useState([])
  const [revealed, setRevealed] = useState(false)
  const question = questions[index]

  const startQuestion = (next) => {
    setIndex(next)
    setPicks(teams.map(() => null))
    setRevealed(false)
  }
  const revealAnswer = () => {
    if (revealed) return
    setTeams((current) => scoreTeams(current, picks, question.correct))
    setRevealed(true)
  }

  if (index === -1) {
    return (
      <section className="panel space-y-4 p-6">
        <h2 className="text-xl font-bold text-slate-950">Trình chiếu: {design.title}</h2>
        <p className="text-sm text-slate-600">Chia lớp thành đội. Sau mỗi câu, giáo viên bấm phương án của từng đội; đội đúng được 100 điểm.</p>
        <div className="space-y-2">
          {teams.map((team, teamIndex) => (
            <input
              key={teamIndex}
              value={team.name}
              onChange={(event) => setTeams(teams.map((item, i) => (i === teamIndex ? { ...item, name: event.target.value } : item)))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 font-semibold"
              aria-label={`Tên đội ${teamIndex + 1}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="secondary-button" disabled={teams.length >= 4} onClick={() => setTeams([...teams, { name: TEAM_NAMES[teams.length], score: 0 }])}>+ Thêm đội</button>
          <button type="button" className="secondary-button" disabled={teams.length <= 2} onClick={() => setTeams(teams.slice(0, -1))}>Bớt đội</button>
          <button type="button" className="primary-button" onClick={() => startQuestion(0)}>Bắt đầu</button>
          <button type="button" className="secondary-button" onClick={onClose}>Quay lại</button>
        </div>
      </section>
    )
  }

  if (index >= questions.length) {
    const ranked = rankTeams(teams)
    return (
      <section className="panel p-6">
        <h2 className="text-2xl font-black text-slate-950">Kết quả: {ranked[0].name} dẫn đầu</h2>
        <div className="mt-4"><Leaderboard rows={ranked} /></div>
        <button type="button" className="secondary-button mt-4" onClick={onClose}>Về trang thiết kế</button>
      </section>
    )
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="panel space-y-5 p-6">
        <p className="text-sm font-semibold text-slate-500">Câu {index + 1}/{questions.length}</p>
        <h2 className="text-2xl font-black leading-snug text-slate-950 sm:text-3xl">{question.text}</h2>
        <Countdown seconds={question.seconds} runKey={index} running={!revealed} />
        <OptionTiles options={question.options} correct={revealed ? question.correct : null} />
        {revealed && question.explanation && <p className="rounded-md bg-blue-50 p-3 text-sm leading-6 text-blue-950">{question.explanation}</p>}
        <div className="space-y-2">
          {teams.map((team, teamIndex) => (
            <div key={teamIndex} className="flex flex-wrap items-center gap-2">
              <span className="w-28 truncate text-sm font-bold text-slate-800">{team.name}</span>
              {question.options.map((_, optionIndex) => (
                <button
                  key={optionIndex}
                  type="button"
                  disabled={revealed}
                  aria-pressed={picks[teamIndex] === optionIndex}
                  onClick={() => setPicks(picks.map((pick, i) => (i === teamIndex ? optionIndex : pick)))}
                  className={`h-9 w-11 rounded-md text-sm font-black ${picks[teamIndex] === optionIndex ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {'ABCD'[optionIndex]}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {!revealed && <button type="button" className="primary-button" onClick={revealAnswer}>Công bố đáp án</button>}
          {revealed && <button type="button" className="primary-button" onClick={() => startQuestion(index + 1)}>{index + 1 < questions.length ? 'Câu tiếp theo' : 'Xem kết quả'}</button>}
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-bold text-slate-950">Điểm các đội</h3>
        <Leaderboard rows={rankTeams(teams)} />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------- page
export default function GameRoomStudio() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [designs, setDesigns] = useState([])
  const [source, setSource] = useState('device')
  const [loadingDesigns, setLoadingDesigns] = useState(true)
  const [saving, setSaving] = useState(false)
  const [design, setDesign] = useState(() => emptyDesign())
  const [mode, setMode] = useState('design')
  const [roomCode, setRoomCode] = useState('')
  const [opening, setOpening] = useState(false)
  const [played, setPlayed] = useState(null)
  const teacher = canActAsTeacher(user)

  const reloadDesigns = async () => {
    try {
      const loaded = await fetchDesigns(user.id)
      setDesigns(loaded.designs)
      setSource(loaded.source)
    } catch {
      toast.error('Không tải được các thiết kế đã lưu.')
    } finally {
      setLoadingDesigns(false)
    }
  }

  useEffect(() => {
    if (teacher) reloadDesigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher, user?.id])

  if (!teacher) {
    return (
      <div className="page-container">
        <section className="panel p-6">
          <h1 className="text-2xl font-black text-slate-950">Phòng quiz trò chơi</h1>
          <p className="mt-2 text-slate-600">Chỉ giáo viên đã được xác minh mới tạo được phòng. Học sinh vào phòng bằng mã giáo viên cung cấp.</p>
          <Link to="/game-rooms/join" className="primary-button mt-4">Vào phòng quiz</Link>
        </section>
      </div>
    )
  }

  // Saves the design where the list came from and keeps the stored copy (a new one gets its server id)
  const persist = async (current) => {
    const stored = await storeDesign(user.id, current, source)
    setDesign((editing) => (editing.id === current.id ? { ...editing, id: stored.id, serverId: stored.serverId } : editing))
    setDesigns((list) => [stored, ...list.filter((item) => item.id !== current.id && item.id !== stored.id)])
    return stored
  }

  const save = async () => {
    setSaving(true)
    try {
      await persist(design)
      toast.success(source === 'server' ? 'Đã lưu vào tài khoản' : 'Đã lưu trên thiết bị này')
    } catch (error) {
      toast.error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Không lưu được thiết kế')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Xóa trò chơi “${item.title || 'Chưa đặt tên'}”?`)) return
    try {
      await removeDesign(user.id, item, source)
      setDesigns((list) => list.filter((other) => other.id !== item.id))
      if (design.id === item.id) setDesign(emptyDesign())
    } catch {
      toast.error('Không xóa được thiết kế')
    }
  }

  const duplicate = (item) => {
    setDesign(copyOf(item))
    toast('Đã tạo bản sao; bấm “Lưu thiết kế” để giữ lại.', { icon: '📄' })
  }

  const playProjector = () => {
    setPlayed(playableDesign(design))
    setMode('projector')
  }

  const playLive = async () => {
    const game = playableDesign(design)
    setOpening(true)
    try {
      const response = await gameRoomsAPI.create(game)
      await persist(design).catch(() => {})
      setPlayed(game)
      setRoomCode(response.data.code)
      setMode('live')
    } catch (error) {
      if (isBackendUnavailable(error)) {
        toast('Không có máy chủ nên chưa mở được phòng trực tuyến. Chuyển sang chế độ trình chiếu.', { icon: 'ℹ️' })
        playProjector()
      } else {
        toast.error(typeof error.response?.data?.detail === 'string' ? error.response.data.detail : 'Không mở được phòng')
      }
    } finally {
      setOpening(false)
    }
  }

  const backToDesign = () => {
    setMode('design')
    setRoomCode('')
  }

  return (
    <div className="page-container">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="muted-label">Dành cho giáo viên</p>
          <h1 className="text-3xl font-black text-slate-950">Phòng quiz trò chơi</h1>
          <p className="mt-1 text-sm text-slate-600">Thiết kế bộ câu hỏi, mở phòng có mã cho học sinh vào thi đua, hoặc trình chiếu chia đội ngay trên lớp.</p>
        </div>
        {mode === 'design' && (
          <button type="button" className="secondary-button" onClick={() => setDesign(emptyDesign())}>+ Trò chơi mới</button>
        )}
      </header>

      {mode === 'design' && (
        <>
          <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Trò chơi đã thiết kế ({designs.length})</h2>
              <p className={`text-xs ${source === 'server' ? 'text-emerald-700' : 'text-amber-700'}`}>{SOURCE_TEXT[source]}</p>
            </div>
            {loadingDesigns && <p className="mt-2 text-sm text-slate-500">Đang tải…</p>}
            {!loadingDesigns && !designs.length && (
              <p className="mt-2 text-sm text-slate-600">Chưa có trò chơi nào. Đặt tên, thêm câu hỏi bên dưới rồi bấm “Lưu thiết kế”.</p>
            )}
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {designs.map((item) => (
                <li key={item.id} className={`flex items-center gap-1 rounded-md border ${item.id === design.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <button type="button" className="min-w-0 flex-1 px-3 py-2 text-left" onClick={() => setDesign(item)}>
                    <span className="block truncate text-sm font-semibold text-slate-900">{item.title || 'Chưa đặt tên'}</span>
                    <span className="text-xs text-slate-500">{item.questions.length} câu</span>
                  </button>
                  <button type="button" className="px-2 py-2 text-xs font-semibold text-slate-500 hover:text-blue-800" onClick={() => duplicate(item)} aria-label={`Nhân bản ${item.title}`}>
                    Nhân bản
                  </button>
                  <button type="button" className="px-2 py-2 text-sm text-slate-400 hover:text-rose-700" aria-label={`Xóa ${item.title}`} onClick={() => remove(item)}>
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <DesignEditor
            design={design}
            onChange={setDesign}
            onSave={save}
            onPlayLive={playLive}
            onPlayProjector={playProjector}
            opening={opening}
            saving={saving}
            searchParams={searchParams}
          />
        </>
      )}
      {mode === 'live' && played && <LiveHost code={roomCode} design={played} onClose={backToDesign} />}
      {mode === 'projector' && played && <ProjectorGame design={played} onClose={backToDesign} />}
    </div>
  )
}
