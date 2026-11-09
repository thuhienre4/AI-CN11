// Drive line of a rear-wheel-drive car, Công nghệ 11 (Kết nối tri thức), Bài 22.
import * as THREE from 'three'
import { alongX, alongZ, box, cylinder, gear, group, label, seeThrough, tag } from './kit'
import { DIFFERENTIAL_SPREAD, FINAL_DRIVE, GEARS, drivelineState } from './principles'

const GEAR_ORDER = ['N', 1, 2, 3, 4, 'R']
const CENTER_DISTANCE = 0.62
const INPUT_Y = 0.55
const OUTPUT_Y = INPUT_Y - CENTER_DISTANCE
const SLOW = 0.04 // rotation is slowed down so that it can be watched

const turns = (rpm, dt) => (rpm / 60) * Math.PI * 2 * dt * SLOW

export default {
  keys: ['11-22'],
  title: 'Hệ thống truyền lực',
  subtitle: 'Li hợp, hộp số, truyền lực các đăng, truyền lực chính, vi sai, bán trục và bánh xe chủ động.',
  task: 'Giữ tốc độ động cơ 2000 vòng/phút, lần lượt chọn số 1 đến số 4 và ghi tốc độ trục các đăng. Đạp li hợp, chọn số 0, số lùi để quan sát. Kéo vào cua và so sánh tốc độ hai bánh xe.',
  objective: 'Nhận biết các bộ phận của hệ thống truyền lực, giải thích cách hộp số thay đổi tốc độ và vì sao vi sai cho hai bánh quay khác nhau khi vào cua.',
  hint: 'Bấm vào cần số để chuyển số, bấm vào li hợp để đạp hoặc nhả. Chuyển động được làm chậm để quan sát.',
  parts: {
    engine: { name: 'Động cơ', role: 'Nguồn động lực, tạo mô men quay trên trục khuỷu.' },
    clutch: { name: 'Li hợp', role: 'Nối hoặc ngắt truyền động từ động cơ tới hộp số. Đạp li hợp để ngắt khi khởi hành, chuyển số hoặc dừng xe.' },
    gearbox: { name: 'Hộp số', role: 'Thay đổi tỉ số truyền nhờ các cặp bánh răng có số răng khác nhau; có số lùi để xe đi lùi và số 0 để ngắt truyền động lâu dài.' },
    lever: { name: 'Cần số', role: 'Người lái chọn cặp bánh răng làm việc trong hộp số.' },
    propeller: { name: 'Truyền lực các đăng', role: 'Trục và khớp các đăng truyền mô men từ hộp số tới cầu chủ động khi góc và khoảng cách giữa chúng thay đổi.' },
    final: { name: 'Truyền lực chính', role: 'Cặp bánh răng côn giảm tốc độ, tăng mô men và đổi hướng truyền động sang hai bên.' },
    differential: { name: 'Bộ vi sai', role: 'Cho hai bánh xe chủ động quay với tốc độ khác nhau khi xe quay vòng hoặc đi trên đường không bằng phẳng.' },
    halfshaft: { name: 'Bán trục', role: 'Truyền mô men từ bộ vi sai tới từng bánh xe chủ động.' },
    wheel: { name: 'Bánh xe chủ động', role: 'Nhận mô men từ bán trục, tạo lực kéo cho xe chuyển động.' },
  },
  layers: [
    { id: 'clutch', name: 'Li hợp', note: 'Đạp li hợp: đĩa ma sát tách khỏi bánh đà, động cơ vẫn quay nhưng không truyền tới hộp số.', parts: ['engine', 'clutch'] },
    { id: 'gearbox', name: 'Hộp số', note: 'Mỗi số là một cặp bánh răng; bánh bị động càng lớn so với bánh chủ động thì tốc độ ra càng thấp, mô men càng lớn.', parts: ['gearbox', 'lever'] },
    { id: 'propeller', name: 'Truyền lực các đăng', note: 'Trục các đăng quay cùng tốc độ trục ra của hộp số, khớp các đăng cho phép trục lệch góc.', parts: ['propeller'] },
    { id: 'final', name: 'Truyền lực chính và vi sai', note: `Truyền lực chính giảm thêm ${String(FINAL_DRIVE).replace('.', ',')} lần. Khi vào cua, vi sai cho bánh phía ngoài quay nhanh hơn, bánh phía trong quay chậm hơn.`, parts: ['final', 'differential'] },
    { id: 'wheels', name: 'Bán trục và bánh xe', note: 'Hai bán trục đưa mô men tới hai bánh xe chủ động.', parts: ['halfshaft', 'wheel'] },
  ],
  controls: [
    { id: 'gear', label: 'Số', type: 'choice', default: 1, options: GEAR_ORDER.map((value) => [value, value === 'N' ? 'Số 0' : value === 'R' ? 'Lùi' : `Số ${value}`]) },
    { id: 'clutch', label: 'Li hợp', type: 'toggle', default: false, on: 'Đang đạp (ngắt)', off: 'Nhả (nối)' },
    { id: 'engineRpm', label: 'Tốc độ động cơ', type: 'slider', min: 800, max: 4000, step: 100, default: 2000, format: (value) => `${value} vòng/phút` },
    { id: 'turn', label: 'Vào cua', type: 'slider', min: -1, max: 1, step: 0.1, default: 0, format: (value) => (value === 0 ? 'đi thẳng' : value > 0 ? 'rẽ trái' : 'rẽ phải') },
  ],
  interactions: {
    lever: (controls) => ({ ...controls, gear: GEAR_ORDER[(GEAR_ORDER.indexOf(controls.gear) + 1) % GEAR_ORDER.length] }),
    clutch: (controls) => ({ ...controls, clutch: !controls.clutch }),
  },
  checkpoints: [
    'Hệ thống truyền lực truyền và biến đổi mô men từ động cơ tới bánh xe chủ động: li hợp, hộp số, truyền lực các đăng, truyền lực chính, vi sai, bán trục.',
    'Hộp số thay đổi tỉ số truyền để thay đổi lực kéo và tốc độ; có số lùi và số 0.',
    'Vi sai cho hai bánh chủ động quay với tốc độ khác nhau khi xe quay vòng.',
  ],
  readouts(state, controls) {
    const result = drivelineState({ gear: controls.gear, clutchPressed: controls.clutch, turn: controls.turn, engineRpm: controls.engineRpm })
    const rpm = (value) => `${Math.round(value)} vòng/phút`
    return [
      { label: 'Tỉ số hộp số', value: result.ratio ? `${String(Math.abs(result.ratio)).replace('.', ',')}${result.ratio < 0 ? ' (lùi)' : ''}` : 'ngắt' },
      { label: 'Tỉ số tổng', value: result.totalRatio ? String(Math.abs(result.totalRatio).toFixed(2)).replace('.', ',') : '—' },
      { label: 'Trục các đăng', value: rpm(result.shaftRpm) },
      { label: 'Bánh trái', value: rpm(result.leftRpm) },
      { label: 'Bánh phải', value: rpm(result.rightRpm) },
    ]
  },
  build() {
    const root = new THREE.Group()
    root.add(tag(box(1.3, 1.4, 1.2, seeThrough(0x475569, 0.55), -4.3, 0.4, 0), 'engine'))
    const flywheel = tag(alongX(cylinder(0.62, 0.12, 0x334155, -3.55, INPUT_Y, 0)), 'engine')
    const clutchDisc = tag(group(alongX(cylinder(0.55, 0.06, 0xb45309)), alongX(cylinder(0.6, 0.12, 0x64748b, 0.16, 0, 0))), 'clutch')
    clutchDisc.position.set(-3.33, INPUT_Y, 0)
    root.add(flywheel, clutchDisc)

    // Gearbox: input shaft above, output shaft below, one gear pair per forward gear and an idler for reverse
    root.add(tag(box(2.5, 1.7, 1.2, seeThrough(0x94a3b8, 0.18), -1.55, 0.25, 0), 'gearbox'))
    const inputShaft = tag(alongX(cylinder(0.05, 2.9, 0x94a3b8, -1.75, INPUT_Y, 0)), 'gearbox')
    const outputShaft = tag(alongX(cylinder(0.05, 2.4, 0x94a3b8, -1.45, OUTPUT_Y, 0)), 'gearbox')
    root.add(inputShaft, outputShaft)
    const pairs = [1, 2, 3, 4].map((number, index) => {
      const ratio = GEARS[number]
      const driver = CENTER_DISTANCE / (1 + ratio)
      const x = -2.45 + index * 0.5
      const top = tag(gear(driver, Math.max(8, Math.round(driver * 40)), 0.14, 0x64748b), 'gearbox')
      const bottom = tag(gear(CENTER_DISTANCE - driver, Math.max(8, Math.round((CENTER_DISTANCE - driver) * 40)), 0.14, 0x64748b), 'gearbox')
      top.rotation.y = Math.PI / 2
      bottom.rotation.y = Math.PI / 2
      top.position.set(x, INPUT_Y, 0)
      bottom.position.set(x, OUTPUT_Y, 0)
      root.add(top, bottom)
      return { number, ratio, top, bottom }
    })
    const reverseTop = tag(gear(0.16, 7, 0.14, 0x64748b), 'gearbox')
    const reverseIdler = tag(gear(0.13, 6, 0.14, 0x64748b), 'gearbox')
    const reverseBottom = tag(gear(0.3, 12, 0.14, 0x64748b), 'gearbox')
    ;[[reverseTop, -0.45, INPUT_Y, 0], [reverseIdler, -0.45, INPUT_Y - 0.31, 0.27], [reverseBottom, -0.45, OUTPUT_Y, 0]].forEach(([item, x, y, z]) => {
      item.rotation.y = Math.PI / 2
      item.position.set(x, y, z)
      root.add(item)
    })
    const lever = tag(group(cylinder(0.04, 0.9, 0x111827, 0, 0.45, 0), new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshStandardMaterial({ color: 0x111827 }))), 'lever')
    lever.children[1].position.y = 0.92
    lever.position.set(-1.55, 1.1, 0)
    root.add(lever)

    // Propeller shaft with a universal joint at each end
    const propeller = tag(group(alongX(cylinder(0.07, 2.6, 0x9ca3af, 0, 0, 0))), 'propeller')
    ;[-1.35, 1.35].forEach((x) => propeller.add(tag(group(box(0.08, 0.28, 0.08, 0x334155, x, 0, 0), box(0.08, 0.08, 0.28, 0x334155, x, 0, 0)), 'propeller')))
    propeller.position.set(1.15, OUTPUT_Y, 0)
    root.add(propeller)

    // Final drive (bevel pinion and crown wheel), differential case, half shafts and wheels along Z
    const axleX = 2.95
    root.add(tag(box(0.9, 0.9, 0.9, seeThrough(0x64748b, 0.3), axleX, OUTPUT_Y, 0), 'final'))
    const pinion = tag(alongX(new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.2, 14), new THREE.MeshStandardMaterial({ color: 0xd97706 }))), 'final')
    pinion.position.set(axleX - 0.33, OUTPUT_Y, 0)
    pinion.rotation.z = -Math.PI / 2
    const crown = tag(gear(0.36, 20, 0.08, 0xd97706), 'final')
    crown.position.set(axleX, OUTPUT_Y, 0.12)
    const differential = tag(group(alongZ(cylinder(0.17, 0.3, 0x0f766e)), box(0.08, 0.34, 0.08, 0x14b8a6, 0, 0, 0)), 'differential')
    differential.position.set(axleX, OUTPUT_Y, -0.05)
    root.add(pinion, crown, differential)

    const sides = [-1, 1].map((side) => {
      const half = tag(alongZ(cylinder(0.06, 1.1, 0x9ca3af, axleX, OUTPUT_Y, side * 0.95)), 'halfshaft')
      const wheel = tag(group(new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.18, 12, 36), new THREE.MeshStandardMaterial({ color: 0x111827 })),
        alongZ(cylinder(0.42, 0.22, 0xcbd5e1)), box(0.08, 0.7, 0.24, 0x64748b, 0, 0, 0)), 'wheel')
      wheel.position.set(axleX, OUTPUT_Y, side * 1.6)
      root.add(half, wheel)
      return { side, wheel }
    })

    const annotations = [
      label(root, 'Động cơ', -4.3, 1.3, 0),
      label(root, 'Li hợp', -3.35, 1.3, 0.2),
      label(root, 'Hộp số', -1.2, 1.25, 0.5),
      label(lever, 'Cần số', 0, 1.15, 0, true),
      label(root, 'Trục các đăng', 1.15, OUTPUT_Y + 0.35, 0),
      label(root, 'Truyền lực chính, vi sai', axleX, OUTPUT_Y + 0.75, 0),
      label(root, 'Bán trục', axleX + 0.35, OUTPUT_Y + 0.2, 0.95, true),
      label(root, 'Bánh xe chủ động', axleX, OUTPUT_Y + 1.0, -1.6),
    ]

    const angles = { engine: 0, input: 0, output: 0, left: 0, right: 0, gears: [0, 0, 0, 0] }
    let lastTime = 0
    let leverTilt = 0
    return {
      root,
      annotations,
      floorY: -0.95,
      framing: { center: new THREE.Vector3(-0.4, -0.1, 0), width: 10.4, height: 6, direction: new THREE.Vector3(0.25, 0.8, 1).normalize() },
      update(time, controls) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        const state = drivelineState({ gear: controls.gear, clutchPressed: controls.clutch, turn: controls.turn, engineRpm: controls.engineRpm })
        const inputRpm = state.clutchRpm
        angles.engine += turns(controls.engineRpm, dt)
        angles.input += turns(inputRpm, dt)
        angles.output += turns(state.shaftRpm, dt)
        angles.left += turns(state.leftRpm, dt)
        angles.right += turns(state.rightRpm, dt)
        flywheel.rotation.x = angles.engine
        clutchDisc.rotation.x = angles.input
        clutchDisc.position.x = -3.33 + (controls.clutch ? 0.18 : 0)
        inputShaft.rotation.x = angles.input
        outputShaft.rotation.x = angles.output
        propeller.rotation.x = angles.output
        pinion.rotation.x = angles.output
        crown.rotation.z = -angles.output / FINAL_DRIVE
        differential.rotation.z = -angles.output / FINAL_DRIVE
        sides.forEach(({ side, wheel }) => { wheel.rotation.z = -(side < 0 ? angles.left : angles.right) })
        pairs.forEach((pair, index) => {
          angles.gears[index] += turns(inputRpm / pair.ratio, dt)
          pair.top.rotation.x = angles.input
          pair.bottom.rotation.x = -angles.gears[index]
          const engaged = controls.gear === pair.number
          ;[pair.top, pair.bottom].forEach((item) => item.traverse((child) => {
            if (child.isMesh) child.material.color.setHex(engaged ? 0xf97316 : 0x64748b)
          }))
        })
        ;[reverseTop, reverseIdler, reverseBottom].forEach((item, index) => {
          item.rotation.x = (index === 1 ? -1 : 1) * angles.input
          item.traverse((child) => { if (child.isMesh) child.material.color.setHex(controls.gear === 'R' ? 0xf97316 : 0x64748b) })
        })
        const target = { N: 0, 1: -0.35, 2: 0.35, 3: -0.2, 4: 0.2, R: 0.5 }[controls.gear] ?? 0
        leverTilt += (target - leverTilt) * Math.min(1, dt * 8)
        lever.rotation.x = leverTilt
        return { ...state, spread: DIFFERENTIAL_SPREAD }
      },
    }
  },
}
