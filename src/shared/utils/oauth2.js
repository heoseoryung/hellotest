const GATEWAY = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:8072/api/v1'

const PROVIDER_LABELS = {
  google: 'Google',
  kakao:  '카카오',
  naver:  '네이버',
}

/** 소셜 로그인 시작 — 백엔드 OAuth2 엔드포인트로 브라우저 리다이렉트 */
export function startSocialLogin(provider) {
  // OAuth 완료 후 Header가 읽어 Toast 표시용
  sessionStorage.setItem('pendingOAuthProvider', provider)
  window.location.href = `${GATEWAY}/oauth2/authorization/${provider}`
}

export { PROVIDER_LABELS }
