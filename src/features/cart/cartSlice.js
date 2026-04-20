import { createSlice } from '@reduxjs/toolkit'

/**
 * cartSlice — 장바구니 체크 UI 상태만 관리
 *
 * 서버 GET /cart/ 응답에 선택 상태가 포함되지 않으므로 Redux가 UI 선택 상태를 관리.
 * checkedItemIds 원소: `${productId}-${optionId ?? 'none'}` 형식의 문자열 키.
 *
 * 체크 토글 시 selectCartItem mutation도 함께 호출하여 서버에 선택 상태 저장.
 */

const initialState = {
  /** 선택된(체크된) 장바구니 아이템 키 목록 — `${productId}-${optionId ?? 'none'}` */
  checkedItemIds: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** 예약 — 향후 서버 선택 상태 반환 시 사용 */
    initCheckedItems(state, action) {
      state.checkedItemIds = action.payload
    },
    toggleCheckItem(state, action) {
      const id = action.payload
      if (state.checkedItemIds.includes(id)) {
        state.checkedItemIds = state.checkedItemIds.filter((i) => i !== id)
      } else {
        state.checkedItemIds.push(id)
      }
    },
    checkAllItems(state, action) {
      state.checkedItemIds = action.payload
    },
    uncheckAllItems(state) {
      state.checkedItemIds = []
    },
  },
})

export const {
  initCheckedItems,
  toggleCheckItem,
  checkAllItems,
  uncheckAllItems,
} = cartSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCheckedItemIds = (state) => state.cart.checkedItemIds

export default cartSlice.reducer
