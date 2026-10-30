import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Download, Minus, PenTool, Plus, Printer, RotateCcw, Trash2, Undo2, X } from 'lucide-react'
import { safetyChecklist } from '../data/engineeringDesign'
import { createId, getChosenSolution, rankSolutions, strokeToPath, summarizeTests } from '../utils/engineeringDesign'
import { STANDARD_SCALES, layoutSheet, pickScale } from '../utils/technicalDrawing'
import { ObjectDesigner, TechnicalSheet, resolveScale } from './TechnicalDrawing'
import { downloadPng, downloadSvg, printDossier, printElement, toFileName } from '../utils/printDrawing'

export const SKETCH_WIDTH = 800
export const SKETCH_HEIGHT = 500
const SKETCH_COLORS = [['#1f2937', 'Nét chính'], ['#2563eb', 'Kích thước'], ['#dc2626', 'Ghi chú']]
const formatMoney = (value) => `${Math.round(value).toLocaleString('vi-VN')} đ`

const TextArea = ({ label, hint, ...props }) => (
  <label className="ed-field">
    <span>{label}{hint && <small>{hint}</small>}</span>
    <textarea rows={3} {...props} />
  </label>
)

const TextInput = ({ label, ...props }) => (
  <label className="ed-field">
    <span>{label}</span>
    <input type="text" {...props} />
  </label>
)

export const SketchView = ({ strokes, className = '' }) => (
  <svg viewBox={`0 0 ${SKETCH_WIDTH} ${SKETCH_HEIGHT}`} className={className} role="img" aria-label="Bản phác thảo sản phẩm">
    <rect width={SKETCH_WIDTH} height={SKETCH_HEIGHT} fill="#fff" />
    {strokes.map((stroke, index) => (
      <path key={index} d={strokeToPath(stroke.points)} stroke={stroke.color} strokeWidth={stroke.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </svg>
)

function SketchPad({ strokes, onChange, onAddStroke }) {
  const svgRef = useRef(null)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState(SKETCH_COLORS[0][0])
  const [draft, setDraft] = useState(null)
  // The ref is the source of truth while drawing: pointer events can arrive faster than React re-renders.
  const draftRef = useRef(null)
  const updateDraft = (next) => { draftRef.current = next; setDraft(next) }

  const toPoint = (event) => {
    const rect = svgRef.current.getBoundingClientRect()
    return [
      Math.round(((event.clientX - rect.left) / rect.width) * SKETCH_WIDTH),
      Math.round(((event.clientY - rect.top) / rect.height) * SKETCH_HEIGHT),
    ]
  }
  const start = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = toPoint(event)
    updateDraft({ color, width: color === SKETCH_COLORS[0][0] ? 3 : 2, points: [point, point] })
  }
  const move = (event) => {
    const current = draftRef.current
    if (!current) return
    const point = toPoint(event)
    if (tool === 'line') {
      updateDraft({ ...current, points: [current.points[0], point] })
      return
    }
    const [lastX, lastY] = current.points[current.points.length - 1]
    // Skip points closer than 3 units to keep saved sketches small.
    if (Math.hypot(point[0] - lastX, point[1] - lastY) >= 3) updateDraft({ ...current, points: [...current.points, point] })
  }
  const end = () => {
    if (draftRef.current) onAddStroke(draftRef.current)
    updateDraft(null)
  }

  return (
    <div className="ed-sketch">
      <div className="ed-sketch-toolbar" role="toolbar" aria-label="Công cụ phác thảo">
        <div className="studio-tabs">
          <button type="button" aria-pressed={tool === 'pen'} onClick={() => setTool('pen')}><PenTool size={14} /> Vẽ tự do</button>
          <button type="button" aria-pressed={tool === 'line'} onClick={() => setTool('line')}><Minus size={14} /> Đường thẳng</button>
        </div>
        <div className="ed-color-row">
          {SKETCH_COLORS.map(([value, label]) => (
            <button key={value} type="button" className="ed-color" style={{ '--swatch': value }} aria-pressed={color === value} onClick={() => setColor(value)} title={label}><span className="sr-only">{label}</span></button>
          ))}
        </div>
        <div className="ed-sketch-actions">
          <button type="button" onClick={() => onChange(strokes.slice(0, -1))} disabled={!strokes.length}><Undo2 size={15} /> Hoàn tác</button>
          <button type="button" onClick={() => { if (window.confirm('Xóa toàn bộ bản phác thảo?')) onChange([]) }} disabled={!strokes.length}><Trash2 size={15} /> Xóa hết</button>
        </div>
      </div>
      <svg
        ref={svgRef}
        className="ed-sketch-canvas"
        viewBox={`0 0 ${SKETCH_WIDTH} ${SKETCH_HEIGHT}`}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        role="img"
        aria-label="Vùng vẽ phác thảo. Kéo chuột hoặc ngón tay để vẽ."
      >
        <defs>
          <pattern id="ed-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#e5ebe7" strokeWidth="1" /></pattern>
        </defs>
        <rect width={SKETCH_WIDTH} height={SKETCH_HEIGHT} fill="url(#ed-grid)" />
        {[...strokes, ...(draft ? [draft] : [])].map((stroke, index) => (
          <path key={index} d={strokeToPath(stroke.points)} stroke={stroke.color} strokeWidth={stroke.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <p className="ed-muted">Mỗi ô lưới tương ứng 10 mm. Dùng màu xanh để vẽ đường kích thước, màu đỏ để đánh dấu chi tiết cần chú ý.</p>
    </div>
  )
}

// ============= Step 1 =============
export function ProblemStep({ project, patch }) {
  const addCriterion = () => patch((draft) => {
    const id = createId('c')
    draft.criteria.push({ id, name: '', weight: 3, measure: '' })
    draft.tests.push({ id: createId('t'), criterionId: id, method: '', result: '', passed: null })
  })
  const removeCriterion = (id) => patch((draft) => {
    draft.criteria = draft.criteria.filter((item) => item.id !== id)
    draft.tests = draft.tests.filter((test) => test.criterionId !== id)
    draft.solutions.forEach((solution) => { delete solution.scores[id] })
  })

  return (
    <>
      <section className="ed-card">
        <h3>Vấn đề cần giải quyết</h3>
        <TextArea label="Mô tả vấn đề" hint="Ai cần gì, vì sao, khó khăn hiện tại" value={project.problem.need} onChange={(event) => patch((draft) => { draft.problem.need = event.target.value })} placeholder="VD: Học sinh cần… vì… nhưng hiện tại…" rows={4} />
        <div className="ed-grid-2">
          <TextArea label="Người sử dụng" value={project.problem.users} onChange={(event) => patch((draft) => { draft.problem.users = event.target.value })} placeholder="Ai sẽ dùng sản phẩm? Dùng ở đâu?" rows={2} />
          <TextArea label="Ràng buộc" hint="Thời gian, chi phí, vật liệu" value={project.problem.constraints} onChange={(event) => patch((draft) => { draft.problem.constraints = event.target.value })} placeholder="VD: Chi phí dưới 50.000 đồng, làm trong 2 tuần" rows={2} />
        </div>
      </section>
      <section className="ed-card">
        <div className="ed-card-heading"><h3>Tiêu chí của sản phẩm</h3><span>{project.criteria.length} tiêu chí</span></div>
        <div className="ed-table-wrap">
          <table className="ed-table">
            <thead><tr><th>Tiêu chí</th><th>Cách kiểm tra / mức cần đạt</th><th className="ed-col-narrow">Trọng số</th><th className="ed-col-icon"><span className="sr-only">Xóa</span></th></tr></thead>
            <tbody>
              {project.criteria.map((item) => (
                <tr key={item.id}>
                  <td><input aria-label="Tên tiêu chí" value={item.name} onChange={(event) => patch((draft) => { draft.criteria.find((c) => c.id === item.id).name = event.target.value })} placeholder="VD: Đứng vững" /></td>
                  <td><input aria-label="Cách kiểm tra" value={item.measure} onChange={(event) => patch((draft) => { draft.criteria.find((c) => c.id === item.id).measure = event.target.value })} placeholder="VD: Đặt vật 200 g không đổ" /></td>
                  <td>
                    <select aria-label={`Trọng số ${item.name}`} value={item.weight} onChange={(event) => patch((draft) => { draft.criteria.find((c) => c.id === item.id).weight = Number(event.target.value) })}>
                      {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </td>
                  <td><button type="button" className="ed-icon-button" onClick={() => removeCriterion(item.id)} aria-label={`Xóa tiêu chí ${item.name}`}><X size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!project.criteria.length && <p className="ed-empty">Chưa có tiêu chí. Hãy thêm ít nhất 3 tiêu chí đo được.</p>}
        <button type="button" className="studio-button secondary ed-add" onClick={addCriterion}><Plus size={16} /> Thêm tiêu chí</button>
      </section>
    </>
  )
}

// ============= Step 2 =============
export function SolutionsStep({ project, patch }) {
  const ranking = rankSolutions(project.solutions, project.criteria)
  const best = ranking.find((item) => item.complete)
  const chosen = getChosenSolution(project)
  const setScore = (solutionId, criterionId, value) => patch((draft) => {
    draft.solutions.find((item) => item.id === solutionId).scores[criterionId] = Number(value)
  })

  return (
    <>
      <section className="ed-card">
        <h3>Tìm hiểu tổng quan</h3>
        <div className="ed-grid-2">
          <TextArea label="Sản phẩm / giải pháp đã có" hint="Ưu điểm và hạn chế" value={project.research.existing} onChange={(event) => patch((draft) => { draft.research.existing = event.target.value })} placeholder="VD: Giá đỡ nhựa bán sẵn chắc chắn nhưng không gấp gọn được…" rows={4} />
          <TextArea label="Kiến thức, nguyên lí liên quan" value={project.research.principles} onChange={(event) => patch((draft) => { draft.research.principles = event.target.value })} placeholder="VD: Trọng tâm thấp giúp vật đứng vững; kết cấu tam giác bền vững…" rows={4} />
        </div>
      </section>

      <section className="ed-card">
        <div className="ed-card-heading"><h3>Các phương án đề xuất</h3><span>{project.solutions.length} phương án</span></div>
        <div className="ed-solution-list">
          {project.solutions.map((solution, index) => (
            <article key={solution.id} className="ed-solution">
              <div className="ed-solution-head">
                <span className="ed-badge">PA {index + 1}</span>
                <input aria-label={`Tên phương án ${index + 1}`} value={solution.name} onChange={(event) => patch((draft) => { draft.solutions.find((item) => item.id === solution.id).name = event.target.value })} placeholder="Tên phương án" />
                <button type="button" className="ed-icon-button" onClick={() => patch((draft) => { draft.solutions = draft.solutions.filter((item) => item.id !== solution.id); if (draft.chosenSolutionId === solution.id) draft.chosenSolutionId = null })} aria-label={`Xóa phương án ${solution.name}`}><X size={16} /></button>
              </div>
              <textarea aria-label={`Mô tả phương án ${index + 1}`} rows={2} value={solution.description} onChange={(event) => patch((draft) => { draft.solutions.find((item) => item.id === solution.id).description = event.target.value })} placeholder="Mô tả ngắn: hình dáng, vật liệu, cách hoạt động" />
            </article>
          ))}
        </div>
        <button type="button" className="studio-button secondary ed-add" onClick={() => patch((draft) => { draft.solutions.push({ id: createId('s'), name: '', description: '', scores: {} }) })}><Plus size={16} /> Thêm phương án</button>
      </section>

      <section className="ed-card">
        <div className="ed-card-heading"><h3>Ma trận lựa chọn phương án</h3><span>Chấm 1 (kém) – 5 (rất tốt)</span></div>
        {project.criteria.length && project.solutions.length ? (
          <div className="ed-table-wrap">
            <table className="ed-table ed-matrix">
              <thead>
                <tr><th>Tiêu chí (trọng số)</th>{project.solutions.map((solution, index) => <th key={solution.id}>{solution.name || `PA ${index + 1}`}</th>)}</tr>
              </thead>
              <tbody>
                {project.criteria.map((criterion) => (
                  <tr key={criterion.id}>
                    <th scope="row">{criterion.name || 'Tiêu chí chưa đặt tên'} <small>×{criterion.weight}</small></th>
                    {project.solutions.map((solution) => (
                      <td key={solution.id}>
                        <select aria-label={`Điểm ${solution.name} theo ${criterion.name}`} value={solution.scores[criterion.id] || ''} onChange={(event) => setScore(solution.id, criterion.id, event.target.value)}>
                          <option value="">–</option>
                          {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Tổng điểm</th>
                  {project.solutions.map((solution) => {
                    const score = ranking.find((item) => item.solution.id === solution.id)
                    const isBest = best?.solution.id === solution.id
                    return (
                      <td key={solution.id} className={isBest ? 'is-best' : ''}>
                        <strong>{score.total}</strong><small>/{score.max}</small>
                        <div className="ed-meter" aria-hidden="true"><i style={{ width: `${score.percent}%` }} /></div>
                        {isBest && <span className="ed-best-tag">Điểm cao nhất</span>}
                        <label className="ed-choose"><input type="radio" name="chosen-solution" checked={chosen?.id === solution.id} onChange={() => patch((draft) => { draft.chosenSolutionId = solution.id })} /> Chọn</label>
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="ed-empty">Cần có tiêu chí (bước 1) và ít nhất một phương án để chấm điểm.</p>
        )}
        {chosen && best && chosen.id !== best.solution.id && (
          <TextArea label="Vì sao chọn phương án này thay vì phương án điểm cao nhất?" value={project.choiceReason} onChange={(event) => patch((draft) => { draft.choiceReason = event.target.value })} rows={2} />
        )}
      </section>
    </>
  )
}

// ============= Step 3 =============
const drawingInfo = (project, owner, school) => ({
  title: project.title,
  material: project.prototype.drawing.material,
  number: project.prototype.drawing.number,
  drawer: project.dossier.team || owner,
  school,
  date: new Date().toLocaleDateString('vi-VN'),
})

export function PrototypeStep({ project, patch, owner, school }) {
  const chosen = getChosenSolution(project)
  const { model, drawing } = project.prototype
  const scale = resolveScale(model, drawing.scale)
  const sheetRef = useRef(null)
  const [exporting, setExporting] = useState(false)
  const exportPng = async () => {
    setExporting(true)
    try {
      await downloadPng(sheetRef.current, toFileName(project.title, 'png'))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setExporting(false)
    }
  }
  const totalCost = project.prototype.materials.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.cost || 0), 0)
  const updateMaterial = (id, key, value) => patch((draft) => { draft.prototype.materials.find((item) => item.id === id)[key] = value })

  return (
    <>
      <div className={`ed-callout ${chosen ? '' : 'is-warning'}`}>
        {chosen ? <>Phương án được chọn: <strong>{chosen.name}</strong>{chosen.description && ` — ${chosen.description}`}</> : 'Chưa chọn phương án. Hãy hoàn thành ma trận lựa chọn ở bước 2.'}
      </div>
      <details className="ed-card ed-details" open={project.prototype.sketch.length > 0 || undefined}>
        <summary><h3>Phác thảo nhanh ý tưởng <small>không bắt buộc</small></h3></summary>
        <SketchPad
          strokes={project.prototype.sketch}
          onChange={(sketch) => patch((draft) => { draft.prototype.sketch = sketch })}
          // Appending inside patch works on the latest state, so strokes finished back-to-back are never lost.
          onAddStroke={(stroke) => patch((draft) => { draft.prototype.sketch.push(stroke) })}
        />
      </details>
      <section className="ed-card">
        <div className="ed-card-heading"><h3>Thiết kế vật thể</h3><span>Dựng vật thể từ các khối hộp theo kích thước thật</span></div>
        <ObjectDesigner model={model} onChange={(next) => patch((draft) => { draft.prototype.model = next })} />
      </section>
      <section className="ed-card">
        <div className="ed-card-heading"><h3>Bản vẽ kĩ thuật</h3><span>TCVN · phương pháp chiếu góc thứ nhất</span></div>
        <div className="td-sheet-settings">
          <TextInput label="Vật liệu" value={drawing.material} onChange={(event) => patch((draft) => { draft.prototype.drawing.material = event.target.value })} placeholder="VD: Gỗ ép 5 mm" />
          <label className="ed-field">
            <span>Tỉ lệ</span>
            <select value={drawing.scale} onChange={(event) => patch((draft) => { draft.prototype.drawing.scale = event.target.value })}>
              <option value="auto">Tự động ({pickScale(model).label})</option>
              {STANDARD_SCALES.filter((item) => layoutSheet(model, item.value)).map((item) => <option key={item.label} value={item.label}>{item.label}</option>)}
            </select>
          </label>
          <TextInput label="Bản vẽ số" value={drawing.number} onChange={(event) => patch((draft) => { draft.prototype.drawing.number = event.target.value })} />
        </div>
        <div className="td-sheet-frame"><TechnicalSheet svgRef={sheetRef} model={model} info={drawingInfo(project, owner, school)} scaleSetting={drawing.scale} /></div>
        <div className="td-legend" aria-label="Chú giải nét vẽ">
          <span><i className="is-thick" />Nét liền đậm: cạnh thấy</span>
          <span><i className="is-hidden" />Nét đứt: cạnh khuất</span>
          <span><i className="is-thin" />Nét liền mảnh: đường kích thước</span>
          <span>Tỉ lệ <strong>{scale.label}</strong> · kích thước ghi bằng mm</span>
        </div>
        <div className="td-export-row">
          <button type="button" className="studio-button" onClick={() => printElement(sheetRef.current)} disabled={!model.cells.length}><Printer size={16} /> In bản vẽ (A4 ngang)</button>
          <button type="button" className="studio-button secondary" onClick={exportPng} disabled={!model.cells.length || exporting}><Download size={16} /> {exporting ? 'Đang tạo ảnh…' : 'Tải PNG'}</button>
          <button type="button" className="studio-button secondary" onClick={() => downloadSvg(sheetRef.current, toFileName(project.title, 'svg'))} disabled={!model.cells.length}><Download size={16} /> Tải SVG</button>
          <span className="ed-muted">PNG 200 dpi để nộp bài · SVG giữ nét sắc khi phóng to · In → chọn “Lưu dưới dạng PDF” để có file PDF</span>
        </div>
      </section>
      <section className="ed-card">
        <div className="ed-card-heading"><h3>Bảng vật liệu</h3><span>Ước tính: <strong>{formatMoney(totalCost)}</strong></span></div>
        <div className="ed-table-wrap">
          <table className="ed-table">
            <thead><tr><th>Chi tiết</th><th>Vật liệu</th><th className="ed-col-narrow">Số lượng</th><th>Kích thước</th><th className="ed-col-money">Đơn giá (đ)</th><th className="ed-col-icon"><span className="sr-only">Xóa</span></th></tr></thead>
            <tbody>
              {project.prototype.materials.map((item) => (
                <tr key={item.id}>
                  <td><input aria-label="Tên chi tiết" value={item.name} onChange={(event) => updateMaterial(item.id, 'name', event.target.value)} placeholder="VD: Đế" /></td>
                  <td><input aria-label="Vật liệu" value={item.material} onChange={(event) => updateMaterial(item.id, 'material', event.target.value)} placeholder="VD: Bìa carton 5 mm" /></td>
                  <td><input aria-label="Số lượng" type="number" min="0" value={item.qty} onChange={(event) => updateMaterial(item.id, 'qty', event.target.value)} /></td>
                  <td><input aria-label="Kích thước" value={item.size} onChange={(event) => updateMaterial(item.id, 'size', event.target.value)} placeholder="120 × 90 mm" /></td>
                  <td><input aria-label="Đơn giá" type="number" min="0" step="500" value={item.cost} onChange={(event) => updateMaterial(item.id, 'cost', event.target.value)} /></td>
                  <td><button type="button" className="ed-icon-button" onClick={() => patch((draft) => { draft.prototype.materials = draft.prototype.materials.filter((m) => m.id !== item.id) })} aria-label={`Xóa ${item.name || 'dòng vật liệu'}`}><X size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="studio-button secondary ed-add" onClick={() => patch((draft) => { draft.prototype.materials.push({ id: createId('m'), name: '', material: '', qty: 1, size: '', cost: 0 }) })}><Plus size={16} /> Thêm vật liệu</button>
      </section>
      <section className="ed-card">
        <h3>Chế tạo</h3>
        <div className="ed-grid-2">
          <TextArea label="Các bước chế tạo" hint="Mỗi bước một dòng" value={project.prototype.steps} onChange={(event) => patch((draft) => { draft.prototype.steps = event.target.value })} placeholder={'1. Vẽ và cắt đế theo kích thước\n2. …'} rows={6} />
          <TextArea label="Dụng cụ cần dùng" value={project.prototype.tools} onChange={(event) => patch((draft) => { draft.prototype.tools = event.target.value })} placeholder="VD: Thước, bút chì, dao rọc giấy, súng bắn keo" rows={6} />
        </div>
      </section>
      <section className="ed-card">
        <h3>Kiểm tra an toàn trước khi làm</h3>
        <ul className="ed-checklist">
          {safetyChecklist.map((item) => (
            <li key={item.id}>
              <label><input type="checkbox" checked={project.prototype.safety.includes(item.id)} onChange={(event) => patch((draft) => {
                draft.prototype.safety = event.target.checked ? [...draft.prototype.safety, item.id] : draft.prototype.safety.filter((id) => id !== item.id)
              })} />{item.label}</label>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

// ============= Step 4 =============
export function TestingStep({ project, patch, goToStep }) {
  const [note, setNote] = useState('')
  const summary = summarizeTests(project)
  const updateTest = (id, key, value) => patch((draft) => { draft.tests.find((test) => test.id === id)[key] = value })
  const addIteration = () => {
    if (!note.trim()) return
    patch((draft) => { draft.iterations.push({ id: createId('i'), version: draft.iterations.length + 2, note: note.trim(), date: new Date().toISOString() }) })
    setNote('')
  }

  return (
    <>
      <div className="ed-stat-row">
        <div><strong>{summary.passed}</strong><span>Đạt</span></div>
        <div className="is-fail"><strong>{summary.failed}</strong><span>Chưa đạt</span></div>
        <div><strong>{summary.total - summary.passed - summary.failed}</strong><span>Chưa thử</span></div>
        <div><strong>v{project.iterations.length + 1}</strong><span>Phiên bản hiện tại</span></div>
      </div>
      <section className="ed-card">
        <h3>Kết quả thử nghiệm theo tiêu chí</h3>
        {project.criteria.map((criterion) => (
          <div key={criterion.id} className="ed-test-group">
            <h4>{criterion.name || 'Tiêu chí chưa đặt tên'} <small>trọng số {criterion.weight}</small></h4>
            {project.tests.filter((test) => test.criterionId === criterion.id).map((test) => (
              <div key={test.id} className="ed-test-row">
                <input aria-label="Cách thử" value={test.method} onChange={(event) => updateTest(test.id, 'method', event.target.value)} placeholder="Cách thử nghiệm" />
                <input aria-label="Kết quả đo được" value={test.result} onChange={(event) => updateTest(test.id, 'result', event.target.value)} placeholder="Kết quả đo được" />
                <div className="ed-verdict" role="group" aria-label="Đánh giá">
                  <button type="button" aria-pressed={test.passed === true} className="is-pass" onClick={() => updateTest(test.id, 'passed', test.passed === true ? null : true)}><Check size={14} /> Đạt</button>
                  <button type="button" aria-pressed={test.passed === false} className="is-fail" onClick={() => updateTest(test.id, 'passed', test.passed === false ? null : false)}><X size={14} /> Chưa đạt</button>
                </div>
              </div>
            ))}
            <button type="button" className="ed-link-button" onClick={() => patch((draft) => { draft.tests.push({ id: createId('t'), criterionId: criterion.id, method: '', result: '', passed: null }) })}><Plus size={14} /> Thêm lần thử</button>
          </div>
        ))}
        {!project.criteria.length && <p className="ed-empty">Chưa có tiêu chí để thử nghiệm. Quay lại bước 1 để thêm tiêu chí.</p>}
      </section>
      <section className="ed-card">
        <h3>Cải tiến thiết kế</h3>
        <p className="ed-muted">Quy trình thiết kế có tính lặp: nếu tiêu chí chưa đạt, hãy ghi lại thay đổi rồi quay lại chỉnh phương án hoặc nguyên mẫu.</p>
        <div className="ed-iteration-form">
          <textarea aria-label="Nội dung cải tiến" rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="VD: Đế bị lật khi gõ bàn → mở rộng đế thêm 20 mm và dán thêm thanh chống phía sau." />
          <button type="button" className="studio-button" onClick={addIteration} disabled={!note.trim()}><RotateCcw size={16} /> Ghi lại vòng cải tiến</button>
        </div>
        <div className="ed-inline-actions">
          <button type="button" className="ed-link-button" onClick={() => goToStep('solutions')}>← Điều chỉnh phương án (bước 2)</button>
          <button type="button" className="ed-link-button" onClick={() => goToStep('prototype')}>← Sửa nguyên mẫu (bước 3)</button>
        </div>
        {project.iterations.length > 0 && (
          <ol className="ed-timeline">
            {[...project.iterations].reverse().map((item) => (
              <li key={item.id}><span>v{item.version}</span><div><p>{item.note}</p><small>{new Date(item.date).toLocaleDateString('vi-VN')}</small></div>
                <button type="button" className="ed-icon-button" aria-label="Xóa vòng cải tiến" onClick={() => patch((draft) => { draft.iterations = draft.iterations.filter((i) => i.id !== item.id) })}><X size={14} /></button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  )
}

// ============= Step 5 =============
export function DossierStep({ project, patch, owner, school }) {
  return (
    <>
      <section className="ed-card ed-noprint">
        <h3>Hoàn thiện hồ sơ</h3>
        <TextInput label="Thành viên nhóm" value={project.dossier.team} onChange={(event) => patch((draft) => { draft.dossier.team = event.target.value })} placeholder={owner || 'Họ tên các thành viên'} />
        <TextArea label="Tóm tắt dự án" value={project.dossier.summary} onChange={(event) => patch((draft) => { draft.dossier.summary = event.target.value })} placeholder="Sản phẩm là gì, giải quyết vấn đề gì, kết quả thử nghiệm ra sao?" rows={3} />
        <TextArea label="Tự đánh giá & bài học rút ra" value={project.dossier.reflection} onChange={(event) => patch((draft) => { draft.dossier.reflection = event.target.value })} placeholder="Điều nhóm làm tốt, khó khăn gặp phải, nếu làm lại sẽ thay đổi gì?" rows={3} />
        <button type="button" className="studio-button" onClick={printDossier}><Printer size={16} /> In / lưu PDF</button>
      </section>
      <DossierPreview project={project} owner={owner} school={school} />
    </>
  )
}

function DossierPreview({ project, owner, school }) {
  const chosen = getChosenSolution(project)
  const ranking = rankSolutions(project.solutions, project.criteria)
  const summary = summarizeTests(project)
  const totalCost = project.prototype.materials.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.cost || 0), 0)
  const steps = project.prototype.steps.split('\n').map((line) => line.trim()).filter(Boolean)
  const empty = <em className="ed-muted">(chưa có nội dung)</em>

  return (
    <article className="ed-dossier" aria-label="Hồ sơ kĩ thuật">
      <header>
        <p>HỒ SƠ KĨ THUẬT · CÔNG NGHỆ THPT</p>
        <h2>{project.title}</h2>
        <dl>
          <div><dt>Thực hiện</dt><dd>{project.dossier.team || owner || '—'}</dd></div>
          <div><dt>Ngày lập</dt><dd>{new Date().toLocaleDateString('vi-VN')}</dd></div>
          <div><dt>Phiên bản</dt><dd>v{project.iterations.length + 1}</dd></div>
        </dl>
      </header>
      {project.dossier.summary && <section><h3>Tóm tắt</h3><p>{project.dossier.summary}</p></section>}
      <section>
        <h3>1. Vấn đề và yêu cầu</h3>
        <p><strong>Vấn đề:</strong> {project.problem.need || empty}</p>
        <p><strong>Người sử dụng:</strong> {project.problem.users || empty}</p>
        <p><strong>Ràng buộc:</strong> {project.problem.constraints || empty}</p>
        <table><thead><tr><th>Tiêu chí</th><th>Mức cần đạt</th><th>Trọng số</th></tr></thead>
          <tbody>{project.criteria.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.measure}</td><td>{item.weight}</td></tr>)}</tbody></table>
      </section>
      <section>
        <h3>2. Phương án và lựa chọn</h3>
        {project.research.existing && <p><strong>Tìm hiểu:</strong> {project.research.existing}</p>}
        {project.research.principles && <p><strong>Nguyên lí áp dụng:</strong> {project.research.principles}</p>}
        <table><thead><tr><th>Phương án</th><th>Điểm</th><th>Tỉ lệ</th></tr></thead>
          <tbody>{ranking.map(({ solution, total, max, percent }) => <tr key={solution.id} className={chosen?.id === solution.id ? 'is-chosen' : ''}><td>{solution.name}{chosen?.id === solution.id && ' ✓ (được chọn)'}</td><td>{total}/{max}</td><td>{percent}%</td></tr>)}</tbody></table>
        {project.choiceReason && <p><strong>Lí do lựa chọn:</strong> {project.choiceReason}</p>}
      </section>
      <section>
        <h3>3. Nguyên mẫu</h3>
        <p><strong>Bản vẽ kĩ thuật:</strong></p>
        <TechnicalSheet model={project.prototype.model} info={drawingInfo(project, owner, school)} scaleSetting={project.prototype.drawing.scale} className="ed-dossier-drawing" />
        {project.prototype.sketch.length > 0 && <><p><strong>Phác thảo ý tưởng:</strong></p><SketchView strokes={project.prototype.sketch} className="ed-dossier-sketch" /></>}
        {project.prototype.dimensions && <p><strong>Kích thước chính:</strong> {project.prototype.dimensions}</p>}
        {project.prototype.materials.length > 0 && (
          <table><thead><tr><th>Chi tiết</th><th>Vật liệu</th><th>SL</th><th>Kích thước</th><th>Thành tiền</th></tr></thead>
            <tbody>{project.prototype.materials.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.material}</td><td>{item.qty}</td><td>{item.size}</td><td>{formatMoney(Number(item.qty || 0) * Number(item.cost || 0))}</td></tr>)}</tbody>
            <tfoot><tr><td colSpan={4}>Tổng chi phí ước tính</td><td>{formatMoney(totalCost)}</td></tr></tfoot></table>
        )}
        {steps.length > 0 && <><p><strong>Các bước chế tạo:</strong></p><ol>{steps.map((line, index) => <li key={index}>{line.replace(/^\d+[.)]\s*/, '')}</li>)}</ol></>}
        {project.prototype.tools && <p><strong>Dụng cụ:</strong> {project.prototype.tools}</p>}
      </section>
      <section>
        <h3>4. Thử nghiệm và cải tiến</h3>
        <p>Kết quả: <strong>{summary.passed}</strong> đạt · <strong>{summary.failed}</strong> chưa đạt · {summary.total - summary.passed - summary.failed} chưa thử.</p>
        <table><thead><tr><th>Tiêu chí</th><th>Cách thử</th><th>Kết quả</th><th>Đánh giá</th></tr></thead>
          <tbody>{project.tests.map((test) => <tr key={test.id}><td>{project.criteria.find((item) => item.id === test.criterionId)?.name}</td><td>{test.method}</td><td>{test.result}</td><td>{test.passed === null ? '—' : test.passed ? 'Đạt' : 'Chưa đạt'}</td></tr>)}</tbody></table>
        {project.iterations.length > 0 && <><p><strong>Các vòng cải tiến:</strong></p><ol>{project.iterations.map((item) => <li key={item.id}>v{item.version}: {item.note}</li>)}</ol></>}
      </section>
      {project.dossier.reflection && <section><h3>5. Tự đánh giá</h3><p>{project.dossier.reflection}</p></section>}
    </article>
  )
}
