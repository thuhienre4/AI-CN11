import { describe, expect, it } from 'vitest'
import { lessonState } from './ChapterMap'

describe('chapter map', () => {
  it('names how far a lesson has got', () => {
    expect(lessonState(undefined)).toBe('new')
    expect(lessonState({ progress_percent: 0 })).toBe('new')
    expect(lessonState({ progress_percent: 45, status: 'in_progress' })).toBe('learning')
    expect(lessonState({ progress_percent: 45, status: 'needs_review', quiz_attempt_count: 1, best_quiz_score: 40 })).toBe('review')
    expect(lessonState({ progress_percent: 100, status: 'completed', quiz_attempt_count: 0 })).toBe('done')
    expect(lessonState({ progress_percent: 100, status: 'completed', quiz_attempt_count: 1, best_quiz_score: 80 })).toBe('mastered')
    // mastery comes from the test, even before the lesson is marked done
    expect(lessonState({ progress_percent: 45, status: 'in_progress', quiz_attempt_count: 2, best_quiz_score: 90 })).toBe('mastered')
  })
})
