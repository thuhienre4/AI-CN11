import { describe, expect, it } from 'vitest'

import { getSampleLesson } from './courseCatalog'
import { grade11SlideMaterials } from './grade11SlideMaterials'
import { countLibraryFiles, materialLibrary, materialsForLesson } from './lessonMaterials'

describe('files for a lesson', () => {
  it('gives Bài 18 of grade 11 both parts of its slides, not those of another book numbering', () => {
    const files = materialsForLesson(getSampleLesson(110602))
    expect(files.map((file) => file.title)).toEqual([
      'Nguyên lí làm việc của động cơ đốt trong (Phần 1)',
      'Nguyên lí làm việc của động cơ đốt trong (Phần 2)',
    ])
    expect(files.every((file) => file.viewUrl.startsWith('https://drive.google.com/'))).toBe(true)
  })

  it('does not hand the grade 11 Bài 5 (non-metal materials) the other book\'s Bài 5 practical slides', () => {
    const lesson = { grade_level: 11, title: 'Bài 5. Vật liệu phi kim loại' }
    expect(materialsForLesson(lesson)).toEqual([])
  })

  it('finds the textbook-numbered files of grades 10 and 12', () => {
    expect(materialsForLesson({ grade_level: 10, title: 'Bài 9. Hình chiếu vuông góc' })[0].kind).toBe('Slide')
    expect(materialsForLesson({ grade_level: 12, title: 'Bài 1. Giới thiệu tổng quan về kĩ thuật điện' })[0].kind).toBe('PDF')
    expect(materialsForLesson({ grade_level: 11, title: 'Không có số bài' })).toEqual([])
  })
})

describe('the library', () => {
  it('follows the textbook chapters of each grade', () => {
    expect(materialLibrary(10).chapters).toHaveLength(3)
    expect(materialLibrary(11).chapters).toHaveLength(7)
    expect(materialLibrary(12).chapters).toHaveLength(9)
  })

  it('lists every grade 11 slide exactly once, either under a lesson or among the others', () => {
    const { chapters, others } = materialLibrary(11)
    const listed = new Set([...others.map((item) => item.id), ...chapters.flatMap((chapter) => chapter.lessons.flatMap((lesson) => lesson.materials.map((item) => item.id)))])
    expect(listed.size).toBe(grade11SlideMaterials.length)
    expect(countLibraryFiles(11)).toBe(grade11SlideMaterials.length)
  })

  it('puts each grade 12 chapter review under its chapter', () => {
    expect(materialLibrary(12).chapters.every((chapter) => chapter.extras.length === 1)).toBe(true)
  })
})
