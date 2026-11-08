import { useEffect, useState } from 'react'
import { authAPI } from '../services/api'
import { useAuthStore } from '../store'

const MESSAGES = {
  teacher: 'Tài khoản giáo viên đang chờ quản trị viên xác minh. Bạn chưa dùng được quyền giáo viên và chưa xem được dữ liệu lớp.',
  student: 'Giáo viên chưa xác nhận bạn thuộc lớp này. Bạn vẫn học bình thường, nhưng kết quả chưa hiện với giáo viên của lớp.',
}

export default function AccountStatusNotice() {
  const { user, isAuthenticated } = useAuthStore()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token') || ''
    if (!isAuthenticated || !token || token.startsWith('local-token-')) {
      setIsPending(false)
      return undefined
    }
    // Asks the server, because a decision may have been made since this session signed in.
    let active = true
    authAPI
      .getMe()
      .then(({ data }) => {
        if (!active) return
        setIsPending(data.account_status === 'pending')
        // A decision made since sign-in changes which teacher tools the interface shows
        const current = useAuthStore.getState().user
        if (current && current.account_status !== data.account_status) {
          useAuthStore.setState({ user: { ...current, account_status: data.account_status } })
        }
      })
      .catch(() => active && setIsPending(false))
    return () => {
      active = false
    }
  }, [isAuthenticated, user?.id])

  if (!isPending || !MESSAGES[user?.role]) return null
  return (
    <p role="status" className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-900">
      {MESSAGES[user.role]}
    </p>
  )
}
