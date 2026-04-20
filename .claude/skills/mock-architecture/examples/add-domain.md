# 새 도메인 추가 예제: `cart` (장바구니)

`/add-domain cart` 작업의 전체 구현 예시.

---

## Step 1. `src/mocks/cart.js` 생성

```js
// 장바구니 Mock 데이터
// 불변 원본 — mockBaseQuery.js에서 복사하여 가변 관리. 이 파일 직접 변경 금지.

export const mockCartItems = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    name: '오리진 성견용 프리미엄 사료 2kg',
    price: 28000,
    quantity: 2,
    imageUrl: 'https://picsum.photos/seed/dog1/400/300',
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-04-01T10:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    productId: 10,
    name: '내추럴 코튼 로프 장난감 세트',
    price: 9000,
    quantity: 1,
    imageUrl: 'https://picsum.photos/seed/dog10/400/300',
    createdAt: '2025-04-02T14:30:00Z',
    updatedAt: '2025-04-02T14:30:00Z',
  },
]
```

---

## Step 2. `mockBaseQuery.js` 수정

### import 추가 (파일 상단 import 블록 마지막)
```js
import { mockCartItems } from '../mocks/cart'
```

### let 변수 추가 (기존 let 변수 블록 마지막)
```js
let cartItems = [...mockCartItems]
```

### handleRequest() 내부에 라우트 블록 추가 (Users 블록 앞에)
```js
  // ── Cart ──────────────────────────────────────────────────────────────────

  if (url === '/cart' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok(cartItems.filter((x) => x.userId === MOCK_USER.id))
  }

  if (url === '/cart' && method === 'POST') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const existing = cartItems.find(
      (x) => x.userId === MOCK_USER.id && x.productId === body.productId
    )
    if (existing) {
      cartItems = cartItems.map((x) =>
        x.id === existing.id
          ? { ...x, quantity: x.quantity + (body.quantity || 1), updatedAt: new Date().toISOString() }
          : x
      )
      return ok(cartItems.find((x) => x.id === existing.id))
    }
    const product = mockProducts.find((p) => p.id === body.productId)
    if (!product) return fail(404, '상품을 찾을 수 없습니다')
    const newItem = {
      id: cartItems.length + 1,
      userId: MOCK_USER.id,
      productId: body.productId,
      name: product.name,
      price: product.salePrice,
      quantity: body.quantity || 1,
      imageUrl: product.imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    cartItems = [newItem, ...cartItems]
    return ok(newItem)
  }

  // 주의: /cart/clear 를 /cart/:id 보다 앞에 배치 (구체적인 패턴 우선)
  if (url === '/cart/clear' && method === 'DELETE') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    cartItems = cartItems.filter((x) => x.userId !== MOCK_USER.id)
    return ok({ message: '장바구니를 비웠습니다' })
  }

  const cartItemMatch = url.match(/^\/cart\/(\d+)$/)
  if (cartItemMatch && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(cartItemMatch[1])
    const idx = cartItems.findIndex((x) => x.id === id)
    if (idx === -1) return fail(404, '장바구니 항목을 찾을 수 없습니다')
    cartItems = cartItems.map((x, i) =>
      i === idx ? { ...x, ...body, updatedAt: new Date().toISOString() } : x
    )
    return ok(cartItems[idx])
  }

  if (cartItemMatch && method === 'DELETE') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(cartItemMatch[1])
    if (!cartItems.find((x) => x.id === id)) return fail(404, '장바구니 항목을 찾을 수 없습니다')
    cartItems = cartItems.filter((x) => x.id !== id)
    return ok({ message: '장바구니에서 삭제되었습니다' })
  }
```

---

## Step 3. `src/api/cartApi.js` 생성

```js
import { apiSlice } from './apiSlice'

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getCart: builder.query({
      query: () => ({ url: '/cart' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Cart', id })),
              { type: 'Cart', id: 'LIST' },
            ]
          : [{ type: 'Cart', id: 'LIST' }],
    }),

    addToCart: builder.mutation({
      query: (body) => ({ url: '/cart', method: 'POST', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    updateCartItem: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/cart/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Cart', id },
        { type: 'Cart', id: 'LIST' },
      ],
    }),

    removeFromCart: builder.mutation({
      query: (id) => ({ url: `/cart/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Cart', id },
        { type: 'Cart', id: 'LIST' },
      ],
    }),

    clearCart: builder.mutation({
      query: () => ({ url: '/cart/clear', method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi
```

---

## Step 4. `src/api/apiSlice.js` — tagTypes 업데이트

```js
tagTypes: ['Auth', 'Product', 'Order', 'Review', 'Points', 'Inquiry', 'Address', 'Cart'],
```

## Step 5. `src/app/store.js` — import 추가

```js
import '../api/cartApi'   // 기존 import 블록 마지막에 추가
```

## Step 6. `docs/domain/cart.md` 생성 (**New Domain Doc** — 필수)

→ `auto-doc-sync/template.md` 기반으로 작성
