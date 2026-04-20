import { Link } from 'react-router-dom'
import { ChevronRight, Headphones, MessageSquare, Info } from 'lucide-react'

const CSPage = () => {
  return (
    <div className="w-full bg-[#FCFBF9] text-[#111] pb-28 px-4 min-h-screen">
      <div className="max-w-[1200px] mx-auto text-center py-24">
        <h1 className="text-[36px] font-black tracking-[-0.05em] text-[#111]">고객센터</h1>
      </div>

      <div className="max-w-[860px] mx-auto">
        <div className="bg-white rounded-[40px] border border-[#eee] p-10 md:p-14 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] transition-all mb-8">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-8 justify-center md:justify-start">
              <Headphones size={18} className="text-[#3ea76e]" strokeWidth={2.5} />
              <h2 className="text-[#3ea76e] text-[13px] font-black uppercase tracking-widest">고객센터</h2>
            </div>

            <div className="text-[40px] md:text-[52px] font-black mb-8 tracking-[-0.06em] leading-none text-center md:text-left text-[#111]">
              032-212-2202
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-center md:justify-start text-[#888] text-[15px] font-bold tracking-tight">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#3ea76e] rounded-full"></span>
                평일 10:00 — 18:00
              </span>
              <span className="hidden md:block text-[#eee]">|</span>
              <span className="text-[#bbb]">점심 13:00 — 14:00</span>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-[20px] font-black text-[#111] tracking-tight shrink-0">커뮤니티</h2>
            <div className="h-[1px] w-full bg-[#eee]"></div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { title: 'NOTICE', link: '/notice', icon: <Info size={20} className="text-[#ccc] group-hover:text-[#3ea76e] transition-colors" />, desc: '스위피의 새로운 소식을 확인하세요.' },
              { title: 'FAQ', link: '/faq', icon: <MessageSquare size={20} className="text-[#ccc] group-hover:text-[#3ea76e] transition-colors" />, desc: '자주 묻는 질문들을 모아두었습니다.' },
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="flex items-center justify-between p-8 bg-white border border-[#eee] rounded-[32px] hover:border-[#3ea76e] hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4">
                    <span className="p-2.5 bg-[#f9f9f9] rounded-2xl group-hover:bg-[#f0faf4] transition-colors">
                      {item.icon}
                    </span>
                    <span className="text-[18px] font-black tracking-tight group-hover:text-[#3ea76e] transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-[#bbb] group-hover:text-[#888] transition-colors tracking-tight pl-[52px]">
                    {item.desc}
                  </p>
                </div>

                <div className="w-12 h-12 rounded-full bg-[#f9f9f9] flex items-center justify-center group-hover:bg-[#3ea76e] group-hover:text-white transition-all border border-[#eee] shrink-0">
                  <ChevronRight size={20} strokeWidth={2.5} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSPage