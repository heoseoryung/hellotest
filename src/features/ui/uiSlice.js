import { createSlice } from '@reduxjs/toolkit'

// ─── Initial State ────────────────────────────────────────────────────────────

/**
 * @typedef {'success'|'error'|'warning'|'info'} ToastType
 * @typedef {{ id: string, type: ToastType, message: string, duration?: number }} Toast
 */

const initialState = {
  /** 전역 로딩 오버레이 */
  globalLoading: false,

  /** 토스트 알림 목록 */
  /** @type {Toast[]} */
  toasts: [],

  /** 모달 상태 */
  modals: {
    login:          false,
    addressSearch:  false,
    productQuickView: false,
    cartAlert:      false,
  },

  /** 모달에 전달할 데이터 */
  modalData: null,

  /** 모바일 메뉴 토글 */
  isMobileMenuOpen: false,

  /** 검색창 토글 */
  isSearchOpen: false,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload
    },

    // ── Toast ──────────────────────────────────────────────
    addToast(state, action) {
      const toast = {
        id: `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        duration: 3000,
        ...action.payload,
      }
      state.toasts.push(toast)
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    clearAllToasts(state) {
      state.toasts = []
    },

    // ── Modal ──────────────────────────────────────────────
    openModal(state, action) {
      const { name, data = null } = action.payload
      if (name in state.modals) {
        state.modals[name] = true
        state.modalData = data
      }
    },
    closeModal(state, action) {
      const name = action.payload
      if (name in state.modals) {
        state.modals[name] = false
      }
      state.modalData = null
    },
    closeAllModals(state) {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false
      })
      state.modalData = null
    },

    // ── Navigation ─────────────────────────────────────────
    toggleMobileMenu(state) {
      state.isMobileMenuOpen = !state.isMobileMenuOpen
    },
    closeMobileMenu(state) {
      state.isMobileMenuOpen = false
    },
    toggleSearch(state) {
      state.isSearchOpen = !state.isSearchOpen
    },
    closeSearch(state) {
      state.isSearchOpen = false
    },
  },
})

export const {
  setGlobalLoading,
  addToast,
  removeToast,
  clearAllToasts,
  openModal,
  closeModal,
  closeAllModals,
  toggleMobileMenu,
  closeMobileMenu,
  toggleSearch,
  closeSearch,
} = uiSlice.actions

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectGlobalLoading   = (state) => state.ui.globalLoading
export const selectToasts          = (state) => state.ui.toasts
export const selectModals          = (state) => state.ui.modals
export const selectModalData       = (state) => state.ui.modalData
export const selectIsMobileMenuOpen = (state) => state.ui.isMobileMenuOpen
export const selectIsSearchOpen    = (state) => state.ui.isSearchOpen

/** 특정 모달 열림 여부 */
export const selectIsModalOpen = (name) => (state) =>
  state.ui.modals[name] ?? false

export default uiSlice.reducer
