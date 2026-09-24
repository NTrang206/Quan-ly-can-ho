import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, SlidersHorizontal, Sparkles, BedDouble, 
  Maximize2, MapPin, Calendar, CheckCircle2, 
  Phone, Mail, ArrowRight, X, Heart, Bookmark, ChevronDown, 
  Camera, ShieldCheck, Flame, Tag, Clock, Share2, PlusCircle,
  Headphones, Send, Globe, QrCode
} from 'lucide-react';
import { useGetBuildingsQuery, useGetApartmentsQuery } from '../modules/buildings/services/buildingApi';
import { useCreateBookingMutation } from '../modules/bookings/services/bookingApi';
import { formatCurrency } from '../utils/formatters';
import { IApartment, IBuilding } from '../types/entities';
import { AIRoomMatcherModal } from '../components/ai/AIRoomMatcherModal';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { DwellLogo } from '../components/common/DwellLogo';
import { AIBotLogo } from '../components/common/AIBotLogo';
import { FooterInfoModal, FooterModalKey } from '../components/common/FooterInfoModal';
import { BuildingLookupModal } from '../components/common/BuildingLookupModal';
import { ResidentPortalModal } from '../components/common/ResidentPortalModal';

export const PublicExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();
  const { isAuthenticated, isTenant, isAdmin, isStaff, switchRole } = useAuth();
  
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { data: apartments = [] } = useGetApartmentsQuery({});
  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC' | 'AREA_DESC'>('DEFAULT');
  const [isMatcherOpen, setIsMatcherOpen] = useState(false);
  const [isBuildingLookupOpen, setIsBuildingLookupOpen] = useState(false);
  const [isResidentPortalModalOpen, setIsResidentPortalModalOpen] = useState(false);
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

  // Booking Modal State
  const [bookingModalApartment, setBookingModalApartment] = useState<IApartment | null>(null);
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    viewingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    viewingTime: '10:00',
    notes: 'Tôi muốn xem thực tế căn hộ này vào thời gian trên.'
  });

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

  // Filter logic
  const filteredApartments = useMemo(() => {
    return apartments.filter(apt => {
      const matchesSearch = apt.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            apt.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            apt.buildingName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBuilding = selectedBuildingId === 'ALL' || apt.buildingId.toString() === selectedBuildingId;
      const matchesBedrooms = selectedBedrooms === 'ALL' || apt.bedrooms.toString() === selectedBedrooms;
      
      let matchesPrice = true;
      if (selectedPriceRange === 'UNDER_10M') matchesPrice = apt.price < 10000000;
      else if (selectedPriceRange === '10M_15M') matchesPrice = apt.price >= 10000000 && apt.price <= 15000000;
      else if (selectedPriceRange === '15M_20M') matchesPrice = apt.price > 15000000 && apt.price <= 20000000;
      else if (selectedPriceRange === 'OVER_20M') matchesPrice = apt.price > 20000000;

      return matchesSearch && matchesBuilding && matchesBedrooms && matchesPrice;
    });
  }, [apartments, searchTerm, selectedBuildingId, selectedBedrooms, selectedPriceRange]);

  // Sort logic
  const sortedApartments = useMemo(() => {
    const list = [...filteredApartments];
    if (sortBy === 'PRICE_ASC') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'PRICE_DESC') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'AREA_DESC') return list.sort((a, b) => b.areaSqm - a.areaSqm);
    return list.sort((a, b) => b.id - a.id);
  }, [filteredApartments, sortBy]);

  const getBuildingName = (buildingId: number) => {
    const b = buildings.find(item => item.id === buildingId);
    return b ? b.name : 'Dwell Tower';
  };

  const getBuildingAddress = (buildingId: number) => {
    const b = buildings.find(item => item.id === buildingId);
    return b ? b.address : 'Quận Cầu Giấy, Hà Nội';
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
      {/* 1. Top Header (Mogi style nav bar) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="cursor-pointer" onClick={() => navigate('/')}>
              <DwellLogo badge="Tìm Thuê" badgeVariant="emerald" size="sm" />
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-5 text-xs font-semibold text-slate-700">
              <div 
                className="relative group cursor-pointer py-2"
                onClick={() => setIsBuildingLookupOpen(true)}
                title="Bấm để tra cứu thông tin tòa nhà và căn hộ trống"
              >
                <span className="text-slate-600 hover:text-[#00c5a0] transition-colors">Tra cứu tòa nhà</span>
                <span className="absolute -top-1 -right-4 px-1 py-0.2 bg-rose-500 text-[9px] text-white font-bold rounded">New</span>
              </div>
              <span 
                className="text-[#00c5a0] font-bold border-b-2 border-[#00c5a0] pb-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBuildingId('ALL');
                  setSelectedBedrooms('ALL');
                  setSelectedPriceRange('ALL');
                  setSortBy('DEFAULT');
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                  showSuccessToast('Đang hiển thị toàn bộ danh sách căn hộ cho thuê mới nhất.');
                }}
                title="Bấm để xem tất cả căn hộ cho thuê"
              >
                Tìm thuê
              </span>
              <span 
                className="text-slate-600 hover:text-[#00c5a0] cursor-pointer transition-colors" 
                onClick={() => setFooterModalKey('PRICING_FEES')}
                title="Xem bảng biểu giá thuê phòng & chi phí dịch vụ Dwell"
              >
                Bảng giá thuê
              </span>
              <span 
                className="text-slate-600 hover:text-[#00c5a0] cursor-pointer transition-colors" 
                onClick={() => {
                  if (isAuthenticated && (isTenant || isAdmin || isStaff)) {
                    navigate('/resident-portal');
                  } else {
                    setIsResidentPortalModalOpen(true);
                  }
                }}
                title="Truy cập Cổng dịch vụ cư dân trực tuyến"
              >
                Cổng cư dân
              </span>
              <span 
                className="text-slate-600 hover:text-[#00c5a0] cursor-pointer transition-colors flex items-center gap-1.5" 
                onClick={() => setIsMatcherOpen(true)}
                title="Mở trợ lý AI tìm phòng theo ngân sách và tiêu chí"
              >
                <AIBotLogo size="xs" />
                <span>AI Room Matcher</span>
              </span>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-semibold text-slate-700 hover:text-[#00c5a0] px-2.5 py-1.5 transition-colors hidden sm:block"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center px-4 py-2 bg-[#00c5a0] hover:bg-[#00b28e] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              <span>Đăng ký</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Top Filter Ribbon (Floating Search Strip matching Mogi screenshot) */}
      <section className="bg-white border-b border-slate-200 shadow-xs py-3 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2.5 items-center">
            {/* Search Input with Clear Button */}
            <div className="md:col-span-4 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Hà Nội, Cầu Giấy, P.101..."
                className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00c5a0] focus:ring-1 focus:ring-[#00c5a0]"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>

            {/* Location / Building Filter */}
            <div className="md:col-span-3">
              <div className="relative">
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 font-medium text-slate-700 appearance-none focus:outline-none focus:border-[#00c5a0] focus:ring-1 focus:ring-[#00c5a0]"
                >
                  <option value="ALL">📍 Tất cả khu vực / Tòa nhà</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id.toString()}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Bedrooms Filter */}
            <div className="md:col-span-2">
              <div className="relative">
                <select
                  value={selectedBedrooms}
                  onChange={(e) => setSelectedBedrooms(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 font-medium text-slate-700 appearance-none focus:outline-none focus:border-[#00c5a0] focus:ring-1 focus:ring-[#00c5a0]"
                >
                  <option value="ALL">🏢 Loại phòng</option>
                  <option value="1">1 Phòng ngủ (Studio)</option>
                  <option value="2">2 Phòng ngủ</option>
                  <option value="3">3 Phòng ngủ (Gia đình)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Price Filter */}
            <div className="md:col-span-2">
              <div className="relative">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2 font-medium text-slate-700 appearance-none focus:outline-none focus:border-[#00c5a0] focus:ring-1 focus:ring-[#00c5a0]"
                >
                  <option value="ALL">💰 Giá thuê</option>
                  <option value="UNDER_10M">Dưới 10 triệu</option>
                  <option value="10M_15M">Từ 10 - 15 triệu</option>
                  <option value="15M_20M">Từ 15 - 20 triệu</option>
                  <option value="OVER_20M">Trên 20 triệu</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Extra Filter / AI Button */}
            <div className="md:col-span-1">
              <button
                onClick={() => setIsMatcherOpen(true)}
                title="Kích hoạt trợ lý AI tìm phòng"
                className="w-full inline-flex items-center justify-center space-x-1 px-2.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                <AIBotLogo size="xs" />
                <span className="hidden xl:inline">AI Gợi Ý</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Body Content (2-Column Grid matching Mogi layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb Navigation */}
        <div className="text-xs text-slate-500 mb-2 flex items-center space-x-1.5 flex-wrap">
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/')}>Dwell</span>
          <span>&gt;</span>
          <span className="hover:text-slate-800 cursor-pointer" onClick={() => setSelectedBuildingId('ALL')}>Cho thuê căn hộ</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium">
            {selectedBuildingId !== 'ALL' ? getBuildingName(Number(selectedBuildingId)) : 'Toàn bộ hệ thống căn hộ cao cấp'}
          </span>
        </div>

        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 tracking-tight">
          Cho Thuê Căn Hộ Cao Cấp Hiện Đại, Tiện Nghi Dwell T9/2026
        </h1>

        {/* Results Counter & Actions Bar */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-200 mb-4 text-xs">
          <div className="text-slate-600 font-medium">
            <strong>1 - {sortedApartments.length}</strong> trong <strong>{apartments.length}</strong> căn hộ
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveSearch}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                isSavedSearch 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSavedSearch ? 'fill-emerald-600 text-emerald-600' : ''}`} />
              <span>{isSavedSearch ? 'Đã lưu tìm kiếm' : 'Lưu tìm kiếm'}</span>
            </button>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-[#00c5a0]"
              >
                <option value="DEFAULT">Sắp xếp: Mới nhất</option>
                <option value="PRICE_ASC">Giá: Thấp đến cao</option>
                <option value="PRICE_DESC">Giá: Cao đến thấp</option>
                <option value="AREA_DESC">Diện tích: Lớn nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: 8 Cols (Listings) + 4 Cols (Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Horizontal Cards Listing */}
          <div className="lg:col-span-8 space-y-3.5">
            {sortedApartments.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">Không tìm thấy căn hộ phù hợp</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Vui lòng thử điều chỉnh lại bộ lọc hoặc kích hoạt trợ lý AI để tìm phòng tương tự.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBuildingId('ALL');
                    setSelectedBedrooms('ALL');
                    setSelectedPriceRange('ALL');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              sortedApartments.map((apt) => {
                const isFav = favorites.includes(apt.id);
                const buildingName = apt.buildingName || getBuildingName(apt.buildingId);
                const address = getBuildingAddress(apt.buildingId);
                const isAvailable = apt.status === 'AVAILABLE';

                return (
                  <div
                    key={apt.id}
                    onClick={() => navigate(`/apartments/${apt.id}`)}
                    className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 hover:shadow-md hover:border-[#00c5a0] transition-all flex flex-col sm:flex-row gap-3.5 group cursor-pointer"
                  >
                    {/* Image Thumbnail with Photo Counter badge (Mogi style) */}
                    <div className="w-full sm:w-56 h-48 sm:h-36 shrink-0 relative rounded-lg overflow-hidden bg-slate-100">
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

                      {/* Top Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAvailable 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-amber-600 text-white'
                        }`}>
                          {isAvailable ? 'Sẵn sàng dọn vào' : 'Đang có hợp đồng'}
                        </span>
                      </div>

                      {/* Bottom Photo Count Badge (Mogi signature badge) */}
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1 backdrop-blur-xs">
                        <Camera className="w-3 h-3" />
                        <span>{6 + (apt.id % 4)}</span>
                      </div>
                    </div>

                    {/* Content Details Area */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#00a680] transition-colors line-clamp-2 leading-snug">
                          Căn hộ cao cấp P.{apt.roomNumber} view thoáng mát - {buildingName}
                        </h2>

                        {/* Location */}
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{address}</span>
                        </div>

                        {/* Specs Row */}
                        <div className="flex items-center gap-4 text-xs text-slate-700 font-semibold mt-2.5">
                          <span>{apt.areaSqm} m²</span>
                          <span>•</span>
                          <span>{apt.bedrooms} PN</span>
                          <span>•</span>
                          <span>{apt.bathrooms} WC</span>
                          <span>•</span>
                          <span>Tầng {apt.floor}</span>
                        </div>

                        {/* Description Preview */}
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1.5">
                          {apt.description || 'Căn hộ nội thất chuẩn khách sạn 4 sao, ban công thoáng gió, đầy đủ thiết bị.'}
                        </p>
                      </div>

                      {/* Bottom Row: Price & Actions */}
                      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                        {/* Price */}
                        <div>
                          <span className="text-base sm:text-lg font-bold text-[#00a680]">
                            {formatPriceVND(apt.price)}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
                            (Cọc: {formatCurrency(apt.depositDefault)})
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-slate-400 hidden md:inline">
                            Cập nhật hôm nay
                          </span>

                          <button
                            onClick={(e) => toggleFavorite(apt.id, e)}
                            title="Lưu tin"
                            className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingModalApartment(apt);
                            }}
                            className="px-3 py-1.5 bg-[#00c5a0] hover:bg-[#00b28e] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                          >
                            Đặt lịch
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Sidebar (Matches Promo Banner in Mogi Screenshot) */}
          <div className="lg:col-span-4 space-y-4">

            {/* AI Room Matcher Card */}
            <div className="bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-200/80 rounded-xl p-4 shadow-xs">
              <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm mb-1.5">
                <AIBotLogo size="md" />
                <span>AI Room Matcher 2.0</span>
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                Chưa tìm được căn phòng ưng ý? Hãy để trợ lý AI đề xuất căn hộ phù hợp phong cách & ngân sách của bạn trong 3 giây.
              </p>
              <button
                onClick={() => setIsMatcherOpen(true)}
                className="w-full py-2 px-3 bg-[#00c5a0] hover:bg-[#00b28e] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <AIBotLogo size="xs" />
                <span>Tìm Phòng Bằng AI Ngay</span>
              </button>
            </div>

            {/* Featured Buildings Widget */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                🏢 Tòa Nhà Cho Thuê Nổi Bật
              </h4>
              <div className="space-y-2">
                {buildings.map((b) => {
                  const aptCount = apartments.filter(a => a.buildingId === b.id).length;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBuildingId(b.id.toString())}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                        selectedBuildingId === b.id.toString()
                          ? 'border-[#00c5a0] bg-teal-50/50 text-[#00a680] font-semibold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold truncate">{b.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{b.address}</div>
                      </div>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium shrink-0">
                        {aptCount} căn
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hotline & Support Widget */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                📞 Hỗ Trợ Xem Phòng 24/7
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Đội ngũ chuyên viên tư vấn Dwell hỗ trợ đưa đón xem phòng trực tiếp miễn phí.
              </p>
              <div className="flex items-center space-x-2">
                <a
                  href="tel:19008888"
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                  <span>1900 8888</span>
                </a>
                <button
                  onClick={() => {
                    if (sortedApartments.length > 0) {
                      setBookingModalApartment(sortedApartments[0]);
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-teal-50 hover:bg-teal-100 text-[#00a680] border border-teal-200 text-xs font-bold rounded-lg text-center transition-colors"
                >
                  Đặt Lịch Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Comprehensive Real-Estate Footer (Batdongsan.com.vn style tailored to Dwell Living) */}
      <footer className="bg-white border-t border-slate-200 mt-16 text-slate-700">
        {/* Top Contact Strip */}
        <div className="border-b border-slate-200/80 bg-slate-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Brand Logo */}
              <div className="md:col-span-4 flex items-center">
                <DwellLogo badge="Living 4.0" badgeVariant="emerald" size="md" />
              </div>

              {/* Contact Pill 1: Hotline */}
              <div className="md:col-span-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 text-[#00a680] flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Hotline tư vấn</div>
                  <a href="tel:19008899" className="text-sm font-bold text-slate-900 hover:text-[#00a680] transition-colors">
                    1900 8899 - 0912 345 678
                  </a>
                </div>
              </div>

              {/* Contact Pill 2: Resident Support */}
              <div className="md:col-span-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase font-semibold tracking-wider">Hỗ trợ khách hàng</div>
                  <a href="mailto:trogiup@dwell.vn" className="text-sm font-bold text-slate-900 hover:text-[#00a680] transition-colors">
                    trogiup@dwell.vn
                  </a>
                </div>
              </div>

              {/* Contact Pill 3: Partnerships */}
              <div className="md:col-span-2 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-xs">
            {/* Column 1: Company Profile (4 cols) */}
            <div className="lg:col-span-4 space-y-3.5">
              <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                CÔNG TY CỔ PHẦN CÔNG NGHỆ BẤT ĐỘNG SẢN DWELL VIỆT NAM
              </h4>

              <div className="flex items-start space-x-2 text-slate-600 leading-relaxed">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Tầng 12, Tòa nhà Sunshine Center, Số 16 Phạm Hùng, Phường Mỹ Đình 2, Quận Nam Từ Liêm, TP. Hà Nội, Việt Nam
                </span>
              </div>

              <div className="flex items-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>(024) 3562 5939 - (028) 7300 8899</span>
              </div>

              {/* QR Code & App Download Badges */}
              <div className="pt-2 flex items-center space-x-4">
                <div className="w-20 h-20 p-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs flex flex-col items-center justify-center shrink-0 text-center">
                  <QrCode className="w-12 h-12 text-slate-800" />
                  <span className="text-[9px] text-slate-500 font-medium mt-0.5 leading-none">Quét tải App</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800 transition-colors shadow-2xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3.609 1.814L13.792 12 3.61 22.186c-.198-.182-.317-.442-.317-.745V2.559c0-.303.119-.563.316-.745zm11.235 11.235l2.052-2.052-2.052-2.052 1.341-1.341 3.393 3.393-3.393 3.393-1.341-1.341zM5.023.4l10.187 10.187-2.052 2.052L4.01 3.491c.217-.37.6-.669 1.013-.691v.001l-.001-.001-.001-.001-.001-.001-.001-.001.014-.399zm8.135 13.588l2.052 2.052L5.023 23.6c-.413-.022-.796-.321-1.013-.691l9.148-9.148v.227z"/></svg>
                    <div>
                      <div className="text-[8px] text-slate-400 uppercase leading-none">Tải về trên</div>
                      <div className="text-[11px] font-bold leading-none mt-0.5">Google Play</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg cursor-pointer hover:bg-slate-800 transition-colors shadow-2xs">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.58.66-1.08 1.73-.95 2.76 1.01.08 2.03-.51 2.66-1.26z"/></svg>
                    <div>
                      <div className="text-[8px] text-slate-400 uppercase leading-none">Tải về trên</div>
                      <div className="text-[11px] font-bold leading-none mt-0.5">App Store</div>
                    </div>
                  </div>
                </div>
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
                  <select className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 appearance-none focus:outline-none focus:border-[#00c5a0]">
                    <option value="vi">🇻🇳 Việt Nam (Tiếng Việt)</option>
                    <option value="en">🇺🇸 English (US)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Bottom Copyright & Tech Stack */}
        <div className="border-t border-slate-200 bg-slate-100/60 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              © 2026 Dwell Living. Bản quyền thuộc về <strong className="text-slate-700 font-semibold">Đề tài 12 – Hệ Thống Quản Lý Căn Hộ Cho Thuê Thông Minh & Hợp Đồng Điện Tử AI</strong>.
            </div>
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c5a0] font-medium"
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
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00c5a0] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setBookingModalApartment(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isBookingLoading}
                  className="px-5 py-2.5 bg-[#00c5a0] hover:bg-[#00b28e] text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 flex items-center space-x-1.5"
                >
                  {isBookingLoading ? 'Đang gửi...' : 'Xác Nhận Đặt Lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. AI Room Matcher Modal */}
      <AIRoomMatcherModal
        isOpen={isMatcherOpen}
        onClose={() => setIsMatcherOpen(false)}
        apartments={apartments}
        onSelectApartment={(apt) => {
          navigate(`/apartments/${apt.id}`);
        }}
      />

      {/* 6. Footer Information Modal */}
      <FooterInfoModal
        modalKey={footerModalKey}
        onClose={() => setFooterModalKey(null)}
        onOpenAIChat={() => setIsMatcherOpen(true)}
      />

      {/* 7. Building Lookup Modal */}
      <BuildingLookupModal
        isOpen={isBuildingLookupOpen}
        onClose={() => setIsBuildingLookupOpen(false)}
        buildings={buildings}
        onSelectBuilding={(buildingId, buildingName) => {
          setSelectedBuildingId(buildingId.toString());
          window.scrollTo({ top: 350, behavior: 'smooth' });
          showSuccessToast(`Đã lọc danh sách căn hộ tại ${buildingName}`);
        }}
        onOpenFloorPlans={() => setFooterModalKey('FLOOR_PLANS')}
      />

      {/* 8. Resident Portal Preview Modal */}
      <ResidentPortalModal
        isOpen={isResidentPortalModalOpen}
        onClose={() => setIsResidentPortalModalOpen(false)}
        onEnterPortalAsTenant={() => {
          switchRole('TENANT');
          showSuccessToast('Đã kích hoạt chế độ Cư Dân Dwell Living.');
          navigate('/resident-portal');
        }}
        onGoToLogin={() => navigate('/login')}
      />
    </div>
  );
};
