import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getSampleLesson } from '../data/courseCatalog'
import { useAuthStore } from '../store'
import { recordLocalLearningEvent } from '../utils/learningProgress'

const STORAGE_KEY = 'enginelab_circuit_experiments_v1'

const componentBank = [
  {
    type: 'power',
    name: 'Nguồn 5V',
    symbol: '+5V',
    color: 'border-red-300 bg-red-50 text-red-950',
    role: 'Cấp nguồn thấp áp cho mạch thí nghiệm.',
  },
  {
    type: 'ground',
    name: 'GND',
    symbol: 'GND',
    color: 'border-slate-300 bg-slate-50 text-slate-950',
    role: 'Điểm tham chiếu chung cho toàn bộ mạch.',
  },
  {
    type: 'switch',
    name: 'Nút nhấn',
    symbol: 'SW',
    color: 'border-sky-300 bg-sky-50 text-sky-950',
    role: 'Tạo tín hiệu logic 0/1 bằng thao tác của người dùng.',
  },
  {
    type: 'sensor',
    name: 'Cảm biến',
    symbol: 'SEN',
    color: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    role: 'Biến đổi khói, nhiệt độ, ánh sáng hoặc trạng thái thành tín hiệu điện.',
  },
  {
    type: 'resistor',
    name: 'Điện trở',
    symbol: 'R',
    color: 'border-amber-300 bg-amber-50 text-amber-950',
    role: 'Hạn dòng, kéo lên/kéo xuống hoặc chia áp cho tín hiệu.',
  },
  {
    type: 'logic',
    name: 'IC logic',
    symbol: 'AND/OR',
    color: 'border-violet-300 bg-violet-50 text-violet-950',
    role: 'Xử lí điều kiện số bằng cổng AND, OR, NOT.',
  },
  {
    type: 'mcu',
    name: 'Vi điều khiển',
    symbol: 'MCU',
    color: 'border-indigo-300 bg-indigo-50 text-indigo-950',
    role: 'Đọc tín hiệu, chạy thuật toán và xuất lệnh điều khiển.',
  },
  {
    type: 'driver',
    name: 'Transistor / driver',
    symbol: 'Q',
    color: 'border-orange-300 bg-orange-50 text-orange-950',
    role: 'Khuếch dòng, bảo vệ vi điều khiển khi điều khiển tải.',
  },
  {
    type: 'led',
    name: 'LED',
    symbol: 'LED',
    color: 'border-rose-300 bg-rose-50 text-rose-950',
    role: 'Hiển thị trạng thái đầu ra của mạch.',
  },
  {
    type: 'buzzer',
    name: 'Còi báo',
    symbol: 'BZ',
    color: 'border-yellow-300 bg-yellow-50 text-yellow-950',
    role: 'Tạo cảnh báo âm thanh khi điều kiện đúng.',
  },
]

const missionPresets = [
  {
    id: 'fire-alarm',
    title: 'Mạch báo cháy dùng logic số',
    brief: 'Còi/LED bật khi cảm biến khói và nhiệt độ đạt điều kiện cảnh báo.',
    required: ['power', 'ground', 'sensor', 'resistor', 'logic', 'driver', 'led'],
    suggestedLogic: 'Khói = 1 AND Nhiệt cao = 1 -> cảnh báo = 1',
  },
  {
    id: 'night-light',
    title: 'Đèn tự động theo ánh sáng',
    brief: 'LED bật khi cảm biến ánh sáng báo tối và công tắc cho phép hoạt động.',
    required: ['power', 'ground', 'sensor', 'switch', 'logic', 'driver', 'led'],
    suggestedLogic: 'Tối = 1 AND Công tắc = 1 -> LED = 1',
  },
  {
    id: 'safety-buzzer',
    title: 'Còi cảnh báo nút khẩn cấp',
    brief: 'Còi bật khi nút khẩn cấp hoặc cảm biến nguy hiểm được kích hoạt.',
    required: ['power', 'ground', 'switch', 'sensor', 'logic', 'driver', 'buzzer'],
    suggestedLogic: 'Nút khẩn cấp = 1 OR Cảm biến nguy hiểm = 1 -> Còi = 1',
  },
]

const initialComponents = [
  { id: 'power-1', type: 'power', x: 70, y: 92, label: 'Nguồn 5V' },
  { id: 'ground-1', type: 'ground', x: 70, y: 332, label: 'GND' },
]

const readSaved = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveAll = (value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

const getMeta = (type) => componentBank.find((item) => item.type === type) || componentBank[0]

const getCenter = (component) => ({
  x: component.x + 76,
  y: component.y + 42,
})

const defaultLabel = (type) => getMeta(type).name

export default function CircuitExperimentLab() {
  const { lessonId } = useParams()
  const { user } = useAuthStore()
  const lesson = getSampleLesson(lessonId)
  const storageKey = `${user?.id || user?.username || 'guest'}-${lessonId || 'digital'}`
  const saved = readSaved()[storageKey]

  const [missionId, setMissionId] = useState(saved?.missionId || 'fire-alarm')
  const [components, setComponents] = useState(saved?.components || initialComponents)
  const [wires, setWires] = useState(saved?.wires || [])
  const [selectedId, setSelectedId] = useState(null)
  const [wireStartId, setWireStartId] = useState(null)
  const [logicRule, setLogicRule] = useState(saved?.logicRule || missionPresets[0].suggestedLogic)

  const mission = missionPresets.find((item) => item.id === missionId) || missionPresets[0]
  const selectedComponent = components.find((item) => item.id === selectedId)

  const scoreItems = useMemo(() => {
    const hasRequired = mission.required.every((type) => components.some((item) => item.type === type))
    const hasPowerAndGround = components.some((item) => item.type === 'power') && components.some((item) => item.type === 'ground')
    const hasInputPath = wires.some((wire) => {
      const from = components.find((item) => item.id === wire.from)
      const to = components.find((item) => item.id === wire.to)
      return ['sensor', 'switch'].includes(from?.type) && ['logic', 'mcu'].includes(to?.type)
    })
    const hasOutputPath = wires.some((wire) => {
      const from = components.find((item) => item.id === wire.from)
      const to = components.find((item) => item.id === wire.to)
      return ['logic', 'mcu', 'driver'].includes(from?.type) && ['driver', 'led', 'buzzer'].includes(to?.type)
    })
    const hasLogic = logicRule.trim().length >= 12

    return [
      { label: 'Đủ linh kiện bắt buộc của nhiệm vụ', done: hasRequired },
      { label: 'Có nguồn thấp áp và GND chung', done: hasPowerAndGround },
      { label: 'Có đường tín hiệu từ đầu vào đến xử lí', done: hasInputPath },
      { label: 'Có đường điều khiển đến đầu ra', done: hasOutputPath },
      { label: 'Có quy tắc logic hoặc bảng chân lí', done: hasLogic },
    ]
  }, [components, logicRule, mission.required, wires])

  const score = Math.round((scoreItems.filter((item) => item.done).length / scoreItems.length) * 100)

  const addComponent = (type) => {
    const sameTypeCount = components.filter((item) => item.type === type).length
    const next = {
      id: `${type}-${Date.now()}`,
      type,
      label: sameTypeCount ? `${defaultLabel(type)} ${sameTypeCount + 1}` : defaultLabel(type),
      x: 235 + (components.length % 4) * 165,
      y: 80 + (Math.floor(components.length / 4) % 3) * 126,
    }
    setComponents((current) => [...current, next])
    setSelectedId(next.id)
  }

  const moveComponent = (componentId, dx, dy) => {
    setComponents((current) =>
      current.map((item) =>
        item.id === componentId
          ? {
              ...item,
              x: Math.max(16, Math.min(780, item.x + dx)),
              y: Math.max(24, Math.min(456, item.y + dy)),
            }
          : item
      )
    )
  }

  const connectComponent = (componentId) => {
    if (!wireStartId) {
      setWireStartId(componentId)
      toast.success('Chọn linh kiện đích để nối dây')
      return
    }

    if (wireStartId === componentId) {
      setWireStartId(null)
      return
    }

    const exists = wires.some((wire) => wire.from === wireStartId && wire.to === componentId)
    if (!exists) {
      setWires((current) => [...current, { id: `wire-${Date.now()}`, from: wireStartId, to: componentId, label: 'tín hiệu' }])
    }
    setWireStartId(null)
  }

  const removeComponent = (componentId) => {
    setComponents((current) => current.filter((item) => item.id !== componentId))
    setWires((current) => current.filter((wire) => wire.from !== componentId && wire.to !== componentId))
    setSelectedId(null)
  }

  const resetBoard = () => {
    setComponents(initialComponents)
    setWires([])
    setSelectedId(null)
    setWireStartId(null)
    setLogicRule(mission.suggestedLogic)
  }

  const saveDesign = () => {
    const savedRows = readSaved()
    savedRows[storageKey] = {
      missionId,
      components,
      wires,
      logicRule,
      savedAt: new Date().toISOString(),
    }
    saveAll(savedRows)
    recordLocalLearningEvent(user?.id, {
      lesson_id: Number(lessonId),
      event_type: 'circuit_experiment_saved',
      duration_seconds: 180,
      payload: { missionId, score },
    })
    toast.success('Đã lưu thí nghiệm mạch điện tử')
  }

  const changeMission = (nextMissionId) => {
    const nextMission = missionPresets.find((item) => item.id === nextMissionId)
    setMissionId(nextMissionId)
    setLogicRule(nextMission?.suggestedLogic || '')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <div className="p-6">
              <p className="muted-label mb-2">Phòng thí nghiệm mạch điện tử</p>
              <h1 className="text-3xl font-black text-slate-950">Thiết kế thí nghiệm mạch điện tử số</h1>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
                Chọn linh kiện từ băng linh kiện, đặt lên bo mạch, nối dây và viết quy tắc logic để hoàn thành nhiệm vụ trong bài {lesson?.title || 'Điện tử số'}.
              </p>
            </div>
            <div className="bp-sheet-dark p-6 text-white">
              <p className="text-xs font-black uppercase text-slate-300">Đánh giá thí nghiệm</p>
              <div className="mt-3 text-5xl font-black">{score}%</div>
              <div className="mt-4 h-2 rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${score}%` }} />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-300">{components.length} linh kiện · {wires.length} dây nối</p>
            </div>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[260px_1fr_300px]">
          <aside className="space-y-4">
            <section className="panel p-4">
              <h2 className="font-black text-slate-950">Nhiệm vụ</h2>
              <div className="mt-3 space-y-2">
                {missionPresets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => changeMission(item.id)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                      missionId === item.id
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    <span className="block font-black">{item.title}</span>
                    <span className="mt-1 block leading-5">{item.brief}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black text-slate-950">Băng linh kiện</h2>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{componentBank.length}</span>
              </div>
              <div className="space-y-2">
                {componentBank.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => addComponent(item.type)}
                    className={`w-full rounded-lg border p-3 text-left text-sm transition hover:-translate-y-0.5 hover:shadow-sm ${item.color}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-black">{item.name}</span>
                      <span className="rounded bg-white/75 px-2 py-1 text-xs font-black">{item.symbol}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 opacity-80">{item.role}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Vùng thiết kế</p>
                <h2 className="font-black text-slate-950">{mission.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={saveDesign} className="primary-button">Lưu thí nghiệm</button>
                <button type="button" onClick={resetBoard} className="secondary-button">Làm lại</button>
                <Link to={`/lessons/${lessonId}/3d`} className="secondary-button">Xem mô phỏng mẫu</Link>
              </div>
            </div>

            <div className="relative min-h-[590px] overflow-hidden bg-[linear-gradient(#dbeafe_1px,transparent_1px),linear-gradient(90deg,#dbeafe_1px,transparent_1px)] bg-[size:28px_28px]">
              <svg className="pointer-events-none absolute inset-0 h-full w-full">
                {wires.map((wire) => {
                  const from = components.find((item) => item.id === wire.from)
                  const to = components.find((item) => item.id === wire.to)
                  if (!from || !to) return null
                  const a = getCenter(from)
                  const b = getCenter(to)
                  return (
                    <g key={wire.id}>
                      <path
                        d={`M ${a.x} ${a.y} C ${(a.x + b.x) / 2} ${a.y}, ${(a.x + b.x) / 2} ${b.y}, ${b.x} ${b.y}`}
                        fill="none"
                        stroke="#0f2438"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 8} className="fill-slate-600 text-[11px] font-bold">
                        {wire.label}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {components.map((component) => {
                const meta = getMeta(component.type)
                const selected = selectedId === component.id
                return (
                  <div
                    key={component.id}
                    className={`absolute w-36 rounded-lg border-2 p-3 shadow-sm transition ${meta.color} ${
                      selected ? 'ring-4 ring-blue-200' : ''
                    } ${wireStartId === component.id ? 'ring-4 ring-amber-200' : ''}`}
                    style={{ left: component.x, top: component.y }}
                    onClick={() => setSelectedId(component.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-black uppercase opacity-70">{meta.symbol}</p>
                        <p className="mt-1 text-sm font-black">{component.label}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          connectComponent(component.id)
                        }}
                        className="rounded-md bg-white/80 px-2 py-1 text-xs font-black"
                      >
                        Nối
                      </button>
                    </div>
                    <p className="mt-2 text-xs leading-5 opacity-85">{meta.role}</p>
                    {selected && (
                      <div className="mt-3 grid grid-cols-3 gap-1">
                        {[
                          ['←', -24, 0],
                          ['↑', 0, -24],
                          ['→', 24, 0],
                          ['↓', 0, 24],
                        ].map(([label, dx, dy]) => (
                          <button
                            key={label}
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              moveComponent(component.id, dx, dy)
                            }}
                            className="rounded bg-white/85 px-2 py-1 text-xs font-black"
                          >
                            {label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            removeComponent(component.id)
                          }}
                          className="col-span-2 rounded bg-white/85 px-2 py-1 text-xs font-black text-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </main>

          <aside className="space-y-4">
            <section className="panel p-4">
              <h2 className="font-black text-slate-950">Thuộc tính</h2>
              {selectedComponent ? (
                <div className="mt-3 space-y-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Tên linh kiện
                    <input
                      value={selectedComponent.label}
                      onChange={(event) =>
                        setComponents((current) =>
                          current.map((item) =>
                            item.id === selectedComponent.id ? { ...item, label: event.target.value } : item
                          )
                        )
                      }
                      className="mt-1 w-full rounded-md border-slate-300 text-sm"
                    />
                  </label>
                  <p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    {getMeta(selectedComponent.type).role}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-600">Chọn một linh kiện trên bo mạch để đổi tên, di chuyển hoặc nối dây.</p>
              )}
            </section>

            <section className="panel p-4">
              <h2 className="font-black text-slate-950">Quy tắc logic</h2>
              <textarea
                value={logicRule}
                onChange={(event) => setLogicRule(event.target.value)}
                className="mt-3 min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm leading-6 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-2 rounded-lg bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                Gợi ý: {mission.suggestedLogic}
              </p>
            </section>

            <section className="panel p-4">
              <h2 className="font-black text-slate-950">Tiêu chí hoàn thành</h2>
              <div className="mt-3 space-y-2">
                {scoreItems.map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg border p-3 text-sm font-semibold ${
                      item.done ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {item.done ? 'Đạt: ' : 'Cần: '}
                    {item.label}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <h2 className="font-black">Lưu ý an toàn</h2>
              <p className="mt-2 text-sm font-semibold leading-6">
                Đây là mô phỏng. Khi lắp mạch thật chỉ dùng nguồn thấp áp, kiểm tra cực tính LED/diode/tụ, luôn có điện trở hạn dòng và không đấu tải lớn trực tiếp vào vi điều khiển.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
