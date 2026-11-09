export const warmupGameChapters = [
  {
    id: 1,
    title: 'Chương 1. Cơ khí chế tạo và nghề nghiệp cơ khí',
    gameTitle: 'Đấu trường xưởng cơ khí',
    objective: 'Khởi động kiến thức về vai trò cơ khí chế tạo, sản phẩm cơ khí và định hướng nghề nghiệp.',
    duration: '8-10 phút',
    skills: ['Nhận biết', 'Phân loại', 'Liên hệ nghề nghiệp'],
    questions: [
      {
        prompt: 'Cơ khí chế tạo có vai trò chính nào trong sản xuất?',
        options: [
          'Tạo ra chi tiết, cụm chi tiết, máy và thiết bị phục vụ sản xuất',
          'Chỉ trang trí hình dáng bên ngoài của sản phẩm',
          'Chỉ dùng để bán vật liệu thô',
          'Không liên quan đến các ngành công nghiệp khác',
        ],
        answer: 0,
        explanation: 'Cơ khí chế tạo là nền tảng tạo ra máy móc, thiết bị và sản phẩm cơ khí cho nhiều lĩnh vực.',
      },
      {
        prompt: 'Năng lực nào quan trọng với người học nghề cơ khí?',
        options: [
          'Đọc bản vẽ, đo kiểm, thao tác chính xác và tuân thủ an toàn',
          'Chỉ cần nhớ tên các loại máy',
          'Không cần làm việc nhóm',
          'Không cần hiểu quy trình sản xuất',
        ],
        answer: 0,
        explanation: 'Nghề cơ khí đòi hỏi tư duy kĩ thuật, kĩ năng thao tác và ý thức an toàn.',
      },
      {
        prompt: 'Khâu nào thường nằm cuối quy trình tạo sản phẩm cơ khí?',
        options: ['Kiểm tra chất lượng', 'Bỏ qua bản vẽ', 'Chọn ngẫu nhiên vật liệu', 'Đổi tên sản phẩm'],
        answer: 0,
        explanation: 'Kiểm tra giúp xác định sản phẩm có đạt yêu cầu kĩ thuật, an toàn và công dụng hay không.',
      },
    ],
  },
  {
    id: 2,
    title: 'Chương 2. Vật liệu và gia công cơ khí',
    gameTitle: 'Đua chọn vật liệu',
    objective: 'Củng cố cách phân loại vật liệu, lựa chọn vật liệu và nhận biết phương pháp gia công.',
    duration: '10 phút',
    skills: ['Chọn vật liệu', 'Ghép phương pháp', 'Phân tích điều kiện làm việc'],
    questions: [
      {
        prompt: 'Khi chọn vật liệu cho chi tiết máy, yếu tố nào cần xem xét?',
        options: [
          'Công dụng, tải trọng, môi trường làm việc, khả năng gia công và giá thành',
          'Chỉ chọn theo màu sắc',
          'Chỉ chọn vật liệu nặng nhất',
          'Chỉ chọn vật liệu có tên dễ nhớ',
        ],
        answer: 0,
        explanation: 'Chọn vật liệu phải dựa trên yêu cầu kĩ thuật, điều kiện làm việc và tính kinh tế.',
      },
      {
        prompt: 'Phương pháp gia công nào phù hợp để tạo bề mặt tròn xoay?',
        options: ['Tiện', 'Hàn điểm', 'Sơn phủ', 'Dán nhãn'],
        answer: 0,
        explanation: 'Tiện thường dùng để gia công các bề mặt tròn xoay như trục, bạc, puli.',
      },
      {
        prompt: 'Hàn có nhiệm vụ chính là gì?',
        options: [
          'Liên kết các chi tiết kim loại',
          'Đo kích thước chi tiết',
          'Tạo tín hiệu điều khiển',
          'Làm mát động cơ',
        ],
        answer: 0,
        explanation: 'Hàn là phương pháp liên kết vật liệu, thường dùng với các chi tiết kim loại.',
      },
    ],
  },
  {
    id: 3,
    title: 'Chương 3. Sản xuất cơ khí, tự động hóa và an toàn',
    gameTitle: 'Trạm an toàn tốc độ',
    objective: 'Khởi động nội dung dây chuyền sản xuất, CNC, robot, cảm biến và an toàn lao động.',
    duration: '8 phút',
    skills: ['Nhận diện thiết bị', 'Xử lí tình huống', 'An toàn lao động'],
    questions: [
      {
        prompt: 'Máy CNC có đặc điểm nổi bật nào?',
        options: [
          'Gia công theo chương trình số, có độ chính xác và tính lặp lại cao',
          'Chỉ hoạt động bằng sức người',
          'Không cần bản vẽ hoặc chương trình',
          'Chỉ dùng để vận chuyển hàng',
        ],
        answer: 0,
        explanation: 'CNC cho phép điều khiển quá trình gia công bằng chương trình, giúp ổn định và chính xác.',
      },
      {
        prompt: 'Trước khi vận hành máy cơ khí, học sinh cần làm gì?',
        options: [
          'Kiểm tra máy, dụng cụ, nguồn điện, bảo hộ và khu vực làm việc',
          'Bật máy ngay để tiết kiệm thời gian',
          'Đứng sát vùng chuyển động',
          'Tháo bộ phận che chắn',
        ],
        answer: 0,
        explanation: 'Kiểm tra trước khi làm việc giúp hạn chế tai nạn và phát hiện bất thường.',
      },
      {
        prompt: 'Robot công nghiệp thường được dùng để làm gì?',
        options: [
          'Thực hiện thao tác lặp lại, nặng nhọc hoặc nguy hiểm',
          'Thay thế hoàn toàn việc kiểm tra an toàn',
          'Chỉ để trang trí dây chuyền',
          'Làm bài kiểm tra thay học sinh',
        ],
        answer: 0,
        explanation: 'Robot giúp tăng năng suất, độ ổn định và giảm rủi ro cho con người.',
      },
    ],
  },
  {
    id: 4,
    title: 'Chương 4. Cơ khí động lực và động cơ đốt trong',
    gameTitle: 'Đường đua động cơ 4 kì',
    objective: 'Củng cố cấu tạo, nguyên lí làm việc và các hệ thống chính của động cơ đốt trong.',
    duration: '10-12 phút',
    skills: ['Sắp xếp chu trình', 'Nhận biết cơ cấu', 'Giải thích nguyên lí'],
    questions: [
      {
        prompt: 'Thứ tự đúng của chu trình động cơ 4 kì là gì?',
        options: [
          'Nạp - nén - cháy giãn nở - thải',
          'Nén - nạp - thải - cháy giãn nở',
          'Thải - nạp - cháy giãn nở - nén',
          'Cháy giãn nở - thải - nạp - nén',
        ],
        answer: 0,
        explanation: 'Động cơ 4 kì làm việc theo thứ tự nạp, nén, cháy giãn nở và thải.',
      },
      {
        prompt: 'Kì nào là kì sinh công trong động cơ 4 kì?',
        options: ['Cháy - giãn nở', 'Nạp', 'Nén', 'Thải'],
        answer: 0,
        explanation: 'Ở kì cháy - giãn nở, khí cháy đẩy pít tông đi xuống và tạo công.',
      },
      {
        prompt: 'Cơ cấu trục khuỷu - thanh truyền có nhiệm vụ gì?',
        options: [
          'Biến chuyển động tịnh tiến của pít tông thành chuyển động quay của trục khuỷu',
          'Lọc sạch không khí trong khoang lái',
          'Làm tăng độ bám đường của bánh xe',
          'Điều khiển đèn tín hiệu',
        ],
        answer: 0,
        explanation: 'Cơ cấu này truyền lực từ pít tông và biến đổi chuyển động để tạo chuyển động quay.',
      },
    ],
  },
  {
    id: 5,
    title: 'Chương 5. Khái quát về ô tô',
    gameTitle: 'Garage hệ thống ô tô',
    objective: 'Khởi động kiến thức về bố trí chung của ô tô và nhiệm vụ các hệ thống chính.',
    duration: '8-10 phút',
    skills: ['Nhận biết hệ thống', 'Ghép nhiệm vụ', 'Xử lí tình huống vận hành'],
    questions: [
      {
        prompt: 'Hệ thống truyền lực trên ô tô có nhiệm vụ gì?',
        options: [
          'Truyền mô-men từ động cơ đến bánh xe chủ động',
          'Chỉ dùng để chiếu sáng',
          'Làm sạch kính chắn gió',
          'Làm mát khoang hành khách',
        ],
        answer: 0,
        explanation: 'Hệ thống truyền lực truyền công suất và mô-men đến bánh xe để xe chuyển động.',
      },
      {
        prompt: 'Hệ thống phanh thuộc nhóm hệ thống nào về mặt an toàn?',
        options: ['An toàn chủ động', 'Trang trí ngoại thất', 'Giải trí', 'Lưu trữ hành lí'],
        answer: 0,
        explanation: 'Phanh giúp giảm tốc hoặc dừng xe, ảnh hưởng trực tiếp đến an toàn chủ động.',
      },
      {
        prompt: 'Hệ thống treo có vai trò chính nào?',
        options: [
          'Giảm dao động, giúp xe êm dịu và ổn định khi chuyển động',
          'Tạo tia lửa điện trong xi lanh',
          'Điều khiển kim phun nhiên liệu',
          'Tăng âm lượng loa',
        ],
        answer: 0,
        explanation: 'Hệ thống treo giúp bánh xe tiếp xúc mặt đường tốt hơn và tăng độ êm dịu.',
      },
    ],
  },
]

export const getWarmupChapter = (chapterId) =>
  warmupGameChapters.find((chapter) => chapter.id === Number(chapterId)) || warmupGameChapters[0]
