// Teaching model of a four-stroke engine: each stroke spans exactly half a crank turn. Real engines
// open valves early and close them late (valve overlap) and ignite before top dead centre; both are
// left out on purpose so that grade 11 students can follow the basic sequence.
export const FOUR_STROKE_CYCLE_RADIANS = Math.PI * 4

export const FOUR_STROKE_SIMPLIFICATION_NOTE =
  'Mô hình sơ đồ hóa cho học sinh THPT: mỗi kì ứng với đúng nửa vòng quay trục khuỷu, chưa thể hiện góc mở sớm, đóng muộn của xupap và góc đánh lửa sớm.'

const COMBUSTION_END_PROGRESS = 0.62

export const fourStrokeState = (cyclePhase) => {
  const progress = cyclePhase / FOUR_STROKE_CYCLE_RADIANS
  return {
    progress,
    intakeOpen: progress < 0.25,
    exhaustOpen: progress >= 0.75,
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
