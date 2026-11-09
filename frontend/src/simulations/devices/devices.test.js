import { describe, expect, it } from 'vitest'

import { sampleLessons } from '../../data/courseCatalog'
import { DEVICE_MODELS, defaultControls, deviceSimulation, getDeviceModel } from './index'
import { createDeviceScene } from './kit'

const EXPECTED = ['11-8', '11-20', '11-22', '11-23', '11-24', '11-25', '12-3', '12-5', '12-10', '12-24', '12-25', '12-26']

const lessonFor = (key) => {
  const [grade, number] = key.split('-').map(Number)
  return sampleLessons.find((lesson) => Number(lesson.grade_level) === grade && new RegExp(`^Bài ${number}\\.`).test(lesson.title))
}

// Every combination of choice and toggle values, sliders at both ends
const controlCases = (model) => {
  let cases = [defaultControls(model)]
  model.controls.forEach((control) => {
    const values = control.type === 'choice' ? control.options.map(([value]) => value)
      : control.type === 'toggle' ? [true, false] : [control.min, control.max]
    cases = cases.flatMap((base) => values.map((value) => ({ ...base, [control.id]: value })))
  })
  return cases.slice(0, 40)
}

const finite = (object) => [object.position, object.scale].every((vector) => [vector.x, vector.y, vector.z].every(Number.isFinite))
  && [object.rotation.x, object.rotation.y, object.rotation.z].every(Number.isFinite)

describe('device models', () => {
  it('cover the lessons taught by structure and working principle, each lesson once', () => {
    const keys = DEVICE_MODELS.flatMap((model) => model.keys)
    expect([...keys].sort()).toEqual([...EXPECTED].sort())
    EXPECTED.forEach((key) => {
      const lesson = lessonFor(key)
      expect(lesson, key).toBeTruthy()
      expect(getDeviceModel(lesson), key).toBeTruthy()
    })
    expect(getDeviceModel(lessonFor('11-1'))).toBeNull()
  })

  DEVICE_MODELS.forEach((model) => {
    describe(model.title, () => {
      it('describes every part it draws, and its layers and click actions name real parts', () => {
        const scene = createDeviceScene(model)
        const drawn = new Set()
        scene.root.traverse((child) => {
          if (child.isMesh && child.userData.part) drawn.add(child.userData.part)
        })
        drawn.forEach((part) => expect(model.parts[part]?.role, part).toBeTruthy())
        model.layers.forEach((layer) => layer.parts.forEach((part) => expect(model.parts[part], `${layer.id}: ${part}`).toBeTruthy()))
        Object.keys(model.interactions || {}).forEach((part) => expect(drawn.has(part), part).toBe(true))
        expect(scene.annotations.length).toBeGreaterThan(3)
        expect(model.checkpoints.length).toBeGreaterThan(1)
        expect(model.task?.length, 'practice task').toBeGreaterThan(40)
      })

      it('runs every control setting for several seconds without breaking a shape', () => {
        controlCases(model).forEach((controls) => {
          const scene = createDeviceScene(model)
          for (let frame = 0; frame <= 120; frame += 1) scene.update(frame / 30, controls)
          scene.root.traverse((child) => expect(finite(child), `${JSON.stringify(controls)} ${child.type}`).toBe(true))
          scene.readouts(controls).forEach(({ label, value }) => {
            expect(label).toBeTruthy()
            expect(String(value)).not.toMatch(/NaN|undefined|Infinity/)
          })
        })
      })

      it('survives the first frame before any control is set', () => {
        const scene = createDeviceScene(model)
        scene.update(0, {})
        scene.update(0.1, {})
        scene.root.traverse((child) => expect(finite(child)).toBe(true))
      })

      it('turns each click action into a different control setting', () => {
        Object.entries(model.interactions || {}).forEach(([part, act]) => {
          const before = defaultControls(model)
          expect(act(before), part).not.toEqual(before)
        })
      })
    })
  })

  it('gives the page a simulation with layers taken from the model', () => {
    const lesson = lessonFor('11-25')
    const simulation = deviceSimulation(lesson, { checkpoints: [] }, getDeviceModel(lesson))
    expect(simulation.modelId).toBe('device')
    expect(simulation.layers.map((layer) => layer.id)).toEqual(['drive', 'brake', 'principle'])
    expect(simulation.label).toBe('Bài 25')
  })
})
