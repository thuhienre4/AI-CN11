import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { COMPETENCIES, LEVELS, THPT_EXAM, buildThptExam, scoreThptExam } from '../data/thptQuestionBank'

const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

function ChoiceQuestion({ item, number, value, reviewing, onChoose }) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
      <legend className="sr-only">Câu {number}</legend>
      <p className="font-semibold text-slate-950"><span className="font-black">Câu {number}.</span> {item.text}</p>
      <div className="mt-2 grid gap-1">
        {item.options.map((option, index) => {
          const isRight = reviewing && option === item.correct
          const isWrong = reviewing && option === value && option !== item.correct
          return (
            <label key={option} className={`flex cursor-pointer gap-2 rounded-md px-2 py-1.5 text-sm ${isRight ? 'bg-emerald-50 font-semibold text-emerald-900' : isWrong ? 'bg-rose-50 text-rose-900' : 'hover:bg-slate-50'}`}>
              <input type="radio" name={item.key} checked={value === option} disabled={reviewing} onChange={() => onChoose(option)} />
              <span>{'ABCD'[index]}. {option}</span>
            </label>
          )
        })}
      </div>
      {reviewing && (
        <p className="mt-2 text-sm text-slate-600">
          {item.explanation} <span className="text-slate-500">({LEVELS[item.level]} · {COMPETENCIES[item.competency]} · Lớp {item.grade}, Bài {item.lesson})</span>
        </p>
      )}
    </fieldset>
  )
}

function TrueFalseQuestion({ cluster, number, value = {}, reviewing, onChoose }) {
  return (
    <fieldset className="rounded-lg border border-slate-200 bg-white p-4">
      <legend className="sr-only">Câu {number} phần II</legend>
      <p className="font-semibold text-slate-950"><span className="font-black">Câu {number}.</span> {cluster.stem}</p>
      <div className="mt-2 grid gap-2">
        {cluster.items.map(([text, truth], index) => (
          <div key={text} className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md px-2 py-1 text-sm ${reviewing ? (value[index] === truth ? 'bg-emerald-50' : 'bg-rose-50') : ''}`}>
            <span className="min-w-0 flex-1 basis-64">{'abcd'[index]}) {text}</span>
            {[[true, 'Đúng'], [false, 'Sai']].map(([option, label]) => (
              <label key={label} className="flex items-center gap-1">
                <input type="radio" name={`${cluster.key}-${index}`} checked={value[index] === option} disabled={reviewing} onChange={() => onChoose(index, option)} />
                {label}
              </label>
            ))}
            {reviewing && <span className="font-semibold">Đáp án: {truth ? 'Đúng' : 'Sai'}</span>}
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default function ThptExam() {
  const [seed, setSeed] = useState(() => Date.now())
  const exam = useMemo(() => buildThptExam(seed), [seed])
  const [answers, setAnswers] = useState({ choice: {}, truth: {} })
  const [secondsLeft, setSecondsLeft] = useState(THPT_EXAM.minutes * 60)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return undefined
    const timer = setInterval(() => setSecondsLeft((left) => Math.max(left - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [submitted, seed])

  useEffect(() => {
    if (secondsLeft === 0) setSubmitted(true)
  }, [secondsLeft])

  useEffect(() => {
    if (submitted) window.scrollTo(0, 0)
  }, [submitted])

  const result = submitted ? scoreThptExam(exam, answers) : null
  const answered = Object.keys(answers.choice).length
    + Object.values(answers.truth).reduce((sum, items) => sum + Object.keys(items).length, 0)
  const total = THPT_EXAM.multipleChoice + THPT_EXAM.trueFalse * 4

  const startAgain = () => {
    setSeed(Date.now())
    setAnswers({ choice: {}, truth: {} })
    setSecondsLeft(THPT_EXAM.minutes * 60)
    setSubmitted(false)
    window.scrollTo(0, 0)
  }

  return (
    <div className="page-container">
      <header className="sticky top-20 z-20 -mx-2 mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-black text-slate-950">Đề luyện tốt nghiệp THPT - Công nghệ công nghiệp</h1>
          <p className="text-xs text-slate-600">Đề do EngineLab tạo theo định dạng 24 câu + 4 câu đúng/sai, không phải đề của Bộ.</p>
        </div>
        {result ? (
          <p className="text-xl font-black text-blue-700">{result.score.toFixed(2).replace('.', ',')} / 10 điểm</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-600">{answered}/{total} ý</p>
            <p role="timer" className="text-xl font-black text-slate-950">{clock(secondsLeft)}</p>
            <button type="button" className="primary-button" onClick={() => setSubmitted(true)}>Nộp bài</button>
          </>
        )}
      </header>

      {result && (
        <section className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
          <p>Phần I: đúng {result.multipleChoiceRight}/{THPT_EXAM.multipleChoice} câu.</p>
          <p>Phần II: đúng {result.clusterRight.join(', ')} trên 4 ý ở từng câu.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="primary-button" onClick={startAgain}>Làm đề khác</button>
            <Link to="/practice-bank" className="secondary-button">Về kho đề</Link>
          </div>
        </section>
      )}

      <h2 className="mb-2 font-black text-slate-950">Phần I. Câu trắc nghiệm nhiều phương án lựa chọn (6 điểm)</h2>
      <div className="grid gap-3">
        {exam.multipleChoice.map((item, index) => (
          <ChoiceQuestion
            key={item.key}
            item={item}
            number={index + 1}
            value={answers.choice[item.key]}
            reviewing={submitted}
            onChoose={(option) => setAnswers((current) => ({ ...current, choice: { ...current.choice, [item.key]: option } }))}
          />
        ))}
      </div>

      <h2 className="mb-2 mt-6 font-black text-slate-950">Phần II. Câu trắc nghiệm đúng sai (4 điểm)</h2>
      <div className="grid gap-3">
        {exam.trueFalse.map((cluster, index) => (
          <TrueFalseQuestion
            key={cluster.key}
            cluster={cluster}
            number={index + 1}
            value={answers.truth[cluster.key]}
            reviewing={submitted}
            onChoose={(item, option) => setAnswers((current) => ({
              ...current,
              truth: { ...current.truth, [cluster.key]: { ...current.truth[cluster.key], [item]: option } },
            }))}
          />
        ))}
      </div>
    </div>
  )
}
