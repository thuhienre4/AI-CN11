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
