import { Course, ContentType, Role, User, Question, QuestionType, Topic, Lesson } from './types';

// --- NGƯỜI DÙNG GIẢ LẬP ---
export const MOCK_USERS: User[] = [
  {
    id: 'admin_01',
    name: 'Quản Trị Viên',
    username: 'admin',
    password: '12345',
    email: 'admin@vinhtan.com',
    role: Role.ADMIN,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=0056b3&color=fff',
    department: 'Ban Quản Trị',
    enrollments: [] // Admin không học
  },
  {
    id: 'user_01',
    name: 'Nguyễn Văn A',
    username: 'hocvien',
    password: '123',
    email: 'a.nguyen@vinhtan.com',
    role: Role.LEARNER,
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+A&background=random',
    department: 'Trại Heo Số 5',
    // --- QUAN TRỌNG: Level được quản lý riêng cho từng khóa học ---
    enrollments: [
        { courseId: 'course_01', level: 2, joinedAt: '2023-10-01' }, // Khóa 1 đang học Level 2
        { courseId: 'course_02', level: 1, joinedAt: '2023-10-05' }  // Khóa 2 mới bắt đầu Level 1
    ]
  },
  {
    id: 'inst_01',
    name: 'TS. Phạm Văn B',
    username: 'giangvien',
    password: '123',
    email: 'b.pham@vinhtan.com',
    role: Role.INSTRUCTOR,
    avatar: 'https://ui-avatars.com/api/?name=Pham+B&background=e67e22&color=fff',
    department: 'Phòng Kỹ Thuật',
    enrollments: []
  }
];

export const CURRENT_USER: User = MOCK_USERS[1]; 

// --- DỮ LIỆU CÂU HỎI THỰC TẾ (CHO KHÓA 1 - FULL 5 LEVEL) ---
const REAL_QUESTIONS_COURSE_1: Question[] = [
  // LEVEL 1: CƠ BẢN
  {
    id: 101, text: "Mục đích chính của việc tiêm vaccine cho heo là gì?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Chữa bệnh đang mắc phải", "Kích thích sinh kháng thể phòng bệnh", "Tăng trọng nhanh", "Giảm mùi hôi chuồng trại"],
    correctAnswer: "B", correctAnswerText: "Vaccine giúp cơ thể heo sinh ra kháng thể đặc hiệu để chống lại mầm bệnh khi xâm nhập.",
    level: 1, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 102, text: "Nhiệt độ bảo quản vaccine sống nhược độc tiêu chuẩn là bao nhiêu?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["2°C - 8°C", "Nhiệt độ phòng (25°C)", "Dưới 0°C (Đông đá)", "37°C"],
    correctAnswer: "A", correctAnswerText: "Vaccine cần bảo quản lạnh ở 2-8 độ C để đảm bảo hoạt lực.",
    level: 1, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 103, text: "Trước khi tiêm vaccine, cần kiểm tra yếu tố nào của heo?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Chỉ cần kiểm tra cân nặng", "Sức khỏe tổng thể (Heo phải khỏe mạnh)", "Màu sắc lông", "Không cần kiểm tra"],
    correctAnswer: "B", correctAnswerText: "Chỉ tiêm vaccine cho heo khỏe mạnh. Heo ốm sẽ không đáp ứng miễn dịch tốt và có thể bị stress nặng hơn.",
    level: 1, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 104, text: "Vị trí tiêm vaccine phổ biến nhất trên heo là?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Tiêm bắp cổ (sau gốc tai)", "Tiêm mông", "Tiêm tĩnh mạch tai", "Tiêm xoang bụng"],
    correctAnswer: "A", correctAnswerText: "Tiêm bắp cổ sau gốc tai là vị trí an toàn và phổ biến nhất.",
    level: 1, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 105, text: "Định nghĩa ngắn gọn về kháng nguyên trong vaccine.", type: QuestionType.SHORT_ANSWER, options: [],
    correctAnswer: "Là thành phần kích thích cơ thể sinh kháng thể", correctAnswerText: "Kháng nguyên là chất lạ (vi khuẩn/virus đã xử lý) kích thích hệ miễn dịch.",
    level: 1, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  
  // LEVEL 2: KỸ THUẬT TIÊM & BẢO QUẢN
  {
    id: 201, text: "Vaccine nhược độc (sống) khác vaccine vô hoạt (chết) ở điểm nào cơ bản nhất?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Giá thành đắt hơn", "Vi sinh vật còn sống nhưng bị làm yếu đi", "Không cần bảo quản lạnh", "Liều lượng tiêm nhiều hơn"],
    correctAnswer: "B", correctAnswerText: "Vaccine nhược độc chứa vi sinh vật sống đã được làm yếu đi.",
    level: 2, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 202, text: "Bệnh nào sau đây KHÔNG PHẢI là bệnh phổ biến cần tiêm phòng bắt buộc trên heo nái?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Lở mồm long móng (FMD)", "Dịch tả heo (CSF)", "Parvo (Thai gỗ)", "Cảm nắng"],
    correctAnswer: "D", level: 2, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 203, text: "Khi pha vaccine đông khô, thời gian sử dụng tối đa khuyến cáo là bao lâu?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["24 giờ", "12 giờ", "2-4 giờ", "Dùng lúc nào cũng được"],
    correctAnswer: "C", correctAnswerText: "Sau khi pha, vaccine sống mất hoạt lực rất nhanh, nên dùng hết trong 2-4 giờ.",
    level: 2, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 204, text: "Phản ứng phụ thường gặp nhất sau khi tiêm vaccine là gì?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Sốc phản vệ chết ngay lập tức", "Sốt nhẹ, giảm ăn 1-2 bữa", "Gãy chân", "Rụng lông"],
    correctAnswer: "B", correctAnswerText: "Heo thường sốt nhẹ và mệt mỏi do hệ miễn dịch đang hoạt động.",
    level: 2, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 205, text: "Tại sao không nên tiêm kháng sinh cùng lúc với vaccine vi khuẩn sống?", type: QuestionType.SHORT_ANSWER, options: [],
    correctAnswer: "Kháng sinh sẽ tiêu diệt vi khuẩn trong vaccine", correctAnswerText: "Kháng sinh sẽ diệt vi khuẩn nhược độc làm mất tác dụng vaccine.",
    level: 2, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },

  // LEVEL 3: CƠ CHẾ MIỄN DỊCH CHUYÊN SÂU
  {
    id: 301, text: "Kháng thể mẹ truyền (Maternal Antibody) ảnh hưởng thế nào đến lịch tiêm phòng heo con?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Không ảnh hưởng", "Trung hòa vaccine nếu tiêm quá sớm", "Làm vaccine hiệu quả hơn", "Gây sốt cao"],
    correctAnswer: "B", correctAnswerText: "Kháng thể mẹ truyền cao sẽ trung hòa virus vaccine, làm mất tác dụng nếu tiêm quá sớm.",
    level: 3, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 302, text: "Hiện tượng 'Cửa sổ miễn dịch' là gì?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Giai đoạn heo miễn dịch tốt nhất", "Giai đoạn kháng thể mẹ giảm nhưng kháng thể vaccine chưa đủ bảo hộ", "Giai đoạn không được tiêm vaccine", "Giai đoạn heo ngủ nhiều"],
    correctAnswer: "B", correctAnswerText: "Đây là giai đoạn rủi ro cao khi heo con dễ nhiễm bệnh do lỗ hổng miễn dịch.",
    level: 3, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 303, text: "Thuật ngữ 'Seroconversion' (Chuyển đổi huyết thanh) nghĩa là gì?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Sự thay đổi màu máu", "Sự xuất hiện kháng thể trong máu sau khi tiêm/nhiễm bệnh", "Heo bị mất máu", "Phản ứng dị ứng"],
    correctAnswer: "B", level: 3, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 304, text: "Trong miễn dịch học, tế bào nhớ (Memory Cells) có vai trò gì?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Tiêu diệt vi khuẩn trực tiếp", "Ghi nhớ mầm bệnh để đáp ứng nhanh hơn trong lần tái nhiễm", "Vận chuyển oxy", "Đông máu"],
    correctAnswer: "B", level: 3, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 305, text: "Adjuvant (chất bổ trợ) trong vaccine vô hoạt có tác dụng chính là gì?", type: QuestionType.SHORT_ANSWER, options: [],
    correctAnswer: "Kéo dài thời gian tồn tại và tăng cường đáp ứng miễn dịch", correctAnswerText: "Chất bổ trợ giúp giữ kháng nguyên lâu hơn và kích thích hệ miễn dịch mạnh hơn.",
    level: 3, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },

  // LEVEL 4: QUẢN LÝ VÀ XÂY DỰNG LỊCH TIÊM
  {
    id: 401, text: "Khi xây dựng lịch tiêm phòng, yếu tố nào quan trọng nhất cần xem xét đầu tiên?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Giá vaccine rẻ nhất", "Tình hình dịch tễ tại trại và khu vực", "Sở thích của chủ trại", "Màu sắc vaccine"],
    correctAnswer: "B", correctAnswerText: "Phải dựa vào dịch tễ để biết trại đang có áp lực mầm bệnh gì.",
    level: 4, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 402, text: "Lý do chính cần tiêm nhắc lại (Booster shot) đối với vaccine chết là gì?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Để tiêu hết vaccine thừa", "Để tăng cường nồng độ kháng thể và tạo trí nhớ miễn dịch dài hạn", "Do vaccine lần 1 luôn hỏng", "Để heo quen với kim tiêm"],
    correctAnswer: "B", level: 4, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 403, text: "Quy trình 'Dây chuyền lạnh' (Cold Chain) bị phá vỡ sẽ dẫn đến hậu quả gì nghiêm trọng nhất?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Mất nhãn chai", "Hư hỏng vaccine và thất bại tiêm phòng", "Chai vaccine bị ướt", "Kim tiêm bị rỉ sét"],
    correctAnswer: "B", level: 4, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 404, text: "Khi nhập heo hậu bị mới về, cần cách ly và tiêm phòng (Acclimatization) trong bao lâu tối thiểu?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["1 tuần", "4-8 tuần", "2 ngày", "Không cần cách ly"],
    correctAnswer: "B", correctAnswerText: "Cần 4-8 tuần để tiêm đủ vaccine và cho heo thích nghi với mầm bệnh trại mới.",
    level: 4, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 405, text: "Nêu 2 nguyên nhân quản lý khiến vaccine bị thất bại (Vaccine Failure).", type: QuestionType.SHORT_ANSWER, options: [],
    correctAnswer: "Bảo quản sai nhiệt độ, tiêm sai kỹ thuật, tiêm sai thời điểm", correctAnswerText: "Lỗi phổ biến: Tủ lạnh hỏng, tiêm vào mỡ, tiêm khi heo đang bệnh.",
    level: 4, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },

  // LEVEL 5: XỬ LÝ TÌNH HUỐNG & NÂNG CAO
  {
    id: 501, text: "Tình huống: Sau khi tiêm vaccine FMD, 10% heo trong đàn bị sốc phản vệ (nôn mửa, tím tái). Xử lý cấp cứu ưu tiên là gì?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Tiêm thêm vaccine", "Tiêm Epinephrine (Adrenaline) và Cafein", "Tắm nước lạnh", "Cho nhịn ăn"],
    correctAnswer: "B", correctAnswerText: "Epinephrine chống sốc tim mạch, Cafein trợ tim là phác đồ cấp cứu sốc phản vệ.",
    level: 5, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 502, text: "Trại đang nổ dịch Tai xanh (PRRS). Có nên tiêm vaccine PRRS đè vào ổ dịch không?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Tuyệt đối không", "Có thể (An toàn sinh học và tiêm bao vây)", "Tiêm tất cả các loại vaccine khác", "Bán hết heo ngay"],
    correctAnswer: "B", correctAnswerText: "Đây là chiến lược rủi ro nhưng cần thiết: Tiêm để tạo miễn dịch đồng đều (Mass vaccination) nhưng cần tư vấn chuyên gia.",
    level: 5, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 503, text: "Tại sao vaccine DIVA lại quan trọng trong các chương trình thanh lọc bệnh?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Vì nó rẻ", "Vì nó giúp phân biệt heo tiêm phòng và heo nhiễm bệnh tự nhiên", "Vì nó không cần tiêm", "Vì nó màu xanh"],
    correctAnswer: "B", level: 5, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 504, text: "Đánh giá hiệu quả tiêm phòng bằng phương pháp lấy máu kiểm tra ELISA nên thực hiện khi nào?", type: QuestionType.MULTIPLE_CHOICE,
    options: ["Ngay sau khi tiêm", "3-4 tuần sau mũi tiêm cuối cùng", "1 năm sau", "Trước khi tiêm"],
    correctAnswer: "B", correctAnswerText: "Cần 3-4 tuần để nồng độ kháng thể đạt đỉnh.",
    level: 5, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
  {
    id: 505, text: "Phân tích: Tại sao tiêm vaccine E.coli cho nái lại phòng được tiêu chảy cho heo con?", type: QuestionType.SHORT_ANSWER, options: [],
    correctAnswer: "Truyền kháng thể qua sữa đầu (IgA, IgG)", correctAnswerText: "Mẹ sinh kháng thể, tập trung vào sữa đầu. Heo con bú sữa đầu sẽ nhận được kháng thể bảo hộ ruột.",
    level: 5, topicName: "Vaccine & Chương trình tiêm phòng", courseId: 'course_01'
  },
];

// --- DANH SÁCH 37 CHỦ ĐỀ MẪU (Tên thực tế) ---
const COURSE_TITLES = [
  "Vaccine & Chương trình tiêm phòng",
  "Phác đồ điều trị bệnh hô hấp",
  "An toàn sinh học trại heo",
  "Kỹ thuật úm heo con",
  "Dinh dưỡng heo thịt giai đoạn 1",
  "Dinh dưỡng heo thịt giai đoạn 2",
  "Quản lý nái mang thai",
  "Kỹ thuật đỡ đẻ & Chăm sóc sơ sinh",
  "Kiểm soát dịch tả heo Châu Phi (ASF)",
  "Xử lý chất thải & Biogas",
  "Quản lý nhân sự trại",
  "Kỹ thuật thụ tinh nhân tạo",
  "Chẩn đoán bệnh qua mổ khám",
  "Sử dụng kháng sinh hiệu quả",
  "Vận hành hệ thống làm mát (Cooling pad)",
  "Quản lý kho cám & thuốc",
  "Kỹ năng ghi chép nhật ký trại",
  "Phòng bệnh E.coli sưng phù đầu",
  "Kiểm soát bệnh Lở mồm long móng (FMD)",
  "Kỹ thuật thiến hoạn & bấm nanh",
  "Nhận biết & Điều trị PED",
  "Dinh dưỡng cho nái nuôi con",
  "Kỹ thuật cai sữa heo con",
  "Quản lý nước uống trong chăn nuôi",
  "An toàn lao động trong trại",
  "Quy trình sát trùng xe vận chuyển",
  "Kiểm soát nội/ngoại ký sinh trùng",
  "Bệnh Circo Virus (PCV2)",
  "Bệnh Tai xanh (PRRS) & Kiểm soát",
  "Tối ưu hóa chỉ số FCR",
  "Kỹ năng quản lý đội nhóm",
  "Bảo trì thiết bị chăn nuôi",
  "Quy trình nhập heo hậu bị",
  "Xử lý xác heo bệnh an toàn",
  "Luật chăn nuôi & Quy định thú y",
  "Ứng dụng công nghệ 4.0 trong trại",
  "Phân tích dữ liệu sản xuất"
];

const CATEGORIES = ['Kỹ thuật', 'Vận hành', 'An toàn', 'Quản lý', 'Thú y'];
const IMAGES = [
  'https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1584036561566-b93a50208c3c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555685812-4b943f3e9942?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
];

// --- HÀM SINH DỮ LIỆU TỰ ĐỘNG ---
const generateData = () => {
  const generatedCourses: Course[] = [];
  let generatedQuestions: Question[] = [];

  COURSE_TITLES.forEach((title, index) => {
    const courseId = `course_${(index + 1).toString().padStart(2, '0')}`;
    const category = CATEGORIES[index % CATEGORIES.length];
    
    // 1. Tạo Bài học (Lessons) cho 5 Level
    const lessons: Lesson[] = [];
    for (let level = 1; level <= 5; level++) {
      lessons.push({
        id: `l_${courseId}_${level}`,
        title: `Bài học Level ${level}: Kiến thức ${level === 1 ? 'cơ bản' : level === 5 ? 'nâng cao' : 'chuyên sâu'} về ${title.split(':')[0]}`,
        type: level % 2 === 0 ? ContentType.PDF : ContentType.VIDEO, // Xen kẽ Video/PDF
        duration: level % 2 === 0 ? '5 trang' : '15:00',
        isCompleted: false,
        level: level,
        url: level === 1 && index === 0 ? 'https://www.youtube.com/watch?v=LXb3EKWsInQ' : '' 
      });
    }

    // 2. Tạo Khóa học
    const course: Course = {
      id: courseId,
      title: `${index + 1}. ${title}`,
      description: `Khóa học chuyên sâu về ${title}. Cung cấp kiến thức từ cơ bản đến nâng cao cho nhân viên trại.`,
      thumbnail: IMAGES[index % IMAGES.length],
      level: 5,
      instructor: index % 2 === 0 ? 'TS. Phạm Văn B' : 'ThS. Nguyễn Thị C',
      progress: 0,
      totalStudents: Math.floor(Math.random() * 500) + 50,
      category: category,
      topics: [
        {
          id: `t_${courseId}`,
          title: "Nội dung đào tạo 5 cấp độ",
          lessons: lessons
        }
      ]
    };
    generatedCourses.push(course);

    // 3. Tạo câu hỏi
    // NẾU LÀ COURSE 1 -> DÙNG DỮ LIỆU THẬT (ĐÃ UPDATE FULL 5 LEVEL)
    if (index === 0) {
        generatedQuestions = [...generatedQuestions, ...REAL_QUESTIONS_COURSE_1];
    } 
    // NẾU LÀ CÁC COURSE KHÁC -> SINH DỮ LIỆU GIẢ CHO ĐỦ 5 LEVEL
    else {
        for (let level = 1; level <= 5; level++) {
        for (let q = 1; q <= 5; q++) {
            const isMC = q <= 4; 
            generatedQuestions.push({
            id: parseInt(`${index + 1}${level}${q}`), 
            text: `Câu hỏi ${q} (Level ${level}): Kiểm tra kiến thức về ${title}?`,
            type: isMC ? QuestionType.MULTIPLE_CHOICE : QuestionType.SHORT_ANSWER,
            options: isMC ? [
                `Phương án A cho ${title}`,
                `Phương án B (Đúng) cho ${title}`,
                `Phương án C cho ${title}`,
                `Phương án D cho ${title}`
            ] : [],
            correctAnswer: isMC ? "B" : `Đây là đáp án mẫu cho câu hỏi tự luận về ${title}`,
            correctAnswerText: `Giải thích chi tiết cho kiến thức Level ${level} của chủ đề ${title}.`,
            level: level,
            courseId: courseId,
            topicName: title
            });
        }
        }
    }
  });

  return { courses: generatedCourses, questions: generatedQuestions };
};

const data = generateData();

export const MOCK_COURSES: Course[] = data.courses;
export const SAMPLE_QUESTIONS: Question[] = data.questions;