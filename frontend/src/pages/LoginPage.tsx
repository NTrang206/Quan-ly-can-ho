import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  Bot,
  QrCode,
  Sparkles,
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
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Bar Navigation */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-end">
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 font-semibold">
            <Phone className="w-3.5 h-3.5 text-[#1d4ed8]" />
            <span>Hotline: <strong className="text-slate-900">1900 8899</strong></span>
          </div>
          <div className="px-2.5 py-1 bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 shadow-xs">
            <span>🌐 Tiếng Việt</span>
          </div>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="max-w-5xl w-full mx-auto my-6 bg-white rounded-[26px] shadow-sm border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Promo & Features (Clean Light Tone) */}
        <div className="lg:col-span-5 bg-slate-50/70 border-r border-slate-100 p-8 text-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-5">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-100 rounded-full text-[11px] font-semibold text-sky-800">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span>HỆ THỐNG QUẢN TRỊ & DỊCH VỤ CƯ DÂN</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-snug">
                Chào mừng bạn đến với <br />
                <span className="text-[#1d4ed8]">Dwell Living</span>
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Nền tảng quản lý vận hành căn hộ cho thuê thông minh, bàn giao phòng tức thì và bảo mật toàn diện.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-start gap-3 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Trợ lý AI RAG 24/7</div>
                  <div className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Hỏi đáp nội quy tòa nhà, tóm tắt hợp đồng và ghi nhận sự cố tức thì.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Thanh toán VietQR NAPAS</div>
                  <div className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Đối soát tiền điện nước, dịch vụ quản trị tự động theo thời gian thực.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Bảo mật chuẩn Quốc Gia</div>
                  <div className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Xác thực JWT đa tầng, mã hóa mật khẩu BCrypt và lưu trữ an toàn.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="mt-6 pt-5 border-t border-slate-200/70 grid grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-bold text-slate-900">99.8%</div>
              <div className="text-[10px] text-slate-500 font-medium">Phản hồi đúng hạn</div>
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">&lt; 0.4s</div>
              <div className="text-[10px] text-slate-500 font-medium">Tốc độ truy vấn RAG</div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between bg-white">
          <div>
            {/* Dwell Logo & Brand Header at the very top of the login form */}
            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100">
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

            {/* Tab Switch */}
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('TENANT');
                  setUsername('tenant');
                }}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'TENANT'
                    ? 'bg-white text-slate-900 shadow-xs'
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
                className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                  activeTab === 'MANAGEMENT'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🛡️ Ban Quản Lý / Staff / Kế toán
              </button>
            </div>

            {/* Welcome Text */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {activeTab === 'TENANT' ? 'Cổng Dịch Vụ Cư Dân' : 'Quản Trị Vận Hành (RBAC)'}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cổng xác thực an toàn
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Mật khẩu đăng nhập *</label>
                  <a href="#forgot" className="text-xs text-[#1d4ed8] hover:underline font-medium">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
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
                    className="rounded border-slate-300 text-[#1d4ed8] focus:ring-[#1d4ed8]"
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
                className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Đăng Nhập Vào Hệ Thống</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo 1-Click Login Chips */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Đăng Nhập Nhanh Trải Nghiệm (Demo Roles)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ADMIN')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200/80 text-xs font-medium transition-colors"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('STAFF')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200/80 text-xs font-medium transition-colors"
                >
                  💼 Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('ACCOUNTANT')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 text-xs font-medium transition-colors"
                >
                  📊 Kế toán
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('TENANT')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200/80 text-xs font-medium transition-colors"
                >
                  🏠 Cư dân
                </button>
              </div>
            </div>
          </div>

          {/* Bottom link to explore */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Chưa có hợp đồng thuê?{' '}
              <Link to="/explore" className="text-[#1d4ed8] font-semibold hover:underline">
                Cổng Xem Phòng Online (Guest) ↗
              </Link>
            </div>
            <div className="text-[10px] text-slate-400">Phiên bản v2.4.0 (Dwell Living)</div>
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

