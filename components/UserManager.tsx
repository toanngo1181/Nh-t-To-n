import React, { useState } from 'react';
import { User, Role } from '../types';
import { Plus, Trash2, Edit, Save, X, Search, Shield, User as UserIcon, Users, Lock, Key } from 'lucide-react';

// REPLACE THIS WITH YOUR ACTUAL DEPLOYED GOOGLE APPS SCRIPT WEB APP URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzPg7uA_zeQ_rUf3smdQehHPDFwePpvXPFsIfkKeXgcUmbK_MOPp9mR8KPz6vfXs9i/exec';

interface UserManagerProps {
  currentUserRole: Role;
  users: User[];
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUserRole, users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State - Matching specific requirements
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    role: Role.LEARNER,
    department: ''
  });

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      username: '',
      password: '',
      role: Role.LEARNER,
      department: ''
    });
    setEditingUser(null);
    setIsSubmitting(false);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.name,
        email: user.email,
        username: user.username,
        password: user.password || '', // Allow editing password
        role: user.role,
        department: user.department
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.username || !formData.password) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc (Tên, Email, Username, Password)!");
      return;
    }

    // Check unique username (if new user or username changed)
    const isUsernameTaken = users.some(u => 
        u.username.toLowerCase() === formData.username.toLowerCase() && 
        (!editingUser || u.id !== editingUser.id)
    );

    if (isUsernameTaken) {
        alert("Tên đăng nhập này đã tồn tại! Vui lòng chọn tên khác.");
        return;
    }

    setIsSubmitting(true);

    // 1. Prepare JSON Payload for Backend (Strict Structure)
    const apiPayload = {
      type: 'users',
      fullName: formData.fullName,
      email: formData.email,
      username: formData.username,
      // Note: Sending password to Google Sheet insecurely is for demo only
      password: formData.password, 
      role: formData.role,
      department: formData.department
    };

    try {
      // 2. Send POST request to Google Apps Script
      // NOTE: In local dev or without CORS proxy, this might fail or be opaque.
      // We process the local state update regardless for immediate UI feedback.
      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      }).catch(err => console.error("Sync error", err));

      // 3. Update Local State (Optimistic UI)
      const localUser: User = editingUser 
        ? { 
            ...editingUser, 
            name: formData.fullName, 
            email: formData.email, 
            username: formData.username,
            password: formData.password,
            role: formData.role, 
            department: formData.department 
          }
        : {
            id: `u-${Date.now()}`,
            name: formData.fullName,
            username: formData.username,
            password: formData.password,
            email: formData.email,
            role: formData.role,
            avatar: `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`,
            department: formData.department,
            enrollments: []
          };

      if (editingUser) {
        onUpdateUser(localUser);
      } else {
        onAddUser(localUser);
      }

      alert(editingUser ? "Cập nhật thành công!" : "Tạo tài khoản thành công!");
      setIsModalOpen(false);
      resetForm();

    } catch (error) {
      console.error("Error:", error);
      alert("Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Users
  const visibleUsers = users.filter(u => {
      if (currentUserRole === Role.ADMIN) return true;
      if (currentUserRole === Role.INSTRUCTOR) return u.role === Role.LEARNER;
      return false; 
  });

  const filteredUsers = visibleUsers.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Học viên</h1>
          <p className="text-gray-600">Tạo tài khoản và cấp thông tin đăng nhập.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md"
        >
          <Plus size={20} /> Tạo tài khoản mới
        </button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm kiếm theo tên, email hoặc username..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Học viên</th>
              <th className="px-6 py-4">Tài khoản</th>
              <th className="px-6 py-4">Vai trò</th>
              <th className="px-6 py-4">Phòng ban</th>
              <th className="px-6 py-4">Tiến độ</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="" />
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="text-sm font-medium text-gray-800">{user.username}</div>
                   <div className="text-xs text-gray-500 font-mono">Pass: {user.password || '***'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1 ${
                    user.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' :
                    user.role === Role.INSTRUCTOR ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === Role.ADMIN && <Shield size={12}/>}
                    {user.role === Role.INSTRUCTOR && <Users size={12}/>}
                    {user.role === Role.LEARNER && <UserIcon size={12}/>}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.department}</td>
                <td className="px-6 py-4 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                        {user.enrollments?.length || 0} khóa học
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(user)}
                      className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded"
                      title="Sửa"
                    >
                      <Edit size={18} />
                    </button>
                    {(currentUserRole === Role.ADMIN || (currentUserRole === Role.INSTRUCTOR && user.role === Role.LEARNER)) && (
                        <button 
                        onClick={() => { if(confirm('Xóa người dùng này?')) onDeleteUser(user.id) }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Xóa"
                        >
                        <Trash2 size={18} />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                        Không tìm thấy học viên nào.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">{editingUser ? 'Sửa thông tin tài khoản' : 'Tạo tài khoản mới'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-500 hover:text-gray-700"/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {/* Full Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên (Full Name) <span className="text-red-500">*</span></label>
                <input 
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input 
                  required
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>

              {/* ACCOUNT CREDENTIALS SECTION */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-800 uppercase mb-3 flex items-center gap-1">
                      <Lock size={12}/> Thông tin đăng nhập
                  </h4>
                  <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập (Username) <span className="text-red-500">*</span></label>
                        <input 
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white"
                            value={formData.username}
                            onChange={e => setFormData({...formData, username: e.target.value.replace(/\s/g, '')})}
                            placeholder="VD: user123"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu (Password) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input 
                                required
                                type="text" 
                                className="w-full p-2 pl-8 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none bg-white font-mono"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                placeholder="Nhập mật khẩu"
                            />
                            <Key size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Lưu ý: Hãy ghi lại mật khẩu này để cấp cho người dùng.</p>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Role Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò (Role)</label>
                    <select 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                    disabled={currentUserRole === Role.INSTRUCTOR}
                    >
                        <option value={Role.LEARNER}>Học viên (LEARNER)</option>
                        {currentUserRole === Role.ADMIN && <option value={Role.INSTRUCTOR}>Giảng viên (INSTRUCTOR)</option>}
                        {currentUserRole === Role.ADMIN && <option value={Role.ADMIN}>Admin (ADMIN)</option>}
                    </select>
                </div>
                {/* Department Field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban (Department)</label>
                    <input 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                    value={formData.department}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                    placeholder="VD: Trại số 1"
                    />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-2 bg-brand-blue text-white rounded hover:bg-blue-700 flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                    <Save size={18} /> {isSubmitting ? 'Đang lưu...' : 'Lưu tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;