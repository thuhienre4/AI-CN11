import * as THREE from 'three'
import { crankSliderPosition, fourStrokeState } from '../utils/fourStrokeCycle'

const TDC_PIN_Y = 1.45
const BDC_PIN_Y = 0.15
const CRANK_CENTER_Y = -1.12
const CRANK_RADIUS = (TDC_PIN_Y - BDC_PIN_Y) / 2
const ROD_LENGTH = (TDC_PIN_Y + BDC_PIN_Y) / 2 - CRANK_CENTER_Y

const DECK_Y = 2.0
const HEAD_TOP_Y = 2.42
// A taller crown leaves a smaller combustion chamber, which gives the diesel its higher compression ratio.
const CROWN_ABOVE_PIN = { gasoline: 0.42, diesel: 0.46 }
const SKIRT_BELOW_PIN = 0.3
const PISTON_RADIUS = 0.6
const BORE_RADIUS = 0.63

const VALVE_X = 0.3
const VALVE_HEAD_RADIUS = 0.24
const VALVE_HEAD_THICKNESS = 0.05
const MAX_VALVE_LIFT = 0.2
const STEM_LENGTH = 1.0
const RETAINER_HEIGHT = 0.84
const STEM_TOP_Y = DECK_Y + STEM_LENGTH

// Valve train of SGK Hình 19.6: cam in the block, then tappet, push rod, rocker arm and valve. The figure
// shows one valve; here each valve gets its own cam on its own side so that neither hides the other.
const CAM_BASE_RADIUS = 0.14
const CAM_X = 1.15
const CAM_Y = -0.65
const LOBE_Z = -0.3
const TAPPET_HEIGHT = 0.24
const PUSHROD_BOTTOM_Y = CAM_Y + CAM_BASE_RADIUS + TAPPET_HEIGHT
const ROCKER_THICKNESS = 0.09
const ROCKER_SWING = MAX_VALVE_LIFT / 2
const ROCKER_PIVOT_Y = STEM_TOP_Y + ROCKER_THICKNESS / 2 - ROCKER_SWING
const ROCKER_PIVOT_X = (VALVE_X + CAM_X) / 2
const ROCKER_PIVOT_Z = LOBE_Z / 2
const ROCKER_HALF_LENGTH = Math.hypot(CAM_X - ROCKER_PIVOT_X, LOBE_Z - ROCKER_PIVOT_Z)
const PUSHROD_LENGTH = ROCKER_PIVOT_Y - ROCKER_SWING - ROCKER_THICKNESS / 2 - PUSHROD_BOTTOM_Y

// The chain drive: a cam sprocket twice the size of the crank sprocket turns at half crank speed.
const CHAIN_Z = -0.75
const CRANK_SPROCKET_RADIUS = 0.2
const CAM_SPROCKET_RADIUS = CRANK_SPROCKET_RADIUS * 2
const CHAIN_LINKS = 80

// Cam angle at full lift. The cam turns once per cycle, so it runs at half crank speed.
const INTAKE_CAM_PEAK = Math.PI / 4
const EXHAUST_CAM_PEAK = (7 * Math.PI) / 4

// The front of every shell is cut away so that the moving parts stay visible.
const CUT_START = THREE.MathUtils.degToRad(55)
const CUT_LENGTH = THREE.MathUtils.degToRad(250)

const PARTICLES_PER_PORT = 14
const SPRAY_LENGTH = 0.26
const COMBUSTION_END_PROGRESS = 0.62

export const engineGeometry = (fuel = 'diesel') => {
  const crownAbovePin = CROWN_ABOVE_PIN[fuel]
  const clearance = DECK_Y - (TDC_PIN_Y + crownAbovePin)
  const stroke = TDC_PIN_Y - BDC_PIN_Y
  return {
    deckY: DECK_Y,
    crownAbovePin,
    clearance,
    stroke,
    crankRadius: CRANK_RADIUS,
    crankCenterY: CRANK_CENTER_Y,
    rodLength: ROD_LENGTH,
    maxValveLift: MAX_VALVE_LIFT,
    compressionRatio: (stroke + clearance) / clearance,
  }
}

// Names and roles follow SGK Công nghệ 11 - Công nghệ cơ khí (Kết nối tri thức), Bài 17 to 19.
export const ENGINE_PARTS = {
  piston: { name: 'Pít tông', role: 'Gồm đỉnh, đầu và thân. Cùng xi lanh và nắp máy tạo không gian làm việc; nhận lực khí cháy ở kì nổ và nhận lực từ trục khuỷu ở các kì còn lại.' },
  pistonRing: { name: 'Xéc măng', role: 'Lắp trong rãnh ở đầu pít tông. Hai xéc măng khí (màu tối) ngăn khí cháy lọt xuống các te; xéc măng dầu (màu vàng) ngăn dầu từ các te lọt lên buồng cháy.' },
  pistonPin: { name: 'Chốt pít tông', role: 'Lắp qua lỗ ngang ở thân pít tông, nối pít tông với đầu nhỏ thanh truyền.' },
  rod: { name: 'Thanh truyền', role: 'Gồm đầu nhỏ, thân và đầu to, truyền lực giữa pít tông và trục khuỷu. Thân có rãnh dọc nên tiết diện hình chữ I, giúp tăng độ cứng.' },
  crankshaft: { name: 'Trục khuỷu', role: 'Nhận lực từ thanh truyền tạo mô men quay; ở các kì không sinh công lại dẫn động pít tông. Gồm đầu trục, cổ khuỷu, chốt khuỷu, má khuỷu, đối trọng và đuôi trục.' },
  crankPin: { name: 'Chốt khuỷu', role: 'Nơi lắp đầu to thanh truyền; bán kính quay R tính từ tâm cổ khuỷu đến tâm chốt khuỷu, hành trình S = 2R.' },
  counterweight: { name: 'Đối trọng', role: 'Gắn với má khuỷu để cân bằng chuyển động của động cơ.' },
  flywheel: { name: 'Bánh đà', role: 'Lắp ở đuôi trục khuỷu, giữ độ không đều của tốc độ quay trong giới hạn cho phép, đưa pít tông qua các kì không sinh công.' },
  cylinder: { name: 'Xi lanh', role: 'Dẫn hướng pít tông; cùng nắp máy và đỉnh pít tông tạo thành không gian làm việc.' },
  block: { name: 'Thân máy', role: 'Nơi lắp xi lanh và hầu hết các cụm chi tiết của động cơ, gồm cả trục khuỷu và trục cam.' },
  crankcase: { name: 'Các te', role: 'Chứa dầu bôi trơn để bôi trơn các chi tiết ma sát của động cơ.' },
  head: { name: 'Nắp máy', role: 'Cùng xi lanh và đỉnh pít tông tạo thành buồng cháy; là nơi bố trí bu gi hoặc vòi phun, đường nạp và đường thải.' },
  intakeValve: { name: 'Xu páp nạp', role: 'Mở ở kì nạp để hòa khí hoặc không khí vào xi lanh, đóng ở các kì còn lại.' },
  exhaustValve: { name: 'Xu páp thải', role: 'Mở ở kì thải để khí thải ra ngoài, đóng ở các kì còn lại.' },
  spring: { name: 'Lò xo xu páp', role: 'Bị nén khi xu páp mở; khi vấu cam đi qua, lực đàn hồi đóng xu páp lại.' },
  camshaft: { name: 'Trục cam', role: 'Đặt trong thân máy. Vấu cam tác động lên con đội để mở xu páp đúng thời điểm; số vòng quay bằng 1/2 số vòng quay trục khuỷu.' },
  timingChain: { name: 'Bộ truyền xích', role: 'Trục khuỷu dẫn động trục cam. Đĩa xích trên trục cam lớn gấp đôi đĩa xích trên trục khuỷu nên trục cam quay chậm bằng một nửa.' },
  tappet: { name: 'Con đội', role: 'Nhận tác động của vấu cam rồi đẩy đũa đẩy đi lên.' },
  pushrod: { name: 'Đũa đẩy', role: 'Truyền chuyển động từ con đội lên một đầu cò mổ.' },
  rocker: { name: 'Cò mổ', role: 'Khi một đầu bị đũa đẩy nâng lên, đầu còn lại nén lò xo và ép xu páp đi xuống để mở cửa nạp hoặc cửa thải.' },
  intakePort: { name: 'Đường nạp', role: 'Dẫn không khí hoặc hòa khí vào xi lanh khi xu páp nạp mở.' },
  exhaustPort: { name: 'Đường thải', role: 'Dẫn khí thải ra ngoài khi xu páp thải mở.' },
  injector: { name: 'Vòi phun', role: 'Cuối kì nén, khi pít tông gần đến ĐCT, phun nhiên liệu vào xi lanh với áp suất cao; hỗn hợp tự cháy mà không cần tia lửa điện.' },
  sparkPlug: { name: 'Bu gi', role: 'Phóng tia lửa điện đốt cháy hòa khí vào cuối kì nén, khi pít tông gần đến ĐCT.' },
}

const metal = (color, options = {}) =>
  new THREE.MeshStandardMaterial({ color, metalness: 0.45, roughness: 0.42, ...options })

const glass = (color, opacity) =>
  new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    metalness: 0.1,
    roughness: 0.6,
  })

const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
  const item = new THREE.Mesh(geometry, material)
  item.position.set(x, y, z)
  return item
}

const axisZ = (item) => {
  item.rotation.x = Math.PI / 2
  return item
}

const belongsTo = (object, part, { pickLast = false } = {}) => {
  object.traverse((child) => {
    if (child.isMesh) {
      child.userData.part = part
      child.userData.pickLast = pickLast
    }
  })
  return object
}

function camLobeGeometry() {
  const shape = new THREE.Shape()
  const steps = 96
  for (let step = 0; step <= steps; step += 1) {
    const angle = -Math.PI + (step / steps) * Math.PI * 2 // measured from the nose
    const position = (angle + Math.PI / 4) / (Math.PI / 2)
    const lift = position >= 0 && position <= 1 ? Math.sin(Math.PI * position) ** 2 : 0
    const radius = CAM_BASE_RADIUS + lift * MAX_VALVE_LIFT
    const x = radius * Math.sin(angle)
    const y = radius * Math.cos(angle) // the nose points up at rotation 0
    if (step === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false })
  geometry.translate(0, 0, -0.08)
  return geometry
}

function springGeometry() {
  const points = []
  const turns = 6
  for (let step = 0; step <= turns * 24; step += 1) {
    const angle = (step / 24) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * 0.1, step / (turns * 24), Math.sin(angle) * 0.1))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 160, 0.012, 6, false)
}

function createValve(x, color, part) {
  const valve = new THREE.Group()
  valve.add(mesh(new THREE.CylinderGeometry(VALVE_HEAD_RADIUS, VALVE_HEAD_RADIUS, VALVE_HEAD_THICKNESS, 40),
    metal(color), 0, VALVE_HEAD_THICKNESS / 2, 0))
  valve.add(mesh(new THREE.CylinderGeometry(0.04, VALVE_HEAD_RADIUS - 0.02, 0.14, 32), metal(color),
    0, VALVE_HEAD_THICKNESS + 0.07, 0))
  valve.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, STEM_LENGTH, 16), metal(color), 0, STEM_LENGTH / 2, 0))
  valve.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 24), metal(0x64748b), 0, RETAINER_HEIGHT, 0))
  belongsTo(valve, part)
  valve.position.set(x, DECK_Y, 0)
  return valve
}

function createPiston(crownAbovePin) {
  const piston = new THREE.Group()
  const skirtHeight = crownAbovePin - 0.15 + SKIRT_BELOW_PIN
  const body = metal(0x9fb2c7, { side: THREE.DoubleSide })
  piston.add(mesh(new THREE.CylinderGeometry(PISTON_RADIUS, PISTON_RADIUS, 0.15, 56), metal(0x7c93ad),
    0, crownAbovePin - 0.075, 0))
  piston.add(mesh(
    new THREE.CylinderGeometry(PISTON_RADIUS, PISTON_RADIUS, skirtHeight, 56, 1, true, CUT_START, CUT_LENGTH),
    body, 0, crownAbovePin - 0.15 - skirtHeight / 2, 0,
  ))
  belongsTo(piston, 'piston')
  // Two compression rings above one oil ring
  ;[[0.2, 0x1e293b], [0.28, 0x1e293b], [0.36, 0xca8a04]].forEach(([depth, color]) => {
    piston.add(belongsTo(mesh(
      new THREE.CylinderGeometry(PISTON_RADIUS + 0.008, PISTON_RADIUS + 0.008, 0.028, 56, 1, true, CUT_START, CUT_LENGTH),
      metal(color, { side: THREE.DoubleSide }), 0, crownAbovePin - depth, 0,
    ), 'pistonRing'))
  })
  piston.add(belongsTo(axisZ(mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.06, 24), metal(0xe2e8f0))), 'pistonPin'))
  return piston
}

function createRod() {
  const rod = new THREE.Group()
  const steel = metal(0xea7a1f)
  const shank = ROD_LENGTH - 0.3
  // I-section: a thin web between two flanges
  rod.add(mesh(new THREE.BoxGeometry(0.12, shank, 0.035), steel, 0, ROD_LENGTH / 2, 0))
  ;[-0.06, 0.06].forEach((x) => rod.add(mesh(new THREE.BoxGeometry(0.03, shank, 0.11), steel, x, ROD_LENGTH / 2, 0)))
  rod.add(mesh(new THREE.TorusGeometry(0.18, 0.06, 14, 40), steel))
  rod.add(mesh(new THREE.TorusGeometry(0.115, 0.04, 12, 32), steel, 0, ROD_LENGTH, 0))
  return belongsTo(rod, 'rod')
}

function createSprocket(radius, z) {
  const sprocket = new THREE.Group()
  sprocket.add(axisZ(mesh(new THREE.CylinderGeometry(radius, radius, 0.05, 40), metal(0x52525b))))
  // The mark makes the slower turn of the cam sprocket easy to see
  sprocket.add(mesh(new THREE.BoxGeometry(radius * 0.7, 0.04, 0.06), metal(0xfacc15), radius * 0.55, 0, 0))
  sprocket.position.z = z
  return belongsTo(sprocket, 'timingChain')
}

function createCrankshaft() {
  const crank = new THREE.Group()
  const steel = metal(0x475569)
  crank.add(axisZ(mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.9, 28), steel)))
  ;[-0.31, 0.31].forEach((z) => {
    const webLength = CRANK_RADIUS + 0.2 + 0.3
    crank.add(mesh(new THREE.BoxGeometry(webLength, 0.42, 0.12), steel, (CRANK_RADIUS + 0.2 - 0.3) / 2, 0, z))
  })
  belongsTo(crank, 'crankshaft')
  crank.add(belongsTo(axisZ(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 28), metal(0x38bdf8), CRANK_RADIUS, 0, 0)), 'crankPin'))
  ;[-0.31, 0.31].forEach((z) => {
    crank.add(belongsTo(axisZ(mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 0.12, 40, 1, false, Math.PI, Math.PI),
      metal(0x334155), 0, 0, z,
    )), 'counterweight'))
  })
  crank.add(createSprocket(CRANK_SPROCKET_RADIUS, CHAIN_Z))

  const flywheel = new THREE.Group()
  flywheel.add(axisZ(mesh(new THREE.CylinderGeometry(1.02, 1.02, 0.14, 64), metal(0x1f2937))))
  flywheel.add(mesh(new THREE.BoxGeometry(0.34, 0.1, 0.16), metal(0xfacc15), 0.8, 0, 0))
  flywheel.position.z = -1.03
  crank.add(belongsTo(flywheel, 'flywheel'))
  crank.position.y = CRANK_CENTER_Y
  return crank
}

function createCam(x, material, peak) {
  const cam = new THREE.Group()
  cam.add(mesh(camLobeGeometry(), material, 0, 0, LOBE_Z))
  cam.add(axisZ(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 18), metal(0x64748b), 0, 0, -0.4)))
  belongsTo(cam, 'camshaft')
  cam.add(createSprocket(CAM_SPROCKET_RADIUS, CHAIN_Z))
  cam.position.set(x, CAM_Y, 0)
  cam.userData.peak = peak
  return cam
}

function createTappet(x, color) {
  const tappet = belongsTo(mesh(new THREE.CylinderGeometry(0.09, 0.09, TAPPET_HEIGHT, 24), metal(color)), 'tappet')
  tappet.position.set(x, PUSHROD_BOTTOM_Y - TAPPET_HEIGHT / 2, LOBE_Z)
  return tappet
}

function createPushrod(x) {
  const pushrod = belongsTo(mesh(new THREE.CylinderGeometry(0.028, 0.028, PUSHROD_LENGTH, 14), metal(0xa1a1aa)), 'pushrod')
  pushrod.position.set(x, PUSHROD_BOTTOM_Y + PUSHROD_LENGTH / 2, LOBE_Z)
  return pushrod
}

// The local +x end sits on the push rod and the -x end presses the valve stem.
function createRocker(side, color) {
  const mount = new THREE.Group()
  mount.position.set(side * ROCKER_PIVOT_X, ROCKER_PIVOT_Y, ROCKER_PIVOT_Z)
  mount.rotation.y = Math.atan2(-(LOBE_Z - ROCKER_PIVOT_Z), side * (CAM_X - ROCKER_PIVOT_X))

  const arm = new THREE.Group()
  arm.add(mesh(new THREE.BoxGeometry(ROCKER_HALF_LENGTH * 2 + 0.08, ROCKER_THICKNESS, 0.09), metal(color)))
  arm.add(axisZ(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.13, 20), metal(0x64748b))))
  mount.add(arm)
  belongsTo(mount, 'rocker')

  const post = mesh(new THREE.CylinderGeometry(0.03, 0.03, ROCKER_PIVOT_Y - HEAD_TOP_Y, 12), metal(0x64748b),
    side * ROCKER_PIVOT_X, (ROCKER_PIVOT_Y + HEAD_TOP_Y) / 2, ROCKER_PIVOT_Z)
  return { mount, arm, post: belongsTo(post, 'rocker') }
}

// Outer outline around the three sprockets, walked clockwise as seen from the front.
function chainLoop() {
  const sprockets = [[-CAM_X, CAM_Y, CAM_SPROCKET_RADIUS], [CAM_X, CAM_Y, CAM_SPROCKET_RADIUS], [0, CRANK_CENTER_Y, CRANK_SPROCKET_RADIUS]]
  const points = sprockets.flatMap(([x, y, radius]) => Array.from({ length: 72 }, (_, step) => {
    const angle = (step / 72) * Math.PI * 2
    return new THREE.Vector2(x + radius * Math.cos(angle), y + radius * Math.sin(angle))
  })).sort((a, b) => a.x - b.x || a.y - b.y)

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
  const halfHull = (list) => list.reduce((hull, point) => {
    while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], point) >= 0) hull.pop()
    hull.push(point)
    return hull
  }, [])
  const upper = halfHull(points)
  const lower = halfHull([...points].reverse())
  const outline = [...upper.slice(0, -1), ...lower.slice(0, -1)]

  const loop = new THREE.CurvePath()
  outline.forEach((point, index) => {
    const next = outline[(index + 1) % outline.length]
    loop.add(new THREE.LineCurve3(new THREE.Vector3(point.x, point.y, CHAIN_Z), new THREE.Vector3(next.x, next.y, CHAIN_Z)))
  })
  return loop
}

function createPort(points, color, part) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, 0)))
  const tube = mesh(new THREE.TubeGeometry(curve, 48, 0.14, 18, false), glass(color, 0.3))
  return { curve, tube: belongsTo(tube, part) }
}

function createParticles(color) {
  const geometry = new THREE.SphereGeometry(0.04, 10, 10)
  const material = new THREE.MeshBasicMaterial({ color })
  return Array.from({ length: PARTICLES_PER_PORT }, () => {
    const particle = mesh(geometry, material)
    particle.visible = false
    return particle
  })
}

function addStrokeScale(root, crownAbovePin) {
  const ink = new THREE.MeshBasicMaterial({ color: 0x0f172a })
  const tdc = TDC_PIN_Y + crownAbovePin
  const bdc = BDC_PIN_Y + crownAbovePin
  const x = -1.28
  root.add(mesh(new THREE.BoxGeometry(0.025, tdc - bdc, 0.025), ink, x, (tdc + bdc) / 2, 0))
  ;[tdc, bdc].forEach((y) => root.add(mesh(new THREE.BoxGeometry(0.66, 0.02, 0.02), ink, x + 0.24, y, 0)))
  return { tdc, bdc, x }
}

const anchorAt = (parent, x, y, z) => {
  const anchor = new THREE.Object3D()
  anchor.position.set(x, y, z)
  parent.add(anchor)
  return anchor
}

export function createFourStrokeEngine({ fuel = 'diesel' } = {}) {
  const root = new THREE.Group()
  const isDiesel = fuel === 'diesel'
  const crownAbovePin = CROWN_ABOVE_PIN[fuel]

  // Stationary structure
  const linerHeight = DECK_Y + 0.25
  const linerY = DECK_Y - linerHeight / 2
  root.add(belongsTo(mesh(
    new THREE.CylinderGeometry(BORE_RADIUS, BORE_RADIUS, linerHeight, 56, 1, true, CUT_START, CUT_LENGTH),
    glass(0x94a3b8, 0.3), 0, linerY, 0,
  ), 'cylinder', { pickLast: true }))
  root.add(belongsTo(mesh(
    new THREE.CylinderGeometry(0.92, 0.92, linerHeight, 56, 1, true, CUT_START, CUT_LENGTH),
    glass(0x64748b, 0.26), 0, linerY, 0,
  ), 'block', { pickLast: true }))
  root.add(belongsTo(mesh(new THREE.BoxGeometry(2.1, HEAD_TOP_Y - DECK_Y, 1.5), glass(0x475569, 0.24),
    0, (DECK_Y + HEAD_TOP_Y) / 2, 0), 'head', { pickLast: true }))
  const blockBottomY = DECK_Y - linerHeight
  const baseY = CRANK_CENTER_Y - 1.32
  root.add(belongsTo(mesh(new THREE.BoxGeometry(3.2, blockBottomY - CRANK_CENTER_Y, 1.8), glass(0x94a3b8, 0.08),
    0, (blockBottomY + CRANK_CENTER_Y) / 2, -0.05), 'block', { pickLast: true }))
  root.add(belongsTo(mesh(new THREE.BoxGeometry(3.2, CRANK_CENTER_Y - baseY, 1.8), glass(0xca8a04, 0.1),
    0, (CRANK_CENTER_Y + baseY) / 2, -0.05), 'crankcase', { pickLast: true }))
  root.add(mesh(new THREE.BoxGeometry(3.4, 0.14, 2.6), metal(0xcbd5e1), 0, baseY, 0))

  // Moving parts
  const piston = createPiston(crownAbovePin)
  const rod = createRod()
  const crank = createCrankshaft()
  const intakeValve = createValve(-VALVE_X, 0x0ea5e9, 'intakeValve')
  const exhaustValve = createValve(VALVE_X, 0xf97316, 'exhaustValve')
  const intakeCam = createCam(-CAM_X, metal(0x0284c7), INTAKE_CAM_PEAK)
  const exhaustCam = createCam(CAM_X, metal(0xea580c), EXHAUST_CAM_PEAK)
  root.add(piston, rod, crank, intakeValve, exhaustValve, intakeCam, exhaustCam)

  const valveTrains = [
    { side: -1, color: 0x0284c7, valve: intakeValve, liftOf: (state) => state.intakeLift },
    { side: 1, color: 0xea580c, valve: exhaustValve, liftOf: (state) => state.exhaustLift },
  ].map(({ side, color, valve, liftOf }) => {
    const tappet = createTappet(side * CAM_X, color)
    const pushrod = createPushrod(side * CAM_X)
    const { mount, arm, post } = createRocker(side, color)
    root.add(tappet, pushrod, mount, post)
    return { valve, liftOf, tappet, pushrod, arm, tappetY: tappet.position.y, pushrodY: pushrod.position.y }
  })

  const chain = chainLoop()
  const chainLength = chain.getLength()
  const linkGeometry = new THREE.BoxGeometry(0.07, 0.07, 0.04)
  const linkMaterial = metal(0x27272a)
  const chainLinks = Array.from({ length: CHAIN_LINKS }, () => belongsTo(mesh(linkGeometry, linkMaterial), 'timingChain'))
  root.add(...chainLinks)

  const spring = springGeometry()
  const springs = [-VALVE_X, VALVE_X].map((x) => {
    const coil = belongsTo(mesh(spring, metal(0x334155), x, HEAD_TOP_Y, 0), 'spring')
    root.add(coil)
    return coil
  })

  // Gas path
  const intakePort = createPort([[-2.15, 2.62], [-1.1, 2.5], [-VALVE_X - 0.1, 2.3], [-VALVE_X, 2.04]], 0x38bdf8, 'intakePort')
  const exhaustPort = createPort([[VALVE_X, 2.04], [VALVE_X + 0.1, 2.3], [1.1, 2.5], [2.15, 2.62]], 0xfb923c, 'exhaustPort')
  root.add(intakePort.tube, exhaustPort.tube)
  const intakeParticles = createParticles(isDiesel ? 0x0ea5e9 : 0x10b981)
  const exhaustParticles = createParticles(0x64748b)
  root.add(...intakeParticles, ...exhaustParticles)

  const gas = mesh(new THREE.CylinderGeometry(PISTON_RADIUS - 0.012, PISTON_RADIUS - 0.012, 1, 48),
    new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }))
  root.add(gas)

  const flame = mesh(new THREE.SphereGeometry(0.34, 28, 28),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, depthWrite: false }), 0, DECK_Y - 0.12, 0)
  flame.scale.y = 0.5
  root.add(flame)

  // Ignition: diesel sprays fuel into hot air, petrol fires a spark
  const ignition = new THREE.Group()
  let ignitionEffect
  if (isDiesel) {
    ignition.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.72, 20), metal(0xeab308), 0, DECK_Y + 0.38, 0))
    ignition.add(mesh(new THREE.ConeGeometry(0.075, 0.12, 20), metal(0xca8a04), 0, DECK_Y - 0.01, 0))
    ignition.children[1].rotation.x = Math.PI
    belongsTo(ignition, 'injector')
    ignitionEffect = mesh(new THREE.ConeGeometry(0.34, SPRAY_LENGTH, 28, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xfde047, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
      0, DECK_Y - 0.17, 0)
  } else {
    ignition.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 20), metal(0xf8fafc, { metalness: 0.05 }), 0, DECK_Y + 0.42, 0))
    ignition.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 12), metal(0x475569), 0, DECK_Y + 0.04, 0))
    belongsTo(ignition, 'sparkPlug')
    ignitionEffect = mesh(new THREE.SphereGeometry(0.11, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, depthWrite: false }), 0, DECK_Y - 0.04, 0)
  }
  root.add(ignition, ignitionEffect)

  const scale = addStrokeScale(root, crownAbovePin)

  const annotations = [
    { anchor: anchorAt(piston, 0.7, 0.2, 0), label: 'Pít tông' },
    { anchor: anchorAt(rod, 0.15, ROD_LENGTH * 0.45, 0), label: 'Thanh truyền' },
    { anchor: anchorAt(root, 0.05, CRANK_CENTER_Y - 0.62, 0.8), label: 'Trục khuỷu' },
    { anchor: anchorAt(root, -0.62, 3.32, 0), label: 'Xu páp nạp' },
    { anchor: anchorAt(root, 0.62, 3.32, 0), label: 'Xu páp thải' },
    { anchor: anchorAt(root, 0, 3.72, 0), label: isDiesel ? 'Vòi phun' : 'Bu gi' },
    { anchor: anchorAt(root, CAM_X + 0.1, 3.05, LOBE_Z), label: 'Cò mổ' },
    { anchor: anchorAt(root, CAM_X + 0.05, 1.2, LOBE_Z), label: 'Đũa đẩy' },
    { anchor: anchorAt(root, -CAM_X - 0.3, PUSHROD_BOTTOM_Y - 0.1, LOBE_Z), label: 'Con đội' },
    { anchor: anchorAt(root, -CAM_X - 0.42, CAM_Y - 0.3, LOBE_Z), label: 'Trục cam' },
    { anchor: anchorAt(root, 0.72, CRANK_CENTER_Y - 0.42, CHAIN_Z), label: 'Xích' },
    { anchor: anchorAt(root, scale.x - 0.1, scale.tdc + 0.02, 0), label: 'ĐCT' },
    { anchor: anchorAt(root, scale.x - 0.1, scale.bdc + 0.02, 0), label: 'ĐCD' },
    { anchor: anchorAt(root, scale.x - 0.1, (scale.tdc + scale.bdc) / 2, 0), label: 'S' },
  ].map((item) => ({ ...item, layerId: 'all', note: '', compact: true }))

  const freshColor = new THREE.Color(isDiesel ? 0x7dd3fc : 0x6ee7b7)
  const hotColor = new THREE.Color(0xfdba74)
  const burnColor = new THREE.Color(0xf97316)
  const spentColor = new THREE.Color(0x94a3b8)

  const paintGas = (state) => {
    const strokeProgress = (state.progress % 0.25) / 0.25
    if (state.strokeIndex === 0) {
      gas.material.color.copy(freshColor)
      gas.material.opacity = 0.22 + strokeProgress * 0.14
    } else if (state.strokeIndex === 1) {
      gas.material.color.copy(freshColor).lerp(hotColor, strokeProgress)
      gas.material.opacity = 0.36 + strokeProgress * 0.3
    } else if (state.strokeIndex === 2) {
      gas.material.color.copy(burnColor).lerp(spentColor, strokeProgress)
      gas.material.opacity = 0.68 - strokeProgress * 0.32
    } else {
      gas.material.color.copy(spentColor)
      gas.material.opacity = 0.36 - strokeProgress * 0.16
    }
  }

  const moveParticles = (particles, curve, active, strokeProgress) => {
    particles.forEach((particle, index) => {
      particle.visible = active
      if (active) particle.position.copy(curve.getPoint((strokeProgress * 2.4 + index / particles.length) % 1))
    })
  }

  const update = (cyclePhase) => {
    const state = fourStrokeState(cyclePhase)
    const strokeProgress = (state.progress % 0.25) / 0.25
    const { crankAngle, crankPinX, crankPinY, pistonPinY } = crankSliderPosition({
      cyclePhase,
      crankRadius: CRANK_RADIUS,
      crankCenterY: CRANK_CENTER_Y,
      rodLength: ROD_LENGTH,
    })

    crank.rotation.z = crankAngle
    piston.position.y = pistonPinY
    rod.position.set(crankPinX, crankPinY, 0)
    rod.rotation.z = Math.atan2(crankPinX, pistonPinY - crankPinY)

    const camAngle = cyclePhase / 2
    intakeCam.rotation.z = intakeCam.userData.peak - camAngle
    exhaustCam.rotation.z = exhaustCam.userData.peak - camAngle

    valveTrains.forEach(({ valve, liftOf, tappet, pushrod, arm, tappetY, pushrodY }, index) => {
      const lift = liftOf(state)
      const travel = lift * MAX_VALVE_LIFT
      tappet.position.y = tappetY + travel
      pushrod.position.y = pushrodY + travel
      arm.rotation.z = Math.asin(((2 * lift - 1) * ROCKER_SWING) / ROCKER_HALF_LENGTH)
      valve.position.y = DECK_Y - travel
      springs[index].scale.y = DECK_Y + RETAINER_HEIGHT - travel - HEAD_TOP_Y
    })

    // Chain speed equals the rim speed of the crank sprocket
    const chainTravel = (cyclePhase * CRANK_SPROCKET_RADIUS) / chainLength
    chainLinks.forEach((link, index) => {
      link.position.copy(chain.getPoint((chainTravel + index / CHAIN_LINKS) % 1))
    })

    const crownY = pistonPinY + crownAbovePin
    gas.scale.y = Math.max(DECK_Y - crownY, 0.001)
    gas.position.y = (DECK_Y + crownY) / 2
    paintGas(state)

    moveParticles(intakeParticles, intakePort.curve, state.intakeOpen, strokeProgress)
    moveParticles(exhaustParticles, exhaustPort.curve, state.exhaustOpen, strokeProgress)

    const burn = state.combustionActive ? (state.progress - 0.5) / (COMBUSTION_END_PROGRESS - 0.5) : -1
    flame.visible = burn >= 0
    if (flame.visible) {
      const size = 0.7 + burn * 1.05
      flame.scale.set(size, size * 0.55, size)
      flame.position.y = crownY + (DECK_Y - crownY) / 2
      flame.material.opacity = 0.9 * (1 - burn * 0.75)
    }

    // Fuel enters, or the spark fires, at the very end of compression
    const ignitionWindow = state.progress >= 0.46 && state.progress < 0.505
    ignitionEffect.visible = ignitionWindow
    if (ignitionWindow) ignitionEffect.material.opacity = 0.85
    if (ignitionWindow && isDiesel) {
      // The spray stops at the piston crown
      const reach = Math.min(DECK_Y - crownY, SPRAY_LENGTH)
      ignitionEffect.scale.y = reach / SPRAY_LENGTH
      ignitionEffect.position.y = DECK_Y - reach / 2
    }
  }

  const highlightPart = (part) => {
    root.traverse((child) => {
      if (!child.isMesh || !child.material.emissive || child.userData.part === undefined) return
      child.material.emissive.setHex(child.userData.part === part ? 0x2563eb : 0x000000)
      child.material.emissiveIntensity = child.userData.part === part ? 0.55 : 0
    })
  }

  update(0)

  return {
    root,
    animated: [],
    annotations,
    update,
    highlightPart,
    framing: { center: new THREE.Vector3(0, 0.6, 0), width: 5.4, height: 7.3 },
    moving: { piston, rod, crank, intakeValve, exhaustValve, intakeCam, exhaustCam, gas, valveTrains, chainLinks },
  }
}

export function pickEnginePart(intersections) {
  const parts = intersections.filter((hit) => hit.object.userData.part)
  return (parts.find((hit) => !hit.object.userData.pickLast) || parts[0])?.object.userData.part ?? null
}
