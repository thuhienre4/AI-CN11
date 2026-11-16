import { describe, expect, it } from 'vitest'
import { JOBS_WITH_3D, allCareerJobs } from '../../data/careerGames'
import { CAREER_SIMULATIONS } from './index'
import { clickPart, procedureStars, startProcedure } from './procedure'

const sims = Object.values(CAREER_SIMULATIONS)

const play = (sim, parts) => parts.reduce((state, part) => clickPart(sim, state, part), startProcedure())

describe('3D workplace procedures', () => {
  it('exist for one job of each careers lesson, as the job cards announce', () => {
    expect(Object.keys(CAREER_SIMULATIONS).sort()).toEqual([...JOBS_WITH_3D].sort())
    const lessons = new Set(JOBS_WITH_3D.map((id) => allCareerJobs().find((job) => job.id === id).lessonId))
    expect(lessons.size).toBe(5)
  })

  it.each(sims.map((sim) => [sim.job, sim]))('%s: every step, hazard and label points at a real part of the scene', (_, sim) => {
    const built = sim.build()
    const tagged = new Set()
    built.root.traverse((child) => { if (child.isMesh && child.userData.part) tagged.add(child.userData.part) })
    for (const step of sim.steps) {
      expect(sim.parts[step.part], step.part).toBeTruthy()
      expect(tagged.has(step.part), step.part).toBe(true)
      expect(step.instruction && step.done).toBeTruthy()
    }
    for (const part of Object.keys(sim.hazards || {})) expect(tagged.has(part), part).toBe(true)
    for (const part of tagged) expect(sim.parts[part], part).toBeTruthy()
    // every state of the procedure animates without error
    for (let index = 0; index <= sim.steps.length; index += 1) built.update(index * 0.5, { index, selected: null })
  })

  it.each(sims.map((sim) => [sim.job, sim]))('%s: the right order finishes without a mistake', (_, sim) => {
    const state = play(sim, sim.steps.map((step) => step.part))
    expect(state.done).toBe(true)
    expect(state.mistakes).toBe(0)
    expect(procedureStars(state.mistakes)).toBe(3)
  })

  it('counts a skipped safety step and a hazard as mistakes, with the reason', () => {
    const sim = CAREER_SIMULATIONS['maintenance-tech']
    const early = play(sim, ['stopButton', 'bearing'])
    expect(early.mistakes).toBe(1)
    expect(early.message.tone).toBe('warn')
    expect(early.message.text).toMatch(/cô lập|khóa/)
    expect(early.index).toBe(1)
    const hazard = clickPart(sim, early, 'grease')
    expect(hazard.message.tone).toBe('danger')
    expect(hazard.mistakes).toBe(2)
    expect(procedureStars(hazard.mistakes)).toBe(2)
  })

  it('a hazard can depend on the moment: touching the turning workpiece only while the lathe runs', () => {
    const sim = CAREER_SIMULATIONS['cnc-operator']
    const idle = clickPart(sim, startProcedure(), 'workpiece')
    expect(idle.mistakes).toBe(0)
    const running = play(sim, ['drawing', 'chuckKey', 'tool', 'guard', 'startButton', 'workpiece'])
    expect(running.mistakes).toBe(1)
    expect(running.message.tone).toBe('danger')
  })

  it('shows what any other object is without counting it', () => {
    const sim = CAREER_SIMULATIONS['electrician']
    const state = clickPart(sim, startProcedure(), 'tester')
    expect(state.mistakes).toBe(1)
    const neutral = clickPart(sim, startProcedure(), null)
    expect(neutral.mistakes).toBe(0)
    expect(clickPart(sim, play(sim, ['branchBreaker']), 'mainBreaker').mistakes).toBe(0)
  })
})
