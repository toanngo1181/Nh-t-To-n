import React, { useContext, useState, useMemo } from 'react';
import { User, Course, ActivityLog, ActivityType, Role } from '../types';
import { Search, User as UserIcon, BookOpen, Clock, FileText, CheckCircle, XCircle, AlertTriangle, Eye, ChevronRight, School, Download } from 'lucide-react';

interface ClassManagerProps {
  users: User[];
  courses: Course[];
  activityLogs: ActivityLog[];
}

const ClassManager: React.FC<ClassManagerProps> = ({ users, courses, activityLogs }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filter Learners
  const learners = useMemo(() => {
    return users.filter(u => u.role === Role.LEARNER && (
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [users, searchTerm]);

  const selectedUser = users.find(u => u.id === selectedUserId);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // 2. Get Courses for Selected User
  const userCourses = useMemo(() => {
      if (!selectedUserId) return [];
      const user = users.find(u => u.id === selectedUserId);
      if (!user) return [];
      return courses.filter(c => user.enrollments.some(e => e.courseId === c.id));
  }, [selectedUserId, users, courses]);

  // 3. Get Logs for User + Course
  const userLogs = useMemo(() => {
      if (!selectedUserId) return [];
      let logs = activityLogs.filter(log => log.userId === selectedUserId);
      
      if (selectedCourseId) {
          logs = logs.filter(log => log.courseId === selectedCourseId);
      }
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedUserId, selectedCourseId, activityLogs]);

  // 4. Calculate Stats
  const stats = useMemo(() => {
      const totalViews = userLogs.filter(l => l.type === ActivityType.LESSON_VIEW).length;
      const totalQuizzes = userLogs.filter(l => l.type === ActivityType.QUIZ_ATTEMPT).length;
      const passedQuizzes = userLogs.filter(l => l.type === ActivityType.QUIZ_ATTEMPT && l.metadata?.passed).length;
      
      const quizScores = userLogs
        .filter(l => l.type === ActivityType.QUIZ_ATTEMPT && l.metadata?.score !== undefined)
        .map(l => l.metadata!.score!);
      
      const avgScore = quizScores.length > 0 
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) 
        : 0;

      return { totalViews, totalQuizzes, passedQuizzes, avgScore };
  }, [userLogs]);

  // 5. Handle Export to CSV
  const handleExport = () => {
      if (!selectedUser || userLogs.length === 0) {
          alert("Không có dữ liệu để xuất.");
          return;
      }

      // Headers
      const headers = [
          "Thời gian",
          "Học viên",
          "Mã học viên",
          "Phòng ban",
          "Khóa học",
          "Loại hoạt động",
          "Chi tiết (Bài học/Bài thi)",
          "Điểm số",
          "Kết quả"
      ];

      // Rows
      const rows = userLogs.map(log => {
          const courseTitle = courses.find(c => c.id === log.courseId)?.title || "Unknown Course";
          const typeText = log.type === ActivityType.LESSON_VIEW ? "Xem bài học" : "Làm bài kiểm tra";
          const score = log.metadata?.score !== undefined ? log.metadata.score : "";
          const result = log.metadata?.passed !== undefined ? (log.metadata.passed ? "Đậu" : "Trượt") : "";
          
          // Escape quotes for CSV
          const safeName = `"${log.itemName.replace(/"/g, '""')}"`;
          const safeCourse = `"${courseTitle.replace(/"/g, '""')}"`;
          const safeStudent = `"${selectedUser.name}"`;
          const safeDept = `"${selectedUser.department}"`;

          return [
              `"${new Date(log.timestamp).toLocaleString('vi-VN')}"`,
              safeStudent,
              selectedUser.username,
              safeDept,
              safeCourse,
              typeText,
              safeName,
              score,
              result
          ].join(",");
      });

      // Combine with BOM for Excel Vietnamese support
      const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Baocao_${selectedUser.username}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <School className="text-brand-blue"/> Quản lý Lớp học & Lịch sử
        </h1>
        <p className="text-gray-600">Theo dõi chi tiết hoạt động, tần suất học và kết quả kiểm tra của học viên.</p>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* LEFT COLUMN: User List */}
        <div className="w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Tìm học viên..." 
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {learners.map(user => (
                    <button
                        key={user.id}
                        onClick={() => { setSelectedUserId(user.id); setSelectedCourseId(null); }}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedUserId === user.id ? 'bg-blue-50 border-blue-200 ring-1 ring-brand-blue' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                        <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt=""/>
                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${selectedUserId === user.id ? 'text-brand-blue' : 'text-gray-800'}`}>{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.username} - {user.department}</p>
                        </div>
                        <ChevronRight size={16} className={`text-gray-400 ${selectedUserId === user.id ? 'text-brand-blue' : ''}`}/>
                    </button>
                ))}
            </div>
        </div>

        {/* MIDDLE & RIGHT: Details */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            {!selectedUserId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <UserIcon size={64} className="mb-4 opacity-20"/>
                    <p>Chọn một học viên để xem chi tiết</p>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    {/* User Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                         <div className="flex items-center gap-4">
                            <img src={selectedUser?.avatar} className="w-16 h-16 rounded-full border-4 border-white shadow-sm" alt=""/>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedUser?.name}</h2>
                                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                    <span className="flex items-center gap-1"><UserIcon size={14}/> {selectedUser?.username}</span>
                                    <span className="flex items-center gap-1"><School size={14}/> {selectedUser?.department}</span>
                                </div>
                            </div>
                         </div>
                         <div className="flex gap-4 items-center">
                            <div className="text-center px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hidden lg:block">
                                <p className="text-xs text-gray-500 uppercase font-bold">Lượt học</p>
                                <p className="text-xl font-bold text-brand-blue">{stats.totalViews}</p>
                            </div>
                            <div className="text-center px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hidden lg:block">
                                <p className="text-xs text-gray-500 uppercase font-bold">Lượt thi</p>
                                <p className="text-xl font-bold text-brand-orange">{stats.totalQuizzes}</p>
                            </div>
                            <div className="text-center px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hidden lg:block">
                                <p className="text-xs text-gray-500 uppercase font-bold">Điểm TB</p>
                                <p className="text-xl font-bold text-green-600">{stats.avgScore}</p>
                            </div>
                            
                            {/* EXPORT BUTTON */}
                            <button 
                                onClick={handleExport}
                                className="ml-2 flex flex-col items-center justify-center w-16 h-16 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 hover:border-green-300 transition-colors"
                                title="Xuất Excel (CSV)"
                            >
                                <Download size={20} className="mb-1"/>
                                <span className="text-[10px] font-bold">Excel</span>
                            </button>
                         </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Course Filter */}
                        <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50/50">
                            <div className="p-3 border-b border-gray-100 font-bold text-gray-700 text-sm">Lọc theo khóa học</div>
                            <div className="flex-1 overflow-y-auto p-2">
                                <button
                                    onClick={() => setSelectedCourseId(null)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm mb-1 ${!selectedCourseId ? 'bg-white shadow-sm font-bold text-brand-blue' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    Tất cả hoạt động
                                </button>
                                {userCourses.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCourseId(c.id)}
                                        className={`w-full text-left px-3 py-2 rounded text-sm mb-1 truncate ${selectedCourseId === c.id ? 'bg-white shadow-sm font-bold text-brand-blue' : 'text-gray-600 hover:bg-gray-100'}`}
                                        title={c.title}
                                    >
                                        {c.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activity Log Table */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-gray-100 font-bold text-gray-700 text-sm bg-white flex justify-between">
                                <span>Chi tiết hoạt động</span>
                                <span className="text-xs font-normal text-gray-500">Hiển thị {userLogs.length} bản ghi</span>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-medium w-40">Thời gian</th>
                                            <th className="px-4 py-3 font-medium">Hoạt động</th>
                                            <th className="px-4 py-3 font-medium">Chi tiết / Kết quả</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {userLogs.map(log => (
                                            <tr key={log.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14}/>
                                                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        {log.type === ActivityType.LESSON_VIEW ? (
                                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
                                                                <FileText size={16} />
                                                            </div>
                                                        ) : (
                                                            <div className="p-1.5 bg-orange-100 text-orange-600 rounded">
                                                                <AlertTriangle size={16} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-800">{log.itemName}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {courses.find(c => c.id === log.courseId)?.title || 'Unknown Course'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {log.type === ActivityType.LESSON_VIEW ? (
                                                        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">
                                                            <Eye size={12}/> Đã xem bài học
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-3">
                                                            <span className={`font-bold ${log.metadata?.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                                {log.metadata?.score}/100 điểm
                                                            </span>
                                                            {log.metadata?.passed ? (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 font-bold">ĐẬU</span>
                                                            ) : (
                                                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 font-bold">TRƯỢT</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {userLogs.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-4 py-12 text-center text-gray-400">
                                                    Chưa có dữ liệu hoạt động nào.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ClassManager;