import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { sampleCourses, sampleLessons } from '../data/courseCatalog'
import { isBackendUnavailable } from '../services/api'
import { useAuthStore } from '../store'
import {
  createReferenceMaterial,
  deleteReferenceMaterial,
  downloadReferenceMaterial,
  formatFileSize,
  getMaterialStorageNote,
  readReferenceMaterials,
} from '../utils/referenceMaterials'

export default function ReferenceMaterials() {
  const user = useAuthStore((state) => state.user)
  const isTeacher = user?.role === 'teacher'
  const [materials, setMaterials] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    lessonId: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('')

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      setIsLoading(true)
      setMaterials(await readReferenceMaterials())
    } catch (error) {
      if (!isBackendUnavailable(error)) toast.error('Không đọc được kho tài liệu trên server')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLessons = useMemo(
    () =>
      formData.courseId
        ? sampleLessons.filter((lesson) => lesson.course_id === Number(formData.courseId))
        : sampleLessons,
    [formData.courseId],
  )

  const visibleMaterials = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return materials.filter((material) => {
      const matchesCourse = !courseFilter || material.course_id === Number(courseFilter)
      const matchesSearch =
        !normalizedSearch ||
        material.title.toLowerCase().includes(normalizedSearch) ||
        material.description.toLowerCase().includes(normalizedSearch) ||
        material.file_name.toLowerCase().includes(normalizedSearch)
      return matchesCourse && matchesSearch
    })
  }, [materials, searchTerm, courseFilter])

  const getCourseTitle = (courseId) =>
    sampleCourses.find((course) => course.id === Number(courseId))?.title || 'Tất cả học phần'

  const getLessonTitle = (lessonId) =>
    sampleLessons.find((lesson) => lesson.id === Number(lessonId))?.title || 'Không gắn bài cụ thể'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'courseId' ? { lessonId: '' } : {}),
    }))
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    setIsUploading(true)

    try {
      await createReferenceMaterial({
        file: selectedFile,
        title: formData.title,
        description: formData.description,
        courseId: formData.courseId,
        lessonId: formData.lessonId,
        uploader: user?.full_name || user?.username || 'Giáo viên',
        uploaderUserId: user?.id,
      })
      await loadMaterials()
      setFormData({ title: '', description: '', courseId: '', lessonId: '' })
      setSelectedFile(null)
      event.target.reset()
      toast.success('Đã tải tài liệu lên')
    } catch (error) {
      toast.error(error.message || 'Không thể tải tài liệu')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (materialId) => {
    try {
      await deleteReferenceMaterial(materialId)
      await loadMaterials()
      toast.success('Đã xóa tài liệu')
    } catch {
      toast.error('Không thể xóa tài liệu')
    }
  }

  const handleDownload = async (material) => {
    try {
      await downloadReferenceMaterial(material)
    } catch (error) {
      toast.error(error.message || 'Không thể tải tài liệu')
    }
  }

  return (
    <div className="page-container">
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="muted-label mb-2">Kho học liệu giáo viên</p>
        <h1 className="text-3xl font-bold text-slate-950">Tài liệu tham khảo</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Giáo viên có thể tải lên slide bài giảng, phiếu học tập, tài liệu PDF hoặc đề cương để học sinh tra cứu theo từng học phần.
        </p>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sky-950">
          <p className="text-sm font-black uppercase">Bước 1</p>
          <p className="mt-1 text-base font-bold">Tìm tài liệu theo tên, chương hoặc bài học.</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
          <p className="text-sm font-black uppercase">Bước 2</p>
          <p className="mt-1 text-base font-bold">Mở hoặc tải file để học và làm nhiệm vụ.</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <p className="text-sm font-black uppercase">Giáo viên</p>
          <p className="mt-1 text-base font-bold">Tải slide, phiếu học tập và đề cương cho lớp.</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {isTeacher ? (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-xl font-bold text-slate-950">Tải tài liệu lên</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Hỗ trợ PDF, PPT, PPTX, DOC, DOCX. Giới hạn hiện tại 300MB/file.
            </p>
            <p className="mt-2 rounded-md bg-blue-50 p-3 text-xs leading-5 text-blue-900">
              {getMaterialStorageNote()}
            </p>

            <form onSubmit={handleUpload} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Tên tài liệu</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Slide Bài 21 - Khái quát chung về ô tô"
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Mô tả ngắn</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Ghi chú nội dung, mục tiêu hoặc cách sử dụng tài liệu"
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Học phần</label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Tất cả</option>
                  {sampleCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Bài học</label>
                <select
                  name="lessonId"
                  value={formData.lessonId}
                  onChange={handleChange}
                  className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Không gắn bài</option>
                  {filteredLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">File slide/tài liệu</label>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                required
              />
              {selectedFile && (
                <p className="mt-2 text-xs text-slate-500">
                  Đã chọn: {selectedFile.name} · {formatFileSize(selectedFile.size)}
                </p>
              )}
            </div>

              <button type="submit" disabled={isUploading} className="primary-button w-full disabled:opacity-60">
                {isUploading ? 'Đang tải lên...' : 'Tải tài liệu lên'}
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950 lg:sticky lg:top-24 lg:self-start">
            Chỉ giáo viên được tải tài liệu tham khảo lên kho học liệu. Học sinh có thể xem và tải xuống các tài liệu đã được chia sẻ.
          </section>
        )}

        <section className="space-y-4">
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm theo tên tài liệu, mô tả hoặc tên file"
                className="min-w-0 flex-1 rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
                className="rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 md:w-64"
              >
                <option value="">Tất cả học phần</option>
                {sampleCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="panel p-10 text-center text-slate-600">Đang tải kho tài liệu...</div>
          ) : visibleMaterials.length === 0 ? (
            <div className="panel p-10 text-center">
              <p className="font-semibold text-slate-900">Chưa có tài liệu tham khảo</p>
              <p className="mt-2 text-sm text-slate-600">Giáo viên tải slide hoặc tài liệu lên để hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {visibleMaterials.map((material) => (
                <article key={material.id} className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          {getCourseTitle(material.course_id)}
                        </span>
                        {material.lesson_id && (
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            {getLessonTitle(material.lesson_id)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-950">{material.title}</h2>
                      {material.description && (
                        <p className="mt-2 text-base leading-7 text-slate-600">{material.description}</p>
                      )}
                      <p className="mt-3 text-xs text-slate-500">
                        {material.file_name} · {formatFileSize(material.file_size)} · Tải lên bởi {material.uploader}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => handleDownload(material)} className="primary-button">
                        Tải xuống
                      </button>
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={() => handleDelete(material.id)}
                          className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
