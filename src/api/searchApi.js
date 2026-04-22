import { apiSlice } from './apiSlice'

// ─── 공통 응답 정규화 ──────────────────────────────────────────────────────────

/** Search Server 공통 페이지 응답 → { content, totalPages, totalElements, hasNext, ... } */
const normalizePage = (res, mapFn) => ({
  content:       (res.data ?? []).map(mapFn),
  totalPages:    res.totalPages    ?? 1,
  totalElements: res.totalElements ?? 0,
  currentPage:   res.currentPage   ?? 0,
  hasNext:       res.hasNext       ?? false,
  hasPrevious:   res.hasPrevious   ?? false,
  isFirst:       res.isFirst       ?? true,
  isLast:        res.isLast        ?? true,
  extra:         res.extra         ?? {},
})

/** 검색 상품 DTO 정규화 */
const normalizeSearchProduct = (item) => ({
  id:            item.id,
  name:          item.productTitle,
  img:           item.imageUrl,
  price:         item.price,
  originalPrice: item.originalPrice  ?? null,
  discountRate:  item.discountRate   ?? 0,
  discountTag:   item.discountTag    ?? null,
  isNew:         item.isNew          ?? false,
  productTag:    item.productTag     ?? null,
  productUrl:    item.productUrl     ?? `/product/detail/${item.id}`,
  category:      item.category       ?? null,
})

// ─── Search API ────────────────────────────────────────────────────────────────

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── 1. 상품 검색 ────────────────────────────────────────────────────────
    /**
     * GET /search/products
     * @param {{ title?, keyword?, category?, subCategory?, sortType?, page? }} params
     */
    searchProducts: builder.query({
      query: (params = {}) => ({ url: '/search/products', params }),
      transformResponse: (res) => normalizePage(res, normalizeSearchProduct),
      providesTags: [{ type: 'Search', id: 'PRODUCTS' }],
    }),

    // ── 2. 정기배송 상품 ─────────────────────────────────────────────────────
    /**
     * GET /search/products/subscription
     * @param {{ page? }} params
     */
    getSubscriptionProducts: builder.query({
      query: (params = {}) => ({ url: '/search/products/subscription', params }),
      transformResponse: (res) => normalizePage(res, (item) => ({
        id:         item.id,
        name:       item.productTitle,
        img:        item.imageUrl,
        price:      item.price,
        productUrl: item.productUrl ?? `/product/detail/${item.id}`,
      })),
      providesTags: [{ type: 'Search', id: 'SUBSCRIPTION' }],
    }),

    // ── 3. 베스트셀러 (랭킹) ─────────────────────────────────────────────────
    /**
     * GET /search/products/bestseller
     * 현재 구현: 검색 랭킹 기반 (실판매량 집계 아님)
     */
    getBestsellerProducts: builder.query({
      query: (params = {}) => ({ url: '/search/products/bestseller', params }),
      transformResponse: (res) => normalizePage(res, (item) => ({
        id:         item.id,
        name:       item.productTitle,
        img:        item.imageUrl,
        price:      item.price,
        salesRank:  item.salesRank  ?? null,
        rankTag:    item.rankTag    ?? null,
        productUrl: item.productUrl ?? `/product/detail/${item.id}`,
      })),
      providesTags: [{ type: 'Search', id: 'BESTSELLER' }],
    }),

    // ── 4. 홈 베스트셀러 (메인 페이지 전용) ──────────────────────────────────
    /**
     * GET /search/products/home-bestseller
     * @param {{ size?: number }} params  기본 3개
     */
    getHomeBestseller: builder.query({
      query: (params = {}) => ({ url: '/search/products/home-bestseller', params }),
      transformResponse: (res) => (res.data ?? []).map((item) => ({
        id:         item.productId ?? item.id,
        rank:       item.rank,
        name:       item.productTitle,
        img:        item.imageUrl,
        price:      item.price,
        score:      item.score      ?? null,
        salesCount: item.salesCount ?? 0,
        createdAt:  item.createdAt  ?? null,
        productUrl: `/product/detail/${item.productId ?? item.id}`,
      })),
      providesTags: [{ type: 'Search', id: 'HOME_BESTSELLER' }],
    }),

    // ── 5. 우리 아이 취향 저격 (브랜드별 최신 상품) ──────────────────────────
    /**
     * GET /search/products/taste-picks
     * @param {string | null} brandName  허용: '오독오독' | '어글어글' | '스위피' | null(기본 오독오독)
     * '#오독오독' 형식도 허용.
     *
     * 응답:
     *   extra.tags[]           → 탭 버튼 목록 (brandName, tagName, selected)
     *   extra.selectedBrandName → 현재 선택된 브랜드명
     *   data[]                 → 해당 브랜드 상품 목록
     */
    getTastePicks: builder.query({
      query: (brandName = null) => ({
        url: '/search/products/taste-picks',
        params: brandName ? { brandName } : {},
      }),
      transformResponse: (res) => ({
        tags: (res.extra?.tags ?? []).map((t) => ({
          brandName: t.brandName,
          tagName:   t.tagName,
          selected:  t.selected ?? false,
        })),
        selectedBrandName: res.extra?.selectedBrandName ?? null,
        products: (res.data ?? []).map((item) => ({
          id:         item.productId,
          name:       item.title,
          img:        item.imageUrl,
          price:      item.price,
          brandName:  item.brandName,
          productUrl: `/product/detail/${item.productId}`,
        })),
      }),
      providesTags: (result, error, brandName) => [
        { type: 'Search', id: `TASTE_PICKS_${brandName ?? 'DEFAULT'}` },
      ],
    }),

    // ── 6. 유사 상품 추천 (상세 페이지용) ────────────────────────────────────
    /**
     * GET /search/products/{productId}/similar
     * @param {{ productId: number, size?: number }} params  기본 size=3
     */
    getSimilarProducts: builder.query({
      query: ({ productId, size = 3 }) => ({
        url: `/search/products/${productId}/similar`,
        params: { size },
      }),
      transformResponse: (res) => (res.data ?? []).map((item) => ({
        id:   item.productId,
        name: item.title,
        img:  item.imageUrl,
        tags: item.tags ?? [],
        price: item.price,
        productUrl: `/product/detail/${item.productId}`,
      })),
      providesTags: (result, error, { productId }) => [
        { type: 'Search', id: `SIMILAR_${productId}` },
      ],
    }),

    // ── 6. 자동완성 ──────────────────────────────────────────────────────────
    /**
     * GET /search/products/autocomplete
     * @param {string} name  검색 입력 문자열
     */
    getAutocomplete: builder.query({
      query: (name) => ({ url: '/search/products/autocomplete', params: { name } }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: [{ type: 'Search', id: 'AUTOCOMPLETE' }],
    }),

    // ── 7. 인기 검색어 ────────────────────────────────────────────────────────
    /**
     * GET /search/products/trending
     * 응답: [{ rank, keyword, score }]
     */
    getTrendingKeywords: builder.query({
      query: () => ({ url: '/search/products/trending' }),
      transformResponse: (res) => res.data ?? res ?? [],
      providesTags: [{ type: 'Search', id: 'TRENDING' }],
    }),

    // ── 8. 리뷰 검색 ─────────────────────────────────────────────────────────
    /**
     * GET /search/reviews
     * @param {{ productId?, keyword?, sortType?, reviewType?, page?, size? }} params
     */
    searchReviews: builder.query({
      query: (params = {}) => ({ url: '/search/reviews', params }),
      transformResponse: (res) => normalizePage(res, (r) => r),
      providesTags: [{ type: 'Search', id: 'REVIEWS' }],
    }),

    // ── 9. 공지 검색 ─────────────────────────────────────────────────────────
    /**
     * GET /search/notices
     * @param {{ searchRange?, searchType?, keyword?, page?, size? }} params
     */
    searchNotices: builder.query({
      query: (params = {}) => ({ url: '/search/notices', params }),
      transformResponse: (res) => normalizePage(res, (n) => n),
      providesTags: [{ type: 'Search', id: 'NOTICES' }],
    }),

    // ── 10. 메인 히어로 배너 ──────────────────────────────────────────────────
    /**
     * GET /search/products/main-banners
     * 최신 상품 이미지 기준 3개. isHero는 항상 true.
     */
    getMainBanners: builder.query({
      query: () => ({ url: '/search/products/main-banners' }),
      transformResponse: (res) => (res.data ?? []).map((item) => ({
        id:           item.productId,
        img:          item.imageUrl,
        href:         `/product/detail/${item.productId}`,
        alt:          `배너 상품 ${item.productId}`,
        displayOrder: item.displayOrder,
      })),
      providesTags: [{ type: 'Search', id: 'MAIN_BANNERS' }],
    }),

    // ── 11. 메인 네비게이션 탭 메타데이터 ─────────────────────────────────────
    /**
     * GET /search/navigation
     * GNB 항목(key, label, emoji, route)을 서버에서 동적으로 조회.
     * 렌더링: emoji + label
     *
     * route 불일치 보정: 서버 route 값이 클라이언트 라우터와 다를 수 있어
     * key 기반으로 실제 경로로 매핑한다.
     */
    getNavigation: builder.query({
      query: () => ({ url: '/search/navigation' }),
      transformResponse: (res) => {
        const ROUTE_MAP = {
          STORE:        '/product/list?categoryId=ALL',
          SUBSCRIPTION: '/subscription',
          BESTSELLER:   '/best',
          BRAND:        '/brand-story',
        }
        return (res.data ?? []).map((item) => ({
          key:   item.key,
          label: item.label,
          emoji: item.emoji ?? '',
          route: ROUTE_MAP[item.key] ?? item.route,
        }))
      },
      providesTags: [{ type: 'Search', id: 'NAVIGATION' }],
    }),

    // ── 12. 리뷰 헤더 (평균 별점 / 총 리뷰 수 / 별점 분포) ──────────────────
    /**
     * GET /search/reviews/header
     * @param {{ productId?: number }} params
     * 응답: { avgRating, totalCount, ratingDistribution: { "5": %, ... } }
     */
    getReviewHeader: builder.query({
      query: (params = {}) => ({ url: '/search/reviews/header', params }),
      transformResponse: (res) => res,
      providesTags: (result, error, { productId } = {}) => [
        { type: 'Search', id: productId ? `REVIEW_HEADER_${productId}` : 'REVIEW_HEADER' },
      ],
    }),

    // ── 13. 브랜드 스토리 리소스 ──────────────────────────────────────────────
    /**
     * GET /search/brand-story
     * 브랜드 스토리 카드/페이지 이미지·버튼 리소스 (Vault/Config 기반)
     *
     * 응답:
     *   data.mainCard    → { imageUrl, buttonText, buttonUrl }
     *   data.brandPage[] → [{ imageUrl, buttonText, buttonUrl, displayOrder, isActive }]
     */
    getBrandStory: builder.query({
      query: () => ({ url: '/search/brand-story' }),
      transformResponse: (res) => res.data ?? null,
      providesTags: [{ type: 'Search', id: 'BRAND_STORY' }],
    }),

    // ── 14. 카테고리 목록 ─────────────────────────────────────────────────────
    /**
     * GET /search/categories
     * Vault 설정 기준 카테고리/서브카테고리 목록.
     * id = search category 파라미터 코드 ("SNACK_JERKY")
     * name = 표시용 label ("Snack & Jerky")
     */
    getSearchCategories: builder.query({
      query: () => ({ url: '/search/categories' }),
      transformResponse: (res) => {
        const items = res.data ?? []
        return items.map((cat) => {
          const subs = (cat.subCategories ?? []).map((sub) => ({
            id:   sub.id,
            code: sub.code ?? null,
            name: sub.label,
          }))
          return {
            id:            cat.id,
            name:          cat.label,
            subCategories: subs,
            children:      subs,
          }
        })
      },
      providesTags: [{ type: 'Search', id: 'CATEGORIES' }],
    }),

  }),
})

export const {
  useSearchProductsQuery,
  useLazySearchProductsQuery,
  useGetSubscriptionProductsQuery,
  useGetBestsellerProductsQuery,
  useGetHomeBestsellerQuery,
  useGetTastePicksQuery,
  useGetSimilarProductsQuery,
  useGetAutocompleteQuery,
  useLazyGetAutocompleteQuery,
  useGetTrendingKeywordsQuery,
  useSearchReviewsQuery,
  useSearchNoticesQuery,
  useGetMainBannersQuery,
  useGetNavigationQuery,
  useGetReviewHeaderQuery,
  useGetBrandStoryQuery,
  useGetSearchCategoriesQuery,
} = searchApi
