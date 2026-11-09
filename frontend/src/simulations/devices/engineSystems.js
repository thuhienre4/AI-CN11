// Lubrication and cooling systems of a water-cooled engine, Công nghệ 11 (Kết nối tri thức), Bài 20.
import * as THREE from 'three'
import { alongX, alongZ, box, cylinder, flow, group, label, pipe, seeThrough, tag } from './kit'
import { THERMOSTAT, thermostatOpening } from './principles'

const FAN_ON_C = 98

export default {
  keys: ['11-20'],
  title: 'Hệ thống bôi trơn và hệ thống làm mát',
  subtitle: 'Hai trong các hệ thống của động cơ đốt trong: dầu bôi trơn tuần hoàn cưỡng bức và nước làm mát qua van hằng nhiệt, két nước.',
  task: 'Lần theo đường dầu từ các te tới trục khuỷu, trục cam. Tăng nhiệt độ nước từ 60 °C lên 100 °C và ghi lại lúc van hằng nhiệt bắt đầu mở, lúc quạt gió quay.',
  objective: 'Nhận biết các bộ phận và mô tả đường đi của dầu bôi trơn và nước làm mát; giải thích vai trò của van hằng nhiệt khi động cơ còn nguội và khi đã nóng.',
  hint: 'Kéo nhiệt độ động cơ để thấy van hằng nhiệt mở; bấm vào quạt hoặc van để xem chức năng. Các hệ thống nhiên liệu, đánh lửa, khởi động được trình bày ở các lớp kiến thức của bài.',
  parts: {
    block: { name: 'Thân máy và nắp máy', role: 'Chứa các xi lanh; bên trong có đường dầu và áo nước.' },
    sump: { name: 'Các te dầu', role: 'Chứa dầu bôi trơn; dầu từ các chi tiết chảy về đây.' },
    oilPump: { name: 'Bơm dầu', role: 'Hút dầu từ các te, đẩy dầu đi bôi trơn với áp suất nhất định.' },
    filter: { name: 'Bầu lọc dầu', role: 'Lọc sạch cặn bẩn, mạt kim loại trước khi dầu tới các chi tiết.' },
    gallery: { name: 'Đường dầu chính', role: 'Dẫn dầu tới các ổ trục khuỷu, trục cam và các chi tiết cần bôi trơn.' },
    crankshaft: { name: 'Trục khuỷu (ổ trục)', role: 'Được bôi trơn để giảm ma sát, mài mòn và làm mát ổ trục.' },
    camshaft: { name: 'Trục cam', role: 'Được dầu bôi trơn qua đường dầu trên nắp máy.' },
    jacket: { name: 'Áo nước', role: 'Khoang nước bao quanh xi lanh, nhận nhiệt từ thành xi lanh.' },
    waterPump: { name: 'Bơm nước', role: 'Tạo dòng nước tuần hoàn trong hệ thống làm mát.' },
    thermostat: { name: 'Van hằng nhiệt', role: `Đóng khi nước còn nguội để động cơ nhanh nóng; bắt đầu mở ở khoảng ${THERMOSTAT.opensC} °C, mở hết ở khoảng ${THERMOSTAT.fullyOpenC} °C để nước qua két làm mát.` },
    radiator: { name: 'Két nước', role: 'Gồm nhiều ống nhỏ và lá tản nhiệt; không khí đi qua làm nguội nước.' },
    fan: { name: 'Quạt gió', role: 'Hút không khí qua két nước để tăng tản nhiệt khi nhiệt độ nước cao.' },
    hoses: { name: 'Đường ống nước', role: 'Nối áo nước, van hằng nhiệt, két nước và bơm nước thành vòng tuần hoàn.' },
  },
  layers: [
    { id: 'lubrication', name: 'Hệ thống bôi trơn', note: 'Các te → bơm dầu → bầu lọc → đường dầu chính → ổ trục khuỷu, trục cam → dầu chảy về các te.', parts: ['sump', 'oilPump', 'filter', 'gallery', 'crankshaft', 'camshaft'] },
    { id: 'cooling', name: 'Hệ thống làm mát', note: 'Bơm nước → áo nước → van hằng nhiệt → két nước (khi nóng) hoặc về thẳng bơm (khi nguội).', parts: ['jacket', 'waterPump', 'thermostat', 'radiator', 'fan', 'hoses'] },
    { id: 'thermostat', name: 'Van hằng nhiệt', note: 'Điều chỉnh lượng nước qua két theo nhiệt độ, giữ động cơ ở nhiệt độ làm việc phù hợp.', parts: ['thermostat'] },
    { id: 'others', name: 'Nhiên liệu, đánh lửa, khởi động', note: 'Hệ thống nhiên liệu cung cấp hỗn hợp cháy hoặc nhiên liệu; hệ thống đánh lửa tạo tia lửa ở bu gi (động cơ xăng); hệ thống khởi động quay trục khuỷu khi khởi động. Xem thêm mô hình động cơ ở Bài 17–19.', parts: ['block'] },
  ],
  controls: [
    { id: 'temperature', label: 'Nhiệt độ nước làm mát', type: 'slider', min: 20, max: 110, step: 1, default: 60, format: (value) => `${value} °C` },
    { id: 'rpm', label: 'Tốc độ động cơ', type: 'slider', min: 800, max: 5000, step: 100, default: 2000, format: (value) => `${value} vòng/phút` },
  ],
  checkpoints: [
    'Hệ thống bôi trơn đưa dầu tới các bề mặt ma sát để giảm ma sát, mài mòn, làm mát và làm sạch.',
    'Hệ thống làm mát bằng nước gồm áo nước, bơm nước, van hằng nhiệt, két nước và quạt gió.',
    'Van hằng nhiệt đóng khi động cơ nguội, mở khi động cơ nóng để nước đi qua két làm mát.',
  ],
  readouts(state, controls) {
    const opening = thermostatOpening(controls.temperature)
    return [
      { label: 'Van hằng nhiệt', value: opening === 0 ? 'Đóng' : opening === 1 ? 'Mở hết' : `Mở ${Math.round(opening * 100)}%` },
      { label: 'Nước qua két', value: `${Math.round(opening * 100)}%` },
      { label: 'Quạt gió', value: controls.temperature >= FAN_ON_C ? 'Đang quay' : 'Đứng' },
      { label: 'Áp suất dầu (ước tính)', value: `${(1 + controls.rpm / 1500).toFixed(1).replace('.', ',')} bar` },
    ]
  },
  build() {
    const root = new THREE.Group()
    root.add(tag(box(2.6, 2.2, 1.4, seeThrough(0x64748b, 0.18), -1, 0.9, 0), 'block'))
    root.add(tag(box(2.7, 0.55, 1.5, seeThrough(0xca8a04, 0.35), -1, -0.55, 0), 'sump'))
    const oilLevel = box(2.6, 0.25, 1.4, new THREE.MeshBasicMaterial({ color: 0xb45309, transparent: true, opacity: 0.5 }), -1, -0.68, 0)
    oilLevel.userData.decor = true
    root.add(oilLevel)
    root.add(tag(box(0.35, 0.35, 0.35, 0x0f766e, -2.05, -0.15, 0.3), 'oilPump'))
    root.add(tag(cylinder(0.17, 0.45, 0x2563eb, -2.55, 0.5, 0.3), 'filter'))
    const crank = tag(alongX(cylinder(0.08, 2.3, 0x475569, -1, 0.05, 0)), 'crankshaft')
    const cam = tag(alongX(cylinder(0.06, 2.3, 0x475569, -1, 1.75, 0.2)), 'camshaft')
    root.add(crank, cam)
    ;[-1.7, -1, -0.3].forEach((x) => root.add(tag(alongZ(cylinder(0.32, 0.65, seeThrough(0x0ea5e9, 0.35), x, 1.0, 0)), 'jacket')))

    const oilPath = tag(pipe([[-1.6, -0.6, 0.3], [-2.05, -0.15, 0.3], [-2.55, 0.25, 0.3], [-2.55, 0.75, 0.3], [-2.3, 1.15, 0.35], [-1, 1.15, 0.35], [0.1, 1.15, 0.35]], 0.04, 0xb45309), 'gallery')
    const toCrank = tag(pipe([[-1, 1.15, 0.35], [-1, 0.55, 0.3], [-1, 0.1, 0.1]], 0.03, 0xb45309), 'gallery')
    const toCam = tag(pipe([[-0.3, 1.15, 0.35], [-0.3, 1.5, 0.3], [-0.3, 1.72, 0.2]], 0.03, 0xb45309), 'gallery')
    root.add(oilPath, toCrank, toCam)
    const oilFlows = [oilPath, toCrank, toCam].map((item) => flow(item.userData.curve, 0xf59e0b, 10, 0.05))
    oilFlows.forEach((item) => root.add(...item.beads))

    // Cooling: pump -> jacket -> thermostat -> radiator -> pump, with a bypass back to the pump when cold
    root.add(tag(alongZ(cylinder(0.25, 0.3, 0x1d4ed8, 0.55, 0.3, 0.4)), 'waterPump'))
    const valve = tag(group(alongX(cylinder(0.16, 0.3, 0x92400e)), alongX(cylinder(0.12, 0.05, 0xfbbf24, 0.12, 0, 0))), 'thermostat')
    valve.position.set(0.55, 1.95, 0.4)
    root.add(valve)
    const radiator = tag(group(box(0.35, 2.2, 1.6, seeThrough(0x2563eb, 0.4))), 'radiator')
    for (let index = 0; index < 12; index += 1) radiator.add(tag(box(0.37, 0.03, 1.6, 0x93c5fd, 0, -1 + index * 0.18, 0), 'radiator'))
    radiator.position.set(2.6, 0.95, 0)
    root.add(radiator)
    const fan = tag(group(alongX(cylinder(0.12, 0.12, 0x111827))), 'fan')
    for (let index = 0; index < 5; index += 1) {
      const blade = tag(box(0.04, 0.6, 0.18, 0x111827, 0, 0.32, 0), 'fan')
      const holder = group(blade)
      holder.rotation.x = (index / 5) * Math.PI * 2
      fan.add(holder)
    }
    fan.position.set(2.15, 0.95, 0)
    root.add(fan)

    const waterHot = tag(pipe([[0.55, 0.3, 0.4], [0.2, 0.5, 0.45], [0.05, 1.0, 0.45], [0.3, 1.8, 0.4], [0.55, 1.95, 0.4]], 0.06, 0x2563eb), 'hoses')
    const toRadiator = tag(pipe([[0.7, 1.95, 0.4], [1.6, 2.0, 0.3], [2.45, 1.9, 0.2]], 0.07, 0x1e3a8a), 'hoses')
    const fromRadiator = tag(pipe([[2.45, 0.05, 0.2], [1.5, 0.05, 0.4], [0.8, 0.2, 0.4], [0.6, 0.3, 0.4]], 0.07, 0x1e3a8a), 'hoses')
    const bypass = tag(pipe([[0.55, 1.8, 0.55], [0.75, 1.1, 0.6], [0.6, 0.45, 0.55]], 0.045, 0x3b82f6), 'hoses')
    root.add(waterHot, toRadiator, fromRadiator, bypass)
    const coolant = {
      jacket: flow(waterHot.userData.curve, 0x38bdf8, 10, 0.06),
      radiator: [flow(toRadiator.userData.curve, 0xf87171, 8, 0.06), flow(fromRadiator.userData.curve, 0x60a5fa, 8, 0.06)],
      bypass: flow(bypass.userData.curve, 0x38bdf8, 7, 0.05),
    }
    ;[coolant.jacket, ...coolant.radiator, coolant.bypass].forEach((item) => root.add(...item.beads))

    const annotations = [
      label(root, 'Các te dầu', -1, -0.95, 0.8),
      label(root, 'Bơm dầu', -2.1, -0.4, 0.6, true),
      label(root, 'Bầu lọc dầu', -2.6, 0.95, 0.4),
      label(root, 'Đường dầu chính', -1.4, 1.35, 0.5, true),
      label(root, 'Trục khuỷu', -0.1, 0.05, 0.3, true),
      label(root, 'Áo nước', -1.7, 1.45, 0.4),
      label(root, 'Bơm nước', 0.6, 0.0, 0.7),
      label(root, 'Van hằng nhiệt', 0.55, 2.3, 0.4),
      label(root, 'Két nước', 2.6, 2.2, 0),
      label(root, 'Quạt gió', 2.1, 0.25, 0.3, true),
    ]

    let fanAngle = 0
    let lastTime = 0
    return {
      root,
      annotations,
      floorY: -1.0,
      framing: { center: new THREE.Vector3(0, 0.75, 0), width: 6.6, height: 4.0, direction: new THREE.Vector3(0.25, 0.3, 1).normalize() },
      update(time, controls) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        const opening = thermostatOpening(controls.temperature)
        const pace = controls.rpm / 4000
        crank.rotation.x += (controls.rpm / 60) * dt * 0.3
        cam.rotation.x += (controls.rpm / 120) * dt * 0.3
        oilFlows.forEach((item) => item.update(time, pace, true))
        coolant.jacket.update(time, pace * 0.8, true)
        coolant.radiator.forEach((item) => item.update(time, pace * 0.8 * opening, opening > 0))
        coolant.bypass.update(time, pace * 0.8 * (1 - opening), opening < 1)
        valve.children[1].position.x = 0.12 + opening * 0.15
        if (controls.temperature >= FAN_ON_C) fanAngle += dt * 12
        fan.rotation.x = fanAngle
        return { opening }
      },
    }
  },
}
