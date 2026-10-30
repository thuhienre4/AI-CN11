import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useAuthStore } from '../store'

const REMEMBER_KEY = 'enginelab-remembered-user'

const readRemembered = () => {
  try { return localStorage.getItem(REMEMBER_KEY) || '' } catch { return '' }
}

function Brand() { return <Link to="/" className="app-brand"><span className="app-brand-mark"><GraduationCap size={22} /></span><strong>EngineLab<span> AI</span></strong></Link> }

const FieldError = ({ id, children }) => (children ? <p id={id} className="studio-field-error">{children}</p> : null)

export default function Login() {
  const location = useLocation()
  const { login, isLoading, sessionExpired, clearError } = useAuthStore()
  const remembered = readRemembered()
  const [username, setUsername] = useState(location.state?.username || remembered)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(Boolean(remembered))
  const [show, setShow] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const usernameRef = useRef(null)
  const passwordRef = useRef(null)

  // Returning users already have their username filled in, so start on the password.
  useEffect(() => { (username ? passwordRef : usernameRef).current?.focus() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const nextErrors = {
      username: username.trim() ? '' : 'Vui lòng nhập tên đăng nhập hoặc email.',
      password: password ? '' : 'Vui lòng nhập mật khẩu.',
    }
    setFieldErrors(nextErrors)
    if (nextErrors.username || nextErrors.password) {
      (nextErrors.username ? usernameRef : passwordRef).current?.focus()
      return
    }

    const result = await login(username, password)
    if (!result.success) {
      setError(result.error || 'Không thể đăng nhập. Vui lòng kiểm tra thông tin.')
      setPassword('')
      passwordRef.current?.focus()
      return
    }
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, username.trim())
      else localStorage.removeItem(REMEMBER_KEY)
    } catch { /* storage unavailable */ }
    // PublicOnlyRoute sends the user back to the page they originally requested.
    toast.success(`Chào mừng trở lại, ${result.user.full_name || result.user.username}!`)
    clearError()
  }

  const detectCapsLock = (event) => setCapsLock(Boolean(event.getModifierState?.('CapsLock')))
  const clearFieldError = (name) => { if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: '' })) }

  return <main className="studio-auth"><section className="studio-auth-story"><Brand /><div><span className="studio-tag">CÔNG NGHỆ THPT · LỚP 10 — 12</span><h1 className="mt-6">Hiểu sâu hơn.<br />Tiến xa hơn.</h1><p>Không gian học tập và giảng dạy với trợ lý AI, bài học tương tác và thực hành kỹ thuật.</p></div><small>EngineLab AI · Đồng hành cùng học sinh và giáo viên</small></section><section className="studio-auth-form"><div className="studio-auth-card">
    <div className="studio-auth-mobile-brand"><Brand /></div>
    <h2>Chào mừng trở lại</h2>
    <p>Đăng nhập bằng tài khoản học sinh hoặc giáo viên của bạn.</p>
    <div aria-live="polite">
      {sessionExpired && !error && <div role="status" className="studio-auth-notice">Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.</div>}
      {location.state?.registered && !error && <div role="status" className="studio-auth-notice">Tài khoản đã được tạo. Hãy đăng nhập để bắt đầu.</div>}
    </div>
    <form onSubmit={submit} noValidate>
      <div className="studio-auth-field">
        <label htmlFor="username">Tên đăng nhập hoặc email</label>
        <input ref={usernameRef} id="username" autoComplete="username" autoCapitalize="none" spellCheck={false} value={username} onChange={(event) => { setUsername(event.target.value); clearFieldError('username') }} placeholder="Nhập tài khoản của bạn" aria-invalid={Boolean(fieldErrors.username)} aria-describedby={fieldErrors.username ? 'username-error' : undefined} />
        <FieldError id="username-error">{fieldErrors.username}</FieldError>
      </div>
      <div className="studio-auth-field">
        <label htmlFor="password">Mật khẩu</label>
        <div className="studio-auth-password">
          <input ref={passwordRef} id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => { setPassword(event.target.value); clearFieldError('password') }} onKeyDown={detectCapsLock} onKeyUp={detectCapsLock} placeholder="Nhập mật khẩu" aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : capsLock ? 'password-caps' : undefined} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={show}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </div>
        <FieldError id="password-error">{fieldErrors.password}</FieldError>
        {!fieldErrors.password && capsLock && <p id="password-caps" className="studio-field-hint">Caps Lock đang bật.</p>}
      </div>
      <div className="studio-auth-options">
        <label className="studio-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Ghi nhớ tên đăng nhập</label>
        <button type="button" onClick={() => setShowRecovery(!showRecovery)} aria-expanded={showRecovery} aria-controls="recovery-help">Quên mật khẩu?</button>
      </div>
      {showRecovery && <div id="recovery-help" className="studio-auth-notice">Hãy liên hệ giáo viên Công nghệ hoặc quản trị viên của trường để được đặt lại mật khẩu, kèm tên đăng nhập hoặc email đã đăng ký.</div>}
      {error && <div role="alert" className="studio-auth-error">{error}</div>}
      <button type="submit" className="studio-button" disabled={isLoading} aria-busy={isLoading}>{isLoading ? 'Đang đăng nhập…' : 'Đăng nhập'}<ArrowRight size={17} /></button>
    </form>
    <p className="studio-auth-signup">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
  </div></section></main>
}
