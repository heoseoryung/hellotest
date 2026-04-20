import { useRef, useState } from 'react'
import { Search } from 'lucide-react'

const popularSearches = ['오독오독', '청정 육포', '꽈배기츄', '반건조 육포', '테린', '포켓']

export default function SearchBar() {
  const [isSearchFocus, setIsSearchFocus] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const scrollRef = useRef(null)
  const [isDrag, setIsDrag] = useState(false)
  const [startX, setStartX] = useState(0)

  const onDragStart = (e) => {
    e.preventDefault()
    setIsDrag(true)
    setStartX(e.pageX + scrollRef.current.scrollLeft)
  }

  const onDragEnd = () => setIsDrag(false)

  const onDragMove = (e) => {
    if (isDrag) {
      scrollRef.current.scrollLeft = startX - e.pageX
    }
  }

  return (
    <div className="flex-1 max-w-[500px] mx-10 relative">
      <div className={`flex items-center rounded-full px-6 py-2.5 transition-all shadow-sm ${isSearchFocus ? 'ring-2 ring-[#3ea76e] shadow-lg' : ''}`}>
        <input
          type="text"
          placeholder="검색어를 입력하세요"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsSearchFocus(true)}
          className="flex-1 outline-none text-[15px] font-medium tracking-normal bg-transparent py-1 text-[#111] caret-[#3ea76e]"
        />
        <button className="ml-3 text-[#111] hover:scale-110 transition-transform cursor-pointer bg-transparent border-0">
          <Search size={22} strokeWidth={2.5} />
        </button>
        {isSearchFocus && (
          <button
            onClick={() => { setSearchValue(''); setIsSearchFocus(false) }}
            className="ml-4 text-[14px] font-bold text-[#999] hover:text-[#111] shrink-0 cursor-pointer bg-transparent border-0"
          >
            취소
          </button>
        )}
      </div>

      {isSearchFocus && (
        <div className="absolute top-[calc(100%+10px)] left-0 w-full bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] px-7 py-8 z-[200] border border-gray-100 rounded-[24px]">
          <p className="text-[14px] font-bold text-[#1B4332] mb-5 tracking-normal flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#3ea76e] rounded-full"></span>
            인기검색어
          </p>
          <div
            ref={scrollRef}
            onMouseDown={onDragStart}
            onMouseMove={onDragMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide pb-2 cursor-grab active:cursor-grabbing select-none"
          >
            {popularSearches.map((tag) => (
              <button
                key={tag}
                onClick={() => { if (!isDrag) setSearchValue(tag) }}
                className="whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-bold text-[#1B4332] hover:bg-[#3ea76e] hover:text-white transition-all tracking-normal cursor-pointer border border-transparent bg-[#f4f7f5]"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
