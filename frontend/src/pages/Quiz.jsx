import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { questionsAPI, quizAPI } from '../services/api'
import { useAuthStore } from '../store'
import { getSampleLesson, getSampleQuestionsByLesson } from '../data/courseCatalog'
import { recordLocalLearningEvent, syncPendingLearningEvents } from '../utils/learningProgress'

export default function Quiz() {
  const { lessonId } = useParams()
  const user = useAuthStore((state) => state.user)
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [attemptId, setAttemptId] = useState(null)
  const lesson = getSampleLesson(lessonId)

  useEffect(() => {
    fetchQuestions()
  }, [lessonId])

  const fetchQuestions = async () => {
    try {
      const response = await questionsAPI.list(lessonId)
      setQuestions(response.data)
    } catch (error) {
      setQuestions(getSampleQuestionsByLesson(lessonId))
    } finally {
      setIsLoading(false)
    }
    if (user?.id) {
      try {
        const attempt = await quizAPI.startAttempt(user.id, lessonId)
        setAttemptId(attempt.data.id)
      } catch {
        setAttemptId(null)
      }
    }
  }

  const handleAnswer = async (optionId) => {
    const question = questions[currentIndex]
    let isCorrect = question.options.some((opt) => opt.id === optionId && opt.is_correct)

    try {
      const response = await quizAPI.submit(user?.id || 1, {
        question_id: question.id,
        attempt_id: attemptId,
        selected_answer: optionId.toString(),
        time_spent_seconds: 30,
      })
      isCorrect = Boolean(response.data?.is_correct)
    } catch {
      // Offline mode: kiểm tra vẫn chạy khi backend chưa bật.
    }

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      const finalScore = score + (isCorrect ? 1 : 0)
      const scorePercent = Math.round((finalScore / questions.length) * 100)
      const localEvent = recordLocalLearningEvent(user?.id, {
        lesson_id: Number(lessonId),
        event_type: 'quiz_submitted',
        duration_seconds: 30,
        score: scorePercent,
        payload: { correct_answers: finalScore, total_questions: questions.length },
        auto_sync: false,
      })
      if (attemptId) {
        try {
          await quizAPI.finalizeAttempt(attemptId, { client_event_id: localEvent?.client_event_id })
        } catch {
          void syncPendingLearningEvents(user?.id)
        }
      } else {
        void syncPendingLearningEvents(user?.id)
      }
      setQuizSubmitted(true)
    }
  }

  if (isLoading) {
    return <div className="page-container text-center text-slate-600">Đang tải bài kiểm tra...</div>
  }

  if (questions.length === 0) {
    return <div className="page-container text-center text-slate-600">Bài này chưa có câu hỏi kiểm tra.</div>
  }

  if (quizSubmitted) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="nova-quiz-page page-container">
        <div className="nova-quiz-result panel mx-auto max-w-2xl p-8 text-center">
          <p className="muted-label mb-2">Kết quả đánh giá</p>
          <h1 className="text-3xl font-bold text-slate-950">Hoàn thành kiểm tra nhanh</h1>
          <div className="my-8">
            <div className="text-6xl font-bold text-blue-600">{percentage}%</div>
            <p className="mt-3 text-lg text-slate-600">
              Bạn trả lời đúng {score} trên {questions.length} câu
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setCurrentIndex(0)
                setScore(0)
                setQuizSubmitted(false)
                setAttemptId(null)
                if (user?.id) {
                  quizAPI.startAttempt(user.id, lessonId)
                    .then((response) => setAttemptId(response.data.id))
                    .catch(() => setAttemptId(null))
                }
              }}
              className="primary-button"
            >
              Làm lại
            </button>
            <Link to={`/lessons/${lessonId}`} className="secondary-button">
              Quay lại bài học
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="nova-quiz-page page-container">
      <div className="nova-quiz-card panel mx-auto max-w-3xl p-6 sm:p-8">
        <div className="mb-6">
          <p className="muted-label mb-2">Kiểm tra nhanh</p>
          <h1 className="text-2xl font-bold text-slate-950">{lesson?.title || 'Động cơ đốt trong'}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Chọn đáp án đúng nhất để tự đánh giá mức độ hiểu bài.
          </p>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">
              Câu {currentIndex + 1} / {questions.length}
            </span>
            <span className="rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {question.points} điểm
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <h2 className="mb-6 text-2xl font-bold leading-8 text-slate-950">{question.text}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-700">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-slate-800">{option.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
