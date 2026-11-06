import { useEffect, useState } from 'react'
import { learningAPI } from '../services/api'

const SIGNAL_LABELS = { high: 'Cần xem sớm', medium: 'Nên xem', low: 'Chưa có tín hiệu' }

export default function TeacherAnalyticsPanel() {
  const [analytics, setAnalytics] = useState(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    let active = true
    learningAPI
      .getTeacherAnalytics()
      .then(({ data }) => active && setAnalytics(data))
      .catch(() => active && setUnavailable(true))
    return () => {
      active = false
    }
  }, [])

  if (unavailable) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Chưa tải được dữ liệu lớp từ máy chủ. Phiên trình diễn cục bộ không có dữ liệu này.
      </section>
    )
  }
  if (!analytics) return null

  const { summary, at_risk_students: students, needs_class_assignment: needsClass, score_note: note } = analytics

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Tín hiệu học tập của lớp</h2>
      {needsClass ? (
        <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Tài khoản chưa được gán lớp nên chưa hiển thị dữ liệu học sinh. Hãy nhờ quản trị viên gán lớp phụ trách.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['Học sinh trong lớp phụ trách', summary.total_students],
              ['Đã có hoạt động', summary.active_students],
              ['Cần xem sớm', summary.high_risk_students],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-600">{label}</dt>
                <dd className="mt-1 text-2xl font-bold text-slate-950">{value}</dd>
              </div>
            ))}
          </dl>
          {students.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100">
              {students.map((student) => (
                <li key={student.student_id} className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm">
                  <span className="font-semibold text-slate-900">
                    {student.name} · {student.class_name}
                  </span>
                  <span className="text-slate-600">
                    {SIGNAL_LABELS[student.risk_level]}
                    {student.risk_level !== 'low' && student.recommendations?.[0]?.reason
                      ? `: ${student.recommendations[0].reason}`
                      : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <p className="mt-4 text-xs leading-5 text-slate-500">{note}</p>
    </section>
  )
}
