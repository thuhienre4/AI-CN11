import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSampleCourse, getSampleLesson } from '../data/courseCatalog'
import { learningAPI } from '../services/api'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const chapterGames = {
  1: {
    title: 'Xưởng nghề cơ khí',
    objective:
      'Ghi nhớ vai trò của cơ khí chế tạo, quy trình tạo sản phẩm và yêu cầu năng lực nghề cơ khí.',
    processTitle: 'Sắp xếp quy trình tạo sản phẩm cơ khí',
    processFeedback:
      'Quy trình chuẩn: xác định yêu cầu -> thiết kế -> chọn vật liệu -> gia công -> lắp ráp -> kiểm tra.',
    steps: [
      { id: 'need', title: 'Xác định yêu cầu', hint: 'Sản phẩm dùng để làm gì, cần đạt yêu cầu nào?' },
      { id: 'design', title: 'Thiết kế', hint: 'Lập bản vẽ, xác định hình dạng và kích thước.' },
      { id: 'material', title: 'Chọn vật liệu', hint: 'Chọn vật liệu phù hợp công dụng và điều kiện làm việc.' },
      { id: 'manufacture', title: 'Gia công', hint: 'Tạo chi tiết bằng phương pháp gia công phù hợp.' },
      { id: 'assembly', title: 'Lắp ráp', hint: 'Ghép các chi tiết thành cụm hoặc máy.' },
      { id: 'inspect', title: 'Kiểm tra', hint: 'Đo kiểm, vận hành thử và đánh giá chất lượng.' },
    ],
    order: ['need', 'design', 'material', 'manufacture', 'assembly', 'inspect'],
    matches: [
      { id: 'detail', term: 'Chi tiết máy', answer: 'Phần tử có cấu tạo hoàn chỉnh, thực hiện một nhiệm vụ trong máy' },
      { id: 'assembly', term: 'Cụm chi tiết', answer: 'Nhiều chi tiết lắp ghép với nhau để thực hiện một chức năng' },
      { id: 'quality', term: 'Kiểm tra chất lượng', answer: 'Đánh giá sản phẩm có đạt yêu cầu kĩ thuật và an toàn hay không' },
      { id: 'cnc', term: 'Vận hành CNC', answer: 'Điều khiển máy gia công theo chương trình số' },
    ],
    scenarios: [
      {
        title: 'Một chi tiết lắp vào máy bị sai kích thước',
        prompt: 'Khâu nào trong quy trình cần được xem lại trực tiếp nhất?',
        answers: [
          { text: 'Đo kiểm và kiểm tra chất lượng', correct: true, feedback: 'Đúng. Sai kích thước phải được phát hiện qua đo kiểm trước khi lắp ráp.' },
          { text: 'Đổi tên sản phẩm', correct: false, feedback: 'Chưa đúng. Tên sản phẩm không xử lí sai số kích thước.' },
          { text: 'Bỏ qua bản vẽ', correct: false, feedback: 'Chưa đúng. Bản vẽ là căn cứ quan trọng để gia công và kiểm tra.' },
        ],
      },
      {
        title: 'Học sinh muốn theo nghề cơ khí',
        prompt: 'Năng lực nào cần rèn luyện trước?',
        answers: [
          { text: 'Đọc bản vẽ, đo kiểm, thao tác chính xác và tuân thủ an toàn', correct: true, feedback: 'Đúng. Đây là nền tảng của hầu hết nghề cơ khí.' },
          { text: 'Chỉ học thuộc tên máy', correct: false, feedback: 'Chưa đủ. Nghề cơ khí cần năng lực thực hành và tư duy kĩ thuật.' },
          { text: 'Không cần làm việc nhóm', correct: false, feedback: 'Chưa đúng. Sản xuất cơ khí thường cần phối hợp trong quy trình.' },
        ],
      },
    ],
  },
  2: {
    title: 'Phòng chọn vật liệu và gia công',
    objective:
      'Luyện cách chọn vật liệu, nhận biết phương pháp gia công và lập quy trình công nghệ cơ bản.',
    processTitle: 'Sắp xếp quy trình công nghệ gia công chi tiết',
    processFeedback:
      'Quy trình hợp lí: đọc bản vẽ -> chọn phôi/vật liệu -> chọn phương pháp -> gia công thô -> gia công tinh -> đo kiểm.',
    steps: [
      { id: 'drawing', title: 'Đọc bản vẽ', hint: 'Xác định hình dạng, kích thước và yêu cầu kĩ thuật.' },
      { id: 'blank', title: 'Chọn phôi và vật liệu', hint: 'Căn cứ công dụng, tải trọng, môi trường và giá thành.' },
      { id: 'method', title: 'Chọn phương pháp gia công', hint: 'Đúc, hàn, áp lực, tiện, phay, khoan, mài...' },
      { id: 'rough', title: 'Gia công thô', hint: 'Bóc lượng dư lớn, tạo hình gần đúng.' },
      { id: 'finish', title: 'Gia công tinh', hint: 'Đạt kích thước và độ nhẵn yêu cầu.' },
      { id: 'measure', title: 'Đo kiểm', hint: 'Kiểm tra kích thước, hình dạng và bề mặt.' },
    ],
    order: ['drawing', 'blank', 'method', 'rough', 'finish', 'measure'],
    matches: [
      { id: 'casting', term: 'Đúc', answer: 'Tạo phôi hoặc chi tiết có hình dạng phức tạp' },
      { id: 'welding', term: 'Hàn', answer: 'Liên kết các chi tiết kim loại' },
      { id: 'turning', term: 'Tiện', answer: 'Gia công bề mặt tròn xoay' },
      { id: 'grinding', term: 'Mài', answer: 'Tăng độ chính xác và độ nhẵn bề mặt' },
      { id: 'rubber', term: 'Cao su', answer: 'Làm kín, giảm chấn hoặc cách rung' },
    ],
    scenarios: [
      {
        title: 'Một trục cần độ chính xác cao và bề mặt nhẵn',
        prompt: 'Phương án nào phù hợp nhất?',
        answers: [
          { text: 'Tiện, sau đó có thể mài tinh và đo kiểm', correct: true, feedback: 'Đúng. Trục là chi tiết tròn xoay, thường cần tiện và mài để đạt độ chính xác.' },
          { text: 'Chỉ sơn phủ bề mặt', correct: false, feedback: 'Chưa đúng. Sơn không tạo được kích thước chính xác.' },
          { text: 'Chọn vật liệu bất kì rồi lắp ngay', correct: false, feedback: 'Chưa đúng. Phải chọn vật liệu và gia công theo yêu cầu kĩ thuật.' },
        ],
      },
      {
        title: 'Chi tiết làm việc ngoài trời, cần nhẹ và chống ăn mòn',
        prompt: 'Cách chọn vật liệu nào đúng?',
        answers: [
          { text: 'Ưu tiên vật liệu đủ bền, nhẹ và chống ăn mòn', correct: true, feedback: 'Đúng. Lựa chọn vật liệu phải căn cứ điều kiện làm việc.' },
          { text: 'Chọn vật liệu nặng nhất', correct: false, feedback: 'Chưa đúng. Yêu cầu bài toán là cần nhẹ.' },
          { text: 'Chọn theo màu sắc yêu thích', correct: false, feedback: 'Chưa đúng. Màu sắc không phải tiêu chí kĩ thuật chính.' },
        ],
      },
    ],
  },
  3: {
    title: 'Trạm sản xuất an toàn',
    objective:
      'Ghi nhớ đặc điểm sản xuất cơ khí hiện đại, tự động hóa và quy tắc an toàn lao động.',
    processTitle: 'Sắp xếp checklist an toàn khi làm việc với máy',
    processFeedback:
      'Trình tự an toàn: chuẩn bị bảo hộ -> kiểm tra máy -> vận hành đúng quy trình -> theo dõi bất thường -> tắt máy -> vệ sinh, sắp xếp.',
    steps: [
      { id: 'ppe', title: 'Chuẩn bị bảo hộ', hint: 'Kính, quần áo gọn, giày và thiết bị bảo vệ phù hợp.' },
      { id: 'check', title: 'Kiểm tra máy', hint: 'Kiểm tra nguồn điện, che chắn, dụng cụ và khu vực làm việc.' },
      { id: 'operate', title: 'Vận hành đúng quy trình', hint: 'Làm theo hướng dẫn, tập trung và không đùa nghịch.' },
      { id: 'monitor', title: 'Theo dõi bất thường', hint: 'Chú ý tiếng kêu, rung, nhiệt, mùi lạ.' },
      { id: 'stop', title: 'Tắt máy', hint: 'Ngắt máy đúng cách sau khi hoàn thành.' },
      { id: 'clean', title: 'Vệ sinh và sắp xếp', hint: 'Dọn phoi, trả dụng cụ, báo cáo vấn đề.' },
    ],
    order: ['ppe', 'check', 'operate', 'monitor', 'stop', 'clean'],
    matches: [
      { id: 'cnc', term: 'Máy CNC', answer: 'Gia công theo chương trình số, có độ lặp lại cao' },
      { id: 'robot', term: 'Robot công nghiệp', answer: 'Thực hiện thao tác lặp lại, nặng nhọc hoặc nguy hiểm' },
      { id: 'sensor', term: 'Cảm biến', answer: 'Thu thập tín hiệu để giám sát trạng thái máy hoặc sản phẩm' },
      { id: 'shield', term: 'Che chắn an toàn', answer: 'Ngăn tiếp xúc với vùng nguy hiểm và hạn chế phoi bắn' },
    ],
    scenarios: [
      {
        title: 'Máy khoan bàn rung mạnh và có tiếng kêu lạ',
        prompt: 'Hành động đúng là gì?',
        answers: [
          { text: 'Dừng máy, báo giáo viên hoặc người phụ trách kiểm tra', correct: true, feedback: 'Đúng. Dấu hiệu bất thường phải được xử lí trước khi tiếp tục vận hành.' },
          { text: 'Tiếp tục khoan để hoàn thành nhanh', correct: false, feedback: 'Chưa đúng. Tiếp tục vận hành có thể gây tai nạn hoặc hỏng máy.' },
          { text: 'Tháo che chắn khi máy đang quay', correct: false, feedback: 'Sai nguy hiểm. Không tháo che chắn hoặc chạm vào máy khi đang quay.' },
        ],
      },
      {
        title: 'Sản xuất hàng loạt một chi tiết giống nhau',
        prompt: 'Vì sao nên dùng CNC hoặc tự động hóa?',
        answers: [
          { text: 'Để tăng độ chính xác, tính lặp lại và năng suất', correct: true, feedback: 'Đúng. Đây là ưu điểm chính của tự động hóa trong sản xuất cơ khí.' },
          { text: 'Để bỏ qua kiểm tra chất lượng', correct: false, feedback: 'Chưa đúng. Sản xuất hiện đại càng cần kiểm soát chất lượng.' },
          { text: 'Để người vận hành không cần hiểu quy trình', correct: false, feedback: 'Chưa đúng. Người vận hành vẫn phải hiểu và giám sát quy trình.' },
        ],
      },
    ],
  },
  4: {
    title: 'Mô phỏng cơ khí động lực',
    objective:
      'Ghi nhớ đối tượng cơ khí động lực, cấu tạo động cơ đốt trong và nguyên lí làm việc động cơ 4 kì.',
    processTitle: 'Sắp xếp chu trình làm việc động cơ 4 kì',
    processFeedback:
      'Chu trình đúng: kì nạp -> kì nén -> kì cháy - giãn nở -> kì thải.',
    steps: [
      { id: 'intake', title: 'Kì nạp', hint: 'Piston đi xuống, xupap nạp mở.' },
      { id: 'compression', title: 'Kì nén', hint: 'Piston đi lên, hai xupap đóng.' },
      { id: 'power', title: 'Kì cháy - giãn nở', hint: 'Khí cháy đẩy piston đi xuống, sinh công.' },
      { id: 'exhaust', title: 'Kì thải', hint: 'Piston đi lên, xupap thải mở.' },
    ],
    order: ['intake', 'compression', 'power', 'exhaust'],
    matches: [
      { id: 'piston', term: 'Piston', answer: 'Chuyển động tịnh tiến trong xi lanh và nhận lực khí cháy' },
      { id: 'rod', term: 'Thanh truyền', answer: 'Truyền lực giữa piston và trục khuỷu' },
      { id: 'crankshaft', term: 'Trục khuỷu', answer: 'Biến chuyển động tịnh tiến thành chuyển động quay' },
      { id: 'valve', term: 'Xupap', answer: 'Đóng mở cửa nạp và cửa thải đúng thời điểm' },
      { id: 'lubrication', term: 'Bôi trơn', answer: 'Giảm ma sát và mài mòn giữa các bề mặt chuyển động' },
    ],
    scenarios: [
      {
        title: 'Động cơ nóng nhanh, công suất giảm',
        prompt: 'Hệ thống nào cần kiểm tra trước?',
        answers: [
          { text: 'Làm mát và bôi trơn', correct: true, feedback: 'Đúng. Quá nhiệt thường liên quan đến làm mát kém hoặc thiếu dầu bôi trơn.' },
          { text: 'Hệ thống chiếu sáng', correct: false, feedback: 'Chưa đúng. Chiếu sáng không trực tiếp làm động cơ quá nhiệt.' },
          { text: 'Màu sơn thân xe', correct: false, feedback: 'Chưa đúng. Màu sơn không quyết định nhiệt độ làm việc của động cơ.' },
        ],
      },
      {
        title: 'Động cơ điêzen không dùng bugi đánh lửa',
        prompt: 'Vì sao nhiên liệu vẫn cháy?',
        answers: [
          { text: 'Không khí bị nén nóng, nhiên liệu phun vào tự bốc cháy', correct: true, feedback: 'Đúng. Đây là đặc điểm cơ bản của động cơ điêzen.' },
          { text: 'Trục khuỷu tạo ra tia lửa', correct: false, feedback: 'Chưa đúng. Trục khuỷu tạo chuyển động quay, không tạo tia lửa.' },
          { text: 'Nhiên liệu cháy mà không cần oxy', correct: false, feedback: 'Chưa đúng. Quá trình cháy vẫn cần oxy trong không khí.' },
        ],
      },
    ],
  },
  5: {
    title: 'Garage hệ thống ô tô',
    objective:
      'Ghi nhớ cấu tạo chung của ô tô và nhiệm vụ hệ truyền lực, treo, lái, phanh, điện - điều khiển.',
    processTitle: 'Sắp xếp dòng truyền công suất trên ô tô',
    processFeedback:
      'Dòng truyền công suất cơ bản: nguồn động lực -> li hợp/biến mô -> hộp số -> truyền lực chính -> bánh xe chủ động.',
    steps: [
      { id: 'engine', title: 'Nguồn động lực', hint: 'Tạo công suất và mô-men.' },
      { id: 'clutch', title: 'Li hợp hoặc biến mô', hint: 'Nối, ngắt hoặc truyền mô-men êm dịu.' },
      { id: 'gearbox', title: 'Hộp số', hint: 'Thay đổi tỉ số truyền, mô-men và tốc độ.' },
      { id: 'final', title: 'Truyền lực chính', hint: 'Đưa mô-men đến cầu hoặc bánh xe chủ động.' },
      { id: 'wheel', title: 'Bánh xe chủ động', hint: 'Nhận mô-men để tạo lực kéo.' },
    ],
    order: ['engine', 'clutch', 'gearbox', 'final', 'wheel'],
    matches: [
      { id: 'drivetrain', term: 'Hệ truyền lực', answer: 'Truyền mô-men từ động cơ đến bánh xe chủ động' },
      { id: 'suspension', term: 'Hệ thống treo', answer: 'Giảm dao động và giúp bánh xe bám đường' },
      { id: 'steering', term: 'Hệ thống lái', answer: 'Điều khiển hướng chuyển động của ô tô' },
      { id: 'brake', term: 'Hệ thống phanh', answer: 'Giảm tốc, dừng xe hoặc giữ xe đứng yên' },
      { id: 'electric', term: 'Điện - điều khiển', answer: 'Hỗ trợ khởi động, chiếu sáng, tín hiệu, điều khiển và an toàn' },
    ],
    scenarios: [
      {
        title: 'Khi phanh, xe lệch sang một bên',
        prompt: 'Hệ thống nào cần được kiểm tra trước?',
        answers: [
          { text: 'Hệ thống phanh và lốp xe', correct: true, feedback: 'Đúng. Lực phanh không đều hoặc lốp kém có thể làm xe lệch hướng.' },
          { text: 'Hệ thống âm thanh', correct: false, feedback: 'Chưa đúng. Âm thanh không quyết định quãng đường và hướng phanh.' },
          { text: 'Màu nội thất', correct: false, feedback: 'Chưa đúng. Đây không phải yếu tố kĩ thuật liên quan đến phanh.' },
        ],
      },
      {
        title: 'Xe xóc mạnh khi đi qua đường gồ ghề',
        prompt: 'Hệ thống nào có khả năng liên quan nhất?',
        answers: [
          { text: 'Hệ thống treo', correct: true, feedback: 'Đúng. Hệ thống treo giảm dao động và giữ bánh xe tiếp xúc mặt đường.' },
          { text: 'Hệ thống đèn xi nhan', correct: false, feedback: 'Chưa đúng. Đèn xi nhan không giảm dao động của xe.' },
          { text: 'Hệ thống giải trí', correct: false, feedback: 'Chưa đúng. Giải trí không liên quan đến độ êm dịu chuyển động.' },
        ],
      },
    ],
  },
}

const defaultGame = chapterGames[1]

const shuffle = (items) => {
  const nextItems = [...items]
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]]
  }
  return nextItems
}

export default function EngineGame() {
  const { lessonId } = useParams()
  const user = useAuthStore((state) => state.user)
  const lesson = getSampleLesson(lessonId)
  const course = getSampleCourse(lesson?.course_id)
  const game = chapterGames[lesson?.course_id] || defaultGame
  const [activeMode, setActiveMode] = useState('process')
  const [selectedSteps, setSelectedSteps] = useState([])
  const [processFeedback, setProcessFeedback] = useState(null)
  const [selectedTerm, setSelectedTerm] = useState(game.matches[0]?.id || '')
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [matchFeedback, setMatchFeedback] = useState(null)
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [scenarioFeedback, setScenarioFeedback] = useState(null)
  const [score, setScore] = useState(0)
  const stepChoices = useMemo(() => shuffle(game.steps), [game])
  const answerChoices = useMemo(() => shuffle(game.matches), [game])
  const currentScenario = game.scenarios[scenarioIndex]

  const trackGameEvent = async (points) => {
    const localEvent = recordLocalLearningEvent(user?.id, {
      lesson_id: Number(lessonId),
      event_type: 'game_played',
      duration_seconds: 60,
      score: points,
      payload: { mode: activeMode, chapter: lesson?.course_id },
      auto_sync: false,
    })
    if (!user?.id) return
    try {
      await learningAPI.trackEvent(user.id, {
        lesson_id: Number(lessonId),
        client_event_id: localEvent?.client_event_id,
        event_type: 'game_played',
        duration_seconds: 60,
        score: points,
        payload: { mode: activeMode, chapter: lesson?.course_id },
      })
    } catch {
      // Game vẫn hoạt động khi backend chưa chạy.
    }
  }

  const selectStep = (stepId) => {
    if (selectedSteps.includes(stepId) || selectedSteps.length >= game.order.length) return
    setSelectedSteps((prev) => [...prev, stepId])
    setProcessFeedback(null)
  }

  const checkProcess = () => {
    const isCorrect = game.order.every((id, index) => selectedSteps[index] === id)
    if (isCorrect) {
      setScore((prev) => prev + 30)
      setProcessFeedback(`Đúng. ${game.processFeedback}`)
      trackGameEvent(30)
    } else {
      setProcessFeedback(`Chưa đúng. Gợi ý: ${game.processFeedback}`)
    }
  }

  const chooseMatchAnswer = (answerId) => {
    setSelectedAnswers((prev) => ({ ...prev, [selectedTerm]: answerId }))
    setMatchFeedback(null)
  }

  const checkMatches = () => {
    const correctCount = game.matches.filter((item) => selectedAnswers[item.id] === item.id).length
    const points = correctCount * 10
    if (correctCount === game.matches.length) {
      setScore((prev) => prev + points)
      setMatchFeedback('Đúng toàn bộ. Em đã ghép đúng khái niệm với nhiệm vụ/ý nghĩa tương ứng.')
      trackGameEvent(points)
    } else {
      setMatchFeedback(`Em đúng ${correctCount}/${game.matches.length}. Hãy đọc lại kiến thức trọng tâm của chương rồi ghép lại.`)
    }
  }

  const answerScenario = (answer) => {
    setScenarioFeedback(answer)
    if (answer.correct) {
      setScore((prev) => prev + 20)
      trackGameEvent(20)
    }
  }

  const nextScenario = () => {
    setScenarioFeedback(null)
    setScenarioIndex((prev) => (prev + 1) % game.scenarios.length)
  }

  const resetGame = () => {
    setSelectedSteps([])
    setProcessFeedback(null)
    setSelectedTerm(game.matches[0]?.id || '')
    setSelectedAnswers({})
    setMatchFeedback(null)
    setScenarioIndex(0)
    setScenarioFeedback(null)
    setScore(0)
    toast.success('Đã đặt lại trò chơi')
  }

  const selectedMatch = game.matches.find((item) => item.id === selectedTerm) || game.matches[0]

  return (
    <div className="page-container">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="muted-label mb-2">EngineLab AI Game</p>
          <h1 className="text-3xl font-bold text-slate-950">{game.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            {course?.title}. Bài đang luyện: {lesson?.title || 'Công nghệ cơ khí 11'}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/lessons/${lessonId}`} className="secondary-button">Quay lại bài học</Link>
          <button type="button" onClick={resetGame} className="primary-button">Chơi lại</button>
        </div>
      </div>

      <section className="mb-5 grid gap-4 md:grid-cols-4">
        <div className="panel p-4 md:col-span-1">
          <p className="text-sm text-slate-500">Điểm luyện tập</p>
          <div className="mt-2 text-4xl font-bold text-blue-700">{score}</div>
        </div>
        <div className="panel p-4 md:col-span-3">
          <p className="text-sm font-semibold text-slate-900">Mục tiêu ghi nhớ</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{game.objective}</p>
        </div>
      </section>

      <div className="mb-5 grid gap-2 sm:grid-cols-3">
        {[
          ['process', '1. Sắp xếp quy trình'],
          ['match', '2. Ghép kiến thức'],
          ['scenario', '3. Xử lí tình huống'],
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setActiveMode(mode)}
            className={`rounded-lg border px-4 py-3 text-sm font-semibold transition ${
              activeMode === mode
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeMode === 'process' && (
        <section className="panel p-6">
          <div className="mb-5">
            <p className="muted-label mb-1">Thử thách 1</p>
            <h2 className="text-xl font-bold text-slate-950">{game.processTitle}</h2>
            <p className="mt-2 text-sm text-slate-600">Chọn các thẻ theo đúng thứ tự kiến thức của chương.</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <h3 className="mb-3 font-semibold text-slate-900">Thẻ lựa chọn</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {stepChoices.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => selectStep(step.id)}
                    disabled={selectedSteps.includes(step.id)}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-45"
                  >
                    <p className="font-bold text-slate-950">{step.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.hint}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-slate-900">Thứ tự em chọn</h3>
              <div className="grid gap-3">
                {game.order.map((_, slot) => {
                  const step = game.steps.find((item) => item.id === selectedSteps[slot])
                  return (
                    <div key={slot} className="min-h-[76px] rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">Vị trí {slot + 1}</p>
                      {step ? (
                        <div className="mt-1">
                          <p className="font-bold text-slate-950">{step.title}</p>
                          <p className="text-sm text-slate-600">{step.hint}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">Chưa chọn</p>
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={checkProcess} className="primary-button" disabled={selectedSteps.length < game.order.length}>
                  Kiểm tra thứ tự
                </button>
                <button type="button" onClick={() => setSelectedSteps([])} className="secondary-button">
                  Xóa lựa chọn
                </button>
              </div>
              {processFeedback && <p className="mt-4 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">{processFeedback}</p>}
            </div>
          </div>
        </section>
      )}

      {activeMode === 'match' && (
        <section className="panel p-6">
          <div className="mb-5">
            <p className="muted-label mb-1">Thử thách 2</p>
            <h2 className="text-xl font-bold text-slate-950">Ghép khái niệm với nhiệm vụ hoặc ý nghĩa</h2>
            <p className="mt-2 text-sm text-slate-600">Chọn một khái niệm rồi ghép với mô tả đúng nhất.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="space-y-3">
              {game.matches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedTerm(item.id)
                    setMatchFeedback(null)
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedTerm === item.id
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <p className="font-bold">{item.term}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedAnswers[item.id]
                      ? `Đã chọn: ${game.matches.find((match) => match.id === selectedAnswers[item.id])?.answer}`
                      : 'Chưa ghép'}
                  </p>
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-950">Đang ghép: {selectedMatch?.term}</h3>
              <div className="mt-4 grid gap-3">
                {answerChoices.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseMatchAnswer(item.id)}
                    className={`rounded-lg border p-4 text-left text-sm leading-6 transition ${
                      selectedAnswers[selectedTerm] === item.id
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {item.answer}
                  </button>
                ))}
              </div>
              <button type="button" onClick={checkMatches} className="primary-button mt-5">
                Kiểm tra ghép
              </button>
              {matchFeedback && <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{matchFeedback}</p>}
            </div>
          </div>
        </section>
      )}

      {activeMode === 'scenario' && (
        <section className="panel p-6">
          <div className="mb-5">
            <p className="muted-label mb-1">Thử thách 3</p>
            <h2 className="text-xl font-bold text-slate-950">Xử lí tình huống kĩ thuật theo chương</h2>
            <p className="mt-2 text-sm text-slate-600">Chọn phương án đúng và đọc phản hồi để củng cố kiến thức SGK.</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-blue-700">Tình huống {scenarioIndex + 1}/{game.scenarios.length}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-950">{currentScenario.title}</h3>
            <p className="mt-2 text-slate-600">{currentScenario.prompt}</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {currentScenario.answers.map((answer) => (
                <button
                  key={answer.text}
                  type="button"
                  onClick={() => answerScenario(answer)}
                  className="rounded-lg border border-slate-200 bg-white p-4 text-left text-sm leading-6 text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  {answer.text}
                </button>
              ))}
            </div>
            {scenarioFeedback && (
              <div className={`mt-5 rounded-lg p-4 text-sm leading-6 ${
                scenarioFeedback.correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
              }`}>
                {scenarioFeedback.feedback}
              </div>
            )}
            <button type="button" onClick={nextScenario} className="primary-button mt-5">
              Tình huống tiếp theo
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
