import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, BookOpen, Bot, ChevronDown, Flame, GraduationCap, LayoutDashboard,
  LogOut, Menu, Search, Settings, Sparkles, Target, Trophy, User, X,
} from 'lucide-react'
import { useAuthStore } from '../store'

const studentLinks = [
  { to: '/', label: 'Học tập', icon: GraduationCap, end: true },
  { to: '/practice-bank', label: 'Luyện tập', icon: Target },
  { to: '/game-demo', label: 'Game', icon: Sparkles },
  { to: '/lessons/1/chat', label: 'AI Tutor', icon: Bot, featured: true },
  { to: '/progress', label: 'Xếp hạng', icon: Trophy },
]

const teacherLinks = [
  { to: '/classroom', label: 'Lớp học', icon: GraduationCap },
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/practice-bank', label: 'Kho đề', icon: Target },
  { to: '/game-demo', label: 'Game', icon: Sparkles },
  { to: '/lessons/1/chat', label: 'AI Tutor', icon: Bot, featured: true },
]

const searchItems = [
  { title: 'Lộ trình Công nghệ 11', meta: 'Khóa học', to: '/' },
  { title: 'Động cơ đốt trong', meta: 'Bài học', to: '/courses/1' },
  { title: 'Xưởng cơ khí', meta: 'Phòng thực hành', to: '/mechanical-workshop' },
  { title: 'Kho đề luyện tập', meta: 'Luyện tập', to: '/practice-bank' },
  { title: 'Trò chơi demo Công nghệ THPT', meta: 'Trò chơi học tập', to: '/game-demo' },
  { title: 'Hỏi trợ lý AI', meta: 'AI Tutor', to: '/lessons/1/chat' },
]

const getInitials = (name = 'EngineLab User') => name.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()

function Brand() {
  return (
    <Link to="/" className="nova-brand" aria-label="EngineLab AI - Trang chủ">
      <span className="nova-brand-symbol"><Sparkles aria-hidden="true" /></span>
      <span className="nova-brand-copy"><strong>EngineLab</strong><em>AI</em><small>Công nghệ THPT</small></span>
    </Link>
  )
}

export default function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const shellRef = useRef(null)
  const isTeacher = user?.role === 'teacher'
  const links = isTeacher ? teacherLinks : studentLinks
  const displayName = user?.full_name || user?.username || (isTeacher ? 'Giáo viên Công nghệ THPT' : 'Học sinh EngineLab')
  const profileMeta = isTeacher ? 'Giáo viên Công nghệ THPT' : user?.student_class ? `Lớp ${user.student_class}` : 'Học sinh THPT'
  const filteredSearch = useMemo(() => {
    const normalized = query.toLocaleLowerCase('vi').trim()
    return normalized ? searchItems.filter((item) => `${item.title} ${item.meta}`.toLocaleLowerCase('vi').includes(normalized)) : searchItems.slice(0, 4)
  }, [query])

  useEffect(() => {
    const close = (event) => {
      if (!shellRef.current?.contains(event.target)) {
        setSearchOpen(false); setNotificationsOpen(false); setProfileOpen(false); setMobileOpen(false)
      }
    }
    const keyboard = (event) => {
      if (event.key === 'Escape') { setSearchOpen(false); setNotificationsOpen(false); setProfileOpen(false); setMobileOpen(false) }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); document.getElementById('global-search')?.focus() }
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', keyboard) }
  }, [])

  useEffect(() => { setMobileOpen(false); setSearchOpen(false) }, [location.pathname])

  if (location.pathname === '/login' || location.pathname === '/register') return null

  if (!isAuthenticated) {
    return <header className="nova-public-nav"><Brand /><div><Link to="/login">Đăng nhập</Link><Link to="/register" className="nova-public-cta">Tạo tài khoản</Link></div></header>
  }

  const handleLogout = () => { logout(); setProfileOpen(false); navigate('/login') }

  return (
    <header className="nova-nav" ref={shellRef}>
      <div className="nova-nav-inner">
        <Brand />
        <div className="nova-search-wrap">
          <Search aria-hidden="true" />
          <input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(true)} placeholder="Tìm bài học, khóa học..." aria-label="Tìm kiếm toàn nền tảng" autoComplete="off" />
          <kbd>⌘ K</kbd>
          {searchOpen && <div className="nova-search-results" role="listbox"><span>Gợi ý tìm kiếm</span>{filteredSearch.length ? filteredSearch.map((item) => <button key={item.to + item.title} type="button" onClick={() => navigate(item.to)}><i><BookOpen /></i><b>{item.title}<small>{item.meta}</small></b><span>↗</span></button>) : <p>Không tìm thấy nội dung phù hợp.</p>}</div>}
        </div>

        <nav className="nova-main-links" aria-label="Điều hướng chính">
          {links.map(({ to, label, icon: LinkIcon, featured, end }) => <NavLink key={to + label} to={to} end={end} className={({ isActive }) => `nova-nav-link ${isActive ? 'active' : ''} ${featured ? 'featured' : ''}`}><LinkIcon aria-hidden="true" /><span>{label}</span>{featured && <i>AI</i>}</NavLink>)}
        </nav>

        <div className="nova-nav-actions">
          <div className="nova-streak" title="Chuỗi học tập"><Flame aria-hidden="true" /><strong>7</strong></div>
          <div className="nova-popover-anchor">
            <button type="button" className="nova-icon-button" onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false) }} aria-label="Thông báo" aria-expanded={notificationsOpen}><Bell /><i /></button>
            {notificationsOpen && <div className="nova-popover nova-notifications"><header><strong>Thông báo</strong><button type="button">Đánh dấu đã đọc</button></header><article><span className="is-blue"><Target /></span><div><b>Mục tiêu tuần</b><p>Bạn đã hoàn thành 72% mục tiêu học tập.</p><small>5 phút trước</small></div></article><article><span className="is-orange"><Trophy /></span><div><b>+120 XP mới</b><p>Hoàn thành bài kiểm tra Động cơ đốt trong.</p><small>Hôm qua</small></div></article></div>}
          </div>
          <div className="nova-popover-anchor">
            <button type="button" className="nova-profile-trigger" onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false) }} aria-expanded={profileOpen}><span>{getInitials(displayName)}</span><b>{displayName}<small>{profileMeta}</small></b><ChevronDown /></button>
            {profileOpen && <div className="nova-popover nova-profile-menu"><div className="nova-profile-summary"><span>{getInitials(displayName)}</span><div><strong>{displayName}</strong><small>{user?.email || profileMeta}</small></div></div><Link to="/progress"><User />Hồ sơ học tập</Link><Link to="/"><Settings />Cài đặt tài khoản</Link><button type="button" onClick={handleLogout}><LogOut />Đăng xuất</button></div>}
          </div>
          <button type="button" className="nova-mobile-toggle" onClick={() => setMobileOpen((value) => !value)} aria-label="Mở menu" aria-expanded={mobileOpen}>{mobileOpen ? <X /> : <Menu />}</button>
        </div>
      </div>

      {mobileOpen && <nav className="nova-mobile-menu" aria-label="Menu di động">{links.map(({ to, label, icon: LinkIcon, end }) => <NavLink key={to + label} to={to} end={end}><LinkIcon /><span>{label}</span></NavLink>)}<Link to="/progress"><User /><span>Hồ sơ</span></Link><button type="button" onClick={handleLogout}><LogOut /><span>Đăng xuất</span></button></nav>}

      <nav className="nova-bottom-nav" aria-label="Điều hướng di động">{links.slice(0, 4).map(({ to, label, icon: LinkIcon, end }) => <NavLink key={to + label} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}><LinkIcon /><span>{label}</span></NavLink>)}</nav>
    </header>
  )
}
