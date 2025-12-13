import React, { useState, useEffect } from 'react';
import { Question, QuizResult, QuestionType } from '../types';
import { Clock, CheckCircle, XCircle, AlertTriangle, HelpCircle, X, Check, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: QuizResult) => void;
  courseTitle: string;
  questions: Question[]; 
}

const PASSING_SCORE = 80; // Percent
const QUIZ_DURATION = 15 * 60; // 15 minutes in seconds

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onComplete, courseTitle, questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string)[]>([]); // Store selected option (A,B,C,D) or text
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (questions.length > 0) {
        setAnswers(new Array(questions.length).fill(""));
        setCurrentQuestionIndex(0);
        setIsSubmitted(false);
        setScore(0);
        setTimeLeft(QUIZ_DURATION);
    }
  }, [questions, isOpen]);

  useEffect(() => {
    if (isOpen && !isSubmitted && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, isSubmitted, questions.length]);

  const handleSelectOption = (optionChar: string) => {
    if (isSubmitted) return;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionChar;
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (text: string) => {
      if (isSubmitted) return;
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = text;
      setAnswers(newAnswers);
  }

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (q.type === QuestionType.MULTIPLE_CHOICE) {
            if (answers[idx] === q.correctAnswer) correctCount++;
        } else {
            // For Short Answer, simplified check (length > 5)
            if (answers[idx] && answers[idx].length > 5) correctCount++; 
        }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
  };

  const handleFinish = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ensure event doesn't bubble inappropriately
    onComplete({
      score: score,
      passed: score >= PASSING_SCORE,
      date: new Date().toISOString()
    });
    // The parent component handles closing/resetting logic via props
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isOpen) return null;

  if (!questions || questions.length === 0) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24}/>
                </button>
                <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có câu hỏi</h3>
                <p className="text-gray-600 mb-6">Hệ thống chưa cập nhật câu hỏi cho Cấp độ này của khóa học. Vui lòng liên hệ Giảng viên.</p>
                <button onClick={onClose} className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium">Đóng</button>
            </div>
        </div>
      );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] relative animate-fade-in">
        
        {/* Header */}
        <div className={`text-white p-4 flex justify-between items-center relative ${isSubmitted ? (score >= PASSING_SCORE ? 'bg-green-600' : 'bg-red-600') : 'bg-gray-900'}`}>
          <div className="flex-1 pr-12">
             <h3 className="font-heading font-bold text-lg line-clamp-1">{isSubmitted ? 'Kết quả kiểm tra' : `Kiểm tra: ${courseTitle}`}</h3>
             <p className="text-xs opacity-80">{isSubmitted ? (score >= PASSING_SCORE ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT') : `Số lượng: ${questions.length} câu`}</p>
          </div>
          
          {!isSubmitted && (
            <div className={`flex items-center gap-2 font-mono text-xl mr-8 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : ''}`}>
                <Clock size={20} />
                {formatTime(timeLeft)}
            </div>
          )}

          {/* EXIT BUTTON */}
          <button 
            onClick={() => {
                if(isSubmitted || confirm("Bạn có chắc muốn thoát bài kiểm tra? Kết quả sẽ không được lưu.")) {
                    onClose();
                }
            }} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            title="Thoát"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {!isSubmitted ? (
            // --- QUIZ MODE ---
            <div>
              <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
                <span>Câu hỏi {currentQuestionIndex + 1} / {questions.length}</span>
                <div className="w-1/3 bg-gray-200 rounded-full h-2">
                  <div className="bg-brand-blue h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3 mb-6">
                      <div className="mt-1">
                          {currentQ.type === QuestionType.MULTIPLE_CHOICE ? <HelpCircle className="text-brand-blue"/> : <AlertTriangle className="text-brand-orange"/>}
                      </div>
                      <div>
                          <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                              {currentQ.type === QuestionType.MULTIPLE_CHOICE ? 'Trắc nghiệm' : 'Trả lời ngắn'}
                          </span>
                          <h4 className="text-xl font-medium text-gray-800">
                            {currentQ.text}
                          </h4>
                      </div>
                  </div>

                  {currentQ.type === QuestionType.MULTIPLE_CHOICE ? (
                      <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                          const char = String.fromCharCode(65 + idx);
                          return (
                            <button
                                key={idx}
                                onClick={() => handleSelectOption(char)}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                                answers[currentQuestionIndex] === char
                                    ? 'border-brand-blue bg-blue-50 text-brand-blue'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <span className="inline-block w-6 h-6 rounded-full border border-gray-400 text-center text-xs leading-6 mr-3 text-gray-500 bg-white">
                                    {char}
                                </span>
                                {opt}
                            </button>
                          );
                        })}
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <textarea 
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue/20 outline-none min-h-[150px]"
                            placeholder="Nhập câu trả lời của bạn..."
                            value={answers[currentQuestionIndex]}
                            onChange={(e) => handleTextAnswer(e.target.value)}
                          />
                          <p className="text-xs text-gray-500 italic">* Câu trả lời sẽ được hệ thống ghi nhận.</p>
                      </div>
                  )}
              </div>
            </div>
          ) : (
            // --- REVIEW / RESULT MODE ---
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Score Summary */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                  {score >= PASSING_SCORE ? (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                          <CheckCircle size={48} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Chúc mừng! Bạn đã đậu.</h2>
                      <p className="text-gray-600">Điểm số: <span className="text-3xl font-bold text-green-600">{score}/100</span></p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                          <XCircle size={48} />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Rất tiếc, bạn chưa đạt.</h2>
                      <p className="text-gray-600">Điểm số: <span className="text-3xl font-bold text-red-600">{score}/100</span></p>
                      <p className="text-sm text-gray-500 mt-2">Cần đạt {PASSING_SCORE}/100 để qua môn.</p>
                    </div>
                  )}
              </div>

              <h3 className="font-bold text-gray-700 text-lg border-b pb-2">Chi tiết bài làm & Lời giải</h3>

              {/* Detailed Question Review */}
              <div className="space-y-6">
                  {questions.map((q, qIdx) => {
                      const userAnswer = answers[qIdx];
                      const isCorrect = q.type === QuestionType.MULTIPLE_CHOICE 
                          ? userAnswer === q.correctAnswer 
                          : (userAnswer && userAnswer.length > 5); // Simple Logic for Text

                      return (
                          <div key={qIdx} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
                              <div className="flex gap-3 mb-4">
                                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                                      {qIdx + 1}
                                  </span>
                                  <div className="flex-1">
                                      <h4 className="font-medium text-gray-800 text-lg">{q.text}</h4>
                                  </div>
                              </div>

                              {q.type === QuestionType.MULTIPLE_CHOICE && (
                                  <div className="space-y-2 mb-4 pl-11">
                                      {q.options.map((opt, optIdx) => {
                                          const char = String.fromCharCode(65 + optIdx);
                                          const isSelected = userAnswer === char;
                                          const isKey = q.correctAnswer === char;
                                          
                                          let styleClass = "border-gray-200 bg-white text-gray-600";
                                          if (isKey) styleClass = "border-green-500 bg-green-50 text-green-800 font-medium";
                                          else if (isSelected && !isKey) styleClass = "border-red-300 bg-red-50 text-red-700";

                                          return (
                                              <div key={optIdx} className={`p-3 border rounded-lg flex items-center justify-between ${styleClass}`}>
                                                  <div className="flex items-center gap-3">
                                                      <span className="w-6 h-6 flex items-center justify-center rounded-full border border-current text-xs">{char}</span>
                                                      <span>{opt}</span>
                                                  </div>
                                                  {isKey && <Check size={18} className="text-green-600"/>}
                                                  {isSelected && !isKey && <X size={18} className="text-red-500"/>}
                                              </div>
                                          )
                                      })}
                                  </div>
                              )}

                              {q.type === QuestionType.SHORT_ANSWER && (
                                  <div className="pl-11 mb-4 space-y-2">
                                      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                                          <p className="text-xs text-gray-500 mb-1">Câu trả lời của bạn:</p>
                                          <p className="text-gray-800">{userAnswer || "(Bỏ trống)"}</p>
                                      </div>
                                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                                          <p className="text-xs text-green-600 mb-1">Đáp án mẫu:</p>
                                          <p className="text-green-800">{q.correctAnswer}</p>
                                      </div>
                                  </div>
                              )}
                              
                              {/* EXPLANATION SECTION */}
                              <div className="pl-11 pt-4 border-t border-gray-100">
                                  <div className="flex gap-2 items-start text-blue-600 bg-blue-50 p-4 rounded-lg">
                                      <BookOpen size={18} className="mt-1 flex-shrink-0"/>
                                      <div>
                                          <span className="font-bold text-sm block mb-1">Giải thích chi tiết:</span>
                                          <p className="text-sm text-blue-800 leading-relaxed">
                                              {q.correctAnswerText || "Chưa có lời giải chi tiết cho câu hỏi này."}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between">
          {!isSubmitted ? (
            <>
              {/* BACK BUTTON: Hidden if on the first question */}
              <div className="w-24">
                {currentQuestionIndex > 0 && (
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        className="px-4 py-2 rounded text-gray-600 hover:bg-gray-200"
                    >
                        Quay lại
                    </button>
                )}
              </div>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-6 py-2 bg-brand-blue text-white rounded shadow hover:bg-blue-700 transition-colors"
                >
                  Câu tiếp theo
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-brand-success text-white rounded shadow hover:bg-green-700 transition-colors"
                >
                  Nộp bài
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center">
                <button
                onClick={score >= PASSING_SCORE ? handleFinish : onClose}
                className={`px-8 py-3 rounded-lg shadow font-bold text-white transition-colors flex items-center gap-2 ${score >= PASSING_SCORE ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-800'}`}
                >
                {score >= PASSING_SCORE ? (
                    <>Hoàn thành & Mở khóa Level kế tiếp <ArrowRight size={20}/></>
                ) : (
                    <>Học lại & Kiểm tra lại <ArrowLeft size={20}/></>
                )}
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;