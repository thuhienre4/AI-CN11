// Kĩ thuật viên bảo trì (Công nghệ 10, Bài 7): replace a worn bearing of a conveyor with the power locked out.
import * as THREE from 'three'
import { alongX, alongZ, ball, box, cylinder, group, label, ring, tag } from '../devices/kit'

const RUNNING_BEFORE = 1 // the conveyor runs until the stop button is pressed
const RUNNING_AGAIN = 8 // and again after the test run

export default {
  job: 'maintenance-tech',
  title: 'Thay ổ bi băng tải',
  intro: 'Đầu ca, băng tải kêu to bất thường. Em là kĩ thuật viên bảo trì: dừng máy an toàn, thay ổ bi bị mòn rồi cho máy chạy lại.',
  parts: {
    stopButton: { name: 'Nút dừng', role: 'Dừng băng tải.' },
    startButton: { name: 'Nút chạy', role: 'Khởi động băng tải.' },
    breaker: { name: 'Aptomat cấp điện cho băng tải', role: 'Đóng, cắt nguồn điện của động cơ băng tải.' },
    lockKit: { name: 'Bộ khóa an toàn và thẻ', role: 'Khóa aptomat ở vị trí cắt và treo thẻ "Đang sửa chữa" để không ai đóng điện.' },
    bearing: { name: 'Gối đỡ ổ bi', role: 'Đỡ trục con lăn; ổ bi mòn làm máy kêu to và rung.' },
    grease: { name: 'Hộp mỡ bôi trơn', role: 'Bôi trơn ổ bi định kì.' },
    logbook: { name: 'Sổ bảo trì', role: 'Ghi việc đã làm để theo dõi tuổi thọ chi tiết và lập kế hoạch bảo trì.' },
    motor: { name: 'Động cơ điện', role: 'Kéo con lăn làm băng tải chuyển động.' },
  },
  steps: [
    { part: 'stopButton', instruction: 'Bấm nút dừng để dừng băng tải.', done: 'Băng tải đã dừng.' },
    { part: 'breaker', instruction: 'Ngắt aptomat cấp điện cho băng tải ở tủ điện.', done: 'Đã cắt nguồn của động cơ.',
      early: 'Máy đang chạy: dừng máy bằng nút dừng trước khi cắt điện.' },
    { part: 'lockKit', instruction: 'Khóa aptomat ở vị trí cắt và treo thẻ "Đang sửa chữa".', done: 'Đã khóa: không ai đóng điện được khi em đang làm.',
      early: 'Phải ngắt aptomat trước rồi mới khóa ở vị trí cắt.' },
    { part: 'startButton', instruction: 'Bấm thử nút chạy để chắc chắn máy không thể khởi động.', done: 'Máy không chạy: nguồn đã được cô lập.',
      early: (index) => (index < 3 ? 'Nguy hiểm: nguồn chưa bị khóa, bấm chạy lúc này máy sẽ chạy lại.' : null) },
    { part: 'bearing', instruction: 'Tháo nắp gối đỡ, thay ổ bi mòn bằng ổ bi mới đúng mã.', done: 'Đã thay ổ bi mới.',
      early: 'Nguy hiểm: nguồn chưa được cô lập và kiểm tra, máy có thể chạy bất ngờ và cuốn tay.' },
    { part: 'logbook', instruction: 'Ghi việc đã làm vào sổ bảo trì.', done: 'Đã ghi: ngày thay, mã ổ bi, người thực hiện.' },
    { part: 'lockKit', instruction: 'Tháo khóa, thẻ và đóng lại aptomat.', done: 'Đã đóng điện trở lại.',
      early: 'Việc sửa chữa chưa xong: chỉ tháo khóa khi đã thay ổ bi và ghi sổ.' },
    { part: 'startButton', instruction: 'Chạy thử băng tải.', done: 'Băng tải chạy êm, không còn tiếng kêu.',
      early: 'Việc sửa chữa chưa xong, nguồn vẫn đang khóa.' },
  ],
  hazards: {
    grease: 'Bơm thêm mỡ không sửa được ổ bi đã mòn; máy có thể hỏng nặng hơn.',
    motor: (index) => (index < 3 ? 'Không chạm vào động cơ và bộ truyền khi chưa cắt và khóa nguồn.' : null),
  },
  build() {
    const root = new THREE.Group()
    // Conveyor
    const frame = box(4.4, 0.12, 1, 0x475569, 0, 0.85, 0)
    root.add(frame)
    ;[-1.9, -0.6, 0.6, 1.9].forEach((x) => [-0.42, 0.42].forEach((z) => root.add(box(0.08, 0.85, 0.08, 0x334155, x, 0.42, z))))
    const belt = box(4.2, 0.04, 0.82, 0x111827, 0, 0.94, 0)
    root.add(belt)
    const rollers = [-2.15, 2.15].map((x) => {
      const roller = alongZ(cylinder(0.14, 0.86, 0x64748b, x, 0.9, 0))
      root.add(roller)
      return roller
    })
    const boxes = [0, 1, 2, 3].map((index) => {
      const item = box(0.42, 0.3, 0.4, 0xd97706, -1.8 + index * 1.2, 1.12, 0)
      item.userData.decor = true
      root.add(item)
      return item
    })
    const bearing = tag(group(alongZ(cylinder(0.2, 0.18, 0x7f1d1d, 2.15, 0.9, 0.52)), box(0.36, 0.1, 0.24, 0x7f1d1d, 2.15, 0.72, 0.52)), 'bearing')
    const motor = tag(group(alongX(cylinder(0.24, 0.6, 0x1e3a8a, 2.75, 0.62, 0.62)), box(0.3, 0.3, 0.3, 0x334155, 2.3, 0.62, 0.62)), 'motor')
    root.add(bearing, motor)

    // Operator panel
    root.add(box(0.12, 1.1, 0.12, 0x334155, -2.5, 0.55, 1.5), box(0.5, 0.36, 0.2, 0xe5e7eb, -2.5, 1.2, 1.5))
    const stopButton = tag(ball(0.08, 0xdc2626, -2.62, 1.22, 1.62), 'stopButton')
    const startButton = tag(ball(0.08, 0x16a34a, -2.38, 1.22, 1.62), 'startButton')
    root.add(stopButton, startButton)

    // Electrical cabinet with the conveyor's breaker
    root.add(box(0.9, 1.9, 0.4, 0x94a3b8, -3.9, 0.95, -0.6))
    const breakerBody = box(0.22, 0.34, 0.1, 0xf8fafc, -3.9, 1.2, -0.36)
    const lever = box(0.06, 0.16, 0.08, 0x111827, -3.9, 1.28, -0.29)
    const breaker = tag(group(breakerBody, lever), 'breaker')
    const padlock = group(box(0.12, 0.1, 0.05, 0xfacc15, -3.9, 1.0, -0.3), ring(0.04, 0.012, 0x9ca3af, -3.9, 1.08, -0.3))
    const tagCard = box(0.16, 0.22, 0.01, 0xef4444, -3.75, 0.92, -0.3)
    const lockOnBreaker = group(padlock, tagCard)
    const lockOnHook = group(box(0.14, 0.12, 0.06, 0xfacc15, -4.15, 0.9, -0.38), box(0.18, 0.24, 0.01, 0xef4444, -4.15, 0.7, -0.38))
    tag(lockOnBreaker, 'lockKit')
    tag(lockOnHook, 'lockKit')
    root.add(breaker, lockOnBreaker, lockOnHook)

    // Workbench: grease, logbook
    root.add(box(1.6, 0.08, 0.7, 0x92400e, 0.4, 0.8, 2.0))
    ;[[-0.3, 1.75], [1.1, 1.75], [-0.3, 2.25], [1.1, 2.25]].forEach(([x, z]) => root.add(box(0.06, 0.8, 0.06, 0x78350f, x, 0.4, z)))
    const grease = tag(cylinder(0.12, 0.2, 0xeab308, 0, 0.94, 2.0), 'grease')
    const logbook = tag(group(box(0.4, 0.04, 0.3, 0x1d4ed8, 0.7, 0.86, 2.0), box(0.38, 0.01, 0.28, 0xf8fafc, 0.7, 0.885, 2.0)), 'logbook')
    root.add(grease, logbook)

    const annotations = [
      label(root, 'Nút dừng', -2.85, 1.4, 1.62),
      label(root, 'Nút chạy', -2.2, 1.45, 1.62),
      label(root, 'Aptomat băng tải', -3.9, 1.95, -0.36),
      label(root, 'Bộ khóa và thẻ', -4.15, 1.05, -0.38),
      label(root, 'Gối đỡ ổ bi', 2.15, 1.35, 0.6),
      label(root, 'Động cơ', 2.85, 1.0, 0.62),
      label(root, 'Hộp mỡ', 0, 1.3, 2.0),
      label(root, 'Sổ bảo trì', 0.7, 1.2, 2.0),
    ]

    let lastTime = 0
    let travel = 0
    return {
      root,
      annotations,
      floorY: 0,
      framing: { center: new THREE.Vector3(-0.6, 0.9, 0.7), width: 8.4, height: 3.6, direction: new THREE.Vector3(0.25, 0.5, 1).normalize() },
      update(time, { index }) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        const running = index < RUNNING_BEFORE || index >= RUNNING_AGAIN
        if (running) travel = (travel + dt * 0.6) % 4.8
        boxes.forEach((item, n) => { item.position.x = -2.1 + ((n * 1.2 + travel) % 4.8) })
        rollers.forEach((roller) => { if (running) roller.rotation.y += dt * 4 })
        // worn bearing shakes while running
        bearing.position.y = running && index < 5 ? Math.sin(time * 40) * 0.012 : 0
        bearing.children.forEach((child) => child.material.color.setHex(index >= 5 ? 0x059669 : 0x7f1d1d))
        const off = index >= 2 && index < 7
        lever.position.y = off ? 1.12 : 1.28
        lockOnBreaker.visible = index >= 3 && index < 7
        lockOnHook.visible = !lockOnBreaker.visible
        return {}
      },
    }
  },
}
