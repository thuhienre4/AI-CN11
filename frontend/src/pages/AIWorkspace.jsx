import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { chatAPI } from '../services/api'
import { useAuthStore } from '../store'

const studentTasks = [
  ['explain', 'Hiểu bài', 'Giải thích nội dung khó hiểu bằng ví dụ và câu hỏi gợi mở.'],
  ['review', 'Sửa lỗi bài làm', 'Phân tích bài làm của em và hướng dẫn cách sửa.'],
  ['practice', 'Luyện tập', 'Tạo câu hỏi theo bài học và kết quả học tập hiện có.'],
]
const teacherTasks = [
  ['lesson_plan', 'Soạn bài', 'Tạo kế hoạch dạy học theo mục tiêu và thời lượng.'],
  ['assessment', 'Tạo đề', 'Soạn câu hỏi, đáp án, giải thích và thang điểm.'],
  ['rubric', 'Tiêu chí đánh giá', 'Xây dựng tiêu chí và các mức đạt cho nhiệm vụ học tập.'],
]

export default function AIWorkspace() {
  const user = useAuthStore((state) => state.user)
  const teacher = ['teacher', 'admin', 'moderator'].includes(user?.role)
  const tasks = teacher ? teacherTasks : studentTasks
  const [task, setTask] = useState(tasks[0][0])
  const [lessons, setLessons] = useState([])
  const [lessonId, setLessonId] = useState('')
  const [request, setRequest] = useState('')
  const [result, setResult] = useState(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingLessons, setLoadingLessons] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true
    setLoadingLessons(true)
    setError('')
    chatAPI.workspaceLessons().then(({ data }) => {
      if (!active) return
      if (!Array.isArray(data)) throw new Error('Backend unavailable')
      setLessons(data)
      setLessonId(String(data[0]?.id || ''))
      if (!data.length) setError('Chưa có bài học trên máy chủ. Hãy bổ sung bài học trước khi dùng AI.')
    }).catch(() => {
      if (active) setError('Chưa tải được bài học. Tính năng này cần máy chủ và tài khoản đăng nhập trực tuyến.')
    }).finally(() => { if (active) setLoadingLessons(false) })
    return () => { active = false }
  }, [retry])

  const generate = async (event) => {
    event.preventDefault()
    if (loading || !request.trim() || !lessonId) return
    setLoading(true)
    setError('')
    try {
      const { data } = await chatAPI.generate({ lesson_id: Number(lessonId), task, request: request.trim() })
      setResult(data)
      setDraft(data.answer)
    } catch (error) {
      const detail = error.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Không tạo được nội dung. Vui lòng thử lại; bản nháp trước vẫn được giữ.')
    } finally { setLoading(false) }
  }

  const download = () => {
    const text = `${result.is_draft ? 'BẢN NHÁP GIÁO VIÊN\n' : ''}Ngữ cảnh: ${result.context.title}\n\n${draft}`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'enginelab-ai.txt'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <main className="page-container ai-studio">
    <header className="mb-6 rounded-3xl bg-slate-900 p-6 text-white">
      <p className="text-sm text-teal-300">EngineLab • Không gian AI</p>
      <h1 className="mt-2 text-3xl font-bold">{teacher ? 'Trợ lý giảng dạy' : 'Gia sư của em'}</h1>
      <p className="mt-3 text-slate-200">{teacher ? 'Chuẩn bị bài dạy, đề kiểm tra và tiêu chí đánh giá từ nội dung bài học.' : 'Chọn bài học, đặt câu hỏi và luyện tập từng bước.'}</p>
    </header>
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={generate} className="rounded-2xl border bg-white p-5">
        <fieldset disabled={loading}>
          <legend className="mb-3 font-bold">{teacher ? 'Bạn cần hỗ trợ việc gì?' : 'Em muốn học như thế nào?'}</legend>
          <div className="grid gap-2 sm:grid-cols-3">{tasks.map(([value, label, description]) => <button key={value} type="button" aria-pressed={task === value} onClick={() => setTask(value)} className={`rounded-xl border p-3 text-left ${task === value ? 'border-teal-600 bg-teal-50' : 'border-slate-200'}`}>
            <strong className="block">{label}</strong><span className="mt-1 block text-xs text-slate-600">{description}</span>
          </button>)}</div>
          <label htmlFor="ai-lesson" className="mt-5 block font-semibold">Bài học</label>
          <select id="ai-lesson" required value={lessonId} onChange={(event) => setLessonId(event.target.value)} className="mt-2 w-full rounded-lg border-slate-300" disabled={loadingLessons || !lessons.length}>
            {!lessons.length && <option value="">{loadingLessons ? 'Đang tải bài học…' : 'Chưa có bài học'}</option>}
            {lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
          </select>
          <label htmlFor="ai-request" className="mt-5 block font-semibold">{teacher ? 'Yêu cầu soạn nội dung' : 'Câu hỏi hoặc bài làm của em'}</label>
          <textarea id="ai-request" required maxLength={6000} rows={7} value={request} onChange={(event) => setRequest(event.target.value)} placeholder={teacher ? 'Ví dụ: Soạn bài 45 phút, có hoạt động nhóm và câu hỏi cuối giờ.' : 'Ví dụ: Em chưa hiểu nguyên lí hoạt động. Hãy giải thích bằng một ví dụ đơn giản.'} className="mt-2 w-full rounded-lg border-slate-300" />
          <p className="mt-2 text-xs text-slate-500">Mỗi yêu cầu được xử lý riêng. Khi hỏi tiếp, hãy kèm phần trả lời hoặc bài làm cần trao đổi.</p>
          <button disabled={loading || !lessonId || !request.trim()} className="mt-4 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{loading ? 'AI đang xử lý…' : teacher ? 'Tạo bản nháp' : 'Nhờ AI hướng dẫn'}</button>
        </fieldset>
        {error && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
        {!loadingLessons && !lessons.length && <button type="button" className="mt-3 underline" onClick={() => setRetry((value) => value + 1)}>Tải lại bài học</button>}
      </form>
      <section aria-label="Kết quả AI" aria-busy={loading} className="rounded-2xl border bg-white p-5">
        <h2 className="text-xl font-bold">{result?.is_draft ? 'Bản nháp có thể chỉnh sửa' : 'Hướng dẫn học tập'}</h2>
        {!result ? <p className="mt-4 text-slate-500">{teacher ? 'Nội dung sẽ xuất hiện tại đây. Bạn có thể chỉnh sửa và tải xuống để sử dụng.' : 'AI sẽ dựa trên bài đã chọn và tiến độ của em để hướng dẫn. Hãy thử trả lời các câu hỏi AI đưa ra.'}</p> : <>
          <p className="my-3 text-sm text-slate-600">Ngữ cảnh đã gửi cho AI: <Link className="text-teal-700 underline" to={`/lessons/${result.context.lesson_id}`}>{result.context.title}</Link>. {result.context.has_content ? 'Đây là bài học được cung cấp, chưa phải xác nhận nguồn cho từng phát biểu.' : 'Bài học chưa có nội dung chi tiết; cần đối chiếu tài liệu.'}</p>
          {result.is_draft && <p className="mb-3 text-sm text-amber-800">Giáo viên kiểm tra nội dung, đáp án và thang điểm trước khi sử dụng. Bản nháp chưa được giao cho học sinh.</p>}
          {result.is_draft ? <textarea aria-label="Chỉnh sửa bản nháp" rows={20} value={draft} onChange={(event) => setDraft(event.target.value)} className="w-full rounded-lg border-slate-300 text-sm leading-7" /> : <div className="whitespace-pre-wrap break-words text-sm leading-7">{draft}</div>}
          <button type="button" onClick={download} className="mt-4 rounded-lg border px-4 py-2">Tải xuống (.txt)</button>
          <p className="mt-3 text-xs text-slate-500">Nội dung tại đây chưa được lưu lâu dài. Hãy tải xuống trước khi rời trang.</p>
        </>}
      </section>
    </div>
  </main>
}
