import { createKnttLmsData } from './knttLmsFactory'

const courseSpecs = [
  { id: 1, short_title: 'Chương I. Giới thiệu chung về kĩ thuật điện', title: 'Chương I. Giới thiệu chung về kĩ thuật điện', description: 'Khái quát vai trò, triển vọng và ngành nghề trong lĩnh vực kĩ thuật điện.' },
  { id: 2, short_title: 'Chương II. Hệ thống điện quốc gia', title: 'Chương II. Hệ thống điện quốc gia', description: 'Tìm hiểu mạch điện xoay chiều ba pha, sản xuất, truyền tải, phân phối và mạng điện.' },
  { id: 3, short_title: 'Chương III. Hệ thống điện trong gia đình', title: 'Chương III. Hệ thống điện trong gia đình', description: 'Thiết kế, lựa chọn thiết bị và lắp đặt mạch điều khiển trong hệ thống điện gia đình.' },
  { id: 4, short_title: 'Chương IV. An toàn và tiết kiệm điện năng', title: 'Chương IV. An toàn và tiết kiệm điện năng', description: 'Thực hiện an toàn điện, sơ cứu điện và sử dụng điện tiết kiệm, hiệu quả.' },
  { id: 5, short_title: 'Chương V. Giới thiệu chung về kĩ thuật điện tử', title: 'Chương V. Giới thiệu chung về kĩ thuật điện tử', description: 'Khái quát kĩ thuật điện tử, ngành nghề và dịch vụ trong lĩnh vực điện tử.' },
  { id: 6, short_title: 'Chương VI. Linh kiện điện tử', title: 'Chương VI. Linh kiện điện tử', description: 'Nhận biết điện trở, tụ điện, cuộn cảm, diode, transistor, IC và mạch thực hành phát hiện dòng điện.' },
  { id: 7, short_title: 'Chương VII. Điện tử tương tự', title: 'Chương VII. Điện tử tương tự', description: 'Tìm hiểu tín hiệu tương tự, khuếch đại thuật toán và mạch khuếch đại đảo.' },
  { id: 8, short_title: 'Chương VIII. Điện tử số', title: 'Chương VIII. Điện tử số', description: 'Nhận biết tín hiệu số, cổng logic, mạch xử lí tín hiệu và lắp ráp mạch báo cháy.' },
  { id: 9, short_title: 'Chương IX. Vi điều khiển', title: 'Chương IX. Vi điều khiển', description: 'Khái quát vi điều khiển, bo mạch lập trình và dự án điều chỉnh cường độ sáng LED.' },
]

const lessonSpecs = [
  { id: 101, course_id: 1, title: 'Bài 1. Giới thiệu tổng quan về kĩ thuật điện', description: 'Hiểu vai trò, triển vọng và đặc điểm của kĩ thuật điện trong sản xuất và đời sống.', key_points: ['Kĩ thuật điện nghiên cứu, thiết kế, sản xuất, truyền tải, phân phối và sử dụng điện năng.', 'Hệ thống điện cần bảo đảm an toàn, tin cậy, tiết kiệm và thân thiện môi trường.', 'Xu hướng phát triển gồm năng lượng tái tạo, lưới điện thông minh, tự động hóa và chuyển đổi số.'] },
  { id: 102, course_id: 1, title: 'Bài 2. Ngành nghề trong lĩnh vực kĩ thuật điện', description: 'Nhận biết nhiệm vụ, yêu cầu và năng lực nghề điện.', key_points: ['Ngành nghề kĩ thuật điện gồm thiết kế, lắp đặt, vận hành, bảo trì hệ thống điện và thiết bị điện.', 'Người làm việc trong lĩnh vực điện cần đọc sơ đồ, đo kiểm, tuân thủ an toàn và thao tác chính xác.', 'Định hướng nghề cần gắn năng lực cá nhân với nhu cầu xã hội và xu hướng công nghệ.'] },
  { id: 201, course_id: 2, title: 'Bài 3. Mạch điện xoay chiều ba pha', description: 'Nhận biết đặc điểm nguồn ba pha, tải ba pha và cách nối cơ bản.', key_points: ['Mạch điện ba pha dùng phổ biến trong sản xuất và truyền tải điện năng.', 'Cần phân biệt đại lượng pha, dây, cách nối sao, tam giác và quan hệ điện áp - dòng điện.', 'Vận hành mạch ba pha cần chú ý cân bằng tải, bảo vệ và an toàn điện.'] },
  { id: 202, course_id: 2, title: 'Bài 4. Hệ thống điện quốc gia', description: 'Mô tả cấu trúc nguồn điện, lưới điện, phụ tải và điều độ.', key_points: ['Hệ thống điện quốc gia gồm nguồn điện, lưới truyền tải, lưới phân phối, phụ tải và điều khiển bảo vệ.', 'Truyền tải điện áp cao giúp giảm tổn thất khi đưa điện đi xa.', 'Điều độ và bảo vệ giúp hệ thống vận hành ổn định, an toàn, liên tục.'] },
  { id: 203, course_id: 2, title: 'Bài 5. Sản xuất điện năng', description: 'Tìm hiểu các phương thức sản xuất điện và xu hướng năng lượng.', key_points: ['Nguồn điện biến đổi năng lượng sơ cấp thành điện năng.', 'Nhiệt điện, thủy điện, điện gió, điện mặt trời và các nguồn khác có ưu nhược điểm riêng.', 'Sản xuất điện cần cân bằng hiệu quả, chi phí, phát thải và độ ổn định nguồn.'] },
  { id: 204, course_id: 2, title: 'Bài 6. Mạng điện sản xuất quy mô nhỏ', description: 'Nhận biết cấu trúc mạng điện phục vụ cơ sở sản xuất nhỏ.', key_points: ['Mạng điện sản xuất quy mô nhỏ cần cấp điện đủ công suất, tin cậy và thuận tiện vận hành.', 'Cần bố trí tủ điện, thiết bị bảo vệ, đường dây và phụ tải theo sơ đồ rõ ràng.', 'An toàn, chống quá tải, nối đất và kiểm tra định kì là yêu cầu bắt buộc.'] },
  { id: 205, course_id: 2, title: 'Bài 7. Mạng điện hạ áp dùng trong sinh hoạt', description: 'Tìm hiểu mạng điện hạ áp và nguyên tắc cấp điện sinh hoạt.', key_points: ['Mạng điện hạ áp cấp điện trực tiếp cho hộ gia đình và phụ tải sinh hoạt.', 'Thiết bị bảo vệ, dây dẫn, công tơ, bảng điện và nối đất cần được lựa chọn phù hợp.', 'Sử dụng điện sinh hoạt phải an toàn, tiết kiệm và dễ kiểm tra bảo dưỡng.'] },
  { id: 301, course_id: 3, title: 'Bài 8. Hệ thống điện trong gia đình', description: 'Nhận biết cấu trúc và yêu cầu của hệ thống điện gia đình.', key_points: ['Hệ thống điện gia đình gồm nguồn cấp, thiết bị bảo vệ, dây dẫn, thiết bị điều khiển và đồ dùng điện.', 'Hệ thống cần thuận tiện, an toàn, tin cậy, thẩm mĩ và phù hợp công suất tải.', 'Sơ đồ nguyên lí và sơ đồ lắp đặt giúp đọc, thiết kế và sửa chữa dễ hơn.'] },
  { id: 302, course_id: 3, title: 'Bài 9. Thiết bị điện trong hệ thống điện gia đình', description: 'Lựa chọn thiết bị đóng cắt, bảo vệ, điều khiển và đồ dùng điện.', key_points: ['Thiết bị điện cần phù hợp điện áp, dòng điện, công suất, môi trường và mục đích sử dụng.', 'Aptomat, cầu chì, công tắc, ổ cắm, rơle và thiết bị chống rò giúp bảo vệ người và thiết bị.', 'Không thay thiết bị sai định mức hoặc đấu nối không đúng kĩ thuật.'] },
  { id: 303, course_id: 3, title: 'Bài 10. Thiết kế và lắp đặt mạch điện điều khiển trong gia đình', description: 'Vận dụng kí hiệu và sơ đồ để thiết kế, lắp đặt mạch điều khiển đơn giản.', key_points: ['Thiết kế mạch cần xác định yêu cầu, chọn thiết bị, vẽ sơ đồ nguyên lí và sơ đồ lắp đặt.', 'Lắp đặt phải ngắt nguồn, kiểm tra cách điện, đấu nối đúng cực và thử nghiệm an toàn.', 'Sản phẩm đạt yêu cầu khi hoạt động đúng, gọn, an toàn và dễ bảo trì.'] },
  { id: 401, course_id: 4, title: 'Bài 11. An toàn điện', description: 'Nhận diện nguy cơ điện giật, chập cháy và thực hiện biện pháp phòng tránh.', key_points: ['Điện giật, quá tải, ngắn mạch, hồ quang và rò điện là các nguy cơ phổ biến.', 'Cần ngắt nguồn trước khi sửa chữa, dùng bảo hộ, nối đất và thiết bị bảo vệ phù hợp.', 'Sơ cứu điện phải bảo đảm an toàn cho người cứu và gọi hỗ trợ y tế khi cần.'] },
  { id: 402, course_id: 4, title: 'Bài 12. Tiết kiệm điện năng', description: 'Tìm hiểu biện pháp sử dụng điện tiết kiệm và hiệu quả.', key_points: ['Tiết kiệm điện giúp giảm chi phí, giảm tải hệ thống và bảo vệ môi trường.', 'Chọn thiết bị hiệu suất cao, dùng đúng nhu cầu, bảo trì định kì và tắt thiết bị không cần thiết.', 'Có thể theo dõi điện năng tiêu thụ để điều chỉnh thói quen sử dụng.'] },
  { id: 501, course_id: 5, title: 'Bài 13. Khái quát về kĩ thuật điện tử', description: 'Hiểu đối tượng, vai trò và ứng dụng của kĩ thuật điện tử.', key_points: ['Kĩ thuật điện tử làm việc chủ yếu với tín hiệu và mạch điều khiển.', 'Hệ thống điện tử thường gồm khối vào, xử lí, khối ra, nguồn cấp và phản hồi.', 'Điện tử có mặt trong truyền thông, tự động hóa, thiết bị gia dụng, y tế, giao thông và giáo dục.'] },
  { id: 502, course_id: 5, title: 'Bài 14. Ngành nghề và dịch vụ trong lĩnh vực kĩ thuật điện tử', description: 'Nhận biết nghề thiết kế, lắp ráp, kiểm tra, sửa chữa và dịch vụ điện tử.', key_points: ['Lĩnh vực điện tử cần nhân lực thiết kế mạch, lập trình nhúng, lắp ráp, đo kiểm, bảo trì và hỗ trợ kĩ thuật.', 'Năng lực quan trọng gồm đọc sơ đồ, hiểu linh kiện, đo tín hiệu và xử lí lỗi có hệ thống.', 'Dịch vụ điện tử hiện đại gắn với IoT, thiết bị thông minh và bảo mật dữ liệu.'] },
  { id: 601, course_id: 6, title: 'Bài 15. Điện trở, tụ điện và cuộn cảm', description: 'Nhận biết linh kiện thụ động và chức năng trong mạch.', key_points: ['Điện trở hạn chế dòng điện, phân áp hoặc tạo tải trong mạch.', 'Tụ điện tích - phóng điện, lọc nguồn, ghép tín hiệu hoặc tạo trễ.', 'Cuộn cảm liên quan đến từ trường, lọc, tích trữ năng lượng và mạch dao động.'] },
  { id: 602, course_id: 6, title: 'Bài 16. Diode, transistor và mạch tích hợp IC', description: 'Nhận biết linh kiện bán dẫn và ứng dụng cơ bản.', key_points: ['Diode cho dòng điện đi chủ yếu theo một chiều và dùng trong chỉnh lưu, bảo vệ, phát sáng.', 'Transistor có thể khuếch đại tín hiệu hoặc đóng cắt như công tắc điện tử.', 'IC tích hợp nhiều linh kiện để thực hiện chức năng xử lí, điều khiển hoặc nhớ.'] },
  { id: 603, course_id: 6, title: 'Bài 17. Thực hành: Mạch phát hiện dòng điện xoay chiều trong dây dẫn', description: 'Lắp ráp, kiểm tra và giải thích mạch phát hiện dòng điện xoay chiều.', key_points: ['Thực hành cần đọc sơ đồ, nhận dạng linh kiện, lắp đúng cực tính và kiểm tra nguồn.', 'Mạch phát hiện dòng điện giúp nhận biết sự có mặt của dòng xoay chiều qua tín hiệu chỉ thị.', 'Kết quả thực hành phải được kiểm tra bằng tiêu chí hoạt động, an toàn và thao tác đúng.'] },
  { id: 701, course_id: 7, title: 'Bài 18. Giới thiệu về điện tử tương tự', description: 'Nhận biết tín hiệu tương tự và chức năng xử lí trong mạch tương tự.', key_points: ['Tín hiệu tương tự biến thiên liên tục theo thời gian.', 'Mạch tương tự có thể khuếch đại, lọc, so sánh, chỉnh lưu hoặc ổn áp.', 'Đọc mạch tương tự cần chú ý nguồn, tín hiệu vào, tầng xử lí và tín hiệu ra.'] },
  { id: 702, course_id: 7, title: 'Bài 19. Khuếch đại thuật toán', description: 'Tìm hiểu chức năng và ứng dụng cơ bản của op-amp.', key_points: ['Khuếch đại thuật toán là linh kiện tích hợp dùng để khuếch đại và xử lí tín hiệu tương tự.', 'Mạch op-amp có thể tạo cấu hình khuếch đại đảo, không đảo, so sánh hoặc lọc.', 'Cần xét nguồn cấp, hồi tiếp, điện trở và giới hạn tín hiệu khi phân tích mạch.'] },
  { id: 703, course_id: 7, title: 'Bài 20. Thực hành: Mạch khuếch đại đảo', description: 'Lắp ráp, đo kiểm và giải thích mạch khuếch đại đảo dùng op-amp.', key_points: ['Mạch khuếch đại đảo cho tín hiệu ra ngược pha với tín hiệu vào.', 'Hệ số khuếch đại phụ thuộc vào tỉ số điện trở hồi tiếp và điện trở vào.', 'Thực hành cần đo tín hiệu, so sánh với lí thuyết và bảo đảm an toàn thiết bị.'] },
  { id: 801, course_id: 8, title: 'Bài 21. Tín hiệu số và các cổng logic cơ bản', description: 'Nhận biết mức logic và cổng AND, OR, NOT cùng bảng chân lí.', key_points: ['Tín hiệu số thường biểu diễn bằng hai mức logic 0 và 1.', 'Cổng logic thực hiện phép toán logic cơ bản để tạo quyết định trong mạch số.', 'Bảng chân lí mô tả quan hệ giữa đầu vào và đầu ra của cổng logic.'] },
  { id: 802, course_id: 8, title: 'Bài 22. Một số mạch xử lí tín hiệu trong điện tử số', description: 'Tìm hiểu mạch tổ hợp, mạch tuần tự và ứng dụng xử lí tín hiệu số.', key_points: ['Mạch tổ hợp có đầu ra phụ thuộc vào trạng thái đầu vào hiện tại.', 'Mạch tuần tự có đầu ra phụ thuộc vào đầu vào và trạng thái trước đó.', 'Bộ đếm, thanh ghi, chốt và flip-flop là thành phần quan trọng trong mạch số.'] },
  { id: 803, course_id: 8, title: 'Bài 23. Thực hành: Lắp ráp, kiểm tra mạch báo cháy dùng cổng logic', description: 'Lắp ráp và kiểm tra mạch báo cháy sử dụng cổng logic cơ bản.', key_points: ['Mạch báo cháy cần xác định tín hiệu cảm biến, điều kiện logic và tín hiệu cảnh báo.', 'Lắp ráp cần đúng sơ đồ, đúng nguồn, đúng cực linh kiện và kiểm tra từng khối.', 'Sản phẩm đạt yêu cầu khi cảnh báo đúng điều kiện và hoạt động ổn định.'] },
  { id: 901, course_id: 9, title: 'Bài 24. Khái quát về vi điều khiển', description: 'Mô tả cấu trúc hệ thống vi điều khiển và vai trò trong điều khiển thiết bị.', key_points: ['Vi điều khiển là bộ điều khiển nhỏ gọn có thể lập trình để xử lí tín hiệu và điều khiển thiết bị.', 'Hệ thống vi điều khiển gồm bộ xử lí, bộ nhớ, chân vào/ra, nguồn, cảm biến và cơ cấu chấp hành.', 'Chương trình quyết định cách hệ thống đọc dữ liệu, xử lí điều kiện và tạo tín hiệu ra.'] },
  { id: 902, course_id: 9, title: 'Bài 25. Bo mạch lập trình vi điều khiển', description: 'Nhận biết bo mạch, chân vào/ra, nguồn, giao tiếp và môi trường lập trình.', key_points: ['Bo mạch lập trình tích hợp vi điều khiển, nguồn, cổng giao tiếp và chân kết nối.', 'Kết nối cảm biến và cơ cấu chấp hành cần đúng điện áp, dòng điện, cực tính và chân tín hiệu.', 'Dùng driver hoặc rơle khi tải cần dòng lớn hơn khả năng chân vi điều khiển.'] },
  { id: 903, course_id: 9, title: 'Bài 26. Thực hành: Mạch tự động điều chỉnh cường độ sáng LED', description: 'Thiết kế, lắp ráp, lập trình và kiểm tra mạch điều chỉnh LED theo môi trường.', key_points: ['Dự án cần xác định yêu cầu, cảm biến ánh sáng, thuật toán điều khiển và tiêu chí kiểm tra.', 'Kiểm thử từng phần giúp phát hiện lỗi nối dây, lỗi chương trình hoặc lỗi nguồn cấp.', 'Sản phẩm cần được đánh giá theo chức năng, độ ổn định, an toàn và khả năng cải tiến.'] },
]

const hiddenVisualFlowLessons = new Set([101, 102, 401, 402, 502])

const enrichLessonFromSlide = (lesson) => {
  const topic = lesson.title.replace(/^Bài \d+\.\s*/i, '').toLowerCase()

  return {
    ...lesson,
    summary: [lesson.description, ...lesson.key_points].join(' '),
    objectives: [
      `Trình bày được nội dung trọng tâm của ${topic}.`,
      'Giải thích được khái niệm, thành phần hoặc quy trình bằng sơ đồ và ví dụ.',
      'Vận dụng kiến thức vào nhiệm vụ học tập đúng kĩ thuật và an toàn.',
    ],
    application: [
      `Vẽ sơ đồ hoặc lập bảng tóm tắt các ý chính về ${topic}.`,
      `Phân tích một tình huống thực tế liên quan đến ${topic}.`,
    ],
    hide_visual_flow: hiddenVisualFlowLessons.has(lesson.id),
  }
}

const data = createKnttLmsData({
  theme: 'electrical',
  gradeTitle: 'Công nghệ 12 - Công nghệ Điện - Điện tử',
  courseSpecs,
  lessonSpecs: lessonSpecs.map(enrichLessonFromSlide),
  assessmentPrefix: 'kntt12',
  defaultTitle: 'Công nghệ Điện - Điện tử 12',
})

export const canhDieuCourses = data.courses
export const canhDieuLessons = data.lessons
export const canhDieuQuestions = data.questions
export const canhDieuActivities = data.activities
export const chapterAssessments = data.chapterAssessments
