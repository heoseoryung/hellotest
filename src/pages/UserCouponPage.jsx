import React, { useEffect, useState } from "react";
import { ChevronDown, Info, Ticket, Plus } from "lucide-react";
import Pagination from '../shared/components/Pagination'

const PAGE_SIZE = 5

export default function UserCouponPage() {
  const [couponCode, setCouponCode] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 

  const coupons = [
    { id: 1, title: "2026 리틀버디 할인 쿠폰", discount: "5%", reward: "0원", expiry: "2026.12.31" },
    { id: 2, title: "첫 구매 감사 쿠폰", discount: "3,000원", reward: "0원", expiry: "2026.06.30" },
  ];

  const totalPages = Math.ceil(coupons.length / PAGE_SIZE);
  const pagedCoupons = coupons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1))
    }
  }, [currentPage, totalPages])

  return (
    <div className="bg-[#FCFBF9] min-h-screen text-[#111] pb-28 font-sans">
      <main className="max-w-[1000px] mx-auto px-6">
        
        <div className="py-24 text-center">
          <h1 className="text-[36px] font-black tracking-[-0.05em] text-[#111]">마이쿠폰</h1>
        </div>

      
        <section className="bg-white rounded-[32px] p-10 mb-12 border border-[#eee] shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#f0faf4] p-2.5 rounded-xl">
              <Ticket size={18} className="text-[#3ea76e]" />
            </div>
            <h3 className="text-[17px] font-black tracking-tight">쿠폰 인증번호 등록하기</h3>
          </div>
          
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="쿠폰번호를 입력해 주세요"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 h-[56px] bg-[#f8f8f8] border border-[#f0f0f0] rounded-2xl px-6 outline-none focus:ring-2 focus:ring-[#3ea76e]/20 transition-all text-[14px] font-bold"
            />
           
            <button className="h-[56px] px-10 bg-[#3ea76e] text-white rounded-2xl text-[14px] font-black hover:bg-[#318a57] transition-all flex items-center gap-2 cursor-pointer border-none shrink-0 shadow-lg shadow-green-50">
              <Plus size={16} /> 쿠폰번호 인증
            </button>
          </div>
          
          <div className="flex items-start gap-2.5 text-[#aaa] pl-2">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p className="text-[12px] font-bold leading-relaxed">
              10-35자 일련번호 "-" 제외, 쇼핑몰에서 발행한 쿠폰번호만 입력해 주세요.
            </p>
          </div>
        </section>

   
        <div className="flex items-end justify-between mb-6 px-4">
          <h3 className="text-[18px] font-black text-[#111]">
            보유 쿠폰 <span className="text-[#3ea76e] ml-1">{coupons.length}</span>
          </h3>
        </div>

        <div className="bg-white rounded-[32px] border border-[#eee] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
          <div className="flex bg-[#fbfbfb]/50 border-b border-[#eee] py-5 text-[12px] font-black text-center text-[#999] uppercase tracking-wider">
            <div className="flex-[2.5] text-left px-10">쿠폰 정보</div>
            <div className="flex-1">할인 혜택</div>
            <div className="flex-1">적립 혜택</div>
            <div className="flex-1">상세</div>
          </div>

          {pagedCoupons.map((coupon) => (
            <div key={coupon.id} className="flex border-b border-[#f8f8f8] last:border-none py-8 text-[14px] text-center items-center hover:bg-[#fafafa] transition-colors group">
              <div className="flex-[2.5] text-left px-10">
                <p className="text-[15px] font-black text-[#111] mb-1.5 group-hover:text-[#3ea76e] transition-colors tracking-tight">{coupon.title}</p>
                <p className="text-[11px] font-bold text-[#bbb]">유효기간: ~ {coupon.expiry}</p>
              </div>
              <div className="flex-1 font-black text-[#3ea76e] text-[16px] tracking-tight">{coupon.discount}</div>
              <div className="flex-1 text-[#bbb] font-bold">{coupon.reward}</div>
              <div className="flex-1 flex justify-center">
                <button className="p-2 hover:bg-[#f0faf4] rounded-full transition-all border-none bg-transparent cursor-pointer text-[#ddd] hover:text-[#3ea76e]">
                  <ChevronDown size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      </main>
    </div>
  );
}
