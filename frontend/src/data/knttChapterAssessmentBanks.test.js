import { describe, expect, it } from 'vitest'
import { grade11AssessmentBank, grade12AssessmentBank } from './knttChapterAssessmentBanks'

const items = [...Object.values(grade11AssessmentBank), ...Object.values(grade12AssessmentBank)].flat()
const ofType = (type) => items.filter((item) => item.question_type === type)

describe('chapter assessment bank', () => {
  it('has one item of each type per chapter', () => {
    expect(items).toHaveLength(64)
    for (const type of ['multiple_choice', 'true_false', 'multi_select', 'matching']) expect(ofType(type)).toHaveLength(16)
  })

  it('spreads the right answer of single-answer items over every position', () => {
    const positions = new Set(ofType('multiple_choice').map((item) => item.correctIndex))
    expect([...positions].sort()).toEqual([0, 1, 2, 3])
    for (const item of ofType('multiple_choice')) expect(new Set(item.options).size).toBe(4)
  })

  it('does not let multi-answer items be guessed from their shape', () => {
    const multi = ofType('multi_select')
    const shapes = new Set(multi.map((item) => item.correctIndexes.join(',')))
    expect(shapes.size).toBeGreaterThanOrEqual(5)
    expect(new Set(multi.map((item) => item.correctIndexes.length))).toEqual(new Set([2, 3]))
    for (const item of multi) {
      expect(item.correctIndexes.every((index) => index >= 0 && index < item.options.length)).toBe(true)
      expect(item.explanation.length).toBeGreaterThan(20)
    }
  })

  it('has no option that rules itself out by saying "only"', () => {
    const options = [...ofType('multiple_choice'), ...ofType('multi_select')].flatMap((item) => item.options)
    expect(options.filter((option) => /^chỉ /i.test(option))).toEqual([])
  })
})
