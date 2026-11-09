import { beforeEach, describe, expect, it } from 'vitest'

import { copyOf, fetchDesigns, fromServer, removeDesign, storeDesign } from './designStore'
import { loadDesigns, saveDesign } from './gameRoom'

const memoryStorage = () => {
  const store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
  }
}

// A stand-in for the server's /api/game-designs
const fakeServer = () => {
  let next = 1
  const rows = []
  return {
    rows,
    list: async () => ({ data: [...rows].reverse() }),
    create: async (body) => { const row = { id: next++, ...body, updated_at: 'now' }; rows.push(row); return { data: row } },
    update: async (id, body) => { const row = rows.find((item) => item.id === id); Object.assign(row, body); return { data: row } },
    remove: async (id) => { rows.splice(rows.findIndex((item) => item.id === id), 1) },
  }
}

const offline = () => Object.assign(new Error('offline'), { code: 'NO_BACKEND' })
const question = { text: 'Kì nào hai xu páp đều đóng?', options: ['Nạp', 'Nén'], correct: 1, seconds: 20, explanation: '' }

describe('where a teacher keeps quiz designs', () => {
  beforeEach(() => {
    globalThis.localStorage = memoryStorage()
    localStorage.setItem('token', 'server-token')
  })

  it('moves designs made on this device to the account once, then lists them from the server', async () => {
    const server = fakeServer()
    saveDesign(7, { id: 'game-a', title: 'Làm khi mất mạng', questions: [question] })
    const { designs, source } = await fetchDesigns(7, server)
    expect(source).toBe('server')
    expect(designs.map((design) => design.title)).toEqual(['Làm khi mất mạng'])
    expect(loadDesigns(7)).toEqual([])
    expect((await fetchDesigns(7, server)).designs).toHaveLength(1)
  })

  it('creates a design once and updates it afterwards instead of making copies', async () => {
    const server = fakeServer()
    const saved = await storeDesign(7, { id: 'game-new', title: 'Ôn Bài 18', questions: [question] }, 'server', server)
    expect(saved.serverId).toBe(1)
    await storeDesign(7, { ...saved, title: 'Ôn Bài 18 (sửa)' }, 'server', server)
    expect(server.rows.map((row) => row.title)).toEqual(['Ôn Bài 18 (sửa)'])
    await removeDesign(7, saved, 'server', server)
    expect(server.rows).toEqual([])
  })

  it('falls back to this device when the server is missing or the session is offline', async () => {
    const missing = { list: async () => { throw offline() } }
    saveDesign(7, { id: 'game-a', title: 'Trên máy', questions: [] })
    expect((await fetchDesigns(7, missing)).source).toBe('device')
    localStorage.setItem('token', 'local-token-gv')
    const { designs, source } = await fetchDesigns(7, fakeServer())
    expect(source).toBe('device')
    expect(designs[0].title).toBe('Trên máy')
  })

  it('pads server questions to four option boxes and copies a design without sharing its questions', () => {
    const design = fromServer({ id: 3, title: 'A', questions: [question], updated_at: 'now' })
    expect(design.questions[0].options).toEqual(['Nạp', 'Nén', '', ''])
    const copy = copyOf(design)
    expect(copy.title).toBe('A (bản sao)')
    expect(copy.serverId).toBeUndefined()
    copy.questions[0].options[0] = 'Đổi'
    expect(design.questions[0].options[0]).toBe('Nạp')
  })
})
