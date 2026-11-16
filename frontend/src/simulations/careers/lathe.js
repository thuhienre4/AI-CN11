// Thợ vận hành máy tiện (Công nghệ 11, Bài 2): read the drawing, set up, turn a shaft safely, measure it.
// Reuses the lathe of Bài 8 and adds the drawing, the chuck key, a guard, the buttons and the measuring tools.
import * as THREE from 'three'
import latheModel from '../devices/lathe'
import { ball, box, group, label, ring, seeThrough, tag } from '../devices/kit'

const RUN = 5 // after the start button
const STOP = 6 // after the stop button

export default {
  job: 'cnc-operator',
  title: 'Tiện trục theo bản vẽ',
  intro: 'Em là thợ vận hành máy tiện. Hãy tiện một trục theo bản vẽ, an toàn, rồi đo kiểm kết quả.',
  parts: {
    ...latheModel.parts,
    drawing: { name: 'Bản vẽ chi tiết', role: 'Cho biết kích thước, dung sai, vật liệu và yêu cầu kĩ thuật.' },
    chuckKey: { name: 'Khóa mâm cặp', role: 'Siết các chấu của mâm cặp để kẹp chặt phôi. Phải rút ra trước khi chạy máy.' },
    guard: { name: 'Tấm che an toàn', role: 'Chắn phoi nóng và mảnh dao văng ra khi máy cắt.' },
    startButton: { name: 'Nút chạy', role: 'Cho máy chạy.' },
    stopButton: { name: 'Nút dừng', role: 'Dừng trục chính và chạy dao.' },
    micrometer: { name: 'Panme', role: 'Đo đường kính với độ chính xác 0,01 mm.' },
    rule: { name: 'Thước lá', role: 'Đo độ dài với độ chính xác khoảng 1 mm.' },
  },
  steps: [
    { part: 'drawing', instruction: 'Đọc bản vẽ trước khi làm.', done: 'Trục cần tiện xuống Ø44 ± 0,02 mm, vật liệu thép C45.' },
    { part: 'chuckKey', instruction: 'Kẹp chặt phôi vào mâm cặp bằng khóa mâm cặp, rồi rút khóa ra.', done: 'Phôi đã được kẹp chặt, khóa đã rút khỏi mâm cặp.',
      early: 'Đọc bản vẽ trước để biết cần gia công gì.' },
    { part: 'tool', instruction: 'Kiểm tra dao tiện: lưỡi còn sắc, kẹp chắc, đúng tâm.', done: 'Dao đã sẵn sàng.',
      early: 'Kẹp phôi trước, rồi mới chỉnh dao theo phôi.' },
    { part: 'guard', instruction: 'Đóng tấm che an toàn.', done: 'Tấm che đã đóng.',
      early: 'Chuẩn bị phôi và dao xong rồi mới đóng tấm che.' },
    { part: 'startButton', instruction: 'Bấm chạy máy.', done: 'Máy đang tiện. Quan sát qua tấm che.',
      early: (index) => (index < 3 ? 'Chưa sẵn sàng: kiểm tra dao và đóng tấm che trước khi chạy, phoi nóng có thể văng ra.' : null) },
    { part: 'stopButton', instruction: 'Tiện xong, bấm dừng và chờ trục chính dừng hẳn.', done: 'Máy đã dừng hẳn.' },
    { part: 'micrometer', instruction: 'Đo đường kính phần đã tiện.', done: 'Panme đọc 44,01 mm: nằm trong dung sai. Chi tiết đạt.',
      early: (index) => (index === RUN ? 'Không đo khi máy đang chạy: dừng máy trước.' : 'Chưa tiện xong, chưa có gì để đo.') },
  ],
  hazards: {
    rule: 'Thước lá chỉ đọc tới khoảng 1 mm, không đủ chính xác cho dung sai ± 0,02 mm.',
    workpiece: (index) => (index === RUN ? 'Nguy hiểm: không chạm vào phôi đang quay.' : null),
    chuck: (index) => (index === RUN ? 'Nguy hiểm: không chạm vào mâm cặp đang quay.' : null),
  },
  build() {
    const lathe = latheModel.build()
    const root = new THREE.Group()
    root.add(lathe.root)

    // Bench with the drawing and the measuring tools
    root.add(box(1.8, 0.08, 0.7, 0x92400e, 0.2, -0.15, 1.9))
    const drawing = tag(group(box(0.6, 0.01, 0.42, 0xf8fafc, -0.35, -0.1, 1.9), box(0.4, 0.012, 0.03, 0x1e3a8a, -0.35, -0.095, 1.82)), 'drawing')
    const micrometer = tag(group(box(0.3, 0.04, 0.05, 0x9ca3af, 0.35, -0.08, 1.85), box(0.04, 0.16, 0.05, 0x9ca3af, 0.2, -0.02, 1.85), box(0.12, 0.05, 0.05, 0x64748b, 0.5, -0.08, 1.85)), 'micrometer')
    const rule = tag(box(0.6, 0.01, 0.05, 0xd4d4d8, 0.65, -0.1, 2.05), 'rule')
    root.add(drawing, micrometer, rule)

    // Chuck key, in the chuck until the work is clamped, then on the bench
    const keyInChuck = tag(group(box(0.05, 0.4, 0.05, 0x334155, -1.75, 0.75, 0.25), box(0.25, 0.04, 0.04, 0x334155, -1.75, 0.95, 0.25)), 'chuckKey')
    const keyOnBench = tag(group(box(0.4, 0.04, 0.04, 0x334155, 0.9, -0.08, 1.75), box(0.04, 0.04, 0.2, 0x334155, 1.1, -0.08, 1.75)), 'chuckKey')
    root.add(keyInChuck, keyOnBench)

    // Sliding guard in front of the cutting zone
    const guard = tag(group(box(2.6, 1.1, 0.03, seeThrough(0x60a5fa, 0.28), 0, 0, 0), box(2.6, 0.06, 0.06, 0x1e3a8a, 0, 0.55, 0)), 'guard')
    root.add(guard)

    // Buttons on the headstock
    const startButton = tag(ball(0.07, 0x16a34a, -2.0, 0.55, 0.62), 'startButton')
    const stopButton = tag(ball(0.07, 0xdc2626, -2.0, 0.3, 0.62), 'stopButton')
    root.add(startButton, stopButton, ring(0.09, 0.015, 0x111827, -2.0, 0.3, 0.6))

    const annotations = [
      // only the lathe parts this task uses, so the labels do not crowd
      ...lathe.annotations.filter((item) => ['Mâm cặp', 'Phôi', 'Dao tiện'].includes(item.label)),
      label(root, 'Bản vẽ', -0.35, 0.2, 1.9),
      label(root, 'Panme', 0.3, 0.25, 1.85),
      label(root, 'Thước lá', 0.75, 0.15, 2.1),
      label(root, 'Khóa mâm cặp', -1.75, 1.35, 0.3),
      label(root, 'Tấm che', 0.2, 1.45, 0.75),
      label(root, 'Nút chạy', -2.1, 0.85, 0.65),
      label(root, 'Nút dừng', -2.25, 0.25, 0.65),
    ]

    return {
      root,
      annotations,
      floorY: -0.95,
      framing: { center: new THREE.Vector3(-0.3, 0.2, 0.9), width: 7.4, height: 4, direction: new THREE.Vector3(0.15, 0.55, 1).normalize() },
      update(time, { index }) {
        const running = index >= RUN && index < STOP
        lathe.update(time, { rpm: running ? 500 : 0, feeding: running })
        keyInChuck.visible = index < 2
        keyOnBench.visible = index >= 2
        // open: raised behind the machine top; closed: in front of the cutting zone
        guard.position.set(0.2, index >= 4 ? 0.55 : 1.9, index >= 4 ? 0.75 : 0.2)
        return {}
      },
    }
  },
}
