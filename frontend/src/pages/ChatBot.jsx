import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSampleLesson } from '../data/courseCatalog'
import { chatAPI } from '../services/api'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const normalizeVietnamese = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

const hasAnyKeyword = (text, keywords) =>
  keywords.some((keyword) => text.includes(normalizeVietnamese(keyword)))

const compactReply = (title, points, closing = 'Em có thể hỏi tiếp một ví dụ cụ thể để trợ lý giải thích sâu hơn.') =>
  `${title}\n${points.map((point, index) => `${index + 1}. ${point}`).join('\n')}\n\n${closing}`

const buildGeneralMechanicsReply = (text, lesson) => {
  if (hasAnyKeyword(text, ['vai tro', 'vai trò', 'tac dung', 'ung dung', 'de lam gi', 'co vai tro gi'])) {
    return compactReply('Vai trò của cơ khí chế tạo:', [
      'Tạo ra chi tiết, cụm chi tiết, máy và thiết bị phục vụ sản xuất và đời sống.',
      'Là nền tảng của nhiều ngành như giao thông, nông nghiệp, xây dựng, công nghiệp chế biến và tự động hóa.',
      'Góp phần tăng năng suất lao động, nâng cao chất lượng sản phẩm và hỗ trợ hiện đại hóa sản xuất.',
    ], 'Ví dụ: xe đạp, máy bơm, máy tiện, động cơ, robot công nghiệp đều có nhiều sản phẩm cơ khí bên trong.')
  }

  if (hasAnyKeyword(text, ['san pham co khi', 'sản phẩm cơ khí', 'chi tiet', 'cum chi tiet', 'may va thiet bi'])) {
    return compactReply('Sản phẩm cơ khí được hiểu theo 3 mức:', [
      'Chi tiết máy: một phần tử có cấu tạo hoàn chỉnh, ví dụ trục, bánh răng, bu lông.',
      'Cụm chi tiết: nhiều chi tiết lắp ghép để thực hiện một chức năng, ví dụ bộ truyền xích, hộp số.',
      'Máy hoặc thiết bị: hệ thống hoàn chỉnh thực hiện công việc, ví dụ máy khoan, máy tiện, ô tô.',
    ], 'Khi phân tích sản phẩm cơ khí, em nên nêu: tên sản phẩm, công dụng, các bộ phận chính và yêu cầu kĩ thuật.')
  }

  if (hasAnyKeyword(text, ['quy trinh', 'quy trình', 'tao san pham', 'chế tạo', 'che tao', 'cac buoc', 'các bước'])) {
    return compactReply('Quy trình chung tạo sản phẩm cơ khí:', [
      'Xác định yêu cầu của sản phẩm: công dụng, kích thước, độ bền, độ chính xác, an toàn.',
      'Thiết kế: lập ý tưởng, tính toán, vẽ kĩ thuật hoặc mô phỏng.',
      'Chọn vật liệu phù hợp với điều kiện làm việc và khả năng gia công.',
      'Gia công, lắp ráp các chi tiết theo quy trình công nghệ.',
      'Kiểm tra chất lượng trước khi đưa vào sử dụng.',
    ], 'Ý trọng tâm: không nên gia công khi chưa có yêu cầu và bản vẽ rõ ràng.')
  }

  if (hasAnyKeyword(text, ['nghe', 'nghề', 'nganh nghe', 'ngành nghề', 'cong viec', 'công việc'])) {
    return compactReply('Một số nghề trong lĩnh vực cơ khí:', [
      'Thiết kế cơ khí: lập ý tưởng, bản vẽ, mô phỏng và tính toán sản phẩm.',
      'Gia công cơ khí: tiện, phay, khoan, mài, hàn, vận hành máy CNC.',
      'Lắp ráp, kiểm tra chất lượng, bảo dưỡng và sửa chữa thiết bị cơ khí.',
    ], 'Người học nghề cơ khí cần đọc được bản vẽ, hiểu vật liệu, đo kiểm chính xác và tuân thủ an toàn.')
  }

  if (lesson?.id === 101 || lesson?.id === 102) {
    return compactReply(`Trọng tâm bài "${lesson.title}":`, lesson.key_points || [
      'Cơ khí chế tạo tạo ra chi tiết, cụm chi tiết, máy và thiết bị.',
      'Sản phẩm cơ khí cần đáp ứng công dụng, độ bền, độ chính xác, tính kinh tế và an toàn.',
      'Quy trình tạo sản phẩm gồm xác định yêu cầu, thiết kế, chọn vật liệu, gia công, lắp ráp và kiểm tra.',
    ], 'Em hỏi rõ “vai trò”, “sản phẩm”, “quy trình” hoặc “nghề cơ khí” thì trợ lý sẽ trả lời đúng ý hơn.')
  }

  return null
}

const buildMaterialAndManufacturingReply = (text, lesson) => {
  if (hasAnyKeyword(text, ['vat lieu', 'vật liệu', 'thep', 'gang', 'cao su', 'composite', 'chon vat lieu'])) {
    return compactReply('Khi chọn vật liệu cơ khí cần xét:', [
      'Công dụng và điều kiện làm việc của chi tiết: tải trọng, ma sát, nhiệt độ, môi trường.',
      'Tính chất vật liệu: độ bền, độ cứng, độ dẻo, chống mài mòn, chống ăn mòn.',
      'Khả năng gia công, khối lượng, giá thành và mức độ an toàn.',
    ], 'Ví dụ: trục chịu lực thường ưu tiên thép; chi tiết giảm chấn có thể dùng cao su; chi tiết nhẹ, bền có thể dùng composite.')
  }

  if (hasAnyKeyword(text, ['duc', 'đúc', 'han', 'hàn', 'tien', 'tiện', 'phay', 'khoan', 'mai', 'mài', 'cat got', 'cắt gọt', 'gia cong'])) {
    return compactReply('Các phương pháp gia công cơ khí thường gặp:', [
      'Đúc: tạo phôi hoặc chi tiết có hình dạng phức tạp.',
      'Hàn: liên kết các chi tiết kim loại.',
      'Gia công áp lực: dùng lực làm biến dạng phôi như rèn, dập, cán.',
      'Cắt gọt như tiện, phay, khoan, mài: tạo kích thước chính xác và bề mặt đạt yêu cầu.',
    ], 'Chọn phương pháp gia công phải dựa vào hình dạng chi tiết, vật liệu, độ chính xác và số lượng sản phẩm.')
  }

  if ((lesson?.id === 201 || lesson?.id === 202) && lesson?.key_points?.length) {
    return compactReply(`Trọng tâm bài "${lesson.title}":`, lesson.key_points, 'Em có thể hỏi cụ thể về vật liệu hoặc phương pháp gia công để nhận câu trả lời ngắn hơn.')
  }

  return null
}

const suggestedQuestions = [
  'Công nghệ khác kĩ thuật ở điểm nào?',
  'Hệ thống kĩ thuật gồm những phần nào?',
  'Khi nào cần dùng hình cắt trong bản vẽ kĩ thuật?',
  'Quy trình thiết kế kĩ thuật gồm những bước nào?',
]

const buildTutorReply = (message, lesson) => {
  const text = normalizeVietnamese(message)

  if (!text.trim()) {
      return 'Em hãy nhập câu hỏi về Công nghệ 10. Ví dụ: "Hệ thống kĩ thuật gồm gì?", "Khi nào dùng hình cắt?" hoặc "Quy trình thiết kế gồm những bước nào?".'
  }

  if (hasAnyKeyword(text, ['cong nghe', 'ky thuat', 'doi song', 'dai cuong'])) {
    return compactReply('Cách hiểu nhanh về công nghệ trong đời sống:', [
      'Công nghệ là giải pháp, quy trình, tri thức và phương tiện được tạo ra để giải quyết nhu cầu thực tiễn.',
      'Kĩ thuật thiên về vận dụng nguyên lí khoa học để thiết kế, chế tạo, vận hành và tối ưu hệ thống.',
      'Khi học bài này, nên luôn hỏi: công nghệ giải quyết nhu cầu nào, dùng nguồn lực nào và tác động ra sao.',
    ])
  }

  if (hasAnyKeyword(text, ['he thong ky thuat', 'dau vao', 'xu li', 'dau ra', 'dieu khien'])) {
    return compactReply('Một hệ thống kĩ thuật nên phân tích theo 4 phần:', [
      'Đầu vào: vật chất, năng lượng hoặc thông tin đi vào hệ thống.',
      'Xử lí: các bộ phận, quy trình hoặc thuật toán biến đổi đầu vào.',
      'Đầu ra: sản phẩm, chuyển động, tín hiệu hoặc kết quả hệ thống tạo ra.',
      'Điều khiển: phần giám sát, phản hồi và điều chỉnh để hệ thống làm việc đúng.',
    ])
  }

  if (hasAnyKeyword(text, ['ban ve', 'hinh chieu', 'hinh cat', 'mat cat', 'cad', 've ky thuat'])) {
    return compactReply('Cách học nhanh chương Vẽ kĩ thuật:', [
      'Trước hết quan sát vật thể và chọn hướng chiếu thể hiện rõ hình dạng nhất.',
      'Dùng hình cắt hoặc mặt cắt khi cần thể hiện cấu tạo bên trong mà hình chiếu thường chưa đủ rõ.',
      'CAD giúp tạo và sửa bản vẽ nhanh, nhưng vẫn phải đúng khổ giấy, nét vẽ, tỉ lệ, chữ viết và ghi kích thước.',
    ])
  }

  if (hasAnyKeyword(text, ['thiet ke', 'quy trinh thiet ke', 'nguyen mau', 'cai tien', 'tieu chi'])) {
    return compactReply('Quy trình thiết kế kĩ thuật có thể nhớ theo vòng lặp:', [
      'Xác định vấn đề, nhu cầu, ràng buộc và tiêu chí đánh giá.',
      'Nghiên cứu thông tin, đề xuất nhiều ý tưởng và chọn phương án khả thi.',
      'Tạo mô hình hoặc nguyên mẫu, thử nghiệm theo tiêu chí rồi cải tiến.',
    ], 'Điểm quan trọng: thiết kế kĩ thuật không kết thúc ở ý tưởng đầu tiên; cần thử, đo, sửa và hoàn thiện.')
  }

  const generalMechanicsReply = buildGeneralMechanicsReply(text, lesson)
  if (generalMechanicsReply) return generalMechanicsReply

  const materialAndManufacturingReply = buildMaterialAndManufacturingReply(text, lesson)
  if (materialAndManufacturingReply) return materialAndManufacturingReply

  if (hasAnyKeyword(text, ['4 kỳ', 'bốn kỳ', 'chu trình', 'nguyên lý làm việc', 'nạp nén nổ xả'])) {
    return 'Động cơ 4 kỳ hoàn thành một chu trình sau 4 hành trình piston, tương ứng 2 vòng quay trục khuỷu. Thứ tự đúng là: kỳ nạp, kỳ nén, kỳ cháy - giãn nở, kỳ thải. Kỳ cháy - giãn nở là kỳ sinh công vì khí cháy đẩy piston đi xuống, qua thanh truyền làm quay trục khuỷu.'
  }

  if (hasAnyKeyword(text, ['kỳ nạp', 'nạp khí'])) {
    return 'Ở kỳ nạp, piston đi từ điểm chết trên xuống điểm chết dưới. Xupap nạp mở, xupap thải đóng. Không khí hoặc hòa khí được hút vào xi lanh để chuẩn bị cho kỳ nén.'
  }

  if (hasAnyKeyword(text, ['kỳ nén', 'nén'])) {
    return 'Ở kỳ nén, piston đi từ điểm chết dưới lên điểm chết trên. Cả hai xupap đều đóng, môi chất trong xi lanh bị nén lại nên áp suất và nhiệt độ tăng.'
  }

  if (hasAnyKeyword(text, ['kỳ cháy', 'giãn nở', 'sinh công', 'kỳ nổ'])) {
    return 'Kỳ cháy - giãn nở là kỳ sinh công. Nhiên liệu cháy làm khí trong xi lanh giãn nở mạnh, đẩy piston đi xuống. Lực này truyền qua thanh truyền tới trục khuỷu và tạo mô-men quay.'
  }

  if (hasAnyKeyword(text, ['kỳ thải', 'xả khí', 'khí thải'])) {
    return 'Ở kỳ thải, piston đi từ điểm chết dưới lên điểm chết trên. Xupap thải mở, xupap nạp đóng. Khí đã cháy được đẩy ra ngoài để chuẩn bị cho chu trình mới.'
  }

  if (hasAnyKeyword(text, ['piston', 'pit tông', 'pit-tông'])) {
    return 'Piston chuyển động tịnh tiến trong xi lanh và nhận lực trực tiếp từ khí cháy. Sau đó piston truyền lực cho thanh truyền. Có thể nhớ: piston là chi tiết nhận lực sinh công đầu tiên.'
  }

  if (hasAnyKeyword(text, ['thanh truyền', 'tay biên'])) {
    return 'Thanh truyền nối piston với trục khuỷu. Nhiệm vụ của thanh truyền là truyền lực từ piston xuống trục khuỷu và giúp biến chuyển động tịnh tiến thành chuyển động quay.'
  }

  if (hasAnyKeyword(text, ['trục khuỷu'])) {
    return 'Trục khuỷu nhận lực từ thanh truyền và tạo chuyển động quay. Đây là chi tiết đưa công cơ học của động cơ ra ngoài để truyền tới máy công tác hoặc hệ truyền động.'
  }

  if (hasAnyKeyword(text, ['xupap', 'xu pap', 'van', 'phân phối khí', 'trục cam'])) {
    return 'Cơ cấu phân phối khí điều khiển xupap nạp và xupap thải đóng mở đúng thời điểm. Xupap nạp mở chủ yếu ở kỳ nạp, xupap thải mở chủ yếu ở kỳ thải. Nếu sai thời điểm, động cơ nạp không đủ, thải không sạch và giảm công suất.'
  }

  if (hasAnyKeyword(text, ['bôi trơn', 'dầu', 'ma sát', 'mài mòn'])) {
    return 'Hệ thống bôi trơn đưa dầu đến các bề mặt ma sát để giảm ma sát, giảm mài mòn, làm mát một phần và cuốn trôi cặn bẩn. Nếu thiếu dầu, chi tiết dễ nóng, mòn nhanh hoặc bó kẹt.'
  }

  if (hasAnyKeyword(text, ['làm mát', 'quá nhiệt', 'két nước', 'nước làm mát'])) {
    return 'Hệ thống làm mát lấy bớt nhiệt từ xi lanh, nắp máy và các chi tiết nóng để giữ động cơ ở nhiệt độ làm việc phù hợp. Làm mát kém có thể làm động cơ quá nhiệt, giảm công suất và nhanh hỏng.'
  }

  if (hasAnyKeyword(text, ['nhiên liệu', 'không khí', 'hòa khí', 'phun xăng', 'phun dầu'])) {
    return 'Hệ thống cung cấp nhiên liệu và không khí bảo đảm động cơ có đủ chất cháy và oxy. Động cơ xăng thường tạo hòa khí rồi dùng bugi đánh lửa; động cơ điêzen nén không khí đến nhiệt độ cao rồi phun nhiên liệu để tự bốc cháy.'
  }

  if (hasAnyKeyword(text, ['bugi', 'đánh lửa', 'tia lửa'])) {
    return 'Hệ thống đánh lửa dùng trong động cơ xăng. Bugi tạo tia lửa điện gần cuối kỳ nén để đốt cháy hòa khí. Đánh lửa đúng thời điểm giúp động cơ sinh công mạnh và ổn định.'
  }

  if (hasAnyKeyword(text, ['khởi động', 'máy đề', 'đề máy'])) {
    return 'Hệ thống khởi động làm quay trục khuỷu ban đầu để động cơ bắt đầu chu trình làm việc. Khi động cơ đã tự nổ và duy trì chu trình, máy khởi động ngừng làm việc.'
  }

  if (hasAnyKeyword(text, ['xăng', 'điêzen', 'diesel', 'so sánh'])) {
    return 'Động cơ xăng thường nén hòa khí rồi dùng bugi đánh lửa. Động cơ điêzen nén không khí đến nhiệt độ cao, sau đó phun nhiên liệu vào để tự bốc cháy. Vì vậy điêzen thường không cần bugi đánh lửa như động cơ xăng.'
  }

  if (hasAnyKeyword(text, ['kiểm tra', 'quiz', 'ôn tập', 'ghi nhớ'])) {
    return 'Cách ghi nhớ nhanh: với mỗi bộ phận, em trả lời 3 câu: nhiệm vụ là gì, hoạt động ở thời điểm nào trong chu trình, nếu hỏng thì động cơ bị ảnh hưởng ra sao. Sau đó làm bài kiểm tra nhanh để tự đánh giá.'
  }

  if (lesson?.key_points?.length) {
    return `Với bài "${lesson.title}", em cần bám vào các ý chính sau:\n${lesson.key_points
      .map((point, index) => `${index + 1}. ${point}`)
      .join('\n')}\n\nEm có thể hỏi cụ thể một bộ phận hoặc một kỳ để trợ lý giải thích ngắn gọn hơn.`
  }

  return 'Trợ lý học tập có thể trả lời về: công nghệ và đời sống, hệ thống kĩ thuật, công nghệ mới, đánh giá công nghệ, bản vẽ kĩ thuật, hình chiếu, hình cắt, CAD và quy trình thiết kế kĩ thuật.'
}

export default function ChatBot() {
  const { lessonId } = useParams()
  const user = useAuthStore((state) => state.user)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState({ configured: false, provider: 'Gemini', model: '', available: false })
  const lesson = getSampleLesson(lessonId)
  const messagesEndRef = useRef(null)

  const welcomeMessage = useMemo(
    () =>
      lesson
        ? `Trợ lý đang hỗ trợ bài "${lesson.title}". Em có thể hỏi về nguyên lý, cấu tạo, hệ thống hoặc cách ghi nhớ.`
        : 'Em có thể hỏi trợ lý về động cơ đốt trong và các hệ thống liên quan.',
    [lesson],
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let active = true
    chatAPI.status()
      .then((response) => {
        if (active) setAiStatus({ ...response.data, available: true })
      })
      .catch(() => {
        if (active) setAiStatus({ configured: false, provider: 'Gemini', model: '', available: false })
      })
    return () => { active = false }
  }, [])

  const sendMessage = async (question) => {
    const cleanQuestion = question.trim()
    if (!cleanQuestion || isLoading) return

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        text: cleanQuestion,
        sender: 'user',
      },
    ])
    setInputValue('')
    setIsLoading(true)
    const localEvent = recordLocalLearningEvent(user?.id, {
      lesson_id: Number(lessonId),
      event_type: 'assistant_question',
      duration_seconds: 45,
      payload: { question: cleanQuestion },
      auto_sync: false,
    })

    try {
      const response = await chatAPI.message(user?.id, {
        lesson_id: Number(lessonId),
        session_id: `lesson-${lessonId}`,
        user_message: cleanQuestion,
        client_event_id: localEvent?.client_event_id,
      })
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          text: response.data?.ai_response || buildTutorReply(cleanQuestion, lesson),
          sender: 'assistant',
          mode: response.data?.response_mode || 'fallback',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          text: buildTutorReply(cleanQuestion, lesson),
          sender: 'assistant',
          mode: 'offline',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = (event) => {
    event.preventDefault()
    sendMessage(inputValue)
  }

  return (
    <div className="nova-ai-page min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
        <div className="nova-ai-hero mb-4 rounded-lg border border-violet-200 bg-violet-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="muted-label">EngineLab AI Assistant</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              aiStatus.configured && aiStatus.available
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {aiStatus.configured && aiStatus.available
                ? `AI thật: ${aiStatus.provider} ${aiStatus.model}`
                : 'Chế độ dự phòng an toàn'}
            </span>
            <h1 className="text-3xl font-bold text-violet-950">AI gia sư Công nghệ 10</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-violet-900">{welcomeMessage}</p>
          </div>
          <div className="flex gap-2">
            {lessonId && (
              <Link to={`/lessons/${lessonId}`} className="secondary-button">
                Quay lại bài học
              </Link>
            )}
            {lessonId && (
              <Link to={`/lessons/${lessonId}/quiz`} className="primary-button">
                Kiểm tra nhanh
              </Link>
            )}
          </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-violet-900 shadow-sm">Hỏi AI về công nghệ</div>
            <div className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-violet-900 shadow-sm">AI gợi ý lỗi sai</div>
            <div className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-violet-900 shadow-sm">AI giải thích quy trình</div>
          </div>
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_320px]">
          <section className="nova-chat-panel panel flex min-h-[620px] flex-col overflow-hidden p-0">
            <div className="border-b border-slate-200 bg-white px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-950">Phiên hỏi đáp</h2>
              <p className="text-base leading-7 text-slate-600">
                Trợ lý trả lời theo nội dung Công nghệ 10, ưu tiên giải thích ngắn gọn và đúng trọng tâm.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
              {messages.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
                  <p className="text-lg font-semibold text-slate-900">Bắt đầu bằng một câu hỏi</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Ví dụ: hỏi về hệ thống kĩ thuật, hình chiếu, hình cắt, CAD, tiêu chí đánh giá hoặc quy trình thiết kế.
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] whitespace-pre-line rounded-lg px-4 py-3 text-base leading-7 shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      {msg.text}
                      {msg.sender === 'assistant' && msg.mode && (
                        <span className="mt-2 block text-[11px] font-bold uppercase tracking-wide opacity-60">
                          {msg.mode === 'gemini' ? 'Gemini AI' : msg.mode === 'offline' ? 'Ngoại tuyến' : 'Phản hồi dự phòng'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isLoading && (
                <div className="mt-4 flex justify-start">
                  <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                    Trợ lý đang phân tích câu hỏi...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="nova-chat-composer border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  placeholder="Hỏi AI về công nghệ, bản vẽ, CAD, quy trình thiết kế hoặc tiêu chí đánh giá..."
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !inputValue.trim()} className="primary-button">
                  Gửi
                </button>
              </div>
            </form>
          </section>

          <aside className="nova-ai-sidebar space-y-4">
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 shadow-sm">
              <h2 className="font-semibold text-violet-950">Câu hỏi gợi ý</h2>
              <div className="mt-3 space-y-2">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => sendMessage(question)}
                    className="w-full rounded-lg border border-violet-100 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-violet-400 hover:bg-violet-100"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h2 className="font-semibold text-blue-950">Mẹo hỏi để được trả lời đúng</h2>
              <ul className="mt-3 space-y-2 text-sm text-blue-900">
                <li>Hỏi rõ khái niệm: công nghệ, kĩ thuật, hệ thống kĩ thuật.</li>
                <li>Hỏi rõ biểu diễn: hình chiếu, hình cắt, mặt cắt, CAD.</li>
                <li>Hỏi theo quy trình: xác định vấn đề, chọn phương án, thử nghiệm, cải tiến.</li>
              </ul>
            </div>

            <div className="panel">
              <h2 className="font-semibold text-slate-950">Bài đang học</h2>
              <p className="mt-2 text-sm font-medium text-slate-800">{lesson?.title || 'Động cơ đốt trong'}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Trợ lý ưu tiên trả lời đúng trọng tâm bài học, sau đó liên hệ sang mô hình 3D và bài kiểm tra nhanh.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
