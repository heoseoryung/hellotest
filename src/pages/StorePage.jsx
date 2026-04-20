import { Link, useSearchParams } from 'react-router-dom'
import StoreProductGrid from '../features/product/StoreProductGrid'
import Pagination from '../shared/components/Pagination'
import useStorePageController from '@/features/product/useStorePageController'

export default function StorePage() {
  const [searchParams] = useSearchParams()

  const {
    sortOptions,
    activeSubCategory,
    sortLabel,
    currentPage,
    totalPages,
    totalCount,
    products,
    subCategories,
    showSubTabs,
    setCurrentPage,
    handleSortChange,
  } = useStorePageController()

  // 서브카테고리 코드로 URL 토글 — 이미 선택된 항목 클릭 시 ?sub= 제거
  const buildSubUrl = (subCode) => {
    const params = new URLSearchParams(searchParams)
    if (params.get('sub') === subCode) {
      params.delete('sub')
    } else {
      params.set('sub', subCode)
    }
    return `/product/list?${params}`
  }

  return (
    <main className="max-w-[1200px] mx-auto w-full px-6 md:px-8 pb-20">

      {showSubTabs && (
        <div className="flex justify-center flex-wrap gap-2 pt-8 mb-8">
          {subCategories.map(sub => (
            <Link
              key={sub.code}
              to={buildSubUrl(sub.code)}
              className={`hover-primary px-5 py-2 text-[13px] !font-medium tracking-tighter transition-all ${activeSubCategory === sub.code ? 'active shadow-sm' : ''}`}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-10">
        <span className="text-[14px] font-normal text-[#111] tracking-tighter">
          총 <span className="text-[#3ea76e] font-bold">{totalCount}</span>개의 제품
        </span>
        <select
          value={sortLabel}
          onChange={e => handleSortChange(e.target.value)}
          className="appearance-none border border-[#eee] rounded-full px-6 py-2 pr-10 text-[14px] font-bold text-[#888] bg-white outline-none cursor-pointer focus:border-[#3ea76e] transition-all tracking-tighter"
        >
          {sortOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <StoreProductGrid products={products} />

      {totalPages > 1 && (
        <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
      )}

    </main>
  )
}
