import { Link } from 'react-router-dom'
import { useGetHomeBestsellerQuery } from '@/api/searchApi'
import Spinner from '@/shared/components/Spinner'

export default function BestSellers() {
  const { data: products = [], isLoading } = useGetHomeBestsellerQuery()

  return (
    <div className="bg-white w-full mb-4">
      <div className="flex items-center justify-start pt-16 pb-8">
        <h2 className="text-[24px] font-black text-[#111111] tracking-tighter">
          베스트셀러
        </h2>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-3 gap-10">
          {products.map((product, idx) => (
            <Link key={product.id ?? idx} to={product.productUrl} className="flex flex-col group">
              <div className="relative aspect-square overflow-hidden rounded-[24px] mb-5">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col items-start space-y-1.5 px-1">
                <h3 className="text-[15px] font-bold text-[#111111] leading-tight line-clamp-1 tracking-tighter">
                  {product.name}
                </h3>
                <p className="text-[18px] font-black text-[#111111] mt-1 tracking-tighter">
                  {product.price?.toLocaleString()}원
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
