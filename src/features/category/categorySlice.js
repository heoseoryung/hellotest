import { createSlice } from '@reduxjs/toolkit'

/**
 * categorySlice — 선택된 카테고리 ID만 관리
 *
 * 카테고리 목록은 categoryApi(RTK Query)의
 * useGetCategoriesQuery 훅으로 조회합니다.
 */

const initialState = {
  /** @type {number | null} */
  selectedCategoryId: null,
}

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    selectCategory(state, action) {
      state.selectedCategoryId = action.payload
    },
    clearSelectedCategory(state) {
      state.selectedCategoryId = null
    },
  },
})

export const { selectCategory, clearSelectedCategory } = categorySlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectSelectedCategoryId = (state) => state.category.selectedCategoryId

export default categorySlice.reducer
