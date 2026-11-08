import { describe, expect, it } from 'vitest'
import { BLUEPRINTS, bankExam, blueprintSummary, sampleExam, scoreChapterExam } from './chapterExams'
import { allThptQuestions } from './thptQuestionBank'

const GRADES = [10, 11, 12]
const close = (a, b) => Math.abs(a - b) < 1e-9

describe('chapter test blueprints', () => {
  it.each(GRADES)('grade %i: 12 + 4 + 2 questions, 10 points, Biết 4 – Hiểu 3 – Vận dụng 3', (grade) => {
    const { totals } = blueprintSummary(grade)
    expect(totals.multipleChoice).toBe(12)
    expect(totals.trueFalse).toBe(4)
    expect(totals.essays).toBe(2)
    expect(close(totals.total, 10)).toBe(true)
    expect(close(totals.B, 4) && close(totals.H, 3) && close(totals.V, 3)).toBe(true)
  })

  it.each(GRADES)('grade %i: every chapter is tested and its share of points stays within 10 points of its share of lessons', (grade) => {
    const { rows, lessons } = blueprintSummary(grade)
    const expectedLessons = { 10: 22, 11: 25, 12: 26 }[grade]
    expect(lessons).toBe(expectedLessons)
    for (const row of rows) {
      expect(row.mcB + row.mcH).toBeGreaterThanOrEqual(1)
      expect(Math.abs(row.pointShare - row.lessonShare)).toBeLessThanOrEqual(0.10 + 1e-9)
    }
  })
})

describe('sample tests follow their blueprint', () => {
  it.each(GRADES)('grade %i', (grade) => {
    const exam = sampleExam(grade)
    for (const chapter of BLUEPRINTS[grade]) {
      const mc = exam.multipleChoice.filter((q) => q.chapter === chapter.code)
      expect(mc.filter((q) => q.level === 'B')).toHaveLength(chapter.mcB)
      expect(mc.filter((q) => q.level === 'H')).toHaveLength(chapter.mcH)
      const tf = exam.trueFalse.filter((c) => c.chapter === chapter.code).map((c) => c.items.map((s) => s.level).join(''))
      expect(tf.sort()).toEqual([...chapter.tf].sort())
      expect(exam.essays.filter((e) => e.chapter === chapter.code)).toHaveLength(chapter.essays)
    }
    for (const q of exam.multipleChoice) {
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(q.correct)
    }
    for (const essay of exam.essays) expect(close(essay.points, 1.5)).toBe(true)
  })

  it('answers are spread over A, B, C and D', () => {
    for (const grade of GRADES) {
      const positions = sampleExam(grade).multipleChoice.map((q) => q.options.indexOf(q.correct))
      for (const position of [0, 1, 2, 3]) expect(positions.filter((p) => p === position).length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('tests drawn from the question bank', () => {
  it.each(GRADES)('grade %i keeps the blueprint and never repeats a question', (grade) => {
    const exam = bankExam(grade, allThptQuestions(), 7)
    expect(exam.multipleChoice).toHaveLength(12)
    expect(new Set(exam.multipleChoice.map((q) => q.text)).size).toBe(12)
    for (const chapter of BLUEPRINTS[grade]) {
      const mc = exam.multipleChoice.filter((q) => q.chapter === chapter.code)
      expect(mc.filter((q) => q.level === 'B')).toHaveLength(chapter.mcB)
      expect(mc.filter((q) => q.level === 'H')).toHaveLength(chapter.mcH)
    }
    expect(exam.multipleChoice.some((q) => q.source === 'bank')).toBe(true)
  })

  it('the same seed gives the same test, another seed a different one', () => {
    const a = bankExam(11, allThptQuestions(), 1).multipleChoice.map((q) => q.text)
    expect(bankExam(11, allThptQuestions(), 1).multipleChoice.map((q) => q.text)).toEqual(a)
    expect(bankExam(11, allThptQuestions(), 2).multipleChoice.map((q) => q.text)).not.toEqual(a)
  })
})

describe('scoring', () => {
  it('all right gives 7 objective points; true/false follows 0.1 / 0.25 / 0.5 / 1', () => {
    const exam = sampleExam(12)
    const all = {
      choice: Object.fromEntries(exam.multipleChoice.map((q) => [q.key, q.correct])),
      truth: Object.fromEntries(exam.trueFalse.map((c) => [c.key, c.items.map((s) => s.truth)])),
    }
    expect(scoreChapterExam(exam, all).objective).toBe(7)
    const cluster = exam.trueFalse[0]
    const truths = cluster.items.map((s) => s.truth)
    const partial = (right) => ({ truth: { [cluster.key]: truths.map((t, i) => (i < right ? t : !t)) } })
    expect([1, 2, 3, 4].map((right) => scoreChapterExam(exam, partial(right)).objective)).toEqual([0.1, 0.25, 0.5, 1])
    expect(scoreChapterExam(exam, {}).objective).toBe(0)
  })
})
