import React, { useState, useEffect, useMemo, createContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, LayoutDashboard, User as UserIcon, LogOut, 
  Search, Bell, ChevronRight, Play, FileText, CheckCircle, 
  Award, BarChart2, Video, PlusCircle, Settings, Menu, Users, HelpCircle, Shield, Lock, Star, PlayCircle, Trash2, Edit, Download, TrendingUp, Clock, File, ExternalLink, ArrowRight, Upload, Image as ImageIcon, Save, RefreshCw, Globe, School, Eye, Loader2, Files
} from 'lucide-react';
import { MOCK_USERS, MOCK_COURSES, SAMPLE_QUESTIONS } from './constants';
import { Course, Role, Lesson, ContentType, QuizResult, CertificateData, Question, User, Topic, Enrollment, ActivityLog, ActivityType, CertificateConfig, QuizTimeConfig } from './types';
import CourseCard from './components/CourseCard';
import QuizModal from './components/QuizModal';
import Certificate from './components/Certificate';
import CourseEditor from './components/CourseEditor';
import QuestionBank from './components/QuestionBank';
import UserManager from './components/UserManager';
import ClassManager from './components/ClassManager';

// --- API CONSTANTS ---
const API_URL = 'https://script.google.com/macros/s/AKfycbxzPg7uA_zeQ_rUf3smdQehHPDFwePpvXPFsIfkKeXgcUmbK_MOPp9mR8KPz6vfXs9i/exec';

// --- Contexts ---
export const AppContext = createContext<{
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
  appLogo: string;
  setAppLogo: (url: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  activityLogs: ActivityLog[];
  logActivity: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  certificateConfig: CertificateConfig;
  setCertificateConfig: (c: CertificateConfig) => void;
  quizTimeConfig: QuizTimeConfig;
  setQuizTimeConfig: (c: QuizTimeConfig) => void;
  refreshCourses: () => void;
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
  logout: () => {},
  appLogo: '/logonew.png',
  setAppLogo: () => {},
  language: 'vi',
  setLanguage: () => {},
  activityLogs: [],
  logActivity: () => {},
  certificateConfig: {
    backgroundImage: '',
    issuerName: 'TS. Phạm Văn B',
    issuerTitle: 'GIÁM ĐỐC ĐÀO TẠO',
    signatureImage: ''
  },
  setCertificateConfig: () => {},
  quizTimeConfig: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
  setQuizTimeConfig: () => {},
  refreshCourses: () => {}
});

// --- Auth Component ---
const LoginScreen = ({ onLogin }: { onLogin: (u: string, p: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { appLogo } = React.useContext(AppContext);

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
          <img src={appLogo} alt="Logo" className="w-48 mb-6 object-contain drop-shadow-md" />
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
  const { user, logout, appLogo } = React.useContext(AppContext);
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
    { icon: School, label: 'Quản lý Lớp học', path: '/admin/classes' },
    { icon: BookOpen, label: 'Quản lý Chủ đề', path: '/admin/courses' },
    { icon: HelpCircle, label: 'Ngân hàng câu hỏi', path: '/admin/questions' },
    { icon: Settings, label: 'Cài đặt hệ thống', path: '/admin/settings' },
  ];

  const instructorLinks = [
    { icon: LayoutDashboard, label: 'Dashboard Giảng viên', path: '/admin' }, 
    { icon: Users, label: 'Quản lý Học viên', path: '/admin/users' },
    { icon: School, label: 'Quản lý Lớp học', path: '/admin/classes' },
    { icon: BookOpen, label: 'Quản lý Chủ đề', path: '/admin/courses' },
    { icon: HelpCircle, label: 'Ngân hàng câu hỏi', path: '/admin/questions' },
  ];

  let links = learnerLinks;
  if (role === Role.ADMIN) links = adminLinks;
  else if (role === Role.INSTRUCTOR) links = instructorLinks;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 hidden md:flex flex-col">
      <div className="flex items-center justify-center mb-8 px-4 py-6">
        <img 
          src={appLogo} 
          alt="Logo" 
          className="w-full max-h-16 object-contain"
        />
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
  const { user, appLogo, language } = React.useContext(AppContext);
  const role = user?.role;
  
  const getFlag = () => {
    switch(language) {
        case 'en': return '🇺🇸';
        case 'km': return '🇰🇭';
        default: return '🇻🇳';
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4 md:hidden">
        <Menu className="text-gray-600" />
        <img src={appLogo} alt="Logo" className="h-8 w-auto" />
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
        <div className="text-lg cursor-default" title="Ngôn ngữ hiện tại">{getFlag()}</div>
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

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { allCourses, completeLesson, completedLessons, logActivity, user } = React.useContext(AppContext);
    
    const course = allCourses.find(c => c.id === courseId);
    let lesson: Lesson | undefined;
    
    course?.topics.forEach(t => {
        const l = t.lessons.find(ls => ls.id === lessonId);
        if (l) lesson = l;
    });

    const [pdfUrl, setPdfUrl] = useState<string>('');

    // --- HELPER: Robust Base64 to Blob ---
    const b64toBlob = (b64Data: string, contentType = 'application/pdf', sliceSize = 512) => {
        try {
            // Remove 'data:application/pdf;base64,' if present
            const cleanB64 = b64Data.replace(/^data:[^;]+;base64,/, '');
            
            const byteCharacters = atob(cleanB64);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            return new Blob(byteArrays, {type: contentType});
        } catch (e) {
            console.error("Base64 conversion error", e);
            return null;
        }
    };

    useEffect(() => {
        if (lesson && user && courseId) {
            logActivity({
                userId: user.id,
                courseId: courseId,
                itemId: lesson.id,
                itemName: lesson.title,
                type: ActivityType.LESSON_VIEW
            });
        }

        // --- PDF URL HANDLING ---
        if (lesson?.type === ContentType.PDF && lesson.url) {
            // Case 1: Base64 Data URI
            if (lesson.url.startsWith('data:')) {
                const blob = b64toBlob(lesson.url);
                if (blob) {
                    const objectUrl = URL.createObjectURL(blob);
                    setPdfUrl(objectUrl);
                } else {
                    setPdfUrl(lesson.url); // Fallback
                }
            } 
            // Case 2: Google Drive Link (Regular) -> Convert to Preview
            else if (lesson.url.includes('drive.google.com') && lesson.url.includes('/view')) {
                const previewUrl = lesson.url.replace('/view', '/preview');
                setPdfUrl(previewUrl);
            }
            // Case 3: Regular URL
            else {
                setPdfUrl(lesson.url);
            }
        }

        return () => {
            if (pdfUrl.startsWith('blob:')) URL.revokeObjectURL(pdfUrl);
        };
    }, [lessonId, lesson]);

    if (!course || !lesson) return <div>Không tìm thấy bài học</div>;

    const handleComplete = () => {
        if(courseId && lessonId) {
            completeLesson(lessonId, courseId);
            navigate(`/course/${courseId}`);
        }
    };

    const isRawFile = (url: string) => {
        return url.startsWith('data:') || url.startsWith('blob:') || url.match(/\.(mp4|webm|ogg|mov)$/i);
    };

    // Helper to check if it's a Drive link for special iframe rendering
    const isDriveLink = (url: string) => url.includes('drive.google.com');

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/course/${courseId}`)} className="hover:bg-white/10 p-2 rounded">
                        <ArrowRight className="rotate-180" size={20}/>
                    </button>
                    <div>
                        <h2 className="font-bold text-lg">{lesson.title}</h2>
                        <p className="text-xs text-gray-400">{course.title}</p>
                    </div>
                </div>
                <button 
                    onClick={handleComplete}
                    className={`px-4 py-2 rounded font-bold flex items-center gap-2 ${completedLessons.includes(lesson.id) ? 'bg-green-600 text-white' : 'bg-brand-blue text-white'}`}
                >
                    <CheckCircle size={18}/>
                    {completedLessons.includes(lesson.id) ? 'Đã hoàn thành' : 'Hoàn thành bài học'}
                </button>
            </div>
            
            <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                {lesson.type === ContentType.VIDEO ? (
                     lesson.url ? (
                         isRawFile(lesson.url) ? (
                             <video 
                                controls 
                                controlsList="nodownload"
                                className="w-full h-full max-h-full object-contain"
                                src={lesson.url}
                             >
                                 Trình duyệt của bạn không hỗ trợ thẻ video.
                             </video>
                         ) : (
                             <iframe 
                                src={lesson.url.includes("watch?v=") ? lesson.url.replace("watch?v=", "embed/") : lesson.url} 
                                className="w-full h-full" 
                                allowFullScreen 
                                title="Video Player"
                             />
                         )
                     ) : (
                         <div className="text-center text-gray-500">
                             <Video size={64} className="mx-auto mb-4 opacity-50"/>
                             <p>Video đang được cập nhật</p>
                         </div>
                     )
                ) : lesson.type === ContentType.IMAGE ? (
                     lesson.url ? (
                         <div className="w-full h-full bg-black flex items-center justify-center overflow-auto">
                            <img 
                                src={lesson.url} 
                                alt={lesson.title} 
                                className="max-w-full max-h-full object-contain"
                            />
                         </div>
                     ) : (
                         <div className="text-center text-gray-500">
                             <ImageIcon size={64} className="mx-auto mb-4 opacity-50"/>
                             <p>Hình ảnh đang được cập nhật</p>
                         </div>
                     )
                ) : (
                    // --- IMPROVED PDF RENDERER ---
                    <div className="bg-white w-full h-full overflow-hidden relative flex flex-col">
                        {lesson.url ? (
                            <>
                                {/* Use IFRAME for Google Drive Preview (best compatibility) */}
                                {isDriveLink(pdfUrl || lesson.url) ? (
                                    <iframe 
                                        src={pdfUrl || lesson.url}
                                        className="w-full flex-1 border-none bg-gray-100"
                                        title="PDF Viewer"
                                        allow="autoplay"
                                    />
                                ) : (
                                    // Use OBJECT tag for Blobs/Standard PDFs (Avoids "Blocked by Chrome" for data URIs)
                                    <object 
                                        data={pdfUrl || lesson.url} 
                                        type="application/pdf"
                                        className="w-full flex-1 bg-gray-100"
                                        key={pdfUrl} // Force re-render if URL changes
                                    >
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                                            <FileText size={48} className="opacity-50"/>
                                            <div className="text-center">
                                                <p className="font-medium mb-1">Trình duyệt không hỗ trợ xem trực tiếp file này.</p>
                                                <p className="text-sm">Vui lòng tải về hoặc mở trong tab mới.</p>
                                            </div>
                                            <a 
                                                href={pdfUrl || lesson.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-brand-blue text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                                <ExternalLink size={16}/> Mở tài liệu
                                            </a>
                                        </div>
                                    </object>
                                )}

                                {/* Always show fallback/download bar */}
                                <div className="bg-gray-50 border-t border-gray-200 p-2 flex justify-center z-10">
                                     <a 
                                        href={lesson.url.startsWith('data:') ? pdfUrl : lesson.url} 
                                        download={`Tailieu_${lesson.title}.pdf`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-brand-blue hover:underline flex items-center gap-1 font-medium"
                                     >
                                        <Download size={14}/> Gặp lỗi hiển thị? Tải file về máy
                                     </a>
                                </div>
                            </>
                        ) : (
                            <div className="max-w-3xl mx-auto p-8 overflow-y-auto h-full">
                                <h1 className="text-3xl font-bold mb-6 text-gray-900">{lesson.title}</h1>
                                <div className="prose lg:prose-xl text-gray-700">
                                    <p>Nội dung tài liệu đang được cập nhật...</p>
                                    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                                        <FileText size={48} className="text-gray-400"/>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const GlobalSettings = () => {
  const { appLogo, setAppLogo, certificateConfig, setCertificateConfig } = React.useContext(AppContext);
  const [localConfig, setLocalConfig] = useState<CertificateConfig>(certificateConfig);
  const [previewLogo, setPreviewLogo] = useState<string>(appLogo);
  
  // Update local state when context changes (initial load)
  useEffect(() => {
      setLocalConfig(certificateConfig);
      setPreviewLogo(appLogo);
  }, [certificateConfig, appLogo]);

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await toBase64(file);
          setPreviewLogo(base64);
      }
  };

  const handleSigChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await toBase64(file);
          setLocalConfig(prev => ({ ...prev, signatureImage: base64 }));
      }
  };
  
  const handleBgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const base64 = await toBase64(file);
          setLocalConfig(prev => ({ ...prev, backgroundImage: base64 }));
      }
  };

  const handleSave = () => {
      setAppLogo(previewLogo);
      setCertificateConfig(localConfig);
      alert("Đã lưu cấu hình hệ thống thành công!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt Hệ thống</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
            {/* 1. BRANDING */}
            <div>
                <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                    <Settings size={20}/> Thương hiệu & Logo
                </h3>
                <div className="flex items-start gap-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-32 h-32 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 p-2">
                            <img src={previewLogo} alt="Logo Preview" className="max-w-full max-h-full object-contain"/>
                        </div>
                        <span className="text-xs text-gray-500">Logo hiện tại</span>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thay đổi Logo ứng dụng</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                            Định dạng hỗ trợ: PNG, JPG, SVG. Kích thước khuyên dùng: 200x50px (Nền trong suốt).
                        </p>
                    </div>
                </div>
            </div>

            {/* 2. CERTIFICATE CONFIG */}
            <div>
                <h3 className="text-lg font-bold text-gray-700 border-b pb-2 mb-4 flex items-center gap-2">
                    <Award size={20}/> Cấu hình Chứng chỉ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên người ký (Issuer Name)</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                            value={localConfig.issuerName}
                            onChange={(e) => setLocalConfig({...localConfig, issuerName: e.target.value})}
                            placeholder="VD: TS. Phạm Văn B"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh (Issuer Title)</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                            value={localConfig.issuerTitle}
                            onChange={(e) => setLocalConfig({...localConfig, issuerTitle: e.target.value})}
                            placeholder="VD: GIÁM ĐỐC ĐÀO TẠO"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Signature */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chữ ký số (Hình ảnh)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-16 border border-dashed border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                                {localConfig.signatureImage ? (
                                    <img src={localConfig.signatureImage} className="max-w-full max-h-full object-contain mix-blend-multiply"/>
                                ) : <span className="text-[10px] text-gray-400">Chưa có</span>}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleSigChange}
                                className="text-xs text-gray-500"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Nên dùng ảnh chữ ký tách nền (PNG transparent).</p>
                    </div>

                    {/* Background */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hình nền chứng chỉ (Tùy chọn)</label>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-16 border border-gray-300 rounded bg-gray-50 flex items-center justify-center overflow-hidden">
                                {localConfig.backgroundImage ? (
                                    <img src={localConfig.backgroundImage} className="w-full h-full object-cover"/>
                                ) : <span className="text-[10px] text-gray-400">Mặc định</span>}
                            </div>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleBgChange}
                                className="text-xs text-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-brand-blue text-white rounded-lg shadow-md hover:bg-blue-700 font-bold flex items-center gap-2"
                >
                    <Save size={18}/> Lưu Cài Đặt
                </button>
            </div>
        </div>
    </div>
  );
};

const LearnerDashboard = () => {
    const { user, myCourses, completedLessons, certificates } = React.useContext(AppContext);
    const navigate = useNavigate();

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Xin chào, {user?.name} 👋</h1>
                    <p className="text-gray-600">Tiếp tục hành trình học tập của bạn.</p>
                </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Khóa học của tôi</h2>
            {myCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map(course => {
                         const enrollment = user?.enrollments.find(e => e.courseId === course.id);
                         const userLevel = enrollment ? enrollment.level : 1;
                        return (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                userLevel={userLevel}
                                onClick={() => navigate(`/course/${course.id}`)} 
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">Bạn chưa đăng ký khóa học nào.</p>
                    <button onClick={() => navigate('/courses')} className="text-brand-blue font-bold hover:underline">Khám phá khóa học</button>
                </div>
            )}
        </div>
    );
};

const CourseList = () => {
    const { allCourses } = React.useContext(AppContext);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const filtered = allCourses.filter(c => (c.title || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Thư viện khóa học</h1>
                <input 
                    type="text" 
                    placeholder="Tìm khóa học..." 
                    className="w-64 px-4 py-2 border rounded-lg"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map(course => (
                    <CourseCard 
                        key={course.id} 
                        course={course} 
                        userLevel={null}
                        onClick={() => navigate(`/course/${course.id}`)} 
                    />
                ))}
            </div>
        </div>
    );
};

const UserProfile = () => {
    const { user, certificates, appLogo, certificateConfig } = React.useContext(AppContext);
    const [showCertModal, setShowCertModal] = useState<CertificateData | null>(null);

    if (!user) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Hồ sơ cá nhân</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="flex items-center gap-4">
                    <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full"/>
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-gray-500">{user.department}</p>
                    </div>
                </div>
            </div>
            <h3 className="font-bold text-lg text-gray-800 border-b pb-2 mb-4">Chứng chỉ của tôi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certificates.map(cert => (
                    <div key={cert.id} className="bg-white border p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h4 className="font-bold">{cert.courseName}</h4>
                            <p className="text-xs text-gray-500">{new Date(cert.date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => setShowCertModal(cert)} className="text-brand-blue hover:underline text-sm">Xem</button>
                    </div>
                ))}
            </div>
            {showCertModal && (
                <div className="fixed inset-0 z-50">
                     <Certificate 
                        data={showCertModal} 
                        config={certificateConfig}
                        onClose={() => setShowCertModal(null)} 
                        onHome={() => setShowCertModal(null)}
                        logoUrl={appLogo}
                    />
                </div>
            )}
        </div>
    );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { completedLessons, allCourses, allQuestions, role, user, enrollCourse, addCertificate, setUser, setUsers, users, appLogo, logActivity, certificateConfig, quizTimeConfig } = React.useContext(AppContext);
  const course = allCourses.find(c => c.id === id);

  const [showQuiz, setShowQuiz] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [certData, setCertData] = useState<CertificateData | null>(null);

  if (!course) return <div>Không tìm thấy chủ đề</div>;

  const enrollment = user?.enrollments.find(e => e.courseId === course.id);
  const isEnrolled = !!enrollment;
  const currentLevel = enrollment ? enrollment.level : 1;
  const currentLevelLessons = course.topics.flatMap(t => t.lessons).filter(l => l.level === currentLevel);
  const currentLevelCompletedCount = currentLevelLessons.filter(l => completedLessons.includes(l.id)).length;
  const isCurrentLevelLessonsFinished = currentLevelLessons.length > 0 && currentLevelCompletedCount === currentLevelLessons.length;
  
  const relevantQuestions = useMemo(() => allQuestions.filter(q => 
      q.courseId === course.id && q.level === currentLevel
  ), [allQuestions, course.id, currentLevel]);

  const handleStartQuiz = () => {
     if (!isCurrentLevelLessonsFinished && role === Role.LEARNER) {
       alert(`Vui lòng hoàn thành tất cả bài học của Level ${currentLevel} để mở bài kiểm tra.`);
       return;
     }
     setShowQuiz(true);
  };

  const handleQuizComplete = (result: QuizResult) => {
    if (result.passed) {
      const newCertData: CertificateData = {
        id: `CERT-${Date.now()}`,
        courseName: `${course.title} (Level ${currentLevel})`,
        studentName: user?.name || 'Học viên',
        date: result.date,
        verificationCode: Math.random().toString(36).substring(7).toUpperCase()
      };
      setCertData(newCertData);
      addCertificate(newCertData);
      
      if (user && currentLevel < 5) {
          const nextLevel = currentLevel + 1;
          const updatedEnrollments = user.enrollments.map(e => e.courseId === course.id ? { ...e, level: nextLevel } : e);
          const updatedUser = { ...user, enrollments: updatedEnrollments };
          setUser(updatedUser);
          setUsers(users.map(u => u.id === user.id ? updatedUser : u));
          alert(`🎉 CHÚC MỪNG! Bạn đã lên Level ${nextLevel}!`);
      }
      setShowQuiz(false);
      setTimeout(() => setShowCert(true), 500); 
    } else {
        setShowQuiz(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="bg-gray-900 text-white p-8">
         <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
         <p className="text-gray-300 mb-4">{course.description}</p>
         {!isEnrolled && role === Role.LEARNER ? (
            <button onClick={() => enrollCourse(course)} className="px-6 py-2 bg-brand-blue rounded text-white font-bold">Đăng ký chủ đề này</button>
         ) : (
            <p className="font-bold text-brand-orange">Đang học Level {currentLevel}/5</p>
         )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {[1, 2, 3, 4, 5].map(lvl => {
                    const lessonsInLevel = course.topics.flatMap(t => t.lessons).filter(l => l.level === lvl);
                    if (lessonsInLevel.length === 0) return null;
                    const isLocked = lvl > currentLevel;

                    return (
                        <div key={lvl} className="mb-6 last:mb-0">
                            <h3 className={`font-bold text-lg mb-2 ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}>
                                Level {lvl} {isLocked && '(Khóa)'}
                            </h3>
                            <div className="space-y-2">
                                {lessonsInLevel.map(lesson => (
                                    <div 
                                        key={lesson.id}
                                        onClick={() => !isLocked && navigate(`/learn/${course.id}/${lesson.id}`)}
                                        className={`p-3 border rounded flex justify-between items-center ${isLocked ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'hover:bg-blue-50 cursor-pointer'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {lesson.type === ContentType.VIDEO ? <Video size={16}/> : (lesson.type === ContentType.IMAGE ? <ImageIcon size={16}/> : <FileText size={16}/>)}
                                            {lesson.title}
                                        </div>
                                        {completedLessons.includes(lesson.id) && <CheckCircle size={16} className="text-green-500"/>}
                                    </div>
                                ))}
                            </div>
                            {lvl === currentLevel && (
                                <div className="mt-4">
                                    <button 
                                        onClick={handleStartQuiz}
                                        className="w-full py-2 bg-brand-orange text-white rounded font-bold hover:bg-orange-600"
                                    >
                                        Làm bài kiểm tra Level {lvl}
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                })}
           </div>
      </div>

      <QuizModal 
        isOpen={showQuiz} 
        onClose={() => setShowQuiz(false)} 
        courseTitle={`${course.title} (Level ${currentLevel})`}
        questions={relevantQuestions}
        onComplete={handleQuizComplete}
      />

      {certData && showCert && (
         <Certificate 
            data={certData} 
            config={certificateConfig}
            onClose={() => setShowCert(false)} 
            onHome={() => setShowCert(false)} 
            logoUrl={appLogo} 
         />
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { role, allCourses, setAllCourses, allQuestions, setAllQuestions, users, setUsers, activityLogs } = React.useContext(AppContext);
  const location = useLocation();
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourseData, setEditingCourseData] = useState<Course | null>(null);

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

  if (location.pathname === '/admin/classes') {
      return <ClassManager users={users} courses={allCourses} activityLogs={activityLogs} />;
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

  if (location.pathname === '/admin/settings') {
      return <GlobalSettings />;
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
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Chủ đề</h1>
                <button 
                    onClick={() => { setEditingCourseData(null); setIsEditingCourse(true); }}
                    className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md"
                >
                    <PlusCircle size={20} /> Tạo mới
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allCourses.map(course => (
                    <div key={course.id} className="relative group">
                        <CourseCard course={course} userLevel={null} onClick={() => { setEditingCourseData(course); setIsEditingCourse(true); }} />
                        <button 
                            onClick={(e) => { e.stopPropagation(); setAllCourses(allCourses.filter(c => c.id !== course.id)); }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
      );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Quản trị</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                <p className="text-sm text-gray-500">Tổng người dùng</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-2xl font-bold text-gray-800">{allCourses.length}</p>
                <p className="text-sm text-gray-500">Chủ đề đào tạo</p>
            </div>
        </div>
    </div>
  )
};

const MainApp = () => {
    const { user } = React.useContext(AppContext);

    if (!user) return null;

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
  const [appLogo, setAppLogo] = useState<string>('/logonew.png');
  const [language, setLanguage] = useState<string>('vi');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig>({
      backgroundImage: '',
      issuerName: 'TS. Phạm Văn B',
      issuerTitle: 'GIÁM ĐỐC ĐÀO TẠO',
      signatureImage: ''
  });
  
  const [quizTimeConfig, setQuizTimeConfig] = useState<QuizTimeConfig>({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 });

  // Initial Data Loading
  useEffect(() => {
    const fetchGlobalSettings = async () => {
        try {
            const res = await fetch(`${API_URL}?type=settings`);
            const data = await res.json();
            if (data && typeof data === 'object') {
                if (data.logo_url) setAppLogo(data.logo_url);
            }
        } catch (error) { console.error(error); }
    };
    fetchGlobalSettings();
  }, []);

  const refreshCourses = async () => {
    try {
      const response = await fetch(`${API_URL}?type=topics`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const convertedCourses: Course[] = data.map((t: any) => ({
            id: t.id || `imported-${Math.random()}`,
            title: t.topicName,
            description: `Chủ đề thuộc danh mục ${t.category}`,
            thumbnail: t.cover_image || 'https://via.placeholder.com/800x600',
            level: 1,
            instructor: t.createdBy,
            progress: 0,
            totalStudents: 0,
            category: t.category,
            topics: [{
                id: `syllabus-${t.id}`,
                title: "Nội dung đào tạo",
                lessons: [
                    t.document_file && { id: `doc-${t.id}`, title: 'Tài liệu tham khảo', type: ContentType.PDF, duration: 'PDF', isCompleted: false, level: 1, url: t.document_file },
                    t.video_file && { id: `vid-${t.id}`, title: 'Video bài giảng', type: ContentType.VIDEO, duration: 'Video', isCompleted: false, level: 1, url: t.video_file },
                    t.image_file && { id: `img-${t.id}`, title: 'Hình ảnh minh họa', type: ContentType.IMAGE, duration: 'Hình ảnh', isCompleted: false, level: 1, url: t.image_file }
                ].filter(Boolean) as Lesson[]
            }]
        }));
        setAllCourses(prev => {
            const uniqueIds = new Set(convertedCourses.map(c => c.id));
            const filteredMock = MOCK_COURSES.filter(c => !uniqueIds.has(c.id));
            return [...filteredMock, ...convertedCourses];
        });
      }
    } catch (error) { console.error("Failed to sync topics:", error); }
  };

  useEffect(() => { refreshCourses(); }, []);

  const handleLogin = (u: string, p: string) => {
    const foundUser = users.find(user => user.username === u && user.password === p);
    if (foundUser) setUser(foundUser);
    else alert("Thông tin đăng nhập không chính xác!");
  };

  const logout = () => setUser(null);

  const enrollCourse = (course: Course) => {
      if (!user) return;
      if (user.enrollments.some(e => e.courseId === course.id)) return;
      const updatedUser = { ...user, enrollments: [...user.enrollments, { courseId: course.id, level: 1, joinedAt: new Date().toLocaleDateString() }] };
      setUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
  };

  const completeLesson = (lessonId: string, courseId: string) => {
      if(!completedLessons.includes(lessonId)) setCompletedLessons([...completedLessons, lessonId]);
  };

  const logActivity = (logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
      setActivityLogs(prev => [{...logData, id: `act-${Date.now()}`, timestamp: new Date().toISOString()}, ...prev]);
  };

  const myCourses = useMemo(() => user ? allCourses.filter(c => user.enrollments.some(e => e.courseId === c.id)) : [], [user, allCourses]);

  return (
    <AppContext.Provider value={{
        user, setUser, users, setUsers, role: user?.role || Role.LEARNER,
        myCourses, allCourses, setAllCourses, allQuestions, setAllQuestions,
        enrollCourse, completedLessons, completeLesson, certificates, addCertificate: (c) => setCertificates([...certificates, c]),
        logout, appLogo, setAppLogo, language, setLanguage, activityLogs, logActivity,
        certificateConfig, setCertificateConfig, quizTimeConfig, setQuizTimeConfig, refreshCourses
    }}>
        <Router>
             {!user ? <LoginScreen onLogin={handleLogin} /> : <MainApp />}
        </Router>
    </AppContext.Provider>
  );
};

export default App;