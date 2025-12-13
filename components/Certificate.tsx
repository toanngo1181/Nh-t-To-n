import React from 'react';
import { CertificateData } from '../types';
import { Download, Share2, Home, LogOut, Printer } from 'lucide-react';

interface CertificateProps {
  data: CertificateData;
  onClose: () => void;
  onHome: () => void;
}

const Certificate: React.FC<CertificateProps> = ({ data, onClose, onHome }) => {
  
  const handleDownload = () => {
    // Trigger browser print dialog which allows saving as PDF
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full flex flex-col print:shadow-none print:w-full">
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
                className="bg-white w-[900px] h-[640px] relative border-[10px] border-double border-brand-blue p-10 text-center shadow-lg flex flex-col justify-between print:w-full print:h-[100vh] print:border-none print:shadow-none" 
                style={{backgroundImage: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)'}}
            >
                {/* Print specific border simulation if needed, or rely on CSS border above */}
                <div className="absolute inset-2 border border-gray-300 pointer-events-none print:hidden"></div>

                <div className="mt-8 z-10">
                    <div className="w-20 h-20 bg-brand-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl shadow-lg print:text-black print:bg-transparent print:border print:border-black">
                        VT
                    </div>
                    <h1 className="text-5xl font-heading font-bold text-brand-blue uppercase tracking-widest mb-2 print:text-black">Giấy Chứng Nhận</h1>
                    <p className="text-xl text-gray-500 font-serif italic print:text-gray-600">Hoàn thành khóa học trực tuyến</p>
                </div>

                <div className="my-6 z-10">
                    <p className="text-gray-600 mb-2 text-lg">Chứng nhận này trân trọng trao cho</p>
                    <h2 className="text-5xl font-bold text-gray-800 font-heading mb-6 py-2 uppercase tracking-wide print:text-black">{data.studentName}</h2>
                    <p className="text-gray-600 mb-2 text-lg">Vì đã hoàn thành xuất sắc các yêu cầu của khóa học</p>
                    <h3 className="text-3xl font-bold text-brand-orange mb-4 px-8 leading-tight print:text-black">{data.courseName}</h3>
                </div>

                {/* Footer Section: Date/QR and Signature */}
                <div className="flex justify-between items-end mt-4 px-8 z-10 w-full mb-8">
                    
                    {/* Left: Date & QR Code with L-Bracket */}
                    <div className="text-left relative pl-8 pb-4 pr-4">
                        {/* L-Shape Bracket Left */}
                        <div className="absolute left-0 bottom-0 h-24 w-24 border-l-[6px] border-b-[6px] border-brand-orange"></div>

                        <p className="text-gray-500 text-sm font-medium mb-1">Ngày cấp</p>
                        <p className="font-bold text-2xl text-gray-800 mb-4">{new Date(data.date).toLocaleDateString('vi-VN')}</p>
                        
                        <div className="w-28 h-28 bg-white p-1 border border-gray-200 shadow-sm print:border-black">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.verificationCode}`} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-mono tracking-widest uppercase">ID: {data.verificationCode}</p>
                    </div>

                    {/* Right: Signature with L-Bracket */}
                    <div className="text-center relative pr-8 pb-4 pl-4 min-w-[300px]">
                        {/* L-Shape Bracket Right */}
                        <div className="absolute right-0 bottom-0 h-24 w-24 border-r-[6px] border-b-[6px] border-brand-orange"></div>

                        <div className="h-32 flex items-end justify-center mb-2 relative">
                             {/* Signature Image */}
                             <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Signature_sample.svg" alt="Signature" className="h-24 opacity-90 relative z-10" />
                             
                             {/* Mock Digital Stamp */}
                             <div className="absolute right-2 top-2 w-28 h-28 border-4 border-red-500 rounded-full opacity-20 flex items-center justify-center rotate-[-15deg] pointer-events-none print:opacity-30">
                                <div className="text-[10px] text-red-500 font-bold uppercase text-center leading-tight">
                                    VinhTan Edu<br/>Digital<br/>Signed
                                </div>
                             </div>
                        </div>
                        
                        <div className="w-full h-0.5 bg-gray-400 my-2 print:bg-black"></div>
                        <p className="font-bold text-gray-900 text-xl">TS. Phạm Văn B</p>
                        <p className="text-brand-blue font-bold uppercase tracking-wider print:text-black">GIÁM ĐỐC ĐÀO TẠO</p>
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
                onClick={() => alert("Đã sao chép liên kết!")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
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
                padding: 0;
                background: white;
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