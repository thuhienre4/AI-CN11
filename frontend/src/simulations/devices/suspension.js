// Wheel and suspension of one corner of a car, Công nghệ 11 (Kết nối tri thức), Bài 23.
import * as THREE from 'three'
import { alongZ, box, coil, cylinder, group, label, ring, seeThrough, tag } from './kit'
import { stepSuspension } from './principles'

const SHOW = 6 // displacements are drawn six times larger than real so that they can be seen
const ROADS = {
  flat: () => 0,
  bump: (x) => (x > 0 && x < 0.6 ? 0.07 * Math.sin((Math.PI * x) / 0.6) : 0), // a speed bump
  rough: (x) => 0.018 * Math.sin(x * 7) + 0.012 * Math.sin(x * 17 + 1),
}
const ROAD_LENGTH = 8 // metres before the road pattern repeats
const cm = (metres) => `${(metres * 100).toFixed(1).replace('.', ',')} cm`

export default {
  keys: ['11-23'],
  title: 'Bánh xe và hệ thống treo',
  subtitle: 'Lốp, vành, lò xo, giảm chấn, đòn treo và thân xe khi đi qua mặt đường mấp mô.',
  task: 'Cho xe qua gờ giảm tốc khi giảm chấn hoạt động và khi giảm chấn hỏng; so sánh thời gian thân xe còn dao động. Chỉ ra lò xo, giảm chấn, đòn treo trên mô hình.',
  objective: 'Nhận biết các bộ phận của bánh xe và hệ thống treo; giải thích vai trò của lò xo (đàn hồi) và giảm chấn (dập tắt dao động).',
  hint: 'Bấm vào giảm chấn để làm hỏng hoặc sửa nó rồi so sánh dao động của thân xe. Độ dịch chuyển được vẽ lớn gấp 6 lần.',
  parts: {
    tyre: { name: 'Lốp xe', role: 'Tiếp xúc mặt đường, đàn hồi để giảm va đập và tạo lực bám khi kéo, phanh, lái.' },
    rim: { name: 'Vành (la-zăng)', role: 'Đỡ lốp và lắp bánh xe lên moay ơ.' },
    spring: { name: 'Lò xo (bộ phận đàn hồi)', role: 'Nối mềm bánh xe với thân xe, giảm lực va đập truyền lên thân xe.' },
    damper: { name: 'Giảm chấn', role: 'Dập tắt nhanh dao động của thân xe và bánh xe sau khi qua mấp mô.' },
    arm: { name: 'Đòn treo (bộ phận dẫn hướng)', role: 'Dẫn hướng cho bánh xe chuyển động lên xuống so với thân xe, truyền lực kéo và lực phanh.' },
    body: { name: 'Thân xe (khung vỏ)', role: 'Phần được treo; người ngồi trên xe cảm nhận dao động của phần này.' },
    road: { name: 'Mặt đường', role: 'Mấp mô của mặt đường làm bánh xe dao động lên xuống.' },
  },
  layers: [
    { id: 'wheel', name: 'Bánh xe', note: 'Lốp đàn hồi và vành đỡ lốp; lốp là chi tiết duy nhất tiếp xúc với mặt đường.', parts: ['tyre', 'rim'] },
    { id: 'elastic', name: 'Bộ phận đàn hồi', note: 'Lò xo bị nén khi bánh xe đi lên, giảm va đập truyền lên thân xe.', parts: ['spring'] },
    { id: 'damping', name: 'Bộ phận giảm chấn', note: 'Giảm chấn biến năng lượng dao động thành nhiệt, làm dao động tắt nhanh.', parts: ['damper'] },
    { id: 'guide', name: 'Bộ phận dẫn hướng', note: 'Đòn treo giữ bánh xe đúng vị trí khi chuyển động lên xuống.', parts: ['arm', 'body'] },
  ],
  controls: [
    { id: 'road', label: 'Mặt đường', type: 'choice', default: 'bump', options: [['flat', 'Bằng phẳng'], ['bump', 'Gờ giảm tốc'], ['rough', 'Đường xấu']] },
    { id: 'damper', label: 'Giảm chấn', type: 'toggle', default: true, on: 'Hoạt động', off: 'Hỏng' },
    { id: 'speed', label: 'Tốc độ xe', type: 'slider', min: 1, max: 8, step: 1, default: 3, format: (value) => `${value} m/s` },
  ],
  interactions: { damper: (controls) => ({ ...controls, damper: !controls.damper }) },
  checkpoints: [
    'Bánh xe gồm lốp và vành; lốp tiếp xúc mặt đường, giảm va đập và tạo lực bám.',
    'Hệ thống treo gồm bộ phận đàn hồi, bộ phận giảm chấn và bộ phận dẫn hướng, nối đàn hồi bánh xe với thân xe.',
    'Giảm chấn hỏng làm thân xe dao động kéo dài, giảm êm dịu và an toàn.',
  ],
  readouts(state) {
    return [
      { label: 'Mặt đường dưới bánh', value: cm(state.road || 0) },
      { label: 'Bánh xe dịch chuyển', value: cm(state.wheel || 0) },
      { label: 'Thân xe dịch chuyển', value: cm(state.body || 0) },
      { label: 'Lò xo bị nén thêm', value: cm((state.wheel || 0) - (state.body || 0)) },
    ]
  },
  build() {
    const root = new THREE.Group()
    const WHEEL_Y = 0
    const BODY_Y = 1.9

    // Road strip seen from the side: segments that slide past under the wheel
    const roadSegments = Array.from({ length: 60 }, () => {
      const segment = tag(box(0.14, 0.3, 1.4, 0x52525b, 0, 0, 0), 'road')
      root.add(segment)
      return segment
    })
    const wheel = tag(group(ring(0.75, 0.22, 0x111827), alongZ(cylinder(0.55, 0.3, 0xcbd5e1))), 'tyre')
    wheel.children[1].userData.part = 'rim'
    for (let index = 0; index < 5; index += 1) {
      const spoke = tag(box(0.1, 0.5, 0.32, 0x94a3b8, 0, 0.25, 0), 'rim')
      const holder = group(spoke)
      holder.rotation.z = (index / 5) * Math.PI * 2
      wheel.add(holder)
    }
    root.add(wheel)

    const body = tag(group(box(2.8, 0.45, 1.4, seeThrough(0x2563eb, 0.45), -0.6, 0.23, 0), box(1.4, 0.4, 1.2, seeThrough(0x2563eb, 0.3), -0.9, 0.65, 0)), 'body')
    root.add(body)
    const arm = tag(box(1.5, 0.12, 0.25, 0x334155), 'arm')
    root.add(arm)
    const springMesh = tag(coil(0.22, 1, 7, 0.035, 0x16a34a), 'spring')
    root.add(springMesh)
    const damperOuter = tag(cylinder(0.11, 0.7, 0xdc2626), 'damper')
    const damperRod = tag(cylinder(0.04, 0.8, 0xe5e7eb), 'damper')
    root.add(damperOuter, damperRod)

    const annotations = [
      label(wheel, 'Lốp xe', 0.95, -0.2, 0.3),
      label(wheel, 'Vành', 0, 0.2, 0.3, true),
      label(root, 'Lò xo', -1.35, 1.1, 0.3),
      label(root, 'Giảm chấn', -0.4, 1.3, 0.3),
      label(root, 'Đòn treo', -0.85, 0.15, 0.3, true),
      label(body, 'Thân xe', -0.9, 1.25, 0),
    ]

    let state = { body: 0, bodyV: 0, wheel: 0, wheelV: 0 }
    let distance = 0
    let lastTime = 0
    let rolled = 0
    return {
      root,
      annotations,
      floorY: -1.1,
      framing: { center: new THREE.Vector3(-0.4, 0.9, 0), width: 5.8, height: 4.8, direction: new THREE.Vector3(0.25, 0.2, 1).normalize() },
      update(time, controls) {
        const dt = Math.min(0.05, Math.max(0, time - lastTime))
        lastTime = time
        const profile = ROADS[controls.road] || ROADS.flat
        distance += controls.speed * dt
        const at = (x) => profile(((x % ROAD_LENGTH) + ROAD_LENGTH) % ROAD_LENGTH - 2)
        const road = at(distance)
        state = stepSuspension(state, dt, { damper: controls.damper, roadM: road })
        rolled += (controls.speed * dt) / 0.97 // the tyre radius in metres
        roadSegments.forEach((segment, index) => {
          const x = (index - 30) * 0.14
          segment.position.set(x, -1.12 + at(distance + x / 1.0) * SHOW, 0) // top surface where the tyre touches
        })
        const wheelY = WHEEL_Y + state.wheel * SHOW
        const bodyY = BODY_Y + state.body * SHOW
        wheel.position.set(0, wheelY, 0)
        wheel.rotation.z = -rolled
        body.position.set(0, bodyY, 0) // the body's floor sits on top of the spring
        // Lower arm from a pivot on the body to the wheel hub
        const pivot = new THREE.Vector3(-1.4, bodyY - 1.55, 0)
        const hub = new THREE.Vector3(0, wheelY, 0)
        arm.position.copy(pivot).add(hub).multiplyScalar(0.5)
        arm.scale.x = pivot.distanceTo(hub) / 1.5
        arm.rotation.z = Math.atan2(hub.y - pivot.y, hub.x - pivot.x)
        // Spring and damper stand on the lower arm, inboard of the wheel, and hold up the body
        const armY = (x) => pivot.y + ((hub.y - pivot.y) * (x - pivot.x)) / (hub.x - pivot.x)
        const top = bodyY - 0.02
        const springLow = armY(-1.05)
        springMesh.position.set(-1.05, springLow, 0)
        springMesh.scale.y = Math.max(0.2, top - springLow)
        const damperLow = armY(-0.65)
        damperOuter.position.set(-0.65, damperLow + 0.35, 0)
        damperRod.position.set(-0.65, (damperLow + 0.7 + top) / 2, 0)
        damperRod.scale.y = Math.max(0.1, (top - damperLow - 0.7) / 0.8)
        damperOuter.traverse((child) => { if (child.isMesh) child.material.color.setHex(controls.damper ? 0xdc2626 : 0x78716c) })
        return { ...state, road }
      },
    }
  },
}
