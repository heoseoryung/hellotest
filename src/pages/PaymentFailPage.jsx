import { useSearchParams, useNavigate } from 'react-router-dom'

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const code    = searchParams.get('code') ?? ''
  const message = searchParams.get('message') ?? '결제에 실패했습니다.'
  const orderId = searchParams.get('orderId') ?? ''

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF9] gap-6 px-4">
      <div className="text-[64px]">😿</div>
      <h1 className="text-[28px] font-black text-[#111] tracking-tight">결제 실패</h1>
      <p className="text-[15px] font-bold text-[#888] text-center max-w-sm">{message}</p>

      {code && (
        <div className="bg-white rounded-[24px] border border-[#eee] px-8 py-6 w-full max-w-sm space-y-3">
          <div className="flex justify-between text-[14px]">
            <span className="font-bold text-[#aaa]">오류 코드</span>
            <span className="font-black text-red-400">{code}</span>
          </div>
          {orderId && (
            <div className="flex justify-between text-[14px]">
              <span className="font-bold text-[#aaa]">주문번호</span>
              <span className="font-black text-[#111] text-right break-all text-[12px] max-w-[200px]">{orderId}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/checkout')}
          className="btn-primary px-8 py-4 text-[15px]"
        >
          다시 시도하기
        </button>
        <button
          onClick={() => navigate('/cart')}
          className="btn-ghost px-8 py-4 text-[15px]"
        >
          장바구니로
        </button>
      </div>
    </div>
  )
}
