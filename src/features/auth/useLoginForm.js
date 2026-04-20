import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useLoginMutation } from '@/api/authApi'
import { startSocialLogin } from '@/shared/utils/oauth2'
import useAuth from './useAuth'

export default function useLoginForm() {
  const navigate        = useNavigate()
  const location        = useLocation()
  const [searchParams]  = useSearchParams()

  const [formData, setFormData]         = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')

  const [login, { isLoading }] = useLoginMutation()
  const { isLoggedIn }         = useAuth()

  const redirectTo = location.state?.from || '/'
  const fromSignup = location.state?.fromSignup ?? false

  // 소셜 로그인 실패 시 /login?error={message}
  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError) setError(decodeURIComponent(oauthError))
  }, [])

  // 로그인 완료 시 이전 페이지(또는 홈)로 이동
  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true })
  }, [isLoggedIn])

  const handleLogin = async () => {
    setError('')
    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 입력해 주세요.')
      return
    }
    try {
      await login(formData).unwrap()
    } catch (err) {
      if (err?.status === 423) {
        const seconds = err?.data?.errors?.remainSeconds
        setError(seconds
          ? `계정이 잠겼습니다. ${seconds}초 후 다시 시도해주세요.`
          : (err?.data?.message || '계정이 잠겼습니다. 잠시 후 다시 시도해주세요.')
        )
      } else {
        setError(err?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.')
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return {
    formData, setFormData,
    showPassword, setShowPassword,
    error,
    isLoading,
    fromSignup,
    handleLogin,
    handleKeyDown,
    startSocialLogin,
  }
}
