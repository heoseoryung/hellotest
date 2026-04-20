import { useState } from 'react'
import { ChevronLeft, ChevronUp, Check, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AddressSearch from '@/features/user/AddressSearch'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const availableCoupons = [
    { id: 1, title: '2026 리틀버디 할인 쿠폰' },
    { id: 2, title: '첫 구매 감사 쿠폰' },
  ]
  const [addrTab, setAddrTab] = useState('direct')
  const [payType, setPayType] = useState('recent')
  const [paymentMethod, setPaymentMethod] = useState('bank')
  const [isAddrOpen, setIsAddrOpen] = useState(true)
  const [isAgreed, setIsAgreed] = useState(false)
  const [shippingAddr, setShippingAddr] = useState({ postcode: '', baseAddress: '', extraAddress: '', addressType: '', detailAddress: '' })

  const paymentOptions = [
    { id: 'bank', label: '계좌이체' },
    { id: 'card', label: '카드결제' },
    { id: 'npay', label: 'N Pay' },
    { id: 'kpay', label: 'kakao pay' },
    { id: 'toss', label: 'toss' },
    { id: 'cash', label: '무통장입금' },
  ]

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
                  <button
                    onClick={() => setAddrTab('direct')}
                    className={`pb-4 text-[14px] font-black transition-all cursor-pointer border-none bg-transparent relative ${addrTab === 'direct' ? 'text-[#3ea76e]' : 'text-[#bbb]'}`}
                  >
                    직접입력
                    {addrTab === 'direct' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#3ea76e]" />}
                  </button>
                  <button
                    onClick={() => setAddrTab('recent')}
                    className={`pb-4 text-[14px] font-black transition-all cursor-pointer border-none bg-transparent relative ${addrTab === 'recent' ? 'text-[#3ea76e]' : 'text-[#bbb]'}`}
                  >
                    최근 배송지
                    {addrTab === 'recent' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#3ea76e]" />}
                  </button>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center gap-y-5">
                  <label className="text-[14px] font-bold text-[#555]">받는사람 <span className="text-[#3ea76e]">*</span></label>
                  <input
                    type="text"
                    className="h-12 bg-white border border-[#eee] rounded-2xl px-5 font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all"
                    defaultValue="최현우"
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
                    <input type="text" defaultValue="6482" className="flex-1 h-12 border border-[#eee] rounded-2xl text-center font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all" />
                    <input type="text" defaultValue="2555" className="flex-1 h-12 border border-[#eee] rounded-2xl text-center font-bold text-[14px] outline-none focus:border-[#3ea76e] transition-all" />
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

          {/* 주문상품 */}
          <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
            <h2 className="text-[18px] font-black text-center text-[#111] tracking-tight mb-8">주문상품</h2>
            <div className="flex gap-6 items-center pb-6 border-b border-[#f5f5f5]">
              <div className="w-24 h-24 bg-[#f8f8f8] rounded-[20px] overflow-hidden border border-[#eee] shrink-0">
                <img src="https://swiffy.cafe24.com/web/product/medium/202412/c574e33c42600c960242e5ec86ab1d7a.png" alt="product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-[16px] tracking-tight text-[#111]">어글어글 우유껌 50g 7종</h3>
                <p className="text-[13px] font-bold text-[#bbb] mt-1">[옵션: 제주 베리클리 우유껌]</p>
                <div className="flex justify-between items-end mt-4">
                  <p className="text-[13px] font-bold text-[#bbb]">수량 2개</p>
                  <p className="font-black text-[20px] text-[#111] tracking-tighter">22,000원</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-between items-center">
              <span className="text-[14px] font-bold text-[#bbb]">배송비</span>
              <span className="text-[14px] font-black text-[#3ea76e]">0원 (무료배송)</span>
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
                <div className="flex justify-between items-center px-1">
                  <label className="text-[13px] font-bold text-[#555]">쿠폰 할인</label>
                  <span className="text-[13px] font-bold text-[#3ea76e]">보유쿠폰 {availableCoupons.length}개</span>
                </div>
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
                  <span className="text-[13px] font-bold text-[#bbb]">보유 3,000원</span>
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
        </div>

        {/* 오른쪽 결제 요약 */}
        <div className="lg:block">
          <div className="sticky top-24 space-y-6">

            <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
              <h2 className="text-[16px] font-black text-center mb-6 pb-5 border-b border-[#f5f5f5] tracking-tight">주문 예상 금액</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-[14px] font-bold text-[#aaa]">
                  <span>총 상품금액</span>
                  <span className="text-[#111]">22,000원</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-[#aaa]">
                  <span>배송비</span>
                  <span className="text-[#111]">+0원</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-[#aaa]">
                  <span>할인/부가결제</span>
                  <span className="text-[#3ea76e]">-0원</span>
                </div>
                <div className="pt-5 border-t border-dashed border-[#eee] flex justify-between items-end">
                  <span className="font-black text-[15px] text-[#111]">최종 결제 금액</span>
                  <span className="text-[28px] font-black leading-none text-[#111] tracking-tighter">22,000원</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[32px] p-8 border border-[#eee]">
              <h2 className="text-[16px] font-black text-center mb-6 tracking-tight">결제수단</h2>

              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 cursor-pointer" onClick={() => setPayType('recent')}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payType === 'recent' ? 'border-[#3ea76e] bg-[#3ea76e]' : 'border-[#ddd]'}`}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className={`text-[14px] font-bold ${payType === 'recent' ? 'text-[#111]' : 'text-[#bbb]'}`}>최근 결제수단</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer" onClick={() => setPayType('other')}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payType === 'other' ? 'border-[#3ea76e] bg-[#3ea76e]' : 'border-[#ddd]'}`}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className={`text-[14px] font-bold ${payType === 'other' ? 'text-[#111]' : 'text-[#bbb]'}`}>다른 결제수단 선택</span>
                </label>
              </div>

              <div className={`grid grid-cols-2 gap-2 mb-6 transition-opacity ${payType === 'other' ? 'opacity-100' : 'opacity-40'}`}>
                {paymentOptions.map((o) => (
                  <button
                    key={o.id}
                    disabled={payType === 'recent'}
                    onClick={() => { setPaymentMethod(o.id); setPayType('other') }}
                    className={`h-12 rounded-2xl text-[13px] font-bold border-2 transition-all cursor-pointer ${
                      paymentMethod === o.id && payType === 'other'
                        ? 'border-[#3ea76e] text-[#3ea76e] bg-[#f0faf4]'
                        : 'border-[#f5f5f5] text-[#bbb] bg-white'
                    }`}
                  >{o.label}</button>
                ))}
              </div>

              <div className="mb-6 pt-6 border-t border-[#f5f5f5]">
                <label className="flex items-start gap-3 cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
                  <div className={`mt-0.5 min-w-[22px] h-[22px] rounded-lg border-2 flex items-center justify-center transition-all ${isAgreed ? 'bg-[#3ea76e] border-[#3ea76e]' : 'border-[#ddd]'}`}>
                    {isAgreed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-[#111] mb-1">모든 이용약관에 동의합니다.</p>
                    <p className="text-[12px] font-bold text-[#bbb] leading-snug underline underline-offset-4 decoration-[#ddd]">
                      전자금융거래 기본약관, 결제대행 서비스 이용약관 및 개인정보 제3자 제공 동의 (필수)
                    </p>
                  </div>
                </label>
              </div>

              <button
                disabled={!isAgreed}
                className="w-full h-16 rounded-full bg-[#3ea76e] text-white font-black text-[17px] border-none cursor-pointer transition-all hover:bg-[#318a57] active:scale-[0.97] disabled:bg-[#eee] disabled:text-[#ccc] disabled:cursor-not-allowed tracking-tight"
              >
                22,000원 결제하기
              </button>
            </section>

          </div>
        </div>

      </main>
    </div>
  )
}
