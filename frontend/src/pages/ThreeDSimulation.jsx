import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { lessonsAPI, nova3dAPI } from '../services/api'
import { getSampleLesson } from '../data/courseCatalog'
import { getSimulationExperimentForLesson } from '../data/simulationExperiments'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const chapterSimulations = {
  1: {
    label: 'Chương 1',
    title: 'Mô phỏng quy trình tạo sản phẩm cơ khí',
    subtitle: 'Từ yêu cầu kĩ thuật đến sản phẩm được kiểm tra',
    objective:
      'Giúp học sinh nhận biết cơ khí chế tạo tạo ra chi tiết, cụm chi tiết, máy và thiết bị thông qua một quy trình có kiểm soát.',
    layers: [
      { id: 'requirement', name: 'Yêu cầu', note: 'Xác định công dụng, kích thước, độ bền, độ chính xác và an toàn.' },
      { id: 'design', name: 'Thiết kế', note: 'Lập bản vẽ, xác định hình dạng, kích thước và thông số kĩ thuật.' },
      { id: 'manufacture', name: 'Gia công', note: 'Chọn vật liệu, tạo phôi, gia công và lắp ráp theo quy trình.' },
      { id: 'inspection', name: 'Kiểm tra', note: 'Đo kiểm để đánh giá sản phẩm có đạt yêu cầu hay không.' },
    ],
    checkpoints: [
      'Sản phẩm cơ khí có thể là chi tiết, cụm chi tiết hoặc máy hoàn chỉnh.',
      'Quy trình chế tạo phải có bước kiểm tra chất lượng.',
      'Sai số ở khâu thiết kế hoặc gia công có thể làm sản phẩm mất an toàn.',
    ],
    teacherPrompts: [
      'Vì sao không thể gia công trước khi đọc bản vẽ?',
      'Nếu chi tiết bị sai kích thước thì cần kiểm tra lại khâu nào?',
    ],
  },
  2: {
    label: 'Chương 2',
    title: 'Mô phỏng vật liệu và gia công cơ khí',
    subtitle: 'Lựa chọn vật liệu, phương pháp gia công và đo kiểm',
    objective:
      'Giúp học sinh hiểu vật liệu phải được chọn theo công dụng, điều kiện làm việc, khả năng gia công và giá thành.',
    layers: [
      { id: 'material', name: 'Vật liệu', note: 'Kim loại, phi kim và composite có tính chất và phạm vi dùng khác nhau.' },
      { id: 'blank', name: 'Phôi', note: 'Phôi là dạng ban đầu trước khi gia công thành chi tiết.' },
      { id: 'machining', name: 'Gia công', note: 'Tiện, phay, khoan, mài, hàn hoặc đúc làm thay đổi hình dạng chi tiết.' },
      { id: 'measure', name: 'Đo kiểm', note: 'Đánh giá kích thước, độ nhẵn và sai số sau gia công.' },
    ],
    checkpoints: [
      'Chọn vật liệu phải dựa vào điều kiện làm việc của chi tiết.',
      'Gia công cắt gọt tạo độ chính xác kích thước và bề mặt cao.',
      'Đo kiểm là cơ sở để đánh giá chất lượng chi tiết.',
    ],
    teacherPrompts: [
      'Một trục quay cần bền và chính xác thì nên chọn và gia công như thế nào?',
      'Vì sao vật liệu nhẹ, chống ăn mòn lại phù hợp với một số chi tiết ô tô?',
    ],
  },
  3: {
    label: 'Chương 3',
    title: 'Mô phỏng dây chuyền sản xuất tự động',
    subtitle: 'CNC, robot, cảm biến và an toàn lao động',
    objective:
      'Giúp học sinh hình dung sản xuất cơ khí hiện đại theo dây chuyền, có thiết bị tự động và quy tắc an toàn.',
    layers: [
      { id: 'cnc', name: 'Máy CNC', note: 'Gia công theo chương trình số, có độ chính xác và tính lặp lại cao.' },
      { id: 'robot', name: 'Robot', note: 'Thực hiện thao tác lặp lại, nặng nhọc hoặc nguy hiểm.' },
      { id: 'sensor', name: 'Cảm biến', note: 'Thu tín hiệu để giám sát trạng thái máy, sản phẩm hoặc vị trí.' },
      { id: 'safety', name: 'An toàn', note: 'Bảo hộ, che chắn, kiểm tra máy và vận hành đúng quy trình.' },
    ],
    checkpoints: [
      'Tự động hóa giúp tăng năng suất, độ chính xác và ổn định chất lượng.',
      'Cảm biến giúp hệ thống phát hiện trạng thái để điều khiển hoặc cảnh báo.',
      'An toàn lao động là yêu cầu bắt buộc khi học và làm việc với máy cơ khí.',
    ],
    teacherPrompts: [
      'Nếu robot dừng đột ngột, cảm biến hoặc quy trình an toàn có vai trò gì?',
      'Vì sao không được tháo che chắn khi máy đang hoạt động?',
    ],
  },
  4: {
    label: 'Chương 4',
    title: 'Mô phỏng động cơ đốt trong 4 kì',
    subtitle: 'Nạp, nén, cháy - giãn nở và thải',
    objective:
      'Giúp học sinh hiểu động cơ đốt trong biến nhiệt năng của nhiên liệu thành cơ năng thông qua piston, thanh truyền và trục khuỷu.',
    layers: [
      { id: 'intake', name: 'Kì nạp', note: 'Piston đi xuống, xupap nạp mở, môi chất đi vào xi lanh.' },
      { id: 'compression', name: 'Kì nén', note: 'Piston đi lên, hai xupap đóng, môi chất bị nén.' },
      { id: 'power', name: 'Kì cháy - giãn nở', note: 'Khí cháy giãn nở đẩy piston đi xuống và sinh công.' },
      { id: 'exhaust', name: 'Kì thải', note: 'Piston đi lên, xupap thải mở, khí thải ra ngoài.' },
    ],
    checkpoints: [
      'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến thành chuyển động quay.',
      'Kì cháy - giãn nở là kì sinh công.',
      'Các hệ thống nạp, nhiên liệu, đánh lửa, làm mát và bôi trơn giúp động cơ làm việc ổn định.',
    ],
    teacherPrompts: [
      'Ở kì nào hai xupap đều đóng?',
      'Vì sao động cơ cần hệ thống làm mát và bôi trơn?',
    ],
  },
  5: {
    label: 'Chương 5',
    title: 'Mô phỏng bố trí chung của ô tô',
    subtitle: 'Động cơ, truyền lực, treo, lái, phanh và điện điều khiển',
    objective:
      'Giúp học sinh nhận biết các hệ thống chính trên ô tô và mối liên hệ giữa chúng khi xe vận hành.',
    layers: [
      { id: 'powertrain', name: 'Nguồn động lực', note: 'Động cơ hoặc nguồn động lực tạo công suất cho xe.' },
      { id: 'transmission', name: 'Truyền lực', note: 'Truyền mô-men từ động cơ đến bánh xe chủ động.' },
      { id: 'chassis', name: 'Gầm xe', note: 'Hệ thống treo, lái và phanh ảnh hưởng trực tiếp đến chuyển động an toàn.' },
      { id: 'control', name: 'Điện - điều khiển', note: 'Hỗ trợ khởi động, chiếu sáng, tín hiệu, điều khiển và tiện nghi.' },
    ],
    checkpoints: [
      'Ô tô là tổ hợp nhiều hệ thống làm việc đồng bộ.',
      'Phanh và lái là các hệ thống liên quan trực tiếp đến an toàn.',
      'Bảo dưỡng định kì giúp xe vận hành tin cậy, an toàn và tiết kiệm.',
    ],
    teacherPrompts: [
      'Nếu hệ thống truyền lực hỏng thì xe còn nhận công suất ở bánh xe không?',
      'Vì sao phanh được xem là hệ thống an toàn chủ động?',
    ],
  },
}

const knttSimulations = {
  1: {
    modelId: 1,
    label: 'KNTT - Chương I',
    title: 'Giới thiệu chung về cơ khí chế tạo',
    subtitle: 'Từ nhu cầu thực tế đến sản phẩm cơ khí được kiểm tra',
    objective:
      'Bám theo Chương I SGK Công nghệ 11 Cơ khí Kết nối tri thức: vai trò cơ khí chế tạo, sản phẩm cơ khí và nhóm nghề cơ khí chế tạo.',
    layers: [
      { id: 'requirement', name: 'Nhu cầu / yêu cầu', note: 'Xác định sản phẩm cần làm gì, điều kiện làm việc và yêu cầu kĩ thuật cần đạt.' },
      { id: 'design', name: 'Thiết kế cơ khí', note: 'Hình thành ý tưởng, lập bản vẽ, tính toán và mô phỏng sản phẩm trước khi chế tạo.' },
      { id: 'manufacture', name: 'Chế tạo - lắp ráp', note: 'Tạo chi tiết, cụm chi tiết, máy hoặc thiết bị bằng phương pháp gia công và lắp ráp phù hợp.' },
      { id: 'inspection', name: 'Kiểm tra chất lượng', note: 'Đánh giá kích thước, độ chính xác, khả năng làm việc, an toàn và tính kinh tế.' },
    ],
    checkpoints: [
      'Cơ khí chế tạo tạo ra chi tiết, cụm chi tiết, máy và thiết bị phục vụ sản xuất, giao thông và đời sống.',
      'Sản phẩm cơ khí cần đáp ứng công dụng, độ bền, độ chính xác, tính kinh tế, thẩm mĩ và an toàn.',
      'Nhóm nghề cơ khí chế tạo gắn với thiết kế, gia công, hàn, lắp ráp, vận hành máy, kiểm tra và bảo dưỡng.',
    ],
    teacherPrompts: [
      'Vì sao bản vẽ kĩ thuật và mô phỏng cần có trước khi chế tạo?',
      'Một sản phẩm cơ khí không đạt kích thước thì ảnh hưởng thế nào đến lắp ráp và an toàn?',
    ],
  },
  2: {
    modelId: 2,
    label: 'KNTT - Chương II',
    title: 'Vật liệu cơ khí',
    subtitle: 'Kim loại, hợp kim, phi kim loại và vật liệu mới',
    objective:
      'Bám theo Chương II SGK Công nghệ 11 Cơ khí Kết nối tri thức: phân biệt nhóm vật liệu cơ khí và chọn vật liệu theo tính chất, công dụng, điều kiện làm việc.',
    layers: [
      { id: 'material', name: 'Nhóm vật liệu', note: 'Vật liệu cơ khí gồm vật liệu kim loại, hợp kim, vật liệu phi kim loại và vật liệu mới.' },
      { id: 'blank', name: 'Tính chất', note: 'Cần xét cơ tính, lí tính, hóa tính và tính công nghệ như độ bền, độ cứng, độ dẻo, chống ăn mòn, khả năng gia công.' },
      { id: 'machining', name: 'Điều kiện làm việc', note: 'Tải trọng, ma sát, nhiệt độ, môi trường, khối lượng và tuổi thọ quyết định lựa chọn vật liệu.' },
      { id: 'measure', name: 'Lựa chọn', note: 'Chọn vật liệu phải cân bằng yêu cầu kĩ thuật, khả năng chế tạo, giá thành và độ an toàn.' },
    ],
    checkpoints: [
      'Thép, gang, kim loại màu và hợp kim thường dùng cho chi tiết chịu lực hoặc cần tính dẫn nhiệt, dẫn điện.',
      'Chất dẻo, cao su, gốm, composite và vật liệu mới có ưu điểm riêng về khối lượng, cách điện, giảm chấn hoặc chống ăn mòn.',
      'Không chọn vật liệu theo cảm tính; phải dựa vào công dụng và điều kiện làm việc của chi tiết.',
    ],
    teacherPrompts: [
      'Chi tiết chịu ma sát và tải trọng lớn cần ưu tiên tính chất vật liệu nào?',
      'Vì sao vật liệu composite được dùng nhiều trong kết cấu cần nhẹ nhưng bền?',
    ],
  },
  3: {
    modelId: 2,
    label: 'KNTT - Chương III',
    title: 'Các phương pháp gia công cơ khí',
    subtitle: 'Tạo phôi, cắt gọt và quy trình công nghệ gia công chi tiết',
    objective:
      'Bám theo Chương III SGK Công nghệ 11 Cơ khí Kết nối tri thức: khái quát gia công cơ khí, một số phương pháp gia công và quy trình công nghệ gia công chi tiết.',
    layers: [
      { id: 'material', name: 'Phôi', note: 'Phôi là đối tượng ban đầu để gia công thành chi tiết đạt yêu cầu.' },
      { id: 'blank', name: 'Tạo phôi', note: 'Đúc phù hợp chi tiết phức tạp; hàn dùng để liên kết; rèn, dập, cán làm biến dạng kim loại bằng lực.' },
      { id: 'machining', name: 'Cắt gọt', note: 'Tiện, phay, khoan, mài bóc tách vật liệu để đạt hình dạng, kích thước và độ nhẵn bề mặt.' },
      { id: 'measure', name: 'Quy trình - đo kiểm', note: 'Quy trình công nghệ quy định thứ tự nguyên công, thiết bị, dụng cụ, chế độ cắt và kiểm tra.' },
    ],
    checkpoints: [
      'Gia công cơ khí làm thay đổi hình dạng, kích thước, trạng thái bề mặt hoặc tính chất của phôi.',
      'Mỗi phương pháp gia công có phạm vi sử dụng, ưu điểm và hạn chế riêng.',
      'Quy trình công nghệ giúp sản xuất ổn định, giảm sai hỏng và kiểm soát chất lượng.',
    ],
    teacherPrompts: [
      'Vì sao trục tròn xoay thường được tiện rồi có thể mài tinh?',
      'Quy trình công nghệ thiếu bước đo kiểm sẽ gây rủi ro gì?',
    ],
  },
  4: {
    modelId: 4,
    label: 'KNTT - Chương IV',
    title: 'Sản xuất cơ khí',
    subtitle: 'Quá trình sản xuất, robot, tự động hóa và an toàn môi trường',
    objective:
      'Bám theo Chương IV SGK Công nghệ 11 Cơ khí Kết nối tri thức: quá trình sản xuất cơ khí, dây chuyền tự động có robot, tác động CMCN 4.0, an toàn lao động và bảo vệ môi trường.',
    layers: [
      { id: 'cnc', name: 'Quá trình sản xuất', note: 'Sản xuất cơ khí tác động vào vật liệu bằng công cụ, máy và quy trình để tạo sản phẩm đáp ứng nhu cầu.' },
      { id: 'robot', name: 'Robot công nghiệp', note: 'Robot tham gia vận chuyển, cấp phôi, hàn, lắp ráp, kiểm tra hoặc thao tác lặp lại trong dây chuyền.' },
      { id: 'sensor', name: 'Tự động hóa 4.0', note: 'Cảm biến, dữ liệu, điều khiển số, kết nối và giám sát giúp nâng cao năng suất, độ chính xác và chất lượng.' },
      { id: 'safety', name: 'An toàn - môi trường', note: 'Dùng bảo hộ, che chắn, quy trình vận hành, xử lí chất thải, bụi, tiếng ồn và nguy cơ mất an toàn.' },
    ],
    checkpoints: [
      'Dây chuyền sản xuất tự động giúp các công đoạn diễn ra liên tục, đồng bộ và dễ kiểm soát.',
      'Robot không thay thế yêu cầu hiểu quy trình; người vận hành vẫn phải giám sát và xử lí bất thường.',
      'An toàn lao động và bảo vệ môi trường là nội dung bắt buộc trong sản xuất cơ khí.',
    ],
    teacherPrompts: [
      'Cảm biến giúp dây chuyền tự động phát hiện những trạng thái nào?',
      'Vì sao khi máy đang chạy không được tháo che chắn hoặc đưa tay vào vùng nguy hiểm?',
    ],
  },
  5: {
    modelId: 5,
    label: 'KNTT - Chương V',
    title: 'Giới thiệu chung về cơ khí động lực',
    subtitle: 'Nguồn động lực, truyền động, máy công tác và nghề cơ khí động lực',
    objective:
      'Bám theo Chương V SGK Công nghệ 11 Cơ khí Kết nối tri thức: đối tượng, vai trò và ngành nghề trong lĩnh vực cơ khí động lực.',
    layers: [
      { id: 'powertrain', name: 'Nguồn động lực', note: 'Động cơ hoặc nguồn năng lượng tạo công suất, mô men để máy và phương tiện làm việc.' },
      { id: 'transmission', name: 'Hệ truyền động', note: 'Truyền, biến đổi và phân phối công suất từ nguồn động lực đến bộ phận công tác hoặc bánh xe.' },
      { id: 'chassis', name: 'Máy / phương tiện', note: 'Ô tô, xe máy, máy kéo, tàu thủy, máy xây dựng và thiết bị cơ giới là đối tượng tiêu biểu.' },
      { id: 'control', name: 'Khai thác - bảo dưỡng', note: 'Vận hành, bảo dưỡng, sửa chữa và kiểm định giúp thiết bị làm việc tin cậy, an toàn.' },
    ],
    checkpoints: [
      'Cơ khí động lực nghiên cứu máy tạo, truyền và sử dụng năng lượng cơ học.',
      'Đối tượng của cơ khí động lực thường gồm động cơ, hệ truyền động, phương tiện và máy công tác.',
      'Nghề cơ khí động lực gắn với thiết kế, chế tạo, vận hành, bảo dưỡng, sửa chữa và kiểm định.',
    ],
    teacherPrompts: [
      'Vì sao cần học nguồn động lực trước khi phân tích ô tô hoặc máy kéo?',
      'Nếu hệ truyền động hỏng thì công suất từ động cơ có đến bộ phận công tác không?',
    ],
  },
  6: {
    modelId: 6,
    label: 'KNTT - Chương VI',
    title: 'Mô phỏng động cơ xăng 2 kì',
    subtitle: 'Bugi, piston, cửa nạp, cửa quét, cửa thải, cacte và trục khuỷu',
    objective:
      'Bám theo sơ đồ cấu tạo động cơ xăng 2 kì trong SGK Công nghệ 11: quan sát chuyển động piston - thanh truyền - trục khuỷu và quá trình nạp, nén, cháy - giãn nở, quét thải qua các cửa khí.',
    layers: [
      { id: 'intake', name: 'Cửa nạp - cacte', note: 'Khi piston đi lên, áp suất trong cacte giảm, hòa khí đi qua cửa nạp vào cacte.' },
      { id: 'compression', name: 'Nén trong xi lanh', note: 'Piston đi lên che cửa quét và cửa thải, hòa khí phía trên piston bị nén; bugi chuẩn bị đánh lửa.' },
      { id: 'power', name: 'Cháy - giãn nở', note: 'Bugi đánh lửa, khí cháy giãn nở đẩy piston đi xuống, qua thanh truyền làm trục khuỷu quay sinh công.' },
      { id: 'exhaust', name: 'Quét - thải', note: 'Piston đi xuống mở cửa thải và cửa quét; khí cháy thoát ra, hòa khí từ cacte qua đường quét đi vào xi lanh.' },
    ],
    checkpoints: [
      'Động cơ xăng 2 kì hoàn thành một chu trình công tác trong hai hành trình piston, tương ứng một vòng quay trục khuỷu.',
      'Không dùng xupap như nhiều động cơ 4 kì; quá trình nạp, quét và thải được điều khiển chủ yếu bằng cửa nạp, cửa quét và cửa thải.',
      'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của piston thành chuyển động quay của trục khuỷu.',
    ],
    teacherPrompts: [
      'Vì sao cửa quét và cửa thải phải được piston đóng/mở đúng thời điểm?',
      'Trong động cơ 2 kì, cacte tham gia vào quá trình nạp và quét khí như thế nào?',
    ],
  },
  7: {
    modelId: 7,
    label: 'KNTT - Chương VII',
    title: 'Ô tô',
    subtitle: 'Khái quát ô tô, truyền lực, bánh xe - treo, lái, phanh và an toàn giao thông',
    objective:
      'Bám theo Chương VII SGK Công nghệ 11 Cơ khí Kết nối tri thức: cấu tạo chung ô tô và nhiệm vụ các hệ thống truyền lực, treo, lái, phanh.',
    layers: [
      { id: 'powertrain', name: 'Nguồn động lực', note: 'Động cơ hoặc nguồn động lực tạo công suất ban đầu cho ô tô.' },
      { id: 'transmission', name: 'Hệ thống truyền lực', note: 'Truyền và biến đổi mô men từ nguồn động lực đến bánh xe chủ động.' },
      { id: 'chassis', name: 'Bánh xe - hệ thống treo', note: 'Bánh xe tiếp xúc mặt đường; hệ thống treo giảm dao động và giữ ổn định chuyển động.' },
      { id: 'control', name: 'Lái - phanh', note: 'Hệ thống lái điều khiển hướng chuyển động; hệ thống phanh giảm tốc, dừng xe và bảo đảm an toàn.' },
    ],
    checkpoints: [
      'Ô tô là tổ hợp nhiều hệ thống phối hợp: nguồn động lực, truyền lực, di chuyển, điều khiển, điện - điện tử và thân vỏ.',
      'Hệ thống truyền lực quyết định việc công suất có đến bánh xe chủ động hay không.',
      'Hệ thống lái và phanh liên quan trực tiếp đến an toàn khi tham gia giao thông.',
    ],
    teacherPrompts: [
      'Khi động cơ hoạt động nhưng xe không chuyển động, nên kiểm tra hệ thống nào trước?',
      'Vì sao phanh và lốp phải được kiểm tra thường xuyên trước khi tham gia giao thông?',
    ],
  },
}

const technology10Simulations = {
  1: {
    modelId: 1,
    label: 'KNTT 10 - Chương I',
    title: 'Đại cương về công nghệ',
    subtitle: 'Công nghệ, hệ thống kĩ thuật, công nghệ mới và đánh giá công nghệ',
    objective:
      'Mô phỏng cách một nhu cầu đời sống được chuyển thành giải pháp công nghệ: xác định vấn đề, thiết kế hệ thống, triển khai công nghệ và đánh giá tác động.',
    layers: [
      { id: 'requirement', name: 'Nhu cầu', note: 'Xác định vấn đề, người dùng, bối cảnh và tiêu chí cần đạt.' },
      { id: 'design', name: 'Hệ thống kĩ thuật', note: 'Phân tích đầu vào, xử lí, đầu ra và điều khiển của giải pháp.' },
      { id: 'manufacture', name: 'Công nghệ triển khai', note: 'Chọn công nghệ phổ biến hoặc công nghệ mới phù hợp nguồn lực.' },
      { id: 'inspection', name: 'Đánh giá công nghệ', note: 'So sánh hiệu quả, chi phí, an toàn, môi trường và tác động xã hội.' },
    ],
    checkpoints: [
      'Công nghệ là giải pháp, quy trình, tri thức và phương tiện để giải quyết nhu cầu thực tiễn.',
      'Hệ thống kĩ thuật có thể phân tích theo đầu vào, xử lí, đầu ra và điều khiển.',
      'Đánh giá công nghệ giúp chọn giải pháp phù hợp, không chỉ chọn giải pháp hiện đại nhất.',
    ],
    teacherPrompts: [
      'Một công nghệ mới có luôn là lựa chọn tốt nhất không? Vì sao?',
      'Khi đánh giá một sản phẩm công nghệ, em cần xét những tiêu chí nào?',
    ],
  },
  2: {
    modelId: 2,
    label: 'KNTT 10 - Chương II',
    title: 'Vẽ kĩ thuật',
    subtitle: 'Từ vật thể, hình biểu diễn đến bản vẽ CAD',
    objective:
      'Mô phỏng quy trình đọc và tạo bản vẽ kĩ thuật: quan sát vật thể, chọn cách biểu diễn, ghi kích thước, kiểm tra tiêu chuẩn và CAD hóa.',
    layers: [
      { id: 'material', name: 'Vật thể', note: 'Nhận diện hình dạng, lỗ, rãnh, cạnh khuất và phần cần biểu diễn.' },
      { id: 'blank', name: 'Hình biểu diễn', note: 'Chọn hình chiếu vuông góc, hình cắt, mặt cắt, trục đo hoặc phối cảnh.' },
      { id: 'machining', name: 'Tiêu chuẩn bản vẽ', note: 'Dùng đúng khổ giấy, tỉ lệ, nét vẽ, chữ viết, kí hiệu và ghi kích thước.' },
      { id: 'measure', name: 'CAD', note: 'Tạo, sửa, lưu trữ và chia sẻ bản vẽ nhanh, chính xác, dễ cập nhật.' },
    ],
    checkpoints: [
      'Bản vẽ kĩ thuật là ngôn ngữ chung trong thiết kế, chế tạo và thi công.',
      'Hình cắt, mặt cắt giúp biểu diễn cấu tạo bên trong khi hình chiếu chưa đủ rõ.',
      'CAD tăng tốc thao tác nhưng vẫn phải tuân thủ tiêu chuẩn trình bày bản vẽ.',
    ],
    teacherPrompts: [
      'Khi nào nên dùng hình cắt thay vì chỉ dùng hình chiếu?',
      'Vì sao bản vẽ CAD vẫn cần đúng tiêu chuẩn kĩ thuật?',
    ],
  },
  3: {
    modelId: 1,
    label: 'KNTT 10 - Chương III',
    title: 'Thiết kế kĩ thuật',
    subtitle: 'Từ vấn đề thực tiễn đến nguyên mẫu và cải tiến',
    objective:
      'Mô phỏng vòng lặp thiết kế kĩ thuật tốc độ cao: xác định vấn đề, đề xuất giải pháp, tạo nguyên mẫu, thử nghiệm và cải tiến.',
    layers: [
      { id: 'requirement', name: 'Vấn đề - tiêu chí', note: 'Làm rõ nhu cầu, ràng buộc, điều kiện sử dụng và tiêu chí đánh giá.' },
      { id: 'design', name: 'Ý tưởng - phương án', note: 'Phác thảo, sơ đồ hóa, mô hình hóa và so sánh nhiều giải pháp.' },
      { id: 'manufacture', name: 'Nguyên mẫu', note: 'Chế tạo mẫu nhanh bằng vật liệu, CAD, mô phỏng hoặc in 3D phù hợp.' },
      { id: 'inspection', name: 'Thử nghiệm - cải tiến', note: 'Đo kết quả, ghi lỗi, lấy phản hồi và hoàn thiện thiết kế.' },
    ],
    checkpoints: [
      'Thiết kế kĩ thuật là hoạt động giải quyết vấn đề thực tiễn bằng giải pháp kĩ thuật.',
      'Quy trình thiết kế là vòng lặp, có thử nghiệm và cải tiến.',
      'Giải pháp tốt cần cân bằng công năng, an toàn, chi phí, thẩm mĩ và môi trường.',
    ],
    teacherPrompts: [
      'Vì sao thiết kế kĩ thuật cần tạo nguyên mẫu trước khi hoàn thiện?',
      'Nếu phương án rẻ nhưng không an toàn, có nên chọn không?',
    ],
  },
}

const mechanical11SpecializedSimulations = {
  1: {
    modelId: 1,
    label: 'KNTT 11 - Chuyên đề I',
    title: 'Dự án nghiên cứu kĩ thuật cơ khí',
    subtitle: 'Từ vấn đề thực tiễn đến mô hình, đo kiểm, báo cáo và cải tiến',
    objective:
      'Mô phỏng lộ trình học theo dự án cơ khí: xác định vấn đề, lập kế hoạch, chế tạo mô hình, thử nghiệm, đo kiểm, báo cáo và phản biện.',
    layers: [
      { id: 'requirement', name: 'Vấn đề', note: 'Xác định nhu cầu, mục tiêu, tiêu chí, ràng buộc và minh chứng cần thu thập.' },
      { id: 'design', name: 'Kế hoạch', note: 'Đề xuất phương án, phân công nhiệm vụ, chọn vật liệu, dụng cụ, tiến độ và an toàn.' },
      { id: 'manufacture', name: 'Chế tạo thử', note: 'Gia công, lắp ráp, vận hành mô hình và ghi dữ liệu thử nghiệm.' },
      { id: 'inspection', name: 'Đo kiểm - báo cáo', note: 'So sánh kết quả với tiêu chí, nêu lỗi, cải tiến và trình bày minh chứng.' },
    ],
    checkpoints: [
      'Dự án cơ khí phải bắt đầu từ vấn đề hoặc nhu cầu thực tế.',
      'Sản phẩm dự án cần có tiêu chí đánh giá, dữ liệu thử nghiệm và minh chứng kĩ thuật.',
      'Báo cáo tốt không chỉ mô tả sản phẩm mà còn giải thích quyết định thiết kế và hướng cải tiến.',
    ],
    teacherPrompts: [
      'Tiêu chí nào chứng minh mô hình cơ khí đã hoạt động đúng yêu cầu?',
      'Nếu thử nghiệm không đạt, cần quay lại khâu ý tưởng, vật liệu hay chế tạo?',
    ],
  },
  2: {
    modelId: 2,
    label: 'KNTT 11 - Chuyên đề II',
    title: 'Chuỗi CAD/CAM-CNC',
    subtitle: 'Thiết kế số, lập trình gia công, vận hành CNC và đo kiểm',
    objective:
      'Mô phỏng chuỗi sản xuất hiện đại: CAD tạo dữ liệu thiết kế, CAM tạo đường chạy dao, CNC gia công chi tiết và đo kiểm phản hồi.',
    layers: [
      { id: 'material', name: 'Yêu cầu chi tiết', note: 'Công dụng, vật liệu, kích thước, dung sai, bề mặt và số lượng sản phẩm.' },
      { id: 'blank', name: 'CAD', note: 'Tạo mô hình 2D/3D và bản vẽ kĩ thuật làm dữ liệu đầu vào.' },
      { id: 'machining', name: 'CAM - CNC', note: 'Chọn dao, đường chạy dao, mô phỏng, xuất chương trình và máy CNC gia công.' },
      { id: 'measure', name: 'Đo kiểm', note: 'Kiểm tra kích thước, hình dạng, bề mặt và phản hồi để hiệu chỉnh.' },
    ],
    checkpoints: [
      'CAD, CAM và CNC tạo thành chuỗi thiết kế - chế tạo số.',
      'Mô phỏng CAM giúp phát hiện va chạm hoặc sai đường chạy dao trước khi gia công thật.',
      'Đo kiểm là căn cứ để xác nhận chi tiết đạt yêu cầu hoặc cần hiệu chỉnh chương trình.',
    ],
    teacherPrompts: [
      'Vì sao không nên chạy CNC khi chưa mô phỏng đường chạy dao?',
      'Sai số kích thước có thể đến từ CAD, CAM, gá đặt hay dao cắt?',
    ],
  },
  3: {
    modelId: 1,
    label: 'KNTT 11 - Chuyên đề III',
    title: 'Công nghệ in 3D',
    subtitle: 'Mô hình 3D, cắt lớp, in từng lớp, hậu xử lí và cải tiến',
    objective:
      'Mô phỏng công nghệ chế tạo đắp lớp: từ mô hình số đến cắt lớp, in vật thể, hậu xử lí, đo kiểm và tối ưu thông số.',
    layers: [
      { id: 'requirement', name: 'Yêu cầu vật thể', note: 'Xác định công dụng, kích thước, vật liệu, độ bền, độ nhẵn và tiêu chí đánh giá.' },
      { id: 'design', name: 'Mô hình 3D', note: 'Thiết kế hoặc quét mẫu, kiểm tra lỗi hình học và xuất dữ liệu STL/OBJ.' },
      { id: 'manufacture', name: 'Cắt lớp - in', note: 'Thiết lập chiều cao lớp, mật độ điền đầy, hỗ trợ, nhiệt độ, tốc độ và in từng lớp.' },
      { id: 'inspection', name: 'Hậu xử lí', note: 'Gỡ hỗ trợ, làm sạch, đo kiểm, đánh giá lỗi in và cải tiến thông số.' },
    ],
    checkpoints: [
      'In 3D là công nghệ chế tạo đắp lớp từ dữ liệu mô hình số.',
      'Chất lượng vật thể phụ thuộc vào thiết kế, vật liệu, thông số cắt lớp và điều kiện in.',
      'Hậu xử lí và đo kiểm giúp xác nhận sản phẩm mẫu có đạt tiêu chí hay không.',
    ],
    teacherPrompts: [
      'Thông số nào làm thay đổi thời gian in và độ bền vật thể?',
      'Khi vật thể bị cong vênh, nên kiểm tra mô hình, bàn in hay nhiệt độ?',
    ],
  },
}

const industrial12Simulations = {
  1: {
    modelId: 1,
    label: 'KNTT 12 - Chương I',
    title: 'Kĩ thuật điện trong đời sống',
    subtitle: 'Vai trò, thiết bị, vận hành an toàn và định hướng nghề nghiệp',
    objective:
      'Mô phỏng cách kĩ thuật điện chuyển đổi, phân phối, điều khiển và sử dụng điện năng trong đời sống hiện đại.',
    layers: [
      { id: 'requirement', name: 'Nhu cầu điện năng', note: 'Sản xuất, sinh hoạt, giao thông và công nghệ số cần điện ổn định.' },
      { id: 'design', name: 'Thiết bị điện', note: 'Máy điện, khí cụ điện, dây dẫn, thiết bị đo, bảo vệ và điều khiển.' },
      { id: 'manufacture', name: 'Vận hành', note: 'Lắp đặt, đo kiểm, bảo trì và sử dụng đúng thông số.' },
      { id: 'inspection', name: 'An toàn', note: 'Cách điện, bảo vệ, nối đất và quy trình thao tác giúp giảm tai nạn.' },
    ],
    checkpoints: [
      'Kĩ thuật điện là nền tảng của sản xuất, đời sống và chuyển đổi năng lượng.',
      'Hệ thống điện phải bảo đảm an toàn, tin cậy, tiết kiệm và hiệu quả.',
      'Người học cần biết đọc sơ đồ, đo kiểm và tuân thủ quy trình an toàn.',
    ],
    teacherPrompts: [
      'Vì sao nghề điện yêu cầu thao tác chính xác và tuân thủ quy trình?',
      'Thiết bị bảo vệ có vai trò gì khi hệ thống điện gặp sự cố?',
    ],
  },
  2: {
    modelId: 4,
    label: 'KNTT 12 - Chương II',
    title: 'Hệ thống điện quốc gia',
    subtitle: 'Nguồn điện, truyền tải, phân phối, phụ tải và điều độ',
    objective:
      'Mô phỏng dòng điện năng từ nhà máy điện qua lưới truyền tải, trạm biến áp, lưới phân phối đến phụ tải.',
    layers: [
      { id: 'cnc', name: 'Nguồn điện', note: 'Nhà máy điện hoặc nguồn tái tạo biến đổi năng lượng sơ cấp thành điện năng.' },
      { id: 'robot', name: 'Truyền tải', note: 'Điện áp cao giúp truyền điện đi xa và giảm tổn thất.' },
      { id: 'sensor', name: 'Điều độ - bảo vệ', note: 'Đo lường, bảo vệ, điều khiển và giám sát giúp hệ thống ổn định.' },
      { id: 'safety', name: 'Phụ tải', note: 'Nhà ở, trường học, nhà máy và dịch vụ nhận điện đúng cấp điện áp.' },
    ],
    checkpoints: [
      'Hệ thống điện quốc gia gồm nguồn điện, lưới điện, phụ tải và điều khiển - bảo vệ.',
      'Truyền tải điện áp cao giúp giảm tổn thất khi đưa điện đi xa.',
      'Lưới điện thông minh tăng khả năng giám sát, tự động hóa và tích hợp năng lượng tái tạo.',
    ],
    teacherPrompts: [
      'Vì sao cần trạm biến áp trong hệ thống điện?',
      'Nguồn năng lượng tái tạo làm hệ thống điện cần điều khiển linh hoạt hơn như thế nào?',
    ],
  },
  3: {
    modelId: 2,
    label: 'KNTT 12 - Chương III/IV',
    title: 'Mạng điện trong nhà và an toàn điện',
    subtitle: 'Nguồn cấp, bảo vệ, dây dẫn, điều khiển, phụ tải và kiểm tra',
    objective:
      'Mô phỏng mạng điện gia đình theo sơ đồ nguồn, thiết bị bảo vệ, dây dẫn, công tắc, ổ cắm, phụ tải và nguyên tắc an toàn.',
    layers: [
      { id: 'material', name: 'Nguồn cấp', note: 'Điện từ lưới vào công tơ, bảng điện hoặc tủ điện gia đình.' },
      { id: 'blank', name: 'Bảo vệ', note: 'Aptomat, cầu chì, thiết bị chống rò và nối đất phòng sự cố.' },
      { id: 'machining', name: 'Dây dẫn - điều khiển', note: 'Chọn tiết diện, cách điện, bố trí công tắc, ổ cắm và bảng điện.' },
      { id: 'measure', name: 'Phụ tải - kiểm tra', note: 'Thiết bị sử dụng điện cần đúng công suất, môi trường và được kiểm tra định kì.' },
    ],
    checkpoints: [
      'Mạng điện trong nhà phải thuận tiện, an toàn, tin cậy và dễ kiểm tra.',
      'Thiết bị bảo vệ phải chọn đúng thông số để ngắt khi quá tải, ngắn mạch hoặc rò điện.',
      'Khi có sự cố điện phải ngắt nguồn trước khi xử lí hoặc cứu người.',
    ],
    teacherPrompts: [
      'Sơ đồ nguyên lí khác sơ đồ lắp đặt ở điểm nào?',
      'Vì sao không được thay cầu chì hoặc aptomat bằng loại sai định mức?',
    ],
  },
  5: {
    modelId: 8,
    label: 'KNTT 12 - Điện tử',
    title: 'Thí nghiệm mô phỏng mạch điện tử',
    subtitle: 'Nguồn thấp áp, cảm biến, xử lí tín hiệu, cổng logic, driver và đầu ra',
    objective:
      'Mô phỏng một mạch điện tử học sinh có thể quan sát theo sơ đồ khối: tín hiệu vào được cảm biến thu nhận, chuẩn hóa, xử lí logic rồi điều khiển LED/còi qua driver công suất.',
    layers: [
      { id: 'input', name: 'Tín hiệu vào', note: 'Nút nhấn, cảm biến khói, ánh sáng hoặc nhiệt độ tạo trạng thái 0/1 cho mạch.' },
      { id: 'sensor', name: 'Cảm biến - chuẩn hóa', note: 'Cảm biến và mạch điện trở/khuếch đại/so sánh đưa tín hiệu về mức logic ổn định.' },
      { id: 'logic', name: 'Cổng logic', note: 'AND, OR, NOT hoặc IC logic quyết định đầu ra theo bảng chân lí.' },
      { id: 'microcontroller', name: 'Vi điều khiển', note: 'Đọc tín hiệu, chống nhiễu đơn giản, xử lí điều kiện và phát lệnh điều khiển.' },
      { id: 'driver', name: 'Driver công suất', note: 'Transistor, rơle hoặc IC driver khuếch dòng để bảo vệ khối xử lí khi điều khiển tải.' },
      { id: 'output', name: 'Đầu ra', note: 'LED, còi, quạt nhỏ hoặc rơle báo trạng thái hoạt động của mạch.' },
    ],
    checkpoints: [
      'Mạch điện tử thí nghiệm nên dùng nguồn thấp áp và kiểm tra cực tính linh kiện trước khi cấp nguồn.',
      'Tín hiệu số thường được quy ước bằng hai mức logic 0 và 1; cổng logic tạo quyết định từ các mức này.',
      'Vi điều khiển không nên cấp trực tiếp dòng lớn cho tải; cần transistor, rơle hoặc driver trung gian.',
      'Đo kiểm từng khối giúp tìm lỗi nhanh hơn: nguồn, cảm biến, logic, chương trình, driver và đầu ra.',
    ],
    teacherPrompts: [
      'Nếu cảm biến khói = 1 và cảm biến nhiệt = 1 thì dùng cổng AND hay OR để kích còi? Vì sao?',
      'Vì sao phải đặt điện trở hạn dòng cho LED?',
      'Nếu LED không sáng, em sẽ kiểm tra lần lượt những khối nào?',
    ],
  },
  8: {
    modelId: 8,
    label: 'KNTT 12 - Chương VIII',
    title: 'Thí nghiệm mạch điện tử số',
    subtitle: 'Cảm biến, mức logic 0/1, cổng AND/OR/NOT, vi điều khiển và đầu ra cảnh báo',
    objective:
      'Mô phỏng thí nghiệm mạch báo cháy/đèn cảnh báo dùng tín hiệu số. Học sinh quan sát đường đi tín hiệu, thay đổi điều kiện vào và giải thích vì sao đầu ra bật hoặc tắt.',
    layers: [
      { id: 'input', name: 'Tín hiệu vào 0/1', note: 'Cảm biến khói, cảm biến nhiệt hoặc nút nhấn tạo tín hiệu logic đầu vào.' },
      { id: 'sensor', name: 'Chuẩn hóa tín hiệu', note: 'Mạch điện trở, lọc nhiễu hoặc so sánh giúp tín hiệu đủ rõ để đưa vào cổng logic.' },
      { id: 'logic', name: 'Cổng logic', note: 'Cổng AND/OR/NOT tạo điều kiện báo động theo bảng chân lí.' },
      { id: 'microcontroller', name: 'Vi điều khiển', note: 'Có thể đọc tín hiệu logic, xử lí thêm thời gian trễ, ghi trạng thái và phát lệnh.' },
      { id: 'driver', name: 'Driver', note: 'Transistor hoặc rơle nhận lệnh dòng nhỏ và điều khiển tải dòng lớn hơn.' },
      { id: 'output', name: 'LED / còi báo', note: 'Đầu ra sáng hoặc kêu khi điều kiện logic đúng.' },
    ],
    checkpoints: [
      'Bảng chân lí giúp dự đoán chính xác đầu ra của mạch số.',
      'Cổng AND yêu cầu tất cả điều kiện đúng; cổng OR chỉ cần ít nhất một điều kiện đúng; cổng NOT đảo trạng thái.',
      'Driver bảo vệ vi điều khiển và cho phép điều khiển tải cần dòng lớn hơn.',
      'Một mạch thí nghiệm tốt cần có nguồn thấp áp, điện trở hạn dòng, nối đất chung và kiểm tra cực tính.',
    ],
    teacherPrompts: [
      'Nếu chỉ cần một trong hai cảm biến phát hiện nguy hiểm thì nên dùng cổng nào?',
      'Nếu muốn nút tắt khẩn cấp làm đầu ra tắt ngay, tín hiệu đó nên đặt ở đâu trong logic?',
    ],
  },
  9: {
    modelId: 7,
    label: 'KNTT 12 - Chương IX',
    title: 'Dự án vi điều khiển',
    subtitle: 'Đầu vào, chương trình, xử lí, đầu ra, kiểm thử và cải tiến',
    objective:
      'Mô phỏng hệ thống vi điều khiển: đọc cảm biến hoặc nút nhấn, chạy chương trình, điều khiển thiết bị và kiểm thử theo tiêu chí.',
    layers: [
      { id: 'powertrain', name: 'Yêu cầu', note: 'Xác định điều kiện kích hoạt, thiết bị cần điều khiển và tiêu chí an toàn.' },
      { id: 'transmission', name: 'Đầu vào', note: 'Nút nhấn, cảm biến ánh sáng, nhiệt độ, khoảng cách hoặc tín hiệu số.' },
      { id: 'chassis', name: 'Vi điều khiển', note: 'Bộ xử lí, bộ nhớ, chân vào/ra và chương trình phối hợp xử lí.' },
      { id: 'control', name: 'Đầu ra', note: 'LED, rơle, động cơ, còi hoặc màn hình nhận lệnh điều khiển.' },
    ],
    checkpoints: [
      'Chương trình vi điều khiển thường gồm khởi tạo, đọc đầu vào, xử lí, điều khiển đầu ra và lặp lại.',
      'Kết nối vào/ra phải đúng điện áp, dòng điện, cực tính và chân tín hiệu.',
      'Kiểm thử từng phần giúp phát hiện lỗi nối dây, lỗi nguồn hoặc lỗi chương trình.',
    ],
    teacherPrompts: [
      'Vì sao không nên nối trực tiếp động cơ lớn vào chân vi điều khiển?',
      'Một dự án điều khiển thiết bị cần những tiêu chí kiểm tra nào?',
    ],
  },
}

const blastFurnaceSimulation = {
  modelId: 20,
  label: 'KNTT - Bài 4',
  title: 'Mô hình sản xuất gang - thép trong lò cao',
  subtitle: 'Quặng sắt, than cốc, đá vôi, gió nóng, gang lỏng, xỉ và khí thải',
  objective:
    'Mô phỏng theo hình sản xuất gang - thép trong lò cao: vật liệu nạp từ miệng lò đi xuống, gió nóng thổi từ đáy lò đi lên, tạo phản ứng khử oxit sắt để thu gang lỏng và tách xỉ.',
  layers: [
    { id: 'furnace', name: 'Lò cao', note: 'Thân lò chịu nhiệt, nơi diễn ra quá trình cháy, khử oxit sắt, nóng chảy và tách gang - xỉ.' },
    { id: 'charge', name: 'Nạp liệu', note: 'Quặng sắt, than cốc và đá vôi được đưa vào đỉnh lò theo từng lớp.' },
    { id: 'hotBlast', name: 'Gió nóng', note: 'Không khí nóng thổi vào đáy lò giúp than cốc cháy, tạo nhiệt độ cao và khí khử.' },
    { id: 'products', name: 'Gang - xỉ', note: 'Gang lỏng chảy ra cửa tháo gang; xỉ nhẹ hơn nổi lên và được tháo riêng.' },
    { id: 'gas', name: 'Khí thải', note: 'Khí sau phản ứng đi lên đỉnh lò, cần được thu hồi, xử lí hoặc tận dụng nhiệt.' },
  ],
  checkpoints: [
    'Nguyên liệu chính gồm quặng sắt, than cốc và đá vôi; mỗi thành phần có nhiệm vụ riêng trong lò cao.',
    'Gió nóng đi từ dưới lên, còn vật liệu rắn đi từ trên xuống, tạo quá trình trao đổi nhiệt và phản ứng liên tục.',
    'Gang lỏng và xỉ được tách ở đáy lò; khí thải ra ở đỉnh lò cần được xử lí để giảm tác động môi trường.',
  ],
  teacherPrompts: [
    'Vì sao than cốc vừa là nhiên liệu vừa tham gia tạo khí khử trong lò cao?',
    'Đá vôi có vai trò gì trong việc tạo xỉ và loại bỏ tạp chất?',
    'Nếu gió nóng cấp vào không đủ thì năng suất và chất lượng gang bị ảnh hưởng như thế nào?',
  ],
}
const getSimulationKey = (lesson) => {
  if (!lesson) return 1
  if (Number(lesson.grade_level) === 11 && Number(lesson.source_id || lesson.id) === 202) {
    return 'blastFurnace'
  }
  return lesson.source_course_id || lesson.course_id || 1
}

const getIndustrial12Simulation = (simulationKey) => {
  if (simulationKey === 4) return industrial12Simulations[3]
  if (simulationKey >= 5 && simulationKey <= 8) return industrial12Simulations[simulationKey] || industrial12Simulations[5]
  return industrial12Simulations[simulationKey] || industrial12Simulations[1]
}

const dieselFourStrokeSimulation = {
  ...knttSimulations[6],
  label: 'Bài 18',
  title: 'Mô hình 3D nguyên lí động cơ 4 kì',
  subtitle: 'Nạp, nén, cháy - giãn nở và thải theo Bài 18 Công nghệ 11',
  objective:
    'Mô phỏng nguyên lí làm việc của động cơ 4 kì trên lược đồ động cơ đốt trong: piston chuyển động giữa ĐCT và ĐCD, hành trình S, đường kính xi lanh D, bán kính quay trục khuỷu R, cùng cơ cấu phối khí và quá trình sinh công.',
  layers: [
    { id: 'intake', name: 'a. Kì nạp', note: 'Piston đi xuống, xupap nạp mở, không khí được hút qua ống nạp vào xi lanh; xupap thải đóng.' },
    { id: 'compression', name: 'b. Kì nén', note: 'Piston đi lên, hai xupap đều đóng, không khí trong xi lanh bị nén tới áp suất và nhiệt độ cao.' },
    { id: 'power', name: 'c. Kì cháy - giãn nở', note: 'Vòi phun phun nhiên liệu vào không khí nóng; nhiên liệu tự bốc cháy, khí giãn nở đẩy piston đi xuống sinh công.' },
    { id: 'exhaust', name: 'd. Kì thải', note: 'Piston đi lên, xupap thải mở, khí thải được đẩy qua ống thải ra ngoài; xupap nạp đóng.' },
  ],
  checkpoints: [
    'Piston chuyển động tịnh tiến trong xi lanh từ ĐCT đến ĐCD hoặc ngược lại; quãng đường đó là hành trình S.',
    'Động cơ 4 kì hoàn thành một chu trình công tác trong bốn hành trình piston, tương ứng hai vòng quay trục khuỷu.',
    'Ở cuối kì nén, động cơ xăng dùng bugi đánh lửa còn động cơ Diesel phun nhiên liệu vào không khí nóng để tự bốc cháy.',
    'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của piston thành chuyển động quay của trục khuỷu; bán kính quay R liên hệ với hành trình piston.',
  ],
  teacherPrompts: [
    'Vì sao kì cháy - giãn nở được gọi là kì sinh công?',
    'Ở những kì nào hai xupap đều đóng, và điều đó giúp quá trình trong xi lanh diễn ra như thế nào?',
  ],
}

const nova3D = {
  name: 'Nova 3D',
  mode: 'Lesson simulation',
  status: 'Đang dựng mô hình bài học',
  description: 'Lớp mô phỏng Nova 3D giúp quan sát cấu tạo, chuyển động và các điểm kiến thức chính trong cùng một không gian.',
}

const fourStrokeEngineNovaPrompt = `
Create a structured, editable GLB model for a Vietnamese Grade 11 Technology textbook lesson:
"Mô hình cắt bổ và nguyên lí làm việc của động cơ đốt trong 4 kì".

Model an educational single-cylinder four-stroke engine with separate named parts:
- cylinder block and transparent cylinder wall
- piston
- piston pin
- connecting rod
- crankshaft, crank web, and crank pin
- crankcase
- intake valve and exhaust valve
- valve springs and camshaft
- intake manifold and exhaust manifold
- central spark plug or diesel injector
- combustion chamber
- blue arrows for fresh charge entering through the intake valve
- orange arrows for exhaust gas out of the exhaust port
- yellow/orange combustion volume above the piston

Show the textbook working principle:
1. Intake stroke: piston moves from TDC to BDC, intake valve open, exhaust valve closed.
2. Compression stroke: piston moves from BDC to TDC, both valves closed.
3. Power stroke: ignition occurs near TDC; expanding gas drives the piston to BDC, both valves closed.
4. Exhaust stroke: piston moves from BDC to TDC, exhaust valve open, intake valve closed.

The crankshaft must rotate exactly two revolutions per complete four-stroke cycle and the camshaft one revolution. Keep the piston, connecting rod, crank pin, and crankshaft mechanically aligned throughout the animation.

Preserve semantic part names in the scene graph. Keep parts separated and editable, not a single merged mesh.
Use simple textbook-style colors, clean geometry, and no decorative background. Prioritize correct working principle over visual complexity.
`.trim()

const material = (color, opacity = 1) => {
  const meshMaterial = new THREE.MeshPhongMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  })
  meshMaterial.userData.baseOpacity = opacity
  return meshMaterial
}

const box = (w, h, d, color, opacity = 1) =>
  new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color, opacity))

const cylinder = (r, h, color, opacity = 1) =>
  new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), material(color, opacity))

const cone = (r, h, color, opacity = 1) =>
  new THREE.Mesh(new THREE.ConeGeometry(r, h, 32), material(color, opacity))

function createFlowArrow(length, color) {
  const group = new THREE.Group()
  const shaft = cylinder(0.045, length, color, 0.85)
  shaft.rotation.z = Math.PI / 2
  group.add(shaft)
  const head = cone(0.13, 0.32, color, 0.9)
  head.rotation.z = -Math.PI / 2
  head.position.x = length / 2 + 0.12
  group.add(head)
  return group
}

function addLabelBlock(group, x, y, z, color) {
  const marker = cylinder(0.08, 0.25, color)
  marker.position.set(x, y, z)
  marker.rotation.x = Math.PI / 2
  group.add(marker)
}

function addAnnotation(annotations, parent, layerId, label, note, x, y, z) {
  const anchor = new THREE.Object3D()
  anchor.position.set(x, y, z)
  parent.add(anchor)
  annotations.push({ anchor, layerId, label, note })
}

function setLayerName(object, layerId) {
  object.name = layerId
  object.traverse((part) => {
    if (part.isMesh) part.name = layerId
  })
  return object
}

function buildBlastFurnaceModel() {
  const root = new THREE.Group()
  const animated = []
  const annotations = []

  const floor = box(7.2, 0.12, 3.2, 0xe2e8f0)
  floor.position.set(0, -0.7, 0)
  root.add(floor)

  const furnace = setLayerName(new THREE.Group(), 'furnace')
  const shaft = cylinder(0.72, 3.45, 0x334155, 0.24)
  shaft.position.y = 0.95
  furnace.add(shaft)
  const belly = cylinder(0.92, 0.72, 0x475569, 0.32)
  belly.position.y = -0.15
  furnace.add(belly)
  const hearth = cylinder(0.82, 0.5, 0x1f2937, 0.82)
  hearth.position.y = -0.52
  furnace.add(hearth)
  const topBell = cone(0.58, 0.42, 0x64748b, 0.78)
  topBell.position.y = 2.9
  furnace.add(topBell)
  const flame = cone(0.42, 0.82, 0xf97316, 0.62)
  flame.position.y = -0.18
  furnace.add(flame)
  animated.push({ mesh: flame, type: 'blastFlame' })

  const oreLayer = cylinder(0.46, 0.32, 0xef4444, 0.84)
  oreLayer.position.y = 1.9
  furnace.add(oreLayer)
  const cokeLayer = cylinder(0.48, 0.32, 0x111827, 0.84)
  cokeLayer.position.y = 1.48
  furnace.add(cokeLayer)
  const limestoneLayer = cylinder(0.5, 0.32, 0xf8fafc, 0.84)
  limestoneLayer.position.y = 1.06
  furnace.add(limestoneLayer)
  root.add(furnace)

  const charge = setLayerName(new THREE.Group(), 'charge')
  const rail = box(0.08, 4.1, 0.08, 0x475569)
  rail.rotation.z = -0.72
  rail.position.set(-1.35, 1.25, 0)
  charge.add(rail)
  const bucket = box(0.42, 0.3, 0.38, 0xf59e0b)
  bucket.position.set(-2.18, 0.28, 0)
  bucket.rotation.z = -0.15
  charge.add(bucket)
  animated.push({ mesh: bucket, type: 'chargeBucket' })
  const chargeArrow = setLayerName(createFlowArrow(1.15, 0xfacc15), 'charge')
  chargeArrow.rotation.z = -0.85
  chargeArrow.position.set(-0.82, 2.35, 0.02)
  charge.add(chargeArrow)
  animated.push({ mesh: chargeArrow, type: 'flowPulse' })
  root.add(charge)

  const hotBlast = setLayerName(new THREE.Group(), 'hotBlast')
  const leftStove = cylinder(0.28, 2.35, 0x60a5fa, 0.35)
  leftStove.position.set(-2.95, 0.55, 0)
  hotBlast.add(leftStove)
  const rightStove = cylinder(0.28, 2.35, 0xf9a8d4, 0.35)
  rightStove.position.set(2.95, 0.55, 0)
  hotBlast.add(rightStove)
  const leftPipe = box(2.35, 0.12, 0.12, 0x0284c7)
  leftPipe.position.set(-1.78, -0.42, 0)
  hotBlast.add(leftPipe)
  const rightPipe = box(2.35, 0.12, 0.12, 0xec4899)
  rightPipe.position.set(1.78, -0.42, 0)
  hotBlast.add(rightPipe)
  const blastArrow = setLayerName(createFlowArrow(1.35, 0xf97316), 'hotBlast')
  blastArrow.position.set(-1.62, -0.2, 0.18)
  hotBlast.add(blastArrow)
  animated.push({ mesh: blastArrow, type: 'flowPulse' })
  root.add(hotBlast)

  const products = setLayerName(new THREE.Group(), 'products')
  const ironRunner = box(2.4, 0.1, 0.22, 0xf97316, 0.88)
  ironRunner.position.set(1.42, -0.76, 0.34)
  products.add(ironRunner)
  const slagRunner = box(2.1, 0.08, 0.18, 0xfacc15, 0.8)
  slagRunner.position.set(-1.28, -0.62, -0.38)
  products.add(slagRunner)
  const moltenDrop = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), material(0xff6b00, 0.84))
  moltenDrop.position.set(0.45, -0.73, 0.34)
  products.add(moltenDrop)
  animated.push({ mesh: moltenDrop, type: 'moltenPulse' })
  root.add(products)

  const gas = setLayerName(new THREE.Group(), 'gas')
  const gasArrow = setLayerName(createFlowArrow(1.1, 0x94a3b8), 'gas')
  gasArrow.rotation.z = Math.PI / 2
  gasArrow.position.set(0.18, 2.65, 0)
  gas.add(gasArrow)
  animated.push({ mesh: gasArrow, type: 'flowPulse' })
  const gasPipe = box(1.65, 0.1, 0.1, 0x64748b, 0.7)
  gasPipe.position.set(1.12, 2.8, 0)
  gas.add(gasPipe)
  root.add(gas)

  addAnnotation(annotations, root, 'furnace', 'Lò cao', 'Thân lò nơi quặng sắt, than cốc, đá vôi đi xuống và phản ứng với khí nóng đi lên.', 0, 2.45, 0)
  addAnnotation(annotations, root, 'charge', 'Nạp liệu', 'Quặng sắt, than cốc và đá vôi được đưa vào miệng lò theo từng lớp.', -2.35, 2.2, 0)
  addAnnotation(annotations, root, 'hotBlast', 'Gió nóng', 'Không khí nóng thổi vào đáy lò giúp than cốc cháy, tạo nhiệt và khí khử.', -2.72, -0.1, 0)
  addAnnotation(annotations, root, 'products', 'Gang lỏng và xỉ', 'Gang lỏng chảy ra cửa tháo gang; xỉ nhẹ hơn được tách ra ở cửa xỉ.', 1.72, -0.42, 0.45)
  addAnnotation(annotations, root, 'gas', 'Khí thải', 'Khí sau phản ứng đi lên đỉnh lò và được dẫn ra ngoài để xử lí hoặc tận dụng nhiệt.', 1.38, 2.98, 0)

  return { root, animated, annotations }
}
function buildChapterModel(courseId, engineMode = 'twoStroke') {
  const root = new THREE.Group()
  const animated = []
  const annotations = []

  if (courseId === 20) {
    return buildBlastFurnaceModel()
  }

  if (courseId === 1) {
    const stations = [
      ['requirement', -3, 0, 0, 0x2563eb],
      ['design', -1, 0, 0, 0x0ea5e9],
      ['manufacture', 1, 0, 0, 0xf97316],
      ['inspection', 3, 0, 0, 0x16a34a],
    ]
    stations.forEach(([id, x, y, z, color]) => {
      const station = box(1.1, 0.7, 1.1, color)
      station.name = id
      station.position.set(x, y, z)
      root.add(station)
      addLabelBlock(root, x, 0.75, z, color)
    })
    addAnnotation(annotations, root, 'requirement', 'Nhu cầu / yêu cầu', 'Công dụng, điều kiện làm việc, yêu cầu kĩ thuật', -3, 1.25, 0)
    addAnnotation(annotations, root, 'design', 'Thiết kế cơ khí', 'Bản vẽ, tính toán, mô phỏng trước khi chế tạo', -1, 1.25, 0)
    addAnnotation(annotations, root, 'manufacture', 'Chế tạo - lắp ráp', 'Gia công chi tiết và lắp thành cụm/sản phẩm', 1, 1.25, 0)
    addAnnotation(annotations, root, 'inspection', 'Kiểm tra chất lượng', 'Đo kiểm kích thước, độ chính xác, an toàn', 3, 1.25, 0)
    for (let i = 0; i < 3; i += 1) {
      const line = box(0.8, 0.08, 0.08, 0x64748b)
      line.position.set(-2 + i * 2, 0, 0)
      root.add(line)
    }
    const product = cylinder(0.35, 0.6, 0xfacc15)
    product.rotation.x = Math.PI / 2
    product.position.set(-3, 1.1, 0)
    root.add(product)
    addAnnotation(annotations, product, 'manufacture', 'Sản phẩm cơ khí', 'Chi tiết, cụm chi tiết, máy hoặc thiết bị', 0, 0.55, 0)
    animated.push({ mesh: product, type: 'transfer' })
  }

  if (courseId === 2) {
    const materialBlock = box(1.2, 0.65, 1.2, 0x94a3b8)
    materialBlock.name = 'material'
    materialBlock.position.set(-2.6, 0, 0)
    root.add(materialBlock)
    addAnnotation(annotations, root, 'material', 'Nhóm vật liệu cơ khí', 'Kim loại, hợp kim, phi kim loại, vật liệu mới', -2.6, 0.95, 0)

    const chuck = cylinder(0.45, 0.4, 0x334155)
    chuck.name = 'blank'
    chuck.rotation.x = Math.PI / 2
    chuck.position.set(-0.8, 0, 0)
    root.add(chuck)
    addAnnotation(annotations, chuck, 'blank', courseId === 2 ? 'Tính chất / phôi' : 'Phôi', courseId === 2 ? 'Cơ tính, lí tính, hóa tính, tính công nghệ' : 'Đối tượng ban đầu để gia công thành chi tiết', 0, 0.75, 0)

    const tool = box(0.25, 1.1, 0.25, 0xf97316)
    tool.name = 'machining'
    tool.position.set(0.7, 0.35, 0)
    tool.rotation.z = -0.7
    root.add(tool)
    addAnnotation(annotations, tool, 'machining', courseId === 2 ? 'Điều kiện làm việc' : 'Dao cắt / dụng cụ', courseId === 2 ? 'Tải trọng, ma sát, nhiệt độ, môi trường' : 'Tiện, phay, khoan, mài để đạt kích thước', 0, 0.8, 0)

    const gauge = box(1.2, 0.1, 0.9, 0x22c55e)
    gauge.name = 'measure'
    gauge.position.set(2.5, 0.45, 0)
    root.add(gauge)
    addAnnotation(annotations, root, 'measure', courseId === 2 ? 'Lựa chọn vật liệu' : 'Đo kiểm', courseId === 2 ? 'Cân bằng kĩ thuật, chế tạo, giá thành, an toàn' : 'Kiểm tra kích thước, sai số và chất lượng bề mặt', 2.5, 1.05, 0)
    animated.push({ mesh: chuck, type: 'spin' }, { mesh: tool, type: 'tool' })
  }

  if (courseId === 4) {
    const belt = box(5.8, 0.18, 0.9, 0x475569)
    belt.name = 'cnc'
    belt.position.y = -0.25
    root.add(belt)
    addAnnotation(annotations, root, 'cnc', 'Dây chuyền sản xuất', 'Các công đoạn liên tục, đồng bộ, dễ kiểm soát', -0.4, 0.25, -0.9)

    const cnc = box(1.2, 1.2, 1.0, 0x2563eb)
    cnc.name = 'cnc'
    cnc.position.set(-2.3, 0.55, 0)
    root.add(cnc)
    addAnnotation(annotations, root, 'cnc', 'Máy CNC', 'Gia công theo chương trình số, chính xác và lặp lại cao', -2.3, 1.55, 0)

    const robotBase = cylinder(0.28, 0.35, 0xf97316)
    robotBase.name = 'robot'
    robotBase.position.set(0.2, 0.05, 0)
    root.add(robotBase)
    const arm = box(0.25, 1.5, 0.25, 0xf97316)
    arm.name = 'robot'
    arm.position.set(0.55, 0.85, 0)
    arm.rotation.z = -0.65
    root.add(arm)
    addAnnotation(annotations, arm, 'robot', 'Robot công nghiệp', 'Cấp phôi, hàn, lắp ráp, vận chuyển, kiểm tra', 0, 0.9, 0)

    const sensor = cylinder(0.13, 0.55, 0x22c55e)
    sensor.name = 'sensor'
    sensor.position.set(1.9, 0.6, 0.55)
    sensor.rotation.x = Math.PI / 2
    root.add(sensor)
    addAnnotation(annotations, root, 'sensor', 'Cảm biến', 'Thu tín hiệu để giám sát và điều khiển tự động', 1.9, 1.25, 0.55)

    const shield = box(5.9, 1.5, 0.06, 0x06b6d4, 0.18)
    shield.name = 'safety'
    shield.position.set(0, 0.55, 0.62)
    root.add(shield)
    addAnnotation(annotations, root, 'safety', 'Che chắn an toàn', 'Ngăn tiếp xúc vùng nguy hiểm, hạn chế phoi/bụi bắn', 0.9, 1.65, 0.75)

    const part = box(0.45, 0.35, 0.35, 0xfacc15)
    part.position.set(-2.8, 0.1, 0)
    root.add(part)
    addAnnotation(annotations, part, 'cnc', 'Chi tiết đang gia công', 'Sản phẩm đi qua các công đoạn của dây chuyền', 0, 0.45, 0)
    animated.push({ mesh: part, type: 'belt' }, { mesh: arm, type: 'robot' })
  }

  if (courseId === 6 && engineMode === 'diesel4') {
    const chamberTop = 1.95
    const tdcY = 1.45
    const bdcY = 0.15
    const crankCenterY = -1.12
    const crankRadius = (tdcY - bdcY) / 2
    const connectingRodLength = (tdcY + bdcY) / 2 - crankCenterY

    const cylinderWall = cylinder(0.78, 2.7, 0x64748b, 0.2)
    cylinderWall.name = 'compression'
    cylinderWall.position.y = 0.72
    root.add(cylinderWall)

    const cutaway = box(0.18, 2.6, 1.62, 0xe2e8f0, 0.16)
    cutaway.name = 'compression'
    cutaway.position.set(-0.84, 0.72, 0)
    root.add(cutaway)

    const head = box(1.75, 0.28, 1.12, 0x334155, 0.92)
    head.name = 'compression'
    head.position.y = 2.12
    root.add(head)

    const crankcase = cylinder(1.05, 1.02, 0x94a3b8, 0.26)
    crankcase.name = 'power'
    crankcase.rotation.x = Math.PI / 2
    crankcase.position.y = crankCenterY
    root.add(crankcase)

    const pistonGroup = new THREE.Group()
    pistonGroup.name = 'power'
    pistonGroup.userData.tdcY = tdcY
    pistonGroup.userData.bdcY = bdcY
    const piston = cylinder(0.58, 0.34, 0x2563eb)
    piston.rotation.x = Math.PI / 2
    pistonGroup.add(piston)
    const pistonRing = cylinder(0.6, 0.035, 0x0f172a)
    pistonRing.rotation.x = Math.PI / 2
    pistonRing.position.y = 0.1
    pistonGroup.add(pistonRing)
    const wristPin = cylinder(0.08, 0.92, 0xf8fafc)
    wristPin.rotation.z = Math.PI / 2
    pistonGroup.add(wristPin)
    pistonGroup.position.y = tdcY
    root.add(pistonGroup)

    const rod = box(0.11, connectingRodLength, 0.11, 0xf97316)
    rod.name = 'power'
    rod.userData.length = connectingRodLength
    rod.userData.crankRadius = crankRadius
    rod.userData.crankCenterY = crankCenterY
    rod.position.y = (tdcY + crankCenterY + crankRadius) / 2
    root.add(rod)

    const crank = new THREE.Group()
    crank.name = 'power'
    crank.position.y = crankCenterY
    const crankWheel = new THREE.Mesh(new THREE.TorusGeometry(crankRadius, 0.06, 12, 80), material(0x111827))
    crankWheel.rotation.x = Math.PI / 2
    crank.add(crankWheel)
    const crankPin = cylinder(0.09, 0.22, 0x0ea5e9)
    crankPin.rotation.x = Math.PI / 2
    crankPin.position.set(crankRadius, 0, 0)
    crank.add(crankPin)
    root.add(crank)

    const injector = cylinder(0.055, 0.62, 0xfacc15)
    injector.name = 'power'
    injector.position.set(0, 2.55, 0)
    root.add(injector)
    const injectorTip = cone(0.09, 0.22, 0xf59e0b)
    injectorTip.name = 'power'
    injectorTip.rotation.x = Math.PI
    injectorTip.position.set(0, 2.18, 0)
    root.add(injectorTip)

    const intakeValve = cylinder(0.055, 0.7, 0x0ea5e9)
    intakeValve.name = 'intake'
    intakeValve.userData.closedY = 2.02
    intakeValve.userData.openY = 1.8
    intakeValve.position.set(-0.34, 2.02, 0)
    root.add(intakeValve)

    const exhaustValve = cylinder(0.055, 0.7, 0xf97316)
    exhaustValve.name = 'exhaust'
    exhaustValve.userData.closedY = 2.02
    exhaustValve.userData.openY = 1.8
    exhaustValve.position.set(0.34, 2.02, 0)
    root.add(exhaustValve)

    const intakePipe = box(1.18, 0.16, 0.26, 0x0ea5e9, 0.75)
    intakePipe.name = 'intake'
    intakePipe.position.set(-1.05, 2.18, 0)
    intakePipe.rotation.z = -0.32
    root.add(intakePipe)

    const exhaustPipe = box(1.18, 0.16, 0.26, 0xf97316, 0.75)
    exhaustPipe.name = 'exhaust'
    exhaustPipe.position.set(1.05, 2.18, 0)
    exhaustPipe.rotation.z = 0.32
    root.add(exhaustPipe)

    const intakeFlow = createFlowArrow(0.82, 0x0ea5e9)
    intakeFlow.name = 'intake'
    intakeFlow.position.set(-1.25, 2.45, 0.35)
    intakeFlow.rotation.y = Math.PI
    intakeFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    root.add(intakeFlow)

    const exhaustFlow = createFlowArrow(0.82, 0xf97316)
    exhaustFlow.name = 'exhaust'
    exhaustFlow.position.set(1.25, 2.45, 0.35)
    exhaustFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    root.add(exhaustFlow)

    const combustion = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), material(0xfacc15, 0.78))
    combustion.name = 'power'
    combustion.position.set(0, 1.82, 0)
    combustion.material.userData.dynamicOpacity = true
    root.add(combustion)

    const strokeLine = box(0.04, tdcY - bdcY, 0.04, 0x111827)
    strokeLine.name = 'compression'
    strokeLine.position.set(-1.25, (tdcY + bdcY) / 2, 0)
    root.add(strokeLine)
    const tdcMark = box(0.42, 0.035, 0.035, 0x111827)
    tdcMark.name = 'compression'
    tdcMark.position.set(-1.25, tdcY, 0)
    root.add(tdcMark)
    const bdcMark = box(0.42, 0.035, 0.035, 0x111827)
    bdcMark.name = 'compression'
    bdcMark.position.set(-1.25, bdcY, 0)
    root.add(bdcMark)
    const boreLine = box(1.16, 0.035, 0.035, 0x111827)
    boreLine.name = 'compression'
    boreLine.position.set(0, chamberTop, 0)
    root.add(boreLine)

    const radiusLine = box(crankRadius, 0.035, 0.035, 0xf97316)
    radiusLine.name = 'power'
    radiusLine.position.set(crankRadius / 2, crankCenterY + 0.02, 0.05)
    root.add(radiusLine)

    addAnnotation(annotations, root, 'compression', 'ĐCT / ĐCD và hành trình S', 'Piston chuyển động giữa điểm chết trên và điểm chết dưới; S là quãng đường piston đi được trong một hành trình.', -1.75, 0.85, 0)
    addAnnotation(annotations, root, 'compression', 'D - Đường kính xi lanh', 'D biểu thị đường kính trong của xi lanh, liên quan tới thể tích công tác.', 0, 2.35, 0)
    addAnnotation(annotations, root, 'power', '1. Trục khuỷu - R', 'Bán kính quay R của trục khuỷu tạo chuyển động quay và quyết định hành trình piston.', 1.15, -0.9, 0)
    addAnnotation(annotations, root, 'power', '2. Thanh truyền - 3. Piston', 'Thanh truyền nối piston với trục khuỷu để biến đổi chuyển động.', 0.92, 0.55, 0)
    addAnnotation(annotations, root, 'compression', '4. Xi lanh', 'Không gian piston chuyển động và diễn ra quá trình nạp, nén, cháy - giãn nở, thải.', -0.9, 1.8, 0)
    addAnnotation(annotations, root, 'intake', '5. Xupap thải / 7. Xupap nạp', 'Hai xupap đóng mở đúng thời điểm để điều khiển dòng khí.', 0, 2.82, 0)
    addAnnotation(annotations, root, 'power', '6. Vòi phun Diesel', 'Phun nhiên liệu vào cuối kì nén; nhiên liệu tự bốc cháy trong không khí nóng.', 0.62, 2.55, 0)

    animated.push(
      { mesh: pistonGroup, type: 'dieselSinglePiston' },
      { mesh: rod, type: 'dieselSingleRod' },
      { mesh: crank, type: 'dieselSingleCrank' },
      { mesh: intakeValve, type: 'dieselIntakeValve' },
      { mesh: exhaustValve, type: 'dieselExhaustValve' },
      { mesh: intakeFlow, type: 'dieselIntakeFlow' },
      { mesh: exhaustFlow, type: 'dieselExhaustFlow' },
      { mesh: combustion, type: 'dieselCombustion' }
    )
  }

  if (courseId === 6 && engineMode !== 'diesel4') {
    const cylinderWall = cylinder(0.62, 2.65, 0x64748b, 0.2)
    cylinderWall.name = 'compression'
    cylinderWall.position.y = 1.12
    root.add(cylinderWall)
    addAnnotation(annotations, root, 'compression', '10. Xi lanh', 'Buồng làm việc nơi piston nén hòa khí và khí cháy giãn nở sinh công', -0.82, 2.2, 0)

    const cylinderCut = box(0.16, 2.54, 1.42, 0xe2e8f0, 0.18)
    cylinderCut.name = 'compression'
    cylinderCut.position.set(-0.68, 1.12, 0)
    root.add(cylinderCut)

    const head = box(1.32, 0.26, 1.0, 0x334155, 0.9)
    head.name = 'compression'
    head.position.y = 2.52
    root.add(head)
    const leftHeadPocket = box(0.28, 0.42, 0.32, 0x94a3b8, 0.55)
    leftHeadPocket.name = 'compression'
    leftHeadPocket.position.set(-0.42, 2.83, 0)
    root.add(leftHeadPocket)
    const rightHeadPocket = box(0.28, 0.42, 0.32, 0x94a3b8, 0.55)
    rightHeadPocket.name = 'compression'
    rightHeadPocket.position.set(0.42, 2.83, 0)
    root.add(rightHeadPocket)

    const sparkPlug = cylinder(0.08, 0.62, 0xf8fafc)
    sparkPlug.name = 'power'
    sparkPlug.position.set(0, 3.04, 0)
    root.add(sparkPlug)
    const sparkTip = cone(0.08, 0.18, 0xf97316)
    sparkTip.name = 'power'
    sparkTip.rotation.x = Math.PI
    sparkTip.position.set(0, 2.65, 0)
    root.add(sparkTip)
    addAnnotation(annotations, root, 'power', '1. Bugi', 'Đánh lửa khi hòa khí bị nén để bắt đầu kì cháy - giãn nở', 0.55, 3.05, 0)

    const pistonGroup = new THREE.Group()
    pistonGroup.name = 'power'
    const piston = cylinder(0.5, 0.38, 0x2563eb)
    piston.rotation.x = Math.PI / 2
    pistonGroup.add(piston)
    const pistonRingTop = cylinder(0.52, 0.035, 0x0f172a)
    pistonRingTop.rotation.x = Math.PI / 2
    pistonRingTop.position.y = 0.11
    pistonGroup.add(pistonRingTop)
    const pistonRingBottom = cylinder(0.52, 0.035, 0x0f172a)
    pistonRingBottom.rotation.x = Math.PI / 2
    pistonRingBottom.position.y = -0.11
    pistonGroup.add(pistonRingBottom)
    pistonGroup.position.y = 1.58
    root.add(pistonGroup)
    addAnnotation(annotations, pistonGroup, 'power', '2. Piston', 'Đóng mở các cửa khí và nhận lực khí cháy để chuyển động lên xuống', 0.92, 0.15, 0)

    const crankcase = new THREE.Group()
    crankcase.name = 'intake'
    const crankcaseBody = cylinder(1.02, 0.92, 0x94a3b8, 0.28)
    crankcaseBody.rotation.x = Math.PI / 2
    crankcaseBody.position.y = -0.82
    crankcase.add(crankcaseBody)
    const crankcaseBase = box(2.08, 0.22, 1.12, 0x475569, 0.85)
    crankcaseBase.position.y = -1.48
    crankcase.add(crankcaseBase)
    root.add(crankcase)
    addAnnotation(annotations, root, 'intake', '7. Cacte', 'Khoang dưới piston nhận hòa khí từ cửa nạp rồi ép sang cửa quét', -1.2, -0.65, 0)

    const crank = new THREE.Group()
    crank.name = 'power'
    crank.position.y = -0.82
    const crankWheel = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.055, 12, 72), material(0x111827))
    crankWheel.rotation.x = Math.PI / 2
    crank.add(crankWheel)
    const crankPin = cylinder(0.1, 0.26, 0x0ea5e9)
    crankPin.rotation.x = Math.PI / 2
    crankPin.position.set(0.43, 0, 0)
    crank.add(crankPin)
    root.add(crank)
    addAnnotation(annotations, crank, 'power', '6. Trục khuỷu', 'Biến chuyển động tịnh tiến của piston thành chuyển động quay', 0.95, -0.15, 0)

    const rod = box(0.12, 1.78, 0.12, 0xf97316)
    rod.name = 'power'
    rod.position.y = 0.32
    root.add(rod)
    addAnnotation(annotations, rod, 'power', '5. Thanh truyền', 'Nối piston với trục khuỷu để truyền lực', 0.38, 0, 0)

    const intakePipe = box(1.18, 0.24, 0.34, 0x38bdf8, 0.82)
    intakePipe.name = 'intake'
    intakePipe.position.set(1.2, 0.12, 0)
    root.add(intakePipe)
    const intakePort = box(0.18, 0.38, 0.52, 0x0284c7, 0.95)
    intakePort.name = 'intake'
    intakePort.position.set(0.6, 0.12, 0)
    root.add(intakePort)
    addAnnotation(annotations, root, 'intake', '4. Cửa nạp', 'Đưa hòa khí vào cacte khi piston đi lên tạo áp suất thấp', 1.75, 0.42, 0)

    const exhaustPipe = box(1.34, 0.34, 0.42, 0xf97316, 0.86)
    exhaustPipe.name = 'exhaust'
    exhaustPipe.position.set(1.35, 1.25, 0)
    root.add(exhaustPipe)
    const exhaustPort = box(0.18, 0.44, 0.6, 0xea580c, 0.95)
    exhaustPort.name = 'exhaust'
    exhaustPort.position.set(0.6, 1.25, 0)
    root.add(exhaustPort)
    addAnnotation(annotations, root, 'exhaust', '3. Cửa thải', 'Mở khi piston đi xuống để khí cháy thoát ra ngoài', 1.86, 1.58, 0)

    const transferPipe = box(0.26, 1.8, 0.34, 0x22c55e, 0.55)
    transferPipe.name = 'exhaust'
    transferPipe.position.set(-0.78, 0.28, 0)
    root.add(transferPipe)
    const transferTop = box(0.44, 0.24, 0.42, 0x16a34a, 0.82)
    transferTop.name = 'exhaust'
    transferTop.position.set(-0.43, 1.02, 0)
    root.add(transferTop)
    addAnnotation(annotations, root, 'exhaust', '8. Đường thông cacte - cửa quét', 'Dẫn hòa khí từ cacte lên cửa quét.', -1.28, 0.62, 0)
    addAnnotation(annotations, root, 'exhaust', '9. Cửa quét', 'Mở khi piston đi xuống để hòa khí từ cacte đi vào xi lanh và đẩy khí thải.', -0.86, 1.26, 0)

    const intakeFlow = createFlowArrow(0.82, 0x0ea5e9)
    intakeFlow.name = 'intake'
    intakeFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    intakeFlow.position.set(1.2, 0.48, 0.36)
    intakeFlow.rotation.y = Math.PI
    root.add(intakeFlow)

    const transferFlow = createFlowArrow(0.86, 0x22c55e)
    transferFlow.name = 'exhaust'
    transferFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    transferFlow.position.set(-0.78, 0.62, 0.38)
    transferFlow.rotation.z = Math.PI / 2
    root.add(transferFlow)

    const exhaustFlow = createFlowArrow(0.95, 0xf97316)
    exhaustFlow.name = 'exhaust'
    exhaustFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    exhaustFlow.position.set(1.36, 1.66, 0.36)
    root.add(exhaustFlow)

    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), material(0xfacc15, 0.85))
    spark.name = 'power'
    spark.material.userData.dynamicOpacity = true
    spark.position.set(0, 2.42, 0)
    root.add(spark)

    const numberLabels = [
      ['1', 0.38, 3.12, 0.46],
      ['2', 0.78, 1.72, 0.46],
      ['3', 2.02, 1.28, 0.46],
      ['4', 1.86, 0.12, 0.46],
      ['5', 0.48, 0.55, 0.46],
      ['6', 0.95, -0.66, 0.46],
      ['7', -1.18, -0.74, 0.46],
      ['8', -1.22, 0.08, 0.46],
      ['9', -0.72, 1.08, 0.46],
      ['10', -0.92, 1.85, 0.46],
    ]
    numberLabels.forEach(([text, x, y, z]) => {
      const labelAnchor = new THREE.Object3D()
      labelAnchor.position.set(x, y, z)
      root.add(labelAnchor)
      annotations.push({ anchor: labelAnchor, layerId: 'all', label: text, note: '' })
    })

    animated.push(
      { mesh: pistonGroup, type: 'twoStrokePiston' },
      { mesh: rod, type: 'twoStrokeRod' },
      { mesh: crank, type: 'crank' },
      { mesh: intakeFlow, type: 'flowPulse' },
      { mesh: transferFlow, type: 'flowPulse' },
      { mesh: exhaustFlow, type: 'flowPulse' },
      { mesh: spark, type: 'spark' }
    )
  }

  if (courseId === 5 || courseId === 7) {
    const body = box(4.8, 0.75, 1.45, 0x2563eb)
    body.name = 'control'
    body.position.y = 0.45
    root.add(body)
    addAnnotation(annotations, root, courseId === 5 ? 'chassis' : 'control', courseId === 5 ? 'Máy / phương tiện' : 'Thân vỏ ô tô', courseId === 5 ? 'Đối tượng sử dụng nguồn động lực và hệ truyền động' : 'Không gian chở người, hàng hóa và bảo vệ các cụm hệ thống', 0.8, 1.05, 0)

    const cabin = box(1.7, 0.8, 1.25, 0x60a5fa, 0.8)
    cabin.name = 'control'
    cabin.position.set(0.35, 1.05, 0)
    root.add(cabin)
    addAnnotation(annotations, root, 'control', courseId === 5 ? 'Khai thác - bảo dưỡng' : 'Lái - phanh', courseId === 5 ? 'Vận hành, bảo dưỡng, sửa chữa, kiểm định' : 'Điều khiển hướng chuyển động, giảm tốc và dừng xe', 0.35, 1.85, 0)

    const engine = box(0.9, 0.45, 0.9, 0xf97316)
    engine.name = 'powertrain'
    engine.position.set(-1.65, 0.85, 0)
    root.add(engine)
    addAnnotation(annotations, root, 'powertrain', 'Nguồn động lực', courseId === 5 ? 'Tạo công suất hoặc mô men cho máy/phương tiện' : 'Động cơ hoặc nguồn động lực tạo công suất cho ô tô', -1.65, 1.45, 0)

    const shaft = box(2.8, 0.12, 0.12, 0xfacc15)
    shaft.name = 'transmission'
    shaft.position.set(0.2, 0.05, 0)
    root.add(shaft)
    addAnnotation(annotations, root, 'transmission', courseId === 5 ? 'Hệ truyền động' : 'Hệ thống truyền lực', courseId === 5 ? 'Truyền và biến đổi công suất đến bộ phận công tác' : 'Truyền mô men từ nguồn động lực đến bánh xe chủ động', 0.2, 0.45, 0)

    ;[-1.7, 1.7].forEach((x) => {
      ;[-0.85, 0.85].forEach((z) => {
        const wheel = cylinder(0.42, 0.32, 0x111827)
        wheel.name = 'chassis'
        wheel.rotation.z = Math.PI / 2
        wheel.position.set(x, 0, z)
        root.add(wheel)
        animated.push({ mesh: wheel, type: 'wheel' })
      })
    })
    addAnnotation(annotations, root, 'chassis', courseId === 5 ? 'Bộ phận công tác / bánh xe' : 'Bánh xe - hệ thống treo', courseId === 5 ? 'Nơi nhận công suất để thực hiện chuyển động hoặc công việc' : 'Bánh xe tiếp xúc đường; treo giảm dao động và giữ ổn định', 1.7, 0.75, 0.9)
  }

  if (courseId === 8) {
    const board = box(6.4, 0.18, 3.2, 0xf8fafc)
    board.name = 'sensor'
    board.position.set(0, -0.1, 0)
    root.add(board)
    addAnnotation(annotations, root, 'sensor', 'Breadboard / bo mạch', 'Nền lắp ráp thí nghiệm, các khối dùng chung nguồn thấp áp và GND.', 0, 0.28, -1.55)

    const railPositive = box(6.1, 0.06, 0.08, 0xef4444)
    railPositive.name = 'input'
    railPositive.position.set(0, 0.05, -1.35)
    root.add(railPositive)
    const railGround = box(6.1, 0.06, 0.08, 0x2563eb)
    railGround.name = 'input'
    railGround.position.set(0, 0.05, 1.35)
    root.add(railGround)
    addAnnotation(annotations, root, 'input', 'Nguồn 5V / GND', 'Nguồn thấp áp cấp cho cảm biến, IC logic, vi điều khiển và đầu ra.', -2.65, 0.36, -1.35)

    const switchBlock = box(0.72, 0.34, 0.62, 0x38bdf8)
    switchBlock.name = 'input'
    switchBlock.position.set(-2.65, 0.28, -0.55)
    root.add(switchBlock)
    addAnnotation(annotations, root, 'input', 'Nút nhấn / tín hiệu 0-1', 'Khi nhấn, tín hiệu vào đổi trạng thái logic.', -2.65, 0.85, -0.55)

    const sensorBlock = cylinder(0.34, 0.28, 0x22c55e)
    sensorBlock.name = 'sensor'
    sensorBlock.position.set(-2.65, 0.32, 0.55)
    root.add(sensorBlock)
    addAnnotation(annotations, root, 'sensor', 'Cảm biến', 'Thu khói, nhiệt, ánh sáng hoặc trạng thái môi trường và tạo tín hiệu điện.', -2.65, 0.9, 0.55)

    const conditioner = box(0.82, 0.28, 0.82, 0xa7f3d0)
    conditioner.name = 'sensor'
    conditioner.position.set(-1.45, 0.28, 0)
    root.add(conditioner)
    addAnnotation(annotations, root, 'sensor', 'Chuẩn hóa tín hiệu', 'Điện trở kéo, lọc nhiễu hoặc so sánh đưa tín hiệu về mức logic ổn định.', -1.45, 0.84, 0)

    const logicIc = box(1.05, 0.24, 0.92, 0x7c3aed)
    logicIc.name = 'logic'
    logicIc.position.set(-0.18, 0.32, 0)
    root.add(logicIc)
    ;[-0.58, -0.34, -0.1, 0.14, 0.38].forEach((x) => {
      const pinTop = box(0.06, 0.12, 0.18, 0xe5e7eb)
      pinTop.name = 'logic'
      pinTop.position.set(x, 0.28, -0.56)
      root.add(pinTop)
      const pinBottom = box(0.06, 0.12, 0.18, 0xe5e7eb)
      pinBottom.name = 'logic'
      pinBottom.position.set(x, 0.28, 0.56)
      root.add(pinBottom)
    })
    addAnnotation(annotations, root, 'logic', 'IC cổng logic', 'AND, OR, NOT tạo quyết định đầu ra theo bảng chân lí.', -0.18, 0.9, 0)

    const mcu = box(1.15, 0.26, 1.05, 0x312e81)
    mcu.name = 'microcontroller'
    mcu.position.set(1.2, 0.32, 0)
    root.add(mcu)
    addAnnotation(annotations, root, 'microcontroller', 'Vi điều khiển', 'Đọc tín hiệu logic, xử lí điều kiện, chống nhiễu và phát lệnh điều khiển.', 1.2, 0.92, 0)

    const driver = box(0.86, 0.28, 0.72, 0xf97316)
    driver.name = 'driver'
    driver.position.set(2.38, 0.3, 0)
    root.add(driver)
    const transistor = cylinder(0.18, 0.18, 0x111827)
    transistor.name = 'driver'
    transistor.position.set(2.38, 0.58, -0.48)
    root.add(transistor)
    addAnnotation(annotations, root, 'driver', 'Transistor / driver', 'Khuếch dòng và bảo vệ khối xử lí khi điều khiển còi, LED hoặc rơle.', 2.38, 0.92, 0)

    const led = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), material(0xef4444, 0.88))
    led.name = 'output'
    led.material.userData.dynamicOpacity = true
    led.position.set(3.35, 0.52, -0.48)
    root.add(led)
    const buzzer = cylinder(0.32, 0.22, 0xfacc15)
    buzzer.name = 'output'
    buzzer.position.set(3.35, 0.42, 0.48)
    root.add(buzzer)
    addAnnotation(annotations, root, 'output', 'LED / còi báo', 'Đầu ra bật khi điều kiện logic đúng.', 3.35, 1.0, 0)

    const wires = [
      ['input', -2.28, -0.55, -1.82, -0.1, 0x0ea5e9],
      ['sensor', -2.22, 0.38, -1.85, 0.12, 0x22c55e],
      ['sensor', -1.04, 0, -0.72, 0, 0x22c55e],
      ['logic', 0.36, 0, 0.62, 0, 0x8b5cf6],
      ['microcontroller', 1.78, 0, 1.96, 0, 0x6366f1],
      ['driver', 2.78, 0, 3.04, -0.32, 0xf97316],
      ['output', 2.78, 0, 3.04, 0.36, 0xfacc15],
    ]
    wires.forEach(([layerId, x1, z1, x2, z2, color]) => {
      const dx = x2 - x1
      const dz = z2 - z1
      const length = Math.sqrt(dx * dx + dz * dz)
      const wire = box(length, 0.045, 0.045, color, 0.86)
      wire.name = layerId
      wire.position.set((x1 + x2) / 2, 0.36, (z1 + z2) / 2)
      wire.rotation.y = -Math.atan2(dz, dx)
      root.add(wire)
    })

    const signalPulse = createFlowArrow(0.58, 0x38bdf8)
    signalPulse.name = 'logic'
    signalPulse.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    signalPulse.position.set(0.54, 0.72, -0.9)
    root.add(signalPulse)

    animated.push(
      { mesh: signalPulse, type: 'transfer' },
      { mesh: led, type: 'spark' }
    )
  }

  return { root, animated, annotations }
}

export default function ThreeDSimulation() {
  const { lessonId } = useParams()
  const user = useAuthStore((state) => state.user)
  const containerRef = useRef(null)
  const selectedLayerRef = useRef('all')
  const [lesson, setLesson] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [selectedLayer, setSelectedLayer] = useState('all')
  const [activeStep, setActiveStep] = useState(0)
  const [visitedLayers, setVisitedLayers] = useState(() => new Set(['all']))
  const [completedCheckpoints, setCompletedCheckpoints] = useState(() => new Set())
  const [assessmentScore, setAssessmentScore] = useState(null)
  const simulationStartedAt = useRef(Date.now())
  const [engineMode, setEngineMode] = useState('twoStroke')
  const [novaWorkflowId, setNovaWorkflowId] = useState(null)
  const [novaModelUrl, setNovaModelUrl] = useState(null)
  const [novaStatus, setNovaStatus] = useState('Đang kiểm tra cấu hình Nova 3D...')
  const [novaError, setNovaError] = useState(null)

  useEffect(() => {
    selectedLayerRef.current = selectedLayer
  }, [selectedLayer])

  useEffect(() => {
    const fetchLesson = async () => {
      const catalogLesson = getSampleLesson(lessonId)
      try {
        const response = await lessonsAPI.get(lessonId)
        setLesson(catalogLesson || response.data)
      } catch {
        setLesson(catalogLesson)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLesson()
  }, [lessonId])

  useEffect(() => {
    if (!user?.id || !lessonId) return
    simulationStartedAt.current = Date.now()
    setVisitedLayers(new Set(['all']))
    setCompletedCheckpoints(new Set())
    setAssessmentScore(null)
    recordLocalLearningEvent(user.id, {
      lesson_id: Number(lessonId),
      event_type: 'simulation_opened',
      duration_seconds: 0,
    })
  }, [user?.id, lessonId])

  const simulationKey = getSimulationKey(lesson)
  const isFourStrokeLesson = Number(lesson?.grade_level) === 11 && Number(lesson?.source_id || lesson?.id) === 602
  const simulation = lesson?.grade_level === 12
    ? getIndustrial12Simulation(simulationKey)
    : lesson?.grade_level === 11
      ? simulationKey === 'blastFurnace'
        ? blastFurnaceSimulation
        : mechanical11SpecializedSimulations[simulationKey] || knttSimulations[simulationKey] || mechanical11SpecializedSimulations[1]
      : technology10Simulations[simulationKey] || technology10Simulations[1]
  const isFourStrokeMode = simulation.modelId === 6 && (engineMode === 'diesel4' || isFourStrokeLesson)
  const displayedSimulation = isFourStrokeMode
    ? dieselFourStrokeSimulation
    : simulation
  const simulationExperiment = getSimulationExperimentForLesson(lesson)
  const shouldUseNovaApi = false
  const activeLayer = selectedLayer === 'all'
    ? { name: 'Tổng quan', note: displayedSimulation.objective }
    : displayedSimulation.layers.find((layer) => layer.id === selectedLayer)

  const layerButtons = useMemo(
    () => [{ id: 'all', name: 'Tổng quan', note: displayedSimulation.objective }, ...displayedSimulation.layers],
    [displayedSimulation]
  )

  const selectKnowledgeLayer = (layerId) => {
    setSelectedLayer(layerId)
    setVisitedLayers((current) => new Set([...current, layerId]))
  }

  const toggleCheckpoint = (checkpoint) => {
    setCompletedCheckpoints((current) => {
      const next = new Set(current)
      if (next.has(checkpoint)) next.delete(checkpoint)
      else next.add(checkpoint)
      return next
    })
    setAssessmentScore(null)
  }

  const submitSimulationAssessment = () => {
    const layerCoverage = visitedLayers.size / Math.max(layerButtons.length, 1)
    const checkpointCoverage = completedCheckpoints.size / Math.max(displayedSimulation.checkpoints.length, 1)
    const score = Math.round((layerCoverage * 0.4 + checkpointCoverage * 0.6) * 100)
    const durationSeconds = Math.max(1, Math.round((Date.now() - simulationStartedAt.current) / 1000))
    setAssessmentScore(score)
    recordLocalLearningEvent(user?.id, {
      lesson_id: Number(lessonId),
      event_type: 'simulation_completed',
      duration_seconds: durationSeconds,
      score,
      payload: {
        visited_layers: [...visitedLayers],
        confirmed_checkpoints: [...completedCheckpoints],
        total_layers: layerButtons.length,
        total_checkpoints: displayedSimulation.checkpoints.length,
      },
    })
  }

  useEffect(() => {
    if (isLoading || !shouldUseNovaApi) {
      setNovaStatus('Nova 3D dùng mô hình dựng sẵn cho chương này.')
      return undefined
    }

    let cancelled = false
    const cacheKey = `nova3d_four_stroke_engine_${lessonId}`

    const runNovaGeneration = async () => {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setNovaModelUrl(cached)
        setNovaStatus('Đang dùng mô hình GLB đã tạo từ Nova 3D.')
        return
      }

      try {
        const response = await nova3dAPI.generateFourStrokeEngine({
          prompt: fourStrokeEngineNovaPrompt,
          wait_for_result: false,
        })
        if (cancelled) return

        const data = response.data
        if (!data.configured) {
          setNovaStatus('Chưa cấu hình API Nova 3D, đang dùng mô phỏng chuẩn SGK dựng trong app.')
          return
        }
        if (data.glb_url) {
          localStorage.setItem(cacheKey, data.glb_url)
          setNovaModelUrl(data.glb_url)
          setNovaStatus('Đã nhận mô hình GLB từ Nova 3D.')
          return
        }
        if (!data.workflow_id) {
          setNovaStatus(data.message || 'Nova 3D chưa trả về workflow.')
          return
        }

        setNovaWorkflowId(data.workflow_id)
        setNovaStatus('Nova 3D đang tạo mô hình động cơ 4 kì...')

        for (let attempt = 0; attempt < 90 && !cancelled; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 3000))
          const statusResponse = await nova3dAPI.getWorkflowStatus(data.workflow_id)
          if (cancelled) return

          const runtime = statusResponse.data?.runtime || {}
          const state = String(runtime.state || '').toLowerCase()
          const lastNode = runtime.last_exit_node_id
          setNovaStatus(
            state && state !== 'undefined'
              ? `Nova 3D workflow ${state}...`
              : 'Nova 3D đang dựng hình và kiểm tra mô hình...'
          )

          const completed = ['completed', 'succeeded', 'success'].includes(state)
            || ['success_final', 'success_original_glb'].includes(lastNode)
          const failed = ['failed', 'terminated', 'cancelled', 'timed_out', 'timeout', 'budget_exhausted'].includes(state)

          if (completed || failed) {
            const resultResponse = await nova3dAPI.getWorkflowResult(data.workflow_id)
            if (cancelled) return
            const url = resultResponse.data?.glb_url
            if (url) {
              localStorage.setItem(cacheKey, url)
              setNovaModelUrl(url)
              setNovaStatus('Đã tải mô hình động cơ 4 kì từ Nova 3D.')
            } else {
              setNovaStatus('Nova 3D chưa trả về GLB, đang dùng mô phỏng chuẩn SGK dựng trong app.')
            }
            return
          }
        }

        setNovaStatus('Nova 3D tạo mô hình lâu hơn dự kiến, đang dùng mô phỏng chuẩn SGK dựng trong app.')
      } catch (error) {
        if (cancelled) return
        setNovaError(error.response?.data?.detail || error.message)
        setNovaStatus('Không gọi được Nova 3D, đang dùng mô phỏng chuẩn SGK dựng trong app.')
      }
    }

    runNovaGeneration()
    return () => {
      cancelled = true
    }
  }, [isLoading, shouldUseNovaApi, lessonId])

  useEffect(() => {
    if (!containerRef.current || isLoading) return undefined

    const container = containerRef.current
    container.innerHTML = ''

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf5f7fb)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000)
    if (simulation.modelId === 8) {
      camera.fov = 50
      camera.position.set(0, 5.7, 8.8)
      camera.lookAt(0, 0.2, 0)
    } else {
      camera.position.set(0, 3.5, 7.2)
      camera.lookAt(0, 0.3, 0)
    }
    camera.updateProjectionMatrix()

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    const labelLayer = document.createElement('div')
    labelLayer.style.position = 'absolute'
    labelLayer.style.inset = '0'
    labelLayer.style.pointerEvents = 'none'
    labelLayer.style.zIndex = '2'
    container.appendChild(labelLayer)

    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const light = new THREE.DirectionalLight(0xffffff, 1.1)
    light.position.set(4, 8, 5)
    scene.add(light)

    const base = new THREE.GridHelper(8, 8, 0xcbd5e1, 0xe2e8f0)
    base.position.y = -0.65
    scene.add(base)

    const { root, animated, annotations } = buildChapterModel(
      simulation.modelId,
      isFourStrokeLesson ? 'diesel4' : engineMode
    )
    if (simulation.modelId === 8) {
      root.scale.setScalar(0.78)
      root.position.set(0, -0.18, 0.12)
    }
    scene.add(root)

    if (novaModelUrl) {
      root.visible = false
      const loader = new GLTFLoader()
      loader.load(
        novaModelUrl,
        (gltf) => {
          const model = gltf.scene
          model.name = 'nova3d-four-stroke-engine'
          const box3 = new THREE.Box3().setFromObject(model)
          const size = new THREE.Vector3()
          const center = new THREE.Vector3()
          box3.getSize(size)
          box3.getCenter(center)
          model.position.sub(center)
          const maxAxis = Math.max(size.x, size.y, size.z, 1)
          model.scale.setScalar(4 / maxAxis)
          model.position.y = 0.35
          scene.add(model)
        },
        undefined,
        () => {
          root.visible = true
          setNovaStatus('Không tải được GLB Nova 3D, đang dùng mô phỏng chuẩn SGK dựng trong app.')
        }
      )
    }

    const annotationViews = annotations.map((annotation) => {
      const element = document.createElement('div')
      element.className = 'simulation-part-label'
      element.innerHTML = `<span>${annotation.label}</span><small>${annotation.note}</small>`
      labelLayer.appendChild(element)
      return { ...annotation, element }
    })

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(rect.width, 320)
      const height = Math.max(rect.height, 420)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
    }

    resize()
    window.addEventListener('resize', resize)

    let frame
    let angle = 0
    let lastStep = -1
    const projected = new THREE.Vector3()
    const worldPosition = new THREE.Vector3()

    const animate = () => {
      if (isPlaying) angle += 0.025 * speed
      root.rotation.y = simulation.modelId === 8 ? 0 : Math.sin(angle * 0.25) * 0.18

      const cycleDuration = isFourStrokeMode ? Math.PI * 4 : Math.PI * 2
      const cyclePhase = ((angle % cycleDuration) + cycleDuration) % cycleDuration
      const cycleProgress = cyclePhase / cycleDuration
      const step = Math.floor(cycleProgress * displayedSimulation.layers.length)
      if (step !== lastStep) {
        lastStep = step
        setActiveStep(step % displayedSimulation.layers.length)
      }

      animated.forEach(({ mesh, type }) => {
        if (type === 'spin' || type === 'wheel') mesh.rotation.y += 0.05 * speed
        if (type === 'tool') mesh.position.y = 0.35 + Math.sin(angle * 2) * 0.18
        if (type === 'belt') mesh.position.x = -2.8 + ((angle * 0.9) % 5.6)
        if (type === 'robot') mesh.rotation.z = -0.65 + Math.sin(angle * 1.4) * 0.28
        if (type === 'piston') mesh.position.y = 0.45 + Math.sin(angle * 2) * 0.75
        if (type === 'rod') {
          mesh.position.y = -0.15 + Math.sin(angle * 2) * 0.35
          mesh.rotation.z = Math.sin(angle * 2) * 0.22
        }
        if (type === 'twoStrokePiston') mesh.position.y = 1.36 + Math.cos(angle) * 0.5
        if (type === 'twoStrokeRod') {
          mesh.position.y = 0.3 + Math.cos(angle) * 0.28
          mesh.rotation.z = Math.sin(angle) * 0.26
        }
        if (type === 'dieselPiston') mesh.position.y = mesh.userData.baseY + Math.cos(angle + mesh.userData.phase) * 0.18
        if (type === 'dieselRod') {
          mesh.position.y = mesh.userData.baseY + Math.cos(angle + mesh.userData.phase) * 0.1
          mesh.rotation.z = Math.sin(angle + mesh.userData.phase) * 0.22
        }
        if (type === 'dieselSinglePiston') {
          const crankRadius = (mesh.userData.tdcY - mesh.userData.bdcY) / 2
          const crankCenterY = -1.12
          const rodLength = (mesh.userData.tdcY + mesh.userData.bdcY) / 2 - crankCenterY
          const crankAngle = Math.PI / 2 - cyclePhase
          const crankPinX = crankRadius * Math.cos(crankAngle)
          const crankPinY = crankCenterY + crankRadius * Math.sin(crankAngle)
          mesh.position.y = crankPinY + Math.sqrt(Math.max(rodLength ** 2 - crankPinX ** 2, 0))
        }
        if (type === 'dieselSingleRod') {
          const crankAngle = Math.PI / 2 - cyclePhase
          const crankPinX = mesh.userData.crankRadius * Math.cos(crankAngle)
          const crankPinY = mesh.userData.crankCenterY + mesh.userData.crankRadius * Math.sin(crankAngle)
          const pistonPinY = crankPinY + Math.sqrt(
            Math.max(mesh.userData.length ** 2 - crankPinX ** 2, 0)
          )
          mesh.position.set(crankPinX / 2, (pistonPinY + crankPinY) / 2, 0)
          mesh.rotation.z = Math.atan2(crankPinX, pistonPinY - crankPinY)
        }
        if (type === 'dieselSingleCrank') mesh.rotation.z = Math.PI / 2 - cyclePhase
        if (type === 'dieselIntakeValve' || type === 'dieselExhaustValve') {
          const open = type === 'dieselIntakeValve'
            ? cycleProgress < 0.25
            : cycleProgress >= 0.75
          mesh.position.y = open ? mesh.userData.openY : mesh.userData.closedY
          mesh.material.color.setHex(open ? (type === 'dieselIntakeValve' ? 0x0ea5e9 : 0xf97316) : 0x475569)
        }
        if (type === 'dieselIntakeFlow' || type === 'dieselExhaustFlow') {
          const active = type === 'dieselIntakeFlow'
            ? cycleProgress < 0.25
            : cycleProgress >= 0.75
          mesh.traverse((part) => {
            if (part.material) {
              part.material.opacity = active ? 0.9 : 0.12
              part.material.transparent = true
            }
          })
        }
        if (type === 'dieselCombustion') {
          const active = cycleProgress >= 0.5 && cycleProgress < 0.62
          mesh.scale.setScalar(active ? 1.15 + Math.sin(angle * 8) * 0.18 : 0.35)
          mesh.material.opacity = active ? 0.85 : 0.08
          mesh.material.transparent = true
        }
        if (type === 'crank') mesh.rotation.z -= 0.06 * speed
        if (type === 'flowPulse') {
          const pulse = 0.35 + Math.abs(Math.sin(angle * 2.4)) * 0.65
          mesh.traverse((part) => {
            if (part.material) {
              part.material.opacity = pulse
              part.material.transparent = true
            }
          })
        }
        if (type === 'spark') {
          const flash = Math.cos(angle) > 0.92 ? 1 : 0.18
          mesh.scale.setScalar(0.6 + flash * 0.9)
          mesh.material.opacity = flash
          mesh.material.transparent = true
        }
        if (type === 'transfer') mesh.position.x = -3 + ((angle * 0.7) % 6)
        if (type === 'chargeBucket') {
          const t = (Math.sin(angle * 0.85) + 1) / 2
          mesh.position.x = -2.35 + t * 1.35
          mesh.position.y = 0.16 + t * 2.12
        }
        if (type === 'blastFlame') {
          mesh.scale.setScalar(0.92 + Math.sin(angle * 4) * 0.08)
          mesh.material.opacity = 0.48 + Math.abs(Math.sin(angle * 3)) * 0.26
          mesh.material.transparent = true
        }
        if (type === 'moltenPulse') {
          mesh.position.x = 0.35 + ((angle * 0.65) % 1.8)
          mesh.scale.setScalar(0.75 + Math.abs(Math.sin(angle * 2.5)) * 0.35)
        }
      })

      const selected = selectedLayerRef.current
      root.traverse((object) => {
        if (!object.isMesh) return
        if (object.material.userData.dynamicOpacity) return
        const shouldDim = selected !== 'all' && object.name && object.name !== selected
        const baseOpacity = object.material.userData.baseOpacity ?? 1
        object.material.opacity = shouldDim ? Math.min(baseOpacity, 0.16) : baseOpacity
        object.material.transparent = shouldDim || baseOpacity < 1
      })

      renderer.render(scene, camera)

      annotationViews.forEach((annotation) => {
        annotation.anchor.getWorldPosition(worldPosition)
        projected.copy(worldPosition).project(camera)
        const width = renderer.domElement.clientWidth
        const height = renderer.domElement.clientHeight
        const x = (projected.x * 0.5 + 0.5) * width
        const y = (-projected.y * 0.5 + 0.5) * height
        const outside = projected.z < -1 || projected.z > 1 || x < -120 || x > width + 120 || y < -80 || y > height + 80
        const shouldDim = selected !== 'all' && annotation.layerId !== selected

        annotation.element.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`
        annotation.element.style.opacity = outside ? '0' : shouldDim ? '0.28' : '1'
        annotation.element.style.visibility = outside ? 'hidden' : 'visible'
      })

      frame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      renderer.dispose()
      labelLayer.remove()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [simulation.modelId, displayedSimulation.layers.length, engineMode, isFourStrokeLesson, isFourStrokeMode, isLoading, isPlaying, speed, novaModelUrl])

  if (isLoading) {
    return <div className="page-container text-center text-slate-600">Đang tải mô phỏng 3D...</div>
  }

  const currentLayer = displayedSimulation.layers[activeStep] || displayedSimulation.layers[0]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-[1fr_420px]">
        <main className="relative min-h-[560px] border-r border-slate-200 bg-slate-100">
          <div ref={containerRef} className="absolute inset-0" />
          <div className="absolute left-5 top-5 max-w-xl rounded-lg border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-black uppercase text-white">
                {nova3D.name}
              </span>
              <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">
                {displayedSimulation.label}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{displayedSimulation.title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{displayedSimulation.subtitle}</p>
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-slate-200 bg-white/92 p-4 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">{nova3D.name} đang mô phỏng</p>
                <p className="mt-1 font-bold text-slate-950">{currentLayer.name}</p>
                <p className="mt-1 text-sm text-slate-600">{currentLayer.note}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsPlaying((value) => !value)} className="primary-button">
                  {isPlaying ? 'Tạm dừng' : 'Phát'}
                </button>
                <Link to={`/lessons/${lessonId}`} className="secondary-button">
                  Về bài học
                </Link>
              </div>
            </div>
          </div>
        </main>

        <aside className="overflow-y-auto bg-white p-6">
          <p className="muted-label">Phòng mô phỏng Nova 3D</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{lesson?.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{displayedSimulation.objective}</p>

          <section className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
            <p className="text-xs font-black uppercase tracking-wide text-cyan-700">Thí nghiệm của bài này</p>
            <h3 className="mt-1 font-bold">{simulationExperiment.title}</h3>
            <p className="mt-2 text-sm leading-6">{simulationExperiment.modelFocus}</p>
            <div className="mt-3 rounded-md bg-white p-3 text-sm font-semibold text-slate-700">
              Thời lượng gợi ý: {simulationExperiment.duration}
            </div>
          </section>

          {simulation.modelId === 6 && (
            <section className="mt-5 rounded-lg border border-slate-200 bg-white p-2">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'twoStroke', label: 'Xăng 2 kì' },
                  { id: 'diesel4', label: isFourStrokeLesson ? 'Động cơ 4 kì' : 'Diesel 4 kì' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setEngineMode(mode.id)
                      setSelectedLayer('all')
                      setActiveStep(0)
                      setNovaModelUrl(null)
                    }}
                    className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                      (isFourStrokeLesson ? mode.id === 'diesel4' : engineMode === mode.id)
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    disabled={isFourStrokeLesson && mode.id === 'twoStroke'}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Engine</p>
                <h3 className="mt-1 font-bold text-slate-950">{nova3D.name}</h3>
              </div>
              <span className={`rounded-md px-3 py-1 text-xs font-black uppercase ${
                novaModelUrl
                  ? 'bg-emerald-50 text-emerald-700'
                  : shouldUseNovaApi
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
              }`}>
                {novaModelUrl ? 'GLB' : shouldUseNovaApi ? 'API' : 'Local'}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{nova3D.description}</p>
            <div className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-slate-700">
              <p className="font-bold text-slate-950">{novaStatus}</p>
              {novaWorkflowId && <p className="mt-1 text-xs text-slate-500">Workflow: {novaWorkflowId}</p>}
              {novaError && <p className="mt-2 text-xs text-rose-700">{novaError}</p>}
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-950">Lớp kiến thức</h3>
              <label className="text-sm font-semibold text-slate-600">
                Tốc độ {speed.toFixed(1)}x
              </label>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.2"
              step="0.1"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="mb-4 w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              {layerButtons.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => selectKnowledgeLayer(layer.id)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm font-semibold transition ${
                    selectedLayer === layer.id
                      ? 'border-blue-500 bg-blue-50 text-blue-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  {layer.name}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-950">
            <h3 className="font-bold">{activeLayer?.name}</h3>
            <p className="mt-2 text-sm leading-6">{activeLayer?.note}</p>
          </section>

          <section className="mt-6">
            <h3 className="font-bold text-slate-950">Kiến thức chuẩn cần chốt</h3>
            <div className="mt-3 space-y-3">
              {displayedSimulation.checkpoints.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleCheckpoint(item)}
                  className={`w-full rounded-lg border p-3 text-left text-sm leading-6 transition ${
                    completedCheckpoints.has(item)
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span className="mr-2 font-black">{completedCheckpoints.has(item) ? '✓' : '○'}</span>
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm font-bold text-indigo-950">
                <span>Đã quan sát {visitedLayers.size}/{layerButtons.length} lớp</span>
                <span>Đã xác nhận {completedCheckpoints.size}/{displayedSimulation.checkpoints.length} ý</span>
              </div>
              <button type="button" onClick={submitSimulationAssessment} className="primary-button mt-3 w-full">
                Hoàn thành và lưu kết quả mô phỏng
              </button>
              {assessmentScore !== null && (
                <p className="mt-3 rounded-md bg-white p-3 text-center text-sm font-black text-indigo-900">
                  Điểm hoàn thành mô phỏng: {assessmentScore}%
                </p>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="font-bold text-slate-950">Câu hỏi gợi mở</h3>
            <ol className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
              {displayedSimulation.teacherPrompts.map((prompt, index) => (
                <li key={prompt} className="rounded-lg border border-slate-200 bg-white p-3">
                  {index + 1}. {prompt}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  )
}
