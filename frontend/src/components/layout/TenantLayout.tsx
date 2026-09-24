import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TenantHeader } from './TenantHeader';
import { FloatingAIChatbot } from '../ai/FloatingAIChatbot';
import { PhoneCall, ShieldCheck, HelpCircle } from 'lucide-react';
import { DwellLogo } from '../common/DwellLogo';

interface TenantLayoutProps {
  children?: React.ReactNode;
}

export const TenantLayout: React.FC<TenantLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between">
      {/* Header */}
      <div>
        <TenantHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children || <Outlet />}
        </main>
      </div>

      {/* Floating 24/7 AI Chatbot */}
      <FloatingAIChatbot />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-2">
              <DwellLogo size="sm" showSubtitles={false} />
            </div>
            <p className="text-slate-500 leading-relaxed">
              Hệ thống quản lý dịch vụ căn hộ, hỗ trợ cư dân và quản lý hợp đồng thuê chuẩn Nhật Bản & Singapore.
            </p>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-2">Đường Dây Khẩn Cấp 24/7</div>
            <div className="space-y-1 text-slate-600">
              <div>Trung Tâm Ban Quản Lý: <strong className="text-slate-900 font-bold">1900 8899</strong></div>
              <div>Lễ Tân Tòa Nhà A: <strong className="text-slate-900">024 7300 2222</strong></div>
              <div>Bảo An & Kỹ Thuật Trực: <strong className="text-slate-900">0912 345 678</strong></div>
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-2">Tiện Ích Cư Dân</div>
            <div className="space-y-1 text-slate-600">
              <div>Quy chuẩn sinh hoạt tòa nhà</div>
              <div>Đăng ký thẻ cư dân & gửi xe</div>
              <div>Khai báo lưu trú trực tuyến</div>
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-2">Bảo Mật & Pháp Lý</div>
            <div className="space-y-1 text-slate-600">
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mã hóa BCrypt & VNeID</span>
              </div>
              <div>Chính sách bảo mật thông tin cá nhân</div>
              <div>Hợp đồng điện tử xác thực Viettel-CA</div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <div>
            © 2026 Dwell Living Resident Portal. Đề tài 12 - Hệ thống căn hộ cho thuê toàn quốc.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="hover:text-brand-600 transition-colors">
              Chuyển sang Quản Trị Viên (Admin)
            </Link>
            <span>•</span>
            <Link to="/login" className="hover:text-brand-600 transition-colors">
              Trang Đăng Nhập
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
