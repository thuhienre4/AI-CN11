import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildJourney, levelFor, localDay } from './journey'

const cases = JSON.parse(fs.readFileSync(new URL('../../../backend/data/journey_cases.json', import.meta.url), 'utf8'))

describe('learning journey (offline rules)', () => {
  it.each(cases.map((item) => [item.name, item]))('matches the server on: %s', (_, item) => {
    expect(buildJourney(item.lessons, item.events, item.today)).toEqual(item.expected)
  })

  it('counts days in Vietnam time and levels like the server', () => {
    expect(localDay('2026-11-15T17:30:00Z')).toBe('2026-11-16')
    expect([0, 99, 100, 299, 300, 4500].map(levelFor)).toEqual([1, 1, 2, 2, 3, 10])
  })

  it('gives nothing for asking the assistant or opening a lesson again and again', () => {
    const lessons = [{ status: 'in_progress', best_quiz_score: 0, quiz_attempt_count: 0, simulation_count: 0 }]
    const events = Array.from({ length: 40 }, () => ['assistant_question', '2026-11-16'])
    expect(buildJourney(lessons, events, '2026-11-16').xp).toBe(5)
  })
})
