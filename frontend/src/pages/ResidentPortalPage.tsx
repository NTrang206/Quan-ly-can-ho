import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Building,
  ShieldCheck,
  Sparkles,
  QrCode,
  Wrench,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Download,
  Copy,
  Check,
  Star,
  DollarSign,
  Plus,
  Home,
  Receipt,
  FileSignature,
  FileText,
  UserPlus,
  Phone,
  Image as ImageIcon,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { VietQRModal } from '../components/common/VietQRModal';
import { AIRoomMatcherModal } from '../components/ai/AIRoomMatcherModal';
import { useGetApartmentsQuery } from '../modules/buildings/services/buildingApi';
import { useGetContractsQuery, useRenewContractMutation } from '../modules/contracts/services/contractApi';
import { useGetReceivablesQuery, useRecordPaymentMutation } from '../modules/finance/services/financeApi';
import {
  useGetMaintenanceRequestsQuery,
  useCreateMaintenanceRequestMutation,
  useCompleteAndInspectMaintenanceMutation,
} from '../modules/maintenance/services/maintenanceApi';
import { useGetTenantsQuery, useAddRoommateMutation } from '../modules/tenants/services/tenantApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateVietQRUrl, DEFAULT_BUILDING_BANK_ACCOUNT } from '../utils/vietqr';
import { useToast } from '../hooks/useToast';
import { AIBotLogo } from '../components/common/AIBotLogo';
import { IApartment } from '../types';

export const ResidentPortalPage: React.FC = () => {
  const toast = useToast();

  // Queries
  const { data: apartments = [] } = useGetApartmentsQuery({});
  const { data: contracts = [] } = useGetContractsQuery({});
  const { data: receivables = [] } = useGetReceivablesQuery({});
  const { data: maintenanceList = [] } = useGetMaintenanceRequestsQuery({});
  const { data: tenants = [] } = useGetTenantsQuery({});

  // Mutations
  const [recordPayment, { isLoading: isPaying }] = useRecordPaymentMutation();
  const [createMaintenance, { isLoading: isReporting }] = useCreateMaintenanceRequestMutation();
  const [completeMaintenance, { isLoading: isInspecting }] = useCompleteAndInspectMaintenanceMutation();
  const [renewContract, { isLoading: isRenewing }] = useRenewContractMutation();
  const [addRoommate, { isLoading: isAddingRm }] = useAddRoommateMutation();

  // Active Resident Context (Tenant Nguyễn Văn An - P.302)
  const currentTenant = tenants[0] || {
    id: 1,
    fullName: 'Nguyễn Văn An',
    currentRoomNumber: 'P.302',
    phone: '0912.888.999',
    roommates: [],
  };

  const activeContract = contracts.find((c) => c.roomNumber === 'P.302') || contracts[0];
  const activeBill = receivables.find((r) => r.roomNumber === 'P.302' && r.status !== 'PAID') || receivables[0];
  const activeTicket = maintenanceList.find((m) => m.roomNumber === 'P.302' && m.status === 'IN_PROGRESS') || maintenanceList[0];

  // Modals state
  const [isVietQROpen, setIsVietQROpen] = useState(false);
  const [isRoomMatcherOpen, setIsRoomMatcherOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isAddRoommateOpen, setIsAddRoommateOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

  // New Ticket State
  const [newCategory, setNewCategory] = useState<'PLUMBING' | 'ELECTRICAL' | 'APPLIANCE' | 'DOOR_LOCK' | 'OTHER'>('PLUMBING');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  // Roommate state
  const [rmName, setRmName] = useState('');
  const [rmCitizenId, setRmCitizenId] = useState('');
  const [rmPhone, setRmPhone] = useState('');
  const [rmRelation, setRmRelation] = useState('Vợ / Chồng');

  // Rating state
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('Kỹ thuật viên nhiệt tình, xử lý rất nhanh.');

  const qrUrl = generateVietQRUrl({
    bankId: 'MB',
    accountNo: DEFAULT_BUILDING_BANK_ACCOUNT.accountNo,
    accountName: DEFAULT_BUILDING_BANK_ACCOUNT.accountName,
    amount: activeBill?.remainingDebt || 9347500,
    description: `HD2024089 T${activeBill?.billingMonth || 11}`,
    template: 'compact2',
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    try {
      await createMaintenance({
        apartmentId: 1,
        roomNumber: 'P.302',
        buildingName: 'Sunshine Tower A',
        reporterName: currentTenant.fullName,
        phone: currentTenant.phone,
        issueDescription: newDesc,
        category: newCategory,
        priority: newPriority,
      }).unwrap();

      toast.success('Đã gửi yêu cầu', 'Đội ngũ kỹ thuật Sunshine Homes đã tiếp nhận và đang điều phối thợ!');
      setNewDesc('');
    } catch {
      toast.error('Lỗi', 'Không thể gửi yêu cầu lúc này');
    }
  };

  const handleInspectTicket = async () => {
    if (!activeTicket) return;
    try {
      await completeMaintenance({
        ticketId: activeTicket.id,
        cost: activeTicket.repairCost || 150000,
        rating,
        feedback: ratingComment,
        isPass: true,
      }).unwrap();

      toast.success('Nghiệm thu thành công', 'Cảm ơn Quý cư dân đã đánh giá chất lượng dịch vụ 5 sao!');
      setIsInspectModalOpen(false);
    } catch {
      toast.error('Lỗi', 'Không thể nghiệm thu lúc này');
    }
  };

  const handleAddRoommate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRoommate({
        tenantId: currentTenant.id,
        roommate: {
          apartmentId: 1,
          fullName: rmName,
          citizenId: rmCitizenId,
          phone: rmPhone,
          relationship: rmRelation,
          isRegisteredTemp: true,
          registeredDate: new Date().toISOString().split('T')[0],
        },
      }).unwrap();

      toast.success('Đăng ký thành công', `Hồ sơ tạm trú của ${rmName} đã được gửi lên Cổng DVC!`);
      setIsAddRoommateOpen(false);
      setRmName('');
      setRmCitizenId('');
    } catch {
      toast.error('Lỗi', 'Không thể thêm thành viên');
    }
  };

  const handleDirectTransferConfirm = async () => {
    if (!activeBill) return;
    try {
      await recordPayment({
        receivableId: activeBill.id,
        amount: activeBill.remainingDebt,
        paymentMethod: 'BANK_TRANSFER',
        note: 'Thanh toán VietQR Napas247 từ Cổng Cư Dân',
      }).unwrap();

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      toast.success('Thanh toán thành công', 'Hóa đơn cước phí của Quý cư dân đã được gạch nợ tự động!');
    } catch {
      toast.error('Lỗi', 'Không thể xác nhận giao dịch');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP WELCOME HERO BANNER */}
      <div className="bg-gradient-to-r from-brand-700 via-blue-700 to-indigo-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Xin chào cư dân {currentTenant.fullName}! 👋
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-sky-100 font-medium">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <Home className="w-3.5 h-3.5" />
                Căn hộ P.302 (Tầng 3, Sunshine Tower A)
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <FileSignature className="w-3.5 h-3.5" />
                HĐ: HĐ-2024-089 (Hạn: 31/12/2026 - Còn 102 ngày)
              </span>
            </div>

            {/* Alert banner */}
            {activeBill && activeBill.status !== 'PAID' && (
              <div className="inline-flex items-center gap-2 bg-rose-500/30 border border-rose-300/40 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold mt-1">
                <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
                <span>Cảnh báo: Hóa đơn Tháng {activeBill.billingMonth} chưa thanh toán (Hạn {formatDate(activeBill.dueDate)})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN (6 cols) ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Căn Hộ P.302 - Coastal Vista Suite */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-xs">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Căn Hộ P.302 – Coastal Vista Suite
                  </h3>
                  <div className="text-xs text-slate-500">
                    Tầng 3 • Block Sunshine A • Quản lý chuyên trách: Mr. Hoàng Nam
                  </div>
                </div>
              </div>
              <Badge status="OCCUPIED" label="ĐANG THUÊ CHÍNH THỨC" />
            </div>

            {/* Room specs */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Diện tích</span>
                <strong className="text-slate-900 text-sm font-black">65 m²</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Phòng ngủ</span>
                <strong className="text-slate-900 text-sm font-black">02 PN</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Vệ sinh</span>
                <strong className="text-slate-900 text-sm font-black">02 WC</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-[10px] block">Giá thuê/th</span>
                <strong className="text-brand-700 text-sm font-black">8.5 Tr</strong>
              </div>
            </div>

            {/* Handover Equipment List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Danh Mục Trang Thiết Bị Bàn Giao Ký Nhận</span>
                <a href="#assets" className="text-brand-600 font-semibold hover:underline text-[11px]">
                  Xem biên bản hoàn chỉnh (14 món)
                </a>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Điều hòa Daikin Inverter 12000BTU (x2)</div>
                    <div className="text-[10px] text-slate-400">Vị trí: Phòng khách & Master bedroom</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full">
                    ● Tốt - Bảo dưỡng định kỳ
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Tủ lạnh Toshiba 2 cánh Inverter 320L</div>
                    <div className="text-[10px] text-slate-400">Vị trí: Bếp ăn trung tâm</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full">
                    ● Tốt - Hoạt động êm ái
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Bếp từ đôi Hafele HC-IS772EA</div>
                    <div className="text-[10px] text-slate-400">Mặt kính Schott Ceran chịu lực</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full">
                    ● Tốt - Kèm mặt kính chuẩn
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-900">Khóa cửa vân tay Smart Lock Yale YDM-4109+</div>
                    <div className="text-[10px] text-slate-400">Cửa chính ra vào căn hộ P.302</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold text-[10px] rounded-full">
                    ● Tốt - Pin 92%
                  </span>
                </div>
              </div>
            </div>

            {/* Roommates List */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-600" />
                  <span>Danh Sách Thành Viên Ở Cùng (03 người)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  VNeID Verified
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold mx-auto flex items-center justify-center text-xs">
                    AN
                  </div>
                  <div className="font-bold text-slate-900 mt-1 text-[11px]">Nguyễn Văn An</div>
                  <div className="text-[10px] text-slate-400">Chủ hợp đồng</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold mx-auto flex items-center justify-center text-xs">
                    MA
                  </div>
                  <div className="font-bold text-slate-900 mt-1 text-[11px]">Trần Thị Mai</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Vợ • Đã duyệt tạm trú</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold mx-auto flex items-center justify-center text-xs">
                    NA
                  </div>
                  <div className="font-bold text-slate-900 mt-1 text-[11px]">Nguyễn Bảo Nam</div>
                  <div className="text-[10px] text-slate-400">Con trai (Phụ thuộc)</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Khai báo lưu trú trực tuyến kết nối Cổng DVC Bộ Công An.
                </span>
                <button
                  onClick={() => setIsAddRoommateOpen(true)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200/80"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm Người / Khai Báo Tạm Trú</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Hóa Đơn Căn Hộ & Dịch Vụ Tháng 11 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Hóa Đơn Căn Hộ & Dịch Vụ Tháng 11/2026
                  </h3>
                  <div className="text-xs text-slate-500">
                    Mã phiếu thu: #PT-2024-0082 • Kỳ chốt số: 25/10 - 25/11
                  </div>
                </div>
              </div>

              {activeBill?.status === 'PAID' ? (
                <Badge status="PAID" label="ĐÃ THANH TOÁN" />
              ) : (
                <Badge status="UNPAID" label="CHƯA THANH TOÁN (Hạn 05/11)" />
              )}
            </div>

            {/* Split breakdown + VietQR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Cost breakdown items (7 cols) */}
              <div className="md:col-span-7 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Bảng Phân Bổ Chi Phí Tháng 11
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <div>
                    <strong className="text-slate-900">1. Tiền thuê căn hộ P.302</strong>
                  </div>
                  <span className="font-extrabold text-slate-900">8.500.000 ₫</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <div>
                    <strong className="text-slate-900">2. Tiền Điện Sinh Hoạt</strong>
                    <div className="text-[10px] text-slate-400">Số cũ: 1.250 | Mới: 1.375 (125 kWh x 3.500đ)</div>
                  </div>
                  <span className="font-extrabold text-slate-900">437.500 ₫</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <div>
                    <strong className="text-slate-900">3. Tiền Nước Sạch</strong>
                    <div className="text-[10px] text-slate-400">Khối lượng: 14 m³ x 15.000 đ</div>
                  </div>
                  <span className="font-extrabold text-slate-900">210.000 ₫</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <div>
                    <strong className="text-slate-900">4. Phí Quản Lý Dịch Vụ & Rác Thải</strong>
                  </div>
                  <span className="font-extrabold text-slate-900">200.000 ₫</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <div>
                    <strong className="text-slate-900">5. Internet Wi-Fi 6 Mesh 300Mbps</strong>
                  </div>
                  <span className="font-bold text-emerald-600">0 ₫ (Tài trợ trọn gói)</span>
                </div>

                {/* Total amount */}
                <div className="p-3 bg-brand-50/70 border border-brand-100 rounded-2xl mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-brand-700 font-bold uppercase tracking-wider block">
                      TỔNG CỘNG PHẢI TRẢ
                    </span>
                    <span className="text-[11px] text-slate-500">Chín triệu ba trăm bốn mươi bảy nghìn...</span>
                  </div>
                  <div className="text-xl font-black text-brand-700">
                    {formatCurrency(activeBill?.remainingDebt || 9347500)}
                  </div>
                </div>
              </div>

              {/* Dynamic VietQR Snapshot (5 cols) */}
              <div className="md:col-span-5 bg-gradient-to-b from-sky-50 to-slate-50 p-3.5 rounded-2xl border border-sky-100 flex flex-col items-center justify-between text-center">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 mb-1">
                  <span className="text-brand-600 font-black">VietQR</span>
                  <span>•</span>
                  <span>MBBank</span>
                  <span>•</span>
                  <span>Napas247</span>
                </div>

                <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-100 max-w-[150px]">
                  <img src={qrUrl} alt="Mã VietQR Thanh Toán" className="w-full h-auto rounded-lg" />
                </div>

                <div className="mt-2 text-[10px] text-slate-500">
                  STK: <strong className="text-slate-900">09128889999</strong> (MBBank)<br />
                  Chủ TK: <strong className="text-slate-900">BQL SUNSHINE HOMES</strong><br />
                  Cú pháp: <span className="font-mono text-brand-600 font-bold">HD2024089 T11</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => toast.info('In biên lai', 'Đang tải hóa đơn điện tử PDF...')}
              >
                In Biên Lai Điện Tử
              </Button>

              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
                isLoading={isPaying}
                disabled={activeBill?.status === 'PAID'}
                onClick={handleDirectTransferConfirm}
              >
                {activeBill?.status === 'PAID' ? '✓ Đã Thanh Toán Thành Công' : 'Xác Nhận Đã Chuyển Khoản & Tải Bill'}
              </Button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (6 cols) ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 3: Văn Phòng Hợp Đồng Số & AI Summarizer Studio */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Văn Phòng Hợp Đồng Số & AI Summarizer
                  </h3>
                  <div className="text-xs text-slate-500">
                    Chứng thư số điện tử Viettel-CA • Toàn vẹn pháp lý Blockchain
                  </div>
                </div>
              </div>
              <span className="font-mono font-bold text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                MÃ HĐ-2024-089
              </span>
            </div>

            {/* Deposit Held Badge */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">
                    TIỀN CỌC BẢO CHỨNG TÀI KHOẢN LƯU KÝ
                  </div>
                  <div className="text-base font-black text-emerald-900">17.000.000 VNĐ</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-full text-[10px] font-bold">
                ✓ HELD - BẢO HIỂM 100%
              </span>
            </div>

            {/* AI 5 Core Terms List */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <AIBotLogo size="xs" />
                  <span>Trợ Lý AI Tóm Tắt 05 Điều Khoản Cốt Lõi Hợp Đồng</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Trích xuất tự động</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-brand-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Thời hạn thuê:</strong>
                    <span className="text-slate-600 text-[11px] leading-relaxed">
                      Thời hạn 12 tháng liên tục (Bắt đầu 01/01/2024 đến hết 31/12/2026). Ưu tiên tái ký với mức giá ổn định cam kết không tăng quá 5%.
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-brand-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Giá thuê cố định:</strong>
                    <span className="text-slate-600 text-[11px] leading-relaxed">
                      8.500.000 đ/tháng, thanh toán định kỳ từng tháng một (1 tháng/kỳ), không phát sinh bất kỳ khoản phụ phí ẩn nào ngoài biểu niêm yết.
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-brand-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Cam kết hoàn tiền đặt cọc:</strong>
                    <span className="text-slate-600 text-[11px] leading-relaxed">
                      Hoàn trả đúng 17.000.000 đ trong vòng 48h làm việc kể từ thời điểm bàn giao lại hiện trạng không hư hại cấu trúc kỹ thuật.
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-brand-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Kỳ hạn nộp cước dịch vụ:</strong>
                    <span className="text-slate-600 text-[11px] leading-relaxed">
                      Thanh toán cước phí căn hộ, điện lực và nước sạch từ ngày 01 đến 05 hàng tháng trực tiếp qua mã VietQR động đối soát tự động.
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-brand-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    5
                  </span>
                  <div>
                    <strong className="text-slate-900 block">Chấm dứt & Gia hạn thỏa thuận:</strong>
                    <span className="text-slate-600 text-[11px] leading-relaxed">
                      Cần thông báo trước tối thiểu 30 ngày qua tính năng Portal Cư dân hoặc email pháp lý của Ban Quản Trị Tòa Nhà.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer & Actions */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
              <strong>Lưu ý pháp lý:</strong> Bản tóm lược do AI Sunshine tự động phân tích giúp cư dân nắm bắt nhanh. Mọi tranh chấp căn cứ theo Hợp đồng số ký số Viettel-CA ngày 01/01/2024.
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => toast.info('Tải PDF', 'Đang tải file Hợp đồng điện tử ký số (PDF - 4.2 MB)...')}
                className="text-xs font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Tải Hợp Đồng Ký Số (PDF - 4.2 MB)</span>
              </button>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<FileSignature className="w-4 h-4" />}
                onClick={() => setIsRenewModalOpen(true)}
              >
                Gửi Yêu Cầu Gia Hạn HĐ
              </Button>
            </div>
          </div>

          {/* Card 4: Trung Tâm Báo Hỏng & Theo Dõi Kỹ Thuật */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Trung Tâm Báo Hỏng & Theo Dõi Kỹ Thuật
                  </h3>
                  <div className="text-xs text-slate-500">
                    Đội ngũ bảo trì tại chỗ trực 24/7 • Cam kết xử lý nhanh
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                SLA 15-30 PHÚT
              </span>
            </div>

            {/* Active Ticket Tracking */}
            {activeTicket && activeTicket.status === 'IN_PROGRESS' && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-extrabold">
                      ĐANG XỬ LÝ
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      Phiếu #{activeTicket.ticketCode}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Dự kiến xong: 16:30 Hôm nay</span>
                </div>

                <div className="text-xs text-slate-800 font-semibold flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hiện trạng: {activeTicket.issueDescription}</span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeTicket.technicianAvatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80';
                      }}
                      alt="KTV"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{activeTicket.technicianName}</div>
                      <div className="text-[10px] text-slate-500">Trưởng kíp Cơ - Điện • ĐT: {activeTicket.technicianPhone} (★ 4.9/5)</div>
                    </div>
                  </div>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => setIsInspectModalOpen(true)}
                  >
                    Xác Nhận Nghiệm Thu & Đóng Phiếu
                  </Button>
                </div>
              </div>
            )}

            {/* Form Create Ticket (Smart Ticket) */}
            <form onSubmit={handleCreateTicket} className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Gửi Phiếu Báo Sự Cố Mới (Smart Ticket)</span>
              </div>

              {/* Category picker */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { id: 'PLUMBING', label: 'Nước' },
                  { id: 'ELECTRICAL', label: 'Điện' },
                  { id: 'APPLIANCE', label: 'Gia dụng' },
                  { id: 'OTHER', label: 'Khác' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewCategory(cat.id as any)}
                    className={`py-2 rounded-xl border font-bold transition-all ${
                      newCategory === cat.id
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả sự cố (VD: Đèn phòng tắm chớp nháy, vòi xịt vệ sinh rỉ nước...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => toast.info('Chụp ảnh', 'Đã mở camera điện thoại đính kèm ảnh hiện trường sự cố')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Chụp ảnh hiện trường"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      checked={newPriority === 'MEDIUM'}
                      onChange={() => setNewPriority('MEDIUM')}
                    />
                    <span>Bình thường (24h)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-rose-600 font-bold">
                    <input
                      type="radio"
                      name="priority"
                      checked={newPriority === 'URGENT'}
                      onChange={() => setNewPriority('URGENT')}
                    />
                    <span>Khẩn cấp (&lt;30p)</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isReporting}
                  leftIcon={<Wrench className="w-4 h-4" />}
                >
                  Gửi Yêu Cầu Sửa Chữa 🛠
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: EXPLORE SUNSHINE VACANT ROOMS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Khám Phá Căn Hộ Sunshine Trống Sẵn Sàng (UC011 Room Matcher)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Tìm căn hộ mới, giới thiệu người thân hoặc đặt cọc giữ chỗ trực tuyến chỉ 1.000.000 VNĐ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
              ● Còn 08 căn trống trong tháng
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRoomMatcherOpen(true)}
            >
              Xem Tất Cả Danh Mục →
            </Button>
          </div>
        </div>

        {/* 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {apartments.slice(2, 5).map((apt) => (
            <div
              key={apt.id}
              className="bg-slate-50/60 rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-soft-lg transition-all duration-200"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={apt.imageUrl}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80';
                  }}
                  alt={apt.roomNumber}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Badge status={apt.status} />
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-slate-900/80 text-white font-extrabold text-xs rounded-lg">
                  {formatCurrency(apt.price)}/th
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {apt.roomNumber} – {apt.description.slice(0, 32)}...
                </h4>
                <div className="text-xs text-slate-500">
                  Tầng {apt.floor} • {apt.buildingName} • Hướng {apt.viewDirection}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {apt.areaSqm} m² • {apt.bedrooms} PN • {apt.bathrooms} WC
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-brand-700">
                    Giữ chỗ 1.000.000 ₫
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.success('Hẹn lịch xem phòng', `Đã ghi nhận yêu cầu xem phòng ${apt.roomNumber}. Lễ tân sẽ liên hệ trong 15 phút!`);
                    }}
                  >
                    Đặt Lịch Xem
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic VietQR Modal */}
      {activeBill && (
        <VietQRModal
          isOpen={isVietQROpen}
          onClose={() => setIsVietQROpen(false)}
          receivableId={activeBill.id}
          amount={activeBill.remainingDebt}
          roomNumber="P.302"
          tenantName={currentTenant.fullName}
          billMonth={activeBill.billingMonth}
          billYear={activeBill.billingYear}
        />
      )}

      {/* AI Room Matcher Modal */}
      <AIRoomMatcherModal
        isOpen={isRoomMatcherOpen}
        onClose={() => setIsRoomMatcherOpen(false)}
        apartments={apartments}
        onSelectApartment={(apt) => {
          toast.success('Đặt cọc giữ chỗ', `Đã chọn căn hộ ${apt.roomNumber}!`);
        }}
      />

      {/* Modal Renew Contract */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Gửi Yêu Cầu Tái Ký & Gia Hạn Hợp Đồng Thuê (SQ03)"
        subtitle="Ban Quản Lý cam kết giữ nguyên mức giá ưu đãi và tặng gói bảo dưỡng điều hòa miễn phí"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsRenewModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isRenewing}
              onClick={async () => {
                try {
                  await renewContract({
                    contractId: activeContract.id,
                    newEndDate: '2027-12-31',
                  }).unwrap();
                  toast.success('Thành công', 'Đã gửi yêu cầu gia hạn HĐ 12 tháng tới Ban Quản Lý!');
                  setIsRenewModalOpen(false);
                } catch {
                  toast.error('Lỗi', 'Không thể gửi yêu cầu');
                }
              }}
            >
              Xác Nhận Đăng Ký Tái Ký 12 Tháng
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-200 text-sky-900 leading-relaxed">
            Hợp đồng hiện tại: <strong>HĐ-2024-089</strong> (Hạn chót: 31/12/2026). Khi xác nhận, hệ thống sẽ tự động lập dự thảo phụ lục gia hạn thêm 12 tháng đến <strong>31/12/2027</strong> với giá thuê không đổi <strong>8.500.000 ₫/tháng</strong>.
          </div>
        </div>
      </Modal>

      {/* Modal Add Roommate */}
      <Modal
        isOpen={isAddRoommateOpen}
        onClose={() => setIsAddRoommateOpen(false)}
        title="Khai Báo Cư Dân Mới & Đăng Ký Tạm Trú Trực Tuyến"
        subtitle="Hồ sơ được liên kết trực tiếp với VNeID và Cổng Dịch Vụ Công"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsAddRoommateOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isAddingRm}
              onClick={handleAddRoommate}
            >
              Gửi Hồ Sơ Tạm Trú
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddRoommate} className="space-y-4">
          <Input
            label="Họ và tên người ở cùng"
            required
            placeholder="VD: Trần Thị Mai"
            value={rmName}
            onChange={(e) => setRmName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Số CCCD 12 chữ số"
              required
              placeholder="001201008888"
              value={rmCitizenId}
              onChange={(e) => setRmCitizenId(e.target.value)}
            />
            <Input
              label="Số điện thoại"
              placeholder="0913.***.***"
              value={rmPhone}
              onChange={(e) => setRmPhone(e.target.value)}
            />
          </div>

          <Input
            label="Mối quan hệ với chủ hộ"
            placeholder="VD: Vợ / Chồng / Con / Bạn bè"
            value={rmRelation}
            onChange={(e) => setRmRelation(e.target.value)}
          />
        </form>
      </Modal>

      {/* Modal Inspect & 5-Star Rating */}
      <Modal
        isOpen={isInspectModalOpen}
        onClose={() => setIsInspectModalOpen(false)}
        title="Nghiệm Thu Sửa Chữa & Đánh Giá Dịch Vụ 5 Sao"
        subtitle={`Phiếu #${activeTicket?.ticketCode || 'BT-2024-042'} • Kỹ thuật viên: ${activeTicket?.technicianName || 'Lê Văn Thắng'}`}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsInspectModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="success"
              size="sm"
              isLoading={isInspecting}
              onClick={handleInspectTicket}
            >
              Xác Nhận Đã Hoàn Tất & Gửi Đánh Giá
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="text-center py-2">
            <div className="text-xs font-bold text-slate-700 mb-2">
              Bạn có hài lòng với tốc độ & thái độ phục vụ của Kỹ thuật viên?
            </div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-600 mt-1 inline-block">
              {rating === 5 ? 'Tuyệt vời (5/5 sao)' : `${rating}/5 sao`}
            </span>
          </div>

          <Input
            label="Nhận xét hoặc góp ý dịch vụ"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
