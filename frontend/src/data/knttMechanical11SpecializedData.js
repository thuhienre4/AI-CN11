import { createKnttLmsData } from './knttLmsFactory'

const courseSpecs = [
  { id: 1, short_title: 'Chương I. Giới thiệu chung về cơ khí chế tạo', title: 'Chương I. Giới thiệu chung về cơ khí chế tạo', description: 'Khái quát vai trò, đặc điểm và ngành nghề trong lĩnh vực cơ khí chế tạo.' },
  { id: 2, short_title: 'Chương II. Vật liệu cơ khí', title: 'Chương II. Vật liệu cơ khí', description: 'Tìm hiểu vật liệu kim loại, hợp kim, phi kim loại và vật liệu mới dùng trong cơ khí.' },
  { id: 3, short_title: 'Chương III. Các phương pháp gia công cơ khí', title: 'Chương III. Các phương pháp gia công cơ khí', description: 'Nhận biết gia công cơ khí, một số phương pháp gia công và quy trình công nghệ gia công chi tiết.' },
  { id: 4, short_title: 'Chương IV. Sản xuất cơ khí', title: 'Chương IV. Sản xuất cơ khí', description: 'Phân tích quá trình sản xuất, dây chuyền tự động, robot, tự động hóa và an toàn môi trường.' },
  { id: 5, short_title: 'Chương V. Giới thiệu chung về cơ khí động lực', title: 'Chương V. Giới thiệu chung về cơ khí động lực', description: 'Khái quát cơ khí động lực và định hướng ngành nghề liên quan.' },
  { id: 6, short_title: 'Chương VI. Động cơ đốt trong', title: 'Chương VI. Động cơ đốt trong', description: 'Tìm hiểu đại cương, nguyên lí làm việc, cơ cấu và hệ thống trong động cơ đốt trong.' },
  { id: 7, short_title: 'Chương VII. Ô tô', title: 'Chương VII. Ô tô', description: 'Khái quát ô tô, hệ thống truyền lực, bánh xe - treo, lái, phanh và an toàn giao thông.' },
]

const lessonSpecs = [
  { id: 101, course_id: 1, title: 'Bài 1. Khái quát về cơ khí chế tạo', description: 'Nhận biết khái niệm, vai trò, đặc điểm và các bước cơ bản trong chế tạo cơ khí.', key_points: ['Cơ khí chế tạo tạo ra chi tiết, máy, thiết bị phục vụ sản xuất và đời sống.', 'Quy trình chế tạo thường đi từ yêu cầu, thiết kế, chọn vật liệu, gia công, lắp ráp đến kiểm tra.', 'Cơ khí chế tạo cần độ chính xác, an toàn, năng suất và khả năng bảo trì.'] },
  { id: 102, course_id: 1, title: 'Bài 2. Ngành nghề trong lĩnh vực cơ khí chế tạo', description: 'Tìm hiểu công việc, yêu cầu năng lực và triển vọng nghề cơ khí chế tạo.', key_points: ['Ngành nghề cơ khí chế tạo gồm thiết kế, gia công, vận hành máy, kiểm tra, bảo trì và quản lí sản xuất.', 'Người học cần đọc bản vẽ, hiểu vật liệu, quy trình, đo kiểm và an toàn lao động.', 'Định hướng nghề cần gắn sở thích cá nhân với nhu cầu sản xuất hiện đại.'] },
  { id: 201, course_id: 2, title: 'Bài 3. Tổng quan về vật liệu cơ khí', description: 'Phân loại vật liệu cơ khí và tiêu chí lựa chọn vật liệu.', key_points: ['Vật liệu cơ khí được chọn theo cơ tính, lí tính, hóa tính, khả năng gia công và điều kiện làm việc.', 'Lựa chọn vật liệu ảnh hưởng trực tiếp tới độ bền, chi phí, an toàn và tuổi thọ sản phẩm.', 'Cần đọc yêu cầu kĩ thuật trước khi quyết định vật liệu.'] },
  {
    id: 202,
    course_id: 2,
    title: 'Bài 4. Vật liệu kim loại và hợp kim',
    description: 'Nhận biết kim loại, hợp kim, gang, thép và liên hệ quy trình sản xuất gang - thép trong lò cao.',
    summary: 'Bài học giới thiệu kim loại và hợp kim dùng trong cơ khí, trong đó gang và thép là hai vật liệu quan trọng. Mô hình lò cao giúp quan sát quặng sắt, than cốc và đá vôi được nạp từ đỉnh lò; gió nóng thổi vào đáy lò tạo nhiệt và khí khử; gang lỏng, xỉ và khí thải được tách ra ở các cửa khác nhau. Từ đó học sinh hiểu vật liệu kim loại không chỉ được lựa chọn theo tính chất mà còn gắn với quy trình luyện kim và yêu cầu bảo vệ môi trường.',
    objectives: [
      'Phân biệt được kim loại, hợp kim, gang và thép ở mức khái quát.',
      'Mô tả được các dòng vật chất chính trong mô hình sản xuất gang - thép bằng lò cao.',
      'Liên hệ được tính chất của gang, thép với ứng dụng trong cơ khí và yêu cầu xử lí khí thải, xỉ.',
    ],
    key_points: [
      'Kim loại và hợp kim có độ bền, độ dẻo, độ cứng, khả năng dẫn nhiệt, dẫn điện và khả năng gia công khác nhau.',
      'Trong lò cao, quặng sắt, than cốc và đá vôi đi từ trên xuống; gió nóng đi từ dưới lên để tạo nhiệt và phản ứng khử oxit sắt.',
      'Gang lỏng được tháo ở đáy lò, xỉ được tách riêng; gang có thể tiếp tục luyện để tạo thép phù hợp yêu cầu cơ khí.',
    ],
    application: [
      'Quan sát mô hình 3D lò cao và ghi lại đường đi của quặng, gió nóng, gang lỏng, xỉ và khí thải.',
      'Giải thích vì sao sản xuất gang - thép cần chú ý thu hồi khí thải, xử lí xỉ và tiết kiệm năng lượng.',
    ],
  },
  { id: 203, course_id: 2, title: 'Bài 5. Vật liệu phi kim loại', description: 'Tìm hiểu nhựa, cao su, gốm, composite và ứng dụng trong cơ khí.', key_points: ['Vật liệu phi kim loại có ưu điểm về khối lượng, cách điện, chống ăn mòn hoặc giảm ma sát.', 'Nhựa, cao su, gốm và composite được dùng trong chi tiết cách điện, giảm chấn, vỏ máy hoặc kết cấu nhẹ.', 'Cần xét nhiệt độ, tải trọng, môi trường và khả năng tái chế khi sử dụng.'] },
  { id: 204, course_id: 2, title: 'Bài 6. Vật liệu mới', description: 'Nhận biết vật liệu mới và xu hướng ứng dụng trong sản xuất hiện đại.', key_points: ['Vật liệu mới hướng tới nhẹ, bền, thông minh, thân thiện môi trường và phù hợp công nghệ cao.', 'Vật liệu nano, composite tiên tiến, vật liệu in 3D và vật liệu nhớ hình mở rộng khả năng thiết kế.', 'Ứng dụng vật liệu mới cần đánh giá chi phí, quy trình chế tạo và an toàn sử dụng.'] },
  { id: 301, course_id: 3, title: 'Bài 7. Khái quát về gia công cơ khí', description: 'Hiểu mục đích, phân loại và yêu cầu của gia công cơ khí.', key_points: ['Gia công cơ khí làm thay đổi hình dạng, kích thước, bề mặt hoặc tính chất của phôi.', 'Có thể phân loại theo gia công cắt gọt, không cắt gọt, nhiệt luyện, xử lí bề mặt và công nghệ số.', 'Gia công cần bảo đảm kích thước, độ chính xác, năng suất và an toàn máy.'] },
  { id: 302, course_id: 3, title: 'Bài 8. Một số phương pháp gia công cơ khí', description: 'Nhận biết tiện, phay, khoan, mài, đúc, rèn, hàn và gia công hiện đại.', key_points: ['Mỗi phương pháp gia công có nguyên lí, dụng cụ, thiết bị và phạm vi ứng dụng riêng.', 'Chọn phương pháp cần dựa vào vật liệu, hình dạng, độ chính xác, sản lượng và chi phí.', 'Gia công hiện đại như CNC, laser, EDM, in 3D giúp tạo chi tiết phức tạp và tự động hóa cao.'] },
  { id: 303, course_id: 3, title: 'Bài 9. Quy trình công nghệ gia công chi tiết', description: 'Lập trình tự gia công chi tiết từ bản vẽ đến kiểm tra.', key_points: ['Quy trình công nghệ xác định phôi, nguyên công, máy, dao, đồ gá, chế độ cắt và kiểm tra.', 'Trình tự hợp lí giúp đạt yêu cầu kĩ thuật, giảm sai lỗi và tiết kiệm chi phí.', 'Đo kiểm sau gia công là căn cứ để đánh giá và điều chỉnh quy trình.'] },
  { id: 304, course_id: 3, title: 'Bài 10. Dự án: Chế tạo sản phẩm bằng phương pháp gia công cắt gọt', description: 'Tổ chức dự án nhỏ để lập kế hoạch, gia công, đo kiểm và báo cáo một sản phẩm cơ khí đơn giản.', key_points: ['Dự án gia công cần bắt đầu từ yêu cầu sản phẩm, bản vẽ phác thảo, vật liệu và phương án công nghệ.', 'Quá trình thực hiện phải tuân thủ an toàn máy, dụng cụ, phôi, phoi và bảo hộ cá nhân.', 'Sản phẩm được đánh giá bằng kích thước, bề mặt, công năng, báo cáo quy trình và khả năng cải tiến.'] },
  { id: 401, course_id: 4, title: 'Bài 11. Quá trình sản xuất cơ khí', description: 'Mô tả các giai đoạn của quá trình sản xuất cơ khí.', key_points: ['Sản xuất cơ khí gồm chuẩn bị kĩ thuật, chuẩn bị vật tư, gia công, lắp ráp, kiểm tra và hoàn thiện.', 'Tổ chức sản xuất tốt giúp tăng năng suất, chất lượng và tính ổn định.', 'Dữ liệu kĩ thuật, bản vẽ, quy trình và tiêu chuẩn là cơ sở quản lí sản xuất.'] },
  { id: 402, course_id: 4, title: 'Bài 12. Dây chuyền sản xuất tự động với sự tham gia của robot', description: 'Tìm hiểu cấu trúc dây chuyền tự động và vai trò của robot công nghiệp.', key_points: ['Dây chuyền tự động kết hợp máy, robot, cảm biến, cơ cấu chấp hành và bộ điều khiển.', 'Robot giúp thao tác lặp lại, nâng cao năng suất, giảm nguy hiểm và ổn định chất lượng.', 'Thiết kế dây chuyền cần xét an toàn vùng làm việc, đồng bộ thiết bị và bảo trì.'] },
  { id: 403, course_id: 4, title: 'Bài 13. Tự động hóa sản xuất dưới tác động của Cách mạng công nghiệp 4.0', description: 'Nhận biết vai trò dữ liệu, kết nối, AI, IoT và sản xuất thông minh.', key_points: ['Tự động hóa 4.0 gắn với cảm biến, kết nối dữ liệu, giám sát thời gian thực và tối ưu bằng phần mềm.', 'Nhà máy thông minh giúp linh hoạt sản xuất, giảm lỗi và dự báo bảo trì.', 'Người lao động cần năng lực số, phân tích dữ liệu và phối hợp với hệ thống tự động.'] },
  { id: 404, course_id: 4, title: 'Bài 14. An toàn lao động và bảo vệ môi trường trong sản xuất cơ khí', description: 'Nhận diện nguy cơ và biện pháp phòng tránh trong xưởng cơ khí.', key_points: ['Nguy cơ cơ khí gồm va chạm, kẹp cuốn, mảnh văng, tiếng ồn, bụi, nhiệt và hóa chất.', 'An toàn cần bảo hộ, quy trình thao tác, che chắn, biển báo, khóa nguồn và đào tạo.', 'Bảo vệ môi trường cần quản lí phế liệu, dầu mỡ, bụi, nước thải và tiết kiệm năng lượng.'] },
  { id: 501, course_id: 5, title: 'Bài 15. Khái quát về cơ khí động lực', description: 'Hiểu vai trò của cơ khí động lực trong tạo, truyền và sử dụng năng lượng cơ học.', flow: 'engine', key_points: ['Cơ khí động lực nghiên cứu, khai thác và bảo dưỡng các máy tạo hoặc truyền công suất.', 'Động cơ, hệ truyền lực, phương tiện giao thông và máy công tác là các đối tượng tiêu biểu.', 'Hiệu quả, an toàn, tiết kiệm nhiên liệu và giảm phát thải là yêu cầu quan trọng.'] },
  { id: 502, course_id: 5, title: 'Bài 16. Ngành nghề trong lĩnh vực cơ khí động lực', description: 'Tìm hiểu nghề liên quan đến động cơ, ô tô, máy công trình và bảo dưỡng.', flow: 'engine', key_points: ['Nghề cơ khí động lực gồm thiết kế, lắp ráp, vận hành, chẩn đoán, sửa chữa và kiểm định.', 'Năng lực cốt lõi là đọc tài liệu kĩ thuật, hiểu nguyên lí, dùng dụng cụ đo và tuân thủ an toàn.', 'Xu hướng nghề gắn với xe điện, tự động hóa, chẩn đoán điện tử và bảo vệ môi trường.'] },
  { id: 601, course_id: 6, title: 'Bài 17. Đại cương về động cơ đốt trong', description: 'Nhận biết khái niệm, phân loại và thông số cơ bản của động cơ đốt trong.', flow: 'engine', key_points: ['Động cơ đốt trong biến đổi nhiệt năng của nhiên liệu cháy trong xi lanh thành cơ năng.', 'Có thể phân loại theo nhiên liệu, số kì, cách làm mát, cách tạo hòa khí và số xi lanh.', 'Thông số như công suất, mô men, dung tích, tỉ số nén giúp đánh giá động cơ.'] },
  { id: 602, course_id: 6, title: 'Bài 18. Nguyên lí làm việc của động cơ đốt trong', description: 'Mô tả chu trình làm việc của động cơ bốn kì và hai kì.', flow: 'engine', key_points: ['Động cơ bốn kì gồm nạp, nén, cháy - giãn nở và thải.', 'Mỗi kì có chuyển động piston, trạng thái xupap và nhiệm vụ riêng.', 'Hiểu nguyên lí giúp giải thích công suất, tiêu hao nhiên liệu và hiện tượng hư hỏng.'] },
  { id: 603, course_id: 6, title: 'Bài 19. Các cơ cấu trong động cơ đốt trong', description: 'Nhận biết cơ cấu trục khuỷu - thanh truyền và cơ cấu phối khí.', flow: 'engine', key_points: ['Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của piston thành chuyển động quay.', 'Cơ cấu phối khí điều khiển thời điểm nạp và thải môi chất.', 'Các cơ cấu cần bôi trơn, làm mát và lắp ghép chính xác để làm việc bền.'] },
  { id: 604, course_id: 6, title: 'Bài 20. Các hệ thống trong động cơ đốt trong', description: 'Tìm hiểu hệ thống nhiên liệu, bôi trơn, làm mát, khởi động và đánh lửa hoặc phun nhiên liệu.', flow: 'engine', key_points: ['Các hệ thống phụ trợ bảo đảm động cơ có nhiên liệu, nhiệt độ, ma sát và điều kiện khởi động phù hợp.', 'Hệ thống bôi trơn giảm ma sát và mài mòn; làm mát giữ nhiệt độ ổn định.', 'Chẩn đoán động cơ cần đọc dấu hiệu từ nhiều hệ thống cùng lúc.'] },
  { id: 701, course_id: 7, title: 'Bài 21. Khái quát chung về ô tô', description: 'Nhận biết cấu tạo chung, phân loại và vai trò của các hệ thống trên ô tô.', flow: 'engine', key_points: ['Ô tô gồm nguồn động lực, hệ truyền lực, hệ thống treo, lái, phanh, thân vỏ và hệ thống điện - điện tử.', 'Mỗi hệ thống có chức năng riêng nhưng liên kết để bảo đảm xe vận hành an toàn.', 'Xu hướng ô tô hiện đại gắn với điện hóa, kết nối, hỗ trợ lái và tiết kiệm năng lượng.'] },
  { id: 702, course_id: 7, title: 'Bài 22. Hệ thống truyền lực', description: 'Mô tả nhiệm vụ và các bộ phận chính của hệ thống truyền lực.', flow: 'engine', key_points: ['Hệ thống truyền lực truyền mô men từ động cơ tới bánh xe chủ động.', 'Các bộ phận như li hợp, hộp số, trục truyền, vi sai phối hợp để thay đổi mô men và tốc độ.', 'Truyền lực cần êm, hiệu quả, bền và phù hợp điều kiện chuyển động.'] },
  { id: 703, course_id: 7, title: 'Bài 23. Bánh xe và hệ thống treo ô tô', description: 'Hiểu vai trò của bánh xe, lốp, giảm xóc và hệ thống treo.', flow: 'engine', key_points: ['Bánh xe tiếp xúc mặt đường, truyền lực kéo, lực phanh và lực lái.', 'Hệ thống treo giảm dao động, tăng độ êm dịu và giữ bánh xe bám đường.', 'Tình trạng lốp, áp suất và giảm xóc ảnh hưởng trực tiếp tới an toàn.'] },
  { id: 704, course_id: 7, title: 'Bài 24. Hệ thống lái', description: 'Mô tả nhiệm vụ, cấu tạo chung và yêu cầu của hệ thống lái.', flow: 'engine', key_points: ['Hệ thống lái thay đổi hướng chuyển động của ô tô theo điều khiển của người lái hoặc bộ điều khiển.', 'Cơ cấu lái, dẫn động lái và trợ lực lái giúp xe chuyển hướng chính xác, nhẹ và ổn định.', 'Độ rơ, sai lệch góc đặt bánh xe hoặc hư hỏng trợ lực đều ảnh hưởng tới an toàn.'] },
  { id: 705, course_id: 7, title: 'Bài 25. Hệ thống phanh và an toàn khi tham gia giao thông', description: 'Nhận biết hệ thống phanh, các công nghệ an toàn và nguyên tắc tham gia giao thông.', flow: 'engine', key_points: ['Hệ thống phanh làm giảm tốc độ, dừng xe và giữ xe đứng yên an toàn.', 'ABS, phân phối lực phanh, cân bằng điện tử và hỗ trợ phanh tăng khả năng kiểm soát xe.', 'An toàn giao thông cần kết hợp kĩ thuật xe, bảo dưỡng và hành vi lái xe đúng quy định.'] },
]

const hiddenVisualFlowLessons = new Set([102, 404, 502])

const enrichLessonContent = (lesson) => {
  const topic = lesson.title.replace(/^Bài \d+\.\s*/i, '').toLowerCase()

  return {
    ...lesson,
    summary: lesson.summary || [lesson.description, ...lesson.key_points].join(' '),
    objectives: lesson.objectives || [
      `Trình bày được nội dung trọng tâm của ${topic}.`,
      'Giải thích được cấu tạo, vật liệu, quy trình hoặc nguyên lí bằng sơ đồ và ví dụ.',
      'Vận dụng kiến thức vào nhiệm vụ cơ khí đúng kĩ thuật và bảo đảm an toàn.',
    ],
    application: lesson.application || [
      `Vẽ sơ đồ hoặc lập bảng tóm tắt các ý chính về ${topic}.`,
      `Phân tích một sản phẩm, thiết bị hoặc tình huống thực tế liên quan đến ${topic}.`,
    ],
    hide_visual_flow: hiddenVisualFlowLessons.has(lesson.id),
  }
}

const data = createKnttLmsData({
  theme: 'mechanical',
  gradeTitle: 'Công nghệ 11 - Công nghệ cơ khí',
  courseSpecs,
  lessonSpecs: lessonSpecs.map(enrichLessonContent),
  assessmentPrefix: 'kntt11',
  defaultTitle: 'Công nghệ cơ khí 11',
})

export const canhDieuCourses = data.courses
export const canhDieuLessons = data.lessons
export const canhDieuQuestions = data.questions
export const canhDieuActivities = data.activities
export const chapterAssessments = data.chapterAssessments
