// The API answers a rejected form with {detail, errors: [{loc: ['body', field], msg}]}; name the field in Vietnamese.
const REGISTER_FIELDS = {
  email: 'Email không hợp lệ.',
  username: 'Tên đăng nhập cần từ 3 đến 50 kí tự.',
  password: 'Mật khẩu chưa đạt yêu cầu (ít nhất 8 kí tự).',
  full_name: 'Họ và tên không hợp lệ.',
  student_class: 'Lớp không hợp lệ.',
  class_code: 'Mã lớp không hợp lệ.',
  role: 'Vai trò không hợp lệ.',
}
export const registrationErrorMessage = (data) => {
  const fields = (Array.isArray(data?.errors) ? data.errors : [])
    .map((item) => REGISTER_FIELDS[item?.loc?.at(-1)])
    .filter(Boolean)
  if (fields.length) return [...new Set(fields)].join(' ')
  return typeof data?.detail === 'string' ? data.detail : 'Tạo tài khoản thất bại'
}
