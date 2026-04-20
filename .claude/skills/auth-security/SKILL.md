---
name: auth-security
description: "멍샵 프로젝트의 인증/보안 구현 표준. HttpOnly 쿠키 기반 JWT, 401 logout 처리, FOUC 방지, 소셜 로그인 패턴을 다룬다. TRIGGER when: 로그인·로그아웃 기능을 구현할 때, JWT 토큰 저장 방식을 결정할 때, 인증이 필요한 페이지를 보호할 때, 401 응답 처리 또는 토큰 갱신 로직을 작성할 때, OAuth 소셜 로그인을 연동할 때, 인증 초기화(새로고침 후 로그인 상태 복원) 로직을 구현할 때. Do NOT use for: 인증과 무관한 일반 API 호출이나 UI 컴포넌트 작업."
user-invocable: false
---

# 인증 & 보안 (Auth & Security)

---

## 인증 구조 요약

```
   브라우저                        게이트웨이 (8072)         백엔드 서버
  │  ── POST /auth/login ──►    │  ─────────────────►   │  set-cookie: access_token (HttpOnly)
  │  ◄─ { status, data } ────   │  ◄─────────────────   │             refresh_token (HttpOnly)
  │                             │                        │             XSRF-TOKEN (JS readable)
  │
  │  Redux: logout 액션만 존재. user 정보는 RTK Query getMe 캐시가 단일 출처.
  │
  │  401 발생 시: 게이트웨이가 refreshToken으로 자동 갱신 시도
  │              갱신 실패 시에만 프론트로 401 전달 → 즉시 logout()
```

---

## 1. Auth 상태 관리 (`src/api/authApi.js`)

Auth Redux slice와 authApi injectEndpoints가 **같은 파일**에 공존:

```js
// src/api/authApi.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {},
  reducers: {
    /** API 401 도달 시 호출 → logoutMiddleware가 getMe 캐시 초기화 */
    logout() {},
  },
})
export const { logout } = authSlice.actions
export default authSlice.reducer
```

**절대 하지 말 것:**
- user, token 등 서버 데이터를 authSlice state에 저장 — getMe 캐시가 단일 출처
- `setUser`, `setInitialized` 같은 추가 액션 생성

### user 정보 단일 출처: getMe 캐시

```js
// authApi.js
getMe: builder.query({
  query: () => ({ url: '/users/me' }),
  transformResponse: (res) => res.data,  // { userId, name, email, phoneNumber, ... }
  providesTags: ['Auth'],
}),
```

`logout()` 액션 → `store.js`의 logoutMiddleware → `getMe` 캐시를 null로 upsert → `useAuth()`의 `isLoggedIn` false 전환.

---

## 2. 401 처리 패턴 (`src/api/apiSlice.js`)

```js
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    api.dispatch({ type: 'auth/logout' })
  }
  return result
}
```

**핵심:** 프론트에서 refresh 재시도 없음. 게이트웨이가 담당하므로 401 = 갱신 완전 실패 = 즉시 logout.

---

## 3. useAuth() 훅 (`src/features/auth/useAuth.js`)

```js
export default function useAuth() {
  const { data: user, isLoading } = useGetMeQuery()
  return {
    isLoggedIn: !!user,
    user,
    isLoading,
  }
}
```

---

## 4. AuthInitializer (`src/features/auth/AuthInitializer.jsx`)

앱 최상단에서 세션 복원. FOUC 방지를 위해 쿼리 완료 전까지 스피너 표시.

```jsx
export default function AuthInitializer({ children }) {
  const { isLoading } = useGetMeQuery()

  if (isLoading) return <Spinner />   // getMe 완료 전: 스피너
  return children
}
```

`router.jsx`에서 `<AuthInitializer>` 가 `<Routes>` 전체를 감싼다.

---

## 5. ProtectedRoute (`src/features/auth/ProtectedRoute.jsx`)

```jsx
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Spinner />
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
```

**LoginPage에서 복귀 처리:**
```jsx
const redirectTo = location.state?.from || '/'
useEffect(() => {
  if (isLoggedIn) navigate(redirectTo, { replace: true })
}, [isLoggedIn])
```

---

## 6. login / logout 흐름

```js
// 로그인: authApi.js
login: builder.mutation({
  query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
  async onQueryStarted(_, { dispatch, queryFulfilled }) {
    try {
      await queryFulfilled
      // 로그인 성공 → getMe 강제 재호출로 user 캐시 갱신
      dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }))
    } catch {}
  },
}),

// 로그아웃: authApi.js
logout: builder.mutation({
  query: () => ({ url: '/auth/logout', method: 'POST' }),
  async onQueryStarted(_, { dispatch, queryFulfilled }) {
    try { await queryFulfilled }
    finally { dispatch(logout()) }
  },
}),
```

---

## 7. OAuth2 소셜 로그인

**핵심 규칙:**
- 프론트엔드는 인가 URL로 리다이렉트만 수행
- Client ID / Secret 코드 포함 절대 금지
- `state` nonce: `generateOAuth2State()` 생성 → sessionStorage 임시 저장
- 콜백에서 `verifyOAuth2State()` 즉시 삭제 (1회용)

```js
// src/shared/utils/oauth2.js
export const redirectToOAuth2 = (provider) => {
  const state = generateOAuth2State()
  window.location.href = `${BASE_URL}/oauth2/authorization/${provider}?state=${state}`
}
```

소셜 로그인 완료 후 `/?linked={provider}` 또는 `/?link_error={reason}` 쿼리파라미터로 결과 수신.

---

## 8. CSRF 처리

`rawBaseQuery`의 `prepareHeaders`에서 자동 처리:

```js
prepareHeaders: (headers) => {
  const csrfToken = getCsrfToken()   // XSRF-TOKEN 쿠키 읽기 (HttpOnly 아님)
  if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken)
  return headers
}
```

`XSRF-TOKEN`: JS 접근 가능 (HttpOnly: false).  
`access_token`, `refresh_token`: JS 접근 불가 (HttpOnly: true).

---

## 보안 금지 사항

```js
// ❌ 토큰 로컬 저장 — 절대 금지
localStorage.setItem('access_token', token)
sessionStorage.setItem('refresh_token', token)

// ❌ OAuth Client Secret 코드 포함 — 절대 금지
const CLIENT_SECRET = 'secret'

// ❌ authSlice에 user/token 저장
dispatch(setUser(data))   // getMe 캐시가 단일 출처
```
