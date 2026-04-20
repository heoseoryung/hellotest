import { apiSlice } from './apiSlice'

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /** 상품별 리뷰 목록 */
    getProductReviews: builder.query({
      query: ({ productId, params }) => ({
        url: `/products/${productId}/reviews`,
        params,
      }),
      transformResponse: (res) => {
        const raw = res.content ?? res.data?.content ?? res.data ?? res ?? []
        const items = Array.isArray(raw) ? raw : []
        return {
          content: items.map((r) => ({
            id: r.reviewId ?? r.id,
            name: r.memberName ?? r.name ?? '익명',
            date: typeof r.createdAt === 'string'
              ? r.createdAt.slice(0, 10).replace(/-/g, '. ')
              : (r.date ?? ''),
            views: r.viewCount ?? r.views ?? 0,
            rating: r.rating ?? r.starRating ?? 0,
            text: r.content ?? r.text ?? '',
            imgs: r.imageUrls ?? r.images ?? r.imgs ?? [],
            helpfulCount: r.helpfulCount ?? 0,
            optionText: r.optionName
              ? `구매옵션: ${r.optionName}`
              : (r.optionText ?? ''),
          })),
          totalPages: res.totalPages ?? res.data?.totalPages ?? 1,
          totalElements: res.totalElements ?? res.data?.totalElements ?? items.length,
        }
      },
      providesTags: (result, error, { productId }) => [
        { type: 'Review', id: `PRODUCT_${productId}` },
      ],
    }),

    /** 상품 리뷰 통계 (평균 별점·분포·키워드) */
    getProductReviewStats: builder.query({
      query: (productId) => ({ url: `/products/${productId}/reviews/stats` }),
      transformResponse: (res) => {
        const d = res.data ?? res
        const rawDist = d.ratingDistribution ?? {}
        const distribution = Array.isArray(rawDist)
          ? rawDist.map((r) => ({
              stars: r.stars ?? r.rating ?? 0,
              pct: r.percentage ?? r.pct ?? 0,
            }))
          : [5, 4, 3, 2, 1].map((s) => ({
              stars: s,
              pct: rawDist[s] ?? rawDist[String(s)] ?? 0,
            }))
        return {
          averageRating: d.averageRating ?? d.starAverage ?? 0,
          totalCount: d.totalCount ?? d.totalReviewAmount ?? 0,
          distribution,
          categoryStats: (d.categoryStats ?? []).map((c) => ({
            label: c.label ?? c.category ?? '',
            topAnswer: c.topAnswer ?? c.mostCommonAnswer ?? '',
            pct: c.percentage ?? c.pct ?? 0,
          })),
        }
      },
      providesTags: (result, error, productId) => [
        { type: 'Review', id: `STATS_${productId}` },
      ],
    }),

    /** 내 리뷰 목록 */
    getMyReviews: builder.query({
      query: (params) => ({ url: '/reviews/mine', params }),
      providesTags: [{ type: 'Review', id: 'MINE' }],
    }),

    /** 리뷰 작성 */
    createReview: builder.mutation({
      query: ({ productId, reviewData }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `PRODUCT_${productId}` },
        { type: 'Review', id: 'MINE' },
      ],
    }),

    /** 리뷰 수정 */
    updateReview: builder.mutation({
      query: ({ reviewId, reviewData }) => ({
        url: `/reviews/${reviewId}`,
        method: 'PUT',
        body: reviewData,
      }),
      invalidatesTags: (result, error, { reviewId }) => [
        { type: 'Review', id: reviewId },
        { type: 'Review', id: 'MINE' },
      ],
    }),

    /** 리뷰 삭제 */
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: 'Review', id: reviewId },
        { type: 'Review', id: 'MINE' },
      ],
    }),

    /** 도움돼요 */
    markReviewHelpful: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}/helpful`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, reviewId) => [
        { type: 'Review', id: reviewId },
      ],
    }),

    /** 홈 포토리뷰 하이라이트 (메인페이지 전용) */
    getReviewHighlights: builder.query({
      query: () => ({ url: '/main/review-highlights' }),
      transformResponse: (res) => {
        const raw = res.data ?? res.items ?? (Array.isArray(res) ? res : [])
        return {
          title: res.title ?? res.sectionTitle ?? '',
          items: raw.map((item) => ({
            id: item.id,
            img: item.reviewImageUrl ?? item.img,
            title: item.title ?? item.productName ?? '',
            rating: `★ ${item.starAverage ?? item.star ?? 0}(${item.totalReviewAmount ?? 0})`,
            href: item.reviewUrl ?? '/review',
          })),
        }
      },
      providesTags: [{ type: 'Review', id: 'HIGHLIGHTS' }],
    }),

  }),
})

export const {
  useGetProductReviewsQuery,
  useGetProductReviewStatsQuery,
  useGetMyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useMarkReviewHelpfulMutation,
  useGetReviewHighlightsQuery,
} = reviewApi
