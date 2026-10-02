import React from 'react';
import { ArrowUp, MapPin, Mail, Phone, ShieldCheck, CheckCircle2, Building2, QrCode } from 'lucide-react';
import { DwellLogo } from './DwellLogo';

export const RealEstateFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-12 text-slate-700 text-xs font-sans">
      {/* Main Footer Container */}
      <div className="w-full px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Brand & Contact Info (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 pr-2">
            {/* Logo Dwell Living */}
            <div className="flex items-center space-x-2.5 mb-2">
              <DwellLogo badge="Living 4.0" badgeVariant="sky" size="md" />
            </div>
            <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
              Hệ thống quản lý căn hộ cho thuê thông minh, tích hợp trợ lý AI Copilot, hợp đồng điện tử và thanh toán tự động VietQR Napas247.
            </p>

            {/* Address & Hotline List */}
            <div className="space-y-2 text-slate-600 text-[11.5px] leading-relaxed pt-1">
              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Trụ sở chính:</strong> Tòa nhà Dwell, Số 16 Phạm Hùng, P. Mỹ Đình 2, Q. Nam Từ Liêm, Hà Nội</span>
              </div>

              <div className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                <span><strong>Chi nhánh vận hành:</strong> Chuỗi căn hộ Dwell, KĐT Dwell Living, Nam Từ Liêm, Hà Nội</span>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span><strong>Email hỗ trợ:</strong> hotro@dwell.vn • contact@dwell.vn</span>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span><strong>Tổng đài tư vấn:</strong> (024) 38.22.4363 (06 lines) (Hỗ trợ 24/7)</span>
              </div>

              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span><strong>Hotline Ban Quản Lý:</strong> 0912.888.999 (Tiếp nhận sự cố & xem phòng)</span>
              </div>
            </div>

            {/* Accreditation Badges (Bộ Công Thương & Đã Cấp Phép) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Badge Đã đăng ký Bộ Công Thương */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-red-500 bg-red-50/60 text-red-600 text-[10px] font-bold shadow-2xs">
                <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black">
                  ✓
                </div>
                <div className="leading-tight text-left">
                  <div className="font-extrabold uppercase tracking-tight text-[9px]">ĐÃ ĐĂNG KÝ</div>
                  <div className="text-[7.5px] uppercase font-semibold">BỘ CÔNG THƯƠNG</div>
                </div>
              </div>

              {/* Badge Đã Cấp Phép */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-emerald-600 bg-emerald-50/60 text-emerald-700 text-[10px] font-bold shadow-2xs">
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                  ✓
                </div>
                <div className="leading-tight text-left">
                  <div className="font-extrabold uppercase tracking-tight text-[9px]">ĐÃ CẤP PHÉP</div>
                  <div className="text-[7.5px] uppercase font-semibold">QUẢN LÝ BĐS SỐ</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Middle Links (3.5 cols) */}
          <div className="lg:col-span-3 space-y-2.5 text-[11.5px]">
            <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-3">
              Dịch Vụ & Hướng Dẫn
            </h4>
            <ul className="space-y-2 text-slate-600 font-medium">
              <li><a href="#about" className="hover:text-brand-600 hover:underline transition-colors block">Giới thiệu Dwell Living</a></li>
              <li><a href="#explore" className="hover:text-brand-600 hover:underline transition-colors block">Khám phá chuỗi căn hộ Dwell</a></li>
              <li><a href="#pricing" className="hover:text-brand-600 hover:underline transition-colors block">Báo giá thuê phòng & chi phí dịch vụ</a></li>
              <li><a href="#contract-ai" className="hover:text-brand-600 hover:underline transition-colors block">Quy trình ký hợp đồng điện tử AI</a></li>
              <li><a href="#vietqr" className="hover:text-brand-600 hover:underline transition-colors block">Hướng dẫn thanh toán VietQR Napas247</a></li>
              <li><a href="#maintenance" className="hover:text-brand-600 hover:underline transition-colors block">Quy trình báo hỏng & sửa chữa bảo trì</a></li>
              <li><a href="#resident-portal" className="hover:text-brand-600 hover:underline transition-colors block">Cổng dịch vụ cư dân trực tuyến</a></li>
              <li><a href="#faq" className="hover:text-brand-600 hover:underline transition-colors block">Câu hỏi thường gặp (FAQ cư dân)</a></li>
              <li><a href="#floorplan" className="hover:text-brand-600 hover:underline transition-colors block">Sơ đồ mặt bằng các tòa nhà</a></li>
            </ul>
          </div>

          {/* Column 3: Right Links & Scroll-to-top (3.5 cols) */}
          <div className="lg:col-span-4 flex justify-between items-start text-[11.5px]">
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider mb-3">
                Quy Chế & Pháp Lý
              </h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li><a href="#contact" className="hover:text-brand-600 hover:underline transition-colors block">Liên hệ Ban Quản Lý Tòa Nhà</a></li>
                <li><a href="#building-rules" className="hover:text-brand-600 hover:underline transition-colors block">Nội quy quản lý & sinh hoạt tòa nhà</a></li>
                <li><a href="#dispute" className="hover:text-brand-600 hover:underline transition-colors block">Quy trình giải quyết phản ánh & khiếu nại</a></li>
                <li><a href="#privacy" className="hover:text-brand-600 hover:underline transition-colors block">Chính sách bảo mật thông tin khách thuê</a></li>
                <li><a href="#temp-reg" className="hover:text-brand-600 hover:underline transition-colors block">Quy định đăng ký tạm trú số</a></li>
                <li><a href="#legal" className="hover:text-brand-600 hover:underline transition-colors block">Pháp lý ký số hợp đồng AI</a></li>
                <li><a href="#feedback" className="hover:text-brand-600 hover:underline transition-colors block">Tiếp nhận đánh giá & đóng góp ý kiến cư dân</a></li>
              </ul>
            </div>

            {/* Scroll-to-top Button */}
            <button
              onClick={scrollToTop}
              title="Lên đầu trang"
              className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-brand-50 flex items-center justify-center shrink-0 transition-colors shadow-2xs"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Bar: Legal, MST & Technology Partners */}
      <div className="border-t border-slate-200 bg-slate-50/80 py-4 px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10.5px] text-slate-500 leading-relaxed">
          {/* Left: Company Legal Info */}
          <div className="space-y-0.5">
            <div>
              Đơn vị chủ quản: <strong className="text-slate-800">CÔNG TY CỔ PHẦN CÔNG NGHỆ & QUẢN LÝ CĂN HỘ DWELL LIVING</strong>
            </div>
            <div>
              Mã số thuế: 0108979464 • Nơi cấp: Sở Kế hoạch và Đầu tư TP. Hà Nội • Đại diện theo pháp luật: <strong className="text-slate-800">Hoàng Khánh Ly</strong>
            </div>
            <div>
              Giấy phép Trang thông tin số 03/GP-TTĐT do Sở Thông tin và Truyền thông cấp.
            </div>
            <div className="text-[9.5px] text-slate-400 font-mono pt-0.5">
              Đề tài 12: Hệ Thống Quản Lý Căn Hộ Cho Thuê Thông Minh (Dwell) • Phiên bản v2.4
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
