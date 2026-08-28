import { describe, expect, it } from 'vitest'

import {
  getSampleCourse,
  getSampleLessonsByCourse,
  sampleCourses,
  sampleLessons,
} from './courseCatalog'

describe('course catalog', () => {
  it('contains courses and lessons with unique identifiers', () => {
    expect(sampleCourses.length).toBeGreaterThan(0)
    expect(sampleLessons.length).toBeGreaterThan(0)
    expect(new Set(sampleCourses.map(({ id }) => id)).size).toBe(sampleCourses.length)
    expect(new Set(sampleLessons.map(({ id }) => id)).size).toBe(sampleLessons.length)
  })

  it('can resolve every course and its lessons', () => {
    for (const course of sampleCourses) {
      expect(getSampleCourse(course.id)).toEqual(course)
      expect(getSampleLessonsByCourse(course.id)).toEqual(
        sampleLessons.filter((lesson) => Number(lesson.course_id) === Number(course.id)),
      )
    }
  })
})
