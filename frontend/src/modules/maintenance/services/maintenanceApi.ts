import { baseApi } from '../../../stores/baseApi';
import { IMaintenanceRequest, MaintenancePriority, MaintenanceStatus } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';

export const maintenanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaintenanceRequests: builder.query<
      IMaintenanceRequest[],
      { status?: MaintenanceStatus; priority?: MaintenancePriority; apartmentId?: number; tenantId?: number }
    >({
      queryFn: async (params) => {
        let list = mockDb.getMaintenanceRequests();
        if (params?.status) list = list.filter(m => m.status === params.status);
        if (params?.priority) list = list.filter(m => m.priority === params.priority);
        if (params?.apartmentId) list = list.filter(m => m.apartmentId === Number(params.apartmentId));
        if (params?.tenantId) list = list.filter(m => m.tenantId === Number(params.tenantId));
        return { data: list };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Maintenance' as const, id })),
              { type: 'Maintenance', id: 'LIST' },
            ]
          : [{ type: 'Maintenance', id: 'LIST' }],
    }),

    createMaintenanceRequest: builder.mutation<IMaintenanceRequest, Partial<IMaintenanceRequest>>({
      queryFn: async (payload) => {
        const requests = mockDb.getMaintenanceRequests();
        const apts = mockDb.getApartments();

        const newId = Date.now();
        const newTicketCode = `BT-2026-${Math.floor(Math.random() * 900 + 100)}`;
        const priority = payload.priority || 'MEDIUM';

        const newRequest: IMaintenanceRequest = {
          id: newId,
          ticketCode: newTicketCode,
          apartmentId: payload.apartmentId || 1,
          roomNumber: payload.roomNumber || 'P.302',
          buildingName: payload.buildingName || 'Sunshine Tower A',
          reporterName: payload.reporterName || 'Cư dân',
          phone: payload.phone || '0912.888.999',
          issueDescription: payload.issueDescription || 'Sự cố cần hỗ trợ kỹ thuật',
          category: payload.category || 'PLUMBING',
          priority,
          status: 'PENDING',
          repairCost: 0,
          createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
          tenantId: payload.tenantId || 1,
          slaMinutes: priority === 'URGENT' ? 15 : priority === 'HIGH' ? 30 : 60,
        };

        requests.unshift(newRequest);
        mockDb.setMaintenanceRequests(requests);

        // Lock apartment to MAINTENANCE if priority is URGENT
        if (priority === 'URGENT') {
          const aptIndex = apts.findIndex(a => a.id === payload.apartmentId);
          if (aptIndex !== -1) {
            apts[aptIndex] = { ...apts[aptIndex], status: 'MAINTENANCE' };
            mockDb.setApartments(apts);
          }
        }

        return { data: newRequest };
      },
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
