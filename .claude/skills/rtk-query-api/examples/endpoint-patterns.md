# RTK Query 엔드포인트 패턴 예제

## 패턴 1: 목록 + 단건 쿼리 (Products)

```js
// src/api/productsApi.js
import { apiSlice } from './apiSlice'

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 목록 쿼리 ────────────────────────────────────────────────────────
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),   // params → URL 쿼리스트링
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },             // 목록 전체 태그
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    // ── 단건 쿼리 ────────────────────────────────────────────────────────
    getProduct: builder.query({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

  }),
})

export const { useGetProductsQuery, useGetProductQuery } = productsApi
```

**사용 예:**
```jsx
// 목록 (필터·정렬·페이지네이션)
const { data, isLoading, isFetching } = useGetProductsQuery({
  category: 'food',
  sort: 'price_asc',
  page: 1,
  limit: 12,
})
// data: { products: [...], total: 4, page: 1, limit: 12 }

// 단건 (ID)
const { data: product } = useGetProductQuery(id)
```

---

## 패턴 2: CRUD Mutation (Reviews)

```js
// src/api/reviewsApi.js
export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getProductReviews: builder.query({
      query: ({ productId, ...params }) => ({
        url: `/products/${productId}/reviews`,
        params,
      }),
      providesTags: (result, error, { productId }) => [
        { type: 'Review', id: `product-${productId}` },   // 상품별 리뷰 태그
      ],
    }),

    createReview: builder.mutation({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      // 리뷰 생성 시 관련된 모든 캐시 무효화
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `product-${productId}` },
        { type: 'Review', id: 'MY' },
        { type: 'Product', id: productId },                // 상품 averageRating 갱신
      ],
    }),

    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/reviews/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `product-${productId}` },
        { type: 'Review', id: 'MY' },
      ],
    }),

    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Review', id: 'MY' }],    // MY만 — 상품 리뷰는 productId 모름
    }),

  }),
})
```

**사용 예:**
```jsx
const [createReview, { isLoading }] = useCreateReviewMutation()

const handleSubmit = async () => {
  await createReview({ productId: 1, orderId: 1, rating: 5, content: '좋아요' })
  // invalidatesTags로 자동 refetch — 수동 refetch 불필요
}
```

---

## 패턴 3: onQueryStarted (Auth 전용)

```js
// src/api/authApi.js — onQueryStarted로 Redux state 직접 업데이트
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled      // 실패 시 자동 throw → catch 불필요
        dispatch(setUser(data))                    // Redux state 직접 업데이트
      },
    }),

    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(logout())
        dispatch(apiSlice.util.resetApiState())    // 전체 RTK Query 캐시 초기화
      },
    }),

  }),
})
```

**주의:** 일반 CRUD에는 `onQueryStarted` 사용 금지 — `invalidatesTags`로 충분.

---

## 패턴 4: 조건부 쿼리 (skip)

```jsx
// 인증된 경우에만 데이터 조회
const { isLoggedIn } = useAuth()
const { data } = useGetMyPointsQuery(undefined, {
  skip: !isLoggedIn,   // 비로그인 시 쿼리 자체를 건너뜀
})

// ID가 있을 때만 단건 조회
const { data } = useGetOrderQuery(orderId, {
  skip: !orderId,
})
```

---

## 패턴 5: 인자 형식 정리

```js
// query 함수에서 args 분리 패턴
query: ({ productId, ...params }) => ({
  url: `/products/${productId}/reviews`,
  params,              // 나머지를 URL 쿼리스트링으로
})

// mutation body + id 분리 패턴
query: ({ id, ...body }) => ({
  url: `/reviews/${id}`,
  method: 'PATCH',
  body,
})
```

mockBaseQuery에서 `{ url, method, body, params }` 형태로 수신한다.
