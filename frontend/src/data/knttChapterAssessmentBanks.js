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
        'Thiết kế → gia công → chọn vật liệu → lắp ráp → kiểm tra',
        'Chọn vật liệu → thiết kế → gia công → kiểm tra → lắp ráp',
        'Thiết kế → chọn vật liệu → lắp ráp → gia công → kiểm tra',
        'Thiết kế → chọn vật liệu → gia công → lắp ráp → kiểm tra',
      ],
      3,
      'Từ yêu cầu, sản phẩm được thiết kế, chọn vật liệu, gia công chi tiết, lắp ráp rồi kiểm tra.'
    ),
    tf(
      'Người làm nghề cơ khí chế tạo chỉ cần vận hành máy, không cần đọc bản vẽ và đo kiểm.',
      false,
      'Đọc bản vẽ, hiểu vật liệu, quy trình, đo kiểm và an toàn đều là năng lực quan trọng.'
    ),
    multi(
      'Những việc nào thuộc công việc của người làm nghề cơ khí chế tạo?',
      [
        'Đọc bản vẽ để gia công chi tiết',
        'Vận hành và bảo trì máy công cụ',
        'Lập trình phần mềm kế toán cho doanh nghiệp',
        'Đo kiểm chi tiết sau gia công',
      ],
      [0, 1, 3],
      'Đọc bản vẽ, vận hành, bảo trì máy và đo kiểm là công việc của nghề cơ khí chế tạo; phần mềm kế toán thuộc ngành khác.'
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
        'Khối lượng riêng nhỏ để chi tiết nhẹ nhất có thể',
        'Giá thành thấp nhất trong các vật liệu đang có',
        'Cơ tính ở nhiệt độ làm việc, tính công nghệ và chi phí',
        'Khả năng dẫn điện tốt để tản nhiệt nhanh hơn',
      ],
      2,
      'Vật liệu được chọn theo điều kiện làm việc (tải, nhiệt độ), khả năng gia công và chi phí, không theo một tiêu chí riêng lẻ.'
    ),
    tf(
      'Composite có thể kết hợp ưu điểm của nhiều thành phần để tạo vật liệu nhẹ và bền.',
      true,
      'Composite được tạo từ các thành phần khác nhau nhằm đạt tổ hợp tính chất mong muốn.'
    ),
    multi(
      'Vật liệu nào sau đây thuộc nhóm vật liệu phi kim loại?',
      [
        'Cao su',
        'Gang xám',
        'Hợp kim nhôm',
        'Chất dẻo nhiệt',
      ],
      [0, 3],
      'Cao su và chất dẻo là vật liệu phi kim loại; gang xám là kim loại đen, hợp kim nhôm là kim loại màu.'
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
        'Làm thay đổi hình dạng, kích thước, bề mặt hoặc tính chất của phôi',
        'Lắp các chi tiết đã gia công thành sản phẩm hoàn chỉnh',
        'Chọn vật liệu phù hợp với điều kiện làm việc của chi tiết',
        'Kiểm tra kích thước sản phẩm theo bản vẽ trước khi xuất xưởng',
      ],
      0,
      'Gia công biến phôi thành chi tiết có hình dạng, kích thước và chất lượng theo yêu cầu; lắp ráp, chọn vật liệu, kiểm tra là các công đoạn khác.'
    ),
    tf(
      'Quy trình công nghệ hợp lí giúp giảm sai lỗi, tiết kiệm chi phí và đạt yêu cầu kĩ thuật.',
      true,
      'Trình tự nguyên công, máy, dao, đồ gá và chế độ gia công ảnh hưởng trực tiếp đến kết quả.'
    ),
    multi(
      'Phương pháp nào sau đây là gia công không phoi?',
      [
        'Tiện',
        'Đúc',
        'Khoan',
        'Rèn',
      ],
      [1, 3],
      'Đúc và rèn tạo hình mà không cắt bỏ vật liệu; tiện và khoan cắt bỏ lớp vật liệu thành phoi.'
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
      [
        'Băng tải',
        'Robot công nghiệp',
        'Xi lanh khí nén',
        'Cảm biến',
      ],
      3,
      'Cảm biến thu nhận thông tin để bộ điều khiển giám sát và ra lệnh; băng tải, robot, xi lanh là bộ phận thực hiện.'
    ),
    tf(
      'Khóa nguồn trước khi bảo trì là một biện pháp hạn chế nguy cơ máy khởi động ngoài ý muốn.',
      true,
      'Cô lập và khóa nguồn là bước an toàn quan trọng khi bảo trì thiết bị.'
    ),
    multi(
      'Nhà máy thông minh có thể mang lại những lợi ích nào?',
      [
        'Giám sát thiết bị theo thời gian thực',
        'Dự báo bảo trì từ dữ liệu của máy',
        'Không còn cần người vận hành và bảo trì',
        'Bỏ được các quy định an toàn lao động',
      ],
      [0, 1],
      'Dữ liệu và kết nối hỗ trợ giám sát và dự báo bảo trì; con người vẫn vận hành, bảo trì và các quy định an toàn vẫn bắt buộc.'
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
        'máy công cụ như máy tiện, máy phay.',
        'động cơ, hệ thống truyền lực và máy công tác.',
        'lưới điện truyền tải và trạm biến áp.',
        'dây chuyền đóng gói sản phẩm thực phẩm.',
      ],
      1,
      'Cơ khí động lực gồm máy tạo, truyền và sử dụng công suất cơ học; máy công cụ thuộc cơ khí chế tạo.'
    ),
    tf(
      'Xu hướng xe điện và chẩn đoán điện tử làm giảm nhu cầu học năng lực số trong nghề cơ khí động lực.',
      false,
      'Công nghệ mới khiến năng lực số và chẩn đoán điện tử ngày càng quan trọng.'
    ),
    multi(
      'Phương tiện, máy nào sau đây thuộc lĩnh vực cơ khí động lực?',
      [
        'Ô tô',
        'Máy tiện',
        'Tàu thủy',
        'Máy kéo nông nghiệp',
      ],
      [0, 2, 3],
      'Ô tô, tàu thủy, máy kéo có nguồn động lực, truyền lực và máy công tác; máy tiện là máy công cụ của cơ khí chế tạo.'
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
      'Trong động cơ bốn kì, kì nào trực tiếp sinh công?',
      [
        'Kì nạp',
        'Kì nén',
        'Kì nổ (cháy – giãn nở)',
        'Kì thải',
      ],
      2,
      'Khí cháy giãn nở đẩy pít tông trong kì nổ; ba kì còn lại tiêu tốn công.'
    ),
    tf(
      'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của pít tông thành chuyển động quay.',
      true,
      'Đây là nhiệm vụ chính của cơ cấu trục khuỷu - thanh truyền.'
    ),
    multi(
      'Ở kì nén của động cơ bốn kì, những nhận định nào đúng?',
      [
        'Pít tông đi từ ĐCT xuống ĐCD',
        'Hai xu páp đều đóng',
        'Áp suất và nhiệt độ trong xi lanh tăng',
        'Trục khuỷu quay từ 180° đến 360°',
      ],
      [1, 2, 3],
      'Ở kì nén, pít tông đi từ ĐCD lên ĐCT, hai xu páp đóng nên khí bị nén, áp suất và nhiệt độ tăng; trục khuỷu quay từ 180° đến 360°.'
    ),
    match(
      'Ghép kì làm việc với trạng thái chính của động cơ bốn kì.',
      [
        { term: 'Nạp', answer: 'Xu páp nạp mở, pít tông đi xuống' },
        { term: 'Nén', answer: 'Hai xu páp đóng, pít tông đi lên' },
        { term: 'Thải', answer: 'Xu páp thải mở, pít tông đi lên' },
      ],
      'Chuyển động pít tông và trạng thái xu páp xác định nhiệm vụ của từng kì.'
    ),
  ],
  7: [
    mc(
      'Nhiệm vụ chính của hệ thống truyền lực trên ô tô là',
      [
        'biến chuyển động tịnh tiến của pít tông thành chuyển động quay.',
        'thay đổi hướng chuyển động của xe theo vành lái.',
        'giảm dao động truyền từ mặt đường lên thân xe.',
        'truyền và biến đổi mô men từ động cơ tới bánh xe chủ động.',
      ],
      3,
      'Hệ thống truyền lực truyền và biến đổi mô men tới bánh xe chủ động; các ý còn lại là nhiệm vụ của cơ cấu trục khuỷu thanh truyền, hệ thống lái và hệ thống treo.'
    ),
    tf(
      'Áp suất lốp và tình trạng giảm xóc không ảnh hưởng đến khả năng bám đường của ô tô.',
      false,
      'Lốp và giảm xóc ảnh hưởng trực tiếp đến tiếp xúc bánh xe với mặt đường và độ an toàn.'
    ),
    multi(
      'Bộ phận nào thuộc hệ thống truyền lực của ô tô?',
      [
        'Giảm chấn',
        'Li hợp',
        'Cơ cấu lái',
        'Bộ vi sai',
      ],
      [1, 3],
      'Li hợp, hộp số, truyền lực các đăng, truyền lực chính và bộ vi sai thuộc hệ thống truyền lực; giảm chấn thuộc hệ thống treo, cơ cấu lái thuộc hệ thống lái.'
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
        'Sản xuất điện năng ở nhà máy và bán điện cho khách hàng',
        'Sản xuất, truyền tải, phân phối và sử dụng điện năng',
        'Thiết kế, chế tạo các linh kiện bán dẫn và vi mạch',
        'Lắp đặt hệ thống cấp thoát nước cho tòa nhà',
      ],
      1,
      'Kĩ thuật điện bao quát cả chuỗi sản xuất, truyền tải, phân phối và sử dụng điện năng; linh kiện bán dẫn thuộc kĩ thuật điện tử.'
    ),
    tf(
      'Người làm nghề điện cần đọc sơ đồ, đo kiểm và tuân thủ quy trình an toàn.',
      true,
      'Đây là những năng lực nền tảng trong thiết kế, lắp đặt, vận hành và bảo trì điện.'
    ),
    multi(
      'Chọn các xu hướng phát triển của kĩ thuật điện hiện nay.',
      [
        'Tăng tỉ trọng nhiệt điện than trong tổng nguồn điện',
        'Phát triển lưới điện thông minh',
        'Tăng tỉ lệ năng lượng tái tạo',
        'Giảm tự động hóa trong vận hành hệ thống điện',
      ],
      [1, 2],
      'Kĩ thuật điện phát triển theo hướng nguồn sạch, lưới thông minh và tự động hóa.'
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
      [
        'Để tăng tần số dòng điện cho phù hợp với tải',
        'Để dòng điện trên đường dây lớn hơn',
        'Để giảm tổn thất công suất trên đường dây',
        'Để đổi dòng điện xoay chiều thành một chiều',
      ],
      2,
      'Cùng công suất, điện áp cao thì dòng điện nhỏ, tổn thất I²R trên đường dây giảm.'
    ),
    tf(
      'Mạch điện ba pha được dùng phổ biến trong sản xuất và truyền tải điện năng.',
      true,
      'Hệ ba pha có nhiều ưu điểm về truyền tải công suất và vận hành động cơ.'
    ),
    multi(
      'Nguồn năng lượng nào sau đây là nguồn tái tạo dùng trong nhà máy điện?',
      [
        'Năng lượng gió',
        'Than đá',
        'Khí thiên nhiên',
        'Năng lượng mặt trời',
      ],
      [0, 3],
      'Gió và mặt trời là nguồn tái tạo; than đá và khí thiên nhiên là nhiên liệu hóa thạch.'
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
      [
        'Aptomat',
        'Cầu dao',
        'Công tơ điện',
        'Ổ cắm điện',
      ],
      0,
      'Aptomat vừa đóng cắt vừa tự ngắt khi quá tải, ngắn mạch; cầu dao chỉ đóng cắt bằng tay.'
    ),
    tf(
      'Sơ đồ nguyên lí thể hiện quan hệ điện giữa các phần tử, còn sơ đồ lắp đặt thể hiện vị trí và cách đi dây.',
      true,
      'Hai loại sơ đồ phục vụ các mục đích đọc, thiết kế và thi công khác nhau.'
    ),
    multi(
      'Khi lựa chọn thiết bị điện gia đình cần căn cứ vào những yếu tố nào?',
      [
        'Thương hiệu được quảng cáo nhiều nhất',
        'Điện áp và dòng điện định mức',
        'Công suất của tải',
        'Môi trường lắp đặt (ẩm ướt, ngoài trời)',
      ],
      [1, 2, 3],
      'Thiết bị phải phù hợp thông số điện, công suất tải và điều kiện môi trường; quảng cáo không phải căn cứ kĩ thuật.'
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
        'dùng tay kéo ngay nạn nhân ra khỏi chỗ bị giật.',
        'gọi cấp cứu rồi chờ nhân viên y tế tới xử lí.',
        'dội nước để làm mát người nạn nhân.',
        'ngắt nguồn điện hoặc dùng vật cách điện tách nạn nhân ra.',
      ],
      3,
      'Phải tách nạn nhân khỏi nguồn điện an toàn trước để người cứu không bị điện giật, sau đó mới sơ cứu và gọi cấp cứu.'
    ),
    tf(
      'Tắt thiết bị khi không sử dụng vừa giảm chi phí vừa góp phần giảm tải cho hệ thống điện.',
      true,
      'Sử dụng đúng nhu cầu là biện pháp tiết kiệm điện đơn giản và hiệu quả.'
    ),
    multi(
      'Chọn các biện pháp phòng tránh tai nạn điện.',
      [
        'Thay cầu chì bằng dây đồng to hơn để khỏi bị đứt',
        'Nối đất bảo vệ cho vỏ thiết bị kim loại',
        'Dùng thiết bị chống dòng điện rò',
        'Đi dép nhựa nên có thể sửa điện khi chưa ngắt nguồn',
      ],
      [1, 2],
      'Nối đất và chống rò giảm nguy cơ điện giật; thay sai thiết bị bảo vệ hoặc sửa điện khi chưa ngắt nguồn rất nguy hiểm.'
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
      'Thiết bị nào sau đây là sản phẩm của kĩ thuật điện tử?',
      [
        'Máy biến áp lực của trạm 110 kV',
        'Điện thoại thông minh',
        'Đường dây truyền tải 500 kV',
        'Động cơ điện ba pha của máy bơm',
      ],
      1,
      'Điện thoại xử lí tín hiệu bằng mạch điện tử; ba thiết bị còn lại thuộc kĩ thuật điện.'
    ),
    tf(
      'Dịch vụ điện tử hiện đại có liên quan đến IoT, thiết bị thông minh và bảo mật dữ liệu.',
      true,
      'Kết nối thiết bị làm tăng vai trò của phần mềm, mạng và bảo mật.'
    ),
    multi(
      'Chọn các năng lực cần thiết trong nghề điện tử.',
      [
        'Đọc sơ đồ mạch điện tử',
        'Vận hành máy tiện, máy phay',
        'Dùng đồng hồ vạn năng, máy hiện sóng để đo kiểm',
        'Thi công kết cấu bê tông cốt thép',
      ],
      [0, 2],
      'Người làm nghề điện tử cần đọc mạch và đo kiểm tín hiệu; vận hành máy công cụ và thi công kết cấu thuộc ngành khác.'
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
      [
        'Điện trở',
        'Tụ điện',
        'Cuộn cảm',
        'Diode',
      ],
      3,
      'Diode dẫn điện chủ yếu theo một chiều nên được dùng trong mạch chỉnh lưu; tụ điện dùng để lọc sau chỉnh lưu.'
    ),
    tf(
      'Transistor có thể làm việc như phần tử khuếch đại hoặc công tắc điện tử.',
      true,
      'Hai ứng dụng cơ bản của transistor là khuếch đại và đóng cắt.'
    ),
    multi(
      'Linh kiện nào sau đây là linh kiện thụ động?',
      [
        'Transistor',
        'Điện trở',
        'Tụ điện',
        'IC vi điều khiển',
      ],
      [1, 2],
      'Điện trở, tụ điện, cuộn cảm là linh kiện thụ động; transistor và IC là linh kiện tích cực.'
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
      [
        'nhận một trong hai mức logic 0 và 1.',
        'thay đổi theo từng bước rời rạc đã được mã hóa.',
        'biến thiên liên tục theo thời gian.',
        'luôn có biên độ không đổi theo thời gian.',
      ],
      2,
      'Tín hiệu tương tự nhận các giá trị liên tục; hai ý đầu mô tả tín hiệu số.'
    ),
    tf(
      'Trong mạch khuếch đại đảo, tín hiệu ra ngược pha với tín hiệu vào.',
      true,
      'Đảo pha là đặc điểm quan trọng của cấu hình khuếch đại đảo dùng op-amp.'
    ),
    multi(
      'Với mạch khuếch đại đảo dùng op-amp, những nhận định nào đúng?',
      [
        'Hệ số khuếch đại có độ lớn bằng R2/R1',
        'Tín hiệu vào được đưa tới đầu không đảo',
        'Điện áp ra không vượt quá điện áp nguồn cấp',
        'Tăng R1 thì hệ số khuếch đại tăng',
      ],
      [0, 2],
      'Ura = −(R2/R1)·Uvào, tín hiệu vào qua R1 tới đầu đảo; điện áp ra bị giới hạn bởi nguồn; tăng R1 làm hệ số khuếch đại giảm.'
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
      'Cổng OR hai đầu vào cho đầu ra bằng 0 khi nào?',
      [
        'A = 1, B = 0',
        'A = 0, B = 1',
        'A = 1, B = 1',
        'A = 0, B = 0',
      ],
      3,
      'Cổng OR cho 1 khi có ít nhất một đầu vào bằng 1, nên chỉ cho 0 khi cả hai đầu vào bằng 0.'
    ),
    tf(
      'Đầu ra của mạch tuần tự có thể phụ thuộc cả đầu vào hiện tại và trạng thái trước đó.',
      true,
      'Mạch tuần tự có phần tử nhớ nên trạng thái trước ảnh hưởng đến đầu ra.'
    ),
    multi(
      'Mạch nào sau đây là mạch tuần tự (có phần tử nhớ)?',
      [
        'Bộ đếm',
        'Cổng AND',
        'Flip-flop',
        'Mạch chỉ gồm cổng OR và NOT',
      ],
      [0, 2],
      'Bộ đếm và flip-flop có phần tử nhớ nên là mạch tuần tự; mạch chỉ gồm cổng logic là mạch tổ hợp.'
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
        'đọc tín hiệu vào, thực hiện chương trình và điều khiển đầu ra.',
        'cấp nguồn trực tiếp cho các tải công suất lớn.',
        'đo trực tiếp các đại lượng vật lí thay cho cảm biến.',
        'khuếch đại công suất tín hiệu âm thanh ra loa.',
      ],
      0,
      'Vi điều khiển xử lí tín hiệu từ cảm biến theo chương trình rồi tạo tín hiệu điều khiển; tải lớn cần mạch công suất riêng.'
    ),
    tf(
      'Có thể nối trực tiếp mọi tải công suất lớn vào chân vi điều khiển mà không cần driver.',
      false,
      'Chân vi điều khiển chỉ chịu dòng giới hạn; tải lớn cần driver, transistor hoặc rơle.'
    ),
    multi(
      'Trên bo mạch Arduino Uno, những nhận định nào đúng?',
      [
        'Có thể nối trực tiếp động cơ công suất lớn vào chân số',
        'Các chân A0–A5 đọc được tín hiệu tương tự',
        'Chân số có thể đặt làm đầu vào hoặc đầu ra',
        'Chương trình được nạp từ máy tính qua cổng USB',
      ],
      [1, 2, 3],
      'Chân của vi điều khiển chỉ chịu dòng nhỏ nên tải lớn cần mạch công suất; ba ý còn lại đúng.'
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
