// Teaching files (slides, PDF on Google Drive) for every lesson of the three Kết nối tri thức books.
// Grades 10 and 12 are numbered like the textbook. The grade 11 slides follow another book's numbering
// (27 lessons against 25), so they are matched to the textbook lessons by content below, not by number.
import { BLUEPRINTS } from './chapterExams'
import { sampleLessons } from './courseCatalog'
import { DRIVE_FOLDER_URL as GRADE_11_DRIVE_FOLDER_URL, grade11SlideMaterials } from './grade11SlideMaterials'
import { GRADE_10_DRIVE_FOLDER_URL, grade10SlideMaterials } from './grade10DriveMaterials'
import { GRADE_12_DRIVE_FOLDER_URL, grade12ChapterReviews, grade12LessonMaterials } from './grade12DriveMaterials'

export const DRIVE_FOLDERS = { 10: GRADE_10_DRIVE_FOLDER_URL, 11: GRADE_11_DRIVE_FOLDER_URL, 12: GRADE_12_DRIVE_FOLDER_URL }

// Kết nối tri thức lesson number -> Drive ids of the slides that teach it
const GRADE_11_BY_LESSON = {
  1: ['14Z9ugxA_-Q41TKrhLPBJFXVM3S6MF4w6'],
  3: ['15aGYISGQFxNQ5l3PFz5fFZgbKkleFqGe'],
  4: ['1CEZ6V1PHZax0rNhPRPY5Fkm1yh7amNqb'],
  7: ['1C2VKdL61WCnvLuzTxImpZQKG5cmtNkXn'],
  8: ['1SlCWD6xgc8e6MKRw6m9bH9UrLOdN5CBc', '1P0BYnVzDR-uixNMvVfajfVAC5k4riIdC'],
  9: ['1SS5_QAUrDFLw2aO-cWBUR1I6Js8BY_hF'],
  10: ['13LtFLbXP_4gPJF54SKHW4MXMRL4eGb6S'],
  11: ['1Yf9Pn8tGNru2yr0kz_YGhqYaTGTqvpyi'],
  12: ['1W0rRrfjoaHJBDJMgQoDNr9DVumyNsOlI'],
  13: ['1YEGzRijDabafy4fvmTxRJ0MR0h_6l_hA'],
  14: ['1dQUG-_36XjKKk5mk31b2xRzYE0VIjGEc'],
  15: ['1nlT88lRL4UYbVAOiFh11y8X6N1z9sjo-'],
  16: ['114tERfrdppCrC5Ku6oOCG-jijBXXy0GE'],
  17: ['1wEs82ldN8Hb37IKJMVtxk1F9SYvK3ZUe'],
  18: ['1LBDiLF0DAOThv-YLr9AuIZII3n1dZ5Sx', '1RE71wbsy9S4Ybi71pThumojPHHPeuN1Z'],
  19: ['1-cKXnH0RKXzhwyny_bnZv3Lu722ubgbp'],
  20: ['1OdPHqidMZAtVUzIq-Z5MQX8TIBaL4Ini', '1UU64G1GwwkQ8982WeAOVl0R_vnbFQnsD', '1p8_P0e2sTkecFbJrYrx5je9U5Ukd5Og9'],
  21: ['17t4Nkz1DmYVuqXDUhiPE8zig2OJExIxk'],
  22: ['18V3mWvAjsVyaSK_R8Gxd8yg6Ix085aqx', '1CeWT9y3ipGTi2pXw_nvzfOD9oSUlp-2u'],
  23: ['1TcZisPWiOggPWYEo1-TkwpvHUkpdMVRo'],
  24: ['1TcZisPWiOggPWYEo1-TkwpvHUkpdMVRo'],
  25: ['1TcZisPWiOggPWYEo1-TkwpvHUkpdMVRo'],
}

const grade11ById = new Map(grade11SlideMaterials.map((material) => [material.external_url.match(/\/d\/([^/]+)/)[1], material]))
const grade11Title = (material) => `${material.title}${material.lesson_title.includes('·') ? ` (${material.lesson_title.split('·')[1].trim()})` : ''}`

const kind = (material) => (material.file_type === 'application/pdf' ? 'PDF' : 'Slide')

const asItem = (material, title = material.title) => ({
  id: material.id,
  title,
  kind: kind(material),
  viewUrl: material.external_url,
  downloadUrl: material.download_url,
})

const lessonNumberOf = (lesson) => Number(String(lesson?.title || '').match(/^Bài\s+(\d+)/i)?.[1])

/** Files that teach this lesson, as {id, title, kind, viewUrl, downloadUrl}. */
export const materialsForLesson = (lesson) => {
  const grade = Number(lesson?.grade_level)
  const number = lessonNumberOf(lesson)
  if (!number) return []
  if (grade === 10) return grade10SlideMaterials.filter((item) => item.lesson_number === number).map((item) => asItem(item))
  if (grade === 12) return grade12LessonMaterials.filter((item) => item.lesson_number === number).map((item) => asItem(item))
  if (grade === 11) {
    return (GRADE_11_BY_LESSON[number] || [])
      .map((id) => grade11ById.get(id))
      .filter(Boolean)
      .map((material) => asItem(material, grade11Title(material)))
  }
  return []
}

const lessonsOfGrade = (grade) =>
  sampleLessons
    .filter((lesson) => Number(lesson.grade_level) === Number(grade) && lessonNumberOf(lesson))
    .sort((a, b) => lessonNumberOf(a) - lessonNumberOf(b))

/**
 * The library of one grade, chapter by chapter as in the textbook:
 * [{code, title, lessons: [{id, number, title, materials}], extras: [...]}], plus files that belong to no single lesson.
 */
export const materialLibrary = (grade) => {
  const lessons = lessonsOfGrade(grade)
  const used = new Set()
  const chapters = BLUEPRINTS[grade].map((chapter) => {
    const [first, last] = chapter.lessons
    const chapterLessons = lessons
      .filter((lesson) => lessonNumberOf(lesson) >= first && lessonNumberOf(lesson) <= last)
      .map((lesson) => {
        const materials = materialsForLesson(lesson)
        materials.forEach((item) => used.add(item.id))
        return { id: lesson.id, number: lessonNumberOf(lesson), title: lesson.title, materials }
      })
    return { code: chapter.code, title: chapter.title, lessons: chapterLessons, extras: [] }
  })

  if (Number(grade) === 12) {
    grade12ChapterReviews.forEach((review) => {
      const chapter = chapters[review.course_id - 1201]
      if (chapter) chapter.extras.push(asItem(review))
      used.add(review.id)
    })
  }
  const others = Number(grade) === 11
    ? grade11SlideMaterials.filter((material) => !used.has(material.id)).map((material) => asItem(material, grade11Title(material)))
    : []
  return { chapters, others, folder: DRIVE_FOLDERS[grade] }
}

export const countLibraryFiles = (grade) => {
  const { chapters, others } = materialLibrary(grade)
  const ids = new Set(others.map((item) => item.id))
  chapters.forEach((chapter) => {
    chapter.extras.forEach((item) => ids.add(item.id))
    chapter.lessons.forEach((lesson) => lesson.materials.forEach((item) => ids.add(item.id)))
  })
  return ids.size
}
