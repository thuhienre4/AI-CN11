import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChapterAssessmentsByCourse, getSampleCourse } from '../data/courseCatalog'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const getQuestionType = (question) => question.question_type || 'multiple_choice'

const normalizeText = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const arraysEqual = (a = [], b = []) => {
  const left = [...a].sort((x, y) => x - y)
  const right = [...b].sort((x, y) => x - y)
  return left.length === right.length && left.every((value, index) => value === right[index])
}

const isAnswered = (question, answer) => {
  const type = getQuestionType(question)
  if (type === 'true_false') return typeof answer === 'boolean'
  if (type === 'multi_select') return Array.isArray(answer) && answer.length > 0
  if (type === 'fill_blank') return String(answer || '').trim().length > 0
  if (type === 'matching') return question.pairs?.every((pair) => answer?.[pair.term])
  return typeof answer === 'number'
}

const isCorrectAnswer = (question, answer) => {
  const type = getQuestionType(question)
  if (type === 'true_false') return answer === question.correctBoolean
  if (type === 'multi_select') return arraysEqual(answer, question.correctIndexes || [])
  if (type === 'fill_blank') {
    const normalizedAnswer = normalizeText(answer)
    return question.acceptedAnswers?.some((accepted) => normalizeText(accepted) === normalizedAnswer)
  }
  if (type === 'matching') {
    return question.pairs?.every((pair) => answer?.[pair.term] === pair.answer)
  }
  return answer === question.correctIndex
}

const questionTypeLabels = {
  multiple_choice: 'Trắc nghiệm',
  true_false: 'Đúng / Sai',
  multi_select: 'Nhiều đáp án',
  fill_blank: 'Điền khuyết',
  matching: 'Ghép cặp',
}

function QuestionInput({ question, answer, setAnswer, submitted }) {
  const type = getQuestionType(question)

  if (type === 'true_false') {
    return (
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {[true, false].map((value) => {
          const isSelected = answer === value
          const isCorrect = submitted && question.correctBoolean === value
          const isWrong = submitted && isSelected && question.correctBoolean !== value
          return (
            <button
              key={String(value)}
              type="button"
              onClick={() => !submitted && setAnswer(value)}
              className={`rounded-md border bg-white p-3 text-left text-sm font-bold transition ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                  : isWrong
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : isSelected
                      ? 'border-blue-400 bg-blue-50 text-blue-950'
                      : 'border-slate-200 text-slate-700 hover:border-blue-200'
              }`}
            >
              {value ? 'Đúng' : 'Sai'}
            </button>
          )
        })}
      </div>
    )
  }

  if (type === 'multi_select') {
    const selectedAnswers = Array.isArray(answer) ? answer : []
    return (
      <div className="mt-3 space-y-2">
        {question.options.map((option, optionIndex) => {
          const isSelected = selectedAnswers.includes(optionIndex)
          const isCorrect = submitted && question.correctIndexes?.includes(optionIndex)
          const isWrong = submitted && isSelected && !question.correctIndexes?.includes(optionIndex)

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (submitted) return
                setAnswer(
                  isSelected
                    ? selectedAnswers.filter((item) => item !== optionIndex)
                    : [...selectedAnswers, optionIndex]
                )
              }}
              className={`flex w-full items-start gap-3 rounded-md border bg-white p-3 text-left text-sm transition ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                  : isWrong
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : isSelected
                      ? 'border-blue-400 bg-blue-50 text-blue-950'
                      : 'border-slate-200 text-slate-700 hover:border-blue-200'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold">
                {isSelected ? '✓' : String.fromCharCode(65 + optionIndex)}
              </span>
              <span>{option}</span>
            </button>
          )
        })}
      </div>
    )
  }

  if (type === 'fill_blank') {
    const isCorrect = submitted && isCorrectAnswer(question, answer)
    const isWrong = submitted && !isCorrect
    return (
      <input
        type="text"
        value={answer || ''}
        onChange={(event) => setAnswer(event.target.value)}
        disabled={submitted}
        placeholder="Nhập câu trả lời ngắn"
        className={`mt-3 w-full rounded-md border bg-white px-3 py-3 text-sm font-semibold outline-none transition ${
          isCorrect
            ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
            : isWrong
              ? 'border-red-300 bg-red-50 text-red-900'
              : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        }`}
      />
    )
  }

  if (type === 'matching') {
    const current = answer || {}
    const answerOptions = question.pairs.map((pair) => pair.answer)
    return (
      <div className="mt-3 space-y-2">
        {question.pairs.map((pair) => {
          const isCorrect = submitted && current[pair.term] === pair.answer
          const isWrong = submitted && current[pair.term] && current[pair.term] !== pair.answer
          return (
            <div
              key={pair.term}
              className={`grid gap-2 rounded-md border bg-white p-3 text-sm sm:grid-cols-[180px_1fr] ${
                isCorrect
                  ? 'border-emerald-400 bg-emerald-50'
                  : isWrong
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200'
              }`}
            >
              <div className="font-black text-slate-900">{pair.term}</div>
              <select
                value={current[pair.term] || ''}
                onChange={(event) =>
                  setAnswer({
                    ...current,
                    [pair.term]: event.target.value,
                  })
                }
                disabled={submitted}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
              >
                <option value="">Chọn ý nghĩa phù hợp</option>
                {answerOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mt-3 space-y-2">
      {question.options.map((option, optionIndex) => {
        const isSelected = answer === optionIndex
        const isCorrect = submitted && question.correctIndex === optionIndex
        const isWrong = submitted && isSelected && question.correctIndex !== optionIndex

        return (
          <button
            key={option}
            type="button"
            onClick={() => !submitted && setAnswer(optionIndex)}
            className={`flex w-full items-start gap-3 rounded-md border bg-white p-3 text-left text-sm transition ${
              isCorrect
                ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                : isWrong
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : isSelected
                    ? 'border-blue-400 bg-blue-50 text-blue-950'
                    : 'border-slate-200 text-slate-700 hover:border-blue-200'
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-bold">
              {String.fromCharCode(65 + optionIndex)}
            </span>
            <span>{option}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function ChapterTests() {
  const { courseId } = useParams()
  const user = useAuthStore((state) => state.user)
  const course = getSampleCourse(courseId)
  const assessments = getChapterAssessmentsByCourse(courseId)
  const [activeId, setActiveId] = useState(assessments[0]?.id || '')
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const activeAssessment = useMemo(
    () => assessments.find((assessment) => assessment.id === activeId) || assessments[0],
    [assessments, activeId],
  )

  const handleSelectAssessment = (assessmentId) => {
    setActiveId(assessmentId)
    setAnswers({})
    setSubmitted(false)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (!activeAssessment) return

    const correctCount = activeAssessment.questions.filter(
      (question) => isCorrectAnswer(question, answers[question.id]),
    ).length

    recordLocalLearningEvent(user?.id, {
      lesson_id: Number(courseId),
      event_type: 'chapter_test_submitted',
      duration_seconds: activeAssessment.duration_minutes * 60,
      score: Math.round((correctCount / activeAssessment.questions.length) * 100),
      payload: {
        assessment_id: activeAssessment.id,
        correct_answers: correctCount,
        total_questions: activeAssessment.questions.length,
      },
    })
  }

  if (!course) {
    return (
      <div className="page-container">
        <div className="panel p-8 text-center text-slate-600">Không tìm thấy học phần.</div>
      </div>
    )
  }

  if (!activeAssessment) {
    return (
      <div className="page-container">
        <Link to={`/courses/${courseId}`} className="mb-5 inline-flex text-sm font-semibold text-blue-700">
          Quay lại học phần
        </Link>
        <div className="panel p-8 text-center text-slate-600">
          Học phần này chưa có bài kiểm tra theo chương.
        </div>
      </div>
    )
  }

  const correctCount = activeAssessment.questions.filter(
    (question) => isCorrectAnswer(question, answers[question.id]),
  ).length
  const scorePercent = Math.round((correctCount / activeAssessment.questions.length) * 100)
  const answeredCount = activeAssessment.questions.filter((question) => isAnswered(question, answers[question.id])).length

  return (
    <div className="page-container">
      <Link to={`/courses/${courseId}`} className="mb-5 inline-flex text-sm font-semibold text-blue-700">
        Quay lại học phần
      </Link>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="muted-label mb-2">Ôn nhanh cuối chương</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Mini test theo nội dung slide</h1>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">
          {course.title}. Câu hỏi bao quát kiến thức trọng tâm của từng bài trong chương; học sinh làm trực
          tiếp và xem giải thích theo nội dung slide ngay sau khi nộp.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-3">
          {assessments.map((assessment) => (
            <button
              key={assessment.id}
              type="button"
              onClick={() => handleSelectAssessment(assessment.id)}
              className={`w-full rounded-lg border p-4 text-left transition ${
                activeAssessment.id === assessment.id
                  ? 'border-blue-500 bg-blue-50 text-blue-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200'
              }`}
            >
              <div className="text-sm font-bold">{assessment.chapter}</div>
              <div className="mt-1 font-semibold">{assessment.title}</div>
              <div className="mt-2 text-xs text-slate-500">
                {assessment.questions.length} câu · {assessment.duration_minutes} phút
              </div>
            </button>
          ))}
        </aside>

        <main className="panel p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 border-b border-slate-200 pb-5 sm:flex-row">
            <div>
              <p className="muted-label mb-1">{activeAssessment.chapter}</p>
              <h2 className="text-2xl font-bold text-slate-950">{activeAssessment.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{activeAssessment.description}</p>
            </div>
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {activeAssessment.questions.length} câu hỏi
            </div>
          </div>

          <div className="space-y-5">
            {activeAssessment.questions.map((question, questionIndex) => (
              <div key={question.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold leading-7 text-slate-950">
                  Câu {questionIndex + 1}. {question.text}
                </h3>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">
                  {questionTypeLabels[getQuestionType(question)] || 'Câu hỏi'}
                </span>
                <QuestionInput
                  question={question}
                  answer={answers[question.id]}
                  submitted={submitted}
                  setAnswer={(value) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: value,
                    }))
                  }
                />
                {submitted && (
                  <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-slate-700">
                    {question.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            {submitted ? (
              <div>
                <div className="text-lg font-bold text-slate-950">Kết quả: {scorePercent}%</div>
                <div className="text-sm text-slate-600">
                  Đúng {correctCount}/{activeAssessment.questions.length} câu.
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Đã trả lời {answeredCount}/{activeAssessment.questions.length} câu.
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAnswers({})
                  setSubmitted(false)
                }}
                className="secondary-button"
              >
                Làm lại
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={answeredCount < activeAssessment.questions.length}
                className="primary-button disabled:cursor-not-allowed disabled:opacity-50"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
