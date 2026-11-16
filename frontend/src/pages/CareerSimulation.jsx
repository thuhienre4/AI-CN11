import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import WorkplaceScene from '../components/WorkplaceScene'
import { allCareerJobs } from '../data/careerGames'
import { CAREER_SIMULATIONS } from '../simulations/careers'
import { clickPart, procedureStars, startProcedure } from '../simulations/careers/procedure'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const TONE = {
  ok: 'border-emerald-300 bg-emerald-50 text-emerald-950',
  warn: 'border-amber-300 bg-amber-50 text-amber-950',
  danger: 'border-rose-300 bg-rose-50 text-rose-950',
}

/** /career/:jobId/3d: one workplace procedure in 3D. */
export default function CareerSimulation() {
  const { jobId } = useParams()
  const user = useAuthStore((state) => state.user)
  const sim = CAREER_SIMULATIONS[jobId]
  const job = allCareerJobs().find((entry) => entry.id === jobId)
  const [state, setState] = useState(startProcedure)
  const stateRef = useRef(state)
  stateRef.current = state

  if (!sim || !job) {
    return (
      <div className="page-container">
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          Nghề này chưa có mô phỏng 3D. <Link to="/career" className="font-semibold text-blue-800">Về Một ngày làm nghề</Link>
        </p>
      </div>
    )
  }

  const pick = (part) => {
    const current = stateRef.current
    const next = clickPart(sim, current, part)
    stateRef.current = next
    setState(next)
    if (next.done && !current.done) {
      recordLocalLearningEvent(user?.id, {
        lesson_id: job.lessonId,
        event_type: 'simulation_opened',
        payload: { game: 'career-3d', job: job.id, mistakes: next.mistakes },
      })
    }
  }

  const step = sim.steps[state.index]
  const selected = state.selected && sim.parts[state.selected]
  const stars = procedureStars(state.mistakes)

  return (
    <div className="page-container max-w-6xl">
      <Link to={`/lessons/${job.lessonId}/career`} className="mb-4 inline-flex text-sm font-semibold text-blue-700">← Về {job.lesson}</Link>
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Mô phỏng 3D · {job.title}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">{sim.title}</h1>
        <p className="mt-1 max-w-3xl text-base leading-7 text-slate-600">{sim.intro}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <WorkplaceScene sim={sim} stateRef={stateRef} onPick={pick} />

        <aside className="space-y-3">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-live="polite">
            {state.done ? (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Hoàn thành ca làm việc</p>
                <p className="mt-1 text-2xl font-bold text-slate-950" aria-label={`${stars} trên 3 sao`}>
                  {'★'.repeat(stars)}<span className="text-slate-300">{'★'.repeat(3 - stars)}</span>
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {state.mistakes === 0 ? 'Không sai bước nào. Em làm đúng quy trình an toàn!' : `${state.mistakes} lần thao tác sai hoặc nguy hiểm. Hãy làm lại để thuộc quy trình.`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setState(startProcedure())} className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800">Làm lại</button>
                  <Link to={`/lessons/${job.lessonId}/career`} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Các nghề khác</Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-800">Bước {state.index + 1}/{sim.steps.length}</p>
                <p className="mt-1 text-base font-semibold leading-7 text-slate-950">{step.instruction}</p>
                <p className="mt-1 text-xs text-slate-500">Tìm và bấm vào đồ vật phù hợp trong cảnh 3D. Lỗi: {state.mistakes}</p>
              </>
            )}
          </section>

          {state.message && (
            <p role={state.message.tone === 'ok' ? 'status' : 'alert'} className={`rounded-lg border px-3 py-2 text-sm leading-6 ${TONE[state.message.tone]}`}>
              {state.message.tone === 'danger' && <span className="font-bold">Nguy hiểm! </span>}
              {state.message.tone === 'warn' && <span className="font-bold">Chưa đúng trình tự. </span>}
              {state.message.text}
            </p>
          )}

          {selected && (
            <section className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <p className="font-bold text-slate-950">{selected.name}</p>
              <p className="mt-0.5 leading-6 text-slate-600">{selected.role}</p>
            </section>
          )}

          <details className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
            <summary className="cursor-pointer font-semibold text-slate-700">Khó bấm trong cảnh 3D? Chọn đồ vật từ danh sách</summary>
            {/* alphabetical, so the list does not give the order of the procedure away */}
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Đồ vật trong cảnh">
              {Object.entries(sim.parts)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name, 'vi'))
                .map(([part, info]) => (
                  <button key={part} type="button" disabled={state.done} onClick={() => pick(part)}
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${state.selected === part ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-300 text-slate-700 hover:bg-slate-50'} disabled:opacity-50`}>
                    {info.name}
                  </button>
                ))}
            </div>
          </details>

          <section className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Quy trình</p>
            <ol className="mt-2 space-y-1 text-sm">
              {sim.steps.map((item, index) => (
                <li key={`${item.part}-${index}`} className={`flex gap-2 ${index < state.index ? 'text-emerald-800' : index === state.index && !state.done ? 'font-semibold text-slate-950' : 'text-slate-400'}`}>
                  <span aria-hidden="true">{index < state.index ? '✓' : `${index + 1}.`}</span>
                  {/* later steps stay hidden: finding the next step is part of the task */}
                  <span>{index <= state.index || state.done ? item.instruction : '…'}</span>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}
