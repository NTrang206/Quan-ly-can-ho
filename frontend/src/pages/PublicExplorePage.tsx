import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Search, SlidersHorizontal, Sparkles, BedDouble, 
  Maximize2, MapPin, Calendar, CheckCircle2, 
  Phone, Mail, ArrowRight, X, Heart
} from 'lucide-react';
import { useGetBuildingsQuery, useGetApartmentsQuery } from '../modules/buildings/services/buildingApi';
import { useCreateBookingMutation } from '../modules/bookings/services/bookingApi';
import { formatCurrency } from '../utils/formatters';
import { IApartment, IBuilding } from '../types/entities';
import { AIRoomMatcherModal } from '../components/ai/AIRoomMatcherModal';
import { useToast } from '../hooks/useToast';


export const PublicExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToast();
  
  const { data: buildings = [] } = useGetBuildingsQuery();
  const { data: apartments = [] } = useGetApartmentsQuery({});
  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('ALL');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('ALL');
  const [isMatcherOpen, setIsMatcherOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);

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
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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

      showSuccessToast(`Đã gửi yêu cầu đặt lịch xem căn ${bookingModalApartment.roomNumber} thành công! Nhân viên tư vấn Sunshine Homes sẽ liên hệ trong 15 phút.`);
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
  const filteredApartments = apartments.filter(apt => {
    const matchesSearch = apt.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          apt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBuilding = selectedBuildingId === 'ALL' || apt.buildingId.toString() === selectedBuildingId;
    const matchesBedrooms = selectedBedrooms === 'ALL' || apt.bedrooms.toString() === selectedBedrooms;
    
    let matchesPrice = true;
    if (selectedPriceRange === 'UNDER_10M') matchesPrice = apt.price < 10000000;
    else if (selectedPriceRange === '10M_15M') matchesPrice = apt.price >= 10000000 && apt.price <= 15000000;
    else if (selectedPriceRange === '15M_20M') matchesPrice = apt.price > 15000000 && apt.price <= 20000000;
    else if (selectedPriceRange === 'OVER_20M') matchesPrice = apt.price > 20000000;

    return matchesSearch && matchesBuilding && matchesBedrooms && matchesPrice;
  });

  const getBuildingName = (buildingId: number) => {
    const b = buildings.find(item => item.id === buildingId);
    return b ? b.name : 'Tòa nhà Sunshine';
  };

  const getBuildingAddress = (buildingId: number) => {
    const b = buildings.find(item => item.id === buildingId);
    return b ? b.address : 'TP. Hồ Chí Minh';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Bar with Branding & Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                Sunshine Homes <span className="text-[10px] uppercase font-extrabold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">AI Living</span>
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">Hệ thống Căn hộ Dịch vụ & Chung cư Cao cấp</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all shadow-sky-500/20"
            >
              <span>Đăng nhập Cổng Quản lý</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-medium mb-6 backdrop-blur-sm animate-pulse">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>AI Room Matching 2.0 - Khám phá căn hộ mơ ước trong 3 giây</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Tìm Kiếm Không Gian Sống <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Đẳng Cấp, Tiện Nghi & Thông Minh
            </span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8 font-light">
            Trải nghiệm thuê căn hộ 4.0 với hợp đồng điện tử pháp lý AI, thanh toán VietQR Napas247 tự động, và hỗ trợ 24/7 từ Sunshine AI Assistant.
          </p>

          {/* Quick AI Search Prompt Bar */}
          <div className="max-w-3xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập mã căn (P.101, P.202...), vị trí hoặc nhu cầu..."
                className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsMatcherOpen(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all shadow-sky-600/30 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>AI Gợi Ý Căn Hộ</span>
              </button>
            </div>
          </div>

          {/* AI Quick Prompts Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
            <span className="text-slate-400 font-medium">Gợi ý nhanh:</span>
            {[
              'P.101 Sunshine Tower A',
              'P.201 Sky Park',
              'Căn 2PN dưới 15 triệu',
              'Căn 1PN Studio'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setSearchTerm(chip.replace('Căn ', ''))}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-full border border-slate-700 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area: Filters and Listings */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-slate-700 font-semibold text-sm">
              <SlidersHorizontal className="w-4 h-4 text-sky-600" />
              <span>Bộ lọc tìm kiếm:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
              {/* Building Select */}
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">🏢 Tất cả tòa nhà ({buildings.length})</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id.toString()}>{b.name} ({b.address.split(',')[0]})</option>
                ))}
              </select>

              {/* Bedrooms Select */}
              <select
                value={selectedBedrooms}
                onChange={(e) => setSelectedBedrooms(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">🛏️ Tất cả phòng ngủ</option>
                <option value="1">1 Phòng ngủ (Studio / 1PN)</option>
                <option value="2">2 Phòng ngủ (Căn hộ chuẩn)</option>
                <option value="3">3 Phòng ngủ (Gia đình)</option>
              </select>

              {/* Price Range Select */}
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="ALL">💰 Tất cả mức giá</option>
                <option value="UNDER_10M">Dưới 10 triệu / tháng</option>
                <option value="10M_15M">Từ 10 - 15 triệu / tháng</option>
                <option value="15M_20M">Từ 15 - 20 triệu / tháng</option>
                <option value="OVER_20M">Trên 20 triệu / tháng</option>
              </select>
            </div>

            <div className="text-right text-xs text-slate-500">
              Tìm thấy <strong className="text-sky-700">{filteredApartments.length}</strong> căn hộ phù hợp
            </div>
          </div>
        </div>

        {/* Apartments Grid */}
        {filteredApartments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Không tìm thấy căn hộ phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Vui lòng điều chỉnh lại tiêu chí lọc hoặc sử dụng trợ lý AI Room Matching để tìm phòng tương tự.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedBuildingId('ALL');
                setSelectedBedrooms('ALL');
                setSelectedPriceRange('ALL');
              }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApartments.map((apt) => {
              const isFav = favorites.includes(apt.id);
              const buildingName = apt.buildingName || getBuildingName(apt.buildingId);
              const isAvailable = apt.status === 'AVAILABLE';

              return (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col group"
                >
                  {/* Image Card Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => navigate(`/apartments/${apt.id}`)}>
                    <img
                      src={apt.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80';
                      }}
                      alt={apt.roomNumber}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md ${
                        isAvailable 
                          ? 'bg-emerald-500/90 text-white' 
                          : 'bg-amber-500/90 text-white'
                      }`}>
                        {isAvailable ? '● Sẵn sàng dọn vào' : '● Đang có hợp đồng'}
                      </span>

                      <button
                        onClick={(e) => toggleFavorite(apt.id, e)}
                        className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center backdrop-blur shadow transition-transform active:scale-90"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                      </button>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-xs font-medium text-sky-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{buildingName}</span>
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-white flex items-center justify-between">
                        <span>Căn hộ {apt.roomNumber}</span>
                        <span className="text-sm font-normal text-slate-200">Tầng {apt.floor}</span>
                      </h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Specs */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center space-x-1.5">
                          <BedDouble className="w-4 h-4 text-sky-600" />
                          <span><strong>{apt.bedrooms}</strong> Phòng ngủ</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400 font-bold">🚿</span>
                          <span><strong>{apt.bathrooms}</strong> Vệ sinh</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Maximize2 className="w-4 h-4 text-sky-600" />
                          <span><strong>{apt.areaSqm}</strong> m²</span>
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1.5 my-3">
                        {apt.amenities?.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            {amenity.name}
                          </span>
                        ))}
                        {(apt.amenities?.length || 0) > 3 && (
                          <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                            +{apt.amenities!.length - 3}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {apt.description || 'Căn hộ cao cấp Sunshine Homes trang bị đầy đủ tiện ích thông minh, view panorama thoáng mát.'}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-baseline justify-between mb-3">
                        <div>
                          <span className="text-[11px] text-slate-400 block">Giá thuê niêm yết</span>
                          <span className="text-lg font-extrabold text-sky-700">
                            {formatCurrency(apt.price)}
                          </span>
                          <span className="text-[11px] text-slate-500"> /tháng</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">Tiền cọc</span>
                          <span className="text-xs font-semibold text-slate-700">{formatCurrency(apt.depositDefault)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/apartments/${apt.id}`)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors text-center"
                        >
                          Chi Tiết Căn
                        </button>
                        <button
                          onClick={() => setBookingModalApartment(apt)}
                          className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-sky-600/20 text-center flex items-center justify-center gap-1"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Đặt Lịch Xem</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Booking Appointment Modal (UC011) */}
      {bookingModalApartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Đặt Lịch Xem Căn {bookingModalApartment.roomNumber}</span>
                </h3>
                <p className="text-xs text-sky-100 mt-0.5">
                  {bookingModalApartment.buildingName} • Giá: {formatCurrency(bookingModalApartment.price)}/tháng
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
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Khung giờ
                  </label>
                  <select
                    value={bookingForm.viewingTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, viewingTime: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
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
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
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
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/30 flex items-center space-x-1.5"
                >
                  {isBookingLoading ? 'Đang gửi...' : 'Xác Nhận Đặt Lịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Room Matcher Modal */}
      <AIRoomMatcherModal
        isOpen={isMatcherOpen}
        onClose={() => setIsMatcherOpen(false)}
        apartments={apartments}
        onSelectApartment={(apt) => {
          navigate(`/apartments/${apt.id}`);
        }}
      />
    </div>
  );
};
