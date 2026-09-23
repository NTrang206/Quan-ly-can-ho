import { baseApi } from '../../../stores/baseApi';
import { IReceivable, IPayment, IDebtLedger, PaymentMethod } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceivables: builder.query<IReceivable[], { month?: number; year?: number; status?: string; tenantId?: number }>({
      queryFn: async (params) => {
        let list = mockDb.getReceivables();
        if (params?.month) list = list.filter(r => r.billingMonth === Number(params.month));
        if (params?.year) list = list.filter(r => r.billingYear === Number(params.year));
        if (params?.status) list = list.filter(r => r.status === params.status);
        if (params?.tenantId) list = list.filter(r => r.tenantId === Number(params.tenantId));
        return { data: list };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Receivable' as const, id })),
              { type: 'Receivable', id: 'LIST' },
            ]
          : [{ type: 'Receivable', id: 'LIST' }],
    }),

    getPayments: builder.query<IPayment[], { receivableId?: number; contractId?: number }>({
      queryFn: async (params) => {
        let list = mockDb.getPayments();
        if (params?.receivableId) list = list.filter(p => p.receivableId === Number(params.receivableId));
        if (params?.contractId) list = list.filter(p => p.contractId === Number(params.contractId));
        return { data: list };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Payment' as const, id })),
              { type: 'Payment', id: 'LIST' },
            ]
          : [{ type: 'Payment', id: 'LIST' }],
    }),

    getDebtLedgers: builder.query<IDebtLedger[], void>({
      queryFn: async () => {
        const list = mockDb.getDebtLedgers();
        return { data: list };
      },
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
      queryFn: async ({ receivableId, amount, paymentMethod, note }) => {
        const receivables = mockDb.getReceivables();
        const payments = mockDb.getPayments();
        const debtLedgers = mockDb.getDebtLedgers();

        const rIndex = receivables.findIndex(r => r.id === receivableId);
        if (rIndex === -1) return { error: { status: 404, data: 'Không tìm thấy khoản thu' } };

        const target = receivables[rIndex];
        const newPaidAmount = target.paidAmount + amount;
        const remaining = Math.max(0, target.totalAmount - newPaidAmount);
        const newStatus = remaining <= 0 ? 'PAID' : 'PARTIAL';

        receivables[rIndex] = {
          ...target,
          paidAmount: newPaidAmount,
          remainingDebt: remaining,
          status: newStatus,
        };
        mockDb.setReceivables(receivables);

        // Create Payment Record
        const receiptNo = `PT-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
        const txCode = paymentMethod === 'BANK_TRANSFER' ? `MB${Date.now().toString().slice(-8)}` : `CASH-${receiptNo}`;
        const newPayment: IPayment = {
          id: Date.now(),
          receivableId: target.id,
          contractId: target.contractId,
          receiptNumber: receiptNo,
          amount,
          paymentMethod,
          transactionCode: txCode,
          paymentDate: new Date().toLocaleString('vi-VN'),
          note: note || `Thanh toán cước phí căn ${target.roomNumber}`,
          handledBy: 3,
          handledByName: 'Hoàng Khánh Ly',
          payerName: target.tenantName,
          roomNumber: target.roomNumber,
        };
        payments.unshift(newPayment);
        mockDb.setPayments(payments);

        // Update DebtLedger
        const dIndex = debtLedgers.findIndex(d => d.tenantId === target.tenantId);
        if (dIndex !== -1) {
          debtLedgers[dIndex] = {
            ...debtLedgers[dIndex],
            totalPaid: debtLedgers[dIndex].totalPaid + amount,
            currentDebt: Math.max(0, debtLedgers[dIndex].currentDebt - amount),
            lastUpdated: new Date().toISOString().split('T')[0],
            isOverdue: debtLedgers[dIndex].currentDebt - amount > 0,
          };
          mockDb.setDebtLedgers(debtLedgers);
        }

        return { data: { payment: newPayment, receivable: receivables[rIndex] } };
      },
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
