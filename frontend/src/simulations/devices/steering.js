// Rack-and-pinion steering of the front axle, Công nghệ 11 (Kết nối tri thức), Bài 24.
import * as THREE from 'three'
import { alongX, alongZ, box, cylinder, gear, group, label, ring, seeThrough, tag } from './kit'
import { STEERING, steeringState } from './principles'

const RACK_SCALE = 0.012 // model units per millimetre of rack travel
const TRACK = 3.4 // distance between the two king pins in the model
const deg = (value) => `${Math.abs(value).toFixed(1).replace('.', ',')}°`
const STEPS = [0, 270, 540, 270, 0, -270, -540, -270]

export default {
  keys: ['11-24'],
  title: 'Hệ thống lái kiểu bánh răng – thanh răng',
  subtitle: 'Vô lăng, trục lái, cơ cấu lái bánh răng – thanh răng, đòn kéo ngang, cam quay và bánh xe dẫn hướng.',
  task: 'Quay vô lăng 270° và 540° mỗi bên; ghi dịch chuyển thanh răng, góc hai bánh xe. Giải thích vì sao bánh phía trong cua quay góc lớn hơn.',
  objective: 'Nhận biết các bộ phận của hệ thống lái và giải thích cách chuyển động quay của vô lăng được biến thành chuyển động quay của bánh xe dẫn hướng.',
  hint: 'Kéo thanh trượt hoặc bấm vào vô lăng để xoay vô lăng. Nhìn từ trên xuống: bánh phía trong cua quay góc lớn hơn bánh phía ngoài.',
  parts: {
    handwheel: { name: 'Vô lăng', role: 'Người lái quay vô lăng để điều khiển hướng chuyển động của xe.' },
    column: { name: 'Trục lái', role: 'Truyền chuyển động quay từ vô lăng xuống cơ cấu lái; có khớp nối để đổi hướng.' },
    pinion: { name: 'Bánh răng (cơ cấu lái)', role: 'Quay cùng trục lái, ăn khớp với thanh răng.' },
    rack: { name: 'Thanh răng (cơ cấu lái)', role: 'Biến chuyển động quay của bánh răng thành chuyển động tịnh tiến sang trái hoặc phải.' },
    tieRod: { name: 'Đòn kéo ngang', role: 'Thuộc dẫn động lái: nối hai đầu thanh răng với đòn quay cam quay của hai bánh xe.' },
    knuckle: { name: 'Đòn quay, cam quay', role: 'Nhận lực từ đòn kéo ngang, làm bánh xe dẫn hướng quay quanh trụ đứng.' },
    wheel: { name: 'Bánh xe dẫn hướng', role: 'Quay một góc để xe đổi hướng; bánh phía trong cua quay góc lớn hơn bánh phía ngoài.' },
    axle: { name: 'Dầm cầu trước', role: 'Đỡ hai cam quay của bánh xe dẫn hướng.' },
  },
  layers: [
    { id: 'control', name: 'Vô lăng và trục lái', note: 'Người lái tác dụng lên vô lăng; trục lái truyền chuyển động quay xuống cơ cấu lái.', parts: ['handwheel', 'column'] },
    { id: 'gear', name: 'Cơ cấu lái', note: `Bánh răng bán kính ${STEERING.pinionRadiusMm} mm: vô lăng quay một vòng thì thanh răng dịch chuyển khoảng ${Math.round(2 * Math.PI * STEERING.pinionRadiusMm)} mm.`, parts: ['pinion', 'rack'] },
    { id: 'linkage', name: 'Dẫn động lái', note: 'Đòn kéo ngang và đòn quay cam quay truyền chuyển động của thanh răng tới hai bánh xe.', parts: ['tieRod', 'knuckle'] },
    { id: 'wheels', name: 'Bánh xe dẫn hướng', note: 'Hai bánh quay góc khác nhau để cùng lăn quanh một tâm quay vòng, lốp không bị trượt.', parts: ['wheel', 'axle'] },
  ],
  controls: [
    { id: 'wheelDeg', label: 'Góc quay vô lăng', type: 'slider', min: -540, max: 540, step: 15, default: 0, format: (value) => (value === 0 ? 'giữa' : `${Math.abs(value)}° ${value > 0 ? 'sang trái' : 'sang phải'}`) },
  ],
  interactions: {
    handwheel: (controls) => {
      const index = STEPS.indexOf(controls.wheelDeg)
      return { ...controls, wheelDeg: STEPS[(index + 1) % STEPS.length] }
    },
  },
  checkpoints: [
    'Hệ thống lái gồm vô lăng, trục lái, cơ cấu lái và dẫn động lái; có thể có thêm trợ lực lái.',
    'Cơ cấu lái bánh răng – thanh răng biến chuyển động quay của trục lái thành chuyển động tịnh tiến của thanh răng.',
    'Khi quay vòng, bánh xe phía trong quay góc lớn hơn bánh phía ngoài.',
  ],
  readouts(state) {
    const result = steeringState(state.wheelDeg || 0)
    return [
      { label: 'Dịch chuyển thanh răng', value: `${Math.abs(result.rackMm).toFixed(0)} mm` },
      { label: 'Góc bánh trái', value: deg(result.leftDeg) },
      { label: 'Góc bánh phải', value: deg(result.rightDeg) },
      { label: 'Bán kính quay vòng', value: Number.isFinite(result.radiusM) ? `${result.radiusM.toFixed(1).replace('.', ',')} m` : 'đi thẳng' },
    ]
  },
  build() {
    const root = new THREE.Group()
    // Front of the car is toward -Z; the axle runs along X
    root.add(tag(alongX(cylinder(0.09, TRACK - 0.6, 0x475569, 0, -0.25, 0.4)), 'axle'))
    const rack = tag(group(alongX(cylinder(0.08, 2.2, 0xd97706))), 'rack')
    for (let index = 0; index < 18; index += 1) rack.add(tag(box(0.05, 0.08, 0.1, 0xb45309, -0.45 + index * 0.05, 0.08, 0), 'rack'))
    rack.position.set(0, 0.1, 0)
    root.add(rack, tag(alongX(cylinder(0.14, 1.2, seeThrough(0x64748b, 0.35), -0.2, 0.1, 0)), 'rack'))
    const pinion = tag(gear(0.14, 10, 0.16, 0x0f766e), 'pinion')
    pinion.rotation.x = Math.PI / 2 // axis vertical, meshing with the rack's teeth
    pinion.position.set(0, 0.3, 0)
    root.add(pinion)

    // Steering column rising toward the driver, and the hand wheel
    const columnTop = new THREE.Vector3(-0.9, 1.5, 2.3)
    const columnBottom = new THREE.Vector3(0, 0.35, 0)
    const column = tag(cylinder(0.05, columnTop.distanceTo(columnBottom), 0x94a3b8), 'column')
    column.position.copy(columnTop.clone().add(columnBottom).multiplyScalar(0.5))
    column.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), columnTop.clone().sub(columnBottom).normalize())
    root.add(column)
    const handwheel = tag(group(ring(0.45, 0.05, 0x111827), box(0.86, 0.06, 0.05, 0x111827, 0, 0, 0), box(0.06, 0.45, 0.05, 0x111827, 0, -0.22, 0), alongZ(cylinder(0.11, 0.08, 0x334155))), 'handwheel')
    handwheel.position.copy(columnTop)
    handwheel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), columnTop.clone().sub(columnBottom).normalize())
    const handwheelSpin = new THREE.Group()
    handwheelSpin.add(...handwheel.children.splice(0))
    handwheel.add(handwheelSpin)
    root.add(handwheel)

    // Each side: tie rod from the rack end to the steering arm, knuckle turning about its king pin, wheel
    const sides = [-1, 1].map((side) => {
      const kingPin = new THREE.Vector3(side * TRACK / 2, -0.25, 0.4)
      const knuckle = new THREE.Group()
      knuckle.position.copy(kingPin)
      knuckle.add(tag(cylinder(0.08, 0.45, 0x334155), 'knuckle'))
      const arm = tag(box(0.08, 0.08, 0.5, 0x334155, -side * 0.1, 0.35 - 0.25 + 0.0, -0.25 + 0.0), 'knuckle')
      arm.position.set(-side * 0.12, 0.35, -0.25)
      knuckle.add(arm)
      const wheel = tag(group(alongX(cylinder(0.62, 0.36, 0x111827)), alongX(cylinder(0.4, 0.38, 0xcbd5e1))), 'wheel')
      wheel.position.set(side * 0.4, 0, 0)
      knuckle.add(wheel)
      root.add(knuckle)
      const tieRod = tag(cylinder(0.035, 1, 0x64748b), 'tieRod')
      root.add(tieRod)
      return { side, knuckle, tieRod, armTip: new THREE.Vector3() }
    })

    const annotations = [
      label(handwheel, 'Vô lăng', 0, 0.6, 0),
      label(root, 'Trục lái', -0.45, 1.35, 0.8),
      label(root, 'Bánh răng – thanh răng', 0, 0.55, 0),
      label(root, 'Đòn kéo ngang', -1.1, 0.35, -0.1, true),
      label(root, 'Cam quay', TRACK / 2, 0.15, 0.4, true),
      label(root, 'Bánh xe dẫn hướng', -TRACK / 2 - 0.4, 0.75, 0.4),
    ]

    let wheelDeg = 0
    let lastTime = 0
    const from = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    return {
      root,
      annotations,
      floorY: -0.95,
      framing: { center: new THREE.Vector3(0, 0.3, 0.9), width: 5.8, height: 4.4, direction: new THREE.Vector3(0.1, 1.6, 0.9).normalize() },
      update(time, controls) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        wheelDeg += (controls.wheelDeg - wheelDeg) * Math.min(1, dt * 5)
        const state = steeringState(wheelDeg)
        handwheelSpin.rotation.z = (-wheelDeg * Math.PI) / 180
        pinion.rotation.y = (-wheelDeg * Math.PI) / 180
        rack.position.x = -state.rackMm * RACK_SCALE
        sides.forEach(({ side, knuckle, tieRod, armTip }) => {
          const angle = ((side < 0 ? state.leftDeg : state.rightDeg) * Math.PI) / 180
          knuckle.rotation.y = angle
          knuckle.updateMatrixWorld(true)
          armTip.set(-side * 0.12, 0.35, -0.5).applyMatrix4(knuckle.matrix)
          from.set(rack.position.x + side * 1.1, 0.1, 0)
          tieRod.position.copy(from).add(armTip).multiplyScalar(0.5)
          tieRod.scale.y = from.distanceTo(armTip)
          tieRod.quaternion.setFromUnitVectors(up, armTip.clone().sub(from).normalize())
        })
        return { wheelDeg, ...state }
      },
    }
  },
}
