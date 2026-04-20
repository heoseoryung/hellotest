import { apiSlice } from "./apiSlice";
import { logout } from "@/features/auth/authSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─── CSRF 초기화 ────────────────────────────────────────────────────────────

    /** 앱 최초 로드 시 1회 호출 → XSRF-TOKEN 쿠키 발급 */
    getCsrf: builder.query({
      query: () => ({ url: "/csrf" }),
    }),

    // ─── 인증 Mutations ─────────────────────────────────────────────────────────

    /**
     * POST /auth/login
     * accessToken · refreshToken 모두 HttpOnly 쿠키로 자동 저장
     * 로그인 성공 후 /users/me를 강제 재호출하여 캐시 갱신
     */
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }),
          );
        } catch {}
      },
    }),

    /** POST /auth/signup — 약관 동의 포함 */
    signup: builder.mutation({
      query: (userData) => ({
        url: "/auth/signup",
        method: "POST",
        body: userData,
      }),
    }),

    /** POST /auth/refresh — 토큰 갱신 (Gateway 자동 갱신 보조용) */
    refresh: builder.mutation({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),

    /** POST /auth/logout — 서버에서 쿠키 삭제 */
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
        }
      },
    }),

    // ─── 이메일 인증 Mutations ──────────────────────────────────────────────────

    /** POST /auth/email/send?email= — 인증 코드 발송 */
    sendEmailVerify: builder.mutation({
      query: (email) => ({
        url: "/auth/email/send",
        method: "POST",
        params: { email },
      }),
    }),

    /** POST /auth/email/verify?email=&code= — 인증 코드 확인 */
    verifyEmail: builder.mutation({
      query: ({ email, code }) => ({
        url: "/auth/email/verify",
        method: "POST",
        params: { email, code },
      }),
    }),

    // ─── 인증 Queries ───────────────────────────────────────────────────────────

    /**
     * GET /users/me — 로그인 사용자 기본 정보 조회 (구 /auth/me 대체)
     * RTK Query 캐시가 단일 출처 → useAuth()가 직접 구독
     * 새로고침 → 401 → Gateway가 refreshToken으로 자동 갱신 시도 → 실패 시 logout
     * 응답: { status, data: { userId, name, email, phoneNumber, smsAllowed, emailAllowed, updatedAt } }
     */
    getMe: builder.query({
      query: () => ({ url: "/users/me" }),
      transformResponse: (res) => res.data,
      providesTags: ["Auth"],
    }),

    /**
     * GET /auth/terms — 약관 목록 조회 (인증 불필요)
     * 서버 필드명 `required` 로 통일 (구버전 `isRequired` fallback 포함)
     */
    getTerms: builder.query({
      query: () => ({ url: "/auth/terms" }),
      transformResponse: (res) => ({
        ...res,
        terms: (res.terms ?? []).map((t) => ({
          ...t,
          required: t.required ?? t.isRequired ?? false,
        })),
      }),
    }),
  }),
});

export const {
  useGetCsrfQuery,
  useLoginMutation,
  useSignupMutation,
  useRefreshMutation,
  useLogoutMutation,
  useSendEmailVerifyMutation,
  useVerifyEmailMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useGetTermsQuery,
} = authApi;
