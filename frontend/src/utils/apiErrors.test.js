import { describe, expect, it } from 'vitest'
import { registrationErrorMessage } from './apiErrors'

describe('registration error message', () => {
  it('names the rejected field in Vietnamese instead of the generic API text', () => {
    const data = { detail: 'Request validation failed.', errors: [{ loc: ['body', 'email'], msg: 'value is not a valid email address' }] }
    expect(registrationErrorMessage(data)).toBe('Email không hợp lệ.')
  })
  it('lists each field once', () => {
    const data = { errors: [{ loc: ['body', 'password'] }, { loc: ['body', 'password'] }, { loc: ['body', 'username'] }] }
    expect(registrationErrorMessage(data)).toBe('Mật khẩu chưa đạt yêu cầu: ít nhất 8 kí tự, có cả chữ và số, không chứa tên đăng nhập. Tên đăng nhập cần từ 3 đến 50 kí tự.')
  })
  it('keeps a plain server message, and has a fallback', () => {
    expect(registrationErrorMessage({ detail: 'Tên đăng nhập đã tồn tại' })).toBe('Tên đăng nhập đã tồn tại')
    expect(registrationErrorMessage(undefined)).toBe('Tạo tài khoản thất bại')
  })
})
