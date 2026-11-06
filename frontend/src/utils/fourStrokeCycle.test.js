import { describe, expect, it } from 'vitest'

import { FOUR_STROKE_CYCLE_RADIANS, crankSliderPosition, fourStrokeState } from './fourStrokeCycle'

const geometry = { crankRadius: 0.9, crankCenterY: -1.12, rodLength: 2.2 }
const pistonAt = (cyclePhase) => crankSliderPosition({ ...geometry, cyclePhase }).pistonPinY
const midStroke = (index) => (index + 0.5) * Math.PI

describe('four-stroke teaching model', () => {
  it('takes two crank revolutions per cycle', () => {
    expect(FOUR_STROKE_CYCLE_RADIANS / (2 * Math.PI)).toBe(2)
  })

  it('starts at top dead centre and reaches bottom dead centre after half a turn', () => {
    expect(pistonAt(0)).toBeCloseTo(geometry.crankCenterY + geometry.crankRadius + geometry.rodLength)
    expect(pistonAt(Math.PI)).toBeCloseTo(geometry.crankCenterY - geometry.crankRadius + geometry.rodLength)
  })

  it.each([
    ['nạp', 0, 'down', { intakeOpen: true, exhaustOpen: false, combustionActive: false }],
    ['nén', 1, 'up', { intakeOpen: false, exhaustOpen: false, combustionActive: false }],
    ['thải', 3, 'up', { intakeOpen: false, exhaustOpen: true, combustionActive: false }],
  ])('kì %s: piston and valves follow the textbook sequence', (_name, index, direction, expected) => {
    const start = pistonAt(index * Math.PI)
    const end = pistonAt((index + 1) * Math.PI)
    expect(end < start ? 'down' : 'up').toBe(direction)
    expect(fourStrokeState(midStroke(index))).toMatchObject(expected)
  })

  it('kì cháy - giãn nở: piston goes down, both valves stay closed, combustion starts at top dead centre', () => {
    expect(pistonAt(3 * Math.PI)).toBeLessThan(pistonAt(2 * Math.PI))
    expect(fourStrokeState(2 * Math.PI)).toMatchObject({
      intakeOpen: false,
      exhaustOpen: false,
      combustionActive: true,
    })
    expect(fourStrokeState(3 * Math.PI - 0.01).combustionActive).toBe(false)
    expect(fourStrokeState(3 * Math.PI - 0.01).exhaustOpen).toBe(false)
  })

  it('never opens both valves together', () => {
    for (let step = 0; step < 720; step += 1) {
      const state = fourStrokeState((step / 720) * FOUR_STROKE_CYCLE_RADIANS)
      expect(state.intakeOpen && state.exhaustOpen).toBe(false)
    }
  })
})
