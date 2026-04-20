import { apiSlice } from './apiSlice'

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * 카테고리 목록 — Search Server: GET /search/categories
     * 응답: { data: [{ id: "SNACK_JERKY", label: "Snack & Jerky", subCategories: [{id, code, label}] }] }
     *
     * id  → search API의 category 파라미터로 전달하는 코드값 ("SNACK_JERKY")
     * name → 화면 표시용 (label 값 그대로, "Snack & Jerky")
     */
    getCategories: builder.query({
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
            id:            cat.id,      // "ALL" | "SNACK_JERKY" | … (search category param)
            name:          cat.label,   // "ALL" | "Snack & Jerky" | … (display)
            subCategories: subs,
            children:      subs,        // backward-compat alias
          }
        })
      },
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetCategoriesQuery,
} = categoryApi
