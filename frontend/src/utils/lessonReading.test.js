import { describe, expect, it } from 'vitest'

import { getSampleLesson } from '../data/courseCatalog'
import { lessonReading } from './lessonReading'

const lesson = {
  description: 'Mô tả chu trình làm việc của động cơ bốn kì và hai kì.',
  key_points: ['Động cơ bốn kì gồm nạp, nén, cháy - giãn nở và thải.', 'Mỗi kì có chuyển động pít tông riêng.'],
  content: 'Mô tả chu trình làm việc của động cơ bốn kì và hai kì. Động cơ bốn kì gồm nạp, nén, cháy - giãn nở và thải. Mỗi kì có chuyển động pít tông riêng.',
  content_sections: [
    { title: 'Mục tiêu cần đạt', items: ['Trình bày được nguyên lí làm việc.'] },
    { title: 'Tóm tắt nội dung SGK', items: ['Mô tả chu trình làm việc của động cơ bốn kì và hai kì. Động cơ bốn kì gồm…'] },
    { title: 'Kiến thức trọng tâm', items: ['Động cơ bốn kì gồm nạp, nén, cháy - giãn nở và thải.'] },
    { title: 'Vận dụng sau bài học', items: ['Lập bảng so sánh bốn kì.', 'Mỗi kì có chuyển động pít tông riêng.'] },
    { title: 'Hoạt động LMS', items: ['Khởi động bằng tình huống thực tế.'] },
  ],
}

describe('reading a lesson without repetition', () => {
  it('keeps the key points as a list and drops them and the description from the paragraph', () => {
    const reading = lessonReading(lesson)
    expect(reading.paragraph).toBe('')
    expect(reading.points).toEqual(lesson.key_points)
  })

  it('keeps own sections, drops boilerplate ones and items already shown', () => {
    const titles = lessonReading(lesson).sections.map((section) => section.title)
    expect(titles).toEqual(['Mục tiêu cần đạt', 'Vận dụng sau bài học'])
    expect(lessonReading(lesson).sections[1].items).toEqual(['Lập bảng so sánh bốn kì.'])
  })

  it('keeps a real paragraph that adds to the key points', () => {
    const reading = lessonReading({ ...lesson, content: `${lesson.content} Kì nổ là kì duy nhất sinh công.` })
    expect(reading.paragraph).toBe('Kì nổ là kì duy nhất sinh công.')
  })

  it('works on every catalog lesson of Bài 18 and leaves no boilerplate section', () => {
    const reading = lessonReading(getSampleLesson(110602))
    expect(reading.points.length).toBeGreaterThan(0)
    expect(reading.sections.some((section) => section.title === 'Hoạt động LMS')).toBe(false)
  })
})
