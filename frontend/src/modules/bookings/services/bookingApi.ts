import { baseApi } from '../../../stores/baseApi';
import { IBooking, BookingStatus } from '../../../types';
import { mapBooking } from '../../../utils/apiMappers';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<IBooking[], { status?: BookingStatus }>({
      query: () => '/bookings',
      transformResponse: (response: any[]) => response.map(mapBooking),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'LIST' },
            ]
          : [{ type: 'Booking', id: 'LIST' }],
    }),

    createBooking: builder.mutation<IBooking, Partial<IBooking>>({
      query: (payload) => ({
        url: '/bookings',
        method: 'POST',
        body: {
          customer_name: payload.customerName,
          customer_phone: payload.customerPhone,
          customer_email: payload.customerEmail,
          apartment_id: payload.apartmentId,
          check_in_date: payload.checkInDate,
          deposit_amount: payload.depositAmount,
          notes: payload.notes,
        },
      }),
      transformResponse: (response: any) => mapBooking(response),
      invalidatesTags: [
        { type: 'Booking', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    updateBookingStatus: builder.mutation<IBooking, { id: number; status: BookingStatus }>({
      query: ({ id, status }) => ({
        url: `/bookings/${id}/${status === 'CONFIRMED' ? 'confirm' : 'cancel'}`,
        method: 'PATCH',
      }),
      transformResponse: (response: any) => mapBooking(response),
      invalidatesTags: [{ type: 'Booking', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
} = bookingApi;
