import React from 'react';
import { CertificateData, CertificateConfig } from '../types';
import { Share2, LogOut, Printer } from 'lucide-react';

interface CertificateProps {
  data: CertificateData;
  config: CertificateConfig; // Nhận cấu hình từ AppContext
  onClose: () => void;
  onHome: () => void;
  logoUrl: string; // Dynamic logo URL
}

const Certificate: React.FC<CertificateProps> = ({ data, config, onClose, onHome, logoUrl }) => {
  
  const handleDownload = () => {
    // Thay đổi tiêu đề trang tạm thời để tên file PDF khi lưu được đẹp
    const originalTitle = document.title;
    document.title = `ChungChi_${data.studentName.replace(/\s+/g, '_')}_${data.id}`;
    window.print();
    document.title = originalTitle;
  };

  const handleShare = async () => {
    const shareData = {
        title: 'Chứng chỉ hoàn thành khóa học - VinhTan E-Learning',
        text: `Tôi đã hoàn thành xuất sắc khóa học "${data.courseName}" trên hệ thống đào tạo VinhTan E-Learning!`,
        url: window.location.href // Trong thực tế, đây sẽ là link public để verify chứng chỉ
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(`${shareData.text}\nID chứng chỉ: ${data.verificationCode}`);
            alert("Đã sao chép nội dung chia sẻ vào bộ nhớ tạm!");
        }
    } catch (err) {
        console.error("Error sharing:", err);
    }
  };

  // Logic tách tên khóa học và Level
  const splitCourseName = (fullName: string) => {
    const levelIndex = fullName.lastIndexOf("(Level");
    if (levelIndex !== -1) {
        return {
            title: fullName.substring(0, levelIndex).trim(),
            level: fullName.substring(levelIndex).trim()
        };
    }
    return { title: fullName, level: "" };
  };

  const { title: courseTitle, level: courseLevel } = splitCourseName(data.courseName);

  // Sử dụng cấu hình hoặc fallback về mặc định
  const issuerName = config.issuerName || "TS. Phạm Văn B";
  const issuerTitle = config.issuerTitle || "GIÁM ĐỐC ĐÀO TẠO";
  const signature = config.signatureImage || "https://upload.wikimedia.org/wikipedia/commons/e/e4/Signature_sample.svg";
  
  // Style cho background
  const bgStyle = config.backgroundImage 
    ? { 
        backgroundImage: `url(${config.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      } 
    : { 
        backgroundImage: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)' 
      };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static print:block">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full flex flex-col print:shadow-none print:w-full print:max-w-none">
        {/* Header - Hidden when printing */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 print:hidden">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <AwardIcon /> Chứng chỉ hoàn thành
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none px-2">&times;</button>
        </div>
        
        {/* Certificate Content - Full screen for print */}
        <div className="p-8 overflow-auto bg-gray-200 flex justify-center print:p-0 print:bg-white print:overflow-visible">
            {/* Certificate Template */}
            <div 
                className="bg-white w-[900px] h-[640px] relative border-[10px] border-double border-brand-blue p-8 text-center shadow-lg flex flex-col justify-between print:w-full print:h-[100vh] print:border-none print:shadow-none print:m-0" 
                style={bgStyle}
            >
                {/* Print specific border simulation if no background image, otherwise rely on CSS above */}
                {!config.backgroundImage && (
                    <div className="absolute inset-4 border border-gray-300 pointer-events-none print:inset-0 print:border-4 print:border-brand-blue"></div>
                )}
                
                {/* Overlay layer to ensure text readability if background is busy */}
                {config.backgroundImage && (
                    <div className="absolute inset-0 bg-white/50 pointer-events-none"></div>
                )}

                {/* Header Section: Logo & Title */}
                <div className="mt-4 z-10 relative">
                    <img src={logoUrl} alt="VinhTan Group" className="h-20 mx-auto mb-2 object-contain print:h-24 mix-blend-multiply" />
                    <h1 className="text-4xl font-heading font-bold text-brand-blue uppercase tracking-widest mb-1 print:text-black drop-shadow-sm">Giấy Chứng Nhận</h1>
                    <p className="text-lg text-gray-700 font-serif italic print:text-gray-600">Hoàn thành khóa học trực tuyến</p>
                </div>

                {/* Body Section: Student & Course Info */}
                <div className="my-2 z-10 flex flex-col justify-center flex-1 relative">
                    <p className="text-gray-700 mb-1 text-lg">Chứng nhận này trân trọng trao cho</p>
                    <h2 className="text-4xl font-bold text-gray-900 font-heading mb-4 py-1 uppercase tracking-wide print:text-black scale-110 drop-shadow-sm">{data.studentName}</h2>
                    <p className="text-gray-700 mb-2 text-lg">Vì đã hoàn thành xuất sắc các yêu cầu của khóa học</p>
                    
                    {/* Course Name - Single Line */}
                    <h3 className="text-3xl font-bold text-brand-orange px-8 leading-tight print:text-black mb-1 uppercase drop-shadow-sm">
                        {courseTitle}
                    </h3>
                    
                    {/* Level - Next Line */}
                    {courseLevel && (
                        <p className="text-2xl font-bold text-gray-700 mt-2">
                            {courseLevel}
                        </p>
                    )}
                </div>

                {/* Footer Section: Date/QR and Signature */}
                <div className="flex justify-between items-end px-12 z-10 w-full mb-8 relative">
                    
                    {/* Left: Date & QR Code */}
                    <div className="text-left relative pl-4 pb-2 pr-2">
                        <p className="text-gray-600 text-sm font-medium mb-1">Ngày cấp</p>
                        <p className="font-bold text-xl text-gray-800 mb-2">{new Date(data.date).toLocaleDateString('vi-VN')}</p>
                        
                        <div className="w-24 h-24 bg-white p-1 border border-gray-200 shadow-sm print:border-black">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.verificationCode}`} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono tracking-widest uppercase">ID: {data.verificationCode}</p>
                    </div>

                    {/* Right: Signature */}
                    <div className="text-center relative pr-4 pb-2 pl-4 min-w-[280px]">
                        <div className="h-28 flex items-end justify-center mb-1 relative">
                             {/* Signature Image - Overlaying the line */}
                             {signature && (
                                <img 
                                    src={signature} 
                                    alt="Signature" 
                                    className="h-24 absolute bottom-0 left-1/2 -translate-x-1/2 z-20 mix-blend-multiply" 
                                />
                             )}
                             
                             {/* Digital Stamp */}
                             <div className="absolute right-0 top-0 w-24 h-24 border-4 border-red-600 rounded-full opacity-60 flex items-center justify-center rotate-[-15deg] pointer-events-none mix-blend-multiply z-10">
                                <div className="w-20 h-20 border border-red-600 rounded-full flex items-center justify-center">
                                    <div className="text-[8px] text-red-600 font-bold uppercase text-center leading-tight">
                                        VinhTan Edu<br/>Digital<br/>Signed<br/>
                                        <span className="text-[6px]">{new Date(data.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                        
                        <div className="w-full h-0.5 bg-gray-500 my-1 print:bg-black"></div>
                        <p className="font-bold text-gray-900 text-lg">{issuerName}</p>
                        <p className="text-brand-blue font-bold text-sm uppercase tracking-wider print:text-black">{issuerTitle}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions - Hidden when printing */}
        <div className="p-4 bg-gray-50 border-t flex flex-col md:flex-row justify-between gap-4 print:hidden">
          <div className="flex gap-3 w-full md:w-auto">
             <button 
                onClick={onHome}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
            >
                <LogOut size={18} /> Thoát ra trang chính
            </button>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button 
                onClick={handleShare}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 bg-white"
            >
                <Share2 size={18} /> Chia sẻ
            </button>
            <button 
                onClick={handleDownload}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-brand-blue text-white rounded-lg hover:bg-blue-700 shadow-lg font-bold"
            >
                <Printer size={18} /> Lưu về máy / In
            </button>
          </div>
        </div>
      </div>
      
      {/* Print Styles helper */}
      <style>{`
        @media print {
            @page {
                size: landscape;
                margin: 0;
            }
            body { 
                margin: 0; 
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body * {
                visibility: hidden;
            }
            .fixed.inset-0, .fixed.inset-0 * {
                visibility: visible;
            }
            .fixed.inset-0 {
                position: absolute;
                left: 0;
                top: 0;
                width: 100vw;
                height: 100vh;
                padding: 0;
                margin: 0;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .print\\:hidden {
                display: none !important;
            }
            .print\\:shadow-none {
                box-shadow: none !important;
            }
        }
      `}</style>
    </div>
  );
};

const AwardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-orange"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
);

export default Certificate;