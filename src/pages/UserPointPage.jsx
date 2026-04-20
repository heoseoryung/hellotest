import React from "react";
import { Wallet, ChevronRight, History, Info } from "lucide-react";

export default function UserPointPage() {
  const pointSummary = [
    { label: "총 적립금", value: "3,080원", highlight: false },
    { label: "사용가능 적립금", value: "3,080원", highlight: true },
    { label: "사용된 적립금", value: "0원", highlight: false },
    { label: "환불예정 적립금", value: "0원", highlight: false },
  ];

  const menuLinks = [
    { title: "적립내역", icon: <History size={18} /> },
  ];

  return (
    
    <div className="bg-[#FCFBF9] min-h-screen text-[#111] font-sans pb-28">
      <main className="max-w-[800px] mx-auto px-6">
        
       
        <div className="py-24 text-center">
          <h1 className="text-[36px] font-black tracking-[-0.05em] text-[#111]">적립금</h1>
        </div>

    
        <section className="bg-white rounded-[32px] border border-[#eee] shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden mb-10">
          <div className="bg-[#fbfbfb]/80 px-10 py-6 border-b border-[#eee] flex items-center gap-3">
            <div className="bg-[#f0faf4] p-2 rounded-xl text-[#3ea76e]">
              <Wallet size={20} />
            </div>
            <h3 className="text-[16px] font-black tracking-tight">마이 적립금 현황</h3>
          </div>

          <div className="p-10 space-y-5">
            {pointSummary.map((item, index) => (
              <div key={index} className="flex justify-between items-center group">
                <span className="text-[15px] font-bold text-neutral-500 group-hover:text-[#111] transition-colors">
                  {item.label}
                </span>
                <span className={`text-[18px] font-black tracking-tight ${item.highlight ? 'text-[#3ea76e]' : 'text-[#111]'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          
          <div className="bg-[#f9f9f9] px-10 py-4 flex items-start gap-2 text-neutral-400">
            <Info size={14} className="mt-0.5" />
            <p className="text-[12px] font-bold">적립금은 구매 확정 시점에 지급되며, 유효기간 이후 자동 소멸됩니다.</p>
          </div>
        </section>

      
        <div className="bg-white rounded-[32px] border border-[#eee] shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
          {menuLinks.map((menu, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between px-10 py-7 border-b border-[#f8f8f8] last:border-none hover:bg-[#fafafa] transition-all cursor-pointer bg-transparent group"
            >
              <div className="flex items-center gap-4">
                <div className="text-neutral-300 group-hover:text-[#3ea76e] transition-colors">
                  {menu.icon}
                </div>
                <span className="text-[16px] font-black text-[#111]">{menu.title}</span>
              </div>
              <ChevronRight size={20} className="text-neutral-300 group-hover:text-[#111] transition-all" />
            </button>
          ))}
        </div>

      </main>
    </div>
  );
}

