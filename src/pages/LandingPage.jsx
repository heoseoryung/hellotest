import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import HeroSlider from '../features/components/home/HeroSlider'
import BestSellers from '../features/components/home/BestSellers'
import ProductTabs from '../features/components/home/ProductTabs'
import BrandStory from '../features/components/home/BrandStory'
import PhotoReviews from '../features/components/home/PhotoReviews'
import Toast from '../features/components/ui/Toast'
import { PROVIDER_LABELS } from '@/shared/utils/oauth2'

export default function LandingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [toast, setToast] = useState(null) // { message, isError }

  // 소셜 계정 연동 성공: /?linked={provider}
  // 소셜 계정 연동 실패: /?link_error={reason}
  useEffect(() => {
    const linked    = searchParams.get('linked')
    const linkError = searchParams.get('link_error')

    if (linked) {
      const label = PROVIDER_LABELS[linked] ?? linked
      setToast({ message: `${label} 계정 연동이 완료됐어요!`, isError: false })
      setSearchParams({}, { replace: true })
    } else if (linkError) {
      setToast({ message: '계정 연동에 실패했습니다. 다시 시도해 주세요.', isError: true })
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          isError={toast.isError}
          onClose={() => setToast(null)}
        />
      )}

      {/* Layout의 px-6/px-8 패딩을 상쇄해 HeroSlider가 max-w 전체를 채우도록 */}
      <section className="-mx-6 md:-mx-8 mb-12 md:mb-16">
        <HeroSlider />
      </section>

      <div className="pb-24">
        <BestSellers />
        <ProductTabs />
        <BrandStory />
        <PhotoReviews />
      </div>
    </>
  )
}
