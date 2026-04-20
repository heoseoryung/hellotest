import { useEffect } from 'react'

export default function Toast({ message, onClose, onNavigate, navText = '바로가기', isError = false }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in slide-in-from-bottom-4">
      <div className={`flex items-center px-6 py-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)] min-w-[320px] ${isError ? 'bg-red-500 text-white' : 'bg-[#111] text-white'}`}>

        {onNavigate && <div className="w-[60px] shrink-0" />}

        <span className="text-[14px] font-bold flex-1 text-center whitespace-nowrap px-4">
          {message}
        </span>

        {onNavigate ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate();
            }}
            className="toast-nav-btn"
          >
            {navText}
          </button>
        ) : (
          <div className="w-[60px] shrink-0" />
        )}
      </div>
    </div>
  )
}
