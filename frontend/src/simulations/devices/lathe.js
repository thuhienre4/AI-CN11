// Centre lathe turning a shaft, Công nghệ 11 (Kết nối tri thức), Bài 8 (gia công cắt gọt: tiện).
import * as THREE from 'three'
import { alongX, box, cylinder, group, label, tag } from './kit'
import { cuttingSpeed } from './principles'

const STOCK_MM = 50
const CUT_DEPTH_MM = 3
const MM = 0.012 // model units per millimetre of diameter
const START_X = 1.6
const END_X = -0.6
const SLOW = 0.03

export default {
  keys: ['11-8'],
  title: 'Máy tiện và phương pháp tiện',
  subtitle: 'Một phương pháp gia công cắt gọt của bài: phôi quay tròn, dao tiện chuyển động tịnh tiến để cắt bỏ lớp phoi.',
  task: 'Chỉ ra chuyển động cắt và chuyển động tiến dao trên mô hình. Tính tốc độ cắt ở 250, 500 và 1000 vòng/phút với phôi 50 mm rồi đối chiếu với số liệu hiển thị.',
  objective: 'Nhận biết các bộ phận chính của máy tiện, hai chuyển động khi tiện (chuyển động cắt và chuyển động tiến dao) và cách tính tốc độ cắt.',
  hint: 'Bấm vào bàn xe dao để bật hoặc dừng chạy dao. Các phương pháp đúc, rèn, hàn, phay, khoan có trong nội dung bài học.',
  parts: {
    bed: { name: 'Thân máy (băng máy)', role: 'Đỡ các bộ phận của máy; sống trượt dẫn hướng cho bàn xe dao và ụ động.' },
    headstock: { name: 'Ụ đứng (ụ trước)', role: 'Chứa hộp tốc độ, làm trục chính quay với tốc độ chọn trước.' },
    chuck: { name: 'Mâm cặp', role: 'Kẹp chặt phôi và quay cùng trục chính, tạo chuyển động cắt.' },
    workpiece: { name: 'Phôi', role: 'Vật liệu được gia công; phần đã tiện có đường kính nhỏ hơn.' },
    tool: { name: 'Dao tiện', role: 'Cắt bỏ một lớp vật liệu (phoi) khỏi phôi.' },
    carriage: { name: 'Bàn xe dao', role: 'Mang dao chuyển động tịnh tiến dọc phôi (chuyển động tiến dao).' },
    tailstock: { name: 'Ụ động (ụ sau)', role: 'Đỡ đầu kia của phôi dài bằng mũi tâm.' },
    leadscrew: { name: 'Trục vít me, trục trơn', role: 'Truyền chuyển động từ hộp tốc độ tới bàn xe dao.' },
  },
  layers: [
    { id: 'structure', name: 'Cấu tạo máy tiện', note: 'Thân máy, ụ đứng, mâm cặp, bàn xe dao, ụ động, trục vít me.', parts: ['bed', 'headstock', 'chuck', 'carriage', 'tailstock', 'leadscrew'] },
    { id: 'cutting', name: 'Chuyển động cắt', note: 'Phôi quay tròn cùng trục chính; tốc độ cắt v = πDn/1000 (m/phút).', parts: ['chuck', 'workpiece'] },
    { id: 'feed', name: 'Chuyển động tiến dao', note: 'Dao tiện chuyển động tịnh tiến dọc trục phôi, mỗi vòng quay tiến thêm một lượng chạy dao.', parts: ['tool', 'carriage', 'leadscrew'] },
  ],
  controls: [
    { id: 'rpm', label: 'Tốc độ trục chính', type: 'choice', default: 500, options: [[250, '250 v/ph'], [500, '500 v/ph'], [1000, '1000 v/ph']] },
    { id: 'feeding', label: 'Chạy dao', type: 'toggle', default: true, on: 'Đang chạy', off: 'Dừng' },
  ],
  interactions: { carriage: (controls) => ({ ...controls, feeding: !controls.feeding }) },
  checkpoints: [
    'Tiện là phương pháp gia công cắt gọt: phôi quay tròn (chuyển động cắt), dao tịnh tiến (chuyển động tiến dao).',
    'Máy tiện gồm thân máy, ụ đứng (hộp tốc độ, trục chính, mâm cặp), bàn xe dao, ụ động.',
    'Tốc độ cắt v = πDn/1000 phụ thuộc đường kính phôi D (mm) và số vòng quay n (vòng/phút).',
  ],
  readouts(state, controls) {
    const diameter = state.progress > 0 ? STOCK_MM - 2 * CUT_DEPTH_MM : STOCK_MM
    return [
      { label: 'Đường kính phôi D', value: `${STOCK_MM} mm` },
      { label: 'Đường kính sau tiện', value: `${STOCK_MM - 2 * CUT_DEPTH_MM} mm` },
      { label: 'Tốc độ cắt v = πDn/1000', value: `${cuttingSpeed(STOCK_MM, controls.rpm).toFixed(1).replace('.', ',')} m/phút` },
      { label: 'Đã tiện', value: `${Math.round((state.progress || 0) * 100)}% chiều dài` },
      { label: 'Đường kính tại dao', value: `${diameter} mm` },
    ]
  },
  build() {
    const root = new THREE.Group()
    root.add(tag(group(box(5.2, 0.35, 1.1, 0x334155, 0, -0.75, 0), box(5.2, 0.12, 0.18, 0x94a3b8, 0, -0.52, -0.35), box(5.2, 0.12, 0.18, 0x94a3b8, 0, -0.52, 0.35)), 'bed'))
    root.add(tag(box(1.2, 1.5, 1.2, 0x0f766e, -2.4, 0.2, 0), 'headstock'))
    const spindle = group()
    spindle.position.set(-1.65, 0.35, 0)
    const chuck = tag(group(alongX(cylinder(0.45, 0.3, 0x475569))), 'chuck')
    ;[0, 1, 2].forEach((index) => {
      const jaw = tag(box(0.14, 0.2, 0.14, 0x111827, 0.2, 0.3, 0), 'chuck')
      const holder = group(jaw)
      holder.rotation.x = (index / 3) * Math.PI * 2
      chuck.add(holder)
    })
    spindle.add(chuck)
    // The workpiece: the turned part grows from the tailstock end as the tool moves toward the chuck
    const raw = STOCK_MM * MM / 2
    const turned = (STOCK_MM - 2 * CUT_DEPTH_MM) * MM / 2
    const uncut = tag(alongX(cylinder(raw, 1, 0xa8a29e)), 'workpiece')
    const cut = tag(alongX(cylinder(turned, 1, 0xe7e5e4)), 'workpiece')
    spindle.add(uncut, cut)
    root.add(spindle)

    root.add(tag(group(box(0.8, 0.9, 0.9, 0x0f766e, 2.35, -0.05, 0), alongX(cylinder(0.08, 0.5, 0x94a3b8, 1.85, 0.35, 0))), 'tailstock'))
    const carriage = tag(group(box(0.9, 0.25, 1.1, 0x475569, 0, -0.33, 0), box(0.6, 0.18, 0.6, 0x64748b, 0, -0.12, 0.25), box(0.35, 0.25, 0.35, 0x111827, 0, 0.08, 0.45)), 'carriage')
    // The tool tip touches the turned diameter
    const tool = tag(group(box(0.1, 0.1, 0.55, 0xfacc15, 0, 0.35, turned + 0.28)), 'tool')
    carriage.add(tool)
    root.add(carriage)
    root.add(tag(alongX(cylinder(0.04, 5, 0x9ca3af, 0, -0.6, 0.62)), 'leadscrew'))

    const chips = Array.from({ length: 10 }, () => {
      const chip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.08), new THREE.MeshBasicMaterial({ color: 0xd6d3d1 }))
      chip.userData.decor = true
      root.add(chip)
      return chip
    })

    const annotations = [
      label(root, 'Ụ đứng', -2.4, 1.1, 0),
      label(root, 'Mâm cặp', -1.65, 0.95, 0),
      label(root, 'Phôi', 0.5, 0.75, 0),
      label(carriage, 'Dao tiện', 0, 0.55, 0.55, true),
      label(carriage, 'Bàn xe dao', 0, -0.55, 0.6),
      label(root, 'Ụ động', 2.35, 0.55, 0),
      label(root, 'Băng máy', 1.5, -0.5, 0.5, true),
    ]

    let progress = 0
    let angle = 0
    let lastTime = 0
    const placeCylinder = (item, from, to) => {
      const length = Math.max(0.001, to - from)
      item.scale.y = length // the cylinder lies along X after alongX, so its height is the X length
      item.position.set((from + to) / 2 - spindle.position.x, 0, 0)
    }
    return {
      root,
      annotations,
      floorY: -0.95,
      framing: { center: new THREE.Vector3(-0.1, 0.1, 0), width: 7.2, height: 3.6, direction: new THREE.Vector3(0.2, 0.45, 1).normalize() },
      update(time, controls) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        angle += (controls.rpm / 60) * Math.PI * 2 * dt * SLOW
        spindle.rotation.x = angle
        if (controls.feeding) progress = (progress + dt * 0.06 * (controls.rpm / 500)) % 1.0001
        const toolX = START_X + (END_X - START_X) * progress
        carriage.position.set(toolX, 0, 0)
        placeCylinder(cut, toolX, START_X + 0.25)
        placeCylinder(uncut, -1.5, toolX)
        chips.forEach((chip, index) => {
          chip.visible = controls.feeding
          const t = ((time * 2 + index / chips.length) % 1)
          chip.position.set(toolX + 0.05 + t * 0.2, 0.35 + raw + t * 0.45, 0.2 + Math.sin(index) * 0.15 + t * 0.2)
          chip.rotation.set(t * 9, index, t * 5)
        })
        return { progress }
      },
    }
  },
}
