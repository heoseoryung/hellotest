# RTK Query API Hooks 명세

기준일: 2026-04-20

프로젝트의 모든 RTK Query 훅 상세 명세. 단일 `createApi`(`src/api/apiSlice.js`)에 `injectEndpoints`로 도메인별 주입.

> 비즈니스 정책·상태 구조·캐시 전략 상세는 `docs/domain/*.md` 참조.

---

## 공통 사항

> **Base URL:** `https://localhost:8072/api/v1/`


### Request Headers (전체 공통)

| 헤더 | 값 | 설명 |
|---|---|---|
| `Cookie` | `access_token=...; refresh_token=...` | HttpOnly 쿠키 — 브라우저 자동 전송 |
| `X-XSRF-TOKEN` | `{XSRF-TOKEN 쿠키 값}` | CSRF 방어 — **Mutation 전용** (POST·PUT·DELETE) |
| `Content-Type` | `application/json` | Body가 있는 요청에만 적용 |

### Response Headers (전체 공통)

| 헤더 | 값 | 설명 |
|---|---|---|
| `Content-Type` | `application/json` | 일반 응답 |
| `Set-Cookie` | `access_token=...; HttpOnly` | 로그인·토큰 갱신 시만 서버가 세팅 |




---

## Auth (`src/api/authApi.js`)

---

### `useGetCsrfQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/api/v1/csrf` |

**Request**
- Parameters: 없음
- Body: 없음

**Response**
- Status: `200`
- Body: 없음 (Set-Cookie로 XSRF-TOKEN 발급)
- Headers: `Set-Cookie: XSRF-TOKEN={value}; Path=/`

---

### `useGetMeQuery` / `useLazyGetMeQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/users/me` |

**Request**
- Parameters: 없음
- Body: 없음

**Response Body (서버 원본)**
```json
{
  
    "userId": "username123",
    "name": "홍길동",
    "email": "user@example.com",
    "phoneNumber": "010-1234-5678",
    "smsAllowed": true,
    "emailAllowed": false,
    "updatedAt": "2026-04-16T00:00:00"
  
}
```

**컴포넌트 수신값** (`transformResponse: res.data` 후)
```json
{
  "userId": "username123",
  "name": "홍길동",
  "email": "user@example.com",
  "phoneNumber": "010-1234-5678",
  "smsAllowed": true,
  "emailAllowed": false,
  "updatedAt": "2026-04-16T00:00:00"
}
```

> `transformResponse`: `res.data` 추출 → 컴포넌트는 `data` 필드 직접 수신.  
> Cache Tag: `['Auth']`

---

### `useGetTermsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/auth/terms` |

**Request**
- Parameters: 없음
- Body: 없음
- 인증: 불필요

**Response Body**
```json
{
  "terms": [
    { "id": "service_terms",   "title": "서비스 이용약관",        "content": "...", "required": true,  "version": "1.0", "lastUpdated": "2024-01-01" },
    { "id": "privacy_policy",  "title": "개인정보보호정책",        "content": "...", "required": true,  "version": "1.0", "lastUpdated": "2024-01-01" },
    { "id": "marketing_sms",   "title": "SMS 마케팅 정보 수신",    "content": "...", "required": false, "version": "1.0", "lastUpdated": "2024-01-01" },
    { "id": "marketing_email", "title": "이메일 마케팅 정보 수신", "content": "...", "required": false, "version": "1.0", "lastUpdated": "2024-01-01" }
  ]
}
```

> `transformResponse`: 각 약관에 `required: t.required ?? t.isRequired ?? false` normalize 적용.

---

### `useLoginMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/auth/login` |

**Request Body**
```json
{
  "username": "testuser",
  "password": "TestPass1234!"
}
```

**Response Body**
```json
{ "accessToken": "eyJ..." }
```
Headers: `Set-Cookie: access_token=...; HttpOnly`, `Set-Cookie: refresh_token=...; HttpOnly`

> 응답 바디의 `accessToken`은 저장하지 않는다 (No Token Storage 원칙). 토큰은 HttpOnly 쿠키로만 사용.  
> 성공 후 `getMe` forceRefetch 자동 실행.

---

### `useSignupMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/auth/signup` |

**Request Body**
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

> 비밀번호 규칙: 8~20자, 대·소문자 + 숫자 + 특수문자(`@$!%*?&`) 각 1개 이상.

**Response Body**
```json
{ "accessToken": "eyJ..." }
```
Headers: `Set-Cookie: access_token=...; HttpOnly`, `Set-Cookie: refresh_token=...; HttpOnly`

> 응답 바디의 `accessToken`은 저장하지 않는다 (No Token Storage 원칙).

---

### `useRefreshMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/auth/refresh` |

**Request Body**: 없음 (쿠키의 refresh_token 사용)

**Response**
- Status: `200`
- 새 access_token HttpOnly 쿠키 갱신

---

### `useLogoutMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/auth/logout` |

**Request**
- Body: 없음

**Response**
- Status: `200`
- 서버가 HttpOnly 쿠키 만료 처리

> 성공·실패 무관하게 `dispatch(logout())` 실행.

---

### `useSendEmailVerifyMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/auth/email/send` |

**Request Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `email` | string | Y | 인증 코드를 발송할 이메일 주소 |

**Request Body**: 없음

**Response Body**
```json
{ "message": "인증 코드 발송 완료" }
```

---

### `useVerifyEmailMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/auth/email/verify` |

**Request Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `email` | string | Y | 이메일 주소 |
| `code` | string | Y | 발송된 인증 코드 |

**Request Body**: 없음

**Response Body**
```json
{ "message": "인증 완료" }
```

---

## Category (`src/api/categoryApi.js`)

> Search Server (`/search/categories`) 경유. GNB·상품 필터에 사용.

---

### `useGetCategoriesQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/categories` |

**Request**
- Parameters: 없음
- Body: 없음

**Response Body (서버 원본)**
```json
{
  
  
    {
      "id": "SNACK_JERKY",
      "label": "Snack & Jerky",
      "subCategories": [
        { "id": 11, "code": "JERKY", "label": "육포" }
      ]
    }
  
}
```

**컴포넌트 수신값** (`transformResponse` 후)
```json
[
  {
    "id": "SNACK_JERKY",
    "name": "Snack & Jerky",
    "subCategories": [ { "id": 11, "code": "JERKY", "name": "육포" } ],
    "children": [ { "id": 11, "code": "JERKY", "name": "육포" } ]
  }
]
```

> `id`는 **문자열 코드** (예: `"SNACK_JERKY"`) — Search Server의 `category` 파라미터로 그대로 전달.  
> subCategories/children 항목의 `name`은 서버 원본 `label` 필드를 매핑한 값.  
> `children`은 `subCategories`의 별칭(alias).  
> Cache Tag: `[{ type: 'Category', id: 'LIST' }]`

---

## Product (`src/api/productApi.js`)

Product Server(`/api/v1/product`)의 상품 상세·요약 조회. 목록·검색·베스트셀러는 `searchApi.js` 참조.

---

### `useGetProductByIdQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/product/:id` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | Long | Y | 상품 ID |

**Response Body (서버 원본)**
```json
{
  "productId": 1,
  "productName": "어글어글 스테이크",
  "categoryId": 1,
  "categoryName": "Meal",
  "brandName": "스위피테린",
  "brandId": 10,
  "content": "",
  "detailImagelUrl": ["https://bucket.s3.ap-northeast-2.amazonaws.com/..."],
  "price": 15000,
  "status": "판매중",
  "tags": "[판매1위]",
  "salesCount": 5200,
  "stockQuantity": 50,
  "stockStatus": "IN_STOCK",
  "imageUrls": ["https://bucket.s3.ap-northeast-2.amazonaws.com/..."],
  "options": [
    { "optionId": 1, "optionName": "1인분", "extraPrice": 0, "stockQuantity": 30, "stockStatus": "IN_STOCK" }
  ]
}
```

**컴포넌트 수신값** (`transformResponse` 후)
```js
{
  id, name, brand, brandId, categoryId, category,
  desc,          // content
  price, status, tags, salesCount,
  img,           // imageUrls[0]
  images,        // imageUrls
  stockStatus, stockQuantity,
  detailImgs,    // detailImagelUrl (flat 처리)
  options: [{ id, label, extra, stockQuantity, stockStatus }],
  isSubscribable, subscriptionDiscount,
  bundleOptions, relatedProducts,
}
```

> Cache Tag: `[{ type: 'Product', id }]`

---

### `useGetProductSummaryQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/product/frontend/:id` |

장바구니·주문 등 경량 상품 정보가 필요한 컨텍스트 전용.

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | Long | Y | 상품 ID |

**Response Body (서버 원본)**
```json
{
  "imageUrl": "https://bucket.s3.ap-northeast-2.amazonaws.com/product/images/uuid.png",
  "productId": 1,
  "productName": "어글어글 동물복지 연어마들렌",
  "options": [
    { "optionId": 1, "optionName": "단품" },
    { "optionId": 2, "optionName": "3개 세트" }
  ]
}
```

**컴포넌트 수신값** (`transformResponse` 후)
```js
{
  id,       // productId
  name,     // productName
  img,      // imageUrl
  price,    // price (없으면 0)
  options: [{ id, label }]   // optionId, optionName
}
```

> Cache Tag: `[{ type: 'Product', id: 'summary-{id}' }]`

---

## Cart (`src/api/cartApi.js`)

> 아이템 식별: `productId + optionId` 조합 (cartItemId 없음)  
> 모든 Mutation(selectCartItem 제외): `invalidatesTags: [{ type: 'Cart', id: 'LIST' }]`  
> 금액은 클라이언트 계산 — `useGetProductSummaryQuery`의 `price × quantity` 합산

---

### `useGetCartQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/cart/all` |

**Response Body (서버 원본)**
```json
{
  "userId": 5,
  "items": [
    { "productId": 55, "optionId": 3, "quantity": 2 }
  ]
}
```

**컴포넌트 수신값** (`transformResponse` 후)
```json
{
  "userId": 5,
  "items": [
    { "productId": 55, "optionId": 3, "quantity": 2 }
  ]
}
```

> ACTIVE Cart 없으면 빈 목록 반환.  
> 표시용 데이터(이름·이미지·가격·옵션명)는 `useGetProductSummaryQuery(productId)` 별도 조회.  
> Cache Tag: `[{ type: 'Cart', id: '{productId}-{optionId}' }, ..., { type: 'Cart', id: 'LIST' }]`

---

### `useAddCartItemMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/cart/additem` |

**Request Body**
```json
{ "productId": 55, "optionId": 3, "quantity": 2 }
```

> 동일 `productId + optionId`가 이미 있으면 수량 합산.  
> `invalidatesTags: [{ type: 'Cart', id: 'LIST' }]`

---

### `useUpdateCartItemQuantityMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/cart/item/quantity` |

**Request Body**
```json
{ "productId": 55, "optionId": 3, "quantity": 3 }
```

> `quantity = 0` 이면 서버에서 해당 아이템 삭제.

---

### `useUpdateCartItemOptionMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/cart/item/option` |

**Request Body**
```json
{ "productId": 55, "optionId": 3, "newOptionId": 4 }
```

> 변경 대상 옵션이 이미 존재하면 수량 합산 후 기존 항목 삭제.

---

### `useRemoveCartItemMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `DELETE` |
| **URL** | `/cart/item` |

**Request Body**
```json
{ "productId": 55, "optionId": 3 }
```

> 단건 삭제. 복수 삭제는 반복 호출로 구현.

---

### `useSelectCartItemMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/cart/item/select` |

**Request Body**
```json
{ "productId": 55, "optionId": 3, "isSelected": true }
```

> 선택 상태가 GET 응답에 포함되지 않으므로 캐시 무효화 없음.  
> UI 선택 상태는 Redux `cartSlice`가 관리, 서버 저장용으로만 호출.

---

## Order (`src/api/orderApi.js`)

---

### `useGetOrdersQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/orders` |

**Request Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `page` | number | N | 페이지 번호 |
| `size` | number | N | 페이지 크기 |
| `status` | string | N | 주문 상태 필터 (`PENDING` \| `PREPARING` \| ...) |
| `period` | string | N | 기간 필터 |

**컴포넌트 수신값** (`normalizeOrder` 후)
```json
{
  "content": [
    {
      "id": 100,
      "date": "2026-04-16 14:30:00",
      "status": "배송완료",
      "ordererName": "홍길동",
      "paymentMethod": "CARD",
      "couponDiscount": 0,
      "items": [
        {
          "productId": 1,
          "name": "사료명",
          "option": "1kg",
          "qty": 2,
          "price": 27000,
          "img": "https://...",
          "trackingNo": "123456789",
          "company": "CJ대한통운",
          "itemStatus": "배송완료"
        }
      ],
      "productPrice": 54000,
      "shippingPrice": 0,
      "discountPrice": 0,
      "total": 54000,
      "address": {
        "recipient": "홍길동",
        "zipCode": "06234",
        "address": "서울특별시 강남구 101동 101호",
        "phone": "010-1234-5678",
        "memo": "문 앞에 놔주세요"
      }
    }
  ],
  "totalPages": 3,
  "totalElements": 25
}
```

> Cache Tag: `[{ type: 'Order', id }, ..., { type: 'Order', id: 'LIST' }]`

---

### `useGetOrderByIdQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/orders/:orderId` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `orderId` | number | Y | 주문 ID |

**컴포넌트 수신값**: `useGetOrdersQuery`의 `content[]` 단일 항목과 동일 구조 (id, date, status, ordererName, paymentMethod, couponDiscount, items[], productPrice, shippingPrice, discountPrice, total, address).

> Cache Tag: `[{ type: 'Order', id: orderId }]`

---

### `useCreateOrderMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/orders` |

**Request Body**
```json
{
  "items": [{ "productId": 1, "optionId": 10, "quantity": 2 }],
  "deliveryInfo": {
    "recipientName": "홍길동",
    "phoneNumber": "010-1234-5678",
    "postcode": "06234",
    "baseAddress": "서울특별시 강남구",
    "detailAddress": "101동 101호",
    "deliveryMessage": "문 앞에 놔주세요"
  },
  "paymentMethod": "CARD",
  "couponId": null,
  "discountCode": null,
  "usedPoints": 0
}
```

**Response Body**
```json
{ 
    "orderId": 100, 
    "totalAmount": 54000 
  
}
```

> 성공 후 `setLastCreatedOrder` dispatch.  
> `invalidatesTags: [{ type: 'Order', id: 'LIST' }]`

---

### `useCancelOrderMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/orders/:orderId/cancel` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `orderId` | number | Y | 주문 ID |

**Request Body**
```json
{ "reason": "단순 변심" }
```

**Response Body**
```json
{ "message": "주문이 취소되었습니다." }
```

> `invalidatesTags: [{ type: 'Order', id: orderId }]`

---

### `useRefundOrderMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/orders/:orderId/refund` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `orderId` | number | Y | 주문 ID |

**Request Body**
```json
{ "reason": "상품 불량", "refundType": "REFUND" }
```

**Response Body**
```json
{ "message": "환불 요청이 접수되었습니다." }
```

> `invalidatesTags: [{ type: 'Order', id: orderId }]`

---

## Review (`src/api/reviewApi.js`)

---

### `useGetProductReviewsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/products/:productId/reviews` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `productId` | number | Y | 상품 ID |

**Request Query Parameters** (`params` 객체)
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `page` | number | N | 페이지 번호 |
| `size` | number | N | 페이지 크기 |
| `sortBy` | string | N | `createdAt` \| `rating` \| `helpful` |

**Response Body (서버 원본)**
```json
{
  "content": [
    {
      "reviewId": 1,
      "memberName": "홍*동",
      "createdAt": "2026-04-10T12:00:00",
      "viewCount": 5,
      "rating": 5,
      "content": "정말 좋아요",
      "imageUrls": ["https://..."],
      "helpfulCount": 12,
      "optionName": "1kg"
    }
  ],
  "totalPages": 3,
  "totalElements": 32
}
```

**컴포넌트 수신값** (`transformResponse` 후)
```json
{
  "content": [
    {
      "id": 1,
      "name": "홍*동",
      "date": "2026. 04. 10",
      "views": 5,
      "rating": 5,
      "text": "정말 좋아요",
      "imgs": ["https://..."],
      "helpfulCount": 12,
      "optionText": "구매옵션: 1kg"
    }
  ],
  "totalPages": 3,
  "totalElements": 32
}
```

> 평균별점·분포·카테고리 통계는 **`useGetProductReviewStatsQuery`** 별도 호출 필요.  
> Cache Tag: `[{ type: 'Review', id: 'PRODUCT_{productId}' }]`

---

### `useGetProductReviewStatsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/products/:productId/reviews/stats` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `productId` | number | Y | 상품 ID |

**컴포넌트 수신값** (`transformResponse` 후)
```json
{
  "averageRating": 4.5,
  "totalCount": 32,
  "distribution": [
    { "stars": 5, "pct": 20 },
    { "stars": 4, "pct": 8 },
    { "stars": 3, "pct": 3 },
    { "stars": 2, "pct": 1 },
    { "stars": 1, "pct": 0 }
  ],
  "categoryStats": [
    { "label": "선호도", "topAnswer": "매우 좋아요", "pct": 75 }
  ]
}
```

> 서버 원본 `ratingDistribution`은 객체(`{"5": 20, ...}`) 또는 배열 양쪽 대응.  
> Cache Tag: `[{ type: 'Review', id: 'STATS_{productId}' }]`

---

### `useGetMyReviewsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/reviews/mine` |

**Request Query Parameters**: `params` 객체 (page, size 등)

**Response Body**: `useGetProductReviewsQuery`의 `content[]`와 동일 구조.

> Cache Tag: `[{ type: 'Review', id: 'MINE' }]`

---

### `useGetReviewHighlightsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/main/review-highlights` |

**Request**
- Parameters: 없음
- Body: 없음

**컴포넌트 수신값** (`transformResponse` 후)
```json
{
  "title": "베스트 포토리뷰",
  "items": [
    { "id": 1, "img": "https://...", "title": "상품명", "rating": "★ 4.8(32)", "href": "/review" }
  ]
}
```

> `title`은 `res.title ?? res.sectionTitle ?? ''` 순으로 추출.  
> Cache Tag: `[{ type: 'Review', id: 'HIGHLIGHTS' }]`

---

### `useCreateReviewMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/products/:productId/reviews` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `productId` | number | Y | 상품 ID |

**Request Body** (FormData)
| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `orderId` | number | Y | 주문 ID |
| `rating` | number | Y | 1~5 정수 |
| `content` | string | Y | 최소 10자 ~ 최대 1,000자 |
| `images` | file[] | N | 최대 10장 (jpg·jpeg·png·webp, 장당 최대 10MB) |
| `video` | file | N | 최대 1개 (mp4·mov·avi·webm, 최대 500MB) |
| `tags[preference]` | number | N | `1`\|`2`\|`3` |
| `tags[repurchase]` | number | N | `1`\|`2`\|`3` |
| `tags[freshness]` | number | N | `1`\|`2`\|`3` |

**Response Body**
```json
{ "message": "리뷰가 등록되었습니다." }
```

> `invalidatesTags: ['PRODUCT_{productId}', 'MINE']`

---

### `useUpdateReviewMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/reviews/:reviewId` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `reviewId` | number | Y | 리뷰 ID |

**Request Body**: `useCreateReviewMutation`과 동일 구조 (FormData)

> `invalidatesTags: [reviewId, 'MINE']`

---

### `useDeleteReviewMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `DELETE` |
| **URL** | `/reviews/:reviewId` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `reviewId` | number | Y | 리뷰 ID |

**Request Body**: 없음

**Response**: `204 No Content`

> `invalidatesTags: [reviewId, 'MINE']`

---

### `useMarkReviewHelpfulMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/reviews/:reviewId/helpful` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `reviewId` | number | Y | 리뷰 ID |

**Request Body**: 없음

**Response Body**
```json
{ "message": "도움돼요 처리되었습니다." }
```

> `invalidatesTags: [{ type: 'Review', id: reviewId }]`

---

## User (`src/api/userApi.js`)

---

### `useGetProfileQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/users/profile` |

**Request**
- Parameters: 없음
- Body: 없음

**Response Body**
```json
{
    "userSummary": {
      "id": "username123",
      "name": "홍길동",
      "greetingMessage": "안녕하세요, 홍길동 님!",
      "membershipLevel": "GOLD"
    },
    "benefits": {
      "points": 12500,
      "couponCount": 3,
      "orderTotalCount": 27
    },
    "orderStatusSummary": {
      "paymentPending": 0,
      "preparing": 1,
      "shipping": 2,
      "delivered": 24
    },
    "activityCounts": {
      "wishlistCount": 5,
      "reviewCount": 10
    }
  
}
```

> `transformResponse`: `res.data` 추출.  
> Cache Tag: `['User']`

---

### `useUpdateProfileMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/users/profile` |

**Request Body**
```json
{
  "name": "홍길동",
  "phoneNumber": "010-1234-5678",
  "email": "user@example.com",
  "currentPassword": "OldPass1!",
  "newPassword": "NewPass1!",
  "confirmPassword": "NewPass1!",
  "marketingConsent": {
    "smsAllowed": true,
    "emailAllowed": false
  }
}
```

**Response Body**
```json
{ "message": "회원정보가 수정되었습니다." }
```

> `invalidatesTags: ['Auth', 'User']` — `getMe` + `getProfile` 동시 갱신.

---

### `useDeleteAccountMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `DELETE` |
| **URL** | `/users` |

**Request Body**
```json
{ "password": "CurrentPass1!" }
```

**Response**: `204 No Content`

---

### `useGetAddressesQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/users/addresses` |

**Request**
- Parameters: 없음
- Body: 없음

**Response Body**
```json
{
    "totalCount": 2,
    "addresses": [
      {
        "addressId": 1,
        "addressName": "집",
        "default": true,
        "recipientName": "홍길동",
        "phoneNumber": "010-1234-5678",
        "postcode": "06234",
        "baseAddress": "서울특별시 강남구",
        "detailAddress": "101동 101호",
        "extraAddress": "(역삼동)",
        "addressType": "HOME"
      }
    ]
  
}
```

> `transformResponse`: `res.data` 추출.  
> Cache Tag: `['Address']`

---

### `useCreateAddressMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/users/addresses` |

**Request Body**
```json
{
  "addressName": "집",
  "postcode": "06234",
  "baseAddress": "서울특별시 강남구",
  "detailAddress": "101동 101호",
  "extraAddress": "(역삼동)",
  "addressType": "HOME",
  "default": false
}
```

> `recipientName`, `phoneNumber`는 서버가 사용자 정보로 자동 채움.

**Response Body**
```json
{ "message": "배송지가 등록되었습니다." }
```

> `invalidatesTags: ['Address']`

---

### `useUpdateAddressMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `PUT` |
| **URL** | `/users/addresses/:addressId` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `addressId` | number | Y | 배송지 ID |

**Request Body**: `useCreateAddressMutation`과 동일 구조.

> `invalidatesTags: ['Address']`

---

### `useDeleteAddressMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `DELETE` |
| **URL** | `/users/addresses/:addressId` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `addressId` | number | Y | 배송지 ID |

**Request Body**: 없음

**Response**: `204 No Content`

> `invalidatesTags: ['Address']`

---

## Search (`src/api/searchApi.js`)

> Search Server 전용 — `/search/*` 경로.

### 공통 응답 포맷

```json
{
  "status": "success",
  "totalElements": 100,
  "totalPages": 9,
  "currentPage": 0,
  "size": 12,
  "isFirst": true,
  "isLast": false,
  "hasNext": true,
  "hasPrevious": false,
  "extra": {},
  "data": []
}
```

`normalizePage()` 후 컴포넌트 수신 공통 필드: `content[]`, `totalPages`, `totalElements`, `currentPage`, `hasNext`, `hasPrevious`, `isFirst`, `isLast`, `extra`

---

### `useSearchProductsQuery` / `useLazySearchProductsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products` |

**Request Query Parameters**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `title` | string | N | — | 상품명 검색 |
| `keyword` | string | N | — | 키워드 검색 |
| `category` | string | N | `ALL` | 카테고리 코드 (예: `"SNACK_JERKY"`) |
| `subCategory` | string | N | — | 서브카테고리 |
| `minPrice` | number | N | — | 최소 가격 |
| `maxPrice` | number | N | — | 최대 가격 |
| `searchScope` | string | N | — | 검색 범위 |
| `sortType` | string | N | `최신순` | 정렬 방식 |
| `page` | number | N | `0` | 페이지 번호 (0-based) |
| `size` | number | N | `12` | 페이지 크기 |

**컴포넌트 수신값** (`normalizePage` + `normalizeSearchProduct` 후)
```json
{
  "content": [
    {
      "id": 1,
      "name": "사료명",
      "img": "https://...",
      "price": 30000,
      "originalPrice": 35000,
      "discountRate": 14,
      "discountTag": "14% 할인",
      "isNew": false,
      "productTag": "베스트",
      "productUrl": "/product/detail/1",
      "category": "SNACK_JERKY"
    }
  ],
  "totalPages": 5,
  "totalElements": 48,
  "currentPage": 0,
  "hasNext": true,
  "extra": { "trendingKeywords": ["사료", "간식"] }
}
```

> `extra.trendingKeywords`는 검색 액션일 때만 포함.  
> Cache Tag: `[{ type: 'Search', id: 'PRODUCTS' }]`

---

### `useGetHomeBestsellerQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/home-bestseller` |

**Request Query Parameters**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `size` | number | N | `3` | 조회 개수 |

**컴포넌트 수신값** (`transformResponse` 후)
```json
[
  {
    "id": 1,
    "rank": 1,
    "name": "사료명",
    "img": "https://...",
    "price": 30000,
    "score": 4.8,
    "salesCount": 320,
    "createdAt": "2026-04-01T00:00:00",
    "productUrl": "/product/detail/1"
  }
]
```

> 랜딩페이지 `BestSellers.jsx`가 이 훅을 사용.  
> Cache Tag: `[{ type: 'Search', id: 'HOME_BESTSELLER' }]`

---

### `useGetTastePicksQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/taste-picks` |

**Request Query Parameters**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `brandName` | string | N | `오독오독` | 허용값: `오독오독` \| `어글어글` \| `스위피` (`#오독오독` 형식도 허용) |

**컴포넌트 수신값** (`transformResponse` 후)
```json
{
  "tags": [
    { "brandName": "오독오독", "tagName": "#오독오독", "selected": true },
    { "brandName": "어글어글", "tagName": "#어글어글", "selected": false },
    { "brandName": "스위피",   "tagName": "#스위피",   "selected": false }
  ],
  "selectedBrandName": "오독오독",
  "products": [
    {
      "id": 1,
      "name": "오독오독 바삭한 간식",
      "img": "https://...",
      "price": 12000,
      "brandName": "오독오독",
      "productUrl": "/product/detail/1"
    }
  ]
}
```

> 랜딩페이지 `ProductTabs.jsx`가 이 훅을 사용. `tags[].selected`로 활성 탭 결정.  
> Cache Tag: `[{ type: 'Search', id: 'TASTE_PICKS_{brandName}' }]`

---

### `useGetBestsellerProductsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/bestseller` |

베스트셀러 탭 6개 조회.

**컴포넌트 수신값**
```json
{
  "content": [
    { "id": 1, "name": "사료명", "img": "https://...", "price": 30000, "salesRank": 1, "rankTag": "판매 1위", "productUrl": "/product/detail/1" }
  ]
}
```

> Cache Tag: `[{ type: 'Search', id: 'BESTSELLER' }]`

---

### `useGetSubscriptionProductsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/subscription` |

**Request Query Parameters**: `{ page }`

> Cache Tag: `[{ type: 'Search', id: 'SUBSCRIPTION' }]`

---

### `useGetMainBannersQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/main-banners` |

**컴포넌트 수신값** (`transformResponse` 후)
```json
[
  {
    "id": 1,
    "img": "https://...",
    "href": "/product/detail/1",
    "alt": "배너 상품 1",
    "displayOrder": 0
  }
]
```

> 서버 원본 필드: `productId`, `imageUrl`, `displayOrder`, `isHero`.  
> 랜딩페이지 `HeroSlider.jsx`가 이 훅을 사용.  
> Cache Tag: `[{ type: 'Search', id: 'MAIN_BANNERS' }]`

---

### `useGetSimilarProductsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/:productId/similar` |

**Request**: `{ productId: number, size?: number }` (기본 size=3)

**컴포넌트 수신값**
```json
[
  { "id": 1, "name": "사료명", "img": "https://...", "tags": ["NEW"], "price": 30000, "productUrl": "/product/detail/1" }
]
```

> 태그 우선순위: `[NEW]` > `[판매 1위]` > `[판매 2위]` > `[판매 3위]`  
> Cache Tag: `[{ type: 'Search', id: 'SIMILAR_{productId}' }]`

---

### `useGetAutocompleteQuery` / `useLazyGetAutocompleteQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/autocomplete` |

**Request**: `name` (string, 필수)  
**응답**: `[{ id, title }]`

---

### `useGetTrendingKeywordsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/products/trending` |

**응답**: `[{ rank, keyword, score }]`

---

### `useSearchReviewsQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/reviews` |

**Request**: `{ productId?, keyword?, sortType?, reviewType?, page?, size? }`

---

### `useSearchNoticesQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/notices` |

**Request**: `{ searchRange?, searchType?, keyword?, page?, size? }`  
> `extra.menuTitle`: `"NOTICE"`

---

### `useGetBrandStoryQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/brand-story` |

**컴포넌트 수신값** (`transformResponse` 후)
```json
{
  "mainCard": {
    "imageUrl": "https://...",
    "buttonText": "브랜드 스토리",
    "buttonUrl": "/brand"
  },
  "brandPage": [
    {
      "imageUrl": "https://...",
      "buttonText": "자세히 보기",
      "buttonUrl": "/brand#section1",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

> Cache Tag: `[{ type: 'Search', id: 'BRAND_STORY' }]`

---

### `useGetSearchCategoriesQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/search/categories` |

> `categoryApi.js`의 `useGetCategoriesQuery`와 동일 엔드포인트. 검색 필터에서 직접 사용 시 이 훅 사용.  
> Cache Tag: `[{ type: 'Search', id: 'CATEGORIES' }]`

---

## Wishlist (`src/api/wishlistApi.js`)

---

### `useGetWishlistQuery`

| 항목 | 값 |
|---|---|
| **메서드** | `GET` |
| **URL** | `/wishlist` |

**Request**
- Parameters: 없음
- Body: 없음

**컴포넌트 수신값** (`transformResponse` 후)
```json
[
  {
    "id": 1,
    "name": "사료명",
    "price": 27000,
    "img": "https://...",
    "currentOption": "1kg",
    "options": ["1kg", "2kg"]
  }
]
```

> Cache Tag: `[{ type: 'Wishlist', id: 'LIST' }]`

---

### `useAddWishlistItemMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `POST` |
| **URL** | `/wishlist` |

**Request Body**
```json
{ "productId": 1 }
```

**Response Body**
```json
{ "message": "관심상품에 추가되었습니다." }
```

> `invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }]`

---

### `useRemoveWishlistItemMutation`

| 항목 | 값 |
|---|---|
| **메서드** | `DELETE` |
| **URL** | `/wishlist/:productId` |

**Request Path Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `productId` | number | Y | 상품 ID |

**Request Body**: 없음

**Response**: `204 No Content`

> `invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }]`
