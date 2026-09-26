import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  PhoneCall,
  User,
  LogOut,
  Sparkles,
  Search,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { DwellLogo } from '../common/DwellLogo';

export const TenantHeader: React.FC = () => {
  const { user, isTenant, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isExploreTab = location.search.includes('tab=explore');

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Room Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/resident-portal?tab=resident">
            <DwellLogo badge="Resident Hub" badgeVariant="sky" />
          </Link>

          {isTenant && (
            <Link
              to="/resident-portal?tab=resident"
              className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200/80 rounded-full text-xs font-bold text-sky-800 transition-colors"
              title="Về hồ sơ phòng P.302"
            >
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>Phòng P.302 - Sunshine Tower A</span>
            </Link>
          )}
        </div>

        {/* Right Nav: Mode Switcher & Emergency Hotline */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs font-semibold">
            <Link
              to="/resident-portal?tab=resident"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                !isExploreTab
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Cổng Cư Dân</span>
            </Link>

            <Link
              to="/resident-portal?tab=explore"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                isExploreTab
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Khách Xem Phòng</span>
            </Link>
          </div>

          {/* Hotline */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-800 rounded-xl text-xs font-bold border border-brand-200/60">
            <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
            <span>Hotline: 1900 8899</span>
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{user?.username || user?.fullName || 'Khách Tìm Thuê'}</div>
              <div className="text-[10px] text-slate-500 font-semibold">{user?.roleCode === 'TENANT' ? 'Căn hộ P.302' : user?.roleCode}</div>
            </div>

            <button
              onClick={() => {
                if (user?.roleCode === 'ADMIN' || user?.roleCode === 'STAFF' || user?.roleCode === 'ACCOUNTANT') {
                  navigate('/admin/dashboard');
                } else {
                  logout();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title={user?.roleCode === 'ADMIN' ? 'Về trang Quản Trị' : 'Đăng xuất'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
