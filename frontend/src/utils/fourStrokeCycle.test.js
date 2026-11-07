import { describe, expect, it } from 'vitest'

import { FOUR_STROKE_CYCLE_RADIANS, crankSliderPosition, cylinderVolumeShare, fourStrokeState, normalizeCyclePhase } from './fourStrokeCycle'

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

  it('kì nổ: piston goes down, both valves stay closed, combustion starts at top dead centre', () => {
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

describe('four-stroke readouts', () => {
  it('reports Vc at top dead centre and Va at bottom dead centre', () => {
    const volumes = { ...geometry, stroke: 2 * geometry.crankRadius, clearance: 0.2 }
    const share = (cyclePhase) => cylinderVolumeShare({ ...volumes, cyclePhase })
    const compressionRatio = (volumes.stroke + volumes.clearance) / volumes.clearance
    expect(share(0)).toBeCloseTo(1 / compressionRatio)
    expect(share(Math.PI)).toBeCloseTo(1)
  })

  it('names the stroke and crank angle at every mid-stroke', () => {
    const names = [0, 1, 2, 3].map((index) => fourStrokeState(midStroke(index)))
    expect(names.map((state) => state.stroke.id)).toEqual(['intake', 'compression', 'power', 'exhaust'])
    expect(names.map((state) => Math.round(state.crankDegrees))).toEqual([90, 270, 450, 630])
  })

  it('lifts each valve smoothly from closed to full and back within its own stroke', () => {
    expect(fourStrokeState(0).intakeLift).toBeCloseTo(0)
    expect(fourStrokeState(Math.PI / 2).intakeLift).toBeCloseTo(1)
    expect(fourStrokeState(Math.PI - 0.0001).intakeLift).toBeCloseTo(0)
    expect(fourStrokeState(3.5 * Math.PI).exhaustLift).toBeCloseTo(1)
    expect(fourStrokeState(2 * Math.PI).intakeLift).toBe(0)
    expect(fourStrokeState(2 * Math.PI).exhaustLift).toBe(0)
  })

  it('wraps any angle into one cycle', () => {
    expect(normalizeCyclePhase(FOUR_STROKE_CYCLE_RADIANS + 1)).toBeCloseTo(1)
    expect(normalizeCyclePhase(-1)).toBeCloseTo(FOUR_STROKE_CYCLE_RADIANS - 1)
  })
})
