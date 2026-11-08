import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { learningPaths } from '../data/courseCatalog'

const gradeFilters = [
  { id: 'all', label: 'Tất cả khối' },
  { id: 10, label: 'Công nghệ 10' },
  { id: 11, label: 'Công nghệ 11' },
  { id: 12, label: 'Công nghệ 12' },
]

const contests = [
  {
    id: 'tech-system-sprint',
    grade: 10,
    title: 'Đường đua hệ thống kĩ thuật',
    badge: 'CN10',
    color: 'from-sky-500 to-cyan-400',
    time: '10 phút',
    route: '/games',
    description:
      'Nhận diện công nghệ, đầu vào, xử lí, đầu ra, điều khiển và tiêu chí đánh giá công nghệ trong tình huống đời sống.',
    learningGoals: [
      'Phân tích được một hệ thống kĩ thuật theo các thành phần cơ bản.',
      'Giải thích được vai trò của công nghệ trong đời sống và sản xuất.',
      'Lựa chọn tiêu chí phù hợp khi đánh giá một công nghệ.',
    ],
    demoQuestion: {
      text: 'Khi phân tích một hệ thống kĩ thuật, cặp thành phần nào cần xác định trước?',
      options: ['Đầu vào và đầu ra', 'Màu sắc và giá bán', 'Tên hãng và bao bì', 'Kích thước trang trí'],
      answer: 'Đầu vào và đầu ra',
      explanation:
        'Đầu vào và đầu ra giúp xác định hệ thống nhận gì, tạo ra gì; sau đó mới phân tích khối xử lí và điều khiển.',
    },
  },
  {
    id: 'drawing-detective',
    grade: 10,
    title: 'Thám tử bản vẽ kĩ thuật',
    badge: 'CN10',
    color: 'from-indigo-500 to-blue-400',
    time: '12 phút',
    route: '/projection-practice',
    description:
      'Đọc hình chiếu, hình cắt, mặt cắt, bản vẽ cơ khí, bản vẽ xây dựng và chọn biểu diễn đúng chuẩn.',
    learningGoals: [
      'Đọc được thông tin chính trên bản vẽ kĩ thuật.',
      'Phân biệt được hình chiếu, hình cắt, mặt cắt và vai trò của từng loại hình biểu diễn.',
      'Nhận biết được yêu cầu trình bày bản vẽ theo tiêu chuẩn.',
    ],
    demoQuestion: {
      text: 'Khi vật thể có cấu tạo bên trong khó thấy bằng hình chiếu, nên dùng loại hình biểu diễn nào?',
      options: ['Hình cắt hoặc mặt cắt', 'Chỉ ghi chú bằng chữ', 'Tô màu vật thể', 'Bỏ qua phần khuất'],
      answer: 'Hình cắt hoặc mặt cắt',
      explanation:
        'Hình cắt và mặt cắt giúp biểu diễn cấu tạo bên trong rõ hơn khi hình chiếu thông thường chưa đủ thông tin.',
    },
  },
  {
    id: 'design-studio',
    grade: 10,
    title: 'Studio thiết kế kĩ thuật',
    badge: 'CN10',
    color: 'from-amber-500 to-orange-400',
    time: '15 phút',
    route: '/game-rooms',
    description:
      'Thi theo nhóm: xác định vấn đề, đề xuất phương án, chọn tiêu chí, tạo mẫu nhanh và nêu hướng cải tiến.',
    learningGoals: [
      'Vận dụng được quy trình thiết kế kĩ thuật vào tình huống gần gũi.',
      'Nêu được tiêu chí đánh giá giải pháp kĩ thuật.',
      'Biết cải tiến phương án dựa trên thử nghiệm và phản hồi.',
    ],
    demoQuestion: {
      text: 'Trong quy trình thiết kế kĩ thuật, vì sao cần thử nghiệm nguyên mẫu?',
      options: ['Để phát hiện lỗi và cải tiến', 'Để bỏ qua tiêu chí', 'Để không cần bản vẽ', 'Để kết thúc ngay dự án'],
      answer: 'Để phát hiện lỗi và cải tiến',
      explanation:
        'Thử nghiệm giúp kiểm tra giải pháp theo tiêu chí ban đầu, từ đó điều chỉnh trước khi hoàn thiện sản phẩm.',
    },
  },
  {
    id: 'mechanical-project-pitch',
    grade: 11,
    title: 'Pitch dự án cơ khí',
    badge: 'CN11',
    color: 'from-violet-500 to-fuchsia-400',
    time: '15 phút',
    route: '/game-rooms',
    description:
      'Thi trình bày dự án nghiên cứu cơ khí: vấn đề, mục tiêu, kế hoạch, mô hình thử, dữ liệu đo và cải tiến.',
    learningGoals: [
      'Xác định được vấn đề nghiên cứu trong lĩnh vực kĩ thuật cơ khí.',
      'Lập được kế hoạch triển khai dự án có tiêu chí, vật liệu, dụng cụ và an toàn.',
      'Báo cáo được kết quả bằng minh chứng kĩ thuật rõ ràng.',
    ],
    demoQuestion: {
      text: 'Một báo cáo dự án cơ khí đáng tin cậy cần có yếu tố nào?',
      options: ['Mục tiêu, tiêu chí, dữ liệu thử nghiệm', 'Chỉ có ảnh trang trí', 'Chỉ có tên nhóm', 'Không cần kết quả đo'],
      answer: 'Mục tiêu, tiêu chí, dữ liệu thử nghiệm',
      explanation:
        'Dự án cơ khí cần minh chứng bằng tiêu chí, quá trình thử nghiệm, số liệu hoặc nhận xét đo kiểm để đánh giá sản phẩm.',
    },
  },
  {
    id: 'cnc-flow-race',
    grade: 11,
    title: 'Đua chuỗi CAD/CAM-CNC',
    badge: 'CN11',
    color: 'from-slate-600 to-cyan-500',
    time: '12 phút',
    route: '/practice-bank',
    description:
      'Sắp xếp đúng chuỗi thiết kế số, lập trình CAM, mô phỏng, vận hành CNC và đo kiểm sản phẩm.',
    learningGoals: [
      'Giải thích được mối liên hệ CAD, CAM và CNC trong chế tạo cơ khí.',
      'Nhận biết được bộ phận chính và yêu cầu an toàn khi vận hành máy CNC.',
      'Mô tả được quy trình gia công CNC từ bản vẽ đến chi tiết đạt yêu cầu.',
    ],
    demoQuestion: {
      text: 'Thứ tự hợp lí trong chuỗi CAD/CAM-CNC là gì?',
      options: ['CAD → CAM → CNC → đo kiểm', 'CNC → CAD → đo kiểm → CAM', 'Đo kiểm → CNC → CAD → CAM', 'CAM → đo kiểm → CAD → CNC'],
      answer: 'CAD → CAM → CNC → đo kiểm',
      explanation:
        'CAD tạo dữ liệu thiết kế, CAM lập đường chạy dao, CNC gia công theo chương trình và đo kiểm xác nhận chất lượng.',
    },
  },
  {
    id: 'electric-safety-arena',
    grade: 12,
    title: 'Đấu trường an toàn điện',
    badge: 'CN12',
    color: 'from-rose-500 to-red-400',
    time: '10 phút',
    route: '/practice-bank',
    description:
      'Xử lí tình huống về mạng điện trong nhà: quá tải, ngắn mạch, rò điện, thiết bị bảo vệ và sơ cứu điện.',
    learningGoals: [
      'Nhận diện đúng dấu hiệu quá tải, ngắn mạch, rò điện và nguy cơ điện giật.',
      'Chọn đúng thao tác ưu tiên: ngắt nguồn, cô lập khu vực, dùng vật cách điện và báo người có trách nhiệm.',
      'Giải thích được vai trò của aptomat, cầu chì, thiết bị chống rò và nối đất bảo vệ.',
    ],
    demoQuestion: {
      text: 'Khi phát hiện người bị điện giật, thao tác đầu tiên cần làm là gì?',
      options: ['Ngắt nguồn điện nếu có thể', 'Chạm trực tiếp kéo người ra', 'Đổ nước vào thiết bị', 'Tiếp tục dùng thiết bị'],
      answer: 'Ngắt nguồn điện nếu có thể',
      explanation:
        'Cần bảo đảm an toàn cho người cứu trước, ngắt nguồn hoặc tách nạn nhân khỏi nguồn điện bằng vật cách điện phù hợp.',
    },
  },
  {
    id: 'electronics-logic-quest',
    grade: 12,
    title: 'Nhiệm vụ mạch điện tử số',
    badge: 'CN12',
    color: 'from-emerald-500 to-teal-400',
    time: '12 phút',
    route: '/lessons/120801/circuit-lab',
    description:
      'Hoàn thành sơ đồ khối hệ thống điện tử số: cảm biến, chuẩn hóa tín hiệu, cổng logic, vi điều khiển, đầu ra và phản hồi.',
    learningGoals: [
      'Phân biệt được tín hiệu tương tự, tín hiệu số và mức logic 0/1.',
      'Thiết lập được điều kiện logic AND/OR/NOT cho một tình huống báo động hoặc điều khiển.',
      'Mô tả được luồng tín hiệu từ cảm biến đến vi điều khiển, driver, đầu ra và phản hồi.',
    ],
    demoQuestion: {
      text: 'Trong mạch báo cháy dùng cổng logic, tín hiệu từ cảm biến khói và cảm biến nhiệt thường được đưa vào khối nào trước khi kích còi?',
      options: ['Khối xử lí logic', 'Khối trang trí', 'Khối cơ khí thuần túy', 'Khối nguồn lưới 220 V trực tiếp'],
      answer: 'Khối xử lí logic',
      explanation:
        'Cảm biến tạo tín hiệu đầu vào; khối xử lí logic hoặc vi điều khiển kiểm tra điều kiện rồi mới điều khiển còi, đèn hoặc rơle.',
    },
  },
]

const rules = [
  'Mỗi cuộc thi gắn với một mục tiêu học tập cụ thể, không chỉ tính điểm nhanh.',
  'Điểm ưu tiên câu trả lời đúng, giải thích đúng thuật ngữ và biết liên hệ với sơ đồ hoặc tình huống thực tế.',
  'Sau mỗi lượt thi, học sinh quay lại bài học hoặc kho đề của đúng khối để ôn phần còn yếu.',
]

const getPathTitle = (grade) =>
  learningPaths.find((path) => path.grade_level === grade)?.title || `Công nghệ ${grade}`

export default function FunContests() {
  const [activeGrade, setActiveGrade] = useState('all')
  const [activeContestId, setActiveContestId] = useState(contests[0].id)

  const filteredContests = useMemo(
    () => (activeGrade === 'all' ? contests : contests.filter((contest) => contest.grade === Number(activeGrade))),
    [activeGrade]
  )

  const activeContest = filteredContests.find((contest) => contest.id === activeContestId) || filteredContests[0] || contests[0]

  const selectGrade = (gradeId) => {
    setActiveGrade(gradeId)
    const nextContest = gradeId === 'all' ? contests[0] : contests.find((contest) => contest.grade === Number(gradeId))
    setActiveContestId(nextContest?.id || contests[0].id)
  }

  return (
    <div className="page-container">
      <section className="mb-6 overflow-hidden rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 p-6 text-slate-950 shadow-2xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sky-700">EngineLab challenge</p>
            <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Cuộc thi vui Công nghệ theo SGK Kết nối tri thức</h1>
            <p className="mt-4 max-w-3xl text-base font-bold leading-7 text-slate-700">
              Mỗi thử thách được thiết kế theo mục tiêu bài học: hiểu khái niệm, đọc sơ đồ, giải thích quy trình và vận dụng vào tình huống kĩ thuật.
            </p>
          </div>
          <div className="grid gap-3 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-lg backdrop-blur">
            {gradeFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => selectGrade(filter.id)}
                className={`rounded-xl px-4 py-3 text-left text-sm font-black transition ${
                  activeGrade === filter.id ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-md' : 'bg-white text-slate-700 shadow-sm hover:bg-sky-50 hover:text-sky-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 grid gap-4 lg:grid-cols-3">
        {filteredContests.map((contest) => (
          <button
            key={contest.id}
            type="button"
            onClick={() => setActiveContestId(contest.id)}
            className={`rounded-2xl border bg-white p-5 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl ${
              activeContest.id === contest.id ? 'border-indigo-400 ring-4 ring-indigo-100' : 'border-slate-200'
            }`}
          >
            <div className={`mb-4 inline-flex h-12 items-center rounded-xl bg-gradient-to-br px-4 text-sm font-black text-white shadow-md ${contest.color}`}>
              {contest.badge}
            </div>
            <h2 className="text-xl font-black text-slate-950">{contest.title}</h2>
            <p className="mt-2 text-sm font-bold text-indigo-600">{getPathTitle(contest.grade)} · {contest.time}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{contest.description}</p>
          </button>
        ))}
      </section>

      <section className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-cyan-50 p-6 shadow-lg">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Mục tiêu cuộc thi</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{activeContest.title}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-3">
              {activeContest.learningGoals.map((goal) => (
                <li key={goal} className="rounded-xl bg-white p-4 text-sm font-bold leading-6 text-slate-700 shadow-sm">
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link to={activeContest.route} className="primary-button">Bắt đầu thử thách</Link>
            <Link to="/practice-bank" className="secondary-button">Mở kho đề</Link>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <main className="panel p-6">
          <p className="muted-label text-indigo-600">Câu hỏi mẫu</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{activeContest.demoQuestion.text}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {activeContest.demoQuestion.options.map((option) => (
              <div
                key={option}
                className={`rounded-xl border p-4 text-sm font-bold ${
                  option === activeContest.demoQuestion.answer
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {option}
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <span className="font-black text-emerald-700">Đáp án:</span> {activeContest.demoQuestion.answer}. {activeContest.demoQuestion.explanation}
          </p>
        </main>

        <aside className="space-y-6">
          <section className="panel p-5">
            <h2 className="text-xl font-black text-slate-950">Thể lệ sư phạm</h2>
            <div className="mt-4 space-y-3">
              {rules.map((rule, index) => (
                <div key={rule} className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">
                  {index + 1}. {rule}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sky-950 shadow-sm">
            <h2 className="font-black">Gợi ý tổ chức trên lớp</h2>
            <ul className="mt-3 space-y-2 text-sm font-semibold leading-6">
              <li>Chọn đúng khối đang học trước khi thi.</li>
              <li>Cho học sinh giải thích vì sao chọn đáp án, không chỉ chọn nhanh.</li>
              <li>Sau cuộc thi, chuyển sang kho đề cùng khối để củng cố mục tiêu bài học.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
