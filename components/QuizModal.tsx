import React, { useState, useEffect, useContext, useRef } from 'react';
import { Question, QuizResult, QuestionType, ActivityType } from '../types';
import { Clock, CheckCircle, XCircle, AlertTriangle, HelpCircle, X, Check, BookOpen, ArrowLeft, ArrowRight, MinusCircle, SkipForward } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: QuizResult) => void;
  courseTitle: string;
  questions: Question[]; 
  onAttempt?: (result: QuizResult) => void;
  timePerQuestion?: number; // Time in minutes per question
}

const PASSING_SCORE = 80; // Percent
const MAX_POINT_PER_QUESTION = 20; // Điểm tối đa cho mỗi câu để khớp với yêu cầu 20 điểm

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onComplete, courseTitle, questions, onAttempt, timePerQuestion = 1 }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string)[]>([]); // Store selected option (A,B,C,D) or text
  
  // Timer state for CURRENT QUESTION
  const [timeLeft, setTimeLeft] = useState(timePerQuestion * 60);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Lưu điểm chi tiết từng câu để hiển thị kết quả
  const [questionScores, setQuestionScores] = useState<number[]>([]);

  // Initialize/Reset State
  useEffect(() => {
    if (isOpen && questions.length > 0) {
        setAnswers(new Array(questions.length).fill(""));
        setQuestionScores(new Array(questions.length).fill(0));
        setCurrentQuestionIndex(0);
        setIsSubmitted(false);
        setScore(0);
        setTimeLeft(timePerQuestion * 60); // Reset time for first question
    }
  }, [isOpen]); 

  // Reset timer when question changes
  useEffect(() => {
      if (!isSubmitted && isOpen) {
          setTimeLeft(timePerQuestion * 60);
      }
  }, [currentQuestionIndex, timePerQuestion]);

  // Timer Logic
  useEffect(() => {
    if (isOpen && !isSubmitted && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Time ran out for this question
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, isSubmitted, currentQuestionIndex, questions.length]);

  const handleTimeOut = () => {
      // Logic: Mark current question as skipped (empty answer), 0 points.
      // Move to next question automatically.
      
      const newAnswers = [...answers];
      // Keep existing answer if user typed something but didn't click next? 
      // Requirement says: "hết thời gian vẫn chưa chọn đáp án thì mặc nhiên câu hỏi đó bị bỏ qua và 0 điểm"
      // If user selected something but didn't click next, strictly speaking they haven't "chosen/submitted".
      // But for better UX, if they selected an option, we could save it.
      // However, to strictly follow "bị bỏ qua" (skipped), we might treat it as empty.
      // Let's assume: If answers[currentQuestionIndex] is empty, it stays empty.
      
      setAnswers(newAnswers); // Update state (conceptually)

      // Move to next or Submit
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
      } else {
          handleSubmit(newAnswers); // Submit with current state of answers
      }
  };

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

  // Hàm đánh giá câu tự luận (Heuristic keyword matching)
  const evaluateEssay = (userAnswer: string, correctAnswer: string): number => {
      if (!userAnswer || !userAnswer.trim()) return 0;
      
      // Chuẩn hóa chuỗi: chữ thường, bỏ dấu câu đặc biệt
      const normalize = (str: string) => str.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ");
      
      const u = normalize(userAnswer);
      const c = normalize(correctAnswer);

      // 1. Chính xác tuyệt đối (Chuỗi giống hệt hoặc chứa nhau trọn vẹn)
      if (u === c || u.includes(c) || c.includes(u)) return 20;

      // 2. So sánh từ khóa (Tokenize)
      const uTokens = u.split(" ");
      const cTokens = c.split(" ");
      
      let matchCount = 0;
      uTokens.forEach(token => {
          if (cTokens.includes(token)) matchCount++;
      });

      const overlapRatio = matchCount / cTokens.length;

      // Logic chấm điểm theo yêu cầu
      if (overlapRatio >= 0.7) return 20; // Khớp >= 70% từ khóa -> Chính xác (20 điểm)
      if (overlapRatio >= 0.3) return 10; // Khớp >= 30% từ khóa -> Tương đối (10 điểm)
      
      return 0; // Không chính xác
  };

  const handleSubmit = (finalAnswers = answers) => {
    let totalPointsEarned = 0;
    const calculatedScores: number[] = [];

    questions.forEach((q, idx) => {
        let points = 0;
        const userAns = finalAnswers[idx];

        if (!userAns) {
            points = 0; // Unanswered/Skipped
        } else if (q.type === QuestionType.MULTIPLE_CHOICE) {
            // Trắc nghiệm: Đúng 20, Sai 0
            if (userAns === q.correctAnswer) {
                points = MAX_POINT_PER_QUESTION;
            }
        } else {
            // Tự luận: 0, 10, hoặc 20 điểm
            points = evaluateEssay(userAns, q.correctAnswer);
        }
        
        calculatedScores.push(points);
        totalPointsEarned += points;
    });

    // Tính điểm tổng trên thang 100
    // Tổng điểm tối đa có thể đạt được = số câu hỏi * 20
    const maxPossiblePoints = questions.length * MAX_POINT_PER_QUESTION;
    const finalPercentScore = Math.round((totalPointsEarned / maxPossiblePoints) * 100);

    setQuestionScores(calculatedScores);
    setScore(finalPercentScore);
    setIsSubmitted(true);

    if (onAttempt) {
        onAttempt({
            score: finalPercentScore,
            passed: finalPercentScore >= PASSING_SCORE,
            date: new Date().toISOString()
        });
    }
  };

  const handleFinish = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onComplete({
      score: score,
      passed: score >= PASSING_SCORE,
      date: new Date().toISOString()
    });
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
             <p className="text-xs opacity-80">{isSubmitted ? (score >= PASSING_SCORE ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT') : `Số lượng: ${questions.length} câu (20 điểm/câu)`}</p>
          </div>
          
          {!isSubmitted && (
            <div className={`flex flex-col items-end mr-8`}>
                <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 10 ? 'text-red-400 animate-pulse' : ''}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
                <p className="text-[10px] text-gray-400">Thời gian cho câu này</p>
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
                              {currentQ.type === QuestionType.MULTIPLE_CHOICE ? 'Trắc nghiệm' : 'Trả lời ngắn (Tự luận)'}
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
                          <p className="text-xs text-gray-500 italic">* Hệ thống sẽ chấm điểm dựa trên mức độ khớp từ khóa (Chính xác: 20đ, Tương đối: 10đ, Sai: 0đ).</p>
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
                      const earnedPoints = questionScores[qIdx];
                      
                      // Trạng thái hiển thị dựa trên điểm số
                      let statusColor = "";
                      let statusIcon = null;
                      let statusText = "";

                      if (earnedPoints === 20) {
                          statusColor = "green";
                          statusIcon = <Check size={18} className="text-green-600"/>;
                          statusText = "Chính xác (+20 điểm)";
                      } else if (earnedPoints === 10) {
                          statusColor = "yellow";
                          statusIcon = <MinusCircle size={18} className="text-yellow-600"/>;
                          statusText = "Tương đối (+10 điểm)";
                      } else {
                          statusColor = "red";
                          statusIcon = <X size={18} className="text-red-500"/>;
                          statusText = "Chưa chính xác (0 điểm)";
                      }
                      
                      const isSkipped = !userAnswer;

                      const borderClass = earnedPoints === 20 ? 'border-l-green-500' : (earnedPoints === 10 ? 'border-l-yellow-500' : 'border-l-red-500');
                      const bgBadgeClass = earnedPoints === 20 ? 'bg-green-500' : (earnedPoints === 10 ? 'bg-yellow-500' : 'bg-red-500');

                      return (
                          <div key={qIdx} className={`bg-white p-6 rounded-xl border-l-4 shadow-sm ${borderClass}`}>
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex gap-3">
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${bgBadgeClass}`}>
                                        {qIdx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-800 text-lg">{q.text}</h4>
                                        {isSkipped && <span className="text-xs text-red-500 italic">(Đã bỏ qua / Hết giờ)</span>}
                                    </div>
                                  </div>
                                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-${statusColor}-50 text-${statusColor}-700 border border-${statusColor}-200 whitespace-nowrap`}>
                                      {statusIcon} {statusText}
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
                                          <p className="text-gray-800 font-medium">{userAnswer || "(Bỏ trống / Hết giờ)"}</p>
                                      </div>
                                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                                          <p className="text-xs text-green-600 mb-1">Đáp án mẫu:</p>
                                          <p className="text-green-800 font-medium">{q.correctAnswer}</p>
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
              {/* BACK BUTTON: Disabled in new "Auto Next" mode to prevent cheating time, or handled carefully? 
                  With per-question timer, "Back" is usually disabled because the previous question's time is gone.
                  The prompt implies a forward flow "chuyển sang câu hỏi tiếp theo". 
                  Let's DISABLE Back for this mode.
              */}
              <div className="w-24">
                <p className="text-xs text-gray-400 italic">Không thể quay lại</p>
              </div>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => {
                      // Manual Next also resets time via useEffect dependency on index
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                  }}
                  className="px-6 py-2 bg-brand-blue text-white rounded shadow hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Câu tiếp theo <SkipForward size={16}/>
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit()}
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