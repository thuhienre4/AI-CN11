import { describe, expect, it } from 'vitest'

import { sampleLessons } from './courseCatalog'
import { KNTT_LESSON_MODELS, getLessonModel, lessonModelSimulation } from './knttLessonModels'
import { LESSON_SHAPES, createLessonFlowModel } from '../simulations/lessonFlowModel'

// Lessons that keep a model drawn for them alone.
const DEDICATED = new Set(['11-4', '11-12', '11-17', '11-18', '11-19', '11-21', '12-21', '12-23'])
const lessonKey = (lesson) => `${lesson.grade_level}-${/^Bài\s+(\d+)/.exec(lesson.title)[1]}`
const textbookLessons = sampleLessons.filter((lesson) => /^Bài\s+\d+/.test(lesson.title) && [10, 11, 12].includes(lesson.grade_level))

describe('lesson models', () => {
  it('covers every textbook lesson with its own or a dedicated model', () => {
    expect(textbookLessons.length).toBeGreaterThan(60)
    textbookLessons.forEach((lesson) => {
      expect(Boolean(getLessonModel(lesson)) || DEDICATED.has(lessonKey(lesson)), lesson.title).toBe(true)
    })
  })

  it('has no model left without a lesson', () => {
    const keys = new Set(textbookLessons.map(lessonKey))
    Object.keys(KNTT_LESSON_MODELS).forEach((key) => expect(keys.has(key), key).toBe(true))
  })

  it.each(Object.entries(KNTT_LESSON_MODELS))('%s builds with a named, labelled stage for each step', (_key, model) => {
    expect(model.objective).toBeTruthy()
    model.stages.forEach(([name, shape, note]) => {
      expect(name).toBeTruthy()
      expect(note).toBeTruthy()
      expect(LESSON_SHAPES).toContain(shape)
    })
    const built = createLessonFlowModel(model)
    expect(built.annotations).toHaveLength(model.stages.length)
    built.root.traverse((part) => {
      if (part.isMesh) expect(part.name).toMatch(/^stage\d+$/)
    })
  })

  it('gives every mesh its own material so that stages dim separately', () => {
    const { root } = createLessonFlowModel(KNTT_LESSON_MODELS['12-4'])
    const materials = []
    root.traverse((part) => part.isMesh && materials.push(part.material))
    expect(new Set(materials).size).toBe(materials.length)
  })

  it('links stages only when the lesson is a sequence', () => {
    const flowing = createLessonFlowModel(KNTT_LESSON_MODELS['12-4'])
    const parallel = createLessonFlowModel(KNTT_LESSON_MODELS['12-15'])
    expect(flowing.animated.some(({ type }) => type === 'flow')).toBe(true)
    expect(parallel.animated.some(({ type }) => type === 'flow')).toBe(false)
  })

  it('shows the seven steps of the design process in order', () => {
    const steps = KNTT_LESSON_MODELS['10-18'].stages.map(([name]) => name)
    expect(steps).toHaveLength(7)
    steps.forEach((name, index) => expect(name.startsWith(`${index + 1}.`)).toBe(true))
  })

  it('turns a lesson into a simulation that uses the key points of that lesson', () => {
    const lesson = { grade_level: 12, title: 'Bài 4. Hệ thống điện quốc gia', key_points: ['Một ý'] }
    const simulation = lessonModelSimulation(lesson, { teacherPrompts: ['Câu hỏi'], checkpoints: [] })
    expect(simulation).toMatchObject({ modelId: 'lesson', label: 'Bài 4', title: 'Hệ thống điện quốc gia', checkpoints: ['Một ý'] })
    expect(simulation.layers.map(({ id }) => id)).toEqual(['stage1', 'stage2', 'stage3', 'stage4', 'stage5'])
  })
})
