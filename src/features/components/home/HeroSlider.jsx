import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetMainBannersQuery } from '@/api/searchApi'

export default function HeroSlider() {
  const { data: slides = [], isLoading } = useGetMainBannersQuery()
  const [current, setCurrent] = useState(0)

  const total = slides.length

  const nextSlide = () => setCurrent((prev) => (prev + 1) % total)
  const prevSlide = () => setCurrent((prev) => (prev - 1 + total) % total)

  useEffect(() => {
    if (total < 2) return
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [total])

  if (isLoading) {
    return (
      <div className="w-full py-4">
        <div className="relative w-full overflow-hidden rounded-[32px] bg-[#f5f5f5] aspect-[21/8] animate-pulse" />
      </div>
    )
  }

  if (!slides.length) return null

  return (
    <div className="w-full py-4">
      <div className="relative w-full overflow-hidden rounded-[32px] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.06)] group">
        <div
          className="flex transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide) => (
            <Link key={slide.id} to={slide.href} className="flex-none w-full block relative bg-white">
              <div className="absolute inset-0 bg-[#3ea76e]/[0.01] pointer-events-none z-10" />
              <div className="relative aspect-[21/8] flex items-center justify-center overflow-hidden">
                <img
                  src={slide.img}
                  alt={slide.alt}
                  className="w-full h-full object-contain p-10 transition-transform duration-[2000ms] group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>

        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[#3ea76e] hover:text-white z-20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4332] group-hover:text-inherit">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[#3ea76e] hover:text-white z-20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#1B4332] group-hover:text-inherit">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    i === current ? 'w-10 bg-[#3ea76e]' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
