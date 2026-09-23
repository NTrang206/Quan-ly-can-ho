import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  FileText,
  Radio,
  Receipt,
  Wrench,
  Landmark,
  Zap,
  ShieldCheck,
  Sparkles,
  History,
  Cpu,
  AudioWaveform,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import clsx from 'clsx';

export const AdminSidebar: React.FC = () => {
  const { sidebarOpen } = useAppSelector((state) => state.global);

  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Bảng tổng quan',
      icon: <LayoutGrid className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/buildings',
      label: 'Quản lý phòng',
      icon: <Building2 className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/contracts',
      label: 'Quản lý hợp đồng',
      icon: <FileText className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/alerts',
      label: 'Giám sát IoT',
      icon: <Radio className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/finance',
      label: 'Thu phí tự động',
      icon: <Receipt className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/maintenance',
      label: 'Vận hành bảo trì',
      icon: <Wrench className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/finance?tab=REPORTS',
      label: 'Báo cáo thu chi',
      icon: <Landmark className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/bookings',
      label: 'Quản lý dịch vụ',
      icon: <Zap className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/tenants',
      label: 'An ninh',
      icon: <ShieldCheck className="w-[18px] h-[18px]" />,
    },
    {
      to: '/admin/rag-chatbot',
      label: 'Trợ lý',
      icon: <Sparkles className="w-[18px] h-[18px]" />,
    },
    {
      to: '/resident-portal',
      label: 'Lịch sử',
      icon: <History className="w-[18px] h-[18px]" />,
    },
  ];

  return (
    <aside
      className={clsx(
        'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 p-3 bg-[#f0f4f8] flex flex-col justify-between transition-transform duration-300 shrink-0 select-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Top Main White Card */}
      <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-xs p-3.5 flex-1 flex flex-col min-h-0 mb-2.5 overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          {/* Logo Icon Box */}
          <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100/90 flex items-center justify-center p-1.5 shadow-xs shrink-0">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
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

          {/* Brand Text */}
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold tracking-tight text-[#1d4ed8] leading-none">
              Dwell
            </h1>
            <p className="text-[7.5px] font-bold text-slate-500 uppercase tracking-tight leading-tight mt-1 truncate">
              Hệ thống căn hộ cho thuê toàn quốc
            </p>
            <p className="text-[7px] font-medium text-slate-400 uppercase tracking-tight leading-tight mt-0.5 truncate">
              Bàn giao nhận phòng tức thì
            </p>
          </div>
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
      </div>

      {/* Bottom Floating Status Cards */}
      <div className="space-y-2">
        {/* Card 1: Core Engine Status */}
        <div className="bg-[#546274] rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-[11px] font-semibold text-slate-100">
              Core Engine Status:
            </span>
          </div>
          <span className="font-mono font-bold text-[11px] text-emerald-400 tracking-wider">
            ONLINE
          </span>
        </div>

        {/* Card 2: Truyền trực tuyến */}
        <div className="bg-white rounded-xl px-3.5 py-2.5 border border-slate-200/90 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <AudioWaveform className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-[12px] font-medium text-slate-700">
              Truyền trực tuyến
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
};
