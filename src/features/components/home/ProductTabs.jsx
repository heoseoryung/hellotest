import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetTastePicksQuery } from '@/api/searchApi'
import Spinner from '@/shared/components/Spinner'

export default function ProductTabs() {
  // null = 서버 기본값(오독오독). 탭 클릭 시 brandName 문자열로 변경
  const [activeBrand, setActiveBrand] = useState(null)

  const { data, isLoading, isFetching } = useGetTastePicksQuery(activeBrand)

  const tags     = data?.tags     ?? []
  const products = data?.products ?? []

  return (
    <div className="bg-white pb-16 w-full">
      <div className="flex items-center gap-2 pt-16 pb-10">
        <h2 className="text-[24px] font-black text-[#111111] tracking-tighter">
          우리 아이 취향 저격 제품
        </h2>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex flex-wrap gap-2.5 pb-10">
            {tags.map((tag) => (
              <button
                key={tag.brandName}
                onClick={() => setActiveBrand(tag.brandName)}
                className={`hover-primary px-6 py-2.5 text-[14px] !font-medium tracking-tighter transition-all cursor-pointer ${
                  tag.selected ? 'active shadow-sm' : ''
                }`}
              >
                {tag.tagName}
              </button>
            ))}
          </div>

          {isFetching ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={product.productUrl}
                  className="flex flex-col group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[15px] mb-4 bg-[#f9f9f9]">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col px-0.5">
                    <h3 className="text-[14px] !font-normal text-[#333333] leading-snug line-clamp-1 tracking-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-[15px] font-bold text-[#111111] tracking-tight">
                      {product.price?.toLocaleString()}원
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
