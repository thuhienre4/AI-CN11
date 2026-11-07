import { describe, expect, it } from 'vitest'

import { sampleLessons, sampleQuestions } from './courseCatalog'
import {
  COMPETENCIES,
  LEVELS,
  THPT_EXAM,
  allThptClusters,
  allThptQuestions,
  arrangeOptions,
  buildThptExam,
  scoreThptExam,
} from './thptQuestionBank'

const questions = allThptQuestions()
const clusters = allThptClusters()

describe('THPT question bank', () => {
  it('gives every lesson two questions with four different options', () => {
    expect(sampleQuestions).toHaveLength(146)
    sampleLessons.forEach((lesson) => {
      const own = sampleQuestions.filter((question) => question.lesson_id === lesson.id)
      expect(own, lesson.title).toHaveLength(2)
      own.forEach((question) => {
        expect(question.options).toHaveLength(4)
        expect(new Set(question.options.map((option) => option.text)).size).toBe(4)
        expect(question.options.filter((option) => option.is_correct)).toHaveLength(1)
      })
    })
  })

  it('leaves no question from the old templates', () => {
    sampleQuestions.forEach((question) => {
      expect(question.text).not.toMatch(/Nhận định nào đúng nhất|Sản phẩm học tập nào/)
    })
    expect(new Set(sampleQuestions.map((question) => question.text)).size).toBe(146)
  })

  it('keeps option ids unique across the bank', () => {
    const ids = sampleQuestions.flatMap((question) => question.options.map((option) => option.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(Math.max(...ids)).toBeLessThan(2 ** 31)
  })

  it('labels every question with a level, a competency and an explanation', () => {
    questions.forEach((question) => {
      expect(LEVELS[question.level], question.text).toBeTruthy()
      expect(COMPETENCIES[question.competency], question.text).toBeTruthy()
      expect(question.explanation, question.text).toBeTruthy()
    })
  })

  it('stays close to the planned share of levels', () => {
    const share = (level) => questions.filter((question) => question.level === level).length / questions.length
    expect(share('B')).toBeGreaterThan(0.35)
    expect(share('H')).toBeGreaterThan(0.2)
    expect(share('V')).toBeGreaterThan(0.2)
  })

  it('does not reveal the answer by position, length or catch-all options', () => {
    const positions = [0, 0, 0, 0]
    let longest = 0
    questions.forEach((question) => {
      const options = arrangeOptions(question)
      positions[options.indexOf(question.correct)] += 1
      if (question.correct.length > Math.max(...question.distractors.map((option) => option.length))) longest += 1
      options.forEach((option) => expect(option).not.toMatch(/(tất cả|cả) .*(đáp án|phương án)|đều đúng|đều sai/i))
    })
    positions.forEach((count) => expect(count / questions.length).toBeGreaterThan(0.15))
    expect(longest / questions.length).toBeLessThan(0.35)
  })

  it('has one true/false item for each of the 19 chapters, with four statements of both kinds', () => {
    expect(clusters).toHaveLength(19)
    clusters.forEach((cluster) => {
      expect(cluster.items).toHaveLength(4)
      const truths = cluster.items.map(([, truth]) => truth)
      expect(truths).toContain(true)
      expect(truths).toContain(false)
    })
  })
})

describe('THPT exam', () => {
  it('follows the exam format', () => {
    const exam = buildThptExam(5)
    expect(exam.multipleChoice).toHaveLength(THPT_EXAM.multipleChoice)
    expect(exam.trueFalse).toHaveLength(THPT_EXAM.trueFalse)
    expect(new Set(exam.multipleChoice.map((item) => item.key)).size).toBe(24)
    exam.multipleChoice.forEach((item) => expect(item.options).toContain(item.correct))
  })

  it('draws from all three grades and all three levels', () => {
    const { multipleChoice } = buildThptExam(9)
    expect(new Set(multipleChoice.map((item) => item.grade))).toEqual(new Set([10, 11, 12]))
    expect(new Set(multipleChoice.map((item) => item.level))).toEqual(new Set(['B', 'H', 'V']))
  })

  it('gives the same exam for the same seed and a different one for another', () => {
    const keys = (seed) => buildThptExam(seed).multipleChoice.map((item) => item.key)
    expect(keys(3)).toEqual(keys(3))
    expect(keys(3)).not.toEqual(keys(4))
  })

  it('reaches 10 points with every answer right and 0 with none', () => {
    const exam = buildThptExam(1)
    const perfect = {
      choice: Object.fromEntries(exam.multipleChoice.map((item) => [item.key, item.correct])),
      truth: Object.fromEntries(exam.trueFalse.map((cluster) => [cluster.key, cluster.items.map(([, truth]) => truth)])),
    }
    expect(scoreThptExam(exam, perfect).score).toBe(10)
    expect(scoreThptExam(exam, { choice: {}, truth: {} }).score).toBe(0)
  })

  it.each([[1, 0.1], [2, 0.25], [3, 0.5], [4, 1]])('scores %i right statements as %f points', (right, points) => {
    const exam = buildThptExam(2)
    const [cluster] = exam.trueFalse
    const answer = cluster.items.map(([, truth], index) => (index < right ? truth : !truth))
    expect(scoreThptExam({ ...exam, multipleChoice: [], trueFalse: [cluster] }, { truth: { [cluster.key]: answer } }).score).toBe(points)
  })
})
