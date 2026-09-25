import { baseApi } from '../../../stores/baseApi';
import { ITenant, IRoommate, IEmergencyContact } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';
import { mapTenant } from '../../../utils/apiMappers';

export const tenantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query<ITenant[], { search?: string; isBadDebt?: boolean }>({
      query: () => '/tenants',
      transformResponse: (response: any[]) => response.map(mapTenant),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Tenant' as const, id })),
              { type: 'Tenant', id: 'LIST' },
            ]
          : [{ type: 'Tenant', id: 'LIST' }],
    }),

    getTenantById: builder.query<ITenant, number>({
      query: (id) => `/tenants/${id}`,
      transformResponse: (response: any) => mapTenant(response),
      providesTags: (_result, _error, id) => [{ type: 'Tenant', id }],
    }),

    createTenant: builder.mutation<ITenant, Partial<ITenant>>({
      query: (payload) => ({
        url: '/tenants',
        method: 'POST',
        body: {
          full_name: payload.fullName,
          citizen_id: payload.citizenId,
          phone: payload.phone,
          email: payload.email,
          hometown: payload.hometown,
        },
      }),
      transformResponse: (response: any) => mapTenant(response),
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
