// Grade 10 bank. Each question: [level, competency, stem, correct answer, three distractors, explanation].
// Levels: B biết, H hiểu, V vận dụng. Competencies: NT nhận thức, GT giao tiếp, SD sử dụng, DG đánh giá,
// TK thiết kế kĩ thuật. Each chapter also has one true/false item with four statements.
export const grade10Questions = {
  1: [
    ['B', 'NT', 'Hoạt động nào sau đây thuộc về khoa học?', 'Khám phá quy luật vận động của tự nhiên', ['Lắp ráp một động cơ điện theo bản vẽ', 'Vận hành dây chuyền đóng gói sản phẩm', 'Sửa chữa hệ thống điện của tòa nhà'], 'Khoa học khám phá bản chất, quy luật; kĩ thuật và công nghệ ứng dụng các kết quả đó.'],
    ['H', 'DG', 'Vì sao nói công nghệ vừa có tác động tích cực vừa có tác động tiêu cực tới đời sống?', 'Nó nâng cao năng suất nhưng có thể gây ô nhiễm', ['Nó chỉ phục vụ sản xuất nên không liên quan tới môi trường', 'Nó luôn làm giảm việc làm ở mọi ngành nghề trong xã hội', 'Nó chỉ mang lại lợi ích khi được sử dụng ở các nước phát triển'], 'Công nghệ tác động tới con người, tự nhiên và kinh tế theo cả hai chiều.'],
  ],
  2: [
    ['B', 'NT', 'Một hệ thống kĩ thuật gồm các phần tử cơ bản nào?', 'Đầu vào, bộ phận xử lí và đầu ra', ['Nguồn điện, dây dẫn và phụ tải điện', 'Bản vẽ, vật liệu và công cụ gia công', 'Người thiết kế, người sản xuất và người dùng'], 'Hệ thống kĩ thuật được mô tả bằng đầu vào, xử lí, đầu ra.'],
    ['V', 'SD', 'Trong hệ thống cảnh báo cháy, cảm biến khói đóng vai trò nào?', 'Thuộc đầu vào, cung cấp tín hiệu cho bộ xử lí', ['Thuộc đầu ra, phát tín hiệu cảnh báo cho người dùng', 'Thuộc bộ xử lí, ra quyết định bật chuông báo động', 'Là nguồn năng lượng cấp cho toàn bộ hệ thống'], 'Cảm biến thu thông tin từ môi trường nên là đầu vào.'],
  ],
  3: [
    ['B', 'NT', 'Bóng đèn LED là sản phẩm của công nghệ nào?', 'Công nghệ điện - quang', ['Công nghệ điện - cơ', 'Công nghệ luyện kim', 'Công nghệ cơ khí'], 'Công nghệ điện - quang biến đổi điện năng thành quang năng.'],
    ['H', 'NT', 'Quạt điện và máy bơm nước có điểm chung nào về công nghệ?', 'Đều biến đổi điện năng thành cơ năng', ['Đều biến đổi điện năng thành quang năng', 'Đều biến đổi nhiệt năng thành điện năng', 'Đều biến đổi hóa năng thành nhiệt năng'], 'Hai sản phẩm đều thuộc công nghệ điện - cơ.'],
  ],
  4: [
    ['B', 'NT', 'Công nghệ in 3D tạo sản phẩm theo nguyên tắc nào?', 'Đắp vật liệu thành từng lớp theo mô hình số', ['Cắt bỏ vật liệu thừa khỏi một khối phôi', 'Rót vật liệu lỏng vào khuôn rồi để nguội', 'Ép vật liệu trong khuôn dưới áp lực lớn'], 'In 3D là công nghệ đắp lớp.'],
    ['H', 'DG', 'Vì sao hệ thống tưới vườn tự động kết nối Internet được xếp vào ứng dụng IoT?', 'Thiết bị tự trao đổi dữ liệu và được điều khiển qua mạng', ['Hệ thống được lắp bằng nhiều vật liệu có kích thước nano', 'Hệ thống sử dụng máy bơm công suất lớn hơn tưới thủ công', 'Hệ thống được thiết kế bằng phần mềm vẽ kĩ thuật trên máy tính'], 'IoT là các thiết bị kết nối và trao đổi dữ liệu qua mạng.'],
  ],
  5: [
    ['B', 'DG', 'Tiêu chí nào thường dùng để đánh giá một sản phẩm công nghệ?', 'Hiệu quả, độ tin cậy, kinh tế, môi trường', ['Màu sắc, xuất xứ, tên hãng và bao bì', 'Số lượng sản phẩm bán ra trong tháng đầu tiên trên thị trường', 'Mức độ phổ biến trên mạng xã hội'], 'Đây là nhóm tiêu chí đánh giá công nghệ của bài học.'],
    ['V', 'DG', 'Hai máy giặt cùng giá. Máy A tốn ít điện, ít nước và bảo hành dài hơn máy B. Nên kết luận gì?', 'Máy A tốt hơn theo các tiêu chí đánh giá', ['Máy B tốt hơn vì giá hai máy bằng nhau', 'Không so sánh được vì hai máy cùng giá', 'Hai máy tương đương vì cùng là máy giặt và cùng mức giá'], 'So sánh theo từng tiêu chí chứ không chỉ theo giá mua.'],
  ],
  6: [
    ['B', 'NT', 'Cách mạng công nghiệp lần thứ nhất gắn với thành tựu nào?', 'Động cơ hơi nước và cơ khí hóa', ['Điện năng và sản xuất dây chuyền', 'Máy tính và tự động hóa sản xuất', 'Trí tuệ nhân tạo và Internet vạn vật'], 'Lần thứ nhất đặc trưng bởi cơ khí hóa bằng máy hơi nước.'],
    ['H', 'NT', 'Đặc trưng nào phân biệt rõ nhất lần thứ tư với lần thứ ba?', 'Kết nối, dữ liệu và trí tuệ nhân tạo hỗ trợ ra quyết định', ['Con người bắt đầu dùng điện năng thay cho sức nước trong nhà máy', 'Máy móc lần đầu thay thế lao động thủ công trong sản xuất', 'Máy tính lần đầu được dùng để điều khiển dây chuyền sản xuất'], 'Lần ba là tự động hóa; lần bốn thêm kết nối và trí tuệ.'],
  ],
  7: [
    ['B', 'NT', 'Công việc nào sau đây thuộc ngành nghề kĩ thuật, công nghệ?', 'Sửa chữa, lắp ráp ô tô', ['Biên tập sách văn học', 'Tư vấn tâm lí học đường', 'Giảng dạy môn Lịch sử'], 'Sửa chữa, lắp ráp ô tô thuộc công nghệ kĩ thuật ô tô.'],
    ['V', 'DG', 'Một học sinh thích lắp mạch và lập trình bo mạch. Hướng nghề nào phù hợp nhất?', 'Kĩ thuật điện tử, tự động hóa', ['Kĩ thuật xây dựng cầu đường', 'Công nghệ chế biến thực phẩm', 'Công nghệ dệt may thời trang'], 'Lựa chọn nghề dựa trên sở thích và năng lực phù hợp.'],
  ],
  8: [
    ['B', 'GT', 'Tỉ lệ bản vẽ là tỉ số giữa', 'kích thước đo trên hình và kích thước thực tương ứng', ['kích thước thực và kích thước khổ giấy đã chọn', 'chiều dài và chiều rộng của khung bản vẽ', 'chiều rộng nét đậm và chiều rộng nét mảnh'], 'Theo quy định về tỉ lệ trên bản vẽ kĩ thuật.'],
    ['V', 'GT', 'Chi tiết dài 200 mm được vẽ với tỉ lệ 1:2. Đoạn thẳng trên bản vẽ dài bao nhiêu và số ghi kích thước là bao nhiêu?', 'Dài 100 mm, ghi số 200', ['Dài 100 mm, ghi số 100', 'Dài 400 mm, ghi số 200', 'Dài 200 mm, ghi số 100'], 'Tỉ lệ 1:2 thu nhỏ một nửa; chữ số luôn ghi kích thước thực.'],
  ],
  9: [
    ['B', 'GT', 'Theo phương pháp chiếu góc thứ nhất, hình chiếu bằng được đặt ở đâu so với hình chiếu đứng?', 'Ngay phía dưới hình chiếu đứng', ['Ngay phía trên hình chiếu đứng', 'Ở bên trái hình chiếu đứng', 'Ở bên phải hình chiếu đứng'], 'Hình chiếu bằng dưới, hình chiếu cạnh bên phải hình chiếu đứng.'],
    ['H', 'GT', 'Hình chiếu cạnh của vật thể thu được khi', 'chiếu theo hướng từ trái sang lên mặt phẳng P3', ['chiếu theo hướng từ trước ra sau lên mặt phẳng P1', 'chiếu theo hướng từ trên xuống lên mặt phẳng P2', 'xoay vật thể 90° rồi chiếu lên mặt phẳng P1'], 'P1, P2, P3 tương ứng hình chiếu đứng, bằng, cạnh.'],
  ],
  10: [
    ['B', 'GT', 'Hình cắt là hình biểu diễn', 'gồm mặt cắt và hình chiếu của phần vật thể còn lại', ['chỉ gồm phần vật thể tiếp xúc với mặt phẳng cắt', 'phần vật thể nằm giữa người quan sát và mặt phẳng cắt', 'hình dạng bên ngoài của vật thể theo hướng chiếu'], 'Mặt cắt chỉ là phần tiếp xúc; hình cắt có thêm phần còn lại.'],
    ['V', 'GT', 'Vật thể có lỗ bậc ở bên trong, cần thể hiện rõ hình dạng lỗ trên bản vẽ. Nên dùng cách biểu diễn nào?', 'Dùng hình cắt qua trục của lỗ', ['Thêm một hình chiếu từ phía sau', 'Tăng chiều rộng các nét đứt', 'Chỉ ghi kích thước đường kính lỗ'], 'Hình cắt thể hiện phần rỗng bên trong rõ hơn nét đứt.'],
  ],
  11: [
    ['B', 'GT', 'Hình chiếu trục đo vuông góc đều có các góc trục đo bằng', '120°', ['90°', '135°', '60°'], 'Ba góc trục đo của hình chiếu trục đo vuông góc đều bằng 120°.'],
    ['V', 'GT', 'Trong hình chiếu trục đo xiên góc cân, cạnh dài 40 mm song song trục O′y′ được vẽ dài bao nhiêu?', '20 mm', ['40 mm', '80 mm', '10 mm'], 'Hệ số biến dạng theo trục y bằng 0,5.'],
  ],
  12: [
    ['B', 'GT', 'Đường chân trời trong hình chiếu phối cảnh là giao tuyến giữa', 'mặt phẳng tầm mắt và mặt tranh', ['mặt phẳng vật thể và mặt tranh', 'mặt phẳng tầm mắt và mặt phẳng vật thể', 'hai mặt bên của vật thể được vẽ'], 'Theo định nghĩa trong bài học.'],
    ['H', 'GT', 'Trong hình chiếu phối cảnh một điểm tụ, các đường thẳng vuông góc với mặt tranh', 'hội tụ tại điểm tụ trên đường chân trời', ['vẫn song song với nhau trên hình vẽ', 'luôn trùng với đường chân trời đã chọn', 'vuông góc với mặt phẳng vật thể trên hình'], 'Đây là đặc điểm tạo cảm giác xa gần của phối cảnh.'],
  ],
  13: [
    ['B', 'GT', 'Theo quy ước vẽ ren nhìn thấy, đường đỉnh ren được vẽ bằng', 'nét liền đậm', ['nét liền mảnh', 'nét đứt mảnh', 'nét gạch dài chấm mảnh'], 'Đường đỉnh ren và đường giới hạn ren vẽ bằng nét liền đậm.'],
    ['V', 'SD', 'Kí hiệu M10 × 1 trên bản vẽ cho biết điều gì?', 'Ren hệ mét, đường kính 10 mm, bước ren 1 mm', ['Ren hình thang, đường kính 1 mm, dài 10 mm', 'Ren hệ mét, dài 10 mm, có một đầu mối', 'Ren ống, đường kính 10 inch, bước ren 1 mm'], 'M chỉ ren hệ mét, tiếp theo là đường kính và bước ren.'],
  ],
  14: [
    ['B', 'GT', 'Bản vẽ lắp khác bản vẽ chi tiết ở chỗ bản vẽ lắp có', 'bảng kê các chi tiết của sản phẩm', ['khung tên ở góc phải bản vẽ', 'các hình biểu diễn của vật thể', 'các kích thước của vật thể'], 'Bảng kê là thành phần riêng của bản vẽ lắp.'],
    ['H', 'SD', 'Khi đọc bản vẽ chi tiết, thông tin về vật liệu và tỉ lệ được tìm ở đâu trước tiên?', 'Trong khung tên', ['Trong bảng kê', 'Trong hình cắt', 'Trong yêu cầu kĩ thuật'], 'Trình tự đọc bắt đầu từ khung tên.'],
  ],
  15: [
    ['B', 'GT', 'Mặt bằng của ngôi nhà là hình biểu diễn nhận được khi', 'cắt ngôi nhà bằng mặt phẳng nằm ngang qua cửa sổ', ['chiếu ngôi nhà từ phía trước lên mặt phẳng thẳng đứng', 'cắt ngôi nhà bằng mặt phẳng thẳng đứng qua cầu thang', 'nhìn ngôi nhà từ một điểm nhìn trên cao phía xa'], 'Mặt bằng là hình cắt bằng của ngôi nhà.'],
    ['V', 'SD', 'Cần biết chiều cao tầng và kết cấu sàn của ngôi nhà. Nên đọc hình biểu diễn nào?', 'Mặt cắt', ['Mặt đứng', 'Mặt bằng', 'Phối cảnh'], 'Mặt cắt thể hiện kích thước theo chiều cao và kết cấu.'],
  ],
  16: [
    ['B', 'NT', 'Ưu điểm chính của vẽ kĩ thuật có máy tính hỗ trợ so với vẽ tay là', 'dễ sửa chữa, lưu trữ và dùng lại bản vẽ', ['không cần hiểu quy tắc biểu diễn', 'không cần tuân theo tiêu chuẩn bản vẽ', 'không cần đến người lập bản vẽ'], 'CAD hỗ trợ người vẽ, vẫn phải theo tiêu chuẩn.'],
    ['H', 'SD', 'Để vẽ đường tròn đường kính 30 mm trong phần mềm CAD, người vẽ cần', 'chọn lệnh vẽ đường tròn, chỉ tâm và nhập kích thước', ['vẽ bốn đoạn thẳng rồi làm tròn các góc nối cho đến khi vừa ý', 'in bản vẽ trước rồi dùng compa vẽ thêm vào', 'đổi tỉ lệ bản vẽ cho đến khi hình vừa ý'], 'Phần mềm dùng lệnh vẽ với tham số chính xác.'],
  ],
  17: [
    ['B', 'TK', 'Mục đích chính của hoạt động thiết kế kĩ thuật là', 'tạo giải pháp, sản phẩm đáp ứng nhu cầu', ['ghi lại đặc điểm các sản phẩm đã có trên thị trường', 'mô tả quy luật tự nhiên bằng công thức', 'quảng bá sản phẩm mới tới người tiêu dùng'], 'Thiết kế kĩ thuật giải quyết vấn đề thực tiễn.'],
    ['H', 'TK', 'Vì sao thiết kế kĩ thuật thúc đẩy phát triển công nghệ?', 'Giải pháp mới tạo ra sản phẩm, công nghệ tốt hơn', ['Thiết kế làm giảm nhu cầu sử dụng công nghệ', 'Thiết kế chỉ sao chép sản phẩm đã có sẵn', 'Thiết kế thay thế hoàn toàn hoạt động sản xuất trong nhà máy'], 'Hoạt động thiết kế gắn với đổi mới sản phẩm và công nghệ.'],
  ],
  18: [
    ['B', 'TK', 'Bước nào đứng ngay sau bước "Xây dựng nguyên mẫu cho giải pháp"?', 'Kiểm chứng giải pháp', ['Lập hồ sơ kĩ thuật', 'Xác định yêu cầu', 'Tìm hiểu tổng quan'], 'Trình tự: xây dựng nguyên mẫu, kiểm chứng, lập hồ sơ.'],
    ['V', 'TK', 'Nguyên mẫu giá phơi đồ không đạt tải trọng đã đề ra. Nhóm thiết kế nên làm gì?', 'Điều chỉnh giải pháp rồi kiểm chứng lại', ['Lập hồ sơ kĩ thuật ngay với thông số đã đạt', 'Hạ yêu cầu tải trọng cho khớp với kết quả của nguyên mẫu', 'Đưa nguyên mẫu vào sản xuất rồi sửa dần'], 'Kết quả kiểm chứng đối chiếu với yêu cầu đã xác định.'],
  ],
  19: [
    ['B', 'TK', 'Yếu tố nhân trắc khi thiết kế bàn ghế là', 'kích thước và tư thế của người sử dụng', ['màu sắc và hoa văn trên mặt bàn', 'giá bán của sản phẩm trên thị trường', 'khả năng vận chuyển bằng xe tải nhỏ'], 'Nhân trắc liên quan đến cơ thể người dùng.'],
    ['V', 'DG', 'Ghế dành cho học sinh tiểu học có mặt ngồi quá cao so với chiều dài chân. Thiết kế đã không chú ý yếu tố nào?', 'Nhân trắc', ['Thẩm mĩ', 'Năng lượng', 'Vòng đời'], 'Kích cỡ ghế phải phù hợp cơ thể người dùng.'],
  ],
  20: [
    ['B', 'TK', 'Nguyên tắc nào dưới đây là nguyên tắc thiết kế kĩ thuật?', 'Tuân thủ tiêu chuẩn, bảo vệ môi trường', ['Dùng càng nhiều chi tiết càng tốt', 'Chọn loại vật liệu đắt tiền nhất có thể cho sản phẩm', 'Ưu tiên kiểu dáng hơn công năng'], 'Các nguyên tắc gồm đơn giản hóa, tối ưu, tuân thủ tiêu chuẩn, bảo vệ môi trường.'],
    ['H', 'DG', 'Một mẫu ghế bỏ các thanh nối không chịu lực mà vẫn đủ bền. Thiết kế đã áp dụng nguyên tắc nào?', 'Đơn giản hóa', ['Tuân thủ tiêu chuẩn', 'Bảo vệ môi trường', 'Tăng độ phức tạp'], 'Bớt chi tiết không cần thiết mà vẫn đạt công năng.'],
  ],
  21: [
    ['B', 'TK', 'Phương pháp nào thường dùng để phát triển nhiều ý tưởng ở giai đoạn đầu của thiết kế?', 'Động não và sơ đồ tư duy', ['Đo kiểm và thử tải', 'Hàn và lắp ráp', 'Sơn và đóng gói'], 'Đây là phương pháp phát triển ý tưởng.'],
    ['V', 'SD', 'Nhóm cần kiểm tra nhanh hình dạng một chi tiết nhựa nhỏ trước khi làm khuôn. Phương tiện nào phù hợp nhất?', 'Máy in 3D', ['Máy đo điện trở', 'Máy tiện kim loại', 'Máy hàn hồ quang'], 'In 3D tạo nhanh mẫu chi tiết nhựa.'],
  ],
  22: [
    ['H', 'TK', 'Khi thực hiện dự án thiết kế sản phẩm đơn giản, tiêu chí đánh giá sản phẩm cần được xác định từ khi nào?', 'Từ bước xác định yêu cầu', ['Sau khi sản phẩm đã hoàn thành', 'Khi đã lập xong hồ sơ kĩ thuật', 'Khi bắt đầu báo cáo dự án'], 'Yêu cầu làm cơ sở để kiểm chứng giải pháp.'],
    ['V', 'TK', 'Dự án làm giá để điện thoại có yêu cầu giữ máy ở góc 60°. Cách kiểm chứng nào phù hợp nhất?', 'Đặt máy lên nguyên mẫu, đo góc và thử độ vững', ['Hỏi ý kiến các bạn về màu sắc của sản phẩm', 'Tính tổng chi phí vật liệu đã dùng cho nguyên mẫu', 'So sánh với ảnh sản phẩm tương tự trên mạng'], 'Kiểm chứng phải đo đúng yêu cầu đã đề ra.'],
  ],
}

export const grade10TrueFalse = {
  1: { lesson: 2, stem: 'Một hệ thống đèn đường tự bật khi trời tối gồm cảm biến ánh sáng, bộ điều khiển và bóng đèn.', items: [
    ['Cảm biến ánh sáng là đầu vào của hệ thống.', true, 'B'],
    ['Bóng đèn là bộ phận xử lí của hệ thống.', false, 'B'],
    ['Hệ thống ứng dụng công nghệ điện - quang để tạo ánh sáng.', true, 'H'],
    ['Đèn vẫn tự bật đúng lúc khi bộ điều khiển không nhận được tín hiệu từ cảm biến.', false, 'V'],
  ] },
  2: { lesson: 9, stem: 'Một học sinh lập bản vẽ chi tiết dài 300 mm trên khổ giấy A4 với tỉ lệ 1:2, theo phương pháp chiếu góc thứ nhất.', items: [
    ['Hình chiếu bằng được đặt ngay dưới hình chiếu đứng.', true, 'B'],
    ['Hình chiếu cạnh được đặt bên trái hình chiếu đứng.', false, 'B'],
    ['Đoạn thẳng biểu diễn chiều dài chi tiết trên bản vẽ dài 150 mm.', true, 'H'],
    ['Số kích thước ghi trên bản vẽ cho chiều dài đó là 150.', false, 'V'],
  ] },
  3: { lesson: 18, stem: 'Một nhóm học sinh thiết kế giá phơi quần áo gấp gọn cho ban công nhỏ, yêu cầu chịu được 15 kg.', items: [
    ['Xác định vấn đề là bước đầu tiên của quy trình thiết kế.', true, 'B'],
    ['Lập hồ sơ kĩ thuật được thực hiện trước khi làm nguyên mẫu.', false, 'B'],
    ['Yêu cầu chịu 15 kg là cơ sở để kiểm chứng giải pháp.', true, 'H'],
    ['Nếu nguyên mẫu chỉ chịu được 10 kg, nhóm có thể lập hồ sơ kĩ thuật ngay.', false, 'V'],
  ] },
}
