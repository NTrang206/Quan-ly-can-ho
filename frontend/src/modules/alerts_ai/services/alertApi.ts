import { baseApi } from '../../../stores/baseApi';
import { ISystemAlert } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';
import { generateAIDunningDraft, IDunningPromptOptions } from '../../../utils/aiEngines';

export const alertApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemAlerts: builder.query<ISystemAlert[], { isSent?: boolean; priority?: string }>({
      queryFn: async (params) => {
        let list = mockDb.getSystemAlerts();
        if (params?.isSent !== undefined) list = list.filter(a => a.isSent === params.isSent);
        if (params?.priority) list = list.filter(a => a.priority === params.priority);
        return { data: list };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Alert' as const, id })),
              { type: 'Alert', id: 'LIST' },
            ]
          : [{ type: 'Alert', id: 'LIST' }],
    }),

    triggerSystemScan: builder.mutation<{ newAlertsCount: number; scannedItemsCount: number }, void>({
      queryFn: async () => {
        const receivables = mockDb.getReceivables();
        const contracts = mockDb.getContracts();
        const existingAlerts = mockDb.getSystemAlerts();
        let newCount = 0;

        // 1. Scan for Overdue Receivables
        receivables.forEach(r => {
          if (r.status === 'OVERDUE' || (r.status === 'PARTIAL' && r.remainingDebt > 0)) {
            const exists = existingAlerts.some(a => a.referenceId === r.id && a.alertType === 'OVERDUE_DEBT');
            if (!exists) {
              const draft = generateAIDunningDraft({
                customerName: r.tenantName,
                roomNumber: r.roomNumber,
                buildingName: r.buildingName,
                amountDue: r.remainingDebt,
                dueDate: r.dueDate,
                daysOverdue: 5,
                scenario: 'OVERDUE_WITH_PENALTY',
                tone: 'EMPATHETIC',
              });

              const newAlert: ISystemAlert = {
                id: Date.now() + newCount,
                alertCode: `ALT-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
                alertType: 'OVERDUE_DEBT',
                referenceId: r.id,
                referenceCode: `PT-2026-${r.billingMonth}${r.id}`,
                targetName: r.tenantName,
                targetPhone: r.tenantPhone,
                roomNumber: r.roomNumber,
                buildingName: r.buildingName,
                amountDue: r.remainingDebt,
                daysOverdue: 5,
                priority: 'HIGH',
                isSent: false,
                sentChannels: [],
                aiDraftContent: draft,
                createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
              };
              existingAlerts.unshift(newAlert);
              newCount++;
            }
          }
        });

        // 2. Scan for Expiring Contracts
        contracts.forEach(c => {
          if (c.status === 'ACTIVE') {
            const endDate = new Date(c.endDate).getTime();
            const now = new Date().getTime();
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            if (daysLeft <= 30 && daysLeft >= 0) {
              const exists = existingAlerts.some(a => a.referenceId === c.id && a.alertType === 'EXPIRED_CONTRACT');
              if (!exists) {
                const draft = generateAIDunningDraft({
                  customerName: c.tenantName,
                  roomNumber: c.roomNumber,
                  buildingName: c.buildingName,
                  daysUntilExpiry: daysLeft,
                  scenario: 'CONTRACT_RENEWAL',
                  tone: 'EMPATHETIC',
                });

                const newAlert: ISystemAlert = {
                  id: Date.now() + newCount,
                  alertCode: `ALT-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
                  alertType: 'EXPIRED_CONTRACT',
                  referenceId: c.id,
                  referenceCode: c.contractCode,
                  targetName: c.tenantName,
                  targetPhone: c.tenantPhone,
                  roomNumber: c.roomNumber,
                  buildingName: c.buildingName,
                  daysUntilExpiry: daysLeft,
                  priority: 'HIGH',
                  isSent: false,
                  sentChannels: [],
                  aiDraftContent: draft,
                  createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
                };
                existingAlerts.unshift(newAlert);
                newCount++;
              }
            }
          }
        });

        mockDb.setSystemAlerts(existingAlerts);
        return { data: { newAlertsCount: newCount, scannedItemsCount: receivables.length + contracts.length } };
      },
      invalidatesTags: [{ type: 'Alert', id: 'LIST' }, { type: 'Dashboard', id: 'STATS' }],
    }),

    regenerateAIDraft: builder.mutation<
      ISystemAlert,
      { alertId: number; promptOptions: IDunningPromptOptions }
    >({
      queryFn: async ({ alertId, promptOptions }) => {
        const alerts = mockDb.getSystemAlerts();
        const index = alerts.findIndex(a => a.id === alertId);
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy cảnh báo' } };

        const newDraft = generateAIDunningDraft(promptOptions);
        alerts[index] = {
          ...alerts[index],
          aiDraftContent: newDraft,
        };
        mockDb.setSystemAlerts(alerts);
        return { data: alerts[index] };
      },
      invalidatesTags: [{ type: 'Alert', id: 'LIST' }],
    }),

    dispatchAlertChannels: builder.mutation<
      ISystemAlert,
      { alertId: number; channels: ('ZALO' | 'SMS' | 'EMAIL' | 'APP_PUSH')[]; editedBody?: string }
    >({
      queryFn: async ({ alertId, channels, editedBody }) => {
        const alerts = mockDb.getSystemAlerts();
        const index = alerts.findIndex(a => a.id === alertId);
        if (index === -1) return { error: { status: 404, data: 'Không tìm thấy cảnh báo' } };

        const target = alerts[index];
        alerts[index] = {
          ...target,
          isSent: true,
          sentChannels: channels,
          aiDraftContent: {
            ...target.aiDraftContent,
            body: editedBody || target.aiDraftContent.body,
          },
        };
        mockDb.setSystemAlerts(alerts);
        return { data: alerts[index] };
      },
      invalidatesTags: [{ type: 'Alert', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSystemAlertsQuery,
  useTriggerSystemScanMutation,
  useRegenerateAIDraftMutation,
  useDispatchAlertChannelsMutation,
} = alertApi;
