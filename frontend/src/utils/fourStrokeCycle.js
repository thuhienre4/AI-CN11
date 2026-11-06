// Teaching model of a four-stroke engine: each stroke spans exactly half a crank turn. Real engines
// open valves early and close them late (valve overlap) and ignite before top dead centre; both are
// left out on purpose so that grade 11 students can follow the basic sequence.
export const FOUR_STROKE_CYCLE_RADIANS = Math.PI * 4
export const FOUR_STROKE_CYCLE_DEGREES = 720

export const FOUR_STROKE_SIMPLIFICATION_NOTE =
  'Mô hình sơ đồ hóa cho học sinh THPT: mỗi kì ứng với đúng nửa vòng quay trục khuỷu, chưa thể hiện góc mở sớm, đóng muộn của xupap và góc đánh lửa sớm.'

export const FOUR_STROKES = [
  { id: 'intake', name: 'Nạp', pistonDirection: 'down' },
  { id: 'compression', name: 'Nén', pistonDirection: 'up' },
  { id: 'power', name: 'Cháy - giãn nở', pistonDirection: 'down' },
  { id: 'exhaust', name: 'Thải', pistonDirection: 'up' },
]

const COMBUSTION_END_PROGRESS = 0.62

// Smooth lift inside one stroke: zero at both dead centres, full at mid-stroke.
const liftWithinStroke = (progress, strokeIndex) => {
  const position = (progress - strokeIndex * 0.25) / 0.25
  return position >= 0 && position < 1 ? Math.sin(Math.PI * position) ** 2 : 0
}

export const normalizeCyclePhase = (angle) =>
  ((angle % FOUR_STROKE_CYCLE_RADIANS) + FOUR_STROKE_CYCLE_RADIANS) % FOUR_STROKE_CYCLE_RADIANS

export const fourStrokeState = (cyclePhase) => {
  const progress = cyclePhase / FOUR_STROKE_CYCLE_RADIANS
  const strokeIndex = Math.min(3, Math.floor(progress * 4))
  return {
    progress,
    strokeIndex,
    stroke: FOUR_STROKES[strokeIndex],
    crankDegrees: progress * FOUR_STROKE_CYCLE_DEGREES,
    intakeOpen: progress < 0.25,
    exhaustOpen: progress >= 0.75,
    intakeLift: liftWithinStroke(progress, 0),
    exhaustLift: liftWithinStroke(progress, 3),
    combustionActive: progress >= 0.5 && progress < COMBUSTION_END_PROGRESS,
  }
}

export const crankSliderPosition = ({ cyclePhase, crankRadius, crankCenterY, rodLength }) => {
  const crankAngle = Math.PI / 2 - cyclePhase
  const crankPinX = crankRadius * Math.cos(crankAngle)
  const crankPinY = crankCenterY + crankRadius * Math.sin(crankAngle)
  const pistonPinY = crankPinY + Math.sqrt(Math.max(rodLength ** 2 - crankPinX ** 2, 0))
  return { crankAngle, crankPinX, crankPinY, pistonPinY }
}
