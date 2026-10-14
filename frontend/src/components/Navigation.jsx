import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BookOpen, Bot, ChartNoAxesCombined, GraduationCap, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../store'

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    const close = (event) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])
  if (['/login', '/register'].includes(location.pathname)) return null
  const teacher = ['teacher', 'admin', 'moderator'].includes(user?.role)
  const links = [['/', 'Tổng quan', BookOpen], ['/ai-workspace', 'Không gian AI', Bot], ['/classroom', 'Lớp học', GraduationCap], ['/practice-bank', teacher ? 'Kho đề' : 'Luyện tập', BookOpen], ['/progress', 'Tiến độ', ChartNoAxesCombined]]
  return <header className="app-header"><div className="app-header-inner">
    <Link to="/" className="app-brand" aria-label="EngineLab AI — Trang chủ"><span className="app-brand-mark"><GraduationCap size={22} /></span><strong>EngineLab<span> AI</span></strong></Link>
    {isAuthenticated ? <><nav className="app-desktop-nav" aria-label="Điều hướng chính">{links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}</nav><div className="app-account"><span><strong>{user?.full_name || user?.username}</strong><small>{teacher ? 'Giáo viên' : 'Học sinh'}</small></span><button type="button" onClick={logout} aria-label="Đăng xuất" title="Đăng xuất"><LogOut size={18} /></button></div><button type="button" className="app-menu-toggle" aria-label={open ? 'Đóng menu' : 'Mở menu'} aria-expanded={open} aria-controls="app-mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></> : <Link to="/login" className="studio-button">Đăng nhập</Link>}
    </div>{isAuthenticated && open && <nav id="app-mobile-menu" className="app-mobile-menu" aria-label="Điều hướng di động">{links.map(([to, label, Icon]) => <NavLink key={to} to={to} end={to === '/'}><Icon size={18} />{label}</NavLink>)}<button type="button" onClick={logout}><LogOut size={18} />Đăng xuất</button></nav>}
  </header>
}
