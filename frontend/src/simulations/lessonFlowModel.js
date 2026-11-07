import * as THREE from 'three'

const COLUMN_GAP = 2.7
const ROW_GAP = 3
const FLOOR_Y = -0.75
const DOTS_PER_LINK = 3

const STAGE_COLORS = [0x2563eb, 0x0d9488, 0xd97706, 0xdb2777, 0x7c3aed, 0x0891b2, 0x65a30d]

// Each mesh gets its own material because the page dims stages one object at a time.
const paint = (color, options = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.2, roughness: 0.55, ...options })

const solid = (geometry, color, x = 0, y = 0, z = 0) => {
  const item = new THREE.Mesh(geometry, paint(color))
  item.position.set(x, y, z)
  return item
}
const box = (w, h, d, color, x, y, z) => solid(new THREE.BoxGeometry(w, h, d), color, x, y, z)
const rod = (r, h, color, x, y, z) => solid(new THREE.CylinderGeometry(r, r, h, 32), color, x, y, z)
const ball = (r, color, x, y, z) => solid(new THREE.SphereGeometry(r, 28, 20), color, x, y, z)
const facing = (item) => {
  item.rotation.x = Math.PI / 2
  return item
}
const lying = (item) => {
  item.rotation.z = Math.PI / 2
  return item
}

const STEEL = 0x64748b
const DARK = 0x1e293b
const LIGHT = 0xe2e8f0

const gearTeeth = (group, radius, color, count = 10) => {
  for (let tooth = 0; tooth < count; tooth += 1) {
    const angle = (tooth / count) * Math.PI * 2
    const item = box(0.16, 0.16, 0.16, color, Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
    item.rotation.z = angle
    group.add(item)
  }
}

// Every shape is about 1.2 units across and sits on the origin.
const SHAPES = {
  plant: (g, c) => g.add(box(1.2, 0.7, 0.8, c, 0, 0.35, 0), rod(0.13, 1, STEEL, 0.35, 0.95, 0), rod(0.13, 0.75, STEEL, 0, 0.85, 0)),
  tower: (g, c) => {
    g.add(solid(new THREE.ConeGeometry(0.45, 1.8, 4), c, 0, 0.9, 0))
    ;[1.25, 1.55].forEach((y) => g.add(box(1.3 - (y - 1.25), 0.05, 0.05, DARK, 0, y, 0)))
  },
  transformer: (g, c) => g.add(box(1, 0.7, 0.6, c, 0, 0.35, 0), rod(0.07, 0.4, LIGHT, -0.28, 0.9, 0), rod(0.07, 0.4, LIGHT, 0.28, 0.9, 0), rod(0.07, 0.4, LIGHT, 0, 0.9, 0)),
  house: (g, c) => {
    g.add(box(1, 0.7, 0.8, LIGHT, 0, 0.35, 0))
    const roof = solid(new THREE.ConeGeometry(0.85, 0.55, 4), c, 0, 0.97, 0)
    roof.rotation.y = Math.PI / 4
    g.add(roof, box(0.24, 0.42, 0.03, DARK, 0, 0.21, 0.41))
  },
  cabinet: (g, c) => g.add(box(0.8, 1.3, 0.45, c, 0, 0.65, 0), box(0.62, 1.1, 0.03, LIGHT, 0, 0.65, 0.235), box(0.07, 0.2, 0.05, DARK, 0.22, 0.65, 0.26)),
  meter: (g, c) => g.add(box(0.8, 1, 0.35, c, 0, 0.5, 0), box(0.55, 0.22, 0.03, DARK, 0, 0.72, 0.19), facing(rod(0.2, 0.04, LIGHT, 0, 0.32, 0.19))),
  switch: (g, c) => {
    const lever = box(0.14, 0.62, 0.1, LIGHT, 0, 0.62, 0.16)
    lever.rotation.z = -0.5
    g.add(box(0.9, 1, 0.22, c, 0, 0.5, 0), lever)
  },
  socket: (g, c) => g.add(box(0.9, 0.9, 0.2, c, 0, 0.45, 0), facing(rod(0.3, 0.04, LIGHT, 0, 0.45, 0.11)), box(0.06, 0.16, 0.04, DARK, -0.1, 0.45, 0.14), box(0.06, 0.16, 0.04, DARK, 0.1, 0.45, 0.14)),
  bulb: (g, c) => g.add(ball(0.45, c, 0, 0.8, 0), rod(0.2, 0.32, STEEL, 0, 0.2, 0)),
  generator: (g, c) => g.add(lying(rod(0.45, 1.1, c, 0, 0.5, 0)), lying(rod(0.1, 1.5, STEEL, 0, 0.5, 0)), box(1, 0.1, 0.8, DARK, 0, 0.03, 0)),
  fan: (g, c, spin) => {
    const blades = new THREE.Group()
    ;[0, 1, 2].forEach((index) => {
      const blade = box(0.2, 0.55, 0.03, c, 0, 0.32, 0)
      const arm = new THREE.Group()
      arm.add(blade)
      arm.rotation.z = (index / 3) * Math.PI * 2
      blades.add(arm)
    })
    blades.position.set(0, 1, 0.14)
    g.add(rod(0.06, 1, STEEL, 0, 0.5, 0), facing(rod(0.12, 0.2, DARK, 0, 1, 0.02)), blades)
    spin(blades)
  },
  turbine: (g, c, spin) => {
    const wheel = new THREE.Group()
    for (let index = 0; index < 8; index += 1) {
      const arm = new THREE.Group()
      arm.add(box(0.13, 0.42, 0.2, c, 0, 0.32, 0))
      arm.rotation.z = (index / 8) * Math.PI * 2
      wheel.add(arm)
    }
    wheel.add(facing(rod(0.16, 0.3, DARK, 0, 0, 0)))
    wheel.position.y = 0.65
    g.add(wheel, box(0.9, 0.1, 0.5, STEEL, 0, 0.05, 0))
    spin(wheel)
  },
  gear: (g, c, spin) => {
    const wheel = new THREE.Group()
    wheel.add(facing(rod(0.46, 0.18, c, 0, 0, 0)), facing(rod(0.14, 0.22, LIGHT, 0, 0, 0)))
    gearTeeth(wheel, 0.52, c)
    wheel.position.y = 0.65
    g.add(wheel)
    spin(wheel)
  },
  disc: (g, c, spin) => {
    const wheel = new THREE.Group()
    wheel.add(facing(rod(0.55, 0.1, c, 0, 0, 0)), box(0.9, 0.08, 0.13, LIGHT, 0, 0, 0))
    wheel.position.y = 0.65
    g.add(wheel)
    spin(wheel)
  },
  tire: (g, c, spin) => {
    const wheel = new THREE.Group()
    wheel.add(solid(new THREE.TorusGeometry(0.42, 0.17, 18, 44), DARK), facing(rod(0.3, 0.16, c, 0, 0, 0)), box(0.5, 0.06, 0.2, LIGHT, 0, 0, 0))
    wheel.position.y = 0.62
    g.add(wheel)
    spin(wheel)
  },
  shaft: (g, c) => g.add(lying(rod(0.1, 1.5, c, 0, 0.5, 0)), ball(0.17, STEEL, -0.72, 0.5, 0), ball(0.17, STEEL, 0.72, 0.5, 0)),
  piston: (g, c) => g.add(rod(0.4, 0.5, c, 0, 0.95, 0), box(0.14, 0.75, 0.1, STEEL, 0, 0.38, 0), rod(0.42, 0.04, DARK, 0, 1.08, 0)),
  pump: (g, c) => g.add(rod(0.42, 0.55, c, 0, 0.3, 0), lying(rod(0.1, 1.3, STEEL, 0, 0.3, 0)), rod(0.1, 0.45, STEEL, 0, 0.75, 0)),
  radiator: (g, c) => {
    g.add(box(1, 1, 0.12, c, 0, 0.55, 0))
    ;[-0.3, -0.1, 0.1, 0.3].forEach((x) => g.add(box(0.05, 0.9, 0.16, LIGHT, x, 0.55, 0)))
  },
  tank: (g, c) => g.add(lying(rod(0.42, 1.1, c, 0, 0.5, 0)), rod(0.1, 0.25, STEEL, 0.25, 1, 0)),
  sensor: (g, c) => g.add(rod(0.26, 0.5, c, 0, 0.5, 0), ball(0.26, LIGHT, 0, 0.78, 0), box(0.7, 0.2, 0.5, DARK, 0, 0.1, 0)),
  chip: (g, c) => {
    g.add(box(1, 0.2, 0.8, DARK, 0, 0.3, 0), box(0.45, 0.04, 0.4, c, 0, 0.42, 0))
    ;[-0.36, -0.12, 0.12, 0.36].forEach((x) => g.add(box(0.08, 0.28, 0.98, LIGHT, x, 0.14, 0)))
  },
  board: (g, c) => g.add(box(1.3, 0.1, 0.9, c, 0, 0.25, 0), box(0.45, 0.14, 0.3, DARK, 0, 0.36, 0), box(0.2, 0.14, 0.3, LIGHT, -0.5, 0.36, 0.2), box(1, 0.1, 0.07, DARK, 0, 0.34, -0.36)),
  battery: (g, c) => g.add(lying(rod(0.3, 1, c, 0, 0.35, 0)), lying(rod(0.1, 0.14, LIGHT, 0.56, 0.35, 0))),
  resistor: (g, c) => {
    g.add(lying(rod(0.03, 1.6, LIGHT, 0, 0.5, 0)), lying(rod(0.2, 0.8, c, 0, 0.5, 0)))
    ;[-0.2, 0, 0.2].forEach((x) => g.add(lying(rod(0.21, 0.07, DARK, x, 0.5, 0))))
  },
  capacitor: (g, c) => g.add(rod(0.32, 0.8, c, 0, 0.7, 0), rod(0.03, 0.3, LIGHT, -0.12, 0.15, 0), rod(0.03, 0.3, LIGHT, 0.12, 0.15, 0)),
  coil: (g, c) => {
    for (let index = -3; index <= 3; index += 1) {
      const turn = solid(new THREE.TorusGeometry(0.3, 0.05, 10, 30), c, index * 0.12, 0.5, 0)
      turn.rotation.y = Math.PI / 2
      g.add(turn)
    }
    g.add(lying(rod(0.1, 1.1, STEEL, 0, 0.5, 0)))
  },
  diode: (g, c) => {
    const arrow = solid(new THREE.ConeGeometry(0.3, 0.42, 3), c, -0.05, 0.5, 0)
    arrow.rotation.z = -Math.PI / 2
    g.add(lying(rod(0.03, 1.5, LIGHT, 0, 0.5, 0)), arrow, box(0.06, 0.6, 0.2, DARK, 0.2, 0.5, 0))
  },
  transistor: (g, c) => g.add(rod(0.32, 0.5, c, 0, 0.7, 0), rod(0.03, 0.45, LIGHT, -0.15, 0.22, 0), rod(0.03, 0.45, LIGHT, 0, 0.22, 0), rod(0.03, 0.45, LIGHT, 0.15, 0.22, 0)),
  opamp: (g, c) => {
    const body = solid(new THREE.CylinderGeometry(0.62, 0.62, 0.2, 3), c, 0, 0.6, 0)
    body.rotation.x = Math.PI / 2
    body.rotation.y = -Math.PI / 6
    g.add(body)
  },
  gate: (g, c) => g.add(box(0.7, 0.8, 0.25, c, -0.1, 0.55, 0), facing(rod(0.4, 0.25, c, 0.25, 0.55, 0)), lying(rod(0.03, 1.5, LIGHT, 0, 0.55, 0))),
  star: (g, c) => {
    ;[Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6].forEach((angle) => {
      const arm = box(0.1, 0.58, 0.1, c, Math.cos(angle) * 0.29, 0.6 + Math.sin(angle) * 0.29, 0)
      arm.rotation.z = angle - Math.PI / 2
      g.add(arm, ball(0.1, DARK, Math.cos(angle) * 0.58, 0.6 + Math.sin(angle) * 0.58, 0))
    })
    g.add(ball(0.09, DARK, 0, 0.6, 0))
  },
  triangle: (g, c) => {
    const ring = solid(new THREE.TorusGeometry(0.55, 0.05, 8, 3), c, 0, 0.6, 0)
    ring.rotation.z = Math.PI / 2
    g.add(ring)
    ;[Math.PI / 2, (7 * Math.PI) / 6, (11 * Math.PI) / 6].forEach((angle) => g.add(ball(0.1, DARK, Math.cos(angle) * 0.55, 0.6 + Math.sin(angle) * 0.55, 0)))
  },
  wave: (g, c) => {
    const points = Array.from({ length: 41 }, (_, step) => new THREE.Vector3(step / 20 - 1, 0.6 + Math.sin(step / 3.2) * 0.3, 0).multiply(new THREE.Vector3(0.7, 1, 1)))
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 80, 0.05, 8), paint(c)))
  },
  sheet: (g, c) => {
    const page = new THREE.Group()
    page.add(box(1.1, 0.8, 0.04, LIGHT, 0, 0, 0), box(0.8, 0.04, 0.05, c, 0, 0.2, 0.01), box(0.8, 0.04, 0.05, c, 0, 0, 0.01), box(0.5, 0.04, 0.05, c, -0.15, -0.2, 0.01))
    page.position.y = 0.6
    page.rotation.x = -0.25
    g.add(page)
  },
  plane: (g, c) => {
    const face = box(1.2, 0.9, 0.03, c, 0, 0.6, 0)
    face.material.transparent = true
    face.material.opacity = 0.55
    face.material.userData.baseOpacity = 0.55
    g.add(face, box(1.24, 0.03, 0.05, DARK, 0, 1.05, 0), box(1.24, 0.03, 0.05, DARK, 0, 0.15, 0))
  },
  cube: (g, c) => {
    const item = box(0.75, 0.75, 0.75, c, 0, 0.55, 0)
    item.rotation.y = Math.PI / 5
    g.add(item)
  },
  layers: (g, c) => {
    ;[0, 1, 2, 3].forEach((index) => g.add(box(1 - index * 0.12, 0.16, 0.8 - index * 0.1, index % 2 ? LIGHT : c, 0, 0.14 + index * 0.2, 0)))
  },
  ingot: (g, c) => g.add(solid(new THREE.CylinderGeometry(0.34, 0.5, 0.42, 4), c, 0, 0.3, 0)),
  lathe: (g, c, spin) => {
    const chuck = lying(rod(0.26, 0.2, STEEL, -0.2, 0.68, 0))
    g.add(box(1.4, 0.2, 0.5, DARK, 0, 0.1, 0), box(0.34, 0.5, 0.45, c, -0.5, 0.45, 0), lying(rod(0.1, 0.65, LIGHT, 0.1, 0.68, 0)), box(0.2, 0.34, 0.3, c, 0.56, 0.4, 0), chuck)
    spin(chuck, 'x')
  },
  screw: (g, c) => {
    g.add(rod(0.16, 1, c, 0, 0.6, 0), rod(0.3, 0.16, STEEL, 0, 1.15, 0))
    ;[0.25, 0.4, 0.55, 0.7, 0.85].forEach((y) => g.add(rod(0.2, 0.05, DARK, 0, y, 0)))
  },
  nut: (g, c) => {
    const body = solid(new THREE.TorusGeometry(0.34, 0.2, 6, 6), c, 0, 0.6, 0)
    g.add(body)
  },
  spring: (g, c) => {
    const points = Array.from({ length: 121 }, (_, step) => new THREE.Vector3(Math.cos(step / 3.2) * 0.3, 0.15 + step / 120, Math.sin(step / 3.2) * 0.3))
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 200, 0.05, 8), paint(c)), rod(0.08, 1, STEEL, 0, 0.65, 0))
  },
  car: (g, c) => g.add(box(1.4, 0.32, 0.7, c, 0, 0.42, 0), box(0.75, 0.3, 0.62, c, -0.08, 0.72, 0), facing(rod(0.18, 0.76, DARK, -0.42, 0.2, 0)), facing(rod(0.18, 0.76, DARK, 0.42, 0.2, 0))),
  solar: (g, c) => {
    const panel = box(1.2, 0.05, 0.8, c, 0, 0.72, 0)
    panel.rotation.x = 0.6
    g.add(panel, rod(0.05, 0.7, STEEL, 0, 0.35, 0))
  },
  robot: (g, c) => g.add(box(0.7, 0.75, 0.45, c, 0, 0.42, 0), box(0.5, 0.36, 0.42, LIGHT, 0, 1, 0), box(0.09, 0.09, 0.03, DARK, -0.12, 1.03, 0.22), box(0.09, 0.09, 0.03, DARK, 0.12, 1.03, 0.22)),
  person: (g, c) => g.add(ball(0.24, 0xf1c9a5, 0, 1.1, 0), solid(new THREE.CapsuleGeometry(0.26, 0.5, 8, 16), c, 0, 0.5, 0)),
  idea: (g, c) => g.add(ball(0.42, c, 0, 0.82, 0), rod(0.18, 0.28, STEEL, 0, 0.26, 0)),
  gauge: (g, c) => {
    const needle = box(0.05, 0.4, 0.03, DARK, 0.1, 0.72, 0.1)
    needle.rotation.z = -0.5
    g.add(facing(rod(0.5, 0.12, c, 0, 0.6, 0)), facing(rod(0.42, 0.13, LIGHT, 0, 0.6, 0.02)), needle)
  },
  shield: (g, c) => g.add(solid(new THREE.CylinderGeometry(0.55, 0.05, 1, 6), c, 0, 0.62, 0)),
  leaf: (g, c) => {
    const leaf = ball(0.45, c, 0, 0.75, 0)
    leaf.scale.set(0.6, 1, 0.2)
    leaf.rotation.z = -0.4
    g.add(leaf, rod(0.04, 0.5, 0x4d7c0f, 0, 0.25, 0))
  },
  warning: (g, c) => g.add(solid(new THREE.ConeGeometry(0.62, 1, 3), c, 0, 0.55, 0), box(0.08, 0.34, 0.08, DARK, 0, 0.5, 0.31), box(0.08, 0.08, 0.08, DARK, 0, 0.24, 0.32)),
}

export const LESSON_SHAPES = Object.keys(SHAPES)

const gridSize = (count) => {
  if (count <= 4) return { columns: count, rows: 1 }
  return { columns: Math.ceil(count / 2), rows: 2 }
}

// Rows alternate direction so that each link stays between neighbouring stages.
const stagePosition = (index, columns, rows) => {
  const row = Math.floor(index / columns)
  const place = index % columns
  const column = row % 2 ? columns - 1 - place : place
  return new THREE.Vector3((column - (columns - 1) / 2) * COLUMN_GAP, (rows - 1 - row) * ROW_GAP, 0)
}

const setStage = (object, layerId) => {
  object.traverse((part) => {
    if (part.isMesh) part.name = layerId
  })
  return object
}

export function createLessonFlowModel({ stages, arrows = true }) {
  const root = new THREE.Group()
  const animated = []
  const annotations = []
  const { columns, rows } = gridSize(stages.length)
  const positions = stages.map((_, index) => stagePosition(index, columns, rows))

  stages.forEach(([label, shape], index) => {
    const layerId = `stage${index + 1}`
    const color = STAGE_COLORS[index % STAGE_COLORS.length]
    const group = new THREE.Group()
    SHAPES[shape](group, color, (mesh, axis = 'z') => animated.push({ mesh, type: axis === 'x' ? 'spinX' : 'spinZ' }))
    group.add(box(1.75, 0.08, 1.2, 0xf1f5f9, 0, -0.05, 0))
    group.position.copy(positions[index])
    root.add(setStage(group, layerId))

    const anchor = new THREE.Object3D()
    anchor.position.set(0, 1.5, 0)
    group.add(anchor)
    annotations.push({ anchor, layerId, label, note: '', compact: true })
  })

  if (arrows) {
    positions.slice(0, -1).forEach((start, index) => {
      const from = start.clone().add(new THREE.Vector3(0, 0.5, 0))
      const to = positions[index + 1].clone().add(new THREE.Vector3(0, 0.5, 0))
      const direction = to.clone().sub(from).normalize()
      const begin = from.clone().addScaledVector(direction, 0.9)
      const end = to.clone().addScaledVector(direction, -0.9)
      const layerId = `stage${index + 1}`

      const line = rod(0.025, begin.distanceTo(end), 0x94a3b8, 0, 0, 0)
      line.position.copy(begin).lerp(end, 0.5)
      line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
      const head = solid(new THREE.ConeGeometry(0.1, 0.22, 16), 0x475569)
      head.position.copy(end)
      head.quaternion.copy(line.quaternion)
      root.add(setStage(line, layerId), setStage(head, layerId))

      for (let dot = 0; dot < DOTS_PER_LINK; dot += 1) {
        const mesh = ball(0.07, 0xf59e0b, 0, 0, 0)
        mesh.userData.flow = { begin, end, offset: dot / DOTS_PER_LINK }
        mesh.position.copy(begin)
        root.add(setStage(mesh, layerId))
        animated.push({ mesh, type: 'flow' })
      }
    })
  }

  // The margins leave room for long labels at the sides and for the view buttons below
  const width = (columns - 1) * COLUMN_GAP + 3.8
  const height = (rows - 1) * ROW_GAP + 3.4
  return {
    root,
    animated,
    annotations,
    floorY: rows > 1 ? FLOOR_Y : -0.25,
    framing: {
      center: new THREE.Vector3(0, ((rows - 1) * ROW_GAP) / 2 + 0.45, 0),
      width,
      height,
      direction: new THREE.Vector3(0.16, 0.22, 1).normalize(),
    },
  }
}
