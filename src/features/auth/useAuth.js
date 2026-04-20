import { useGetMeQuery } from '@/api/authApi'

/**
 * useAuth — RTK Query getMe 캐시를 단일 출처로 구독
 *
 * - user:          GET /users/me 응답 data 객체 (null이면 비로그인)
 * - isInitialized: 최초 /users/me 요청 완료 여부 (로딩 중 = false)
 * - isLoggedIn:    user !== null
 * - isAdmin:       role === 'ADMIN'
 */
export default function useAuth() {
  const { data: user, isLoading } = useGetMeQuery()

  return {
    user:          user ?? null,
    isInitialized: !isLoading,
    isLoggedIn:    !!user,
    isAdmin:       user?.role === 'ADMIN',
  }
}
