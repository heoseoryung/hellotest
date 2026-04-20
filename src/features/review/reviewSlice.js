import { createSlice } from '@reduxjs/toolkit'

/**
 * reviewSlice — 리뷰 UI 상태만 관리
 *
 * 리뷰 데이터는 reviewApi(RTK Query) 훅으로 조회합니다.
 * - sortBy / pagination.page: getProductReviews 쿼리 파라미터로 전달
 */

const initialState = {
  sortBy: 'createdAt', // 'createdAt' | 'rating' | 'helpful'
  pagination: {
    page: 1,
    size: 10,
  },
}

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    setReviewSort(state, action) {
      state.sortBy          = action.payload
      state.pagination.page = 1
    },
    setReviewPage(state, action) {
      state.pagination.page = action.payload
    },
  },
})

export const { setReviewSort, setReviewPage } = reviewSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectReviewSortBy    = (state) => state.review.sortBy
export const selectReviewPagination = (state) => state.review.pagination

export default reviewSlice.reducer
