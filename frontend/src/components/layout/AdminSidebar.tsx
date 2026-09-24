import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Building2,
  FileText,
  Radio,
  Wrench,
  Landmark,
  Zap,
  ShieldCheck,
  Sparkles,
  History,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/useRedux';
import { useAuth } from '../../hooks/useAuth';
import { DwellLogo } from '../common/DwellLogo';
import { AIBotLogo } from '../common/AIBotLogo';
import clsx from 'clsx';

export const AdminSidebar: React.FC = () => {
  const { sidebarOpen } = useAppSelector((state) => state.global);
  const { isAccountant, isStaff } = useAuth();

  const navItems = isAccountant
    ? [
        {
          to: '/admin/dashboard',
          label: 'Tổng quan tài chính',
          icon: <LayoutGrid className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/finance?tab=REPORTS',
          label: 'Sổ quỹ & Báo cáo thu chi',
          icon: <Landmark className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/contracts',
          label: 'Hợp đồng & Tiền cọc',
          icon: <FileText className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/buildings',
          label: 'Mặt bằng tòa nhà',
          icon: <Building2 className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/rag-chatbot',
          label: 'Trợ lý AI Kế toán',
          icon: <AIBotLogo size="xs" />,
        },
      ]
    : isStaff
    ? [
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
          to: '/admin/maintenance',
          label: 'Vận hành bảo trì',
          icon: <Wrench className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/bookings',
          label: 'Quản lý dịch vụ',
          icon: <Zap className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/tenants',
          label: 'An ninh & Cư dân',
          icon: <ShieldCheck className="w-[18px] h-[18px]" />,
        },
        {
          to: '/admin/rag-chatbot',
          label: 'Trợ lý AI',
          icon: <AIBotLogo size="xs" />,
        },
      ]
    : [
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
          label: 'Trợ lý AI',
          icon: <AIBotLogo size="xs" />,
        },
        {
          to: '/resident-portal',
          label: 'Cổng cư dân',
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
      {/* Main White Card */}
      <div className="bg-white rounded-[26px] border border-slate-200/80 shadow-xs p-3.5 flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Brand Header */}
        <div className="pb-3 border-b border-slate-100">
          <DwellLogo
            badge={isAccountant ? 'Kế Toán' : isStaff ? 'Vận Hành' : 'ADMIN'}
            badgeVariant={isAccountant ? 'emerald' : isStaff ? 'slate' : 'blue'}
            subtitle1={isAccountant ? 'Phân hệ tài chính & kế toán' : 'Hệ thống căn hộ cho thuê toàn quốc'}
            subtitle2={isAccountant ? 'Đối soát & sổ quỹ tức thì' : 'Bàn giao nhận phòng tức thì'}
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
      </div>
    </aside>
  );
};
