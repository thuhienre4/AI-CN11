import { grade10Questions, grade10TrueFalse } from './thptBank10'
import { grade11Questions, grade11TrueFalse } from './thptBank11'
import { grade12Questions, grade12TrueFalse } from './thptBank12'

export const LEVELS = { B: 'Biết', H: 'Hiểu', V: 'Vận dụng' }
export const COMPETENCIES = {
  NT: 'Nhận thức công nghệ',
  GT: 'Giao tiếp công nghệ',
  SD: 'Sử dụng công nghệ',
  DG: 'Đánh giá công nghệ',
  TK: 'Thiết kế kĩ thuật',
}

const DIFFICULTY = { B: 'easy', H: 'medium', V: 'hard' }
const OPTION_ID_BASE = 30000000

const banks = { 10: grade10Questions, 11: grade11Questions, 12: grade12Questions }
const clusters = { 10: grade10TrueFalse, 11: grade11TrueFalse, 12: grade12TrueFalse }

// The format of the graduation exam from 2025 (Quyết định 764/QĐ-BGDĐT): 50 minutes, 24 single-choice
// questions at 0.25 points each and 4 true/false questions with four statements each.
export const THPT_EXAM = {
  minutes: 50,
  multipleChoice: 24,
  trueFalse: 4,
  multipleChoicePoints: 0.25,
  trueFalsePoints: [0, 0.1, 0.25, 0.5, 1],
}

// EngineLab's own blueprint. The ministry has not published a matrix for this subject.
export const EXAM_BLUEPRINT = {
  multipleChoice: { 10: 5, 11: 7, 12: 12 },
  trueFalse: { 10: 0, 11: 1, 12: 3 },
  levelShare: { B: 0.4, H: 0.3, V: 0.3 },
}

const hashText = (text) => [...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7)

const lessonNumber = (title = '') => Number(/^Bài\s+(\d+)/.exec(title)?.[1])

const toQuestion = ([level, competency, text, correct, distractors, explanation], grade, lesson, index) => ({
  key: `${grade}-${lesson}-${index + 1}`,
  grade,
  lesson,
  level,
  competency,
  text,
  correct,
  distractors,
  explanation,
})

export const allThptQuestions = () =>
  Object.entries(banks).flatMap(([grade, lessons]) =>
    Object.entries(lessons).flatMap(([lesson, questions]) =>
      questions.map((question, index) => toQuestion(question, Number(grade), Number(lesson), index))))

export const allThptClusters = () =>
  Object.entries(clusters).flatMap(([grade, chapters]) =>
    Object.entries(chapters).map(([chapter, cluster]) => ({
      ...cluster,
      key: `${grade}-c${chapter}`,
      grade: Number(grade),
      chapter: Number(chapter),
    })))

// Places the correct answer by a hash of the stem, so position gives nothing away.
export const arrangeOptions = ({ text, correct, distractors }) => {
  const position = hashText(text) % (distractors.length + 1)
  const options = [...distractors]
  options.splice(position, 0, correct)
  return options
}

// Keeps ids of the lesson questions so that past results still point to the same question.
export const withThptBank = (question, lesson, gradeLevel, index) => {
  const source = banks[gradeLevel]?.[lessonNumber(lesson?.title)]?.[index]
  if (!source) return question
  const item = toQuestion(source, gradeLevel, lessonNumber(lesson.title), index)
  return {
    ...question,
    text: item.text,
    difficulty: DIFFICULTY[item.level],
    level: item.level,
    competency: item.competency,
    explanation: item.explanation,
    options: arrangeOptions(item).map((text, order) => ({
      id: OPTION_ID_BASE + question.id * 4 + order,
      text,
      is_correct: text === item.correct,
      order: order + 1,
    })),
  }
}

const seededRandom = (seed) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

const shuffled = (items, random) => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1))
    ;[copy[index], copy[other]] = [copy[other], copy[index]]
  }
  return copy
}

const pickByLevel = (pool, count, random) => {
  const { B, H } = EXAM_BLUEPRINT.levelShare
  const wanted = { B: Math.round(count * B), H: Math.round(count * H) }
  wanted.V = count - wanted.B - wanted.H
  const chosen = Object.entries(wanted).flatMap(([level, size]) =>
    shuffled(pool.filter((item) => item.level === level), random).slice(0, size))
  const spare = shuffled(pool.filter((item) => !chosen.includes(item)), random)
  return [...chosen, ...spare].slice(0, count)
}

export const buildThptExam = (seed = Date.now()) => {
  const random = seededRandom(seed)
  const questions = allThptQuestions()
  const multipleChoice = shuffled(Object.entries(EXAM_BLUEPRINT.multipleChoice).flatMap(([grade, count]) =>
    pickByLevel(questions.filter((item) => item.grade === Number(grade)), count, random)), random)
    .map((item) => ({ ...item, options: shuffled([item.correct, ...item.distractors], random) }))
  const trueFalse = Object.entries(EXAM_BLUEPRINT.trueFalse).flatMap(([grade, count]) =>
    shuffled(allThptClusters().filter((item) => item.grade === Number(grade)), random).slice(0, count))
  return { seed, multipleChoice, trueFalse }
}

export const scoreThptExam = (exam, answers) => {
  const multipleChoiceRight = exam.multipleChoice.filter((item) => answers.choice?.[item.key] === item.correct).length
  const clusterRight = exam.trueFalse.map((cluster) =>
    cluster.items.filter(([, truth], index) => answers.truth?.[cluster.key]?.[index] === truth).length)
  const trueFalseScore = clusterRight.reduce((sum, right) => sum + THPT_EXAM.trueFalsePoints[right], 0)
  const score = multipleChoiceRight * THPT_EXAM.multipleChoicePoints + trueFalseScore
  return { multipleChoiceRight, clusterRight, score: Math.round(score * 100) / 100 }
}
