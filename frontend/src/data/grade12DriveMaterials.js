export const GRADE_12_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1S62BlYKSsY_jtQFdh7YenPEljMOl3Yde'

const createLessonPdf = (lessonNumber, sourceLessonId, courseNumber, title, driveId) => ({
  id: `grade-12-drive-${driveId}`,
  course_id: 1200 + courseNumber,
  lesson_id: 120000 + sourceLessonId,
  lesson_number: lessonNumber,
  lesson_title: `Bài ${lessonNumber}`,
  title,
  description: `Tài liệu PDF Công nghệ 12 dành riêng cho Bài ${lessonNumber}.`,
  file_name: `${title}.pdf`,
  file_type: 'application/pdf',
  source: 'Google Drive',
  external_url: `https://drive.google.com/file/d/${driveId}/view`,
  download_url: `https://drive.google.com/uc?export=download&id=${driveId}`,
})

const createChapterReview = (courseNumber, driveId) => ({
  id: `grade-12-review-${driveId}`,
  course_id: 1200 + courseNumber,
  lesson_title: `Tổng kết chương ${courseNumber}`,
  title: `Tổng kết chương ${courseNumber}`,
  description: `Tài liệu tổng kết Chương ${courseNumber} Công nghệ 12.`,
  file_name: `Tổng kết chương ${courseNumber}.pdf`,
  file_type: 'application/pdf',
  source: 'Google Drive',
  external_url: `https://drive.google.com/file/d/${driveId}/view`,
  download_url: `https://drive.google.com/uc?export=download&id=${driveId}`,
})

export const grade12LessonMaterials = [
  createLessonPdf(1, 101, 1, 'Giới thiệu tổng quan về kĩ thuật điện', '1y5d8cMGI46vn-JaBpQ10cFHUyokuaCft'),
  createLessonPdf(2, 102, 1, 'Ngành nghề trong lĩnh vực kĩ thuật điện', '1cJYstAHcuUO9v5sTsYC1BIX9ih-G2TcV'),
  createLessonPdf(3, 201, 2, 'Mạch điện xoay chiều ba pha', '1ZMqbkPzmBdW7UsjSyKJz9XQjQpAXg2vo'),
  createLessonPdf(4, 202, 2, 'Hệ thống điện quốc gia', '1lng19S0QktxukWSkwDlDos0lkZK7x9q4'),
  createLessonPdf(5, 203, 2, 'Sản xuất điện năng', '17syXjN3ZHWNmJ0l1gDaG90OtmkdHMXd_'),
  createLessonPdf(6, 204, 2, 'Mạng điện sản xuất quy mô nhỏ', '1r85GmU_5hQWTph6tI-eFwWvYqJrR-uCF'),
  createLessonPdf(7, 205, 2, 'Mạng điện hạ áp dùng trong sinh hoạt', '1JWZpweEJnPbsgAy49gVGAN8k5c4xCuZh'),
  createLessonPdf(8, 301, 3, 'Hệ thống điện trong gia đình', '1QDjVDCKrbcHq8yDh05XJmNo9fYt_0FbJ'),
  createLessonPdf(9, 302, 3, 'Thiết bị điện trong hệ thống điện gia đình', '1AjCFDFHOC-BhArbH_pnvA4QoN6-aQvjW'),
  createLessonPdf(10, 303, 3, 'Thiết kế và lắp đặt mạch điện điều khiển trong gia đình', '19nOdzJuajymz_8EFwU2v9eO9xxqdni8G'),
  createLessonPdf(11, 401, 4, 'An toàn điện', '1JuuzO1Aw3q_4ghse9XgGgGvlgdSVjBfw'),
  createLessonPdf(12, 402, 4, 'Tiết kiệm điện năng', '1gpG_Ht8g3vkoaKxw41a4zFOIjR6mhQrK'),
  createLessonPdf(13, 501, 5, 'Khái quát về kĩ thuật điện tử', '1OPWkWM_TJZhMY_jz0WhY_40RYQN9h8B8'),
  createLessonPdf(14, 502, 5, 'Ngành nghề và dịch vụ trong lĩnh vực kĩ thuật điện tử', '1HoIoGWPh7IYXZLqZAEgdxDsHHj1Ge_tu'),
  createLessonPdf(15, 601, 6, 'Điện trở, tụ điện và cuộn cảm', '1Fs52Osw_BXsTb0qLWsktRIe9e42AzKDh'),
  createLessonPdf(16, 602, 6, 'Diode, transistor và mạch tích hợp IC', '1wGt3G5f8AqWR_RrcteM0_-H4s3fm5F8L'),
  createLessonPdf(17, 603, 6, 'Thực hành mạch phát hiện dòng điện xoay chiều', '1vH14GsfqX9YJhVqPwnfihV0N9PwSVjsr'),
  createLessonPdf(18, 701, 7, 'Giới thiệu về điện tử tương tự', '1m7h78rnrrQFXOzdCSrImzyxE32yPcO0O'),
  createLessonPdf(19, 702, 7, 'Khuếch đại thuật toán', '1K2S1RqwXANzmv67t_DB2xZ16MM_6P5-L'),
  createLessonPdf(20, 703, 7, 'Thực hành mạch khuếch đại đảo', '1tpL23Z6kDoekBgLZ28BK50ybAHjPwOXY'),
  createLessonPdf(21, 801, 8, 'Tín hiệu số và các cổng logic cơ bản', '100cB0XxdqTtzah2WLDS-Z8Ke1U_MU2Sb'),
  createLessonPdf(22, 802, 8, 'Một số mạch xử lí tín hiệu trong điện tử số', '1hV4t8MQGqCClH9opMbkXisxObGEAFnxs'),
  createLessonPdf(23, 803, 8, 'Thực hành lắp ráp mạch báo cháy dùng cổng logic', '11mgGC7Qs7sbRi52RUa2r4GovTtZ88-Hd'),
  createLessonPdf(24, 901, 9, 'Khái quát về vi điều khiển', '1YynCliV_mFrmFuBIPyIwwJ-t3Zf_YxSN'),
  createLessonPdf(25, 902, 9, 'Bo mạch lập trình vi điều khiển', '1bvWTqvhyLbENxTMlXHlPEf_yYDFvrzoe'),
  createLessonPdf(26, 903, 9, 'Thực hành mạch tự động điều chỉnh cường độ sáng LED', '1bdRiUJGQomNzOUjt3IEP9m7nd5IC462j'),
]

export const grade12ChapterReviews = [
  createChapterReview(1, '1P5DR-ME0xQDQidbzRa7rQJHeow_Taof9'),
  createChapterReview(2, '1xtL20KbUyEVc4E64BKZoBZSHROWO0XUH'),
  createChapterReview(3, '1D72jfzOEUdQ1EbGJmSoQbQsmoAJIysNq'),
  createChapterReview(4, '1X15pZHZuTu8q9VpFu4fbMbamXJi_3dbZ'),
  createChapterReview(5, '1xzXO8t2i6bL5HTfw_Iy7heDVhLA0AKv-'),
  createChapterReview(6, '1C1CgR8Zlx8uZJLnlEJI-MoizZhZ4n8kJ'),
  createChapterReview(7, '1fMU5NwUSisadQn1CQbteV84vQg7x259H'),
  createChapterReview(8, '1MzOrt2ZrWOCN4Dr09pKRF4nosACExG4p'),
  createChapterReview(9, '18X62Jr6ePHmyPcRKZJApChnnwXdqupCm'),
]

export const grade12DriveMaterials = [
  ...grade12LessonMaterials,
  ...grade12ChapterReviews,
]

export const getGrade12DriveMaterialsByCourse = (courseId) =>
  grade12DriveMaterials.filter((material) => material.course_id === Number(courseId))

export const getGrade12MaterialByLesson = (lesson) => {
  if (!lesson || Number(lesson.grade_level) !== 12) return null

  const lessonId = Number(lesson.id)
  const sourceLessonId = Number(lesson.source_id)
  const lessonNumber = Number(lesson.title?.match(/Bài\s+(\d+)/i)?.[1])

  return grade12LessonMaterials.find((material) =>
    material.lesson_id === lessonId
    || material.lesson_id === 120000 + sourceLessonId
    || material.lesson_number === lessonNumber
  ) || null
}
