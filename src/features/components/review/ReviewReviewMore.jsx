import { useState } from 'react'
import { ThumbsUp, X } from 'lucide-react'

export default function ReviewReviewMore({ review, onClose }) {
  const [isHelpful, setIsHelpful] = useState(false)

  const imgs = review?.imgs ?? []
  const hasImage = imgs.length > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 py-8">
      <div className="relative w-full max-w-[380px] rounded-[28px] bg-white p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white border-none cursor-pointer"
        >
          <X size={16} />
        </button>

        {hasImage && (
          <div className="overflow-hidden rounded-[18px] bg-[#f4f1eb]">
            <img
              src={imgs[0]}
              alt="리뷰 상세 이미지"
              className="block h-auto w-full object-cover"
            />
          </div>
        )}

        <div className={`${hasImage ? 'mt-3' : ''} rounded-[14px] bg-[#faf8f4] px-4 py-3`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-black text-[#111]">{review?.name ?? '익명'}</p>
              {review?.optionText && (
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-[#9a8f80]">
                  {review.optionText}
                </p>
              )}
            </div>
            <p className="shrink-0 text-[12px] font-medium text-[#8f9aa3]">{review?.date ?? ''}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-0.5 text-[17px] leading-none">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className={index < (review?.rating ?? 0) ? 'text-[#ff5c39]' : 'text-[#e5ddd3]'}>
              ★
            </span>
          ))}
        </div>

        <p className="mt-3 text-[15px] font-medium leading-8 text-[#28231d]">
          {review?.text ?? ''}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-[#f0ece6] pt-4 text-[13px] font-medium text-[#6f6962]">
          <button
            type="button"
            onClick={() => setIsHelpful((prev) => !prev)}
            className={`flex items-center gap-1.5 border-none bg-transparent cursor-pointer ${isHelpful ? 'text-[#ff5c39]' : 'text-[#6f6962]'}`}
          >
            <ThumbsUp size={15} className={isHelpful ? 'fill-[#ffdfd7] text-[#ff5c39]' : 'text-[#6f6962]'} />
            <span>유용해요 {review?.helpfulCount ?? 0}</span>
          </button>
          <button
            type="button"
            className="bg-transparent text-[13px] font-medium text-[#8f8880] border-none cursor-pointer"
          >
            신고 · 차단
          </button>
        </div>
      </div>
    </div>
  )
}
