import { baseApi } from '../../../stores/baseApi';
import { IDashboardStats } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<IDashboardStats, { buildingId?: number }>({
      queryFn: async () => {
        const stats = mockDb.getDashboardStats();
        return { data: stats };
      },
      providesTags: [{ type: 'Dashboard', id: 'STATS' }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardStatsQuery } = dashboardApi;
