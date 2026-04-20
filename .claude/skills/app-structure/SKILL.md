---
name: app-structure
description: "멍샵 Feature-based Design 디렉토리 구조, 라우팅 트리, 컴포넌트 계층 역할, Redux store 구조를 정의한다. TRIGGER when: 새 페이지나 컴포넌트를 추가할 때, 새 도메인 폴더를 생성할 때, router.jsx 라우트 트리를 수정할 때, Layout 구조를 변경할 때, store.js에 새 슬라이스를 등록할 때. Do NOT use for: 컴포넌트 내부 로직이나 스타일 수정 등 구조 변경이 없는 작업."
user-invocable: false
---

# 앱 구조 (App Structure)

디렉토리 구조, 라우팅, 컴포넌트 계층의 설계 원칙과 확장 방법을 정의한다.

---

## 실제 디렉토리 구조

```
src/
├── api/                        인프라 레이어 (단일 createApi + 도메인별 injectEndpoints)
│   ├── apiSlice.js             createApi + 401 logout (baseUrl: VITE_API_BASE_URL)
│   ├── authApi.js              Auth 슬라이스 + authApi injectEndpoints (같은 파일)
│   ├── productApi.js           상품 API (productserver)
│   ├── searchApi.js            검색 API (searchserver) — 상품검색·베스트셀러·배너·카테고리
│   ├── categoryApi.js          카테고리 API → /search/categories (searchserver)
│   ├── cartApi.js
│   ├── orderApi.js
│   ├── reviewApi.js
│   ├── userApi.js
│   └── wishlistApi.js
│
├── features/
│   ├── auth/                   인증 관련 로직·컴포넌트
│   │   ├── AuthInitializer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── useAuth.js
│   │   ├── useLoginForm.js
│   │   ├── useSignupForm.js
│   │   └── useEmailVerify.js
│   ├── product/                상품 UI 상태·컴포넌트
│   │   ├── productSlice.js
│   │   ├── StoreProductGrid.jsx
│   │   └── useStorePageController.js
│   ├── cart/                   cartSlice.js
│   ├── category/               categorySlice.js (선택된 categoryId UI 상태)
│   ├── order/                  orderSlice.js
│   ├── review/                 reviewSlice.js
│   ├── ui/                     uiSlice.js (Toast 등 전역 UI 상태)
│   └── user/                   AddressSearch.jsx
│
├── features/components/        공유 UI 컴포넌트 (도메인 무관)
│   ├── home/                   HeroSlider, BestSellers, ProductTabs, BrandStory, PhotoReviews
│   ├── layout/                 Header, Footer, Layout, SearchBar
│   ├── review/                 ReviewItem, ReviewList, ReviewReviewMore
│   └── ui/                     Toast
│
├── pages/                      페이지 컴포넌트 (라우팅 진입점)
│   ├── LandingPage.jsx
│   ├── StorePage.jsx
│   ├── ProductDetailPage.jsx   (일반 + 정기배송 공용)
│   ├── BestSellerPage.jsx
│   ├── SubscriptionPage.jsx
│   ├── OdogPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrderPage.jsx
│   ├── OrderDetailPage.jsx
│   ├── UserProfilePage.jsx
│   ├── ProfileModifyPage.jsx
│   ├── WishListPage.jsx
│   ├── UserCouponPage.jsx
│   ├── UserPointPage.jsx
│   ├── UserAddressPage.jsx
│   ├── WriteReviewPage.jsx
│   ├── ReviewPage.jsx
│   ├── BrandStoryPage.jsx
│   ├── CSPage.jsx
│   ├── TermsPage.jsx
│   └── PrivacyPage.jsx
│
├── shared/
│   ├── components/             Spinner, Pagination
│   └── utils/                  formatters.js, oauth2.js
│
├── hooks/                      useAppDispatch.js, useAppSelector.js, useToast.js
├── store/
│   └── store.js                Redux store (경로 주의: src/app/ 아님)
└── router.jsx                  BrowserRouter + Routes 정의 (App.jsx 아님)
```

---

## 라우팅 구조 (`src/router.jsx`)

```
BrowserRouter
  └─ AuthInitializer
       └─ Routes
            └─ Layout (Outlet)                ← Header + Footer 포함
                 ├─ /                         LandingPage
                 ├─ /product/list             StorePage
                 ├─ /product/list/odog        OdogPage
                 ├─ /product/detail/:id       ProductDetailPage
                 ├─ /subscription             SubscriptionPage
                 ├─ /subscription/detail/:id  ProductDetailPage (동일 컴포넌트)
                 ├─ /best                     BestSellerPage
                 ├─ /brand-story              BrandStoryPage
                 ├─ /review                   ReviewPage
                 ├─ /cs                       CSPage
                 ├─ /terms                    TermsPage
                 ├─ /privacy                  PrivacyPage
                 │
                 ├─ /cart                     ProtectedRoute → CartPage
                 ├─ /checkout                 ProtectedRoute → CheckoutPage
                 ├─ /order/list               ProtectedRoute → OrderPage
                 ├─ /order/detail/:id         ProtectedRoute → OrderDetailPage
                 ├─ /mypage                   ProtectedRoute → UserProfilePage
                 ├─ /profile/modify           ProtectedRoute → ProfileModifyPage
                 ├─ /wishlist                 ProtectedRoute → WishListPage
                 ├─ /coupon                   ProtectedRoute → UserCouponPage
                 ├─ /point                    ProtectedRoute → UserPointPage
                 ├─ /address                  ProtectedRoute → UserAddressPage
                 ├─ /review/write             WriteReviewPage
                 └─ *                         LandingPage (fallback)

            ├─ /login                         LoginPage   (Layout 밖)
            └─ /signup                        SignupPage  (Layout 밖)
```

> **MyPageLayout 없음** — 마이페이지 하위 페이지들은 각자 독립 페이지.  
> 중첩 `/my/*` 구조 아님. 실제 경로: `/mypage`, `/point`, `/order/list` 등.

### 새 페이지 추가 방법

1. `src/pages/NewPage.jsx` 생성
2. `src/router.jsx`에 import + `<Route>` 추가
3. 인증 필요 시 `<ProtectedRoute>` 래핑

---

## 컴포넌트 계층과 역할

### Layout (`features/components/layout/Layout.jsx`)
- `Header` + `<Outlet />` + `Footer` 조합
- **각 페이지가 자체 `max-w-[1200px]` 래퍼 관리** — Layout이 강제하지 않음

### Header (`features/components/layout/Header.jsx`)
- 로고, GNB(카테고리 동적 로딩), 검색, 마이페이지·주문조회·장바구니 아이콘
- **GNB 메뉴**: `useGetCategoriesQuery()` → `/search/categories` 응답으로 동적 구성 (하드코딩 금지)
- 링크: `/product/list?categoryId={id}`

### AuthInitializer (`features/auth/AuthInitializer.jsx`)
- 앱 최상단에서 `useGetMeQuery()` 호출 → 새로고침 시 세션 복원
- `getMe` 쿼리 완료 전까지 전체 화면 스피너

### ProtectedRoute (`features/auth/ProtectedRoute.jsx`)
- 비로그인 시 `/login`으로 리다이렉트
- `location.pathname`을 `state.from`으로 전달

---

## Redux Store 구조 (`src/store/store.js`)

```js
{
  api:      { ... },      // RTK Query 캐시 (apiSlice.reducerPath)
  auth:     { logout },   // 단순 logout 액션만 — user 상태는 getMe 캐시가 관리
  product:  { ... },      // 상품 필터·페이지네이션 UI 상태
  category: { selectedCategoryId },
  cart:     { ... },
  order:    { ... },
  review:   { ... },
  ui:       { ... },      // Toast 등 전역 UI 상태
}
```

> **user 정보는 Redux slice에 없음.** `useGetMeQuery()` 캐시가 단일 출처.  
> `useAuth()`는 `useGetMeQuery()`를 구독하여 `{ isLoggedIn, user }` 반환.

**새 Redux slice 추가:**
1. `src/features/{domain}/{domain}Slice.js` 생성
2. `src/store/store.js`의 `reducer` 객체에 추가

---

## 도메인별 API 파일 위치

| 파일 | 서버 | 주요 경로 |
|---|---|---|
| `src/api/authApi.js` | auth-server | `/auth/*`, `/users/me` |
| `src/api/productApi.js` | product-server | `/products/*`, `/main/*` |
| `src/api/searchApi.js` | search-server | `/search/*` |
| `src/api/categoryApi.js` | search-server | `/search/categories` |
| `src/api/cartApi.js` | cart-server | `/cart/*` |
| `src/api/orderApi.js` | order-server | `/orders/*` |
| `src/api/reviewApi.js` | review-server | `/reviews/*`, `/products/:id/reviews` |
| `src/api/userApi.js` | user-server | `/users/*` |
| `src/api/wishlistApi.js` | wishlist-server | `/wishlists/*` |

---

## 유틸 파일 역할 (`src/shared/utils/`)

| 파일 | 역할 |
|---|---|
| `formatters.js` | 순수 함수 — 금액 포맷, 날짜 포맷, 마스킹, 계산 함수 |
| `oauth2.js` | OAuth2 state 생성·검증·리다이렉트, PROVIDER_LABELS |

비즈니스 상수는 `formatters.js` 또는 각 도메인 파일에서 관리.
