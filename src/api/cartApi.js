import { apiSlice } from './apiSlice'

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET /cart/ — 장바구니 조회 ──────────────────────────────────────────
    // 응답: { userId, items: [{ productId, optionId, quantity }] }
    // ACTIVE Cart가 없으면 빈 목록 반환 (새로 생성 안 함)
    getCart: builder.query({
      query: () => ({ url: '/cart/all' }),
      transformResponse: (res) => {
        const d = res.data ?? res
        return {
          userId: d.userId,
          items:  (d.items ?? []).map((item) => ({
            productId: item.productId,
            optionId:  item.optionId ?? null,
            quantity:  item.quantity ?? 1,
          })),
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ productId, optionId }) => ({
                type: 'Cart',
                id: `${productId}-${optionId ?? 'none'}`,
              })),
              { type: 'Cart', id: 'LIST' },
            ]
          : [{ type: 'Cart', id: 'LIST' }],
    }),

    // ── POST /cart/additem — 상품 추가 ──────────────────────────────────────
    // body: { productId, optionId?, quantity }
    // 동일 productId+optionId가 이미 있으면 수량 합산
    addCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/additem', method: 'POST', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // ── PUT /cart/item/quantity — 수량 변경 ────────────────────────────────
    // body: { productId, optionId?, quantity }
    // quantity = 0 이면 해당 아이템 삭제
    updateCartItemQuantity: builder.mutation({
      query: (body) => ({ url: '/cart/item/quantity', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // ── PUT /cart/item/option — 옵션 변경 ──────────────────────────────────
    // body: { productId, optionId, newOptionId }
    // 변경 대상이 이미 있으면 수량 합산 후 기존 항목 삭제
    updateCartItemOption: builder.mutation({
      query: (body) => ({ url: '/cart/item/option', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // ── DELETE /cart/item — 단건 삭제 ──────────────────────────────────────
    // body: { productId, optionId? }
    removeCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/item', method: 'DELETE', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    // ── PUT /cart/item/select — 개별 선택 상태 서버 저장 ───────────────────
    // body: { productId, optionId?, isSelected }
    // 선택 상태는 응답에 포함되지 않음 — UI 상태는 Redux(cartSlice)가 관리
    selectCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/item/select', method: 'PUT', body }),
      // 선택 상태가 응답에 없으므로 캐시 무효화 불필요
    }),

  }),
})

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemQuantityMutation,
  useUpdateCartItemOptionMutation,
  useRemoveCartItemMutation,
  useSelectCartItemMutation,
} = cartApi
