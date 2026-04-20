import { apiSlice } from './apiSlice'

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /** GET /wishlist — 관심상품 목록 */
    getWishlist: builder.query({
      query: () => ({ url: '/wishlist' }),
      transformResponse: (res) => {
        const items = res.data?.items ?? res.data ?? []
        return items.map((item) => ({
          id: item.productId ?? item.id,
          name: item.productName ?? item.title ?? item.name,
          price: item.price,
          img: item.imageUrl ?? item.img,
          currentOption: item.selectedOption ?? item.currentOption ?? '',
          options: item.options ?? [],
        }))
      },
      providesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),

    /** POST /wishlist — 관심상품 추가 */
    addWishlistItem: builder.mutation({
      query: (productId) => ({
        url: '/wishlist',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),

    /** DELETE /wishlist/:productId — 관심상품 삭제 */
    removeWishlistItem: builder.mutation({
      query: (productId) => ({
        url: `/wishlist/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Wishlist', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetWishlistQuery,
  useAddWishlistItemMutation,
  useRemoveWishlistItemMutation,
} = wishlistApi
