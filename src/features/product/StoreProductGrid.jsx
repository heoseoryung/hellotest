import { Link } from 'react-router-dom'

export default function StoreProductGrid({ products, basePath = '/product/detail' }) {
  if (!products || products.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`${basePath}/${product.id}`}
          className="flex flex-col group"
        >
          <div className="relative aspect-square overflow-hidden rounded-[15px] mb-3.5 bg-[#f9f9f9]">
            <img
              src={product.img}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex flex-col px-0.5">
            <h3 className="text-[14px] font-normal text-[#333333] leading-snug line-clamp-1 tracking-tight mb-1">
              {product.name}
            </h3>
            <p className="text-[15px] font-bold text-[#111111] tracking-tight">
              {typeof product.price === 'number'
                ? `${product.price.toLocaleString()}원`
                : product.price}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
