import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { authAPI, isBackendUnavailable } from '../services/api'
import { useAuthStore } from '../store'
import { clearDeviceData } from '../utils/deviceData'
import { PASSWORD_HINT, passwordProblem } from '../utils/passwordRules'

const detail = (error, fallback) => (typeof error?.response?.data?.detail === 'string' ? error.response.data.detail : fallback)

function Section({ title, children, tone = 'default' }) {
  return (
    <section className={`rounded-lg border p-5 ${tone === 'danger' ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'}`}>
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

const inputClass = 'w-full rounded-md border border-slate-300 bg-white px-3 py-2'

export default function AccountSettings() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const token = localStorage.getItem('token') || ''
  const offline = token.startsWith('local-token-')
  const [passwords, setPasswords] = useState({ current: '', next: '', repeat: '' })
  const [deletePassword, setDeletePassword] = useState('')
  const [busy, setBusy] = useState('')

  const useNewToken = (accessToken) => {
    localStorage.setItem('token', accessToken)
    useAuthStore.setState({ token: accessToken })
  }

  const run = async (name, action) => {
    setBusy(name)
    try {
      await action()
    } catch (error) {
      toast.error(isBackendUnavailable(error) ? 'Chưa kết nối được máy chủ.' : detail(error, 'Không thực hiện được. Hãy thử lại.'))
    } finally {
      setBusy('')
    }
  }

  const changePassword = (event) => {
    event.preventDefault()
    const problem = passwordProblem(passwords.next, user?.username)
    if (problem) return toast.error(problem)
    if (passwords.next !== passwords.repeat) return toast.error('Hai lần nhập mật khẩu mới chưa giống nhau.')
    return run('password', async () => {
      const { data } = await authAPI.changePassword({ current_password: passwords.current, new_password: passwords.next })
      useNewToken(data.access_token)
      setPasswords({ current: '', next: '', repeat: '' })
      toast.success('Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.')
    })
  }

  const logoutEverywhere = () => run('everywhere', async () => {
    const { data } = await authAPI.logoutEverywhere()
    useNewToken(data.access_token)
    toast.success('Đã đăng xuất trên mọi thiết bị khác.')
  })

  const exportData = () => run('export', async () => {
    const { data } = await authAPI.exportMyData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `enginelab-du-lieu-${user.username}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
  })

  const deleteAccount = (event) => {
    event.preventDefault()
    if (!window.confirm('Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu học tập? Không thể khôi phục.')) return
    run('delete', async () => {
      await authAPI.deleteMyAccount(deletePassword)
      clearDeviceData(user)
      logout()
      toast.success('Đã xóa tài khoản và dữ liệu.')
      navigate('/login', { replace: true })
    })
  }

  const clearThisDevice = () => {
    if (!window.confirm('Xóa dữ liệu của bạn trên máy này và đăng xuất? Dữ liệu trên máy chủ không bị ảnh hưởng.')) return
    clearDeviceData(user)
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="page-container max-w-3xl">
      <header className="mb-6">
        <p className="muted-label">Tài khoản</p>
        <h1 className="text-3xl font-black text-slate-950">Bảo mật và dữ liệu của bạn</h1>
        <p className="mt-1 text-slate-600">{user.full_name || user.username} · {user.email}</p>
      </header>

      <div className="space-y-4">
        <Section title="Dữ liệu hệ thống lưu về bạn">
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Thông tin tài khoản: tên đăng nhập, họ tên, email, lớp, vai trò.</li>
            <li>Tiến độ học, lượt làm kiểm tra nhanh và câu trả lời, các lần mở bài, mô phỏng.</li>
            <li>Câu hỏi gửi trợ lý học tập; khi trợ lý AI được bật, nội dung bài, câu hỏi, vai trò và lớp được gửi tới dịch vụ AI, không kèm họ tên, tên đăng nhập hay email.</li>
            <li>Bài nộp nhiệm vụ của lớp.</li>
          </ul>
          <p className="text-sm leading-6 text-slate-600">
            Chỉ bạn, giáo viên được phân công lớp của bạn và quản trị viên xem được dữ liệu học tập của bạn. Mật khẩu chỉ lưu ở dạng mã hóa một chiều.
          </p>
          {!offline && (
            <button type="button" className="secondary-button" disabled={busy === 'export'} onClick={exportData}>
              {busy === 'export' ? 'Đang chuẩn bị…' : 'Tải dữ liệu của tôi (JSON)'}
            </button>
          )}
        </Section>

        {offline ? (
          <Section title="Đang dùng tài khoản ngoại tuyến">
            <p className="text-sm leading-6 text-slate-700">
              Ứng dụng đang chạy không có máy chủ, nên tài khoản và dữ liệu chỉ nằm trên trình duyệt này. Đổi mật khẩu, tải và xóa dữ liệu trên máy chủ cần kết nối máy chủ.
            </p>
          </Section>
        ) : (
          <>
            <Section title="Đổi mật khẩu">
              <form onSubmit={changePassword} className="space-y-3">
                <input type="password" autoComplete="current-password" placeholder="Mật khẩu hiện tại" aria-label="Mật khẩu hiện tại"
                  value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} className={inputClass} required />
                <input type="password" autoComplete="new-password" placeholder="Mật khẩu mới" aria-label="Mật khẩu mới"
                  value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} className={inputClass} required />
                <input type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" aria-label="Nhập lại mật khẩu mới"
                  value={passwords.repeat} onChange={(event) => setPasswords({ ...passwords, repeat: event.target.value })} className={inputClass} required />
                <p className="text-xs text-slate-500">{PASSWORD_HINT} Sau khi đổi, các thiết bị khác sẽ bị đăng xuất.</p>
                <button type="submit" className="primary-button" disabled={busy === 'password'}>{busy === 'password' ? 'Đang đổi…' : 'Đổi mật khẩu'}</button>
              </form>
            </Section>

            <Section title="Phiên đăng nhập">
              <p className="text-sm leading-6 text-slate-700">Quên đăng xuất ở máy của trường hoặc mất điện thoại? Đăng xuất trên mọi thiết bị khác, máy này vẫn giữ đăng nhập.</p>
              <button type="button" className="secondary-button" disabled={busy === 'everywhere'} onClick={logoutEverywhere}>Đăng xuất trên mọi thiết bị khác</button>
            </Section>
          </>
        )}

        <Section title="Máy dùng chung">
          <p className="text-sm leading-6 text-slate-700">Xóa tiến độ chưa đồng bộ, hồ sơ, trò chơi đã thiết kế và tài khoản ngoại tuyến của bạn khỏi trình duyệt này rồi đăng xuất.</p>
          <button type="button" className="secondary-button" onClick={clearThisDevice}>Xóa dữ liệu của tôi trên máy này</button>
        </Section>

        {!offline && user.role === 'student' && (
          <Section title="Xóa tài khoản" tone="danger">
            <p className="text-sm leading-6 text-slate-700">
              Xóa vĩnh viễn tài khoản cùng tiến độ, kết quả kiểm tra, câu hỏi trợ lý và bài nộp. Nên tải dữ liệu về trước nếu cần giữ lại.
            </p>
            <form onSubmit={deleteAccount} className="flex flex-wrap gap-2">
              <input type="password" autoComplete="current-password" placeholder="Nhập mật khẩu để xác nhận" aria-label="Mật khẩu để xác nhận xóa"
                value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} className={`${inputClass} flex-1 basis-56`} required />
              <button type="submit" className="rounded-md bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:opacity-60" disabled={busy === 'delete'}>
                Xóa tài khoản
              </button>
            </form>
          </Section>
        )}
        {!offline && user.role !== 'student' && (
          <p className="text-sm text-slate-500">Tài khoản giáo viên và quản trị viên gắn với dữ liệu của lớp, nên cần quản trị viên đóng.</p>
        )}
      </div>
    </div>
  )
}
