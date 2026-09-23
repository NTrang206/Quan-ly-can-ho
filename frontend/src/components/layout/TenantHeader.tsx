import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building,
  PhoneCall,
  User,
  LogOut,
  Sparkles,
  Search,
  Home,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const TenantHeader: React.FC = () => {
  const { user, isTenant, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Room Badge */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/tenant-portal" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 flex items-center justify-center text-white shadow-soft">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Sunshine Homes</span>
                <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 rounded-md">
                  Resident Hub
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Cổng Dịch Vụ Cư Dân Toàn Diện</div>
            </div>
          </Link>

          {isTenant && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200/80 rounded-full text-xs font-bold text-sky-800">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>Phòng P.302 - Sunshine Tower A</span>
            </div>
          )}
        </div>

        {/* Right Nav & Emergency Hotline */}
        <div className="flex items-center gap-3">
          <Link
            to="/explore"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-brand-600 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tìm Phòng Trống</span>
          </Link>

          {/* Hotline */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-800 rounded-xl text-xs font-bold border border-brand-200/60">
            <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
            <span>Hotline: 1900 8899</span>
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900">{user?.fullName || 'Khách Tìm Thuê'}</div>
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
