// Three-phase generator (Công nghệ 12, Kết nối tri thức, Bài 3) and a power plant turning it (Bài 5).
import * as THREE from 'three'
import { alongZ, box, coil, cylinder, flow, group, label, pipe, ring, seeThrough, tag } from './kit'
import { generatorFrequency, lineVoltage, threePhase } from './principles'

const PHASE_COLORS = [0xeab308, 0x16a34a, 0xdc2626] // A yellow, B green, C red, as on Vietnamese switchboards
const PHASE_NAMES = ['A', 'B', 'C']
const PHASE_VOLTS = 220
const SLOW = 0.02 // the rotor is drawn far slower than its real 3000 rpm

const SOURCES = {
  hydro: { name: 'Thủy điện', chain: 'Thế năng của nước → động năng tua bin → điện năng', fluid: 0x38bdf8 },
  thermal: { name: 'Nhiệt điện', chain: 'Hóa năng nhiên liệu → nhiệt năng của hơi nước → cơ năng tua bin → điện năng', fluid: 0xe5e7eb },
  wind: { name: 'Điện gió', chain: 'Động năng của gió → cơ năng cánh quạt → điện năng', fluid: 0xbae6fd },
}

const baseParts = {
  stator: { name: 'Stato (phần tĩnh)', role: 'Lõi thép đứng yên mang ba cuộn dây pha đặt lệch nhau 120° trong không gian.' },
  coilA: { name: 'Cuộn dây pha A', role: 'Từ thông của rôto quay qua cuộn dây tạo ra sức điện động pha A.' },
  coilB: { name: 'Cuộn dây pha B', role: 'Đặt lệch cuộn A 120°, nên sức điện động pha B chậm pha 120° so với pha A.' },
  coilC: { name: 'Cuộn dây pha C', role: 'Đặt lệch cuộn B 120°, sức điện động pha C chậm thêm 120°.' },
  rotor: { name: 'Rôto (nam châm điện)', role: 'Phần quay tạo từ trường quay; quay 3000 vòng/phút cho dòng điện 50 Hz với một cặp cực.' },
  shaft: { name: 'Trục', role: 'Nối rôto với nguồn động lực (tua bin) làm rôto quay.' },
  loads: { name: 'Tải ba pha', role: 'Ba bóng đèn nối vào ba pha; độ sáng thay đổi theo điện áp tức thời của từng pha.' },
}

const makeGenerator = ({ withPlant }) => ({
  keys: withPlant ? ['12-5'] : ['12-3'],
  title: withPlant ? 'Nhà máy điện: tua bin quay máy phát' : 'Máy phát điện xoay chiều ba pha',
  subtitle: withPlant
    ? 'Nguồn năng lượng làm quay tua bin, tua bin quay rôto máy phát điện ba pha.'
    : 'Rôto nam châm quay trong ba cuộn dây lệch nhau 120° tạo ra ba sức điện động lệch pha 120°.',
  task: withPlant
    ? 'Chọn lần lượt thủy điện, nhiệt điện, điện gió và mô tả chuỗi biến đổi năng lượng. Giảm tốc độ quay về 1500 vòng/phút: tần số thay đổi thế nào?'
    : 'Quan sát lúc điện áp pha A cực đại và vị trí rôto lúc đó. Cộng ba điện áp tức thời ở hai thời điểm bất kì. So sánh điện áp dây khi nối sao và nối tam giác.',
  objective: withPlant
    ? 'Mô tả quá trình biến đổi năng lượng trong nhà máy thủy điện, nhiệt điện và điện gió; nhận biết tua bin và máy phát điện.'
    : 'Giải thích nguyên lí tạo ra dòng điện ba pha và quan hệ giữa điện áp dây, điện áp pha khi nối hình sao, hình tam giác.',
  hint: 'Chuyển động được làm chậm rất nhiều để quan sát; số liệu tính theo tốc độ thật.',
  parts: withPlant
    ? { ...baseParts, turbine: { name: 'Tua bin', role: 'Biến năng lượng của dòng nước, hơi nước hoặc gió thành cơ năng làm quay trục máy phát.' }, source: { name: 'Nguồn năng lượng', role: 'Dòng nước từ hồ chứa, hơi nước từ lò hơi hoặc luồng gió tác dụng lên tua bin.' } }
    : baseParts,
  layers: withPlant
    ? [
        { id: 'source', name: 'Nguồn năng lượng và tua bin', note: 'Nước, hơi nước hoặc gió làm quay tua bin.', parts: ['source', 'turbine', 'shaft'] },
        { id: 'generator', name: 'Máy phát điện', note: 'Tua bin quay rôto; từ trường quay cắt các cuộn dây stato tạo ra điện năng.', parts: ['rotor', 'stator', 'coilA', 'coilB', 'coilC'] },
        { id: 'output', name: 'Điện năng tới tải', note: 'Điện năng được đưa lên lưới (qua máy biến áp) tới nơi tiêu thụ.', parts: ['loads'] },
      ]
    : [
        { id: 'structure', name: 'Cấu tạo máy phát', note: 'Stato mang ba cuộn dây A, B, C lệch nhau 120°; rôto là nam châm quay.', parts: ['stator', 'rotor', 'shaft'] },
        { id: 'phases', name: 'Ba sức điện động lệch pha', note: 'Mỗi cuộn dây có một sức điện động hình sin; ba sức điện động lệch nhau 120°, tổng tại mọi thời điểm bằng 0.', parts: ['coilA', 'coilB', 'coilC'] },
        { id: 'connection', name: 'Nối sao, nối tam giác', note: 'Nối sao: điện áp dây bằng √3 lần điện áp pha. Nối tam giác: điện áp dây bằng điện áp pha.', parts: ['loads'] },
      ],
  controls: withPlant
    ? [
        { id: 'source', label: 'Nguồn năng lượng', type: 'choice', default: 'hydro', options: Object.entries(SOURCES).map(([id, item]) => [id, item.name]) },
        { id: 'rpm', label: 'Tốc độ quay', type: 'slider', min: 0, max: 3000, step: 100, default: 3000, format: (value) => `${value} vòng/phút` },
      ]
    : [
        { id: 'connection', label: 'Cách nối', type: 'choice', default: 'star', options: [['star', 'Hình sao'], ['delta', 'Hình tam giác']] },
        { id: 'rpm', label: 'Tốc độ quay', type: 'slider', min: 0, max: 3000, step: 100, default: 3000, format: (value) => `${value} vòng/phút` },
      ],
  checkpoints: withPlant
    ? [
        'Nhà máy thủy điện: thế năng của nước làm quay tua bin, tua bin quay máy phát điện.',
        'Nhà máy nhiệt điện: nhiên liệu đốt nóng nước thành hơi, hơi nước làm quay tua bin.',
        'Điện gió: gió làm quay cánh quạt, qua hộp số quay máy phát điện.',
      ]
    : [
        'Máy phát điện ba pha có ba cuộn dây đặt lệch nhau 120° trên stato, rôto là nam châm quay.',
        'Ba sức điện động có cùng biên độ, tần số và lệch pha nhau 120°.',
        'Nối hình sao: Ud = √3·Up; nối hình tam giác: Ud = Up.',
      ],
  readouts(state, controls) {
    const volts = (state.phases || [0, 0, 0]).map((value) => Math.round(value))
    const rows = [
      { label: 'Tần số f = p·n/60', value: `${generatorFrequency(controls.rpm).toFixed(0)} Hz` },
      ...PHASE_NAMES.map((name, index) => ({ label: `Điện áp tức thời pha ${name}`, value: `${volts[index]} V` })),
    ]
    if (withPlant) {
      const source = SOURCES[controls.source]
      return [{ label: 'Biến đổi năng lượng', value: source.chain }, ...rows.slice(0, 2)]
    }
    return [
      ...rows,
      { label: `Điện áp dây (${controls.connection === 'star' ? 'sao' : 'tam giác'})`, value: `${Math.round(lineVoltage(PHASE_VOLTS, controls.connection))} V` },
    ]
  },
  build() {
    const root = new THREE.Group()
    root.add(tag(ring(1.35, 0.22, seeThrough(0x64748b, 0.5)), 'stator'))
    const coils = PHASE_COLORS.map((color, index) => {
      const angle = Math.PI / 2 - (index * 2 * Math.PI) / 3
      const holder = group()
      holder.rotation.z = angle - Math.PI / 2
      const winding = tag(coil(0.25, 0.42, 6, 0.035, color), `coil${PHASE_NAMES[index]}`)
      winding.position.set(-0.0, 0.8, 0)
      const core = tag(box(0.22, 0.45, 0.22, 0x475569, 0, 1.02, 0), `coil${PHASE_NAMES[index]}`)
      holder.add(winding, core)
      root.add(holder)
      return { winding, color }
    })
    // North pole red, south pole blue
    const rotor = tag(group(box(0.34, 0.58, 0.34, 0xdc2626, 0, 0.3, 0), box(0.34, 0.58, 0.34, 0x2563eb, 0, -0.3, 0)), 'rotor')
    root.add(rotor)
    const shaft = tag(alongZ(cylinder(0.07, withPlant ? 4 : 1.8, 0x94a3b8, 0, 0, withPlant ? -1.6 : 0)), 'shaft')
    root.add(shaft)

    // Three loads on a bar, each lit by its own phase
    const lamps = PHASE_COLORS.map((color, index) => {
      const lamp = tag(new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 14), new THREE.MeshStandardMaterial({ color: 0xfef9c3, emissive: 0xfacc15, emissiveIntensity: 0 })), 'loads')
      lamp.position.set(2.6, 0.9 - index * 0.75, 0)
      const wire = tag(pipe([[1.35, 0.6 - index * 0.55, 0], [2.0, 0.9 - index * 0.75, 0], [2.4, 0.9 - index * 0.75, 0]], 0.025, color), 'loads')
      root.add(lamp, wire)
      return lamp
    })

    const extras = {}
    if (withPlant) {
      const turbine = tag(group(alongZ(cylinder(0.25, 0.3, 0x0f766e))), 'turbine')
      for (let index = 0; index < 8; index += 1) {
        const blade = tag(box(0.12, 0.85, 0.05, 0x14b8a6, 0, 0.6, 0), 'turbine')
        blade.rotation.y = 0.5
        const holder = group(blade)
        holder.rotation.z = (index / 8) * Math.PI * 2
        turbine.add(holder)
      }
      turbine.position.set(0, 0, -3.3)
      root.add(turbine, tag(ring(1.15, 0.06, seeThrough(0x64748b, 0.4), 0, 0, -3.3), 'turbine'))
      const stream = tag(pipe([[-3.2, 1.6, -3.3], [-1.6, 0.9, -3.3], [-0.7, 0.4, -3.3], [0.6, -0.4, -3.3], [2.2, -1.0, -3.3]], 0.22, seeThrough(0x38bdf8, 0.25)), 'source')
      root.add(stream)
      extras.turbine = turbine
      extras.stream = stream
      extras.fluid = flow(stream.userData.curve, 0x38bdf8, 18, 0.09)
      root.add(...extras.fluid.beads)
    }

    const annotations = [
      label(root, 'Stato', -1.45, 1.25, 0),
      label(coils[0].winding.parent, 'Cuộn dây pha A', 0, 1.35, 0),
      label(coils[1].winding.parent, 'Pha B', 0, 1.35, 0, true),
      label(coils[2].winding.parent, 'Pha C', 0, 1.35, 0, true),
      label(root, 'Rôto (nam châm)', 0.45, 0.2, 0.4),
      label(root, 'Tải ba pha', 2.6, 1.35, 0),
      ...(withPlant ? [label(root, 'Tua bin', 0, 1.25, -3.3), label(root, 'Nguồn năng lượng', -2.4, 1.6, -3.3)] : []),
    ]

    let angle = 0
    let lastTime = 0
    let shown = ''
    return {
      root,
      annotations,
      floorY: -1.8,
      framing: withPlant
        ? { center: new THREE.Vector3(0.3, 0, -1.6), width: 7, height: 4.2, direction: new THREE.Vector3(0.9, 0.35, 0.75).normalize() }
        : { center: new THREE.Vector3(0.6, 0, 0), width: 5.6, height: 3.8, direction: new THREE.Vector3(0.15, 0.15, 1).normalize() },
      update(time, controls) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        angle += (controls.rpm / 60) * Math.PI * 2 * dt * SLOW
        rotor.rotation.z = -angle
        shaft.rotation.z = -angle
        // The voltage of each phase peaks when a pole of the rotor faces its coil
        const peak = PHASE_VOLTS * Math.SQRT2 * (controls.rpm / 3000)
        const phases = threePhase(angle + Math.PI / 2, peak)
        phases.forEach((value, index) => {
          const share = peak ? Math.abs(value) / (PHASE_VOLTS * Math.SQRT2) : 0
          lamps[index].material.emissiveIntensity = share * 1.6
          coils[index].winding.material.emissive.setHex(coils[index].color)
          coils[index].winding.material.emissiveIntensity = share * 0.7
        })
        if (withPlant) {
          extras.turbine.rotation.z = -angle
          const source = SOURCES[controls.source]
          if (shown !== controls.source) {
            shown = controls.source
            extras.fluid.beads.forEach((bead) => bead.material.color.setHex(source.fluid))
          }
          extras.fluid.update(time, (controls.rpm / 3000) * 0.5, controls.rpm > 0)
        }
        return { phases }
      },
    }
  },
})

export const generator = makeGenerator({ withPlant: false })
export const powerPlant = makeGenerator({ withPlant: true })
