import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { INITIAL_USERS } from '../stores/mockDatabase';
import { UserRole } from '../types';
import { useToast } from '../hooks/useToast';
import { DwellLogo } from '../components/common/DwellLogo';
import { AIBotLogo } from '../components/common/AIBotLogo';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin@dwell.vn');
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

    let role: UserRole;
    if (found) {
      role = found.roleCode;
    } else if (
      cleanUser.includes('tenant') ||
      cleanUser.includes('cudan') ||
      cleanUser.includes('cu_dan') ||
      cleanUser.includes('khachhang') ||
      cleanUser.includes('khach_hang') ||
      cleanUser.includes('khachthue')
    ) {
      // Customer / Resident portal
      role = 'TENANT';
    } else if (cleanUser.includes('guest') || cleanUser.includes('khachxem') || cleanUser.includes('xemphong')) {
      // Guest exploration portal
      role = 'GUEST';
    } else if (cleanUser.includes('acc') || cleanUser.includes('ketoan') || cleanUser.includes('taichinh')) {
      // Accountant portal
      role = 'ACCOUNTANT';
    } else if (cleanUser.includes('staff') || cleanUser.includes('nhanvien') || cleanUser.includes('kythuat')) {
      // Building Staff portal
      role = 'STAFF';
    } else if (cleanUser.includes('admin') || cleanUser.includes('quantri')) {
      // Admin portal
      role = 'ADMIN';
    } else {
      toast.error(
        'Đăng nhập thất bại',
        'Tài khoản không chính xác. Vui lòng bấm vào các nút vai trò mẫu bên dưới (Admin, Kế toán, Khách hàng)!'
      );
      return;
    }

    switchRole(role);

    if (role === 'TENANT') {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng Cư dân / Khách thuê ${found?.fullName || 'Nguyễn Văn An'}!`
      );
      navigate('/resident-portal');
    } else if (role === 'GUEST') {
      toast.success('Đăng nhập thành công', 'Chào mừng Khách xem phòng trực tuyến!');
      navigate('/explore');
    } else if (role === 'ACCOUNTANT') {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng Kế toán trưởng ${found?.fullName || 'Hoàng Khánh Ly'}!`
      );
      navigate('/admin/finance');
    } else {
      const roleLabel = role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên';
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
        setUsername('admin@dwell.vn');
        setPassword('admin123');
        break;
      case 'ACCOUNTANT':
        setUsername('accountant@dwell.vn');
        setPassword('acc123');
        break;
      case 'STAFF':
        setUsername('staff@dwell.vn');
        setPassword('staff123');
        break;
      case 'TENANT':
        setUsername('tenant@dwell.vn');
        setPassword('tenant123');
        break;
      case 'GUEST':
        setUsername('guest@dwell.vn');
        setPassword('guest123');
        break;
    }
    switchRole(role);
    const roleLabel =
      role === 'ADMIN'
        ? 'Quản trị viên'
        : role === 'ACCOUNTANT'
        ? 'Kế toán trưởng'
        : role === 'STAFF'
        ? 'Nhân viên'
        : role === 'TENANT'
        ? 'Khách hàng / Cư dân'
        : 'Khách tìm thuê';
    toast.success('Đăng nhập nhanh', `Đã chuyển vào tài khoản: ${roleLabel}`);
    if (role === 'TENANT') {
      navigate('/resident-portal');
    } else if (role === 'GUEST') {
      navigate('/explore');
    } else if (role === 'ACCOUNTANT') {
      navigate('/admin/finance');
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
            <div className="pb-4 border-b border-slate-200/80">
              <DwellLogo size="lg" />
            </div>

            {/* Feature Cards (No Icons) */}
            <div className="space-y-3 pt-1">
              <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AIBotLogo size="xs" />
                  <span>Trợ lý AI RAG 24/7</span>
                </div>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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

            {/* Quick Demo Login Chips */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                Đăng nhập mẫu theo vai trò (1-Click Switch)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ADMIN')}
                  className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 text-xs font-bold transition-colors text-center"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ACCOUNTANT')}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition-colors text-center"
                >
                  Kế toán
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('STAFF')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold transition-colors text-center"
                >
                  Nhân viên
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('TENANT')}
                  className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 text-xs font-bold transition-colors text-center"
                >
                  Khách hàng / Cư dân
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('GUEST')}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 text-xs font-semibold transition-colors text-center"
                >
                  Khách tìm thuê
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

