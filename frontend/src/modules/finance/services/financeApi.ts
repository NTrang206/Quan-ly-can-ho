import { baseApi } from '../../../stores/baseApi';
import { IReceivable, IPayment, IDebtLedger, PaymentMethod } from '../../../types';
import { mapDebtLedger, mapPayment, mapReceivable } from '../../../utils/apiMappers';

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceivables: builder.query<IReceivable[], { month?: number; year?: number; status?: string; tenantId?: number }>({
      query: (params) => ({
        url: params?.tenantId ? '/receivables/my' : '/receivables',
        params: {
          billing_month: params?.month,
          billing_year: params?.year,
          status: params?.status,
        },
      }),
      transformResponse: (response: any[]) => response.map(mapReceivable),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Receivable' as const, id })),
              { type: 'Receivable', id: 'LIST' },
            ]
          : [{ type: 'Receivable', id: 'LIST' }],
    }),

    getPayments: builder.query<IPayment[], { receivableId?: number; contractId?: number }>({
      query: (params) => ({
        url: '/payments',
        params: params?.receivableId ? { receivable_id: params.receivableId } : undefined,
      }),
      transformResponse: (response: any[]) => response.map(mapPayment),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment', id: 'LIST' },
            ]
          : [{ type: 'Payment', id: 'LIST' }],
    }),

    getDebtLedgers: builder.query<IDebtLedger[], void>({
      query: () => '/debt-ledgers',
      transformResponse: (response: any[]) => response.map(mapDebtLedger),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'DebtLedger' as const, id })),
              { type: 'DebtLedger', id: 'LIST' },
            ]
          : [{ type: 'DebtLedger', id: 'LIST' }],
    }),

    recordPayment: builder.mutation<
      { payment: IPayment; receivable: IReceivable },
      {
        receivableId: number;
        amount: number;
        paymentMethod: PaymentMethod;
        note?: string;
      }
    >({
      query: ({ receivableId, amount, paymentMethod, note }) => ({
        url: '/payments',
        method: 'POST',
        body: {
          receivable_id: receivableId,
          amount,
          payment_method: paymentMethod,
          note,
        },
      }),
      transformResponse: (response: any) => ({
        payment: mapPayment(response),
        receivable: {} as IReceivable,
      }),
      invalidatesTags: [
        { type: 'Receivable', id: 'LIST' },
        { type: 'Payment', id: 'LIST' },
        { type: 'DebtLedger', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
        { type: 'Alert', id: 'LIST' },
      ],
    }),

    generateMonthlyReceivables: builder.mutation<
      { count: number; totalAmount: number },
      { month: number; year: number }
    >({
      query: ({ month, year }) => ({
        url: '/receivables/generate-monthly',
        method: 'POST',
        body: { billing_month: month, billing_year: year },
      }),
      transformResponse: (response: any) => ({
        count: Number(response.count ?? 0),
        totalAmount: Number(response.total_amount ?? response.totalAmount ?? 0),
      }),
      /*
      queryFn: async ({ month, year }) => {
        const contracts = mockDb.getContracts().filter(c => c.status === 'ACTIVE');
        const receivables = mockDb.getReceivables();
        let addedCount = 0;
        let sumAmount = 0;

        contracts.forEach(contract => {
          // Prevent duplicates for same month & year
          const exists = receivables.some(
            r => r.contractId === contract.id && r.billingMonth === month && r.billingYear === year
          );
          if (!exists) {
            const elecUsage = Math.floor(Math.random() * 100 + 100);
            const waterUsage = Math.floor(Math.random() * 10 + 10);
            const elecCost = elecUsage * 3500;
            const waterCost = waterUsage * 15000;
            const serviceCost = elecCost + waterCost + 200000;
            const total = contract.rentalPrice + serviceCost;

            const newRec: IReceivable = {
              id: Date.now() + addedCount,
              contractId: contract.id,
              apartmentId: contract.apartmentId,
              roomNumber: contract.roomNumber,
              buildingName: contract.buildingName,
              tenantId: contract.tenantId,
              tenantName: contract.tenantName,
              tenantPhone: contract.tenantPhone,
              billingMonth: month,
              billingYear: year,
              roomAmount: contract.rentalPrice,
              serviceAmount: serviceCost,
              electricityCost: elecCost,
              electricityUsageKwh: elecUsage,
              waterCost: waterCost,
              waterUsageM3: waterUsage,
              managementCost: 200000,
              parkingCost: 0,
              internetCost: 0,
              totalAmount: total,
              paidAmount: 0,
              remainingDebt: total,
              status: 'UNPAID',
              dueDate: `${year}-${String(month).padStart(2, '0')}-05`,
              createdAt: new Date().toISOString().split('T')[0],
              qrPayload: `${contract.contractCode.replace(/[^a-zA-Z0-9]/g, '')} T${month}`,
            };
            receivables.unshift(newRec);
            addedCount++;
            sumAmount += total;
          }
        });

        mockDb.setReceivables(receivables);
        return { data: { count: addedCount, totalAmount: sumAmount } };
      },
      */
      invalidatesTags: [
        { type: 'Receivable', id: 'LIST' },
        { type: 'DebtLedger', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetReceivablesQuery,
  useGetPaymentsQuery,
  useGetDebtLedgersQuery,
  useRecordPaymentMutation,
  useGenerateMonthlyReceivablesMutation,
} = financeApi;
