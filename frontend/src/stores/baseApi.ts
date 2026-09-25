import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base API definition according to FE_SKILL.md
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000/api/v1',
    prepareHeaders: (headers, { arg }) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const requestBody =
        typeof arg === 'object' && arg !== null && 'body' in arg
          ? arg.body
          : undefined;

      if (!(requestBody instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }

      return headers;
    },
  }),
  tagTypes: [
    'User',
    'Auth',
    'Building',
    'Apartment',
    'Tenant',
    'Contract',
    'Deposit',
    'Receivable',
    'Payment',
    'DebtLedger',
    'Maintenance',
    'Alert',
    'RAGChunk',
    'Booking',
    'Dashboard',
  ],
  endpoints: () => ({}),
});
