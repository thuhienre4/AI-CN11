import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '../components/ui'

const gameChapters = [
  {
    id: 'design',
    label: 'Thiết kế kỹ thuật',
    description: 'Câu hỏi về quy trình thiết kế, bản vẽ và lựa chọn vật liệu phù hợp trong Công nghệ 10.',
    questions: [
      {
        id: 101,
        text: 'Khi bắt đầu thiết kế một sản phẩm kỹ thuật, bước đầu tiên là gì?',
        options: ['Xác định yêu cầu, chức năng và điều kiện sử dụng', 'Chọn màu sắc và thương hiệu', 'Tìm kiếm giá rẻ nhất', 'Thiết kế ghi chú trang trí'],
        answer: 0,
        explanation: 'Bắt đầu bằng việc xác định yêu cầu và điều kiện là cơ sở để đưa ra giải pháp đúng hướng.',
      },
      {
        id: 102,
        text: 'Bản vẽ kỹ thuật cần chứa thông tin nào để sản xuất đúng?',
        options: ['Kích thước, chiều, vật liệu và chú thích kỹ thuật', 'Chỉ có hình dạng sản phẩm', 'Một ảnh minh họa đẹp', 'Đơn giá và thời hạn giao hàng'],
        answer: 0,
        explanation: 'Bản vẽ kỹ thuật phải đầy đủ kích thước, vật liệu và ghi chú để thợ thi công hiểu chính xác.',
      },
      {
        id: 103,
        text: 'Phân tích chức năng của sản phẩm giúp gì trong thiết kế?',
        options: ['Xác định các yêu cầu kỹ thuật và phần tử cần hình thành', 'Chỉ để chọn màu sắc đẹp', 'Không cần trong học Công nghệ 10', 'Giúp quảng cáo sản phẩm'],
        answer: 0,
        explanation: 'Chức năng quyết định các yếu tố kỹ thuật và cấu tạo của sản phẩm.',
      },
      {
        id: 104,
        text: 'Tại sao phải đánh giá điều kiện sử dụng khi thiết kế sản phẩm?',
        options: ['Để chọn vật liệu và cấu tạo phù hợp', 'Để trang trí cho đẹp mắt', 'Để giảm giá thành tối đa', 'Để loại bỏ bản vẽ kỹ thuật'],
        answer: 0,
        explanation: 'Điều kiện sử dụng ảnh hưởng đến vật liệu, độ bền và tính năng của sản phẩm.',
      },
      {
        id: 105,
        text: 'Một sản phẩm chất lượng cần đáp ứng tiêu chí nào trong thiết kế?',
        options: ['An toàn, công năng và dễ sử dụng', 'Chỉ trông đẹp', 'Giá rẻ nhất có thể', 'Nhiều chi tiết phức tạp càng tốt'],
        answer: 0,
        explanation: 'Sản phẩm kỹ thuật tốt phải an toàn, đúng chức năng và thân thiện với người dùng.',
      },
    ],
  },
  {
    id: 'electrical',
    label: 'An toàn điện',
    description: 'Câu hỏi về điện dân dụng, an toàn lao động và chống giật trong thực hành.',
    questions: [
      {
        id: 201,
        text: 'Khi làm việc với mạch điện, điều gì là quan trọng nhất?',
        options: ['Ngắt nguồn trước khi sửa chữa hoặc kiểm tra', 'Chạm tay vào dây để kiểm tra', 'Đặt nước lên mạch để làm mát', 'Dùng kim loại để nối dây trực tiếp'],
        answer: 0,
        explanation: 'Ngắt nguồn giúp giảm nguy cơ điện giật và tai nạn khi thao tác mạch.',
      },
      {
        id: 202,
        text: 'Dụng cụ cách điện dùng để làm gì?',
        options: ['Ngăn dòng điện truyền qua cơ thể người', 'Làm mạch điện dẫn tốt hơn', 'Tăng hiệu suất máy móc', 'Thay thế công tắc điện'],
        answer: 0,
        explanation: 'Dụng cụ cách điện bảo vệ người vận hành khỏi tiếp xúc trực tiếp với điện.',
      },
      {
        id: 203,
        text: 'Nguyên tắc nào đúng khi chọn dây dẫn trong lắp đặt điện?',
        options: ['Chọn dây chịu dòng và nhiệt tốt, không chọn dây quá nhỏ', 'Chọn dây càng dài càng tốt', 'Chỉ cần dây nhìn đẹp', 'Dây mỏng là tốt nhất vì rẻ'],
        answer: 0,
        explanation: 'Dây dẫn phải phù hợp với dòng và công suất để tránh quá tải và cháy nổ.',
      },
      {
        id: 204,
        text: 'Khi xảy ra chập điện trong nhà, việc cần làm đầu tiên là gì?',
        options: ['Ngắt nguồn điện chính ngay lập tức', 'Dùng tay sờ vào dây để tìm điểm chập', 'Bật lại ngay để kiểm tra', 'Xịt nước vào ổ điện'],
        answer: 0,
        explanation: 'Ngắt nguồn giúp ngăn chặn cháy nổ và bảo vệ an toàn cho mọi người.',
      },
      {
        id: 205,
        text: 'Thiết bị bảo hộ cá nhân khi sửa điện gồm?',
        options: ['Găng tay cách điện, kính bảo hộ và giày cách điện', 'Quần áo bông ướt', 'Giày cao gót', 'Không cần bảo hộ nếu làm nhanh'],
        answer: 0,
        explanation: 'Bảo hộ phù hợp giúp giảm nguy cơ tai nạn khi làm việc với điện.',
      },
    ],
  },
  {
    id: 'materials',
    label: 'Vật liệu & sản xuất',
    description: 'Câu hỏi về tính chất vật liệu, công nghệ gia công và lựa chọn giải pháp thực hành.',
    questions: [
      {
        id: 301,
        text: 'Yếu tố nào quan trọng khi chọn vật liệu cho chi tiết cơ khí?',
        options: ['Tải trọng, môi trường và chi phí', 'Màu sắc yêu thích', 'Độ nặng lớn nhất', 'Giá bán cao nhất'],
        answer: 0,
        explanation: 'Vật liệu cần phù hợp với mục tiêu sử dụng, môi trường làm việc và ngân sách.',
      },
      {
        id: 302,
        text: 'Vật liệu composite thường được dùng vì lý do nào?',
        options: ['Nhẹ, bền và chống ăn mòn tốt', 'Rẻ hơn thép luôn', 'Đắt tiền nên đẹp', 'Dễ gia công bằng tay'],
        answer: 0,
        explanation: 'Composite kết hợp nhiều tính chất tốt như nhẹ, bền và chống ăn mòn.',
      },
      {
        id: 303,
        text: 'Trong sản xuất, gia công thô trước khi gia công tinh để làm gì?',
        options: ['Tạo hình gần đúng, sau đó hoàn thiện chính xác', 'Tiết kiệm công cụ bằng cách bỏ qua chi tiết', 'Tăng trọng lượng sản phẩm', 'Để sản phẩm thật thô và xấu'],
        answer: 0,
        explanation: 'Gia công thô loại bỏ vật liệu dư trước khi mài và hoàn thiện chi tiết.',
      },
      {
        id: 304,
        text: 'Tại sao phải đo kiểm sau khi gia công một chi tiết?',
        options: ['Kiểm tra kích thước, độ chính xác và chất lượng', 'Chỉ để trang trí sản phẩm', 'Không cần nếu đã gia công xong', 'Để biết tên người làm việc'],
        answer: 0,
        explanation: 'Đo kiểm xác nhận chi tiết đạt yêu cầu kỹ thuật trước khi lắp ráp.',
      },
      {
        id: 305,
        text: 'Công nghệ nào phù hợp để tạo chi tiết có hình dạng phức tạp?',
        options: ['Đúc hoặc in 3D', 'Cắt bằng tay không công cụ', 'Sơn phủ và bán', 'Nhiệt luyện mà không gia công'],
        answer: 0,
        explanation: 'Đúc và in 3D tạo được hình dạng phức tạp với ít bước gia công hơn.',
      },
    ],
  },
]

const getFeedbackTone = (score, total) => {
  if (score === total) return 'Xuất sắc!'
  if (score >= total - 1) return 'Rất tốt!'
  if (score >= Math.ceil(total / 2)) return 'Tạm ổn, cố gắng thêm nhé.'
  return 'Cần luyện thêm. Hãy xem lại phần kiến thức.'
}

export default function GameDemo() {
  const [activeChapterId, setActiveChapterId] = useState(gameChapters[0].id)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [finished, setFinished] = useState(false)

  const activeChapter = gameChapters.find((chapter) => chapter.id === activeChapterId) || gameChapters[0]
  const currentQuestion = activeChapter.questions[currentIndex]
  const totalQuestions = activeChapter.questions.length
  const progressPercent = Math.round((currentIndex / totalQuestions) * 100)
  const hasAnswered = selectedOption !== null

  useEffect(() => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setFinished(false)
    setScore(0)
  }, [activeChapterId])

  const optionClasses = (optionIndex) => {
    if (!hasAnswered) return 'rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-800 transition hover:border-slate-400 hover:bg-slate-50'
    if (optionIndex === currentQuestion.answer) return 'rounded-2xl border border-emerald-400 bg-emerald-50 p-4 text-left text-emerald-900'
    if (optionIndex === selectedOption) return 'rounded-2xl border border-rose-400 bg-rose-50 p-4 text-left text-rose-900'
    return 'rounded-2xl border border-slate-200 bg-white p-4 text-left text-slate-800/80'
  }

  const handleChoose = (optionIndex) => {
    if (hasAnswered) return
    setSelectedOption(optionIndex)
    if (optionIndex === currentQuestion.answer) {
      setScore((prev) => prev + 1)
    }
    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      setFinished(true)
      return
    }
    setCurrentIndex((prev) => prev + 1)
    setSelectedOption(null)
    setShowExplanation(false)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setScore(0)
    setShowExplanation(false)
    setFinished(false)
  }

  const summary = useMemo(() => getFeedbackTone(score, totalQuestions), [score, totalQuestions])

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Trò chơi demo"
        title="Quiz nhanh Công nghệ THPT"
        description="Chọn chương để làm bộ câu hỏi phù hợp với một chủ đề Công nghệ THPT cụ thể."
        action={<Link to="/practice-bank" className="primary-button">Về kho đề</Link>}
      />

      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          {gameChapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => setActiveChapterId(chapter.id)}
              className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                activeChapterId === chapter.id
                  ? 'border-sky-500 bg-sky-500 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              {chapter.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{activeChapter.description}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">{activeChapter.label}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">{currentQuestion.text}</h2>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700">Tiến độ {currentIndex + 1}/{totalQuestions}</div>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChoose(optionIndex)}
                className={optionClasses(optionIndex)}
                disabled={hasAnswered || finished}
              >
                {option}
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-500">Giải thích</p>
              <p className="mt-3 leading-7">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-600">Điểm hiện tại: <strong className="text-slate-950">{score}</strong></span>
            <button
              type="button"
              onClick={finished ? handleRestart : handleNext}
              className="primary-button"
            >
              {finished ? 'Chơi lại' : hasAnswered ? (currentIndex + 1 >= totalQuestions ? 'Kết thúc' : 'Câu tiếp theo') : 'Chọn đáp án trước'}
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">Tổng quan game</p>
            <h3 className="mt-3 text-2xl font-black">Hướng dẫn nhanh</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <li>Chọn chương trước khi bắt đầu làm câu hỏi.</li>
              <li>Chọn đáp án đúng cho mỗi câu.</li>
              <li>Xem lời giải sau khi trả lời.</li>
              <li>Hoàn thành vòng và thử lại để tăng điểm.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Kết quả dự kiến</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-sky-50 p-4 text-slate-900">
                <p className="text-sm font-bold">Hoàn thành</p>
                <p className="text-sm">Củng cố kiến thức theo chủ đề lựa chọn.</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-slate-900">
                <p className="text-sm font-bold">Phát triển</p>
                <p className="text-sm">Nắm được kiến thức thiết kế, vật liệu và an toàn điện.</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-slate-900">
                <p className="text-sm font-bold">Thử thách</p>
                <p className="text-sm">Hoàn thành đủ 5 câu để xem kết quả và học thêm.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Bảng xếp hạng cá nhân</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">Điểm tối đa: {totalQuestions} điểm. Hãy cố gắng đạt điểm cao nhất theo chương.</p>
            {finished && (
              <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-slate-900">
                <p className="font-black text-slate-950">{summary}</p>
                <p className="mt-2 text-sm">Số câu đúng: <strong>{score}/{totalQuestions}</strong></p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {finished && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">Bạn đã hoàn thành</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">{summary}</h2>
            </div>
            <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-4 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">Tổng điểm</p>
              <p className="mt-2 text-4xl font-black">{score}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/practice-bank" className="secondary-button inline-flex items-center gap-2">
              Đến kho đề <ArrowRight />
            </Link>
            <button type="button" onClick={handleRestart} className="primary-button">Chơi lại</button>
          </div>
        </div>
      )}
    </div>
  )
}
