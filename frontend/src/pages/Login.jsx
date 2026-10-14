import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, GraduationCap } from 'lucide-react'
import { useAuthStore } from '../store'

function Brand() { return <Link to="/" className="app-brand"><span className="app-brand-mark"><GraduationCap size={22} /></span><strong>EngineLab<span> AI</span></strong></Link> }

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading } = useAuthStore()
  const remembered = localStorage.getItem('enginelab-remembered-user') || ''
  const [username, setUsername] = useState(location.state?.username || remembered)
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(location.state?.role || 'student')
  const [remember, setRemember] = useState(Boolean(remembered))
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    setError('')
    const result = await login(username, password, role)
    if (!result.success) { setError(result.error || 'Không thể đăng nhập. Vui lòng kiểm tra thông tin.'); return }
    if (remember) localStorage.setItem('enginelab-remembered-user', username)
    else localStorage.removeItem('enginelab-remembered-user')
    navigate('/')
  }
  return <main className="studio-auth"><section className="studio-auth-story"><Brand /><div><span className="studio-tag">CÔNG NGHỆ THPT · LỚP 10 — 12</span><h1 className="mt-6">Hiểu sâu hơn.<br />Tiến xa hơn.</h1><p>Không gian học tập và giảng dạy với trợ lý AI, bài học tương tác và thực hành kỹ thuật.</p></div><small>EngineLab AI · Đồng hành cùng học sinh và giáo viên</small></section><section className="studio-auth-form"><div className="studio-auth-card"><div className="studio-auth-mobile-brand"><Brand /></div><h2>Chào mừng trở lại</h2><p>Đăng nhập để tiếp tục hành trình của bạn.</p><div className="studio-tabs" role="group" aria-label="Loại tài khoản">{['student', 'teacher'].map((value) => <button type="button" key={value} aria-pressed={role === value} onClick={() => setRole(value)}>{value === 'student' ? 'Học sinh' : 'Giáo viên'}</button>)}</div><form onSubmit={submit}><div className="studio-auth-field"><label htmlFor="username">Tên đăng nhập hoặc email</label><input id="username" autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Nhập tài khoản của bạn" /></div><div className="studio-auth-field"><label htmlFor="password">Mật khẩu</label><input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nhập mật khẩu" /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><label className="studio-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />Ghi nhớ tên đăng nhập</label>{error && <div role="alert" className="studio-auth-error">{error}</div>}<button type="submit" className="studio-button" disabled={isLoading}>{isLoading ? 'Đang đăng nhập…' : 'Đăng nhập'}<ArrowRight size={17} /></button></form><p className="studio-auth-signup">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p></div></section></main>
}
