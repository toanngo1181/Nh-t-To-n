import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, LayoutDashboard, User as UserIcon, LogOut, 
  Search, Bell, ChevronRight, Play, FileText, CheckCircle, 
  Award, BarChart2, Video, PlusCircle, Settings, Menu, Users, HelpCircle, Shield, Lock, Star, PlayCircle, Trash2, Edit, Download, TrendingUp, Clock, File, ExternalLink, ArrowRight, Upload, Image as ImageIcon, Save, RefreshCw, Globe, School, Eye, Loader2
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- API CONSTANTS ---
// Sử dụng cùng URL với UserManager
const API_URL = 'https://script.google.com/macros/s/AKfycbxzPg7uA_zeQ_rUf3smdQehHPDFwePpvXPFsIfkKeXgcUmbK_MOPp9mR8KPz6vfXs9i/exec';

// --- Contexts ---
export const AppContext = React.createContext<{
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
  setQuizTimeConfig: () => {}
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
          <img src={appLogo} alt="VinhTan Logo" className="w-48 mb-6 object-contain drop-shadow-md" />
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
    { icon: School, label: 'Quản lý Lớp học', path: '/admin/classes' }, // New Link
    { icon: BookOpen, label: 'Quản lý Chủ đề', path: '/admin/courses' },
    { icon: HelpCircle, label: 'Ngân hàng câu hỏi', path: '/admin/questions' },
    { icon: Settings, label: 'Cài đặt hệ thống', path: '/admin/settings' },
  ];

  const instructorLinks = [
    { icon: LayoutDashboard, label: 'Dashboard Giảng viên', path: '/admin' }, 
    { icon: Users, label: 'Quản lý Học viên', path: '/admin/users' },
    { icon: School, label: 'Quản lý Lớp học', path: '/admin/classes' }, // New Link
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
        <img src={appLogo} alt="VinhTan Logo" className="h-8 w-auto" />
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

// Helper for image upload in Settings
const SettingsMediaInput = ({ 
    label, 
    value, 
    onChange, 
    accept 
  }: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void,
    accept: string 
  }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <div className="flex items-center gap-4">
            <div className="relative w-32 h-20 border border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden group">
                {value ? (
                    <img src={value} className="w-full h-full object-contain" alt="Preview"/>
                ) : (
                    <Upload size={20} className="text-gray-400"/>
                )}
                <input 
                    type="file" 
                    accept={accept}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                />
            </div>
            <div className="flex-1">
                <input 
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm mb-1"
                    placeholder="Hoặc nhập URL ảnh..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <p className="text-xs text-gray-500">Tải lên file hoặc dán link ảnh.</p>
            </div>
        </div>
      </div>
    );
};

const SystemSettings = () => {
  const { appLogo, setAppLogo, language, setLanguage, certificateConfig, setCertificateConfig, quizTimeConfig, setQuizTimeConfig } = React.useContext(AppContext);
  const [localLogo, setLocalLogo] = useState(appLogo);
  const [localCertConfig, setLocalCertConfig] = useState(certificateConfig);
  const [localQuizTime, setLocalQuizTime] = useState(quizTimeConfig);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Settings from API on Mount
  useEffect(() => {
    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}?type=settings`);
            const data = await res.json();
            
            if (data && typeof data === 'object') {
                // Map API response to State
                if (data.logo_url) {
                    setLocalLogo(data.logo_url);
                    setAppLogo(data.logo_url); // Sync Context immediately
                }
                
                const newCertConfig = {
                    backgroundImage: data.cert_bg || '',
                    issuerName: data.cert_signer || 'TS. Phạm Văn B',
                    issuerTitle: data.cert_role || 'GIÁM ĐỐC ĐÀO TẠO',
                    signatureImage: data.signature_url || ''
                };
                
                setLocalCertConfig(newCertConfig);
                setCertificateConfig(newCertConfig); // Sync Context

                // Map Quiz Times (updated to match new API fields: time_level_x)
                const newQuizTime = {
                    1: Number(data.time_level_1) || 1,
                    2: Number(data.time_level_2) || 1,
                    3: Number(data.time_level_3) || 1,
                    4: Number(data.time_level_4) || 1,
                    5: Number(data.time_level_5) || 1
                };
                setLocalQuizTime(newQuizTime);
                setQuizTimeConfig(newQuizTime);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
            // Optionally fallback to local storage or defaults if API fails
        } finally {
            setIsLoading(false);
        }
    };

    fetchSettings();
  }, [setAppLogo, setCertificateConfig, setQuizTimeConfig]);

  const handleSave = async () => {
      setIsSaving(true);
      
      const payload = {
          type: 'settings',
          logo_url: localLogo,
          cert_bg: localCertConfig.backgroundImage,
          cert_signer: localCertConfig.issuerName,
          cert_role: localCertConfig.issuerTitle,
          signature_url: localCertConfig.signatureImage,
          // Updated payload keys
          time_level_1: localQuizTime[1],
          time_level_2: localQuizTime[2],
          time_level_3: localQuizTime[3],
          time_level_4: localQuizTime[4],
          time_level_5: localQuizTime[5]
      };

      try {
          await fetch(API_URL, {
              method: 'POST',
              mode: 'no-cors', // Assuming Google Apps Script Web App
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          // Update Context (Optimistic UI)
          setAppLogo(localLogo);
          setCertificateConfig(localCertConfig);
          setQuizTimeConfig(localQuizTime);
          
          // Also save to localStorage as backup/cache via Context effects
          alert("Đã lưu cài đặt hệ thống thành công!");
      } catch (error) {
          console.error("Failed to save settings:", error);
          alert("Có lỗi xảy ra khi lưu cài đặt.");
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="animate-spin text-brand-blue mb-4" size={48} />
              <p className="text-gray-500">Đang tải cấu hình hệ thống...</p>
          </div>
      );
  }

  return (
      <div className="p-6 max-w-4xl mx-auto pb-20">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h1>
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 flex items-center gap-1">
                <Globe size={12}/> Đồng bộ Cloud
            </div>
          </div>
          
          <div className="space-y-8 animate-fade-in">
            {/* General Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <h3 className="font-bold text-lg text-gray-700 border-b pb-2">Chung</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo Ứng dụng</label>
                    <SettingsMediaInput 
                        label=""
                        value={localLogo}
                        onChange={setLocalLogo}
                        accept="image/*"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ mặc định</label>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        <option value="vi">Tiếng Việt</option>
                        <option value="en">English</option>
                        <option value="km">Khmer</option>
                    </select>
                </div>
            </div>

            {/* Quiz Duration Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                 <h3 className="font-bold text-lg text-gray-700 border-b pb-2 flex items-center gap-2">
                    <Clock size={20}/> Cấu hình thời gian làm bài (Phút/Câu hỏi)
                </h3>
                <p className="text-sm text-gray-500 italic">
                    Thiết lập thời gian đếm ngược cho mỗi câu hỏi trong bài kiểm tra. Nếu hết giờ, hệ thống sẽ tự động bỏ qua câu hỏi đó (0 điểm) và chuyển sang câu tiếp theo.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(level => (
                        <div key={level}>
                             <label className="block text-sm font-bold text-gray-700 mb-1">Level {level}</label>
                             <div className="relative">
                                <input 
                                    type="number"
                                    min="1"
                                    step="1"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none text-center"
                                    value={localQuizTime[level]}
                                    onChange={(e) => setLocalQuizTime({...localQuizTime, [level]: Number(e.target.value)})}
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">phút</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Certificate Settings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
                <h3 className="font-bold text-lg text-gray-700 border-b pb-2 flex items-center gap-2">
                    <Award size={20}/> Cấu hình Giấy chứng nhận
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <SettingsMediaInput 
                            label="Hình nền Giấy chứng nhận"
                            value={localCertConfig.backgroundImage}
                            onChange={(val) => setLocalCertConfig({...localCertConfig, backgroundImage: val})}
                            accept="image/*"
                        />
                        <p className="text-xs text-gray-500 -mt-3 italic">Để trống để sử dụng nền mặc định.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên người cấp (Ký tên)</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                            value={localCertConfig.issuerName}
                            onChange={(e) => setLocalCertConfig({...localCertConfig, issuerName: e.target.value})}
                            placeholder="VD: TS. Phạm Văn B"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ người cấp</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                            value={localCertConfig.issuerTitle}
                            onChange={(e) => setLocalCertConfig({...localCertConfig, issuerTitle: e.target.value})}
                            placeholder="VD: GIÁM ĐỐC ĐÀO TẠO"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-700 mb-2">Chữ ký mẫu</label>
                         <div className="flex gap-4">
                            <div className="flex-1">
                                <SettingsMediaInput 
                                    label=""
                                    value={localCertConfig.signatureImage}
                                    onChange={(val) => setLocalCertConfig({...localCertConfig, signatureImage: val})}
                                    accept="image/*"
                                />
                            </div>
                            <div className="w-32 h-20 border border-gray-200 bg-white rounded flex items-center justify-center relative">
                                <span className="text-[10px] absolute top-1 left-1 text-gray-400">Xem trước</span>
                                {localCertConfig.signatureImage ? (
                                    <img src={localCertConfig.signatureImage} className="max-h-16 max-w-full mix-blend-multiply" alt="Sig" />
                                ) : (
                                    <span className="text-xs text-gray-400">Chưa có</span>
                                )}
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                  <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`px-8 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-bold flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                      {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                      {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
                <div className="flex gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle size={20}/></div>
                        <div>
                            <p className="text-xs text-gray-500">Đã hoàn thành</p>
                            <p className="font-bold text-gray-800">{certificates.length} khóa</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-brand-blue"><BookOpen size={20}/></div>
                        <div>
                            <p className="text-xs text-gray-500">Đang học</p>
                            <p className="font-bold text-gray-800">{myCourses.length} khóa</p>
                        </div>
                    </div>
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
                    <button 
                        onClick={() => navigate('/courses')}
                        className="text-brand-blue font-bold hover:underline"
                    >
                        Khám phá khóa học
                    </button>
                </div>
            )}
        </div>
    );
};

const CourseList = () => {
    const { allCourses, myCourses } = React.useContext(AppContext);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filtered = allCourses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Thư viện khóa học</h1>
                    <p className="text-gray-600">Khám phá và nâng cao kiến thức chăn nuôi.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm khóa học..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filtered.map(course => {
                    return (
                        <CourseCard 
                            key={course.id} 
                            course={course} 
                            userLevel={null}
                            onClick={() => navigate(`/course/${course.id}`)} 
                        />
                    );
                })}
            </div>
        </div>
    );
};

const LessonView = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const { allCourses, completeLesson, completedLessons, logActivity, user } = React.useContext(AppContext);
    
    const course = allCourses.find(c => c.id === courseId);
    // Find lesson in topics
    let lesson: Lesson | undefined;
    let topic: Topic | undefined;
    
    course?.topics.forEach(t => {
        const l = t.lessons.find(ls => ls.id === lessonId);
        if (l) {
            lesson = l;
            topic = t;
        }
    });

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
    }, [lessonId]); // Log on lesson mount/change

    if (!course || !lesson) return <div>Không tìm thấy bài học</div>;

    const handleComplete = () => {
        if(courseId && lessonId) {
            completeLesson(lessonId, courseId);
            // Navigate back to course or next lesson?
            // For simplicity, back to course detail to take quiz if ready
            navigate(`/course/${courseId}`);
        }
    };

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
                    {completedLessons.includes(lesson.id) ? <CheckCircle size={18}/> : <CheckCircle size={18}/>}
                    {completedLessons.includes(lesson.id) ? 'Đã hoàn thành' : 'Hoàn thành bài học'}
                </button>
            </div>
            
            <div className="flex-1 bg-black flex items-center justify-center relative">
                {lesson.type === ContentType.VIDEO ? (
                     lesson.url ? (
                         <iframe 
                            src={lesson.url.replace("watch?v=", "embed/")} 
                            className="w-full h-full" 
                            allowFullScreen 
                            title="Video Player"
                         />
                     ) : (
                         <div className="text-center text-gray-500">
                             <Video size={64} className="mx-auto mb-4 opacity-50"/>
                             <p>Video đang được cập nhật</p>
                         </div>
                     )
                ) : (
                    <div className="bg-white w-full h-full overflow-y-auto p-8">
                        {lesson.url ? (
                            <iframe src={lesson.url} className="w-full h-full" title="PDF Viewer" />
                        ) : (
                            <div className="max-w-3xl mx-auto">
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

const UserProfile = () => {
    const { user, certificates, appLogo, certificateConfig } = React.useContext(AppContext);
    const [showCertModal, setShowCertModal] = useState<CertificateData | null>(null);

    if (!user) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Hồ sơ cá nhân</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex flex-col items-center text-center">
                        <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full border-4 border-gray-100 mb-4"/>
                        <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                        <p className="text-gray-500">{user.department}</p>
                        <div className="mt-6 w-full space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Tên đăng nhập</span>
                                <span className="font-medium">{user.username}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Email</span>
                                <span className="font-medium">{user.email}</span>
                            </div>
                             <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-500 text-sm">Vai trò</span>
                                <span className="font-medium">{user.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificates */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="font-bold text-lg text-gray-800 border-b pb-2">Chứng chỉ của tôi</h3>
                    {certificates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {certificates.map(cert => (
                                <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Award size={64} className="text-brand-orange"/>
                                    </div>
                                    <h4 className="font-bold text-gray-800 mb-1">{cert.courseName}</h4>
                                    <p className="text-xs text-gray-500 mb-3">Cấp ngày: {new Date(cert.date).toLocaleDateString('vi-VN')}</p>
                                    <button 
                                        onClick={() => setShowCertModal(cert)}
                                        className="text-xs bg-brand-blue text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-1 w-fit"
                                    >
                                        <Eye size={12}/> Xem chứng chỉ
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Award size={32} className="mx-auto text-gray-300 mb-2"/>
                            <p className="text-gray-500 text-sm">Bạn chưa có chứng chỉ nào.</p>
                        </div>
                    )}
                </div>
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
  const location = useLocation();
  const { completedLessons, allCourses, allQuestions, role, user, enrollCourse, addCertificate, setUser, setUsers, users, appLogo, logActivity, certificateConfig, quizTimeConfig } = React.useContext(AppContext);
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
  // MEMOIZE THIS to prevent new array reference on every render, which causes QuizModal to reset loops
  const relevantQuestions = useMemo(() => allQuestions.filter(q => 
      q.courseId === course.id && q.level === currentLevel
  ), [allQuestions, course.id, currentLevel]);

  const handleQuizAttempt = (result: QuizResult) => {
      // Log EVERY attempt
      if (user) {
          logActivity({
              userId: user.id,
              courseId: course.id,
              itemId: `quiz-level-${currentLevel}`,
              itemName: `Bài kiểm tra Level ${currentLevel}`,
              type: ActivityType.QUIZ_ATTEMPT,
              metadata: {
                  score: result.score,
                  passed: result.passed
              }
          });
      }
  };

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
  };

  // Get time limit for current level
  const timeLimit = quizTimeConfig[currentLevel] || 1;

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
        onAttempt={handleQuizAttempt}
        timePerQuestion={timeLimit}
      />

      {certData && (
        <div className={`${showCert ? 'block' : 'hidden'}`}>
             <Certificate 
                data={certData} 
                config={certificateConfig}
                onClose={() => setShowCert(false)} 
                onHome={handleHome} 
                logoUrl={appLogo} 
             />
        </div>
      )}
    </div>
  );
};

// ... AdminDashboard, MainApp, App components ...
// Assuming they are preserved or I will re-output AdminDashboard where changes are needed.

const AdminDashboard = () => {
  const { role, allCourses, setAllCourses, allQuestions, setAllQuestions, users, setUsers, setUser, user, activityLogs } = React.useContext(AppContext);
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

  // Settings Route
  if (location.pathname === '/admin/settings') {
      return <SystemSettings />;
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
  
  // INITIALIZE USERS FROM LOCAL STORAGE OR DEFAULT
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [allCourses, setAllCourses] = useState<Course[]>(MOCK_COURSES);
  const [allQuestions, setAllQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  // Initialize appLogo from localStorage or default
  const [appLogo, setAppLogo] = useState<string>(() => {
    return localStorage.getItem('app_logo') || '/logonew.png';
  });

  // Initialize language from localStorage or default
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('app_language') || 'vi';
  });

  // Initialize Activity Logs from localStorage
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('app_activity_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize Certificate Config from localStorage
  const [certificateConfig, setCertificateConfig] = useState<CertificateConfig>(() => {
    const saved = localStorage.getItem('app_certificate_config');
    return saved ? JSON.parse(saved) : {
      backgroundImage: '',
      issuerName: 'TS. Phạm Văn B',
      issuerTitle: 'GIÁM ĐỐC ĐÀO TẠO',
      signatureImage: ''
    };
  });

  // Initialize Quiz Time Config
  const [quizTimeConfig, setQuizTimeConfig] = useState<QuizTimeConfig>(() => {
      const saved = localStorage.getItem('app_quiz_time_config');
      return saved ? JSON.parse(saved) : { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 };
  });

  // FETCH GLOBAL SETTINGS ON MOUNT
  useEffect(() => {
    const fetchGlobalSettings = async () => {
        try {
            const res = await fetch(`${API_URL}?type=settings`);
            const data = await res.json();
            
            if (data && typeof data === 'object') {
                if (data.logo_url) setAppLogo(data.logo_url);
                
                setCertificateConfig({
                    backgroundImage: data.cert_bg || '',
                    issuerName: data.cert_signer || 'TS. Phạm Văn B',
                    issuerTitle: data.cert_role || 'GIÁM ĐỐC ĐÀO TẠO',
                    signatureImage: data.signature_url || ''
                });

                // Update: Use correct key names 'time_level_x'
                setQuizTimeConfig({
                    1: Number(data.time_level_1) || 1,
                    2: Number(data.time_level_2) || 1,
                    3: Number(data.time_level_3) || 1,
                    4: Number(data.time_level_4) || 1,
                    5: Number(data.time_level_5) || 1
                });
            }
        } catch (error) {
            console.error("Auto-fetch settings failed:", error);
        }
    };
    fetchGlobalSettings();
  }, []);

  // Persist logo changes
  useEffect(() => {
    localStorage.setItem('app_logo', appLogo);
  }, [appLogo]);

  // Persist language changes
  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  // Persist users changes
  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  // Persist activity logs
  useEffect(() => {
    localStorage.setItem('app_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Persist certificate config
  useEffect(() => {
    localStorage.setItem('app_certificate_config', JSON.stringify(certificateConfig));
  }, [certificateConfig]);

  // Persist quiz time config
  useEffect(() => {
    localStorage.setItem('app_quiz_time_config', JSON.stringify(quizTimeConfig));
  }, [quizTimeConfig]);

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

  const logActivity = (logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
      const newLog: ActivityLog = {
          ...logData,
          id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString()
      };
      setActivityLogs(prevLogs => [newLog, ...prevLogs]); // Newest first
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
        logout,
        appLogo, setAppLogo,
        language, setLanguage,
        activityLogs, logActivity,
        certificateConfig, setCertificateConfig,
        quizTimeConfig, setQuizTimeConfig
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