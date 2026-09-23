import { baseApi } from '../../../stores/baseApi';
import { IContract, IDeposit, ContractStatus } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';
import { summarizeContractWithAI } from '../../../utils/aiEngines';

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContracts: builder.query<IContract[], { status?: ContractStatus; tenantId?: number }>({
      queryFn: async (params) => {
        let contracts = mockDb.getContracts();
        if (params?.status) {
          contracts = contracts.filter(c => c.status === params.status);
        }
        if (params?.tenantId) {
          contracts = contracts.filter(c => c.tenantId === Number(params.tenantId));
        }
        return { data: contracts };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Contract' as const, id })),
              { type: 'Contract', id: 'LIST' },
            ]
          : [{ type: 'Contract', id: 'LIST' }],
    }),

    getContractById: builder.query<IContract, number>({
      queryFn: async (id) => {
        const contract = mockDb.getContracts().find(c => c.id === Number(id));
        if (!contract) return { error: { status: 404, data: 'Không tìm thấy hợp đồng' } };
        return { data: contract };
      },
      providesTags: (_result, _error, id) => [{ type: 'Contract', id }],
    }),

    getDeposits: builder.query<IDeposit[], void>({
      queryFn: async () => {
        const deposits = mockDb.getDeposits();
        return { data: deposits };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Deposit' as const, id })),
              { type: 'Deposit', id: 'LIST' },
            ]
          : [{ type: 'Deposit', id: 'LIST' }],
    }),

    createContract: builder.mutation<IContract, Partial<IContract>>({
      queryFn: async (payload) => {
        const contracts = mockDb.getContracts();
        const apts = mockDb.getApartments();
        const targetApt = apts.find(a => a.id === payload.apartmentId);

        const newId = Date.now();
        const newCode = `HĐ-2026-${Math.floor(Math.random() * 900 + 100)}`;
        const price = payload.rentalPrice || targetApt?.price || 8000000;
        const deposit = payload.depositAmount || price * 2;
        const start = payload.startDate || new Date().toISOString().split('T')[0];
        const end = payload.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const tenantName = payload.tenantName || 'Khách thuê mới';

        const aiSummary = summarizeContractWithAI(
          payload.roomNumber || targetApt?.roomNumber || 'P.---',
          price,
          deposit,
          start,
          end,
          tenantName
        );

        const newContract: IContract = {
          id: newId,
          contractCode: newCode,
          apartmentId: payload.apartmentId || 1,
          roomNumber: payload.roomNumber || targetApt?.roomNumber || 'P.---',
          buildingName: payload.buildingName || targetApt?.buildingName || 'Sunshine Tower A',
          tenantId: payload.tenantId || 1,
          tenantName,
          tenantCitizenId: payload.tenantCitizenId || '001201008899',
          tenantPhone: payload.tenantPhone || '0912.888.999',
          tenantEmail: payload.tenantEmail || 'tenant@sunshine.vn',
          startDate: start,
          endDate: end,
          rentalPrice: price,
          depositAmount: deposit,
          paymentCycleMonths: payload.paymentCycleMonths || 1,
          paymentDueDay: payload.paymentDueDay || 5,
          status: 'DRAFT',
          createdBy: 2,
          createdByName: 'Lê Quang Khánh',
          createdAt: new Date().toISOString(),
          bookingId: payload.bookingId,
          aiSummary,
        };

        contracts.unshift(newContract);
        mockDb.setContracts(contracts);

        // Update Apartment to RESERVED if not already
        if (targetApt && targetApt.status === 'AVAILABLE') {
          const aptIndex = apts.findIndex(a => a.id === targetApt.id);
          apts[aptIndex] = { ...targetApt, status: 'RESERVED' };
          mockDb.setApartments(apts);
        }

        return { data: newContract };
      },
      invalidatesTags: [
        { type: 'Contract', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    approveAndActivateContract: builder.mutation<IContract, { contractId: number }>({
      queryFn: async ({ contractId }) => {
        const contracts = mockDb.getContracts();
        const deposits = mockDb.getDeposits();
        const apts = mockDb.getApartments();

        const cIndex = contracts.findIndex(c => c.id === contractId);
        if (cIndex === -1) return { error: { status: 404, data: 'Không tìm thấy hợp đồng' } };

        const contract = contracts[cIndex];
        contracts[cIndex] = {
          ...contract,
          status: 'ACTIVE',
          approvedBy: 1,
          approvedByName: 'Nguyễn Thị Trang',
        };
        mockDb.setContracts(contracts);

        // Create Deposit Record
        const newDeposit: IDeposit = {
          id: Date.now(),
          contractId: contract.id,
          contractCode: contract.contractCode,
          roomNumber: contract.roomNumber,
          tenantName: contract.tenantName,
          amount: contract.depositAmount,
          paidDate: new Date().toISOString().split('T')[0],
          status: 'HELD',
          refundAmount: 0,
          deductionAmount: 0,
          handledBy: 3,
          handledByName: 'Hoàng Khánh Ly',
          createdAt: new Date().toISOString(),
        };
        deposits.unshift(newDeposit);
        mockDb.setDeposits(deposits);

        // Update Apartment to OCCUPIED
        const aptIndex = apts.findIndex(a => a.id === contract.apartmentId);
        if (aptIndex !== -1) {
          apts[aptIndex] = { ...apts[aptIndex], status: 'OCCUPIED' };
          mockDb.setApartments(apts);
        }

        return { data: contracts[cIndex] };
      },
      invalidatesTags: [
        { type: 'Contract', id: 'LIST' },
        { type: 'Deposit', id: 'LIST' },
        { type: 'Apartment', id: 'LIST' },
        { type: 'Dashboard', id: 'STATS' },
      ],
    }),

    renewContract: builder.mutation<IContract, { contractId: number; newEndDate: string; newPrice?: number }>({
      queryFn: async ({ contractId, newEndDate, newPrice }) => {
        const contracts = mockDb.getContracts();
        const cIndex = contracts.findIndex(c => c.id === contractId);
        if (cIndex === -1) return { error: { status: 404, data: 'Không tìm thấy hợp đồng' } };

        const contract = contracts[cIndex];
        const updatedPrice = newPrice || contract.rentalPrice;

        contracts[cIndex] = {
          ...contract,
          endDate: newEndDate,
          rentalPrice: updatedPrice,
          status: 'RENEWED',
          aiSummary: summarizeContractWithAI(
            contract.roomNumber,
            updatedPrice,
            contract.depositAmount,
            contract.startDate,
            newEndDate,
            contract.tenantName
          ),
        };
        mockDb.setContracts(contracts);
        return { data: contracts[cIndex] };
      },
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
