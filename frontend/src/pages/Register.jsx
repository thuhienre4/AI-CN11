import { useMemo, useState } from 'react'
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
    <div><strong>EngineLab</strong><em>AI</em><small>Công nghệ 11</small></div>
  </Link>
)

const Field = ({ icon: FieldIcon, label, hint, children }) => (
  <label className="register-field">
    <span className="register-field-label">{label}{hint && <small>{hint}</small>}</span>
    <span className="register-input">
      <FieldIcon aria-hidden="true" />
      {children}
    </span>
  </label>
)

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    student_class: '',
    role: 'student',
  })

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }))
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

    if (formData.role === 'student' && !formData.full_name.trim()) {
      toast.error('Học sinh cần nhập đầy đủ họ và tên')
      return
    }
    if (formData.role === 'student' && !formData.student_class.trim()) {
      toast.error('Học sinh cần nhập lớp')
      return
    }

    const result = await register(
      formData.username.trim(),
      formData.email.trim(),
      formData.password,
      formData.full_name.trim(),
      formData.role,
      formData.student_class.trim()
    )

    if (result.success) {
      toast.success('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay!')
      navigate('/login', { state: { role: formData.role, username: formData.username.trim() } })
    } else {
      toast.error(result.error || error || 'Tạo tài khoản thất bại')
    }
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

          <div className="register-proof">
            <div className="register-avatars" aria-hidden="true"><span>NA</span><span>MH</span><span>TL</span><span>+2k</span></div>
            <p><strong>2.000+ người học</strong><br />đang khám phá Công nghệ cùng EngineLab.</p>
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

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-form-row">
              <Field icon={UserRound} label="Họ và tên" hint={formData.role === 'teacher' ? 'không bắt buộc' : 'bắt buộc'}>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder={formData.role === 'student' ? 'VD: Nguyễn Minh An' : 'VD: Cô Nguyễn Thị Lan'}
                  autoComplete="name"
                  required={formData.role === 'student'}
                />
              </Field>

              {formData.role === 'student' ? (
                <Field icon={School} label="Lớp" hint="bắt buộc">
                  <input
                    type="text"
                    name="student_class"
                    value={formData.student_class}
                    onChange={handleChange}
                    placeholder="VD: 11A1"
                    autoComplete="organization"
                    required
                  />
                </Field>
              ) : (
                <Field icon={School} label="Chuyên môn">
                  <input type="text" value="Giáo viên Công nghệ" disabled readOnly />
                </Field>
              )}
            </div>

            <div className="register-form-row">
              <Field icon={AtSign} label="Tên đăng nhập" hint="tối thiểu 3 ký tự">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="VD: minhan11a1"
                  autoComplete="username"
                  minLength="3"
                  required
                />
              </Field>
              <Field icon={Mail} label="Email">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ban@example.com"
                  autoComplete="email"
                  required
                />
              </Field>
            </div>

            <Field icon={LockKeyhole} label="Mật khẩu" hint="tối thiểu 8 ký tự">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu an toàn"
                autoComplete="new-password"
                minLength="8"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </Field>

            <div className={`register-strength score-${passwordScore}`}>
              <div>{[1, 2, 3, 4].map((level) => <i key={level} className={passwordScore >= level ? 'filled' : ''} />)}</div>
              <span>Độ an toàn: <strong>{passwordLabel}</strong></span>
            </div>

            <button type="submit" disabled={isLoading} className="register-submit">
              <span>{isLoading ? 'Đang tạo tài khoản...' : `Tạo tài khoản ${selectedRole.shortTitle.toLowerCase()}`}</span>
              {!isLoading && <ArrowRight aria-hidden="true" />}
            </button>

            <p className="register-terms">
              <ShieldCheck aria-hidden="true" />
              Bằng việc tiếp tục, bạn đồng ý với <button type="button">Điều khoản sử dụng</button> và <button type="button">Chính sách bảo mật</button>.
            </p>
          </form>

          <p className="register-login-link">Đã có tài khoản? <Link to="/login">Đăng nhập ngay <ArrowRight aria-hidden="true" /></Link></p>
        </div>
      </section>
    </main>
  )
}
