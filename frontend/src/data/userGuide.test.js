import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { COMMON_TOPICS, FAQ, GUIDE_ROLES, GUIDE_TASKS, QUICK_START } from './userGuide'

const app = fs.readFileSync(new URL('../App.jsx', import.meta.url), 'utf8')
const routes = [...app.matchAll(/path="([^"]+)"/g)].map((match) => match[1])
const routeExists = (to) => routes.some((route) => new RegExp(`^${route.replace(/:[^/]+/g, '[^/]+')}$`).test(to))

describe('user guide', () => {
  it('covers both roles with a quick start and tasks', () => {
    for (const { id } of GUIDE_ROLES) {
      expect(QUICK_START[id]).toHaveLength(3)
      expect(GUIDE_TASKS[id].length).toBeGreaterThanOrEqual(5)
    }
  })

  it('links every topic to a page the app has', () => {
    const linked = [...Object.values(GUIDE_TASKS).flat(), ...COMMON_TOPICS].filter((topic) => topic.to)
    for (const topic of linked) {
      expect(routeExists(topic.to), topic.to).toBe(true)
      expect(topic.linkLabel).toBeTruthy()
    }
    expect(routeExists('/guide')).toBe(true)
  })

  it('has unique ids and short steps', () => {
    for (const topics of [...Object.values(GUIDE_TASKS), COMMON_TOPICS]) {
      expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length)
      for (const topic of topics) for (const step of topic.steps) expect(step.length).toBeLessThan(220)
    }
    expect(FAQ.every(([question, answer]) => question.endsWith('?') && answer.length > 20)).toBe(true)
  })
})
