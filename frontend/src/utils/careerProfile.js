// The student's career profile: for each job tried, how well they handled it and whether they liked it.
// Kept on this device only; it is a reflection aid, not a validated aptitude test.
import { allCareerJobs, maxJobPoints } from '../data/careerGames'

const key = (userId) => `engine_lab_career_profile_${userId}`

export const readCareerProfile = (userId) => {
  try {
    const value = JSON.parse(localStorage.getItem(key(userId)) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

/** Keeps the latest try of a job; a better score is kept as `best`. */
export const saveCareerResult = (userId, jobId, { points, interest }) => {
  const profile = readCareerProfile(userId)
  const previous = profile[jobId]
  profile[jobId] = {
    points,
    best: Math.max(points, previous?.best ?? 0),
    interest,
    tries: (previous?.tries || 0) + 1,
    at: new Date().toISOString(),
  }
  try {
    localStorage.setItem(key(userId), JSON.stringify(profile))
  } catch {
    // storage full or blocked: the result still shows on screen
  }
  return profile
}

/** How a tried job reads: did well (most of the best choices) and liked it, or not. */
export const careerAdvice = (entry, result) => {
  const share = result.best / maxJobPoints(entry)
  const good = share >= 0.75
  if (result.interest === 2 && good) return { tone: 'match', text: 'Em xử lí tốt và rất muốn thử: hãy tìm hiểu kĩ ngành học và hỏi người đang làm nghề này.' }
  if (result.interest === 2) return { tone: 'grow', text: 'Em thích nghề này: xem lại các tình huống chưa tốt, đó là kĩ năng cần rèn thêm.' }
  if (good && result.interest === 0) return { tone: 'able', text: 'Em làm tốt dù chưa thấy hợp: có thể thử các nghề gần với nghề này.' }
  if (result.interest === 1) return { tone: 'explore', text: 'Em còn phân vân: tìm hiểu thêm một ngày làm việc thật của nghề này.' }
  return { tone: 'other', text: 'Có thể nghề khác sẽ hợp với em hơn; hãy thử tiếp.' }
}

/** Jobs tried, best fits first: liked most, then handled best. */
export const careerSummary = (profile) =>
  allCareerJobs()
    .filter((entry) => profile[entry.id])
    .map((entry) => ({ entry, result: profile[entry.id], advice: careerAdvice(entry, profile[entry.id]) }))
    .sort((a, b) => b.result.interest - a.result.interest || b.result.best - a.result.best)
