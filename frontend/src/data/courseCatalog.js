import {
  canhDieuActivities as grade11Activities,
  canhDieuCourses as grade11Courses,
  canhDieuLessons as grade11Lessons,
  canhDieuQuestions as grade11Questions,
  chapterAssessments as grade11Assessments,
} from './knttMechanical11SpecializedData'
import {
  canhDieuActivities as grade10Activities,
  canhDieuCourses as grade10Courses,
  canhDieuLessons as grade10Lessons,
  canhDieuQuestions as grade10Questions,
  chapterAssessments as grade10Assessments,
} from './knttTechnology10Data'
import {
  canhDieuActivities as grade12Activities,
  canhDieuCourses as grade12Courses,
  canhDieuLessons as grade12Lessons,
  canhDieuQuestions as grade12Questions,
  chapterAssessments as grade12Assessments,
} from './knttIndustrial12Data'

const gradeConfigs = {
  10: {
    gradeLevel: 10,
    gradeLabel: 'Khối 10',
    sourceName: 'Thiết kế và công nghệ - Kết nối tri thức',
    courseOffset: 1000,
    lessonOffset: 100000,
    questionOffset: 1000000,
    optionOffset: 10000000,
  },
  11: {
    gradeLevel: 11,
    gradeLabel: 'Khối 11',
    sourceName: 'Công nghệ cơ khí',
    courseOffset: 1100,
    lessonOffset: 110000,
    questionOffset: 1100000,
    optionOffset: 11000000,
  },
  12: {
    gradeLevel: 12,
    gradeLabel: 'Khối 12',
    sourceName: 'Công nghệ điện - điện tử - Kết nối tri thức',
    courseOffset: 1200,
    lessonOffset: 120000,
    questionOffset: 1200000,
    optionOffset: 12000000,
  },
}

const mapCourse = (course, config) => ({
  ...course,
  id: config.courseOffset + course.id,
  source_course_id: course.id,
  grade_level: config.gradeLevel,
  grade_label: config.gradeLabel,
  source_name: config.sourceName,
})

const mapLesson = (lesson, config) => ({
  ...lesson,
  id: config.lessonOffset + lesson.id,
  course_id: config.courseOffset + lesson.course_id,
  source_id: lesson.id,
  source_course_id: lesson.course_id,
  grade_level: config.gradeLevel,
  grade_label: config.gradeLabel,
  source_name: config.sourceName,
})

const mapQuestion = (question, config) => ({
  ...question,
  id: config.questionOffset + question.id,
  lesson_id: config.lessonOffset + question.lesson_id,
  source_id: question.id,
  grade_level: config.gradeLevel,
  options: question.options.map((option) => ({
    ...option,
    id: config.optionOffset + option.id,
  })),
})

const diversifyAssessmentQuestions = (questions) => {
  return questions.map((question) => ({
    ...question,
    question_type: question.question_type || 'multiple_choice',
    points: question.points || 1,
  }))
}

const mapActivities = (activities, lessons, config) =>
  lessons.reduce((rows, lesson) => {
    const mappedId = config.lessonOffset + lesson.id
    rows[mappedId] = activities[lesson.id]
    return rows
  }, {})

const mapAssessment = (assessment, config) => ({
  ...assessment,
  id: `g${config.gradeLevel}-${assessment.id}`,
  course_id: config.courseOffset + assessment.course_id,
  source_course_id: assessment.course_id,
  grade_level: config.gradeLevel,
  grade_label: config.gradeLabel,
  chapter: `${config.gradeLabel} - ${assessment.chapter}`,
  description: `${config.gradeLabel}: ${assessment.description}`,
  questions: diversifyAssessmentQuestions(
    assessment.questions.map((question) => ({
      ...question,
      id: `g${config.gradeLevel}-${question.id}`,
    }))
  ),
})

const grade10Config = gradeConfigs[10]
const grade11Config = gradeConfigs[11]
const grade12Config = gradeConfigs[12]

const grade10MappedCourses = grade10Courses.map((course) => mapCourse(course, grade10Config))
const grade11MappedCourses = grade11Courses.map((course) => mapCourse(course, grade11Config))
const grade12MappedCourses = grade12Courses.map((course) => mapCourse(course, grade12Config))
const grade10MappedLessons = grade10Lessons.map((lesson) => mapLesson(lesson, grade10Config))
const grade11MappedLessons = grade11Lessons.map((lesson) => mapLesson(lesson, grade11Config))
const grade12MappedLessons = grade12Lessons.map((lesson) => mapLesson(lesson, grade12Config))

export const learningPaths = [
  {
    grade_level: 10,
    grade_label: 'Khối 10',
    title: 'Công nghệ 10 - Thiết kế và công nghệ',
    description:
      'Mạch học gồm đại cương về công nghệ, vẽ kĩ thuật và thiết kế kĩ thuật. Trọng tâm là tư duy hệ thống, đọc bản vẽ và giải quyết vấn đề bằng quy trình thiết kế.',
    first_course_id: grade10MappedCourses[0]?.id,
    courses: grade10MappedCourses,
  },
  {
    grade_level: 11,
    grade_label: 'Khối 11',
    title: 'Công nghệ 11 - Chuyên đề cơ khí',
    description:
      'Mạch học theo Chuyên đề học tập Công nghệ cơ khí 11 - Kết nối tri thức: dự án nghiên cứu cơ khí, CAD/CAM-CNC và công nghệ in 3D. Trọng tâm là học theo dự án, quy trình số và minh chứng kĩ thuật.',
    first_course_id: grade11MappedCourses[0]?.id,
    courses: grade11MappedCourses,
  },
  {
    grade_level: 12,
    grade_label: 'Khối 12',
    title: 'Công nghệ 12 - Công nghệ điện - điện tử',
    description:
      'Mạch học theo Công nghệ điện - điện tử 12 - Kết nối tri thức: kĩ thuật điện, hệ thống điện quốc gia, mạng điện trong nhà, an toàn điện, điện tử tương tự, điện tử số và vi điều khiển.',
    first_course_id: grade12MappedCourses[0]?.id,
    courses: grade12MappedCourses,
  },
]

export const chapterAssessments = [
  ...grade10Assessments.map((assessment) => mapAssessment(assessment, grade10Config)),
  ...grade11Assessments.map((assessment) => mapAssessment(assessment, grade11Config)),
  ...grade12Assessments.map((assessment) => mapAssessment(assessment, grade12Config)),
]

export const engineCycleSteps = [
  {
    name: 'Kì nạp',
    piston: 'Piston đi từ điểm chết trên xuống điểm chết dưới',
    valve: 'Xupap nạp mở, xupap thải đóng',
    result: 'Không khí hoặc hòa khí được nạp vào xi lanh.',
    color: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    name: 'Kì nén',
    piston: 'Piston đi từ điểm chết dưới lên điểm chết trên',
    valve: 'Hai xupap đều đóng',
    result: 'Môi chất trong xi lanh bị nén, áp suất và nhiệt độ tăng.',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    name: 'Kì cháy - giãn nở',
    piston: 'Khí cháy giãn nở đẩy piston đi xuống',
    valve: 'Hai xupap đều đóng',
    result: 'Đây là kì sinh công, lực khí cháy truyền qua thanh truyền làm quay trục khuỷu.',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    name: 'Kì thải',
    piston: 'Piston đi từ điểm chết dưới lên điểm chết trên',
    valve: 'Xupap thải mở, xupap nạp đóng',
    result: 'Khí thải được đẩy ra khỏi xi lanh để chuẩn bị chu trình mới.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
]

export const sampleCourses = [...grade10MappedCourses, ...grade11MappedCourses, ...grade12MappedCourses]
export const sampleLessons = [...grade10MappedLessons, ...grade11MappedLessons, ...grade12MappedLessons]
export const sampleQuestions = [
  ...grade10Questions.map((question) => mapQuestion(question, grade10Config)),
  ...grade11Questions.map((question) => mapQuestion(question, grade11Config)),
  ...grade12Questions.map((question) => mapQuestion(question, grade12Config)),
]

const interactiveActivities = {
  ...mapActivities(grade10Activities, grade10Lessons, grade10Config),
  ...mapActivities(grade11Activities, grade11Lessons, grade11Config),
  ...mapActivities(grade12Activities, grade12Lessons, grade12Config),
}

const defaultActivity = grade10Activities.default || grade11Activities.default || {
  flashcards: [
    {
      front: 'Cách học một bài Công nghệ hiệu quả?',
      back: 'Xác định khái niệm chính, nhiệm vụ của đối tượng kĩ thuật, quy trình hoặc hệ thống, sau đó liên hệ với ví dụ thực tế.',
    },
  ],
  matching: [
    { term: 'Khái niệm', answer: 'Nêu bản chất của nội dung đang học' },
    { term: 'Vận dụng', answer: 'Liên hệ kiến thức với tình huống thực tế' },
  ],
  scenario: {
    title: 'Phân tích kiến thức',
    prompt: 'Khi học một nội dung mới trong Công nghệ, bước nào nên làm trước?',
    options: [
      { text: 'Đọc khái niệm và xác định nhiệm vụ của đối tượng kĩ thuật', correct: true, feedback: 'Đúng. Nắm nhiệm vụ trước sẽ giúp hiểu cấu tạo, quy trình hoặc nguyên lí dễ hơn.' },
      { text: 'Học thuộc từng câu mà không cần hiểu ví dụ', correct: false, feedback: 'Chưa đúng. Môn Công nghệ cần hiểu và vận dụng.' },
    ],
  },
  explainChecklist: [
    'Nêu được khái niệm chính.',
    'Nêu được nhiệm vụ hoặc vai trò.',
    'Giải thích được quy trình, hệ thống hoặc nguyên lí bằng lời của mình.',
  ],
}

export const getSampleCourse = (courseId) =>
  sampleCourses.find((course) => course.id === Number(courseId))

export const getSampleLessonsByCourse = (courseId) =>
  sampleLessons
    .filter((lesson) => lesson.course_id === Number(courseId))
    .sort((a, b) => a.order - b.order)

export const getSampleLesson = (lessonId) =>
  sampleLessons.find((lesson) => lesson.id === Number(lessonId))

export const getSampleQuestionsByLesson = (lessonId) =>
  sampleQuestions.filter((question) => question.lesson_id === Number(lessonId))

export const getInteractiveActivity = (lessonId) =>
  interactiveActivities[Number(lessonId)] || defaultActivity

export const getChapterAssessmentsByCourse = (courseId) =>
  chapterAssessments.filter((assessment) => assessment.course_id === Number(courseId))

export const getChapterAssessment = (assessmentId) =>
  chapterAssessments.find((assessment) => assessment.id === assessmentId)
