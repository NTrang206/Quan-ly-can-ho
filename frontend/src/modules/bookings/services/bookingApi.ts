import { baseApi } from '../../../stores/baseApi';
import { IBooking, BookingStatus } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<IBooking[], { status?: BookingStatus }>({
      queryFn: async (params) => {
        let list = mockDb.getBookings();
        if (params?.status) list = list.filter(b => b.status === params.status);
        return { data: list };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'LIST' },
            ]
          : [{ type: 'Booking', id: 'LIST' }],
    }),

    createBooking: builder.mutation<IBooking, Partial<IBooking>>({
      queryFn: async (payload) => {
        const bookings = mockDb.getBookings();
        const apts = mockDb.getApartments();

        const newId = Date.now();
        const bookingCode = `BK-2026-${Math.floor(Math.random() * 900 + 100)}`;
        const targetApt = apts.find(a => a.id === payload.apartmentId);

        const newBooking: IBooking = {
          id: newId,
          bookingCode,
          customerName: payload.customerName || 'Khách hàng',
          customerPhone: payload.customerPhone || '0900.000.000',
          customerEmail: payload.customerEmail || 'customer@gmail.com',
          customerCitizenId: payload.customerCitizenId,
          apartmentId: payload.apartmentId || 1,
          roomNumber: payload.roomNumber || targetApt?.roomNumber || 'P.---',
          buildingName: payload.buildingName || targetApt?.buildingName || 'Sunshine Tower A',
          monthlyPrice: payload.monthlyPrice || targetApt?.price || 8000000,
          checkInDate: payload.checkInDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          depositAmount: payload.depositAmount || 1000000,
          status: 'PENDING',
          notes: payload.notes,
          createdAt: new Date().toISOString().split('T')[0],
        };

        bookings.unshift(newBooking);
        mockDb.setBookings(bookings);

        // Update Apartment to RESERVED
        if (targetApt && targetApt.status === 'AVAILABLE') {
          const aIndex = apts.findIndex(a => a.id === targetApt.id);
          apts[aIndex] = { ...targetApt, status: 'RESERVED' };
          mockDb.setApartments(apts);
        }

        return { data: newBooking };
      },
      invalidatesTags: [
        { type: 'Booking', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    updateBookingStatus: builder.mutation<IBooking, { id: number; status: BookingStatus }>({
      queryFn: async ({ id, status }) => {
        const bookings = mockDb.getBookings();
        const index = bookings.findIndex(b => b.id === id);
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy yêu cầu đặt phòng' } };

        bookings[index] = { ...bookings[index], status };
        mockDb.setBookings(bookings);
        return { data: bookings[index] };
      },
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
