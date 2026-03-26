import React from 'react';
import { FileText, ShieldCheck, AlertCircle, Maximize2, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Step2Props {
  formData: any;
  setFormData: (data: any) => void;
}

export function Step2Contract({ formData, setFormData }: Step2Props) {
  const { t } = useTranslation();
  const today = new Date();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [hasRead, setHasRead] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  const ocr = formData.ocrData || {};

  const ContractContent = () => (
    <div 
      className="p-12 md:p-24 contract-content text-black leading-relaxed bg-white selection:bg-red-50 max-w-[950px] mx-auto shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-gray-200 min-h-[1400px] text-justify"
      style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '18px' }}
    >
      {/* Decree 30 Header Structure */}
      <div className="flex justify-between items-start mb-16">
        <div className="w-[45%] text-center">
          <div className="font-bold uppercase text-[17px] leading-tight">CÔNG TY TNHH EDUSPACE</div>
          <div className="text-[17px] mt-1 font-medium">Số: ESP-{Math.floor(Math.random() * 9000) + 1000}/HĐNT</div>
          <div className="w-20 h-[1px] bg-black mx-auto mt-2"></div>
        </div>
        <div className="w-[55%] text-center">
          <div className="font-bold uppercase text-[17px] leading-tight mb-1">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div className="font-bold text-[18px] leading-tight">Độc lập - Tự do - Hạnh phúc</div>
          <div className="w-44 h-[1px] bg-black mx-auto mt-2 shadow-sm"></div>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold uppercase mb-2 tracking-tight">HỢP ĐỒNG NGUYÊN TẮC</h1>
        <div className="text-[19px] font-bold italic">(V/v: Hợp tác cung cấp không gian và dịch vụ giáo dục)</div>
      </div>

      <div className="text-right italic text-[18px] mb-8 font-medium">
        Thành phố Hồ Chí Minh, ngày {today.getDate()} tháng {today.getMonth() + 1} năm {today.getFullYear()}
      </div>

      <div className="italic text-[18px] mb-10 space-y-2 leading-tight">
        <p>- Căn cứ Bộ luật Dân sự số 91/2015/QH13 được Quốc hội nước CHXHCN Việt Nam thông qua ngày 24/11/2015;</p>
        <p>- Căn cứ Luật Thương mại số 36/2005/QH11 do Quốc hội nước CHXHCN Việt Nam thông qua ngày 14/06/2005;</p>
        <p>- Căn cứ nhu cầu và khả năng của hai Bên.</p>
      </div>

      <p className="mb-8 font-medium">Chúng tôi gồm có:</p>

      {/* BÊN A */}
      <section className="mb-10">
        <h4 className="font-bold mb-4 text-[18px] uppercase tracking-wide">BÊN A (Bên nhận dịch vụ): CÔNG TY TNHH EDUSPACE</h4>
        <div className="grid grid-cols-[180px_25px_1fr] gap-y-2 text-[18px] ml-4">
          <span className="font-bold">Địa chỉ trụ sở</span><span className="font-bold text-center">:</span><span>Khu Công Nghệ Cao, Quận 9, TP. Hồ Chí Minh</span>
          <span className="font-bold">Mã số thuế</span><span className="font-bold text-center">:</span><span className="font-bold">0312345678</span>
          <span className="font-bold">Đại diện pháp luật</span><span className="font-bold text-center">:</span><span className="font-bold">Ông NGÔ TUẤN KIỆT</span>
          <span className="font-bold">Chức vụ</span><span className="font-bold text-center">:</span><span className="font-bold">Giám đốc</span>
        </div>
      </section>

      {/* BÊN B */}
      <section className="mb-12">
        <h4 className="font-bold mb-4 text-[18px] uppercase tracking-wide">BÊN B (Bên cung cấp dịch vụ): ĐỐI TÁC HOST</h4>
        <div className="grid grid-cols-[180px_25px_1fr] gap-y-2 text-[18px] ml-4">
          <span className="font-bold">Họ và tên</span><span className="font-bold text-center">:</span><span className="font-bold uppercase border-b border-black inline-block">{ocr.name || formData.name || '---'}</span>
          <span className="font-bold">Ngày sinh</span><span className="font-bold text-center">:</span><span>{ocr.dob || '---'}</span>
          <span className="font-bold">CCCD/CMND</span><span className="font-bold text-center">:</span><span className="font-bold">{ocr.idNumber || '---'}</span>
          <span className="font-bold">Địa chỉ</span><span className="font-bold text-center">:</span><span>{ocr.address || formData.address || '---'}</span>
          <span className="font-bold">Điện thoại</span><span className="font-bold text-center">:</span><span>{formData.phone || '---'}</span>
          <span className="font-bold">Tài khoản</span><span className="font-bold text-center text-black">:</span><span className="font-bold">{formData.bankAccount} – {formData.bankName?.toUpperCase()}</span>
        </div>
      </section>

      <p className="mb-10 italic font-medium">Hai Bên thống nhất ký kết Hợp đồng nguyên tắc với các điều khoản sau đây:</p>

      {/* ĐIỀU KHOẢN */}
      <section className="space-y-10 text-[18px]">
        <div>
          <h4 className="font-bold mb-3 uppercase">Điều 1: Nội dung hợp tác</h4>
          <p className="leading-relaxed">Bên B đồng ý niêm yết và cung cấp không gian học tập trên nền tảng EduSpace do Bên A vận hành. Bên A đóng vai trò trung gian kết nối và thu hộ phí dịch vụ từ khách hàng.</p>
        </div>

        <div>
          <h4 className="font-bold mb-3 uppercase">Điều 2: Phí dịch vụ và Thanh toán</h4>
          <div className="space-y-3">
             <p className="leading-relaxed">2.1. Phí dịch vụ nền tảng là 10% tính trên tổng giá trị mỗi đơn đặt phòng thành công.</p>
             <p className="leading-relaxed">2.2. Doanh thu (sau khi trừ phí) được đối soát và thanh toán tự động vào tài khoản Bên B vào ngày 05 hàng tháng.</p>
          </div>
        </div>

        <div>
           <h4 className="font-bold mb-3 uppercase">Điều 3: Quyền và Nghĩa vụ</h4>
           <p className="leading-relaxed">Bên B cam kết tính hợp pháp của không gian, an toàn PCCC và chất lượng phục vụ. Bên A cam kết vận hành hệ thống ổn định và bảo mật thông tin giao dịch.</p>
        </div>

        <div>
           <h4 className="font-bold mb-3 uppercase">Điều 4: Hiệu lực hợp đồng</h4>
           <p className="leading-relaxed text-black font-bold">Hợp đồng có hiệu lực kể từ thời điểm Bên B xác nhận điện tử trên hệ thống EduSpace và có giá trị pháp lý theo Luật Giao dịch điện tử 2023.</p>
        </div>
      </section>

      {/* Footer Signing Area */}
      <div className="flex justify-between items-start mt-28 pt-10">
        <div className="text-center w-5/12">
          <div className="font-bold uppercase mb-2 text-[16px]">ĐẠI DIỆN BÊN A</div>
          <div className="italic text-[11px] text-gray-800 mb-20">(Ký, ghi rõ họ tên và đóng dấu)</div>
          <div className="font-bold text-[18px] uppercase tracking-tight text-red-600">NGÔ TUẤN KIỆT</div>
        </div>
        <div className="text-center w-5/12">
          <div className="font-bold uppercase mb-2 text-[16px]">ĐẠI DIỆN BÊN B</div>
          <div className="italic text-[11px] text-gray-800 mb-20">(Đã ký xác nhận điện tử/eKYC)</div>
          <div className="font-bold text-[18px] uppercase tracking-tight">{ocr.name || formData.name || 'NGUYỄN VĂN A'}</div>
        </div>
      </div>
    </div>
  );

  const openContract = () => {
    setIsFullscreen(true);
    setHasRead(true);
    setShowError(false);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasRead) {
      setShowError(true);
      return;
    }
    setFormData({ ...formData, agreedTerms: e.target.checked });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-black text-gray-900 mb-1">Xác nhận Hợp đồng</h3>
        <p className="text-gray-500 font-medium text-sm">
          Đọc kỹ bản thảo pháp lý trước khi ký kết điện tử.
        </p>
      </div>

      {/* 1. Compact Gray Box */}
      <div className="bg-[#f8f9fa] rounded-[32px] p-8 md:p-12 border border-gray-200 shadow-sm mb-8 relative group w-full text-center hover:bg-white transition-colors">
         <div className="flex flex-col items-center justify-center gap-6">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <FileText className="w-8 h-8 text-red-600" />
           </div>
           
           <div>
              <h4 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Hợp đồng Nguyên tắc EduSpace</h4>
              <p className="text-gray-500 text-xs font-medium max-w-sm mx-auto leading-relaxed">
                Đã sẵn sàng để xem. Bản thảo tuân thủ Nghị định 30/2020/NĐ-CP.
              </p>
           </div>

           <button 
             onClick={openContract}
             className="flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-xl hover:shadow-red-200"
           >
             <Maximize2 className="w-4 h-4" />
             Bấm vào để xem chi tiết và ký
             <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      {/* 2. Traditional Checkbox */}
      <div className="w-full flex flex-col gap-3 mb-4 px-2">
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-[#2563eb] checked:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed"
              checked={formData.agreedTerms}
              onChange={handleCheckboxChange}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <span className="text-sm font-bold text-gray-700">
            Tôi đã đọc, hiểu rõ và đồng ý với các điều khoản trong{' '}
            <button 
              type="button" 
              onClick={openContract}
              className="text-[#2563eb] underline hover:text-[#1d4ed8] transition-colors"
            >
              Hợp đồng
            </button>.
          </span>
        </label>
        
        {showError && (
          <div className="flex items-center gap-2 text-red-500 animate-in fade-in slide-in-from-left-2">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[11px] font-bold uppercase tracking-tight">Vui lòng mở xem chi tiết hợp đồng trước khi đồng ý.</p>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-400 font-medium italic w-full px-2">
        * Bấm vào nút "Ký hợp đồng & Gửi đơn" tại chân trang để hoàn tất quy trình.
      </p>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex flex-col animate-in fade-in duration-500">
          <div className="flex items-center justify-between p-8 text-white">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h4 className="font-black text-xl uppercase tracking-widest text-white leading-none mb-1">Hợp đồng điện tử EduSpace</h4>
                <p className="text-[11px] text-gray-200 font-bold uppercase tracking-widest">Định dạng A4 chuẩn pháp lý</p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all flex items-center gap-3 backdrop-blur-xl border border-white/20 font-black uppercase text-sm"
            >
              <span>Đóng bản thảo</span>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-16 scrollbar-thin scrollbar-thumb-white/20">
            <div className="max-w-5xl mx-auto pb-44 animate-in zoom-in-95 duration-500">
              <ContractContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
