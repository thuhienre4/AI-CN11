import { describe, expect, it } from 'vitest'
import * as THREE from 'three'

import { FOUR_STROKE_CYCLE_RADIANS } from '../utils/fourStrokeCycle'
import { ENGINE_GEOMETRY, ENGINE_PARTS, createFourStrokeEngine, pickEnginePart } from './fourStrokeEngineModel'

const samples = Array.from({ length: 720 }, (_, step) => (step / 720) * FOUR_STROKE_CYCLE_RADIANS)
const axisOf = (mesh) => new THREE.Vector3(0, 1, 0).applyEuler(mesh.rotation)

describe('four-stroke engine model', () => {
  it('keeps the piston axis vertical and the crank axis horizontal', () => {
    const { moving } = createFourStrokeEngine()
    const crown = moving.piston.children[0]
    const journal = moving.crank.children[0]
    expect(Math.abs(axisOf(crown).y)).toBeCloseTo(1)
    expect(Math.abs(axisOf(journal).z)).toBeCloseTo(1)
  })

  it('never lets the piston crown hit the deck or an open valve', () => {
    const engine = createFourStrokeEngine()
    const { deckY, crownAbovePin } = ENGINE_GEOMETRY
    samples.forEach((phase) => {
      engine.update(phase)
      const crown = engine.moving.piston.position.y + crownAbovePin
      expect(crown).toBeLessThan(deckY)
      expect(engine.moving.intakeValve.position.y).toBeGreaterThan(crown)
      expect(engine.moving.exhaustValve.position.y).toBeGreaterThan(crown)
    })
  })

  it('keeps the connecting rod length constant through the cycle', () => {
    const engine = createFourStrokeEngine()
    samples.forEach((phase) => {
      engine.update(phase)
      const { rod, piston } = engine.moving
      const length = Math.hypot(rod.position.x, piston.position.y - rod.position.y)
      expect(length).toBeCloseTo(ENGINE_GEOMETRY.rodLength)
    })
  })

  it('points each cam nose down exactly at full valve lift', () => {
    const engine = createFourStrokeEngine()
    engine.update(Math.PI / 2)
    expect(engine.moving.intakeCam.rotation.z).toBeCloseTo(0)
    engine.update(3.5 * Math.PI)
    expect(engine.moving.exhaustCam.rotation.z).toBeCloseTo(0)
  })

  it('turns the camshaft once while the crankshaft turns twice', () => {
    const engine = createFourStrokeEngine()
    engine.update(0)
    const start = engine.moving.intakeCam.rotation.z
    engine.update(FOUR_STROKE_CYCLE_RADIANS)
    expect(start - engine.moving.intakeCam.rotation.z).toBeCloseTo(2 * Math.PI)
  })

  it('shrinks the gas column during compression', () => {
    const engine = createFourStrokeEngine()
    engine.update(Math.PI)
    const atBottom = engine.moving.gas.scale.y
    engine.update(2 * Math.PI - 0.01)
    expect(engine.moving.gas.scale.y).toBeLessThan(atBottom / 3)
  })

  it.each([
    ['diesel', 'injector', 'sparkPlug'],
    ['gasoline', 'sparkPlug', 'injector'],
  ])('%s engine has the right ignition part and every clickable part is described', (fuel, present, absent) => {
    const parts = new Set()
    createFourStrokeEngine({ fuel }).root.traverse((child) => {
      if (child.userData.part) parts.add(child.userData.part)
    })
    expect(parts.has(present)).toBe(true)
    expect(parts.has(absent)).toBe(false)
    parts.forEach((part) => expect(ENGINE_PARTS[part]?.role).toBeTruthy())
  })

  it('prefers a moving part behind a see-through shell when picking', () => {
    const shell = { object: { userData: { part: 'cylinder', pickLast: true } } }
    const piston = { object: { userData: { part: 'piston' } } }
    expect(pickEnginePart([shell, piston])).toBe('piston')
    expect(pickEnginePart([shell])).toBe('cylinder')
    expect(pickEnginePart([])).toBeNull()
  })
})
