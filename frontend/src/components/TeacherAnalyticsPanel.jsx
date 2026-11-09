import { useEffect, useState } from 'react'
import { learningAPI } from '../services/api'
import SignalList, { SignalBadge } from './SignalList'

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
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Học sinh lớp phụ trách', summary.total_students],
              ['Đã có hoạt động', summary.active_students],
              ['Cần xem sớm', summary.high_risk_students],
              ['Chưa bắt đầu học', summary.not_started_students ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <dt className="text-sm text-slate-600">{label}</dt>
                <dd className="mt-1 text-2xl font-bold text-slate-950">{value}</dd>
              </div>
            ))}
          </dl>
          {students.length > 0 ? (
            <ul className="mt-4 divide-y divide-slate-100">
              {students.map((student) => (
                <li key={student.student_id} className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">{student.name}</span>
                    <span className="text-sm text-slate-500">{student.class_name}</span>
                    <SignalBadge level={student.risk_level} />
                  </div>
                  <div className="mt-1.5">
                    {student.risk_level === 'none'
                      ? <p className="text-sm text-slate-600">Chưa mở bài học nào trên hệ thống.</p>
                      : <SignalList signals={student.signals} />}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-600">Không học sinh nào có tín hiệu cần xem.</p>
          )}
        </>
      )}
      <p className="mt-4 text-xs leading-5 text-slate-500">
        {note} Mỗi tín hiệu là một sự việc ghi nhận được (điểm kiểm tra, mức hoàn thành, mô phỏng, lần quay lại bài), không phải nhận xét về học sinh.
      </p>
    </section>
  )
}
