import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { CAREER_LESSONS, INTEREST_OPTIONS, QUALITY_POINTS, allCareerJobs, maxJobPoints } from '../data/careerGames'
import { useAuthStore } from '../store'
import { careerAdvice, careerSummary, readCareerProfile, saveCareerResult } from '../utils/careerProfile'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const QUALITY_STYLE = {
  best: ['Lựa chọn tốt nhất', 'border-emerald-500 bg-emerald-50 text-emerald-950'],
  partial: ['Chưa trọn vẹn', 'border-amber-400 bg-amber-50 text-amber-950'],
  poor: ['Chưa đúng', 'border-rose-400 bg-rose-50 text-rose-950'],
}
const TONE = {
  match: 'border-emerald-300 bg-emerald-50',
  grow: 'border-blue-300 bg-blue-50',
  able: 'border-indigo-200 bg-indigo-50',
  explore: 'border-amber-200 bg-amber-50',
  other: 'border-slate-200 bg-slate-50',
}

function JobCard({ entry, result, onPlay }) {
  return (
    <article className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">{entry.title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{entry.summary}</p>
      <p className="mt-2 text-xs text-slate-500">Nơi làm việc: {entry.place}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        {result ? (
          <span className="text-xs font-semibold text-emerald-800">Đã thử · {result.best}/{maxJobPoints(entry)} điểm</span>
        ) : (
          <span className="text-xs text-slate-500">{entry.steps.length} tình huống</span>
        )}
        <button type="button" onClick={onPlay} className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-800">
          {result ? 'Làm lại' : 'Vào ca làm việc'}
        </button>
      </div>
    </article>
  )
}

function PlayJob({ entry, onDone, onQuit }) {
  const [index, setIndex] = useState(0)
  const [picks, setPicks] = useState([])
  const [interest, setInterest] = useState(null)
  const finished = picks.length === entry.steps.length && index >= entry.steps.length
  const current = entry.steps[index]
  const picked = picks[index]
  const points = picks.reduce((sum, choice) => sum + QUALITY_POINTS[choice.quality], 0)

  if (finished) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-800">Hết ca làm việc · {entry.title}</p>
        <p className="mt-2 text-2xl font-bold text-slate-950">{points}/{maxJobPoints(entry)} điểm xử lí tình huống</p>
        <ul className="mt-3 space-y-1 text-sm">
          {picks.map((choice, stepIndex) => (
            <li key={entry.steps[stepIndex].situation} className="flex gap-2">
              <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${choice.quality === 'best' ? 'bg-emerald-600' : choice.quality === 'partial' ? 'bg-amber-500' : 'bg-rose-500'}`} aria-hidden="true" />
              <span className="text-slate-700">{entry.steps[stepIndex].situation} <span className="font-semibold">{QUALITY_STYLE[choice.quality][0]}.</span></span>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-md bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{entry.title}: {entry.summary.charAt(0).toLowerCase() + entry.summary.slice(1)} Muốn làm nghề này, em có thể học:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">{entry.study.map((path) => <li key={path}>{path}</li>)}</ul>
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-slate-900">Sau ca làm việc này, em thấy thế nào?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {INTEREST_OPTIONS.map((option) => (
              <label key={option.value} className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${interest === option.value ? 'border-blue-600 bg-blue-50 font-semibold text-blue-950' : 'border-slate-200 text-slate-700 hover:border-slate-400'}`}>
                <input type="radio" name="interest" className="sr-only" checked={interest === option.value} onChange={() => setInterest(option.value)} />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" disabled={interest === null} onClick={() => onDone({ points, interest })} className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">
            Lưu vào hồ sơ nghề
          </button>
          <button type="button" onClick={onQuit} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Bỏ qua</button>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-800">{entry.title} · Tình huống {index + 1}/{entry.steps.length}</p>
        <button type="button" onClick={onQuit} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Rời ca làm việc</button>
      </div>
      {index === 0 && !picked && (
        <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
          Hôm nay em làm việc tại <span className="font-semibold">{entry.place.toLowerCase()}</span>. Dụng cụ: {entry.tools.join(', ').toLowerCase()}.
        </p>
      )}
      <p className="mt-4 text-lg font-semibold leading-8 text-slate-950">{current.situation}</p>
      <div className="mt-4 grid gap-2" role="radiogroup" aria-label={`Tình huống ${index + 1}`}>
        {current.choices.map((choice) => {
          const chosen = picked === choice
          const reveal = picked && (chosen || choice.quality === 'best')
          return (
            <button
              key={choice.text}
              type="button"
              role="radio"
              aria-checked={chosen}
              disabled={Boolean(picked)}
              onClick={() => setPicks((list) => [...list.slice(0, index), choice])}
              className={`rounded-md border px-4 py-3 text-left text-sm transition ${reveal ? QUALITY_STYLE[choice.quality][1] : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'} ${picked && !reveal ? 'opacity-60' : ''}`}
            >
              <span className="font-semibold">{choice.text}</span>
              {reveal && <span className="mt-1 block text-xs font-bold uppercase tracking-wide">{QUALITY_STYLE[choice.quality][0]}</span>}
              {reveal && <span className="mt-1 block leading-6">{choice.feedback}</span>}
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={() => setIndex(index + 1)} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            {index + 1 < entry.steps.length ? 'Tình huống tiếp theo' : 'Kết thúc ca làm việc'}
          </button>
        </div>
      )}
    </section>
  )
}

/** /career lists every job; /lessons/:lessonId/career shows the jobs of that lesson. */
export default function CareerExperience() {
  const { lessonId } = useParams()
  const user = useAuthStore((state) => state.user)
  const [profile, setProfile] = useState(() => readCareerProfile(user?.id))
  const [playing, setPlaying] = useState(null)
  const lesson = lessonId ? CAREER_LESSONS[Number(lessonId)] : null
  const jobs = useMemo(() => (lesson ? allCareerJobs().filter((entry) => entry.lessonId === Number(lessonId)) : allCareerJobs()), [lesson, lessonId])
  const summary = useMemo(() => careerSummary(profile), [profile])

  if (lessonId && !lesson) {
    return (
      <div className="page-container">
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
          Bài này chưa có trò chơi trải nghiệm nghề. <Link to="/career" className="font-semibold text-blue-800">Xem tất cả nghề</Link>
        </p>
      </div>
    )
  }

  const finish = ({ points, interest }) => {
    setProfile(saveCareerResult(user?.id, playing.id, { points, interest }))
    recordLocalLearningEvent(user?.id, {
      lesson_id: playing.lessonId,
      event_type: 'game_played',
      score: Math.round((100 * points) / maxJobPoints(playing)),
      payload: { game: 'career', job: playing.id, interest },
    })
    setPlaying(null)
  }

  return (
    <div className="page-container max-w-5xl">
      {lesson && <Link to={`/lessons/${lessonId}`} className="mb-4 inline-flex text-sm font-semibold text-blue-700">← Về {lesson.lesson}</Link>}
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-blue-800">Trải nghiệm hướng nghiệp</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Một ngày làm nghề</h1>
        <p className="mt-1 max-w-3xl text-base leading-7 text-slate-600">
          {lesson ? lesson.intro : 'Nhập vai người làm nghề kĩ thuật, công nghệ và xử lí các tình huống thật ở nơi làm việc.'} Sau mỗi ca, em tự đánh giá mình có thích nghề đó không.
        </p>
      </header>

      {playing ? (
        <PlayJob key={playing.id} entry={playing} onDone={finish} onQuit={() => setPlaying(null)} />
      ) : (
        <>
          <section aria-labelledby="jobs">
            <h2 id="jobs" className="sr-only">Chọn nghề</h2>
            {lesson ? (
              <div className="grid gap-4 md:grid-cols-3">
                {jobs.map((entry) => <JobCard key={entry.id} entry={entry} result={profile[entry.id]} onPlay={() => setPlaying(entry)} />)}
              </div>
            ) : (
              Object.entries(CAREER_LESSONS).map(([id, item]) => (
                <div key={id} className="mb-6">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                    <Link to={`/lessons/${id}`} className="hover:text-blue-800">{item.lesson}</Link>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    {jobs.filter((entry) => entry.lessonId === Number(id)).map((entry) => (
                      <JobCard key={entry.id} entry={entry} result={profile[entry.id]} onPlay={() => setPlaying(entry)} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          <section aria-labelledby="profile" className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 id="profile" className="text-xl font-bold text-slate-950">Hồ sơ nghề của em</h2>
            {summary.length ? (
              <ol className="mt-3 space-y-2">
                {summary.map(({ entry, result, advice }) => (
                  <li key={entry.id} className={`rounded-md border p-3 ${TONE[advice.tone]}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold text-slate-950">{entry.title}</p>
                      <p className="text-xs text-slate-600">
                        Xử lí tình huống {result.best}/{maxJobPoints(entry)} · {INTEREST_OPTIONS.find((option) => option.value === result.interest)?.label}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{careerAdvice(entry, result).text}</p>
                    <p className="mt-1 text-xs text-slate-600">Ngành học: {entry.study.join('; ')}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Chưa có nghề nào. Chọn một nghề ở trên để bắt đầu ca làm việc đầu tiên.</p>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-500">
              Đây là hoạt động trải nghiệm để em suy nghĩ về nghề, không phải bài trắc nghiệm hướng nghiệp chuẩn hóa. Hồ sơ chỉ lưu trên máy này.
              Hãy trao đổi thêm với thầy cô, gia đình và người đang làm nghề trước khi chọn ngành.
            </p>
          </section>
        </>
      )}
    </div>
  )
}
