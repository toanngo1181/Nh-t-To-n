import React, { useState, useEffect } from 'react';
import { Course, Topic, Lesson, ContentType } from '../types';
import { Plus, Trash2, Save, Video, FileText, LayoutList, Upload, Link as LinkIcon, Image as ImageIcon, X } from 'lucide-react';

interface CourseEditorProps {
  initialData?: Course | null;
  onSave: (course: Course) => void;
  onCancel: () => void;
}

// Helper component for Media Upload/URL
const MediaInput = ({ 
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
  const [inputType, setInputType] = useState<'URL' | 'FILE'>('URL');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload by converting to Data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={() => setInputType('URL')}
          className={`px-3 py-1 text-xs rounded-full border ${inputType === 'URL' ? 'bg-blue-50 border-brand-blue text-brand-blue' : 'bg-white border-gray-200 text-gray-600'}`}
        >
          <LinkIcon size={12} className="inline mr-1"/> Link Online
        </button>
        <button 
          onClick={() => setInputType('FILE')}
          className={`px-3 py-1 text-xs rounded-full border ${inputType === 'FILE' ? 'bg-blue-50 border-brand-blue text-brand-blue' : 'bg-white border-gray-200 text-gray-600'}`}
        >
          <Upload size={12} className="inline mr-1"/> Tải lên
        </button>
      </div>

      {inputType === 'URL' ? (
        <input 
          type="text" 
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
        />
      ) : (
        <div className="border border-dashed border-gray-300 rounded p-4 bg-gray-50 text-center relative group">
           <input 
             type="file" 
             accept={accept}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             onChange={handleFileChange}
           />
           <div className="pointer-events-none">
             {value && value.startsWith('data:') ? (
                <div className="text-green-600 text-sm flex items-center justify-center gap-2">
                  <CheckCircle size={16}/> Đã chọn file
                </div>
             ) : (
                <span className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Upload size={16}/> Chọn file từ máy tính
                </span>
             )}
           </div>
        </div>
      )}
      {/* Preview if Image */}
      {accept.includes('image') && value && (
        <img src={value} alt="Preview" className="mt-2 w-full h-32 object-cover rounded border border-gray-200" />
      )}
    </div>
  );
};

const CheckCircle = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

const CourseEditor: React.FC<CourseEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [course, setCourse] = useState<Partial<Course>>({
    id: `c-${Date.now()}`,
    title: '',
    description: '',
    thumbnail: 'https://picsum.photos/800/600',
    level: 1,
    category: 'Kỹ thuật trại',
    instructor: 'Admin',
    progress: 0,
    totalStudents: 0,
    topics: []
  });

  // Initialize data if editing
  useEffect(() => {
    if (initialData) {
      setCourse(JSON.parse(JSON.stringify(initialData))); // Deep copy to avoid direct mutation
    }
  }, [initialData]);

  const addTopic = () => {
    const newTopic: Topic = {
      id: `t-${Date.now()}`,
      title: `Chương ${course.topics ? course.topics.length + 1 : 1}`,
      lessons: []
    };
    setCourse(prev => ({ ...prev, topics: [...(prev.topics || []), newTopic] }));
  };

  const removeTopic = (index: number) => {
    const newTopics = [...(course.topics || [])];
    newTopics.splice(index, 1);
    setCourse(prev => ({ ...prev, topics: newTopics }));
  };

  const updateTopicTitle = (index: number, title: string) => {
    const newTopics = [...(course.topics || [])];
    newTopics[index].title = title;
    setCourse(prev => ({ ...prev, topics: newTopics }));
  };

  const addLesson = (topicIndex: number) => {
    const newLesson: Lesson = {
      id: `l-${Date.now()}`,
      title: 'Bài học mới',
      type: ContentType.VIDEO,
      duration: '00:00',
      isCompleted: false,
      url: '',
      level: 1
    };
    const newTopics = [...(course.topics || [])];
    newTopics[topicIndex].lessons.push(newLesson);
    setCourse(prev => ({ ...prev, topics: newTopics }));
  };

  const removeLesson = (topicIndex: number, lessonIndex: number) => {
    const newTopics = [...(course.topics || [])];
    newTopics[topicIndex].lessons.splice(lessonIndex, 1);
    setCourse(prev => ({ ...prev, topics: newTopics }));
  };

  const updateLesson = (topicIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    const newTopics = [...(course.topics || [])];
    newTopics[topicIndex].lessons[lessonIndex] = {
      ...newTopics[topicIndex].lessons[lessonIndex],
      [field]: value
    };
    setCourse(prev => ({ ...prev, topics: newTopics }));
  };

  const handleSave = () => {
    if (!course.title || !course.description) {
      alert("Vui lòng nhập tên và mô tả khóa học");
      return;
    }
    if ((course.topics || []).length === 0) {
      alert("Vui lòng thêm ít nhất một chương học");
      return;
    }
    onSave(course as Course);
  };

  // State for expanded lessons to edit details
  const [expandedLesson, setExpandedLesson] = useState<{tIdx: number, lIdx: number} | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-100px)]">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-800">
          {initialData ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
        </h2>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
          <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white rounded-lg flex items-center gap-2 hover:bg-blue-700">
            <Save size={18} /> {initialData ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Basic Info */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 border-b pb-2">Thông tin chung</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                value={course.title}
                onChange={e => setCourse({...course, title: e.target.value})}
                placeholder="VD: Kỹ thuật chăn nuôi..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea 
                rows={4}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                value={course.description}
                onChange={e => setCourse({...course, description: e.target.value})}
                placeholder="Mô tả ngắn gọn về khóa học..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded"
                  value={course.category}
                  onChange={e => setCourse({...course, category: e.target.value})}
                >
                  <option>Kỹ thuật trại</option>
                  <option>Thú y</option>
                  <option>Quản lý</option>
                  <option>Kỹ năng mềm</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded"
                  value={course.level}
                  onChange={e => setCourse({...course, level: Number(e.target.value)})}
                >
                  {[1,2,3,4,5].map(l => <option key={l} value={l}>Level {l}</option>)}
                </select>
              </div>
            </div>
            
            <MediaInput 
              label="Ảnh bìa khóa học"
              value={course.thumbnail || ''}
              onChange={(val) => setCourse({...course, thumbnail: val})}
              accept="image/*"
            />
          </div>

          {/* Right Column: Syllabus Builder */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-700">Nội dung đào tạo</h3>
              <button onClick={addTopic} className="text-sm text-brand-blue flex items-center gap-1 font-medium hover:underline">
                <Plus size={16} /> Thêm chương
              </button>
            </div>

            <div className="space-y-4">
              {course.topics?.map((topic, tIdx) => (
                <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <div className="bg-gray-100 p-3 flex items-center gap-3">
                    <LayoutList size={18} className="text-gray-500" />
                    <input 
                        className="bg-transparent font-bold text-gray-700 flex-1 outline-none border-b border-transparent focus:border-brand-blue"
                        value={topic.title}
                        onChange={(e) => updateTopicTitle(tIdx, e.target.value)}
                    />
                    <button onClick={() => removeTopic(tIdx)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    {topic.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="border border-gray-100 rounded bg-gray-50">
                        {/* Header of Lesson Card */}
                        <div className="flex items-center gap-2 p-2">
                          <select 
                            className="text-xs bg-white border border-gray-200 rounded p-1 cursor-pointer"
                            value={lesson.type}
                            onChange={(e) => updateLesson(tIdx, lIdx, 'type', e.target.value)}
                          >
                            <option value={ContentType.VIDEO}>Video</option>
                            <option value={ContentType.PDF}>PDF</option>
                          </select>
                          
                          <input 
                            className="flex-1 bg-transparent text-sm outline-none px-2 font-medium"
                            value={lesson.title}
                            placeholder="Tên bài học"
                            onChange={(e) => updateLesson(tIdx, lIdx, 'title', e.target.value)}
                          />

                          <input 
                            className="w-16 bg-white border border-gray-200 rounded px-2 py-1 text-xs text-center"
                            value={lesson.duration}
                            placeholder="Thời lượng"
                            onChange={(e) => updateLesson(tIdx, lIdx, 'duration', e.target.value)}
                          />

                          <button 
                            onClick={() => setExpandedLesson(expandedLesson?.lIdx === lIdx && expandedLesson.tIdx === tIdx ? null : {tIdx, lIdx})}
                            className={`text-xs px-2 py-1 rounded border ${expandedLesson?.lIdx === lIdx && expandedLesson.tIdx === tIdx ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200'}`}
                          >
                            {expandedLesson?.lIdx === lIdx && expandedLesson.tIdx === tIdx ? 'Ẩn chi tiết' : 'Chi tiết'}
                          </button>

                          <button onClick={() => removeLesson(tIdx, lIdx)} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Expanded Detail for File Upload */}
                        {expandedLesson?.tIdx === tIdx && expandedLesson?.lIdx === lIdx && (
                          <div className="p-3 border-t border-gray-100 bg-white animate-fade-in">
                            <MediaInput 
                              label={lesson.type === ContentType.VIDEO ? "Upload Video hoặc dán Link" : "Upload tài liệu PDF"}
                              value={lesson.url || ''}
                              onChange={(val) => updateLesson(tIdx, lIdx, 'url', val)}
                              accept={lesson.type === ContentType.VIDEO ? "video/*" : "application/pdf"}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <button 
                      onClick={() => addLesson(tIdx)}
                      className="w-full py-2 border border-dashed border-gray-300 rounded text-gray-500 text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Thêm bài học
                    </button>
                  </div>
                </div>
              ))}

              {(!course.topics || course.topics.length === 0) && (
                <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  Chưa có nội dung nào. Hãy thêm chương học đầu tiên.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;