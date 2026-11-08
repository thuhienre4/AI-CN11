import { useCallback, useEffect, useRef, useState } from 'react'

import { OPTION_STYLES, roomSocketUrl } from '../utils/gameRoom'

// One socket to a live room. The token goes in the first message, never in the URL.
export function useRoomSocket(code, { name, onMessage }) {
  const [status, setStatus] = useState('idle')
  const socketRef = useRef(null)
  const handler = useRef(onMessage)
  handler.current = onMessage

  useEffect(() => {
    if (!code) return undefined
    const token = localStorage.getItem('token')
    if (!token || token.startsWith('local-token-')) {
      setStatus('offline')
      return undefined
    }
    let closedByUs = false
    const socket = new WebSocket(roomSocketUrl(code))
    socketRef.current = socket
    setStatus('connecting')
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'auth', token, name }))
      setStatus('open')
    }
    socket.onmessage = (event) => {
      try {
        handler.current(JSON.parse(event.data))
      } catch {
        // ignore a malformed message
      }
    }
    socket.onerror = () => setStatus('error')
    socket.onclose = (event) => {
      if (closedByUs) return
      if (event.code === 4404) setStatus('not-found')
      else if (event.code === 4401) setStatus('unauthorised')
      else if (event.code === 4409) setStatus('refused')
      else if (event.code === 4000) setStatus('replaced')
      else setStatus('closed')
    }
    return () => {
      closedByUs = true
      socket.close()
    }
  }, [code, name])

  const send = useCallback((message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) socketRef.current.send(JSON.stringify(message))
  }, [])

  return { status, send }
}

export const ROOM_STATUS_TEXT = {
  connecting: 'Đang kết nối phòng…',
  offline: 'Phòng trực tuyến cần máy chủ EngineLab. Bạn đang dùng ứng dụng khi không có máy chủ.',
  error: 'Không kết nối được máy chủ phòng chơi.',
  closed: 'Mất kết nối với phòng. Tải lại trang để vào lại.',
  'not-found': 'Không tìm thấy phòng với mã này, hoặc phòng đã đóng.',
  unauthorised: 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.',
  refused: 'Phòng không nhận thêm người chơi.',
  replaced: 'Bạn đã vào phòng này ở một thiết bị hoặc tab khác.',
}

// Counts down from `seconds` each time `runKey` changes; calls onEnd once at zero
export function Countdown({ seconds, runKey, running = true, onEnd }) {
  const [left, setLeft] = useState(seconds)
  const ended = useRef(onEnd)
  ended.current = onEnd

  useEffect(() => {
    setLeft(seconds)
    if (!running) return undefined
    const startedAt = Date.now()
    let fired = false
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, seconds - (Date.now() - startedAt) / 1000)
      setLeft(remaining)
      if (remaining <= 0 && !fired) {
        fired = true
        window.clearInterval(timer)
        ended.current?.()
      }
    }, 200)
    return () => window.clearInterval(timer)
  }, [seconds, runKey, running])

  const share = seconds ? left / seconds : 0
  return (
    <div className="flex items-center gap-3" aria-live="off">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-[width] duration-200 ${share > 0.3 ? 'bg-blue-700' : 'bg-rose-600'}`} style={{ width: `${share * 100}%` }} />
      </div>
      <span className="w-12 text-right text-2xl font-black tabular-nums text-slate-950">{Math.ceil(left)}</span>
    </div>
  )
}

// The coloured answer tiles. With `onPick` they are buttons; with `correct` they show the result.
export function OptionTiles({ options, onPick, picked = null, correct = null, counts = null, disabled = false, size = 'large' }) {
  const total = counts ? Math.max(1, counts.reduce((sum, value) => sum + value, 0)) : 1
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const style = OPTION_STYLES[index]
        const revealed = correct !== null
        const isRight = revealed && index === correct
        const faded = revealed && !isRight
        const content = (
          <>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/25 text-lg font-black">{style.letter}</span>
            <span className={`min-w-0 flex-1 text-left font-bold ${size === 'large' ? 'text-lg' : 'text-base'}`}>{option}</span>
            {counts && <span className="shrink-0 rounded bg-white/25 px-2 py-0.5 text-sm font-black">{counts[index]}</span>}
            {isRight && <span className="shrink-0 text-xl" aria-label="Đáp án đúng">✓</span>}
          </>
        )
        const className = `relative flex min-h-[64px] items-center gap-3 overflow-hidden rounded-lg px-4 py-3 text-white shadow-sm transition ${style.className} ${
          faded ? 'opacity-40' : ''} ${picked === index ? 'ring-4 ring-slate-950 ring-offset-2' : ''}`
        return onPick ? (
          <button key={index} type="button" className={`${className} disabled:cursor-not-allowed`} disabled={disabled} onClick={() => onPick(index)}>
            {content}
          </button>
        ) : (
          <div key={index} className={className}>
            {counts && <span className="absolute inset-y-0 left-0 bg-black/15" style={{ width: `${(counts[index] / total) * 100}%` }} aria-hidden="true" />}
            <span className="relative flex w-full items-center gap-3">{content}</span>
          </div>
        )
      })}
    </div>
  )
}

export function Leaderboard({ rows, highlight, limit = 10, unit = 'điểm' }) {
  if (!rows?.length) return <p className="text-sm text-slate-500">Chưa có ai trên bảng xếp hạng.</p>
  return (
    <ol className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {rows.slice(0, limit).map((row, index) => (
        <li key={`${row.name}-${index}`} className={`flex items-center gap-3 px-4 py-2.5 ${row.name === highlight ? 'bg-blue-50 font-bold' : ''}`}>
          <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-black ${
            index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-900' : index === 2 ? 'bg-orange-300 text-orange-950' : 'bg-slate-100 text-slate-600'}`}>
            {row.rank ?? index + 1}
          </span>
          <span className="min-w-0 flex-1 truncate text-slate-900">{row.name}</span>
          <span className="tabular-nums font-black text-slate-950">{row.score} {unit}</span>
        </li>
      ))}
    </ol>
  )
}
