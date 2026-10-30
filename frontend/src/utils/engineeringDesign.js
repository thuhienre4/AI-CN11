import { blankTemplate, designSteps, projectTemplates, safetyChecklist } from '../data/engineeringDesign'
import { createModel } from './technicalDrawing'

const STORAGE_PREFIX = 'enginelab_engineering_design_v1'

export const createId = (prefix) =>
  `${prefix}-${globalThis.crypto?.randomUUID?.().slice(0, 8) || Math.random().toString(36).slice(2, 10)}`

export const createProject = (template = blankTemplate) => {
  const now = new Date().toISOString()
  const criteria = template.criteria.map((item) => ({ id: createId('c'), ...item }))
  return {
    id: createId('p'),
    templateId: template.id,
    title: template.id === blankTemplate.id ? 'Dự án thiết kế mới' : template.title,
    createdAt: now,
    updatedAt: now,
    currentStep: designSteps[0].id,
    problem: { ...template.problem },
    criteria,
    research: { existing: '', principles: '' },
    solutions: template.solutions.map((name) => ({ id: createId('s'), name, description: '', scores: {} })),
    chosenSolutionId: null,
    choiceReason: '',
    prototype: {
      sketch: [],
      model: createModel(template.model || blankTemplate.model),
      drawing: { material: template.material || '', scale: 'auto', number: '01' },
      materials: [],
      steps: '',
      tools: '',
      safety: [],
    },
    tests: criteria.map((item) => ({ id: createId('t'), criterionId: item.id, method: item.measure || '', result: '', passed: null })),
    iterations: [],
    dossier: { team: '', summary: '', reflection: '' },
  }
}

// ============= Decision matrix =============
export const scoreSolution = (solution, criteria) => {
  const max = criteria.reduce((sum, item) => sum + Number(item.weight || 0) * 5, 0)
  const total = criteria.reduce((sum, item) => sum + Number(item.weight || 0) * Number(solution.scores?.[item.id] || 0), 0)
  const complete = criteria.length > 0 && criteria.every((item) => Number(solution.scores?.[item.id]) > 0)
  return { total, max, percent: max ? Math.round((total / max) * 100) : 0, complete }
}

export const rankSolutions = (solutions, criteria) =>
  solutions
    .map((solution) => ({ solution, ...scoreSolution(solution, criteria) }))
    .sort((a, b) => b.total - a.total)

/** The student's explicit choice wins; otherwise the top fully-scored solution. */
export const getChosenSolution = (project) => {
  const explicit = project.solutions.find((item) => item.id === project.chosenSolutionId)
  if (explicit) return explicit
  return rankSolutions(project.solutions, project.criteria).find((item) => item.complete)?.solution || null
}

// ============= Progress =============
const filled = (value, min = 1) => typeof value === 'string' && value.trim().length >= min

export const getStepChecks = (project) => {
  const testedCriteria = project.criteria.filter((item) =>
    project.tests.some((test) => test.criterionId === item.id && filled(test.result) && test.passed !== null)
  )
  return {
    problem: [
      { label: 'Mô tả vấn đề (ít nhất 20 kí tự)', done: filled(project.problem.need, 20) },
      { label: 'Xác định người sử dụng', done: filled(project.problem.users) },
      { label: 'Có ít nhất 3 tiêu chí', done: project.criteria.filter((item) => filled(item.name)).length >= 3 },
    ],
    solutions: [
      { label: 'Ghi lại kết quả tìm hiểu', done: filled(project.research.existing, 10) },
      { label: 'Đề xuất ít nhất 2 phương án', done: project.solutions.filter((item) => filled(item.name)).length >= 2 },
      {
        label: 'Chấm điểm đủ mọi phương án',
        done: project.solutions.length >= 2 && project.solutions.every((item) => scoreSolution(item, project.criteria).complete),
      },
    ],
    prototype: [
      { label: 'Thiết kế hình dạng vật thể', done: project.prototype.model.cells.length > 0 },
      { label: 'Ghi vật liệu trong khung tên bản vẽ', done: filled(project.prototype.drawing.material) },
      { label: 'Lập bảng vật liệu', done: project.prototype.materials.some((item) => filled(item.name)) },
      { label: 'Ghi các bước chế tạo', done: filled(project.prototype.steps, 10) },
      { label: 'Hoàn thành kiểm tra an toàn', done: safetyChecklist.every((item) => project.prototype.safety.includes(item.id)) },
    ],
    testing: [
      {
        label: 'Thử nghiệm mọi tiêu chí',
        done: project.criteria.length > 0 && testedCriteria.length === project.criteria.length,
      },
      { label: 'Ghi lại ít nhất một lần cải tiến', done: project.iterations.length > 0 },
    ],
    dossier: [
      { label: 'Viết tóm tắt dự án', done: filled(project.dossier.summary, 20) },
      { label: 'Viết phần tự đánh giá', done: filled(project.dossier.reflection, 20) },
    ],
  }
}

export const getProgress = (project) => {
  const checks = getStepChecks(project)
  const all = Object.values(checks).flat()
  const steps = Object.fromEntries(Object.entries(checks).map(([id, items]) => [id, items.every((item) => item.done)]))
  return { steps, percent: Math.round((all.filter((item) => item.done).length / all.length) * 100), checks }
}

export const summarizeTests = (project) => {
  const decided = project.tests.filter((test) => test.passed !== null)
  return { passed: decided.filter((test) => test.passed).length, failed: decided.filter((test) => !test.passed).length, total: project.tests.length }
}

// ============= Persistence (per user, in this browser) =============
const storageKey = (userKey) => `${STORAGE_PREFIX}:${userKey || 'guest'}`

// Projects saved before the technical drawing existed get the template's model (or a starter block).
const withDrawingDefaults = (project) => {
  if (project.prototype?.model && project.prototype?.drawing) return project
  const template = projectTemplates.find((item) => item.id === project.templateId) || blankTemplate
  return {
    ...project,
    prototype: {
      ...project.prototype,
      model: project.prototype?.model || createModel(template.model || blankTemplate.model),
      drawing: project.prototype?.drawing || { material: template.material || '', scale: 'auto', number: '01' },
    },
  }
}

export const loadProjects = (userKey) => {
  try {
    const projects = JSON.parse(localStorage.getItem(storageKey(userKey)) || '[]')
    return Array.isArray(projects) ? projects.map(withDrawingDefaults) : []
  } catch {
    return []
  }
}

export const saveProjects = (userKey, projects) => {
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify(projects))
    return true
  } catch {
    return false
  }
}

// ============= Sketch helpers =============
/** Converts stored strokes into SVG path data, used for both the dossier and thumbnails. */
export const strokeToPath = (points) =>
  points.length ? `M${points[0][0]} ${points[0][1]}${points.slice(1).map(([x, y]) => `L${x} ${y}`).join('')}` : ''
