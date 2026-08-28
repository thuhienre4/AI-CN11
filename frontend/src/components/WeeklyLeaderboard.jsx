import StudentAvatar from './StudentAvatar'

const eventPoints = {
  lesson_viewed: 10,
  simulation_opened: 20,
  assistant_question: 8,
  game_played: 15,
  lesson_completed: 40,
  quiz_submitted: 25,
}

const getWeekRange = () => {
  const now = new Date()
  const start = new Date(now)
  const day = now.getDay() || 7
  start.setDate(now.getDate() - day + 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

const formatDate = date => new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date)

const readJSON = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
    if (Array.isArray(fallback)) {
      return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : fallback
    }
    return value ?? fallback
  } catch {
    return fallback
  }
}

export default function WeeklyLeaderboard({ currentUser }) {
  const { start, end } = getWeekRange()
  const storedUsers = readJSON('local_auth_users', []).filter(user => user.role === 'student')
  const users = storedUsers.some(user => String(user.id) === String(currentUser?.id))
    ? storedUsers.map(user => String(user.id) === String(currentUser.id) ? { ...user, ...currentUser } : user)
    : [...storedUsers, currentUser].filter(Boolean)
  const events = readJSON('engine_lab_learning_events', []).filter(event => {
    const date = new Date(event.created_at)
    return date >= start && date <= end
  })

  const rows = users.map(user => {
    const activity = events.filter(event => String(event.user_id) === String(user.id))
    const quizzes = activity.filter(event => event.event_type === 'quiz_submitted')
    const points = activity.reduce((total, event) => total + (eventPoints[event.event_type] || 5) + (event.event_type === 'quiz_submitted' ? Math.round(Number(event.score || 0) / 5) : 0), 0)
    return {
      user,
      points,
      activities: activity.length,
      lessons: activity.filter(event => event.event_type === 'lesson_completed').length,
      quizAverage: quizzes.length ? Math.round(quizzes.reduce((sum, event) => sum + Number(event.score || 0), 0) / quizzes.length) : 0,
    }
  }).sort((a, b) => b.points - a.points || b.quizAverage - a.quizAverage).map((row, index) => ({ ...row, rank: index + 1 }))

  const current = rows.find(row => String(row.user.id) === String(currentUser?.id))
  const medals = ['🥇', '🥈', '🥉']

  return <section className="nova-weekly-leaderboard mb-8 overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-lg">
    <div className="nova-weekly-header flex flex-col gap-4 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6 text-white sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.18em] text-amber-50">Vinh danh nỗ lực</p><h2 className="mt-1 text-2xl font-black">Bảng thành tích cuối tuần</h2><p className="mt-2 text-sm font-semibold text-white/90">Tuần {formatDate(start)} – {formatDate(end)} · Cập nhật theo hoạt động học tập</p></div>
      {current && <div className="rounded-2xl bg-white/20 px-5 py-3 text-center backdrop-blur"><p className="text-xs font-bold uppercase">Hạng của em</p><p className="text-2xl font-black">#{current.rank} · {current.points} điểm</p></div>}
    </div>

    <div className="nova-weekly-body grid gap-5 p-5 lg:grid-cols-[1fr_280px] lg:p-6">
      <div className="nova-weekly-list space-y-3">
        {rows.slice(0, 10).map(row => {
          const isCurrent = String(row.user.id) === String(currentUser?.id)
          return <div key={row.user.id} className={`grid grid-cols-[42px_48px_1fr_auto] items-center gap-3 rounded-2xl border p-3 transition ${isCurrent ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-100 bg-slate-50'}`}>
            <span className="text-center text-xl font-black text-slate-500">{medals[row.rank - 1] || `#${row.rank}`}</span>
            {row.user.avatar ? <StudentAvatar avatar={row.user.avatar} className="h-12 w-12 rounded-full" /> : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 text-sm font-black text-white">{(row.user.full_name || row.user.username || 'HS').split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase()}</span>}
            <div className="min-w-0"><p className="truncate font-black text-slate-900">{row.user.full_name || row.user.username}{isCurrent && <span className="ml-2 text-xs text-blue-600">(Em)</span>}</p><p className="text-xs font-semibold text-slate-500">{row.activities} hoạt động · {row.lessons} bài hoàn thành · Quiz TB {row.quizAverage}%</p></div>
            <span className="whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-black text-orange-600 shadow-sm">{row.points} điểm</span>
          </div>
        })}
        {!rows.length && <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600">Chưa có học sinh tham gia trong tuần này.</p>}
      </div>
      <aside className="nova-weekly-guide rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 p-5">
        <span className="text-4xl">🏆</span><h3 className="mt-3 text-lg font-black text-slate-950">Cách tích điểm</h3>
        <ul className="mt-4 space-y-3 text-sm font-semibold text-slate-600"><li>Hoàn thành bài: <b className="text-emerald-700">+40</b></li><li>Làm quiz: <b className="text-amber-700">+25</b> và thưởng theo điểm</li><li>Mở mô phỏng: <b className="text-sky-700">+20</b></li><li>Chơi trò luyện tập: <b className="text-violet-700">+15</b></li><li>Hỏi trợ lý AI: <b className="text-rose-700">+8</b></li></ul>
        <p className="mt-5 rounded-xl bg-white p-3 text-xs leading-5 text-slate-500">Bảng xếp hạng làm mới vào thứ Hai. Mỗi hoạt động học tập đều đáng được ghi nhận!</p>
      </aside>
    </div>
  </section>
}
