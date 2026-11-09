import { describe, expect, it } from 'vitest'

import { clearDeviceData } from './deviceData'

const memoryStorage = (initial) => {
  const store = { ...initial }
  return {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    store,
  }
}

describe('clearing my data on a shared computer', () => {
  it('removes only what belongs to me and signs me out', () => {
    const storage = memoryStorage({
      engine_lab_learning_events: JSON.stringify([{ user_id: 1, event_type: 'a' }, { user_id: 2, event_type: 'b' }]),
      local_profile_meta: JSON.stringify({ an: { avatar: 'x' }, binh: { avatar: 'y' } }),
      'enginelab:game-designs:1': '[]',
      'enginelab:game-designs:2': '[]',
      'enginelab-remembered-user': 'an',
      local_auth_users: JSON.stringify([{ username: 'an' }, { username: 'binh' }]),
      token: 'local-token-an',
      local_auth_current_user: '{}',
    })
    clearDeviceData({ id: 1, username: 'an' }, storage)
    expect(JSON.parse(storage.store.engine_lab_learning_events)).toEqual([{ user_id: 2, event_type: 'b' }])
    expect(Object.keys(JSON.parse(storage.store.local_profile_meta))).toEqual(['binh'])
    expect(storage.store['enginelab:game-designs:1']).toBeUndefined()
    expect(storage.store['enginelab:game-designs:2']).toBe('[]')
    expect(storage.store['enginelab-remembered-user']).toBeUndefined()
    expect(JSON.parse(storage.store.local_auth_users)).toEqual([{ username: 'binh' }])
    expect(storage.store.token).toBeUndefined()
    expect(storage.store.local_auth_current_user).toBeUndefined()
  })
})
