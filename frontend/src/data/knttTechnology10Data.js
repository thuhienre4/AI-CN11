import { createKnttLmsData } from './knttLmsFactory'

const courseSpecs = [
  {
    id: 1,
    short_title: 'Chương I. Đại cương về công nghệ',
    title: 'Chương I. Đại cương về công nghệ',
    description:
      'Giúp học sinh hiểu công nghệ là gì, hệ thống kĩ thuật vận hành ra sao, một số công nghệ phổ biến và công nghệ mới, cách đánh giá công nghệ, tác động của cách mạng công nghiệp và định hướng nghề nghiệp trong lĩnh vực kĩ thuật - công nghệ.',
    chapter_summary:
      'Chương này xây dựng nền tảng để trả lời công nghệ là gì, có quan hệ như thế nào với khoa học, kĩ thuật, tự nhiên, con người và xã hội. Học sinh tìm hiểu cấu trúc hệ thống kĩ thuật, các công nghệ phổ biến và công nghệ mới; đồng thời biết đánh giá sản phẩm công nghệ, nhận diện tác động của các cuộc cách mạng công nghiệp và định hướng nghề nghiệp phù hợp.',
    core_concepts: [
      'Khoa học khám phá và giải thích thế giới; kĩ thuật vận dụng tri thức để tạo giải pháp; công nghệ là giải pháp, quy trình và phương tiện biến đổi nguồn lực thành sản phẩm hoặc dịch vụ.',
      'Hệ thống kĩ thuật gồm đầu vào, bộ phận xử lí hoặc biến đổi, đầu ra, điều khiển và có thể có phản hồi.',
      'Đổi mới công nghệ gắn với công nghệ mới, cách mạng công nghiệp và việc đánh giá theo các tiêu chí kĩ thuật, kinh tế, xã hội, môi trường.',
      'Định hướng nghề nghiệp cần kết hợp yêu cầu nghề, triển vọng thị trường lao động, sở thích và năng lực của bản thân.',
    ],
    learning_outcomes: [
      'Nêu được các khái niệm khoa học, kĩ thuật, công nghệ và mối liên hệ giữa chúng.',
      'Mô tả được quan hệ của công nghệ với tự nhiên, con người, xã hội và cấu trúc của hệ thống kĩ thuật.',
      'Tóm tắt được công nghệ phổ biến, công nghệ mới, các cuộc cách mạng công nghiệp và đánh giá được sản phẩm công nghệ.',
      'Trình bày được thông tin nghề nghiệp và bước đầu đánh giá sự phù hợp của bản thân với lĩnh vực kĩ thuật, công nghệ.',
    ],
    mini_test: {
      title: 'Mini test Chương I',
      questions: [
        {
          question: 'Nhận định nào mô tả đúng nhất về công nghệ?',
          options: [
            'Chỉ gồm các máy móc hiện đại dùng trong nhà máy.',
            'Gồm tri thức, phương pháp, quy trình, kĩ năng và phương tiện để tạo sản phẩm hoặc dịch vụ.',
            'Chỉ là kết quả nghiên cứu của khoa học tự nhiên.',
            'Là mọi hoạt động sử dụng điện và máy tính.',
          ],
          correct_index: 1,
          explanation: 'Công nghệ không chỉ là máy móc mà còn bao gồm tri thức, quy trình, kĩ năng và cách tổ chức.',
        },
        {
          question: 'Thành phần nào không thuộc cấu trúc cơ bản của một hệ thống kĩ thuật?',
          options: ['Đầu vào', 'Bộ phận xử lí', 'Đầu ra', 'Giá bán trên thị trường'],
          correct_index: 3,
          explanation: 'Hệ thống kĩ thuật được phân tích theo đầu vào, xử lí, đầu ra, điều khiển và phản hồi; giá bán là tiêu chí kinh tế.',
        },
        {
          question: 'Khi đánh giá một sản phẩm công nghệ, cách làm nào phù hợp nhất?',
          options: [
            'Chỉ chọn sản phẩm mới nhất.',
            'Chỉ so sánh giá mua ban đầu.',
            'Xem xét đồng thời hiệu quả, chi phí, an toàn, xã hội và môi trường.',
            'Chọn theo quảng cáo phổ biến nhất.',
          ],
          correct_index: 2,
          explanation: 'Đánh giá công nghệ cần nhiều tiêu chí và phải phù hợp với bối cảnh sử dụng cụ thể.',
        },
        {
          question: 'Công nghiệp 4.0 gắn nổi bật với nhóm công nghệ nào?',
          options: [
            'Hơi nước và cơ giới hóa.',
            'Điện và sản xuất hàng loạt.',
            'AI, IoT, dữ liệu lớn, robot và kết nối số.',
            'Công cụ thủ công và sức kéo động vật.',
          ],
          correct_index: 2,
          explanation: 'Công nghiệp 4.0 dựa trên dữ liệu, kết nối số và các hệ thống thông minh.',
        },
        {
          question: 'Yếu tố nào cần kết hợp khi lựa chọn nghề kĩ thuật, công nghệ?',
          options: [
            'Chỉ mức lương hiện tại.',
            'Sở thích, năng lực, điều kiện đào tạo và nhu cầu xã hội.',
            'Chỉ ý kiến của bạn bè.',
            'Chỉ chọn nghề đang nổi tiếng.',
          ],
          correct_index: 1,
          explanation: 'Định hướng nghề nghiệp phù hợp cần cân bằng đặc điểm cá nhân với yêu cầu đào tạo và thị trường lao động.',
        },
      ],
    },
    suggested_periods: 25,
  },
  {
    id: 2,
    short_title: 'Chương II. Vẽ kĩ thuật',
    title: 'Chương II. Vẽ kĩ thuật',
    description:
      'Hình thành năng lực đọc, lập và sử dụng bản vẽ kĩ thuật: tiêu chuẩn trình bày, hình chiếu vuông góc, hình cắt, mặt cắt, hình chiếu trục đo, phối cảnh, ren, bản vẽ cơ khí, bản vẽ xây dựng và CAD.',
    chapter_summary:
      'Chương Vẽ kĩ thuật giúp học sinh dùng bản vẽ như ngôn ngữ chung của kĩ thuật. Từ tiêu chuẩn trình bày, học sinh học cách biểu diễn vật thể bằng hình chiếu, hình cắt, mặt cắt, hình trục đo, phối cảnh và ren; sau đó đọc, lập bản vẽ cơ khí, xây dựng và tạo hình biểu diễn đơn giản bằng máy tính.',
    core_concepts: [
      'Bản vẽ kĩ thuật truyền đạt hình dạng, kích thước, vật liệu và yêu cầu kĩ thuật theo tiêu chuẩn thống nhất.',
      'Hình chiếu vuông góc, hình cắt và mặt cắt dùng để biểu diễn chính xác hình dạng ngoài và cấu tạo bên trong của vật thể.',
      'Hình chiếu trục đo và phối cảnh hỗ trợ hình dung không gian; ren được biểu diễn theo quy ước để bản vẽ rõ và gọn.',
      'Bản vẽ chi tiết, bản vẽ lắp và bản vẽ xây dựng có mục đích, nội dung, trình tự đọc khác nhau; CAD hỗ trợ tạo và hiệu chỉnh bản vẽ.',
    ],
    learning_outcomes: [
      'Trình bày được khái niệm, vai trò và các tiêu chuẩn cơ bản của bản vẽ kĩ thuật.',
      'Vẽ được các hình biểu diễn cơ bản và hình biểu diễn quy ước ren của vật thể đơn giản.',
      'Lập, đọc được bản vẽ chi tiết đơn giản; đọc được bản vẽ lắp và bản vẽ xây dựng đơn giản.',
      'Tạo được một số hình biểu diễn đơn giản với sự hỗ trợ của máy tính.',
    ],
    mini_test: {
      title: 'Mini test Chương II',
      questions: [
        {
          question: 'Vai trò chính của bản vẽ kĩ thuật là gì?',
          options: [
            'Trang trí sản phẩm.',
            'Truyền đạt thống nhất thông tin về hình dạng, kích thước và yêu cầu kĩ thuật.',
            'Thay thế hoàn toàn sản phẩm mẫu.',
            'Chỉ dùng để tính giá thành.',
          ],
          correct_index: 1,
          explanation: 'Bản vẽ là ngôn ngữ chung giữa thiết kế, chế tạo, lắp ráp, thi công và kiểm tra.',
        },
        {
          question: 'Ba hình chiếu vuông góc cơ bản là gì?',
          options: [
            'Đứng, bằng và cạnh.',
            'Trước, sau và phối cảnh.',
            'Bằng, trục đo và mặt cắt.',
            'Đứng, phối cảnh và hình cắt.',
          ],
          correct_index: 0,
          explanation: 'Hình chiếu đứng, hình chiếu bằng và hình chiếu cạnh phối hợp để thể hiện ba chiều vật thể.',
        },
        {
          question: 'Điểm khác nhau cơ bản giữa mặt cắt và hình cắt là gì?',
          options: [
            'Mặt cắt chỉ thể hiện phần giao với mặt phẳng cắt.',
            'Mặt cắt luôn có nhiều kích thước hơn.',
            'Hình cắt chỉ dùng trong xây dựng.',
            'Hai hình hoàn toàn giống nhau.',
          ],
          correct_index: 0,
          explanation: 'Mặt cắt chỉ biểu diễn tiết diện tại mặt phẳng cắt; hình cắt còn thể hiện phần vật thể phía sau mặt phẳng cắt.',
        },
        {
          question: 'Bản vẽ nào thể hiện vị trí và quan hệ lắp ghép giữa nhiều chi tiết?',
          options: ['Bản vẽ chi tiết', 'Bản vẽ lắp', 'Sơ đồ mặt bằng', 'Hình chiếu phối cảnh'],
          correct_index: 1,
          explanation: 'Bản vẽ lắp thể hiện vị trí, quan hệ lắp ghép và nguyên lí làm việc của cụm chi tiết.',
        },
        {
          question: 'Khi vẽ bằng phần mềm CAD, yêu cầu nào vẫn bắt buộc?',
          options: [
            'Không cần ghi kích thước.',
            'Không cần tuân theo tỉ lệ.',
            'Tuân thủ tiêu chuẩn về nét vẽ, kích thước, kí hiệu và khung tên.',
            'Chỉ cần hình vẽ đẹp mắt.',
          ],
          correct_index: 2,
          explanation: 'CAD hỗ trợ thao tác nhưng bản vẽ tạo ra vẫn phải tuân thủ tiêu chuẩn kĩ thuật.',
        },
      ],
    },
    suggested_periods: 25,
  },
  {
    id: 3,
    short_title: 'Chương III. Thiết kế kĩ thuật',
    title: 'Chương III. Thiết kế kĩ thuật',
    description:
      'Tổ chức tư duy thiết kế theo quy trình: xác định vấn đề, tìm hiểu yêu cầu, đề xuất và lựa chọn phương án, tạo mẫu, thử nghiệm, đánh giá, hoàn thiện sản phẩm hoặc giải pháp kĩ thuật.',
    chapter_summary:
      'Chương này giới thiệu cách các kĩ sư giải quyết vấn đề sáng tạo. Học sinh tìm hiểu vai trò của thiết kế, quy trình thiết kế có tính lặp, các yếu tố ảnh hưởng, nguyên tắc, phương pháp và phương tiện hỗ trợ; cuối chương vận dụng toàn bộ kiến thức để thiết kế một sản phẩm đơn giản.',
    core_concepts: [
      'Thiết kế kĩ thuật là hoạt động tạo ra hoặc cải tiến sản phẩm, quy trình hay hệ thống để giải quyết một nhu cầu thực tiễn.',
      'Quy trình thiết kế gồm xác định vấn đề, tìm hiểu thông tin, đề xuất và chọn giải pháp, tạo mẫu, thử nghiệm, đánh giá và cải tiến.',
      'Thiết kế chịu ảnh hưởng của người dùng, công năng, an toàn, thẩm mĩ, vật liệu, công nghệ chế tạo, chi phí, xã hội và môi trường.',
      'Phác thảo, mô hình, CAD, mô phỏng, tạo mẫu và làm việc nhóm là các phương pháp, phương tiện hỗ trợ lựa chọn và kiểm chứng giải pháp.',
    ],
    learning_outcomes: [
      'Trình bày được vai trò, ý nghĩa, nguyên tắc và quy trình thiết kế kĩ thuật.',
      'Phân tích được các yếu tố ảnh hưởng và lựa chọn phương pháp, phương tiện phù hợp cho từng bước thiết kế.',
      'Mô tả được một số nghề nghiệp liên quan tới thiết kế.',
      'Vận dụng quy trình để thiết kế, tạo mẫu, đánh giá và cải tiến một sản phẩm đơn giản.',
    ],
    mini_test: {
      title: 'Mini test Chương III',
      questions: [
        {
          question: 'Thiết kế kĩ thuật thường bắt đầu từ đâu?',
          options: [
            'Làm ngay sản phẩm hoàn chỉnh.',
            'Xác định nhu cầu hoặc vấn đề cần giải quyết.',
            'Mua vật liệu đắt nhất.',
            'Chọn màu sắc sản phẩm.',
          ],
          correct_index: 1,
          explanation: 'Thiết kế phải bắt đầu từ việc hiểu đúng vấn đề, người dùng, yêu cầu và bối cảnh sử dụng.',
        },
        {
          question: 'Vì sao quy trình thiết kế kĩ thuật có tính lặp?',
          options: [
            'Vì không cần lập kế hoạch.',
            'Vì kết quả thử nghiệm có thể yêu cầu quay lại điều chỉnh phương án.',
            'Vì mọi sản phẩm đều phải làm hai lần.',
            'Vì người thiết kế không cần tiêu chí.',
          ],
          correct_index: 1,
          explanation: 'Thử nghiệm cung cấp dữ liệu để điều chỉnh yêu cầu, giải pháp hoặc mẫu thử cho tới khi đạt tiêu chí.',
        },
        {
          question: 'Nhóm yếu tố nào ảnh hưởng trực tiếp đến khả năng chế tạo sản phẩm?',
          options: [
            'Vật liệu, công nghệ chế tạo và chi phí.',
            'Tên người thiết kế và ngày trình bày.',
            'Số trang của báo cáo.',
            'Màu bút dùng để phác thảo.',
          ],
          correct_index: 0,
          explanation: 'Vật liệu, công nghệ và nguồn lực kinh tế quyết định phương án có thể chế tạo trong thực tế hay không.',
        },
        {
          question: 'Phương tiện nào phù hợp để kiểm tra hình dạng và kích thước trước khi làm sản phẩm thật?',
          options: ['Mô hình hoặc mẫu thử', 'Bảng điểm', 'Quảng cáo', 'Danh sách nghề nghiệp'],
          correct_index: 0,
          explanation: 'Mô hình, mẫu thử, CAD và mô phỏng giúp kiểm chứng phương án trước khi chế tạo sản phẩm thật.',
        },
        {
          question: 'Cách đánh giá mẫu thử nào có cơ sở nhất?',
          options: [
            'Đánh giá theo cảm giác của nhóm.',
            'So sánh kết quả thử nghiệm với các tiêu chí đã xác định.',
            'Chỉ hỏi người tạo ra sản phẩm.',
            'Chỉ xem sản phẩm có đẹp hay không.',
          ],
          correct_index: 1,
          explanation: 'Mẫu thử cần được đánh giá bằng dữ liệu và tiêu chí về công năng, an toàn, chi phí, thẩm mĩ và môi trường.',
        },
      ],
    },
    suggested_periods: 20,
  },
]

const lessonSpecs = [
  {
    id: 101,
    course_id: 1,
    title: 'Bài 1. Công nghệ và đời sống',
    description: 'Nhận biết bản chất của công nghệ và vai trò của công nghệ trong sản xuất, đời sống, học tập và bảo vệ môi trường.',
    summary: 'Công nghệ là tập hợp tri thức, phương pháp, quy trình, kĩ năng và phương tiện do con người tạo ra để biến đổi nguồn lực thành sản phẩm, dịch vụ phục vụ nhu cầu. Bài học nhấn mạnh công nghệ luôn gắn với đời sống: từ sản xuất nông nghiệp, công nghiệp, y tế, giao thông đến học tập và sinh hoạt gia đình. Khi sử dụng hoặc lựa chọn công nghệ cần nhìn cả lợi ích, chi phí, an toàn, đạo đức và tác động môi trường.',
    objectives: [
      'Nêu được khái niệm công nghệ theo hướng tri thức, quy trình và phương tiện phục vụ nhu cầu con người.',
      'Phân tích được vai trò của công nghệ trong một số lĩnh vực quen thuộc của đời sống.',
      'Có ý thức sử dụng công nghệ an toàn, tiết kiệm và có trách nhiệm với xã hội, môi trường.',
    ],
    key_points: [
      'Công nghệ không chỉ là máy móc mà còn gồm tri thức, quy trình, kĩ năng và cách tổ chức để tạo ra sản phẩm hoặc dịch vụ.',
      'Công nghệ giúp tăng năng suất, nâng cao chất lượng sống, mở rộng khả năng học tập, giao tiếp và giải quyết vấn đề thực tiễn.',
      'Mỗi công nghệ cần được xem xét theo lợi ích, chi phí, độ an toàn, khả năng tiếp cận và tác động đến con người, môi trường.',
    ],
    application: [
      'Lập bảng so sánh hai công nghệ dùng trong gia đình theo các tiêu chí: tiện ích, chi phí, an toàn, tiết kiệm năng lượng.',
      'Nêu một ví dụ công nghệ cải thiện chất lượng sống ở địa phương và chỉ ra điểm cần sử dụng đúng cách.',
    ],
  },
  {
    id: 102,
    course_id: 1,
    title: 'Bài 2. Hệ thống kĩ thuật',
    description: 'Phân tích hệ thống kĩ thuật theo đầu vào, bộ phận xử lí, đầu ra, điều khiển và phản hồi.',
    summary: 'Hệ thống kĩ thuật là tập hợp các phần tử có liên hệ với nhau để thực hiện một nhiệm vụ xác định. Một hệ thống thường có đầu vào, quá trình xử lí hoặc biến đổi, đầu ra, bộ phận điều khiển và có thể có tín hiệu phản hồi. Cách nhìn hệ thống giúp học sinh hiểu dòng vật chất, năng lượng, thông tin trong máy móc, thiết bị và quy trình sản xuất.',
    objectives: [
      'Nhận biết được các thành phần cơ bản của một hệ thống kĩ thuật.',
      'Mô tả được dòng vật chất, năng lượng hoặc thông tin đi qua hệ thống.',
      'Vận dụng cách phân tích hệ thống để giải thích hoạt động của thiết bị quen thuộc.',
    ],
    key_points: [
      'Hệ thống kĩ thuật gồm các phần tử liên kết với nhau để tạo ra chức năng chung, không nên xem từng bộ phận một cách rời rạc.',
      'Đầu vào có thể là vật liệu, năng lượng, thông tin; đầu ra là sản phẩm, chuyển động, tín hiệu hoặc dịch vụ mong muốn.',
      'Điều khiển và phản hồi giúp hệ thống hoạt động ổn định, chính xác và an toàn hơn.',
    ],
    application: [
      'Vẽ sơ đồ khối của nồi cơm điện, xe đạp điện hoặc hệ thống tưới tự động.',
      'Chỉ ra một lỗi có thể xảy ra trong hệ thống và đề xuất cách kiểm tra theo thứ tự đầu vào - xử lí - đầu ra.',
    ],
  },
  {
    id: 103,
    course_id: 1,
    title: 'Bài 3. Công nghệ phổ biến',
    description: 'Khái quát một số lĩnh vực công nghệ nền tảng trong sản xuất và đời sống hiện đại.',
    summary: 'Bài học giới thiệu các công nghệ phổ biến như cơ khí, điện, điện tử, tự động hoá, công nghệ vật liệu, công nghệ xây dựng và công nghệ thông tin. Mỗi công nghệ có đối tượng tác động, công cụ, quy trình và yêu cầu an toàn riêng. Hiểu các công nghệ phổ biến giúp học sinh nhận ra mối liên hệ giữa sản phẩm hằng ngày với các lĩnh vực kĩ thuật phía sau nó.',
    objectives: [
      'Kể tên và mô tả được đặc điểm cơ bản của một số công nghệ phổ biến.',
      'Liên hệ được công nghệ với sản phẩm, thiết bị hoặc ngành nghề trong thực tế.',
      'Nhận biết được yêu cầu an toàn cơ bản khi tiếp xúc với sản phẩm công nghệ.',
    ],
    key_points: [
      'Công nghệ cơ khí tạo ra, gia công, lắp ráp và bảo trì các chi tiết, máy móc, phương tiện.',
      'Công nghệ điện, điện tử và tự động hoá giúp truyền dẫn, điều khiển, xử lí tín hiệu và vận hành thiết bị thông minh.',
      'Công nghệ vật liệu, xây dựng và thông tin là nền tảng để tạo ra hạ tầng, sản phẩm và dịch vụ hiện đại.',
    ],
    application: [
      'Chọn một sản phẩm như điện thoại, xe máy, nhà ở hoặc robot hút bụi và phân tích các công nghệ đã tham gia tạo ra nó.',
      'Tạo sơ đồ tư duy phân loại công nghệ phổ biến kèm ví dụ minh họa.',
    ],
  },
  {
    id: 104,
    course_id: 1,
    title: 'Bài 4. Một số công nghệ mới',
    description: 'Tìm hiểu trí tuệ nhân tạo, Internet vạn vật, robot, in 3D, vật liệu mới, năng lượng tái tạo và công nghệ sinh học.',
    summary: 'Các công nghệ mới làm thay đổi cách con người sản xuất, học tập và sinh hoạt. AI hỗ trợ phân tích dữ liệu và ra quyết định; IoT kết nối thiết bị để giám sát, điều khiển; robot thay con người làm việc nguy hiểm hoặc lặp lại; in 3D tạo mẫu nhanh; vật liệu mới và năng lượng tái tạo hướng tới hiệu quả và bền vững. Bài học cũng lưu ý rủi ro về dữ liệu, an toàn và đạo đức công nghệ.',
    objectives: [
      'Nêu được đặc điểm và ứng dụng cơ bản của một số công nghệ mới.',
      'Phân tích được lợi ích và rủi ro khi áp dụng công nghệ mới trong đời sống.',
      'Có thái độ cởi mở với đổi mới nhưng biết cân nhắc an toàn, đạo đức và môi trường.',
    ],
    key_points: [
      'AI, IoT, robot và dữ liệu lớn giúp thiết bị, quy trình sản xuất và dịch vụ trở nên thông minh hơn.',
      'In 3D, vật liệu mới và năng lượng tái tạo hỗ trợ tạo mẫu nhanh, tiết kiệm tài nguyên và giảm tác động môi trường.',
      'Công nghệ mới cần đi cùng bảo mật dữ liệu, an toàn vận hành, trách nhiệm xã hội và khả năng tiếp cận công bằng.',
    ],
    application: [
      'Thiết kế ý tưởng một thiết bị IoT đơn giản phục vụ lớp học hoặc gia đình.',
      'Thảo luận một tình huống dùng AI hoặc robot và nêu các nguyên tắc an toàn, đạo đức cần tuân thủ.',
    ],
  },
  {
    id: 105,
    course_id: 1,
    title: 'Bài 5. Đánh giá công nghệ',
    description: 'Biết đánh giá một công nghệ theo tiêu chí kĩ thuật, kinh tế, xã hội, môi trường và khả năng triển khai.',
    summary: 'Đánh giá công nghệ là quá trình xem xét một giải pháp công nghệ trước khi lựa chọn, sử dụng hoặc cải tiến. Các tiêu chí thường gặp gồm hiệu quả kĩ thuật, độ tin cậy, chi phí, an toàn, ảnh hưởng môi trường, tác động xã hội và khả năng phù hợp với điều kiện sử dụng. Bài học giúp học sinh tránh lựa chọn cảm tính hoặc chỉ chạy theo công nghệ mới.',
    objectives: [
      'Nêu được mục đích của việc đánh giá công nghệ.',
      'Sử dụng được một số tiêu chí để so sánh các phương án công nghệ.',
      'Đề xuất được lựa chọn phù hợp với bối cảnh và nguồn lực cụ thể.',
    ],
    key_points: [
      'Đánh giá công nghệ giúp lựa chọn giải pháp phù hợp, hiệu quả và an toàn, không nhất thiết là giải pháp đắt hoặc mới nhất.',
      'Tiêu chí đánh giá cần bao quát kĩ thuật, kinh tế, môi trường, xã hội, an toàn và khả năng bảo trì.',
      'Kết quả đánh giá phụ thuộc bối cảnh sử dụng, nhu cầu người dùng và nguồn lực hiện có.',
    ],
    application: [
      'So sánh bóng đèn sợi đốt, compact và LED theo hiệu suất, chi phí, tuổi thọ, môi trường.',
      'Lập phiếu đánh giá một thiết bị học tập số trước khi đề xuất mua cho lớp.',
    ],
  },
  {
    id: 106,
    course_id: 1,
    title: 'Bài 6. Cách mạng công nghiệp',
    description: 'Nhận biết các cuộc cách mạng công nghiệp và tác động của chuyển đổi số đến sản xuất, nghề nghiệp, đời sống.',
    summary: 'Cách mạng công nghiệp là những bước nhảy lớn làm thay đổi công cụ lao động, nguồn năng lượng, phương thức sản xuất và tổ chức xã hội. Từ cơ giới hoá bằng hơi nước, sản xuất hàng loạt bằng điện, tự động hoá bằng điện tử - tin học đến công nghiệp 4.0 với dữ liệu, kết nối, AI và robot, mỗi giai đoạn đều tạo ra cơ hội và thách thức mới. Người học cần năng lực số, tư duy hệ thống và khả năng học suốt đời.',
    objectives: [
      'Trình bày được nét chính của các cuộc cách mạng công nghiệp.',
      'Phân tích được tác động của công nghiệp 4.0 tới lao động, học tập và sản xuất.',
      'Nhận thức được yêu cầu chuẩn bị năng lực cá nhân trong bối cảnh chuyển đổi số.',
    ],
    key_points: [
      'Mỗi cuộc cách mạng công nghiệp gắn với một nền tảng công nghệ chủ đạo và làm thay đổi cách tổ chức sản xuất.',
      'Công nghiệp 4.0 dựa trên kết nối số, dữ liệu lớn, AI, IoT, robot, tự động hoá và hệ thống thông minh.',
      'Nghề nghiệp tương lai đòi hỏi khả năng học hỏi, hợp tác, sử dụng công nghệ số và thích ứng với thay đổi.',
    ],
    application: [
      'Lập dòng thời gian bốn cuộc cách mạng công nghiệp kèm công nghệ tiêu biểu.',
      'Phân tích một nghề quen thuộc đã thay đổi như thế nào nhờ chuyển đổi số.',
    ],
  },
  {
    id: 107,
    course_id: 1,
    title: 'Bài 7. Nghề nghiệp kĩ thuật, công nghệ',
    description: 'Tìm hiểu đặc điểm, yêu cầu năng lực và cơ hội nghề nghiệp trong lĩnh vực kĩ thuật - công nghệ.',
    summary: 'Lĩnh vực kĩ thuật, công nghệ rất rộng, gồm thiết kế, chế tạo, vận hành, bảo trì, kiểm định, tự động hoá, dữ liệu, xây dựng, năng lượng và nhiều ngành khác. Bài học định hướng học sinh nhận diện sở thích, năng lực, điều kiện học tập và nhu cầu xã hội để lựa chọn hướng phát triển phù hợp. Các nghề kĩ thuật yêu cầu kiến thức nền, kĩ năng thực hành, an toàn lao động, hợp tác và tinh thần cập nhật công nghệ.',
    objectives: [
      'Kể tên được một số nhóm nghề trong lĩnh vực kĩ thuật, công nghệ.',
      'Mô tả được phẩm chất và năng lực cần có của người làm nghề kĩ thuật.',
      'Liên hệ được sở thích, năng lực bản thân với một hướng nghề nghiệp phù hợp.',
    ],
    key_points: [
      'Nghề kĩ thuật, công nghệ gắn với giải quyết vấn đề thực tiễn bằng tri thức, quy trình, công cụ và tiêu chuẩn an toàn.',
      'Năng lực quan trọng gồm tư duy kĩ thuật, đọc tài liệu, làm việc nhóm, thực hành an toàn, giao tiếp và học hỏi liên tục.',
      'Định hướng nghề nghiệp cần kết hợp sở thích cá nhân, năng lực học tập, điều kiện đào tạo và nhu cầu xã hội.',
    ],
    application: [
      'Lập hồ sơ nghề nghiệp ngắn cho một nghề công nghệ em quan tâm: nhiệm vụ, môi trường làm việc, năng lực cần có.',
      'Tự đánh giá điểm mạnh, điểm cần cải thiện nếu muốn theo học ngành kĩ thuật.',
    ],
  },
  {
    id: 201,
    course_id: 2,
    title: 'Bài 8. Bản vẽ kĩ thuật và tiêu chuẩn trình bày bản vẽ kĩ thuật',
    description: 'Hiểu vai trò của bản vẽ kĩ thuật và các tiêu chuẩn trình bày cơ bản.',
    flow: 'drawing',
    summary: 'Bản vẽ kĩ thuật là ngôn ngữ dùng để truyền đạt thông tin về hình dạng, kích thước, vật liệu, yêu cầu kĩ thuật và cách chế tạo hoặc thi công sản phẩm. Để mọi người đọc hiểu thống nhất, bản vẽ phải tuân theo tiêu chuẩn về khổ giấy, tỉ lệ, nét vẽ, chữ viết, ghi kích thước, khung tên. Đây là nền tảng để học các dạng biểu diễn kĩ thuật tiếp theo.',
    objectives: [
      'Nêu được vai trò của bản vẽ kĩ thuật trong thiết kế, chế tạo, lắp ráp và thi công.',
      'Nhận biết được một số tiêu chuẩn trình bày bản vẽ cơ bản.',
      'Có ý thức trình bày bản vẽ rõ ràng, chính xác và thống nhất.',
    ],
    key_points: [
      'Bản vẽ kĩ thuật là phương tiện giao tiếp quan trọng giữa người thiết kế, người chế tạo, người thi công và người kiểm tra.',
      'Tiêu chuẩn trình bày giúp bản vẽ rõ ràng, dễ đọc, tránh hiểu sai khi sản xuất hoặc lắp ráp.',
      'Khi đọc bản vẽ cần chú ý hình biểu diễn, kích thước, kí hiệu, vật liệu, yêu cầu kĩ thuật và khung tên.',
    ],
    application: [
      'Quan sát một bản vẽ đơn giản và chỉ ra khổ giấy, khung tên, tỉ lệ, nét vẽ và kích thước.',
      'Tạo checklist kiểm tra bản vẽ trước khi nộp.',
    ],
  },
  {
    id: 202,
    course_id: 2,
    title: 'Bài 9. Hình chiếu vuông góc',
    description: 'Biểu diễn vật thể bằng hình chiếu đứng, bằng, cạnh và liên hệ giữa các hình chiếu.',
    flow: 'drawing',
    summary: 'Hình chiếu vuông góc biểu diễn vật thể lên các mặt phẳng chiếu bằng các tia chiếu vuông góc. Các hình chiếu cơ bản gồm hình chiếu đứng, hình chiếu bằng và hình chiếu cạnh. Khi đọc hoặc vẽ, học sinh cần xác định hướng chiếu, vị trí các hình chiếu và mối liên hệ kích thước giữa chúng để hình dung đúng vật thể trong không gian.',
    objectives: [
      'Nêu được khái niệm hình chiếu vuông góc và các hình chiếu cơ bản.',
      'Xác định được vị trí tương quan của hình chiếu đứng, hình chiếu bằng, hình chiếu cạnh.',
      'Đọc được hình dạng vật thể đơn giản từ các hình chiếu.',
    ],
    key_points: [
      'Hình chiếu vuông góc mô tả chính xác hình dạng vật thể trên các mặt phẳng chiếu.',
      'Mỗi hình chiếu thể hiện hai kích thước chính; cần phối hợp nhiều hình chiếu để hiểu đủ ba chiều của vật thể.',
      'Chọn hướng chiếu hợp lí giúp bản vẽ thể hiện được nhiều đặc điểm hình dạng nhất.',
    ],
    application: [
      'Từ một vật mẫu đơn giản, xác định mặt chính và phác ba hình chiếu cơ bản.',
      'Ghép các hình chiếu cho sẵn để suy luận vật thể tương ứng.',
    ],
  },
  {
    id: 203,
    course_id: 2,
    title: 'Bài 10. Hình cắt và mặt cắt',
    description: 'Dùng hình cắt, mặt cắt để biểu diễn cấu tạo bên trong vật thể.',
    flow: 'drawing',
    summary: 'Khi vật thể có cấu tạo bên trong phức tạp, chỉ dùng hình chiếu ngoài sẽ khó thể hiện đầy đủ. Hình cắt được tạo bằng cách tưởng tượng dùng mặt phẳng cắt vật thể rồi bỏ phần trước mặt phẳng cắt để thấy phần bên trong. Mặt cắt chỉ thể hiện hình dạng phần vật thể nằm trên mặt phẳng cắt. Cần dùng đúng kí hiệu mặt phẳng cắt, đường gạch vật liệu và quy ước biểu diễn.',
    objectives: [
      'Phân biệt được hình cắt và mặt cắt.',
      'Nhận biết được mục đích sử dụng hình cắt, mặt cắt trong bản vẽ.',
      'Đọc được cấu tạo bên trong của vật thể qua hình cắt hoặc mặt cắt đơn giản.',
    ],
    key_points: [
      'Hình cắt giúp biểu diễn rõ cấu tạo bên trong mà hình chiếu bình thường khó thể hiện.',
      'Mặt cắt chỉ biểu diễn phần giao của vật thể với mặt phẳng cắt, không thể hiện toàn bộ phần sau mặt phẳng cắt.',
      'Đường gạch vật liệu và kí hiệu vị trí cắt phải trình bày đúng quy ước để người đọc hiểu thống nhất.',
    ],
    application: [
      'So sánh cùng một vật thể khi biểu diễn bằng hình chiếu thường và hình cắt.',
      'Chỉ ra trên bản vẽ vị trí mặt phẳng cắt và phần vật liệu bị cắt.',
    ],
  },
  {
    id: 204,
    course_id: 2,
    title: 'Bài 11. Hình chiếu trục đo',
    description: 'Biểu diễn vật thể trong không gian bằng hình chiếu trục đo.',
    flow: 'drawing',
    summary: 'Hình chiếu trục đo là dạng biểu diễn giúp người đọc thấy đồng thời ba chiều của vật thể trên một hình vẽ. Khác với hình chiếu vuông góc, hình chiếu trục đo cho cảm giác không gian rõ hơn nên thuận lợi khi trình bày ý tưởng hoặc hỗ trợ đọc bản vẽ. Khi vẽ cần chú ý hệ trục, hệ số biến dạng và cách dựng các kích thước theo trục.',
    objectives: [
      'Nêu được tác dụng của hình chiếu trục đo trong biểu diễn vật thể.',
      'Nhận biết được đặc điểm cơ bản của hình chiếu trục đo vuông góc đều và xiên góc cân.',
      'Phác được hình chiếu trục đo của vật thể đơn giản từ các kích thước cho trước.',
    ],
    key_points: [
      'Hình chiếu trục đo giúp hình dung nhanh dạng 3D của vật thể trên mặt phẳng bản vẽ.',
      'Cần chọn hệ trục và hệ số biến dạng phù hợp để hình vẽ cân đối, đúng quy ước.',
      'Hình trục đo hỗ trợ đọc hiểu vật thể nhưng không thay thế hoàn toàn hệ hình chiếu vuông góc trong bản vẽ kĩ thuật.',
    ],
    application: [
      'Dựng hình chiếu trục đo của một khối hộp có rãnh hoặc lỗ đơn giản.',
      'So sánh ưu điểm của hình trục đo với ba hình chiếu vuông góc khi trình bày ý tưởng.',
    ],
  },
  {
    id: 205,
    course_id: 2,
    title: 'Bài 12. Hình chiếu phối cảnh',
    description: 'Tìm hiểu biểu diễn không gian gần với thị giác trong kiến trúc và thiết kế sản phẩm.',
    flow: 'drawing',
    summary: 'Hình chiếu phối cảnh tạo hình ảnh giống cách mắt người quan sát: vật ở xa trông nhỏ hơn, các đường song song có thể hội tụ về điểm tụ. Dạng biểu diễn này thường dùng trong kiến trúc, nội thất, mĩ thuật công nghiệp và trình bày ý tưởng sản phẩm. Học sinh cần nhận biết đường chân trời, điểm tụ, phối cảnh một điểm tụ và hai điểm tụ.',
    objectives: [
      'Nêu được đặc điểm của hình chiếu phối cảnh.',
      'Phân biệt được phối cảnh một điểm tụ và hai điểm tụ trong tình huống đơn giản.',
      'Ứng dụng phối cảnh để trình bày ý tưởng không gian hoặc sản phẩm.',
    ],
    key_points: [
      'Hình chiếu phối cảnh tạo cảm giác xa gần gần với quan sát thực tế.',
      'Đường chân trời và điểm tụ là yếu tố quan trọng để dựng hình phối cảnh.',
      'Phối cảnh giúp truyền đạt ý tưởng thiết kế dễ hiểu với người không chuyên đọc bản vẽ kĩ thuật.',
    ],
    application: [
      'Phác phối cảnh một điểm tụ của một căn phòng hoặc hành lang đơn giản.',
      'Quan sát ảnh kiến trúc và xác định đường chân trời, điểm tụ chính.',
    ],
  },
  {
    id: 206,
    course_id: 2,
    title: 'Bài 13. Biểu diễn ren',
    description: 'Đọc và biểu diễn ren theo quy ước trong các chi tiết lắp ghép.',
    flow: 'drawing',
    summary: 'Ren là dạng kết cấu dùng nhiều trong bulông, đai ốc, vít, trục ren để lắp ghép, truyền lực hoặc truyền chuyển động. Vì hình dạng xoắn của ren phức tạp, bản vẽ kĩ thuật dùng quy ước nét vẽ để biểu diễn nhanh và rõ. Bài học giúp phân biệt ren ngoài, ren trong, đường đỉnh ren, đường chân ren, giới hạn ren và cách ghi kí hiệu ren.',
    objectives: [
      'Nêu được công dụng của ren trong lắp ghép và truyền chuyển động.',
      'Nhận biết được ren ngoài, ren trong và cách biểu diễn quy ước trên bản vẽ.',
      'Đọc được một số kí hiệu ren cơ bản.',
    ],
    key_points: [
      'Ren được dùng để lắp ghép tháo được, điều chỉnh vị trí, kẹp chặt hoặc truyền chuyển động.',
      'Bản vẽ ren dùng quy ước nét liền đậm, nét liền mảnh và giới hạn ren thay vì vẽ đầy đủ đường xoắn.',
      'Cần phân biệt ren ngoài, ren trong và các thông số cơ bản để đọc đúng chi tiết lắp ghép.',
    ],
    application: [
      'Quan sát bulông - đai ốc và chỉ ra phần ren ngoài, ren trong.',
      'Đọc một hình biểu diễn quy ước ren và mô tả chi tiết tương ứng.',
    ],
  },
  {
    id: 207,
    course_id: 2,
    title: 'Bài 14. Bản vẽ cơ khí',
    description: 'Đọc bản vẽ chi tiết và bản vẽ lắp trong cơ khí.',
    flow: 'drawing',
    summary: 'Bản vẽ cơ khí dùng trong thiết kế, chế tạo, kiểm tra và lắp ráp máy móc. Bản vẽ chi tiết thể hiện đầy đủ hình dạng, kích thước, vật liệu, yêu cầu kĩ thuật của một chi tiết để chế tạo. Bản vẽ lắp thể hiện vị trí, quan hệ lắp ghép và nguyên lí làm việc của cụm chi tiết. Đọc bản vẽ cơ khí cần đi theo trình tự: khung tên, hình biểu diễn, kích thước, yêu cầu kĩ thuật, bảng kê.',
    objectives: [
      'Phân biệt được bản vẽ chi tiết và bản vẽ lắp.',
      'Nêu được nội dung chính của bản vẽ cơ khí.',
      'Đọc được thông tin cơ bản từ bản vẽ chi tiết hoặc bản vẽ lắp đơn giản.',
    ],
    key_points: [
      'Bản vẽ chi tiết cung cấp thông tin để chế tạo và kiểm tra một chi tiết riêng lẻ.',
      'Bản vẽ lắp thể hiện vị trí, quan hệ và cách phối hợp giữa các chi tiết trong một cụm máy.',
      'Đọc bản vẽ cơ khí cần kết hợp hình biểu diễn, kích thước, bảng kê, vật liệu và yêu cầu kĩ thuật.',
    ],
    application: [
      'Đọc khung tên và bảng kê của một bản vẽ lắp đơn giản.',
      'Chỉ ra chi tiết nào cần chế tạo riêng và chi tiết nào là chi tiết tiêu chuẩn.',
    ],
  },
  {
    id: 208,
    course_id: 2,
    title: 'Bài 15. Bản vẽ xây dựng',
    description: 'Nhận biết mặt bằng, mặt đứng, mặt cắt và kí hiệu trong bản vẽ xây dựng.',
    flow: 'drawing',
    summary: 'Bản vẽ xây dựng dùng để thiết kế, thi công và quản lí công trình. Một bộ bản vẽ thường có mặt bằng, mặt đứng, mặt cắt và các kí hiệu quy ước như tường, cửa, cầu thang, vật liệu. Mặt bằng cho biết cách bố trí không gian; mặt đứng cho biết hình dáng bên ngoài; mặt cắt thể hiện cấu tạo theo chiều cao. Đọc bản vẽ cần chú ý tỉ lệ và kích thước.',
    objectives: [
      'Nêu được vai trò của bản vẽ xây dựng trong thiết kế và thi công công trình.',
      'Phân biệt được mặt bằng, mặt đứng và mặt cắt.',
      'Đọc được một số kí hiệu và kích thước cơ bản trên bản vẽ nhà đơn giản.',
    ],
    key_points: [
      'Bản vẽ xây dựng truyền đạt thông tin về bố trí không gian, hình dáng, kích thước và cấu tạo công trình.',
      'Mặt bằng, mặt đứng, mặt cắt bổ sung cho nhau để người đọc hình dung đầy đủ ngôi nhà hoặc công trình.',
      'Đọc bản vẽ xây dựng cần chú ý tỉ lệ, kích thước, kí hiệu cửa, tường, cầu thang, cao độ và vật liệu.',
    ],
    application: [
      'Đọc mặt bằng một phòng học hoặc căn nhà đơn giản và chỉ ra cửa, tường, kích thước chính.',
      'Phác sơ đồ bố trí một phòng chức năng theo tỉ lệ tương đối.',
    ],
  },
  {
    id: 209,
    course_id: 2,
    title: 'Bài 16. Vẽ kĩ thuật với sự trợ giúp của máy tính',
    description: 'Khai thác phần mềm CAD để tạo, sửa, lưu trữ và chia sẻ bản vẽ.',
    flow: 'drawing',
    summary: 'Máy tính và phần mềm CAD hỗ trợ người học, kĩ sư, kiến trúc sư tạo bản vẽ nhanh, chính xác và dễ chỉnh sửa. CAD cho phép vẽ đường, hình, ghi kích thước, quản lí lớp, sao chép, hiệu chỉnh, lưu trữ và xuất bản vẽ. Tuy vậy, người dùng vẫn phải hiểu tiêu chuẩn bản vẽ và nguyên lí biểu diễn kĩ thuật để bản vẽ đúng, rõ, có thể dùng trong sản xuất hoặc thi công.',
    objectives: [
      'Nêu được ưu điểm của vẽ kĩ thuật bằng máy tính.',
      'Nhận biết được một số thao tác cơ bản trong phần mềm CAD.',
      'Hiểu rằng sử dụng CAD vẫn phải tuân thủ tiêu chuẩn trình bày bản vẽ kĩ thuật.',
    ],
    key_points: [
      'CAD giúp tăng tốc độ vẽ, sửa, sao chép, quản lí lớp, ghi kích thước và chia sẻ bản vẽ.',
      'Bản vẽ tạo bằng máy tính vẫn phải đúng tiêu chuẩn về nét vẽ, tỉ lệ, kích thước, kí hiệu và khung tên.',
      'Năng lực CAD là nền tảng quan trọng trong thiết kế, chế tạo, xây dựng và sản xuất hiện đại.',
    ],
    application: [
      'Thực hành vẽ một hình đơn giản bằng công cụ đường thẳng, hình chữ nhật, đường tròn và ghi kích thước.',
      'So sánh thao tác sửa bản vẽ trên giấy và trên phần mềm CAD.',
    ],
  },
  {
    id: 301,
    course_id: 3,
    title: 'Bài 17. Khái quát về thiết kế kĩ thuật',
    description: 'Hiểu thiết kế kĩ thuật là hoạt động giải quyết vấn đề bằng giải pháp, sản phẩm hoặc hệ thống kĩ thuật.',
    flow: 'design',
    summary: 'Thiết kế kĩ thuật là quá trình tạo ra hoặc cải tiến sản phẩm, quy trình, hệ thống nhằm đáp ứng nhu cầu con người trong điều kiện cụ thể. Hoạt động thiết kế bắt đầu từ vấn đề thực tiễn, yêu cầu người thiết kế phân tích nhu cầu, đề xuất phương án, thử nghiệm và hoàn thiện. Một thiết kế tốt cần cân bằng công năng, an toàn, thẩm mĩ, chi phí, khả năng chế tạo và tác động môi trường.',
    objectives: [
      'Nêu được khái niệm và vai trò của thiết kế kĩ thuật.',
      'Nhận biết được đối tượng và sản phẩm của hoạt động thiết kế kĩ thuật.',
      'Phân tích được một ví dụ thiết kế từ nhu cầu đến giải pháp.',
    ],
    key_points: [
      'Thiết kế kĩ thuật xuất phát từ nhu cầu hoặc vấn đề thực tế và hướng tới giải pháp có thể kiểm chứng.',
      'Kết quả thiết kế có thể là sản phẩm, quy trình, hệ thống, mô hình hoặc phương án cải tiến.',
      'Thiết kế tốt cần đáp ứng đồng thời công năng, an toàn, thẩm mĩ, chi phí, vật liệu, chế tạo và môi trường.',
    ],
    application: [
      'Chọn một vật dụng học tập và phân tích nhu cầu đã dẫn tới thiết kế của nó.',
      'Đề xuất một cải tiến nhỏ cho sản phẩm quen thuộc để tiện dụng hoặc an toàn hơn.',
    ],
  },
  {
    id: 302,
    course_id: 3,
    title: 'Bài 18. Quy trình thiết kế kĩ thuật',
    description: 'Thực hành quy trình xác định vấn đề, nghiên cứu, đề xuất, chọn phương án, tạo mẫu, thử nghiệm và cải tiến.',
    flow: 'design',
    summary: 'Quy trình thiết kế kĩ thuật là chuỗi hoạt động có thể lặp lại: xác định vấn đề, tìm hiểu thông tin, xác lập yêu cầu, đề xuất phương án, lựa chọn phương án, tạo mẫu, thử nghiệm, đánh giá và hoàn thiện. Quy trình không phải đường thẳng cố định; khi thử nghiệm phát hiện lỗi, nhóm thiết kế cần quay lại điều chỉnh yêu cầu hoặc phương án.',
    objectives: [
      'Trình bày được các bước cơ bản của quy trình thiết kế kĩ thuật.',
      'Giải thích được vì sao thiết kế thường cần thử nghiệm và cải tiến lặp lại.',
      'Vận dụng được quy trình thiết kế vào một nhiệm vụ học tập đơn giản.',
    ],
    key_points: [
      'Quy trình thiết kế bắt đầu từ xác định đúng vấn đề và yêu cầu, không bắt đầu ngay bằng việc làm sản phẩm.',
      'Đề xuất nhiều phương án giúp tăng khả năng tìm được giải pháp phù hợp nhất với tiêu chí đã đặt ra.',
      'Thử nghiệm và đánh giá cung cấp dữ liệu để cải tiến thiết kế thay vì sửa theo cảm tính.',
    ],
    application: [
      'Lập quy trình thiết kế giá đỡ điện thoại hoặc hộp đựng dụng cụ học tập.',
      'Tạo bảng tiêu chí đánh giá mẫu thử: độ bền, kích thước, an toàn, chi phí, thẩm mĩ.',
    ],
  },
  {
    id: 303,
    course_id: 3,
    title: 'Bài 19. Những yếu tố ảnh hưởng đến thiết kế kĩ thuật',
    description: 'Phân tích yêu cầu người dùng, điều kiện sử dụng, vật liệu, công nghệ, kinh tế, thẩm mĩ, an toàn và môi trường.',
    flow: 'design',
    summary: 'Thiết kế kĩ thuật chịu ảnh hưởng bởi nhiều yếu tố: nhu cầu người dùng, điều kiện sử dụng, vật liệu, công nghệ chế tạo, chi phí, thẩm mĩ, tiêu chuẩn an toàn, môi trường và văn hoá xã hội. Nếu bỏ qua một yếu tố quan trọng, sản phẩm có thể hoạt động được nhưng khó sử dụng, khó chế tạo, quá đắt hoặc không an toàn. Bài học rèn cách nhìn thiết kế như một bài toán có nhiều ràng buộc.',
    objectives: [
      'Kể tên được các nhóm yếu tố ảnh hưởng tới thiết kế kĩ thuật.',
      'Phân tích được tác động của từng yếu tố trong một sản phẩm cụ thể.',
      'Biết cân nhắc và ưu tiên tiêu chí khi lựa chọn phương án thiết kế.',
    ],
    key_points: [
      'Nhu cầu người dùng và điều kiện sử dụng quyết định sản phẩm cần giải quyết vấn đề gì và hoạt động trong bối cảnh nào.',
      'Vật liệu, công nghệ chế tạo và chi phí ảnh hưởng trực tiếp tới khả năng tạo ra sản phẩm.',
      'An toàn, môi trường, thẩm mĩ và văn hoá xã hội giúp thiết kế phù hợp hơn với con người và cộng đồng.',
    ],
    application: [
      'Phân tích các yếu tố ảnh hưởng khi thiết kế ghế học sinh hoặc bình nước cá nhân.',
      'Xếp hạng tiêu chí quan trọng nhất cho một sản phẩm dùng trong trường học và giải thích lí do.',
    ],
  },
  {
    id: 304,
    course_id: 3,
    title: 'Bài 20. Nguyên tắc thiết kế kĩ thuật',
    description: 'Vận dụng các nguyên tắc: đáp ứng nhu cầu, đơn giản, an toàn, tin cậy, tiết kiệm và thân thiện môi trường.',
    flow: 'design',
    summary: 'Nguyên tắc thiết kế là các định hướng giúp phương án trở nên hữu ích, an toàn và có khả năng triển khai. Một sản phẩm cần đáp ứng đúng nhu cầu, có cấu tạo hợp lí, dễ sử dụng, tin cậy, an toàn, tiết kiệm vật liệu - năng lượng, thuận lợi bảo trì và hạn chế tác động xấu tới môi trường. Các nguyên tắc này cần được vận dụng linh hoạt tùy nhiệm vụ thiết kế.',
    objectives: [
      'Nêu được một số nguyên tắc cơ bản trong thiết kế kĩ thuật.',
      'Giải thích được vai trò của nguyên tắc an toàn, tin cậy, tiết kiệm và thân thiện môi trường.',
      'Đánh giá được phương án thiết kế dựa trên các nguyên tắc đã học.',
    ],
    key_points: [
      'Thiết kế phải xuất phát từ nhu cầu thực, tránh thêm chức năng không cần thiết làm sản phẩm phức tạp và tốn kém.',
      'An toàn, tin cậy và dễ sử dụng là nguyên tắc quan trọng khi sản phẩm tương tác với con người.',
      'Tiết kiệm tài nguyên, dễ bảo trì và thân thiện môi trường giúp thiết kế bền vững hơn.',
    ],
    application: [
      'Đánh giá một sản phẩm học tập theo các nguyên tắc thiết kế đã học.',
      'Đề xuất cách cải tiến để sản phẩm đơn giản, an toàn hoặc tiết kiệm hơn.',
    ],
  },
  {
    id: 305,
    course_id: 3,
    title: 'Bài 21. Phương pháp, phương tiện hỗ trợ thiết kế kĩ thuật',
    description: 'Sử dụng phác thảo, sơ đồ, mô hình, CAD, mô phỏng, in 3D và làm việc nhóm để hỗ trợ thiết kế.',
    flow: 'design',
    summary: 'Để thiết kế hiệu quả, người học cần biết dùng nhiều phương pháp và phương tiện hỗ trợ. Phác thảo, sơ đồ tư duy, sơ đồ khối giúp hình thành và trao đổi ý tưởng nhanh. Mô hình, mẫu thử, CAD, mô phỏng và in 3D giúp kiểm tra hình dạng, kích thước, khả năng lắp ráp và hoạt động trước khi làm sản phẩm thật. Làm việc nhóm và ghi chép thiết kế giúp quá trình cải tiến có căn cứ.',
    objectives: [
      'Nêu được vai trò của phác thảo, mô hình, CAD, mô phỏng và in 3D trong thiết kế.',
      'Lựa chọn được phương tiện hỗ trợ phù hợp với từng giai đoạn thiết kế.',
      'Biết tổ chức thông tin, trao đổi nhóm và ghi nhận phản hồi khi phát triển phương án.',
    ],
    key_points: [
      'Phác thảo và sơ đồ giúp biểu đạt nhanh ý tưởng ở giai đoạn đầu, khi phương án còn cần thay đổi.',
      'CAD, mô phỏng, mô hình và in 3D giúp kiểm tra, tạo mẫu và cải tiến thiết kế dựa trên dữ liệu cụ thể.',
      'Làm việc nhóm, trình bày và phản biện giúp phát hiện lỗi, bổ sung góc nhìn và nâng cao chất lượng sản phẩm.',
    ],
    application: [
      'Chọn phương tiện hỗ trợ phù hợp cho từng bước trong dự án thiết kế một đồ dùng học tập.',
      'Tạo bản phác thảo và mô hình giấy cho một ý tưởng, sau đó ghi phản hồi để cải tiến.',
    ],
  },
  {
    id: 306,
    course_id: 3,
    title: 'Bài 22. Dự án: Thiết kế sản phẩm đơn giản',
    description: 'Vận dụng quy trình thiết kế kĩ thuật để đề xuất, tạo mẫu, thử nghiệm, đánh giá và hoàn thiện một sản phẩm đơn giản.',
    flow: 'design',
    summary: 'Dự án là nhiệm vụ tổng hợp cuối chương. Học sinh lựa chọn một vấn đề gần gũi, xác định yêu cầu và tiêu chí, thu thập thông tin, đề xuất nhiều phương án rồi chọn giải pháp phù hợp. Nhóm tạo bản vẽ hoặc mô hình, làm mẫu, thử nghiệm theo tiêu chí, ghi nhận kết quả và cải tiến. Sản phẩm cuối gồm mẫu hoặc mô hình cùng hồ sơ thiết kế thể hiện rõ quá trình ra quyết định.',
    objectives: [
      'Vận dụng được đầy đủ các bước của quy trình thiết kế kĩ thuật vào một nhiệm vụ thực tế.',
      'Sử dụng được bản phác thảo, mô hình hoặc công cụ số để trình bày và kiểm chứng phương án.',
      'Đánh giá, cải tiến và thuyết trình được sản phẩm dựa trên tiêu chí đã xác định.',
    ],
    key_points: [
      'Vấn đề, người dùng, yêu cầu và tiêu chí đánh giá phải được xác định rõ trước khi tạo sản phẩm.',
      'Cần đề xuất và so sánh nhiều phương án, lựa chọn bằng chứng thay vì chọn theo cảm tính.',
      'Mẫu thử phải được kiểm tra theo tiêu chí về công năng, kích thước, an toàn, chi phí, thẩm mĩ và môi trường.',
      'Hồ sơ thiết kế cần lưu bản phác thảo, vật liệu, tiến trình, kết quả thử nghiệm, phản hồi và thay đổi sau cải tiến.',
    ],
    application: [
      'Thiết kế một sản phẩm đơn giản phục vụ học tập hoặc sinh hoạt như giá đỡ điện thoại, hộp đựng dụng cụ, cầu mô hình hoặc hệ thống tưới nhỏ.',
      'Trưng bày sản phẩm, thuyết trình quá trình thiết kế và tự đánh giá theo bảng tiêu chí của nhóm.',
    ],
  },
]

const data = createKnttLmsData({
  theme: 'design',
  gradeTitle: 'Công nghệ 10 - Thiết kế và công nghệ',
  courseSpecs,
  lessonSpecs,
  assessmentPrefix: 'kntt10',
  defaultTitle: 'Công nghệ 10',
})

export const canhDieuCourses = data.courses
export const canhDieuLessons = data.lessons
export const canhDieuQuestions = data.questions
export const canhDieuActivities = data.activities
export const chapterAssessments = data.chapterAssessments
