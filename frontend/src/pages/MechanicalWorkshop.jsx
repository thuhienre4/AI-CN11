import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const STORAGE_KEY = 'engine_lab_mechanics_progress_v1'
const activities = [
  { id: 'safety', index: '01', title: 'An toàn & dụng cụ', caption: 'Nhận diện nguy cơ và chọn đúng dụng cụ', color: 'orange' },
  { id: 'caliper', index: '02', title: 'Đọc thước cặp', caption: 'Đọc kích thước chính xác đến 0,1 mm', color: 'sky' },
  { id: 'assembly', index: '03', title: 'Lắp cơ cấu máy', caption: 'Lắp cơ cấu trục khuỷu – thanh truyền', color: 'emerald' },
  { id: 'diagnosis', index: '04', title: 'Bác sĩ máy móc', caption: 'Chẩn đoán nguyên nhân và cách xử lý', color: 'violet' },
]
const tones = {
  orange: 'border-orange-200 bg-orange-50 text-orange-700', sky: 'border-sky-200 bg-sky-50 text-sky-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700', violet: 'border-violet-200 bg-violet-50 text-violet-700',
}

function ActivityIcon({ id, className = 'h-8 w-8' }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (id === 'caliper') return <svg viewBox="0 0 48 48" className={className} aria-hidden="true"><g {...common}><path d="M8 12v24M8 18h29M8 30h25M37 12v11M33 25v11M14 15v6M20 15v6M26 15v6"/><path d="M5 9h6v30H5z"/></g></svg>
  if (id === 'assembly') return <svg viewBox="0 0 48 48" className={className} aria-hidden="true"><g {...common}><circle cx="15" cy="33" r="8"/><circle cx="15" cy="33" r="3"/><path d="m20 27 11-13M28 11l7 6M31 14l6-6M36 17l5 5"/></g></svg>
  if (id === 'diagnosis') return <svg viewBox="0 0 48 48" className={className} aria-hidden="true"><g {...common}><circle cx="20" cy="20" r="11"/><path d="m28 28 10 10M20 14v12M14 20h12"/><path d="M36 10v8M32 14h8"/></g></svg>
  return <svg viewBox="0 0 48 48" className={className} aria-hidden="true"><g {...common}><path d="M24 5 6 12v11c0 10 7 17 18 20 11-3 18-10 18-20V12L24 5Z"/><path d="m15 24 6 6 12-13"/></g></svg>
}

function WorkshopHeroGraphic() {
  return <div className="mechanics-hero-art" aria-hidden="true">
    <svg viewBox="0 0 360 210" className="h-full w-full">
      <defs><linearGradient id="metal" x1="0" x2="1"><stop stopColor="#d7e6e8"/><stop offset=".5" stopColor="#fff"/><stop offset="1" stopColor="#8db3b9"/></linearGradient><linearGradient id="hot" x1="0" x2="1"><stop stopColor="#ffb347"/><stop offset="1" stopColor="#ff6b35"/></linearGradient></defs>
      <path d="M38 175h286" stroke="#4b7a84" strokeWidth="3" strokeLinecap="round"/>
      <g className="mechanics-gear"><circle cx="245" cy="83" r="43" fill="#0f7487" stroke="#59c4c7" strokeWidth="7"/><circle cx="245" cy="83" r="16" fill="#06384b" stroke="#b9f1ed" strokeWidth="5"/><path d="M245 29v15M245 122v15M191 83h15M284 83h15M207 45l11 11M272 110l11 11M283 45l-11 11M218 110l-11 11" stroke="#b9f1ed" strokeWidth="8" strokeLinecap="round"/></g>
      <g className="mechanics-gear mechanics-gear-reverse"><circle cx="305" cy="132" r="26" fill="#ff6b35" stroke="#ffc09f" strokeWidth="5"/><circle cx="305" cy="132" r="9" fill="#06384b"/><path d="M305 98v9M305 157v9M271 132h9M330 132h9M281 108l7 7M322 149l7 7M329 108l-7 7M288 149l-7 7" stroke="#ffe3d4" strokeWidth="6" strokeLinecap="round"/></g>
      <g><path d="M48 151h104l17 24H32l16-24Z" fill="#082b39" stroke="#4b7a84" strokeWidth="3"/><path d="M65 61h70v90H65z" fill="url(#metal)" stroke="#b9f1ed" strokeWidth="3"/><path d="M78 76h44v23H78z" fill="#06384b"/><circle cx="88" cy="87" r="5" fill="#63e6d3"/><circle cx="105" cy="87" r="5" fill="#ff9a64"/><path d="M100 99v52M68 116h64" stroke="#567b83" strokeWidth="3"/><path d="M91 116v15h18v-15" fill="url(#hot)" stroke="#a34220" strokeWidth="2"/></g>
      <path d="m160 141 45-22 9 15-45 22z" fill="url(#hot)"/><circle cx="166" cy="151" r="8" fill="#ffd0b9"/>
    </svg>
  </div>
}

function ActivityScene({ diagnosis }) {
  return <div className={`mb-5 flex items-center gap-4 overflow-hidden rounded-xl p-4 ${diagnosis ? 'bg-violet-950 text-violet-100' : 'bg-orange-50 text-orange-950'}`}>
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${diagnosis ? 'bg-violet-400/20 text-violet-300' : 'bg-orange-500 text-white'}`}><ActivityIcon id={diagnosis ? 'diagnosis' : 'safety'} className="h-9 w-9" /></span>
    <div><p className="text-xs font-black uppercase tracking-[.16em] opacity-70">{diagnosis ? 'Trạm bảo trì số 04' : 'Khu vực thực hành số 01'}</p><p className="mt-1 text-sm font-bold">{diagnosis ? 'Đọc triệu chứng, khoanh vùng nguyên nhân, chọn cách xử lý.' : 'Quan sát nguy cơ trước khi bắt đầu thao tác với thiết bị.'}</p></div>
  </div>
}

function PartGraphic({ id, className = 'h-10 w-10' }) {
  if (id === 'piston') return <svg viewBox="0 0 48 48" className={className}><path d="M13 8h22v23H13z" fill="currentColor" opacity=".2"/><path d="M11 8h26M13 15h22M16 31v9M32 31v9M16 40h16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
  if (id === 'rod') return <svg viewBox="0 0 48 48" className={className}><circle cx="14" cy="35" r="8" fill="none" stroke="currentColor" strokeWidth="4"/><circle cx="34" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="3"/><path d="m19 29 11-13" stroke="currentColor" strokeWidth="7" strokeLinecap="round"/></svg>
  return <svg viewBox="0 0 48 48" className={className}><circle cx="24" cy="24" r={id === 'bearing' ? 13 : 7} fill="none" stroke="currentColor" strokeWidth="4"/><path d={id === 'piston-pin' ? 'M8 24h32' : 'M5 30h12l7-12 7 12h12'} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg>
}
const safetyQuestions = [
  { question: 'Trước khi khoan một chi tiết kim loại, thao tác nào quan trọng nhất?', options: ['Giữ phôi bằng tay', 'Kẹp chặt phôi vào ê-tô', 'Tăng tốc độ máy tối đa'], answer: 1, explanation: 'Phôi phải được kẹp chắc để không xoay hoặc văng khi mũi khoan bắt đầu cắt.' },
  { question: 'Dụng cụ phù hợp để kiểm tra đường kính ngoài chính xác là gì?', options: ['Búa nguội', 'Thước cặp', 'Cưa sắt'], answer: 1, explanation: 'Thước cặp có mỏ đo ngoài và độ chính xác cao hơn thước thẳng thông thường.' },
  { question: 'Khi giũa kim loại, cán giũa bị thiếu có được tiếp tục sử dụng không?', options: ['Có, nếu thao tác chậm', 'Không, chuôi giũa có thể gây chấn thương', 'Có, nếu đeo găng tay'], answer: 1, explanation: 'Chuôi giũa không có cán rất dễ đâm vào lòng bàn tay khi dụng cụ bị trượt.' },
  { question: 'Phoi kim loại sau gia công nên được làm sạch bằng cách nào?', options: ['Dùng tay phủi', 'Dùng bàn chải chuyên dụng', 'Thổi bằng miệng'], answer: 1, explanation: 'Phoi có cạnh sắc. Bàn chải giúp làm sạch mà không để tay tiếp xúc trực tiếp.' },
]
const caliperQuestions = [
  { main: 12, vernier: 4, answer: 12.4 }, { main: 23, vernier: 7, answer: 23.7 },
  { main: 8, vernier: 2, answer: 8.2 }, { main: 35, vernier: 9, answer: 35.9 },
]
const assemblyParts = [
  { id: 'crankshaft', name: 'Trục khuỷu', symbol: '①', note: 'Chi tiết nền nhận chuyển động quay.' },
  { id: 'bearing', name: 'Bạc đầu to', symbol: '②', note: 'Giảm ma sát giữa thanh truyền và chốt khuỷu.' },
  { id: 'rod', name: 'Thanh truyền', symbol: '③', note: 'Truyền lực giữa piston và trục khuỷu.' },
  { id: 'piston-pin', name: 'Chốt piston', symbol: '④', note: 'Tạo khớp quay giữa piston và thanh truyền.' },
  { id: 'piston', name: 'Piston', symbol: '⑤', note: 'Nhận áp lực khí và chuyển động tịnh tiến.' },
]
const diagnosisCases = [
  { symptom: 'Bộ truyền đai bị trượt khi tải tăng.', checks: ['Đai quá căng', 'Đai chùng hoặc bề mặt dính dầu', 'Bánh đai có đường kính lớn'], answer: 1, action: 'Kiểm tra độ căng, làm sạch bề mặt và thay đai nếu đã mòn.' },
  { symptom: 'Cặp bánh răng phát tiếng ồn bất thường.', checks: ['Thiếu bôi trơn hoặc khe hở ăn khớp sai', 'Vỏ hộp quá sạch', 'Trục quay đúng tốc độ'], answer: 0, action: 'Dừng máy, kiểm tra dầu bôi trơn, độ mòn răng và khe hở ăn khớp.' },
  { symptom: 'Trục quay rung mạnh sau khi lắp lại.', checks: ['Trục lệch tâm hoặc ổ trục lắp sai', 'Đã bôi trơn đầy đủ', 'Bu lông đúng cấp bền'], answer: 0, action: 'Kiểm tra độ đồng tâm, vị trí ổ trục và cân bằng chi tiết quay.' },
  { symptom: 'Ổ trục nóng nhanh trong quá trình làm việc.', checks: ['Thiếu bôi trơn hoặc lắp quá chặt', 'Tốc độ thấp', 'Màu vỏ máy không phù hợp'], answer: 0, action: 'Kiểm tra lượng dầu mỡ, khe hở lắp ghép và tình trạng bề mặt ổ trục.' },
]

const readProgress = (userId) => {
  try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return value?.[String(userId)] || {} } catch { return {} }
}
const writeProgress = (userId, activityId, score) => {
  let all = {}
  try { const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); all = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {} } catch { all = {} }
  const key = String(userId || 'guest'), previous = all[key]?.[activityId]
  all[key] = { ...(all[key] || {}), [activityId]: { score: Math.max(Number(previous?.score || 0), score), attempts: Number(previous?.attempts || 0) + 1, completed_at: new Date().toISOString() } }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all)); return all[key]
}

function ChoiceActivity({ questions, onComplete, diagnosis = false }) {
  const [index, setIndex] = useState(0), [selected, setSelected] = useState(null), [correct, setCorrect] = useState(0)
  const question = questions[index], options = diagnosis ? question.checks : question.options, answered = selected !== null
  const next = () => {
    const result = correct + (selected === question.answer ? 1 : 0)
    if (index === questions.length - 1) { onComplete(Math.round(result / questions.length * 100)); setIndex(0); setSelected(null); setCorrect(0); return }
    setCorrect(result); setIndex((value) => value + 1); setSelected(null)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_310px]">
    <div className="mechanics-panel rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
      <ActivityScene diagnosis={diagnosis} />
      <div className="flex justify-between gap-3 text-xs font-black uppercase tracking-[.15em] text-slate-500"><span>Tình huống {index + 1}/{questions.length}</span><span>Đúng {correct}/{index}</span></div>
      <h2 className="mt-5 text-2xl font-black text-slate-950">{diagnosis ? question.symptom : question.question}</h2>
      <div className="mt-6 space-y-3">{options.map((option, optionIndex) => {
        const style = answered ? optionIndex === question.answer ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : optionIndex === selected ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50'
        return <button key={option} type="button" disabled={answered} onClick={() => setSelected(optionIndex)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-sm font-bold transition ${style}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/20 bg-white">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>
      })}</div>
      {answered && <div className={`mt-5 rounded-xl p-4 text-sm leading-6 ${selected === question.answer ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'}`}><b>{selected === question.answer ? 'Chính xác! ' : 'Chưa chính xác. '}</b>{diagnosis ? question.action : question.explanation}</div>}
      <button type="button" disabled={!answered} onClick={next} className="primary-button mt-5 w-full sm:w-auto">{index === questions.length - 1 ? 'Hoàn thành hoạt động' : 'Tình huống tiếp theo'}</button>
    </div>
    <aside className="rounded-xl bg-[#06384b] p-5 text-white"><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-200">Ghi nhớ</p><h3 className="mt-2 text-xl font-black">{diagnosis ? 'Quy trình chẩn đoán' : 'An toàn trước, thao tác sau'}</h3><ol className="mt-5 space-y-4 text-sm leading-6 text-slate-200">{(diagnosis ? ['Quan sát và mô tả triệu chứng.', 'Dừng máy trước khi kiểm tra.', 'Kiểm tra từ nguyên nhân đơn giản đến phức tạp.', 'Chạy thử và đánh giá sau sửa chữa.'] : ['Mang đúng phương tiện bảo hộ.', 'Kiểm tra dụng cụ trước khi dùng.', 'Kẹp chặt phôi và giữ khu vực gọn.', 'Dừng máy trước khi điều chỉnh.']).map((item, i) => <li key={item}><b className="mr-2 text-orange-300">{i + 1}.</b>{item}</li>)}</ol></aside>
  </div>
}

function CaliperActivity({ onComplete }) {
  const [index, setIndex] = useState(0), [value, setValue] = useState(''), [result, setResult] = useState(null), [correct, setCorrect] = useState(0)
  const question = caliperQuestions[index]
  const next = () => {
    const count = correct + (result ? 1 : 0)
    if (index === 3) { onComplete(Math.round(count / 4 * 100)); setIndex(0); setValue(''); setResult(null); setCorrect(0); return }
    setCorrect(count); setIndex((item) => item + 1); setValue(''); setResult(null)
  }
  return <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><div className="flex justify-between text-xs font-black uppercase tracking-[.15em] text-slate-500"><span>Bài đo {index + 1}/4</span><span>Độ chính xác 0,1 mm</span></div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-300 bg-[#fffdf4] p-5"><div className="relative h-24 border-b-4 border-slate-700"><div className="absolute bottom-0 left-0 right-0 flex justify-between">{Array.from({ length: 11 }).map((_, tick) => <span key={tick} className="relative h-8 border-l-2 border-slate-700 text-[10px]"><b className="absolute left-1 top-0">{question.main - 2 + tick}</b></span>)}</div><div className="absolute bottom-0 h-16 w-1 bg-orange-500" style={{ left: '38%' }} /></div><div className="ml-[38%] mt-2 border-t-4 border-sky-600 pt-2"><div className="flex justify-between text-[10px] font-black text-sky-800">{Array.from({ length: 10 }).map((_, tick) => <span key={tick} className={`h-5 border-l ${tick === question.vernier ? 'border-l-4 border-orange-500 text-orange-600' : 'border-sky-600'}`}>{tick}</span>)}</div></div></div>
      <div className="mt-5 rounded-xl bg-sky-50 p-4 text-sm text-sky-950"><b>Thông số:</b> vạch chính <b>{question.main} mm</b>; vạch trùng trên du xích là vạch <b>{question.vernier}</b>.</div>
      <label className="mt-5 block text-sm font-black text-slate-700">Kết quả đo (mm)</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><input type="number" step="0.1" value={value} disabled={result !== null} onChange={(event) => setValue(event.target.value)} className="field-control max-w-xs" placeholder="Ví dụ: 12.4" />{result === null ? <button type="button" onClick={() => setResult(Math.abs(Number(value) - question.answer) < .01)} disabled={!value} className="primary-button">Kiểm tra</button> : <button type="button" onClick={next} className="primary-button">{index === 3 ? 'Hoàn thành' : 'Bài tiếp theo'}</button>}</div>
      {result !== null && <p className={`mt-4 rounded-xl p-4 text-sm font-bold ${result ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-950'}`}>{result ? 'Chính xác!' : `Kết quả đúng là ${question.answer.toFixed(1)} mm.`} Công thức: {question.main} + {question.vernier} × 0,1.</p>}
    </div>
    <aside className="rounded-xl border border-sky-200 bg-sky-50 p-5 text-sky-950"><p className="text-xs font-black uppercase tracking-[.16em] text-sky-700">Công thức</p><p className="mt-4 text-xl font-black">Kích thước = phần nguyên + vạch trùng × 0,1 mm</p><div className="mt-5 space-y-3 text-sm leading-6"><p><b>Bước 1:</b> Đọc vạch chính ngay trước vạch 0.</p><p><b>Bước 2:</b> Tìm vạch du xích trùng với thước chính.</p><p><b>Bước 3:</b> Cộng hai giá trị và ghi đúng đơn vị.</p></div></aside>
  </div>
}

function AssemblyActivity({ onComplete }) {
  const [placed, setPlaced] = useState([]), [mistakes, setMistakes] = useState(0), [feedback, setFeedback] = useState('Chọn chi tiết đầu tiên để bắt đầu lắp.')
  const remaining = assemblyParts.filter((part) => !placed.includes(part.id))
  const choose = (part) => {
    if (part.id !== assemblyParts[placed.length].id) { setMistakes((value) => value + 1); setFeedback(`Chưa đúng thứ tự. Hãy xác định chi tiết làm nền trước khi lắp “${part.name}”.`); return }
    const next = [...placed, part.id]; setPlaced(next); setFeedback(`${part.name}: ${part.note}`); if (next.length === assemblyParts.length) onComplete(Math.max(40, 100 - mistakes * 15))
  }
  const reset = () => { setPlaced([]); setMistakes(0); setFeedback('Chọn chi tiết đầu tiên để bắt đầu lắp.') }
  return <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
    <div className="mechanics-panel rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.15em] text-slate-500">Kho chi tiết</p><p className="mt-1 text-sm font-bold text-slate-800">Chọn theo đúng thứ tự lắp</p></div><ActivityIcon id="assembly" className="h-10 w-10 text-emerald-600" /></div>
      <div className="mt-4 space-y-3">{remaining.map((part) => <button key={part.id} type="button" onClick={() => choose(part)} className="mechanics-part flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><PartGraphic id={part.id} /></span><span><b className="block text-slate-900">{part.name}</b><small className="text-slate-500">Chi tiết #{assemblyParts.findIndex((item) => item.id === part.id) + 1}</small></span></button>)}{!remaining.length && <p className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-900">Cơ cấu đã được lắp hoàn chỉnh.</p>}</div>
      <button type="button" onClick={reset} className="secondary-button mt-4 w-full">Lắp lại từ đầu</button>
    </div>
    <div className="mechanics-assembly-board rounded-xl bg-[#06384b] p-5 text-white sm:p-7"><div className="flex justify-between"><div><p className="text-xs font-black uppercase tracking-[.15em] text-emerald-200">Bàn lắp ráp</p><h2 className="mt-1 text-2xl font-black">Trục khuỷu – thanh truyền</h2></div><span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black">{placed.length}/5</span></div>
      <div className="mt-8 flex min-h-52 flex-wrap items-center justify-center gap-3 rounded-xl border border-dashed border-white/30 bg-white/5 p-5">{placed.map((id, index) => { const part = assemblyParts.find((item) => item.id === id); return <div key={id} className="motion-pop flex items-center gap-2"><div className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/10 text-center text-emerald-200"><PartGraphic id={part.id} className="h-11 w-11"/><span className="mt-1 text-[10px] font-black text-white">{part.name}</span></div>{index < placed.length - 1 && <span className="text-xl text-orange-300">→</span>}</div>})}{!placed.length && <div className="text-center text-slate-300"><ActivityIcon id="assembly" className="mx-auto h-16 w-16 opacity-40"/><span className="mt-3 block text-sm">Khu vực lắp đang trống</span></div>}</div>
      <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm"><b className="text-emerald-300">Hướng dẫn:</b> {feedback}</div><p className="mt-3 text-xs text-slate-300">Số lần chọn sai: {mistakes}</p>
    </div>
  </div>
}

export default function MechanicalWorkshop() {
  const user = useAuthStore((state) => state.user), [activeId, setActiveId] = useState('safety'), [progress, setProgress] = useState(() => readProgress(user?.id))
  const active = activities.find((item) => item.id === activeId), completed = useMemo(() => activities.filter((item) => progress[item.id]).length, [progress])
  const complete = (activityId, score) => {
    setProgress(writeProgress(user?.id, activityId, score)); recordLocalLearningEvent(user?.id, { event_type: 'game_played', duration_seconds: 300, score, payload: { activity: `mechanics_${activityId}`, offline: true } }); toast.success(`Đã lưu kết quả ${score} điểm`)
  }
  return <div className="mechanics-workshop min-h-screen bg-slate-50">
    <section className="mechanics-hero relative overflow-hidden bg-[#06384b] text-white">
      <div className="mechanics-grid-bg absolute inset-0" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-10">
        <div><div className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-orange-300"><span className="h-2 w-2 rounded-full bg-orange-400 motion-pulse-soft"/>EngineLab · Hoạt động offline</div><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Xưởng cơ khí<br/><span className="text-cyan-300">thực hành tương tác</span></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">Học qua tình huống, đo kiểm, lắp ráp và chẩn đoán. Không cần Internet, kết quả lưu ngay trên thiết bị.</p><div className="mt-6 flex flex-wrap gap-3"><span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold">4 trạm thực hành</span><span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold">Tự động chấm điểm</span><span className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold">100% offline</span></div></div>
        <div className="relative hidden h-56 lg:block"><WorkshopHeroGraphic/><div className="absolute bottom-3 right-3 rounded-xl border border-white/15 bg-[#082f3d]/90 px-5 py-3 shadow-xl backdrop-blur"><p className="text-xs font-bold uppercase text-slate-300">Tiến độ xưởng</p><p className="mt-1 text-2xl font-black"><span className="text-orange-300">{completed}</span>/4 hoạt động</p></div></div>
      </div>
    </section>
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{activities.map((item) => { const saved = progress[item.id]; return <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className={`mechanics-activity-card group rounded-2xl border p-4 text-left transition ${activeId === item.id ? `${tones[item.color]} is-active shadow-lg` : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg'}`}><div className="flex items-start justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeId === item.id ? 'bg-white/80' : 'bg-slate-100 text-slate-600 group-hover:bg-[#06384b] group-hover:text-white'}`}><ActivityIcon id={item.id}/></span>{saved ? <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700">✓ {saved.score} điểm</span> : <span className="text-xs font-black opacity-50">{item.index}</span>}</div><h2 className="mt-4 text-lg font-black text-slate-950">{item.title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{item.caption}</p><div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full transition-all ${saved ? 'w-full bg-emerald-500' : activeId === item.id ? 'w-1/2 bg-orange-500' : 'w-0'}`}/></div></button>})}</div>
      <section className="mt-7"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.16em] text-orange-600">Đang thực hành · Trạm {active.index}</p><h2 className="mt-1 text-2xl font-black text-[#06384b]">{active.title}</h2></div><Link to="/" className="secondary-button">Về lộ trình</Link></div>{activeId === 'safety' && <ChoiceActivity questions={safetyQuestions} onComplete={(score) => complete('safety', score)} />}{activeId === 'caliper' && <CaliperActivity onComplete={(score) => complete('caliper', score)} />}{activeId === 'assembly' && <AssemblyActivity onComplete={(score) => complete('assembly', score)} />}{activeId === 'diagnosis' && <ChoiceActivity questions={diagnosisCases} diagnosis onComplete={(score) => complete('diagnosis', score)} />}</section>
    </main>
  </div>
}
