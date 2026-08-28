const mc = (text, options, correctIndex, explanation) => ({
  text,
  question_type: 'multiple_choice',
  options,
  correctIndex,
  explanation,
})

const tf = (text, correctBoolean, explanation) => ({
  text,
  question_type: 'true_false',
  correctBoolean,
  explanation,
})

const multi = (text, options, correctIndexes, explanation) => ({
  text,
  question_type: 'multi_select',
  options,
  correctIndexes,
  explanation,
})

const match = (text, pairs, explanation) => ({
  text,
  question_type: 'matching',
  pairs,
  explanation,
})

export const grade11AssessmentBank = {
  1: [
    mc(
      'Trình tự nào phản ánh hợp lí nhất quá trình chế tạo một sản phẩm cơ khí?',
      [
        'Kiểm tra → gia công → thiết kế → chọn vật liệu',
        'Yêu cầu → thiết kế → chọn vật liệu → gia công → lắp ráp → kiểm tra',
        'Chọn vật liệu → bán sản phẩm → thiết kế → gia công',
        'Gia công → xác định yêu cầu → lắp ráp → thiết kế',
      ],
      1,
      'Chế tạo cơ khí bắt đầu từ yêu cầu, sau đó thiết kế, chọn vật liệu, gia công, lắp ráp và kiểm tra.'
    ),
    tf(
      'Người làm nghề cơ khí chế tạo chỉ cần vận hành máy, không cần đọc bản vẽ và đo kiểm.',
      false,
      'Đọc bản vẽ, hiểu vật liệu, quy trình, đo kiểm và an toàn đều là năng lực quan trọng.'
    ),
    multi(
      'Chọn các yêu cầu quan trọng của cơ khí chế tạo.',
      ['Độ chính xác', 'An toàn', 'Năng suất', 'Bỏ qua khả năng bảo trì'],
      [0, 1, 2],
      'Sản xuất cơ khí cần bảo đảm độ chính xác, an toàn, năng suất và khả năng bảo trì.'
    ),
    match(
      'Ghép hoạt động với nhiệm vụ phù hợp trong cơ khí chế tạo.',
      [
        { term: 'Thiết kế', answer: 'Xác định hình dạng, kích thước và yêu cầu kĩ thuật' },
        { term: 'Gia công', answer: 'Tạo hình và hoàn thiện chi tiết' },
        { term: 'Đo kiểm', answer: 'So sánh sản phẩm với yêu cầu kĩ thuật' },
      ],
      'Ba hoạt động phối hợp để tạo sản phẩm cơ khí đạt yêu cầu.'
    ),
  ],
  2: [
    mc(
      'Khi chọn vật liệu làm một chi tiết chịu tải và làm việc ở nhiệt độ cao, cần ưu tiên căn cứ nào?',
      [
        'Chỉ màu sắc của vật liệu',
        'Cơ tính, nhiệt độ làm việc, khả năng gia công và chi phí',
        'Chỉ khối lượng riêng',
        'Vật liệu nào có sẵn cũng dùng được',
      ],
      1,
      'Lựa chọn vật liệu phải dựa trên điều kiện làm việc và nhiều nhóm tính chất liên quan.'
    ),
    tf(
      'Composite có thể kết hợp ưu điểm của nhiều thành phần để tạo vật liệu nhẹ và bền.',
      true,
      'Composite được tạo từ các thành phần khác nhau nhằm đạt tổ hợp tính chất mong muốn.'
    ),
    multi(
      'Những yếu tố nào cần xem xét khi sử dụng vật liệu mới?',
      ['Chi phí', 'Quy trình chế tạo', 'An toàn sử dụng', 'Chỉ mức độ nổi tiếng'],
      [0, 1, 2],
      'Vật liệu mới cần được đánh giá về chi phí, khả năng chế tạo, an toàn và hiệu quả.'
    ),
    match(
      'Ghép nhóm vật liệu với ứng dụng hoặc đặc điểm phù hợp.',
      [
        { term: 'Thép', answer: 'Thường dùng cho chi tiết cần độ bền và độ cứng' },
        { term: 'Cao su', answer: 'Phù hợp làm chi tiết đàn hồi và giảm chấn' },
        { term: 'Composite', answer: 'Có thể tạo kết cấu nhẹ nhưng độ bền cao' },
      ],
      'Mỗi nhóm vật liệu có tính chất và phạm vi sử dụng khác nhau.'
    ),
  ],
  3: [
    mc(
      'Mục đích chính của gia công cơ khí là gì?',
      [
        'Chỉ làm thay đổi màu của phôi',
        'Làm thay đổi hình dạng, kích thước, bề mặt hoặc tính chất của phôi',
        'Chỉ đóng gói sản phẩm',
        'Chỉ kiểm tra bản vẽ',
      ],
      1,
      'Gia công biến phôi thành chi tiết có hình dạng, kích thước và chất lượng theo yêu cầu.'
    ),
    tf(
      'Quy trình công nghệ hợp lí giúp giảm sai lỗi, tiết kiệm chi phí và đạt yêu cầu kĩ thuật.',
      true,
      'Trình tự nguyên công, máy, dao, đồ gá và chế độ gia công ảnh hưởng trực tiếp đến kết quả.'
    ),
    multi(
      'Chọn các căn cứ để lựa chọn phương pháp gia công.',
      ['Vật liệu', 'Hình dạng và độ chính xác', 'Sản lượng và chi phí', 'Sở thích tùy ý của người vận hành'],
      [0, 1, 2],
      'Phương pháp gia công phải phù hợp vật liệu, hình dạng, độ chính xác, sản lượng và chi phí.'
    ),
    match(
      'Ghép phương pháp gia công với mô tả phù hợp.',
      [
        { term: 'Tiện', answer: 'Phôi quay, dao thực hiện chuyển động cắt' },
        { term: 'Khoan', answer: 'Tạo hoặc mở rộng lỗ trên chi tiết' },
        { term: 'In 3D', answer: 'Tạo sản phẩm theo từng lớp từ mô hình số' },
      ],
      'Nhận biết nguyên lí giúp lựa chọn đúng phương pháp gia công.'
    ),
  ],
  4: [
    mc(
      'Thành phần nào giúp dây chuyền tự động nhận biết trạng thái của quá trình?',
      ['Cảm biến', 'Bao bì sản phẩm', 'Sổ quảng cáo', 'Giá bán'],
      0,
      'Cảm biến thu nhận thông tin để bộ điều khiển giám sát và ra lệnh.'
    ),
    tf(
      'Khóa nguồn trước khi bảo trì là một biện pháp hạn chế nguy cơ máy khởi động ngoài ý muốn.',
      true,
      'Cô lập và khóa nguồn là bước an toàn quan trọng khi bảo trì thiết bị.'
    ),
    multi(
      'Nhà máy thông minh có thể mang lại những lợi ích nào?',
      ['Giám sát thời gian thực', 'Giảm lỗi', 'Dự báo bảo trì', 'Loại bỏ mọi yêu cầu an toàn'],
      [0, 1, 2],
      'Dữ liệu và kết nối hỗ trợ giám sát, tối ưu, giảm lỗi và dự báo bảo trì.'
    ),
    match(
      'Ghép thành phần của dây chuyền tự động với chức năng.',
      [
        { term: 'Cảm biến', answer: 'Thu nhận trạng thái của quá trình' },
        { term: 'Bộ điều khiển', answer: 'Xử lí dữ liệu và phát lệnh' },
        { term: 'Robot', answer: 'Thực hiện thao tác theo chương trình' },
      ],
      'Dây chuyền tự động hoạt động nhờ sự phối hợp giữa cảm biến, điều khiển và cơ cấu chấp hành.'
    ),
  ],
  5: [
    mc(
      'Đối tượng tiêu biểu của lĩnh vực cơ khí động lực là',
      [
        'động cơ, hệ truyền lực và máy công tác.',
        'sách, báo và thiết bị văn phòng.',
        'cây trồng và vật nuôi.',
        'vật dụng trang trí thủ công.',
      ],
      0,
      'Cơ khí động lực tập trung vào máy tạo, truyền và sử dụng công suất cơ học.'
    ),
    tf(
      'Xu hướng xe điện và chẩn đoán điện tử làm giảm nhu cầu học năng lực số trong nghề cơ khí động lực.',
      false,
      'Công nghệ mới khiến năng lực số và chẩn đoán điện tử ngày càng quan trọng.'
    ),
    multi(
      'Chọn các yêu cầu quan trọng đối với sản phẩm cơ khí động lực.',
      ['Hiệu quả', 'An toàn', 'Giảm phát thải', 'Tăng tiêu hao nhiên liệu'],
      [0, 1, 2],
      'Hiệu quả, an toàn, tiết kiệm nhiên liệu và giảm phát thải là các yêu cầu cốt lõi.'
    ),
    match(
      'Ghép công việc với năng lực phù hợp.',
      [
        { term: 'Chẩn đoán', answer: 'Đọc dấu hiệu và dùng thiết bị đo để xác định hư hỏng' },
        { term: 'Bảo dưỡng', answer: 'Kiểm tra và chăm sóc thiết bị theo định kì' },
        { term: 'Kiểm định', answer: 'Đánh giá phương tiện theo tiêu chuẩn an toàn' },
      ],
      'Mỗi vị trí nghề nghiệp đòi hỏi nhiệm vụ và năng lực chuyên môn tương ứng.'
    ),
  ],
  6: [
    mc(
      'Trong động cơ bốn kì, kì nào trực tiếp tạo công cơ học?',
      ['Kì nạp', 'Kì nén', 'Kì cháy - giãn nở', 'Kì thải'],
      2,
      'Khí cháy giãn nở đẩy piston trong kì cháy - giãn nở, tạo công cho động cơ.'
    ),
    tf(
      'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của piston thành chuyển động quay.',
      true,
      'Đây là nhiệm vụ chính của cơ cấu trục khuỷu - thanh truyền.'
    ),
    multi(
      'Chọn các hệ thống hỗ trợ động cơ đốt trong làm việc ổn định.',
      ['Hệ thống nhiên liệu', 'Hệ thống bôi trơn', 'Hệ thống làm mát', 'Hệ thống trang trí thân xe'],
      [0, 1, 2],
      'Nhiên liệu, bôi trơn và làm mát trực tiếp bảo đảm điều kiện làm việc của động cơ.'
    ),
    match(
      'Ghép kì làm việc với trạng thái chính của động cơ bốn kì.',
      [
        { term: 'Nạp', answer: 'Xupap nạp mở, piston đi xuống' },
        { term: 'Nén', answer: 'Hai xupap đóng, piston đi lên' },
        { term: 'Thải', answer: 'Xupap thải mở, piston đi lên' },
      ],
      'Chuyển động piston và trạng thái xupap xác định nhiệm vụ của từng kì.'
    ),
  ],
  7: [
    mc(
      'Nhiệm vụ chính của hệ thống truyền lực trên ô tô là',
      [
        'truyền mô men từ động cơ đến bánh xe chủ động.',
        'làm mát khoang hành khách.',
        'chiếu sáng đường đi.',
        'giảm tiếng ồn của còi.',
      ],
      0,
      'Hệ thống truyền lực truyền và biến đổi mô men để đưa công suất đến bánh xe chủ động.'
    ),
    tf(
      'Áp suất lốp và tình trạng giảm xóc không ảnh hưởng đến khả năng bám đường của ô tô.',
      false,
      'Lốp và giảm xóc ảnh hưởng trực tiếp đến tiếp xúc bánh xe với mặt đường và độ an toàn.'
    ),
    multi(
      'Chọn các hệ thống trực tiếp góp phần điều khiển và bảo đảm an toàn chuyển động.',
      ['Hệ thống lái', 'Hệ thống phanh', 'Hệ thống treo', 'Hệ thống giải trí'],
      [0, 1, 2],
      'Lái, phanh và treo có vai trò trực tiếp đối với hướng chuyển động, dừng xe và độ bám đường.'
    ),
    match(
      'Ghép hệ thống ô tô với nhiệm vụ.',
      [
        { term: 'Hệ thống lái', answer: 'Thay đổi hướng chuyển động của xe' },
        { term: 'Hệ thống phanh', answer: 'Giảm tốc, dừng và giữ xe đứng yên' },
        { term: 'Hệ thống treo', answer: 'Giảm dao động và duy trì độ bám đường' },
      ],
      'Các hệ thống phối hợp để xe chuyển động ổn định và an toàn.'
    ),
  ],
}

export const grade12AssessmentBank = {
  1: [
    mc(
      'Kĩ thuật điện bao gồm nhóm hoạt động nào?',
      [
        'Thiết kế, sản xuất, truyền tải, phân phối và sử dụng điện năng',
        'Chỉ sửa chữa đồ dùng điện gia đình',
        'Chỉ sản xuất pin',
        'Chỉ ghi số điện tiêu thụ',
      ],
      0,
      'Kĩ thuật điện bao quát toàn bộ chuỗi tạo ra, truyền tải, phân phối và sử dụng điện năng.'
    ),
    tf(
      'Người làm nghề điện cần đọc sơ đồ, đo kiểm và tuân thủ quy trình an toàn.',
      true,
      'Đây là những năng lực nền tảng trong thiết kế, lắp đặt, vận hành và bảo trì điện.'
    ),
    multi(
      'Chọn các xu hướng phát triển của kĩ thuật điện.',
      ['Năng lượng tái tạo', 'Lưới điện thông minh', 'Tự động hóa', 'Loại bỏ thiết bị bảo vệ'],
      [0, 1, 2],
      'Kĩ thuật điện phát triển theo hướng xanh, thông minh, tự động và số hóa.'
    ),
    match(
      'Ghép vị trí nghề điện với nhiệm vụ phù hợp.',
      [
        { term: 'Thiết kế', answer: 'Tính toán và lập sơ đồ hệ thống điện' },
        { term: 'Vận hành', answer: 'Theo dõi và điều khiển thiết bị khi làm việc' },
        { term: 'Bảo trì', answer: 'Kiểm tra, phòng ngừa và khắc phục hư hỏng' },
      ],
      'Mỗi nhóm nghề tham gia một giai đoạn khác nhau của vòng đời hệ thống điện.'
    ),
  ],
  2: [
    mc(
      'Vì sao truyền tải điện năng đi xa thường sử dụng điện áp cao?',
      ['Để tăng tổn thất', 'Để giảm tổn thất công suất trên đường dây', 'Để bỏ thiết bị bảo vệ', 'Để mọi tải dùng trực tiếp'],
      1,
      'Nâng điện áp giúp giảm dòng điện với cùng công suất, từ đó giảm tổn thất trên đường dây.'
    ),
    tf(
      'Mạch điện ba pha được dùng phổ biến trong sản xuất và truyền tải điện năng.',
      true,
      'Hệ ba pha có nhiều ưu điểm về truyền tải công suất và vận hành động cơ.'
    ),
    multi(
      'Chọn các bộ phận của hệ thống điện quốc gia.',
      ['Nguồn điện', 'Lưới truyền tải và phân phối', 'Phụ tải', 'Bộ phận trang trí'],
      [0, 1, 2],
      'Nguồn, lưới điện, phụ tải cùng hệ thống điều khiển - bảo vệ tạo thành hệ thống điện quốc gia.'
    ),
    match(
      'Ghép loại công trình điện với chức năng.',
      [
        { term: 'Nhà máy điện', answer: 'Biến đổi năng lượng sơ cấp thành điện năng' },
        { term: 'Lưới truyền tải', answer: 'Đưa công suất điện đi xa' },
        { term: 'Lưới phân phối', answer: 'Cấp điện đến khu vực và người sử dụng' },
      ],
      'Dòng năng lượng đi từ nguồn qua truyền tải, phân phối rồi đến phụ tải.'
    ),
  ],
  3: [
    mc(
      'Thiết bị nào có nhiệm vụ tự động ngắt mạch khi quá tải hoặc ngắn mạch?',
      ['Aptomat', 'Ổ cắm', 'Bóng đèn', 'Công tơ'],
      0,
      'Aptomat là thiết bị đóng cắt và bảo vệ mạch điện khi xuất hiện sự cố.'
    ),
    tf(
      'Sơ đồ nguyên lí thể hiện quan hệ điện giữa các phần tử, còn sơ đồ lắp đặt thể hiện vị trí và cách đi dây.',
      true,
      'Hai loại sơ đồ phục vụ các mục đích đọc, thiết kế và thi công khác nhau.'
    ),
    multi(
      'Khi lựa chọn thiết bị điện gia đình cần căn cứ vào những yếu tố nào?',
      ['Điện áp và dòng điện định mức', 'Công suất tải', 'Môi trường sử dụng', 'Chỉ màu vỏ thiết bị'],
      [0, 1, 2],
      'Thiết bị phải phù hợp thông số điện, tải và điều kiện môi trường.'
    ),
    match(
      'Ghép thiết bị với chức năng trong mạng điện gia đình.',
      [
        { term: 'Công tơ', answer: 'Đo điện năng tiêu thụ' },
        { term: 'Công tắc', answer: 'Điều khiển đóng hoặc cắt mạch' },
        { term: 'Thiết bị chống rò', answer: 'Giảm nguy cơ điện giật do dòng rò' },
      ],
      'Hiểu chức năng giúp lựa chọn và bố trí thiết bị đúng mục đích.'
    ),
  ],
  4: [
    mc(
      'Việc đầu tiên cần làm khi phát hiện người bị điện giật là',
      [
        'chạm trực tiếp để kéo nạn nhân ra.',
        'nhanh chóng tách nguồn điện bằng biện pháp an toàn.',
        'dội nước vào khu vực xảy ra sự cố.',
        'để nạn nhân tự thoát khỏi nguồn điện.',
      ],
      1,
      'Phải tách nguồn an toàn trước khi tiếp cận để tránh người cứu tiếp tục bị điện giật.'
    ),
    tf(
      'Tắt thiết bị khi không sử dụng vừa giảm chi phí vừa góp phần giảm tải cho hệ thống điện.',
      true,
      'Sử dụng đúng nhu cầu là biện pháp tiết kiệm điện đơn giản và hiệu quả.'
    ),
    multi(
      'Chọn các biện pháp phòng tránh tai nạn điện.',
      ['Nối đất bảo vệ', 'Dùng thiết bị chống rò', 'Ngắt nguồn trước khi sửa chữa', 'Thay cầu chì bằng dây đồng tùy ý'],
      [0, 1, 2],
      'Nối đất, chống rò và cô lập nguồn đều giảm nguy cơ; thay sai thiết bị bảo vệ rất nguy hiểm.'
    ),
    match(
      'Ghép nguy cơ điện với biện pháp phù hợp.',
      [
        { term: 'Quá tải', answer: 'Dùng thiết bị bảo vệ và dây dẫn đúng định mức' },
        { term: 'Rò điện ra vỏ', answer: 'Nối đất và dùng thiết bị chống rò' },
        { term: 'Sửa chữa mạch', answer: 'Ngắt, kiểm tra và khóa nguồn trước khi thao tác' },
      ],
      'Biện pháp bảo vệ phải phù hợp với từng dạng nguy cơ.'
    ),
  ],
  5: [
    mc(
      'Hệ thống điện tử thường xử lí đại lượng nào là chủ yếu?',
      ['Tín hiệu điện', 'Nhiên liệu lỏng', 'Phôi kim loại', 'Đất trồng'],
      0,
      'Kĩ thuật điện tử thu nhận, xử lí và tạo ra các tín hiệu phục vụ điều khiển, truyền thông và hiển thị.'
    ),
    tf(
      'Dịch vụ điện tử hiện đại có liên quan đến IoT, thiết bị thông minh và bảo mật dữ liệu.',
      true,
      'Kết nối thiết bị làm tăng vai trò của phần mềm, mạng và bảo mật.'
    ),
    multi(
      'Chọn các năng lực cần thiết trong nghề điện tử.',
      ['Đọc sơ đồ', 'Nhận biết linh kiện', 'Đo và phân tích tín hiệu', 'Bỏ qua quy trình tìm lỗi'],
      [0, 1, 2],
      'Người làm nghề điện tử cần đọc mạch, hiểu linh kiện, đo kiểm và xử lí lỗi có hệ thống.'
    ),
    match(
      'Ghép khối của hệ thống điện tử với nhiệm vụ.',
      [
        { term: 'Khối vào', answer: 'Thu nhận tín hiệu từ môi trường hoặc người dùng' },
        { term: 'Khối xử lí', answer: 'Biến đổi và ra quyết định theo tín hiệu' },
        { term: 'Khối ra', answer: 'Hiển thị hoặc điều khiển cơ cấu chấp hành' },
      ],
      'Sơ đồ khối giúp theo dõi dòng tín hiệu trong hệ thống điện tử.'
    ),
  ],
  6: [
    mc(
      'Linh kiện nào thường được dùng để chỉnh lưu dòng điện?',
      ['Diode', 'Điện trở', 'Cuộn cảm', 'Công tắc cơ khí'],
      0,
      'Diode dẫn điện chủ yếu theo một chiều nên được dùng trong mạch chỉnh lưu.'
    ),
    tf(
      'Transistor có thể làm việc như phần tử khuếch đại hoặc công tắc điện tử.',
      true,
      'Hai ứng dụng cơ bản của transistor là khuếch đại và đóng cắt.'
    ),
    multi(
      'Chọn các chức năng đúng của linh kiện thụ động.',
      ['Điện trở hạn chế dòng điện', 'Tụ điện tích và phóng điện', 'Cuộn cảm liên quan đến từ trường', 'Điện trở tự lập trình thuật toán'],
      [0, 1, 2],
      'Điện trở, tụ điện và cuộn cảm có các đặc tính thụ động riêng; chúng không tự thực hiện chương trình.'
    ),
    match(
      'Ghép linh kiện với ứng dụng phù hợp.',
      [
        { term: 'Điện trở', answer: 'Hạn dòng hoặc phân áp' },
        { term: 'Tụ điện', answer: 'Lọc nguồn hoặc ghép tín hiệu' },
        { term: 'IC', answer: 'Tích hợp nhiều phần tử để xử lí hoặc điều khiển' },
      ],
      'Nhận biết chức năng là cơ sở để đọc và lắp ráp mạch điện tử.'
    ),
  ],
  7: [
    mc(
      'Đặc điểm của tín hiệu tương tự là',
      ['chỉ có hai mức 0 và 1.', 'biến thiên liên tục theo thời gian.', 'không mang thông tin.', 'luôn có biên độ bằng không.'],
      1,
      'Tín hiệu tương tự có thể nhận các giá trị liên tục trong một khoảng.'
    ),
    tf(
      'Trong mạch khuếch đại đảo, tín hiệu ra ngược pha với tín hiệu vào.',
      true,
      'Đảo pha là đặc điểm quan trọng của cấu hình khuếch đại đảo dùng op-amp.'
    ),
    multi(
      'Mạch điện tử tương tự có thể thực hiện những chức năng nào?',
      ['Khuếch đại', 'Lọc', 'So sánh', 'Chỉ lưu văn bản'],
      [0, 1, 2],
      'Mạch tương tự thường khuếch đại, lọc, so sánh, chỉnh lưu hoặc ổn áp.'
    ),
    match(
      'Ghép đại lượng hoặc bộ phận với vai trò trong mạch op-amp.',
      [
        { term: 'Tín hiệu vào', answer: 'Đại lượng cần được xử lí' },
        { term: 'Hồi tiếp', answer: 'Tác động từ đầu ra trở lại đầu vào' },
        { term: 'Tín hiệu ra', answer: 'Kết quả sau khuếch đại hoặc xử lí' },
      ],
      'Phân tích đường tín hiệu và hồi tiếp giúp hiểu hoạt động của mạch op-amp.'
    ),
  ],
  8: [
    mc(
      'Cổng AND cho đầu ra bằng 1 khi nào?',
      ['Ít nhất một đầu vào bằng 1', 'Tất cả đầu vào bằng 1', 'Tất cả đầu vào bằng 0', 'Các đầu vào khác nhau'],
      1,
      'Theo bảng chân lí, cổng AND chỉ cho mức 1 khi mọi đầu vào đều ở mức 1.'
    ),
    tf(
      'Đầu ra của mạch tuần tự có thể phụ thuộc cả đầu vào hiện tại và trạng thái trước đó.',
      true,
      'Mạch tuần tự có phần tử nhớ nên trạng thái trước ảnh hưởng đến đầu ra.'
    ),
    multi(
      'Chọn các phần tử hoặc mạch thuộc điện tử số.',
      ['Cổng logic', 'Flip-flop', 'Bộ đếm', 'Van nước cơ khí'],
      [0, 1, 2],
      'Cổng logic, flip-flop và bộ đếm là các thành phần tiêu biểu của mạch số.'
    ),
    match(
      'Ghép cổng logic với quy tắc đầu ra.',
      [
        { term: 'AND', answer: 'Bằng 1 khi mọi đầu vào bằng 1' },
        { term: 'OR', answer: 'Bằng 1 khi có ít nhất một đầu vào bằng 1' },
        { term: 'NOT', answer: 'Đảo trạng thái logic của đầu vào' },
      ],
      'Bảng chân lí mô tả chính xác quan hệ vào - ra của từng cổng.'
    ),
  ],
  9: [
    mc(
      'Vai trò chính của vi điều khiển trong một hệ thống tự động là',
      [
        'đọc tín hiệu, xử lí chương trình và điều khiển đầu ra.',
        'chỉ cung cấp điện cho tải công suất lớn.',
        'thay thế hoàn toàn cảm biến.',
        'chỉ làm giá đỡ linh kiện.',
      ],
      0,
      'Vi điều khiển thực hiện chương trình để xử lí đầu vào và tạo tín hiệu điều khiển.'
    ),
    tf(
      'Có thể nối trực tiếp mọi tải công suất lớn vào chân vi điều khiển mà không cần driver.',
      false,
      'Chân vi điều khiển chỉ chịu dòng giới hạn; tải lớn cần driver, transistor hoặc rơle.'
    ),
    multi(
      'Một hệ thống vi điều khiển thường có những thành phần nào?',
      ['Bộ xử lí và bộ nhớ', 'Chân vào/ra', 'Cảm biến và cơ cấu chấp hành', 'Chỉ một bóng đèn không có mạch điều khiển'],
      [0, 1, 2],
      'Hệ thống cần bộ xử lí, bộ nhớ, giao tiếp vào/ra và các phần tử kết nối với môi trường.'
    ),
    match(
      'Ghép thành phần với nhiệm vụ trong mạch điều chỉnh độ sáng LED.',
      [
        { term: 'Cảm biến ánh sáng', answer: 'Đo mức sáng của môi trường' },
        { term: 'Vi điều khiển', answer: 'Xử lí giá trị đo theo thuật toán' },
        { term: 'LED', answer: 'Thay đổi độ sáng theo tín hiệu điều khiển' },
      ],
      'Hệ thống hoạt động theo chuỗi cảm biến - xử lí - cơ cấu chấp hành.'
    ),
  ],
}
