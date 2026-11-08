import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Countdown, Leaderboard, OptionTiles, ROOM_STATUS_TEXT, useRoomSocket } from '../components/GameRoomParts'
import { gameRoomsAPI, isBackendUnavailable } from '../services/api'
import { useAuthStore } from '../store'
import { cleanRoomCode } from '../utils/gameRoom'

function Playing({ code, name, onLeave }) {
  const [phase, setPhase] = useState('waiting')
  const [lobby, setLobby] = useState({ players: [], title: '' })
  const [question, setQuestion] = useState(null)
  const [picked, setPicked] = useState(null)
  const [reveal, setReveal] = useState(null)
  const [mine, setMine] = useState(null)
  const [final, setFinal] = useState(null)
  const [joinedAs, setJoinedAs] = useState(name)
  const [error, setError] = useState('')

  const { status, send } = useRoomSocket(code, {
    name,
    onMessage: (message) => {
      if (message.type === 'joined') setJoinedAs(message.name)
      if (message.type === 'lobby') setLobby(message)
      if (message.type === 'question') {
        setQuestion(message)
        setPicked(null)
        setReveal(null)
        setMine(null)
        setPhase('question')
      }
      if (message.type === 'reveal') {
        setReveal(message)
        setPhase('reveal')
      }
      if (message.type === 'your_result') setMine(message)
      if (message.type === 'finished') {
        setFinal(message)
        setPhase('finished')
      }
      if (message.type === 'error') setError(message.message)
    },
  })

  const pick = (choice) => {
    if (picked !== null) return
    setPicked(choice)
    send({ type: 'answer', choice })
  }

  if (status !== 'open' && status !== 'connecting' && ROOM_STATUS_TEXT[status]) {
    return (
      <section className="panel p-6">
        <p role="alert" className="text-slate-800">{error || ROOM_STATUS_TEXT[status]}</p>
        <button type="button" className="secondary-button mt-4" onClick={onLeave}>Nhập mã khác</button>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950 px-4 py-3 text-white">
        <span className="font-bold">{lobby.title || 'Phòng quiz'}</span>
        <span className="text-sm text-slate-300">Phòng {code} · {joinedAs}</span>
      </div>

      {phase === 'waiting' && (
        <section className="panel p-8 text-center">
          <p className="text-2xl font-black text-slate-950">Bạn đã vào phòng!</p>
          <p className="mt-2 text-slate-600">Chờ giáo viên bắt đầu… ({lobby.players.length} người trong phòng)</p>
        </section>
      )}

      {phase === 'question' && question && (
        <section className="panel space-y-5 p-5">
          <p className="text-sm font-semibold text-slate-500">Câu {question.index + 1}/{question.total}</p>
          <h2 className="text-xl font-black leading-snug text-slate-950 sm:text-2xl">{question.text}</h2>
          <Countdown seconds={question.seconds} runKey={question.index} running={picked === null} />
          <OptionTiles options={question.options} onPick={pick} picked={picked} disabled={picked !== null} />
          {picked !== null && <p className="text-center font-semibold text-slate-600">Đã gửi đáp án. Chờ giáo viên công bố…</p>}
        </section>
      )}

      {phase === 'reveal' && reveal && question && (
        <section className="panel space-y-4 p-5">
          {mine && (
            <div className={`rounded-lg p-4 text-center text-white ${mine.points > 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              <p className="text-2xl font-black">{mine.choice === null ? 'Hết giờ!' : mine.points > 0 ? `Chính xác! +${mine.points}` : 'Chưa đúng'}</p>
              <p className="mt-1 text-sm">Tổng {mine.score} điểm · Hạng {mine.rank}/{mine.players}{mine.streak > 1 ? ` · Chuỗi đúng ${mine.streak}` : ''}</p>
            </div>
          )}
          <OptionTiles options={question.options} correct={reveal.correct} picked={picked} size="small" />
          {reveal.explanation && <p className="rounded-md bg-blue-50 p-3 text-sm leading-6 text-blue-950">{reveal.explanation}</p>}
          <p className="text-center text-sm text-slate-500">Chờ câu tiếp theo…</p>
        </section>
      )}

      {phase === 'finished' && final && (
        <section className="panel p-5">
          <h2 className="text-2xl font-black text-slate-950">Kết thúc!</h2>
          {mine && <p className="mt-1 text-slate-700">Bạn được {mine.score} điểm, hạng {mine.rank}/{mine.players}.</p>}
          <div className="mt-4"><Leaderboard rows={final.leaderboard} highlight={joinedAs} /></div>
          <button type="button" className="secondary-button mt-4" onClick={onLeave}>Rời phòng</button>
        </section>
      )}
    </div>
  )
}

export default function GameRoomJoin() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(() => cleanRoomCode(searchParams.get('code')))
  const [name, setName] = useState(user?.full_name || user?.username || '')
  const [joined, setJoined] = useState('')
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')

  const join = async (event) => {
    event.preventDefault()
    setMessage('')
    setChecking(true)
    try {
      const { data } = await gameRoomsAPI.get(code)
      if (data.is_host) setMessage('Bạn là giáo viên mở phòng này; hãy điều khiển ở trang Phòng quiz trò chơi.')
      else if (data.state === 'finished') setMessage('Trò chơi trong phòng này đã kết thúc.')
      else setJoined(code)
    } catch (error) {
      if (isBackendUnavailable(error)) setMessage(ROOM_STATUS_TEXT.offline)
      else if (error.response?.status === 404) setMessage(ROOM_STATUS_TEXT['not-found'])
      else setMessage('Không kiểm tra được mã phòng. Hãy thử lại.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="page-container max-w-3xl">
      {joined ? (
        <Playing code={joined} name={name.trim()} onLeave={() => setJoined('')} />
      ) : (
        <form onSubmit={join} className="panel mx-auto max-w-md space-y-4 p-6">
          <div>
            <p className="muted-label">Thi đua cùng lớp</p>
            <h1 className="text-2xl font-black text-slate-950">Vào phòng quiz</h1>
            <p className="mt-1 text-sm text-slate-600">Nhập mã 6 số giáo viên chiếu trên bảng.</p>
          </div>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Mã phòng</span>
            <input
              value={code}
              onChange={(event) => setCode(cleanRoomCode(event.target.value))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="123456"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-3 text-center font-mono text-3xl font-black tracking-[0.3em]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Tên hiển thị</span>
            <input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
          </label>
          {message && <p role="alert" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
          <button type="submit" className="primary-button w-full" disabled={code.length !== 6 || !name.trim() || checking}>
            {checking ? 'Đang kiểm tra…' : 'Vào phòng'}
          </button>
        </form>
      )}
    </div>
  )
}
