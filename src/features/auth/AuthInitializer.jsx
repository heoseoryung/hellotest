import { useGetCsrfQuery } from '@/api/authApi'
import { useGetCategoriesQuery } from '@/api/categoryApi'
import useAuth from './useAuth'

/**
 * 앱 전역 초기화 훅만 실행. 렌더를 블로킹하지 않는다.
 * - CSRF 쿠키 발급 (GET /api/v1/csrf)
 * - 카테고리 프리패치
 * - getMe 백그라운드 호출 시작 (isInitialized는 ProtectedRoute가 사용)
 */
export default function AuthInitializer({ children }) {
  useGetCsrfQuery()
  useGetCategoriesQuery()
  useAuth()   // getMe 캐시 워밍 — 결과는 ProtectedRoute에서 소비

  return children
}
