import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft, ArrowRight, AtSign, BookOpenCheck, Check, CheckCircle2, Eye, EyeOff,
  GraduationCap, LockKeyhole, Mail, School, ShieldCheck, Sparkles, UserRound, UsersRound,
} from 'lucide-react'
import { useAuthStore } from '../store'

const roles = [
  {
    value: 'student',
    title: 'Học sinh THPT',
    shortTitle: 'Học sinh',
    subtitle: 'Học tập và phát triển năng lực',
    note: 'Tham gia bài học, làm quiz, nộp nhiệm vụ và theo dõi tiến độ cá nhân.',
    icon: GraduationCap,
  },
  {
    value: 'teacher',
    title: 'Giáo viên Công nghệ',
    shortTitle: 'Giáo viên',
    subtitle: 'Tổ chức và quản lý lớp học',
    note: 'Quản lý học liệu, giao nhiệm vụ và theo dõi quá trình học tập của học sinh.',
    icon: UsersRound,
  },
]

const highlights = [
  { icon: BookOpenCheck, title: 'Học liệu thông minh', text: 'Bài học, quiz và mô phỏng trực quan.' },
  { icon: Sparkles, title: 'Trợ giảng AI', text: 'Hỗ trợ giải đáp trong suốt hành trình học.' },
  { icon: ShieldCheck, title: 'Tiến độ bảo mật', text: 'Dữ liệu học tập được lưu riêng cho bạn.' },
]

const Brand = () => (
  <Link to="/" className="register-brand" aria-label="EngineLab AI - Trang chủ">
    <span><Sparkles aria-hidden="true" /></span>
    <div><strong>EngineLab</strong><em>AI</em><small>Công nghệ THPT</small></div>
  </Link>
)

// Keep these rules in sync with backend/schemas UserCreate.
const USERNAME_PATTERN = /^[a-zA-Z0-9._]{3,50}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRules = [
  { test: (value) => value.length >= 8, label: 'Ít nhất 8 ký tự' },
  { test: (value) => /[a-zA-Z]/.test(value), label: 'Có chữ cái' },
  { test: (value) => /\d/.test(value), label: 'Có chữ số' },
]

const validators = {
  full_name: (value, data) => (data.role !== 'student' || value.trim().length >= 2 ? '' : 'Vui lòng nhập họ và tên đầy đủ.'),
  student_class: (value, data) => (data.role !== 'student' || value.trim() ? '' : 'Vui lòng nhập lớp, ví dụ 11A1.'),
  username: (value) => {
    if (!value.trim()) return 'Vui lòng chọn tên đăng nhập.'
    return USERNAME_PATTERN.test(value.trim()) ? '' : 'Từ 3–50 ký tự, chỉ gồm chữ không dấu, số, dấu chấm hoặc gạch dưới.'
  },
  email: (value) => {
    if (!value.trim()) return 'Vui lòng nhập email.'
    return EMAIL_PATTERN.test(value.trim()) ? '' : 'Email chưa đúng định dạng.'
  },
  password: (value) => (passwordRules.every((rule) => rule.test(value)) ? '' : 'Mật khẩu cần ít nhất 8 ký tự, gồm cả chữ và số.'),
  confirm_password: (value, data) => {
    if (!value) return 'Vui lòng nhập lại mật khẩu.'
    return value === data.password ? '' : 'Mật khẩu nhập lại không khớp.'
  },
}
const FIELD_ORDER = ['full_name', 'student_class', 'username', 'email', 'password', 'confirm_password']

const Field = ({ icon: FieldIcon, label, hint, error, errorId, children }) => (
  <label className="register-field">
    <span className="register-field-label">{label}{hint && <small>{hint}</small>}</span>
    <span className={`register-input ${error ? 'has-error' : ''}`}>
      <FieldIcon aria-hidden="true" />
      {children}
    </span>
    {error && <span id={errorId} className="studio-field-error">{error}</span>}
  </label>
)

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    full_name: '',
    student_class: '',
    role: 'student',
  })
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [formError, setFormError] = useState('')
  const fieldRefs = useRef({})

  const errors = useMemo(() => Object.fromEntries(
    FIELD_ORDER.map((name) => [name, validators[name](formData[name], formData)])
  ), [formData])
  const visibleError = (name) => serverErrors[name] || (touched[name] ? errors[name] : '')
  // Props shared by every validated input: value binding, blur tracking, focus target and a11y wiring.
  const fieldProps = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
    ref: (node) => { fieldRefs.current[name] = node },
    'aria-invalid': Boolean(visibleError(name)),
    'aria-describedby': visibleError(name) ? `${name}-error` : undefined,
  })

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }))
    if (serverErrors[name]) setServerErrors((current) => ({ ...current, [name]: '' }))
    if (formError) setFormError('')
  }

  const chooseRole = (role) => {
    setFormData((current) => ({
      ...current,
      role,
      student_class: role === 'teacher' ? '' : current.student_class,
    }))
  }

  const passwordScore = useMemo(() => {
    const password = formData.password
    return [
      password.length >= 8,
      /[A-ZÀ-Ỹ]/.test(password) && /[a-zà-ỹ]/.test(password),
      /\d/.test(password),
      /[^A-Za-zÀ-ỹ0-9]/.test(password),
    ].filter(Boolean).length
  }, [formData.password])

  const passwordLabel = ['Chưa nhập', 'Yếu', 'Trung bình', 'Khá tốt', 'Mạnh'][passwordScore]
  const selectedRole = roles.find((role) => role.value === formData.role)
  const SelectedRoleIcon = selectedRole.icon

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(Object.fromEntries(FIELD_ORDER.map((name) => [name, true])))
    const firstInvalid = FIELD_ORDER.find((name) => errors[name])
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus()
      return
    }

    const result = await register(formData)
    if (!result.success) {
      if (result.field) {
        setServerErrors({ [result.field]: result.error })
        fieldRefs.current[result.field]?.focus()
      } else {
        setFormError(result.error || 'Tạo tài khoản thất bại')
      }
      return
    }

    if (result.needsLogin) {
      navigate('/login', { state: { username: formData.username.trim(), registered: true } })
      return
    }
    // Signed in automatically; PublicOnlyRoute takes the user to their home page.
    toast.success(result.offline
      ? 'Đã tạo tài khoản trên trình duyệt này (chế độ ngoại tuyến).'
      : 'Tạo tài khoản thành công. Chào mừng bạn đến với EngineLab!')
  }

  return (
    <main className="register-shell">
      <div className="register-grid" aria-hidden="true" />
      <aside className="register-story">
        <div className="register-story-inner">
          <Brand />

          <div className="register-intro">
            <span className="register-kicker"><i /> Nền tảng học tập ứng dụng AI</span>
            <h1>Khởi đầu hành trình<br /><em>Công nghệ thông minh.</em></h1>
            <p>Một không gian học tập dành riêng cho môn Công nghệ THPT — trực quan, chủ động và phù hợp với từng người học.</p>
          </div>

          <div className="register-highlights">
            {highlights.map(({ icon: HighlightIcon, title, text }) => (
              <article key={title}>
                <span><HighlightIcon aria-hidden="true" /></span>
                <div><h2>{title}</h2><p>{text}</p></div>
                <CheckCircle2 aria-hidden="true" />
              </article>
            ))}
          </div>

        </div>
      </aside>

      <section className="register-workspace">
        <header className="register-mobile-header">
          <Brand />
          <Link to="/login">Đăng nhập</Link>
        </header>

        <div className="register-form-wrap">
          <Link to="/login" className="register-back"><ArrowLeft aria-hidden="true" /> Quay lại đăng nhập</Link>

          <div className="register-heading">
            <span>BƯỚC 1/1 · THIẾT LẬP TÀI KHOẢN</span>
            <h2>Tạo tài khoản của bạn</h2>
            <p>Chỉ mất khoảng một phút để bắt đầu trải nghiệm.</p>
          </div>

          <div className="register-role-picker" role="radiogroup" aria-label="Bạn tham gia với vai trò">
            <p>Bạn tham gia với vai trò</p>
            <div>
              {roles.map((role) => {
                const RoleIcon = role.icon
                const active = formData.role === role.value
                return (
                  <button
                    key={role.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={active ? 'active' : ''}
                    onClick={() => chooseRole(role.value)}
                  >
                    <span><RoleIcon aria-hidden="true" /></span>
                    <div><strong>{role.shortTitle}</strong><small>{role.subtitle}</small></div>
                    <i>{active && <Check aria-hidden="true" />}</i>
                  </button>
                )
              })}
            </div>
            <aside><SelectedRoleIcon aria-hidden="true" /><span><strong>{selectedRole.title}</strong>{selectedRole.note}</span></aside>
          </div>

          {formError && <div role="alert" className="studio-auth-error">{formError}</div>}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <div className="register-form-row">
              <Field icon={UserRound} label="Họ và tên" hint={formData.role === 'teacher' ? 'không bắt buộc' : 'bắt buộc'} error={visibleError('full_name')} errorId="full_name-error">
                <input
                  type="text"
                  {...fieldProps('full_name')}
                  placeholder={formData.role === 'student' ? 'VD: Nguyễn Minh An' : 'VD: Cô Nguyễn Thị Lan'}
                  autoComplete="name"
                />
              </Field>

              {formData.role === 'student' ? (
                <Field icon={School} label="Lớp" hint="bắt buộc" error={visibleError('student_class')} errorId="student_class-error">
                  <input
                    type="text"
                    {...fieldProps('student_class')}
                    placeholder="VD: 11A1"
                    autoComplete="off"
                    maxLength={50}
                  />
                </Field>
              ) : (
                <Field icon={School} label="Chuyên môn">
                  <input type="text" value="Giáo viên Công nghệ" disabled readOnly />
                </Field>
              )}
            </div>

            <div className="register-form-row">
              <Field icon={AtSign} label="Tên đăng nhập" hint="chữ không dấu, số, . hoặc _" error={visibleError('username')} errorId="username-error">
                <input
                  type="text"
                  {...fieldProps('username')}
                  placeholder="VD: minhan.11a1"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={50}
                />
              </Field>
              <Field icon={Mail} label="Email" error={visibleError('email')} errorId="email-error">
                <input
                  type="email"
                  {...fieldProps('email')}
                  placeholder="ban@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                />
              </Field>
            </div>

            <Field icon={LockKeyhole} label="Mật khẩu" hint="tối thiểu 8 ký tự, có chữ và số" error={visibleError('password')} errorId="password-error">
              <input
                type={showPassword ? 'text' : 'password'}
                {...fieldProps('password')}
                placeholder="Nhập mật khẩu an toàn"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </Field>

            <div className={`register-strength score-${passwordScore}`} aria-live="polite">
              <div aria-hidden="true">{[1, 2, 3, 4].map((level) => <i key={level} className={passwordScore >= level ? 'filled' : ''} />)}</div>
              <span>Độ an toàn: <strong>{passwordLabel}</strong></span>
              <ul className="register-rules" aria-label="Yêu cầu mật khẩu">
                {passwordRules.map((rule) => {
                  const passed = rule.test(formData.password)
                  return <li key={rule.label} className={passed ? 'is-met' : ''}>{passed ? <Check aria-hidden="true" /> : <i aria-hidden="true" />}{rule.label}<span className="sr-only">{passed ? ' - đã đạt' : ' - chưa đạt'}</span></li>
                })}
              </ul>
            </div>

            <Field icon={LockKeyhole} label="Nhập lại mật khẩu" error={visibleError('confirm_password')} errorId="confirm_password-error">
              <input
                type={showPassword ? 'text' : 'password'}
                {...fieldProps('confirm_password')}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
            </Field>

            <button type="submit" disabled={isLoading} className="register-submit" aria-busy={isLoading}>
              <span>{isLoading ? 'Đang tạo tài khoản...' : `Tạo tài khoản ${selectedRole.shortTitle.toLowerCase()}`}</span>
              {!isLoading && <ArrowRight aria-hidden="true" />}
            </button>

          </form>

          <p className="register-login-link">Đã có tài khoản? <Link to="/login">Đăng nhập ngay <ArrowRight aria-hidden="true" /></Link></p>
        </div>
      </section>
    </main>
  )
}
