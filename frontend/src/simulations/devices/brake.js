// Hydraulic disc brake of one front wheel, Công nghệ 11 (Kết nối tri thức), Bài 25.
import * as THREE from 'three'
import { alongX, alongZ, box, cylinder, flow, group, label, pipe, ring, seeThrough, tag } from './kit'
import { brakeHydraulics } from './principles'

const fmt = (value, digits = 1) => value.toFixed(digits).replace('.', ',')

export default {
  keys: ['11-25'],
  title: 'Hệ thống phanh dầu',
  subtitle: 'Bàn đạp, xi lanh chính, đường ống dầu, xi lanh công tác, má phanh và đĩa phanh.',
  task: 'Đạp phanh ở 25%, 50% và 100%; ghi lực lên xi lanh chính, áp suất dầu và lực ép má phanh. Giải thích vì sao lực ép má phanh luôn gấp khoảng 6 lần lực lên xi lanh chính.',
  objective: 'Nhận biết các bộ phận của hệ thống phanh dầu và giải thích vì sao lực nhỏ ở bàn đạp tạo được lực ép lớn ở má phanh.',
  parts: {
    pedal: { name: 'Bàn đạp phanh', role: 'Người lái tác dụng lực. Cánh tay đòn của bàn đạp làm lực tác dụng lên pít tông xi lanh chính lớn gấp nhiều lần lực chân.' },
    booster: { name: 'Bộ trợ lực', role: 'Dùng độ chân không hoặc áp suất để tăng thêm lực đạp, giúp người lái đạp nhẹ hơn.' },
    master: { name: 'Xi lanh chính', role: 'Pít tông nhỏ nén dầu phanh, tạo áp suất trong toàn bộ đường dầu.' },
    reservoir: { name: 'Bình dầu phanh', role: 'Chứa dầu bổ sung cho xi lanh chính khi má phanh mòn dần.' },
    line: { name: 'Đường ống dầu', role: 'Dẫn dầu chịu áp suất từ xi lanh chính tới xi lanh công tác ở bánh xe.' },
    caliper: { name: 'Xi lanh công tác (cùm phanh)', role: 'Pít tông lớn nhận áp suất dầu và đẩy má phanh ép vào đĩa với lực lớn hơn lực ở xi lanh chính.' },
    pads: { name: 'Má phanh', role: 'Ép vào hai mặt đĩa phanh; ma sát giữa má và đĩa làm bánh xe quay chậm lại.' },
    disc: { name: 'Đĩa phanh', role: 'Gắn và quay cùng bánh xe; nhận lực ma sát từ má phanh, biến động năng thành nhiệt.' },
    wheel: { name: 'Bánh xe', role: 'Quay chậm dần khi má phanh ép vào đĩa.' },
  },
  layers: [
    { id: 'drive', name: 'Cơ cấu dẫn động', note: 'Bàn đạp, bộ trợ lực, xi lanh chính, bình dầu và đường ống dẫn áp suất dầu tới bánh xe.', parts: ['pedal', 'booster', 'master', 'reservoir', 'line'] },
    { id: 'brake', name: 'Cơ cấu phanh', note: 'Xi lanh công tác đẩy má phanh ép vào đĩa phanh quay cùng bánh xe.', parts: ['caliper', 'pads', 'disc'] },
    { id: 'principle', name: 'Nguyên lí: định luật Pascal', note: 'Áp suất dầu như nhau ở mọi chỗ; pít tông công tác có diện tích lớn hơn nên lực ép lớn hơn lực ở xi lanh chính bấy nhiêu lần.', parts: ['master', 'line', 'caliper'] },
  ],
  controls: [
    { id: 'pedal', label: 'Lực đạp phanh', type: 'slider', min: 0, max: 1, step: 0.05, default: 0, format: (value) => `${Math.round(value * 100)}%` },
  ],
  interactions: { pedal: (controls) => ({ ...controls, pedal: controls.pedal > 0 ? 0 : 1 }) },
  checkpoints: [
    'Hệ thống phanh dầu gồm cơ cấu dẫn động (bàn đạp, xi lanh chính, đường ống) và cơ cấu phanh (xi lanh công tác, má phanh, đĩa hoặc tang trống).',
    'Đạp phanh: pít tông xi lanh chính nén dầu, áp suất truyền qua đường ống tới xi lanh công tác, đẩy má phanh ép vào đĩa.',
    'Pít tông công tác lớn hơn pít tông xi lanh chính nên lực ép má phanh lớn hơn lực tác dụng lên xi lanh chính.',
  ],
  readouts(state) {
    const result = brakeHydraulics(state.pedal || 0)
    return [
      { label: 'Lực lên xi lanh chính', value: `${Math.round(result.masterForceN)} N` },
      { label: 'Áp suất dầu', value: `${fmt(result.pressureMPa)} MPa` },
      { label: 'Lực ép má phanh', value: `${(result.clampForceN / 1000).toFixed(1).replace('.', ',')} kN` },
      { label: 'Tỉ lệ diện tích pít tông', value: `× ${fmt(result.areaRatio)}` },
      { label: 'Tốc độ bánh xe', value: `${Math.round(state.wheelRpm || 0)} vòng/phút` },
    ]
  },
  build() {
    const root = new THREE.Group()
    const pedalPivot = new THREE.Group()
    pedalPivot.position.set(-3.2, 1.6, 0)
    pedalPivot.add(tag(group(box(0.12, 1.6, 0.12, 0x334155, 0, -0.8, 0), box(0.55, 0.12, 0.45, 0x111827, 0, -1.62, 0.1)), 'pedal'))
    const pushrod = tag(alongX(cylinder(0.04, 0.9, 0x94a3b8, -2.6, 1.25, 0)), 'pedal')
    root.add(pedalPivot, pushrod)

    root.add(tag(alongX(cylinder(0.55, 0.6, 0x475569, -1.9, 1.25, 0)), 'booster'))
    root.add(tag(alongX(cylinder(0.22, 1.1, seeThrough(0x64748b, 0.35), -1.05, 1.25, 0)), 'master'))
    const masterPiston = tag(alongX(cylinder(0.19, 0.18, 0xe2e8f0, -1.42, 1.25, 0)), 'master')
    root.add(masterPiston)
    const masterFluid = alongX(cylinder(0.18, 0.7, new THREE.MeshBasicMaterial({ color: 0xd97706, transparent: true, opacity: 0.6 }), -0.85, 1.25, 0))
    masterFluid.userData.decor = true
    root.add(masterFluid)
    root.add(tag(group(box(0.5, 0.35, 0.35, seeThrough(0xfbbf24, 0.5), -1.05, 1.75, 0), cylinder(0.05, 0.2, 0x334155, -1.05, 1.5, 0)), 'reservoir'))

    // Pipe from the master cylinder down to the wheel
    const line = tag(pipe([[-0.5, 1.25, 0], [0.4, 1.25, 0], [1.2, 0.9, 0.3], [1.9, 0.6, 0.55], [2.35, 0.55, 0.55]], 0.05, 0xb45309), 'line')
    root.add(line)
    const oil = flow(line.userData.curve, 0xf59e0b, 16, 0.07)
    root.add(...oil.beads)

    // Wheel with disc, calliper and pads, seen from the side (axle along Z)
    const wheelCenter = new THREE.Vector3(2.8, 0, 0)
    const spinning = new THREE.Group()
    spinning.position.copy(wheelCenter)
    spinning.add(tag(alongZ(cylinder(0.95, 0.06, 0x9ca3af, 0, 0, 0.35)), 'disc'))
    for (let index = 0; index < 10; index += 1) {
      const angle = (index / 10) * Math.PI * 2
      spinning.add(tag(alongZ(cylinder(0.05, 0.07, 0x6b7280, Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, 0.35)), 'disc'))
    }
    // A torus already stands in the XY plane, facing the viewer like the disc
    spinning.add(tag(group(ring(1.25, 0.28, 0x111827, 0, 0, -0.1), alongZ(cylinder(1.0, 0.35, 0xcbd5e1, 0, 0, -0.1))), 'wheel'))
    for (let index = 0; index < 5; index += 1) {
      const angle = (index / 5) * Math.PI * 2
      spinning.add(tag(box(0.12, 0.85, 0.08, 0x94a3b8, Math.cos(angle) * 0.45, Math.sin(angle) * 0.45, 0.1), 'wheel'))
      spinning.children.at(-1).rotation.z = angle + Math.PI / 2
    }
    root.add(spinning)
    root.add(tag(box(0.55, 0.75, 0.55, seeThrough(0xdc2626, 0.55), 2.8, 0.75, 0.35), 'caliper'))
    const padOut = tag(box(0.42, 0.55, 0.08, 0x1f2937, 2.8, 0.75, 0.5), 'pads')
    const padIn = tag(box(0.42, 0.55, 0.08, 0x1f2937, 2.8, 0.75, 0.2), 'pads')
    const wheelPiston = tag(alongZ(cylinder(0.17, 0.12, 0xe2e8f0, 2.8, 0.75, 0.6)), 'caliper')
    root.add(padOut, padIn, wheelPiston)

    const annotations = [
      label(pedalPivot, 'Bàn đạp phanh', 0.2, -1.9, 0.3),
      label(root, 'Bộ trợ lực', -1.9, 1.95, 0),
      label(root, 'Xi lanh chính', -0.8, 0.85, 0.3),
      label(root, 'Bình dầu', -1.05, 2.15, 0, true),
      label(root, 'Đường ống dầu', 1.2, 1.15, 0.3),
      label(root, 'Xi lanh công tác', 2.85, 1.35, 0.6),
      label(root, 'Má phanh', 3.3, 0.5, 0.6, true),
      label(root, 'Đĩa phanh', 2.2, -0.55, 0.45),
    ]

    let lastTime = 0
    let wheelRpm = 300
    let pedal = 0
    let wheelAngle = 0
    return {
      root,
      annotations,
      floorY: -1.6,
      framing: { center: new THREE.Vector3(0.55, 0.25, 0), width: 9, height: 4.6, direction: new THREE.Vector3(0.25, 0.25, 1).normalize() },
      update(time, controls) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        // The pedal follows the slider smoothly, as a foot would
        pedal += (controls.pedal - pedal) * Math.min(1, dt * 6)
        const hydraulics = brakeHydraulics(pedal)
        // The wheel slows in proportion to the clamp force and is driven back up to speed when released
        const decel = hydraulics.clampForceN / 25
        wheelRpm = Math.max(0, Math.min(300, wheelRpm + (pedal < 0.02 ? 120 : -decel) * dt))
        wheelAngle -= (wheelRpm / 60) * Math.PI * 2 * dt * 0.25
        spinning.rotation.z = wheelAngle
        pedalPivot.rotation.z = pedal * 0.45
        pushrod.position.x = -2.6 + pedal * 0.25
        masterPiston.position.x = -1.42 + pedal * 0.25
        const squeeze = Math.min(1, pedal * 3) * 0.06
        padOut.position.z = 0.5 - squeeze
        padIn.position.z = 0.2 + squeeze
        wheelPiston.position.z = 0.6 - squeeze
        masterFluid.material.color.setHSL(0.08, 0.9, 0.55 - pedal * 0.25)
        oil.update(time, pedal > 0.02 ? 0.6 : 0, pedal > 0.02)
        return { pedal, wheelRpm, ...hydraulics }
      },
    }
  },
}

