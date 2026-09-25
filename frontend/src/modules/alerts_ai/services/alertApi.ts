import { baseApi } from '../../../stores/baseApi';
import { ISystemAlert } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';
import { generateAIDunningDraft, IDunningPromptOptions } from '../../../utils/aiEngines';
import { mapAlert } from '../../../utils/apiMappers';

export const alertApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemAlerts: builder.query<ISystemAlert[], { isSent?: boolean; priority?: string }>({
      query: () => '/alerts',
      transformResponse: (response: any[]) => response.map(mapAlert),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Alert' as const, id })),
              { type: 'Alert', id: 'LIST' },
            ]
          : [{ type: 'Alert', id: 'LIST' }],
    }),

    triggerSystemScan: builder.mutation<{ newAlertsCount: number; scannedItemsCount: number }, void>({
      query: () => ({
        url: '/alerts/scan',
        method: 'POST',
        body: { days_to_end: 30 },
      }),
      transformResponse: (response: any) => ({
        newAlertsCount: Number(response.contract_alerts_created ?? 0) + Number(response.debt_alerts_created ?? 0),
        scannedItemsCount: 0,
      }),
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
