// The user guide: one list of tasks per role, written with the labels the app really shows,
// plus the topics that concern everyone. Each task links to the page where it is done.

export const GUIDE_ROLES = [
  { id: 'student', label: 'Học sinh' },
  { id: 'teacher', label: 'Giáo viên' },
]

export const QUICK_START = {
  student: [
    'Đăng kí với vai trò Học sinh, nhập lớp hoặc mã lớp giáo viên cấp.',
    'Mở Tổng quan, chọn khối, chương rồi bài cần học.',
    'Học trên mô hình, làm Kiểm tra nhanh, xem Tiến độ để biết việc tiếp theo.',
  ],
  teacher: [
    'Đăng kí với vai trò Giáo viên và chờ quản trị viên xác minh.',
    'Tạo mã lớp ở trang Xác minh, gửi mã cho học sinh.',
    'Dùng Lớp học để giao nhiệm vụ, Phòng quiz để thi đua, Tiến độ để theo dõi.',
  ],
}

export const GUIDE_TASKS = {
  student: [
    {
      id: 'account',
      title: 'Tạo tài khoản và vào lớp',
      to: '/register',
      linkLabel: 'Đăng kí',
      steps: [
        'Bấm “Đăng kí”, chọn vai trò Học sinh, nhập họ tên và lớp (ví dụ 11A1) hoặc Mã lớp do giáo viên cung cấp.',
        'Mật khẩu cần ít nhất 8 kí tự, có cả chữ và số, không chứa tên đăng nhập.',
        'Nếu thấy dòng “Giáo viên chưa xác nhận bạn thuộc lớp này”, em vẫn học bình thường; kết quả hiện với giáo viên sau khi được xác nhận.',
      ],
    },
    {
      id: 'lesson',
      title: 'Học một bài',
      to: '/',
      linkLabel: 'Mở Tổng quan',
      steps: [
        'Ở Tổng quan, chọn khối 10, 11 hoặc 12, chọn chương rồi chọn bài.',
        'Đọc các ý chính và mục tiêu; bài giảng, tài liệu PDF nằm ở ô “Tài liệu của bài”.',
        'Mở các công cụ bên phải: mô phỏng 3D, trợ lí học tập, phòng quiz, kiểm tra nhanh.',
        'Học xong, bấm “Đánh dấu hoàn thành” để giáo viên và trang Tiến độ ghi nhận.',
      ],
    },
    {
      id: 'model',
      title: 'Học trên mô hình 3D',
      to: '/lessons/110602/3d',
      linkLabel: 'Thử mô hình động cơ',
      steps: [
        'Kéo để xoay, cuộn chuột hoặc chụm hai ngón tay để phóng to; “Góc nhìn chuẩn” đưa mô hình về vị trí ban đầu.',
        'Bấm vào một chi tiết để xem tên và chức năng theo sách; chọn “Lớp kiến thức” để tô sáng một nhóm chi tiết.',
        'Thao tác ngay dưới mô hình (chọn số, đạp phanh, xoay vô lăng, gạt công tắc…) và đọc bảng số liệu thay đổi theo.',
        'Làm theo khung “Thí nghiệm của bài này”; số liệu là giá trị dạy học, chuyển động quay được làm chậm để quan sát.',
      ],
    },
    {
      id: 'practice',
      title: 'Luyện tập và kiểm tra',
      to: '/practice-bank',
      linkLabel: 'Mở Luyện tập',
      steps: [
        'Kiểm tra nhanh ở cuối mỗi bài: mỗi câu chỉ tính lần trả lời đầu tiên.',
        'Trang Luyện tập có đề theo chương, đề kiểm tra cuối năm theo ma trận và đề luyện tốt nghiệp 50 phút.',
        'Bấm “Nộp bài” để xem điểm, đáp án, lời giải thích, mức độ và năng lực của từng câu.',
      ],
    },
    {
      id: 'quiz',
      title: 'Vào phòng quiz của lớp',
      to: '/game-rooms/join',
      linkLabel: 'Vào phòng quiz',
      steps: [
        'Mở “Phòng quiz”, nhập Mã phòng 6 số giáo viên chiếu trên bảng và Tên hiển thị.',
        'Trả lời trước khi hết giờ: đúng được 500 điểm, trả lời càng nhanh được thêm tới 500 điểm.',
        'Chỉ lần chọn đầu tiên được tính; bảng xếp hạng hiện sau mỗi câu.',
      ],
    },
    {
      id: 'progress',
      title: 'Xem tiến độ và việc nên làm tiếp',
      to: '/progress',
      linkLabel: 'Mở Tiến độ',
      steps: [
        'Trang Tiến độ cho biết bài đã học, điểm kiểm tra và bài nên ôn lại.',
        'Mỗi gợi ý ghi rõ lí do, ví dụ “điểm kiểm tra nhanh dưới 60%”, để em biết cần làm gì.',
      ],
    },
    {
      id: 'tutor',
      title: 'Hỏi trợ lí học tập',
      to: '/ai-workspace',
      linkLabel: 'Mở Không gian AI',
      steps: [
        'Hỏi trong trang bài học để trợ lí biết em đang học bài nào.',
        'Trợ lí gợi ý cách nghĩ thay vì giải hộ; hãy tự làm rồi hỏi lại khi cần.',
        'Câu trả lời có nhãn “Phản hồi dự phòng” là nội dung soạn sẵn khi chưa kết nối được AI; đối chiếu lại với sách.',
      ],
    },
  ],
  teacher: [
    {
      id: 'account',
      title: 'Tài khoản giáo viên và xác minh',
      to: '/register',
      linkLabel: 'Đăng kí',
      steps: [
        'Đăng kí với vai trò Giáo viên. Khi chưa được quản trị viên xác minh, tài khoản chưa có công cụ giáo viên và chưa xem được dữ liệu lớp.',
        'Sau khi được xác minh, mục “Xác minh” xuất hiện trên thanh điều hướng.',
      ],
    },
    {
      id: 'class-code',
      title: 'Tạo mã lớp và duyệt học sinh',
      to: '/accounts',
      linkLabel: 'Mở Xác minh',
      steps: [
        'Ở trang Xác minh, tạo Mã lớp cho từng lớp và gửi cho học sinh; thu hồi mã khi không dùng nữa.',
        'Học sinh đăng kí bằng tên lớp (không có mã) sẽ nằm trong danh sách chờ xác minh; kiểm tra rồi duyệt.',
        'Giáo viên chỉ xem được học sinh của lớp mình được phân công.',
      ],
    },
    {
      id: 'classroom',
      title: 'Thông báo, học liệu và nhiệm vụ',
      to: '/classroom',
      linkLabel: 'Mở Lớp học',
      steps: [
        'Bảng tin lớp: chọn lớp, viết rồi bấm “Đăng thông báo”.',
        'Học liệu: chia sẻ tài liệu cho lớp, có thể gắn với một bài.',
        'Nhiệm vụ: bấm “Tạo nhiệm vụ nộp bài”, chọn lớp và hạn nộp; theo dõi ở “Bài đã nộp”.',
      ],
    },
    {
      id: 'quiz',
      title: 'Thiết kế và mở phòng quiz',
      to: '/game-rooms',
      linkLabel: 'Mở Phòng quiz',
      steps: [
        'Bấm “+ Trò chơi mới”, đặt tên, chọn “Lấy câu từ ngân hàng bài học” hoặc tự soạn câu hỏi.',
        'Bấm “Lưu thiết kế” để giữ trò chơi với tài khoản, mở lại được ở máy khác.',
        '“Mở phòng trực tuyến” tạo mã 6 số cho học sinh vào từ máy của mình; bấm “Bắt đầu”, “Công bố đáp án” rồi chuyển câu.',
        'Không có mạng hoặc máy chủ: chọn “Trình chiếu trên lớp (chia đội)” để cả lớp chơi trên màn chiếu với 2–4 đội.',
      ],
    },
    {
      id: 'signals',
      title: 'Theo dõi tín hiệu học tập',
      to: '/classroom',
      linkLabel: 'Xem tín hiệu',
      steps: [
        'Ô “Tín hiệu học tập của lớp” liệt kê từng tín hiệu của mỗi học sinh kèm tên bài, ví dụ điểm kiểm tra dưới 60 hoặc bài đang học chưa mở lại trong 7 ngày.',
        'Đây là gợi ý để thầy cô xem xét, không phải kết luận về năng lực; học sinh chưa bắt đầu học có mức riêng “Chưa bắt đầu học”.',
      ],
    },
    {
      id: 'exams',
      title: 'Kho đề và đề theo ma trận',
      to: '/practice-bank',
      linkLabel: 'Mở Kho đề',
      steps: [
        'Kho đề có ngân hàng câu hỏi theo bài, đề theo chương và đề kiểm tra cuối năm theo ma trận Công văn 7991.',
        'Mỗi câu ghi mức độ (Biết, Hiểu, Vận dụng) và thành phần năng lực; hãy rà soát trước khi dùng để kiểm tra lấy điểm.',
      ],
    },
    {
      id: 'materials',
      title: 'Thư viện tài liệu',
      to: '/materials',
      linkLabel: 'Mở Tài liệu',
      steps: [
        'Bài giảng và tài liệu PDF của ba khối được xếp theo chương, bài; tìm theo tên bài.',
        'Mở xem trực tiếp hoặc bấm “Tải” để dùng khi không có mạng.',
      ],
    },
  ],
}

export const COMMON_TOPICS = [
  {
    id: 'vr',
    title: 'Xem mô hình bằng kính thực tế ảo',
    steps: [
      'Mở mô hình 3D bằng trình duyệt của kính (ví dụ Meta Quest Browser), bấm “Xem bằng VR” và cho phép trình duyệt dùng thiết bị.',
      'Mô hình được đặt thu nhỏ trên một mặt bàn trước mặt. Chĩa tay cầm vào chi tiết để xem tên, chức năng và thao tác.',
      'Nút cò chuyển lớp kiến thức, nút bóp tạm dừng hoặc chạy tiếp. Nút chỉ hiện khi trình duyệt hỗ trợ WebXR.',
    ],
  },
  {
    id: 'offline',
    title: 'Khi không kết nối được máy chủ',
    steps: [
      'Ứng dụng vẫn mở được bài học, mô hình, câu hỏi và phòng quiz chế độ trình chiếu; tiến độ được lưu tạm trên máy.',
      'Khi có kết nối lại, tiến độ chưa gửi được đồng bộ tự động, mỗi sự kiện chỉ được ghi một lần.',
      'Trong lúc ngoại tuyến, giáo viên chưa thấy kết quả của học sinh.',
    ],
  },
  {
    id: 'account-data',
    title: 'Tài khoản, bảo mật và dữ liệu cá nhân',
    to: '/account',
    linkLabel: 'Mở Tài khoản',
    steps: [
      'Bấm vào tên của mình ở góc phải để mở trang Tài khoản: xem hệ thống lưu gì và ai xem được.',
      '“Tải dữ liệu của tôi (JSON)” tải toàn bộ dữ liệu của mình; học sinh có thể “Xóa tài khoản” cùng dữ liệu học tập.',
      'Đổi mật khẩu hoặc chọn “Đăng xuất trên mọi thiết bị khác” khi nghi lộ mật khẩu. Đăng nhập sai 5 lần sẽ bị tạm khóa 15 phút.',
      'Dùng máy chung: bấm “Xóa dữ liệu của tôi trên máy này” trước khi rời đi.',
    ],
  },
]

export const FAQ = [
  ['Vì sao em không thấy kết quả của mình ở trang giáo viên?', 'Có thể giáo viên chưa xác nhận em thuộc lớp, hoặc máy đang ngoại tuyến và chưa đồng bộ. Kiểm tra dòng thông báo trên đầu trang và kết nối mạng.'],
  ['Mô hình 3D không hiện hoặc chạy chậm?', 'Thử trình duyệt Chrome hoặc Edge bản mới, đóng bớt thẻ, rồi bấm “Góc nhìn chuẩn”. Máy rất cũ có thể không hỗ trợ đồ họa 3D.'],
  ['Không có nút “Xem bằng VR”?', 'Nút chỉ hiện trên trình duyệt hỗ trợ WebXR, thường là trình duyệt của kính thực tế ảo. Trên máy tính và điện thoại, mô hình vẫn dùng bình thường.'],
  ['Quên mật khẩu thì làm thế nào?', 'Hiện chưa có khôi phục qua email; hãy nhờ giáo viên hoặc quản trị viên hỗ trợ.'],
  ['Câu hỏi trong ứng dụng có dùng để kiểm tra lấy điểm được không?', 'Ngân hàng câu hỏi là dữ liệu khởi tạo, chưa được tổ chuyên môn thẩm định; giáo viên nên rà soát trước khi dùng cho bài kiểm tra chính thức.'],
]
