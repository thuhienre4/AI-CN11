import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BOOKS, CHAPTER_EXAM, bankExam, blueprintSummary, sampleExam, scoreChapterExam } from '../data/chapterExams'
import { LEVELS, allThptQuestions } from '../data/thptQuestionBank'
import { useAuthStore } from '../store'
import { canActAsTeacher } from '../utils/roles'

const GRADES = [10, 11, 12]
const LETTERS = 'ABCD'
const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
const points = (value) => value.toFixed(2).replace('.', ',').replace(/,?0+$/, '') || '0'
const percent = (value) => `${Math.round(value * 1000) / 10}`.replace('.', ',')

function Blueprint({ grade }) {
  const { rows, totals } = blueprintSummary(grade)
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="px-4 py-3 text-left text-sm font-black text-slate-950">
          Ma trận lớp {grade} – {BOOKS[grade]} (12 câu nhiều lựa chọn, 4 câu đúng – sai, 2 câu tự luận; 45 phút)
        </caption>
        <thead className="bg-slate-50 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-3 py-2">Chương</th>
            <th className="px-3 py-2">Số bài</th>
            <th className="px-3 py-2">Nhiều lựa chọn B / H</th>
            <th className="px-3 py-2">Đúng – sai (ý a–d)</th>
            <th className="px-3 py-2">Tự luận</th>
            <th className="px-3 py-2">Điểm</th>
            <th className="px-3 py-2">% điểm / % bài</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-t border-slate-100">
              <td className="px-3 py-2 font-semibold text-slate-900">{row.code}. {row.title}</td>
              <td className="px-3 py-2">{row.lessonCount}</td>
              <td className="px-3 py-2">{row.mcB} / {row.mcH}</td>
              <td className="px-3 py-2">{row.tf.length ? row.tf.map((p) => p.split('').join('–')).join('; ') : '—'}</td>
              <td className="px-3 py-2">{row.essays ? `${row.essays} câu` : '—'}</td>
              <td className="px-3 py-2 font-semibold">{points(row.points.total)}</td>
              <td className="px-3 py-2">{percent(row.pointShare)} / {percent(row.lessonShare)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-slate-300 font-semibold">
            <td className="px-3 py-2">Tổng</td>
            <td className="px-3 py-2">{rows.reduce((s, r) => s + r.lessonCount, 0)}</td>
            <td className="px-3 py-2">{rows.reduce((s, r) => s + r.mcB, 0)} / {rows.reduce((s, r) => s + r.mcH, 0)}</td>
            <td className="px-3 py-2">{totals.trueFalse} câu</td>
            <td className="px-3 py-2">{totals.essays} câu</td>
            <td className="px-3 py-2">{points(totals.total)}</td>
            <td className="px-3 py-2">Biết {points(totals.B)} – Hiểu {points(totals.H)} – Vận dụng {points(totals.V)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Tag({ children, show }) {
  if (!show) return null
  return <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-medium text-slate-600 print:hidden">{children}</span>
}

export default function ChapterExam() {
  const user = useAuthStore((state) => state.user)
  const teacher = canActAsTeacher(user)
  const [grade, setGrade] = useState(11)
  const [source, setSource] = useState('sample')
  const [seed, setSeed] = useState(() => Date.now())
  const [answers, setAnswers] = useState({ choice: {}, truth: {}, essay: {} })
  const [submitted, setSubmitted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(CHAPTER_EXAM.minutes * 60)
  const [showKey, setShowKey] = useState(false)

  const exam = useMemo(
    () => (source === 'bank' ? bankExam(grade, allThptQuestions(), seed) : sampleExam(grade)),
    [grade, source, seed],
  )

  const reset = (next = {}) => {
    if (next.grade) setGrade(next.grade)
    if (next.source) setSource(next.source)
    setSeed(Date.now())
    setAnswers({ choice: {}, truth: {}, essay: {} })
    setSubmitted(false)
    setShowKey(false)
    setSecondsLeft(CHAPTER_EXAM.minutes * 60)
  }

  useEffect(() => {
    if (submitted) return undefined
    const timer = setInterval(() => setSecondsLeft((left) => Math.max(left - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [submitted, seed, grade, source])

  useEffect(() => {
    if (secondsLeft === 0) setSubmitted(true)
  }, [secondsLeft])

  const reviewing = submitted || showKey
  const result = submitted ? scoreChapterExam(exam, answers) : null

  return (
    <div className="page-container">
      <header className="mb-4 print:mb-2">
        <p className="muted-label">Kiểm tra theo ma trận đề</p>
        <h1 className="mt-1 text-2xl font-black text-slate-950">Đề kiểm tra cuối năm theo chương – lớp {grade}</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600 print:hidden">
          Cấu trúc theo Công văn 7991/BGDĐT-GDTrH: trắc nghiệm 7 điểm, tự luận 3 điểm; tỉ lệ Biết 40% – Hiểu 30% – Vận dụng 30%.
          Đề mẫu do EngineLab soạn với hỗ trợ của AI, chưa được tổ chuyên môn duyệt; dùng để luyện tập, không dùng để lấy điểm chính thức.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <div className="studio-tabs" role="group" aria-label="Chọn khối">
          {GRADES.map((value) => (
            <button key={value} type="button" aria-pressed={grade === value} onClick={() => reset({ grade: value })}>Lớp {value}</button>
          ))}
        </div>
        <button type="button" className={source === 'sample' ? 'primary-button' : 'secondary-button'} onClick={() => reset({ source: 'sample' })}>Đề mẫu</button>
        <button type="button" className={source === 'bank' ? 'primary-button' : 'secondary-button'} onClick={() => reset({ source: 'bank' })}>Đề mới (Phần I từ ngân hàng)</button>
        {teacher && (
          <>
            <button type="button" className="secondary-button" onClick={() => setShowKey((value) => !value)}>{showKey ? 'Ẩn đáp án' : 'Xem đáp án'}</button>
            <button type="button" className="secondary-button" onClick={() => window.print()}>In đề</button>
          </>
        )}
      </div>

      <section className="mb-6 print:hidden"><Blueprint grade={grade} /></section>

      <div className="sticky top-20 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm print:hidden">
        <p className="min-w-0 flex-1 text-sm text-slate-600">
          {source === 'bank' ? 'Phần I lấy ngẫu nhiên từ ngân hàng theo đúng số câu và mức độ của từng chương; Phần II, III giữ như đề mẫu.' : 'Đề mẫu theo ma trận.'}
        </p>
        {result ? (
          <p className="text-lg font-black text-slate-950">Trắc nghiệm: {points(result.objective)} / 7 điểm</p>
        ) : (
          <>
            <p role="timer" className="text-xl font-black text-slate-950">{clock(secondsLeft)}</p>
            <button type="button" className="primary-button" onClick={() => { setSubmitted(true); window.scrollTo(0, 0) }}>Nộp bài</button>
          </>
        )}
      </div>

      {result && (
        <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm print:hidden">
          <p>Phần I: đúng {result.multipleChoiceRight}/12 câu. Phần II: đúng {result.trueFalseRight.join(', ')} trên 4 ý ở từng câu.</p>
          <p className="mt-1 text-slate-600">Phần III (3 điểm) do giáo viên chấm theo hướng dẫn hiện dưới mỗi câu tự luận.</p>
          <button type="button" className="primary-button mt-3" onClick={() => reset({ source })}>Làm lại</button>
        </section>
      )}

      <h2 className="mb-2 font-black text-slate-950">Phần I. Trắc nghiệm nhiều lựa chọn (3,0 điểm)</h2>
      <div className="grid gap-3">
        {exam.multipleChoice.map((item, number) => (
          <fieldset key={item.key} className="rounded-lg border border-slate-200 bg-white p-4 print:break-inside-avoid">
            <legend className="sr-only">Câu {number + 1}</legend>
            <p className="font-semibold text-slate-950">
              <span className="font-black">Câu {number + 1}.</span> {item.text}
              <Tag show={teacher}>{item.chapter} – {item.level}</Tag>
            </p>
            <div className="mt-2 grid gap-1">
              {item.options.map((option, index) => {
                const right = reviewing && option === item.correct
                const wrong = submitted && answers.choice[item.key] === option && option !== item.correct
                return (
                  <label key={option} className={`flex cursor-pointer gap-2 rounded-md px-2 py-1.5 text-sm ${right ? 'bg-emerald-50 font-semibold text-emerald-900' : wrong ? 'bg-rose-50 text-rose-900' : 'hover:bg-slate-50'}`}>
                    <input type="radio" name={item.key} checked={answers.choice[item.key] === option} disabled={submitted}
                      onChange={() => setAnswers((current) => ({ ...current, choice: { ...current.choice, [item.key]: option } }))} />
                    <span>{LETTERS[index]}. {option}</span>
                  </label>
                )
              })}
            </div>
            {reviewing && item.explanation && <p className="mt-2 text-sm text-slate-600">{item.explanation} ({LEVELS[item.level]})</p>}
          </fieldset>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-black text-slate-950">Phần II. Trắc nghiệm đúng – sai (4,0 điểm)</h2>
      <div className="grid gap-3">
        {exam.trueFalse.map((cluster, number) => (
          <fieldset key={cluster.key} className="rounded-lg border border-slate-200 bg-white p-4 print:break-inside-avoid">
            <legend className="sr-only">Câu {number + 1} phần II</legend>
            <p className="font-semibold text-slate-950"><span className="font-black">Câu {number + 1}.</span> {cluster.stem}<Tag show={teacher}>{cluster.chapter}</Tag></p>
            <div className="mt-2 grid gap-2">
              {cluster.items.map((statement, index) => {
                const chosen = answers.truth[cluster.key]?.[index]
                return (
                  <div key={statement.text} className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md px-2 py-1 text-sm ${submitted ? (chosen === statement.truth ? 'bg-emerald-50' : 'bg-rose-50') : ''}`}>
                    <span className="min-w-0 flex-1 basis-64">{'abcd'[index]}) {statement.text}<Tag show={teacher}>{statement.level}</Tag></span>
                    {[[true, 'Đúng'], [false, 'Sai']].map(([value, label]) => (
                      <label key={label} className="flex items-center gap-1 print:hidden">
                        <input type="radio" name={`${cluster.key}-${index}`} checked={chosen === value} disabled={submitted}
                          onChange={() => setAnswers((current) => ({ ...current, truth: { ...current.truth, [cluster.key]: { ...current.truth[cluster.key], [index]: value } } }))} />
                        {label}
                      </label>
                    ))}
                    {reviewing && <span className="font-semibold">Đáp án: {statement.truth ? 'Đúng' : 'Sai'}</span>}
                  </div>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-black text-slate-950">Phần III. Tự luận (3,0 điểm)</h2>
      <div className="grid gap-3">
        {exam.essays.map((essay, number) => (
          <section key={essay.key} className="rounded-lg border border-slate-200 bg-white p-4 print:break-inside-avoid">
            <p className="font-semibold text-slate-950">
              <span className="font-black">Câu {number + 1}</span> ({points(essay.points)} điểm). {essay.prompt}
              <Tag show={teacher}>{essay.chapter} – VD</Tag>
            </p>
            <label className="sr-only" htmlFor={essay.key}>Bài làm câu {number + 1}</label>
            <textarea id={essay.key} rows={5} className="field-control mt-2 print:hidden" disabled={submitted}
              value={answers.essay[essay.key] || ''}
              onChange={(event) => setAnswers((current) => ({ ...current, essay: { ...current.essay, [essay.key]: event.target.value } }))} />
            {reviewing && (
              <table className="mt-3 w-full text-left text-sm">
                <caption className="text-left font-semibold text-slate-900">Hướng dẫn chấm</caption>
                <tbody>
                  {essay.rubric.map((row) => (
                    <tr key={row.text} className="border-t border-slate-100">
                      <td className="py-1 pr-3">{row.text}</td>
                      <td className="w-16 py-1 text-right font-semibold">{points(row.points)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
      </div>

      <p className="mt-6 text-sm print:hidden">
        <Link to="/practice-bank" className="font-semibold text-blue-700 hover:underline">← Về kho đề</Link>
      </p>
    </div>
  )
}
