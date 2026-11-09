// Building blocks shared by the device models: shapes, part tags, flows along a path, highlighting.
import * as THREE from 'three'

// Every mesh gets its own material so a single part can be highlighted.
export const material = (color, options = {}) => new THREE.MeshStandardMaterial({ color, metalness: 0.35, roughness: 0.5, ...options })
export const seeThrough = (color, opacity = 0.25) =>
  material(color, { transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, metalness: 0.1 })

export const mesh = (geometry, color, x = 0, y = 0, z = 0, options) => {
  const item = new THREE.Mesh(geometry, typeof color === 'number' ? material(color, options) : color)
  item.position.set(x, y, z)
  return item
}
export const box = (w, h, d, color, x, y, z, options) => mesh(new THREE.BoxGeometry(w, h, d), color, x, y, z, options)
export const cylinder = (radius, height, color, x, y, z, options, segments = 32) =>
  mesh(new THREE.CylinderGeometry(radius, radius, height, segments), color, x, y, z, options)
export const ball = (radius, color, x, y, z, options) => mesh(new THREE.SphereGeometry(radius, 24, 16), color, x, y, z, options)
export const ring = (radius, tube, color, x, y, z, options) => mesh(new THREE.TorusGeometry(radius, tube, 12, 48), color, x, y, z, options)

/** Lay a cylinder along X or Z (cylinders stand along Y by default). */
export const alongX = (item) => { item.rotation.z = Math.PI / 2; return item }
export const alongZ = (item) => { item.rotation.x = Math.PI / 2; return item }

export const group = (...children) => {
  const item = new THREE.Group()
  children.forEach((child) => item.add(child))
  return item
}

/** Mark every mesh under object as belonging to a part, so a click or a layer can find it. */
export const tag = (object, part) => {
  object.traverse((child) => {
    if (child.isMesh) child.userData.part = part
  })
  return object
}

/** A tube between points, for pipes, hoses and wires. */
export const pipe = (points, radius, color, options) => {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'catmullrom', 0.05)
  const item = mesh(new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 10, false), color, 0, 0, 0, options)
  item.userData.curve = curve
  return item
}

/** A spur gear: a disc with teeth, turning about Z. */
export const gear = (radius, teeth, width, color) => {
  const item = group(alongZ(cylinder(radius * 0.86, width, color)))
  for (let index = 0; index < teeth; index += 1) {
    const angle = (index / teeth) * Math.PI * 2
    const tooth = box(radius * 0.22, radius * 0.3, width, color, Math.cos(angle) * radius * 0.94, Math.sin(angle) * radius * 0.94, 0)
    tooth.rotation.z = angle
    item.add(tooth)
  }
  return item
}

/** A helical coil, for springs and windings, standing along Y from 0 to height. */
export const coil = (radius, height, turns, wire, color) => {
  const points = []
  const steps = turns * 24
  for (let step = 0; step <= steps; step += 1) {
    const angle = (step / 24) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, (step / steps) * height, Math.sin(angle) * radius))
  }
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), steps * 2, wire, 6, false), color)
}

/** Small beads that run along a pipe while a flow is on: oil, coolant, brake fluid or current. */
export const flow = (curve, color, count = 14, size = 0.06) => {
  const geometry = new THREE.SphereGeometry(size, 10, 8)
  const beads = Array.from({ length: count }, () => {
    const bead = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color }))
    bead.userData.decor = true
    return bead
  })
  return {
    beads,
    update(time, speed, on = true) {
      beads.forEach((bead, index) => {
        bead.visible = on && speed !== 0
        if (bead.visible) bead.position.copy(curve.getPoint((((time * speed + index / count) % 1) + 1) % 1))
      })
    },
  }
}

/** A floating label like those of the other models: anchored to a part, always shown. */
export const label = (parent, text, x, y, z, minor = false) => {
  const anchor = new THREE.Object3D()
  anchor.position.set(x, y, z)
  parent.add(anchor)
  return { anchor, label: text, note: '', layerId: 'all', compact: true, minor }
}

const HIGHLIGHT = { selected: [0x2563eb, 0.6], layer: [0x0ea5e9, 0.35] }

/**
 * Wraps what a device's build() returns into what the simulation page drives:
 * update each frame, pick a part under the pointer, highlight a part or a knowledge layer.
 */
export const createDeviceScene = (definition) => {
  const built = definition.build()
  const { root } = built
  // Controls not set yet (the first frames) take their default, so no value is ever undefined
  const defaults = Object.fromEntries((definition.controls || []).map((control) => [control.id, control.default]))
  const withDefaults = (controls) => ({ ...defaults, ...(controls || {}) })
  let lastState = {}
  let lastKey = ''

  const paint = (selectedPart, layerParts) => {
    const key = `${selectedPart}|${[...(layerParts || [])].join(',')}`
    if (key === lastKey) return
    lastKey = key
    root.traverse((child) => {
      if (!child.isMesh || !child.material?.emissive || child.userData.decor) return
      const part = child.userData.part
      const [color, intensity] = part && part === selectedPart
        ? HIGHLIGHT.selected
        : part && layerParts?.has(part) ? HIGHLIGHT.layer : [0x000000, 0]
      child.material.emissive.setHex(color)
      child.material.emissiveIntensity = intensity
    })
  }

  return {
    root,
    animated: [],
    annotations: built.annotations || [],
    framing: built.framing,
    floorY: built.floorY ?? -1,
    update(time, controls) {
      lastState = built.update(time, withDefaults(controls)) || {}
      return lastState
    },
    readouts: (controls) => (definition.readouts ? definition.readouts(lastState, withDefaults(controls)) : []),
    pick: (intersections) => intersections.find((hit) => hit.object.userData.part && !hit.object.userData.decor)?.object.userData.part ?? null,
    highlight: paint,
  }
}
