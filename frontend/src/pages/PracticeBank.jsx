import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { chapterAssessments, learningPaths, sampleCourses } from '../data/courseCatalog'

const gradeFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 10, label: 'Khối 10' },
  { id: 11, label: 'Khối 11' },
  { id: 12, label: 'Khối 12' },
]

const gradeGuides = {
  10: {
    title: 'Công nghệ 10 - Thiết kế và công nghệ',
    goal: 'Ôn khái niệm công nghệ, hệ thống kĩ thuật, vẽ kĩ thuật và quy trình thiết kế kĩ thuật.',
    competencies: ['Nhận biết khái niệm', 'Đọc bản vẽ', 'Phân tích hệ thống', 'Vận dụng thiết kế'],
  },
  11: {
    title: 'Công nghệ 11 - Chuyên đề cơ khí',
    goal: 'Ôn dự án nghiên cứu cơ khí, chuỗi CAD/CAM-CNC và công nghệ in 3D theo hướng học qua dự án.',
    competencies: ['Lập kế hoạch dự án', 'Đọc quy trình số', 'Đo kiểm', 'Báo cáo kĩ thuật'],
  },
  12: {
    title: 'Công nghệ 12 - Điện - điện tử',
    goal: 'Ôn hệ thống điện, mạng điện trong nhà, an toàn điện, linh kiện, điện tử số và vi điều khiển.',
    competencies: ['Đọc sơ đồ điện', 'An toàn điện', 'Xử lí tín hiệu', 'Điều khiển thiết bị'],
  },
}

const getCourse = (courseId) => sampleCourses.find((course) => course.id === Number(courseId))

const getPath = (gradeLevel) => learningPaths.find((path) => path.grade_level === Number(gradeLevel))

const questionTypeLabels = {
  multiple_choice: 'Trắc nghiệm',
  true_false: 'Đúng / Sai',
  multi_select: 'Nhiều đáp án',
  fill_blank: 'Điền khuyết',
  matching: 'Ghép cặp',
}

const getQuestionTypeSummary = (questions) =>
  questions.reduce((rows, question) => {
    const type = question.question_type || 'multiple_choice'
    rows[type] = (rows[type] || 0) + 1
    return rows
  }, {})

const getAssessmentGoals = (assessment, course) => {
  const guide = gradeGuides[assessment.grade_level]
  const chapterName = course?.title || assessment.chapter
  return [
    `Nắm trọng tâm của ${chapterName}.`,
    guide?.goal || 'Ôn đúng mục tiêu chương và vận dụng vào câu hỏi thực tế.',
    'Sau khi làm đề, đọc giải thích để xác định phần cần quay lại ôn.',
  ]
}

export default function PracticeBank() {
  const [activeGrade, setActiveGrade] = useState('all')

  const filteredAssessments = useMemo(
    () =>
      activeGrade === 'all'
        ? chapterAssessments
        : chapterAssessments.filter((assessment) => assessment.grade_level === Number(activeGrade)),
    [activeGrade]
  )

  const gradeCards = useMemo(
    () =>
      learningPaths.map((path) => {
        const assessments = chapterAssessments.filter((assessment) => assessment.grade_level === path.grade_level)
        const questionCount = assessments.reduce((total, assessment) => total + assessment.questions.length, 0)
        return {
          ...path,
          guide: gradeGuides[path.grade_level],
          assessmentCount: assessments.length,
          questionCount,
        }
      }),
    []
  )

  return (
    <div className="page-container">
      <section className="mb-6 overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-2xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Kho đề EngineLab</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Kho đề ôn tập bám SGK Kết nối tri thức</h1>
            <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-200">
              Đề được chia theo khối và theo chương, giúp học sinh ôn đúng mục tiêu môn Công nghệ: hiểu kiến thức, đọc sơ đồ, giải thích quy trình và vận dụng an toàn.
            </p>
            <Link to="/thpt-exam" className="primary-button mt-4">Làm đề luyện tốt nghiệp THPT</Link>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-300">Lọc nhanh</p>
            <div className="grid gap-2">
              {gradeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveGrade(filter.id)}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-black transition ${
                    activeGrade === filter.id ? 'bg-white text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {gradeCards.map((card) => {
          const active = activeGrade === 'all' || activeGrade === card.grade_level
          return (
            <button
              key={card.grade_level}
              type="button"
              onClick={() => setActiveGrade(card.grade_level)}
              className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                active ? 'border-indigo-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-70'
              }`}
            >
              <p className="text-xs font-black uppercase tracking-wide text-indigo-700">{card.grade_label}</p>
              <h2 className="mt-2 text-xl font-black text-slate-950">{card.guide?.title || card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.guide?.goal}</p>
              <p className="mt-4 text-sm font-black text-slate-700">
                {card.assessmentCount} đề · {card.questionCount} câu
              </p>
            </button>
          )
        })}
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          ['Bước 1', 'Chọn đúng khối và chương đang học.'],
          ['Bước 2', 'Làm đề theo thời lượng gợi ý, ưu tiên hiểu câu hỏi trước khi chọn đáp án.'],
          ['Bước 3', 'Đọc giải thích, quay lại bài học hoặc sơ đồ minh họa để sửa lỗi kiến thức.'],
        ].map(([title, content]) => (
          <div key={title} className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sky-950 shadow-sm">
            <p className="text-sm font-black uppercase">{title}</p>
            <p className="mt-2 font-bold leading-6">{content}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {filteredAssessments.map((assessment, index) => {
          const course = getCourse(assessment.course_id)
          const path = getPath(assessment.grade_level)
          const goals = getAssessmentGoals(assessment, course)
          const guide = gradeGuides[assessment.grade_level]
          const questionTypeSummary = getQuestionTypeSummary(assessment.questions)

          return (
            <article key={assessment.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
              <div className="h-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                    {assessment.grade_label || path?.grade_label}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    Đề {index + 1}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {assessment.questions.length} câu
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                    {assessment.duration_minutes} phút
                  </span>
                </div>

                <h2 className="text-xl font-black text-slate-950">{assessment.title}</h2>
                <p className="mt-2 text-sm font-bold text-indigo-700">{course?.title || assessment.chapter}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{assessment.description}</p>

                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">Mục tiêu ôn tập</p>
                  <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-700">
                    {goals.map((goal) => (
                      <li key={goal}>• {goal}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(questionTypeSummary).map(([type, count]) => (
                    <span key={type} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      {questionTypeLabels[type] || 'Câu hỏi'}: {count}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {guide?.competencies.map((competency) => (
                    <span key={competency} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                      {competency}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link to={`/courses/${assessment.course_id}/chapter-tests`} className="primary-button">
                    Làm đề
                  </Link>
                  <Link to={`/courses/${assessment.course_id}`} className="secondary-button">
                    Ôn chương
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
