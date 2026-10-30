import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight, BookOpen, Bot, Check, Compass, Lightbulb, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '../store'
import { sampleLessons } from '../data/courseCatalog'
import { blankTemplate, designSteps, projectTemplates } from '../data/engineeringDesign'
import { createProject, getProgress, loadProjects, saveProjects } from '../utils/engineeringDesign'
import { DossierStep, PrototypeStep, ProblemStep, SketchView, SolutionsStep, TestingStep } from '../components/EngineeringDesignSteps'
import '../styles/engineeringDesign.css'

const theoryLesson = sampleLessons.find((lesson) => lesson.title.startsWith('Bài 18. Quy trình thiết kế'))
const stepComponents = { problem: ProblemStep, solutions: SolutionsStep, prototype: PrototypeStep, testing: TestingStep, dossier: DossierStep }
const formatDate = (iso) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

function ProjectLibrary({ projects, onOpen, onCreate, onDelete }) {
  return (
    <>
      <section className="ed-section">
        <div className="studio-section-heading"><div><p className="studio-eyebrow">DỰ ÁN CỦA BẠN</p><h2>Tiếp tục thiết kế</h2></div><span>{projects.length} dự án</span></div>
        {projects.length ? (
          <div className="ed-project-grid">
            {projects.map((project) => {
              const { percent } = getProgress(project)
              const step = designSteps.find((item) => item.id === project.currentStep) || designSteps[0]
              return (
                <article key={project.id} className="ed-project-card">
                  <button type="button" className="ed-project-open" onClick={() => onOpen(project.id)}>
                    <div className="ed-project-thumb">{project.prototype.sketch.length ? <SketchView strokes={project.prototype.sketch} /> : <Compass size={28} aria-hidden="true" />}</div>
                    <h3>{project.title}</h3>
                    <p>Bước {step.number}: {step.short} · Cập nhật {formatDate(project.updatedAt)}</p>
                    <div className="ed-meter" aria-label={`Hoàn thành ${percent}%`}><i style={{ width: `${percent}%` }} /></div>
                    <small>{percent}% hoàn thành</small>
                  </button>
                  <button type="button" className="ed-icon-button ed-project-delete" onClick={() => onDelete(project)} aria-label={`Xóa dự án ${project.title}`}><Trash2 size={16} /></button>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="ed-empty-state"><Compass size={26} aria-hidden="true" /><p>Bạn chưa có dự án nào. Chọn một dự án mẫu bên dưới hoặc tự tạo dự án từ vấn đề của riêng bạn.</p></div>
        )}
      </section>

      <section className="ed-section">
        <div className="studio-section-heading"><div><p className="studio-eyebrow">BẮT ĐẦU DỰ ÁN MỚI</p><h2>Chọn một thử thách thiết kế</h2></div></div>
        <div className="ed-template-grid">
          {[...projectTemplates, blankTemplate].map((template) => (
            <article key={template.id} className={`ed-template ${template.id === blankTemplate.id ? 'is-blank' : ''}`}>
              <div className="ed-template-meta"><span>{template.grade}</span><span>{template.difficulty}</span></div>
              <h3>{template.title}</h3>
              <p>{template.summary}</p>
              {template.criteria.length > 0 && <small>{template.criteria.length} tiêu chí gợi ý · {template.solutions.length} ý tưởng phương án</small>}
              <button type="button" className="studio-button secondary" onClick={() => onCreate(template)}>{template.id === blankTemplate.id ? <><Plus size={16} /> Tạo dự án trống</> : <>Bắt đầu <ArrowRight size={16} /></>}</button>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

function ProjectWorkspace({ project, patch, onBack, saveState, owner }) {
  const stepIndex = Math.max(designSteps.findIndex((item) => item.id === project.currentStep), 0)
  const step = designSteps[stepIndex]
  const progress = getProgress(project)
  const StepComponent = stepComponents[step.id]
  const headingRef = useRef(null)
  const goToStep = (id) => {
    patch((draft) => { draft.currentStep = id }, { silent: true })
    headingRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="ed-workspace">
      <div className="ed-topbar ed-noprint">
        <button type="button" className="ed-link-button" onClick={onBack}><ArrowLeft size={16} /> Tất cả dự án</button>
        <input className="ed-title-input" aria-label="Tên dự án" value={project.title} onChange={(event) => patch((draft) => { draft.title = event.target.value })} />
        <span className={`ed-save-state ${saveState === 'error' ? 'is-error' : ''}`} role="status">{saveState === 'saving' ? 'Đang lưu…' : saveState === 'error' ? 'Không lưu được' : 'Đã lưu trên thiết bị'}</span>
      </div>

      <div className="ed-layout">
        <aside className="ed-stepper ed-noprint" aria-label="Các bước thiết kế">
          <div className="ed-progress"><span>Tiến độ dự án</span><strong>{progress.percent}%</strong><div className="ed-meter"><i style={{ width: `${progress.percent}%` }} /></div></div>
          <ol>
            {designSteps.map((item) => (
              <li key={item.id}>
                <button type="button" aria-current={item.id === step.id ? 'step' : undefined} className={progress.steps[item.id] ? 'is-done' : ''} onClick={() => goToStep(item.id)}>
                  <span className="ed-step-number">{progress.steps[item.id] ? <Check size={14} /> : item.number}</span>
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <p className="ed-muted ed-loop-note">Quy trình có tính lặp — bạn có thể quay lại bất kì bước nào để cải tiến.</p>
        </aside>

        <section className="ed-main">
          <header className="ed-step-header ed-noprint">
            <p className="studio-eyebrow">BƯỚC {step.number} / {designSteps.length}</p>
            <h2 ref={headingRef} tabIndex={-1}>{step.title}</h2>
            <p>{step.goal}</p>
          </header>
          <StepComponent project={project} patch={patch} goToStep={goToStep} owner={owner} />
          <nav className="ed-step-nav ed-noprint" aria-label="Chuyển bước">
            {stepIndex > 0 ? <button type="button" className="studio-button secondary" onClick={() => goToStep(designSteps[stepIndex - 1].id)}><ArrowLeft size={16} /> {designSteps[stepIndex - 1].short}</button> : <span />}
            {stepIndex < designSteps.length - 1 && <button type="button" className="studio-button" onClick={() => goToStep(designSteps[stepIndex + 1].id)}>Tiếp: {designSteps[stepIndex + 1].short} <ArrowRight size={16} /></button>}
          </nav>
        </section>

        <aside className="ed-guide ed-noprint" aria-label="Hướng dẫn">
          <section className="ed-guide-card">
            <h3>Cần hoàn thành</h3>
            <ul className="ed-requirements">
              {progress.checks[step.id].map((item) => <li key={item.label} className={item.done ? 'is-done' : ''}><Check size={14} aria-hidden="true" />{item.label}<span className="sr-only">{item.done ? ' - đã xong' : ' - chưa xong'}</span></li>)}
            </ul>
          </section>
          <section className="ed-guide-card">
            <h3><Lightbulb size={16} aria-hidden="true" /> Gợi ý</h3>
            <ul className="ed-hints">{step.hints.map((hint) => <li key={hint}>{hint}</li>)}</ul>
          </section>
          <section className="ed-guide-card">
            <h3>Cần thêm trợ giúp?</h3>
            {theoryLesson && <Link to={`/lessons/${theoryLesson.id}`}><BookOpen size={15} /> Ôn Bài 18: Quy trình thiết kế</Link>}
            <Link to="/ai-workspace"><Bot size={15} /> Hỏi trợ lý AI</Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default function EngineeringDesignStudio() {
  const user = useAuthStore((state) => state.user)
  const userKey = user?.id || user?.username
  const [projects, setProjects] = useState(() => loadProjects(userKey))
  const [searchParams, setSearchParams] = useSearchParams()
  const [saveState, setSaveState] = useState('saved')
  const firstRender = useRef(true)
  const activeId = searchParams.get('project')
  const activeProject = useMemo(() => projects.find((item) => item.id === activeId), [projects, activeId])

  useEffect(() => { setProjects(loadProjects(userKey)) }, [userKey])

  // Debounced autosave so typing doesn't rewrite storage on every keystroke.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return undefined }
    setSaveState('saving')
    const timer = setTimeout(() => setSaveState(saveProjects(userKey, projects) ? 'saved' : 'error'), 400)
    return () => clearTimeout(timer)
  }, [projects, userKey])

  const openProject = (id) => { setSearchParams(id ? { project: id } : {}); window.scrollTo({ top: 0 }) }
  const createFromTemplate = (template) => {
    const project = createProject(template)
    setProjects((current) => [project, ...current])
    openProject(project.id)
  }
  const deleteProject = (project) => {
    if (!window.confirm(`Xóa dự án “${project.title}”? Thao tác này không thể hoàn tác.`)) return
    setProjects((current) => current.filter((item) => item.id !== project.id))
    toast.success('Đã xóa dự án')
  }
  const patch = (mutate, { silent = false } = {}) => {
    setProjects((current) => current.map((item) => {
      if (item.id !== activeId) return item
      const draft = structuredClone(item)
      mutate(draft)
      if (!silent) draft.updatedAt = new Date().toISOString()
      return draft
    }))
  }

  return (
    <main className="studio-page ed-page">
      {activeProject ? (
        <ProjectWorkspace project={activeProject} patch={patch} onBack={() => openProject(null)} saveState={saveState} owner={user?.full_name || user?.username} />
      ) : (
        <>
          <div className="studio-heading">
            <div>
              <p className="studio-eyebrow">KHÔNG GIAN THIẾT KẾ KĨ THUẬT</p>
              <h1>Biến ý tưởng thành sản phẩm.</h1>
              <p>Thực hành quy trình thiết kế kĩ thuật 5 bước trong Công nghệ 10: từ xác định vấn đề, chọn giải pháp, làm nguyên mẫu, thử nghiệm đến lập hồ sơ kĩ thuật.</p>
            </div>
            {theoryLesson && <Link to={`/lessons/${theoryLesson.id}`} className="studio-button secondary"><BookOpen size={16} /> Ôn lý thuyết</Link>}
          </div>
          <ol className="ed-process" aria-label="Quy trình thiết kế kĩ thuật">
            {designSteps.map((step) => <li key={step.id}><span>{step.number}</span><strong>{step.short}</strong><small>{step.title}</small></li>)}
          </ol>
          {activeId && <div className="ed-callout is-warning">Không tìm thấy dự án này trên thiết bị. Dự án được lưu riêng trên từng trình duyệt.</div>}
          <ProjectLibrary projects={projects} onOpen={openProject} onCreate={createFromTemplate} onDelete={deleteProject} />
        </>
      )}
    </main>
  )
}
