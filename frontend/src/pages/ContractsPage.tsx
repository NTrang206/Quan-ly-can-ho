import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileSignature,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  RotateCcw,
  Ban,
  Download,
  Search,
  Eye,
  FileText,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { AISummarizerModal } from '../components/ai/AISummarizerModal';
import {
  useGetContractsQuery,
  useCreateContractMutation,
  useApproveAndActivateContractMutation,
  useRenewContractMutation,
  useTerminateAndSettleContractMutation,
} from '../modules/contracts/services/contractApi';
import { useGetApartmentsQuery } from '../modules/buildings/services/buildingApi';
import { IContract, ContractStatus } from '../types';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils/formatters';
import { useToast } from '../hooks/useToast';

export const ContractsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedStatus, setSelectedStatus] = useState<ContractStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected contract for modals
  const [summarizerContract, setSummarizerContract] = useState<IContract | null>(null);
  const [renewContractData, setRenewContractData] = useState<IContract | null>(null);
  const [terminateContractData, setTerminateContractData] = useState<IContract | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Contract Form State
  const [aptId, setAptId] = useState<number>(1);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantCitizenId, setTenantCitizenId] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [rentalPrice, setRentalPrice] = useState<number>(8500000);
  const [depositAmount, setDepositAmount] = useState<number>(17000000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Renew Form State
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newPrice, setNewPrice] = useState<number>(8500000);

  // Terminate & Settle Form State
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState('Nghiệm thu bàn giao phòng nguyên vẹn');

  const { data: contracts = [], isLoading } = useGetContractsQuery({ status: selectedStatus });
  const { data: apartments = [] } = useGetApartmentsQuery({});

  const [createContract, { isLoading: isCreating }] = useCreateContractMutation();
  const [approveContract, { isLoading: isApproving }] = useApproveAndActivateContractMutation();
  const [renewContract, { isLoading: isRenewing }] = useRenewContractMutation();
  const [terminateContract, { isLoading: isTerminating }] = useTerminateAndSettleContractMutation();

  const toast = useToast();

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreateModalOpen(true);
      const paramAptId = searchParams.get('aptId');
      if (paramAptId) {
        setAptId(Number(paramAptId));
        const found = apartments.find((a) => a.id === Number(paramAptId));
        if (found) {
          setRentalPrice(found.price);
          setDepositAmount(found.depositDefault || found.price * 2);
        }
      }
    }
  }, [searchParams, apartments]);

  const filteredContracts = contracts.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.contractCode.toLowerCase().includes(q) ||
        c.tenantName.toLowerCase().includes(q) ||
        c.roomNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedApt = apartments.find((a) => a.id === Number(aptId));
    try {
      await createContract({
        apartmentId: Number(aptId),
        roomNumber: selectedApt?.roomNumber || 'P.---',
        buildingName: selectedApt?.buildingName || 'Sunshine Tower A',
        tenantName,
        tenantPhone,
        tenantCitizenId,
        tenantEmail,
        rentalPrice: Number(rentalPrice),
        depositAmount: Number(depositAmount),
        startDate,
        endDate,
      }).unwrap();

      toast.success('Thành công', 'Đã khởi tạo hợp đồng dự thảo và trích xuất 5 điều khoản AI!');
      setIsCreateModalOpen(false);
    } catch {
      toast.error('Lỗi', 'Không thể tạo hợp đồng lúc này');
    }
  };

  const handleApprove = async (contract: IContract) => {
    try {
      await approveContract({ contractId: contract.id }).unwrap();
      toast.success(
        'Đã duyệt hợp đồng',
        `Kích hoạt HĐ ${contract.contractCode} thành công! Tiền cọc đã ghi nhận lưu ký (HELD) và phòng chuyển sang OCCUPIED.`
      );
    } catch {
      toast.error('Lỗi', 'Không thể phê duyệt hợp đồng');
    }
  };

  const handleRenew = async () => {
    if (!renewContractData) return;
    try {
      await renewContract({
        contractId: renewContractData.id,
        newEndDate,
        newPrice: Number(newPrice),
      }).unwrap();
      toast.success('Gia hạn thành công', `Hợp đồng ${renewContractData.contractCode} đã được gia hạn đến ${formatDate(newEndDate)}!`);
      setRenewContractData(null);
    } catch {
      toast.error('Lỗi', 'Không thể gia hạn hợp đồng');
    }
  };

  const handleTerminate = async () => {
    if (!terminateContractData) return;
    try {
      const res = await terminateContract({
        contractId: terminateContractData.id,
        deductionAmount: Number(deductionAmount),
        deductionReason,
      }).unwrap();
      toast.success(
        'Thanh lý hoàn tất',
        `Hợp đồng đã thanh lý. Số tiền cọc hoàn trả thực tế cho khách: ${formatCurrency(res.refundAmount)}!`
      );
      setTerminateContractData(null);
    } catch {
      toast.error('Lỗi', 'Không thể thanh lý hợp đồng');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-brand-600 mb-0.5">
            Quản lý hợp đồng & pháp lý
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Hợp Đồng Cho Thuê
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý dự thảo, duyệt ký hợp đồng, bảo lưu tiền cọc và quyết toán thanh lý.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Tạo Hợp Đồng Mới
        </Button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">HĐ đang hiệu lực</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">
            {contracts.filter((c) => c.status === 'ACTIVE').length} <span className="text-xs font-normal text-slate-400">hợp đồng</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tỷ lệ lấp đầy: 94.2%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Bản nháp chờ duyệt</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
            {contracts.filter((c) => c.status === 'DRAFT').length} <span className="text-xs font-normal text-slate-400">bản nháp</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Chờ ký điện tử E-Sign</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Sắp hết hạn (≤ 30 ngày)</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-1">
            3 <span className="text-xs font-normal text-rose-500">cần gia hạn</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Kích hoạt thông báo SQ03</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Tổng tiền cọc bảo lưu</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">84.5 Tr <span className="text-xs font-normal text-slate-400">VNĐ</span></div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Ký quỹ Techcombank & MBBank</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: undefined, label: 'Tất cả (18)' },
            { id: 'ACTIVE', label: 'Đang hiệu lực (14)' },
            { id: 'DRAFT', label: 'Chờ kích hoạt (2)' },
            { id: 'RENEWED', label: 'Đã gia hạn' },
            { id: 'TERMINATED', label: 'Đã thanh lý' },
          ].map((st) => (
            <button
              key={st.label}
              onClick={() => setSelectedStatus(st.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === st.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã HĐ, tên khách, số phòng..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Contracts Table View */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Mã Hợp Đồng</th>
                <th className="px-5 py-3.5">Căn Hộ</th>
                <th className="px-5 py-3.5">Khách Thuê Đại Diện</th>
                <th className="px-5 py-3.5">Thời Hạn Thuê</th>
                <th className="px-5 py-3.5">Giá Thuê & Tiền Cọc</th>
                <th className="px-5 py-3.5">Trạng Thái</th>
                <th className="px-5 py-3.5 text-right">Thao Tác & AI Studio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c) => {
                const daysLeft = getDaysRemaining(c.endDate);
                const isExpiringSoon = c.status === 'ACTIVE' && daysLeft <= 30 && daysLeft >= 0;

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-brand-700">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.contractCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        Ký ngày: {formatDate(c.createdAt)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900 text-sm">{c.roomNumber}</div>
                      <div className="text-[11px] text-slate-500">{c.buildingName}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{c.tenantName}</div>
                      <div className="text-[11px] text-slate-500">{c.tenantPhone}</div>
                      <div className="text-[10px] text-slate-400">CCCD: {c.tenantCitizenId}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">
                        {formatDate(c.startDate)} → {formatDate(c.endDate)}
                      </div>
                      {isExpiringSoon && (
                        <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200">
                          ⏱ Còn {daysLeft} ngày - Cần gia hạn
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-brand-700 text-xs">
                        {formatCurrency(c.rentalPrice)}/th
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cọc: <strong className="text-slate-700">{formatCurrency(c.depositAmount)}</strong>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Badge status={c.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* AI Summarizer Trigger Button */}
                        <button
                          onClick={() => setSummarizerContract(c)}
                          className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                          title="Trích xuất 5 điều khoản pháp lý cốt lõi bằng AI"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Tóm Tắt 5 ĐK</span>
                        </button>

                        {/* Approval for DRAFT */}
                        {c.status === 'DRAFT' && (
                          <button
                            onClick={() => handleApprove(c)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            title="Quản lý phê duyệt & thu cọc"
                          >
                            Duyệt HĐ
                          </button>
                        )}

                        {/* Renew SQ03 */}
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setRenewContractData(c);
                              setNewPrice(c.rentalPrice);
                            }}
                            className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            title="Gia hạn hợp đồng (SQ03)"
                          >
                            Gia Hạn (SQ03)
                          </button>
                        )}

                        {/* Terminate SQ04 */}
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => {
                              setTerminateContractData(c);
                              setDeductionAmount(0);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            title="Thanh lý hợp đồng & Quyết toán cọc (SQ04)"
                          >
                            Thanh Lý (SQ04)
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Summarizer Modal (5 Core Terms) */}
      {summarizerContract && (
        <AISummarizerModal
          isOpen={!!summarizerContract}
          onClose={() => setSummarizerContract(null)}
          contract={summarizerContract}
        />
      )}

      {/* Modal Create Contract */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
        title="Lập Hợp Đồng Thuê Căn Hộ & Thu Cọc Giữ Chỗ"
        subtitle="Hệ thống tự động kiểm tra trùng lịch và kích hoạt AI trích xuất 5 điều khoản pháp lý"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isCreating}
              onClick={handleCreateContract}
            >
              Tạo Bản Thảo HĐ & Phân Tích AI
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateContract} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Chọn Căn hộ cần lập Hợp đồng"
              value={aptId}
              onChange={(e) => {
                setAptId(Number(e.target.value));
                const apt = apartments.find((a) => a.id === Number(e.target.value));
                if (apt) {
                  setRentalPrice(apt.price);
                  setDepositAmount(apt.depositDefault || apt.price * 2);
                }
              }}
              options={apartments.map((a) => ({
                label: `${a.roomNumber} - ${a.buildingName} (${a.status}) - ${formatCurrency(a.price)}`,
                value: a.id,
              }))}
            />

            <Input
              label="Họ tên Khách thuê đại diện"
              required
              placeholder="VD: Lê Hoàng Nam"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Số CCCD 12 chữ số"
              required
              placeholder="VD: 001201004455"
              value={tenantCitizenId}
              onChange={(e) => setTenantCitizenId(e.target.value)}
            />
            <Input
              label="Số điện thoại liên hệ"
              required
              placeholder="0912.***.***"
              value={tenantPhone}
              onChange={(e) => setTenantPhone(e.target.value)}
            />
            <Input
              label="Email nhận thông báo"
              type="email"
              placeholder="customer@email.com"
              value={tenantEmail}
              onChange={(e) => setTenantEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Giá thuê thỏa thuận (VNĐ/tháng)"
              type="number"
              required
              value={rentalPrice}
              onChange={(e) => setRentalPrice(Number(e.target.value))}
            />
            <Input
              label="Số tiền cọc thỏa thuận (VNĐ)"
              type="number"
              required
              value={depositAmount}
              onChange={(e) => setDepositAmount(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ngày bắt đầu hiệu lực"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Ngày kết thúc hợp đồng"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Renew Contract SQ03 */}
      {renewContractData && (
        <Modal
          isOpen={!!renewContractData}
          onClose={() => setRenewContractData(null)}
          title={`Gia Hạn Hợp Đồng ${renewContractData.contractCode} (SQ03)`}
          subtitle={`Căn ${renewContractData.roomNumber} • Khách thuê: ${renewContractData.tenantName}`}
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setRenewContractData(null)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isRenewing}
                onClick={handleRenew}
              >
                Xác Nhận Gia Hạn Hợp Đồng
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900">
              Quy trình gia hạn SQ03: Kế thừa toàn bộ thông tin tiền cọc đang lưu ký ({formatCurrency(renewContractData.depositAmount)}) và cập nhật chu kỳ hiệu lực mới.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ngày kết thúc hợp đồng mới"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
              <Input
                label="Giá thuê áp dụng cho chu kỳ mới (VNĐ)"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Terminate & Settle Deposit SQ04 */}
      {terminateContractData && (
        <Modal
          isOpen={!!terminateContractData}
          onClose={() => setTerminateContractData(null)}
          title={`Thanh Lý HĐ & Quyết Toán Tiền Cọc (SQ04)`}
          subtitle={`HĐ ${terminateContractData.contractCode} • Căn ${terminateContractData.roomNumber}`}
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setTerminateContractData(null)}>
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isTerminating}
                onClick={handleTerminate}
              >
                Chốt Biên Bản & Quyết Toán Cọc
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Tiền cọc ban đầu đang lưu ký:</span>
                <strong className="text-slate-900">{formatCurrency(terminateContractData.depositAmount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền đề xuất khấu trừ hư hại:</span>
                <strong className="text-rose-600">- {formatCurrency(deductionAmount)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span className="text-slate-900">Số tiền cọc thực tế hoàn trả:</span>
                <span className="text-emerald-600">
                  {formatCurrency(Math.max(0, terminateContractData.depositAmount - deductionAmount))}
                </span>
              </div>
            </div>

            <Input
              label="Số tiền khấu trừ hư hại / vi phạm (VNĐ)"
              type="number"
              value={deductionAmount}
              onChange={(e) => setDeductionAmount(Number(e.target.value))}
            />

            <Input
              label="Lý do chi tiết theo biên bản kiểm kê nghiệm thu bàn giao"
              value={deductionReason}
              onChange={(e) => setDeductionReason(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
