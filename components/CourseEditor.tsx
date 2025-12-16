import React, { useState, useEffect, useRef } from 'react';
import { Course, Topic, Lesson, ContentType } from '../types';
import { Plus, Trash2, Save, Video, FileText, LayoutList, Upload, Link as LinkIcon, CheckCircle, X, Clock, BookOpen, AlertTriangle, FileUp, Film, ChevronUp } from 'lucide-react';

interface CourseEditorProps {
  initialData?: Course | null;
  onSave: (course: Course) => void;
  onCancel: () => void;
}

// --- HELPER FUNCTIONS ---

const getVideoDuration = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      const mins = Math.floor(duration / 60);
      const secs = Math.floor(duration % 60);
      resolve(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };
    video.onerror = () => resolve("00:00");
    video.src = URL.createObjectURL(file);
  });
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- COMPONENTS ---

// Media Input Component (Single File/Link)
const MediaInput = ({ 
  label, 
  value, 
  onChange, 
  onFileSelect,
  accept 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  onFileSelect?: (file: File) => void,
  accept: string 
}) => {
  const [inputType, setInputType] = useState<'URL' | 'FILE'>('URL');

  // Helper to trigger hidden file input
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onFileSelect) onFileSelect(file); // Pass raw file up for metadata
      try {
        const base64 = await fileToBase64(file);
        onChange(base64);
      } catch (err) {
        console.error("Error reading file", err);
      }
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      <div className="flex flex-col gap-3">
          {/* Input Type Toggles */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setInputType('URL')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${inputType === 'URL' ? 'bg-blue-50 border-brand-blue text-brand-blue font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              <LinkIcon size={12} className="inline mr-1"/> Link Online
            </button>
            <button 
              onClick={() => setInputType('FILE')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${inputType === 'FILE' ? 'bg-blue-50 border-brand-blue text-brand-blue font-bold' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              <Upload size={12} className="inline mr-1"/> Tải file từ máy
            </button>
          </div>

          {/* Input Area */}
          {inputType === 'URL' ? (
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none text-sm"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://example.com/video.mp4"
            />
          ) : (
            <div 
                onClick={() => hiddenInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center relative group hover:bg-gray-100 transition-colors cursor-pointer"
            >
               <input 
                 ref={hiddenInputRef}
                 type="file" 
                 accept={accept}
                 className="hidden"
                 onChange={handleFileChange}
               />
               <div className="pointer-events-none flex flex-col items-center justify-center gap-2">
                 {value && value.startsWith('data:') ? (
                    <>
                        <CheckCircle size={32} className="text-green-500"/> 
                        <span className="text-sm font-medium text-green-700">Đã chọn file thành công</span>
                        <span className="text-xs text-gray-500">(Nhấn để thay đổi)</span>
                    </>
                 ) : (
                    <>
                        <Upload size={24} className="text-gray-400 group-hover:text-brand-blue transition-colors"/> 
                        <span className="text-sm text-gray-600 font-medium">Nhấn để tải file lên</span>
                        <span className="text-xs text-gray-400">Hỗ trợ: {accept === 'video/*' ? 'MP4, WebM' : 'PDF'}</span>
                    </>
                 )}
               </div>
            </div>
          )}
          
          {/* Preview Link if URL */}
          {inputType === 'URL' && value && (
              <a href={value} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <LinkIcon size={10}/> Kiểm tra liên kết
              </a>
          )}
      </div>
    </div>
  );
};

// --- MAIN EDITOR COMPONENT ---

const CourseEditor: React.FC<CourseEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [course, setCourse] = useState<Partial<Course>>({
    id: `c-${Date.now()}`,
    title: '',
    description: '',
    thumbnail: 'https://picsum.photos/800/600',
    level: 5, // Default 5 levels
    category: 'Kỹ thuật trại',
    instructor: 'Giảng viên',
    progress: 0,
    totalStudents: 0,
    topics: []
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<{tIdx: number, lIdx: number} | null>(null);

  // References for bulk upload inputs per topic
  const videoInputRefs = useRef<{[key: number]: HTMLInputElement | null}>({});
  const pdfInputRefs = useRef<{[key: number]: HTMLInputElement | null}>({});

  useEffect(() => {
    if (initialData) {
      setCourse(JSON.parse(JSON.stringify(initialData)));
    }
  }, [initialData]);

  // --- CRUD Operations ---

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

  const addEmptyLesson = (topicIndex: number) => {
    const newLesson: Lesson = {
      id: `l-${Date.now()}`,
      title: 'Bài học mới',
      type: ContentType.VIDEO,
      duration: '00:00',
      isCompleted: false,
      url: '',
      level: 1 // Default level
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

  // Special handler for file uploads to auto-detect duration/pages INSIDE LESSON DETAIL
  const handleLessonFileUpload = async (topicIndex: number, lessonIndex: number, file: File) => {
      const type = course.topics![topicIndex].lessons[lessonIndex].type;
      
      // Update the URL first (happens in MediaInput usually, but here we handle metadata)
      if (type === ContentType.VIDEO) {
          const duration = await getVideoDuration(file);
          updateLesson(topicIndex, lessonIndex, 'duration', duration);
      } else if (type === ContentType.PDF) {
          updateLesson(topicIndex, lessonIndex, 'duration', '1 trang');
      }
  };

  // --- BULK UPLOAD LOGIC ---

  const handleBulkUpload = async (topicIndex: number, e: React.ChangeEvent<HTMLInputElement>, type: ContentType) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newLessons: Lesson[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 1. Get Duration/Info
        let duration = "00:00";
        if (type === ContentType.VIDEO) {
            duration = await getVideoDuration(file);
        } else {
            duration = "1 trang";
        }

        // 2. Convert to Base64
        const url = await fileToBase64(file);

        // 3. Create Lesson Object
        newLessons.push({
            id: `l-${Date.now()}-${i}`,
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            type: type,
            duration: duration,
            url: url,
            isCompleted: false,
            level: 1 // Default to 1, user must assign
        });
      }

      // Add all new lessons to the topic
      const newTopics = [...(course.topics || [])];
      newTopics[topicIndex].lessons = [...newTopics[topicIndex].lessons, ...newLessons];
      setCourse(prev => ({ ...prev, topics: newTopics }));

    } catch (error) {
        console.error("Bulk upload failed", error);
        alert("Có lỗi xảy ra khi xử lý file.");
    } finally {
        setIsProcessing(false);
        // Reset input
        e.target.value = '';
    }
  };

  // --- VALIDATION & STATS ---

  const validateLevels = () => {
      const stats: {[key: number]: {hasVideo: boolean, hasPDF: boolean}} = {
          1: {hasVideo: false, hasPDF: false},
          2: {hasVideo: false, hasPDF: false},
          3: {hasVideo: false, hasPDF: false},
          4: {hasVideo: false, hasPDF: false},
          5: {hasVideo: false, hasPDF: false},
      };

      course.topics?.forEach(topic => {
          topic.lessons.forEach(lesson => {
              if (lesson.level >= 1 && lesson.level <= 5 && lesson.url) {
                  if (lesson.type === ContentType.VIDEO) stats[lesson.level].hasVideo = true;
                  if (lesson.type === ContentType.PDF) stats[lesson.level].hasPDF = true;
              }
          });
      });

      return stats;
  };

  const levelStats = validateLevels();

  const handleSave = () => {
    if (!course.title) {
      alert("Vui lòng nhập tên khóa học");
      return;
    }
    
    // WARNING ONLY: Allows saving even if content is missing, but asks for confirmation
    const missingContent = Object.entries(levelStats).filter(([lvl, stat]) => !stat.hasVideo || !stat.hasPDF);
    if (missingContent.length > 0) {
        const confirmMsg = `CẢNH BÁO: Khóa học chưa hoàn thiện!\n\nCác Level sau chưa đủ điều kiện (Thiếu Video hoặc PDF):\nLevel: ${missingContent.map(m => m[0]).join(', ')}\n\nNếu lưu bây giờ, nội dung này có thể chưa sẵn sàng cho học viên. Bạn có chắc chắn muốn lưu không?`;
        
        // If user selects Cancel, stop execution. If OK, proceed to onSave.
        if (!window.confirm(confirmMsg)) {
            return;
        }
    }

    // Execute Save
    onSave(course as Course);
  };

  // Function to close detail view and "save" local lesson state (conceptual)
  const handleUpdateLessonDetail = () => {
      setExpandedLesson(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full max-h-[calc(100vh-100px)]">
      {/* HEADER */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
        <div>
            <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
                Yêu cầu: Mỗi Level cần có ít nhất 1 Video và 1 PDF.
            </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Hủy</button>
          <button 
            onClick={handleSave} 
            disabled={isProcessing}
            className={`px-6 py-2 bg-brand-blue text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 font-bold shadow-md ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Save size={18} /> {isProcessing ? 'Đang xử lý...' : 'Cập nhật Khóa học'}
          </button>
        </div>
      </div>

      {/* LEVEL STATUS BAR */}
      <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-4 overflow-x-auto whitespace-nowrap">
          <span className="text-xs font-bold text-blue-800 uppercase">Trạng thái Level:</span>
          {[1,2,3,4,5].map(lvl => {
              const stat = levelStats[lvl];
              const isComplete = stat.hasVideo && stat.hasPDF;
              return (
                  <div key={lvl} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${isComplete ? 'bg-green-100 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-500'}`}>
                      {isComplete ? <CheckCircle size={14}/> : <AlertTriangle size={14} className="text-yellow-500"/>}
                      <span className="font-bold">Lv{lvl}</span>
                      <div className="flex gap-1 ml-1 pl-1 border-l border-gray-300/50">
                          <Video size={12} className={stat.hasVideo ? 'text-brand-blue' : 'text-gray-300'}/>
                          <FileText size={12} className={stat.hasPDF ? 'text-brand-orange' : 'text-gray-300'}/>
                      </div>
                  </div>
              )
          })}
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
            
            <MediaInput 
              label="Ảnh bìa khóa học"
              value={course.thumbnail || ''}
              onChange={(val) => setCourse({...course, thumbnail: val})}
              accept="image/*"
            />
          </div>

          {/* Right Column: Syllabus Builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-700">Nội dung đào tạo</h3>
              <button onClick={addTopic} className="text-sm text-brand-blue flex items-center gap-1 font-medium hover:underline">
                <Plus size={16} /> Thêm chương
              </button>
            </div>

            <div className="space-y-6">
              {course.topics?.map((topic, tIdx) => (
                <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  {/* Topic Header */}
                  <div className="bg-gray-100 p-3 flex items-center gap-3 border-b border-gray-200">
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
                  
                  <div className="p-4 space-y-3">
                    {/* Lesson List */}
                    {topic.lessons.map((lesson, lIdx) => (
                      <div key={lesson.id} className="border border-gray-100 rounded bg-gray-50 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-2 p-2">
                          {/* Type Icon */}
                          <div className={`p-1.5 rounded ${lesson.type === ContentType.VIDEO ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                              {lesson.type === ContentType.VIDEO ? <Film size={14}/> : <FileText size={14}/>}
                          </div>
                          
                          {/* Title */}
                          <input 
                            className="flex-1 bg-transparent text-sm outline-none px-2 font-medium"
                            value={lesson.title}
                            placeholder="Tên bài học"
                            onChange={(e) => updateLesson(tIdx, lIdx, 'title', e.target.value)}
                          />

                          {/* Level Selector - IMPORTANT */}
                          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1">
                              <span className="text-[10px] font-bold text-gray-500 uppercase">Level</span>
                              <select 
                                className="text-xs font-bold bg-transparent outline-none cursor-pointer text-brand-blue"
                                value={lesson.level}
                                onChange={(e) => updateLesson(tIdx, lIdx, 'level', Number(e.target.value))}
                              >
                                {[1,2,3,4,5].map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                          </div>

                          {/* Duration/Pages */}
                          <div className="relative w-20">
                            <input 
                                className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-center pl-4"
                                value={lesson.duration}
                                placeholder={lesson.type === ContentType.PDF ? "Số trang" : "Thời lượng"}
                                onChange={(e) => updateLesson(tIdx, lIdx, 'duration', e.target.value)}
                            />
                          </div>

                          <button 
                            onClick={() => setExpandedLesson(expandedLesson?.lIdx === lIdx && expandedLesson.tIdx === tIdx ? null : {tIdx, lIdx})}
                            className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ${expandedLesson?.lIdx === lIdx && expandedLesson.tIdx === tIdx ? 'bg-blue-100 text-blue-700 border-blue-200 font-bold' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                          >
                            {expandedLesson?.lIdx === lIdx && expandedLesson.tIdx === tIdx ? <ChevronUp size={12}/> : null}
                            Chi tiết
                          </button>

                          <button onClick={() => removeLesson(tIdx, lIdx)} className="text-gray-300 hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Expanded Detail - Upload Area */}
                        {expandedLesson?.tIdx === tIdx && expandedLesson?.lIdx === lIdx && (
                          <div className="p-4 border-t border-gray-100 bg-white animate-fade-in shadow-inner">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Upload size={16} /> Tải lên tài liệu bài học
                            </h4>
                            
                            <div className="flex gap-6 items-start">
                                <div className="flex-1">
                                    <MediaInput 
                                        label={lesson.type === ContentType.VIDEO ? "File Video (MP4/WebM)" : "File Tài liệu (PDF)"}
                                        value={lesson.url || ''}
                                        onChange={(val) => updateLesson(tIdx, lIdx, 'url', val)}
                                        onFileSelect={(file) => handleLessonFileUpload(tIdx, lIdx, file)}
                                        accept={lesson.type === ContentType.VIDEO ? "video/*" : "application/pdf"}
                                    />
                                </div>
                                <div className="w-1/3 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại bài học</label>
                                        <select 
                                            className="w-full p-2 border border-gray-300 rounded text-sm"
                                            value={lesson.type}
                                            onChange={(e) => updateLesson(tIdx, lIdx, 'type', e.target.value)}
                                        >
                                            <option value={ContentType.VIDEO}>Video bài giảng</option>
                                            <option value={ContentType.PDF}>Tài liệu đọc (PDF)</option>
                                        </select>
                                    </div>
                                    
                                    {/* INTERNAL UPDATE BUTTON */}
                                    <div className="pt-2">
                                        <button 
                                            onClick={handleUpdateLessonDetail}
                                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <CheckCircle size={16}/> Xong / Đóng chi tiết
                                        </button>
                                        <p className="text-[10px] text-gray-400 text-center mt-2">
                                            Nhấn để hoàn tất chỉnh sửa bài học này.
                                        </p>
                                    </div>
                                </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Bulk Upload Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                        {/* Hidden Inputs */}
                        <input 
                            type="file" 
                            multiple 
                            accept="video/*" 
                            className="hidden" 
                            ref={el => { if(el) videoInputRefs.current[tIdx] = el; }}
                            onChange={(e) => handleBulkUpload(tIdx, e, ContentType.VIDEO)}
                        />
                        <input 
                            type="file" 
                            multiple 
                            accept=".pdf" 
                            className="hidden" 
                            ref={el => { if(el) pdfInputRefs.current[tIdx] = el; }}
                            onChange={(e) => handleBulkUpload(tIdx, e, ContentType.PDF)}
                        />

                        <button 
                            onClick={() => videoInputRefs.current[tIdx]?.click()}
                            className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-2 border border-blue-200 transition-colors"
                        >
                            <Film size={14} /> + Upload Video (Nhiều file)
                        </button>
                        <button 
                            onClick={() => pdfInputRefs.current[tIdx]?.click()}
                            className="flex-1 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-100 flex items-center justify-center gap-2 border border-orange-200 transition-colors"
                        >
                            <FileUp size={14} /> + Upload PDF (Nhiều file)
                        </button>
                        <button 
                            onClick={() => addEmptyLesson(tIdx)}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200 flex items-center justify-center gap-1 border border-gray-300 transition-colors"
                        >
                            <Plus size={14} /> Link
                        </button>
                    </div>
                  </div>
                </div>
              ))}

              {(!course.topics || course.topics.length === 0) && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <LayoutList size={48} className="mx-auto mb-2 opacity-20"/>
                  <p>Chưa có nội dung nào.</p>
                  <p className="text-sm">Hãy thêm chương học đầu tiên để bắt đầu tải lên video và tài liệu.</p>
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