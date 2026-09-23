import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { INITIAL_USERS } from '../stores/mockDatabase';
import { UserRole } from '../types';
import { useToast } from '../hooks/useToast';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();

    // Auto-detect role by matching username, email or keyword in INITIAL_USERS
    const found = INITIAL_USERS.find(
      (u) =>
        u.username.toLowerCase() === cleanUser ||
        u.email.toLowerCase() === cleanUser ||
        (cleanUser === 'admin' && u.roleCode === 'ADMIN') ||
        (cleanUser === 'staff' && u.roleCode === 'STAFF') ||
        (cleanUser === 'accountant' && u.roleCode === 'ACCOUNTANT') ||
        (cleanUser === 'tenant' && u.roleCode === 'TENANT') ||
        (cleanUser === 'guest' && u.roleCode === 'GUEST')
    );

    const role: UserRole = found
      ? found.roleCode
      : cleanUser.includes('tenant')
      ? 'TENANT'
      : 'ADMIN';

    switchRole(role);

    if (role === 'TENANT') {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng Cư dân ${found?.fullName || 'Nguyễn Văn An'}!`
      );
      navigate('/tenant-portal');
    } else if (role === 'GUEST') {
      toast.success('Đăng nhập thành công', 'Chào mừng Khách xem phòng!');
      navigate('/explore');
    } else {
      const roleLabel =
        role === 'ADMIN'
          ? 'Quản trị viên'
          : role === 'ACCOUNTANT'
          ? 'Kế toán'
          : 'Nhân viên';
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng ${roleLabel} ${found?.fullName || ''}!`
      );
      navigate('/admin/dashboard');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        setUsername('admin');
        setPassword('admin123');
        break;
      case 'STAFF':
        setUsername('staff');
        setPassword('staff123');
        break;
      case 'ACCOUNTANT':
        setUsername('accountant');
        setPassword('acc123');
        break;
      case 'TENANT':
        setUsername('tenant');
        setPassword('tenant123');
        break;
    }
    switchRole(role);
    const roleLabel =
      role === 'ADMIN'
        ? 'Quản trị'
        : role === 'STAFF'
        ? 'Nhân viên'
        : role === 'ACCOUNTANT'
        ? 'Kế toán'
        : 'Cư dân';
    toast.success('Đăng nhập nhanh', `Đã chuyển vào tài khoản: ${roleLabel}`);
    if (role === 'TENANT') {
      navigate('/tenant-portal');
    } else if (role === 'GUEST') {
      navigate('/explore');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Main Login Card Container */}
      <div className="max-w-5xl w-full mx-auto my-auto bg-white rounded-[26px] shadow-sm border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Promo & Features (Clean Light Tone) */}
        <div className="lg:col-span-5 bg-slate-50/70 border-r border-slate-100 p-8 text-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6">
            {/* Dwell Logo & Brand Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100/90 flex items-center justify-center p-2 shadow-xs shrink-0">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                >
                  <rect x="13" y="8" width="18" height="34" rx="2" fill="#0284c7" />
                  <rect x="25" y="16" width="13" height="26" rx="1.5" fill="#38bdf8" />
                  <rect x="16" y="12" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="21" y="12" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="16" y="18" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="21" y="18" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="16" y="24" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="21" y="24" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="16" y="30" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="21" y="30" width="3" height="3" rx="0.5" fill="white" />
                  <rect x="28" y="20" width="2.5" height="2.5" rx="0.5" fill="#f0f9ff" />
                  <rect x="32" y="20" width="2.5" height="2.5" rx="0.5" fill="#f0f9ff" />
                  <rect x="28" y="26" width="2.5" height="2.5" rx="0.5" fill="#f0f9ff" />
                  <rect x="32" y="26" width="2.5" height="2.5" rx="0.5" fill="#f0f9ff" />
                  <rect x="28" y="32" width="2.5" height="2.5" rx="0.5" fill="#f0f9ff" />
                  <rect x="32" y="32" width="2.5" height="2.5" rx="0.5" fill="#f0f9ff" />
                  <path d="M9 42H39" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="text-[22px] font-extrabold text-[#1d4ed8] tracking-tight leading-none">
                  Dwell
                </div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tight leading-tight mt-1">
                  HỆ THỐNG CĂN HỘ CHO THUÊ TOÀN QUỐC
                </div>
                <div className="text-[7.5px] font-medium text-slate-400 uppercase tracking-tight leading-tight mt-0.5">
                  BÀN GIAO NHẬN PHÒNG TỨC THÌ
                </div>
              </div>
            </div>

            {/* Feature Cards (No Icons) */}
            <div className="space-y-3 pt-1">
              <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-900">Trợ lý AI RAG 24/7</div>
                <div className="text-[11px] text-slate-500 leading-normal mt-1">
                  Hỏi đáp nội quy tòa nhà, tóm tắt hợp đồng và ghi nhận sự cố tức thì.
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-900">Thanh toán VietQR NAPAS</div>
                <div className="text-[11px] text-slate-500 leading-normal mt-1">
                  Đối soát tiền điện nước, dịch vụ quản trị tự động theo thời gian thực.
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-900">Bảo mật chuẩn Quốc Gia</div>
                <div className="text-[11px] text-slate-500 leading-normal mt-1">
                  Xác thực JWT đa tầng, mã hóa mật khẩu BCrypt và lưu trữ an toàn.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form (Auto Role Authorization, No Icons) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            {/* Form Header */}
            <div className="mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hệ Thống Dwell
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  Xác thực an toàn
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Đăng Nhập
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhập tài khoản để truy cập hệ thống theo đúng vai trò và quyền hạn được cấp.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tài khoản, Email hoặc Số điện thoại *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu đăng nhập *</label>
                  <a href="#forgot" className="text-xs text-[#1d4ed8] hover:underline font-medium">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 pr-14 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-xs font-medium text-slate-500 hover:text-slate-800"
                  >
                    {showPassword ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#1d4ed8] focus:ring-[#1d4ed8]"
                  />
                  <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Mã hóa BCrypt
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-xs transition-all text-center"
              >
                Đăng Nhập Vào Hệ Thống
              </button>
            </form>

            {/* Quick Demo Login Chips (No Emojis / Icons) */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                Đăng nhập mẫu theo vai trò
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ADMIN')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-medium transition-colors text-center"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('STAFF')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-medium transition-colors text-center"
                >
                  Nhân viên
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ACCOUNTANT')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-medium transition-colors text-center"
                >
                  Kế toán
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('TENANT')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-medium transition-colors text-center"
                >
                  Cư dân
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Link to Explore */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Chưa có tài khoản thuê?{' '}
              <Link to="/explore" className="text-[#1d4ed8] font-semibold hover:underline">
                Xem phòng trực tuyến
              </Link>
            </div>
            <div className="text-[10px] text-slate-400">Phiên bản v2.4.0 (Dwell)</div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-xs">
        <div>© 2026 Dwell Living • Hệ thống căn hộ cho thuê toàn quốc</div>
        <div className="flex gap-4 text-slate-500">
          <a href="#terms" className="hover:underline">Điều khoản dịch vụ</a>
          <span>•</span>
          <a href="#privacy" className="hover:underline">Chính sách bảo mật</a>
          <span>•</span>
          <a href="#support" className="hover:underline">Hỗ trợ kỹ thuật</a>
        </div>
      </div>
    </div>
  );
};

