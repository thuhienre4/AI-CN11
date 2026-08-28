import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getGrade10SlideMaterialByLesson } from '../data/grade10DriveMaterials'
import { getGrade12MaterialByLesson } from '../data/grade12DriveMaterials'
import toast from 'react-hot-toast'
import { lessonsAPI } from '../services/api'
import { useAuthStore } from '../store'
import { getInteractiveActivity, getSampleLesson } from '../data/courseCatalog'
import { recordLocalLearningEvent } from '../utils/learningProgress'
import { useLearningSession } from '../hooks/useLearningSession'

function InteractiveLearning({ activity }) {
  const [openCard, setOpenCard] = useState(null)
  const [selectedTerm, setSelectedTerm] = useState(activity.matching[0]?.term || '')
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [matchFeedback, setMatchFeedback] = useState(null)
  const [scenarioFeedback, setScenarioFeedback] = useState(null)
  const [checkedItems, setCheckedItems] = useState([])

  const currentMatch = activity.matching.find((item) => item.term === selectedTerm)

  const checkMatch = () => {
    const isCorrect = selectedAnswer === currentMatch?.answer
    setMatchFeedback(
      isCorrect
        ? 'Đúng. Em đã ghép đúng nhiệm vụ của bộ phận/hệ thống.'
        : 'Chưa đúng. Hãy đọc lại nhiệm vụ rồi thử ghép lại.'
    )
  }

  const toggleChecklist = (item) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]
    )
  }

  return (
    <section className="panel p-6">
      <div className="mb-5">
        <p className="muted-label mb-1">Luyện nhớ kiến thức</p>
        <h2 className="text-xl font-bold text-slate-950">Hoạt động tương tác</h2>
        <p className="mt-2 text-sm text-slate-600">
          Dùng các hoạt động này sau khi đọc bài để biến kiến thức thành khả năng giải thích.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-950">1. Thẻ lật ghi nhớ</h3>
          <div className="mt-3 space-y-3">
            {activity.flashcards.map((card, index) => (
              <button
                key={card.front}
                type="button"
                onClick={() => setOpenCard(openCard === index ? null : index)}
                className="w-full rounded-md border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300"
              >
                <p className="text-sm font-semibold text-slate-900">{card.front}</p>
                {openCard === index && (
                  <p className="mt-3 rounded-md bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                    {card.back}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-950">2. Ghép cặp khái niệm - ý nghĩa</h3>
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Khái niệm</label>
              <select
                value={selectedTerm}
                onChange={(event) => {
                  setSelectedTerm(event.target.value)
                  setSelectedAnswer('')
                  setMatchFeedback(null)
                }}
                className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {activity.matching.map((item) => (
                  <option key={item.term} value={item.term}>
                    {item.term}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Ý nghĩa / nhiệm vụ</label>
              <select
                value={selectedAnswer}
                onChange={(event) => {
                  setSelectedAnswer(event.target.value)
                  setMatchFeedback(null)
                }}
                className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Chọn ý nghĩa phù hợp</option>
                {activity.matching.map((item) => (
                  <option key={item.answer} value={item.answer}>
                    {item.answer}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={checkMatch} className="primary-button w-full">
              Kiểm tra ghép cặp
            </button>
            {matchFeedback && (
              <p className="rounded-md bg-white p-3 text-sm leading-6 text-slate-700">{matchFeedback}</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-950">3. {activity.scenario.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activity.scenario.prompt}</p>
          <div className="mt-3 space-y-2">
            {activity.scenario.options.map((option) => (
              <button
                key={option.text}
                type="button"
                onClick={() => setScenarioFeedback(option)}
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-left text-sm transition hover:border-blue-300 hover:bg-blue-50"
              >
                {option.text}
              </button>
            ))}
          </div>
          {scenarioFeedback && (
            <div
              className={`mt-3 rounded-md p-3 text-sm leading-6 ${
                scenarioFeedback.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
              }`}
            >
              {scenarioFeedback.feedback}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-bold text-slate-950">4. Tự giải thích trước khi kiểm tra nhanh</h3>
          <div className="mt-3 space-y-3">
            {activity.explainChecklist.map((item) => (
              <label key={item} className="flex gap-3 rounded-md bg-white p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={checkedItems.includes(item)}
                  onChange={() => toggleChecklist(item)}
                  className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(checkedItems.length / activity.explainChecklist.length) * 100}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Hoàn thành {checkedItems.length}/{activity.explainChecklist.length} ý.
          </p>
        </div>
      </div>
    </section>
  )
}

const buildGeneratedQuestions = (lesson) => {
  const title = lesson?.title || 'bài học Công nghệ'
  const keyPoint = lesson?.key_points?.[0] || lesson?.description || 'nội dung trọng tâm của bài học'

  return [
    {
      type: 'Trắc nghiệm',
      question: `Ý nào mô tả đúng trọng tâm của "${title}"?`,
      options: [
        keyPoint,
        'Chỉ cần ghi nhớ hình ảnh mà không cần hiểu nhiệm vụ.',
        'Không cần liên hệ cấu tạo với nguyên lí làm việc.',
        'Bỏ qua yêu cầu an toàn khi phân tích hệ thống.',
      ],
      answer: keyPoint,
      explanation: 'AI ưu tiên tạo câu hỏi từ điểm cần nhớ hoặc mô tả chính của bài để học sinh ôn đúng trọng tâm.',
    },
    {
      type: 'Tự luận ngắn',
      question: `Hãy giải thích bằng 2-3 câu: vì sao nội dung "${title}" quan trọng trong môn Công nghệ?`,
      answer: 'Học sinh cần nêu nhiệm vụ, cấu tạo/quy trình và liên hệ với ứng dụng thực tế.',
      explanation: 'Dạng tự luận ngắn giúp kiểm tra khả năng diễn đạt, không chỉ chọn đáp án.',
    },
    {
      type: 'Tình huống',
      question: 'Nếu một bộ phận trong hệ thống hoạt động sai, em sẽ phân tích theo những bước nào?',
      answer: 'Xác định nhiệm vụ, kiểm tra cấu tạo chính, xem nguyên lí làm việc và đánh giá ảnh hưởng an toàn.',
      explanation: 'AI sinh tình huống để học sinh vận dụng kiến thức vào chẩn đoán kỹ thuật.',
    },
  ]
}

function AIQuestionGenerator({ lesson }) {
  const [generatedQuestions, setGeneratedQuestions] = useState([])

  const generateQuestions = () => {
    setGeneratedQuestions(buildGeneratedQuestions(lesson))
    toast.success('AI đã sinh bộ câu hỏi ôn tập demo')
  }

  return (
    <section className="panel p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="muted-label mb-1">AI sinh câu hỏi</p>
          <h2 className="text-xl font-bold text-slate-950">Tạo câu hỏi ôn tập từ nội dung bài</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Demo luồng AI: lấy tiêu đề, mô tả và điểm cần nhớ của bài để tạo câu hỏi trắc nghiệm, tự luận và tình huống.
          </p>
        </div>
        <button type="button" onClick={generateQuestions} className="primary-button">
          Sinh câu hỏi
        </button>
      </div>

      {generatedQuestions.length > 0 && (
        <div className="mt-5 grid gap-4">
          {generatedQuestions.map((item, index) => (
            <article key={`${item.type}-${index}`} className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-indigo-700">
                  {item.type}
                </span>
                <span className="text-xs font-semibold text-slate-500">Câu {index + 1}</span>
              </div>
              <h3 className="font-bold leading-7 text-slate-950">{item.question}</h3>
              {item.options && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.options.map((option) => (
                    <div
                      key={option}
                      className={`rounded-md border bg-white p-3 text-sm ${
                        option === item.answer ? 'border-emerald-300 text-emerald-900' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-slate-700">
                <span className="font-black text-emerald-700">Đáp án/gợi ý:</span> {item.answer}
              </p>
              <p className="mt-2 text-sm leading-6 text-indigo-900">{item.explanation}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default function LessonDetail() {
  const { lessonId } = useParams()
  const user = useAuthStore((state) => state.user)
  const [lesson, setLesson] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  useLearningSession({ userId: user?.id, lessonId, eventType: 'lesson_session' })

  useEffect(() => {
    fetchLesson()
  }, [lessonId])

  useEffect(() => {
    if (!user?.id || !lessonId) return
    recordLocalLearningEvent(user.id, {
      lesson_id: Number(lessonId),
      event_type: 'lesson_viewed',
      duration_seconds: 0,
    })
  }, [user?.id, lessonId])

  const fetchLesson = async () => {
    const catalogLesson = getSampleLesson(lessonId)
    try {
      const response = await lessonsAPI.get(lessonId)
      setLesson(catalogLesson || response.data)
    } catch (error) {
      setLesson(catalogLesson)
    } finally {
      setIsLoading(false)
    }
  }

  const markLessonCompleted = () => {
    recordLocalLearningEvent(user?.id, {
      lesson_id: Number(lessonId),
      event_type: 'lesson_completed',
      duration_seconds: 180,
      payload: { source: 'manual_complete_button' },
    })
    setIsCompleted(true)
    toast.success('Đã cập nhật hoàn thành bài học')
  }

  if (isLoading) return <div className="page-container text-center text-slate-600">Đang tải...</div>

  const activity = getInteractiveActivity(lessonId)
  const showCircuitLab = lesson?.grade_level === 12 && Number(lesson?.source_course_id || lesson?.course_id) >= 5
  const usesEngineLabels =
    lesson?.flow === 'engine'
    && (Number(lesson?.source_id) === 602 || /nguyên lí làm việc.*động cơ/i.test(lesson?.title || ''))
  const lessonDriveMaterial =
    getGrade10SlideMaterialByLesson(lesson) || getGrade12MaterialByLesson(lesson)
  const isPdfMaterial = lessonDriveMaterial?.file_type === 'application/pdf'

  return (
    <div className="nova-content-page nova-lesson-page page-container">
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="muted-label mb-2">{lesson?.grade_label || 'Bài học'}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">{lesson?.title}</h1>
        {lesson?.source_name && (
          <p className="mt-2 inline-flex rounded-md bg-blue-50 px-3 py-1 text-xs font-black uppercase text-blue-700">
            {lesson.source_name}
          </p>
        )}
        <p className="mt-3 max-w-4xl leading-7 text-slate-600">{lesson?.description}</p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <main className="space-y-6">
          <section className="panel p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="muted-label mb-1">Lý thuyết cốt lõi</p>
                <h2 className="text-xl font-bold text-slate-950">Nội dung bài học</h2>
              </div>
            </div>
            <p className="text-base leading-8 text-slate-700">
              {lesson?.content || 'Nội dung bài học đang được cập nhật.'}
            </p>
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold text-emerald-950">Hoàn thành bài học</h3>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    Bấm sau khi em đã đọc nội dung chính và hiểu các ý cần nhớ của bài.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={markLessonCompleted}
                  disabled={isCompleted}
                  className="primary-button disabled:opacity-60"
                >
                  {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                </button>
              </div>
            </div>
            {lesson?.content_sections?.length > 0 && (
              <div className="mt-6 space-y-4">
                {lesson.content_sections.map((section) => (
                  <div key={section.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-bold text-slate-950">{section.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          {lesson?.visual_steps && (
            <section className="panel p-6">
              <div className="mb-5">
                <p className="muted-label mb-1">Quan sát theo tiến trình</p>
                <h2 className="text-xl font-bold text-slate-950">Sơ đồ trực quan</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {lesson.visual_steps.map((step, index) => (
                  <div
                    key={step.name}
                    className={`rounded-lg border p-4 ${step.color || 'border-slate-200 bg-slate-50 text-slate-800'}`}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-bold shadow-sm">
                        {index + 1}
                      </span>
                      <h3 className="font-bold">{step.name}</h3>
                    </div>
                    <div className="space-y-2 text-sm leading-6">
                      <p><span className="font-semibold">{usesEngineLabels ? 'Piston' : 'Thao tác'}:</span> {step.piston}</p>
                      <p><span className="font-semibold">{usesEngineLabels ? 'Van' : 'Yêu cầu'}:</span> {step.valve}</p>
                      <p><span className="font-semibold">Kết quả:</span> {step.result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {lesson?.key_points && (
            <section className="panel p-6">
              <p className="muted-label mb-1">Ghi nhớ nhanh</p>
              <h2 className="mb-4 text-xl font-bold text-slate-950">Điểm cần nhớ</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {lesson.key_points.map((point) => (
                  <div key={point} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm leading-6 text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <InteractiveLearning activity={activity} />
          <AIQuestionGenerator lesson={lesson} />
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="panel p-5">
            <h3 className="font-bold text-slate-950">Bộ công cụ học tập</h3>
            <div className="mt-4 space-y-3">
              <Link to={`/lessons/${lessonId}/3d`} className="primary-button w-full">
                <span className="mr-2 rounded bg-white/20 px-1.5 py-0.5 text-xs">3D</span>
                Mô phỏng nguyên lí
              </Link>
              <Link to={`/lessons/${lessonId}/chat`} className="secondary-button w-full">
                <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">AI</span>
                Trợ lý học tập
              </Link>
              <Link to={`/lessons/${lessonId}/design`} className="secondary-button w-full">
                <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">S</span>
                Vẽ sơ đồ hệ thống
              </Link>
              {showCircuitLab && (
                <Link to={`/lessons/${lessonId}/circuit-lab`} className="secondary-button w-full">
                  <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">E</span>
                  Thiết kế thí nghiệm mạch
                </Link>
              )}
              <Link to={`/lessons/${lessonId}/quiz`} className="secondary-button w-full">
                <span className="mr-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs">Q</span>
                Kiểm tra nhanh
              </Link>
            </div>
          </section>

          {lessonDriveMaterial && (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                Tài liệu riêng của bài {lessonDriveMaterial.lesson_number}
              </p>
              <h3 className="mt-2 font-bold text-emerald-950">{lessonDriveMaterial.title}</h3>
              <p className="mt-2 text-sm leading-6 text-emerald-900">
                {isPdfMaterial ? 'Tài liệu PDF' : 'Bài giảng PowerPoint'} đã được ghép đúng với nội dung bài học này.
              </p>
              <div className="mt-4 grid gap-2">
                <a
                  href={lessonDriveMaterial.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-button w-full justify-center"
                >
                  Xem {isPdfMaterial ? 'PDF' : 'slide'} bài {lessonDriveMaterial.lesson_number} ↗
                </a>
                <a
                  href={lessonDriveMaterial.download_url}
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button w-full justify-center"
                >
                  Tải file {isPdfMaterial ? 'PDF' : 'PPTX'}
                </a>
              </div>
            </section>
          )}

          <section className="rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h3 className="font-bold text-blue-950">Cách học gợi ý</h3>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-blue-900">
              <li>1. Đọc nội dung để nắm nhiệm vụ của bộ phận hoặc hệ thống.</li>
              <li>2. Dùng sơ đồ hoặc bản vẽ để hệ thống hóa kiến thức trọng tâm.</li>
              <li>3. Dùng trợ lý học tập để hỏi lại phần chưa hiểu.</li>
              <li>4. Làm kiểm tra nhanh để đánh giá khả năng liên hệ kiến thức.</li>
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}
