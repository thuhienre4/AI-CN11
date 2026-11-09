// Same rule as backend/auth/passwords.py, so the form explains a weak password before the server refuses it
export const MIN_PASSWORD_LENGTH = 8

const COMMON = new Set([
  '12345678', '123456789', '1234567890', 'password', 'password1', 'password123', 'qwerty123', 'abc12345',
  '11111111', '88888888', 'matkhau', 'matkhau1', 'matkhau123', 'iloveyou1', 'admin123', 'hocsinh1',
  'hocsinh123', 'giaovien1', 'giaovien123', 'enginelab1', 'congnghe1', 'congnghe123',
])

export const PASSWORD_HINT = 'Ít nhất 8 kí tự, có cả chữ và số, không chứa tên đăng nhập.'

export const passwordProblem = (password = '', username = '') => {
  if (password.length < MIN_PASSWORD_LENGTH) return `Mật khẩu cần ít nhất ${MIN_PASSWORD_LENGTH} kí tự.`
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return 'Mật khẩu cần có cả chữ và số.'
  if (COMMON.has(password.toLowerCase())) return 'Mật khẩu này quá phổ biến, hãy chọn mật khẩu khác.'
  const name = username.trim().toLowerCase()
  if (name.length >= 3 && password.toLowerCase().includes(name)) return 'Mật khẩu không được chứa tên đăng nhập.'
  return null
}
