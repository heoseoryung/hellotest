---
name: mock-architecture
description: "멍샵 실서버 API 연동 구조. Mock 시스템은 제거됨. TRIGGER when: 새 도메인이나 API 엔드포인트를 추가할 때, 기존 엔드포인트의 baseURL이나 경로 라우팅을 변경할 때, 다중 백엔드 서버 간 라우팅 구조를 파악해야 할 때. Do NOT use for: 실서버 연동이 완료된 엔드포인트의 비즈니스 로직 수정."
user-invocable: false
---

# API 연동 구조

> **Mock 시스템 완전 제거됨** (2026-04). `src/mocks/`, `mockBaseQuery.js` 없음.  
> 현재 실서버와 직접 연동 중.

---

## 전체 구조

```
컴포넌트
  └─ RTK Query 훅 (useXxxQuery / useXxxMutation)
       └─ apiSlice (baseQuery)
            └─ fetchBaseQuery
                 └─ 게이트웨이 (VITE_API_BASE_URL, 기본: localhost:8072/api/v1)
                      ├─ /auth/*         → auth-server
                      ├─ /users/*        → user-server
                      ├─ /products/*     → product-server
                      ├─ /main/*         → product-server (랜딩페이지 전용)
                      ├─ /search/*       → search-server
                      ├─ /cart/*         → cart-server
                      ├─ /orders/*       → order-server
                      └─ /reviews/*      → review-server
```

---

## 다중 서버 라우팅

게이트웨이가 경로 prefix로 백엔드 서버를 라우팅한다.  
프론트는 게이트웨이 단일 엔드포인트만 사용.

| 경로 prefix | 담당 서버 | API 파일 |
|---|---|---|
| `/auth/*` | auth-server | `authApi.js` |
| `/users/*` | user-server | `authApi.js`, `userApi.js` |
| `/csrf` | auth-server | `authApi.js` |
| `/products/*` | product-server | `productApi.js` |
| `/main/*` | product-server | `productApi.js` (랜딩페이지 전용) |
| `/search/*` | search-server | `searchApi.js`, `categoryApi.js` |
| `/cart/*` | cart-server | `cartApi.js` |
| `/orders/*` | order-server | `orderApi.js` |
| `/reviews/*` | review-server | `reviewApi.js` |
| `/wishlists/*` | wishlist-server | `wishlistApi.js` |

---

## baseQuery 설정 (`src/api/apiSlice.js`)

```js
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:8072/api/v1',
  credentials: 'include',  // HttpOnly 쿠키 자동 전송
  prepareHeaders: (headers) => {
    const csrfToken = getCsrfToken()
    if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken)
    return headers
  },
})
```

---

## 환경 변수

```bash
# .env
VITE_API_BASE_URL=http://localhost:8072/api/v1
```

개발·스테이징·프로덕션 환경별로 게이트웨이 주소만 교체하면 된다.

---

## 새 도메인 추가 절차 (실서버)

1. `src/api/{domain}Api.js` — `injectEndpoints`로 엔드포인트 정의
2. `src/api/apiSlice.js` — `tagTypes` 배열에 새 타입 추가
3. `src/store/store.js` — `import '@/api/{domain}Api'` 추가
4. `docs/domain/{domain}.md` — 비즈니스 명세 작성 (**Docs First** 필수)

---

## 응답 정규화 패턴

각 `transformResponse`에서 서버 DTO → 프론트 모델로 변환:

```js
// 공통 페이지 응답 (searchApi.js 패턴)
const normalizePage = (res, mapFn) => ({
  content:       (res.data ?? []).map(mapFn),
  totalPages:    res.totalPages    ?? 1,
  totalElements: res.totalElements ?? 0,
  currentPage:   res.currentPage   ?? 0,
})

// 단건 응답 (Result 래퍼)
transformResponse: (res) => res.data   // { message, status, data: {...} }

// 직접 배열 반환 (카테고리 API)
transformResponse: (res) => res.data ?? []
```

---

## 절대 금지

```js
// ❌ fetchBaseQuery 외부에서 직접 fetch/axios 사용
fetch('/api/products')
axios.get('/products')

// ❌ 여러 createApi() 인스턴스 생성
const newApi = createApi({ ... })   // apiSlice.injectEndpoints() 사용

// ❌ 토큰을 로컬 저장소에 저장
localStorage.setItem('token', ...)
```
