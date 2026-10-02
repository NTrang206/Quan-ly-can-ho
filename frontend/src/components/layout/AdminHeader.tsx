import React, { useState, useMemo } from 'react';
import {
  Bell,
  Menu,
  LogOut,
  ChevronDown,
  Building2,
  Search,
  FileText,
  Calendar,
  Wrench,
  CheckCheck,
  ArrowRight,
  Sparkles,
  Users,
  Receipt,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useRedux';
import { toggleSidebar } from '../../stores/globalSlice';
import { useToast } from '../../hooks/useToast';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useGetContractsQuery } from '../../modules/contracts/services/contractApi';
import { useGetBookingsQuery } from '../../modules/bookings/services/bookingApi';
import { useGetMaintenanceRequestsQuery } from '../../modules/maintenance/services/maintenanceApi';
import { useGetTenantsQuery } from '../../modules/tenants/services/tenantApi';
import { useGetApartmentsQuery } from '../../modules/buildings/services/buildingApi';
import { useGetReceivablesQuery } from '../../modules/finance/services/financeApi';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface HeaderNotification {
  id: string;
  category: 'CONTRACT' | 'BOOKING' | 'MAINTENANCE' | 'RESIDENCE' | 'FINANCE';
  title: string;
  message: string;
  timestamp: string;
  route: string;
  isUnread: boolean;
  priority?: 'HIGH' | 'NORMAL' | 'URGENT';
}

export const AdminHeader: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'ALL' | 'MAINTENANCE' | 'BOOKING' | 'RESIDENCE' | 'CONTRACT' | 'FINANCE'>('ALL');
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  // Fetch live operational data
  const { data: contracts = [] } = useGetContractsQuery({});
  const { data: bookings = [] } = useGetBookingsQuery({});
  const { data: maintenanceRequests = [] } = useGetMaintenanceRequestsQuery({});
  const { data: tenants = [] } = useGetTenantsQuery({});
  const { data: apartments = [] } = useGetApartmentsQuery({});
  const { data: receivables = [] } = useGetReceivablesQuery({});

  // Generate real business notifications
  const allNotifications = useMemo(() => {
    const list: HeaderNotification[] = [];
    const tenantMap = new Map(tenants.map((t) => [t.id, t]));
    const aptMap = new Map(apartments.map((a) => [a.id, a]));

    // 1. Yêu cầu sự cố & sửa chữa từ cư dân (Maintenance Requests)
    maintenanceRequests.forEach((m) => {
      if (m.status === 'PENDING') {
        list.push({
          id: `maint-pending-${m.id}`,
          category: 'MAINTENANCE',
          title: `Yêu cầu sửa chữa: Phòng ${m.roomNumber || 'P101'}`,
          message: `${m.reporterName ? `${m.reporterName}: ` : ''}${m.issueDescription} (${m.priority === 'URGENT' ? 'Khẩn cấp' : m.priority === 'HIGH' ? 'Ưu tiên cao' : 'Bình thường'})`,
          timestamp: 'Chờ tiếp nhận',
          route: '/admin/maintenance',
          isUnread: !readNotifIds.includes(`maint-pending-${m.id}`),
          priority: m.priority === 'URGENT' ? 'URGENT' : 'HIGH',
        });
      } else if (m.status === 'IN_PROGRESS') {
        list.push({
          id: `maint-prog-${m.id}`,
          category: 'MAINTENANCE',
          title: `Đang xử lý: Phòng ${m.roomNumber || 'P101'}`,
          message: `Kỹ thuật viên đang xử lý: ${m.issueDescription}`,
          timestamp: 'Đang xử lý',
          route: '/admin/maintenance',
          isUnread: !readNotifIds.includes(`maint-prog-${m.id}`),
          priority: 'NORMAL',
        });
      }
    });

    // 2. Yêu cầu đặt phòng giữ chỗ trực tuyến từ khách hàng (Bookings)
    bookings.forEach((b) => {
      if (b.status === 'PENDING') {
        list.push({
          id: `booking-pending-${b.id}`,
          category: 'BOOKING',
          title: `Yêu cầu giữ chỗ mới: ${b.customerName}`,
          message: `Cọc ${formatCurrency(b.depositAmount)} • Phòng ${b.roomNumber || 'chọn sau'} • SĐT: ${b.customerPhone}`,
          timestamp: 'Chờ xác nhận',
          route: '/admin/bookings',
          isUnread: !readNotifIds.includes(`booking-pending-${b.id}`),
          priority: 'HIGH',
        });
      } else if (b.status === 'CONFIRMED') {
        list.push({
          id: `booking-confirmed-${b.id}`,
          category: 'BOOKING',
          title: `Giữ chỗ đã cọc: ${b.customerName}`,
          message: `Mã ${b.bookingCode} đã xác nhận cọc, sẵn sàng chuyển thành Hợp đồng thuê`,
          timestamp: 'Sẵn sàng lập HĐ',
          route: '/admin/bookings',
          isUnread: !readNotifIds.includes(`booking-confirmed-${b.id}`),
          priority: 'NORMAL',
        });
      }
    });

    // 3. Yêu cầu khai báo tạm trú & thành viên ở cùng từ cư dân (Roommates)
    tenants.forEach((t) => {
      (t.roommates || []).forEach((rm) => {
        const apt = aptMap.get(rm.apartmentId) || apartments.find((a) => a.roomNumber === t.currentRoomNumber);
        const roomName = apt?.roomNumber || t.currentRoomNumber || `P${rm.apartmentId}`;
        list.push({
          id: `roommate-reg-${rm.id}`,
          category: 'RESIDENCE',
          title: `Khai báo tạm trú: ${rm.fullName}`,
          message: `Căn hộ ${roomName} (${t.fullName}) • CCCD: ${rm.citizenId} • QH: ${rm.relationship || 'Người ở cùng'}`,
          timestamp: 'Đã khai báo',
          route: '/admin/tenants',
          isUnread: !readNotifIds.includes(`roommate-reg-${rm.id}`),
          priority: 'HIGH',
        });
      });
    });

    // 4. Hợp đồng chờ duyệt ký, yêu cầu gia hạn, hợp đồng sắp hết hạn (Contracts)
    contracts.forEach((c) => {
      const apt = aptMap.get(c.apartmentId);
      const tnt = tenantMap.get(c.tenantId);
      const roomNum = apt?.roomNumber || c.roomNumber || `P${c.apartmentId}`;
      const tenantName = tnt?.fullName || c.tenantName;
      const tenantDisplay = tenantName ? ` (${tenantName})` : '';

      if (c.status === 'DRAFT') {
        list.push({
          id: `contract-draft-${c.id}`,
          category: 'CONTRACT',
          title: `Hợp đồng chờ duyệt ký: ${c.contractCode}`,
          message: `Căn hộ ${roomNum}${tenantDisplay} • Giá thuê: ${formatCurrency(c.rentalPrice)}/th`,
          timestamp: 'Cần ký duyệt',
          route: '/admin/contracts',
          isUnread: !readNotifIds.includes(`contract-draft-${c.id}`),
          priority: 'URGENT',
        });
      } else if (c.status === 'ACTIVE' && c.endDate) {
        const end = new Date(c.endDate).getTime();
        const diffDays = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 45 && diffDays >= 0) {
          list.push({
            id: `contract-exp-${c.id}`,
            category: 'CONTRACT',
            title: `Hợp đồng sắp hết hạn: ${c.contractCode}`,
            message: `Căn hộ ${roomNum}${tenantDisplay} đáo hạn ngày ${formatDate(c.endDate)} (còn ${diffDays} ngày)`,
            timestamp: `Còn ${diffDays} ngày`,
            route: '/admin/contracts',
            isUnread: !readNotifIds.includes(`contract-exp-${c.id}`),
            priority: 'HIGH',
          });
        }
      }
    });

    // 5. Khoản thu quá hạn cần thu / xử lý (Finance)
    receivables.forEach((r) => {
      if (r.status === 'OVERDUE') {
        const apt = aptMap.get(r.apartmentId);
        const roomNum = apt?.roomNumber || r.roomNumber || `P${r.apartmentId || ''}`;
        const debtAmt = r.remainingDebt || (r.totalAmount - r.paidAmount);
        list.push({
          id: `rec-overdue-${r.id}`,
          category: 'FINANCE',
          title: `Khoản nợ quá hạn: Phòng ${roomNum}`,
          message: `Hóa đơn T${r.billingMonth}/${r.billingYear} quá hạn • Còn nợ: ${formatCurrency(debtAmt)}`,
          timestamp: 'Quá hạn',
          route: '/admin/finance',
          isUnread: !readNotifIds.includes(`rec-overdue-${r.id}`),
          priority: 'HIGH',
        });
      }
    });

    return list;
  }, [contracts, bookings, maintenanceRequests, tenants, apartments, receivables, readNotifIds]);

  const filteredNotifications = useMemo(() => {
    if (activeNotifTab === 'ALL') return allNotifications;
    return allNotifications.filter((n) => n.category === activeNotifTab);
  }, [allNotifications, activeNotifTab]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => n.isUnread).length;
  }, [allNotifications]);

  const handleMarkAllAsRead = () => {
    setReadNotifIds(allNotifications.map((n) => n.id));
    toast.success('Đã đọc thông báo', 'Tất cả thông báo đã được đánh dấu là đã đọc');
  };

  const handleNotificationClick = (notif: HeaderNotification) => {
    if (!readNotifIds.includes(notif.id)) {
      setReadNotifIds((prev) => [...prev, notif.id]);
    }
    setShowNotifications(false);
    navigate(notif.route);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Mở menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Role Tag */}
        {user?.roleCode === 'ACCOUNTANT' ? (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/90 rounded-full text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Phân Hệ Kế Toán & Thu Phí</span>
          </div>
        ) : user?.roleCode === 'STAFF' ? (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 rounded-full text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Ban Quản Lý Tòa Nhà</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/90 rounded-full text-xs font-bold text-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Cổng Quản Trị Hệ Thống</span>
          </div>
        )}

        {/* Notification Bell with Dynamic Counter */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            aria-label="Thông báo"
            title={`${unreadCount} thông báo mới`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2">
              {/* Header */}
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Thông báo hệ thống</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-200/80">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Đã đọc tất cả</span>
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="px-3 pt-2.5 pb-1 flex items-center gap-1 overflow-x-auto text-[11px] no-scrollbar">
                {[
                  { id: 'ALL', label: 'Tất cả', count: allNotifications.length },
                  { id: 'MAINTENANCE', label: 'Bảo trì', count: allNotifications.filter((n) => n.category === 'MAINTENANCE').length },
                  { id: 'BOOKING', label: 'Giữ chỗ', count: allNotifications.filter((n) => n.category === 'BOOKING').length },
                  { id: 'RESIDENCE', label: 'Tạm trú', count: allNotifications.filter((n) => n.category === 'RESIDENCE').length },
                  { id: 'CONTRACT', label: 'Hợp đồng', count: allNotifications.filter((n) => n.category === 'CONTRACT').length },
                  { id: 'FINANCE', label: 'Công nợ', count: allNotifications.filter((n) => n.category === 'FINANCE').length },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveNotifTab(t.id as any)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                      activeNotifTab === t.id
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`text-[10px] px-1 rounded-full ${
                      activeNotifTab === t.id ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Notification List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 mt-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Không có thông báo mới nào
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        n.isUnread ? 'bg-blue-50/25' : ''
                      }`}
                    >
                      {/* Icon category */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.category === 'CONTRACT'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200/80'
                          : n.category === 'BOOKING'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                          : n.category === 'RESIDENCE'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200/80'
                          : n.category === 'FINANCE'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200/80'
                          : 'bg-rose-50 text-rose-600 border border-rose-200/80'
                      }`}>
                        {n.category === 'CONTRACT' ? (
                          <FileText className="w-4 h-4" />
                        ) : n.category === 'BOOKING' ? (
                          <Calendar className="w-4 h-4" />
                        ) : n.category === 'RESIDENCE' ? (
                          <Users className="w-4 h-4" />
                        ) : n.category === 'FINANCE' ? (
                          <Receipt className="w-4 h-4" />
                        ) : (
                          <Wrench className="w-4 h-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className={`text-xs line-clamp-1 ${n.isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>

                      {/* Unread indicator dot */}
                      {n.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Quick Link */}
              <div className="px-3 pt-2.5 mt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  to="/admin/maintenance"
                  onClick={() => setShowNotifications(false)}
                  className="text-rose-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Bảo trì</span>
                </Link>
                <Link
                  to="/admin/contracts"
                  onClick={() => setShowNotifications(false)}
                  className="text-brand-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Hợp đồng</span>
                </Link>
                <Link
                  to="/admin/bookings"
                  onClick={() => setShowNotifications(false)}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Giữ chỗ →</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80';
              }}
              alt={user?.fullName}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-900 line-clamp-1">{user?.fullName}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {user?.roleCode === 'ACCOUNTANT'
                  ? 'Kế toán trưởng'
                  : user?.roleCode === 'ADMIN'
                  ? 'Quản trị viên'
                  : user?.roleCode === 'STAFF'
                  ? 'Ban quản lý'
                  : user?.roleCode}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{user?.fullName}</div>
                <div className="text-[11px] text-slate-500">{user?.email}</div>
              </div>

              {/* Portal navigation links */}
              <div className="p-1">
                <Link
                  to="/tenant-portal"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <Building2 className="w-4 h-4 text-brand-600" />
                  <span>Cổng Cư Dân (Resident Hub)</span>
                </Link>

                <Link
                  to="/explore"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl"
                >
                  <Search className="w-4 h-4 text-emerald-600" />
                  <span>Khám Phá Căn Hộ (Guest)</span>
                </Link>
              </div>

              {/* Demo Account Switcher inside dropdown menu (compact & out of the main header) */}
              <div className="border-t border-slate-100 p-2">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  Đổi vai trò tài khoản
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  {[
                    { code: 'ADMIN' as UserRole, label: 'Quản trị' },
                    { code: 'ACCOUNTANT' as UserRole, label: 'Kế toán' },
                    { code: 'STAFF' as UserRole, label: 'Nhân viên' },
                    { code: 'TENANT' as UserRole, label: 'Cư dân' },
                  ].map((r) => (
                    <button
                      key={r.code}
                      onClick={() => {
                        switchRole(r.code);
                        setShowUserMenu(false);
                        toast.info('Chuyển vai trò', `Đã chuyển sang tài khoản ${r.label}`);
                        if (r.code === 'TENANT') {
                          window.location.href = '/tenant-portal';
                        } else if (r.code === 'ACCOUNTANT') {
                          window.location.href = '/admin/finance';
                        } else if (r.code === 'STAFF') {
                          window.location.href = '/admin/buildings';
                        } else {
                          window.location.href = '/admin/dashboard';
                        }
                      }}
                      className={`text-left px-2 py-1 rounded-lg transition-colors ${
                        user?.roleCode === r.code
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 p-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng Xuất</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
