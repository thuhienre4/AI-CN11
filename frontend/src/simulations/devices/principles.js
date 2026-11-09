// The working principle behind each device model, as plain functions so it can be tested apart from 3D.
// Values are teaching values in the usual range for a passenger car or a school lab, not data of a real product.

// ---------------------------------------------------------------- hydraulic brake (Công nghệ 11, Bài 25)
export const BRAKE = { footForceN: 300, pedalRatio: 4, masterDiameterMm: 22, wheelDiameterMm: 54 }
const area = (diameterMm) => (Math.PI * diameterMm ** 2) / 4 // mm²

/** Pascal's law: the master cylinder's pressure reaches every wheel cylinder; a bigger piston pushes harder. */
export const brakeHydraulics = (pedal) => {
  const press = Math.min(1, Math.max(0, pedal))
  const masterForceN = BRAKE.footForceN * BRAKE.pedalRatio * press
  const pressureMPa = masterForceN / area(BRAKE.masterDiameterMm)
  const clampForceN = pressureMPa * area(BRAKE.wheelDiameterMm)
  return { masterForceN, pressureMPa, clampForceN, areaRatio: area(BRAKE.wheelDiameterMm) / area(BRAKE.masterDiameterMm) }
}

// ---------------------------------------------------------------- drive line (Bài 22)
export const GEARS = { R: -3.5, N: 0, 1: 3.6, 2: 2.1, 3: 1.4, 4: 1.0 }
export const FINAL_DRIVE = 4.1
export const DIFFERENTIAL_SPREAD = 0.15

/**
 * Engine speed through clutch, gearbox, propeller shaft, final drive and differential to the two wheels.
 * turn: -1 (right) .. 1 (left); in a bend the outer wheel turns faster, their average stays the same.
 */
export const drivelineState = ({ gear = 'N', clutchPressed = false, turn = 0, engineRpm = 2000 } = {}) => {
  const ratio = GEARS[gear] ?? 0
  const connected = !clutchPressed && ratio !== 0
  const shaftRpm = connected ? engineRpm / ratio : 0
  const axleRpm = shaftRpm / FINAL_DRIVE
  const spread = Math.max(-1, Math.min(1, turn)) * DIFFERENTIAL_SPREAD
  return {
    ratio,
    totalRatio: ratio * FINAL_DRIVE,
    clutchRpm: clutchPressed ? 0 : engineRpm,
    shaftRpm,
    axleRpm,
    leftRpm: axleRpm * (1 - spread),
    rightRpm: axleRpm * (1 + spread),
  }
}

// ---------------------------------------------------------------- rack-and-pinion steering (Bài 24)
export const STEERING = { pinionRadiusMm: 8, armMm: 130, wheelbaseM: 2.6, trackM: 1.5, maxWheelTurnDeg: 540 }

/** Steering wheel angle -> rack travel -> wheel angles; the inner wheel turns more (Ackermann). */
export const steeringState = (wheelDeg) => {
  const input = Math.max(-STEERING.maxWheelTurnDeg, Math.min(STEERING.maxWheelTurnDeg, wheelDeg))
  const rackMm = STEERING.pinionRadiusMm * (input * Math.PI) / 180
  const mean = Math.asin(Math.max(-1, Math.min(1, rackMm / STEERING.armMm)))
  if (Math.abs(mean) < 1e-6) return { rackMm: 0, leftDeg: 0, rightDeg: 0, radiusM: Infinity }
  const radius = STEERING.wheelbaseM / Math.tan(Math.abs(mean))
  const inner = Math.atan(STEERING.wheelbaseM / (radius - STEERING.trackM / 2))
  const outer = Math.atan(STEERING.wheelbaseM / (radius + STEERING.trackM / 2))
  const sign = Math.sign(mean) // positive turns left: the left wheel is the inner one
  const deg = (value) => (value * 180) / Math.PI
  return {
    rackMm,
    leftDeg: sign * deg(sign > 0 ? inner : outer),
    rightDeg: sign * deg(sign > 0 ? outer : inner),
    radiusM: radius,
  }
}

// ---------------------------------------------------------------- suspension, quarter car (Bài 23)
export const QUARTER_CAR = { bodyKg: 300, wheelKg: 40, springNpm: 20000, tyreNpm: 180000, damperNspm: 1600, weakDamperNspm: 150 }

/** One time step of body and wheel on spring, damper and tyre. Positions in metres, up is positive. */
export const stepSuspension = (state, dt, { damper = true, roadM = 0 } = {}) => {
  const c = damper ? QUARTER_CAR.damperNspm : QUARTER_CAR.weakDamperNspm
  let { body, bodyV, wheel, wheelV } = state
  const steps = 8
  const h = dt / steps
  for (let i = 0; i < steps; i += 1) {
    const suspension = QUARTER_CAR.springNpm * (wheel - body) + c * (wheelV - bodyV)
    const tyre = QUARTER_CAR.tyreNpm * (roadM - wheel)
    bodyV += (suspension / QUARTER_CAR.bodyKg) * h
    wheelV += ((tyre - suspension) / QUARTER_CAR.wheelKg) * h
    body += bodyV * h
    wheel += wheelV * h
  }
  return { body, bodyV, wheel, wheelV }
}

// ---------------------------------------------------------------- lubrication and cooling (Bài 20)
export const THERMOSTAT = { opensC: 82, fullyOpenC: 95 }

/** Share of coolant sent to the radiator: none while the engine warms up, all of it once it is hot. */
export const thermostatOpening = (temperatureC) =>
  Math.max(0, Math.min(1, (temperatureC - THERMOSTAT.opensC) / (THERMOSTAT.fullyOpenC - THERMOSTAT.opensC)))

// ---------------------------------------------------------------- lathe (Bài 8)
/** Cutting speed v = π·D·n / 1000, in m/min, for a workpiece diameter D in mm turning at n rev/min. */
export const cuttingSpeed = (diameterMm, rpm) => (Math.PI * diameterMm * rpm) / 1000

// ---------------------------------------------------------------- three-phase generator (Công nghệ 12, Bài 3, 5)
/** The three phase voltages, 120° apart; at every instant they add up to zero. */
export const threePhase = (angle, peak = 1) =>
  [0, 1, 2].map((phase) => peak * Math.sin(angle - (phase * 2 * Math.PI) / 3))

/** Line voltage from the phase voltage: √3 times for a star connection, equal for a delta connection. */
export const lineVoltage = (phaseVoltage, connection) => (connection === 'star' ? Math.sqrt(3) * phaseVoltage : phaseVoltage)

/** f = p·n/60 for p pole pairs at n rev/min. */
export const generatorFrequency = (rpm, polePairs = 1) => (polePairs * rpm) / 60

// ---------------------------------------------------------------- staircase light (Bài 10)
/** Two three-way switches joined by two traveller wires: the lamp is on when both point to the same wire. */
export const staircaseLamp = (upper, lower) => upper === lower

// ---------------------------------------------------------------- microcontroller light control (Bài 24 to 26)
export const LDR = { darkOhm: 200000, kOhmAtOneLux: 50, gamma: 0.7, fixedOhm: 10000 }

/** Light in lux -> LDR resistance -> divider voltage read by analogRead (0-1023). More light, higher reading. */
export const lightToAnalog = (lux) => {
  const ldrOhm = Math.min(LDR.darkOhm, LDR.kOhmAtOneLux * 1000 * Math.max(lux, 0.01) ** -LDR.gamma)
  return Math.round((1023 * LDR.fixedOhm) / (LDR.fixedOhm + ldrOhm))
}

/** The program of Bài 26: the darker it is, the brighter the LED (PWM 0-255). */
export const ledPwmForLight = (lux) => 255 - Math.round(lightToAnalog(lux) / 4.0118)
