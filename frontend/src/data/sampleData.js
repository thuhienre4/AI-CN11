export const sampleCourses = [
  {
    id: 1,
    title: 'Đại cương về động cơ đốt trong',
    description:
      'Hệ thống hóa kiến thức nền: khái niệm, phân loại, cấu tạo chung và nguyên lý làm việc của động cơ đốt trong.',
    content:
      'Chủ đề này bám theo mạch kiến thức Công nghệ 11 phần động cơ đốt trong: từ khái niệm đến chu trình làm việc, giúp học sinh hiểu vì sao động cơ có thể biến nhiệt năng thành cơ năng.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Cơ cấu chính của động cơ',
    description:
      'Tìm hiểu thân máy, nắp máy, cơ cấu trục khuỷu - thanh truyền và cơ cấu phân phối khí.',
    content:
      'Chủ đề giúp học sinh kết nối cấu tạo cơ khí với chuyển động thực tế: pít tông chuyển động tịnh tiến, trục khuỷu quay, xu páp đóng mở đúng thời điểm.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Các hệ thống của động cơ đốt trong',
    description:
      'Liên kết hệ thống bôi trơn, làm mát, cung cấp nhiên liệu - không khí, đánh lửa, khởi động và xả khí.',
    content:
      'Học sinh quan sát từng hệ thống để hiểu rằng động cơ không chỉ có pít tông và trục khuỷu; động cơ hoạt động ổn định nhờ nhiều hệ thống hỗ trợ phối hợp.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
  },
]

export const engineCycleSteps = [
  {
    name: 'Kì nạp',
    piston: 'Pít tông đi từ điểm chết trên xuống điểm chết dưới',
    valve: 'Xu páp nạp mở, xu páp thải đóng',
    result: 'Không khí hoặc hòa khí được nạp vào xi lanh.',
    color: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  {
    name: 'Kì nén',
    piston: 'Pít tông đi từ điểm chết dưới lên điểm chết trên',
    valve: 'Hai xu páp đều đóng',
    result: 'Môi chất trong xi lanh bị nén, áp suất và nhiệt độ tăng.',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    name: 'Kì cháy - giãn nở',
    piston: 'Khí cháy giãn nở đẩy pít tông đi xuống',
    valve: 'Hai xu páp đều đóng',
    result: 'Đây là kì sinh công, lực khí cháy truyền qua thanh truyền làm quay trục khuỷu.',
    color: 'bg-red-100 text-red-800 border-red-300',
  },
  {
    name: 'Kì thải',
    piston: 'Pít tông đi từ điểm chết dưới lên điểm chết trên',
    valve: 'Xu páp thải mở, xu páp nạp đóng',
    result: 'Khí thải được đẩy ra khỏi xi lanh để chuẩn bị chu trình mới.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
]

export const sampleLessons = [
  {
    id: 101,
    course_id: 1,
    title: 'Khái niệm và phân loại động cơ đốt trong',
    description:
      'Hiểu động cơ đốt trong là gì, vì sao gọi là “đốt trong” và có thể phân loại theo nhiên liệu, số kì, cách làm mát.',
    content:
      'Động cơ đốt trong là động cơ nhiệt trong đó nhiên liệu được đốt cháy ngay bên trong xi lanh hoặc buồng cháy. Nhiệt lượng sinh ra làm khí cháy giãn nở, tạo áp lực đẩy pít tông hoặc tác dụng lên cánh tuabin để sinh công. Trong chương trình Công nghệ 11, học sinh thường gặp cách phân loại theo nhiên liệu như động cơ xăng và động cơ điêzen; theo chu trình làm việc như động cơ 2 kì và 4 kì; theo phương pháp làm mát như làm mát bằng không khí hoặc bằng nước.',
    key_points: [
      'Bản chất của động cơ đốt trong là biến nhiệt năng thành cơ năng.',
      'Động cơ xăng thường cần hệ thống đánh lửa bằng bugi.',
      'Động cơ điêzen tự cháy nhờ không khí bị nén đến nhiệt độ cao.',
      'Phân loại giúp chọn đúng nguyên lý và hệ thống đi kèm khi học cấu tạo.',
    ],
    visual_steps: [
      {
        name: 'Nhiên liệu',
        piston: 'Xăng hoặc dầu điêzen cung cấp hóa năng',
        valve: 'Hệ thống cung cấp nhiên liệu đưa nhiên liệu vào đúng thời điểm',
        result: 'Nguồn năng lượng ban đầu được chuẩn bị cho quá trình cháy.',
        color: 'bg-orange-100 text-orange-800 border-orange-300',
      },
      {
        name: 'Cháy trong xi lanh',
        piston: 'Khí cháy tác dụng trực tiếp lên pít tông',
        valve: 'Buồng cháy được đóng kín trong giai đoạn sinh công',
        result: 'Nhiệt năng chuyển thành lực đẩy cơ học.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Sinh công',
        piston: 'Pít tông truyền lực qua thanh truyền',
        valve: 'Trục khuỷu nhận lực và quay',
        result: 'Động cơ tạo mô-men quay để kéo máy công tác.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
    ],
    order: 1,
  },
  {
    id: 102,
    course_id: 1,
    title: 'Cấu tạo chung của động cơ đốt trong',
    description:
      'Nhận diện các nhóm bộ phận chính: cơ cấu, hệ thống và mối quan hệ giữa chúng.',
    content:
      'Một động cơ đốt trong kiểu pít tông thường gồm hai cơ cấu chính và nhiều hệ thống phục vụ. Hai cơ cấu chính là cơ cấu trục khuỷu - thanh truyền và cơ cấu phân phối khí. Các hệ thống phục vụ gồm bôi trơn, làm mát, cung cấp nhiên liệu và không khí, đánh lửa đối với động cơ xăng, khởi động và xả khí. Khi học theo SGK, cần xem cấu tạo chung như một mạng liên kết: cơ cấu chính tạo chuyển động, còn các hệ thống phụ trợ bảo đảm động cơ có nhiên liệu, có không khí, đủ mát, đủ dầu bôi trơn và khởi động được.',
    key_points: [
      'Cơ cấu trục khuỷu - thanh truyền tạo và truyền chuyển động chính.',
      'Cơ cấu phân phối khí điều khiển quá trình nạp và thải.',
      'Hệ thống bôi trơn và làm mát giúp động cơ làm việc bền.',
      'Hệ thống nhiên liệu, đánh lửa và khởi động giúp động cơ bắt đầu và duy trì quá trình cháy.',
    ],
    visual_steps: [
      {
        name: 'Cơ cấu chính',
        piston: 'Pít tông, thanh truyền, trục khuỷu tạo chuyển động',
        valve: 'Xu páp và trục cam điều khiển khí vào - ra',
        result: 'Đây là phần trực tiếp tạo chuyển động cơ học.',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      },
      {
        name: 'Hệ thống phục vụ',
        piston: 'Dầu, nước làm mát, nhiên liệu và không khí hỗ trợ quá trình làm việc',
        valve: 'Các bơm, cảm biến, đường ống và bugi phối hợp',
        result: 'Động cơ hoạt động ổn định, an toàn và hiệu quả.',
        color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      },
    ],
    order: 2,
  },
  {
    id: 103,
    course_id: 1,
    title: 'Nguyên lý làm việc của động cơ 4 kì',
    description:
      'Quan sát đủ 4 kì nạp, nén, cháy - giãn nở và thải; liên hệ với vị trí pít tông và trạng thái xu páp.',
    content:
      'Động cơ 4 kì hoàn thành một chu trình công tác sau bốn hành trình pít tông, tương ứng hai vòng quay trục khuỷu. Kì nạp đưa môi chất mới vào xi lanh. Kì nén làm tăng áp suất và nhiệt độ của môi chất. Kì cháy - giãn nở là kì sinh công. Kì thải đẩy khí cháy ra ngoài. Kiến thức quan trọng không phải chỉ nhớ tên bốn kì, mà phải liên hệ được: pít tông đi đâu, xu páp nào mở, quá trình nào xảy ra trong xi lanh và kì nào tạo công.',
    key_points: [
      'Một chu trình 4 kì gồm bốn hành trình pít tông và hai vòng quay trục khuỷu.',
      'Kì cháy - giãn nở là kì sinh công.',
      'Xu páp nạp mở chủ yếu ở kì nạp, xu páp thải mở chủ yếu ở kì thải.',
      'Các kì còn lại tiêu thụ năng lượng quán tính để chuẩn bị cho kì sinh công tiếp theo.',
    ],
    visual_steps: engineCycleSteps,
    order: 3,
  },
  {
    id: 201,
    course_id: 2,
    title: 'Cơ cấu trục khuỷu - thanh truyền',
    description:
      'Kết nối pít tông, thanh truyền, trục khuỷu và bánh đà trong quá trình biến chuyển động tịnh tiến thành chuyển động quay.',
    content:
      'Cơ cấu trục khuỷu - thanh truyền là cơ cấu quan trọng nhất của động cơ pít tông. Khi khí cháy giãn nở, pít tông bị đẩy xuống. Thanh truyền nhận lực từ pít tông và truyền tới trục khuỷu. Trục khuỷu biến chuyển động tịnh tiến của pít tông thành chuyển động quay. Bánh đà tích trữ năng lượng, giúp trục khuỷu quay đều hơn, đặc biệt trong các kì không sinh công.',
    key_points: [
      'Pít tông nhận áp lực khí cháy và chuyển động trong xi lanh.',
      'Thanh truyền là chi tiết trung gian truyền lực từ pít tông tới trục khuỷu.',
      'Trục khuỷu biến chuyển động tịnh tiến thành chuyển động quay.',
      'Bánh đà giúp động cơ quay đều và vượt qua các kì không sinh công.',
    ],
    visual_steps: [
      {
        name: 'Nhận lực',
        piston: 'Khí cháy đẩy pít tông đi xuống',
        valve: 'Buồng cháy kín trong kì sinh công',
        result: 'Lực khí cháy tác dụng lên đỉnh pít tông.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Truyền lực',
        piston: 'Pít tông đẩy thanh truyền',
        valve: 'Thanh truyền đổi hướng lực theo vị trí trục khuỷu',
        result: 'Lực tịnh tiến được truyền thành mô-men quay.',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      },
      {
        name: 'Tích năng lượng',
        piston: 'Bánh đà quay nhờ quán tính',
        valve: 'Trục khuỷu tiếp tục kéo pít tông qua các kì còn lại',
        result: 'Động cơ quay đều hơn giữa các lần sinh công.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    ],
    order: 1,
  },
  {
    id: 202,
    course_id: 2,
    title: 'Cơ cấu phân phối khí',
    description:
      'Hiểu nhiệm vụ của xu páp, trục cam và cơ cấu truyền động cam trong việc đóng mở cửa nạp, cửa thải.',
    content:
      'Cơ cấu phân phối khí có nhiệm vụ đóng mở các cửa nạp và cửa thải đúng thời điểm. Ở động cơ 4 kì, trục cam thường quay với tốc độ bằng một nửa tốc độ trục khuỷu. Khi cam tác dụng lên con đội, đũa đẩy, cò mổ hoặc trực tiếp lên xu páp, xu páp mở; khi cam thôi tác dụng, lò xo kéo xu páp đóng lại. Nếu phân phối khí sai thời điểm, động cơ khó nạp đủ không khí, khó thải sạch khí cháy và giảm công suất.',
    key_points: [
      'Xu páp nạp điều khiển dòng khí hoặc hòa khí đi vào xi lanh.',
      'Xu páp thải điều khiển khí cháy đi ra khỏi xi lanh.',
      'Trục cam quyết định thời điểm mở và đóng xu páp.',
      'Phân phối khí phải đồng bộ với vị trí pít tông và trục khuỷu.',
    ],
    visual_steps: [
      {
        name: 'Nạp',
        piston: 'Pít tông đi xuống tạo độ chân không tương đối',
        valve: 'Xu páp nạp mở',
        result: 'Môi chất mới đi vào xi lanh.',
        color: 'bg-sky-100 text-sky-800 border-sky-300',
      },
      {
        name: 'Nén và sinh công',
        piston: 'Pít tông đi lên rồi bị đẩy xuống',
        valve: 'Hai xu páp đóng',
        result: 'Xi lanh kín để nén và sinh công.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Thải',
        piston: 'Pít tông đi lên',
        valve: 'Xu páp thải mở',
        result: 'Khí thải thoát ra ngoài.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    ],
    order: 2,
  },
  {
    id: 301,
    course_id: 3,
    title: 'Hệ thống bôi trơn và làm mát',
    description:
      'Hiểu vì sao động cơ cần dầu bôi trơn và hệ thống làm mát để làm việc bền, ổn định.',
    content:
      'Trong động cơ, nhiều chi tiết chuyển động tương đối với tốc độ cao nên dễ ma sát và mài mòn. Hệ thống bôi trơn đưa dầu tới các bề mặt ma sát để giảm mài mòn, làm kín, làm sạch và góp phần làm mát. Hệ thống làm mát lấy bớt nhiệt từ các chi tiết nóng như xi lanh, nắp máy, pít tông để giữ nhiệt độ làm việc phù hợp. Nếu thiếu dầu hoặc làm mát kém, động cơ có thể bó kẹt, quá nhiệt hoặc hỏng nhanh.',
    key_points: [
      'Bôi trơn làm giảm ma sát và mài mòn.',
      'Dầu bôi trơn còn hỗ trợ làm mát và làm sạch chi tiết.',
      'Làm mát giữ động cơ ở vùng nhiệt độ làm việc hợp lý.',
      'Quá nhiệt hoặc thiếu dầu đều có thể gây hư hỏng nặng.',
    ],
    order: 1,
  },
  {
    id: 302,
    course_id: 3,
    title: 'Hệ thống cung cấp nhiên liệu và không khí',
    description:
      'Phân biệt yêu cầu cung cấp nhiên liệu - không khí ở động cơ xăng và động cơ điêzen.',
    content:
      'Động cơ cần nhiên liệu và không khí để tạo quá trình cháy. Ở động cơ xăng, nhiên liệu thường được hòa trộn với không khí trước hoặc trong quá trình nạp, sau đó bugi đánh lửa để cháy. Ở động cơ điêzen, không khí được nén đến nhiệt độ cao, sau đó nhiên liệu được phun vào buồng cháy và tự bốc cháy. Hệ thống cung cấp nhiên liệu phải bảo đảm đúng lượng, đúng thời điểm và phù hợp với chế độ làm việc.',
    key_points: [
      'Không khí cung cấp oxy cho quá trình cháy.',
      'Động cơ xăng cần hỗn hợp phù hợp và bugi đánh lửa.',
      'Động cơ điêzen nén không khí trước, sau đó phun nhiên liệu.',
      'Cung cấp sai lượng nhiên liệu làm động cơ yếu, hao nhiên liệu hoặc nhiều khói.',
    ],
    order: 2,
  },
  {
    id: 303,
    course_id: 3,
    title: 'Hệ thống đánh lửa, khởi động và xả khí',
    description:
      'Kết nối các hệ thống giúp động cơ bắt đầu làm việc, duy trì quá trình cháy và thải khí ra ngoài.',
    content:
      'Hệ thống đánh lửa dùng trong động cơ xăng để tạo tia lửa điện ở bugi đúng thời điểm, thường gần cuối kì nén. Hệ thống khởi động làm quay trục khuỷu ban đầu để động cơ có thể tự duy trì chu trình làm việc. Hệ thống xả dẫn khí thải ra ngoài, giảm tiếng ồn và góp phần xử lý khí độc. Ba hệ thống này không trực tiếp sinh công như kì cháy - giãn nở, nhưng nếu thiếu chúng, động cơ khó khởi động, cháy không đúng thời điểm hoặc không thải khí tốt.',
    key_points: [
      'Đánh lửa đúng thời điểm giúp động cơ xăng sinh công hiệu quả.',
      'Khởi động cung cấp chuyển động quay ban đầu cho trục khuỷu.',
      'Xả khí giúp đưa khí cháy ra khỏi xi lanh và giảm tiếng ồn.',
      'Các hệ thống phụ trợ phải đồng bộ với chu trình cơ khí.',
    ],
    order: 3,
  },
]

export const sampleQuestions = [
  {
    id: 1001,
    lesson_id: 101,
    text: 'Vì sao gọi là động cơ đốt trong?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 1, text: 'Vì nhiên liệu được đốt cháy bên trong xi lanh hoặc buồng cháy', is_correct: true },
      { id: 2, text: 'Vì động cơ luôn đặt trong khoang kín của xe', is_correct: false },
      { id: 3, text: 'Vì động cơ chỉ hoạt động trong nhà xưởng', is_correct: false },
    ],
  },
  {
    id: 1002,
    lesson_id: 102,
    text: 'Nhóm nào là hai cơ cấu chính của động cơ pít tông?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 4, text: 'Cơ cấu trục khuỷu - thanh truyền và cơ cấu phân phối khí', is_correct: true },
      { id: 5, text: 'Hệ thống âm thanh và hệ thống chiếu sáng', is_correct: false },
      { id: 6, text: 'Bình nhiên liệu và bánh xe', is_correct: false },
    ],
  },
  {
    id: 1003,
    lesson_id: 103,
    text: 'Trong chu trình 4 kì, kì nào là kì sinh công?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 7, text: 'Kì cháy - giãn nở', is_correct: true },
      { id: 8, text: 'Kì nạp', is_correct: false },
      { id: 9, text: 'Kì thải', is_correct: false },
    ],
  },
  {
    id: 2001,
    lesson_id: 201,
    text: 'Trục khuỷu có nhiệm vụ chính nào?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 10, text: 'Biến chuyển động tịnh tiến của pít tông thành chuyển động quay', is_correct: true },
      { id: 11, text: 'Lọc sạch không khí trước khi vào động cơ', is_correct: false },
      { id: 12, text: 'Làm mát nước trong két', is_correct: false },
    ],
  },
  {
    id: 2002,
    lesson_id: 202,
    text: 'Cơ cấu phân phối khí cần đồng bộ với bộ phận nào?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 13, text: 'Vị trí pít tông và chuyển động trục khuỷu', is_correct: true },
      { id: 14, text: 'Màu sơn thân xe', is_correct: false },
      { id: 15, text: 'Áp suất lốp xe', is_correct: false },
    ],
  },
  {
    id: 3001,
    lesson_id: 301,
    text: 'Nếu động cơ thiếu dầu bôi trơn, nguy cơ nào dễ xảy ra?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 16, text: 'Ma sát tăng, chi tiết nhanh mòn hoặc bó kẹt', is_correct: true },
      { id: 17, text: 'Động cơ tự tăng công suất mãi mãi', is_correct: false },
      { id: 18, text: 'Xu páp tự đóng mở nhanh hơn', is_correct: false },
    ],
  },
  {
    id: 3002,
    lesson_id: 302,
    text: 'Điểm khác cơ bản giữa động cơ xăng và động cơ điêzen trong quá trình cháy là gì?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 19, text: 'Động cơ xăng thường dùng bugi đánh lửa, động cơ điêzen tự cháy nhờ không khí nén nóng', is_correct: true },
      { id: 20, text: 'Động cơ điêzen không cần không khí', is_correct: false },
      { id: 21, text: 'Động cơ xăng không có pít tông', is_correct: false },
    ],
  },
  {
    id: 3003,
    lesson_id: 303,
    text: 'Hệ thống khởi động có vai trò gì?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 22, text: 'Làm quay trục khuỷu ban đầu để động cơ bắt đầu làm việc', is_correct: true },
      { id: 23, text: 'Thay thế hoàn toàn hệ thống bôi trơn', is_correct: false },
      { id: 24, text: 'Làm xu páp biến mất', is_correct: false },
    ],
  },
]

export const interactiveActivities = {
  default: {
    flashcards: [
      {
        front: 'Động cơ đốt trong biến dạng năng lượng nào?',
        back: 'Biến nhiệt năng do nhiên liệu cháy thành cơ năng làm quay trục khuỷu.',
      },
      {
        front: 'Kì nào trong động cơ 4 kì là kì sinh công?',
        back: 'Kì cháy - giãn nở. Khí cháy đẩy pít tông đi xuống và truyền lực tới trục khuỷu.',
      },
      {
        front: 'Vì sao cần bôi trơn?',
        back: 'Để giảm ma sát, giảm mài mòn, làm mát và làm sạch các bề mặt làm việc.',
      },
    ],
    matching: [
      { term: 'Pít tông', answer: 'Nhận lực khí cháy và chuyển động trong xi lanh' },
      { term: 'Thanh truyền', answer: 'Truyền lực giữa pít tông và trục khuỷu' },
      { term: 'Trục khuỷu', answer: 'Biến chuyển động tịnh tiến thành chuyển động quay' },
      { term: 'Xu páp', answer: 'Đóng mở cửa nạp và cửa thải đúng thời điểm' },
    ],
    scenario: {
      title: 'Tình huống chẩn đoán',
      prompt:
        'Động cơ nóng nhanh, công suất giảm và có mùi khét. Hệ thống nào cần kiểm tra trước?',
      options: [
        {
          text: 'Hệ thống làm mát và bôi trơn',
          correct: true,
          feedback:
            'Đúng. Nóng nhanh và mùi khét thường liên quan đến làm mát kém hoặc thiếu dầu bôi trơn.',
        },
        {
          text: 'Hệ thống chiếu sáng',
          correct: false,
          feedback:
            'Chưa đúng. Hệ thống chiếu sáng không trực tiếp làm động cơ quá nhiệt.',
        },
        {
          text: 'Màu sơn thân xe',
          correct: false,
          feedback:
            'Chưa đúng. Màu sơn không liên quan đến quá trình sinh công và làm mát của động cơ.',
        },
      ],
    },
    explainChecklist: [
      'Nêu được nhiệm vụ của bộ phận hoặc hệ thống.',
      'Chỉ ra nó hoạt động ở kì nào trong chu trình.',
      'Giải thích nếu nó hỏng thì động cơ bị ảnh hưởng ra sao.',
    ],
  },
  103: {
    flashcards: [
      {
        front: 'Thứ tự đúng của chu trình 4 kì là gì?',
        back: 'Nạp → nén → cháy - giãn nở → thải.',
      },
      {
        front: 'Ở kì nén, xu páp ở trạng thái nào?',
        back: 'Cả xu páp nạp và xu páp thải đều đóng để môi chất bị nén trong xi lanh.',
      },
      {
        front: 'Trục khuỷu quay mấy vòng để hoàn thành một chu trình 4 kì?',
        back: 'Hai vòng quay trục khuỷu.',
      },
    ],
    matching: [
      { term: 'Kì nạp', answer: 'Xu páp nạp mở, môi chất mới đi vào xi lanh' },
      { term: 'Kì nén', answer: 'Hai xu páp đóng, môi chất bị nén lại' },
      { term: 'Kì cháy - giãn nở', answer: 'Khí cháy đẩy pít tông đi xuống và sinh công' },
      { term: 'Kì thải', answer: 'Xu páp thải mở, khí cháy đi ra ngoài' },
    ],
    scenario: {
      title: 'Tình huống phân tích chu trình',
      prompt:
        'Nếu xu páp thải mở sai thời điểm trong kì nén, điều gì dễ xảy ra?',
      options: [
        {
          text: 'Môi chất bị rò ra ngoài, áp suất nén giảm',
          correct: true,
          feedback:
            'Đúng. Kì nén cần buồng cháy kín; xu páp mở sai làm mất áp suất và giảm công suất.',
        },
        {
          text: 'Động cơ sinh công mạnh hơn',
          correct: false,
          feedback:
            'Chưa đúng. Mất áp suất nén làm quá trình cháy kém hiệu quả.',
        },
        {
          text: 'Pít tông không cần chuyển động nữa',
          correct: false,
          feedback:
            'Chưa đúng. Pít tông vẫn chuyển động theo trục khuỷu nhưng chu trình làm việc bị sai.',
        },
      ],
    },
    explainChecklist: [
      'Kể đúng bốn kì theo thứ tự.',
      'Mô tả hướng chuyển động của pít tông ở từng kì.',
      'Nêu trạng thái xu páp nạp và xu páp thải ở từng kì.',
      'Chỉ ra kì nào là kì sinh công.',
    ],
  },
}

sampleCourses.push({
  id: 4,
  title: 'Khái quát về ô tô',
  description:
    'Tìm hiểu vai trò, phân loại, cấu tạo chung và các hệ thống chính của ô tô hiện đại.',
  content:
    'Chủ đề giúp học sinh có cái nhìn tổng quan về ô tô trước khi đi sâu vào động cơ, hệ thống truyền lực, hệ thống di chuyển, điều khiển, điện - điện tử và các yêu cầu an toàn khi sử dụng.',
  thumbnail_url:
    'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=80',
})

sampleLessons.push(
  {
    id: 401,
    course_id: 4,
    title: 'Vai trò và phân loại ô tô',
    description:
      'Nắm được ô tô là phương tiện vận tải đường bộ quan trọng và biết phân loại theo công dụng, nguồn động lực, kết cấu.',
    content:
      'Ô tô là phương tiện giao thông đường bộ có khả năng tự di chuyển nhờ nguồn động lực đặt trên xe. Trong đời sống và sản xuất, ô tô dùng để chở người, chở hàng, phục vụ xây dựng, nông nghiệp, cứu hộ, quốc phòng và nhiều lĩnh vực dịch vụ. Có thể phân loại ô tô theo công dụng như ô tô con, ô tô khách, ô tô tải, ô tô chuyên dùng; theo nguồn động lực như ô tô dùng động cơ đốt trong, ô tô điện, ô tô lai; theo số cầu chủ động hoặc kiểu thân xe. Khi học khái quát về ô tô, cần hiểu rằng mỗi loại ô tô được thiết kế để đáp ứng nhiệm vụ sử dụng khác nhau.',
    key_points: [
      'Ô tô là phương tiện tự di chuyển trên đường bộ nhờ nguồn động lực đặt trên xe.',
      'Phân loại theo công dụng giúp nhận biết mục đích sử dụng của xe.',
      'Phân loại theo nguồn động lực giúp so sánh ô tô động cơ đốt trong, ô tô điện và ô tô lai.',
      'Kết cấu ô tô phụ thuộc vào nhiệm vụ vận chuyển, điều kiện làm việc và yêu cầu an toàn.',
    ],
    visual_steps: [
      {
        name: 'Chở người',
        piston: 'Ô tô con và ô tô khách ưu tiên sự tiện nghi, an toàn',
        valve: 'Bố trí khoang hành khách, ghế ngồi, điều hòa và hệ thống an toàn',
        result: 'Phục vụ nhu cầu đi lại của cá nhân và cộng đồng.',
        color: 'bg-sky-100 text-sky-800 border-sky-300',
      },
      {
        name: 'Chở hàng',
        piston: 'Ô tô tải ưu tiên khả năng chịu tải và độ bền',
        valve: 'Khung, hệ thống treo và truyền lực được thiết kế phù hợp tải trọng',
        result: 'Vận chuyển hàng hóa trong sản xuất và đời sống.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
      {
        name: 'Chuyên dùng',
        piston: 'Xe cứu hỏa, xe cẩu, xe trộn bê tông có thiết bị công tác riêng',
        valve: 'Kết cấu được bổ sung cơ cấu hoặc hệ thống phục vụ nhiệm vụ đặc biệt',
        result: 'Thực hiện các công việc chuyên môn mà xe thông thường không đảm nhiệm.',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      },
    ],
    order: 1,
  },
  {
    id: 402,
    course_id: 4,
    title: 'Cấu tạo chung của ô tô',
    description:
      'Nhận diện các phần chính của ô tô: động cơ, gầm, thân vỏ, hệ thống điện - điện tử và thiết bị an toàn.',
    content:
      'Một ô tô thường gồm nhiều cụm hệ thống phối hợp với nhau. Động cơ hoặc mô tơ điện tạo nguồn động lực. Hệ thống truyền lực đưa mô-men tới bánh xe chủ động. Hệ thống di chuyển gồm khung, cầu, bánh xe và hệ thống treo giúp xe chuyển động ổn định. Hệ thống điều khiển gồm lái và phanh giúp người lái định hướng, giảm tốc và dừng xe. Thân vỏ tạo không gian chở người hoặc hàng hóa, đồng thời bảo vệ người ngồi trên xe. Hệ thống điện - điện tử cung cấp năng lượng, điều khiển, chiếu sáng, thông tin và hỗ trợ an toàn.',
    key_points: [
      'Nguồn động lực tạo công suất cho xe chuyển động.',
      'Hệ thống truyền lực đưa mô-men từ nguồn động lực tới bánh xe.',
      'Hệ thống lái và phanh quyết định khả năng điều khiển an toàn.',
      'Thân vỏ và hệ thống điện - điện tử ngày càng quan trọng trên ô tô hiện đại.',
    ],
    visual_steps: [
      {
        name: 'Nguồn động lực',
        piston: 'Động cơ đốt trong, mô tơ điện hoặc kết hợp cả hai',
        valve: 'Biến năng lượng nhiên liệu hoặc điện năng thành cơ năng',
        result: 'Tạo công suất ban đầu cho xe.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Truyền lực',
        piston: 'Ly hợp, hộp số, trục truyền, cầu chủ động',
        valve: 'Thay đổi và truyền mô-men tới bánh xe',
        result: 'Giúp xe khởi hành, tăng tốc, leo dốc và lùi.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      {
        name: 'Điều khiển',
        piston: 'Hệ thống lái và hệ thống phanh',
        valve: 'Điều chỉnh hướng chuyển động và tốc độ',
        result: 'Bảo đảm xe vận hành theo ý người lái và an toàn.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
      {
        name: 'Thân vỏ - điện',
        piston: 'Khoang hành khách, vỏ xe, đèn, cảm biến, ECU',
        valve: 'Bảo vệ, chiếu sáng, điều khiển và hỗ trợ tiện nghi',
        result: 'Tăng độ an toàn, tiện nghi và khả năng vận hành thông minh.',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
      },
    ],
    order: 2,
  },
  {
    id: 403,
    course_id: 4,
    title: 'Bố trí chung và hệ thống truyền lực trên ô tô',
    description:
      'Hiểu cách bố trí động cơ, cầu chủ động và đường truyền công suất từ nguồn động lực tới bánh xe.',
    content:
      'Bố trí chung của ô tô thể hiện vị trí động cơ, hệ thống truyền lực và cầu chủ động. Một số xe đặt động cơ phía trước, dẫn động cầu trước; một số xe đặt động cơ phía trước, dẫn động cầu sau; xe địa hình hoặc xe tải có thể dẫn động nhiều cầu. Hệ thống truyền lực có nhiệm vụ truyền, biến đổi mô-men và tốc độ quay từ động cơ tới bánh xe chủ động. Các bộ phận thường gặp gồm ly hợp hoặc biến mô, hộp số, trục truyền, vi sai và bán trục. Khi học phần này, cần theo được đường đi của công suất: nguồn động lực -> truyền lực -> bánh xe -> mặt đường.',
    key_points: [
      'Bố trí động cơ và cầu chủ động ảnh hưởng đến đặc tính chuyển động của xe.',
      'Hệ thống truyền lực truyền và biến đổi mô-men phù hợp điều kiện chạy xe.',
      'Hộp số giúp xe khởi hành, thay đổi tốc độ, leo dốc và lùi.',
      'Vi sai cho phép hai bánh chủ động quay với tốc độ khác nhau khi xe quay vòng.',
    ],
    visual_steps: [
      {
        name: 'Động cơ',
        piston: 'Tạo mô-men quay',
        valve: 'Nguồn công suất đầu vào của hệ thống truyền lực',
        result: 'Cung cấp năng lượng để xe chuyển động.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Hộp số',
        piston: 'Thay đổi tỉ số truyền',
        valve: 'Tăng mô-men khi khởi hành hoặc leo dốc, tăng tốc độ khi chạy nhanh',
        result: 'Giúp xe phù hợp nhiều điều kiện vận hành.',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      },
      {
        name: 'Vi sai và bán trục',
        piston: 'Phân phối mô-men tới hai bánh chủ động',
        valve: 'Cho phép bánh trong và bánh ngoài quay khác tốc độ khi rẽ',
        result: 'Xe quay vòng êm và giảm mòn lốp.',
        color: 'bg-sky-100 text-sky-800 border-sky-300',
      },
      {
        name: 'Bánh xe',
        piston: 'Nhận mô-men và tạo lực kéo với mặt đường',
        valve: 'Biến mô-men thành chuyển động tịnh tiến của xe',
        result: 'Xe di chuyển theo hướng người lái điều khiển.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    ],
    order: 3,
  },
  {
    id: 404,
    course_id: 4,
    title: 'Các hệ thống an toàn, tiện nghi và bảo dưỡng cơ bản',
    description:
      'Khái quát vai trò của phanh, lái, treo, điện - điện tử, chiếu sáng và các nội dung bảo dưỡng thường gặp.',
    content:
      'Ô tô không chỉ cần nguồn động lực mạnh mà còn phải vận hành an toàn, ổn định và tiện nghi. Hệ thống phanh giúp giảm tốc và dừng xe; hệ thống lái điều khiển hướng chuyển động; hệ thống treo hấp thụ dao động, giữ bánh xe bám đường; hệ thống chiếu sáng và tín hiệu giúp quan sát, báo hiệu; hệ thống điện - điện tử điều khiển nhiều chức năng như phun nhiên liệu, đánh lửa, ABS, túi khí, điều hòa và thông tin giải trí. Bảo dưỡng cơ bản gồm kiểm tra dầu, nước làm mát, lốp, phanh, đèn, ắc quy và vệ sinh lọc gió theo khuyến cáo.',
    key_points: [
      'Phanh, lái và treo là các hệ thống ảnh hưởng trực tiếp đến an toàn chuyển động.',
      'Điện - điện tử giúp ô tô hiện đại điều khiển chính xác và hỗ trợ người lái.',
      'Bảo dưỡng định kì giúp phát hiện sớm hư hỏng và kéo dài tuổi thọ xe.',
      'Người sử dụng cần biết kiểm tra những dấu hiệu cơ bản trước khi vận hành.',
    ],
    visual_steps: [
      {
        name: 'An toàn chủ động',
        piston: 'Phanh, lái, treo, lốp, đèn',
        valve: 'Giúp tránh tai nạn trước khi xảy ra va chạm',
        result: 'Xe ổn định, dễ điều khiển và dễ quan sát.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      {
        name: 'An toàn bị động',
        piston: 'Dây an toàn, túi khí, thân vỏ hấp thụ va chạm',
        valve: 'Giảm chấn thương khi tai nạn xảy ra',
        result: 'Bảo vệ người ngồi trên xe.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Tiện nghi',
        piston: 'Điều hòa, ghế, âm thanh, màn hình, cảm biến',
        valve: 'Tăng sự thoải mái và hỗ trợ người lái',
        result: 'Nâng cao trải nghiệm sử dụng xe.',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
      },
      {
        name: 'Bảo dưỡng',
        piston: 'Dầu, nước làm mát, lốp, phanh, ắc quy, lọc gió',
        valve: 'Kiểm tra và thay thế theo chu kì',
        result: 'Giúp xe bền, an toàn và tiết kiệm chi phí sửa chữa.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    ],
    order: 4,
  }
)

sampleQuestions.push(
  {
    id: 4001,
    lesson_id: 401,
    text: 'Có thể phân loại ô tô theo tiêu chí nào?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 25, text: 'Theo công dụng, nguồn động lực hoặc kết cấu', is_correct: true },
      { id: 26, text: 'Chỉ theo màu sơn bên ngoài', is_correct: false },
      { id: 27, text: 'Chỉ theo số ghế mà không xét nhiệm vụ sử dụng', is_correct: false },
    ],
  },
  {
    id: 4002,
    lesson_id: 402,
    text: 'Hệ thống truyền lực trên ô tô có nhiệm vụ chính nào?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 28, text: 'Truyền và biến đổi mô-men từ nguồn động lực tới bánh xe chủ động', is_correct: true },
      { id: 29, text: 'Chỉ làm đẹp thân vỏ xe', is_correct: false },
      { id: 30, text: 'Chỉ phát tín hiệu đèn báo rẽ', is_correct: false },
    ],
  },
  {
    id: 4003,
    lesson_id: 403,
    text: 'Vì sao ô tô cần vi sai?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 31, text: 'Để hai bánh chủ động có thể quay khác tốc độ khi xe quay vòng', is_correct: true },
      { id: 32, text: 'Để làm mát nước trong két', is_correct: false },
      { id: 33, text: 'Để thay thế hoàn toàn hệ thống phanh', is_correct: false },
    ],
  },
  {
    id: 4004,
    lesson_id: 404,
    text: 'Nhóm nào ảnh hưởng trực tiếp đến an toàn chuyển động của ô tô?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 34, text: 'Hệ thống phanh, lái, treo và lốp', is_correct: true },
      { id: 35, text: 'Màu ghế và tem trang trí', is_correct: false },
      { id: 36, text: 'Âm lượng loa luôn là yếu tố duy nhất', is_correct: false },
    ],
  }
)

interactiveActivities[401] = {
  flashcards: [
    {
      front: 'Ô tô là gì?',
      back: 'Ô tô là phương tiện giao thông đường bộ có khả năng tự di chuyển nhờ nguồn động lực đặt trên xe.',
    },
    {
      front: 'Có thể phân loại ô tô theo những tiêu chí nào?',
      back: 'Theo công dụng, nguồn động lực, kiểu thân xe, số cầu chủ động hoặc kết cấu sử dụng.',
    },
    {
      front: 'Vì sao ô tô chuyên dùng có kết cấu khác ô tô con?',
      back: 'Vì ô tô chuyên dùng cần thêm thiết bị công tác để thực hiện nhiệm vụ đặc biệt như cứu hỏa, cẩu, trộn bê tông.',
    },
  ],
  matching: [
    { term: 'Ô tô con', answer: 'Chủ yếu chở người với số chỗ ngồi ít' },
    { term: 'Ô tô tải', answer: 'Chủ yếu vận chuyển hàng hóa' },
    { term: 'Ô tô khách', answer: 'Chở nhiều hành khách' },
    { term: 'Ô tô chuyên dùng', answer: 'Thực hiện nhiệm vụ đặc biệt nhờ thiết bị công tác riêng' },
  ],
  scenario: {
    title: 'Chọn loại ô tô phù hợp',
    prompt: 'Một công trình cần vận chuyển cát, đá với tải trọng lớn. Loại ô tô nào phù hợp nhất?',
    options: [
      {
        text: 'Ô tô tải',
        correct: true,
        feedback: 'Đúng. Ô tô tải được thiết kế để chở hàng hóa và chịu tải lớn.',
      },
      {
        text: 'Ô tô con',
        correct: false,
        feedback: 'Chưa đúng. Ô tô con chủ yếu dùng để chở người, không phù hợp tải trọng lớn.',
      },
      {
        text: 'Xe đua',
        correct: false,
        feedback: 'Chưa đúng. Xe đua ưu tiên tốc độ, không dùng để vận chuyển vật liệu.',
      },
    ],
  },
  explainChecklist: [
    'Nêu được vai trò của ô tô trong đời sống và sản xuất.',
    'Phân loại được ô tô theo công dụng.',
    'Phân biệt được nguồn động lực: động cơ đốt trong, điện, lai.',
  ],
}

interactiveActivities[402] = {
  flashcards: [
    {
      front: 'Ô tô gồm những phần chính nào?',
      back: 'Nguồn động lực, hệ thống truyền lực, hệ thống di chuyển, điều khiển, thân vỏ và điện - điện tử.',
    },
    {
      front: 'Hệ thống truyền lực làm nhiệm vụ gì?',
      back: 'Truyền và biến đổi mô-men từ nguồn động lực tới bánh xe chủ động.',
    },
    {
      front: 'Hệ thống điều khiển gồm những hệ thống nào?',
      back: 'Chủ yếu gồm hệ thống lái và hệ thống phanh.',
    },
  ],
  matching: [
    { term: 'Nguồn động lực', answer: 'Tạo công suất cho xe chuyển động' },
    { term: 'Truyền lực', answer: 'Đưa mô-men tới bánh xe chủ động' },
    { term: 'Hệ thống lái', answer: 'Điều khiển hướng chuyển động của xe' },
    { term: 'Hệ thống phanh', answer: 'Giảm tốc và dừng xe an toàn' },
  ],
  scenario: {
    title: 'Nhận diện cụm hệ thống',
    prompt: 'Xe khó chuyển hướng, người lái phải đánh lái rất nặng. Nên kiểm tra hệ thống nào trước?',
    options: [
      {
        text: 'Hệ thống lái',
        correct: true,
        feedback: 'Đúng. Triệu chứng khó chuyển hướng liên quan trực tiếp đến hệ thống lái.',
      },
      {
        text: 'Hệ thống âm thanh',
        correct: false,
        feedback: 'Chưa đúng. Âm thanh không điều khiển hướng chuyển động của xe.',
      },
      {
        text: 'Màu sơn thân xe',
        correct: false,
        feedback: 'Chưa đúng. Màu sơn không làm tay lái nặng.',
      },
    ],
  },
  explainChecklist: [
    'Kể được các cụm chính của ô tô.',
    'Nêu nhiệm vụ của nguồn động lực và truyền lực.',
    'Liên hệ hệ thống lái, phanh với an toàn chuyển động.',
  ],
}

interactiveActivities[403] = {
  flashcards: [
    {
      front: 'Đường truyền công suất trên ô tô đi theo mạch nào?',
      back: 'Nguồn động lực -> hệ thống truyền lực -> bánh xe chủ động -> mặt đường.',
    },
    {
      front: 'Hộp số có vai trò gì?',
      back: 'Thay đổi tỉ số truyền để xe khởi hành, tăng tốc, leo dốc hoặc lùi phù hợp.',
    },
    {
      front: 'Vi sai có tác dụng gì?',
      back: 'Cho phép hai bánh chủ động quay với tốc độ khác nhau khi xe quay vòng.',
    },
  ],
  matching: [
    { term: 'Ly hợp hoặc biến mô', answer: 'Nối, ngắt hoặc truyền công suất từ động cơ tới hộp số' },
    { term: 'Hộp số', answer: 'Thay đổi mô-men và tốc độ quay' },
    { term: 'Trục truyền', answer: 'Truyền công suất tới cầu chủ động' },
    { term: 'Vi sai', answer: 'Phân phối mô-men và cho phép bánh quay khác tốc độ khi rẽ' },
  ],
  scenario: {
    title: 'Xe vào cua',
    prompt: 'Khi ô tô quay vòng, bánh trong và bánh ngoài đi quãng đường khác nhau. Bộ phận nào giúp xử lý điều này?',
    options: [
      {
        text: 'Vi sai',
        correct: true,
        feedback: 'Đúng. Vi sai cho phép hai bánh chủ động quay với tốc độ khác nhau.',
      },
      {
        text: 'Bugi',
        correct: false,
        feedback: 'Chưa đúng. Bugi thuộc hệ thống đánh lửa của động cơ xăng.',
      },
      {
        text: 'Két nước',
        correct: false,
        feedback: 'Chưa đúng. Két nước thuộc hệ thống làm mát.',
      },
    ],
  },
  explainChecklist: [
    'Mô tả được đường truyền công suất trên ô tô.',
    'Nêu được vai trò của hộp số.',
    'Giải thích được vì sao cần vi sai khi quay vòng.',
  ],
}

interactiveActivities[404] = {
  flashcards: [
    {
      front: 'An toàn chủ động trên ô tô là gì?',
      back: 'Là các hệ thống giúp tránh tai nạn như phanh, lái, treo, lốp, chiếu sáng.',
    },
    {
      front: 'An toàn bị động là gì?',
      back: 'Là các kết cấu giảm chấn thương khi va chạm như dây an toàn, túi khí, thân vỏ hấp thụ lực.',
    },
    {
      front: 'Bảo dưỡng cơ bản cần kiểm tra gì?',
      back: 'Dầu, nước làm mát, lốp, phanh, đèn, ắc quy, lọc gió theo khuyến cáo.',
    },
  ],
  matching: [
    { term: 'Phanh', answer: 'Giảm tốc và dừng xe' },
    { term: 'Hệ thống treo', answer: 'Hấp thụ dao động và giữ bánh xe bám đường' },
    { term: 'Túi khí', answer: 'Giảm chấn thương khi va chạm' },
    { term: 'Đèn chiếu sáng', answer: 'Giúp quan sát và báo hiệu khi tham gia giao thông' },
  ],
  scenario: {
    title: 'Kiểm tra trước khi vận hành',
    prompt: 'Trước chuyến đi dài, việc nào nên thực hiện để tăng an toàn?',
    options: [
      {
        text: 'Kiểm tra lốp, phanh, đèn, dầu và nước làm mát',
        correct: true,
        feedback: 'Đúng. Đây là các hạng mục cơ bản ảnh hưởng trực tiếp đến an toàn và độ bền xe.',
      },
      {
        text: 'Chỉ tăng âm lượng loa',
        correct: false,
        feedback: 'Chưa đúng. Âm lượng loa không thay thế kiểm tra kĩ thuật.',
      },
      {
        text: 'Chỉ lau biển số xe',
        correct: false,
        feedback: 'Chưa đủ. Cần kiểm tra các hệ thống kĩ thuật quan trọng.',
      },
    ],
  },
  explainChecklist: [
    'Phân biệt được an toàn chủ động và an toàn bị động.',
    'Nêu vai trò của phanh, lái, treo và lốp.',
    'Kể được các hạng mục bảo dưỡng cơ bản trước khi vận hành.',
  ],
}

sampleCourses.push({
  id: 5,
  title: 'Giới thiệu chung về cơ khí động lực',
  description:
    'Bám theo Chương V SGK Công nghệ 11: khái quát về cơ khí động lực và các ngành nghề trong lĩnh vực cơ khí động lực.',
  content:
    'Cơ khí động lực nghiên cứu, thiết kế, chế tạo, khai thác và bảo dưỡng các máy động lực, phương tiện giao thông và hệ thống truyền động. Đây là phần kiến thức nền để học sinh hiểu vì sao động cơ, ô tô, máy kéo, tàu thủy, máy bay và các thiết bị động lực cần được học như một hệ thống.',
  thumbnail_url:
    'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=900&q=80',
})

sampleLessons.push(
  {
    id: 501,
    course_id: 5,
    title: 'Khái quát về cơ khí động lực',
    description:
      'Hiểu cơ khí động lực là gì, đối tượng nghiên cứu và vai trò của lĩnh vực này trong sản xuất, giao thông và đời sống.',
    content:
      'Cơ khí động lực là lĩnh vực của cơ khí liên quan đến nguồn động lực, hệ thống truyền động và các máy, phương tiện sử dụng nguồn động lực để thực hiện công việc. Đối tượng thường gặp gồm động cơ đốt trong, ô tô, máy kéo, xe máy, tàu thủy, máy bay, máy xây dựng và các thiết bị cơ giới. Trong chương trình Công nghệ 11, phần cơ khí động lực giúp học sinh liên hệ kiến thức cơ khí với phương tiện thực tế, đặc biệt là động cơ đốt trong và ô tô.',
    key_points: [
      'Cơ khí động lực gắn với máy và phương tiện có nguồn động lực.',
      'Đối tượng tiêu biểu gồm động cơ, ô tô, xe máy, tàu thủy, máy kéo và máy xây dựng.',
      'Kiến thức cơ khí động lực giúp hiểu cấu tạo, nguyên lí và cách khai thác thiết bị an toàn.',
      'Động cơ đốt trong và ô tô là hai nội dung trọng tâm trong phần cơ khí động lực ở SGK.',
    ],
    visual_steps: [
      {
        name: 'Nguồn động lực',
        piston: 'Động cơ đốt trong, mô tơ điện hoặc nguồn năng lượng khác',
        valve: 'Biến năng lượng thành cơ năng',
        result: 'Tạo công suất ban đầu cho máy hoặc phương tiện.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Truyền động',
        piston: 'Ly hợp, hộp số, trục truyền, xích, đai, bánh răng',
        valve: 'Truyền và biến đổi mô-men, tốc độ',
        result: 'Đưa công suất tới bộ phận công tác hoặc bánh xe.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      {
        name: 'Máy công tác',
        piston: 'Bánh xe, chân vịt, cơ cấu nâng, cơ cấu đào, bộ phận sản xuất',
        valve: 'Nhận công suất và thực hiện nhiệm vụ cụ thể',
        result: 'Tạo chuyển động, vận chuyển hoặc gia công theo yêu cầu.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    ],
    order: 1,
  },
  {
    id: 502,
    course_id: 5,
    title: 'Ngành nghề trong lĩnh vực cơ khí động lực',
    description:
      'Nhận biết một số nghề liên quan đến thiết kế, chế tạo, vận hành, bảo dưỡng và sửa chữa thiết bị cơ khí động lực.',
    content:
      'Lĩnh vực cơ khí động lực có nhiều nhóm nghề như kĩ thuật viên sửa chữa ô tô, kĩ sư động cơ, kĩ thuật viên bảo dưỡng xe máy, thợ máy tàu thủy, kĩ thuật viên máy xây dựng, kĩ sư thiết kế hệ thống truyền động và nhân viên kiểm định phương tiện. Người làm nghề cần hiểu cấu tạo, nguyên lí, biết đọc tài liệu kĩ thuật, sử dụng dụng cụ đo kiểm, tuân thủ quy trình an toàn và có khả năng cập nhật công nghệ mới.',
    key_points: [
      'Nghề cơ khí động lực gắn với thiết kế, chế tạo, bảo dưỡng, sửa chữa và kiểm định.',
      'Ô tô, xe máy, tàu thủy, máy xây dựng là các hướng nghề phổ biến.',
      'Người học cần năng lực kĩ thuật, an toàn lao động và kĩ năng chẩn đoán lỗi.',
      'Công nghệ điện - điện tử và tự động hóa ngày càng quan trọng trong ngành.',
    ],
    visual_steps: [
      {
        name: 'Thiết kế - chế tạo',
        piston: 'Tính toán, mô phỏng, chế tạo chi tiết và cụm hệ thống',
        valve: 'Dùng bản vẽ, phần mềm và thiết bị gia công',
        result: 'Tạo ra sản phẩm hoặc cải tiến hệ thống động lực.',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      },
      {
        name: 'Vận hành - khai thác',
        piston: 'Sử dụng máy và phương tiện đúng quy trình',
        valve: 'Theo dõi thông số, âm thanh, nhiệt độ, cảnh báo',
        result: 'Bảo đảm thiết bị làm việc an toàn, hiệu quả.',
        color: 'bg-sky-100 text-sky-800 border-sky-300',
      },
      {
        name: 'Bảo dưỡng - sửa chữa',
        piston: 'Kiểm tra, chẩn đoán, thay thế, điều chỉnh',
        valve: 'Dùng dụng cụ đo, máy chẩn đoán, tài liệu kĩ thuật',
        result: 'Khôi phục khả năng làm việc và kéo dài tuổi thọ thiết bị.',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      },
    ],
    order: 2,
  }
)

sampleLessons.push(
  {
    id: 405,
    course_id: 4,
    title: 'Hệ thống truyền lực trên ô tô',
    description:
      'Bám theo Bài 22 SGK: tìm hiểu nhiệm vụ, cấu tạo chung và nguyên lí truyền công suất tới bánh xe chủ động.',
    content:
      'Hệ thống truyền lực có nhiệm vụ truyền và biến đổi mô-men từ động cơ hoặc mô tơ điện tới bánh xe chủ động. Trên ô tô dùng động cơ đốt trong, hệ thống truyền lực thường gồm ly hợp hoặc biến mô, hộp số, trục truyền, cầu chủ động, vi sai và bán trục. Hệ thống này giúp xe khởi hành êm, thay đổi tốc độ, leo dốc, lùi và phân phối công suất phù hợp điều kiện mặt đường.',
    key_points: [
      'Truyền lực đưa mô-men từ nguồn động lực tới bánh xe chủ động.',
      'Hộp số thay đổi tỉ số truyền để phù hợp tốc độ và tải.',
      'Vi sai giúp hai bánh chủ động quay khác tốc độ khi xe quay vòng.',
      'Bố trí truyền lực phụ thuộc vị trí động cơ và cầu chủ động.',
    ],
    visual_steps: [
      {
        name: 'Động cơ',
        piston: 'Tạo mô-men quay',
        valve: 'Nguồn công suất đầu vào',
        result: 'Cung cấp năng lượng cho hệ thống truyền lực.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Ly hợp hoặc biến mô',
        piston: 'Nối, ngắt hoặc truyền công suất êm',
        valve: 'Giúp xe khởi hành và sang số thuận lợi',
        result: 'Bảo vệ hệ truyền lực và tăng độ êm dịu.',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      },
      {
        name: 'Hộp số - trục truyền',
        piston: 'Biến đổi và truyền mô-men',
        valve: 'Thay đổi tỉ số truyền theo điều kiện vận hành',
        result: 'Xe chạy được ở nhiều tốc độ và tải khác nhau.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      {
        name: 'Vi sai - bánh xe',
        piston: 'Phân phối công suất tới bánh chủ động',
        valve: 'Cho phép bánh quay khác tốc độ khi rẽ',
        result: 'Tạo lực kéo làm xe chuyển động.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    ],
    order: 5,
  },
  {
    id: 406,
    course_id: 4,
    title: 'Bánh xe và hệ thống treo ô tô',
    description:
      'Bám theo Bài 23 SGK: hiểu nhiệm vụ của bánh xe, lốp và hệ thống treo đối với chuyển động êm, ổn định.',
    content:
      'Bánh xe tiếp xúc trực tiếp với mặt đường, tạo lực kéo, lực phanh và lực dẫn hướng. Lốp giúp bám đường, giảm chấn và chịu tải. Hệ thống treo nối bánh xe với khung hoặc thân xe, có nhiệm vụ đỡ trọng lượng xe, hấp thụ dao động từ mặt đường, giữ bánh xe tiếp xúc tốt với mặt đường và tăng độ êm dịu. Các bộ phận thường gặp của hệ thống treo gồm phần tử đàn hồi, giảm chấn và cơ cấu dẫn hướng.',
    key_points: [
      'Bánh xe và lốp ảnh hưởng trực tiếp đến bám đường, phanh và ổn định.',
      'Hệ thống treo giúp xe chạy êm và giữ bánh xe tiếp xúc với mặt đường.',
      'Giảm chấn hạn chế dao động kéo dài sau khi xe đi qua chỗ xóc.',
      'Áp suất lốp, độ mòn lốp và tình trạng treo cần được kiểm tra định kì.',
    ],
    visual_steps: [
      {
        name: 'Lốp',
        piston: 'Tiếp xúc mặt đường và tạo ma sát',
        valve: 'Chịu tải, truyền lực kéo và lực phanh',
        result: 'Quyết định độ bám và an toàn chuyển động.',
        color: 'bg-slate-100 text-slate-800 border-slate-300',
      },
      {
        name: 'Mâm và bánh xe',
        piston: 'Đỡ lốp và truyền mô-men',
        valve: 'Liên kết với moay-ơ và hệ thống truyền lực',
        result: 'Biến mô-men thành chuyển động lăn.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      {
        name: 'Phần tử đàn hồi',
        piston: 'Lò xo, nhíp hoặc khí nén',
        valve: 'Hấp thụ va đập từ mặt đường',
        result: 'Tăng độ êm dịu cho xe.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
      {
        name: 'Giảm chấn',
        piston: 'Dập tắt dao động của thân xe',
        valve: 'Giúp bánh xe bám đường ổn định',
        result: 'Xe ít bị nảy và dễ điều khiển hơn.',
        color: 'bg-purple-100 text-purple-800 border-purple-300',
      },
    ],
    order: 6,
  },
  {
    id: 407,
    course_id: 4,
    title: 'Hệ thống lái',
    description:
      'Bám theo Bài 24 SGK: nhận biết nhiệm vụ, cấu tạo chung và yêu cầu làm việc của hệ thống lái.',
    content:
      'Hệ thống lái dùng để thay đổi và giữ hướng chuyển động của ô tô theo ý người lái. Cấu tạo chung gồm vành tay lái, trục lái, cơ cấu lái, dẫn động lái và bánh xe dẫn hướng. Trên ô tô hiện đại, hệ thống lái thường có trợ lực thủy lực hoặc điện để giảm lực đánh lái. Hệ thống lái phải làm việc chính xác, nhẹ, ổn định và không bị rơ lỏng bất thường.',
    key_points: [
      'Hệ thống lái điều khiển hướng chuyển động của ô tô.',
      'Cơ cấu lái biến chuyển động quay của vô lăng thành chuyển động quay bánh dẫn hướng.',
      'Trợ lực lái giúp giảm lực điều khiển cho người lái.',
      'Độ rơ, tiếng kêu hoặc lệch lái là dấu hiệu cần kiểm tra.',
    ],
    visual_steps: [
      {
        name: 'Vô lăng',
        piston: 'Người lái tác dụng lực quay',
        valve: 'Tạo tín hiệu cơ khí hoặc điện cho hệ thống lái',
        result: 'Bắt đầu quá trình đổi hướng xe.',
        color: 'bg-sky-100 text-sky-800 border-sky-300',
      },
      {
        name: 'Cơ cấu lái',
        piston: 'Biến chuyển động quay thành chuyển động điều khiển bánh',
        valve: 'Tăng mô-men và đổi hướng truyền lực',
        result: 'Bánh dẫn hướng quay theo góc phù hợp.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      {
        name: 'Dẫn động lái',
        piston: 'Thanh kéo, đòn quay, rô-tuyn',
        valve: 'Truyền chuyển động tới bánh xe dẫn hướng',
        result: 'Hai bánh trước phối hợp khi xe quay vòng.',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      },
    ],
    order: 7,
  },
  {
    id: 408,
    course_id: 4,
    title: 'Hệ thống phanh và an toàn khi tham gia giao thông',
    description:
      'Bám theo Bài 25 SGK: hiểu nhiệm vụ hệ thống phanh, yêu cầu an toàn và ý thức khi tham gia giao thông.',
    content:
      'Hệ thống phanh có nhiệm vụ giảm tốc, dừng xe và giữ xe đứng yên khi cần thiết. Phanh phải làm việc tin cậy, hiệu quả và ổn định. Trên ô tô hiện đại có thể có phanh thủy lực, phanh khí nén, phanh đĩa, phanh tang trống và các hệ thống hỗ trợ như ABS. Khi tham gia giao thông, người sử dụng cần kiểm tra phanh, lốp, đèn, gương, thắt dây an toàn, giữ khoảng cách, tuân thủ tốc độ và biển báo.',
    key_points: [
      'Phanh là hệ thống an toàn quan trọng bậc nhất trên ô tô.',
      'ABS giúp hạn chế bó cứng bánh xe khi phanh gấp.',
      'Cần kiểm tra phanh, lốp, đèn và gương trước khi vận hành.',
      'An toàn giao thông phụ thuộc cả kĩ thuật xe và ý thức người tham gia.',
    ],
    visual_steps: [
      {
        name: 'Bàn đạp phanh',
        piston: 'Người lái tác dụng lực',
        valve: 'Tạo áp suất dầu hoặc khí nén trong hệ thống',
        result: 'Khởi đầu quá trình giảm tốc.',
        color: 'bg-red-100 text-red-800 border-red-300',
      },
      {
        name: 'Cơ cấu phanh',
        piston: 'Má phanh ép vào đĩa hoặc tang trống',
        valve: 'Tạo ma sát cản chuyển động quay của bánh xe',
        result: 'Xe giảm tốc hoặc dừng lại.',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
      },
      {
        name: 'ABS và hỗ trợ',
        piston: 'Cảm biến theo dõi tốc độ bánh xe',
        valve: 'Điều chỉnh áp suất phanh khi có nguy cơ bó cứng',
        result: 'Giúp xe ổn định hơn khi phanh gấp.',
        color: 'bg-blue-100 text-blue-800 border-blue-300',
      },
      {
        name: 'An toàn giao thông',
        piston: 'Dây an toàn, tốc độ, khoảng cách, quan sát',
        valve: 'Kết hợp kĩ năng người lái và tình trạng xe',
        result: 'Giảm nguy cơ tai nạn khi tham gia giao thông.',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      },
    ],
    order: 8,
  }
)

sampleQuestions.push(
  {
    id: 5001,
    lesson_id: 501,
    text: 'Đối tượng nào thuộc lĩnh vực cơ khí động lực?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 37, text: 'Động cơ, ô tô, xe máy, tàu thủy, máy kéo', is_correct: true },
      { id: 38, text: 'Chỉ có thước kẻ và compa', is_correct: false },
      { id: 39, text: 'Chỉ có đồ dùng trang trí', is_correct: false },
    ],
  },
  {
    id: 5002,
    lesson_id: 502,
    text: 'Năng lực nào quan trọng với nghề bảo dưỡng, sửa chữa ô tô?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 40, text: 'Hiểu cấu tạo, biết chẩn đoán lỗi và tuân thủ an toàn', is_correct: true },
      { id: 41, text: 'Chỉ cần chọn màu xe đẹp', is_correct: false },
      { id: 42, text: 'Không cần đọc tài liệu kĩ thuật', is_correct: false },
    ],
  },
  {
    id: 4005,
    lesson_id: 405,
    text: 'Bộ phận nào giúp hai bánh chủ động quay khác tốc độ khi ô tô quay vòng?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 43, text: 'Vi sai', is_correct: true },
      { id: 44, text: 'Bugi', is_correct: false },
      { id: 45, text: 'Két nước', is_correct: false },
    ],
  },
  {
    id: 4006,
    lesson_id: 406,
    text: 'Hệ thống treo có nhiệm vụ chính nào?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 46, text: 'Đỡ xe, hấp thụ dao động và giữ bánh xe bám đường', is_correct: true },
      { id: 47, text: 'Tạo tia lửa điện trong xi lanh', is_correct: false },
      { id: 48, text: 'Thay thế toàn bộ hệ thống lái', is_correct: false },
    ],
  },
  {
    id: 4007,
    lesson_id: 407,
    text: 'Hệ thống lái dùng để làm gì?',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points: 1,
    options: [
      { id: 49, text: 'Thay đổi và giữ hướng chuyển động của ô tô', is_correct: true },
      { id: 50, text: 'Làm mát dầu bôi trơn', is_correct: false },
      { id: 51, text: 'Chỉ phát âm thanh giải trí', is_correct: false },
    ],
  },
  {
    id: 4008,
    lesson_id: 408,
    text: 'ABS có tác dụng gì khi phanh gấp?',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    points: 1,
    options: [
      { id: 52, text: 'Hạn chế bó cứng bánh xe, giúp xe ổn định hơn', is_correct: true },
      { id: 53, text: 'Làm xe tăng tốc nhanh hơn khi phanh', is_correct: false },
      { id: 54, text: 'Tắt toàn bộ đèn chiếu sáng', is_correct: false },
    ],
  }
)

interactiveActivities[501] = {
  flashcards: [
    {
      front: 'Cơ khí động lực nghiên cứu nội dung gì?',
      back: 'Nguồn động lực, hệ thống truyền động và máy hoặc phương tiện sử dụng nguồn động lực.',
    },
    {
      front: 'Đối tượng tiêu biểu của cơ khí động lực là gì?',
      back: 'Động cơ, ô tô, xe máy, tàu thủy, máy kéo, máy xây dựng và các thiết bị cơ giới.',
    },
    {
      front: 'Vì sao cần học cơ khí động lực trước khi học ô tô?',
      back: 'Vì ô tô là một hệ thống động lực gồm nguồn công suất, truyền lực, điều khiển và cơ cấu công tác.',
    },
  ],
  matching: [
    { term: 'Nguồn động lực', answer: 'Tạo công suất ban đầu' },
    { term: 'Truyền động', answer: 'Truyền và biến đổi mô-men, tốc độ' },
    { term: 'Máy công tác', answer: 'Nhận công suất và thực hiện nhiệm vụ' },
    { term: 'Khai thác', answer: 'Vận hành thiết bị đúng quy trình và an toàn' },
  ],
  scenario: {
    title: 'Nhận diện lĩnh vực',
    prompt: 'Một kĩ thuật viên sửa chữa hộp số ô tô đang làm việc trong lĩnh vực nào?',
    options: [
      {
        text: 'Cơ khí động lực',
        correct: true,
        feedback: 'Đúng. Hộp số thuộc hệ thống truyền lực của phương tiện động lực.',
      },
      {
        text: 'May mặc',
        correct: false,
        feedback: 'Chưa đúng. May mặc không nghiên cứu hệ thống truyền lực ô tô.',
      },
      {
        text: 'Trang trí nội thất',
        correct: false,
        feedback: 'Chưa đúng. Công việc này liên quan trực tiếp tới cơ khí động lực.',
      },
    ],
  },
  explainChecklist: [
    'Nêu được khái niệm cơ khí động lực.',
    'Kể được các đối tượng tiêu biểu.',
    'Giải thích được mối liên hệ giữa động cơ, truyền lực và máy công tác.',
  ],
}

interactiveActivities[502] = {
  flashcards: [
    {
      front: 'Một số nghề trong cơ khí động lực là gì?',
      back: 'Kĩ thuật viên sửa chữa ô tô, kĩ sư động cơ, thợ máy tàu thủy, kĩ thuật viên máy xây dựng, kiểm định viên.',
    },
    {
      front: 'Người làm nghề cần phẩm chất gì?',
      back: 'Cẩn thận, tuân thủ an toàn, biết đọc tài liệu kĩ thuật, chẩn đoán lỗi và cập nhật công nghệ.',
    },
    {
      front: 'Vì sao điện - điện tử quan trọng trong ngành này?',
      back: 'Vì ô tô và thiết bị động lực hiện đại dùng nhiều cảm biến, ECU, mô tơ điện và hệ thống điều khiển tự động.',
    },
  ],
  matching: [
    { term: 'Kĩ thuật viên ô tô', answer: 'Bảo dưỡng, sửa chữa, chẩn đoán lỗi trên xe' },
    { term: 'Kĩ sư động cơ', answer: 'Thiết kế, kiểm tra và cải tiến nguồn động lực' },
    { term: 'Kiểm định viên', answer: 'Đánh giá tình trạng an toàn kĩ thuật của phương tiện' },
    { term: 'Thợ máy tàu thủy', answer: 'Vận hành và sửa chữa hệ động lực tàu' },
  ],
  scenario: {
    title: 'Chọn năng lực nghề',
    prompt: 'Khi xe báo lỗi động cơ, kĩ thuật viên cần làm gì trước?',
    options: [
      {
        text: 'Đọc mã lỗi, kiểm tra tài liệu và chẩn đoán theo quy trình',
        correct: true,
        feedback: 'Đúng. Chẩn đoán cần dữ liệu, tài liệu kĩ thuật và quy trình an toàn.',
      },
      {
        text: 'Tháo ngẫu nhiên mọi chi tiết',
        correct: false,
        feedback: 'Chưa đúng. Tháo lắp không theo quy trình dễ gây hư hỏng và mất an toàn.',
      },
      {
        text: 'Bỏ qua cảnh báo',
        correct: false,
        feedback: 'Chưa đúng. Cảnh báo cần được kiểm tra để tránh hư hỏng nặng hơn.',
      },
    ],
  },
  explainChecklist: [
    'Kể được một số nghề trong cơ khí động lực.',
    'Nêu được năng lực kĩ thuật cần có.',
    'Giải thích được vai trò của an toàn lao động trong nghề.',
  ],
}

interactiveActivities[405] = interactiveActivities[403]
interactiveActivities[406] = interactiveActivities[404]
interactiveActivities[407] = {
  flashcards: [
    {
      front: 'Hệ thống lái có nhiệm vụ gì?',
      back: 'Thay đổi và giữ hướng chuyển động của ô tô theo ý người lái.',
    },
    {
      front: 'Cơ cấu lái làm gì?',
      back: 'Biến chuyển động quay của vô lăng thành chuyển động điều khiển bánh dẫn hướng.',
    },
    {
      front: 'Trợ lực lái có tác dụng gì?',
      back: 'Giảm lực đánh lái, giúp điều khiển xe nhẹ và thuận tiện hơn.',
    },
  ],
  matching: [
    { term: 'Vô lăng', answer: 'Nơi người lái tác dụng lực điều khiển' },
    { term: 'Trục lái', answer: 'Truyền chuyển động từ vô lăng tới cơ cấu lái' },
    { term: 'Cơ cấu lái', answer: 'Biến đổi chuyển động để quay bánh dẫn hướng' },
    { term: 'Dẫn động lái', answer: 'Truyền chuyển động tới các bánh xe dẫn hướng' },
  ],
  scenario: {
    title: 'Chẩn đoán hệ thống lái',
    prompt: 'Xe bị lệch hướng dù vô lăng giữ thẳng. Nên kiểm tra nhóm nào?',
    options: [
      {
        text: 'Hệ thống lái, lốp và góc đặt bánh xe',
        correct: true,
        feedback: 'Đúng. Lệch hướng thường liên quan đến lái, lốp hoặc góc đặt bánh.',
      },
      {
        text: 'Hệ thống âm thanh',
        correct: false,
        feedback: 'Chưa đúng. Âm thanh không quyết định hướng chuyển động.',
      },
      {
        text: 'Màu sơn cửa xe',
        correct: false,
        feedback: 'Chưa đúng. Màu sơn không làm xe lệch hướng.',
      },
    ],
  },
  explainChecklist: [
    'Nêu nhiệm vụ hệ thống lái.',
    'Kể các bộ phận chính của hệ thống lái.',
    'Giải thích dấu hiệu cần kiểm tra như rơ lái, nặng lái, lệch lái.',
  ],
}

interactiveActivities[408] = {
  flashcards: [
    {
      front: 'Hệ thống phanh có nhiệm vụ gì?',
      back: 'Giảm tốc, dừng xe và giữ xe đứng yên khi cần thiết.',
    },
    {
      front: 'ABS giúp gì khi phanh gấp?',
      back: 'Hạn chế bó cứng bánh xe, giúp xe ổn định và còn khả năng điều khiển hướng tốt hơn.',
    },
    {
      front: 'Trước khi đi xa cần kiểm tra gì?',
      back: 'Phanh, lốp, đèn, gương, dầu, nước làm mát, dây an toàn và tình trạng cảnh báo.',
    },
  ],
  matching: [
    { term: 'Bàn đạp phanh', answer: 'Nơi người lái tác dụng lực phanh' },
    { term: 'Má phanh', answer: 'Tạo ma sát với đĩa hoặc tang trống' },
    { term: 'ABS', answer: 'Hạn chế bó cứng bánh xe khi phanh gấp' },
    { term: 'Dây an toàn', answer: 'Giữ người ngồi trên xe khi phanh gấp hoặc va chạm' },
  ],
  scenario: {
    title: 'An toàn giao thông',
    prompt: 'Khi trời mưa, đường trơn, người lái cần làm gì?',
    options: [
      {
        text: 'Giảm tốc, tăng khoảng cách và phanh nhẹ nhàng',
        correct: true,
        feedback: 'Đúng. Đường trơn làm giảm bám đường nên cần lái xe thận trọng.',
      },
      {
        text: 'Tăng tốc và phanh gấp liên tục',
        correct: false,
        feedback: 'Chưa đúng. Cách này dễ làm xe mất ổn định.',
      },
      {
        text: 'Tắt đèn và không quan sát gương',
        correct: false,
        feedback: 'Chưa đúng. Cần tăng khả năng quan sát và báo hiệu.',
      },
    ],
  },
  explainChecklist: [
    'Nêu nhiệm vụ hệ thống phanh.',
    'Giải thích vai trò ABS.',
    'Kể được hành vi an toàn khi tham gia giao thông.',
  ],
}

export const getInteractiveActivity = (lessonId) =>
  interactiveActivities[Number(lessonId)] || interactiveActivities.default

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

export const getTutorReply = (message, lessonId) => {
  const lesson = getSampleLesson(lessonId)
  const text = message.toLowerCase()

  if (text.includes('sgk') || text.includes('công nghệ 11')) {
    return 'Có thể học theo mạch: khái niệm và phân loại -> cấu tạo chung -> nguyên lý 4 kì -> cơ cấu chính -> các hệ thống phục vụ. Mạch này giúp em không học rời rạc từng bộ phận.'
  }

  if (text.includes('quiz') || text.includes('kiểm tra')) {
    return 'Hãy làm quiz sau mỗi bài. Khi sai, em nên quay lại hỏi: bộ phận đó thuộc cơ cấu chính hay hệ thống phục vụ, và nó tham gia vào kì nào của chu trình.'
  }

  if (text.includes('4') || text.includes('bốn') || text.includes('chu trình')) {
    return 'Chu trình 4 kì gồm nạp, nén, cháy - giãn nở và thải. Kì cháy - giãn nở là kì sinh công; ba kì còn lại chuẩn bị hoặc làm sạch xi lanh.'
  }

  if (text.includes('trục khuỷu') || text.includes('thanh truyền') || text.includes('pít tông')) {
    return 'Pít tông nhận lực khí cháy, thanh truyền truyền lực, trục khuỷu biến chuyển động tịnh tiến thành chuyển động quay. Đây là lõi của cơ cấu trục khuỷu - thanh truyền.'
  }

  if (text.includes('xu páp') || text.includes('phân phối khí') || text.includes('van')) {
    return 'Cơ cấu phân phối khí điều khiển xu páp nạp và xu páp thải đóng mở đúng thời điểm. Nếu sai thời điểm, động cơ nạp không đủ, thải không sạch và giảm công suất.'
  }

  if (text.includes('bôi trơn') || text.includes('làm mát')) {
    return 'Bôi trơn giảm ma sát và mài mòn; làm mát giữ nhiệt độ động cơ trong giới hạn cho phép. Hai hệ thống này quyết định độ bền và độ ổn định khi động cơ làm việc lâu.'
  }

  if (lesson) {
    return `Bài "${lesson.title}" nên học theo 3 câu hỏi: bộ phận/hệ thống này làm nhiệm vụ gì, hoạt động ở thời điểm nào của chu trình, và nếu hỏng thì động cơ bị ảnh hưởng ra sao.`
  }

  return 'Em có thể hỏi về khái niệm, phân loại, chu trình 4 kì, cơ cấu trục khuỷu - thanh truyền, phân phối khí, bôi trơn, làm mát, nhiên liệu, đánh lửa hoặc khởi động.'
}
