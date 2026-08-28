import { buildChapterMiniTestQuestions, getMiniTestDuration } from './chapterMiniTests'

export const canhDieuCourses = [
  {
    id: 1,
    title: 'Chương 1. Cơ khí chế tạo và nghề nghiệp cơ khí',
    description:
      'Khái quát vai trò của cơ khí chế tạo, sản phẩm cơ khí và định hướng nghề nghiệp trong lĩnh vực cơ khí.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    title: 'Chương 2. Vật liệu và gia công cơ khí',
    description:
      'Học cách phân loại vật liệu, lựa chọn vật liệu và nhận biết các phương pháp gia công cơ khí phổ biến.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: 'Chương 3. Sản xuất cơ khí, tự động hóa và an toàn',
    description:
      'Tìm hiểu sản xuất cơ khí hiện đại, dây chuyền tự động, máy CNC, robot và nguyên tắc an toàn lao động.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    title: 'Chương 4. Cơ khí động lực và động cơ đốt trong',
    description:
      'Nắm khái quát cơ khí động lực, cấu tạo chung và nguyên lí làm việc của động cơ đốt trong.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: 'Chương 5. Khái quát về ô tô',
    description:
      'Học cấu tạo chung của ô tô và nhiệm vụ các hệ thống chính: truyền lực, treo, lái, phanh, điện - điều khiển.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  },
]

export const canhDieuLessons = [
  {
    id: 101,
    course_id: 1,
    title: 'Khái quát về cơ khí chế tạo',
    description: 'Nhận biết vai trò, sản phẩm và quy trình tạo sản phẩm cơ khí trong sản xuất và đời sống.',
    content:
      'Cơ khí chế tạo là lĩnh vực thiết kế, chế tạo, lắp ráp và kiểm tra các chi tiết, cụm chi tiết, máy và thiết bị. Đây là nền tảng của nhiều ngành công nghiệp vì hầu hết dây chuyền sản xuất, phương tiện và máy công tác đều cần sản phẩm cơ khí.',
    order: 1,
    key_points: [
      'Cơ khí chế tạo tạo ra chi tiết, cụm chi tiết, máy và thiết bị.',
      'Sản phẩm cơ khí phải đáp ứng công dụng, độ bền, độ chính xác, tính kinh tế và an toàn.',
      'Quy trình tạo sản phẩm gồm xác định yêu cầu, thiết kế, chọn vật liệu, gia công, lắp ráp và kiểm tra.',
    ],
  },
  {
    id: 102,
    course_id: 1,
    title: 'Ngành nghề trong lĩnh vực cơ khí',
    description: 'Tìm hiểu nhóm nghề cơ khí, yêu cầu năng lực và định hướng học tập nghề nghiệp.',
    content:
      'Lĩnh vực cơ khí có nhiều nghề như thiết kế cơ khí, gia công cắt gọt, hàn, vận hành máy CNC, lắp ráp, kiểm tra chất lượng, bảo dưỡng và sửa chữa thiết bị. Người học cần rèn tư duy kĩ thuật, đọc bản vẽ, đo kiểm, thao tác chính xác và tuân thủ an toàn.',
    order: 2,
    key_points: [
      'Nghề cơ khí gắn với thiết kế, chế tạo, vận hành, bảo dưỡng, sửa chữa và kiểm tra.',
      'Năng lực cốt lõi là đọc bản vẽ, hiểu vật liệu, đo kiểm và làm việc an toàn.',
      'Cơ khí hiện đại gắn với CNC, robot, tự động hóa và chuyển đổi số trong sản xuất.',
    ],
  },
  {
    id: 201,
    course_id: 2,
    title: 'Vật liệu cơ khí và lựa chọn vật liệu',
    description: 'Phân loại vật liệu cơ khí và lựa chọn vật liệu theo điều kiện làm việc của chi tiết.',
    content:
      'Vật liệu cơ khí gồm vật liệu kim loại, vật liệu phi kim và vật liệu composite. Chọn vật liệu phải căn cứ vào công dụng, tải trọng, môi trường, độ bền, độ cứng, khả năng chống mài mòn, chống ăn mòn, khối lượng, khả năng gia công và giá thành.',
    order: 1,
    key_points: [
      'Gang, thép, kim loại màu thường dùng cho chi tiết chịu lực hoặc cần tính dẫn nhiệt, dẫn điện.',
      'Chất dẻo, cao su, gốm và composite có ưu điểm về khối lượng, cách điện, giảm chấn hoặc chống ăn mòn.',
      'Chọn vật liệu đúng giúp chi tiết làm việc bền, an toàn và kinh tế.',
    ],
  },
  {
    id: 202,
    course_id: 2,
    title: 'Gia công cơ khí và quy trình công nghệ',
    description: 'Nhận biết đúc, hàn, gia công áp lực, cắt gọt và ý nghĩa của quy trình công nghệ.',
    content:
      'Gia công cơ khí là quá trình làm thay đổi hình dạng, kích thước, trạng thái bề mặt hoặc tính chất của phôi để tạo chi tiết đạt yêu cầu. Các phương pháp thường gặp là đúc, hàn, gia công áp lực, tiện, phay, khoan, mài và gia công CNC.',
    order: 2,
    key_points: [
      'Đúc tạo phôi hoặc chi tiết có hình dạng phức tạp.',
      'Hàn liên kết các chi tiết kim loại.',
      'Gia công cắt gọt tạo độ chính xác kích thước và độ nhẵn bề mặt cao.',
      'Quy trình công nghệ giúp sản xuất ổn định, giảm sai hỏng và kiểm soát chất lượng.',
    ],
  },
  {
    id: 301,
    course_id: 3,
    title: 'Sản xuất cơ khí hiện đại và tự động hóa',
    description: 'Tìm hiểu dây chuyền sản xuất, máy CNC, robot, cảm biến và điều khiển tự động.',
    content:
      'Sản xuất cơ khí hiện đại được tổ chức theo dây chuyền, sử dụng máy CNC, robot, cảm biến, băng tải và hệ thống điều khiển để nâng cao năng suất, độ chính xác và chất lượng. Tự động hóa giúp quá trình sản xuất lặp lại ổn định và giảm sai lỗi.',
    order: 1,
    key_points: [
      'Dây chuyền sản xuất giúp các công đoạn liên tục, đồng bộ và dễ kiểm soát.',
      'Máy CNC gia công theo chương trình, cho độ chính xác và tính lặp lại cao.',
      'Robot và cảm biến hỗ trợ thao tác, kiểm tra, vận chuyển và giám sát sản xuất.',
    ],
  },
  {
    id: 302,
    course_id: 3,
    title: 'An toàn lao động trong sản xuất cơ khí',
    description: 'Học các quy tắc an toàn khi sử dụng dụng cụ, máy móc và thiết bị cơ khí.',
    content:
      'An toàn lao động là yêu cầu bắt buộc trong học tập và sản xuất cơ khí. Người học cần dùng bảo hộ, kiểm tra thiết bị trước khi làm việc, vận hành đúng quy trình, không chạm vào bộ phận chuyển động và báo cáo ngay khi có dấu hiệu bất thường.',
    order: 2,
    key_points: [
      'Trước khi làm việc cần kiểm tra máy, dụng cụ, nguồn điện và khu vực xung quanh.',
      'Trong khi làm việc phải tập trung, dùng dụng cụ đúng cách và không đùa nghịch.',
      'Sau khi làm việc cần tắt máy, vệ sinh khu vực và sắp xếp dụng cụ.',
    ],
  },
  {
    id: 401,
    course_id: 4,
    title: 'Khái quát về cơ khí động lực',
    description: 'Nhận biết đối tượng, vai trò và ngành nghề của cơ khí động lực.',
    content:
      'Cơ khí động lực liên quan đến máy động lực, phương tiện và hệ thống sử dụng năng lượng để tạo chuyển động. Đối tượng thường gặp là động cơ đốt trong, ô tô, xe máy, máy kéo, tàu thủy, máy xây dựng và các hệ thống truyền động, điều khiển, an toàn.',
    order: 1,
    key_points: [
      'Cơ khí động lực nghiên cứu máy tạo, truyền và sử dụng năng lượng cơ học.',
      'Động cơ đốt trong là nguồn động lực phổ biến của nhiều phương tiện và máy công tác.',
      'Nghề cơ khí động lực gắn với vận hành, bảo dưỡng, sửa chữa, kiểm định và sản xuất.',
    ],
  },
  {
    id: 402,
    course_id: 4,
    title: 'Động cơ đốt trong: cấu tạo và nguyên lí',
    description: 'Học cấu tạo chung, chu trình 4 kì và các hệ thống chính của động cơ đốt trong.',
    content:
      'Động cơ đốt trong là động cơ nhiệt trong đó nhiên liệu được đốt cháy bên trong xi lanh, nhiệt năng biến đổi thành cơ năng. Cấu tạo chung gồm thân máy, nắp máy, cơ cấu trục khuỷu - thanh truyền, cơ cấu phân phối khí và các hệ thống cung cấp nhiên liệu, bôi trơn, làm mát, đánh lửa, khởi động, xả.',
    order: 2,
    key_points: [
      'Động cơ đốt trong biến nhiệt năng của nhiên liệu thành cơ năng ngay trong xi lanh.',
      'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của piston thành chuyển động quay.',
      'Chu trình 4 kì gồm nạp, nén, cháy - giãn nở và thải; kì cháy - giãn nở là kì sinh công.',
      'Các hệ thống phụ trợ giúp động cơ nạp đủ, đốt cháy tốt, bôi trơn, làm mát và khởi động ổn định.',
    ],
    visual_steps: [
      { name: 'Kì nạp', piston: 'Piston đi xuống', valve: 'Xupap nạp mở, xupap thải đóng', result: 'Không khí hoặc hòa khí được nạp vào xi lanh' },
      { name: 'Kì nén', piston: 'Piston đi lên', valve: 'Hai xupap đều đóng', result: 'Môi chất bị nén, áp suất và nhiệt độ tăng' },
      { name: 'Kì cháy - giãn nở', piston: 'Piston đi xuống', valve: 'Hai xupap đều đóng', result: 'Khí cháy sinh công làm quay trục khuỷu' },
      { name: 'Kì thải', piston: 'Piston đi lên', valve: 'Xupap thải mở, xupap nạp đóng', result: 'Khí thải được đẩy ra ngoài' },
    ],
  },
  {
    id: 501,
    course_id: 5,
    title: 'Cấu tạo chung của ô tô',
    description: 'Nhận biết bố trí chung của ô tô và nhiệm vụ các hệ thống chính.',
    content:
      'Ô tô là phương tiện giao thông đường bộ gồm nhiều hệ thống phối hợp: nguồn động lực, hệ truyền lực, hệ thống di chuyển, hệ thống điều khiển, hệ thống điện - điện tử và thân vỏ. Mỗi hệ thống có nhiệm vụ riêng nhưng phải làm việc đồng bộ để xe vận hành an toàn.',
    order: 1,
    key_points: [
      'Nguồn động lực tạo công suất cho xe.',
      'Hệ truyền lực truyền mô-men từ động cơ đến bánh xe chủ động.',
      'Hệ thống điều khiển gồm lái và phanh, ảnh hưởng trực tiếp đến an toàn.',
      'Hệ thống điện - điện tử phục vụ khởi động, chiếu sáng, tín hiệu, điều khiển và tiện nghi.',
    ],
  },
  {
    id: 502,
    course_id: 5,
    title: 'Các hệ thống chính trên ô tô',
    description: 'Tìm hiểu hệ truyền lực, treo, lái, phanh và điện - điều khiển trên ô tô.',
    content:
      'Hệ truyền lực đưa công suất đến bánh xe; hệ thống treo giảm dao động và giữ bánh xe bám đường; hệ thống lái điều khiển hướng chuyển động; hệ thống phanh giảm tốc, dừng xe hoặc giữ xe đứng yên; hệ thống điện - điều khiển hỗ trợ vận hành và an toàn.',
    order: 2,
    key_points: [
      'Hệ thống treo ảnh hưởng đến độ êm dịu và ổn định chuyển động.',
      'Hệ thống lái giúp thay đổi hoặc giữ hướng chuyển động.',
      'Hệ thống phanh là hệ thống an toàn chủ động quan trọng.',
      'Bảo dưỡng định kì giúp ô tô vận hành tin cậy, an toàn và tiết kiệm.',
    ],
  },
]

const lessonDetailSections = {
  101: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Trình bày được vai trò của cơ khí chế tạo trong sản xuất và đời sống.',
        'Phân biệt được chi tiết máy, cụm chi tiết, máy và thiết bị.',
        'Mô tả được quy trình chung để tạo ra một sản phẩm cơ khí.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Cơ khí chế tạo là nền tảng để tạo ra công cụ, máy móc và thiết bị phục vụ các ngành kinh tế.',
        'Sản phẩm cơ khí có thể là chi tiết đơn lẻ, cụm lắp ráp hoặc máy hoàn chỉnh.',
        'Yêu cầu của sản phẩm cơ khí gồm công dụng, độ bền, độ chính xác, tính kinh tế, thẩm mĩ và an toàn.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Chi tiết máy là phần tử có cấu tạo hoàn chỉnh và thực hiện một nhiệm vụ nhất định trong máy.',
        'Cụm chi tiết gồm nhiều chi tiết lắp ghép với nhau để thực hiện một chức năng.',
        'Kiểm tra chất lượng là khâu bắt buộc vì sai số kích thước hoặc lắp ráp có thể làm máy hoạt động kém an toàn.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Quan sát xe đạp và chỉ ra một chi tiết máy, một cụm chi tiết và một cơ cấu truyền động.',
        'Giải thích vì sao sản phẩm cơ khí cần bản vẽ kĩ thuật trước khi chế tạo.',
      ],
    },
  ],
  102: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Kể tên được một số nghề trong lĩnh vực cơ khí.',
        'Nêu được yêu cầu năng lực và phẩm chất của người làm nghề cơ khí.',
        'Liên hệ được sở thích cá nhân với định hướng nghề nghiệp.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Nhóm nghề thiết kế cơ khí liên quan đến ý tưởng, tính toán, bản vẽ và mô phỏng.',
        'Nhóm nghề chế tạo liên quan đến gia công, hàn, lắp ráp, vận hành máy công cụ và máy CNC.',
        'Nhóm nghề bảo dưỡng, sửa chữa và kiểm tra chất lượng bảo đảm thiết bị hoạt động đúng yêu cầu.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Đọc bản vẽ giúp người thợ hiểu hình dạng, kích thước, dung sai và yêu cầu kĩ thuật của chi tiết.',
        'Đo kiểm giúp phát hiện sai lệch trước khi lắp ráp hoặc đưa sản phẩm vào sử dụng.',
        'Công nghệ CNC và robot làm thay đổi yêu cầu nghề nghiệp: người học cần biết vận hành, lập trình cơ bản và giám sát quá trình.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Lập bảng so sánh nghề thiết kế cơ khí và nghề vận hành máy CNC.',
        'Nêu 3 việc em cần rèn luyện nếu muốn làm việc trong lĩnh vực cơ khí.',
      ],
    },
  ],
  201: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Phân loại được vật liệu kim loại, phi kim và composite.',
        'Nêu được một số tính chất cơ bản ảnh hưởng đến lựa chọn vật liệu.',
        'Chọn được vật liệu phù hợp cho một chi tiết đơn giản.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Vật liệu kim loại gồm gang, thép, nhôm, đồng và hợp kim; thường dùng cho chi tiết chịu lực.',
        'Vật liệu phi kim gồm chất dẻo, cao su, gốm; dùng khi cần cách điện, giảm chấn, chống ăn mòn hoặc giảm khối lượng.',
        'Composite kết hợp ưu điểm của nhiều vật liệu thành phần để đạt tính chất mong muốn.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Độ bền cho biết khả năng chống phá hỏng khi chịu tải; độ cứng liên quan đến khả năng chống biến dạng.',
        'Chi tiết chịu ma sát cần vật liệu chống mài mòn hoặc có xử lí bề mặt phù hợp.',
        'Môi trường ẩm, hóa chất hoặc ngoài trời cần ưu tiên vật liệu chống ăn mòn hoặc có lớp bảo vệ.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Giải thích vì sao trục truyền lực thường dùng thép.',
        'Đề xuất vật liệu làm tay cầm dụng cụ và nêu lí do.',
      ],
    },
  ],
  202: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Nhận biết được các phương pháp gia công cơ khí phổ biến.',
        'Nêu được ưu điểm và phạm vi sử dụng cơ bản của từng phương pháp.',
        'Hiểu vai trò của quy trình công nghệ trong sản xuất.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Đúc tạo sản phẩm bằng cách rót kim loại lỏng vào khuôn.',
        'Hàn liên kết các chi tiết bằng nung nóng hoặc làm nóng chảy vùng liên kết.',
        'Gia công áp lực làm biến dạng phôi bằng lực, ví dụ rèn, dập, cán.',
        'Gia công cắt gọt bóc đi lớp vật liệu thừa, ví dụ tiện, phay, khoan, mài.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Đúc phù hợp với chi tiết hình dạng phức tạp nhưng thường cần gia công tinh sau đúc.',
        'Tiện phù hợp gia công bề mặt tròn xoay; phay phù hợp gia công mặt phẳng, rãnh và biên dạng.',
        'Mài thường dùng ở bước hoàn thiện để tăng độ chính xác và độ nhẵn bề mặt.',
        'Quy trình công nghệ hợp lí giúp giảm thời gian, giảm sai hỏng và ổn định chất lượng.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Chọn phương pháp gia công cho một trục tròn cần độ chính xác cao.',
        'Giải thích vì sao cần đo kiểm sau mỗi nguyên công quan trọng.',
      ],
    },
  ],
  301: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Nhận biết được đặc điểm của sản xuất cơ khí hiện đại.',
        'Nêu vai trò của CNC, robot, cảm biến và hệ thống điều khiển.',
        'Giải thích được lợi ích của tự động hóa trong sản xuất.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Sản xuất cơ khí hiện đại hướng tới năng suất, chất lượng, độ chính xác, an toàn và tiết kiệm.',
        'Máy CNC gia công theo chương trình số, giúp sản phẩm có độ lặp lại cao.',
        'Robot công nghiệp hỗ trợ thao tác lặp lại, nặng nhọc hoặc nguy hiểm.',
        'Cảm biến và điều khiển tự động giúp giám sát trạng thái máy và quá trình sản xuất.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Tự động hóa hiệu quả khi quy trình được chuẩn hóa và dữ liệu sản xuất được kiểm soát.',
        'Người vận hành vẫn giữ vai trò quan trọng trong thiết lập, giám sát, bảo trì và xử lí sự cố.',
        'Dây chuyền sản xuất cần sự phối hợp giữa máy, người, vật liệu, thông tin và kiểm tra chất lượng.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Nêu ví dụ một công đoạn trong xưởng cơ khí có thể tự động hóa.',
        'Giải thích vì sao sản xuất hàng loạt cần kiểm soát chất lượng bằng cảm biến hoặc đo kiểm.',
      ],
    },
  ],
  302: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Nêu được các nguy cơ mất an toàn trong sản xuất cơ khí.',
        'Thực hiện được nguyên tắc an toàn trước, trong và sau khi làm việc.',
        'Hình thành thái độ nghiêm túc khi sử dụng dụng cụ, máy móc.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Nguy cơ thường gặp gồm vật bắn, phoi sắc, bộ phận quay, điện, nhiệt, tiếng ồn và hóa chất.',
        'Bảo hộ lao động gồm kính, găng phù hợp, giày, quần áo gọn gàng và các thiết bị che chắn.',
        'Không vận hành máy khi chưa được hướng dẫn hoặc khi máy có dấu hiệu bất thường.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Găng tay không phải lúc nào cũng an toàn: khi làm việc gần trục quay, găng có thể bị cuốn nếu dùng sai.',
        'Che chắn máy giúp ngăn tiếp xúc với bộ phận nguy hiểm và hạn chế phoi bắn.',
        'Sắp xếp nơi làm việc gọn gàng giúp giảm vấp ngã, va chạm và nhầm dụng cụ.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Lập danh sách kiểm tra an toàn trước khi dùng máy khoan bàn.',
        'Nêu cách xử lí khi phát hiện máy rung bất thường hoặc có tiếng kêu lạ.',
      ],
    },
  ],
  401: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Trình bày được khái niệm cơ khí động lực.',
        'Nhận biết được đối tượng và vai trò của cơ khí động lực.',
        'Kể tên được một số nghề liên quan.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Cơ khí động lực liên quan đến máy tạo, truyền và sử dụng năng lượng để tạo chuyển động.',
        'Đối tượng gồm động cơ, ô tô, xe máy, máy kéo, tàu thủy, máy xây dựng và hệ thống truyền động.',
        'Cơ khí động lực phục vụ giao thông, nông nghiệp, xây dựng, khai thác và đời sống.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Nguồn động lực tạo công suất; hệ truyền lực đưa công suất đến bộ phận công tác hoặc bánh xe.',
        'Hệ thống điều khiển và an toàn quyết định khả năng khai thác ổn định của phương tiện.',
        'Bảo dưỡng định kì giúp giảm hư hỏng, tăng tuổi thọ và giảm chi phí vận hành.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Kể tên 5 máy hoặc phương tiện thuộc lĩnh vực cơ khí động lực.',
        'Giải thích vì sao ô tô vừa cần động cơ vừa cần hệ truyền lực.',
      ],
    },
  ],
  402: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Trình bày được khái niệm động cơ đốt trong.',
        'Nhận biết được cấu tạo chung của động cơ đốt trong.',
        'Giải thích được chu trình làm việc của động cơ 4 kì.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Động cơ đốt trong là động cơ nhiệt, nhiên liệu cháy trong xi lanh tạo khí áp suất cao để sinh công.',
        'Thân máy, nắp máy tạo không gian lắp xi lanh, buồng cháy, đường nạp và đường thải.',
        'Cơ cấu trục khuỷu - thanh truyền gồm piston, thanh truyền, trục khuỷu; nhận lực và biến đổi chuyển động.',
        'Cơ cấu phân phối khí điều khiển xupap nạp, xupap thải đóng mở đúng thời điểm.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Trong kì nạp, áp suất trong xi lanh giảm nên không khí hoặc hòa khí được hút vào.',
        'Trong kì nén, môi chất bị nén làm áp suất và nhiệt độ tăng, chuẩn bị cho cháy.',
        'Trong kì cháy - giãn nở, khí cháy đẩy piston đi xuống; đây là kì sinh công.',
        'Trong kì thải, khí cháy được đẩy ra ngoài để chuẩn bị chu trình mới.',
        'Bôi trơn kém làm tăng ma sát và mài mòn; làm mát kém làm động cơ quá nhiệt.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Mô tả đường truyền lực từ khí cháy đến trục khuỷu.',
        'So sánh trạng thái xupap ở kì nạp và kì thải.',
        'Giải thích vì sao động cơ cần hệ thống bôi trơn và làm mát.',
      ],
    },
  ],
  501: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Nêu được cấu tạo chung của ô tô.',
        'Nhận biết được nhiệm vụ của các hệ thống chính.',
        'Liên hệ cấu tạo ô tô với yêu cầu an toàn khi vận hành.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Ô tô gồm nguồn động lực, hệ truyền lực, hệ thống di chuyển, hệ thống điều khiển, điện - điện tử và thân vỏ.',
        'Nguồn động lực tạo công suất; hệ truyền lực truyền mô-men đến bánh xe chủ động.',
        'Thân vỏ tạo không gian chở người, hàng hóa và bảo vệ các bộ phận.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Các hệ thống trên ô tô không làm việc tách rời: động cơ, truyền lực, phanh, lái và điện điều khiển phải phối hợp.',
        'An toàn vận hành phụ thuộc mạnh vào phanh, lái, lốp, treo, chiếu sáng và tín hiệu.',
        'Ô tô hiện đại dùng nhiều cảm biến và bộ điều khiển để tăng an toàn, tiết kiệm nhiên liệu và tiện nghi.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Chỉ ra các hệ thống chính trên một ô tô quan sát được trong thực tế.',
        'Giải thích vì sao cần kiểm tra phanh, lốp và đèn trước chuyến đi.',
      ],
    },
  ],
  502: [
    {
      title: 'Mục tiêu bài học',
      items: [
        'Trình bày được nhiệm vụ của hệ truyền lực, treo, lái, phanh và điện - điều khiển.',
        'Phân tích được vai trò của từng hệ thống đối với an toàn và vận hành.',
        'Nêu được một số nội dung bảo dưỡng cơ bản.',
      ],
    },
    {
      title: 'Kiến thức chuẩn SGK',
      items: [
        'Hệ truyền lực truyền và biến đổi mô-men từ động cơ đến bánh xe chủ động.',
        'Hệ thống treo giảm dao động, tăng độ êm dịu và giúp bánh xe bám đường.',
        'Hệ thống lái điều khiển hướng chuyển động của ô tô.',
        'Hệ thống phanh giảm tốc, dừng xe và giữ xe đứng yên.',
        'Hệ thống điện - điều khiển phục vụ khởi động, chiếu sáng, tín hiệu, điều khiển và an toàn.',
      ],
    },
    {
      title: 'Phân tích chuyên sâu',
      items: [
        'Nếu hệ thống treo kém, bánh xe dễ mất bám đường, xe kém ổn định khi phanh hoặc vào cua.',
        'Nếu hệ thống lái có độ rơ lớn, khả năng điều khiển hướng sẽ giảm và gây nguy hiểm.',
        'Phanh mòn hoặc thiếu dầu phanh làm tăng quãng đường dừng xe.',
        'Điện - điều khiển trên ô tô hiện đại có thể hỗ trợ ABS, túi khí, kiểm soát động cơ và cảnh báo an toàn.',
      ],
    },
    {
      title: 'Vận dụng',
      items: [
        'Nêu các dấu hiệu cần kiểm tra hệ thống phanh.',
        'Giải thích vì sao bảo dưỡng định kì giúp ô tô an toàn và tiết kiệm hơn.',
      ],
    },
  ],
}

canhDieuLessons.forEach((lesson) => {
  lesson.content_sections = lessonDetailSections[lesson.id] || []
})

export const canhDieuQuestions = [
  {
    id: 1011,
    lesson_id: 101,
    text: 'Cơ khí chế tạo chủ yếu tạo ra loại sản phẩm nào?',
    points: 1,
    options: [
      { id: 1, text: 'Chi tiết máy, cụm chi tiết, máy và thiết bị', is_correct: true },
      { id: 2, text: 'Chỉ văn bản hành chính', is_correct: false },
      { id: 3, text: 'Chỉ phần mềm máy tính', is_correct: false },
      { id: 4, text: 'Chỉ sản phẩm trồng trọt', is_correct: false },
    ],
  },
  {
    id: 1021,
    lesson_id: 102,
    text: 'Năng lực quan trọng với người làm nghề cơ khí là gì?',
    points: 1,
    options: [
      { id: 1, text: 'Đọc bản vẽ, đo kiểm, thao tác chính xác và tuân thủ an toàn', is_correct: true },
      { id: 2, text: 'Không cần đo kiểm sản phẩm', is_correct: false },
      { id: 3, text: 'Chỉ làm theo cảm tính', is_correct: false },
      { id: 4, text: 'Không cần kiến thức kĩ thuật', is_correct: false },
    ],
  },
  {
    id: 2011,
    lesson_id: 201,
    text: 'Khi lựa chọn vật liệu cơ khí cần căn cứ chủ yếu vào yếu tố nào?',
    points: 1,
    options: [
      { id: 1, text: 'Công dụng, điều kiện làm việc và yêu cầu kĩ thuật của chi tiết', is_correct: true },
      { id: 2, text: 'Tên vật liệu dài hay ngắn', is_correct: false },
      { id: 3, text: 'Màu sắc theo sở thích', is_correct: false },
      { id: 4, text: 'Chọn ngẫu nhiên', is_correct: false },
    ],
  },
  {
    id: 2021,
    lesson_id: 202,
    text: 'Phương pháp nào thường tạo độ chính xác kích thước và độ nhẵn bề mặt cao?',
    points: 1,
    options: [
      { id: 1, text: 'Gia công cắt gọt', is_correct: true },
      { id: 2, text: 'Đóng gói sản phẩm', is_correct: false },
      { id: 3, text: 'Vận chuyển phôi', is_correct: false },
      { id: 4, text: 'Dán nhãn sản phẩm', is_correct: false },
    ],
  },
  {
    id: 3011,
    lesson_id: 301,
    text: 'Tự động hóa trong sản xuất cơ khí giúp nâng cao yếu tố nào?',
    points: 1,
    options: [
      { id: 1, text: 'Năng suất, độ chính xác và tính ổn định', is_correct: true },
      { id: 2, text: 'Sự mất trật tự', is_correct: false },
      { id: 3, text: 'Sai lỗi ngẫu nhiên', is_correct: false },
      { id: 4, text: 'Nguy cơ do bỏ quy trình', is_correct: false },
    ],
  },
  {
    id: 3021,
    lesson_id: 302,
    text: 'Trước khi vận hành máy cơ khí, việc cần làm là gì?',
    points: 1,
    options: [
      { id: 1, text: 'Kiểm tra thiết bị, dùng bảo hộ và tuân thủ quy trình an toàn', is_correct: true },
      { id: 2, text: 'Chạm tay vào bộ phận quay để kiểm tra', is_correct: false },
      { id: 3, text: 'Tháo bỏ che chắn an toàn', is_correct: false },
      { id: 4, text: 'Bật máy ngay mà không quan sát', is_correct: false },
    ],
  },
  {
    id: 4011,
    lesson_id: 401,
    text: 'Đối tượng của cơ khí động lực là gì?',
    points: 1,
    options: [
      { id: 1, text: 'Máy động lực, phương tiện và hệ thống sử dụng năng lượng tạo chuyển động', is_correct: true },
      { id: 2, text: 'Chỉ sách vở văn học', is_correct: false },
      { id: 3, text: 'Chỉ bản vẽ trang trí', is_correct: false },
      { id: 4, text: 'Chỉ cây trồng', is_correct: false },
    ],
  },
  {
    id: 4021,
    lesson_id: 402,
    text: 'Trong động cơ 4 kì, kì nào là kì sinh công?',
    points: 1,
    options: [
      { id: 1, text: 'Kì nạp', is_correct: false },
      { id: 2, text: 'Kì nén', is_correct: false },
      { id: 3, text: 'Kì cháy - giãn nở', is_correct: true },
      { id: 4, text: 'Kì thải', is_correct: false },
    ],
  },
  {
    id: 5011,
    lesson_id: 501,
    text: 'Hệ truyền lực trên ô tô có nhiệm vụ gì?',
    points: 1,
    options: [
      { id: 1, text: 'Truyền mô-men từ động cơ đến bánh xe chủ động', is_correct: true },
      { id: 2, text: 'Chỉ làm mát cabin', is_correct: false },
      { id: 3, text: 'Chỉ phát âm thanh', is_correct: false },
      { id: 4, text: 'Chỉ chứa hành lí', is_correct: false },
    ],
  },
  {
    id: 5021,
    lesson_id: 502,
    text: 'Hệ thống nào giúp ô tô giảm tốc hoặc dừng lại an toàn?',
    points: 1,
    options: [
      { id: 1, text: 'Hệ thống phanh', is_correct: true },
      { id: 2, text: 'Hệ thống giải trí', is_correct: false },
      { id: 3, text: 'Ghế ngồi', is_correct: false },
      { id: 4, text: 'Kính chắn gió', is_correct: false },
    ],
  },
]

export const canhDieuActivities = {
  201: {
    flashcards: [
      { front: 'Vì sao phải chọn vật liệu đúng?', back: 'Vì vật liệu quyết định độ bền, an toàn, khả năng gia công, khối lượng và giá thành của chi tiết.' },
      { front: 'Ví dụ vật liệu kim loại thường dùng?', back: 'Gang, thép, nhôm, đồng và hợp kim của chúng.' },
    ],
    matching: [
      { term: 'Thép', answer: 'Dùng nhiều cho chi tiết chịu lực' },
      { term: 'Cao su', answer: 'Làm kín, giảm chấn, cách rung' },
      { term: 'Composite', answer: 'Nhẹ, bền và có tính chất theo yêu cầu thiết kế' },
    ],
    scenario: {
      title: 'Chọn vật liệu',
      prompt: 'Một chi tiết làm việc ngoài trời, cần nhẹ và chống ăn mòn. Cách chọn nào phù hợp?',
      options: [
        { text: 'Chọn vật liệu đủ bền, nhẹ và chống ăn mòn tốt', correct: true, feedback: 'Đúng. Cần xuất phát từ điều kiện làm việc và yêu cầu kĩ thuật.' },
        { text: 'Chọn vật liệu bất kì miễn là dễ mua', correct: false, feedback: 'Chưa đúng. Dễ mua không thay thế được yêu cầu kĩ thuật.' },
      ],
    },
    explainChecklist: ['Nêu điều kiện làm việc.', 'Xác định yêu cầu kĩ thuật.', 'Chọn vật liệu và giải thích lí do.'],
  },
  202: {
    flashcards: [
      { front: 'Quy trình công nghệ là gì?', back: 'Là trình tự các nguyên công để biến phôi thành chi tiết đạt yêu cầu.' },
      { front: 'Gia công cắt gọt có ưu điểm gì?', back: 'Tạo độ chính xác kích thước và độ nhẵn bề mặt cao.' },
    ],
    matching: [
      { term: 'Đúc', answer: 'Tạo phôi hoặc chi tiết có hình dạng phức tạp' },
      { term: 'Hàn', answer: 'Liên kết các chi tiết kim loại' },
      { term: 'Mài', answer: 'Nâng cao độ chính xác và độ nhẵn bề mặt' },
    ],
    scenario: {
      title: 'Chọn phương pháp gia công',
      prompt: 'Một trục cần kích thước chính xác và bề mặt nhẵn. Nên ưu tiên phương pháp nào?',
      options: [
        { text: 'Gia công cắt gọt, đo kiểm và có thể mài tinh', correct: true, feedback: 'Đúng. Trục thường cần tiện, mài và kiểm tra kích thước.' },
        { text: 'Chỉ sơn phủ bề mặt là đủ', correct: false, feedback: 'Chưa đúng. Sơn không tạo được kích thước chính xác cho trục.' },
      ],
    },
    explainChecklist: ['Xác định yêu cầu chi tiết.', 'Chọn phương pháp gia công.', 'Nêu bước kiểm tra chất lượng.'],
  },
  402: {
    flashcards: [
      { front: 'Bốn kì của động cơ 4 kì là gì?', back: 'Kì nạp, kì nén, kì cháy - giãn nở và kì thải.' },
      { front: 'Kì nào sinh công?', back: 'Kì cháy - giãn nở là kì sinh công.' },
    ],
    matching: [
      { term: 'Piston', answer: 'Chuyển động tịnh tiến trong xi lanh' },
      { term: 'Thanh truyền', answer: 'Truyền lực giữa piston và trục khuỷu' },
      { term: 'Trục khuỷu', answer: 'Biến chuyển động tịnh tiến thành chuyển động quay' },
    ],
    scenario: {
      title: 'Phân tích chu trình',
      prompt: 'Ở kì nén, trạng thái xupap và chuyển động piston như thế nào?',
      options: [
        { text: 'Piston đi lên, hai xupap đều đóng', correct: true, feedback: 'Đúng. Môi chất bị nén nên áp suất và nhiệt độ tăng.' },
        { text: 'Piston đi xuống, xupap thải mở', correct: false, feedback: 'Chưa đúng. Đó không phải trạng thái của kì nén.' },
      ],
    },
    explainChecklist: ['Kể đúng thứ tự 4 kì.', 'Nêu được kì sinh công.', 'Giải thích vai trò piston, thanh truyền, trục khuỷu.'],
  },
}

Object.assign(canhDieuActivities, {
  101: {
    flashcards: [
      {
        front: 'Cơ khí chế tạo tạo ra những loại sản phẩm nào?',
        back: 'Tạo ra chi tiết máy, cụm chi tiết, máy và thiết bị phục vụ sản xuất, giao thông, nông nghiệp, xây dựng và đời sống.',
      },
      {
        front: 'Vì sao sản phẩm cơ khí cần kiểm tra chất lượng?',
        back: 'Vì sai số kích thước, vật liệu hoặc lắp ráp có thể làm sản phẩm hoạt động kém chính xác, nhanh hỏng hoặc mất an toàn.',
      },
      {
        front: 'Quy trình chung tạo sản phẩm cơ khí gồm những bước nào?',
        back: 'Xác định yêu cầu, thiết kế, chọn vật liệu, gia công, lắp ráp, kiểm tra và đưa vào sử dụng.',
      },
    ],
    matching: [
      { term: 'Chi tiết máy', answer: 'Phần tử có cấu tạo hoàn chỉnh và thực hiện một nhiệm vụ trong máy' },
      { term: 'Cụm chi tiết', answer: 'Nhiều chi tiết lắp ghép để thực hiện một chức năng' },
      { term: 'Bản vẽ kĩ thuật', answer: 'Căn cứ để chế tạo, lắp ráp và kiểm tra sản phẩm' },
      { term: 'Kiểm tra chất lượng', answer: 'Đánh giá sản phẩm có đạt yêu cầu kĩ thuật và an toàn hay không' },
    ],
    scenario: {
      title: 'Phân tích sản phẩm cơ khí',
      prompt: 'Một xe đạp có bàn đạp, xích, đĩa xích, líp và bánh xe. Khi phân tích theo cơ khí chế tạo, cách nhận xét nào đúng?',
      options: [
        {
          text: 'Có thể xem từng chi tiết và cụm truyền động là sản phẩm cơ khí có chức năng riêng',
          correct: true,
          feedback: 'Đúng. Cơ khí chế tạo cần nhận biết chi tiết, cụm chi tiết và chức năng của chúng trong máy.',
        },
        {
          text: 'Chỉ cần quan sát màu sơn, không cần xét chức năng chi tiết',
          correct: false,
          feedback: 'Chưa đúng. Nội dung bài học tập trung vào vai trò, cấu tạo và chức năng sản phẩm cơ khí.',
        },
      ],
    },
    explainChecklist: [
      'Phân biệt được chi tiết máy và cụm chi tiết.',
      'Nêu được quy trình tạo sản phẩm cơ khí.',
      'Giải thích được vì sao cần kiểm tra chất lượng.',
    ],
  },
  102: {
    flashcards: [
      {
        front: 'Những nhóm nghề nào thuộc lĩnh vực cơ khí?',
        back: 'Thiết kế cơ khí, gia công, hàn, vận hành CNC, lắp ráp, kiểm tra chất lượng, bảo dưỡng và sửa chữa.',
      },
      {
        front: 'Người làm nghề cơ khí cần năng lực gì?',
        back: 'Đọc bản vẽ, hiểu vật liệu, sử dụng dụng cụ đo, thao tác chính xác, tuân thủ an toàn và làm việc nhóm.',
      },
    ],
    matching: [
      { term: 'Thiết kế cơ khí', answer: 'Lập ý tưởng, bản vẽ, mô phỏng và tính toán sản phẩm' },
      { term: 'Vận hành CNC', answer: 'Điều khiển máy gia công theo chương trình số' },
      { term: 'Kiểm tra chất lượng', answer: 'Đo kiểm sản phẩm theo bản vẽ và yêu cầu kĩ thuật' },
      { term: 'Bảo dưỡng thiết bị', answer: 'Kiểm tra, điều chỉnh, thay thế để máy hoạt động ổn định' },
    ],
    scenario: {
      title: 'Định hướng nghề nghiệp',
      prompt: 'Một học sinh thích bản vẽ, mô phỏng 3D và tính toán kích thước sản phẩm. Nhóm nghề nào phù hợp hơn?',
      options: [
        {
          text: 'Thiết kế cơ khí',
          correct: true,
          feedback: 'Đúng. Thiết kế cơ khí gắn với bản vẽ, mô hình, tính toán và mô phỏng sản phẩm.',
        },
        {
          text: 'Bỏ qua bản vẽ và chỉ lắp ráp theo cảm tính',
          correct: false,
          feedback: 'Chưa đúng. Dù ở nhóm nghề nào, cơ khí đều cần bản vẽ và quy trình kĩ thuật.',
        },
      ],
    },
    explainChecklist: [
      'Kể được ít nhất 4 nghề trong lĩnh vực cơ khí.',
      'Nêu được năng lực cần rèn luyện cho nghề cơ khí.',
      'Liên hệ được một nghề với sở thích hoặc năng lực cá nhân.',
    ],
  },
  201: {
    flashcards: [
      {
        front: 'Ba nhóm vật liệu cơ khí chính là gì?',
        back: 'Vật liệu kim loại, vật liệu phi kim và vật liệu composite.',
      },
      {
        front: 'Khi chọn vật liệu cần xét những yếu tố nào?',
        back: 'Công dụng, tải trọng, môi trường làm việc, độ bền, độ cứng, chống mài mòn, chống ăn mòn, khối lượng, khả năng gia công và giá thành.',
      },
      {
        front: 'Vì sao không chọn vật liệu chỉ theo giá rẻ?',
        back: 'Vì vật liệu rẻ nhưng không đủ bền hoặc không phù hợp môi trường làm việc có thể gây hỏng chi tiết và mất an toàn.',
      },
    ],
    matching: [
      { term: 'Thép', answer: 'Phù hợp nhiều chi tiết chịu lực, trục, bánh răng, khung máy' },
      { term: 'Gang', answer: 'Dễ đúc, thường dùng cho thân máy, bệ máy, vỏ hộp' },
      { term: 'Cao su', answer: 'Làm kín, giảm chấn, cách rung' },
      { term: 'Composite', answer: 'Nhẹ, bền theo hướng thiết kế, có khả năng chống ăn mòn tốt' },
    ],
    scenario: {
      title: 'Lựa chọn vật liệu',
      prompt: 'Một chi tiết làm việc ngoài trời, cần nhẹ và chống ăn mòn. Cách chọn nào phù hợp?',
      options: [
        {
          text: 'Chọn vật liệu đủ bền, nhẹ và chống ăn mòn tốt',
          correct: true,
          feedback: 'Đúng. Chọn vật liệu phải xuất phát từ điều kiện làm việc và yêu cầu kĩ thuật.',
        },
        {
          text: 'Chọn vật liệu bất kì miễn là dễ mua',
          correct: false,
          feedback: 'Chưa đúng. Tính sẵn có chỉ là một yếu tố, không thay thế yêu cầu kĩ thuật.',
        },
      ],
    },
    explainChecklist: [
      'Xác định được công dụng và điều kiện làm việc của chi tiết.',
      'Chọn được nhóm vật liệu phù hợp.',
      'Giải thích được ưu điểm và hạn chế của lựa chọn vật liệu.',
    ],
  },
  202: {
    flashcards: [
      {
        front: 'Gia công cơ khí là gì?',
        back: 'Là quá trình làm thay đổi hình dạng, kích thước, trạng thái bề mặt hoặc tính chất của phôi để tạo chi tiết đạt yêu cầu.',
      },
      {
        front: 'Quy trình công nghệ có vai trò gì?',
        back: 'Chuẩn hóa trình tự nguyên công, thiết bị, dụng cụ, chế độ gia công và kiểm tra để sản xuất ổn định.',
      },
      {
        front: 'Gia công cắt gọt phù hợp khi nào?',
        back: 'Khi cần độ chính xác kích thước và chất lượng bề mặt cao, ví dụ tiện, phay, khoan, mài.',
      },
    ],
    matching: [
      { term: 'Đúc', answer: 'Tạo phôi hoặc chi tiết có hình dạng phức tạp' },
      { term: 'Hàn', answer: 'Liên kết các chi tiết kim loại' },
      { term: 'Gia công áp lực', answer: 'Dùng lực làm biến dạng phôi như rèn, dập, cán' },
      { term: 'Mài', answer: 'Nâng cao độ chính xác và độ nhẵn bề mặt' },
    ],
    scenario: {
      title: 'Chọn phương pháp gia công',
      prompt: 'Một trục cần kích thước chính xác và bề mặt nhẵn. Nên ưu tiên phương pháp nào?',
      options: [
        {
          text: 'Tiện, đo kiểm và có thể mài tinh',
          correct: true,
          feedback: 'Đúng. Trục là chi tiết tròn xoay, thường cần tiện và mài để đạt độ chính xác.',
        },
        {
          text: 'Chỉ sơn phủ bề mặt là đủ',
          correct: false,
          feedback: 'Chưa đúng. Sơn không tạo được kích thước chính xác cho trục.',
        },
      ],
    },
    explainChecklist: [
      'Phân biệt được đúc, hàn, gia công áp lực và cắt gọt.',
      'Chọn được phương pháp gia công cho chi tiết đơn giản.',
      'Nêu được vai trò của đo kiểm trong quy trình công nghệ.',
    ],
  },
  301: {
    flashcards: [
      {
        front: 'Sản xuất cơ khí hiện đại có đặc điểm gì?',
        back: 'Tổ chức theo dây chuyền, dùng máy CNC, robot, cảm biến, băng tải và điều khiển tự động để tăng năng suất và chất lượng.',
      },
      {
        front: 'Máy CNC khác máy công cụ thông thường ở điểm nào?',
        back: 'Máy CNC gia công theo chương trình số, có độ chính xác và tính lặp lại cao.',
      },
    ],
    matching: [
      { term: 'Máy CNC', answer: 'Gia công theo chương trình số' },
      { term: 'Robot công nghiệp', answer: 'Thực hiện thao tác lặp lại, nặng nhọc hoặc nguy hiểm' },
      { term: 'Cảm biến', answer: 'Thu thập tín hiệu để giám sát máy hoặc sản phẩm' },
      { term: 'Dây chuyền sản xuất', answer: 'Tổ chức các công đoạn liên tục và dễ kiểm soát' },
    ],
    scenario: {
      title: 'Tự động hóa sản xuất',
      prompt: 'Một nhà máy cần sản xuất hàng nghìn chi tiết giống nhau với sai số nhỏ. Giải pháp nào phù hợp?',
      options: [
        {
          text: 'Dùng quy trình chuẩn, máy CNC hoặc tự động hóa kết hợp kiểm tra chất lượng',
          correct: true,
          feedback: 'Đúng. Sản xuất hàng loạt cần tính lặp lại, kiểm soát sai số và năng suất cao.',
        },
        {
          text: 'Làm tùy từng người, không cần quy trình',
          correct: false,
          feedback: 'Chưa đúng. Cách này dễ gây sai khác và khó kiểm soát chất lượng.',
        },
      ],
    },
    explainChecklist: [
      'Nêu được vai trò của CNC, robot và cảm biến.',
      'Giải thích được lợi ích của tự động hóa.',
      'Liên hệ được tự động hóa với năng suất và chất lượng sản phẩm.',
    ],
  },
  302: {
    flashcards: [
      {
        front: 'Vì sao an toàn lao động là yêu cầu bắt buộc?',
        back: 'Vì máy cơ khí có bộ phận quay, phoi sắc, điện, nhiệt và lực lớn; thao tác sai có thể gây tai nạn.',
      },
      {
        front: 'Trước khi vận hành máy cần làm gì?',
        back: 'Mặc bảo hộ phù hợp, kiểm tra máy, dụng cụ, nguồn điện, che chắn và khu vực làm việc.',
      },
    ],
    matching: [
      { term: 'Bảo hộ lao động', answer: 'Giảm nguy cơ chấn thương khi làm việc' },
      { term: 'Che chắn an toàn', answer: 'Ngăn tiếp xúc với vùng nguy hiểm và hạn chế phoi bắn' },
      { term: 'Dừng máy khẩn cấp', answer: 'Ngắt hoạt động khi có sự cố hoặc nguy cơ mất an toàn' },
      { term: 'Vệ sinh nơi làm việc', answer: 'Giảm vấp ngã, nhầm dụng cụ và nguy cơ tai nạn' },
    ],
    scenario: {
      title: 'Xử lí tình huống an toàn',
      prompt: 'Máy khoan bàn rung mạnh và có tiếng kêu lạ khi đang làm việc. Hành động đúng là gì?',
      options: [
        {
          text: 'Dừng máy, báo giáo viên hoặc người phụ trách kiểm tra',
          correct: true,
          feedback: 'Đúng. Dấu hiệu bất thường phải được xử lí trước khi tiếp tục vận hành.',
        },
        {
          text: 'Tiếp tục khoan để hoàn thành nhanh',
          correct: false,
          feedback: 'Chưa đúng. Tiếp tục vận hành có thể gây tai nạn hoặc hỏng máy.',
        },
      ],
    },
    explainChecklist: [
      'Nêu được nguy cơ mất an toàn trong xưởng cơ khí.',
      'Lập được checklist trước khi vận hành máy.',
      'Biết cách xử lí khi thiết bị có dấu hiệu bất thường.',
    ],
  },
  401: {
    flashcards: [
      {
        front: 'Cơ khí động lực nghiên cứu đối tượng nào?',
        back: 'Máy tạo, truyền và sử dụng năng lượng cơ học như động cơ, ô tô, xe máy, máy kéo, tàu thủy, máy xây dựng.',
      },
      {
        front: 'Vì sao cần bảo dưỡng máy động lực định kì?',
        back: 'Để phát hiện sớm hư hỏng, tăng độ tin cậy, giảm chi phí vận hành và bảo đảm an toàn.',
      },
    ],
    matching: [
      { term: 'Nguồn động lực', answer: 'Tạo công suất hoặc mô-men cho máy, phương tiện' },
      { term: 'Hệ truyền động', answer: 'Truyền và biến đổi công suất đến bộ phận công tác' },
      { term: 'Hệ điều khiển', answer: 'Điều chỉnh hướng, tốc độ hoặc chế độ làm việc' },
      { term: 'Bảo dưỡng', answer: 'Duy trì trạng thái kĩ thuật và phòng ngừa hư hỏng' },
    ],
    scenario: {
      title: 'Nhận diện lĩnh vực cơ khí động lực',
      prompt: 'Máy kéo nông nghiệp dùng động cơ để kéo thiết bị làm đất. Nội dung này thuộc lĩnh vực nào?',
      options: [
        {
          text: 'Cơ khí động lực vì liên quan đến nguồn động lực và truyền công suất',
          correct: true,
          feedback: 'Đúng. Máy kéo là đối tượng điển hình của cơ khí động lực.',
        },
        {
          text: 'Chỉ thuộc trang trí sản phẩm',
          correct: false,
          feedback: 'Chưa đúng. Trọng tâm là máy động lực và hệ truyền động.',
        },
      ],
    },
    explainChecklist: [
      'Kể được đối tượng của cơ khí động lực.',
      'Phân biệt nguồn động lực và hệ truyền động.',
      'Nêu được vai trò của bảo dưỡng trong khai thác máy.',
    ],
  },
  402: {
    flashcards: [
      {
        front: 'Động cơ đốt trong là gì?',
        back: 'Là động cơ nhiệt trong đó nhiên liệu cháy bên trong xi lanh, tạo khí áp suất cao để sinh công.',
      },
      {
        front: 'Bốn kì của động cơ 4 kì là gì?',
        back: 'Kì nạp, kì nén, kì cháy - giãn nở và kì thải.',
      },
      {
        front: 'Kì nào sinh công?',
        back: 'Kì cháy - giãn nở là kì sinh công vì khí cháy đẩy piston đi xuống làm quay trục khuỷu.',
      },
    ],
    matching: [
      { term: 'Piston', answer: 'Chuyển động tịnh tiến trong xi lanh và nhận lực khí cháy' },
      { term: 'Thanh truyền', answer: 'Truyền lực giữa piston và trục khuỷu' },
      { term: 'Trục khuỷu', answer: 'Biến chuyển động tịnh tiến thành chuyển động quay' },
      { term: 'Cơ cấu phân phối khí', answer: 'Điều khiển xupap nạp và xupap thải đóng mở đúng thời điểm' },
    ],
    scenario: {
      title: 'Phân tích chu trình 4 kì',
      prompt: 'Ở kì nén, trạng thái xupap và chuyển động piston như thế nào?',
      options: [
        {
          text: 'Piston đi lên, hai xupap đều đóng',
          correct: true,
          feedback: 'Đúng. Môi chất bị nén nên áp suất và nhiệt độ tăng.',
        },
        {
          text: 'Piston đi xuống, xupap thải mở',
          correct: false,
          feedback: 'Chưa đúng. Đó không phải trạng thái của kì nén.',
        },
      ],
    },
    explainChecklist: [
      'Kể đúng thứ tự 4 kì.',
      'Nêu được nhiệm vụ của piston, thanh truyền, trục khuỷu.',
      'Giải thích được vì sao cần bôi trơn và làm mát.',
    ],
  },
  501: {
    flashcards: [
      {
        front: 'Ô tô gồm những hệ thống chính nào?',
        back: 'Nguồn động lực, hệ truyền lực, hệ thống di chuyển, hệ thống điều khiển, hệ thống điện - điện tử và thân vỏ.',
      },
      {
        front: 'Hệ truyền lực làm nhiệm vụ gì?',
        back: 'Truyền và biến đổi mô-men từ động cơ đến bánh xe chủ động.',
      },
    ],
    matching: [
      { term: 'Nguồn động lực', answer: 'Tạo công suất cho ô tô' },
      { term: 'Hệ truyền lực', answer: 'Truyền mô-men từ động cơ đến bánh xe chủ động' },
      { term: 'Hệ thống điều khiển', answer: 'Gồm lái và phanh, giúp điều khiển hướng và tốc độ' },
      { term: 'Thân vỏ', answer: 'Tạo không gian chở người, hàng hóa và bảo vệ các bộ phận' },
    ],
    scenario: {
      title: 'Nhận diện cấu tạo ô tô',
      prompt: 'Một ô tô có động cơ hoạt động tốt nhưng mô-men không truyền tới bánh xe. Hệ thống nào cần kiểm tra?',
      options: [
        {
          text: 'Hệ truyền lực',
          correct: true,
          feedback: 'Đúng. Hệ truyền lực đưa mô-men từ động cơ tới bánh xe chủ động.',
        },
        {
          text: 'Hệ thống âm thanh',
          correct: false,
          feedback: 'Chưa đúng. Âm thanh không truyền công suất làm xe chuyển động.',
        },
      ],
    },
    explainChecklist: [
      'Kể được các hệ thống chính trên ô tô.',
      'Nêu được nhiệm vụ của nguồn động lực và hệ truyền lực.',
      'Liên hệ được cấu tạo ô tô với an toàn vận hành.',
    ],
  },
  502: {
    flashcards: [
      {
        front: 'Hệ thống treo có nhiệm vụ gì?',
        back: 'Giảm dao động, tăng độ êm dịu và giúp bánh xe bám đường.',
      },
      {
        front: 'Hệ thống phanh có nhiệm vụ gì?',
        back: 'Giảm tốc, dừng xe hoặc giữ xe đứng yên khi cần.',
      },
      {
        front: 'Hệ thống lái có nhiệm vụ gì?',
        back: 'Điều khiển hướng chuyển động của ô tô.',
      },
    ],
    matching: [
      { term: 'Hệ thống treo', answer: 'Giảm dao động và giữ bánh xe tiếp xúc tốt với mặt đường' },
      { term: 'Hệ thống lái', answer: 'Điều khiển hướng chuyển động của ô tô' },
      { term: 'Hệ thống phanh', answer: 'Giảm tốc, dừng xe hoặc giữ xe đứng yên' },
      { term: 'Điện - điều khiển', answer: 'Hỗ trợ khởi động, chiếu sáng, tín hiệu, điều khiển và an toàn' },
    ],
    scenario: {
      title: 'Chẩn đoán hệ thống ô tô',
      prompt: 'Khi phanh, xe bị lệch sang một bên. Hệ thống nào cần kiểm tra trước?',
      options: [
        {
          text: 'Hệ thống phanh và tình trạng lốp',
          correct: true,
          feedback: 'Đúng. Lực phanh không đều hoặc lốp kém có thể làm xe lệch hướng.',
        },
        {
          text: 'Màu nội thất',
          correct: false,
          feedback: 'Chưa đúng. Đây không phải yếu tố kĩ thuật liên quan đến phanh.',
        },
      ],
    },
    explainChecklist: [
      'Nêu được nhiệm vụ hệ treo, lái, phanh.',
      'Phân tích được vì sao các hệ thống này ảnh hưởng đến an toàn.',
      'Kể được một số nội dung kiểm tra, bảo dưỡng cơ bản.',
    ],
  },
})

export const chapterAssessments = canhDieuCourses.map((course) => ({
  id: `cd-c${course.id}`,
  course_id: course.id,
  chapter: `Chương ${course.id}`,
  title: `Mini test cuối ${course.title.toLowerCase()}`,
  description: `Câu hỏi được soạn từ nội dung trọng tâm của các slide/PDF trong ${course.title.toLowerCase()}.`,
  duration_minutes: getMiniTestDuration(
    canhDieuLessons.filter((lesson) => lesson.course_id === course.id).length * 2,
  ),
  questions: buildChapterMiniTestQuestions(
    canhDieuLessons.filter((lesson) => lesson.course_id === course.id),
    `cd-c${course.id}`,
  ),
}))
