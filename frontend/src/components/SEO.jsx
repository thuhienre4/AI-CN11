import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'EngineLab Công nghệ'
const DEFAULT_DESCRIPTION =
  'Công cụ học tập môn Công nghệ THPT với bài học tương tác, quiz, mô phỏng 3D, học liệu và quản lý lớp học cho học sinh, giáo viên.'
const DEFAULT_TITLE = `${SITE_NAME} - Công cụ học tập Công nghệ THPT`

const publicPageSeo = {
  '/login': {
    title: 'Đăng nhập EngineLab Công nghệ',
    description:
      'Đăng nhập EngineLab Công nghệ để học bài, làm quiz, xem mô phỏng 3D, tham gia lớp học và theo dõi tiến độ môn Công nghệ THPT.',
    robots: 'index,follow',
  },
  '/register': {
    title: 'Tạo tài khoản EngineLab Công nghệ',
    description:
      'Tạo tài khoản học sinh hoặc giáo viên trên EngineLab Công nghệ để sử dụng bài học, học liệu, quiz, mô phỏng và lớp học THPT.',
    robots: 'index,follow',
  },
}

const privatePageSeo = {
  '/': {
    title: 'Bảng điều khiển học tập - EngineLab Công nghệ',
    description:
      'Bảng điều khiển EngineLab Công nghệ cho học sinh và giáo viên theo dõi bài học, nhiệm vụ, quiz và hoạt động luyện tập.',
  },
  '/classroom': {
    title: 'Lớp học Công nghệ THPT - EngineLab',
    description: 'Quản lý thông báo, nhiệm vụ, bài nộp và phản hồi trong lớp học Công nghệ THPT.',
  },
  '/projection-practice': {
    title: 'Luyện tập hình chiếu - EngineLab Công nghệ',
    description: 'Công cụ luyện tập hình chiếu và đọc bản vẽ kỹ thuật trong môn Công nghệ.',
  },
  '/engineering-design': {
    title: 'Xưởng thiết kế kĩ thuật - EngineLab Công nghệ',
    description: 'Thực hành quy trình thiết kế kĩ thuật 5 bước: xác định vấn đề, chọn giải pháp, làm nguyên mẫu, thử nghiệm và lập hồ sơ kĩ thuật.',
  },
  '/design-lab': {
    title: 'Phòng thiết kế hệ thống - EngineLab Công nghệ',
    description: 'Thực hành thiết kế sơ đồ hệ thống, cấu trúc cơ khí và quy trình kỹ thuật.',
  },
  '/progress': {
    title: 'Tiến độ cá nhân - EngineLab Công nghệ',
    description: 'Theo dõi tiến độ học tập, XP, quiz, huy hiệu và gợi ý ôn tập cá nhân.',
  },
}

const getRouteSeo = (pathname) => {
  if (publicPageSeo[pathname]) return publicPageSeo[pathname]
  if (privatePageSeo[pathname]) return { robots: 'noindex,nofollow', ...privatePageSeo[pathname] }

  if (pathname.startsWith('/courses/')) {
    return {
      title: 'Chương học Công nghệ THPT - EngineLab',
      description: 'Nội dung bài học, học liệu, câu hỏi và hoạt động luyện tập theo chương Công nghệ THPT.',
      robots: 'noindex,nofollow',
    }
  }

  if (pathname.startsWith('/lessons/')) {
    return {
      title: 'Bài học Công nghệ THPT - EngineLab',
      description: 'Bài học Công nghệ THPT với nội dung tương tác, quiz, trợ lý AI và mô phỏng 3D.',
      robots: 'noindex,nofollow',
    }
  }

  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    robots: 'noindex,nofollow',
  }
}

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector)

  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
}

const setLink = (rel, href) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`)

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

export default function SEO() {
  const { pathname } = useLocation()
  const seo = useMemo(() => getRouteSeo(pathname), [pathname])

  useEffect(() => {
    const origin = window.location.origin
    const canonicalUrl = `${origin}${pathname === '/' ? '/' : pathname}`
    const title = seo.title || DEFAULT_TITLE
    const description = seo.description || DEFAULT_DESCRIPTION
    const robots = seo.robots || 'noindex,nofollow'

    document.documentElement.lang = 'vi'
    document.title = title

    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[name="robots"]', { name: 'robots', content: robots })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: `${origin}/seo-preview.svg` })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: `${origin}/seo-preview.svg` })
    setLink('canonical', canonicalUrl)
  }, [pathname, seo])

  return null
}
