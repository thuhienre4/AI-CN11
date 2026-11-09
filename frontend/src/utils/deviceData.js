// What this browser keeps about a person, and how to remove it (for a shared school computer).
import { LOCAL_USERS_KEY, readLocalUsers, writeLocalUsers } from './localAccounts'

const EVENTS_KEY = 'engine_lab_learning_events'
const PROFILE_KEY = 'local_profile_meta'
const REMEMBERED_KEY = 'enginelab-remembered-user'
const SESSION_KEYS = ['token', 'local_auth_current_user']

const readJson = (storage, key, fallback) => {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

/** Removes this person's learning events, profile, saved games, remembered name, offline account and session. */
export const clearDeviceData = (user, storage = globalThis.localStorage) => {
  if (!user) return
  const events = readJson(storage, EVENTS_KEY, [])
  if (Array.isArray(events)) {
    storage.setItem(EVENTS_KEY, JSON.stringify(events.filter((event) => String(event?.user_id) !== String(user.id))))
  }
  const profiles = readJson(storage, PROFILE_KEY, {})
  if (profiles && typeof profiles === 'object') {
    delete profiles[user.username]
    storage.setItem(PROFILE_KEY, JSON.stringify(profiles))
  }
  storage.removeItem(`enginelab:game-designs:${user.id}`)
  if (storage.getItem(REMEMBERED_KEY) === user.username) storage.removeItem(REMEMBERED_KEY)
  if (storage.getItem(LOCAL_USERS_KEY) !== null) {
    writeLocalUsers(readLocalUsers(storage).filter((record) => record.username !== user.username), storage)
  }
  SESSION_KEYS.forEach((key) => storage.removeItem(key))
}
