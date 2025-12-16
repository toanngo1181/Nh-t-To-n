import React, { useState, useEffect, useRef, useContext } from 'react';
import { Plus, Loader2, FileText, Video, Image as ImageIcon, X, User as UserIcon, Upload, AlertTriangle, Edit, Save, CheckCircle, Tag } from 'lucide-react';
import { AppContext } from '../App';

const API_URL = 'https://script.google.com/macros/s/AKfycbxzPg7uA_zeQ_rUf3smdQehHPDFwePpvXPFsIfkKeXgcUmbK_MOPp9mR8KPz6vfXs9i/exec';

interface Topic {
  id: string;
  topicName: string;
  category: string; 
  cover_image: string; // URL cover
  document_file: string; // URL PDF/Doc
  video_file: string; // URL Video
  image_file?: string; // URL Image content
  createdBy: string;
  timestamp: string;
}

const TopicManagement: React.FC = () => {
  const { refreshCourses } = useContext(AppContext);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Mode State
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    topicName: '',
    category: ''
  });

  // New File State (Base64) - Only populated if user selects a NEW file
  const [newFiles, setNewFiles] = useState({
    coverImage: '',
    documentFile: '',
    videoFile: '',
    imageFile: ''
  });

  // File Input Refs (to clear them)
  const coverInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Topics on Mount
  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}?type=topics`);
      const data = await response.json();
      if (Array.isArray(data)) {
        // Ensure ID exists (fallback to timestamp if API doesn't send explicit ID)
        const mappedData = data.map((item: any) => ({
            ...item,
            id: item.id || item.timestamp || `topic-${Math.random()}`,
            category: item.category || 'Chưa phân loại'
        }));
        setTopics(mappedData);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Helper: Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // 3. Handle File Selection & Validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'documentFile' | 'videoFile' | 'imageFile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDATION: Video Size < 25MB
    if (field === 'videoFile') {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > 25) {
        alert(`File video quá lớn (${sizeInMB.toFixed(2)}MB). Vui lòng chọn video dưới 25MB để tránh lỗi hệ thống.`);
        if (videoInputRef.current) videoInputRef.current.value = ''; // Clear input
        return;
      }
    }

    try {
      const base64 = await fileToBase64(file);
      setNewFiles(prev => ({ ...prev, [field]: base64 }));
    } catch (error) {
      console.error("Error converting file:", error);
      alert("Lỗi khi đọc file.");
    }
  };

  // 4. Handle Edit Click
  const handleEditClick = (topic: Topic) => {
      setEditingTopic(topic);
      setFormData({
          topicName: topic.topicName,
          category: topic.category
      });
      // Reset new files (user hasn't picked new ones yet)
      setNewFiles({ coverImage: '', documentFile: '', videoFile: '', imageFile: '' });
      setIsModalOpen(true);
  };

  // 5. Handle Add New Click
  const handleAddNewClick = () => {
      setEditingTopic(null);
      setFormData({ topicName: '', category: '' });
      setNewFiles({ coverImage: '', documentFile: '', videoFile: '', imageFile: '' });
      setIsModalOpen(true);
  };

  // 6. Submit Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topicName || !formData.category) {
      alert("Vui lòng nhập tên chủ đề và danh mục.");
      return;
    }

    setIsSubmitting(true);

    // Get Creator Name from localStorage
    let creatorName = "Giảng viên";
    try {
        const rawUser = localStorage.getItem("user"); 
        if (rawUser) {
            const parsed = JSON.parse(rawUser);
            creatorName = parsed.name || parsed.username || "Giảng viên";
        }
    } catch (err) {
        console.warn("Could not parse user");
    }

    // Construct Payload
    const payload = {
      type: "topics",
      id: editingTopic ? editingTopic.id : undefined, // ID for editing
      topicName: formData.topicName,
      category: formData.category,
      // Logic: If new file selected, send it. Else send empty string (Backend preserves old).
      cover_image: newFiles.coverImage || "", 
      document_file: newFiles.documentFile || "",
      video_file: newFiles.videoFile || "",
      image_file: newFiles.imageFile || "",
      createdBy: creatorName
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        mode: 'no-cors',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert(editingTopic ? "Cập nhật thành công!" : "Thêm mới thành công!");
      setIsModalOpen(false);
      
      // Reset Form Refs
      if (coverInputRef.current) coverInputRef.current.value = '';
      if (docInputRef.current) docInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';

      // Refresh list locally
      fetchTopics();
      
      // Refresh global courses list in App.tsx
      if (refreshCourses) {
          setTimeout(refreshCourses, 2000); // Small delay to allow backend to process
      }

    } catch (error) {
      console.error("Error submitting topic:", error);
      alert("Có lỗi xảy ra khi gửi dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Học liệu</h1>
          <p className="text-gray-600">Tải lên và chỉnh sửa các chủ đề, tài liệu, hình ảnh và video đào tạo.</p>
        </div>
        <button 
          onClick={handleAddNewClick}
          className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={20} /> Thêm chủ đề mới
        </button>
      </div>

      {/* LIST TOPICS */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500">Chưa có học liệu nào được tải lên.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {topics.map((topic, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative">
              {/* Card Image */}
              <div className="h-48 bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                {topic.cover_image ? (
                  <img src={topic.cover_image} alt={topic.topicName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={48} opacity={0.2} />
                  </div>
                )}
                {/* Category Badge */}
                <div className="absolute top-2 left-2 bg-brand-blue/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm shadow-sm flex items-center gap-1">
                   <Tag size={10} /> {topic.category}
                </div>
                {/* Creator Badge */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                    <UserIcon size={10} /> {topic.createdBy}
                </div>
              </div>

              {/* Action Buttons (Edit) */}
              <button 
                onClick={() => handleEditClick(topic)}
                className="absolute top-12 right-2 bg-white text-gray-700 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:text-brand-blue hover:bg-blue-50 transform translate-x-2 group-hover:translate-x-0"
                title="Chỉnh sửa"
              >
                  <Edit size={16} />
              </button>

              {/* Card Content */}
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-lg mb-4 line-clamp-2 min-h-[3.5rem]">
                  {topic.topicName}
                </h3>
                
                <div className="flex flex-col gap-2">
                  {topic.document_file ? (
                    <a 
                      href={topic.document_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <FileText size={16} /> Xem Tài liệu
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium border border-dashed border-gray-200 cursor-default">
                       <FileText size={16} /> Không có tài liệu
                    </div>
                  )}

                  {topic.video_file ? (
                    <a 
                      href={topic.video_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                    >
                      <Video size={16} /> Xem Video
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium border border-dashed border-gray-200 cursor-default">
                       <Video size={16} /> Không có Video
                    </div>
                  )}

                  {topic.image_file ? (
                    <a 
                      href={topic.image_file} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                      <ImageIcon size={16} /> Xem Hình ảnh
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium border border-dashed border-gray-200 cursor-default">
                       <ImageIcon size={16} /> Không có Hình ảnh
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                  {editingTopic ? 'Chỉnh Sửa Học Liệu' : 'Thêm Học Liệu Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              
              <div className="grid grid-cols-1 gap-4">
                  {/* Topic Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ đề <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      placeholder="VD: Kỹ thuật tiêm phòng vaccine..."
                      value={formData.topicName}
                      onChange={(e) => setFormData({...formData, topicName: e.target.value})}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục (Category) <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      list="categories"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      placeholder="VD: Kỹ thuật, Thú y, Quản lý..."
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    />
                    <datalist id="categories">
                        <option value="Kỹ thuật trại" />
                        <option value="Thú y" />
                        <option value="Quản lý" />
                        <option value="An toàn sinh học" />
                    </datalist>
                  </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa (Cover Image)</label>
                
                {/* Existing Preview (Edit Mode) */}
                {editingTopic && editingTopic.cover_image && !newFiles.coverImage && (
                    <div className="mb-2 p-2 bg-gray-100 rounded border flex items-center gap-3">
                        <img src={editingTopic.cover_image} className="w-12 h-12 object-cover rounded" alt="Current"/>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs text-gray-500">Ảnh hiện tại</p>
                            <p className="text-xs truncate font-mono text-gray-400">{editingTopic.cover_image}</p>
                        </div>
                    </div>
                )}

                <div className={`border border-dashed rounded-lg p-4 bg-gray-50 text-center relative hover:bg-gray-100 transition-colors ${newFiles.coverImage ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}>
                  <input 
                    ref={coverInputRef}
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => handleFileChange(e, 'coverImage')}
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    {newFiles.coverImage ? (
                      <div className="relative">
                         <img src={newFiles.coverImage} alt="New Preview" className="h-24 object-contain rounded shadow-sm" />
                         <span className="text-xs text-green-600 mt-1 flex items-center gap-1 font-bold"><CheckCircle size={12}/> Ảnh mới đã chọn</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">
                            {editingTopic ? 'Nhấn để thay đổi ảnh bìa' : 'Nhấn để tải ảnh lên'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Document File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tài liệu (PDF/DOC)</label>
                
                {/* Existing Document Indicator */}
                {editingTopic && editingTopic.document_file && !newFiles.documentFile && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                        <FileText size={14}/> 
                        <a href={editingTopic.document_file} target="_blank" className="underline truncate flex-1">Tài liệu hiện tại (Click để xem)</a>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <input 
                        ref={docInputRef}
                        type="file" 
                        accept=".pdf,.doc,.docx"
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        onChange={(e) => handleFileChange(e, 'documentFile')}
                    />
                </div>
                {newFiles.documentFile && <p className="text-xs text-green-600 mt-1 pl-2 font-bold">✓ Đã chọn file mới thay thế</p>}
              </div>

              {/* Video File */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <label className="block text-sm font-bold text-orange-800 mb-1 flex items-center gap-2">
                    <Video size={16}/> Video Đào tạo
                </label>
                
                {/* Existing Video Indicator */}
                {editingTopic && editingTopic.video_file && !newFiles.videoFile && (
                    <div className="flex items-center gap-2 mb-3 text-xs text-orange-700 bg-white p-2 rounded border border-orange-200">
                        <Video size={14}/> 
                        <a href={editingTopic.video_file} target="_blank" className="underline truncate flex-1">Video hiện tại đang sử dụng</a>
                    </div>
                )}

                <p className="text-xs text-orange-600 mb-3 flex items-center gap-1">
                    <AlertTriangle size={12}/> Lưu ý: Dung lượng tối đa 25MB
                </p>
                <input 
                    ref={videoInputRef}
                    type="file" 
                    accept="video/mp4,video/webm"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                    onChange={(e) => handleFileChange(e, 'videoFile')}
                />
                {newFiles.videoFile && <p className="text-xs text-green-600 mt-1 pl-2 font-bold">✓ Đã chọn video mới</p>}
              </div>

              {/* Image File (New) */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <label className="block text-sm font-bold text-purple-800 mb-1 flex items-center gap-2">
                    <ImageIcon size={16}/> Hình ảnh học liệu
                </label>
                
                {/* Existing Image Indicator */}
                {editingTopic && editingTopic.image_file && !newFiles.imageFile && (
                    <div className="flex items-center gap-2 mb-3 text-xs text-purple-700 bg-white p-2 rounded border border-purple-200">
                        <ImageIcon size={14}/> 
                        <a href={editingTopic.image_file} target="_blank" className="underline truncate flex-1">Hình ảnh hiện tại (Click để xem)</a>
                    </div>
                )}

                <input 
                    ref={imageInputRef}
                    type="file" 
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                    onChange={(e) => handleFileChange(e, 'imageFile')}
                />
                {newFiles.imageFile && <p className="text-xs text-green-600 mt-1 pl-2 font-bold">✓ Đã chọn hình ảnh mới</p>}
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className={`flex-1 py-3 bg-brand-blue text-white rounded-lg shadow-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (editingTopic ? <Save size={20}/> : <Upload size={20} />)}
                  {isSubmitting ? 'Đang xử lý...' : (editingTopic ? 'Lưu Thay Đổi' : 'Tạo Mới')}
                </button>
              </div>
              {isSubmitting && (
                  <p className="text-center text-xs text-gray-500 animate-pulse">Quá trình tải file có thể mất vài phút, vui lòng không tắt trình duyệt...</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicManagement;