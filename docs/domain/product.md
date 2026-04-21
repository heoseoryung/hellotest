# Product 도메인

기준일: 2026-04-21

## 개요

상품 목록 조회, 상세 조회, 검색, 베스트/신상품 조회와 랜딩페이지용 섹션 데이터를 담당한다. 카테고리(Category)는 상품 필터링과 긴밀하게 연결되어 이 문서에서 함께 다룬다.

---

## 비즈니스 정책

| 정책 | 값 | 코드 위치 |
|---|---|---|
| 배송비 기준 | 50,000원 이상 무료 | `src/shared/utils/constants.js` → `SHIPPING_FREE_THRESHOLD` |
| 기본 배송비 | 5,000원 | `src/shared/utils/constants.js` → `SHIPPING_FEE` |

> 페이지 크기(`size`)는 서버 응답에 포함되므로 프론트 상수 관리 대상이 아님.

> 비즈니스 수치는 컴포넌트 하드코딩 금지 — `constants.js`에서만 정의하고 import.

---


## 상품 유형별 상세 페이지 UI 분기

`product.isSubscribable` 값에 따라 UI 전체가 분기된다. **(백엔드 협의 확정)**

### isSubscribable = false (일반 상품)

```
맛 옵션 드롭다운 (product.options) — 일반 상품 전용
  └─ 옵션 선택 후 또는 옵션 없는 상품: 수량 박스 표시
     수량 박스: 상품명 / 선택옵션 + 해당 수량 금액 + [－] 수량 [＋]
──────────────────────────────────────────────
총 금액 | 장바구니  결제하기 → /checkout
```

- 옵션 있는 상품: 옵션 미선택 시 `optionError` 표시 후 진행 차단
- 옵션 없는 상품: 수량 박스 바로 표시

### isSubscribable = true (정기배송 상품)

```
배송주기 드롭다운 (product.deliveryCycles — 백엔드 동적 제공, 필수)
  맛 옵션 드롭다운 없음 — 정기배송은 배송주기 드롭다운만 노출
수량 선택 그리드 (product.bundleOptions)
──────────────────────────────────────────────
총 금액 | 장바구니  결제하기 → /checkout
```

- 배송주기 미선택 시 `cycleError` 표시 후 진행 차단
- 옵션 유효성 검사 없음 (정기배송은 맛 옵션 드롭다운 자체가 없음)

**공통 정책:**
- 구매방법(정기배송/1회구매) 라디오 없음 — 제거됨 (2026-04-21)
- 장바구니·결제하기 버튼 모두 `/checkout` (일반결제 페이지)로 이동
- 이미지 슬라이더: 백엔드 `imageUrls` 배열 최대 10장, 썸네일 가로 스크롤 지원

---

## 상태 구조

```js
// Redux slice (productSlice) — UI 상태만
product
├── searchKeyword: string
├── pagination: { page: 1, size: PRODUCT_PAGE_SIZE }
└── filters
    ├── categoryId:  number | null
    ├── petType:     'DOG'|'CAT'|'ALL' | null
    ├── ageGroup:    null
    ├── weightClass: null
    ├── minPrice / maxPrice: null
    ├── sortBy:      'createdAt'|'price'|'rating'|'sales'
    └── sortDir:     'asc'|'desc'

// category (categorySlice) — 선택된 카테고리 ID만
category
└── selectedCategoryId: number | null
```

서버에서 내려온 상품 데이터는 RTK Query `api` 캐시에만 존재한다.

---

## normalizeProduct 변환 함수

서버 응답 필드명이 다를 수 있어 `productApi.js`에서 정규화:

```js
{
  id:          p.productId ?? p.id,
  name:        p.title ?? p.name,
  img:         p.imageUrl ?? p.thumbnailUrl ?? p.img,
  price:       p.price,
  category:    p.categoryName ?? p.category,
  description: p.description ?? p.desc,
}
```

---

## API 엔드포인트 (`src/api/productApi.js`)

`apiSlice.injectEndpoints()`로 정의.

### 상품 Queries

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetProductByIdQuery(id)` | GET | `/product/:id` | 상품 상세 — Product Server |
| `useGetProductSummaryQuery(id)` | GET | `/product/frontend/:id` | 상품 요약 (이미지·이름·옵션) — 장바구니·주문 경량 조회용 |

> 상품 목록·검색·베스트셀러·신상품 등은 **Search Server** (`searchApi.js`)에서 조회.

### 랜딩페이지 전용 Queries

> 랜딩페이지 섹션 데이터는 모두 **Search Server** (`searchApi.js`)에서 조회.

| 섹션 | 컴포넌트 | 훅 (searchApi.js) | 엔드포인트 |
|---|---|---|---|
| 히어로 배너 | `HeroSlider.jsx` | `useGetMainBannersQuery()` | `GET /search/products/main-banners` |
| 베스트셀러 | `BestSellers.jsx` | `useGetHomeBestsellerQuery()` | `GET /search/products/home-bestseller` |
| 취향저격 탭 | `ProductTabs.jsx` | `useGetTastePicksQuery(brandName?)` | `GET /search/products/taste-picks` |
| 포토리뷰 | `PhotoReviews.jsx` | `useGetReviewHighlightsQuery()` (reviewApi) | `GET /main/review-highlights` |

#### 배너 (`useGetMainBannersQuery`) 응답

서버 원본: `{ productId, imageUrl, displayOrder, isHero }`

```js
// transformResponse 후
{ id, img, href, alt, displayOrder }
```

#### 베스트셀러 (`useGetHomeBestsellerQuery`) 응답

```js
// transformResponse 후 (배열)
[{ id, rank, name, img, price, score, salesCount, createdAt, productUrl }]
```

#### 취향저격 탭 (`useGetTastePicksQuery`) 응답

- `tags[]`: 탭 버튼 목록 (`brandName`, `tagName`, `selected`)
- `selectedBrandName`: 현재 선택된 브랜드
- `products[]`: 해당 브랜드 상품 목록 (`id`, `name`, `img`, `price`, `brandName`, `productUrl`)

브랜드 고정 3종: `오독오독` | `어글어글` | `스위피`

---

## 카테고리 API (`src/api/categoryApi.js`)

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useGetCategoriesQuery()` | GET | `/search/categories` | 전체 목록 — `AuthInitializer`에서 앱 init 시 프리패치, Store 서브네비에서 동적 구성 |

> `id`는 **문자열 코드** (`"ALL"`, `"SNACK_JERKY"` 등). Search Server의 `category` 파라미터로 직접 사용.

### GNB 2계층 구조 (`Header.jsx`)

| 계층 | 항목 | 방식 | 표시 조건 |
|---|---|---|---|
| 상단 GNB | STORE / 정기배송 / 베스트셀러 / 브랜드 스토리 | `NAV_ITEMS` 고정 배열 | 항상 표시 |
| Store 서브네비 | ALL / Snack & Jerky / Meal / Bakery | `useGetCategoriesQuery()` 동적 구성 | `/product/list` 경로일 때만 표시 |

- 상단 GNB 활성 상태: `location.pathname === item.to` — 초록 언더라인 상시 표시  
- 서브네비 링크: `/product/list?categoryId={cat.id}`  
- 서브네비 활성 상태: `searchParams.get('categoryId') ?? 'ALL'` 와 `cat.id` 비교 → `hover-primary active` (초록 필 스타일)

### `useStorePageController` 카테고리 연동

URL이 **단일 진실 공급원(Single Source of Truth)**이다. Redux 상태를 쓰지 않는다.

| URL 파라미터 | 역할 | 예시 |
|---|---|---|
| `?categoryId=` | 대카테고리 코드 | `?categoryId=SNACK_JERKY` |
| `?sub=` | 서브카테고리 이름 | `?sub=오독오독` |

- `categoryId` 변경 시 `setPage(1)` dispatch로 페이지만 초기화  
- 서브카테고리 목록은 `useGetCategoriesQuery()`의 `activeCategory.subCategories`에서 동적으로 구성  
- `StorePage`의 서브카테고리 pill은 `<Link to="?categoryId=...&sub=...">` — 클릭 시 이미 선택된 항목이면 `sub` 파라미터 제거(토글)  
- `OdogPage.jsx` 제거됨 (2026-04-20) — `/product/list?categoryId=SNACK_JERKY&sub=오독오독` 으로 대체

---

## Product Server API

> **Base URL:** `https://localhost:8072/api/v1/product`


---

### `GET /api/v1/product/{productId}` — 상품 상세 조회

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `productId` | Long | ✅ | 조회할 상품 ID |

**성공 응답 (200 OK)**

```json
{  
    "productId": 1,
    "productName": "어글어글 스테이크",
    "categoryId": 1,
    "categoryName": "Meal",
    "brandName": "스위피테린",
    "brandId": 10,
    "content": "",
    "detailImagelUrl": [
      "https://bucket.s3.ap-northeast-2.amazonaws.com/..."
    ],
    "price": 15000,
    "status": "판매중",
    "tags": "[판매1위]",
    "keywords": "",
    "salesCount": 5200,
    "stockQuantity": 50,
    "stockStatus": "IN_STOCK",
    "imageUrls": [
      "https://bucket.s3.ap-northeast-2.amazonaws.com/..."
    ],
    "options": [
      {
        "optionId": 1,
        "optionName": "1인분",
        "extraPrice": 0,
        "stockQuantity": 30,
        "stockStatus": "IN_STOCK"
      }
    ],
    "shippingInfo": "무료배송",
    "isSubscribable": true,
    "deliveryCycles": [
      { "value": "1w", "label": "1주" },
      { "value": "1m", "label": "1달" },
      { "value": "2m", "label": "2달" },
      { "value": "3m", "label": "3달" }
    ]
}
```

#### 서버 → 프론트 필드 매핑 (`productApi.js` `transformResponse`)

| 서버 필드 | 프론트 필드 | 비고 |
|---|---|---|
| `productId` | `id` | |
| `productName` | `name` | `p.productName ?? p.title ?? p.name` 순서로 폴백 |
| `brandName` | `brand` | |
| `brandId` | `brandId` | |
| `categoryId` | `categoryId` | |
| `categoryName` | `category` | |
| `content` | `desc` | `p.content ?? p.description ?? p.desc` 폴백 |
| `price` | `price` | |
| `status` | `status` | 판매중 / 판매중단 등 |
| `tags` | `tags` | 상품 태그 문자열 |
| `salesCount` | `salesCount` | 기본값 `0` |
| `stockQuantity` | `stockQuantity` | 전체 재고 수량, 기본값 `0` |
| `stockStatus` | `stockStatus` | `IN_STOCK` / `OUT_OF_STOCK`, 기본값 `IN_STOCK` |
| `imageUrls` | `images` | 배열. `imageUrl` 단일 필드도 배열로 변환 |
| `imageUrls[0]` | `img` | 대표 이미지 |
| `detailImagelUrl` | `detailImgs` | **배열** — 서버 오타 필드명 그대로 사용. string / 중첩 배열 / JSON 문자열 모두 처리 → `.flat(Infinity)` |
| `options[].optionId` | `options[].id` | 장바구니 추가 시 `optionId`로 전달 |
| `options[].optionName` | `options[].label` | |
| `options[].extraPrice` | `options[].extra` | `extraPrice ?? additionalPrice ?? extra ?? 0` 폴백 |
| `options[].stockQuantity` | `options[].stockQuantity` | 기본값 `0` |
| `options[].stockStatus` | `options[].stockStatus` | 기본값 `IN_STOCK` |
| `shippingInfo` | `shippingInfo` | 배송비 안내 문구 (nullable). `null`이면 constants 폴백 — **2026-04-21 추가** |
| `isSubscribable` | `isSubscribable` | 정기배송 가능 여부, 기본값 `false` |
| `deliveryCycles` | `deliveryCycles` | `[{ value, label }]` — `value`: `c.value ?? c.cycleValue ?? c.cycle` 폴백 |
| `subscriptionDiscount` | `subscriptionDiscount` | 기본값 `0` — 현재 미사용(dead field) |
| `bundleOptions` | `bundleOptions` | 정기배송 수량 선택 그리드용, 기본값 `[]` |
| `relatedProducts` | `relatedProducts` | `[{ id, name, originalPrice, discountPrice, img, options }]` |

> `detailImagelUrl` 오타는 서버 원본 필드명. 수정 시 백엔드와 협의 필요.

---

## 상품 상세 데이터 구조

```js
{
  id, name, brand, brandId, categoryId, category,
  desc,             // content (타이틀 아래 상품 설명)
  price,
  status,           // '판매중' 등
  tags,             // 상품 태그 문자열
  salesCount,       // 판매 수량
  stockQuantity,    // 전체 재고 수량
  stockStatus,      // 'IN_STOCK' | 'OUT_OF_STOCK'
  img,              // 대표 이미지 (imageUrls[0])
  images,           // 이미지 배열 (최대 10장)
  detailImgs,       // 상세 이미지 배열 (detailImagelUrl — 서버 오타 필드명)
  options: [{ id, label, extra, stockQuantity, stockStatus }],
  // options[].id = optionId — 장바구니 추가 시 label이 아닌 id로 전달
  shippingInfo: string | null,  // 이미지 옆 배송비 안내 — null이면 constants 폴백
  isSubscribable: boolean,
  deliveryCycles: [{ value, label }],  // isSubscribable=true 상품에만 데이터 존재
  subscriptionDiscount,  // 현재 미사용 (dead field)
  bundleOptions: [],     // 정기배송 수량 선택 그리드용
  relatedProducts: [{ id, name, originalPrice, discountPrice, img, options }],
}
```

---

## 상품 상세 페이지 (`ProductDetailPage`)

- 경로: `/product/detail/:id` (일반) / `/subscription/detail/:id` (정기배송) — **동일 컴포넌트 사용**
- `product.isSubscribable` 필드로 UI 전체 분기
- 구매 버튼은 정기배송/일반 모두 `/checkout` (일반결제)으로 이동

### isSubscribable = false (일반 상품)
- 맛 옵션 드롭다운 (`product.options`) — 옵션 있을 때만
- 수량 박스: 옵션 선택 후(또는 옵션 없는 상품은 바로) 표시
  - 상품명 + 선택 옵션 / 해당 수량 금액 (`(price + optionExtra) × qty`) / [－][수량][＋]
- 총 금액 = `(price + optionExtra) × qty`
- "함께 구매하면 좋은 제품" 섹션 표시
- CTA: 장바구니 / 결제하기 → `/checkout`

### isSubscribable = true (정기배송 상품)
- 배송주기 드롭다운 (`product.deliveryCycles`, 백엔드 동적 제공, **필수 선택**)
- 맛 옵션 드롭다운 **없음** — 정기배송 상품은 배송주기 드롭다운만 노출
- 수량 선택 그리드 (`product.bundleOptions`)
- 총 금액 = `bundleOptions[selectedQty].price + optionExtra`
- CTA: 장바구니 / 결제하기 → `/checkout`

### 장바구니 추가 (`handleCart`)
옵션 label이 아닌 id를 전달:
```js
const optionId = product.options?.find(o => o.label === selectedOption)?.id ?? null
await addCartItem({
  productId: product.id,
  ...(optionId !== null && { optionId }),
  quantity: qty,
}).unwrap()
```

### 배송비 안내 표시
이미지 옆 가격 하단 — 백엔드 `shippingInfo` 우선, 없으면 constants 폴백:
```js
{product.shippingInfo ?? `${SHIPPING_FREE_THRESHOLD.toLocaleString()}원 이상 구매 시 무료배송 (기본 배송비 ${SHIPPING_FEE.toLocaleString()}원)`}
```

### 배송·교환·반품 탭 (하드코딩)
배송비 수치는 `constants.js`에서 import — 컴포넌트 내 직접 숫자 하드코딩 금지:
```js
`배송비: ${SHIPPING_FEE.toLocaleString()}원 (${SHIPPING_FREE_THRESHOLD.toLocaleString()}원 이상 무료)`
```

---

## 필터 → RTK Query 연동 패턴

```js
const filters = useAppSelector(selectProductFilters)
const { page, size } = useAppSelector(selectProductPagination)

const { data } = useGetProductsQuery({ ...filters, page, size })
```

`setFilters` 호출 시 `pagination.page`가 자동으로 1로 리셋된다.

---

### `GET /api/v1/product/frontend/{productId}` — 상품 요약 조회

장바구니·주문 등 경량 상품 정보가 필요한 컨텍스트에서 사용.

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `productId` | Long | ✅ | 조회할 상품 ID |

**성공 응답 (200 OK)**

```json
{
  "imageUrl": "https://bucket.s3.ap-northeast-2.amazonaws.com/product/images/uuid.png",
  "productId": 1,
  "price": 13000,
  "productName": "어글어글 동물복지 연어마들렌",
  "options": [
    { "optionId": 1, "optionName": "단품" },
    { "optionId": 2, "optionName": "3개 세트" }
  ]
}
```

#### 서버 → 프론트 필드 매핑

| 서버 필드 | 프론트 필드 |
|---|---|
| `productId` | `id` |
| `productName` | `name` |
| `imageUrl` | `img` |
| `price` | `price` |
| `options[].optionId` | `options[].id` |
| `options[].optionName` | `options[].label` |

> 훅: `useGetProductSummaryQuery(id)` — `src/api/productApi.js`
