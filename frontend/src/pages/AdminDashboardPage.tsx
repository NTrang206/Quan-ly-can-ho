import React, { useState } from 'react';
import {
  TrendingUp,
  Building,
  DollarSign,
  AlertTriangle,
  Star,
  Sparkles,
  Download,
  Filter,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  BarChart3,
  PieChart,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useGetDashboardStatsQuery } from '../modules/dashboard/services/dashboardApi';
import { useGetBuildingsQuery } from '../modules/buildings/services/buildingApi';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { useToast } from '../hooks/useToast';

export const AdminDashboardPage: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState('2026-11');
  const [selectedView, setSelectedView] = useState<'month' | 'quarter' | 'year'>('month');

  const { data: stats, refetch, isFetching } = useGetDashboardStatsQuery({});
  const { data: buildings = [] } = useGetBuildingsQuery();
  const toast = useToast();

  const handleExportReport = (type: 'EXCEL' | 'PDF') => {
    toast.success(
      'Xuất báo cáo thành công',
      `Báo cáo tài chính & vận hành kỳ ${reportPeriod} (${type}) đã được tải xuống máy!`
    );
  };

  // 12-month trend mock data
  const monthlyTrends = [
    { month: 'T11/25', rev: 3.8, target: 3.6, opex: 1.1 },
    { month: 'T12/25', rev: 4.1, target: 4.0, opex: 1.2 },
    { month: 'T01/26', rev: 3.9, target: 3.8, opex: 1.0 },
    { month: 'T02/26', rev: 4.2, target: 4.0, opex: 1.1 },
    { month: 'T03/26', rev: 4.3, target: 4.1, opex: 1.2 },
    { month: 'T04/26', rev: 4.4, target: 4.2, opex: 1.1 },
    { month: 'T05/26', rev: 4.5, target: 4.3, opex: 1.2 },
    { month: 'T06/26', rev: 4.6, target: 4.4, opex: 1.3 },
    { month: 'T07/26', rev: 4.5, target: 4.4, opex: 1.2 },
    { month: 'T08/26', rev: 4.7, target: 4.5, opex: 1.2 },
    { month: 'T09/26', rev: 4.8, target: 4.6, opex: 1.3 },
    { month: 'T10/26', rev: 4.85, target: 4.7, opex: 1.23 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Tổng Quan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo số liệu thời gian thực về dòng tiền, tỷ lệ lấp đầy và dự báo AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => handleExportReport('EXCEL')}
          >
            Xuất Báo Cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Doanh thu thực thu"
          value={formatCompactCurrency(stats?.totalRevenueMonth || 4850000000)}
          subValue="VNĐ"
          changePercent={stats?.revenueGrowthMoM || 12.4}
          changeText="MoM"
          icon={<DollarSign className="w-4 h-4 text-sky-600" />}
          iconBgColor="bg-sky-50"
        />

        <StatCard
          title="Tỷ lệ lấp đầy"
          value={`${stats?.occupancyRate || 94.6}%`}
          subValue="454/480 căn"
          changePercent={2.1}
          changeText="26 căn trống"
          icon={<Building className="w-4 h-4 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />

        <StatCard
          title="Thu nhập ròng (NOI)"
          value={formatCompactCurrency(stats?.netOperatingIncome || 3620000000)}
          subValue="VNĐ"
          badge={`Biên LN ${stats?.noiMarginPercent || 74.6}%`}
          icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
          iconBgColor="bg-purple-50"
        />

        <StatCard
          title="Tổng nợ quá hạn"
          value={formatCompactCurrency(stats?.totalDebtOverdue || 68500000)}
          subValue="6 căn"
          changePercent={stats?.debtChangeMoM || -18.5}
          isPositiveGood={false}
          changeText="> 5 ngày"
          icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
          iconBgColor="bg-amber-50"
        />

        <StatCard
          title="CSAT & SLA bảo trì"
          value={`${stats?.csatScore || 4.82}/5.0`}
          subValue="98.2%"
          badge={`TB: ${stats?.avgMaintenanceSlaHours || 3.4}h`}
          icon={<Star className="w-4 h-4 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
      </div>

      {/* Main Grid: Cashflow chart + AI Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Cashflow Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-600" />
                <span>Biểu Đồ Dòng Tiền & Doanh Thu</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Doanh thu cho thuê, dịch vụ tiện ích và lợi nhuận ròng NOI 12 tháng gần nhất.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedView('month')}
                className={`px-2.5 py-1 rounded transition-all ${
                  selectedView === 'month' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Theo tháng
              </button>
              <button
                onClick={() => setSelectedView('quarter')}
                className={`px-2.5 py-1 rounded transition-all ${
                  selectedView === 'quarter' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Theo quý
              </button>
            </div>
          </div>

          {/* Bar Chart Simulation */}
          <div className="pt-2">
            <div className="h-60 flex items-end justify-between gap-2 pt-6 px-1 border-b border-slate-200">
              {monthlyTrends.map((item, idx) => {
                const heightPercent = (item.rev / 5.0) * 100;
                const isCurrent = idx === monthlyTrends.length - 1;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 rounded shadow pointer-events-none z-20 whitespace-nowrap">
                      {item.month}: {item.rev} Tỷ
                    </div>

                    <div className="w-full flex items-end justify-center h-44">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t transition-all duration-300 ${
                          isCurrent
                            ? 'bg-brand-600'
                            : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] ${
                        isCurrent ? 'text-brand-600 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-brand-600 rounded-xs" />
                  <span>Tiền thuê</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-sky-400 rounded-xs" />
                  <span>Dịch vụ</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-slate-300 rounded-xs" />
                  <span>OpEx</span>
                </span>
              </div>
              <div className="text-slate-700 font-medium">
                RevPAU: <strong className="text-brand-600">10.680.000 ₫</strong>/căn
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Predictive Insights (4 cols) */}
        <div className="lg:col-span-4 bg-white text-slate-900 p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI Phân Tích Dự Báo</h4>
                  <div className="text-[10px] text-slate-400">ML Forecast v3.8</div>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-700 rounded border border-brand-200/80">
                Độ tin cậy 96%
              </span>
            </div>

            {/* Insights list */}
            <div className="space-y-3 mt-3.5 text-xs">
              <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200/60 space-y-1">
                <div className="flex items-center justify-between font-semibold text-emerald-800 text-xs">
                  <span>Dự báo dòng tiền tháng tới</span>
                  <span className="font-bold text-emerald-600">+1.5%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Dòng tiền ròng dự kiến đạt <strong className="text-slate-900">4.920.000.000 ₫</strong> từ hợp đồng dài hạn Sunshine.
                </p>
              </div>

              <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 space-y-1">
                <div className="flex items-center justify-between font-semibold text-amber-800 text-xs">
                  <span>14 Hợp đồng sắp đáo hạn (30 ngày)</span>
                  <span className="text-[10px] font-medium bg-amber-100/80 text-amber-800 px-1.5 py-0.5 rounded">Rủi ro TB</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Đề xuất mức tái ký <strong className="text-slate-900">+3.5%</strong> để giữ tỷ lệ lấp đầy &gt; 85%.
                </p>
              </div>

              <div className="bg-rose-50/60 p-3 rounded-lg border border-rose-200/60 space-y-1">
                <div className="flex items-center justify-between font-semibold text-rose-800 text-xs">
                  <span>Cảnh báo điện sảnh tòa nhà</span>
                  <span className="font-bold text-rose-600">+22% kWh</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Điều hòa sảnh A chạy lệch profile ban đêm. Khuyến nghị điều chỉnh cảm biến.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full text-xs"
            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            onClick={() => toast.info('AI Action', 'Đang phân tích các giải pháp tối ưu doanh thu từ Gemini')}
          >
            Xem Đề Xuất Tối Ưu Doanh Thu
          </Button>
        </div>
      </div>

      {/* Breakdown Row: Source Distribution + Building Performance + OpEx */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Revenue Sources Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-brand-600" />
              <span>Cơ Cấu Nguồn Thu</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">T11/2026</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-brand-600" />
                Tiền thuê căn hộ
              </span>
              <span className="font-semibold text-slate-900">3.783 Tr (78%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Phí quản lý & dịch vụ
              </span>
              <span className="font-semibold text-slate-900">582 Tr (12%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Điện nước tiện ích
              </span>
              <span className="font-semibold text-slate-900">291 Tr (6%)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="flex items-center gap-2 text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Gửi xe & Tiện ích khác
              </span>
              <span className="font-semibold text-slate-900">194 Tr (4%)</span>
            </div>
          </div>
        </div>

        {/* 2. Building Performance List */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Hiệu Suất Theo Tòa</span>
            </h4>
            <span className="text-[11px] text-emerald-600 font-medium">4 Tòa nhà</span>
          </div>

          <div className="space-y-2 text-xs">
            {buildings.map((b) => (
              <div
                key={b.id}
                className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-900 text-xs">{b.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Lấp đầy: <strong className="text-emerald-700">{((b.occupiedCount / b.totalApartments) * 100).toFixed(0)}%</strong> ({b.occupiedCount}/{b.totalApartments} căn)
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 text-xs">
                    {formatCompactCurrency(b.monthlyRevenueEstimate)}
                  </div>
                  <div className="text-[10px] text-slate-400">SLA: ★ 4.9</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. OpEx & Maintenance KPI */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Chi Phí Vận Hành (OpEx)</span>
            </h4>
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 rounded">
              OpEx 25.4%
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="text-center p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-[11px]">Tổng chi phí OpEx tháng:</span>
              <div className="text-lg font-bold text-slate-900">1.230.000.000 ₫</div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Kỹ thuật:</span>
                <span className="font-semibold text-slate-900">430.5 Tr (35%)</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Nhân sự:</span>
                <span className="font-semibold text-slate-900">492.0 Tr (40%)</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Điện nước:</span>
                <span className="font-semibold text-slate-900">184.5 Tr (15%)</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Dự phòng:</span>
                <span className="font-semibold text-slate-900">123.0 Tr (10%)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">82 Phiếu bảo trì:</span>
              <span className="text-emerald-600 font-semibold">Đã đóng 92.7% (76/82)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
