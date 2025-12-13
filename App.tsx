import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, LayoutDashboard, User as UserIcon, LogOut, 
  Search, Bell, ChevronRight, Play, FileText, CheckCircle, 
  Award, BarChart2, Video, PlusCircle, Settings, Menu, Users, HelpCircle, Shield, Lock, Star, PlayCircle, Trash2, Edit, Download, TrendingUp, Clock, File, ExternalLink, ArrowRight
} from 'lucide-react';
import { MOCK_USERS, MOCK_COURSES, SAMPLE_QUESTIONS } from './constants';
import { Course, Role, Lesson, ContentType, QuizResult, CertificateData, Question, User, Topic, Enrollment } from './types';
import CourseCard from './components/CourseCard';
import QuizModal from './components/QuizModal';
import Certificate from './components/Certificate';
import CourseEditor from './components/CourseEditor';
import QuestionBank from './components/QuestionBank';
import UserManager from './components/UserManager';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- Contexts ---
const AppContext = React.createContext<{
  user: User | null;
  setUser: (u: User) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  role: Role;
  myCourses: Course[];
  allCourses: Course[];
  setAllCourses: (c: Course[]) => void;
  allQuestions: Question[];
  setAllQuestions: (q: Question[]) => void;
  enrollCourse: (c: Course) => void;
  completedLessons: string[];
  completeLesson: (id: string, courseId: string) => void;
  certificates: CertificateData[];
  addCertificate: (c: CertificateData) => void;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  users: [],
  setUsers: () => {},
  role: Role.LEARNER,
  myCourses: [],
  allCourses: [],
  setAllCourses: () => {},
  allQuestions: [],
  setAllQuestions: () => {},
  enrollCourse: () => {},
  completedLessons: [],
  completeLesson: () => {},
  certificates: [],
  addCertificate: () => {},
  logout: () => {}
});

// --- Auth Component ---
const LoginScreen = ({ onLogin }: { onLogin: (u: string, p: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(username.trim() && password.trim()) {
      onLogin(username, password);
    } else {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Brand */}
        <div className="bg-brand-blue p-8 flex flex-col justify-center items-center text-center md:w-2/5">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-brand-blue font-bold text-3xl mb-6 shadow-lg">VT</div>
          <h1 className="text-3xl font-bold text-white font-heading mb-2">VinhTan</h1>
          <h2 className="text-xl text-blue-100 font-light">E-Learning Platform</h2>
          <p className="text-blue-200 text-sm mt-8 opacity-80">Hệ thống đào tạo và quản lý chất lượng chăn nuôi hàng đầu.</p>
        </div>
        
        {/* Right Side: Form */}
        <div className="p-8 md:w-3/5">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Đăng nhập hệ thống</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">Tên đăng nhập</label>
              <input 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block w-full p-3 transition-colors"
                type="text" 
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-xs font-bold mb-2 uppercase tracking-wide">Mật khẩu</label>
              <input 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-blue focus:border-brand-blue block w-full p-3 transition-colors"
                type="password" 
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-brand-blue hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95"
            >
              Đăng nhập
            </button>
            
            <p className="text-xs text-gray-400 text-center mt-4">
                * Chỉ dành cho tài khoản được cấp bởi Admin
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Feature Components (Pages) ---

const Sidebar = () => {
  const { user, logout } = React.useContext(AppContext);
  const location = useLocation();
  const role = user?.role;

  const learnerLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: BookOpen, label: 'Đăng ký Chủ đề', path: '/courses' },
    { icon: Award, label: 'Chứng chỉ', path: '/certificates' },
    { icon: UserIcon, label: 'Hồ sơ', path: '/profile' },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Dashboard Admin', path: '/admin' },
    { icon: Users, label: 'Quản lý Người dùng', path: '/admin/users' },
    { icon: BookOpen, label: 'Quản lý Chủ đề', path: '/admin/courses' },
    { icon: HelpCircle, label: 'Ngân hàng câu hỏi', path: '/admin/questions' },
  ];

  const instructorLinks = [
    { icon: LayoutDashboard, label: 'Dashboard Giảng viên', path: '/admin' }, // Reuse dashboard view
    { icon: Users, label: 'Quản lý Học viên', path: '/admin/users' },
    { icon: BookOpen, label: 'Quản lý Chủ đề', path: '/admin/courses' },
    { icon: HelpCircle, label: 'Ngân hàng câu hỏi', path: '/admin/questions' },
  ];

  let links = learnerLinks;
  if (role === Role.ADMIN) links = adminLinks;
  else if (role === Role.INSTRUCTOR) links = instructorLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-bold">VT</div>
           <span className="font-heading font-bold text-xl text-gray-800">VinhTan<span className="text-brand-blue">Edu</span></span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === link.path 
                ? 'bg-blue-50 text-brand-blue font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <link.icon size={20} />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="bg-gradient-to-r from-brand-blue to-blue-600 rounded-xl p-4 text-white">
          <p className="text-xs opacity-80 mb-1">Vai trò hiện tại:</p>
          <p className="font-bold text-sm">{role === Role.ADMIN ? 'Administrator' : role === Role.INSTRUCTOR ? 'Giảng viên' : 'Học viên'}</p>
        </div>
        <button 
            onClick={logout}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
            <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </div>
  );
};

const Header = () => {
  const { user } = React.useContext(AppContext);
  const role = user?.role;
  
  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 md:hidden">
        <Menu className="text-gray-600" />
        <span className="font-heading font-bold text-lg">VinhTan</span>
      </div>

      <div className="hidden md:flex flex-1 max-w-xl relative mx-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm kiếm..." 
          className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-brand-blue">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{role === Role.ADMIN ? 'Admin User' : user?.name}</p>
            <p className="text-xs text-gray-500">{role === Role.ADMIN ? 'Quản trị hệ thống' : (role === Role.INSTRUCTOR ? 'Giảng viên' : user?.department)}</p>
          </div>
          <img src={user?.avatar} alt="User" className="w-9 h-9 rounded-full border border-gray-200" />
        </div>
      </div>
    </header>
  );
};

// --- LEARNER PAGES ---
const LearnerDashboard = () => {
  const { myCourses, user } = React.useContext(AppContext);
  const navigate = useNavigate();

  const data = [
    { name: 'T2', hours: 2 },
    { name: 'T3', hours: 4 },
    { name: 'T4', hours: 1 },
    { name: 'T5', hours: 3 },
    { name: 'T6', hours: 5 },
    { name: 'T7', hours: 2 },
    { name: 'CN', hours: 0 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-heading font-bold text-gray-800 mb-2">Xin chào, {user?.name} 👋</h1>
            <p className="text-gray-600">Chúc bạn một ngày học tập hiệu quả!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center">
             <BookOpen size={24} />
           </div>
           <div>
             <p className="text-2xl font-bold text-gray-800">{myCourses.length}</p>
             <p className="text-sm text-gray-500">Chủ đề đã đăng ký</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-green-100 text-brand-success flex items-center justify-center">
             <CheckCircle size={24} />
           </div>
           <div>
             <p className="text-2xl font-bold text-gray-800">0</p>
             <p className="text-sm text-gray-500">Khóa học hoàn thành</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
             <Video size={24} />
           </div>
           <div>
             <p className="text-2xl font-bold text-gray-800">12.5h</p>
             <p className="text-sm text-gray-500">Thời gian học tập</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-800">Chủ đề đang học</h2>
             <Link to="/courses" className="text-brand-blue text-sm hover:underline">Đăng ký thêm</Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {myCourses.length > 0 ? (
               myCourses.map(course => {
                 // Determine level for this specific course from user enrollments
                 const enrollment = user?.enrollments.find(e => e.courseId === course.id);
                 const currentLevel = enrollment ? enrollment.level : 1;

                 return (
                    <CourseCard 
                        key={course.id} 
                        course={course} 
                        userLevel={currentLevel}
                        onClick={(id) => navigate(`/course/${id}`)} 
                    />
                 )
               })
             ) : (
               <div className="col-span-2 py-8 text-center bg-white rounded-xl border border-dashed border-gray-300">
                 <p className="text-gray-500 mb-2">Bạn chưa đăng ký chủ đề nào.</p>
                 <Link to="/courses" className="inline-block px-4 py-2 bg-brand-blue text-white rounded">Đăng ký chủ đề ngay</Link>
               </div>
             )}
           </div>
        </div>

        <div>
           <h2 className="text-xl font-bold text-gray-800 mb-4">Hoạt động học tập</h2>
           <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="hours" fill="#0056b3" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

const CourseList = () => {
  const { enrollCourse, myCourses, allCourses, user } = React.useContext(AppContext);
  const navigate = useNavigate();

  const handleCourseClick = (courseId: string) => {
    const course = allCourses.find(c => c.id === courseId);
    if (course) {
       const isEnrolled = user?.enrollments.some(e => e.courseId === courseId);
       
       if (!isEnrolled) {
         if(confirm(`Bạn có muốn đăng ký học "${course.title}" không?`)) {
            enrollCourse(course);
            navigate(`/course/${courseId}`);
         }
       } else {
         navigate(`/course/${courseId}`);
       }
    }
  };

  const handleQuickRegister = (e: React.MouseEvent, course: Course) => {
    // Stop propagation to prevent opening the course detail immediately
    e.stopPropagation();
    e.preventDefault();
    
    // Register directly
    enrollCourse(course);
    
    // NOTE: We do NOT navigate away. 
    // This allows the button to immediately change from "Click to Register" to "Registered" (Green).
    // The user can then see the visual confirmation.
    // Since state is updated, it is also added to the Dashboard automatically.
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-800">Danh mục 37 Chủ đề</h1>
        <p className="text-gray-600">Chọn chủ đề bạn muốn học và nhấn Đăng ký.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
        {['Tất cả', 'Kỹ thuật', 'Vận hành', 'An toàn', 'Quản lý'].map((cat, idx) => (
          <button 
            key={idx} 
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              idx === 0 ? 'bg-brand-blue text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allCourses.map(course => {
            const enrollment = user?.enrollments.find(e => e.courseId === course.id);
            const isEnrolled = !!enrollment;
            
            return (
                <div key={course.id} className="relative group/card cursor-pointer">
                    <CourseCard 
                        course={course} 
                        userLevel={enrollment ? enrollment.level : null}
                        onClick={handleCourseClick} 
                    />
                    {!isEnrolled && (
                        <button 
                            onClick={(e) => handleQuickRegister(e, course)}
                            className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1.5 rounded shadow-sm flex items-center gap-1 hover:bg-yellow-200 transition-colors z-20 cursor-pointer border border-yellow-200"
                            title="Đăng ký ngay"
                        >
                            <PlusCircle size={14}/> Nhấn để đăng ký
                        </button>
                    )}
                    {isEnrolled && (
                        <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded shadow-sm z-10 flex items-center gap-1 border border-green-200">
                            <CheckCircle size={14} /> Đã đăng ký
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { completedLessons, allCourses, allQuestions, role, user, enrollCourse, addCertificate, setUser, setUsers, users } = React.useContext(AppContext);
  const course = allCourses.find(c => c.id === id);

  const [showQuiz, setShowQuiz] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [certData, setCertData] = useState<CertificateData | null>(null);

  // --- AUTO OPEN QUIZ if redirected from lesson ---
  useEffect(() => {
    if (location.state && (location.state as any).startQuiz) {
        setShowQuiz(true);
    }
  }, [location.state]);

  if (!course) return <div>Không tìm thấy chủ đề</div>;

  // --- PROGRESS LOGIC PER COURSE ---
  const enrollment = user?.enrollments.find(e => e.courseId === course.id);
  const isEnrolled = !!enrollment;
  
  // Use course-specific level or default to 1
  const currentLevel = enrollment ? enrollment.level : 1;
  
  // Calculate completion status for current level only
  const currentLevelLessons = course.topics.flatMap(t => t.lessons).filter(l => l.level === currentLevel);
  const currentLevelCompletedCount = currentLevelLessons.filter(l => completedLessons.includes(l.id)).length;
  const isCurrentLevelLessonsFinished = currentLevelLessons.length > 0 && currentLevelCompletedCount === currentLevelLessons.length;
  
  const totalLessons = course.topics.reduce((acc, t) => acc + t.lessons.length, 0);
  const completedCountTotal = completedLessons.filter(lid => 
    course.topics.some(t => t.lessons.some(l => l.id === lid))
  ).length;

  const handleStartQuiz = () => {
     if (!isCurrentLevelLessonsFinished && role === Role.LEARNER) {
       alert(`Vui lòng hoàn thành tất cả bài học của Level ${currentLevel} để mở bài kiểm tra.`);
       return;
     }
     setShowQuiz(true);
  };

  // STRICT FILTERING: Questions for THIS course AND THIS level
  const relevantQuestions = allQuestions.filter(q => 
      q.courseId === course.id && q.level === currentLevel
  );

  const handleQuizComplete = (result: QuizResult) => {
    if (result.passed) {
      // Generate Certificate
      const newCertData: CertificateData = {
        id: `CERT-${Date.now()}`,
        courseName: `${course.title} (Level ${currentLevel})`,
        studentName: user?.name || 'Học viên',
        date: result.date,
        verificationCode: Math.random().toString(36).substring(7).toUpperCase()
      };
      setCertData(newCertData);
      addCertificate(newCertData);
      
      // LEVEL UP LOGIC (PER COURSE)
      if (user && currentLevel < 5) {
          const nextLevel = currentLevel + 1;
          
          // Update the specific enrollment
          const updatedEnrollments = user.enrollments.map(e => 
            e.courseId === course.id ? { ...e, level: nextLevel } : e
          );
          
          const updatedUser = { ...user, enrollments: updatedEnrollments };
          
          // Update User state
          setUser(updatedUser);
          setUsers(users.map(u => u.id === user.id ? updatedUser : u));
          
          alert(`🎉 CHÚC MỪNG! Bạn đã vượt qua bài kiểm tra Level ${currentLevel} của khóa "${course.title}".\nLevel ${nextLevel} đã được mở khóa!`);
      } else if (user && currentLevel === 5) {
          alert(`🎉 CHÚC MỪNG! Bạn đã hoàn thành toàn bộ khóa học "${course.title}"!`);
      }

      setShowQuiz(false);
      setTimeout(() => setShowCert(true), 500); 
    } else {
        // Failed
        setShowQuiz(false);
    }
  };

  const handleHome = () => {
    setShowCert(false);
    // Stay on page to see new level unlocked
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Hero */}
      <div className="bg-gray-900 text-white relative">
         <div className="absolute inset-0 overflow-hidden">
           <img src={course.thumbnail} className="w-full h-full object-cover opacity-20 blur-sm" alt="Background" />
           <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
         </div>
         <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-4 text-brand-orange font-bold text-sm uppercase tracking-wider">
                <span className="bg-white/10 px-2 py-1 rounded">5 Cấp độ</span>
                <span>{course.category}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">{course.description}</p>
              
              {!isEnrolled && role === Role.LEARNER ? (
                <button 
                    onClick={() => enrollCourse(course)}
                    className="px-8 py-3 bg-brand-blue hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                  Đăng ký chủ đề này
                </button>
              ) : (
                 <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm inline-block">
                    <p className="text-sm text-blue-200 uppercase font-bold tracking-wide mb-1">Cấp độ hiện tại</p>
                    <p className="text-3xl font-bold text-white flex items-center gap-2">
                        LEVEL {currentLevel} <span className="text-sm font-normal text-gray-300">/ 5</span>
                    </p>
                 </div>
              )}
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Syllabus Logic: Only show lessons based on progression */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex justify-between">
                <span>Lộ trình học tập</span>
              </h3>
              
              {!isEnrolled && role === Role.LEARNER ? (
                  <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                      <Lock size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-4">Bạn chưa đăng ký chủ đề này. Vui lòng đăng ký để xem nội dung.</p>
                      <button onClick={() => enrollCourse(course)} className="text-brand-blue font-bold hover:underline">Đăng ký ngay</button>
                  </div>
              ) : (
                <div className="space-y-6">
                    {/* Render Topics/Lessons grouped by Level implicitly or just list */}
                    {/* We filter and display lessons by levels */}
                    
                    {[1, 2, 3, 4, 5].map(lvl => {
                        const lessonsInLevel = course.topics.flatMap(t => t.lessons).filter(l => l.level === lvl);
                        if (lessonsInLevel.length === 0) return null;

                        const isLocked = lvl > currentLevel;
                        const isCurrent = lvl === currentLevel;
                        const isPast = lvl < currentLevel;

                        return (
                            <div key={lvl} className={`border rounded-xl overflow-hidden transition-all duration-300 ${isCurrent ? 'border-brand-blue shadow-md ring-1 ring-brand-blue/20' : (isLocked ? 'border-gray-200 bg-gray-50/50 grayscale opacity-70' : 'border-gray-200 bg-green-50/10')}`}>
                                {/* Level Header */}
                                <div className={`px-4 py-3 flex justify-between items-center ${isCurrent ? 'bg-blue-50 text-brand-blue' : (isLocked ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700')}`}>
                                    <div className="font-bold flex items-center gap-2">
                                        {isLocked ? <Lock size={16}/> : (isPast ? <CheckCircle size={16}/> : <PlayCircle size={16}/>)}
                                        LEVEL {lvl}
                                        {isLocked && <span className="text-xs font-normal text-gray-400 ml-2">(Đang khóa)</span>}
                                    </div>
                                    <span className="text-xs font-medium opacity-80">{lessonsInLevel.length} bài học</span>
                                </div>

                                {/* Lessons List */}
                                <div className={`${isLocked ? 'pointer-events-none' : ''}`}>
                                    {lessonsInLevel.map(lesson => (
                                        <div 
                                            key={lesson.id}
                                            onClick={() => !isLocked && navigate(`/learn/${course.id}/${lesson.id}`)}
                                            className={`px-4 py-3 border-t border-gray-100 flex items-center justify-between transition-colors ${!isLocked ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-not-allowed'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {lesson.type === ContentType.VIDEO ? <Video size={16} className="text-gray-400"/> : <FileText size={16} className="text-gray-400"/>}
                                                <span className={`text-sm ${completedLessons.includes(lesson.id) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                    {lesson.title}
                                                </span>
                                            </div>
                                            {completedLessons.includes(lesson.id) && <CheckCircle size={14} className="text-green-500"/>}
                                            {!completedLessons.includes(lesson.id) && isLocked && <Lock size={12} className="text-gray-300"/>}
                                        </div>
                                    ))}
                                </div>

                                {/* EXAM BUTTON FOR THIS LEVEL - ONLY IF CURRENT */}
                                {isCurrent && (
                                    <div className="p-4 bg-white border-t border-gray-200 flex justify-center">
                                        {isCurrentLevelLessonsFinished ? (
                                            <button 
                                                onClick={handleStartQuiz}
                                                className="w-full py-3 bg-brand-orange text-white rounded-lg font-bold shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 animate-pulse"
                                            >
                                                <Award size={20}/>
                                                Làm bài kiểm tra Level {lvl} để mở khóa Level {lvl + 1}
                                            </button>
                                        ) : (
                                            <div className="w-full py-3 bg-gray-100 text-gray-400 rounded-lg font-medium text-center border border-dashed border-gray-300 flex items-center justify-center gap-2 cursor-not-allowed">
                                                <Lock size={16}/>
                                                Hoàn thành các bài học trên để mở khóa bài kiểm tra
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
              )}
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4">Tổng quan tiến độ</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                 <div className="bg-brand-success h-3 rounded-full transition-all duration-1000" style={{ width: `${totalLessons ? (completedCountTotal / totalLessons) * 100 : 0}%` }}></div>
              </div>
              <p className="text-sm text-gray-600 text-right mb-6">{completedCountTotal}/{totalLessons} bài học toàn khóa</p>
              
              <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500"/>
                      <span>Đã hoàn thành Level {currentLevel - 1}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-brand-blue">
                      <PlayCircle size={16}/>
                      <span>Đang học Level {currentLevel}</span>
                  </div>
                  {[...Array(5 - currentLevel)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                          <Lock size={16}/>
                          <span>Level {currentLevel + 1 + i} (Chưa mở)</span>
                      </div>
                  ))}
              </div>
           </div>
        </div>
      </div>

      <QuizModal 
        isOpen={showQuiz} 
        onClose={() => setShowQuiz(false)} 
        courseTitle={`${course.title} (Level ${currentLevel})`}
        questions={relevantQuestions}
        onComplete={handleQuizComplete}
      />

      {certData && (
        <div className={`${showCert ? 'block' : 'hidden'}`}>
             <Certificate data={certData} onClose={() => setShowCert(false)} onHome={handleHome} />
        </div>
      )}
    </div>
  );
};

// --- ADDITIONAL COMPONENTS ---

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { allCourses, completeLesson, completedLessons, user } = React.useContext(AppContext);
    
    const course = allCourses.find(c => c.id === courseId);
    const lesson = course?.topics.flatMap(t => t.lessons).find(l => l.id === lessonId);
    
    // Authorization Check
    const enrollment = user?.enrollments.find(e => e.courseId === courseId);
    const userLevel = enrollment ? enrollment.level : 1;
    const isLocked = lesson && lesson.level > userLevel && user?.role !== Role.ADMIN && user?.role !== Role.INSTRUCTOR;

    if (!course || !lesson) return <div>Không tìm thấy bài học</div>;
    
    if (isLocked) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-6 text-center">
                <Lock size={64} className="text-gray-400 mb-4"/>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Bài học bị khóa</h1>
                <p className="text-gray-600 mb-6">Bạn cần hoàn thành Level {lesson.level - 1} và làm bài kiểm tra để mở khóa bài học này.</p>
                <button onClick={() => navigate(`/course/${courseId}`)} className="px-6 py-2 bg-brand-blue text-white rounded-lg">Quay về khóa học</button>
            </div>
        )
    }

    const handleComplete = () => {
        if (courseId && lessonId) {
            completeLesson(lessonId, courseId);
            
            // --- NEW: Check if this was the last lesson of the level ---
            const currentLevelLessons = course.topics.flatMap(t => t.lessons).filter(l => l.level === lesson.level);
            const isLevelDone = currentLevelLessons.every(l => completedLessons.includes(l.id) || l.id === lessonId);

            if (isLevelDone) {
                // If level is done, navigate back to course detail so user can see the unlocked Test Button
                // We use state to tell CourseDetail to maybe scroll or highlight the test button
                if(confirm(`Bạn đã học xong hết bài học Level ${lesson.level}. Quay về màn hình chính để làm bài kiểm tra?`)) {
                    navigate(`/course/${courseId}`); // Simply go back, let them click the big orange button
                    return;
                }
            }

            // Standard navigation logic (Find next lesson)
            const allLessons = course.topics.flatMap(t => t.lessons);
            const idx = allLessons.findIndex(l => l.id === lessonId);
            if (idx < allLessons.length - 1) {
                const nextLesson = allLessons[idx+1];
                // Only auto-advance if next lesson is same level. If next lesson is higher level, we stop to force test.
                if (nextLesson.level === lesson.level) {
                     navigate(`/learn/${courseId}/${nextLesson.id}`);
                } else {
                     alert("Bạn đã hoàn thành các bài học của Level này. Hãy làm bài kiểm tra để mở khóa Level tiếp theo.");
                     navigate(`/course/${courseId}`);
                }
            } else {
                navigate(`/course/${courseId}`);
            }
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                     <button onClick={() => navigate(`/course/${courseId}`)} className="text-gray-400 hover:text-white"><ChevronRight className="rotate-180" size={24}/></button>
                     <div>
                         <h2 className="font-bold">{course.title}</h2>
                         <p className="text-xs text-gray-400">{lesson.title}</p>
                     </div>
                 </div>
            </div>
            <div className="flex-1 flex bg-gray-100 overflow-hidden">
                <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center">
                    <div className="w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl aspect-video mb-6 relative">
                         {lesson.type === ContentType.VIDEO ? (
                             <iframe 
                                src={lesson.url ? lesson.url.replace("watch?v=", "embed/") : "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                                className="w-full h-full" 
                                title="Video Player"
                                allowFullScreen
                             ></iframe>
                         ) : (
                             <div className="w-full h-full bg-white flex flex-col items-center justify-center text-gray-500">
                                 <FileText size={64} className="mb-4 text-brand-blue" />
                                 <h3 className="text-xl font-bold text-gray-800 mb-2">Tài liệu PDF</h3>
                                 <p>Bạn đang xem tài liệu: {lesson.title}</p>
                                 <a href={lesson.url || "#"} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-700">Tải xuống / Mở tab mới</a>
                             </div>
                         )}
                    </div>
                    <div className="w-full max-w-4xl flex justify-between items-center">
                         <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
                         <button 
                            onClick={handleComplete}
                            className={`px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 ${completedLessons.includes(lesson.id) ? 'bg-green-100 text-green-700' : 'bg-brand-blue text-white hover:bg-blue-700'}`}
                         >
                            {completedLessons.includes(lesson.id) ? <><CheckCircle size={20}/> Đã hoàn thành</> : 'Hoàn thành bài học'}
                         </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const UserProfile = () => {
    const { user, completedLessons, certificates, allCourses } = React.useContext(AppContext);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="h-32 bg-gradient-to-r from-brand-blue to-purple-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-4">
                        <img src={user?.avatar} className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
                        <p className="text-gray-600">{user?.department}</p>
                        <div className="flex gap-4 mt-4">
                             <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                 <UserIcon size={14}/> {user?.username}
                             </div>
                             <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                 <Shield size={14}/> {user?.role}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle className="text-green-500" size={20}/> Tiến độ học tập</h3>
                     <div className="text-center py-6">
                         <div className="text-4xl font-bold text-brand-blue mb-1">{completedLessons.length}</div>
                         <p className="text-gray-500 text-sm">Bài học đã hoàn thành</p>
                     </div>
                 </div>

                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Award className="text-brand-orange" size={20}/> Chứng chỉ đã nhận</h3>
                     {certificates.length > 0 ? (
                         <div className="space-y-3">
                             {certificates.map(c => (
                                 <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                     <div>
                                         <p className="font-medium text-sm text-gray-800">{c.courseName}</p>
                                         <p className="text-xs text-gray-500">{new Date(c.date).toLocaleDateString('vi-VN')}</p>
                                     </div>
                                     <Award size={20} className="text-brand-orange" />
                                 </div>
                             ))}
                         </div>
                     ) : (
                         <div className="text-center py-6 text-gray-400">
                             Chưa có chứng chỉ nào.
                         </div>
                     )}
                 </div>
            </div>
            
            {/* Show Enrolled Courses */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="font-bold text-gray-800 mb-4">Các khóa học đã tham gia</h3>
                 <div className="space-y-4">
                     {user?.enrollments.map(e => {
                         const course = allCourses.find(c => c.id === e.courseId);
                         return (
                             <div key={e.courseId} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                                <div>
                                    <span className="font-medium text-gray-800">{course ? course.title : `Khóa học ID: ${e.courseId}`}</span>
                                    <p className="text-xs text-gray-500">Tham gia ngày: {e.joinedAt}</p>
                                </div>
                                <span className="bg-blue-100 text-brand-blue px-3 py-1 rounded-full text-xs font-bold">
                                    Đang ở Level {e.level}
                                </span>
                             </div>
                         );
                     })}
                 </div>
            </div>
        </div>
    )
}

const AdminDashboard = () => {
  const { role, allCourses, setAllCourses, allQuestions, setAllQuestions, users, setUsers, setUser, user } = React.useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Helper to delete course
  const handleDeleteCourse = (id: string) => {
    if(confirm("Bạn có chắc muốn xóa chủ đề này không?")) {
        setAllCourses(allCourses.filter(c => c.id !== id));
    }
  };

  const handleSaveCourse = (updatedCourse: Course) => {
      const exists = allCourses.some(c => c.id === updatedCourse.id);
      if (exists) {
          setAllCourses(allCourses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      } else {
          setAllCourses([...allCourses, updatedCourse]);
      }
      setIsEditingCourse(false);
      setEditingCourseData(null);
  };

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourseData, setEditingCourseData] = useState<Course | null>(null);

  if (location.pathname === '/admin/users') {
      return (
          <UserManager 
            currentUserRole={role}
            users={users}
            onAddUser={(u) => setUsers([...users, u])}
            onUpdateUser={(u) => setUsers(users.map(us => us.id === u.id ? u : us))}
            onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
          />
      );
  }

  if (location.pathname === '/admin/questions') {
      return (
          <div className="p-6 max-w-7xl mx-auto">
            <QuestionBank 
                questions={allQuestions}
                courses={allCourses}
                onAddQuestion={(q) => setAllQuestions([...allQuestions, q])}
                onUpdateQuestion={(q) => setAllQuestions(allQuestions.map(qu => qu.id === q.id ? q : qu))}
                onImportQuestions={(qs) => setAllQuestions([...allQuestions, ...qs])}
                onDeleteQuestion={(id) => setAllQuestions(allQuestions.filter(q => q.id !== id))}
            />
          </div>
      );
  }

  if (location.pathname === '/admin/courses') {
      if (isEditingCourse) {
          return (
              <div className="p-6 h-full">
                  <CourseEditor 
                    initialData={editingCourseData} 
                    onSave={handleSaveCourse} 
                    onCancel={() => { setIsEditingCourse(false); setEditingCourseData(null); }}
                  />
              </div>
          )
      }

      return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Chủ đề</h1>
                    <p className="text-gray-600">Danh sách các khóa học trong hệ thống.</p>
                </div>
                <button 
                    onClick={() => { setEditingCourseData(null); setIsEditingCourse(true); }}
                    className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md"
                >
                    <PlusCircle size={20} /> Tạo mới
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCourses.map(course => (
                    <div key={course.id} className="relative group">
                        <CourseCard 
                            course={course} 
                            userLevel={null} // Admin view doesn't show personal progress
                            onClick={() => { setEditingCourseData(course); setIsEditingCourse(true); }} 
                        />
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                            title="Xóa khóa học"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
      );
  }

  // Default Admin Dashboard View
  return (
    <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Quản trị</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                        <p className="text-sm text-gray-500">Tổng người dùng</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{allCourses.length}</p>
                        <p className="text-sm text-gray-500">Chủ đề đào tạo</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{allQuestions.length}</p>
                        <p className="text-sm text-gray-500">Câu hỏi ngân hàng</p>
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">85%</p>
                        <p className="text-sm text-gray-500">Tỷ lệ hoàn thành</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4">Học viên mới</h3>
                 <div className="space-y-4">
                     {users.filter(u => u.role === Role.LEARNER).slice(0, 5).map(u => (
                         <div key={u.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                             <div className="flex items-center gap-3">
                                 <img src={u.avatar} className="w-8 h-8 rounded-full" />
                                 <div>
                                     <p className="font-medium text-sm text-gray-800">{u.name}</p>
                                     <p className="text-xs text-gray-500">{u.department}</p>
                                 </div>
                             </div>
                             {/* Display count of enrolled courses instead of global level */}
                             <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-1 rounded">
                                {u.enrollments?.length || 0} khóa học
                             </span>
                         </div>
                     ))}
                 </div>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4">Chủ đề phổ biến</h3>
                 <div className="space-y-4">
                     {allCourses.slice(0, 5).map(c => (
                         <div key={c.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-8 rounded overflow-hidden">
                                     <img src={c.thumbnail} className="w-full h-full object-cover" />
                                 </div>
                                 <div>
                                     <p className="font-medium text-sm text-gray-800 line-clamp-1">{c.title}</p>
                                     <p className="text-xs text-gray-500">{c.totalStudents} học viên</p>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    </div>
  )
};

const MainApp = () => {
    const { user } = React.useContext(AppContext);

    if (!user) return null; // handled by parent

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans text-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <Header />
                <div className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={user.role === Role.LEARNER ? <LearnerDashboard /> : <AdminDashboard />} />
                        <Route path="/courses" element={user.role === Role.LEARNER ? <CourseList /> : <AdminDashboard />} /> 
                        <Route path="/course/:id" element={<CourseDetail />} />
                        <Route path="/learn/:courseId/:lessonId" element={<LessonView />} />
                        
                        <Route path="/admin/*" element={<AdminDashboard />} />
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/certificates" element={<UserProfile />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [allCourses, setAllCourses] = useState<Course[]>(MOCK_COURSES);
  const [allQuestions, setAllQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);

  // Update totalStudents for each course when users change
  useEffect(() => {
    setAllCourses(currentCourses => {
      // Create a map of courseId -> count to avoid O(N*M) lookups inside the map if possible, 
      // but with small data nested filter is fine.
      return currentCourses.map(course => {
        const realCount = users.filter(u => 
          u.role === Role.LEARNER && u.enrollments?.some(e => e.courseId === course.id)
        ).length;
        
        // Only update if changed to avoid unnecessary re-renders (though map always creates new ref)
        if (course.totalStudents !== realCount) {
           return { ...course, totalStudents: realCount };
        }
        return course;
      });
    });
  }, [users]);

  const handleLogin = (u: string, p: string) => {
    const foundUser = users.find(user => user.username === u && user.password === p);
    if (foundUser) {
      setUser(foundUser);
    } else {
      alert("Thông tin đăng nhập không chính xác!");
    }
  };

  const logout = () => {
      setUser(null);
  };

  const enrollCourse = (course: Course) => {
      if (!user) return;
      
      // Check if already enrolled
      if (user.enrollments.some(e => e.courseId === course.id)) {
          // No alert to prevent blocking UI if called silently
          return;
      }

      const newEnrollment: Enrollment = {
          courseId: course.id,
          level: 1, // Start at level 1
          joinedAt: new Date().toLocaleDateString('vi-VN')
      };

      const updatedUser = { 
          ...user, 
          enrollments: [...user.enrollments, newEnrollment] 
      };
      
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      // Alert removed for smoother UX in list view
  };

  const completeLesson = (lessonId: string, courseId: string) => {
      if(!completedLessons.includes(lessonId)) {
          setCompletedLessons([...completedLessons, lessonId]);
      }
  };

  const addCertificate = (cert: CertificateData) => {
      setCertificates([...certificates, cert]);
  };

  const myCourses = React.useMemo(() => {
      if(!user) return [];
      return allCourses.filter(c => user.enrollments.some(e => e.courseId === c.id));
  }, [user, allCourses]);

  return (
    <AppContext.Provider value={{
        user, setUser,
        users, setUsers,
        role: user?.role || Role.LEARNER,
        myCourses,
        allCourses, setAllCourses,
        allQuestions, setAllQuestions,
        enrollCourse,
        completedLessons, completeLesson,
        certificates, addCertificate,
        logout
    }}>
        <Router>
             {!user ? (
                 <LoginScreen onLogin={handleLogin} />
             ) : (
                 <MainApp />
             )}
        </Router>
    </AppContext.Provider>
  );
};

export default App;