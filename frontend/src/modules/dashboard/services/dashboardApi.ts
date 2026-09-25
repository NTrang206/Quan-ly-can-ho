import { baseApi } from '../../../stores/baseApi';
import { IDashboardStats } from '../../../types';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<IDashboardStats, { buildingId?: number }>({
      query: () => '/dashboard/summary',
      transformResponse: (response: any): IDashboardStats => ({
        occupancyRate: Number(response.apartments?.occupancy_rate ?? 0),
        occupiedRooms: Number(response.apartments?.occupied ?? 0),
        totalRooms: Number(response.apartments?.total ?? 0),
        vacantRooms: Number(response.apartments?.available ?? 0),
        reservedRooms: Number(response.apartments?.reserved ?? 0),
        maintenanceRooms: Number(response.apartments?.maintenance ?? 0),
        totalRevenueMonth: Number(response.finance?.total_revenue ?? 0),
        targetRevenueMonth: Number(response.finance?.total_revenue ?? 0),
        revenueGrowthMoM: 0,
        netOperatingIncome: Number(response.finance?.total_revenue ?? 0),
        noiMarginPercent: 0,
        totalDebtOverdue: Number(response.finance?.total_debt ?? 0),
        overdueDebtCount: Number(response.finance?.overdue_receivables ?? 0),
        debtChangeMoM: 0,
        csatScore: 0,
        avgMaintenanceSlaHours: 0,
        activeContractsCount: 0,
        expiringContractsCount: Number(response.operations?.expiring_contracts ?? 0),
        draftContractsCount: 0,
        totalDepositsHeld: Number(response.finance?.held_deposit ?? 0),
      }),
      providesTags: [{ type: 'Dashboard', id: 'STATS' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardStatsQuery } = dashboardApi;
