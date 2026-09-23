import { baseApi } from '../../../stores/baseApi';
import { ITenant, IRoommate, IEmergencyContact } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';

export const tenantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query<ITenant[], { search?: string; isBadDebt?: boolean }>({
      queryFn: async (params) => {
        let list = mockDb.getTenants();
        if (params?.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            t =>
              t.fullName.toLowerCase().includes(s) ||
              t.citizenId.includes(s) ||
              t.phone.includes(s) ||
              t.currentRoomNumber?.toLowerCase().includes(s)
          );
        }
        if (params?.isBadDebt !== undefined) {
          list = list.filter(t => t.isBadDebt === params.isBadDebt);
        }
        return { data: list };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tenant' as const, id })),
              { type: 'Tenant', id: 'LIST' },
            ]
          : [{ type: 'Tenant', id: 'LIST' }],
    }),

    getTenantById: builder.query<ITenant, number>({
      queryFn: async (id) => {
        const tenant = mockDb.getTenants().find(t => t.id === Number(id));
        if (!tenant) return { error: { status: 404, data: 'Không tìm thấy hồ sơ khách thuê' } };
        return { data: tenant };
      },
      providesTags: (_result, _error, id) => [{ type: 'Tenant', id }],
    }),

    createTenant: builder.mutation<ITenant, Partial<ITenant>>({
      queryFn: async (payload) => {
        const tenants = mockDb.getTenants();
        const newTenant: ITenant = {
          id: Date.now(),
          fullName: payload.fullName || 'Khách Thuê Mới',
          citizenId: payload.citizenId || '001201009999',
          phone: payload.phone || '0900.000.000',
          email: payload.email || 'customer@sunshine.vn',
          hometown: payload.hometown || 'Hà Nội',
          isBadDebt: false,
          createdAt: new Date().toISOString().split('T')[0],
          emergencyContacts: payload.emergencyContacts || [],
          roommates: payload.roommates || [],
          totalHeldDeposit: payload.totalHeldDeposit || 0,
          creditScore: 95,
        };
        tenants.unshift(newTenant);
        mockDb.setTenants(tenants);
        return { data: newTenant };
      },
      invalidatesTags: [{ type: 'Tenant', id: 'LIST' }],
    }),

    addRoommate: builder.mutation<
      ITenant,
      { tenantId: number; roommate: Omit<IRoommate, 'id' | 'tenantId'> }
    >({
      queryFn: async ({ tenantId, roommate }) => {
        const tenants = mockDb.getTenants();
        const index = tenants.findIndex(t => t.id === tenantId);
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy khách thuê' } };

        const newRoommate: IRoommate = {
          ...roommate,
          id: Date.now(),
          tenantId,
        };
        tenants[index].roommates.push(newRoommate);
        mockDb.setTenants(tenants);
        return { data: tenants[index] };
      },
      invalidatesTags: (_result, _error, { tenantId }) => [
        { type: 'Tenant', id: tenantId },
        { type: 'Tenant', id: 'LIST' },
      ],
    }),

    addEmergencyContact: builder.mutation<
      ITenant,
      { tenantId: number; contact: Omit<IEmergencyContact, 'id' | 'tenantId'> }
    >({
      queryFn: async ({ tenantId, contact }) => {
        const tenants = mockDb.getTenants();
        const index = tenants.findIndex(t => t.id === tenantId);
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy khách thuê' } };

        const newContact: IEmergencyContact = {
          ...contact,
          id: Date.now(),
          tenantId,
        };
        tenants[index].emergencyContacts.push(newContact);
        mockDb.setTenants(tenants);
        return { data: tenants[index] };
      },
      invalidatesTags: (_result, _error, { tenantId }) => [
        { type: 'Tenant', id: tenantId },
        { type: 'Tenant', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTenantsQuery,
  useGetTenantByIdQuery,
  useCreateTenantMutation,
  useAddRoommateMutation,
  useAddEmergencyContactMutation,
} = tenantApi;
