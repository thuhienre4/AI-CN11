// A microcontroller board with a light sensor and an LED, Công nghệ 12 (Kết nối tri thức), Bài 24, 25, 26.
import * as THREE from 'three'
import { box, cylinder, flow, group, label, pipe, tag } from './kit'
import { ledPwmForLight, lightToAnalog } from './principles'

const PCB = 0x1d4ed8

export default {
  keys: ['12-24', '12-25', '12-26'],
  title: 'Bo mạch vi điều khiển, cảm biến ánh sáng và LED',
  subtitle: 'Khối đầu vào (cảm biến), khối xử lí (vi điều khiển, bộ nhớ), khối đầu ra (LED) trên một bo mạch lập trình.',
  task: 'Chỉ ra khối đầu vào, khối xử lí, khối đầu ra trên bo mạch. Chạy chương trình nháy LED, sau đó chương trình tự điều chỉnh độ sáng: ghi giá trị analogRead và PWM khi ánh sáng 5, 100 và 800 lux.',
  objective: 'Nhận biết các khối của một hệ thống dùng vi điều khiển và các bộ phận của bo mạch lập trình; giải thích chương trình tự điều chỉnh độ sáng LED theo ánh sáng môi trường.',
  hint: 'Kéo ánh sáng môi trường hoặc bấm vào quang trở để đổi ánh sáng; bấm nút Reset để chạy lại chương trình.',
  parts: {
    mcu: { name: 'Vi điều khiển', role: 'Bộ xử lí trung tâm, bộ nhớ chương trình, bộ nhớ dữ liệu và các cổng vào/ra trong một vi mạch; thực hiện chương trình đã nạp.' },
    usb: { name: 'Cổng USB', role: 'Nạp chương trình từ máy tính (Arduino IDE) và cấp nguồn 5 V cho bo mạch.' },
    power: { name: 'Giắc nguồn và ổn áp', role: 'Nhận nguồn ngoài, ổn áp thành 5 V và 3,3 V cho bo mạch.' },
    crystal: { name: 'Bộ tạo dao động thạch anh', role: 'Tạo xung nhịp 16 MHz cho vi điều khiển.' },
    reset: { name: 'Nút Reset', role: 'Khởi động lại vi điều khiển, chương trình chạy lại từ đầu.' },
    digital: { name: 'Chân vào/ra số (D0–D13)', role: 'Đọc hoặc xuất tín hiệu 0/1; các chân có dấu ~ xuất được tín hiệu PWM để điều chỉnh độ sáng LED.' },
    analog: { name: 'Chân vào tương tự (A0–A5)', role: 'Đọc điện áp 0–5 V thành giá trị số 0–1023 qua bộ chuyển đổi tương tự – số.' },
    ledL: { name: 'LED trên bo (chân 13)', role: 'LED gắn sẵn, thường dùng cho chương trình nháy LED đầu tiên.' },
    ldr: { name: 'Quang trở (cảm biến ánh sáng)', role: 'Điện trở giảm khi ánh sáng tăng; ghép với điện trở cố định thành cầu phân áp đưa vào chân A0.' },
    led: { name: 'LED ngoài (khối đầu ra)', role: 'Nối chân ~9 qua điện trở hạn dòng; độ sáng thay đổi theo độ rộng xung PWM.' },
    breadboard: { name: 'Bo mạch thử (breadboard)', role: 'Cắm linh kiện và dây nối không cần hàn.' },
  },
  layers: [
    { id: 'input', name: 'Khối đầu vào', note: 'Quang trở cảm nhận ánh sáng; chân A0 đọc điện áp phân áp thành số 0–1023.', parts: ['ldr', 'analog'] },
    { id: 'process', name: 'Khối xử lí', note: 'Vi điều khiển, thạch anh, nút Reset; chương trình được nạp qua cổng USB.', parts: ['mcu', 'crystal', 'reset', 'usb', 'power'] },
    { id: 'output', name: 'Khối đầu ra', note: 'Chân ~9 xuất PWM 0–255 làm LED sáng mờ hoặc sáng rõ; LED chân 13 dùng để nháy.', parts: ['digital', 'led', 'ledL'] },
  ],
  controls: [
    { id: 'program', label: 'Chương trình', type: 'choice', default: 'auto', options: [['blink', 'Nháy LED (Bài 25)'], ['auto', 'Tự điều chỉnh độ sáng (Bài 26)']] },
    { id: 'lux', label: 'Ánh sáng môi trường', type: 'slider', min: 1, max: 1000, step: 1, default: 80, format: (value) => `${value} lux` },
  ],
  interactions: {
    ldr: (controls) => ({ ...controls, lux: controls.lux >= 500 ? 5 : controls.lux >= 50 ? 800 : 200 }),
    reset: (controls) => ({ ...controls, resetAt: Date.now() }),
  },
  checkpoints: [
    'Hệ thống dùng vi điều khiển gồm khối đầu vào (cảm biến), khối xử lí (vi điều khiển) và khối đầu ra (cơ cấu chấp hành, hiển thị).',
    'Bo mạch lập trình có vi điều khiển, cổng nạp chương trình, nguồn, chân vào/ra số và chân vào tương tự.',
    'Chương trình đọc giá trị cảm biến ánh sáng, trời càng tối thì LED càng sáng.',
  ],
  readouts(state, controls) {
    const analog = lightToAnalog(controls.lux)
    const pwm = controls.program === 'auto' ? ledPwmForLight(controls.lux) : 0
    return [
      { label: 'analogRead(A0)', value: String(analog) },
      { label: 'analogWrite(9, …)', value: controls.program === 'auto' ? String(pwm) : '—' },
      { label: 'Độ sáng LED ngoài', value: controls.program === 'auto' ? `${Math.round((pwm / 255) * 100)}%` : 'tắt' },
      { label: 'LED chân 13', value: controls.program === 'blink' ? (state.blinkOn ? 'sáng' : 'tắt') : 'tắt' },
    ]
  },
  build() {
    const root = new THREE.Group()
    root.add(box(3.4, 0.08, 2.4, PCB, -1.3, 0, 0))
    root.add(tag(group(box(1.5, 0.18, 0.5, 0x111827, -1.1, 0.13, 0.1), ...Array.from({ length: 14 }, (_, index) => box(0.04, 0.1, 0.12, 0xd1d5db, -1.75 + index * 0.1, 0.05, 0.4))), 'mcu'))
    root.add(tag(box(0.6, 0.4, 0.55, 0x9ca3af, -3.0, 0.24, 0.55), 'usb'))
    root.add(tag(group(box(0.55, 0.45, 0.45, 0x111827, -3.0, 0.26, -0.55), box(0.25, 0.18, 0.15, 0x111827, -2.35, 0.13, -0.85)), 'power'))
    root.add(tag(box(0.3, 0.12, 0.12, 0xe5e7eb, -1.8, 0.1, -0.45), 'crystal'))
    const resetButton = tag(group(box(0.22, 0.08, 0.22, 0xe5e7eb, -2.75, 0.08, 1.0), cylinder(0.07, 0.08, 0xdc2626, -2.75, 0.16, 1.0)), 'reset')
    root.add(resetButton)
    root.add(tag(box(2.4, 0.22, 0.14, 0x111827, -0.8, 0.15, -1.1), 'digital'))
    root.add(tag(box(1.1, 0.22, 0.14, 0x111827, -0.5, 0.15, 1.1), 'analog'))
    const ledL = tag(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.07), new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0 })), 'ledL')
    ledL.position.set(-1.9, 0.08, -0.75)
    root.add(ledL)

    // Breadboard with the sensor divider and the LED
    root.add(tag(box(2.6, 0.2, 1.8, 0xf8fafc, 2.0, 0.06, 0), 'breadboard'))
    const ldr = tag(group(cylinder(0.16, 0.06, 0xb45309, 1.3, 0.45, 0.4), cylinder(0.02, 0.35, 0x9ca3af, 1.24, 0.25, 0.4), cylinder(0.02, 0.35, 0x9ca3af, 1.36, 0.25, 0.4)), 'ldr')
    const led = tag(group(cylinder(0.12, 0.25, 0xfecaca, 2.8, 0.45, -0.35), cylinder(0.02, 0.3, 0x9ca3af, 2.75, 0.22, -0.35)), 'led')
    const ledHead = led.children[0]
    ledHead.material = new THREE.MeshStandardMaterial({ color: 0xfecaca, emissive: 0xef4444, emissiveIntensity: 0 })
    root.add(ldr, led, tag(box(0.4, 0.08, 0.08, 0xd6b38a, 1.9, 0.22, 0.4), 'breadboard'), tag(box(0.4, 0.08, 0.08, 0xd6b38a, 2.3, 0.22, -0.35), 'breadboard'))
    const glow = new THREE.PointLight(0xef4444, 0, 2)
    glow.position.set(2.8, 0.7, -0.35)
    root.add(glow)
    const sun = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 12), new THREE.MeshBasicMaterial({ color: 0xfde047 }))
    sun.position.set(1.3, 1.6, 0.4)
    sun.userData.decor = true
    root.add(sun)

    const wire = (points, color) => {
      const item = tag(pipe(points, 0.025, color), 'breadboard')
      root.add(item)
      return item
    }
    const toA0 = wire([[-0.6, 0.27, 1.1], [0.2, 0.6, 1.0], [1.3, 0.3, 0.55]], 0x16a34a)
    const toD9 = wire([[-0.4, 0.27, -1.1], [0.8, 0.6, -0.9], [2.3, 0.3, -0.45]], 0xf97316)
    wire([[-1.6, 0.27, 1.1], [0.5, 0.5, 1.3], [1.7, 0.25, 0.75]], 0xdc2626)
    wire([[-1.4, 0.27, 1.1], [0.6, 0.45, 1.45], [3.1, 0.25, -0.6]], 0x111827)
    const signals = [flow(toA0.userData.curve, 0x86efac, 6, 0.04), flow(toD9.userData.curve, 0xfdba74, 6, 0.04)]
    signals.forEach((item) => root.add(...item.beads))

    const annotations = [
      label(root, 'Vi điều khiển', -1.1, 0.5, 0.1),
      label(root, 'Cổng USB', -3.0, 0.65, 0.55),
      label(root, 'Nút Reset', -2.75, 0.45, 1.0, true),
      label(root, 'Chân vào/ra số', -0.8, 0.5, -1.1, true),
      label(root, 'Chân tương tự A0–A5', -0.5, 0.5, 1.1, true),
      label(root, 'Quang trở', 1.3, 0.8, 0.4),
      label(root, 'LED', 2.8, 0.85, -0.35),
    ]

    let lastReset = 0
    let resetTime = 0
    return {
      root,
      annotations,
      floorY: -0.6,
      framing: { center: new THREE.Vector3(0.2, 0.3, 0), width: 7.2, height: 3.4, direction: new THREE.Vector3(0.2, 1.1, 0.9).normalize() },
      update(time, controls) {
        if (controls.resetAt && controls.resetAt !== lastReset) {
          lastReset = controls.resetAt
          resetTime = time
        }
        const sinceReset = time - resetTime
        const booting = sinceReset < 0.6 // the board restarts after Reset: outputs off for a moment
        const blinkOn = !booting && controls.program === 'blink' && Math.floor(sinceReset) % 2 === 0
        const pwm = !booting && controls.program === 'auto' ? ledPwmForLight(controls.lux) : 0
        ledL.material.emissiveIntensity = blinkOn ? 1.5 : 0
        ledHead.material.emissiveIntensity = (pwm / 255) * 1.8
        glow.intensity = (pwm / 255) * 2.5
        sun.material.color.setHSL(0.15, 1, 0.2 + 0.6 * Math.min(1, controls.lux / 1000))
        signals[0].update(time, 0.6, !booting)
        signals[1].update(time, 0.6, !booting && controls.program === 'auto' && pwm > 0)
        resetButton.position.y = booting && sinceReset < 0.2 ? -0.04 : 0
        return { blinkOn, pwm }
      },
    }
  },
}
