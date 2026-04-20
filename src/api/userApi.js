import { apiSlice } from './apiSlice'

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ─── 프로필 Queries ─────────────────────────────────────────────────────────

    /**
     * GET /users/profile — 마이페이지 요약 정보 조회
     * 응답: { status, data: { userSummary, benefits, orderStatusSummary, activityCounts } }
     */
    getProfile: builder.query({
      query: () => ({ url: '/users/profile' }),
      transformResponse: (res) => res.data,
      providesTags: ['User'],
    }),

    // ─── 프로필 Mutations ───────────────────────────────────────────────────────

    /**
     * PUT /users/profile — 회원정보 수정
     * 비밀번호 변경, 이름·전화번호, 마케팅 수신 동의를 한 번에 처리
     *
     * body: {
     *   name, phoneNumber, email,
     *   currentPassword, newPassword, confirmPassword,
     *   marketingConsent: { smsAllowed, emailAllowed }
     * }
     */
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/profile', method: 'PUT', body }),
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * DELETE /users — 회원 탈퇴
     * body: { password }
     */
    deleteAccount: builder.mutation({
      query: (body) => ({ url: '/users', method: 'DELETE', body }),
    }),

    // ─── 배송지 Queries ─────────────────────────────────────────────────────────

    /**
     * GET /users/addresses — 배송지 목록 조회
     * 응답: { status, data: { totalCount, addresses: [...] } }
     */
    getAddresses: builder.query({
      query: () => ({ url: '/users/addresses' }),
      transformResponse: (res) => res.data,
      providesTags: ['Address'],
    }),

    // ─── 배송지 Mutations ───────────────────────────────────────────────────────

    /**
     * POST /users/addresses — 배송지 등록
     * body: { postcode, baseAddress, detailAddress, extraAddress, addressType, default }
     * recipientName, phoneNumber 는 서버가 사용자 정보로 자동 채움
     */
    createAddress: builder.mutation({
      query: (body) => ({ url: '/users/addresses', method: 'POST', body }),
      invalidatesTags: ['Address'],
    }),

    /**
     * PUT /users/addresses/{addressId} — 배송지 수정
     * body: 등록과 동일
     */
    updateAddress: builder.mutation({
      query: ({ addressId, ...body }) => ({
        url: `/users/addresses/${addressId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Address'],
    }),

    /**
     * DELETE /users/addresses/{addressId} — 배송지 삭제
     */
    deleteAddress: builder.mutation({
      query: (addressId) => ({
        url: `/users/addresses/${addressId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Address'],
    }),

  }),
})

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = userApi
