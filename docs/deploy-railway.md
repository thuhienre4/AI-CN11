# Triển khai máy chủ EngineLab lên Railway

Hướng dẫn này thêm máy chủ FastAPI (thư mục `backend`) thành một service mới trong project Railway đang chạy giao diện. Sau khi làm xong, tài khoản, lớp học, bài nộp, học liệu và tiến độ được lưu chung trên máy chủ thay vì trên từng máy.

Cấu hình dùng SQLite đặt trên một Volume của Railway, là cấu hình đã được kiểm thử và đo tải (một lớp 40 học sinh, xem `docs/verification.md`). PostgreSQL được hỗ trợ trong mã nhưng chưa được đo.

## 1. Tạo service backend

1. Mở project Railway đang chứa service giao diện (`ai-cn11-production`).
2. Bấm **New → GitHub Repo → thuhienre4/AI-CN11**. Đặt tên service là `backend`.
3. Vào **Settings** của service mới:
   - **Root Directory:** `/backend`
   - **Config-as-code → Railway Config File:** `/backend/railway.toml` (Railway không tự tìm tệp này trong thư mục gốc của service, nên phải ghi đường dẫn đầy đủ).
   - **Replicas:** 1. Không tăng: cơ sở dữ liệu SQLite nằm trên volume chỉ một máy dùng được.

Tệp `backend/railway.toml` đã khai báo: dựng bằng `backend/Dockerfile`, kiểm tra sức khỏe ở `/health`, tự khởi động lại khi lỗi.

## 2. Gắn Volume

Bấm chuột phải vào service `backend` → **Attach Volume**, đường dẫn gắn (**Mount path**): `/data`.

Cơ sở dữ liệu và tệp tải lên (học liệu, bài nộp) đều nằm trong `/data`, nên không mất khi triển khai lại.

## 3. Biến môi trường của service backend

Vào **Variables** của service `backend`, thêm:

| Biến | Giá trị | Ghi chú |
|---|---|---|
| `ENGINE_LAB_ENVIRONMENT` | `production` | Máy chủ từ chối khởi động nếu khóa bí mật còn giá trị mặc định |
| `ENGINE_LAB_SECRET_KEY` | một chuỗi ngẫu nhiên dài | Tạo bằng lệnh `python -c "import secrets; print(secrets.token_urlsafe(48))"`. Không chia sẻ, không đưa lên GitHub. Đổi khóa này thì mọi người phải đăng nhập lại |
| `ENGINE_LAB_DATABASE_URL` | `sqlite:////data/enginelab.db` | Bốn dấu `/` là đúng: đường dẫn tuyệt đối `/data/...` |
| `ENGINE_LAB_UPLOAD_DIR` | `/data/uploads` | Nơi lưu học liệu và bài nộp |
| `ENGINE_LAB_TRUSTED_PROXY_HOPS` | `1` | Để giới hạn số lần đoán mã lớp tính theo địa chỉ của từng học sinh, không phải địa chỉ proxy của Railway |
| `ENGINE_LAB_CORS_ORIGINS` | `["https://ai-cn11-production.up.railway.app","https://thuhienre4.github.io"]` | Các trang giao diện được gọi API. Ghi đúng dạng JSON, có ngoặc vuông và dấu nháy kép |
| `ENGINE_LAB_BOOTSTRAP_ADMIN_USERNAME` | ví dụ `admin_truong` | Quản trị viên đầu tiên, xem bước 5 |
| `ENGINE_LAB_BOOTSTRAP_ADMIN_EMAIL` | email của quản trị viên | |
| `ENGINE_LAB_BOOTSTRAP_ADMIN_PASSWORD` | mật khẩu ít nhất 8 kí tự | **Xóa biến này sau lần khởi động đầu tiên** |
| `GEMINI_API_KEY` | khóa Gemini (không bắt buộc) | Không có khóa thì trợ lý AI dùng phản hồi dự phòng |

## 4. Tạo địa chỉ cho backend

Vào **Settings → Networking → Generate Domain** của service `backend`. Railway cấp một địa chỉ dạng `https://backend-production-xxxx.up.railway.app`. Mở `<địa chỉ>/health`, thấy `{"status":"healthy", ...}` là máy chủ đã chạy.

## 5. Quản trị viên đầu tiên

Khi khởi động, nếu hệ thống chưa có quản trị viên nào, máy chủ tạo tài khoản theo ba biến `ENGINE_LAB_BOOTSTRAP_ADMIN_*`. Nhật kí (**Deployments → View Logs**) sẽ có dòng `Bootstrap admin created`.

- Nếu tên đăng nhập đó đã có người đăng kí, máy chủ chỉ nâng quyền khi mật khẩu khớp; nếu không khớp thì bỏ qua và ghi cảnh báo.
- Khi đã có quản trị viên, các biến này không còn tác dụng. **Xóa `ENGINE_LAB_BOOTSTRAP_ADMIN_PASSWORD`** để mật khẩu không còn nằm trong cấu hình.

Quản trị viên đăng nhập trên giao diện, vào mục **Xác minh** để duyệt tài khoản giáo viên và gán lớp.

## 6. Nối giao diện với backend

1. **Service giao diện trên Railway:** vào **Variables**, thêm `VITE_API_URL` = địa chỉ backend ở bước 4 (không có `/` ở cuối), rồi **Redeploy**. Biến này được dùng khi dựng giao diện (`ARG VITE_API_URL` trong `Dockerfile` ở thư mục gốc), nên phải triển khai lại mới có hiệu lực.
2. **GitHub Pages (nếu vẫn dùng):** trên GitHub vào **Settings → Secrets and variables → Actions → Variables**, thêm `VITE_API_URL` cùng giá trị, rồi chạy lại workflow **Deploy Frontend to GitHub Pages**.

## 7. Kiểm tra sau khi triển khai

- `<địa chỉ backend>/health` trả `healthy`.
- Mở trang giao diện, đăng nhập bằng quản trị viên: không còn chế độ "lưu trên máy" (token không bắt đầu bằng `local-token-`).
- Đăng kí thử một tài khoản giáo viên, duyệt bằng quản trị viên, gán lớp; đăng kí một học sinh vào lớp đó; học sinh làm bài kiểm tra nhanh và giáo viên thấy kết quả trong trang Lớp học.
- Triển khai lại backend một lần: tài khoản và học liệu vẫn còn (nhờ volume).

## Sao lưu

Volume là bản duy nhất của dữ liệu. Dùng **Backups** của volume trên Railway (nếu gói tài khoản có) hoặc định kì tải về tệp `/data/enginelab.db`.

## Giới hạn

- Một tiến trình, một cơ sở dữ liệu SQLite: đã đo ở quy mô một lớp 40 học sinh; nhiều lớp làm bài cùng lúc chưa được đo.
- Muốn chuyển sang PostgreSQL: thêm dịch vụ PostgreSQL trên Railway và đặt `ENGINE_LAB_DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (mã tự đổi sang trình điều khiển psycopg). Cấu hình này chưa được kiểm thử và đo tải, dữ liệu SQLite cũ không tự chuyển sang.
- Tệp `backend/Dockerfile` chưa được dựng thử trên máy (máy phát triển không có Docker); máy chủ đã được chạy thử với đúng các biến ở bước 3.
