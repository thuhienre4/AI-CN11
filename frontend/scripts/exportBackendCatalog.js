import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { sampleCourses, sampleLessons, sampleQuestions } from '../src/data/courseCatalog'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const defaultOutput = resolve(scriptDirectory, '../../backend/data/course_catalog.json')
const outputPath = resolve(process.argv[2] || defaultOutput)

const asText = (value, fallback = '') => {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return JSON.stringify(value)
}

const catalog = {
  generated_at: new Date().toISOString(),
  courses: sampleCourses.map((course) => ({
    id: Number(course.id),
    title: asText(course.title, `Khóa học ${course.id}`),
    description: asText(course.description),
    content: asText(course.content),
    thumbnail_url: course.thumbnail_url || course.image_url || null,
  })),
  lessons: sampleLessons.map((lesson, index) => ({
    id: Number(lesson.id),
    course_id: Number(lesson.course_id),
    title: asText(lesson.title, `Bài học ${lesson.id}`),
    description: asText(lesson.description),
    content: asText(lesson.content),
    model_3d_url: lesson.model_3d_url || null,
    order: Number(lesson.order ?? lesson.lesson_order ?? index + 1),
  })),
  questions: sampleQuestions.map((question) => ({
    id: Number(question.id),
    lesson_id: Number(question.lesson_id),
    text: asText(question.text || question.question_text || question.question),
    question_type: question.question_type || 'multiple_choice',
    difficulty: question.difficulty || 'medium',
    points: Number(question.points || 1),
    options: (question.options || []).map((option, index) => ({
      id: Number(option.id),
      text: asText(option.text || option.option_text || option.label),
      is_correct: Boolean(option.is_correct ?? option.correct),
      order: Number(option.order ?? index + 1),
    })),
  })),
}

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')

console.log(
  `Exported ${catalog.courses.length} courses, ${catalog.lessons.length} lessons, ` +
    `${catalog.questions.length} questions to ${outputPath}`,
)
