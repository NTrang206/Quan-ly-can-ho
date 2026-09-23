import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building,
  Shield,
  Bot,
  QrCode,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { INITIAL_USERS } from '../stores/mockDatabase';
import { UserRole } from '../types';
import { useToast } from '../hooks/useToast';

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TENANT' | 'MANAGEMENT'>('TENANT');
  const [username, setUsername] = useState('tenant');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'TENANT') {
      switchRole('TENANT');
      toast.success('Đăng nhập thành công', 'Chào mừng Cư dân Nguyễn Văn An!');
      navigate('/tenant-portal');
    } else {
      // Find matching user or fallback to ADMIN
      const found = INITIAL_USERS.find((u) => u.username === username);
      const role: UserRole = found ? found.roleCode : 'ADMIN';
      switchRole(role);
      toast.success('Đăng nhập thành công', `Chào mừng ${found?.fullName || 'Quản trị viên'}!`);
      navigate('/admin/dashboard');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    switchRole(role);
    toast.success('Đăng nhập nhanh', `Đã chuyển vào tài khoản demo: ${role}`);
    if (role === 'TENANT') {
      navigate('/tenant-portal');
    } else if (role === 'GUEST') {
      navigate('/explore');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-slate-200 flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Top bar branding */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-white shadow-soft">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900 tracking-tight">Sunshine Homes</div>
            <div className="text-[11px] text-slate-500">Apartment Management System</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 font-semibold">
            <Phone className="w-3.5 h-3.5 text-brand-600" />
            <span>Hotline: <strong className="text-slate-900">1900 8899</strong></span>
          </div>
          <div className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1">
            <span>🌐 VN</span>
          </div>
        </div>
      </div>

      {/* Main Login Container */}
      <div className="max-w-5xl w-full mx-auto my-8 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Promo & Features */}
        <div className="lg:col-span-5 bg-gradient-to-br from-brand-900 via-slate-900 to-brand-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative blur circle */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-brand-300">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-300 uppercase tracking-wider">Sunshine Homes</div>
                <div className="text-[11px] text-slate-400">Đề tài 12: Quản Lý Thuê Căn Hộ Tích Hợp AI RAG</div>
              </div>
            </div>

            <span className="inline-block px-3 py-1 bg-brand-500/20 border border-brand-400/30 text-brand-300 rounded-full text-xs font-semibold">
              ● HỆ THỐNG QUẢN TRỊ & DỊCH VỤ CƯ DÂN TOÀN DIỆN
            </span>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Chào mừng trở lại <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-sky-200">
                  Sunshine Homes
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Nền tảng quản lý vận hành tòa nhà thông minh, tích hợp trợ lý ảo phục vụ cư dân nhanh chóng, minh bạch và an toàn tuyệt đối.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Trợ lý AI RAG 24/7</div>
                  <div className="text-[11px] text-slate-400">
                    Hỏi đáp nội quy tòa nhà, phân tích hợp đồng và tạo ticket sự cố trong 0.4s.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Thanh toán VietQR NAPAS</div>
                  <div className="text-[11px] text-slate-400">
                    Đối soát tiền điện nước, dịch vụ quản trị tự động theo thời gian thực.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Bảo mật chuẩn Quốc Gia</div>
                  <div className="text-[11px] text-slate-400">
                    Xác thực JWT đa tầng, mã hóa mật khẩu BCrypt và hỗ trợ căn cước VNeID.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-black text-white">99.8%</div>
              <div className="text-[10px] text-slate-400">Phản hồi đúng hạn</div>
            </div>
            <div>
              <div className="text-lg font-black text-white">&lt; 0.4s</div>
              <div className="text-[10px] text-slate-400">Tốc độ truy vấn RAG</div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Tab switch */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('TENANT');
                  setUsername('tenant');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'TENANT'
                    ? 'bg-white text-slate-900 shadow-soft'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🏠 Cư Dân / Khách Thuê
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('MANAGEMENT');
                  setUsername('admin');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'MANAGEMENT'
                    ? 'bg-white text-slate-900 shadow-soft'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🛡️ Ban Quản Lý / Staff / Kế toán
              </button>
            </div>

            {/* Welcome text */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {activeTab === 'TENANT' ? 'Cổng Dịch Vụ Cư Dân' : 'Quản Trị Vận Hành (RBAC)'}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Cổng xác thực an toàn
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {activeTab === 'TENANT' ? 'Đăng nhập Resident Portal' : 'Đăng nhập Admin Dashboard'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'TENANT'
                  ? 'Tra cứu hóa đơn, tiện ích và gửi yêu cầu bảo trì trực tuyến.'
                  : 'Kiểm soát tòa nhà, duyệt hợp đồng và quản lý tài chính.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tài khoản hoặc Số điện thoại / Email *
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập mã căn hộ, email hoặc số điện thoại..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu đăng nhập *</label>
                  <a href="#forgot" className="text-xs text-brand-600 hover:underline">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>Ghi nhớ phiên đăng nhập (30 ngày)</span>
                </label>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Mã hóa BCrypt
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-soft hover:shadow-glow transition-all flex items-center justify-center gap-2"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo 1-Click Login Chips */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Đăng Nhập Nhanh Trải Nghiệm 1-Click (Demo Roles)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ADMIN')}
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/60 text-xs font-semibold transition-colors"
                >
                  👑 Admin (Quản trị)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('STAFF')}
                  className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/60 text-xs font-semibold transition-colors"
                >
                  💼 Staff (Nhân viên)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ACCOUNTANT')}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60 text-xs font-semibold transition-colors"
                >
                  📊 Kế toán
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('TENANT')}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 text-xs font-semibold transition-colors"
                >
                  🏠 Cư dân P.302
                </button>
              </div>
            </div>
          </div>

          {/* Bottom link to explore */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Chưa có hợp đồng thuê?{' '}
              <Link to="/explore" className="text-brand-600 font-bold hover:underline">
                Cổng Xem Phòng Online (Guest) ↗
              </Link>
            </div>
            <div className="text-[10px] text-slate-400">Phiên bản v2.4.0 (ICTU KTPM K23C)</div>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-5xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-xs">
        <div>© 2026 Sunshine Homes Resident Portal • Đề tài 12 - Quản lý chung cư thông minh</div>
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
