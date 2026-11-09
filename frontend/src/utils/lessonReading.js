// What the lesson page shows, without saying the same thing twice. Catalog lessons are assembled from a
// description and key points, and their "content", "summary" and "Kiến thức trọng tâm" repeat those pieces.

// Boilerplate sections that read the same in every lesson
const GENERIC_SECTIONS = new Set(['Hoạt động LMS', 'Tóm tắt nội dung SGK', 'Kiến thức trọng tâm'])

const normalise = (text = '') => String(text).replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.;:]+$/, '')

export const lessonReading = (lesson) => {
  const description = lesson?.description || ''
  const points = (lesson?.key_points || []).filter(Boolean)
  let paragraph = String(lesson?.content || '').trim()

  // The heading already shows the description, and the key points get a list of their own
  const without = (text, piece) => {
    const at = normalise(text).indexOf(normalise(piece))
    if (!piece || at < 0) return text
    const index = text.toLowerCase().indexOf(String(piece).trim().toLowerCase())
    return index < 0 ? text : `${text.slice(0, index)} ${text.slice(index + String(piece).trim().length)}`
  }
  paragraph = [description, ...points].reduce(without, paragraph).replace(/\s+/g, ' ').trim()
  if (/^[.;,\s]*$/.test(paragraph)) paragraph = ''

  const shown = [description, lesson?.content, ...points].map(normalise).filter(Boolean)
  const alreadyShown = (item) => shown.some((text) => text === normalise(item) || text.includes(normalise(item)))
  const sections = (lesson?.content_sections || [])
    .filter((section) => !GENERIC_SECTIONS.has(section.title))
    .map((section) => ({ ...section, items: (section.items || []).filter((item) => item && !alreadyShown(item)) }))
    .filter((section) => section.items.length)

  return { paragraph, points, sections }
}
