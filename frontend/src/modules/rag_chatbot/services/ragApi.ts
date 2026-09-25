import { baseApi } from '../../../stores/baseApi';
import { IDocumentChunk } from '../../../types';
import { mockDb } from '../../../stores/mockDatabase';
import { IRAGAnswerResult } from '../../../utils/aiEngines';

export const ragApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRAGChunks: builder.query<IDocumentChunk[], { category?: string }>({
      queryFn: async (params) => {
        let list = mockDb.getRAGChunks();
        if (params?.category) list = list.filter(c => c.category === params.category);
        return { data: list };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'RAGChunk' as const, id })),
              { type: 'RAGChunk', id: 'LIST' },
            ]
          : [{ type: 'RAGChunk', id: 'LIST' }],
    }),

    askRAGChatbot: builder.mutation<IRAGAnswerResult, { question: string }>({
      query: ({ question }) => ({
        url: '/ai/chat',
        method: 'POST',
        body: { question, top_k: 3 },
      }),
    }),

    addDocumentChunk: builder.mutation<IDocumentChunk, Partial<IDocumentChunk>>({
      queryFn: async (payload) => {
        const chunks = mockDb.getRAGChunks();
        const newChunk: IDocumentChunk = {
          id: Date.now(),
          docCode: payload.docCode || 'Tai_lieu_noi_quy_moi.pdf',
          documentName: payload.documentName || 'Tài liệu Nội quy Bổ sung 2026',
          title: payload.title || 'Quy định mới cập nhật',
          chunkIndex: chunks.length + 1,
          category: payload.category || 'LIVING_RULES',
          content: payload.content || '',
          citation: payload.citation || 'Quy chế BQL Sunshine Homes',
          createdAt: new Date().toISOString().split('T')[0],
        };
        chunks.unshift(newChunk);
        mockDb.setRAGChunks(chunks);
        return { data: newChunk };
      },
      invalidatesTags: [{ type: 'RAGChunk', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRAGChunksQuery,
  useAskRAGChatbotMutation,
  useAddDocumentChunkMutation,
} = ragApi;
