// Signals of one student, each with how many lessons it concerns and which ones. Facts, not verdicts.
export const SIGNAL_LEVELS = {
  high: { teacher: 'Cần xem sớm', student: 'Có bài cần ôn lại', className: 'border-rose-200 bg-rose-50 text-rose-900' },
  medium: { teacher: 'Nên xem', student: 'Có bài nên làm tiếp', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  low: { teacher: 'Chưa có tín hiệu', student: 'Đang theo kịp', className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  none: { teacher: 'Chưa bắt đầu học', student: 'Chưa bắt đầu bài nào', className: 'border-slate-200 bg-slate-50 text-slate-700' },
}

// What a student can do about each signal
export const SIGNAL_ACTIONS = {
  quiz_below_pass: 'Xem lại ý chính rồi làm lại kiểm tra nhanh.',
  unfinished: 'Học tiếp các phần còn lại của bài.',
  no_simulation: 'Mở mô phỏng 3D của bài để quan sát.',
  inactive: 'Quay lại bài để ôn trước khi quên.',
}

export function SignalBadge({ level, audience = 'teacher' }) {
  const style = SIGNAL_LEVELS[level] || SIGNAL_LEVELS.low
  return <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-bold ${style.className}`}>{style[audience]}</span>
}

export default function SignalList({ signals, withActions = false }) {
  if (!signals?.length) return null
  return (
    <ul className="space-y-1.5">
      {signals.map((signal) => (
        <li key={signal.kind} className="text-sm leading-6 text-slate-700">
          <span className="font-semibold text-slate-900">{signal.label}</span>
          {signal.count > 1 ? ` · ${signal.count} bài` : ''}
          {signal.lessons?.length > 0 && <span className="text-slate-500">: {signal.lessons.join('; ')}{signal.count > signal.lessons.length ? '…' : ''}</span>}
          {withActions && SIGNAL_ACTIONS[signal.kind] && <span className="block text-slate-600">→ {SIGNAL_ACTIONS[signal.kind]}</span>}
        </li>
      ))}
    </ul>
  )
}
