# OAuth2 콜백 페이지 구현 예제

## 흐름 요약

```
1. 사용자 "Kakao로 로그인" 클릭
     └─ redirectToOAuth2('kakao')
          └─ generateOAuth2State() → sessionStorage 저장
          └─ window.location.href = '/oauth2/authorization/kakao?state=xxx'

2. Kakao 인증 완료 후 백엔드가 /oauth2/callback?code=...&state=xxx 로 리다이렉트

3. OAuth2CallbackPage 마운트
     └─ URL의 state 파라미터 추출
     └─ verifyOAuth2State(state) → sessionStorage와 비교 후 즉시 삭제
     └─ 검증 성공 → GET /auth/me 호출 → Redux user 저장
     └─ 검증 실패 → 에러 표시
```

---

## `src/utils/oauth2.js`

```js
const STATE_KEY = 'oauth2_state'

export const generateOAuth2State = () => {
  const state = crypto.randomUUID()
  sessionStorage.setItem(STATE_KEY, state)
  return state
}

// verifyOAuth2State 호출 즉시 삭제 (1회용 nonce)
export const verifyOAuth2State = (receivedState) => {
  const stored = sessionStorage.getItem(STATE_KEY)
  sessionStorage.removeItem(STATE_KEY)                 // 검증 결과와 무관하게 즉시 삭제
  return stored !== null && stored === receivedState
}

export const redirectToOAuth2 = (provider) => {
  const state = generateOAuth2State()
  const baseUrl = import.meta.env.VITE_API_URL || ''
  // Client ID는 백엔드가 관리 — 프론트는 경로로 리다이렉트만 (No OAuth Secret)
  window.location.href = `${baseUrl}/oauth2/authorization/${provider}?state=${state}`
}
```

---

## `src/pages/OAuth2CallbackPage.jsx`

```jsx
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGetMeQuery } from '../api/authApi'
import { verifyOAuth2State } from '../utils/oauth2'
import Spinner from '../components/common/Spinner'

export default function OAuth2CallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState(null)

  // state 검증 (마운트 시 1회)
  useEffect(() => {
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError('소셜 로그인이 취소되었습니다')
      return
    }

    if (!verifyOAuth2State(state)) {          // 검증 즉시 sessionStorage 삭제
      setError('보안 검증에 실패했습니다. 다시 시도해 주세요')
      return
    }

    setIsVerified(true)                       // 검증 성공 → /auth/me 쿼리 활성화
  }, [])                                      // 빈 deps: 마운트 시 1회만

  // 검증 성공 시 /auth/me로 세션 확정
  const { isSuccess, isError } = useGetMeQuery(undefined, {
    skip: !isVerified,                        // 검증 전 skip
  })

  useEffect(() => {
    if (isSuccess) navigate('/', { replace: true })
    if (isError)  setError('로그인 처리 중 오류가 발생했습니다')
  }, [isSuccess, isError, navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-error text-lg">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return <Spinner fullscreen />
}
```

---

## App.jsx 라우트 추가

```jsx
// 공개 라우트에 추가 (ProtectedRoute 불필요)
<Route path="oauth2/callback" element={<OAuth2CallbackPage />} />
```

---

## 보안 체크포인트

| 항목 | 구현 위치 | 검증 방법 |
|---|---|---|
| state nonce 생성 | `generateOAuth2State()` | `crypto.randomUUID()` |
| state 임시 저장 | `sessionStorage` (탭 단위 격리) | localStorage 사용 금지 |
| state 1회 삭제 | `verifyOAuth2State()` 내부 | 검증 결과와 무관하게 즉시 삭제 |
| Client Secret | 백엔드 전담 | 프론트 코드에 절대 없어야 함 |
| 세션 확정 | `GET /auth/me` | OAuth 완료 후 반드시 호출 |
