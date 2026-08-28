const cleanLessonTitle = (title = '') => title.replace(/^Bài\s+\d+[.:]\s*/i, '').trim()

const insertAt = (items, index, value) => {
  const result = [...items]
  result.splice(Math.min(index, result.length), 0, value)
  return result
}

const fallbackWrongAnswers = [
  'Có thể bỏ qua yêu cầu kĩ thuật và an toàn khi thực hiện nội dung này.',
  'Chỉ cần nhớ tên gọi, không cần giải thích chức năng, cấu tạo hoặc quy trình.',
  'Mọi phương án đều phù hợp, không cần căn cứ vào điều kiện sử dụng thực tế.',
]

const makeMultipleChoiceQuestion = (lesson, lessonIndex, prefix) => {
  const correctAnswer = lesson.key_points?.[0] || lesson.description
  const correctIndex = lessonIndex % 4
  const options = insertAt(fallbackWrongAnswers, correctIndex, correctAnswer)

  return {
    id: `${prefix}-${lesson.id}-trong-tam`,
    lesson_id: lesson.id,
    source_lesson_title: lesson.title,
    text: `Theo nội dung slide của “${cleanLessonTitle(lesson.title)}”, nhận định nào đúng?`,
    question_type: 'multiple_choice',
    options,
    correctIndex,
    explanation: `Ý đúng được nêu trong phần kiến thức trọng tâm của ${lesson.title}: ${correctAnswer}`,
  }
}

const makeMultiSelectQuestion = (lesson, lessonIndex, prefix) => {
  const slidePoints = (lesson.key_points?.length ? lesson.key_points : [lesson.description])
    .filter(Boolean)
    .slice(0, 3)
  const distractor =
    'Slide khẳng định có thể bỏ qua quy trình, tiêu chí kiểm tra và yêu cầu an toàn.'
  const distractorIndex = (lessonIndex + 1) % (slidePoints.length + 1)
  const options = insertAt(slidePoints, distractorIndex, distractor)
  const correctIndexes = options
    .map((_, index) => index)
    .filter((index) => index !== distractorIndex)

  return {
    id: `${prefix}-${lesson.id}-chon-y`,
    lesson_id: lesson.id,
    source_lesson_title: lesson.title,
    text: `Chọn tất cả ý được nêu trong slide “${cleanLessonTitle(lesson.title)}”.`,
    question_type: 'multi_select',
    options,
    correctIndexes,
    explanation: `Các ý đúng đều được lấy từ phần kiến thức trọng tâm của ${lesson.title}. Ý còn lại trái với yêu cầu học đúng kĩ thuật và an toàn.`,
  }
}

export const buildChapterMiniTestQuestions = (lessons = [], prefix = 'chapter') =>
  lessons.flatMap((lesson, lessonIndex) => [
    makeMultipleChoiceQuestion(lesson, lessonIndex, prefix),
    makeMultiSelectQuestion(lesson, lessonIndex, prefix),
  ])

export const getMiniTestDuration = (questionCount) =>
  Math.max(10, Math.min(30, Math.ceil(questionCount * 1.5)))
