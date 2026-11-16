// Kĩ thuật viên sửa chữa ô tô (Công nghệ 11, Bài 16): change the engine oil with the car safely raised.
import * as THREE from 'three'
import { alongZ, box, cylinder, group, label, seeThrough, tag } from '../devices/kit'

const LIFT = 0.35

export default {
  job: 'auto-technician',
  title: 'Thay dầu động cơ',
  intro: 'Em là kĩ thuật viên ở xưởng dịch vụ ô tô. Hãy nâng xe an toàn, xả dầu cũ và xử lí dầu thải đúng quy định.',
  parts: {
    chock: { name: 'Chèn bánh xe', role: 'Giữ xe không trôi khi kích nâng.' },
    jack: { name: 'Kích thủy lực', role: 'Nâng xe lên. Kích có thể tụt, không dùng để đỡ xe khi làm việc dưới gầm.' },
    stands: { name: 'Mễ kê', role: 'Đỡ xe chắc chắn khi người làm việc dưới gầm.' },
    brick: { name: 'Gạch', role: 'Vật liệu xây dựng, không phải dụng cụ kê xe.' },
    drainPan: { name: 'Khay hứng dầu', role: 'Hứng dầu cũ chảy ra từ ốc xả.' },
    drainPlug: { name: 'Ốc xả dầu', role: 'Ốc ở đáy các te; tháo ra để dầu cũ chảy hết.' },
    wasteDrum: { name: 'Thùng chứa dầu thải', role: 'Chứa dầu thải để giao đơn vị xử lí chất thải nguy hại.' },
    sewer: { name: 'Nắp cống thoát nước', role: 'Dẫn nước mưa, nước thải sinh hoạt.' },
    car: { name: 'Ô tô', role: 'Xe cần thay dầu động cơ.' },
  },
  steps: [
    { part: 'chock', instruction: 'Chèn bánh xe phía sau cho xe không trôi.', done: 'Bánh sau đã được chèn.' },
    { part: 'jack', instruction: 'Nâng đầu xe bằng kích tại điểm kê của hãng.', done: 'Đầu xe đã được nâng.',
      early: 'Chèn bánh xe trước khi kích, kẻo xe trôi.' },
    { part: 'stands', instruction: 'Đặt mễ kê dưới khung xe rồi hạ xe xuống mễ kê.', done: 'Xe đã nằm chắc trên mễ kê.',
      early: 'Phải nâng xe bằng kích trước rồi mới đặt mễ kê.' },
    { part: 'drainPan', instruction: 'Đặt khay hứng dưới ốc xả dầu.', done: 'Khay hứng đã ở dưới ốc xả.',
      early: 'Nguy hiểm: xe chưa được đỡ bằng mễ kê, không được chui xuống gầm.' },
    { part: 'drainPlug', instruction: 'Tháo ốc xả, để dầu cũ chảy hết vào khay.', done: 'Dầu cũ đã chảy hết vào khay; lắp lại ốc xả.',
      early: (index) => (index < 3 ? 'Nguy hiểm: xe chưa được đỡ bằng mễ kê, không được chui xuống gầm.' : 'Đặt khay hứng trước, kẻo dầu đổ ra sàn.') },
    { part: 'wasteDrum', instruction: 'Đổ dầu cũ vào nơi chứa đúng quy định.', done: 'Dầu thải đã vào thùng chứa riêng để giao đơn vị xử lí.',
      early: 'Chưa có dầu thải để đổ.' },
  ],
  hazards: {
    brick: 'Gạch có thể vỡ dưới sức nặng của xe; chỉ dùng mễ kê.',
    sewer: 'Đổ dầu thải xuống cống gây ô nhiễm nguồn nước và vi phạm quy định bảo vệ môi trường.',
  },
  build() {
    const root = new THREE.Group()
    // Car: body, cabin, wheels; the front rises on the jack
    const body = new THREE.Group()
    body.add(
      box(3.4, 0.5, 1.6, 0x2563eb, 0, 0.75, 0),
      box(1.8, 0.5, 1.45, seeThrough(0x93c5fd, 0.55), -0.35, 1.25, 0),
      box(0.04, 0.12, 0.3, 0xfef08a, 1.71, 0.8, 0.5),
      box(0.04, 0.12, 0.3, 0xfef08a, 1.71, 0.8, -0.5),
      box(0.04, 0.12, 1.2, 0x1e293b, 1.71, 0.6, 0),
    )
    const sump = box(0.6, 0.18, 0.5, 0x1f2937, 1.0, 0.4, 0)
    const plug = tag(cylinder(0.05, 0.08, 0xa1a1aa, 1.15, 0.28, 0), 'drainPlug')
    body.add(sump, plug)
    tag(body, 'car')
    tag(plug, 'drainPlug')
    root.add(body)
    const wheels = [[1.15, 0.85], [1.15, -0.85], [-1.15, 0.85], [-1.15, -0.85]].map(([x, z]) => {
      const wheel = alongZ(cylinder(0.36, 0.26, 0x111827, x, 0.36, z))
      tag(wheel, 'car')
      root.add(wheel)
      return wheel
    })

    const chockOnFloor = tag(box(0.25, 0.18, 0.3, 0xfacc15, -0.6, 0.09, 1.7), 'chock')
    const chockAtWheel = tag(box(0.25, 0.18, 0.3, 0xfacc15, -1.6, 0.09, 0.85), 'chock')
    const jack = tag(group(box(0.5, 0.15, 0.3, 0xdc2626, 1.9, 0.08, 0.2), box(0.08, 0.1, 0.9, 0x991b1b, 1.9, 0.12, 0.85)), 'jack')
    const standsBeside = tag(group(box(0.2, 0.45, 0.2, 0xf97316, 0.1, 0.22, 1.9), box(0.2, 0.45, 0.2, 0xf97316, 0.45, 0.22, 1.9)), 'stands')
    const standsUnder = tag(group(box(0.2, 0.45, 0.2, 0xf97316, 1.4, 0.22, 0.55), box(0.2, 0.45, 0.2, 0xf97316, 1.4, 0.22, -0.55)), 'stands')
    const brick = tag(box(0.4, 0.14, 0.2, 0xb45309, 0.9, 0.07, 1.8), 'brick')
    const panAside = tag(cylinder(0.3, 0.1, 0x334155, 2.6, 0.05, 1.2), 'drainPan')
    const panUnder = tag(cylinder(0.3, 0.1, 0x334155, 1.15, 0.05, 0), 'drainPan')
    const oilStream = cylinder(0.025, 1, 0x78350f, 1.15, 0.6, 0)
    oilStream.userData.decor = true
    const oilInPan = cylinder(0.26, 0.02, 0x451a03, 1.15, 0.1, 0)
    oilInPan.userData.decor = true
    const wasteDrum = tag(group(cylinder(0.32, 0.8, 0x15803d, -2.9, 0.4, 0.9), box(0.4, 0.2, 0.01, 0xfacc15, -2.9, 0.5, 1.23)), 'wasteDrum')
    const sewer = tag(box(0.6, 0.02, 0.6, 0x52525b, -1.7, 0.01, 2.1), 'sewer')
    root.add(chockOnFloor, chockAtWheel, jack, standsBeside, standsUnder, brick, panAside, panUnder, oilStream, oilInPan, wasteDrum, sewer)

    const annotations = [
      label(root, 'Chèn bánh', -0.6, 0.55, 1.7),
      label(root, 'Kích', 2.1, 0.5, 0.6),
      label(root, 'Mễ kê', 0.3, 0.75, 1.9),
      label(root, 'Gạch', 0.9, 0.4, 1.85),
      label(root, 'Khay hứng', 2.6, 0.4, 1.2),
      label(root, 'Ốc xả dầu', 1.35, 0.05, 0.3),
      label(root, 'Thùng dầu thải', -2.9, 1.1, 0.9),
      label(root, 'Cống', -1.7, 0.3, 2.1),
    ]

    let lastTime = 0
    let drained = 0
    return {
      root,
      annotations,
      floorY: 0,
      framing: { center: new THREE.Vector3(0, 0.7, 0.3), width: 7.2, height: 3.4, direction: new THREE.Vector3(0.35, 0.45, 1).normalize() },
      update(time, { index }) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        chockOnFloor.visible = index < 1
        chockAtWheel.visible = index >= 1
        const raised = index >= 2 ? LIFT : 0
        body.position.y = raised
        body.rotation.z = raised ? 0.06 : 0
        wheels.slice(0, 2).forEach((wheel) => { wheel.position.y = 0.36 + raised * 0.9 })
        standsBeside.visible = index < 3
        standsUnder.visible = index >= 3
        panAside.visible = index < 4
        panUnder.visible = index >= 4
        if (index >= 5) drained = Math.min(1, drained + dt * 0.4)
        oilStream.visible = index >= 5 && drained < 1
        oilInPan.visible = index >= 5 && index < 6
        oilInPan.scale.y = 1 + drained * 3
        return {}
      },
    }
  },
}
