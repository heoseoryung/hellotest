import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

/** JS 접근 가능한 XSRF-TOKEN 쿠키를 읽는 헬퍼 */
const getCsrfToken = () => {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:8072/api/v1',
  credentials: 'include', // accessToken · refreshToken HttpOnly 쿠키 자동 전송
  prepareHeaders: (headers) => {
    const csrfToken = getCsrfToken()
    if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken)
    return headers
  },
})

// Gateway가 accessToken 검사 + refreshToken 자동 갱신을 담당한다.
// 프론트로 401이 도달한 경우 = Gateway 갱신까지 실패 → 로그아웃 처리.
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    api.dispatch({ type: 'auth/logout' })
  }
  return result
}

/**
 * 단일 createApi 인스턴스 — 모든 도메인은 injectEndpoints로 확장
 * Mock → 실서버 전환: baseQuery 한 줄만 교체
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'Product', 'Category', 'Cart', 'Order', 'Review', 'User', 'Address', 'Wishlist', 'Search'],
  endpoints: () => ({}),
})
