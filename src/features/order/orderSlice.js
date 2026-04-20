import { createSlice } from '@reduxjs/toolkit'

/**
 * orderSlice — 주문 UI 상태만 관리
 *
 * 주문 목록·상세 데이터는 orderApi(RTK Query) 훅으로 조회합니다.
 * - lastCreatedOrder: 주문 완료 직후 주문확인 페이지에 표시하기 위한 임시 저장값
 *   createOrder 성공 시 orderApi.onQueryStarted에서 setLastCreatedOrder를 dispatch합니다.
 * - pagination.page: 현재 페이지 번호 (getOrders 쿼리 파라미터로 전달)
 */

const initialState = {
  /**
   * @type {import('./orderTypes').Order | null}
   * 주문 완료 후 임시 저장 (주문 완료 페이지용)
   */
  lastCreatedOrder: null,
  pagination: {
    page: 1,
    size: 10,
  },
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    /** createOrder 성공 후 orderApi.onQueryStarted에서 호출 */
    setLastCreatedOrder(state, action) {
      state.lastCreatedOrder = action.payload
    },
    clearLastCreatedOrder(state) {
      state.lastCreatedOrder = null
    },
    setOrderPage(state, action) {
      state.pagination.page = action.payload
    },
  },
})

export const {
  setLastCreatedOrder,
  clearLastCreatedOrder,
  setOrderPage,
} = orderSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectLastCreatedOrder = (state) => state.order.lastCreatedOrder
export const selectOrderPagination  = (state) => state.order.pagination

export default orderSlice.reducer
