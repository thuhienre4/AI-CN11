# Kiểm chứng kỹ thuật EngineLab AI

Tài liệu này ghi lại các thay đổi theo ý kiến phản biện, số liệu đo được và cách tái lập. Mọi số liệu chỉ có giá trị trong phạm vi môi trường và kịch bản nêu dưới đây.

## Môi trường đo

| Thành phần | Cấu hình |
|---|---|
| Máy | AMD Ryzen 5 7520U (4 nhân, 8 luồng), RAM 15,3 GB, Windows 11 |
| Phần mềm | Python 3.13.9 (32-bit), Node 22.20, FastAPI 0.115.12, uvicorn 0.34.2, SQLAlchemy 2.0.41 |
| Cơ sở dữ liệu | SQLite (WAL). **PostgreSQL chưa được đo** |
| Tiến trình | Một tiến trình uvicorn; máy khách và máy chủ chạy trên cùng một máy |
| Gemini | Không có khóa API: mọi phản hồi trong phép đo là phản hồi dự phòng |

## Tái lập

```bash
cd backend
pip install -r requirements-dev.txt
coverage run -m pytest -q tests && coverage report
python scripts/review_load_test.py --workdir <thư mục trống> --out results.json
python scripts/audit_question_bank.py

cd ../frontend
npm ci
npx vitest run
npm run build
```

`review_load_test.py` khởi động máy chủ thật với cơ sở dữ liệu mới ở mỗi lần lặp (mặc định 5 lần, 40 học sinh và 1 giáo viên).

## Kiểm thử tự động

| Bộ kiểm thử | Trước | Sau |
|---|---|---|
| Máy chủ (pytest) | 8 ca | 228 ca, tất cả đạt |
| Độ phủ máy chủ (dòng và nhánh) | 49% | 84% |
| Giao diện (Vitest) | 2 ca | 150 ca, tất cả đạt |
| Đầu – cuối (Playwright, chạy trong GitHub Actions) | không có | 4 hành trình, tất cả đạt |

Bộ máy chủ gồm: quét mọi endpoint được bảo vệ với người dùng ẩn danh, học sinh gọi endpoint của giáo viên, truy cập chéo giữa học sinh, token giả/hết hạn/`alg: none`, WebSocket, gửi lại sự kiện, lỗi nhà cung cấp AI (giả lập tầng mạng), biên của Risk Score, toàn vẹn danh mục, danh mục và câu hỏi (tạo, sửa, xóa, 404), học liệu (định dạng, trùng tệp, tải xuống, quyền xóa), Nova3D (chưa cấu hình, chưa sẵn sàng, bắt đầu, chờ xong, thất bại, thiếu mã workflow; dịch vụ ngoài được giả lập).

Độ phủ bốn mô-đun trước đây dưới 40%: `lessons.py` 100%, `materials.py` 96%, `nova3d.py` 87%, `questions.py` 98%.

Kiểm thử đầu – cuối (`frontend/e2e/journeys.spec.js`) chạy máy chủ FastAPI thật với cơ sở dữ liệu SQLite mới và bản đóng gói thật của giao diện, rồi dùng trình duyệt: khách bị chuyển về trang đăng nhập; học sinh đăng kí, đăng nhập (token thật của máy chủ), mở Bài 18, làm bài kiểm tra nhanh và máy chủ ghi một lượt 2 câu; giáo viên chờ xác minh không thấy công cụ giáo viên và API trả 403; đề kiểm tra theo ma trận lớp 12 hiện 9 chương, 16 câu trắc nghiệm, chấm được phần trắc nghiệm. Chạy tại chỗ: `cd frontend && npx playwright test` (thêm `E2E_CHANNEL=chrome` để dùng Chrome có sẵn).

Giới hạn còn lại: các trang React chưa có kiểm thử thành phần riêng; kiểm thử đầu – cuối mới có 4 hành trình.

## Lỗi phát hiện và đã sửa

| Mã | Lỗi | Cách sửa |
|---|---|---|
| D1 | Mọi giáo viên đọc được dữ liệu của mọi học sinh | Giáo viên chỉ truy cập lớp được gán; quản trị viên truy cập tất cả |
| D2 | Giáo viên chưa gán lớp thấy toàn trường | Trả về rỗng kèm `needs_class_assignment` |
| D3 | `client_event_id` trùng toàn cục: người dùng khác nhận được sự kiện của nhau | Khóa duy nhất theo `(user_id, client_event_id)`, có di trú |
| D4 | Trùng mã trong cùng một lô gây lỗi 500 | Xử lý trùng bằng savepoint |
| D5 | Học sinh tự báo điểm quiz và tiến độ | Chỉ tính lượt quiz do máy chủ chấm; sửa tiến độ thủ công chỉ dành cho giáo viên |
| D6 | Trả lời lặp một câu để nâng điểm; nộp tiếp sau khi kết thúc | Lần trả lời đầu là duy nhất; lượt đã kết thúc trả về 409 |
| D7 | Nộp bài dưới tên học sinh khác | Luôn dùng danh tính từ token |
| D8 | Học sinh xem được bài đăng nháp | Chỉ giáo viên xem được nháp |
| D9 | Hai ngưỡng đạt khác nhau (60 và 70) | Dùng chung một quy tắc trạng thái |
| D10 | Đáp án đúng luôn ở vị trí đầu và có mã nhỏ nhất | Xoay mã trong danh mục; thứ tự phương án riêng cho từng học sinh |
| D11 | Giáo viên nhận cập nhật thời gian thực của mọi lớp | Phát tin theo lớp được gán |
| D12 | Hết kết nối cơ sở dữ liệu khi có hơn 15 WebSocket | Socket nhả kết nối ngay sau xác thực |
| D13 | Khóa chết 30 giây khi có hơn 15 yêu cầu đồng thời | Truy vấn đồng bộ chuyển khỏi event loop; số luồng lớn hơn pool kết nối |
| D14 | Giữ kết nối trong lúc chờ AI, băm mật khẩu hoặc tải tệp | Nhả kết nối trước các thao tác chậm |
| D15 | Giao diện không có màn hình phân tích cho giáo viên | Thêm `TeacherAnalyticsPanel` trong trang Lớp học |
| D16 | Giáo viên nào cũng xóa được học liệu của giáo viên khác | Chỉ người tải lên hoặc quản trị viên được xóa (403 cho người khác); giao diện chỉ hiện nút Xóa cho họ |
| D17 | Tên và mã người tải lên lấy từ form, ghi giả được | Người tải lên luôn lấy từ token |
| D18 | Đăng kí sai dữ liệu chỉ hiện "Request validation failed." | Báo trường bị sai bằng tiếng Việt (email, tên đăng nhập, mật khẩu…) |

D16, D17 được phát hiện khi viết kiểm thử cho `materials.py`; D18 được phát hiện khi chạy kiểm thử đầu – cuối.

## Vá bảo mật bổ sung

- **Token WebSocket không còn nằm trên URL.** Trình duyệt mở `/api/ws/learning` rồi gửi `{"type": "auth", "token": …}` làm tin nhắn đầu tiên; máy chủ chờ tối đa 10 giây, sai hoặc thiếu thì đóng với mã 4401. Token đặt trên URL không còn được chấp nhận (có kiểm thử). Nhờ vậy token không xuất hiện trong nhật kí truy cập của máy chủ hay proxy.
- **Nút của giáo viên được ẩn với tài khoản chưa xác minh.** Giao diện dùng chung một quy tắc (`frontend/src/utils/roles.js`): vai trò giáo viên/quản trị và trạng thái đã xác minh. Trạng thái được đọc lại từ máy chủ khi mở app, nên quyết định duyệt có hiệu lực ngay. Máy chủ vẫn là nơi chặn chính.

Vòng thiết kế–đánh giá–hiệu chỉnh: lần sửa đầu dùng khóa ghi cho mọi giao dịch và làm đăng nhập đồng loạt chỉ còn 29% thành công. Đo lại phát hiện vấn đề, sau đó tách giao dịch đọc và ghi, và các yêu cầu GET không còn ghi dữ liệu.

## Đo tải lớp học

40 học sinh và 1 giáo viên, 5 lần lặp. Trung vị qua 5 lần, đơn vị mili giây; "Thành công" là lần chạy thấp nhất. Kịch bản lớp học chạy 30 giây, nghỉ 1–3 giây giữa các lượt. Cột "Bản hiện tại" đo lại ngày 08/11/2026, sau khi thêm xác minh tài khoản, xác thực WebSocket bằng tin nhắn đầu và trang ma trận đề.

| Kịch bản | Thành công trước | p50 trước | p95 trước | Thành công sau sửa | p50 sau sửa | p95 sau sửa | Thành công bản hiện tại | p50 bản hiện tại | p95 bản hiện tại |
|---|---|---|---|---|---|---|---|---|---|
| `/health`, 100 yêu cầu, đồng thời 10 | 100% | 12,8 | 13,7 | 100% | 7,4 | 10,0 | 100% | 14,0 | 21,9 |
| Đọc danh mục, đồng thời 40 | 77% | 30.207 | 120.292 | 100% | 185 | 239 | 100% | 262 | 410 |
| 41 người đăng nhập cùng lúc | 100% | 8.693 | 14.825 | 100% | 1.601 | 1.710 | 100% | 1.791 | 1.899 |
| Làm quiz | 100% | 791 | 1.166 | 100% | 15,5 | 3.011 | 100% | 16,6 | 2.920 |
| Đồng bộ lô 20 sự kiện | 100% | 3.906 | 4.124 | 100% | 2.693 | 4.959 | 100% | 2.500 | 4.815 |
| Mở bảng học sinh | 100% | 8.233 | 10.029 | 100% | 764 | 810 | 100% | 680 | 731 |
| Phân tích giáo viên | 100% | 3.327 | 3.566 | 100% | 15,7 | 22,0 | 100% | 15,0 | 19,8 |
| Trợ lý dự phòng | 100% | 740 | 1.078 | 100% | 660 | 1.724 | 100% | 837 | 1.919 |
| Kịch bản lớp học | 65,8% | 60.702 | 181.011 | 100% | 16,7 | 1.104 | 100% | 18,6 | 1.469 |

WebSocket: trước khi sửa dừng ở 15 kết nối; sau khi sửa và ở bản hiện tại đều giữ 41/41 kết nối. Ở bản hiện tại, p95 từ lúc ghi đến khi giáo viên nhận tin là 12–37 ms qua 5 lần. Lần đo sau sửa và bản hiện tại có thêm 41 socket mở suốt kịch bản lớp học, lần đo trước thì không.

Cách đọc: p95 của các thao tác ghi (quiz, đồng bộ, trợ lý) cao vì SQLite chỉ cho một người ghi tại một thời điểm và các yêu cầu phải xếp hàng. Độ trễ lớn nhất trong kịch bản lớp học ở bản hiện tại là khoảng 21,6 giây (lần đo sau sửa: khoảng 19 giây). Bản hiện tại chậm hơn lần đo sau sửa ở đọc danh mục, đăng nhập, `/health` và p95 kịch bản lớp học; hai lần đo cách nhau vài tháng trên cùng máy nhưng trạng thái máy khác nhau, nên chưa tách được phần chênh do mã nguồn với phần do máy. Không có lỗi khóa hay hết pool trong cả 5 lần chạy, và hành trình đầu – cuối 7 bước qua HTTP đạt ở cả 5 lần. Kết quả này không suy rộng cho nhiều lớp, cho PostgreSQL hoặc cho mạng thực.

## Toàn vẹn dữ liệu

Cả 5 lần chạy đều cho cùng kết quả:

| Kiểm tra | Kết quả |
|---|---|
| 20 yêu cầu song song cùng `client_event_id` | 1 bản ghi |
| 10 lệnh kết thúc song song cùng một lượt quiz | Tính 1 lượt |
| 10 sự kiện đầu tiên song song cho một bài | 10 sự kiện, `view_count` = 10 |
| Tắt đột ngột máy chủ rồi gửi lại lô 30 sự kiện | Vẫn 30 bản ghi |
| Hành trình đầu-cuối 7 bước qua HTTP | Đạt |

Khóa hàng cho PostgreSQL (`with_for_update`) đã được thêm nhưng chưa chạy thử trên PostgreSQL.

## Thẩm định và thiết kế lại ngân hàng câu hỏi

Căn cứ: Chương trình môn Công nghệ (Thông tư 32/2018, năm thành phần năng lực công nghệ) và định dạng đề thi tốt nghiệp THPT từ 2025 theo Quyết định 764/QĐ-BGDĐT: 50 phút, Phần I 24 câu bốn phương án (0,25 điểm/câu), Phần II 4 câu đúng/sai, mỗi câu 4 ý (0,1; 0,25; 0,5; 1 điểm khi đúng 1, 2, 3, 4 ý). Các nguồn tổng hợp thống nhất về định dạng này, nhưng tôi chưa đọc được bản gốc của Quyết định và chưa tìm thấy ma trận chính thức cho môn này.

| Chỉ số | Bộ cũ | Bộ mới |
|---|---|---|
| Câu hỏi bài học | 146 | 146, giữ nguyên mã câu |
| Số phương án | 3 | 4 |
| Mẫu câu dẫn khác nhau | 2 | 146 |
| Câu dẫn lặp lại | 72 | 0 |
| Phương án sai khác nhau | 4 | 434 |
| Đáp án đúng là phương án dài nhất | 141/146 (97%) | 42/146 (29%) |
| Mức độ | không gắn | Biết 67, Hiểu 39, Vận dụng 40 |
| Năng lực công nghệ | không gắn | Gắn cho từng câu |
| Lời giải thích | không có | Có cho từng câu |
| Chùm đúng/sai 4 ý | không có | 19, mỗi chương một chùm |

Kết luận thẩm định bộ cũ: không đạt. 73 câu thứ hai của các bài là cùng một câu về cách học, 73 câu đầu chỉ hỏi "Nhận định nào đúng nhất" với đáp án sai dùng chung, nên học sinh chọn đúng mà không cần kiến thức bài học.

`frontend/src/data/thptBank10.js`, `thptBank11.js`, `thptBank12.js` chứa bộ mới. Khi máy chủ khởi động, `upgrade_template_questions` chỉ thay các câu còn nguyên văn mẫu cũ; câu giáo viên đã sửa và kết quả làm bài cũ được giữ. Trang `/thpt-exam` tạo đề 24 + 4 câu, 50 phút, chấm theo thang trên.

Giới hạn:

- Toàn bộ câu hỏi do AI soạn, chưa được giáo viên bộ môn thẩm định, chưa thử trên học sinh nên chưa có độ khó, độ phân biệt thực nghiệm. Nhãn mức độ là dự kiến của người soạn.
- Mỗi bài chỉ có 2 câu và mỗi chương 1 chùm đúng/sai; số đề khác nhau có hạn, chùm đúng/sai của lớp 12 sẽ lặp lại sau vài đề.
- Tỉ lệ đề luyện (lớp 10: 5, lớp 11: 7, lớp 12: 12 câu Phần I; tỉ lệ mức độ 40/30/30) là thiết kế của EngineLab, suy từ đề mẫu, không phải ma trận của Bộ.
- Đáp án trang đề luyện nằm trong mã giao diện vì đây là bài tự luyện; không dùng trang này để kiểm tra lấy điểm.
- Bộ đề theo chương (64 câu) chưa được soát lại.

## Ma trận đề kiểm tra theo chương

Trang `/chapter-exam` (liên kết từ Kho đề) có ma trận và đề kiểm tra cuối năm 45 phút cho lớp 10, 11, 12, theo cấu trúc của Công văn 7991/BGDĐT-GDTrH: 12 câu nhiều lựa chọn (3 điểm), 4 câu đúng – sai (4 điểm, vì không dùng dạng trả lời ngắn), 2 câu tự luận (3 điểm); tỉ lệ Biết 40% – Hiểu 30% – Vận dụng 30% do giáo viên chọn. Dữ liệu ở `frontend/src/data/chapterExams.js`.

- Kiểm thử bảo đảm mỗi ma trận đủ 10 điểm, đúng 4/3/3 điểm theo mức độ, mỗi chương có ít nhất một câu, tỉ lệ điểm mỗi chương lệch không quá 10 điểm phần trăm so với tỉ lệ số bài; đề mẫu khớp ma trận theo từng chương, mức độ, mẫu ý đúng – sai; đáp án rải đều A–D.
- "Đề mới" lấy Phần I ngẫu nhiên từ ngân hàng câu hỏi bài học, đúng số câu và mức độ của từng chương, không trùng câu; chương thiếu câu ở một mức thì giữ câu của đề mẫu. Phần II, III giữ như đề mẫu vì ngân hàng chỉ có một chùm đúng – sai mỗi chương và chưa có câu tự luận.
- Phần I, II chấm tự động (đúng – sai: 0,1/0,25/0,5/1 điểm cho 1/2/3/4 ý); Phần III hiện hướng dẫn chấm để giáo viên chấm. Giáo viên đã xác minh thấy nhãn chương – mức độ, nút Xem đáp án và In đề.

Giới hạn: ba đề mẫu do AI hỗ trợ soạn, chưa được tổ chuyên môn duyệt; đáp án nằm trong mã giao diện nên trang chỉ dùng để luyện tập. Để có ba đề không trùng câu mỗi khối cần thêm 27 câu nhiều lựa chọn, 25 chùm đúng – sai và 18 câu tự luận.

## Ngân hàng kiểm tra chương

Câu 4 lựa chọn và đúng–sai thuộc ngân hàng kiểm tra chương riêng ở giao diện (`knttChapterAssessmentBanks.js`): lớp 11 có 28 câu, lớp 12 có 36 câu, mỗi chương gồm 1 câu trắc nghiệm, 1 đúng–sai, 1 chọn nhiều và 1 ghép cặp.

## Điểm làm chủ và điểm tín hiệu

Các trọng số là quy tắc chuyên gia tạm thời, đặt tên trong `routes/progress.py`, và giao diện ghi rõ không dùng để chẩn đoán. Phân tích độ nhạy trên 896 trạng thái tổng hợp (không phải dữ liệu học sinh):

- Giảm 20% điểm "quiz dưới ngưỡng" (+45) đổi mức của 16,1% trạng thái, vì 36 điểm rơi xuống dưới ngưỡng 40.
- Tăng 20% từng trọng số không đổi mức nào.
- Đổi trọng số điểm làm chủ làm thứ hạng gần như không đổi (Spearman từ 0,96 trở lên).

Các trường hợp cần lưu ý, chưa thể gọi là sai dương hoặc sai âm vì chưa có dữ liệu kết quả học tập thực: học sinh vừa mở bài lần đầu nhận mức "Nên xem"; học sinh được 20 điểm quiz nhưng đã mở mô phỏng cũng chỉ ở mức "Nên xem". Khi chưa có quiz, hệ thống dùng điểm trung tính 50 và API báo `active_lessons_without_quiz`.

## Mô phỏng động cơ bốn kỳ

`frontend/src/utils/fourStrokeCycle.js` và `frontend/src/simulations/fourStrokeEngineModel.js` có kiểm thử cho: hai vòng quay trục khuỷu mỗi chu trình, trục cam quay nửa tốc độ, điểm chết trên và dưới, hướng pít tông, độ nâng xu páp ở từng kì, hành trình con đội, đũa đẩy và xu páp bằng nhau, tốc độ xích, chiều dài thanh truyền không đổi, pít tông không chạm xu páp, số xéc măng và tỉ số nén.

Mô hình được đối chiếu với Bài 17, 18, 19 SGK Công nghệ 11 - Công nghệ cơ khí (Kết nối tri thức). Việc đối chiếu dùng trang giải bài, tóm tắt lí thuyết và giáo án trên mạng, chưa dùng bản sách in, nên giáo viên bộ môn cần xác nhận lại với sách.

| Nội dung trong sách | Trong mô hình |
|---|---|
| Thuật ngữ: pít tông, xu páp, bu gi, các te, kì nổ | Dùng trên mô hình, bảng điều khiển và thẻ thí nghiệm; kì nổ ghi kèm "(cháy - giãn nở)" |
| Góc quay: nạp 0-180°, nén 180-360°, nổ 360-540°, thải 540-720° | Đúng như sách |
| Bu gi đánh lửa, vòi phun phun nhiên liệu cuối kì nén, gần ĐCT | Hiển thị từ 331° đến 364° |
| Xu páp treo (Hình 19.6): trục cam trong thân máy, bộ truyền xích, con đội, đũa đẩy, cò mổ | Dựng đủ chuỗi truyền động; đĩa xích trục cam lớn gấp đôi nên quay nửa tốc độ |
| Pít tông có xéc măng khí và xéc măng dầu | Hai xéc măng khí, một xéc măng dầu |
| Thanh truyền tiết diện chữ I; trục khuỷu có chốt khuỷu, má khuỷu, đối trọng | Có hình dạng và chọn được từng chi tiết |
| Thân máy, nắp máy, các te | Chọn được từng phần |
| S = 2R, Va = Vc + Vs, ε = Va/Vc | Bảng điều khiển hiện V theo % Va và ε theo tỉ lệ mô hình: xăng 11,0, Diesel 15,4 |

Khác với sách hoặc với động cơ thật, và đều được ghi chú trên giao diện: mô hình tách hai vấu cam sang hai bên thành hai trục cam để không che nhau; tỉ lệ kích thước không theo động cơ thật; xu páp đóng mở đúng tại ĐCT và ĐCD, không có góc mở sớm, đóng muộn. Khoảng tỉ số nén dùng trong kiểm thử (xăng 6-12, Diesel 14-25) lấy từ tài liệu của bộ Cánh diều vì chưa tìm thấy số liệu của bộ Kết nối tri thức. Các nguồn ghi kí hiệu thể tích công tác của động cơ khác nhau (Vh, Vn), nên mô hình chưa dùng kí hiệu này.

Các ngân hàng câu hỏi, nội dung bài học và dữ liệu bộ Cánh diều chưa được đổi thuật ngữ.

## Mô hình theo từng bài học

Trước đây mô hình gắn theo chương và nhiều chương dùng nhầm mô hình của môn khác: Hệ thống điện quốc gia hiện dây chuyền robot, Mạng điện trong nhà hiện máy tiện, Vi điều khiển hiện ô tô, Vẽ kĩ thuật hiện vật liệu cơ khí, Bài 17 và 19 lớp 11 mở mô hình 2 kì.

Nay mỗi bài của ba cuốn Kết nối tri thức (Thiết kế và công nghệ 10, Công nghệ cơ khí 11, Công nghệ điện - điện tử 12) có mô hình riêng trong `frontend/src/data/knttLessonModels.js`, dựng bằng `frontend/src/simulations/lessonFlowModel.js`. Bảy bài giữ mô hình vẽ riêng: lớp 11 Bài 12 (dây chuyền robot), Bài 17-19 (động cơ), Bài 21 (ô tô); lớp 12 Bài 21, 23 (bảng mạch logic). Kiểm thử bảo đảm không bài nào thiếu mô hình.

Giới hạn:

- Đây là mô hình khối thể hiện thành phần và trình tự, không phải mô phỏng vật lí hay bản dựng chi tiết của thiết bị.
- Thành phần và thuật ngữ lấy từ trang giải bài và giáo án trên mạng, chưa đối chiếu với sách in. Riêng lớp 12 Bài 13-18, 20, 23, 26 và lớp 11 Bài 10, lớp 10 Bài 1, 4, 22 chưa có trang giải đầy đủ nên dựa trên tên bài, nội dung bài trong app và hiểu biết chung; giáo viên cần soát kĩ các bài này.
- Một số tên bài trong app khác với trang giải bài (lớp 10 Bài 7, Bài 13; lớp 11 Bài 13, Bài 23; lớp 12 Bài 7) và chưa được sửa.

## Soát mô hình 3D theo SGK và chế độ VR

Các mô hình vẽ riêng được soát lại với nội dung SGK Kết nối tri thức (qua trang giải bài, chưa đối chiếu sách in). Lỗi tìm thấy và cách sửa:

| Bài | Lỗi | Đã sửa |
|---|---|---|
| Lớp 11 Bài 4 | Mô hình lò cao sản xuất gang - thép, trong khi bài học phân loại vật liệu kim loại; nội dung bài trong app cũng viết theo lò cao | Thay bằng bốn mẫu: gang (C > 2,14%), thép (C ≤ 2,14%), nhôm và hợp kim nhôm, đồng và hợp kim đồng. Viết lại mục tiêu, ý chính, thẻ thí nghiệm; xóa mã lò cao |
| Lớp 11 Bài 18, động cơ 2 kì | Pít tông chạy theo hàm cos, trục khuỷu quay độc lập, thanh truyền đổi chiều dài, hành trình khác 2R; pít tông quá ngắn nên không bao giờ che cửa nạp; mũi tên dòng khí nhấp nháy cả khi cửa đóng; không mở được mô hình 2 kì trong Bài 18 | Cơ cấu trục khuỷu - thanh truyền tính đúng (rontend/src/simulations/twoStrokeKinematics.js): S = 2R, thanh truyền giữ chiều dài. Cửa thải, cửa quét do đỉnh pít tông đóng mở, cửa thải mở trước; cửa nạp do váy pít tông mở gần ĐCT. Mũi tên chỉ sáng khi cửa mở; bu gi đánh lửa cuối kì nén; lớp kiến thức hiện theo vị trí thật của pít tông. Bài 18 có thêm nút chuyển sang động cơ 2 kì |
| Lớp 11 Bài 21, ô tô | Bánh xe dựng sai trục (trục bánh dọc thân xe) và quay quanh trục đứng; gộp lái với phanh; thiếu hệ thống điện - điện tử; gọi "thân vỏ" thay cho "khung vỏ" | Bánh xe quay quanh trục ngang. Bảy lớp theo sách: động cơ, truyền lực (hộp số, trục các đăng, vi sai, bán trục), bánh xe - treo, lái, phanh, khung vỏ, điện - điện tử |
| Lớp 11 Bài 12, dây chuyền robot | Máy CNC và một tay robot, trong khi bài học nói băng tải và các robot vận chuyển, lắp ráp, hỗ trợ (hàn, phun sơn) | Dựng lại: băng tải chở sản phẩm và ba robot có khớp vai, khuỷu, dụng cụ riêng |
| Lớp 12 Bài 21, 23, bảng mạch logic | Có khối vi điều khiển, là nội dung Chương IX (Bài 24 trở đi) | Bỏ khối vi điều khiển; cổng logic nối thẳng tới driver |

Kiểm thử mới: 	woStrokeKinematics.test.js (S = 2R; thanh truyền không đổi chiều dài; ở ĐCD cửa thải, cửa quét mở và cửa nạp bị che; gần ĐCT ngược lại; cửa thải mở trước cửa quét; cửa nạp không mở cùng lúc với cửa thải; thứ tự cháy - giãn nở → thải - quét → nén → nạp vào các te; bu gi chỉ đánh lửa cuối kì nén).

**Chế độ VR (WebXR).** Khi trình duyệt báo có kính thực tế ảo (Meta Quest, Pico, hoặc điện thoại có trình xem WebXR), trang mô phỏng hiện nút "Xem bằng VR". Trong kính, mô hình được thu về cao khoảng 1,1 m, đặt trước mặt người xem ở độ cao 1,1 m; nhãn chữ chuyển thành bảng nổi luôn quay về phía người xem; nút cò của tay cầm chuyển lớp kiến thức, nút bóp tạm dừng hoặc chạy tiếp. Máy không có WebXR thì không hiện nút. Kiểm thử rSupport.test.js kiểm tra phát hiện WebXR, vị trí, tỉ lệ mô hình trong kính và cách ngắt dòng nhãn. Trên trình duyệt máy tính đã kiểm tra nút VR hiện ra khi giả lập WebXR và báo lỗi rõ ràng khi không mở được phiên. **Chưa thử trên kính thật.**
## Trợ lý AI

Chưa đánh giá Gemini trực tuyến. Kiểm thử chỉ xác nhận lớp tích hợp, xử lý lỗi và nhãn `response_mode`. `data/ai_tutor_eval_set.json` có 13 câu về đúng nội dung, ảo giác, an toàn, riêng tư và sư phạm; chạy bằng `scripts/evaluate_ai_tutor.py` khi có khóa. Kết quả từ khóa chỉ để sàng lọc, giáo viên phải chấm theo rubric.

## Xác minh tài khoản

| Vai trò | Khi đăng kí | Ai xác minh | Trước khi xác minh | Sau khi xác minh |
|---|---|---|---|---|
| Giáo viên | Chờ xác minh | Quản trị viên, kèm gán lớp | Đăng nhập được nhưng không có quyền giáo viên, không xem được dữ liệu lớp | Quyền giáo viên trong các lớp được gán |
| Học sinh có lớp | Chờ xác nhận | Giáo viên của lớp hoặc quản trị viên | Tự học bình thường, chưa thuộc danh sách lớp, giáo viên chưa xem được dữ liệu | Vào danh sách lớp |
| Học sinh không có lớp | Đã xác minh | Không cần | Tự học | Tự học |
| Quản trị viên | Không đăng kí qua web | Tạo bằng `scripts/create_admin.py` | | |

Tài khoản bị từ chối không đăng nhập được và token cũ mất hiệu lực. Từ chối bắt buộc có lí do. Mọi quyết định và lần gán lớp đều lưu trong bảng `account_reviews`. Tài khoản có sẵn trước tính năng này giữ trạng thái đã xác minh.

Giáo viên có thêm các công cụ:

- **Mã lớp:** 8 kí tự, tạo cho lớp mình phụ trách, có hạn (1–30 ngày) và số lượt (1–100). Mỗi lớp chỉ có một mã còn hiệu lực. Học sinh nhập đúng mã được xác nhận ngay; lớp lấy từ mã, không lấy từ phần học sinh tự khai. Nhập sai 10 lần trong 10 phút thì bị chặn tạm thời (đếm theo địa chỉ IP, trong từng tiến trình máy chủ).
- **Duyệt hàng loạt:** tối đa 100 học sinh một lần; tài khoản ngoài phạm vi được báo lại và không bị thay đổi.
- **Danh sách lớp:** gỡ học sinh xác nhận nhầm hoặc mở lại tài khoản bị từ chối, bắt buộc ghi lí do.

Mã lớp chỉ chứng minh người đăng kí đã nhận được mã, không chứng minh danh tính: mã bị chia sẻ ra ngoài thì người ngoài vẫn vào được cho đến khi giáo viên thu hồi.

Tạo quản trị viên đầu tiên:

```bash
cd backend
python scripts/create_admin.py --username admin --email admin@truong.edu.vn
```

Giới hạn: hệ thống chưa kiểm tra thân phận thật (email trường, giấy tờ); người duyệt chịu trách nhiệm đối chiếu.

## Chưa thực hiện

- Đo tải và kiểm thử đồng thời trên PostgreSQL, nhiều tiến trình, mạng thực.
- Đánh giá Gemini trực tuyến, kiểm định ngân hàng câu hỏi, thẩm định độc lập.
- Đánh giá khả dụng và thực nghiệm sư phạm với giáo viên, học sinh.
- Hiệu năng 3D trên máy học sinh chưa đo.
- Chế độ VR chưa thử trên kính thật.
