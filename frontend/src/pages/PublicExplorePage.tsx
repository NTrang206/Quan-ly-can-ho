import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, SlidersHorizontal, Sparkles, BedDouble, 
  Maximize2, MapPin, Calendar, CheckCircle2, 
  Phone, Mail, ArrowRight, X, Heart, Bookmark, ChevronDown, 
  Camera, ShieldCheck, Flame, Tag, Clock, Share2, PlusCircle,
  Headphones, Send, Globe, LogOut,
  Lock, LogIn, UserCheck, RotateCcw, RefreshCw, AlertCircle
} from 'lucide-react';
import { useGetBuildingsQuery, useGetApartmentsQuery } from '../modules/buildings/services/buildingApi';
import { useCreateBookingMutation } from '../modules/bookings/services/bookingApi';
import { formatCurrency } from '../utils/formatters';
import { IApartment, IBuilding } from '../types/entities';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { DwellLogo } from '../components/common/DwellLogo';
import { FooterInfoModal, FooterModalKey } from '../components/common/FooterInfoModal';
import { PropertyVideoShowcase } from '../components/common/PropertyVideoShowcase';

export const PublicExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();
  const { isAuthenticated, isTenant, isAdmin, isStaff, switchRole, user, logout } = useAuth();
  
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { 
    data: apartments = [], 
    isLoading: isApartmentsLoading, 
    isError: isApartmentsError, 
    refetch: refetchApartments 
  } = useGetApartmentsQuery({ status: 'AVAILABLE' });
  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC' | 'AREA_DESC'>('DEFAULT');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isSavedSearch, setIsSavedSearch] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [footerModalKey, setFooterModalKey] = useState<FooterModalKey | null>(null);

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showSuccessToast(`Cảm ơn bạn! Đã đăng ký nhận tin căn hộ mới nhất qua email ${newsletterEmail}.`);
    setNewsletterEmail('');
  };

  // Booking Modal & Auth Required State
  const [bookingModalApartment, setBookingModalApartment] = useState<IApartment | null>(null);
  const [authRequiredModalApartment, setAuthRequiredModalApartment] = useState<IApartment | null>(null);
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    viewingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    viewingTime: '10:00',
    notes: 'Tôi muốn đặt lịch xem và đăng ký thuê căn hộ này.'
  });

  const handleInitiateBooking = (apt: IApartment) => {
    if (!isAuthenticated) {
      setAuthRequiredModalApartment(apt);
      return;
    }
    setBookingForm({
      guestName: user?.fullName || '',
      guestPhone: user?.phone || '',
      guestEmail: user?.email || '',
      viewingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      viewingTime: '10:00',
      notes: 'Tôi muốn đặt lịch xem và đăng ký thuê căn hộ này.'
    });
    setBookingModalApartment(apt);
  };

  const handleQuickLoginAsTenant = async () => {
    try {
      await switchRole('TENANT');
      showSuccessToast('Đã đăng nhập thành công với vai trò Khách thuê / Cư dân!');
      const apt = authRequiredModalApartment;
      setAuthRequiredModalApartment(null);
      if (apt) {
        setBookingForm({
          guestName: 'Nguyễn Văn An',
          guestPhone: '0912888999',
          guestEmail: 'tenant@dwell.vn',
          viewingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          viewingTime: '10:00',
          notes: 'Tôi muốn đặt lịch xem và đăng ký thuê căn hộ này.'
        });
        setBookingModalApartment(apt);
      }
    } catch {
      navigate('/login?redirect=/explore');
    }
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(id);
      if (!isFav) {
        showSuccessToast('Đã lưu căn hộ vào danh sách yêu thích!');
      }
      return isFav ? prev.filter(item => item !== id) : [...prev, id];
    });
  };

  const handleSaveSearch = () => {
    setIsSavedSearch(!isSavedSearch);
    if (!isSavedSearch) {
      showSuccessToast('Đã lưu tiêu chí tìm kiếm! Hệ thống sẽ thông báo khi có căn mới.');
    } else {
      showSuccessToast('Đã hủy lưu tìm kiếm.');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalApartment) return;

    if (!bookingForm.guestName.trim() || !bookingForm.guestPhone.trim()) {
      showErrorToast('Vui lòng điền họ tên và số điện thoại liên hệ!');
      return;
    }

    try {
      await createBooking({
        apartmentId: bookingModalApartment.id,
        customerName: bookingForm.guestName,
        customerPhone: bookingForm.guestPhone,
        customerEmail: bookingForm.guestEmail,
        roomNumber: bookingModalApartment.roomNumber,
        buildingName: bookingModalApartment.buildingName,
        monthlyPrice: bookingModalApartment.price,
        depositAmount: bookingModalApartment.depositDefault,
        checkInDate: bookingForm.viewingDate,
        notes: `[Khung giờ xem: ${bookingForm.viewingTime}] ${bookingForm.notes}`
      }).unwrap();

      showSuccessToast(`Đã gửi yêu cầu đặt lịch xem căn ${bookingModalApartment.roomNumber} thành công! Nhân viên tư vấn Dwell sẽ liên hệ trong 15 phút.`);
      setBookingModalApartment(null);
      setBookingForm({
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        viewingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        viewingTime: '10:00',
        notes: 'Tôi muốn xem thực tế căn hộ này vào thời gian trên.'
      });
    } catch {
      showErrorToast('Gửi yêu cầu thất bại. Vui lòng thử lại!');
    }
  };

  // Filter logic - Chỉ cho phép căn hộ còn trống (AVAILABLE) xuất hiện ở phía khách vãng lai
  const filteredApartments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return apartments.filter(apt => {
      // Chỉ hiển thị căn hộ còn trống
      if (apt.status !== 'AVAILABLE') return false;

      const matchesSearch = !term ||
                            (apt.roomNumber || '').toLowerCase().includes(term) ||
                            (apt.description || '').toLowerCase().includes(term) ||
                            (apt.buildingName || '').toLowerCase().includes(term);
      const matchesBuilding = selectedBuildingId === 'ALL' || (apt.buildingId != null && apt.buildingId.toString() === selectedBuildingId);
      const matchesBedrooms = selectedBedrooms === 'ALL' || (apt.bedrooms != null && apt.bedrooms.toString() === selectedBedrooms);
      
      let matchesPrice = true;
      if (selectedPriceRange === 'UNDER_10M') matchesPrice = apt.price < 10000000;
      else if (selectedPriceRange === '10M_15M') matchesPrice = apt.price >= 10000000 && apt.price <= 15000000;
      else if (selectedPriceRange === '15M_20M') matchesPrice = apt.price > 15000000 && apt.price <= 20000000;
      else if (selectedPriceRange === 'OVER_20M') matchesPrice = apt.price > 20000000;

      return Boolean(matchesSearch && matchesBuilding && matchesBedrooms && matchesPrice);
    });
  }, [apartments, searchTerm, selectedBuildingId, selectedBedrooms, selectedPriceRange]);

  // Sort logic
  const sortedApartments = useMemo(() => {
    const list = [...filteredApartments];
    if (sortBy === 'PRICE_ASC') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'PRICE_DESC') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'AREA_DESC') return list.sort((a, b) => b.areaSqm - a.areaSqm);
    return list.sort((a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || '', undefined, { numeric: true }));
  }, [filteredApartments, sortBy]);

  // Hiển thị toàn bộ căn hộ, kéo cuộn từ trên xuống dưới (không phân trang)
  const displayedApartments = sortedApartments;

  const getBuildingName = (buildingId: number) => {
    const b = buildings.find(item => item.id === buildingId);
    return b ? b.name : 'Dwell';
  };

  const getBuildingAddress = (buildingId: number) => {
    const b = buildings.find(item => item.id === buildingId);
    return b ? b.address : 'Số 16 Phạm Hùng, Mỹ Đình 2, Nam Từ Liêm, Hà Nội';
  };

  const formatPriceVND = (price: number) => {
    if (price >= 1000000) {
      const millions = price / 1000000;
      return `${millions % 1 === 0 ? millions : millions.toFixed(1)} triệu/tháng`;
    }
    return `${price.toLocaleString('vi-VN')} đ/tháng`;
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9] text-slate-800 font-sans">
      {/* 1. Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <DwellLogo badge="Hệ Thống Thuê Căn Hộ" badgeVariant="sky" size="md" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-900 leading-tight">{user.fullName}</span>
                  <span className="text-[11px] text-brand-600 font-semibold">
                    {user.roleCode === 'TENANT'
                      ? 'Cư dân căn hộ'
                      : user.roleCode === 'ADMIN'
                      ? 'Quản trị viên'
                      : user.roleCode === 'ACCOUNTANT'
                      ? 'Kế toán trưởng'
                      : 'Ban quản lý'}
                  </span>
                </div>
                {user.roleCode === 'TENANT' ? (
                  <button
                    onClick={() => navigate('/tenant-portal')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
                  >
                    <span>Vào Cổng Cư Dân</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(user.roleCode === 'ACCOUNTANT' ? '/admin/finance' : '/admin/dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all"
                  >
                    <span>Vào Quản Trị</span>
                  </button>
                )}
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                  title="Đăng nhập tài khoản hoặc quyền khác"
                >
                  Đổi quyền
                </button>
                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-md transition-all"
                >
                  <span>Đăng Nhập</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Body Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 space-y-3.5">
        {/* ================= THANH TÌM KIẾM & BỘ LỌC TINH GỌN ================= */}
        <section aria-label="Bộ lọc tìm kiếm" className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
          {/* Main Filter Inputs: Search, Bedroom, Price in 1 sleek aligned row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            {/* 1. Từ khóa tìm kiếm */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm số phòng (P.101), tên tòa nhà, địa chỉ..."
                className="w-full text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                  title="Xóa từ khóa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. Cấu trúc phòng ngủ */}
            <div className="md:col-span-3 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-600">
                <BedDouble className="w-4 h-4" />
              </div>
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-8 py-2 font-medium text-slate-700 appearance-none focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 cursor-pointer transition-all"
              >
                <option value="ALL">Tất cả số phòng ngủ</option>
                <option value="1">1 Phòng ngủ (Studio)</option>
                <option value="2">2 Phòng ngủ</option>
                <option value="3">3 Phòng ngủ (Gia đình)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* 3. Khoảng giá thuê */}
            <div className="md:col-span-4 relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-600">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl pl-9 pr-8 py-2 font-medium text-slate-700 appearance-none focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/10 cursor-pointer transition-all"
              >
                <option value="ALL">Tất cả mức giá</option>
                <option value="UNDER_10M">Dưới 10 triệu / tháng</option>
                <option value="10M_15M">Từ 10 – 15 triệu / tháng</option>
                <option value="15M_20M">Từ 15 – 20 triệu / tháng</option>
                <option value="OVER_20M">Trên 20 triệu / tháng</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Dải chọn nhanh, Đếm số lượng căn hộ & Đặt lại bộ lọc */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <BedDouble className="w-3.5 h-3.5 text-brand-600" />
                Chọn nhanh:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: '1', label: '1 PN' },
                  { id: '2', label: '2 PN' },
                  { id: '3', label: '3 PN' },
                ].map((item) => {
                  const isSelected = selectedBedrooms === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedBedrooms(item.id)}
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Results counter & Reset button */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-slate-600 font-medium flex items-center gap-1.5 text-xs">
                {sortedApartments.length > 0 ? (
                  <>
                    <span>Hiển thị tất cả</span>
                    <strong className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md font-bold">
                      {sortedApartments.length}
                    </strong>
                    <span>căn hộ trống cho thuê</span>
                  </>
                ) : (
                  <span className="text-rose-600 font-medium">Không tìm thấy căn hộ trống phù hợp</span>
                )}
              </div>

              {(searchTerm || selectedBedrooms !== 'ALL' || selectedPriceRange !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBuildingId('ALL');
                    setSelectedBedrooms('ALL');
                    setSelectedPriceRange('ALL');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 transition-colors pl-2.5 border-l border-slate-200"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ================= KHU VỰC DANH SÁCH CĂN HỘ ================= */}
        <div className="space-y-3.5 flex flex-col justify-between">

            {/* Apartment Cards */}
            {isApartmentsLoading ? (
              /* Skeleton Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="w-full h-36 bg-slate-200" />
                    <div className="p-3.5 space-y-2.5">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                      <div className="h-6 bg-slate-100 rounded-lg w-full mt-2" />
                      <div className="h-8 bg-slate-200 rounded-xl w-full mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isApartmentsError ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-rose-200 shadow-2xs p-6">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">Không thể kết nối đến máy chủ dữ liệu</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Vui lòng kiểm tra lại dịch vụ backend hoặc bấm nút bên dưới để thử lại.
                </p>
                <button
                  type="button"
                  onClick={() => refetchApartments()}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tải lại dữ liệu</span>
                </button>
              </div>
            ) : sortedApartments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">Không tìm thấy căn hộ phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Vui lòng điều chỉnh lại mức giá hoặc chọn cấu trúc phòng ngủ khác ở bộ lọc phía trên.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBuildingId('ALL');
                    setSelectedBedrooms('ALL');
                    setSelectedPriceRange('ALL');
                  }}
                  className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                {viewMode === 'GRID' ? (
                  /* ================= MODE 1: GRID CĂN HỘ ================= */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedApartments.map((apt) => {
                  const buildingName = apt.buildingName || getBuildingName(apt.buildingId);
                  const address = getBuildingAddress(apt.buildingId);
                  const isAvailable = apt.status === 'AVAILABLE';

                  return (
                    <div
                      key={apt.id}
                      onClick={() => navigate(`/apartments/${apt.id}`)}
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-soft hover:border-brand-400 transition-all flex flex-col group cursor-pointer"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full h-36 relative bg-slate-100 overflow-hidden shrink-0">
                        <img
                          src={apt.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80';
                          }}
                          alt={apt.roomNumber}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />

                        {/* Status Badge: Căn hộ còn trống */}
                        <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 backdrop-blur-xs shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />
                          <span>Còn trống</span>
                        </div>

                        {/* Bottom Photo Count Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 backdrop-blur-xs">
                          <Camera className="w-3 h-3" />
                          <span>{6 + (apt.id % 4)}</span>
                        </div>
                      </div>

                      {/* Content Details Area */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Title */}
                          <h2 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 leading-snug">
                            Căn hộ {apt.roomNumber?.startsWith('P') ? apt.roomNumber : `P${apt.roomNumber}`} - {buildingName}
                          </h2>

                          {/* Location */}
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{address}</span>
                          </div>

                          {/* Specs Row */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold mt-2 py-1 px-2 bg-slate-50 rounded-lg">
                            <span>{apt.areaSqm} m²</span>
                            <span className="text-slate-300">•</span>
                            <span>{apt.bedrooms} PN</span>
                            <span className="text-slate-300">•</span>
                            <span>{apt.bathrooms} WC</span>
                            <span className="text-slate-300">•</span>
                            <span>Tầng {apt.floor}</span>
                          </div>
                        </div>

                        {/* Bottom Row: Price & Actions */}
                        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-sm sm:text-base font-extrabold text-brand-700 leading-tight">
                              {formatPriceVND(apt.price)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Cọc: {formatCurrency(apt.depositDefault)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInitiateBooking(apt);
                            }}
                            className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors shrink-0"
                          >
                            Đặt lịch
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* ================= MODE 2: DANH SÁCH SIÊU GỌN ================= */
              <div className="space-y-2">
                {displayedApartments.map((apt) => {
                  const buildingName = apt.buildingName || getBuildingName(apt.buildingId);
                  const address = getBuildingAddress(apt.buildingId);
                  const isAvailable = apt.status === 'AVAILABLE';

                  return (
                    <div
                      key={apt.id}
                      onClick={() => navigate(`/apartments/${apt.id}`)}
                      className="bg-white border border-slate-200/90 rounded-xl p-2.5 hover:shadow-soft hover:border-brand-300 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      {/* Left: Image thumbnail */}
                      <div className="w-24 sm:w-28 h-20 shrink-0 relative rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={apt.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80';
                          }}
                          alt={apt.roomNumber}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                        {/* Status Badge: Căn hộ còn trống */}
                        <div className="absolute top-1 left-1 bg-emerald-600/90 text-white text-[9px] px-1.5 py-0.2 rounded-full font-semibold flex items-center gap-0.5 backdrop-blur-xs shadow-xs">
                          <span className="w-1 h-1 rounded-full bg-emerald-200 animate-pulse" />
                          <span>Còn trống</span>
                        </div>
                      </div>

                      {/* Middle: Details */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                          {apt.roomNumber?.startsWith('P') ? apt.roomNumber : `P${apt.roomNumber}`} - {buildingName}
                        </h2>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium mt-1">
                          <span>{apt.areaSqm} m²</span>
                          <span>•</span>
                          <span>{apt.bedrooms} PN</span>
                          <span>•</span>
                          <span>{apt.bathrooms} WC</span>
                          <span>•</span>
                          <span>Tầng {apt.floor}</span>
                        </div>
                      </div>

                      {/* Right: Price & Button */}
                      <div className="flex items-center gap-3 shrink-0 text-right">
                        <div>
                          <div className="text-xs sm:text-sm font-extrabold text-brand-700">
                            {formatPriceVND(apt.price)}
                          </div>
                          <div className="text-[10px] text-slate-400 hidden sm:block">
                            Cọc: {formatCurrency(apt.depositDefault)}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInitiateBooking(apt);
                          }}
                          className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                        >
                          Đặt lịch
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </>
            )}

          </div>
        {/* ================= PHẦN HỖ TRỢ CHO CUỐI TRANG ================= */}
      </main>

      {/* 3. Full-Width Video Showcase Section with Dwell Logo */}
      <PropertyVideoShowcase />

      {/* 4. Comprehensive Real-Estate Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 text-slate-700">
        {/* Top Contact Strip */}
        <div className="border-b border-slate-200/80 bg-slate-50/70">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Brand Logo */}
              <div className="md:col-span-4 flex items-center">
                <DwellLogo badge="Living 4.0" badgeVariant="sky" size="md" />
              </div>

              {/* Contact Pill 1: Hotline */}
              <div className="md:col-span-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Hotline tư vấn</div>
                  <a href="tel:19008899" className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors">
                    1900 8899 - 0912 345 678
                  </a>
                </div>
              </div>

              {/* Contact Pill 2: Resident Support */}
              <div className="md:col-span-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Hỗ trợ khách hàng</div>
                  <a href="mailto:trogiup@dwell.vn" className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors">
                    trogiup@dwell.vn
                  </a>
                </div>
              </div>

              {/* Contact Pill 3: Partnerships */}
              <div className="md:col-span-2 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Chăm sóc khách hàng</div>
                  <a href="mailto:hotro@dwell.vn" className="text-sm font-bold text-slate-900 hover:text-[#00a680] transition-colors">
                    hotro@dwell.vn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-xs">
            {/* Column 1: Company Profile (4 cols) */}
            <div className="lg:col-span-4 space-y-3.5">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                CÔNG TY CỔ PHẦN CÔNG NGHỆ BẤT ĐỘNG SẢN DWELL VIỆT NAM
              </h4>

              <div className="flex items-start space-x-2 text-slate-600 leading-relaxed">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Tầng 12, Tòa nhà Dwell, Số 16 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội, Việt Nam
                </span>
              </div>

              <div className="flex items-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>(024) 3562 5939 - (028) 7300 8899</span>
              </div>
            </div>

            {/* Column 2: Guide & Services (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                HƯỚNG DẪN & DỊCH VỤ
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('ABOUT_US')}>Về chúng tôi (Dwell Living)</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('PRICING_FEES')}>Báo giá thuê phòng & chi phí dịch vụ</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('AI_CONTRACT_PROCESS')}>Quy trình ký hợp đồng điện tử AI</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('VIETQR_PAYMENT_GUIDE')}>Hướng dẫn thanh toán VietQR Napas247</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('FAQ_RESIDENTS')}>Câu hỏi thường gặp (FAQ cư dân)</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('FEEDBACK_REPORT')}>Góp ý & báo lỗi kỹ thuật</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('FLOOR_PLANS')}>Sơ đồ mặt bằng các tòa nhà</span></li>
              </ul>
            </div>

            {/* Column 3: Regulations & Legal (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                QUY ĐỊNH & PHÁP LÝ
              </h4>
              <ul className="space-y-2 text-slate-600">
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('BUILDING_RULES')}>Nội quy quản lý tòa nhà</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('RESIDENCE_REGISTRATION')}>Quy định đăng ký tạm trú số</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('LEASE_TERMS')}>Điều khoản thỏa thuận thuê</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('PRIVACY_POLICY')}>Chính sách bảo mật thông tin</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('DISPUTE_RESOLUTION')}>Giải quyết khiếu nại cư dân</span></li>
                <li><span className="hover:text-[#00c5a0] transition-colors cursor-pointer" onClick={() => setFooterModalKey('LEGAL_COMPLIANCE')}>Pháp lý ký số hợp đồng AI</span></li>
              </ul>
            </div>

            {/* Column 4: Newsletter & Language (3 cols) */}
            <div className="lg:col-span-3 space-y-3.5">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                ĐĂNG KÝ NHẬN TIN ƯU ĐÃI
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Nhận thông báo tự động khi có căn hộ mới trống hoặc chính sách giảm giá thuê đặc biệt.
              </p>

              <form onSubmit={handleSubscribeNewsletter} className="flex items-center">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="flex-1 bg-slate-50 border border-slate-300 border-r-0 rounded-l-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c5a0]"
                />
                <button
                  type="submit"
                  title="Gửi đăng ký nhận tin"
                  className="bg-rose-500 hover:bg-rose-600 text-white px-3.5 py-2 rounded-r-lg transition-colors flex items-center justify-center shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-2">
                <label className="font-bold text-slate-900 uppercase text-[11px] tracking-wider block mb-1.5">
                  QUỐC GIA & NGÔN NGỮ
                </label>
                <div className="relative">
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-brand-500">
                    <option value="vi">Việt Nam (Tiếng Việt)</option>
                    <option value="en">English (US)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Bottom Tech Stack */}
        <div className="border-t border-slate-200 bg-slate-100/60 py-4 text-center text-xs text-slate-500">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-center">
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <span>Hỗ trợ RAG AI Copilot</span>
              <span>•</span>
              <span>Thanh toán VietQR Napas247</span>
              <span>•</span>
              <span>Giám sát IoT</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Bắt Buộc Đăng Nhập Trước Khi Thuê Căn Hộ */}
      {authRequiredModalApartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-brand-700 via-sky-700 to-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Yêu Cầu Đăng Nhập</h3>
                  <p className="text-xs text-teal-100 mt-0.5">Đặt lịch xem & thuê căn hộ</p>
                </div>
              </div>
              <button
                onClick={() => setAuthRequiredModalApartment(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Selected Apartment preview */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src={authRequiredModalApartment.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'}
                  alt={authRequiredModalApartment.roomNumber}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">
                    Căn hộ {authRequiredModalApartment.roomNumber?.startsWith('P') ? authRequiredModalApartment.roomNumber : `P${authRequiredModalApartment.roomNumber}`} - {authRequiredModalApartment.buildingName}
                  </h4>
                  <p className="text-xs font-semibold text-brand-700 mt-0.5">
                    {formatPriceVND(authRequiredModalApartment.price)} / tháng
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Cọc: {formatCurrency(authRequiredModalApartment.depositDefault)}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Để tạo hồ sơ giữ chỗ và xuất hợp đồng thuê căn hộ chính xác, quý khách cần đăng nhập tài khoản khách thuê vào hệ thống trước khi tiếp tục.
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthRequiredModalApartment(null);
                    navigate(`/login?redirect=${encodeURIComponent('/explore')}`);
                  }}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập Tài Khoản Ngay</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickLoginAsTenant}
                  className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Dùng Thử Tài Khoản Khách Thuê Demo (1-Click)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthRequiredModalApartment(null)}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold transition-colors"
                >
                  Để sau, tôi muốn xem thêm các phòng khác
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Booking Appointment Modal (UC011) */}
      {bookingModalApartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-sky-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Đặt Lịch Xem Căn {bookingModalApartment.roomNumber}</span>
                </h3>
                <p className="text-xs text-teal-100 mt-0.5">
                  {bookingModalApartment.buildingName} • Giá: {formatPriceVND(bookingModalApartment.price)}
                </p>
              </div>
              <button
                onClick={() => setBookingModalApartment(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              {isAuthenticated && user && (
                <div className="p-2.5 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Khách thuê: <strong>{user.fullName}</strong> ({user.email || user.username})</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên quý khách <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bookingForm.guestName}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c5a0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.guestPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestPhone: e.target.value })}
                    placeholder="0912 345 678"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c5a0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email nhận xác nhận
                  </label>
                  <input
                    type="email"
                    value={bookingForm.guestEmail}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestEmail: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c5a0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày muốn xem phòng <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingForm.viewingDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, viewingDate: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c5a0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khung giờ
                  </label>
                  <select
                    value={bookingForm.viewingTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, viewingTime: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  >
                    <option value="09:00">09:00 Sáng</option>
                    <option value="10:00">10:00 Sáng</option>
                    <option value="14:00">14:00 Chiều</option>
                    <option value="16:00">16:00 Chiều</option>
                    <option value="18:00">18:00 Tối</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú hoặc yêu cầu riêng
                </label>
                <textarea
                  rows={2}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setBookingModalApartment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isBookingLoading}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                >
                  {isBookingLoading ? 'Đang gửi...' : 'Xác Nhận Đặt Lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Information Modal */}
      <FooterInfoModal
        modalKey={footerModalKey}
        onClose={() => setFooterModalKey(null)}
        onOpenAIChat={() => window.dispatchEvent(new CustomEvent('open-rag-chatbot'))}
      />
    </div>
  );
};
