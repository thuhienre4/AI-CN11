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
| Máy chủ (pytest) | 8 ca | 205 ca, tất cả đạt |
| Độ phủ máy chủ (dòng và nhánh, đo ở 160 ca) | 49% | 71% |
| Giao diện (Vitest) | 2 ca | 31 ca, tất cả đạt |

Bộ máy chủ gồm: quét mọi endpoint được bảo vệ với người dùng ẩn danh, học sinh gọi endpoint của giáo viên, truy cập chéo giữa học sinh, token giả/hết hạn/`alg: none`, WebSocket, gửi lại sự kiện, lỗi nhà cung cấp AI (giả lập tầng mạng), biên của Risk Score, toàn vẹn danh mục.

Giới hạn còn lại: `routes/lessons.py`, `materials.py`, `nova3d.py`, `questions.py` có độ phủ dưới 40%. Các trang React chưa có kiểm thử thành phần. Lần đo trước khi bổ sung kiểm thử cho toàn bộ `frontend/src` cho độ phủ 11% số dòng.

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

Vòng thiết kế–đánh giá–hiệu chỉnh: lần sửa đầu dùng khóa ghi cho mọi giao dịch và làm đăng nhập đồng loạt chỉ còn 29% thành công. Đo lại phát hiện vấn đề, sau đó tách giao dịch đọc và ghi, và các yêu cầu GET không còn ghi dữ liệu.

## Đo tải lớp học

40 học sinh và 1 giáo viên, 5 lần lặp. Trung vị qua 5 lần, đơn vị mili giây; "Thành công" là lần chạy thấp nhất. Kịch bản lớp học chạy 30 giây, nghỉ 1–3 giây giữa các lượt.

| Kịch bản | Thành công trước | p50 trước | p95 trước | Thành công sau | p50 sau | p95 sau |
|---|---|---|---|---|---|---|
| `/health`, 100 yêu cầu, đồng thời 10 | 100% | 12,8 | 13,7 | 100% | 7,4 | 10,0 |
| Đọc danh mục, đồng thời 40 | 77% | 30.207 | 120.292 | 100% | 185 | 239 |
| 41 người đăng nhập cùng lúc | 100% | 8.693 | 14.825 | 100% | 1.601 | 1.710 |
| Làm quiz | 100% | 791 | 1.166 | 100% | 15,5 | 3.011 |
| Đồng bộ lô 20 sự kiện | 100% | 3.906 | 4.124 | 100% | 2.693 | 4.959 |
| Mở bảng học sinh | 100% | 8.233 | 10.029 | 100% | 764 | 810 |
| Phân tích giáo viên | 100% | 3.327 | 3.566 | 100% | 15,7 | 22,0 |
| Trợ lý dự phòng | 100% | 740 | 1.078 | 100% | 660 | 1.724 |
| Kịch bản lớp học | 65,8% | 60.702 | 181.011 | 100% | 16,7 | 1.104 |

WebSocket: trước khi sửa dừng ở 15 kết nối; sau khi sửa 41/41 kết nối, p95 từ lúc ghi đến khi giáo viên nhận tin 13–23 ms. Lần đo sau có thêm 41 socket mở suốt kịch bản lớp học, lần đo trước thì không.

Cách đọc: p95 của các thao tác ghi (quiz, đồng bộ, trợ lý) tăng so với trước vì SQLite chỉ cho một người ghi tại một thời điểm và các yêu cầu phải xếp hàng. Độ trễ lớn nhất trong kịch bản lớp học lên tới khoảng 19 giây. Không có lỗi khóa hay hết pool trong cả 5 lần chạy. Kết quả này không suy rộng cho nhiều lớp, cho PostgreSQL hoặc cho mạng thực.

Phép đo trên được thực hiện trước khi thêm mô hình động cơ mới và tính năng xác minh tài khoản; chưa đo lại.

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

## Ngân hàng câu hỏi

`scripts/audit_question_bank.py` cho kết quả sau trên ngân hàng phía máy chủ:

- 146 câu trắc nghiệm một đáp án, mỗi câu 3 phương án, tổng 438 phương án. Không có câu đúng–sai.
- 73 câu mức dễ, 73 câu mức trung bình; lớp 10, 11, 12 lần lượt có 44, 50, 52 câu.
- **Hạn chế về nội dung:** chỉ có 2 mẫu thân câu và 4 phương án nhiễu dùng chung; 141/146 câu có đáp án đúng là phương án dài nhất. Ngân hàng này chưa đủ làm công cụ đánh giá và cần giáo viên bộ môn biên soạn lại.

Câu 4 lựa chọn và đúng–sai thuộc ngân hàng kiểm tra chương riêng ở giao diện (`knttChapterAssessmentBanks.js`): lớp 11 có 28 câu, lớp 12 có 36 câu, mỗi chương gồm 1 câu trắc nghiệm, 1 đúng–sai, 1 chọn nhiều và 1 ghép cặp.

## Điểm làm chủ và điểm tín hiệu

Các trọng số là quy tắc chuyên gia tạm thời, đặt tên trong `routes/progress.py`, và giao diện ghi rõ không dùng để chẩn đoán. Phân tích độ nhạy trên 896 trạng thái tổng hợp (không phải dữ liệu học sinh):

- Giảm 20% điểm "quiz dưới ngưỡng" (+45) đổi mức của 16,1% trạng thái, vì 36 điểm rơi xuống dưới ngưỡng 40.
- Tăng 20% từng trọng số không đổi mức nào.
- Đổi trọng số điểm làm chủ làm thứ hạng gần như không đổi (Spearman từ 0,96 trở lên).

Các trường hợp cần lưu ý, chưa thể gọi là sai dương hoặc sai âm vì chưa có dữ liệu kết quả học tập thực: học sinh vừa mở bài lần đầu nhận mức "Nên xem"; học sinh được 20 điểm quiz nhưng đã mở mô phỏng cũng chỉ ở mức "Nên xem". Khi chưa có quiz, hệ thống dùng điểm trung tính 50 và API báo `active_lessons_without_quiz`.

## Mô phỏng động cơ bốn kỳ

`frontend/src/utils/fourStrokeCycle.js` và `frontend/src/simulations/fourStrokeEngineModel.js` có kiểm thử cho: hai vòng quay trục khuỷu mỗi chu trình, trục cam quay nửa tốc độ, điểm chết trên và dưới, hướng piston, độ nâng xupap ở từng kỳ, chiều dài thanh truyền không đổi và piston không chạm xupap. Mô hình bỏ qua góc mở sớm, đóng muộn của xupap và góc đánh lửa sớm, và giao diện có ghi chú điều này. Việc đối chiếu với tài liệu chuyên môn cần giáo viên bộ môn xác nhận.

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

Giới hạn: hệ thống chưa kiểm tra thân phận thật (email trường, giấy tờ); người duyệt chịu trách nhiệm đối chiếu. Giao diện vẫn hiện một số nút giáo viên cho tài khoản chờ duyệt, nhưng máy chủ từ chối các thao tác đó.

## Chưa thực hiện

- Đo tải và kiểm thử đồng thời trên PostgreSQL, nhiều tiến trình, mạng thực.
- Đánh giá Gemini trực tuyến, kiểm định ngân hàng câu hỏi, thẩm định độc lập.
- Đánh giá khả dụng và thực nghiệm sư phạm với giáo viên, học sinh.
- Token WebSocket vẫn nằm trên URL; hiệu năng 3D trên máy học sinh chưa đo.
