import { baseApi } from '../../../stores/baseApi';
import { IMaintenanceRequest, MaintenancePriority, MaintenanceStatus } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';
import { mapMaintenance } from '../../../utils/apiMappers';

export const maintenanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaintenanceRequests: builder.query<
      IMaintenanceRequest[],
      { status?: MaintenanceStatus; priority?: MaintenancePriority; apartmentId?: number; tenantId?: number }
    >({
      query: (params) => ({
        url: params?.tenantId ? '/maintenance-requests/my' : '/maintenance-requests',
        params: {
          status: params?.status,
          priority: params?.priority,
          apartment_id: params?.apartmentId,
        },
      }),
      transformResponse: (response: any[]) => response.map(mapMaintenance),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Maintenance' as const, id })),
              { type: 'Maintenance', id: 'LIST' },
            ]
          : [{ type: 'Maintenance', id: 'LIST' }],
    }),

    createMaintenanceRequest: builder.mutation<IMaintenanceRequest, Partial<IMaintenanceRequest>>({
      query: (payload) => ({
        url: '/maintenance-requests',
        method: 'POST',
        body: {
          apartment_id: payload.apartmentId,
          reporter_name: payload.reporterName,
          phone: payload.phone,
          issue_description: payload.issueDescription,
          priority: payload.priority ?? 'MEDIUM',
          image_url: payload.imageUrl,
          tenant_id: payload.tenantId,
        },
      }),
      transformResponse: (response: any) => mapMaintenance(response),
      invalidatesTags: [
        { type: 'Maintenance', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    assignTechnician: builder.mutation<
      IMaintenanceRequest,
      { ticketId: number; technicianName: string; technicianPhone: string }
    >({
      queryFn: async ({ ticketId, technicianName, technicianPhone }) => {
        const requests = mockDb.getMaintenanceRequests();
        const index = requests.findIndex(r => r.id === ticketId);
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy phiếu sự cố' } };

        requests[index] = {
          ...requests[index],
          status: 'IN_PROGRESS',
          assignedStaffId: 2,
          technicianName,
          technicianPhone,
          technicianAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
        };
        mockDb.setMaintenanceRequests(requests);
        return { data: requests[index] };
      },
      invalidatesTags: [{ type: 'Maintenance', id: 'LIST' }],
    }),

    completeAndInspectMaintenance: builder.mutation<
      IMaintenanceRequest,
      { ticketId: number; cost: number; rating?: number; feedback?: string; isPass: boolean }
    >({
      queryFn: async ({ ticketId, cost, rating = 5, feedback = '', isPass }) => {
        const requests = mockDb.getMaintenanceRequests();
        const apts = mockDb.getApartments();

        const index = requests.findIndex(r => r.id === ticketId);
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy phiếu sự cố' } };

        const target = requests[index];
        if (isPass) {
          requests[index] = {
            ...target,
            status: 'COMPLETED',
            repairCost: cost,
            resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            rating,
            feedback,
          };

          // Re-open apartment to OCCUPIED or AVAILABLE if it was locked to MAINTENANCE
          const aptIndex = apts.findIndex(a => a.id === target.apartmentId);
          if (aptIndex !== -1 && apts[aptIndex].status === 'MAINTENANCE') {
            apts[aptIndex] = {
              ...apts[aptIndex],
              status: apts[aptIndex].currentOccupants > 0 ? 'OCCUPIED' : 'AVAILABLE',
            };
            mockDb.setApartments(apts);
          }
        } else {
          requests[index] = {
            ...target,
            status: 'IN_PROGRESS',
            feedback: `Nghiệm thu KHÔNG ĐẠT: ${feedback}`,
          };
        }

        mockDb.setMaintenanceRequests(requests);
        return { data: requests[index] };
      },
      invalidatesTags: [
        { type: 'Maintenance', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMaintenanceRequestsQuery,
  useCreateMaintenanceRequestMutation,
  useAssignTechnicianMutation,
  useCompleteAndInspectMaintenanceMutation,
} = maintenanceApi;
