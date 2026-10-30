import { useMemo, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import {
  SHEET, STANDARD_SCALES, formatMm, getDimensionStops, getIsometricBounds, getIsometricFaces, getOverallSize, getSymmetryAxes,
  keyOf, layoutSheet, pickScale, projectView, removeStep, toggleCell,
} from '../utils/technicalDrawing'

const MAX_STEPS = 8
const AXES = [
  { id: 'x', label: 'Chiều dài (X)', note: 'trái → phải' },
  { id: 'y', label: 'Chiều rộng (Y)', note: 'trước → sau' },
  { id: 'z', label: 'Chiều cao (Z)', note: 'dưới → trên' },
]
// TCVN line weights on paper (mm): thick continuous for visible outlines, thin for dimensions, dashed for hidden edges.
const LINE = { thick: 0.5, thin: 0.25, hidden: 0.3, dash: '2.5 1' }
const FACE_FILL = { front: '#dbeafe', right: '#93c5fd', top: '#eff6ff' }

export const resolveScale = (model, setting) =>
  STANDARD_SCALES.find((scale) => scale.label === setting && layoutSheet(model, scale.value)) || pickScale(model)

// ============= Isometric =============
function IsometricFaces({ model, shaded, strokeWidth }) {
  return getIsometricFaces(model).map((face, index) => {
    const points = face.points.map((p) => p.join(',')).join(' ')
    return (
      <g key={index}>
        {/* Same-colour stroke closes anti-aliasing seams so edges of hidden faces cannot show through. */}
        <polygon points={points} fill={shaded ? FACE_FILL[face.kind] : '#fff'} stroke={shaded ? FACE_FILL[face.kind] : '#fff'} strokeWidth={strokeWidth * 0.6} strokeLinejoin="round" />
        {face.edges.map((isEdge, side) => {
          if (!isEdge) return null
          const [a, b] = [face.points[side], face.points[(side + 1) % 4]]
          return <line key={side} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#111827" strokeWidth={strokeWidth} strokeLinecap="round" />
        })}
      </g>
    )
  })
}

export function IsometricView({ model, className = '' }) {
  const bounds = getIsometricBounds(model)
  const pad = Math.max(bounds.width, bounds.height) * 0.08 + 4
  return (
    <svg className={className} viewBox={`${bounds.minX - pad} ${bounds.minY - pad} ${bounds.width + pad * 2} ${bounds.height + pad * 2}`} role="img" aria-label="Hình chiếu trục đo của vật thể">
      {model.cells.length ? <IsometricFaces model={model} shaded strokeWidth={Math.max(bounds.width, bounds.height) / 160} /> : null}
    </svg>
  )
}

// ============= Designer =============
function AxisEditor({ axis, sizes, onResize, onAdd, onRemove }) {
  const total = sizes.reduce((sum, size) => sum + (Number(size) || 0), 0)
  return (
    <fieldset className="td-axis">
      <legend>{axis.label} <small>{axis.note} · tổng {formatMm(total)} mm</small></legend>
      <div className="td-axis-steps">
        {sizes.map((size, index) => (
          <label key={index} className="td-step">
            <span className="sr-only">{axis.label}, đoạn {index + 1} (mm)</span>
            <input type="number" min="1" max="2000" value={size} onChange={(event) => onResize(index, event.target.value)} onBlur={(event) => { if (!(Number(event.target.value) >= 1)) onResize(index, 1) }} />
            {sizes.length > 1 && <button type="button" onClick={() => onRemove(index)} aria-label={`Xóa đoạn ${index + 1} của ${axis.label}`}><Minus size={12} /></button>}
          </label>
        ))}
        {sizes.length < MAX_STEPS && <button type="button" className="td-add-step" onClick={onAdd} aria-label={`Thêm đoạn cho ${axis.label}`}><Plus size={14} /></button>}
      </div>
    </fieldset>
  )
}

export function ObjectDesigner({ model, onChange }) {
  const [layer, setLayer] = useState(0)
  const currentLayer = Math.min(layer, model.z.length - 1)
  const size = getOverallSize(model)
  const cellSet = new Set(model.cells)
  const has = (i, j, k) => cellSet.has(keyOf(i, j, k))
  const setLayerCells = (fill) => {
    const others = model.cells.filter((key) => Number(key.split(',')[2]) !== currentLayer)
    onChange({ ...model, cells: fill ? [...others, ...model.x.flatMap((_, i) => model.y.map((__, j) => keyOf(i, j, currentLayer)))] : others })
  }
  const copyBelow = () => {
    const below = model.cells.filter((key) => Number(key.split(',')[2]) === currentLayer - 1).map((key) => { const [i, j] = key.split(','); return keyOf(i, j, currentLayer) })
    const others = model.cells.filter((key) => Number(key.split(',')[2]) !== currentLayer)
    onChange({ ...model, cells: [...others, ...below] })
  }

  return (
    <div className="td-designer">
      <div className="td-axes">
        {AXES.map((axis) => (
          <AxisEditor
            key={axis.id}
            axis={axis}
            sizes={model[axis.id]}
            onResize={(index, value) => onChange({ ...model, [axis.id]: model[axis.id].map((s, i) => (i === index ? value : s)) })}
            onAdd={() => onChange({ ...model, [axis.id]: [...model[axis.id], Number(model[axis.id][model[axis.id].length - 1]) || 10] })}
            onRemove={(index) => { onChange(removeStep(model, axis.id, index)); if (axis.id === 'z' && currentLayer >= model.z.length - 1) setLayer(Math.max(model.z.length - 2, 0)) }}
          />
        ))}
      </div>

      <div className="td-workarea">
        <div className="td-layer-panel">
          <div className="td-layer-tabs studio-tabs" role="group" aria-label="Chọn tầng">
            {model.z.map((height, index) => (
              <button key={index} type="button" aria-pressed={currentLayer === index} onClick={() => setLayer(index)}>Tầng {index + 1}<small> · {formatMm(Number(height) || 0)}</small></button>
            ))}
          </div>
          <p className="ed-muted">Nhìn từ trên xuống tầng {currentLayer + 1}{currentLayer === 0 ? ' (dưới cùng)' : ''}. Bấm vào ô để thêm / bớt khối. Ô có chấm là vị trí đã có khối ở tầng dưới.</p>
          <div className="td-grid-wrap">
            <span className="td-grid-label">Phía sau</span>
            <div
              className="td-grid"
              style={{ gridTemplateColumns: model.x.map((s) => `minmax(26px, ${Number(s) || 1}fr)`).join(' '), gridTemplateRows: [...model.y].reverse().map((s) => `minmax(26px, ${Number(s) || 1}fr)`).join(' '), aspectRatio: `${size.x} / ${size.y}` }}
            >
              {[...model.y.keys()].reverse().flatMap((j) => model.x.map((_, i) => (
                <button
                  key={`${i}-${j}`}
                  type="button"
                  className={`td-cell ${has(i, j, currentLayer) ? 'is-filled' : ''} ${currentLayer > 0 && has(i, j, currentLayer - 1) ? 'has-below' : ''}`}
                  aria-pressed={has(i, j, currentLayer)}
                  aria-label={`Ô cột ${i + 1}, hàng ${j + 1} từ trước, tầng ${currentLayer + 1}`}
                  onClick={() => onChange(toggleCell(model, i, j, currentLayer))}
                />
              )))}
            </div>
            <span className="td-grid-label">Phía trước</span>
          </div>
          <div className="ed-inline-actions">
            <button type="button" className="ed-link-button" onClick={() => setLayerCells(true)}>Tô kín tầng</button>
            <button type="button" className="ed-link-button" onClick={() => setLayerCells(false)}>Xóa tầng</button>
            {currentLayer > 0 && <button type="button" className="ed-link-button" onClick={copyBelow}>Chép tầng dưới</button>}
          </div>
        </div>
        <div className="td-preview">
          <IsometricView model={model} className="td-iso" />
          <p>Kích thước bao: <strong>{formatMm(size.x)} × {formatMm(size.y)} × {formatMm(size.z)} mm</strong></p>
          {!model.cells.length && <p className="ed-muted">Chưa có khối nào. Bấm vào các ô bên trái để bắt đầu.</p>}
        </div>
      </div>
    </div>
  )
}

// ============= Drawing sheet =============
const Arrow = ({ x, y, dx, dy }) => {
  // Filled arrowhead with its tip at (x, y), pointing along (dx, dy).
  const len = 2.5
  const half = 0.55
  return <polygon points={`${x},${y} ${x - dx * len - dy * half},${y - dy * len + dx * half} ${x - dx * len + dy * half},${y - dy * len - dx * half}`} fill="#111827" />
}

const SMALL_DIMENSION = 7 // paper mm; below this the arrows and value move outside (TCVN)

/**
 * Linear dimension with extension lines, arrows and value. Vertical values are rotated to be
 * read from the right-hand side. For short dimensions the arrows point in from outside and the
 * value sits beyond the end given by `textAt` ('start' | 'end').
 */
function Dimension({ from, to, base, offset, vertical, value, textAt = 'end' }) {
  const length = Math.abs(to - from)
  const small = length < SMALL_DIMENSION
  const dir = Math.sign(to - from) || 1
  // Inside: arrows point outwards to the extension lines. Outside: they point inwards.
  const arrowDir = small ? -dir : dir
  const tail = small ? 4 : 0 // short leader beyond each extension line for outside arrows
  const textPos = !small ? (from + to) / 2 : textAt === 'start' ? from - dir * (tail + 3.5) : to + dir * (tail + 3.5)
  const textSize = small ? 2.5 : 3.5
  if (!vertical) {
    const y = base + offset
    return (
      <g>
        <line x1={from} y1={base + 1} x2={from} y2={y + 2} stroke="#111827" strokeWidth={LINE.thin} />
        <line x1={to} y1={base + 1} x2={to} y2={y + 2} stroke="#111827" strokeWidth={LINE.thin} />
        <line x1={from - dir * tail} y1={y} x2={to + dir * tail} y2={y} stroke="#111827" strokeWidth={LINE.thin} />
        <Arrow x={from} y={y} dx={-arrowDir} dy={0} />
        <Arrow x={to} y={y} dx={arrowDir} dy={0} />
        <text x={textPos} y={y - 1} fontSize={textSize} textAnchor="middle">{value}</text>
      </g>
    )
  }
  const x = base - offset
  return (
    <g>
      <line x1={base - 1} y1={from} x2={x - 2} y2={from} stroke="#111827" strokeWidth={LINE.thin} />
      <line x1={base - 1} y1={to} x2={x - 2} y2={to} stroke="#111827" strokeWidth={LINE.thin} />
      <line x1={x} y1={from - dir * tail} x2={x} y2={to + dir * tail} stroke="#111827" strokeWidth={LINE.thin} />
      <Arrow x={x} y={from} dx={0} dy={-arrowDir} />
      <Arrow x={x} y={to} dx={0} dy={arrowDir} />
      <text x={x - 1} y={textPos} fontSize={textSize} textAnchor="middle" transform={`rotate(-90 ${x - 1} ${textPos})`}>{value}</text>
    </g>
  )
}

/** Chain dimensions between the stops plus an overall dimension further out. */
function DimensionChain({ stops, toPaper, base, vertical }) {
  if (stops.length < 2) return null
  const overall = <Dimension from={toPaper(stops[0])} to={toPaper(stops[stops.length - 1])} base={base} offset={stops.length > 2 ? 16 : 8} vertical={vertical} value={formatMm(stops[stops.length - 1] - stops[0])} />
  if (stops.length === 2) return overall
  return (
    <g>
      {stops.slice(1).map((stop, index) => (
        // A short first segment puts its value before the chain; any other goes after its end.
        <Dimension key={stop} from={toPaper(stops[index])} to={toPaper(stop)} base={base} offset={8} vertical={vertical} value={formatMm(stop - stops[index])} textAt={index === 0 ? 'start' : 'end'} />
      ))}
      {overall}
    </g>
  )
}

/** Thin chain (dash-dot) lines for symmetric views, running 3 mm past the outline. */
function SymmetryAxes({ projection, box }) {
  const axes = getSymmetryAxes(projection)
  const style = { stroke: '#111827', strokeWidth: LINE.thin, strokeDasharray: '7 1.2 0.6 1.2' }
  const midX = box.x + box.width / 2
  const midY = box.y + box.height / 2
  return (
    <g>
      {axes.vertical && <line x1={midX} y1={box.y - 3} x2={midX} y2={box.y + box.height + 3} {...style} />}
      {axes.horizontal && <line x1={box.x - 3} y1={midY} x2={box.x + box.width + 3} y2={midY} {...style} />}
    </g>
  )
}

function ViewLines({ projection, box, scale }) {
  const px = (u) => box.x + u * scale
  const py = (v) => box.y + box.height - v * scale
  return projection.lines.map((line, index) => {
    const [x1, y1, x2, y2] = line.o === 'h' ? [px(line.from), py(line.at), px(line.to), py(line.at)] : [px(line.at), py(line.from), px(line.at), py(line.to)]
    const hidden = line.type === 'hidden'
    return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111827" strokeWidth={hidden ? LINE.hidden : LINE.thick} strokeDasharray={hidden ? LINE.dash : undefined} strokeLinecap={hidden ? 'butt' : 'square'} />
  })
}

const wrapTitle = (text, max = 22) => {
  if (text.length <= max) return [text]
  const words = text.split(' ')
  const lines = ['']
  words.forEach((word) => {
    const current = lines[lines.length - 1]
    if ((current + ' ' + word).trim().length > max && lines.length < 2) lines.push(word)
    else lines[lines.length - 1] = (current + ' ' + word).trim()
  })
  return lines
}

function TitleBlock({ info, scaleLabel }) {
  const { x, y, width, height } = SHEET.titleBlock
  const thin = { stroke: '#111827', strokeWidth: LINE.thin }
  const title = wrapTitle((info.title || 'Vật thể').toUpperCase(), 18)
  // Fit each line into the 45 mm name cell (uppercase Arial is roughly 0.68 em per character).
  const titleSize = Math.min(4.5, ...title.map((line) => 41 / (line.length * 0.68)))
  const label = { fontSize: 2.5, fill: '#111827' }
  const value = { fontSize: 3, fill: '#111827' }
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill="#fff" stroke="#111827" strokeWidth={LINE.thick} />
      {[8, 16].map((dy) => <line key={dy} x1={x} y1={y + dy} x2={x + 70} y2={y + dy} {...thin} />)}
      {[8, 16, 24].map((dy) => <line key={`r${dy}`} x1={x + 115} y1={y + dy} x2={x + width} y2={y + dy} {...thin} />)}
      <line x1={x + 20} y1={y} x2={x + 20} y2={y + 16} {...thin} />
      <line x1={x + 50} y1={y} x2={x + 50} y2={y + 16} {...thin} />
      <line x1={x + 70} y1={y} x2={x + 70} y2={y + height} stroke="#111827" strokeWidth={LINE.thick} />
      <line x1={x + 115} y1={y} x2={x + 115} y2={y + height} stroke="#111827" strokeWidth={LINE.thick} />
      <text x={x + 2} y={y + 5.5} {...label}>Người vẽ</text>
      <text x={x + 22} y={y + 5.5} {...value}>{info.drawer || ''}</text>
      <text x={x + 52} y={y + 5.5} {...label}>{info.date}</text>
      <text x={x + 2} y={y + 13.5} {...label}>Kiểm tra</text>
      <text x={x + 35} y={y + 26} {...value} textAnchor="middle">{info.school || 'Trường / Lớp'}</text>
      {title.map((line, index) => (
        <text key={index} x={x + 92.5} y={y + (title.length === 1 ? 15 : 12) + index * 6} fontSize={titleSize} fontWeight="700" textAnchor="middle">{line}</text>
      ))}
      <text x={x + 92.5} y={y + 28} {...label} textAnchor="middle">Bản vẽ số: {info.number || '01'}</text>
      <text x={x + 117} y={y + 5.5} {...label}>Vật liệu</text>
      <text x={x + 117} y={y + 13.5} fontSize={info.material && info.material.length > 12 ? 2.3 : 3}>{info.material || ''}</text>
      <text x={x + 117} y={y + 21.5} {...label}>Tỉ lệ</text>
      <text x={x + 117} y={y + 29.5} {...value} fontWeight="700">{scaleLabel}</text>
    </g>
  )
}

export function TechnicalSheet({ model, info, scaleSetting = 'auto', className = '', svgRef }) {
  const scale = resolveScale(model, scaleSetting)
  const layout = layoutSheet(model, scale.value)
  // Projections only depend on the model's content. Project edits deep-clone the model on every
  // keystroke, so key the memo on its serialised form rather than object identity.
  const modelKey = JSON.stringify(model)
  const views = useMemo(
    () => (model.cells.length ? { front: projectView(model, 'front'), top: projectView(model, 'top'), side: projectView(model, 'side') } : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [modelKey],
  )
  const ready = Boolean(layout && views)

  let iso = null
  if (ready && layout.iso.width > 35 && layout.iso.height > 30) {
    const bounds = getIsometricBounds(model)
    const fit = Math.min(layout.iso.width / bounds.width, layout.iso.height / bounds.height, scale.value)
    const dx = layout.iso.x + (layout.iso.width - bounds.width * fit) / 2 - bounds.minX * fit
    const dy = layout.iso.y + (layout.iso.height - bounds.height * fit) / 2 - bounds.minY * fit
    iso = <g transform={`translate(${dx} ${dy}) scale(${fit})`}><IsometricFaces model={model} strokeWidth={LINE.thick / fit} /></g>
  }

  return (
    <svg ref={svgRef} className={`td-sheet ${className}`} viewBox={`0 0 ${SHEET.width} ${SHEET.height}`} role="img" aria-label={`Bản vẽ kĩ thuật ${info.title || ''}, tỉ lệ ${scale.label}`} fontFamily="Arial, Helvetica, sans-serif">
      <rect width={SHEET.width} height={SHEET.height} fill="#fff" />
      <rect x={SHEET.frame.left} y={SHEET.frame.top} width={SHEET.frame.right - SHEET.frame.left} height={SHEET.frame.bottom - SHEET.frame.top} fill="none" stroke="#111827" strokeWidth={LINE.thick} />
      {ready ? (
        <>
          <ViewLines projection={views.front} box={layout.front} scale={scale.value} />
          <ViewLines projection={views.top} box={layout.top} scale={scale.value} />
          <ViewLines projection={views.side} box={layout.side} scale={scale.value} />
          <SymmetryAxes projection={views.front} box={layout.front} />
          <SymmetryAxes projection={views.top} box={layout.top} />
          <SymmetryAxes projection={views.side} box={layout.side} />
          <DimensionChain stops={getDimensionStops(views.front, 'v')} toPaper={(u) => layout.front.x + u * scale.value} base={layout.front.y + layout.front.height} />
          <DimensionChain stops={getDimensionStops(views.front, 'h')} toPaper={(v) => layout.front.y + layout.front.height - v * scale.value} base={layout.front.x} vertical />
          <DimensionChain stops={getDimensionStops(views.top, 'h')} toPaper={(v) => layout.top.y + layout.top.height - v * scale.value} base={layout.top.x} vertical />
          {iso}
        </>
      ) : (
        <text x={(SHEET.frame.left + SHEET.titleBlock.x) / 2} y={90} fontSize={5} textAnchor="middle" fill="#6b7280">{model.cells.length ? 'Vật thể quá lớn so với khổ giấy A4 ở các tỉ lệ chuẩn.' : 'Thiết kế vật thể ở trên để tạo bản vẽ.'}</text>
      )}
      <TitleBlock info={info} scaleLabel={scale.label} />
    </svg>
  )
}

