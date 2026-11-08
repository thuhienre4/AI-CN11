import { describe, expect, it } from 'vitest'

import { TWO_STROKE, pistonEdges, pistonPinY, portOpenings, rodPose, sparkOn, twoStrokePhase } from './twoStrokeKinematics'

const deg = (value) => (value * Math.PI) / 180

describe('two-stroke crank mechanism', () => {
  it('has a stroke of twice the crank radius, from ĐCT at 0° to ĐCD at 180°', () => {
    const top = pistonPinY(0)
    const bottom = pistonPinY(Math.PI)
    expect(top - bottom).toBeCloseTo(2 * TWO_STROKE.radius, 6)
    for (let angle = 0; angle < 360; angle += 5) {
      const y = pistonPinY(deg(angle))
      expect(y).toBeLessThanOrEqual(top + 1e-9)
      expect(y).toBeGreaterThanOrEqual(bottom - 1e-9)
    }
  })

  it('keeps the connecting rod at its length at every angle', () => {
    for (let angle = 0; angle < 360; angle += 15) {
      const { crankPin, pin, rotationZ } = rodPose(deg(angle))
      expect(Math.hypot(pin.x - crankPin.x, pin.y - crankPin.y)).toBeCloseTo(TWO_STROKE.rodLength, 6)
      // A vertical rod turned by rotationZ points from the crank pin to the piston pin
      const direction = { x: -Math.sin(rotationZ), y: Math.cos(rotationZ) }
      expect(direction.x * TWO_STROKE.rodLength).toBeCloseTo(pin.x - crankPin.x, 6)
      expect(direction.y * TWO_STROKE.rodLength).toBeCloseTo(pin.y - crankPin.y, 6)
    }
  })

  it('keeps the piston crown below the cylinder head', () => {
    expect(pistonEdges(0).crown).toBeLessThan(2.39)
  })
})

describe('ports opened by the piston (no valves)', () => {
  it('opens exhaust and transfer ports at ĐCD and covers the intake port', () => {
    expect(portOpenings(Math.PI)).toEqual({ exhaust: true, transfer: true, intake: false })
  })

  it('closes exhaust and transfer ports near ĐCT and opens the intake port into the crankcase', () => {
    expect(portOpenings(0)).toEqual({ exhaust: false, transfer: false, intake: true })
  })

  it('opens the exhaust port before the transfer port on the way down', () => {
    let exhaustAt = null
    let transferAt = null
    for (let angle = 0; angle <= 180; angle += 1) {
      const ports = portOpenings(deg(angle))
      if (exhaustAt === null && ports.exhaust) exhaustAt = angle
      if (transferAt === null && ports.transfer) transferAt = angle
    }
    expect(exhaustAt).toBeLessThan(transferAt)
  })

  it('never has the intake port open while the exhaust port is open', () => {
    for (let angle = 0; angle < 360; angle += 1) {
      const ports = portOpenings(deg(angle))
      expect(ports.intake && ports.exhaust, `${angle}°`).toBe(false)
    }
  })
})

describe('phase shown to the student', () => {
  it('goes power → exhaust and scavenging → compression → crankcase intake in one turn', () => {
    const order = []
    for (let angle = 1; angle < 360; angle += 1) {
      const phase = twoStrokePhase(deg(angle))
      if (order[order.length - 1] !== phase) order.push(phase)
    }
    expect(order).toEqual(['power', 'exhaust', 'compression', 'intake'])
  })

  it('fires the spark plug only at the end of compression', () => {
    expect(sparkOn(deg(350))).toBe(true)
    expect(sparkOn(deg(90))).toBe(false)
    expect(sparkOn(deg(180))).toBe(false)
  })
})
