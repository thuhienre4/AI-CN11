import { describe, expect, it } from 'vitest'
import { sampleLessons } from './courseCatalog'
import { CAREER_LESSONS, QUALITY_POINTS, allCareerJobs, careerLessonIds, maxJobPoints } from './careerGames'
import { careerAdvice, careerSummary } from '../utils/careerProfile'

const lessons = new Map(sampleLessons.map((lesson) => [lesson.id, lesson.title]))

describe('career experience games', () => {
  it('belong to the five lessons on careers, with the lesson titles of the catalogue', () => {
    expect(careerLessonIds).toEqual([100107, 110102, 110502, 120102, 120502])
    for (const id of careerLessonIds) {
      expect(lessons.get(id)).toBe(CAREER_LESSONS[id].lesson)
      expect(lessons.get(id)).toMatch(/[Nn]ghề/)
    }
  })

  it('offer three jobs per lesson with unique ids, a workplace, tools and study paths', () => {
    const jobs = allCareerJobs()
    expect(jobs).toHaveLength(15)
    expect(new Set(jobs.map((entry) => entry.id)).size).toBe(15)
    for (const entry of jobs) {
      expect(entry.place && entry.summary).toBeTruthy()
      expect(entry.tools.length).toBeGreaterThan(1)
      expect(entry.study.length).toBeGreaterThan(0)
      expect(entry.steps).toHaveLength(3)
      expect(maxJobPoints(entry)).toBe(6)
    }
  })

  it('give each situation exactly one best choice, one partial and one poor, each explained', () => {
    const positions = new Set()
    for (const entry of allCareerJobs()) {
      for (const step of entry.steps) {
        expect(step.choices.map((choice) => choice.quality).sort()).toEqual(['best', 'partial', 'poor'])
        expect(new Set(step.choices.map((choice) => choice.text)).size).toBe(3)
        for (const choice of step.choices) {
          expect(QUALITY_POINTS[choice.quality]).toBeDefined()
          expect(choice.feedback.length).toBeGreaterThan(20)
        }
        positions.add(step.choices.findIndex((choice) => choice.quality === 'best'))
      }
    }
    // the best answer is not always in the same place
    expect([...positions].sort()).toEqual([0, 1, 2])
  })

  it('reads a tried job from how it went and whether the student liked it', () => {
    const entry = allCareerJobs()[0]
    expect(careerAdvice(entry, { best: 6, interest: 2 }).tone).toBe('match')
    expect(careerAdvice(entry, { best: 2, interest: 2 }).tone).toBe('grow')
    expect(careerAdvice(entry, { best: 5, interest: 0 }).tone).toBe('able')
    expect(careerAdvice(entry, { best: 1, interest: 1 }).tone).toBe('explore')
    expect(careerAdvice(entry, { best: 1, interest: 0 }).tone).toBe('other')
    const [second, third] = allCareerJobs().slice(1, 3)
    const summary = careerSummary({ [entry.id]: { best: 6, interest: 1 }, [second.id]: { best: 2, interest: 2 }, [third.id]: { best: 6, interest: 2 } })
    expect(summary.map((row) => row.entry.id)).toEqual([third.id, second.id, entry.id])
  })
})
