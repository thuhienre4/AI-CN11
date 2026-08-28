import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store'

const Icon = ({ name }) => {
  const paths = {
    email: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    eyeOff: <><path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.8 5.2A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a15 15 0 0 1-2 2.8M6.4 6.4C3.9 8.1 2.5 12 2.5 12s3.5 7 9.5 7a9.8 9.8 0 0 0 4.1-.9" /></>,
    moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const BrandMark = () => <span className="engine-brand-mark" aria-hidden="true"><svg viewBox="0 0 42 42" className="h-7 w-7" fill="none"><path d="M12 12h18v18H12zM8 17h4M8 25h4M30 17h4M30 25h4M17 8v4M25 8v4M17 30v4M25 30v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><path d="m17 25 4-9 4 9M18.5 22.2h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></span>

const GoogleIcon = () => <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.6 4.6 0 0 1-2 3v2.8h3.3c1.9-1.8 2.9-4.4 2.9-7.9Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.8c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.9A10.1 10.1 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.5 13.7A6.2 6.2 0 0 1 6.2 12c0-.6.1-1.2.3-1.7V7.4H3.1a10 10 0 0 0 0 9.2l3.4-2.9Z" /><path fill="#EA4335" d="M12 6.2c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3.1 7.4l3.4 2.9A5.9 5.9 0 0 1 12 6.2Z" /></svg>
const MicrosoftIcon = () => <span className="grid h-5 w-5 grid-cols-2 gap-[2px]" aria-hidden="true"><i className="bg-[#f25022]" /><i className="bg-[#7fba00]" /><i className="bg-[#00a4ef]" /><i className="bg-[#ffb900]" /></span>
const GithubIcon = () => <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.3-2.3-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1A9.7 9.7 0 0 1 12 6.8c.9 0 1.7.1 2.5.3 1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" /></svg>

const LearningIllustration = () => (
  <svg viewBox="0 0 650 460" className="engine-illustration" role="img" aria-label="AI robot exploring an intelligent mechanical engine">
    <defs><linearGradient id="robot" x2="1" y2="1"><stop stopColor="#fff" /><stop offset="1" stopColor="#dbeafe" /></linearGradient><linearGradient id="screen" x2="1" y2="1"><stop stopColor="#0f172a" /><stop offset="1" stopColor="#1e3a8a" /></linearGradient><linearGradient id="machine" x2="1" y2="1"><stop stopColor="#60a5fa" /><stop offset="1" stopColor="#14b8a6" /></linearGradient><filter id="shadow"><feDropShadow dy="15" stdDeviation="15" floodColor="#1e40af" floodOpacity=".18" /></filter></defs>
    <ellipse cx="325" cy="420" rx="230" ry="20" fill="#2563eb" opacity=".08" /><path d="M80 335h500M75 115h62l25 26h58M478 92h60l26 28" stroke="#93c5fd" strokeWidth="2" strokeDasharray="5 10" opacity=".5" />
    <g filter="url(#shadow)"><rect x="211" y="118" width="228" height="203" rx="48" fill="url(#robot)" stroke="#bfdbfe" strokeWidth="3" /><rect x="242" y="151" width="166" height="105" rx="28" fill="url(#screen)" /><circle cx="292" cy="202" r="12" fill="#60a5fa" /><circle cx="358" cy="202" r="12" fill="#2dd4bf" /><path d="M294 229c18 12 44 12 62 0" stroke="#93c5fd" strokeWidth="5" strokeLinecap="round" /><path d="M325 118V87" stroke="#60a5fa" strokeWidth="6" /><circle cx="325" cy="76" r="11" fill="#2dd4bf" stroke="#fff" strokeWidth="5" /><rect x="269" y="281" width="112" height="88" rx="25" fill="#fff" stroke="#bfdbfe" strokeWidth="3" /><circle cx="325" cy="325" r="25" fill="url(#machine)" /><path d="M325 307v36M307 325h36" stroke="#fff" strokeWidth="5" /><path d="M270 300 202 273l-28 59M380 300l69-27 28 59M294 369l-19 47M356 369l19 47" stroke="#bfdbfe" strokeWidth="18" strokeLinecap="round" /><circle cx="169" cy="342" r="20" fill="#fff" stroke="#93c5fd" strokeWidth="4" /><circle cx="482" cy="342" r="20" fill="#fff" stroke="#93c5fd" strokeWidth="4" /><path d="M247 417h50M353 417h50" stroke="#2563eb" strokeWidth="16" strokeLinecap="round" /></g>
    <g transform="translate(107 245)" filter="url(#shadow)"><circle r="53" fill="#eff6ff" stroke="#93c5fd" strokeWidth="3" /><path d="M0-34V34M-34 0h68M-24-24l48 48M24-24l-48 48" stroke="#60a5fa" strokeWidth="10" /><circle r="17" fill="#2563eb" /><circle r="7" fill="#fff" /></g><g transform="translate(544 251)" filter="url(#shadow)"><rect x="-47" y="-44" width="94" height="88" rx="18" fill="#fff" stroke="#99f6e4" strokeWidth="3" /><path d="M-27 18V-1h15v19M-6 18v-35H9v35M15 18V-8h15v26" fill="url(#machine)" /></g>
  </svg>
)

const features = [
  { icon: '🤖', title: 'AI Tutor', text: 'Ask anything about Grade 11 Technology.' },
  { icon: '📚', title: 'Smart Learning', text: 'Interactive lessons and personalized study plans.' },
  { icon: '🏆', title: 'Track Progress', text: 'XP, achievements and your learning streak.' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error } = useAuthStore()
  const rememberedUser = localStorage.getItem('enginelab-remembered-user') || ''
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUser))
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('enginelab-theme') === 'dark' || (!localStorage.getItem('enginelab-theme') && window.matchMedia?.('(prefers-color-scheme: dark)').matches))
  const [formData, setFormData] = useState({ username: location.state?.username || rememberedUser, password: '', role: location.state?.role || 'student' })

  const handleChange = ({ target: { name, value } }) => setFormData((current) => ({ ...current, [name]: value }))
  const toggleTheme = () => setDarkMode((current) => { localStorage.setItem('enginelab-theme', current ? 'light' : 'dark'); return !current })
  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = await login(formData.username, formData.password, formData.role)
    if (result.success) {
      if (rememberMe) localStorage.setItem('enginelab-remembered-user', formData.username)
      else localStorage.removeItem('enginelab-remembered-user')
      toast.success('Welcome back to EngineLab AI!')
      navigate(formData.role === 'teacher' ? '/classroom' : '/')
    } else toast.error(result.error || error || 'Unable to sign in. Please check your details.')
  }
  const comingSoon = (provider) => toast(`${provider} sign-in is coming soon.`)

  return (
    <main className={`engine-login-shell ${darkMode ? 'is-dark' : ''}`}>
      <div className="engine-login-noise" aria-hidden="true" /><div className="engine-orb engine-orb-one" aria-hidden="true" /><div className="engine-orb engine-orb-two" aria-hidden="true" />
      <button type="button" onClick={toggleTheme} className="engine-theme-toggle" aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}><Icon name={darkMode ? 'sun' : 'moon'} /></button>
      <section className="engine-story-panel"><div className="engine-story-content">
        <Link to="/" className="engine-logo" aria-label="EngineLab AI home"><BrandMark /><span><strong>EngineLab</strong><em>AI</em><small>Technology, reimagined.</small></span></Link>
        <div className="engine-welcome-copy"><span className="engine-eyebrow"><i /> AI-powered learning platform</span><h1>Welcome Back<span>.</span></h1><p>Continue your AI-powered Technology learning journey.</p></div>
        <div className="engine-visual-stage"><LearningIllustration /><div className="engine-feature-stack">{features.map((feature, index) => <article key={feature.title} className={`engine-feature-card feature-${index + 1}`}><span>{feature.icon}</span><div><h2>{feature.title}</h2><p>{feature.text}</p></div></article>)}</div></div>
        <blockquote>“Learning Technology Starts With Curiosity.”</blockquote>
      </div></section>
      <section className="engine-form-panel">
        <div className="engine-mobile-brand"><BrandMark /><strong>EngineLab <em>AI</em></strong></div>
        <div className="engine-login-card">
          <div className="engine-card-heading"><span className="engine-mobile-eyebrow">WELCOME BACK</span><h2>Sign In</h2><p>Continue your learning journey.</p></div>
          <div className="engine-role-switch" role="group" aria-label="Account type">{['student', 'teacher'].map((role) => <button key={role} type="button" onClick={() => setFormData((current) => ({ ...current, role }))} className={formData.role === role ? 'active' : ''} aria-pressed={formData.role === role}>{role === 'student' ? 'Student' : 'Teacher'}</button>)}</div>
          <form onSubmit={handleSubmit} className="engine-login-form">
            <label htmlFor="username">Email</label><div className="engine-input-wrap"><Icon name="email" /><input id="username" name="username" type="text" autoComplete="username" value={formData.username} onChange={handleChange} placeholder="Enter your email" required /></div>
            <label htmlFor="password">Password</label><div className="engine-input-wrap"><Icon name="lock" /><input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required /><button type="button" className="engine-password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}><Icon name={showPassword ? 'eyeOff' : 'eye'} /></button></div>
            <div className="engine-form-options"><label className="engine-check"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span />Remember me</label><button type="button" onClick={() => toast('Password recovery will be available soon.')}>Forgot Password?</button></div>
            <button type="submit" className="engine-submit" disabled={isLoading}><span>{isLoading ? 'Signing in...' : 'Sign In'}</span>{!isLoading && <Icon name="arrow" />}</button>
          </form>
          <div className="engine-divider"><span>OR</span></div>
          <div className="engine-social-row"><button type="button" onClick={() => comingSoon('Google')} aria-label="Continue with Google"><GoogleIcon /><span>Google</span></button><button type="button" onClick={() => comingSoon('Microsoft')} aria-label="Continue with Microsoft"><MicrosoftIcon /><span>Microsoft</span></button><button type="button" onClick={() => comingSoon('GitHub')} aria-label="Continue with GitHub"><GithubIcon /><span>GitHub</span></button></div>
          <p className="engine-signup-copy">Don&apos;t have an account? <Link to="/register">Create Account</Link></p>
        </div>
        <p className="engine-legal">By continuing, you agree to our <button type="button">Terms</button> and <button type="button">Privacy Policy</button>.</p>
      </section>
    </main>
  )
}
