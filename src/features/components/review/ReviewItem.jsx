import { ChevronRight } from 'lucide-react'

export default function ReviewItem({ review, onOpenMore }) {
  return (
    <div className="border-b border-[#f5f5f5] last:border-none py-6 px-2">
      <button
        onClick={() => onOpenMore(review)}
        className="w-full text-left bg-transparent border-none cursor-pointer"
      >
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-[18px] ${i < review.rating ? 'text-[#f5a623]' : 'text-[#eee]'}`}>★</span>
          ))}
        </div>

        <p className="text-[15px] font-bold text-[#111] leading-relaxed mb-3 line-clamp-2">
          {review.text}
        </p>

        <div className="flex items-center gap-2 text-[12px] font-bold text-[#bbb]">
          <span>{review.name}</span>
          <span className="text-[#eee]">·</span>
          <span>{review.date}</span>
          <span className="text-[#eee]">·</span>
          <span>조회 {review.views}</span>
          <div className="ml-auto flex items-center gap-1 text-[#3ea76e]">
            <span>더보기</span>
            <ChevronRight size={15} />
          </div>
        </div>
      </button>

      {review.imgs && review.imgs.length > 0 && (
        <div className="flex gap-3 mt-4 flex-wrap">
          {review.imgs.map((img, i) => (
            <img key={i} src={img} alt={`리뷰 이미지 ${i + 1}`} className="w-24 h-24 rounded-2xl object-cover border border-[#eee]" />
          ))}
        </div>
      )}
    </div>
  )
}
