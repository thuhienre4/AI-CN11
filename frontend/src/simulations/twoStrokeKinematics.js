// Crank - connecting rod - piston of the two-stroke gasoline engine (SGK Công nghệ 11 KNTT, Bài 18).
// θ is the crank angle, 0 at ĐCT (piston at the top). All lengths are in model units.
// The ports are opened and closed by the piston itself: there are no valves.

export const TWO_STROKE = {
  crankY: -0.82, // centre of the crankshaft
  radius: 0.5, // R, crank radius
  rodLength: 2.18, // L, from the crank pin to the piston pin
  crownAbovePin: 0.4, // piston crown above the piston pin
  skirtBelowPin: 0.66, // bottom of the piston skirt below the piston pin
  // Port windows in the cylinder wall [bottom, top]
  exhaustPort: [1.24, 1.56],
  transferPort: [1.18, 1.42], // cửa quét: its top is lower, so the exhaust opens first
  intakePort: [0.92, 1.12], // cửa nạp into the crankcase, uncovered by the skirt only near ĐCT
}

const TAU = Math.PI * 2
const wrap = (theta) => ((theta % TAU) + TAU) % TAU

export function pistonPinY(theta, k = TWO_STROKE) {
  const side = k.radius * Math.sin(theta)
  return k.crankY + k.radius * Math.cos(theta) + Math.sqrt(k.rodLength ** 2 - side ** 2)
}

/** Position of the crank pin (rotating with the crank) and the pose of the rod between it and the piston pin. */
export function rodPose(theta, k = TWO_STROKE) {
  const crankPin = { x: k.radius * Math.sin(theta), y: k.crankY + k.radius * Math.cos(theta) }
  const pin = { x: 0, y: pistonPinY(theta, k) }
  return {
    crankPin,
    pin,
    center: { x: (crankPin.x + pin.x) / 2, y: (crankPin.y + pin.y) / 2 },
    // Rotation about z that turns a vertical rod so that it runs from the crank pin to the piston pin
    rotationZ: Math.atan2(crankPin.x - pin.x, pin.y - crankPin.y),
  }
}

export function pistonEdges(theta, k = TWO_STROKE) {
  const pin = pistonPinY(theta, k)
  return { crown: pin + k.crownAbovePin, skirt: pin - k.skirtBelowPin }
}

/** Which ports connect to a gas space at this crank angle. */
export function portOpenings(theta, k = TWO_STROKE) {
  const { crown, skirt } = pistonEdges(theta, k)
  return {
    // Above the crown the port opens into the cylinder
    exhaust: crown < k.exhaustPort[1],
    transfer: crown < k.transferPort[1],
    // Below the skirt the port opens into the crankcase
    intake: skirt > k.intakePort[0],
  }
}

/** Layer id of the two-stroke simulation that is happening at this crank angle. */
export function twoStrokePhase(theta, k = TWO_STROKE) {
  const angle = wrap(theta)
  const ports = portOpenings(angle, k)
  if (ports.exhaust) return 'exhaust'
  if (angle < Math.PI) return 'power'
  return ports.intake ? 'intake' : 'compression'
}

/** The spark plug fires at the end of compression, shortly before ĐCT. */
export const sparkOn = (theta) => {
  const angle = wrap(theta)
  return angle > TAU - 0.35 || angle < 0.05
}
