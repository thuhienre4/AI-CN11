const DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1D-dzaQmC7BECkuZ6MAwFribKKj1OSiuN'

const createSlide = (course, lesson, title, driveId, part = '') => ({
  id: `drive-${driveId}`,
  course_id: 1100 + course,
  lesson_title: lesson ? `Bài ${lesson}${part ? ` · ${part}` : ''}` : 'Ôn tập chương',
  title,
  description: 'Bài giảng PowerPoint Công nghệ cơ khí 11 · Nguồn Google Drive.',
  file_name: `${title}.pptx`,
  file_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  source: 'Google Drive',
  external_url: `https://drive.google.com/file/d/${driveId}/view`,
  download_url: `https://drive.google.com/uc?export=download&id=${driveId}`,
})

export const grade11SlideMaterials = [
  createSlide(1, 1, 'Khái quát về cơ khí chế tạo', '14Z9ugxA_-Q41TKrhLPBJFXVM3S6MF4w6'),
  createSlide(1, 2, 'Quy trình chế tạo cơ khí', '1XMhxNS_4oQD8isEBJRAqxUCVzhGRGQe0'),

  createSlide(2, 3, 'Khái quát về vật liệu cơ khí', '15aGYISGQFxNQ5l3PFz5fFZgbKkleFqGe'),
  createSlide(2, 4, 'Vật liệu cơ khí thông dụng', '1CEZ6V1PHZax0rNhPRPY5Fkm1yh7amNqb'),
  createSlide(2, 5, 'Thực hành nhận biết vật liệu cơ khí', '1Tnb1APpaNP9f2Tp_PHOFwl16zmH3220q'),
  createSlide(2, null, 'Ôn tập Chủ đề 1 và Chủ đề 2', '1l3PGvl2u4gO9eAo-AydQcwXa4PrjNW4i'),

  createSlide(3, 6, 'Khái quát về các phương pháp gia công cơ khí', '1C2VKdL61WCnvLuzTxImpZQKG5cmtNkXn'),
  createSlide(3, 7, 'Phương pháp gia công cơ khí', '1SlCWD6xgc8e6MKRw6m9bH9UrLOdN5CBc'),
  createSlide(3, 8, 'Phương pháp gia công không phoi', '1P0BYnVzDR-uixNMvVfajfVAC5k4riIdC'),
  createSlide(3, 9, 'Quy trình gia công chi tiết', '1SS5_QAUrDFLw2aO-cWBUR1I6Js8BY_hF'),
  createSlide(3, 10, 'Dự án gia công cơ khí', '13LtFLbXP_4gPJF54SKHW4MXMRL4eGb6S'),
  createSlide(3, null, 'Ôn tập Chủ đề 3', '11DgU0LAG1m-s79IEnW6O0E9X_GVd4_MX'),

  createSlide(4, 11, 'Quy trình sản xuất cơ khí', '1Yf9Pn8tGNru2yr0kz_YGhqYaTGTqvpyi'),
  createSlide(4, 12, 'Dây chuyền sản xuất tự động', '1W0rRrfjoaHJBDJMgQoDNr9DVumyNsOlI'),
  createSlide(4, 13, 'Cách mạng công nghiệp 4.0 trong sản xuất cơ khí', '1YEGzRijDabafy4fvmTxRJ0MR0h_6l_hA'),
  createSlide(4, 14, 'An toàn lao động trong sản xuất cơ khí', '1dQUG-_36XjKKk5mk31b2xRzYE0VIjGEc'),
  createSlide(4, null, 'Ôn tập Chủ đề 4', '12E0hec0ZB4VEwaR3sGkh7s1mbc4lte6z'),

  createSlide(5, 15, 'Khái quát về cơ khí động lực', '1nlT88lRL4UYbVAOiFh11y8X6N1z9sjo-'),
  createSlide(5, 16, 'Một số ngành nghề liên quan đến cơ khí động lực', '114tERfrdppCrC5Ku6oOCG-jijBXXy0GE'),

  createSlide(6, 17, 'Khái quát về động cơ đốt trong', '1wEs82ldN8Hb37IKJMVtxk1F9SYvK3ZUe'),
  createSlide(6, 18, 'Nguyên lí làm việc của động cơ đốt trong', '1LBDiLF0DAOThv-YLr9AuIZII3n1dZ5Sx', 'Phần 1'),
  createSlide(6, 18, 'Nguyên lí làm việc của động cơ đốt trong', '1RE71wbsy9S4Ybi71pThumojPHHPeuN1Z', 'Phần 2'),
  createSlide(6, 19, 'Thân máy và các cơ cấu của động cơ', '1-cKXnH0RKXzhwyny_bnZv3Lu722ubgbp'),
  createSlide(6, 20, 'Hệ thống bôi trơn', '1OdPHqidMZAtVUzIq-Z5MQX8TIBaL4Ini'),
  createSlide(6, 21, 'Hệ thống nhiên liệu', '1UU64G1GwwkQ8982WeAOVl0R_vnbFQnsD'),
  createSlide(6, 22, 'Hệ thống đánh lửa và hệ thống khởi động', '1p8_P0e2sTkecFbJrYrx5je9U5Ukd5Og9'),
  createSlide(6, null, 'Ôn tập Chủ đề 5 và Chủ đề 6', '1_dmpnIKr3fV8-z5BQvOE2_dCZXnBFWD5'),

  createSlide(7, 23, 'Khái quát về ô tô', '17t4Nkz1DmYVuqXDUhiPE8zig2OJExIxk'),
  createSlide(7, 24, 'Hệ thống truyền lực', '18V3mWvAjsVyaSK_R8Gxd8yg6Ix085aqx', 'Phần 1'),
  createSlide(7, 24, 'Hệ thống truyền lực', '1CeWT9y3ipGTi2pXw_nvzfOD9oSUlp-2u', 'Phần 2'),
  createSlide(7, 25, 'Hệ thống phanh, treo và lái', '1TcZisPWiOggPWYEo1-TkwpvHUkpdMVRo'),
  createSlide(7, 26, 'Trang bị điện ô tô', '1W8tOfhMoPendSQwJ1Bh9ltJ225FTuEoh'),
  createSlide(7, 27, 'Sử dụng và bảo dưỡng ô tô', '1ksNXa4n-gHLEULJGh8P1Qp7G-9ZN3mjq'),
  createSlide(7, null, 'Ôn tập Chủ đề 7', '1wCvPClk6IJOFwgKx0DJGxk6yirw2v8jz'),
]

export const getGrade11SlideMaterialsByCourse = (courseId) =>
  grade11SlideMaterials.filter((material) => material.course_id === Number(courseId))

export { DRIVE_FOLDER_URL }
