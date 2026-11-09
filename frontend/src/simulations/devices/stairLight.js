// Staircase light switched from two places, Công nghệ 12 (Kết nối tri thức), Bài 10.
import * as THREE from 'three'
import { box, cylinder, flow, group, label, pipe, seeThrough, tag } from './kit'
import { staircaseLamp } from './principles'

// Wire routes. Switch commons: lower at (-2.4, 0.6), upper at (2.4, 2.6); travellers 1 and 2 run between them.
const LOWER = new THREE.Vector3(-2.4, 0.6, 0.12)
const UPPER = new THREE.Vector3(2.4, 2.6, 0.12)
const LAMP = new THREE.Vector3(0, 3.3, 0.12)

const switchPosition = (on) => (on ? 'nối dây 1' : 'nối dây 2')

export default {
  keys: ['12-10'],
  title: 'Mạch đèn cầu thang hai công tắc ba cực',
  subtitle: 'Một bóng đèn được bật, tắt ở hai nơi: chân cầu thang và đầu cầu thang.',
  task: 'Gạt hai công tắc theo bốn trạng thái, lập bảng trạng thái của đèn. Lần theo đường dòng điện khi đèn sáng và giải thích vai trò của hai dây liên lạc.',
  objective: 'Giải thích nguyên lí mạch đèn cầu thang dùng hai công tắc ba cực và lần theo đường đi của dòng điện khi đèn sáng.',
  hint: 'Bấm trực tiếp vào từng công tắc trên tường để gạt. Các hạt sáng là đường dòng điện đang đi qua.',
  parts: {
    source: { name: 'Nguồn điện (dây pha và dây trung tính)', role: 'Cấp điện 220 V cho mạch; dây pha đi qua công tắc, dây trung tính nối thẳng tới đèn.' },
    lower: { name: 'Công tắc ba cực ở chân cầu thang', role: 'Cực giữa nối dây pha; gạt để nối cực giữa với dây liên lạc 1 hoặc dây liên lạc 2.' },
    upper: { name: 'Công tắc ba cực ở đầu cầu thang', role: 'Cực giữa nối tới đèn; gạt để nối cực giữa với dây liên lạc 1 hoặc dây liên lạc 2.' },
    traveller1: { name: 'Dây liên lạc 1', role: 'Nối cực thứ nhất của hai công tắc ba cực.' },
    traveller2: { name: 'Dây liên lạc 2', role: 'Nối cực thứ hai của hai công tắc ba cực.' },
    lamp: { name: 'Bóng đèn', role: 'Sáng khi hai công tắc cùng nối vào một dây liên lạc, mạch kín.' },
    stairs: { name: 'Cầu thang', role: 'Hai công tắc đặt ở hai đầu để bật, tắt đèn ở bất kì đầu nào.' },
  },
  layers: [
    { id: 'source', name: 'Nguồn và dây dẫn', note: 'Dây pha đi qua hai công tắc tới đèn; dây trung tính nối thẳng tới đèn.', parts: ['source'] },
    { id: 'switches', name: 'Hai công tắc ba cực', note: 'Mỗi công tắc có một cực chung và hai cực nối với hai dây liên lạc.', parts: ['lower', 'upper', 'traveller1', 'traveller2'] },
    { id: 'principle', name: 'Nguyên lí', note: 'Đèn sáng khi hai công tắc cùng nối vào một dây liên lạc; gạt bất kì công tắc nào cũng đổi trạng thái của đèn.', parts: ['lower', 'upper', 'lamp'] },
  ],
  controls: [
    { id: 'lower', label: 'Công tắc chân cầu thang', type: 'toggle', default: true, on: 'Dây 1', off: 'Dây 2' },
    { id: 'upper', label: 'Công tắc đầu cầu thang', type: 'toggle', default: false, on: 'Dây 1', off: 'Dây 2' },
  ],
  interactions: {
    lower: (controls) => ({ ...controls, lower: !controls.lower }),
    upper: (controls) => ({ ...controls, upper: !controls.upper }),
  },
  checkpoints: [
    'Mạch đèn cầu thang dùng hai công tắc ba cực nối với nhau bằng hai dây liên lạc.',
    'Đèn sáng khi cực chung của hai công tắc cùng nối vào một dây liên lạc.',
    'Gạt một trong hai công tắc luôn làm đèn đổi trạng thái: đang sáng thì tắt, đang tắt thì sáng.',
  ],
  readouts(state, controls) {
    const on = staircaseLamp(controls.lower, controls.upper)
    return [
      { label: 'Công tắc dưới', value: switchPosition(controls.lower) },
      { label: 'Công tắc trên', value: switchPosition(controls.upper) },
      { label: 'Bóng đèn', value: on ? 'Sáng' : 'Tắt' },
      { label: 'Dòng điện đi qua', value: on ? (controls.lower ? 'Dây liên lạc 1' : 'Dây liên lạc 2') : 'Mạch hở' },
    ]
  },
  build() {
    const root = new THREE.Group()
    // Stairs and two walls
    const stairs = group()
    for (let step = 0; step < 10; step += 1) stairs.add(box(0.48, 0.2 * (step + 1), 1.4, 0xd6d3d1, -2.2 + step * 0.48, -1 + 0.1 * (step + 1), 0.9))
    root.add(tag(stairs, 'stairs'))
    root.add(box(6.2, 4.8, 0.1, seeThrough(0xf1f5f9, 0.6), 0, 1.4, -0.05))

    root.add(tag(group(box(0.6, 0.8, 0.25, 0x334155, -3.3, 2.6, 0.12), box(0.4, 0.12, 0.27, 0xdc2626, -3.3, 2.75, 0.13)), 'source'))
    const switchBox = (at, part) => {
      const plate = tag(box(0.42, 0.6, 0.08, 0xf8fafc, at.x, at.y, at.z), part)
      const lever = tag(box(0.1, 0.32, 0.1, 0x1f2937, 0, 0.12, 0), part)
      const pivot = group(lever)
      pivot.position.set(at.x, at.y, at.z + 0.08)
      root.add(plate, pivot)
      return pivot
    }
    const lowerLever = switchBox(LOWER, 'lower')
    const upperLever = switchBox(UPPER, 'upper')

    const lampGlass = tag(new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), new THREE.MeshStandardMaterial({ color: 0xfef9c3, emissive: 0xfacc15, emissiveIntensity: 0, transparent: true, opacity: 0.9 })), 'lamp')
    lampGlass.position.copy(LAMP)
    root.add(lampGlass, tag(cylinder(0.12, 0.2, 0x94a3b8, LAMP.x, LAMP.y + 0.28, LAMP.z), 'lamp'))
    const light = new THREE.PointLight(0xfde68a, 0, 6)
    light.position.copy(LAMP)
    root.add(light)

    const wire = (points, color, part) => {
      const item = tag(pipe(points, 0.03, color), part)
      root.add(item)
      return item
    }
    const phase = wire([[-3.1, 2.4, 0.12], [-2.9, 1.2, 0.12], [-2.6, 0.75, 0.12], [LOWER.x, LOWER.y + 0.1, 0.12]], 0xdc2626, 'source')
    const t1 = wire([[LOWER.x + 0.12, LOWER.y + 0.25, 0.14], [-1.2, 1.9, 0.14], [1.2, 2.95, 0.14], [UPPER.x - 0.12, UPPER.y + 0.25, 0.14]], 0x2563eb, 'traveller1')
    const t2 = wire([[LOWER.x + 0.12, LOWER.y - 0.2, 0.1], [-0.6, 0.9, 0.1], [1.6, 1.8, 0.1], [UPPER.x - 0.12, UPPER.y - 0.2, 0.1]], 0x0d9488, 'traveller2')
    const toLamp = wire([[UPPER.x, UPPER.y + 0.3, 0.12], [1.6, 3.35, 0.12], [0.3, LAMP.y, 0.12]], 0xdc2626, 'upper')
    const neutral = wire([[-0.3, LAMP.y, 0.12], [-1.8, 3.6, 0.12], [-3.1, 2.9, 0.12]], 0x1e3a8a, 'source')
    const currents = [phase, t1, t2, toLamp, neutral].map((item) => {
      const beads = flow(item.userData.curve, 0xfde047, 10, 0.05)
      root.add(...beads.beads)
      return beads
    })

    const annotations = [
      label(root, 'Nguồn điện', -3.3, 3.15, 0.15),
      label(root, 'Công tắc ba cực (dưới)', LOWER.x, LOWER.y + 0.55, 0.2),
      label(root, 'Công tắc ba cực (trên)', UPPER.x, UPPER.y + 0.55, 0.2),
      label(root, 'Dây liên lạc 1', 0, 2.55, 0.15, true),
      label(root, 'Dây liên lạc 2', 0.4, 1.25, 0.15, true),
      label(root, 'Bóng đèn', 0, 3.75, 0.15),
    ]

    const levers = [lowerLever, upperLever]
    return {
      root,
      annotations,
      floorY: -1.05,
      framing: { center: new THREE.Vector3(0, 1.4, 0), width: 7.4, height: 5.2, direction: new THREE.Vector3(0.1, 0.12, 1).normalize() },
      update(time, controls) {
        const on = staircaseLamp(controls.lower, controls.upper)
        levers.forEach((lever, index) => { lever.rotation.z = (index === 0 ? controls.lower : controls.upper) ? 0.5 : -0.5 })
        lampGlass.material.emissiveIntensity = on ? 1.4 : 0
        light.intensity = on ? 2.5 : 0
        // Current runs along the closed path only: phase, the traveller both switches select, lamp, neutral
        const used = controls.lower ? 1 : 2
        currents.forEach((item, index) => {
          const active = on && (index === 0 || index === 3 || index === 4 || index === used)
          item.update(time, 0.35, active)
        })
        return { on }
      },
    }
  },
}
