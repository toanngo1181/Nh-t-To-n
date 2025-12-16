
export enum Role {
  LEARNER = 'LEARNER',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN'
}

export enum ContentType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  QUIZ = 'QUIZ'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export enum ActivityType {
  LESSON_VIEW = 'LESSON_VIEW',
  QUIZ_ATTEMPT = 'QUIZ_ATTEMPT'
}

export interface ActivityLog {
  id: string;
  userId: string;
  courseId: string;
  itemId: string; // lessonId or quiz level identifier
  itemName: string; // Lesson title or "Quiz Level X"
  type: ActivityType;
  timestamp: string;
  metadata?: {
    score?: number; // For quizzes
    passed?: boolean; // For quizzes
    duration?: number; // Time spent (seconds) - optional
    note?: string;
  };
}

export interface Enrollment {
  courseId: string;
  level: number; // Level hiện tại của học viên trong khóa học này (1-5)
  joinedAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu (cho mock data)
  email: string;
  role: Role;
  avatar: string;
  department: string;
  // currentLevel: number; // REMOVED: Không dùng level chung nữa
  // registeredCourseIds: string[]; // REMOVED: Thay bằng enrollments
  enrollments: Enrollment[]; // Theo dõi tiến độ từng khóa học
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: string[]; // For Multiple Choice (A, B, C, D)
  correctAnswer: string; // For MC: "A", "B", "C", "D". For Short Answer: The answer text.
  correctAnswerText?: string; // Explanation or detailed answer (Column 10 in CSV)
  level?: number;        // Cấp độ của câu hỏi
  courseId?: string;     // ID của khóa học/chủ đề liên quan
  topicName?: string;    // Tên chủ đề (để map từ CSV)
}

export interface Lesson {
  id: string;
  title: string;
  type: ContentType;
  duration: string; 
  url?: string; 
  isCompleted: boolean;
  level: number; // 1-5 required to access
}

export interface Topic {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: number; // Tổng số level của khóa học (thường là 5)
  instructor: string;
  topics: Topic[];
  progress: number; 
  totalStudents: number;
  category: string;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  date: string;
}

export interface CertificateData {
  id: string;
  courseName: string;
  studentName: string;
  date: string;
  verificationCode: string;
}

export interface CertificateConfig {
  backgroundImage: string; // URL hoặc Base64
  issuerName: string;      // Tên người cấp (VD: TS. Phạm Văn B)
  issuerTitle: string;     // Chức vụ (VD: GIÁM ĐỐC ĐÀO TẠO)
  signatureImage: string;  // URL hoặc Base64 chữ ký
}

export interface QuizTimeConfig {
    [level: number]: number; // Level (1-5) -> Minutes per question
}