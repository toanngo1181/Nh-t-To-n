import React, { useState, useRef } from 'react';
import { Question, QuestionType, Course } from '../types';
import { Plus, Trash2, Search, CheckCircle, Upload, FileUp, Download, AlertTriangle, Type, List, Edit } from 'lucide-react';

interface QuestionBankProps {
  questions: Question[];
  courses?: Course[]; // Added courses prop
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void; 
  onImportQuestions: (qs: Question[]) => void;
  onDeleteQuestion: (id: number) => void;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ questions, courses = [], onAddQuestion, onUpdateQuestion, onImportQuestions, onDeleteQuestion }) => {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for form data
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    id: 0, // 0 means new
    text: '',
    type: QuestionType.MULTIPLE_CHOICE,
    options: ['', '', '', ''],
    correctAnswer: 'A',
    level: 1,
    topicName: '',
    courseId: ''
  });

  // Filter display logic
  const [filterTopic, setFilterTopic] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(newQuestion.options || [])];
    newOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: newOptions });
  };

  const handleAddNewClick = () => {
    // Reset form for new question
    setNewQuestion({
        id: 0,
        text: '', 
        type: QuestionType.MULTIPLE_CHOICE, 
        options: ['', '', '', ''], 
        correctAnswer: 'A', 
        correctAnswerText: '',
        level: 1, 
        topicName: '',
        courseId: ''
    });
    setShowForm(!showForm);
  };

  const handleEditClick = (q: Question) => {
      setNewQuestion({
          ...q,
          // Ensure options array exists
          options: q.options && q.options.length === 4 ? q.options : ['', '', '', '']
      });
      setShowForm(true);
      // Scroll to top to see form
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = () => {
    if (!newQuestion.text || !newQuestion.correctAnswer) {
      alert("Vui lòng điền nội dung câu hỏi và đáp án.");
      return;
    }

    if (newQuestion.type === QuestionType.MULTIPLE_CHOICE && newQuestion.options?.some(o => !o)) {
        alert("Vui lòng điền đầy đủ các phương án A, B, C, D.");
        return;
    }

    const isEditing = newQuestion.id && newQuestion.id !== 0;

    // Auto-fill topic name from course if selected and topic empty
    let finalTopicName = newQuestion.topicName;
    if (newQuestion.courseId && !finalTopicName) {
        const c = courses.find(c => c.id === newQuestion.courseId);
        if(c) finalTopicName = c.title;
    }

    const q: Question = {
      id: isEditing ? newQuestion.id! : Date.now(),
      text: newQuestion.text,
      type: newQuestion.type || QuestionType.MULTIPLE_CHOICE,
      options: newQuestion.type === QuestionType.MULTIPLE_CHOICE ? newQuestion.options as string[] : [],
      correctAnswer: newQuestion.correctAnswer,
      correctAnswerText: newQuestion.correctAnswerText || '',
      level: newQuestion.level || 1,
      topicName: finalTopicName,
      courseId: newQuestion.courseId
    };

    if (isEditing) {
        onUpdateQuestion(q);
    } else {
        onAddQuestion(q);
    }

    // Reset and close
    setNewQuestion({ 
        id: 0,
        text: '', 
        type: QuestionType.MULTIPLE_CHOICE, 
        options: ['', '', '', ''], 
        correctAnswer: 'A', 
        correctAnswerText: '',
        level: 1, 
        topicName: '',
        courseId: ''
    });
    setShowForm(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowImport(false);
  };

  const parseCSVLine = (text: string) => {
    const result: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cell += '"';
          i++; 
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cell.trim());
        cell = '';
      } else {
        cell += char;
      }
    }
    result.push(cell.trim());
    return result;
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split(/\r?\n/);
    const newQuestions: Question[] = [];
    
    // Expected columns: 
    // 0:STT, 1:Chủ đề, 2:Cấp độ, 3:Nội dung, 4:A, 5:B, 6:C, 7:D, 8:Đáp án đúng (A/B/C/D), 9:Câu trả lời (Text)
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);

        if (cols.length >= 4) {
            // 1. Parse Level
            const levelStr = cols[2] || "1";
            const levelMatch = levelStr.match(/\d+/);
            const level = levelMatch ? parseInt(levelMatch[0]) : 1;

            // 2. Parse Type & Options
            const optionA = cols[4] || "";
            const optionB = cols[5] || "";
            const optionC = cols[6] || "";
            const optionD = cols[7] || "";
            
            // Check if it is MC or Short Answer
            // Logic: If options are empty, it's Short Answer
            const isMultipleChoice = (optionA || optionB || optionC || optionD);
            const type = isMultipleChoice ? QuestionType.MULTIPLE_CHOICE : QuestionType.SHORT_ANSWER;

            // 3. Parse Correct Answer
            let correctAnswer = "";
            let correctAnswerText = cols[9] || ""; // Column 9 is "Câu trả lời"

            if (type === QuestionType.MULTIPLE_CHOICE) {
                // Column 8 is "Đáp án đúng" (A/B/C/D)
                correctAnswer = cols[8] ? cols[8].toUpperCase().trim().replace(/[^ABCD]/g, '') : "A";
                if (!correctAnswer) correctAnswer = "A"; // Default fallback
            } else {
                // For Short Answer, "Correct Answer" is the text itself
                correctAnswer = correctAnswerText || cols[8] || "Chưa có đáp án";
            }

            const q: Question = {
                id: Date.now() + i + Math.floor(Math.random() * 1000),
                topicName: cols[1].replace(/^"|"$/g, ''),
                level: level,
                text: cols[3],
                type: type,
                options: type === QuestionType.MULTIPLE_CHOICE ? [optionA, optionB, optionC, optionD] : [],
                correctAnswer: correctAnswer,
                correctAnswerText: correctAnswerText
            };
            newQuestions.push(q);
        }
    }

    if (newQuestions.length > 0) {
      onImportQuestions(newQuestions);
      alert(`Đã nhập thành công ${newQuestions.length} câu hỏi!`);
    } else {
      alert("Không tìm thấy dữ liệu hợp lệ. Vui lòng kiểm tra định dạng file CSV.");
    }
  };

  const downloadSample = () => {
    const bom = "\uFEFF"; 
    const csvHeader = "STT,Chủ đề,Cấp độ,Nội dung câu hỏi,Đáp án A,Đáp án B,Đáp án C,Đáp án D,Đáp án đúng,Câu trả lời\n";
    const csvRow1 = "1,Vaccine heo,Cấp độ 1,\"Vaccine PRRS tiêm khi nào?\",1 tuần,3 tuần,10 tuần,Không tiêm,B,\"Giải thích: Tiêm lúc 3 tuần tuổi\"\n";
    const csvRow2 = "2,Vaccine heo,Cấp độ 1,\"Định nghĩa vaccine là gì?\",,,,,,\"Vaccine là chế phẩm sinh học...\"\n";
    
    const blob = new Blob([bom + csvHeader + csvRow1 + csvRow2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mau_cau_hoi_chuan.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredQuestions = questions.filter(q => 
    (q.topicName || '').toLowerCase().includes(filterTopic.toLowerCase()) || 
    q.text.toLowerCase().includes(filterTopic.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Ngân hàng câu hỏi</h2>
           <p className="text-gray-600">Quản lý câu hỏi Trắc nghiệm và Trả lời ngắn.</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setShowImport(!showImport)}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <FileUp size={20} /> Import Excel/CSV
            </button>
            <button 
              onClick={handleAddNewClick}
              className="px-4 py-2 bg-brand-blue text-white rounded-lg flex items-center gap-2 shadow hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} /> Thêm câu hỏi
            </button>
        </div>
      </div>

      {showImport && (
         <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 animate-fade-in shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-lg text-blue-800 mb-2 flex items-center gap-2">
                        <Upload size={20}/> Nhập câu hỏi từ file
                    </h3>
                    <p className="text-sm text-blue-600 mb-4">
                        File CSV cần có đầy đủ các cột để hiển thị chính xác trên phần mềm.<br/>
                        Cấu trúc: <code className="bg-white px-1 rounded border border-blue-100">STT, Chủ đề, Cấp độ, Câu hỏi, A, B, C, D, Đáp án đúng, Câu trả lời</code>
                    </p>
                </div>
                <button onClick={() => setShowImport(false)} className="text-blue-400 hover:text-blue-600"><AlertTriangle size={20}/></button>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center">
                <label className="cursor-pointer bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium shadow-sm flex items-center gap-2 transition-colors">
                    <FileUp size={18}/> Chọn file từ máy tính
                    <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                </label>
                <button onClick={downloadSample} className="text-sm text-gray-600 hover:text-brand-blue flex items-center gap-1 underline decoration-dotted">
                    <Download size={14}/> Tải file mẫu chuẩn
                </button>
            </div>
         </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 animate-fade-in">
          <h3 className="font-bold text-lg mb-4 text-gray-700">
              {newQuestion.id ? 'Cập nhật câu hỏi' : 'Soạn câu hỏi mới'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* FIX: Add Course Selector to link question to course */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thuộc khóa học/Chủ đề</label>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                        value={newQuestion.courseId || ''}
                        onChange={e => setNewQuestion({...newQuestion, courseId: e.target.value})}
                    >
                        <option value="">-- Chọn khóa học --</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cấp độ</label>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                        value={newQuestion.level}
                        onChange={e => setNewQuestion({...newQuestion, level: Number(e.target.value)})}
                    >
                        {[1,2,3,4,5].map(l => <option key={l} value={l}>Cấp độ {l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                        value={newQuestion.type}
                        onChange={e => setNewQuestion({...newQuestion, type: e.target.value as QuestionType})}
                    >
                        <option value={QuestionType.MULTIPLE_CHOICE}>Trắc nghiệm (A/B/C/D)</option>
                        <option value={QuestionType.SHORT_ANSWER}>Trả lời ngắn (Tự luận)</option>
                    </select>
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                rows={2}
                value={newQuestion.text}
                onChange={e => setNewQuestion({...newQuestion, text: e.target.value})}
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>
            
            {newQuestion.type === QuestionType.MULTIPLE_CHOICE ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {newQuestion.options?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                        <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center border cursor-pointer transition-colors ${newQuestion.correctAnswer === String.fromCharCode(65 + idx) ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-500 border-gray-300 hover:border-brand-blue'}`}
                            onClick={() => setNewQuestion({...newQuestion, correctAnswer: String.fromCharCode(65 + idx)})}
                        >
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <input 
                            className={`flex-1 p-2 border rounded outline-none transition-all ${newQuestion.correctAnswer === String.fromCharCode(65 + idx) ? 'border-green-500 bg-green-50' : 'border-gray-300 focus:border-brand-blue'}`}
                            value={opt}
                            onChange={e => handleOptionChange(idx, e.target.value)}
                            placeholder={`Phương án ${String.fromCharCode(65 + idx)}`}
                        />
                        </div>
                    ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giải thích chi tiết (Tùy chọn)</label>
                        <textarea 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                            value={newQuestion.correctAnswerText}
                            onChange={e => setNewQuestion({...newQuestion, correctAnswerText: e.target.value})}
                            placeholder="Nhập lời giải hoặc giải thích thêm..."
                        />
                    </div>
                </>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án mẫu / Lời giải</label>
                    <textarea 
                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                        rows={3}
                        value={newQuestion.correctAnswer}
                        onChange={e => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                        placeholder="Nhập câu trả lời đúng hoặc gợi ý trả lời..."
                    />
                </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">Hủy bỏ</button>
              <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm">
                  {newQuestion.id ? 'Cập nhật' : 'Lưu vào ngân hàng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Tìm kiếm theo chủ đề, nội dung hoặc ID..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all"
          value={filterTopic}
          onChange={e => setFilterTopic(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[1200px]">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 w-16">ID</th>
              <th className="px-4 py-4 w-48">Chủ đề & Cấp độ</th>
              <th className="px-4 py-4 w-64">Nội dung câu hỏi</th>
              <th className="px-4 py-4 w-40 text-center bg-gray-100/50">Đáp án A</th>
              <th className="px-4 py-4 w-40 text-center bg-gray-100/50">Đáp án B</th>
              <th className="px-4 py-4 w-40 text-center bg-gray-100/50">Đáp án C</th>
              <th className="px-4 py-4 w-40 text-center bg-gray-100/50">Đáp án D</th>
              <th className="px-4 py-4 w-32">Đáp án đúng</th>
              <th className="px-4 py-4 text-right w-24 sticky right-0 bg-gray-50">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredQuestions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 group transition-colors">
                <td className="px-4 py-4 text-gray-400 text-xs">#{q.id.toString().slice(-4)}</td>
                <td className="px-4 py-4">
                    <p className="font-medium text-brand-blue line-clamp-2" title={q.topicName}>
                        {q.topicName || (q.courseId ? courses.find(c => c.id === q.courseId)?.title : 'Chung')}
                    </p>
                    <div className="flex gap-1 mt-1">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold border ${
                            q.level === 1 ? 'bg-green-50 text-green-700 border-green-100' :
                            q.level === 2 ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            q.level === 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            q.level === 4 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                            'bg-red-50 text-red-700 border-red-100'
                        }`}>Level {q.level}</span>
                        {q.type === QuestionType.SHORT_ANSWER && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                <Type size={10} className="inline mr-1"/> Tự luận
                            </span>
                        )}
                        {q.type === QuestionType.MULTIPLE_CHOICE && (
                            <span className="inline-block text-[10px] px-2 py-0.5 rounded font-bold bg-gray-50 text-gray-700 border border-gray-200">
                                <List size={10} className="inline mr-1"/> Trắc nghiệm
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-gray-800 line-clamp-3" title={q.text}>{q.text}</p>
                </td>
                
                {/* Options Rendering: Explicitly 4 columns */}
                {q.type === QuestionType.MULTIPLE_CHOICE ? (
                    <>
                        <td className="px-4 py-4 text-gray-600 border-l border-r border-dashed border-gray-100 bg-gray-50/20 align-top">
                            <span className="text-xs line-clamp-4">{q.options[0] || '-'}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 border-r border-dashed border-gray-100 bg-gray-50/20 align-top">
                            <span className="text-xs line-clamp-4">{q.options[1] || '-'}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 border-r border-dashed border-gray-100 bg-gray-50/20 align-top">
                            <span className="text-xs line-clamp-4">{q.options[2] || '-'}</span>
                        </td>
                        <td className="px-4 py-4 text-gray-600 border-r border-dashed border-gray-100 bg-gray-50/20 align-top">
                            <span className="text-xs line-clamp-4">{q.options[3] || '-'}</span>
                        </td>
                    </>
                ) : (
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-400 italic text-xs bg-gray-50/30 border-l border-r border-dashed border-gray-100">
                        (Câu hỏi tự luận không có phương án lựa chọn)
                    </td>
                )}

                <td className="px-4 py-4 align-top">
                  {q.type === QuestionType.MULTIPLE_CHOICE ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle size={12} /> {q.correctAnswer}
                      </span>
                  ) : (
                      <div className="text-xs text-gray-600 line-clamp-3 italic bg-gray-50 p-2 rounded border border-gray-200" title={q.correctAnswer}>
                          {q.correctAnswer}
                      </div>
                  )}
                </td>
                
                {/* Action Column: Always the last one */}
                <td className="px-4 py-4 text-right sticky right-0 bg-white/50 backdrop-blur-sm align-top">
                  <div className="flex justify-end gap-1">
                    <button 
                        onClick={() => handleEditClick(q)}
                        className="text-gray-400 hover:text-brand-blue p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Sửa câu hỏi"
                    >
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={() => onDeleteQuestion(q.id)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Xóa câu hỏi"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredQuestions.length === 0 && (
                <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                            <Search size={32} className="opacity-20"/>
                            <p>Chưa có câu hỏi nào trong ngân hàng.</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionBank;