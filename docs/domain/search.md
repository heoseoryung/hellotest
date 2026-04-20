# Search 도메인

기준일: 2026-04-20

## 개요

별도 Search Server(`/api/v1/search/**`)가 제공하는 검색·추천·랭킹 API를 담당한다.  
RTK Query 엔드포인트는 `src/api/searchApi.js`(`injectEndpoints`)에 정의한다.

---

## Base Path

| 환경 | URL |
|---|---|
| Gateway 경유 | `{VITE_API_BASE_URL}/search/` |
| 예시 (로컬) | `http://localhost:8072/api/v1/search/` |

> `VITE_API_BASE_URL`은 이미 `/api/v1`을 포함하므로 경로에 `/v1/` 중복 불필요.

---

## 공통 응답 포맷

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

---

## 엔드포인트 목록

| 훅 | 메서드 | 경로 | 설명 |
|---|---|---|---|
| `useSearchProductsQuery` / `useLazySearchProductsQuery` | GET | `/search/products` | 상품 검색 (필터·페이지) |
| `useGetSubscriptionProductsQuery` | GET | `/search/products/subscription` | 정기배송 상품 목록 |
| `useGetBestsellerProductsQuery` | GET | `/search/products/bestseller` | 베스트셀러 (랭킹) |
| `useGetHomeBestsellerQuery` | GET | `/search/products/home-bestseller` | 홈 베스트셀러 섹션 (기본 3개) |
| `useGetTastePicksQuery(brandName?)` | GET | `/search/products/taste-picks` | 우리 아이 취향 저격 — 브랜드별 최신 상품 + 탭 목록 |
| `useGetSimilarProductsQuery` | GET | `/search/products/{productId}/similar` | 유사 상품 추천 |
| `useGetAutocompleteQuery` / `useLazyGetAutocompleteQuery` | GET | `/search/products/autocomplete` | 검색어 자동완성 |
| `useGetTrendingKeywordsQuery` | GET | `/search/products/trending` | 인기 검색어 |
| `useSearchReviewsQuery` | GET | `/search/reviews` | 리뷰 검색 |
| `useGetReviewHeaderQuery` | GET | `/search/reviews/header` | 리뷰 헤더 (평균 별점·총 리뷰 수·별점 분포) |
| `useSearchNoticesQuery` | GET | `/search/notices` | 공지 검색 |
| `useGetMainBannersQuery` | GET | `/search/products/main-banners` | 메인 히어로 배너 (3개) |
| `useGetNavigationQuery` | GET | `/search/navigation` | GNB 항목 메타데이터 (key·label·emoji·route) |
| `useGetBrandStoryQuery` | GET | `/search/brand-story` | 브랜드 스토리 카드·페이지 이미지 리소스 |
| `useGetSearchCategoriesQuery` | GET | `/search/categories` | 카테고리·서브카테고리 목록 (GNB·필터용) |

---

## 상품 검색 (`/v1/search/products`)

### Query 파라미터
| 파라미터 | 설명 | 기본값 |
|---|---|---|
| `title` | 상품명 검색어 | - |
| `keyword` | 보조 검색어 | - |
| `category` | 대카테고리 코드 (`ALL`, `SNACK_JERKY` 등) | `ALL` |
| `subCategory` | 서브카테고리 **코드** (`odokodok`, `ugle_jerky` 등) | - |
| `minPrice` | 최소 가격 | - |
| `maxPrice` | 최대 가격 | - |
| `sortType` | 최신순 / 판매량순 / 가격 높은순 / 가격 낮은순 | `최신순` |
| `page` | 페이지 번호 (0-based) | `0` |
| `size` | 페이지 크기 | `12` |

### 서브카테고리 코드표
| 서브카테고리 | 코드 |
|---|---|
| 오독오독 | `odokodok` |
| 어글어글 육포 | `ugle_jerky` |
| 어글어글 우유껌 | `ugle_milk_gum` |
| 오래먹는 간식 | `long_lasting_snack` |
| 스위피 테린 | `sweepy_terrine` |
| 어글어글 스팀 | `ugle_steam` |
| 스위피 그린빈 | `sweepy_greenbean` |

### data[] 필드
```js
{
  id, imageUrl, productTitle, originalPrice, price,
  discountRate, discountTag, isNew, productTag,
  productUrl, category
}
```

### normalizeSearchProduct 변환
```js
{
  id:            item.id,
  name:          item.productTitle,
  img:           item.imageUrl,
  price:         item.price,
  originalPrice: item.originalPrice,
  discountRate:  item.discountRate,
  discountTag:   item.discountTag,
  isNew:         item.isNew,
  productTag:    item.productTag,
  productUrl:    item.productUrl,
  category:      item.category,
}
```

---

## 홈 베스트셀러 (`/v1/search/products/home-bestseller`)

### Query 파라미터
| 파라미터 | 기본값 | 설명 |
|---|---|---|
| `size` | `3` | 노출 개수 |

### data[] 필드
`rank`, `id`, `imageUrl`, `productTitle`, `price`, `score`, `salesCount`, `createdAt`, `productUrl`

---

## 베스트셀러 (`/v1/search/products/bestseller`)

현재 구현은 검색 랭킹 기반 (실판매량 집계 아님).

### data[] 필드
`id`, `imageUrl`, `productTitle`, `price`, `salesRank`, `rankTag`, `productUrl`

---

## 메인 배너 (`/v1/search/products/main-banners`)

최신 상품 이미지 기준 3개 반환. `isHero`는 항상 `true`.

### data[] 필드
`productId`, `imageUrl`, `displayOrder`, `isHero`

컴포넌트에서 사용할 정규화 형태:
```js
{ id: item.productId, img: item.imageUrl, href: `/product/detail/${item.productId}`, displayOrder: item.displayOrder }
```

---

## 우리 아이 취향 저격 (`/v1/search/products/taste-picks`)

홈 "우리 아이 취향 저격 제품" 섹션. 브랜드별 최신 상품 + 탭 목록을 함께 반환.

### Query 파라미터
| 파라미터 | 설명 |
|---|---|
| `brandName` | 브랜드명 (생략 시 서버 기본값 `오독오독`) |

허용 브랜드: `오독오독` | `어글어글` | `스위피` (또는 `#오독오독` 형식도 허용)

### 응답 구조 (transformResponse 후)

```js
{
  tags: [                         // 탭 버튼 목록 (extra.tags)
    { brandName, tagName, selected }
  ],
  selectedBrandName: string,      // 현재 선택된 브랜드명 (extra.selectedBrandName)
  products: [                     // 해당 브랜드 상품 목록 (data[])
    { id, name, img, price, brandName, productUrl }
  ]
}
```

### 사용 패턴 (`ProductTabs.jsx`)

```js
const [activeBrand, setActiveBrand] = useState(null)  // null = 서버 기본값
const { data } = useGetTastePicksQuery(activeBrand)

// 탭 클릭 시
setActiveBrand(tag.brandName)  // 브랜드명 문자열로 변경 → 자동 재조회
```

---

## 브랜드 스토리 (`/v1/search/brand-story`)

브랜드 스토리 카드·페이지 이미지·버튼 리소스 (Vault/Config 기반).

### 응답 구조 (transformResponse: `res.data`)

```js
{
  mainCard: {
    imageUrl: string,
    buttonText: string,
    buttonUrl: string,
  },
  brandPage: [
    { imageUrl, buttonText, buttonUrl, displayOrder, isActive }
  ]
}
```

---

## 유사 상품 추천 (`/v1/search/products/{productId}/similar`)

상세 페이지 "이런 제품은 어때요?" 섹션 전용. `size=3` 고정 권장.

### data[] 필드
`productId`, `imageUrl`, `title`, `tags`, `price`

`tags[]` 우선순위: `[NEW]` → `[판매 1위/2위/3위]`

---

## 자동완성 (`/v1/search/products/autocomplete`)

### Query: `name`
### 응답: `[{ id, title }]`

---

## 인기 검색어 (`/v1/search/products/trending`)

### 응답: `[{ rank, keyword, score }]`

---

## 정기배송 상품 (`/v1/search/products/subscription`)

### data[] 필드
`id`, `imageUrl`, `productTitle`, `price`, `productUrl`

---

## 리뷰 검색 (`/v1/search/reviews`)

> 상품 리뷰 목록(`/products/{id}/reviews`)과 다름 — 전체 검색 전용.

### Query 파라미터
| 파라미터 | 설명 |
|---|---|
| `productId` | 상품 ID 필터 |
| `keyword` | 내용/작성자 검색어 |
| `sortType` | `BEST` 또는 최신순 |
| `reviewType` | `ALL` / `PHOTO` / `IMAGE` / `VIDEO` / `TEXT` |
| `page`, `size` | 페이징 (기본 `0`, `5`) |

---

## 공지 검색 (`/v1/search/notices`)

### Query 파라미터
`searchRange` (전체/일주일/한달/세달), `searchType`, `keyword`, `page`, `size`

---

## 카테고리 목록 (`/search/categories`)

Vault 설정(`dseum.search.categories`) 기준 카테고리/서브카테고리 목록 반환. 하드코딩 없이 탭·필터 구성에 사용.

### 응답 `data[]` 필드

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 카테고리 코드 (`"ALL"`, `"SNACK_JERKY"`, ...) — search `category` 파라미터로 전달 |
| `label` | string | 표시용 이름 (`"ALL"`, `"Snack & Jerky"`, ...) |
| `subCategories` | array | `{ id, code, label }` 배열 |

### 정규화 (`categoryApi.js` → `useGetCategoriesQuery`)
```js
{ id: cat.id, name: cat.label, subCategories/children: [{id, code, name: sub.label}] }
```

> **category**: URL `?categoryId=` 파라미터(코드값, `"SNACK_JERKY"`)를 그대로 전달.  
> **subCategory**: URL `?sub=` 파라미터(코드값, `"odokodok"`)를 그대로 전달. display name(`"오독오독"`) 전달 시 필터 미동작.  
> `categoryApi.js` `transformResponse`에서 `sub.code` 필드로 저장됨 — `StorePage`는 `sub.code`를 URL에 기록하고, `useStorePageController`가 이를 그대로 `subCategory` 파라미터로 전달.

---

## GNB 네비게이션 (`/search/navigation`)

GNB 항목 메타데이터를 서버에서 동적으로 조회한다. `Header.jsx`가 이 데이터를 기반으로 GNB를 렌더링한다.

### 응답 `data[]` 필드

| 필드 | 설명 |
|---|---|
| `key` | 항목 식별자 (`STORE`, `SUBSCRIPTION`, `BESTSELLER`, `BRAND`) |
| `label` | 표시 텍스트 (`STORE`, `정기배송`, `베스트셀러`, `브랜드`) |
| `emoji` | 이모지 — 렌더링: `emoji + label` |
| `route` | 서버 제공 경로 (클라이언트 라우터와 불일치 가능) |

### 렌더링 규칙

- 표시: `{emoji} {label}` (예: `🐾 STORE`)
- API 실패 시 폴백: 이모지 없이 `label`만 표시 (`FALLBACK_NAV` 상수)

### route 불일치 보정 (`searchApi.js` `ROUTE_MAP`)

서버 `route` 필드가 클라이언트 라우터와 다를 수 있어 `key` 기반으로 매핑:

| key | 서버 route | 클라이언트 실제 경로 |
|---|---|---|
| `STORE` | `/product/list?categoryId=ALL` | `/product/list?categoryId=ALL` |
| `SUBSCRIPTION` | `/product/subscription` | `/subscription` |
| `BESTSELLER` | `/product/bestseller` | `/best` |
| `BRAND` | `/brand-story` | `/brand-story` |

---

## 리뷰 헤더 (`/search/reviews/header`)

평균 별점·총 리뷰 수·별점 분포를 조회한다.

### Query 파라미터
| 파라미터 | 설명 |
|---|---|
| `productId` | 상품 ID 필터 (선택) |

### 응답
```js
{
  avgRating: number,          // 평균 별점
  totalCount: number,         // 총 리뷰 수
  ratingDistribution: {       // 별점별 비율 (%)
    "5": number, "4": number, "3": number, "2": number, "1": number
  }
}
```

---

## productApi.js 에서 이전된 엔드포인트

| 구 엔드포인트 | 구 경로 | 이전 후 |
|---|---|---|
| `getBannerSlides` | `/main/banners` | `getMainBanners` → `/v1/search/products/main-banners` |
| `getMainBestSellers` | `/main/best-sellers` | `getHomeBestseller` → `/v1/search/products/home-bestseller` |
| `getBestProducts` | `/products/best` | `getBestsellerProducts` → `/v1/search/products/bestseller` |
| `searchProducts` | `/products/search` | `searchProducts` → `/v1/search/products` |
