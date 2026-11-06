import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../services/api', () => ({
  learningAPI: { trackEventsBatch: vi.fn() },
}))

import { learningAPI } from '../services/api'
import { recordLocalLearningEvent, syncPendingLearningEvents } from './learningProgress'

const STORAGE_KEY = 'engine_lab_learning_events'
const USER_ID = 7

const installStorage = () => {
  const values = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  })
}

const storedEvents = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
const offlineEvent = (lessonId, eventType = 'lesson_viewed') => ({
  lesson_id: lessonId,
  event_type: eventType,
  auto_sync: false,
})

describe('local-first learning event queue', () => {
  beforeEach(() => {
    installStorage()
    localStorage.setItem('token', 'server-token')
    learningAPI.trackEventsBatch.mockReset()
  })

  it('keeps events pending while the network is down and delivers them after recovery', async () => {
    recordLocalLearningEvent(USER_ID, offlineEvent(1))
    recordLocalLearningEvent(USER_ID, offlineEvent(2))
    learningAPI.trackEventsBatch.mockRejectedValueOnce(new Error('Network Error'))

    expect(await syncPendingLearningEvents(USER_ID)).toEqual({ synced: 0 })
    expect(storedEvents().every((event) => event.synced_at === null)).toBe(true)

    learningAPI.trackEventsBatch.mockResolvedValueOnce({ data: [] })
    expect(await syncPendingLearningEvents(USER_ID)).toEqual({ synced: 2 })
    expect(storedEvents().every((event) => event.synced_at)).toBe(true)
  })

  it('retries with the same client_event_id so the server can deduplicate', async () => {
    recordLocalLearningEvent(USER_ID, offlineEvent(1))
    learningAPI.trackEventsBatch.mockRejectedValueOnce(new Error('timeout'))
    learningAPI.trackEventsBatch.mockResolvedValueOnce({ data: [] })

    await syncPendingLearningEvents(USER_ID)
    await syncPendingLearningEvents(USER_ID)

    const [[, firstPayload], [, secondPayload]] = learningAPI.trackEventsBatch.mock.calls
    expect(firstPayload[0].client_event_id).toBeTruthy()
    expect(secondPayload[0].client_event_id).toBe(firstPayload[0].client_event_id)
  })

  it('does not resend events that are already synced', async () => {
    recordLocalLearningEvent(USER_ID, offlineEvent(1))
    learningAPI.trackEventsBatch.mockResolvedValue({ data: [] })

    await syncPendingLearningEvents(USER_ID)
    await syncPendingLearningEvents(USER_ID)

    expect(learningAPI.trackEventsBatch).toHaveBeenCalledTimes(1)
  })

  it('shares one in-flight sync between concurrent callers', async () => {
    recordLocalLearningEvent(USER_ID, offlineEvent(1))
    learningAPI.trackEventsBatch.mockResolvedValue({ data: [] })

    await Promise.all([syncPendingLearningEvents(USER_ID), syncPendingLearningEvents(USER_ID)])

    expect(learningAPI.trackEventsBatch).toHaveBeenCalledTimes(1)
  })

  it('splits a long offline queue into batches of 50', async () => {
    for (let lessonId = 1; lessonId <= 120; lessonId += 1) {
      recordLocalLearningEvent(USER_ID, offlineEvent(lessonId))
    }
    learningAPI.trackEventsBatch.mockResolvedValue({ data: [] })

    expect(await syncPendingLearningEvents(USER_ID)).toEqual({ synced: 120 })
    expect(learningAPI.trackEventsBatch.mock.calls.map(([, batch]) => batch.length)).toEqual([50, 50, 20])
  })

  it('never sends another user\'s pending events', async () => {
    recordLocalLearningEvent(USER_ID, offlineEvent(1))
    recordLocalLearningEvent(99, offlineEvent(2))
    learningAPI.trackEventsBatch.mockResolvedValue({ data: [] })

    await syncPendingLearningEvents(USER_ID)

    const [[, payload]] = learningAPI.trackEventsBatch.mock.calls
    expect(payload.map((event) => event.lesson_id)).toEqual([1])
  })

  it('stays local for an offline demo session', async () => {
    localStorage.setItem('token', 'local-token-demo')
    recordLocalLearningEvent(USER_ID, offlineEvent(1))

    expect(await syncPendingLearningEvents(USER_ID)).toEqual({ synced: 0 })
    expect(learningAPI.trackEventsBatch).not.toHaveBeenCalled()
  })

  it('recovers from a corrupted local queue', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')

    recordLocalLearningEvent(USER_ID, offlineEvent(1))

    expect(storedEvents()).toHaveLength(1)
  })

  it('collapses a repeated view within the 60 second window', () => {
    recordLocalLearningEvent(USER_ID, offlineEvent(1))
    recordLocalLearningEvent(USER_ID, offlineEvent(1))

    expect(storedEvents()).toHaveLength(1)
  })

  it('documents the known limit: only the newest 500 events survive a long outage', () => {
    for (let lessonId = 1; lessonId <= 510; lessonId += 1) {
      recordLocalLearningEvent(USER_ID, offlineEvent(lessonId))
    }

    const events = storedEvents()
    expect(events).toHaveLength(500)
    expect(events[0].lesson_id).toBe(11)
  })
})
