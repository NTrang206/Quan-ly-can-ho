import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { useToast } from '../hooks/useToast';
import { DwellLogo } from '../components/common/DwellLogo';
import { AIBotLogo } from '../components/common/AIBotLogo';

interface DemoUser {
  username: string;
  roleCode: UserRole;
  fullName: string;
}

const DEMO_USERS: DemoUser[] = [
  { username: 'admin@dwell.vn', roleCode: 'ADMIN', fullName: 'Hoàng Khánh Ly' },
  { username: 'accountant@dwell.vn', roleCode: 'ACCOUNTANT', fullName: 'Lê Thu Trang' },
  { username: 'staff@dwell.vn', roleCode: 'STAFF', fullName: 'Lê Quang Khánh' },
  { username: 'tenant@dwell.vn', roleCode: 'TENANT', fullName: 'Nguyễn Văn An' },
];

export const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login Form State
  const [username, setUsername] = useState('admin@dwell.vn');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  const { login, register, switchRole, isLoggingIn, isRegistering } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');

  const navigateByRole = (role: UserRole, fullName?: string) => {
    if (redirectParam) {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng ${fullName || 'bạn'} quay lại hệ thống!`
      );
      navigate(redirectParam);
      return;
    }
    if (role === 'TENANT') {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng Cư dân / Khách thuê ${fullName || 'Nguyễn Văn An'}!`
      );
      navigate('/tenant-portal');
    } else if (role === 'ACCOUNTANT') {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng Kế toán trưởng ${fullName || 'Hoàng Khánh Ly'}!`
      );
      navigate('/admin/finance');
    } else if (role === 'STAFF') {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng Nhân viên vận hành ${fullName || ''}!`
      );
      navigate('/admin/buildings');
    } else {
      toast.success(
        'Đăng nhập thành công',
        `Chào mừng Quản trị viên ${fullName || ''}!`
      );
      navigate('/admin/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();

    try {
      const res = await login(cleanUser, password);
      navigateByRole(res.user.roleCode, res.user.fullName);
      return;
    } catch {
      // Nếu người dùng nhập từ khóa nhanh (vd: cudan, ketoan...) thì tự động map sang tài khoản demo tương ứng và gọi API login thật
      const lower = cleanUser.toLowerCase();
      let targetCreds: { u: string; p: string } | null = null;
      if (lower.includes('tenant') || lower.includes('cudan') || lower.includes('khach')) {
        targetCreds = { u: 'tenant@dwell.vn', p: 'tenant123' };
      } else if (lower.includes('acc') || lower.includes('ketoan')) {
        targetCreds = { u: 'accountant@dwell.vn', p: 'acc123' };
      } else if (lower.includes('staff') || lower.includes('nhanvien')) {
        targetCreds = { u: 'staff@dwell.vn', p: 'staff123' };
      } else if (lower.includes('admin') || lower.includes('quantri')) {
        targetCreds = { u: 'admin@dwell.vn', p: 'admin123' };
      }

      if (targetCreds) {
        try {
          const res = await login(targetCreds.u, targetCreds.p);
          navigateByRole(res.user.roleCode, res.user.fullName);
          return;
        } catch {
          // fallback
        }
      }

      toast.error(
        'Đăng nhập thất bại',
        'Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại hoặc chọn vai trò mẫu bên dưới!'
      );
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    let demoUser = 'admin@dwell.vn';
    let demoPass = 'admin123';
    switch (role) {
      case 'ADMIN':
        demoUser = 'admin@dwell.vn';
        demoPass = 'admin123';
        break;
      case 'ACCOUNTANT':
        demoUser = 'accountant@dwell.vn';
        demoPass = 'acc123';
        break;
      case 'STAFF':
        demoUser = 'staff@dwell.vn';
        demoPass = 'staff123';
        break;
      case 'TENANT':
        demoUser = 'tenant@dwell.vn';
        demoPass = 'tenant123';
        break;
      default:
        demoUser = 'admin@dwell.vn';
        demoPass = 'admin123';
        break;
    }
    setUsername(demoUser);
    setPassword(demoPass);

    try {
      const res = await login(demoUser, demoPass);
      navigateByRole(res.user.roleCode, res.user.fullName);
    } catch {
      await switchRole(role);
      const found = DEMO_USERS.find((u) => u.roleCode === role);
      navigateByRole(role, found?.fullName);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!regFullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên';
    }
    if (!regPhone.trim() || regPhone.trim().length < 8) {
      errors.phone = 'Số điện thoại hợp lệ (từ 8 đến 11 số)';
    }
    if (!regPassword || regPassword.length < 6) {
      errors.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      toast.error('Lỗi nhập liệu', 'Vui lòng điền đầy đủ và chính xác thông tin đăng ký');
      return;
    }

    setRegErrors({});
    try {
      const res = await register({
        full_name: regFullName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
        username: regPhone.trim(),
        password: regPassword,
      });

      toast.success(
        'Đăng ký tài khoản thành công',
        `Chào mừng ${res.user.fullName || regFullName} gia nhập Dwell Living!`
      );
      navigateByRole('TENANT', res.user.fullName || regFullName);
    } catch (err: any) {
      const msg = err?.data?.detail || err?.message || 'Đăng ký không thành công. Tên đăng nhập hoặc số điện thoại có thể đã tồn tại!';
      toast.error('Đăng ký thất bại', msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Main Login Card Container */}
      <div className="max-w-5xl w-full mx-auto my-auto bg-white rounded-[26px] shadow-sm border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand Promo & Features (Clean Light Tone) */}
        <div className="lg:col-span-5 bg-slate-50/70 border-r border-slate-100 p-8 text-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {/* Dwell Logo & Brand Header */}
            <div className="pb-4 border-b border-slate-200/80">
              <DwellLogo size="lg" />
            </div>

            {/* Feature Cards (No Icons) */}
            <div className="space-y-3 pt-1">
              <div className="bg-white/95 backdrop-blur-xs border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <AIBotLogo size="xs" />
                  <span>Trợ lý AI RAG 24/7</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-normal mt-1">
                  Hỏi đáp nội quy tòa nhà, tóm tắt hợp đồng và ghi nhận sự cố tức thì.
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-xs border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-900">Thanh toán VietQR NAPAS</div>
                <div className="text-[11px] text-slate-500 leading-normal mt-1">
                  Đối soát tiền điện nước, dịch vụ quản trị tự động theo thời gian thực.
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-xs border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="text-xs font-bold text-slate-900">Bảo mật chuẩn Quốc Gia</div>
                <div className="text-[11px] text-slate-500 leading-normal mt-1">
                  Xác thực JWT đa tầng, mã hóa mật khẩu BCrypt và lưu trữ an toàn.
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Aerial Photo Banner (Faded / Soft Blend like Image 3) */}
          <div className="relative mt-6 -mx-8 -mb-8 overflow-hidden group">
            {/* Top gradient mask to blend photo softly into the card */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-slate-50/20 to-slate-50/95 pointer-events-none z-10" />
            <img
              src="/sunshine-apartment-complex.jpg"
              alt="Khu phức hợp Căn hộ Dwell"
              className="w-full h-44 object-cover object-center opacity-85 transition-opacity duration-300"
            />
            {/* Subtle caption tag */}
            <div className="absolute bottom-2.5 left-3.5 z-20 px-2.5 py-0.5 rounded-full bg-slate-900/60 backdrop-blur-sm text-[10px] text-white/90 font-medium">
              Khu phức hợp Dwell Living
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms (Login / Register Switcher) */}
        <div className="lg:col-span-7 p-6 sm:p-9 flex flex-col justify-between bg-white">
          <div>
            {/* Segmented Control Switcher: Đăng Nhập / Đăng Ký */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('LOGIN');
                  setRegErrors({});
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all text-center ${
                  activeTab === 'LOGIN'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('REGISTER');
                  setRegErrors({});
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all text-center ${
                  activeTab === 'REGISTER'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Đăng Ký Tài Khoản
              </button>
            </div>

            {redirectParam && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Yêu cầu đăng nhập:</strong> Vui lòng đăng nhập hoặc đăng ký tài khoản Khách thuê / Cư dân để tiếp tục quy trình thuê phòng.
                </span>
              </div>
            )}

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'LOGIN' && (
              <>
                <form onSubmit={handleLogin} className="space-y-3.5">
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
                    disabled={isLoggingIn}
                    className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-xs transition-all text-center disabled:opacity-50"
                  >
                    {isLoggingIn ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}
                  </button>
                </form>

                {/* Quick Demo Login Chips */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                    Đăng nhập mẫu theo vai trò (1-Click Switch)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="VD: Nguyễn Văn An"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                    />
                    {regErrors.fullName && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{regErrors.fullName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại (dùng làm tài khoản đăng nhập) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="VD: 0912888999"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                    />
                    {regErrors.phone && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{regErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Địa chỉ Email (tùy chọn)
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="VD: an.nguyen@gmail.com (dùng nhận thông báo hợp đồng, hóa đơn)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mật khẩu *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Tối thiểu 6 ký tự..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 pr-8 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-2 p-1 text-slate-400 hover:text-slate-700"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {regErrors.password && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{regErrors.password}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Xác nhận mật khẩu *
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1d4ed8] focus:bg-white transition-all"
                    />
                    {regErrors.confirmPassword && (
                      <span className="text-[10px] text-red-500 mt-0.5 block">{regErrors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                  ✓ Tài khoản sau khi đăng ký sẽ tự động đăng nhập với vai trò <strong>Khách thuê / Cư dân</strong> để sẵn sàng đặt lịch xem phòng hoặc đăng ký thuê.
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all text-center disabled:opacity-50"
                >
                  {isRegistering ? 'Đang đăng ký...' : 'Đăng Ký'}
                </button>
              </form>
            )}
          </div>

          {/* Bottom Link to Explore & System Info */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              <Link to="/explore" className="text-[#1d4ed8] font-semibold hover:underline">
                Xem phòng với tư cách khách →
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

