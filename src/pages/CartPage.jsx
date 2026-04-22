import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useGetCartQuery,
  useUpdateCartItemQuantityMutation,
  useUpdateCartItemOptionMutation,
  useRemoveCartItemMutation,
  useSelectCartItemMutation,
} from '../api/cartApi'
import { useGetProductByIdQuery } from '../api/productApi'
import { useAppDispatch } from '../hooks/useAppDispatch'
import { useAppSelector } from '../hooks/useAppSelector'
import {
  selectCheckedItemIds,
  toggleCheckItem,
  checkAllItems,
  uncheckAllItems,
} from '../features/cart/cartSlice'
import Pagination from '../shared/components/Pagination'
import Spinner from '../shared/components/Spinner'
import { SHIPPING_FEE, SHIPPING_FREE_THRESHOLD } from '../shared/utils/constants'

const PAGE_SIZE = 3

/** productId + optionId 조합으로 고유 키 생성 */
const itemKey = (item) => `${item.productId}-${item.optionId ?? 'none'}`

// ─── CartItemRow ──────────────────────────────────────────────────────────────
// GET /product/frontend/{productId} 로 이름·이미지·가격·옵션명 조회
function CartItemRow({ item, checked, onToggle, onQtyChange, onRemove, onOrder, onPriceReady }) {
  const { data: product, isLoading } = useGetProductByIdQuery(item.productId)
  const [updateOption] = useUpdateCartItemOptionMutation()

  const selectedOption = product?.options?.find((o) => String(o.id) === String(item.optionId)) ?? null
  const unitPrice      = (product?.price ?? 0) + (selectedOption?.extra ?? 0)
  const totalItemPrice = unitPrice * item.quantity

  const handleOptionChange = (e) => {
    const newOptionId = Number(e.target.value)
    if (!newOptionId) return
    updateOption({ productId: item.productId, optionId: item.optionId, newOptionId })
  }

  // 부모에게 단가 × 수량 보고 (합계 계산용)
  const reportedRef = useRef(null)
  useEffect(() => {
    if (product && reportedRef.current !== totalItemPrice) {
      reportedRef.current = totalItemPrice
      onPriceReady(itemKey(item), totalItemPrice)
    }
  }, [totalItemPrice, product]) // eslint-disable-line

  if (isLoading || !product) {
    return (
      <div className="bg-white p-10 rounded-[40px] border border-[#eee] flex items-center justify-center h-40">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="bg-white p-10 relative rounded-[40px] border border-[#eee] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
      <div className="absolute top-10 left-8">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="w-5 h-5 accent-[#3ea76e] cursor-pointer"
        />
      </div>

      <div className="flex gap-8 items-start mb-8 pl-10">
        <div className="w-32 h-32 rounded-[24px] overflow-hidden shrink-0 border border-[#eee]">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-[18px] font-black tracking-tight text-[#111]">{product.name}</h3>
            <button
              onClick={onRemove}
              className="text-[#ccc] hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {product?.options?.length > 0 && (
            <select
              value={String(item.optionId ?? '')}
              onChange={handleOptionChange}
              className="mt-1 w-full border border-[#eee] rounded-xl px-3 py-2 text-[13px] font-bold text-[#333] bg-white outline-none cursor-pointer focus:border-[#3ea76e] transition-colors"
            >
              <option value="">옵션 선택</option>
              {product.options.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.label}{opt.extra > 0 ? ` (+${opt.extra.toLocaleString()}원)` : ''}
                </option>
              ))}
            </select>
          )}

          <span className="text-[22px] font-black block tracking-tighter text-[#111] pt-2">
            {totalItemPrice.toLocaleString()}원
          </span>
          {item.quantity > 1 && (
            <p className="text-[13px] text-[#bbb]">{unitPrice.toLocaleString()}원 × {item.quantity}</p>
          )}

          <div className="flex items-center gap-3 pt-3">
            <div className="flex items-center bg-[#f8f8f8] rounded-full border border-[#eee] px-2">
              <button
                onClick={() => onQtyChange(item, -1)}
                className="w-8 h-8 flex items-center justify-center font-bold text-[#aaa] hover:text-[#111] bg-transparent border-none cursor-pointer"
              >
                －
              </button>
              <span className="w-8 text-center font-bold text-[14px]">{item.quantity}</span>
              <button
                onClick={() => onQtyChange(item, 1)}
                className="w-8 h-8 flex items-center justify-center font-bold text-[#aaa] hover:text-[#111] bg-transparent border-none cursor-pointer"
              >
                ＋
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-[#f5f5f5]">
        <button
          onClick={onRemove}
          className="h-10 px-6 rounded-full bg-[#f5f5f5] text-[#666] font-bold text-[13px] hover:bg-[#efefef] transition-all cursor-pointer border-none"
        >
          삭제
        </button>
        <button
          onClick={onOrder}
          className="h-10 px-6 rounded-full bg-[#3ea76e] text-white font-bold text-[13px] border-none hover:bg-[#318a57] transition-all cursor-pointer"
        >
          주문하기
        </button>
      </div>
    </div>
  )
}

// ─── CartPage ─────────────────────────────────────────────────────────────────
export default function CartPage() {
  const navigate   = useNavigate()
  const dispatch   = useAppDispatch()
  const [page, setPage] = useState(1)

  // itemKey → 단가×수량 맵 (CartItemRow에서 상품 로드 후 보고)
  const [priceMap, setPriceMap] = useState({})

  const { data, isLoading } = useGetCartQuery()
  const [updateQty]  = useUpdateCartItemQuantityMutation()
  const [removeItem] = useRemoveCartItemMutation()
  const [selectItem] = useSelectCartItemMutation()

  const items      = data?.items ?? []
  const checkedIds = useAppSelector(selectCheckedItemIds)

  const totalPages    = Math.ceil(items.length / PAGE_SIZE)
  const pagedItems    = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const isSelectedAll = items.length > 0 && items.every((i) => checkedIds.includes(itemKey(i)))

  // ── 합계 계산 ────────────────────────────────────────────────────────────────
  const totalProductPrice = items
    .filter((i) => checkedIds.includes(itemKey(i)))
    .reduce((sum, i) => sum + (priceMap[itemKey(i)] ?? 0), 0)
  const shippingFee  = totalProductPrice > 0
    ? (totalProductPrice >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE)
    : 0
  const finalPayment = totalProductPrice + shippingFee

  useEffect(() => {
    if (page > Math.max(totalPages, 1)) setPage(Math.max(totalPages, 1))
  }, [page, totalPages])

  // ── 핸들러 ───────────────────────────────────────────────────────────────────
  const handlePriceReady = (key, price) => {
    setPriceMap((prev) => prev[key] === price ? prev : { ...prev, [key]: price })
  }

  const handleToggleAll = () => {
    if (isSelectedAll) {
      dispatch(uncheckAllItems())
      items.forEach((i) => selectItem({ productId: i.productId, optionId: i.optionId, isSelected: false }))
    } else {
      dispatch(checkAllItems(items.map(itemKey)))
      items.forEach((i) => selectItem({ productId: i.productId, optionId: i.optionId, isSelected: true }))
    }
  }

  const handleToggleItem = (item) => {
    const key  = itemKey(item)
    const next = !checkedIds.includes(key)
    dispatch(toggleCheckItem(key))
    selectItem({ productId: item.productId, optionId: item.optionId, isSelected: next })
  }

  const handleUpdateQty = (item, delta) => {
    const newQty = Math.max(1, item.quantity + delta)
    updateQty({ productId: item.productId, optionId: item.optionId, quantity: newQty })
  }

  const handleRemoveOne = (item) => {
    const key = itemKey(item)
    if (checkedIds.includes(key)) dispatch(toggleCheckItem(key))
    setPriceMap((prev) => { const next = { ...prev }; delete next[key]; return next })
    removeItem({ productId: item.productId, optionId: item.optionId })
    setPage(1)
  }

  const handleRemoveSelected = async () => {
    const selected = items.filter((i) => checkedIds.includes(itemKey(i)))
    if (selected.length === 0) return
    dispatch(uncheckAllItems())
    for (const item of selected) {
      await removeItem({ productId: item.productId, optionId: item.optionId })
    }
    setPage(1)
  }

  if (isLoading) return <Spinner fullscreen />

  return (
    <div className="bg-[#FCFBF9] min-h-screen pb-28 px-4 text-[#111]">
      <div className="max-w-[1200px] mx-auto text-center py-24">
        <h1 className="text-[36px] font-black tracking-[-0.05em] text-[#111]">장바구니</h1>
      </div>

      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-12 items-start">

        {/* 상품 목록 */}
        <div className="flex-[2.2] w-full space-y-6">
          <div className="flex justify-between items-center pb-5 sticky top-0 bg-[#FCFBF9] z-10 px-2 border-b border-[#eee]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelectedAll}
                onChange={handleToggleAll}
                className="w-5 h-5 accent-[#3ea76e] cursor-pointer"
              />
              <span className="text-[15px] font-extrabold text-[#111]">
                전체선택 ({checkedIds.length}/{items.length})
              </span>
            </label>
            <button
              onClick={handleRemoveSelected}
              className="text-[14px] font-bold text-[#aaa] hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
            >
              선택삭제
            </button>
          </div>

          {items.length === 0 && (
            <div className="text-center py-24 text-[#bbb] font-bold text-[16px]">
              장바구니가 비어있어요 🐾
            </div>
          )}

          {pagedItems.map((item) => (
            <CartItemRow
              key={itemKey(item)}
              item={item}
              checked={checkedIds.includes(itemKey(item))}
              onToggle={() => handleToggleItem(item)}
              onQtyChange={handleUpdateQty}
              onRemove={() => handleRemoveOne(item)}
              onOrder={() => navigate('/checkout', { state: { finalPayment, totalProductPrice, shippingFee } })}
              onPriceReady={handlePriceReady}
            />
          ))}

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={(p) => { setPage(p); window.scrollTo(0, 0) }}
          />
        </div>

        {/* 주문 예상 금액 */}
        <div className="flex-1 w-full lg:sticky lg:top-10">
          <div className="bg-white border border-[#eee] rounded-[40px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
            <div className="text-center mb-10">
              <h2 className="text-[22px] font-black tracking-tight text-[#111]">주문 예상 금액</h2>
              <div className="w-8 h-[3px] bg-[#3ea76e] mx-auto mt-3 rounded-full"></div>
            </div>

            <div className="space-y-5 mb-8">
              <div className="flex justify-between text-[15px] font-bold">
                <span className="text-[#aaa]">총 상품 금액</span>
                <span className="text-[#111] font-black">{totalProductPrice.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold">
                <span className="text-[#aaa]">배송비</span>
                <span className="text-[#111] font-black">
                  {shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}
                </span>
              </div>
            </div>

            <div className="pt-8 mb-8 border-t border-dashed border-[#eee]">
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-bold text-[#111]">최종 결제 금액</span>
                <span className="text-[26px] font-black tracking-tighter text-[#111]">
                  {finalPayment.toLocaleString()}원
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { finalPayment, totalProductPrice, shippingFee } })}
              disabled={checkedIds.length === 0}
              className="h-16 w-full rounded-full bg-[#3ea76e] text-white font-black text-[17px] tracking-tight border-none cursor-pointer hover:bg-[#318a57] transition-all active:scale-[0.97] disabled:bg-[#ccc] disabled:cursor-not-allowed"
            >
              결제하기
            </button>
            <button
              onClick={() => navigate('/product/list')}
              className="mt-5 w-full text-center text-[13px] font-bold text-[#aaa] hover:text-[#111] transition-colors bg-transparent border-none cursor-pointer"
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
