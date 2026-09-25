import { baseApi } from '../../../stores/baseApi';
import { IBuilding, IApartment, ApartmentStatus } from '../../../types';
import { mapApartment, mapBuilding } from '../../../utils/apiMappers';

export const buildingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query<IBuilding[], void>({
      query: () => '/buildings',
      transformResponse: (response: any[]) => response.map(mapBuilding),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Building' as const, id })),
              { type: 'Building', id: 'LIST' },
            ]
          : [{ type: 'Building', id: 'LIST' }],
    }),

    getApartments: builder.query<IApartment[], { buildingId?: number; status?: ApartmentStatus; floor?: number }>({
      query: (params) => ({
        url: '/apartments',
        params: {
          building_id: params?.buildingId,
          status: params?.status,
          floor: params?.floor,
        },
      }),
      transformResponse: (response: any[]) => response.map(mapApartment),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Apartment' as const, id })),
              { type: 'Apartment', id: 'LIST' },
            ]
          : [{ type: 'Apartment', id: 'LIST' }],
    }),

    getApartmentById: builder.query<IApartment, number>({
      query: (id) => `/apartments/${id}`,
      transformResponse: (response: any) => mapApartment(response),
      providesTags: (_result, _error, id) => [{ type: 'Apartment', id }],
    }),

    updateApartmentStatus: builder.mutation<IApartment, { id: number; status: ApartmentStatus }>({
      query: ({ id, status }) => ({
        url: `/apartments/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: any) => mapApartment(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Apartment', id },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Building', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    createApartment: builder.mutation<IApartment, Partial<IApartment>>({
      query: (payload) => ({
        url: '/apartments',
        method: 'POST',
        body: {
          building_id: payload.buildingId,
          room_number: payload.roomNumber,
          floor: payload.floor,
          area_sqm: payload.areaSqm,
          price: payload.price,
          max_occupants: payload.maxOccupants,
          status: payload.status ?? 'AVAILABLE',
        },
      }),
      transformResponse: (response: any) => mapApartment(response),
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
