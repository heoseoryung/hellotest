import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronUp, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loadTossPayments } from '@tosspayments/tosspayments-sdk'
import AddressSearch from '@/features/user/AddressSearch'
import useAuth from '@/features/auth/useAuth'
import Spinner from '@/shared/components/Spinner'
import { useGetCartQuery } from '@/api/cartApi'
import { useGetProductByIdQuery } from '@/api/productApi'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectCheckedItemIds } from '@/features/cart/cartSlice'

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY

function generateOrderId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const itemKey = (item) => `${item.productId}-${item.optionId ?? 'none'}`

// ─── 주문상품 행 ───────────────────────────────────────────────────────────────
function OrderItemRow({ item }) {
  const { data: product, isLoading } = useGetProductByIdQuery(item.productId)

  if (isLoading || !product) return (
    <div className="flex items-center justify-center h-24">
      <Spinner />
    </div>
  )

  const selectedOption = product?.options?.find(o => String(o.id) === String(item.optionId)) ?? null
  const unitPrice      = (product?.price ?? 0) + (selectedOption?.extra ?? 0)
  const total          = unitPrice * item.quantity

  return (
    <div className="flex gap-6 items-center py-6 border-b border-[#f5f5f5] last:border-0 last:pb-0">
      <div className="w-24 h-24 bg-[#f8f8f8] rounded-[20px] overflow-hidden border border-[#eee] shrink-0">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <h3 className="font-black text-[16px] tracking-tight text-[#111]">{product.name}</h3>
        {selectedOption && (
          <p className="text-[13px] font-bold text-[#bbb] mt-1">[옵션: {selectedOption.label}]</p>
        )}
        <div className="flex justify-between items-end mt-4">
          <p className="text-[13px] font-bold text-[#bbb]">수량 {item.quantity}개</p>
          <p className="font-black text-[20px] text-[#111] tracking-tighter">{total.toLocaleString()}원</p>
        </div>
      </div>
    </div>
  )
}

// ─── CheckoutPage ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate      = useNavigate()
  const location      = useLocation()
  const { user }      = useAuth()
  const checkedIds    = useAppSelector(selectCheckedItemIds)
  const { data: cartData } = useGetCartQuery()

  // CartPage에서 navigate state로 넘어온 금액 — 없으면 장바구니로 되돌림
  const { finalPayment = 0, totalProductPrice = 0, shippingFee = 0 } = location.state ?? {}

  useEffect(() => {
    if (!location.state) navigate('/cart', { replace: true })
  }, []) // eslint-disable-line

  const checkedItems = (cartData?.items ?? []).filter(i => checkedIds.includes(itemKey(i)))
  const orderName    = checkedItems.length > 1
    ? `상품 외 ${checkedItems.length - 1}건`
    : checkedItems.length === 1
      ? '상품 1건'
      : '주문 상품'

  const [addrTab, setAddrTab]       = useState('direct')
  const [isAddrOpen, setIsAddrOpen] = useState(true)
  const [shippingAddr, setShippingAddr] = useState({
    postcode: '', baseAddress: '', extraAddress: '', addressType: '', detailAddress: '',
  })

  const [widgets, setWidgets]             = useState(null)
  const [isWidgetReady, setIsWidgetReady] = useState(false)
  const [isPaying, setIsPaying]           = useState(false)
  const orderIdRef = useRef(generateOrderId())

  // ── 1. TossPayments 초기화 ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !TOSS_CLIENT_KEY) return

    loadTossPayments(TOSS_CLIENT_KEY)
      .then(tp => setWidgets(tp.widgets({ customerKey: `user_${user.id}` })))
      .catch(console.error)
  }, [user])

  // ── 2. 결제 UI 렌더링 ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!widgets || !finalPayment) return

    async function renderWidgets() {
      await widgets.setAmount({ currency: 'KRW', value: finalPayment })
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#payment-method', variantKey: 'DEFAULT' }),
        widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
      ])
      setIsWidgetReady(true)
    }

    renderWidgets().catch(console.error)
  }, [widgets, finalPayment])

  // ── 결제하기 ────────────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!widgets || isPaying) return
    setIsPaying(true)
    try {
      await widgets.requestPayment({
        orderId:             orderIdRef.current,
        orderName,
        successUrl:          window.location.origin + '/payment/success',
        failUrl:             window.location.origin + '/payment/fail',
        customerEmail:       user?.email        ?? undefined,
        customerName:        user?.name         ?? undefined,
        customerMobilePhone: user?.phone?.replace(/-/g, '') ?? undefined,
      })
    } catch (err) {
      if (err?.code !== 'USER_CANCEL') console.error('결제 오류:', err)
    } finally {
      setIsPaying(false)
    }
  }

  if (!TOSS_CLIENT_KEY) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
      <p className="text-[#888] font-bold">결제 설정이 올바르지 않습니다. (VITE_TOSS_CLIENT_KEY 누락)</p>
    </div>
  )

  return (
    <div className="w-full bg-[#FCFBF9] min-h-screen pb-24 text-[#111]">

      <header className="sticky top-0 bg-white border-b border-[#eee] z-50 px-6 py-5">
        <div className="max-w-[1200px] mx-auto grid grid-cols-3 items-center">
          <ChevronLeft onClick={() => navigate(-1)} className="w-6 h-6 cursor-pointer text-[#111]" strokeWidth={2.5} />
          <h1 className="text-[18px] font-black text-center text-[#111] tracking-tight">주문/결제</h1>
          <div />
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto mt-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── 왼쪽 메인 영역 ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* 배송지 */}
          <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
            <div
              className="flex items-center justify-between mb-8 cursor-pointer"
              onClick={() => setIsAddrOpen(!isAddrOpen)}
            >
              <div className="w-6" />
              <h2 className="text-[18px] font-black text-[#111] tracking-tight">배송지</h2>
              <ChevronUp className={`w-5 h-5 text-[#bbb] transition-transform ${isAddrOpen ? '' : 'rotate-180'}`} strokeWidth={2.5} />
            </div>

            {isAddrOpen && (
              <div className="space-y-6">
                <div className="flex gap-8 border-b border-[#eee]">
                  {['direct', 'recent'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAddrTab(tab)}
                      className={`pb-4 text-[14px] font-black transition-all cursor-pointer border-none bg-transparent relative ${addrTab === tab ? 'text-[#3ea76e]' : 'text-[#bbb]'}`}
                    >
                      {tab === 'direct' ? '직접입력' : '최근 배송지'}
                      {addrTab === tab && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#3ea76e]" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center gap-y-5">
                  <label className="text-[14px] font-bold text-[#555]">받는사람 <span className="text-[#3ea76e]">*</span></label>
                  <input
                    type="text"
                    className="h-12 bg-white border border-[#eee] rounded-2xl px-5 font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all"
                    placeholder="이름 입력"
                  />

                  <label className="text-[14px] font-bold text-[#555] self-start pt-3">주소 <span className="text-[#3ea76e]">*</span></label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="text" value={shippingAddr.postcode} readOnly className="flex-[0.4] h-12 bg-[#f9f9f9] border border-[#eee] rounded-2xl px-5 font-bold text-[14px] text-[#bbb]" placeholder="우편번호" />
                      <AddressSearch onSelect={({ postcode, baseAddress, extraAddress, addressType }) =>
                        setShippingAddr(prev => ({ ...prev, postcode, baseAddress, extraAddress, addressType }))
                      } />
                    </div>
                    <input type="text" value={`${shippingAddr.baseAddress} ${shippingAddr.extraAddress}`.trim()} readOnly className="w-full h-12 bg-[#f9f9f9] border border-[#eee] rounded-2xl px-5 font-bold text-[14px] text-[#bbb]" placeholder="기본주소" />
                    <input type="text" value={shippingAddr.detailAddress} onChange={e => setShippingAddr(prev => ({ ...prev, detailAddress: e.target.value }))} className="w-full h-12 bg-white border border-[#eee] rounded-2xl px-5 font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all" placeholder="나머지 주소" />
                  </div>

                  <label className="text-[14px] font-bold text-[#555]">휴대폰 <span className="text-[#3ea76e]">*</span></label>
                  <div className="flex gap-2">
                    <select className="w-24 h-12 bg-white border border-[#eee] rounded-2xl px-3 font-bold text-[14px] outline-none cursor-pointer">
                      <option>010</option>
                    </select>
                    <input type="text" className="flex-1 h-12 border border-[#eee] rounded-2xl text-center font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all" placeholder="0000" />
                    <input type="text" className="flex-1 h-12 border border-[#eee] rounded-2xl text-center font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all" placeholder="0000" />
                  </div>

                  <label className="text-[14px] font-bold text-[#555]">배송메시지</label>
                  <div className="relative">
                    <select className="w-full h-12 bg-white border border-[#eee] rounded-2xl px-5 font-bold text-[14px] outline-none appearance-none cursor-pointer focus:border-[#3ea76e] transition-all">
                      <option>-- 메시지 선택 (선택사항) --</option>
                      <option>배송 전에 미리 연락바랍니다.</option>
                      <option>부재 시 경비실에 맡겨주세요.</option>
                      <option>부재 시 문 앞에 놓아주세요.</option>
                      <option>빠른 배송 부탁드립니다.</option>
                      <option>택배함에 보관해 주세요.</option>
                      <option>직접 입력</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#bbb] pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 주문상품 — 실제 선택된 장바구니 데이터 */}
          <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
            <h2 className="text-[18px] font-black text-center text-[#111] tracking-tight mb-6">주문상품</h2>
            {checkedItems.length === 0
              ? <p className="text-center text-[#bbb] font-bold py-8">선택된 상품이 없습니다.</p>
              : checkedItems.map(item => <OrderItemRow key={itemKey(item)} item={item} />)
            }
            <div className="mt-5 flex justify-between items-center pt-4 border-t border-[#f5f5f5]">
              <span className="text-[14px] font-bold text-[#bbb]">배송비</span>
              <span className="text-[14px] font-black text-[#3ea76e]">
                {shippingFee === 0 ? '0원 (무료배송)' : `${shippingFee.toLocaleString()}원`}
              </span>
            </div>
          </section>

          {/* 할인/부가결제 */}
          <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
            <h2 className="text-[18px] font-black text-center text-[#111] tracking-tight mb-8">할인/부가결제</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#555] ml-1">할인코드</label>
                <div className="flex gap-3">
                  <input type="text" className="flex-1 h-12 bg-white border border-[#eee] rounded-2xl px-5 font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all" placeholder="코드를 입력하세요" />
                  <button className="h-12 px-6 rounded-2xl bg-white border border-[#eee] text-[#111] font-bold text-[13px] hover:bg-[#3ea76e] hover:text-white hover:border-[#3ea76e] transition-all cursor-pointer">코드 적용</button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#555]">쿠폰 할인</label>
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-[#f9f9f9] border border-[#eee] rounded-2xl px-5 flex items-center justify-end">
                    <span className="font-black text-[16px] text-[#111]">0원</span>
                  </div>
                  <button className="h-12 px-6 rounded-2xl bg-white border border-[#eee] text-[#111] font-bold text-[13px] hover:bg-[#3ea76e] hover:text-white hover:border-[#3ea76e] transition-all cursor-pointer">쿠폰 적용</button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[13px] font-bold text-[#555]">적립금 사용</label>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-white border border-[#eee] rounded-2xl px-5 flex items-center justify-end">
                    <input type="text" className="w-full text-right bg-transparent border-none outline-none font-black text-[16px] text-[#111]" placeholder="0" />
                  </div>
                  <button className="h-12 px-6 rounded-2xl bg-white border border-[#eee] text-[#111] font-bold text-[13px] hover:bg-[#3ea76e] hover:text-white hover:border-[#3ea76e] transition-all cursor-pointer">전액 사용</button>
                </div>
              </div>
            </div>
          </section>

          {/* 결제수단 — TossPayments 위젯 */}
          <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
            <h2 className="text-[18px] font-black text-center text-[#111] tracking-tight mb-6">결제수단</h2>
            {!isWidgetReady && (
              <div className="flex items-center justify-center py-12">
                <Spinner />
              </div>
            )}
            <div id="payment-method" />
          </section>

          {/* 이용약관 — TossPayments 위젯 */}
          <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
            <div id="agreement" />
          </section>

        </div>

        {/* ── 오른쪽 결제 요약 ──────────────────────────────────────────── */}
        <div className="lg:block">
          <div className="sticky top-24 space-y-6">

            <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
              <h2 className="text-[16px] font-black text-center mb-6 pb-5 border-b border-[#f5f5f5] tracking-tight">주문 예상 금액</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-[14px] font-bold text-[#aaa]">
                  <span>총 상품금액</span>
                  <span className="text-[#111]">{totalProductPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-[#aaa]">
                  <span>배송비</span>
                  <span className="text-[#111]">{shippingFee === 0 ? '+0원' : `+${shippingFee.toLocaleString()}원`}</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-[#aaa]">
                  <span>할인/부가결제</span>
                  <span className="text-[#3ea76e]">-0원</span>
                </div>
                <div className="pt-5 border-t border-dashed border-[#eee] flex justify-between items-end">
                  <span className="font-black text-[15px] text-[#111]">최종 결제 금액</span>
                  <span className="text-[28px] font-black leading-none text-[#111] tracking-tighter">
                    {finalPayment.toLocaleString()}원
                  </span>
                </div>
              </div>
            </section>

            <button
              onClick={handlePayment}
              disabled={!isWidgetReady || isPaying || checkedItems.length === 0}
              className="w-full h-16 rounded-full bg-[#3ea76e] text-white font-black text-[17px] border-none cursor-pointer transition-all hover:bg-[#318a57] active:scale-[0.97] disabled:bg-[#eee] disabled:text-[#ccc] disabled:cursor-not-allowed tracking-tight"
            >
              {isPaying ? '처리 중...' : `${finalPayment.toLocaleString()}원 결제하기`}
            </button>

          </div>
        </div>

      </main>
    </div>
  )
}
