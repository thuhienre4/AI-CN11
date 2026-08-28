import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { sampleCourses, sampleLessons } from '../data/courseCatalog'
import { classroomAPI } from '../services/api'
import { useAuthStore } from '../store'
import {
  createReferenceMaterial,
  deleteReferenceMaterial,
  downloadReferenceMaterial,
  formatFileSize,
  readReferenceMaterials,
} from '../utils/referenceMaterials'

const formatDate = (value) => {
  if (!value) return 'Không giới hạn'
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.detail || error?.message || fallback

const asList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

const getLocalStudents = () => {
  try {
    return asList(JSON.parse(localStorage.getItem('local_auth_users') || '[]'))
      .filter((item) => item.role === 'student')
      .map((item) => ({
        id: item.id || item.username,
        name: item.full_name || item.username,
        className: item.student_class || 'Chưa có lớp',
        username: item.username,
      }))
  } catch {
    return []
  }
}

const getClassFromSubmission = (studentName = '') => {
  const match = studentName.match(/L(?:ớ|o)p\s+(.+)$/i)
  return match?.[1]?.trim() || 'Chưa rõ lớp'
}

const LOCAL_SUBMISSIONS_KEY = 'local_assignment_submissions'

const getLocalSubmissions = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SUBMISSIONS_KEY) || '{}')
  } catch {
    return {}
  }
}

const readLocalSubmissions = (assignmentId) =>
  asList(getLocalSubmissions()[String(assignmentId)])

const saveLocalSubmission = (assignmentId, submission) => {
  const submissions = getLocalSubmissions()
  const key = String(assignmentId)
  submissions[key] = [submission, ...(submissions[key] || [])]
  localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(submissions))
}

const isLocalAuthError = (error) => {
  const token = localStorage.getItem('token') || ''
  return token.startsWith('local-token-') && [401, 403].includes(error?.response?.status)
}

const isLocalSession = () => (localStorage.getItem('token') || '').startsWith('local-token-')

const LOCAL_MATERIALS_KEY = 'local_reference_materials'

const readLocalMaterials = () => {
  try {
    return asList(JSON.parse(localStorage.getItem(LOCAL_MATERIALS_KEY) || '[]'))
  } catch {
    return []
  }
}

const saveLocalMaterial = (material) => {
  const materials = readLocalMaterials()
  localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify([material, ...materials]))
}

const deleteLocalMaterial = (materialId) => {
  const materials = readLocalMaterials().filter((material) => material.id !== materialId)
  localStorage.setItem(LOCAL_MATERIALS_KEY, JSON.stringify(materials))
}

const LOCAL_ASSIGNMENTS_KEY = 'local_classroom_assignments'
const LOCAL_ASSIGNMENT_CLASS_KEY = 'local_assignment_class_map'

const normalizeClassName = (value = '') => String(value || '').trim()

const readLocalAssignments = () => {
  try {
    return asList(JSON.parse(localStorage.getItem(LOCAL_ASSIGNMENTS_KEY) || '[]'))
  } catch {
    return []
  }
}

const saveLocalAssignment = (assignment) => {
  const assignments = readLocalAssignments()
  localStorage.setItem(LOCAL_ASSIGNMENTS_KEY, JSON.stringify([assignment, ...assignments]))
}

const readAssignmentClassMap = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ASSIGNMENT_CLASS_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveAssignmentTargetClass = (assignmentId, targetClass) => {
  if (!assignmentId) return
  const classMap = readAssignmentClassMap()
  classMap[String(assignmentId)] = normalizeClassName(targetClass)
  localStorage.setItem(LOCAL_ASSIGNMENT_CLASS_KEY, JSON.stringify(classMap))
}

const assignmentTargetClass = (assignment = {}) =>
  normalizeClassName(assignment.target_class || assignment.targetClass || assignment.class_name)

const applyAssignmentClassMeta = (assignments = []) => {
  const classMap = readAssignmentClassMap()
  return asList(assignments).map((assignment) => ({
    ...assignment,
    target_class: assignmentTargetClass(assignment) || classMap[String(assignment.id)] || '',
  }))
}

const isAssignmentVisibleToUser = (assignment, user, isTeacher) => {
  if (isTeacher) return true
  const targetClass = assignmentTargetClass(assignment)
  if (!targetClass) return true
  return normalizeClassName(user?.student_class).toLowerCase() === targetClass.toLowerCase()
}

export default function Classroom() {
  const user = useAuthStore((state) => state.user)
  const isTeacher = user?.role === 'teacher'
  const [posts, setPosts] = useState([])
  const [assignments, setAssignments] = useState([])
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [activeAssignmentId, setActiveAssignmentId] = useState(null)
  const [postForm, setPostForm] = useState({ title: '', body: '', courseId: '' })
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    courseId: '',
    lessonId: '',
    dueAt: '',
    targetClass: '',
  })
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    courseId: '',
    lessonId: '',
  })
  const [selectedMaterialFile, setSelectedMaterialFile] = useState(null)
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false)
  const [submissionForm, setSubmissionForm] = useState({ content: '', file: null })
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false)
  const [materials, setMaterials] = useState([])
  const [materialSearchTerm, setMaterialSearchTerm] = useState('')
  const [materialCourseFilter, setMaterialCourseFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')

  useEffect(() => {
    loadClassroom()
    loadMaterials()
  }, [])

  const filteredLessons = useMemo(
    () =>
      assignmentForm.courseId
        ? sampleLessons.filter((lesson) => lesson.course_id === Number(assignmentForm.courseId))
        : sampleLessons,
    [assignmentForm.courseId],
  )

  const filteredMaterialLessons = useMemo(
    () =>
      materialForm.courseId
        ? sampleLessons.filter((lesson) => lesson.course_id === Number(materialForm.courseId))
        : sampleLessons,
    [materialForm.courseId],
  )

  const visibleMaterials = useMemo(() => {
    const normalizedSearch = materialSearchTerm.trim().toLowerCase()
    return asList(materials).filter((material) => {
      const matchesCourse = !materialCourseFilter || material.course_id === Number(materialCourseFilter)
      const matchesSearch =
        !normalizedSearch ||
        material.title.toLowerCase().includes(normalizedSearch) ||
        material.description.toLowerCase().includes(normalizedSearch) ||
        material.file_name.toLowerCase().includes(normalizedSearch)
      return matchesCourse && matchesSearch
    })
  }, [materials, materialSearchTerm, materialCourseFilter])

  const localStudents = useMemo(() => getLocalStudents(), [])

  const classOptions = useMemo(() => {
    const safeAssignments = asList(assignments)
    const names = new Set(asList(localStudents).map((student) => student.className).filter(Boolean))
    safeAssignments.forEach((assignment) => {
      const targetClass = assignmentTargetClass(assignment)
      if (targetClass) names.add(targetClass)
    })
    Object.values(submissionsByAssignment).flatMap(asList).forEach((submission) => {
      names.add(getClassFromSubmission(submission.student_name))
    })
    return [...names].filter(Boolean).sort((a, b) => a.localeCompare(b, 'vi'))
  }, [assignments, localStudents, submissionsByAssignment])

  const assignmentRows = useMemo(() => {
    const safeAssignments = asList(assignments)
    if (!isTeacher || !classFilter) return safeAssignments
    const selected = normalizeClassName(classFilter).toLowerCase()
    return safeAssignments.filter((assignment) => {
      const targetClass = assignmentTargetClass(assignment).toLowerCase()
      return !targetClass || targetClass === selected
    })
  }, [assignments, classFilter, isTeacher])

  const activeAssignment = assignmentRows.find((assignment) => assignment.id === activeAssignmentId) || assignmentRows[0]
  const selectedClass =
    (isTeacher ? classFilter || assignmentTargetClass(activeAssignment) : user?.student_class) ||
    classOptions[0] ||
    ''
  const activeSubmissions = asList(submissionsByAssignment[activeAssignment?.id || activeAssignmentId])

  useEffect(() => {
    if (!assignmentRows.length) {
      setActiveAssignmentId(null)
      return
    }
    if (!assignmentRows.some((assignment) => assignment.id === activeAssignmentId)) {
      setActiveAssignmentId(assignmentRows[0].id)
    }
  }, [assignmentRows, activeAssignmentId])

  const submissionTracker = useMemo(() => {
    const submittedStudents = new Map(
      activeSubmissions.map((submission) => [
        submission.student_user_id || submission.student_name,
        submission,
      ]),
    )
    const classRoster = localStudents.filter((student) => student.className === selectedClass)

    if (classRoster.length) {
      return classRoster.map((student) => {
        const submitted = submittedStudents.get(student.id)
        return {
          id: student.id,
          name: student.name,
          className: student.className,
          submitted,
        }
      })
    }

    return activeSubmissions
      .filter((submission) => !selectedClass || getClassFromSubmission(submission.student_name) === selectedClass)
      .map((submission) => ({
        id: submission.id,
        name: submission.student_name,
        className: getClassFromSubmission(submission.student_name),
        submitted: submission,
      }))
  }, [activeSubmissions, localStudents, selectedClass])

  const submittedCount = submissionTracker.filter((row) => row.submitted).length
  const missingCount = Math.max(0, submissionTracker.length - submittedCount)

  const loadClassroom = async () => {
    try {
      setIsLoading(true)
      const [postResponse, assignmentResponse] = await Promise.all([
        classroomAPI.listPosts(),
        classroomAPI.listAssignments(),
      ])
      const serverAssignments = asList(assignmentResponse.data)
      const combinedAssignments = applyAssignmentClassMeta([
        ...readLocalAssignments(),
        ...serverAssignments,
      ])
      const visibleAssignments = combinedAssignments.filter((assignment) =>
        isAssignmentVisibleToUser(assignment, user, isTeacher),
      )
      setPosts(asList(postResponse.data))
      setAssignments(visibleAssignments)
      setActiveAssignmentId((prev) =>
        visibleAssignments.some((assignment) => assignment.id === prev) ? prev : visibleAssignments[0]?.id || null,
      )
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không đọc được dữ liệu phòng học chung'))
    } finally {
      setIsLoading(false)
    }
  }

  const loadMaterials = async () => {
    try {
      const serverMaterials = await readReferenceMaterials()
      setMaterials([...readLocalMaterials(), ...asList(serverMaterials)])
    } catch {
      setMaterials(readLocalMaterials())
      toast.error('Không đọc được kho tài liệu trên server')
    }
  }

  const loadSubmissions = async (assignmentId) => {
    if (!assignmentId) return
    const localSubmissions = readLocalSubmissions(assignmentId)
    try {
      const response = await classroomAPI.listSubmissions(assignmentId)
      setSubmissionsByAssignment((prev) => ({
        ...prev,
        [assignmentId]: [...localSubmissions, ...asList(response.data)],
      }))
    } catch (error) {
      if (isLocalAuthError(error)) {
        setSubmissionsByAssignment((prev) => ({ ...prev, [assignmentId]: localSubmissions }))
        return
      }
      toast.error(getErrorMessage(error, 'Không đọc được danh sách bài nộp'))
    }
  }

  useEffect(() => {
    const assignmentId = activeAssignment?.id || activeAssignmentId
    if (assignmentId) loadSubmissions(assignmentId)
  }, [activeAssignment?.id, activeAssignmentId])

  const createPost = async (event) => {
    event.preventDefault()
    try {
      await classroomAPI.createPost({
        title: postForm.title,
        body: postForm.body,
        course_id: postForm.courseId ? Number(postForm.courseId) : null,
        author: user?.full_name || user?.username || 'Giáo viên',
        author_user_id: user?.id || null,
        post_type: 'announcement',
      })
      setPostForm({ title: '', body: '', courseId: '' })
      await loadClassroom()
      toast.success('Đã đăng thông báo lên phòng học')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không đăng được thông báo'))
    }
  }

  const createAssignment = async (event) => {
    event.preventDefault()
    const targetClass = normalizeClassName(assignmentForm.targetClass)
    const payload = {
      title: assignmentForm.title,
      description: assignmentForm.description,
      course_id: assignmentForm.courseId ? Number(assignmentForm.courseId) : null,
      lesson_id: assignmentForm.lessonId ? Number(assignmentForm.lessonId) : null,
      due_at: assignmentForm.dueAt ? new Date(assignmentForm.dueAt).toISOString() : null,
      created_by: user?.full_name || user?.username || 'Giáo viên',
      created_by_user_id: user?.id || null,
    }

    try {
      const response = await classroomAPI.createAssignment({
        ...payload,
        target_class: targetClass,
      })
      if (response?.data?.id) saveAssignmentTargetClass(response.data.id, targetClass)
      setAssignmentForm({ title: '', description: '', courseId: '', lessonId: '', dueAt: '', targetClass: '' })
      await loadClassroom()
      toast.success('Đã tạo nhiệm vụ nộp bài')
    } catch (error) {
      if (isLocalSession() || isLocalAuthError(error)) {
        const localAssignment = {
          id: 'local-assignment-' + Date.now(),
          ...payload,
          target_class: targetClass,
          status: 'open',
          submission_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_local: true,
        }
        saveLocalAssignment(localAssignment)
        setAssignments((prev) => [localAssignment, ...prev])
        setActiveAssignmentId(localAssignment.id)
        setAssignmentForm({ title: '', description: '', courseId: '', lessonId: '', dueAt: '', targetClass: '' })
        toast.success('Đã tạo nhiệm vụ cho lớp trong chế độ thử nghiệm')
        return
      }
      toast.error(getErrorMessage(error, 'Không tạo được nhiệm vụ'))
    }
  }

  const handleMaterialFormChange = (event) => {
    const { name, value } = event.target
    setMaterialForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'courseId' ? { lessonId: '' } : {}),
    }))
  }

  const uploadMaterial = async (event) => {
    event.preventDefault()
    setIsUploadingMaterial(true)
    try {
      await createReferenceMaterial({
        file: selectedMaterialFile,
        title: materialForm.title,
        description: materialForm.description,
        courseId: materialForm.courseId,
        lessonId: materialForm.lessonId,
        uploader: user?.full_name || user?.username || 'Giáo viên',
        uploaderUserId: user?.id,
      })
      setMaterialForm({ title: '', description: '', courseId: '', lessonId: '' })
      setSelectedMaterialFile(null)
      event.target.reset()
      await loadMaterials()
      toast.success('Đã tải tài liệu tham khảo lên')
    } catch (error) {
      if (isLocalSession()) {
        const localMaterial = {
          id: 'local-material-' + Date.now(),
          title: materialForm.title.trim() || selectedMaterialFile?.name || 'Tài liệu tham khảo',
          description: materialForm.description.trim(),
          course_id: materialForm.courseId ? Number(materialForm.courseId) : null,
          lesson_id: materialForm.lessonId ? Number(materialForm.lessonId) : null,
          file_name: selectedMaterialFile?.name || 'tai-lieu',
          file_size: selectedMaterialFile?.size || 0,
          file_type: selectedMaterialFile?.type || '',
          uploader: user?.full_name || user?.username || 'Giáo viên',
          uploader_user_id: user?.id || null,
          created_at: new Date().toISOString(),
          is_local: true,
        }
        saveLocalMaterial(localMaterial)
        setMaterials((prev) => [localMaterial, ...prev])
        setMaterialForm({ title: '', description: '', courseId: '', lessonId: '' })
        setSelectedMaterialFile(null)
        event.target.reset()
        toast.success('Đã ghi nhận tài liệu trong chế độ thử nghiệm')
        return
      }
      toast.error(error.message || 'Không tải được tài liệu tham khảo')
    } finally {
      setIsUploadingMaterial(false)
    }
  }
  const submitAssignment = async (event) => {
    event.preventDefault()
    const submissionAssignmentId = activeAssignment?.id || activeAssignmentId
    if (!submissionAssignmentId) return
    setIsSubmittingAssignment(true)

    const studentName =
      user?.role === 'student' && user?.student_class
        ? `${user?.full_name || user?.username} - Lớp ${user.student_class}`
        : user?.full_name || user?.username || 'Học sinh'

    try {
      const formData = new FormData()
      formData.append('student_name', studentName)
      if (user?.id) formData.append('student_user_id', Number(user.id))
      formData.append('content', submissionForm.content)
      if (submissionForm.file) formData.append('file', submissionForm.file)
      await classroomAPI.submitAssignment(submissionAssignmentId, formData)
      setSubmissionForm({ content: '', file: null })
      await loadSubmissions(submissionAssignmentId)
      await loadClassroom()
      toast.success('Đã nộp bài')
    } catch (error) {
      if (isLocalAuthError(error)) {
        const localSubmission = {
          id: 'local-' + Date.now(),
          assignment_id: submissionAssignmentId,
          student_user_id: user?.id || null,
          student_name: studentName,
          content: submissionForm.content.trim(),
          file_name: submissionForm.file?.name || null,
          file_size: submissionForm.file?.size || 0,
          file_type: submissionForm.file?.type || '',
          submitted_at: new Date().toISOString(),
          is_local: true,
        }
        saveLocalSubmission(submissionAssignmentId, localSubmission)
        setSubmissionForm({ content: '', file: null })
        setSubmissionsByAssignment((prev) => ({
          ...prev,
          [submissionAssignmentId]: [localSubmission, ...(prev[submissionAssignmentId] || [])],
        }))
        toast.success('Đã ghi nhận bài nộp trong chế độ thử nghiệm')
        return
      }
      toast.error(getErrorMessage(error, 'Không nộp được bài'))
    } finally {
      setIsSubmittingAssignment(false)
    }
  }
  const downloadSubmission = async (submission) => {
    if (submission.is_local) {
      toast.error('Bài nộp thử nghiệm chỉ lưu thông tin tệp trên trình duyệt này.')
      return
    }
    try {
      const response = await classroomAPI.downloadSubmission(submission.id)
      const objectUrl = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = submission.file_name || 'bai-nop'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không tải được file bài nộp'))
    }
  }

  const getCourseTitle = (courseId) =>
    sampleCourses.find((course) => course.id === Number(courseId))?.title || 'Tất cả học phần'

  const getLessonTitle = (lessonId) =>
    sampleLessons.find((lesson) => lesson.id === Number(lessonId))?.title || 'Không gắn bài cụ thể'

  const handleMaterialDelete = async (materialId) => {
    if (String(materialId).startsWith('local-material-')) {
      deleteLocalMaterial(materialId)
      setMaterials((prev) => prev.filter((material) => material.id !== materialId))
      toast.success('Đã xóa tài liệu thử nghiệm')
      return
    }
    try {
      await deleteReferenceMaterial(materialId)
      await loadMaterials()
      toast.success('Đã xóa tài liệu')
    } catch {
      toast.error('Không thể xóa tài liệu')
    }
  }

  const handleMaterialDownload = async (material) => {
    if (material.is_local) {
      toast.error('Tài liệu thử nghiệm chỉ lưu thông tin tệp trên trình duyệt này.')
      return
    }
    try {
      await downloadReferenceMaterial(material)
    } catch (error) {
      toast.error(error.message || 'Không thể tải tài liệu')
    }
  }

  return (
    <div className="page-container">
      <section className="motion-shimmer mb-6 overflow-hidden rounded-lg border border-indigo-200 bg-classroom-hero p-6 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-100">Không gian lớp học</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Lớp học, học liệu và bài nộp</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-indigo-50">
              Giáo viên đăng thông báo, giao nhiệm vụ và theo dõi học sinh đã nộp hoặc chưa nộp theo từng lớp.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="motion-pop rounded-lg bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-3xl font-black">{assignments.length}</p>
              <p className="text-xs font-bold uppercase text-indigo-100">Nhiệm vụ</p>
            </div>
            <div className="motion-pop rounded-lg bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-3xl font-black">{materials.length}</p>
              <p className="text-xs font-bold uppercase text-indigo-100">Học liệu</p>
            </div>
            <div className="motion-pop rounded-lg bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-3xl font-black">{posts.length}</p>
              <p className="text-xs font-bold uppercase text-indigo-100">Thông báo</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="motion-card rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-4 text-amber-950 shadow-sm">
          <p className="text-sm font-black uppercase">Bước 1</p>
          <p className="mt-1 text-base font-bold">Đọc thông báo và tài liệu mới của giáo viên.</p>
        </div>
        <div className="motion-card rounded-lg border border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-100 p-4 text-sky-950 shadow-sm">
          <p className="text-sm font-black uppercase">Bước 2</p>
          <p className="mt-1 text-base font-bold">Chọn nhiệm vụ, xem hạn nộp và yêu cầu.</p>
        </div>
        <div className="motion-card rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-100 p-4 text-emerald-950 shadow-sm">
          <p className="text-sm font-black uppercase">Giáo viên</p>
          <p className="mt-1 text-base font-bold">Quản lý nộp bài riêng cho từng lớp.</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="space-y-6">
          {isTeacher ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Đăng thông báo lớp</h2>
              <form onSubmit={createPost} className="mt-4 space-y-4">
              <input
                value={postForm.title}
                onChange={(event) => setPostForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Tiêu đề thông báo"
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <textarea
                value={postForm.body}
                onChange={(event) => setPostForm((prev) => ({ ...prev, body: event.target.value }))}
                placeholder="Nội dung thông báo, nhắc lịch học hoặc hướng dẫn chuẩn bị bài"
                rows="4"
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <select
                value={postForm.courseId}
                onChange={(event) => setPostForm((prev) => ({ ...prev, courseId: event.target.value }))}
                className="w-full rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Thông báo chung</option>
                {sampleCourses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
                <button type="submit" className="primary-button w-full">Đăng thông báo</button>
              </form>
            </section>
          ) : (
            <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
              Giáo viên sẽ đăng thông báo và nhiệm vụ học tập tại đây. Học sinh có thể đọc bảng tin và nộp bài theo nhiệm vụ được giao.
            </section>
          )}

          {isTeacher && (
            <section className="rounded-lg border border-sky-200 bg-sky-50 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Tạo nhiệm vụ nộp bài</h2>
              <form onSubmit={createAssignment} className="mt-4 space-y-4">
              <input
                value={assignmentForm.title}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="VD: Báo cáo phân tích chu trình động cơ 4 kì"
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <textarea
                value={assignmentForm.description}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Yêu cầu bài làm, tiêu chí chấm, định dạng file cần nộp"
                rows="4"
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={assignmentForm.courseId}
                  onChange={(event) =>
                    setAssignmentForm((prev) => ({ ...prev, courseId: event.target.value, lessonId: '' }))
                  }
                  className="rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Chọn chương</option>
                  {sampleCourses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
                <select
                  value={assignmentForm.lessonId}
                  onChange={(event) => setAssignmentForm((prev) => ({ ...prev, lessonId: event.target.value }))}
                  className="rounded-md border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Không gắn bài</option>
                  {filteredLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                  ))}
                </select>
              </div>
              <input
                type="datetime-local"
                value={assignmentForm.dueAt}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, dueAt: event.target.value }))}
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                value={assignmentForm.targetClass}
                onChange={(event) => setAssignmentForm((prev) => ({ ...prev, targetClass: event.target.value }))}
                placeholder="Lớp nhận nhiệm vụ, VD: 11A1. Bỏ trống = tất cả lớp"
                className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
                <button type="submit" className="primary-button w-full">Giao nhiệm vụ</button>
              </form>
            </section>
          )}
          {isTeacher && (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Tải tài liệu tham khảo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Hỗ trợ PDF, PPT, PPTX, DOC, DOCX. Giới hạn 300MB/file.
              </p>
              <form onSubmit={uploadMaterial} className="mt-4 space-y-4">
                <input
                  name="title"
                  value={materialForm.title}
                  onChange={handleMaterialFormChange}
                  placeholder="Tên tài liệu"
                  className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <textarea
                  name="description"
                  value={materialForm.description}
                  onChange={handleMaterialFormChange}
                  placeholder="Mô tả ngắn hoặc hướng dẫn sử dụng"
                  rows="3"
                  className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    name="courseId"
                    value={materialForm.courseId}
                    onChange={handleMaterialFormChange}
                    className="rounded-md border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">Tất cả học phần</option>
                    {sampleCourses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                  <select
                    name="lessonId"
                    value={materialForm.lessonId}
                    onChange={handleMaterialFormChange}
                    className="rounded-md border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">Không gắn bài</option>
                    {filteredMaterialLessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={(event) => setSelectedMaterialFile(event.target.files?.[0] || null)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  required
                />
                {selectedMaterialFile && (
                  <p className="text-xs text-slate-500">
                    Đã chọn: {selectedMaterialFile.name} · {formatFileSize(selectedMaterialFile.size)}
                  </p>
                )}
                <button type="submit" disabled={isUploadingMaterial} className="primary-button w-full disabled:opacity-60">
                  {isUploadingMaterial ? 'Đang tải lên...' : 'Tải tài liệu lên'}
                </button>
              </form>
            </section>
          )}
        </aside>

        <main className="space-y-6">
          <section className="rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-amber-950">Bảng tin lớp</h2>
              {isLoading && <span className="text-sm text-slate-500">Đang tải...</span>}
            </div>
            {posts.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">Chưa có thông báo nào.</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <article key={post.id} className="rounded-lg border border-amber-100 bg-amber-50 p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <h3 className="font-bold text-slate-950">{post.title}</h3>
                      <span className="text-xs text-slate-500">{formatDate(post.created_at)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-base leading-7 text-slate-700">{post.body}</p>
                    <p className="mt-3 text-xs text-slate-500">Đăng bởi {post.author}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-emerald-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase text-emerald-700">Học liệu trong lớp</p>
                <h2 className="text-2xl font-bold text-emerald-950">Tài liệu giáo viên đã chia sẻ</h2>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={materialSearchTerm}
                  onChange={(event) => setMaterialSearchTerm(event.target.value)}
                  placeholder="Tìm tài liệu"
                  className="rounded-md border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <select
                  value={materialCourseFilter}
                  onChange={(event) => setMaterialCourseFilter(event.target.value)}
                  className="rounded-md border-slate-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Tất cả học phần</option>
                  {sampleCourses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {visibleMaterials.length === 0 ? (
              <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
                Chưa có học liệu nào trong lớp.
              </p>
            ) : (
              <div className="grid gap-3">
                {visibleMaterials.map((material) => (
                  <article key={material.id} className="rounded-lg border border-emerald-100 bg-gradient-to-r from-white to-emerald-50 p-4">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                            {getCourseTitle(material.course_id)}
                          </span>
                          {material.lesson_id && (
                            <span className="rounded-md bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800">
                              {getLessonTitle(material.lesson_id)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-950">{material.title}</h3>
                        {material.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-600">{material.description}</p>
                        )}
                        <p className="mt-3 text-xs text-slate-500">
                          {material.file_name} · {formatFileSize(material.file_size)} · Tải lên bởi {material.uploader}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button type="button" onClick={() => handleMaterialDownload(material)} className="primary-button">
                          Tải xuống
                        </button>
                        {isTeacher && (
                          <button
                            type="button"
                            onClick={() => handleMaterialDelete(material.id)}
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:bg-red-100"
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

          <section className="rounded-lg border border-sky-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-sky-950">Nhiệm vụ nộp bài</h2>
            {assignmentRows.length === 0 ? (
              <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{isTeacher ? 'Chưa có nhiệm vụ nào cho lớp đang chọn.' : 'Chưa có nhiệm vụ nào cho lớp của em.'}</p>
            ) : (
              <div className="mt-4 grid gap-5 lg:grid-cols-[300px_1fr]">
                <div className="space-y-3">
                  {assignmentRows.map((assignment) => (
                    <button
                      key={assignment.id}
                      type="button"
                      onClick={() => setActiveAssignmentId(assignment.id)}
                      className={`w-full rounded-lg border p-4 text-left transition ${
                        activeAssignmentId === assignment.id
                          ? 'border-sky-500 bg-sky-50 text-sky-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-sky-200'
                      }`}
                    >
                      <p className="text-base font-bold">{assignment.title}</p>
                      <p className="mt-2 text-xs text-slate-500">Hạn nộp: {formatDate(assignment.due_at)}</p>
                      <p className="mt-1 text-xs font-bold text-sky-700">Lớp: {assignmentTargetClass(assignment) || 'Tất cả lớp'}</p>
                      <p className="mt-1 text-xs text-slate-500">{assignment.submission_count || 0} bài nộp</p>
                    </button>
                  ))}
                </div>

                {activeAssignment && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-bold text-slate-950">{activeAssignment.title}</h3>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{activeAssignment.description}</p>
                    <p className="mt-3 text-xs text-slate-500">Hạn nộp: {formatDate(activeAssignment.due_at)}</p>
                    <p className="mt-1 text-xs font-bold text-sky-700">Lớp nhận nhiệm vụ: {assignmentTargetClass(activeAssignment) || 'Tất cả lớp'}</p>

                    {isTeacher ? (
                      <section className="mt-5 rounded-lg border border-violet-200 bg-violet-50 p-4">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                          <div>
                            <h4 className="font-bold text-violet-950">Theo dõi nộp bài theo lớp</h4>
                            <p className="mt-1 text-sm text-violet-800">
                              Đã nộp {submittedCount}, chưa nộp {missingCount}
                              {selectedClass ? ` · Lớp ${selectedClass}` : ''}
                            </p>
                          </div>
                          <select
                            value={classFilter}
                            onChange={(event) => setClassFilter(event.target.value)}
                            className="rounded-md border-violet-200 bg-white text-sm focus:border-violet-500 focus:ring-violet-500"
                          >
                            <option value="">Tất cả / lớp đầu tiên</option>
                            {classOptions.map((className) => (
                              <option key={className} value={className}>Lớp {className}</option>
                            ))}
                          </select>
                        </div>

                        {submissionTracker.length === 0 ? (
                          <p className="mt-3 rounded-lg bg-white p-3 text-sm text-slate-600">
                            Chưa có danh sách học sinh cho lớp này. Khi học sinh nộp bài, danh sách sẽ hiện tại đây.
                          </p>
                        ) : (
                          <div className="mt-4 overflow-hidden rounded-lg border border-violet-100 bg-white">
                            {submissionTracker.map((row) => (
                              <div key={row.id} className="flex flex-col justify-between gap-3 border-b border-violet-50 p-3 last:border-b-0 sm:flex-row sm:items-center">
                                <div>
                                  <p className="font-semibold text-slate-900">{row.name}</p>
                                  <p className="text-xs text-slate-500">Lớp {row.className}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-black ${
                                      row.submitted
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {row.submitted ? 'Đã nộp' : 'Chưa nộp'}
                                  </span>
                                  {row.submitted?.file_name && !row.submitted?.is_local && (
                                    <button
                                      type="button"
                                      onClick={() => downloadSubmission(row.submitted)}
                                      className="secondary-button"
                                    >
                                      Tải file
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    ) : (
                      <form onSubmit={submitAssignment} className="mt-5 space-y-3 rounded-lg bg-white p-4">
                        <h4 className="font-bold text-slate-950">Nộp bài của em</h4>
                        <textarea
                          value={submissionForm.content}
                          onChange={(event) => setSubmissionForm((prev) => ({ ...prev, content: event.target.value }))}
                          placeholder="Nhập câu trả lời ngắn, ghi chú hoặc mô tả file bài làm"
                          rows="4"
                          className="w-full rounded-md border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <input
                          type="file"
                          onChange={(event) => setSubmissionForm((prev) => ({ ...prev, file: event.target.files?.[0] || null }))}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                        />
                        {submissionForm.file && (
                          <p className="text-xs text-slate-500">
                            Đã chọn: {submissionForm.file.name} · {formatFileSize(submissionForm.file.size)}
                          </p>
                        )}
                        <button type="submit" disabled={isSubmittingAssignment} className="primary-button disabled:opacity-60">
                          {isSubmittingAssignment ? 'Đang nộp...' : 'Nộp bài'}
                        </button>
                      </form>
                    )}

                    <div className="mt-5">
                      <h4 className="font-bold text-slate-950">Bài đã nộp</h4>
                      {activeSubmissions.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">Chưa có bài nộp cho nhiệm vụ này.</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {activeSubmissions.map((submission) => (
                            <div key={submission.id} className="rounded-md border border-slate-200 bg-white p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-slate-900">{submission.student_name}</p>
                                  <p className="text-xs text-slate-500">{formatDate(submission.submitted_at)}</p>
                                </div>
                                {submission.file_name && !submission.is_local && (
                                  <button
                                    type="button"
                                    onClick={() => downloadSubmission(submission)}
                                    className="secondary-button"
                                  >
                                    Tải file
                                  </button>
                                )}
                              </div>
                              {submission.content && (
                                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{submission.content}</p>
                              )}
                              {submission.file_name && (
                                <p className="mt-2 text-xs text-slate-500">
                                  {submission.file_name} · {formatFileSize(submission.file_size)}
                                  {submission.is_local ? ' · Thử nghiệm cục bộ' : ''}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
