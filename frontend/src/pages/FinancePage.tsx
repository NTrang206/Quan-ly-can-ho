import React, { useState } from 'react';
import {
  Receipt,
  QrCode,
  DollarSign,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Printer,
  Calendar,
  CreditCard,
  Building,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { VietQRModal } from '../components/common/VietQRModal';
import {
  useGetReceivablesQuery,
  useGetPaymentsQuery,
  useGetDebtLedgersQuery,
  useGenerateMonthlyReceivablesMutation,
  useRecordPaymentMutation,
} from '../modules/finance/services/financeApi';
import { IReceivable, ReceivableStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../hooks/useToast';

export const FinancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RECEIVABLES' | 'DEBT_LEDGER' | 'PAYMENTS'>('RECEIVABLES');
  const [selectedStatus, setSelectedStatus] = useState<ReceivableStatus | undefined>(undefined);
  const [billingMonth, setBillingMonth] = useState<number>(11);
  const [billingYear, setBillingYear] = useState<number>(2026);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [vietQRReceivable, setVietQRReceivable] = useState<IReceivable | null>(null);
  const [cashPaymentReceivable, setCashPaymentReceivable] = useState<IReceivable | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashNote, setCashNote] = useState('');

  const { data: receivables = [], isLoading: isRecLoading } = useGetReceivablesQuery({
    month: billingMonth,
    year: billingYear,
    status: selectedStatus,
  });

  const { data: debtLedgers = [] } = useGetDebtLedgersQuery();
  const { data: payments = [] } = useGetPaymentsQuery({});

  const [generateMonthly, { isLoading: isGenerating }] = useGenerateMonthlyReceivablesMutation();
  const [recordPayment, { isLoading: isRecording }] = useRecordPaymentMutation();
  const toast = useToast();

  const handleGenerateMonthly = async () => {
    try {
      const res = await generateMonthly({ month: billingMonth, year: billingYear }).unwrap();
      toast.success(
        'Đã phát sinh hóa đơn',
        `Đã sinh tự động ${res.count} hóa đơn định kỳ T${billingMonth}/${billingYear} với tổng phải thu ${formatCurrency(res.totalAmount)}!`
      );
    } catch {
      toast.error('Lỗi', 'Không thể sinh khoản thu lúc này');
    }
  };

  const handleRecordCash = async () => {
    if (!cashPaymentReceivable) return;
    try {
      await recordPayment({
        receivableId: cashPaymentReceivable.id,
        amount: Number(cashAmount),
        paymentMethod: 'CASH',
        note: cashNote || `Thu tiền mặt cước phí căn ${cashPaymentReceivable.roomNumber}`,
      }).unwrap();

      toast.success('Ghi nhận thành công', `Đã xuất phiếu thu tiền mặt cho căn ${cashPaymentReceivable.roomNumber}!`);
      setCashPaymentReceivable(null);
    } catch {
      toast.error('Lỗi', 'Không thể ghi nhận thu tiền mặt');
    }
  };

  const handlePrintReceipt = (paymentId: number) => {
    toast.info('In phiếu thu', `Đang mở trình xem & in biên lai điện tử #${paymentId}...`);
  };

  const filteredReceivables = receivables.filter((r) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        r.tenantName.toLowerCase().includes(q) ||
        r.buildingName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-brand-600 mb-0.5">
            Tài chính & hóa đơn
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Thu Chi, Hóa Đơn & Sổ Nợ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hóa đơn định kỳ hàng tháng, thanh toán VietQR Napas247 và đối soát công nợ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />}
            isLoading={isGenerating}
            onClick={handleGenerateMonthly}
          >
            Sinh Hóa Đơn T{billingMonth}/{billingYear}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('RECEIVABLES')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'RECEIVABLES'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Danh Sách Hóa Đơn Kỳ Thu ({filteredReceivables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DEBT_LEDGER')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'DEBT_LEDGER'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Sổ Theo Dõi Công Nợ Cư Dân ({debtLedgers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'PAYMENTS'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Lịch Sử Phiếu Thu & Giao Dịch ({payments.length})</span>
        </button>
      </div>

      {/* TAB 1: Receivables */}
      {activeTab === 'RECEIVABLES' && (
        <div className="space-y-4">
          {/* Month selector & filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>Kỳ thu:</span>
                <select
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(Number(e.target.value))}
                  className="bg-transparent outline-none cursor-pointer font-extrabold text-brand-700"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <span>/ {billingYear}</span>
              </div>

              {[
                { id: undefined, label: 'Tất cả' },
                { id: 'UNPAID', label: 'Chưa nộp' },
                { id: 'PARTIAL', label: 'Nộp 1 phần' },
                { id: 'PAID', label: 'Đã thanh toán' },
                { id: 'OVERDUE', label: 'Quá hạn nộp' },
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
                placeholder="Tìm phòng, tên khách..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Receivables Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5">Căn Hộ & Khách Thuê</th>
                    <th className="px-5 py-3.5">Tiền Phòng</th>
                    <th className="px-5 py-3.5">Điện / Nước / Dịch Vụ</th>
                    <th className="px-5 py-3.5">Tổng Phải Thu</th>
                    <th className="px-5 py-3.5">Đã Nộp / Còn Nợ</th>
                    <th className="px-5 py-3.5">Trạng Thái & Hạn Nộp</th>
                    <th className="px-5 py-3.5 text-right">Thanh Toán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceivables.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-slate-900 text-sm">{r.roomNumber}</div>
                        <div className="text-[11px] text-slate-500">{r.tenantName} ({r.tenantPhone})</div>
                        <div className="text-[10px] text-slate-400">{r.buildingName}</div>
                      </td>

                      <td className="px-5 py-4 font-bold text-slate-900">
                        {formatCurrency(r.roomAmount)}
                      </td>

                      <td className="px-5 py-4 space-y-0.5 text-[11px]">
                        <div>Điện: <strong>{formatCurrency(r.electricityCost)}</strong> ({r.electricityUsageKwh} kWh)</div>
                        <div>Nước: <strong>{formatCurrency(r.waterCost)}</strong> ({r.waterUsageM3} m³)</div>
                        <div className="text-slate-400">QL: {formatCurrency(r.managementCost)}</div>
                      </td>

                      <td className="px-5 py-4 font-extrabold text-brand-700 text-sm">
                        {formatCurrency(r.totalAmount)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-emerald-600 font-bold">
                          Đã nộp: {formatCurrency(r.paidAmount)}
                        </div>
                        {r.remainingDebt > 0 && (
                          <div className="text-rose-600 font-bold text-[11px] mt-0.5">
                            Còn nợ: {formatCurrency(r.remainingDebt)}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 space-y-1">
                        <Badge status={r.status} />
                        <div className="text-[10px] text-slate-400">Hạn nộp: {formatDate(r.dueDate)}</div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {r.remainingDebt > 0 && (
                            <>
                              <button
                                onClick={() => setVietQRReceivable(r)}
                                className="flex items-center gap-1 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                                title="Mở mã VietQR động"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>VietQR</span>
                              </button>

                              <button
                                onClick={() => {
                                  setCashPaymentReceivable(r);
                                  setCashAmount(r.remainingDebt);
                                }}
                                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs"
                                title="Ghi nhận nộp tiền mặt"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Thu Tiền Mặt</span>
                              </button>
                            </>
                          )}

                          {r.status === 'PAID' && (
                            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Đã hoàn tất
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Debt Ledger */}
      {activeTab === 'DEBT_LEDGER' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Cư Dân & Căn Hộ</th>
                  <th className="px-5 py-3.5">Tổng Lũy Kế Phải Thu</th>
                  <th className="px-5 py-3.5">Tổng Lũy Kế Đã Nộp</th>
                  <th className="px-5 py-3.5">Số Dư Nợ Hiện Tại</th>
                  <th className="px-5 py-3.5">Tình Trạng Nợ</th>
                  <th className="px-5 py-3.5 text-right">Cập Nhật Gần Nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {debtLedgers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{d.tenantName}</div>
                      <div className="text-[11px] text-slate-500">{d.roomNumber} • {d.buildingName}</div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{formatCurrency(d.totalReceivable)}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">{formatCurrency(d.totalPaid)}</td>
                    <td className="px-5 py-4 font-black text-sm">
                      <span className={d.currentDebt > 0 ? 'text-rose-600' : 'text-slate-900'}>
                        {formatCurrency(d.currentDebt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {d.currentDebt > 0 ? (
                        <Badge status="OVERDUE" label="Còn dư nợ" />
                      ) : (
                        <Badge status="PAID" label="Tuyệt đối tốt" />
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-400">{formatDate(d.lastUpdated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Payment Transactions */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Mã Phiếu Thu</th>
                  <th className="px-5 py-3.5">Người Nộp & Phòng</th>
                  <th className="px-5 py-3.5">Số Tiền Nộp</th>
                  <th className="px-5 py-3.5">Phương Thức</th>
                  <th className="px-5 py-3.5">Mã Giao Dịch</th>
                  <th className="px-5 py-3.5">Thời Điểm</th>
                  <th className="px-5 py-3.5 text-right">Biên Lai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-brand-700">{p.receiptNumber}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{p.payerName}</div>
                      <div className="text-[11px] text-slate-500">{p.roomNumber}</div>
                    </td>
                    <td className="px-5 py-4 font-black text-emerald-600 text-sm">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
                        {p.paymentMethod === 'BANK_TRANSFER' ? 'VietQR / CK' : 'Tiền Mặt'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-slate-500">{p.transactionCode}</td>
                    <td className="px-5 py-4 text-slate-500">{p.paymentDate}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handlePrintReceipt(p.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="In biên lai thu tiền"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VietQR Dynamic Modal */}
      {vietQRReceivable && (
        <VietQRModal
          isOpen={!!vietQRReceivable}
          onClose={() => setVietQRReceivable(null)}
          receivableId={vietQRReceivable.id}
          amount={vietQRReceivable.remainingDebt}
          roomNumber={vietQRReceivable.roomNumber}
          tenantName={vietQRReceivable.tenantName}
          billMonth={vietQRReceivable.billingMonth}
          billYear={vietQRReceivable.billingYear}
        />
      )}

      {/* Cash Payment Modal */}
      {cashPaymentReceivable && (
        <Modal
          isOpen={!!cashPaymentReceivable}
          onClose={() => setCashPaymentReceivable(null)}
          title="Ghi Nhận Thu Tiền Mặt Trực Tiếp"
          subtitle={`Hóa đơn căn ${cashPaymentReceivable.roomNumber} • ${cashPaymentReceivable.tenantName}`}
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCashPaymentReceivable(null)}>
                Hủy
              </Button>
              <Button
                variant="success"
                size="sm"
                isLoading={isRecording}
                onClick={handleRecordCash}
              >
                Xác Nhận Thu Tiền & Xuất Phiếu Thu
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center">
              <span className="text-slate-500">Số dư nợ còn lại:</span>
              <strong className="text-brand-700 text-sm">
                {formatCurrency(cashPaymentReceivable.remainingDebt)}
              </strong>
            </div>

            <Input
              label="Số tiền khách nộp thực tế (VNĐ)"
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(Number(e.target.value))}
            />

            <Input
              label="Ghi chú nội dung nộp tiền"
              placeholder="VD: Cư dân nộp trực tiếp tại quầy lễ tân"
              value={cashNote}
              onChange={(e) => setCashNote(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
