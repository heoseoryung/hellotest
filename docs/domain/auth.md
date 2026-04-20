# Auth 도메인

기준일: 2026-04-17

## 개요

인증·인가 전체 흐름을 담당한다. 토큰은 HttpOnly 쿠키로만 관리하며, 로그인 사용자 상태는 `getMe` RTK Query 캐시가 단일 출처다.

> 구체적 구현 패턴은 `.claude/skills/auth-security/SKILL.md` 참조.

---

## 인증 구조 (현재 구현)

```
브라우저                      서버
GET /api/v1/csrf ──────►   XSRF-TOKEN 쿠키 발급 (JS readable)
POST /auth/login ──────►   access_token  (HttpOnly 쿠키)
                            refresh_token (HttpOnly 쿠키)

GET /users/me ─────────►   { data: { userId(string), name, email, phoneNumber, smsAllowed, emailAllowed, updatedAt } }

401 수신 → Gateway 자동 갱신 시도 → 실패 → dispatch(logout())
```

---

## 상태 구조 (현재 구현)

```js
// authSlice — logout 액션만 존재, 상태 없음
auth: {}

// getMe RTK Query 캐시 — user 정보의 유일한 출처
api.queries.getMe → {
  userId, name, email, phoneNumber,
  smsAllowed, emailAllowed, updatedAt
} | null
```

**useAuth() 훅** — 컴포넌트에서 사용자 정보 접근 시 이 훅만 사용:

```js
const { user, isInitialized, isLoggedIn, isAdmin } = useAuth()
// user:          getMe 응답 data (null이면 비로그인)
// isInitialized: getMe 첫 요청 완료 여부 (!isLoading)
// isLoggedIn:    !!user
// isAdmin:       user?.role === 'ADMIN'
```

---

## API 엔드포인트 (`src/api/authApi.js`)

`apiSlice.injectEndpoints()`로 정의.

### Queries

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetCsrfQuery()` | GET | `/api/v1/csrf` | XSRF-TOKEN 쿠키 발급 — 앱 최초 로드 시 1회 |
| `useGetMeQuery()` | GET | `/users/me` | 로그인 사용자 정보 — `user` 상태의 단일 출처 |
| `useGetTermsQuery()` | GET | `/auth/terms` | 약관 목록 (인증 불필요) |

### Mutations

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useLoginMutation` | POST | `/auth/login` | 로그인 → getMe forceRefetch |
| `useSignupMutation` | POST | `/auth/signup` | 회원가입 (약관 동의 포함) |
| `useRefreshMutation` | POST | `/auth/refresh` | 토큰 갱신 (Gateway 자동 갱신 보조) |
| `useLogoutMutation` | POST | `/auth/logout` | 로그아웃 → dispatch(logout()) |
| `useSendEmailVerifyMutation` | POST | `/auth/email/send?email=` | 이메일 인증 코드 발송 |
| `useVerifyEmailMutation` | POST | `/auth/email/verify?email=&code=` | 이메일 인증 코드 확인 |

---

## AuthInitializer 패턴 (현재 구현)

```jsx
// src/features/auth/AuthInitializer.jsx
export default function AuthInitializer({ children }) {
  useGetCsrfQuery()          // CSRF 쿠키 발급
  useGetCategoriesQuery()    // 카테고리 프리패치
  useAuth()                  // getMe 캐시 워밍 (결과는 ProtectedRoute에서 소비)
  return children            // 렌더링 블로킹 없음 — ProtectedRoute가 스피너 담당
}
```

---

## ProtectedRoute 패턴 (현재 구현)

```jsx
// src/features/auth/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isInitialized } = useAuth()
  const location = useLocation()

  if (!isInitialized) return <Spinner fullscreen />        // getMe 응답 대기
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}
```

공개 페이지(`/`, `/product/list` 등)는 `ProtectedRoute`를 거치지 않으므로 getMe 완료를 기다리지 않는다.

---

## withReauth 패턴 (현재 구현)

`src/api/apiSlice.js` 내부 (별도 `baseQuery.js` 파일 없음):

```js
// 401 수신 시 = Gateway 갱신까지 실패 → 로그아웃만 처리 (재시도 없음)
if (result.error?.status === 401) {
  api.dispatch(logout())
}
```

`store.js`의 `logoutMiddleware`:
```js
// logout 액션 → getMe 캐시를 null로 초기화 → useAuth().isLoggedIn = false
if (action.type === logout.type) {
  storeAPI.dispatch(apiSlice.util.upsertQueryData('getMe', undefined, null))
}
```

---

## 약관(Terms) API

### GET /auth/terms

인증 불필요. 회원가입 화면 진입 시 호출.

**응답 구조**

```json
{
  "terms": [
    { "id": "service_terms",   "title": "서비스 이용약관",       "content": "...", "required": true,  "version": "1.0", "lastUpdated": "2024-01-01" },
    { "id": "privacy_policy",  "title": "개인정보보호정책",       "content": "...", "required": true,  "version": "1.0", "lastUpdated": "2024-01-01" },
    { "id": "marketing_sms",   "title": "SMS 마케팅 정보 수신",   "content": "...", "required": false, "version": "1.0", "lastUpdated": "2024-01-01" },
    { "id": "marketing_email", "title": "이메일 마케팅 정보 수신", "content": "...", "required": false, "version": "1.0", "lastUpdated": "2024-01-01" }
  ]
}
```

> 필드명: `required` (구버전 `isRequired` → 변경됨). `transformResponse`에서 `required ?? isRequired`로 normalize.

### POST /auth/login / POST /auth/signup 응답

```json
{ "accessToken": "eyJ..." }
```

토큰은 HttpOnly 쿠키로도 동시 발급. 프론트는 응답 바디의 `accessToken`을 저장하지 않는다 (No Token Storage 원칙).

### POST /auth/refresh

**경로:** `POST /auth/refresh`  
응답: 새 accessToken HttpOnly 쿠키 갱신 (응답 바디 없음).
```

### POST /auth/signup

**요청 바디**

```json
{
  "username": "testuser",
  "name": "홍길동",
  "email": "test@example.com",
  "password": "TestPass1234!",
  "phoneNumber": "010-1234-5678",
  "termsAgreed": {
    "service_terms": true,
    "privacy_policy": true,
    "marketing_sms": false,
    "marketing_email": false
  }
}
```

**비밀번호 규칙:** 8~20자, 대/소문자 + 숫자 + 특수문자(`@$!%*?&`) 각 1개 이상.

---

## OAuth2 소셜 로그인

- 프론트는 `/oauth2/authorization/{provider}`로 리다이렉트만 수행
- `state` nonce: `generateOAuth2State()` 생성 → sessionStorage 임시 저장 (콜백 검증 후 즉시 삭제)
- Client ID · Secret 코드 포함 절대 금지 (**No OAuth Secret**)
