import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// ─── Feature Slices (클라이언트 UI 상태) ──────────────────────────────────────
import authReducer, { logout } from '@/features/auth/authSlice'
import productReducer  from '@/features/product/productSlice'
import categoryReducer from '@/features/category/categorySlice'
import cartReducer     from '@/features/cart/cartSlice'
import orderReducer    from '@/features/order/orderSlice'
import reviewReducer   from '@/features/review/reviewSlice'
import uiReducer       from '@/features/ui/uiSlice'

// ─── 단일 RTK Query API 슬라이스 ──────────────────────────────────────────────
import { apiSlice } from '@/api/apiSlice'

// ─── 도메인 API 등록 (injectEndpoints 사이드이펙트) ───────────────────────────
import '@/api/authApi'
import '@/api/userApi'
import '@/api/categoryApi'
import '@/api/productApi'
import '@/api/cartApi'
import '@/api/orderApi'
import '@/api/reviewApi'
import '@/api/wishlistApi'
import '@/api/searchApi'

/**
 * logout 액션 발생 시 getMe 캐시를 null로 초기화
 * → useAuth()의 isLoggedIn이 false로 전환 → ProtectedRoute가 /login으로 리다이렉트
 */
const logoutMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action)
  if (action.type === logout.type) {
    storeAPI.dispatch(
      apiSlice.util.upsertQueryData('getMe', undefined, null)
    )
  }
  return result
}

export const store = configureStore({
  reducer: {
    // 클라이언트 UI 상태
    auth:     authReducer,
    product:  productReducer,
    category: categoryReducer,
    cart:     cartReducer,
    order:    orderReducer,
    review:   reviewReducer,
    ui:       uiReducer,

    // RTK Query 서버 캐시 (단일 인스턴스)
    [apiSlice.reducerPath]: apiSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: [
          'meta.baseQueryMeta.request',
          'meta.baseQueryMeta.response',
          'payload.createdAt',
          'payload.updatedAt',
        ],
        ignoredPaths: ['order.lastCreatedOrder.createdAt'],
      },
    }).concat(apiSlice.middleware, logoutMiddleware),

  devTools: import.meta.env.DEV,
})

// refetchOnFocus / refetchOnReconnect 활성화
setupListeners(store.dispatch)

export default store
