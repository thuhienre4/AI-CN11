// End-to-end journeys through the real interface and the real API.
import { expect, test } from '@playwright/test'
import { API, E2E_ADMIN } from '../playwright.config.js'

const run = Date.now().toString(36)
const PASSWORD = 'MatKhau#2026'

async function register(page, { role, username, fullName, studentClass = '' }) {
  await page.goto('/register')
  if (role === 'teacher') await page.getByRole('radio', { name: /Giáo viên/ }).click()
  await page.locator('input[name="full_name"]').fill(fullName)
  if (studentClass) await page.locator('input[name="student_class"]').fill(studentClass)
  await page.locator('input[name="username"]').fill(username)
  await page.locator('input[name="email"]').fill(`${username}@example.com`)
  await page.locator('input[name="password"]').fill(PASSWORD)
  await page.locator('button[type="submit"]').click()
  try {
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  } catch (error) {
    const messages = await page.locator('[role="status"]').allInnerTexts()
    throw new Error(`Registration did not finish: ${messages.join(' | ')}`, { cause: error })
  }
}

async function login(page, username, role = 'student') {
  if (!page.url().includes('/login')) await page.goto('/login')
  if (role === 'teacher') await page.getByRole('button', { name: 'Giáo viên' }).click()
  await page.fill('#username', username)
  await page.fill('#password', PASSWORD)
  await page.click('button[type="submit"]')
  await expect(page).not.toHaveURL(/\/login/)
  const token = await page.evaluate(() => localStorage.getItem('token'))
  expect(token, 'a real server token, not the offline fallback').not.toMatch(/^local-token-/)
  return token
}

test('a guest is sent to the login page', async ({ page }) => {
  await page.goto('/classroom')
  await expect(page).toHaveURL(/\/login/)
})

test('a student registers, studies Bài 18 and the server scores the quiz', async ({ page, request }) => {
  const username = `hs${run}`
  await register(page, { role: 'student', username, fullName: 'Học sinh E2E', studentClass: '11A1' })
  const token = await login(page, username)

  await page.goto('/lessons/110602')
  await expect(page.getByRole('heading', { name: /Bài 18/ }).first()).toBeVisible()

  await page.goto('/lessons/110602/quiz')
  const options = page.locator('main button, .nova-quiz-card button').filter({ hasText: /^[A-D]/ })
  for (let question = 0; question < 10; question += 1) {
    if (await page.getByText('Hoàn thành kiểm tra nhanh').isVisible()) break
    await options.first().click()
    await page.waitForTimeout(300)
  }
  await expect(page.getByText('Hoàn thành kiểm tra nhanh')).toBeVisible()

  const me = await (await request.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).json()
  const attempts = await (await request.get(`${API}/api/quiz/attempts/user/${me.id}`, { headers: { Authorization: `Bearer ${token}` } })).json()
  const attempt = attempts.find((item) => item.lesson_id === 110602)
  expect(attempt, 'the attempt was recorded by the server').toBeTruthy()
  expect(attempt.total_questions).toBe(2)
  expect(attempt.results).toHaveLength(2)
})

test('a teacher awaiting verification sees no teacher tools, and the API refuses them too', async ({ page, request }) => {
  const username = `gv${run}`
  await register(page, { role: 'teacher', username, fullName: 'Giáo viên E2E' })
  const token = await login(page, username, 'teacher')

  await expect(page.getByText(/đang chờ quản trị viên xác minh/)).toBeVisible()
  await expect(page.getByText('Chờ xác minh').first()).toBeVisible()
  await expect(page.getByRole('link', { name: /Xác minh/ })).toHaveCount(0)

  await page.goto('/classroom')
  await expect(page.getByRole('heading', { name: 'Đăng thông báo lớp' })).toHaveCount(0)

  const refused = await request.post(`${API}/api/classroom/posts`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { title: 'Thử', content: 'Thử', post_type: 'announcement' },
  })
  expect(refused.status()).toBe(403)
})

test('the chapter test follows its blueprint and scores the objective part', async ({ page }) => {
  const username = `hs2${run}`
  await register(page, { role: 'student', username, fullName: 'Học sinh hai', studentClass: '12A1' })
  await login(page, username)
  await page.goto('/chapter-exam')
  await page.getByRole('button', { name: 'Lớp 12' }).click()
  await expect(page.locator('table').first().locator('tbody tr')).toHaveCount(10) // 9 chapters + total
  await expect(page.locator('fieldset')).toHaveCount(16) // 12 multiple choice + 4 true/false
  await page.getByRole('button', { name: 'Nộp bài' }).click()
  await expect(page.getByText('Trắc nghiệm: 0 / 7 điểm')).toBeVisible()
  await expect(page.getByText('Hướng dẫn chấm')).toHaveCount(2)
})

test('a teacher runs a live quiz room and a student plays it on another device', async ({ page, browser, request }) => {
  // The administrator approves the new teacher, as happens in a school
  const teacherName = `gvq${run}`
  await register(page, { role: 'teacher', username: teacherName, fullName: 'Cô Hiền' })
  const admin = await (await request.post(`${API}/api/auth/login`, { data: E2E_ADMIN })).json()
  const adminHeaders = { Authorization: `Bearer ${admin.access_token}` }
  const pending = await (await request.get(`${API}/api/accounts/pending`, { headers: adminHeaders })).json()
  const teacherAccount = pending.find((account) => account.username === teacherName)
  expect((await request.post(`${API}/api/accounts/${teacherAccount.id}/review`, { headers: adminHeaders, data: { decision: 'approve', classes: '11A1' } })).ok()).toBe(true)
  await login(page, teacherName, 'teacher')

  // Design a one-question game and open the room
  await page.goto('/game-rooms')
  await page.getByPlaceholder(/Ai nhanh hơn/).fill('Thi nhanh Bài 18')
  await page.getByRole('button', { name: '+ Câu tự soạn' }).click()
  await page.getByLabel('Nội dung câu 1').fill('Kì nào hai xu páp đều đóng?')
  const options = page.getByPlaceholder(/Phương án/)
  await options.nth(0).fill('Kì nạp')
  await options.nth(1).fill('Kì nén')
  await page.getByLabel('Phương án B là đáp án đúng').check()

  // The design is kept with the account: another browser sees it after signing in
  await page.getByRole('button', { name: 'Lưu thiết kế' }).click()
  await expect(page.getByText('Đã lưu vào tài khoản')).toBeVisible()
  const otherDevice = await browser.newContext()
  const otherPage = await otherDevice.newPage()
  await login(otherPage, teacherName, 'teacher')
  await otherPage.goto('/game-rooms')
  await expect(otherPage.getByText('Thi nhanh Bài 18', { exact: true })).toBeVisible()
  await otherDevice.close()

  await page.getByRole('button', { name: 'Mở phòng trực tuyến' }).click()
  const code = (await page.locator('p.font-mono').innerText()).trim()
  expect(code).toMatch(/^\d{6}$/)

  // A student joins from a separate browser
  const studentContext = await browser.newContext()
  const student = await studentContext.newPage()
  const studentName = `hsq${run}`
  await register(student, { role: 'student', username: studentName, fullName: 'Bạn An', studentClass: '11A1' })
  await login(student, studentName)
  await student.goto(`/game-rooms/join?code=${code}`)
  await student.getByRole('button', { name: 'Vào phòng' }).click()
  await expect(student.getByText('Bạn đã vào phòng!')).toBeVisible()
  await expect(page.getByText('Bạn An')).toBeVisible()

  // Play: the student answers, the room reveals once everyone has answered
  await page.getByRole('button', { name: /Bắt đầu/ }).click()
  await student.getByRole('button', { name: /Kì nén/ }).click()
  await expect(student.getByText(/Chính xác! \+\d+/)).toBeVisible()
  await page.getByRole('button', { name: 'Xem kết quả chung cuộc' }).click()
  await expect(student.getByText('Kết thúc!')).toBeVisible()
  await expect(page.getByText('Kết quả chung cuộc')).toBeVisible()
  await studentContext.close()
})

test('a student earns points by finishing a quick test, and the teacher sees and exports the class report', async ({ page, browser, request }) => {
  const admin = await (await request.post(`${API}/api/auth/login`, { data: E2E_ADMIN })).json()
  const adminHeaders = { Authorization: `Bearer ${admin.access_token}` }
  const approve = async (username, data) => {
    const pending = await (await request.get(`${API}/api/accounts/pending`, { headers: adminHeaders })).json()
    const account = pending.find((item) => item.username === username)
    expect(account, `${username} is waiting for review`).toBeTruthy()
    expect((await request.post(`${API}/api/accounts/${account.id}/review`, { headers: adminHeaders, data })).ok()).toBe(true)
  }

  // A class of its own, so accounts of the other journeys do not appear in it
  const className = `12T${run.slice(-3)}`.toUpperCase()
  const studentName = `hsj${run}`
  await register(page, { role: 'student', username: studentName, fullName: 'Trần Minh Khôi', studentClass: className })
  await approve(studentName, { decision: 'approve' })
  const token = await login(page, studentName)

  // Before any work: level 1, nothing done today
  await page.goto('/progress')
  await expect(page.getByRole('heading', { name: 'Cấp độ, nhiệm vụ và huy hiệu' })).toBeVisible()
  await expect(page.getByText(/Cấp 1 · 0 điểm kinh nghiệm/)).toBeVisible()

  // Study: open the model, take the quick test
  await page.goto('/lessons/110602/3d')
  await expect(page.locator('canvas').first()).toBeVisible()
  await page.goto('/lessons/110602/quiz')
  const options = page.locator('main button, .nova-quiz-card button').filter({ hasText: /^[A-D]/ })
  for (let question = 0; question < 10; question += 1) {
    if (await page.getByText('Hoàn thành kiểm tra nhanh').isVisible()) break
    await options.first().click()
    await page.waitForTimeout(300)
  }
  await expect(page.getByText('Hoàn thành kiểm tra nhanh')).toBeVisible()

  // The server computed the journey from that work
  const me = await (await request.get(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).json()
  await expect.poll(async () => {
    const journey = await (await request.get(`${API}/api/learning/users/${me.id}/journey`, { headers: { Authorization: `Bearer ${token}` } })).json()
    return journey.daily_tasks.filter((task) => task.done).map((task) => task.id).sort().join(',')
  }, { timeout: 15_000 }).toContain('quiz')
  const journey = await (await request.get(`${API}/api/learning/users/${me.id}/journey`, { headers: { Authorization: `Bearer ${token}` } })).json()
  expect(journey.xp).toBeGreaterThan(0)
  expect(journey.breakdown.active_days).toBe(5)

  await page.goto('/progress')
  await expect(page.getByText(new RegExp(`Cấp ${journey.level} · ${journey.xp} điểm kinh nghiệm`))).toBeVisible()
  await expect(page.getByText('Trần Minh Khôi (em)')).toBeVisible()
  await expect(page.getByText(new RegExp(`Lớp ${className} · 1 học sinh`))).toBeVisible()
  await page.goto('/')
  await expect(page.getByText(/Nhiệm vụ hôm nay · [1-3]\/3/)).toBeVisible()

  // The teacher of that class reads the report and downloads it
  const teacherContext = await browser.newContext()
  const teacherPage = await teacherContext.newPage()
  const teacherName = `gvj${run}`
  await register(teacherPage, { role: 'teacher', username: teacherName, fullName: 'Thầy Bảo' })
  await approve(teacherName, { decision: 'approve', classes: className })
  const teacherToken = await login(teacherPage, teacherName, 'teacher')
  await teacherPage.goto('/classroom')
  const report = teacherPage.locator('section', { has: teacherPage.getByRole('heading', { name: 'Báo cáo kết quả của lớp' }) })
  await expect(report.getByRole('cell', { name: 'Trần Minh Khôi' })).toBeVisible()
  await expect(report.getByText(/Bài 18/).first()).toBeVisible()
  await expect(report.getByText('Chưa đủ dữ liệu: cần ít nhất 3 học sinh trả lời cùng một câu.')).toBeVisible()
  const [download] = await Promise.all([
    teacherPage.waitForEvent('download'),
    report.getByRole('button', { name: 'Tải báo cáo (CSV)' }).click(),
  ])
  expect(download.suggestedFilename()).toMatch(/^bao-cao-lop.*\.csv$/)
  const csv = await (await request.get(`${API}/api/learning/teacher/report.csv`, { headers: { Authorization: `Bearer ${teacherToken}` } })).text()
  expect(csv).toContain('Trần Minh Khôi')
  expect(csv).toContain(className)

  // A student cannot read the report or another student's journey
  expect((await request.get(`${API}/api/learning/teacher/report`, { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(403)
  expect((await request.get(`${API}/api/learning/users/1/journey`, { headers: { Authorization: `Bearer ${token}` } })).status()).toBe(403)
  await teacherContext.close()
})
