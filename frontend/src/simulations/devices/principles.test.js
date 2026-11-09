import { describe, expect, it } from 'vitest'

import {
  BRAKE,
  FINAL_DRIVE,
  brakeHydraulics,
  cuttingSpeed,
  drivelineState,
  generatorFrequency,
  ledPwmForLight,
  lightToAnalog,
  lineVoltage,
  staircaseLamp,
  steeringState,
  stepSuspension,
  thermostatOpening,
  threePhase,
} from './principles'

describe('hydraulic brake', () => {
  it('passes the same pressure on, so the wheel piston pushes as many times harder as it is larger in area', () => {
    const full = brakeHydraulics(1)
    expect(full.clampForceN / full.masterForceN).toBeCloseTo((BRAKE.wheelDiameterMm / BRAKE.masterDiameterMm) ** 2)
    expect(full.pressureMPa).toBeGreaterThan(2)
    expect(full.pressureMPa).toBeLessThan(10)
    expect(brakeHydraulics(0.5).pressureMPa).toBeCloseTo(full.pressureMPa / 2)
    expect(brakeHydraulics(0).clampForceN).toBe(0)
  })
})

describe('drive line', () => {
  it('divides engine speed by the gear and final-drive ratios', () => {
    const third = drivelineState({ gear: 3, engineRpm: 2800 })
    expect(third.shaftRpm).toBeCloseTo(2000)
    expect(third.axleRpm).toBeCloseTo(2000 / FINAL_DRIVE)
  })

  it('stops the wheels in neutral or with the clutch pressed, and turns them backwards in reverse', () => {
    expect(drivelineState({ gear: 'N' }).axleRpm).toBe(0)
    expect(drivelineState({ gear: 2, clutchPressed: true }).axleRpm).toBe(0)
    expect(drivelineState({ gear: 'R' }).axleRpm).toBeLessThan(0)
  })

  it('lets the outer wheel turn faster in a bend while their average stays the same', () => {
    const straight = drivelineState({ gear: 2 })
    const left = drivelineState({ gear: 2, turn: 1 })
    expect(left.rightRpm).toBeGreaterThan(left.leftRpm)
    expect((left.leftRpm + left.rightRpm) / 2).toBeCloseTo(straight.axleRpm)
  })
})

describe('rack-and-pinion steering', () => {
  it('is straight in the middle and symmetric left and right', () => {
    expect(steeringState(0)).toMatchObject({ rackMm: 0, leftDeg: 0, rightDeg: 0 })
    const left = steeringState(360)
    const right = steeringState(-360)
    expect(left.leftDeg).toBeCloseTo(-right.rightDeg)
  })

  it('turns the inner wheel more than the outer one and gives a car-like lock at one and a half turns', () => {
    const left = steeringState(540)
    expect(left.leftDeg).toBeGreaterThan(left.rightDeg)
    expect(left.leftDeg).toBeGreaterThan(30)
    expect(left.leftDeg).toBeLessThan(45)
    expect(left.radiusM).toBeGreaterThan(3)
  })
})

describe('suspension', () => {
  const ride = (damper) => {
    let state = { body: 0, bodyV: 0, wheel: 0, wheelV: 0 }
    const swings = []
    for (let t = 0; t < 3; t += 0.01) {
      state = stepSuspension(state, 0.01, { damper, roadM: t > 0.1 && t < 0.3 ? 0.06 : 0 })
      if (t > 1.5) swings.push(Math.abs(state.body))
    }
    return Math.max(...swings)
  }

  it('lets the body settle much sooner with a working shock absorber', () => {
    expect(ride(true)).toBeLessThan(ride(false) / 3)
  })
})

describe('cooling thermostat', () => {
  it('keeps coolant away from the radiator until the engine is warm', () => {
    expect(thermostatOpening(60)).toBe(0)
    expect(thermostatOpening(88)).toBeGreaterThan(0)
    expect(thermostatOpening(100)).toBe(1)
  })
})

describe('lathe', () => {
  it('computes cutting speed v = πDn/1000', () => {
    expect(cuttingSpeed(50, 500)).toBeCloseTo(78.54, 2)
  })
})

describe('three-phase generator', () => {
  it('gives three voltages 120° apart that always add up to zero', () => {
    for (let angle = 0; angle < 7; angle += 0.37) {
      const [a, b, c] = threePhase(angle, 311)
      expect(a + b + c).toBeCloseTo(0, 6)
    }
  })

  it('has a line voltage √3 times the phase voltage in star and equal in delta, and 50 Hz at 3000 rpm', () => {
    expect(lineVoltage(220, 'star')).toBeCloseTo(381, 0)
    expect(lineVoltage(220, 'delta')).toBe(220)
    expect(generatorFrequency(3000)).toBe(50)
  })
})

describe('staircase light', () => {
  it('lets either switch turn the lamp on or off', () => {
    expect([[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, b]) => staircaseLamp(a, b))).toEqual([true, false, false, true])
  })
})

describe('light-controlled LED', () => {
  it('reads more in bright light and dims the LED, within the Arduino ranges', () => {
    const dark = lightToAnalog(1)
    const bright = lightToAnalog(1000)
    expect(bright).toBeGreaterThan(dark)
    expect(dark).toBeGreaterThanOrEqual(0)
    expect(bright).toBeLessThanOrEqual(1023)
    expect(ledPwmForLight(1)).toBeGreaterThan(ledPwmForLight(1000))
    expect(ledPwmForLight(0)).toBeLessThanOrEqual(255)
    expect(ledPwmForLight(100000)).toBeGreaterThanOrEqual(0)
  })
})
