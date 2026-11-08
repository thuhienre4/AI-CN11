// WebXR view of the 3D models: a headset (Quest, Pico, or a phone with a WebXR viewer) shows the same scene.
// DOM labels do not exist inside a headset, so labels are drawn on sprites there.
import * as THREE from 'three'

// The model stands on a table in front of the student: about 1.1 m tall at most, centre 1.1 m above the floor
export const VR_TARGET_SIZE = 1.1
export const VR_EYE_TABLE = { height: 1.1, distance: 1.3 }

export async function isImmersiveVrSupported(xr = globalThis.navigator?.xr) {
  if (!xr?.isSessionSupported) return false
  try {
    return await xr.isSessionSupported('immersive-vr')
  } catch {
    return false
  }
}

export function requestVrSession(xr = globalThis.navigator?.xr) {
  return xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] })
}

/** Scale and position for the stage group so that a model of this bounding box sits in front of the viewer. */
export function vrStageTransform(size, center, target = VR_TARGET_SIZE, table = VR_EYE_TABLE) {
  const largest = Math.max(size.x, size.y, size.z, 1e-6)
  const scale = target / largest
  return {
    scale,
    position: new THREE.Vector3(-center.x * scale, table.height - center.y * scale, -table.distance - center.z * scale),
  }
}

/** Splits a note into lines of at most `width` characters, at spaces. */
export function wrapText(text, width = 34, maxLines = 3) {
  const lines = []
  let line = ''
  String(text || '').split(/\s+/).filter(Boolean).forEach((word) => {
    if (line && (line + ' ' + word).length > width) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  })
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s,.;:]+$/, '')}…`
    return kept
  }
  return lines
}

/** A label that always faces the viewer. `unit` is how large one model unit is drawn in the headset. */
export function createLabelSprite(label, note = '', unit = 1) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const noteLines = wrapText(note)
  canvas.width = 768
  canvas.height = 92 + noteLines.length * 50
  if (context) {
    context.fillStyle = 'rgba(255, 255, 255, 0.94)'
    context.strokeStyle = '#1e3a8a'
    context.lineWidth = 6
    context.beginPath()
    context.roundRect?.(3, 3, canvas.width - 6, canvas.height - 6, 18)
    if (!context.roundRect) context.rect(3, 3, canvas.width - 6, canvas.height - 6)
    context.fill()
    context.stroke()
    context.fillStyle = '#0f172a'
    context.font = 'bold 50px system-ui, sans-serif'
    context.fillText(label, 26, 64, canvas.width - 52)
    context.fillStyle = '#334155'
    context.font = '38px system-ui, sans-serif'
    noteLines.forEach((line, index) => context.fillText(line, 26, 120 + index * 50, canvas.width - 52))
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }))
  const width = 1.15 * unit
  sprite.scale.set(width, (width * canvas.height) / canvas.width, 1)
  sprite.center.set(0.5, 0)
  sprite.renderOrder = 10
  sprite.visible = false
  return sprite
}
