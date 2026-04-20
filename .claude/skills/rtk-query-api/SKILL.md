---
name: rtk-query-api
description: "멍샵 RTK Query API 레이어 구현 표준. 단일 createApi에 injectEndpoints로 도메인을 분리하는 구조, providesTags·invalidatesTags 캐시 무효화 전략, 401 logout 처리 패턴, store.js 등록 절차를 정의한다. TRIGGER when: 새 API 엔드포인트를 추가하거나 기존 엔드포인트를 수정할 때, query·mutation의 캐시 태그 전략을 결정할 때, RTK Query 훅을 새로 생성하거나 도메인 슬라이스를 분리할 때. Do NOT use for: Redux slice UI 상태 관리, 스타일 수정 등 API와 무관한 작업."
user-invocable: false
---

# RTK Query API 패턴

새로운 API 엔드포인트를 추가하거나 수정할 때 반드시 따르는 패턴을 정의한다.

---

## 핵심 원칙

1. **단일 createApi** — `src/api/apiSlice.js`에서만 `createApi()` 호출
2. **injectEndpoints 분리** — 도메인별로 `src/api/{domain}Api.js` 파일로 분리
3. **No Axios** — 모든 HTTP 통신은 RTK Query만 사용
4. **401 = 즉시 logout** — 게이트웨이가 refresh 담당, 프론트는 logout만 처리

---

## 파일 구조

```
src/api/
├── apiSlice.js        ← createApi + 401 logout baseQuery (인프라 전용, 수정 금지)
├── authApi.js         ← Auth 슬라이스 + authApi injectEndpoints (같은 파일)
├── productApi.js      ← productserver 도메인
├── searchApi.js       ← searchserver 도메인 (검색·베스트셀러·배너·카테고리)
├── categoryApi.js     ← searchserver /search/categories
├── cartApi.js
├── orderApi.js
├── reviewApi.js
├── userApi.js
└── wishlistApi.js
```

---

## apiSlice.js 구조 (수정 금지)

```js
// src/api/apiSlice.js
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:8072/api/v1',
  credentials: 'include',   // HttpOnly 쿠키 자동 전송
  prepareHeaders: (headers) => {
    const csrfToken = getCsrfToken()
    if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken)
    return headers
  },
})

// 401 수신 = 게이트웨이 refresh까지 실패 → 즉시 logout
const baseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error?.status === 401) {
    api.dispatch({ type: 'auth/logout' })
  }
  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'Product', 'Category', 'Cart', 'Order', 'Review', 'User', 'Address', 'Wishlist', 'Search'],
  endpoints: () => ({}),
})
```

> **새 도메인 추가 시 `tagTypes` 배열에 반드시 추가.**

---

## injectEndpoints 패턴

```js
// src/api/productApi.js
import { apiSlice } from './apiSlice'

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      transformResponse: (res) => { ... },
      providesTags: (result) =>
        result
          ? [...result.content.map(({ id }) => ({ type: 'Product', id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),
  }),
})

export const { useGetProductsQuery } = productApi
```

---

## 태그 시스템 (캐시 무효화)

### providesTags 패턴

| 상황 | 패턴 |
|---|---|
| 목록 쿼리 | `[...items.map(({id}) => ({type, id})), {type, id:'LIST'}]` |
| 단건 쿼리 | `[{type, id}]` |
| 인증 관련 | `['Auth']` |
| 검색 결과 | `[{ type: 'Search', id: 'PRODUCTS' }]` |

### invalidatesTags 패턴

| 상황 | 패턴 |
|---|---|
| 단건 수정·삭제 | `[{type, id}, {type, id:'LIST'}]` |
| 생성 (ID 모름) | `[{type, id:'LIST'}]` |
| 연관 도메인 갱신 | 여러 타입 배열로 나열 |

---

## 엔드포인트 타입 선택

| HTTP | RTK Query | 용도 |
|---|---|---|
| GET | `builder.query` | 데이터 조회, 캐싱 됨 |
| POST·PUT·PATCH·DELETE | `builder.mutation` | 상태 변경, 캐싱 안 됨 |

---

## onQueryStarted 사용 시점

Redux state를 직접 업데이트해야 할 때만 사용 (주로 auth 관련):

```js
// authApi.js — login 후 getMe 강제 재호출
async onQueryStarted(_, { dispatch, queryFulfilled }) {
  try {
    await queryFulfilled
    dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }))
  } catch {}
}
```

일반 도메인(상품, 주문 등)은 `invalidatesTags`로 캐시 무효화만 하면 충분.

---

## 훅 명명 규칙

```js
// query → useGet{Resource}Query / use{Verb}{Resource}Query
useGetProductQuery(id)
useGetProductsQuery(params)
useSearchProductsQuery(params)
useGetHomeBestsellerQuery()

// mutation → use{Action}{Resource}Mutation
useCreateOrderMutation()
useCancelOrderMutation()
useUpdateReviewMutation()
useDeleteReviewMutation()

// lazy → useLazy{...}Query
useLazySearchProductsQuery()
useLazyGetAutocompleteQuery()
```

---

## store.js 등록 (`src/store/store.js`)

새 API 파일은 반드시 `store.js`에 import해야 `injectEndpoints`가 실제 등록된다:

```js
// src/store/store.js
import '@/api/authApi'
import '@/api/userApi'
import '@/api/categoryApi'
import '@/api/productApi'
import '@/api/cartApi'
import '@/api/orderApi'
import '@/api/reviewApi'
import '@/api/wishlistApi'
import '@/api/searchApi'
// 새 파일 추가 시 이 블록에 추가
```

import만 하면 됨 — named export 불필요.

> **경로 주의**: store는 `src/store/store.js` (`src/app/store.js` 아님)

---

## authApi.js 특이사항

Auth는 Redux slice + API injectEndpoints가 **같은 파일**에 공존:

```js
// src/api/authApi.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {},
  reducers: { logout() {} },   // 단 하나의 액션
})
export const { logout } = authSlice.actions
export default authSlice.reducer   // store에서 auth reducer로 등록

export const authApi = apiSlice.injectEndpoints({ ... })
```

`logout` 액션 발생 시 `store.js`의 `logoutMiddleware`가 `getMe` 캐시를 null로 초기화 → `useAuth()`의 `isLoggedIn`이 false로 전환.

---

## 자주 하는 실수

| 실수 | 올바른 방법 |
|---|---|
| `createApi()`를 새 파일에서 다시 호출 | `apiSlice.injectEndpoints()` 사용 |
| `src/store/store.js` import 누락 | 도메인 Api 파일 추가 후 반드시 import |
| tagTypes에 새 타입 추가 안 함 | `apiSlice.js`의 `tagTypes` 배열에 추가 |
| mutation에 `invalidatesTags` 누락 | 모든 mutation에 설정 |
| query에서 `providesTags` 누락 | 모든 query에 설정 |
| 401 재시도 로직 추가 | 게이트웨이가 담당 — 프론트는 logout만 |
