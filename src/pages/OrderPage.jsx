import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetOrdersQuery } from '../api/orderApi'
import Pagination from '../shared/components/Pagination'
import Spinner from '../shared/components/Spinner'

const STATUS_OPTIONS = ['전체 주문처리상태', '입금전', '배송준비중', '배송중', '배송완료', '취소', '교환', '반품']
const PERIOD_OPTIONS = ['오늘', '1개월', '3개월', '6개월', '기간설정']
const PAGE_SIZE = 3

const STATUS_API_MAP = {
  '입금전': 'PENDING',
  '배송준비중': 'PREPARING',
  '배송중': 'SHIPPING',
  '배송완료': 'DELIVERED',
  '취소': 'CANCELLED',
  '교환': 'EXCHANGED',
  '반품': 'REFUNDED',
}

const PERIOD_API_MAP = {
  '오늘': '1d',
  '1개월': '1m',
  '3개월': '3m',
  '6개월': '6m',
}

export default function OrderPage() {
  const navigate = useNavigate()
  const [activeMainTab, setActiveMainTab] = useState('주문내역')
  const [status, setStatus] = useState('전체 주문처리상태')
  const [period, setPeriod] = useState('3개월')
  const [page, setPage] = useState(1)

  const apiStatus = status === '전체 주문처리상태' ? undefined : STATUS_API_MAP[status]
  const apiPeriod = PERIOD_API_MAP[period]

  const { data, isLoading } = useGetOrdersQuery({
    status: apiStatus,
    period: apiPeriod,
    page,
    size: PAGE_SIZE,
  })

  const orders = data?.content ?? []
  const totalPages = data?.totalPages ?? 1
  const totalElements = data?.totalElements ?? 0

  useEffect(() => {
    if (page > Math.max(totalPages, 1)) {
      setPage(Math.max(totalPages, 1))
    }
  }, [page, totalPages])

  const handleFilterChange = (setter, val) => { setter(val); setPage(1) }

  const handleWriteReview = (order, item) => {
    navigate('/review/write', {
      state: {
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        productImage: item.img,
      },
    })
  }

  return (
    <div className="w-full bg-[#FCFBF9] min-h-screen pb-28 px-4">

      <div className="max-w-[1200px] mx-auto text-center py-24">
        <h1 className="text-[36px] font-black tracking-[-0.05em] text-[#111]">주문조회</h1>
      </div>

      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-center gap-16 md:gap-24 mb-16 border-b border-[#eee]">
          {[
            { key: '주문내역', label: `주문내역 조회 (${totalElements}건)` },
            { key: '취소교환반품', label: '취소/교환/반품 내역' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveMainTab(tab.key)}
              className={`pb-6 text-[16px] font-black border-none bg-transparent cursor-pointer transition-all tracking-tight relative ${
                activeMainTab === tab.key ? 'text-[#3ea76e]' : 'text-[#bbb] hover:text-[#999]'
              }`}
            >
              {tab.label}
              {activeMainTab === tab.key && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#3ea76e] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="bg-white border border-[#eee] p-10 md:p-14 mb-16 rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-8">
            <span className="text-[15px] font-extrabold text-[#111] w-20 shrink-0">주문상태</span>
            <select
              value={status}
              onChange={e => handleFilterChange(setStatus, e.target.value)}
              className="w-full max-w-[450px] h-14 border border-[#eee] bg-[#f9f9f9] px-6 outline-none text-[#333] rounded-full text-[15px] focus:border-[#3ea76e] focus:bg-white transition-all font-bold cursor-pointer"
            >
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-10">
            <span className="text-[15px] font-extrabold text-[#111] w-20 shrink-0">조회기간</span>
            <div className="flex w-full max-w-[650px] gap-3">
              {PERIOD_OPTIONS.map(p => (
                <button
                  key={p}
                  onClick={() => handleFilterChange(setPeriod, p)}
                  className={`flex-1 h-12 text-[14px] font-bold cursor-pointer transition-all tracking-tight rounded-full border ${
                    period === p
                      ? 'bg-[#3ea76e] text-white border-[#3ea76e] shadow-md shadow-green-100'
                      : 'bg-white text-[#aaa] border-[#eee] hover:border-[#3ea76e] hover:text-[#3ea76e]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-[#f5f5f5] flex items-center gap-3 text-[14px] text-[#aaa] font-bold">
            <div className="w-5 h-5 rounded-full bg-[#f0faf4] text-[#3ea76e] flex items-center justify-center text-[12px] shrink-0 font-black">!</div>
            <span>취소/교환/반품 신청은 배송완료일 기준 3일까지만 가능합니다.</span>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="space-y-10">
            {orders.length === 0 && (
              <div className="text-center py-24 text-[#bbb] font-bold text-[16px]">해당 조건의 주문 내역이 없습니다.</div>
            )}
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-[#eee] rounded-[40px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.04)] transition-all">
                <div className="flex items-center justify-between px-10 py-8 bg-[#fcfcfc] border-b border-[#f5f5f5]">
                  <div className="flex items-center gap-8">
                    <span className="text-[20px] font-black text-[#111] tracking-tighter">{order.date}</span>
                    <span className="text-[13px] font-bold text-[#ccc] tracking-widest">{order.id}</span>
                  </div>
                  <Link to={`/order/detail/${order.id}`} className="text-[14px] font-bold text-[#aaa] hover:text-[#3ea76e] transition-colors">상세보기 &gt;</Link>
                </div>

                <div className="divide-y divide-[#f9f9f9]">
                  {order.items.map((item, i) => (
                    <div key={i} className="p-10 md:p-14">
                      <div className="flex gap-10 items-center">
                        <div className="w-32 h-32 bg-[#f8f8f8] rounded-[24px] overflow-hidden shrink-0 border border-[#eee]">
                          <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-5">
                            <div>
                              <p className="text-[18px] font-black text-[#111] mb-1.5 tracking-tight">{item.name}</p>
                              <p className="text-[14px] font-bold text-[#bbb]">[옵션: {item.option}]</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[20px] font-black text-[#111] tracking-tighter">
                                {typeof item.price === 'number' ? item.price.toLocaleString() : item.price}원
                              </p>
                              <p className="text-[14px] font-bold text-[#ccc] mt-1">{item.qty}개</p>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-[#f5f5f5] flex items-center justify-between">
                            <span className="text-[16px] font-black text-[#3ea76e]">{order.status}</span>
                            <div className="flex gap-3">
                              <button className="h-11 px-8 text-[13px] font-bold bg-[#f5f5f5] text-[#555] border-none transition-all active:scale-[0.95] hover:bg-[#ebebeb] cursor-pointer rounded-full">
                                배송조회
                              </button>
                              {order.status === '배송완료' && (
                                <button
                                  onClick={() => handleWriteReview(order, item)}
                                  className="h-11 px-8 text-[13px] font-bold bg-[#3ea76e] text-white border-none transition-all active:scale-[0.95] hover:bg-[#318a57] cursor-pointer rounded-full"
                                >
                                  구매후기
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-10 md:px-14 py-8 bg-[#fcfcfc] border-t border-[#f5f5f5] flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-[13px] font-bold text-[#bbb] tracking-tight">
                    상품금액 {order.productPrice?.toLocaleString()} + 배송비 {order.shippingPrice?.toLocaleString()} - 할인 {order.discountPrice?.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-5">
                    <span className="text-[15px] font-bold text-[#888]">최종 결제금액</span>
                    <span className="text-[28px] font-black text-[#111] tracking-tighter">{order.total?.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo(0, 0) }} />
      </div>
    </div>
  )
}
