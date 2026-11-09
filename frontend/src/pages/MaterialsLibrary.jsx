import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { countLibraryFiles, materialLibrary } from '../data/lessonMaterials'
import { isBackendUnavailable } from '../services/api'
import { useAuthStore } from '../store'
import { downloadReferenceMaterial, formatFileSize, readReferenceMaterials } from '../utils/referenceMaterials'
import { canActAsTeacher } from '../utils/roles'

const GRADES = [
  { grade: 10, book: 'Thiết kế và công nghệ 10' },
  { grade: 11, book: 'Công nghệ cơ khí 11' },
  { grade: 12, book: 'Công nghệ điện – điện tử 12' },
]

const normalise = (text = '') => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')

function FileLink({ file }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <a href={file.viewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-semibold text-slate-800 hover:border-blue-500 hover:text-blue-800">
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${file.kind === 'PDF' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'}`}>{file.kind}</span>
        {file.title}
        <span aria-hidden="true">↗</span>
      </a>
      <a href={file.downloadUrl} className="rounded px-1.5 py-1 text-xs font-semibold text-slate-500 hover:text-blue-800" aria-label={`Tải ${file.title}`}>Tải</a>
    </span>
  )
}

export default function MaterialsLibrary() {
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const grade = [10, 11, 12].includes(Number(searchParams.get('grade'))) ? Number(searchParams.get('grade')) : 11
  const [query, setQuery] = useState('')
  const [shared, setShared] = useState({ status: 'loading', items: [] })

  useEffect(() => {
    let active = true
    readReferenceMaterials()
      .then((items) => active && setShared({ status: 'ready', items }))
      .catch((error) => active && setShared({ status: isBackendUnavailable(error) ? 'offline' : 'error', items: [] }))
    return () => {
      active = false
    }
  }, [])

  const library = useMemo(() => materialLibrary(grade), [grade])
  const visibleChapters = useMemo(() => {
    const words = normalise(query.trim())
    if (!words) return library.chapters
    return library.chapters
      .map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.filter((lesson) =>
          normalise(`${chapter.title} ${lesson.title} ${lesson.materials.map((file) => file.title).join(' ')}`).includes(words)),
      }))
      .filter((chapter) => chapter.lessons.length)
  }, [library, query])

  const download = async (material) => {
    try {
      await downloadReferenceMaterial(material)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const book = GRADES.find((item) => item.grade === grade).book

  return (
    <div className="page-container">
      <header className="mb-6">
        <p className="muted-label">Thư viện</p>
        <h1 className="text-3xl font-black text-slate-950">Tài liệu học tập</h1>
        <p className="mt-1 max-w-3xl text-base leading-7 text-slate-600">
          Bài giảng và tài liệu PDF xếp theo chương, bài của sách Kết nối tri thức. Bấm tên tài liệu để xem, bấm “Tải” để lưu về máy.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1" role="tablist" aria-label="Chọn khối">
          {GRADES.map((item) => (
            <button
              key={item.grade}
              type="button"
              role="tab"
              aria-selected={grade === item.grade}
              onClick={() => setSearchParams({ grade: String(item.grade) })}
              className={`rounded-md px-4 py-2 text-sm font-bold ${grade === item.grade ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Lớp {item.grade}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm bài hoặc tài liệu…"
          aria-label="Tìm tài liệu"
          className="min-w-0 flex-1 basis-56 rounded-md border border-slate-300 bg-white px-3 py-2"
        />
        <a href={library.folder} target="_blank" rel="noreferrer" className="secondary-button shrink-0">Mở thư mục Drive ↗</a>
      </div>

      <p className="mb-4 text-sm text-slate-600">{book} · {countLibraryFiles(grade)} tệp</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {visibleChapters.map((chapter) => (
            <section key={chapter.code} className="panel p-5">
              <h2 className="text-lg font-bold text-slate-950">Chương {chapter.code}. {chapter.title}</h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {chapter.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start">
                    <Link to={`/lessons/${lesson.id}`} className="min-w-0 font-semibold text-slate-900 hover:text-blue-800 sm:w-[45%] sm:shrink-0">
                      {lesson.title}
                    </Link>
                    <div className="flex min-w-0 flex-wrap gap-2">
                      {lesson.materials.length
                        ? lesson.materials.map((file) => <FileLink key={file.id} file={file} />)
                        : <span className="text-sm text-slate-400">Chưa có tài liệu riêng</span>}
                    </div>
                  </li>
                ))}
              </ul>
              {chapter.extras.length > 0 && !query && (
                <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {chapter.extras.map((file) => <FileLink key={file.id} file={file} />)}
                </div>
              )}
            </section>
          ))}
          {!visibleChapters.length && <p className="panel p-5 text-slate-600">Không tìm thấy bài hoặc tài liệu phù hợp.</p>}

          {library.others.length > 0 && !query && (
            <section className="panel p-5">
              <h2 className="text-lg font-bold text-slate-950">Tài liệu bổ sung và ôn tập</h2>
              <p className="mt-1 text-sm text-slate-600">Bài giảng ôn tập chủ đề và nội dung mở rộng ngoài các bài của sách.</p>
              <div className="mt-3 flex flex-wrap gap-2">{library.others.map((file) => <FileLink key={file.id} file={file} />)}</div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="panel p-5">
            <h2 className="font-bold text-slate-950">Giáo viên chia sẻ</h2>
            {shared.status === 'loading' && <p className="mt-2 text-sm text-slate-500">Đang tải…</p>}
            {shared.status === 'offline' && <p className="mt-2 text-sm text-slate-600">Cần kết nối máy chủ để xem tài liệu giáo viên tải lên.</p>}
            {shared.status === 'error' && <p className="mt-2 text-sm text-rose-700">Không đọc được kho tài liệu chia sẻ.</p>}
            {shared.status === 'ready' && !shared.items.length && <p className="mt-2 text-sm text-slate-600">Chưa có tài liệu nào được chia sẻ.</p>}
            <ul className="mt-2 space-y-2">
              {shared.items.slice(0, 12).map((material) => (
                <li key={material.id}>
                  <button type="button" onClick={() => download(material)} className="w-full rounded-md border border-slate-200 p-2.5 text-left text-sm hover:border-blue-400">
                    <span className="block font-semibold text-slate-900">{material.title}</span>
                    <span className="text-xs text-slate-500">{material.file_size ? formatFileSize(material.file_size) : ''}{material.uploader ? ` · ${material.uploader}` : ''}</span>
                  </button>
                </li>
              ))}
            </ul>
            {canActAsTeacher(user) && <Link to="/classroom" className="secondary-button mt-3 w-full">Tải tài liệu lên ở trang Lớp học</Link>}
          </section>
        </aside>
      </div>
    </div>
  )
}
