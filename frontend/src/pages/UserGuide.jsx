import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { COMMON_TOPICS, FAQ, GUIDE_ROLES, GUIDE_TASKS, QUICK_START } from '../data/userGuide'
import { useAuthStore } from '../store'
import { isStaffRole } from '../utils/roles'

const normalise = (text = '') => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
const matches = (topic, query) => !query || normalise([topic.title, ...topic.steps].join(' ')).includes(query)

function TopicCard({ topic, number, signedIn }) {
  // Pages behind sign-in are still worth naming to a visitor, who is sent to sign in first
  // and someone already signed in has no use for the sign-up page
  const target = !topic.to || (signedIn && topic.to === '/register') ? null : !signedIn && topic.to !== '/register' ? '/login' : topic.to
  return (
    <article id={topic.id} className="flex scroll-mt-24 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="flex items-start gap-2.5 text-base font-bold text-slate-950">
        {number && <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-700 text-xs font-black text-white">{number}</span>}
        <span>{topic.title}</span>
      </h3>
      <ol className="mt-3 flex-1 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-slate-700 marker:font-semibold marker:text-slate-400">
        {topic.steps.map((step) => <li key={step}>{step}</li>)}
      </ol>
      {target && (
        <Link to={target} className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-md border border-blue-700 px-3 py-1.5 text-sm font-semibold text-blue-800 hover:bg-blue-50">
          {topic.linkLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </article>
  )
}

export default function UserGuide() {
  const { user, isAuthenticated } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const asked = searchParams.get('role')
  const role = GUIDE_ROLES.some((item) => item.id === asked) ? asked : isStaffRole(user) ? 'teacher' : 'student'
  const search = normalise(query.trim())

  const tasks = useMemo(() => GUIDE_TASKS[role].filter((topic) => matches(topic, search)), [role, search])
  const common = useMemo(() => COMMON_TOPICS.filter((topic) => matches(topic, search)), [search])
  const faq = useMemo(() => FAQ.filter(([question, answer]) => !search || normalise(question + answer).includes(search)), [search])
  const nothing = search && !tasks.length && !common.length && !faq.length

  return (
    <div className="page-container">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Hướng dẫn sử dụng</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Làm gì, bấm ở đâu</h1>
        <p className="mt-1 max-w-3xl text-base leading-7 text-slate-600">
          Các bước dưới đây dùng đúng tên nút trong ứng dụng. Chọn vai trò của mình, hoặc gõ việc cần làm để tìm nhanh.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Vai trò" className="inline-flex w-fit rounded-lg border border-slate-300 bg-white p-1">
          {GUIDE_ROLES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={role === item.id}
              onClick={() => setSearchParams({ role: item.id }, { replace: true })}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold ${role === item.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Tìm trong hướng dẫn</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm: mã lớp, VR, quên mật khẩu…"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      {!search && (
        <section aria-labelledby="quick-start" className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h2 id="quick-start" className="text-sm font-bold uppercase tracking-wide text-blue-900">Bắt đầu trong 3 bước</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-3">
            {QUICK_START[role].map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-slate-800">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-blue-800 ring-1 ring-blue-200">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {tasks.length > 0 && (
        <section aria-labelledby="tasks" className="mt-8">
          <h2 id="tasks" className="text-lg font-bold text-slate-950">Dành cho {role === 'teacher' ? 'giáo viên' : 'học sinh'}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((topic, index) => <TopicCard key={topic.id} topic={topic} number={search ? null : index + 1} signedIn={isAuthenticated} />)}
          </div>
        </section>
      )}

      {common.length > 0 && (
        <section aria-labelledby="common" className="mt-8">
          <h2 id="common" className="text-lg font-bold text-slate-950">Cho mọi người</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {common.map((topic) => <TopicCard key={topic.id} topic={topic} signedIn={isAuthenticated} />)}
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <section aria-labelledby="faq" className="mt-8">
          <h2 id="faq" className="text-lg font-bold text-slate-950">Câu hỏi thường gặp</h2>
          <div className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {faq.map(([question, answer]) => (
              <details key={question} className="group px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">
                  <span className="mr-2 inline-block text-slate-400 transition group-open:rotate-90" aria-hidden="true">›</span>
                  {question}
                </summary>
                <p className="mt-2 pl-5 text-sm leading-6 text-slate-700">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {nothing && (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          Không tìm thấy “{query}”. Thử từ khác, hoặc chọn vai trò {role === 'teacher' ? 'Học sinh' : 'Giáo viên'}.
        </p>
      )}
    </div>
  )
}
