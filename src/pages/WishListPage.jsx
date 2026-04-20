import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Check, X, Heart, ShoppingBag } from 'lucide-react'
import Pagination from '../shared/components/Pagination'
import Spinner from '../shared/components/Spinner'
import { useGetWishlistQuery, useRemoveWishlistItemMutation } from '../api/wishlistApi'

const PAGE_SIZE = 4

function OptionDropdown({ currentOption, options = [], onSelect }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!options.length) return null

  return (
    <div className="relative w-fit">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8f8f8] border border-[#eee] hover:border-[#3ea76e] transition-all cursor-pointer"
      >
        <span className="text-[12px] font-bold text-[#bbb]">
          옵션: <span className="text-[#666] ml-1">{currentOption || '선택'}</span>
        </span>
        <ChevronDown size={14} className={`text-[#bbb] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[220px] bg-white rounded-2xl shadow-xl z-20 overflow-hidden py-2 border border-[#eee]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onSelect(opt); setIsOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f0faf4] transition-colors border-none bg-transparent cursor-pointer text-left"
            >
              <span className={`text-[13px] ${currentOption === opt ? 'text-[#3ea76e] font-bold' : 'text-[#666] font-medium'}`}>
                {opt}
              </span>
              {currentOption === opt && <Check size={14} className="text-[#3ea76e]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function WishItem({ item, onRemove }) {
  const [selectedOption, setSelectedOption] = useState(item.currentOption || '')

  return (
    <div className="bg-white rounded-[30px] border border-[#eee] p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-6">
        <input type="checkbox" className="w-5 h-5 rounded border-[#eee] accent-[#3ea76e] cursor-pointer" />

        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#f9f9f9] border border-[#f5f5f5] shrink-0">
          <img src={item.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[15px] font-bold text-[#111] mb-2 truncate">{item.name}</h4>
          <OptionDropdown
            currentOption={selectedOption}
            options={item.options}
            onSelect={setSelectedOption}
          />
        </div>

        <div className="text-right flex flex-col items-end gap-3 shrink-0">
          <button onClick={() => onRemove(item.id)} className="text-[#eee] group-hover:text-[#bbb] transition-colors cursor-pointer">
            <X size={20} />
          </button>
          <span className="text-[18px] font-bold text-[#111]">{item.price?.toLocaleString()}원</span>
          <button className="px-5 py-2.5 bg-[#f0faf4] text-[#3ea76e] rounded-xl text-[12px] font-bold hover:bg-[#e6f7ed] transition-all flex items-center gap-1">
            <ShoppingBag size={14} /> 담기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WishListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data: items = [], isLoading } = useGetWishlistQuery()
  const [removeWishlistItem] = useRemoveWishlistItemMutation()

  const totalPrice = items.reduce((acc, item) => acc + (item.price || 0), 0)
  const totalPages = Math.ceil(items.length / PAGE_SIZE)
  const pagedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    if (page > Math.max(totalPages, 1)) {
      setPage(Math.max(totalPages, 1))
    }
  }, [page, totalPages])

  const handleRemove = (productId) => {
    removeWishlistItem(productId)
    setPage(1)
  }

  if (isLoading) return <Spinner fullscreen />

  return (
    <div className="bg-[#FCFBF9] min-h-screen text-[#111] pb-20">
      <main className="max-w-[800px] mx-auto px-6">

        <div className="py-20 text-center">
          <h1 className="text-[28px] font-bold tracking-tight">관심상품</h1>
        </div>

        <section className="bg-white rounded-[30px] border border-[#eee] p-6 mb-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-10 ml-4">
            <div className="flex flex-col">
              <span className="text-[12px] text-[#bbb] font-bold mb-1">담긴 상품</span>
              <span className="text-[20px] font-bold">{items.length}건</span>
            </div>
            <div className="w-[1px] h-8 bg-[#eee]" />
            <div className="flex flex-col">
              <span className="text-[12px] text-[#bbb] font-bold mb-1">예상 금액</span>
              <span className="text-[20px] font-bold text-[#3ea76e]">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="bg-[#3ea76e] text-white px-8 py-3.5 rounded-full text-[14px] font-bold hover:bg-[#318a57] transition-all flex items-center gap-2 shadow-lg shadow-green-100 cursor-pointer border-none"
          >
            전체 주문하기
          </button>
        </section>

        <div className="flex justify-end pr-2 mb-4">
          <button
            onClick={() => items.forEach(i => removeWishlistItem(i.id))}
            className="text-[11px] font-bold text-[#bbb] hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
          >
            전체삭제
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-[30px] border border-[#eee] py-32 text-center shadow-sm">
            <Heart size={40} className="text-[#f5f5f5] mx-auto mb-4" />
            <p className="text-[#bbb] font-bold text-[15px]">관심상품이 비어있습니다.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {pagedItems.map(item => (
                <WishItem key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </main>
    </div>
  )
}
