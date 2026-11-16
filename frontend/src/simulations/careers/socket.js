// Thợ lắp đặt điện (Công nghệ 12, Bài 2): install a socket on a branch circuit with the power isolated.
import * as THREE from 'three'
import { ball, box, cylinder, group, label, tag } from '../devices/kit'

const OFF_AFTER = 1 // the branch breaker is off once step 1 is done
const ON_AGAIN = 5 // and on again after step 5

export default {
  job: 'electrician',
  title: 'Lắp ổ cắm cho phòng đang có điện',
  intro: 'Em là thợ lắp đặt điện. Phòng ngủ cần thêm một ổ cắm trên mạch nhánh đang có điện. Hãy làm đúng trình tự an toàn.',
  parts: {
    mainBreaker: { name: 'Aptomat tổng', role: 'Đóng, cắt điện cho cả ngôi nhà.' },
    branchBreaker: { name: 'Aptomat nhánh phòng ngủ', role: 'Đóng, cắt điện riêng cho mạch ổ cắm phòng ngủ.' },
    sign: { name: 'Biển "Cấm đóng điện"', role: 'Báo cho người khác không đóng điện khi đang có người làm việc.' },
    tester: { name: 'Bút thử điện', role: 'Kiểm tra dây có điện hay không: đèn bút sáng khi chạm dây pha có điện.' },
    gloves: { name: 'Găng tay vải', role: 'Giữ tay sạch; không cách điện.' },
    socket: { name: 'Hộp ổ cắm', role: 'Vị trí lắp ổ cắm mới, đã có dây chờ.' },
    screwdriver: { name: 'Tua vít cách điện', role: 'Siết vít đấu dây; cán cách điện.' },
  },
  steps: [
    { part: 'branchBreaker', instruction: 'Ngắt aptomat nhánh của phòng ngủ.', done: 'Mạch ổ cắm phòng ngủ đã được cắt điện.' },
    { part: 'sign', instruction: 'Treo biển "Cấm đóng điện" ở tủ điện.', done: 'Mọi người biết đang có người làm việc trên mạch này.',
      early: 'Ngắt aptomat nhánh trước, rồi treo biển ở aptomat đã ngắt.' },
    { part: 'tester', instruction: 'Thử dây chờ ở hộp ổ cắm bằng bút thử điện.', done: 'Đèn bút không sáng: dây đã hết điện.',
      early: (index) => (index < 1 ? 'Đèn bút sẽ sáng: dây vẫn có điện. Ngắt aptomat nhánh và treo biển trước.' : 'Treo biển báo trước khi bắt đầu làm việc.') },
    { part: 'screwdriver', instruction: 'Đấu dây và lắp ổ cắm bằng tua vít cách điện.', done: 'Ổ cắm đã được lắp chắc chắn.',
      early: 'Nguy hiểm: chưa kiểm tra chắc chắn dây đã hết điện.' },
    { part: 'branchBreaker', instruction: 'Gỡ biển và đóng lại aptomat nhánh.', done: 'Mạch đã có điện trở lại.' },
    { part: 'tester', instruction: 'Thử ổ cắm mới bằng bút thử điện.', done: 'Đèn bút sáng ở lỗ dây pha: ổ cắm đã có điện, đấu đúng.' },
  ],
  hazards: {
    gloves: 'Găng tay vải không cách điện, không bảo vệ được khi chạm dây có điện.',
    mainBreaker: (index) => (index < OFF_AFTER ? 'Ngắt aptomat tổng làm cả nhà mất điện; chỉ cần ngắt aptomat nhánh của mạch đang làm.' : null),
    socket: (index) => (index < 3 ? 'Nguy hiểm: chưa cắt điện và kiểm tra, không chạm vào dây chờ.' : null),
  },
  build() {
    const root = new THREE.Group()
    root.add(box(6, 3, 0.15, 0xf1f5f9, 0, 1.5, -0.6))

    // Distribution board with the main and branch breakers
    root.add(box(1.6, 0.8, 0.12, 0xcbd5e1, -1.6, 1.8, -0.47))
    const breakerAt = (x) => {
      const lever = box(0.08, 0.14, 0.08, 0x111827, x, 1.92, -0.33)
      const item = group(box(0.22, 0.36, 0.1, 0xffffff, x, 1.85, -0.38), lever)
      return { item, lever }
    }
    const main = breakerAt(-2.1)
    const branch = breakerAt(-1.1)
    tag(main.item, 'mainBreaker')
    tag(branch.item, 'branchBreaker')
    const signOnBoard = box(0.5, 0.3, 0.02, 0xdc2626, -1.1, 1.4, -0.33)
    const signOnTable = box(0.4, 0.02, 0.26, 0xdc2626, 1.5, 0.84, 0.75)
    tag(signOnBoard, 'sign')
    tag(signOnTable, 'sign')
    root.add(main.item, branch.item, signOnBoard, signOnTable)

    // Socket box with waiting wires; the socket appears when fitted
    const socketBox = tag(group(box(0.4, 0.4, 0.06, 0x94a3b8, 0.4, 1.5, -0.5), box(0.02, 0.15, 0.02, 0xdc2626, 0.35, 1.5, -0.45), box(0.02, 0.15, 0.02, 0x2563eb, 0.45, 1.5, -0.45)), 'socket')
    const socketPlate = tag(group(box(0.44, 0.44, 0.05, 0xfafafa, 0.4, 1.5, -0.44), cylinder(0.03, 0.02, 0x111827, 0.32, 1.5, -0.41), cylinder(0.03, 0.02, 0x111827, 0.48, 1.5, -0.41)), 'socket')
    socketPlate.children.slice(1).forEach((hole) => { hole.rotation.x = Math.PI / 2 })
    root.add(socketBox, socketPlate)

    // Table with tools
    root.add(box(1.4, 0.06, 0.7, 0x92400e, 1.1, 0.8, 0.9))
    ;[[0.5, 0.65], [1.7, 0.65], [0.5, 1.15], [1.7, 1.15]].forEach(([x, z]) => root.add(box(0.05, 0.8, 0.05, 0x78350f, x, 0.4, z)))
    const testerTip = ball(0.035, 0xfef08a, 0.6, 0.86, 0.75, { emissive: 0x000000 })
    testerTip.userData.decor = true
    const tester = tag(group(cylinder(0.025, 0.3, 0x0f172a, 0.75, 0.86, 0.75)), 'tester')
    tester.children[0].rotation.z = Math.PI / 2
    const screwdriver = tag(group(cylinder(0.04, 0.15, 0xdc2626, 0.9, 0.86, 1.0), cylinder(0.012, 0.2, 0x9ca3af, 1.07, 0.86, 1.0)), 'screwdriver')
    screwdriver.children.forEach((child) => { child.rotation.z = Math.PI / 2 })
    const gloves = tag(box(0.3, 0.05, 0.2, 0xe5e7eb, 1.45, 0.86, 1.1), 'gloves')
    root.add(tester, testerTip, screwdriver, gloves)

    const annotations = [
      label(root, 'Aptomat tổng', -2.25, 2.3, -0.33),
      label(root, 'Aptomat nhánh', -0.95, 2.3, -0.33),
      label(root, 'Biển báo', 1.55, 1.25, 0.75),
      label(root, 'Bút thử điện', 0.65, 1.3, 0.75),
      label(root, 'Tua vít cách điện', 0.95, 0.92, 1.05),
      label(root, 'Găng tay vải', 1.5, 0.92, 1.15),
      label(root, 'Hộp ổ cắm', 0.4, 1.85, -0.45),
    ]

    let lastTime = 0
    let glow = 0
    return {
      root,
      annotations,
      floorY: 0,
      framing: { center: new THREE.Vector3(0, 1.3, 0.2), width: 5.6, height: 2.9, direction: new THREE.Vector3(0.2, 0.25, 1).normalize() },
      update(time, { index, selected }) {
        const dt = Math.min(0.1, Math.max(0, time - lastTime))
        lastTime = time
        const live = index < OFF_AFTER || index >= ON_AGAIN
        branch.lever.position.y = live ? 1.92 : 1.78
        signOnBoard.visible = index >= 2 && index < ON_AGAIN
        signOnTable.visible = !signOnBoard.visible
        socketPlate.visible = index >= 4
        socketBox.visible = !socketPlate.visible
        // the tester lights when it was just used on a live circuit
        glow = selected === 'tester' && live && index !== 3 ? 1 : Math.max(0, glow - dt)
        testerTip.material.emissive.setHex(0xfacc15)
        testerTip.material.emissiveIntensity = glow * 1.5
        return {}
      },
    }
  },
}
