import { Link } from 'react-router-dom'

export default function BrandStory() {
  return (
    <Link to="/brand-story" className="block bg-white mb-4 group w-full">
      <div className="relative w-full aspect-[4/3] lg:aspect-[5/2] rounded-[28px] overflow-hidden mb-8 bg-gradient-to-br from-[#1a3d2b] via-[#256641] to-[#3ea76e]">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* 텍스트 */}
        <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end">
          <p className="text-[#a8e6c4] text-[13px] font-semibold tracking-[0.2em] uppercase mb-3 opacity-90">
            Our Story
          </p>
          <h2 className="text-white text-[40px] md:text-[60px] font-black italic leading-[1.05] tracking-tighter opacity-95">
            BRAND<br />STORY
          </h2>
          <p className="text-white/70 text-[14px] font-medium mt-4 tracking-tight leading-relaxed max-w-[360px]">
            한결같이 나를 바라봐주는 존재에게<br />
            내가 줄 수 있는 최고의 것을
          </p>
        </div>

        {/* hover 오버레이 */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
      </div>

      <div className="px-1">
        <h3 className="text-[20px] font-black text-[#111111] tracking-tighter mb-2">
          반려동물과의 행복한 교감, SWIFFY
        </h3>
        <p className="text-[14px] text-[#888888] leading-relaxed tracking-tight mb-6">
          한결같이 나를 바라봐주는 존재에게<br />
          내가 줄 수 있는 최고의 것을 주고 싶다는 마음으로
        </p>
        <div className="w-full py-3.5 border border-[#e0e0e0] rounded-[14px] text-center text-[14px] font-semibold text-[#555555] tracking-tight group-hover:border-[#3ea76e] group-hover:text-[#3ea76e] transition-colors duration-300">
          브랜드 스토리 보기
        </div>
      </div>
    </Link>
  )
}
