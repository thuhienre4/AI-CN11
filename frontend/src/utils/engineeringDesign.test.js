import { describe, expect, it } from 'vitest'
import { blankTemplate, projectTemplates, safetyChecklist } from '../data/engineeringDesign'
import { createProject, getChosenSolution, getProgress, loadProjects, rankSolutions, scoreSolution, strokeToPath } from './engineeringDesign'

if (!globalThis.localStorage) {
  const data = new Map()
  globalThis.localStorage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k), clear: () => data.clear() }
}

const phoneStand = projectTemplates.find((template) => template.id === 'phone-stand')

describe('createProject', () => {
  it('copies template criteria and seeds one test per criterion', () => {
    const project = createProject(phoneStand)
    expect(project.criteria).toHaveLength(phoneStand.criteria.length)
    expect(project.tests.map((test) => test.criterionId)).toEqual(project.criteria.map((item) => item.id))
    expect(project.solutions.map((item) => item.name)).toEqual(phoneStand.solutions)
  })

  it('does not share nested objects with the template', () => {
    const project = createProject(phoneStand)
    project.problem.need = 'changed'
    expect(phoneStand.problem.need).not.toBe('changed')
  })

  it('starts a blank project with only the starter object in place', () => {
    const done = Object.values(getProgress(createProject(blankTemplate)).checks).flat().filter((item) => item.done)
    expect(done.map((item) => item.label)).toEqual(['Thiết kế hình dạng vật thể'])
  })
})

describe('decision matrix', () => {
  const criteria = [{ id: 'a', weight: 5 }, { id: 'b', weight: 2 }]

  it('weights scores and reports completeness', () => {
    expect(scoreSolution({ scores: { a: 4, b: 5 } }, criteria)).toEqual({ total: 30, max: 35, percent: 86, complete: true })
    expect(scoreSolution({ scores: { a: 4 } }, criteria).complete).toBe(false)
  })

  it('ranks by weighted total, not raw sum', () => {
    const heavy = { id: 'heavy', scores: { a: 5, b: 1 } } // 27
    const light = { id: 'light', scores: { a: 2, b: 5 } } // 20, higher raw sum would be 7 vs 6
    expect(rankSolutions([light, heavy], criteria).map((item) => item.solution.id)).toEqual(['heavy', 'light'])
  })

  it('prefers the explicit choice, otherwise the best fully-scored option', () => {
    const project = createProject(phoneStand)
    const [first, second] = project.solutions
    project.criteria.forEach((item) => { first.scores[item.id] = 2; second.scores[item.id] = 4 })
    expect(getChosenSolution(project).id).toBe(second.id)
    project.chosenSolutionId = first.id
    expect(getChosenSolution(project).id).toBe(first.id)
  })
})

describe('progress', () => {
  it('marks a step done only when every check passes', () => {
    const project = createProject(phoneStand)
    expect(getProgress(project).steps.problem).toBe(true)
    expect(getProgress(project).steps.prototype).toBe(false)

    expect(project.prototype.model.cells.length).toBeGreaterThan(0) // templates ship a starter object
    project.prototype.materials = [{ id: 'm', name: 'Đế', material: 'Bìa', qty: 1, size: '', cost: 0 }]
    project.prototype.steps = 'Cắt đế, dán tấm tựa'
    project.prototype.safety = safetyChecklist.slice(1).map((item) => item.id)
    expect(getProgress(project).steps.prototype).toBe(false)
    project.prototype.safety = safetyChecklist.map((item) => item.id)
    expect(getProgress(project).steps.prototype).toBe(true)
    project.prototype.drawing.material = ''
    expect(getProgress(project).steps.prototype).toBe(false)
  })

  it('gives projects saved before the drawing feature a starter model', () => {
    const legacy = createProject(phoneStand)
    delete legacy.prototype.model
    delete legacy.prototype.drawing
    localStorage.setItem('enginelab_engineering_design_v1:u1', JSON.stringify([legacy]))
    const [loaded] = loadProjects('u1')
    expect(loaded.prototype.model.cells.length).toBeGreaterThan(0)
    expect(loaded.prototype.drawing).toMatchObject({ material: phoneStand.material, scale: 'auto' })
  })

  it('requires a recorded result and verdict for every criterion', () => {
    const project = createProject(phoneStand)
    project.iterations = [{ id: 'i', version: 2, note: 'x', date: '' }]
    project.tests.forEach((test) => { test.result = 'ok'; test.passed = true })
    expect(getProgress(project).steps.testing).toBe(true)
    project.tests[0].passed = null
    expect(getProgress(project).steps.testing).toBe(false)
  })
})

it('builds SVG path data from stroke points', () => {
  expect(strokeToPath([[1, 2], [3, 4], [5, 6]])).toBe('M1 2L3 4L5 6')
  expect(strokeToPath([])).toBe('')
})
