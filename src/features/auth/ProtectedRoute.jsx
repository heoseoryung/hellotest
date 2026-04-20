import { Navigate, useLocation } from 'react-router-dom'
import useAuth from './useAuth'
import Spinner from '@/shared/components/Spinner'

/**
 * 인증 보호 라우트
 * - isInitialized 전: 스피너 (getMe 응답 대기)
 * - 비로그인 확정:    /login 리다이렉트
 * - 로그인:          children 렌더
 *
 * 스피너를 여기에 두면 공개 페이지(로그인·회원가입)는 getMe 완료를 기다리지 않는다.
 */
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isInitialized } = useAuth()
  const location = useLocation()

  if (!isInitialized) return <Spinner fullscreen />

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
