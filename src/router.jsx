import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthInitializer from '@/features/auth/AuthInitializer'
import ProtectedRoute from '@/features/auth/ProtectedRoute'
import Layout from './features/components/layout/Layout'
import LandingPage from './pages/LandingPage'
import StorePage from './pages/StorePage'
import ProductDetailPage from './pages/ProductDetailPage'
import OrderPage from './pages/OrderPage'
import OrderDetailPage from './pages/OrderDetailPage'
import LoginPage from './features/auth/LoginPage'
import SignupPage from './features/auth/SignupPage'
import CSPage from './pages/CSPage'
import CartPage from './pages/CartPage'
import BrandStoryPage from './pages/BrandStoryPage'
import BestSellerPage from './pages/BestSellerPage'
import CheckoutPage from './pages/CheckoutPage'
import UserProfilePage from './pages/UserProfilePage'
import ProfileModifyPage from './pages/ProfileModifyPage'
import WishListPage from './pages/WishListPage'
import UserCouponPage from './pages/UserCouponPage'
import UserPointPage from './pages/UserPointPage'
import UserAddressPage from './pages/UserAddressPage '
import WriteReviewPage from './pages/WriteReviewPage'
import ReviewPage from './pages/ReviewPage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import SubscriptionPage from './pages/SubscriptionPage'

export default function Router() {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          <Route element={<Layout />}>
            {/* 공개 라우트 */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/product/list" element={<StorePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/product/detail/:id" element={<ProductDetailPage />} />
            <Route path="/subscription/detail/:id" element={<ProductDetailPage />} />
            <Route path="/best" element={<BestSellerPage />} />
            <Route path="/cs" element={<CSPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/brand-story" element={<BrandStoryPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* 보호된 라우트 */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order/list" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
            <Route path="/order/detail/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/mypage" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
            <Route path="/profile/modify" element={<ProtectedRoute><ProfileModifyPage /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><WishListPage /></ProtectedRoute>} />
            <Route path="/coupon" element={<ProtectedRoute><UserCouponPage /></ProtectedRoute>} />
            <Route path="/point" element={<ProtectedRoute><UserPointPage /></ProtectedRoute>} />
            <Route path="/address" element={<ProtectedRoute><UserAddressPage /></ProtectedRoute>} />
            <Route path="/review/write" element={<WriteReviewPage />} />

            <Route path="*" element={<LandingPage />} />
          </Route>

          {/* 인증 라우트 (Layout 밖) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  )
}
