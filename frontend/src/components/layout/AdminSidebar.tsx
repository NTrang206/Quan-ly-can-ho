import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  Users,
  FileText,
  CreditCard,
  Wrench,
  CalendarCheck,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { DwellLogo } from '../common/DwellLogo';
import clsx from 'clsx';

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { sidebarOpen } = useAppSelector((state) => state.global);
  const { isAccountant, isStaff, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công', 'Hẹn gặp lại bạn!');
    navigate('/login');
  };

  const navItems = isAccountant
    ? [
        {
          to: '/admin/dashboard',
          label: 'Thống kê & Tổng quan',
          icon: <LayoutGrid className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/finance',
          label: 'Thanh toán & Công nợ',
          icon: <CreditCard className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/contracts',
          label: 'Hợp đồng & Tiền cọc',
          icon: <FileText className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/tenants',
          label: 'Khách thuê & Sổ nợ',
          icon: <Users className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/alerts',
          label: 'Cảnh báo nợ quá hạn',
          icon: <AlertTriangle className="w-[18px] h-[18px]" />,
        },
      ]
    : isStaff
    ? [
        {
          to: '/admin/buildings',
          label: 'Căn hộ & Tòa nhà',
          icon: <Building2 className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/bookings',
          label: 'Đặt lịch & Giữ chỗ',
          icon: <CalendarCheck className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/tenants',
          label: 'Khách thuê & Liên hệ',
          icon: <Users className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/contracts',
          label: 'Hợp đồng & Tiền cọc',
          icon: <FileText className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/maintenance',
          label: 'Yêu cầu bảo trì',
          icon: <Wrench className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/alerts',
          label: 'Cảnh báo hết hạn HĐ',
          icon: <AlertTriangle className="w-[18px] h-[18px]" />,
        },
      ]
    : [
        {
          to: '/admin/dashboard',
          label: 'Thống kê & Tổng quan',
          icon: <LayoutGrid className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/buildings',
          label: 'Căn hộ & Tòa nhà',
          icon: <Building2 className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/bookings',
          label: 'Đặt lịch & Giữ chỗ',
          icon: <CalendarCheck className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/tenants',
          label: 'Khách thuê & Liên hệ',
          icon: <Users className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/contracts',
          label: 'Hợp đồng & Tiền cọc',
          icon: <FileText className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/finance',
          label: 'Thanh toán & Công nợ',
          icon: <CreditCard className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/maintenance',
          label: 'Yêu cầu bảo trì',
          icon: <Wrench className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/alerts',
          label: 'Cảnh báo quá hạn & HĐ',
          icon: <AlertTriangle className="w-[18px] h-[18px]" />,
        },
      ];

  return (
    <aside
      className={clsx(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 p-3 bg-[#f0f4f8] flex flex-col justify-between transition-transform duration-300 shrink-0 select-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Main White Card */}
      <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-xs p-3.5 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Brand Header */}
        <div className="pb-3 border-b border-slate-100">
          <DwellLogo
            badge={isAccountant ? 'Kế Toán' : isStaff ? 'Vận Hành' : 'ADMIN'}
            badgeVariant={isAccountant ? 'emerald' : isStaff ? 'slate' : 'blue'}
            showSubtitles={false}
          />
        </div>

        {/* Navigation links list */}
        <nav className="mt-2.5 space-y-0.5 overflow-y-auto flex-1 pr-0.5">
          {navItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) =>
                clsx(
                  'group flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150',
                  isActive
                    ? 'bg-[#546274] text-white font-medium shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-normal'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={clsx(
                        'transition-colors shrink-0',
                        isActive ? 'text-[#38bdf8]' : 'text-slate-500 group-hover:text-slate-700'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="text-[13px] truncate">{item.label}</span>
                  </div>

                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-xs shrink-0 ml-2" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="pt-2 border-t border-slate-100 mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 rounded-xl transition-all duration-150 group cursor-pointer"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
            <span className="text-[13px] font-bold">Đăng Xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
