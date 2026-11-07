import { describe, expect, it } from 'vitest'
import * as THREE from 'three'

import { FOUR_STROKE_CYCLE_RADIANS } from '../utils/fourStrokeCycle'
import { ENGINE_PARTS, createFourStrokeEngine, engineGeometry, pickEnginePart } from './fourStrokeEngineModel'

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

  it.each(['diesel', 'gasoline'])('never lets the %s piston crown hit the deck or an open valve', (fuel) => {
    const engine = createFourStrokeEngine({ fuel })
    const { deckY, crownAbovePin } = engineGeometry(fuel)
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
      expect(length).toBeCloseTo(engineGeometry().rodLength)
    })
  })

  it('points each cam nose up at its tappet exactly at full valve lift', () => {
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

  it('drives each valve through tappet, push rod and rocker arm by the same travel', () => {
    const engine = createFourStrokeEngine()
    const { maxValveLift } = engineGeometry()
    const positions = ({ tappet, pushrod, valve }) => [tappet.position.y, pushrod.position.y, valve.position.y]
    engine.update(0)
    const closed = engine.moving.valveTrains.map(positions)
    ;[Math.PI / 2, 3.5 * Math.PI].forEach((phase, index) => {
      engine.update(phase)
      const [tappet, pushrod, valve] = positions(engine.moving.valveTrains[index])
      expect(tappet - closed[index][0]).toBeCloseTo(maxValveLift)
      expect(pushrod - closed[index][1]).toBeCloseTo(maxValveLift)
      expect(closed[index][2] - valve).toBeCloseTo(maxValveLift)
      expect(engine.moving.valveTrains[index].arm.rotation.z).toBeGreaterThan(0)
      expect(positions(engine.moving.valveTrains[1 - index])).toEqual(closed[1 - index])
    })
  })

  it('moves the timing chain clockwise at the rim speed of the crank sprocket', () => {
    const engine = createFourStrokeEngine()
    engine.update(0)
    const link = engine.moving.chainLinks.reduce((best, item) => {
      const onTopRun = Math.abs(item.position.x) < Math.abs(best.position.x) && item.position.y > -0.5
      return onTopRun ? item : best
    })
    const startX = link.position.x
    engine.update(0.5)
    expect(link.position.x - startX).toBeCloseTo(0.5 * 0.2, 2)
  })

  it('gives the diesel a higher compression ratio than the petrol engine, both in the usual range', () => {
    const gasoline = engineGeometry('gasoline')
    const diesel = engineGeometry('diesel')
    expect(gasoline.compressionRatio).toBeGreaterThan(6)
    expect(gasoline.compressionRatio).toBeLessThan(12)
    expect(diesel.compressionRatio).toBeGreaterThan(14)
    expect(diesel.compressionRatio).toBeLessThan(25)
    expect(diesel.stroke).toBeCloseTo(2 * diesel.crankRadius)
  })

  it('fits two compression rings and one oil ring', () => {
    const { moving } = createFourStrokeEngine()
    const rings = moving.piston.children.filter((child) => child.userData.part === 'pistonRing')
    expect(rings).toHaveLength(3)
    expect(new Set(rings.map((ring) => ring.material.color.getHex())).size).toBe(2)
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
    ;['pistonRing', 'crankPin', 'counterweight', 'tappet', 'pushrod', 'rocker', 'timingChain', 'block', 'crankcase']
      .forEach((part) => expect(parts.has(part)).toBe(true))
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
