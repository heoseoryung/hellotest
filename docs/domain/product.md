# Product 도메인

기준일: 2026-04-17

## 개요

상품 목록 조회, 상세 조회, 검색, 베스트/신상품 조회와 랜딩페이지용 섹션 데이터를 담당한다. 카테고리(Category)는 상품 필터링과 긴밀하게 연결되어 이 문서에서 함께 다룬다.

---

## 비즈니스 정책

| 정책 | 값 | 코드 위치 |
|---|---|---|
| 기본 페이지 크기 | 12개 | `src/shared/utils/constants.js` → `PRODUCT_PAGE_SIZE` |
| 배송비 기준 | 50,000원 이상 무료 | `src/shared/utils/constants.js` → `SHIPPING_FREE_THRESHOLD` |
| 기본 배송비 | 5,000원 | `src/shared/utils/constants.js` → `SHIPPING_FEE` |

> 비즈니스 수치는 컴포넌트 하드코딩 금지 — `constants.js`에서만 정의하고 import.

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
    ]  
}
```

#### 서버 → 프론트 필드 매핑 (`productApi.js` `transformResponse`)

| 서버 필드 | 프론트 필드 | 비고 |
|---|---|---|
| `productId` | `id` | |
| `productName` | `name` | |
| `brandName` | `brand` | |
| `content` | `desc` | 타이틀 아래 설명 |
| `detailImagelUrl` | `detailImgs` | **배열** (중첩 배열 포함, `.flat()` 처리). 오타 포함 서버 원본 그대로 |
| `price` | `price` | |
| `imageUrls` | `images` | 배열 |
| `imageUrls[0]` | `img` | 대표 이미지 |
| `stockStatus` | `stockStatus` | `IN_STOCK` / `OUT_OF_STOCK` |
| `stockQuantity` | `stockQuantity` | |
| `options[].optionName` | `options[].label` | |
| `options[].extraPrice` | `options[].extra` | |
| `options[].stockStatus` | `options[].stockStatus` | 옵션별 재고 상태 |

> `detailImagelUrl` 오타는 서버 원본 필드명. 수정 시 백엔드와 협의 필요.

---

## 상품 상세 데이터 구조

```js
{
  id, name, brand, desc, price,
  img,              // 대표 이미지 (imageUrls[0])
  images,           // 이미지 배열 (imageUrls)
  stockStatus,      // 'IN_STOCK' | 'OUT_OF_STOCK'
  stockQuantity,    // 전체 재고 수량
  options: [{ label, extra, stockStatus, stockQuantity }],
  detailImgs,       // 상세 이미지 (detailImagelUrl)
  isSubscribable: boolean,
  subscriptionDiscount: number,
  bundleOptions: [],
  relatedProducts: [{ id, name, originalPrice, discountPrice, img, options }],
}
```

---

## 상품 상세 페이지 (`ProductDetailPage`)

- 경로: `/product/detail/:id` (일반) / `/subscription/detail/:id` (정기배송) — **동일 컴포넌트 사용**
- `product.isSubscribable` 필드로 UI 전체 분기:

### isSubscribable = false (일반 상품)
- 옵션 선택 → 수량 스텝퍼(+/-) → 총 금액 = `(price + optionExtra) × qty`
- "함께 구매하면 좋은 제품" 섹션 표시
- CTA: 장바구니 / 구매하기

### isSubscribable = true (정기배송 가능 상품)
- 구매방법 라디오: 정기배송(할인) / 1회구매
- 정기배송 선택 시 배송주기 select (1주/2주/1개월)
- 옵션 선택 → 번들 수량 그리드(1/2/4/6/10개)
- 총 금액 = `bundleOptions[selectedQty].price + optionExtra - (정기배송 ? subscriptionDiscount : 0)`
- CTA: 장바구니 / 정기배송 신청하기 or 지금 바로 구매하기

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
