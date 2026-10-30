// Content for the engineering design studio, following the design process in
// Công nghệ 10, Chương III (Bài 17–21): the process is iterative, so students can
// move back from testing to earlier steps at any time.

export const designSteps = [
  {
    id: 'problem',
    number: 1,
    title: 'Xác định vấn đề & tiêu chí',
    short: 'Vấn đề',
    goal: 'Mô tả rõ nhu cầu cần giải quyết, ai sử dụng, trong điều kiện nào và sản phẩm phải đạt những tiêu chí gì.',
    hints: [
      'Viết vấn đề theo mẫu: “[Ai] cần [làm gì] vì [lí do], nhưng hiện tại [khó khăn]”.',
      'Tiêu chí phải đo hoặc kiểm tra được, ví dụ “chịu được 500 g” thay vì “chắc chắn”.',
      'Đặt trọng số 1–5 cho từng tiêu chí: tiêu chí quan trọng nhất nhận 5.',
      'Ràng buộc là giới hạn bắt buộc: thời gian, chi phí, vật liệu, dụng cụ có sẵn.',
    ],
  },
  {
    id: 'solutions',
    number: 2,
    title: 'Tìm hiểu & lựa chọn giải pháp',
    short: 'Giải pháp',
    goal: 'Tìm hiểu các sản phẩm, nguyên lí đã có, đề xuất ít nhất hai phương án và chọn phương án tốt nhất dựa trên tiêu chí.',
    hints: [
      'Quan sát sản phẩm tương tự ngoài thực tế hoặc trên mạng: chúng giải quyết vấn đề thế nào, còn hạn chế gì?',
      'Đề xuất nhiều phương án khác nhau trước khi đánh giá — đừng chọn ngay ý tưởng đầu tiên.',
      'Chấm điểm 1–5 từng phương án theo từng tiêu chí; điểm cuối = tổng (điểm × trọng số).',
      'Có thể chọn phương án khác phương án điểm cao nhất, nhưng cần ghi rõ lí do.',
    ],
  },
  {
    id: 'prototype',
    number: 3,
    title: 'Xây dựng nguyên mẫu',
    short: 'Nguyên mẫu',
    goal: 'Phác thảo hình dáng, lập bảng vật liệu, các bước chế tạo và kiểm tra an toàn trước khi làm mẫu.',
    hints: [
      'Bản phác thảo cần thể hiện hình dáng và kích thước chính (đơn vị mm).',
      'Bảng vật liệu giúp chuẩn bị đủ đồ trước khi làm và ước tính chi phí.',
      'Liệt kê các bước chế tạo theo thứ tự; bước nào cần dụng cụ nguy hiểm thì ghi chú cần người lớn hỗ trợ.',
      'Nguyên mẫu có thể làm bằng vật liệu rẻ (bìa, que kem) để thử ý tưởng trước khi làm bản hoàn chỉnh.',
    ],
  },
  {
    id: 'testing',
    number: 4,
    title: 'Thử nghiệm, đánh giá & cải tiến',
    short: 'Thử nghiệm',
    goal: 'Kiểm tra nguyên mẫu theo từng tiêu chí, ghi lại kết quả đo được và đề xuất cải tiến.',
    hints: [
      'Mỗi tiêu chí cần ít nhất một phép thử với cách thực hiện rõ ràng để người khác làm lại được.',
      'Ghi kết quả bằng số liệu khi có thể: khối lượng chịu được, thời gian, góc nghiêng…',
      'Tiêu chí chưa đạt là thông tin quý: ghi lại nguyên nhân và quay lại bước 2 hoặc 3 để cải tiến.',
      'Mỗi lần cải tiến là một vòng lặp — ghi lại để thấy sản phẩm tiến bộ qua từng phiên bản.',
    ],
  },
  {
    id: 'dossier',
    number: 5,
    title: 'Lập hồ sơ kĩ thuật',
    short: 'Hồ sơ',
    goal: 'Tổng hợp toàn bộ quá trình thành hồ sơ kĩ thuật để trình bày, nộp cho giáo viên hoặc người khác chế tạo lại.',
    hints: [
      'Hồ sơ được tạo tự động từ các bước trước — hãy kiểm tra lại nội dung trước khi in.',
      'Phần tóm tắt nêu ngắn gọn: sản phẩm là gì, giải quyết vấn đề gì, kết quả thử nghiệm ra sao.',
      'Phần tự đánh giá nêu điều nhóm học được và điều sẽ làm khác nếu làm lại.',
      'Bấm “In / lưu PDF” rồi chọn “Lưu dưới dạng PDF” để nộp bài.',
    ],
  },
]

export const safetyChecklist = [
  { id: 'tools', label: 'Đã được hướng dẫn cách dùng dụng cụ cắt (dao rọc giấy, cưa, kéo) và luôn cắt hướng ra xa cơ thể.' },
  { id: 'glue', label: 'Dùng súng bắn keo nến trên bề mặt chịu nhiệt, không chạm vào đầu súng và keo nóng.' },
  { id: 'electric', label: 'Nếu có mạch điện: chỉ dùng nguồn pin/điện áp thấp, ngắt nguồn khi lắp hoặc sửa mạch.' },
  { id: 'protect', label: 'Đeo kính bảo hộ hoặc găng tay khi khoan, cắt, mài hoặc làm việc với vật sắc.' },
  { id: 'clean', label: 'Giữ khu vực làm việc gọn gàng và thu dọn vụn vật liệu sau khi làm.' },
]

const criterion = (name, weight, measure) => ({ name, weight, measure })

export const projectTemplates = [
  {
    id: 'phone-stand',
    title: 'Giá đỡ điện thoại học trực tuyến',
    grade: 'Khối 10',
    difficulty: 'Cơ bản',
    summary: 'Giá đỡ giữ điện thoại ở góc nhìn thoải mái khi học online hoặc xem video bài giảng.',
    problem: {
      need: 'Học sinh cần đặt điện thoại đứng vững khi học trực tuyến vì cầm tay lâu bị mỏi và màn hình rung, nhưng hiện tại thường phải dựa điện thoại vào sách nên dễ đổ và sai góc nhìn.',
      users: 'Học sinh THPT học tại nhà hoặc trên lớp.',
      constraints: 'Chi phí dưới 30.000 đồng, làm trong 2 tiết, dùng vật liệu tái chế hoặc có sẵn.',
    },
    criteria: [
      criterion('Đứng vững, không đổ', 5, 'Đặt điện thoại 200 g, gõ nhẹ vào bàn 5 lần không đổ'),
      criterion('Góc nghiêng phù hợp', 4, 'Màn hình nghiêng 60–75° so với mặt bàn'),
      criterion('Vừa nhiều loại điện thoại', 3, 'Giữ được máy rộng 65–80 mm, có ốp'),
      criterion('Gọn, dễ mang theo', 2, 'Gấp gọn được hoặc kích thước dưới 15 × 10 cm'),
      criterion('Chi phí thấp', 3, 'Tổng chi phí vật liệu dưới 30.000 đồng'),
    ],
    solutions: ['Giá gấp bằng bìa carton', 'Giá lắp ghép bằng que kem và keo'],
  },
  {
    id: 'popsicle-bridge',
    title: 'Mô hình cầu chịu lực bằng que kem',
    grade: 'Khối 10',
    difficulty: 'Trung bình',
    summary: 'Thiết kế cây cầu nhẹ nhưng chịu tải lớn — vận dụng kết cấu tam giác và phân bố lực.',
    problem: {
      need: 'Lớp cần một mô hình cầu vượt nhịp 30 cm để tìm hiểu kết cấu chịu lực, nhưng cầu phải nhẹ và chỉ dùng que kem, keo nên cần chọn kết cấu hợp lí.',
      users: 'Nhóm học sinh tham gia thử thách thiết kế trên lớp.',
      constraints: 'Tối đa 100 que kem và 1 lọ keo sữa; nhịp cầu 30 cm; hoàn thành trong 1 tuần.',
    },
    criteria: [
      criterion('Chịu tải lớn', 5, 'Treo vật nặng giữa nhịp, ghi khối lượng tối đa trước khi gãy'),
      criterion('Khối lượng nhẹ', 4, 'Cân cầu; tỉ số tải trọng / khối lượng càng lớn càng tốt'),
      criterion('Đúng kích thước', 4, 'Vượt nhịp 30 cm, mặt cầu rộng tối thiểu 5 cm'),
      criterion('Tiết kiệm vật liệu', 2, 'Dùng không quá 100 que'),
      criterion('Thẩm mĩ, chắc chắn mối nối', 2, 'Mối dán phẳng, không bong khi lắc nhẹ'),
    ],
    solutions: ['Kết cấu giàn tam giác (Warren)', 'Cầu vòm', 'Cầu dầm đơn giản'],
  },
  {
    id: 'auto-watering',
    title: 'Hệ thống tưới cây tự động mini',
    grade: 'Khối 12',
    difficulty: 'Nâng cao',
    summary: 'Tự động tưới chậu cây khi đất khô bằng cảm biến độ ẩm và máy bơm nhỏ.',
    problem: {
      need: 'Gia đình cần chậu cây trong nhà được tưới đều khi vắng nhà vài ngày vì cây dễ héo, nhưng hiện tại không có ai tưới và tưới tay thường quá nhiều hoặc quá ít nước.',
      users: 'Gia đình có cây cảnh trong nhà hoặc ban công.',
      constraints: 'Dùng pin hoặc nguồn 5 V, chi phí dưới 200.000 đồng, an toàn khi gần nước.',
    },
    criteria: [
      criterion('Tưới đúng lúc đất khô', 5, 'Bơm bật khi độ ẩm dưới ngưỡng, tắt khi đủ ẩm'),
      criterion('An toàn điện', 5, 'Mạch điện kín, tách khỏi nước, dùng điện áp ≤ 5 V'),
      criterion('Tiết kiệm nước', 3, 'Lượng nước mỗi lần tưới 50–150 ml'),
      criterion('Hoạt động lâu dài', 3, 'Chạy ổn định ít nhất 3 ngày liên tục'),
      criterion('Chi phí hợp lí', 2, 'Tổng chi phí dưới 200.000 đồng'),
    ],
    solutions: ['Arduino + cảm biến độ ẩm + bơm mini', 'Tưới nhỏ giọt bằng chai nhựa (không dùng điện)'],
  },
  {
    id: 'desk-organizer',
    title: 'Hộp đựng đồ dùng học tập đa năng',
    grade: 'Khối 10',
    difficulty: 'Cơ bản',
    summary: 'Sắp xếp bút, thước, giấy note gọn gàng trên bàn học từ vật liệu tái chế.',
    problem: {
      need: 'Học sinh cần sắp xếp đồ dùng học tập gọn gàng vì bàn học nhỏ và hay mất đồ, nhưng hộp bút thông thường không chia ngăn cho thước dài, giấy note và điện thoại.',
      users: 'Học sinh có bàn học nhỏ tại nhà hoặc kí túc xá.',
      constraints: 'Dùng vật liệu tái chế (lõi giấy, hộp sữa, bìa), kích thước đáy tối đa 20 × 15 cm.',
    },
    criteria: [
      criterion('Đủ ngăn cho các loại đồ dùng', 5, 'Có ngăn cho bút, thước 20 cm, giấy note và điện thoại'),
      criterion('Chắc chắn', 4, 'Chứa 15 bút và thước không bị biến dạng'),
      criterion('Gọn trên bàn', 3, 'Đáy không quá 20 × 15 cm'),
      criterion('Thân thiện môi trường', 3, 'Ít nhất 70% vật liệu là đồ tái chế'),
      criterion('Thẩm mĩ', 2, 'Trang trí hài hòa, bề mặt nhẵn'),
    ],
    solutions: ['Ghép lõi giấy vệ sinh', 'Hộp sữa giấy cắt bậc thang'],
  },
]

export const blankTemplate = {
  id: 'blank',
  title: 'Dự án mới',
  grade: 'Tự chọn',
  difficulty: 'Tự do',
  summary: 'Bắt đầu từ một vấn đề của riêng bạn hoặc nhiệm vụ giáo viên giao.',
  problem: { need: '', users: '', constraints: '' },
  criteria: [],
  solutions: [],
}
