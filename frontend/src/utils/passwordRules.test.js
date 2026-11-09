import { describe, expect, it } from 'vitest'

import { passwordProblem } from './passwordRules'

describe('password rule shared with the server', () => {
  it.each([
    ['ngan1', 'ít nhất 8'],
    ['chicochu', 'chữ và số'],
    ['12345678', 'chữ và số'],
    ['matkhau123', 'phổ biến'],
    ['annguyen2026', 'tên đăng nhập'],
  ])('explains why %s is too weak', (password, reason) => {
    expect(passwordProblem(password, 'annguyen')).toContain(reason)
  })

  it('accepts a password with letters (also Vietnamese ones) and digits', () => {
    expect(passwordProblem('Đồngcơ4kì2026', 'annguyen')).toBeNull()
  })
})
