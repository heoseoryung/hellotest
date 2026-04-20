export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    let start = Math.max(1, page - 2)
    let end = Math.min(totalPages, start + 4)
    start = Math.max(1, end - 4)
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const btnBase = 'w-9 h-9 rounded-full text-[14px] font-bold transition-all cursor-pointer border flex items-center justify-center'
  const activeBtn = 'bg-[#3ea76e] text-white border-[#3ea76e]'
  const inactiveBtn = 'bg-white border-[#eee] text-[#aaa] hover:border-[#3ea76e] hover:text-[#3ea76e]'
  const arrowBtn = `${btnBase} ${inactiveBtn} disabled:opacity-30 disabled:cursor-not-allowed`

  return (
    <div className="flex items-center justify-center gap-1 pt-10">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={arrowBtn}>〈</button>
      {getPages().map(n => (
        <button key={n} onClick={() => onChange(n)} className={`${btnBase} ${n === page ? activeBtn : inactiveBtn}`}>
          {n}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className={arrowBtn}>〉</button>
    </div>
  )
}
