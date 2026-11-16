// Kĩ thuật viên lắp ráp bo mạch (Công nghệ 12, Bài 14): fit an electrolytic capacitor the right way round,
// solder it, test the board and record it, protected against static electricity.
import * as THREE from 'three'
import { box, cylinder, group, label, ring, tag } from '../devices/kit'

// An electrolytic capacitor standing on the bench or the board: dark body, light stripe on the negative side.
// stripeToward: -1 stripe on its left, +1 on its right, as seen from the student.
const capacitor = (x, y, z, stripeToward) => {
  const body = cylinder(0.07, 0.2, 0x1e3a8a, x, y, z)
  const stripe = box(0.025, 0.2, 0.05, 0xe5e7eb, x + stripeToward * 0.06, y, z + 0.03)
  return group(body, stripe)
}

export default {
  job: 'assembly-tech',
  title: 'Lắp tụ hóa lên bo mạch',
  intro: 'Em là kĩ thuật viên dây chuyền lắp ráp điện tử. Hãy lắp một tụ hóa lên bo mạch, hàn, kiểm tra chức năng và ghi phiếu.',
  parts: {
    wristStrap: { name: 'Vòng đeo tay chống tĩnh điện', role: 'Nối người với đất qua dây, xả tĩnh điện liên tục để không làm hỏng vi mạch.' },
    board: { name: 'Bo mạch', role: 'Vị trí lắp tụ có hai lỗ; dấu "+" in cạnh lỗ bên trái.' },
    capCorrect: { name: 'Cách A: tụ hóa có vạch trắng ở bên phải', role: 'Cắm tụ với chân bên phải vào lỗ bên phải.' },
    capReversed: { name: 'Cách B: tụ hóa có vạch trắng ở bên trái', role: 'Cắm tụ với chân bên trái vào lỗ "+" bên trái.' },
    solderIron: { name: 'Mỏ hàn', role: 'Hàn chân linh kiện vào bo mạch.' },
    testerBox: { name: 'Thiết bị kiểm tra chức năng', role: 'Cấp nguồn và kiểm tra bo mạch làm việc đúng.' },
    checklist: { name: 'Phiếu kiểm tra', role: 'Ghi kết quả kiểm tra từng bo mạch.' },
  },
  steps: [
    { part: 'wristStrap', instruction: 'Đeo vòng chống tĩnh điện trước khi làm việc.', done: 'Đã đeo vòng, dây nối đất đã cắm.' },
    { part: 'capCorrect', instruction: 'Chọn đúng chiều cắm tụ hóa vào bo mạch.', done: 'Đúng cực tính: vạch trắng chỉ cực âm, nên chân đó cắm vào lỗ không có dấu "+".',
      early: 'Đeo vòng chống tĩnh điện trước khi chạm vào linh kiện và bo mạch.' },
    { part: 'solderIron', instruction: 'Hàn hai chân tụ vào bo mạch.', done: 'Mối hàn bóng, bám đều quanh chân.',
      early: (index) => (index < 1 ? 'Đeo vòng chống tĩnh điện trước.' : 'Cắm tụ vào bo mạch trước rồi mới hàn.') },
    { part: 'testerBox', instruction: 'Đặt bo mạch vào thiết bị kiểm tra chức năng.', done: 'Bo mạch làm việc đúng: đèn báo xanh.',
      early: 'Chưa lắp xong linh kiện để kiểm tra.' },
    { part: 'checklist', instruction: 'Ghi kết quả vào phiếu kiểm tra.', done: 'Đã ghi: mã bo mạch, kết quả, người kiểm tra.',
      early: 'Chưa có kết quả kiểm tra để ghi.' },
  ],
  hazards: {
    capReversed: (index) => (index < 1
      ? 'Đeo vòng chống tĩnh điện trước khi chạm vào linh kiện.'
      : 'Sai cực tính: vạch trắng trên tụ hóa chỉ cực âm, chân đó không được cắm vào lỗ "+". Cắm ngược có thể làm tụ phồng, nổ.'),
    board: (index) => (index < 1 ? 'Đeo vòng chống tĩnh điện trước khi chạm vào bo mạch.' : null),
  },
  build() {
    const root = new THREE.Group()
    // Antistatic bench
    root.add(box(3.2, 0.08, 1.4, 0x0f766e, 0, 0.9, 0))
    ;[[-1.5, -0.6], [1.5, -0.6], [-1.5, 0.6], [1.5, 0.6]].forEach(([x, z]) => root.add(box(0.06, 0.9, 0.06, 0x334155, x, 0.45, z)))

    const strapOnBench = tag(group(ring(0.1, 0.025, 0x111827, -1.2, 0.97, 0.35), box(0.5, 0.015, 0.015, 0x16a34a, -0.95, 0.95, 0.35)), 'wristStrap')
    strapOnBench.children[0].rotation.x = Math.PI / 2
    const strapWorn = tag(group(ring(0.1, 0.025, 0x111827, -1.2, 1.25, 0.6), box(0.015, 0.3, 0.015, 0x16a34a, -1.2, 1.05, 0.6)), 'wristStrap')
    root.add(strapOnBench, strapWorn)

    // Board: the capacitor's two holes, a "+" printed beside the left one
    const board = tag(group(
      box(1.1, 0.04, 0.8, 0x15803d, 0, 0.96, 0),
      box(0.07, 0.012, 0.018, 0xfafafa, 0.06, 0.985, 0.1), box(0.018, 0.012, 0.07, 0xfafafa, 0.06, 0.985, 0.1),
      cylinder(0.018, 0.012, 0xd4d4d8, 0.17, 0.985, 0.1), cylinder(0.018, 0.012, 0xd4d4d8, 0.33, 0.985, 0.1),
    ), 'board')
    const led = cylinder(0.05, 0.06, 0x166534, -0.35, 1.0, -0.25, { emissive: 0x000000 })
    led.userData.decor = true
    root.add(board, led)

    // Two ways to fit the capacitor, on the bench in front of the board; the chosen one goes into the holes
    const capCorrect = tag(capacitor(-0.25, 1.04, 0.55, 1), 'capCorrect')
    const capReversed = tag(capacitor(0.25, 1.04, 0.55, -1), 'capReversed')
    const capFitted = capacitor(0.25, 1.08, 0.1, 1)
    capFitted.traverse((child) => { child.userData.decor = true })
    root.add(capCorrect, capReversed, capFitted)

    const solderIron = tag(group(cylinder(0.04, 0.5, 0xdc2626, 1.0, 1.0, 0.35), cylinder(0.012, 0.18, 0x9ca3af, 1.0, 1.0, 0.1)), 'solderIron')
    solderIron.children.forEach((child) => { child.rotation.x = Math.PI / 2 })
    const testerBox = tag(group(box(0.6, 0.3, 0.45, 0x334155, 1.0, 1.09, -0.35), box(0.2, 0.12, 0.01, 0x0f172a, 1.0, 1.12, -0.12)), 'testerBox')
    const statusLight = cylinder(0.04, 0.02, 0x166534, 1.2, 1.25, -0.2, { emissive: 0x000000 })
    statusLight.userData.decor = true
    const checklist = tag(group(box(0.35, 0.01, 0.45, 0xfafafa, -1.0, 0.95, -0.3), box(0.25, 0.012, 0.02, 0x1d4ed8, -1.0, 0.957, -0.4)), 'checklist')
    root.add(solderIron, testerBox, statusLight, checklist)

    const annotations = [
      label(root, 'Vòng chống tĩnh điện', -1.2, 1.25, 0.35),
      label(root, 'Vị trí lắp tụ (+ bên trái)', 0.25, 1.25, 0.1),
      label(root, 'Cách A', -0.25, 1.25, 0.55),
      label(root, 'Cách B', 0.25, 1.25, 0.55),
      label(root, 'Mỏ hàn', 1.0, 1.25, 0.4),
      label(root, 'Thiết bị kiểm tra', 1.0, 1.5, -0.35),
      label(root, 'Phiếu kiểm tra', -1.0, 1.2, -0.3),
    ]

    return {
      root,
      annotations,
      floorY: 0,
      framing: { center: new THREE.Vector3(0, 1.05, 0.05), width: 3.6, height: 1.9, direction: new THREE.Vector3(0.1, 0.9, 0.8).normalize() },
      update(time, { index }) {
        strapOnBench.visible = index < 1
        strapWorn.visible = index >= 1
        capCorrect.visible = index < 2
        capReversed.visible = index < 2
        capFitted.visible = index >= 2
        const passed = index >= 4
        statusLight.material.emissive.setHex(passed ? 0x22c55e : 0x000000)
        statusLight.material.emissiveIntensity = passed ? 1.4 : 0
        led.material.emissive.setHex(passed ? 0x22c55e : 0x000000)
        led.material.emissiveIntensity = passed ? 1.2 : 0
        return {}
      },
    }
  },
}
