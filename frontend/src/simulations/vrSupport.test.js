import { describe, expect, it } from 'vitest'
import * as THREE from 'three'

import { VR_EYE_TABLE, VR_TARGET_SIZE, isImmersiveVrSupported, vrStageTransform, wrapText } from './vrSupport'

describe('VR support', () => {
  it('reports no VR when the browser has no WebXR', async () => {
    expect(await isImmersiveVrSupported(undefined)).toBe(false)
    expect(await isImmersiveVrSupported({})).toBe(false)
  })

  it('asks WebXR for an immersive VR session and survives a refusal', async () => {
    expect(await isImmersiveVrSupported({ isSessionSupported: async (mode) => mode === 'immersive-vr' })).toBe(true)
    expect(await isImmersiveVrSupported({ isSessionSupported: async () => { throw new Error('blocked') } })).toBe(false)
  })

  it('scales the model to table size and centres it in front of the viewer', () => {
    const size = new THREE.Vector3(6, 3, 2)
    const center = new THREE.Vector3(1, 0.5, 0)
    const { scale, position } = vrStageTransform(size, center)
    expect(scale * 6).toBeCloseTo(VR_TARGET_SIZE)
    const placedCenter = center.clone().multiplyScalar(scale).add(position)
    expect(placedCenter.x).toBeCloseTo(0)
    expect(placedCenter.y).toBeCloseTo(VR_EYE_TABLE.height)
    expect(placedCenter.z).toBeCloseTo(-VR_EYE_TABLE.distance)
  })

  it('wraps a note at spaces and shortens a long one', () => {
    expect(wrapText('Nối pít tông với trục khuỷu để truyền lực', 20)).toEqual(['Nối pít tông với', 'trục khuỷu để truyền', 'lực'])
    const lines = wrapText('một hai ba bốn năm sáu bảy tám chín mười', 8, 2)
    expect(lines).toHaveLength(2)
    expect(lines[1].endsWith('…')).toBe(true)
  })
})
