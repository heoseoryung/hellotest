import { createSlice } from '@reduxjs/toolkit'

/**
 * productSlice — 상품 UI 상태(필터·검색어·페이지)만 관리
 *
 * 실제 상품 데이터(목록·상세·베스트·신상품·검색결과)는
 * productApi(RTK Query) 훅으로 조회합니다.
 * 컴포넌트에서 이 슬라이스의 filters / pagination.page를 읽어
 * RTK Query 훅의 파라미터로 전달하는 방식으로 연동합니다.
 */

const initialState = {
  searchKeyword: '',
  pagination: {
    page: 1,
    size: 12,
  },
  storeView: {
    sortLabel: '최신순',
    // activeTab·activeSubCategory 제거 — URL ?categoryId= / ?sub= 가 단일 진실 공급원
  },
  filters: {
    categoryId:  null,
    petType:     null,    // 'DOG'|'CAT'|'ALL'
    ageGroup:    null,
    weightClass: null,
    minPrice:    null,
    maxPrice:    null,
    sortBy:      'createdAt', // 'createdAt'|'price'|'rating'|'sales'
    sortDir:     'desc',
  },
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters         = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    resetFilters(state) {
      state.filters         = initialState.filters
      state.pagination.page = 1
    },
    setPage(state, action) {
      state.pagination.page = action.payload
    },
    setSearchKeyword(state, action) {
      state.searchKeyword   = action.payload
      state.pagination.page = 1
    },
    setStoreSortLabel(state, action) {
      state.storeView.sortLabel = action.payload
      state.pagination.page = 1
    },
  },
})

export const {
  setFilters,
  resetFilters,
  setPage,
  setSearchKeyword,
  setStoreSortLabel,
} = productSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectProductFilters    = (state) => state.product.filters
export const selectProductPagination = (state) => state.product.pagination
export const selectSearchKeyword     = (state) => state.product.searchKeyword
export const selectStoreView         = (state) => state.product.storeView

export default productSlice.reducer
