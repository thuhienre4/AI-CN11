const fallbackExperiment = {
  title: 'Thí nghiệm mô phỏng theo bài học',
  unit: 'Đơn vị kiến thức',
  duration: '8-10 phút',
  modelFocus: 'Quan sát mô hình, xác định các khối chính và giải thích mối liên hệ giữa cấu tạo với nguyên lí.',
  objective: 'Giúp học sinh chuyển kiến thức lí thuyết thành khả năng quan sát, phân tích và giải thích bằng lời của mình.',
  setup: ['Đọc mục tiêu bài học.', 'Mở mô phỏng 3D tương ứng.', 'Ghi lại hiện tượng hoặc trạng thái thay đổi trong mô hình.'],
  tasks: ['Xác định các phần tử chính trong mô hình.', 'Mô tả dòng vật chất, năng lượng hoặc tín hiệu.', 'Nêu một lỗi có thể xảy ra và cách kiểm tra.'],
  observe: ['Bộ phận nào giữ vai trò đầu vào?', 'Bộ phận nào xử lí hoặc biến đổi?', 'Đầu ra cần đạt tiêu chí nào?'],
  safety: 'Chỉ thao tác trên mô phỏng; nếu triển khai thực hành thật cần có giáo viên hướng dẫn và kiểm tra an toàn.',
}

const grade10ByCourse = {
  1: {
    title: 'Mô phỏng phân tích hệ thống kĩ thuật trong đời sống',
    unit: 'Đại cương về công nghệ',
    duration: '10 phút',
    modelFocus: 'Dòng đầu vào, xử lí, đầu ra, điều khiển và tiêu chí đánh giá công nghệ.',
    objective: 'Nhận ra công nghệ là hệ thống có mục tiêu, có điều kiện sử dụng và có tác động đến con người.',
    setup: ['Chọn một sản phẩm quen thuộc như quạt, xe đạp điện hoặc máy lọc nước.', 'Xác định đầu vào, bộ phận xử lí, đầu ra.', 'Bật lớp điều khiển trong mô phỏng.'],
    tasks: ['Vẽ sơ đồ khối của hệ thống.', 'Đánh giá công nghệ theo hiệu quả, an toàn, chi phí và môi trường.', 'Đề xuất một cải tiến nhỏ.'],
    observe: ['Nếu thiếu khối điều khiển thì hệ thống thay đổi thế nào?', 'Đầu ra nào chứng tỏ công nghệ hoạt động đúng?', 'Tiêu chí nào quan trọng nhất trong tình huống này?'],
    safety: 'Không cần thiết bị thật; học sinh chỉ phân tích trên mô hình và tình huống mô phỏng.',
  },
  2: {
    title: 'Mô phỏng đọc bản vẽ và dựng hình vật thể',
    unit: 'Vẽ kĩ thuật',
    duration: '12 phút',
    modelFocus: 'Hình chiếu, hình cắt, mặt cắt, hình trục đo, kích thước và kí hiệu.',
    objective: 'Giúp học sinh liên hệ giữa bản vẽ 2D và hình dạng 3D của vật thể.',
    setup: ['Mở mô phỏng vật thể mẫu.', 'Bật lần lượt hình chiếu đứng, bằng, cạnh.', 'So sánh với mô hình 3D xoay được.'],
    tasks: ['Xác định mặt phẳng chiếu phù hợp.', 'Chỉ ra phần cần dùng hình cắt hoặc mặt cắt.', 'Đọc kích thước chính và yêu cầu kĩ thuật.'],
    observe: ['Hình chiếu nào thể hiện nhiều đặc điểm nhất?', 'Khi nào cần dùng hình cắt?', 'Nếu ghi sai kích thước thì sản phẩm bị ảnh hưởng ra sao?'],
    safety: 'Không có nguy cơ thực hành; chú ý đọc đúng kí hiệu và tiêu chuẩn trình bày.',
  },
  3: {
    title: 'Mô phỏng vòng lặp thiết kế kĩ thuật',
    unit: 'Thiết kế kĩ thuật',
    duration: '15 phút',
    modelFocus: 'Vấn đề, tiêu chí, ý tưởng, nguyên mẫu, thử nghiệm, đánh giá và cải tiến.',
    objective: 'Cho học sinh thấy thiết kế là quá trình lặp dựa trên dữ liệu thử nghiệm, không phải làm một lần là xong.',
    setup: ['Chọn tình huống thiết kế gần gũi.', 'Đặt 3 tiêu chí đánh giá.', 'Chạy mô phỏng nguyên mẫu lần 1.'],
    tasks: ['Ghi lỗi của nguyên mẫu.', 'Điều chỉnh một thông số thiết kế.', 'So sánh kết quả trước và sau cải tiến.'],
    observe: ['Tiêu chí nào chưa đạt?', 'Thay đổi thông số nào làm kết quả tốt hơn?', 'Có đánh đổi nào giữa chi phí, độ bền và thẩm mĩ?'],
    safety: 'Nếu làm mô hình thật, cần dùng vật liệu an toàn, dụng cụ cắt dán đúng hướng dẫn và không thử tải quá mức.',
  },
}

const grade11ByCourse = {
  1: {
    title: 'Thí nghiệm mô phỏng dự án cơ khí',
    unit: 'Dự án nghiên cứu cơ khí',
    duration: '15 phút',
    modelFocus: 'Vấn đề, giả thuyết, tiêu chí, dữ liệu đo, minh chứng và cải tiến.',
    objective: 'Rèn cách biến một ý tưởng cơ khí thành dự án có tiêu chí và bằng chứng kĩ thuật.',
    setup: ['Xác định vấn đề cần giải quyết.', 'Đặt tiêu chí đo kiểm.', 'Chọn mô hình hoặc sản phẩm giả lập.'],
    tasks: ['Lập bảng tiêu chí.', 'Chạy thử mô phỏng và ghi dữ liệu.', 'Viết nhận xét cải tiến dựa trên dữ liệu.'],
    observe: ['Dữ liệu nào chứng minh sản phẩm đạt yêu cầu?', 'Sai số xuất hiện ở bước nào?', 'Cần cải tiến cấu tạo hay quy trình?'],
    safety: 'Khi chuyển sang thực hành thật phải kiểm tra dụng cụ, lực tác dụng, mép sắc và vùng chuyển động.',
  },
  2: {
    title: 'Thí nghiệm mô phỏng chuỗi CAD/CAM/CNC',
    unit: 'Công nghệ CAD/CAM-CNC',
    duration: '12 phút',
    modelFocus: 'CAD, CAM, đường chạy dao, mô phỏng gia công, máy CNC và đo kiểm.',
    objective: 'Hiểu vì sao phải mô phỏng đường chạy dao trước khi vận hành CNC.',
    setup: ['Mở chi tiết mẫu.', 'Quan sát mô hình CAD.', 'Bật đường chạy dao CAM và mô phỏng cắt gọt.'],
    tasks: ['Sắp xếp đúng quy trình CAD -> CAM -> CNC -> đo kiểm.', 'Xác định lỗi va chạm dao hoặc gá đặt.', 'Đề xuất hiệu chỉnh tốc độ, dao hoặc điểm gốc.'],
    observe: ['Đường chạy dao có cắt vào vùng không mong muốn không?', 'Phôi đã được gá chắc chưa?', 'Sau gia công cần đo kích thước nào?'],
    safety: 'Không vận hành máy CNC thật nếu chưa kiểm tra chương trình, dao, phôi, che chắn và nút dừng khẩn cấp.',
  },
  3: {
    title: 'Thí nghiệm mô phỏng in 3D đắp lớp',
    unit: 'Công nghệ in 3D',
    duration: '12 phút',
    modelFocus: 'Mô hình số, cắt lớp, thông số in, tạo mẫu và hậu xử lí.',
    objective: 'Quan sát quá trình vật thể được hình thành từng lớp và nhận ra tác động của thông số in.',
    setup: ['Chọn mô hình đơn giản.', 'Bật chế độ cắt lớp.', 'Thay đổi chiều cao lớp hoặc mật độ infill trong mô phỏng.'],
    tasks: ['So sánh thời gian in và độ bền khi đổi thông số.', 'Xác định vị trí cần support.', 'Đề xuất cách hậu xử lí sản phẩm.'],
    observe: ['Lớp in quá dày ảnh hưởng bề mặt thế nào?', 'Vì sao chi tiết nhô ra cần support?', 'Thông số nào ảnh hưởng nhiều đến thời gian in?'],
    safety: 'Khi thực hành thật cần tránh đầu phun nóng, bàn in nóng và thao tác vật liệu theo hướng dẫn.',
  },
}

const grade12ByCourse = {
  1: {
    title: 'Mô phỏng vai trò kĩ thuật điện trong hệ thống thực tế',
    unit: 'Giới thiệu chung về kĩ thuật điện',
    duration: '8 phút',
    modelFocus: 'Nguồn điện, truyền dẫn, phụ tải, điều khiển và an toàn.',
    objective: 'Nhận ra kĩ thuật điện hiện diện trong sản xuất, sinh hoạt và tự động hóa.',
  },
  2: {
    title: 'Mô phỏng hệ thống điện quốc gia',
    unit: 'Hệ thống điện quốc gia',
    duration: '12 phút',
    modelFocus: 'Nhà máy điện, trạm biến áp, truyền tải, phân phối, phụ tải và điều độ.',
    objective: 'Hiểu lí do cần nâng áp khi truyền tải xa và cần bảo vệ hệ thống.',
  },
  3: {
    title: 'Mô phỏng mạng điện trong nhà',
    unit: 'Mạng điện trong nhà',
    duration: '12 phút',
    modelFocus: 'Nguồn cấp, bảng điện, dây dẫn, thiết bị bảo vệ, công tắc và phụ tải.',
    objective: 'Biết đọc sơ đồ nguyên lí, sơ đồ lắp đặt và chọn thiết bị phù hợp công suất tải.',
  },
  4: {
    title: 'Đấu trường xử lí tình huống an toàn điện',
    unit: 'An toàn điện',
    duration: '10 phút',
    modelFocus: 'Mạng điện trong nhà, quá tải, ngắn mạch, rò điện, thiết bị bảo vệ, cô lập nguồn và sơ cứu điện.',
    objective: 'Học sinh nhận diện nguy cơ điện trong tình huống thực tế và chọn thứ tự xử lí an toàn trước khi thao tác.',
    setup: [
      'Quan sát sơ đồ mạng điện trong nhà gồm nguồn cấp, aptomat, dây dẫn, ổ cắm và phụ tải.',
      'Chọn một tình huống: quá tải ổ cắm, dây dẫn hở, rò điện vỏ thiết bị hoặc người bị điện giật.',
      'Xác định thiết bị bảo vệ có trong mạch: cầu chì, aptomat, thiết bị chống rò hoặc nối đất.',
    ],
    tasks: [
      'Đánh dấu điểm nguy hiểm và nguyên nhân có thể gây sự cố.',
      'Sắp xếp đúng thứ tự xử lí: ngắt nguồn, cảnh báo khu vực, dùng vật cách điện, kiểm tra an toàn, gọi hỗ trợ.',
      'Chọn thiết bị bảo vệ phù hợp cho từng tình huống và giải thích lí do.',
      'Viết một quy tắc phòng tránh để áp dụng trong gia đình hoặc phòng học.',
    ],
    observe: [
      'Dấu hiệu nào cho thấy mạch đang quá tải hoặc có nguy cơ ngắn mạch?',
      'Vì sao không được chạm trực tiếp vào nạn nhân khi chưa ngắt nguồn?',
      'Thiết bị chống rò khác gì so với cầu chì hoặc aptomat thường?',
    ],
    safety: 'Chỉ thực hiện trên mô phỏng. Với thiết bị thật phải ngắt nguồn, có giáo viên hoặc người có chuyên môn hướng dẫn, không tự ý sửa chữa mạng điện đang mang điện.',
  },
  5: {
    title: 'Mô phỏng hệ thống điện tử theo sơ đồ khối',
    unit: 'Giới thiệu kĩ thuật điện tử',
    duration: '10 phút',
    modelFocus: 'Nguồn, tín hiệu vào, xử lí, đầu ra và phản hồi.',
    objective: 'Phân tích hệ thống điện tử bằng sơ đồ khối trước khi đọc mạch chi tiết.',
  },
  6: {
    title: 'Mô phỏng linh kiện điện tử cơ bản',
    unit: 'Linh kiện điện tử',
    duration: '12 phút',
    modelFocus: 'Điện trở, tụ điện, cuộn cảm, diode, transistor, cảm biến và LED.',
    objective: 'Quan sát vai trò của từng linh kiện trong dòng điện và tín hiệu.',
  },
  7: {
    title: 'Mô phỏng chỉnh lưu, lọc và khuếch đại tín hiệu',
    unit: 'Điện tử tương tự',
    duration: '12 phút',
    modelFocus: 'Diode chỉnh lưu, tụ lọc, ổn áp, khuếch đại và xử lí tín hiệu tương tự.',
    objective: 'Hiểu cách tín hiệu được biến đổi từ xoay chiều, nhấp nhô đến một chiều ổn định hơn.',
  },
  8: {
    title: 'Nhiệm vụ hoàn thành mạch điện tử số',
    unit: 'Điện tử số',
    duration: '12 phút',
    modelFocus: 'Cảm biến, chuẩn hóa tín hiệu, mức logic 0/1, cổng AND/OR/NOT, vi điều khiển, driver, đầu ra và phản hồi.',
    objective: 'Học sinh hoàn thành sơ đồ khối của một hệ thống điện tử số và giải thích cách điều kiện logic tạo ra tín hiệu điều khiển.',
    setup: [
      'Chọn nhiệm vụ mạch số: báo cháy, đèn cảnh báo, cửa tự động hoặc điều khiển quạt theo điều kiện.',
      'Quy ước mức logic 0/1 cho từng tín hiệu vào, ví dụ có khói = 1, nhiệt độ cao = 1, nút tắt khẩn cấp = 0.',
      'Kéo các khối vào đúng vị trí: cảm biến, xử lí tín hiệu, cổng logic, vi điều khiển, driver và đầu ra.',
    ],
    tasks: [
      'Lập bảng chân lí cho ít nhất hai tín hiệu đầu vào.',
      'Chọn cổng logic phù hợp: AND khi cần đủ điều kiện, OR khi chỉ cần một điều kiện, NOT khi cần đảo trạng thái.',
      'Nối luồng tín hiệu từ cảm biến đến khối xử lí logic, vi điều khiển, driver và thiết bị đầu ra.',
      'Kiểm tra hai trường hợp đúng và một trường hợp sai để chứng minh mạch hoạt động theo yêu cầu.',
    ],
    observe: [
      'Khi một tín hiệu đầu vào đổi từ 0 sang 1, đầu ra thay đổi thế nào?',
      'Điều kiện nào bắt buộc phải dùng AND thay vì OR?',
      'Vì sao vi điều khiển không nên cấp trực tiếp dòng lớn cho còi, đèn hoặc rơle?',
    ],
    safety: 'Nếu lắp mạch thật, chỉ dùng nguồn thấp áp theo hướng dẫn, kiểm tra cực tính linh kiện, không đấu trực tiếp tải công suất lớn vào chân vi điều khiển.',
  },
  9: {
    title: 'Mô phỏng hệ thống vi điều khiển',
    unit: 'Vi điều khiển',
    duration: '15 phút',
    modelFocus: 'Cảm biến, chương trình, vi điều khiển, driver, cơ cấu chấp hành và kiểm thử.',
    objective: 'Hiểu vòng lặp đọc tín hiệu, xử lí điều kiện và điều khiển đầu ra.',
  },
}

const completeExperiment = (experiment, lesson) => ({
  ...fallbackExperiment,
  ...experiment,
  lessonTitle: lesson?.title,
  setup: experiment.setup || fallbackExperiment.setup,
  tasks: experiment.tasks || [
    'Xác định các khối chính trong mô phỏng.',
    'Mô tả dòng năng lượng, vật chất hoặc tín hiệu.',
    'Giải thích hiện tượng bằng thuật ngữ của bài học.',
  ],
  observe: experiment.observe || [
    'Khối nào là đầu vào?',
    'Khối nào xử lí hoặc biến đổi?',
    'Đầu ra thay đổi khi điều kiện vào thay đổi như thế nào?',
  ],
  safety: experiment.safety || fallbackExperiment.safety,
})

export const getSimulationExperimentForLesson = (lesson) => {
  if (!lesson) return completeExperiment(fallbackExperiment, lesson)

  const grade = Number(lesson.grade_level)
  const course = Number(lesson.source_course_id || lesson.course_id)
  const sourceId = Number(lesson.source_id || lesson.id)

  if (grade === 10) {
    return completeExperiment(grade10ByCourse[course] || fallbackExperiment, lesson)
  }

  if (grade === 11 && sourceId === 202) {
    return completeExperiment({
      title: 'Mô phỏng sản xuất gang - thép trong lò cao',
      unit: 'Bài 4. Vật liệu kim loại và hợp kim',
      duration: '12 phút',
      modelFocus: 'Lò cao, nạp liệu quặng sắt - than cốc - đá vôi, gió nóng, vùng phản ứng, gang lỏng, xỉ và khí thải.',
      objective: 'Giúp học sinh biến hình 3.2 thành mô hình có thể quan sát theo dòng vật chất và giải thích vai trò của từng thành phần trong sản xuất gang - thép.',
      setup: [
        'Mở mô phỏng 3D của Bài 4 và bật lần lượt các lớp: Nạp liệu, Gió nóng, Gang - xỉ, Khí thải.',
        'Quan sát chiều chuyển động ngược nhau: vật liệu rắn đi từ trên xuống, khí nóng đi từ dưới lên.',
        'Dừng ở từng nhãn để đọc vai trò của quặng sắt, than cốc, đá vôi và cửa tháo gang/xỉ.',
      ],
      tasks: [
        'Vẽ lại sơ đồ dòng vật chất trong lò cao bằng mũi tên.',
        'Giải thích vai trò của than cốc, đá vôi và gió nóng trong quá trình luyện gang.',
        'Chỉ ra vị trí gang lỏng, xỉ và khí thải trong mô hình; nêu yêu cầu xử lí môi trường.',
      ],
      observe: [
        'Vì sao nguyên liệu được nạp từ đỉnh lò còn gió nóng lại thổi từ đáy lò?',
        'Gang lỏng và xỉ khác nhau như thế nào nên có thể tách riêng?',
        'Khí thải ở đỉnh lò cần được xử lí hoặc tận dụng ra sao?',
      ],
      safety: 'Chỉ quan sát trên mô phỏng. Với sản xuất thật, lò cao có nhiệt độ rất cao, khí độc, bụi và xỉ nóng nên cần hệ thống bảo hộ, che chắn, thông gió và xử lí môi trường nghiêm ngặt.',
    }, lesson)
  }

  if (grade === 11 && sourceId === 602) {
    return completeExperiment({
      title: 'Mô hình 3D nguyên lí động cơ 4 kì',
      unit: 'Bài 18. Nguyên lí làm việc của động cơ đốt trong',
      duration: '12 phút',
      modelFocus: 'Xi lanh, piston, thanh truyền, trục khuỷu, xupap nạp, xupap thải, vòi phun/bugi và dòng khí qua bốn kì.',
      objective: 'Giúp học sinh quan sát trực tiếp chu trình nạp, nén, cháy - giãn nở và thải; từ đó giải thích cách động cơ biến nhiệt năng thành cơ năng.',
      setup: [
        'Mở mô phỏng 3D của Bài 18 và để chế độ Động cơ 4 kì.',
        'Quan sát piston đi giữa ĐCT và ĐCD, đồng thời theo dõi trạng thái hai xupap.',
        'Dừng ở từng lớp kiến thức: nạp, nén, cháy - giãn nở, thải để đọc ghi chú và đối chiếu với sơ đồ SGK.',
      ],
      tasks: [
        'Lập bảng bốn kì với ba cột: chiều chuyển động piston, trạng thái xupap, nhiệm vụ của kì.',
        'Chỉ ra đường truyền lực từ khí cháy đến piston, thanh truyền và trục khuỷu.',
        'Giải thích vì sao kì cháy - giãn nở là kì sinh công, còn ba kì còn lại là kì chuẩn bị hoặc làm sạch xi lanh.',
      ],
      observe: [
        'Kì nào xupap nạp mở, kì nào xupap thải mở?',
        'Ở kì nén và kì cháy - giãn nở, vì sao hai xupap đều phải đóng?',
        'Một chu trình 4 kì ứng với mấy hành trình piston và mấy vòng quay trục khuỷu?',
      ],
      safety: 'Chỉ thao tác trên mô phỏng. Nếu quan sát động cơ thật cần tắt máy, tránh bộ phận quay/nóng và có giáo viên hướng dẫn.',
    }, lesson)
  }

  if (grade === 11) {
    return completeExperiment(grade11ByCourse[course] || fallbackExperiment, lesson)
  }

  if (grade === 12) {
    return completeExperiment(grade12ByCourse[course] || fallbackExperiment, lesson)
  }

  if (sourceId >= 401 && sourceId <= 405) {
    return completeExperiment({
      title: 'Mô phỏng động cơ đốt trong và ô tô',
      unit: 'Cơ khí động lực',
      duration: '12 phút',
      modelFocus: 'Piston, xupap, trục khuỷu, truyền lực, phanh, lái và hệ thống điện trên ô tô.',
      objective: 'Quan sát chuyển động và mối liên hệ giữa các hệ thống trong cơ khí động lực.',
    }, lesson)
  }

  return completeExperiment(fallbackExperiment, lesson)
}

export const getSimulationExperimentsByLessons = (lessons = []) =>
  lessons.map((lesson) => ({
    lesson,
    experiment: getSimulationExperimentForLesson(lesson),
  }))
