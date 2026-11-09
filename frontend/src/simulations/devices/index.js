// Interactive 3D models of devices taught by their structure and working principle. A lesson listed here gets
// one of these instead of a block diagram; every model also works in a VR headset.
import brake from './brake'
import driveline from './driveline'
import engineSystems from './engineSystems'
import { generator, powerPlant } from './generator'
import lathe from './lathe'
import microcontroller from './microcontroller'
import stairLight from './stairLight'
import steering from './steering'
import suspension from './suspension'

export const DEVICE_MODELS = [lathe, engineSystems, driveline, suspension, steering, brake, generator, powerPlant, stairLight, microcontroller]

const byKey = new Map(DEVICE_MODELS.flatMap((model) => model.keys.map((key) => [key, model])))

const lessonKey = (lesson) => {
  const number = Number(String(lesson?.title || '').match(/^Bài\s+(\d+)/)?.[1])
  return number ? `${Number(lesson.grade_level)}-${number}` : ''
}

export const getDeviceModel = (lesson) => byKey.get(lessonKey(lesson)) || null

export const defaultControls = (model) =>
  Object.fromEntries((model?.controls || []).map((control) => [control.id, control.default]))

/** The simulation description the page uses, built from a device model. */
export const deviceSimulation = (lesson, base, model) => ({
  ...base,
  modelId: 'device',
  device: model,
  label: `Bài ${lessonKey(lesson).split('-')[1]}`,
  title: model.title,
  subtitle: model.subtitle,
  objective: model.objective,
  layers: model.layers.map(({ id, name, note }) => ({ id, name, note })),
  checkpoints: model.checkpoints,
})
