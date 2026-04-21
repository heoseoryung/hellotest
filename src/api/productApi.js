import { apiSlice } from './apiSlice'

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /** 상품 상세 — Product Server: GET /api/v1/product/{productId} */
    getProductById: builder.query({
      query: (id) => ({ url: `/product/${id}` }),
      transformResponse: (res) => {
        const p = res.data ?? res
        const imageUrls = p.imageUrls ?? (p.imageUrl ? [p.imageUrl] : [])
        return {
          id:            p.productId ?? p.id,
          name:          p.productName ?? p.title ?? p.name,
          brand:         p.brandName  ?? p.brand,
          brandId:       p.brandId    ?? null,
          categoryId:    p.categoryId ?? null,
          category:      p.categoryName ?? p.category,
          desc:          p.content ?? p.description ?? p.desc,
          price:         p.price,
          status:        p.status ?? null,
          tags:          p.tags   ?? null,
          salesCount:    p.salesCount    ?? 0,
          stockQuantity: p.stockQuantity ?? 0,
          stockStatus:   p.stockStatus   ?? 'IN_STOCK',
          img:           imageUrls[0] ?? null,
          images:        imageUrls,
          // detailImagelUrls — 상세 이미지 URL 배열
          // 서버가 string / flat array / 중첩 array / JSON 문자열 중 어느 형태로 줘도 처리
          detailImgs: (() => {
            const raw = p.detailImagelUrl ?? p.detailImageUrls  // 서버 오타 필드명 우선, 폴백 유지
            if (!raw) return p.detailImages ?? p.detailImgs ?? []
            if (typeof raw === 'string') {
              try {
                const parsed = JSON.parse(raw)
                return Array.isArray(parsed)
                  ? parsed.flat(Infinity).filter(s => typeof s === 'string' && s)
                  : [raw]
              } catch {
                return [raw]
              }
            }
            if (Array.isArray(raw)) {
              return raw.flat(Infinity).filter(s => typeof s === 'string' && s)
            }
            return []
          })(),
          options: (p.options ?? []).map((opt) => ({
            id:            opt.optionId    ?? null,
            label:         opt.optionName  ?? opt.label,
            extra:         opt.extraPrice  ?? opt.additionalPrice ?? opt.extra ?? 0,
            stockQuantity: opt.stockQuantity ?? 0,
            stockStatus:   opt.stockStatus   ?? 'IN_STOCK',
          })),
          // 배송비 안내 문구 — 상품 이미지 옆 표시용, 백엔드에서 문자열로 제공 예정
          shippingInfo:    p.shippingInfo ?? null,
          isSubscribable:  p.isSubscribable  ?? false,
          // 배송주기 목록 — 서버에서 [{ value, label }] 형태로 내려옴
          deliveryCycles:  (p.deliveryCycles ?? []).map(c => ({
            value: c.value ?? c.cycleValue ?? c.cycle,
            label: c.label ?? c.cycleName  ?? c.name,
          })),
          subscriptionDiscount: p.subscriptionDiscount ?? 0,
          bundleOptions:        p.bundleOptions        ?? [],
          relatedProducts: (p.relatedProducts ?? []).map((rp) => ({
            id:           rp.productId    ?? rp.id,
            name:         rp.productName  ?? rp.title ?? rp.name,
            originalPrice: rp.originalPrice ?? rp.price,
            discountPrice: rp.discountPrice ?? null,
            img:          (rp.imageUrls?.[0]) ?? rp.imageUrl ?? rp.img,
            options:      rp.options ?? [],
          })),
        }
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    /** 상품 요약 — Product Server: GET /api/v1/product/frontend/{productId} */
    getProductSummary: builder.query({
      query: (id) => ({ url: `/product/frontend/${id}` }),
      transformResponse: (res) => ({
        id:      res.productId,
        name:    res.productName,
        img:     res.imageUrl ?? null,
        price:   res.price    ?? 0,
        options: (res.options ?? []).map((opt) => ({
          id:    opt.optionId,
          label: opt.optionName,
        })),
      }),
      providesTags: (result, error, id) => [{ type: 'Product', id: `summary-${id}` }],
    }),

  }),
})

export const {
  useGetProductByIdQuery,
  useGetProductSummaryQuery,
} = productApi
