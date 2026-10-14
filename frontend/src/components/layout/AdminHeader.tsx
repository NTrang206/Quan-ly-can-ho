import React, { useState, useMemo } from 'react';
import {
  Bell,
  Menu,
  LogOut,
  ChevronDown,
  FileText,
  Calendar,
  Wrench,
  CheckCheck,
  ArrowRight,
  Sparkles,
  Users,
  Receipt,
  UserPlus,
  X,
  AlertTriangle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/useRedux';
import { toggleSidebar } from '../../stores/globalSlice';
import { useToast } from '../../hooks/useToast';
import { Link, useNavigate } from 'react-router-dom';
import { useGetContractsQuery } from '../../modules/contracts/services/contractApi';
import { useGetBookingsQuery } from '../../modules/bookings/services/bookingApi';
import { useGetMaintenanceRequestsQuery } from '../../modules/maintenance/services/maintenanceApi';
import { useGetTenantsQuery } from '../../modules/tenants/services/tenantApi';
import { useGetApartmentsQuery } from '../../modules/buildings/services/buildingApi';
import { useGetReceivablesQuery } from '../../modules/finance/services/financeApi';
import { useGetSystemAlertsQuery } from '../../modules/alerts_ai/services/alertApi';
import { formatCurrency, formatDate, formatTimeAgo } from '../../utils/formatters';

interface HeaderNotification {
  id: string;
  category: 'ALERT' | 'CONTRACT' | 'BOOKING' | 'MAINTENANCE' | 'RESIDENCE' | 'FINANCE';
  title: string;
  message: string;
  statusBadge: string;
  timeAgo: string;
  rawDate: number;
  route: string;
  isUnread: boolean;
  priority?: 'HIGH' | 'NORMAL' | 'URGENT';
  isError?: boolean;
}

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeNotifTab, setActiveNotifTab] = useState<'ALL' | 'ALERT' | 'MAINTENANCE' | 'BOOKING' | 'RESIDENCE' | 'CONTRACT' | 'FINANCE'>('ALL');
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  // Fetch live operational data with polling
  const { data: contracts = [] } = useGetContractsQuery({});
  const { data: bookings = [] } = useGetBookingsQuery({}, { pollingInterval: 3000 });
  const { data: maintenanceRequests = [] } = useGetMaintenanceRequestsQuery({});
  const { data: tenants = [] } = useGetTenantsQuery({});
  const { data: apartments = [] } = useGetApartmentsQuery({});
  const { data: receivables = [] } = useGetReceivablesQuery({});
  const { data: systemAlerts = [] } = useGetSystemAlertsQuery({}, { pollingInterval: 5000 });

  const pendingBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'PENDING').sort((a, b) => b.id - a.id);
  }, [bookings]);


  // Generate real business notifications
  const allNotifications = useMemo(() => {
    const list: HeaderNotification[] = [];
    const tenantMap = new Map(tenants.map((t) => [t.id, t]));
    const aptMap = new Map(apartments.map((a) => [a.id, a]));

    // 1. CẢNH BÁO LỖI HỆ THỐNG (System Alerts: Nợ quá hạn, HĐ quá hạn/vi phạm, cảnh báo rủi ro) - LỖI ĐỨNG ĐẦU
    systemAlerts.forEach((a) => {
      const isOverdue = a.alertType === 'OVERDUE_DEBT';
      const isExpired = a.alertType === 'EXPIRED_CONTRACT';
      const roomDisplay = a.roomNumber ? `Phòng ${a.roomNumber}` : 'Hệ thống';
      const targetDisplay = a.targetName ? ` - ${a.targetName}` : '';
      const rawTime = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();

      list.push({
        id: `sys-alert-${a.id}`,
        category: 'ALERT',
        title: isOverdue
          ? `🚨 Cảnh báo nợ quá hạn: ${roomDisplay}${targetDisplay}`
          : isExpired
          ? `⚠️ Hợp đồng hết hạn: ${roomDisplay}${targetDisplay}`
          : `🚨 Cảnh báo hệ thống: ${roomDisplay}${targetDisplay}`,
        message:
          a.aiDraftContent?.subject ||
          a.aiDraftContent?.body ||
          `Hệ thống ghi nhận sự cố/cảnh báo ${a.alertType} cần ban quản trị kiểm tra xử lý`,
        statusBadge: isOverdue ? 'Nợ quá hạn' : isExpired ? 'HĐ hết hạn' : 'Cảnh báo lỗi',
        timeAgo: formatTimeAgo(a.createdAt),
        rawDate: rawTime,
        route: '/admin/alerts',
        isUnread: !readNotifIds.includes(`sys-alert-${a.id}`),
        priority: 'URGENT',
        isError: true,
      });
    });

    // 2. Yêu cầu sự cố & sửa chữa từ cư dân (Maintenance Requests)
    maintenanceRequests.forEach((m) => {
      const isUrgent = m.priority === 'URGENT' || m.issueDescription?.toLowerCase().includes('khẩn') || m.issueDescription?.toLowerCase().includes('cháy') || m.issueDescription?.toLowerCase().includes('chập');
      const timeStr = formatTimeAgo(m.createdAt);
      const rawTime = m.createdAt ? new Date(m.createdAt).getTime() : Date.now();

      if (m.status === 'PENDING') {
        list.push({
          id: `maint-pending-${m.id}`,
          category: 'MAINTENANCE',
          title: isUrgent
            ? `🚨 Sự cố khẩn cấp: Phòng ${m.roomNumber || 'P101'}`
            : `Yêu cầu sửa chữa: Phòng ${m.roomNumber || 'P101'}`,
          message: `${m.reporterName ? `${m.reporterName}: ` : ''}${m.issueDescription} (${isUrgent ? 'Khẩn cấp' : m.priority === 'HIGH' ? 'Ưu tiên cao' : 'Bình thường'})`,
          statusBadge: isUrgent ? 'Khẩn cấp' : 'Chờ tiếp nhận',
          timeAgo: timeStr,
          rawDate: rawTime,
          route: '/admin/maintenance',
          isUnread: !readNotifIds.includes(`maint-pending-${m.id}`),
          priority: isUrgent ? 'URGENT' : 'HIGH',
          isError: isUrgent,
        });
      } else if (m.status === 'IN_PROGRESS') {
        list.push({
          id: `maint-prog-${m.id}`,
          category: 'MAINTENANCE',
          title: `Đang xử lý: Phòng ${m.roomNumber || 'P101'}`,
          message: `Kỹ thuật viên đang xử lý: ${m.issueDescription}`,
          statusBadge: 'Đang xử lý',
          timeAgo: timeStr,
          rawDate: rawTime,
          route: '/admin/maintenance',
          isUnread: !readNotifIds.includes(`maint-prog-${m.id}`),
          priority: isUrgent ? 'URGENT' : 'NORMAL',
          isError: isUrgent,
        });
      }
    });

    // 3. Khoản thu quá hạn cần thu / xử lý (Finance Overdue) - LỖI ĐỨNG ĐẦU
    receivables.forEach((r) => {
      if (r.status === 'OVERDUE') {
        const apt = aptMap.get(r.apartmentId);
        const roomNum = apt?.roomNumber || r.roomNumber || `P${r.apartmentId || ''}`;
        const debtAmt = r.remainingDebt || (r.totalAmount - r.paidAmount);
        const timeStr = formatTimeAgo(r.dueDate || r.createdAt);
        const rawTime = (r.dueDate || r.createdAt) ? new Date(r.dueDate || r.createdAt).getTime() : Date.now();

        list.push({
          id: `rec-overdue-${r.id}`,
          category: 'FINANCE',
          title: `⚠️ Khoản nợ quá hạn: Phòng ${roomNum}`,
          message: `Hóa đơn T${r.billingMonth}/${r.billingYear} quá hạn • Còn nợ: ${formatCurrency(debtAmt)}`,
          statusBadge: 'Quá hạn nộp',
          timeAgo: timeStr,
          rawDate: rawTime,
          route: '/admin/finance',
          isUnread: !readNotifIds.includes(`rec-overdue-${r.id}`),
          priority: 'URGENT',
          isError: true,
        });
      }
    });

    // 4. Yêu cầu đặt phòng giữ chỗ trực tuyến từ khách hàng (Bookings)
    bookings.forEach((b) => {
      const timeStr = formatTimeAgo(b.createdAt);
      const rawTime = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();

      if (b.status === 'PENDING') {
        list.push({
          id: `booking-pending-${b.id}`,
          category: 'BOOKING',
          title: `🔔 Đặt lịch giữ chỗ mới: ${b.customerName}`,
          message: `Căn ${b.roomNumber || 'chọn sau'} • SĐT: ${b.customerPhone} • Cọc: ${b.depositAmount > 0 ? formatCurrency(b.depositAmount) : 'Chưa cọc'}`,
          statusBadge: 'Chờ xác nhận',
          timeAgo: timeStr,
          rawDate: rawTime,
          route: '/admin/bookings',
          isUnread: !readNotifIds.includes(`booking-pending-${b.id}`),
          priority: 'HIGH',
          isError: false,
        });
      } else if (b.status === 'CONFIRMED') {
        list.push({
          id: `booking-confirmed-${b.id}`,
          category: 'BOOKING',
          title: `Giữ chỗ đã cọc: ${b.customerName}`,
          message: `Mã ${b.bookingCode} đã xác nhận cọc, sẵn sàng chuyển thành Hợp đồng thuê`,
          statusBadge: 'Đã giữ chỗ',
          timeAgo: timeStr,
          rawDate: rawTime,
          route: '/admin/bookings',
          isUnread: !readNotifIds.includes(`booking-confirmed-${b.id}`),
          priority: 'NORMAL',
          isError: false,
        });
      }
    });

    // 5. Yêu cầu khai báo tạm trú & thành viên ở cùng từ cư dân (Roommates)
    tenants.forEach((t) => {
      (t.roommates || []).forEach((rm) => {
        const apt = aptMap.get(rm.apartmentId) || apartments.find((a) => a.roomNumber === t.currentRoomNumber);
        const roomName = apt?.roomNumber || t.currentRoomNumber || `P${rm.apartmentId}`;
        const timeStr = formatTimeAgo(rm.registeredDate || t.createdAt);
        const rawTime = (rm.registeredDate || t.createdAt) ? new Date(rm.registeredDate || t.createdAt).getTime() : Date.now();

        list.push({
          id: `roommate-reg-${rm.id}`,
          category: 'RESIDENCE',
          title: `Khai báo tạm trú: ${rm.fullName}`,
          message: `Căn hộ ${roomName} (${t.fullName}) • CCCD: ${rm.citizenId} • QH: ${rm.relationship || 'Người ở cùng'}`,
          statusBadge: 'Đã khai báo',
          timeAgo: timeStr,
          rawDate: rawTime,
          route: '/admin/tenants',
          isUnread: !readNotifIds.includes(`roommate-reg-${rm.id}`),
          priority: 'NORMAL',
          isError: false,
        });
      });
    });

    // 6. Hợp đồng chờ duyệt ký, yêu cầu gia hạn, hợp đồng sắp hết hạn (Contracts)
    contracts.forEach((c) => {
      const apt = aptMap.get(c.apartmentId);
      const tnt = tenantMap.get(c.tenantId);
      const roomNum = apt?.roomNumber || c.roomNumber || `P${c.apartmentId}`;
      const tenantName = tnt?.fullName || c.tenantName;
      const tenantDisplay = tenantName ? ` (${tenantName})` : '';
      const timeStr = formatTimeAgo(c.createdAt);
      const rawTime = c.createdAt ? new Date(c.createdAt).getTime() : Date.now();

      if (c.status === 'DRAFT') {
        list.push({
          id: `contract-draft-${c.id}`,
          category: 'CONTRACT',
          title: `Hợp đồng chờ duyệt ký: ${c.contractCode}`,
          message: `Căn hộ ${roomNum}${tenantDisplay} • Giá thuê: ${formatCurrency(c.rentalPrice)}/th`,
          statusBadge: 'Chờ ký duyệt',
          timeAgo: timeStr,
          rawDate: rawTime,
          route: '/admin/contracts',
          isUnread: !readNotifIds.includes(`contract-draft-${c.id}`),
          priority: 'HIGH',
          isError: false,
        });
      } else if (c.status === 'ACTIVE' && c.endDate) {
        const end = new Date(c.endDate).getTime();
        const diffDays = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 45 && diffDays >= 0) {
          const isUrgent = diffDays <= 7;
          list.push({
            id: `contract-exp-${c.id}`,
            category: 'CONTRACT',
            title: `${isUrgent ? '⚠️' : '🔔'} Hợp đồng sắp hết hạn: ${c.contractCode}`,
            message: `Căn hộ ${roomNum}${tenantDisplay} đáo hạn ngày ${formatDate(c.endDate)} (còn ${diffDays} ngày)`,
            statusBadge: `Còn ${diffDays} ngày`,
            timeAgo: timeStr,
            rawDate: rawTime,
            route: '/admin/contracts',
            isUnread: !readNotifIds.includes(`contract-exp-${c.id}`),
            priority: isUrgent ? 'URGENT' : 'HIGH',
            isError: isUrgent,
          });
        }
      }
    });

    // SẮP XẾP:
    // 1. TẤT CẢ CÁC LỖI / SỰ CỐ KHẨN CẤP / CẢNH BÁO BẮT BUỘC ĐỨNG ĐẦU TIÊN
    // 2. Độ ưu tiên URGENT > HIGH > NORMAL
    // 3. Thông báo chưa đọc đứng trước
    // 4. Thời gian mới nhất (Newest time) đứng trước
    return list.sort((a, b) => {
      if (a.isError && !b.isError) return -1;
      if (!a.isError && b.isError) return 1;

      const pRank = { URGENT: 3, HIGH: 2, NORMAL: 1 };
      const pA = pRank[a.priority || 'NORMAL'] || 1;
      const pB = pRank[b.priority || 'NORMAL'] || 1;
      if (pA !== pB) return pB - pA;

      if (a.isUnread && !b.isUnread) return -1;
      if (!a.isUnread && b.isUnread) return 1;

      return b.rawDate - a.rawDate;
    });
  }, [contracts, bookings, maintenanceRequests, tenants, apartments, receivables, systemAlerts, readNotifIds]);

  const filteredNotifications = useMemo(() => {
    if (activeNotifTab === 'ALL') return allNotifications;
    if (activeNotifTab === 'ALERT') return allNotifications.filter((n) => n.isError || n.category === 'ALERT');
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
    <>


      <header className="h-16 bg-white border-b border-slate-200/90 px-5 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left: Mobile Sidebar toggle */}
        <div className="flex items-center gap-3.5">
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
              className={`p-2 rounded-xl relative transition-colors ${
                unreadCount > 0
                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Thông báo"
              title={`${unreadCount} thông báo mới`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
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
                  { id: 'ALERT', label: '🚨 Lỗi & Cảnh báo', count: allNotifications.filter((n) => n.isError || n.category === 'ALERT').length },
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
                        ? t.id === 'ALERT'
                          ? 'bg-rose-600 text-white font-semibold shadow-xs'
                          : 'bg-slate-900 text-white font-semibold'
                        : t.id === 'ALERT' && t.count > 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className={`text-[10px] px-1 rounded-full ${
                      activeNotifTab === t.id ? 'bg-black/20 text-white' : t.id === 'ALERT' && t.count > 0 ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-600'
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
                        n.isError
                          ? 'bg-rose-50/50 border-l-4 border-l-rose-500 hover:bg-rose-50/80'
                          : n.isUnread
                          ? 'bg-blue-50/30'
                          : ''
                      }`}
                    >
                      {/* Icon category */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        n.isError || n.category === 'ALERT'
                          ? 'bg-rose-100 text-rose-600 border border-rose-300 shadow-2xs'
                          : n.category === 'CONTRACT'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200/80'
                          : n.category === 'BOOKING'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                          : n.category === 'RESIDENCE'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200/80'
                          : n.category === 'FINANCE'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200/80'
                          : 'bg-rose-50 text-rose-600 border border-rose-200/80'
                      }`}>
                        {n.isError || n.category === 'ALERT' ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : n.category === 'CONTRACT' ? (
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
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {n.isError && (
                              <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded shadow-2xs shrink-0 tracking-wide uppercase">
                                Cảnh báo lỗi
                              </span>
                            )}
                            <span className={`text-xs line-clamp-1 ${n.isError ? 'font-extrabold text-rose-900' : n.isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {n.title}
                            </span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                            n.isError
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : n.category === 'BOOKING'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : n.category === 'MAINTENANCE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {n.statusBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.message}</p>
                        
                        {/* Time elapsed / Khoảng thời gian */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1.5">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{n.timeAgo}</span>
                          </div>
                          {n.isError && (
                            <span className="text-rose-600 font-bold text-[10px] flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>Ưu tiên xử lý</span>
                            </span>
                          )}
                        </div>
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
                  to="/admin/alerts"
                  onClick={() => setShowNotifications(false)}
                  className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Cảnh báo lỗi</span>
                </Link>
                <Link
                  to="/admin/maintenance"
                  onClick={() => setShowNotifications(false)}
                  className="text-amber-600 font-semibold hover:underline flex items-center gap-1"
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

              <div className="p-1">
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
  </>
);
};
