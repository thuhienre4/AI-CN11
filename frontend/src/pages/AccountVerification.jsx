import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { accountsAPI } from '../services/api'
import { useAuthStore } from '../store'

const ROLE_LABELS = { student: 'Học sinh', teacher: 'Giáo viên' }
const DECISION_LABELS = {
  approve: 'Đã duyệt',
  reject: 'Từ chối',
  assign_classes: 'Gán lớp',
  class_code: 'Vào lớp bằng mã',
  reset: 'Đặt lại',
}

const errorMessage = (error, fallback) => {
  const detail = error?.response?.data?.detail
  return typeof detail === 'string' ? detail : fallback
}

const formatDate = (value) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

function ClassCodes({ classes, codes, isAdmin, onChanged }) {
  const [className, setClassName] = useState('')
  const [validDays, setValidDays] = useState(7)
  const [maxUses, setMaxUses] = useState(50)
  const selectedClass = className || classes[0] || ''
  const field = 'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm'

  const create = async (event) => {
    event.preventDefault()
    try {
      await accountsAPI.createClassCode({ class_name: selectedClass, valid_days: validDays, max_uses: maxUses })
      toast.success(`Đã tạo mã mới cho lớp ${selectedClass}. Mã cũ của lớp không còn dùng được.`)
      onChanged()
    } catch (error) {
      toast.error(errorMessage(error, 'Chưa tạo được mã lớp.'))
    }
  }

  const revoke = async (code) => {
    try {
      await accountsAPI.revokeClassCode(code.id)
      toast.success(`Đã thu hồi mã lớp ${code.class_name}`)
      onChanged()
    } catch (error) {
      toast.error(errorMessage(error, 'Chưa thu hồi được mã.'))
    }
  }

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code.code)
      toast.success('Đã sao chép mã')
    } catch {
      toast.error('Trình duyệt không cho sao chép; hãy chép mã thủ công.')
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold text-slate-950">Mã lớp</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Phát mã trực tiếp trên lớp. Học sinh nhập đúng mã khi đăng kí sẽ vào lớp ngay, không cần duyệt từng em.
      </p>
      <form onSubmit={create} className="mt-3 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <div>
          <label htmlFor="code-class" className="text-sm font-semibold text-slate-700">Lớp</label>
          {isAdmin ? (
            <input id="code-class" value={className} onChange={(event) => setClassName(event.target.value)} maxLength={50} required placeholder="VD: 11A1" className={field} />
          ) : (
            <select id="code-class" value={selectedClass} onChange={(event) => setClassName(event.target.value)} className={field}>
              {classes.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          )}
        </div>
        <div>
          <label htmlFor="code-days" className="text-sm font-semibold text-slate-700">Hiệu lực (ngày)</label>
          <input id="code-days" type="number" min="1" max="30" value={validDays} onChange={(event) => setValidDays(Number(event.target.value))} className={field} />
        </div>
        <div>
          <label htmlFor="code-uses" className="text-sm font-semibold text-slate-700">Số lượt tối đa</label>
          <input id="code-uses" type="number" min="1" max="100" value={maxUses} onChange={(event) => setMaxUses(Number(event.target.value))} className={field} />
        </div>
        <div className="flex items-end">
          <button type="submit" disabled={!selectedClass} className="primary-button w-full">Tạo mã</button>
        </div>
      </form>
      {codes.length > 0 && (
        <ul className="mt-3 space-y-2">
          {codes.map((code) => (
            <li key={code.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
              <span className="font-mono text-xl font-bold tracking-widest text-slate-950">{code.code}</span>
              <span className="flex-1 text-sm text-slate-600">
                Lớp {code.class_name} · đã dùng {code.used_count}/{code.max_uses} · hết hạn {formatDate(code.expires_at)}
              </span>
              <button type="button" onClick={() => copy(code)} className="secondary-button">Sao chép</button>
              <button type="button" onClick={() => revoke(code)} className="secondary-button">Thu hồi</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ClassMembers({ members, onChanged }) {
  const [notes, setNotes] = useState({})
  const reset = async (member) => {
    const note = (notes[member.id] || '').trim()
    if (!note) {
      toast.error('Vui lòng ghi lí do trước khi đặt lại.')
      return
    }
    try {
      await accountsAPI.reset(member.id, { note })
      toast.success(`${member.username} đã trở về trạng thái chờ xác minh`)
      onChanged()
    } catch (error) {
      toast.error(errorMessage(error, 'Chưa đặt lại được tài khoản.'))
    }
  }
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-950">Học sinh của lớp ({members.length})</h2>
      {members.length === 0 ? (
        <p className="mt-3 text-sm text-slate-600">Chưa có học sinh nào.</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-2 p-3 text-sm">
              <span className="min-w-48 flex-1">
                <strong>{member.full_name || member.username}</strong> · {member.student_class}
                {member.account_status === 'rejected' && <span className="ml-2 font-semibold text-rose-700">Đã từ chối</span>}
              </span>
              <input
                value={notes[member.id] || ''}
                onChange={(event) => setNotes((current) => ({ ...current, [member.id]: event.target.value }))}
                aria-label={`Lí do đặt lại ${member.username}`}
                placeholder="Lí do"
                maxLength={500}
                className="w-44 rounded-md border border-slate-300 px-3 py-1.5"
              />
              <button type="button" onClick={() => reset(member)} className="secondary-button">
                {member.account_status === 'rejected' ? 'Mở lại' : 'Gỡ khỏi lớp'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PendingAccount({ account, isAdmin, onDecided, isSelected, onToggle }) {
  const [classes, setClasses] = useState(account.student_class || '')
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const fieldId = `account-${account.id}`

  const decide = async (decision) => {
    setIsSaving(true)
    try {
      await accountsAPI.review(account.id, {
        decision,
        note,
        ...(isAdmin ? { classes } : {}),
      })
      toast.success(decision === 'approve' ? `Đã duyệt ${account.username}` : `Đã từ chối ${account.username}`)
      onDecided()
    } catch (error) {
      toast.error(errorMessage(error, 'Chưa lưu được quyết định.'))
      setIsSaving(false)
    }
  }

  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-start gap-3">
          {account.role === 'student' && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(account.id)}
              aria-label={`Chọn ${account.username}`}
              className="mt-1 h-4 w-4"
            />
          )}
          <div>
            <p className="font-bold text-slate-950">{account.full_name || account.username}</p>
            <p className="text-sm text-slate-600">{account.username} · {account.email}</p>
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {ROLE_LABELS[account.role] || account.role}
          {account.student_class ? ` · ${account.student_class}` : ''}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {isAdmin && (
          <div>
            <label htmlFor={`${fieldId}-classes`} className="text-sm font-semibold text-slate-700">
              {account.role === 'teacher' ? 'Lớp phụ trách (cách nhau bằng dấu phẩy)' : 'Lớp'}
            </label>
            <input
              id={`${fieldId}-classes`}
              value={classes}
              onChange={(event) => setClasses(event.target.value)}
              maxLength={50}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="VD: 11A1,11A2"
            />
          </div>
        )}
        <div>
          <label htmlFor={`${fieldId}-note`} className="text-sm font-semibold text-slate-700">
            Ghi chú (bắt buộc khi từ chối)
          </label>
          <input
            id={`${fieldId}-note`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button type="button" disabled={isSaving} onClick={() => decide('approve')} className="primary-button">
          Duyệt
        </button>
        <button type="button" disabled={isSaving} onClick={() => decide('reject')} className="secondary-button">
          Từ chối
        </button>
      </div>
    </li>
  )
}

function TeacherClasses({ teacher, onSaved }) {
  const [classes, setClasses] = useState(teacher.student_class || '')
  const save = async (event) => {
    event.preventDefault()
    try {
      await accountsAPI.assignClasses(teacher.id, { classes })
      toast.success(`Đã cập nhật lớp của ${teacher.username}`)
      onSaved()
    } catch (error) {
      toast.error(errorMessage(error, 'Chưa lưu được lớp phụ trách.'))
    }
  }
  return (
    <li>
      <form onSubmit={save} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-3">
        <label htmlFor={`teacher-${teacher.id}`} className="min-w-40 flex-1 text-sm font-semibold text-slate-800">
          {teacher.full_name || teacher.username}
          {!teacher.student_class && <span className="ml-2 font-normal text-amber-700">Chưa có lớp</span>}
        </label>
        <input
          id={`teacher-${teacher.id}`}
          value={classes}
          onChange={(event) => setClasses(event.target.value)}
          maxLength={50}
          placeholder="VD: 11A1,11A2"
          className="w-44 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button type="submit" className="secondary-button">Lưu</button>
      </form>
    </li>
  )
}

export default function AccountVerification() {
  const { user } = useAuthStore()
  const isAdmin = ['admin', 'moderator'].includes(user?.role)
  const [pending, setPending] = useState([])
  const [teachers, setTeachers] = useState([])
  const [reviews, setReviews] = useState([])
  const [members, setMembers] = useState([])
  const [classCodes, setClassCodes] = useState({ classes: [], codes: [] })
  const [selected, setSelected] = useState(() => new Set())
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [pendingResponse, reviewResponse, teacherResponse, memberResponse, codeResponse] = await Promise.all([
        accountsAPI.pending(),
        accountsAPI.reviews(),
        isAdmin ? accountsAPI.teachers() : Promise.resolve({ data: [] }),
        accountsAPI.classMembers(),
        accountsAPI.classCodes(),
      ])
      setPending(pendingResponse.data)
      setMembers(memberResponse.data)
      setClassCodes(codeResponse.data)
      setSelected(new Set())
      setReviews(reviewResponse.data)
      setTeachers(teacherResponse.data)
      setLoadError('')
    } catch (error) {
      setLoadError(errorMessage(error, 'Chưa tải được danh sách. Tài khoản cần có quyền giáo viên đã xác minh.'))
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    load()
  }, [load])

  const toggleSelected = (id) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const pendingStudents = pending.filter((account) => account.role === 'student')

  const approveSelected = async () => {
    try {
      const { data } = await accountsAPI.reviewBatch({ user_ids: [...selected], decision: 'approve' })
      toast.success(`Đã duyệt ${data.reviewed.length} học sinh`)
      if (data.skipped.length) toast.error(`${data.skipped.length} tài khoản không xử lí được`)
      load()
    } catch (error) {
      toast.error(errorMessage(error, 'Chưa duyệt được.'))
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-950">Xác minh tài khoản</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {isAdmin
          ? 'Duyệt giáo viên, gán lớp phụ trách và xử lí học sinh của mọi lớp.'
          : 'Xác nhận học sinh thuộc các lớp bạn phụ trách. Học sinh chỉ vào danh sách lớp sau khi được xác nhận.'}
      </p>

      {loadError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{loadError}</p>}

      {!loadError && !isLoading && (
        <ClassCodes classes={classCodes.classes} codes={classCodes.codes} isAdmin={isAdmin} onChanged={load} />
      )}

      <section className="mt-6" aria-busy={isLoading}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-950">Đang chờ xác minh ({pending.length})</h2>
          {pendingStudents.length > 0 && (
            <div className="flex gap-2">
              <button type="button" className="secondary-button" onClick={() => setSelected(new Set(pendingStudents.map((item) => item.id)))}>
                Chọn tất cả học sinh
              </button>
              <button type="button" className="primary-button" disabled={selected.size === 0} onClick={approveSelected}>
                Duyệt đã chọn ({selected.size})
              </button>
            </div>
          )}
        </div>
        {!isLoading && pending.length === 0 && !loadError && (
          <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Không có tài khoản nào đang chờ.</p>
        )}
        <ul className="mt-3 space-y-3">
          {pending.map((account) => (
            <PendingAccount
              key={account.id}
              account={account}
              isAdmin={isAdmin}
              onDecided={load}
              isSelected={selected.has(account.id)}
              onToggle={toggleSelected}
            />
          ))}
        </ul>
      </section>

      {!loadError && !isLoading && <ClassMembers members={members} onChanged={load} />}

      {isAdmin && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-slate-950">Lớp phụ trách của giáo viên</h2>
          <ul className="mt-3 space-y-2">
            {teachers.map((teacher) => <TeacherClasses key={teacher.id} teacher={teacher} onSaved={load} />)}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-950">Nhật kí xác minh</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">Chưa có quyết định nào.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
            {reviews.map((review) => (
              <li key={review.id} className="flex flex-wrap justify-between gap-2 p-3 text-sm">
                <span>
                  <strong>{DECISION_LABELS[review.decision] || review.decision}</strong> {review.username}
                  {review.classes ? ` (${review.classes})` : ''}
                  {review.note ? `: ${review.note}` : ''}
                </span>
                <span className="text-slate-500">{review.reviewer} · {formatDate(review.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
