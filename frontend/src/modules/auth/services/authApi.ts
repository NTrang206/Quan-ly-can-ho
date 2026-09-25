import { baseApi } from '../../../stores/baseApi';
import { IUser } from '../../../types';
import { mapUser } from '../../../utils/apiMappers';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: IUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { username: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any): LoginResponse => ({
        access_token: response.access_token,
        token_type: response.token_type,
        user: mapUser(response.user),
      }),
      invalidatesTags: ['Auth'],
    }),
    getCurrentUser: builder.query<IUser, void>({
      query: () => '/auth/me',
      transformResponse: (response: any) => mapUser(response),
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
} = authApi;
