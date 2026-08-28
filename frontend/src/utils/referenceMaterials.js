import { materialsAPI } from '../services/api'

export const MAX_FILE_SIZE = 300 * 1024 * 1024

export const allowedMaterialTypes = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const normalizeMaterials = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export const readReferenceMaterials = async () => {
  const response = await materialsAPI.list()
  return normalizeMaterials(response.data)
}

export const createReferenceMaterial = async ({
  file,
  title,
  description,
  courseId,
  lessonId,
  uploader,
  uploaderUserId,
}) => {
  if (!file) {
    throw new Error('Vui lòng chọn file tài liệu.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File quá lớn. Vui lòng chọn file tối đa 300MB.')
  }

  if (allowedMaterialTypes.length && file.type && !allowedMaterialTypes.includes(file.type)) {
    throw new Error('Định dạng chưa hỗ trợ. Vui lòng chọn PDF, PPT, PPTX, DOC hoặc DOCX.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title?.trim() || file.name)
  formData.append('description', description?.trim() || '')
  if (courseId) formData.append('course_id', Number(courseId))
  if (lessonId) formData.append('lesson_id', Number(lessonId))
  formData.append('uploader', uploader || 'Giáo viên')
  if (uploaderUserId) formData.append('uploader_user_id', Number(uploaderUserId))

  try {
    const response = await materialsAPI.upload(formData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Không thể tải tài liệu.')
  }
}

export const deleteReferenceMaterial = async (materialId) => {
  try {
    await materialsAPI.delete(materialId)
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Không thể xóa tài liệu.')
  }
}

export const downloadReferenceMaterial = async (material) => {
  let response
  try {
    response = await materialsAPI.download(material.id)
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || 'Không thể tải tài liệu.')
  }
  const objectUrl = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = material.file_name || material.title
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export const formatFileSize = (bytes = 0) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const getMaterialStorageNote = () =>
  'Tài liệu được lưu trên backend server trong thư mục uploads/materials và mọi tài khoản dùng chung kho này.'
