import { beforeEach, describe, expect, it } from 'vitest'

import {
  bankLessons,
  bankQuestionsFor,
  cleanRoomCode,
  deleteDesign,
  designProblems,
  emptyQuestion,
  loadDesigns,
  playableDesign,
  rankTeams,
  roomSocketUrl,
  saveDesign,
  scoreTeams,
} from './gameRoom'

const question = (overrides = {}) => ({ ...emptyQuestion(), text: 'Kì nào hai xu páp đều đóng?', options: ['Nạp', 'Nén', 'Thải', ''], correct: 1, ...overrides })

describe('questions from the lesson bank', () => {
  it('offers every lesson of a grade and keeps the right answer where the options show it', () => {
    expect(bankLessons(11)).toHaveLength(25)
    const items = bankQuestionsFor(11, 18)
    expect(items.length).toBeGreaterThan(0)
    items.forEach((item) => {
      expect(item.options).toHaveLength(4)
      expect(item.correct).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('checking a design before it is played', () => {
  it('accepts a complete design', () => {
    expect(designProblems({ title: 'Ôn Bài 18', questions: [question()] })).toEqual([])
  })

  it('names what is missing', () => {
    const problems = designProblems({ title: ' ', questions: [question({ text: '', correct: 3, seconds: 2, options: ['A', 'A', '', ''] })] })
    expect(problems.join(' ')).toMatch(/Đặt tên/)
    expect(problems.join(' ')).toMatch(/chưa có nội dung/)
    expect(problems.join(' ')).toMatch(/trùng nhau/)
    expect(problems.join(' ')).toMatch(/ô trống/)
    expect(problems.join(' ')).toMatch(/thời gian/)
    expect(designProblems({ title: 'A', questions: [] })).toContain('Thêm ít nhất một câu hỏi.')
  })

  it('drops empty option boxes and keeps the right answer on the same text', () => {
    const played = playableDesign({ title: ' Ôn ', questions: [question({ options: ['', 'Nén', ' Nạp ', ''], correct: 2 })] })
    expect(played.title).toBe('Ôn')
    expect(played.questions[0].options).toEqual(['Nén', 'Nạp'])
    expect(played.questions[0].correct).toBe(1)
  })
})

describe('designs saved on the device', () => {
  beforeEach(() => {
    const store = {}
    globalThis.localStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => { store[key] = String(value) },
      removeItem: (key) => { delete store[key] },
    }
  })

  it('keeps one list per teacher, newest first, and deletes by id', () => {
    saveDesign(1, { id: 'a', title: 'Một', questions: [] })
    saveDesign(1, { id: 'b', title: 'Hai', questions: [] })
    saveDesign(1, { id: 'a', title: 'Một (sửa)', questions: [] })
    expect(loadDesigns(1).map((design) => design.title)).toEqual(['Một (sửa)', 'Hai'])
    expect(loadDesigns(2)).toEqual([])
    expect(deleteDesign(1, 'a').map((design) => design.id)).toEqual(['b'])
  })

  it('survives broken saved data', () => {
    localStorage.setItem('enginelab:game-designs:1', '{oops')
    expect(loadDesigns(1)).toEqual([])
  })
})

describe('joining and projector scoring', () => {
  it('builds a secure socket address on https and keeps only the digits of a code', () => {
    expect(roomSocketUrl('123456', 'https://api.example.com')).toBe('wss://api.example.com/api/ws/game-rooms/123456')
    expect(roomSocketUrl('123456', 'http://localhost:8000')).toBe('ws://localhost:8000/api/ws/game-rooms/123456')
    expect(cleanRoomCode(' 12 34-56 789')).toBe('123456')
  })

  it('gives points to every team with the right option and ranks them', () => {
    const teams = [{ name: 'Đội Xanh', score: 0 }, { name: 'Đội Đỏ', score: 100 }, { name: 'Đội Vàng', score: 0 }]
    const scored = scoreTeams(teams, [1, 1, 0], 1)
    expect(scored.map((team) => team.score)).toEqual([100, 200, 0])
    expect(rankTeams(scored).map((team) => team.name)).toEqual(['Đội Đỏ', 'Đội Xanh', 'Đội Vàng'])
  })
})
