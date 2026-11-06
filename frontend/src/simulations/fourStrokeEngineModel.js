import * as THREE from 'three'
import { crankSliderPosition, fourStrokeState } from '../utils/fourStrokeCycle'

const TDC_PIN_Y = 1.45
const BDC_PIN_Y = 0.15
const CRANK_CENTER_Y = -1.12
const CRANK_RADIUS = (TDC_PIN_Y - BDC_PIN_Y) / 2
const ROD_LENGTH = (TDC_PIN_Y + BDC_PIN_Y) / 2 - CRANK_CENTER_Y

const DECK_Y = 2.0
const HEAD_TOP_Y = 2.42
const CROWN_ABOVE_PIN = 0.42
const SKIRT_BELOW_PIN = 0.3
const PISTON_RADIUS = 0.6
const BORE_RADIUS = 0.63

const VALVE_X = 0.3
const VALVE_HEAD_RADIUS = 0.24
const VALVE_HEAD_THICKNESS = 0.05
const MAX_VALVE_LIFT = 0.2
const STEM_LENGTH = 1.0
const RETAINER_HEIGHT = 0.84
const CAM_BASE_RADIUS = 0.14
const CAM_CENTER_Y = DECK_Y + STEM_LENGTH + CAM_BASE_RADIUS

// Cam angle at full lift. The cam turns once per cycle, so it runs at half crank speed.
const INTAKE_CAM_PEAK = Math.PI / 4
const EXHAUST_CAM_PEAK = (7 * Math.PI) / 4

// The front of every shell is cut away so that the moving parts stay visible.
const CUT_START = THREE.MathUtils.degToRad(55)
const CUT_LENGTH = THREE.MathUtils.degToRad(250)

const PARTICLES_PER_PORT = 14
const COMBUSTION_END_PROGRESS = 0.62

export const ENGINE_GEOMETRY = {
  deckY: DECK_Y,
  crownAbovePin: CROWN_ABOVE_PIN,
  crankRadius: CRANK_RADIUS,
  crankCenterY: CRANK_CENTER_Y,
  rodLength: ROD_LENGTH,
  maxValveLift: MAX_VALVE_LIFT,
}

export const ENGINE_PARTS = {
  piston: { name: 'Piston', role: 'Nhận áp lực khí cháy, chuyển động tịnh tiến trong xi lanh giữa ĐCT và ĐCD.' },
  pistonPin: { name: 'Chốt piston', role: 'Nối piston với đầu nhỏ thanh truyền, cho thanh truyền lắc quanh chốt.' },
  rod: { name: 'Thanh truyền', role: 'Truyền lực giữa piston và trục khuỷu, cùng trục khuỷu biến tịnh tiến thành quay.' },
  crankshaft: { name: 'Trục khuỷu', role: 'Nhận lực từ thanh truyền và quay; bán kính quay R bằng một nửa hành trình S.' },
  flywheel: { name: 'Bánh đà', role: 'Tích năng lượng ở kì sinh công để đưa piston qua ba kì còn lại, giúp động cơ quay đều.' },
  cylinder: { name: 'Xi lanh', role: 'Dẫn hướng piston; cùng nắp máy và đỉnh piston tạo thành buồng làm việc.' },
  head: { name: 'Nắp máy', role: 'Đậy kín phía trên xi lanh, chứa đường nạp, đường thải, xupap và vòi phun hoặc bugi.' },
  intakeValve: { name: 'Xupap nạp', role: 'Mở ở kì nạp để môi chất vào xi lanh, đóng ở các kì còn lại.' },
  exhaustValve: { name: 'Xupap thải', role: 'Mở ở kì thải để khí cháy thoát ra, đóng ở các kì còn lại.' },
  spring: { name: 'Lò xo xupap', role: 'Kéo xupap về vị trí đóng kín sau khi vấu cam đi qua.' },
  camshaft: { name: 'Trục cam', role: 'Vấu cam đẩy xupap mở đúng thời điểm; quay một vòng trong khi trục khuỷu quay hai vòng.' },
  intakePort: { name: 'Đường nạp', role: 'Dẫn không khí hoặc hòa khí vào xi lanh khi xupap nạp mở.' },
  exhaustPort: { name: 'Đường thải', role: 'Dẫn khí cháy ra ngoài khi xupap thải mở.' },
  injector: { name: 'Vòi phun', role: 'Phun nhiên liệu vào không khí nóng cuối kì nén; nhiên liệu tự bốc cháy.' },
  sparkPlug: { name: 'Bugi', role: 'Tạo tia lửa điện cuối kì nén để đốt cháy hòa khí.' },
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
    const y = -radius * Math.cos(angle) // the nose points down at rotation 0
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

function createPiston() {
  const piston = new THREE.Group()
  const skirtHeight = CROWN_ABOVE_PIN - 0.15 + SKIRT_BELOW_PIN
  const body = metal(0x9fb2c7, { side: THREE.DoubleSide })
  piston.add(mesh(new THREE.CylinderGeometry(PISTON_RADIUS, PISTON_RADIUS, 0.15, 56), metal(0x7c93ad),
    0, CROWN_ABOVE_PIN - 0.075, 0))
  piston.add(mesh(
    new THREE.CylinderGeometry(PISTON_RADIUS, PISTON_RADIUS, skirtHeight, 56, 1, true, CUT_START, CUT_LENGTH),
    body, 0, CROWN_ABOVE_PIN - 0.15 - skirtHeight / 2, 0,
  ))
  ;[0.22, 0.14, 0.06].forEach((y) => {
    piston.add(mesh(
      new THREE.CylinderGeometry(PISTON_RADIUS + 0.008, PISTON_RADIUS + 0.008, 0.028, 56, 1, true, CUT_START, CUT_LENGTH),
      metal(0x1e293b, { side: THREE.DoubleSide }), 0, y, 0,
    ))
  })
  belongsTo(piston, 'piston')
  piston.add(belongsTo(axisZ(mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.06, 24), metal(0xe2e8f0))), 'pistonPin'))
  return piston
}

function createRod() {
  const rod = new THREE.Group()
  const steel = metal(0xea7a1f)
  rod.add(mesh(new THREE.BoxGeometry(0.13, ROD_LENGTH - 0.3, 0.09), steel, 0, ROD_LENGTH / 2, 0))
  rod.add(mesh(new THREE.TorusGeometry(0.18, 0.06, 14, 40), steel))
  rod.add(mesh(new THREE.TorusGeometry(0.115, 0.04, 12, 32), steel, 0, ROD_LENGTH, 0))
  return belongsTo(rod, 'rod')
}

function createCrankshaft() {
  const crank = new THREE.Group()
  const steel = metal(0x475569)
  const pinSteel = metal(0x38bdf8)
  crank.add(axisZ(mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.9, 28), steel)))
  crank.add(axisZ(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 28), pinSteel, CRANK_RADIUS, 0, 0)))
  ;[-0.31, 0.31].forEach((z) => {
    const webLength = CRANK_RADIUS + 0.2 + 0.3
    crank.add(mesh(new THREE.BoxGeometry(webLength, 0.42, 0.12), steel, (CRANK_RADIUS + 0.2 - 0.3) / 2, 0, z))
    crank.add(axisZ(mesh(
      new THREE.CylinderGeometry(0.62, 0.62, 0.12, 40, 1, false, Math.PI, Math.PI),
      metal(0x334155), 0, 0, z,
    )))
  })
  belongsTo(crank, 'crankshaft')

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
  cam.add(mesh(camLobeGeometry(), material))
  cam.add(axisZ(mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 18), metal(0x64748b))))
  cam.position.set(x, CAM_CENTER_Y, 0)
  cam.userData.peak = peak
  return belongsTo(cam, 'camshaft')
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

function addStrokeScale(root) {
  const ink = new THREE.MeshBasicMaterial({ color: 0x0f172a })
  const tdc = TDC_PIN_Y + CROWN_ABOVE_PIN
  const bdc = BDC_PIN_Y + CROWN_ABOVE_PIN
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
  ), 'cylinder', { pickLast: true }))
  root.add(belongsTo(mesh(new THREE.BoxGeometry(2.1, HEAD_TOP_Y - DECK_Y, 1.5), glass(0x475569, 0.24),
    0, (DECK_Y + HEAD_TOP_Y) / 2, 0), 'head', { pickLast: true }))
  root.add(axisZ(mesh(new THREE.CylinderGeometry(1.24, 1.24, 1.5, 64, 1, true), glass(0x94a3b8, 0.14),
    0, CRANK_CENTER_Y, 0)))
  root.add(mesh(new THREE.BoxGeometry(3.1, 0.14, 2.6), metal(0xcbd5e1), 0, CRANK_CENTER_Y - 1.32, 0))

  // Moving parts
  const piston = createPiston()
  const rod = createRod()
  const crank = createCrankshaft()
  const intakeValve = createValve(-VALVE_X, 0x0ea5e9, 'intakeValve')
  const exhaustValve = createValve(VALVE_X, 0xf97316, 'exhaustValve')
  const intakeCam = createCam(-VALVE_X, metal(0x0284c7), INTAKE_CAM_PEAK)
  const exhaustCam = createCam(VALVE_X, metal(0xea580c), EXHAUST_CAM_PEAK)
  root.add(piston, rod, crank, intakeValve, exhaustValve, intakeCam, exhaustCam)

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
    ignitionEffect = mesh(new THREE.ConeGeometry(0.34, 0.26, 28, 1, true),
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

  const scale = addStrokeScale(root)

  const annotations = [
    { anchor: anchorAt(piston, 0.7, 0.2, 0), label: 'Piston' },
    { anchor: anchorAt(rod, 0.15, ROD_LENGTH * 0.45, 0), label: 'Thanh truyền' },
    { anchor: anchorAt(root, 0.05, CRANK_CENTER_Y - 0.62, 0.8), label: 'Trục khuỷu' },
    { anchor: anchorAt(root, -1.05, 3.05, 0), label: 'Xupap nạp' },
    { anchor: anchorAt(root, 1.05, 3.05, 0), label: 'Xupap thải' },
    { anchor: anchorAt(root, 0, 3.72, 0), label: isDiesel ? 'Vòi phun' : 'Bugi' },
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

    ;[[intakeValve, state.intakeLift, 0], [exhaustValve, state.exhaustLift, 1]].forEach(([valve, lift, index]) => {
      const drop = lift * MAX_VALVE_LIFT
      valve.position.y = DECK_Y - drop
      springs[index].scale.y = DECK_Y + RETAINER_HEIGHT - drop - HEAD_TOP_Y
    })

    const crownY = pistonPinY + CROWN_ABOVE_PIN
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
    moving: { piston, rod, crank, intakeValve, exhaustValve, intakeCam, exhaustCam, gas },
  }
}

export function pickEnginePart(intersections) {
  const parts = intersections.filter((hit) => hit.object.userData.part)
  return (parts.find((hit) => !hit.object.userData.pickLast) || parts[0])?.object.userData.part ?? null
}
