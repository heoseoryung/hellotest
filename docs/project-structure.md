# 프로젝트 구조

기준일: 2026-04-20 (GNB 리팩토링 반영)

---

## 디렉토리 구조 (현재)

```
src/
├── api/                          RTK Query API 레이어
│   ├── apiSlice.js               단일 createApi + withReauth (인프라 전용, 수정 금지)
│   ├── authApi.js                인증 엔드포인트 (injectEndpoints) — slice는 features/auth/authSlice.js
│   ├── productApi.js             상품·메인 엔드포인트 (Product Server)
│   ├── searchApi.js              검색·베스트셀러·배너 엔드포인트 (Search Server)
│   ├── categoryApi.js            카테고리 엔드포인트 (Search Server)
│   ├── cartApi.js                장바구니 엔드포인트
│   ├── orderApi.js               주문 엔드포인트
│   ├── reviewApi.js              리뷰 엔드포인트
│   ├── userApi.js                사용자 프로필·배송지 엔드포인트
│   └── wishlistApi.js            위시리스트 엔드포인트
│
├── features/                     도메인별 상태·컴포넌트
│   ├── auth/
│   │   ├── authSlice.js          logout 액션 전용 slice (기본 export: reducer, named: logout)
│   │   ├── useAuth.js            getMe 캐시 구독 훅
│   │   ├── AuthInitializer.jsx   CSRF·카테고리 프리패치, getMe 워밍
│   │   ├── ProtectedRoute.jsx    isInitialized 대기 → 비로그인 시 /login 리다이렉트
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── useLoginForm.js
│   │   ├── useSignupForm.js
│   │   └── useEmailVerify.js
│   ├── cart/
│   │   └── cartSlice.js          checkedItemIds — 서버 isSelected와 동기화 (initCheckedItems)
│   ├── category/
│   │   └── categorySlice.js      selectedCategoryId UI 상태만
│   ├── order/
│   │   └── orderSlice.js         lastCreatedOrder + pagination UI 상태
│   ├── product/
│   │   ├── productSlice.js       검색어·필터·페이지·정렬 UI 상태 (카테고리·서브카테고리는 URL이 단일 진실 공급원)
│   │   ├── StoreProductGrid.jsx  상품 그리드 컴포넌트
│   │   └── useStorePageController.js  URL ?categoryId= / ?sub= 기반 완전 URL 구동 — 카테고리·서브카테고리 모두 URL 파라미터로 관리
│   ├── review/
│   │   └── reviewSlice.js        정렬·페이지 UI 상태
│   ├── ui/
│   │   └── uiSlice.js            토스트 등 전역 UI 상태
│   ├── user/
│   │   └── AddressSearch.jsx     주소 검색 컴포넌트
│   └── components/               공통 UI 컴포넌트
│       ├── home/
│       │   ├── HeroSlider.jsx    메인 배너 슬라이더
│       │   ├── BestSellers.jsx   베스트셀러 섹션
│       │   ├── ProductTabs.jsx   해시태그 상품 탭
│       │   ├── PhotoReviews.jsx  포토리뷰 하이라이트
│       │   └── BrandStory.jsx    브랜드 스토리 섹션
│       ├── layout/
│       │   ├── Layout.jsx        Header + Outlet + Footer
│       │   ├── Header.jsx        2계층 GNB: 상단(STORE·정기배송·베스트셀러·브랜드스토리 고정) + Store 서브네비(카테고리 API 동적, /product/list 한정)
│       │   ├── Footer.jsx
│       │   └── SearchBar.jsx
│       ├── review/
│       │   ├── ReviewItem.jsx
│       │   ├── ReviewList.jsx
│       │   └── ReviewReviewMore.jsx
│       └── ui/
│           └── Toast.jsx
│
├── pages/                        라우트 진입점 페이지 컴포넌트
│   ├── LandingPage.jsx           /
│   ├── StorePage.jsx             /product/list  (?categoryId= / ?sub= URL 파라미터로 카테고리·서브카테고리 구동)
│   ├── ProductDetailPage.jsx     /product/detail/:id, /subscription/detail/:id
│   ├── BestSellerPage.jsx        /best
│   ├── SubscriptionPage.jsx      /subscription
│   ├── CartPage.jsx              /cart (보호)
│   ├── CheckoutPage.jsx          /checkout (보호)
│   ├── OrderPage.jsx             /order/list (보호)
│   ├── OrderDetailPage.jsx       /order/detail/:id (보호)
│   ├── UserProfilePage.jsx       /mypage (보호)
│   ├── ProfileModifyPage.jsx     /profile/modify (보호)
│   ├── WishListPage.jsx          /wishlist (보호)
│   ├── UserCouponPage.jsx        /coupon (보호)
│   ├── UserPointPage.jsx         /point (보호)
│   ├── UserAddressPage .jsx      /address (보호) ← 파일명에 공백 있음 (주의)
│   ├── WriteReviewPage.jsx       /review/write
│   ├── ReviewPage.jsx            /review
│   ├── BrandStoryPage.jsx        /brand-story
│   ├── CSPage.jsx                /cs
│   ├── TermsPage.jsx             /terms
│   └── PrivacyPage.jsx           /privacy
│
├── shared/
│   ├── components/
│   │   ├── Pagination.jsx
│   │   └── Spinner.jsx
│   └── utils/
│       ├── formatters.js         숫자·날짜 포맷, 금액 계산 순수 함수
│       └── oauth2.js             소셜 로그인 state nonce 생성
│
├── store/
│   └── store.js                  configureStore (Redux Toolkit)
│
├── hooks/
│   ├── useAppDispatch.js
│   ├── useAppSelector.js
│   └── useToast.js
│
├── router.jsx                    BrowserRouter + Route 트리
├── main.jsx                      React root (Provider + Router)
└── index.css                     Tailwind CSS v4 설정 + 커스텀 클래스
```

---

## 라우팅 트리

```
BrowserRouter
└── AuthInitializer
    └── Routes
        ├── <Layout>               Header + Outlet + Footer
        │   ├── /                  LandingPage
        │   ├── /product/list      StorePage
        │   ├── /product/list/odog OdogPage
        │   ├── /subscription      SubscriptionPage
        │   ├── /product/detail/:id       ProductDetailPage
        │   ├── /subscription/detail/:id  ProductDetailPage (동일 컴포넌트)
        │   ├── /best              BestSellerPage
        │   ├── /review            ReviewPage
        │   ├── /brand-story       BrandStoryPage
        │   ├── /cs                CSPage
        │   ├── /terms             TermsPage
        │   ├── /privacy           PrivacyPage
        │   │
        │   ├── /cart              ProtectedRoute → CartPage
        │   ├── /checkout          ProtectedRoute → CheckoutPage
        │   ├── /order/list        ProtectedRoute → OrderPage
        │   ├── /order/detail/:id  ProtectedRoute → OrderDetailPage
        │   ├── /mypage            ProtectedRoute → UserProfilePage
        │   ├── /profile/modify    ProtectedRoute → ProfileModifyPage
        │   ├── /wishlist          ProtectedRoute → WishListPage
        │   ├── /coupon            ProtectedRoute → UserCouponPage
        │   ├── /point             ProtectedRoute → UserPointPage
        │   ├── /address           ProtectedRoute → UserAddressPage
        │   ├── /review/write      WriteReviewPage
        │   └── *                  LandingPage (fallback)
        │
        ├── /login                 LoginPage (Layout 밖)
        └── /signup                SignupPage (Layout 밖)
```

---

## Redux Store 구조

```js
store = {
  // ─── 클라이언트 UI 상태 (Redux slice) ───────────────────────────────────
  auth: {}                          // logout 액션만 (상태 없음)
  product: {
    searchKeyword: string,
    pagination: { page, size },
    storeView: {
      sortLabel: string,          // 정렬 선택값만 유지 (카테고리·서브카테고리는 URL ?categoryId= / ?sub= 기준)
    },
    filters: { categoryId, petType, ageGroup, weightClass, minPrice, maxPrice, sortBy, sortDir }
  },
  category: {
    selectedCategoryId: number | null,
  },
  cart: {
    checkedItemIds: number[],       // 서버 isSelected 기준으로 동기화 — 직접 조작 금지
  },
  order: {
    lastCreatedOrder: Order | null, // 주문완료 직후 임시 보관
    pagination: { page, size },
  },
  review: {
    sortBy: 'createdAt'|'rating'|'helpful',
    pagination: { page, size },
  },
  ui: { ... },                      // 토스트 등 전역 UI 상태

  // ─── 서버 데이터 (RTK Query 캐시 — 단일 인스턴스) ─────────────────────
  api: { ... },                     // apiSlice.reducerPath
}
```

> 서버에서 가져온 모든 데이터(상품·주문·리뷰·사용자 등)는 `api` 캐시에만 저장.  
> user 상태도 `getMe` RTK Query 캐시가 단일 출처 — `auth` slice에는 저장하지 않는다.

---

## API 레이어 구조

```
컴포넌트
  └─ RTK Query 훅 (useGetXxxQuery / useXxxMutation)
        └─ apiSlice (단일 createApi)
              └─ baseQuery (fetchBaseQuery + withReauth)
                    └─ HTTP → 서버 (VITE_API_BASE_URL)
```

### 도메인별 API 파일 (`src/api/`)

| 파일 | 담당 도메인 | 백엔드 서버 | 주요 태그 |
|---|---|---|---|
| `authApi.js` | 인증·소셜·이메일 인증·약관·getMe | auth-server / user-server | `Auth` |
| `productApi.js` | 상품 상세·목록·메인 섹션 데이터 | product-server | `Product` |
| `searchApi.js` | 검색·베스트셀러·배너·해시태그탭 | search-server | `Search` |
| `categoryApi.js` | 카테고리 목록 (GNB·필터용) | search-server | `Category` |
| `cartApi.js` | 장바구니 CRUD | cart-server | `Cart` |
| `orderApi.js` | 주문 생성·조회·취소·환불 | order-server | `Order` |
| `reviewApi.js` | 리뷰 CRUD·도움돼요·홈 하이라이트 | review-server | `Review` |
| `userApi.js` | 프로필·비밀번호·배송지 CRUD | user-server | `User`, `Address` |
| `wishlistApi.js` | 위시리스트 CRUD | wishlist-server | `Wishlist` |

> `tagTypes` 전체 목록 (`src/api/apiSlice.js`):  
> `['Auth', 'Product', 'Category', 'Cart', 'Order', 'Review', 'User', 'Address', 'Wishlist', 'Search']`

---

## 인증 흐름 요약

```
브라우저                    서버
GET /api/v1/csrf ──────►  XSRF-TOKEN 쿠키 발급 (JS readable)
POST /auth/login ──────►  access_token·refresh_token HttpOnly 쿠키 저장
◄── (응답 body 없음)

GET /users/me ─────────►  로그인 사용자 정보 반환
◄── { data: { userId, name, email, ... } }

401 수신 시 → Gateway가 refresh_token으로 자동 갱신 시도
갱신 실패 시 → dispatch(logout()) → getMe 캐시 null 초기화 → ProtectedRoute가 /login 리다이렉트
```

---

## 알려진 이슈 / 주의 사항

| 항목 | 내용 |
|---|---|
| 파일명 오타 | `UserAddressPage .jsx` (공백 포함) — import 시 주의 |
| review.md · reviews.md | 두 파일이 중복 존재 (review.md가 최신) |
| Mock 시스템 | 완전 제거됨 (2026-04). 실서버 직접 연동. `src/mock/` 폴더는 잔류할 수 있으나 어디에서도 import 안 됨 |
| MyPageLayout | CLAUDE.md 목표 아키텍처에는 존재하나 현재 미구현 (각 마이페이지는 독립 페이지) |
| baseQuery.js | 별도 파일 없음 — withReauth 로직이 `src/api/apiSlice.js` 내부에 포함됨 |
