import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSampleLesson } from '../data/courseCatalog'
import { useAuthStore } from '../store'

const STORAGE_KEY = 'enginelab_system_designs_v2'
const BLOCK_WIDTH = 220
const BLOCK_HEIGHT = 116
const CANVAS_WIDTH = 980
const CANVAS_HEIGHT = 680

const blockTypes = [
  { type: 'requirement', label: 'Yêu cầu kĩ thuật', color: 'border-slate-400 bg-white', stroke: '#0f2438' },
  { type: 'design', label: 'Thiết kế / bản vẽ', color: 'border-blue-300 bg-blue-50', stroke: '#1f4e79' },
  { type: 'material', label: 'Vật liệu', color: 'border-amber-300 bg-amber-50', stroke: '#b7791f' },
  { type: 'processing', label: 'Gia công', color: 'border-orange-300 bg-orange-50', stroke: '#e2661f' },
  { type: 'assembly', label: 'Lắp ráp', color: 'border-slate-300 bg-slate-50', stroke: '#475569' },
  { type: 'inspection', label: 'Kiểm tra', color: 'border-emerald-300 bg-emerald-50', stroke: '#1d7a55' },
  { type: 'safety', label: 'An toàn', color: 'border-red-300 bg-red-50', stroke: '#c2362b' },
  { type: 'control', label: 'Điều khiển', color: 'border-violet-300 bg-violet-50', stroke: '#604675' },
  { type: 'power', label: 'Nguồn động lực', color: 'border-rose-300 bg-rose-50', stroke: '#be123c' },
  { type: 'transmission', label: 'Truyền lực', color: 'border-cyan-300 bg-cyan-50', stroke: '#24646d' },
  { type: 'air', label: 'Nạp khí', color: 'border-sky-200 bg-white', stroke: '#6585a8' },
  { type: 'fuel', label: 'Nhiên liệu', color: 'border-yellow-300 bg-yellow-50', stroke: '#a16207' },
  { type: 'ignition', label: 'Đánh lửa', color: 'border-yellow-300 bg-yellow-50', stroke: '#eab308' },
  { type: 'cylinder', label: 'Xi lanh', color: 'border-blue-300 bg-blue-50', stroke: '#1f4e79' },
  { type: 'crank', label: 'Cơ cấu trục khuỷu', color: 'border-slate-300 bg-slate-50', stroke: '#334155' },
  { type: 'cooling', label: 'Làm mát', color: 'border-cyan-300 bg-cyan-50', stroke: '#317d87' },
  { type: 'lubrication', label: 'Bôi trơn', color: 'border-lime-300 bg-lime-50', stroke: '#65a30d' },
  { type: 'exhaust', label: 'Xả khí', color: 'border-emerald-300 bg-emerald-50', stroke: '#10b981' },
  { type: 'chassis', label: 'Khung gầm', color: 'border-zinc-300 bg-zinc-50', stroke: '#52525b' },
  { type: 'brake', label: 'Phanh', color: 'border-red-300 bg-red-50', stroke: '#ef4444' },
  { type: 'steering', label: 'Lái', color: 'border-teal-300 bg-teal-50', stroke: '#317d87' },
  { type: 'electrical', label: 'Điện - điều khiển', color: 'border-purple-300 bg-purple-50', stroke: '#604675' },
  { type: 'source', label: 'Nguồn / tín hiệu vào', color: 'border-yellow-300 bg-yellow-50', stroke: '#ca8a04' },
  { type: 'grid', label: 'Lưới điện', color: 'border-sky-300 bg-sky-50', stroke: '#1f4e79' },
  { type: 'load', label: 'Phụ tải / đầu ra', color: 'border-emerald-300 bg-emerald-50', stroke: '#059669' },
  { type: 'protection', label: 'Bảo vệ', color: 'border-red-300 bg-red-50', stroke: '#dc2626' },
  { type: 'sensor', label: 'Cảm biến', color: 'border-cyan-300 bg-cyan-50', stroke: '#24646d' },
  { type: 'logic', label: 'Logic / xử lí', color: 'border-violet-300 bg-violet-50', stroke: '#604675' },
  { type: 'program', label: 'Chương trình', color: 'border-indigo-300 bg-indigo-50', stroke: '#1f4e79' },
  { type: 'actuator', label: 'Cơ cấu chấp hành', color: 'border-orange-300 bg-orange-50', stroke: '#c55315' },
  { type: 'feedback', label: 'Phản hồi', color: 'border-lime-300 bg-lime-50', stroke: '#65a30d' },
]

const engineTemplate = {
  title: 'Sơ đồ hệ thống động cơ đốt trong',
  description:
    'Thể hiện các dòng không khí, nhiên liệu, tia lửa, khí thải và sự biến đổi lực sinh công thành chuyển động quay.',
  palette: ['air', 'fuel', 'ignition', 'cylinder', 'crank', 'cooling', 'lubrication', 'exhaust'],
  blocks: [
    { id: 'air', type: 'air', title: 'Lọc gió / đường nạp', note: 'Lọc bụi và dẫn không khí sạch vào xi lanh.', x: 70, y: 145 },
    { id: 'fuel', type: 'fuel', title: 'Bơm / kim phun', note: 'Cấp nhiên liệu đúng lượng để tạo hỗn hợp cháy.', x: 70, y: 330 },
    { id: 'ignition', type: 'ignition', title: 'Bugi / đánh lửa', note: 'Tạo tia lửa ở cuối kì nén để đốt cháy hỗn hợp.', x: 380, y: 55 },
    { id: 'cylinder', type: 'cylinder', title: 'Xi lanh - piston', note: 'Nơi diễn ra các kì nạp, nén, cháy và thải.', x: 380, y: 235 },
    { id: 'crank', type: 'crank', title: 'Thanh truyền - trục khuỷu', note: 'Biến chuyển động tịnh tiến của piston thành chuyển động quay.', x: 380, y: 430 },
    { id: 'cooling', type: 'cooling', title: 'Hệ thống làm mát', note: 'Lấy bớt nhiệt để động cơ làm việc ổn định.', x: 690, y: 120 },
    { id: 'lubrication', type: 'lubrication', title: 'Hệ thống bôi trơn', note: 'Đưa dầu tới bề mặt ma sát để giảm mài mòn.', x: 690, y: 310 },
    { id: 'exhaust', type: 'exhaust', title: 'Đường xả', note: 'Dẫn khí thải ra ngoài sau quá trình cháy.', x: 690, y: 500 },
  ],
  links: [
    { id: 'l1', from: 'air', to: 'cylinder', label: 'không khí' },
    { id: 'l2', from: 'fuel', to: 'cylinder', label: 'nhiên liệu' },
    { id: 'l3', from: 'ignition', to: 'cylinder', label: 'tia lửa' },
    { id: 'l4', from: 'cylinder', to: 'crank', label: 'lực sinh công' },
    { id: 'l5', from: 'cooling', to: 'cylinder', label: 'trao đổi nhiệt' },
    { id: 'l6', from: 'lubrication', to: 'crank', label: 'dầu bôi trơn' },
    { id: 'l7', from: 'cylinder', to: 'exhaust', label: 'khí thải' },
  ],
}

const manufacturingTemplate = {
  title: 'Sơ đồ quy trình tạo sản phẩm cơ khí',
  description:
    'Thể hiện trình tự cơ bản: xác định yêu cầu, thiết kế, chọn vật liệu, gia công, lắp ráp, kiểm tra và đưa vào sử dụng.',
  palette: ['requirement', 'design', 'material', 'processing', 'assembly', 'inspection', 'safety'],
  blocks: [
    { id: 'requirement', type: 'requirement', title: 'Xác định yêu cầu', note: 'Làm rõ công dụng, điều kiện làm việc, kích thước, độ bền, độ chính xác và yêu cầu an toàn của sản phẩm.', x: 70, y: 120 },
    { id: 'design', type: 'design', title: 'Thiết kế / lập bản vẽ', note: 'Đề xuất cấu tạo, tính toán sơ bộ và thể hiện chi tiết bằng bản vẽ kĩ thuật hoặc mô hình.', x: 350, y: 120 },
    { id: 'material', type: 'material', title: 'Chọn vật liệu', note: 'Chọn vật liệu phù hợp cơ tính, công dụng, khả năng gia công, giá thành và điều kiện sử dụng.', x: 630, y: 120 },
    { id: 'processing', type: 'processing', title: 'Gia công chi tiết', note: 'Tạo hình chi tiết bằng đúc, hàn, gia công áp lực, cắt gọt hoặc phương pháp phù hợp.', x: 70, y: 360 },
    { id: 'assembly', type: 'assembly', title: 'Lắp ráp', note: 'Ghép các chi tiết thành cụm hoặc sản phẩm hoàn chỉnh theo đúng trình tự công nghệ.', x: 350, y: 360 },
    { id: 'inspection', type: 'inspection', title: 'Kiểm tra chất lượng', note: 'Đo kiểm kích thước, hình dạng, độ chính xác, khả năng làm việc và mức độ an toàn.', x: 630, y: 360 },
  ],
  links: [
    { id: 'm1', from: 'requirement', to: 'design', label: 'nhiệm vụ thiết kế' },
    { id: 'm2', from: 'design', to: 'material', label: 'căn cứ chọn' },
    { id: 'm3', from: 'material', to: 'processing', label: 'phôi / vật liệu' },
    { id: 'm4', from: 'processing', to: 'assembly', label: 'chi tiết đạt yêu cầu' },
    { id: 'm5', from: 'assembly', to: 'inspection', label: 'sản phẩm' },
    { id: 'm6', from: 'inspection', to: 'design', label: 'phản hồi cải tiến' },
  ],
}

const materialTemplate = {
  title: 'Sơ đồ lựa chọn vật liệu và gia công cơ khí',
  description:
    'Thể hiện mối quan hệ giữa yêu cầu làm việc, tính chất vật liệu, phương pháp tạo phôi, gia công và đo kiểm.',
  palette: ['requirement', 'material', 'processing', 'inspection', 'safety'],
  blocks: [
    { id: 'requirement', type: 'requirement', title: 'Yêu cầu chi tiết', note: 'Xác định tải trọng, ma sát, nhiệt độ, môi trường làm việc, khối lượng và tuổi thọ cần đạt.', x: 70, y: 110 },
    { id: 'material', type: 'material', title: 'Chọn vật liệu', note: 'So sánh kim loại, phi kim và composite theo độ bền, độ cứng, tính dẻo, khả năng chống ăn mòn và giá thành.', x: 380, y: 110 },
    { id: 'blank', type: 'processing', title: 'Tạo phôi', note: 'Chọn đúc, hàn, gia công áp lực hoặc phương pháp tạo phôi phù hợp hình dạng và số lượng sản phẩm.', x: 690, y: 110 },
    { id: 'machining', type: 'processing', title: 'Gia công cắt gọt', note: 'Dùng tiện, phay, khoan, mài... để đạt kích thước, hình dạng và độ nhẵn bề mặt yêu cầu.', x: 220, y: 360 },
    { id: 'inspection', type: 'inspection', title: 'Đo kiểm', note: 'Kiểm tra kích thước, sai số, độ nhẵn và phát hiện khuyết tật trước khi sử dụng hoặc lắp ráp.', x: 540, y: 360 },
  ],
  links: [
    { id: 'v1', from: 'requirement', to: 'material', label: 'điều kiện làm việc' },
    { id: 'v2', from: 'material', to: 'blank', label: 'vật liệu phù hợp' },
    { id: 'v3', from: 'blank', to: 'machining', label: 'phôi' },
    { id: 'v4', from: 'machining', to: 'inspection', label: 'chi tiết gia công' },
    { id: 'v5', from: 'inspection', to: 'requirement', label: 'đối chiếu yêu cầu' },
  ],
}

const safetyTemplate = {
  title: 'Sơ đồ quy trình an toàn trong sản xuất cơ khí',
  description:
    'Thể hiện các bước phòng ngừa tai nạn: nhận diện nguy cơ, dùng bảo hộ, kiểm tra máy, vận hành đúng quy trình và xử lí bất thường.',
  palette: ['safety', 'requirement', 'processing', 'control', 'inspection'],
  blocks: [
    { id: 'hazard', type: 'safety', title: 'Nhận diện nguy cơ', note: 'Xác định nguy cơ từ bộ phận quay, vật sắc, phoi nóng, điện, tiếng ồn, bụi và hóa chất.', x: 70, y: 120 },
    { id: 'ppe', type: 'safety', title: 'Trang bị bảo hộ', note: 'Dùng kính, găng tay phù hợp, giày, quần áo gọn gàng và phương tiện bảo vệ khi cần.', x: 350, y: 120 },
    { id: 'check', type: 'inspection', title: 'Kiểm tra trước khi vận hành', note: 'Kiểm tra che chắn, nút dừng khẩn cấp, dụng cụ gá kẹp, dây điện và tình trạng máy.', x: 630, y: 120 },
    { id: 'operate', type: 'processing', title: 'Vận hành đúng quy trình', note: 'Làm theo hướng dẫn, tập trung, không đùa nghịch, không chạm vào bộ phận chuyển động.', x: 220, y: 360 },
    { id: 'response', type: 'control', title: 'Xử lí bất thường', note: 'Dừng máy, ngắt nguồn khi cần, báo giáo viên hoặc người phụ trách và không tự ý sửa khi chưa được phép.', x: 540, y: 360 },
  ],
  links: [
    { id: 's1', from: 'hazard', to: 'ppe', label: 'biện pháp phòng tránh' },
    { id: 's2', from: 'ppe', to: 'check', label: 'chuẩn bị làm việc' },
    { id: 's3', from: 'check', to: 'operate', label: 'đủ điều kiện' },
    { id: 's4', from: 'operate', to: 'response', label: 'theo dõi' },
    { id: 's5', from: 'response', to: 'hazard', label: 'rút kinh nghiệm' },
  ],
}

const carTemplate = {
  title: 'Sơ đồ cấu tạo chung và hệ thống chính trên ô tô',
  description:
    'Thể hiện ô tô như một hệ thống gồm nguồn động lực, truyền lực, khung gầm, hệ thống lái, phanh, điện - điều khiển và thân vỏ.',
  palette: ['power', 'transmission', 'chassis', 'steering', 'brake', 'electrical', 'control', 'safety'],
  blocks: [
    { id: 'engine', type: 'power', title: 'Động cơ / nguồn động lực', note: 'Tạo công suất để xe chuyển động; có thể là động cơ đốt trong, động cơ điện hoặc hệ lai.', x: 70, y: 130 },
    { id: 'transmission', type: 'transmission', title: 'Hệ thống truyền lực', note: 'Truyền và biến đổi mô men từ nguồn động lực tới bánh xe chủ động.', x: 350, y: 130 },
    { id: 'chassis', type: 'chassis', title: 'Khung gầm - thân vỏ', note: 'Đỡ, liên kết các cụm chi tiết, bảo vệ người và hàng hóa, tạo hình dáng xe.', x: 630, y: 130 },
    { id: 'steering', type: 'steering', title: 'Hệ thống lái', note: 'Điều khiển hướng chuyển động của xe theo thao tác của người lái hoặc hệ thống hỗ trợ.', x: 70, y: 380 },
    { id: 'brake', type: 'brake', title: 'Hệ thống phanh', note: 'Giảm tốc, dừng xe và giữ xe đứng yên an toàn trong các điều kiện làm việc.', x: 350, y: 380 },
    { id: 'electrical', type: 'electrical', title: 'Điện - điều khiển', note: 'Cung cấp điện, khởi động, chiếu sáng, cảm biến, điều khiển và hỗ trợ chẩn đoán.', x: 630, y: 380 },
  ],
  links: [
    { id: 'c1', from: 'engine', to: 'transmission', label: 'công suất / mô men' },
    { id: 'c2', from: 'transmission', to: 'chassis', label: 'tác động tới bánh xe' },
    { id: 'c3', from: 'steering', to: 'chassis', label: 'đổi hướng' },
    { id: 'c4', from: 'brake', to: 'chassis', label: 'giảm tốc / dừng' },
    { id: 'c5', from: 'electrical', to: 'engine', label: 'điều khiển' },
    { id: 'c6', from: 'electrical', to: 'brake', label: 'hỗ trợ an toàn' },
  ],
}

const researchProjectTemplate = {
  title: 'Sơ đồ dự án nghiên cứu kĩ thuật cơ khí',
  description:
    'Bám chuyên đề Công nghệ cơ khí 11: xác định vấn đề, lập kế hoạch, chế tạo/thử nghiệm, đo kiểm, báo cáo và cải tiến sản phẩm.',
  palette: ['requirement', 'design', 'material', 'processing', 'inspection', 'safety'],
  blocks: [
    { id: 'problem', type: 'requirement', title: 'Vấn đề nghiên cứu', note: 'Nhu cầu thực tiễn, mục tiêu, tiêu chí đánh giá và ràng buộc của dự án.', x: 70, y: 120 },
    { id: 'plan', type: 'design', title: 'Ý tưởng - kế hoạch', note: 'Đề xuất phương án, phân công nhiệm vụ, chọn vật liệu, dụng cụ, tiến độ và an toàn.', x: 350, y: 120 },
    { id: 'prototype', type: 'processing', title: 'Chế tạo mô hình', note: 'Gia công, lắp ráp, vận hành thử và ghi dữ liệu theo tiêu chí đã đặt ra.', x: 630, y: 120 },
    { id: 'test', type: 'inspection', title: 'Thử nghiệm - đo kiểm', note: 'So sánh kết quả với tiêu chí, phát hiện lỗi và nguyên nhân.', x: 220, y: 360 },
    { id: 'report', type: 'assembly', title: 'Báo cáo - cải tiến', note: 'Trình bày minh chứng, kết luận, phản biện và đề xuất cải tiến sản phẩm.', x: 540, y: 360 },
  ],
  links: [
    { id: 'rp1', from: 'problem', to: 'plan', label: 'mục tiêu' },
    { id: 'rp2', from: 'plan', to: 'prototype', label: 'phương án' },
    { id: 'rp3', from: 'prototype', to: 'test', label: 'sản phẩm thử' },
    { id: 'rp4', from: 'test', to: 'report', label: 'minh chứng' },
    { id: 'rp5', from: 'test', to: 'plan', label: 'cải tiến' },
  ],
}

const cncTemplate = {
  title: 'Sơ đồ chuỗi CAD/CAM-CNC',
  description:
    'Bám chuyên đề CAD/CAM-CNC: thiết kế số bằng CAD, lập trình gia công bằng CAM, máy CNC thực hiện gia công và đo kiểm phản hồi.',
  palette: ['requirement', 'design', 'control', 'processing', 'inspection', 'safety'],
  blocks: [
    { id: 'requirement', type: 'requirement', title: 'Yêu cầu chi tiết', note: 'Công dụng, vật liệu, kích thước, dung sai, độ nhẵn và số lượng cần chế tạo.', x: 70, y: 120 },
    { id: 'cad', type: 'design', title: 'CAD', note: 'Tạo mô hình 2D/3D, bản vẽ kĩ thuật và dữ liệu thiết kế số.', x: 350, y: 120 },
    { id: 'cam', type: 'control', title: 'CAM', note: 'Chọn dao, đường chạy dao, chế độ cắt, mô phỏng và xuất chương trình.', x: 630, y: 120 },
    { id: 'cnc', type: 'processing', title: 'Máy CNC', note: 'Bộ điều khiển, trục chính, bàn máy, truyền động và dao gia công theo chương trình.', x: 220, y: 360 },
    { id: 'measure', type: 'inspection', title: 'Đo kiểm', note: 'Kiểm tra kích thước, hình dạng, bề mặt và phản hồi để hiệu chỉnh.', x: 540, y: 360 },
  ],
  links: [
    { id: 'cnc1', from: 'requirement', to: 'cad', label: 'thông số' },
    { id: 'cnc2', from: 'cad', to: 'cam', label: 'mô hình số' },
    { id: 'cnc3', from: 'cam', to: 'cnc', label: 'chương trình' },
    { id: 'cnc4', from: 'cnc', to: 'measure', label: 'chi tiết' },
    { id: 'cnc5', from: 'measure', to: 'cad', label: 'hiệu chỉnh' },
  ],
}

const print3DTemplate = {
  title: 'Sơ đồ quy trình công nghệ in 3D',
  description:
    'Bám chuyên đề in 3D: mô hình hóa, xuất tệp, cắt lớp, in từng lớp, hậu xử lí, đo kiểm và cải tiến thông số.',
  palette: ['requirement', 'design', 'processing', 'material', 'inspection', 'safety'],
  blocks: [
    { id: 'need', type: 'requirement', title: 'Yêu cầu vật thể', note: 'Công dụng, kích thước, độ bền, độ nhẵn, vật liệu và điều kiện sử dụng.', x: 70, y: 110 },
    { id: 'model', type: 'design', title: 'Mô hình 3D', note: 'Thiết kế hoặc quét mẫu, kiểm tra lỗi hình học và xuất STL/OBJ.', x: 350, y: 110 },
    { id: 'slice', type: 'control', title: 'Cắt lớp', note: 'Thiết lập chiều cao lớp, mật độ điền đầy, hỗ trợ, nhiệt độ và tốc độ.', x: 630, y: 110 },
    { id: 'print', type: 'processing', title: 'In từng lớp', note: 'Máy in đắp vật liệu theo mã lệnh để tạo hình vật thể.', x: 220, y: 360 },
    { id: 'finish', type: 'inspection', title: 'Hậu xử lí - đo kiểm', note: 'Gỡ hỗ trợ, làm sạch, hoàn thiện bề mặt, đo kích thước và đánh giá lỗi.', x: 540, y: 360 },
  ],
  links: [
    { id: 'p1', from: 'need', to: 'model', label: 'tiêu chí' },
    { id: 'p2', from: 'model', to: 'slice', label: 'tệp 3D' },
    { id: 'p3', from: 'slice', to: 'print', label: 'mã lệnh' },
    { id: 'p4', from: 'print', to: 'finish', label: 'vật thể' },
    { id: 'p5', from: 'finish', to: 'slice', label: 'tối ưu' },
  ],
}

const powerGridTemplate = {
  title: 'Sơ đồ hệ thống điện quốc gia',
  description:
    'Bám Công nghệ điện - điện tử 12: nguồn điện, truyền tải, trạm biến áp, phân phối, phụ tải, điều độ và bảo vệ.',
  palette: ['source', 'grid', 'protection', 'control', 'load', 'feedback'],
  blocks: [
    { id: 'plant', type: 'source', title: 'Nguồn điện', note: 'Nhà máy điện hoặc nguồn tái tạo biến đổi năng lượng sơ cấp thành điện năng.', x: 70, y: 120 },
    { id: 'transmission', type: 'grid', title: 'Lưới truyền tải', note: 'Điện áp cao truyền điện đi xa, giảm tổn thất trên đường dây.', x: 350, y: 120 },
    { id: 'substation', type: 'protection', title: 'Trạm biến áp', note: 'Nâng hoặc hạ điện áp, đóng cắt, đo lường và bảo vệ.', x: 630, y: 120 },
    { id: 'distribution', type: 'grid', title: 'Lưới phân phối', note: 'Cấp điện đến khu dân cư, trường học, cơ sở sản xuất và dịch vụ.', x: 220, y: 360 },
    { id: 'load', type: 'load', title: 'Phụ tải', note: 'Thiết bị tiêu thụ điện cần đúng điện áp, đủ công suất và an toàn.', x: 540, y: 360 },
  ],
  links: [
    { id: 'pg1', from: 'plant', to: 'transmission', label: 'điện năng' },
    { id: 'pg2', from: 'transmission', to: 'substation', label: 'truyền tải' },
    { id: 'pg3', from: 'substation', to: 'distribution', label: 'hạ áp' },
    { id: 'pg4', from: 'distribution', to: 'load', label: 'cấp điện' },
    { id: 'pg5', from: 'load', to: 'substation', label: 'dữ liệu tải' },
  ],
}

const householdElectricTemplate = {
  title: 'Sơ đồ mạng điện trong nhà',
  description:
    'Bám chuẩn mạng điện trong nhà: nguồn cấp, thiết bị bảo vệ, bảng điện, dây dẫn, thiết bị điều khiển, ổ cắm và phụ tải.',
  palette: ['source', 'protection', 'control', 'load', 'safety', 'inspection'],
  blocks: [
    { id: 'source', type: 'source', title: 'Nguồn cấp', note: 'Điện từ lưới hạ áp đi vào công tơ, bảng điện hoặc tủ điện gia đình.', x: 70, y: 120 },
    { id: 'breaker', type: 'protection', title: 'Aptomat / bảo vệ', note: 'Ngắt khi quá tải, ngắn mạch hoặc rò điện theo thông số phù hợp.', x: 350, y: 120 },
    { id: 'wiring', type: 'control', title: 'Dây dẫn - bảng điện', note: 'Dây dẫn chọn đúng tiết diện, cách điện; bảng điện bố trí thuận tiện kiểm tra.', x: 630, y: 120 },
    { id: 'switch', type: 'control', title: 'Công tắc / ổ cắm', note: 'Điều khiển đèn, cấp điện cho thiết bị và bảo đảm tiếp xúc an toàn.', x: 220, y: 360 },
    { id: 'load', type: 'load', title: 'Đèn / thiết bị điện', note: 'Phụ tải sử dụng điện đúng công suất, đúng môi trường và đúng hướng dẫn.', x: 540, y: 360 },
  ],
  links: [
    { id: 'he1', from: 'source', to: 'breaker', label: 'nguồn vào' },
    { id: 'he2', from: 'breaker', to: 'wiring', label: 'bảo vệ' },
    { id: 'he3', from: 'wiring', to: 'switch', label: 'đường dây' },
    { id: 'he4', from: 'switch', to: 'load', label: 'điều khiển' },
    { id: 'he5', from: 'load', to: 'breaker', label: 'dòng tải' },
  ],
}

const electronicsTemplate = {
  title: 'Sơ đồ khối nhiệm vụ mạch điện tử số',
  description:
    'Bám Công nghệ 12: cảm biến, chuẩn hóa tín hiệu, mức logic 0/1, cổng logic, vi điều khiển, driver, đầu ra và phản hồi.',
  palette: ['source', 'sensor', 'logic', 'control', 'actuator', 'feedback'],
  blocks: [
    { id: 'input', type: 'source', title: 'Tình huống / tín hiệu vào', note: 'Khói, nhiệt độ cao, ánh sáng, nút nhấn hoặc trạng thái công tắc được quy ước thành điều kiện 0/1.', x: 70, y: 110 },
    { id: 'sensor', type: 'sensor', title: 'Cảm biến và chuẩn hóa', note: 'Cảm biến tạo tín hiệu điện; khối chuẩn hóa đưa tín hiệu về mức logic ổn định để xử lí.', x: 350, y: 110 },
    { id: 'logic', type: 'logic', title: 'Cổng logic AND / OR / NOT', note: 'Tạo quyết định theo bảng chân lí: đủ điều kiện, một trong nhiều điều kiện hoặc đảo trạng thái.', x: 630, y: 110 },
    { id: 'mcu', type: 'program', title: 'Vi điều khiển / thuật toán', note: 'Đọc mức logic, kiểm tra điều kiện, chống nhiễu đơn giản và phát lệnh điều khiển.', x: 70, y: 380 },
    { id: 'driver', type: 'control', title: 'Driver công suất', note: 'Transistor, rơle hoặc IC driver khuếch dòng và cách li khối xử lí với tải.', x: 350, y: 380 },
    { id: 'output', type: 'actuator', title: 'Đầu ra và phản hồi', note: 'Còi, LED, quạt, rơle hoặc màn hình hoạt động; phản hồi giúp kiểm tra mạch đúng yêu cầu.', x: 630, y: 380 },
  ],
  links: [
    { id: 'el1', from: 'input', to: 'sensor', label: 'đại lượng vào' },
    { id: 'el2', from: 'sensor', to: 'logic', label: 'mức 0/1' },
    { id: 'el3', from: 'logic', to: 'mcu', label: 'điều kiện logic' },
    { id: 'el4', from: 'mcu', to: 'driver', label: 'lệnh điều khiển' },
    { id: 'el5', from: 'driver', to: 'output', label: 'công suất' },
    { id: 'el6', from: 'output', to: 'mcu', label: 'phản hồi' },
  ],
}

const microcontrollerTemplate = {
  title: 'Sơ đồ dự án vi điều khiển',
  description:
    'Bám chuẩn vi điều khiển 12: yêu cầu, cảm biến, chương trình, vi điều khiển, cơ cấu chấp hành, kiểm thử và cải tiến.',
  palette: ['requirement', 'sensor', 'program', 'logic', 'actuator', 'inspection'],
  blocks: [
    { id: 'task', type: 'requirement', title: 'Yêu cầu điều khiển', note: 'Thiết bị cần điều khiển, điều kiện kích hoạt, tiêu chí hoạt động và an toàn.', x: 70, y: 110 },
    { id: 'input', type: 'sensor', title: 'Đầu vào', note: 'Nút nhấn, cảm biến ánh sáng, nhiệt độ, khoảng cách hoặc tín hiệu số.', x: 350, y: 110 },
    { id: 'code', type: 'program', title: 'Thuật toán - chương trình', note: 'Khởi tạo, đọc đầu vào, xử lí điều kiện, điều khiển đầu ra và lặp lại.', x: 630, y: 110 },
    { id: 'mcu', type: 'logic', title: 'Vi điều khiển', note: 'Bộ xử lí, bộ nhớ, chân vào/ra, giao tiếp và nguồn cấp.', x: 220, y: 360 },
    { id: 'actuator', type: 'actuator', title: 'Thiết bị chấp hành', note: 'LED, rơle, động cơ, còi hoặc màn hình nhận lệnh từ vi điều khiển.', x: 540, y: 360 },
  ],
  links: [
    { id: 'mc1', from: 'task', to: 'input', label: 'điều kiện' },
    { id: 'mc2', from: 'input', to: 'mcu', label: 'tín hiệu vào' },
    { id: 'mc3', from: 'code', to: 'mcu', label: 'nạp chương trình' },
    { id: 'mc4', from: 'mcu', to: 'actuator', label: 'tín hiệu ra' },
    { id: 'mc5', from: 'actuator', to: 'task', label: 'kiểm tra' },
  ],
}

const getDiagramTemplate = (lesson) => {
  if (!lesson) return electronicsTemplate
  const sourceLessonId = lesson.source_id || lesson.id
  const sourceCourseId = lesson.source_course_id || lesson.course_id

  if (lesson.grade_level === 10) {
    if (sourceCourseId === 2) return materialTemplate
    return manufacturingTemplate
  }

  if (lesson.grade_level === 11) {
    if (sourceCourseId === 1) return researchProjectTemplate
    if (sourceCourseId === 2) return cncTemplate
    if (sourceCourseId === 3) return print3DTemplate
    return researchProjectTemplate
  }

  if (lesson.grade_level === 12) {
    if (sourceCourseId === 2) return powerGridTemplate
    if (sourceCourseId === 3 || sourceCourseId === 4) return householdElectricTemplate
    if (sourceCourseId === 9) return microcontrollerTemplate
    if (sourceCourseId >= 5) return electronicsTemplate
    return powerGridTemplate
  }

  if (sourceLessonId === 302) return safetyTemplate
  if (sourceCourseId === 2) return materialTemplate
  if (sourceCourseId === 4) return engineTemplate
  if (sourceCourseId === 5) return carTemplate
  return manufacturingTemplate
}

const getTemplateByQuery = (templateKey, lesson) => {
  if (templateKey === 'digital' || templateKey === 'electronics') return electronicsTemplate
  if (templateKey === 'microcontroller') return microcontrollerTemplate
  if (templateKey === 'home-electric' || templateKey === 'safety-electric') return householdElectricTemplate
  if (templateKey === 'power-grid') return powerGridTemplate
  return getDiagramTemplate(lesson)
}

const readDesigns = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const writeDesigns = (designs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs))
}

const getBlockType = (type) => blockTypes.find((item) => item.type === type) || blockTypes[0]

const getAnchor = (fromBlock, toBlock) => {
  const fromCenter = {
    x: fromBlock.x + BLOCK_WIDTH / 2,
    y: fromBlock.y + BLOCK_HEIGHT / 2,
  }
  const toCenter = {
    x: toBlock.x + BLOCK_WIDTH / 2,
    y: toBlock.y + BLOCK_HEIGHT / 2,
  }

  const dx = toCenter.x - fromCenter.x
  const dy = toCenter.y - fromCenter.y

  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      from: { x: dx > 0 ? fromBlock.x + BLOCK_WIDTH : fromBlock.x, y: fromCenter.y },
      to: { x: dx > 0 ? toBlock.x : toBlock.x + BLOCK_WIDTH, y: toCenter.y },
    }
  }

  return {
    from: { x: fromCenter.x, y: dy > 0 ? fromBlock.y + BLOCK_HEIGHT : fromBlock.y },
    to: { x: toCenter.x, y: dy > 0 ? toBlock.y : toBlock.y + BLOCK_HEIGHT },
  }
}

export default function SystemDesignLab() {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const boardRef = useRef(null)
  const lesson = lessonId ? getSampleLesson(lessonId) : null
  const templateKey = searchParams.get('template')
  const currentTemplate = getTemplateByQuery(templateKey, lesson)
  const paletteTypes = blockTypes.filter((item) => currentTemplate.palette.includes(item.type))
  const [blocks, setBlocks] = useState(currentTemplate.blocks)
  const [links, setLinks] = useState(currentTemplate.links)
  const [selectedBlockId, setSelectedBlockId] = useState(null)
  const [linkStartId, setLinkStartId] = useState(null)
  const [dragState, setDragState] = useState(null)
  const [designTitle, setDesignTitle] = useState(currentTemplate.title)

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId)
  const designKey = `${user?.id || user?.username || 'guest'}-${lessonId || templateKey || 'digital'}`

  const completion = useMemo(() => {
    const coreTypes = currentTemplate.palette.slice(0, Math.min(5, currentTemplate.palette.length))
    const hasCore = coreTypes.every((type) => blocks.some((block) => block.type === type))
    const enoughLinks = links.length >= 4
    const noted = blocks.filter((block) => block.note?.trim()).length >= Math.min(5, blocks.length)
    return [
      { label: 'Đủ các khối kiến thức chính của bài', done: hasCore },
      { label: 'Có ít nhất 4 mũi tên thể hiện trình tự hoặc quan hệ', done: enoughLinks },
      { label: 'Mỗi khối chính có ghi chú nhiệm vụ hoặc ý nghĩa', done: noted },
    ]
  }, [blocks, links, currentTemplate])

  const completionScore = Math.round((completion.filter((item) => item.done).length / completion.length) * 100)

  useEffect(() => {
    const saved = readDesigns()[designKey]
    if (saved) {
      setBlocks(saved.blocks || currentTemplate.blocks)
      setLinks(saved.links || currentTemplate.links)
      setDesignTitle(saved.title || currentTemplate.title)
      return
    }
    setBlocks(currentTemplate.blocks)
    setLinks(currentTemplate.links)
    setDesignTitle(currentTemplate.title)
    setSelectedBlockId(null)
    setLinkStartId(null)
  }, [designKey, currentTemplate])

  const updateBlock = (blockId, patch) => {
    setBlocks((current) => current.map((block) => (block.id === blockId ? { ...block, ...patch } : block)))
  }

  const addBlock = (type) => {
    const meta = getBlockType(type)
    const id = `${type}-${Date.now()}`
    const nextBlock = {
      id,
      type,
      title: meta.label,
      note: 'Ghi nhiệm vụ, đầu vào, đầu ra hoặc mối liên hệ của khối này trong sơ đồ.',
      x: 120 + (blocks.length % 3) * 250,
      y: 90 + (blocks.length % 4) * 135,
    }
    setBlocks((current) => [...current, nextBlock])
    setSelectedBlockId(id)
  }

  const removeBlock = (blockId) => {
    setBlocks((current) => current.filter((block) => block.id !== blockId))
    setLinks((current) => current.filter((link) => link.from !== blockId && link.to !== blockId))
    setSelectedBlockId(null)
  }

  const connectBlock = (blockId) => {
    if (!linkStartId) {
      setLinkStartId(blockId)
      toast.success('Chọn khối đích để nối')
      return
    }
    if (linkStartId === blockId) {
      setLinkStartId(null)
      return
    }
    const exists = links.some((link) => link.from === linkStartId && link.to === blockId)
    if (!exists) {
      setLinks((current) => [...current, { id: `link-${Date.now()}`, from: linkStartId, to: blockId, label: 'quan hệ' }])
    }
    setLinkStartId(null)
  }

  const saveDesign = () => {
    const designs = readDesigns()
    designs[designKey] = {
      title: designTitle,
      lessonId: lessonId || null,
      updatedAt: new Date().toISOString(),
      blocks,
      links,
    }
    writeDesigns(designs)
    toast.success('Đã lưu sơ đồ thiết kế')
  }

  const exportDesign = async () => {
    const payload = JSON.stringify({ title: designTitle, blocks, links }, null, 2)
    try {
      await navigator.clipboard.writeText(payload)
      toast.success('Đã copy dữ liệu sơ đồ')
    } catch {
      toast.error('Không copy được dữ liệu')
    }
  }

  const resetTemplate = () => {
    setBlocks(currentTemplate.blocks)
    setLinks(currentTemplate.links)
    setDesignTitle(currentTemplate.title)
    setSelectedBlockId(null)
    setLinkStartId(null)
  }

  const onPointerMove = (event) => {
    if (!dragState || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const x = event.clientX - rect.left - dragState.offsetX
    const y = event.clientY - rect.top - dragState.offsetY
    updateBlock(dragState.blockId, {
      x: Math.max(16, Math.min(x, CANVAS_WIDTH - BLOCK_WIDTH - 16)),
      y: Math.max(16, Math.min(y, CANVAS_HEIGHT - BLOCK_HEIGHT - 16)),
    })
  }

  const renderLink = (link) => {
    const fromBlock = blocks.find((block) => block.id === link.from)
    const toBlock = blocks.find((block) => block.id === link.to)
    if (!fromBlock || !toBlock) return null

    const { from, to } = getAnchor(fromBlock, toBlock)
    const dx = to.x - from.x
    const dy = to.y - from.y
    const curve = Math.max(60, Math.min(140, Math.abs(dx) * 0.35 + Math.abs(dy) * 0.18))
    const controlA = Math.abs(dx) > Math.abs(dy) ? { x: from.x + Math.sign(dx || 1) * curve, y: from.y } : { x: from.x, y: from.y + Math.sign(dy || 1) * curve }
    const controlB = Math.abs(dx) > Math.abs(dy) ? { x: to.x - Math.sign(dx || 1) * curve, y: to.y } : { x: to.x, y: to.y - Math.sign(dy || 1) * curve }
    const labelX = (from.x + to.x) / 2
    const labelY = (from.y + to.y) / 2
    const labelWidth = Math.max(92, Math.min(150, link.label.length * 8 + 26))

    return (
      <g key={link.id}>
        <path
          d={`M ${from.x} ${from.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${to.x} ${to.y}`}
          fill="none"
          stroke="#334155"
          strokeWidth="2.5"
          markerEnd="url(#arrow)"
        />
        <rect
          x={labelX - labelWidth / 2}
          y={labelY - 14}
          width={labelWidth}
          height="28"
          rx="8"
          fill="#ffffff"
          stroke="#cbd5e1"
          opacity="0.96"
        />
        <text x={labelX} y={labelY + 4} textAnchor="middle" className="fill-slate-700 text-[12px] font-bold">
          {link.label}
        </text>
      </g>
    )
  }

  return (
    <div className="page-container">
      <section className="panel-soft mb-6 overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="p-6 sm:p-8">
            <p className="muted-label mb-2">Xưởng thiết kế sơ đồ</p>
            <h1 className="text-3xl font-black text-slate-950">Vẽ sơ đồ kiến thức Công nghệ</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              {currentTemplate.description} Kéo thả các khối, nối mũi tên và ghi chú ngắn để giải thích đúng cấu tạo,
              quy trình hoặc nguyên lí của nội dung đang học.
            </p>
            {lesson && (
              <p className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                Đang gắn với bài: {lesson.title}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={saveDesign} className="primary-button">Lưu sơ đồ</button>
              <button type="button" onClick={exportDesign} className="secondary-button">Copy dữ liệu</button>
              <button type="button" onClick={resetTemplate} className="secondary-button">Mẫu chuẩn</button>
            </div>
          </div>

          <div className="border-t border-slate-200 bp-sheet-dark p-6 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-200">Đánh giá sơ đồ</p>
            <div className="mt-4 text-5xl font-black">{completionScore}%</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full bg-blue-400" style={{ width: `${completionScore}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-slate-300">Khối</p>
                <p className="mt-1 text-2xl font-black">{blocks.length}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-slate-300">Liên kết</p>
                <p className="mt-1 text-2xl font-black">{links.length}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-950">Thư viện khối</h2>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{paletteTypes.length}</span>
            </div>
            <div className="mt-4 grid gap-2">
              {paletteTypes.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => addBlock(item.type)}
                  className={`group flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-sm ${item.color}`}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.stroke }} />
                  <span>{item.label}</span>
                  <span className="ml-auto text-slate-400 group-hover:text-slate-700">+</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-blue-950">
            <h2 className="font-black">Cách thao tác</h2>
            <ol className="mt-3 space-y-2 text-sm leading-6">
              <li>1. Thêm khối từ thư viện.</li>
              <li>2. Sắp xếp theo trình tự, dòng năng lượng hoặc quan hệ cấu tạo.</li>
              <li>3. Bấm “Nối từ khối này”, rồi chọn khối đích để tạo mũi tên.</li>
              <li>4. Ghi chú nhiệm vụ, đầu vào, đầu ra hoặc ý nghĩa của từng khối.</li>
            </ol>
          </section>
        </aside>

        <main className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
            <input value={designTitle} onChange={(event) => setDesignTitle(event.target.value)} className="field-control max-w-xl font-bold" />
            <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
              <span className="rounded-md bg-slate-100 px-2 py-1">Kéo thả</span>
              <span className="rounded-md bg-slate-100 px-2 py-1">Nối mũi tên</span>
              <span className="rounded-md bg-slate-100 px-2 py-1">Lưu cục bộ</span>
            </div>
          </div>

          <div className="overflow-auto bg-slate-100">
            <div
              ref={boardRef}
              className="relative"
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                backgroundImage:
                  'linear-gradient(#dbe4f0 1px, transparent 1px), linear-gradient(90deg, #dbe4f0 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
              onPointerMove={onPointerMove}
              onPointerUp={() => setDragState(null)}
              onPointerLeave={() => setDragState(null)}
            >
              <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-500 shadow-sm backdrop-blur">
                Canvas sơ đồ hệ thống
              </div>

              <svg className="absolute inset-0 z-0 h-full w-full" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
                <defs>
                  <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="4" orient="auto">
                    <path d="M0,0 L0,8 L11,4 z" fill="#334155" />
                  </marker>
                </defs>
                {links.map(renderLink)}
              </svg>

              {blocks.map((block) => {
                const meta = getBlockType(block.type)
                const selected = selectedBlockId === block.id
                const isLinkSource = linkStartId === block.id
                return (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => {
                      setSelectedBlockId(block.id)
                      if (linkStartId) connectBlock(block.id)
                    }}
                    onPointerDown={(event) => {
                      const rect = event.currentTarget.getBoundingClientRect()
                      setSelectedBlockId(block.id)
                      setDragState({
                        blockId: block.id,
                        offsetX: event.clientX - rect.left,
                        offsetY: event.clientY - rect.top,
                      })
                    }}
                    className={`absolute z-10 rounded-lg border-2 p-4 text-left shadow-sm transition hover:shadow-lg ${
                      selected || isLinkSource ? 'border-blue-600 bg-white ring-4 ring-blue-100' : `${meta.color} hover:bg-white`
                    }`}
                    style={{ left: block.x, top: block.y, width: BLOCK_WIDTH, minHeight: BLOCK_HEIGHT }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[15px] font-black leading-5 text-slate-950">{block.title}</span>
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: meta.stroke }} />
                    </div>
                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-600">{block.note}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </main>

        <aside className="space-y-5">
          <section className="panel p-5">
            <h2 className="font-black text-slate-950">Thuộc tính khối</h2>
            {selectedBlock ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Tên khối</label>
                  <input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })} className="field-control" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-700">Ghi chú chức năng</label>
                  <textarea value={selectedBlock.note} onChange={(event) => updateBlock(selectedBlock.id, { note: event.target.value })} className="field-control min-h-28" />
                </div>
                <button type="button" onClick={() => connectBlock(selectedBlock.id)} className="primary-button w-full">
                  {linkStartId === selectedBlock.id ? 'Đang chọn khối nguồn' : 'Nối từ khối này'}
                </button>
                <button type="button" onClick={() => removeBlock(selectedBlock.id)} className="secondary-button w-full">
                  Xóa khối
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Chọn một khối trên vùng vẽ để chỉnh tên, ghi chú hoặc nối quan hệ.
              </p>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="font-black text-slate-950">Tiêu chí hoàn thành</h2>
            <div className="mt-4 space-y-3">
              {completion.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg border p-3 text-sm ${
                    item.done ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="font-bold">{item.done ? 'Đạt' : 'Cần bổ sung'}:</span> {item.label}
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="font-black text-slate-950">Đường liên kết</h2>
            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
              {links.length === 0 ? (
                <p className="text-sm text-slate-600">Chưa có đường nối.</p>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <input
                      value={link.label}
                      onChange={(event) =>
                        setLinks((current) =>
                          current.map((item) => (item.id === link.id ? { ...item, label: event.target.value } : item))
                        )
                      }
                      className="field-control"
                    />
                    <button type="button" onClick={() => setLinks((current) => current.filter((item) => item.id !== link.id))} className="mt-2 text-xs font-bold text-red-600">
                      Xóa liên kết
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
