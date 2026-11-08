import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import EngineCycleConsole from '../components/EngineCycleConsole'
import { lessonsAPI } from '../services/api'
import { getSampleLesson } from '../data/courseCatalog'
import { getSimulationExperimentForLesson } from '../data/simulationExperiments'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'
import { ENGINE_PARTS, createFourStrokeEngine, engineGeometry, pickEnginePart } from '../simulations/fourStrokeEngineModel'
import { createLessonFlowModel } from '../simulations/lessonFlowModel'
import { lessonModelSimulation } from '../data/knttLessonModels'
import { createLabelSprite, isImmersiveVrSupported, requestVrSession, vrStageTransform } from '../simulations/vrSupport'
import { TWO_STROKE, pistonPinY, portOpenings, rodPose, sparkOn, twoStrokePhase } from '../simulations/twoStrokeKinematics'
import {
  FOUR_STROKES,
  FOUR_STROKE_CYCLE_RADIANS,
  FOUR_STROKE_SIMPLIFICATION_NOTE,
  fourStrokeState,
  normalizeCyclePhase,
} from '../utils/fourStrokeCycle'

// One row per stroke for the cycle table: valve states are read from the model at mid-stroke
const FOUR_STROKE_TABLE = FOUR_STROKES.map((stroke, index) => {
  const state = fourStrokeState(((index * 180 + 90) * Math.PI) / 180)
  return { ...stroke, intakeOpen: state.intakeOpen, exhaustOpen: state.exhaustOpen }
})

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
    title: 'Dây chuyền sản xuất tự động có robot',
    subtitle: 'Băng tải, robot vận chuyển, robot lắp ráp và robot hỗ trợ',
    objective:
      'Bám theo Bài 12 SGK Công nghệ 11 Cơ khí Kết nối tri thức: dây chuyền sản xuất tự động gồm băng tải và các robot cùng tham gia vận chuyển, lắp ráp, hàn, phun sơn sản phẩm.',
    layers: [
      { id: 'conveyor', name: 'Băng tải', note: 'Vận chuyển sản phẩm lần lượt qua các vị trí làm việc của dây chuyền.' },
      { id: 'transport', name: 'Robot vận chuyển', note: 'Gắp, nâng và đặt phôi, sản phẩm lên hoặc xuống băng tải.' },
      { id: 'assembly', name: 'Robot lắp ráp', note: 'Lắp các chi tiết, linh kiện lên sản phẩm, ví dụ lắp linh kiện lên bo mạch điện tử.' },
      { id: 'support', name: 'Robot hỗ trợ', note: 'Thực hiện công việc nặng nhọc, độc hại như hàn, phun sơn.' },
    ],
    checkpoints: [
      'Dây chuyền sản xuất tự động giúp các công đoạn diễn ra liên tục, đồng bộ và dễ kiểm soát.',
      'Robot thay con người ở công việc lặp lại, nặng nhọc, nguy hiểm, giúp tăng năng suất và ổn định chất lượng.',
      'Người vận hành vẫn phải giám sát dây chuyền và xử lí khi có bất thường.',
    ],
    teacherPrompts: [
      'Trong dây chuyền này, công việc nào nên giao cho robot hỗ trợ? Vì sao?',
      'Nếu băng tải dừng, các robot phía sau bị ảnh hưởng thế nào?',
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
    subtitle: 'Bu gi, pít tông, cửa nạp, cửa quét, cửa thải, các te và trục khuỷu',
    objective:
      'Bám theo sơ đồ cấu tạo động cơ xăng 2 kì trong SGK Công nghệ 11: quan sát chuyển động pít tông - thanh truyền - trục khuỷu và quá trình nạp, nén, cháy - giãn nở, quét thải qua các cửa khí.',
    layers: [
      { id: 'intake', name: 'Cửa nạp - các te', note: 'Khi pít tông đi lên, áp suất trong các te giảm, hòa khí đi qua cửa nạp vào các te.' },
      { id: 'compression', name: 'Nén trong xi lanh', note: 'Pít tông đi lên che cửa quét và cửa thải, hòa khí phía trên pít tông bị nén; bu gi chuẩn bị đánh lửa.' },
      { id: 'power', name: 'Cháy - giãn nở', note: 'Bu gi đánh lửa, khí cháy giãn nở đẩy pít tông đi xuống, qua thanh truyền làm trục khuỷu quay sinh công.' },
      { id: 'exhaust', name: 'Quét - thải', note: 'Pít tông đi xuống mở cửa thải và cửa quét; khí cháy thoát ra, hòa khí từ các te qua đường quét đi vào xi lanh.' },
    ],
    checkpoints: [
      'Động cơ xăng 2 kì hoàn thành một chu trình công tác trong hai hành trình pít tông, tương ứng một vòng quay trục khuỷu.',
      'Không dùng xu páp như nhiều động cơ 4 kì; quá trình nạp, quét và thải được điều khiển chủ yếu bằng cửa nạp, cửa quét và cửa thải.',
      'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của pít tông thành chuyển động quay của trục khuỷu.',
    ],
    teacherPrompts: [
      'Vì sao cửa quét và cửa thải phải được pít tông đóng/mở đúng thời điểm?',
      'Trong động cơ 2 kì, các te tham gia vào quá trình nạp và quét khí như thế nào?',
    ],
  },
  7: {
    modelId: 7,
    label: 'KNTT - Chương VII',
    title: 'Ô tô',
    subtitle: 'Bảy bộ phận chính: động cơ, truyền lực, bánh xe - treo, lái, phanh, khung vỏ, điện - điện tử',
    objective:
      'Bám theo Bài 21 SGK Công nghệ 11 Cơ khí Kết nối tri thức: cấu tạo chung của ô tô gồm động cơ, hệ thống truyền lực, bánh xe và hệ thống treo, hệ thống lái, hệ thống phanh, khung vỏ và hệ thống điện - điện tử.',
    layers: [
      { id: 'powertrain', name: 'Động cơ', note: 'Nguồn động lực tạo công suất cho ô tô.' },
      { id: 'transmission', name: 'Hệ thống truyền lực', note: 'Truyền, biến đổi mô men từ động cơ đến bánh xe chủ động.' },
      { id: 'suspension', name: 'Bánh xe - hệ thống treo', note: 'Bánh xe tiếp xúc mặt đường; hệ thống treo nối bánh xe với khung, giảm dao động và giữ ổn định chuyển động.' },
      { id: 'steering', name: 'Hệ thống lái', note: 'Điều khiển hướng chuyển động của ô tô.' },
      { id: 'brake', name: 'Hệ thống phanh', note: 'Giảm tốc độ, dừng xe và giữ xe đứng yên trên dốc.' },
      { id: 'body', name: 'Khung vỏ', note: 'Khung là nơi lắp đặt các hệ thống; vỏ tạo khoang chở người, hàng hóa và bảo vệ.' },
      { id: 'electrical', name: 'Hệ thống điện - điện tử', note: 'Cung cấp điện, chiếu sáng, tín hiệu, khởi động và điều khiển điện tử.' },
    ],
    checkpoints: [
      'Ô tô gồm động cơ, hệ thống truyền lực, bánh xe và hệ thống treo, hệ thống lái, hệ thống phanh, khung vỏ và hệ thống điện - điện tử.',
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
      { id: 'driver', name: 'Driver công suất', note: 'Transistor, rơle hoặc IC driver khuếch dòng để bảo vệ khối xử lí khi điều khiển tải.' },
      { id: 'output', name: 'Đầu ra', note: 'LED, còi, quạt nhỏ hoặc rơle báo trạng thái hoạt động của mạch.' },
    ],
    checkpoints: [
      'Mạch điện tử thí nghiệm nên dùng nguồn thấp áp và kiểm tra cực tính linh kiện trước khi cấp nguồn.',
      'Tín hiệu số thường được quy ước bằng hai mức logic 0 và 1; cổng logic tạo quyết định từ các mức này.',
      'Đầu ra của cổng logic chỉ cấp được dòng nhỏ; tải như còi, rơle cần transistor hoặc driver trung gian.',
      'Đo kiểm từng khối giúp tìm lỗi nhanh hơn: nguồn, cảm biến, cổng logic, driver và đầu ra.',
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
    subtitle: 'Cảm biến, mức logic 0/1, cổng AND/OR/NOT, driver và đầu ra cảnh báo',
    objective:
      'Mô phỏng thí nghiệm mạch báo cháy/đèn cảnh báo dùng tín hiệu số. Học sinh quan sát đường đi tín hiệu, thay đổi điều kiện vào và giải thích vì sao đầu ra bật hoặc tắt.',
    layers: [
      { id: 'input', name: 'Tín hiệu vào 0/1', note: 'Cảm biến khói, cảm biến nhiệt hoặc nút nhấn tạo tín hiệu logic đầu vào.' },
      { id: 'sensor', name: 'Chuẩn hóa tín hiệu', note: 'Mạch điện trở, lọc nhiễu hoặc so sánh giúp tín hiệu đủ rõ để đưa vào cổng logic.' },
      { id: 'logic', name: 'Cổng logic', note: 'Cổng AND/OR/NOT tạo điều kiện báo động theo bảng chân lí.' },
      { id: 'driver', name: 'Driver', note: 'Transistor hoặc rơle nhận lệnh dòng nhỏ và điều khiển tải dòng lớn hơn.' },
      { id: 'output', name: 'LED / còi báo', note: 'Đầu ra sáng hoặc kêu khi điều kiện logic đúng.' },
    ],
    checkpoints: [
      'Bảng chân lí giúp dự đoán chính xác đầu ra của mạch số.',
      'Cổng AND yêu cầu tất cả điều kiện đúng; cổng OR chỉ cần ít nhất một điều kiện đúng; cổng NOT đảo trạng thái.',
      'Driver bảo vệ IC logic và cho phép điều khiển tải cần dòng lớn hơn.',
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

const getSimulationKey = (lesson) => {
  if (!lesson) return 1
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
  subtitle: 'Nạp, nén, nổ và thải theo Bài 18, 19 Công nghệ 11 (Kết nối tri thức)',
  objective:
    'Mô phỏng nguyên lí làm việc của động cơ 4 kì trên lược đồ động cơ đốt trong: pít tông chuyển động giữa ĐCT và ĐCD, hành trình S, đường kính xi lanh D, bán kính quay trục khuỷu R, cùng cơ cấu phối khí và quá trình sinh công.',
  layers: [
    { id: 'intake', name: 'a. Kì nạp', note: 'Pít tông đi xuống, xu páp nạp mở, không khí được hút qua ống nạp vào xi lanh; xu páp thải đóng.' },
    { id: 'compression', name: 'b. Kì nén', note: 'Pít tông đi lên, hai xu páp đều đóng, không khí trong xi lanh bị nén tới áp suất và nhiệt độ cao.' },
    { id: 'power', name: 'c. Kì nổ (cháy - giãn nở)', note: 'Cuối kì nén, nhiên liệu được phun vào xi lanh với áp suất cao rồi tự cháy; khí cháy giãn nở đẩy pít tông từ ĐCT đến ĐCD, sinh công.' },
    { id: 'exhaust', name: 'd. Kì thải', note: 'Pít tông đi lên, xu páp thải mở, khí thải được đẩy qua ống thải ra ngoài; xu páp nạp đóng.' },
  ],
  checkpoints: [
    'Pít tông chuyển động tịnh tiến trong xi lanh từ ĐCT đến ĐCD hoặc ngược lại; quãng đường đó là hành trình S.',
    'Động cơ 4 kì hoàn thành một chu trình công tác trong bốn hành trình pít tông, tương ứng hai vòng quay trục khuỷu.',
    'Cuối kì nén, khi pít tông gần đến ĐCT, động cơ xăng dùng bu gi đánh lửa, còn động cơ Diesel phun nhiên liệu vào xi lanh để hỗn hợp tự cháy.',
    'Vc là thể tích khi pít tông ở ĐCT, Va khi ở ĐCD, Va = Vc + Vs; tỉ số nén ε = Va/Vc.',
    'Trục khuỷu dẫn động trục cam qua bộ truyền xích; trục cam quay 1 vòng khi trục khuỷu quay 2 vòng.',
    'Cơ cấu trục khuỷu - thanh truyền biến chuyển động tịnh tiến của piston thành chuyển động quay của trục khuỷu; bán kính quay R liên hệ với hành trình piston.',
  ],
  teacherPrompts: [
    'Vì sao chỉ kì nổ sinh công, còn các kì khác pít tông vẫn chuyển động được?',
    'Ở những kì nào hai xu páp đều đóng, và điều đó giúp quá trình trong xi lanh diễn ra như thế nào?',
  ],
}

const gasolineFourStrokeSimulation = {
  ...dieselFourStrokeSimulation,
  layers: [
    { id: 'intake', name: 'a. Kì nạp', note: 'Pít tông đi xuống, xu páp nạp mở, hòa khí được hút vào xi lanh; xu páp thải đóng.' },
    { id: 'compression', name: 'b. Kì nén', note: 'Pít tông đi lên, hai xu páp đều đóng, hòa khí bị nén.' },
    { id: 'power', name: 'c. Kì nổ (cháy - giãn nở)', note: 'Cuối kì nén, bu gi phóng tia lửa điện; hòa khí cháy giãn nở đẩy pít tông từ ĐCT đến ĐCD, sinh công.' },
    { id: 'exhaust', name: 'd. Kì thải', note: 'Pít tông đi lên, xu páp thải mở, khí thải được đẩy qua đường thải ra ngoài; xu páp nạp đóng.' },
  ],
}

// Crank angles (degrees after ĐCT) at which each two-stroke layer is clearly visible
const TWO_STROKE_LAYER_ANGLES = { power: 60, exhaust: 180, compression: 290, intake: 330 }

const LOGIC_BOARD_FRAMING = {
  center: new THREE.Vector3(0, 0.35, 0),
  width: 8.6,
  height: 4.2,
  direction: new THREE.Vector3(0, 0.62, 1).normalize(),
}

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

function buildChapterModel(courseId, engineMode = 'twoStroke') {
  const root = new THREE.Group()
  const animated = []
  const annotations = []

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
    // Bài 12: a conveyor carries the products past robots that transport, assemble and support (weld, paint)
    const conveyor = setLayerName(new THREE.Group(), 'conveyor')
    const belt = box(6, 0.12, 0.9, 0x334155)
    belt.position.y = 0.05
    conveyor.add(belt)
    ;[-2.9, 2.9].forEach((x) => {
      const roller = cylinder(0.16, 0.95, 0x64748b)
      roller.rotation.x = Math.PI / 2
      roller.position.set(x, 0.05, 0)
      conveyor.add(roller)
    })
    ;[-2.4, -0.8, 0.8, 2.4].forEach((x) => {
      [-0.38, 0.38].forEach((z) => {
        const leg = box(0.08, 0.6, 0.08, 0x475569)
        leg.position.set(x, -0.3, z)
        conveyor.add(leg)
      })
    })
    root.add(conveyor)
    addAnnotation(annotations, root, 'conveyor', 'Băng tải', 'Vận chuyển sản phẩm lần lượt qua các vị trí làm việc của dây chuyền.', -2.5, 0.5, 0.5)

    ;[0, 1.4, 2.8, 4.2].forEach((offset) => {
      const product = setLayerName(box(0.42, 0.22, 0.36, 0x22c55e), 'conveyor')
      product.position.set(-2.8, 0.22, 0)
      product.userData.offset = offset
      root.add(product)
      animated.push({ mesh: product, type: 'belt' })
    })

    // An arm on a turning base: shoulder and elbow joints, and the tool for its task at the wrist
    const makeRobot = (layerId, x, color, tool, phase) => {
      const robot = setLayerName(new THREE.Group(), layerId)
      robot.position.set(x, -0.6, -1.05)
      const base = cylinder(0.3, 0.3, 0x1f2937)
      base.position.y = 0.15
      robot.add(base)
      const turret = new THREE.Group()
      turret.position.y = 0.3
      robot.add(turret)
      const column = cylinder(0.14, 0.7, color)
      column.position.y = 0.35
      turret.add(column)
      const shoulder = new THREE.Group()
      shoulder.position.y = 0.72
      turret.add(shoulder)
      const upperArm = box(0.16, 0.9, 0.16, color)
      upperArm.position.y = 0.45
      shoulder.add(upperArm)
      const elbow = new THREE.Group()
      elbow.position.y = 0.9
      shoulder.add(elbow)
      const foreArm = box(0.13, 0.75, 0.13, color)
      foreArm.position.y = 0.37
      elbow.add(foreArm)
      const wrist = new THREE.Group()
      wrist.position.y = 0.78
      wrist.rotation.x = 1.0
      elbow.add(wrist)
      wrist.add(tool)
      setLayerName(robot, layerId)
      root.add(robot)
      animated.push(
        { mesh: turret, type: 'robotTurn', phase },
        { mesh: shoulder, type: 'robotShoulder', phase },
        { mesh: elbow, type: 'robotElbow', phase }
      )
      return { robot, wrist }
    }

    const gripper = new THREE.Group()
    ;[-0.09, 0.09].forEach((x) => {
      const finger = box(0.05, 0.22, 0.12, 0xe2e8f0)
      finger.position.set(x, 0.11, 0)
      gripper.add(finger)
    })
    const transport = makeRobot('transport', -1.6, 0xf97316, gripper, 0)
    addAnnotation(annotations, transport.robot, 'transport', 'Robot vận chuyển', 'Gắp, nâng và đặt phôi, sản phẩm lên hoặc xuống băng tải.', 0, 2.75, 0)

    const screwdriver = new THREE.Group()
    const spindle = cylinder(0.05, 0.3, 0x94a3b8)
    spindle.position.y = 0.15
    screwdriver.add(spindle)
    const assembly = makeRobot('assembly', 0.2, 0x2563eb, screwdriver, 2.1)
    addAnnotation(annotations, assembly.robot, 'assembly', 'Robot lắp ráp', 'Lắp các chi tiết, linh kiện lên sản phẩm, ví dụ lắp linh kiện lên bo mạch điện tử.', 0, 2.75, 0)

    const torch = new THREE.Group()
    const nozzle = cone(0.07, 0.3, 0x64748b)
    nozzle.rotation.x = Math.PI
    nozzle.position.y = 0.15
    torch.add(nozzle)
    const sparkPoint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), material(0xfacc15, 0.9))
    sparkPoint.material.userData.dynamicOpacity = true
    sparkPoint.position.y = 0.34
    torch.add(sparkPoint)
    const support = makeRobot('support', 1.9, 0x7c3aed, torch, 4.2)
    animated.push({ mesh: sparkPoint, type: 'spark' })
    addAnnotation(annotations, support.robot, 'support', 'Robot hỗ trợ (hàn, phun sơn)', 'Thực hiện các công việc nặng nhọc, độc hại như hàn, phun sơn sản phẩm.', 0, 2.75, 0)
  }

  if (courseId === 6 && engineMode !== 'diesel4') {
    const cylinderWall = cylinder(0.62, 2.65, 0x64748b, 0.2)
    cylinderWall.name = 'compression'
    cylinderWall.position.y = 1.12
    root.add(cylinderWall)
    addAnnotation(annotations, root, 'compression', '10. Xi lanh', 'Buồng làm việc nơi pít tông nén hòa khí và khí cháy giãn nở sinh công', -0.82, 2.2, 0)

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
    addAnnotation(annotations, root, 'power', '1. Bu gi', 'Đánh lửa khi hòa khí bị nén để bắt đầu kì nổ (cháy - giãn nở)', 0.55, 3.05, 0)

    // The piston is long enough to cover every port: its crown controls the exhaust and transfer ports,
    // its skirt controls the intake port into the crankcase
    const pistonGroup = new THREE.Group()
    pistonGroup.name = 'power'
    const pistonLength = TWO_STROKE.crownAbovePin + TWO_STROKE.skirtBelowPin
    const piston = cylinder(0.5, pistonLength, 0x2563eb)
    piston.position.y = (TWO_STROKE.crownAbovePin - TWO_STROKE.skirtBelowPin) / 2
    pistonGroup.add(piston)
    ;[0.3, 0.2].forEach((y) => {
      const ring = cylinder(0.52, 0.035, 0x0f172a)
      ring.position.y = y
      pistonGroup.add(ring)
    })
    const pistonPin = cylinder(0.08, 1.02, 0xe2e8f0)
    pistonPin.rotation.x = Math.PI / 2
    pistonGroup.add(pistonPin)
    pistonGroup.position.y = pistonPinY(0)
    root.add(pistonGroup)
    addAnnotation(annotations, pistonGroup, 'power', '2. Pít tông', 'Đóng mở các cửa khí và nhận lực khí cháy để chuyển động lên xuống', 0.92, 0.3, 0)

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
    addAnnotation(annotations, root, 'intake', '7. Các te', 'Khoang dưới pít tông nhận hòa khí từ cửa nạp rồi ép sang cửa quét', -1.2, -0.65, 0)

    const crank = new THREE.Group()
    crank.name = 'power'
    crank.position.y = TWO_STROKE.crankY
    const crankWheel = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.055, 12, 72), material(0x111827))
    crank.add(crankWheel)
    const crankWeb = box(0.16, TWO_STROKE.radius, 0.08, 0x334155)
    crankWeb.position.y = TWO_STROKE.radius / 2
    crank.add(crankWeb)
    // Crank pin at radius R: the piston stroke S = 2R
    const crankPin = cylinder(0.1, 0.26, 0x0ea5e9)
    crankPin.rotation.x = Math.PI / 2
    crankPin.position.set(0, TWO_STROKE.radius, 0)
    crank.add(crankPin)
    root.add(crank)
    addAnnotation(annotations, crank, 'power', '6. Trục khuỷu', 'Biến chuyển động tịnh tiến của pít tông thành chuyển động quay', 0.95, -0.15, 0)

    const rod = box(0.12, TWO_STROKE.rodLength, 0.12, 0xf97316)
    rod.name = 'power'
    const rodStart = rodPose(0)
    rod.position.set(rodStart.center.x, rodStart.center.y, 0)
    root.add(rod)
    addAnnotation(annotations, rod, 'power', '5. Thanh truyền', 'Nối pít tông với trục khuỷu để truyền lực', 0.38, 0, 0)

    const portBox = ([bottom, top], depth, color, opacity) => {
      const port = box(0.18, top - bottom, depth, color, opacity)
      port.position.set(0.6, (bottom + top) / 2, 0)
      return port
    }
    const intakeY = (TWO_STROKE.intakePort[0] + TWO_STROKE.intakePort[1]) / 2
    const intakePipe = box(1.18, TWO_STROKE.intakePort[1] - TWO_STROKE.intakePort[0], 0.34, 0x38bdf8, 0.82)
    intakePipe.name = 'intake'
    intakePipe.position.set(1.2, intakeY, 0)
    root.add(intakePipe)
    const intakePort = portBox(TWO_STROKE.intakePort, 0.52, 0x0284c7, 0.95)
    intakePort.name = 'intake'
    root.add(intakePort)
    addAnnotation(annotations, root, 'intake', '4. Cửa nạp', 'Váy pít tông mở cửa nạp gần ĐCT; hòa khí đi vào các te đang có áp suất thấp', 1.75, 0.62, 0)

    const exhaustY = (TWO_STROKE.exhaustPort[0] + TWO_STROKE.exhaustPort[1]) / 2
    const exhaustPipe = box(1.34, TWO_STROKE.exhaustPort[1] - TWO_STROKE.exhaustPort[0], 0.42, 0xf97316, 0.86)
    exhaustPipe.name = 'exhaust'
    exhaustPipe.position.set(1.35, exhaustY, 0)
    root.add(exhaustPipe)
    const exhaustPort = portBox(TWO_STROKE.exhaustPort, 0.6, 0xea580c, 0.95)
    exhaustPort.name = 'exhaust'
    root.add(exhaustPort)
    addAnnotation(annotations, root, 'exhaust', '3. Cửa thải', 'Đỉnh pít tông mở cửa thải trước cửa quét khi đi xuống, khí cháy thoát ra ngoài', 1.86, 1.86, 0)

    const transferY = (TWO_STROKE.transferPort[0] + TWO_STROKE.transferPort[1]) / 2
    const transferPipe = box(0.26, transferY + 0.2, 0.34, 0x22c55e, 0.55)
    transferPipe.name = 'exhaust'
    transferPipe.position.set(-0.78, (transferY - 0.2) / 2, 0)
    root.add(transferPipe)
    const transferTop = box(0.44, TWO_STROKE.transferPort[1] - TWO_STROKE.transferPort[0], 0.42, 0x16a34a, 0.82)
    transferTop.name = 'exhaust'
    transferTop.position.set(-0.43, transferY, 0)
    root.add(transferTop)
    addAnnotation(annotations, root, 'exhaust', '8. Đường thông các te - cửa quét', 'Dẫn hòa khí từ các te lên cửa quét.', -1.28, 0.5, 0)
    addAnnotation(annotations, root, 'exhaust', '9. Cửa quét', 'Mở sau cửa thải khi pít tông gần ĐCD; hòa khí từ các te vào xi lanh và đẩy khí thải ra.', -0.86, 1.62, 0)

    const intakeFlow = createFlowArrow(0.82, 0x0ea5e9)
    intakeFlow.name = 'intake'
    intakeFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    intakeFlow.userData.port = 'intake'
    intakeFlow.position.set(1.2, intakeY, 0.36)
    intakeFlow.rotation.y = Math.PI
    root.add(intakeFlow)

    const transferFlow = createFlowArrow(0.86, 0x22c55e)
    transferFlow.name = 'exhaust'
    transferFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    transferFlow.userData.port = 'transfer'
    transferFlow.position.set(-0.78, 0.55, 0.38)
    transferFlow.rotation.z = Math.PI / 2
    root.add(transferFlow)

    const exhaustFlow = createFlowArrow(0.95, 0xf97316)
    exhaustFlow.name = 'exhaust'
    exhaustFlow.traverse((part) => {
      if (part.material) part.material.userData.dynamicOpacity = true
    })
    exhaustFlow.userData.port = 'exhaust'
    exhaustFlow.position.set(1.36, exhaustY, 0.36)
    root.add(exhaustFlow)

    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), material(0xfacc15, 0.85))
    spark.name = 'power'
    spark.material.userData.dynamicOpacity = true
    spark.position.set(0, 2.36, 0)
    root.add(spark)

    const numberLabels = [
      ['1', 0.38, 3.12, 0.46],
      ['2', 0.78, 0.15, 0.46, pistonGroup],
      ['3', 2.06, exhaustY, 0.46],
      ['4', 2.06, intakeY - 0.08, 0.46],
      ['5', 0.48, 0.55, 0.46],
      ['6', 0.95, -0.66, 0.46],
      ['7', -1.18, -0.74, 0.46],
      ['8', -1.22, 0.08, 0.46],
      ['9', -0.72, transferY, 0.46],
      ['10', -0.92, 2.05, 0.46],
    ]
    numberLabels.forEach(([text, x, y, z, parent = root]) => {
      const labelAnchor = new THREE.Object3D()
      labelAnchor.position.set(x, y, z)
      parent.add(labelAnchor)
      annotations.push({ anchor: labelAnchor, layerId: 'all', label: text, note: '' })
    })

    animated.push(
      { mesh: pistonGroup, type: 'twoStrokePiston' },
      { mesh: rod, type: 'twoStrokeRod' },
      { mesh: crank, type: 'twoStrokeCrank' },
      { mesh: intakeFlow, type: 'portFlow' },
      { mesh: transferFlow, type: 'portFlow' },
      { mesh: exhaustFlow, type: 'portFlow' },
      { mesh: spark, type: 'twoStrokeSpark' }
    )
  }

  if (courseId === 5 || courseId === 7) {
    // Bài 21 names seven parts of a car; Chương V only needs power source, drive and the machine it moves
    const isCar = courseId === 7
    const part = (layerId) => (isCar ? layerId : { powertrain: 'powertrain', transmission: 'transmission' }[layerId] || 'chassis')
    const add = (mesh, layerId, x, y, z) => {
      mesh.name = part(layerId)
      mesh.position.set(x, y, z)
      root.add(mesh)
      return mesh
    }
    const alongX = (mesh) => {
      mesh.rotation.z = Math.PI / 2
      return mesh
    }
    const alongZ = (mesh) => {
      mesh.rotation.x = Math.PI / 2
      return mesh
    }
    const wheelX = [-1.7, 1.7]
    const wheelZ = [-0.85, 0.85]

    // Khung vỏ: the frame carries every system, the body shell is see-through so the systems inside stay visible
    ;[-0.55, 0.55].forEach((z) => add(box(4.5, 0.1, 0.1, 0x334155), 'body', 0, 0.2, z))
    ;[-1.95, 0, 1.95].forEach((x) => add(box(0.1, 0.1, 1.2, 0x334155), 'body', x, 0.2, 0))
    add(box(4.8, 0.62, 1.45, 0x2563eb, 0.22), 'body', 0, 0.62, 0)
    add(box(1.8, 0.58, 1.3, 0x60a5fa, 0.2), 'body', 0.35, 1.22, 0)

    // Động cơ at the front
    add(box(0.85, 0.5, 0.75, 0xf97316), 'powertrain', -1.65, 0.55, 0)

    // Hệ thống truyền lực: gearbox, propeller shaft, final drive and the driven rear axle
    add(box(0.45, 0.34, 0.42, 0xeab308), 'transmission', -0.98, 0.42, 0)
    add(alongX(cylinder(0.05, 2.25, 0xfacc15)), 'transmission', 0.45, 0.28, 0)
    add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 24), material(0xeab308)), 'transmission', 1.7, 0.1, 0)
    add(alongZ(cylinder(0.05, 1.5, 0xfacc15)), 'transmission', 1.7, 0, 0)

    // Bánh xe - hệ thống treo: the wheel axle runs across the car, so the wheels turn about z
    wheelX.forEach((x) => {
      wheelZ.forEach((z) => {
        const wheel = add(alongZ(cylinder(0.42, 0.3, 0x111827)), 'suspension', x, 0, z)
        animated.push({ mesh: wheel, type: 'wheel' })
        const hub = add(alongZ(cylinder(0.16, 0.32, 0x94a3b8)), 'suspension', x, 0, z)
        animated.push({ mesh: hub, type: 'wheel' })
        add(cylinder(0.07, 0.24, 0x16a34a), 'suspension', x, 0.12 + 0.1, z * 0.7)
      })
    })

    if (isCar) {
      // Hệ thống lái: steering wheel, column and the track rod that turns the front wheels
      const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 12, 40), material(0x7c3aed))
      steeringWheel.rotation.y = Math.PI / 2
      steeringWheel.rotation.x = 0.5
      add(steeringWheel, 'steering', -0.32, 1.12, -0.32)
      const column = add(cylinder(0.035, 1.25, 0x7c3aed), 'steering', -0.8, 0.62, -0.32)
      column.rotation.z = 0.95
      add(alongZ(cylinder(0.04, 1.5, 0x8b5cf6)), 'steering', -1.42, 0.08, 0)

      // Hệ thống phanh: a disc and caliper at every wheel, pedal in the cabin
      wheelX.forEach((x) => {
        wheelZ.forEach((z) => {
          add(alongZ(cylinder(0.27, 0.04, 0xdc2626)), 'brake', x, 0, z * 0.78)
          add(box(0.12, 0.14, 0.08, 0x991b1b), 'brake', x - 0.22, 0.18, z * 0.78)
        })
      })
      add(box(0.06, 0.22, 0.12, 0xdc2626), 'brake', -0.65, 0.5, 0.25)

      // Hệ thống điện - điện tử: battery, headlights, tail lights and the electronic control unit
      add(box(0.32, 0.24, 0.3, 0x0f172a), 'electrical', -2.05, 0.5, 0.48)
      add(box(0.3, 0.08, 0.24, 0x0891b2), 'electrical', -0.3, 0.9, 0.32)
      ;[-0.48, 0.48].forEach((z) => {
        add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), material(0xfde047)), 'electrical', -2.4, 0.66, z)
        add(box(0.04, 0.12, 0.2, 0xef4444), 'electrical', 2.41, 0.7, z)
      })

      addAnnotation(annotations, root, 'powertrain', 'Động cơ', 'Nguồn động lực tạo công suất cho ô tô.', -1.65, 1.0, 0)
      addAnnotation(annotations, root, 'transmission', 'Hệ thống truyền lực', 'Hộp số, trục các đăng, truyền lực chính - vi sai truyền mô men đến bánh xe chủ động.', 0.45, 0.48, 0)
      addAnnotation(annotations, root, 'suspension', 'Bánh xe - hệ thống treo', 'Bánh xe tiếp xúc mặt đường; hệ thống treo nối bánh xe với khung, giảm dao động.', 1.7, 0.62, 0.95)
      addAnnotation(annotations, root, 'steering', 'Hệ thống lái', 'Vô lăng, trục lái, dẫn động lái thay đổi hướng chuyển động của xe.', -0.32, 1.45, -0.32)
      addAnnotation(annotations, root, 'brake', 'Hệ thống phanh', 'Giảm tốc độ, dừng xe và giữ xe đứng yên.', 1.25, 0.3, -1.0)
      addAnnotation(annotations, root, 'body', 'Khung vỏ', 'Khung đỡ các hệ thống; vỏ tạo khoang chở người, hàng hóa.', 0.35, 1.68, 0)
      addAnnotation(annotations, root, 'electrical', 'Hệ thống điện - điện tử', 'Ắc quy, chiếu sáng, tín hiệu và bộ điều khiển điện tử.', -2.3, 0.95, 0.48)
    } else {
      addAnnotation(annotations, root, 'chassis', 'Máy / phương tiện', 'Đối tượng sử dụng nguồn động lực và hệ truyền động', 0.8, 1.05, 0)
      addAnnotation(annotations, root, 'control', 'Khai thác - bảo dưỡng', 'Vận hành, bảo dưỡng, sửa chữa, kiểm định', 0.35, 1.85, 0)
      addAnnotation(annotations, root, 'powertrain', 'Nguồn động lực', 'Tạo công suất hoặc mô men cho máy/phương tiện', -1.65, 1.0, 0)
      addAnnotation(annotations, root, 'transmission', 'Hệ truyền động', 'Truyền và biến đổi công suất đến bộ phận công tác', 0.45, 0.48, 0)
    }
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
    addAnnotation(annotations, root, 'input', 'Nguồn 5V / GND', 'Nguồn thấp áp cấp cho cảm biến, IC logic, driver và đầu ra.', -2.65, 0.36, -1.35)

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

    const driver = box(0.86, 0.28, 0.72, 0xf97316)
    driver.name = 'driver'
    driver.position.set(2.38, 0.3, 0)
    root.add(driver)
    const transistor = cylinder(0.18, 0.18, 0x111827)
    transistor.name = 'driver'
    transistor.position.set(2.38, 0.58, -0.48)
    root.add(transistor)
    addAnnotation(annotations, root, 'driver', 'Transistor / driver', 'Khuếch dòng từ đầu ra cổng logic để điều khiển còi, LED hoặc rơle.', 2.38, 0.92, 0)

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
      ['logic', 0.36, 0, 1.96, 0, 0x8b5cf6],
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
  const [isPlaying, setIsPlaying] = useState(
    () => !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
  const [speed, setSpeed] = useState(1)
  const [selectedLayer, setSelectedLayer] = useState('all')
  const [activeStep, setActiveStep] = useState(0)
  const [visitedLayers, setVisitedLayers] = useState(() => new Set(['all']))
  const [completedCheckpoints, setCompletedCheckpoints] = useState(() => new Set())
  const [assessmentScore, setAssessmentScore] = useState(null)
  const simulationStartedAt = useRef(Date.now())
  const [engineMode, setEngineMode] = useState('twoStroke')
  const [fuel, setFuel] = useState('diesel')
  const [selectedPart, setSelectedPart] = useState(null)
  const [showLabels, setShowLabels] = useState(true)
  const [renderFailed, setRenderFailed] = useState(false)
  const [vrSupported, setVrSupported] = useState(false)
  const [inVr, setInVr] = useState(false)
  const [vrError, setVrError] = useState('')
  const [exploded, setExploded] = useState(false)
  const rendererRef = useRef(null)
  const vrActions = useRef({ nextLayer: () => {}, togglePlay: () => {} })
  const motion = useRef({ angle: 0, cyclePhase: 0, isPlaying, speed, showLabels, explode: 0, explodeTarget: 0 })
  const viewControls = useRef({ reset: () => {}, highlight: () => {}, refit: () => {} })

  useEffect(() => {
    motion.current.isPlaying = isPlaying
    motion.current.speed = speed
    motion.current.showLabels = showLabels
  }, [isPlaying, speed, showLabels])

  useEffect(() => {
    selectedLayerRef.current = selectedLayer
  }, [selectedLayer])

  // Bài 18 opens on the four-stroke engine, as the textbook does, and can switch to the two-stroke one
  useEffect(() => {
    if (Number(lesson?.grade_level) === 11 && Number(lesson?.source_id || lesson?.id) === 602) setEngineMode('diesel4')
  }, [lesson])

  useEffect(() => {
    let active = true
    isImmersiveVrSupported().then((supported) => active && setVrSupported(supported))
    return () => {
      active = false
    }
  }, [])

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
  // Bài 17 and 19 describe the four-stroke engine; Bài 18 explains both the four-stroke and the two-stroke principle
  const engineLessonId = Number(lesson?.grade_level) === 11 ? Number(lesson?.source_id || lesson?.id) : 0
  const isFourStrokeLesson = [601, 602, 603].includes(engineLessonId)
  const isFourStrokeOnly = [601, 603].includes(engineLessonId)
  const chapterSimulation = lesson?.grade_level === 12
    ? getIndustrial12Simulation(simulationKey)
    : lesson?.grade_level === 11
      ? mechanical11SpecializedSimulations[simulationKey] || knttSimulations[simulationKey] || mechanical11SpecializedSimulations[1]
      : technology10Simulations[simulationKey] || technology10Simulations[1]
  const simulation = lessonModelSimulation(lesson, chapterSimulation) || chapterSimulation
  const isFourStrokeMode = simulation.modelId === 6 && (engineMode === 'diesel4' || isFourStrokeOnly)
  const isTwoStrokeMode = simulation.modelId === 6 && !isFourStrokeMode
  const fourStrokeSimulation = fuel === 'gasoline' ? gasolineFourStrokeSimulation : dieselFourStrokeSimulation
  const displayedSimulation = isFourStrokeMode ? fourStrokeSimulation : simulation
  const simulationExperiment = getSimulationExperimentForLesson(lesson)
  const activeLayer = selectedLayer === 'all'
    ? { name: 'Tổng quan', note: displayedSimulation.objective }
    : displayedSimulation.layers.find((layer) => layer.id === selectedLayer)

  const layerButtons = useMemo(
    () => [{ id: 'all', name: 'Tổng quan', note: displayedSimulation.objective }, ...displayedSimulation.layers],
    [displayedSimulation]
  )

  const seekEngine = useCallback((degrees) => {
    motion.current.angle = (degrees * Math.PI) / 180
    setIsPlaying(false)
  }, [])

  const togglePlaying = useCallback(() => setIsPlaying((value) => !value), [])

  const selectKnowledgeLayer = (layerId) => {
    setSelectedLayer(layerId)
    setVisitedLayers((current) => new Set([...current, layerId]))
    const strokeIndex = displayedSimulation.layers.findIndex((layer) => layer.id === layerId)
    if (isFourStrokeMode && strokeIndex >= 0) seekEngine(strokeIndex * 180 + 90)
    if (isTwoStrokeMode && TWO_STROKE_LAYER_ANGLES[layerId] !== undefined) seekEngine(TWO_STROKE_LAYER_ANGLES[layerId])
  }

  // Controller buttons in the headset: trigger moves to the next knowledge layer, grip pauses or plays
  vrActions.current = {
    nextLayer: () => {
      const index = layerButtons.findIndex((layer) => layer.id === selectedLayer)
      selectKnowledgeLayer(layerButtons[(index + 1) % layerButtons.length].id)
    },
    togglePlay: togglePlaying,
  }

  const enterVr = async () => {
    setVrError('')
    try {
      const session = await requestVrSession()
      await rendererRef.current?.xr.setSession(session)
    } catch {
      setVrError('Không mở được chế độ VR. Hãy đeo kính, cho phép trình duyệt dùng thiết bị VR rồi thử lại.')
    }
  }

  const toggleExploded = () => {
    const next = !exploded
    setExploded(next)
    motion.current.explodeTarget = next ? 1 : 0
    // Parts are easier to look at while the engine stands still
    if (next) setIsPlaying(false)
    viewControls.current.refit()
  }

  const closePartCard = () => {
    setSelectedPart(null)
    viewControls.current.highlight(null)
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

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true })
    } catch {
      setRenderFailed(true)
      return undefined
    }
    setRenderFailed(false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.xr.enabled = true
    renderer.xr.setReferenceSpaceType('local-floor')
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    const labelLayer = document.createElement('div')
    labelLayer.style.position = 'absolute'
    labelLayer.style.inset = '0'
    labelLayer.style.pointerEvents = 'none'
    labelLayer.style.zIndex = '2'
    container.appendChild(labelLayer)

    scene.add(new THREE.AmbientLight(0xffffff, isFourStrokeMode ? 1.1 : 0.7))
    const light = new THREE.DirectionalLight(0xffffff, isFourStrokeMode ? 1.8 : 1.1)
    light.position.set(4, 8, 5)
    scene.add(light)
    if (isFourStrokeMode) {
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.8)
      fillLight.position.set(-5, 2, 6)
      scene.add(fillLight)
    }

    const engine = isFourStrokeMode ? createFourStrokeEngine({ fuel }) : null
    const lessonModel = simulation.lessonModel ? createLessonFlowModel(simulation.lessonModel) : null
    const base = new THREE.GridHelper(lessonModel ? 16 : 8, lessonModel ? 16 : 8, 0xcbd5e1, 0xe2e8f0)
    base.position.y = engine ? -2.52 : lessonModel ? lessonModel.floorY : -0.65
    // Everything the student looks at sits in one stage, which VR scales down onto a table in front of them
    const stage = new THREE.Group()
    stage.add(base)
    scene.add(stage)

    const { root, animated, annotations, framing: modelFraming } = engine || lessonModel || buildChapterModel(simulation.modelId, engineMode)
    const framing = modelFraming || (simulation.modelId === 8 ? LOGIC_BOARD_FRAMING : null)
    // The taken-apart engine is taller, so the camera frames it differently
    const assembledFraming = engine ? { ...engine.framing } : null
    const applyEngineFraming = () => {
      if (engine) Object.assign(framing, motion.current.explodeTarget ? engine.explodedFraming : assembledFraming)
    }
    applyEngineFraming()
    if (simulation.modelId === 8) {
      root.scale.setScalar(0.78)
      root.position.set(0, -0.18, 0.12)
    }
    stage.add(root)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.target.copy(framing ? framing.center : new THREE.Vector3(0, 0.3, 0))

    const engineViewDistance = () => {
      const { width, height } = framing
      const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
      return Math.max(height / 2 / halfFov, width / 2 / (halfFov * camera.aspect)) * 1.04
    }

    const setEngineZoomLimits = (distance) => {
      controls.minDistance = distance * 0.35
      controls.maxDistance = distance * 1.8
    }

    const fitEngineView = () => {
      const { center } = framing
      const distance = engineViewDistance()
      const direction = framing.direction || new THREE.Vector3(0.42, 0.14, 1).normalize()
      camera.position.copy(center).addScaledVector(direction, distance)
      controls.target.copy(center)
      setEngineZoomLimits(distance)
      controls.update()
    }

    // Labels with a note only fit a wide view; the same notes stay in the panel beside the model
    const shortLabels = container.getBoundingClientRect().width < 1100
    const annotationViews = annotations.map((item, index) => {
      // Labels of the logic board stand side by side, so every other one is raised
      const lift = shortLabels && simulation.modelId === 8 ? (index % 3) * 26 : 0
      const annotation = { ...item, compact: item.compact || shortLabels, lift }
      const element = document.createElement('div')
      element.className = annotation.compact ? 'simulation-part-label simulation-part-chip' : 'simulation-part-label'
      element.innerHTML = annotation.compact
        ? `<span>${annotation.label}</span>`
        : `<span>${annotation.label}</span><small>${annotation.note}</small>`
      labelLayer.appendChild(element)
      return { ...annotation, element }
    })

    let fittedDistance = 0
    const resize = () => {
      if (renderer.xr.isPresenting) return
      const rect = container.getBoundingClientRect()
      const width = Math.max(rect.width, 280)
      const height = Math.max(rect.height, 240)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      if (framing && !fittedDistance) {
        fitEngineView()
      } else if (framing) {
        // Keeps the student's angle and zoom while the whole engine still fits the new size
        const offset = camera.position.clone().sub(controls.target)
        camera.position.copy(controls.target).addScaledVector(offset, engineViewDistance() / fittedDistance)
        setEngineZoomLimits(engineViewDistance())
        controls.update()
      }
      if (framing) fittedDistance = engineViewDistance()
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let pressedAt = null
    const onPointerDown = (event) => {
      pressedAt = { x: event.clientX, y: event.clientY }
    }
    const onPointerUp = (event) => {
      if (!engine || !pressedAt) return
      const moved = Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y)
      pressedAt = null
      if (moved > 6) return
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      )
      raycaster.setFromCamera(pointer, camera)
      const part = pickEnginePart(raycaster.intersectObject(root, true))
      engine.highlightPart(part)
      setSelectedPart(part)
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    renderer.domElement.addEventListener('pointerup', onPointerUp)

    viewControls.current = {
      reset: () => (framing ? fitEngineView() : controls.reset()),
      highlight: (part) => engine?.highlightPart(part),
      refit: () => {
        applyEngineFraming()
        if (framing) fitEngineView()
      },
    }

    // VR: labels become sprites, made once the size of the model in the headset is known
    let vrLabels = []
    const onSessionStart = () => {
      stage.updateMatrixWorld(true)
      const bounds = new THREE.Box3().setFromObject(root)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      const transform = vrStageTransform(size, center)
      stage.scale.setScalar(transform.scale)
      stage.position.copy(transform.position)
      if (!vrLabels.length) {
        const unit = Math.max(size.x, size.y, size.z) / 6
        const anchorScale = new THREE.Vector3()
        vrLabels = annotationViews
          .filter((annotation) => annotation.layerId !== 'all' && annotation.label)
          .map((annotation) => {
            annotation.anchor.getWorldScale(anchorScale)
            const sprite = createLabelSprite(annotation.label, annotation.note, unit / (anchorScale.x / transform.scale || 1))
            annotation.anchor.add(sprite)
            return { sprite, layerId: annotation.layerId }
          })
      }
      labelLayer.style.display = 'none'
      setInVr(true)
    }
    const onSessionEnd = () => {
      stage.scale.setScalar(1)
      stage.position.set(0, 0, 0)
      vrLabels.forEach(({ sprite }) => {
        sprite.visible = false
      })
      setInVr(false)
      resize()
    }
    renderer.xr.addEventListener('sessionstart', onSessionStart)
    renderer.xr.addEventListener('sessionend', onSessionEnd)
    const controllers = [0, 1].map((index) => {
      const controller = renderer.xr.getController(index)
      controller.addEventListener('select', () => vrActions.current.nextLayer())
      controller.addEventListener('squeeze', () => vrActions.current.togglePlay())
      const ray = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]),
        new THREE.LineBasicMaterial({ color: 0x1e3a8a })
      )
      ray.scale.z = 2
      controller.add(ray)
      scene.add(controller)
      return controller
    })

    let lastStep = -1
    let lastFrameAt = performance.now()
    const projected = new THREE.Vector3()
    const worldPosition = new THREE.Vector3()

    const animate = () => {
      const now = performance.now()
      const frames = Math.min((now - lastFrameAt) / (1000 / 60), 6)
      lastFrameAt = now
      const running = motion.current
      const stepScale = running.isPlaying ? running.speed * frames : 0
      running.angle += 0.025 * stepScale
      const angle = running.angle
      const presenting = renderer.xr.isPresenting
      if (!presenting) controls.update()
      if (!framing) root.rotation.y = simulation.modelId === 8 ? 0 : Math.sin(angle * 0.25) * 0.18

      const cycleDuration = isFourStrokeMode ? FOUR_STROKE_CYCLE_RADIANS : Math.PI * 2
      const cyclePhase = ((angle % cycleDuration) + cycleDuration) % cycleDuration
      const cycleProgress = cyclePhase / cycleDuration
      if (engine) {
        running.cyclePhase = normalizeCyclePhase(angle)
        // Parts glide apart or back together instead of jumping
        running.explode += (running.explodeTarget - running.explode) * Math.min(1, 0.1 * frames)
        if (Math.abs(running.explodeTarget - running.explode) < 0.001) running.explode = running.explodeTarget
        engine.update(running.cyclePhase, running.explode)
      }
      const ports = isTwoStrokeMode ? portOpenings(angle) : null
      const step = isTwoStrokeMode
        ? displayedSimulation.layers.findIndex((layer) => layer.id === twoStrokePhase(angle))
        : Math.floor(cycleProgress * displayedSimulation.layers.length)
      if (step !== lastStep) {
        lastStep = step
        setActiveStep(step % displayedSimulation.layers.length)
      }

      animated.forEach(({ mesh, type, phase = 0 }) => {
        if (type === 'spin' || type === 'wheel') mesh.rotation.y += 0.05 * stepScale
        if (type === 'spinZ') mesh.rotation.z -= 0.04 * stepScale
        if (type === 'spinX') mesh.rotation.x -= 0.08 * stepScale
        if (type === 'flow') {
          const { begin, end, offset } = mesh.userData.flow
          mesh.position.lerpVectors(begin, end, (angle * 0.35 + offset) % 1)
        }
        if (type === 'tool') mesh.position.y = 0.35 + Math.sin(angle * 2) * 0.18
        if (type === 'belt') mesh.position.x = -2.8 + ((angle * 0.9 + (mesh.userData.offset || 0)) % 5.6)
        if (type === 'robotTurn') mesh.rotation.y = Math.sin(angle * 0.9 + phase) * 0.5
        if (type === 'robotShoulder') mesh.rotation.x = 0.85 + Math.sin(angle * 1.4 + phase) * 0.15
        if (type === 'robotElbow') mesh.rotation.x = 0.95 + Math.sin(angle * 1.4 + phase + 0.8) * 0.2
        if (type === 'piston') mesh.position.y = 0.45 + Math.sin(angle * 2) * 0.75
        if (type === 'rod') {
          mesh.position.y = -0.15 + Math.sin(angle * 2) * 0.35
          mesh.rotation.z = Math.sin(angle * 2) * 0.22
        }
        if (type === 'twoStrokePiston') mesh.position.y = pistonPinY(angle)
        if (type === 'twoStrokeRod') {
          const pose = rodPose(angle)
          mesh.position.set(pose.center.x, pose.center.y, 0)
          mesh.rotation.z = pose.rotationZ
        }
        if (type === 'twoStrokeCrank') mesh.rotation.z = -angle
        if (type === 'portFlow') {
          // An arrow shows gas moving only while the piston keeps that port open
          const open = ports[mesh.userData.port]
          const pulse = open ? 0.45 + Math.abs(Math.sin(angle * 2.4)) * 0.55 : 0.06
          mesh.traverse((part) => {
            if (part.material) {
              part.material.opacity = pulse
              part.material.transparent = true
            }
          })
        }
        if (type === 'twoStrokeSpark') {
          const flash = sparkOn(angle) ? 1 : 0.12
          mesh.scale.setScalar(0.6 + flash * 0.9)
          mesh.material.opacity = flash
          mesh.material.transparent = true
        }
        if (type === 'dieselPiston') mesh.position.y = mesh.userData.baseY + Math.cos(angle + mesh.userData.phase) * 0.18
        if (type === 'dieselRod') {
          mesh.position.y = mesh.userData.baseY + Math.cos(angle + mesh.userData.phase) * 0.1
          mesh.rotation.z = Math.sin(angle + mesh.userData.phase) * 0.22
        }
        if (type === 'crank') mesh.rotation.z -= 0.06 * stepScale
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
      })

      const selected = selectedLayerRef.current
      if (!engine) root.traverse((object) => {
        if (!object.isMesh) return
        if (object.material.userData.dynamicOpacity) return
        const shouldDim = selected !== 'all' && object.name && object.name !== selected
        const baseOpacity = object.material.userData.baseOpacity ?? 1
        object.material.opacity = shouldDim ? Math.min(baseOpacity, 0.16) : baseOpacity
        object.material.transparent = shouldDim || baseOpacity < 1
      })

      renderer.render(scene, camera)

      if (presenting) {
        vrLabels.forEach(({ sprite, layerId }) => {
          sprite.visible = running.showLabels
          sprite.material.opacity = selected !== 'all' && layerId !== selected ? 0.3 : 1
        })
        return
      }
      labelLayer.style.display = running.showLabels ? 'block' : 'none'
      annotationViews.forEach((annotation) => {
        annotation.anchor.getWorldPosition(worldPosition)
        projected.copy(worldPosition).project(camera)
        const width = renderer.domElement.clientWidth
        const height = renderer.domElement.clientHeight
        const x = (projected.x * 0.5 + 0.5) * width
        const y = (-projected.y * 0.5 + 0.5) * height
        // On a small view the secondary labels would cover the model; those parts stay clickable
        const crowded = annotation.minor && (width < 560 || height < 420)
        const outside = crowded || projected.z < -1 || projected.z > 1 || x < -120 || x > width + 120 || y < -80 || y > height + 80
        const shouldDim = !annotation.compact && selected !== 'all' && annotation.layerId !== selected

        annotation.element.style.transform = `translate3d(${x}px, ${y - annotation.lift}px, 0) translate(-50%, -100%)`
        annotation.element.style.opacity = outside ? '0' : shouldDim ? '0.28' : '1'
        annotation.element.style.visibility = outside ? 'hidden' : 'visible'
      })
    }
    // setAnimationLoop instead of requestAnimationFrame: in a headset frames come from the XR session
    renderer.setAnimationLoop(animate)

    return () => {
      renderer.setAnimationLoop(null)
      renderer.xr.getSession()?.end().catch(() => {})
      renderer.xr.removeEventListener('sessionstart', onSessionStart)
      renderer.xr.removeEventListener('sessionend', onSessionEnd)
      controllers.forEach((controller) => scene.remove(controller))
      vrLabels.forEach(({ sprite }) => sprite.material.map?.dispose())
      rendererRef.current = null
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.domElement.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      scene.traverse((object) => {
        object.geometry?.dispose()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((item) => item?.dispose())
      })
      renderer.dispose()
      labelLayer.remove()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      setSelectedPart(null)
    }
  }, [simulation.modelId, simulation.lessonModel, displayedSimulation.layers.length, engineMode, fuel, isFourStrokeMode, isTwoStrokeMode, isLoading])

  if (isLoading) {
    return <div className="page-container text-center text-slate-600">Đang tải mô phỏng 3D...</div>
  }

  const currentLayer = displayedSimulation.layers[activeStep] || displayedSimulation.layers[0]

  return (
    <div className="bg-slate-50 lg:h-[calc(100dvh-77px)] lg:overflow-hidden">
      <div className="grid lg:h-full lg:grid-cols-[minmax(0,1fr)_380px]">
        <main className="flex h-[calc(100dvh-77px)] min-h-[460px] min-w-0 flex-col border-r border-slate-200 bg-slate-100 lg:h-full lg:min-h-0">
          <header className="border-b border-slate-200 bg-white px-4 py-1">
            <div className="flex items-center gap-x-3">
              <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-bold text-sky-700">
                {displayedSimulation.label}
              </span>
              <h1 className="truncate text-base font-bold text-slate-950">{displayedSimulation.title}</h1>
              <Link to={`/lessons/${lessonId}`} className="ml-auto shrink-0 text-sm font-semibold text-sky-700 hover:underline">
                Về bài học
              </Link>
            </div>
          </header>

          <div className="relative min-h-0 flex-1">
            <div ref={containerRef} className="absolute inset-0" />
            {renderFailed && (
              <p role="alert" className="absolute inset-4 flex items-center justify-center rounded-lg bg-white p-6 text-center text-slate-700">
                Thiết bị hoặc trình duyệt này chưa bật WebGL nên không hiển thị được mô hình 3D. Hãy bật tăng tốc phần cứng hoặc dùng trình duyệt khác; nội dung bài ở cột bên vẫn đọc được.
              </p>
            )}
            <div className="absolute bottom-2 right-3 z-10 flex gap-2">
              <button type="button" className="rounded-md border border-slate-300 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white" onClick={() => setShowLabels((value) => !value)}>
                {showLabels ? 'Ẩn nhãn' : 'Hiện nhãn'}
              </button>
              <button type="button" className="rounded-md border border-slate-300 bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white" onClick={() => viewControls.current.reset()}>
                Góc nhìn chuẩn
              </button>
              {isFourStrokeMode && !renderFailed && (
                <button
                  type="button"
                  aria-pressed={exploded}
                  className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold ${
                    exploded ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-white/95 text-slate-700 hover:bg-white'
                  }`}
                  onClick={toggleExploded}
                  title="Tách nắp máy, xu páp, cò mổ, pít tông, chốt pít tông, thanh truyền, trục khuỷu và trục cam ra để quan sát cấu tạo bên trong"
                >
                  {exploded ? 'Lắp lại' : 'Tháo rời chi tiết'}
                </button>
              )}
              {vrSupported && !renderFailed && (
                <button
                  type="button"
                  className="rounded-md border border-blue-700 bg-blue-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  onClick={enterVr}
                  disabled={inVr}
                  title="Xem mô hình bằng kính thực tế ảo (WebXR). Trong kính: nút cò chuyển lớp kiến thức, nút bóp tạm dừng hoặc chạy tiếp."
                >
                  {inVr ? 'Đang xem bằng VR' : 'Xem bằng VR'}
                </button>
              )}
            </div>
            {vrError && (
              <p role="alert" className="absolute bottom-12 right-3 z-10 max-w-xs rounded-md border border-red-200 bg-white px-3 py-2 text-xs text-red-700">
                {vrError}
              </p>
            )}
            <p className="pointer-events-none absolute bottom-2 left-3 z-10 hidden rounded bg-white/80 px-2 py-0.5 text-xs text-slate-600 sm:block">
              Kéo để xoay, cuộn hoặc chụm tay để phóng to{isFourStrokeMode ? ', bấm vào chi tiết để xem tên và chức năng' : ''}
            </p>
            {selectedPart && ENGINE_PARTS[selectedPart] && (
              <div className="absolute left-3 top-3 z-10 max-w-xs rounded-lg border border-blue-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-slate-950">{ENGINE_PARTS[selectedPart].name}</h2>
                  <button type="button" onClick={closePartCard} aria-label="Đóng" className="text-lg leading-none text-slate-500 hover:text-slate-900">×</button>
                </div>
                <p className="mt-1 text-sm leading-5 text-slate-700">{ENGINE_PARTS[selectedPart].role}</p>
              </div>
            )}
          </div>

          {isFourStrokeMode ? (
            <EngineCycleConsole
              motion={motion}
              geometry={engineGeometry(fuel)}
              isPlaying={isPlaying}
              speed={speed}
              onSpeedChange={setSpeed}
              onTogglePlay={togglePlaying}
              onSeek={seekEngine}
            />
          ) : (
            <section className="flex flex-wrap items-center gap-4 border-t border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0 flex-1 basis-64">
                <p className="font-bold text-slate-950">{currentLayer.name}</p>
                <p className="text-sm text-slate-600">{currentLayer.note}</p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                Tốc độ {speed.toFixed(1)}×
                <input type="range" min="0.5" max="2.2" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
              </label>
              <button type="button" onClick={togglePlaying} className="primary-button">
                {isPlaying ? 'Tạm dừng' : 'Phát'}
              </button>
            </section>
          )}
        </main>

        <aside className="bg-white p-5 lg:h-full lg:overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-950">{lesson?.title}</h2>
          {isFourStrokeMode && (
            <section className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-950">
              <p className="font-bold">{currentLayer.name}</p>
              <p className="mt-1 text-sm leading-6">{currentLayer.note}</p>
            </section>
          )}
          <p className="mt-3 text-sm leading-6 text-slate-600">{displayedSimulation.objective}</p>
          {isFourStrokeMode && (
            <p className="mt-2 text-xs leading-5 text-slate-500">{FOUR_STROKE_SIMPLIFICATION_NOTE}</p>
          )}
          {isFourStrokeMode && (
            <section className="mt-4" aria-label="Chu trình làm việc">
              <h3 className="font-bold text-slate-950">Chu trình làm việc</h3>
              <table className="mt-2 w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-500">
                    <th className="py-1 pr-2 font-semibold">Kì</th>
                    <th className="py-1 pr-2 font-semibold">Pít tông</th>
                    <th className="py-1 pr-2 font-semibold">Xu páp nạp</th>
                    <th className="py-1 font-semibold">Xu páp thải</th>
                  </tr>
                </thead>
                <tbody>
                  {FOUR_STROKE_TABLE.map((row, index) => (
                    <tr
                      key={row.id}
                      onClick={() => selectKnowledgeLayer(row.id)}
                      aria-current={activeStep === index ? 'step' : undefined}
                      className={`cursor-pointer border-b border-slate-100 ${activeStep === index ? 'bg-blue-50 font-bold text-blue-950' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <td className="py-1.5 pr-2">{index + 1}. {row.name}</td>
                      <td className="py-1.5 pr-2">{row.pistonDirection === 'down' ? 'ĐCT → ĐCD' : 'ĐCD → ĐCT'}</td>
                      <td className={`py-1.5 pr-2 ${row.intakeOpen ? 'text-sky-700' : 'text-slate-500'}`}>{row.intakeOpen ? 'Mở' : 'Đóng'}</td>
                      <td className={`py-1.5 ${row.exhaustOpen ? 'text-orange-700' : 'text-slate-500'}`}>{row.exhaustOpen ? 'Mở' : 'Đóng'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

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
                    }}
                    className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                      (isFourStrokeOnly ? mode.id === 'diesel4' : engineMode === mode.id)
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    disabled={isFourStrokeOnly && mode.id === 'twoStroke'}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          {isFourStrokeMode && (
            <section className="mt-3 rounded-lg border border-slate-200 bg-white p-2" aria-label="Loại nhiên liệu">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'diesel', label: 'Diesel: vòi phun' },
                  { id: 'gasoline', label: 'Xăng: bu gi' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={fuel === option.id}
                    onClick={() => setFuel(option.id)}
                    className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                      fuel === option.id ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6">
            <h3 className="mb-3 font-bold text-slate-950">{isFourStrokeMode ? 'Xem từng kì' : 'Lớp kiến thức'}</h3>
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
