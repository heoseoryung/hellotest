import { useSearchParams, useNavigate } from 'react-router-dom'

// TODO: 백엔드 prepare/confirm 연결 후 아래 주석 처리된 confirm 로직 복원
// import { useEffect, useState } from 'react'
// import { useConfirmPaymentMutation } from '@/api/orderApi'
// import Spinner from '@/shared/components/Spinner'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const paymentKey = searchParams.get('paymentKey')
  const orderId    = searchParams.get('orderId')
  const amount     = Number(searchParams.get('amount'))

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF9] gap-6 px-4">
      <div className="text-[64px]">🐾</div>
      <h1 className="text-[28px] font-black text-[#111] tracking-tight">결제 완료!</h1>
      <p className="text-[15px] font-bold text-[#888]">주문이 성공적으로 접수되었어요.</p>

      <div className="bg-white rounded-[24px] border border-[#eee] px-8 py-6 w-full max-w-sm space-y-3">
        <div className="flex justify-between text-[14px]">
          <span className="font-bold text-[#aaa]">결제 금액</span>
          <span className="font-black text-[#111]">{amount.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="font-bold text-[#aaa]">주문번호</span>
          <span className="font-black text-[#111] text-right break-all text-[12px] max-w-[200px]">{orderId}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/order/list')}
          className="btn-primary px-8 py-4 text-[15px]"
        >
          주문 내역 보기
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn-ghost px-8 py-4 text-[15px]"
        >
          홈으로
        </button>
      </div>
    </div>
  )
}
