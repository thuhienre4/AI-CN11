// End-of-year tests by chapter (Kết nối tri thức), one blueprint per grade.
// Structure from Công văn 7991/BGDĐT-GDTrH (17/12/2024): 7 points objective, 3 points essay; a subject that does not
// use short-answer items moves those 2 points to true/false. Level share Biết 40% – Hiểu 30% – Vận dụng 30% is the
// choice of the teacher who owns this blueprint, not a ministry rule.
// The sample tests were drafted with AI assistance and have not been reviewed by a subject group yet.

export const CHAPTER_EXAM = {
  minutes: 45,
  multipleChoicePoints: 0.25,
  trueFalsePoints: [0, 0.1, 0.25, 0.5, 1],
  essayPoints: 1.5,
}

export const BOOKS = {
  10: 'Thiết kế và công nghệ',
  11: 'Công nghệ cơ khí',
  12: 'Công nghệ điện – điện tử',
}

// tf: one pattern per true/false question (levels of statements a–d); essays: number of 1.5-point essays.
export const BLUEPRINTS = {
  10: [
    { code: 'I', title: 'Đại cương về công nghệ', lessons: [1, 7], mcB: 4, mcH: 0, tf: ['BBHH', 'BHHH'], essays: 0 },
    { code: 'II', title: 'Vẽ kĩ thuật', lessons: [8, 16], mcB: 4, mcH: 1, tf: ['BBHH'], essays: 1 },
    { code: 'III', title: 'Thiết kế kĩ thuật', lessons: [17, 22], mcB: 2, mcH: 1, tf: ['BHHH'], essays: 1 },
  ],
  11: [
    { code: 'I', title: 'Giới thiệu chung về cơ khí chế tạo', lessons: [1, 2], mcB: 1, mcH: 0, tf: [], essays: 0 },
    { code: 'II', title: 'Vật liệu cơ khí', lessons: [3, 6], mcB: 2, mcH: 0, tf: ['BBHH'], essays: 0 },
    { code: 'III', title: 'Các phương pháp gia công cơ khí', lessons: [7, 10], mcB: 2, mcH: 0, tf: ['BBHH'], essays: 0 },
    { code: 'IV', title: 'Sản xuất cơ khí', lessons: [11, 14], mcB: 2, mcH: 0, tf: ['BHHH'], essays: 0 },
    { code: 'V', title: 'Giới thiệu chung về cơ khí động lực', lessons: [15, 16], mcB: 1, mcH: 0, tf: [], essays: 0 },
    { code: 'VI', title: 'Động cơ đốt trong', lessons: [17, 20], mcB: 1, mcH: 1, tf: [], essays: 1 },
    { code: 'VII', title: 'Ô tô', lessons: [21, 25], mcB: 1, mcH: 1, tf: ['BHHH'], essays: 1 },
  ],
  12: [
    { code: 'I', title: 'Giới thiệu chung về kĩ thuật điện', lessons: [1, 2], mcB: 1, mcH: 0, tf: [], essays: 0 },
    { code: 'II', title: 'Hệ thống điện quốc gia', lessons: [3, 7], mcB: 1, mcH: 1, tf: ['BBHH'], essays: 0 },
    { code: 'III', title: 'Hệ thống điện trong gia đình', lessons: [8, 10], mcB: 1, mcH: 0, tf: [], essays: 1 },
    { code: 'IV', title: 'An toàn và tiết kiệm điện năng', lessons: [11, 12], mcB: 1, mcH: 0, tf: ['BBHH'], essays: 0 },
    { code: 'V', title: 'Giới thiệu chung về kĩ thuật điện tử', lessons: [13, 14], mcB: 1, mcH: 0, tf: [], essays: 0 },
    { code: 'VI', title: 'Linh kiện điện tử', lessons: [15, 17], mcB: 2, mcH: 0, tf: ['BHHH'], essays: 0 },
    { code: 'VII', title: 'Điện tử tương tự', lessons: [18, 20], mcB: 1, mcH: 0, tf: [], essays: 1 },
    { code: 'VIII', title: 'Điện tử số', lessons: [21, 23], mcB: 1, mcH: 1, tf: ['BHHH'], essays: 0 },
    { code: 'IX', title: 'Vi điều khiển', lessons: [24, 26], mcB: 1, mcH: 0, tf: [], essays: 0 },
  ],
}

// Points of one chapter, and how they split by level. A true/false statement is worth a quarter of its question.
export const chapterPoints = (chapter) => {
  const statements = chapter.tf.join('')
  const B = chapter.mcB * CHAPTER_EXAM.multipleChoicePoints + [...statements].filter((l) => l === 'B').length * 0.25
  const H = chapter.mcH * CHAPTER_EXAM.multipleChoicePoints + [...statements].filter((l) => l === 'H').length * 0.25
  const V = chapter.essays * CHAPTER_EXAM.essayPoints
  return { B, H, V, total: B + H + V }
}

export const blueprintSummary = (grade) => {
  const chapters = BLUEPRINTS[grade]
  const lessons = chapters.reduce((sum, c) => sum + c.lessons[1] - c.lessons[0] + 1, 0)
  const rows = chapters.map((chapter) => {
    const points = chapterPoints(chapter)
    const lessonCount = chapter.lessons[1] - chapter.lessons[0] + 1
    return { ...chapter, points, lessonShare: lessonCount / lessons, pointShare: points.total / 10, lessonCount }
  })
  const totals = rows.reduce((sum, row) => ({
    B: sum.B + row.points.B, H: sum.H + row.points.H, V: sum.V + row.points.V, total: sum.total + row.points.total,
    multipleChoice: sum.multipleChoice + row.mcB + row.mcH, trueFalse: sum.trueFalse + row.tf.length, essays: sum.essays + row.essays,
  }), { B: 0, H: 0, V: 0, total: 0, multipleChoice: 0, trueFalse: 0, essays: 0 })
  return { rows, totals, lessons }
}

// Multiple choice: [chapter, level, stem, [A, B, C, D], index of the correct option]
// True/false: [chapter, stem, [[statement, truth, level] × 4]]
// Essay: [chapter, prompt, [[criterion, points], ...]]
export const SAMPLE_EXAMS = {
  10: {
    multipleChoice: [
      ['I', 'B', 'Theo Luật Chuyển giao công nghệ, công nghệ là', ['hệ thống tri thức về các quy luật của tự nhiên và xã hội.', 'giải pháp, quy trình, bí quyết kĩ thuật có hoặc không kèm theo công cụ, phương tiện dùng để biến đổi nguồn lực thành sản phẩm.', 'tập hợp máy móc, thiết bị được lắp đặt trong nhà máy.', 'việc vận dụng kiến thức khoa học để thiết kế ra một sản phẩm cụ thể.'], 1],
      ['I', 'B', 'Một hệ thống kĩ thuật gồm các phần tử', ['nguồn điện, dây dẫn và phụ tải.', 'nguyên liệu, máy móc và công nhân.', 'đầu vào, bộ phận xử lí và đầu ra.', 'cảm biến, màn hình và bàn phím.'], 2],
      ['I', 'B', 'Công nghệ nào sau đây là công nghệ mới?', ['Công nghệ đúc.', 'Công nghệ hàn.', 'Công nghệ in 3D.', 'Công nghệ rèn.'], 2],
      ['I', 'B', 'Đặc trưng của cuộc cách mạng công nghiệp lần thứ nhất là', ['sử dụng máy hơi nước, cơ khí hóa sản xuất.', 'sử dụng điện năng và dây chuyền sản xuất hàng loạt.', 'sử dụng máy tính và tự động hóa sản xuất.', 'sử dụng trí tuệ nhân tạo và Internet vạn vật.'], 0],
      ['II', 'B', 'Khổ giấy A4 có kích thước là', ['420 mm × 297 mm.', '297 mm × 210 mm.', '594 mm × 420 mm.', '841 mm × 594 mm.'], 1],
      ['II', 'B', 'Theo phương pháp chiếu góc thứ nhất, hình chiếu bằng được đặt', ['phía trên hình chiếu đứng.', 'bên trái hình chiếu đứng.', 'bên phải hình chiếu đứng.', 'phía dưới hình chiếu đứng.'], 3],
      ['II', 'B', 'Khi biểu diễn ren ngoài nhìn thấy, đường chân ren được vẽ bằng', ['nét liền đậm.', 'nét liền mảnh.', 'nét đứt mảnh.', 'nét gạch chấm mảnh.'], 1],
      ['II', 'B', 'Hình chiếu phối cảnh được xây dựng bằng', ['phép chiếu xuyên tâm.', 'phép chiếu song song xiên góc.', 'phép chiếu vuông góc lên ba mặt phẳng.', 'phép chiếu trục đo vuông góc đều.'], 0],
      ['II', 'H', 'Điểm khác nhau giữa hình cắt và mặt cắt là', ['mặt cắt biểu diễn cả phần vật thể phía sau mặt phẳng cắt, còn hình cắt thì không.', 'hình cắt biểu diễn phần vật thể tiếp xúc với mặt phẳng cắt và các đường bao phía sau nó, còn mặt cắt chỉ biểu diễn phần tiếp xúc với mặt phẳng cắt.', 'hình cắt được vẽ bằng nét đứt, còn mặt cắt được vẽ bằng nét liền.', 'mặt cắt chỉ dùng trên bản vẽ xây dựng, hình cắt chỉ dùng trên bản vẽ cơ khí.'], 1],
      ['III', 'B', 'Công việc được thực hiện đầu tiên trong quy trình thiết kế kĩ thuật là', ['chế tạo nguyên mẫu.', 'thử nghiệm và đánh giá sản phẩm.', 'xác định vấn đề cần giải quyết.', 'lập hồ sơ kĩ thuật.'], 2],
      ['III', 'B', 'Phần mềm CAD được dùng trong thiết kế kĩ thuật để', ['tạo và chỉnh sửa bản vẽ, mô hình sản phẩm trên máy tính.', 'điều khiển trực tiếp máy công cụ gia công chi tiết.', 'lập kế hoạch tài chính cho dự án.', 'quản lí nhân sự của xưởng sản xuất.'], 0],
      ['III', 'H', 'Mục đích chính của việc chế tạo nguyên mẫu trong thiết kế kĩ thuật là', ['bán ngay cho khách hàng để thu hồi vốn.', 'thay thế cho hồ sơ kĩ thuật của sản phẩm.', 'xác định vấn đề cần giải quyết.', 'thử nghiệm, đánh giá xem giải pháp có đáp ứng các tiêu chí đã đặt ra hay không.'], 3],
    ],
    trueFalse: [
      ['I', 'Bàn là điện tự động có núm chỉnh nhiệt độ và rơ le nhiệt: khi mặt đế đủ nóng, rơ le ngắt điện; khi mặt đế nguội bớt, rơ le đóng điện lại.', [
        ['Đầu vào của hệ thống gồm điện năng và mức nhiệt độ được cài đặt.', true, 'B'],
        ['Đầu ra của hệ thống là nhiệt độ của mặt đế bàn là.', true, 'B'],
        ['Đây là hệ thống điều khiển kín vì có tín hiệu phản hồi về nhiệt độ để đóng, ngắt điện.', true, 'H'],
        ['Nếu bỏ rơ le nhiệt, bàn là vẫn tự giữ được nhiệt độ ổn định như cài đặt.', false, 'H']]],
      ['I', 'Một trường học đang cân nhắc lắp hệ thống điện mặt trời trên mái nhà.', [
        ['Khi đánh giá công nghệ, cần xem xét các tiêu chí như hiệu quả, độ tin cậy, kinh tế và môi trường.', true, 'B'],
        ['Chỉ cần so sánh giá mua ban đầu là đủ để kết luận có nên lắp hay không.', false, 'H'],
        ['So với điện từ nhiệt điện than, điện mặt trời góp phần giảm phát thải khí nhà kính.', true, 'H'],
        ['Công suất phát của các tấm pin mặt trời không phụ thuộc vào thời tiết.', false, 'H']]],
      ['II', 'Trên một bản vẽ chi tiết vẽ theo tỉ lệ 1 : 2 có ghi kí hiệu ren M20 × 1,5.', [
        ['Chữ M cho biết đây là ren hệ mét.', true, 'B'],
        ['Tỉ lệ 1 : 2 nghĩa là hình vẽ lớn gấp hai lần vật thật.', false, 'B'],
        ['Số 1,5 trong kí hiệu là bước ren, đơn vị mi-li-mét.', true, 'H'],
        ['Con số kích thước ghi trên bản vẽ này là kích thước đo được trên hình vẽ, chưa phải kích thước thật của chi tiết.', false, 'H']]],
      ['III', 'Một nhóm học sinh thiết kế giá đỡ điện thoại để bàn học.', [
        ['Nhóm cần xác định tiêu chí (kích thước điện thoại, góc nghiêng, độ vững) trước khi đề xuất giải pháp.', true, 'B'],
        ['Nếu nguyên mẫu bị đổ khi đặt điện thoại cỡ lớn, nhóm cần quay lại điều chỉnh giải pháp rồi thử lại.', true, 'H'],
        ['Sau khi chế tạo xong nguyên mẫu, nhóm có thể bỏ qua bước thử nghiệm nếu nguyên mẫu nhìn đẹp.', false, 'H'],
        ['Hồ sơ kĩ thuật của sản phẩm chỉ cần gồm ảnh chụp nguyên mẫu.', false, 'H']]],
    ],
    essays: [
      ['II', 'Một vật thể là khối hộp chữ nhật dài 60 mm, rộng 40 mm, cao 30 mm. Giữa mặt trên có một rãnh hình hộp rộng 20 mm, sâu 10 mm, chạy suốt chiều dài 60 mm. Vẽ ba hình chiếu vuông góc của vật thể theo phương pháp chiếu góc thứ nhất (hướng chiếu đứng nhìn vào mặt 60 × 30) và ghi các kích thước chính.', [
        ['Bố trí đúng theo góc thứ nhất: hình chiếu bằng dưới hình chiếu đứng, hình chiếu cạnh bên phải hình chiếu đứng', 0.25],
        ['Hình chiếu đứng: hình chữ nhật 60 × 30', 0.25],
        ['Hình chiếu đứng: đáy rãnh là đường nét đứt nằm ngang, cách đáy 20 mm', 0.25],
        ['Hình chiếu bằng: hình chữ nhật 60 × 40, hai cạnh rãnh là hai đường liền đậm song song chiều dài, cách hai mép 10 mm', 0.25],
        ['Hình chiếu cạnh: hình 40 × 30 có rãnh rộng 20, sâu 10 ở giữa cạnh trên', 0.25],
        ['Nét vẽ và ghi các kích thước 60, 40, 30, 20, 10 đúng tiêu chuẩn', 0.25]]],
      ['III', 'Em cần thiết kế một giá để sách đặt trên bàn học. Hãy: a) nêu vấn đề cần giải quyết và ít nhất ba tiêu chí của sản phẩm; b) đề xuất hai giải pháp, chọn một giải pháp và giải thích lí do; c) nêu cách thử nghiệm để kiểm tra sản phẩm đạt tiêu chí.', [
        ['a) Nêu được vấn đề (sách dễ đổ, chiếm chỗ trên bàn…)', 0.25],
        ['a) Ít nhất ba tiêu chí đo được: số sách giữ được, kích thước, vật liệu, chi phí, an toàn', 0.25],
        ['b) Hai giải pháp khác nhau (vật liệu hoặc kết cấu)', 0.25],
        ['b) Chọn một giải pháp và giải thích bằng các tiêu chí đã nêu', 0.25],
        ['c) Cách thử nghiệm gắn với từng tiêu chí', 0.25],
        ['c) Cách xử lí khi không đạt: điều chỉnh giải pháp rồi thử lại', 0.25]]],
    ],
  },
  11: {
    multipleChoice: [
      ['I', 'B', 'Sản phẩm của ngành cơ khí chế tạo là', ['điện năng và nhiệt năng.', 'phần mềm và dữ liệu số.', 'máy móc, thiết bị, chi tiết máy.', 'nông sản đã qua chế biến.'], 2],
      ['II', 'B', 'Tính chất nào sau đây là tính chất cơ học của vật liệu?', ['Độ bền.', 'Khối lượng riêng.', 'Tính chịu ăn mòn của axit.', 'Tính đúc.'], 0],
      ['II', 'B', 'Gang là hợp kim của sắt với cacbon, trong đó hàm lượng cacbon', ['nhỏ hơn 0,1%.', 'từ 0,5% đến 1%.', 'không quá 2,14%.', 'lớn hơn 2,14%.'], 3],
      ['III', 'B', 'Phương pháp gia công nào sau đây là gia công không phoi?', ['Tiện.', 'Đúc.', 'Phay.', 'Khoan.'], 1],
      ['III', 'B', 'Khi tiện, chuyển động cắt chính là', ['chuyển động quay tròn của phôi.', 'chuyển động tịnh tiến của dao.', 'chuyển động quay tròn của dao.', 'chuyển động tịnh tiến của phôi.'], 0],
      ['IV', 'B', 'Trong dây chuyền sản xuất tự động, robot công nghiệp thường đảm nhận công việc', ['lập kế hoạch kinh doanh của nhà máy.', 'đàm phán hợp đồng với khách hàng.', 'hàn, sơn, lắp ráp, vận chuyển phôi lặp lại nhiều lần.', 'tuyển dụng và đào tạo công nhân.'], 2],
      ['IV', 'B', 'Việc làm nào sau đây bảo đảm an toàn khi làm việc với máy cắt gọt kim loại?', ['Dùng tay gạt phoi khi máy đang chạy.', 'Đo kích thước chi tiết khi máy đang quay.', 'Tháo tấm che chắn để dễ quan sát.', 'Mặc quần áo gọn gàng và đeo kính bảo hộ.'], 3],
      ['V', 'B', 'Nhóm sản phẩm nào sau đây thuộc lĩnh vực cơ khí động lực?', ['Ô tô, tàu thủy, máy bay.', 'Máy tiện, máy phay, máy khoan.', 'Bàn, ghế, tủ gỗ.', 'Cầu, đường, nhà xưởng.'], 0],
      ['VI', 'B', 'Động cơ bốn kì hoàn thành một chu trình làm việc khi trục khuỷu quay', ['nửa vòng.', 'một vòng.', 'hai vòng.', 'bốn vòng.'], 2],
      ['VI', 'H', 'Trong kì nén của động cơ bốn kì,', ['pít tông đi từ ĐCD lên ĐCT, cả hai xu páp đều đóng.', 'pít tông đi từ ĐCT xuống ĐCD, xu páp nạp mở.', 'pít tông đi từ ĐCD lên ĐCT, xu páp thải mở.', 'pít tông đi từ ĐCT xuống ĐCD, cả hai xu páp đều đóng.'], 0],
      ['VII', 'B', 'Hệ thống truyền lực trên ô tô có nhiệm vụ', ['thay đổi hướng chuyển động của xe.', 'truyền và biến đổi mô men từ động cơ đến bánh xe chủ động.', 'giảm tốc độ và dừng xe.', 'giảm rung động từ mặt đường truyền lên thân xe.'], 1],
      ['VII', 'H', 'Hệ thống chống bó cứng phanh (ABS) giúp người lái', ['không cần đạp phanh khi gặp chướng ngại vật.', 'tăng công suất động cơ khi xe xuống dốc.', 'luôn dừng xe ở quãng đường ngắn nhất trên mọi mặt đường.', 'vẫn đánh lái được khi phanh gấp vì bánh xe không bị bó cứng.'], 3],
    ],
    trueFalse: [
      ['II', 'Về vật liệu cơ khí:', [
        ['Thép là hợp kim của sắt với cacbon, hàm lượng cacbon không quá 2,14%.', true, 'B'],
        ['Nhôm và hợp kim nhôm thuộc nhóm kim loại đen.', false, 'B'],
        ['Hợp kim nhôm được dùng làm vỏ máy bay vì nhẹ và có độ bền tương đối cao.', true, 'H'],
        ['Chất dẻo nhiệt rắn có thể nung nóng chảy để tái chế nhiều lần như chất dẻo nhiệt.', false, 'H']]],
      ['III', 'Một xưởng cần nối hai tấm thép bằng phương pháp hàn.', [
        ['Hàn là phương pháp nối các chi tiết kim loại bằng cách nung nóng chỗ nối đến trạng thái chảy, sau khi nguội tạo thành mối hàn.', true, 'B'],
        ['Hàn thuộc nhóm phương pháp gia công cắt gọt.', false, 'B'],
        ['Mối hàn có thể bị nứt hoặc làm chi tiết cong vênh do ứng suất nhiệt khi nguội.', true, 'H'],
        ['Chi tiết cần độ chính xác cao về kích thước có thể chế tạo hoàn chỉnh chỉ bằng hàn, không cần gia công lại.', false, 'H']]],
      ['IV', 'Một nhà máy cơ khí chuyển sang dây chuyền sản xuất tự động có robot.', [
        ['Tự động hóa giúp tăng năng suất và giữ chất lượng sản phẩm ổn định.', true, 'B'],
        ['Robot giúp giảm các công việc thủ công nặng nhọc, nguy hiểm cho người lao động.', true, 'H'],
        ['Dầu thải và phoi kim loại có thể đổ trực tiếp ra cống nếu số lượng ít.', false, 'H'],
        ['Người lao động trong nhà máy tự động hóa không cần học thêm kĩ năng mới.', false, 'H']]],
      ['VII', 'Về các hệ thống trên ô tô:', [
        ['Hệ thống phanh dùng để giảm tốc độ, dừng xe và giữ xe đứng yên.', true, 'B'],
        ['Áp suất lốp thấp hơn quy định làm tăng lực cản lăn và làm xe tốn nhiên liệu hơn.', true, 'H'],
        ['Hệ thống treo nối khung xe với bánh xe và giảm dao động truyền lên thân xe.', true, 'H'],
        ['Trên đường trơn trượt, xe không có ABS nên phanh gấp, đạp hết hành trình để dừng nhanh nhất.', false, 'H']]],
    ],
    essays: [
      ['VI', 'a) Trình bày hướng chuyển động của pít tông và trạng thái của xu páp nạp, xu páp thải trong bốn kì của động cơ xăng bốn kì. b) Một động cơ có bán kính quay của trục khuỷu R = 40 mm, thể tích buồng cháy 0,05 lít và thể tích công tác 0,45 lít. Tính hành trình pít tông và tỉ số nén của động cơ.', [
        ['Kì nạp: pít tông đi từ ĐCT xuống ĐCD; xu páp nạp mở, xu páp thải đóng', 0.25],
        ['Kì nén: pít tông đi từ ĐCD lên ĐCT; hai xu páp đóng; cuối kì bu gi bật tia lửa điện', 0.25],
        ['Kì nổ: pít tông bị đẩy từ ĐCT xuống ĐCD; hai xu páp đóng; đây là kì sinh công', 0.25],
        ['Kì thải: pít tông đi từ ĐCD lên ĐCT; xu páp nạp đóng, xu páp thải mở', 0.25],
        ['b) S = 2R = 2 × 40 = 80 mm', 0.25],
        ['b) Thể tích toàn phần = 0,05 + 0,45 = 0,5 lít; tỉ số nén ε = 0,5 : 0,05 = 10', 0.25]]],
      ['VII', 'Một xe khách xuống đèo dài. Tài xế giữ số cao và đạp phanh liên tục; gần cuối đèo, phanh kém hiệu quả rõ rệt. Hãy giải thích nguyên nhân và đề xuất cách lái xe xuống đèo an toàn hơn.', [
        ['Phanh liên tục làm má phanh và tang trống (hoặc đĩa phanh) nóng lên rất cao', 0.25],
        ['Khi quá nóng, hệ số ma sát giảm nên lực phanh giảm', 0.25],
        ['Giữ số cao nên động cơ gần như không hãm xe, việc giảm tốc dồn lên hệ thống phanh', 0.25],
        ['Về số thấp trước khi xuống đèo để dùng phanh động cơ', 0.25],
        ['Phanh ngắt quãng, giữ tốc độ thấp, không đạp phanh liên tục', 0.25],
        ['Kiểm tra hệ thống phanh trước chuyến đi, dừng nghỉ cho phanh nguội khi cần', 0.25]]],
    ],
  },
  12: {
    multipleChoice: [
      ['I', 'B', 'Kĩ thuật điện là lĩnh vực', ['nghiên cứu cấu tạo vật chất ở cấp độ nguyên tử.', 'nghiên cứu, ứng dụng các hiện tượng điện, từ để sản xuất, truyền tải, phân phối và sử dụng điện năng.', 'viết phần mềm ứng dụng cho máy tính.', 'chế biến và bảo quản nông sản.'], 1],
      ['II', 'B', 'Mạch điện xoay chiều ba pha gồm', ['nguồn điện ba pha, đường dây ba pha và tải ba pha.', 'một nguồn một pha và ba tải mắc song song.', 'ba nguồn một chiều mắc nối tiếp.', 'máy biến áp và một tải một pha.'], 0],
      ['II', 'H', 'Tải ba pha đối xứng nối hình sao có điện áp pha 220 V. Điện áp dây xấp xỉ bằng', ['127 V.', '220 V.', '380 V.', '660 V.'], 2],
      ['III', 'B', 'Thiết bị nào dùng để tự động ngắt mạch điện gia đình khi xảy ra ngắn mạch hoặc quá tải?', ['Công tắc.', 'Ổ cắm.', 'Công tơ điện.', 'Aptomat (cầu dao tự động).'], 3],
      ['IV', 'B', 'Khi phát hiện người bị điện giật, việc cần làm đầu tiên là', ['nhanh chóng cắt nguồn điện.', 'dùng tay kéo người bị nạn ra.', 'dội nước vào người bị nạn.', 'chờ người khác đến rồi mới xử lí.'], 0],
      ['V', 'B', 'Thiết bị nào sau đây là sản phẩm tiêu biểu của kĩ thuật điện tử?', ['Dây dẫn điện.', 'Điện thoại thông minh.', 'Cầu dao.', 'Cột điện cao thế.'], 1],
      ['VI', 'B', 'Điện trở có các vòng màu theo thứ tự nâu – đen – đỏ – vàng kim có trị số', ['102 Ω.', '100 Ω.', '1 kΩ.', '10 kΩ.'], 2],
      ['VI', 'B', 'Diode bán dẫn có tính chất', ['cho dòng điện đi qua theo hai chiều như nhau.', 'tích trữ năng lượng dưới dạng điện trường.', 'chỉ cho dòng điện đi qua theo một chiều.', 'khuếch đại dòng điện.'], 2],
      ['VII', 'B', 'Khuếch đại thuật toán (op-amp) có', ['một đầu vào và một đầu ra.', 'một đầu vào và hai đầu ra.', 'ba đầu vào và một đầu ra.', 'hai đầu vào (đảo, không đảo) và một đầu ra.'], 3],
      ['VIII', 'B', 'Tín hiệu số là tín hiệu', ['có giá trị rời rạc, thường biểu diễn bằng hai mức logic 0 và 1.', 'biến thiên liên tục theo thời gian.', 'luôn có dạng hình sin.', 'chỉ có giá trị âm.'], 0],
      ['VIII', 'H', 'Cổng NAND hai đầu vào có A = 1, B = 0. Đầu ra Y của cổng là', ['Y = 0.', 'Y = 1.', 'Y bằng 1 chỉ khi B chuyển lên 1.', 'Y không phụ thuộc vào A và B.'], 1],
      ['IX', 'B', 'Vi điều khiển là', ['linh kiện chỉ dùng để khuếch đại tín hiệu tương tự.', 'cảm biến đo nhiệt độ môi trường.', 'mạch tích hợp gồm bộ xử lí, bộ nhớ và các cổng vào/ra trên một chip, có thể lập trình.', 'nguồn cấp điện một chiều cho mạch điện tử.'], 2],
    ],
    trueFalse: [
      ['II', 'Về hệ thống điện quốc gia và mạch ba pha:', [
        ['Hệ thống điện quốc gia gồm nguồn điện, lưới điện và các hộ tiêu thụ điện.', true, 'B'],
        ['Lưới truyền tải đi xa dùng điện áp thấp để giảm tổn thất điện năng.', false, 'B'],
        ['Với cùng công suất truyền tải, tăng điện áp lên hai lần thì tổn hao công suất trên đường dây giảm khoảng bốn lần.', true, 'H'],
        ['Khi tải ba pha nối hình tam giác, điện áp đặt lên mỗi pha tải bằng điện áp pha của nguồn nối hình sao.', false, 'H']]],
      ['IV', 'Về an toàn và tiết kiệm điện năng:', [
        ['Nối đất vỏ kim loại của thiết bị là biện pháp chống điện giật khi vỏ bị rò điện.', true, 'B'],
        ['Có thể dùng tay ướt cắm phích điện vì điện áp sinh hoạt chỉ là 220 V.', false, 'B'],
        ['Thay bóng đèn sợi đốt bằng đèn LED có cùng độ sáng giúp tiết kiệm điện vì đèn LED có hiệu suất phát sáng cao hơn.', true, 'H'],
        ['Thiết bị chống dòng rò chỉ tác động khi xảy ra ngắn mạch giữa dây pha và dây trung tính.', false, 'H']]],
      ['VI', 'Về linh kiện điện tử:', [
        ['Tụ điện ngăn dòng điện một chiều và cho dòng điện xoay chiều đi qua.', true, 'B'],
        ['Điện trở 4,7 kΩ có trị số 4 700 Ω.', true, 'H'],
        ['Transistor có thể làm việc như một khóa điện tử đóng, cắt mạch.', true, 'H'],
        ['Cảm kháng của cuộn cảm giảm khi tần số dòng điện tăng.', false, 'H']]],
      ['VIII', 'Một mạch báo cháy có cảm biến khói S1 và cảm biến nhiệt S2 (mức 1 khi phát hiện khói hoặc nhiệt cao). Còi báo Y được điều khiển bằng cổng OR: Y = S1 + S2.', [
        ['Cổng OR cho đầu ra bằng 1 khi ít nhất một đầu vào bằng 1.', true, 'B'],
        ['Khi chỉ có khói (S1 = 1, S2 = 0), còi kêu.', true, 'H'],
        ['Khi không có khói và không có nhiệt cao (S1 = S2 = 0), còi kêu.', false, 'H'],
        ['Nếu thay cổng OR bằng cổng AND, còi chỉ kêu khi có đồng thời cả khói và nhiệt cao.', true, 'H']]],
    ],
    essays: [
      ['III', 'Cầu thang nhà em cần một bóng đèn bật, tắt được ở cả chân và đầu cầu thang. Hãy vẽ sơ đồ nguyên lí mạch điện dùng hai công tắc ba cực, có aptomat bảo vệ, và giải thích vì sao bật hoặc tắt ở vị trí nào cũng được.', [
        ['Aptomat đặt ở đầu mạch, trên dây pha', 0.25],
        ['Dây pha nối vào cực chung của công tắc K1; hai cực còn lại của K1 nối với hai cực tương ứng của K2 bằng hai dây', 0.25],
        ['Cực chung của K2 nối đến đèn, đầu còn lại của đèn nối dây trung tính', 0.25],
        ['Đèn sáng khi hai công tắc cùng nối vào một dây liên lạc, tắt khi nối vào hai dây khác nhau', 0.5],
        ['Gạt bất kì công tắc nào cũng đổi trạng thái đèn; công tắc đặt trên dây pha để khi tắt đèn không còn điện', 0.25]]],
      ['VII', 'Một mạch khuếch đại đảo dùng op-amp có điện trở vào R1 = 10 kΩ, điện trở hồi tiếp Rht = 47 kΩ, điện áp vào Uv = 0,2 V. a) Tính hệ số khuếch đại điện áp và điện áp ra. b) Giải thích ý nghĩa dấu của kết quả. c) Muốn hệ số khuếch đại có độ lớn bằng 10 mà giữ nguyên R1 thì phải chọn Rht bằng bao nhiêu?', [
        ['a) K = −Rht/R1 = −47/10 = −4,7', 0.5],
        ['a) Ur = K × Uv = −4,7 × 0,2 = −0,94 V', 0.25],
        ['b) Dấu âm cho biết điện áp ra ngược dấu (ngược pha) với điện áp vào', 0.25],
        ['c) Độ lớn hệ số khuếch đại Rht/R1 = 10 nên Rht = 10 × 10 kΩ = 100 kΩ', 0.5]]],
    ],
  },
}

const chapterOfLesson = (grade, lesson) => BLUEPRINTS[grade].find((c) => lesson >= c.lessons[0] && lesson <= c.lessons[1])?.code

const toChoice = ([chapter, level, text, options, answer], grade, index, source = 'sample') => ({
  key: `${grade}-${source}-mc-${index}`, chapter, level, text, options, correct: options[answer], source,
})
const toTrueFalse = ([chapter, stem, items], grade, index) => ({
  key: `${grade}-tf-${index}`, chapter, stem, items: items.map(([text, truth, level]) => ({ text, truth, level })),
})
const toEssay = ([chapter, prompt, rubric], grade, index) => ({
  key: `${grade}-essay-${index}`, chapter, prompt, rubric: rubric.map(([text, points]) => ({ text, points })),
  points: rubric.reduce((sum, [, points]) => sum + points, 0),
})

export const sampleExam = (grade) => {
  const exam = SAMPLE_EXAMS[grade]
  return {
    grade,
    source: 'sample',
    multipleChoice: exam.multipleChoice.map((item, index) => toChoice(item, grade, index)),
    trueFalse: exam.trueFalse.map((item, index) => toTrueFalse(item, grade, index)),
    essays: exam.essays.map((item, index) => toEssay(item, grade, index)),
  }
}

const seededRandom = (seed) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}
const shuffled = (items, random) => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}

// Part I drawn from the lesson question bank, chapter by chapter and level by level as the blueprint asks.
// A chapter whose bank has too few questions of a level keeps the sample question, so the blueprint always holds.
// Parts II and III stay those of the sample test: the bank has one true/false cluster per chapter and no essays yet.
export const bankExam = (grade, bankQuestions, seed = Date.now()) => {
  const random = seededRandom(seed)
  const sample = sampleExam(grade)
  const multipleChoice = []
  for (const chapter of BLUEPRINTS[grade]) {
    for (const [level, count] of [['B', chapter.mcB], ['H', chapter.mcH]]) {
      if (!count) continue
      const pool = shuffled(bankQuestions.filter((q) => q.grade === grade && q.level === level
        && chapterOfLesson(grade, q.lesson) === chapter.code), random)
      const fallback = sample.multipleChoice.filter((q) => q.chapter === chapter.code && q.level === level)
      for (let index = 0; index < count; index += 1) {
        const q = pool[index]
        multipleChoice.push(q
          ? { key: `${grade}-bank-${q.key}`, chapter: chapter.code, level, text: q.text,
            options: shuffled([q.correct, ...q.distractors], random), correct: q.correct, source: 'bank', explanation: q.explanation }
          : fallback[index])
      }
    }
  }
  return { ...sample, source: 'bank', seed, multipleChoice }
}

export const scoreChapterExam = (exam, answers) => {
  const multipleChoiceRight = exam.multipleChoice.filter((item) => answers.choice?.[item.key] === item.correct).length
  const trueFalseRight = exam.trueFalse.map((cluster) =>
    cluster.items.filter((statement, index) => answers.truth?.[cluster.key]?.[index] === statement.truth).length)
  const objective = multipleChoiceRight * CHAPTER_EXAM.multipleChoicePoints
    + trueFalseRight.reduce((sum, right) => sum + CHAPTER_EXAM.trueFalsePoints[right], 0)
  return { multipleChoiceRight, trueFalseRight, objective: Math.round(objective * 100) / 100 }
}
