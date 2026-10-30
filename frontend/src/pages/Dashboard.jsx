import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Bot, CircuitBoard, Compass, Cuboid, GraduationCap, Search, Wrench } from 'lucide-react'
import { sampleCourses, getSampleLessonsByCourse } from '../data/courseCatalog'
import { useAuthStore } from '../store'
import { buildLocalLearningDashboard } from '../utils/learningProgress'
import { learningAPI } from '../services/api'

const subjects = { 10: 'Thiết kế và công nghệ', 11: 'Công nghệ cơ khí', 12: 'Công nghệ điện — điện tử' }
const circuitLesson = getSampleLessonsByCourse(sampleCourses.find((course) => Number(course.grade_level) === 12)?.id)[0]
const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const teacher = ['teacher', 'admin', 'moderator'].includes(user?.role)
  const [grade, setGrade] = useState(11)
  const [query, setQuery] = useState('')
  const [progress, setProgress] = useState(null)
  const [local, setLocal] = useState(false)
  useEffect(() => {
    let active = true
    const refresh = async () => {
      if (teacher || !user?.id) return
      try {
        const { data } = await learningAPI.getDashboard(user.id)
        if (!data || typeof data !== 'object' || !Number.isFinite(data.completed_lessons)) throw new Error('Backend unavailable')
        if (active) { setProgress(data); setLocal(false) }
      } catch {
        if (active) { setProgress(buildLocalLearningDashboard(user.id)); setLocal(true) }
      }
    }
    refresh()
    window.addEventListener('enginelab:learning-update', refresh)
    return () => { active = false; window.removeEventListener('enginelab:learning-update', refresh) }
  }, [user?.id, teacher])
  const courses = useMemo(() => sampleCourses.filter((course) => Number(course.grade_level) === grade && normalize(course.title).includes(normalize(query.trim()))), [grade, query])
  const lessons = courses.reduce((sum, course) => sum + getSampleLessonsByCourse(course.id).length, 0)
  return <main className="studio-page">
    <div className="studio-heading"><div><p className="studio-eyebrow">KHÔNG GIAN {teacher ? 'GIẢNG DẠY' : 'HỌC TẬP'}</p><h1>Xin chào, {user?.full_name || user?.username || 'bạn'}.</h1><p>{teacher ? 'Chuẩn bị bài dạy, quản lý lớp và đồng hành cùng học sinh.' : 'Mỗi ngày, hiểu thêm một điều. Bắt đầu từ bài học của bạn.'}</p></div><Link to={teacher ? '/classroom' : '/progress'} className="studio-button secondary">{teacher ? 'Quản lý lớp' : 'Xem tiến độ'}<ArrowRight size={16} /></Link></div>
    <section className="studio-ai-banner"><div><span className="studio-tag"><Bot size={15} />TRỢ LÝ AI</span><h2>{teacher ? 'Thêm thời gian cho việc giảng dạy.' : 'Một cách học chủ động hơn.'}</h2><p>{teacher ? 'Từ ý tưởng bài dạy đến đề kiểm tra. Tạo bản nháp, điều chỉnh và sử dụng theo cách của bạn.' : 'Giải thích điều chưa hiểu, phân tích bài làm và luyện tập theo từng bài học.'}</p><Link to="/ai-workspace" className="studio-button light">Mở không gian AI<ArrowRight size={16} /></Link></div><div className="studio-ai-note"><span>ĐƯỢC THIẾT KẾ CHO BẠN</span>{(teacher ? ['Kế hoạch bài dạy', 'Đề kiểm tra & đáp án', 'Tiêu chí đánh giá'] : ['Hiểu bản chất kiến thức', 'Học từ những lỗi sai', 'Luyện tập từng bước']).map((item, index) => <p key={item}><small>0{index + 1}</small>{item}</p>)}</div></section>
    <div className="studio-workspace-grid"><section className="studio-catalog">
      <div className="studio-section-heading"><div><p className="studio-eyebrow">THƯ VIỆN HỌC TẬP</p><h2>Chương trình Công nghệ</h2></div><span>{courses.length} chương · {lessons} bài học</span></div>
      <div className="studio-catalog-toolbar"><div className="studio-tabs" role="group" aria-label="Chọn khối lớp">{[10, 11, 12].map((value) => <button key={value} type="button" aria-pressed={grade === value} onClick={() => setGrade(value)}>Khối {value}</button>)}</div><label className="studio-search"><Search size={17} /><input aria-label="Tìm chương học" placeholder="Tìm chương học…" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      <p className="studio-subject">{subjects[grade]}</p><div className="studio-course-list">{courses.map((course, index) => <Link to={`/courses/${course.id}`} key={course.id} className="studio-course"><span className="studio-course-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{course.title}</h3><p>{getSampleLessonsByCourse(course.id).length} bài học <span>·</span> Khối {grade}</p></div><ArrowRight size={18} /></Link>)}{!courses.length && <div className="studio-empty">Không tìm thấy chương phù hợp. Hãy thử từ khóa khác.</div>}</div>
    </section><aside className="studio-sidebar"><section className="studio-side-card"><span className="studio-side-icon"><GraduationCap size={21} /></span><h2>{teacher ? 'Lớp học của bạn' : 'Học cùng lớp'}</h2><p>{teacher ? 'Giao nhiệm vụ, xem bài nộp và gửi phản hồi cho học sinh.' : 'Xem thông báo, nhận nhiệm vụ và nộp bài cho giáo viên.'}</p><Link to="/classroom">Mở lớp học<ArrowRight size={16} /></Link></section><section className="studio-side-card"><h2>{teacher ? 'Chuẩn bị đánh giá' : 'Tiến độ học tập'}</h2>{teacher ? <><p>Chọn đề theo chương hoặc dùng AI tạo bản nháp theo mục tiêu bài học.</p><Link to="/practice-bank">Khám phá kho đề<ArrowRight size={16} /></Link></> : <><div className="studio-progress-number">{progress ? progress.completed_lessons : '—'}<span> bài đã hoàn thành</span></div><p>{progress ? `${progress.in_progress_lessons} bài đang học` : 'Đang tải tiến độ…'}{local && ' · Dữ liệu trên thiết bị'}</p><Link to="/progress">Xem chi tiết<ArrowRight size={16} /></Link></>}</section></aside></div>
    <section className="studio-labs"><div className="studio-section-heading"><div><p className="studio-eyebrow">HỌC QUA TRẢI NGHIỆM</p><h2>Thực hành & khám phá</h2></div></div><div className="studio-lab-grid">{[
      ['/mechanical-workshop', Wrench, 'Xưởng cơ khí', 'Khám phá cấu tạo và hoạt động cơ khí.'],
      [circuitLesson ? `/lessons/${circuitLesson.id}/circuit-lab` : '/practice-bank', CircuitBoard, 'Thí nghiệm mạch điện', 'Thực hành kiến thức điện và điện tử.'],
      ['/projection-practice', Cuboid, 'Hình chiếu kỹ thuật', 'Rèn tư duy không gian và đọc bản vẽ.'],
      ['/game-demo', BookOpen, 'Ôn tập nhanh', 'Củng cố kiến thức qua câu hỏi tương tác.'],
      ['/engineering-design', Compass, 'Xưởng thiết kế kĩ thuật', 'Làm dự án thiết kế theo quy trình 5 bước.'],
    ].map(([to, Icon, title, description]) => <Link to={to} className="studio-lab" key={to}><Icon size={23} /><h3>{title}</h3><p>{description}</p><ArrowRight size={16} /></Link>)}</div></section>
    <footer className="studio-footer"><span>EngineLab AI</span><span>Công nghệ THPT · Học tập và giảng dạy</span></footer>
  </main>
}
