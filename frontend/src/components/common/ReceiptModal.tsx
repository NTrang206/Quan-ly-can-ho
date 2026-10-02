import React, { useRef } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  Building,
  ShieldCheck,
  Calendar,
  CreditCard,
  QrCode,
  FileText,
  User,
  Phone,
  Hash,
} from 'lucide-react';
import { IPayment, IReceivable, IContract, ITenant, IApartment } from '../../types';
import { formatCurrency, formatDate, numberToVietnameseWords } from '../../utils/formatters';
import { DwellLogo } from './DwellLogo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: IPayment | null;
  receivable?: IReceivable | null;
  contract?: IContract | null;
  tenant?: ITenant | null;
  apartment?: IApartment | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  receivable,
  contract,
  tenant,
  apartment,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  // Determine display values
  const payerDisplayName =
    payment.payerName && payment.payerName !== 'Cư dân'
      ? payment.payerName
      : receivable?.tenantName || tenant?.fullName || contract?.tenantName || 'Cư dân Dwell';

  const roomDisplayName =
    payment.roomNumber || receivable?.roomNumber || apartment?.roomNumber || contract?.roomNumber || 'P101';

  const buildingDisplayName =
    receivable?.buildingName || apartment?.buildingName || contract?.buildingName || 'Tòa Nhà Căn Hộ Dwell';

  const citizenId = tenant?.citizenId || contract?.tenantCitizenId || '079095012345';
  const phone = tenant?.phone || contract?.tenantPhone || receivable?.tenantPhone || '0908 123 456';
  const billMonth = receivable?.billingMonth || new Date(payment.paymentDate || Date.now()).getMonth() + 1;
  const billYear = receivable?.billingYear || new Date(payment.paymentDate || Date.now()).getFullYear();
  const paymentMethodLabel =
    payment.paymentMethod === 'BANK_TRANSFER'
      ? 'Chuyển khoản liên ngân hàng (VietQR / Napas247)'
      : 'Tiền mặt tại quầy ban quản lý';

  const accountantName = payment.handledByName || 'Hoàng Khánh Ly';
  const formattedWords = numberToVietnameseWords(payment.amount);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Xem Trước & In Biên Lai Thu Tiền
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã xác nhận
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Mã chứng từ: <span className="font-mono text-brand-300 font-bold">{payment.receiptNumber}</span> • {payment.transactionCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all transform active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Biên Lai (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-4 sm:p-8 bg-slate-100/60 overflow-y-auto max-h-[82vh]">
          <div
            id="dwell-printable-receipt"
            ref={receiptRef}
            className="bg-white mx-auto max-w-[780px] p-8 sm:p-10 rounded-xl shadow-md border border-slate-200 text-slate-800 font-sans print:shadow-none print:border-none print:p-0 print:m-0"
          >
            {/* Header: Company Info & Receipt Metadata */}
            <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-900/10 gap-6">
              <div className="space-y-1">
                <DwellLogo size="md" subtitle1="Quản lý căn hộ cho thuê thông minh" showSubtitles={false} />
                <div className="pt-2 text-[12px] text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-900 uppercase">
                    CÔNG TY TNHH QUẢN LÝ TÒA NHÀ DWELL LIVING
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Địa chỉ:</span> Tòa nhà Dwell Tower, Quận 7, TP. Hồ Chí Minh
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Hotline:</span> 1900 8888 • <span className="font-medium text-slate-700">Email:</span> billing@dwell.vn
                  </p>
                  <p>
                    <span className="font-medium text-slate-700">Mã số thuế:</span> 0317899688
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-none border-slate-200 w-full sm:w-auto">
                <div className="font-mono text-[11px] text-slate-500">Mẫu số: 01GTKT-001</div>
                <div className="font-mono text-[11px] text-slate-500">Ký hiệu: DW/26E</div>
                <div className="text-sm font-bold text-slate-900">
                  Số phiếu: <span className="font-mono text-brand-700">{payment.receiptNumber}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Ngày thu: <span className="font-semibold text-slate-800">{formatDate(payment.paymentDate)}</span>
                </div>
              </div>
            </div>

            {/* Receipt Title */}
            <div className="text-center my-6 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                BIÊN LAI THU TIỀN ĐIỆN TỬ
              </h1>
              <p className="text-xs text-slate-500 italic">
                (Bản thể hiện điện tử theo Nghị định 123/2020/NĐ-CP của Chính phủ)
              </p>
            </div>

            {/* Payer & Room Information Grid */}
            <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/80 text-xs sm:text-[13px] space-y-2.5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                <div>
                  <span className="text-slate-500">Người nộp tiền:</span>{' '}
                  <strong className="text-slate-900 font-bold">{payerDisplayName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Số CCCD / Hộ chiếu:</span>{' '}
                  <span className="font-mono font-medium text-slate-800">{citizenId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Căn hộ / Phòng:</span>{' '}
                  <strong className="text-brand-700 font-extrabold">{roomDisplayName}</strong>{' '}
                  <span className="text-slate-500">({buildingDisplayName})</span>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>{' '}
                  <span className="font-mono text-slate-800">{phone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Kỳ thanh toán:</span>{' '}
                  <strong className="text-slate-900">Tháng {billMonth}/{billYear}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Mã giao dịch:</span>{' '}
                  <span className="font-mono text-slate-800">{payment.transactionCode}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/70">
                <span className="text-slate-500">Hình thức thanh toán:</span>{' '}
                <span className="font-medium text-slate-800">{paymentMethodLabel}</span>
              </div>
              <div>
                <span className="text-slate-500">Nội dung nộp:</span>{' '}
                <span className="font-medium text-slate-900 italic">
                  {payment.note || `Thanh toán tiền thuê căn hộ ${roomDisplayName} và phí dịch vụ tháng ${billMonth}/${billYear}`}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mb-6 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">STT</th>
                    <th className="py-2.5 px-4">Nội Dung Khoản Thu</th>
                    <th className="py-2.5 px-3 text-center">Số lượng / Chỉ số</th>
                    <th className="py-2.5 px-4 text-right">Thành Tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-[13px]">
                  {receivable ? (
                    <>
                      <tr>
                        <td className="py-2 px-3 text-center text-slate-500">1</td>
                        <td className="py-2 px-4 font-medium text-slate-900">
                          Tiền thuê căn hộ {roomDisplayName} (Tháng {billMonth}/{billYear})
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500">1 tháng</td>
                        <td className="py-2 px-4 text-right font-semibold text-slate-900">
                          {formatCurrency(receivable.roomAmount)}
                        </td>
                      </tr>
                      {receivable.electricityCost > 0 && (
                        <tr>
                          <td className="py-2 px-3 text-center text-slate-500">2</td>
                          <td className="py-2 px-4 text-slate-700">
                            Tiền điện sinh hoạt
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">
                            {receivable.electricityUsageKwh} kWh
                          </td>
                          <td className="py-2 px-4 text-right font-semibold text-slate-900">
                            {formatCurrency(receivable.electricityCost)}
                          </td>
                        </tr>
                      )}
                      {receivable.waterCost > 0 && (
                        <tr>
                          <td className="py-2 px-3 text-center text-slate-500">3</td>
                          <td className="py-2 px-4 text-slate-700">
                            Tiền nước sinh hoạt
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">
                            {receivable.waterUsageM3} m³
                          </td>
                          <td className="py-2 px-4 text-right font-semibold text-slate-900">
                            {formatCurrency(receivable.waterCost)}
                          </td>
                        </tr>
                      )}
                      {receivable.managementCost > 0 && (
                        <tr>
                          <td className="py-2 px-3 text-center text-slate-500">4</td>
                          <td className="py-2 px-4 text-slate-700">
                            Phí quản lý & dịch vụ vận hành
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500">Tiêu chuẩn</td>
                          <td className="py-2 px-4 text-right font-semibold text-slate-900">
                            {formatCurrency(receivable.managementCost)}
                          </td>
                        </tr>
                      )}
                      {(receivable.parkingCost > 0 || receivable.internetCost > 0) && (
                        <tr>
                          <td className="py-2 px-3 text-center text-slate-500">5</td>
                          <td className="py-2 px-4 text-slate-700">
                            Phí giữ xe & Internet cáp quang
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500">Gói căn hộ</td>
                          <td className="py-2 px-4 text-right font-semibold text-slate-900">
                            {formatCurrency((receivable.parkingCost || 0) + (receivable.internetCost || 0))}
                          </td>
                        </tr>
                      )}
                    </>
                  ) : (
                    <tr>
                      <td className="py-3 px-3 text-center text-slate-500">1</td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {payment.note || `Thanh toán cước tiền phòng & dịch vụ căn ${roomDisplayName}`}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">1 gói</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold text-xs sm:text-sm">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 text-right uppercase text-slate-800 font-extrabold">
                      Tổng Tiền Thực Thu (Đã bao gồm VAT):
                    </td>
                    <td className="py-3 px-4 text-right text-base sm:text-lg font-black text-emerald-700">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Total Amount in Words */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl mb-8 text-xs sm:text-[13px]">
              <span className="font-semibold text-emerald-950">Số tiền viết bằng chữ:</span>{' '}
              <span className="font-bold text-emerald-800 italic">{formattedWords}</span>
            </div>

            {/* Signature & Seal Block */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs pt-4 mb-6">
              {/* Payer Signature */}
              <div className="flex flex-col justify-between h-40">
                <div>
                  <p className="font-bold text-slate-900 uppercase">Người Nộp Tiền</p>
                  <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="font-bold text-slate-800 pt-16">{payerDisplayName}</div>
              </div>

              {/* Accountant Signature */}
              <div className="flex flex-col justify-between h-40">
                <div>
                  <p className="font-bold text-slate-900 uppercase">Người Lập Phiếu / Kế Toán</p>
                  <p className="text-[11px] text-slate-500 italic">(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="font-bold text-slate-800 pt-16">{accountantName}</div>
              </div>

              {/* Company Seal Box */}
              <div className="flex flex-col justify-between h-40 relative">
                <div>
                  <p className="font-bold text-slate-900 uppercase">Đơn Vị Thu Tiền (Dwell)</p>
                  <p className="text-[11px] text-slate-500 italic">(Ký số & Đóng dấu điện tử)</p>
                </div>

                {/* Digital Red Stamp SVG */}
                <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center pointer-events-none select-none">
                  <div className="w-28 h-28 border-2 border-red-600 rounded-full flex flex-col items-center justify-center text-red-600 p-1 rotate-[-4deg] opacity-90 shadow-xs relative bg-red-50/20">
                    <div className="w-24 h-24 border border-red-500 rounded-full flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[7.5px] font-extrabold uppercase leading-tight tracking-tighter">
                        CÔNG TY TNHH QUẢN LÝ
                      </span>
                      <span className="text-[7.5px] font-extrabold uppercase leading-tight tracking-tighter">
                        TÒA NHÀ DWELL
                      </span>
                      <div className="my-0.5 text-red-600 flex items-center gap-0.5 text-[8px]">
                        ★ <span className="font-black text-[9px] tracking-wider">ĐÃ THU TIỀN</span> ★
                      </div>
                      <span className="text-[7px] font-semibold">TP. HỒ CHÍ MINH</span>
                      <span className="text-[6.5px] font-mono text-red-500">
                        {payment.paymentDate.split(' ')[0] || '2026-10-02'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-red-700 font-bold pt-16 z-10">
                  Chứng thực điện tử hợp lệ
                </div>
              </div>
            </div>

            {/* Bottom Verification & Legal Notice */}
            <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-700 shrink-0">
                  <QrCode className="w-8 h-8" />
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="font-semibold text-slate-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Biên lai điện tử có giá trị pháp lý
                  </div>
                  <div>Tra cứu biên lai tại: <span className="font-mono text-brand-700 underline">https://dwell.vn/tra-cuu</span></div>
                  <div>Mã xác thực: <span className="font-mono font-bold text-slate-800">{payment.transactionCode}</span></div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-400 max-w-[280px]">
                Theo Nghị định 123/2020/NĐ-CP & Thông tư 78/2021/TT-BTC của Bộ Tài chính. Hệ thống Quản trị Căn hộ Dwell.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Footer (Hidden when printing) */}
        <div className="no-print bg-slate-50 px-6 py-3.5 flex items-center justify-between border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Mẹo: Bạn có thể nhấn <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded font-mono text-[10px] font-bold">Ctrl + P</kbd> hoặc nút In để lưu thành file PDF hoặc in trực tiếp ra máy in.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
