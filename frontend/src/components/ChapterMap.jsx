import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getSampleLessonsByCourse, sampleCourses } from '../data/courseCatalog'

// A lesson is mastered once its quick test reaches 80, finished once marked done, and so on down
export const lessonState = (row) => {
  if (!row || (row.progress_percent || 0) <= 0) return 'new'
  if ((row.quiz_attempt_count || 0) > 0 && (row.best_quiz_score || 0) >= 80) return 'mastered'
  if (row.status === 'completed') return 'done'
  if (row.status === 'needs_review') return 'review'
  return 'learning'
}

const STATES = {
  mastered: ['Nắm chắc (kiểm tra từ 80)', 'bg-emerald-600 border-emerald-700'],
  done: ['Đã hoàn thành', 'bg-emerald-200 border-emerald-400'],
  learning: ['Đang học', 'bg-blue-200 border-blue-400'],
  review: ['Cần ôn lại', 'bg-amber-300 border-amber-500'],
  new: ['Chưa học', 'bg-white border-slate-300'],
}

/** Every chapter of a grade as a row of lessons, coloured by how far the student has got. */
export default function ChapterMap({ lessonProgress = [], defaultGrade = 11 }) {
  const [grade, setGrade] = useState(defaultGrade)
  const byLesson = useMemo(() => new Map(lessonProgress.map((row) => [Number(row.lesson_id), row])), [lessonProgress])
  const chapters = useMemo(
    () =>
      sampleCourses
        .filter((course) => Number(course.grade_level) === grade)
        .map((course) => {
          const lessons = getSampleLessonsByCourse(course.id).map((lesson) => ({ lesson, state: lessonState(byLesson.get(lesson.id)) }))
          return { course, lessons, mastered: lessons.filter((item) => item.state === 'mastered').length }
        }),
    [grade, byLesson]
  )
  const total = chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)
  const mastered = chapters.reduce((sum, chapter) => sum + chapter.mastered, 0)

  return (
    <section className="panel p-6" aria-labelledby="chapter-map">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="muted-label mb-1">Bản đồ chương</p>
          <h2 id="chapter-map" className="text-2xl font-bold text-slate-950">Em đã đi được bao xa</h2>
          <p className="mt-1 text-sm text-slate-600">Nắm chắc {mastered}/{total} bài của khối {grade}. Bấm vào một ô để mở bài.</p>
        </div>
        <div className="inline-flex w-fit rounded-lg border border-slate-300 bg-white p-1" role="group" aria-label="Chọn khối">
          {[10, 11, 12].map((value) => (
            <button key={value} type="button" aria-pressed={grade === value} onClick={() => setGrade(value)}
              className={`rounded-md px-3 py-1 text-sm font-semibold ${grade === value ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}>
              Khối {value}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600" aria-label="Chú thích">
        {Object.entries(STATES).map(([key, [label, colour]]) => (
          <li key={key} className="flex items-center gap-1.5"><span className={`h-3 w-3 rounded-sm border ${colour}`} aria-hidden="true" />{label}</li>
        ))}
      </ul>

      <ol className="mt-4 space-y-3">
        {chapters.map(({ course, lessons, mastered: count }) => (
          <li key={course.id} className="grid gap-2 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-center">
            <div className="min-w-0">
              <Link to={`/courses/${course.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-blue-800" title={course.title}>{course.title}</Link>
              <p className="text-xs text-slate-500">{count}/{lessons.length} nắm chắc</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lessons.map(({ lesson, state }) => (
                <Link
                  key={lesson.id}
                  to={`/lessons/${lesson.id}`}
                  title={`${lesson.title}: ${STATES[state][0]}`}
                  aria-label={`${lesson.title}: ${STATES[state][0]}`}
                  className={`h-7 w-7 rounded border-2 transition hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700 ${STATES[state][1]}`}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
