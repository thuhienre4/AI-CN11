const coverImages = {
  design: [
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80',
  ],
  mechanical: [
    'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1617791160536-598cf32026fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  ],
  electrical: [
    'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=1200&q=80',
  ],
}

const flowPresets = {
  design: [
    ['Vấn đề', 'Xác định nhu cầu, bối cảnh và ràng buộc', 'Đặt tiêu chí rõ để không thiết kế cảm tính', 'Có đề bài thiết kế kiểm chứng được.'],
    ['Ý tưởng', 'Phác thảo nhiều phương án bằng lời, sơ đồ hoặc hình vẽ', 'So sánh theo công năng, an toàn, chi phí và thẩm mĩ', 'Chọn được phương án có cơ sở.'],
    ['Tạo mẫu', 'Dựng mô hình, bản vẽ hoặc mô phỏng', 'Kiểm tra kích thước, vật liệu và điều kiện sử dụng', 'Có sản phẩm thử để đánh giá.'],
    ['Cải tiến', 'Thu thập phản hồi và dữ liệu thử nghiệm', 'Điều chỉnh theo tiêu chí ban đầu', 'Hoàn thiện phương án thiết kế.'],
  ],
  drawing: [
    ['Quan sát', 'Nhận dạng hình dạng, mặt chính, lỗ, rãnh và chi tiết cần biểu diễn', 'Chọn hướng chiếu hoặc kiểu biểu diễn phù hợp', 'Hiểu vật thể trước khi vẽ.'],
    ['Biểu diễn', 'Dùng hình chiếu, hình cắt, mặt cắt hoặc phối cảnh', 'Tuân thủ nét vẽ, tỉ lệ và ghi kích thước', 'Bản vẽ truyền đạt đúng thông tin.'],
    ['Đọc bản vẽ', 'Liên hệ các hình biểu diễn để hình dung vật thể', 'Đọc kí hiệu, vật liệu và yêu cầu kĩ thuật', 'Nắm được thông tin chế tạo hoặc thi công.'],
    ['CAD', 'Tạo và chỉnh sửa bản vẽ trên phần mềm', 'Quản lí lớp, kích thước và xuất bản vẽ', 'Tăng tốc giao tiếp kĩ thuật.'],
  ],
  mechanical: [
    ['Nhu cầu', 'Xác định nhiệm vụ kĩ thuật hoặc sản phẩm cần chế tạo', 'Nêu tiêu chí, vật liệu, công nghệ và an toàn', 'Có yêu cầu chế tạo rõ ràng.'],
    ['Thiết kế', 'Đọc bản vẽ, lựa chọn vật liệu và phương pháp gia công', 'Kiểm tra khả năng chế tạo và chi phí', 'Có phương án công nghệ phù hợp.'],
    ['Gia công', 'Thực hiện cắt gọt, tạo phôi, lắp ráp hoặc tự động hóa', 'Theo dõi thông số, dụng cụ, máy và robot', 'Tạo ra chi tiết hoặc cụm máy.'],
    ['Kiểm tra', 'Đo kiểm kích thước, bề mặt, độ chính xác và an toàn', 'So sánh với yêu cầu kĩ thuật', 'Có dữ liệu cải tiến sản phẩm.'],
  ],
  engine: [
    ['Nạp', 'Môi chất được đưa vào xi lanh hoặc hệ thống', 'Xác định vai trò xupap, piston và đường nạp', 'Chuẩn bị cho quá trình sinh công.'],
    ['Nén', 'Piston nén môi chất để tăng áp suất và nhiệt độ', 'Liên hệ tỉ số nén và hiệu quả làm việc', 'Tạo điều kiện cho cháy hoặc phun nhiên liệu.'],
    ['Cháy - giãn nở', 'Nhiên liệu cháy làm khí giãn nở đẩy piston', 'Nhận diện kì sinh công', 'Cơ năng được truyền tới trục khuỷu.'],
    ['Thải', 'Khí cháy được đẩy ra ngoài', 'Quan sát đường thải và chu trình tiếp theo', 'Động cơ sẵn sàng lặp chu trình.'],
  ],
  electrical: [
    ['Nguồn', 'Xác định nguồn điện hoặc tín hiệu vào', 'Kiểm tra điện áp, công suất và điều kiện cấp điện', 'Có đầu vào đúng cho hệ thống.'],
    ['Truyền dẫn', 'Dòng điện hoặc tín hiệu đi qua dây dẫn, lưới điện hoặc mạch', 'Chọn thiết bị bảo vệ và tiết diện phù hợp', 'Năng lượng/tín hiệu được truyền an toàn.'],
    ['Xử lí', 'Mạch hoặc bộ điều khiển biến đổi, khuếch đại, so sánh, lập trình', 'Đọc sơ đồ khối và sơ đồ nguyên lí', 'Tạo tín hiệu điều khiển đúng mục đích.'],
    ['Đầu ra', 'Thiết bị chấp hành, hiển thị hoặc phụ tải nhận lệnh', 'Đo kiểm chức năng và an toàn', 'Hệ thống hoạt động ổn định.'],
  ],
}

const colors = [
  'bg-sky-100 text-sky-800 border-sky-300',
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-violet-100 text-violet-800 border-violet-300',
  'bg-emerald-100 text-emerald-800 border-emerald-300',
]

const buildFlow = (preset = 'design') =>
  (flowPresets[preset] || flowPresets.design).map(([name, piston, valve, result], index) => ({
    name,
    piston,
    valve,
    result,
    color: colors[index % colors.length],
  }))

const makeSections = (lesson, gradeTitle) => {
  const objectiveItems = lesson.objectives?.length
    ? lesson.objectives
    : [
        `Nêu được nội dung cốt lõi của "${lesson.title}".`,
        'Đọc hoặc mô tả được sơ đồ, quy trình, bản vẽ, hệ thống hoặc thiết bị liên quan.',
        'Vận dụng được kiến thức vào tình huống học tập, sản phẩm hoặc bối cảnh công nghệ an toàn.',
      ]

  const sections = [
    {
      title: 'Mục tiêu cần đạt',
      items: objectiveItems,
    },
  ]

  if (lesson.summary) {
    sections.push({
      title: 'Tóm tắt nội dung SGK',
      items: [lesson.summary],
    })
  }

  sections.push({
    title: 'Kiến thức trọng tâm',
    items: lesson.key_points,
  })

  if (lesson.application?.length) {
    sections.push({
      title: 'Vận dụng sau bài học',
      items: lesson.application,
    })
  }

  sections.push({
    title: 'Hoạt động LMS',
    items: [
      'Khởi động bằng tình huống thực tế hoặc hình ảnh sản phẩm công nghệ.',
      'Khám phá qua sơ đồ khối, mô phỏng, bản vẽ hoặc quy trình thao tác.',
      'Luyện tập bằng câu hỏi nhiều dạng và nhiệm vụ giải thích bằng lời của học sinh.',
      `Vận dụng để tạo sản phẩm học tập nhỏ phù hợp ${gradeTitle}.`,
    ],
  })

  return sections
}

const makeActivity = (lesson, gradeTitle) => ({
  flashcards: [
    { front: `${lesson.title}: cần nhớ điều gì trước tiên?`, back: lesson.key_points[0] },
    { front: 'Sản phẩm học tập nên có gì?', back: 'Có sơ đồ hoặc quy trình, thuật ngữ đúng, ví dụ thực tế và tiêu chí kiểm tra.' },
    { front: 'Tự đánh giá sau bài học như thế nào?', back: 'Giải thích lại bằng lời, chỉ ra điều kiện an toàn và làm câu hỏi vận dụng.' },
  ],
  matching: [
    { term: 'Khái niệm', answer: 'Nêu bản chất hoặc nhiệm vụ của đối tượng kĩ thuật' },
    { term: 'Sơ đồ', answer: 'Thể hiện quan hệ giữa các bộ phận, tín hiệu hoặc bước thao tác' },
    { term: 'Tiêu chí', answer: 'Căn cứ để lựa chọn, đánh giá và cải tiến phương án' },
    { term: 'An toàn', answer: 'Yêu cầu bắt buộc khi thiết kế, vận hành hoặc kiểm tra' },
  ],
  scenario: {
    title: `Vận dụng ${gradeTitle}`,
    prompt: `Sau khi học "${lesson.title}", cách làm nào giúp hiểu sâu nhất?`,
    options: [
      { text: 'Vẽ sơ đồ, giải thích thuật ngữ và liên hệ một ví dụ thực tế', correct: true, feedback: 'Đúng. LMS ưu tiên hiểu, mô tả, vận dụng và tự đánh giá.' },
      { text: 'Chỉ học thuộc tên bài và bỏ qua tiêu chí an toàn', correct: false, feedback: 'Chưa phù hợp. Môn Công nghệ cần gắn kiến thức với quy trình, sản phẩm và an toàn.' },
    ],
  },
  explainChecklist: [
    'Nêu đúng khái niệm hoặc chức năng chính.',
    'Đọc được sơ đồ, bản vẽ, quy trình hoặc hệ thống.',
    'Chỉ ra được yếu tố an toàn, tiêu chí kiểm tra hoặc hướng cải tiến.',
  ],
})

const optionId = (lessonId, offset) => lessonId * 10 + offset

const makeLessonQuestions = (lesson) => [
  {
    id: lesson.id * 10 + 1,
    lesson_id: lesson.id,
    text: `Nhận định nào đúng nhất về "${lesson.title}"?`,
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: optionId(lesson.id, 1), text: lesson.key_points[0], is_correct: true },
      { id: optionId(lesson.id, 2), text: 'Chỉ cần ghi nhớ tên bài, không cần giải thích hoặc vận dụng.', is_correct: false },
      { id: optionId(lesson.id, 3), text: 'Có thể bỏ qua yêu cầu an toàn nếu câu trả lời có đủ thuật ngữ.', is_correct: false },
    ],
  },
  {
    id: lesson.id * 10 + 2,
    lesson_id: lesson.id,
    text: 'Sản phẩm học tập nào phù hợp nhất với cách học môn Công nghệ?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: optionId(lesson.id, 4), text: 'Sơ đồ hoặc quy trình có thuật ngữ đúng, ví dụ thực tế và tiêu chí kiểm tra.', is_correct: true },
      { id: optionId(lesson.id, 5), text: 'Một đoạn chép lại rời rạc, không có quan hệ giữa các ý.', is_correct: false },
      { id: optionId(lesson.id, 6), text: 'Hình trang trí không thể hiện chức năng, dòng năng lượng hoặc quy trình.', is_correct: false },
    ],
  },
]

const makeChapterQuestions = (questions) =>
  questions.map((question) => ({
    id: `chapter-${question.id}`,
    text: question.text,
    question_type: 'multiple_choice',
    options: question.options.map((option) => option.text),
    correctIndex: question.options.findIndex((option) => option.is_correct),
    explanation: 'Đáp án đúng bám vào mục tiêu cần đạt, kiến thức trọng tâm và cách vận dụng trong bài.',
  }))

export const createKnttLmsData = ({ theme, gradeTitle, courseSpecs, lessonSpecs, assessmentPrefix, defaultTitle }) => {
  const images = coverImages[theme] || coverImages.design
  const courses = courseSpecs.map((course, index) => ({
    ...course,
    thumbnail_url: images[index % images.length],
  }))

  const lessons = lessonSpecs.map((lesson) => ({
    ...lesson,
    content:
      lesson.content || lesson.summary ||
      `${lesson.title} thuộc mạch ${gradeTitle} theo định hướng Kết nối tri thức với cuộc sống. Nội dung LMS được biên soạn theo hướng: nắm khái niệm, đọc sơ đồ hoặc quy trình, quan sát minh họa, luyện tập đa dạng và vận dụng vào tình huống công nghệ an toàn.`,
    order: lesson.order ?? Number(String(lesson.id).slice(-2)),
    content_sections: makeSections(lesson, gradeTitle),
    visual_steps: lesson.hide_visual_flow ? null : (lesson.visual_steps || buildFlow(lesson.flow || theme)),
  }))

  const questions = lessons.flatMap(makeLessonQuestions)
  const activities = Object.fromEntries(lessons.map((lesson) => [lesson.id, makeActivity(lesson, gradeTitle)]))
  activities.default = makeActivity(
    {
      title: defaultTitle,
      key_points: [`Học ${gradeTitle} cần hiểu khái niệm, đọc sơ đồ/quy trình và vận dụng an toàn.`],
    },
    gradeTitle
  )

  const chapterAssessments = courses.map((course) => {
    const courseQuestions = questions.filter((question) =>
      lessons.some((lesson) => lesson.course_id === course.id && lesson.id === question.lesson_id)
    )
    return {
      id: `${assessmentPrefix}-c${course.id}`,
      course_id: course.id,
      chapter: course.short_title || course.title,
      title: course.title,
      description: `Đánh giá năng lực trọng tâm của ${course.title.toLowerCase()}: hiểu kiến thức, đọc sơ đồ/quy trình, vận dụng và giải thích an toàn.`,
      duration_minutes: Math.max(20, Math.min(45, 10 + courseQuestions.length * 2)),
      questions: makeChapterQuestions(courseQuestions),
    }
  })

  return { courses, lessons, questions, activities, chapterAssessments }
}
