export const GRADE_10_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1d72ac4w0OCWBpG8AlVMTqNbVmWj7Y_yy'

const createSlide = (lessonNumber, sourceLessonId, courseNumber, title, driveId) => ({
  id: `grade-10-drive-${driveId}`,
  course_id: 1000 + courseNumber,
  lesson_id: 100000 + sourceLessonId,
  lesson_number: lessonNumber,
  lesson_title: `Bài ${lessonNumber}`,
  title,
  description: `Bài giảng PowerPoint Công nghệ 10 dành riêng cho Bài ${lessonNumber}.`,
  file_name: `${title}.pptx`,
  file_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  source: 'Google Drive',
  external_url: `https://drive.google.com/file/d/${driveId}/view`,
  download_url: `https://drive.google.com/uc?export=download&id=${driveId}`,
})

export const grade10SlideMaterials = [
  createSlide(1, 101, 1, 'Công nghệ và đời sống', '1eToiuqbxkhoA2OFWu_0S-oWqfCRBwV9N'),
  createSlide(2, 102, 1, 'Hệ thống kĩ thuật', '1HyujrnXrW4k-rBauH7coazdtUKGF00OV'),
  createSlide(3, 103, 1, 'Công nghệ phổ biến', '1Oii58grSYZXLLKtIq4CjSWoblezAKqLi'),
  createSlide(4, 104, 1, 'Một số công nghệ mới', '13KR99unCCKY057cpEAZH9CMMam20OdYj'),
  createSlide(5, 105, 1, 'Đánh giá công nghệ', '1bb1UShdq9SoDSISp5lycRVwbvAqv5-yJ'),
  createSlide(6, 106, 1, 'Cách mạng công nghiệp', '1tBUedbdOskGvL74QARI9E_R-nkIJzz2i'),
  createSlide(7, 107, 1, 'Nghề nghiệp kĩ thuật, công nghệ', '1GKnOw5hQbX6WTKoEmqrHgevCOOhR156z'),

  createSlide(8, 201, 2, 'Bản vẽ kĩ thuật và tiêu chuẩn trình bày', '1OuGDXbQuLRCRNoVkkfVwPhfTIY7toimF'),
  createSlide(9, 202, 2, 'Hình chiếu vuông góc', '1X9FMu16tKUDKQsO2opybi2UcfQbj7Q-Z'),
  createSlide(10, 203, 2, 'Hình cắt và mặt cắt', '1pcAUwPUy8sLfSsX65IuR7MerqzeAqMwn'),
  createSlide(11, 204, 2, 'Hình chiếu trục đo', '1wPzPSKIowM0YAuZjWjrq3gyGFfD58J92'),
  createSlide(12, 205, 2, 'Hình chiếu phối cảnh', '1_-id5llLIE6GIx1iHF_5o4q_EcLZbvPt'),
  createSlide(13, 206, 2, 'Biểu diễn quy ước ren', '1iIGw7SboGcoKohVciZIwd6IoLYcgKPyj'),
  createSlide(14, 207, 2, 'Bản vẽ cơ khí', '1P5Km1pY7GmXVYXKkgRkUQkpAqbEqgfqj'),
  createSlide(15, 208, 2, 'Bản vẽ xây dựng', '1lOqv2s_EFVJIpK3cYWHLoAfcZBgJnqZF'),
  createSlide(16, 209, 2, 'Vẽ kĩ thuật với sự trợ giúp của máy tính', '1Zupy1dPLp18NaOA40fVOZvnjFP0jDKw2'),

  createSlide(17, 301, 3, 'Khái quát về thiết kế kĩ thuật', '1IyhnGio59vglmHZaMSefGplrUZIrEwYf'),
  createSlide(18, 302, 3, 'Quy trình thiết kế kĩ thuật', '1Ph6p8nFhMRyI645zD7Swf_QdBez4nVtM'),
  createSlide(19, 303, 3, 'Những yếu tố ảnh hưởng đến thiết kế kĩ thuật', '12EB2Iv6Mqiqfy8cLuaFmRo-pCZrJ8N9H'),
  createSlide(20, 304, 3, 'Nguyên tắc thiết kế kĩ thuật', '1AsE9dxxW0T6DOfNKAvLYcUBW1B0k22Wp'),
  createSlide(21, 305, 3, 'Phương pháp, phương tiện hỗ trợ thiết kế kĩ thuật', '1yTN7dIsxfmeIz4H1Sdpn6clZkTs1RCCN'),
  createSlide(22, 306, 3, 'Dự án: Thiết kế sản phẩm đơn giản', '10Mj62WTr7G6rZAAgVrLeqyWV24AAPaxp'),
]

export const getGrade10SlideMaterialsByCourse = (courseId) =>
  grade10SlideMaterials.filter((material) => material.course_id === Number(courseId))

export const getGrade10SlideMaterialByLesson = (lesson) => {
  if (!lesson || Number(lesson.grade_level) !== 10) return null

  const lessonId = Number(lesson.id)
  const sourceLessonId = Number(lesson.source_id)
  const lessonNumber = Number(lesson.title?.match(/Bài\s+(\d+)/i)?.[1])

  return grade10SlideMaterials.find((material) =>
    material.lesson_id === lessonId
    || material.lesson_id === 100000 + sourceLessonId
    || material.lesson_number === lessonNumber
  ) || null
}
