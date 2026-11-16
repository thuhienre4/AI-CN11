import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { learningAPI } from '../services/api'

const dateTime = (value) =>
  value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'
const score = (value) => (value === null || value === undefined ? '—' : String(value).replace('.', ','))

/** Class report for a teacher: results per student, completion per lesson, questions most often answered wrongly. */
export default function ClassReportPanel() {
  const [className, setClassName] = useState('')
  const [state, setState] = useState({ status: 'loading', report: null })
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true
    setState((current) => ({ ...current, status: 'loading' }))
    learningAPI
      .getClassReport(className)
      .then(({ data }) => active && setState(data && Array.isArray(data.students) ? { status: 'ready', report: data } : { status: 'error', report: null }))
      .catch(() => active && setState({ status: 'error', report: null }))
    return () => {
      active = false
    }
  }, [className])

  const download = async () => {
    setDownloading(true)
    try {
      const { data } = await learningAPI.downloadClassReport(className)
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = `bao-cao-lop${className ? `-${className}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Chưa tải được báo cáo. Hãy thử lại.')
    } finally {
      setDownloading(false)
    }
  }

  const { status, report } = state
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="class-report">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="class-report" className="text-xl font-bold text-slate-950">Báo cáo kết quả của lớp</h2>
          <p className="mt-1 text-sm text-slate-600">Kết quả từng học sinh, tỉ lệ hoàn thành theo bài và những câu học sinh hay trả lời sai.</p>
        </div>
        {report && (
          <div className="flex flex-wrap items-center gap-2">
            {report.available_classes?.length > 1 && (
              <select aria-label="Chọn lớp" value={className} onChange={(event) => setClassName(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold">
                <option value="">Tất cả lớp của tôi</option>
                {report.available_classes.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            )}
            <button type="button" onClick={download} disabled={downloading || !report.students.length} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
              {downloading ? 'Đang tạo tệp…' : 'Tải báo cáo (CSV)'}
            </button>
          </div>
        )}
      </div>

      {status === 'loading' && !report && <div className="mt-4 h-40 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />}
      {status === 'error' && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-900">Chưa tải được báo cáo từ máy chủ. Kiểm tra kết nối rồi mở lại trang.</p>}

      {report && (
        <div className={status === 'loading' ? 'opacity-60' : ''}>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ['Học sinh', report.summary.students],
              ['Đã bắt đầu học', report.summary.active_students],
              ['Lượt hoàn thành bài', report.summary.lessons_completed],
              ['Bài hoàn thành / học sinh', score(report.summary.average_completed_per_student)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-slate-950">{value}</dd>
              </div>
            ))}
          </dl>

          {!report.students.length ? (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-600">
              Chưa có học sinh đã xác minh trong lớp được phân công. Tạo mã lớp ở mục Xác minh để học sinh tham gia.
            </p>
          ) : (
            <>
              <h3 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">Câu hay sai</h3>
              {report.hard_questions.length ? (
                <ol className="space-y-2">
                  {report.hard_questions.map((item) => (
                    <li key={item.question_id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{item.text}</p>
                        <span className="shrink-0 rounded bg-rose-100 px-2 py-0.5 text-xs font-bold tabular-nums text-rose-900">{item.wrong_percent}% sai</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        {item.lesson_title} · {item.wrong}/{item.answers} học sinh sai ở lần trả lời đầu
                        {item.common_wrong_answer ? ` · hay chọn nhầm: “${item.common_wrong_answer}”` : ''}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Chưa đủ dữ liệu: cần ít nhất 3 học sinh trả lời cùng một câu.</p>
              )}

              <h3 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">Hoàn thành theo bài</h3>
              {report.lessons.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-slate-500">
                      <tr><th className="py-2 pr-3 font-semibold">Bài</th><th className="px-3 py-2 text-right font-semibold">Đã bắt đầu</th><th className="px-3 py-2 text-right font-semibold">Hoàn thành</th><th className="px-3 py-2 text-right font-semibold">% lớp</th><th className="py-2 pl-3 text-right font-semibold">Điểm KT</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.lessons.map((lesson) => (
                        <tr key={lesson.lesson_id}>
                          <td className="py-2 pr-3 font-medium text-slate-900">{lesson.title}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{lesson.started}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{lesson.completed}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{lesson.completion_percent}%</td>
                          <td className="py-2 pl-3 text-right tabular-nums">{score(lesson.average_best_quiz)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Chưa có học sinh nào bắt đầu bài học.</p>
              )}

              <h3 className="mb-2 mt-6 text-sm font-bold uppercase tracking-wide text-slate-500">Từng học sinh</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="py-2 pr-3 font-semibold">Học sinh</th><th className="px-3 py-2 font-semibold">Lớp</th><th className="px-3 py-2 text-right font-semibold">Bài xong</th><th className="px-3 py-2 text-right font-semibold">Điểm KT</th><th className="px-3 py-2 text-right font-semibold">Phút học</th><th className="px-3 py-2 text-right font-semibold">Cấp</th><th className="py-2 pl-3 text-right font-semibold">Gần nhất</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.students.map((student) => (
                      <tr key={student.student_id}>
                        <td className="py-2 pr-3 font-medium text-slate-900">{student.name}</td>
                        <td className="px-3 py-2">{student.class_name}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{student.lessons_completed}/{student.lessons_started}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{score(student.average_best_quiz)}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{student.minutes}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{student.level}</td>
                        <td className="py-2 pl-3 text-right tabular-nums text-slate-600">{dateTime(student.last_activity_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">“Bài xong” là số bài hoàn thành trên số bài đã bắt đầu. “Điểm KT” là trung bình điểm kiểm tra nhanh cao nhất của các bài đã làm.</p>
            </>
          )}
        </div>
      )}
    </section>
  )
}
