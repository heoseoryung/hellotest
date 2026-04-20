# withReauth 전체 구현 예제

## `src/api/apiSlice.js` 전체

```js
import { createApi } from '@reduxjs/toolkit/query/react'
import { mockBaseQuery } from './mockBaseQuery'
import { logout } from '../features/auth/authSlice'

// ── 백엔드 연결 시 아래 주석 해제 후 mockBaseQuery 교체 ─────────────────────
// import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { getCookie } from '../utils/cookies'
//
// const realBaseQuery = fetchBaseQuery({
//   baseUrl: import.meta.env.VITE_API_URL,
//   credentials: 'include',                           // HttpOnly 쿠키 자동 전송
//   prepareHeaders: (headers) => {
//     const csrfToken = getCookie('XSRF-TOKEN')       // CSRF 토큰 삽입
//     if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken)
//     return headers
//   },
// })
// ─────────────────────────────────────────────────────────────────────────────

const withReauth = (baseQuery) => async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: withReauth(mockBaseQuery),          // Mock → Real 전환 시 여기만 교체
  tagTypes: ['Auth', 'Product', 'Order', 'Review', 'Points', 'Inquiry', 'Address'],
  endpoints: () => ({}),
})
```

---

## 흐름도

```
API 호출
  │
  ▼
withReauth(baseQuery)(args)
  │
  ├─ result.error?.status !== 401 → 결과 그대로 반환
  │
  └─ result.error?.status === 401
       │
       ▼
       POST /auth/refresh
         │
         ├─ 성공(refreshResult.data 존재)
         │    └─ 원래 요청 재시도 → 결과 반환
         │
         └─ 실패(refreshResult.error 존재)
              └─ dispatch(logout())
                   └─ Redux: user → null
                        └─ ProtectedRoute: /login 리다이렉트
```

---

## 의존성 그래프 (순환 없음)

```
apiSlice.js
  └─ imports logout from → features/auth/authSlice.js

authApi.js
  └─ imports apiSlice from → api/apiSlice.js
  └─ imports setUser, setInitialized, logout from → features/auth/authSlice.js

authSlice.js
  └─ imports nothing from api/ (순환 의존성 차단)

store.js
  └─ imports apiSlice, authReducer, authApi, ...
```

**authSlice가 authApi를 import하지 않는 이유:**  
`onQueryStarted`를 authApi 엔드포인트 안에서 사용하여 authSlice의 액션을 dispatch하는 방식으로  
authSlice → authApi 방향의 의존성을 제거했다.
