import { baseApi } from '../../../stores/baseApi';
import { IContract, IDeposit, ContractStatus } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';
import { mapContract, mapDeposit } from '../../../utils/apiMappers';

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<IContract[], { status?: ContractStatus; tenantId?: number }>({
      query: (params) => ({
        url: params?.tenantId ? '/contracts/my' : '/contracts',
        params: params?.status ? { status: params.status } : undefined,
      }),
      transformResponse: (response: any[]) => response.map(mapContract),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Contract' as const, id })),
              { type: 'Contract', id: 'LIST' },
            ]
          : [{ type: 'Contract', id: 'LIST' }],
    }),

    getContractById: builder.query<IContract, number>({
      query: (id) => `/contracts/${id}`,
      transformResponse: (response: any) => mapContract(response),
      providesTags: (_result, _error, id) => [{ type: 'Contract', id }],
    }),

    getDeposits: builder.query<IDeposit[], void>({
      query: () => '/deposits',
      transformResponse: (response: any[]) => response.map(mapDeposit),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Deposit' as const, id })),
              { type: 'Deposit', id: 'LIST' },
            ]
          : [{ type: 'Deposit', id: 'LIST' }],
    }),

    createContract: builder.mutation<IContract, Partial<IContract>>({
      query: (payload) => ({
        url: '/contracts',
        method: 'POST',
        body: {
          apartment_id: payload.apartmentId,
          tenant_id: payload.tenantId ?? 1,
          start_date: payload.startDate,
          end_date: payload.endDate,
          rental_price: payload.rentalPrice,
          deposit_amount: payload.depositAmount,
        },
      }),
      transformResponse: (response: any) => mapContract(response),
      invalidatesTags: [
        { type: 'Contract', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    approveAndActivateContract: builder.mutation<IContract, { contractId: number }>({
      query: ({ contractId }) => ({
        url: `/contracts/${contractId}/activate`,
        method: 'PATCH',
      }),
      transformResponse: (response: any) => mapContract(response),
      invalidatesTags: [
        { type: 'Contract', id: 'LIST' },
        { type: 'Deposit', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    renewContract: builder.mutation<IContract, { contractId: number; newEndDate: string; newPrice?: number }>({
      query: ({ contractId, newEndDate, newPrice }) => ({
        url: `/contracts/${contractId}/renew`,
        method: 'POST',
        body: {
          new_end_date: newEndDate,
          rental_price: newPrice,
          deposit_amount: 0,
        },
      }),
      transformResponse: (response: any) => mapContract(response),
      invalidatesTags: [
        { type: 'Contract', id: 'LIST' },
        { type: 'Alert', id: 'LIST' },
      ],
    }),

    terminateAndSettleContract: builder.mutation<
      { contract: IContract; deposit: IDeposit; refundAmount: number },
      { contractId: number; deductionAmount: number; deductionReason: string }
    >({
      queryFn: async ({ contractId, deductionAmount, deductionReason }) => {
        const contracts = mockDb.getContracts();
        const deposits = mockDb.getDeposits();
        const apts = mockDb.getApartments();

        const cIndex = contracts.findIndex(c => c.id === contractId);
        if (cIndex === -1) return { error: { status: 404, data: 'Không tìm thấy hợp đồng' } };

        const contract = contracts[cIndex];
        contracts[cIndex] = { ...contract, status: 'TERMINATED' };
        mockDb.setContracts(contracts);

        // Settle Deposit
        const dIndex = deposits.findIndex(d => d.contractId === contractId);
        let updatedDeposit: IDeposit;
        const refund = Math.max(0, contract.depositAmount - deductionAmount);

        if (dIndex !== -1) {
          deposits[dIndex] = {
            ...deposits[dIndex],
            deductionAmount,
            deductionReason,
            refundAmount: refund,
            status: refund > 0 ? 'REFUNDED' : 'DEDUCTED',
            handledBy: 3,
            handledByName: 'Hoàng Khánh Ly',
          };
          updatedDeposit = deposits[dIndex];
        } else {
          updatedDeposit = {
            id: Date.now(),
            contractId: contract.id,
            contractCode: contract.contractCode,
            roomNumber: contract.roomNumber,
            tenantName: contract.tenantName,
            amount: contract.depositAmount,
            deductionAmount,
            deductionReason,
            refundAmount: refund,
            status: refund > 0 ? 'REFUNDED' : 'DEDUCTED',
            handledBy: 3,
            handledByName: 'Hoàng Khánh Ly',
            createdAt: new Date().toISOString(),
          };
          deposits.unshift(updatedDeposit);
        }
        mockDb.setDeposits(deposits);

        // Update Apartment back to AVAILABLE or MAINTENANCE if damage
        const aptIndex = apts.findIndex(a => a.id === contract.apartmentId);
        if (aptIndex !== -1) {
          apts[aptIndex] = {
            ...apts[aptIndex],
            status: deductionAmount > 0 ? 'MAINTENANCE' : 'AVAILABLE',
          };
          mockDb.setApartments(apts);
        }

        return { data: { contract: contracts[cIndex], deposit: updatedDeposit, refundAmount: refund } };
      },
      invalidatesTags: [
        { type: 'Contract', id: 'LIST' },
        { type: 'Deposit', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetContractsQuery,
  useGetContractByIdQuery,
  useGetDepositsQuery,
  useCreateContractMutation,
  useApproveAndActivateContractMutation,
  useRenewContractMutation,
  useTerminateAndSettleContractMutation,
} = contractApi;
