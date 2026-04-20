import { Link } from 'react-router-dom'
import { useGetReviewHighlightsQuery } from '@/api/reviewApi'
import Spinner from '@/shared/components/Spinner'

export default function PhotoReviews() {
  const { data, isLoading } = useGetReviewHighlightsQuery()
  const sectionTitle = data?.title ?? ''
  const reviews = data?.items ?? []

  return (
    <div className="bg-white w-full pb-4">
      <div className="flex items-center justify-start pt-16 pb-8">
        <h2 className="text-[24px] font-black text-[#111111] tracking-tighter">
          {sectionTitle}
        </h2>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {reviews.map((review) => (
            <Link
              key={review.id}
              to={review.href ?? '/review'}
              className="flex flex-col group"
            >
              <div className="relative aspect-square overflow-hidden rounded-[20px] mb-4 bg-[#f9f9f9]">
                <img
                  src={review.img}
                  alt={review.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col px-1 space-y-1">
                <p className="text-[13px] font-medium text-[#333333] leading-snug line-clamp-2 tracking-tighter">
                  {review.title}
                </p>
                <p className="text-[13px] font-bold text-[#f5a623] tracking-tighter">
                  {review.rating}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
