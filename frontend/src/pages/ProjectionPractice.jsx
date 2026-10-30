import { useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import FitToWidth from '../components/FitToWidth'
import { printElement } from '../utils/printDrawing'

const views = [
  { id: 'front', label: 'Hình chiếu đứng', axes: ['x', 'z'], note: 'Nhìn từ trước: rộng theo chiều ngang, cao theo chiều đứng.' },
  { id: 'top', label: 'Hình chiếu bằng', axes: ['x', 'y'], note: 'Nhìn từ trên xuống: rộng và sâu của vật thể.' },
  { id: 'right', label: 'Hình chiếu cạnh', axes: ['y', 'z'], note: 'Nhìn từ bên phải: sâu theo chiều ngang, cao theo chiều đứng.' },
]

const objects = [
  {
    id: 'step-block',
    title: 'Vật thể bậc thang',
    size: { x: 4, y: 3, z: 3 },
    blocks: [
      [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0],
      [0, 1, 0], [1, 1, 0], [2, 1, 0],
      [0, 2, 0], [1, 2, 0],
      [0, 0, 1], [1, 0, 1], [2, 0, 1],
      [0, 1, 1], [1, 1, 1],
      [0, 0, 2], [1, 0, 2],
    ],
    goal: 'Luyện đọc chiều cao thay đổi theo từng phần của vật thể.',
  },
  {
    id: 'l-block',
    title: 'Vật thể chữ L',
    size: { x: 4, y: 3, z: 3 },
    blocks: [
      [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0],
      [0, 1, 0], [0, 2, 0],
      [0, 0, 1], [1, 0, 1],
      [0, 1, 1],
      [0, 0, 2],
    ],
    goal: 'Luyện phân biệt phần khuất theo chiều sâu khi vẽ hình chiếu.',
  },
  {
    id: 'bridge-block',
    title: 'Vật thể dạng cổng',
    size: { x: 4, y: 3, z: 3 },
    blocks: [
      [0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0],
      [0, 1, 0], [3, 1, 0],
      [0, 2, 0], [1, 2, 0], [2, 2, 0], [3, 2, 0],
      [0, 0, 1], [3, 0, 1],
      [0, 1, 1], [3, 1, 1],
      [0, 2, 1], [3, 2, 1],
      [0, 0, 2], [1, 0, 2], [2, 0, 2], [3, 0, 2],
      [0, 2, 2], [1, 2, 2], [2, 2, 2], [3, 2, 2],
    ],
    goal: 'Luyện nhận biết lỗ/rãnh khi chiếu từ các hướng khác nhau.',
  },
]

const cellKey = (a, b) => `${a}:${b}`

const getTargetCells = (object, viewId) => {
  const cells = new Set()
  object.blocks.forEach(([x, y, z]) => {
    if (viewId === 'front') cells.add(cellKey(x, z))
    if (viewId === 'top') cells.add(cellKey(x, y))
    if (viewId === 'right') cells.add(cellKey(y, z))
  })
  return cells
}

const getViewSize = (object, viewId) => {
  if (viewId === 'front') return { cols: object.size.x, rows: object.size.z }
  if (viewId === 'top') return { cols: object.size.x, rows: object.size.y }
  return { cols: object.size.y, rows: object.size.z }
}

const createEmptyDrawing = () => ({
  front: new Map(),
  top: new Map(),
  right: new Map(),
})

const lineTypes = [
  {
    id: 'visible',
    label: 'Nét liền đậm',
    use: 'Cạnh thấy, đường bao thấy của vật thể.',
    lineClass: 'h-1 bg-slate-950',
    sampleClass: 'border-t-4 border-slate-950',
  },
  {
    id: 'thin',
    label: 'Nét liền mảnh',
    use: 'Đường kích thước, đường gióng, đường gạch mặt cắt, đường dẫn.',
    lineClass: 'h-0.5 bg-slate-600',
    sampleClass: 'border-t-2 border-slate-500',
  },
  {
    id: 'hidden',
    label: 'Nét đứt mảnh',
    use: 'Cạnh khuất, đường bao khuất.',
    lineClass: 'h-0.5 bg-[repeating-linear-gradient(90deg,#334155_0_8px,transparent_8px_13px)]',
    sampleClass: 'border-t-2 border-dashed border-slate-700',
  },
  {
    id: 'center',
    label: 'Nét gạch chấm mảnh',
    use: 'Đường tâm, trục đối xứng, vòng tròn chia.',
    lineClass: 'h-0.5 bg-[repeating-linear-gradient(90deg,#1d4ed8_0_12px,transparent_12px_16px,#1d4ed8_16px_18px,transparent_18px_22px)]',
    sampleClass: 'border-t-2 border-dotted border-blue-700',
  },
  {
    id: 'hatch',
    label: 'Gạch mặt cắt',
    use: 'Tô vùng vật liệu bị mặt phẳng cắt cắt qua bằng các nét gạch chéo mảnh.',
    lineClass: '',
    sampleClass: 'h-6 bg-[repeating-linear-gradient(135deg,transparent_0_6px,#334155_6px_7px,transparent_7px_12px)]',
  },
]

const getLineType = (lineTypeId) => lineTypes.find((lineType) => lineType.id === lineTypeId) || lineTypes[0]

const lineDirections = [
  { id: 'horizontal', label: 'Ngang trên', angle: 0 },
  { id: 'horizontalBottom', label: 'Ngang dưới', angle: 0 },
  { id: 'vertical', label: 'Dọc trái', angle: 90 },
  { id: 'verticalRight', label: 'Dọc phải', angle: 90 },
  { id: 'diagDown', label: 'Chéo xuống', angle: 35 },
  { id: 'diagUp', label: 'Chéo lên', angle: -35 },
]

const getLineDirection = (directionId) =>
  lineDirections.find((direction) => direction.id === directionId) || lineDirections[0]

const createDrawingMark = (lineTypeId, directionId) => `${lineTypeId}|${directionId}`

const parseDrawingMark = (value = 'visible|horizontal') => {
  const [lineTypeId = 'visible', directionId = 'horizontal'] = String(value).split('|')
  return { lineTypeId, directionId }
}

const parseDrawingMarks = (value) => {
  if (!value) return []
  return String(value)
    .split(';')
    .filter(Boolean)
    .map(parseDrawingMark)
}

const addDrawingMark = (value, mark) => {
  const marks = value ? String(value).split(';').filter(Boolean) : []
  if (!marks.includes(mark)) marks.push(mark)
  return marks.join(';')
}

const getDirectionFromCellClick = (event, fallbackDirectionId) => {
  if (!event || ['diagDown', 'diagUp'].includes(fallbackDirectionId)) return fallbackDirectionId

  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const distances = [
    { id: 'horizontal', value: y },
    { id: 'horizontalBottom', value: rect.height - y },
    { id: 'vertical', value: x },
    { id: 'verticalRight', value: rect.width - x },
  ]

  return distances.sort((a, b) => a.value - b.value)[0].id
}

const getLineBackground = (lineTypeId, angle = 90) => {
  if (lineTypeId === 'hidden') return `repeating-linear-gradient(${angle}deg,#334155 0 8px,transparent 8px 13px)`
  if (lineTypeId === 'center') {
    return `repeating-linear-gradient(${angle}deg,#1d4ed8 0 12px,transparent 12px 16px,#1d4ed8 16px 18px,transparent 18px 22px)`
  }
  if (lineTypeId === 'thin') return '#475569'
  return '#020617'
}

function DrawingMark({ lineType, lineDirection }) {
  if (lineType.id === 'hatch') {
    return <span className="absolute inset-1 bg-[repeating-linear-gradient(135deg,transparent_0_6px,#334155_6px_7px,transparent_7px_12px)]" />
  }

  const thickness = lineType.id === 'visible' ? 4 : 2

  if (lineDirection.id === 'horizontal') {
    return (
      <span
        className="absolute left-[-1px] right-[-1px] top-0 rounded-full"
        style={{ height: `${thickness}px`, transform: 'translateY(-50%)', background: getLineBackground(lineType.id, 90) }}
      />
    )
  }

  if (lineDirection.id === 'horizontalBottom') {
    return (
      <span
        className="absolute bottom-0 left-[-1px] right-[-1px] rounded-full"
        style={{ height: `${thickness}px`, transform: 'translateY(50%)', background: getLineBackground(lineType.id, 90) }}
      />
    )
  }

  if (lineDirection.id === 'vertical') {
    return (
      <span
        className="absolute bottom-[-1px] left-0 top-[-1px] rounded-full"
        style={{ width: `${thickness}px`, transform: 'translateX(-50%)', background: getLineBackground(lineType.id, 180) }}
      />
    )
  }

  if (lineDirection.id === 'verticalRight') {
    return (
      <span
        className="absolute bottom-[-1px] right-0 top-[-1px] rounded-full"
        style={{ width: `${thickness}px`, transform: 'translateX(50%)', background: getLineBackground(lineType.id, 180) }}
      />
    )
  }

  return (
    <span
      className="absolute left-[-2px] right-[-2px] top-1/2 rounded-full"
      style={{
        height: `${thickness}px`,
        transform: `translateY(-50%) rotate(${lineDirection.angle}deg)`,
        background: getLineBackground(lineType.id, 90),
      }}
    />
  )
}

const drawingTasks = [
  {
    id: 'overall',
    title: 'Ghi kích thước bao',
    description: 'Thể hiện chiều dài, chiều rộng và chiều cao lớn nhất của vật thể.',
  },
  {
    id: 'part',
    title: 'Ghi kích thước từng phần',
    description: 'Thể hiện kích thước các bậc, rãnh, lỗ hoặc phần nhô/lõm cần thiết để chế tạo.',
  },
  {
    id: 'circle',
    title: 'Ghi kích thước lỗ/cung tròn',
    description: 'Nếu vật thể có lỗ hoặc cung tròn, ghi đúng đường kính/bán kính và vị trí tâm.',
  },
  {
    id: 'technical',
    title: 'Ghi yêu cầu kĩ thuật',
    description: 'Nêu yêu cầu như làm tù cạnh, làm sạch bề mặt, độ nhám hoặc yêu cầu gia công phù hợp.',
  },
  {
    id: 'titleBlock',
    title: 'Hoàn thiện khung tên',
    description: 'Ghi tên vật thể, vật liệu, tỉ lệ, người vẽ, người kiểm tra và nơi thực hiện.',
  },
]

const titleBlockDefaults = {
  name: '',
  material: '',
  scale: '1:1',
  drawer: '',
  checker: '',
  school: '',
}

function VoxelPreview({ object }) {
  const sortedBlocks = [...object.blocks].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]))
  const scale = 34
  const origin = { x: 130, y: 172 }

  const project = ([x, y, z]) => ({
    x: origin.x + (x - y) * scale * 0.72,
    y: origin.y + (x + y) * scale * 0.36 - z * scale * 0.78,
  })

  return (
    <svg viewBox="0 0 300 220" className="h-full w-full">
      <defs>
        <linearGradient id="topFace" x1="0" x2="1">
          <stop stopColor="#dbeafe" />
          <stop offset="1" stopColor="#bfdbfe" />
        </linearGradient>
      </defs>
      {sortedBlocks.map((block) => {
        const p = project(block)
        const top = `${p.x},${p.y - 24} ${p.x + 25},${p.y - 12} ${p.x},${p.y} ${p.x - 25},${p.y - 12}`
        const left = `${p.x - 25},${p.y - 12} ${p.x},${p.y} ${p.x},${p.y + 29} ${p.x - 25},${p.y + 17}`
        const right = `${p.x + 25},${p.y - 12} ${p.x},${p.y} ${p.x},${p.y + 29} ${p.x + 25},${p.y + 17}`
        return (
          <g key={block.join('-')} stroke="#334155" strokeWidth="1.5">
            <polygon points={left} fill="#93c5fd" />
            <polygon points={right} fill="#60a5fa" />
            <polygon points={top} fill="url(#topFace)" />
          </g>
        )
      })}
    </svg>
  )
}

function ProjectionGrid({ object, view, drawing, target, tool, showTarget, checked, onToggle }) {
  const { cols, rows } = getViewSize(object, view.id)
  const cells = []

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let col = 0; col < cols; col += 1) {
      const key = cellKey(col, row)
      const filled = drawing.has(key)
      const marks = parseDrawingMarks(drawing.get(key))
      const shouldBeFilled = target.has(key)
      const stateClass = checked
        ? filled && shouldBeFilled
          ? 'bg-white border-slate-300 ring-2 ring-emerald-400'
          : filled && !shouldBeFilled
            ? 'bg-red-50 border-red-400'
            : !filled && shouldBeFilled
              ? 'bg-amber-50 border-amber-400'
              : 'bg-white border-slate-200'
        : showTarget && shouldBeFilled && !filled
          ? 'bg-blue-50 border-blue-300'
          : 'bg-white border-slate-200'

      cells.push(
        <button
          key={key}
          type="button"
          aria-label={`${view.label} ô ${col + 1},${row + 1}`}
          onClick={(event) => onToggle(view.id, key, tool, event)}
          className={`relative aspect-square border transition hover:ring-2 hover:ring-blue-300 ${stateClass}`}
        >
          {filled && marks.map((mark) => (
            <DrawingMark
              key={`${mark.lineTypeId}-${mark.directionId}`}
              lineType={getLineType(mark.lineTypeId)}
              lineDirection={getLineDirection(mark.directionId)}
            />
          ))}
          {!filled && showTarget && shouldBeFilled && (
            <span className="absolute left-[-1px] right-[-1px] top-0 h-0.5 -translate-y-1/2 rounded-full bg-blue-300 opacity-60" />
          )}
        </button>
      )
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{view.label}</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{view.note}</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
          {cols} x {rows}
        </span>
      </div>
      <div
        className="grid overflow-hidden rounded-lg border border-slate-300 bg-slate-200"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells}
      </div>
    </section>
  )
}

function SheetProjectionGrid({ object, view, drawing, target, tool, showTarget, checked, selectedMark, onToggle, cellSize = 42 }) {
  const { cols, rows } = getViewSize(object, view.id)
  const cells = []

  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let col = 0; col < cols; col += 1) {
      const key = cellKey(col, row)
      const filled = drawing.has(key)
      const marks = parseDrawingMarks(drawing.get(key))
      const shouldBeFilled = target.has(key)
      const isSelected = selectedMark?.viewId === view.id && selectedMark?.key === key
      const stateClass = checked
        ? filled && shouldBeFilled
          ? 'bg-white border-slate-300 ring-2 ring-emerald-400'
          : filled && !shouldBeFilled
            ? 'bg-red-50 border-red-500'
            : !filled && shouldBeFilled
              ? 'bg-amber-50 border-amber-500'
              : 'bg-white border-slate-300'
        : showTarget && shouldBeFilled && !filled
          ? 'bg-slate-50 border-slate-400'
          : 'bg-white border-slate-300'

      cells.push(
        <button
          key={key}
          type="button"
          aria-label={`${view.label} ô ${col + 1},${row + 1}`}
          onClick={(event) => onToggle(view.id, key, tool, event)}
          className={`relative border ${stateClass} ${isSelected ? 'z-10 ring-4 ring-blue-500' : ''}`}
          style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
        >
          {filled && marks.map((mark) => (
            <DrawingMark
              key={`${mark.lineTypeId}-${mark.directionId}`}
              lineType={getLineType(mark.lineTypeId)}
              lineDirection={getLineDirection(mark.directionId)}
            />
          ))}
          {!filled && showTarget && shouldBeFilled && (
            <span className="absolute left-[-1px] right-[-1px] top-0 h-0.5 -translate-y-1/2 rounded-full bg-slate-400 opacity-50" />
          )}
        </button>
      )
    }
  }

  return (
    <div className="inline-flex flex-col">
      <div className="mb-3 flex items-center justify-between border-b border-slate-500 pb-1">
        <span className="text-[11px] font-black uppercase text-slate-800">{view.label}</span>
        <span className="text-[10px] font-bold text-slate-500">{cols}x{rows}</span>
      </div>
      <div
        className="grid border-2 border-slate-700 bg-white"
        style={{
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          width: `${cols * cellSize + 4}px`,
        }}
      >
        {cells}
      </div>
    </div>
  )
}

function TechnicalDrawingSheet({
  object,
  drawings,
  targets,
  tool,
  showTarget,
  checked,
  selectedMark,
  onToggle,
  technicalRequirements,
  titleBlock,
}) {
  const frontView = views.find((view) => view.id === 'front')
  const topView = views.find((view) => view.id === 'top')
  const rightView = views.find((view) => view.id === 'right')
  const safeValue = (value, fallback) => value?.trim() || fallback
  const sheetRef = useRef(null)

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="muted-label text-indigo-600">Khung làm việc bản vẽ</p>
          <h2 className="text-2xl font-black text-slate-950">Bản vẽ chi tiết theo bố cục kĩ thuật</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-bold text-slate-500">Khung bản vẽ · hình chiếu · kích thước · yêu cầu kĩ thuật · khung tên</p>
          <button type="button" className="secondary-button" onClick={() => printElement(sheetRef.current, { contentSize: { width: 1000, height: 650 } })}>
            In bản vẽ (A4 ngang)
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4">
        <FitToWidth ref={sheetRef} width={1000} height={650}>
        <div className="relative h-[650px] w-[1000px] border-2 border-slate-950 bg-white">
          <div className="absolute inset-5 border border-slate-950" />

          <div className="absolute left-[70px] top-[54px] h-[390px] w-[610px]">
            <div className="absolute left-[44px] top-0">
              <SheetProjectionGrid
                object={object}
                view={frontView}
                drawing={drawings.front}
                target={targets.front}
                tool={tool}
                showTarget={showTarget}
                checked={checked}
                selectedMark={selectedMark}
                onToggle={onToggle}
                cellSize={42}
              />
            </div>
            <div className="absolute left-[302px] top-0">
              <SheetProjectionGrid
                object={object}
                view={rightView}
                drawing={drawings.right}
                target={targets.right}
                tool={tool}
                showTarget={showTarget}
                checked={checked}
                selectedMark={selectedMark}
                onToggle={onToggle}
                cellSize={42}
              />
            </div>
            <div className="absolute left-[650px] top-[16px] h-[220px] w-[250px] border border-slate-950 p-4">
              <p className="text-[12px] font-black uppercase text-slate-800">Yêu cầu kĩ thuật</p>
              <div className="mt-3 whitespace-pre-line text-[13px] font-semibold leading-6 text-slate-700">
                {technicalRequirements || '1. Làm tù cạnh\n2. Làm sạch bề mặt'}
              </div>
            </div>
            <div className="absolute left-[44px] top-[210px]">
              <SheetProjectionGrid
                object={object}
                view={topView}
                drawing={drawings.top}
                target={targets.top}
                tool={tool}
                showTarget={showTarget}
                checked={checked}
                selectedMark={selectedMark}
                onToggle={onToggle}
                cellSize={42}
              />
            </div>
            <div className="absolute left-[44px] top-[190px] h-px w-[172px] border-t border-dashed border-slate-300" />
            <div className="absolute left-[236px] top-[31px] h-[128px] border-l border-dashed border-slate-300" />
            <div className="absolute left-[236px] top-[31px] w-[46px] border-t border-dashed border-slate-300" />
            <div className="absolute left-[44px] top-[188px] text-[10px] font-bold uppercase text-slate-400">Đường dóng chiếu</div>
          </div>

          <div className="absolute bottom-5 right-5 grid w-[500px] grid-cols-[90px_1fr_90px_90px] border border-slate-950 text-[12px] text-slate-900">
            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Tên gọi</div>
            <div className="border-b border-r border-slate-950 px-2 py-2 font-black uppercase">{safeValue(titleBlock.name, object.title)}</div>
            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Tỉ lệ</div>
            <div className="border-b border-slate-950 px-2 py-2 font-bold">{safeValue(titleBlock.scale, '1:1')}</div>

            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Vật liệu</div>
            <div className="border-b border-r border-slate-950 px-2 py-2">{safeValue(titleBlock.material, 'Chưa ghi')}</div>
            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Bài</div>
            <div className="border-b border-slate-950 px-2 py-2">Hình chiếu</div>

            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Người vẽ</div>
            <div className="border-b border-r border-slate-950 px-2 py-2">{safeValue(titleBlock.drawer, 'Chưa ghi')}</div>
            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Ngày</div>
            <div className="border-b border-slate-950 px-2 py-2">........</div>

            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Kiểm tra</div>
            <div className="border-b border-r border-slate-950 px-2 py-2">{safeValue(titleBlock.checker, 'Chưa ghi')}</div>
            <div className="border-b border-r border-slate-950 px-2 py-2 font-bold">Lớp</div>
            <div className="border-b border-slate-950 px-2 py-2">{safeValue(titleBlock.school, 'Chưa ghi')}</div>

            <div className="col-span-4 px-2 py-2 text-center text-[13px] font-black uppercase tracking-wide">
              Bản vẽ chi tiết
            </div>
          </div>
        </div>
        </FitToWidth>
      </div>
    </section>
  )
}

export default function ProjectionPractice() {
  const [activeObjectId, setActiveObjectId] = useState(objects[0].id)
  const [tool, setTool] = useState('draw')
  const [activeLineType, setActiveLineType] = useState('visible')
  const [activeLineDirection, setActiveLineDirection] = useState('horizontal')
  const [showTarget, setShowTarget] = useState(false)
  const [checked, setChecked] = useState(false)
  const [drawings, setDrawings] = useState(createEmptyDrawing)
  const [selectedMark, setSelectedMark] = useState(null)
  const [completedTasks, setCompletedTasks] = useState({})
  const [technicalRequirements, setTechnicalRequirements] = useState('1. Làm tù cạnh\n2. Làm sạch bề mặt')
  const [titleBlock, setTitleBlock] = useState(titleBlockDefaults)

  const activeObject = objects.find((object) => object.id === activeObjectId) || objects[0]
  const targets = useMemo(
    () => Object.fromEntries(views.map((view) => [view.id, getTargetCells(activeObject, view.id)])),
    [activeObject]
  )

  const resetDrawing = () => {
    setDrawings(createEmptyDrawing())
    setChecked(false)
    setShowTarget(false)
    setSelectedMark(null)
    setCompletedTasks({})
    setTechnicalRequirements('1. Làm tù cạnh\n2. Làm sạch bề mặt')
    setTitleBlock(titleBlockDefaults)
  }

  const chooseObject = (objectId) => {
    setActiveObjectId(objectId)
    setDrawings(createEmptyDrawing())
    setChecked(false)
    setShowTarget(false)
    setSelectedMark(null)
    setCompletedTasks({})
  }

  const toggleCell = (viewId, key, activeTool, event) => {
    setChecked(false)

    if (activeTool === 'move') {
      setDrawings((current) => {
        const currentMark = current[viewId].get(key)

        if (!selectedMark) {
          if (currentMark) setSelectedMark({ viewId, key, mark: currentMark })
          return current
        }

        const nextDrawings = {
          front: new Map(current.front),
          top: new Map(current.top),
          right: new Map(current.right),
        }

        nextDrawings[selectedMark.viewId].delete(selectedMark.key)
        nextDrawings[viewId].set(key, selectedMark.mark)
        setSelectedMark(null)
        return nextDrawings
      })
      return
    }

    setSelectedMark(null)
    setDrawings((current) => {
      const nextMap = new Map(current[viewId])
      if (activeTool === 'erase') nextMap.delete(key)
      else {
        const directionId = getDirectionFromCellClick(event, activeLineDirection)
        const mark = createDrawingMark(activeLineType, directionId)
        nextMap.set(key, addDrawingMark(nextMap.get(key), mark))
      }
      return { ...current, [viewId]: nextMap }
    })
  }

  const checkDrawing = () => {
    setChecked(true)
    const total = views.reduce((sum, view) => sum + targets[view.id].size, 0)
    const correct = views.reduce((sum, view) => {
      let count = 0
      drawings[view.id].forEach((_mark, key) => {
        if (targets[view.id].has(key)) count += 1
      })
      return sum + count
    }, 0)
    const extra = views.reduce((sum, view) => {
      let count = 0
      drawings[view.id].forEach((_mark, key) => {
        if (!targets[view.id].has(key)) count += 1
      })
      return sum + count
    }, 0)
    const missing = total - correct
    const score = Math.max(0, Math.round(((correct - extra * 0.5) / Math.max(1, total)) * 100))

    if (score === 100) toast.success('Chính xác. Ba hình chiếu đã khớp vật thể.')
    else toast.error(`Đạt ${score}%. Còn ${missing} ô thiếu và ${extra} ô thừa.`)
  }

  const finishedTaskCount = drawingTasks.filter((task) => completedTasks[task.id]).length
  const titleBlockComplete = Object.values(titleBlock).every((value) => value.trim())
  const missionComplete = checked && finishedTaskCount === drawingTasks.length && titleBlockComplete

  return (
    <div className="page-container">
      <section className="mb-6 rounded-2xl bg-slate-950 p-6 text-white shadow-2xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-200">Công nghệ 10 · Vẽ kĩ thuật</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">Khu vực vẽ hình chiếu vật thể</h1>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-7 text-slate-200">
              Quan sát vật thể 3D, chọn đúng loại nét vẽ, xoay hướng ngang/dọc/chéo và di chuyển nét để dựng hình chiếu đứng, hình chiếu bằng, hình chiếu cạnh trong khung bản vẽ. Bấm kiểm tra để phát hiện phần đúng, phần thừa và phần còn thiếu.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/practice-bank" className="secondary-button bg-white text-slate-950 hover:bg-slate-100">
              Về cuộc thi
            </Link>
            <button type="button" onClick={checkDrawing} className="primary-button">
              Kiểm tra
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="panel p-5">
            <h2 className="font-black text-slate-950">Chọn vật thể</h2>
            <div className="mt-4 grid gap-2">
              {objects.map((object) => (
                <button
                  key={object.id}
                  type="button"
                  onClick={() => chooseObject(object.id)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    activeObject.id === object.id
                      ? 'border-blue-500 bg-blue-50 text-blue-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <p className="font-black">{object.title}</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{object.goal}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <p className="muted-label">Vật thể mẫu</p>
              <h2 className="mt-1 font-black text-slate-950">{activeObject.title}</h2>
            </div>
            <div className="h-64 bg-slate-50 p-2">
              <VoxelPreview object={activeObject} />
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="font-black text-slate-950">Công cụ</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['draw', 'Vẽ nét'],
                ['move', 'Di chuyển'],
                ['erase', 'Tẩy ô'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTool(id)
                    if (id !== 'move') setSelectedMark(null)
                  }}
                  className={`rounded-lg px-3 py-3 text-sm font-black ${
                    tool === id ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {tool === 'move' && (
              <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold leading-5 text-blue-900">
                {selectedMark ? 'Đã chọn nét. Bấm vào ô mới để chuyển vị trí.' : 'Bấm vào nét cần di chuyển, sau đó bấm ô đích.'}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Loại đường nét</p>
              {lineTypes.map((lineType) => (
                <button
                  key={lineType.id}
                  type="button"
                  onClick={() => {
                    setTool('draw')
                    setSelectedMark(null)
                    setActiveLineType(lineType.id)
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    activeLineType === lineType.id && tool === 'draw'
                      ? 'border-blue-500 bg-blue-50 text-blue-950'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                  }`}
                >
                  <span className={`mb-2 block w-24 ${lineType.sampleClass}`} />
                  <span className="block text-sm font-black">{lineType.label}</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{lineType.use}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Hướng nét</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                Với nét ngang/dọc, bấm gần cạnh của ô để đặt nét sát đường kẻ; bấm gần góc để ghép nét đứng và nét ngang.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {lineDirections.map((direction) => (
                  <button
                    key={direction.id}
                    type="button"
                    onClick={() => {
                      setTool('draw')
                      setSelectedMark(null)
                      setActiveLineDirection(direction.id)
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      activeLineDirection === direction.id && tool === 'draw'
                        ? 'border-blue-500 bg-blue-50 text-blue-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    <span className="relative mb-2 block h-5 overflow-hidden">
                      <span
                        className="absolute left-1 right-1 top-1/2 h-0.5 rounded-full bg-slate-800"
                        style={{ transform: `translateY(-50%) rotate(${direction.angle}deg)` }}
                      />
                    </span>
                    <span className="text-xs font-black">{direction.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              <button type="button" onClick={() => setShowTarget((value) => !value)} className="secondary-button w-full">
                {showTarget ? 'Ẩn đáp án mờ' : 'Hiện đáp án mờ'}
              </button>
              <button type="button" onClick={resetDrawing} className="secondary-button w-full">
                Làm lại
              </button>
            </div>
          </section>
        </aside>

        <main className="min-w-0 space-y-5">
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-6 text-emerald-950">
              Sau khi kiểm tra: viền xanh là nét đúng.
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">
              Nền vàng là vị trí còn thiếu nét trong hình chiếu.
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-950">
              Nền đỏ là nét thừa cần xóa.
            </div>
          </section>

          <TechnicalDrawingSheet
            object={activeObject}
            drawings={drawings}
            targets={targets}
            tool={tool}
            showTarget={showTarget}
            checked={checked}
            selectedMark={selectedMark}
            onToggle={toggleCell}
            technicalRequirements={technicalRequirements}
            titleBlock={titleBlock}
          />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="muted-label text-indigo-600">Nhiệm vụ bản vẽ kĩ thuật</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">Chuẩn hóa bước ghi kích thước, yêu cầu kĩ thuật và khung tên</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Sau khi dựng hình chiếu, học sinh hoàn thiện bản vẽ chi tiết theo đúng trình tự: ghi kích thước bao, kích thước từng phần,
                  kích thước lỗ/cung tròn nếu có, yêu cầu kĩ thuật và nội dung khung tên.
                </p>
              </div>
              <div className={`rounded-xl px-4 py-3 text-sm font-black ${
                missionComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {missionComplete ? 'Đã đạt nhiệm vụ' : `${finishedTaskCount}/${drawingTasks.length} nhiệm vụ`}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-3">
                {drawingTasks.map((task) => (
                  <label
                    key={task.id}
                    className={`flex gap-3 rounded-xl border p-4 transition ${
                      completedTasks[task.id]
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(completedTasks[task.id])}
                      onChange={(event) =>
                        setCompletedTasks((current) => ({ ...current, [task.id]: event.target.checked }))
                      }
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      <span className="block font-black">{task.title}</span>
                      <span className="mt-1 block text-sm leading-6">{task.description}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black text-slate-950">Yêu cầu kĩ thuật</h3>
                  <textarea
                    value={technicalRequirements}
                    onChange={(event) => setTechnicalRequirements(event.target.value)}
                    className="mt-3 min-h-24 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                    Gợi ý theo SGK: làm tù cạnh, làm sạch bề mặt hoặc yêu cầu gia công ngắn gọn.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-black text-slate-950">Khung tên</h3>
                  <div className="mt-3 grid gap-2">
                    {[
                      ['name', 'Tên vật thể'],
                      ['material', 'Vật liệu'],
                      ['scale', 'Tỉ lệ'],
                      ['drawer', 'Người vẽ'],
                      ['checker', 'Người kiểm tra'],
                      ['school', 'Trường/lớp'],
                    ].map(([key, label]) => (
                      <label key={key} className="grid gap-1 text-sm font-bold text-slate-700">
                        {label}
                        <input
                          value={titleBlock[key]}
                          onChange={(event) => setTitleBlock((current) => ({ ...current, [key]: event.target.value }))}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    ))}
                  </div>
                  {!titleBlockComplete && (
                    <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-800">
                      Cần điền đủ khung tên để bản vẽ chi tiết hoàn chỉnh.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950">
            <h2 className="font-black">Mục tiêu luyện tập</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <p className="rounded-xl bg-white p-4 text-sm font-semibold leading-6">Xác định đúng hướng nhìn của từng hình chiếu.</p>
              <p className="rounded-xl bg-white p-4 text-sm font-semibold leading-6">Giữ đúng quan hệ kích thước giữa hình chiếu đứng, bằng và cạnh.</p>
              <p className="rounded-xl bg-white p-4 text-sm font-semibold leading-6">Chọn đúng nét liền đậm, nét liền mảnh, nét đứt mảnh và nét gạch chấm mảnh theo yêu cầu bản vẽ.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
