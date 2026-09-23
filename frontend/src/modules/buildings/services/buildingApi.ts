import { baseApi } from '../../../stores/baseApi';
import { IBuilding, IApartment, ApartmentStatus } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';

export const buildingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query<IBuilding[], void>({
      queryFn: async () => {
        const data = mockDb.getBuildings();
        return { data };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Building' as const, id })),
              { type: 'Building', id: 'LIST' },
            ]
          : [{ type: 'Building', id: 'LIST' }],
    }),

    getApartments: builder.query<IApartment[], { buildingId?: number; status?: ApartmentStatus; floor?: number }>({
      queryFn: async (params) => {
        let apts = mockDb.getApartments();
        if (params?.buildingId) {
          apts = apts.filter(a => a.buildingId === Number(params.buildingId));
        }
        if (params?.status) {
          apts = apts.filter(a => a.status === params.status);
        }
        if (params?.floor) {
          apts = apts.filter(a => a.floor === Number(params.floor));
        }
        return { data: apts };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Apartment' as const, id })),
              { type: 'Apartment', id: 'LIST' },
            ]
          : [{ type: 'Apartment', id: 'LIST' }],
    }),

    getApartmentById: builder.query<IApartment, number>({
      queryFn: async (id) => {
        const apt = mockDb.getApartments().find(a => a.id === Number(id));
        if (!apt) return { error: { status: 404, data: 'Không tìm thấy căn hộ' } };
        return { data: apt };
      },
      providesTags: (_result, _error, id) => [{ type: 'Apartment', id }],
    }),

    updateApartmentStatus: builder.mutation<IApartment, { id: number; status: ApartmentStatus }>({
      queryFn: async ({ id, status }) => {
        const apts = mockDb.getApartments();
        const index = apts.findIndex(a => a.id === Number(id));
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy căn hộ' } };

        apts[index] = { ...apts[index], status };
        mockDb.setApartments(apts);
        return { data: apts[index] };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Apartment', id },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Building', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    createApartment: builder.mutation<IApartment, Partial<IApartment>>({
      queryFn: async (payload) => {
        const apts = mockDb.getApartments();
        const newApt: IApartment = {
          id: Date.now(),
          buildingId: payload.buildingId || 1,
          buildingName: payload.buildingName || 'Sunshine Tower A',
          roomNumber: payload.roomNumber || `P.${Math.floor(Math.random() * 900 + 100)}`,
          floor: payload.floor || 1,
          areaSqm: payload.areaSqm || 60,
          price: payload.price || 8000000,
          depositDefault: (payload.price || 8000000) * 2,
          maxOccupants: payload.maxOccupants || 3,
          currentOccupants: 0,
          bedrooms: payload.bedrooms || 2,
          bathrooms: payload.bathrooms || 1,
          viewDirection: payload.viewDirection || 'Đông Nam',
          status: payload.status || 'AVAILABLE',
          description: payload.description || 'Căn hộ mới đưa vào khai thác.',
          imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
          amenities: payload.amenities || [],
          createdAt: new Date().toISOString(),
        };
        apts.unshift(newApt);
        mockDb.setApartments(apts);
        return { data: newApt };
      },
      invalidatesTags: [
        { type: 'Apartment', id: 'LIST' },
        { type: 'Building', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBuildingsQuery,
  useGetApartmentsQuery,
  useGetApartmentByIdQuery,
  useUpdateApartmentStatusMutation,
  useCreateApartmentMutation,
} = buildingApi;
